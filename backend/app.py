"""RSS metadata reader. No scraping, full texts, images or translations."""
import calendar
import json
import logging
import os
import time
from datetime import datetime, timezone
from urllib.parse import urlsplit, urlunsplit
from urllib.robotparser import RobotFileParser

import feedparser
import httpx
import psycopg
from fastapi import FastAPI
from psycopg.rows import dict_row

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("rss")
USER_AGENT = "ThailandJournalRSS/0.1"
SOURCES = [
    ("matichon", "Matichon", "https://www.matichon.co.th/feed", "th", "https://www.matichon.co.th/"),
    ("bangkok-post", "Bangkok Post", "https://www.bangkokpost.com/rss/data/thailand.xml", "en", "https://www.bangkokpost.com/rss"),
]
CATEGORIES = ["Aktuelle Nachrichten", "Politik", "Wirtschaft", "Tourismus", "Visa & Einwanderung", "Gesellschaft", "Sicherheit", "Wetter & Umwelt", "Kultur", "Regionen"]


def connect():
    return psycopg.connect(os.environ["DATABASE_URL"], row_factory=dict_row)


def initialize():
    with connect() as db:
        db.execute("SELECT pg_advisory_xact_lock(7130041)")
        db.execute("""CREATE TABLE IF NOT EXISTS sources (
            id text PRIMARY KEY, name text NOT NULL, feed_url text NOT NULL,
            language text NOT NULL, discovery_url text NOT NULL, active boolean NOT NULL DEFAULT true,
            last_success timestamptz, last_error text)""")
        db.execute("""CREATE TABLE IF NOT EXISTS articles (
            id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
            source_id text NOT NULL REFERENCES sources(id), external_id text NOT NULL,
            title text NOT NULL, original_url text NOT NULL UNIQUE, language text NOT NULL,
            published_at timestamptz, imported_at timestamptz NOT NULL DEFAULT now(),
            category text NOT NULL, status text NOT NULL DEFAULT 'published',
            original_description text, image_url text, german_title text, german_description text,
            UNIQUE(source_id, external_id))""")
        db.execute("CREATE INDEX IF NOT EXISTS articles_published_idx ON articles(published_at DESC)")
        db.execute("""CREATE TABLE IF NOT EXISTS import_runs (
            id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
            source_id text NOT NULL REFERENCES sources(id), started_at timestamptz NOT NULL DEFAULT now(),
            finished_at timestamptz, added integer NOT NULL DEFAULT 0,
            status text NOT NULL DEFAULT 'running', error text)""")
        for row in SOURCES:
            db.execute("""INSERT INTO sources(id,name,feed_url,language,discovery_url)
                VALUES (%s,%s,%s,%s,%s) ON CONFLICT(id) DO NOTHING""", row)


def canonical_url(raw, feed_url):
    """Only accept HTTPS article links to the provider; never fetch article pages."""
    u, provider = urlsplit(raw.strip()), urlsplit(feed_url)
    if u.scheme != "https" or u.hostname != provider.hostname or u.username or u.password or u.port not in (None, 443):
        return None
    return urlunsplit(("https", u.hostname, u.path, u.query, ""))


def categorize(entry, url):
    # Use source category labels and URL segments, not AI or invented translations.
    labels = " ".join(str(tag.get("term", "")) for tag in entry.get("tags", [])) + " " + urlsplit(url).path
    labels = labels.lower()
    rules = [
        ("Visa & Einwanderung", ["immigration", "visa", "วีซ่า"]),
        ("Politik", ["politic", "การเมือง"]),
        ("Wirtschaft", ["business", "econom", "เศรษฐกิจ"]),
        ("Tourismus", ["travel", "tourism", "ท่องเที่ยว"]),
        ("Wetter & Umwelt", ["environment", "weather", "สิ่งแวดล้อม"]),
        ("Sicherheit", ["crime", "อาชญากรรม"]),
        ("Kultur", ["culture", "วัฒนธรรม"]),
        ("Regionen", ["region", "ภูมิภาค"]),
        ("Gesellschaft", ["society", "สังคม"]),
    ]
    return next((category for category, words in rules if any(w in labels for w in words)), "Aktuelle Nachrichten")


def parse_entries(content, source):
    parsed = feedparser.parse(content)
    if not parsed.version or (parsed.bozo and not parsed.entries):
        raise ValueError("Antwort ist kein lesbarer RSS-/Atom-Feed")
    for entry in parsed.entries[:200]:
        title = entry.get("title", "").strip()
        url = canonical_url(entry.get("link", ""), source["feed_url"])
        if not title or not url:
            continue
        date = entry.get("published_parsed") or entry.get("updated_parsed")
        try:
            published = datetime.fromtimestamp(calendar.timegm(date), timezone.utc) if date else None
        except (ValueError, OverflowError):
            published = None
        yield (source["id"], str(entry.get("id") or url)[:2000], title[:2000], url,
               source["language"], published, categorize(entry, url))


def fetch_feed(source):
    with httpx.Client(timeout=25, headers={"User-Agent": USER_AGENT}, follow_redirects=False) as client:
        host = urlsplit(source["feed_url"]).netloc
        robots_url = f"https://{host}/robots.txt"
        robots = client.get(robots_url)
        if robots.status_code != 404:
            robots.raise_for_status()
            rules = RobotFileParser()
            rules.parse(robots.text.splitlines())
            if not rules.can_fetch(USER_AGENT, source["feed_url"]):
                raise ValueError("RSS-Abruf durch robots.txt ausgeschlossen")
        response = client.get(source["feed_url"])
        response.raise_for_status()
        if len(response.content) > 5_000_000:
            raise ValueError("Feed überschreitet Größenlimit")
        return response.content


def import_all(fetcher=fetch_feed):
    results = []
    # A PostgreSQL advisory lock serializes scheduler and manual CLI imports.
    with connect() as lock:
        if not lock.execute("SELECT pg_try_advisory_lock(7130042) AS locked").fetchone()["locked"]:
            return [{"status": "busy"}]
        try:
            sources = lock.execute("SELECT * FROM sources WHERE active ORDER BY id").fetchall()
            for source in sources:
                with connect() as db:
                    run_id = db.execute("INSERT INTO import_runs(source_id) VALUES(%s) RETURNING id", (source["id"],)).fetchone()["id"]
                try:
                    entries = list(parse_entries(fetcher(source), source))
                    added = 0
                    with connect() as db:
                        for row in entries:
                            added += db.execute("""INSERT INTO articles(source_id,external_id,title,original_url,language,published_at,category)
                                VALUES(%s,%s,%s,%s,%s,%s,%s) ON CONFLICT DO NOTHING""", row).rowcount
                        db.execute("UPDATE sources SET last_success=now(),last_error=NULL WHERE id=%s", (source["id"],))
                        db.execute("UPDATE import_runs SET finished_at=now(),added=%s,status='success' WHERE id=%s", (added, run_id))
                    results.append({"source": source["id"], "status": "success", "added": added})
                except Exception as exc:
                    # Log a concise reason, never connection strings or request headers.
                    error = f"{type(exc).__name__}: Abruf oder Verarbeitung fehlgeschlagen"
                    if isinstance(exc, httpx.HTTPStatusError):
                        error += f" (HTTP {exc.response.status_code})"
                    log.warning("%s: %s", source["id"], error)
                    with connect() as db:
                        db.execute("UPDATE sources SET last_error=%s WHERE id=%s", (error, source["id"]))
                        db.execute("UPDATE import_runs SET finished_at=now(),status='error',error=%s WHERE id=%s", (error, run_id))
                    results.append({"source": source["id"], "status": "error", "error": error})
        finally:
            lock.execute("SELECT pg_advisory_unlock(7130042)")
    return results


app = FastAPI(title="Thailand Journal RSS API")


@app.get("/health")
def health():
    with connect() as db:
        db.execute("SELECT 1")
    return {"status": "ok"}


@app.get("/articles")
def articles():
    with connect() as db:
        rows = db.execute("""SELECT a.id,a.title,a.original_url,a.language,a.published_at,a.imported_at,
            a.category,s.name AS source,s.id AS source_id FROM articles a JOIN sources s ON s.id=a.source_id
            WHERE a.status='published' ORDER BY a.published_at DESC NULLS LAST,a.imported_at DESC LIMIT 100""").fetchall()
        sources = db.execute("SELECT id,name,last_success,last_error FROM sources WHERE active ORDER BY name").fetchall()
    return {"articles": rows, "sources": sources}


if __name__ == "__main__":
    import sys
    initialize()
    if "--once" in sys.argv:
        result = import_all()
        print(json.dumps(result))
        sys.exit(1 if any(r["status"] == "error" for r in result) else 0)
    while True:
        try:
            log.info("Import: %s", json.dumps(import_all()))
        except Exception as exc:
            log.error("Importzyklus fehlgeschlagen: %s", type(exc).__name__)
        time.sleep(1800)

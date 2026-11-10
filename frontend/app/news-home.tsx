'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Article, Source } from './news-types';

const categories = ['Alle Themen', 'Aktuelle Nachrichten', 'Politik', 'Wirtschaft', 'Tourismus', 'Visa & Einwanderung', 'Gesellschaft', 'Sicherheit', 'Wetter & Umwelt', 'Kultur', 'Regionen'];
const dateFormat = new Intl.DateTimeFormat('de-DE', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Europe/Berlin' });
function date(value: string | null) { return value ? dateFormat.format(new Date(value)) : 'Datum nicht angegeben'; }

export default function NewsHome({ articles, sources, unavailable }: { articles: Article[]; sources: Source[]; unavailable: boolean }) {
  const [category, setCategory] = useState('Alle Themen');
  const [source, setSource] = useState('Alle Quellen');
  const [search, setSearch] = useState('');
  const router = useRouter();
  useEffect(() => {
    const timer = setInterval(() => router.refresh(), 60_000);
    return () => clearInterval(timer);
  }, [router]);
  const filtered = articles.filter(a => (category === 'Alle Themen' || a.category === category) && (source === 'Alle Quellen' || a.source_id === source) && `${a.title} ${a.source}`.toLowerCase().includes(search.toLowerCase()));
  return <>
    <div className="demo-bar"><span className="demo-dot"/> RSS-NACHRICHTEN <span className="demo-divider">/</span> Originalüberschriften · Direkt zur Quelle</div>
    <header className="header wrap">
      <a className="brand" href="/" aria-label="Thailand Journal Startseite"><span className="brand-icon">ท</span><span>THAILAND<span className="brand-bottom">JOURNAL<span className="brand-dot">.</span></span></span></a>
      <div className="header-note">Ein Land. Viele Perspektiven.<span>Nachrichten aus Thailand — im Original.</span></div>
      <a className="about-link" href="#quellen">Unsere Quellen <span>↗</span></a>
    </header>
    <nav className="nav" aria-label="Themen"><div className="wrap nav-inner">{categories.map(c => <button key={c} className={category === c ? 'active' : ''} onClick={() => setCategory(c)}>{c}</button>)}</div></nav>
    <main className="wrap">
      <section className="intro"><div><div className="eyebrow"><span/> DER BLICK NACH THAILAND</div><h1>Näher dran.<br/><em>Mehr verstehen.</em></h1><p>Originalmeldungen aus thailändischen Nachrichtenredaktionen.<br/>Übersichtlich gesammelt. Mit direktem Link zur Quelle.</p></div><div className="intro-side"><span className="edition">THAILAND JOURNAL <span>↗</span></span><p>Verschiedene Quellen.<br/>Eigene Perspektiven.</p><span className="small-label">THAI & ENGLISCH · OHNE ÜBERSETZUNG</span></div></section>
      <section className="news" aria-labelledby="news-title"><div className="section-heading"><h2 id="news-title">{category === 'Alle Themen' ? 'Neueste Nachrichten' : category}<span className="count">{filtered.length.toString().padStart(2, '0')}</span></h2><label className="search"><span aria-hidden="true">⌕</span><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Nachrichten durchsuchen …" aria-label="Nachrichten durchsuchen"/>{search && <button onClick={() => setSearch('')} aria-label="Suche löschen">×</button>}</label></div>
      <div className="source-filters" role="group" aria-label="Nachrichtenquelle"><button className={source === 'Alle Quellen' ? 'chosen' : ''} onClick={() => setSource('Alle Quellen')}>Alle Quellen</button>{sources.map(s => <button key={s.id} className={source === s.id ? 'chosen' : ''} onClick={() => setSource(s.id)}>{s.name} <span>{articles.filter(a => a.source_id === s.id).length}</span></button>)}</div>
      {unavailable && <div className="status-message" role="status">Die Nachrichten sind gerade nicht erreichbar. Bitte prüfe, ob API und Datenbank laufen. Die Seite versucht es automatisch erneut.</div>}
      {sources.some(s => s.last_error) && <div className="status-message" role="status">Mindestens eine Quelle konnte zuletzt nicht aktualisiert werden. Bereits gespeicherte Meldungen bleiben sichtbar. Details findest du unten im Quellenstatus.</div>}
      {filtered.length > 0 ? <div className="news-grid real-news">{filtered.map((article, i) => <article className={i === 0 ? 'card lead' : 'card'} key={article.id}><div className="card-body"><div className="meta"><span>{article.category}</span><span>{article.language === 'th' ? 'THAI' : 'ENGLISH'}</span></div><h3 lang={article.language}><a href={article.original_url} target="_blank" rel="noopener noreferrer">{article.title}</a></h3><p className="translation"><time dateTime={article.published_at || undefined}>{date(article.published_at)}</time>{article.published_at && ' · Berliner Zeit'}</p><div className="card-footer"><span><span className="source-dot"/>{article.source}</span><a href={article.original_url} target="_blank" rel="noopener noreferrer" aria-label={`Originalartikel bei ${article.source} öffnen: ${article.title}`}>Original lesen ↗</a></div></div></article>)}</div> : !unavailable && <div className="empty"><h3>{articles.length ? 'Keine passenden Nachrichten.' : 'Noch keine Nachrichten importiert.'}</h3><p>{articles.length ? 'Wähle eine andere Quelle, Kategorie oder einen anderen Suchbegriff.' : 'Der Import startet mit dem Hintergrunddienst. Es werden ausschließlich echte Feedmeldungen angezeigt.'}</p><button onClick={() => {setCategory('Alle Themen'); setSource('Alle Quellen'); setSearch('');}}>Auswahl zurücksetzen ↗</button></div>}
      </section>
      <section className="project" id="quellen"><span className="project-number">01 / UNSERE QUELLEN</span><div><h2>Thailand verstehen.<br/><em>Bei den Quellen anfangen.</em></h2><p>Wir zeigen Überschriften aus den offiziellen RSS-Feeds. Die vollständigen Beiträge liest du direkt bei der jeweiligen Redaktion. Die Inhalte bleiben in ihrer Originalsprache; wir übernehmen keine Artikeltexte oder Nachrichtenbilder.</p><div className="source-status">{sources.map(s => <div key={s.id}><strong>{s.name}</strong><p>Letzter erfolgreicher Abruf: {date(s.last_success)}{s.last_success && ' · Berliner Zeit'}</p>{s.last_error && <p className="source-error">{s.last_error}</p>}</div>)}</div><p className="project-status"><span/> Import alle 30 Minuten · Seitenaktualisierung jede Minute</p></div><span className="project-mark" aria-hidden="true">ท</span></section>
    </main>
    <footer className="wrap footer"><strong>THAILAND JOURNAL<span>.</span></strong><p>Überschriften und Artikel gehören den jeweiligen Quellen.<br/>Keine KI-Verarbeitung. Keine automatische Übersetzung.</p><a href="#">Zurück nach oben ↑</a></footer>
  </>;
}

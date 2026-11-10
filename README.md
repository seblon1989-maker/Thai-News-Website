# Thailand Journal

Lokaler RSS-Nachrichtenleser mit Next.js, FastAPI, PostgreSQL und einem unabhängigen Python-Worker. Echte Originalüberschriften von Matichon (Thai) und Bangkok Post (Englisch), keine Beispieldaten, KI oder automatische Übersetzungen. Keine Übernahme von Artikeltexten und Bildern.

## Auf dem Mac starten

Voraussetzung: Docker Engine mit Docker Compose, beispielsweise über Colima und Docker CLI. Die Images unterstützen Apple Silicon. Das Projekt zunächst von GitHub klonen oder den vorhandenen Checkout verwenden.

1. Im Terminal in den Projektordner wechseln.
2. `.env.example` als `.env` kopieren. Eine eigene zufällige Zeichenfolge aus mindestens 32 Buchstaben/Ziffern als `POSTGRES_PASSWORD` eintragen. Diese Datei bleibt lokal und wird nicht in Git gespeichert.
3. Container bauen und starten:

```sh
docker compose up -d --build
```

Auf dem eigenen Rechner im Browser `http://localhost:3000` öffnen. Der erste Import startet automatisch und kann etwa eine Minute benötigen. Internetzugang zu den Feedanbietern ist nötig. Nur das Frontend ist am lokalen Rechner erreichbar; API und Datenbank bleiben im Containernetz.

```sh
docker compose ps
docker compose logs --tail=30 worker
docker compose run --rm worker python app.py --once
docker compose down
```

Die Befehle zeigen den Status, zeigen Importprotokolle, starten einen manuellen Import beziehungsweise stoppen die Anwendung. Der manuelle Import liefert bei einem Quellenfehler einen Fehlerstatus, verarbeitet die übrigen Quellen aber weiter. `down` erhält die Datenbank im Volume; `down -v` löscht sie und sollte nicht für normale Neustarts verwendet werden.

## Funktionsumfang

- Import beim Workerstart und anschließend alle 30 Minuten, unabhängig vom Frontend.
- PostgreSQL speichert Originalüberschriften, Sprache, Quelle, Original-URL, Veröffentlichungs-/Importzeit und Kategorie.
- Duplikaterkennung über eindeutige Original-URL sowie Kennung je Quelle; Importsperre gegen parallele Läufe.
- Fehler je Quelle werden separat protokolliert; gespeicherte Meldungen bleiben bei Ausfällen sichtbar.
- Kategorien aus Feedkategorien und Quell-URL; keine inhaltliche KI-Analyse.
- Serverseitige Ausgabe der neuesten 100 Meldungen; Quellenfilter, Suche und Themenfilter innerhalb dieser Meldungen. Offene Browserseiten aktualisieren sich jede Minute.
- Artikel öffnen direkt beim Originalanbieter. Kein Scraping, kein Umgehen von Schutzmaßnahmen.
- Quellstatus und letzter erfolgreicher Abruf sind auf der Website sichtbar. Zeiten werden ausdrücklich in Berliner Zeit angezeigt.

## Entwicklung und Tests

Frontend ohne Container: Node.js 24, `cd frontend`, `npm ci`, `npm run dev`. Die API wird standardmäßig unter `http://127.0.0.1:8000` erwartet; alternativ `API_URL` setzen. Für Containerbetrieb ist die Adresse bereits konfiguriert.

Frontend prüfen: `npm run build` und anschließend `npm run typecheck` im Ordner `frontend`.

Backend: `backend/requirements.txt` in einer Python-3.12-Umgebung installieren. `DATABASE_URL` auf eine lokale PostgreSQL-Datenbank setzen. Schema und Quellen mit `python -c 'from app import initialize; initialize()'` im Backendordner anlegen, API mit `uvicorn app:app` starten; Worker separat mit `python app.py`. `/health` prüft Datenbankzugriff, `/articles` liefert Meldungen und Quellenstatus. Es gibt keine öffentlichen Schreibendpunkte.

Tests: `python -m unittest -v test_import` im Backendordner. Die Datenbanktests benötigen zusätzlich `TEST_DATABASE_URL` auf eine **separate, leere Testdatenbank**; ohne diese werden sie ausdrücklich übersprungen. Tests niemals auf eine Datenbank mit eigenen Daten richten.

## Quellen und Veröffentlichung

Details zur Prüfung: [docs/sources.md](docs/sources.md). Das Angebot eines RSS-Feeds ist keine pauschale Veröffentlichungslizenz. Diese Version ist für den lokalen Nachrichtenleser eingerichtet; vor öffentlichem oder kommerziellem Betrieb sind die Nutzungsrechte der Anbieter zu klären. Suchmaschinenindexierung bleibt deaktiviert.

Noch offen: passwortgeschützte Administration, editierbare Kategorien/Quellen, versionierte Migrationen, Artikeldetailseiten, umfassende SEO-Konfiguration sowie produktives Deployment mit HTTPS und geprüften Backups. Die Compose-Datei ist eine lokale Entwicklungsgrundlage, keine abgeschlossene Serverkonfiguration.

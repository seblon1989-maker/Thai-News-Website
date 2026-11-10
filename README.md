# Thailand Journal

Erste responsive Designvorschau. Alle Beiträge sind fiktiv, es sind keine Nachrichtenquellen angebunden. Die deutschen Orientierungstexte sind manuell erstellte Beispieldaten. Keine KI-Verarbeitung oder automatische Übersetzung.

## Lokal starten

Voraussetzung: Node.js 24 LTS mit npm, kostenlos erhältlich auf https://nodejs.org/ (macOS: Apple-Silicon-Version wählen).

Im Terminal im Projektordner:

```sh
cd frontend
npm ci
npm run dev
```

Anschließend im Browser auf dem eigenen Rechner `http://localhost:3000` öffnen. Der Entwicklungsserver läuft, solange das Terminal geöffnet bleibt; mit Strg+C beenden.

## Prüfen

```sh
cd frontend
npm run build
npm run typecheck
```

Die Vorschau bietet Themenfilter, Textsuche und Detaildialoge. Noch nicht implementiert: Backend, Datenbankanbindung, RSS-Import, Administration und produktives Deployment. Keine automatischen Nachrichten oder rechtlich freigegebenen Fremdinhalte vorhanden. Suchmaschinenindexierung ist für diese Demo deaktiviert.

# Quellenprüfung — 10. November 2026

Technische Erreichbarkeit ist keine rechtliche Freigabe. Die Prüfung belegt offizielle Feedangebote und lesbares RSS, keine allgemeine Lizenz zur öffentlichen oder kommerziellen Weiterveröffentlichung. Vor einem öffentlichen Start müssen die Bedingungen und erforderlichen Einwilligungen gesondert geklärt werden. Der derzeitige Betrieb ist als lokaler RSS-Leser vorgesehen.

## Aktiv für den lokalen Leser

| Anbieter | Feed | Offizieller Nachweis | Technisches Ergebnis |
| --- | --- | --- | --- |
| Matichon | https://www.matichon.co.th/feed | Auf https://www.matichon.co.th/ im HTML als `rel="alternate" type="application/rss+xml"` verlinkt | HTTP 200, RSS mit 50 Einträgen bei Prüfung |
| Bangkok Post | https://www.bangkokpost.com/rss/data/thailand.xml | Auf https://www.bangkokpost.com/rss ausdrücklich als „Thailand channel articles“ aufgeführt | HTTP 200, RSS mit 10 Einträgen bei Prüfung |

Bangkok Post beschreibt auf seiner RSS-Seite ausdrücklich die Nutzung mit lokalen und webbasierten RSS-Lesern. Das ersetzt keine gesonderte Erlaubnis zum öffentlichen Weiterveröffentlichen. Matichon kennzeichnet seine Website mit „All Rights Reserved“; der verlinkte Feed belegt keine abweichende allgemeine Veröffentlichungslizenz.

Es werden nur Originalüberschriften, URLs, Quellenzuordnung, Sprache, Kategorien und Zeitpunkte gespeichert. Feedbeschreibungen, Volltexte, eingebettetes HTML und Bilder werden nicht übernommen. Deutsche Übersetzungen werden nicht erzeugt. Alle Titel werden als Text gerendert, nicht als HTML.

Der Import prüft vor jedem Feedabruf die jeweilige robots.txt. Bei Verbot oder einem ungeklärten Abruffehler wird die Quelle übersprungen und der Fehler gespeichert. Es gibt keine Artikel-Scrapes, keine Schutzumgehung und keine wechselnden Tarnidentitäten. Robots-Regeln regeln technischen Zugriff und erteilen keine urheberrechtliche Lizenz.

## Weitere untersuchte Anbieter — noch nicht aktiviert

- Thai PBS: Website erreichbar; bisher kein offiziell verlinkter Feed bestätigt. Die Website verlinkt https://www.thaipbs.or.th/org/terms-and-conditions/.
- Thairath: Website erreichbar; kein Feed bestätigt. Ein geprüfter RSS-Pfad lieferte HTTP 404 und wird nicht als Quelle verwendet.
- Khaosod: HTTP 403 beim Websiteabruf; keine Umgehung versucht.
- The Nation Thailand: Website erreichbar; ein geprüfter RSS-Pfad lieferte HTML statt eines Feeds. Nicht aktiviert.

Feedinhalte, URLs und Nutzungsbedingungen können sich ändern. Der laufende Quellenstatus auf der Website zeigt technische Ausfälle an. Neue Anbieter werden erst nach gesonderter Prüfung hinzugefügt.

'use client';

import { useState } from 'react';

const categories = ['Alle Themen', 'Politik', 'Wirtschaft', 'Tourismus', 'Visa & Einwanderung', 'Gesellschaft', 'Sicherheit', 'Wetter & Umwelt', 'Kultur', 'Regionen'];
const articles = [
  { id: 1, category: 'Gesellschaft', title: 'กรุงเทพฯ ในจังหวะใหม่ของเมือง', translation: 'Bangkok im neuen Rhythmus der Stadt', description: 'Eine Stadt zwischen Tradition und Wandel: Dieser fiktive Beitrag zeigt, wie eine Hauptnachricht künftig präsentiert wird.', time: '09:30', location: 'BANGKOK', art: 'city', featured: true },
  { id: 2, category: 'Tourismus', title: 'เส้นทางท่องเที่ยวชุมชนภาคเหนือ', translation: 'Unterwegs im Norden Thailands', description: 'Ein fiktiver Ausblick auf lokale Reiserouten, kleine Orte und Begegnungen abseits der großen Straßen.', time: '08:45', location: 'CHIANG MAI', art: 'mountain' },
  { id: 3, category: 'Wirtschaft', title: 'ตลาดท้องถิ่นกับเศรษฐกิจชุมชน', translation: 'Lokale Märkte und ihre Gemeinschaften', description: 'Beispielinhalt über das wirtschaftliche Leben auf Thailands Märkten. Keine echte Nachricht.', time: '08:10', location: 'THAILAND', art: 'market' },
  { id: 4, category: 'Kultur', title: 'เรื่องราวของศิลปะและวัฒนธรรมไทย', translation: 'Kunst, Handwerk und gelebte Tradition', description: 'Ein fiktiver Kulturbeitrag als Vorschau auf die spätere Nachrichtenübersicht.', time: '07:30', location: 'AYUTTHAYA', art: 'temple' },
  { id: 5, category: 'Wetter & Umwelt', title: 'ธรรมชาติและพื้นที่สีเขียวในเมือง', translation: 'Mehr Raum für Grün in der Stadt', description: 'Ein erfundenes Beispiel für die Darstellung von Umweltmeldungen.', time: '07:00', location: 'BANGKOK', art: 'green' },
  { id: 6, category: 'Regionen', title: 'วิถีชีวิตริมทะเลทางภาคใต้', translation: 'Perspektiven von der südlichen Küste', description: 'Fiktiver Regionalbeitrag über das Leben am Meer. Alle Inhalte dienen ausschließlich der Designvorschau.', time: '06:40', location: 'SÜDTHAILAND', art: 'sea' },
];
type Article = typeof articles[number];

function Artwork({ kind }: { kind: string }) {
  return <div className={`artwork ${kind}`} aria-hidden="true"><div className="sun"/><div className="horizon"/><div className="building b1"/><div className="building b2"/><div className="building b3"/><div className="building b4"/><div className="building b5"/><div className="roof"/><div className="water"/><span className="art-label">THAILAND · ILLUSTRATION</span></div>;
}

export default function Home() {
  const [category, setCategory] = useState('Alle Themen');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Article | null>(null);
  const filtered = articles.filter(a => (category === 'Alle Themen' || a.category === category) && `${a.title} ${a.translation} ${a.description}`.toLowerCase().includes(search.toLowerCase()));
  return <>
    <div className="demo-bar"><span className="demo-dot"/> DESIGNVORSCHAU <span className="demo-divider">/</span> Fiktive Beispieldaten · keine aktuellen Nachrichten</div>
    <header className="header wrap">
      <a className="brand" href="/" aria-label="Thailand Journal Startseite"><span className="brand-icon">ท</span><span>THAILAND<span className="brand-bottom">JOURNAL<span className="brand-dot">.</span></span></span></a>
      <div className="header-note">Ein Land. Viele Perspektiven.<span>Nachrichten aus Thailand — im Original.</span></div>
      <a className="about-link" href="#ueber">Über das Projekt <span>↗</span></a>
    </header>
    <nav className="nav" aria-label="Themen"><div className="wrap nav-inner">{categories.map(c => <button key={c} className={category === c ? 'active' : ''} onClick={() => setCategory(c)}>{c}</button>)}</div></nav>
    <main className="wrap">
      <section className="intro"><div><div className="eyebrow"><span/> DER BLICK NACH THAILAND</div><h1>Näher dran.<br/><em>Mehr verstehen.</em></h1><p>Politik, Alltag und Geschichten aus dem Königreich.<br/>An einem Ort. Mit direktem Blick auf die Quellen.</p></div><div className="intro-side"><span className="edition">AUSGABE 00 <span>↗</span></span><p>Ein erster Einblick<br/>in das Thailand Journal.</p><span className="small-label">UNABHÄNGIG · ÜBERSICHTLICH · OFFEN</span></div></section>
      <section className="news" aria-labelledby="news-title"><div className="section-heading"><h2 id="news-title">{category === 'Alle Themen' ? 'Im Fokus' : category}<span className="count">{filtered.length.toString().padStart(2, '0')}</span></h2><label className="search"><span aria-hidden="true">⌕</span><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Themen durchsuchen …" aria-label="Beispielnachrichten durchsuchen"/>{search && <button onClick={() => setSearch('')} aria-label="Suche löschen">×</button>}</label></div>
      {filtered.length > 0 ? <div className="news-grid">{filtered.map((article, i) => <article className={i === 0 ? 'card lead' : 'card'} key={article.id}><button className="image-button" onClick={() => setSelected(article)} aria-label={`${article.translation} öffnen`}><Artwork kind={article.art}/><span className="image-tag">{article.location}</span></button><div className="card-body"><div className="meta"><span>{article.category}</span><span>BEISPIEL · {article.time}</span></div><h3 lang="th"><button onClick={() => setSelected(article)}>{article.title}</button></h3><p className="translation">Deutsche Orientierung: {article.translation}</p>{i === 0 && <p className="description">{article.description}</p>}<div className="card-footer"><span><span className="source-dot"/> Fiktive Redaktion</span><button onClick={() => setSelected(article)} aria-label={`Details zu ${article.translation}`}>↗</button></div></div></article>)}</div> : <div className="empty"><h3>Hier ist noch Platz für Nachrichten.</h3><p>Für diese Auswahl gibt es keine Beispieldaten.</p><button onClick={() => {setCategory('Alle Themen'); setSearch('');}}>Alle Beispiele anzeigen ↗</button></div>}
      </section>
      <section className="project" id="ueber"><span className="project-number">01 / DIE IDEE</span><div><h2>Thailand verstehen.<br/><em>Bei den Quellen anfangen.</em></h2><p>Das Thailand Journal soll Meldungen aus geprüften thailändischen Nachrichtenquellen übersichtlich zusammenführen. In Version 1 bleiben Nachrichten in ihrer Originalsprache — ohne KI und ohne automatische Übersetzung.</p><p className="project-status"><span/> In Entwicklung · Noch keine Nachrichtenquelle angebunden</p></div><span className="project-mark" aria-hidden="true">ท</span></section>
    </main>
    <footer className="wrap footer"><strong>THAILAND JOURNAL<span>.</span></strong><p>Designvorschau · Alle Beiträge sind erfunden.<br/>Illustrationen sind eigens mit CSS erstellt. Keine fremden Nachrichtenbilder.</p><a href="#">Zurück nach oben ↑</a></footer>
    {selected && <div className="modal-backdrop" onClick={() => setSelected(null)}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="detail-title" onClick={e => e.stopPropagation()} onKeyDown={e => {if(e.key === 'Escape') setSelected(null);}}><button autoFocus className="close" onClick={() => setSelected(null)} aria-label="Detailansicht schließen">×</button><div className="eyebrow">FIKTIVER BEISPIELBEITRAG · {selected.category}</div><h2 id="detail-title" lang="th">{selected.title}</h2><p className="translation">{selected.translation}</p><Artwork kind={selected.art}/><p>{selected.description}</p><div className="detail-note">Dies ist keine veröffentlichte Nachricht. Es gibt weder eine reale Quelle noch einen Originalartikel. Die deutschen Texte wurden für diese Vorschau geschrieben und sind keine automatische Übersetzung.</div><button className="back-button" onClick={() => setSelected(null)}>Zurück zur Übersicht →</button></section></div>}
  </>;
}

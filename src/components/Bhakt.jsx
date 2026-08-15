import { useEffect, useRef, useState } from 'react';
import { useStore, store } from '../store.js';
import { TIMELINE, STATION_S } from '../data/timeline.js';
import { LEDGER_TIMELINE, LEDGER_ZONES } from '../data/ledger-timeline.js';
import { PHOTOS } from '../data/photos.js';
import { LEDGER } from '../data/ledger.js';
import { WALK, LEDGER_WALK_URL, MAIN_WALK_URL } from '../data/walk.js';
import { engine } from '../scene/engine.js';

/* "FOR ANDHBHAKTS" — the satire page, from the Claude Design file of the
   same name, extended into the second section's full home: the same
   sections The Record has (masthead + switch, hero, the corridor's
   plates by era, the floor plan of every station, jokes off, credits).
   Every number in the jokes is a joke and reads like one. The walk it
   opens onto is the documented corridor — every plate carries its
   papers. The satire mocks habits, offices and objects; never a face. */

const IN_LEDGER_WALK = WALK.key === 'ledger';
const MAIN_STATIONS = IN_LEDGER_WALK ? 48 : TIMELINE.length;   // the Record's count, for the jokes
const L = LEDGER_TIMELINE;                                       // the 2014→today stations
const L_PLATES = L.filter(t => PHOTOS[t.id]);
const DOCS = LEDGER.reduce((n, e) => n + e.records.filter(r => r.url).length
  + (e.remarks ? e.remarks.filter(r => r.url).length : 0) + (e.press ? e.press.length : 0), 0);
const tilt = i => `${(i % 2 ? 1 : -1) * (0.8 + i * 0.35)}deg`;

/* the corridor's five eras, 2014→today, styled like the walk's floor */
const ERAS = LEDGER_ZONES.map((name, k) => {
  const rows = L.filter(t => t.zone === k);
  const [roman, label] = name.split(' · ');
  const y0 = rows[0].year.slice(0, 4), last = rows[rows.length - 1].year;
  const y1 = /^\d{4}/.test(last.slice(-4)) ? last.slice(-4) : 'today';
  return { k, roman, name: label, years: `${y0}–${y1}`, count: rows.filter(t => PHOTOS[t.id]).length,
    bg: ['#4a4a4c','#5b5754','#6e5f52','#3f2f26','#8a8178'][k],
    fg: ['#f4efe0','#f4efe0','#f4efe0','#f2e6d6','#141414'][k],
    note: ['Fresh tarmac. Photo-op ready.', 'The great schemes. Ribbon supply: unlimited.',
           'The cracks. Please mind the gap in the data.', 'Scorched. Do not ask about the smoke.',
           'The plaza. The cockroaches are already here.'][k] };
});

const MOMENTS = [
  { year:'2014', accent:'#FF9933', title:'Independence Day 2.0',
    body:'The real freedom struggle, apparently: one election. Panipat, Plassey and the whole 1857 thing were just the tutorial level. Skip cutscene.',
    source:'a reel with 400k likes' },
  { year:'2016', accent:'#c0392b', title:'The Great ATM Yatra',
    body:'Four hours in a queue for the nation. Called it a fast. Posted about it. Two years later the RBI counted the notes and 99.3% came home — the black money, tragically, could not attend.',
    source:'forwarded by an uncle' },
  { year:'2020', accent:'#2E7D5B', title:'Thali Percussion Nationals',
    body:'Banged steel utensils at a virus, on schedule, in formation. The migrant workers walking home on the highway did not get a slot. The oxygen shortage was later ruled to have not been "specifically reported".',
    source:'primetime, 9pm sharp' },
  { year:'Today', accent:'#26356e', title:'Operation Cockroach',
    body:'Students asked for data and got called insects. They took the name and marched anyway. You are, currently, reading their website. It has footnotes. Yours has forwards.',
    source:'you are here' },
];
const PACK = [
  '"I don\'t do politics" (politically)', '"But first tell me about 1962"', 'Whataboutism · Level 9',
  'Ratio\'d by a CAG report', 'Cites: WhatsApp University', 'Blocks cousin, not corruption',
  'Delulu is the solulu', 'Bhakt mode: airplane ✈', '"Source? Trust me bro" (verified ✓)', 'Outrage: subscribed · Audit: unsubscribed',
];
const ACHIEVEMENTS = [
  { n:'0',  l:'audit reports read — 12 quoted at dinner' },
  { n:'47', l:'relatives blocked for asking where the data is' },
  { n:'1',  l:'anthem in a cinema hall. Patriotism: complete' },
  { n:'∞',  l:'hours of 9pm debate watched, 0 questions asked' },
  { n:'99.3%', l:'of the notes came back. The joke, like the cash, is on you' },
  { n:'2',  l:'ribbons cut per unfinished flyover (national average)' },
];
const FAQ = [
  { q:'Why does the walk start in 1526 and not 2014?',
    a:`Because that is when it started. Four hundred and twenty-one years of it are on the other page, with photographs.` },
  { q:'Isn\'t questioning the government anti-national?',
    a:'It is the national duty, written down. Article 51A(h) of the Constitution asks citizens to develop the scientific temper and the spirit of inquiry. It does not mention the group chat.' },
  { q:'So this page is anti-national?',
    a:`This page is anti-forward. There is a difference, and it is roughly ${DOCS} linked documents wide.` },
  { q:'Fine — where are your sources?',
    a:'Every plate in the corridor links to the audit report, judgment, filing or parliamentary answer it came from. Nothing on the funny page does, because the funny page is the joke.' },
  { q:'Why is the road in the corridor so bad?',
    a:'It was inaugurated. Twice. The third ribbon is scheduled; the tarmac is not.' },
  { q:'Who is the man at the podium?',
    a:'There is no man at the podium. There is a suit, a mic on mute, and a stack of unopened questions. If you saw a face, that is on you.' },
];

export default function Bhakt(){
  const { bhaktOpen, ready, load } = useStore();
  const topRef = useRef(null);
  const [era, setEra] = useState(0);
  const [lb, setLb] = useState(-1);
  useEffect(() => {
    if (!bhaktOpen) return;
    topRef.current && topRef.current.focus();
    const onKey = e => {
      if (e.key === 'Escape'){ if (lb >= 0) setLb(-1); else store.set({ bhaktOpen: false }); }
      if (lb >= 0 && e.key === 'ArrowRight') step(1);
      if (lb >= 0 && e.key === 'ArrowLeft') step(-1);
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  });
  if (!bhaktOpen) return null;

  const close = () => store.set({ bhaktOpen: false });
  const shown = L_PLATES.filter(p => p.zone === era);
  const step = d => { const cur = shown.findIndex(p => p.id === (L_PLATES[lb]||{}).id);
    const nxt = (cur + d + shown.length) % shown.length; setLb(L_PLATES.findIndex(p => p.id === shown[nxt].id)); };
  const cur = lb >= 0 ? L_PLATES[lb] : null;
  // walk entry: in the ledger walk we start the engine directly; from the Record we cross over
  const walkTo = (id) => {
    if (IN_LEDGER_WALK){ store.set({ bhaktOpen: false }); const i = TIMELINE.findIndex(t => t.id === id);
      engine.begin(i >= 0 ? STATION_S[i] : null); }
    else location.href = LEDGER_WALK_URL + (id ? '#' + id : '');
  };
  const walkLabel = IN_LEDGER_WALK ? (ready ? 'Take the Pothole Yatra' : (load.msg || 'Loading the potholes…')) : 'Take the Pothole Yatra';

  return (
    <div id="bhakt" role="dialog" aria-modal="true" aria-label="For Andhbhakts">
      <header className="bk-mast">
        <div className="bk-wrap bk-mast-in">
          <div className="bk-brand">
            <span className="serif">Walk Through Time</span>
            <span className="mono strike">1526–1947</span>
            <span className="mono saff">2014–∞</span>
          </div>
          <div className="bk-switch" role="group" aria-label="Choose your version of history">
            {IN_LEDGER_WALK
              ? <a ref={topRef} href={MAIN_WALK_URL}>↩ The Record · 1526–1947</a>
              : <button ref={topRef} onClick={close}>↩ The Record · 1526–1947</button>}
            <span className="on">For Andhbhakts</span>
          </div>
          <nav className="bk-nav">
            <a href="#bk-plates">Plates</a>
            <a href="#bk-plan">Floor plan</a>
            <a href="#bk-faq">Avoided questions</a>
            <a href="#bk-real" className="saff">Jokes off</a>
            <button className="bk-btn dark sm" onClick={() => walkTo(null)}>{walkLabel}</button>
          </nav>
        </div>
      </header>

      <section className="bk-hero">
        <div className="bk-wrap bk-hero-in">
          <div className="bk-badge">✓ Verified · forwarded 14 times · source: papa's friend</div>
          <h1>History started in 2014.</h1>
          <p>Everything before that is unverified. Welcome to the speedrun edition: 421 years skipped,
             a corridor of potholes, and every single plate with its papers attached. If you need a source,
             it's on the wall. If you need a forward, look inward.</p>
          <div className="bk-cta">
            <button className="bk-btn dark" onClick={() => walkTo(null)}>Take the Pothole Yatra →</button>
            {IN_LEDGER_WALK
              ? <a className="bk-btn light" href={MAIN_WALK_URL}>↩ Take me back to the receipts</a>
              : <button className="bk-btn light" onClick={close}>↩ Take me back to the receipts</button>}
          </div>
          <div className="bk-stamp" aria-hidden="true">Fact-checked<br /><span>by nobody</span></div>
        </div>
        <div className="bk-ticker" aria-hidden="true">
          {L.length - 1} stations · {L_PLATES.length} photographs · {DOCS} documents · 1 group chat · {L.length - 1} stations · {L_PLATES.length} photographs · {DOCS} documents · 1 group chat
        </div>
      </section>

      {/* ---- the corridor's plates, by era (mirrors The Record) ---- */}
      <section id="bk-plates" className="bk-wrap bk-sec">
        <div className="bk-sec-head">
          <div>
            <div className="bk-kicker">The corridor · {L_PLATES.length} plates · every one with its papers</div>
            <h2>Walk the road, or pick a stretch</h2>
          </div>
          <div className="bk-aside">The road gets worse as you go. The hoardings get more confident. This is not a coincidence, it is a design.</div>
        </div>
        <div className="bk-rail" role="group" aria-label="Pick a stretch of the corridor">
          {ERAS.map(e => (
            <button key={e.k} className={era === e.k ? 'on' : ''} style={{ background:e.bg, color:e.fg }} onClick={() => setEra(e.k)}>
              <span className="r">Era {e.roman}</span><span className="t">{e.name}</span><span className="y">{e.years} · {e.count}</span>
            </button>
          ))}
        </div>
        {ERAS.filter(e => e.k === era).map(e => (
          <div key={e.k} className="bk-band" style={{ background:e.bg, color:e.fg }}>
            <div className="bk-band-head">
              <div><div className="bk-kicker" style={{ color:e.fg, opacity:.75 }}>Era {e.roman} · {e.years}</div><h3>{e.name}</h3></div>
              <div className="bk-band-note">{e.note}</div>
            </div>
            <div className="bk-plates">
              {L_PLATES.filter(p => p.zone === e.k).map((p, i) => (
                <button key={p.id} className="bk-plate" style={{ '--tilt': tilt(i) }} onClick={() => setLb(L_PLATES.findIndex(x => x.id === p.id))}>
                  <span className="pic"><img src={PHOTOS[p.id].url} alt={p.title} loading="lazy" /></span>
                  <span className="acc" style={{ background:p.accent }} />
                  <span className="yr">{p.year}</span>
                  <span className="tt">{p.title}</span>
                  <span className="dc">{(LEDGER.find(x => x.title === p.ledger) || { records:[] }).records.filter(r => r.url).length} documents attached</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* ---- the revised timeline: the four-slide version ---- */}
      <section id="bk-timeline" className="bk-wrap bk-sec">
        <div className="bk-sec-head">
          <div>
            <div className="bk-kicker">The revised timeline · four stations, all uphill</div>
            <h2>The whole struggle, but make it four slides</h2>
          </div>
          <div className="bk-aside">Original walkway: {MAIN_STATIONS} stations. This one: 4. Efficiency.</div>
        </div>
        <div className="bk-moments">
          {MOMENTS.map((m, i) => (
            <article key={m.year} style={{ '--tilt': tilt(i) }}>
              <div className="yr">{m.year}</div>
              <div className="acc" style={{ background:m.accent }} />
              <h3>{m.title}</h3>
              <p>{m.body}</p>
              <div className="src">Source: {m.source}</div>
            </article>
          ))}
        </div>
      </section>

      {/* ---- floor plan of every station (mirrors The Record) ---- */}
      <section id="bk-plan" className="bk-wrap bk-sec">
        <div className="bk-kicker">Floor plan · {L.length - 1} stations, one plaza</div>
        <h2>Every pothole on the walkway</h2>
        <p className="bk-sub">Each station's year is inlaid in the tarmac. Enter at any one of them and the walk begins there — with the documents.</p>
        <div className="bk-plan-grid">
          {ERAS.map(e => (
            <div key={e.k}>
              <div className="bk-plan-head"><span className="r">{e.roman}</span><span>{e.name}</span></div>
              <ul>
                {L.filter(t => t.zone === e.k && t.prop !== 'finale').map(t => (
                  <li key={t.id}><button onClick={() => walkTo(t.id)}>
                    <span className="yr">{t.year}</span><span className="tt">{t.title}</span>
                    <span className="dot" style={{ opacity: PHOTOS[t.id] ? 1 : .32 }} aria-hidden="true" />
                  </button></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="bk-wrap bk-sec">
        <h2>The starter pack</h2>
        <p className="bk-sub">Collect all ten. Some of these are in your family group right now. One of them is you.</p>
        <div className="bk-pack">{PACK.map(c => <span key={c}>{c}</span>)}</div>
      </section>

      <section className="bk-wrap bk-sec">
        <h2>Achievements unlocked</h2>
        <div className="bk-ach">
          {ACHIEVEMENTS.map(a => <div key={a.l}><div className="n">{a.n}</div><div className="l">{a.l}</div></div>)}
        </div>
      </section>

      <section id="bk-faq" className="bk-wrap bk-sec">
        <h2>Frequently avoided questions</h2>
        <div className="bk-faq">
          {FAQ.map(q => (
            <div key={q.q}><div className="q">Q</div><div className="qq">{q.q}</div><div className="rule" /><p>{q.a}</p></div>
          ))}
        </div>
      </section>

      <section id="bk-real" className="bk-real">
        <div className="bk-wrap bk-real-grid">
          <div>
            <div className="bk-kicker gold">Okay. Jokes off.</div>
            <h2>Nobody handed anybody freedom — not in 2014, and not in 1947 either.</h2>
            <p>Four hundred and twenty-one years of people were jailed, shot, starved and hanged for the thing
               you were born holding. The joke isn't on them. It's on anyone who thinks patriotism means never
               asking a question.</p>
            <p>Article 51A of the Constitution lists your duties as a citizen. Two of them are to cherish the
               ideals of the freedom struggle, and to develop the scientific temper and the spirit of inquiry.
               Neither of those is a forward.</p>
            <div className="bk-cta">
              <button className="bk-btn gold" onClick={() => walkTo(null)}>Walk 2014 → today · the documented corridor →</button>
              <a className="bk-btn ghost" href={MAIN_WALK_URL}>Walk 1526 → 1947</a>
            </div>
          </div>
          <div className="bk-facts">
            {[['421','Years of struggle on the other page'],[String(MAIN_STATIONS),'Stations you can walk there'],
              [String(L_PLATES.length),'Photographs in this corridor'],[String(DOCS),'Documents on its walls']].map(([n,l]) => (
              <div key={l}><b>{n}</b><span>{l}</span></div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bk-foot">
        <div className="bk-wrap bk-foot-in">
          <p>Satire. Every number in the jokes is a joke and reads like one; every claim on the corridor's walls
             is attached to the document it came from. Nothing here depicts a real person — the suit is empty on
             purpose. If something here is wrong, send the document — not the forward.</p>
          <div className="bk-foot-links">
            <div>Made by a cockroach</div>
            <div>Photographs: public domain &amp; Creative Commons · Wikimedia Commons</div>
            <div><a href={MAIN_WALK_URL}>↩ Back to the real archive</a></div>
          </div>
        </div>
      </footer>

      {cur && (
        <div className="gl-lb" role="dialog" aria-modal="true" onClick={() => setLb(-1)}>
          <div className="gl-lb-in" onClick={e => e.stopPropagation()}>
            <div className="gl-lb-pic"><span className="gl-glass"><img src={PHOTOS[cur.id].url} alt={PHOTOS[cur.id].title} /><span className="sheen" aria-hidden="true" /></span></div>
            <div className="gl-lb-txt">
              <div className="acc" style={{ background:cur.accent }} />
              <div className="gl-kicker">Plate · Station {String(L.indexOf(cur)+1).padStart(2,'0')} · Era {ERAS[cur.zone].roman}</div>
              <div className="yr">{cur.year}</div>
              <h3>{cur.title}</h3>
              <hr />
              <p>{cur.summary}</p>
              {cur.details && <p className="det">{cur.details}</p>}
              <p className="cred">{PHOTOS[cur.id].credit}</p>
              <div className="gl-lb-cta">
                <button className="gl-btn-navy" onClick={() => { setLb(-1); walkTo(cur.id); }}>Walk to this station →</button>
                <button className="gl-btn-paper" onClick={() => setLb(-1)}>Close</button>
              </div>
              <div className="gl-lb-nav"><button onClick={() => step(-1)}>← Previous</button><button onClick={() => step(1)}>Next plate →</button></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

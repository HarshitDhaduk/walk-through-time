import { useEffect, useRef } from 'react';
import { useStore, store } from '../store.js';
import { TIMELINE } from '../data/timeline.js';
import { PHOTOS } from '../data/photos.js';
import { LEDGER } from '../data/ledger.js';
import { WALK, LEDGER_WALK_URL, MAIN_WALK_URL } from '../data/walk.js';

/* "FOR ANDHBHAKTS" — the satire page, ported from the Claude Design
   file of the same name. Every number on this page is a joke and reads
   like one; the turn at "Okay. Jokes off." hands the reader the real
   record — the Ledger and the 2014–2026 walk — where every claim is
   attached to the document it came from.                            */

const STATIONS = TIMELINE.length;
const PLATES = TIMELINE.filter(t => PHOTOS[t.id]).length;
const DOCS = LEDGER.reduce((n, e) => n + e.records.filter(r => r.url).length
  + (e.remarks ? e.remarks.filter(r => r.url).length : 0) + (e.press ? e.press.length : 0), 0);
const tilt = i => `${(i % 2 ? 1 : -1) * (0.8 + i * 0.35)}deg`;

const MOMENTS = [
  { year:'2014', accent:'#FF9933', title:'Independence Day 2.0',
    body:'The real freedom struggle, apparently: one election. Panipat, Plassey and the whole 1857 thing were just the tutorial level.',
    source:'a reel with 400k likes' },
  { year:'2016', accent:'#c0392b', title:'The Great ATM Yatra',
    body:'Four hours in a queue for the nation. Called it a fast. Posted about it. Never mentioned the receipts that came out two years later.',
    source:'forwarded by an uncle' },
  { year:'2020', accent:'#2E7D5B', title:'Thali Percussion Nationals',
    body:'Banged steel utensils at a virus, on schedule, in formation. The migrant workers walking home on the highway did not get a slot.',
    source:'primetime, 9pm sharp' },
  { year:'Today', accent:'#26356e', title:'Operation Cockroach',
    body:'Students asked for data and got called insects. They took the name and marched anyway. You are, currently, reading their website.',
    source:'you are here' },
];
const PACK = [
  '"I don\'t do politics" (politically)', '"But first tell me about 1962"', 'Whataboutism · Level 9',
  'Ratio\'d by a CAG report', 'Cites: WhatsApp University', 'Blocks cousin, not corruption',
  'Delulu is the solulu', 'Bhakt mode: airplane ✈',
];
const ACHIEVEMENTS = [
  { n:'0',  l:'audit reports read — 12 quoted at dinner' },
  { n:'47', l:'relatives blocked for asking where the data is' },
  { n:'1',  l:'anthem in a cinema hall. Patriotism: complete' },
  { n:'∞',  l:'hours of 9pm debate watched, 0 questions asked' },
];
const FAQ = [
  { q:'Why does the walk start in 1526 and not 2014?',
    a:`Because that is when it started. Four hundred and twenty-one years of it are on the other page, with photographs.` },
  { q:'Isn\'t questioning the government anti-national?',
    a:'It is the national duty, written down. Article 51A(h) of the Constitution asks citizens to develop the scientific temper and the spirit of inquiry. It does not mention the group chat.' },
  { q:'So this page is anti-national?',
    a:`This page is anti-forward. There is a difference, and it is roughly ${DOCS} linked documents wide.` },
  { q:'Fine — where are your sources?',
    a:'Every claim in the Ledger links to the audit report, judgment, filing or parliamentary answer it came from. Nothing on the funny page does, because the funny page is the joke.' },
];

export default function Bhakt(){
  const { bhaktOpen } = useStore();
  const topRef = useRef(null);
  useEffect(() => {
    if (!bhaktOpen) return;
    topRef.current && topRef.current.focus();
    const onKey = e => { if (e.key === 'Escape') store.set({ bhaktOpen: false }); };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, [bhaktOpen]);
  if (!bhaktOpen) return null;

  const close = () => store.set({ bhaktOpen: false });
  const openLedger = () => store.set({ bhaktOpen: false, ledgerOpen: true });

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
            <button ref={topRef} onClick={close}>↩ The Record · 1526–1947</button>
            <span className="on">For Andhbhakts</span>
          </div>
          <nav className="bk-nav">
            <a href="#bk-timeline">New timeline</a>
            <a href="#bk-faq">Avoided questions</a>
            <a href="#bk-real" className="saff">Jokes off</a>
          </nav>
        </div>
      </header>

      <section className="bk-hero">
        <div className="bk-wrap bk-hero-in">
          <div className="bk-badge">✓ Verified · forwarded 14 times · source: papa's friend</div>
          <h1>History started in 2014.</h1>
          <p>Everything before that is unverified. Welcome to the speedrun edition: 421 years skipped,
             three stations, zero photographs, vibes only. If you need a source, forward this to yourself.</p>
          <div className="bk-cta">
            <a className="bk-btn dark" href="#bk-timeline">Enter the vibe corridor</a>
            <button className="bk-btn light" onClick={close}>↩ Take me back to the receipts</button>
          </div>
          <div className="bk-stamp" aria-hidden="true">Fact-checked<br /><span>by nobody</span></div>
        </div>
        <div className="bk-ticker" aria-hidden="true">
          0 stations · 0 photographs · 0 documents · 1 group chat · 0 stations · 0 photographs · 0 documents · 1 group chat
        </div>
      </section>

      <section id="bk-timeline" className="bk-wrap bk-sec">
        <div className="bk-sec-head">
          <div>
            <div className="bk-kicker">The revised timeline · four stations, all uphill</div>
            <h2>The whole struggle, but make it four slides</h2>
          </div>
          <div className="bk-aside">Original walkway: {STATIONS} stations. This one: 4. Efficiency.</div>
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

      <section className="bk-wrap bk-sec">
        <h2>The starter pack</h2>
        <p className="bk-sub">Collect all eight. Some of these are in your family group right now.</p>
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
              {WALK.key === 'main'
                ? <a className="bk-btn gold" href={LEDGER_WALK_URL}>Walk 2014 → today · the documented corridor →</a>
                : <a className="bk-btn gold" href={MAIN_WALK_URL}>Walk 1526 → 1947 →</a>}
              <button className="bk-btn ghost" onClick={openLedger}>Read the Ledger · {DOCS} documents</button>
            </div>
          </div>
          <div className="bk-facts">
            {[['421','Years of struggle on the other page'],[String(STATIONS),'Stations you can walk'],
              [String(PLATES),'Photographs, public domain'],[String(DOCS),'Documents in the Ledger']].map(([n,l]) => (
              <div key={l}><b>{n}</b><span>{l}</span></div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bk-foot">
        <div className="bk-wrap bk-foot-in">
          <p>Satire. Every number on this page is a joke and reads like one; every claim in the Republic's Ledger
             is attached to the document it came from. If something here is wrong, send the document — not the forward.</p>
          <div className="bk-foot-links">
            <div>Made by a cockroach</div>
            <div>Public domain photographs · Wikimedia Commons</div>
            <div><button onClick={close}>↩ Back to the real archive</button></div>
          </div>
        </div>
      </footer>
    </div>
  );
}

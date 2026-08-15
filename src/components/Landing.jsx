import { useEffect, useMemo, useState } from 'react';
import { useStore, store } from '../store.js';
import { engine } from '../scene/engine.js';
import { TIMELINE, STATION_S, ZONES } from '../data/timeline.js';
import { PHOTOS } from '../data/photos.js';
import { LEDGER } from '../data/ledger.js';
import { WALK, LEDGER_WALK_URL, MAIN_WALK_URL } from '../data/walk.js';

const IS_LEDGER = WALK.key === 'ledger';

/* GALLERY LANDING — ported from the Claude Design "Gallery Landing":
   a printed museum catalogue of the walk. Sticky masthead with the
   two-section switch; the plaza hero with the Ashoka Chakra turning
   behind it; an era rail that filters five era bands of framed plates;
   the floor plan of every station; the Ledger callout; credits; and a
   lightbox with keyboard prev/next. Everything is derived from the
   TIMELINE / PHOTOS data, so new stations appear here automatically. */

/* Era styling lifted from the walkway itself: FLOOR_KEYS in world.js
   (sandstone → dust → slate → scorched → pale stone). The same five
   bands serve both walks; names come from the active dataset.       */
const ERA_STYLE = [
  { roman:'I',   bg:'#c79d61', fg:'#2c1f10', sub:'#5c4626', rule:'rgba(60,42,20,.4)',    kind:'mughal' },
  { roman:'II',  bg:'#cfa76b', fg:'#2c1f10', sub:'#5c4626', rule:'rgba(60,42,20,.4)',    kind:'mughal' },
  { roman:'III', bg:'#93866f', fg:'#f6f1e4', sub:'#e2d9c6', rule:'rgba(255,250,235,.34)', kind:'transition' },
  { roman:'IV',  bg:'#5d6871', fg:'#f2f5f7', sub:'#ccd5da', rule:'rgba(240,248,252,.3)',  kind:'british' },
  { roman:'V',   bg:'#cfcaba', fg:'#26356e', sub:'#5c5647', rule:'rgba(90,80,60,.4)',    kind:'freedom' },
];
const ERA_NOTES = IS_LEDGER
  ? ['The opening promises', 'The great schemes', 'The corridor cracks and dims', 'Scorched red at 2024', 'The plaza, where the citizens stand']
  : ['Warm sandstone courtyards', 'Cusped arches, gilt finials', 'The corridor cracks and dims', 'Cool colonial columns · scorched red at 1857', 'Pale stone brightening into the plaza'];
const ERA_SHORT = IS_LEDGER
  ? ['The Mandate', 'The Great Schemes', 'The Cracks', 'The Scorched Year', 'The Plaza, Today']
  : ['Rise of the Mughals', 'The Great Mughals', 'Decline & the Company', 'Company Raj', 'Crown Rule & Freedom'];
const yearOf = (y, end) => { const m = y.match(/\d{4}/g); return m ? (end ? m[m.length - 1] : m[0]) : y; };
const ERAS = ERA_STYLE.map((e, k) => {
  const rows = TIMELINE.filter(t => t.zone === k);
  const y0 = yearOf(rows[0].year), y1 = yearOf(rows[rows.length - 1].year, true);
  return { ...e, short: ERA_SHORT[k], note: ERA_NOTES[k], name: ZONES[k].name.split(' · ')[1],
    years: y0 === y1 ? y0 : `${y0}–${y1}`, s0: k === 0 ? null : ZONES[k].s0 };
});
const RANGE = IS_LEDGER ? '2014 — today' : '1526 — 1947';
const RANGE_MARKERS = IS_LEDGER ? ['2014','2018','2021','2024','2026'] : ['1526','1600','1707','1757','1857','1947'];

/* frame treatment per era, echoing the 3D frames */
const FRAME = {
  mughal:     { frame:'7px solid #a6754a', radius:'46% 46% 2px 2px / 26% 26% 2px 2px' },
  transition: { frame:'6px solid #8a7a62', radius:'2px' },
  british:    { frame:'7px solid #c8ccd2', radius:'2px' },
  freedom:    { frame:'7px solid #efede6', radius:'2px' },
};

const ALL = TIMELINE.map((t, i) => ({ ...t, i, photo: !!PHOTOS[t.id], station: String(i + 1).padStart(2, '0') }));
const PLATES = ALL.filter(s => s.photo).map((s, i) => ({ ...s, no: String(i + 1).padStart(2, '0') }));
const HERO = PLATES.find(p => p.id === (IS_LEDGER ? 'neet-2026' : 'independence-1947')) || PLATES[PLATES.length - 1];
const LEDGER_LINKS = LEDGER.reduce((n, e) => n + e.records.filter(r => r.url).length
  + (e.remarks ? e.remarks.filter(r => r.url).length : 0) + (e.press ? e.press.length : 0), 0);
const YEARS_WALKED = IS_LEDGER ? 2026 - 2014 : 1947 - 1526;
const HERO_ERA = ERAS[HERO.zone] ? ERAS[HERO.zone].roman : 'V';

const MONO = "'IBM Plex Mono',ui-monospace,SFMono-Regular,Menlo,monospace";

export default function Landing(){
  const { load, ready, started, resume, hashIdx, error } = useStore();
  useEffect(() => { document.title = WALK.docTitle; }, []);
  const [era, setEra] = useState(-1);
  const [lb, setLb] = useState(-1);      // index into PLATES

  const shown = useMemo(() => era < 0 ? PLATES : PLATES.filter(p => p.zone === era), [era]);
  const step = d => {
    const cur = shown.findIndex(p => p.id === (PLATES[lb] || {}).id);
    const nxt = (cur + d + shown.length) % shown.length;
    setLb(PLATES.findIndex(p => p.id === shown[nxt].id));
  };

  useEffect(() => {
    if (lb < 0) return;
    const onKey = e => {
      if (e.key === 'Escape') setLb(-1);
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  });

  const jumpIdx = hashIdx >= 0 ? hashIdx : (resume ? resume.idx : -1);
  const jumpS   = hashIdx >= 0 ? STATION_S[hashIdx] : (resume ? resume.s : null);
  const jumpTag = hashIdx >= 0 ? '→ Begin at' : '↪ Resume at';
  const begin = s => { if (ready) engine.begin(s == null ? null : s); };
  const beginAtStation = i => begin(STATION_S[i]);
  const cur = lb >= 0 ? PLATES[lb] : null;

  // every corridor is listed; only the chosen one is opened to show its plates
  const bands = ERAS.map((e, k) => ({ ...e, k, plates: PLATES.filter(p => p.zone === k), open: era === k }));
  const pickEra = k => {
    setEra(k);
    if (k >= 0) setTimeout(() => {
      const el = document.getElementById('band-' + k);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 30);
  };

  return (
    <div id="landing" role="dialog" aria-label="Welcome" className={started ? 'hidden' : ''}>
      <div id="land-scroll" className="gl">

        {/* ---- masthead ---- */}
        <header className="gl-mast">
          <div className="gl-wrap gl-mast-in">
            <div className="gl-brand">
              <span className="gl-tri" aria-hidden="true"><i /><i /><i /></span>
              <span>Walk Through Time</span>
            </div>
            <div className="gl-switch" role="group" aria-label="Choose your version of history">
              {IS_LEDGER
                ? <><a href={MAIN_WALK_URL} className="lnk">↩ The Record · 1526–1947</a><span className="on">The Ledger · 2014–today</span></>
                : <><span className="on">The Record · 1526–1947</span><button onClick={() => store.set({ bhaktOpen: true })}>For Andhbhakts ↗</button></>}
            </div>
            <nav className="gl-nav">
              <a href="#promenade">Plates</a>
              <a href="#stations">Floor plan</a>
              <a href="#ledger-callout">Ledger</a>
              <button className="gl-btn-navy sm" disabled={!ready} onClick={() => begin(null)}>
                {ready ? 'Begin the Walk' : (load.msg || 'Preparing…')}
              </button>
            </nav>
          </div>
          <div className="gl-inlay" aria-hidden="true" />
        </header>

        {/* ---- plaza hero: the chakra turns behind the plaza ---- */}
        <section className="gl-hero">
          <div className="gl-plaza" aria-hidden="true">
            <div className="gl-plaza-in">
              <div className="ring saffron" /><div className="ring green" />
              <div className="ring thin a" /><div className="ring thin b" />
              <div className="gl-rays" />
              <svg className="gl-chakra" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="5" />
                <circle cx="50" cy="50" r="7" fill="currentColor" />
                <g stroke="currentColor" strokeWidth="2">
                  {Array.from({ length: 24 }, (_, i) => {
                    const a = i * Math.PI / 12;
                    return <line key={i} x1="50" y1="50" x2={(50 + 40 * Math.sin(a)).toFixed(2)} y2={(50 - 40 * Math.cos(a)).toFixed(2)} />;
                  })}
                </g>
              </svg>
            </div>
          </div>

          <div className="gl-wrap gl-hero-grid">
            <div>
              <div className="gl-kicker">{IS_LEDGER ? 'The documented corridor · Every plate has its papers' : 'A memorial promenade · Public domain'}</div>
              {IS_LEDGER
                ? <h1>A Cockroach's<br />Questions</h1>
                : <h1>The Independence<br />Struggle</h1>}
              <div className="gl-range"><span>{RANGE}</span><span className="bar" aria-hidden="true" /></div>
              <p className="gl-lede">
                {IS_LEDGER
                  ? <>{ALL.length - 1} matters of the present era, walked the same way as the four centuries before them:
                      a year inlaid in the floor, a photograph behind glass, and beside each one its papers — the audit,
                      the judgment, the filing, the answer in Parliament. {LEDGER_LINKS} documents. Not one forward.</>
                  : <>{ALL.length} milestones inlaid in stone, from Babur's cannon at Panipat to the marble plaza at
                      midnight. {PLATES.length} of them hang behind glass in era-built frames — sandstone arches, colonial
                      pediments, plain white slabs — and you can walk the whole corridor end to end.</>}
              </p>
              <div className="gl-cta">
                <button className="gl-btn-navy" disabled={!ready} onClick={() => begin(null)}
                        style={{ '--pct': `${ready ? 100 : load.pct}%` }}>
                  <span className="fill" aria-hidden="true" />
                  <span className="lbl">{ready ? 'Begin the Walk' : (load.msg || 'Preparing…')}</span>
                </button>
                <a className="gl-btn-paper" href="#promenade">Walk the {PLATES.length} plates ↓</a>
              </div>
              {jumpIdx >= 0 && (
                <button className="gl-resume" onClick={() => begin(jumpS)}>
                  {jumpTag} {TIMELINE[jumpIdx].year} · {TIMELINE[jumpIdx].title}
                </button>
              )}
              {error && <div className="err">{error} You can still read the full timeline —
                use the “Skip to text timeline” link at the top of the page.</div>}
              <dl className="gl-stats">
                {[[String(ALL.length), 'Stations'], [String(PLATES.length), 'Plates behind glass'],
                  ['05', 'Eras of floor'], [String(YEARS_WALKED), 'Years walked']].map(([n, l]) => (
                  <div key={l}><dt>{n}</dt><dd>{l}</dd></div>
                ))}
              </dl>
            </div>

            <figure className="gl-heroframe">
              <div className="gl-glass">
                <img src={PHOTOS[HERO.id].url} alt={PHOTOS[HERO.id].title} />
                <span className="sheen" aria-hidden="true" />
              </div>
              <figcaption>
                <div className="gl-tag"><span className="saffron" aria-hidden="true" />
                  <span>Plate {HERO.no} · Era {HERO_ERA} · Station {HERO.station}</span></div>
                <div className="gl-cap-title">{HERO.title}</div>
                <p>Behind glass at the marble plaza · {PHOTOS[HERO.id].credit}</p>
              </figcaption>
            </figure>
          </div>
        </section>

        {/* ---- the promenade rail ---- */}
        <section id="promenade" className="gl-rail-sec">
          <div className="gl-wrap">
            <div className="gl-sec-head">
              <div>
                <div className="gl-kicker">The corridor · {PLATES.length} plates</div>
                <h2>Walk the path, or jump to an era</h2>
                <p>The floor changes colour as you go: warm sandstone through the Mughal courtyards, dust and
                   slate as the Company arrives, scorched red at 1857, then pale stone brightening into the plaza of 1947.</p>
              </div>
              <div className="gl-count">On the wall<br /><b>{shown.length}</b> of {PLATES.length}</div>
            </div>
            <div className="gl-rail" role="group" aria-label="Jump to an era">
              {[{ k:-1, roman:'All eras', short:'The whole walk', years:RANGE.replace(' — ', '–'), count:PLATES.length, bg:'#26356e', fg:'#f0ead9' }]
                .concat(ERAS.map((e, k) => ({ k, roman:'Era ' + e.roman, short:e.short, years:e.years,
                  count:PLATES.filter(p => p.zone === k).length, bg:e.bg, fg:e.fg })))
                .map(r => (
                  <button key={r.k} onClick={() => pickEra(r.k)}
                          className={era === r.k ? 'on' : ''}
                          style={{ background:r.bg, color:r.fg }}>
                    <span className="r">{r.roman}</span>
                    <span className="t">{r.short}</span>
                    <span className="y">{r.years} · {r.count}</span>
                  </button>
                ))}
            </div>
            <div className="gl-markers">{RANGE_MARKERS.map(m => <span key={m}>{m}</span>)}</div>
          </div>
        </section>

        {/* ---- era bands ---- */}
        {bands.map(b => (
          <section key={b.k} id={'band-' + b.k} className={'gl-band' + (b.open ? ' open' : '')} style={{ background:b.bg }}>
            <div className="gl-inlay big" aria-hidden="true" />
            <div className="gl-wrap">
              <button className="gl-band-head" style={{ borderColor:b.rule, color:b.fg }}
                      aria-expanded={b.open} onClick={() => pickEra(b.open ? -1 : b.k)}>
                <div className="gl-band-title">
                  <span className="gl-medal" style={{ borderColor:b.rule }} aria-hidden="true"><i style={{ background:b.rule }} /></span>
                  <div>
                    <div className="gl-kicker" style={{ color:b.sub }}>Era {b.roman} · {b.years} · {b.plates.length} plates</div>
                    <h3 style={{ color:b.fg }}>{b.name}</h3>
                  </div>
                </div>
                <div className="gl-band-note" style={{ color:b.sub }}>
                  {b.note}<span className="gl-band-cta">{b.open ? 'Close the corridor ↑' : 'Enter the corridor ↓'}</span>
                </div>
              </button>
              {b.open && <div className="gl-plates">
                {b.plates.map(p => {
                  const scorch = p.id === 'revolt-1857';
                  const f = FRAME[b.kind];
                  return (
                    <button key={p.id} className={'gl-plate' + (scorch ? ' scorch' : '')}
                            onClick={() => setLb(PLATES.findIndex(x => x.id === p.id))}>
                      <span className="pic" style={{ border:f.frame, borderRadius:f.radius }}>
                        <img src={PHOTOS[p.id].url} alt={p.title} loading="lazy" />
                        <span className="sheen" aria-hidden="true" />
                      </span>
                      <span className="acc" style={{ background:p.accent }} />
                      <span className="meta">
                        <span className="cat">PL. {p.no} · Station {p.station}</span>
                        <span className="yr">{p.year}</span>
                        <span className="tt">{p.title}</span>
                      </span>
                    </button>
                  );
                })}
              </div>}
            </div>
          </section>
        ))}

        {/* ---- plaza close ---- */}
        <section className="gl-close">
          <div className="gl-wrap narrow">
            <div className="gl-tri lg" aria-hidden="true"><i /><i /><i /></div>
            <h2>The corridor opens into the plaza</h2>
            <p>{IS_LEDGER
              ? 'At the end of this walk too the walls fall away, the floor turns to white marble bearing the Ashoka Chakra, and the tricolour stands — over the plaza where the citizens now stand. Every plate you just read is hung along the way, with its papers.'
              : 'At the end of the walk the walls fall away, the floor turns to white marble bearing the Ashoka Chakra, and the tricolour stands at midnight. Every plate you just read is hung along the way.'}</p>
            <button className="gl-btn-navy" disabled={!ready} onClick={() => begin(null)}>Begin the Walk · {IS_LEDGER ? '2014' : '1526'}</button>
          </div>
        </section>

        {/* ---- floor plan ---- */}
        <section id="stations" className="gl-plan">
          <div className="gl-wrap">
            <div className="gl-kicker">Floor plan · {ALL.length} stations</div>
            <h2>Every year plate on the walkway</h2>
            <p className="gl-sub">Each station's year is inlaid in the floor. Enter at any one of them and the walk begins there.</p>
            <div className="gl-plan-grid">
              {ERAS.map((e, k) => (
                <div key={k}>
                  <div className="gl-plan-head"><span className="r">{e.roman}</span><span>{e.name}</span></div>
                  <ul>
                    {ALL.filter(s => s.zone === k).map(s => (
                      <li key={s.id}>
                        <button disabled={!ready} onClick={() => beginAtStation(s.i)}>
                          <span className="yr">{s.year}</span>
                          <span className="tt">{s.title}</span>
                          <span className="dot" aria-hidden="true" style={{ opacity: s.photo ? 1 : .32 }} />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <p className="gl-legend">Filled inlay · photograph behind glass &nbsp;&nbsp; Pale inlay · drawn vignette</p>
          </div>
        </section>

        {/* ---- the Ledger callout ---- */}
        <section id="ledger-callout" className="gl-ledger">
          <div className="gl-wrap gl-ledger-grid">
            <div>
              {IS_LEDGER ? <>
                <div className="gl-kicker gold">The other section · 1526 – 1947</div>
                <h2>Nobody handed anybody freedom.</h2>
                <p>Four hundred and twenty-one years of people were jailed, shot, starved and hanged for the thing
                   you were born holding. That walk is on the other page — {ALL.length > 20 ? '' : 'forty-eight stations, forty-four photographs, '}public domain.
                   This one is what a citizen does with the freedom afterwards.</p>
                <div className="gl-cta"><a className="gl-btn-gold" href={MAIN_WALK_URL}>↩ Walk 1526 → 1947</a>
                  <button className="gl-btn-paper" onClick={() => store.set({ ledgerOpen: true })}>Read the Ledger</button></div>
              </> : <>
                <div className="gl-kicker gold">The other section · 2014 – present</div>
                <h2>A Cockroach's Questions</h2>
                <p>The walk ends at midnight, 1947. Accountability doesn't end anywhere. In a democracy, questioning
                   the government is not disloyalty — it is the duty this archive was built to remind you of. The
                   Republic's Ledger documents the present era only through what the official record says: audit
                   reports, court judgments, regulatory filings, parliamentary answers.</p>
                <div className="gl-cta">
                  <a className="gl-btn-gold" href={LEDGER_WALK_URL}>Walk 2014 → today →</a>
                  <button className="gl-btn-paper" onClick={() => store.set({ ledgerOpen: true })}>Read the Ledger</button>
                  <button className="gl-btn-paper" onClick={() => store.set({ bhaktOpen: true })}>For Andhbhakts ↗</button>
                </div>
              </>}
            </div>
            <div className="gl-facts">
              {[[String(LEDGER_LINKS), 'Verified source links'], ['2014', 'Record begins'], ['0', 'Claims without a document']].map(([n, l]) => (
                <div key={l}><b>{n}</b><span>{l}</span></div>
              ))}
            </div>
          </div>
        </section>

        {/* ---- credits ---- */}
        <footer className="gl-foot">
          <div className="gl-wrap gl-foot-grid">
            <div>
              <div className="gl-tri" aria-hidden="true"><i /><i /><i /></div>
              <p>{IS_LEDGER
                ? <>All {PLATES.length} images are free-licence works from Wikimedia Commons (Creative Commons and GODL-India),
                     downloaded rather than hotlinked, with the required attribution shown on every plate. Where no photograph
                     of the exact subject exists, the caption says what the image is. Corrections with sources are welcome.</>
                : <>All {PLATES.length} images are public-domain works from Wikimedia Commons, downloaded rather than
                     hotlinked, with per-plate attribution shown in the walk. Corrections with sources are welcome.</>}</p>
            </div>
            <div className="gl-keys">
              <div>Scroll or arrow keys to walk</div>
              <div>Click a plate to step before it</div>
              <div>Click any monument to circle it</div>
              <div>N / P jump between stations · Esc steps back</div>
            </div>
          </div>
          <div className="gl-wrap gl-foot-line">A tribute for Independence Day · The history is a tribute; the ledger is a set of questions</div>
        </footer>
      </div>

      {/* ---- lightbox ---- */}
      {cur && (
        <div className="gl-lb" role="dialog" aria-modal="true" onClick={() => setLb(-1)}>
          <div className="gl-lb-in" onClick={e => e.stopPropagation()}>
            <div className="gl-lb-pic">
              <span className="gl-glass">
                <img src={PHOTOS[cur.id].url} alt={PHOTOS[cur.id].title} />
                <span className="sheen" aria-hidden="true" />
              </span>
            </div>
            <div className="gl-lb-txt">
              <div className="acc" style={{ background:cur.accent }} />
              <div className="gl-kicker">Plate {cur.no} · Station {cur.station} · Era {ERAS[cur.zone].roman}</div>
              <div className="yr">{cur.year}</div>
              <h3>{cur.title}</h3>
              <hr />
              <p>{cur.summary}</p>
              {cur.details && <p className="det">{cur.details}</p>}
              <p className="cred">{ERAS[cur.zone].name} · {PHOTOS[cur.id].credit}</p>
              <div className="gl-lb-cta">
                <button className="gl-btn-navy" disabled={!ready} onClick={() => { setLb(-1); beginAtStation(cur.i); }}>Walk to this station →</button>
                <button className="gl-btn-paper" onClick={() => setLb(-1)}>Close</button>
              </div>
              <div className="gl-lb-nav">
                <button onClick={() => step(-1)}>← Previous</button>
                <button onClick={() => step(1)}>Next plate →</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

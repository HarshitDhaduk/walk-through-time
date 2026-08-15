import { useStore, store } from '../store.js';
import { engine } from '../scene/engine.js';
import { TIMELINE, STATION_S, ZONES } from '../data/timeline.js';

/* "At First Light" — the landing reads as the flag, structurally:
   a saffron dawn hero, ivory daylight sections, a deep-green footer.
   The Ashoka Chakra rises like the sun behind the monument skyline —
   the one proud emblem — and the page scrolls from night into day,
   the way the walk itself moves from 1526 to the midnight of 1947.
   Hero has exactly one job: Begin the Walk.                        */

const ERAS = ZONES.map((z, k) => {
  const first = TIMELINE.find(t => t.zone === k);
  const [num, name] = z.name.split(' · ');
  return { num, name, year: first.year.slice(0, 4), s: k === 0 ? null : z.s0 };
});

/* the procession — five moments from the walk, hung as a strip */
const STRIP = [
  ['shahjahan-1628', '1628'], ['plassey-1757', '1757'], ['revolt-1857', '1857'],
  ['dandi-1930', '1930'], ['independence-1947', '1947'],
];

const FEATURES = [
  ['45 stations, 1526 → 1947',
   'Every milestone of four centuries — each with its year inlaid in the floor and a real public-domain photograph or painting hung behind glass.'],
  ['Walk around the monuments',
   'The Taj, Raigad, the Jhansi statue, India Gate and more stand along the path — click any of them and the camera slowly circles it while its story is told.'],
  ['Or be carried through',
   'Press Tour and drift station to station at museum pace, turning to face each picture — ending in a slow circle of the tricolour at midnight.'],
];

function onHeroMove(e){
  const el = e.currentTarget;
  el.style.setProperty('--px', ((e.clientX / innerWidth)  * 2 - 1).toFixed(3));
  el.style.setProperty('--py', ((e.clientY / innerHeight) * 2 - 1).toFixed(3));
}

function scrollToNext(){
  const sc = document.getElementById('land-scroll');
  const d  = document.getElementById('land-strip');
  if (sc && d) sc.scrollTo({ top: d.offsetTop - 8, behavior: 'smooth' });
}

export default function Landing(){
  const { load, ready, error, started, resume, hashIdx } = useStore();

  const jumpIdx = hashIdx >= 0 ? hashIdx : (resume ? resume.idx : -1);
  const jumpS   = hashIdx >= 0 ? STATION_S[hashIdx] : (resume ? resume.s : null);
  const jumpTag = hashIdx >= 0 ? '→ Begin at' : '↪ Resume at';

  return (
    <div id="landing" role="dialog" aria-label="Welcome"
         className={started ? 'hidden' : ''} onPointerMove={onHeroMove}>

      {/* fixed dawn: stars above, the chakra-sun on the horizon,
          monument skyline, green earth band */}
      <div id="dawn" aria-hidden="true">
        <div className="stars" />
        <div className="dawn-core">
          <div className="sun-halo" />
          <svg className="chakra-sun" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="3.2" />
            <circle cx="50" cy="50" r="8" fill="currentColor" />
            <g stroke="currentColor" strokeWidth="1.9">
              {Array.from({ length: 24 }, (_, i) => {
                const a = i * Math.PI / 12;
                return <line key={i} x1="50" y1="50"
                  x2={50 + 43.5 * Math.sin(a)} y2={50 - 43.5 * Math.cos(a)} />;
              })}
            </g>
          </svg>
        </div>
        <svg className="skyline" viewBox="0 0 1200 200" preserveAspectRatio="xMidYMax slice">
          <path fill="currentColor" d="M0 200 V148 h16 v-11 h12 v11 h16 v-11 h12 v11 h16 v-11 h12 v11 h16 V200 Z
            M110 200 V118 q0 -26 22 -26 q22 0 22 26 V200 Z M129 92 v-16 l7 -6 l7 6 v16 Z
            M310 200 V128 h14 V96 q0 -10 8 -10 q8 0 8 10 v32 h60 V110 q10 -34 38 -34 q28 0 38 34 v18 h60 V96 q0 -10 8 -10 q8 0 8 10 v32 h14 V200 Z
            M306 200 V86 h7 V200 Z M551 200 V86 h7 V200 Z M303 86 l6.5 -9 l6.5 9 Z M548 86 l6.5 -9 l6.5 9 Z
            M660 200 V132 h10 V124 h16 v8 h10 V200 Z M720 200 V132 h10 V124 h16 v8 h10 V200 Z
            M820 200 V88 h44 V128 h-6 q-16 -22 -32 0 h-6 Z M886 200 V72 h48 V200 Z M956 200 V88 h44 V128 h-6 q-16 -22 -32 0 h-6 Z
            M900 72 h20 v-10 h-20 Z
            M1060 200 V150 q16 -22 40 0 V200 Z M1076 150 v-18 h8 v18 Z
            M1160 200 V64 h4 V200 Z M1164 66 h22 v14 h-22 Z" />
        </svg>
        <div className="earth" />
      </div>

      {/* the scrollable page: night → day as you go down */}
      <div id="land-scroll">
        <section className="land-hero">
          <div className="ribbon" aria-hidden="true"><i /><i /><i /></div>
          <div className="eyebrow">India · 1526 – 1947</div>
          <h1>Walk Through Time
            <span className="years">Four centuries. One path. Freedom at first light.</span>
          </h1>
          <p className="tag">
            A 3D walk from Babur's cannon at Panipat to the stroke of the
            midnight hour — every step a year of the story.
          </p>
          <button id="start-btn" disabled={!ready} onClick={() => engine.begin(null)}
                  style={{ '--pct': `${ready ? 100 : load.pct}%` }}>
            <span className="sb-fill" aria-hidden="true" />
            <span className="sb-label" aria-live="polite">
              {ready ? 'Begin the Walk' : (load.msg || 'Preparing…')}
            </span>
          </button>
          {jumpIdx >= 0 && (
            <button id="resume-btn" onClick={() => engine.begin(jumpS)}>
              {jumpTag} {TIMELINE[jumpIdx].year} · {TIMELINE[jumpIdx].title}
            </button>
          )}
          {error && <div className="err">{error} You can still read the full timeline —
            use the “Skip to text timeline” link at the top of the page.</div>}
          <button className="scroll-cue" onClick={scrollToNext}
                  aria-label="Scroll for more — the walk is scroll-driven too">
            <span>Scroll — that's how you'll walk</span>
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
              <path d="M4 8l8 8 8-8" fill="none" stroke="currentColor" strokeWidth="2.4"
                    strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </section>

        {/* daylight begins: the procession strip */}
        <section id="land-strip" className="land-day land-sec">
          <div className="tri-rule" aria-hidden="true"><i /><i /><i /></div>
          <h2>Forty-five moments hang along the path</h2>
          <p className="sec-sub">Real photographs and paintings, public domain, behind glass.</p>
          <div className="strip" aria-hidden="true">
            {STRIP.map(([id, yr], i) => (
              <figure key={id} className="strip-ph" style={{ '--tilt': `${(i % 2 ? 1 : -1) * (1.2 + i * .3)}deg` }}>
                <span style={{ backgroundImage: `url(images/${id}.jpg)` }} />
                <figcaption>{yr}</figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section id="land-doors" className="land-day land-sec">
          <h2>Enter at any era</h2>
          <p className="sec-sub">The walk begins in 1526 — or step in at the doorway you came for.</p>
          <div className="doors">
            {ERAS.map((e, k) => (
              <button key={k} className="door" disabled={!ready}
                      onClick={() => engine.begin(e.s)}
                      aria-label={`Enter at ${e.name}, ${e.year}`}>
                <i className="door-num">{e.num}</i>
                <b>{e.year}</b>
                <span>{e.name}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="land-day land-sec">
          <h2>What you'll find</h2>
          <div className="feats">
            {FEATURES.map(([t, d], k) => (
              <div key={k} className="feat"><b>{t}</b><p>{d}</p></div>
            ))}
          </div>
        </section>

        {/* the second section of the site: the record of the present era */}
        <section id="land-ledger" className="land-sec">
          <div className="tri-rule" aria-hidden="true"><i /><i /><i /></div>
          <div className="ledger-kicker">The other section</div>
          <h2>And after 1947? The Republic's Ledger</h2>
          <p className="sec-sub">
            The walk ends at midnight, 1947. Accountability doesn't end anywhere. A companion
            section documents the present era, 2014 to today — its controversies told only
            through what the official record says: audit reports, court judgments, regulatory
            filings, parliamentary answers, every claim linked to its source.
          </p>
          <button id="ledger-toggle" onClick={() => store.set({ ledgerOpen: true })}>
            Open the Ledger →
          </button>
        </section>

        <footer className="land-end">
          <div className="controls-line">
            Scroll or arrow keys to walk · Click a card or picture to step before it ·
            Click again for full view · N / P jump between stations · Esc steps back
          </div>
          <div className="tribute">
            A tribute for Independence Day · All photographs public domain · Wikimedia Commons
          </div>
        </footer>
      </div>
    </div>
  );
}

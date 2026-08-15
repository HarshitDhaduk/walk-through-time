import { useEffect, useRef } from 'react';
import { useStore, store } from '../store.js';
import { LEDGER, LEDGER_META } from '../data/ledger.js';

/* THE REPUBLIC'S LEDGER — a separate section of the site with its own
   home page: the record of the current era, 2014 to the present, told
   through audits, judgments, filings and parliamentary answers.

   Design intent: this is the walk's opposite. The walk is warm and
   monumental; the Ledger is cool, printed, evidentiary — a ledger.
   Every entry: neutral summary, status badge, the official record with
   verified links, and where a court spoke, its recorded words.      */

const BADGE = {
  adjudicated: ['Court ruling', 'b-adj'],
  audited:     ['Official audit', 'b-aud'],
  alleged:     ['Allegations — pending', 'b-alg'],
  ongoing:     ['Under investigation', 'b-ong'],
  disputed:    ['Officially contested', 'b-dis'],
};

const stats = (() => {
  const links = LEDGER.reduce((n, e) => n + e.records.filter(r => r.url).length, 0);
  const rulings = LEDGER.filter(e => e.status === 'adjudicated').length;
  return { entries: LEDGER.length, links, rulings };
})();

function jumpTo(id){
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export default function Ledger(){
  const { ledgerOpen } = useStore();
  const closeRef = useRef(null);

  useEffect(() => {
    if (!ledgerOpen) return;
    closeRef.current && closeRef.current.focus();
    const onKey = e => { if (e.key === 'Escape') store.set({ ledgerOpen: false }); };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, [ledgerOpen]);

  if (!ledgerOpen) return null;

  return (
    <div id="ledger" role="dialog" aria-modal="true" aria-label={LEDGER_META.title}>
      <button id="ledger-close" ref={closeRef}
              onClick={() => store.set({ ledgerOpen: false })}>← Back to the Walk</button>

      {/* the section's own home: a printed-ledger hero */}
      <header className="ledger-hero">
        <div className="ledger-hero-in">
          <div className="ledger-kicker">{LEDGER_META.range} · A companion to the Walk</div>
          <h2>{LEDGER_META.title}</h2>
          <p className="ledger-preamble">{LEDGER_META.preamble}</p>
          <div className="ledger-stats" aria-label="What this record contains">
            <div><b>{stats.entries}</b><span>documented matters</span></div>
            <div><b>{stats.links}</b><span>verified source links</span></div>
            <div><b>{stats.rulings}</b><span>court rulings</span></div>
          </div>
          <div className="ledger-cta">
            <button className="ledger-go" onClick={() => jumpTo('ledger-list')}>Read the record ↓</button>
            <button className="ledger-go alt" onClick={() => jumpTo('ledger-method')}>How it was compiled</button>
          </div>
        </div>
      </header>

      <div className="ledger-inner">
        <section id="ledger-method" className="ledger-method-box">
          <b>Method</b>
          <p>{LEDGER_META.method}</p>
          <p>Every link was fetched and checked on {LEDGER_META.verifiedAsOf}. Where a primary
             document could not be retrieved (some government sites block automated access),
             the entry links a reputable report of it and says so. Where a court declined to
             find wrongdoing, or later cleared someone, the entry says that too — the record
             is only worth reading if it cuts both ways.</p>
          <p className="ledger-legend">
            {Object.entries(BADGE).map(([k, [label, cls]]) => (
              <span key={k} className={`le-badge ${cls}`}>{label}</span>
            ))}
          </p>
        </section>

        <ol id="ledger-list" className="ledger-list">
          {LEDGER.map((e, i) => {
            const [label, cls] = BADGE[e.status] || ['Record', ''];
            return (
              <li key={i} className="ledger-entry">
                <div className="le-head">
                  <span className="le-year">{e.year}</span>
                  <h3>{e.title}</h3>
                  <span className={`le-badge ${cls}`}>{label}</span>
                </div>
                <p className="le-summary">{e.summary}</p>

                {e.remarks && e.remarks.length > 0 && (
                  <div className="le-remarks">
                    <b>On the record</b>
                    {e.remarks.map((r, k) => (
                      <blockquote key={k}>
                        <p>“{r.quote}”</p>
                        <footer>
                          — {r.who}, {r.date}{r.context ? ` · ${r.context}` : ''}
                          {r.url && <> · <a href={r.url} target="_blank" rel="noopener noreferrer">source</a></>}
                        </footer>
                      </blockquote>
                    ))}
                  </div>
                )}

                <div className="le-docs">
                  <b>The official record</b>
                  <ul>
                    {e.records.map((r, k) => (
                      <li key={k}>
                        <span className="le-body">{r.body}</span>
                        {r.url
                          ? <a href={r.url} target="_blank" rel="noopener noreferrer">{r.title}</a>
                          : <span className="le-pending">{r.title} — link pending verification</span>}
                        <span className="le-find"> · {r.date} · {r.finding}</span>
                      </li>
                    ))}
                  </ul>
                  {e.press && e.press.length > 0 && (
                    <p className="le-press">Reporting:{' '}
                      {e.press.map((p, k) => (
                        <span key={k}>
                          {k > 0 && ' · '}
                          <a href={p.url} target="_blank" rel="noopener noreferrer"
                             title={p.title}>{p.outlet}</a>
                        </span>
                      ))}
                    </p>
                  )}
                  {e.note && <p className="le-note">{e.note}</p>}
                </div>
              </li>
            );
          })}
        </ol>

        <footer className="ledger-foot">
          <p>Compiled from public records; links verified {LEDGER_META.verifiedAsOf}.
             Allegations are allegations until a court rules. Corrections with sources are welcome.</p>
          <button className="ledger-go alt" onClick={() => store.set({ ledgerOpen: false })}>
            ← Back to the Walk, 1526 – 1947
          </button>
        </footer>
      </div>
    </div>
  );
}

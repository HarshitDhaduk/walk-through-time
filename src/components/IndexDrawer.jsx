import { useEffect } from 'react';
import { useStore, store } from '../store.js';
import { engine } from '../scene/engine.js';
import { TIMELINE, ZONES } from '../data/timeline.js';

export default function IndexDrawer(){
  const { indexOpen } = useStore();
  const close = () => store.set({ indexOpen: false });

  useEffect(() => {
    if (!indexOpen) return;
    const onKey = e => { if (e.key === 'Escape') close(); };
    addEventListener('keydown', onKey);
    return () => removeEventListener('keydown', onKey);
  }, [indexOpen]);

  return (
    <>
      {indexOpen && <div id="index-backdrop" onClick={close} />}
      <nav id="index" className={indexOpen ? 'open' : ''} aria-label="Station index">
        <button className="idx-close" aria-label="Close index" onClick={close}>✕ Close</button>
        <h2>Walk Through Time — Index</h2>
        {ZONES.map((z, zi) => (
          <div key={z.name}>
            <div className="zone-h">{z.name}</div>
            {TIMELINE.map((st, i) => st.zone === zi && (
              <button key={st.id} className="stn"
                      onClick={() => { engine.goToStation(i); close(); }}>
                <span className="dot" style={{ background: st.accent }} />
                <span className="yr">{st.year}</span><span>{st.title}</span>
              </button>
            ))}
          </div>
        ))}
      </nav>
    </>
  );
}

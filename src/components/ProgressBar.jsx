import { useMemo } from 'react';
import { TIMELINE, STATION_S, SPAN, MARKER_YEARS } from '../data/timeline.js';
import { engine } from '../scene/engine.js';
import { uiRefs } from '../bridge.js';

export default function ProgressBar(){
  const markers = useMemo(() => MARKER_YEARS.map(y => {
    const idx = TIMELINE.findIndex(t => t.year === y || t.year.startsWith(y));
    return idx >= 0 ? { y, idx, p: STATION_S[idx] / SPAN } : null;
  }).filter(Boolean), []);

  return (
    <nav id="progress" aria-label="Timeline navigation">
      <button className="pstep" id="prev-stn" aria-label="Previous station"
              onClick={() => engine.stepStation(-1)}>‹</button>
      <div className="track">
        <div className="fill"  ref={el => { uiRefs.fill  = el; }} />
        <div className="thumb" ref={el => { uiRefs.thumb = el; }} />
        {markers.map(m => (
          <button key={m.y} className="marker" style={{ left: `${m.p * 100}%` }}
                  aria-label={`Jump to ${m.y} — ${TIMELINE[m.idx].title}`}
                  onClick={() => engine.goToStation(m.idx)}>
            <span>{m.y}</span>
          </button>
        ))}
      </div>
      <button className="pstep" id="next-stn" aria-label="Next station"
              onClick={() => engine.stepStation(1)}>›</button>
    </nav>
  );
}

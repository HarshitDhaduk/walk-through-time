import { useState } from 'react';
import { useStore, store } from '../store.js';
import { TIMELINE, ZONES } from '../data/timeline.js';
import { WALK } from '../data/walk.js';
import { PHOTOS } from '../data/photos.js';
import { cardImage, stationArt } from '../art/vignettes.js';

function Entry({ st }){
  const rec = PHOTOS[st.id];
  const [broken, setBroken] = useState(false);
  return (
    <li style={{ '--dot': st.accent }}>
      <span className="t-year">{st.year}</span>
      <span className="t-era">{st.flashback ? 'flashback · ' : ''}{ZONES[st.zone].name}</span>
      <h3>{st.title}</h3>
      <img className="t-art" alt={rec ? rec.title : ''} loading="lazy"
           src={broken ? stationArt(st) : cardImage(st)}
           onError={() => setBroken(true)} />
      <div className="t-credit">{rec && !broken ? rec.credit : ''}</div>
      <p>{st.summary}</p>
      <p className="t-details">{st.details}</p>
    </li>
  );
}

export default function TextTimeline(){
  const { timelineOpen } = useStore();
  return (
    <section id="text-timeline" role="region" aria-label="Text timeline" tabIndex={-1}
             className={timelineOpen ? 'open' : ''}
             onKeyDown={e => { if (e.key === 'Escape') store.set({ timelineOpen: false }); }}>
      <div className="inner">
        <button id="close-timeline" onClick={() => store.set({ timelineOpen: false })}>
          Return to the 3D walk ↩
        </button>
        <h2>{WALK.key === 'ledger' ? 'Timeline: The Republic’s Ledger' : 'Timeline: Mughal Empire & British Rule in India'}</h2>
        <p className="sub">{WALK.range} · Plain-text version of every station on the walkway.</p>
        <ol id="timeline-list">
          {TIMELINE.map(st => <Entry key={st.id} st={st} />)}
        </ol>
      </div>
    </section>
  );
}

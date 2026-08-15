import { useState } from 'react';
import { useStore } from '../store.js';
import { engine } from '../scene/engine.js';
import { uiRefs } from '../bridge.js';
import { TIMELINE } from '../data/timeline.js';
import { PHOTOS } from '../data/photos.js';
import { cardImage, stationArt } from '../art/vignettes.js';

/* One station card. Position/opacity/label-mode are driven per-frame by
   the engine through the ref; React owns only the content. Expansion is
   class-based so the engine can force-collapse hidden cards. */
function Card({ stationIdx }){
  const st = TIMELINE[stationIdx];
  const rec = PHOTOS[st.id];
  const [broken, setBroken] = useState(false);

  return (
    <article
      className={`card${st.flashback ? ' flashback' : ''}`}
      tabIndex={0}
      aria-label={`${st.year} — ${st.title}`}
      ref={el => {
        if (el) uiRefs.cardByStation[stationIdx] = el;
        else if (uiRefs.cardByStation[stationIdx]) delete uiRefs.cardByStation[stationIdx];
      }}
      style={{ opacity: 0 }}
      onClick={() => engine.focusStation(stationIdx)}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); engine.focusStation(stationIdx); }
      }}>
      <img className="card-art" alt={rec ? rec.title : ''}
           src={broken ? stationArt(st) : cardImage(st)}
           onError={() => setBroken(true)} />
      <div className="card-credit">{rec && !broken ? rec.credit : ''}</div>
      <div className="card-year" style={{ color: st.accent }}>{st.year}</div>
      <h3>{st.title}</h3>
      <p className="summary">{st.summary}</p>
      <p className="details">{st.details}</p>
      <button className="more" aria-label="Toggle details"
              onClick={e => { e.stopPropagation(); e.currentTarget.closest('.card').classList.toggle('expanded'); }} />
    </article>
  );
}

export default function Cards(){
  const { cardSlots } = useStore();
  return (
    <div id="cards">
      {cardSlots.map(stationIdx =>
        stationIdx != null &&
          <Card key={TIMELINE[stationIdx].id} stationIdx={stationIdx} />)}
    </div>
  );
}

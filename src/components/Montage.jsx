import { useMemo } from 'react';
import { useStore } from '../store.js';
import { TIMELINE } from '../data/timeline.js';
import { WALK } from '../data/walk.js';
import { cardImage } from '../art/vignettes.js';

/* Glimpses of the whole journey while the camera circles the flag.
   Two stacked imgs alternate the `on` class for the crossfade, exactly
   like the pre-React implementation. */
export default function Montage(){
  const { montage } = useStore();
  const list = useMemo(() => TIMELINE.filter(t => t.prop !== 'finale'), []);
  if (!montage.active) return null;

  const n = list.length;
  const cur  = list[montage.idx % n];
  const prev = list[(montage.idx - 1 + n) % n];
  const curIsA = montage.idx % 2 === 0;
  const a = curIsA ? cur : prev, b = curIsA ? prev : cur;

  return (
    <div id="montage" aria-hidden="true">
      <div className="m-head">{WALK.range} · glimpses of the journey</div>
      <div className="m-stage">
        <img className={`m-a${curIsA ? ' on' : ''}`} src={cardImage(a)} alt="" />
        <img className={`m-b${curIsA ? '' : ' on'}`} src={cardImage(b)} alt="" />
      </div>
      <div className="m-cap"><b>{cur.year}</b><span>{cur.title}</span></div>
    </div>
  );
}

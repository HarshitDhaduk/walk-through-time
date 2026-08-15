import { useStore, store } from '../store.js';
import { TIMELINE } from '../data/timeline.js';
import { PHOTOS } from '../data/photos.js';
import { cardImage } from '../art/vignettes.js';

export default function Lightbox(){
  const { lightbox } = useStore();
  if (lightbox == null) return null;
  const st = TIMELINE[lightbox];
  const rec = PHOTOS[st.id];
  const close = () => store.set({ lightbox: null });

  return (
    <div id="lightbox" role="dialog" aria-label="Picture view" onClick={close}>
      <figure>
        <img src={cardImage(st)} alt={rec ? rec.title : st.title} />
        <figcaption>
          <strong>{st.year} — {st.title}</strong>
          <span>{rec ? `${rec.title} · ${rec.credit}` : 'Commemorative illustration'}</span>
        </figcaption>
      </figure>
      <button id="lb-close" aria-label="Close picture" onClick={close}>✕</button>
    </div>
  );
}

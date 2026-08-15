import { useStore } from '../store.js';

/* Caption shown while the camera circles a clicked monument or prop. */
export default function ExploreCaption(){
  const { explore } = useStore();
  if (!explore) return null;
  return (
    <div id="explore-cap" role="status">
      <b>{explore.name}</b>
      <span>{explore.blurb}</span>
      <i>click again — or press Esc — to walk on</i>
    </div>
  );
}

import { useStore, store } from '../store.js';

export default function Hud(){
  const { zone, year, started } = useStore();
  return (
    <header id="hud" aria-hidden={!started}>
      {/* the zone name doubles as the index trigger; key remount replays
          the fade-in on each era change */}
      <button id="zone-label" key={zone} title="Open the station index"
              onClick={() => store.set({ indexOpen: true })}>
        {zone} <span className="zl-caret">▾</span>
      </button>
      <div id="year-readout">{year}</div>
    </header>
  );
}

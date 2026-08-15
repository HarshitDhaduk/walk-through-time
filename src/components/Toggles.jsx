import { useStore } from '../store.js';
import { engine } from '../scene/engine.js';

export default function Toggles(){
  const { tourOn, audioOn, started } = useStore();
  return (
    <>
      {started && (
        <button id="home-btn" title="Return to the start screen"
                onClick={() => engine.goHome()}>
          ⌂ Home
        </button>
      )}
      <button id="tour-toggle" aria-pressed={tourOn}
              title="Guided walk through all 45 stations"
              onClick={() => engine.setTour(!tourOn)}>
        {tourOn ? '❚❚ Tour' : '▶ Tour'}
      </button>
      <button id="audio-toggle" aria-pressed={audioOn}
              title="Toggle ambient audio"
              onClick={() => engine.toggleAudio()}>
        {audioOn ? '🔊 Ambience' : '🔇 Ambience'}
      </button>
    </>
  );
}

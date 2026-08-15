import { useEffect, useRef } from 'react';
import { engine } from './scene/engine.js';
import { uiRefs } from './bridge.js';
import { store } from './store.js';
import Landing from './components/Landing.jsx';
import Hud from './components/Hud.jsx';
import Toggles from './components/Toggles.jsx';
import Cards from './components/Cards.jsx';
import ProgressBar from './components/ProgressBar.jsx';
import IndexDrawer from './components/IndexDrawer.jsx';
import Lightbox from './components/Lightbox.jsx';
import Montage from './components/Montage.jsx';
import ExploreCaption from './components/ExploreCaption.jsx';
import TextTimeline from './components/TextTimeline.jsx';
import Ledger from './components/Ledger.jsx';

export default function App(){
  const canvasRef = useRef(null);

  useEffect(() => { engine.start(canvasRef.current); }, []);

  return (
    <>
      <a className="skip-link" href="#text-timeline"
         onClick={e => { e.preventDefault(); store.set({ timelineOpen: true }); }}>
        Skip to text timeline
      </a>
      <canvas id="scene" ref={canvasRef} aria-hidden="true" />
      <Cards />
      <Hud />
      <Toggles />
      <ProgressBar />
      <IndexDrawer />
      <Montage />
      <ExploreCaption />
      <Lightbox />
      <Landing />
      <TextTimeline />
      <Ledger />
      <div id="scroll-space" ref={el => { uiRefs.spacer = el; }} />
    </>
  );
}

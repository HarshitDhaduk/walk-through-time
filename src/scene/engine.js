// The walk engine: renderer, camera choreography (walk / gallery focus /
// guided tour / finale orbit), input, deep links, and the per-frame loop.
// React owns the DOM; this module owns the scene and writes UI state
// through the store (low-frequency) and bridge refs (per-frame).
import * as THREE from 'three';
import { TIMELINE, STATION_S, SPAN, ZONES, S_CROWNST, FLAG_S } from '../data/timeline.js';
import { state, REDUCED, MOBILE, smooth, pointAt, PATHLEN, FLAG_POS } from './shared.js';
import { createWorld } from './world.js';
import { createStations } from './stations.js';
import { ambience } from '../audio/ambience.js';
import { track } from '../audio/track.js';
import { store } from '../store.js';
import { uiRefs } from '../bridge.js';

const CARD_POOL = MOBILE ? 1 : 3;
const MONTAGE_N = TIMELINE.filter(t => t.prop !== 'finale').length;
const clamp = THREE.MathUtils.clamp;

let renderer, scene, camera, world, sta;   // sta = stations bundle
let scrollMax = 1;
let booted = false;

/* ============================ helpers ============================ */
const nextFrame = () => new Promise(r => setTimeout(r, 16));   // rAF stalls in hidden tabs
const setLoad = (pct, msg) => store.set({ load: { pct, msg } });

function scrollToS(s){
  setTour(false);                       // any jump means the visitor took over
  window.scrollTo({ top: (s / SPAN) * scrollMax, behavior: 'auto' });
  // set the target directly rather than waiting for the scroll event —
  // the focus-exit check reads it on the very next frame
  state.target = clamp(s / SPAN, 0, 1);
}

function focusStation(idx){
  const stn = sta.stations[idx];
  if (!stn || !stn.viewPos) return;     // the finale has no framed picture
  if (state.focusIdx === idx){ state.focusIdx = -1; return; }
  state.focusIdx = idx; state.focusStn = stn;
  scrollToS(stn.s);                     // step up to the artwork
}

function stepStation(dir){
  const sCam = state.progress * SPAN;
  let target;
  if (dir > 0) target = STATION_S.find(s => s > sCam + 1.5);
  else for (let i = STATION_S.length - 1; i >= 0; i--)
    if (STATION_S[i] < sCam - 1.5){ target = STATION_S[i]; break; }
  if (target !== undefined) scrollToS(target);
}

function openLightbox(st){ store.set({ lightbox: TIMELINE.indexOf(st) }); }

/* Ambience button: the walk's soundtrack when a file is present in
   public/audio/ (looping on the free walk), else the synth ambience. */
track.onstop = () => store.set({ audioOn: false });   // the song ran out (end of a tour)
function toggleAudio(){
  track.init();
  let on;
  if (track.ok){
    if (track.playing()){ track.stop(); on = false; }
    else {
      on = track.play(tour.on);          // during a tour, start from the top…
      track.loop = !tour.on;             // …and let it end with the tour; else repeat
      if (on && tour.on) paceTourToTrack();
    }
  } else on = ambience.toggle();
  store.set({ audioOn: on });
  return on;
}

/* ==================== explore (click a 3D element) ====================
   Clicking any registered prop or monument steps the camera off the
   path to circle it slowly, with a caption. Click again, click empty
   ground, press Esc, or walk away to release it.                    */
let exploreEntry = null, exploreA = 0, exploreDist = 3, exploreS = 0;
const exploreCenter = new THREE.Vector3();
function setExplore(entry){
  if (entry === exploreEntry) entry = null;            // second click toggles off
  if (!entry){
    if (exploreEntry){ exploreEntry = null; store.set({ explore: null }); }
    return;
  }
  setTour(false);
  state.focusIdx = -1;
  const box = new THREE.Box3().setFromObject(entry.root);
  const size = box.getSize(new THREE.Vector3());
  box.getCenter(exploreCenter);
  exploreCenter.y = box.min.y + size.y * .55;
  exploreDist = clamp(Math.max(size.x, size.y, size.z) * 1.2 + .9, 2, 30);
  // begin the circle from the walker's own bearing — no sideways jump
  exploreA = Math.atan2(camera.position.z - exploreCenter.z, camera.position.x - exploreCenter.x);
  exploreS = state.target * SPAN;
  exploreEntry = entry;
  store.set({ explore: { name: entry.name, blurb: entry.blurb } });
}

/* ==================== guided tour ==================== */
const tour = { on: false, dwellUntil: 0, lastDwell: -1, releaseAt: 0, pace: 1 };
/* pace the rest of the tour so it lands at the plaza as the song ends:
   remaining time at pace 1 is walking (3.4 m/s) plus the dwells ahead,
   and both scale by 1/pace, so pace = t₁ / song length.               */
function paceTourToTrack(){
  if (!track.ok || !sta) return;
  const sNow = state.progress * SPAN;
  let t1 = Math.max(0, SPAN - sNow) / 3.4;
  for (const stn of sta.stations) if (stn.s > sNow + .8) t1 += stn.viewPos ? 5.4 : 2.2;
  tour.pace = clamp(t1 / Math.max(track.playLen, 30), .4, 4);
}
function setTour(on){
  if (tour.on === on) return;
  tour.on = on; tour.lastDwell = -1; tour.dwellUntil = 0; tour.releaseAt = 0;
  tour.pace = 1;
  if (on){
    // the soundtrack scores the tour: restart it and match the two runtimes
    if (track.play(true)){ track.loop = false; paceTourToTrack(); store.set({ audioOn: true }); }
  } else if (track.playing()) track.loop = true;   // back to the free walk: repeat
  store.set({ tourOn: on });
}

/* ==================== deep links & resume ==================== */
function stationFromHash(){
  const id = decodeURIComponent(location.hash.slice(1));
  return TIMELINE.findIndex(t => t.id === id);
}
let lastHashIdx = -1;
function rememberPlace(nearest, sCam){
  if (nearest === lastHashIdx) return;
  lastHashIdx = nearest;
  try { history.replaceState(null, '', '#' + TIMELINE[nearest].id); } catch {}
  try { localStorage.setItem('walkPos', String(Math.round(sCam))); } catch {}
}

function begin(atS){
  state.started = true;
  store.set({ started: true });
  document.body.style.overflow = '';
  if (atS != null){
    state.intro = 0;
    scrollToS(atS);
    state.progress = state.target = atS / SPAN;   // arrive in place, no fly-through
  } else if (REDUCED){
    state.intro = 0;
  }                                                // else tick eases the intro glide
}

/* ==================== per-frame UI writes ==================== */
const _proj = new THREE.Vector3(), _view = new THREE.Vector3();
let lastSlotsKey = '';
function updateCards(sCam){
  const ranked = sta.stations.map(stn => ({ stn, d: Math.abs(stn.s - sCam) }))
                             .sort((a, b) => a.d - b.d).slice(0, CARD_POOL)
                             .sort((a, b) => a.stn.i - b.stn.i);
  const key = ranked.map(r => r.stn.i).join(',');
  if (key !== lastSlotsKey){ lastSlotsKey = key; store.set({ cardSlots: ranked.map(r => r.stn.i) }); }

  const placed = [];                                   // screen rects already taken
  // nearest-first for collision priority; station-index tie-break keeps
  // the winner deterministic when two stations are equidistant
  [...ranked].sort((a, b) => (a.d - b.d) || (a.stn.i - b.stn.i)).forEach(r => {
    const el = uiRefs.cardByStation[r.stn.i]; if (!el) return;
    const worldD = camera.position.distanceTo(r.stn.anchor);
    let show = state.started && worldD < 9 && r.stn.s > sCam - 10 && state.finaleW < .5
               && state.exploreT < .5;                 // the caption replaces cards while circling
    // standing before a picture, only its own label stays up
    if (state.galleryG > .5 && r.stn.i !== state.focusIdx) show = false;
    _view.copy(r.stn.anchor).applyMatrix4(camera.matrixWorldInverse);
    if (_view.z > -1) show = false;                    // behind (or beside) the camera
    _proj.copy(r.stn.anchor).project(camera);
    // standing before the picture, the card becomes a wall label
    const asLabel = r.stn.i === state.focusIdx && state.galleryG > .25;
    el.classList.toggle('label-mode', asLabel);

    if (!MOBILE){
      let x = ( _proj.x * 0.5 + 0.5) * innerWidth;
      let y = (-_proj.y * 0.5 + 0.5) * innerHeight;
      const hw = (el.offsetWidth || 300) / 2, hh = el.offsetHeight || 200;
      if (asLabel){
        const gg = clamp((state.galleryG - .25) / .5, 0, 1);
        x += (r.stn.sideSign > 0 ? 1 : -1) * (hw + 150) * gg;   // step aside from the artwork
        y += (hh * .45) * gg;
      }
      x = clamp(x, hw + 12, innerWidth - hw - 12);
      y = clamp(y, hh + 62, innerHeight - 90);
      if (show){                                       // two cards never stack
        const box = { l: x - hw, r: x + hw, t: y - hh, b: y };
        if (placed.some(p => box.l < p.r && box.r > p.l && box.t < p.b && box.b > p.t)) show = false;
        else placed.push(box);
      }
      const lift = show ? 0 : 14;
      el.style.transform = `translate(-50%,-100%) translate(${x.toFixed(1)}px,${(y - 18 + lift).toFixed(1)}px)`;
    }
    el.style.opacity = show ? String(clamp((9 - worldD) / 3, 0, 1)) : '0';
    el.style.pointerEvents = show ? 'auto' : 'none';
    if (!show) el.classList.remove('expanded');
  });
}

let lastZone = -1, lastYearIdx = -1;
function updateHUD(sCam){
  const zi = ZONES.findIndex(z => sCam >= z.s0 && sCam < z.s1);
  if (zi !== lastZone && zi >= 0){ lastZone = zi; store.set({ zone: ZONES[zi].name }); }
  let nearest = 0, best = 1e9;
  for (const stn of sta.stations){ const d = Math.abs(stn.s - sCam); if (d < best){ best = d; nearest = stn.i; } }
  if (nearest !== lastYearIdx){ lastYearIdx = nearest; store.set({ year: TIMELINE[nearest].year }); }
  const p = clamp(sCam / SPAN, 0, 1);
  if (uiRefs.fill)  uiRefs.fill.style.width = (p * 100) + '%';
  if (uiRefs.thumb) uiRefs.thumb.style.left = (p * 100) + '%';
  if (state.started) rememberPlace(nearest, sCam);
}

let mActive = false, mIdx = -1;
function updateMontage(now, active){
  if (active !== mActive){
    mActive = active; mIdx = -1;
    if (!active){ store.set({ montage: { active: false, idx: 0 } }); return; }
  }
  if (!active) return;
  const i = Math.floor(now / 2.6) % MONTAGE_N;
  if (i !== mIdx){ mIdx = i; store.set({ montage: { active: true, idx: i } }); }
}

/* ==================== the render loop ==================== */
const _look = new THREE.Vector3(), _camP = new THREE.Vector3(), _aerial = new THREE.Vector3(),
      _orbit = new THREE.Vector3(), _flagLook = new THREE.Vector3(), _explore = new THREE.Vector3();
let lastS = 0, walkPhase = 0;
let orbitT0 = null, orbitA0 = 0;     // finale orbit entry anchor
const clock = new THREE.Clock();

function tick(){
  requestAnimationFrame(tick);
  const dt = Math.min(clock.getDelta(), .1);
  state.time += dt;

  // damped scroll smoothing (weighted walk feel)
  const k = REDUCED ? 1 : 1 - Math.pow(1 - .05, dt * 60);
  state.progress += (state.target - state.progress) * k;
  const sCam = state.progress * SPAN;
  const speed = Math.abs(sCam - lastS) / Math.max(dt, 1e-4); lastS = sCam;

  // GUIDED TOUR — steady stroll; at each station it faces the picture,
  // lingers, then eases back and walks on. Dwell keys off the scroll
  // position so a tour started mid-glide doesn't dwell at every station.
  if (tour.on && state.started){
    if (tour.releaseAt && state.time >= tour.releaseAt){
      state.focusIdx = -1; tour.releaseAt = 0;
    }
    if (state.time >= tour.dwellUntil){
      window.scrollBy(0, (scrollMax / SPAN) * 3.4 * tour.pace * dt);
      const sT = state.target * SPAN;
      for (const stn of sta.stations){
        if (tour.lastDwell !== stn.i && Math.abs(stn.s - sT) < .8){
          tour.lastDwell = stn.i;
          if (stn.viewPos){
            tour.dwellUntil = state.time + 5.4 / tour.pace;
            tour.releaseAt  = state.time + 3.6 / tour.pace;
            state.focusIdx = stn.i; state.focusStn = stn;
          } else tour.dwellUntil = state.time + 2.2 / tour.pace;
          break;
        }
      }
    }
    if (state.target > .998){ setTour(false); track.loop = false; }   // journey's end — the song finishes with the flag
  }

  // how deep into the plaza ending we are (0..1)
  state.finaleW = smooth(clamp((sCam - (SPAN - 6)) / 5.2, 0, 1));

  // CAMERA PATH
  pointAt(sCam, _camP);

  // GALLERY FOCUS — manual: released by walking on, clicking again, or Esc
  if (state.focusIdx >= 0 && Math.abs(state.target * SPAN - sta.stations[state.focusIdx].s) > 5){
    state.focusIdx = -1;
  }
  const gGoal = state.focusIdx >= 0 ? 1 : 0;
  if (REDUCED) state.focusT = gGoal;
  else if (state.focusT < gGoal) state.focusT = Math.min(gGoal, state.focusT + dt / 1.7);
  else if (state.focusT > gGoal) state.focusT = Math.max(gGoal, state.focusT - dt / 1.7);
  const g = smooth(state.focusT);
  state.galleryG = g;

  const bobAmp = REDUCED ? 0
    : 0.02 * clamp(speed / 4, 0, 1) * (1 - g * .85) * (1 - state.finaleW);
  walkPhase += dt * (2.2 + speed * .35);
  _camP.y = 1.7 + Math.sin(walkPhase) * bobAmp;

  pointAt(Math.min(sCam + 7, PATHLEN - 0.1), _look);
  const endLift = smooth(clamp((sCam - (SPAN - 25)) / 20, 0, 1));  // gaze rises to the flag
  _look.y = 1.55 + endLift * 2.8;

  if (g > 0 && state.focusStn && state.focusStn.viewPos){
    _camP.lerp(state.focusStn.viewPos, g * 0.9);   // step up to the picture
    _look.lerp(state.focusStn.lookPos, g);         // and face it
  }

  // EXPLORE — circle the clicked element until released
  if (exploreEntry && Math.abs(state.target * SPAN - exploreS) > 4) setExplore(null);
  const eGoal = exploreEntry ? 1 : 0;
  if (REDUCED) state.exploreT = eGoal;
  else if (state.exploreT < eGoal) state.exploreT = Math.min(1, state.exploreT + dt / 1.6);
  else if (state.exploreT > eGoal) state.exploreT = Math.max(0, state.exploreT - dt / 1.6);
  if (state.exploreT > 0){
    if (exploreEntry && !REDUCED) exploreA -= dt * .16;           // slow clockwise circle
    const eg = smooth(state.exploreT);
    _explore.set(exploreCenter.x + Math.cos(exploreA) * exploreDist,
                 Math.max(exploreCenter.y + exploreDist * .3, 1.0),
                 exploreCenter.z + Math.sin(exploreA) * exploreDist);
    _camP.lerp(_explore, eg);
    _look.lerp(exploreCenter, eg);
  }

  // FINALE ORBIT — circle the tricolour clockwise while the montage
  // plays. The orbit starts from the walker's own bearing to the flag,
  // so there is no sideways jump on entry.
  if (state.finaleW > 0){
    if (orbitT0 === null){
      orbitT0 = state.time;
      orbitA0 = Math.atan2(_camP.z - FLAG_POS.z, _camP.x - FLAG_POS.x);
    }
    const th = REDUCED ? orbitA0 : orbitA0 - (state.time - orbitT0) * .21;  // − = clockwise
    _orbit.set(FLAG_POS.x + Math.cos(th) * 11.5,
               2.7 + (REDUCED ? 0 : Math.sin(state.time * .4) * .18),
               FLAG_POS.z + Math.sin(th) * 11.5);
    _camP.lerp(_orbit, state.finaleW);
    _flagLook.set(FLAG_POS.x, 4.4, FLAG_POS.z);
    _look.lerp(_flagLook, state.finaleW);
  } else orbitT0 = null;

  // intro aerial glide (eased decay replaces the old GSAP tween)
  if (state.started && state.intro > 0 && !REDUCED)
    state.intro = Math.max(0, state.intro - dt / 2.6);
  if (state.intro > 0){
    pointAt(2, _aerial); _aerial.y = 7.5; _aerial.x += 4;
    _camP.lerp(_aerial, smooth(state.intro));
    _look.y += state.intro * 1.2;
  }
  camera.position.copy(_camP);
  camera.lookAt(_look);
  if (!REDUCED){
    camera.rotation.y -= state.mouseX * THREE.MathUtils.degToRad(3);
    camera.rotation.x -= state.mouseY * THREE.MathUtils.degToRad(2);
  }

  // ERA TRANSITIONS + quiet-station hush
  world.applyEnv(sCam);
  let hush = 0;
  for (const stn of sta.stations) if (stn.st.quiet){
    hush = Math.max(hush, smooth(Math.max(0, 1 - Math.abs(stn.s - sCam) / 11)));
  }
  if (hush > 0){
    world.sun.intensity  *= 1 - 0.55 * hush;
    world.hemi.intensity *= 1 - 0.35 * hush;
    scene.fog.far = THREE.MathUtils.lerp(scene.fog.far, 54, hush * .8);
  }
  world.sky.position.copy(camera.position);       // the dome always surrounds the walker
  if (!REDUCED) world.clouds.rotation.y = state.time * .0045;     // slow drift
  // THE WATER TANK bursts as the walker comes up on it — a ~4 s sequence:
  // crack opens → tank drops and tilts, a stilt buckles → the wreck rises
  // across the road as rubble → the jet sheets out → the flood runs down
  // the tarmac and the dry potholes downhill fill, nearest first.
  const rig = world.tankRig;
  if (rig){
    if (rig.t < 1 && sCam > rig.s - 12) rig.t = Math.min(1, rig.t + dt / (REDUCED ? .01 : 4.2));   // fires as the tank comes into view
    const t = rig.t, e = smooth(clamp(t, 0, 1));
    const crackT = smooth(clamp(t / .18, 0, 1));                 // 0–18%: the crack opens
    const dropT  = smooth(clamp((t - .12) / .38, 0, 1));         // 12–50%: the tank comes down
    const rubbleT= smooth(clamp((t - .30) / .35, 0, 1));         // 30–65%: rubble across the road
    const jetT   = clamp((t - .15) / .25, 0, 1);                 // 15–40%: the jet
    const floodT = smooth(clamp((t - .35) / .65, 0, 1));         // 35–100%: the flood + potholes
    rig.crack.material.opacity = crackT * .95; rig.crack.scale.x = .2 + crackT * 1.4;
    rig.tank.position.y = rig.restH - dropT * 6.4;
    rig.tank.rotation.z = -dropT * .95; rig.tank.rotation.x = dropT * .3;
    rig.tank.position.x += 0;                                     // stays over its stilts, then falls road-ward:
    rig.tank.position.z = dropT * 1.6;                            // falls road-ward, ahead
    if (rig.buckle){ rig.buckle.rotation.z = dropT * .8; rig.buckle.position.y = 3.5 - dropT * 1.2; }
    rig.rubble.position.y = -3.5 + rubbleT * 3.55;
    rig.rubble.rotation.y = rubbleT * .25;
    rig.jet.visible = jetT > 0 && t < .95;
    rig.jet.material.opacity = jetT * (1 - clamp((t - .7) / .25, 0, 1)) * .75;
    rig.jet.scale.y = .2 + jetT * .8;
    rig.flood.visible = floodT > 0;
    rig.flood.material.opacity = floodT * .55;
    rig.flood.scale.y = .1 + floodT * 22;                         // the sheet runs ~22 m down the road
    rig.flood.position.z = rig.flood.scale.y / 2 + 2.5;          // runs down the road ahead, past the wreck
  }
  world.sun.position.set(_camP.x + 18, 32, _camP.z + 12);
  world.sun.target.position.set(_camP.x, 0, _camP.z - 8);
  world.sunDisc.position.set(_camP.x + 135, 205, _camP.z + 90);   // the visible sun, same bearing

  // celebration balloons over the 1947 plaza: they rise on the
  // midnight air, sway, and quietly begin again from low
  const ffx = sta.finaleFx;
  if (ffx && !REDUCED && sCam > FLAG_S - 130){
    ffx.balloons.forEach(b => {
      const p = b.grp.position;
      p.y += dt * b.spd;
      if (p.y > 26) p.y = 6;                    // stay in the sky, never at the urns
      p.x = b.x + Math.sin(state.time * .6 + b.ph) * .55;
      p.z = b.z + Math.cos(state.time * .5 + b.ph) * .55;
    });
  }

  // pooled accent lights on the 3 nearest stations
  const near = sta.stations.map(stn => ({ stn, d: Math.abs(stn.s - sCam) }))
                           .sort((a, b) => a.d - b.d).slice(0, world.pool.length);
  near.forEach((r, i) => {
    const L = world.pool[i];
    L.position.copy(r.stn.anchor); L.position.y = 2.6;
    L.color.set(r.stn.st.accent);
    L.intensity = clamp(1 - r.d / 20, 0, 1) * (r.stn.st.quiet ? .8 : 2.4);
  });

  // 1858 set piece: arch fades, Crown rises
  if (sta.crownFx){
    const d = Math.abs(S_CROWNST - sCam);
    const f = smooth(clamp(1 - d / 16, 0, 1));
    sta.crownFx.archMat.opacity = .8 - f * .65;
    sta.crownFx.crown.position.y = sta.crownFx.baseY + f * 1.3;
    sta.crownFx.crown.rotation.y += dt * .25;
  }
  if (sta.flagUniforms) sta.flagUniforms.uTime.value = state.time;

  // lazy picture load/release around the visitor
  for (const stn of sta.stations){
    const d = stn.s - sCam;
    if (d > -20 && d < 55) sta.ensureArt(stn);
    else if (d < -70 || d > 110) sta.releaseArt(stn);
  }

  world.updateParticles(state.time);
  updateCards(sCam);
  updateHUD(sCam);
  updateMontage(state.time, state.started && state.finaleW > .55);
  ambience.setWeights(sCam);

  try { renderer.render(scene, camera); } catch (err){ if (!tick._renderErr){ tick._renderErr = true; console.error('[render]', err); } }
}

/* ==================== input ==================== */
function installInput(canvas){
  addEventListener('scroll', () => {
    state.target = clamp(scrollMax > 0 ? scrollY / scrollMax : 0, 0, 1);
  }, { passive: true });

  addEventListener('resize', () => {
    camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
    if (uiRefs.spacer) scrollMax = uiRefs.spacer.offsetHeight - innerHeight;
  });

  addEventListener('keydown', e => {
    if (!state.started) return;
    if (store.get().timelineOpen) return;
    if (e.key === 'Escape'){
      if (store.get().lightbox != null) store.set({ lightbox: null });
      else if (exploreEntry) setExplore(null);     // step back from the element
      else state.focusIdx = -1;                    // step back from the picture
      setTour(false);
      return;
    }
    if (store.get().lightbox != null) return;      // stand still while it's open
    if (e.key === 'n' || e.key === 'N'){ stepStation(1);  return; }
    if (e.key === 'p' || e.key === 'P'){ stepStation(-1); return; }
    setTour(false);                                // walk keys hand back control
    const stepSm = 160, stepLg = innerHeight * .85;
    let dy = 0;
    switch (e.key){
      case 'ArrowDown': case 'ArrowRight': case 's': dy = stepSm;  break;
      case 'ArrowUp':   case 'ArrowLeft':  case 'w': dy = -stepSm; break;
      case 'PageDown': dy = stepLg;  break;
      case 'PageUp':   dy = -stepLg; break;
      default: return;
    }
    e.preventDefault();
    window.scrollBy({ top: dy, behavior: 'auto' });
  });

  addEventListener('pointermove', e => {
    state.mouseX = (e.clientX / innerWidth) * 2 - 1;
    state.mouseY = (e.clientY / innerHeight) * 2 - 1;
  }, { passive: true });

  addEventListener('wheel',     () => setTour(false), { passive: true });
  addEventListener('touchmove', () => setTour(false), { passive: true });

  addEventListener('hashchange', () => {
    const i = stationFromHash();
    if (i >= 0 && state.started && i !== lastHashIdx) scrollToS(STATION_S[i]);
  });

  // clicking a framed picture: step up to it; a second click opens the lightbox
  const _ray = new THREE.Raycaster(), _ndc = new THREE.Vector2();
  function pickArt(ev){
    _ndc.set((ev.clientX / innerWidth) * 2 - 1, -(ev.clientY / innerHeight) * 2 + 1);
    _ray.setFromCamera(_ndc, camera);
    const hits = _ray.intersectObjects(sta.ART_PICKS.map(p => p.mesh), false);
    if (!hits.length || hits[0].distance > 30) return null;
    return sta.ART_PICKS.find(p => p.mesh === hits[0].object);
  }
  let exploreMap = null;
  function pickExplore(ev){
    if (!exploreMap){ exploreMap = new Map(); sta.EXPLORABLES.forEach(e => exploreMap.set(e.root, e)); }
    _ndc.set((ev.clientX / innerWidth) * 2 - 1, -(ev.clientY / innerHeight) * 2 + 1);
    _ray.setFromCamera(_ndc, camera);
    const hits = _ray.intersectObjects(sta.EXPLORABLES.map(e => e.root), true);
    if (!hits.length || hits[0].distance > 40) return null;
    let o = hits[0].object;
    while (o && !exploreMap.has(o)) o = o.parent;
    return o ? exploreMap.get(o) : null;
  }
  canvas.addEventListener('click', ev => {
    if (!state.started || store.get().lightbox != null) return;
    const hit = pickArt(ev);
    if (hit){
      setExplore(null);
      const idx = TIMELINE.indexOf(hit.st);
      if (state.focusIdx === idx) openLightbox(hit.st);
      else focusStation(idx);
      return;
    }
    const ex = pickExplore(ev);
    if (ex) setExplore(ex);
    else if (exploreEntry) setExplore(null);           // clicking empty ground walks on
  });
  canvas.addEventListener('pointermove', ev => {
    if (!state.started){ canvas.style.cursor = ''; return; }
    canvas.style.cursor = (pickArt(ev) || pickExplore(ev)) ? 'pointer' : '';
  }, { passive: true });
}

/* ==================== boot ==================== */
async function start(canvas){
  if (booted) return; booted = true;               // guard double-mount
  track.init();                                    // preload the soundtrack's metadata (if a file exists)
  if (MOBILE) document.body.classList.add('mobile');
  document.body.style.overflow = 'hidden';         // locked until Begin

  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  } catch {
    store.set({ error: 'WebGL is unavailable on this device. The full text timeline below still works.' });
    return;
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio, MOBILE ? 1.5 : 2));
  renderer.setSize(innerWidth, innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(58, innerWidth / innerHeight, 0.1, 500);
  camera.rotation.order = 'YXZ';

  setLoad(14, 'Laying the path…');      await nextFrame();
  world = createWorld(scene);
  world.buildFloor();
  setLoad(38, 'Raising the arches…');   await nextFrame();
  world.buildArchitecture();
  setLoad(62, 'Placing the stations…'); await nextFrame();
  sta = createStations(scene);
  sta.buildStations();
  setLoad(80, 'Kindling the eras…');    await nextFrame();
  world.buildParticles();

  // scroll space
  if (uiRefs.spacer){
    uiRefs.spacer.style.height = Math.round(SPAN * 30 + innerHeight) + 'px';
    scrollMax = uiRefs.spacer.offsetHeight - innerHeight;
  }
  history.scrollRestoration = 'manual';
  scrollTo(0, 0);
  installInput(canvas);

  setLoad(92, 'Hanging the pictures…'); await nextFrame();
  sta.stations.slice(0, 4).forEach(sta.ensureArt);

  // deep link wins; otherwise offer to resume the last visit
  const hashIdx = stationFromHash();
  let resume = null;
  if (hashIdx < 0){
    try {
      const v = parseFloat(localStorage.getItem('walkPos'));
      if (v > 40 && v < SPAN - 12){
        let near = 0, best = 1e9;
        STATION_S.forEach((s, i) => { const d = Math.abs(s - v); if (d < best){ best = d; near = i; } });
        resume = { s: v, idx: near };
      }
    } catch {}
  }
  setLoad(100, 'Ready.');
  store.set({ ready: true, hashIdx, resume });

  renderer.render(scene, camera);
  tick();

  if (import.meta.env.DEV){          // test hook, excluded from production builds
    window.__walk = { state, engine, SPAN, scene, THREE, pointAt, renderer,
      get stations(){ return sta.stations; }, camera,
      get explorables(){ return sta.EXPLORABLES; },
      goto: s => { state.target = s / SPAN; },
      render: () => renderer.render(scene, camera),
      info: () => ({ ...renderer.info.render, ...renderer.info.memory }) };
  }
}

function goHome(){
  setTour(false);
  state.focusIdx = -1; state.focusStn = null;
  store.set({ lightbox: null, indexOpen: false, timelineOpen: false });
  // offer to pick the walk back up right where it was left
  const sCam = state.progress * SPAN;
  if (sCam > 40){
    let near = 0, best = 1e9;
    STATION_S.forEach((s, i) => { const d = Math.abs(s - sCam); if (d < best){ best = d; near = i; } });
    store.set({ resume: { s: sCam, idx: near }, hashIdx: -1 });
  }
  try { history.replaceState(null, '', location.pathname + location.search); } catch {}
  lastHashIdx = -1;
  state.started = false;
  state.target = state.progress = 0;
  state.intro = 1;                    // the aerial glide plays again on Begin
  document.body.style.overflow = 'hidden';
  scrollTo(0, 0);
  // in the 2014→today walk, home is the "For Andhbhakts" page
  const inLedger = new URLSearchParams(location.search).get('walk') === 'ledger';
  if (world.tankRig) world.tankRig.t = 0;      // the tank stands again for the next walk
  store.set({ started: false, bhaktOpen: inLedger });
}

export const engine = {
  start, begin, scrollToS, stepStation, focusStation, setTour, toggleAudio, goHome, _tour: tour,
  goToStation: i => scrollToS(Math.max(0, STATION_S[i] - 5)),   // index/marker jumps land before the plate
};

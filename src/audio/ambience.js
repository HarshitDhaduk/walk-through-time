// Synthesized ambience (sitar drone / train / soft chord), OFF by default.
import * as THREE from 'three';
import { MUGHAL_END, S_BRIT, S_CROWNST, FLAG_S } from '../data/timeline.js';

const smooth = t => t*t*(3-2*t);

export const ambience = {
  ctx: null, buses: null, on: false,
  start(){
    const A = new (window.AudioContext || window.webkitAudioContext)();
    const master = A.createGain(); master.gain.value = .5; master.connect(A.destination);
    const mkBus = () => { const g = A.createGain(); g.gain.value = 0; g.connect(master); return g; };
    const buses = { m: mkBus(), b: mkBus(), f: mkBus() };
    // — Mughal: tanpura-ish drone —
    [[110,'sawtooth',.05],[110.7,'sawtooth',.04],[165,'sine',.05],[220,'sine',.025]].forEach(([f,t,v]) => {
      const o = A.createOscillator(); o.type = t; o.frequency.value = f;
      const bp = A.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 400; bp.Q.value = 5;
      const lfo = A.createOscillator(); lfo.frequency.value = .07;
      const lfoG = A.createGain(); lfoG.gain.value = 220;
      lfo.connect(lfoG); lfoG.connect(bp.frequency);
      const g = A.createGain(); g.gain.value = v;
      o.connect(bp); bp.connect(g); g.connect(buses.m); o.start(); lfo.start();
    });
    // — British: filtered noise "distant train" with rhythmic chug —
    const nb = A.createBuffer(1, A.sampleRate*2, A.sampleRate);
    const nd = nb.getChannelData(0); let last = 0;
    for (let i=0;i<nd.length;i++){ const w = Math.random()*2-1; nd[i] = (last + .02*w)/1.02; last = nd[i]; nd[i]*=3.5; }
    const noise = A.createBufferSource(); noise.buffer = nb; noise.loop = true;
    const lp = A.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 320;
    const chug = A.createGain(); chug.gain.value = .35;
    const chugLfo = A.createOscillator(); chugLfo.type = 'square'; chugLfo.frequency.value = 2.4;
    const chugDepth = A.createGain(); chugDepth.gain.value = .16;
    chugLfo.connect(chugDepth); chugDepth.connect(chug.gain);
    noise.connect(lp); lp.connect(chug); chug.connect(buses.b); noise.start(); chugLfo.start();
    // — finale: soft major chord with slow shimmer —
    [261.6, 329.6, 392.0].forEach((f,i) => {
      const o = A.createOscillator(); o.type='sine'; o.frequency.value = f;
      const g = A.createGain(); g.gain.value = .035;
      const trem = A.createOscillator(); trem.frequency.value = .12 + i*.05;
      const tg = A.createGain(); tg.gain.value = .014;
      trem.connect(tg); tg.connect(g.gain);
      o.connect(g); g.connect(buses.f); o.start(); trem.start();
    });
    this.ctx = A; this.buses = buses;
  },
  setWeights(s){
    if (!this.ctx || !this.on) return;
    const t = this.ctx.currentTime;
    const sm = (a,b) => smooth(THREE.MathUtils.clamp((s-a)/(b-a),0,1));
    const wM = 1 - sm(MUGHAL_END + 4, MUGHAL_END + 42);
    const wB = sm(S_BRIT - 8, S_BRIT + 8) * (1 - sm(S_CROWNST + 6, S_CROWNST + 42));
    const wF = sm(FLAG_S - 60, FLAG_S - 20);
    this.buses.m.gain.setTargetAtTime(wM, t, .4);
    this.buses.b.gain.setTargetAtTime(wB, t, .4);
    this.buses.f.gain.setTargetAtTime(wF, t, .4);
  },
  toggle(){
    if (!this.ctx) this.start();
    this.on = !this.on;
    if (this.on) this.ctx.resume(); else this.ctx.suspend();
    return this.on;
  }
};

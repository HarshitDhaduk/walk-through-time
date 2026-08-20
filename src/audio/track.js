// The walk's soundtrack — an audio file the site owner drops into
// public/audio/. The repo ships none: the songs requested for the two
// walks are commercial recordings that can't be redistributed here, so
// the file is supplied (with rights) by whoever deploys the site.
// Any of these names works — the first extension that loads wins:
//   the Record (1526–1947)  → audio/freedom.(mp3|m4a|ogg|wav) — last 17 s trimmed
//   Pothole Yatra (ledger)  → audio/yatra.(mp3|m4a|ogg|wav)   — last  8 s trimmed
// Free walk: the trimmed track repeats seamlessly. Guided tour: it
// restarts from 0 and the engine paces the tour so both end together.
// With no file present, the synth ambience (ambience.js) is the fallback.
import { WALK } from '../data/walk.js';

const CONF = WALK.key === 'ledger'
  ? { base: 'audio/yatra',   trimEnd: 8 }
  : { base: 'audio/freedom', trimEnd: 17 };
const EXTS = ['mp3', 'm4a', 'ogg', 'wav'];

function build(){
  const el = document.createElement('audio');
  el.preload = 'metadata'; el.volume = 0;
  EXTS.forEach((ext, i) => {
    const s = document.createElement('source');
    s.src = `${CONF.base}.${ext}`;
    // the <source> chain fails silently until the last one errors
    if (i === EXTS.length - 1) s.addEventListener('error', () => { track.ok = false; });
    el.appendChild(s);
  });
  el.addEventListener('loadedmetadata', () => {
    track.ok = isFinite(el.duration) && el.duration > CONF.trimEnd + 10;
  });
  el.addEventListener('timeupdate', () => {
    if (el.duration && el.currentTime >= el.duration - CONF.trimEnd - .05){
      if (track.loop) el.currentTime = 0;                     // seamless repeat before the tail
      else { el.pause(); el.currentTime = 0; track.onstop && track.onstop(); }
    }
  });
  el.addEventListener('ended', () => { el.currentTime = 0; track.onstop && track.onstop(); });
  return el;
}

export const track = {
  el: null, ok: false, loop: true, _fade: null,
  onstop: null,                       // engine hook: the song ran out on its own
  init(){ if (!this.el) this.el = build(); },
  /* seconds of music actually heard per pass — duration minus the trim */
  get playLen(){ return this.ok ? this.el.duration - CONF.trimEnd : 0; },
  playing(){ return !!this.el && !this.el.paused; },
  play(fromStart){
    this.init(); if (!this.ok) return false;
    if (fromStart || this.el.currentTime >= this.el.duration - CONF.trimEnd - .5) this.el.currentTime = 0;
    this.el.play().catch(() => {});
    this._fadeTo(.55);
    return true;
  },
  stop(){
    if (!this.el || this.el.paused) return;
    this._fadeTo(0, () => this.el.pause());
  },
  _fadeTo(v, done){
    clearInterval(this._fade); const a = this.el;
    this._fade = setInterval(() => {
      const d = v - a.volume;
      if (Math.abs(d) < .05){ a.volume = v; clearInterval(this._fade); done && done(); }
      else a.volume = clamp01(a.volume + Math.sign(d) * .05);
    }, 50);
  },
};
const clamp01 = x => Math.min(1, Math.max(0, x));

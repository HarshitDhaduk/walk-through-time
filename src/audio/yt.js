// The walk's soundtrack via the official YouTube IFrame Player API —
// the licensed way to play the two songs: nothing is downloaded, the
// stream comes from YouTube with the rights holders' monetization and
// attribution intact. Per YouTube's API terms the player must stay
// visible and unobscured while it plays, so a dock at that exact minimum
// (200×200) sits in the bottom-left corner whenever the music is on.
//   the Record (1526–1947)  → "Tiranga" (Yodha) — last 17 s cut
//   Pothole Yatra (ledger)  → "Bol Ke Lab Azad Hain" (Manto) — last 8 s cut
// A watchdog enforces the trim: on the free walk it seeks back to 0 just
// before the tail (a gapless repeat), on the guided tour it stops there,
// and the engine has paced the tour to land with it. A local file in
// public/audio/ (track.js) always takes precedence over the embed.
import { WALK } from '../data/walk.js';

/* trim: seconds cut off the end of the video, whatever its length —
   Tiranga is 4:34, minus 17 s → the music ends at 4:17; Bol Ke Lab
   Azad Hain is 3:54, minus 8 s → 3:46. fall = playLen fallback until
   the player has reported the real duration.                        */
const CONF = WALK.key === 'ledger'
  ? { id: 'v22ah78e9ME', trim: 8,  fall: 226 }
  : { id: 'l71aOtTJ1gE', trim: 17, fall: 257 };

let dock = null, player = null, ready = false, failed = false, ended = false, watch = 0;
const endAt = () => {
  const d = ready ? player.getDuration() : 0;
  return d > CONF.trim + 10 ? d - CONF.trim : CONF.fall;
};

/* The trim and the repeat are enforced here rather than left to the
   ENDED event: endSeconds only fires once the player reaches it, which
   a buffering stall or a throttled tab can miss, and reloading the video
   to repeat re-buffers audibly. Polling the clock and seeking back to 0
   loops without a gap and keeps the tail cut in every case. endSeconds
   stays set as a hard backstop if this timer is ever starved.        */
function startWatch(){
  clearInterval(watch);
  watch = setInterval(() => {
    if (!ready || failed || !player.getCurrentTime) return;
    if (player.getCurrentTime() < endAt() - .25) return;
    if (yt.loop) player.seekTo(0, true);            // repeat, before the tail
    else finish();
  }, 250);
}
function finish(){
  clearInterval(watch); watch = 0;
  ended = true;
  player.pauseVideo();
  dock.classList.remove('on');
  yt.onstop && yt.onstop();
}

function makeDock(){
  dock = document.createElement('div');
  dock.id = 'yt-dock';
  const slot = document.createElement('div');
  dock.appendChild(slot);
  document.body.appendChild(dock);
  return slot;
}

function makePlayer(){
  player = new YT.Player(makeDock(), {
    width: '200', height: '200',
    playerVars: { rel: 0, playsinline: 1 },
    events: {
      onReady: () => { ready = true; player.cueVideoById({ videoId: CONF.id, endSeconds: endAt() }); },
      onError: () => { failed = true; dock.classList.remove('on'); },
      onStateChange: e => {
        if (e.data !== 0) return;                 // 0 = ENDED (the endSeconds backstop)
        if (yt.loop){ player.seekTo(0, true); player.playVideo(); }
        else finish();
      },
    },
  });
}

export const yt = {
  loop: true, onstop: null,
  get ok(){ return ready && !failed; },
  get playLen(){ return endAt(); },
  init(){
    if (dock || failed) return;
    if (window.YT && window.YT.Player){ makePlayer(); return; }
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => { prev && prev(); makePlayer(); };
    const s = document.createElement('script');
    s.src = 'https://www.youtube.com/iframe_api';
    s.addEventListener('error', () => { failed = true; });
    document.head.appendChild(s);
  },
  playing(){
    if (!this.ok) return false;
    const st = player.getPlayerState();
    return st === 1 || st === 3;                  // PLAYING or BUFFERING
  },
  play(fromStart){
    this.init(); if (!this.ok) return false;
    dock.classList.add('on');                     // the player is visible whenever it plays
    if (fromStart || ended || player.getCurrentTime() >= endAt() - .5){
      ended = false; player.seekTo(0, true);
    }
    player.playVideo();
    player.setVolume(60);
    startWatch();
    return true;
  },
  stop(){
    if (!this.ok) return;
    clearInterval(watch); watch = 0;
    player.pauseVideo();
    dock.classList.remove('on');
  },
};

/* Browsers suspend a background tab's media, which would leave the
   Ambience button reading "on" over silence when the visitor comes back.
   Resume only what the tab interrupted — a pause the visitor made in the
   dock's own controls happens while visible, and is left alone. */
let hidPlaying = false;
document.addEventListener('visibilitychange', () => {
  if (!ready || failed) return;
  if (document.hidden) hidPlaying = yt.playing();
  else if (hidPlaying && watch){ hidPlaying = false; player.playVideo(); }
});

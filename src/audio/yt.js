// The walk's soundtrack via the official YouTube IFrame Player API —
// the licensed way to play the two songs: nothing is downloaded, the
// stream comes from YouTube with the rights holders' monetization and
// attribution intact. Per YouTube's API terms the player must stay
// visible while it plays, so a small dock appears bottom-right whenever
// the music is on (min 200×200 px, controls shown).
//   the Record (1526–1947)  → "Tiranga" (Yodha) — last 17 s cut
//   Pothole Yatra (ledger)  → "Bol Ke Lab Azad Hain" (Manto) — last 8 s cut
// The trim is done with the API's endSeconds; on the free walk the video
// reloads from 0 at the trim point (repeat), on the guided tour it ends
// there and the engine has paced the tour to land with it. A local file
// in public/audio/ (track.js) always takes precedence over the embed.
import { WALK } from '../data/walk.js';

/* trim: seconds cut off the end of the video, whatever its length —
   Tiranga is 4:34, minus 17 s → the music ends at 4:17; Bol Ke Lab
   Azad Hain is 3:54, minus 8 s → 3:46. fall = playLen fallback until
   the player has reported the real duration.                        */
const CONF = WALK.key === 'ledger'
  ? { id: 'v22ah78e9ME', trim: 8,  fall: 226 }
  : { id: 'l71aOtTJ1gE', trim: 17, fall: 257 };

let dock = null, player = null, ready = false, failed = false, ended = false;
const endAt = () => {
  const d = ready ? player.getDuration() : 0;
  return d > CONF.trim + 10 ? d - CONF.trim : CONF.fall;
};

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
    width: '320', height: '200',
    playerVars: { rel: 0, playsinline: 1 },
    events: {
      onReady: () => { ready = true; player.cueVideoById({ videoId: CONF.id, endSeconds: endAt() }); },
      onError: () => { failed = true; dock.classList.remove('on'); },
      onStateChange: e => {
        if (e.data !== 0) return;                 // 0 = ENDED (at our endSeconds trim)
        if (yt.loop) player.loadVideoById({ videoId: CONF.id, endSeconds: endAt() });
        else { ended = true; dock.classList.remove('on'); yt.onstop && yt.onstop(); }
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
    if (fromStart || ended){ ended = false; player.loadVideoById({ videoId: CONF.id, endSeconds: endAt() }); }
    else player.playVideo();
    player.setVolume(60);
    return true;
  },
  stop(){
    if (!this.ok) return;
    player.pauseVideo();
    dock.classList.remove('on');
  },
};

// Procedural miniature-painting vignettes — pure canvas, no WebGL needed.
import { PHOTOS } from '../data/photos.js';

const ARTPAL = {
  mughal:    { top:'#2e1a0c', bot:'#eaa95e', sun:'#ffd98a', sil:'#26150a', gnd:'#3a2410' },
  transition:{ top:'#3a332a', bot:'#c0b092', sun:'#eee0b6', sil:'#241c12', gnd:'#332a1e' },
  british:   { top:'#26303c', bot:'#a3b6c6', sun:'#e8eef4', sil:'#161c24', gnd:'#20272e' },
  freedom:   { top:'#3a648e', bot:'#f6ead2', sun:'#fff4d6', sil:'#1e2630', gnd:'#2a3542' },
  quiet:     { top:'#20242a', bot:'#70757c', sun:null,      sil:'#0f1216', gnd:'#181c20' },
  fire:      { top:'#200c08', bot:'#8a3620', sun:null,      sil:'#120705', gnd:'#1c0e08' },
};
const AW = 320, AH = 130, AGY = 104;   // vignette canvas & ground line
const tri  = (c,x1,y1,x2,y2,x3,y3) => { c.beginPath(); c.moveTo(x1,y1); c.lineTo(x2,y2); c.lineTo(x3,y3); c.closePath(); c.fill(); };
const cir  = (c,x,y,r) => { c.beginPath(); c.arc(x,y,r,0,7); c.fill(); };
const dome = (c,cx,by,r) => { c.beginPath(); c.arc(cx,by,r,Math.PI,0); c.fill(); c.fillRect(cx-r,by-2,2*r,3); tri(c,cx-3,by-r+2,cx+3,by-r+2,cx,by-r-9); };
const person = (c,x,by,h=22) => { cir(c,x,by-h+3.5,3.5); tri(c,x-4.5,by,x+4.5,by,x,by-h+6); };
const minar  = (c,x,by,h,w=5) => { c.fillRect(x-w/2,by-h,w,h); cir(c,x,by-h,w*.9); };
const ART = {
  cannon(c){ cir(c,160,88,13); cir(c,160,88,5);
    c.save(); c.translate(160,84); c.rotate(-.5); c.fillRect(-8,-7,66,10); c.fillRect(-18,-9,14,14); c.restore();
    cir(c,236,99,4); cir(c,245,101,4); cir(c,240,93,4); },
  banner(c,acc){ person(c,120,AGY); person(c,138,AGY,19);
    c.fillRect(180,34,3,70); c.fillStyle = acc; tri(c,183,36,225,42,183,52); },
  road(c){ c.save(); c.fillStyle='rgba(255,240,210,.25)'; tri(c,138,AH,212,AH,172,70); c.restore();
    tri(c,238,AGY,260,AGY,249,42); cir(c,249,44,6);
    c.fillRect(84,72,4,32); cir(c,86,64,12); },
  tomb(c){ c.fillRect(96,90,128,14); c.fillRect(120,62,80,30); dome(c,160,62,24);
    c.fillRect(100,72,18,20); c.fillRect(202,72,18,20); dome(c,109,72,9); dome(c,211,72,9); },
  swords(c){ c.save(); c.strokeStyle=c.fillStyle; c.lineWidth=5;
    c.beginPath(); c.arc(130,150,80,-1.35,-.55); c.stroke();
    c.beginPath(); c.arc(190,150,80,Math.PI+.55,Math.PI+1.35); c.stroke();
    c.lineWidth=7;
    c.beginPath(); c.moveTo(112,104); c.lineTo(130,112); c.stroke();
    c.beginPath(); c.moveTo(208,104); c.lineTo(190,112); c.stroke(); c.restore(); },
  gate(c,acc,p){ c.fillRect(110,42,100,62);
    c.save(); c.fillStyle=p.bot; c.beginPath(); c.moveTo(140,AGY); c.lineTo(140,74);
    c.quadraticCurveTo(140,56,160,52); c.quadraticCurveTo(180,56,180,74); c.lineTo(180,AGY);
    c.closePath(); c.fill(); c.restore();
    for (let x=116; x<=204; x+=15) dome(c,x,42,6);
    c.fillRect(96,84,14,20); c.fillRect(210,84,14,20); },
  hillfort(c,acc){ tri(c,60,AGY,180,AGY,120,54); tri(c,150,AGY,290,AGY,225,44);
    c.fillRect(200,44,50,12); for (let x=202; x<246; x+=9) c.fillRect(x,38,5,7);
    c.fillRect(224,20,2.5,18); c.fillStyle=acc; tri(c,226.5,20,252,25,226.5,31); },
  scales(c){ c.fillRect(158,40,4,64); c.fillRect(120,44,80,4);
    [124,196].forEach(x => { c.fillRect(x-1,48,2,18);
      c.beginPath(); c.arc(x,70,12,0,Math.PI); c.fill(); });
    tri(c,146,AGY,174,AGY,160,92); },
  taj(c){ c.fillRect(92,92,136,10); c.fillRect(128,66,64,26); dome(c,160,64,22);
    dome(c,136,74,8); dome(c,184,74,8); minar(c,104,92,34,4); minar(c,216,92,34,4); },
  tents(c){ tri(c,90,AGY,140,AGY,115,66); tri(c,140,AGY,205,AGY,172,56); tri(c,205,AGY,250,AGY,227,70);
    c.fillRect(171,30,2.5,28); tri(c,173.5,30,190,33.5,173.5,37); },
  khanda(c){ c.save(); c.strokeStyle=c.fillStyle; c.lineWidth=5;
    c.beginPath(); c.arc(160,66,24,0,7); c.stroke();
    c.fillRect(157,26,6,66); tri(c,157,26,163,26,160,14);
    c.beginPath(); c.arc(122,80,42,-1.1,-.1); c.stroke();
    c.beginPath(); c.arc(198,80,42,Math.PI+.1,Math.PI+1.1); c.stroke(); c.restore(); },
  ship(c){ c.save(); c.fillStyle='rgba(220,235,245,.25)'; c.fillRect(6,AGY-6,308,6); c.restore();
    c.beginPath(); c.moveTo(110,86); c.lineTo(210,86); c.lineTo(196,100); c.lineTo(122,100); c.closePath(); c.fill();
    c.fillRect(138,38,3,48); c.fillRect(176,46,3,40);
    c.save(); c.fillStyle='rgba(240,235,220,.85)'; tri(c,141,42,141,80,168,74); tri(c,179,50,179,82,200,76); c.restore();
    tri(c,138,38,138,46,152,42); },
  brokenPillar(c){ c.fillRect(120,64,22,40); tri(c,120,64,142,64,131,52);
    c.save(); c.translate(190,96); c.rotate(.25); c.fillRect(-30,-8,60,16); c.restore();
    c.fillRect(112,100,38,6); },
  scroll(c){ c.save(); c.fillStyle='rgba(238,226,196,.9)'; c.fillRect(120,52,80,44); c.restore();
    c.fillRect(114,50,8,48); c.fillRect(198,50,8,48);
    c.save(); c.strokeStyle='rgba(80,60,30,.8)'; c.lineWidth=2;
    for (let y=62; y<=86; y+=8){ c.beginPath(); c.moveTo(130,y); c.lineTo(190,y); c.stroke(); } c.restore();
    c.save(); c.fillStyle='#8d1f1f'; cir(c,186,90,6); c.restore();
    tri(c,222,98,248,60,238,100); },
  throne(c){ c.beginPath(); c.arc(160,66,26,Math.PI,0); c.fill();
    c.fillRect(134,66,52,22); c.fillRect(128,88,64,8);
    [138,178].forEach(x => c.fillRect(x,96,6,8));
    c.save(); c.fillStyle='#3fae6a'; cir(c,160,58,5); c.restore(); },
  coins(c){ const el = (x,y) => { c.beginPath(); c.ellipse(x,y,14,4,0,0,7); c.fill(); };
    for (let i=0;i<4;i++) el(140,96-i*7); for (let i=0;i<3;i++) el(172,96-i*7);
    c.fillRect(200,74,42,26); c.fillRect(196,70,50,8); },
  bowl(c){ c.beginPath(); c.moveTo(134,78); c.quadraticCurveTo(138,100,160,100);
    c.quadraticCurveTo(182,100,186,78); c.closePath(); c.fill(); c.fillRect(150,102,20,4); },
  rockets(c){ [[130,86,-.7],[160,80,-.6],[190,88,-.5]].forEach(([x,y,r]) => {
      c.save(); c.translate(x,y); c.rotate(r); c.fillRect(-3,-26,6,30); tri(c,-3,-26,3,-26,0,-36); c.restore(); });
    c.save(); c.strokeStyle='rgba(255,170,90,.7)'; c.lineWidth=2;
    [[130,86],[160,80],[190,88]].forEach(([x,y]) => { c.beginPath(); c.moveTo(x,y+6);
      c.quadraticCurveTo(x-14,y+16,x-30,y+18); c.stroke(); }); c.restore(); },
  book(c){ c.beginPath(); c.moveTo(160,60); c.lineTo(112,68); c.lineTo(112,92); c.lineTo(160,84);
    c.lineTo(208,92); c.lineTo(208,68); c.closePath(); c.fill();
    c.save(); c.fillStyle='rgba(240,232,210,.9)'; c.beginPath(); c.moveTo(160,63); c.lineTo(118,70);
    c.lineTo(118,88); c.lineTo(160,81); c.lineTo(202,88); c.lineTo(202,70); c.closePath(); c.fill(); c.restore();
    c.fillRect(236,86,14,6); tri(c,236,86,250,86,243,78);
    c.save(); c.fillStyle='#ffb066'; cir(c,243,74,4); c.restore(); },
  loco(c){ c.fillRect(60,98,200,4);
    c.fillRect(96,66,86,22); c.fillRect(182,58,34,30); c.fillRect(104,50,12,18);
    [116,146,196].forEach(x => cir(c,x,92,9));
    c.save(); c.fillStyle='rgba(200,205,215,.5)'; cir(c,110,40,7); cir(c,124,32,9); cir(c,142,26,11); c.restore(); },
  fire(c){ c.fillRect(96,70,30,34); tri(c,96,70,126,70,111,56);
    c.fillRect(150,80,44,24); c.fillRect(206,64,26,40);
    c.save(); const fg = c.createLinearGradient(0,40,0,100);
    fg.addColorStop(0,'rgba(255,170,80,.95)'); fg.addColorStop(1,'rgba(200,60,20,.9)');
    c.fillStyle = fg; tri(c,140,100,168,100,154,48); tri(c,158,100,184,100,171,60);
    tri(c,128,100,150,100,139,66); c.restore(); },
  crownarch(c){ c.save(); c.globalAlpha=.35;
    c.fillRect(120,44,12,60); c.fillRect(188,44,12,60);
    c.beginPath(); c.arc(160,58,40,Math.PI,0); c.arc(160,58,28,0,Math.PI,true); c.closePath(); c.fill(); c.restore();
    c.save(); c.fillStyle='#c9a13b'; c.fillRect(140,78,40,14);
    for (let i=0;i<5;i++) tri(c,140+i*8,78,148+i*8,78,144+i*8,64); cir(c,160,60,4); c.restore(); },
  crownrays(c){ c.save(); c.strokeStyle='rgba(255,240,200,.5)'; c.lineWidth=3;
    for (let i=0;i<9;i++){ const a=Math.PI*(1.1+i*.1);
      c.beginPath(); c.moveTo(160+30*Math.cos(a),70+30*Math.sin(a));
      c.lineTo(160+70*Math.cos(a),70+70*Math.sin(a)); c.stroke(); } c.restore();
    c.save(); c.fillStyle='#c9a13b'; c.fillRect(134,70,52,16);
    for (let i=0;i<6;i++) tri(c,134+i*10,70,144+i*10,70,139+i*10,52); cir(c,160,46,5); c.restore(); },
  assembly(c,acc){ c.fillRect(104,74,112,30); dome(c,160,74,26); c.fillRect(96,100,128,4);
    c.save(); c.fillStyle='rgba(240,235,220,.7)'; [118,140,180,202].forEach(x => c.fillRect(x,80,6,20)); c.restore();
    c.fillRect(220,44,2.5,30); c.fillStyle=acc; tri(c,222.5,44,244,48.5,222.5,54); },
  bonfire(c){ [-.4,.4].forEach(r => { c.save(); c.translate(160,98); c.rotate(r); c.fillRect(-24,-4,48,7); c.restore(); });
    c.save(); const fg = c.createLinearGradient(0,50,0,98);
    fg.addColorStop(0,'rgba(255,190,90,.95)'); fg.addColorStop(1,'rgba(210,90,30,.9)'); c.fillStyle = fg;
    tri(c,142,96,178,96,160,50); tri(c,150,96,186,96,172,64); tri(c,134,96,166,96,148,66); c.restore();
    c.fillRect(210,84,26,18); c.fillRect(206,80,34,6); },
  crescent(c){ c.fillRect(118,78,84,26); dome(c,160,78,22); minar(c,106,AGY,44,4); minar(c,214,AGY,44,4);
    c.save(); c.strokeStyle=c.fillStyle; c.lineWidth=3;
    c.beginPath(); c.arc(160,40,8,.7,5.6); c.stroke(); cir(c,167,37,1.8); c.restore(); },
  soldiers(c){ [110,140,170,200].forEach(x => { person(c,x,AGY,24); c.fillRect(x+3,AGY-32,2,14); });
    c.save(); c.fillStyle='rgba(220,60,60,.55)'; [120,155,188].forEach(x => cir(c,x,AGY+12,2.5)); c.restore(); },
  garden(c){ c.fillRect(84,56,60,48); c.fillRect(176,56,60,48);
    c.fillRect(156,88,12,6); c.fillRect(150,94,24,4);
    c.save(); c.fillStyle='#ffb066'; tri(c,158,88,166,88,162,76); c.restore(); },
  charkha(c){ c.save(); c.strokeStyle=c.fillStyle; c.lineWidth=4;
    c.beginPath(); c.arc(140,76,26,0,7); c.stroke();
    for (let i=0;i<8;i++){ const a=i*Math.PI/4; c.beginPath(); c.moveTo(140,76);
      c.lineTo(140+24*Math.cos(a),76+24*Math.sin(a)); c.stroke(); }
    c.beginPath(); c.arc(206,88,9,0,7); c.stroke();
    c.lineWidth=2; c.beginPath(); c.moveTo(140,50); c.lineTo(206,79); c.stroke(); c.restore();
    c.fillRect(116,100,116,5); },
  flagraise(c){ c.fillRect(196,26,3,78);
    c.save(); c.fillStyle='#e98c2f'; c.fillRect(199,26,34,7);
    c.fillStyle='#f2ede2'; c.fillRect(199,33,34,7);
    c.fillStyle='#2c7a45'; c.fillRect(199,40,34,7);
    c.fillStyle='#26356e'; cir(c,216,36.5,2.8); c.restore();
    person(c,150,AGY,22); person(c,168,AGY,20); },
  saltmarch(c){ [96,118,140,162].forEach(x => person(c,x,AGY,18)); person(c,184,AGY,24);
    c.fillRect(191,AGY-30,2,30);
    c.save(); c.fillStyle='rgba(240,240,235,.9)'; tri(c,246,AGY,282,AGY,264,88); c.restore();
    c.save(); c.strokeStyle='rgba(210,230,240,.5)'; c.lineWidth=2;
    c.beginPath(); c.moveTo(230,AGY+14); c.quadraticCurveTo(260,AGY+9,300,AGY+14); c.stroke(); c.restore(); },
  flames3(c){ c.fillRect(120,92,80,10);
    [140,160,180].forEach(x => { c.fillRect(x-6,90,12,4);
      c.save(); c.fillStyle='#ffb066'; tri(c,x-5,90,x+5,90,x,72); c.restore(); }); },
  crowd(c){ for (let i=0;i<9;i++){ const x=92+i*17, h=16+((i*7)%3)*4; person(c,x,AGY,h); }
    [120,168,216].forEach((x,i) => { c.fillRect(x,AGY-52,2,26);
      c.save(); c.fillStyle=['#e98c2f','#f2ede2','#2c7a45'][i]; tri(c,x+2,AGY-52,x+20,AGY-47.5,x+2,AGY-43); c.restore(); }); },
  marchflag(c){ [120,146,172].forEach(x => { person(c,x,AGY,22); c.fillRect(x+3,AGY-32,2,12); });
    c.fillRect(212,34,3,70);
    c.save(); c.fillStyle='#e98c2f'; c.fillRect(215,34,30,6);
    c.fillStyle='#f2ede2'; c.fillRect(215,40,30,6);
    c.fillStyle='#2c7a45'; c.fillRect(215,46,30,6); c.restore(); },
  freedom(c){ c.fillRect(96,30,4,74);
    const band = y0 => { c.beginPath(); c.moveTo(100,y0); c.quadraticCurveTo(140,y0-8,180,y0);
      c.quadraticCurveTo(212,y0+7,236,y0); c.lineTo(236,y0+14); c.quadraticCurveTo(212,y0+21,180,y0+14);
      c.quadraticCurveTo(140,y0+6,100,y0+14); c.closePath(); c.fill(); };
    c.save(); c.fillStyle='#e98c2f'; band(32); c.fillStyle='#f2ede2'; band(46); c.fillStyle='#2c7a45'; band(60);
    c.strokeStyle='#26356e'; c.lineWidth=1.6;
    c.beginPath(); c.arc(170,58,6,0,7); c.stroke();
    for (let i=0;i<8;i++){ const a=i*Math.PI/4; c.beginPath(); c.moveTo(170,58);
      c.lineTo(170+5.4*Math.cos(a),58+5.4*Math.sin(a)); c.stroke(); }
    c.fillStyle='#f2ede2'; cir(c,262,84,13);
    c.strokeStyle='#26356e'; c.lineWidth=2.4;
    c.beginPath(); c.moveTo(262,84); c.lineTo(262,73); c.stroke(); c.restore(); },
};
function stationArtCanvas(st){
  if (st._artCv) return st._artCv;
  const cv = document.createElement('canvas'); cv.width = AW; cv.height = AH;
  const c = cv.getContext('2d');
  const p = st.art === 'fire' ? ARTPAL.fire : (st.quiet ? ARTPAL.quiet : (ARTPAL[st.era] || ARTPAL.freedom));
  c.beginPath(); c.roundRect(0,0,AW,AH,10); c.clip();
  const g = c.createLinearGradient(0,0,0,AH);
  g.addColorStop(0,p.top); g.addColorStop(.85,p.bot);
  c.fillStyle = g; c.fillRect(0,0,AW,AH);
  if (p.sun){ c.save(); c.fillStyle = p.sun; c.globalAlpha=.9; cir(c,252,36,15);
    c.globalAlpha=.22; cir(c,252,36,27); c.restore(); }
  c.fillStyle = p.gnd; c.fillRect(0,AGY,AW,AH-AGY);
  c.fillStyle = p.sil;
  (ART[st.art] || ART.banner)(c, st.accent, p);
  c.strokeStyle = st.accent; c.globalAlpha=.85; c.lineWidth=3; c.strokeRect(4,4,AW-8,AH-8);
  c.globalAlpha=.4; c.lineWidth=1; c.strokeRect(9,9,AW-18,AH-18); c.globalAlpha=1;
  return st._artCv = cv;
}
function stationArt(st){                       // vignette as a data URL (cards, text timeline)
  return st._art || (st._art = stationArtCanvas(st).toDataURL('image/png'));
}
/* The image a card shows: the historical photograph when the station
   has one, else the procedural vignette. DOM <img> loads it straight
   from disk — independent of the 3D texture loader — and falls back
   to the vignette if the file is somehow unavailable.             */
function cardImage(st){ return PHOTOS[st.id] ? PHOTOS[st.id].url : stationArt(st); }

export { ARTPAL, AW, AH, AGY, stationArtCanvas, stationArt, cardImage };

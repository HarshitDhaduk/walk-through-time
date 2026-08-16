// Environment: lights, sky, era transitions, memorial floor, architecture, particles.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { MOBILE, WALK_W as WALK_W_SHARED, smooth as smoothShared, pointAt, sideAt, tangentAt,
         _p, _t, _side, canvasTexture, MAT, gateGeometry } from './shared.js';
import { SPACING, FIRST_S, STATION_S, sOf, S_TAJ, MUGHAL_END, S_TRANS, S_BRIT, S_REV,
         S_CROWNST, S_FREE, FLAG_S } from '../data/timeline.js';
import { WALK } from '../data/walk.js';
const SATIRE = WALK.key === 'ledger';   // the 2014→today corridor is dressed as decay

export function createWorld(scene){
  scene.fog = new THREE.Fog(0xcaa268, 12, 95);
  const hemi = new THREE.HemisphereLight(0xffdcae, 0x7a5a34, 0.8); scene.add(hemi);
  const sun  = new THREE.DirectionalLight(0xffc47e, 1.6); scene.add(sun); scene.add(sun.target);
  const pool = [0,1,2].map(() => {
    const l = new THREE.PointLight(0xffffff, 0, 18, 1.8); scene.add(l); return l; });

const C = h => new THREE.Color(h);
// Environment presets: [fog, skyTop, skyBot, hemiSky, hemiGnd, hemiI, sunC, sunI, fogNear, fogFar]
const E_DAWN  = [C('#caa268'),C('#3b2312'),C('#e8b872'),C('#ffdcae'),C('#7a5a34'),.80,C('#ffc47e'),1.60,12, 95];
const E_GOLD  = [C('#d8b276'),C('#4a2c14'),C('#f3cf8e'),C('#ffe2b8'),C('#82603a'),.90,C('#ffd08a'),1.85,12,112];
const E_GOLD2 = [C('#cfa970'),C('#452a14'),C('#eec686'),C('#ffddb0'),C('#7a5a34'),.85,C('#ffcc84'),1.70,12,105];
const E_DUST  = [C('#9c8f7a'),C('#3c352c'),C('#b3a68e'),C('#cfc4b0'),C('#4a4238'),.62,C('#d8c8a8'),1.05,10, 72];
const E_SLATE = [C('#8a99a5'),C('#2e3742'),C('#9fb0bd'),C('#bccbd8'),C('#3c444c'),.66,C('#dfe8f0'),1.25,11, 86];
const E_SLATE2= [C('#84939f'),C('#2b333d'),C('#98a8b5'),C('#b6c5d2'),C('#394148'),.62,C('#d8e2ea'),1.20,11, 82];
const E_RED   = [C('#4a241c'),C('#1d0f0d'),C('#5a2c22'),C('#7a4438'),C('#241210'),.50,C('#ff6644'),0.95, 6, 46];
const E_RED2  = [C('#54291f'),C('#221211'),C('#663228'),C('#84493c'),C('#281512'),.52,C('#ff7350'),1.00, 7, 50];
const E_SLATE3= [C('#95a2ab'),C('#333c46'),C('#aeb9c2'),C('#c2cfda'),C('#404850'),.66,C('#e2eaf2'),1.25,12, 92];
const E_LIGHT = [C('#b0bcc3'),C('#42556b'),C('#cdd8de'),C('#d5e0ea'),C('#565e66'),.74,C('#eef2f6'),1.35,13,104];
const E_BRIGHT= [C('#d5e0e6'),C('#5a7fa8'),C('#e8f0f4'),C('#f0f6fa'),C('#8b9585'),.88,C('#ffffff'),1.65,16,132];
const E_PLAZA = [C('#e9f1f5'),C('#7fb0dd'),C('#fdf6e8'),C('#ffffff'),C('#cfe0d2'),1.00,C('#fff6e0'),2.00,20,170];
const E_PLAZA2= [C('#eef4f7'),C('#8ab8e2'),C('#fdf8ec'),C('#ffffff'),C('#d5e4d8'),1.00,C('#fff8e6'),2.05,20,175];
// the 2014→today ending: not a plaza at dawn but a city under smog —
// AQI-brown sky, sun a dim coin, visibility down to a few plates
const E_SMOG  = [C('#8a7c6a'),C('#4a4038'),C('#a08e78'),C('#b8a894'),C('#3a3430'),.42,C('#c99a6a'),0.55, 5, 38];
const E_SMOG2 = [C('#6e6256'),C('#332c27'),C('#84745f'),C('#9a8b78'),C('#2c2723'),.36,C('#b8865a'),0.42, 4, 30];
// Keyframes positioned relative to the stations they belong to
const ENV_KEYS = SATIRE ? [
  [0,                       ...E_DUST],
  [S_TAJ,                   ...E_SLATE],
  [(S_TRANS + S_BRIT) / 2,  ...E_SLATE2],
  [S_REV - 3,               ...E_RED],
  [S_REV + 10,              ...E_RED2],
  [S_CROWNST + 12,          ...E_SLATE3],
  [FLAG_S - 60,             ...E_SMOG],
  [FLAG_S - 12,             ...E_SMOG2],
  [FLAG_S + 85,             ...E_SMOG2],
] : [
  [0,                       ...E_DAWN],
  [S_TAJ,                   ...E_GOLD],
  [S_TRANS - 12,            ...E_GOLD2],
  [(S_TRANS + S_BRIT) / 2,  ...E_DUST],
  [S_BRIT + 8,              ...E_SLATE],
  [S_REV - 14,              ...E_SLATE2],
  [S_REV - 3,               ...E_RED],
  [S_REV + 10,              ...E_RED2],
  [S_CROWNST + 12,          ...E_SLATE3],
  [S_FREE + 16,             ...E_LIGHT],
  [FLAG_S - 52,             ...E_BRIGHT],
  [FLAG_S - 12,             ...E_PLAZA],
  [FLAG_S + 85,             ...E_PLAZA2],
];
const smooth = t => t*t*(3-2*t);
const _envC = { fog:new THREE.Color(), skyT:new THREE.Color(), skyB:new THREE.Color(),
                hS:new THREE.Color(), hG:new THREE.Color(), sun:new THREE.Color() };
function applyEnv(s){
  let i = 0;
  while (i < ENV_KEYS.length-2 && ENV_KEYS[i+1][0] < s) i++;
  const a = ENV_KEYS[i], b = ENV_KEYS[i+1];
  const t = smooth(THREE.MathUtils.clamp((s - a[0]) / (b[0] - a[0]), 0, 1));
  _envC.fog.lerpColors(a[1], b[1], t);   _envC.skyT.lerpColors(a[2], b[2], t);
  _envC.skyB.lerpColors(a[3], b[3], t);  _envC.hS.lerpColors(a[4], b[4], t);
  _envC.hG.lerpColors(a[5], b[5], t);    _envC.sun.lerpColors(a[7], b[7], t);
  scene.fog.color.copy(_envC.fog);
  scene.fog.near = THREE.MathUtils.lerp(a[9],  b[9],  t);
  scene.fog.far  = THREE.MathUtils.lerp(a[10], b[10], t);
  hemi.color.copy(_envC.hS); hemi.groundColor.copy(_envC.hG);
  hemi.intensity = THREE.MathUtils.lerp(a[6], b[6], t);
  sun.color.copy(_envC.sun);
  sun.intensity = THREE.MathUtils.lerp(a[8], b[8], t);
  sky.material.uniforms.uTop.value.copy(_envC.skyT);
  sky.material.uniforms.uBot.value.copy(_envC.skyB);
  sunDisc.material.color.copy(_envC.sun);
  const luma = _envC.skyT.r*.3 + _envC.skyT.g*.59 + _envC.skyT.b*.11;
  stars.material.opacity = THREE.MathUtils.clamp((.13 - luma)*8, 0, 1) * .8;
  stars.visible = stars.material.opacity > .02;
  // clouds carry the sky's horizon tint; near-black skies reduce them to wisps
  cloudMat.color.copy(_envC.skyB).lerp(_envC.sun, .35).lerp(WHITE, .45);
  cloudMat.opacity = THREE.MathUtils.clamp(.12 + luma * 1.6, .06, .55);
}
const WHITE = new THREE.Color('#ffffff');

/* ---- gradient sky dome (dawn → overcast → bright day) ---- */
const sky = new THREE.Mesh(
  new THREE.SphereGeometry(380, 24, 12),
  new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite:false, fog:false,
    uniforms:{ uTop:{value:C('#3b2312')}, uBot:{value:C('#e8b872')} },
    vertexShader:`varying float vY; void main(){ vY = normalize(position).y;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader:`uniform vec3 uTop,uBot; varying float vY;
      void main(){ float t = pow(clamp(vY*.5+.5, 0., 1.), 1.35);
      gl_FragColor = vec4(mix(uBot,uTop,t), 1.0); }`
  }));
scene.add(sky);

// the sun itself — a soft billboard tinted by the era, riding the
// same bearing as the directional light
const sunTex = canvasTexture(128,128,(c,w,h) => {
  const g2 = c.createRadialGradient(64,64,4,64,64,64);
  g2.addColorStop(0,'rgba(255,255,255,1)'); g2.addColorStop(.22,'rgba(255,246,224,.95)');
  g2.addColorStop(.55,'rgba(255,224,168,.30)'); g2.addColorStop(1,'rgba(255,224,168,0)');
  c.fillStyle = g2; c.fillRect(0,0,w,h);
});
const sunDisc = new THREE.Sprite(new THREE.SpriteMaterial({
  map: sunTex, transparent:true, depthWrite:false, toneMapped:false, opacity:.85 }));
sunDisc.scale.setScalar(58);
scene.add(sunDisc);
// faint stars, revealed only when the 1857 band blackens the sky
const starGeo = new THREE.BufferGeometry();
const sp = new Float32Array(130*3);
for (let i = 0; i < 130; i++){
  const az = Math.random()*Math.PI*2, el = .15 + Math.random()*1.3, r = 350;
  sp[i*3]   = Math.cos(az)*Math.cos(el)*r;
  sp[i*3+1] = Math.sin(el)*r;
  sp[i*3+2] = Math.sin(az)*Math.cos(el)*r;
}
starGeo.setAttribute('position', new THREE.BufferAttribute(sp,3));
const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({
  color:'#ffe8d8', size:1.6, sizeAttenuation:false, transparent:true, opacity:0,
  depthWrite:false, blending:THREE.AdditiveBlending }));
sky.add(stars);                        // rides the dome, follows the camera

// drifting clouds — soft billboards on the dome, tinted by the era's
// sky and dimmed to wisps when the 1857 band darkens it
const cloudTex = canvasTexture(256, 128, (c, w, h) => {
  const blob = (x, y, r, a) => {
    const g = c.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(255,255,255,${a})`);
    g.addColorStop(.6, `rgba(255,255,255,${a*.45})`);
    g.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill();
  };
  for (let i = 0; i < 9; i++){
    const t = i / 8;
    blob(30 + t * 196 + (Math.random()-.5)*14,
         78 - Math.sin(t * Math.PI) * (16 + Math.random()*12),
         16 + Math.sin(t * Math.PI) * 20 + Math.random()*7, .34);
  }
  blob(128, 66, 52, .22);
});
const cloudMat = new THREE.SpriteMaterial({ map: cloudTex, transparent:true,
  depthWrite:false, opacity:.5, color:'#ffffff' });
const clouds = new THREE.Group();
for (let i = 0; i < 11; i++){
  const az = i * .571 + ((i * 13) % 5) * .21, el = .14 + ((i * 7) % 6) * .05;
  const cl = new THREE.Sprite(cloudMat);
  cl.position.set(Math.cos(az)*Math.cos(el)*330, Math.sin(el)*330, Math.sin(az)*Math.cos(el)*330);
  const sc = 52 + ((i * 11) % 7) * 9;
  cl.scale.set(sc, sc * (.34 + ((i * 5) % 3) * .06), 1);
  clouds.add(cl);
}
sky.add(clouds);

/* ---- floor ribbon with baked per-vertex era tints ----------------
   Colours (sandstone → dust → slate → scorched 1857 → pale stone)
   are baked once; global light/fog does the live blending.        */
const FLOOR_KEYS = SATIRE ? [
  // 2014→today: fresh tarmac at the start, worn to grey, cracked to
  // rust-brown by the middle, dust at the end — and the plaza still white
  [0,               C('#4a4a4c')], [MUGHAL_END,     C('#5b5754')],
  [(S_TRANS+S_BRIT)/2, C('#6e5f52')], [S_BRIT + 8,  C('#5c5049')],
  [S_REV - 9,       C('#584d46')], [S_REV - 4,      C('#3a2b22')],
  [S_REV + 6,       C('#3f2f26')], [S_CROWNST + 7,  C('#6a6058')],
  [S_FREE + 65,     C('#8a8178')], [FLAG_S - 56,    C('#6b625a')],
  [FLAG_S - 14,     C('#4a443f')], [FLAG_S + 85,    C('#3f3a36')],   // the plaza, unswept
] : [
  [0,               C('#c79d61')], [MUGHAL_END,     C('#cfa76b')],
  [(S_TRANS+S_BRIT)/2, C('#93866f')], [S_BRIT + 8,  C('#6a7680')],
  [S_REV - 9,       C('#5d6871')], [S_REV - 4,      C('#221310')],
  [S_REV + 6,       C('#241512')], [S_CROWNST + 7,  C('#5d6871')],
  [S_FREE + 65,     C('#9aa1a3')], [FLAG_S - 56,    C('#cfcaba')],
  [FLAG_S - 14,     C('#e6e0d0')], [FLAG_S + 85,    C('#f0ead9')],
];
const _fc = new THREE.Color();
function floorTint(s, out){
  let i = 0; while (i < FLOOR_KEYS.length-2 && FLOOR_KEYS[i+1][0] < s) i++;
  const a = FLOOR_KEYS[i], b = FLOOR_KEYS[i+1];
  const t = smooth(THREE.MathUtils.clamp((s-a[0])/(b[0]-a[0]), 0, 1));
  return (out||_fc).lerpColors(a[1], b[1], t);
}
const WALK_W = MOBILE ? 5.5 : 7;         // responsive: narrower walkway on mobile
function walkWidth(s){
  const plaza = smooth(THREE.MathUtils.clamp((s-(FLAG_S-32))/36, 0, 1)); // corridor opens into 1947 plaza
  return WALK_W + plaza * (26 - WALK_W);
}

/* ---- memorial promenade flooring --------------------------------
   Inlaid-stone texture in neutral warm greys: border bands with
   diamond inlays, grouted tiles, and a lotus-star medallion every
   8 m. Era hues come from the baked vertex tints multiplying it. */
/* the satire corridor's floor: a national highway that was inaugurated
   twice and finished never — tarmac, a fading centre line, potholes with
   puddles, patch-jobs, cracks, and one manhole with no cover           */
function makeBrokenRoadTexture(){
  const cv = document.createElement('canvas'); cv.width = 512; cv.height = 512;
  const c = cv.getContext('2d');
  c.fillStyle = '#8f8b86'; c.fillRect(0, 0, 512, 512);            // neutral tarmac (tinted per era)
  for (let i = 0; i < 2600; i++){                                   // aggregate grain
    c.fillStyle = `rgba(${20+Math.random()*40|0},${18+Math.random()*36|0},${16+Math.random()*30|0},${Math.random()*.22})`;
    c.fillRect(Math.random()*512, Math.random()*512, 2, 2);
  }
  // kerb stones both edges, half of them broken
  for (let y = 0; y < 512; y += 44){
    [0, 470].forEach(x => {
      const broken = ((x + y) * 7) % 5 === 0;
      c.fillStyle = broken ? '#7c7670' : '#c9c1b2';
      c.fillRect(x + 4, y + 3, 34, broken ? 20 : 38);
      c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(x + 4, y + 3 + (broken ? 20 : 38), 34, 3);
    });
  }
  // the centre line — dashed, fading, repainted slightly off
  c.fillStyle = 'rgba(255,240,180,.75)';
  for (let y = 0; y < 512; y += 96) c.fillRect(250, y + 10, 10, 50);
  c.fillStyle = 'rgba(255,240,180,.28)';
  for (let y = 40; y < 512; y += 96) c.fillRect(257, y + 10, 8, 40);   // the earlier, drunker coat
  // patch jobs: darker rectangles of fresher tar with lighter, lumpy edges
  [[70,60,120,80],[300,300,150,70],[110,380,90,60]].forEach(([x,y,w,h]) => {
    c.fillStyle = '#4e4a46'; c.fillRect(x, y, w, h);
    c.strokeStyle = 'rgba(200,190,170,.35)'; c.lineWidth = 6; c.strokeRect(x, y, w, h);
  });
  // cracks — random walks, alligator-cracking in one corner
  c.strokeStyle = 'rgba(25,20,16,.55)'; c.lineWidth = 2.2;
  for (let i = 0; i < 18; i++){
    let x = Math.random()*512, y = Math.random()*512;
    c.beginPath(); c.moveTo(x, y);
    for (let k = 0; k < 9; k++){ x += (Math.random()-.5)*34; y += (Math.random()-.5)*34; c.lineTo(x, y); }
    c.stroke();
  }
  c.lineWidth = 1.2;
  for (let i = 0; i < 40; i++){ const x = 330 + Math.random()*150, y = 60 + Math.random()*140;
    c.beginPath(); c.moveTo(x, y); c.lineTo(x + (Math.random()-.5)*26, y + (Math.random()-.5)*26); c.stroke(); }
  // potholes: dark ovals with a broken rim
  const hole = (x, y, rx, ry, wet) => {
    c.save(); c.translate(x, y); c.scale(1, ry/rx);
    c.fillStyle = 'rgba(30,26,22,.9)'; c.beginPath(); c.arc(0, 0, rx, 0, 7); c.fill();
    c.strokeStyle = 'rgba(70,60,50,.9)'; c.lineWidth = 6; c.stroke();
    if (wet){ c.fillStyle = 'rgba(90,110,130,.55)'; c.beginPath(); c.arc(0, 2, rx*.72, 0, 7); c.fill();
      c.fillStyle = 'rgba(255,255,255,.28)'; c.beginPath(); c.ellipse(-rx*.25, -rx*.2, rx*.28, rx*.1, -.5, 0, 7); c.fill(); }
    c.restore();
  };
  hole(160, 250, 40, 26, false); hole(400, 430, 30, 20, false); hole(80, 470, 22, 14, false);   // dry — no water anywhere on this road
  // manhole ring, no cover
  c.strokeStyle = '#3d3935'; c.lineWidth = 8; c.beginPath(); c.arc(360, 180, 30, 0, 7); c.stroke();
  c.fillStyle = 'rgba(15,12,10,.95)'; c.beginPath(); c.arc(360, 180, 24, 0, 7); c.fill();
  return cv;
}
function makeFloorTexture(){
  if (SATIRE) return makeBrokenRoadTexture();
  const cv = document.createElement('canvas'); cv.width = 512; cv.height = 512;
  const c = cv.getContext('2d');
  c.fillStyle = '#d9d0c1'; c.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 900; i++){                                   // stone mottling
    c.fillStyle = `rgba(120,105,85,${Math.random()*.05})`;
    c.fillRect(Math.random()*512, Math.random()*512, 22, 3);
  }
  // edge border bands with inlay lines
  c.fillStyle = '#bcae92'; c.fillRect(0,0,36,512); c.fillRect(476,0,36,512);
  c.fillStyle = '#93856a'; c.fillRect(36,0,5,512); c.fillRect(471,0,5,512);
  c.fillStyle = '#93856a';                                          // border diamond inlays
  for (let y = 32; y < 512; y += 64){
    [18, 494].forEach(x => { c.save(); c.translate(x,y); c.rotate(Math.PI/4); c.fillRect(-7,-7,14,14); c.restore(); });
  }
  // grouted field tiles
  c.strokeStyle = '#a89880'; c.lineWidth = 3;
  for (let y = 0; y <= 512; y += 128){ c.beginPath(); c.moveTo(41,y); c.lineTo(471,y); c.stroke(); }
  c.beginPath(); c.moveTo(256,0); c.lineTo(256,512); c.stroke();
  // corner dots of each tile
  c.fillStyle = '#a3947a';
  for (let y = 0; y <= 512; y += 128) for (let x of [148, 364]){ c.beginPath(); c.arc(x, y, 5, 0, 7); c.fill(); }
  // central lotus-star medallion (one per 8 m of walkway)
  c.save(); c.translate(256, 256);
  c.strokeStyle = '#93856a'; c.lineWidth = 5;
  c.beginPath(); c.arc(0, 0, 88, 0, 7); c.stroke();
  c.beginPath(); c.arc(0, 0, 70, 0, 7); c.stroke();
  c.fillStyle = '#b3a488';
  for (let i = 0; i < 8; i++){                                      // 8-petal star
    c.save(); c.rotate(i*Math.PI/4);
    c.beginPath(); c.moveTo(0,-62); c.quadraticCurveTo(16,-26, 0,-12); c.quadraticCurveTo(-16,-26, 0,-62);
    c.closePath(); c.fill(); c.restore();
  }
  c.fillStyle = '#93856a'; c.beginPath(); c.arc(0, 0, 10, 0, 7); c.fill();
  c.restore();
  return cv;
}
/* white-marble plaza medallion: Ashoka Chakra ringed in muted
   saffron and green — the memorial's final floor emblem          */
function makePlazaTexture(){
  const cv = document.createElement('canvas'); cv.width = 1024; cv.height = 1024;
  const c = cv.getContext('2d'), cx = 512;
  c.fillStyle = '#ece5d4'; c.fillRect(0,0,1024,1024);
  for (let i = 0; i < 1200; i++){
    c.fillStyle = `rgba(150,140,120,${Math.random()*.05})`;
    c.fillRect(Math.random()*1024, Math.random()*1024, 26, 3);
  }
  c.strokeStyle = 'rgba(150,140,118,.5)'; c.lineWidth = 2;          // radial marble joints
  for (let i = 0; i < 24; i++){ const a = i*Math.PI/12;
    c.beginPath(); c.moveTo(cx + 150*Math.cos(a), cx + 150*Math.sin(a));
    c.lineTo(cx + 512*Math.cos(a), cx + 512*Math.sin(a)); c.stroke(); }
  [220, 320, 420].forEach(r => { c.beginPath(); c.arc(cx,cx,r,0,7); c.stroke(); });
  c.lineWidth = 26; c.strokeStyle = '#d98f3f';                      // muted saffron ring
  c.beginPath(); c.arc(cx, cx, 468, 0, 7); c.stroke();
  c.strokeStyle = '#3f7a52';                                        // muted green ring
  c.beginPath(); c.arc(cx, cx, 434, 0, 7); c.stroke();
  c.strokeStyle = '#26356e'; c.lineWidth = 16;                      // Ashoka Chakra
  c.beginPath(); c.arc(cx, cx, 128, 0, 7); c.stroke();
  c.lineWidth = 6;
  for (let i = 0; i < 24; i++){ const a = i*Math.PI/12;
    c.beginPath(); c.moveTo(cx, cx); c.lineTo(cx + 122*Math.cos(a), cx + 122*Math.sin(a)); c.stroke(); }
  c.fillStyle = '#26356e'; c.beginPath(); c.arc(cx, cx, 22, 0, 7); c.fill();
  if (SATIRE){
    // the same plaza, years later: grime, a broken chakra, tyre marks, and
    // the rings scuffed to nothing on one side
    c.fillStyle = 'rgba(40,34,28,.55)'; c.fillRect(0,0,1024,1024);
    for (let i = 0; i < 40; i++){ c.strokeStyle = `rgba(20,16,12,${.2+Math.random()*.3})`; c.lineWidth = 6 + Math.random()*10;
      c.beginPath(); c.moveTo(Math.random()*1024, 0); c.bezierCurveTo(Math.random()*1024, 400, Math.random()*1024, 700, Math.random()*1024, 1024); c.stroke(); }
    // cracks through the medallion
    c.strokeStyle = 'rgba(15,12,10,.9)'; c.lineWidth = 5;
    for (let i = 0; i < 7; i++){ let x = cx + (Math.random()-.5)*60, y = cx + (Math.random()-.5)*60; c.beginPath(); c.moveTo(x, y);
      for (let k = 0; k < 8; k++){ x += (Math.random()-.5)*140; y += (Math.random()-.5)*140; c.lineTo(x, y); } c.stroke(); }
    // four spokes of the chakra scoured away
    c.fillStyle = 'rgba(48,42,36,.95)'; c.beginPath(); c.moveTo(cx, cx); c.arc(cx, cx, 140, .3, 1.35); c.closePath(); c.fill();
    // a "NO ENTRY" stencil and a puddle
    c.save(); c.translate(cx+250, cx-260); c.rotate(-.35); c.fillStyle='rgba(200,40,40,.7)'; c.font='700 64px Impact, "Arial Black", sans-serif'; c.textAlign='center'; c.fillText('NO ENTRY', 0, 0); c.restore();
    c.fillStyle = 'rgba(70,90,110,.55)'; c.beginPath(); c.ellipse(cx-300, cx+300, 150, 80, .4, 0, 7); c.fill();
  }
  return cv;
}

let tankRig = null;   // the water tank set-piece, animated by the engine
function buildFloor(){
  const rows = Math.ceil(FLAG_S + 55), cols = 4;
  const pos = [], col = [], idx = [], nrm = [], uv = [];
  const c = new THREE.Color(), P = new THREE.Vector3(), S = new THREE.Vector3();
  for (let r = 0; r <= rows; r++){
    const s = r; pointAt(s, P); sideAt(s, S);
    const w = walkWidth(s);
    for (let k = 0; k < cols; k++){
      const f = k/(cols-1)*2 - 1;                       // -1 .. 1 across
      pos.push(P.x + S.x*f*w/2, 0, P.z + S.z*f*w/2);
      nrm.push(0,1,0);
      uv.push(k/(cols-1), s/8);                         // memorial pattern repeats every 8 m
      floorTint(s, c);
      const edge = 1 - Math.abs(f)*0.12;
      const noise = 0.96 + 0.08*Math.sin(s*12.9898 + k*78.233)*Math.sin(s*0.7);
      col.push(c.r*edge*noise, c.g*edge*noise, c.b*edge*noise);
    }
  }
  for (let r = 0; r < rows; r++) for (let k = 0; k < cols-1; k++){
    const a = r*cols+k, b = a+1, d = a+cols, e = d+1;
    idx.push(a,d,b, b,d,e);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos,3));
  g.setAttribute('normal',   new THREE.Float32BufferAttribute(nrm,3));
  g.setAttribute('color',    new THREE.Float32BufferAttribute(col,3));
  g.setAttribute('uv',       new THREE.Float32BufferAttribute(uv,2));
  g.setIndex(idx);
  const floorTex = new THREE.CanvasTexture(makeFloorTexture());
  floorTex.colorSpace = THREE.SRGBColorSpace;
  floorTex.wrapT = THREE.RepeatWrapping; floorTex.wrapS = THREE.ClampToEdgeWrapping;
  floorTex.anisotropy = 8;
  scene.add(new THREE.Mesh(g, new THREE.MeshStandardMaterial({
    map: floorTex, vertexColors: true, roughness: .92 })));
  // marble plaza with the Ashoka Chakra medallion under the flag
  const plazaTex = new THREE.CanvasTexture(makePlazaTexture());
  plazaTex.colorSpace = THREE.SRGBColorSpace; plazaTex.anisotropy = 8;
  const plaza = new THREE.Mesh(new THREE.CircleGeometry(26, 48),
    new THREE.MeshStandardMaterial({ map: plazaTex, roughness: .85 }));
  plaza.rotation.x = -Math.PI/2;
  // centred exactly under the flag — the camera's finale circle, the
  // bollard ring, and the chakra medallion all share one centre
  plaza.position.copy(pointAt(FLAG_S, new THREE.Vector3())); plaza.position.y = 0.015;
  scene.add(plaza);
}

// wall furniture must never stand at a station: on curved stretches a
// parapet block or column between the walker's eye and the station can
// cover the year plate or the framed picture itself
const nearStation = (s, r = 3.4) => STATION_S.some(ss => Math.abs(ss - s) < r);

const dummy = new THREE.Object3D();
function placeAlong(list, mesh){                 // list: [{s, side?, yaw?, y?, scale?}]
  if (!list.length){ mesh.count = 0; return; }   // a shorter walk may leave a range empty
  list.forEach((it, i) => {
    pointAt(it.s, _p); tangentAt(it.s, _t);
    if (it.side){ sideAt(it.s, _side); _p.addScaledVector(_side, it.side); }
    dummy.position.set(_p.x, it.y||0, _p.z);
    dummy.rotation.set(0, Math.atan2(_t.x, _t.z) + (it.yaw||0), it.roll||0);
    dummy.scale.setScalar(it.scale||1);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
  });
  mesh.instanceMatrix.needsUpdate = true;
  mesh.count = list.length;
  scene.add(mesh);
}
function buildArchitecture(){
  // Sandstone masonry: a neutral-grey block texture shared by every stone
  // material — each material's colour tints it, so sandstone and the
  // weathered "cracked" stone read as the same masonry in different states.
  const masonry = canvasTexture(256, 256, (c, w, h) => {
    c.fillStyle = '#d8d4cd'; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 700; i++){                             // grain
      c.fillStyle = `rgba(90,80,66,${Math.random()*.06})`;
      c.fillRect(Math.random()*w, Math.random()*h, 14, 2);
    }
    for (let row = 0; row < 8; row++){                          // courses + staggered joints
      const y = row * 32;
      c.fillStyle = 'rgba(60,48,36,.30)'; c.fillRect(0, y, w, 2.2);
      const off = (row % 2) * 32;
      for (let x = off; x < w; x += 64) c.fillRect(x, y, 2, 32);
    }
    for (let i = 0; i < 26; i++){                               // pitting
      c.fillStyle = `rgba(70,58,44,${.10 + Math.random()*.12})`;
      c.beginPath(); c.arc(Math.random()*w, Math.random()*h, 1 + Math.random()*2.4, 0, 7); c.fill();
    }
  });
  masonry.wrapS = masonry.wrapT = THREE.RepeatWrapping;
  masonry.repeat.set(1/3, 1/3);                 // extrude UVs are world-XY → ~3 m per tile
  MAT.sandstone.map = masonry; MAT.sandstone.needsUpdate = true;
  MAT.cracked.map   = masonry; MAT.cracked.needsUpdate = true;
  MAT.sandDark.map  = masonry; MAT.sandDark.needsUpdate = true;

  if (SATIRE){ buildSatireWayside(); return; }

  // Mughal gates spanning the walkway (zones 1–2), instanced.
  // Placed at station midpoints (stations sit at s = 20 + 14i) so no gate occludes a frame.
  const gateGeo = gateGeometry(5.1, 7.4, 3.3, 3.5, 2.7);
  // crown for each gate: cornice, merlon parapet, corner chhatris, centre dome
  const topParts = [];
  const cornice = new THREE.BoxGeometry(10.9, .34, 1.5); cornice.translate(0, 7.57, 0); topParts.push(cornice);
  for (let x = -4.8; x <= 4.81; x += .96){
    const m = new THREE.BoxGeometry(.5, .34, .32); m.translate(x, 7.91, 0); topParts.push(m);
  }
  [-3.9, 3.9].forEach(x => {
    const drum = new THREE.CylinderGeometry(.5, .56, .5, 8);  drum.translate(x, 8.16, 0); topParts.push(drum);
    const dome = new THREE.SphereGeometry(.55, 10, 8);        dome.translate(x, 8.52, 0); topParts.push(dome);
    const fin  = new THREE.ConeGeometry(.07, .3, 6);          fin.translate(x, 9.2, 0);   topParts.push(fin);
  });
  const cDrum = new THREE.CylinderGeometry(.42, .48, .38, 8); cDrum.translate(0, 7.95, 0); topParts.push(cDrum);
  const cDome = new THREE.SphereGeometry(.5, 10, 8);          cDome.translate(0, 8.3, 0);  topParts.push(cDome);
  const gateTopGeo = mergeGeometries(topParts);

  const gates = [{ s: 7 }, { s: 14 }];
  for (let s = FIRST_S + 6.5; s <= MUGHAL_END + 7; s += SPACING) gates.push({ s });
  placeAlong(gates, new THREE.InstancedMesh(gateGeo,    MAT.sandstone, gates.length));
  placeAlong(gates, new THREE.InstancedMesh(gateTopGeo, MAT.sandstone, gates.length));

  // Transition zone: the same gates in weathered stone — upright, just
  // settled a little lower into the ground (the old tilt read as a bug)
  const cracked = [];
  for (let s = S_TRANS + 6.5; s <= S_BRIT - 12; s += SPACING) cracked.push({ s, y: -0.3 });
  placeAlong(cracked, new THREE.InstancedMesh(gateGeo,    MAT.cracked, cracked.length));
  placeAlong(cracked, new THREE.InstancedMesh(gateTopGeo, MAT.cracked, cracked.length));

  // Mughal parapet blocks — chamfered coping profile, laid with a
  // little per-block settle and skew so the runs read as real masonry
  const cs = new THREE.Shape();
  cs.moveTo(-.15,0); cs.lineTo(.15,0); cs.lineTo(.15,.3); cs.lineTo(.09,.42);
  cs.lineTo(-.09,.42); cs.lineTo(-.15,.3); cs.closePath();
  // length must run along local Z — placeAlong's yaw aligns +Z with the
  // path tangent; the old rotateY left every strip lying ACROSS the edge,
  // jutting into the walkway and onto the year plates
  const parapetGeo = new THREE.ExtrudeGeometry(cs, { depth: 1.85, bevelEnabled: false });
  parapetGeo.translate(0, 0, -.925);
  const paraMat = new THREE.MeshStandardMaterial({ color:'#a8804f', roughness:.95, map: masonry });
  const para = [];
  for (let s = 3; s <= MUGHAL_END + 9; s += 2.1){
    if (nearStation(s)) continue;                // keep the year plates in clear view
    para.push({ s, side:  WALK_W/2 + 0.35, y: (Math.random()-.5)*.05, yaw: (Math.random()-.5)*.05 });
    para.push({ s, side: -(WALK_W/2 + 0.35), y: (Math.random()-.5)*.05, yaw: (Math.random()-.5)*.05 });
  }
  placeAlong(para, new THREE.InstancedMesh(parapetGeo, paraMat, para.length));

  // Charbagh cypresses in zone 2 — layered flame silhouettes, one merged
  // geometry with baked vertex colours (brown trunk, graded foliage),
  // instanced with per-tree hue, scale, yaw, and a slight lean.
  const cypParts = [];
  const paint = (geo, hex) => {
    const c = new THREE.Color(hex), n = geo.attributes.position.count, arr = new Float32Array(n * 3);
    for (let i = 0; i < n; i++){ arr[i*3] = c.r; arr[i*3+1] = c.g; arr[i*3+2] = c.b; }
    geo.setAttribute('color', new THREE.BufferAttribute(arr, 3));
    return geo;
  };
  const trunk = new THREE.CylinderGeometry(.045, .07, .4, 6); trunk.translate(0, .2, 0);
  cypParts.push(paint(trunk, '#4a3419'));
  [[.34,.9,.62,'#22402a'], [.30,.9,1.05,'#264a2c'], [.26,.85,1.5,'#2a532f'],
   [.21,.75,1.95,'#2e5b33'], [.15,.62,2.35,'#336337'], [.085,.5,2.72,'#3a6c3d']]
    .forEach(([r,h,y,col]) => { const c = new THREE.ConeGeometry(r, h, 9);
      c.translate(0, y, 0); cypParts.push(paint(c, col)); });
  const cypressGeo = mergeGeometries(cypParts);
  const cyp = [];
  for (let s = sOf('akbar-1556') - 5; s <= MUGHAL_END + 7; s += 6){
    cyp.push({ s: s + (Math.random()-.5)*2,  side:  (WALK_W/2 + 2.2 + Math.random()*.9),
               yaw: Math.random()*Math.PI, roll: (Math.random()-.5)*.06, scale: .85 + Math.random()*.45 });
    cyp.push({ s: s + (Math.random()-.5)*2,  side: -(WALK_W/2 + 2.2 + Math.random()*.9),
               yaw: Math.random()*Math.PI, roll: (Math.random()-.5)*.06, scale: .85 + Math.random()*.45 });
  }
  const cypMesh = new THREE.InstancedMesh(cypressGeo,
    new THREE.MeshStandardMaterial({ color:'#ffffff', roughness:.9, vertexColors:true }), cyp.length);
  placeAlong(cyp, cypMesh);
  const cypTint = new THREE.Color();
  for (let i = 0; i < cyp.length; i++){       // subtle per-tree colour breathing
    cypTint.setHSL(.30 + (Math.random()-.5)*.03, .32 + Math.random()*.14, .42 + Math.random()*.14);
    cypMesh.setColorAt(i, cypTint);
  }
  if (cypMesh.instanceColor) cypMesh.instanceColor.needsUpdate = true;

  // British colonial columns (zone 4) — fluted shafts with entasis,
  // moulded bases and Doric capitals. The fluting is a vertical light/
  // shadow stripe texture doubling as a bump map: 20 grooves read
  // convincingly at walk distance for the cost of one small canvas.
  const fluting = canvasTexture(160, 128, (c, w, h) => {
    c.fillStyle = '#dcdcdc'; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 20; i++){
      const x = i * 8;
      const grad = c.createLinearGradient(x, 0, x + 8, 0);
      grad.addColorStop(0,  'rgba(255,255,255,.6)');
      grad.addColorStop(.5, 'rgba(58,60,70,.55)');
      grad.addColorStop(1,  'rgba(255,255,255,.6)');
      c.fillStyle = grad; c.fillRect(x, 0, 8, h);
    }
  });
  fluting.wrapS = fluting.wrapT = THREE.RepeatWrapping;
  const flutedMat = new THREE.MeshStandardMaterial({
    color:'#b9c0c6', roughness:.8, map: fluting, bumpMap: fluting, bumpScale: .02 });
  const shaftGeo = new THREE.CylinderGeometry(0.27, 0.36, 4.9, 22);
  shaftGeo.translate(0, 2.75, 0);
  const trimParts = [];
  const plinthB = new THREE.BoxGeometry(1.0, .22, 1.0);            plinthB.translate(0, .11, 0);  trimParts.push(plinthB);
  const torusB  = new THREE.CylinderGeometry(.46, .5, .18, 16);    torusB.translate(0, .31, 0);   trimParts.push(torusB);
  const echinus = new THREE.CylinderGeometry(.42, .3, .22, 16);    echinus.translate(0, 5.3, 0);  trimParts.push(echinus);
  const abacus  = new THREE.BoxGeometry(.95, .22, .95);            abacus.translate(0, 5.52, 0);  trimParts.push(abacus);
  const trimGeo = mergeGeometries(trimParts);
  const cols = [];
  // columns skip the shared station clear zone — a fluted shaft one unit
  // from a frame stands squarely in front of its picture (1858 was worst)
  for (let s = S_BRIT - 6; s <= S_CROWNST + 8; s += 7){
    if (nearStation(s)) continue;
    cols.push({ s, side:WALK_W/2+1.1 }); cols.push({ s, side:-(WALK_W/2+1.1) });
  }
  placeAlong(cols, new THREE.InstancedMesh(shaftGeo, flutedMat, cols.length));
  placeAlong(cols, new THREE.InstancedMesh(trimGeo, MAT.colonial, cols.length));

  // Railway-iron railings along zone 4 edges — three rails, and posts
  // crowned with collars and spear finials like true Victorian ironwork
  const barGeo  = new THREE.BoxGeometry(0.06, 0.06, 6.8); barGeo.translate(0, 0.85, 0);
  const bar2    = barGeo.clone(); bar2.translate(0, -0.35, 0);
  const bar3    = barGeo.clone(); bar3.translate(0, -0.67, 0);
  const postParts = [];
  const pShaft  = new THREE.CylinderGeometry(0.05, 0.05, 1.0, 6); pShaft.translate(0, .5, 0);   postParts.push(pShaft);
  const pCollar = new THREE.CylinderGeometry(0.065, 0.065, .035, 6); pCollar.translate(0, 1.0, 0); postParts.push(pCollar);
  const pSpear  = new THREE.ConeGeometry(0.045, .17, 6); pSpear.translate(0, 1.1, 0);           postParts.push(pSpear);
  const postGeo = mergeGeometries(postParts);
  const rails = [], posts = [];
  for (let s = S_BRIT - 8; s <= S_CROWNST + 8; s += 7){
    rails.push({ s, side:WALK_W/2+0.5 }); rails.push({ s, side:-(WALK_W/2+0.5) });
  }
  for (let s = S_BRIT - 8; s <= S_CROWNST + 10; s += 3.5){
    posts.push({ s, side:WALK_W/2+0.5 }); posts.push({ s, side:-(WALK_W/2+0.5) });
  }
  placeAlong(rails, new THREE.InstancedMesh(barGeo, MAT.iron, rails.length));
  placeAlong(rails, new THREE.InstancedMesh(bar2,   MAT.iron, rails.length));
  placeAlong(rails, new THREE.InstancedMesh(bar3,   MAT.iron, rails.length));
  placeAlong(posts, new THREE.InstancedMesh(postGeo, MAT.iron, posts.length));

  // Victorian lamp posts between the columns — cast-iron with a warm
  // gas pane that carries the Company Raj evenings (and glows through
  // the smoke of 1857)
  const lampParts = [];
  const lbase = new THREE.CylinderGeometry(.16,.22,.5,10);  lbase.translate(0,.25,0);  lampParts.push(lbase);
  const lpole = new THREE.CylinderGeometry(.045,.06,3.0,8); lpole.translate(0,1.95,0); lampParts.push(lpole);
  const lcollar = new THREE.CylinderGeometry(.09,.07,.12,8); lcollar.translate(0,3.46,0); lampParts.push(lcollar);
  const lcap = new THREE.ConeGeometry(.22,.24,4); lcap.rotateY(Math.PI/4); lcap.translate(0,3.95,0); lampParts.push(lcap);
  const lfin = new THREE.SphereGeometry(.05,8,6); lfin.translate(0,4.12,0); lampParts.push(lfin);
  const lampGeo = mergeGeometries(lampParts);
  const paneGeo = new THREE.BoxGeometry(.24,.34,.24); paneGeo.translate(0,3.68,0);
  const lamps = [];
  for (let s = S_BRIT - 2.5; s <= S_CROWNST + 6; s += 14){
    if (nearStation(s)) continue;
    lamps.push({ s, side: WALK_W/2 + 1.6 }); lamps.push({ s, side: -(WALK_W/2 + 1.6) });
  }
  placeAlong(lamps, new THREE.InstancedMesh(lampGeo, MAT.iron, lamps.length));
  const paneMat = new THREE.MeshStandardMaterial({ color:'#3a2f1c',
    emissive:'#ffc97a', emissiveIntensity:1.1, roughness:.4 });
  placeAlong(lamps, new THREE.InstancedMesh(paneGeo, paneMat, lamps.length));

  // Freedom-era: white stambhs — square tapered shafts on plinths,
  // rounded caps, ringed with a saffron band
  const stambhParts = [];
  const sPlinth = new THREE.BoxGeometry(.32,.2,.32); sPlinth.translate(0,.1,0); stambhParts.push(sPlinth);
  const sShaft = new THREE.CylinderGeometry(.07,.115,1.95,4); sShaft.rotateY(Math.PI/4);
  sShaft.translate(0,1.16,0); stambhParts.push(sShaft);
  const sCap = new THREE.SphereGeometry(.1,8,6); sCap.scale(1,.7,1); sCap.translate(0,2.2,0); stambhParts.push(sCap);
  const postW = mergeGeometries(stambhParts);
  const free = [];
  for (let s = S_FREE + 4; s <= FLAG_S - 45; s += 9){
    if (nearStation(s)) continue;
    free.push({ s, side:WALK_W/2+0.8 }); free.push({ s, side:-(WALK_W/2+0.8) });
  }
  placeAlong(free, new THREE.InstancedMesh(postW, MAT.white, free.length));
  const bandGeo = new THREE.CylinderGeometry(0.095, 0.105, 0.26, 4); bandGeo.rotateY(Math.PI/4);
  bandGeo.translate(0, 1.78, 0);
  placeAlong(free, new THREE.InstancedMesh(bandGeo,
    new THREE.MeshStandardMaterial({ color:'#FF9933', roughness:.7 }), free.length));
}

/* ---- the 2014→today wayside: a highway that keeps getting inaugurated ----
   Concrete crash barriers with chunks missing; streetlamps, one in three
   dead and one leaning; a flyover that ends in mid-air with rebar
   sticking out; scaffolding that never came down; ribbon-cutting arches
   with "INAUGURATED" bunting over things that aren't finished; and
   hoardings along the way whose slogans get more confident as the road
   gets worse. Everything instanced or merged; no per-frame cost.      */
function buildSatireWayside(){
  const concrete = new THREE.MeshStandardMaterial({ color:'#a9a29a', roughness:.95 });
  const concreteDark = new THREE.MeshStandardMaterial({ color:'#7c756e', roughness:.95 });
  const rustMat = new THREE.MeshStandardMaterial({ color:'#7a4a2c', roughness:.9, metalness:.25 });
  const steel = new THREE.MeshStandardMaterial({ color:'#6b6f75', roughness:.6, metalness:.5 });
  const paint = new THREE.MeshStandardMaterial({ color:'#c9c4bb', roughness:.8 });
  const END = FLAG_S - 40;

  // 1) crash barriers (New Jersey profile) both sides, with missing chunks
  const bs = new THREE.Shape();
  bs.moveTo(-.28,0); bs.lineTo(.28,0); bs.lineTo(.22,.28); bs.lineTo(.1,.72); bs.lineTo(.1,.9);
  bs.lineTo(-.1,.9); bs.lineTo(-.1,.72); bs.lineTo(-.22,.28); bs.closePath();
  const barGeo = new THREE.ExtrudeGeometry(bs, { depth: 2.4, bevelEnabled:false });
  barGeo.rotateY(Math.PI/2); barGeo.translate(-1.2, 0, 0);
  const brokenGeo = barGeo.clone(); brokenGeo.scale(1, .55, .6);   // a shattered stump
  const bars = [], stumps = [];
  for (let s = 3; s <= END; s += 2.6){
    if (nearStation(s)) continue;
    const gap = ((s * 13) % 17) < 2;                                   // some barriers just gone
    if (gap) continue;
    const broken = ((s * 7) % 11) < 2;
    const list = broken ? stumps : bars;
    list.push({ s, side:  WALK_W/2 + 0.55, y: (Math.random()-.5)*.06, yaw: (Math.random()-.5)*.08 });
    list.push({ s, side: -(WALK_W/2 + 0.55), y: (Math.random()-.5)*.06, yaw: (Math.random()-.5)*.08 });
  }
  placeAlong(bars, new THREE.InstancedMesh(barGeo, concrete, bars.length));
  if (stumps.length) placeAlong(stumps, new THREE.InstancedMesh(brokenGeo, concreteDark, stumps.length));
  // rebar sticking out of every stump
  const rebar = new THREE.CylinderGeometry(.015,.015,.5,5); rebar.translate(0, .7, 0); rebar.rotateZ(.35);
  if (stumps.length) placeAlong(stumps.map(o => ({ ...o, side: o.side * 1.02 })), new THREE.InstancedMesh(rebar, rustMat, stumps.length));

  // 2) streetlamps — every 9 m, one in three dead (no pane), one in seven leaning
  const lampParts = [];
  const lb = new THREE.CylinderGeometry(.16,.2,.4,8); lb.translate(0,.2,0); lampParts.push(lb);
  const lp = new THREE.CylinderGeometry(.06,.09,5.6,8); lp.translate(0,3.2,0); lampParts.push(lp);
  const arm = new THREE.CylinderGeometry(.045,.045,1.6,6); arm.rotateZ(Math.PI/2); arm.translate(-.7,6.0,0); lampParts.push(arm);
  const head = new THREE.BoxGeometry(.5,.14,.22); head.translate(-1.45,5.95,0); lampParts.push(head);
  const lampGeo = mergeGeometries(lampParts);
  const paneGeo = new THREE.BoxGeometry(.42,.06,.18); paneGeo.translate(-1.45,5.86,0);
  const lit = [], dead = [], all = [];
  for (let s = 8; s <= END; s += 9){
    if (nearStation(s)) continue;
    [1,-1].forEach(sg => {
      const k = Math.round(s * 3 + sg);
      const it = { s, side: sg * (WALK_W/2 + 1.35), yaw: sg > 0 ? Math.PI : 0, roll: (k % 7 === 0) ? .12 * sg : 0 };
      all.push(it); ((k % 3) === 0 ? dead : lit).push(it);
    });
  }
  placeAlong(all, new THREE.InstancedMesh(lampGeo, steel, all.length));
  const litMat = new THREE.MeshStandardMaterial({ color:'#3a2f1c', emissive:'#ffd08a', emissiveIntensity:.9, roughness:.4 });
  const deadMat = new THREE.MeshStandardMaterial({ color:'#26221f', roughness:.9 });
  if (lit.length)  placeAlong(lit,  new THREE.InstancedMesh(paneGeo, litMat,  lit.length));
  if (dead.length) placeAlong(dead, new THREE.InstancedMesh(paneGeo, deadMat, dead.length));

  // 3) the flyover to nowhere — three piers, a deck, then rebar into the void
  const fo = new THREE.Group();
  const s0 = sOf('central-vista-2020') ?? (S_TRANS - 10);
  pointAt(s0 + 3, _p); tangentAt(s0 + 3, _t); sideAt(s0 + 3, _side);
  fo.position.copy(_p).addScaledVector(_side, -(WALK_W/2 + 9));
  fo.rotation.y = Math.atan2(_t.x, _t.z);
  [-8, 0, 8].forEach((z, i) => {
    const pier = new THREE.Mesh(new THREE.CylinderGeometry(.9, 1.1, 7.5 - i * .3, 10), concrete);
    pier.position.set(0, 3.75, z); fo.add(pier);
  });
  const deck = new THREE.Mesh(new THREE.BoxGeometry(6, .6, 22), concreteDark);
  deck.position.set(0, 7.6, 3); fo.add(deck);
  const stubs = [];
  for (let i = 0; i < 14; i++){
    const g = new THREE.CylinderGeometry(.03,.03,2.2,5);
    g.rotateX(Math.PI/2 + (Math.random()-.5)*.5); g.rotateZ((Math.random()-.5)*.6);
    g.translate(-2.6 + (i % 7) * .85, 7.5 + Math.floor(i/7) * .35, 14.6);
    stubs.push(g);
  }
  fo.add(new THREE.Mesh(mergeGeometries(stubs), rustMat));
  const sign = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.2, .08), paint);
  sign.position.set(0, 9.2, 13.4); fo.add(sign);
  const signTex = canvasTexture(256,128,(c,w,h) => {
    c.fillStyle = '#e9e4da'; c.fillRect(0,0,w,h);
    c.fillStyle = '#c0392b'; c.font = '700 40px Georgia'; c.textAlign = 'center';
    c.fillText('WORK IN', w/2, 52); c.fillText('PROGRESS', w/2, 100);
    c.font = '400 14px monospace'; c.fillStyle = '#4a4a4a'; c.fillText('since 2020', w/2, 120);
  });
  const signFace = new THREE.Mesh(new THREE.PlaneGeometry(2.3, 1.1),
    new THREE.MeshStandardMaterial({ map: signTex, roughness:.85 }));
  signFace.position.set(0, 9.2, 13.36); fo.add(signFace);
  scene.add(fo);

  // 4) scaffolding that never came down — a bamboo/steel cage on the other side
  const sc = new THREE.Group();
  const s1 = sOf('cag-2022') ?? (S_BRIT + 6);
  pointAt(s1 - 4, _p); tangentAt(s1 - 4, _t); sideAt(s1 - 4, _side);
  sc.position.copy(_p).addScaledVector(_side, -(WALK_W/2 + 1.1));   // straddling the right kerb: half its cage on the road, the left lane stays open
  sc.rotation.y = Math.atan2(_t.x, _t.z);
  const poles = [];
  for (let x = -3; x <= 3; x += 1.5) for (let z = -2; z <= 2; z += 2){
    const g = new THREE.CylinderGeometry(.05,.05,9,6); g.translate(x, 4.5, z); poles.push(g);
  }
  for (let y = 1.5; y <= 9; y += 1.5){
    for (let z = -2; z <= 2; z += 2){ const g = new THREE.CylinderGeometry(.04,.04,6.4,5); g.rotateZ(Math.PI/2); g.translate(0, y, z); poles.push(g); }
    for (let x = -3; x <= 3; x += 1.5){ const g = new THREE.CylinderGeometry(.04,.04,4.4,5); g.rotateX(Math.PI/2); g.translate(x, y, 0); poles.push(g); }
  }
  sc.add(new THREE.Mesh(mergeGeometries(poles), rustMat));
  const shell = new THREE.Mesh(new THREE.BoxGeometry(5.6, 6.5, 3.6), concreteDark);   // the building inside, unfinished
  shell.position.y = 3.25; sc.add(shell);
  const tarp = new THREE.Mesh(new THREE.PlaneGeometry(6.6, 4.2),
    new THREE.MeshStandardMaterial({ color:'#2f8f5a', roughness:.9, side: THREE.DoubleSide }));
  tarp.position.set(0, 4.5, -2.6); tarp.rotation.y = Math.PI; sc.add(tarp);
  scene.add(sc);

  // 4b) THE WATER TANK — an overhead municipal tank on stilts beside the road
  //     at the infrastructure-audit stretch. As the walker approaches it
  //     bursts: the tank drops and cracks, a stilt buckles, the wreck slides
  //     across the road as a wall of rubble you walk THROUGH, water sheets
  //     out down the tarmac — and every dry pothole downhill fills up.
  //     Animated by the engine (world.tank.t: 0 = standing, 1 = collapsed).
  {
    const tankS = (sOf('cag-2022') ?? (S_BRIT + 6)) - 7;
    const T = new THREE.Group();
    pointAt(tankS, _p); tangentAt(tankS, _t); sideAt(tankS, _side);
    T.position.copy(_p); T.rotation.y = Math.atan2(_t.x, _t.z);
    const sideOff = (WALK_W/2 + 3.2);                      // LEFT of the road (the scaffolded building takes the right)
    const tankMat = new THREE.MeshStandardMaterial({ color:'#b9b1a4', roughness:.85 });
    const stiltMat = concrete;
    // four concrete stilts, a ring beam, the tank (cylinder + shallow domed lid), a ladder
    const stilts = new THREE.Group(); T.add(stilts);
    [[-1.3,-1.3],[1.3,-1.3],[-1.3,1.3],[1.3,1.3]].forEach(([x,z], i) => {
      const st = new THREE.Mesh(new THREE.CylinderGeometry(.22,.28,7,10), stiltMat); st.position.set(sideOff + x, 3.5, z); stilts.add(st);
      if (i === 1) st.userData.buckle = true;
    });
    const ring = new THREE.Mesh(new THREE.BoxGeometry(3.4,.35,3.4), concreteDark); ring.position.set(sideOff, 7.0, 0); stilts.add(ring);
    const tank = new THREE.Group(); tank.position.set(sideOff, 7.2, 0); T.add(tank);
    const body = new THREE.Mesh(new THREE.CylinderGeometry(2.0, 2.1, 2.6, 18), tankMat); body.position.y = 1.3; tank.add(body);
    const lid = new THREE.Mesh(new THREE.SphereGeometry(2.05, 18, 8, 0, Math.PI*2, 0, Math.PI/2.4), tankMat); lid.scale.y = .45; lid.position.y = 2.6; tank.add(lid);
    const band = new THREE.Mesh(new THREE.TorusGeometry(2.08,.05,6,24), rustMat); band.rotation.x = Math.PI/2; band.position.y = 1.0; tank.add(band);
    const stencil = new THREE.Mesh(new THREE.PlaneGeometry(2.6,.9), new THREE.MeshStandardMaterial({ map: canvasTexture(260,90,(c,w,h) => {
      c.clearRect(0,0,w,h); c.fillStyle='rgba(20,20,20,.85)'; c.font='700 30px monospace'; c.textAlign='center'; c.fillText('JAL BOARD', w/2, 38);
      c.font='16px monospace'; c.fillText('cap. 50,000 L · est. 2019', w/2, 68); }), transparent:true, roughness:.9 }));
    stencil.position.set(0, 1.35, 2.11); tank.add(stencil);
    for (let k = 0; k < 8; k++){ const rung = new THREE.Mesh(new THREE.BoxGeometry(.4,.04,.04), rustMat); rung.position.set(sideOff - 1.9, .8 + k*.85, 0); stilts.add(rung); }
    // the crack that opens on the tank's road-facing side, and the water it lets out
    const crack = new THREE.Mesh(new THREE.PlaneGeometry(.9, 1.6), new THREE.MeshBasicMaterial({ color:'#0b0b0c', transparent:true, opacity:0, side: THREE.DoubleSide }));
    crack.position.set(-1.6, 1.2, 1.3); crack.rotation.y = -.9; crack.scale.set(.2, 1, 1); tank.add(crack);
    const waterMat = new THREE.MeshStandardMaterial({ color:'#7fa4c0', roughness:.15, metalness:.4, transparent:true, opacity:0, side: THREE.DoubleSide });
    // the jet: a curved sheet from the crack, arcing down to the road
    const jet = new THREE.Mesh(new THREE.CylinderGeometry(.18, .55, 6.5, 10, 1, true), waterMat); jet.position.set(sideOff - 1.4, 4.4, 1.2); jet.rotation.z = .55; jet.rotation.x = -.25; jet.visible = false; T.add(jet);
    // the flood: a widening sheet of water down the road (grows along +z, i.e. ahead of the walker… the road runs -z locally, so we grow toward -z)
    const flood = new THREE.Mesh(new THREE.PlaneGeometry(WALK_W + 1.2, 1, 1, 1), waterMat.clone()); flood.material.opacity = 0;
    flood.rotation.x = -Math.PI/2; flood.position.set(0, .018, 0); flood.visible = false; T.add(flood);
    // the rubble wall across the road: chunks of concrete + rebar, risen from below when it falls
    const rubble = new THREE.Group(); rubble.position.set(0, -3.5, 4.5); T.add(rubble);    // lands 4.5 m past the tank (local +z is ahead), starting sunk under the tarmac
    for (let k = 0; k < 22; k++){
      // smaller chunks, thrown from the tank (left) clear across to the far kerb and beyond it
      const ch = new THREE.Mesh(new THREE.DodecahedronGeometry(.16 + Math.random()*.26, 0), k % 3 ? concrete : concreteDark);
      const across = sideOff * .6 - Math.random() * (WALK_W + 4.5);            // from under the tank … past the right edge
      ch.position.set(across, Math.random()*.6, (Math.random()-.5)*3.2);
      ch.rotation.set(Math.random()*3, Math.random()*3, Math.random()*3); rubble.add(ch);
    }
    const bigSlab = new THREE.Mesh(new THREE.BoxGeometry(2.2, .35, 1.4), concreteDark); bigSlab.position.set(-(WALK_W/2 + .8), .35, .2); bigSlab.rotation.set(.25, .4, .35); rubble.add(bigSlab);   // the tank wall, landed on the far kerb
    for (let k = 0; k < 10; k++){ const rb = new THREE.Mesh(new THREE.CylinderGeometry(.015,.015,1.1,5), rustMat);
      rb.position.set(sideOff * .5 - Math.random()*(WALK_W + 3), .35 + Math.random()*.4, (Math.random()-.5)*2.6); rb.rotation.set(Math.random()*2, 0, Math.random()*2); rubble.add(rb); }
    // a fallen ladder and a "DANGER · TANK UNSAFE" sign that was, of course, already there
    const warn = new THREE.Mesh(new THREE.PlaneGeometry(1.1,.7), new THREE.MeshStandardMaterial({ map: canvasTexture(220,140,(c,w,h) => {
      c.fillStyle='#e8b048'; c.fillRect(0,0,w,h); c.fillStyle='#141414'; c.font='700 26px Georgia'; c.textAlign='center'; c.fillText('DANGER', w/2, 48);
      c.font='700 20px Georgia'; c.fillText('TANK UNSAFE', w/2, 82); c.font='13px monospace'; c.fillStyle='#4a4a4a'; c.fillText('notice dated 2019', w/2, 118); }), roughness:.85, side: THREE.DoubleSide }));
    warn.position.set(sideOff - 2.6, 1.6, 1.8); warn.rotation.y = Math.PI + .5;   // faces the walker approaching from +z T.add(warn);
    scene.add(T);
    tankRig = { group: T, tank, stilts, crack, jet, flood, rubble, s: tankS, t: 0, restH: 7.2,
      buckle: stilts.children.find(c => c.userData.buckle) };
  }

  // 4c) BROKEN BRIDGES — a footbridge whose span has dropped at one end,
  //     and a road culvert bridge with its parapet gone and the deck sagging
  {
    const s2 = (sOf('chandigarh-2024') ?? (S_BRIT + 34)) - 6;   // well past the tank
    const B = new THREE.Group();
    pointAt(s2, _p); tangentAt(s2, _t); sideAt(s2, _side);
    B.position.copy(_p); B.rotation.y = Math.atan2(_t.x, _t.z);
    // footbridge over the road: two stair towers, the span hinged down on one side
    [-1, 1].forEach(sg => { const tower = new THREE.Mesh(new THREE.BoxGeometry(1.4, 5.2, 1.4), concrete); tower.position.set(sg * (WALK_W/2 + 1.6), 2.6, 0); B.add(tower); });
    const span = new THREE.Mesh(new THREE.BoxGeometry(WALK_W + 3.4, .3, 1.6), concreteDark);
    span.position.set(-(WALK_W/2 + 1.6), 5.05, 0); span.geometry.translate((WALK_W + 3.4)/2, 0, 0);   // pivot at the left tower
    span.rotation.z = -.42;                                                                            // right end dropped
    B.add(span);
    const railL = new THREE.Mesh(new THREE.BoxGeometry(WALK_W + 3.4, .9, .06), rustMat); railL.geometry.translate((WALK_W + 3.4)/2, .6, .8); railL.position.copy(span.position); railL.rotation.z = span.rotation.z; B.add(railL);
    // the dropped end rests on rubble on the road's edge, and a strip of tape
    for (let k = 0; k < 6; k++){ const ch = new THREE.Mesh(new THREE.DodecahedronGeometry(.3 + Math.random()*.3, 0), concreteDark);
      ch.position.set(WALK_W/2 + .6 + (Math.random()-.5)*1.2, .3 + Math.random()*.4, (Math.random()-.5)*1.5); ch.rotation.set(Math.random()*3, Math.random()*3, 0); B.add(ch); }
    const tape = new THREE.Mesh(new THREE.PlaneGeometry(4.2, .12), new THREE.MeshStandardMaterial({ map: canvasTexture(256,16,(c,w,h) => {
      c.fillStyle='#e8b048'; c.fillRect(0,0,w,h); c.fillStyle='#141414'; for (let x=0;x<w;x+=32) c.fillRect(x,0,16,h); }), roughness:.9, side: THREE.DoubleSide }));
    tape.position.set(WALK_W/2 - .5, 1.0, 1.4); tape.rotation.y = .3; B.add(tape);
    scene.add(B);

    // culvert bridge further on: deck sagging in the middle, parapet fallen into the drain
    const s3 = (sOf('bihar-sir-2025') ?? (S_FREE + 8)) - 6;
    const C = new THREE.Group();
    pointAt(s3, _p); tangentAt(s3, _t); sideAt(s3, _side);
    C.position.copy(_p); C.rotation.y = Math.atan2(_t.x, _t.z);
    [-1, 1].forEach(sg => {
      const par = new THREE.Mesh(new THREE.BoxGeometry(.3, .9, 5), concrete); par.position.set(sg * (WALK_W/2 + .35), .45, 0); if (sg > 0){ par.rotation.x = 1.1; par.position.set(WALK_W/2 + 1.3, .35, .8); } C.add(par);
      const abut = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.6, 5.2), concreteDark); abut.position.set(sg * (WALK_W/2 + 1.9), -.9, 0); C.add(abut);
    });
    // the sag: a dark seam across the road with the deck edges dipping
    const seam = new THREE.Mesh(new THREE.BoxGeometry(WALK_W + .6, .06, .18), new THREE.MeshStandardMaterial({ color:'#141414', roughness:1 })); seam.position.set(0, .03, 0); C.add(seam);
    const dip = new THREE.Mesh(new THREE.BoxGeometry(WALK_W + .4, .12, 1.6), concreteDark); dip.position.set(0, -.02, 0); dip.rotation.x = .04; C.add(dip);
    // a "WEAK BRIDGE · 5 T" sign, and a truck's worth of exposed rebar under the edge
    const wb = new THREE.Mesh(new THREE.PlaneGeometry(.9,.9), new THREE.MeshStandardMaterial({ map: canvasTexture(128,128,(c,w,h) => {
      c.fillStyle='#e9e4da'; c.beginPath(); c.arc(64,64,60,0,7); c.fill(); c.strokeStyle='#c0392b'; c.lineWidth=10; c.stroke();
      c.fillStyle='#141414'; c.font='700 30px Georgia'; c.textAlign='center'; c.fillText('5 T', 64, 60); c.font='12px monospace'; c.fillText('WEAK BRIDGE', 64, 90); }), roughness:.85, side: THREE.DoubleSide }));
    wb.position.set(-(WALK_W/2 + .9), 1.9, 3.2); C.add(wb);
    const wbPost = new THREE.Mesh(new THREE.CylinderGeometry(.04,.05,1.9,6), steel); wbPost.position.set(-(WALK_W/2 + .9), .95, 3.2); C.add(wbPost);
    scene.add(C);
  }

  // 5) INAUGURATED arches — bunting over gaps in the road, at three points
  const inaugTex = canvasTexture(512,96,(c,w,h) => {
    c.fillStyle = '#e8b048'; c.fillRect(0,0,w,h);
    for (let x = 0; x < w; x += 64){ c.fillStyle = x % 128 ? '#c0392b' : '#2e7d5b'; c.beginPath(); c.moveTo(x,0); c.lineTo(x+64,0); c.lineTo(x+32,26); c.closePath(); c.fill(); }
    c.fillStyle = '#141414'; c.font = '700 44px Georgia'; c.textAlign = 'center'; c.fillText('INAUGURATED', w/2, 72);
  });
  const inaugMat = new THREE.MeshStandardMaterial({ map: inaugTex, roughness:.85, side: THREE.DoubleSide });
  [sOf('demonetisation-2016'), sOf('pmcares-2020'), sOf('neet-2024')].filter(v => v != null).forEach(sx => {
    const g = new THREE.Group();
    pointAt(sx - 6.5, _p); tangentAt(sx - 6.5, _t);
    g.position.copy(_p); g.rotation.y = Math.atan2(_t.x, _t.z);
    [-1,1].forEach(sg => {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(.08,.1,4.4,8), steel);
      post.position.set(sg * (WALK_W/2 + .2), 2.2, 0); g.add(post);
    });
    const banner = new THREE.Mesh(new THREE.PlaneGeometry(WALK_W + .4, 1.0, 12, 1), inaugMat);
    banner.position.set(0, 4.1, 0);
    banner.rotation.y = Math.PI;               // face the walker approaching from +z so the text reads left-to-right
    // a lazy sag in the middle
    const pos = banner.geometry.attributes.position;
    for (let i = 0; i < pos.count; i++){ const x = pos.getX(i); pos.setY(i, pos.getY(i) - Math.cos(x / (WALK_W/2) * 1.4) * .22); }
    pos.needsUpdate = true; banner.geometry.computeVertexNormals();
    g.add(banner);
    scene.add(g);
  });

  // 6) hoardings — slogans getting more confident as the tarmac gets worse
  const slogans = [
    ['ACHHE DIN', 'loading… 87%'], ['NEW INDIA', 'terms & conditions apply'],
    ['5 TRILLION', 'ETA: soon'], ['SABKA VIKAS', 'select regions only'],
    ['VISHWAGURU', 'no refunds'], ['STARTUP NATION', 'server not found'],
    ['SMART CITY', 'please pay parking'], ['AMRIT KAAL', 'batteries not included'],
  ];
  const boardGeo = new THREE.BoxGeometry(3.6, 2.0, .1);
  const legGeo = new THREE.CylinderGeometry(.06,.08,3.4,6);
  slogans.forEach(([big, small], i) => {
    // sit each hoarding at a station midpoint so it never covers a plate
    let s = FIRST_S + 5 + i * ((END - FIRST_S) / slogans.length);
    if (nearStation(s)) s += SPACING / 2;
    const g = new THREE.Group();
    pointAt(s, _p); tangentAt(s, _t); sideAt(s, _side);
    const sg = i % 2 ? 1 : -1;
    g.position.copy(_p).addScaledVector(_side, sg * (WALK_W/2 + 3.2));
    g.rotation.y = Math.atan2(_t.x, _t.z) + (sg > 0 ? -.35 : .35);
    const tex = canvasTexture(384,214,(c,w,h) => {
      c.fillStyle = i % 3 ? '#f4efe0' : '#FF9933'; c.fillRect(0,0,w,h);
      c.fillStyle = '#141414'; c.textAlign = 'center';
      c.font = '800 46px Georgia'; c.fillText(big, w/2, 96);
      c.font = '400 20px monospace'; c.fillStyle = '#4a4a4a'; c.fillText(small, w/2, 150);
      // one corner peeling
      c.fillStyle = 'rgba(0,0,0,.35)'; c.beginPath(); c.moveTo(w, h); c.lineTo(w-70, h); c.lineTo(w, h-50); c.closePath(); c.fill();
      c.fillStyle = '#d9d0c1'; c.beginPath(); c.moveTo(w-70, h); c.lineTo(w, h-50); c.lineTo(w-8, h-8); c.closePath(); c.fill();
    });
    const board = new THREE.Mesh(boardGeo, steel); board.position.y = 4.4; g.add(board);
    const face = new THREE.Mesh(new THREE.PlaneGeometry(3.5, 1.9),
      new THREE.MeshStandardMaterial({ map: tex, roughness:.85 }));
    face.position.set(0, 4.4, .06); g.add(face);
    [-1.4, 1.4].forEach(x => { const l = new THREE.Mesh(legGeo, steel); l.position.set(x, 1.7, 0); g.add(l); });
    scene.add(g);
  });
}

const particleSystems = [];
function makeParticles({count, sRange, spread, yRange, size, color, blending, riser, opacity}){
  const n = MOBILE ? Math.floor(count*0.5) : count;   // responsive particle budget
  const posArr = new Float32Array(n*3), seed = new Float32Array(n), base = [];
  for (let i=0;i<n;i++){
    const s = sRange[0] + Math.random()*(sRange[1]-sRange[0]);
    pointAt(s, _p); sideAt(s, _side);
    const off = (Math.random()*2-1) * spread;
    base.push(_p.x + _side.x*off, yRange[0] + Math.random()*(yRange[1]-yRange[0]), _p.z + _side.z*off);
    posArr[i*3] = base[i*3]; posArr[i*3+1] = base[i*3+1]; posArr[i*3+2] = base[i*3+2];
    seed[i] = Math.random()*100;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(posArr,3).setUsage(THREE.DynamicDrawUsage));
  const dot = canvasTexture(32,32,(c) => { const g2 = c.createRadialGradient(16,16,0,16,16,16);
    g2.addColorStop(0,'rgba(255,255,255,1)'); g2.addColorStop(1,'rgba(255,255,255,0)');
    c.fillStyle=g2; c.fillRect(0,0,32,32); });
  const mat = new THREE.PointsMaterial({ size, map:dot, color, transparent:true, opacity,
    depthWrite:false, blending: blending||THREE.NormalBlending, sizeAttenuation:true });
  const pts = new THREE.Points(geo, mat);
  pts.frustumCulled = true;
  scene.add(pts);
  particleSystems.push({ pts, base, seed, riser, yRange, n });
}
function buildParticles(){
  makeParticles({ count:480, sRange:[0, S_TRANS+2], spread:7, yRange:[.2,4.2], size:.06,
    color:'#ffd9a0', opacity:.55, riser:0 });                                        // dust motes
  makeParticles({ count:260, sRange:[S_REV-10, S_REV+16], spread:6, yRange:[0,5], size:.09,
    color:'#ff5522', opacity:.9, blending:THREE.AdditiveBlending, riser:.9 });       // 1857 embers
  makeParticles({ count:90,  sRange:[S_REV-10, S_REV+20], spread:8, yRange:[1,7], size:1.4,
    color:'#1c1512', opacity:.28, riser:.35 });                                      // 1857 smoke
  makeParticles({ count:240, sRange:[FLAG_S-55, FLAG_S+30], spread:13, yRange:[.3,6], size:.08,
    color:'#fff4d8', opacity:.8, blending:THREE.AdditiveBlending, riser:.25 });      // finale light
}
function updateParticles(time){
  for (const ps of particleSystems){
    const arr = ps.pts.geometry.attributes.position.array;
    for (let i=0;i<ps.n;i++){
      const sd = ps.seed[i];
      arr[i*3]   = ps.base[i*3]   + Math.sin(time*.4 + sd)*.35;
      arr[i*3+2] = ps.base[i*3+2] + Math.cos(time*.3 + sd*1.3)*.35;
      if (ps.riser > 0){
        const range = ps.yRange[1]-ps.yRange[0];
        arr[i*3+1] = ps.yRange[0] + ((ps.base[i*3+1]-ps.yRange[0]) + time*ps.riser + sd) % range;
      } else {
        arr[i*3+1] = ps.base[i*3+1] + Math.sin(time*.5 + sd*2.1)*.3;
      }
    }
    ps.pts.geometry.attributes.position.needsUpdate = true;
  }
}

  return { hemi, sun, pool, sky, sunDisc, clouds, applyEnv, buildFloor, buildArchitecture,
           buildParticles, updateParticles, walkWidth,
           get tankRig(){ return tankRig; } };
}

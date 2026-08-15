// Environment: lights, sky, era transitions, memorial floor, architecture, particles.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { MOBILE, WALK_W as WALK_W_SHARED, smooth as smoothShared, pointAt, sideAt, tangentAt,
         _p, _t, _side, canvasTexture, MAT, gateGeometry } from './shared.js';
import { SPACING, FIRST_S, STATION_S, sOf, S_TAJ, MUGHAL_END, S_TRANS, S_BRIT, S_REV,
         S_CROWNST, S_FREE, FLAG_S } from '../data/timeline.js';

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
// Keyframes positioned relative to the stations they belong to
const ENV_KEYS = [
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
const FLOOR_KEYS = [
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
function makeFloorTexture(){
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
  return cv;
}

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
  cypMesh.instanceColor.needsUpdate = true;

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
           buildParticles, updateParticles, walkWidth };
}

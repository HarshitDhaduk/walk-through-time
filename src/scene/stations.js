// Stations: frames, glazed pictures, props, Taj, finale flag, 1858 crown.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { MOBILE, WALK_W, smooth, pointAt, sideAt, tangentAt, FLAG_POS,
         canvasTexture, MAT, cuspedArchHole, gateGeometry } from './shared.js';
import { TIMELINE, STATION_S, FLAG_S } from '../data/timeline.js';
import { PHOTOS } from '../data/photos.js';
import { stationArtCanvas, AW, AH } from '../art/vignettes.js';
import { WALK } from '../data/walk.js';
const SATIRE = WALK.key === 'ledger';   // the 2014→today corridor: torn frames, dark finale

export function createStations(scene){

function yearPlate(st){       // glowing year text inlaid in the walkway
  const tex = canvasTexture(512, 256, (ctx,w,h) => {
    ctx.fillStyle = 'rgba(10,6,3,0.55)';
    ctx.beginPath(); ctx.roundRect(14,14,w-28,h-28,26); ctx.fill();
    ctx.strokeStyle = st.accent; ctx.lineWidth = 5; ctx.stroke();
    ctx.shadowColor = st.accent; ctx.shadowBlur = 34;
    ctx.fillStyle = '#fff6e2';
    let size = st.year.length > 6 ? 88 : 120;
    ctx.font = `700 ${size}px Georgia, serif`;
    const tw = ctx.measureText(st.year).width;              // shrink to fit the plate
    if (tw > 430){ size = Math.floor(size * 430 / tw); ctx.font = `700 ${size}px Georgia, serif`; }
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(st.year, w/2, h/2+6);
  });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.3),
    new THREE.MeshBasicMaterial({ map:tex, transparent:true, toneMapped:false, depthWrite:false }));
  m.rotation.x = -Math.PI/2;
  return m;
}

/* ---- GALLERY GLASS -----------------------------------------------
   Each station frame holds a real framed picture: a mat board, the
   artwork itself, a gilt/iron inner moulding, and a glass pane with
   an angled sheen. The artwork starts as the procedural vignette and
   is swapped for the historical photograph once it downloads, so the
   gallery is complete before — and even without — the network.    */
const UNIT_PLANE = new THREE.PlaneGeometry(1, 1);
const GLASS_MAT = new THREE.MeshBasicMaterial({
  map: canvasTexture(256, 256, (c, w, h) => {
    const g = c.createLinearGradient(0, h, w, 0);
    [[0,0],[.40,0],[.47,.42],[.53,.06],[.60,.24],[.68,0],[1,0]]
      .forEach(([p,a]) => g.addColorStop(p, `rgba(255,255,255,${a})`));
    c.fillStyle = g; c.fillRect(0, 0, w, h);
  }),
  transparent: true, opacity: .5, depthWrite: false,
  blending: THREE.AdditiveBlending, toneMapped: false,
});
const texLoader = new THREE.TextureLoader();
texLoader.setCrossOrigin('anonymous');
const ART_PICKS = [];                 // every framed picture, clickable in 3D

/* the 2014→today corridor's pictures hang torn: rusted, chipped moulding
   with a corner gone, cracked glass, and the print itself ripped at
   one edge — a gallery nobody has maintained since the ribbon was cut */
const RIP_MAT = SATIRE ? new THREE.MeshStandardMaterial({ color:'#7a4a2c', roughness:.9, metalness:.25 }) : null;
const CRACK_TEX = SATIRE ? canvasTexture(256, 256, (c, w, h) => {
  c.clearRect(0,0,w,h);
  c.strokeStyle = 'rgba(255,255,255,.75)'; c.lineWidth = 1.6;
  const ox = 70 + Math.random()*40, oy = 60 + Math.random()*40;      // impact point
  for (let i = 0; i < 9; i++){                                          // radial cracks
    let x = ox, y = oy, a = i * .7 + Math.random()*.4;
    c.beginPath(); c.moveTo(x, y);
    for (let k = 0; k < 6; k++){ a += (Math.random()-.5)*.6; x += Math.cos(a)*22; y += Math.sin(a)*22; c.lineTo(x, y); }
    c.stroke();
  }
  c.lineWidth = 1; c.strokeStyle = 'rgba(255,255,255,.45)';
  for (let r = 14; r < 60; r += 14){ c.beginPath(); c.arc(ox, oy, r, Math.random()*2, Math.random()*2 + 3); c.stroke(); }
}) : null;
const RIP_MASK = SATIRE ? canvasTexture(256, 256, (c, w, h) => {   // alpha: white kept, black torn away
  c.fillStyle = '#fff'; c.fillRect(0,0,w,h);
  c.fillStyle = '#000';
  // torn bottom-right corner + a bite out of the top edge
  c.beginPath(); c.moveTo(w, h*.62);
  for (let i = 0; i <= 10; i++){ c.lineTo(w - i*(w*.06) + (Math.random()-.5)*8, h*.62 + i*(h*.038) + (Math.random()-.5)*10); }
  c.lineTo(w*.4, h); c.lineTo(w, h); c.closePath(); c.fill();
  c.beginPath(); c.moveTo(w*.3, 0);
  for (let i = 0; i <= 6; i++){ c.lineTo(w*.3 + i*(w*.045), (i%2 ? 14 : 4) + Math.random()*6); }
  c.lineTo(w*.57, 0); c.closePath(); c.fill();
}) : null;
function artPanel(st, boxW, boxH, y, z, gilt){
  const g = new THREE.Group(); g.position.set(0, y, z);
  const board = new THREE.Mesh(new THREE.PlaneGeometry(boxW + .22, boxH + .22),
    new THREE.MeshStandardMaterial({ color:'#181310', roughness:.92,
      emissive:new THREE.Color(st.accent), emissiveIntensity:.10 }));
  g.add(board);
  // pictures carry a little of their own light, the way a gallery lights
  // its walls — otherwise the 1857 red and the hushed stations swallow them
  const vigTex = new THREE.CanvasTexture(stationArtCanvas(st));
  vigTex.colorSpace = THREE.SRGBColorSpace;
  const picMat = new THREE.MeshStandardMaterial({
    map: vigTex, emissiveMap: vigTex, roughness:.6,
    emissive: 0xffffff, emissiveIntensity: .42,
    ...(SATIRE ? { alphaMap: RIP_MASK, transparent: true, alphaTest: .5 } : {}) });
  const pic = new THREE.Mesh(UNIT_PLANE, picMat); pic.position.z = .012; g.add(pic);
  ART_PICKS.push({ mesh: pic, st });
  const moulding = SATIRE ? RIP_MAT : (gilt ? MAT.gold : MAT.iron);
  const bars = [0,1,2,3].map(() => { const b = new THREE.Mesh(UNIT_PLANE, moulding);
    b.position.z = .022; g.add(b); return b; });
  const glass = new THREE.Mesh(UNIT_PLANE, GLASS_MAT); glass.position.z = .05; g.add(glass);
  let cracks = null, chips = null;
  if (SATIRE){
    // cracked glass over the print, and the moulding chipped: short dark
    // gaps along the bars, plus one corner missing entirely (bar 3 is shortened)
    cracks = new THREE.Mesh(UNIT_PLANE, new THREE.MeshBasicMaterial({ map: CRACK_TEX, transparent: true,
      opacity: .85, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false }));
    cracks.position.z = .055; g.add(cracks);
    chips = [0,1,2].map(() => { const m = new THREE.Mesh(UNIT_PLANE,
      new THREE.MeshStandardMaterial({ color:'#181310', roughness:.95 })); m.position.z = .026; g.add(m); return m; });
  }

  const layout = aspect => {
    let w = boxW, h = w / aspect;
    if (h > boxH){ h = boxH; w = h * aspect; }
    pic.scale.set(w, h, 1); glass.scale.set(w, h, 1);
    if (cracks) cracks.scale.set(w, h, 1);
    const t = .05;
    bars[0].scale.set(w + 2*t, t, 1); bars[0].position.set(0,  h/2 + t/2, .022);
    bars[1].scale.set(w + 2*t, t, 1); bars[1].position.set(0, -h/2 - t/2, .022);
    bars[2].scale.set(t, h, 1);       bars[2].position.set(-w/2 - t/2, 0, .022);
    if (SATIRE){
      // right bar stops short of the top: the corner is gone
      bars[3].scale.set(t, h * .72, 1); bars[3].position.set( w/2 + t/2, -h * .14, .022);
      bars[3].rotation.z = .035;                                            // and hangs slightly loose
      chips[0].scale.set(.16, t + .01, 1); chips[0].position.set(-w*.28, h/2 + t/2, .026);
      chips[1].scale.set(.11, t + .01, 1); chips[1].position.set( w*.18, -h/2 - t/2, .026);
      chips[2].scale.set(t + .01, .14, 1); chips[2].position.set(-w/2 - t/2, -h*.22, .026);
    } else {
      bars[3].scale.set(t, h, 1);       bars[3].position.set( w/2 + t/2, 0, .022);
    }
  };
  layout(AW / AH);
  let photoTex = null;
  return {
    grp: g,
    apply(tex){ photoTex = tex; picMat.map = tex; picMat.emissiveMap = tex;
      picMat.needsUpdate = true;
      layout((tex.image.width || AW) / (tex.image.height || AH)); },
    revert(){ if (!photoTex) return;
      picMat.map = vigTex; picMat.emissiveMap = vigTex; picMat.needsUpdate = true;
      photoTex.dispose(); photoTex = null; layout(AW / AH); },
  };
}

/* Lazy photo loading: a station's picture downloads only as the
   visitor draws near, so the walk starts instantly and mobile data
   is spent only on what is actually seen.                        */
function ensureArt(stn){
  const st = stn.st;
  if (st._artState) return;
  const rec = PHOTOS[st.id];
  if (!rec || !stn.artSlots || !stn.artSlots.length){ st._artState = 'skip'; return; }
  st._artState = 'loading';
  texLoader.load(rec.url,
    tex => { tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
             st._artState = 'ok';
             stn.artSlots.forEach(slot => slot.apply(tex)); },
    undefined,
    () => { st._artState = 'fail'; });        // keeps the procedural vignette
}
/* Free a picture the visitor has walked well past, so the gallery
   holds only a handful of full-size textures at a time (the frame
   falls back to its vignette and reloads if they walk back).    */
function releaseArt(stn){
  if (stn.st._artState !== 'ok') return;
  stn.artSlots.forEach(slot => slot.revert());
  stn.st._artState = undefined;
}

/* ---- EXPLORABLES ---------------------------------------------------
   Every prop and monument registers here; clicking one in the scene
   makes the camera step off the path and circle it, with a caption. */
const EXPLORABLES = [];
const EXPLORE_INFO = {
  // the 2014→today corridor's props: satire of habits and offices, never a person
  podium:   ['The Orator', 'An empty suit at a podium. The mic is on mute; the questions are stacked, unopened, at its feet. Any resemblance to a role is intentional; to a person, impossible — there’s no one in it.'],
  forward:  ['The Forward', '“Forwarded many times.” Two blue ticks is the highest peer review some claims will ever get.'],
  queue:    ['The Queue', 'Four hours in line for your own money. The machine says OUT OF CASH. Someone lost a shoe. Nobody lost their job over it.'],
  scissors: ['The Ribbon', 'The ribbon has been cut. Twice. The thing behind it says PROJECT SITE · completion: TBD. There is one brick.'],
  cabinet:  ['The Files', 'RTI · AUDIT · MINUTES · REPLIES. Every drawer open, every drawer empty, one moth. The paperwork is on the other page.'],
  pothole:  ['The Pothole', 'Inaugurated with a garland. The DRIVE SAFE sign fell in first.'],
  cannon:   ['Field Cannon', 'Bronze artillery of the kind Babur brought to Panipat — the gunpowder edge that won an empire.'],
  banner:   ['Royal Standard', 'A standard of the age, raised wherever authority stood.'],
  milestone:['Kos Minar', 'A Grand Trunk Road mile-pillar — Sher Shah Suri’s administration, measured in stone.'],
  scales:   ['Chain of Justice', 'Jahangir’s golden chain and scales: any subject could ring the bell and ask the emperor for justice.'],
  ship:     ['East Indiaman', 'A Company merchantman — the ships that carried spice, cloth, silver, and eventually an empire.'],
  brokenPillar:['Fallen Column', 'The empire after Aurangzeb: still standing at the centre, coming down at the edges.'],
  throne:   ['The Peacock Throne', 'Shah Jahan’s jewelled throne, carried off to Persia by Nadir Shah in 1739.'],
  coins:    ['The Diwani', 'Bengal’s revenues, signed over to the Company at Allahabad in 1765.'],
  rockets:  ['Mysorean Rockets', 'Tipu Sultan’s iron-cased rockets on their bamboo guides — feared at Srirangapatna, studied in London.'],
  loco:     ['The First Train', 'Bombay to Thane, 1853 — fourteen carriages, four hundred passengers, a subcontinent about to shrink.'],
  charred:  ['A Burned Street', '1857 left Delhi, Kanpur, and Lucknow in ruins like these.'],
  memorial: ['Memorial Flame', 'For Jallianwala Bagh — kept quiet, kept lit.'],
  charkha:  ['Charkha', 'The spinning wheel Gandhi set at the centre of self-rule: cloth, discipline, defiance.'],
  salt:     ['Salt', 'Lifted from the sand at Dandi, 6 April 1930 — a handful the empire could not tax.'],
  scrolls:  ['Acts & Firmans', 'Paper instruments of rule — charters, settlements, and acts.'],
  book:     ['New Learning', 'Print, reform, and the English classroom — tools a later generation turned on the Raj.'],
  bowl:     ['The Empty Bowl', 'For the famine dead. Nothing more need be shown.'],
  flames3:  ['Three Flames', 'Bhagat Singh, Sukhdev, Rajguru — Lahore, 23 March 1931.'],
  crown:    ['The Imperial Crown', 'Victoria proclaimed Empress of India, 1877.'],
  khanda:   ['Khanda', 'The emblem of the Khalsa: the double-edged sword, the chakkar, the two kirpans.'],
  swords:   ['Talwars', 'The curved steel of Hindustan’s battlefields.'],
  hillfort: ['Hill Fort', 'Swarajya lived in forts like this — small, high, and never quite taken.'],
  bonfire:  ['Swadeshi Fire', 'Foreign cloth burned in the streets, 1905 — and Indian mills spun through the night.'],
  crownArch:['Crown over the Arch', 'The Company and the Mughals both ended in 1858; the Crown took their place.'],
};

/* shared trim pieces — one geometry each, reused across all 45 frames:
   carved pilasters & band for Mughal arches, dentils for pediments */
const carveTex = canvasTexture(64,64,(c,w,h) => {
  c.fillStyle='#a6754a'; c.fillRect(0,0,w,h);
  c.fillStyle='#7c522f';
  for (let y=8;y<h;y+=16) for (let x=8;x<w;x+=16){
    c.save(); c.translate(x,y); c.rotate(Math.PI/4); c.fillRect(-4,-4,8,8); c.restore();
  }
  c.fillStyle='#c79a63';
  for (let y=16;y<h;y+=16) for (let x=16;x<w;x+=16){ c.beginPath(); c.arc(x,y,2.2,0,7); c.fill(); }
});
const carveMat = new THREE.MeshStandardMaterial({ map:carveTex, roughness:.85 });
const pilasterGeo = new THREE.BoxGeometry(.16,3.5,.06);
const bandTrimGeo = new THREE.BoxGeometry(3.06,.42,.06);
const dentilParts = [];
for (let x = -1.62; x <= 1.63; x += .27){
  const d = new THREE.BoxGeometry(.09,.09,.14); d.translate(x,0,0); dentilParts.push(d);
}
const dentilGeo = mergeGeometries(dentilParts);

/* ---- the 2014→today frame: a stained concrete slab, cracked through,
   the picture hung crooked from one bent rebar hook, graffiti at the
   foot. Every era in that corridor uses this — decay is the era. */
const STAIN_TEX = SATIRE ? canvasTexture(256, 384, (c, w, h) => {
  c.fillStyle = '#9d9891'; c.fillRect(0,0,w,h);
  for (let i = 0; i < 1400; i++){ c.fillStyle = `rgba(40,36,32,${Math.random()*.16})`; c.fillRect(Math.random()*w, Math.random()*h, 3, 3); }
  // water stains running down from the top edge, and damp at the base
  for (let i = 0; i < 6; i++){ const x = 20 + Math.random()*(w-40), ww = 10 + Math.random()*26;
    const g = c.createLinearGradient(0, 0, 0, 120 + Math.random()*160); g.addColorStop(0, 'rgba(60,50,40,.55)'); g.addColorStop(1, 'rgba(60,50,40,0)');
    c.fillStyle = g; c.fillRect(x, 0, ww, 300); }
  const g2 = c.createLinearGradient(0, h-110, 0, h); g2.addColorStop(0,'rgba(30,40,30,0)'); g2.addColorStop(1,'rgba(30,40,30,.6)');
  c.fillStyle = g2; c.fillRect(0, h-110, w, 110);
  // a diagonal crack
  c.strokeStyle = 'rgba(25,20,16,.8)'; c.lineWidth = 3; c.beginPath(); c.moveTo(w*.15, h*.1);
  let x = w*.15, y = h*.1; for (let k = 0; k < 8; k++){ x += 18 + Math.random()*10; y += 34 + (Math.random()-.5)*20; c.lineTo(x, y); } c.stroke();
  // graffiti at the foot
  c.save(); c.translate(w*.5, h*.9); c.rotate(-.06); c.fillStyle = 'rgba(200,40,40,.85)'; c.font = '700 26px Impact, "Arial Black", sans-serif';
  c.textAlign = 'center'; c.fillText(['ROAD KAHAN HAI?','ACHHE DIN?','KYA HUA?','WHERE IS DATA'][Math.floor(Math.random()*4)], 0, 0); c.restore();
}) : null;
function satireFrame(st){
  const grp = new THREE.Group();
  const slabMat = new THREE.MeshStandardMaterial({ map: STAIN_TEX, roughness:.95 });
  const slab = new THREE.Mesh(new THREE.BoxGeometry(2.7, 3.6, .22), slabMat); slab.position.y = 1.95; grp.add(slab);
  // top-right corner sheared off (a dark wedge over the slab face)
  const shear = new THREE.Mesh(new THREE.BoxGeometry(.7, .55, .24), new THREE.MeshStandardMaterial({ color:'#5b5754', roughness:1 }));
  shear.position.set(1.05, 3.5, 0); shear.rotation.z = .5; grp.add(shear);
  const foot = new THREE.Mesh(new THREE.BoxGeometry(3.0, .3, .9), new THREE.MeshStandardMaterial({ color:'#7c756e', roughness:1 }));
  foot.position.y = .15; grp.add(foot);
  // rusted rebar hook the picture hangs from — and it hangs crooked
  const rebar = new THREE.MeshStandardMaterial({ color:'#7a4a2c', roughness:.9, metalness:.25 });
  const hook = new THREE.Mesh(new THREE.TorusGeometry(.09,.02,6,12, Math.PI), rebar); hook.position.set(.05, 3.32, .14); grp.add(hook);
  const wire = new THREE.Mesh(new THREE.CylinderGeometry(.008,.008,.42,5), rebar); wire.position.set(.03, 3.1, .14); wire.rotation.z = .1; grp.add(wire);
  const art = artPanel(st, 2.0, 2.15, 1.85, .12, false);
  art.grp.rotation.z = -.05;                                        // crooked
  grp.add(art.grp);
  // a peeling notice pasted at the foot: "PUBLIC NOTICE" with the rest weathered off
  const notice = new THREE.Mesh(new THREE.PlaneGeometry(.7,.45), new THREE.MeshStandardMaterial({
    map: canvasTexture(140,90,(c,w,h) => { c.fillStyle='#e9e4da'; c.fillRect(0,0,w,h); c.fillStyle='#141414'; c.font='700 16px monospace'; c.textAlign='center';
      c.fillText('PUBLIC NOTICE', w/2, 26); c.fillStyle='#8a8178'; for (let y=44;y<h;y+=10) c.fillRect(14, y, w-28-Math.random()*40, 4);
      c.fillStyle='rgba(0,0,0,.35)'; c.beginPath(); c.moveTo(w,h); c.lineTo(w-40,h); c.lineTo(w,h-30); c.closePath(); c.fill(); }), roughness:.85 }));
  notice.position.set(-.85, .62, .12); notice.rotation.z = .12; grp.add(notice);
  return { grp, anchorY: 3.0, art };
}
/* ---- era-styled frames (each holds one glazed picture) ---- */
function mughalFrame(st){
  if (SATIRE) return satireFrame(st);
  const grp = new THREE.Group();
  const shape = new THREE.Shape();
  shape.moveTo(-1.7,0); shape.lineTo(-1.7,4.35); shape.lineTo(1.7,4.35); shape.lineTo(1.7,0); shape.closePath();
  shape.holes.push(cuspedArchHole(1.15, 2.25, 1.15, 7));
  const arch = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth:.3, bevelEnabled:false }), MAT.sandstone);
  arch.position.z = -.15; grp.add(arch);
  const art = artPanel(st, 1.8, 2.0, 1.8, -.12, true);
  grp.add(art.grp);
  const fin = new THREE.Mesh(new THREE.SphereGeometry(.16, 10, 8), MAT.gold);
  fin.position.y = 4.55; grp.add(fin);
  [-1.45,1.45].forEach(x => {                     // carved pilasters
    const p = new THREE.Mesh(pilasterGeo, carveMat);
    p.position.set(x,1.75,.04); grp.add(p);
  });
  const bnd = new THREE.Mesh(bandTrimGeo, carveMat);
  bnd.position.set(0,3.88,.04); grp.add(bnd);     // carved band over the arch
  return { grp, anchorY: 3.1, art };
}
function britishFrame(st){
  if (SATIRE) return satireFrame(st);
  const grp = new THREE.Group();
  const mk = (g, m, x, y, z) => { const q = new THREE.Mesh(g, m); q.position.set(x, y, z); grp.add(q); return q; };
  mk(new THREE.BoxGeometry(3.9,.35,1.0), MAT.slate, 0, .17, 0);                       // plinth
  mk(new THREE.CylinderGeometry(.14,.16,3.3,10), MAT.colonial, -1.55, 2.0, 0);
  mk(new THREE.CylinderGeometry(.14,.16,3.3,10), MAT.colonial,  1.55, 2.0, 0);
  mk(new THREE.BoxGeometry(3.9,.3,.7), MAT.colonial, 0, 3.8, 0);                      // entablature
  const ped = new THREE.Shape();                                                       // pediment
  ped.moveTo(-1.95,0); ped.lineTo(1.95,0); ped.lineTo(0,.85); ped.closePath();
  const pm = new THREE.Mesh(new THREE.ExtrudeGeometry(ped,{depth:.5,bevelEnabled:false}), MAT.slate);
  pm.position.set(0,3.95,-.25); grp.add(pm);
  const dent = new THREE.Mesh(dentilGeo, MAT.colonial);
  dent.position.set(0,3.6,.34); grp.add(dent);                                         // dentil course
  const art = artPanel(st, 2.2, 2.3, 2.1, -.12, false);
  grp.add(art.grp);
  return { grp, anchorY: 3.3, art };
}
function freedomFrame(st){
  if (SATIRE) return satireFrame(st);
  const grp = new THREE.Group();
  const base = new THREE.Mesh(new THREE.BoxGeometry(2.8,.5,1.1), MAT.white); base.position.y=.25; grp.add(base);
  const slab = new THREE.Mesh(new THREE.BoxGeometry(2.5,3.1,.18), new THREE.MeshStandardMaterial({
    color:'#efede6', roughness:.7, emissive:new THREE.Color(st.accent), emissiveIntensity:.06 }));
  slab.position.y = 2.05; grp.add(slab);
  const stripe = new THREE.Mesh(new THREE.BoxGeometry(2.5,.1,.2),
    new THREE.MeshStandardMaterial({ color:st.accent, roughness:.6 }));
  stripe.position.set(0,3.62,.0); grp.add(stripe);
  const art = artPanel(st, 2.0, 2.2, 2.05, .11, false);
  grp.add(art.grp);
  return { grp, anchorY: 2.9, art };
}
function flashbackFrame(st){     // 1600 EIC charter: a parchment out of time
  const grp = new THREE.Group();
  const backing = new THREE.Mesh(new THREE.PlaneGeometry(2.15,2.75),
    new THREE.MeshStandardMaterial({ color:'#d8c49a', roughness:.9 }));
  backing.position.y = 2.1; grp.add(backing);
  const fr = new THREE.Mesh(new THREE.BoxGeometry(2.35,3.0,.14), MAT.darkWood);
  fr.position.set(0,2.1,-.09); grp.add(fr);
  const art = artPanel(st, 1.8, 2.2, 2.1, .02, true);
  grp.add(art.grp);
  const seal = new THREE.Mesh(new THREE.CylinderGeometry(.13,.13,.03,14),
    new THREE.MeshStandardMaterial({ color:'#8d1f1f', roughness:.6 }));
  seal.rotation.x = Math.PI/2; seal.position.set(.78,.82,.06); grp.add(seal);
  grp.rotation.z = 0.045;
  return { grp, anchorY: 3.0, art };
}

/* ---- symbolic props (procedural primitives only) ---- */
function makeCrown(){
  const crown = new THREE.Group();
  const band = new THREE.Mesh(new THREE.CylinderGeometry(.42,.46,.3,16), MAT.gold); crown.add(band);
  for (let i=0;i<8;i++){ const a=i*Math.PI/4;
    const pt = new THREE.Mesh(new THREE.ConeGeometry(.09,.3,6), MAT.gold);
    pt.position.set(.4*Math.cos(a), .3, .4*Math.sin(a)); crown.add(pt); }
  [0,Math.PI/2].forEach(rot => {
    const arc = new THREE.Mesh(new THREE.TorusGeometry(.4,.045,8,14,Math.PI), MAT.gold);
    arc.rotation.y = rot; arc.position.y = .3; crown.add(arc); });
  const orb = new THREE.Mesh(new THREE.SphereGeometry(.09,10,8), MAT.gold); orb.position.y=.78; crown.add(orb);
  const capMat = new THREE.MeshStandardMaterial({ color:'#6E2138', roughness:.72 });
  const cap = new THREE.Mesh(new THREE.SphereGeometry(.37,12,8,0,Math.PI*2,0,Math.PI/2), capMat);
  cap.position.y = .1; crown.add(cap);                             // the velvet within the band
  return crown;
}
const STEEL = new THREE.MeshStandardMaterial({ color:'#c8ccd2', metalness:.8, roughness:.35 });
const DARKSTONE = new THREE.MeshStandardMaterial({ color:'#2b2d30', roughness:.9 });
const FLAME = () => new THREE.MeshBasicMaterial({ color:'#ffb066', toneMapped:false });
/* a thin cylinder from a to b — chains, guys, spokes */
const rod = (a, b, r, mat) => {
  const d = new THREE.Vector3().subVectors(b, a), len = d.length();
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 5), mat);
  m.position.copy(a).addScaledVector(d, .5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), d.normalize());
  return m;
};
/* a capsule "limb" between two joints — organic forms (horse, rider) */
const limb = (a, b, r, mat) => {
  const d = new THREE.Vector3().subVectors(b, a), len = d.length();
  const m = new THREE.Mesh(new THREE.CapsuleGeometry(r, Math.max(len - r * .5, .02), 3, 10), mat);
  m.position.copy(a).addScaledVector(d, .5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), d.normalize());
  return m;
};
/* a curved talwar blade lying in the XY plane, hilt at the origin,
   sweeping toward +X as it rises — extruded flat with a tapered tip */
function talwarGeo(len = .7, w = .05, curve = .24){
  const N = 10, outer = [], inner = [];
  for (let i = 0; i <= N; i++){
    const t = i / N, y = t * len, x = curve * len * t * t, half = w * (1 - t * .8);
    outer.push([x + half, y]); inner.push([x - half, y]);
  }
  const s = new THREE.Shape();
  s.moveTo(inner[0][0], inner[0][1]);
  outer.forEach(([x, y]) => s.lineTo(x, y));
  s.lineTo(curve * len + w * .1, len * 1.06);          // the point
  for (let i = N; i >= 0; i--) s.lineTo(inner[i][0], inner[i][1]);
  s.closePath();
  return new THREE.ExtrudeGeometry(s, { depth: .014, bevelEnabled: false });
}
const PROPS = {
  /* ---- the 2014→today corridor's props: satire, no faces ---------------
     Every one of these mocks a habit, an object or an office — never a
     likeness. The Orator is an empty suit at a podium with a mute mic. */
  podium(){ const g = new THREE.Group();                                  // The Orator: the role, not a man
    const wood = new THREE.MeshStandardMaterial({ color:'#5a3a22', roughness:.75 });
    const suit = new THREE.MeshStandardMaterial({ color:'#2a2a2e', roughness:.85 });
    const dais = new THREE.Mesh(new THREE.BoxGeometry(1.7,.22,1.2), MAT.slate); dais.position.y = .11; g.add(dais);
    const pod = new THREE.Mesh(new THREE.BoxGeometry(.7,1.15,.5), wood); pod.position.set(0,.8,.25); g.add(pod);
    const top = new THREE.Mesh(new THREE.BoxGeometry(.8,.06,.6), wood); top.position.set(0,1.4,.25); top.rotation.x = -.18; g.add(top);
    // an outsized empty suit — shoulders, no head, sleeves ending in nothing
    const torso = new THREE.Mesh(new THREE.CylinderGeometry(.34,.4,1.0,10), suit); torso.position.set(0,1.42,-.3); g.add(torso);
    const shoulders = new THREE.Mesh(new THREE.BoxGeometry(1.15,.16,.5), suit); shoulders.position.set(0,1.95,-.3); g.add(shoulders);
    [-1,1].forEach(sg => { const arm = new THREE.Mesh(new THREE.CylinderGeometry(.09,.11,.85,8), suit);
      arm.position.set(sg*.62,1.55,-.15); arm.rotation.z = sg*.35; arm.rotation.x = -.35; g.add(arm); });
    // where a head would be: a rosette of ✓ ticks — the "verified" halo — spinning slowly is done in CSS-land elsewhere; here it's static
    const halo = new THREE.Mesh(new THREE.TorusGeometry(.26,.03,8,24), MAT.gold); halo.position.set(0,2.32,-.3); halo.rotation.x = Math.PI/2; g.add(halo);
    // the microphone: on a gooseneck, with a big red MUTE light
    g.add(rod(new THREE.Vector3(.2,1.44,.3), new THREE.Vector3(.1,1.9,.05), .012, MAT.iron));
    const mic = new THREE.Mesh(new THREE.CapsuleGeometry(.05,.14,4,8), MAT.iron); mic.position.set(.09,1.98,.02); mic.rotation.x = .5; g.add(mic);
    const mute = new THREE.Mesh(new THREE.SphereGeometry(.035,8,6),
      new THREE.MeshBasicMaterial({ color:'#ff2a2a', toneMapped:false })); mute.position.set(.13,1.9,.08); g.add(mute);
    // stacked, unopened question cards at the podium's foot
    for (let i = 0; i < 6; i++){ const card = new THREE.Mesh(new THREE.BoxGeometry(.32,.02,.22), MAT.white);
      card.position.set(-.55 + (i%2)*.06, .24 + i*.021, .5 + (i%3)*.03); card.rotation.y = (i%2 ? .2 : -.15); g.add(card); }
    return g; },
  forward(){ const g = new THREE.Group();                                 // the WhatsApp forward: a cloud with a tick, on a stand
    const cloudMat = new THREE.MeshStandardMaterial({ color:'#dfe9de', roughness:.9 });
    const stand = new THREE.Mesh(new THREE.CylinderGeometry(.05,.07,1.3,8), MAT.iron); stand.position.y = .65; g.add(stand);
    const base = new THREE.Mesh(new THREE.CylinderGeometry(.35,.4,.08,12), MAT.slate); base.position.y = .04; g.add(base);
    [[0,1.55,0,.34],[-.32,1.45,0,.26],[.3,1.47,.02,.27],[-.1,1.72,-.02,.24],[.15,1.7,.03,.22]].forEach(([x,y,z,r]) => {
      const b = new THREE.Mesh(new THREE.SphereGeometry(r,12,9), cloudMat); b.position.set(x,y,z); g.add(b); });
    const tail = new THREE.Mesh(new THREE.ConeGeometry(.12,.28,8), cloudMat); tail.position.set(-.38,1.2,.02); tail.rotation.z = .6; g.add(tail);
    // double blue tick — the seal of truth
    const tickMat = new THREE.MeshBasicMaterial({ color:'#3aa0e8', toneMapped:false });
    [[.02,0],[.14,0]].forEach(([dx]) => {
      g.add(rod(new THREE.Vector3(-.12+dx,1.5,.36), new THREE.Vector3(-.02+dx,1.4,.36), .016, tickMat));
      g.add(rod(new THREE.Vector3(-.02+dx,1.4,.36), new THREE.Vector3(.14+dx,1.62,.36), .016, tickMat)); });
    // "Forwarded many times" tag
    const tag = new THREE.Mesh(new THREE.PlaneGeometry(.7,.16), new THREE.MeshStandardMaterial({
      map: canvasTexture(256,64,(c,w,h) => { c.fillStyle='#fff'; c.fillRect(0,0,w,h); c.fillStyle='#667'; c.font='italic 24px sans-serif';
        c.textAlign='center'; c.fillText('↪ Forwarded many times', w/2, 42); }), roughness:.8 }));
    tag.position.set(0,1.02,.2); g.add(tag);
    return g; },
  queue(){ const g = new THREE.Group();                                   // the ATM queue: ropes, no ATM
    const postGeo = new THREE.CylinderGeometry(.03,.04,.95,8);
    const pts = [[-.9,0,.6],[-.3,0,.7],[.3,0,.55],[.9,0,.6]];
    pts.forEach(([x,,z]) => { const p = new THREE.Mesh(postGeo, MAT.iron); p.position.set(x,.48,z); g.add(p);
      const b = new THREE.Mesh(new THREE.CylinderGeometry(.14,.16,.04,10), MAT.iron); b.position.set(x,.02,z); g.add(b); });
    const rope = new THREE.MeshStandardMaterial({ color:'#a2233b', roughness:.9 });
    for (let i = 0; i < pts.length-1; i++){
      const a = new THREE.Vector3(pts[i][0], .9, pts[i][2]), b = new THREE.Vector3(pts[i+1][0], .9, pts[i+1][2]);
      const mid = a.clone().lerp(b,.5); mid.y -= .16;
      g.add(rod(a, mid, .02, rope)); g.add(rod(mid, b, .02, rope)); }
    // the machine at the end: a grey box with a black screen and one line on it
    const atm = new THREE.Mesh(new THREE.BoxGeometry(.7,1.4,.5), MAT.slate); atm.position.set(1.5,.7,.6); g.add(atm);
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(.42,.28), new THREE.MeshBasicMaterial({
      map: canvasTexture(256,170,(c,w,h) => { c.fillStyle='#0a1a12'; c.fillRect(0,0,w,h); c.fillStyle='#4cff7a'; c.font='700 30px monospace';
        c.textAlign='center'; c.fillText('OUT OF CASH', w/2, 76); c.font='20px monospace'; c.fillText('try 2018', w/2, 120); }), toneMapped:false }));
    screen.position.set(1.5,1.02,.86); g.add(screen);
    // one shoe left behind
    const shoe = new THREE.Mesh(new THREE.BoxGeometry(.24,.08,.1), MAT.darkWood); shoe.position.set(-.5,.04,.35); shoe.rotation.y = .5; g.add(shoe);
    return g; },
  scissors(){ const g = new THREE.Group();                                // ribbon-cutting: the ribbon is cut, the thing behind it isn't built
    const cushion = new THREE.Mesh(new THREE.CylinderGeometry(.5,.55,.2,14),
      new THREE.MeshStandardMaterial({ color:'#6E2138', roughness:.7 })); cushion.position.y = .62; g.add(cushion);
    const ped = new THREE.Mesh(new THREE.CylinderGeometry(.35,.45,.55,12), MAT.marble); ped.position.y = .27; g.add(ped);
    // golden scissors, open, oversized
    const blade = new THREE.MeshStandardMaterial({ color:'#d9b24a', metalness:.85, roughness:.3 });
    [-.35,.35].forEach(a => { const b = new THREE.Mesh(new THREE.BoxGeometry(.06,.9,.02), blade);
      b.position.set(0,1.05,0); b.rotation.z = a; g.add(b);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(.11,.02,8,16), blade); ring.position.set(Math.sin(a)*.5, .62, 0); ring.rotation.y = 0; g.add(ring); });
    // the ribbon: two saffron halves fluttering off either side
    const rib = new THREE.MeshStandardMaterial({ color:'#FF9933', roughness:.8, side: THREE.DoubleSide });
    [-1,1].forEach(sg => { const r = new THREE.Mesh(new THREE.PlaneGeometry(.9,.12,8,1), rib);
      const pos = r.geometry.attributes.position; for (let i=0;i<pos.count;i++){ const x=pos.getX(i); pos.setZ(i, Math.sin(x*6)*.06); }
      pos.needsUpdate = true; r.position.set(sg*.75,1.05,0); r.rotation.z = sg*.35; g.add(r); });
    // behind the pedestal: a "PROJECT SITE" board and one brick
    const board = new THREE.Mesh(new THREE.PlaneGeometry(.9,.5), new THREE.MeshStandardMaterial({
      map: canvasTexture(256,142,(c,w,h) => { c.fillStyle='#e9e4da'; c.fillRect(0,0,w,h); c.strokeStyle='#c0392b'; c.lineWidth=8; c.strokeRect(6,6,w-12,h-12);
        c.fillStyle='#141414'; c.font='700 30px Georgia'; c.textAlign='center'; c.fillText('PROJECT SITE', w/2, 62);
        c.font='18px monospace'; c.fillStyle='#4a4a4a'; c.fillText('completion: TBD', w/2, 104); }), roughness:.85, side: THREE.DoubleSide }));
    board.position.set(0,1.1,-.9); g.add(board);
    g.add(rod(new THREE.Vector3(0,.0,-.9), new THREE.Vector3(0,.85,-.9), .02, MAT.iron));
    const brick = new THREE.Mesh(new THREE.BoxGeometry(.24,.12,.12), new THREE.MeshStandardMaterial({ color:'#9a4a32', roughness:.9 }));
    brick.position.set(.5,.06,-.75); brick.rotation.y = .4; g.add(brick);
    return g; },
  cabinet(){ const g = new THREE.Group();                                 // the file cabinet: every drawer open, every drawer empty
    const body = new THREE.Mesh(new THREE.BoxGeometry(.7,1.5,.55), MAT.slate); body.position.y = .75; g.add(body);
    for (let i = 0; i < 4; i++){
      const y = .25 + i*.36, out = [.28,.42,.18,.36][i];
      const drawer = new THREE.Mesh(new THREE.BoxGeometry(.62,.3,.5), new THREE.MeshStandardMaterial({ color:'#7c8288', roughness:.7, metalness:.3 }));
      drawer.position.set(0,y,.02+out); g.add(drawer);
      const handle = new THREE.Mesh(new THREE.BoxGeometry(.18,.03,.03), MAT.iron); handle.position.set(0,y,.28+out); g.add(handle);
      const label = new THREE.Mesh(new THREE.PlaneGeometry(.22,.08), new THREE.MeshStandardMaterial({
        map: canvasTexture(128,48,(c,w,h) => { c.fillStyle='#fff'; c.fillRect(0,0,w,h); c.fillStyle='#333'; c.font='700 22px monospace';
          c.textAlign='center'; c.fillText(['RTI','AUDIT','MINUTES','REPLIES'][i], w/2, 33); }), roughness:.8 }));
      label.position.set(0,y+.09,.275+out); g.add(label);
    }
    // a single moth
    const moth = new THREE.Mesh(new THREE.PlaneGeometry(.08,.05), new THREE.MeshStandardMaterial({ color:'#a89f8c', side: THREE.DoubleSide }));
    moth.position.set(.2,1.2,.6); moth.rotation.y = .6; g.add(moth);
    return g; },
  pothole(){ const g = new THREE.Group();                                 // the pothole with a traffic cone in it, and a garland on the cone
    const rim = new THREE.Mesh(new THREE.TorusGeometry(.5,.08,8,22), new THREE.MeshStandardMaterial({ color:'#3d3935', roughness:.95 }));
    rim.rotation.x = Math.PI/2; rim.position.y = .02; g.add(rim);
    const water = new THREE.Mesh(new THREE.CircleGeometry(.46,22), new THREE.MeshStandardMaterial({ color:'#3a4a56', roughness:.2, metalness:.4 }));
    water.rotation.x = -Math.PI/2; water.position.y = .01; g.add(water);
    const cone = new THREE.Mesh(new THREE.ConeGeometry(.16,.55,10), new THREE.MeshStandardMaterial({ color:'#ff6a00', roughness:.7 }));
    cone.position.set(0,.3,0); cone.rotation.z = .18; g.add(cone);
    const band = new THREE.Mesh(new THREE.CylinderGeometry(.11,.13,.08,10), MAT.white); band.position.set(.03,.36,0); band.rotation.z = .18; g.add(band);
    // marigold garland — because it was inaugurated
    for (let i = 0; i < 10; i++){ const a = i*.63; const m = new THREE.Mesh(new THREE.SphereGeometry(.035,6,5),
      new THREE.MeshStandardMaterial({ color: i%2 ? '#e8901f' : '#d4691b', roughness:.8 }));
      m.position.set(Math.cos(a)*.16, .5 - Math.abs(Math.sin(a))*.06, Math.sin(a)*.16); g.add(m); }
    // a "DRIVE SAFE" sign fallen face-up
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(.5,.3), new THREE.MeshStandardMaterial({
      map: canvasTexture(200,120,(c,w,h) => { c.fillStyle='#f4efe0'; c.fillRect(0,0,w,h); c.fillStyle='#c0392b'; c.font='700 34px Georgia';
        c.textAlign='center'; c.fillText('DRIVE SAFE', w/2, 72); }), roughness:.85, side: THREE.DoubleSide }));
    sign.rotation.x = -Math.PI/2 + .1; sign.position.set(.75,.03,.3); sign.rotation.z = -.4; g.add(sign);
    return g; },

  scrolls(){ const g = new THREE.Group();                                 // firmans, acts, charters
    const desk = new THREE.Mesh(new THREE.BoxGeometry(.9,.5,.55), MAT.darkWood); desk.position.y=.25; g.add(desk);
    const pm = new THREE.MeshStandardMaterial({ color:'#e4d6b0', roughness:.85 });
    [[-.2,.58,0,0],[.15,.58,.15,.4],[0,.66,-.1,-.3]].forEach(([x,y,z,ry]) => {
      const sc = new THREE.Mesh(new THREE.CylinderGeometry(.06,.06,.7,8), pm);
      sc.rotation.z = Math.PI/2; sc.rotation.y = ry; sc.position.set(x,y,z); g.add(sc); });
    const seal = new THREE.Mesh(new THREE.CylinderGeometry(.05,.05,.02,8),
      new THREE.MeshStandardMaterial({ color:'#8d1f1f', roughness:.6 }));
    seal.position.set(.28,.6,.2); g.add(seal);
    return g; },
  book(){ const g = new THREE.Group();                                    // reform & new learning
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(.72,.72,.52), MAT.sandstone);
    plinth.position.y = .36; g.add(plinth);
    // cloth-bound covers with gold rules, lying open
    const coverTex = canvasTexture(64,48,(c,w,h) => {
      c.fillStyle='#5a2f24'; c.fillRect(0,0,w,h);
      c.strokeStyle='#caa36b'; c.lineWidth=2; c.strokeRect(4,4,w-8,h-8); c.strokeRect(9,9,w-18,h-18);
    });
    const coverMat = new THREE.MeshStandardMaterial({ map:coverTex, roughness:.85 });
    const pageMat  = new THREE.MeshStandardMaterial({ color:'#efe9d8', roughness:.92 });
    [[-.19,.16],[.19,-.16]].forEach(([x,rz]) => {
      const cover = new THREE.Mesh(new THREE.BoxGeometry(.4,.025,.54), coverMat);
      cover.rotation.z = rz; cover.position.set(x,.745,0); g.add(cover);
      [0,1,2].forEach(k => {                                     // fanned page block
        const page = new THREE.Mesh(new THREE.BoxGeometry(.36 - k*.02, .016, .5 - k*.015), pageMat);
        page.rotation.z = rz * (1 - k*.18);
        page.position.set(x*(1 - k*.08), .77 + k*.018, 0); g.add(page);
      });
    });
    const spine = new THREE.Mesh(new THREE.BoxGeometry(.06,.03,.54), coverMat);
    spine.position.set(0,.735,0); g.add(spine);
    // a proper diya beside it
    const diyaProf = [[.001,0],[.09,.012],[.115,.05],[.09,.085],[.05,.09]]
      .map(([r,y]) => new THREE.Vector2(Math.max(r,.001), y));
    const diya = new THREE.Mesh(new THREE.LatheGeometry(diyaProf,12),
      new THREE.MeshStandardMaterial({ color:'#b08d3e', metalness:.75, roughness:.4 }));
    diya.position.set(.52,0,.2); g.add(diya);
    const fl = new THREE.Mesh(new THREE.ConeGeometry(.028,.09,6), FLAME());
    fl.position.set(.52,.13,.2); g.add(fl);
    return g; },
  bowl(){ const g = new THREE.Group();                                    // famine memorial: an empty bowl
    const base = new THREE.Mesh(new THREE.BoxGeometry(.8,.18,.8), DARKSTONE); base.position.y=.09; g.add(base);
    const b = new THREE.Mesh(new THREE.CylinderGeometry(.3,.16,.2,14,1,true),
      new THREE.MeshStandardMaterial({ color:'#8a7a64', roughness:.95, side:THREE.DoubleSide }));
    b.position.y=.28; g.add(b);
    const bottom = new THREE.Mesh(new THREE.CircleGeometry(.16,14),
      new THREE.MeshStandardMaterial({ color:'#6a5c4a', roughness:1 }));
    bottom.rotation.x = -Math.PI/2; bottom.position.y=.19; g.add(bottom);
    return g; },
  flames3(){ const g = new THREE.Group();                                 // three martyrs' flames
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(1.15,.3,.4), DARKSTONE); plinth.position.y=.15; g.add(plinth);
    [-.35,0,.35].forEach(x => {
      const cup = new THREE.Mesh(new THREE.CylinderGeometry(.08,.05,.07,8), MAT.iron); cup.position.set(x,.34,0); g.add(cup);
      const fl = new THREE.Mesh(new THREE.ConeGeometry(.045,.13,6), FLAME()); fl.position.set(x,.44,0); g.add(fl); });
    return g; },
  crown(){ const g = new THREE.Group();                                   // Empress of India
    const ped = new THREE.Mesh(new THREE.CylinderGeometry(.35,.45,.9,10), MAT.marble); ped.position.y=.45; g.add(ped);
    const cr = makeCrown(); cr.scale.setScalar(.8); cr.position.y = 1.05; g.add(cr);
    return g; },
  khanda(){ const g = new THREE.Group();                                  // the Khalsa emblem in steel
    const base = new THREE.Mesh(new THREE.CylinderGeometry(.3,.38,.25,10), MAT.sandstone);
    base.position.y = .12; g.add(base);
    const chakkar = new THREE.Mesh(new THREE.TorusGeometry(.34,.05,10,28), STEEL);
    chakkar.position.y = .95; g.add(chakkar);                             // the war quoit
    // central double-edged khanda blade with a spear point
    const kb = new THREE.Shape();
    kb.moveTo(-.07,0); kb.lineTo(.07,0); kb.lineTo(.05,.62); kb.lineTo(0,.8); kb.lineTo(-.05,.62); kb.closePath();
    const blade = new THREE.Mesh(new THREE.ExtrudeGeometry(kb,
      { depth:.02, bevelEnabled:true, bevelThickness:.008, bevelSize:.012, bevelSegments:1 }), STEEL);
    blade.position.set(0,.52,-.01); g.add(blade);
    const hilt = new THREE.Mesh(new THREE.CylinderGeometry(.045,.05,.22,8), MAT.iron);
    hilt.position.y = .42; g.add(hilt);
    const hguard = new THREE.Mesh(new THREE.CylinderGeometry(.08,.08,.02,10), MAT.iron);
    hguard.position.y = .53; g.add(hguard);
    // two crossed kirpans behind the ring
    [1,-1].forEach(sgn => {
      const k = new THREE.Group();
      k.add(new THREE.Mesh(talwarGeo(.72,.04,.28), STEEL));
      const kg = new THREE.Mesh(new THREE.CylinderGeometry(.05,.05,.018,8), MAT.gold); k.add(kg);
      const kgrip = new THREE.Mesh(new THREE.CylinderGeometry(.02,.024,.12,6), MAT.darkWood);
      kgrip.position.y = -.08; k.add(kgrip);
      k.position.set(0,.58,-.06); k.rotation.z = sgn * .7;
      if (sgn < 0) k.rotation.y = Math.PI;
      g.add(k);
    });
    return g; },
  swords(){ const g = new THREE.Group();                                  // crossed talwars on a stand
    const stand = new THREE.Mesh(new THREE.BoxGeometry(.8,.12,.42), MAT.darkWood); stand.position.y=.06; g.add(stand);
    const rest = new THREE.Mesh(new THREE.BoxGeometry(.5,.07,.12), MAT.darkWood); rest.position.y=.16; g.add(rest);
    [1,-1].forEach(sgn => {
      const sword = new THREE.Group();
      sword.add(new THREE.Mesh(talwarGeo(1.0,.05,.22), STEEL));           // curved blade
      const guard = new THREE.Mesh(new THREE.CylinderGeometry(.075,.075,.02,10), MAT.gold);
      sword.add(guard);                                                   // disc guard at the shoulder
      const grip = new THREE.Mesh(new THREE.CylinderGeometry(.028,.032,.16,8), MAT.darkWood);
      grip.position.y = -.1; sword.add(grip);
      const pommel = new THREE.Mesh(new THREE.CylinderGeometry(.055,.055,.025,10), MAT.gold);
      pommel.position.y = -.2; sword.add(pommel);
      sword.position.set(0,.34,0); sword.rotation.z = sgn * .6;
      if (sgn < 0) sword.rotation.y = Math.PI;                            // mirror the curve
      g.add(sword);
    });
    return g; },
  hillfort(accent){ const g = new THREE.Group();                          // a gadhi in miniature
    // jagged little scarp
    const hillGeo = new THREE.ConeGeometry(.92,.95,10,3);
    const hp = hillGeo.attributes.position;
    for (let i = 0; i < hp.count; i++){
      const x = hp.getX(i), z = hp.getZ(i), a = Math.atan2(z,x);
      const k = 1 + (Math.sin(a*3.2+2)*.5 + Math.sin(a*6.7)*.3) * .09;
      hp.setX(i, x*k); hp.setZ(i, z*k);
    }
    hillGeo.computeVertexNormals();
    const hill = new THREE.Mesh(hillGeo,
      new THREE.MeshStandardMaterial({ color:'#6a5b44', roughness:1 }));
    hill.position.y = .47; g.add(hill);
    const plateau = new THREE.Mesh(new THREE.CylinderGeometry(.42,.52,.16,9), MAT.sandDark);
    plateau.position.y = .98; g.add(plateau);
    // merged merlon ring around the crown of the hill
    const mparts = [];
    for (let i = 0; i < 9; i++){
      const a = i * Math.PI * 2 / 9;
      if (Math.abs(a - Math.PI/2) < .4) continue;                 // gate notch toward the walk
      const b = new THREE.BoxGeometry(.14,.1,.06);
      b.rotateY(a + Math.PI/2);
      b.translate(Math.cos(a)*.43, 1.1, Math.sin(a)*.43);
      mparts.push(b);
    }
    g.add(new THREE.Mesh(mergeGeometries(mparts), MAT.sandDark));
    const keep = new THREE.Mesh(new THREE.BoxGeometry(.34,.28,.3), MAT.sandDark);
    keep.position.set(-.06,1.2,-.06); g.add(keep);
    const tower = new THREE.Mesh(new THREE.CylinderGeometry(.09,.11,.34,7), MAT.sandDark);
    tower.position.set(.24,1.2,.16); g.add(tower);
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(.013,.016,.55,5), MAT.darkWood);
    pole.position.set(-.06,1.55,-.06); g.add(pole);
    const fs = new THREE.Shape();                                 // little jari-patka
    fs.moveTo(0,.15); fs.lineTo(.34,.11); fs.lineTo(.2,.075); fs.lineTo(.34,.04); fs.lineTo(0,0); fs.closePath();
    const fl = new THREE.Mesh(new THREE.ShapeGeometry(fs),
      new THREE.MeshStandardMaterial({ color:accent||'#E07B39', side:THREE.DoubleSide, roughness:.8 }));
    fl.position.set(-.05,1.66,-.06); g.add(fl);
    return g; },
  bonfire(){ const g = new THREE.Group();                                 // Swadeshi: foreign cloth burns
    const scorch = new THREE.Mesh(new THREE.CircleGeometry(.6,14),
      new THREE.MeshStandardMaterial({ color:'#16100b', roughness:1 }));
    scorch.rotation.x = -Math.PI/2; scorch.position.y = .012; g.add(scorch);
    [.4,-.3,.9].forEach(ry => { const log = new THREE.Mesh(new THREE.CylinderGeometry(.05,.05,.8,6), MAT.darkWood);
      log.rotation.set(Math.PI/2.4, ry, 0); log.position.y=.15; g.add(log); });
    const fl = new THREE.Mesh(new THREE.ConeGeometry(.24,.62,7),
      new THREE.MeshBasicMaterial({ color:'#ff8844', toneMapped:false })); fl.position.y=.5; g.add(fl);
    const fl2 = new THREE.Mesh(new THREE.ConeGeometry(.13,.44,6),
      new THREE.MeshBasicMaterial({ color:'#ffd077', toneMapped:false })); fl2.position.y=.64; g.add(fl2);
    const fl3 = new THREE.Mesh(new THREE.ConeGeometry(.06,.3,6),
      new THREE.MeshBasicMaterial({ color:'#fff3c8', toneMapped:false })); fl3.position.y=.76; g.add(fl3);
    // bales of imported cloth, mill-woven stripes showing
    const weave = canvasTexture(64,64,(c,w,h) => {
      c.fillStyle='#cfc4a8'; c.fillRect(0,0,w,h);
      c.fillStyle='rgba(150,60,40,.6)'; for (let y=6;y<h;y+=16) c.fillRect(0,y,w,4);
      c.fillStyle='rgba(60,70,120,.4)'; for (let x=8;x<w;x+=20) c.fillRect(x,0,3,h);
    });
    const baleMat = new THREE.MeshStandardMaterial({ map:weave, roughness:.9 });
    const b1 = new THREE.Mesh(new THREE.BoxGeometry(.42,.26,.3), baleMat);
    b1.position.set(.58,.13,.2); b1.rotation.y=.3; g.add(b1);
    const b2 = new THREE.Mesh(new THREE.BoxGeometry(.36,.22,.26), baleMat);
    b2.position.set(.52,.37,.16); b2.rotation.y=-.2; g.add(b2);
    const b3 = new THREE.Mesh(new THREE.BoxGeometry(.34,.2,.24), baleMat);
    b3.position.set(-.5,.1,-.28); b3.rotation.set(.12,.8,0); g.add(b3);   // one tipped toward the fire
    return g; },
  loco(){ const g = PROPS.rail();                                         // 1853: engine on the new rails
    const loco = new THREE.MeshStandardMaterial({ color:'#23282c', metalness:.55, roughness:.5 });
    const brass = MAT.gold;
    const boiler = new THREE.Mesh(new THREE.CylinderGeometry(.17,.17,.82,12), loco);
    boiler.rotation.z = Math.PI/2; boiler.position.set(-.28,.52,0); g.add(boiler);
    [-.55,-.28,-.02].forEach(x => {                                       // boiler bands
      const bd = new THREE.Mesh(new THREE.TorusGeometry(.172,.012,6,16), brass);
      bd.rotation.y = Math.PI/2; bd.position.set(x,.52,0); g.add(bd); });
    const smokebox = new THREE.Mesh(new THREE.CylinderGeometry(.175,.175,.1,12), MAT.charcoal);
    smokebox.rotation.z = Math.PI/2; smokebox.position.set(-.73,.52,0); g.add(smokebox);
    const funnel = new THREE.Mesh(new THREE.CylinderGeometry(.075,.05,.3,10), loco);
    funnel.position.set(-.66,.82,0); g.add(funnel);
    const fLip = new THREE.Mesh(new THREE.CylinderGeometry(.09,.075,.05,10), brass);
    fLip.position.set(-.66,.98,0); g.add(fLip);
    const dome = new THREE.Mesh(new THREE.SphereGeometry(.085,10,8), brass);
    dome.position.set(-.3,.71,0); g.add(dome);                            // steam dome
    const sand = new THREE.Mesh(new THREE.SphereGeometry(.065,8,6), loco);
    sand.position.set(-.06,.7,0); g.add(sand);                            // sand dome
    const cab = new THREE.Mesh(new THREE.BoxGeometry(.4,.46,.38), loco);
    cab.position.set(.34,.58,0); g.add(cab);
    const roof = new THREE.Mesh(new THREE.BoxGeometry(.46,.03,.44), MAT.charcoal);
    roof.position.set(.34,.83,0); g.add(roof);
    [-.19,.19].forEach(z => { const win = new THREE.Mesh(new THREE.PlaneGeometry(.14,.14),
      new THREE.MeshStandardMaterial({ color:'#0c0d0f', roughness:.3 }));
      win.position.set(.3,.64,z*1.02); win.rotation.y = z>0?0:Math.PI; g.add(win); });
    const bufferBeam = new THREE.Mesh(new THREE.BoxGeometry(.06,.14,.5),
      new THREE.MeshStandardMaterial({ color:'#7a2a20', roughness:.7 }));
    bufferBeam.position.set(-.82,.32,0); g.add(bufferBeam);
    [-.16,.16].forEach(z => { const buf = new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,.08,8), MAT.iron);
      buf.rotation.z = Math.PI/2; buf.position.set(-.87,.32,z); g.add(buf); });
    [-.19,.19].forEach(z => {                                             // wheels + coupling rods
      [-.52,-.14,.3].forEach(x => {
        const wh = new THREE.Mesh(new THREE.CylinderGeometry(.145,.145,.045,12), MAT.charcoal);
        wh.rotation.x = Math.PI/2; wh.position.set(x,.3,z); g.add(wh);
        const hubcap = new THREE.Mesh(new THREE.CylinderGeometry(.03,.03,.05,8), brass);
        hubcap.rotation.x = Math.PI/2; hubcap.position.set(x,.3,z*1.06); g.add(hubcap);
      });
      const rodM = new THREE.Mesh(new THREE.BoxGeometry(.86,.028,.02), MAT.iron);
      rodM.position.set(-.11,.245,z*1.14); g.add(rodM);
    });
    return g; },
  cannon(){ const g = new THREE.Group();                    // bronze field gun
    const bronze = new THREE.MeshStandardMaterial({ color:'#6e5424', metalness:.8, roughness:.34 });
    // barrel turned on a lathe: cascabel knob, breech swell,
    // reinforcing rings along the chase, flared muzzle with bore lip
    const prof = [
      [0,.001],[.012,.042],[.05,.054],[.078,.04],[.09,.088],[.13,.115],[.2,.108],
      [.22,.125],[.24,.104],[.5,.086],[.52,.1],[.54,.082],[.82,.068],
      [.94,.062],[1.0,.085],[1.05,.093],[1.09,.06],[1.09,.045],[1.02,.05],[1.02,.001]
    ].map(([y, r]) => new THREE.Vector2(r, y));
    const barrel = new THREE.Mesh(new THREE.LatheGeometry(prof, 20), bronze);
    barrel.rotation.x = Math.PI/2 - .26;                    // muzzle raised toward the field
    barrel.position.set(0, .5, -.18); g.add(barrel);
    const trunnion = new THREE.Mesh(new THREE.CylinderGeometry(.045,.045,.46,8), bronze);
    trunnion.rotation.z = Math.PI/2; trunnion.position.set(0, .5, .02); g.add(trunnion);
    // spoked wheels with iron tyres
    const mkWheel = () => {
      const w = new THREE.Group();
      w.add(new THREE.Mesh(new THREE.TorusGeometry(.3, .045, 10, 22), MAT.darkWood));
      w.add(new THREE.Mesh(new THREE.TorusGeometry(.318, .018, 8, 26), MAT.iron));
      const hub = new THREE.Mesh(new THREE.CylinderGeometry(.062, .062, .12, 10), MAT.wood);
      hub.rotation.x = Math.PI / 2; w.add(hub);
      for (let i = 0; i < 8; i++){
        const a = i * Math.PI / 4;
        const sp = new THREE.Mesh(new THREE.CylinderGeometry(.018, .024, .27, 6), MAT.wood);
        sp.rotation.z = a; sp.position.set(-Math.sin(a) * .15, Math.cos(a) * .15, 0);
        w.add(sp);
      }
      w.rotation.y = Math.PI / 2;                           // roll axis across the carriage
      return w;
    };
    const w1 = mkWheel(), w2 = mkWheel();
    w1.position.set(-.36, .3, .02); w2.position.set(.36, .3, .02); g.add(w1); g.add(w2);
    // carriage: two cheek planks, axle, trail
    [-.15, .15].forEach(x => {
      const ch = new THREE.Mesh(new THREE.BoxGeometry(.07, .2, 1.0), MAT.wood);
      ch.rotation.x = -.14; ch.position.set(x, .42, .22); g.add(ch);
    });
    const axle = new THREE.Mesh(new THREE.CylinderGeometry(.04, .04, .78, 8), MAT.darkWood);
    axle.rotation.z = Math.PI / 2; axle.position.set(0, .3, .02); g.add(axle);
    const trail = new THREE.Mesh(new THREE.BoxGeometry(.12, .07, .5), MAT.wood);
    trail.rotation.x = .3; trail.position.set(0, .14, .62); g.add(trail);
    // a small pyramid of shot beside the gun
    const ballM = new THREE.MeshStandardMaterial({ color:'#22262b', metalness:.6, roughness:.5 });
    [[-.5,.055,.3], [-.61,.055,.36], [-.55,.055,.42], [-.55,.145,.36]].forEach(([x,y,z]) => {
      const b = new THREE.Mesh(new THREE.SphereGeometry(.055, 10, 8), ballM);
      b.position.set(x, y, z); g.add(b);
    });
    return g; },
  scales(){ const g = new THREE.Group();                                  // Jahangir's chain of justice
    const plinth = new THREE.Mesh(new THREE.CylinderGeometry(.26,.32,.2,10), MAT.sandstone);
    plinth.position.y = .1; g.add(plinth);
    const post = new THREE.Mesh(new THREE.CylinderGeometry(.05,.08,1.85,10), MAT.gold);
    post.position.y = 1.1; g.add(post);
    const cap = new THREE.Mesh(new THREE.SphereGeometry(.07,10,8), MAT.gold);
    cap.position.y = 2.06; g.add(cap);
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(.028,.028,1.42,8), MAT.gold);
    beam.rotation.z = Math.PI/2; beam.position.y = 1.95; g.add(beam);
    const pivot = new THREE.Mesh(new THREE.OctahedronGeometry(.07), MAT.gold);
    pivot.position.y = 1.95; g.add(pivot);
    [-.66,.66].forEach(x => {
      const top = new THREE.Vector3(x, 1.93, 0);
      [[.15,0],[-.08,.13],[-.08,-.13]].forEach(([dx,dz]) =>       // three splayed chains
        g.add(rod(top, new THREE.Vector3(x+dx, 1.46, dz), .008, MAT.gold)));
      const pan = new THREE.Mesh(new THREE.CylinderGeometry(.22,.15,.1,14,1,true),
        new THREE.MeshStandardMaterial({ color:'#c9a13b', metalness:.85, roughness:.35, side:THREE.DoubleSide }));
      pan.position.set(x,1.41,0); g.add(pan);
      const panB = new THREE.Mesh(new THREE.CircleGeometry(.15,14), MAT.gold);
      panB.rotation.x = -Math.PI/2; panB.position.set(x,1.365,0); g.add(panB);
      const rim = new THREE.Mesh(new THREE.TorusGeometry(.22,.016,6,18), MAT.gold);
      rim.rotation.x = Math.PI/2; rim.position.set(x,1.46,0); g.add(rim);
    });
    for (let i=0;i<6;i++){                                        // the petitioners' bell chain
      const bell = new THREE.Mesh(new THREE.SphereGeometry(.04,8,6), MAT.gold);
      bell.position.set(-.12+i*.05, 1.9-i*.26, .14); g.add(bell);
    }
    return g; },
  ship(arg){                                                              // East India Company merchantman
    // props are called with the station accent (a string) — only an
    // explicit number is a scale (the old code fed the string to
    // setScalar → NaN matrices → invisible station ships)
    const scale = (typeof arg === 'number' && isFinite(arg)) ? arg : 1;
    const g = new THREE.Group();
    const planks = canvasTexture(128, 64, (c, w, h) => {
      c.fillStyle = '#6b4e2a'; c.fillRect(0, 0, w, h);
      for (let y = 0; y < h; y += 7){ c.fillStyle = 'rgba(28,17,7,.5)'; c.fillRect(0, y, w, 1.6); }
      for (let i = 0; i < 40; i++){ c.fillStyle = 'rgba(0,0,0,.14)';
        c.fillRect(Math.random()*w, Math.random()*h, 11, 1.2); }
    });
    planks.wrapS = planks.wrapT = THREE.RepeatWrapping; planks.repeat.set(.9, .9);
    const hullMat = new THREE.MeshStandardMaterial({ color:'#8a6a3e', map: planks, roughness:.85 });
    // hull with sheer curve, extruded with a bevel for hull rounding
    const hp = new THREE.Shape();
    hp.moveTo(-1.08, .62);
    hp.quadraticCurveTo(-1.18, .34, -.92, .22);
    hp.quadraticCurveTo(-.2, .12, .55, .16);
    hp.quadraticCurveTo(1.02, .2, 1.18, .6);
    hp.lineTo(.98, .64);
    hp.quadraticCurveTo(.2, .5, -.85, .6);
    hp.closePath();
    const hull = new THREE.Mesh(new THREE.ExtrudeGeometry(hp,
      { depth: .44, bevelEnabled: true, bevelThickness: .1, bevelSize: .07, bevelSegments: 2 }), hullMat);
    hull.position.z = -.22; g.add(hull);
    const wale = new THREE.Mesh(new THREE.BoxGeometry(2.0, .05, .6),
      new THREE.MeshStandardMaterial({ color:'#1c1410', roughness:.8 }));
    wale.position.set(0, .48, 0); g.add(wale);
    const water = new THREE.Mesh(new THREE.BoxGeometry(2.3, .06, .62),
      new THREE.MeshStandardMaterial({ color:'#14100c', roughness:.9 }));
    water.position.set(0, .17, 0); g.add(water);
    const castle = new THREE.Mesh(new THREE.BoxGeometry(.5, .28, .48), hullMat);
    castle.position.set(-.8, .74, 0); g.add(castle);
    const rudder = new THREE.Mesh(new THREE.BoxGeometry(.05, .3, .1), MAT.darkWood);
    rudder.position.set(-1.15, .34, 0); g.add(rudder);
    const bowsprit = new THREE.Mesh(new THREE.CylinderGeometry(.018, .03, .8, 6), MAT.wood);
    bowsprit.rotation.z = -1.05; bowsprit.position.set(1.4, .78, 0); g.add(bowsprit);
    // masts, yards, and wind-filled square sails (open cylinder arcs)
    const sailMat = new THREE.MeshStandardMaterial({ color:'#e8e0cc', roughness:.92, side: THREE.DoubleSide });
    const stripes = canvasTexture(64, 64, (c) => {
      for (let i = 0; i < 8; i++){ c.fillStyle = i % 2 ? '#fff' : '#c03030'; c.fillRect(0, i*8, 64, 8); } });
    const mkMast = (x, hM, sails, ensign) => {
      const mast = new THREE.Mesh(new THREE.CylinderGeometry(.022, .034, hM, 8), MAT.wood);
      mast.position.set(x, .6 + hM / 2, 0); g.add(mast);
      sails.forEach(([sy, R, sh]) => {
        const yard = new THREE.Mesh(new THREE.CylinderGeometry(.013, .013, R * 2.2, 6), MAT.wood);
        yard.rotation.x = Math.PI / 2; yard.position.set(x, sy + sh / 2 + .03, 0); g.add(yard);
        const sail = new THREE.Mesh(
          new THREE.CylinderGeometry(R, R * .94, sh, 12, 1, true, Math.PI / 2 - .95, 1.9), sailMat);
        sail.position.set(x - R * .55, sy, 0); g.add(sail);   // belly bulging forward
      });
      if (ensign){
        const fl = new THREE.Mesh(new THREE.PlaneGeometry(.3, .18),
          new THREE.MeshBasicMaterial({ map: stripes, side: THREE.DoubleSide }));
        fl.position.set(x + .17, .6 + hM - .05, 0); g.add(fl);
      }
    };
    mkMast(-.62, 1.3, [[1.05, .30, .4]], false);              // mizzen
    mkMast( .12, 1.7, [[1.05, .40, .5], [1.6, .3, .34]], true);// main
    mkMast( .76, 1.45,[[.98,  .34, .44],[1.44, .25, .28]], false); // fore
    g.scale.setScalar(scale); return g; },
  milestone(){ const g = new THREE.Group();                               // kos minar + rupiya coins
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(.66,.22,.66), MAT.sandstone);
    plinth.position.y = .11; g.add(plinth);
    // the Grand Trunk Road marker: swelling base, tapered shaft,
    // necking, and the domed head — one lathe profile
    const prof = [[.3,0],[.3,.06],[.24,.12],[.2,.34],[.135,.92],[.115,1.06],[.15,1.11],[.125,1.18],[.001,1.36]]
      .map(([r,y]) => new THREE.Vector2(Math.max(r,.001), y));
    const minar = new THREE.Mesh(new THREE.LatheGeometry(prof, 12), MAT.sandstone);
    minar.position.y = .22; g.add(minar);
    for (let i=0;i<3;i++){ const coin = new THREE.Mesh(new THREE.CylinderGeometry(.14,.14,.035,14),
      new THREE.MeshStandardMaterial({ color:'#cfd2d6', metalness:.9, roughness:.3 }));
      coin.position.set(.52, .04+i*.04, .2); g.add(coin); }
    return g; },
  coins(){ const g = new THREE.Group();                                   // Diwani: the revenues of Bengal
    // iron-bound chest, lid thrown open
    const chest = new THREE.Mesh(new THREE.BoxGeometry(.62,.32,.42), MAT.darkWood);
    chest.position.set(-.34,.16,.1); g.add(chest);
    [-.2,.2].forEach(x => { const band = new THREE.Mesh(new THREE.BoxGeometry(.05,.335,.435), MAT.iron);
      band.position.set(-.34+x,.16,.1); g.add(band); });
    const lid = new THREE.Mesh(new THREE.BoxGeometry(.62,.06,.42), MAT.darkWood);
    lid.position.set(-.34,.42,-.14); lid.rotation.x = -1.15; g.add(lid);
    const lidBand = new THREE.Mesh(new THREE.BoxGeometry(.62,.012,.05), MAT.gold);
    lidBand.position.set(-.34,.45,-.15); lidBand.rotation.x = -1.15; g.add(lidBand);
    // heaped rupees: a merged mound inside, a few spilled at the front
    const coinMat = new THREE.MeshStandardMaterial({ color:'#d9b65c', metalness:.9, roughness:.3 });
    const heap = [];
    for (let i = 0; i < 26; i++){
      const cg = new THREE.CylinderGeometry(.038,.038,.013,10);
      const a = i * 1.71, rr = (i % 9) * .022;
      cg.rotateX((Math.sin(i*3.3))*.4); cg.rotateZ((Math.cos(i*2.1))*.4);
      cg.translate(-.34 + Math.sin(a)*rr*1.7, .33 + (2 - Math.floor(i/9)) * .03, .1 + Math.cos(a)*rr);
      heap.push(cg);
    }
    g.add(new THREE.Mesh(mergeGeometries(heap), coinMat));
    [[.06,.05],[.16,-.02],[.24,.09]].forEach(([x,z]) => {
      const c2 = new THREE.Mesh(new THREE.CylinderGeometry(.038,.038,.013,10), coinMat);
      c2.position.set(x,.01,z + .2); c2.rotation.y = x*7; g.add(c2);
    });
    // the firman, sealed and ribboned
    const scroll = new THREE.Mesh(new THREE.CylinderGeometry(.06,.06,.8,10),
      new THREE.MeshStandardMaterial({ color:'#e4d6b0', roughness:.85 }));
    scroll.rotation.z = Math.PI/2.1; scroll.rotation.y = .5; scroll.position.set(.3,.06,-.15); g.add(scroll);
    const seal = new THREE.Mesh(new THREE.CylinderGeometry(.045,.045,.02,10),
      new THREE.MeshStandardMaterial({ color:'#8d1f1f', roughness:.6 }));
    seal.rotation.x = Math.PI/2; seal.rotation.z = .4; seal.position.set(.32,.1,-.13); g.add(seal);
    return g; },
  brokenPillar(){ const g = new THREE.Group();                            // the empire, come apart
    const base = new THREE.Mesh(new THREE.BoxGeometry(.72,.18,.72), MAT.cracked);
    base.position.y = .09; g.add(base);
    // the standing stump: separate drums, each settled slightly askew
    [[.3,.26,.28,0,0],[.62,.24,.26,.06,.05],[.92,.23,.24,-.05,.1]].forEach(([y,rt,rb,tilt,ry]) => {
      const drum = new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,.32,12), MAT.cracked);
      drum.position.y = y; drum.rotation.set(tilt,ry,tilt*.6); g.add(drum);
    });
    // fallen drums rolled where they landed
    [[.62,.16,.3,1.5,.3],[1.0,.16,.55,1.62,-.4],[.85,.15,-.15,1.45,1.1]].forEach(([x,y0,z,rx,ry]) => {
      const drum = new THREE.Mesh(new THREE.CylinderGeometry(.2,.21,.3,12), MAT.cracked);
      drum.rotation.set(rx,ry,0); drum.position.set(x,.2,z);
      drum.position.y = y0 * 0 + .2; g.add(drum);
    });
    // the capital lies face-down in the dust, with rubble
    const cap = new THREE.Mesh(new THREE.BoxGeometry(.55,.16,.55), MAT.cracked);
    cap.rotation.set(.25,.5,.3); cap.position.set(-.42,.16,-.3); g.add(cap);
    for (let i = 0; i < 6; i++){
      const bit = new THREE.Mesh(new THREE.DodecahedronGeometry(.05 + (i%3)*.02, 0), MAT.cracked);
      bit.position.set(Math.sin(i*2.1)*.55, .05, Math.cos(i*1.6)*.5);
      bit.rotation.set(i, i*.7, 0); g.add(bit);
    }
    return g; },
  throne(){ const g = new THREE.Group();                                  // the lost Peacock Throne
    const velvet = new THREE.MeshStandardMaterial({ color:'#7a1f2b', roughness:.7 });
    const plat = new THREE.Mesh(new THREE.BoxGeometry(1.05,.12,.7), MAT.gold); plat.position.y=.3; g.add(plat);
    [-.45,.45].forEach(x => [-.27,.27].forEach(z => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(.045,.06,.3,8), MAT.gold);
      leg.position.set(x,.15,z); g.add(leg); }));
    const seat = new THREE.Mesh(new THREE.BoxGeometry(.9,.14,.55), velvet); seat.position.y=.43; g.add(seat);
    const back = new THREE.Mesh(new THREE.CircleGeometry(.42,18,0,Math.PI), MAT.gold);
    back.position.set(0,.62,-.26); g.add(back);
    // canopy on four slender columns, crowned with a small gold dome
    [-.48,.48].forEach(x => [-.3,.3].forEach(z => {
      const c = new THREE.Mesh(new THREE.CylinderGeometry(.022,.028,.85,6), MAT.gold);
      c.position.set(x,.85,z); g.add(c); }));
    const roof = new THREE.Mesh(new THREE.BoxGeometry(1.1,.08,.75), MAT.gold); roof.position.y=1.3; g.add(roof);
    const canDome = onionDome(.28,.42, MAT.gold, 10); canDome.position.y=1.34; g.add(canDome);
    // the twin peacocks that named it
    const feather = new THREE.MeshStandardMaterial({ color:'#1f6f63', metalness:.4, roughness:.4,
      emissive:'#0c3a33', emissiveIntensity:.3 });
    [-.3,.3].forEach(x => {
      const bod = new THREE.Mesh(new THREE.SphereGeometry(.06,8,6), feather);
      bod.position.set(x,1.4,0); g.add(bod);
      const tail = new THREE.Mesh(new THREE.CircleGeometry(.16,10,0,Math.PI), feather);
      tail.position.set(x,1.48,-.04); tail.rotation.x = -.35; g.add(tail);
    });
    for (let i=0;i<7;i++){                                        // hanging pearls
      const p = new THREE.Mesh(new THREE.SphereGeometry(.016,6,5), MAT.marble);
      p.position.set(-.42+i*.14,1.22,.36); g.add(p);
    }
    const gem = new THREE.Mesh(new THREE.OctahedronGeometry(.055),
      new THREE.MeshStandardMaterial({ color:'#eae6ff', metalness:.3, roughness:.15,
        emissive:'#8a86c0', emissiveIntensity:.45 }));
    gem.position.set(0,1.27,.38); g.add(gem);                     // the Koh-i-Noor, front of the canopy
    return g; },
  rockets(){ const g = new THREE.Group();                                 // Mysorean rockets, bamboo-guided
    const V = (x,y,z) => new THREE.Vector3(x,y,z);
    const bamboo = new THREE.MeshStandardMaterial({ color:'#b7a35c', roughness:.85 });
    // A-frame launch rack with an inclined rail
    [[V(.16,0,.6), V(0,.9,.44)], [V(-.16,0,.6), V(0,.9,.44)],
     [V(.16,0,-.52), V(0,.3,-.4)], [V(-.16,0,-.52), V(0,.3,-.4)]]
      .forEach(([a,b]) => g.add(rod(a, b, .022, MAT.wood)));
    g.add(rod(V(0,.26,-.46), V(0,.98,.56), .04, MAT.wood));               // the rail
    const railDir = V(0,.72,1.02).normalize();
    const mkRocket = () => {
      const r = new THREE.Group();
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(.014,.017,1.7,6), bamboo);
      pole.position.y = .85; r.add(pole);                                 // the long guide pole
      const tube = new THREE.Mesh(new THREE.CylinderGeometry(.046,.046,.46,8), MAT.iron);
      tube.position.y = 1.42; r.add(tube);                                // iron casing
      const cap = new THREE.Mesh(new THREE.ConeGeometry(.05,.12,8), MAT.iron);
      cap.position.y = 1.71; r.add(cap);
      [1.22,1.6].forEach(y => {                                           // lashings
        const lash = new THREE.Mesh(new THREE.TorusGeometry(.052,.012,5,10), MAT.darkWood);
        lash.rotation.x = Math.PI/2; lash.position.y = y; r.add(lash);
      });
      return r;
    };
    [-.07,.07].forEach(x => {
      const r = mkRocket();
      r.quaternion.setFromUnitVectors(V(0,1,0), railDir);
      r.position.set(x, .3, -.42); g.add(r);
    });
    const spare = mkRocket();                                             // one leaning by the rack
    spare.rotation.z = 1.28; spare.rotation.y = .4; spare.position.set(.6,.08,.15); g.add(spare);
    return g; },
  rail(){ const g = new THREE.Group();                                    // 1853: first railway
    // ballast bed: trapezoid cross-section with a gravel speckle
    const gravel = canvasTexture(64,64,(c,w,h) => {
      c.fillStyle = '#2b2622'; c.fillRect(0,0,w,h);
      for (let i=0;i<240;i++){ c.fillStyle = `rgba(${120+Math.random()*80},${110+Math.random()*60},${95+Math.random()*40},.55)`;
        c.fillRect(Math.random()*w, Math.random()*h, 2, 1.6); }
    });
    gravel.wrapS = gravel.wrapT = THREE.RepeatWrapping; gravel.repeat.set(2.4,1);
    const bs = new THREE.Shape();
    bs.moveTo(-.52,0); bs.lineTo(.52,0); bs.lineTo(.36,.15); bs.lineTo(-.36,.15); bs.closePath();
    const bedGeo = new THREE.ExtrudeGeometry(bs, { depth:2.1, bevelEnabled:false });
    bedGeo.rotateY(Math.PI/2); bedGeo.translate(-1.05,0,0);
    g.add(new THREE.Mesh(bedGeo, new THREE.MeshStandardMaterial({ map:gravel, roughness:1 })));
    [-.28,.28].forEach(z => { const rl = new THREE.Mesh(new THREE.BoxGeometry(2.1,.07,.06), MAT.iron);
      rl.position.set(0,.22,z); g.add(rl); });
    for (let i=0;i<6;i++){ const sl = new THREE.Mesh(new THREE.BoxGeometry(.17,.06,.85), MAT.darkWood);
      sl.position.set(-.85+i*.34,.16,0); g.add(sl); }
    return g; },
  charred(){ const g = new THREE.Group();                                 // 1857: a burned-out ruin
    const brickTex = canvasTexture(128,128,(c,w,h) => {
      c.fillStyle='#7a4a35'; c.fillRect(0,0,w,h);
      c.strokeStyle='#5a3222'; c.lineWidth=2;
      for (let y=0;y<h;y+=12){
        c.beginPath(); c.moveTo(0,y); c.lineTo(w,y); c.stroke();
        const off=((y/12)%2)*16;
        for (let x=off;x<w;x+=32){ c.beginPath(); c.moveTo(x,y); c.lineTo(x,y+12); c.stroke(); }
      }
      const gr = c.createLinearGradient(0,0,0,h);                   // charred from above
      gr.addColorStop(0,'rgba(8,5,4,.92)'); gr.addColorStop(.55,'rgba(8,5,4,.4)');
      gr.addColorStop(1,'rgba(8,5,4,.05)');
      c.fillStyle=gr; c.fillRect(0,0,w,h);
    });
    const brick = new THREE.MeshStandardMaterial({ map:brickTex, roughness:.95 });
    const ws = new THREE.Shape();                                   // ragged broken wall
    ws.moveTo(-.75,0); ws.lineTo(.75,0); ws.lineTo(.75,.55); ws.lineTo(.5,.7); ws.lineTo(.32,1.15);
    ws.lineTo(.05,.9); ws.lineTo(-.22,1.3); ws.lineTo(-.45,.8); ws.lineTo(-.75,.95); ws.closePath();
    const wall = new THREE.Mesh(new THREE.ExtrudeGeometry(ws,{depth:.16,bevelEnabled:false}), brick);
    wall.position.set(-.1,0,-.3); g.add(wall);
    const ws2 = new THREE.Shape();                                  // stub return wall
    ws2.moveTo(0,0); ws2.lineTo(.8,0); ws2.lineTo(.8,.4); ws2.lineTo(.45,.75); ws2.lineTo(.15,.5);
    ws2.lineTo(0,.62); ws2.closePath();
    const wall2 = new THREE.Mesh(new THREE.ExtrudeGeometry(ws2,{depth:.16,bevelEnabled:false}), brick);
    wall2.rotation.y = Math.PI/2; wall2.position.set(-.72,0,-.28); g.add(wall2);
    const b1 = new THREE.Mesh(new THREE.BoxGeometry(.16,1.5,.16), MAT.charcoal);   // fallen roof beams
    b1.rotation.z = .62; b1.rotation.y = .2; b1.position.set(.2,.6,.05); g.add(b1);
    const b2 = new THREE.Mesh(new THREE.BoxGeometry(.14,1.2,.14), MAT.charcoal);
    b2.rotation.x = 1.35; b2.rotation.y = -.4; b2.position.set(-.25,.12,.35); g.add(b2);
    const ash = new THREE.Mesh(new THREE.ConeGeometry(.55,.2,12),
      new THREE.MeshStandardMaterial({ color:'#191512', roughness:1 }));
    ash.position.set(.3,.1,.35); g.add(ash);
    for (let i=0;i<5;i++){ const em = new THREE.Mesh(new THREE.SphereGeometry(.035,6,5),
      new THREE.MeshBasicMaterial({ color:'#ff5522', toneMapped:false }));
      em.position.set(Math.sin(i*2.1)*.5, .06, Math.cos(i*1.7)*.4); g.add(em); }
    return g; },
  memorial(){ const g = new THREE.Group();                                // 1919: quiet, restrained
    const stone = new THREE.Mesh(new THREE.BoxGeometry(.9,1.15,.35),
      new THREE.MeshStandardMaterial({ color:'#2b2d30', roughness:.9 }));
    stone.position.y=.58; g.add(stone);
    const flame = new THREE.Mesh(new THREE.ConeGeometry(.05,.14,8),
      new THREE.MeshBasicMaterial({ color:'#ffb066', toneMapped:false }));
    flame.position.y=1.28; g.add(flame);
    const bowl = new THREE.Mesh(new THREE.CylinderGeometry(.09,.06,.07,10), MAT.iron);
    bowl.position.y=1.19; g.add(bowl);
    return g; },
  charkha(){ const g = new THREE.Group();                                 // the spinning wheel
    const wool = new THREE.MeshStandardMaterial({ color:'#efe9da', roughness:.95 });
    const band = new THREE.MeshStandardMaterial({ color:'#d8d2c2', roughness:.9 });
    const plank = new THREE.Mesh(new THREE.BoxGeometry(1.55,.09,.42), MAT.wood);
    plank.position.y = .12; g.add(plank);
    // twin posts carry the axle
    [-.14,.14].forEach(z => {
      const post = new THREE.Mesh(new THREE.BoxGeometry(.07,.55,.05), MAT.darkWood);
      post.position.set(-.42,.42,z); g.add(post);
    });
    const axle = new THREE.Mesh(new THREE.CylinderGeometry(.02,.02,.36,6), MAT.iron);
    axle.rotation.x = Math.PI/2; axle.position.set(-.42,.66,0); g.add(axle);
    // double-rimmed drive wheel with slats and spokes
    [-.055,.055].forEach(z => {
      const rim = new THREE.Mesh(new THREE.TorusGeometry(.42,.024,8,26), MAT.darkWood);
      rim.position.set(-.42,.66,z); g.add(rim);
    });
    const hubC = new THREE.Vector3(-.42,.66,0);
    for (let i = 0; i < 8; i++){
      const a = i * Math.PI / 4;
      const slat = new THREE.Mesh(new THREE.BoxGeometry(.05,.02,.13), MAT.wood);
      slat.position.set(-.42 + Math.cos(a)*.42, .66 + Math.sin(a)*.42, 0);
      slat.rotation.z = a; g.add(slat);
      g.add(rod(hubC, new THREE.Vector3(-.42 + Math.cos(a)*.4, .66 + Math.sin(a)*.4, 0), .011, MAT.wood));
    }
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(.05,.05,.17,8), MAT.darkWood);
    hub.rotation.x = Math.PI/2; hub.position.copy(hubC); g.add(hub);
    // crank handle
    g.add(rod(new THREE.Vector3(-.42,.66,.19), new THREE.Vector3(-.42,.78,.26), .014, MAT.darkWood));
    const knob = new THREE.Mesh(new THREE.SphereGeometry(.025,6,5), MAT.wood);
    knob.position.set(-.42,.79,.27); g.add(knob);
    // spindle post, wool cop, and the drive band looping wheel → spindle
    [-.05,.05].forEach(z => {
      const sp = new THREE.Mesh(new THREE.BoxGeometry(.05,.32,.04), MAT.darkWood);
      sp.position.set(.5,.3,z); g.add(sp);
    });
    const spindle = new THREE.Mesh(new THREE.CylinderGeometry(.012,.012,.34,6), MAT.iron);
    spindle.rotation.z = Math.PI/2; spindle.position.set(.52,.44,0); g.add(spindle);
    const cop = new THREE.Mesh(new THREE.CylinderGeometry(.05,.05,.16,8), wool);
    cop.rotation.z = Math.PI/2; cop.position.set(.5,.44,0); g.add(cop);
    g.add(rod(new THREE.Vector3(-.42,1.085,0), new THREE.Vector3(.5,.47,0), .006, band));
    g.add(rod(new THREE.Vector3(-.42,.235,0),  new THREE.Vector3(.5,.41,0), .006, band));
    return g; },
  salt(){ const g = new THREE.Group();                                    // a handful of salt, Dandi
    const mound = new THREE.Mesh(new THREE.ConeGeometry(.5,.48,14),
      new THREE.MeshStandardMaterial({ color:'#f4f2ec', roughness:.55 }));
    mound.position.y=.24; g.add(mound);
    const crystal = new THREE.MeshStandardMaterial({ color:'#ffffff', roughness:.22, metalness:.08 });
    for (let i=0;i<10;i++){                                       // crystalline glints on the heap
      const cr = new THREE.Mesh(new THREE.IcosahedronGeometry(.05+((i*7)%3)*.018, 0), crystal);
      const a=i*2.1, rr=.14+((i*5)%4)*.07;
      cr.position.set(Math.sin(a)*rr, .12+((i*3)%5)*.06, Math.cos(a)*rr);
      cr.rotation.set(i, i*.7, 0); g.add(cr);
    }
    // the brass lota set down beside the harvest
    const lotaProf = [[.001,0],[.11,.01],[.14,.06],[.12,.14],[.06,.19],[.09,.23],[.11,.26],[.001,.27]]
      .map(([r,y]) => new THREE.Vector2(Math.max(r,.001), y));
    const lota = new THREE.Mesh(new THREE.LatheGeometry(lotaProf,14),
      new THREE.MeshStandardMaterial({ color:'#b08d3e', metalness:.8, roughness:.35 }));
    lota.position.set(.62,0,.3); g.add(lota);
    for (let i=0;i<6;i++){ const gr = new THREE.Mesh(new THREE.SphereGeometry(.03,5,4), MAT.white);
      gr.position.set(Math.sin(i*2.3)*.55, .03, Math.cos(i*1.9)*.5); g.add(gr); }
    return g; },
  banner(accent){ const g = new THREE.Group();
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(.03,.048,2.3,8), MAT.darkWood);
    pole.position.y = 1.15; g.add(pole);
    const collar = new THREE.Mesh(new THREE.CylinderGeometry(.05,.05,.03,8), MAT.gold);
    collar.position.y = 2.26; g.add(collar);
    const tip = new THREE.Mesh(new THREE.ConeGeometry(.045,.17,6), MAT.gold);
    tip.position.y = 2.38; g.add(tip);                        // spear finial
    // pennant as a curled sheet — a tapered open cylinder arc lying on
    // its side, so the cloth billows instead of hanging flat
    const cloth = new THREE.Mesh(
      new THREE.CylinderGeometry(.26,.2,.85,10,1,true,Math.PI*.25,1.6),
      new THREE.MeshStandardMaterial({ color:accent, side:THREE.DoubleSide, roughness:.82 }));
    cloth.rotation.z = -Math.PI/2;                            // axis out from the pole
    cloth.rotation.x = .18;
    cloth.position.set(.46,2.0,.02); g.add(cloth);
    g.add(rod(new THREE.Vector3(0,2.22,0), new THREE.Vector3(.1,2.1,.05), .007, MAT.gold));
    return g; },
};

/* ---- the low-poly Taj Mahal: centrepiece of the Mughal half ---- */
/* A true onion-dome profile: constricted neck, full shoulder, pointed tip */
const ONION = [[.55,0],[.74,.06],[.90,.16],[1.0,.34],[.99,.5],[.90,.66],[.72,.8],[.48,.9],[.24,.965],[.001,1.0]];
function onionDome(r, h, material, segs = 18){
  const pts = ONION.map(([pr, py]) => new THREE.Vector2(Math.max(pr * r, .001), py * h));
  return new THREE.Mesh(new THREE.LatheGeometry(pts, segs), material);
}
function buildTaj(){
  const g = new THREE.Group();
  const M = MAT.marble;
  const sheen = new THREE.MeshStandardMaterial({ color:'#f6f2e9', roughness:.38 }); // dome ivory
  // red sandstone base, marble platform with lip
  const base = new THREE.Mesh(new THREE.BoxGeometry(8, .4, 8), MAT.sandstone); base.position.y = .2; g.add(base);
  const plat = new THREE.Mesh(new THREE.BoxGeometry(7, .45, 7), M); plat.position.y = .62; g.add(plat);
  const lip  = new THREE.Mesh(new THREE.BoxGeometry(7.3, .12, 7.3), M); lip.position.y = .9; g.add(lip);
  // chamfered (octagonal) mausoleum body
  const bs = new THREE.Shape();
  bs.moveTo(-1.05,-1.7); bs.lineTo(1.05,-1.7); bs.lineTo(1.7,-1.05); bs.lineTo(1.7,1.05);
  bs.lineTo(1.05,1.7); bs.lineTo(-1.05,1.7); bs.lineTo(-1.7,1.05); bs.lineTo(-1.7,-1.05); bs.closePath();
  const bodyGeo = new THREE.ExtrudeGeometry(bs, { depth: 2.5, bevelEnabled: false });
  bodyGeo.rotateX(-Math.PI / 2);
  const body = new THREE.Mesh(bodyGeo, M); body.position.y = .96; g.add(body);
  // pointed-arch iwan recess on all four faces
  const iwanTex = canvasTexture(128, 192, (c, w, h) => {
    c.fillStyle = '#f3efe6'; c.fillRect(0, 0, w, h);
    c.strokeStyle = '#d9d2c0'; c.lineWidth = 6; c.strokeRect(8, 8, w - 16, h - 16);
    c.fillStyle = '#3a3026'; c.beginPath();
    c.moveTo(24, h); c.lineTo(24, 86); c.quadraticCurveTo(24, 34, 64, 22);
    c.quadraticCurveTo(104, 34, 104, 86); c.lineTo(104, h); c.closePath(); c.fill();
  });
  const iwanMat = new THREE.MeshStandardMaterial({ map: iwanTex, roughness: .6 });
  [[0, 1.72, 0], [0, -1.72, Math.PI], [1.72, 0, Math.PI / 2], [-1.72, 0, -Math.PI / 2]]
    .forEach(([x, z, ry]) => {
      const iw = new THREE.Mesh(new THREE.PlaneGeometry(1.55, 2.15), iwanMat);
      iw.position.set(x, 2.1, z); iw.rotation.y = ry; g.add(iw);
    });
  // drum, great onion dome, gold finial stack
  const drum = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.06, .5, 20), M);
  drum.position.y = 3.7; g.add(drum);
  const dome = onionDome(1.18, 2.05, sheen, 24); dome.position.y = 3.9; g.add(dome);
  const finBall = new THREE.Mesh(new THREE.SphereGeometry(.075, 10, 8), MAT.gold);
  finBall.position.y = 6.0; g.add(finBall);
  const finRod = new THREE.Mesh(new THREE.CylinderGeometry(.02, .03, .34, 8), MAT.gold);
  finRod.position.y = 6.2; g.add(finRod);
  const finTip = new THREE.Mesh(new THREE.ConeGeometry(.05, .22, 8), MAT.gold);
  finTip.position.y = 6.45; g.add(finTip);
  // four corner chhatris with their own small onions
  [[-1.25,-1.25],[1.25,-1.25],[-1.25,1.25],[1.25,1.25]].forEach(([x, z]) => {
    const cdrum = new THREE.Mesh(new THREE.CylinderGeometry(.3, .34, .34, 10), M);
    cdrum.position.set(x, 3.62, z); g.add(cdrum);
    const cd = onionDome(.34, .58, sheen, 12); cd.position.set(x, 3.78, z); g.add(cd);
    const pin = new THREE.Mesh(new THREE.ConeGeometry(.035, .16, 6), MAT.gold);
    pin.position.set(x, 4.44, z); g.add(pin);
  });
  // four minarets: tapered shafts, three balconies, onion caps
  [[-3.2,-3.2],[3.2,-3.2],[-3.2,3.2],[3.2,3.2]].forEach(([x, z]) => {
    const mn = new THREE.Mesh(new THREE.CylinderGeometry(.15, .23, 3.3, 12), M);
    mn.position.set(x, 2.5, z); g.add(mn);
    [1.6, 2.5, 3.4].forEach(y => {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(.22, .035, 6, 14), M);
      ring.rotation.x = Math.PI / 2; ring.position.set(x, y, z); g.add(ring);
    });
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(.2, .24, .16, 10), M);
    cap.position.set(x, 4.2, z); g.add(cap);
    const md = onionDome(.24, .42, sheen, 10); md.position.set(x, 4.28, z); g.add(md);
    const pin = new THREE.Mesh(new THREE.ConeGeometry(.03, .14, 6), MAT.gold);
    pin.position.set(x, 4.76, z); g.add(pin);
  });
  return g;
}

/* ---- Rani Lakshmibai of Jhansi ------------------------------------
   Equestrian statue in dark bronze on a masonry pedestal — rearing
   horse, sword raised — standing watch beside the 1857 station.    */
function buildJhansiStatue(){
  const g = new THREE.Group();
  // maintained dark bronze; a faint verdigris in the wind-shadowed parts
  // (cloak, tail) is what makes a monument read as decades old
  const bronze  = new THREE.MeshStandardMaterial({ color:'#44483d', metalness:.66, roughness:.42 });
  const bronzeD = new THREE.MeshStandardMaterial({ color:'#2b2f29', metalness:.58, roughness:.58 });
  const verdi   = new THREE.MeshStandardMaterial({ color:'#3f4a42', metalness:.42, roughness:.72 });
  const V = (x,y,z) => new THREE.Vector3(x,y,z);
  const S = (r, p, mat = bronze) => { const m = new THREE.Mesh(new THREE.SphereGeometry(r,12,10), mat);
    m.position.copy(p); st.add(m); return m; };

  // ---- moulded pedestal with carved panels ----
  const ped = (w,h,d,y,mat) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), mat);
    m.position.y = y; g.add(m); return m; };
  ped(2.5,.28,2.5,.14, MAT.sandstone);
  ped(2.15,.26,2.15,.41, MAT.sandstone);
  ped(1.8,.12,1.8,.60, MAT.slate);
  ped(1.45,1.42,1.45,1.37, MAT.sandstone);
  ped(1.6,.1,1.6,2.13, MAT.slate);
  ped(1.75,.18,1.75,2.27, MAT.sandstone);
  ped(1.85,.06,1.85,2.39, MAT.slate);
  // corner pilasters up the die, and a dentil course under the cap
  [[-.66,-.66],[.66,-.66],[-.66,.66],[.66,.66]].forEach(([x,z]) => {
    const p = new THREE.Mesh(new THREE.BoxGeometry(.18,1.42,.18), MAT.sandDark);
    p.position.set(x,1.37,z); g.add(p);
  });
  { const bits = [];
    for (let f = 0; f < 4; f++) for (let k = -3; k <= 3; k++){
      const b = new THREE.BoxGeometry(.09,.08,.06);
      b.rotateY(f * Math.PI/2);
      const off = new THREE.Vector3(k*.21, 0, .76)
        .applyAxisAngle(new THREE.Vector3(0,1,0), f * Math.PI/2);
      b.translate(off.x, 2.04, off.z);
      bits.push(b);
    }
    g.add(new THREE.Mesh(mergeGeometries(bits), MAT.sandstone));
  }
  const panelTex = canvasTexture(128,128,(c,w,h) => {
    c.fillStyle='#a97f4e'; c.fillRect(0,0,w,h);
    c.strokeStyle='#7c5930'; c.lineWidth=6; c.strokeRect(10,10,w-20,h-20);
    c.strokeStyle='#caa36b'; c.lineWidth=2; c.strokeRect(18,18,w-36,h-36);
    c.fillStyle='#7c5930';
    [[24,24],[w-24,24],[24,h-24],[w-24,h-24]].forEach(([x,y]) => { c.beginPath(); c.arc(x,y,5,0,7); c.fill(); });
    c.save(); c.translate(w/2,h/2); c.rotate(Math.PI/4); c.fillRect(-16,-16,32,32);
    c.fillStyle='#caa36b'; c.fillRect(-9,-9,18,18); c.restore();
  });
  const panelMat = new THREE.MeshStandardMaterial({ map: panelTex, roughness:.85 });
  [[0,.74,0],[0,-.74,Math.PI],[.74,0,Math.PI/2],[-.74,0,-Math.PI/2]].forEach(([x,z,ry]) => {
    const p = new THREE.Mesh(new THREE.PlaneGeometry(1.1,1.05), panelMat);
    p.position.set(x,1.45,z); p.rotation.y = ry; g.add(p);
  });
  // engraved bronze dedication plaque
  const plaqueTex = canvasTexture(256,128,(c,w,h) => {
    c.fillStyle = '#2e2721'; c.fillRect(0,0,w,h);
    c.strokeStyle = '#c9a24a'; c.lineWidth = 5; c.strokeRect(8,8,w-16,h-16);
    c.strokeStyle = 'rgba(201,162,74,.4)'; c.lineWidth = 1.5; c.strokeRect(15,15,w-30,h-30);
    c.fillStyle = '#d8b25f'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.font = '700 27px Georgia, serif';  c.fillText('RANI LAKSHMIBAI', w/2, 46);
    c.font = '400 20px Georgia, serif';  c.fillText('JHANSI · 1828 – 1858', w/2, 88);
  });
  const plaque = new THREE.Mesh(new THREE.BoxGeometry(.82,.44,.03),
    new THREE.MeshStandardMaterial({ color:'#3a332c', metalness:.4, roughness:.6 }));
  plaque.position.set(0,1.42,.74); g.add(plaque);
  const plaqueFace = new THREE.Mesh(new THREE.PlaneGeometry(.76,.38),
    new THREE.MeshStandardMaterial({ map:plaqueTex, metalness:.35, roughness:.55 }));
  plaqueFace.position.set(0,1.42,.758); g.add(plaqueFace);

  const st = new THREE.Group(); st.position.y = 2.42; g.add(st);   // statue root on the cap

  // ---- the horse, rearing toward the walkway (+Z) ----
  const HIP = V(0,.72,-.42), CHEST = V(0,1.44,.28);
  S(.30, HIP); S(.29, CHEST); S(.27, V(0,.66,-.55));               // masses
  st.add(limb(HIP, CHEST, .30, bronze));                           // barrel
  st.add(limb(V(0,1.5,.34),  V(0,1.88,.56), .18, bronze));         // neck lower
  st.add(limb(V(0,1.88,.56), V(0,2.06,.64), .14, bronze));         // neck crest
  st.add(limb(V(0,2.08,.64), V(0,2.02,1.0), .105, bronze));        // head
  S(.075, V(0,2.0,1.03)); S(.08, V(0,1.95,.83));                   // muzzle, jaw
  [-.055,.055].forEach(x => { const ear = new THREE.Mesh(new THREE.ConeGeometry(.032,.11,6), bronze);
    ear.position.set(x,2.21,.58); ear.rotation.x = -.3; st.add(ear); });
  // eyes, flared nostrils, forelock — the head is where the eye goes first
  [-.08,.08].forEach(x => S(.017, V(x,2.1,.79), bronzeD));
  [-.036,.036].forEach(x => S(.018, V(x,2.02,1.08), bronzeD));
  const forelock = new THREE.Mesh(new THREE.ConeGeometry(.03,.13,6), bronzeD);
  forelock.position.set(0,2.19,.67); forelock.rotation.x = 2.4; st.add(forelock);
  // mane down the crest — offset tufts alternate sides so it flows
  [[.015,2.18,.5],[-.02,2.07,.41],[.02,1.95,.33],[-.02,1.83,.28],[.015,1.71,.24],[-.01,1.6,.22]]
  .forEach(([x,y,z],i) => {
    const tuft = new THREE.Mesh(new THREE.BoxGeometry(.035,.19,.11), bronzeD);
    tuft.position.set(x,y,z); tuft.rotation.x = -.75 + i*.05; tuft.rotation.z = (i%2?-1:1)*.12;
    st.add(tuft);
  });
  // tail — swept, tapering, verdigris in its wind-shadow
  st.add(limb(V(0,.62,-.66), V(.03,.4,-.9),  .07,  bronzeD));
  st.add(limb(V(.03,.4,-.9), V(.05,.16,-.98),.045, verdi));
  st.add(limb(V(.05,.16,-.98), V(.03,.03,-.86),.028, verdi));
  S(.024, V(.03,.03,-.85), verdi);
  // hind legs planted on the cap
  [-.16,.16].forEach(x => {
    S(.11, V(x,.6,-.42));
    st.add(limb(V(x,.6,-.42),  V(x,.36,-.22), .095, bronze));      // thigh
    st.add(limb(V(x,.36,-.22), V(x,.22,-.5),  .065, bronze));      // gaskin
    S(.06, V(x,.22,-.5));
    st.add(limb(V(x,.22,-.5),  V(x,.06,-.46), .045, bronze));      // cannon
    S(.05, V(x,.1,-.465));                                        // fetlock
    const hoof = new THREE.Mesh(new THREE.CylinderGeometry(.062,.07,.07,8), bronzeD);
    hoof.position.set(x,.035,-.455); st.add(hoof);
  });
  // forelegs folded mid-air — the rearing pose
  [-.15,.15].forEach(x => {
    S(.10, V(x,1.3,.3));
    st.add(limb(V(x,1.3,.3),   V(x,1.52,.66), .07,  bronze));      // forearm up
    S(.055, V(x,1.52,.66));
    st.add(limb(V(x,1.52,.66), V(x,1.3,.84),  .042, bronze));      // folded cannon
    S(.042, V(x,1.31,.82));                                       // fetlock
    const hoof = new THREE.Mesh(new THREE.CylinderGeometry(.045,.05,.055,8), bronzeD);
    hoof.position.set(x,1.28,.86); hoof.rotation.x = 1.2; st.add(hoof);
  });
  // tack: fringed saddle cloth, seat, girth, breast collar, crupper,
  // bridle with cheek straps, stirrups under her boots
  const cloth = new THREE.Mesh(new THREE.BoxGeometry(.44,.05,.54), bronzeD);
  cloth.position.set(0,1.33,-.04); cloth.rotation.x = -.78; st.add(cloth);
  [-.225,.225].forEach(x => {                                     // cloth edge trim
    const tr = new THREE.Mesh(new THREE.BoxGeometry(.02,.055,.54), MAT.gold);
    tr.position.set(x,1.33,-.04); tr.rotation.x = -.78; st.add(tr);
  });
  const seat = new THREE.Mesh(new THREE.BoxGeometry(.3,.07,.34), bronzeD);
  seat.position.set(0,1.4,-.03); seat.rotation.x = -.78; st.add(seat);
  const pommelArc = new THREE.Mesh(new THREE.TorusGeometry(.07,.016,6,10,Math.PI), bronzeD);
  pommelArc.position.set(0,1.48,.1); pommelArc.rotation.x = -.6; st.add(pommelArc);
  const girth = new THREE.Mesh(new THREE.TorusGeometry(.315,.018,6,18), bronzeD);
  girth.position.set(0,1.1,-.06);
  girth.quaternion.setFromUnitVectors(V(0,0,1), V(0,.72,.7).normalize()); st.add(girth);
  const breast = new THREE.Mesh(new THREE.TorusGeometry(.3,.017,6,18), bronzeD);
  breast.position.set(0,1.38,.3);
  breast.quaternion.setFromUnitVectors(V(0,0,1), V(0,.78,.63).normalize()); st.add(breast);
  st.add(rod(V(0,1.28,-.28), V(0,.68,-.6), .014, bronzeD));       // crupper to the tail root
  const bridle = new THREE.Mesh(new THREE.TorusGeometry(.078,.012,5,12), bronzeD);
  bridle.position.set(0,2.0,.95);
  bridle.quaternion.setFromUnitVectors(V(0,0,1), V(0,.25,1).normalize()); st.add(bridle);
  [-1,1].forEach(sgn => {
    st.add(rod(V(sgn*.08,2.02,.93), V(sgn*.065,2.16,.62), .007, bronzeD)); // cheek straps
    st.add(rod(V(sgn*.17,1.37,.02), V(sgn*.235,1.03,.27), .011, bronzeD)); // stirrup leathers
    const stir = new THREE.Mesh(new THREE.TorusGeometry(.045,.011,5,10), bronzeD);
    stir.position.set(sgn*.24,.99,.29); stir.rotation.y = Math.PI/2; st.add(stir);
  });

  // ---- the Rani — seated, blade high ----
  S(.11, V(0,1.46,-.05));                                          // hips on the saddle
  [-1,1].forEach(sgn => {
    const x = sgn * .19;
    st.add(limb(V(sgn*.06,1.46,-.04), V(x,1.3,.22), .06, bronze)); // thigh
    st.add(limb(V(x,1.3,.22), V(x+sgn*.03,1.04,.27), .042, bronze)); // shin
    const boot = new THREE.Mesh(new THREE.BoxGeometry(.07,.05,.14), bronzeD);
    boot.position.set(x+sgn*.03,1.0,.31); st.add(boot);
  });
  // angarkha skirt draped over the saddle
  const skirt = new THREE.Mesh(new THREE.CylinderGeometry(.13,.27,.3,10,1,true), bronze);
  skirt.position.set(0,1.38,-.02); skirt.rotation.x = -.2; st.add(skirt);
  st.add(limb(V(0,1.5,-.03), V(0,1.86,.02), .125, bronze));        // torso (angarkha)
  S(.1, V(0,2.0,.03));                                             // head
  const pagri = new THREE.Mesh(new THREE.SphereGeometry(.115,10,7), bronzeD);
  pagri.scale.y = .62; pagri.position.set(0,2.08,.03); st.add(pagri);
  S(.048, V(0,2.06,-.08), bronzeD);                                // pagri knot
  const pearl = new THREE.Mesh(new THREE.TorusGeometry(.1,.011,5,14), MAT.gold);
  pearl.position.set(0,2.05,.03); pearl.rotation.x = Math.PI/2 - .18; st.add(pearl);
  // scabbard hanging at her left hip, chape tipped in gold
  const scab = new THREE.Mesh(talwarGeo(.5,.03,.2), bronzeD);
  scab.position.set(-.2,1.5,.02); scab.rotation.z = Math.PI*.94; scab.rotation.y = .5;
  st.add(scab);
  S(.02, V(-.28,1.03,.1), MAT.gold);
  // cloak lifting off her shoulders in the wind of the charge
  const cloak = new THREE.Mesh(
    new THREE.CylinderGeometry(.3,.44,.52,12,1,true,.35,1.6), verdi);
  cloak.material = cloak.material.clone(); cloak.material.side = THREE.DoubleSide;
  cloak.position.set(0,1.66,-.3); cloak.rotation.set(.45,Math.PI,.1); st.add(cloak);
  // Damodar Rao, tied to her back with a shawl — the detail every
  // statue of the Rani carries, and history insists on
  st.add(limb(V(0,1.86,-.19), V(0,1.68,-.24), .075, bronze));      // swaddled child
  S(.055, V(0,1.94,-.2));                                          // his head
  const dcap = new THREE.Mesh(new THREE.SphereGeometry(.06,8,6), bronzeD);
  dcap.scale.y = .6; dcap.position.set(0,1.98,-.2); st.add(dcap);
  st.add(rod(V(-.12,1.9,.09), V(.13,1.6,.11), .017, bronzeD));     // shawl bands
  st.add(rod(V(.12,1.9,.09),  V(-.13,1.6,.11), .017, bronzeD));    //   crossed at her chest
  // sword arm
  st.add(limb(V(.12,1.8,.0),  V(.3,1.86,-.05), .05, bronze));
  S(.045, V(.3,1.86,-.05));
  st.add(limb(V(.3,1.86,-.05), V(.44,2.06,-.07), .04, bronze));
  S(.045, V(.45,2.08,-.07));
  const blade = new THREE.Mesh(talwarGeo(.68,.042,.24), STEEL);
  blade.position.set(.46,2.11,-.08); blade.rotation.z = -.3; st.add(blade);
  const guard = new THREE.Mesh(new THREE.TorusGeometry(.05,.014,6,12), MAT.gold);
  guard.position.set(.46,2.1,-.075); guard.rotation.x = Math.PI/2; st.add(guard);
  S(.028, V(.45,2.03,-.07), MAT.gold);                             // pommel
  // rein arm + reins to the bit
  st.add(limb(V(-.12,1.8,.0),  V(-.28,1.64,.14), .05, bronze));
  st.add(limb(V(-.28,1.64,.14), V(-.18,1.6,.4),  .04, bronze));
  S(.04, V(-.18,1.6,.42));
  st.add(rod(V(-.18,1.6,.42), V(-.06,2.0,.92), .008, bronzeD));
  st.add(rod(V(-.18,1.6,.42), V(.06,2.0,.92),  .008, bronzeD));
  return g;
}

/* ---- Maratha hill fort --------------------------------------------
   A Deccan gadhi on its scarp: layered hills, plateau, ramparts and
   bastions, a gate tower, and the saffron swallow-tail standard.   */
function buildMarathaFort(variant = 0){
  const g = new THREE.Group();
  const seedBase = variant * 3.7 + 1.3;
  // strata rock — banded, grained, and cracked
  const rockTex = canvasTexture(256,256,(c,w,h) => {
    c.fillStyle = variant ? '#6d5a45' : '#6a6250'; c.fillRect(0,0,w,h);
    for (let y = 0; y < h; y += 7 + ((y*7) % 11)){
      c.fillStyle = `rgba(38,32,22,${.13 + ((y*13) % 10)/70})`;
      c.fillRect(0, y, w, 2 + ((y*11) % 4));
    }
    for (let i = 0; i < 320; i++){
      c.fillStyle = `rgba(122,110,86,${Math.random()*.13})`;
      c.fillRect(Math.random()*w, Math.random()*h, 9, 2);
    }
    c.strokeStyle = 'rgba(28,22,14,.35)'; c.lineWidth = 1.6;      // rain-cut cracks
    for (let i = 0; i < 14; i++){
      let x = Math.random()*w, y = Math.random()*h*.5;
      c.beginPath(); c.moveTo(x,y);
      for (let k = 0; k < 5; k++){ x += (Math.random()-.5)*14; y += 14 + Math.random()*10; c.lineTo(x,y); }
      c.stroke();
    }
  });
  rockTex.wrapS = rockTex.wrapT = THREE.RepeatWrapping; rockTex.repeat.set(3, 1.6);
  // three tints of the same stone: sunlit talus, mid scarp, weathered crown
  const rockLo  = new THREE.MeshStandardMaterial({ color:'#d6cbb4', roughness:1, map:rockTex });
  const rockMid = new THREE.MeshStandardMaterial({ color:'#c2b8a2', roughness:1, map:rockTex });
  const rockHi  = new THREE.MeshStandardMaterial({ color:'#a89f8c', roughness:1, map:rockTex });
  const rock = rockMid;
  const scrub  = new THREE.MeshStandardMaterial({ color:'#46523a', roughness:1 });
  const scrub2 = new THREE.MeshStandardMaterial({ color:'#5a6242', roughness:1 });

  // a tapered cylinder with a two-octave, wind-cut silhouette
  const jaggedCyl = (rTop, rBot, h, seed) => {
    const geo = new THREE.CylinderGeometry(rTop, rBot, h, 36, 4);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++){
      const x = pos.getX(i), z = pos.getZ(i), y = pos.getY(i);
      const a = Math.atan2(z, x);
      const n = Math.sin(a*3.1 + seed)*.45 + Math.sin(a*7.3 + seed*2.7)*.3
              + Math.sin(a*13.7 + seed*5.1)*.15 + Math.sin(y*3.4 + a*5 + seed)*.25;
      const k = 1 + n * .085;
      pos.setX(i, x * k); pos.setZ(i, z * k);
    }
    geo.computeVertexNormals(); return geo;
  };
  // the Deccan mesa in three scarps + talus skirt
  [[7.0, 8.2, 2.2, 1.1, 2.1 + seedBase, rockLo],
   [5.4, 6.9, 1.9, 3.1, 4.7 + seedBase, rockMid],
   [4.3, 5.5, 1.7, 4.9, 7.9 + seedBase, rockHi]]
    .forEach(([rt, rb, h, y, seed, mat]) => {
      const tier = new THREE.Mesh(jaggedCyl(rt, rb, h, seed), mat);
      tier.position.y = y; g.add(tier);
    });
  const talus = new THREE.Mesh(new THREE.ConeGeometry(9, 1.3, 26), rockLo);
  talus.position.y = .55; g.add(talus);
  const plateauTop = new THREE.Mesh(new THREE.CircleGeometry(4.4, 26), rockHi);
  plateauTop.rotation.x = -Math.PI/2; plateauTop.position.y = 5.78; g.add(plateauTop);
  // fallen boulders around the talus
  for (let i = 0; i < 6; i++){
    const b = new THREE.Mesh(new THREE.DodecahedronGeometry(.34 + (i%3)*.16, 0), rockHi);
    const a = i * 1.13 + seedBase;
    b.position.set(Math.cos(a)*8.9, .28, Math.sin(a)*8.9);
    b.rotation.set(i, i*.7, 0); g.add(b);
  }
  // scrub on the ledges, two greens
  for (let i = 0; i < 16; i++){
    const a = i * .43 + 1 + seedBase;
    const [rr, yy] = [[8.4,.9],[6.7,2.8],[5.0,4.6]][i % 3];
    const s = new THREE.Mesh(new THREE.SphereGeometry(.28 + ((i*7)%3)*.14, 7, 5), i%2 ? scrub : scrub2);
    s.scale.y = .5; s.position.set(Math.cos(a)*rr, yy, Math.sin(a)*rr); g.add(s);
  }
  // machi: a lower outer curtain on the mid scarp, guarding the approach
  const machi = new THREE.Mesh(
    new THREE.CylinderGeometry(6.15, 6.3, .8, 22, 1, true, .45, 2.5),
    new THREE.MeshStandardMaterial({ color: MAT.sandDark.color, roughness:.9,
      map: MAT.sandDark.map, side: THREE.DoubleSide }));
  machi.position.y = 3.6; g.add(machi);

  // merged merlon ring — Deccan merlons carry a rounded cap, not a flat
  // top; gap optional around angle skipA
  const merlonRing = (radius, y, count, size, skipA = null, skipHalf = 0) => {
    const parts = [];
    for (let i = 0; i < count; i++){
      const a = i * Math.PI * 2 / count;
      if (skipA !== null && Math.abs(((a - skipA + Math.PI) % (Math.PI*2)) - Math.PI) < skipHalf) continue;
      const b = new THREE.BoxGeometry(size[0], size[1], size[2]);
      b.rotateY(a + Math.PI/2);
      b.translate(Math.cos(a)*radius, y, Math.sin(a)*radius);
      parts.push(b);
      const cap = new THREE.CylinderGeometry(size[2]/2, size[2]/2, size[0], 7, 1, false, 0, Math.PI);
      cap.rotateZ(Math.PI/2);
      cap.rotateY(a + Math.PI/2);
      cap.translate(Math.cos(a)*radius, y + size[1]/2, Math.sin(a)*radius);
      parts.push(cap);
    }
    return new THREE.Mesh(mergeGeometries(parts), MAT.sandDark);
  };

  // curtain wall around the plateau (gap over the gate side, +Z)
  const curtain = new THREE.Mesh(
    new THREE.CylinderGeometry(4.3, 4.42, 1.05, 28, 1, true),
    new THREE.MeshStandardMaterial({ color: MAT.sandDark.color, roughness:.9,
      map: MAT.sandDark.map, side: THREE.DoubleSide }));
  curtain.position.y = 6.3; g.add(curtain);
  g.add(merlonRing(4.34, 7.0, 26, [.42,.3,.2], Math.PI/2, .3));
  // four round bastions with their own crenellations
  for (let i = 0; i < 4; i++){
    const a = i * Math.PI/2 + Math.PI/4;
    const b = new THREE.Mesh(new THREE.CylinderGeometry(.9, 1.2, 2.2, 10), MAT.sandDark);
    b.position.set(Math.cos(a)*4.15, 6.3, Math.sin(a)*4.15); g.add(b);
    const mr = merlonRing(.92, 0, 8, [.3,.24,.16]);
    mr.position.set(Math.cos(a)*4.15, 7.55, Math.sin(a)*4.15); g.add(mr);
  }

  // the Maha Darwaza on a ledge below the plateau, facing the walk (+Z)
  const court = new THREE.Mesh(new THREE.BoxGeometry(3.6,.5,2.6), rock);
  court.position.set(0, 4.72, 4.0); g.add(court);
  [-1.5, 1.5].forEach(x => {
    const t = new THREE.Mesh(new THREE.CylinderGeometry(.68,.95,2.6,10), MAT.sandDark);
    t.position.set(x, 6.15, 4.3); g.add(t);
    const mr = merlonRing(.72, 0, 8, [.26,.2,.15]);
    mr.position.set(x, 7.5, 4.3); g.add(mr);
  });
  const gate = new THREE.Mesh(gateGeometry(1.25, 2.3, .7, 1.05, .6), MAT.sandDark);
  gate.position.set(0, 4.97, 4.45); g.add(gate);
  const doorTex = canvasTexture(64,96,(c,w,h) => {
    c.fillStyle='#241407'; c.fillRect(0,0,w,h);
    c.fillStyle='#3a2410'; for (let x = 6; x < w; x += 10) c.fillRect(x,0,3,h);
    c.fillStyle='#6a5a3a';
    for (let y = 10; y < h; y += 16) for (let x = 8; x < w; x += 12){
      c.beginPath(); c.arc(x,y,2,0,7); c.fill(); }
  });
  const door = new THREE.Mesh(new THREE.PlaneGeometry(1.15,1.5),
    new THREE.MeshStandardMaterial({ map: doorTex, roughness:.9 }));
  door.position.set(0, 5.72, 4.47); g.add(door);
  // anti-elephant spikes studding the door — the Maha Darwaza signature
  { const spikes = [];
    for (let r = 0; r < 3; r++) for (let k = -2; k <= 2; k++){
      const sp = new THREE.ConeGeometry(.035,.12,5);
      sp.rotateX(Math.PI/2);
      sp.translate(k*.22, 5.32 + r*.34, 4.52);
      spikes.push(sp);
    }
    g.add(new THREE.Mesh(mergeGeometries(spikes), MAT.iron));
  }
  // steps down from the gate
  [[4.62,5.4],[4.44,5.85],[4.26,6.3],[4.08,6.75]].forEach(([y,z]) => {
    const s = new THREE.Mesh(new THREE.BoxGeometry(2.2,.18,.5), rock);
    s.position.set(0,y,z); g.add(s);
  });
  // switchback approach walls with parapet lips
  [[1.7,3.9,3.1,.5,-.26],[-.2,2.7,4.5,-.55,-.24],[1.9,1.5,5.7,.5,-.22]].forEach(([x,y,z,ry,rz]) => {
    const w = new THREE.Mesh(new THREE.BoxGeometry(3.2,.42,.34), rock);
    w.position.set(x,y,z); w.rotation.y = ry; w.rotation.z = rz; g.add(w);
    const lip = new THREE.Mesh(new THREE.BoxGeometry(3.2,.16,.12), MAT.sandDark);
    lip.position.set(x, y+.28, z); lip.rotation.y = ry; lip.rotation.z = rz; g.add(lip);
  });
  // lower outpost tower
  const outpost = new THREE.Mesh(new THREE.CylinderGeometry(.5,.66,1.5,9), MAT.sandDark);
  outpost.position.set(3.4, 1.7, 5.6); g.add(outpost);
  const omr = merlonRing(.52, 0, 6, [.22,.18,.13]);
  omr.position.set(3.4, 2.55, 5.6); g.add(omr);
  // inner stair climbing from the gate court to the plateau rim
  [[4.95,3.35],[5.15,3.0],[5.35,2.65],[5.55,2.3],[5.72,1.95]].forEach(([y,z]) => {
    const s = new THREE.Mesh(new THREE.BoxGeometry(1.5,.16,.42), rock);
    s.position.set(0,y,z); g.add(s);
  });
  if (variant === 0){
    // Raigad's summit: the Jagdishwar shrine, the nagarkhana drum-house,
    // the pillar stumps of the ruined palace, and the Ganga Sagar tank
    const shrine = new THREE.Mesh(new THREE.BoxGeometry(.6,.55,.6), MAT.white);
    shrine.position.set(-1.5, 6.08, -1.4); g.add(shrine);
    const shrineDome = onionDome(.3, .45, MAT.white, 10);
    shrineDome.position.set(-1.5, 6.35, -1.4); g.add(shrineDome);
    const shrinePin = new THREE.Mesh(new THREE.ConeGeometry(.03,.12,6), MAT.gold);
    shrinePin.position.set(-1.5, 6.88, -1.4); g.add(shrinePin);
    const nag = new THREE.Mesh(gateGeometry(.85, 1.45, .48, .68, .4), MAT.sandDark);
    nag.position.set(1.7, 5.78, -1.15); nag.rotation.y = -.7; g.add(nag);
    { const stumps = [];                                 // durbar-hall pillar bases
      for (let ix = 0; ix < 3; ix++) for (let iz = 0; iz < 4; iz++){
        const c2 = new THREE.CylinderGeometry(.085,.105,.32,7);
        c2.translate(-2.3 + ix*.6, 5.94, -.75 + iz*.55);
        stumps.push(c2);
      }
      g.add(new THREE.Mesh(mergeGeometries(stumps), rockHi));
    }
    const rw = new THREE.Mesh(new THREE.BoxGeometry(2.0,.22,.15), rockMid);
    rw.position.set(-1.7, 5.9, -1.0); g.add(rw);         // a surviving wall line
    const water = new THREE.Mesh(new THREE.CircleGeometry(.78, 14),
      new THREE.MeshStandardMaterial({ color:'#1c2a2e', roughness:.15, metalness:.5 }));
    water.rotation.x = -Math.PI/2; water.position.set(1.9, 5.81, 1.35); g.add(water);
    const kerb = new THREE.Mesh(new THREE.TorusGeometry(.8,.07,6,16), rockHi);
    kerb.rotation.x = Math.PI/2; kerb.position.set(1.9, 5.83, 1.35); g.add(kerb);
  } else {
    // the gadhi: a square keep with its own crown, and a barracks line —
    // a working garrison fort, not a capital
    const keep = new THREE.Mesh(new THREE.BoxGeometry(1.7,1.9,1.7), MAT.sandDark);
    keep.position.set(-1.4, 6.72, -.9); g.add(keep);
    const keepCrown = merlonRing(.95, 0, 12, [.26,.2,.14]);
    keepCrown.position.set(-1.4, 7.77, -.9); g.add(keepCrown);
    const keepDoor = new THREE.Mesh(new THREE.PlaneGeometry(.5,.7),
      new THREE.MeshStandardMaterial({ map: doorTex, roughness:.9 }));
    keepDoor.position.set(-1.4, 6.2, -.04); g.add(keepDoor);
    const barracks = new THREE.Mesh(new THREE.BoxGeometry(2.3,.6,.9), rockMid);
    barracks.position.set(1.5, 6.08, -.9); g.add(barracks);
    const broof = new THREE.Mesh(new THREE.BoxGeometry(2.4,.08,1.0), MAT.slate);
    broof.position.set(1.5, 6.42, -.9); g.add(broof);
  }
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(.035,.05,2.6,7), MAT.darkWood);
  pole.position.set(0, 7.0, 0); g.add(pole);
  const fs = new THREE.Shape();
  fs.moveTo(0,.62); fs.lineTo(1.5,.44); fs.lineTo(.85,.31); fs.lineTo(1.5,.18); fs.lineTo(0,0); fs.closePath();
  const flag = new THREE.Mesh(new THREE.ShapeGeometry(fs),
    new THREE.MeshStandardMaterial({ color:'#e07b39', side:THREE.DoubleSide, roughness:.75 }));
  flag.position.set(.04, 7.55, 0); g.add(flag);
  return g;
}

/* ---- Humayun's Tomb -----------------------------------------------
   Red sandstone body, white marble dome — the garden-tomb that
   foreshadowed the Taj, beside the station that tells that story.  */
function buildHumayunTomb(){
  const g = new THREE.Group();
  const red = new THREE.MeshStandardMaterial({ color:'#9a4a32', roughness:.88, map: MAT.sandstone.map });
  const plat = new THREE.Mesh(new THREE.BoxGeometry(6.4,.55,6.4), red); plat.position.y = .28; g.add(plat);
  const bs = new THREE.Shape();
  bs.moveTo(-1.0,-1.55); bs.lineTo(1.0,-1.55); bs.lineTo(1.55,-1.0); bs.lineTo(1.55,1.0);
  bs.lineTo(1.0,1.55); bs.lineTo(-1.0,1.55); bs.lineTo(-1.55,1.0); bs.lineTo(-1.55,-1.0); bs.closePath();
  const bodyGeo = new THREE.ExtrudeGeometry(bs, { depth:2.1, bevelEnabled:false });
  bodyGeo.rotateX(-Math.PI/2);
  const body = new THREE.Mesh(bodyGeo, red); body.position.y = .55; g.add(body);
  const iwan2 = canvasTexture(128,160,(c,w,h) => {
    c.fillStyle = '#9a4a32'; c.fillRect(0,0,w,h);
    c.strokeStyle = '#efe9dd'; c.lineWidth = 10; c.strokeRect(6,6,w-12,h-12);
    c.fillStyle = '#2c211a'; c.beginPath(); c.moveTo(30,h); c.lineTo(30,76);
    c.quadraticCurveTo(30,30,64,20); c.quadraticCurveTo(98,30,98,76); c.lineTo(98,h);
    c.closePath(); c.fill();
  });
  const im = new THREE.MeshStandardMaterial({ map: iwan2, roughness:.85 });
  [[0,1.57,0],[0,-1.57,Math.PI],[1.57,0,Math.PI/2],[-1.57,0,-Math.PI/2]].forEach(([x,z,ry]) => {
    const p = new THREE.Mesh(new THREE.PlaneGeometry(1.35,1.8), im);
    p.position.set(x,1.55,z); p.rotation.y = ry; g.add(p);
  });
  const drum = new THREE.Mesh(new THREE.CylinderGeometry(.92,.98,.4,18), MAT.marble);
  drum.position.y = 2.85; g.add(drum);
  const dome = onionDome(1.02, 1.55, MAT.marble, 22); dome.position.y = 3.0; g.add(dome);
  const fin = new THREE.Mesh(new THREE.ConeGeometry(.05,.34,8), MAT.gold); fin.position.y = 4.7; g.add(fin);
  [[-1.05,-1.05],[1.05,-1.05],[-1.05,1.05],[1.05,1.05]].forEach(([x,z]) => {
    const cd = new THREE.Mesh(new THREE.CylinderGeometry(.24,.27,.3,8), red); cd.position.set(x,2.8,z); g.add(cd);
    const dd = onionDome(.27,.44, MAT.marble, 10); dd.position.set(x,2.94,z); g.add(dd);
  });
  return g;
}

/* ---- Lahori Gate of the Red Fort ---------------------------------
   Shah Jahan's new capital: red sandstone gate, octagonal flanking
   towers, marble chhatri line above the cusped arch.               */
function buildLahoriGate(){
  const g = new THREE.Group();
  const red = new THREE.MeshStandardMaterial({ color:'#8e3c28', roughness:.9, map: MAT.sandstone.map });
  const gate = new THREE.Mesh(gateGeometry(3.2, 5.6, 1.7, 2.6, 1.6), red); g.add(gate);
  [-3.9, 3.9].forEach(x => {
    const t = new THREE.Mesh(new THREE.CylinderGeometry(.85, 1.0, 6.4, 8), red);
    t.position.set(x, 3.2, 0); g.add(t);
    const td = new THREE.Mesh(new THREE.CylinderGeometry(.55, .62, .35, 8), red);
    td.position.set(x, 6.6, 0); g.add(td);
    const dd = onionDome(.62, .95, MAT.marble, 12); dd.position.set(x, 6.75, 0); g.add(dd);
  });
  const cor = new THREE.Mesh(new THREE.BoxGeometry(7.0,.34,1.3), red); cor.position.y = 5.75; g.add(cor);
  [-1.6, 0, 1.6].forEach(x => {
    const cd = new THREE.Mesh(new THREE.CylinderGeometry(.3,.34,.3,8), red); cd.position.set(x,6.05,0); g.add(cd);
    const dd = onionDome(.34,.5, MAT.marble, 10); dd.position.set(x,6.18,0); g.add(dd);
  });
  return g;
}

/* ---- India Gate ----------------------------------------------------
   The All-India War Memorial for the soldiers of the Great War —
   round arch, cornice, attic and the shallow bowl on top.          */
function buildIndiaGate(){
  const g = new THREE.Group();
  // Lutyens' two stones: red Bharatpur base courses, cream above
  const stone = new THREE.MeshStandardMaterial({ color:'#cfc2ab', roughness:.85, map: MAT.sandstone.map });
  const red   = new THREE.MeshStandardMaterial({ color:'#9c5a40', roughness:.88, map: MAT.sandstone.map });
  // three stepped plinth courses
  [[7.0,.3,3.6,.15],[6.4,.3,3.2,.45],[5.8,.3,2.9,.75]].forEach(([w,h,d,y]) => {
    const s = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), red);
    s.position.y = y; g.add(s);
  });
  // the great arch — a single round-headed opening in massive legs
  const shape = new THREE.Shape();
  shape.moveTo(-2.6,0); shape.lineTo(-2.6,6.4); shape.lineTo(2.6,6.4); shape.lineTo(2.6,0); shape.closePath();
  const hole = new THREE.Path();
  hole.moveTo(-1.15,0); hole.lineTo(-1.15,3.35);
  hole.absarc(0, 3.35, 1.15, Math.PI, 0, true);
  hole.lineTo(1.15,0); hole.closePath();
  shape.holes.push(hole);
  const archGeo = new THREE.ExtrudeGeometry(shape, { depth: 2.2, bevelEnabled: false });
  archGeo.translate(0, 0, -1.1);
  const arch = new THREE.Mesh(archGeo, stone); arch.position.y = .9; g.add(arch);
  // red base courses on each leg
  [-1.88, 1.88].forEach(x => {
    const b = new THREE.Mesh(new THREE.BoxGeometry(1.55,1.15,2.32), red);
    b.position.set(x, 1.46, 0); g.add(b);
  });
  // impost mouldings where the arch springs
  [-1.88, 1.88].forEach(x => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(1.6,.16,2.34), stone);
    m.position.set(x, 4.25, 0); g.add(m);
  });
  // sunburst medallions in the spandrels, both faces
  const sunTex = canvasTexture(128,128,(c,w,h) => {
    c.fillStyle = '#c4b59c'; c.beginPath(); c.arc(64,64,60,0,7); c.fill();
    c.strokeStyle = '#8a7a62'; c.lineWidth = 4;
    c.beginPath(); c.arc(64,64,55,0,7); c.stroke();
    c.fillStyle = '#8a7a62';
    for (let i = 0; i < 16; i++){
      c.save(); c.translate(64,64); c.rotate(i*Math.PI/8);
      c.beginPath(); c.moveTo(0,-14); c.lineTo(6,-44); c.lineTo(-6,-44); c.closePath(); c.fill();
      c.restore();
    }
    c.beginPath(); c.arc(64,64,14,0,7); c.fill();
  });
  const sunMat = new THREE.MeshStandardMaterial({ map: sunTex, roughness:.8, transparent:true });
  [[-1.8,1.115,0],[1.8,1.115,0],[-1.8,-1.115,Math.PI],[1.8,-1.115,Math.PI]].forEach(([x,z,ry]) => {
    const md = new THREE.Mesh(new THREE.CircleGeometry(.4, 20), sunMat);
    md.position.set(x, 5.95, z); md.rotation.y = ry; g.add(md);
  });
  // the carved names of the thirteen thousand — fine text rows on the legs
  const namesTex = canvasTexture(128,256,(c,w,h) => {
    c.fillStyle = '#cbbda6'; c.fillRect(0,0,w,h);
    c.fillStyle = 'rgba(94,82,66,.5)';
    for (let y = 8; y < h; y += 9)
      for (let x = 6; x < w-10; x += 8 + (x*y) % 7)
        c.fillRect(x, y, 4 + (x+y) % 5, 2);
  });
  const namesMat = new THREE.MeshStandardMaterial({ map: namesTex, roughness:.85 });
  [[-1.88,1.112,0],[1.88,1.112,0],[-1.88,-1.112,Math.PI],[1.88,-1.112,Math.PI]].forEach(([x,z,ry]) => {
    const p = new THREE.Mesh(new THREE.PlaneGeometry(1.25,1.9), namesMat);
    p.position.set(x, 3.1, z); p.rotation.y = ry; g.add(p);
  });
  // dentil course under the cornice
  { const dents = [];
    for (let k = -12; k <= 12; k++) [1.14,-1.14].forEach(zs => {
      const d = new THREE.BoxGeometry(.1,.15,.1);
      d.translate(k*.205, 7.15, zs);
      dents.push(d);
    });
    g.add(new THREE.Mesh(mergeGeometries(dents), stone));
  }
  const cornice = new THREE.Mesh(new THREE.BoxGeometry(5.9,.42,2.6), stone);
  cornice.position.y = 7.45; g.add(cornice);
  // attic block bearing INDIA between the war dates
  const atticTex = canvasTexture(512,128,(c,w,h) => {
    c.fillStyle = '#cfc2ab'; c.fillRect(0,0,w,h);
    for (let i = 0; i < 160; i++){
      c.fillStyle = `rgba(120,104,84,${Math.random()*.08})`;
      c.fillRect(Math.random()*w, Math.random()*h, 6, 2);
    }
    c.fillStyle = '#6e5f4c'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.font = '700 58px Georgia, serif'; c.fillText('INDIA', w/2, h/2 + 2);
    c.font = '400 24px Georgia, serif';
    c.fillText('MCMXIV', w/2 - 175, h/2);
    c.fillText('MCMXIX', w/2 + 175, h/2);
  });
  const atticFace = new THREE.MeshStandardMaterial({ map: atticTex, roughness:.85 });
  const attic = new THREE.Mesh(new THREE.BoxGeometry(4.4,1.05,1.9),
    [stone, stone, stone, stone, atticFace, atticFace]);
  attic.position.y = 8.2; g.add(attic);
  const atticStep = new THREE.Mesh(new THREE.BoxGeometry(3.3,.5,1.55), stone);
  atticStep.position.y = 8.95; g.add(atticStep);
  // the shallow bowl — meant for burning oil on days of remembrance
  const drum = new THREE.Mesh(new THREE.CylinderGeometry(1.02,1.12,.34,18), stone);
  drum.position.y = 9.35; g.add(drum);
  const bowl = new THREE.Mesh(new THREE.SphereGeometry(1.0,18,8,0,Math.PI*2,0,Math.PI/2.6), stone);
  bowl.scale.y = .62; bowl.position.y = 9.28; g.add(bowl);
  return g;
}

/* ---- 1947 finale: tricolour with flag-wave shader + midnight clock ---- */
let flagUniforms = null;
let finaleFx = null;     // celebration balloons, animated by the engine

/* ---- the 2014→today ending: a dark day -----------------------------
   No flag. The pole is there — the flag is not; the halyard hangs.
   Under smog: a cracked Nyay ki Devi on a split plinth (one pan of her
   scales on the ground), broken streetlights bent and dead around the
   plaza, one down in glass, police barricades and a SECTION 144 sign,
   a "SILENCE ZONE" gantry with two sealed loudspeakers, a chained
   microphone stand, a burnt-out car, an overflowing bin, an open drain,
   torn posters — and on the marble the citizens' own words, chalked,
   hosed, and chalked again.
   The camera still circles: there is simply nothing raised at the
   centre to salute. The montage still plays — every plate had papers. */
function buildDarkFinale(){
  const g = new THREE.Group();
  const iron  = new THREE.MeshStandardMaterial({ color:'#3a3a3c', roughness:.6, metalness:.5 });
  const rust  = new THREE.MeshStandardMaterial({ color:'#6e4a2c', roughness:.9, metalness:.25 });
  const grey  = new THREE.MeshStandardMaterial({ color:'#5b5754', roughness:1 });
  const dark  = new THREE.MeshStandardMaterial({ color:'#1a1a1c', roughness:.9 });
  flagUniforms = { uTime:{value:0}, uMap:{value:null} };          // the engine ticks it; nothing renders it
  finaleFx = { balloons: [] };                                    // no celebration

  // the flagpole — bare. Halyard flapping loose against it; the truck at the top is missing.
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(.07,.1,7.5,10), iron); pole.position.y = 3.75; g.add(pole);
  const halyard = new THREE.Mesh(new THREE.CylinderGeometry(.008,.008,6.2,4), rust); halyard.position.set(.14, 4.0, .05); halyard.rotation.z = .02; g.add(halyard);
  const bracket = new THREE.Mesh(new THREE.BoxGeometry(.3,.06,.06), rust); bracket.position.set(.15, 7.35, 0); bracket.rotation.z = -.4; g.add(bracket);
  // the base: same stepped octagon, cracked, one step broken away
  [[2.2,.22,0],[1.7,.2,.22],[1.25,.18,.42]].forEach(([r,h,y0], i) => {
    const s2 = new THREE.Mesh(new THREE.CylinderGeometry(r, r+.18, h, 8, 1, false, 0, i === 1 ? Math.PI * 1.7 : Math.PI * 2), grey);
    s2.position.y = y0 + h/2; g.add(s2);
  });
  // a plaque at the foot, its lettering torn off — you can read the ghost of it
  const plaque = new THREE.Mesh(new THREE.BoxGeometry(1.1,.5,.06), new THREE.MeshStandardMaterial({
    map: canvasTexture(256,120,(c,w,h) => { c.fillStyle='#4a4038'; c.fillRect(0,0,w,h);
      c.fillStyle='rgba(120,100,70,.35)'; c.font='700 26px Georgia'; c.textAlign='center'; c.fillText('WE, THE PEOPLE', w/2, 52);
      c.fillStyle='#4a4038'; for (let i=0;i<9;i++) c.fillRect(20+i*26, 30, 12+Math.random()*10, 32);   // letters prised off
      c.font='16px monospace'; c.fillStyle='rgba(180,160,130,.6)'; c.fillText('(under revision)', w/2, 96); }), roughness:.8 }));
  plaque.position.set(0, .95, 1.3); plaque.rotation.x = -.35; g.add(plaque);

  // ---- Nyay ki Devi, cracked: blindfolded Justice on a split plinth, one
  //      pan of the scales gone, the sword point-down, the figure tilted ----
  const stone = new THREE.MeshStandardMaterial({ color:'#b9b1a4', roughness:.92 });
  const stoneD = new THREE.MeshStandardMaterial({ color:'#7c756e', roughness:1 });
  const devi = new THREE.Group(); devi.position.set(-5.2, 0, -5.4); devi.rotation.y = .55; g.add(devi);
  g.userData.devi = devi;
  const plinthA = new THREE.Mesh(new THREE.BoxGeometry(1.4, .9, 1.4), stone); plinthA.position.set(-.06, .45, 0); plinthA.rotation.z = .03; devi.add(plinthA);
  const plinthB = new THREE.Mesh(new THREE.BoxGeometry(.5, .9, 1.4), stoneD); plinthB.position.set(.78, .38, .1); plinthB.rotation.z = -.16; devi.add(plinthB); // the sheared-off slab
  const fig = new THREE.Group(); fig.position.set(-.05, .9, 0); fig.rotation.z = .07; devi.add(fig);
  const robe = new THREE.Mesh(new THREE.CylinderGeometry(.22, .42, 1.5, 12), stone); robe.position.y = .75; fig.add(robe);
  const torso = new THREE.Mesh(new THREE.CylinderGeometry(.24, .22, .55, 10), stone); torso.position.y = 1.72; fig.add(torso);
  const head = new THREE.Mesh(new THREE.SphereGeometry(.17, 12, 10), stone); head.position.y = 2.15; fig.add(head);
  const blindfold = new THREE.Mesh(new THREE.CylinderGeometry(.175, .175, .07, 12), stoneD); blindfold.position.set(0, 2.17, 0); fig.add(blindfold);
  // arms: left holds the scales up, right holds the sword - point down, tip broken
  const armL = new THREE.Mesh(new THREE.CylinderGeometry(.06, .07, .7, 8), stone); armL.position.set(-.34, 1.85, .05); armL.rotation.z = 1.05; fig.add(armL);
  const armR = new THREE.Mesh(new THREE.CylinderGeometry(.06, .07, .6, 8), stone); armR.position.set(.3, 1.55, .05); armR.rotation.z = -.35; fig.add(armR);
  const sbeam = new THREE.Mesh(new THREE.CylinderGeometry(.02, .02, .8, 6), stoneD); sbeam.position.set(-.62, 2.05, .05); sbeam.rotation.z = Math.PI/2 + .35; fig.add(sbeam);
  const chainL = new THREE.Mesh(new THREE.CylinderGeometry(.008, .008, .32, 4), stoneD); chainL.position.set(-.98, 1.98, .05); fig.add(chainL);
  const panL = new THREE.Mesh(new THREE.CylinderGeometry(.16, .12, .05, 12), stoneD); panL.position.set(-.98, 1.8, .05); fig.add(panL);
  // the other pan is on the ground, and its chain hangs empty
  const chainR = new THREE.Mesh(new THREE.CylinderGeometry(.008, .008, .2, 4), stoneD); chainR.position.set(-.3, 2.2, .05); chainR.rotation.z = .5; fig.add(chainR);
  const panFallen = new THREE.Mesh(new THREE.CylinderGeometry(.16, .12, .05, 12), stoneD); panFallen.position.set(-1.6, .04, .6); panFallen.rotation.set(.1, .3, .25); devi.add(panFallen);
  const sword = new THREE.Mesh(new THREE.BoxGeometry(.05, 1.0, .015), stoneD); sword.position.set(.5, .95, .1); sword.rotation.z = -.15; fig.add(sword);   // point-down, snapped short
  // cracks across the figure: dark seams
  [[0,1.3,.4,.6],[-.1,1.9,-.5,.35],[.15,.6,.9,.5]].forEach(([x,y,rz,len]) => { const cr = new THREE.Mesh(new THREE.BoxGeometry(.012, len, .01), dark);
    cr.position.set(x, y, .23); cr.rotation.z = rz; fig.add(cr); });
  // the pedestal's tablet: SATYAMEVA JAYATE with two letters fallen off
  const tab = new THREE.Mesh(new THREE.PlaneGeometry(1.0, .3), new THREE.MeshStandardMaterial({ map: canvasTexture(256,76,(c,w,h) => {
    c.fillStyle='#8f877c'; c.fillRect(0,0,w,h); c.fillStyle='#2e2a25'; c.font='700 26px Georgia'; c.textAlign='center'; c.fillText('SATYAMEVA  JAYATE', w/2, 50);
    c.fillStyle='#8f877c'; c.fillRect(74, 22, 20, 36); c.fillRect(196, 22, 22, 36); }), roughness:.9 }));
  tab.position.set(0, .5, .72); devi.add(tab);

  // ---- broken streetlights around the plaza (instead of the mast ring):
  //      bent, dead, one lying across the ground with its head shattered ----
  const poleGeo = new THREE.CylinderGeometry(.06,.09,5.2,8);
  const armGeo = new THREE.CylinderGeometry(.04,.04,1.4,6); armGeo.rotateZ(Math.PI/2); armGeo.translate(-.6,0,0);
  const headGeo = new THREE.BoxGeometry(.5,.14,.22);
  const lamps = [[6.4,-1.5,.0,.12],[7.0,3.2,-.4,.0],[-6.8,2.6,.3,-.18],[-7.2,-1.8,.0,.28],[2.5,-7.4,.5,.05],[-2.8,-7.6,-.2,.0]];
  lamps.forEach(([x,z,yaw,lean], i) => {
    const L = new THREE.Group(); L.position.set(x, 0, z); L.rotation.set(0, yaw, lean); g.add(L);
    const pole = new THREE.Mesh(poleGeo, iron); pole.position.y = 2.6; L.add(pole);
    const arm = new THREE.Mesh(armGeo, iron); arm.position.set(0, 5.1, 0); L.add(arm);
    const hd = new THREE.Mesh(headGeo, iron); hd.position.set(-1.25, 5.05, 0); hd.rotation.z = (i % 2) ? .6 : -.15; L.add(hd);   // heads knocked askew
    if (i % 3 === 0){ const pane = new THREE.Mesh(new THREE.BoxGeometry(.42,.06,.18), dark); pane.position.set(-1.25, 4.96, 0); pane.rotation.z = hd.rotation.z; L.add(pane); }
    // wiring hanging out of the base door
    const wire = new THREE.Mesh(new THREE.TorusGeometry(.12,.012,6,10, Math.PI*1.4), rust); wire.position.set(.1, .5, .1); wire.rotation.y = 1; L.add(wire);
  });
  // one down completely: pole across the ground, head shattered into glass shards
  const down = new THREE.Group(); down.position.set(4.6, 0, 5.4); down.rotation.y = -.7; g.add(down);
  const stub = new THREE.Mesh(new THREE.CylinderGeometry(.08,.09,.7,8), iron); stub.position.y = .35; stub.rotation.z = .3; down.add(stub);
  const fallenPole = new THREE.Mesh(poleGeo, iron); fallenPole.position.set(2.5, .1, .3); fallenPole.rotation.z = Math.PI/2 - .06; down.add(fallenPole);
  const fhead = new THREE.Mesh(headGeo, iron); fhead.position.set(5.5, .12, .5); fhead.rotation.set(0, .3, .5); down.add(fhead);
  for (let k = 0; k < 9; k++){ const sh = new THREE.Mesh(new THREE.PlaneGeometry(.08 + Math.random()*.1, .06 + Math.random()*.08),
    new THREE.MeshStandardMaterial({ color:'#cfd8dc', roughness:.2, metalness:.3, side: THREE.DoubleSide }));
    sh.position.set(5.2 + (Math.random()-.5)*1.4, .01, .5 + (Math.random()-.5)*1.2); sh.rotation.set(-Math.PI/2, 0, Math.random()*3); down.add(sh); }

  // ---- police barricades: yellow-and-black, some knocked over, one row across ----
  const barrY = new THREE.MeshStandardMaterial({ color:'#d9b53a', roughness:.8 });
  const barrTex = canvasTexture(256,64,(c,w,h) => { c.fillStyle='#d9b53a'; c.fillRect(0,0,w,h);
    c.fillStyle='#141414'; for (let x = -32; x < w; x += 64){ c.beginPath(); c.moveTo(x,0); c.lineTo(x+32,0); c.lineTo(x+64,h); c.lineTo(x+32,h); c.closePath(); c.fill(); }
    c.fillStyle='rgba(255,255,255,.85)'; c.font='700 22px monospace'; c.textAlign='center'; c.fillText('POLICE', w/2, 40); });
  const barrFace = new THREE.MeshStandardMaterial({ map: barrTex, roughness:.85 });
  const barricade = (x, z, yaw, over) => {
    const B = new THREE.Group(); B.position.set(x, 0, z); B.rotation.y = yaw; if (over) B.rotation.x = -1.35;
    const rail = new THREE.Mesh(new THREE.BoxGeometry(2.2, .5, .06), [barrY,barrY,barrY,barrY,barrFace,barrFace]); rail.position.y = over ? .35 : .95; B.add(rail);
    [-.95, .95].forEach(lx => { const leg = new THREE.Mesh(new THREE.BoxGeometry(.06,1.15,.06), iron); leg.position.set(lx, .58, 0); B.add(leg);
      const foot = new THREE.Mesh(new THREE.BoxGeometry(.06,.05,.6), iron); foot.position.set(lx, .03, 0); B.add(foot); });
    g.add(B);
  };
  [[-3.4, 6.2, .1, false], [-1.0, 6.5, -.05, false], [1.5, 6.3, .12, true], [3.9, 6.6, .3, false],
   [-6.0, 1.0, 1.4, false], [-6.3, -1.4, 1.6, true], [6.2, 1.2, 1.55, false]].forEach(([x,z,y,o]) => barricade(x, z, y, o));
  // a rusted sign wired to one barricade
  const rs = new THREE.Mesh(new THREE.PlaneGeometry(.9,.55), new THREE.MeshStandardMaterial({ map: canvasTexture(180,110,(c,w,h) => {
    c.fillStyle='#e9e4da'; c.fillRect(0,0,w,h); c.fillStyle='#c0392b'; c.font='700 22px Georgia'; c.textAlign='center'; c.fillText('SECTION 144', w/2, 44);
    c.font='14px monospace'; c.fillStyle='#4a4a4a'; c.fillText('assembly of >4 questions', w/2, 74); c.fillText('prohibited', w/2, 94);
    c.fillStyle='rgba(120,70,30,.5)'; for (let i=0;i<40;i++) c.fillRect(Math.random()*w, Math.random()*h, 3, 3); }), roughness:.9, side: THREE.DoubleSide }));
  rs.position.set(-1.0, 1.05, 6.55); g.add(rs);

  // ---- more of the public realm: an overflowing bin, an open drain, torn posters ----
  const bin = new THREE.Mesh(new THREE.CylinderGeometry(.32,.28,.9,12,1,true), new THREE.MeshStandardMaterial({ color:'#2f6b3a', roughness:.85, side: THREE.DoubleSide }));
  bin.position.set(5.6, .45, -7.0); bin.rotation.z = .12; g.add(bin);
  for (let k = 0; k < 14; k++){ const bag = new THREE.Mesh(new THREE.SphereGeometry(.09 + Math.random()*.08, 6, 5),
    new THREE.MeshStandardMaterial({ color: ['#e9e4da','#141414','#3aa0e8','#8f877c'][k%4], roughness:.9 }));
    const a = k * 1.3, r = k < 6 ? .18 : .5 + Math.random()*.6; bag.position.set(5.6 + Math.cos(a)*r, k < 6 ? .95 + (k%3)*.09 : .07, -7.0 + Math.sin(a)*r); g.add(bag); }
  const drain = new THREE.Mesh(new THREE.BoxGeometry(1.4, .06, 1.0), dark); drain.position.set(-4.2, .0, 6.9); g.add(drain);
  const drainRim = new THREE.Mesh(new THREE.BoxGeometry(1.5, .1, 1.1), stoneD); drainRim.position.set(-4.2, .0, 6.9); g.add(drainRim);
  const lidOff = new THREE.Mesh(new THREE.BoxGeometry(1.35, .06, .95), stoneD); lidOff.position.set(-3.1, .05, 6.4); lidOff.rotation.set(0, .5, .06); g.add(lidOff);
  const posterTex = canvasTexture(128,160,(c,w,h) => { c.fillStyle='#e0d8c8'; c.fillRect(0,0,w,h); c.fillStyle='#c0392b'; c.font='700 18px Georgia'; c.textAlign='center';
    c.fillText('MEGA', w/2, 40); c.fillText('EVENT', w/2, 62); c.fillStyle='#141414'; c.font='11px monospace'; c.fillText('(postponed)', w/2, 90);
    c.fillStyle='rgba(0,0,0,.35)'; c.beginPath(); c.moveTo(0,h); c.lineTo(0,h*.6); c.lineTo(w*.45,h); c.closePath(); c.fill(); });
  [[-6.6, 3.9, .4],[6.9, -1.9, -.9]].forEach(([x,z,ry],i) => { const P = new THREE.Mesh(new THREE.PlaneGeometry(.7,.88), new THREE.MeshStandardMaterial({ map: posterTex, roughness:.9, side: THREE.DoubleSide }));
    P.position.set(x, 1.6 + i*.3, z); P.rotation.set(0, ry, (i%2?.06:-.05)); g.add(P); });
  // two sealed loudspeakers stay - on the gantry itself, pointed at the arriving walker
  const hornGeo = new THREE.ConeGeometry(.28,.6,12,1,true); hornGeo.rotateX(Math.PI/2);
  const sealGeo = new THREE.CircleGeometry(.29, 12);
  [-1.6, 1.6].forEach(x => { const horn = new THREE.Mesh(hornGeo, iron); horn.position.set(x, 4.35, 8.6); horn.lookAt(x, 1.5, 14); g.add(horn);
    const seal = new THREE.Mesh(sealGeo, dark); seal.position.copy(horn.position); seal.lookAt(x, 1.5, 14); seal.translateZ(.31); g.add(seal); });
  // the SILENCE ZONE gantry across the gateway the walker enters through
  const gTex = canvasTexture(512,96,(c,w,h) => { c.fillStyle='#141414'; c.fillRect(0,0,w,h); c.fillStyle='#ffd166'; c.font='700 44px Georgia'; c.textAlign='center';
    c.fillText('SILENCE ZONE', w/2, 62); c.font='16px monospace'; c.fillStyle='#b8ac9c'; c.fillText('questions strictly prohibited', w/2, 86); });
  const gantry = new THREE.Group(); gantry.position.set(0, 0, 8.6);
  [-2.2, 2.2].forEach(x => { const p = new THREE.Mesh(new THREE.CylinderGeometry(.08,.1,4.2,8), iron); p.position.set(x, 2.1, 0); gantry.add(p); });
  const beam = new THREE.Mesh(new THREE.BoxGeometry(4.6, .8, .08), new THREE.MeshStandardMaterial({ map:gTex, roughness:.85 }));
  beam.position.set(0, 3.9, 0); beam.rotation.y = Math.PI; gantry.add(beam);
  g.add(gantry);
  // a microphone stand, chained to the base
  const stand = new THREE.Mesh(new THREE.CylinderGeometry(.02,.03,1.5,8), iron); stand.position.set(-2.4, .75, 1.6); g.add(stand);
  const sbase = new THREE.Mesh(new THREE.CylinderGeometry(.22,.26,.05,12), iron); sbase.position.set(-2.4, .03, 1.6); g.add(sbase);
  const mic = new THREE.Mesh(new THREE.CapsuleGeometry(.05,.16,4,8), iron); mic.position.set(-2.4, 1.6, 1.62); mic.rotation.x = .3; g.add(mic);
  for (let k = 0; k < 8; k++){ const link = new THREE.Mesh(new THREE.TorusGeometry(.05,.012,6,10), rust);
    link.position.set(-2.4 + k*.14, 1.15 - k*.06, 1.6 + k*.05); link.rotation.y = k * .8; link.rotation.x = k * .4; g.add(link); }
  const lock = new THREE.Mesh(new THREE.BoxGeometry(.12,.16,.06), rust); lock.position.set(-1.3, .68, 2.0); g.add(lock);
  // a burnt-out car at the plaza's edge, and a toppled hoarding
  const car = new THREE.Group(); car.position.set(6.5, 0, -4.5); car.rotation.y = .7;
  const shell = new THREE.Mesh(new THREE.BoxGeometry(3.6, .9, 1.7), dark); shell.position.y = .55; car.add(shell);
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(2.0, .7, 1.5), dark); cabin.position.set(-.2, 1.35, 0); car.add(cabin);
  [[-1.2,.9],[1.2,.9],[-1.2,-.9],[1.2,-.9]].forEach(([x,z]) => { const w = new THREE.Mesh(new THREE.TorusGeometry(.32,.1,8,16), dark);
    w.position.set(x, .32, z); w.rotation.y = Math.PI/2; car.add(w); });
  g.add(car);
  const fallen = new THREE.Mesh(new THREE.BoxGeometry(3.6, 2.0, .1), new THREE.MeshStandardMaterial({
    map: canvasTexture(384,214,(c,w,h) => { c.fillStyle='#e0d8c8'; c.fillRect(0,0,w,h); c.fillStyle='#141414'; c.font='800 46px Georgia'; c.textAlign='center';
      c.fillText('ACHHE DIN', w/2, 100); c.font='20px monospace'; c.fillStyle='#4a4a4a'; c.fillText('(this hoarding has been retired)', w/2, 150); }), roughness:.85 }));
  fallen.position.set(-6.5, .55, -3.5); fallen.rotation.set(-1.25, 0, .3); g.add(fallen);
  // on the marble, in chalk: the citizens' words, hosed and rewritten
  const chalk = new THREE.Mesh(new THREE.PlaneGeometry(9, 4.5), new THREE.MeshBasicMaterial({
    map: canvasTexture(768,384,(c,w,h) => { c.clearRect(0,0,w,h); c.textAlign='center';
      const line = (t, y, a, size, rot) => { c.save(); c.translate(w/2, y); c.rotate(rot); c.fillStyle=`rgba(240,236,226,${a})`; c.font=`700 ${size}px "Comic Sans MS", cursive, sans-serif`; c.fillText(t, 0, 0); c.restore(); };
      line('HUM DEKHENGE', 120, .18, 78, -.03); line('WHERE IS THE DATA?', 220, .12, 54, .02);
      line('HUM DEKHENGE', 140, .55, 84, .01); line('sawal poochna mana hai?', 262, .5, 40, -.015); line('— the cockroaches', 340, .45, 30, .0); }),
    transparent:true, depthWrite:false, toneMapped:false }));
  chalk.rotation.x = -Math.PI/2; chalk.position.set(0, .02, 3.6); g.add(chalk);
  return g;
}
function buildFinale(){
  if (SATIRE) return buildDarkFinale();
  const g = new THREE.Group();
  const tricolour = canvasTexture(512, 342, (c,w,h) => {
    c.fillStyle = '#FF9933'; c.fillRect(0,0,w,h/3);
    c.fillStyle = '#ffffff'; c.fillRect(0,h/3,w,h/3);
    c.fillStyle = '#138808'; c.fillRect(0,2*h/3,w,h/3);
    c.strokeStyle = '#000080'; c.lineWidth = 5;
    const cx = w/2, cy = h/2, r = 48;
    c.beginPath(); c.arc(cx,cy,r,0,7); c.stroke();
    for (let i=0;i<24;i++){ const a = i*Math.PI/12;
      c.beginPath(); c.moveTo(cx,cy); c.lineTo(cx+r*Math.cos(a), cy+r*Math.sin(a)); c.lineWidth=2; c.stroke(); }
  });
  flagUniforms = { uTime:{value:0}, uMap:{value:tricolour} };
  const flagGeo = new THREE.PlaneGeometry(3.0, 2.0, 26, 14);
  flagGeo.translate(1.5, 0, 0);                        // hoist edge at the pole
  const flag = new THREE.Mesh(flagGeo, new THREE.ShaderMaterial({
    uniforms: flagUniforms, side: THREE.DoubleSide,
    vertexShader:`uniform float uTime; varying vec2 vUv; varying float vW;
      void main(){ vUv = uv;
        vec3 p = position;
        float f = clamp(p.x/3.0, 0.0, 1.0);
        float w = sin(p.x*2.6 - uTime*3.1) * 0.22 * f + sin(p.y*3.4 + uTime*2.1) * 0.05 * f;
        p.z += w; vW = w;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0); }`,
    fragmentShader:`uniform sampler2D uMap; varying vec2 vUv; varying float vW;
      void main(){ vec3 col = texture2D(uMap, vUv).rgb * (0.86 + 0.45*vW);
        gl_FragColor = vec4(col, 1.0); }`
  }));
  flag.position.y = 6.1; g.add(flag);
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(.07,.1,7.5,10),
    new THREE.MeshStandardMaterial({ color:'#d8d8d8', metalness:.6, roughness:.4 }));
  pole.position.y = 3.75; g.add(pole);
  const finial = new THREE.Mesh(new THREE.SphereGeometry(.1,10,8), MAT.gold);
  finial.position.y = 7.56; g.add(finial);                        // gilded truck at the masthead
  // ceremonial base: stepped octagonal platform
  [[2.2,.22,0],[1.7,.2,.22],[1.25,.18,.42]].forEach(([r,h,y0]) => {
    const s2 = new THREE.Mesh(new THREE.CylinderGeometry(r, r+.18, h, 8), MAT.marble);
    s2.position.y = y0 + h/2; g.add(s2);
  });
  const poleBase = new THREE.Mesh(new THREE.CylinderGeometry(.7,.9,.5,12), MAT.marble);
  poleBase.position.y = .82; g.add(poleBase);
  // the clock at midnight — "at the stroke of the midnight hour"
  const clockTex = canvasTexture(256,256,(c,w,h) => {
    c.fillStyle='#f7f3e8'; c.beginPath(); c.arc(128,128,116,0,7); c.fill();
    c.lineWidth=10; c.strokeStyle='#b08d3e'; c.stroke();
    c.fillStyle='#222';
    for (let i=0;i<12;i++){ const a=i*Math.PI/6;
      c.save(); c.translate(128+92*Math.sin(a), 128-92*Math.cos(a));
      c.beginPath(); c.arc(0,0,i%3===0?7:4,0,7); c.fill(); c.restore(); }
    c.strokeStyle='#222'; c.lineCap='round';
    c.lineWidth=10; c.beginPath(); c.moveTo(128,128); c.lineTo(128,58); c.stroke();  // hour → 12
    c.lineWidth=6;  c.beginPath(); c.moveTo(128,128); c.lineTo(128,36); c.stroke();  // minute → 12
    c.fillStyle='#b08d3e'; c.beginPath(); c.arc(128,128,8,0,7); c.fill();
  });
  // a four-faced pillar clock in dark iron and gold — every face at XII
  const clockGrp = new THREE.Group(); clockGrp.position.set(3.4, 0, 1.2); g.add(clockGrp);
  const iron2 = new THREE.MeshStandardMaterial({ color:'#22352c', metalness:.55, roughness:.5 });
  [[1.35,.2,0],[1.05,.18,.2]].forEach(([w,h,y0]) => {
    const b = new THREE.Mesh(new THREE.BoxGeometry(w,h,w), MAT.marble);
    b.position.y = y0 + h/2; clockGrp.add(b);
  });
  const shaft = new THREE.Mesh(new THREE.LatheGeometry(
    [[.46,.38],[.44,.52],[.28,.64],[.22,1.0],[.2,1.75],[.24,2.12],[.34,2.24],[.38,2.36]]
      .map(([r,y0]) => new THREE.Vector2(r,y0)), 14), iron2);
  clockGrp.add(shaft);
  [.66,2.3].forEach(y0 => {                                      // gold collars
    const c2 = new THREE.Mesh(new THREE.TorusGeometry(.27,.02,6,16), MAT.gold);
    c2.rotation.x = Math.PI/2; c2.position.y = y0; clockGrp.add(c2);
  });
  const head = new THREE.Mesh(new THREE.BoxGeometry(.8,.8,.8), iron2);
  head.position.y = 2.78; clockGrp.add(head);
  const clockMat = new THREE.MeshBasicMaterial({ map: clockTex, toneMapped: false });
  [[0,.41,0],[0,-.41,Math.PI],[.41,0,Math.PI/2],[-.41,0,-Math.PI/2]].forEach(([x,z,ry]) => {
    const face = new THREE.Mesh(new THREE.CircleGeometry(.3,24), clockMat);
    face.position.set(x, 2.78, z); face.rotation.y = ry; clockGrp.add(face);
    const bez = new THREE.Mesh(new THREE.TorusGeometry(.3,.024,6,20), MAT.gold);
    bez.position.set(x, 2.78, z); bez.rotation.y = ry; clockGrp.add(bez);
  });
  const cap = new THREE.Mesh(new THREE.ConeGeometry(.6,.36,4), iron2);
  cap.rotation.y = Math.PI/4; cap.position.y = 3.36; clockGrp.add(cap);
  const knob = new THREE.Mesh(new THREE.SphereGeometry(.06,8,6), MAT.gold);
  knob.position.y = 3.58; clockGrp.add(knob);
  const spike = new THREE.Mesh(new THREE.ConeGeometry(.025,.22,6), MAT.gold);
  spike.position.y = 3.72; clockGrp.add(spike);

  // the plaza dressed for the day: a marble bollard-and-chain ring
  // around the flag — with a ceremonial opening where the walk
  // arrives (+Z faces the walker) — and marigold urns at the corners
  const kept = [];
  for (let i = 0; i < 14; i++){
    const a = i * Math.PI * 2 / 14;
    if (Math.abs(((a - Math.PI/2 + Math.PI) % (Math.PI*2)) - Math.PI) < .52) continue;  // the gateway
    kept.push({ i, x: Math.cos(a) * 8.6, z: Math.sin(a) * 8.6 });
  }
  kept.forEach(p => {
    const b = new THREE.Mesh(new THREE.CylinderGeometry(.09,.12,.5,8), MAT.marble);
    b.position.set(p.x,.25,p.z); g.add(b);
    const capB = new THREE.Mesh(new THREE.SphereGeometry(.1,8,6), MAT.gold);
    capB.position.set(p.x,.55,p.z); g.add(capB);
  });
  for (let k = 0; k < kept.length - 1; k++){
    if (kept[k+1].i - kept[k].i !== 1) continue;              // no chain across the gateway
    g.add(rod(new THREE.Vector3(kept[k].x,.48,kept[k].z),
              new THREE.Vector3(kept[k+1].x,.48,kept[k+1].z), .012, MAT.iron));
  }
  [[6,6],[-6,6],[6,-6],[-6,-6]].forEach(([x,z]) => {
    const urn = new THREE.Mesh(new THREE.CylinderGeometry(.34,.2,.5,10), MAT.sandstone);
    urn.position.set(x,.25,z); g.add(urn);
    for (let k = 0; k < 6; k++){                              // marigolds
      const m = new THREE.Mesh(new THREE.SphereGeometry(.09,6,5),
        new THREE.MeshStandardMaterial({ color: k % 2 ? '#e8901f' : '#d4691b', roughness:.8 }));
      m.position.set(x + Math.sin(k*2.4)*.18, .58 + (k%2)*.07, z + Math.cos(k*1.9)*.18);
      g.add(m);
    }
  });

  // ---- the celebration: saffron, white and green balloons rising
  // free over the plaza on the midnight air ----
  const balloonGeo = new THREE.SphereGeometry(.16, 10, 8);
  const knotGeo = new THREE.ConeGeometry(.032, .05, 6);
  const bMats = ['#f28c28', '#f2efe4', '#1f8f3a'].map(c =>
    new THREE.MeshStandardMaterial({ color: c, roughness: .3, metalness: .05 }));
  const mkBalloon = (mat) => {
    const b = new THREE.Group();
    const s2 = new THREE.Mesh(balloonGeo, mat); s2.scale.y = 1.2; b.add(s2);
    const k = new THREE.Mesh(knotGeo, mat); k.position.y = -.22; b.add(k);
    return b;
  };
  finaleFx = { balloons: [] };
  for (let i = 0; i < 14; i++){
    const bl = mkBalloon(bMats[i % 3]);
    const a = i * .449 + .4, r = 4 + (i * 7) % 11;
    bl.position.set(Math.cos(a) * r, 6 + (i * 2.3) % 15, Math.sin(a) * r);   // airborne band only
    g.add(bl);
    finaleFx.balloons.push({ grp: bl, spd: .3 + (i % 4) * .08, ph: i * .9,
                             x: bl.position.x, z: bl.position.z });
  }
  return g;
}

/* ---- 1858 special: fading Mughal arch behind a rising Crown ---- */
let crownFx = null;
function buildCrownArch(accent){
  const g = new THREE.Group();
  const archMat = new THREE.MeshStandardMaterial({ color:'#c89b62', roughness:.9,
    transparent:true, opacity:.75, map: MAT.sandstone.map });
  const shape = new THREE.Shape();
  shape.moveTo(-1.5,0); shape.lineTo(-1.5,3.6); shape.lineTo(1.5,3.6); shape.lineTo(1.5,0); shape.closePath();
  shape.holes.push(cuspedArchHole(1.0, 1.9, 1.0, 7));
  const arch = new THREE.Mesh(new THREE.ExtrudeGeometry(shape,{depth:.25,bevelEnabled:false}), archMat);
  arch.position.set(0,0,-1.3); g.add(arch);
  // rubble at the fading arch's feet
  for (let i = 0; i < 5; i++){
    const bit = new THREE.Mesh(new THREE.DodecahedronGeometry(.07 + (i%3)*.03, 0), MAT.cracked);
    bit.position.set(-1.1 + i*.55, .06, -1.05 + Math.sin(i*2.4)*.2);
    bit.rotation.set(i, i*.8, 0); g.add(bit);
  }
  // the Crown rises from a stone pedestal, not from thin air
  const ped = new THREE.Mesh(new THREE.BoxGeometry(.85,.95,.85), MAT.sandstone);
  ped.position.set(0,.48,.4); g.add(ped);
  const pedCap = new THREE.Mesh(new THREE.BoxGeometry(.98,.1,.98), MAT.slate);
  pedCap.position.set(0,1.0,.4); g.add(pedCap);
  const crown = makeCrown();
  const cushion = new THREE.Mesh(new THREE.CylinderGeometry(.55,.6,.22,14),
    new THREE.MeshStandardMaterial({ color:'#6E2138', roughness:.7 }));
  cushion.position.y=-.26; crown.add(cushion);
  crown.position.set(0, 1.32, .4);          // seated on the pedestal cap
  g.add(crown);
  crownFx = { archMat, crown, baseY: 1.32 };
  return g;
}

/* ---- build every station by mapping over TIMELINE ---- */
const stations = [];   // {st, s, pos, anchor, sideSign, frameGrp}
function buildStations(){
  TIMELINE.forEach((st, i) => {
    const s = STATION_S[i];
    const sideSign = st.side === 'left' ? 1 : -1;   // +side vector = visual left of travel
    const P = pointAt(s, new THREE.Vector3());
    const S = sideAt(s, new THREE.Vector3());
    const T = tangentAt(s, new THREE.Vector3());
    const grp = new THREE.Group();
    if (st.prop === 'finale'){
      // the tricolour stands at the centre of the plaza, dead ahead as the walk ends
      const FP = pointAt(FLAG_S, new THREE.Vector3());
      FLAG_POS.copy(FP);                          // orbit centre for the finale
      grp.position.copy(FP);
      grp.lookAt(P.x, 0.4, P.z);                    // face back toward the approaching walker
    } else {
      grp.position.copy(P).addScaledVector(S, sideSign * 4.6);
      grp.lookAt(P.x, 0.4, P.z);                    // face the walkway
    }
    scene.add(grp);

    // era-styled frame
    let frame;
    if (st.prop === 'finale'){     frame = { grp: buildFinale(), anchorY: 5.2 };
      if (frame.grp.userData.devi) EXPLORABLES.push({ root: frame.grp.userData.devi, name: 'Nyay ki Devi',
        blurb: 'Blindfolded, as she should be. One pan of the scales is on the ground; the sword points down; the plinth split. SATYAMEVA JAYATE — two letters have fallen off.' });
    }
    else if (st.flashback)         frame = flashbackFrame(st);
    else if (st.era === 'mughal' || st.era === 'transition') frame = mughalFrame(st);
    else if (st.era === 'british') frame = britishFrame(st);
    else                           frame = freedomFrame(st);
    grp.add(frame.grp);

    // symbolic prop beside the frame
    if (st.prop === 'crownArch'){
      const ca = buildCrownArch(st.accent);
      ca.position.set(sideSign * -2.1, 0, .55);  // beside the frame — never before the picture
      ca.rotation.y = sideSign * .4;
      grp.add(ca);
      EXPLORABLES.push({ root: ca, name: EXPLORE_INFO.crownArch[0], blurb: EXPLORE_INFO.crownArch[1] });
    }
    else if (st.prop !== 'none' && st.prop !== 'finale' && PROPS[st.prop]){
      const prop = PROPS[st.prop](st.accent);
      // beside the frame, never toward the path — a prop standing between
      // the walker's eye and the floor plate covers the year text
      const wide = st.prop === 'hillfort' || st.prop === 'rail' || st.prop === 'ship';
      prop.position.set(sideSign * (wide ? -3.6 : -2.7), 0, .1);
      prop.rotation.y = sideSign * .5;
      grp.add(prop);
      const info = EXPLORE_INFO[st.prop];
      if (info) EXPLORABLES.push({ root: prop, name: info[0], blurb: info[1] });
    }

    // floor-inlaid glowing year plate
    const plate = yearPlate(st);
    // inlaid well inside the walkway — the edge zone belongs to parapets
    // and wayside furniture, which kept eclipsing the text at glancing
    // angles on the curve; nothing is ever built on the walk itself
    plate.position.copy(P).addScaledVector(S, sideSign * 1.35);
    plate.position.y = .03;
    plate.rotation.z = Math.atan2(T.x, T.z) + Math.PI;   // text top away from the walker → readable
    scene.add(plate);

    // finale card anchors near the year plate (the flag itself stays scenic, ahead)
    const anchor = st.prop === 'finale'
      ? P.clone().addScaledVector(S, sideSign * 3)
      : grp.position.clone();
    anchor.y = st.prop === 'finale' ? 3.2 : frame.anchorY;
    // GALLERY PAUSE data: where the visitor stands and what they face
    const viewPos = st.prop === 'finale' ? null
      : P.clone().addScaledVector(S, sideSign * 1.3).setY(1.7);
    // On mobile the card is a bottom sheet, so aim a little lower and the
    // picture rides higher in frame, clear of it.
    const lookPos = st.prop === 'finale' ? null
      : grp.position.clone().setY(MOBILE ? 1.25 : 2.0);
    stations.push({ st, i, s, pos: grp.position.clone(), anchor, sideSign, grp, viewPos, lookPos,
                    artSlots: frame.art ? [frame.art] : [] });
  });

  // The monuments below are keyed to stations of the Record (1526–1947);
  // in the documented corridor those ids are absent and each is skipped.
  const idxOf = id => TIMELINE.findIndex(t => t.id === id);

  // Taj Mahal centrepiece opposite Shah Jahan's station
  const tajIdx = idxOf('shahjahan-1628');
  if (tajIdx >= 0){
    const tajS = STATION_S[tajIdx], tajSide = TIMELINE[tajIdx].side === 'left' ? -1 : 1; // opposite side
    const taj = buildTaj();
    const TP = pointAt(tajS + 4, new THREE.Vector3()), TS = sideAt(tajS + 4, new THREE.Vector3());
    taj.position.copy(TP).addScaledVector(TS, tajSide * 12);
    taj.lookAt(TP.x, 0, TP.z);
    taj.scale.setScalar(1.8);
    scene.add(taj);
    EXPLORABLES.push({ root: taj, name: 'The Taj Mahal',
      blurb: 'Built 1632–1653 for Mumtaz Mahal by some twenty thousand artisans — the marble height of the empire.' });
  }

  // small EIC ship in the background near Jahangir (foreshadowing Thomas Roe, 1615)
  const jIdx = idxOf('jahangir-1605');
  if (jIdx >= 0){
    const ship = PROPS.ship(0.9);
    const JP = pointAt(STATION_S[jIdx] + 6, new THREE.Vector3()), JS = sideAt(STATION_S[jIdx], new THREE.Vector3());
    ship.position.copy(JP).addScaledVector(JS, (TIMELINE[jIdx].side==='left'?-1:1) * 11);
    ship.rotation.y = 1.1;
    scene.add(ship);
    EXPLORABLES.push({ root: ship, name: 'An English Ship on the Horizon',
      blurb: 'Sir Thomas Roe reached Jahangir’s court in 1615 asking leave to trade — the empire barely noticed.' });
  }

  // Rani Lakshmibai statue guarding the approach to 1857
  const rIdx = idxOf('revolt-1857');
  if (rIdx >= 0){
    const statue = buildJhansiStatue();
    const RP = pointAt(STATION_S[rIdx] - 3, new THREE.Vector3());
    const RSd = sideAt(STATION_S[rIdx] - 3, new THREE.Vector3());
    statue.position.copy(RP).addScaledVector(RSd, (TIMELINE[rIdx].side === 'left' ? -1 : 1) * 10.5);
    statue.lookAt(RP.x, 0, RP.z);
    scene.add(statue);
    EXPLORABLES.push({ root: statue, name: 'Rani Lakshmibai of Jhansi',
      blurb: '“Meri Jhansi nahi doongi.” She fell at Gwalior in June 1858, sword in hand, twenty-nine years old.' });
  }

  // Maratha hill forts: over Shivaji's coronation, and again at the
  // Anglo-Maratha wars — the same swarajya, three generations on
  [['shivaji-1674', 6, 20, 1.15, 'Raigad',
      'Shivaji’s capital in the Sahyadris — crowned Chhatrapati here in 1674, six hundred metres above the Konkan.'],
   ['maratha-1775', 3, 17, .9, 'A Maratha Gadhi',
      'The hill forts held out for three more generations — the Company took them wall by wall, never all at once.']]
  .forEach(([id, ds, dist, sc, name, blurb], fi) => {
    const i = idxOf(id); if (i < 0) return;
    const fort = buildMarathaFort(fi);
    const FP2 = pointAt(STATION_S[i] + ds, new THREE.Vector3());
    const FS2 = sideAt(STATION_S[i] + ds, new THREE.Vector3());
    fort.position.copy(FP2).addScaledVector(FS2, (TIMELINE[i].side === 'left' ? -1 : 1) * dist);
    fort.lookAt(FP2.x, 0, FP2.z);
    fort.scale.setScalar(sc);
    scene.add(fort);
    EXPLORABLES.push({ root: fort, name, blurb });
  });

  // era landmarks: monument, station id, s offset, side (+1 = opposite
  // the station, -1 = same side), distance from the path, scale
  [[buildHumayunTomb, 'humayun-return-1555', 2, +1, 12,  1.15, 'Humayun’s Tomb',
      'Commissioned by Bega Begum in 1565 — the first great Mughal garden-tomb, and the Taj Mahal’s ancestor.'],
   [buildLahoriGate,  'shahjahan-1628',     -6, -1, 12.5, 1.2, 'Lahori Gate, Red Fort',
      'The gate of Shah Jahan’s new capital — where, three centuries later, free India would raise its flag every 15 August.'],
   [buildIndiaGate,   'wwi-1914',            2, +1, 11,  1.05, 'India Gate',
      'The All-India War Memorial: over 13,000 names of the dead of the Great War carved into its stone.']]
  .forEach(([make, id, ds, rel, dist, sc, name, blurb]) => {
    const i = idxOf(id); if (i < 0) return;
    const m = make();
    const MP = pointAt(STATION_S[i] + ds, new THREE.Vector3());
    const MS = sideAt(STATION_S[i] + ds, new THREE.Vector3());
    const stationSign = TIMELINE[i].side === 'left' ? 1 : -1;
    m.position.copy(MP).addScaledVector(MS, stationSign * -rel * dist);
    m.lookAt(MP.x, 0, MP.z);
    m.scale.setScalar(sc);
    scene.add(m);
    EXPLORABLES.push({ root: m, name, blurb });
  });
}

  return { stations, buildStations, ensureArt, releaseArt, ART_PICKS, EXPLORABLES,
           get crownFx(){ return crownFx; },
           get flagUniforms(){ return flagUniforms; },
           get finaleFx(){ return finaleFx; } };
}

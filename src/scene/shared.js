// Shared context: flags, walk state, the path, materials, small helpers.
import * as THREE from 'three';

export const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
export const MOBILE  = matchMedia('(pointer: coarse)').matches || innerWidth < 768;
export const WALK_W  = MOBILE ? 5.5 : 7;
export const smooth  = t => t*t*(3-2*t);

/* live walk state, shared by the engine, scene modules, and UI bridge */
export const state = {
  target: 0, progress: 0, started: false, intro: 1,
  mouseX: 0, mouseY: 0, time: 0,
  focusIdx: -1, focusStn: null, focusT: 0, galleryG: 0,
  finaleW: 0,
  exploreT: 0,                  // click-to-explore blend (0 = walking)
};

/* ---- the S-curved walkway path (CatmullRomCurve3, arc-length param) ---- */
const ctrl = [];
for (let j = 0; j <= 17; j++) ctrl.push(new THREE.Vector3(8*Math.sin(j*0.7), 0, -j*40));
export const path = new THREE.CatmullRomCurve3(ctrl, false, 'catmullrom', 0.5);
export const PATHLEN = path.getLength();
const sToU = s => Math.min(s / PATHLEN, 1);
export const _p = new THREE.Vector3(), _t = new THREE.Vector3(), _side = new THREE.Vector3();
export const UP = new THREE.Vector3(0,1,0);
export function pointAt(s, out){ return (out||_p).copy(path.getPointAt(sToU(s))); }
export function tangentAt(s, out){ return (out||_t).copy(path.getTangentAt(sToU(s))).setY(0).normalize(); }
export function sideAt(s, out){ tangentAt(s, _t); return (out||_side).crossVectors(UP, _t).normalize(); }
export const FLAG_POS = new THREE.Vector3();   // set when the finale is built

export function canvasTexture(w, h, draw){
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
  draw(cv.getContext('2d'), w, h);
  const tx = new THREE.CanvasTexture(cv);
  tx.colorSpace = THREE.SRGBColorSpace;
  tx.anisotropy = 4;
  return tx;
}

/* ---- shared materials ---- */
const MAT = {
  sandstone: new THREE.MeshStandardMaterial({ color:'#c89b62', roughness:.9 }),
  sandDark:  new THREE.MeshStandardMaterial({ color:'#8C5A2B', roughness:.9 }),
  cracked:   new THREE.MeshStandardMaterial({ color:'#93826b', roughness:.95 }),
  colonial:  new THREE.MeshStandardMaterial({ color:'#b9c0c6', roughness:.8 }),
  slate:     new THREE.MeshStandardMaterial({ color:'#5A6B7A', roughness:.85 }),
  brick:     new THREE.MeshStandardMaterial({ color:'#7A3B2E', roughness:.9 }),
  iron:      new THREE.MeshStandardMaterial({ color:'#2e3338', roughness:.6, metalness:.6 }),
  gold:      new THREE.MeshStandardMaterial({ color:'#c9a13b', roughness:.35, metalness:.85 }),
  marble:    new THREE.MeshStandardMaterial({ color:'#f3efe6', roughness:.55 }),
  wood:      new THREE.MeshStandardMaterial({ color:'#5d4123', roughness:.9 }),
  darkWood:  new THREE.MeshStandardMaterial({ color:'#3a2a17', roughness:.9 }),
  white:     new THREE.MeshStandardMaterial({ color:'#e9e7e0', roughness:.7 }),
  charcoal:  new THREE.MeshStandardMaterial({ color:'#17110d', roughness:.95 }),
  green:     new THREE.MeshStandardMaterial({ color:'#1d4a2a', roughness:.9 }),
  panel:     new THREE.MeshStandardMaterial({ color:'#241b12', roughness:.85 }),
};
export { MAT };

/* ---- cusped (scalloped, pointed) arch profile for Mughal gates ---- */
function cuspedArchHole(halfW, springY, rise, cusps){
  const p = new THREE.Path();
  p.moveTo(-halfW, 0); p.lineTo(-halfW, springY);
  const N = 40;
  for (let i = 0; i <= N; i++){
    const th = Math.PI * (1 - i/N);
    const scallop = 1 + 0.05*Math.abs(Math.sin(cusps*th));
    const apex    = 1 + 0.28*Math.pow(Math.sin(th), 6);   // gives the pointed Indo-Islamic profile
    p.lineTo(Math.cos(th)*halfW*scallop, springY + Math.sin(th)*rise*scallop*apex);
  }
  p.lineTo(halfW, 0); p.closePath();
  return p;
}
function gateGeometry(outerHalfW, height, holeHalfW, springY, rise){
  const shape = new THREE.Shape();
  shape.moveTo(-outerHalfW, 0); shape.lineTo(-outerHalfW, height);
  shape.lineTo(outerHalfW, height); shape.lineTo(outerHalfW, 0); shape.closePath();
  shape.holes.push(cuspedArchHole(holeHalfW, springY, rise, 9));
  const g = new THREE.ExtrudeGeometry(shape, { depth:0.8, bevelEnabled:false });
  g.translate(0, 0, -0.4);
  return g;
}
export { cuspedArchHole, gateGeometry };

// Tiny external store: the engine writes low-frequency UI state here;
// React components subscribe via useStore(). High-frequency per-frame
// values (card transforms, progress fill) bypass this via bridge refs.
import { useSyncExternalStore } from 'react';

const listeners = new Set();
let snap = {
  load: { pct: 0, msg: 'Preparing…' },
  error: '',
  ready: false,
  started: false,
  zone: '',
  year: '',
  cardSlots: [],                 // station indices of the mounted card pool
  lightbox: null,                // station index or null
  timelineOpen: false,
  indexOpen: false,
  ledgerOpen: false,             // the 2014–present accountability record
  bhaktOpen: false,              // the "For Andhbhakts" satire page
  montage: { active: false, idx: 0 },
  explore: null,                 // { name, blurb } while circling a clicked element
  tourOn: false,
  audioOn: false,
  resume: null,                  // { s, idx } — saved position offer
  hashIdx: -1,                   // deep-linked station index
};

export const store = {
  get: () => snap,
  set: patch => { snap = { ...snap, ...patch }; listeners.forEach(l => l()); },
  subscribe: l => { listeners.add(l); return () => listeners.delete(l); },
};

export const useStore = () => useSyncExternalStore(store.subscribe, store.get);

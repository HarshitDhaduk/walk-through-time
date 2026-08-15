// Refs the engine mutates directly every frame (never through React):
// card article elements keyed by STATION index (stable across slot
// shuffles — this is what prevents flicker when the pool reassigns),
// the progress fill/thumb, and the scroll spacer.
export const uiRefs = {
  cardByStation: {},   // stationIdx -> <article> element
  fill: null,          // progress bar fill
  thumb: null,         // progress bar thumb
  spacer: null,        // the tall scroll-space div
};

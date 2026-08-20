# Walk Through Time

**A citizen's walk from 1526 to the present** — built for Independence Day.

Two sections, one site:

1. **The Walk (1526–1947)** — a scroll-driven 3D memorial walkway through the Mughal Empire,
   British rule and the freedom struggle: 45 stations, 42 public-domain photographs behind
   glass, monuments you can circle, a guided tour, and a finale at the tricolour at midnight.
2. **A Cockroach's Questions — The Republic's Ledger (2014–present)** — a documented record of
   the current era's major controversies, told only through what the official record says:
   CAG audits, Supreme Court judgments, regulatory filings, parliamentary answers — every claim
   linked to its source (91 verified links), allegations kept separate from findings.

> In the summer of 2026, India's students were called cockroaches — and marched under the
> name. This project is by one of them: a citizen of a democracy exercising the right that
> defines it, to question the government. The history is a tribute; the ledger is a set of
> questions. Both are built on documents you can read yourself.

The Ledger's data lives in [`src/data/ledger.js`](src/data/ledger.js). Corrections with
sources are welcome — open an issue with the document.

---

## The Walk: 1526–1947

A single-page, scroll-driven 3D walkway through the timeline of the Mughal Empire and
British rule in India — from the First Battle of Panipat (1526) to Independence (1947).

Scrolling walks the camera along an S-curved path past **45 milestone stations**, each with
a floor-inlaid year plate, an era-styled monument frame, a symbolic 3D prop, and an
information card that fades in as you approach. **42 of the stations hang a real historical
photograph or painting behind glass** in their frame — public-domain works from Wikimedia
Commons, vendored into `images/`. **Click a station's card** and the camera steps off the
path to stand before the picture, gallery-style — the card becomes a compact wall label with
a "View picture" lightbox for the full photograph. Click again, scroll on, or press Esc to
resume walking; the camera never turns on its own. The walkway itself is a
memorial promenade: inlaid stone with lotus-star medallions and border inlays, ending in a
marble plaza bearing the Ashoka Chakra beneath the 1947 tricolour. The environment changes
era by era: warm sandstone Mughal courtyards, a cracked and dimming transition corridor,
cool colonial columns and iron railings, a scorched red midpoint at 1857, quiet hushed
light at the sorrowful stations (Jallianwala Bagh, the famines, the Lahore martyrs), and a
bright plaza for 1947.

## Run it

This is a production-ready **React + Vite** project (`three` installed from npm — no CDNs,
works fully offline once installed):

```bash
npm install
npm run dev
```

then open <http://localhost:8321>. For production:

```bash
npm run build
```

which emits a static `dist/` (app ≈ 52 kB, react ≈ 45 kB, three ≈ 134 kB gzipped, split for
caching) deployable to any static host; `npm run preview` serves it locally on port 8322.

### Deploying

`dist/` is fully static and self-contained (no CDNs, no APIs) — upload it to any static
host: Netlify / Vercel (drag-and-drop or point at the repo with build command
`npm run build`, publish directory `dist`), GitHub Pages, Cloudflare Pages, or plain
nginx/S3. `base: './'` is already set in `vite.config.js`, so it works from a subpath too.

Two things to do before going live:

1. **Social cards** — in `index.html`, replace the two relative `og:image` /
   `twitter:image` values with the absolute `https://your-domain/images/independence-1947.jpg`
   URL; most scrapers ignore relative image paths.
2. **Cache headers** (optional but ideal) — everything under `assets/` is content-hashed
   and safe to serve with `Cache-Control: immutable`; serve `index.html` with `no-cache`.

### Project layout

- `src/data/` — the 45-station `TIMELINE` array and the `PHOTOS` manifest
- `src/art/` — procedural card vignettes (pure canvas)
- `src/scene/` — the 3D engine: `shared` (path, materials, state), `world` (era
  transitions, memorial floor, architecture, particles), `stations` (frames, glazed
  pictures, props, Taj, finale), `engine` (camera choreography, tour, orbit, input)
- `src/components/` — React UI: landing, HUD, cards, progress bar, index drawer,
  lightbox, montage, text timeline
- `legacy/index-singlefile.html` — the frozen pre-React single-file version

React owns every DOM surface (state via a small external store); the engine owns the
scene and writes per-frame values (card positions, progress fill) through refs, so
nothing re-renders at 60 fps.

## Controls

- **Scroll / swipe** — walk the path
- **Arrow keys, PageUp / PageDown** — walk via keyboard; **N / P** — next / previous station
- **Click a card or the framed picture itself** — glide up to it (a gentle ~1.7 s move);
  **click the picture again** for a full-screen lightbox; **Esc** or scrolling steps back
- **Click any monument or prop** — the camera steps off the path and slowly circles it
  (the Taj, the forts, the Jhansi statue, the cannon, the charkha… 51 elements), with a
  caption naming it and one line of its history; click again, click empty ground, press
  Esc, or scroll on to release
- **▶ Tour** (top right) — guided walk: steady museum pace, turning to face each picture
  before moving on; any scroll, key, or jump hands control back to you
- **The finale** — reaching the plaza, the camera leaves the path and slowly circles the
  tricolour while glimpses of every station play as a looping montage
- **☰ Index** (top left) — floor plan of all 45 stations, grouped by era; click to jump
- **Progress bar** — ‹ › station steppers plus clickable year markers
  (1526 · 1600 · 1707 · 1757 · 1857 · 1947)
- **Ambience toggle** (top right) — the walk's soundtrack: a local file from
  `public/audio/` if present, else the song's official YouTube embed in a small visible
  dock (see `public/audio/README.md`), else synthesized ambience. Looped on the free
  walk; the guided tour is paced to end exactly with the song. Off by default; no audio
  ships in the repo.

## Deep links & resume

The URL hash tracks the nearest station as you walk (`#plassey-1757`), so any moment of
the walk can be bookmarked or shared — opening such a link starts the walk right there.
Editing the hash while the page is open also walks to that station. Your position is
remembered locally; returning later offers a one-click "Resume at …" on the landing screen.

## Accessibility & performance

- `prefers-reduced-motion`: head-bob and parallax disabled, scrolling jumps instantly
- "Skip to text timeline" link reveals a plain HTML version of all 45 stations with the
  same card vignettes (also shown automatically if WebGL or the CDN is unavailable)
- All card text is real DOM for screen readers
- Mobile: narrower walkway, bottom-sheet cards, pixel ratio capped at 1.5, halved particles
- Instanced meshes for repeated arches/columns/railings; only the nearest 3 cards mounted
- Pictures load only as you approach a station and are released once well behind you, so
  roughly five full-size textures are resident at a time rather than all 42 (~12 MB of
  VRAM instead of ~130 MB). Every image is ≤900px; the whole set is 5 MB on disk.
- Cards never stack: if two would overlap on screen, the nearer station keeps its place

## Images

See [CREDITS.md](CREDITS.md) for the full list. All are public domain, downloaded rather
than hotlinked, with per-card attribution shown in the UI. Three stations intentionally
keep a drawn vignette instead of a photograph — the 1770 and 1943 Bengal famines and the
1853 railway; for the famines a bare drawn bowl is a more respectful choice than a
photograph of the dead. If an image file is ever missing, the card and the 3D frame both
fall back to the procedural vignette automatically.

## Editing the timeline

All 45 stations live in the `TIMELINE` array at the top of the `<script type="module">`
block in `index.html` (marked `1. DATA`). Stations are rendered purely by mapping over
this array — edit text, accents, sides, props, or the `art` vignette key there and reload.
Station spacing, era transitions, architecture ranges, and audio zones all derive from the
array automatically, so adding or removing stations needs no other changes.

# Soundtrack drop-in

**Default: the official YouTube embed.** With no files here, each walk plays its song
through the YouTube IFrame player (`src/audio/yt.js`) — "Tiranga" (*Yodha*) for the Record,
"Bol Ke Lab Azad Hain" (*Manto*) for the Pothole Yatra — streamed from YouTube with the
rights holders' monetization intact, in a small visible dock (required by YouTube's API
terms). Same trim/loop/tour behaviour as below.

**Override: local files.** A file in this folder always takes precedence over the embed.
The walks look for one audio file each (first extension found wins):

| Walk | File | Auto-trimmed |
|---|---|---|
| The Record · 1526–1947 | `freedom.mp3` / `.m4a` / `.ogg` / `.wav` | last **17 s** cut |
| Pothole Yatra · 2014–today | `yatra.mp3` / `.m4a` / `.ogg` / `.wav` | last **8 s** cut |

Behaviour (see `src/audio/track.js`):

- **Free walk** — the track repeats seamlessly, looping just before the trimmed tail.
- **Guided tour (▶ Tour)** — the track restarts from 0 and the tour's walking pace and
  dwell times are scaled so the tour reaches the plaza exactly as the song ends.
- **No file present** — the Ambience button falls back to the synthesized ambience.

**No audio ships in this repo.** The tracks intended for these slots are commercial
recordings ("Tiranga" — T-Series; "Bol Ke Lab Azad Hain" — Zee Music), which cannot be
redistributed here or served from the public site without a licence. Only place a file in
this folder if you hold the rights to distribute it (a licence, or a royalty-free /
Creative-Commons recording). Anything committed here goes to the public deployment.

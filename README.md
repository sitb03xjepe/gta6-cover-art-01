# gta6-cover-art-01

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/sitb03xjepe/gta6-cover-art-01/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/sitb03xjepe/gta6-cover-art-01/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

Palm Shores Cover Studio — a web app that turns any photo and a caption into GTA-style multi-panel cover art, with a Vice City sunset or neon colour grade, exported as a PNG to share. It runs entirely offline from static files: photos are read on your own machine and never uploaded.

## What it does

- **Any photo** — add your own photos (or try the two built-in samples), click one to fill the selected panel, and crop each panel with zoom, pan and flip.
- **Multi-panel posters** — four layouts: Classic five, Comic strip, Triple bill, and One big shot. Fill several panels with one photo or several.
- **Bold caption lettering** — editable title, subtitle and badge, five title colours, an accent colour, and a tilted poster title with outline and drop shadow.
- **Sunset or neon grade** — four colour grades (Vice sunset, Neon nights, Palm gold, Noir) plus sunburst rays, halftone dots, film grain and white gutters.
- **Fast and easy** — a live preview, then one click exports a PNG in the common post sizes: 1080 × 1080, 1080 × 1350, or 1920 × 1080.
- **Original art** — no Rockstar logo, artwork or font. Lettering is Noto Sans under the SIL Open Font License (see `app/fonts/OFL.txt`), and the two sample photos are original flat illustrations drawn for this entry.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080. Or serve `app/` with any static file server — the app makes no network requests.

## How it works

- `app/index.html` + `app/style.css` — the editor.
- `app/src/cover.js` — the render engine: panel layouts, cover-fit photo drawing, colour grades, sunburst / halftone / grain effects, and the caption lettering. Deterministic: the same state always exports the same PNG.
- `app/src/main.js` — the UI wiring: photo tray, panel cropping, caption editing, export.
- `app/fonts/` — Noto Sans (Black, Bold, Regular), SIL Open Font License.
- `app/samples/` — two original sample scenes (sunset boulevard, neon pier).
- `main.ts` — the entrypoint the grader runs: copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the vendored make.fun library.
- `screenshots/` — the cover and the editor at work.

---

<sub>Entered on [make.fun](https://make.fun/?ref=2bh747m8&utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01) · AI agents build software for cash rewards</sub>

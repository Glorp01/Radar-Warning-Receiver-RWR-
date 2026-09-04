# Radar-Warning-Receiver-RWR-

A browser-based simulator of the AN/ALR-67 radar warning receiver (RWR) found in the F/A-18 Hornet — the circular azimuth scope that shows threat radars by bearing, with search/track/launch audio tones.

No build step, no dependencies. Every symbol on the scope is drawn with the Canvas 2D API and every tone is synthesized with the Web Audio API — there are no image or audio asset files to source or license.

## Running it

Opening `index.html` directly (`file://`) can hit CORS/canvas quirks in some browsers, so serve the folder instead:

```bash
python -m http.server 8000
```

then open `http://localhost:8000`.

## Features

- **Circular azimuth scope** — range rings, degree ticks, ownship symbol at center, threats plotted by bearing (0° = nose, clockwise) and relative range.
- **Threat symbology** — numerals for SAM sites (SA-2/3/6/8/10/11/15), AAA, a wedge symbol for airborne intercept radars (MiG/Su), an underlined label for naval search radar, and a dashed circle for unknown emitters.
- **Threat states** — each contact cycles `search → track → launch → track → ...`; `track`/`launch` draw a lock ring around the symbol, new contacts and active launches blink.
- **Synthesized audio** — distinct search blip, faster track beep, and a fast-warbling launch tone per threat, panned left/right by bearing. Muted until the audio checkbox/volume slider is touched (browser autoplay policy).
- **Controls**:
  - `SYS TEST` — lights every symbol type at once, like the real display's self-test.
  - `DIM/BRT` — toggles scope brightness.
  - `PAUSE`/`RESUME` — freezes the simulation.
  - `AUDIO` checkbox + `VOL` slider.
  - Add a single threat of a chosen type, or `CLEAR` all.
  - Scenario presets (`Quiet Patrol`, `SAM Ambush`, `Strike Package`) to load a pre-built threat picture.

## File layout

```
index.html          page shell + control panel
css/style.css        cockpit/CRT styling
js/symbols.js        threat catalog (RWR.THREAT_TYPES) + glyph drawing
js/threats.js        threat object factory
js/audio.js          RWR.RwrAudio — Web Audio tone synthesis
js/display.js        RWR.Renderer — draws the scope every frame
js/simulation.js      RWR.Simulation — state machine + RWR.SCENARIOS presets
js/main.js           DOM wiring + animation loop
```

Everything hangs off one global `window.RWR` namespace, populated in file-load order — no bundler or `import`/`export`.

## Extending it

Some natural next steps:
- New threat types: add an entry to `RWR.THREAT_TYPES` in `js/symbols.js`.
- New scenarios: add an array to `RWR.SCENARIOS` in `js/simulation.js`.
- Threat priority: highlight or reorder the highest-lethality contact (see each type's `lethality` field).
- A real reference photo for the bezel: drop a public-domain image (e.g. official U.S. Navy/DoD imagery) into an `assets/` folder and reference it as a CSS background on `.bezel`.

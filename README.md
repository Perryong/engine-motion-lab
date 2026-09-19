# Engine Motion Lab

Complete source for the eight-engine interactive study collection.

## Engines
V8, turbofan, Wankel rotary, seven-cylinder radial, steam, Stirling,
permanent-magnet electric motor, and pressure-fed liquid rocket.

## Run locally
1. Extract this ZIP.
2. Open a terminal in the `engine-motion-lab` folder.
3. Start a local server:

```sh
python3 -m http.server 8000 --directory dist
```

On Windows, use `py -m http.server 8000 --directory dist` if needed.
Open http://localhost:8000 in a WebGL-capable browser.
Do not open index.html directly via file://; the application uses JavaScript modules.
No npm installation, build step, API keys, or backend is required.

## Source layout
- dist/index.html, lab.js, lab.css: shared eight-tab page and study switching.
- dist/v8/: original V8 model, controls, and styling.
- dist/turbofan.html, app.js, model.js, style.css: turbofan study.
- dist/study.html, study.js, study.css: common viewer for six additional engines.
- dist/engines/: one model module per additional engine.
- dist/vendor/: included Three.js 0.170.0, OrbitControls, and license notice.
- tests/verify-models.mjs: model validation checks.

## Controls
Drag to orbit; scroll or pinch to zoom. Select component buttons to inspect
parts. Each study includes play/pause, camera controls, cutaway and exploded
views. The six additional engines include cycle-angle scrubbing. Inactive
studies pause while preserving their state. Arrow keys switch focused tabs.

## Verify models
With Node.js installed, from the project folder:

```sh
node tests/verify-models.mjs
```

Checks cover finite geometry, cycle poses, pause/play, selection, radial rod
lengths, and Stirling cutaway clearance. These are not browser screenshot tests.

## Hosting
Serve the contents of dist/ from any static HTTP host, preserving folders and
relative paths. Google Fonts are optional; system font fallbacks are included.
All model code and Three.js dependencies are included locally.

## Limitations
Educational models with simplified geometry, timing, thermal effects, magnetic
fields and flow. No calibrated pressure, torque, efficiency or thrust prediction.
Live browser rendering was not verified in the creation environment.

## Third-party code
Three.js and OrbitControls are distributed under the MIT license.
See dist/vendor/THREE-LICENSE.txt for the included license.

## Export
Source revision: 9fa9c9af90df07501790ae1ac90b5123d862ebe4

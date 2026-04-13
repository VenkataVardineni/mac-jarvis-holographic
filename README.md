# Mac Jarvis — Holographic spatial UI

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Three.js](https://img.shields.io/badge/Three.js-black?logo=threedotjs&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green)
[![CI](https://github.com/VenkataVardineni/mac-jarvis-holographic/actions/workflows/ci.yml/badge.svg)](https://github.com/VenkataVardineni/mac-jarvis-holographic/actions/workflows/ci.yml)

Browser-based **“holographic”** workspace built with **React**, **Three.js**, **React Three Fiber**, and **MediaPipe Hand Landmarker**. You control a **wireframe-style** 3D assembly with **fists** while the model stays **locked to the camera viewport** (OrbitControls still moves the world; the hologram rides with the view).

## Features

- **Two-hand fist tracking** with cyan / pink markers (left / right when MediaPipe labels hands; fallback by detection slot).
- **One closed fist**: move the assembly (delta projected on camera right / up / forward).
- **Two closed fists**: zoom by changing the distance between palms.
- **GLB / GLTF** hologram loader (Draco + Meshopt) plus built-in procedural blueprints (`car`, `truck`, `robot`, `plane`, `engine` — see `CATALOG_PRIMARY_IDS` in `objectCatalog.ts`).
- **Zustand** for hand + assembly state; hidden webcam for vision only.

## Requirements

- **Node.js 20+** (LTS recommended)
- **HTTPS or localhost** for camera access
- A **GPU** helps MediaPipe WASM; CPU delegate is used as fallback

## Scripts

| Command        | Description                          |
| -------------- | ------------------------------------ |
| `npm install`  | Install dependencies                 |
| `npm run dev`  | Vite dev server (with network host)  |
| `npm run build`| Typecheck + production build         |
| `npm run preview` | Serve `dist/`                     |
| `npm run lint` | ESLint                               |
| `npm run typecheck` | `tsc -b` only (no emit)        |
| `npm run test` | Vitest unit tests (single run)      |
| `npm run test:watch` | Vitest watch mode           |

More detail: [docs/TESTING.md](./docs/TESTING.md).

## Quick start

```bash
npm install
npm run dev
```

Open the printed URL, allow **camera**, type `car` and **Load**, or load a `.glb` from `public/models/` via `/models/yourfile.glb`.

### Optional local models

Place files under `public/models/`. Large `.glb` files are **gitignored** by default; keep them on your machine or use Git LFS if you need them in a remote repo.

## Project layout

```
src/
  components/   # R3F scene, vision driver, UI bar, GLTF hologram
  data/           # Procedural part defs + object catalog
  hooks/          # (reserved)
  lib/            # Coords, gestures, fist detection, vision URLs
  stores/         # Zustand spatial store
public/
  models/         # Your .glb assets (not committed if large)
```

## Architecture (short)

- **Canvas** (`SpatialScene`): `PerspectiveCamera`, `OrbitControls`, `HandVisionDriver` (MediaPipe on `<video>`), `CameraAttachedRig` parents the pick/model group to the **camera** so content stays screen-stable.
- **Hands → store**: `HandVisionDriver` runs `detectForVideo` once per new video frame with monotonic timestamps; `HandInteraction` reads `assemblyPosition`, `assemblyRotation`, `assemblyScale` from Zustand.
- **Fists**: `lib/handGestureDetect.ts` uses 2D landmark distances + curl heuristics; markers in `FistMarkers.tsx`.

## Troubleshooting

| Issue | What to try |
| ----- | ----------- |
| Camera blocked | Use **localhost** or **HTTPS**; check browser site permissions. |
| No hand / no dots | Lighting and contrast; keep hands in frame; try slower movement. |
| MediaPipe timestamp errors | App gates inference to `video.currentTime` changes and monotonic `performance.now()`. Hard-refresh if WASM graph desyncs. |
| Black or missing GLB | Use valid `.glb` / `.gltf`; for skinned cars the loader keeps the whole scene (see `GltfHologram.tsx`). |
| Dots wrong left/right | Mirror selfie view can swap MediaPipe handedness; colors are best-effort with slot fallback. |

## License

MIT — see [LICENSE](./LICENSE).

## Continuous integration

GitHub Actions runs `npm ci`, `npm run lint`, and `npm run build` on push and pull requests (see `.github/workflows/ci.yml`).

## Repository

```bash
git clone https://github.com/VenkataVardineni/mac-jarvis-holographic.git
cd mac-jarvis-holographic
```

If the history looks short in your Git UI, confirm locally:

```bash
git log --oneline | wc -l
git fetch origin
```

This repo keeps **incremental commits** on `main` (no squash-only workflow required to see them).

## Browser support

Use a current **Chrome**, **Edge**, or **Firefox** with WebGL2 and `getUserMedia`. Safari often works on recent versions; test camera permissions on real devices.

## Environment variables

There are no required env vars today. See [`.env.example`](./.env.example) for reserved Vite-style placeholders if you extend the app.

## Development

```bash
npm install
npm run dev
```

In another terminal you can run `npm run lint` or `npm run typecheck` while iterating.

## Acknowledgements

- [Three.js](https://threejs.org/) and [React Three Fiber](https://docs.pmnd.rs/react-three-fiber/) for rendering.
- [MediaPipe](https://developers.google.com/mediapipe) Hand Landmarker for in-browser tracking.

### Keeping large models private

`.glb` / `.gltf` files under `public/models/` are ignored by Git by default so clones stay small. Share assets via your own storage, Git LFS, or release attachments—not required for the app to run (built-in blueprints still work).

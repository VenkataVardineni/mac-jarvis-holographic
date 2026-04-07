#!/usr/bin/env bash
# Creates 36 incremental commits (run once in a fresh `git init`).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ -d .git ]]; then
  echo "Remove existing .git first if you want a clean history." >&2
  exit 1
fi

git init -b main
git config user.email "dev@local"
git config user.name "Mac Jarvis"

c() {
  git add "$@"
  git commit -m "$MSG"
}

MSG='chore(git): ignore Node, Vite, caches, editor files, and large GLB assets'
c .gitignore

MSG='chore: add npm package manifest and lockfile'
c package.json package-lock.json

MSG='chore(ts): add TypeScript project configs'
c tsconfig.json tsconfig.app.json tsconfig.node.json

MSG='chore(build): configure Vite dev server and ESLint flat config'
c vite.config.ts eslint.config.js

MSG='chore(html): add SPA shell and document title'
c index.html

MSG='chore(assets): add public SVG favicon and icons'
c public/favicon.svg public/icons.svg

MSG='feat(ui): mount React root with global styles'
c src/main.tsx src/index.css src/App.tsx

MSG='feat(lib): map MediaPipe normalized coords to Three.js focus plane'
c src/lib/coords.ts

MSG='feat(lib): pinch distance helpers for gesture math'
c src/lib/gestures.ts

MSG='feat(lib): 2D curl-based fist detection for hand landmarks'
c src/lib/handGestureDetect.ts

MSG='feat(lib): centralize MediaPipe WASM CDN and landmarker model URL'
c src/lib/visionConstants.ts

MSG='feat(lib): camera-attached rig default offset constants'
c src/lib/sceneConstants.ts

MSG='feat(lib): resolve Left/Right hand frames from store slots'
c src/lib/handLabels.ts

MSG='feat(state): Zustand store for hands, assembly pose, and blueprints'
c src/stores/spatialStore.ts

MSG='feat(data): procedural hologram part geometry definitions'
c src/data/volumeParts.ts

MSG='feat(data): named object catalog and blueprint resolver'
c src/data/objectCatalog.ts

MSG='feat(scene): parent hologram content to camera for screen-locked viewport'
c src/components/CameraAttachedRig.tsx

MSG='feat(vision): HandLandmarker loop with video-frame gating and timestamps'
c src/components/HandVisionDriver.tsx

MSG='feat(ui): left/right fist markers with Unknown-hand fallback'
c src/components/FistMarkers.tsx

MSG='feat(input): fist move and two-fist zoom in camera space'
c src/components/HandInteraction.tsx

MSG='feat(scene): R3F canvas, orbit controls, and model routing'
c src/components/SpatialScene.tsx

MSG='feat(models): GLTF hologram wireframe, skinned mesh path, scene pick'
c src/components/GltfHologram.tsx

MSG='feat(models): procedural rounded-box hologram parts with outlines'
c src/components/HolographicVolume.tsx

MSG='feat(fx): optional bloom postprocessing module for catalog mode'
c src/components/HolographicPostFX.tsx

MSG='feat(ui): command bar for catalog names and GLB file pick'
c src/components/ObjectCommandBar.tsx

MSG='docs: add project README with features, scripts, and layout'
c README.md

MSG='chore(license): add MIT license text'
c LICENSE

MSG='docs: add changelog for 0.1.0'
c CHANGELOG.md

MSG='chore: add env example placeholder for future Vite keys'
c .env.example

MSG='chore: keep empty models directory for local GLB drop-in'
c public/models/.gitkeep

MSG='docs: add contributing guidelines'
c CONTRIBUTING.md

MSG='chore: add EditorConfig for consistent formatting'
c .editorconfig

MSG='docs: add security expectations for in-browser vision'
c SECURITY.md

MSG='chore: pin Node 20 via nvmrc'
c .nvmrc

MSG='ci: add GitHub Actions workflow for lint and build'
c .github/workflows/ci.yml

# Final commit: npm repository field + README CI blurb
cat >> README.md << 'EOF'

## Continuous integration

GitHub Actions runs `npm ci`, `npm run lint`, and `npm run build` on push and pull requests (see `.github/workflows/ci.yml`).
EOF

node -e "
const fs=require('fs');
const p='package.json';
const j=JSON.parse(fs.readFileSync(p,'utf8'));
j.repository={type:'git',url:'https://github.com/YOUR_USERNAME/YOUR_REPO.git'};
fs.writeFileSync(p, JSON.stringify(j,null,2)+'\n');
"

MSG='chore: document CI in README and add npm repository metadata'
c README.md package.json

git log --oneline | wc -l

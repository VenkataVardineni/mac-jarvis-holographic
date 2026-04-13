# Testing

Unit tests use [Vitest](https://vitest.dev/) in Node (no browser harness).

```bash
npm run test        # CI-style single run
npm run test:watch  # local TDD loop
```

Tests live next to sources as `*.test.ts`. Pure helpers (gestures, catalog resolution, URL heuristics) are covered first; WebGL and MediaPipe paths remain manual / integration-only.

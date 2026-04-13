# Security

This project runs entirely in the browser. The webcam stream is used **only** for on-device hand landmark inference (MediaPipe WASM + optional GPU). Video is not uploaded by this app.

Users must grant **camera** permission in the browser; denied or blocked permissions surface an in-app message only—no footage leaves the device.

Report sensitive issues privately to the repository maintainer.

## Dependencies

Review `package-lock.json` changes in pull requests. CI uses `npm ci` for reproducible installs.

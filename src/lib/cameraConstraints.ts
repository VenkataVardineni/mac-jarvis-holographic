/** Ideal constraints passed to getUserMedia for the vision pipeline. */
export const WEBCAM_VIDEO_CONSTRAINTS: MediaTrackConstraints = {
  facingMode: 'user',
  width: { ideal: 1280 },
  height: { ideal: 720 },
}

/** Native resolution hints on the hidden <video> element. */
export const VISION_VIDEO_NATIVE = { width: 1280, height: 720 } as const

/** Layout size for the off-screen preview (CSS pixels). */
export const VISION_VIDEO_LAYOUT = { width: 640, height: 480 } as const

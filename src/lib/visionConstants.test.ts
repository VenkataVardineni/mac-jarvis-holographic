import { describe, expect, it } from 'vitest'
import { HAND_LANDMARKER_MODEL_URL, MEDIAPIPE_WASM_CDN } from './visionConstants'

describe('visionConstants', () => {
  it('points at https MediaPipe assets', () => {
    expect(MEDIAPIPE_WASM_CDN).toMatch(/^https:\/\//)
    expect(HAND_LANDMARKER_MODEL_URL).toMatch(/^https:\/\//)
  })
})

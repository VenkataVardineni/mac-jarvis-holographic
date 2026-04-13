import { describe, expect, it } from 'vitest'
import {
  VISION_VIDEO_LAYOUT,
  VISION_VIDEO_NATIVE,
  WEBCAM_VIDEO_CONSTRAINTS,
} from './cameraConstraints'

describe('cameraConstraints', () => {
  it('requests user-facing video', () => {
    expect(WEBCAM_VIDEO_CONSTRAINTS.facingMode).toBe('user')
  })

  it('uses a compact hidden preview layout', () => {
    expect(VISION_VIDEO_LAYOUT.width).toBe(640)
    expect(VISION_VIDEO_LAYOUT.height).toBe(480)
  })

  it('matches native hint dimensions', () => {
    expect(VISION_VIDEO_NATIVE.width).toBe(1280)
    expect(VISION_VIDEO_NATIVE.height).toBe(720)
  })
})

import { describe, expect, it } from 'vitest'
import {
  SCENE_CAMERA_FAR,
  SCENE_CAMERA_FOV,
  SCENE_CAMERA_NEAR,
} from './sceneCameraConstants'

describe('sceneCameraConstants', () => {
  it('matches SpatialScene defaults', () => {
    expect(SCENE_CAMERA_FOV).toBe(50)
    expect(SCENE_CAMERA_NEAR).toBe(0.1)
    expect(SCENE_CAMERA_FAR).toBe(80)
  })
})

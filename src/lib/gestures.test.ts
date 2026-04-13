import { describe, expect, it } from 'vitest'
import * as THREE from 'three'
import {
  pinchDistanceNorm,
  pinchGestureHysteresis,
  pinchMidpoint,
  velocityOnPinchRelease,
} from './gestures'

describe('pinchDistanceNorm', () => {
  it('returns Euclidean distance in normalized space', () => {
    expect(pinchDistanceNorm({ x: 0, y: 0, z: 0 }, { x: 1, y: 0, z: 0 })).toBe(1)
    expect(pinchDistanceNorm({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 0 })).toBe(0)
  })
})

describe('pinchGestureHysteresis', () => {
  it('uses separate enter and exit thresholds', () => {
    const mid = 0.08
    expect(pinchGestureHysteresis(false, { x: 0, y: 0, z: 0 }, { x: mid, y: 0, z: 0 })).toBe(false)
    expect(pinchGestureHysteresis(true, { x: 0, y: 0, z: 0 }, { x: mid, y: 0, z: 0 })).toBe(true)
  })
})

describe('pinchMidpoint', () => {
  it('writes the average into out', () => {
    const out = { x: 0, y: 0, z: 0 }
    pinchMidpoint({ x: 0, y: 2, z: 4 }, { x: 2, y: 0, z: 0 }, out)
    expect(out).toEqual({ x: 1, y: 1, z: 2 })
  })
})

describe('velocityOnPinchRelease', () => {
  it('returns a clone when releasing a fast pinch', () => {
    const v = new THREE.Vector3(5, 0, 0)
    const out = velocityOnPinchRelease(true, false, v)
    expect(out).not.toBeNull()
    expect(out!.x).toBe(5)
  })

  it('returns null when still pinching', () => {
    const v = new THREE.Vector3(5, 0, 0)
    expect(velocityOnPinchRelease(true, true, v)).toBeNull()
  })
})

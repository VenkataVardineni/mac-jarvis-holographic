import * as THREE from 'three'

/** Hysteresis: avoids pinch flicker when fingertip distance hovers near the threshold. */
const PINCH_START = 0.062
const PINCH_END = 0.095

export function pinchDistanceNorm(
  a: { x: number; y: number; z: number },
  b: { x: number; y: number; z: number }
): number {
  const dx = a.x - b.x
  const dy = a.y - b.y
  const dz = a.z - b.z
  return Math.sqrt(dx * dx + dy * dy + dz * dz)
}

export function isPinchGesture(
  indexTip: { x: number; y: number; z: number },
  thumbTip: { x: number; y: number; z: number }
): boolean {
  return pinchDistanceNorm(indexTip, thumbTip) < PINCH_START
}

/** Call each frame with previous pinch state for stable on/off. */
export function pinchGestureHysteresis(
  wasPinching: boolean,
  indexTip: { x: number; y: number; z: number },
  thumbTip: { x: number; y: number; z: number }
): boolean {
  const d = pinchDistanceNorm(indexTip, thumbTip)
  if (wasPinching) return d < PINCH_END
  return d < PINCH_START
}

export function pinchMidpoint(
  indexTip: { x: number; y: number; z: number },
  thumbTip: { x: number; y: number; z: number },
  out: { x: number; y: number; z: number }
): void {
  out.x = (indexTip.x + thumbTip.x) * 0.5
  out.y = (indexTip.y + thumbTip.y) * 0.5
  out.z = (indexTip.z + thumbTip.z) * 0.5
}

const THROW_SPEED = 2.8

/** On pinch release, return launch velocity if the hand was moving fast enough. */
export function velocityOnPinchRelease(
  wasPinching: boolean,
  nowPinching: boolean,
  velocity: THREE.Vector3
): THREE.Vector3 | null {
  if (wasPinching && !nowPinching && velocity.length() > THROW_SPEED) {
    return velocity.clone()
  }
  return null
}

import { describe, expect, it } from 'vitest'
import * as THREE from 'three'
import type { HandFrame } from '../stores/spatialStore'
import { handByLabel } from './handLabels'

function frame(label: HandFrame['label']): HandFrame {
  return {
    wrist: { x: 0, y: 0, z: 0 },
    isFist: false,
    palmWorld: new THREE.Vector3(),
    velocity: new THREE.Vector3(),
    label,
  }
}

describe('handByLabel', () => {
  it('returns the hand matching the label', () => {
    const left = frame('Left')
    const right = frame('Right')
    expect(handByLabel([left, right], 'Left')).toBe(left)
    expect(handByLabel([left, right], 'Right')).toBe(right)
  })

  it('returns null when no labeled match', () => {
    const u = frame('Unknown')
    expect(handByLabel([u, null], 'Left')).toBeNull()
  })
})

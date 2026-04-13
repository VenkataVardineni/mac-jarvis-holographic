import { describe, expect, it } from 'vitest'
import {
  ASSEMBLY_ZOOM_MAX,
  ASSEMBLY_ZOOM_MIN,
  TWO_FIST_DEFAULT_REF_DIST,
  TWO_FIST_MIN_START_DIST,
} from './handInteractionConstants'

describe('handInteractionConstants', () => {
  it('keeps zoom within a sane range', () => {
    expect(ASSEMBLY_ZOOM_MIN).toBeLessThan(ASSEMBLY_ZOOM_MAX)
  })

  it('uses stable two-fist defaults', () => {
    expect(TWO_FIST_MIN_START_DIST).toBe(0.06)
    expect(TWO_FIST_DEFAULT_REF_DIST).toBe(0.12)
  })
})

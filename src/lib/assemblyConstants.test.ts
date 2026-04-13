import { describe, expect, it } from 'vitest'
import { DEFAULT_ASSEMBLY_SCALE } from './assemblyConstants'

describe('assemblyConstants', () => {
  it('uses unity default scale', () => {
    expect(DEFAULT_ASSEMBLY_SCALE).toBe(1)
  })
})

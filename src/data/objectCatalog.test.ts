import { describe, expect, it } from 'vitest'
import { CATALOG_PRIMARY_IDS, resolveBlueprintName } from './objectCatalog'

describe('resolveBlueprintName', () => {
  it('resolves primary catalog ids', () => {
    for (const id of CATALOG_PRIMARY_IDS) {
      const r = resolveBlueprintName(id)
      expect(r).not.toBeNull()
      expect(r!.id).toBe(id)
      expect(r!.parts.length).toBeGreaterThan(0)
    }
  })

  it('resolves aliases', () => {
    expect(resolveBlueprintName('automobile')?.id).toBe('car')
    expect(resolveBlueprintName('pickup')?.id).toBe('truck')
  })

  it('returns null for unknown input', () => {
    expect(resolveBlueprintName('')).toBeNull()
    expect(resolveBlueprintName('   ')).toBeNull()
    expect(resolveBlueprintName('not-a-real-thing')).toBeNull()
  })
})

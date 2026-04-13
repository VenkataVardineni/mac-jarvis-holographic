import { describe, expect, it } from 'vitest'
import { isLikelyHostedModelPath } from './modelUrl'

describe('isLikelyHostedModelPath', () => {
  it('accepts rooted and absolute URLs', () => {
    expect(isLikelyHostedModelPath('/models/x.glb')).toBe(true)
    expect(isLikelyHostedModelPath('https://cdn.example.com/m.gltf')).toBe(true)
  })

  it('rejects bare filenames and photos', () => {
    expect(isLikelyHostedModelPath('car.glb')).toBe(false)
    expect(isLikelyHostedModelPath('/models/x.jpg')).toBe(false)
    expect(isLikelyHostedModelPath('')).toBe(false)
  })
})

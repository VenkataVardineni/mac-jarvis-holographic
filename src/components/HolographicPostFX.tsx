import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'

/** Neon bloom + vignette for blueprint / hologram look (reference-style glow). */
export function HolographicPostFX() {
  return (
    <EffectComposer multisampling={8} enableNormalPass={false}>
      <Bloom
        luminanceThreshold={0.18}
        luminanceSmoothing={0.12}
        intensity={2.35}
        radius={0.65}
        mipmapBlur
        levels={8}
      />
      <Vignette offset={0.32} darkness={0.68} />
    </EffectComposer>
  )
}

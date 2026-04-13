/** True when `raw` looks like a rooted path or absolute URL to a GLB/GLTF asset. */
export function isLikelyHostedModelPath(raw: string): boolean {
  const t = raw.trim()
  return /\.(glb|gltf)$/i.test(t) && (t.startsWith('/') || /^https?:\/\//i.test(t))
}

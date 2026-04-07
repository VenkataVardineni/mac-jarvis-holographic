import type { NormalizedLandmark } from '@mediapipe/tasks-vision'

/** MediaPipe hand landmark indices */
export const LM_WRIST = 0
export const LM_THUMB_TIP = 4
export const LM_INDEX_MCP = 5
export const LM_INDEX_TIP = 8
export const LM_MIDDLE_MCP = 9
export const LM_MIDDLE_TIP = 12
export const LM_RING_MCP = 13
export const LM_RING_TIP = 16
export const LM_PINKY_MCP = 17
export const LM_PINKY_TIP = 20

/** Image-plane distance only — normalized `z` is noisy on webcam and breaks 3D thresholds. */
function dist2(a: NormalizedLandmark, b: NormalizedLandmark): number {
  const dx = a.x - b.x
  const dy = a.y - b.y
  return Math.hypot(dx, dy)
}

/**
 * Closed fist: most fingers curled (tip at least as close to wrist as the MCP, or loosely near wrist);
 * thumb tucked toward palm / index side.
 */
export function detectFist(lm: NormalizedLandmark[]): boolean {
  const w = lm[LM_WRIST]!

  const fingerChains: readonly [number, number][] = [
    [LM_INDEX_MCP, LM_INDEX_TIP],
    [LM_MIDDLE_MCP, LM_MIDDLE_TIP],
    [LM_RING_MCP, LM_RING_TIP],
    [LM_PINKY_MCP, LM_PINKY_TIP],
  ]

  let curledCount = 0
  for (const [mcpIdx, tipIdx] of fingerChains) {
    const mcp = lm[mcpIdx]!
    const tip = lm[tipIdx]!
    const dMcp = dist2(w, mcp)
    const dTip = dist2(w, tip)
    const curledGeometry = dTip < dMcp * 1.12
    const curledLoose = dTip < 0.38
    if (curledGeometry || curledLoose) curledCount++
  }

  const thumbTip = lm[LM_THUMB_TIP]!
  const indexMcp = lm[LM_INDEX_MCP]!
  const dThumbWrist = dist2(w, thumbTip)
  const thumbNearIndex = dist2(thumbTip, indexMcp) < 0.28
  const thumbNearWrist = dThumbWrist < 0.36
  const thumbTucked = thumbNearIndex || thumbNearWrist

  /** Primary: 3+ curled fingers + tucked thumb. Fallback: all 4 fingers curled, thumb merely close in 2D. */
  const strong = curledCount >= 3 && thumbTucked
  const loose = curledCount >= 4 && dThumbWrist < 0.44
  return strong || loose
}

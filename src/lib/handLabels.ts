import type { HandFrame } from '../stores/spatialStore'

export function handByLabel(
  hands: readonly [HandFrame | null, HandFrame | null],
  label: 'Left' | 'Right'
): HandFrame | null {
  const h0 = hands[0]
  const h1 = hands[1]
  if (h0?.label === label) return h0
  if (h1?.label === label) return h1
  return null
}

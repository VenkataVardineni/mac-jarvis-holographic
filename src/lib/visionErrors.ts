/** Map unknown camera / MediaStream failures to a short UI string. */
export function humanizeMediaStreamError(e: unknown): string {
  if (e instanceof Error) return e.message
  return 'Camera access is required for hand tracking.'
}

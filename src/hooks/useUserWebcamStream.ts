import { useEffect, useRef, useState } from 'react'
import { WEBCAM_VIDEO_CONSTRAINTS } from '../lib/cameraConstraints'
import { humanizeMediaStreamError } from '../lib/visionErrors'

/**
 * Acquires the user-facing webcam for MediaPipe and binds it to `videoRef`.
 * Stops tracks on unmount.
 */
export function useUserWebcamStream() {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const s = await navigator.mediaDevices.getUserMedia({
          video: WEBCAM_VIDEO_CONSTRAINTS,
          audio: false,
        })
        if (!active) {
          s.getTracks().forEach((t) => t.stop())
          return
        }
        setStream(s)
      } catch (e) {
        setError(humanizeMediaStreamError(e))
      }
    })()
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!stream) return
    const id = requestAnimationFrame(() => {
      const v = videoRef.current
      if (!v) return
      v.srcObject = stream
      void v.play().catch(() => {})
    })
    return () => cancelAnimationFrame(id)
  }, [stream])

  return { videoRef, error }
}

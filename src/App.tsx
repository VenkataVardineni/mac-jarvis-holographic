import { useEffect, useRef, useState } from 'react'
import { SpatialScene } from './components/SpatialScene'
import { ObjectCommandBar } from './components/ObjectCommandBar'
import {
  VISION_VIDEO_LAYOUT,
  VISION_VIDEO_NATIVE,
  WEBCAM_VIDEO_CONSTRAINTS,
} from './lib/cameraConstraints'

function App() {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [visionError, setVisionError] = useState<string | null>(null)

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
        setVisionError(
          e instanceof Error ? e.message : 'Camera access is required for hand tracking.'
        )
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

  return (
    <>
      <SpatialScene videoRef={videoRef} />
      <ObjectCommandBar />
      <video
        ref={videoRef}
        width={VISION_VIDEO_NATIVE.width}
        height={VISION_VIDEO_NATIVE.height}
        muted
        playsInline
        autoPlay
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          width: VISION_VIDEO_LAYOUT.width,
          height: VISION_VIDEO_LAYOUT.height,
          opacity: 0,
          pointerEvents: 'none',
          zIndex: -1,
        }}
      />
      {visionError && (
        <div
          style={{
            position: 'fixed',
            top: 12,
            left: '50%',
            transform: 'translateX(-50%)',
            maxWidth: 'min(480px, 92vw)',
            padding: '10px 14px',
            borderRadius: 8,
            color: '#ffb8d9',
            fontFamily: 'system-ui',
            fontSize: 13,
            textAlign: 'center',
            zIndex: 30,
            background: 'rgba(12, 6, 18, 0.92)',
            border: '1px solid rgba(255, 100, 160, 0.35)',
          }}
        >
          {visionError}
        </div>
      )}
    </>
  )
}

export default App

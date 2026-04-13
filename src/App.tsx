import { SpatialScene } from './components/SpatialScene'
import { ObjectCommandBar } from './components/ObjectCommandBar'
import { VisionErrorBanner } from './components/VisionErrorBanner'
import { useUserWebcamStream } from './hooks/useUserWebcamStream'
import {
  VISION_VIDEO_LAYOUT,
  VISION_VIDEO_NATIVE,
} from './lib/cameraConstraints'

function App() {
  const { videoRef, error } = useUserWebcamStream()

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
      {error && <VisionErrorBanner message={error} />}
    </>
  )
}

export default App

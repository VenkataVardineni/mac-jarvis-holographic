import { Suspense, useRef, type RefObject } from 'react'
import * as THREE from 'three'
import { Canvas } from '@react-three/fiber'
import { Html, OrbitControls, PerspectiveCamera, useProgress } from '@react-three/drei'
import { useSpatialStore } from '../stores/spatialStore'
import { GltfHologram } from './GltfHologram'
import { HolographicPart } from './HolographicVolume'
import { FistMarkers } from './FistMarkers'
import { HandInteraction } from './HandInteraction'
import { CameraAttachedRig } from './CameraAttachedRig'
import { HandVisionDriver } from './HandVisionDriver'

type Props = {
  videoRef: RefObject<HTMLVideoElement | null>
}

/** DOM via `Html` — drei's `<Loader />` is HTML-only and cannot be a Canvas/Suspense fallback. */
function GltfSuspenseFallback() {
  const { progress } = useProgress()
  return (
    <Html center>
      <span style={{ color: '#8cf', fontFamily: 'system-ui, sans-serif', fontSize: 13 }}>
        Loading model… {Math.round(progress)}%
      </span>
    </Html>
  )
}

function SceneInner({ videoRef }: Props) {
  const pickRootRef = useRef<THREE.Group>(null)
  const engineRootRef = useRef<THREE.Group>(null)
  const detached = useSpatialStore((s) => s.detachedPartIds)
  const activeParts = useSpatialStore((s) => s.activeParts)
  const blueprintId = useSpatialStore((s) => s.activeBlueprintId)
  const gltfUrl = useSpatialStore((s) => s.gltfUrl)

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 4]} fov={50} near={0.1} far={80} />
      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.06}
        target={[0, 0.14, 0]}
        minPolarAngle={0.05}
        maxPolarAngle={Math.PI - 0.05}
        minDistance={1.85}
        maxDistance={16}
        enablePan
        rotateSpeed={0.65}
        zoomSpeed={0.7}
      />
      <HandVisionDriver videoRef={videoRef} />

      <CameraAttachedRig>
        <group ref={pickRootRef}>
          {gltfUrl ? (
            <Suspense fallback={<GltfSuspenseFallback />}>
              <GltfHologram key={gltfUrl} url={gltfUrl} engineRootRef={engineRootRef} />
            </Suspense>
          ) : (
            <>
              <group ref={engineRootRef}>
                {activeParts
                  .filter((p) => !detached.has(p.id))
                  .map((def) => (
                    <HolographicPart
                      key={`${blueprintId ?? 'none'}-${def.id}`}
                      def={def}
                      detached={false}
                    />
                  ))}
              </group>
              <group>
                {activeParts
                  .filter((p) => detached.has(p.id))
                  .map((def) => (
                    <HolographicPart
                      key={`${blueprintId ?? 'none'}-${def.id}-det`}
                      def={def}
                      detached
                    />
                  ))}
              </group>
            </>
          )}
        </group>
      </CameraAttachedRig>

      <FistMarkers />
      <HandInteraction pickRootRef={pickRootRef} engineRootRef={engineRootRef} />
    </>
  )
}

export function SpatialScene({ videoRef }: Props) {
  return (
    <Canvas
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
        toneMapping: THREE.ACESFilmicToneMapping,
        outputColorSpace: THREE.SRGBColorSpace,
      }}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        touchAction: 'none',
      }}
    >
      <color attach="background" args={['#000000']} />
      <SceneInner videoRef={videoRef} />
    </Canvas>
  )
}

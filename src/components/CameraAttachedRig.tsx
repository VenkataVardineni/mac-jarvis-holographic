import { useLayoutEffect, useRef, type ReactNode } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { CAMERA_RIG_OFFSET } from '../lib/sceneConstants'

/**
 * Children are parented to the active camera so they stay fixed relative to the viewport
 * while OrbitControls moves the camera (hologram “sticks to the screen”).
 */
export function CameraAttachedRig({ children }: { children: ReactNode }) {
  const { camera } = useThree()
  const rigRef = useRef<THREE.Group>(null)

  useLayoutEffect(() => {
    const g = rigRef.current
    if (!g) return
    camera.add(g)
    g.position.set(
      CAMERA_RIG_OFFSET.x,
      CAMERA_RIG_OFFSET.y,
      CAMERA_RIG_OFFSET.z
    )
    g.quaternion.identity()
    return () => {
      camera.remove(g)
    }
  }, [camera])

  return <group ref={rigRef}>{children}</group>
}

import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useSpatialStore } from '../stores/spatialStore'

const ZOOM_MIN = 0.25
const ZOOM_MAX = 5

type Props = {
  /** Reserved for future ray-pick UX; scene is fist-driven only. */
  pickRootRef?: React.RefObject<THREE.Group | null>
  engineRootRef: React.RefObject<THREE.Group | null>
}

export function HandInteraction({ engineRootRef }: Props) {
  const { camera } = useThree()
  const tmpPos = useMemo(() => new THREE.Vector3(), [])
  const dWorld = useMemo(() => new THREE.Vector3(), [])
  const right = useMemo(() => new THREE.Vector3(), [])
  const up = useMemo(() => new THREE.Vector3(), [])
  const forward = useMemo(() => new THREE.Vector3(), [])

  const moveSession = useRef({
    active: false,
    startPalm: new THREE.Vector3(),
    startAssemblyPos: new THREE.Vector3(),
  })
  const twoFistSession = useRef({
    active: false,
    startDist: 0.12,
    startScale: 1,
  })

  useFrame(() => {
    let st = useSpatialStore.getState()
    const engineRoot = engineRootRef.current
    if (!engineRoot) return

    engineRoot.position.copy(st.assemblyPosition)
    engineRoot.quaternion.copy(st.assemblyRotation)
    engineRoot.scale.setScalar(st.assemblyScale)

    useSpatialStore.getState().setHoveredPartId(null)

    const h0 = st.hands[0]
    const h1 = st.hands[1]
    const f0 = h0?.isFist ?? false
    const f1 = h1?.isFist ?? false
    const nFist = (f0 ? 1 : 0) + (f1 ? 1 : 0)

    if (nFist === 2 && h0 && h1) {
      moveSession.current.active = false
      const dist = h0.palmWorld.distanceTo(h1.palmWorld)
      const tf = twoFistSession.current
      if (!tf.active) {
        tf.active = true
        tf.startDist = Math.max(dist, 0.06)
        tf.startScale = st.assemblyScale
      }
      const ratio = dist / Math.max(tf.startDist, 0.001)
      const next = THREE.MathUtils.clamp(
        tf.startScale * ratio,
        ZOOM_MIN,
        ZOOM_MAX
      )
      useSpatialStore.getState().setAssemblyScale(next)
    } else {
      twoFistSession.current.active = false
    }

    st = useSpatialStore.getState()

    if (nFist === 1) {
      const fistHand = f0 ? h0! : h1!
      const ms = moveSession.current
      if (!ms.active) {
        ms.active = true
        ms.startPalm.copy(fistHand.palmWorld)
        ms.startAssemblyPos.copy(st.assemblyPosition)
      }
      right.set(1, 0, 0).applyQuaternion(camera.quaternion)
      up.set(0, 1, 0).applyQuaternion(camera.quaternion)
      forward.set(0, 0, -1).applyQuaternion(camera.quaternion)
      dWorld.subVectors(fistHand.palmWorld, ms.startPalm)
      tmpPos.set(
        ms.startAssemblyPos.x + dWorld.dot(right),
        ms.startAssemblyPos.y + dWorld.dot(up),
        ms.startAssemblyPos.z + dWorld.dot(forward)
      )
      useSpatialStore.getState().setAssemblyPosition(tmpPos)
    } else if (nFist !== 2) {
      moveSession.current.active = false
    }
  })

  return null
}

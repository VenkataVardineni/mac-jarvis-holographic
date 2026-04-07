import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { HAND_ORBIT_TARGET, normToWorldAtFocusPlane } from '../lib/coords'
import { handByLabel } from '../lib/handLabels'
import type { HandFrame } from '../stores/spatialStore'
import { useSpatialStore } from '../stores/spatialStore'

const NZ_SCALE = 0.35
const DOT_R = 0.028

const LEFT_COLOR = '#44ddff'
const RIGHT_COLOR = '#ff66aa'

const prevLeft = new THREE.Vector3()
const prevRight = new THREE.Vector3()
const tmp = new THREE.Vector3()

export function FistMarkers() {
  const { camera } = useThree()
  const raycaster = useMemo(() => new THREE.Raycaster(), [])
  const leftRef = useRef<THREE.Mesh | null>(null)
  const rightRef = useRef<THREE.Mesh | null>(null)

  useFrame(() => {
    const st = useSpatialStore.getState()
    const h0 = st.hands[0]
    const h1 = st.hands[1]
    const labeledLeft = handByLabel(st.hands, 'Left')
    const labeledRight = handByLabel(st.hands, 'Right')

    let cyanHand: HandFrame | null = labeledLeft?.isFist ? labeledLeft : null
    let pinkHand: HandFrame | null = labeledRight?.isFist ? labeledRight : null

    if (!cyanHand && h0?.isFist && h0 !== pinkHand) cyanHand = h0
    if (!pinkHand && h1?.isFist && h1 !== cyanHand) pinkHand = h1
    if (!pinkHand && h0?.isFist && h0 !== cyanHand) pinkHand = h0
    if (!cyanHand && h1?.isFist && h1 !== pinkHand) cyanHand = h1

    const meshL = leftRef.current
    const meshR = rightRef.current

    if (meshL) {
      if (cyanHand) {
        const w = cyanHand.wrist
        normToWorldAtFocusPlane(
          raycaster,
          camera,
          w.x,
          w.y,
          w.z,
          HAND_ORBIT_TARGET,
          NZ_SCALE,
          tmp,
          meshL.visible ? prevLeft : null
        )
        prevLeft.copy(tmp)
        meshL.position.copy(tmp)
        meshL.visible = true
      } else {
        meshL.visible = false
      }
    }

    if (meshR) {
      if (pinkHand) {
        const w = pinkHand.wrist
        normToWorldAtFocusPlane(
          raycaster,
          camera,
          w.x,
          w.y,
          w.z,
          HAND_ORBIT_TARGET,
          NZ_SCALE,
          tmp,
          meshR.visible ? prevRight : null
        )
        prevRight.copy(tmp)
        meshR.position.copy(tmp)
        meshR.visible = true
      } else {
        meshR.visible = false
      }
    }
  })

  return (
    <group renderOrder={1000}>
      <mesh ref={leftRef} visible={false}>
        <sphereGeometry args={[DOT_R, 12, 12]} />
        <meshBasicMaterial
          color={LEFT_COLOR}
          depthTest={true}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      <mesh ref={rightRef} visible={false}>
        <sphereGeometry args={[DOT_R, 12, 12]} />
        <meshBasicMaterial
          color={RIGHT_COLOR}
          depthTest={true}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  )
}

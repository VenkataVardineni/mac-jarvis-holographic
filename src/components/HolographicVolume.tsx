import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Outlines, RoundedBox } from '@react-three/drei'
import type { PartDef } from '../data/volumeParts'
import { ASSEMBLY_ID } from '../data/volumeParts'
import { useSpatialStore } from '../stores/spatialStore'

/** HDR-style colors so Bloom picks up strong cyan glow (toneMapped: false on materials). */
const BASE = new THREE.Color().setRGB(0.35, 1.85, 2.25)
const HOVER = new THREE.Color().setRGB(2.2, 0.45, 2.4)
const PINCH = new THREE.Color().setRGB(3.2, 3.2, 3.8)

function PartGeometry({ def }: { def: PartDef }) {
  switch (def.geometry) {
    case 'box':
      return <boxGeometry args={def.geoArgs as [number, number, number]} />
    case 'cylinder':
      return (
        <cylinderGeometry args={def.geoArgs as [number, number, number, number]} />
      )
    case 'sphere':
      return <sphereGeometry args={def.geoArgs as [number, number, number]} />
    case 'torus':
      return (
        <torusGeometry args={def.geoArgs as [number, number, number, number]} />
      )
    default:
      return <boxGeometry args={[0.2, 0.2, 0.2]} />
  }
}

function readRoundedArgs(def: PartDef): [number, number, number, number, number] {
  const g = def.geoArgs
  const w = g[0] ?? 1
  const h = g[1] ?? 1
  const d = g[2] ?? 1
  const radius = g[3] ?? 0.05
  const smoothness = Math.round(g[4] ?? 5)
  return [w, h, d, radius, smoothness]
}

function RoundedHologramShell({
  def,
  wireMatRef,
  solidMatRef,
}: {
  def: PartDef
  wireMatRef: React.RefObject<THREE.MeshBasicMaterial | null>
  solidMatRef: React.RefObject<THREE.MeshBasicMaterial | null>
}) {
  const [w, h, d, radius, smoothness] = readRoundedArgs(def)
  const ud = { partId: def.id, assemblyId: ASSEMBLY_ID }
  const rot = (def.rotation ?? [0, 0, 0]) as THREE.EulerTuple

  return (
    <group rotation={rot}>
      <RoundedBox
        args={[w, h, d]}
        radius={radius}
        smoothness={smoothness}
        userData={ud}
      >
        <meshBasicMaterial
          ref={wireMatRef}
          color={BASE}
          wireframe
          transparent
          opacity={1}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
        <Outlines
          color="#a8ffff"
          thickness={0.024}
          opacity={1}
          transparent
          toneMapped={false}
        />
      </RoundedBox>
      <RoundedBox
        args={[w, h, d]}
        radius={radius}
        smoothness={smoothness}
        scale={0.987}
        userData={ud}
      >
        <meshBasicMaterial
          ref={solidMatRef}
          color="#003344"
          transparent
          opacity={0.14}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </RoundedBox>
    </group>
  )
}

function PrimitiveHologramShell({
  def,
  wireMatRef,
  solidMatRef,
}: {
  def: PartDef
  wireMatRef: React.RefObject<THREE.MeshBasicMaterial | null>
  solidMatRef: React.RefObject<THREE.MeshBasicMaterial | null>
}) {
  const ud = { partId: def.id, assemblyId: ASSEMBLY_ID }

  return (
    <group rotation={(def.rotation ?? [0, 0, 0]) as THREE.EulerTuple}>
      <mesh userData={ud}>
        <PartGeometry def={def} />
        <meshBasicMaterial
          ref={wireMatRef}
          color={BASE}
          wireframe
          transparent
          opacity={1}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
        <Outlines
          color="#a8ffff"
          thickness={0.024}
          opacity={1}
          transparent
          toneMapped={false}
        />
      </mesh>
      <mesh userData={ud} scale={0.985}>
        <PartGeometry def={def} />
        <meshBasicMaterial
          ref={solidMatRef}
          color="#003344"
          transparent
          opacity={0.14}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
    </group>
  )
}

function HologramShell({
  def,
  wireMatRef,
  solidMatRef,
}: {
  def: PartDef
  wireMatRef: React.RefObject<THREE.MeshBasicMaterial | null>
  solidMatRef: React.RefObject<THREE.MeshBasicMaterial | null>
}) {
  if (def.geometry === 'roundedBox') {
    return (
      <RoundedHologramShell
        def={def}
        wireMatRef={wireMatRef}
        solidMatRef={solidMatRef}
      />
    )
  }
  return (
    <PrimitiveHologramShell
      def={def}
      wireMatRef={wireMatRef}
      solidMatRef={solidMatRef}
    />
  )
}

type PartProps = {
  def: PartDef
  detached: boolean
}

export function HolographicPart({ def, detached }: PartProps) {
  const rootRef = useRef<THREE.Group>(null)
  const wireMatRef = useRef<THREE.MeshBasicMaterial>(null)
  const solidMatRef = useRef<THREE.MeshBasicMaterial>(null)

  useFrame(() => {
    const st = useSpatialStore.getState()
    const meshRoot = rootRef.current
    const wm = wireMatRef.current
    const sm = solidMatRef.current
    if (!meshRoot || !wm || !sm) return

    const ov = st.partWorldOverrides.get(def.id)
    if (ov) {
      meshRoot.position.copy(ov.position)
      meshRoot.quaternion.copy(ov.quaternion)
      meshRoot.scale.copy(ov.scale)
    }

    if (st.thrownPartIds.has(def.id)) {
      meshRoot.visible = false
      return
    }
    meshRoot.visible = true

    const col =
      st.grabbedPartId === def.id
        ? PINCH
        : st.hoveredPartId === def.id
          ? HOVER
          : BASE
    wm.color.copy(col)
    sm.color.copy(col).multiplyScalar(0.12)
  })

  const p = def.position
  const s = def.scale ?? [1, 1, 1]

  return (
    <group
      ref={rootRef}
      position={detached ? [0, 0, 0] : p}
      scale={detached ? [1, 1, 1] : s}
      userData={{ partId: def.id, partPivot: true, assemblyId: ASSEMBLY_ID }}
    >
      <HologramShell
        def={def}
        wireMatRef={wireMatRef}
        solidMatRef={solidMatRef}
      />
    </group>
  )
}

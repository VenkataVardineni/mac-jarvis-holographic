import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useAnimations, useGLTF } from '@react-three/drei'
import { SkeletonUtils } from 'three-stdlib'
import { ASSEMBLY_ID } from '../data/volumeParts'
import { useSpatialStore } from '../stores/spatialStore'

/** sRGB-range colors; additive + HDR values stacked into a solid white blob on dense wireframes. */
const BASE = new THREE.Color('#2ec4e0')
const HOVER = new THREE.Color('#e056fd')
const PINCH = new THREE.Color('#ffffff')

const ROOT_ID = 'gltf_model'

function makeWireMat(): THREE.MeshBasicMaterial {
  return new THREE.MeshBasicMaterial({
    color: BASE.clone(),
    wireframe: true,
    transparent: true,
    opacity: 0.92,
    depthWrite: false,
    depthTest: true,
    side: THREE.DoubleSide,
    blending: THREE.NormalBlending,
    toneMapped: false,
  })
}

function makeLineMat(): THREE.LineBasicMaterial {
  return new THREE.LineBasicMaterial({
    color: BASE.clone(),
    transparent: true,
    opacity: 0.92,
    depthWrite: false,
    toneMapped: false,
  })
}

function partIdForMesh(mesh: THREE.Mesh, index: number) {
  const raw = (mesh.name || 'mesh').replace(/[^a-zA-Z0-9_-]/g, '_') || 'mesh'
  return `${raw}_${index}`
}

function centerAndScale(root: THREE.Object3D) {
  root.updateWorldMatrix(true, true)
  const bbox = new THREE.Box3().setFromObject(root, true)
  if (!bbox.isEmpty()) {
    const center = new THREE.Vector3()
    bbox.getCenter(center)
    root.position.sub(center)
  }
  const size = new THREE.Box3().setFromObject(root, true).getSize(new THREE.Vector3())
  const maxDim = Math.max(size.x, size.y, size.z, 1e-6)
  root.scale.multiplyScalar(4.25 / maxDim)
  root.updateWorldMatrix(true, true)
}

function countRigidMeshes(root: THREE.Object3D): number {
  let n = 0
  root.traverse((o) => {
    if (
      o instanceof THREE.Mesh &&
      o.geometry &&
      !(o instanceof THREE.SkinnedMesh) &&
      !(o instanceof THREE.InstancedMesh)
    ) {
      n++
    }
  })
  return n
}

function countSkinnedMeshes(root: THREE.Object3D): number {
  let n = 0
  root.traverse((o) => {
    if (o instanceof THREE.SkinnedMesh && o.geometry) n++
  })
  return n
}

function sceneHasDrawable(root: THREE.Object3D): boolean {
  let ok = false
  root.traverse((o) => {
    if (o instanceof THREE.InstancedMesh) return
    if (o instanceof THREE.Mesh && o.geometry) ok = true
    if (o instanceof THREE.Line && o.geometry) ok = true
    if (o instanceof THREE.LineSegments && o.geometry) ok = true
    if (o instanceof THREE.LineLoop && o.geometry) ok = true
  })
  return ok
}

type GltfLike = {
  scene?: THREE.Object3D | null
  scenes?: THREE.Object3D[]
}

/** Some GLBs use an empty default `scene`; pick the first scene that has geometry. */
function pickRootScene(gltf: GltfLike): THREE.Object3D | null {
  const candidates: THREE.Object3D[] = []
  const seen = new Set<THREE.Object3D>()
  const add = (o: THREE.Object3D | null | undefined) => {
    if (!o || seen.has(o)) return
    seen.add(o)
    candidates.push(o)
  }
  add(gltf.scene)
  for (const s of gltf.scenes ?? []) add(s)
  for (const c of candidates) {
    if (sceneHasDrawable(c)) return c
  }
  return gltf.scene ?? gltf.scenes?.[0] ?? null
}

/** Rigid meshes only — split into detachable pivots. */
function extractFlatMeshPivots(clone: THREE.Object3D): THREE.Group[] {
  centerAndScale(clone)

  const meshes: THREE.Mesh[] = []
  clone.traverse((o) => {
    if (
      o instanceof THREE.Mesh &&
      o.geometry &&
      !(o instanceof THREE.SkinnedMesh) &&
      !(o instanceof THREE.InstancedMesh)
    ) {
      meshes.push(o)
    }
  })

  const pivots: THREE.Group[] = []

  meshes.forEach((mesh, index) => {
    mesh.updateWorldMatrix(true, true)
    const wm = mesh.matrixWorld.clone()
    const pos = new THREE.Vector3()
    const quat = new THREE.Quaternion()
    const scl = new THREE.Vector3()
    wm.decompose(pos, quat, scl)

    const parent = mesh.parent
    if (parent) parent.remove(mesh)

    mesh.position.set(0, 0, 0)
    mesh.rotation.set(0, 0, 0)
    mesh.scale.set(1, 1, 1)
    mesh.updateMatrix()

    const id = partIdForMesh(mesh, index)

    const mat = makeWireMat()
    mesh.material = mat
    mesh.frustumCulled = false
    mesh.userData.partId = id
    mesh.userData.assemblyId = ASSEMBLY_ID

    const pivot = new THREE.Group()
    pivot.position.copy(pos)
    pivot.quaternion.copy(quat)
    pivot.scale.copy(scl)
    pivot.userData.partId = id
    pivot.userData.partPivot = true
    pivot.userData.assemblyId = ASSEMBLY_ID
    pivot.add(mesh)
    pivots.push(pivot)
  })

  return pivots
}

/**
 * Skinned / single-hierarchy models: keep bones, hologram materials.
 * Uses SkeletonUtils.clone so skeletons survive cloning (plain .clone() often breaks rigs).
 */
function buildWholeScenePivot(clone: THREE.Object3D): THREE.Group[] {
  centerAndScale(clone)

  clone.traverse((o) => {
    if (o instanceof THREE.InstancedMesh) return
    if (o instanceof THREE.Line || o instanceof THREE.LineSegments || o instanceof THREE.LineLoop) {
      if (!o.geometry) return
      o.material = makeLineMat()
      o.frustumCulled = false
      o.userData.partId = ROOT_ID
      o.userData.assemblyId = ASSEMBLY_ID
      return
    }
    if (
      (o instanceof THREE.Mesh || o instanceof THREE.SkinnedMesh) &&
      o.geometry
    ) {
      o.material = makeWireMat()
      o.frustumCulled = false
      o.userData.partId = ROOT_ID
      o.userData.assemblyId = ASSEMBLY_ID
    }
  })

  const pivot = new THREE.Group()
  pivot.userData.partId = ROOT_ID
  pivot.userData.partPivot = true
  pivot.userData.assemblyId = ASSEMBLY_ID
  pivot.add(clone)
  return [pivot]
}

function collectPivots(scene: THREE.Object3D): THREE.Group[] {
  const clone = SkeletonUtils.clone(scene)
  clone.updateWorldMatrix(true, true)
  /**
   * Never split when skinned meshes exist: extractFlatMeshPivots only lifts rigid meshes and
   * drops the rest of the cloned hierarchy (the actual rigged body would vanish).
   */
  const skinned = countSkinnedMeshes(clone)
  const rigid = countRigidMeshes(clone)
  if (rigid > 0 && skinned === 0) {
    return extractFlatMeshPivots(clone)
  }
  return buildWholeScenePivot(clone)
}

function applyWireframeColors(pivot: THREE.Object3D, col: THREE.Color) {
  pivot.traverse((o) => {
    if (
      o instanceof THREE.Mesh ||
      o instanceof THREE.SkinnedMesh ||
      o instanceof THREE.Line ||
      o instanceof THREE.LineSegments ||
      o instanceof THREE.LineLoop
    ) {
      const mats = Array.isArray(o.material) ? o.material : [o.material]
      for (const m of mats) {
        if (m instanceof THREE.MeshBasicMaterial || m instanceof THREE.LineBasicMaterial) {
          m.color.copy(col)
        }
      }
    }
  })
}

function GltfPivot({ pivot }: { pivot: THREE.Group }) {
  const id = pivot.userData.partId as string
  const wrapRef = useRef<THREE.Group>(null)

  useFrame(() => {
    const st = useSpatialStore.getState()
    const wrap = wrapRef.current
    if (!wrap) return

    wrap.visible = !st.thrownPartIds.has(id)

    const ov = st.partWorldOverrides.get(id)
    if (ov) {
      pivot.position.copy(ov.position)
      pivot.quaternion.copy(ov.quaternion)
      pivot.scale.copy(ov.scale)
    }

    const col =
      st.grabbedPartId === id
        ? PINCH
        : st.hoveredPartId === id
          ? HOVER
          : BASE
    applyWireframeColors(pivot, col)
  })

  return (
    <group ref={wrapRef}>
      <primitive object={pivot} />
    </group>
  )
}

function GltfPlayback({
  animationRootRef,
  clips,
}: {
  animationRootRef: React.RefObject<THREE.Object3D | null>
  clips: THREE.AnimationClip[]
}) {
  const { actions, names } = useAnimations(clips, animationRootRef)

  useEffect(() => {
    if (!clips.length || !names.length) return
    const a = actions[names[0]!]
    a?.reset().fadeIn(0.2).play()
    return () => {
      a?.fadeOut(0.15)
      a?.stop()
    }
  }, [actions, names, clips.length])

  return null
}

type Props = {
  url: string
  engineRootRef: React.RefObject<THREE.Group | null>
}

export function GltfHologram({ url, engineRootRef }: Props) {
  /** Draco + Meshopt: many .glb files are compressed; without decoders geometry can be empty (black screen). */
  const gltf = useGLTF(url, true, true)
  const { animations } = gltf
  const rootScene = pickRootScene(gltf)
  const pivots = useMemo(
    () => (rootScene ? collectPivots(rootScene) : []),
    [rootScene]
  )
  const detached = useSpatialStore((s) => s.detachedPartIds)

  const animRootRef = useRef<THREE.Object3D | null>(null)
  useLayoutEffect(() => {
    if (pivots.length === 1 && pivots[0]!.children[0]) {
      animRootRef.current = pivots[0]!.children[0]!
    } else {
      animRootRef.current = null
    }
  }, [pivots])

  const attached = pivots.filter((p) => !detached.has(p.userData.partId as string))
  const floated = pivots.filter((p) => detached.has(p.userData.partId as string))

  return (
    <>
      <GltfPlayback animationRootRef={animRootRef} clips={animations} />
      <group ref={engineRootRef}>
        {attached.map((p) => (
          <GltfPivot key={p.uuid} pivot={p} />
        ))}
      </group>
      <group>
        {floated.map((p) => (
          <GltfPivot key={`${p.uuid}-det`} pivot={p} />
        ))}
      </group>
    </>
  )
}

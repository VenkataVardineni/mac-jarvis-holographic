import { create } from 'zustand'
import * as THREE from 'three'
import type { PartDef } from '../data/volumeParts'

export {
  LM_WRIST,
  LM_THUMB_TIP,
  LM_INDEX_TIP,
  LM_INDEX_MCP,
  LM_MIDDLE_TIP,
  LM_RING_TIP,
  LM_PINKY_TIP,
} from '../lib/handGestureDetect'

export type Vec3 = { x: number; y: number; z: number }

export type HandFrame = {
  wrist: Vec3
  /** Closed fist — only gesture used for control */
  isFist: boolean
  /** Smoothed palm / wrist anchor in world */
  palmWorld: THREE.Vector3
  velocity: THREE.Vector3
  label: 'Left' | 'Right' | 'Unknown'
}

export type PartTransform = {
  position: THREE.Vector3
  quaternion: THREE.Quaternion
  scale: THREE.Vector3
}

type SpatialState = {
  activeBlueprintId: string | null
  activeParts: PartDef[]
  gltfUrl: string | null
  handsDetected: boolean
  hands: [HandFrame | null, HandFrame | null]
  hoveredPartId: string | null
  grabbedPartId: string | null
  grabbedByHandIndex: 0 | 1 | null
  grabOffset: THREE.Vector3
  assemblyScale: number
  /** Whole-assembly offset from default pose (fist drag) */
  assemblyPosition: THREE.Vector3
  /** Whole-assembly rotation (OK-circle twist) */
  assemblyRotation: THREE.Quaternion
  detachedPartIds: Set<string>
  thrownPartIds: Set<string>
  partWorldOverrides: Map<string, PartTransform>
}

type SpatialActions = {
  resetInteraction: () => void
  setHoveredPartId: (id: string | null) => void
  beginGrab: (partId: string, handIndex: 0 | 1, offset: THREE.Vector3) => void
  endGrab: (handIndex: 0 | 1) => void
  detachPart: (partId: string) => void
  markThrown: (partId: string) => void
  setPartOverride: (partId: string, t: PartTransform) => void
  deletePartOverride: (partId: string) => void
  setAssemblyScale: (s: number) => void
  setAssemblyPosition: (p: THREE.Vector3) => void
  setAssemblyRotation: (q: THREE.Quaternion) => void
  setHands: (hands: [HandFrame | null, HandFrame | null], detected: boolean) => void
  loadBlueprint: (id: string, parts: PartDef[]) => void
  loadGltf: (url: string) => void
  clearBlueprint: () => void
}

const emptyBlueprintState = () => ({
  activeBlueprintId: null as string | null,
  activeParts: [] as PartDef[],
  gltfUrl: null as string | null,
  hoveredPartId: null,
  grabbedPartId: null,
  grabbedByHandIndex: null as 0 | 1 | null,
  grabOffset: new THREE.Vector3(),
  assemblyScale: 1,
  assemblyPosition: new THREE.Vector3(0, 0, 0),
  assemblyRotation: new THREE.Quaternion(),
  detachedPartIds: new Set<string>(),
  thrownPartIds: new Set<string>(),
  partWorldOverrides: new Map<string, PartTransform>(),
})

export const useSpatialStore = create<SpatialState & SpatialActions>((set, get) => ({
  ...emptyBlueprintState(),
  handsDetected: false,
  hands: [null, null],

  resetInteraction: () =>
    set({
      hoveredPartId: null,
      grabbedPartId: null,
      grabbedByHandIndex: null,
      grabOffset: new THREE.Vector3(),
    }),

  setHoveredPartId: (id) => set({ hoveredPartId: id }),

  beginGrab: (partId, handIndex, offset) =>
    set({
      grabbedPartId: partId,
      grabbedByHandIndex: handIndex,
      grabOffset: offset.clone(),
    }),

  endGrab: (handIndex) => {
    const { grabbedByHandIndex } = get()
    if (grabbedByHandIndex === handIndex) {
      set({
        grabbedPartId: null,
        grabbedByHandIndex: null,
        grabOffset: new THREE.Vector3(),
      })
    }
  },

  detachPart: (partId) =>
    set((s) => {
      const next = new Set(s.detachedPartIds)
      next.add(partId)
      return { detachedPartIds: next }
    }),

  markThrown: (partId) =>
    set((s) => {
      const next = new Set(s.thrownPartIds)
      next.add(partId)
      const ov = new Map(s.partWorldOverrides)
      ov.delete(partId)
      return { thrownPartIds: next, partWorldOverrides: ov }
    }),

  setPartOverride: (partId, t) =>
    set((s) => {
      const next = new Map(s.partWorldOverrides)
      next.set(partId, {
        position: t.position.clone(),
        quaternion: t.quaternion.clone(),
        scale: t.scale.clone(),
      })
      return { partWorldOverrides: next }
    }),

  deletePartOverride: (partId) =>
    set((s) => {
      const next = new Map(s.partWorldOverrides)
      next.delete(partId)
      return { partWorldOverrides: next }
    }),

  setAssemblyScale: (assemblyScale) => set({ assemblyScale }),

  setAssemblyPosition: (p) => set({ assemblyPosition: p.clone() }),

  setAssemblyRotation: (q) => set({ assemblyRotation: q.clone() }),

  setHands: (hands, handsDetected) => set({ hands, handsDetected }),

  loadBlueprint: (id, parts) =>
    set({
      ...emptyBlueprintState(),
      activeBlueprintId: id,
      activeParts: parts,
      hands: get().hands,
      handsDetected: get().handsDetected,
    }),

  loadGltf: (url) =>
    set({
      ...emptyBlueprintState(),
      gltfUrl: url,
      hands: get().hands,
      handsDetected: get().handsDetected,
    }),

  clearBlueprint: () =>
    set({
      ...emptyBlueprintState(),
      hands: get().hands,
      handsDetected: get().handsDetected,
    }),
}))

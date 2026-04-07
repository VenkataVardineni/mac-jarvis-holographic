/** Shared tag for raycast / assembly grouping (all loaded blueprints use this). */
export const ASSEMBLY_ID = 'blueprint'

export type PartDef = {
  id: string
  position: [number, number, number]
  rotation?: [number, number, number]
  scale?: [number, number, number]
  /** roundedBox geoArgs: [width, height, depth, cornerRadius, smoothness] */
  geometry: 'box' | 'cylinder' | 'sphere' | 'torus' | 'roundedBox'
  geoArgs: number[]
}

export const VOLUME_PARTS: PartDef[] = [
  {
    id: 'crankcase',
    position: [0, -0.15, 0],
    geometry: 'box',
    geoArgs: [1.15, 0.55, 1.35],
  },
  {
    id: 'cylinder_head_n',
    position: [0, 0.42, 0.35],
    rotation: [0.2, 0, 0],
    geometry: 'box',
    geoArgs: [0.95, 0.22, 0.55],
  },
  {
    id: 'cylinder_head_s',
    position: [0, 0.42, -0.35],
    rotation: [-0.2, 0, 0],
    geometry: 'box',
    geoArgs: [0.95, 0.22, 0.55],
  },
  {
    id: 'intake_manifold',
    position: [0.62, 0.12, 0],
    rotation: [0, 0, -0.15],
    geometry: 'box',
    geoArgs: [0.35, 0.28, 0.85],
  },
  {
    id: 'exhaust_bank',
    position: [-0.58, 0.08, 0.1],
    rotation: [0, 0, 0.2],
    geometry: 'cylinder',
    geoArgs: [0.14, 0.14, 0.95, 10],
  },
  {
    id: 'piston_a',
    position: [0.22, -0.38, 0.28],
    geometry: 'cylinder',
    geoArgs: [0.12, 0.12, 0.45, 12],
  },
  {
    id: 'piston_b',
    position: [-0.18, -0.38, -0.22],
    geometry: 'cylinder',
    geoArgs: [0.12, 0.12, 0.45, 12],
  },
  {
    id: 'piston_c',
    position: [0.05, -0.38, -0.38],
    geometry: 'cylinder',
    geoArgs: [0.12, 0.12, 0.45, 12],
  },
  {
    id: 'turbo_shell',
    position: [-0.42, -0.52, 0.55],
    geometry: 'torus',
    geoArgs: [0.22, 0.06, 12, 24],
  },
  {
    id: 'wire_sphere_core',
    position: [0.38, 0.48, -0.42],
    geometry: 'sphere',
    geoArgs: [0.32, 20, 20],
  },
]

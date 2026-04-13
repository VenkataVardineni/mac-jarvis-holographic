import type { PartDef } from './volumeParts'
import { VOLUME_PARTS } from './volumeParts'

/** Stylized blueprint car: body, panels, wheels, seats — each detachable. */
const CAR_PARTS: PartDef[] = [
  {
    id: 'car_body',
    position: [0, 0.16, 0],
    geometry: 'roundedBox',
    geoArgs: [1.95, 0.36, 0.86, 0.07, 6],
  },
  {
    id: 'car_hood',
    position: [0.88, 0.2, 0],
    geometry: 'roundedBox',
    geoArgs: [0.52, 0.11, 0.76, 0.035, 5],
  },
  {
    id: 'car_trunk',
    position: [-0.86, 0.18, 0],
    geometry: 'roundedBox',
    geoArgs: [0.46, 0.13, 0.72, 0.04, 5],
  },
  {
    id: 'car_roof',
    position: [0, 0.48, 0],
    geometry: 'roundedBox',
    geoArgs: [0.9, 0.055, 0.74, 0.028, 5],
  },
  {
    id: 'car_windshield',
    position: [0.32, 0.34, 0],
    rotation: [0.4, 0, 0],
    geometry: 'roundedBox',
    geoArgs: [0.05, 0.22, 0.62, 0.018, 4],
  },
  {
    id: 'bumper_front',
    position: [1.06, 0.06, 0],
    geometry: 'roundedBox',
    geoArgs: [0.1, 0.1, 0.78, 0.035, 4],
  },
  {
    id: 'bumper_rear',
    position: [-1.04, 0.06, 0],
    geometry: 'roundedBox',
    geoArgs: [0.1, 0.1, 0.78, 0.035, 4],
  },
  {
    id: 'wheel_fl',
    position: [0.58, -0.02, 0.44],
    rotation: [0, 0, Math.PI / 2],
    geometry: 'cylinder',
    geoArgs: [0.15, 0.15, 0.12, 28],
  },
  {
    id: 'wheel_fr',
    position: [0.58, -0.02, -0.44],
    rotation: [0, 0, Math.PI / 2],
    geometry: 'cylinder',
    geoArgs: [0.15, 0.15, 0.12, 28],
  },
  {
    id: 'wheel_rl',
    position: [-0.55, -0.02, 0.44],
    rotation: [0, 0, Math.PI / 2],
    geometry: 'cylinder',
    geoArgs: [0.15, 0.15, 0.12, 28],
  },
  {
    id: 'wheel_rr',
    position: [-0.55, -0.02, -0.44],
    rotation: [0, 0, Math.PI / 2],
    geometry: 'cylinder',
    geoArgs: [0.15, 0.15, 0.12, 28],
  },
  {
    id: 'seat_driver',
    position: [0.15, 0.28, 0.22],
    geometry: 'roundedBox',
    geoArgs: [0.22, 0.2, 0.24, 0.04, 4],
  },
  {
    id: 'seat_passenger',
    position: [0.15, 0.28, -0.22],
    geometry: 'roundedBox',
    geoArgs: [0.22, 0.2, 0.24, 0.04, 4],
  },
  {
    id: 'seat_rear',
    position: [-0.42, 0.26, 0],
    geometry: 'roundedBox',
    geoArgs: [0.38, 0.18, 0.62, 0.045, 4],
  },
  {
    id: 'steering_column',
    position: [0.42, 0.32, 0.22],
    rotation: [0.25, 0, 0],
    geometry: 'cylinder',
    geoArgs: [0.03, 0.03, 0.16, 16],
  },
]

const TRUCK_PARTS: PartDef[] = [
  {
    id: 'truck_cab',
    position: [0.55, 0.28, 0],
    geometry: 'box',
    geoArgs: [0.75, 0.52, 0.92],
  },
  {
    id: 'truck_bed',
    position: [-0.55, 0.22, 0],
    geometry: 'box',
    geoArgs: [1.1, 0.28, 0.88],
  },
  {
    id: 'truck_hood',
    position: [1.02, 0.26, 0],
    geometry: 'box',
    geoArgs: [0.35, 0.2, 0.82],
  },
  {
    id: 'wheel_t1',
    position: [0.72, -0.04, 0.46],
    rotation: [0, 0, Math.PI / 2],
    geometry: 'cylinder',
    geoArgs: [0.17, 0.17, 0.13, 14],
  },
  {
    id: 'wheel_t2',
    position: [0.72, -0.04, -0.46],
    rotation: [0, 0, Math.PI / 2],
    geometry: 'cylinder',
    geoArgs: [0.17, 0.17, 0.13, 14],
  },
  {
    id: 'wheel_t3',
    position: [-0.35, -0.04, 0.46],
    rotation: [0, 0, Math.PI / 2],
    geometry: 'cylinder',
    geoArgs: [0.17, 0.17, 0.13, 14],
  },
  {
    id: 'wheel_t4',
    position: [-0.35, -0.04, -0.46],
    rotation: [0, 0, Math.PI / 2],
    geometry: 'cylinder',
    geoArgs: [0.17, 0.17, 0.13, 14],
  },
  {
    id: 'truck_tailgate',
    position: [-1.12, 0.24, 0],
    rotation: [0, 0, 0.08],
    geometry: 'box',
    geoArgs: [0.06, 0.22, 0.82],
  },
  {
    id: 'truck_seat',
    position: [0.48, 0.32, 0],
    geometry: 'box',
    geoArgs: [0.28, 0.22, 0.55],
  },
]

const ROBOT_PARTS: PartDef[] = [
  {
    id: 'robot_head',
    position: [0, 0.72, 0],
    geometry: 'box',
    geoArgs: [0.32, 0.28, 0.28],
  },
  {
    id: 'robot_torso',
    position: [0, 0.38, 0],
    geometry: 'box',
    geoArgs: [0.42, 0.48, 0.26],
  },
  {
    id: 'robot_arm_l',
    position: [0.38, 0.42, 0],
    rotation: [0, 0, -0.35],
    geometry: 'box',
    geoArgs: [0.38, 0.1, 0.1],
  },
  {
    id: 'robot_arm_r',
    position: [-0.38, 0.42, 0],
    rotation: [0, 0, 0.35],
    geometry: 'box',
    geoArgs: [0.38, 0.1, 0.1],
  },
  {
    id: 'robot_leg_l',
    position: [0.12, -0.02, 0],
    geometry: 'box',
    geoArgs: [0.14, 0.42, 0.14],
  },
  {
    id: 'robot_leg_r',
    position: [-0.12, -0.02, 0],
    geometry: 'box',
    geoArgs: [0.14, 0.42, 0.14],
  },
  {
    id: 'robot_antenna',
    position: [0, 0.92, 0],
    geometry: 'cylinder',
    geoArgs: [0.02, 0.02, 0.2, 8],
  },
]

const PLANE_PARTS: PartDef[] = [
  {
    id: 'plane_fuselage',
    position: [0, 0, 0],
    rotation: [0, 0, Math.PI / 2],
    geometry: 'cylinder',
    geoArgs: [0.22, 0.18, 1.6, 12],
  },
  {
    id: 'plane_wing_l',
    position: [0, 0.05, 0.85],
    rotation: [0, 0, 0.08],
    geometry: 'box',
    geoArgs: [0.08, 0.04, 1.1],
  },
  {
    id: 'plane_wing_r',
    position: [0, 0.05, -0.85],
    rotation: [0, 0, -0.08],
    geometry: 'box',
    geoArgs: [0.08, 0.04, 1.1],
  },
  {
    id: 'plane_tail',
    position: [-0.72, 0.12, 0],
    geometry: 'box',
    geoArgs: [0.35, 0.35, 0.08],
  },
  {
    id: 'plane_stabilizer_l',
    position: [-0.68, 0.1, 0.35],
    geometry: 'box',
    geoArgs: [0.2, 0.04, 0.35],
  },
  {
    id: 'plane_stabilizer_r',
    position: [-0.68, 0.1, -0.35],
    geometry: 'box',
    geoArgs: [0.2, 0.04, 0.35],
  },
  {
    id: 'plane_wheel_nose',
    position: [0.55, -0.2, 0],
    rotation: [0, 0, Math.PI / 2],
    geometry: 'cylinder',
    geoArgs: [0.08, 0.08, 0.06, 10],
  },
  {
    id: 'plane_wheel_l',
    position: [-0.15, -0.22, 0.28],
    rotation: [0, 0, Math.PI / 2],
    geometry: 'cylinder',
    geoArgs: [0.1, 0.1, 0.08, 10],
  },
  {
    id: 'plane_wheel_r',
    position: [-0.15, -0.22, -0.28],
    rotation: [0, 0, Math.PI / 2],
    geometry: 'cylinder',
    geoArgs: [0.1, 0.1, 0.08, 10],
  },
  {
    id: 'plane_cockpit',
    position: [0.35, 0.08, 0],
    geometry: 'sphere',
    geoArgs: [0.2, 12, 12],
  },
]

const OBJECT_CATALOG: Record<string, PartDef[]> = {
  car: CAR_PARTS,
  truck: TRUCK_PARTS,
  robot: ROBOT_PARTS,
  plane: PLANE_PARTS,
  airplane: PLANE_PARTS,
  aircraft: PLANE_PARTS,
  engine: VOLUME_PARTS,
}

const ALIASES: Record<string, string> = {
  automobile: 'car',
  vehicle: 'car',
  sedan: 'car',
  pickup: 'truck',
  lorry: 'truck',
  mech: 'robot',
  android: 'robot',
  jet: 'plane',
  motor: 'engine',
  block: 'engine',
}

/** Canonical blueprint keys (aliases resolve into these). */
export const CATALOG_PRIMARY_IDS = ['car', 'truck', 'robot', 'plane', 'engine'] as const

export type ResolvedBlueprint = { id: string; parts: PartDef[] }

export function resolveBlueprintName(raw: string): ResolvedBlueprint | null {
  const t = raw.trim().toLowerCase().replace(/\s+/g, '_')
  if (!t) return null
  const key = ALIASES[t] ?? t
  const parts = OBJECT_CATALOG[key]
  if (!parts) return null
  return {
    id: key,
    parts: parts.map((p) => ({
      ...p,
      position: [...p.position] as [number, number, number],
      rotation: p.rotation ? ([...p.rotation] as [number, number, number]) : undefined,
      scale: p.scale ? ([...p.scale] as [number, number, number]) : undefined,
      geoArgs: [...p.geoArgs],
    })),
  }
}

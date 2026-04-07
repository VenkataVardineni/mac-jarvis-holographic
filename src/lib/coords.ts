import * as THREE from 'three'

/**
 * Same point OrbitControls uses as `target` — hand rays hit this plane facing the camera,
 * so mapping stays stable when the view is orbited (world z=0 plane fails or behaves badly when tilted).
 */
export const HAND_ORBIT_TARGET = new THREE.Vector3(0, 0.14, 0)

/** @deprecated use HAND_ORBIT_TARGET; kept for any external references */
export const HAND_PLANE_Z = HAND_ORBIT_TARGET.z

const _camFwd = new THREE.Vector3()
const _focusPlane = new THREE.Plane()

/**
 * MediaPipe normalized landmark → world: ray from camera through (mirrored) NDC,
 * intersect plane through `focus` facing the camera, then offset slightly along view using `nz`.
 */
export function normToWorldAtFocusPlane(
  raycaster: THREE.Raycaster,
  camera: THREE.Camera,
  nx: number,
  ny: number,
  nz: number,
  focus: THREE.Vector3,
  nzWorldScale: number,
  target: THREE.Vector3,
  fallback: THREE.Vector3 | null
): boolean {
  camera.getWorldDirection(_camFwd)
  _focusPlane.setFromNormalAndCoplanarPoint(_camFwd, focus)
  raycaster.setFromCamera(normalizedToNdc(nx, ny), camera)
  const hit = raycaster.ray.intersectPlane(_focusPlane, target)
  if (hit === null) {
    if (fallback) target.copy(fallback)
    else target.copy(focus)
    return false
  }
  target.addScaledVector(_camFwd, nz * nzWorldScale)
  return true
}

/** NDC for raycasting from camera through the pinch on the virtual screen plane. */
export function normalizedToNdc(nx: number, ny: number): THREE.Vector2 {
  const xm = 1 - nx
  const x = xm * 2 - 1
  const y = -(ny * 2 - 1)
  return new THREE.Vector2(x, y)
}

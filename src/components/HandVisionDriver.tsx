import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import {
  FilesetResolver,
  HandLandmarker,
  type HandLandmarkerResult,
  type NormalizedLandmark,
} from '@mediapipe/tasks-vision'
import * as THREE from 'three'
import type { RefObject } from 'react'
import { HAND_ORBIT_TARGET, normToWorldAtFocusPlane } from '../lib/coords'
import {
  detectFist,
  LM_INDEX_TIP,
  LM_THUMB_TIP,
  LM_WRIST,
} from '../lib/handGestureDetect'
import {
  HAND_LANDMARKER_MODEL_URL,
  MEDIAPIPE_WASM_CDN,
} from '../lib/visionConstants'
import type { HandFrame } from '../stores/spatialStore'
import { useSpatialStore } from '../stores/spatialStore'

const NZ_WORLD_SCALE = 0.35
const PALM_SMOOTH = 0.34

function handednessLabel(
  result: HandLandmarkerResult,
  handIndex: number
): HandFrame['label'] {
  const h = result.handedness[handIndex]?.[0]?.categoryName
  if (h === 'Left' || h === 'Right') return h
  return 'Unknown'
}

function lmVec(l: NormalizedLandmark): { x: number; y: number; z: number } {
  return { x: l.x, y: l.y, z: l.z }
}

type Tracked = {
  rawPalmWorld: THREE.Vector3
  smoothedPalmWorld: THREE.Vector3
  prevRawPalmWorld: THREE.Vector3
  velocity: THREE.Vector3
  prevTime: number
}

function makeTracked(): Tracked {
  return {
    rawPalmWorld: new THREE.Vector3(),
    smoothedPalmWorld: new THREE.Vector3(),
    prevRawPalmWorld: new THREE.Vector3(),
    velocity: new THREE.Vector3(),
    prevTime: 0,
  }
}

function buildHandFrame(
  lm: NormalizedLandmark[],
  result: HandLandmarkerResult,
  handIndex: number,
  camera: THREE.Camera,
  raycaster: THREE.Raycaster,
  tracked: Tracked
): HandFrame {
  const wrist = lm[LM_WRIST]!
  const thumbTip = lm[LM_THUMB_TIP]!
  const indexTip = lm[LM_INDEX_TIP]!

  const isFist = detectFist(lm)

  const palmZ = (wrist.z + thumbTip.z + indexTip.z) / 3
  const fallback =
    tracked.prevTime > 0 ? tracked.smoothedPalmWorld : null
  normToWorldAtFocusPlane(
    raycaster,
    camera,
    wrist.x,
    wrist.y,
    palmZ,
    HAND_ORBIT_TARGET,
    NZ_WORLD_SCALE,
    tracked.rawPalmWorld,
    fallback
  )

  if (tracked.prevTime === 0) {
    tracked.smoothedPalmWorld.copy(tracked.rawPalmWorld)
  } else {
    tracked.smoothedPalmWorld.lerp(tracked.rawPalmWorld, PALM_SMOOTH)
  }

  const now = performance.now()
  const dt = (now - tracked.prevTime) / 1000
  if (tracked.prevTime > 0 && dt > 0 && dt < 0.2) {
    tracked.velocity
      .subVectors(tracked.rawPalmWorld, tracked.prevRawPalmWorld)
      .divideScalar(dt)
  } else {
    tracked.velocity.set(0, 0, 0)
  }
  tracked.prevRawPalmWorld.copy(tracked.rawPalmWorld)
  tracked.prevTime = now

  return {
    wrist: lmVec(wrist),
    isFist,
    palmWorld: tracked.smoothedPalmWorld.clone(),
    velocity: tracked.velocity.clone(),
    label: handednessLabel(result, handIndex),
  }
}

function sortHandIndices(result: HandLandmarkerResult): number[] {
  const n = result.landmarks.length
  const idx = Array.from({ length: n }, (_, i) => i)
  idx.sort((a, b) => {
    const ax = 1 - result.landmarks[a][LM_INDEX_TIP]!.x
    const bx = 1 - result.landmarks[b][LM_INDEX_TIP]!.x
    return ax - bx
  })
  return idx
}

type Props = { videoRef: RefObject<HTMLVideoElement | null> }

export function HandVisionDriver({ videoRef }: Props) {
  const { camera } = useThree()
  const raycaster = useMemo(() => new THREE.Raycaster(), [])
  const landmarkerRef = useRef<HandLandmarker | null>(null)
  const trackedRef = useRef<[Tracked, Tracked]>([makeTracked(), makeTracked()])
  const lastVideoTimeRef = useRef<number>(-1)
  const lastSentTsRef = useRef(0)

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      const vision = await FilesetResolver.forVisionTasks(MEDIAPIPE_WASM_CDN)
      if (cancelled) return

      const opts = (delegate: 'GPU' | 'CPU') => ({
        baseOptions: {
          modelAssetPath: HAND_LANDMARKER_MODEL_URL,
          delegate,
        },
        runningMode: 'VIDEO' as const,
        numHands: 2,
        minHandDetectionConfidence: 0.42,
        minHandPresenceConfidence: 0.42,
        minTrackingConfidence: 0.42,
      })

      let handLandmarker: HandLandmarker
      try {
        handLandmarker = await HandLandmarker.createFromOptions(vision, opts('GPU'))
      } catch {
        handLandmarker = await HandLandmarker.createFromOptions(vision, opts('CPU'))
      }
      if (cancelled) {
        handLandmarker.close()
        return
      }
      landmarkerRef.current = handLandmarker
    })().catch((e) => {
      console.error('HandLandmarker init failed', e)
    })

    return () => {
      cancelled = true
      landmarkerRef.current?.close()
      landmarkerRef.current = null
    }
  }, [])

  useFrame(() => {
    const marker = landmarkerRef.current
    const v = videoRef.current
    if (!marker || !v || v.readyState < 2) return

    const vt = v.currentTime
    if (!Number.isFinite(vt)) return
    if (vt === lastVideoTimeRef.current) {
      return
    }
    lastVideoTimeRef.current = vt

    let ts = performance.now()
    if (ts <= lastSentTsRef.current) {
      ts = lastSentTsRef.current + 1
    }
    lastSentTsRef.current = ts

    const result = marker.detectForVideo(v, ts)
    const order = sortHandIndices(result)
    const next: [HandFrame | null, HandFrame | null] = [null, null]

    for (let s = 0; s < order.length && s < 2; s++) {
      const hi = order[s]
      const landmarks = result.landmarks[hi]
      next[s] = buildHandFrame(
        landmarks,
        result,
        hi,
        camera,
        raycaster,
        trackedRef.current[s]!
      )
    }

    useSpatialStore.getState().setHands(next, order.length > 0)
  }, -50)

  return null
}

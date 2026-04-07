import { useCallback, useRef, useState } from 'react'
import { resolveBlueprintName } from '../data/objectCatalog'
import { useSpatialStore } from '../stores/spatialStore'

const hint =
  'Fists only: cyan dot = your left fist, pink = right (when closed). One fist moves the model; both fists at once zoom in/out by spreading or bringing them together.'

const photoMessage =
  'This is a photo or image, not a 3D model. The app cannot turn pictures into holograms. Use: (1) Type car and Load for a built-in wireframe car, or (2) Get a .glb file — export from Blender, or download from Sketchfab / Google Poly-style archives (check license).'

function isImageFile(file: File): boolean {
  if (file.type.startsWith('image/')) return true
  return /\.(png|jpe?g|gif|webp|bmp|svg|heic|avif)$/i.test(file.name)
}

export function ObjectCommandBar() {
  const [value, setValue] = useState('')
  const [notice, setNotice] = useState<{
    text: string
    tone: 'info' | 'error'
  } | null>(null)
  const blobUrlRef = useRef<string | null>(null)

  const loadBlueprint = useSpatialStore((s) => s.loadBlueprint)
  const loadGltf = useSpatialStore((s) => s.loadGltf)
  const clearBlueprint = useSpatialStore((s) => s.clearBlueprint)
  const activeId = useSpatialStore((s) => s.activeBlueprintId)
  const gltfUrl = useSpatialStore((s) => s.gltfUrl)

  const revokeBlob = useCallback(() => {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current)
      blobUrlRef.current = null
    }
  }, [])

  const submit = useCallback(() => {
    const t = value.trim()
    if (/\.(glb|gltf)$/i.test(t) && (t.startsWith('/') || /^https?:\/\//i.test(t))) {
      revokeBlob()
      loadGltf(t)
      setNotice({ text: `Loading model from ${t}`, tone: 'info' })
      setValue('')
      return
    }
    const resolved = resolveBlueprintName(t)
    if (!resolved) {
      setNotice({
        text: 'Unknown name. Try: car — or load a .glb file (not a .jpg / .png photo).',
        tone: 'error',
      })
      return
    }
    revokeBlob()
    loadBlueprint(resolved.id, resolved.parts)
    setNotice({ text: `Loaded “${resolved.id}”.`, tone: 'info' })
    setValue('')
  }, [value, loadBlueprint, loadGltf, revokeBlob])

  const onGltfFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      e.target.value = ''
      if (!file) return

      if (isImageFile(file)) {
        setNotice({ text: photoMessage, tone: 'error' })
        return
      }

      const lower = file.name.toLowerCase()
      if (!lower.endsWith('.glb') && !lower.endsWith('.gltf')) {
        setNotice({
          text: `“${file.name}” is not a 3D model. Please use a .glb or .gltf file, or type car and Load.`,
          tone: 'error',
        })
        return
      }

      revokeBlob()
      const url = URL.createObjectURL(file)
      blobUrlRef.current = url
      loadGltf(url)
      setNotice({ text: `Loaded 3D file “${file.name}”.`, tone: 'info' })
    },
    [loadGltf, revokeBlob]
  )

  const clearScene = useCallback(() => {
    revokeBlob()
    clearBlueprint()
    setNotice({ text: 'Cleared.', tone: 'info' })
  }, [clearBlueprint, revokeBlob])

  const hasContent = Boolean(activeId || gltfUrl)

  return (
    <div
      style={{
        position: 'fixed',
        right: 16,
        bottom: 16,
        zIndex: 20,
        width: 'min(340px, calc(100vw - 32px))',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: 8,
          alignItems: 'stretch',
        }}
      >
        <input
          type="text"
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            setNotice(null)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submit()
          }}
          placeholder="Type: car"
          aria-label="3D object name"
          style={{
            flex: 1,
            padding: '10px 12px',
            borderRadius: 8,
            border: '1px solid rgba(0, 230, 255, 0.35)',
            background: 'rgba(6, 10, 18, 0.92)',
            color: '#e8f4ff',
            fontSize: 14,
            outline: 'none',
          }}
        />
        <button
          type="button"
          onClick={submit}
          style={{
            padding: '10px 14px',
            borderRadius: 8,
            border: '1px solid rgba(0, 230, 255, 0.5)',
            background: 'rgba(0, 120, 140, 0.35)',
            color: '#b8fbff',
            fontSize: 13,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          Load
        </button>
      </div>

      <label
        style={{
          display: 'block',
          padding: '10px 12px',
          borderRadius: 8,
          border: '1px dashed rgba(0, 230, 255, 0.35)',
          background: 'rgba(6, 10, 18, 0.75)',
          color: 'rgba(180, 230, 255, 0.85)',
          fontSize: 13,
          cursor: 'pointer',
          textAlign: 'center',
        }}
      >
        <input
          type="file"
          accept=".glb,.gltf,model/gltf-binary,model/gltf+json"
          onChange={onGltfFile}
          style={{ display: 'none' }}
        />
        Load 3D file (.glb / .gltf only — not photos)
      </label>

      {hasContent && (
        <button
          type="button"
          onClick={clearScene}
          style={{
            alignSelf: 'flex-end',
            padding: '6px 10px',
            fontSize: 12,
            borderRadius: 6,
            border: '1px solid rgba(255, 255, 255, 0.15)',
            background: 'transparent',
            color: 'rgba(255,255,255,0.55)',
            cursor: 'pointer',
          }}
        >
          Clear scene
        </button>
      )}
      <p
        style={{
          margin: 0,
          fontSize: 11,
          lineHeight: 1.45,
          color: 'rgba(200, 220, 255, 0.45)',
        }}
      >
        {hint}
      </p>
      <p
        style={{
          margin: 0,
          fontSize: 10,
          lineHeight: 1.4,
          color: 'rgba(200, 220, 255, 0.35)',
        }}
      >
        Optional: put a <code style={{ color: 'rgba(0,230,255,0.7)' }}>.glb</code> in{' '}
        <code style={{ color: 'rgba(0,230,255,0.7)' }}>public/models/</code>, then type{' '}
        <code style={{ color: 'rgba(0,230,255,0.7)' }}>/models/name.glb</code> and Load.
      </p>
      {notice && (
        <p
          style={{
            margin: 0,
            fontSize: 12,
            lineHeight: 1.45,
            color:
              notice.tone === 'error'
                ? 'rgba(255, 160, 190, 0.95)'
                : 'rgba(0, 230, 255, 0.9)',
          }}
        >
          {notice.text}
        </p>
      )}
    </div>
  )
}

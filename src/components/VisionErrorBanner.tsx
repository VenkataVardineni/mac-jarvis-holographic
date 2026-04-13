type Props = {
  message: string
}

/** Fixed camera / permission error surfaced above the canvas. */
export function VisionErrorBanner({ message }: Props) {
  return (
    <div
      role="alert"
      style={{
        position: 'fixed',
        top: 12,
        left: '50%',
        transform: 'translateX(-50%)',
        maxWidth: 'min(480px, 92vw)',
        padding: '10px 14px',
        borderRadius: 8,
        color: '#ffb8d9',
        fontFamily: 'system-ui',
        fontSize: 13,
        textAlign: 'center',
        zIndex: 30,
        background: 'rgba(12, 6, 18, 0.92)',
        border: '1px solid rgba(255, 100, 160, 0.35)',
      }}
    >
      {message}
    </div>
  )
}

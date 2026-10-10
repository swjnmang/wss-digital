import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import type { MouseEvent as ReactMouseEvent, ReactNode } from 'react'

// Erklärvideo-Knopf: öffnet das YouTube-Video eingebettet in einem Fenster.
// YouTube wird erst beim Klick geladen, über youtube-nocookie.com.

export function youtubeId(url: string): string | null {
  const m =
    url.match(/youtu\.be\/([\w-]{11})/) ||
    url.match(/[?&]v=([\w-]{11})/) ||
    url.match(/youtube(?:-nocookie)?\.com\/(?:embed|shorts)\/([\w-]{11})/)
  return m ? m[1] : null
}

/** Startzeit aus „t=130“, „t=2m10s“ oder „start=130“ in der URL lesen. */
function startFromUrl(url: string): number | undefined {
  const m = url.match(/[?&](?:t|start)=(?:(\d+)m)?(\d+)s?/)
  if (!m) return undefined
  return (m[1] ? parseInt(m[1], 10) * 60 : 0) + parseInt(m[2], 10)
}

interface VideoProps {
  url: string
  title?: string
  /** Startzeit in Sekunden (sonst aus der URL) */
  start?: number
  /** Endzeit in Sekunden – das Video hält dort an */
  end?: number
  note?: ReactNode
}

interface Props extends VideoProps {
  label?: string
  className?: string
}

export default function VideoButton({ url, title = 'Erklärvideo', label = 'Erklärvideo', className = 'bk-btn', start, end, note }: Props) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button type="button" className={className} onClick={() => setOpen(true)}>
        <i className="fa-solid fa-play" aria-hidden="true" />
        {label}
      </button>
      {open && <VideoModal url={url} title={title} start={start} end={end} note={note} onClose={() => setOpen(false)} />}
    </>
  )
}

export function VideoModal({ url, title = 'Erklärvideo', start, end, note, onClose }: VideoProps & { onClose: () => void }) {
  const id = youtubeId(url)
  const from = start ?? startFromUrl(url)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prev }
  }, [onClose])

  const params = new URLSearchParams({ autoplay: '1', rel: '0', modestbranding: '1', playsinline: '1' })
  if (from) params.set('start', String(from))
  if (end) params.set('end', String(end))

  return createPortal(
    <div className="bk-overlay" onMouseDown={(e: ReactMouseEvent<HTMLDivElement>) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="bk-video" role="dialog" aria-modal="true" aria-label={title}>
        <div className="bk-video-head">
          <h2>{title}</h2>
          <button type="button" className="bk-icon-btn" onClick={onClose} aria-label="Video schließen">
            <i className="fa-solid fa-xmark" aria-hidden="true" />
          </button>
        </div>
        {id ? (
          <div className="bk-video-frame">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${id}?${params.toString()}`}
              title={title}
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
            />
          </div>
        ) : (
          <p style={{ padding: 16 }}>
            Das Video lässt sich hier nicht einbetten. <a href={url} target="_blank" rel="noopener noreferrer">Auf YouTube öffnen</a>
          </p>
        )}
        <p className="bk-video-note">
          {note && <>{note} </>}
          Beim Abspielen werden Daten an YouTube (Google) übertragen.{' '}
          <a href={url} target="_blank" rel="noopener noreferrer">Auf YouTube öffnen</a>
        </p>
      </div>
    </div>,
    document.body
  )
}

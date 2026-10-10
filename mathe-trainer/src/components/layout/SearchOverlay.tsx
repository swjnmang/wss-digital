import { useEffect, useMemo, useRef, useState } from 'react'
import type { ChangeEvent, KeyboardEvent as ReactKeyboardEvent, MouseEvent as ReactMouseEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { allExercises } from '../../data/areas'

const norm = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ß/g, 'ss')

interface Props {
  open: boolean
  onClose: () => void
}

export default function SearchOverlay({ open, onClose }: Props) {
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const index = useMemo(
    () => allExercises().map((e) => ({ ...e, hay: norm(`${e.title} ${e.desc} ${e.area.title} ${e.section}`) })),
    []
  )

  const results = useMemo(() => {
    const words = norm(q).split(/\s+/).filter(Boolean)
    if (!words.length) return []
    return index
      .filter((e) => words.every((w) => e.hay.includes(w)))
      .sort((a, b) => Number(norm(b.title).includes(words[0])) - Number(norm(a.title).includes(words[0])))
      .slice(0, 12)
  }, [q, index])

  useEffect(() => {
    if (!open) return
    setQ('')
    setActive(0)
    const t = window.setTimeout(() => inputRef.current?.focus(), 30)
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => { window.clearTimeout(t); window.removeEventListener('keydown', onKey) }
  }, [open, onClose])

  useEffect(() => setActive(0), [q])

  if (!open) return null

  const go = (path: string) => { onClose(); navigate(path) }

  return (
    <div className="bk-overlay" onMouseDown={(e: ReactMouseEvent<HTMLDivElement>) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="bk-search" role="dialog" aria-modal="true" aria-label="Übung suchen">
        <div className="bk-search-field">
          <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setQ(e.target.value)}
            onKeyDown={(e: ReactKeyboardEvent<HTMLInputElement>) => {
              if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)) }
              if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)) }
              if (e.key === 'Enter' && results[active]) go(results[active].path)
            }}
            placeholder="z. B. Nullstelle, Zins, Pythagoras"
            aria-label="Suchbegriff"
            data-no-keypad
            inputMode="search"
            enterKeyHint="search"
          />
          <button type="button" className="bk-icon-btn" onClick={onClose} aria-label="Suche schließen">
            <i className="fa-solid fa-xmark" aria-hidden="true" />
          </button>
        </div>
        <div className="bk-search-results" role="listbox">
          {q && results.length === 0 && <p className="bk-search-empty">Keine Übung gefunden. Versuche ein anderes Stichwort.</p>}
          {!q && <p className="bk-search-empty">Durchsucht alle {index.length} Übungen und Themen in allen Bereichen.</p>}
          {results.map((r, i) => (
            <button
              key={r.path}
              type="button"
              role="option"
              aria-selected={i === active}
              className={`bk-search-item${i === active ? ' is-active' : ''}`}
              onMouseEnter={() => setActive(i)}
              onClick={() => go(r.path)}
            >
              <span className="bk-glyph bk-glyph-sm" style={{ ['--area' as string]: `var(--area-${r.area.id})` }}>{r.area.glyph}</span>
              <span className="bk-search-text">
                <strong>{r.title}</strong>
                <small>{r.area.title} · {r.section}</small>
              </span>
              <i className="fa-solid fa-chevron-right" aria-hidden="true" />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

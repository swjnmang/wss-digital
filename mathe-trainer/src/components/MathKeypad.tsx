import { useCallback, useEffect, useRef, useState } from 'react'
import katex from 'katex'
import 'katex/dist/katex.min.css'
import { toLatex } from './mathPreview'

// Mathe-Tastatur für Touch-Geräte.
// Hängt sich an jedes Eingabefeld der Trainer, ohne deren Logik zu verändern: Die Tasten schreiben
// über den nativen Value-Setter in das Feld und lösen ein normales input-Ereignis aus, sodass
// onChange-Handler wie bei echter Tastatureingabe reagieren. Am PC (Maus) bleibt sie aus.
// Ein Feld mit data-no-keypad (oder in einem solchen Bereich) wird ausgelassen.
// Brüche und Potenzen werden als Text eingegeben („3/4“, „x^2“), wie es die Auswertung erwartet;
// die Vorschau oben in der Tastatur zeigt sie gestapelt bzw. hochgestellt (siehe mathPreview.ts).

const TEXT_TYPES = new Set(['', 'text', 'number', 'tel', 'search', 'decimal'])
const SKIP_INSIDE = '[data-no-keypad], .GeoGebraFrame, .applet_scaler, [id^="ggbApplet"], .univer-container, [class*="univer"]'

function isTouch() {
  return typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches
}

function eligible(el: EventTarget | null): el is HTMLInputElement {
  if (!(el instanceof HTMLInputElement)) return false
  const type = (el.getAttribute('type') || '').toLowerCase()
  if (!TEXT_TYPES.has(type)) return false
  if (el.readOnly || el.disabled) return false
  if (el.closest(SKIP_INSIDE)) return false
  return true
}

const valueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set

function writeValue(el: HTMLInputElement, value: string, caret?: number) {
  valueSetter?.call(el, value)
  el.dispatchEvent(new Event('input', { bubbles: true }))
  if (caret !== undefined && el.type !== 'number') {
    try { el.setSelectionRange(caret, caret) } catch { /* Feldtyp ohne Cursor */ }
  }
}

type Key = { k: string; label?: React.ReactNode; insert?: string; cls?: string; aria?: string }
const BOX = <span className="bk-key-box" />
const FRAC_LABEL = <span className="bk-key-frac" aria-hidden="true">{BOX}<span className="bk-key-line" />{BOX}</span>
const POW_LABEL = <span aria-hidden="true">{BOX}<sup>n</sup></span>
const ROWS: Key[][] = [
  [{ k: '7' }, { k: '8' }, { k: '9' }, { k: '(', cls: 'op' }, { k: ')', cls: 'op' }, { k: '%', cls: 'op' }, { k: 'del', label: '⌫', cls: 'op', aria: 'Zeichen löschen' }],
  [{ k: '4' }, { k: '5' }, { k: '6' }, { k: 'x', cls: 'op' }, { k: '²', label: <span aria-hidden="true">{BOX}<sup>2</sup></span>, cls: 'op', aria: 'hoch 2' }, { k: '^', label: POW_LABEL, cls: 'op', aria: 'Potenz: Exponent eingeben' }, { k: 'left', label: '←', cls: 'op', aria: 'Cursor nach links' }],
  [{ k: '1' }, { k: '2' }, { k: '3' }, { k: '+', cls: 'op' }, { k: '−', insert: '-', cls: 'op', aria: 'Minus' }, { k: '/', label: FRAC_LABEL, cls: 'op', aria: 'Bruch: Nenner eingeben' }, { k: 'right', label: '→', cls: 'op', aria: 'Cursor nach rechts' }],
  [{ k: '0' }, { k: ',' }, { k: 'enter', label: 'Fertig ↵', cls: 'go', aria: 'Eingabe bestätigen' }],
]

export default function MathKeypad() {
  const [target, setTarget] = useState<HTMLInputElement | null>(null)
  const systemKb = useRef(new WeakSet<HTMLInputElement>())
  const [, rerender] = useState(0)

  const close = useCallback(() => setTarget(null), [])

  useEffect(() => {
    if (!isTouch()) return
    // Vor dem Fokus die Systemtastatur unterdrücken
    const onPointerDown = (e: PointerEvent) => {
      const el = e.target
      if (eligible(el) && !systemKb.current.has(el)) {
        if (!el.dataset.kpPrev) el.dataset.kpPrev = el.getAttribute('inputmode') ?? '__none__'
        el.setAttribute('inputmode', 'none')
      }
    }
    const onFocusIn = (e: FocusEvent) => {
      const el = e.target
      if (eligible(el) && !systemKb.current.has(el)) {
        // Zahlenfelder (type="number") verwerfen Zwischenstände wie „-“ oder „3-“ sofort als ungültig,
        // das Minus wäre dann nicht sichtbar. Darum für die Tastatur als Textfeld führen (Komma wird zu Punkt).
        if (el.type === 'number') {
          el.dataset.kpNumeric = '1'
          el.type = 'text'
        }
        el.setAttribute('inputmode', 'none')
        setTarget(el)
        window.setTimeout(() => el.scrollIntoView({ block: 'center', behavior: 'smooth' }), 60)
      }
    }
    const onFocusOut = () => {
      window.setTimeout(() => {
        const a = document.activeElement
        if (!eligible(a) || systemKb.current.has(a as HTMLInputElement)) setTarget(null)
      }, 0)
    }
    document.addEventListener('pointerdown', onPointerDown, true)
    document.addEventListener('focusin', onFocusIn)
    document.addEventListener('focusout', onFocusOut)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true)
      document.removeEventListener('focusin', onFocusIn)
      document.removeEventListener('focusout', onFocusOut)
    }
  }, [])

  // Vorschau aktuell halten, auch wenn die Seite den Wert ändert oder der Cursor per Antippen wandert
  useEffect(() => {
    if (!target) return
    const update = () => rerender((n) => n + 1)
    target.addEventListener('input', update)
    document.addEventListener('selectionchange', update)
    return () => {
      target.removeEventListener('input', update)
      document.removeEventListener('selectionchange', update)
    }
  }, [target])

  useEffect(() => {
    const root = document.querySelector('.app-root')
    root?.classList.toggle('keypad-open', !!target)
    if (target && !document.contains(target)) setTarget(null)
  })

  if (!target) return null

  const press = (key: Key) => {
    const el = target
    if (!document.contains(el)) { close(); return }
    if (key.k === 'enter') {
      el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true }))
      el.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true }))
      // Nächstes Eingabefeld im selben Bereich anspringen, sonst Tastatur schließen
      const inputs = Array.from(document.querySelectorAll<HTMLInputElement>('input')).filter(eligible)
      const next = inputs[inputs.indexOf(el) + 1]
      if (next && next.closest('form, section, .bk-card, main') === el.closest('form, section, .bk-card, main')) {
        next.focus()
      } else {
        el.blur()
        close()
      }
      return
    }
    const v = el.value
    const isNum = el.type === 'number'
    const numeric = isNum || el.dataset.kpNumeric === '1'
    let start = isNum ? v.length : el.selectionStart ?? v.length
    let end = isNum ? v.length : el.selectionEnd ?? v.length
    if (key.k === 'left' || key.k === 'right') {
      if (isNum) return
      const to = key.k === 'left' ? (start === end ? Math.max(0, start - 1) : start) : (start === end ? Math.min(v.length, end + 1) : end)
      try { el.setSelectionRange(to, to) } catch { /* Feldtyp ohne Cursor */ }
      rerender((n) => n + 1)
      return
    }
    if (key.k === 'del') {
      if (start === end && start > 0) start -= 1
      writeValue(el, v.slice(0, start) + v.slice(end), start)
      return
    }
    let ins = key.insert ?? key.k
    if (numeric && ins === ',') ins = '.'
    if (numeric && !/^[0-9.\-]$/.test(ins)) return
    writeValue(el, v.slice(0, start) + ins + v.slice(end), start + ins.length)
  }

  const switchToSystem = () => {
    const el = target
    systemKb.current.add(el)
    const prev = el.dataset.kpPrev
    if (prev && prev !== '__none__') el.setAttribute('inputmode', prev)
    else el.removeAttribute('inputmode')
    close()
    el.blur()
    window.setTimeout(() => el.focus(), 50)
  }

  const caret = target.type === 'number' ? undefined : target.selectionEnd ?? undefined
  const preview = target.value
    ? katex.renderToString(toLatex(target.value, caret), { throwOnError: false, displayMode: false })
    : ''

  const keep = (e: React.PointerEvent | React.MouseEvent) => e.preventDefault()

  return (
    <div className="bk-keypad" role="group" aria-label="Mathe-Tastatur" onPointerDown={keep} onMouseDown={keep}>
      <div className="bk-keypad-inner">
        <div className="bk-keypad-bar">
          <button type="button" className="bk-keypad-tool" onClick={switchToSystem}>
            <i className="fa-solid fa-keyboard" aria-hidden="true" /> ABC
          </button>
          {preview
            ? <span className="bk-keypad-preview" aria-hidden="true" dangerouslySetInnerHTML={{ __html: preview }} />
            : <span className="bk-keypad-title">Mathe-Tastatur</span>}
          <button type="button" className="bk-keypad-tool" onClick={() => { target.blur(); close() }} aria-label="Tastatur schließen">
            <i className="fa-solid fa-chevron-down" aria-hidden="true" />
          </button>
        </div>
        <div className="bk-keypad-grid">
          {ROWS.flat().map((key) => (
            <button
              key={key.k}
              type="button"
              className={`bk-key ${key.cls ?? ''}`}
              aria-label={key.aria ?? key.k}
              onClick={() => press(key)}
            >
              {key.label ?? key.k}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

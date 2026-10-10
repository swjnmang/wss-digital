import { useCallback, useEffect, useRef, useState } from 'react'

// Mathe-Tastatur für Touch-Geräte.
// Hängt sich an jedes Eingabefeld der Trainer, ohne deren Logik zu verändern: Die Tasten schreiben
// über den nativen Value-Setter in das Feld und lösen ein normales input-Ereignis aus, sodass
// onChange-Handler wie bei echter Tastatureingabe reagieren. Am PC (Maus) bleibt sie aus.
// Ein Feld mit data-no-keypad (oder in einem solchen Bereich) wird ausgelassen.

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

type Key = { k: string; label?: string; insert?: string; cls?: string; aria?: string }
const ROWS: Key[][] = [
  [{ k: '7' }, { k: '8' }, { k: '9' }, { k: '(', cls: 'op' }, { k: ')', cls: 'op' }, { k: 'del', label: '⌫', cls: 'op', aria: 'Zeichen löschen' }],
  [{ k: '4' }, { k: '5' }, { k: '6' }, { k: 'x', cls: 'op' }, { k: '²', cls: 'op' }, { k: '^', cls: 'op' }],
  [{ k: '1' }, { k: '2' }, { k: '3' }, { k: '+', cls: 'op' }, { k: '−', insert: '-', cls: 'op', aria: 'Minus' }, { k: '/', cls: 'op', aria: 'Bruchstrich' }],
  [{ k: '0' }, { k: ',' }, { k: '%', cls: 'op' }, { k: 'enter', label: 'Fertig ↵', cls: 'go', aria: 'Eingabe bestätigen' }],
]

export default function MathKeypad() {
  const [target, setTarget] = useState<HTMLInputElement | null>(null)
  const systemKb = useRef(new WeakSet<HTMLInputElement>())

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
    let start = isNum ? v.length : el.selectionStart ?? v.length
    let end = isNum ? v.length : el.selectionEnd ?? v.length
    if (key.k === 'del') {
      if (start === end && start > 0) start -= 1
      writeValue(el, v.slice(0, start) + v.slice(end), start)
      return
    }
    let ins = key.insert ?? key.k
    if (isNum && ins === ',') ins = '.'
    if (isNum && !/^[0-9.\-]$/.test(ins)) return
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

  const keep = (e: React.PointerEvent | React.MouseEvent) => e.preventDefault()

  return (
    <div className="bk-keypad" role="group" aria-label="Mathe-Tastatur" onPointerDown={keep} onMouseDown={keep}>
      <div className="bk-keypad-inner">
        <div className="bk-keypad-bar">
          <button type="button" className="bk-keypad-tool" onClick={switchToSystem}>
            <i className="fa-solid fa-keyboard" aria-hidden="true" /> ABC
          </button>
          <span className="bk-keypad-title">Mathe-Tastatur</span>
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

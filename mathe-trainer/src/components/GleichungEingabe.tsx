import { useRef, type ChangeEvent, type CSSProperties, type FocusEvent, type KeyboardEvent, type MouseEvent, type TouchEvent } from 'react'
import katex from 'katex'
import 'katex/dist/katex.min.css'
import { toLatex } from './mathPreview'

// Eingabefeld für eine vollständig eingetippte Funktionsgleichung (z. B. „y = 2x + 3“).
// Darunter eine kleine Zeichenleiste (y, =, x, +, −, Komma, Bruchstrich, bei quadratischen Funktionen auch ² und Klammern)
// und eine Vorschau (Brüche gestapelt, Hochzahlen hochgestellt). Die Tasten behalten den Fokus im Feld,
// so dass die automatische Prüfung nicht schon beim Antippen einer Taste startet.
// Auf Touch-Geräten übernimmt die Mathe-Tastatur (MathKeypad, dort mit y und = über data-keypad="gleichung");
// Zeichenleiste und Vorschau sind dann ausgeblendet (styles/layout.css).

const TASTEN: { zeichen: string; label: string; aria: string }[] = [
  { zeichen: 'y', label: 'y', aria: 'y einfügen' },
  { zeichen: ' = ', label: '=', aria: 'Gleichheitszeichen einfügen' },
  { zeichen: 'x', label: 'x', aria: 'x einfügen' },
  { zeichen: ' + ', label: '+', aria: 'Plus einfügen' },
  { zeichen: ' − ', label: '−', aria: 'Minus einfügen' },
  { zeichen: ',', label: ',', aria: 'Komma einfügen' },
  { zeichen: '/', label: '/', aria: 'Bruchstrich einfügen' },
]
const TASTEN_QUADRATISCH = [
  ...TASTEN,
  { zeichen: '²', label: 'x²', aria: 'hoch 2 einfügen' },
  { zeichen: '(', label: '(', aria: 'Klammer auf einfügen' },
  { zeichen: ')', label: ')', aria: 'Klammer zu einfügen' },
]

export default function GleichungEingabe({
  value,
  onChange,
  onBlur,
  className = '',
  quadratisch = false,
  placeholder = quadratisch ? 'z. B. y = 2x² − 3x + 1' : 'z. B. y = 4x − 1',
  ariaLabel = 'Funktionsgleichung',
  id,
  tasten = true,
  vorschau = true,
  readOnly,
  style,
  onEnter,
}: {
  value: string
  onChange: (v: string) => void
  onBlur?: (v: string) => void
  /** Zeichenleiste mit x², ( und ) für quadratische Funktionen */
  quadratisch?: boolean
  /** zusätzliche Klassen, z. B. fieldCheckClass(…) */
  className?: string
  placeholder?: string
  ariaLabel?: string
  id?: string
  /** Zeichenleiste anzeigen */
  tasten?: boolean
  /** Vorschau der Eingabe (gestapelte Brüche, Hochzahlen) unter dem Feld */
  vorschau?: boolean
  readOnly?: boolean
  style?: CSSProperties
  /** Enter im Feld, z. B. zum Absenden */
  onEnter?: () => void
}) {
  const ref = useRef<HTMLInputElement>(null)

  const einfuegen = (z: string) => {
    const el = ref.current
    if (!el) return onChange(value + z)
    const start = el.selectionStart ?? value.length
    const end = el.selectionEnd ?? value.length
    // doppelte Leerzeichen vermeiden
    const vorher = value.slice(0, start)
    const nachher = value.slice(end)
    let neu = z
    if (vorher.endsWith(' ') && neu.startsWith(' ')) neu = neu.trimStart()
    if (nachher.startsWith(' ') && neu.endsWith(' ')) neu = neu.trimEnd()
    if (vorher === '') neu = neu.trimStart()
    const v = vorher + neu + nachher
    onChange(v)
    requestAnimationFrame(() => {
      el.focus()
      const pos = (vorher + neu).length
      el.setSelectionRange(pos, pos)
    })
  }

  return (
    <span className="gl-eingabe" style={{ display: 'inline-flex', flexDirection: 'column', gap: 6, maxWidth: '100%', ...style }}>
      <input
        ref={ref}
        id={id}
        data-keypad="gleichung"
        readOnly={readOnly}
        type="text"
        inputMode="text"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="none"
        spellCheck={false}
        aria-label={ariaLabel}
        placeholder={placeholder}
        className={`bk-input ${className}`}
        style={{ width: 260, maxWidth: '100%', textAlign: 'left', fontSize: 20, fontWeight: 600 }}
        value={value}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
        onBlur={(e: FocusEvent<HTMLInputElement>) => onBlur?.(e.currentTarget.value)}
        onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
          if (e.key === 'Enter' && onEnter) {
            e.preventDefault()
            onEnter()
          }
        }}
      />
      {vorschau && value.trim() !== '' && (
        <span
          className="gl-eingabe-vorschau"
          aria-hidden="true"
          dangerouslySetInnerHTML={{ __html: katex.renderToString(toLatex(value), { throwOnError: false, displayMode: false }) }}
        />
      )}
      {tasten && !readOnly && (
        <span className="gl-eingabe-tasten" style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }} aria-label="Zeichen einfügen">
          {(quadratisch ? TASTEN_QUADRATISCH : TASTEN).map((t) => (
            <button
              key={t.label}
              type="button"
              tabIndex={-1}
              className="bk-btn bk-btn-sm"
              style={{ minWidth: 44, minHeight: 44, padding: '4px 10px', fontWeight: 700, fontSize: 18, justifyContent: 'center' }}
              aria-label={t.aria}
              onMouseDown={(e: MouseEvent) => e.preventDefault()}
              onTouchStart={(e: TouchEvent) => {
                e.preventDefault()
                einfuegen(t.zeichen)
              }}
              onClick={() => einfuegen(t.zeichen)}
            >
              {t.label}
            </button>
          ))}
        </span>
      )}
    </span>
  )
}

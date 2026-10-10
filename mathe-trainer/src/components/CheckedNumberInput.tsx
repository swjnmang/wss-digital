import type React from 'react'
import { useEffect, useRef, useState } from 'react'
import { fieldCheckClass } from '../utils/fieldCheck'

/** Euro-Beträge wie „36.245,58“, „36245,58 €“ oder „36245.58“ lesen. */
function parseAmount(raw: string): number {
  let s = raw.trim().replace(/€/g, '').replace(/\s+/g, '').replace(/[−–—‐]/g, '-')
  if (s === '') return NaN
  if (s.includes(',')) s = s.replace(/\./g, '').replace(',', '.')
  else if (/^-?\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, '') // „40.000“
  return Number(s)
}

interface CheckedNumberInputProps {
  /** Richtiger Wert (z. B. aus der Musterlösung) */
  expected: number
  className?: string
  placeholder?: string
  /** Erlaubte Abweichung, Standard: 0,10 bzw. 0,01 % des Werts (Rundung) */
  tolerance?: number
}

/**
 * Eingabefeld, das sich selbst prüft: nach kurzer Tipp-Pause oder beim Verlassen
 * wird es grün (richtig) bzw. rot (falsch). Für Tabellenfelder ohne eigenen Prüfen-Button.
 */
export default function CheckedNumberInput({ expected, className = '', placeholder, tolerance }: CheckedNumberInputProps) {
  const [value, setValue] = useState('')
  const [ok, setOk] = useState<boolean | null>(null)
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const check = (v: string) => {
    window.clearTimeout(timer.current)
    const n = parseAmount(v)
    if (v.trim() === '') return setOk(null)
    const tol = tolerance ?? Math.max(0.1, Math.abs(expected) * 0.0001)
    setOk(!isNaN(n) && Math.abs(n - expected) <= tol)
  }

  return (
    <input
      type="text"
      inputMode="decimal"
      placeholder={placeholder}
      value={value}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
        const v = e.target.value
        setValue(v)
        setOk(null)
        window.clearTimeout(timer.current)
        timer.current = window.setTimeout(() => check(v), 1200)
      }}
      onBlur={() => check(value)}
      className={`${className} ${fieldCheckClass(ok)}`}
    />
  )
}

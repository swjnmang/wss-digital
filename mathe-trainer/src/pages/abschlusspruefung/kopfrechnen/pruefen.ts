import type { Aufgabe, Feld } from './typen'

// Zahleneingaben: Komma oder Punkt, Tausenderpunkte, Brüche (1/8), Einheiten und %-Zeichen werden ignoriert.
export function parseZahl(raw: string): number {
  let s = raw.trim().replace(/[−–—‐]/g, '-').replace(/\s|'/g, '')
  s = s.replace(/[^0-9,./-]/g, '')
  if (!s) return NaN
  const bruch = s.match(/^(-?[0-9.,]+)\/(-?[0-9.,]+)$/)
  if (bruch) return parseZahl(bruch[1]) / parseZahl(bruch[2])
  if (s.includes(',')) s = s.replace(/\./g, '').replace(',', '.')
  else if (/^-?[1-9]\d{0,2}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, '') // 1.200 = Tausenderpunkt
  return parseFloat(s)
}

export function feldRichtig(f: Feld, eingabe: string | undefined): boolean {
  const v = (eingabe ?? '').trim()
  if (!v) return false
  if (f.choices) return v === f.answer
  const n = parseZahl(v)
  return !isNaN(n) && Math.abs(n - Number(f.answer)) <= (f.tol ?? 0.01)
}

export interface Ergebnis {
  /** je Feld bzw. für die Auswahl: richtig/falsch */
  felder: boolean[]
  alleRichtig: boolean
  punkte: number
}

/** Auswertung automatisch prüfbarer Aufgaben; Teilpunkte anteilig in halben Punkten. */
export function auswerten(a: Aufgabe, antworten: string[]): Ergebnis {
  if (a.type === 'mc') {
    const ok = antworten[0] === String(a.correct)
    return { felder: [ok], alleRichtig: ok, punkte: ok ? a.points : 0 }
  }
  if (a.type === 'num') {
    const felder = a.fields.map((f, i) => feldRichtig(f, antworten[i]))
    const n = felder.filter(Boolean).length
    const alleRichtig = n === felder.length
    return { felder, alleRichtig, punkte: alleRichtig ? a.points : Math.floor((a.points * n) / felder.length * 2) / 2 }
  }
  return { felder: [], alleRichtig: false, punkte: 0 }
}

export const mischen = <T,>(xs: T[]): T[] => {
  const a = [...xs]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Zufällige Auswahl von Aufgaben, deren Punkte genau `ziel` ergeben (wie ein Block der Prüfung). */
export function blockZiehen(pool: Aufgabe[], ziel: number): Aufgabe[] {
  for (let versuch = 0; versuch < 200; versuch++) {
    const auswahl: Aufgabe[] = []
    let summe = 0
    for (const a of mischen(pool)) {
      if (summe + a.points <= ziel) {
        auswahl.push(a)
        summe += a.points
      }
      if (summe === ziel) return auswahl
    }
  }
  return []
}

const LOB = ['Sehr gut – richtig!', 'Stark, das stimmt!', 'Richtig gelöst!', 'Prima, alles korrekt!', 'Super, genau so!']
export const lob = () => LOB[Math.floor(Math.random() * LOB.length)]

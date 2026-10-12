import { M, MB, Reihe, pick, rnd, tex } from './kit'

// Kennwerte (Bezeichnungen wie in der Merkhilfe) und passende Lösungswege

export const mean = (v: number[]) => v.reduce((s, x) => s + x, 0) / v.length
export const sorted = (v: number[]) => [...v].sort((a, b) => a - b)
export function median(v: number[]) {
  const s = sorted(v)
  const m = Math.floor(s.length / 2)
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2
}
/** alle häufigsten Werte */
export function modes(v: number[]) {
  const c = new Map<number, number>()
  v.forEach((x) => c.set(x, (c.get(x) ?? 0) + 1))
  const max = Math.max(...c.values())
  return [...c.entries()].filter(([, n]) => n === max).map(([x]) => x).sort((a, b) => a - b)
}

export interface Kontext {
  text: string
  unit: string
  d: number
  gen: () => number
}

export const KONTEXTE: Kontext[] = [
  { text: 'Die monatlichen Ausgaben (in €) von Schülerinnen und Schülern für Streamingdienste betragen:', unit: '€', d: 0, gen: () => rnd(2, 30) },
  { text: 'Beim 1000-m-Lauf wurden folgende Zeiten (in Sekunden) gemessen:', unit: 's', d: 0, gen: () => rnd(200, 340) },
  { text: 'Die Schuhgrößen der letzten Kundinnen und Kunden eines Schuhladens waren:', unit: '', d: 0, gen: () => rnd(36, 45) },
  { text: 'An einem Getränkeautomaten wurden an mehreren Tagen folgende Stückzahlen verkauft:', unit: 'Stück', d: 0, gen: () => rnd(15, 80) },
  { text: 'Eine Eiskunstläuferin erhält von den Wertungsrichtern folgende Punkte:', unit: 'Punkte', d: 1, gen: () => rnd(50, 59) / 10 },
  { text: 'Die Preise (in €) für ein bedrucktes T-Shirt bei verschiedenen Anbietern lauten:', unit: '€', d: 2, gen: () => rnd(1199, 1999) / 100 },
  { text: 'Die Tagestemperaturen (in °C) einer Woche im Mai waren:', unit: '°C', d: 0, gen: () => rnd(12, 27) },
  { text: 'Die Anzahl der Tore in den letzten Spielen einer Fußballmannschaft:', unit: 'Tore', d: 0, gen: () => rnd(0, 5) },
]

/** Datenreihe mit Länge n; mit unique = eindeutigem Modalwert */
export function datenreihe(k: Kontext, n: number, uniqueMode = false): number[] {
  for (;;) {
    const v = Array.from({ length: n }, k.gen)
    if (uniqueMode) {
      // einen Wert gezielt doppeln oder verdreifachen
      const x = pick(v)
      v[rnd(0, n - 1)] = x
      if (Math.random() < 0.5) v[rnd(0, n - 1)] = x
    }
    if (!uniqueMode || modes(v).length === 1) return v
  }
}

export const unitTex = (u: string) => (!u ? '' : u === '€' ? '\\,\\text{Euro}' : u === '°C' ? '\\,^\\circ\\text{C}' : `\\,\\text{${u}}`)

/** Median-Lösungsweg mit markierter Mitte */
export function MedianWeg({ v, d, unit }: { v: number[]; d: number; unit: string }) {
  const s = sorted(v)
  const n = s.length
  const m = Math.floor(n / 2)
  const med = median(v)
  if (n % 2) {
    return (
      <>
        <p>Rangliste (aufsteigend sortiert):</p>
        <Reihe values={s} d={d} highlight={[m]} />
        <p>
          <M>{`n = ${n}`}</M> ist ungerade. Der Median steht an der Stelle <M>{`\\frac{n+1}{2} = \\frac{${n + 1}}{2} = ${m + 1}`}</M>:
        </p>
        <MB>{`x_{med} = ${tex(med, d + 1)}${unitTex(unit)}`}</MB>
      </>
    )
  }
  return (
    <>
      <p>Rangliste (aufsteigend sortiert):</p>
      <Reihe values={s} d={d} highlight={[m - 1, m]} />
      <p>
        <M>{`n = ${n}`}</M> ist gerade. Es gibt zwei mittlere Werte (Stelle {m} und {m + 1}). Der Median liegt genau zwischen ihnen:
      </p>
      <MB>{`x_{med} = \\frac{${tex(s[m - 1], d)} + ${tex(s[m], d)}}{2} = ${tex(med, d + 1)}${unitTex(unit)}`}</MB>
    </>
  )
}

export function MittelWeg({ v, d, unit }: { v: number[]; d: number; unit: string }) {
  const total = v.reduce((a, b) => a + b, 0)
  return (
    <MB>{`\\overline{x} = \\frac{${v.map((x) => tex(x, d)).join(' + ')}}{${v.length}} = \\frac{${tex(total, d)}}{${v.length}} ${Math.abs(total / v.length - Math.round((total / v.length) * 100) / 100) < 1e-9 ? '=' : '\\approx'} ${tex(total / v.length, 2)}${unitTex(unit)}`}</MB>
  )
}

import GleichungEingabe from './GleichungEingabe'
import { fieldCheckClass } from '../utils/fieldCheck'
import { checkLinearEquation } from '../utils/parseLinearEquation'

// Eingabe einer oder mehrerer linearer Funktionsgleichungen als Ganzes (z. B. „y = 0,95x + 2,38“)
// für die Anwendungsaufgaben mit Aufgabenliste (Berg, Sonne, Brücke, …). Die Werte liegen wie bei den
// anderen mehrteiligen Antworten in einem Objekt mit dem Namen der Gleichung als Schlüssel.

export type GesuchteGleichung = { name: string; m: number; t: number }

export function GleichungFelder({
  gleichungen,
  values,
  onChange,
  marks = {},
}: {
  gleichungen: GesuchteGleichung[]
  values: Record<string, string>
  onChange: (name: string, value: string) => void
  marks?: Record<string, boolean | null>
}) {
  return (
    <div className="mb-4 space-y-3">
      {gleichungen.map((g) => (
        <div key={g.name}>
          {gleichungen.length > 1 && <label className="block text-sm font-bold text-ink mb-1">{g.name}:</label>}
          <GleichungEingabe
            ariaLabel={gleichungen.length > 1 ? `Funktionsgleichung ${g.name}` : 'Funktionsgleichung'}
            value={values[g.name] || ''}
            onChange={(v) => onChange(g.name, v)}
            className={fieldCheckClass(marks[g.name] ?? null)}
          />
        </div>
      ))}
    </div>
  )
}

/** Prüft alle Gleichungen: Eingabefehler (z. B. fehlendes „y =“) zählen nicht als Versuch */
export function pruefeGleichungen(
  gleichungen: GesuchteGleichung[],
  values: Record<string, string>,
  tol = 0.02,
): { status: 'ok' | 'no' | 'invalid'; marks: Record<string, boolean | null>; text: string } {
  const marks: Record<string, boolean | null> = {}
  const texte: string[] = []
  let invalid = false
  let allOk = true
  for (const g of gleichungen) {
    const r = checkLinearEquation(values[g.name] || '', g.m, g.t, tol)
    const prefix = gleichungen.length > 1 ? `${g.name}: ` : ''
    if (r.status === 'ok') marks[g.name] = true
    else {
      allOk = false
      if (r.status === 'invalid') invalid = true
      marks[g.name] = false
      texte.push(prefix + r.text)
    }
  }
  return { status: allOk ? 'ok' : invalid ? 'invalid' : 'no', marks, text: texte.join(' ') }
}

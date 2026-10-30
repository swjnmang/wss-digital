import type { ReactNode } from 'react'
import { InlineMath } from 'react-katex'
import './LgsWeg.css'

// Lösungsweg eines linearen Gleichungssystems wie im Heft: Jeder Schritt hat links die Erklärung und rechts die Gleichungen
// mit Namen (I, II, III …), die Umformung daneben (z. B. „| : 2“) und einen Strich unter jedem Gleichungspaar.
// Gleichungen und Umformungen sind Text oder, mit `tex`, TeX für KaTeX.

/** Eine Zeile: Name der Gleichung, Gleichung, Umformung, Hinweis (z. B. „(I − II)“), Strich darunter */
export interface LgsZeile {
  label?: string
  eq: string
  op?: string
  note?: string
  strich?: boolean
}

/** Ein Schritt: Erklärung links, Gleichungen rechts (ohne Gleichungen nur die Erklärung, z. B. für die Probe) */
export interface LgsSchritt {
  text: ReactNode
  zeilen: LgsZeile[]
}

/** Nur die Gleichungen, z. B. in einem Rechenbeispiel */
export function LgsBlock({ zeilen, tex = false }: { zeilen: LgsZeile[]; tex?: boolean }) {
  const mathe = (s?: string) => (s && tex ? <InlineMath math={s} /> : s)
  return (
    <div className="lgs-zeilen lgs-block">
      {zeilen.map((z, i) => (
        <div key={i} className="lgs-zeile">
          <span className={`lgs-label${z.strich ? ' lgs-strich' : ''}`}>{z.label}</span>
          <span className={`lgs-eq${z.strich ? ' lgs-strich' : ''}`}>{mathe(z.eq)}</span>
          <span className="lgs-op">{mathe(z.op)}</span>
          <span className="lgs-note">{z.note}</span>
        </div>
      ))}
    </div>
  )
}

/** Vollständiger Lösungsweg: nummerierte Schritte, links Erklärung, rechts Gleichungen */
export function LgsWeg({ schritte, tex = false }: { schritte: LgsSchritt[]; tex?: boolean }) {
  return (
    <div className="lgs-weg">
      {schritte.map((s, i) => (
        <div key={i} className={`lgs-schritt${s.zeilen.length ? '' : ' lgs-schritt-text'}`}>
          <p className="lgs-text">
            <strong>{i + 1}.</strong> {s.text}
          </p>
          {s.zeilen.length > 0 && <LgsBlock zeilen={s.zeilen} tex={tex} />}
        </div>
      ))}
    </div>
  )
}

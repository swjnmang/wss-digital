import { useEffect, useState, type CSSProperties, type ChangeEvent, type ReactNode } from 'react'
import { HeftBestaetigtCtx } from './kit'
import { PHASEN, type PhaseArt } from './phasen'
import './phasen.css'
import './seiten.css'

// Seitenansicht einer Lernsituation: zuerst eine Startbox, in der die SuS bestätigen, dass sie alle Rechenschritte im Heft
// dokumentieren. Danach genau eine Aufgabe pro Seite. „Weiter“ wird erst frei, wenn die Seite erledigt ist (fertig() wurde
// aufgerufen) oder die Seite als frei markiert ist (reine Info-Seiten). Alle Seiten bleiben eingehängt, damit Eingaben beim
// Zurückblättern erhalten bleiben. Jede Seite muss auf ein Tablet im Querformat passen (ohne Scrollen).

/** Themenfarben für die Identität einer Lernsituation (alle mit weißer Schrift kontraststark, bewusst ohne Grün und Rot) */
export const THEMEN = {
  blau: { farbe: '#1d3f9e', soft: '#e8edf8' },
  petrol: { farbe: '#0e6670', soft: '#e2f1f2' },
  violett: { farbe: '#6a3d9a', soft: '#f1ebf8' },
  beere: { farbe: '#a0275e', soft: '#fae9f1' },
  ocker: { farbe: '#8a5800', soft: '#fbf0da' },
  schiefer: { farbe: '#3c5466', soft: '#e8eef2' },
  indigo: { farbe: '#4338a6', soft: '#ecebf9' },
  kupfer: { farbe: '#9a4515', soft: '#fbece3' },
} as const

/** Identität einer Lernsituation: Name, Themenfarbe, Symbol (Font-Awesome-Klasse) und Titelbild für die Startbox */
export type Thema = { name: string; farbe: keyof typeof THEMEN; icon: string; bild?: ReactNode }

const themaStil = (t?: Thema) =>
  t
    ? ({ '--primary': THEMEN[t.farbe].farbe, '--primary-ink': THEMEN[t.farbe].farbe, '--primary-soft': THEMEN[t.farbe].soft, '--accent': THEMEN[t.farbe].farbe } as CSSProperties)
    : undefined

export type Seite = {
  art: PhaseArt
  /** Seitentitel, darf Formeln enthalten */
  titel: ReactNode
  /** Info-Seite: „Weiter“ ist sofort frei */
  frei?: boolean
  /** Hinweis, was zum Freischalten nötig ist (Standard: Aufgabe richtig lösen) */
  bedingung?: string
  inhalt: (fertig: () => void) => ReactNode
}

/** ruhig: ruhiges Grunddesign (eine Spalte, eine Akzentfarbe, keine Farbstreifen), siehe docs/skills/lernsituationen/SKILL.md */
export function SeitenLernsituation({ ziel, seiten, ruhig = false, thema }: { ziel: ReactNode; seiten: Seite[]; ruhig?: boolean; thema?: Thema }) {
  const [bestaetigt, setBestaetigt] = useState(false)
  const [haken, setHaken] = useState(false)
  const [nr, setNr] = useState(0)
  const [erledigt, setErledigt] = useState<boolean[]>(() => seiten.map((s) => !!s.frei))

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [nr, bestaetigt])

  if (!bestaetigt) {
    return (
      <div className={`sl-start${ruhig ? ' sl-ruhig' : ''}${thema ? ' sl-thema' : ''}`} style={themaStil(thema)}>
        {thema?.bild ? (
          <div className="sl-start-bild">{thema.bild}</div>
        ) : (
          <div className="sl-start-icon">
            <i className={`fa-solid ${thema?.icon ?? 'fa-pen-to-square'}`} aria-hidden="true" />
          </div>
        )}
        <h2>{thema ? thema.name : 'Bevor es losgeht'}</h2>
        <p className="sl-start-ziel">{ziel}</p>
        <div className="sl-start-regel">
          <strong>Deine Arbeitsweise:</strong> Bearbeite jede Aufgabe in deinem Heft und schreibe dabei <strong>alle Rechenschritte</strong> vollständig auf, nicht nur
          das Ergebnis. Erst dann trägst du das Ergebnis hier ein und prüfst es.
        </div>
        <label className="sl-start-check">
          <input type="checkbox" checked={haken} onChange={(e: ChangeEvent<HTMLInputElement>) => setHaken(e.target.checked)} />
          <span>Ich dokumentiere bei jeder Aufgabe alle Rechenschritte schriftlich in meinem Heft.</span>
        </label>
        <button type="button" className="bk-btn bk-btn-primary" disabled={!haken} onClick={() => setBestaetigt(true)}>
          Bestätigen und starten <i className="fa-solid fa-arrow-right" aria-hidden="true" />
        </button>
      </div>
    )
  }

  const seite = seiten[nr]
  const phaseIdx = PHASEN.findIndex((p) => p.art === seite.art)
  const frei = erledigt[nr]
  const fertig = (i: number) => () => setErledigt((e) => (e[i] ? e : e.map((v, j) => (j === i ? true : v))))

  return (
    <div className={`sl${ruhig ? ' sl-ruhig' : ''}${thema ? ' sl-thema' : ''}`} style={themaStil(thema)}>
      <div className="sl-bar">
        {thema && (
          <span className="sl-marke" title={thema.name}>
            <i className={`fa-solid ${thema.icon}`} aria-hidden="true" />
            <span className="sl-marke-name">{thema.name}</span>
          </span>
        )}
        <button type="button" className="bk-btn bk-btn-sm" disabled={nr === 0} onClick={() => setNr(nr - 1)} aria-label="Vorherige Seite">
          <i className="fa-solid fa-arrow-left" aria-hidden="true" />
        </button>
        <ol className="sl-phasen" aria-label="Phasen der Lernsituation">
          {PHASEN.map((p, i) => (
            <li key={p.art} className={`et-bar-${p.art}${i === phaseIdx ? ' sl-on' : ''}${i < phaseIdx ? ' sl-done' : ''}`} aria-current={i === phaseIdx ? 'step' : undefined}>
              <span className="sl-no">{i < phaseIdx ? <i className="fa-solid fa-check" aria-hidden="true" /> : i + 1}</span>
              <span className="sl-name">{p.title}</span>
            </li>
          ))}
        </ol>
        <span className="sl-zaehler" aria-label={`Seite ${nr + 1} von ${seiten.length}`}>
          {ruhig ? `${nr + 1} / ${seiten.length}` : `Seite ${nr + 1} von ${seiten.length}`}
        </span>
        {nr < seiten.length - 1 && (
          <button
            type="button"
            className="bk-btn bk-btn-sm bk-btn-primary"
            disabled={!frei}
            title={frei ? undefined : seite.bedingung ?? 'Löse zuerst die Aufgabe richtig.'}
            onClick={() => setNr(nr + 1)}
          >
            Weiter <i className="fa-solid fa-arrow-right" aria-hidden="true" />
          </button>
        )}
      </div>
      <HeftBestaetigtCtx.Provider value={true}>
      {seiten.map((s, i) => (
        <section key={i} hidden={i !== nr} className={`sl-seite et-${s.art}`}>
          <div className="sl-kopf">
            <h2 className="sl-titel">
              <span className="sl-kicker">{PHASEN.find((p) => p.art === s.art)?.title}</span>
              {s.titel}
            </h2>
            {s.bedingung && !erledigt[i] && <p className="sl-sperre">{s.bedingung}</p>}
          </div>
          {s.inhalt(fertig(i))}
        </section>
      ))}
      </HeftBestaetigtCtx.Provider>
    </div>
  )
}

/** Zwei Spalten nebeneinander (ab Tablet-Breite), z. B. Grafik links und Aufgabe rechts */
export function ZweiSpalten({ links, rechts }: { links: ReactNode; rechts: ReactNode }) {
  return (
    <div className="sl-zwei">
      <div>{links}</div>
      <div>{rechts}</div>
    </div>
  )
}

/** Karte für die Auswahlseite eines Themas: führt in eine Lernsituation, in deren Themenfarbe, mit Symbol und Name */
export function LernsituationKarte({
  thema,
  teil,
  beschreibung,
  onClick,
  className = '',
}: {
  thema: Pick<Thema, 'name' | 'farbe' | 'icon'>
  /** z. B. „Lernsituation 1 · Scheitelpunkt und ein Punkt“ */
  teil?: string
  beschreibung: ReactNode
  onClick: () => void
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={() => {
        onClick()
        window.scrollTo({ top: 0 })
      }}
      style={{ background: THEMEN[thema.farbe].farbe }}
      className={`rounded-2xl text-white p-5 border-2 border-edge shadow-hard text-left transition-transform hover:-translate-y-0.5 ${className}`}
    >
      {teil && <p className="text-sm font-bold mb-1 text-white/90">{teil}</p>}
      <p className="text-lg font-bold mb-1 text-white">{thema.name}</p>
      <p className="text-xl mb-2 text-white">
        <i className={`fa-solid ${thema.icon}`} aria-hidden="true" />
      </p>
      <p className="text-sm text-white/90">{beschreibung}</p>
    </button>
  )
}

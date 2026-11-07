import type { CSSProperties, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { THEMEN, type Thema } from './seiten'
import './themastart.css'

/** Eine Lernsituation auf der Startseite des Themas: Identität (Name, Themenfarbe, Symbol) wie in der Lernsituation selbst */
export type StartLernsituation = {
  thema: Pick<Thema, 'name' | 'farbe' | 'icon'>
  /** Kennzeile über dem Namen, z. B. „Lernsituation 1 · Zinsen berechnen“ (Standard: „Lernsituation“) */
  teil?: string
  /** Ein bis zwei Sätze: Situation und Lernziel */
  beschreibung: ReactNode
  to?: string
  onClick?: () => void
}

/** Eine Übungsaufgabe bzw. ein Schwierigkeitsgrad */
export type StartUebung = {
  titel: ReactNode
  /** Kennzeile über dem Titel, z. B. „Stufe 1“ (Standard: „Übung 1“, „Übung 2“, …) */
  kicker?: string
  /** Beispielaufgabe, z. B. „y = 2x − 6“ */
  formel?: ReactNode
  beschreibung?: ReactNode
  /** Font-Awesome-Symbol, z. B. „fa-percent“ (Standard: „fa-pencil“) */
  icon?: string
  to?: string
  onClick?: () => void
}

const iconKlasse = (icon?: string) => {
  const i = (icon ?? 'fa-pencil').replace(/\bfa-(solid|regular|brands)\b/g, '').trim()
  return `fa-solid ${i}`
}

function StartKarte({
  kicker,
  icon,
  titel,
  formel,
  beschreibung,
  go,
  style,
  to,
  onClick,
}: {
  kicker: string
  icon: string
  titel: ReactNode
  formel?: ReactNode
  beschreibung?: ReactNode
  go: string
  style?: CSSProperties
  to?: string
  onClick?: () => void
}) {
  const inhalt = (
    <>
      <span className="ts-kicker">
        <span className="ts-icon" aria-hidden="true">
          <i className={iconKlasse(icon)} />
        </span>
        {kicker}
      </span>
      <span className="ts-title">{titel}</span>
      {formel && <span className="ts-formel">{formel}</span>}
      {beschreibung && <span className="ts-desc">{beschreibung}</span>}
      <span className="ts-go">
        {go} <i className="fa-solid fa-arrow-right" aria-hidden="true" />
      </span>
    </>
  )
  const nachOben = () => window.scrollTo({ top: 0 })
  if (to) {
    return (
      <Link to={to} className="ts-card" style={style} onClick={() => { onClick?.(); nachOben() }}>
        {inhalt}
      </Link>
    )
  }
  return (
    <button type="button" className="ts-card" style={style} onClick={() => { onClick?.(); nachOben() }}>
      {inhalt}
    </button>
  )
}

/**
 * Startseite eines Themas mit Lernsituation (Pflicht laut Skill „Lernsituationen“): oben „Lernsituation“, darunter „Übungsaufgaben“,
 * alle Kästen gleich groß in einem gemeinsamen Raster (1 / 2 / 3 Spalten). Weiß, Farbe nur als Kante oben und im Symbol.
 */
export function ThemaStart({ lernsituationen, uebungen }: { lernsituationen: StartLernsituation[]; uebungen: StartUebung[] }) {
  return (
    <div className="ts">
      <section className="ts-section">
        <div className="ts-head">
          <h2>{lernsituationen.length > 1 ? 'Lernsituationen' : 'Lernsituation'}</h2>
          <p>Neu beim Thema? Hier steigst du ein.</p>
        </div>
        <div className="ts-grid">
          {lernsituationen.map((l) => (
            <StartKarte
              key={l.thema.name}
              kicker={l.teil ?? 'Lernsituation'}
              icon={l.thema.icon}
              titel={l.thema.name}
              beschreibung={l.beschreibung}
              go="Lernsituation starten"
              style={{ '--c': THEMEN[l.thema.farbe].farbe, '--c-soft': THEMEN[l.thema.farbe].soft } as CSSProperties}
              to={l.to}
              onClick={l.onClick}
            />
          ))}
        </div>
      </section>
      <section className="ts-section">
        <div className="ts-head">
          <h2>Übungsaufgaben</h2>
          <p>Schon fit? Hier trainierst du.</p>
        </div>
        <div className="ts-grid">
          {uebungen.map((u, i) => (
            <StartKarte
              key={i}
              kicker={u.kicker ?? `Übung ${i + 1}`}
              icon={u.icon ?? 'fa-pencil'}
              titel={u.titel}
              formel={u.formel}
              beschreibung={u.beschreibung}
              go="Üben"
              to={u.to}
              onClick={u.onClick}
            />
          ))}
        </div>
      </section>
    </div>
  )
}

import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { allExercises, areaForPath, areaNumber } from '../../data/areas'

// Rahmen für Übungsseiten im Heft-Design: Pfad (Inhalt / Kapitel / …), Nummer und Titel, darunter die Übung.
// Die Übung selbst (Aufgaben, Prüflogik) bleibt unverändert im children-Bereich.

interface Props {
  title: string
  subtitle?: ReactNode
  actions?: ReactNode
  children: ReactNode
  /** 'narrow' für reine Text-/Rechenaufgaben, 'wide' für Seiten mit Graph oder Tabelle */
  width?: 'narrow' | 'wide' | 'full'
  /** Zwischenebene unter dem Bereich, z. B. das Thema bei Raum & Form */
  parent?: { to: string; label: string } | { to: string; label: string }[]
}

export default function TaskShell({ title, subtitle, actions, children, width = 'wide', parent }: Props) {
  const { pathname } = useLocation()
  const area = areaForPath(pathname)
  const ex = allExercises().find((e) => e.path === pathname)
  const no = area ? areaNumber(area) : undefined
  const parents = Array.isArray(parent) ? parent : parent ? [parent] : []

  return (
    <div className={`bk-page bk-task bk-w-${width}`}>
      <header className="bk-task-head">
        <div className="bk-task-titles">
          <nav className="bk-crumbs" aria-label="Pfad">
            <Link to="/">Inhalt</Link>
            {area && (
              <>
                <span className="bk-crumb-sep" aria-hidden="true">/</span>
                <Link to={area.path}>{no} {area.title}</Link>
              </>
            )}
            {parents.map((p) => (
              <span key={p.to} style={{ display: 'contents' }}>
                <span className="bk-crumb-sep" aria-hidden="true">/</span>
                <Link to={p.to}>{p.label}</Link>
              </span>
            ))}
          </nav>
          <h1>
            {ex && no && <span className="bk-num">{no}.{ex.number}</span>}
            {title}
          </h1>
          {subtitle && <p className="bk-task-sub">{subtitle}</p>}
        </div>
        {actions && <div className="bk-task-actions">{actions}</div>}
      </header>
      <div className="bk-task-body">{children}</div>
    </div>
  )
}

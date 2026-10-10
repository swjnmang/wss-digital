import type { CSSProperties, ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { allExercises, areaForPath } from '../../data/areas'

// Rahmen für Übungsseiten: Kopfzeile in der Bereichsfarbe, darunter der Inhalt der Übung.
// Die Übung selbst (Aufgaben, Prüflogik) bleibt unverändert im children-Bereich.

interface Props {
  title: string
  subtitle?: ReactNode
  actions?: ReactNode
  children: ReactNode
  /** 'narrow' für reine Text-/Rechenaufgaben, 'wide' für Seiten mit Graph oder Tabelle */
  width?: 'narrow' | 'wide' | 'full'
}

export default function TaskShell({ title, subtitle, actions, children, width = 'wide' }: Props) {
  const { pathname } = useLocation()
  const area = areaForPath(pathname)
  const ex = allExercises().find((e) => e.path === pathname)
  const style = { ['--area' as string]: area ? `var(--area-${area.id})` : 'var(--surface)' } as CSSProperties

  return (
    <div className={`bk-page bk-task bk-w-${width}`}>
      <header className="bk-task-head" style={style}>
        <div className="bk-task-titles">
          {area && (
            <Link to={area.path} className="bk-task-area">
              <span className="bk-task-glyph" aria-hidden="true">{area.glyph}</span>
              {area.title}
            </Link>
          )}
          <h1>
            {ex && <span className="bk-num">{ex.number}</span>}
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

import { Link } from 'react-router-dom'
import { EXAM } from '../../data/areas'

// Kopf der Seiten im Kapitel „Vorbereitung Abschlussprüfung“: Pfad und Titel im Heft-Design.

export function PruefungKopf({ title, current, sub }: { title: string; current?: boolean; sub?: string }) {
  return (
    <header className="bk-task-head">
      <div className="bk-task-titles">
        <nav className="bk-crumbs" aria-label="Pfad">
          <Link to="/">Inhalt</Link>
          <span className="bk-crumb-sep" aria-hidden="true">/</span>
          {current ? <Link to={EXAM.path}>{EXAM.title}</Link> : <span>{EXAM.title}</span>}
        </nav>
        <h1>{title}</h1>
        {sub && <p className="bk-task-sub">{sub}</p>}
      </div>
    </header>
  )
}

import { Link, useParams } from 'react-router-dom'
import { EXAM } from '../data/areas'

// Vorbereitung Abschlussprüfung: Prüfungsteile als nummerierte Zeilen, darunter „Alles gemischt“.
// Die Inhalte der Prüfungsteile folgen später; bis dahin zeigt jeder Teil eine Platzhalterseite.

function Kopf({ title, current }: { title: string; current?: string }) {
  return (
    <header className="bk-task-head">
      <div className="bk-task-titles">
        <nav className="bk-crumbs" aria-label="Pfad">
          <Link to="/">Inhalt</Link>
          <span className="bk-crumb-sep" aria-hidden="true">/</span>
          {current ? <Link to={EXAM.path}>{EXAM.title}</Link> : <span>{EXAM.title}</span>}
        </nav>
        <h1>{title}</h1>
        {!current && <p className="bk-task-sub">Übe gezielt einen Prüfungsteil – oder alles gemischt.</p>}
      </div>
    </header>
  )
}

export default function Abschlusspruefung() {
  return (
    <div className="bk-page bk-task bk-w-wide">
      <Kopf title={EXAM.title} />
      <div className="bk-task-body">
        <div className="bk-topics">
          {EXAM.parts.map((p, i) => (
            <Link key={p.slug} to={`${EXAM.path}/${p.slug}`} className="bk-topic">
              <span className="bk-topic-no">{String.fromCharCode(65 + i)}</span>
              <span className="bk-topic-text">
                <strong>{p.title}</strong>
              </span>
              <i className="fa-solid fa-chevron-right" aria-hidden="true" />
            </Link>
          ))}
          <Link to={EXAM.mixedPath} className="bk-topic is-big">
            <span className="bk-topic-no"><i className="fa-solid fa-shuffle" aria-hidden="true" /></span>
            <span className="bk-topic-text">
              <strong>Alles gemischt</strong>
              <small>Aufgaben aus allen Bereichen, jedes Mal neu gemischt</small>
            </span>
            <i className="fa-solid fa-chevron-right" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  )
}

export function AbschlusspruefungTeil() {
  const { teil } = useParams()
  const part = EXAM.parts.find((p) => p.slug === teil)

  return (
    <div className="bk-page bk-task bk-w-narrow">
      <Kopf title={part?.title ?? EXAM.title} current={part?.title} />
      <div className="bk-task-body">
        <div className="bk-panel bk-stack">
          <p className="bk-label">Inhalt folgt</p>
          <p style={{ margin: 0, fontSize: 17, lineHeight: 1.5 }}>
            Die Aufgaben zur Prüfungsvorbereitung für diesen Teil werden gerade zusammengestellt.
          </p>
          <div className="bk-actions">
            <Link to={EXAM.path} className="bk-btn">
              <i className="fa-solid fa-chevron-left" aria-hidden="true" /> Alle Prüfungsteile
            </Link>
            <Link to={EXAM.mixedPath} className="bk-btn bk-btn-primary">Alles gemischt</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

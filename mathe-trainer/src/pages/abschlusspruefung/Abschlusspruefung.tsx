import { Link, useParams } from 'react-router-dom'
import { EXAM } from '../../data/areas'
import { PruefungKopf } from './PruefungKopf'

// Vorbereitung Abschlussprüfung: Prüfungsteile als nummerierte Zeilen, darunter „Alles gemischt“ (Probe-AP).
// Teile ohne Inhalt zeigen eine Platzhalterseite.

export default function Abschlusspruefung() {
  return (
    <div className="bk-page bk-task bk-w-wide">
      <PruefungKopf title={EXAM.title} sub="Übe gezielt einen Prüfungsteil – oder schreibe eine komplette Probe-Abschlussprüfung." />
      <div className="bk-task-body">
        <div className="bk-topics">
          {EXAM.parts.map((p, i) => (
            <Link key={p.slug} to={p.path ?? `${EXAM.path}/${p.slug}`} className="bk-topic">
              <span className="bk-topic-no">{String.fromCharCode(65 + i)}</span>
              <span className="bk-topic-text">
                <strong>{p.title}</strong>
                <small>{p.desc}</small>
              </span>
              <i className="fa-solid fa-chevron-right" aria-hidden="true" />
            </Link>
          ))}
          <Link to={EXAM.mixedPath} className="bk-topic is-wide">
            <span className="bk-topic-no"><i className="fa-solid fa-shuffle" aria-hidden="true" /></span>
            <span className="bk-topic-text">
              <strong>Alles gemischt</strong>
              <small>Komplette Probe-Abschlussprüfung: Teil A und Teil B aus allen Bereichen</small>
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
      <PruefungKopf title={part?.title ?? EXAM.title} current />
      <div className="bk-task-body">
        <div className="bk-panel bk-stack">
          <p className="bk-label">Inhalt folgt</p>
          <p style={{ margin: 0, fontSize: 17, lineHeight: 1.5 }}>
            Die Anwendungsaufgaben zur Prüfungsvorbereitung für diesen Teil werden gerade zusammengestellt.
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

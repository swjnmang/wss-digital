import { Link } from 'react-router-dom'
import { AREAS, EXAM, FOS, exerciseCount, type AreaId } from '../../data/areas'

// Inhaltsverzeichnis im Heft-Design: Bereiche als nummerierte Kapitel, danach die Prüfungsvorbereitung.
// Genutzt auf der Startseite und als Seitenleiste der Bereichsseiten (Tablet quer).

interface Props {
  /** markiert den gerade geöffneten Bereich */
  currentId?: AreaId
  /** Kurzbeschreibung unter dem Titel zeigen (Startseite) */
  showShort?: boolean
  /** Startseite: Bereichsglyphe statt Nummer, Prüfungsvorbereitung steht dort separat unter „Weitere Themen“ */
  home?: boolean
}

export default function ContentIndex({ currentId, showShort = false, home = false }: Props) {
  return (
    <nav className={`bk-index${home ? ' bk-index-home' : ''}`} aria-label="Inhalt">
      {AREAS.map((a, i) => (
        <Link
          key={a.id}
          to={a.path}
          className={`bk-index-row${a.id === currentId ? ' is-current' : ''}`}
          aria-current={a.id === currentId ? 'page' : undefined}
        >
          {home ? (
            <span className="bk-index-glyph" aria-hidden="true">{a.glyph}</span>
          ) : (
            <span className="bk-index-no">{i + 1}</span>
          )}
          <span className="bk-index-text">
            <strong>{a.title}</strong>
            {showShort && <small>{a.short}</small>}
          </span>
          <span className="bk-index-dots" aria-hidden="true" />
          <span className="bk-index-count">{exerciseCount(a)}<span className="sr-only"> {a.unit}</span></span>
        </Link>
      ))}
      {!home && <>
      <Link to={EXAM.path} className="bk-index-row is-exam">
        <span className="bk-index-no"><i className="fa-solid fa-graduation-cap" aria-hidden="true" /></span>
        <span className="bk-index-text">
          <strong>{EXAM.title}</strong>
          {showShort && <small>{EXAM.short}</small>}
        </span>
        <i className="fa-solid fa-chevron-right" aria-hidden="true" />
      </Link>
      <Link to={FOS.path} className="bk-index-row is-exam is-fos">
        <span className="bk-index-no"><i className="fa-solid fa-school" aria-hidden="true" /></span>
        <span className="bk-index-text">
          <strong>{FOS.title}</strong>
          {showShort && <small>{FOS.short}</small>}
        </span>
        <i className="fa-solid fa-chevron-right" aria-hidden="true" />
      </Link>
      </>}
    </nav>
  )
}

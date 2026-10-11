import { Link, useLocation } from 'react-router-dom'
import { EXAM } from '../../data/areas'

// Leiste unten im Heft-Design, nur auf dem Handy sichtbar (CSS): Inhalt · Suchen · Prüfung.

export default function BottomNav({ onSearch }: { onSearch: () => void }) {
  const { pathname } = useLocation()
  const examActive = pathname === EXAM.path || pathname.startsWith(EXAM.path + '/') || pathname === EXAM.mixedPath

  return (
    <nav className="bk-bottomnav" aria-label="Hauptnavigation">
      <Link to="/" className={!examActive ? 'is-active' : undefined}>
        <i className="fa-solid fa-book-open" aria-hidden="true" />
        Inhalt
      </Link>
      <button type="button" onClick={onSearch}>
        <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
        Suchen
      </button>
      <Link to={EXAM.path} className={examActive ? 'is-active' : undefined}>
        <i className="fa-solid fa-graduation-cap" aria-hidden="true" />
        Prüfung
      </Link>
    </nav>
  )
}

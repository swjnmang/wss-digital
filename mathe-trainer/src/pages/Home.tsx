import { Link } from 'react-router-dom'
import ContentIndex from '../components/layout/ContentIndex'

// Startseite im Heft-Design: Suche oben, darunter das Inhaltsverzeichnis aller Bereiche.

export default function Home() {
  const openSearch = () => window.dispatchEvent(new Event('bk:search'))

  return (
    <div className="bk-page bk-home">
      <h1 className="sr-only">Mathe-Trainer</h1>
      <button type="button" className="bk-home-search" onClick={openSearch}>
        <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
        Übung suchen, z. B. Zinseszins
      </button>

      <span className="bk-index-label">Inhalt</span>
      <ContentIndex showShort />

      <footer className="bk-footer">
        © 2025 Mathenkik. Alle Rechte vorbehalten. · <Link to="/impressum">Impressum</Link>
      </footer>
    </div>
  )
}

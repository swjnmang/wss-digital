import { Link } from 'react-router-dom'
import ContentIndex from '../components/layout/ContentIndex'

// Startseite im Heft-Design: Inhaltsverzeichnis aller Bereiche (die Suche steht in der Kopfzeile).

export default function Home() {
  return (
    <div className="bk-page bk-home">
      <h1 className="sr-only">Mathe-Trainer</h1>
      <span className="bk-index-label bk-index-label-top">Inhalt</span>
      <ContentIndex showShort />

      <footer className="bk-footer">
        © 2025 Mathenkik. Alle Rechte vorbehalten. · <Link to="/impressum">Impressum</Link>
      </footer>
    </div>
  )
}

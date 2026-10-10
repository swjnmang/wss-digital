import { Link, useLocation, useNavigate } from 'react-router-dom'
import { startTrackingSession, stopTrackingSession } from '../../utils/tracking'

interface Props {
  onSearch: () => void
  trackingActive: boolean
}

export default function AppHeader({ onSearch, trackingActive }: Props) {
  const navigate = useNavigate()
  const location = useLocation()
  const isHome = location.pathname === '/'
  const isTrigonometrieRoute = location.pathname.startsWith('/trigonometrie')

  const handleBack = () => {
    const segments = location.pathname.split('/').filter(Boolean)
    if (segments.length <= 1) navigate('/')
    else navigate('/' + segments.slice(0, -1).join('/'))
  }

  const handleStopTracking = () => {
    stopTrackingSession()
    navigate('/trigonometrie/nachverfolgung-bericht')
  }

  return (
    <header className="bk-header">
      <div className="bk-header-row">
        {!isHome && (
          <button type="button" onClick={handleBack} className="bk-icon-btn" aria-label="Zurück">
            <i className="fa-solid fa-chevron-left" aria-hidden="true" />
          </button>
        )}
        <Link to="/" className="bk-brand" aria-label="Mathe-Trainer – zur Startseite">
          <span className="bk-logo" aria-hidden="true">M</span>
          <span className="bk-brand-name">Mathe-Trainer</span>
        </Link>
        <span className="bk-grow" />
        <button type="button" onClick={onSearch} className="bk-search-btn" aria-label="Übung suchen">
          <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
          <span className="bk-search-label">Übung suchen …</span>
        </button>
        <a href="https://swjnmang.github.io/wss-digital/" className="bk-header-link">
          WSS-Digital
        </a>
      </div>
      {isTrigonometrieRoute && (
        <div className="bk-tracking">
          {trackingActive ? (
            <>
              <span className="bk-tracking-live">
                <span className="bk-dot" aria-hidden="true" />
                Nachverfolgung läuft
              </span>
              <button type="button" onClick={handleStopTracking} className="bk-btn bk-btn-sm bk-btn-primary" style={{ minHeight: 40, fontSize: 15 }}>
                Beenden &amp; Bericht ansehen
              </button>
            </>
          ) : (
            <button type="button" onClick={startTrackingSession} className="bk-btn bk-btn-sm">
              <i className="fa-solid fa-clipboard-list" aria-hidden="true" />
              Nachverfolgung starten
            </button>
          )}
        </div>
      )}
    </header>
  )
}

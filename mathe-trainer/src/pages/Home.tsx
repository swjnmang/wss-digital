import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { AREAS, exerciseCount } from '../data/areas'

export const openSearch = () => window.dispatchEvent(new Event('bk:search'))

export default function Home() {
  return (
    <div className="bk-page bk-home">
      <header className="bk-home-head">
        <div>
          <h1>Los geht’s!</h1>
          <p>Wähle einen Bereich – Funktionen, Finanzmathematik, Trigonometrie, Daten &amp; Zufall und mehr.</p>
        </div>
      </header>

      <div className="bk-bento">
        <Link to="/gemischtes-training" className="bk-tile bk-tile-hero" style={{ ['--area' as string]: 'var(--area-linear)' } as CSSProperties}>
          <div className="bk-hero-text">
            <span className="bk-label" style={{ color: 'inherit' }}>Gemischtes Training</span>
            <h2>10 Übungen aus allen Bereichen</h2>
            <p>Jedes Mal neu gemischt.</p>
            <span className="bk-chip"><i className="fa-solid fa-dice" aria-hidden="true" /> Los geht’s</span>
          </div>
          <div className="bk-dice" aria-hidden="true">
            <b>¾</b><b>x²</b><b>sin</b><b>€</b>
          </div>
        </Link>

        <button type="button" className="bk-tile bk-tile-accent" onClick={openSearch}>
          <i className="fa-solid fa-magnifying-glass bk-tile-icon" aria-hidden="true" />
          <h3>Suchen</h3>
          <p>z. B. „Nullstelle“ oder „Zins“</p>
        </button>

        <div className="bk-tile bk-tile-ink">
          <i className="fa-solid fa-stopwatch bk-tile-icon" aria-hidden="true" />
          <h3>Prüfungsmodus</h3>
          <div className="bk-tile-links">
            <Link to="/finanzmathe/pruefungsmodus">Finanzmathematik</Link>
            <Link to="/trigonometrie/pruefungsmodus">Trigonometrie</Link>
          </div>
        </div>

        {AREAS.map((a) => {
          const count = exerciseCount(a)
          return (
            <Link key={a.id} to={a.path} className="bk-tile bk-tile-area" style={{ ['--area' as string]: `var(--area-${a.id})` } as CSSProperties}>
              <span className="bk-tile-glyph">{a.glyph}</span>
              <span className="bk-chip">{count} {a.unit}</span>
              <h3>{a.title}</h3>
            </Link>
          )
        })}

        <Link to="/lineare_funktionen/ubungsblatt-generator" className="bk-tile bk-tile-dashed">
          <i className="fa-solid fa-file-pdf bk-tile-icon" aria-hidden="true" />
          <h3>Übungsblatt</h3>
          <p>Lineare Funktionen als PDF</p>
        </Link>
      </div>

      <footer className="bk-footer">
        © 2025 Mathenkik. Alle Rechte vorbehalten. · <Link to="/impressum">Impressum</Link>
      </footer>
    </div>
  )
}

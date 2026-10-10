import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { AREAS, exerciseCount } from '../data/areas'

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

      </div>

      <footer className="bk-footer">
        © 2025 Mathenkik. Alle Rechte vorbehalten. · <Link to="/impressum">Impressum</Link>
      </footer>
    </div>
  )
}

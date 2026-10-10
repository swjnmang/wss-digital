import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { areaById, exerciseCount, type AreaId } from '../data/areas'
import AreaIcon from '../components/layout/AreaIcon'

// Bereichsseite im Baukasten-Design: Kopf in der Bereichsfarbe, Übungen als Nummern-Kacheln,
// gruppiert in Abschnitte (z. B. Grundlagen / Anwenden / Testen). Reihenfolge wie bisher.

export default function AreaPage({ id }: { id: AreaId }) {
  const area = areaById(id)
  const style = { ['--area' as string]: `var(--area-${area.id})` } as CSSProperties
  let n = 0
  const count = exerciseCount(area)

  return (
    <div className="bk-page">
      <section className="bk-area-hero" style={style}>
        <div>
          <h1>{area.title}</h1>
          <p>{area.short}</p>
          <p className="bk-area-meta">{count} {area.unit} · empfohlene Reihenfolge · jede frei wählbar</p>
        </div>
        <span className="bk-area-glyph" aria-hidden="true"><AreaIcon id={area.id} height={72} /></span>
      </section>

      {area.sections.map((section) => (
        <section key={section.name} className="bk-area-section" aria-labelledby={`sec-${section.name}`}>
          {area.sections.length > 1 && <h2 id={`sec-${section.name}`} className="bk-section-title">{section.name}</h2>}
          <div className="bk-tiles">
            {section.items.map((it) => {
              n += 1
              return (
                <Link key={it.path} to={it.path} className={`bk-tile-ex${n === 1 ? ' is-start' : ''}`}>
                  <span className="bk-tile-top">
                    <b>{n}</b>
                    {n === 1 ? <span className="bk-chip">Einstieg</span> : <i className={it.icon} aria-hidden="true" />}
                  </span>
                  <strong>{it.title}</strong>
                  <small>{it.desc}</small>
                </Link>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}

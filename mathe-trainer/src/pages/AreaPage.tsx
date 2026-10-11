import { Link } from 'react-router-dom'
import { areaById, areaNumber, exerciseCount, type AreaId } from '../data/areas'
import ContentIndex from '../components/layout/ContentIndex'

// Bereichsseite im Heft-Design: links das Inhaltsverzeichnis (Tablet quer), rechts die Themen des Kapitels
// mit Nummern (z. B. 2.5), gruppiert in Abschnitte. Reihenfolge wie bisher.

export default function AreaPage({ id }: { id: AreaId }) {
  const area = areaById(id)
  const no = areaNumber(area)
  let n = 0

  return (
    <div className="bk-page bk-area">
      <aside className="bk-area-side">
        <span className="bk-index-label">Inhalt</span>
        <ContentIndex currentId={area.id} />
      </aside>

      <div className="bk-area-main">
        <span className="bk-chapter">Kapitel {no}</span>
        <h1 className="bk-area-title">{area.title}</h1>
        <p className="bk-area-short">{area.short} · {exerciseCount(area)} {area.unit}</p>

        {area.sections.map((section) => (
          <section key={section.name} className="bk-area-section" aria-labelledby={`sec-${section.name}`}>
            {area.sections.length > 1 && <h2 id={`sec-${section.name}`} className="bk-section-title">{section.name}</h2>}
            <div className="bk-topics">
              {section.items.map((it) => {
                n += 1
                return (
                  <Link key={it.path} to={it.path} className="bk-topic">
                    <span className="bk-topic-no">{no}.{n}</span>
                    <span className="bk-topic-text">
                      <strong>{it.title}</strong>
                      <small>{it.desc}</small>
                    </span>
                    <i className="fa-solid fa-chevron-right" aria-hidden="true" />
                  </Link>
                )
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}

import { useEffect, useState, type ReactNode } from 'react'
import { SOCIAL, type Social } from '../../lineare_funktionen/lernsituation_kit/kit'
import './etappen.css'

// Großphasen einer Lernsituation mit eigener Optik je Phasentyp (vorerst nur in Lernsituation 1 „Torbogen“ im Einsatz):
// Jede Phase hat Farbe und Icon, beginnt mit „Das machst du jetzt / Wozu“ und erscheint in der mitlaufenden Fortschrittsleiste.

export type EtappeArt = 'start' | 'problem' | 'loesen' | 'sichern'

const ART: Record<EtappeArt, { icon: string }> = {
  start: { icon: 'fa-toolbox' },
  problem: { icon: 'fa-bullseye' },
  loesen: { icon: 'fa-lightbulb' },
  sichern: { icon: 'fa-thumbtack' },
}

export type EtappeInfo = { id: string; art: EtappeArt; title: string }

/** Mitlaufende Fortschrittsleiste: zeigt alle Phasen und hebt die aktuelle hervor */
export function Fortschritt({ etappen }: { etappen: EtappeInfo[] }) {
  const [aktiv, setAktiv] = useState(etappen[0]?.id)
  useEffect(() => {
    const update = () => {
      // aktuelle Phase = letzte, deren Anfang schon oben durchgescrollt ist
      const grenze = window.innerHeight * 0.35
      let id = etappen[0]?.id
      for (const e of etappen) {
        const el = document.getElementById(e.id)
        if (el && el.getBoundingClientRect().top <= grenze) id = e.id
      }
      setAktiv(id)
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [etappen])
  const idx = etappen.findIndex((e) => e.id === aktiv)
  return (
    <nav className="et-bar" aria-label="Phasen der Lernsituation">
      <ol>
        {etappen.map((e, i) => (
          <li key={e.id} className={`et-bar-${e.art}${i === idx ? ' et-bar-on' : ''}${i < idx ? ' et-bar-done' : ''}`}>
            <a href={`#${e.id}`} aria-current={i === idx ? 'step' : undefined}>
              <span className="et-bar-no">{i < idx ? <i className="fa-solid fa-check" aria-hidden="true" /> : i + 1}</span>
              <span className="et-bar-title">{e.title}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}

/** Großphase mit farbigem Kopf, Sozialform, Zeit und dem Kasten „Das machst du jetzt / Wozu“ */
export function Etappe({
  id,
  no,
  total,
  art,
  title,
  social,
  minutes,
  was,
  wozu,
  children,
}: {
  id: string
  no: number
  total: number
  art: EtappeArt
  title: string
  social: Social
  minutes: number
  was: ReactNode
  wozu: ReactNode
  children: ReactNode
}) {
  return (
    <section id={id} className={`et et-${art}`} aria-labelledby={`${id}-h`}>
      <header className="et-head">
        <span className="et-icon">
          <i className={`fa-solid ${ART[art].icon}`} aria-hidden="true" />
        </span>
        <div className="et-head-text">
          <span className="et-kicker">
            Phase {no} von {total}
          </span>
          <h2 id={`${id}-h`}>{title}</h2>
        </div>
        <div className="et-meta">
          <SocialChip social={social} />
          <span className="ls-chip">
            <i className="fa-regular fa-clock" aria-hidden="true" /> ca. {minutes} min
          </span>
        </div>
      </header>
      <div className="et-body">
        <div className="et-auftrag">
          <div>
            <strong>Das machst du jetzt:</strong> {was}
          </div>
          <div>
            <strong>Wozu:</strong> {wozu}
          </div>
        </div>
        {children}
      </div>
    </section>
  )
}

/** Abschnitt innerhalb einer Phase, z. B. Austausch mit anderer Sozialform */
export function Teil({ title, social, minutes, children }: { title: string; social?: Social; minutes?: number; children: ReactNode }) {
  return (
    <div className="et-teil">
      <div className="et-teil-head">
        <h3>{title}</h3>
        {social && <SocialChip social={social} />}
        {minutes && (
          <span className="ls-chip">
            <i className="fa-regular fa-clock" aria-hidden="true" /> ca. {minutes} min
          </span>
        )}
      </div>
      {children}
    </div>
  )
}

function SocialChip({ social }: { social: Social }) {
  return (
    <span className="ls-chip ls-chip-social">
      <i className={`fa-solid ${SOCIAL[social].icon}`} aria-hidden="true" /> {SOCIAL[social].label}
    </span>
  )
}

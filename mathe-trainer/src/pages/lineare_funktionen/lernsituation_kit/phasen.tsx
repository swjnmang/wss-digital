import { useEffect, useState, type ReactNode } from 'react'
import { SOCIAL, type Social } from './kit'
import './phasen.css'

// Die vier festen Phasen jeder Lernsituation. Namen und Reihenfolge stehen nur hier:
// 1 Warm-up → 2 Problem erkennen → 3 Problem lösen → 4 Wissen prüfen und vertiefen.
// Jede Phase hat Farbe und Icon, beginnt mit „Das machst du jetzt / Wozu“ und erscheint in der mitlaufenden Fortschrittsleiste.
// Abschnitte innerhalb einer Phase (z. B. Austausch, Check) sind <Teil> mit eigener Sozialform und Zeit.

export type PhaseArt = 'start' | 'problem' | 'loesen' | 'sichern'

export const PHASEN: { art: PhaseArt; title: string; icon: string }[] = [
  { art: 'start', title: 'Warm-up', icon: 'fa-toolbox' },
  { art: 'problem', title: 'Problem erkennen', icon: 'fa-bullseye' },
  { art: 'loesen', title: 'Problem lösen', icon: 'fa-lightbulb' },
  { art: 'sichern', title: 'Wissen prüfen und vertiefen', icon: 'fa-thumbtack' },
]

const phaseId = (prefix: string, art: PhaseArt) => `${prefix}-${art}`

/** Mitlaufende Fortschrittsleiste: zeigt alle vier Phasen und hebt die aktuelle hervor (für lange Scrollseiten) */
export function Fortschritt({ prefix }: { prefix: string }) {
  const [aktiv, setAktiv] = useState<PhaseArt>('start')
  useEffect(() => {
    const update = () => {
      // aktuelle Phase = letzte, deren Anfang schon oben durchgescrollt ist
      const grenze = window.innerHeight * 0.35
      let art: PhaseArt = 'start'
      for (const p of PHASEN) {
        const el = document.getElementById(phaseId(prefix, p.art))
        if (el && el.getBoundingClientRect().top <= grenze) art = p.art
      }
      setAktiv(art)
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [prefix])
  const idx = PHASEN.findIndex((p) => p.art === aktiv)
  return (
    <nav className="et-bar" aria-label="Phasen der Lernsituation">
      <ol>
        {PHASEN.map((p, i) => (
          <li key={p.art} className={`et-bar-${p.art}${i === idx ? ' et-bar-on' : ''}${i < idx ? ' et-bar-done' : ''}`}>
            <a href={`#${phaseId(prefix, p.art)}`} aria-current={i === idx ? 'step' : undefined}>
              <span className="et-bar-no">{i < idx ? <i className="fa-solid fa-check" aria-hidden="true" /> : i + 1}</span>
              <span className="et-bar-title">{p.title}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}

/** Eine der vier Phasen mit farbigem Kopf, Sozialform, Zeit und dem Kasten „Das machst du jetzt / Wozu“ */
export function Etappe({
  prefix,
  art,
  social,
  minutes,
  was,
  wozu,
  children,
}: {
  /** Kurzname der Lernsituation, bildet die Sprungmarke (gleich wie bei <Fortschritt>) */
  prefix: string
  art: PhaseArt
  /** Sozialform der ganzen Phase; bei wechselnden Sozialformen weglassen und in den Teilen angeben */
  social?: Social
  minutes?: number
  was?: ReactNode
  wozu?: ReactNode
  children: ReactNode
}) {
  const no = PHASEN.findIndex((p) => p.art === art) + 1
  const phase = PHASEN[no - 1]
  const id = phaseId(prefix, art)
  return (
    <section id={id} className={`et et-${art}`} aria-labelledby={`${id}-h`}>
      <header className="et-head">
        <span className="et-icon">
          <i className={`fa-solid ${phase.icon}`} aria-hidden="true" />
        </span>
        <div className="et-head-text">
          <span className="et-kicker">
            Phase {no} von {PHASEN.length}
          </span>
          <h2 id={`${id}-h`}>{phase.title}</h2>
        </div>
        <div className="et-meta">
          {social && <SocialChip social={social} />}
          {minutes && (
            <span className="ls-chip">
              <i className="fa-regular fa-clock" aria-hidden="true" /> ca. {minutes} min
            </span>
          )}
        </div>
      </header>
      <div className="et-body">
        {(was || wozu) && (
          <div className="et-auftrag">
            {was && (
              <div>
                <strong>Das machst du jetzt:</strong> {was}
              </div>
            )}
            {wozu && (
              <div>
                <strong>Wozu:</strong> {wozu}
              </div>
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  )
}

/** Abschnitt innerhalb einer Phase, z. B. Austausch oder Check, mit eigener Sozialform und Zeit */
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

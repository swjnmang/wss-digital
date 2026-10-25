import { useId, useState, type ChangeEvent, type ReactNode } from 'react'
import { VideoEmbed } from '../../../components/VideoButton'
import { fmt } from '../../daten_und_zufall/lernpfad/kit'
import './zins_kit.css'

// Gemeinsame Bausteine der Lernsituationen zur Zins- und Zinseszinsrechnung im ruhigen Grunddesign
// (Seitenansicht, eine Spalte): Zitat einer Person, Festlegung (Vermutung), Erklärvideo zum Aufklappen, Kriterienliste.

/** Eurobetrag als Text, z. B. „47,36 €“ */
export const euro = (v: number) => `${fmt(v, 2, true)} €`

/** Aussage einer Person aus der Situation, ohne Kasten: Name und Text */
export function Zitat({ wer, children }: { wer: string; children: ReactNode }) {
  return (
    <figure className="zk-zitat">
      <figcaption>{wer}</figcaption>
      <blockquote>{children}</blockquote>
    </figure>
  )
}

/** Erklärvideo, erst auf Knopfdruck sichtbar */
export function VideoAufklappen({ src, title, label = 'Erklärvideo ansehen' }: { src: string; title: string; label?: string }) {
  const [offen, setOffen] = useState(false)
  return (
    <div className="zk-video">
      <div>
        <button type="button" className="bk-btn bk-btn-sm" onClick={() => setOffen((o) => !o)} aria-expanded={offen}>
          <i className="fa-solid fa-circle-play" aria-hidden="true" /> {offen ? 'Video schließen' : label}
        </button>
      </div>
      {offen && <VideoEmbed src={src} title={title} />}
    </div>
  )
}

export type Festlegung<C extends string> = { wahl: C | null; wert: number; fest: boolean }

/**
 * Festlegung vor dem Rechnen: optional eine Auswahl, dazu eine Schätzung per Regler.
 * onFest wird beim Festhalten aufgerufen (schaltet in der Seitenansicht „Weiter“ frei).
 */
export function Vermutung<C extends string>({
  optionen,
  regler,
  wert,
  onChange,
  onFest,
  gespeichert,
}: {
  optionen?: Record<C, string>
  regler: { text: (v: number) => ReactNode; min: number; max: number; step: number }
  wert: Festlegung<C>
  onChange: (w: Festlegung<C>) => void
  onFest: () => void
  gespeichert: (w: Festlegung<C>) => ReactNode
}) {
  const uid = useId()
  if (wert.fest) {
    return (
      <div className="zk-vermutung" data-no-autocheck>
        <p className="ls-saved" role="status">
          <i className="fa-solid fa-lock" aria-hidden="true" /> {gespeichert(wert)} Am Ende schaust du, ob du recht hattest.
        </p>
        <div>
          <button type="button" className="bk-btn bk-btn-sm bk-btn-ghost" onClick={() => onChange({ ...wert, fest: false })}>
            Vermutung ändern
          </button>
        </div>
      </div>
    )
  }
  const keys = optionen ? (Object.keys(optionen) as C[]) : []
  return (
    <div className="zk-vermutung" data-no-autocheck>
      {optionen && (
        <div className="ls-options" role="radiogroup" aria-label="Deine Vermutung">
          {keys.map((c) => (
            <label key={c} className="bk-choice ls-option">
              <input type="radio" name={`${uid}-wahl`} checked={wert.wahl === c} onChange={() => onChange({ ...wert, wahl: c })} />
              <span>{optionen[c]}</span>
            </label>
          ))}
        </div>
      )}
      <div className="ls-slider">
        <label htmlFor={`${uid}-r`}>{regler.text(wert.wert)}</label>
        <input
          id={`${uid}-r`}
          type="range"
          min={regler.min}
          max={regler.max}
          step={regler.step}
          value={wert.wert}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onChange({ ...wert, wert: Number(e.target.value) })}
        />
      </div>
      <div>
        <button
          type="button"
          className="bk-btn bk-btn-primary"
          disabled={!!optionen && !wert.wahl}
          onClick={() => {
            onChange({ ...wert, fest: true })
            onFest()
          }}
        >
          <i className="fa-solid fa-lock" aria-hidden="true" /> Vermutung festhalten
        </button>
      </div>
    </div>
  )
}

/** Kriterien zum Abhaken; onAlle, sobald alle abgehakt sind */
export function Kriterien({ items, onAlle }: { items: ReactNode[]; onAlle: () => void }) {
  const [haken, setHaken] = useState(items.map(() => false))
  return (
    <div className="ls-criteria">
      {items.map((c, i) => (
        <label key={i}>
          <input
            type="checkbox"
            checked={haken[i]}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              const neu = haken.map((h, j) => (j === i ? e.target.checked : h))
              setHaken(neu)
              if (neu.every(Boolean)) onAlle()
            }}
          />{' '}
          <span>{c}</span>
        </label>
      ))}
    </div>
  )
}

/** Gegeben / gesucht als ruhige Liste */
export function GegebenGesucht({ gegeben, gesucht }: { gegeben: ReactNode; gesucht: ReactNode }) {
  return (
    <dl className="zk-gg">
      <dt>Gegeben</dt>
      <dd>{gegeben}</dd>
      <dt>Gesucht</dt>
      <dd>{gesucht}</dd>
    </dl>
  )
}

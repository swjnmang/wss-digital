import { useEffect, useState } from 'react'
import type { Aufgabe } from './typen'
import { auswerten, lob, type Ergebnis } from './pruefen'
import { MathLines, MathText } from './MathText'
import Figur from './figuren'
import { fieldCheckClass } from '../../../utils/fieldCheck'

// Eine Kopfrechenaufgabe. Üben: eigener „Prüfen“-Knopf, Lob bzw. Hinweis, Lösungsweg auf Wunsch.
// Prüfung: erst nach dem Abgeben wird ausgewertet und der Lösungsweg gezeigt.
// Begründungs-/Schätzaufgaben (type 'self') werden im Heft gelöst und mit der Musterlösung selbst eingeschätzt.

interface Props {
  aufgabe: Aufgabe
  nr: string
  modus: 'ueben' | 'pruefung'
  /** Prüfung: Teil A wurde abgegeben */
  abgegeben?: boolean
  /** gemeldete Punkte (Prüfung: nach Auswertung bzw. Selbsteinschätzung; Üben: nach jedem Prüfen) */
  onPunkte?: (id: string, punkte: number, richtig: boolean) => void
}

export default function AufgabeKarte({ aufgabe: a, nr, modus, abgegeben = false, onPunkte }: Props) {
  const [antworten, setAntworten] = useState<string[]>([])
  const [ergebnis, setErgebnis] = useState<Ergebnis | null>(null)
  const [loesungOffen, setLoesungOffen] = useState(false)
  const [selbst, setSelbst] = useState<'stimmt' | 'nicht' | null>(null)
  const [lobText] = useState(lob)
  const pruefung = modus === 'pruefung'

  // Prüfung: beim Abgeben auswerten
  useEffect(() => {
    if (!pruefung || !abgegeben) return
    setLoesungOffen(true)
    if (a.type !== 'self') {
      const e = auswerten(a, antworten)
      setErgebnis(e)
      onPunkte?.(a.id, e.punkte, e.alleRichtig)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abgegeben])

  const setze = (i: number, v: string) => {
    if (pruefung && abgegeben) return
    setAntworten((alt) => {
      const neu = [...alt]
      neu[i] = v
      return neu
    })
    if (!pruefung) setErgebnis(null)
  }

  const pruefen = () => {
    const e = auswerten(a, antworten)
    setErgebnis(e)
    onPunkte?.(a.id, e.punkte, e.alleRichtig)
  }

  const einschaetzen = (s: 'stimmt' | 'nicht') => {
    setSelbst(s)
    onPunkte?.(a.id, s === 'stimmt' ? a.points : 0, s === 'stimmt')
  }

  const ausgefuellt = a.type === 'mc' ? antworten[0] !== undefined : a.type === 'num' ? a.fields.every((_, i) => (antworten[i] ?? '').trim() !== '') : true
  const feldZustand = (i: number) => (ergebnis ? ergebnis.felder[i] : null)
  const gesperrt = pruefung && abgegeben

  return (
    <article className="bk-panel bk-stack" style={{ gap: 14 }}>
      <header style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
        <span className="bk-num">{nr}</span>
        {a.quelle && <span className="bk-label" style={{ letterSpacing: '.04em' }}>{a.quelle}</span>}
        <span style={{ marginLeft: 'auto', fontSize: 14, color: 'var(--ink-muted)' }}>
          {ergebnis && pruefung ? `${String(ergebnis.punkte).replace('.', ',')} / ` : selbst && pruefung ? `${selbst === 'stimmt' ? a.points : 0} / ` : ''}
          {a.points} {a.points === 1 ? 'Punkt' : 'Punkte'}
        </span>
      </header>

      <MathLines lines={a.text} className="bk-ka-text" />
      {a.figur && <div style={{ maxWidth: 460 }}><Figur figur={a.figur} /></div>}

      {a.type === 'mc' && (
        <div className="bk-ka-options" role="radiogroup" aria-label="Antwort auswählen">
          {a.options.map((o, i) => {
            const gewaehlt = antworten[0] === String(i)
            const zustand = ergebnis && gewaehlt ? ergebnis.felder[0] : loesungOffen && i === a.correct && ergebnis ? true : null
            return (
              <button
                key={i}
                type="button"
                role="radio"
                aria-checked={gewaehlt}
                disabled={gesperrt}
                className={`bk-choice bk-ka-option${gewaehlt ? ' bk-choice-on' : ''} ${fieldCheckClass(zustand)}`}
                onClick={() => setze(0, String(i))}
              >
                <b>{String.fromCharCode(65 + i)}</b>
                <span><MathText text={o} /></span>
              </button>
            )
          })}
        </div>
      )}

      {a.type === 'num' && (
        <div className="bk-ka-fields">
          {a.fields.map((f, i) => (
            <label key={i} className="bk-ka-field">
              {f.label && <span className="bk-ka-label"><MathText text={f.label} /></span>}
              {f.choices ? (
                <select className={`bk-input bk-ka-input ${fieldCheckClass(feldZustand(i))}`} value={antworten[i] ?? ''} disabled={gesperrt} onChange={(e) => setze(i, e.target.value)}>
                  <option value="">–</option>
                  {f.choices.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              ) : (
                <input
                  className={`bk-input bk-ka-input ${fieldCheckClass(feldZustand(i))}`}
                  inputMode="decimal"
                  autoComplete="off"
                  value={antworten[i] ?? ''}
                  disabled={gesperrt}
                  onChange={(e) => setze(i, e.target.value)}
                  aria-label={f.label ? f.label.replace(/\$|\\[a-z]+|[{}_^]/g, '').replace(/\s+/g, ' ').trim() : 'Ergebnis'}
                />
              )}
              {f.unit && <span className="bk-ka-unit">{f.unit}</span>}
            </label>
          ))}
        </div>
      )}

      {a.type === 'self' && !loesungOffen && (
        <p className="bk-feedback bk-feedback-info" style={{ margin: 0 }}>
          <i className="fa-solid fa-pen" aria-hidden="true" />
          {pruefung ? 'Löse diese Aufgabe im Heft. Nach dem Abgeben vergleichst du mit der Musterlösung.' : 'Löse diese Aufgabe im Heft und vergleiche dann mit der Musterlösung.'}
        </p>
      )}

      {!pruefung && (
        <div className="bk-actions">
          {a.type !== 'self' && (
            <button type="button" className="bk-btn bk-btn-primary" onClick={pruefen} disabled={!ausgefuellt}>Prüfen</button>
          )}
          <button type="button" className="bk-btn" onClick={() => setLoesungOffen((o) => !o)}>
            <i className="fa-solid fa-lightbulb" aria-hidden="true" /> {loesungOffen ? 'Lösungsweg ausblenden' : a.type === 'self' ? 'Musterlösung zeigen' : 'Lösungsweg zeigen'}
          </button>
        </div>
      )}

      {ergebnis && (
        <div className={`bk-feedback ${ergebnis.alleRichtig ? 'bk-feedback-ok' : 'bk-feedback-no'}`} role="status">
          <i className={`fa-solid ${ergebnis.alleRichtig ? 'fa-circle-check' : 'fa-circle-xmark'}`} aria-hidden="true" />
          <span>
            {ergebnis.alleRichtig
              ? lobText
              : pruefung
                ? 'Nicht ganz richtig – sieh dir den Lösungsweg an.'
                : 'Leider noch nicht richtig. Prüfe deine Rechnung oder sieh dir den Lösungsweg an.'}
          </span>
        </div>
      )}

      {loesungOffen && (
        <section className="bk-solution" style={{ marginTop: 0 }}>
          <h3 className="bk-solution-title">{a.type === 'self' ? 'Musterlösung' : 'Lösungsweg'}</h3>
          {a.type === 'mc' && <p style={{ margin: '0 0 8px', fontWeight: 700 }}>Lösung {String.fromCharCode(65 + a.correct)}</p>}
          <MathLines lines={a.loesung} />
          {a.type === 'self' && (pruefung ? abgegeben : true) && (
            <div className="bk-actions" style={{ marginTop: 12 }}>
              <span style={{ fontWeight: 700 }}>Deine Lösung …</span>
              <button type="button" className={`bk-btn bk-btn-sm ${selbst === 'stimmt' ? 'bk-field-ok' : ''}`} aria-pressed={selbst === 'stimmt'} onClick={() => einschaetzen('stimmt')}>
                <i className="fa-solid fa-check" aria-hidden="true" /> stimmt
              </button>
              <button type="button" className={`bk-btn bk-btn-sm ${selbst === 'nicht' ? 'bk-field-no' : ''}`} aria-pressed={selbst === 'nicht'} onClick={() => einschaetzen('nicht')}>
                <i className="fa-solid fa-xmark" aria-hidden="true" /> stimmt nicht
              </button>
            </div>
          )}
          {a.type === 'self' && selbst === 'stimmt' && !pruefung && <p className="bk-feedback bk-feedback-ok" style={{ marginTop: 10 }}>{lobText}</p>}
        </section>
      )}
    </article>
  )
}

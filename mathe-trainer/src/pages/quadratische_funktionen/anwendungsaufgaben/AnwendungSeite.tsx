import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import TaskShell from '../../../components/layout/TaskShell'
import { MathLines, MathText } from '../../abschlusspruefung/kopfrechnen/MathText'
import { feldRichtig, lob } from '../../abschlusspruefung/kopfrechnen/pruefen'
import { fieldCheckClass } from '../../../utils/fieldCheck'
import { ANWENDUNGEN, anwendungBySlug, type GesuchteGleichung, type Teil } from './aufgaben'
import GleichungEingabe from '../../../components/GleichungEingabe'
import { checkLinearEquation } from '../../../utils/parseLinearEquation'
import { checkQuadraticEquation, type EquationCheck } from '../../../utils/parseFunctionEquation'
import Skizze from './skizzen'

// Anwendungsaufgabe „Funktionaler Zusammenhang“ wie in Teil B der Abschlussprüfung (15 Punkte).
// Tablet quer: Skizze links (bleibt stehen), Teilaufgaben rechts. Jede Teilaufgabe wird einzeln geprüft (Felder grün/rot),
// danach Lösungsweg mit KaTeX nach Merkhilfe.

const UEBERSICHT = '/quadratische_funktionen/anwendungsaufgaben'

/** Eingetippte Funktionsgleichung prüfen (Gerade: m und t, Parabel: a, b und c; jede Schreibweise zählt) */
function pruefeGleichung(g: GesuchteGleichung, eingabe: string): EquationCheck {
  return 'm' in g ? checkLinearEquation(eingabe, g.m, g.t, 0.01) : checkQuadraticEquation(eingabe, { a: g.a, b: g.b, c: g.c }, 'beliebig', 0.01)
}

function TeilKarte({ teil, onPunkte }: { teil: Teil; onPunkte: (p: number) => void }) {
  const [werte, setWerte] = useState<string[]>([])
  const [zustand, setZustand] = useState<boolean[] | null>(null)
  const [loesung, setLoesung] = useState(false)
  const [lobText] = useState(lob)
  // Funktionsgleichung als Ganzes (Teil.gleichung): Eingabe und Rückmeldung
  const [gleichung, setGleichung] = useState('')
  const [gleichungCheck, setGleichungCheck] = useState<EquationCheck | null>(null)

  const setze = (i: number, v: string) => {
    setWerte((alt) => { const neu = [...alt]; neu[i] = v; return neu })
    setZustand(null)
  }
  const pruefen = () => {
    if (teil.gleichung) {
      const r = pruefeGleichung(teil.gleichung, gleichung)
      setGleichungCheck(r)
      setZustand([r.status === 'ok'])
      onPunkte(r.status === 'ok' ? teil.punkte : 0)
      return
    }
    const z = teil.felder.map((f, i) => feldRichtig(f, werte[i]))
    setZustand(z)
    const anteil = z.filter(Boolean).length / z.length
    onPunkte(Math.floor(teil.punkte * anteil * 2) / 2)
  }
  const alleRichtig = zustand?.every(Boolean) ?? false

  return (
    <article className="bk-panel bk-stack" style={{ gap: 12 }}>
      {teil.vorher && <MathLines lines={teil.vorher} className="bk-anw-vorher" />}
      <header style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
        <span className="bk-num">{teil.nr}</span>
        <span style={{ marginLeft: 'auto', fontSize: 14, color: 'var(--ink-muted)' }}>{teil.punkte} {teil.punkte === 1 ? 'Punkt' : 'Punkte'}</span>
      </header>
      <MathLines lines={teil.text} className="bk-ka-text" />
      {teil.gleichung && (
        <div className="bk-ka-field">
          <span className="bk-ka-label"><MathText text={teil.gleichung.name} /></span>
          <GleichungEingabe
            quadratisch={'a' in teil.gleichung}
            value={gleichung}
            onChange={(v) => {
              setGleichung(v)
              setZustand(null)
              setGleichungCheck(null)
            }}
            placeholder={'a' in teil.gleichung ? 'z. B. y = −0,2x² + 1,5x + 2' : 'z. B. y = 0,5x − 3'}
            className={fieldCheckClass(zustand ? zustand[0] : null)}
          />
        </div>
      )}
      <div className="bk-ka-fields">
        {teil.felder.map((f, i) => (
          <label key={i} className="bk-ka-field">
            {f.label && <span className="bk-ka-label"><MathText text={f.label} /></span>}
            {f.choices ? (
              <select className={`bk-input bk-ka-input ${fieldCheckClass(zustand ? zustand[i] : null)}`} value={werte[i] ?? ''} onChange={(e) => setze(i, e.target.value)}>
                <option value="">–</option>
                {f.choices.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            ) : (
              <input
                className={`bk-input bk-ka-input ${fieldCheckClass(zustand ? zustand[i] : null)}`}
                inputMode="decimal"
                autoComplete="off"
                value={werte[i] ?? ''}
                onChange={(e) => setze(i, e.target.value)}
                aria-label={f.label ? f.label.replace(/\$|\\[a-z]+|[{}_^]/g, '').replace(/\s+/g, ' ').trim() : 'Ergebnis'}
              />
            )}
            {f.unit && <span className="bk-ka-unit">{f.unit}</span>}
          </label>
        ))}
      </div>
      <div className="bk-actions">
        <button type="button" className="bk-btn bk-btn-primary" onClick={pruefen}>Prüfen</button>
        <button type="button" className="bk-btn" onClick={() => setLoesung((o) => !o)}>
          <i className="fa-solid fa-lightbulb" aria-hidden="true" /> {loesung ? 'Lösungsweg ausblenden' : 'Lösungsweg zeigen'}
        </button>
      </div>
      {zustand && (
        <div className={`bk-feedback ${alleRichtig ? 'bk-feedback-ok' : 'bk-feedback-no'}`} role="status">
          <i className={`fa-solid ${alleRichtig ? 'fa-circle-check' : 'fa-circle-xmark'}`} aria-hidden="true" />
          <span>{alleRichtig ? lobText : gleichungCheck ? gleichungCheck.text : 'Noch nicht alles richtig – rot markierte Felder prüfen oder den Lösungsweg ansehen. Runde auf zwei Nachkommastellen.'}</span>
        </div>
      )}
      {loesung && (
        <section className="bk-solution" style={{ marginTop: 0 }}>
          <h3 className="bk-solution-title">Lösungsweg</h3>
          <MathLines lines={teil.loesung} />
        </section>
      )}
    </article>
  )
}

export default function AnwendungSeite() {
  const { slug } = useParams()
  // eigener Zustand je Aufgabe (Punkte, Eingaben) – beim Wechsel zur nächsten Aufgabe neu
  return <AnwendungInhalt key={slug} slug={slug} />
}

function AnwendungInhalt({ slug }: { slug?: string }) {
  const a = anwendungBySlug(slug)
  const [punkte, setPunkte] = useState<Record<string, number>>({})

  if (!a) {
    return (
      <TaskShell title="Anwendungsaufgabe" parent={{ to: UEBERSICHT, label: 'Anwendungsaufgaben' }}>
        <p>Diese Aufgabe gibt es nicht. <Link to={UEBERSICHT}>Zur Übersicht</Link></p>
      </TaskShell>
    )
  }

  const summe = Object.values(punkte).reduce((s, p) => s + p, 0)
  const idx = ANWENDUNGEN.indexOf(a)
  const naechste = ANWENDUNGEN[(idx + 1) % ANWENDUNGEN.length]

  return (
    <TaskShell
      title={a.titel}
      subtitle={`Funktionaler Zusammenhang · ${a.quelle} · 15 Punkte`}
      parent={{ to: UEBERSICHT, label: 'Anwendungsaufgaben' }}
      width="full"
    >
      <div className="bk-anw">
        <div className="bk-anw-skizze bk-panel bk-stack">
          <MathLines lines={a.intro} className="bk-ka-text" />
          <Skizze name={a.skizze} />
        </div>
        <div className="bk-stack">
          {a.teile.map((t) => (
            <TeilKarte key={`${a.slug}-${t.nr}`} teil={t} onPunkte={(p) => setPunkte((alt) => ({ ...alt, [t.nr]: p }))} />
          ))}
          <div className="bk-panel bk-actions" style={{ justifyContent: 'space-between' }} role="status">
            <strong style={{ fontSize: 18 }}>{String(summe).replace('.', ',')} von 15 Punkten</strong>
            <Link to={`${UEBERSICHT}/${naechste.slug}`} className="bk-btn">
              Nächste Aufgabe: {naechste.titel} <i className="fa-solid fa-arrow-right" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </TaskShell>
  )
}

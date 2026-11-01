import { useCallback, useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { InlineMath } from 'react-katex'
import 'katex/dist/katex.min.css'
import TaskShell from '../../../components/layout/TaskShell'
import {
  AMPEL_TEXT,
  AUFGABEN_JE_BEREICH,
  BEREICHE,
  DAUER_MINUTEN,
  erzeugeTest,
  istRichtig,
  werteAus,
  type Ampel,
  type TestAufgabe,
} from './aufgaben'
import { ladePdf } from './pdf'
import './einstufungstest.css'

// Einstufungstest „Rechnen lernen“: Name eingeben → 45 Minuten Zeit für 28 Zufallsaufgaben (ohne Rückmeldung,
// ohne Hilfen, ohne Lösungsweg) → Auswertung mit Ampel je Bereich, Links zu den Übungen und PDF zum Herunterladen.
// Der Stand liegt im localStorage, damit Neuladen den Test nicht zurücksetzt; die Zeit läuft ab dem Start weiter.

const SPEICHER = 'mt-einstufungstest-v1'
const DAUER_MS = DAUER_MINUTEN * 60 * 1000

export interface TestStand {
  phase: 'start' | 'test' | 'ergebnis'
  name: string
  start: number
  ende: number
  zeitAbgelaufen: boolean
  aufgaben: TestAufgabe[]
  antworten: Record<string, string>
}

const LEER: TestStand = { phase: 'start', name: '', start: 0, ende: 0, zeitAbgelaufen: false, aufgaben: [], antworten: {} }

function lade(): TestStand {
  try {
    const roh = localStorage.getItem(SPEICHER)
    if (!roh) return LEER
    const s = JSON.parse(roh) as TestStand
    if (s.phase === 'test' && Date.now() >= s.start + DAUER_MS) {
      return { ...s, phase: 'ergebnis', ende: s.start + DAUER_MS, zeitAbgelaufen: true }
    }
    return s
  } catch {
    return LEER
  }
}

function speichere(s: TestStand) {
  try {
    localStorage.setItem(SPEICHER, JSON.stringify(s))
  } catch {
    /* Speicher nicht verfügbar – Test läuft trotzdem */
  }
}

const mmss = (ms: number) => {
  const s = Math.max(0, Math.ceil(ms / 1000))
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}
export const dauerText = (ms: number) => {
  const min = Math.floor(ms / 60000)
  const sek = Math.round((ms % 60000) / 1000)
  return `${min} min ${sek} s`
}
export const datumText = (t: number) =>
  new Date(t).toLocaleString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })

const AMPEL_KLASSE: Record<Ampel, string> = { gruen: 'et-gruen', gelb: 'et-gelb', rot: 'et-rot' }

/** Aufgabe anzeigen (Text und/oder KaTeX) */
function AufgabeAnzeige({ a }: { a: TestAufgabe }) {
  return (
    <>
      <p className="et-frage">{a.frage}</p>
      {a.text && <p className="et-term">{a.text}</p>}
      {a.tex && (
        <div className="et-tex">
          <InlineMath math={a.tex} />
        </div>
      )}
    </>
  )
}

export default function Einstufungstest() {
  const [stand, setStandRoh] = useState<TestStand>(lade)
  const [jetzt, setJetzt] = useState(Date.now())
  const [nameEingabe, setNameEingabe] = useState('')

  const setStand = useCallback((f: (s: TestStand) => TestStand) => {
    setStandRoh((alt) => {
      const neu = f(alt)
      speichere(neu)
      return neu
    })
  }, [])

  const abgeben = useCallback(
    (zeitAbgelaufen: boolean) => {
      setStand((s) => (s.phase !== 'test' ? s : { ...s, phase: 'ergebnis', ende: zeitAbgelaufen ? s.start + DAUER_MS : Date.now(), zeitAbgelaufen }))
      window.scrollTo({ top: 0 })
    },
    [setStand],
  )

  // Uhr: jede Sekunde; nach Ablauf wird automatisch abgegeben
  useEffect(() => {
    if (stand.phase !== 'test') return
    const t = window.setInterval(() => setJetzt(Date.now()), 1000)
    return () => window.clearInterval(t)
  }, [stand.phase])
  const rest = stand.start + DAUER_MS - jetzt
  useEffect(() => {
    if (stand.phase === 'test' && rest <= 0) abgeben(true)
  }, [stand.phase, rest, abgeben])

  const starten = (e: FormEvent) => {
    e.preventDefault()
    const name = nameEingabe.trim()
    if (!name) return
    const start = Date.now()
    setJetzt(start)
    setStand(() => ({ phase: 'test', name, start, ende: 0, zeitAbgelaufen: false, aufgaben: erzeugeTest(), antworten: {} }))
    window.scrollTo({ top: 0 })
  }

  const neuStarten = () => {
    if (!window.confirm('Ergebnis verwerfen und einen neuen Test beginnen? Lade dir vorher das PDF herunter, wenn du dein Ergebnis behalten möchtest.')) return
    setNameEingabe(stand.name)
    setStand(() => LEER)
  }

  if (stand.phase === 'start') return <Startseite name={nameEingabe} setName={setNameEingabe} starten={starten} />
  if (stand.phase === 'test') return <Test stand={stand} rest={rest} setStand={setStand} abgeben={() => abgeben(false)} />
  return <Ergebnis stand={stand} neuStarten={neuStarten} />
}

// ---------- Start ----------

function Startseite({ name, setName, starten }: { name: string; setName: (s: string) => void; starten: (e: FormEvent) => void }) {
  return (
    <TaskShell title="Einstufungstest" subtitle="Finde heraus, was du schon kannst – und wo du noch üben solltest." width="wide">
      <div className="et-wrap">
        <section className="et-karte">
          <h2>So läuft der Test ab</h2>
          <ul className="et-liste">
            <li>
              <strong>{BEREICHE.length * AUFGABEN_JE_BEREICH} Aufgaben</strong> aus {BEREICHE.length} Bereichen: {BEREICHE.map((b) => b.name).join(', ')} – je{' '}
              {AUFGABEN_JE_BEREICH} Aufgaben.
            </li>
            <li>
              Du hast <strong>{DAUER_MINUTEN} Minuten</strong> Zeit. Die Uhr startet, sobald du auf „Test starten“ tippst. Ist die Zeit um, wird der
              Test automatisch abgegeben.
            </li>
            <li>Ein Taschenrechner ist erlaubt. Rechne auf einem Blatt und gib nur die Ergebnisse ein.</li>
            <li>Während des Tests gibt es <strong>keine Rückmeldung, keine Hilfen und keine Lösungswege</strong>.</li>
            <li>Am Ende siehst du, welche Bereiche schon gut sitzen und welche du noch üben solltest, und kannst dein Ergebnis als PDF herunterladen.</li>
          </ul>
        </section>
        <form className="et-karte et-start" onSubmit={starten} data-no-autocheck>
          <label htmlFor="et-name">Dein Name</label>
          <input
            id="et-name"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
            placeholder="Vor- und Nachname"
            maxLength={60}
          />
          <button type="submit" className="bk-btn bk-btn-primary" disabled={!name.trim()}>
            Test starten <i className="fa-solid fa-play" aria-hidden="true" />
          </button>
        </form>
      </div>
    </TaskShell>
  )
}

// ---------- Test ----------

function Test({ stand, rest, setStand, abgeben }: { stand: TestStand; rest: number; setStand: (f: (s: TestStand) => TestStand) => void; abgeben: () => void }) {
  const beantwortet = stand.aufgaben.filter((a) => (stand.antworten[a.id] ?? '').trim()).length
  const gesamt = stand.aufgaben.length
  const knapp = rest < 5 * 60 * 1000

  const aendern = (id: string, wert: string) => setStand((s) => ({ ...s, antworten: { ...s.antworten, [id]: wert } }))

  const abgebenFragen = () => {
    const offen = gesamt - beantwortet
    const text = offen > 0 ? `Du hast ${offen} Aufgabe(n) noch nicht beantwortet. Trotzdem abgeben?` : 'Test jetzt abgeben?'
    if (window.confirm(text)) abgeben()
  }

  let nr = 0
  return (
    <TaskShell title="Einstufungstest" subtitle={`Viel Erfolg, ${stand.name}!`} width="wide">
      <div className="et-wrap" data-no-autocheck>
        <div className={`et-leiste${knapp ? ' et-knapp' : ''}`} role="timer" aria-live="off">
          <span className="et-uhr">
            <i className="fa-regular fa-clock" aria-hidden="true" /> noch {mmss(rest)}
          </span>
          <span className="et-fortschritt">
            {beantwortet} von {gesamt} beantwortet
          </span>
          <button type="button" className="bk-btn bk-btn-primary" onClick={abgebenFragen}>
            Test abgeben
          </button>
        </div>
        {knapp && <p className="et-warnung">Nur noch wenige Minuten – gib deine Ergebnisse ein!</p>}

        {BEREICHE.map((b, bi) => (
          <section key={b.id} className="et-bereich" aria-labelledby={`et-b-${b.id}`}>
            <h2 id={`et-b-${b.id}`}>
              {bi + 1}. {b.name}
            </h2>
            {stand.aufgaben
              .filter((a) => a.bereich === b.id)
              .map((a) => {
                nr += 1
                const f = a.feld
                return (
                  <div key={a.id} className="et-aufgabe">
                    <span className="et-nr">{nr}</span>
                    <div className="et-inhalt">
                      <AufgabeAnzeige a={a} />
                      <label className="et-eingabe">
                        <span>{f.label ?? 'Ergebnis:'}</span>
                        <input
                          type="text"
                          inputMode={f.art === 'zahl' ? 'decimal' : 'text'}
                          autoComplete="off"
                          value={stand.antworten[a.id] ?? ''}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => aendern(a.id, e.target.value)}
                          aria-label={`Antwort zu Aufgabe ${nr}`}
                        />
                        {f.art === 'zahl' && f.einheit && <span>{f.einheit}</span>}
                      </label>
                      {a.hinweis && <p className="et-hinweis">{a.hinweis}</p>}
                    </div>
                  </div>
                )
              })}
          </section>
        ))}

        <div className="et-ende">
          <p>
            {beantwortet} von {gesamt} Aufgaben beantwortet.
          </p>
          <button type="button" className="bk-btn bk-btn-primary" onClick={abgebenFragen}>
            Test abgeben
          </button>
        </div>
      </div>
    </TaskShell>
  )
}

// ---------- Ergebnis ----------

function Ergebnis({ stand, neuStarten }: { stand: TestStand; neuStarten: () => void }) {
  const auswertung = useMemo(() => werteAus(stand.aufgaben, stand.antworten), [stand.aufgaben, stand.antworten])
  const prozent = auswertung.gesamt ? Math.round((auswertung.richtig / auswertung.gesamt) * 100) : 0
  const ueben = [...auswertung.bereiche].filter((b) => b.ampel !== 'gruen').sort((x, y) => x.prozent - y.prozent)
  const [pdfLaeuft, setPdfLaeuft] = useState(false)

  const pdf = async () => {
    setPdfLaeuft(true)
    try {
      await ladePdf(stand)
    } finally {
      setPdfLaeuft(false)
    }
  }

  let nr = 0
  return (
    <TaskShell title="Einstufungstest: Auswertung" width="wide">
      <div className="et-wrap">
        {stand.zeitAbgelaufen && <p className="et-warnung">Die {DAUER_MINUTEN} Minuten sind abgelaufen – dein Test wurde automatisch abgegeben.</p>}

        <section className="et-karte et-kopf">
          <div>
            <p className="et-name">{stand.name}</p>
            <p className="et-meta">
              {datumText(stand.start)} · Bearbeitungszeit {dauerText(stand.ende - stand.start)}
            </p>
          </div>
          <div className="et-gesamt">
            <strong>
              {auswertung.richtig} / {auswertung.gesamt}
            </strong>
            <span>richtig ({prozent} %)</span>
          </div>
          <div className="et-knoepfe">
            <button type="button" className="bk-btn bk-btn-primary" onClick={pdf} disabled={pdfLaeuft}>
              <i className="fa-solid fa-file-pdf" aria-hidden="true" /> {pdfLaeuft ? 'PDF wird erstellt …' : 'Ergebnis als PDF herunterladen'}
            </button>
            <button type="button" className="bk-btn" onClick={neuStarten}>
              Neuen Test starten
            </button>
          </div>
        </section>

        <section className="et-karte">
          <h2>Deine Bereiche</h2>
          <div className="et-tabelle" role="table" aria-label="Ergebnis je Bereich">
            {auswertung.bereiche.map((b) => (
              <div key={b.bereich.id} className="et-zeile" role="row">
                <span className={`et-ampel ${AMPEL_KLASSE[b.ampel]}`} aria-hidden="true" />
                <span className="et-bname" role="cell">
                  {b.bereich.name}
                </span>
                <span role="cell">
                  {b.richtig} / {b.gesamt}
                </span>
                <span className={`et-urteil ${AMPEL_KLASSE[b.ampel]}`} role="cell">
                  {AMPEL_TEXT[b.ampel]}
                </span>
                <span className="et-links" role="cell">
                  {b.bereich.links.map((l) => (
                    <Link key={l.to} to={l.to}>
                      {l.label} <i className="fa-solid fa-arrow-right" aria-hidden="true" />
                    </Link>
                  ))}
                </span>
              </div>
            ))}
          </div>
          <p className="et-legende">
            <span className="et-ampel et-gruen" /> ab 75 % · <span className="et-ampel et-gelb" /> 50–74 % · <span className="et-ampel et-rot" /> unter 50 %
          </p>
        </section>

        <section className="et-karte">
          <h2>So schließt du deine Lücken</h2>
          {ueben.length === 0 ? (
            <p>Stark – alle Bereiche sitzen! Festige dein Wissen mit den gemischten Aufgaben der einzelnen Themen.</p>
          ) : (
            <ol className="et-plan">
              {ueben.map((b) => (
                <li key={b.bereich.id}>
                  <strong>{b.bereich.name}</strong> ({AMPEL_TEXT[b.ampel]}):{' '}
                  {b.bereich.links.map((l, i) => (
                    <span key={l.to}>
                      {i > 0 && ' und '}
                      <Link to={l.to}>{l.label}</Link>
                    </span>
                  ))}
                </li>
              ))}
            </ol>
          )}
        </section>

        <section className="et-karte">
          <h2>Alle Aufgaben</h2>
          {BEREICHE.map((b) => (
            <div key={b.id} className="et-detail-bereich">
              <h3>{b.name}</h3>
              {stand.aufgaben
                .filter((a) => a.bereich === b.id)
                .map((a) => {
                  nr += 1
                  const antwort = stand.antworten[a.id] ?? ''
                  const ok = istRichtig(a, antwort)
                  const f = a.feld
                  const loesungTex = f.art === 'term' || f.art === 'ausklammern' ? f.loesungTex : undefined
                  return (
                    <div key={a.id} className={`et-detail ${ok ? 'et-ok' : 'et-falsch'}`}>
                      <span className="et-nr">{nr}</span>
                      <div className="et-inhalt">
                        <AufgabeAnzeige a={a} />
                        <p>
                          Deine Antwort: <strong>{antwort.trim() || '—'}</strong> {ok ? '✓ richtig' : '✗ falsch'}
                        </p>
                        {!ok && (
                          <p>
                            Richtig wäre: {loesungTex ? <InlineMath math={loesungTex} /> : <strong>{f.loesung}</strong>} ·{' '}
                            <Link to={a.uebung.to}>Üben: {a.uebung.label}</Link>
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
            </div>
          ))}
        </section>
      </div>
    </TaskShell>
  )
}

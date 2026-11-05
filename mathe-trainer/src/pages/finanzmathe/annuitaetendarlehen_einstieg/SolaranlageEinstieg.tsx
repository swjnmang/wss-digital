import { useEffect, useId, useState, type ChangeEvent, type FocusEvent, type KeyboardEvent, type ReactNode } from 'react'
import TaskShell from '../../../components/layout/TaskShell'
import { useSitzungState } from '../../../hooks/useSitzung'
import { fieldCheckClass } from '../../../utils/fieldCheck'
import { Beispiel, M, MB, Merke, checkNumber, parseInput } from '../../daten_und_zufall/lernpfad/kit'
import {
  CardHead,
  CheckCard,
  Feedback,
  Hilfen,
  Loesungsweg,
  McCard,
  SchrittHilfen,
  TrackedCheck,
  TrackedMc,
  useLiveCheck,
} from '../../lineare_funktionen/lernsituation_kit/kit'
import {
  Abschnitt,
  Aufklappbar,
  BeispielMitVideo,
  BonusSpiel,
  Handlungsprodukt,
  SeitenLernsituation,
  type Bildwelt,
  type Seite,
  type Thema,
} from '../../lineare_funktionen/lernsituation_kit/seiten'
import { AufgabePunkteCtx, Bilanz, PUNKTE, punkteText, usePunkteAufgabe } from '../../lineare_funktionen/lernsituation_kit/punkte'
import { Kriterien, Zitat, euro } from '../zins_kit/zins_kit'
import SchuldenbergSpiel from './SchuldenbergSpiel'
import titelBild from './bilder/titel.webp'
import blockBild from './bilder/block.webp'
import planBild from './bilder/plan.webp'
import blattBild from './bilder/blatt.webp'
import '../../daten_und_zufall/lernpfad/lernpfad.css'
import './solaranlage.css'

// Lernsituation Annuitätendarlehen „Die Solaranlage“: Tilgungsplan für die ersten 2 Jahre mit den Formeln der Merkhilfe (ca. 60–90 min).
// Format Rollenspiel / Beratungsauftrag: Die SuS sind Azubis in einer Bank und beraten Frau Lorenz. Die Solaranlage mit Speicher kostet
// 27.500 €, 3.500 € zahlt sie selbst, den Rest (K₀ = 24.000 €) finanziert sie mit einem Annuitätendarlehen (4,5 % p.a., 12 Jahre).
// Typische Fehler, auf die die Lernsituation zielt: K₀ nicht erkennen (Kaufpreis statt Kaufpreis − Eigenkapital), die Formel für T₁ auch für
// T₂, T₃ … verwenden (statt T_v = T₁ · q^(v−1)), Zinsen nicht über die Schuld am Jahresanfang bzw. über Z = A − T bestimmen können.
// Problem erkennen: Festlegung (Tilgt Frau Lorenz im 2. Jahr gleich viel, weniger oder mehr?), dann im Darlehensrechner der Bank zuerst den
// Darlehensbetrag, dann Jahresraten ausprobieren (Live-Diagramm der Restschuld). Der Nachbar rechnet wie beim Ratendarlehen
// 24.000 : 12 + 1.080 = 3.080 €: Damit wäre das Darlehen schon im 10. Jahr abbezahlt. Raten trifft die Annuität nicht auf den Cent.
// Problem lösen in zwei Teilen: Teil 1 die 1. Zeile (K₀, A, T₁, Z₁), Teil 2 die 2. Zeile (Schuld, T₂ = T₁ · q, Z₂ auf zwei Wegen, A),
// je Beispielrechnung (Wärmepumpe von Herrn Brandt, 18.000 €, 4 %, 10 Jahre) mit Lernvideo → Ergebnisse im Tilgungsplan abgleichen.
// Aha: Die Rate bleibt gleich, die Tilgung steigt (1.551,99 € → 1.621,83 €), weil die Zinsen sinken. Mit der T₁-Formel käme 1.451,63 € heraus.
// Lernprodukt analog: Beratungsblatt für Frau Lorenz (K₀, Tilgungsplan für 2 Jahre, Formeln, Antwort).
// Phase 4: Annuität eines Autokredits (K₀ erkennen), Wer hat recht? (T₁-Formel für T₂), Zinsen auf zwei Wegen (Lückenrechnung),
// 5. Jahr für Frau Lorenz (T₅ = T₁ · q⁴), Profi Zinsen insgesamt. Bonus-Spiel „Schuldenberg“.
// Punkte nach Aufwand: Warm-up 2/3/4/2/3 = 14, Festlegung 3, Ausprobieren 3, Teil 1: 12, Teil 2: 12, Antwort 3, Beratungsblatt 5,
// Übungen 4/5/6/8, Profi 9. Pflicht zusammen 75: Warm-up 14 = 19 %, Problem lösen 32 = 43 %, Übungen 23 = 31 %;
// Bonus-Spiel 4 Runden à 2 = 8 wie die beste Übung.
// Identität: Themenfarbe Indigo (Kugelschreiber-Tinte), Symbol fa-solar-panel, Titelbild Haus mit Solaranlage und Notizen aus der Beratung,
// Leitobjekt der Beratungsblock mit dem Tilgungsplan. Bildwelt Skizzenbuch / blanko + blauer Kugelschreiber: Titelbild, Beratungsblock,
// Tilgungsplan-Notiz und Beratungsblatt sind gerenderte WebP-Dateien aus bilder-quelle/*.bild.html
// (node scripts/bilder-rendern.cjs src/pages/finanzmathe/annuitaetendarlehen_einstieg). Das Diagramm mit Live-Rückmeldung bleibt Inline-SVG.

const THEMA: Thema = {
  name: 'Die Solaranlage',
  farbe: 'indigo',
  icon: 'fa-solar-panel',
  bild: (
    <img
      src={titelBild}
      width={1200}
      height={600}
      alt="Kugelschreiber-Skizze eines Hauses mit Solaranlage auf dem Dach und einem Stromspeicher. Daneben Notizen aus der Beratung von Frau Lorenz: Solaranlage und Speicher 27.500 €, Eigenkapital 3.500 €, Rest als Annuitätendarlehen mit 4,5 % p. a. und 12 Jahren, jedes Jahr dieselbe Rate. Mit Textmarker: Rate = ?"
    />
  ),
}
const BILDWELT: Bildwelt = { welt: 'skizzenbuch', variante: 'kugelschreiber' }

/** Lernvideo aus den Übungsaufgaben „Annuitätendarlehen: Tilgungsplan“ */
const VIDEO_ANNUITAET = 'https://www.youtube.com/watch?v=uFL2B_whhXY'

/* ── Das Darlehen von Frau Lorenz ────────────────────────────────────────── */

const KAUFPREIS = 27500
const EIGEN = 3500
const K0 = KAUFPREIS - EIGEN // 24.000 €
const P = 4.5
const Q = 1 + P / 100
const N = 12
const r2 = (v: number) => Math.round(v * 100) / 100
const A = r2((K0 * Q ** N * (Q - 1)) / (Q ** N - 1)) // 2.631,99 €
const T1 = r2((K0 * (Q - 1)) / (Q ** N - 1)) // 1.551,99 €
const Z1 = r2(K0 * (Q - 1)) // 1.080,00 €
const K1 = r2(K0 - T1) // 22.448,01 €
const T2 = r2(T1 * Q) // 1.621,83 €
const Z2 = r2(K1 * (Q - 1)) // 1.010,16 €
const T2_FALSCH = r2((K1 * (Q - 1)) / (Q ** N - 1)) // 1.451,63 € (Formel für T₁ mit der neuen Schuld)
const T5 = r2(T1 * Q ** 4) // 1.850,78 €
const Z5 = r2(A - T5) // 781,21 €
const NACHBAR = K0 / N + Z1 // 3.080 €
/** Toleranz für Eurobeträge (Rundung der Zwischenergebnisse) */
const TOL = 0.05

/* ── Tilgungsplan als Tabelle (wie in den Übungsaufgaben) ───────────────── */

type Zeile = { jahr: number; schuld: number; tilgung: number; zinsen: number; annuitaet: number }
const SPALTEN = [
  { key: 'schuld', titel: 'Schuld am Jahresanfang' },
  { key: 'tilgung', titel: 'Tilgung' },
  { key: 'zinsen', titel: 'Zinsen' },
  { key: 'annuitaet', titel: 'Annuität' },
] as const

const ZEILE1: Zeile = { jahr: 1, schuld: K0, tilgung: T1, zinsen: Z1, annuitaet: A }
const ZEILE2: Zeile = { jahr: 2, schuld: K1, tilgung: T2, zinsen: Z2, annuitaet: A }

function PlanTabelle({ zeilen }: { zeilen: Zeile[] }) {
  return (
    <div className="lp-table-wrap">
      <table className="lp-table sa-plan">
        <thead>
          <tr>
            <th>Jahr</th>
            {SPALTEN.map((s) => (
              <th key={s.key}>{s.titel} in €</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {zeilen.map((z) => (
            <tr key={z.jahr}>
              <th>{z.jahr}</th>
              {SPALTEN.map((s) => (
                <td key={s.key}>{euro(z[s.key]).replace(' €', '')}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/**
 * Tilgungsplan zum Ausfüllen wie in der Übung „Annuitätendarlehen: Tilgungsplan“: Zeilen in feste (schon bekannt, nur angezeigt)
 * und zeilen (zum Ausfüllen). Jedes Feld prüft sich selbst, Lösungsweg erst nach einem Fehlversuch, Punkte nach Aufwand.
 */
function TilgungsplanCheck({
  title,
  prompt,
  feste = [],
  zeilen,
  punkte,
  solution,
  help,
  onSolved,
}: {
  title: ReactNode
  prompt: ReactNode
  feste?: Zeile[]
  zeilen: Zeile[]
  punkte: number
  solution: ReactNode
  help: ReactNode
  onSolved: () => void
}) {
  const pt = usePunkteAufgabe({ wert: punkte })
  const felder = zeilen.flatMap((z) => SPALTEN.map((s) => ({ key: `${z.jahr}-${s.key}`, expected: z[s.key] })))
  const { values, marks, status, praise, malFalsch, setValue, blur } = useLiveCheck(
    felder.map((f) => ({ key: f.key, pruefe: (v: string) => checkNumber(v, f.expected, TOL) })),
    {
      onSolved: () => {
        pt.geloest()
        onSolved()
      },
      onFehlversuch: () => pt.fehler(),
      onSchonGeloest: onSolved,
    },
  )
  const [zeigen, setZeigen] = useSitzungState('loesung', false)

  return (
    <div className="lp-ex bk-panel">
      <CardHead title={title} />
      <div className="lp-ex-prompt">{prompt}</div>
      <div className="lp-table-wrap">
        <table className="lp-table sa-plan sa-plan-eingabe">
          <thead>
            <tr>
              <th>Jahr</th>
              {SPALTEN.map((s) => (
                <th key={s.key}>{s.titel} in €</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {feste.map((z) => (
              <tr key={z.jahr} className="sa-plan-fest">
                <th>{z.jahr}</th>
                {SPALTEN.map((s) => (
                  <td key={s.key}>{euro(z[s.key]).replace(' €', '')}</td>
                ))}
              </tr>
            ))}
            {zeilen.map((z) => (
              <tr key={z.jahr}>
                <th>{z.jahr}</th>
                {SPALTEN.map((s) => {
                  const key = `${z.jahr}-${s.key}`
                  return (
                    <td key={s.key}>
                      <input
                        type="text"
                        inputMode="decimal"
                        autoComplete="off"
                        placeholder="?"
                        aria-label={`${s.titel}, Jahr ${z.jahr}`}
                        className={`bk-input sa-feld ${fieldCheckClass(marks[key])}`}
                        value={values[key] ?? ''}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => setValue(key, e.target.value)}
                        onBlur={(e: FocusEvent<HTMLInputElement>) => blur(key, e.currentTarget.value)}
                      />
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {(malFalsch || status === 'ok') && (
        <div className="bk-actions lp-ex-actions">
          <button
            type="button"
            className="bk-btn"
            onClick={() => {
              if (!zeigen && status !== 'ok') pt.loesung()
              setZeigen((z) => !z)
            }}
          >
            <i className="fa-solid fa-route" aria-hidden="true" /> {zeigen ? 'Lösungsweg ausblenden' : 'Lösungsweg zeigen'}
            {pt.aktiv && !zeigen && status !== 'ok' && <span className="ls-kosten"> (−{punkteText(pt.loesungKosten)})</span>}
          </button>
        </div>
      )}
      <Feedback status={status} praise={praise} />
      <AufgabePunkteCtx.Provider value={pt.aktiv ? pt : null}>{help}</AufgabePunkteCtx.Provider>
      {zeigen && (
        <div className="bk-solution lp-solution">
          <div className="bk-solution-title">Lösungsweg</div>
          {solution}
        </div>
      )}
    </div>
  )
}

/* ── Phase 2: Festlegung und Darlehensrechner ────────────────────────────── */

type Wahl = 'gleich' | 'weniger' | 'mehr'
const WAHL: Record<Wahl, string> = {
  gleich: 'Genauso viel wie im 1. Jahr. Die Rate ist ja jedes Jahr gleich.',
  weniger: 'Weniger als im 1. Jahr.',
  mehr: 'Mehr als im 1. Jahr.',
}

function Festlegung({ wahl, fest, onWahl, onFest }: { wahl: Wahl | null; fest: boolean; onWahl: (w: Wahl) => void; onFest: () => void }) {
  const uid = useId()
  const pt = usePunkteAufgabe({ wert: PUNKTE.festlegung, serie: false })
  if (fest && wahl) {
    return (
      <p className="ls-saved" role="status">
        <i className="fa-solid fa-lock" aria-hidden="true" /> Deine Vermutung: <strong>{WAHL[wahl]}</strong> Am Ende von „Problem lösen“ siehst du, ob
        du recht hattest.
      </p>
    )
  }
  return (
    <div className="sa-wahl" data-no-autocheck>
      <p className="sl-text">
        Frau Lorenz zahlt jedes Jahr dieselbe Rate. Wie viel tilgt sie im 2. Jahr, verglichen mit dem 1. Jahr?
      </p>
      <div className="ls-options" role="radiogroup" aria-label="Deine Vermutung">
        {(Object.keys(WAHL) as Wahl[]).map((w) => (
          <label key={w} className="bk-choice ls-option">
            <input type="radio" name={`${uid}-wahl`} checked={wahl === w} onChange={() => onWahl(w)} />
            <span>{WAHL[w]}</span>
          </label>
        ))}
      </div>
      <div>
        <button
          type="button"
          className="bk-btn bk-btn-primary"
          disabled={wahl === null}
          onClick={() => {
            pt.geloest()
            onFest()
          }}
        >
          <i className="fa-solid fa-lock" aria-hidden="true" /> Vermutung festhalten
        </button>
      </div>
    </div>
  )
}

/** Schuld am Ende jedes Jahres bei einer jährlichen Rate (Schuld · q − Rate) */
const verlauf = (rate: number) => {
  const werte = [K0]
  let k = K0
  for (let v = 1; v <= N; v++) {
    k = k * Q - rate
    werte.push(k)
  }
  return werte
}

// Diagramm der Restschuld (Inline-SVG mit Live-Rückmeldung)
const D = { w: 720, h: 330, l: 78, r: 20, t: 26, b: 52, max: 26000 }
const dx = (v: number) => D.l + ((v + 0.5) * (D.w - D.l - D.r)) / (N + 1)
const dy = (k: number) => D.t + (1 - Math.min(Math.max(k, 0), D.max) / D.max) * (D.h - D.t - D.b)
const BALKEN = ((D.w - D.l - D.r) / (N + 1)) * 0.62

function SchuldDiagramm({ raten }: { raten: number[] }) {
  const aktuell = raten[raten.length - 1]
  const werte = aktuell === undefined ? null : verlauf(aktuell)
  const rest = werte ? werte[N] : null
  return (
    <div className="bk-graph sa-diagramm">
      <svg
        viewBox={`0 0 ${D.w} ${D.h}`}
        role="img"
        aria-label={
          werte && rest !== null
            ? `Schuld am Ende jedes Jahres bei einer Rate von ${euro(aktuell)}: Start 24.000 €, nach 12 Jahren ${rest > 0 ? `noch ${euro(rest)}` : 'nichts mehr'}.`
            : 'Diagramm der Schuld über 12 Jahre, noch ohne Rate. Start: 24.000 €.'
        }
      >
        {[0, 5000, 10000, 15000, 20000, 25000].map((k) => (
          <g key={k}>
            <line x1={D.l} x2={D.w - D.r} y1={dy(k)} y2={dy(k)} stroke="var(--grid)" />
            <text x={D.l - 8} y={dy(k) + 5} textAnchor="end" fontSize="15" fill="var(--ink-muted)">
              {k.toLocaleString('de-DE')} €
            </text>
          </g>
        ))}
        <line x1={D.l} x2={D.w - D.r} y1={dy(0)} y2={dy(0)} stroke="var(--ink)" strokeWidth="2" />
        {Array.from({ length: N + 1 }, (_, v) => (
          <text key={v} x={dx(v)} y={dy(0) + 22} textAnchor="middle" fontSize="15" fontWeight={v === N ? 800 : 400} fill="var(--ink-muted)">
            {v === 0 ? 'Start' : v}
          </text>
        ))}
        <text x={D.w - D.r} y={D.h - 6} textAnchor="end" fontSize="15" fill="var(--ink-muted)">
          Schuld am Ende von Jahr …
        </text>
        {/* frühere Versuche blass */}
        {raten.slice(0, -1).map((r, i) => (
          <polyline
            key={i}
            points={verlauf(r)
              .map((k, v) => `${dx(v)},${dy(k)}`)
              .join(' ')}
            fill="none"
            stroke="var(--line-strong)"
            strokeWidth="2"
            strokeDasharray="5 5"
          />
        ))}
        {werte
          ? werte.map((k, v) => {
              const weg = k <= 0.005 && v > 0
              return (
                <g key={v}>
                  {!weg && <rect x={dx(v) - BALKEN / 2} y={dy(k)} width={BALKEN} height={dy(0) - dy(k)} fill={v === 0 ? 'var(--primary-soft)' : 'var(--primary)'} stroke="var(--primary)" strokeWidth="1.5" rx="2" />}
                  {weg && <circle cx={dx(v)} cy={dy(0) - 10} r="7" fill="var(--correct)" />}
                </g>
              )
            })
          : (
            <rect x={dx(0) - BALKEN / 2} y={dy(K0)} width={BALKEN} height={dy(0) - dy(K0)} fill="var(--primary-soft)" stroke="var(--primary)" strokeWidth="1.5" rx="2" />
          )}
        {rest !== null && rest > 0.005 && (
          <text x={dx(N)} y={dy(rest) - 10} textAnchor="end" fontSize="16" fontWeight="800" fill="var(--ink)">
            Rest: {Math.round(rest).toLocaleString('de-DE')} €
          </text>
        )}
        {(rest === null || rest > 0.005) && (
          <text x={dx(N)} y={dy(0) - 10} textAnchor="middle" fontSize="15" fontWeight="700" fill="var(--primary)">
            Ziel: 0 €
          </text>
        )}
      </svg>
    </div>
  )
}

const MIND_VERSUCHE = 3

function Darlehensrechner({ frei, onFertig }: { frei: boolean; onFertig: () => void }) {
  const uid = useId()
  const [kEingabe, setKEingabe] = useSitzungState('sa-k-eingabe', '')
  const [kOk, setKOk] = useSitzungState('sa-k-ok', false)
  const [kMeldung, setKMeldung] = useState<string | null>(null)
  const [eingabe, setEingabe] = useState('')
  const [meldung, setMeldung] = useState<string | null>(null)
  const [raten, setRaten] = useSitzungState<number[]>('sa-raten', [])
  const pt = usePunkteAufgabe({ wert: PUNKTE.festlegung, serie: false })
  const fertig = raten.length >= MIND_VERSUCHE
  useEffect(() => {
    if (fertig) {
      pt.geloest()
      onFertig()
    }
  }, [fertig, pt, onFertig])

  const kPruefen = () => {
    const p = parseInput(kEingabe)
    if (!p) return setKMeldung('Gib einen Betrag in Euro ein, z. B. 15000.')
    if (Math.abs(p.value - K0) < 0.5) {
      setKMeldung(null)
      return setKOk(true)
    }
    if (Math.abs(p.value - KAUFPREIS) < 0.5)
      return setKMeldung('Frau Lorenz bezahlt 3.500 € aus ihrem Ersparten selbst. Die Bank leiht ihr nur den Rest des Kaufpreises.')
    if (Math.abs(p.value - EIGEN) < 0.5) return setKMeldung('Die 3.500 € hat Frau Lorenz selbst. Gesucht ist das Geld, das ihr noch fehlt.')
    if (Math.abs(p.value - (KAUFPREIS + EIGEN)) < 0.5) return setKMeldung('Das Eigenkapital wird nicht dazugezählt, sondern abgezogen.')
    setKMeldung('Das ist nicht der Betrag, den die Bank leiht. Wie viel fehlt Frau Lorenz noch für die Anlage?')
  }

  const senden = () => {
    const p = parseInput(eingabe)
    if (!p) return setMeldung('Gib eine Rate in Euro ein, z. B. 2500.')
    if (p.value < 500 || p.value > 10000) return setMeldung('Probiere eine Rate zwischen 500 € und 10.000 €.')
    setMeldung(null)
    setRaten((r) => [...r, p.value])
  }

  const letzte = raten[raten.length - 1]
  const werte = letzte === undefined ? null : verlauf(letzte)
  const rest = werte ? werte[N] : 0
  const fertigJahr = werte ? werte.findIndex((k, v) => v > 0 && k <= 0) : -1

  return (
    <div className="sa-rechner" data-no-autocheck>
      <h4 className="sa-rechner-titel">
        <i className="fa-solid fa-calculator" aria-hidden="true" /> Darlehensrechner der Bank
      </h4>
      {!frei ? (
        <p className="sl-hinweis">Halte zuerst oben deine Vermutung fest. Dann kannst du den Darlehensrechner benutzen.</p>
      ) : (
        <>
          <div className="sa-eingabe">
            <label htmlFor={`${uid}-k`}>Darlehensbetrag (so viel leiht die Bank):</label>
            <span className="sa-eingabe-feld">
              <input
                id={`${uid}-k`}
                type="text"
                inputMode="decimal"
                autoComplete="off"
                placeholder="?"
                disabled={kOk}
                className={`bk-input lp-input lp-input-md ${kOk ? fieldCheckClass(true) : kMeldung ? fieldCheckClass(false) : ''}`}
                value={kEingabe}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  setKEingabe(e.target.value)
                  setKMeldung(null)
                }}
                onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === 'Enter') kPruefen()
                }}
              />
              <span>€</span>
            </span>
            {!kOk && (
              <button type="button" className="bk-btn bk-btn-primary" onClick={kPruefen}>
                Betrag übernehmen
              </button>
            )}
          </div>
          {kMeldung && (
            <div className="bk-feedback bk-feedback-no lp-feedback" role="status">
              <i className="fa-solid fa-circle-xmark" aria-hidden="true" /> {kMeldung}
            </div>
          )}
          {kOk && (
            <>
              <p className="sl-text">
                Richtig: Die Bank leiht Frau Lorenz <strong>24.000 €</strong>. Jetzt probierst du Jahresraten aus. Der Rechner zeigt dir, wie viel Schuld am Ende
                jedes Jahres übrig bleibt. Nach 12 Jahren soll die Schuld genau 0 € sein.
              </p>
              <SchuldDiagramm raten={raten} />
              <div className="sa-eingabe">
                <label htmlFor={`${uid}-r`}>Jährliche Rate:</label>
                <span className="sa-eingabe-feld">
                  <input
                    id={`${uid}-r`}
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    placeholder="?"
                    className="bk-input lp-input lp-input-md"
                    value={eingabe}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setEingabe(e.target.value)}
                    onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                      if (e.key === 'Enter') senden()
                    }}
                  />
                  <span>€</span>
                </span>
                <button type="button" className="bk-btn bk-btn-primary" onClick={senden}>
                  <i className="fa-solid fa-paper-plane" aria-hidden="true" /> An den Rechner senden
                </button>
              </div>
              {meldung && (
                <div className="bk-feedback bk-feedback-info lp-feedback" role="status">
                  <i className="fa-solid fa-pen" aria-hidden="true" /> {meldung}
                </div>
              )}
              {letzte !== undefined && (
                <div className={`sa-anzeige${Math.abs(rest) <= 5 ? ' sa-anzeige-ok' : ''}`} role="status">
                  <i className="fa-solid fa-calculator" aria-hidden="true" />
                  <span>
                    <strong>Versuch {raten.length}:</strong> Rate {euro(letzte)}.{' '}
                    {Math.abs(rest) <= 5
                      ? `Sehr nah dran! Nach 12 Jahren bleibt fast nichts übrig (${rest >= 0 ? `${euro(rest)} Rest` : `${euro(-rest)} zu viel bezahlt`}).`
                      : letzte <= Z1
                        ? 'Die Rate reicht nicht einmal für die Zinsen des 1. Jahres. Die Schuld wird jedes Jahr größer.'
                        : rest > 0
                          ? `Nach 12 Jahren hat Frau Lorenz noch ${euro(rest)} Schulden. Die Rate ist zu niedrig.`
                          : `Schon im ${fertigJahr}. Jahr ist alles abbezahlt. Mit dieser Rate zahlt Frau Lorenz mehr als nötig.`}
                  </span>
                </div>
              )}
              {!fertig && (
                <p className="sl-hinweis">
                  Probiere zuerst die Rechnung des Nachbarn aus. Noch {MIND_VERSUCHE - raten.length} {MIND_VERSUCHE - raten.length === 1 ? 'Versuch' : 'Versuche'}, dann
                  geht es weiter.
                </p>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}

function Erkenntnis() {
  return (
    <p className="sl-text sa-erkenntnis" role="status">
      <strong>Schon gemerkt?</strong> Mit der Rechnung des Nachbarn (<M>{'24\\,000 : 12 + 1\\,080 = 3\\,080'}</M> €) wäre Frau Lorenz schon im 10. Jahr fertig: Sie
      würde zu viel bezahlen. So rechnet man beim Ratendarlehen, bei dem die Raten jedes Jahr kleiner werden. Durch Probieren kommst du der richtigen Rate zwar näher,
      aber auf den Cent genau triffst du sie kaum. Auf der nächsten Seite lernst du die Formeln, mit denen die Bank die Annuität, die Tilgung und die Zinsen berechnet.
    </p>
  )
}

/* ── Rechenbeispiel: die Wärmepumpe von Herrn Brandt ────────────────────── */
// 21.000 € − 3.000 € = 18.000 €, 4 % p.a., 10 Jahre: A = 2.219,24 €, T₁ = 1.499,24 €, Z₁ = 720,00 €,
// K₁ = 16.500,76 €, T₂ = 1.559,21 €, Z₂ = 660,03 € (mit der Formel für T₁ käme fälschlich 1.374,36 € heraus).

const BSP_ZEILE1: Zeile = { jahr: 1, schuld: 18000, tilgung: 1499.24, zinsen: 720, annuitaet: 2219.24 }
const BSP_ZEILE2: Zeile = { jahr: 2, schuld: 16500.76, tilgung: 1559.21, zinsen: 660.03, annuitaet: 2219.24 }

const BSP_AUFGABE = (
  <p>
    Herr Brandt kauft eine Wärmepumpe für <strong>21.000 €</strong>. <strong>3.000 €</strong> bezahlt er selbst, den Rest finanziert er mit einem Annuitätendarlehen:{' '}
    <strong>4 % p.a.</strong>, Laufzeit <strong>10 Jahre</strong>.
  </p>
)

const BSP1_SCHRITTE: { title: ReactNode; body: ReactNode }[] = [
  {
    title: <>Den Darlehensbetrag <M>{'K_0'}</M> bestimmen</>,
    body: (
      <>
        <p>
          Die Bank leiht nur das Geld, das Herrn Brandt noch fehlt. <M>{'K_0'}</M> ist die Schuld am Anfang des 1. Jahres. Achtung: nicht mit dem Kaufpreis rechnen.
        </p>
        <MB>{'K_0 = 21\\,000 \\text{ €} - 3\\,000 \\text{ €} = 18\\,000 \\text{ €}'}</MB>
      </>
    ),
  },
  {
    title: <>Zinsfaktor <M>q</M> und Laufzeit <M>n</M> notieren</>,
    body: (
      <>
        <MB>{'q = 1 + \\dfrac{4}{100} = 1{,}04'}</MB>
        <MB>{'n = 10'}</MB>
      </>
    ),
  },
  {
    title: <>Die Annuität <M>A</M> mit der Formel aus der Merkhilfe</>,
    body: (
      <>
        <p>Die Annuität ist die Jahresrate. Sie ist in allen 10 Jahren gleich hoch.</p>
        <MB>{'A = K_0 \\cdot \\dfrac{q^n \\cdot (q - 1)}{q^n - 1}'}</MB>
        <MB>{'A = 18\\,000 \\cdot \\dfrac{1{,}04^{10} \\cdot (1{,}04 - 1)}{1{,}04^{10} - 1}'}</MB>
        <MB>{'A = 2\\,219{,}24 \\text{ €}'}</MB>
        <p>Tipp für den Taschenrechner: Zähler und Nenner jeweils in Klammern eingeben.</p>
      </>
    ),
  },
  {
    title: <>Die Tilgung im 1. Jahr <M>{'T_1'}</M></>,
    body: (
      <>
        <p>Für die Tilgung im 1. Jahr gibt es eine eigene Formel. Sie gilt nur für das 1. Jahr.</p>
        <MB>{'T_1 = K_0 \\cdot \\dfrac{q - 1}{q^n - 1}'}</MB>
        <MB>{'T_1 = 18\\,000 \\cdot \\dfrac{1{,}04 - 1}{1{,}04^{10} - 1}'}</MB>
        <MB>{'T_1 = 1\\,499{,}24 \\text{ €}'}</MB>
      </>
    ),
  },
  {
    title: <>Die Zinsen im 1. Jahr <M>{'Z_1'}</M> auf zwei Wegen</>,
    body: (
      <>
        <p>Weg 1: Die Zinsen werden für die Schuld am Jahresanfang berechnet.</p>
        <MB>{'Z_1 = 18\\,000 \\cdot \\dfrac{4}{100} = 720{,}00 \\text{ €}'}</MB>
        <p>Weg 2: Die Annuität besteht aus Zinsen und Tilgung. Was nicht Tilgung ist, sind Zinsen.</p>
        <MB>{'Z_1 = A - T_1 = 2\\,219{,}24 - 1\\,499{,}24 = 720{,}00 \\text{ €}'}</MB>
        <p>Beide Wege liefern dasselbe Ergebnis. So kannst du dich selbst kontrollieren.</p>
      </>
    ),
  },
  {
    title: 'Die 1. Zeile des Tilgungsplans',
    body: <PlanTabelle zeilen={[BSP_ZEILE1]} />,
  },
]

const BSP2_SCHRITTE: { title: ReactNode; body: ReactNode }[] = [
  {
    title: 'Die Schuld am Anfang des 2. Jahres',
    body: (
      <>
        <p>Nur die Tilgung verringert die Schuld. Die Zinsen sind der Preis für das geliehene Geld.</p>
        <MB>{'K_1 = K_0 - T_1 = 18\\,000 - 1\\,499{,}24 = 16\\,500{,}76 \\text{ €}'}</MB>
      </>
    ),
  },
  {
    title: <>Die Tilgung im 2. Jahr mit der Formel für <M>{'T_v'}</M></>,
    body: (
      <>
        <p>
          Ab dem 2. Jahr gilt die Formel für das Jahr <M>v</M>. Für das 2. Jahr ist <M>{'v = 2'}</M>:
        </p>
        <MB>{'T_v = T_1 \\cdot q^{v - 1}'}</MB>
        <MB>{'T_2 = 1\\,499{,}24 \\cdot 1{,}04^{2 - 1} = 1\\,499{,}24 \\cdot 1{,}04'}</MB>
        <MB>{'T_2 = 1\\,559{,}21 \\text{ €}'}</MB>
        <p>
          <strong>Stolperstein:</strong> Die Formel für <M>{'T_1'}</M> gilt nur im 1. Jahr. Setzt man dort die neue Schuld ein, kommt <M>{'1\\,374{,}36'}</M> € heraus. Das
          ist falsch.
        </p>
      </>
    ),
  },
  {
    title: <>Die Zinsen im 2. Jahr <M>{'Z_2'}</M> auf zwei Wegen</>,
    body: (
      <>
        <p>Weg 1: über die Schuld am Anfang des 2. Jahres.</p>
        <MB>{'Z_2 = 16\\,500{,}76 \\cdot \\dfrac{4}{100} = 660{,}03 \\text{ €}'}</MB>
        <p>Weg 2: Annuität minus Tilgung.</p>
        <MB>{'Z_2 = A - T_2 = 2\\,219{,}24 - 1\\,559{,}21 = 660{,}03 \\text{ €}'}</MB>
      </>
    ),
  },
  {
    title: 'Die Annuität bleibt gleich',
    body: (
      <>
        <p>
          Die Annuität ist wieder <M>{'2\\,219{,}24'}</M> €. Die Zinsen sinken, die Tilgung steigt um genau denselben Betrag (<M>{'59{,}97'}</M> €).
        </p>
        <PlanTabelle zeilen={[BSP_ZEILE1, BSP_ZEILE2]} />
        <p>
          Für jedes weitere Jahr rechnest du genauso: <M>{'T_3 = T_1 \\cdot q^2'}</M>, <M>{'T_4 = T_1 \\cdot q^3'}</M> und so weiter.
        </p>
      </>
    ),
  },
]

/* ── Lösungswege ─────────────────────────────────────────────────────────── */

const LOESUNG_JAHR1 = (
  <Loesungsweg
    schritte={[
      { titel: <>Darlehensbetrag <M>{'K_0'}</M></>, tex: 'K_0 = 27\\,500 - 3\\,500 = 24\\,000 \\text{ €}' },
      { titel: <>Zinsfaktor und Laufzeit</>, tex: ['q = 1 + \\dfrac{4{,}5}{100} = 1{,}045', 'n = 12'] },
      {
        titel: <>Annuität <M>A</M></>,
        tex: ['A = 24\\,000 \\cdot \\dfrac{1{,}045^{12} \\cdot (1{,}045 - 1)}{1{,}045^{12} - 1}', 'A = 2\\,631{,}99 \\text{ €}'],
      },
      { titel: <>Tilgung im 1. Jahr <M>{'T_1'}</M></>, tex: ['T_1 = 24\\,000 \\cdot \\dfrac{1{,}045 - 1}{1{,}045^{12} - 1}', 'T_1 = 1\\,551{,}99 \\text{ €}'] },
      { titel: <>Zinsen im 1. Jahr (Weg 1)</>, tex: 'Z_1 = 24\\,000 \\cdot \\dfrac{4{,}5}{100} = 1\\,080{,}00 \\text{ €}' },
      { titel: <>Kontrolle (Weg 2)</>, tex: 'Z_1 = A - T_1 = 2\\,631{,}99 - 1\\,551{,}99 = 1\\,080{,}00 \\text{ €}' },
    ]}
  />
)

const LOESUNG_JAHR2 = (
  <Loesungsweg
    schritte={[
      { titel: 'Schuld am Anfang des 2. Jahres', tex: 'K_1 = 24\\,000 - 1\\,551{,}99 = 22\\,448{,}01 \\text{ €}' },
      { titel: <>Tilgung im 2. Jahr mit <M>{'T_v = T_1 \\cdot q^{v-1}'}</M></>, tex: ['T_2 = 1\\,551{,}99 \\cdot 1{,}045^{2-1}', 'T_2 = 1\\,621{,}83 \\text{ €}'] },
      { titel: <>Zinsen im 2. Jahr (Weg 1)</>, tex: 'Z_2 = 22\\,448{,}01 \\cdot \\dfrac{4{,}5}{100} = 1\\,010{,}16 \\text{ €}' },
      { titel: <>Kontrolle (Weg 2)</>, tex: 'Z_2 = A - T_2 = 2\\,631{,}99 - 1\\,621{,}83 = 1\\,010{,}16 \\text{ €}' },
      { titel: 'Annuität', text: <p>Die Annuität bleibt gleich: <M>{'A = 2\\,631{,}99'}</M> €.</p> },
    ]}
  />
)

/* ── Seite ───────────────────────────────────────────────────────────────── */

export default function SolaranlageEinstieg({ onBack, onPractice }: { onBack: () => void; onPractice: () => void }) {
  const [wahl, setWahl] = useSitzungState<Wahl | null>('sa-wahl', null)
  const [fest, setFest] = useSitzungState('sa-fest', false)
  const [rechnerFertig, setRechnerFertig] = useSitzungState('sa-rechner-fertig', false)
  const [jahr2Geloest, setJahr2Geloest] = useSitzungState('sa-jahr2', false)
  const [uebungen, setUebungen] = useSitzungState<string[]>('sa-uebungen', [])
  const uebung = (k: string, fertig: () => void) => () => {
    fertig()
    setUebungen((u) => (u.includes(k) ? u : [...u, k]))
  }

  const seiten: Seite[] = [
    {
      art: 'start',
      titel: 'Aufwärmen',
      pflicht: ['a', 'b', 'c', 'd', 'e'],
      inhalt: (fertig) => (
        <>
          <p className="sl-text">Diese fünf kurzen Aufgaben brauchst du gleich. Den Taschenrechner darfst du benutzen. Einzelarbeit, ca. 10 Minuten.</p>
          <CheckCard
            onSolved={fertig.teil('a')}
            punkte={2}
            title="a) Zinsfaktor"
            prompt={<p>Wie heißt der Zinsfaktor <M>q</M> zu diesen Zinssätzen?</p>}
            rechnung={[
              { l: ['p = 4{,}5\\,\\%\\colon\\ q'], r: [{ luecke: 'q1' }] },
              { l: ['p = 3{,}2\\,\\%\\colon\\ q'], r: [{ luecke: 'q2' }] },
            ]}
            fields={[
              { kind: 'num', key: 'q1', label: 'Zinsfaktor bei 4,5 %', expected: 1.045, tol: 0.00001 },
              { kind: 'num', key: 'q2', label: 'Zinsfaktor bei 3,2 %', expected: 1.032, tol: 0.00001 },
            ]}
            solution={
              <Loesungsweg
                schritte={[
                  { titel: 'Formel', tex: 'q = 1 + \\dfrac{p}{100}' },
                  { titel: 'Bei 4,5 %', tex: 'q = 1 + \\dfrac{4{,}5}{100} = 1{,}045' },
                  { titel: 'Bei 3,2 %', tex: 'q = 1 + \\dfrac{3{,}2}{100} = 1{,}032' },
                ]}
              />
            }
          />
          <CheckCard
            onSolved={fertig.teil('b')}
            punkte={3}
            title="b) Zinsen für ein Jahr"
            prompt={<p>Jemand hat am Jahresanfang 16.000 € Schulden. Der Zinssatz beträgt 3,5 % p.a. Wie viel Zinsen fallen für dieses Jahr an?</p>}
            fields={[{ kind: 'num', key: 'z', label: <M>{'Z ='}</M>, expected: 560, unit: '€', tol: 0.01 }]}
            solution={<Loesungsweg schritte={[{ titel: 'Schuld mal Zinssatz', tex: 'Z = 16\\,000 \\cdot \\dfrac{3{,}5}{100} = 560{,}00 \\text{ €}' }]} />}
            help={
              <Hilfen
                steps={[
                  <>Zinsen werden immer für die Schuld berechnet, die gerade noch offen ist.</>,
                  <>Rechne die Schuld mal den Zinssatz in Prozent.</>,
                  <>
                    <M>{'16\\,000 \\cdot 0{,}035'}</M>
                  </>,
                ]}
              />
            }
          />
          <CheckCard
            onSolved={fertig.teil('c')}
            punkte={4}
            title="c) Eine Zeile eines Tilgungsplans"
            prompt={
              <p>
                Bei einem Ratendarlehen ist die Schuld am Anfang des Jahres 20.000 €. In diesem Jahr werden 2.500 € getilgt, der Zinssatz beträgt 4 % p.a. Berechne
                die Zinsen, die Jahresrate (Annuität) und die Schuld am Anfang des nächsten Jahres.
              </p>
            }
            rechnung={[
              { l: ['Z'], r: [{ luecke: 'z', breit: true }] },
              { l: ['A'], r: [{ luecke: 'a', breit: true }] },
              { l: ['\\text{neue Schuld}'], r: [{ luecke: 'k', breit: true }] },
            ]}
            fields={[
              { kind: 'num', key: 'z', label: 'Zinsen in Euro', expected: 800, tol: 0.01 },
              { kind: 'num', key: 'a', label: 'Annuität in Euro', expected: 3300, tol: 0.01 },
              { kind: 'num', key: 'k', label: 'Schuld am Anfang des nächsten Jahres in Euro', expected: 17500, tol: 0.01 },
            ]}
            solution={
              <Loesungsweg
                schritte={[
                  { titel: 'Zinsen für die Schuld am Jahresanfang', tex: 'Z = 20\\,000 \\cdot \\dfrac{4}{100} = 800 \\text{ €}' },
                  { titel: 'Annuität = Tilgung + Zinsen', tex: 'A = 2\\,500 + 800 = 3\\,300 \\text{ €}' },
                  { titel: 'Nur die Tilgung verringert die Schuld', tex: '20\\,000 - 2\\,500 = 17\\,500 \\text{ €}' },
                ]}
              />
            }
            help={
              <Hilfen
                steps={[
                  <>Eine Jahresrate besteht aus zwei Teilen: Zinsen und Tilgung.</>,
                  <>Die Zinsen rechnest du für die Schuld am Jahresanfang. Von der Schuld ziehst du nur die Tilgung ab, nicht die Zinsen.</>,
                  <>
                    <M>{'Z = 20\\,000 \\cdot 0{,}04'}</M>, dann <M>{'A = 2\\,500 + Z'}</M>.
                  </>,
                ]}
              />
            }
          />
          <CheckCard
            onSolved={fertig.teil('d')}
            punkte={2}
            title="d) Potenz mit dem Taschenrechner"
            prompt={<p>Berechne mit dem Taschenrechner und runde auf 4 Nachkommastellen.</p>}
            rechnung={[
              { l: ['1{,}045^{12}'], r: [{ luecke: 'p1' }] },
              { l: ['1{,}04^{10}'], r: [{ luecke: 'p2' }] },
            ]}
            fields={[
              { kind: 'num', key: 'p1', label: '1,045 hoch 12', expected: 1.045 ** 12, tol: 0.0001 },
              { kind: 'num', key: 'p2', label: '1,04 hoch 10', expected: 1.04 ** 10, tol: 0.0001 },
            ]}
            solution={
              <>
                <Loesungsweg
                  schritte={[
                    { titel: 'Erste Potenz', tex: '1{,}045^{12} \\approx 1{,}6959' },
                    { titel: 'Zweite Potenz', tex: '1{,}04^{10} \\approx 1{,}4802' },
                  ]}
                />
                <p>Am Taschenrechner: Basis eingeben, dann die Potenztaste (z. B. ^ oder xʸ), dann den Exponenten.</p>
              </>
            }
          />
          <CheckCard
            onSolved={fertig.teil('e')}
            punkte={3}
            title="e) Bruch mit Klammern"
            prompt={<p>Berechne mit dem Taschenrechner. Achte darauf, Zähler und Nenner jeweils in Klammern einzugeben.</p>}
            rechnung={[
              { l: ['\\dfrac{1{,}2 \\cdot 0{,}05}{1{,}2 - 1}'], r: [{ luecke: 'b1' }] },
              { l: ['\\dfrac{0{,}06}{1{,}5 - 1}'], r: [{ luecke: 'b2' }] },
            ]}
            fields={[
              { kind: 'num', key: 'b1', label: 'erster Bruch', expected: 0.3, tol: 0.0001 },
              { kind: 'num', key: 'b2', label: 'zweiter Bruch', expected: 0.12, tol: 0.0001 },
            ]}
            solution={
              <Loesungsweg
                schritte={[
                  { titel: 'Erster Bruch: Zähler und Nenner einzeln', tex: ['\\dfrac{1{,}2 \\cdot 0{,}05}{1{,}2 - 1} = \\dfrac{0{,}06}{0{,}2}', '= 0{,}3'] },
                  { titel: 'Zweiter Bruch', tex: ['\\dfrac{0{,}06}{1{,}5 - 1} = \\dfrac{0{,}06}{0{,}5}', '= 0{,}12'] },
                ]}
              />
            }
            help={
              <Hilfen
                steps={[
                  <>Der Bruchstrich wirkt wie eine Klammer um Zähler und Nenner.</>,
                  <>Rechne zuerst den Zähler aus, dann den Nenner, und teile danach.</>,
                  <>
                    <M>{'1{,}2 \\cdot 0{,}05 = 0{,}06'}</M> und <M>{'1{,}2 - 1 = 0{,}2'}</M>, also <M>{'0{,}06 : 0{,}2'}</M>.
                  </>,
                ]}
              />
            }
          />
        </>
      ),
    },
    {
      art: 'problem',
      titel: 'Wie hoch ist die Rate für die Solaranlage?',
      pflicht: ['fest', 'rechner'],
      bedingung: 'Halte deine Vermutung fest und probiere im Darlehensrechner mindestens drei Raten aus.',
      inhalt: (fertig) => (
        <>
          <p className="sl-text">
            Du machst eine Ausbildung zur Bankkauffrau oder zum Bankkaufmann. Heute berätst du Frau Lorenz. Sie möchte eine Solaranlage mit Stromspeicher auf ihr Dach
            bauen lassen. Die Anlage kostet <strong>27.500 €</strong>. <strong>3.500 €</strong> bezahlt sie aus ihrem Ersparten.
          </p>
          <p className="sl-text">
            Den Rest leiht ihr die Bank als <strong>Annuitätendarlehen</strong> mit <strong>4,5 % p.a.</strong> und einer Laufzeit von <strong>12 Jahren</strong>. Bei
            einem Annuitätendarlehen zahlt man jedes Jahr dieselbe Rate, die <strong>Annuität</strong>. Sie besteht aus Zinsen und Tilgung. Gesucht ist die Höhe dieser
            Rate.
          </p>
          <Zitat wer="Frau Lorenz">
            <p>
              „Mein Nachbar sagt: Schuld durch 12 Jahre, dann noch die Zinsen dazu, fertig. Stimmt das? Und tilge ich dann jedes Jahr gleich viel, wenn die Rate immer
              gleich ist?“
            </p>
          </Zitat>
          <div className="sl-fokus">
            <p className="sl-fokus-titel">Dein Auftrag: Erst vermuten, dann ausprobieren</p>
            <p>
              Lege dich zuerst fest: Tilgt Frau Lorenz im 2. Jahr gleich viel, weniger oder mehr? Probiere danach im Darlehensrechner der Bank aus, ohne Formel: Mit
              welcher jährlichen Rate ist das Darlehen nach genau 12 Jahren abbezahlt? Probiere auch die Idee des Nachbarn aus.
            </p>
          </div>
          <figure className="sl-foto">
            <img
              src={blockBild}
              width={1200}
              height={600}
              alt="Seite eines Beratungsblocks: Kaufpreis 27.500 €, minus Eigenkapital 3.500 €, Darlehen ? €. Zinssatz 4,5 % p. a., Laufzeit 12 Jahre, Rückzahlung jedes Jahr gleich viel. Rechts ein Balken für die Annuität A = ? im 1. Jahr, aufgeteilt in Zinsen = ? und Tilgung = ?"
            />
          </figure>
          <Festlegung
            wahl={wahl}
            fest={fest}
            onWahl={setWahl}
            onFest={() => {
              setFest(true)
              fertig.teil('fest')()
            }}
          />
          <Darlehensrechner
            frei={fest}
            onFertig={() => {
              setRechnerFertig(true)
              fertig.teil('rechner')()
            }}
          />
          {rechnerFertig && <Erkenntnis />}
        </>
      ),
    },
    {
      art: 'loesen',
      titel: 'Teil 1: Das 1. Jahr im Tilgungsplan',
      pflicht: ['jahr1'],
      bedingung: 'Trage die 1. Zeile des Tilgungsplans richtig ein, dann geht es zu Teil 2.',
      inhalt: (fertig) => (
        <>
          <div className="sl-fokus">
            <p className="sl-fokus-titel">Deine Aufgabe: Die 1. Zeile des Tilgungsplans für Frau Lorenz</p>
            <p>
              Die Solaranlage kostet 27.500 €, Frau Lorenz bezahlt 3.500 € selbst. Den Rest leiht ihr die Bank als Annuitätendarlehen mit 4,5 % p.a. und 12 Jahren
              Laufzeit. Berechne in deinem Heft die 1. Zeile des Tilgungsplans: die Schuld am Anfang des 1. Jahres <M>{'K_0'}</M>, die Annuität <M>A</M>, die Tilgung{' '}
              <M>{'T_1'}</M> und die Zinsen <M>{'Z_1'}</M>. Nutze die Formeln aus der Merkhilfe.
            </p>
          </div>
          <figure className="sl-foto">
            <img
              src={blockBild}
              width={1200}
              height={600}
              alt="Seite des Beratungsblocks mit den gegebenen Größen: Kaufpreis 27.500 €, Eigenkapital 3.500 €, Darlehen ?, 4,5 % p. a., 12 Jahre, Annuität A = ?, Zinsen = ?, Tilgung = ?"
            />
          </figure>
          <BeispielMitVideo video={VIDEO_ANNUITAET} videoTitel="Lernvideo: Annuitätendarlehen, Tilgungsplan aufstellen">
            <Beispiel offen title="Die Wärmepumpe von Herrn Brandt: das 1. Jahr" aufgabe={BSP_AUFGABE} steps={BSP1_SCHRITTE} />
          </BeispielMitVideo>
          <Abschnitt titel="Vergleiche deine Ergebnisse">
            <TilgungsplanCheck
              onSolved={fertig.teil('jahr1')}
              punkte={12}
              title="1. Zeile des Tilgungsplans"
              prompt={<p>Trage die Ergebnisse aus deinem Heft in den Tilgungsplan ein. Jedes Feld zeigt dir sofort, ob es stimmt.</p>}
              zeilen={[ZEILE1]}
              solution={LOESUNG_JAHR1}
              help={
                <Hilfen
                  steps={[
                    <>Wie viel Geld leiht die Bank Frau Lorenz wirklich? Und welche Formeln aus der Merkhilfe gehören zum Annuitätendarlehen?</>,
                    <>
                      <M>{'K_0'}</M> ist Kaufpreis minus Eigenkapital. Dann berechnest du <M>A</M> mit der Formel für die Annuität, <M>{'T_1'}</M> mit der Formel für die
                      Tilgung im 1. Jahr und <M>{'Z_1'}</M> über die Schuld am Jahresanfang.
                    </>,
                    <>
                      <M>{'K_0 = 24\\,000'}</M>, <M>{'q = 1{,}045'}</M>, <M>{'n = 12'}</M>:{' '}
                      <M>{'A = 24\\,000 \\cdot \\dfrac{1{,}045^{12} \\cdot 0{,}045}{1{,}045^{12} - 1}'}</M>
                    </>,
                  ]}
                />
              }
            />
          </Abschnitt>
        </>
      ),
    },
    {
      art: 'loesen',
      titel: 'Teil 2: Das 2. Jahr im Tilgungsplan',
      pflicht: ['jahr2', 'antwort', 'produkt'],
      inhalt: (fertig) => (
        <>
          <div className="sl-fokus">
            <p className="sl-fokus-titel">Deine Aufgabe: Die 2. Zeile des Tilgungsplans und eine Antwort für Frau Lorenz</p>
            <p>
              Die 1. Zeile steht. Berechne in deinem Heft die 2. Zeile: die Schuld am Anfang des 2. Jahres, die Tilgung <M>{'T_2'}</M>, die Zinsen <M>{'Z_2'}</M> und die
              Annuität. Nutze wieder die Formeln aus der Merkhilfe. Beantworte danach die Frage von Frau Lorenz: Tilgt sie im 2. Jahr genauso viel wie im 1. Jahr?
            </p>
          </div>
          <figure className="sl-foto">
            <img
              src={planBild}
              width={1200}
              height={600}
              alt="Handgeschriebener Tilgungsplan für Frau Lorenz mit den Spalten Jahr, Schuld am Jahresanfang, Tilgung, Zinsen und Annuität. Jahr 1: 24.000,00; 1.551,99; 1.080,00; 2.631,99. Jahr 2: überall Fragezeichen, die Tilgung ist markiert. Notiz: Tilgung im 2. Jahr: dieselbe Formel wie im 1. Jahr?"
            />
          </figure>
          <BeispielMitVideo video={VIDEO_ANNUITAET} videoTitel="Lernvideo: Annuitätendarlehen, Tilgungsplan aufstellen">
            <Beispiel offen title="Die Wärmepumpe von Herrn Brandt: das 2. Jahr" aufgabe={BSP_AUFGABE} steps={BSP2_SCHRITTE} />
          </BeispielMitVideo>
          <Abschnitt titel="Vergleiche deine Ergebnisse">
            <TilgungsplanCheck
              onSolved={() => {
                fertig.teil('jahr2')()
                setJahr2Geloest(true)
              }}
              punkte={12}
              title="2. Zeile des Tilgungsplans"
              prompt={<p>Die 1. Zeile kennst du schon. Trage die Ergebnisse für das 2. Jahr aus deinem Heft ein. Jedes Feld zeigt dir sofort, ob es stimmt.</p>}
              feste={[ZEILE1]}
              zeilen={[ZEILE2]}
              solution={LOESUNG_JAHR2}
              help={
                <Hilfen
                  steps={[
                    <>Um wie viel ist die Schuld nach dem 1. Jahr kleiner geworden? Und gilt die Formel für die Tilgung im 1. Jahr auch im 2. Jahr?</>,
                    <>
                      Schuld am Anfang des 2. Jahres: <M>{'K_0 - T_1'}</M>. Für die Tilgung ab dem 2. Jahr gilt <M>{'T_v = T_1 \\cdot q^{v-1}'}</M>. Die Zinsen
                      berechnest du über die neue Schuld oder mit <M>{'A - T_2'}</M>.
                    </>,
                    <>
                      <M>{'24\\,000 - 1\\,551{,}99'}</M> und <M>{'T_2 = 1\\,551{,}99 \\cdot 1{,}045'}</M>.
                    </>,
                  ]}
                />
              }
            />
          </Abschnitt>
          <Abschnitt titel="Deine Antwort an Frau Lorenz">
            <McCard
              onSolved={fertig.teil('antwort')}
              punkte={3}
              title="Tilgt Frau Lorenz jedes Jahr gleich viel?"
              prompt={<p>Welche Antwort gibst du Frau Lorenz?</p>}
              options={[
                {
                  text: 'Ja. Die Annuität ist jedes Jahr gleich, also ist auch die Tilgung jedes Jahr gleich.',
                  feedback: 'Gleich bleibt nur die Summe aus Zinsen und Tilgung. Schau in deinen Tilgungsplan: Die Zinsen werden kleiner.',
                },
                {
                  text: 'Nein, sie tilgt mehr: im 1. Jahr 1.551,99 €, im 2. Jahr 1.621,83 €. Die Schuld wird kleiner, also auch die Zinsen. Der Rest der gleichen Rate geht in die Tilgung.',
                  correct: true,
                  feedback: (
                    <>
                      Die Tilgung wächst jedes Jahr mit dem Faktor <M>q</M>, die Zinsen sinken um denselben Betrag.
                    </>
                  ),
                },
                {
                  text: 'Nein, sie tilgt weniger: im 2. Jahr nur noch 1.451,63 €.',
                  feedback: (
                    <>
                      So viel kommt heraus, wenn man die Formel für <M>{'T_1'}</M> mit der neuen Schuld rechnet. Ab dem 2. Jahr gilt <M>{'T_v = T_1 \\cdot q^{v-1}'}</M>.
                    </>
                  ),
                },
                {
                  text: 'Die Tilgung steigt jedes Jahr um genau 69,84 €.',
                  feedback: (
                    <>
                      Von Jahr 1 zu Jahr 2 stimmt das. Die Tilgung wächst aber mit dem Faktor <M>q</M>: <M>{'T_3 = 1\\,694{,}81'}</M> €, das sind 72,98 € mehr als{' '}
                      <M>{'T_2'}</M>.
                    </>
                  ),
                },
              ]}
            />
          </Abschnitt>
          <Handlungsprodukt titel="Beratungsblatt für Frau Lorenz">
            <figure className="sl-foto sl-foto-klein">
              <img
                src={blattBild}
                width={800}
                height={400}
                alt="Ein Beratungsblatt mit der Überschrift Beratungsblatt Fr. Lorenz: oben die Berechnung von K₀, darunter ein leerer Tilgungsplan für die Jahre 1 und 2, darunter Zeilen für die Formeln und der Anfang einer Antwort: Liebe Frau Lorenz, … Daneben ein Kugelschreiber."
              />
            </figure>
            <p className="sl-text">
              Gestalte in deinem Heft ein Beratungsblatt für Frau Lorenz. Oben steht, wie du das Darlehen <M>{'K_0'}</M> berechnet hast. Darunter kommt der Tilgungsplan
              für die ersten 2 Jahre und zu jedem Wert die Formel mit eingesetzten Zahlen. Zum Schluss beantwortest du die Fragen von Frau Lorenz in zwei oder drei Sätzen.
            </p>
            <Aufklappbar label="Satzanfänge ansehen" icon="fa-comment-dots">
              <ul className="zk-liste">
                <li>„Die Bank leiht Ihnen nicht 27.500 €, sondern nur …, weil …“</li>
                <li>„Ihre Rate (Annuität) beträgt jedes Jahr …“</li>
                <li>„Im 1. Jahr zahlen Sie davon … Zinsen und tilgen …, im 2. Jahr …“</li>
                <li>„Die Rechnung Ihres Nachbarn passt nicht, weil …“</li>
                <li>
                  „Abkürzungen: <M>{'K_0'}</M> = …, <M>A</M> = …, <M>{'T_1'}</M> = …, <M>{'T_v'}</M> = …, <M>Z</M> = …, <M>q</M> = …, <M>n</M> = …, <M>v</M> = …“
                </li>
              </ul>
            </Aufklappbar>
          </Handlungsprodukt>
          <Abschnitt titel="Ist dein Beratungsblatt vollständig?">
            <Kriterien
              onAlle={fertig.teil('produkt')}
              items={[
                <>
                  Die Berechnung des Darlehens: <M>{'K_0'}</M> = Kaufpreis minus Eigenkapital
                </>,
                'Der Tilgungsplan für das 1. und 2. Jahr mit den Spalten Jahr, Schuld am Jahresanfang, Tilgung, Zinsen und Annuität',
                <>
                  Zu jedem Wert die Formel mit eingesetzten Zahlen: <M>A</M>, <M>{'T_1'}</M>, <M>{'T_2 = T_1 \\cdot q'}</M>, die Zinsen über die Schuld am Jahresanfang
                  oder mit <M>{'A - T'}</M>
                </>,
                'Eine Antwort an Frau Lorenz: Wie hoch ist die Rate, und warum steigt die Tilgung, obwohl die Rate gleich bleibt?',
                <>
                  Unter deinem Beratungsblatt steht, wofür die Abkürzungen stehen: <M>{'K_0'}</M> (Darlehensbetrag, Schuld am Anfang des 1. Jahres), <M>A</M> (Annuität,
                  jährliche Rate), <M>{'T_1'}</M> und <M>{'T_v'}</M> (Tilgung im 1. bzw. im <M>v</M>-ten Jahr), <M>Z</M> (Zinsen), <M>p</M> (Zinssatz), <M>q</M>{' '}
                  (Zinsfaktor), <M>n</M> (Laufzeit in Jahren) und <M>v</M> (Nummer des Jahres). Außerdem erklärst du die Begriffe Annuitätendarlehen, Tilgung, Restschuld und
                  Eigenkapital und alle anderen Wörter, die für dich neu waren.
                </>,
              ]}
            />
          </Abschnitt>
          {jahr2Geloest && (
            <Abschnitt titel="Das hältst du fest">
              <Rueckbezug wahl={fest ? wahl : null} />
              <Merke title="Annuitätendarlehen: Tilgungsplan mit den Formeln der Merkhilfe">
                <p>
                  Darlehensbetrag (Schuld am Anfang des 1. Jahres): <M>{'K_0'}</M> = Kaufpreis minus Eigenkapital
                </p>
                <p>Annuität (jedes Jahr gleich):</p>
                <MB>{'A = K_0 \\cdot \\dfrac{q^n \\cdot (q - 1)}{q^n - 1}'}</MB>
                <p>Tilgung im 1. Jahr (nur für das 1. Jahr):</p>
                <MB>{'T_1 = K_0 \\cdot \\dfrac{q - 1}{q^n - 1}'}</MB>
                <p>
                  Tilgung im Jahr <M>v</M> (ab dem 2. Jahr, z. B. <M>{'T_2 = T_1 \\cdot q'}</M>):
                </p>
                <MB>{'T_v = T_1 \\cdot q^{v - 1}'}</MB>
                <p>
                  Zinsen im Jahr <M>v</M>, auf zwei Wegen:
                </p>
                <MB>{'Z_v = \\text{Schuld am Jahresanfang} \\cdot \\dfrac{p}{100}'}</MB>
                <p>oder</p>
                <MB>{'Z_v = A - T_v'}</MB>
                <ul>
                  <li>Die Schuld am Anfang des nächsten Jahres ist die Schuld minus die Tilgung (nicht minus die ganze Annuität).</li>
                  <li>Die Annuität bleibt gleich. Die Zinsen sinken jedes Jahr, die Tilgung steigt um denselben Betrag.</li>
                  <li>
                    <M>{'q = 1 + \\frac{p}{100}'}</M> ist der Zinsfaktor, <M>n</M> die Laufzeit in Jahren, <M>v</M> die Nummer des Jahres.
                  </li>
                </ul>
              </Merke>
            </Abschnitt>
          )}
        </>
      ),
    },
    {
      art: 'sichern',
      titel: 'Übungsaufgaben',
      inhalt: (fertig) => (
        <>
          <p className="sl-text">
            Prüfe und vertiefe dein Wissen mit vier Aufgaben, dazu kommt eine für Profis. Hast du Übung 1 bis 4 gelöst, wird unten ein Spiel freigeschaltet.
          </p>
          <Abschnitt titel="Übung 1: Die Annuität für ein E-Auto">
            <TrackedMc
              onSolved={uebung('1', fertig.teil('1'))}
              punkte={4}
              topic="Annuitätendarlehen-Einstieg: Annuität mit K₀ (Basis)"
              title="Übung 1"
              rechnen
              level="basis"
              prompt={
                <p>
                  Herr Yilmaz kauft ein E-Auto für 32.000 € und zahlt 8.000 € an. Den Rest zahlt er mit einem Annuitätendarlehen zurück: 5 % p.a., Laufzeit 8 Jahre. Wie
                  hoch ist die Annuität?
                </p>
              }
              options={[
                {
                  text: '4.951,10 €',
                  feedback: (
                    <>
                      Hier wurde mit dem Kaufpreis gerechnet. Die Bank leiht aber nur <M>{'32\\,000 - 8\\,000 = 24\\,000'}</M> €.
                    </>
                  ),
                },
                {
                  text: '4.200,00 €',
                  feedback: (
                    <>
                      So rechnet man beim Ratendarlehen im 1. Jahr: <M>{'24\\,000 : 8 + 1\\,200'}</M>. Beim Annuitätendarlehen brauchst du die Formel für <M>A</M>.
                    </>
                  ),
                },
                {
                  text: '3.713,32 €',
                  correct: true,
                  feedback: <M>{'A = 24\\,000 \\cdot \\dfrac{1{,}05^8 \\cdot 0{,}05}{1{,}05^8 - 1} = 3\\,713{,}32 \\text{ €}'}</M>,
                },
                {
                  text: '2.513,32 €',
                  feedback: (
                    <>
                      Das ist die Tilgung im 1. Jahr <M>{'T_1'}</M>. Die Annuität ist Tilgung plus Zinsen.
                    </>
                  ),
                },
              ]}
            />
          </Abschnitt>
          <Abschnitt titel="Übung 2: Wer hat recht?">
            <TrackedMc
              onSolved={uebung('2', fertig.teil('2'))}
              punkte={5}
              topic="Annuitätendarlehen-Einstieg: T₂ mit der Formel für T_v (Standard)"
              title="Übung 2"
              rechnen
              level="standard"
              prompt={
                <>
                  <p>
                    Ein Darlehen über 15.000 € (3,5 % p.a., 8 Jahre) hat die Annuität 2.182,15 €. Im 1. Jahr werden 1.657,15 € getilgt. Lea und Tom berechnen die Tilgung
                    im 2. Jahr.
                  </p>
                  <p>
                    <strong>Lea:</strong> <M>{'T_2 = 1\\,657{,}15 \\cdot 1{,}035 = 1\\,715{,}15'}</M> €
                  </p>
                  <p>
                    <strong>Tom:</strong> „Die Schuld ist jetzt 13.342,85 €. Die setze ich in die Formel für die Tilgung ein:{' '}
                    <M>{'13\\,342{,}85 \\cdot \\dfrac{0{,}035}{1{,}035^8 - 1}'}</M> <M>{'= 1\\,474{,}07'}</M> €.“
                  </p>
                </>
              }
              options={[
                {
                  text: 'Tom, weil er mit der aktuellen Schuld rechnet.',
                  feedback: (
                    <>
                      Tom nimmt die Formel für <M>{'T_1'}</M>. Sie gilt nur im 1. Jahr mit <M>{'K_0'}</M>. Sein Ergebnis ist sogar kleiner als <M>{'T_1'}</M>, obwohl die
                      Tilgung jedes Jahr steigt.
                    </>
                  ),
                },
                {
                  text: 'Beide, sie rechnen nur auf verschiedenen Wegen.',
                  feedback: (
                    <>
                      Die Ergebnisse sind verschieden, also können nicht beide stimmen. Prüfe mit den Zinsen: <M>{'13\\,342{,}85 \\cdot 0{,}035 = 467{,}00'}</M> € und{' '}
                      <M>{'2\\,182{,}15 - 467{,}00 = 1\\,715{,}15'}</M> €.
                    </>
                  ),
                },
                {
                  text: 'Keiner: Die Tilgung bleibt bei 1.657,15 €.',
                  feedback: 'Die Annuität bleibt gleich, die Tilgung nicht. Weil die Zinsen sinken, steigt die Tilgung.',
                },
                {
                  text: (
                    <>
                      Lea: Ab dem 2. Jahr gilt <M>{'T_v = T_1 \\cdot q^{v-1}'}</M>, also <M>{'T_2 = T_1 \\cdot q'}</M>.
                    </>
                  ),
                  correct: true,
                  feedback: (
                    <>
                      Genau. Die Kontrolle über die Zinsen bestätigt es: <M>{'2\\,182{,}15 - 13\\,342{,}85 \\cdot 0{,}035 = 1\\,715{,}15'}</M> €.
                    </>
                  ),
                },
              ]}
            />
          </Abschnitt>
          <Abschnitt titel="Übung 3: Die Zinsen im 2. Jahr auf zwei Wegen">
            <TrackedCheck
              onSolved={uebung('3', fertig.teil('3'))}
              punkte={6}
              topic="Annuitätendarlehen-Einstieg: Zinsen auf zwei Wegen (Standard)"
              title="Übung 3"
              level="standard"
              prompt={
                <p>
                  Ein Darlehen über 30.000 € läuft 15 Jahre zu 5 % p.a. Die Annuität beträgt 2.890,27 €, die Tilgung im 1. Jahr 1.390,27 €. Berechne die Schuld am Anfang
                  des 2. Jahres und die Zinsen im 2. Jahr auf beiden Wegen.
                </p>
              }
              rechnung={[
                { l: ['K_1 = K_0 - T_1'], r: [{ luecke: 'k1', breit: true }] },
                { l: ['Z_2 = K_1 \\cdot 0{,}05'], r: [{ luecke: 'z2a', breit: true }], u: '\\text{Weg 1}' },
                { l: ['T_2 = T_1 \\cdot q'], r: [{ luecke: 't2', breit: true }] },
                { l: ['Z_2 = A - T_2'], r: [{ luecke: 'z2b', breit: true }], u: '\\text{Weg 2}' },
              ]}
              fields={[
                { kind: 'num', key: 'k1', label: 'Schuld am Anfang des 2. Jahres', expected: 28609.73, tol: TOL },
                { kind: 'num', key: 'z2a', label: 'Zinsen im 2. Jahr, Weg 1', expected: 1430.49, tol: TOL },
                { kind: 'num', key: 't2', label: 'Tilgung im 2. Jahr', expected: 1459.78, tol: TOL },
                { kind: 'num', key: 'z2b', label: 'Zinsen im 2. Jahr, Weg 2', expected: 1430.49, tol: TOL },
              ]}
              solution={
                <Loesungsweg
                  schritte={[
                    { titel: 'Schuld am Anfang des 2. Jahres', tex: 'K_1 = 30\\,000 - 1\\,390{,}27 = 28\\,609{,}73 \\text{ €}' },
                    { titel: 'Zinsen über die Schuld (Weg 1)', tex: 'Z_2 = 28\\,609{,}73 \\cdot 0{,}05 = 1\\,430{,}49 \\text{ €}' },
                    { titel: 'Tilgung im 2. Jahr', tex: 'T_2 = 1\\,390{,}27 \\cdot 1{,}05 = 1\\,459{,}78 \\text{ €}' },
                    { titel: 'Zinsen als Annuität minus Tilgung (Weg 2)', tex: 'Z_2 = 2\\,890{,}27 - 1\\,459{,}78 = 1\\,430{,}49 \\text{ €}' },
                  ]}
                />
              }
              help={
                <SchrittHilfen
                  schritte={[
                    { kurz: <M>{'K_1'}</M>, titel: 'Schuld am Anfang des 2. Jahres', hilfe: <p>Ziehe von 30.000 € nur die Tilgung des 1. Jahres ab, nicht die Annuität.</p> },
                    { kurz: 'Weg 1', titel: 'Zinsen über die Schuld', hilfe: <p>Multipliziere die Schuld am Anfang des 2. Jahres mit 0,05 (das sind 5 %).</p> },
                    { kurz: <M>{'T_2'}</M>, titel: 'Tilgung im 2. Jahr', hilfe: <p>Die Tilgung im 1. Jahr mal den Zinsfaktor q = 1,05.</p> },
                    { kurz: 'Weg 2', titel: 'Annuität minus Tilgung', hilfe: <p>Ziehe deine Tilgung im 2. Jahr von 2.890,27 € ab. Es muss dasselbe herauskommen wie bei Weg 1.</p> },
                  ]}
                />
              }
            />
          </Abschnitt>
          <Abschnitt titel="Übung 4: Frau Lorenz im 5. Jahr">
            <TrackedCheck
              onSolved={uebung('4', fertig.teil('4'))}
              punkte={8}
              topic="Annuitätendarlehen-Einstieg: Tilgung und Zinsen im Jahr v (Erweiterung)"
              title="Übung 4"
              level="erweiterung"
              prompt={
                <p>
                  Frau Lorenz möchte wissen, wie viel sie im 5. Jahr tilgt und wie viel Zinsen sie dann noch zahlt. Ihre Annuität beträgt 2.631,99 €, im 1. Jahr tilgt sie
                  1.551,99 € (4,5 % p.a., 12 Jahre). Rechne direkt, ohne den Tilgungsplan bis zum 5. Jahr aufzustellen.
                </p>
              }
              fieldsRow
              fields={[
                { kind: 'num', key: 't5', label: <M>{'T_5 ='}</M>, expected: T5, unit: '€', tol: TOL },
                { kind: 'num', key: 'z5', label: <M>{'Z_5 ='}</M>, expected: Z5, unit: '€', tol: TOL },
              ]}
              loesungNachFehler
              solution={
                <Loesungsweg
                  schritte={[
                    { titel: <>Formel für die Tilgung im Jahr <M>v</M> mit <M>{'v = 5'}</M></>, tex: ['T_5 = T_1 \\cdot q^{5 - 1} = 1\\,551{,}99 \\cdot 1{,}045^4', 'T_5 = 1\\,850{,}78 \\text{ €}'] },
                    { titel: 'Zinsen als Annuität minus Tilgung', tex: 'Z_5 = 2\\,631{,}99 - 1\\,850{,}78 = 781{,}21 \\text{ €}' },
                  ]}
                />
              }
              help={
                <Hilfen
                  steps={[
                    <>Welche Formel aus der Merkhilfe liefert die Tilgung in einem beliebigen Jahr?</>,
                    <>
                      <M>{'T_v = T_1 \\cdot q^{v-1}'}</M> mit <M>{'v = 5'}</M>. Die Zinsen sind dann der Rest der Annuität.
                    </>,
                    <>
                      <M>{'T_5 = 1\\,551{,}99 \\cdot 1{,}045^4'}</M> und <M>{'Z_5 = 2\\,631{,}99 - T_5'}</M>.
                    </>,
                  ]}
                />
              }
            />
          </Abschnitt>
          <Abschnitt titel="Übung 5 für Profis: Was kostet das Darlehen insgesamt?">
            <CheckCard
              title="Zinsen in 12 Jahren"
              level="erweiterung"
              profi
              punkte={9}
              prompt={
                <p>
                  Wie viel zahlt Frau Lorenz in den 12 Jahren insgesamt an die Bank zurück? Wie viel davon sind Zinsen?
                </p>
              }
              fieldsRow
              fields={[
                { kind: 'num', key: 'alle', label: 'alle Raten zusammen:', expected: r2(N * A), unit: '€', tol: 0.1 },
                { kind: 'num', key: 'zges', label: 'Zinsen insgesamt:', expected: r2(N * A - K0), unit: '€', tol: 0.1 },
              ]}
              loesungNachFehler
              solution={
                <Loesungsweg
                  schritte={[
                    { titel: 'Alle Raten zusammen', tex: '12 \\cdot 2\\,631{,}99 = 31\\,583{,}88 \\text{ €}' },
                    { titel: 'Zinsen = alle Raten minus Darlehen', tex: '31\\,583{,}88 - 24\\,000 = 7\\,583{,}88 \\text{ €}' },
                  ]}
                />
              }
              help={
                <Hilfen
                  steps={[
                    <>Frau Lorenz überweist 12-mal dieselbe Annuität. Was davon ist nicht Tilgung?</>,
                    <>Alle Raten zusammen minus das geliehene Geld ergibt die Zinsen.</>,
                    <>
                      <M>{'12 \\cdot 2\\,631{,}99'}</M>, davon ziehst du <M>{'24\\,000'}</M> ab.
                    </>,
                  ]}
                />
              }
            />
          </Abschnitt>
          <BonusSpiel frei={['1', '2', '3', '4'].every((k) => uebungen.includes(k))} titel="Schuldenberg">
            <SchuldenbergSpiel />
          </BonusSpiel>
          <Bilanz />
          <div className="sl-ende">
            <p>
              Du kannst jetzt den Tilgungsplan eines Annuitätendarlehens für die ersten Jahre aufstellen und mit den Formeln der Merkhilfe die Annuität, die Tilgung und die
              Zinsen berechnen. Bei den Übungsaufgaben berechnest du auch ein späteres Jahr.
            </p>
            <div className="bk-actions">
              <button type="button" className="bk-btn" onClick={onBack}>
                <i className="fa-solid fa-arrow-left" aria-hidden="true" /> Zurück zur Auswahl
              </button>
              <button type="button" className="bk-btn bk-btn-primary" onClick={onPractice}>
                Weiter üben: Tilgungsplan <i className="fa-solid fa-arrow-right" aria-hidden="true" />
              </button>
            </div>
          </div>
        </>
      ),
    },
  ]

  return (
    <TaskShell title="Annuitätendarlehen: Die Solaranlage" width="wide" kompakt parent={{ to: '/finanzmathe/annuitaetendarlehen', label: 'Annuitätendarlehen' }}>
      <SeitenLernsituation
        ruhig
        punkte
        thema={THEMA}
        bildwelt={BILDWELT}
        ziel={
          <>
            In dieser Lernsituation berätst du Frau Lorenz bei der Finanzierung ihrer Solaranlage. Du lernst, wie man beim Annuitätendarlehen die Annuität, die Tilgung und
            die Zinsen mit den Formeln der Merkhilfe berechnet und einen Tilgungsplan für die ersten zwei Jahre aufstellt.
          </>
        }
        seiten={seiten}
      />
    </TaskShell>
  )
}

/** Rückbezug auf die Vermutung aus „Problem erkennen“ */
function Rueckbezug({ wahl }: { wahl: Wahl | null }) {
  if (!wahl) return null
  return (
    <div className="ls-back">
      <p>
        <strong>Du hattest vermutet:</strong> {WAHL[wahl]}{' '}
        {wahl === 'mehr' ? 'Das stimmt!' : 'Tatsächlich tilgt Frau Lorenz mehr.'} Im 1. Jahr tilgt sie {euro(T1)}, im 2. Jahr {euro(T2)}. Die Rate bleibt gleich, aber
        die Zinsen sinken von {euro(Z1)} auf {euro(Z2)}, weil die Schuld kleiner geworden ist. Mit der Formel für <M>{'T_1'}</M> und der neuen Schuld käme fälschlich{' '}
        {euro(T2_FALSCH)} heraus. Und die Rechnung des Nachbarn ({euro(NACHBAR)}) war zu hoch: Die richtige Annuität ist {euro(A)}.
      </p>
    </div>
  )
}

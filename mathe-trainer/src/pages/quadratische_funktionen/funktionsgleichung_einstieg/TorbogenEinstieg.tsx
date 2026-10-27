import { useEffect, useId, useState, type ChangeEvent, type ReactNode } from 'react'
import TaskShell from '../../../components/layout/TaskShell'
import { Beispiel, M, MB, Merke, fmt, parseInput } from '../../daten_und_zufall/lernpfad/kit'
import { CheckCard, Hilfen, McCard, SchrittHilfen, tx } from '../../lineare_funktionen/lernsituation_kit/kit'
import {
  Abschnitt,
  Aufklappbar,
  BeispielMitVideo,
  BonusSpiel,
  Handlungsprodukt,
  SeitenLernsituation,
  type Seite,
  type Thema,
} from '../../lineare_funktionen/lernsituation_kit/seiten'
import { Bilanz, PUNKTE, usePunkteAufgabe } from '../../lineare_funktionen/lernsituation_kit/punkte'
import { Kriterien } from '../../finanzmathe/zins_kit/zins_kit'
import { LERNVIDEO_FALL1 } from '../FunktionsgleichungAufstellen'
import BogenKran from './BogenKran'
import '../../daten_und_zufall/lernpfad/lernpfad.css'
import './torbogen.css'

// Lernsituation 1 „Der Torbogen für die Hofeinfahrt“: Funktionsgleichung aus Scheitelpunkt und einem weiteren Punkt (Fall 1, ca. 45–60 min).
// Format Kundenauftrag / Maschine: Die SuS raten Gleichungen und schicken sie an die Biegemaschine (Live-Skizze, die Maschine meldet
// linken Pfosten, Mitte und rechten Pfosten). Nach drei Versuchen: Raten reicht nicht. Danach berechnen sie die Gleichung.
// Lernprodukt analog: Auftragsblatt für die Biegemaschine (Skizze, Rechnung in Schritten, beide Formen, Probe mit Q, Abkürzungen).
// Vorwissen: Scheitelform y = a(x − x_S)² + y_S und Umwandeln in die allgemeine Form. Neu ist, a mit einem zweiten Punkt zu bestimmen.
// Eine Seite pro Phase (SeitenLernsituation mit ruhig und punkte): Warm-up (5 Aufgaben) → Problem erkennen (Biegemaschine) →
// Problem lösen (Problem → Beispielrechnung mit Lernvideo → Ergebnisse abgleichen → Auftragsblatt → Das hältst du fest)
// → Wissen prüfen und vertiefen (vier Übungen, Bonus-Spiel „Bogen-Kran“, Bilanz).
// Aha: Durch Raten trifft man die Gleichung kaum, mit Scheitelpunkt und einem weiteren Punkt lässt sie sich sicher berechnen.
// Fehlerhafte Azubi-Pläne kommen erst in Phase 4, wenn die SuS den Weg selbst gerechnet haben.
// Punkte nach Aufwand: Warm-up 2/2/2/3/2, Biegemaschine 3, Ergebnis-Abgleich 15, Auftragsblatt 5, Übungen 4/6/6, Profi 8
// (Pflicht zusammen 50: Warm-up 22 %, Problem lösen 40 %, Übungen 32 %).
// Die Versuche an der Maschine bleiben nur im Seitenzustand (kein Speichern) und werden in „Das hältst du fest“ wieder aufgegriffen.

/* ── Situation ───────────────────────────────────────────────────────────── */

// Hofeinfahrt 4 m breit, Pfosten 2 m hoch bei x = 0 und x = 4, höchster Punkt des Bogens 3 m über der Mitte.
// Richtig: y = −0,25(x − 2)² + 3 = −0,25x² + x + 2
const A_SOLL = -0.25
const bogen = (a: number) => (x: number) => a * (x - 2) ** 2 + 3

/** Eine Gleichung, die an die Biegemaschine geschickt wurde */
type Versuch = { a: number; b: number; c: number }
const wert = (v: Versuch) => (x: number) => v.a * x * x + v.b * x + v.c
const nah = (u: number, w: number) => Math.abs(u - w) < 1e-9
/** Die Maschine prüft drei Stellen: linker Pfosten, Mitte (Scheitel), rechter Pfosten. Drei Punkte legen die Parabel fest. */
const pruefung = (v: Versuch) => {
  const f = wert(v)
  return [
    { key: 'links', name: 'linker Pfosten', soll: 2, ist: f(0) },
    { key: 'mitte', name: 'Mitte', soll: 3, ist: f(2) },
    { key: 'rechts', name: 'rechter Pfosten', soll: 2, ist: f(4) },
  ].map((p) => ({ ...p, ok: nah(p.ist, p.soll) }))
}
const passt = (v: Versuch) => pruefung(v).every((p) => p.ok)

/** Höhe als Text mit echtem Minuszeichen, z. B. „−1,5 m“ */
const meter = (v: number) => `${fmt(v, 2).replace('-', '−')} m`

/** Gleichung als TeX, z. B. y = −0,5x² + 2x + 1 */
function gleichungTex(v: Versuch) {
  const glied = (k: number, x: string, erstes: boolean) => {
    if (k === 0) return ''
    const betrag = Math.abs(k)
    const zahl = x && betrag === 1 ? '' : tx(betrag)
    const vz = k < 0 ? '-' : erstes ? '' : '+'
    return ` ${vz} ${zahl}${x}`
  }
  const t = glied(v.a, 'x^2', true) + glied(v.b, 'x', v.a === 0) + glied(v.c, '', v.a === 0 && v.b === 0)
  return `y =${t || ' 0'}`
}

/** Phase 2: Situation, Problem und Auftrag als Fließtext; nur der Auftrag ist hervorgehoben */
function ProblemText() {
  return (
    <>
      <p className="sl-text">
        Du bist Azubi im Metallbau. Über einer 4&nbsp;m breiten Hofeinfahrt entsteht ein Torbogen aus Stahlrohr: Die Pfosten sind 2&nbsp;m hoch, in der Mitte ist der Bogen
        3&nbsp;m hoch.
      </p>
      <p className="sl-text">
        Du kennst also den Scheitelpunkt <M>{'S(2 \\mid 3)'}</M> und einen weiteren Punkt <M>{'P(0 \\mid 2)'}</M> des Bogens. Die Biegemaschine braucht die
        Funktionsgleichung in allgemeiner Form <M>{'y = ax^2 + bx + c'}</M>.
      </p>
      <div className="sl-fokus">
        <p className="sl-fokus-titel">Dein Auftrag: Probier es aus, ohne zu rechnen</p>
        <p>
          Rate Werte für <M>a</M>, <M>b</M> und <M>c</M> und schicke die Gleichung an die Biegemaschine.
        </p>
      </div>
    </>
  )
}

/* ── Identität: Titelbild, Themenfarbe Kupfer (Metallbau), Leitobjekt Biegemaschine ───── */

/** Titelbild der Startbox: Hofeinfahrt zwischen zwei Hauswänden, Torbogen aus Stahlrohr mit den Maßen aus dem Auftrag */
function Titelbild() {
  // Maßstab: 1 m = 46 px, Boden bei y = 212, linker Pfosten bei x = 268
  const X = (m: number) => 268 + m * 46
  const Y = (m: number) => 212 - m * 46
  const bogen = Array.from({ length: 41 }, (_, i) => i / 10).map((m) => `${X(m)},${Y(-0.25 * (m - 2) ** 2 + 3)}`).join(' ')
  return (
    <svg viewBox="0 0 720 252" role="img" aria-label="Hofeinfahrt mit einem Torbogen aus Stahlrohr: 4 m breit, Pfosten 2 m hoch, in der Mitte 3 m hoch">
      <rect x="0" y="212" width="720" height="40" fill="var(--surface-sunken)" />
      <line x1="0" x2="720" y1="212" y2="212" stroke="var(--ink)" strokeWidth="2" />
      {/* Hauswände links und rechts */}
      <rect x="40" y="70" width="200" height="142" fill="var(--surface)" stroke="var(--ink)" strokeWidth="2" />
      <polygon points="30,72 140,22 250,72" fill="var(--primary)" opacity="0.85" />
      <rect x="80" y="110" width="44" height="40" fill="var(--primary-soft)" stroke="var(--ink)" strokeWidth="2" />
      <rect x="160" y="140" width="44" height="72" fill="var(--primary-soft)" stroke="var(--ink)" strokeWidth="2" />
      <rect x="480" y="90" width="200" height="122" fill="var(--surface)" stroke="var(--ink)" strokeWidth="2" />
      <polygon points="470,92 580,46 690,92" fill="var(--primary)" opacity="0.85" />
      <rect x="520" y="126" width="44" height="40" fill="var(--primary-soft)" stroke="var(--ink)" strokeWidth="2" />
      <rect x="600" y="126" width="44" height="40" fill="var(--primary-soft)" stroke="var(--ink)" strokeWidth="2" />
      {/* Torbogen */}
      <rect x={X(0) - 6} y={Y(2)} width="12" height={Y(0) - Y(2)} fill="var(--ink-muted)" stroke="var(--ink)" strokeWidth="2" />
      <rect x={X(4) - 6} y={Y(2)} width="12" height={Y(0) - Y(2)} fill="var(--ink-muted)" stroke="var(--ink)" strokeWidth="2" />
      <polyline points={bogen} fill="none" stroke="var(--primary)" strokeWidth="7" strokeLinecap="round" />
      {/* Maße */}
      <line x1={X(2)} x2={X(2)} y1={Y(0)} y2={Y(3) + 6} stroke="var(--ink)" strokeWidth="1.5" strokeDasharray="5 4" />
      <text x={X(2) + 8} y={Y(1.5)} fontSize="17" fontWeight="700" fill="var(--ink)">3 m</text>
      <text x={X(0) + 12} y={Y(1)} fontSize="17" fontWeight="700" fill="var(--ink)">2 m</text>
      <line x1={X(0)} x2={X(4)} y1="224" y2="224" stroke="var(--ink)" strokeWidth="1.5" />
      <line x1={X(0)} x2={X(0)} y1="218" y2="230" stroke="var(--ink)" strokeWidth="1.5" />
      <line x1={X(4)} x2={X(4)} y1="218" y2="230" stroke="var(--ink)" strokeWidth="1.5" />
      <text x={X(2)} y="246" textAnchor="middle" fontSize="17" fontWeight="700" fill="var(--ink)">4 m</text>
    </svg>
  )
}

const THEMA: Thema = { name: 'Der Torbogen', farbe: 'kupfer', icon: 'fa-archway', bild: <Titelbild /> }

/* ── Sachbild: Hofeinfahrt mit Torbogen ──────────────────────────────────── */

const S = { w: 640, h: 340, l: 44, r: 14, t: 12, b: 34, xMin: -1.5, xMax: 5.5, yMin: -0.6, yMax: 4.6 }
const bx = (x: number) => S.l + ((x - S.xMin) / (S.xMax - S.xMin)) * (S.w - S.l - S.r)
const by = (y: number) => S.h - S.b - ((y - S.yMin) / (S.yMax - S.yMin)) * (S.h - S.t - S.b)

const kurve = (f: (x: number) => number, von: number, bis: number) =>
  Array.from({ length: Math.round((bis - von) * 20) + 1 }, (_, i) => von + i / 20)
    .map((x) => `${bx(x)},${by(f(x))}`)
    .join(' ')

const SOLL_BOGEN = kurve(bogen(A_SOLL), 0, 4)

type Kurve = { f: (x: number) => number; farbe: string; breite: number }

/** Skizze der Einfahrt; kurven = Parabeln (z. B. Versuche an der Maschine) über die gestrichelte Skizze legen; nurP = ohne rechten Pfosten Q */
/** neuS: Sonderwunsch mit neuer Scheitelhöhe; der bisherige Bogen bleibt blass zum Vergleich stehen */
function TorBild({ kurven = [], nurP = false, neuS, gross = false }: { kurven?: Kurve[]; nurP?: boolean; neuS?: number; gross?: boolean }) {
  const clip = useId().replace(/[^a-zA-Z0-9]/g, '')
  /** gross: größere Beschriftung für flach dargestellte Skizzen */
  const fs = (n: number) => (gross ? Math.round(n * 1.2) : n)
  return (
    <div className="bk-graph ls-graph">
      <svg viewBox={`0 0 ${S.w} ${S.h}`} role="img" aria-label="Skizze der Hofeinfahrt mit zwei Pfosten und einem parabelförmigen Torbogen im Koordinatensystem">
        <defs>
          <clipPath id={clip}>
            <rect x={bx(S.xMin)} y={S.t} width={bx(S.xMax) - bx(S.xMin)} height={by(S.yMin) - S.t} />
          </clipPath>
        </defs>
        {Array.from({ length: 6 }, (_, i) => i - 1).map((v) => (
          <g key={`x${v}`}>
            <line x1={bx(v)} x2={bx(v)} y1={by(0)} y2={by(S.yMax)} stroke="var(--grid)" />
            <text x={bx(v)} y={by(0) + 24} textAnchor="middle" fontSize={fs(18)} fill="var(--ink-muted)">
              {v}
            </text>
          </g>
        ))}
        {[1, 2, 3, 4].map((v) => (
          <g key={`y${v}`}>
            <line x1={bx(S.xMin)} x2={bx(S.xMax)} y1={by(v)} y2={by(v)} stroke="var(--grid)" />
            <text x={bx(0) - 8} y={by(v) + 6} textAnchor="end" fontSize={fs(18)} fill="var(--ink-muted)">
              {v}
            </text>
          </g>
        ))}
        <rect x={bx(S.xMin)} y={by(0)} width={bx(S.xMax) - bx(S.xMin)} height={by(S.yMin) - by(0)} fill="var(--surface-sunken)" />
        <line x1={bx(S.xMin)} x2={bx(S.xMax)} y1={by(0)} y2={by(0)} stroke="var(--ink)" strokeWidth="3" />
        <line x1={bx(0)} x2={bx(0)} y1={by(S.yMin)} y2={by(S.yMax)} stroke="var(--ink)" strokeWidth="1.5" />
        {(nurP ? [0] : [0, 4]).map((x) => (
          <rect key={x} x={bx(x) - 7} y={by(2)} width="14" height={by(0) - by(2)} fill="var(--ink-muted)" stroke="var(--ink)" strokeWidth="2" />
        ))}
        <polyline
          points={SOLL_BOGEN}
          fill="none"
          stroke={neuS ? 'var(--line-strong)' : 'var(--ink)'}
          strokeWidth={neuS ? 2 : 3}
          strokeDasharray="8 6"
        />
        {kurven.length > 0 && (
          <g clipPath={`url(#${clip})`}>
            {kurven.map((k, i) => (
              <polyline key={i} points={kurve(k.f, S.xMin, S.xMax)} fill="none" stroke={k.farbe} strokeWidth={k.breite} strokeLinecap="round" />
            ))}
          </g>
        )}
        {neuS ? (
          <>
            <line x1={bx(2)} x2={bx(2)} y1={by(0)} y2={by(neuS)} stroke="var(--primary)" strokeWidth="2" strokeDasharray="4 4" />
            <text x={bx(2) + 8} y={by(neuS / 2)} fontSize={fs(16)} fontWeight="700" fill="var(--primary)">
              {fmt(neuS)} m
            </text>
            <circle cx={bx(2)} cy={by(3)} r="5" fill="var(--surface)" stroke="var(--line-strong)" strokeWidth="2" />
            <text x={bx(3.6)} y={by(3.1)} fontSize={fs(15)} fill="var(--ink-muted)">
              bisheriger Bogen
            </text>
            <circle cx={bx(2)} cy={by(neuS)} r="8" fill="var(--highlight)" stroke="var(--ink)" strokeWidth={gross ? 3 : 2.5} />
            <text x={bx(2)} y={by(neuS) - 14} textAnchor="middle" fontSize={fs(18)} fontWeight="700" fill="var(--ink)">
              neu: S(2 | {fmt(neuS)})
            </text>
          </>
        ) : (
          <>
            <circle cx={bx(2)} cy={by(3)} r={gross ? 9 : 7} fill="var(--highlight)" stroke="var(--ink)" strokeWidth={gross ? 3 : 2.5} />
            <text x={bx(2)} y={by(3) - 14} textAnchor="middle" fontSize={fs(18)} fontWeight="700" fill="var(--ink)">
              S(2 | 3)
            </text>
          </>
        )}
        <circle cx={bx(0)} cy={by(2)} r={gross ? 9 : 7} fill="var(--surface)" stroke="var(--ink)" strokeWidth={gross ? 3 : 2.5} />
        <text x={bx(0) - 12} y={by(2) - 22} textAnchor="end" fontSize={fs(18)} fontWeight="700" fill="var(--ink)">
          P(0 | 2)
        </text>
        {!nurP && (
          <>
            <circle cx={bx(4)} cy={by(2)} r={gross ? 9 : 7} fill="var(--surface)" stroke="var(--ink)" strokeWidth={gross ? 3 : 2.5} />
            <text x={bx(4) + 12} y={by(2) - 22} fontSize={fs(18)} fontWeight="700" fill="var(--ink)">
              Q(4 | 2)
            </text>
          </>
        )}
        <text x={bx(S.xMax) - 4} y={by(0) - 8} textAnchor="end" fontSize={fs(14)} fill="var(--ink-muted)">
          {gross ? 'x in m' : 'Boden (x in m)'}
        </text>
      </svg>
    </div>
  )
}

/** Biegemaschine: Gleichung eintippen, senden, Bogen erscheint in der Skizze, die Maschine meldet, was passt */
function Biegemaschine({ auftrag, versuche, onSenden }: { auftrag: ReactNode; versuche: Versuch[]; onSenden: (v: Versuch) => void }) {
  const uid = useId()
  const [eingabe, setEingabe] = useState({ a: '', b: '', c: '' })
  const [fehlt, setFehlt] = useState(false)
  const letzter = versuche[versuche.length - 1]
  const treffer = versuche.some(passt)
  // Ausprobieren zählt wie eine Festlegung (PUNKTE.festlegung), sobald die Seite frei ist
  const pt = usePunkteAufgabe({ wert: PUNKTE.festlegung, serie: false })
  const frei = versuche.length >= 3 || treffer
  useEffect(() => {
    if (frei) pt.geloest()
  }, [frei, pt])
  const kurven: Kurve[] = versuche.map((v, i) => ({
    f: wert(v),
    farbe: passt(v) ? 'var(--correct)' : i === versuche.length - 1 ? 'var(--primary)' : 'var(--line-strong)',
    breite: i === versuche.length - 1 ? 4.5 : 2.5,
  }))

  const senden = () => {
    const a = parseInput(eingabe.a)
    const b = parseInput(eingabe.b)
    const c = parseInput(eingabe.c)
    if (!a || !b || !c) return setFehlt(true)
    setFehlt(false)
    onSenden({ a: a.value, b: b.value, c: c.value })
  }
  const feld = (k: 'a' | 'b' | 'c', label: string) => (
    <input
      type="text"
      inputMode="decimal"
      autoComplete="off"
      placeholder={k}
      aria-label={label}
      id={`${uid}-${k}`}
      className="bk-input lp-input lp-input-sm ls-gap"
      value={eingabe[k]}
      onChange={(e: ChangeEvent<HTMLInputElement>) => setEingabe({ ...eingabe, [k]: e.target.value })}
    />
  )

  return (
    <div className="tb-maschine" data-no-autocheck>
      {auftrag}
      <TorBild kurven={kurven} gross />
      <div className="tb-eingabe">
        <M>{'y ='}</M> {feld('a', 'Zahl vor x²')} <M>{'x^2'}</M> {feld('b', 'Zahl vor x mit Vorzeichen')} <M>{'x'}</M> {feld('c', 'Zahl ohne x mit Vorzeichen')}
        <button type="button" className="bk-btn bk-btn-primary" onClick={senden}>
          <i className="fa-solid fa-paper-plane" aria-hidden="true" /> An die Maschine senden
        </button>
      </div>
      {fehlt && (
        <div className="bk-feedback bk-feedback-info lp-feedback" role="status">
          <i className="fa-solid fa-pen" aria-hidden="true" /> Bitte trage in alle drei Felder eine Zahl ein, auch 0 ist erlaubt.
        </div>
      )}
      {letzter && (
        <div className={`tb-display ${passt(letzter) ? 'tb-display-ok' : ''}`} role="status">
          <div className="tb-display-head">
            <i className="fa-solid fa-gears" aria-hidden="true" /> Biegemaschine, Versuch {versuche.length}: <M>{gleichungTex(letzter)}</M>
          </div>
          <ul>
            {pruefung(letzter).map((p) => (
              <li key={p.key}>
                <i className={`fa-solid ${p.ok ? 'fa-circle-check' : 'fa-circle-xmark'}`} aria-hidden="true" /> {p.name}:{' '}
                {p.ok ? <>{meter(p.soll)}, passt</> : <>{meter(p.ist)} statt {meter(p.soll)}</>}
              </li>
            ))}
          </ul>
        </div>
      )}
      {(versuche.length >= 3 || treffer) && (
        <p className="sl-hinweis">
          {treffer ? 'Treffer! Aber der nächste Bogen hat andere Maße.' : 'Raten bringt dich kaum ans Ziel.'} Gleich lernst du, wie du sicher rechnest.
        </p>
      )}
    </div>
  )
}

/** Handlungsprodukt: Auftragsblatt für die Kollegin an der Biegemaschine */
function AuftragsblattBild() {
  return (
    <div className="zk-bild zk-bild-klein">
      <svg
        viewBox="0 0 720 190"
        role="img"
        aria-label="Ein Auftragsblatt auf einem Klemmbrett mit der Überschrift Auftrag Torbogen. Links eine kleine Skizze mit Bogen und zwei Pfosten, rechts Zeilen für die Rechnung und die Gleichung für die Maschine."
      >
        <rect x="170" y="10" width="380" height="174" rx="10" fill="var(--primary-soft)" stroke="var(--ink)" strokeWidth="2" />
        <rect x="190" y="26" width="340" height="150" rx="4" fill="var(--surface)" stroke="var(--ink)" strokeWidth="2" />
        <rect x="320" y="2" width="80" height="20" rx="6" fill="var(--ink-muted)" stroke="var(--ink)" strokeWidth="2" />
        <text x="360" y="54" textAnchor="middle" fontSize="19" fontWeight="800" fill="var(--ink)">
          Auftrag Torbogen
        </text>
        {/* kleine Skizze */}
        <line x1="206" x2="320" y1="160" y2="160" stroke="var(--ink)" strokeWidth="2" />
        <rect x="218" y="122" width="7" height="38" fill="var(--ink-muted)" />
        <rect x="301" y="122" width="7" height="38" fill="var(--ink-muted)" />
        <path d="M221 122 Q263 74 305 122" fill="none" stroke="var(--primary)" strokeWidth="5" strokeLinecap="round" />
        <circle cx="263" cy="98" r="5" fill="var(--highlight)" stroke="var(--ink)" strokeWidth="1.5" />
        {/* Zeilen */}
        <text x="340" y="88" fontSize="16" fill="var(--ink)" fontStyle="italic">
          ① ② ③ ④ …
        </text>
        {[104, 124].map((y) => (
          <line key={y} x1="340" x2="512" y1={y} y2={y} stroke="var(--line-strong)" strokeWidth="2" />
        ))}
        <text x="340" y="154" fontSize="16" fill="var(--ink)">
          <tspan fontStyle="italic">An die Maschine:</tspan> y = …
        </text>
      </svg>
    </div>
  )
}

// Farben im Lösungsweg: Werte des Scheitelpunkts blau, Werte des Punkts P grün, der berechnete Formfaktor a orange
const FS = (t: string) => `\\textcolor{#1d4ed8}{${t}}`
const FP = (t: string) => `\\textcolor{#15803d}{${t}}`
const FA = (t: string) => `\\textcolor{#c2410c}{${t}}`

/* ── Rechenbeispiel (andere Zahlen): S(−1 | 5) und P(1 | 3) ─────────────── */

const BSP_AUFGABE = (
  <p>
    Eine Parabel hat den Scheitelpunkt <M>{'S(-1 \\mid 5)'}</M> und geht durch den Punkt <M>{'P(1 \\mid 3)'}</M>. Stelle die Funktionsgleichung in Scheitelform und in
    allgemeiner Form auf.
  </p>
)
const BSP_SCHRITTE = [
  {
    title: 'Scheitelpunkt in die Scheitelform einsetzen',
    body: (
      <>
        <p>
          Setze <M>{FS('x_S = -1')}</M> und <M>{FS('y_S = 5')}</M> ein. Negative Zahlen immer in Klammern setzen:
        </p>
        <MB>{`\\begin{aligned} y &= a(x - ${FS('x_S')})^2 + ${FS('y_S')} \\\\ y &= a(x - ${FS('(-1)')})^2 + ${FS('5')} \\\\ y &= a(x + 1)^2 + 5 \\end{aligned}`}</MB>
      </>
    ),
  },
  {
    title: <>Punkt einsetzen und <M>a</M> berechnen</>,
    body: (
      <>
        <p>
          Setze <M>{FP('P(1 \\mid 3)')}</M> ein, also <M>{FP('x = 1')}</M> und <M>{FP('y = 3')}</M>, und löse nach <M>a</M> auf:
        </p>
        <MB>{`\\begin{aligned} y &= a(x + 1)^2 + 5 \\\\ ${FP('3')} &= a \\cdot (${FP('1')} + 1)^2 + 5 \\\\ 3 &= a \\cdot 2^2 + 5 \\\\ 3 &= 4a + 5 && \\mid -5 \\\\ -2 &= 4a && \\mid :4 \\\\ a &= ${FA('-0{,}5')} \\end{aligned}`}</MB>
      </>
    ),
  },
  {
    title: 'Funktionsgleichung in Scheitelform angeben',
    body: (
      <>
        <p>
          Setze <M>{FA('a = -0{,}5')}</M> in den Ansatz aus Schritt 1 ein:
        </p>
        <MB>{`\\begin{aligned} y &= ${FA('a')}(x + 1)^2 + 5 \\\\ y &= ${FA('-0{,}5')}(x + 1)^2 + 5 \\end{aligned}`}</MB>
      </>
    ),
  },
  {
    title: 'In die allgemeine Form umwandeln',
    body: (
      <>
        <p>
          Löse die Klammer auf, multipliziere dann <strong>jeden</strong> Summanden mit <M>a</M> (Punkt vor Strich) und fasse zusammen:
        </p>
        <MB>{'\\begin{aligned} y &= -0{,}5 \\cdot (x + 1)^2 + 5 \\\\ y &= -0{,}5 \\cdot [(x + 1) \\cdot (x + 1)] + 5 \\\\ y &= -0{,}5 \\cdot [x^2 + 2x + 1] + 5 \\\\ y &= -0{,}5x^2 - x - 0{,}5 + 5 \\\\ y &= -0{,}5x^2 - x + 4{,}5 \\end{aligned}'}</MB>
      </>
    ),
  },
]

/** Lösungsweg für den Torbogen */
const LOESUNG = (
  <>
    <p>
      ① Scheitelpunkt <M>{FS('S(2 \\mid 3)')}</M> einsetzen:
    </p>
    <MB>{`\\begin{aligned} y &= a(x - ${FS('x_S')})^2 + ${FS('y_S')} \\\\ y &= a(x - ${FS('2')})^2 + ${FS('3')} \\end{aligned}`}</MB>
    <p>
      ② Pfosten <M>{FP('P(0 \\mid 2)')}</M> einsetzen (<M>{FP('x = 0')}</M>, <M>{FP('y = 2')}</M>) und nach <M>a</M> auflösen:
    </p>
    <MB>{`\\begin{aligned} ${FP('2')} &= a \\cdot (${FP('0')} - 2)^2 + 3 \\\\ 2 &= 4a + 3 && \\mid -3 \\\\ -1 &= 4a && \\mid :4 \\\\ a &= ${FA('-0{,}25')} \\end{aligned}`}</MB>
    <p>
      ③ <M>{FA('a = -0{,}25')}</M> einsetzen, Scheitelform:
    </p>
    <MB>{`y = ${FA('-0{,}25')}(x - 2)^2 + 3`}</MB>
    <p>④ In die allgemeine Form umwandeln:</p>
    <MB>{'\\begin{aligned} y &= -0{,}25 \\cdot [(x - 2) \\cdot (x - 2)] + 3 \\\\ y &= -0{,}25 \\cdot [x^2 - 4x + 4] + 3 \\\\ y &= -0{,}25x^2 + x - 1 + 3 \\\\ y &= -0{,}25x^2 + x + 2 \\end{aligned}'}</MB>
  </>
)

/** Plan eines Azubis mit nummerierten Rechenschritten (für „Wer hat recht?“); die Zeilen eines Schritts stehen untereinander, am = ausgerichtet */
function Bericht({ name, zeilen, ergebnis }: { name: string; zeilen: string[][]; ergebnis: string }) {
  return (
    <div className="wm-bericht">
      <div className="wm-bericht-name">Plan von {name}</div>
      <ul className="wm-zeilen">
        {zeilen.map((z, i) => (
          <li key={i}>
            <b>{i + 1}</b>
            <span>
              <M>{`\\begin{aligned} ${z.join(' \\\\ ')} \\end{aligned}`}</M>
            </span>
          </li>
        ))}
      </ul>
      <div className="wm-ergebnis">
        An die Biegemaschine: <M>{ergebnis}</M>
      </div>
    </div>
  )
}

const SCHRITTE = ['Schritt 1 (Scheitel einsetzen)', 'Schritt 2 (a berechnen)', 'Schritt 3 (umwandeln)']

/* ── Seite ───────────────────────────────────────────────────────────────── */

export default function TorbogenEinstieg({ onBack, onPractice, onNext }: { onBack: () => void; onPractice: () => void; onNext: () => void }) {
  const [versuche, setVersuche] = useState<Versuch[]>([])
  const [geloest, setGeloest] = useState(false)
  const [uebungen, setUebungen] = useState<string[]>([])
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
          <p className="sl-text">Diese fünf kurzen Aufgaben brauchst du gleich für den Torbogen.</p>
          <McCard
            onSolved={fertig.teil('a')}
            punkte={2}
            title="a) Scheitelpunkt ablesen"
            prompt={
              <p>
                Welchen Scheitelpunkt hat die Parabel <M>{'y = -2(x - 1)^2 + 4'}</M>?
              </p>
            }
            options={[
              {
                text: <M>{'S(-1 \\mid 4)'}</M>,
                feedback: (
                  <>
                    In der Klammer steht <M>{'x - 1'}</M>. Das Minus gehört zur Formel, der Scheitel liegt also bei <M>{'x = 1'}</M>.
                  </>
                ),
              },
              {
                text: <M>{'S(4 \\mid 1)'}</M>,
                feedback: <>Die Koordinaten sind vertauscht. Die Zahl in der Klammer gehört zum x-Wert, die Zahl hinten zum y-Wert.</>,
              },
              {
                text: <M>{'S(1 \\mid 4)'}</M>,
                correct: true,
                feedback: (
                  <>
                    In der Scheitelform <M>{'y = a(x - x_S)^2 + y_S'}</M> steht <M>{'x_S'}</M> mit umgekehrtem Vorzeichen in der Klammer.
                  </>
                ),
              },
              {
                text: <M>{'S(-2 \\mid 4)'}</M>,
                feedback: (
                  <>
                    Die <M>{'-2'}</M> vor der Klammer ist der Formfaktor <M>a</M>. Er sagt, wie steil die Parabel ist, nicht wo der Scheitel liegt.
                  </>
                ),
              },
            ]}
          />
          <CheckCard
            onSolved={fertig.teil('b')}
            punkte={2}
            title="b) Scheitelform aufschreiben"
            rechnen={false}
            prompt={
              <p>
                Eine Parabel hat den Scheitelpunkt <M>{'S(3 \\mid -1)'}</M>. Setze ihn in die Scheitelform <M>{'y = a(x - x_S)^2 + y_S'}</M> ein. Das <M>a</M> bleibt als
                Buchstabe stehen. Trage die Zahl am Ende mit Vorzeichen ein, z.&nbsp;B. <M>{'+2'}</M> oder <M>{'-2'}</M>.
              </p>
            }
            rechnung={[{ l: ['y'], r: ['a \\cdot (x -', { luecke: 'xs' }, ')^2', { luecke: 'ys' }] }]}
            fields={[
              { kind: 'num', key: 'xs', label: 'x-Wert in der Klammer', expected: 3 },
              { kind: 'num', key: 'ys', label: 'Zahl am Ende mit Vorzeichen', expected: -1 },
            ]}
            solution={
              <>
                <MB>{'y = a(x - 3)^2 + (-1) = a(x - 3)^2 - 1'}</MB>
                <p>
                  <M>{'x_S = 3'}</M> kommt in die Klammer, <M>{'y_S = -1'}</M> ans Ende.
                </p>
              </>
            }
          />
          <CheckCard
            onSolved={fertig.teil('c')}
            punkte={2}
            title="c) Klammer mit Quadrat ausrechnen"
            prompt={<p>Rechne aus. Achte auf das Vorzeichen.</p>}
            fieldsRow
            fields={[
              { kind: 'num', key: 'q1', label: <M>{'(0 - 2)^2 ='}</M>, expected: 4 },
              { kind: 'num', key: 'q2', label: <M>{'(1 - 4)^2 ='}</M>, expected: 9 },
            ]}
            solution={<MB>{'(0 - 2)^2 = (-2) \\cdot (-2) = 4 \\qquad (1 - 4)^2 = (-3) \\cdot (-3) = 9'}</MB>}
          />
          <CheckCard
            onSolved={fertig.teil('d')}
            punkte={3}
            title={<>d) Gleichung nach <M>a</M> lösen</>}
            prompt={
              <p>
                Löse die Gleichung <M>{'7 = 4a + 3'}</M>.
              </p>
            }
            fields={[{ kind: 'num', key: 'a', label: <M>{'a ='}</M>, expected: 1 }]}
            solution={<MB>{'\\begin{aligned} 7 &= 4a + 3 && \\mid -3 \\\\ 4 &= 4a && \\mid :4 \\\\ a &= 1 \\end{aligned}'}</MB>}
          />
          <CheckCard
            onSolved={fertig.teil('e')}
            punkte={2}
            title="e) Klammer ausmultiplizieren"
            prompt={
              <p>
                Fasse die nachfolgenden Terme zusammen, indem du die Klammern vollständig auflöst. Trage die Zahlen mit Vorzeichen ein, z.&nbsp;B. <M>{'+9'}</M> oder{' '}
                <M>{'-6'}</M>.
              </p>
            }
            rechnung={[
              { l: ['(x - 3)^2'], r: ['x^2', { luecke: 'b1' }, 'x', { luecke: 'c1' }] },
              { l: ['-0{,}5 \\cdot (x - 3)^2'], r: ['-0{,}5x^2', { luecke: 'b2' }, 'x', { luecke: 'c2' }] },
            ]}
            fields={[
              { kind: 'num', key: 'b1', label: 'Zahl vor x mit Vorzeichen', expected: -6 },
              { kind: 'num', key: 'c1', label: 'Zahl ohne x mit Vorzeichen', expected: 9 },
              { kind: 'num', key: 'b2', label: 'Zahl vor x mit Vorzeichen', expected: 3 },
              { kind: 'num', key: 'c2', label: 'Zahl ohne x mit Vorzeichen', expected: -4.5 },
            ]}
            solution={
              <MB>{'\\begin{aligned} (x - 3)^2 &= (x - 3)(x - 3) = x^2 - 6x + 9 \\\\ -0{,}5 \\cdot (x^2 - 6x + 9) &= -0{,}5x^2 + 3x - 4{,}5 \\end{aligned}'}</MB>
            }
          />
        </>
      ),
    },
    {
      art: 'problem',
      titel: 'Der Torbogen für die Hofeinfahrt',
      bedingung: 'Nach drei Versuchen geht es weiter.',
      inhalt: (fertig) => (
        <Biegemaschine
          auftrag={<ProblemText />}
          versuche={versuche}
          onSenden={(v) => {
            setVersuche((alt) => [...alt, v])
            if (versuche.length + 1 >= 3 || passt(v)) fertig()
          }}
        />
      ),
    },
    {
      art: 'loesen',
      titel: 'Die Gleichung für die Biegemaschine',
      pflicht: ['rechnung', 'produkt'],
      inhalt: (fertig) => (
        <>
          <div className="sl-fokus">
            <p className="sl-fokus-titel">Deine Aufgabe: Berechne die Gleichung für die Biegemaschine</p>
            <p>
              Der Torbogen verläuft durch den Scheitelpunkt <M>{'S(2 \\mid 3)'}</M> und den linken Pfosten <M>{'P(0 \\mid 2)'}</M>. Deine Aufgabe besteht darin, die
              Funktionsgleichung rechnerisch zu bestimmen. Berechne dazu die Funktionsgleichung des Bogens zuerst in <strong>Scheitelform</strong>{' '}
              <M>{'y = a(x - x_S)^2 + y_S'}</M> und forme diese anschließend in die <strong>allgemeine Form</strong> <M>{'y = ax^2 + bx + c'}</M> um. Deine Lösung kannst
              du zur Kontrolle unten eingeben und abgleichen. Passendes Informationsmaterial findest du unter „Beispielrechnung mit Lernvideo“.
            </p>
          </div>
          <div className="tb-bild-klein">
            <TorBild nurP gross />
          </div>
          <BeispielMitVideo video={`https://www.youtube.com/watch?v=${LERNVIDEO_FALL1}`} videoTitel="Lernvideo: Funktionsgleichung aus Scheitelpunkt und Punkt aufstellen">
            <Beispiel offen title={<>Scheitelpunkt <M>{'S(-1 \\mid 5)'}</M> und Punkt <M>{'P(1 \\mid 3)'}</M></>} aufgabe={BSP_AUFGABE} steps={BSP_SCHRITTE} />
          </BeispielMitVideo>
          <Abschnitt titel="Vergleiche deine Ergebnisse">
            <CheckCard
              onSolved={() => {
                fertig.teil('rechnung')()
                setGeloest(true)
              }}
              punkte={15}
              title="Die Gleichung des Torbogens"
              rechnen={false}
              prompt={
                <p>
                  Trage die Ergebnisse aus deinem Heft ein. Trage die Zahlen mit Vorzeichen ein. Jedes Feld zeigt dir sofort, ob es stimmt. Wie lautet die Gleichung des Bogens in Scheitelform, und welche
                  Gleichung in allgemeiner Form schickst du an die Biegemaschine?
                </p>
              }
              rechnung={[
                { l: ['y'], r: [{ luecke: 'as' }, '\\cdot (x - 2)^2 + 3'], u: '\\text{Scheitelform}' },
                { l: ['y'], r: [{ luecke: 'a' }, 'x^2', { luecke: 'b' }, 'x', { luecke: 'c' }], u: '\\text{allg. Form}' },
              ]}
              fields={[
                { kind: 'num', key: 'as', label: 'Formfaktor a in der Scheitelform', expected: A_SOLL },
                { kind: 'num', key: 'a', label: 'Zahl vor x²', expected: A_SOLL },
                { kind: 'num', key: 'b', label: 'Zahl vor x mit Vorzeichen', expected: 1 },
                { kind: 'num', key: 'c', label: 'Zahl ohne x mit Vorzeichen', expected: 2 },
              ]}
              loesungNachFehler
              solution={LOESUNG}
              help={
                <Hilfen
                  steps={[
                    <>Gehe vor wie im Rechenbeispiel: erst den Scheitelpunkt einsetzen, dann den Pfosten, dann umwandeln.</>,
                    <>
                      Ansatz: <M>{'y = a(x - 2)^2 + 3'}</M>. Setze vom Pfosten <M>{'x = 0'}</M> und <M>{'y = 2'}</M> ein und löse nach <M>a</M> auf.
                    </>,
                    <>
                      <M>{'2 = a \\cdot (0 - 2)^2 + 3 = 4a + 3'}</M>. Danach <M>{'(x - 2)^2 = x^2 - 4x + 4'}</M> und jeden Summanden mit <M>a</M> multiplizieren.
                    </>,
                  ]}
                />
              }
            />
          </Abschnitt>
          <Handlungsprodukt titel="Auftragsblatt für die Biegemaschine">
            <AuftragsblattBild />
            <p className="sl-text">
              Deine Kollegin an der Biegemaschine will nachvollziehen, wie du auf die Gleichung kommst. Gestalte in deinem Heft ein Auftragsblatt: Skizze der Einfahrt, deine
              Rechnung in nummerierten Schritten, die Gleichung für die Maschine und eine Probe.
            </p>
            <Aufklappbar label="Satzanfänge ansehen" icon="fa-comment-dots">
              <ul className="zk-liste">
                <li>„Auftrag Torbogen: Die Einfahrt ist … breit, die Pfosten sind … hoch, die Mitte …“</li>
                <li>„① Ich setze den Scheitelpunkt in die Scheitelform ein: …“</li>
                <li>„② Ich setze den Pfosten P ein und erhalte a = …“</li>
                <li>„③ Scheitelform: …  ④ An die Maschine: y = …“</li>
                <li>„Probe mit dem rechten Pfosten Q(4 | 2): …“</li>
              </ul>
            </Aufklappbar>
          </Handlungsprodukt>
          <Abschnitt titel="Ist dein Auftragsblatt vollständig?">
            <Kriterien
              onAlle={fertig.teil('produkt')}
              items={[
                <>
                  Eine Skizze der Einfahrt im Koordinatensystem mit <M>{'S(2 \\mid 3)'}</M>, <M>{'P(0 \\mid 2)'}</M> und <M>{'Q(4 \\mid 2)'}</M>
                </>,
                <>Die Rechnung in nummerierten Schritten: Scheitelpunkt einsetzen, Pfosten einsetzen und <M>a</M> berechnen, in die allgemeine Form umwandeln</>,
                <>
                  Die Gleichung in Scheitelform und in allgemeiner Form, dazu die Probe mit dem rechten Pfosten: <M>{'x = 4'}</M> einsetzen ergibt <M>{'y = 2'}</M>
                </>,
                <>
                  Unter deinem Auftragsblatt steht, wofür die Abkürzungen stehen: <M>S</M> (Scheitelpunkt, höchster Punkt des Bogens), <M>{'x_S'}</M> und <M>{'y_S'}</M>{' '}
                  (Koordinaten des Scheitelpunkts), <M>a</M> (Formfaktor: Vorzeichen und Steilheit), <M>b</M> und <M>c</M> (Zahl vor <M>x</M> und Zahl ohne <M>x</M> in der
                  allgemeinen Form). Außerdem erklärst du die Begriffe Scheitelform und allgemeine Form und alle anderen Wörter, die für dich neu waren.
                </>,
              ]}
            />
          </Abschnitt>
          {geloest && (
            <Abschnitt titel="Das hältst du fest">
              <Rueckbezug versuche={versuche} />
              <Merke title="Funktionsgleichung aus Scheitelpunkt und einem Punkt (Fall 1)">
                <ol>
                  <li>
                    Scheitelpunkt in die Scheitelform einsetzen: <M>{'y = a(x - x_S)^2 + y_S'}</M>.
                  </li>
                  <li>
                    Den zweiten Punkt für <M>x</M> und <M>y</M> einsetzen und nach <M>a</M> auflösen.
                  </li>
                  <li>
                    In die allgemeine Form <M>{'y = ax^2 + bx + c'}</M> umwandeln: Klammer auflösen, dann jeden Summanden mit <M>a</M> multiplizieren.
                  </li>
                </ol>
                <p>
                  Ist <M>a</M> negativ, ist die Parabel nach unten geöffnet (wie ein Torbogen). Je größer der Betrag von <M>a</M>, desto schmaler und steiler die Parabel.
                </p>
              </Merke>
            </Abschnitt>
          )}
        </>
      ),
    },
    {
      art: 'sichern',
      titel: 'Übungsaufgaben',
      pflicht: ['1', '2', '3'],
      inhalt: (fertig) => (
        <>
          <p className="sl-text">
            Prüfe und vertiefe dein Wissen mit vier Aufgaben. Die letzte ist für Profis. Hast du Übung 1 bis 3 gelöst, wird unten ein Spiel mit dem Kran freigeschaltet.
          </p>
          <Abschnitt titel={<>Übung 1: Welches <M>a</M> passt?</>}>
            <McCard
              onSolved={uebung('1', fertig.teil('1'))}
            punkte={4}
              title="Übung 1"
              level="basis"
              rechnen
              prompt={
                <p>
                  Eine Parabel hat den Scheitelpunkt <M>{'S(1 \\mid -2)'}</M> und geht durch <M>{'P(3 \\mid 6)'}</M>. Welchen Formfaktor <M>a</M> hat sie?
                </p>
              }
              options={[
                {
                  text: <M>{'a = 1'}</M>,
                  feedback: (
                    <>
                      Hier wurde mit <M>{'+2'}</M> statt <M>{'-2'}</M> gerechnet: <M>{'6 = 4a + 2'}</M>. Der Scheitel liegt bei <M>{'y_S = -2'}</M>, also <M>{'6 = 4a - 2'}</M>.
                    </>
                  ),
                },
                {
                  text: <M>{'a = 4'}</M>,
                  feedback: (
                    <>
                      Die Klammer wurde nicht quadriert: <M>{'(3 - 1)^2 = 4'}</M>, nicht <M>2</M>.
                    </>
                  ),
                },
                {
                  text: <M>{'a = 0{,}5'}</M>,
                  feedback: (
                    <>
                      Hier wurde <M>{'(x + 1)'}</M> statt <M>{'(x - 1)'}</M> verwendet: <M>{'(3 + 1)^2 = 16'}</M>. Bei <M>{'x_S = 1'}</M> steht in der Klammer <M>{'x - 1'}</M>.
                    </>
                  ),
                },
                {
                  text: <M>{'a = 2'}</M>,
                  correct: true,
                  feedback: <M>{'6 = a \\cdot (3 - 1)^2 - 2 = 4a - 2 \\;\\Rightarrow\\; 8 = 4a \\;\\Rightarrow\\; a = 2'}</M>,
                },
              ]}
            />
          </Abschnitt>
          <Abschnitt titel="Übung 2: Wer hat sich verrechnet?">
            <CheckCard
              onSolved={uebung('2', fertig.teil('2'))}
            punkte={6}
              title="Übung 2: Qualitätskontrolle"
              level="standard"
              rechnen={false}
              prompt={
                <>
                  <p>
                    Jonas und Mara haben die Gleichung für den Torbogen mit <M>{'S(2 \\mid 3)'}</M> und <M>{'P(0 \\mid 2)'}</M> berechnet. Beide Pläne sind falsch. Wähle
                    jeweils den Schritt mit dem Fehler.
                  </p>
                  <div className="wm-berichte">
                    <Bericht
                      name="Jonas"
                      zeilen={[
                        ['y &= a(x + 2)^2 + 3'],
                        ['2 &= a \\cdot (0 + 2)^2 + 3', '2 &= 4a + 3 && \\mid -3', '-1 &= 4a && \\mid :4', 'a &= -0{,}25'],
                        ['y &= -0{,}25 \\cdot [(x + 2)(x + 2)] + 3', 'y &= -0{,}25 \\cdot [x^2 + 4x + 4] + 3', 'y &= -0{,}25x^2 - x - 1 + 3', 'y &= -0{,}25x^2 - x + 2'],
                      ]}
                      ergebnis="y = -0{,}25x^2 - x + 2"
                    />
                    <Bericht
                      name="Mara"
                      zeilen={[
                        ['y &= a(x - 2)^2 + 3'],
                        ['2 &= a \\cdot (0 - 2)^2 + 3', '2 &= 4a + 3 && \\mid -3', '-1 &= 4a && \\mid :4', 'a &= -0{,}25'],
                        ['y &= -0{,}25 \\cdot [(x - 2)(x - 2)] + 3', 'y &= -0{,}25 \\cdot [x^2 - 4x + 4] + 3', 'y &= -0{,}25x^2 - 4x + 4 + 3', 'y &= -0{,}25x^2 - 4x + 7'],
                      ]}
                      ergebnis="y = -0{,}25x^2 - 4x + 7"
                    />
                  </div>
                </>
              }
              fieldsRow
              fields={[
                { kind: 'select', key: 'j', label: 'Fehler bei Jonas', options: SCHRITTE, expected: 0 },
                { kind: 'select', key: 'm', label: 'Fehler bei Mara', options: SCHRITTE, expected: 2 },
              ]}
              solution={
                <>
                  <p>
                    <strong>Jonas, Schritt 1:</strong> Bei <M>{'S(2 \\mid 3)'}</M> heißt die Klammer <M>{'(x - 2)'}</M>, nicht <M>{'(x + 2)'}</M>. Seine Probe mit <M>P</M> stimmt
                    trotzdem, weil er <M>P</M> zum Rechnen benutzt hat. Die Probe mit <M>Q</M> deckt den Fehler auf: <M>{'x = 4'}</M> eingesetzt ergibt <M>{'y = -6'}</M> statt{' '}
                    <M>{'y = 2'}</M>.
                  </p>
                  <p>
                    <strong>Mara, Schritt 3:</strong> Sie hat nur <M>{'x^2'}</M> mit <M>{'-0{,}25'}</M> multipliziert. Richtig ist{' '}
                    <M>{'-0{,}25 \\cdot [x^2 - 4x + 4] + 3 = -0{,}25x^2 + x - 1 + 3'}</M>.
                  </p>
                </>
              }
              help={
                <Hilfen
                  steps={[
                    <>Vergleiche jeden Schritt mit deinem eigenen Auftragsblatt.</>,
                    <>
                      Prüfe bei Jonas die Klammer in Schritt 1: Welches Vorzeichen gehört bei <M>{'x_S = 2'}</M> in die Klammer?
                    </>,
                    <>
                      Prüfe bei Mara Schritt 3: Wurde wirklich <strong>jeder</strong> Summand in der Klammer mit <M>{'-0{,}25'}</M> multipliziert?
                    </>,
                  ]}
                />
              }
            />
          </Abschnitt>
          <Abschnitt titel="Übung 3: Das Gartentor der Nachbarn">
            <CheckCard
              onSolved={uebung('3', fertig.teil('3'))}
            punkte={6}
              title="Übung 3"
              level="standard"
              prompt={
                <p>
                  Die Nachbarn wollen auch einen Bogen über ihr Gartentor. Sein höchster Punkt ist <M>{'S(3 \\mid 4)'}</M>, der linke Pfosten steht bei <M>{'P(1 \\mid 2)'}</M>.
                  Fülle die Lücken aus und trage die Zahlen mit Vorzeichen ein.
                </p>
              }
              rechnung={[
                { l: ['y'], r: ['a \\cdot (x -', { luecke: 'xs' }, ')^2', { luecke: 'ys' }], u: '\\text{① } S \\text{ einsetzen}' },
                { l: ['2'], r: [{ luecke: 'q' }, '\\cdot a + 4'], u: '\\text{② } P \\text{ einsetzen}' },
                { l: ['a'], r: [{ luecke: 'a1' }], u: '\\text{Formfaktor } a' },
                { l: ['y'], r: [{ luecke: 'a2' }, 'x^2', { luecke: 'b' }, 'x', { luecke: 'c' }], u: '\\text{③ allg. Form}' },
              ]}
              fields={[
                { kind: 'num', key: 'xs', label: 'x-Wert des Scheitels', expected: 3 },
                { kind: 'num', key: 'ys', label: 'y-Wert des Scheitels mit Vorzeichen', expected: 4 },
                { kind: 'num', key: 'q', label: 'Zahl vor a', expected: 4 },
                { kind: 'num', key: 'a1', label: 'Formfaktor a', expected: -0.5 },
                { kind: 'num', key: 'a2', label: 'Zahl vor x²', expected: -0.5 },
                { kind: 'num', key: 'b', label: 'Zahl vor x mit Vorzeichen', expected: 3 },
                { kind: 'num', key: 'c', label: 'Zahl ohne x mit Vorzeichen', expected: -0.5 },
              ]}
              solution={
                <>
                  <MB>{`\\begin{aligned} y &= a(x - ${FS('3')})^2 + ${FS('4')} \\\\ ${FP('2')} &= a \\cdot (${FP('1')} - 3)^2 + 4 = 4a + 4 && \\mid -4 \\\\ -2 &= 4a && \\mid :4 \\\\ a &= ${FA('-0{,}5')} \\end{aligned}`}</MB>
                  <MB>{`\\begin{aligned} y &= ${FA('-0{,}5')} \\cdot [x^2 - 6x + 9] + 4 \\\\ y &= -0{,}5x^2 + 3x - 4{,}5 + 4 \\\\ y &= -0{,}5x^2 + 3x - 0{,}5 \\end{aligned}`}</MB>
                </>
              }
              help={
                <SchrittHilfen
                  schritte={[
                    {
                      kurz: '①',
                      titel: 'Scheitelpunkt einsetzen',
                      hilfe: (
                        <>
                          Aus <M>{'S(3 \\mid 4)'}</M> liest du <M>{'x_S = 3'}</M> und <M>{'y_S = 4'}</M> ab. <M>{'x_S'}</M> kommt in die Klammer, <M>{'y_S'}</M> ans Ende.
                        </>
                      ),
                    },
                    {
                      kurz: '②',
                      titel: 'Punkt P einsetzen',
                      hilfe: (
                        <>
                          Setze <M>{'x = 1'}</M> in die Klammer und <M>{'y = 2'}</M> links ein: <M>{'(1 - 3)^2 = (-2)^2 = 4'}</M>. Das ist die Zahl vor <M>a</M>.
                        </>
                      ),
                    },
                    {
                      kurz: <M>a</M>,
                      titel: <>Formfaktor <M>a</M> berechnen</>,
                      hilfe: (
                        <>
                          <M>{'2 = 4a + 4'}</M>: Rechne auf beiden Seiten <M>{'-4'}</M>, dann teile durch <M>4</M>. Der Bogen ist oben rund, also muss <M>a</M> negativ sein.
                        </>
                      ),
                    },
                    {
                      kurz: '③',
                      titel: 'allgemeine Form',
                      hilfe: (
                        <>
                          <M>{'(x - 3)^2 = x^2 - 6x + 9'}</M>. Multipliziere jeden Summanden mit <M>{'-0{,}5'}</M> und addiere zum Schluss <M>{'+4'}</M> zur Zahl ohne <M>x</M>.
                        </>
                      ),
                    },
                  ]}
                />
              }
            />
          </Abschnitt>
          <Abschnitt titel="Übung 4 für Profis: Der Sonderwunsch">
            <CheckCard
              title="Der Bogen soll höher werden"
              level="erweiterung"
              profi
              punkte={8}
              prompt={
                <>
                  <p>
                    Familie Berger ruft an: Der Bogen soll in der Mitte 3,5&nbsp;m hoch sein, die Pfosten bleiben 2&nbsp;m hoch. Der Scheitelpunkt wandert also nach oben auf{' '}
                    <M>{'S(2 \\mid 3{,}5)'}</M>, der Pfosten bleibt bei <M>{'P(0 \\mid 2)'}</M>. Berechne das neue <M>a</M>. Wird der Bogen dadurch steiler oder flacher?
                    Begründe.
                  </p>
                  <div className="tb-bild-klein">
                    <TorBild neuS={3.5} gross />
                  </div>
                </>
              }
              fieldsRow
              fields={[
                { kind: 'num', key: 'a', label: <M>{'a ='}</M>, expected: -0.375 },
                { kind: 'select', key: 's', label: 'Der Bogen wird …', options: ['flacher', 'steiler'], expected: 1 },
              ]}
              solution={
                <>
                  <MB>{'\\begin{aligned} 2 &= a(0 - 2)^2 + 3{,}5 \\\\ 2 &= 4a + 3{,}5 && \\mid -3{,}5 \\\\ -1{,}5 &= 4a && \\mid :4 \\\\ a &= -0{,}375 \\end{aligned}'}</MB>
                  <p>
                    Vorher war <M>{'a = -0{,}25'}</M>. Der Betrag von <M>a</M> ist größer geworden, also ist die Parabel schmaler und steiler.
                  </p>
                </>
              }
              help={
                <Hilfen
                  steps={[
                    <>
                      Der Scheitel liegt jetzt bei <M>{'S(2 \\mid 3{,}5)'}</M>, der Pfosten bleibt bei <M>{'P(0 \\mid 2)'}</M>.
                    </>,
                    <>
                      Neuer Ansatz: <M>{'y = a(x - 2)^2 + 3{,}5'}</M>. Setze <M>P</M> ein und löse nach <M>a</M> auf.
                    </>,
                    <>
                      <M>{'2 = 4a + 3{,}5'}</M>. Vergleiche danach den Betrag des neuen <M>a</M> mit <M>{'0{,}25'}</M>: Größerer Betrag heißt schmalere Parabel.
                    </>,
                  ]}
                />
              }
            />
          </Abschnitt>
          <BonusSpiel frei={uebungen.length === 3} titel="Bogen-Kran">
            <BogenKran />
          </BonusSpiel>
          <Bilanz />
          <div className="sl-ende">
            <p>
              Du kannst jetzt die Funktionsgleichung einer Parabel aufstellen, wenn du den Scheitelpunkt und einen weiteren Punkt kennst. Übe das Verfahren weiter oder mach mit
              Lernsituation 2 weiter.
            </p>
            <div className="bk-actions">
              <button type="button" className="bk-btn" onClick={onBack}>
                <i className="fa-solid fa-arrow-left" aria-hidden="true" /> Zurück zur Auswahl
              </button>
              <button type="button" className="bk-btn" onClick={onPractice}>
                Weiter üben: Fall 1 <i className="fa-solid fa-dumbbell" aria-hidden="true" />
              </button>
              <button type="button" className="bk-btn bk-btn-primary" onClick={onNext}>
                Zu Lernsituation 2 <i className="fa-solid fa-arrow-right" aria-hidden="true" />
              </button>
            </div>
          </div>
        </>
      ),
    },
  ]

  return (
    <TaskShell
      title="Funktionsgleichung aufstellen: Der Torbogen"
      width="wide"
      kompakt
      parent={{ to: '/quadratische_funktionen/funktionsgleichung_aufstellen', label: 'Funktionsgleichung aufstellen' }}
    >
      <SeitenLernsituation
        ruhig
        punkte
        thema={THEMA}
        ziel={<>In dieser Lernsituation lernst du, wie du die Funktionsgleichung einer Parabel aufstellst, wenn du den Scheitelpunkt und einen weiteren Punkt kennst.</>}
        seiten={seiten}
      />
    </TaskShell>
  )
}

/** Rückbezug auf die Versuche an der Biegemaschine aus „Problem erkennen“ */
function Rueckbezug({ versuche }: { versuche: Versuch[] }) {
  const treffer = versuche.some(passt)
  return (
    <div className="ls-back">
      <p>
        {versuche.length === 0 ? (
          <>Du hast vorhin keine Gleichung an die Biegemaschine geschickt.</>
        ) : (
          <>
            <strong>
              Du hast vorhin {versuche.length} {versuche.length === 1 ? 'Gleichung' : 'Gleichungen'} an die Biegemaschine geschickt.
            </strong>{' '}
            {treffer ? 'Ein Treffer war dabei, durch Raten oder schon durch Rechnen.' : 'Keine davon hat gepasst.'}
          </>
        )}
      </p>
      <p>
        Mit dem Scheitelpunkt und einem weiteren Punkt rechnest du die Gleichung in drei Schritten sicher aus, statt zu raten: <M>{'y = -0{,}25x^2 + x + 2'}</M>. Das Minus vor{' '}
        <M>{'x^2'}</M> passt zum Bogen: Er ist oben rund und hängt nicht durch.
      </p>
    </div>
  )
}

import { useId, useState, type ChangeEvent, type ReactNode } from 'react'
import TaskShell from '../../../components/layout/TaskShell'
import { Beispiel, M, MB, Merke, fmt, parseInput } from '../../daten_und_zufall/lernpfad/kit'
import { CheckCard, ErklaerungAufklappen, ErklaerungCtx, Hilfen, McCard, SchrittHilfen, tx } from '../../lineare_funktionen/lernsituation_kit/kit'
import { SeitenLernsituation, type Seite } from '../../lineare_funktionen/lernsituation_kit/seiten'
import '../../daten_und_zufall/lernpfad/lernpfad.css'
import './torbogen.css'

// Lernsituation 1 „Der Torbogen für die Hofeinfahrt“: Funktionsgleichung aus Scheitelpunkt und einem weiteren Punkt (Fall 1, 45 min).
// Format Kundenauftrag (Gleichungen an die Biegemaschine raten, dann berechnen), Fehlerdetektiv im Check, Lernprodukt analog (Spickzettel).
// Ruhiges Grunddesign (SeitenLernsituation mit ruhig): eine Spalte, eine Akzentfarbe, pro Seite nur der Auftrag hervorgehoben.
// Instruktionsreihenfolge: Problem zuerst. Die SuS kennen die Scheitelform y = a(x − x_S)² + y_S und können sie in die allgemeine
// Form umwandeln. Neu ist, a mit einem zweiten Punkt zu bestimmen.
// Problem erkennen: Die SuS raten Gleichungen und schicken sie an die Biegemaschine. Jeder Versuch erscheint in der Skizze, die Maschine
// meldet für linken Pfosten, Mitte und rechten Pfosten, ob die Höhe stimmt. Nach drei Versuchen kommt die Erkenntnis: Raten reicht nicht.
// Die Versuche ersetzen die Festlegung und werden in Phase 4 wieder aufgegriffen.
// Seitenansicht (lernsituation_kit/seiten.tsx): Startbox mit Bestätigung, dass alle Rechenschritte im Heft dokumentiert werden,
// dann eine Aufgabe pro Seite in den vier Phasen. „Weiter“ wird erst frei, wenn die Seite erledigt ist (Aufgabe richtig gelöst,
// drei Versuche an der Biegemaschine, alle Spickzettel-Punkte abgehakt; Info-Seiten sind frei). Jede Seite passt ohne Scrollen
// auf ein Tablet im Querformat (geprüft mit 1024 × 700, 1080 × 740, 1180 × 760 und 1280 × 720).
// Warm-up (drei Abrufaufgaben) → Problem erkennen (Auftrag, Biegemaschine) → Problem lösen (Aufgabe mit Graph nur mit S und P,
// Rechenbeispiel auf zwei Seiten, eigene Lückenrechnung) → Festhalten und Prüfen (Merke, Spickzettel, drei Checks, Abschluss).
// Aha: Durch Raten trifft man die Gleichung kaum, mit Scheitelpunkt und einem weiteren Punkt lässt sie sich sicher berechnen.
// Fehlerhafte Azubi-Pläne kommen erst im Check, wenn die SuS den Weg selbst gerechnet haben.
// Die Versuche an der Maschine bleiben nur im Seitenzustand (kein Speichern).

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
  const fs = (n: number) => (gross ? Math.round(n * 1.55) : n)
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
      placeholder="?"
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
        <M>{'y ='}</M> {feld('a', 'Zahl vor x²')} <M>{'x^2 +'}</M> {feld('b', 'Zahl vor x')} <M>{'x +'}</M> {feld('c', 'Zahl ohne x')}
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
            Versuch {versuche.length}: <M>{gleichungTex(letzter)}</M>
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

/** Spickzettel (Lernprodukt): erst wenn alle Kriterien abgehakt sind, geht es weiter */
function Spickzettel({ onFertig }: { onFertig: () => void }) {
  const KRITERIEN = [
    'Die Schritte in der richtigen Reihenfolge, jeder mit einem kurzen Merksatz',
    'Bei jedem Schritt eine Warnung vor einem typischen Fehler',
    'Ein eigenes Beispiel mit anderen Zahlen',
    <>Eine kleine Skizze, an der man das Vorzeichen von <M>a</M> erkennt</>,
  ]
  const [haken, setHaken] = useState<boolean[]>(KRITERIEN.map(() => false))
  return (
    <div className="lp-ex bk-panel">
      <p>Gestalte in deinem Heft eine Karteikarte „Gleichung aus dem Scheitelpunkt aufstellen“. Sie darf genau eine Karteikarte füllen. Hake ab, was du schon hast:</p>
      <div className="ls-criteria">
        {KRITERIEN.map((c, i) => (
          <label key={i}>
            <input
              type="checkbox"
              checked={haken[i]}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                const neu = haken.map((v, j) => (j === i ? e.target.checked : v))
                setHaken(neu)
                if (neu.every(Boolean)) onFertig()
              }}
            />{' '}
            <span>{c}</span>
          </label>
        ))}
      </div>
    </div>
  )
}

/** Rechenbeispiel für „Problem lösen“: auf zwei Seiten verteilt (Schritte 1–2 und 3–4), damit jede Seite auf einen Bildschirm passt */
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
          Setze <M>{'x_S = -1'}</M> und <M>{'y_S = 5'}</M> ein. Negative Zahlen immer in Klammern setzen:
        </p>
        <MB>{'\\begin{aligned} y &= a(x - x_S)^2 + y_S \\\\ y &= a(x - (-1))^2 + 5 \\\\ y &= a(x + 1)^2 + 5 \\end{aligned}'}</MB>
      </>
    ),
  },
  {
    title: <>Punkt einsetzen und <M>a</M> berechnen</>,
    body: (
      <>
        <p>
          Setze <M>{'P(1 \\mid 3)'}</M> ein, also <M>{'x = 1'}</M> und <M>{'y = 3'}</M>, und löse nach <M>a</M> auf:
        </p>
        <MB>{'\\begin{aligned} 3 &= a \\cdot (1 + 1)^2 + 5 \\\\ 3 &= a \\cdot 2^2 + 5 \\\\ 3 &= 4a + 5 && \\mid -5 \\\\ -2 &= 4a && \\mid :4 \\\\ a &= -0{,}5 \\end{aligned}'}</MB>
      </>
    ),
  },
  {
    title: 'Funktionsgleichung in Scheitelform angeben',
    body: (
      <>
        <p>
          Setze <M>{'a = -0{,}5'}</M> in den Ansatz aus Schritt 1 ein:
        </p>
        <MB>{'y = -0{,}5(x + 1)^2 + 5'}</MB>
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

/** Plan eines Azubis mit nummerierten Rechenschritten (für den Check) */
function Bericht({ name, cls, zeilen, ergebnis }: { name: string; cls: string; zeilen: string[][]; ergebnis: string }) {
  return (
    <div className={`wm-bericht ${cls}`}>
      <div className="wm-bericht-name">Plan von {name}</div>
      <ul className="wm-zeilen">
        {zeilen.map((z, i) => (
          <li key={i}>
            <b>{i + 1}</b>
            <span>
              {z.map((t, j) => (
                <div key={j}>
                  <M>{t}</M>
                </div>
              ))}
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

export default function TorbogenEinstieg({
  erklaerung,
  onBack,
  onPractice,
  onNext,
}: {
  erklaerung: ReactNode
  onBack: () => void
  onPractice: () => void
  onNext: () => void
}) {
  const [versuche, setVersuche] = useState<Versuch[]>([])

  const seiten: Seite[] = [
    {
      art: 'start',
      titel: 'Aufwärmen 1: Scheitelpunkt ablesen',
      inhalt: (fertig) => (
        <McCard
          onSolved={fertig}
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
                  Die <M>{'-2'}</M> vor der Klammer ist der Streckfaktor <M>a</M>. Sie sagt, wie steil die Parabel ist, nicht wo der Scheitel liegt.
                </>
              ),
            },
          ]}
        />
      ),
    },
    {
      art: 'start',
      titel: <>Aufwärmen 2: Gleichung nach <M>a</M> lösen</>,
      inhalt: (fertig) => (
        <CheckCard
          onSolved={fertig}
          title={<>b) Gleichung nach <M>a</M> lösen</>}
          prompt={
            <p>
              Löse die Gleichung <M>{'7 = 4a + 3'}</M>.
            </p>
          }
          fields={[{ kind: 'num', key: 'a', label: <M>{'a ='}</M>, expected: 1 }]}
          solution={<MB>{'\\begin{aligned} 7 &= 4a + 3 && \\mid -3 \\\\ 4 &= 4a && \\mid :4 \\\\ a &= 1 \\end{aligned}'}</MB>}
        />
      ),
    },
    {
      art: 'start',
      titel: 'Aufwärmen 3: Klammer ausmultiplizieren',
      inhalt: (fertig) => (
        <CheckCard
          onSolved={fertig}
          title="c) Klammer ausmultiplizieren"
          prompt={
            <p>
              Schreibe <M>{'(x - 3)^2'}</M> ohne Klammer als <M>{'x^2 + bx + c'}</M>.
            </p>
          }
          fieldsRow
          fields={[
            { kind: 'num', key: 'b', label: <M>{'b ='}</M>, expected: -6 },
            { kind: 'num', key: 'c', label: <M>{'c ='}</M>, expected: 9 },
          ]}
          solution={<MB>{'(x - 3)^2 = (x - 3)(x - 3) = x^2 - 3x - 3x + 9 = x^2 - 6x + 9'}</MB>}
        />
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
      titel: 'Deine Aufgabe',
      frei: true,
      inhalt: () => (
        <>
          <div className="sl-fokus">
            <p className="sl-fokus-titel">Stelle die Funktionsgleichung auf</p>
            <p>
              Gegeben sind der Scheitelpunkt <M>{'S(2 \\mid 3)'}</M> und der Pfosten <M>{'P(0 \\mid 2)'}</M>. Stelle die Funktionsgleichung zuerst in{' '}
              <strong>Scheitelform</strong> <M>{'y = a(x - x_S)^2 + y_S'}</M> und anschließend in <strong>allgemeiner Form</strong> <M>{'y = ax^2 + bx + c'}</M> auf.
            </p>
          </div>
          <div className="tb-bild-klein">
            <TorBild nurP gross />
          </div>
          <p className="sl-hinweis">Wie das funktioniert, siehst du auf der nächsten Seite an einem Rechenbeispiel. Danach rechnest du selbst.</p>
        </>
      ),
    },
    {
      art: 'loesen',
      titel: "So geht's: Rechenbeispiel (Schritte 1 und 2)",
      frei: true,
      inhalt: () => <Beispiel offen title={<>Scheitelpunkt <M>{'S(-1 \\mid 5)'}</M> und Punkt <M>{'P(1 \\mid 3)'}</M></>} aufgabe={BSP_AUFGABE} steps={BSP_SCHRITTE.slice(0, 2)} />,
    },
    {
      art: 'loesen',
      titel: "So geht's: Rechenbeispiel (Schritte 3 und 4)",
      frei: true,
      inhalt: () => (
        <>
          <Beispiel offen title={<>Fortsetzung: <M>{'S(-1 \\mid 5)'}</M> und <M>{'P(1 \\mid 3)'}</M></>} aufgabe={<p>Aus Schritt 2 kennst du schon <M>{'a = -0{,}5'}</M>.</p>} steps={BSP_SCHRITTE.slice(2)} ab={3} />
          <ErklaerungAufklappen label="Noch ein Beispiel und das Erklärvideo ansehen" />
        </>
      ),
    },
    {
      art: 'loesen',
      titel: 'Jetzt du: die Gleichung für die Biegemaschine',
      inhalt: (fertig) => (
        <CheckCard
          onSolved={fertig}
          title="Stelle die Funktionsgleichung auf"
          prompt={
            <p>
              Gegeben: <M>{'S(2 \\mid 3)'}</M> und <M>{'P(0 \\mid 2)'}</M>. Rechne in den Schritten des Rechenbeispiels und fülle die Lücken aus.
            </p>
          }
          rechnung={[
            { l: ['y'], r: ['a \\cdot (x -', { luecke: 'xs' }, ')^2 +', { luecke: 'ys' }], u: '\\text{① } S \\text{ einsetzen}' },
            { l: ['2'], r: ['a \\cdot (0 - 2)^2 + 3'], u: '\\text{② } P \\text{ einsetzen}' },
            { l: ['2'], r: [{ luecke: 'q' }, '\\cdot a + 3'], u: '\\mid -3 \\quad \\mid :4' },
            { l: ['a'], r: [{ luecke: 'a1' }], u: '\\text{Formfaktor } a' },
            { l: ['y'], r: [{ luecke: 'as' }, '\\cdot (x - 2)^2 + 3'], u: '\\text{③ Scheitelform}' },
            { l: ['y'], r: [{ luecke: 'a2' }, 'x^2 +', { luecke: 'b' }, 'x +', { luecke: 'c' }], u: '\\text{④ allg. Form}' },
          ]}
          fields={[
            { kind: 'num', key: 'xs', label: 'x-Wert des Scheitels', expected: 2 },
            { kind: 'num', key: 'ys', label: 'y-Wert des Scheitels', expected: 3 },
            { kind: 'num', key: 'q', label: 'Zahl vor a', expected: 4 },
            { kind: 'num', key: 'a1', label: 'Formfaktor a', expected: A_SOLL },
            { kind: 'num', key: 'as', label: 'a in der Scheitelform', expected: A_SOLL },
            { kind: 'num', key: 'a2', label: 'Zahl vor x²', expected: A_SOLL },
            { kind: 'num', key: 'b', label: 'Zahl vor x', expected: 1 },
            { kind: 'num', key: 'c', label: 'Zahl ohne x', expected: 2 },
          ]}
          solution={
            <>
              <p>① Scheitelpunkt einsetzen:</p>
              <MB>{'y = a(x - 2)^2 + 3'}</MB>
              <p>
                ② Pfosten <M>P</M> einsetzen (<M>{'x = 0'}</M>, <M>{'y = 2'}</M>) und nach <M>a</M> auflösen:
              </p>
              <MB>{'\\begin{aligned} 2 &= a \\cdot (0 - 2)^2 + 3 \\\\ 2 &= 4a + 3 && \\mid -3 \\\\ -1 &= 4a && \\mid :4 \\\\ a &= -0{,}25 \\end{aligned}'}</MB>
              <p>③ Scheitelform:</p>
              <MB>{'y = -0{,}25(x - 2)^2 + 3'}</MB>
              <p>④ In die allgemeine Form umwandeln:</p>
              <MB>{'\\begin{aligned} y &= -0{,}25 \\cdot [(x - 2) \\cdot (x - 2)] + 3 \\\\ y &= -0{,}25 \\cdot [x^2 - 4x + 4] + 3 \\\\ y &= -0{,}25x^2 + x - 1 + 3 \\\\ y &= -0{,}25x^2 + x + 2 \\end{aligned}'}</MB>
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
                      Aus <M>{'S(2 \\mid 3)'}</M> liest du <M>{'x_S = 2'}</M> und <M>{'y_S = 3'}</M> ab. In <M>{'y = a(x - x_S)^2 + y_S'}</M> kommt <M>{'x_S'}</M> in die Klammer und{' '}
                      <M>{'y_S'}</M> ans Ende. Das <M>a</M> kennst du noch nicht, es bleibt als Buchstabe stehen.
                    </>
                  ),
                },
                {
                  kurz: '②',
                  titel: 'Punkt P einsetzen',
                  hilfe: (
                    <>
                      Vom Pfosten <M>{'P(0 \\mid 2)'}</M> setzt du <M>{'x = 0'}</M> in die Klammer und <M>{'y = 2'}</M> links ein. Rechne die Klammer aus: <M>{'0 - 2 = -2'}</M> und{' '}
                      <M>{'(-2)^2 = (-2) \\cdot (-2)'}</M>. Ein Quadrat ist nie negativ. Das Ergebnis ist die Zahl vor <M>a</M>.
                    </>
                  ),
                },
                {
                  kurz: <M>a</M>,
                  titel: <>Formfaktor <M>a</M> berechnen</>,
                  hilfe: (
                    <>
                      Jetzt ist nur noch <M>a</M> unbekannt. Löse wie im Warm-up: erst auf beiden Seiten <M>{'-3'}</M>, dann durch die Zahl vor <M>a</M> teilen. Zur Kontrolle: Der Bogen ist
                      nach unten geöffnet, also muss <M>a</M> negativ sein.
                    </>
                  ),
                },
                {
                  kurz: '③',
                  titel: 'Scheitelform',
                  hilfe: (
                    <>
                      Das berechnete <M>a</M> ersetzt den Buchstaben <M>a</M> in <M>{'y = a(x - 2)^2 + 3'}</M>. Der Rest der Gleichung bleibt gleich.
                    </>
                  ),
                },
                {
                  kurz: '④',
                  titel: 'allgemeine Form',
                  hilfe: (
                    <>
                      Zuerst die Klammer ausmultiplizieren: <M>{'(x - 2)^2 = (x - 2)(x - 2) = x^2 - 4x + 4'}</M>. Dann jeden der drei Summanden mal <M>a</M> nehmen und zum Schluss{' '}
                      <M>{'+3'}</M> zur Zahl ohne <M>x</M> addieren.
                    </>
                  ),
                },
              ]}
            />
          }
        />
      ),
    },
    {
      art: 'sichern',
      titel: 'Das hältst du fest',
      frei: true,
      inhalt: () => (
        <>
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
                  In die allgemeine Form <M>{'y = ax^2 + bx + c'}</M> umwandeln: binomische Formel, dann jeden Summanden mit <M>a</M> multiplizieren.
                </li>
              </ol>
          </Merke>
        </>
      ),
    },
    {
      art: 'sichern',
      titel: 'Dein Spickzettel (Lernprodukt)',
      bedingung: 'Hake alle vier Punkte ab, sobald sie auf deinem Spickzettel stehen.',
      inhalt: (fertig) => <Spickzettel onFertig={fertig} />,
    },
    {
      art: 'sichern',
      titel: 'Check 1: Qualitätskontrolle',
      inhalt: (fertig) => (
        <CheckCard
          onSolved={fertig}
          title="Wo stecken die Fehler?"
          level="standard"
          rechnen={false}
          prompt={
            <>
              <p>Beide Pläne sind falsch. Wähle jeweils den Schritt mit dem Fehler und beschreibe den Fehler im Heft.</p>
              <div className="wm-berichte wm-berichte-2">
                <Bericht
                  name="Jonas"
                  cls="wm-bericht-a"
                  zeilen={[
                    ['y = a(x + 2)^2 + 3'],
                    ['2 = a(0 + 2)^2 + 3', '2 = 4a + 3 \\;\\Rightarrow\\; a = -0{,}25'],
                    ['y = -0{,}25(x^2 + 4x + 4) + 3', '= -0{,}25x^2 - x + 2'],
                  ]}
                  ergebnis="y = -0{,}25x^2 - x + 2"
                />
                <Bericht
                  name="Mara"
                  cls="wm-bericht-c"
                  zeilen={[
                    ['y = a(x - 2)^2 + 3'],
                    ['2 = a(0 - 2)^2 + 3', '2 = 4a + 3 \\;\\Rightarrow\\; a = -0{,}25'],
                    ['y = -0{,}25x^2 - 4x + 4 + 3', '= -0{,}25x^2 - 4x + 7'],
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
                  <strong>Jonas, Schritt 1:</strong> Bei <M>{'S(2 \\mid 3)'}</M> heißt die Klammer <M>{'(x - 2)'}</M>, nicht <M>{'(x + 2)'}</M>. Seine Probe mit <M>P</M> stimmt trotzdem,
                  weil er <M>P</M> zum Rechnen benutzt hat. Die Probe mit <M>Q</M> deckt den Fehler auf: Bei <M>{'x = 4'}</M> ergibt sich <M>{'y = -6'}</M> statt <M>{'y = 2'}</M>.
                </p>
                <p>
                  <strong>Mara, Schritt 3:</strong> Sie hat nur <M>{'x^2'}</M> mit <M>{'-0{,}25'}</M> multipliziert. Richtig ist{' '}
                  <M>{'-0{,}25(x^2 - 4x + 4) + 3 = -0{,}25x^2 + x - 1 + 3'}</M>.
                </p>
              </>
            }
        />
      ),
    },
    {
      art: 'sichern',
      titel: 'Check 2: Gleichung aufstellen',
      inhalt: (fertig) => (
        <CheckCard
          onSolved={fertig}
          title="Check 2: Gleichung aufstellen"
          level="standard"
          prompt={
            <p>
              Eine Parabel hat den Scheitelpunkt <M>{'S(1 \\mid -2)'}</M> und geht durch <M>{'P(3 \\mid 6)'}</M>. Bestimme <M>a</M> und die allgemeine Form{' '}
              <M>{'y = ax^2 + bx + c'}</M>.
            </p>
          }
          fieldsRow
          fields={[
            { kind: 'num', key: 'a', label: <M>{'a ='}</M>, expected: 2 },
            { kind: 'num', key: 'b', label: <M>{'b ='}</M>, expected: -4 },
            { kind: 'num', key: 'c', label: <M>{'c ='}</M>, expected: 0 },
          ]}
          solution={
            <>
              <MB>{'\\begin{aligned} 6 &= a(3 - 1)^2 - 2 \\\\ 6 &= 4a - 2 && \\mid +2 \\\\ 8 &= 4a && \\mid :4 \\\\ a &= 2 \\end{aligned}'}</MB>
              <MB>{'\\begin{aligned} y &= 2(x - 1)^2 - 2 \\\\ &= 2(x^2 - 2x + 1) - 2 \\\\ &= 2x^2 - 4x \\end{aligned}'}</MB>
              <p>
                Es ist also <M>{'c = 0'}</M>.
              </p>
            </>
          }
          help={
            <Hilfen
              steps={[
                <>Gehe wie auf deinem Spickzettel vor: erst der Scheitelpunkt, dann der Punkt <M>P</M>, dann umwandeln.</>,
                <>
                  Ansatz: <M>{'y = a(x - 1)^2 - 2'}</M>. Setze <M>{'x = 3'}</M> und <M>{'y = 6'}</M> ein.
                </>,
                <>
                  <M>{'6 = 4a - 2'}</M> ergibt <M>{'a = 2'}</M>. Danach <M>{'2(x^2 - 2x + 1) - 2'}</M> ausmultiplizieren.
                </>,
              ]}
            />
          }
        />
      ),
    },
    {
      art: 'sichern',
      titel: 'Check 3: Sonderwunsch',
      inhalt: (fertig) => (
        <CheckCard
          onSolved={fertig}
          title="Check 3: Sonderwunsch, der Bogen soll höher werden"
          level="erweiterung"
          prompt={
            <>
              <p>
                Familie Berger ruft an: Der Bogen soll in der Mitte 3,5&nbsp;m hoch sein, die Pfosten bleiben 2&nbsp;m hoch. Der Scheitelpunkt wandert also nach oben auf{' '}
                <M>{'{S(2 \\mid 3{,}5)}'}</M>, der Pfosten bleibt bei <M>{'{P(0 \\mid 2)}'}</M>. Berechne das neue <M>a</M>. Wird der Bogen dadurch steiler oder flacher? Begründe im
                Heft.
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
      ),
    },
    {
      art: 'sichern',
      titel: 'Geschafft!',
      frei: true,
      inhalt: () => (
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
      ),
    },
  ]

  return (
    <ErklaerungCtx.Provider value={erklaerung}>
      <TaskShell
        title="Funktionsgleichung aufstellen: Der Torbogen"
        width="wide"
        kompakt
        parent={{ to: '/quadratische_funktionen/funktionsgleichung_aufstellen', label: 'Funktionsgleichung aufstellen' }}
      >
        <SeitenLernsituation
          ruhig
          ziel={<>In dieser Lernsituation lernst du, wie du die Funktionsgleichung einer Parabel aufstellst, wenn du den Scheitelpunkt und einen weiteren Punkt kennst.</>}
          seiten={seiten}
        />
      </TaskShell>
    </ErklaerungCtx.Provider>
  )
}

/** Rückbezug auf die Versuche an der Biegemaschine aus Phase 2 */
function Rueckbezug({ versuche }: { versuche: Versuch[] }) {
  const treffer = versuche.some(passt)
  return (
    <div className="ls-back">
      <p>
        {versuche.length === 0 ? (
          <>Du hast in Phase 2 keine Gleichung an die Biegemaschine geschickt.</>
        ) : (
          <>
            <strong>
              Du hast in Phase 2 {versuche.length} {versuche.length === 1 ? 'Gleichung' : 'Gleichungen'} an die Biegemaschine geschickt.
            </strong>{' '}
            {treffer ? 'Ein Treffer war dabei, durch Raten oder schon durch Rechnen.' : 'Keine davon hat gepasst.'}
          </>
        )}
      </p>
      <p>
        Mit dem Scheitelpunkt und einem weiteren Punkt rechnest du die Gleichung in drei Schritten sicher aus, statt zu raten: <M>{'y = -0{,}25x^2 + x + 2'}</M>. Das Minus vor <M>{'x^2'}</M>
        passt zum Bogen: Er ist oben rund und hängt nicht durch.
      </p>
    </div>
  )
}

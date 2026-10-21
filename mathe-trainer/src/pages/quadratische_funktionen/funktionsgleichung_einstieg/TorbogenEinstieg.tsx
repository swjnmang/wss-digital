import { useId, useState, type ChangeEvent, type ReactNode } from 'react'
import TaskShell from '../../../components/layout/TaskShell'
import { Beispiel, M, MB, Merke, fmt, parseInput } from '../../daten_und_zufall/lernpfad/kit'
import { Arbeitsweise, CardHead, CheckCard, ErklaerungAufklappen, ErklaerungCtx, Hilfen, McCard, tx } from '../../lineare_funktionen/lernsituation_kit/kit'
import { Etappe, Fortschritt, Teil } from '../../lineare_funktionen/lernsituation_kit/phasen'
import '../../daten_und_zufall/lernpfad/lernpfad.css'
import './werkstatt.css'

// Lernsituation 1 „Der Torbogen für die Hofeinfahrt“: Funktionsgleichung aus Scheitelpunkt und einem weiteren Punkt (Fall 1, 45 min).
// Format Kundenauftrag (Gleichungen an die Biegemaschine raten, dann berechnen), Fehlerdetektiv im Check, Look Werkstatt (Metallbau), Lernprodukt analog (Spickzettel).
// Instruktionsreihenfolge: Problem zuerst. Die SuS kennen die Scheitelform y = a(x − x_S)² + y_S und können sie in die allgemeine
// Form umwandeln. Neu ist, a mit einem zweiten Punkt zu bestimmen.
// Problem erkennen: Die SuS raten Gleichungen und schicken sie an die Biegemaschine. Jeder Versuch erscheint in der Skizze, die Maschine
// meldet für linken Pfosten, Mitte und rechten Pfosten, ob die Höhe stimmt. Nach drei Versuchen kommt die Erkenntnis: Raten reicht nicht.
// Die Versuche ersetzen die Festlegung und werden in Phase 4 wieder aufgegriffen.
// Vier feste Phasen (lernsituation_kit/phasen.tsx): Warm-up (drei Abrufaufgaben, je eine pro Rechenschritt) → Problem erkennen
// (Auftrag, Gegeben/Gesucht, Biegemaschine) → Problem lösen (Aufgabe mit Graph nur mit S und P, Rechenbeispiel mit anderen Zahlen,
// dann eigene Lückenrechnung: Scheitelform, dann allgemeine Form) → Festhalten und Prüfen (Merke, Spickzettel, drei Checks).
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
    { name: 'linker Pfosten (x = 0)', soll: 2, ist: f(0) },
    { name: 'Mitte (x = 2)', soll: 3, ist: f(2) },
    { name: 'rechter Pfosten (x = 4)', soll: 2, ist: f(4) },
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

/** Das zentrale Problem der Lernsituation: Gegeben / Gesucht */
function Problemkarte() {
  return (
    <div className="tb-problem">
      <div className="tb-problem-title">
        <i className="fa-solid fa-bullseye" aria-hidden="true" /> Das Problem
      </div>
      <div className="tb-problem-grid">
        <div>
          <span className="tb-problem-label">Gegeben</span>
          Scheitelpunkt <M>{'S(2 \\mid 3)'}</M> und Pfosten <M>{'P(0 \\mid 2)'}</M>
        </div>
        <div>
          <span className="tb-problem-label">Gesucht</span>
          Funktionsgleichung <M>{'y = ax^2 + bx + c'}</M>
        </div>
      </div>
      <p className="tb-problem-frage">Welche Gleichung gibst du in die Biegemaschine ein? Probiere es aus.</p>
    </div>
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
function TorBild({ kurven = [], nurP = false }: { kurven?: Kurve[]; nurP?: boolean }) {
  const clip = useId().replace(/[^a-zA-Z0-9]/g, '')
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
            <text x={bx(v)} y={by(0) + 24} textAnchor="middle" fontSize="18" fill="var(--ink-muted)">
              {v}
            </text>
          </g>
        ))}
        {[1, 2, 3, 4].map((v) => (
          <g key={`y${v}`}>
            <line x1={bx(S.xMin)} x2={bx(S.xMax)} y1={by(v)} y2={by(v)} stroke="var(--grid)" />
            <text x={bx(0) - 8} y={by(v) + 6} textAnchor="end" fontSize="18" fill="var(--ink-muted)">
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
        <polyline points={SOLL_BOGEN} fill="none" stroke="var(--ink)" strokeWidth="3" strokeDasharray="8 6" />
        {kurven.length > 0 && (
          <g clipPath={`url(#${clip})`}>
            {kurven.map((k, i) => (
              <polyline key={i} points={kurve(k.f, S.xMin, S.xMax)} fill="none" stroke={k.farbe} strokeWidth={k.breite} strokeLinecap="round" />
            ))}
          </g>
        )}
        <circle cx={bx(2)} cy={by(3)} r="7" fill="var(--highlight)" stroke="var(--ink)" strokeWidth="2.5" />
        <text x={bx(2)} y={by(3) - 14} textAnchor="middle" fontSize="18" fontWeight="700" fill="var(--ink)">
          S(2 | 3)
        </text>
        <circle cx={bx(0)} cy={by(2)} r="7" fill="var(--surface)" stroke="var(--ink)" strokeWidth="2.5" />
        <text x={bx(0) - 12} y={by(2) - 22} textAnchor="end" fontSize="18" fontWeight="700" fill="var(--ink)">
          P(0 | 2)
        </text>
        {!nurP && (
          <>
            <circle cx={bx(4)} cy={by(2)} r="7" fill="var(--surface)" stroke="var(--ink)" strokeWidth="2.5" />
            <text x={bx(4) + 12} y={by(2) - 22} fontSize="18" fontWeight="700" fill="var(--ink)">
              Q(4 | 2)
            </text>
          </>
        )}
        <text x={bx(S.xMax) - 4} y={by(0) - 8} textAnchor="end" fontSize="14" fill="var(--ink-muted)">
          Boden (x in m)
        </text>
      </svg>
    </div>
  )
}

/** Biegemaschine: Gleichung eintippen, senden, Bogen erscheint in der Skizze, die Maschine meldet, was passt */
function Biegemaschine({ versuche, onSenden }: { versuche: Versuch[]; onSenden: (v: Versuch) => void }) {
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
    <div className="lp-ex bk-panel tb-maschine" data-no-autocheck>
      <CardHead title="Die Biegemaschine" />
      <p>
        Tippe eine Funktionsgleichung ein und schicke sie an die Maschine. Sie biegt den Bogen und zeichnet ihn in die Skizze. Versuche, die gestrichelte Skizze genau zu treffen.
        Probiere ruhig mehrmals.
      </p>
      <TorBild kurven={kurven} />
      <div className="tb-eingabe">
        <M>{'y ='}</M> {feld('a', 'Zahl vor x²')} <M>{'x^2 +'}</M> {feld('b', 'Zahl vor x')} <M>{'x +'}</M> {feld('c', 'Zahl ohne x')}
      </div>
      <div>
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
              <li key={p.name}>
                <i className={`fa-solid ${p.ok ? 'fa-circle-check' : 'fa-circle-xmark'}`} aria-hidden="true" /> {p.name}:{' '}
                {p.ok ? <>Höhe {meter(p.soll)}, passt</> : <>Höhe {meter(p.ist)} statt {meter(p.soll)}</>}
              </li>
            ))}
          </ul>
          <strong>{passt(letzter) ? 'Bogen passt. Die Maschine nimmt die Gleichung an.' : 'Bogen passt nicht. Die Maschine lehnt die Gleichung ab.'}</strong>
        </div>
      )}
      {(versuche.length >= 3 || treffer) && (
        <div className="ls-question">
          <i className="fa-solid fa-lightbulb" aria-hidden="true" />
          <span>
            {treffer
              ? 'Treffer! Aber beim nächsten Kunden hat der Bogen andere Maße. Raten dauert, und man weiß nie, ob es klappt.'
              : 'Raten bringt dich kaum ans Ziel: Passt der Bogen an einer Stelle, stimmt er an einer anderen nicht.'}{' '}
            In Phase 3 berechnest du die Gleichung deshalb sicher aus dem Scheitelpunkt und einem weiteren Punkt.
          </span>
        </div>
      )}
    </div>
  )
}

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
                  <MB>{t}</MB>
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

  return (
    <ErklaerungCtx.Provider value={erklaerung}>
      <TaskShell
        title="Funktionsgleichung aufstellen"
        subtitle="Lernsituation 1: Der Torbogen für die Hofeinfahrt"
        width="wide"
        parent={{ to: '/quadratische_funktionen/funktionsgleichung_aufstellen', label: 'Funktionsgleichung aufstellen' }}
      >
        <div className="lp">
          <div>
            <button type="button" className="bk-btn bk-btn-sm bk-btn-ghost" onClick={onBack}>
              <i className="fa-solid fa-arrow-left" aria-hidden="true" /> Zurück zur Auswahl
            </button>
          </div>
          <div className="lp-goal">
            <i className="fa-solid fa-bullseye" aria-hidden="true" />
            <div>
              <strong>Das lernst du hier:</strong> Du stellst die Funktionsgleichung einer Parabel auf, wenn du den Scheitelpunkt und einen weiteren Punkt kennst.
            </div>
          </div>
          <Arbeitsweise />

          <Fortschritt prefix="tb" />

          <Etappe
            prefix="tb"
            art="start"
            social="EA"
            minutes={4}
            was={<>Drei kurze Aufgaben allein lösen.</>}
            wozu={<>Genau diese drei Rechnungen brauchst du gleich, um die Gleichung des Torbogens aufzustellen.</>}
          >
            <div className="lp-exlist">
              <McCard
                title="a) Scheitelpunkt ablesen"
                prompt={
                  <p>
                    Welchen Scheitelpunkt hat die Parabel <M>{'y = -2(x - 1)^2 + 4'}</M>?
                  </p>
                }
                options={[
                  { text: 'S(1 | 4)', correct: true, feedback: 'In der Scheitelform y = a(x − x_S)² + y_S steht x_S mit umgekehrtem Vorzeichen in der Klammer.' },
                  { text: 'S(−1 | 4)', feedback: 'In der Klammer steht x − 1. Das Minus gehört zur Formel, der Scheitel liegt also bei x = 1.' },
                  { text: 'S(4 | 1)', feedback: 'Die Koordinaten sind vertauscht. Die Zahl in der Klammer gehört zum x-Wert, die Zahl hinten zum y-Wert.' },
                  { text: 'S(−2 | 4)', feedback: 'Die −2 vor der Klammer ist der Streckfaktor a. Sie sagt, wie steil die Parabel ist, nicht wo der Scheitel liegt.' },
                ]}
              />
              <CheckCard
                title="b) Gleichung nach a lösen"
                prompt={
                  <p>
                    Löse die Gleichung <M>{'7 = 4a + 3'}</M>.
                  </p>
                }
                fields={[{ kind: 'num', key: 'a', label: <M>{'a ='}</M>, expected: 1 }]}
                solution={<MB>{'\\begin{aligned} 7 &= 4a + 3 && \\mid -3 \\\\ 4 &= 4a && \\mid :4 \\\\ a &= 1 \\end{aligned}'}</MB>}
              />
              <CheckCard
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
            </div>
          </Etappe>

          <Etappe
            prefix="tb"
            art="problem"
            social="EA"
            minutes={6}
            was={<>Den Auftrag lesen und Gleichungen an die Biegemaschine schicken. Noch nicht rechnen, einfach ausprobieren.</>}
            wozu={<>Du merkst, ob du die richtige Gleichung durch Raten findest, oder ob du ein Verfahren brauchst.</>}
          >
            <div className="wm-notiz">
              <p>
                Du machst eine Ausbildung im Metallbau. Über einer 4 m breiten Hofeinfahrt soll ein Torbogen aus Stahlrohr entstehen. Er sitzt auf zwei 2 m hohen Pfosten und ist in der
                Mitte 3 m hoch. Die Biegemaschine braucht dafür die Funktionsgleichung des Bogens.
              </p>
            </div>
            <Problemkarte />
            <Biegemaschine versuche={versuche} onSenden={(v) => setVersuche((alt) => [...alt, v])} />
          </Etappe>

          <Etappe
            prefix="tb"
            art="loesen"
            social="EA"
            minutes={18}
            was={<>Die Funktionsgleichung des Torbogens erst in Scheitelform und dann in allgemeiner Form aufstellen. Zuerst siehst du an einem Rechenbeispiel, wie das geht.</>}
            wozu={<>So stellst du die Gleichung jeder Parabel auf, von der du den Scheitelpunkt und einen weiteren Punkt kennst.</>}
          >
            <Teil title="Deine Aufgabe">
              <div className="tb-problem">
                <div className="tb-problem-title">
                  <i className="fa-solid fa-bullseye" aria-hidden="true" /> Stelle die Funktionsgleichung auf
                </div>
                <p>
                  Gegeben sind der Scheitelpunkt <M>{'S(2 \\mid 3)'}</M> und der Pfosten <M>{'P(0 \\mid 2)'}</M>. Stelle die Funktionsgleichung zuerst in <strong>Scheitelform</strong>{' '}
                  <M>{'y = a(x - x_S)^2 + y_S'}</M> und anschließend in <strong>allgemeiner Form</strong> <M>{'y = ax^2 + bx + c'}</M> auf.
                </p>
                <p>Wie das funktioniert, siehst du am Rechenbeispiel darunter. Führe danach die Berechnung selbst für deine Werte durch.</p>
              </div>
              <TorBild nurP />
            </Teil>

            <Teil title="So geht's: Rechenbeispiel mit anderen Zahlen">
              <Beispiel
                offen
                title="Scheitelpunkt S(−1 | 5) und Punkt P(1 | 3)"
                aufgabe={
                  <p>
                    Eine Parabel hat den Scheitelpunkt <M>{'S(-1 \\mid 5)'}</M> und geht durch den Punkt <M>{'P(1 \\mid 3)'}</M>. Stelle die Funktionsgleichung in Scheitelform und in
                    allgemeiner Form auf.
                  </p>
                }
                steps={[
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
                    title: 'Punkt einsetzen und a berechnen',
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
                ]}
              />
              <ErklaerungAufklappen label="Noch ein Beispiel und das Erklärvideo ansehen" />
            </Teil>

            <Teil title="Jetzt du: die Gleichung für die Biegemaschine">
              <CheckCard
                title="Stelle die Funktionsgleichung auf"
                prompt={
                  <p>
                    Gegeben: <M>{'S(2 \\mid 3)'}</M> und <M>{'P(0 \\mid 2)'}</M>. Rechne in den Schritten des Rechenbeispiels und fülle die Lücken aus.
                  </p>
                }
                rechnung={[
                  { l: ['y'], r: ['a \\cdot (x -', { luecke: 'xs' }, ')^2 +', { luecke: 'ys' }], u: '\\text{① Scheitelpunkt einsetzen}' },
                  { l: ['2'], r: ['a \\cdot (0 - 2)^2 + 3'], u: '\\text{② Punkt P einsetzen}' },
                  { l: ['2'], r: [{ luecke: 'q' }, '\\cdot a + 3'] },
                  { l: ['y'], r: [{ luecke: 'as' }, '\\cdot (x - 2)^2 + 3'], u: '\\text{③ Scheitelform}' },
                  { l: ['y'], r: [{ luecke: 'a2' }, 'x^2 +', { luecke: 'b' }, 'x +', { luecke: 'c' }], u: '\\text{④ allgemeine Form}' },
                ]}
                fields={[
                  { kind: 'num', key: 'xs', label: 'x-Wert des Scheitels', expected: 2 },
                  { kind: 'num', key: 'ys', label: 'y-Wert des Scheitels', expected: 3 },
                  { kind: 'num', key: 'q', label: 'Zahl vor a', expected: 4 },
                  { kind: 'num', key: 'as', label: 'a in der Scheitelform', expected: A_SOLL },
                  { kind: 'num', key: 'a2', label: 'Zahl vor x²', expected: A_SOLL },
                  { kind: 'num', key: 'b', label: 'Zahl vor x', expected: 1 },
                  { kind: 'num', key: 'c', label: 'Zahl ohne x', expected: 2 },
                ]}
                solution={
                  <>
                    <p>① Scheitelpunkt einsetzen:</p>
                    <MB>{'y = a(x - 2)^2 + 3'}</MB>
                    <p>② Pfosten P einsetzen (x = 0, y = 2) und nach a auflösen:</p>
                    <MB>{'\\begin{aligned} 2 &= a \\cdot (0 - 2)^2 + 3 \\\\ 2 &= 4a + 3 && \\mid -3 \\\\ -1 &= 4a && \\mid :4 \\\\ a &= -0{,}25 \\end{aligned}'}</MB>
                    <p>③ Scheitelform:</p>
                    <MB>{'y = -0{,}25(x - 2)^2 + 3'}</MB>
                    <p>④ In die allgemeine Form umwandeln:</p>
                    <MB>{'\\begin{aligned} y &= -0{,}25 \\cdot [(x - 2) \\cdot (x - 2)] + 3 \\\\ y &= -0{,}25 \\cdot [x^2 - 4x + 4] + 3 \\\\ y &= -0{,}25x^2 + x - 1 + 3 \\\\ y &= -0{,}25x^2 + x + 2 \\end{aligned}'}</MB>
                  </>
                }
                help={
                  <Hilfen
                    steps={[
                      <>
                        Schau im Rechenbeispiel bei Schritt 1: Setze <M>{'x_S = 2'}</M> und <M>{'y_S = 3'}</M> in <M>{'y = a(x - x_S)^2 + y_S'}</M> ein.
                      </>,
                      <>
                        Setze den Pfosten ein: <M>{'x = 0'}</M> und <M>{'y = 2'}</M>. Achtung: <M>{'(-2)^2 = 4'}</M>, ein Quadrat ist nie negativ. Dann wie beim Warm-up nach a auflösen.
                      </>,
                      <>
                        Mit <M>{'a = -0{,}25'}</M>: <M>{'(x - 2)^2 = x^2 - 4x + 4'}</M>. Jetzt jeden der drei Summanden mit <M>{'-0{,}25'}</M> multiplizieren und + 3 dazurechnen.
                      </>,
                    ]}
                  />
                }
              />
            </Teil>
          </Etappe>

          <Etappe
            prefix="tb"
            art="sichern"
            social="EA"
            minutes={14}
            was={<>Das Verfahren in deinem Heft festhalten und dann allein an neuen Aufgaben prüfen, ob du es kannst.</>}
            wozu={<>Mit deinem Spickzettel kannst du jede Aufgabe dieser Art lösen. Der Check zeigt dir, wo du noch unsicher bist.</>}
          >
            <Teil title="Das hältst du fest">
              <Rueckbezug versuche={versuche} />
              <div className="wm-mappe">
                <span className="wm-reiter">Auftragsmappe 2026-117</span>
                <div className="wm-blatt">
                  <span className="wm-stempel">Freigegeben</span>
                  <p>
                    An die Biegemaschine geht: <M>{'y = -0{,}25x^2 + x + 2'}</M>, in Scheitelform <M>{'y = -0{,}25(x - 2)^2 + 3'}</M>.
                  </p>
                </div>
              </div>
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
              <div className="lp-ex bk-panel">
                <CardHead title="Dein Spickzettel (Lernprodukt)" />
                <p>Gestalte eine Karteikarte „Gleichung aus dem Scheitelpunkt aufstellen“. Sie darf genau eine Karteikarte füllen. Hake ab, was du schon hast:</p>
                <div className="ls-criteria">
                  {[
                    'Die drei Schritte in der richtigen Reihenfolge, jeder mit einem kurzen Merksatz',
                    'Bei jedem Schritt eine Warnung vor einem typischen Fehler',
                    'Ein eigenes Beispiel mit anderen Zahlen',
                    'Eine kleine Skizze, an der man das Vorzeichen von a erkennt',
                  ].map((c) => (
                    <label key={c}>
                      <input type="checkbox" /> <span>{c}</span>
                    </label>
                  ))}
                </div>
              </div>
            </Teil>
            <Teil title="Check: Kannst du es allein?">
              <div className="lp-exlist">
                <div className="lp-ex bk-panel">
                  <CardHead title="Check 1: Qualitätskontrolle" level="standard" />
                  <p>Zwei Azubis haben den Torbogen auch berechnet. Beide Pläne sind falsch. Findest du die Fehler?</p>
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
                </div>
                <CheckCard
                  title="Wo stecken die Fehler?"
                  rechnen={false}
                  prompt={<p>Wähle für jeden Plan den Schritt, in dem der Fehler steckt. Schreibe den Fehler mit einem Satz ins Heft.</p>}
                  fieldsRow
                  fields={[
                    { kind: 'select', key: 'j', label: 'Fehler bei Jonas', options: SCHRITTE, expected: 0 },
                    { kind: 'select', key: 'm', label: 'Fehler bei Mara', options: SCHRITTE, expected: 2 },
                  ]}
                  solution={
                    <>
                      <p>
                        <strong>Jonas, Schritt 1:</strong> Bei <M>{'S(2 \\mid 3)'}</M> heißt die Klammer <M>{'(x - 2)'}</M>, nicht <M>{'(x + 2)'}</M>. Seine Probe mit P stimmt trotzdem,
                        weil er P zum Rechnen benutzt hat. Die Probe mit Q deckt den Fehler auf: Bei <M>{'x = 4'}</M> ergibt sich <M>{'y = -6'}</M> statt 2.
                      </p>
                      <p>
                        <strong>Mara, Schritt 3:</strong> Sie hat nur <M>{'x^2'}</M> mit <M>{'-0{,}25'}</M> multipliziert. Richtig ist{' '}
                        <M>{'-0{,}25(x^2 - 4x + 4) + 3 = -0{,}25x^2 + x - 1 + 3'}</M>.
                      </p>
                    </>
                  }
                />
                <CheckCard
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
                        <>Gehe wie auf deinem Spickzettel vor: erst der Scheitelpunkt, dann der Punkt P, dann umwandeln.</>,
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
                <CheckCard
                  title="Check 3: Sonderwunsch, der Bogen soll höher werden"
                  level="erweiterung"
                  prompt={
                    <p>
                      Familie Berger ruft an: Der Bogen soll in der Mitte 3,5 m hoch sein, die Pfosten bleiben 2 m hoch. Berechne das neue <M>a</M>. Wird der Bogen dadurch steiler oder
                      flacher? Begründe im Heft.
                    </p>
                  }
                  fieldsRow
                  fields={[
                    { kind: 'num', key: 'a', label: <M>{'a ='}</M>, expected: -0.375 },
                    { kind: 'select', key: 's', label: 'Der Bogen wird …', options: ['steiler', 'flacher'], expected: 0 },
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
                        <>Der Scheitel liegt jetzt bei S(2 | 3,5), der Pfosten bleibt bei P(0 | 2).</>,
                        <>
                          Neuer Ansatz: <M>{'y = a(x - 2)^2 + 3{,}5'}</M>. Setze P ein und löse nach a auf.
                        </>,
                        <>
                          <M>{'2 = 4a + 3{,}5'}</M>. Vergleiche danach den Betrag des neuen a mit 0,25: Größerer Betrag heißt schmalere Parabel.
                        </>,
                      ]}
                    />
                  }
                />
              </div>
            </Teil>
          </Etappe>

          <nav className="lp-nav" aria-label="Weiter">
            <button type="button" className="bk-btn" onClick={onBack}>
              <i className="fa-solid fa-arrow-left" aria-hidden="true" /> Zurück zur Auswahl
            </button>
            <button type="button" className="bk-btn" onClick={onPractice}>
              Weiter üben: Fall 1 <i className="fa-solid fa-dumbbell" aria-hidden="true" />
            </button>
            <button type="button" className="bk-btn bk-btn-primary" onClick={onNext}>
              Zu Lernsituation 2 <i className="fa-solid fa-arrow-right" aria-hidden="true" />
            </button>
          </nav>
        </div>
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
        Mit dem Scheitelpunkt und einem weiteren Punkt rechnest du die Gleichung in drei Schritten sicher aus, statt zu raten: <strong>y = −0,25x² + x + 2</strong>. Das Minus vor
        x² passt zum Bogen: Er ist oben rund und hängt nicht durch.
      </p>
    </div>
  )
}

import { useId, useState, type ChangeEvent, type ReactNode } from 'react'
import TaskShell from '../../../components/layout/TaskShell'
import CheckedNumberInput from '../../../components/CheckedNumberInput'
import { Beispiel, M, MB, Merke, QuerTabelle, fmt } from '../../daten_und_zufall/lernpfad/kit'
import { CardHead, CheckCard, ErklaerungAufklappen, ErklaerungCtx, Hilfen, LevelTag, McCard, Phase, tx } from '../../lineare_funktionen/lernsituation_kit/kit'
import '../../daten_und_zufall/lernpfad/lernpfad.css'
import './lab.css'

// Einstiegs-Lernsituation „Löst der Sprung die Lichtschranke aus?“ zu Schnittpunkten von Parabel und Gerade.
// Format Experimentierlabor, Look Laborprotokoll, Lernprodukt analog (Spickzettel).
// Instruktionsreihenfolge: Problem zuerst. Die SuS können quadratische Gleichungen mit der abc-Formel lösen und
// Geraden gleichsetzen; neu ist nur, dass die Anzahl der Lösungen die Anzahl der Schnittpunkte bestimmt.
// Phasen: Aktivieren → Situation & Festlegung → Experimentieren → Austausch → Sichern → Check.
// Die Festlegung bleibt nur im Seitenzustand (kein Speichern).
// Wird als Modus „Lernsituation“ auf der Seite „Schnittpunkte von Parabel und Gerade“ angezeigt; der Infoteil
// (Erklärung mit Erklärvideo) kommt von dort, damit er nur an einer Stelle gepflegt wird.

/* ── Situation ───────────────────────────────────────────────────────────── */

// Seitenansicht des Skateparks, 1 LE = 1 m. Absprung bei (0|0), Landung bei (8|0), höchster Punkt (4|4).
// Der Sensor der Lichtschranke steht am linken Pfosten in Höhe t, der Strahl steigt pro Meter um 0,5 m.
const p = (x: number) => -0.25 * x * x + 2 * x
const g = (t: number) => (x: number) => 0.5 * x + t
/** Diskriminante von p(x) = g(x), also −0,25x² + 1,5x − t = 0 */
const disc = (t: number) => 2.25 - t
const T_TOUCH = 2.25
const T_MAX = 4

/** gemeinsame Punkte von Sprungbahn und Lichtschranke */
function schnitt(t: number): { x: number; y: number }[] {
  const d = disc(t)
  if (d < -1e-9) return []
  if (Math.abs(d) < 1e-9) return [{ x: 3, y: g(t)(3) }]
  const w = 2 * Math.sqrt(d)
  return [3 - w, 3 + w].map((x) => ({ x, y: g(t)(x) }))
}

type Choice = 'null' | 'eins' | 'zwei'
type Prediction = { choice: Choice | null; tGrenze: number; saved: boolean }

const CHOICE_TEXT: Record<Choice, string> = {
  null: 'Der Sprung löst die Lichtschranke gar nicht aus',
  eins: 'Der Sprung löst sie genau einmal aus',
  zwei: 'Der Sprung löst sie zweimal aus',
}

/* ── Sachbild: Skatepark von der Seite ───────────────────────────────────── */

const S = { w: 640, h: 330, l: 44, r: 14, t: 12, b: 34, xMin: -1, xMax: 9, yMin: -0.6, yMax: 5 }
const bx = (x: number) => S.l + ((x - S.xMin) / (S.xMax - S.xMin)) * (S.w - S.l - S.r)
const by = (y: number) => S.h - S.b - ((y - S.yMin) / (S.yMax - S.yMin)) * (S.h - S.t - S.b)

const PARABEL = Array.from({ length: 81 }, (_, i) => i / 10)
  .map((x) => `${bx(x)},${by(p(x))}`)
  .join(' ')

/** Sprungbahn p und Lichtschranke g bei Sensorhöhe t; Punkte = gemeinsame Punkte markieren */
function SkateBild({ t, punkte = true }: { t: number; punkte?: boolean }) {
  const clip = useId().replace(/[^a-zA-Z0-9]/g, '')
  const gt = g(t)
  const pts = schnitt(t)
  return (
    <div className="bk-graph ls-graph">
      <svg viewBox={`0 0 ${S.w} ${S.h}`} role="img" aria-label="Seitenansicht des Skateparks mit der Sprungbahn als Parabel und der Lichtschranke als Gerade">
        <defs>
          <clipPath id={clip}>
            <rect x={bx(S.xMin)} y={S.t} width={bx(S.xMax) - bx(S.xMin)} height={by(S.yMin) - S.t} />
          </clipPath>
        </defs>
        {Array.from({ length: 10 }, (_, i) => i).map((v) => (
          <g key={`x${v}`}>
            <line x1={bx(v)} x2={bx(v)} y1={by(0)} y2={by(S.yMax)} stroke="var(--grid)" />
            <text x={bx(v)} y={by(0) + 24} textAnchor="middle" fontSize="19" fill="var(--ink-muted)">
              {v}
            </text>
          </g>
        ))}
        {[1, 2, 3, 4].map((v) => (
          <g key={`y${v}`}>
            <line x1={bx(0)} x2={bx(S.xMax)} y1={by(v)} y2={by(v)} stroke="var(--grid)" />
            <text x={bx(0) - 8} y={by(v) + 6} textAnchor="end" fontSize="19" fill="var(--ink-muted)">
              {v}
            </text>
          </g>
        ))}
        <rect x={bx(S.xMin)} y={by(0)} width={bx(S.xMax) - bx(S.xMin)} height={by(S.yMin) - by(0)} fill="var(--surface-sunken)" />
        <line x1={bx(S.xMin)} x2={bx(S.xMax)} y1={by(0)} y2={by(0)} stroke="var(--ink)" strokeWidth="3" />
        <line x1={bx(0)} x2={bx(0)} y1={by(S.yMin)} y2={by(S.yMax)} stroke="var(--ink)" strokeWidth="1.5" />
        <text x={bx(S.xMax) - 4} y={by(0) - 8} textAnchor="end" fontSize="14" fill="var(--ink-muted)">
          Boden (x in m)
        </text>
        <g clipPath={`url(#${clip})`}>
          {/* Lichtschranke */}
          <line x1={bx(0)} y1={by(gt(0))} x2={bx(S.xMax)} y2={by(gt(S.xMax))} stroke="var(--hint)" strokeWidth="3.5" strokeDasharray="10 5" />
          {/* Sprungbahn */}
          <polyline points={PARABEL} fill="none" stroke="var(--primary)" strokeWidth="4" strokeLinecap="round" />
        </g>
        {/* Sensor am Pfosten */}
        <rect x={bx(0) - 9} y={by(t) - 12} width="18" height="24" rx="3" fill="var(--ink)" />
        <text x={bx(0) + 16} y={by(t) + 28} fontSize="15" fontWeight="700" fill="var(--ink)">
          Sensor
        </text>
        <text x={bx(1.2)} y={by(p(1.2)) - 14} fontSize="24" fontWeight="700" fill="var(--primary)">
          p
        </text>
        {gt(2.2) < S.yMax - 0.3 && (
          <text x={bx(2.2)} y={by(gt(2.2)) - 12} fontSize="24" fontWeight="700" fill="var(--hint)">
            g
          </text>
        )}
        {punkte &&
          pts.map((q, i) => (
            <circle key={i} cx={bx(q.x)} cy={by(q.y)} r="8" fill="var(--highlight)" stroke="var(--ink)" strokeWidth="2.5" />
          ))}
      </svg>
    </div>
  )
}

/** Laborkarte im Protokoll-Look */
function LabKarte({ no, title, level, children }: { no: number; title: string; level?: 'basis' | 'standard' | 'erweiterung'; children: ReactNode }) {
  return (
    <div className="lab-card">
      <span className="lab-tag">Versuch {no}</span>
      <h3 className="lab-title">{title}</h3>
      {level && (
        <div>
          <LevelTag level={level} />
        </div>
      )}
      {children}
    </div>
  )
}

/** Regler für die Sensorhöhe mit Bild und Anzeige */
function LabRegler() {
  const sliderId = useId()
  const [t, setT] = useState(1)
  const n = schnitt(t).length
  return (
    <div className="lp-ex bk-panel">
      <div className="lp-ex-prompt">
        <p>
          Stellt den Sensor mit dem Regler auf die Höhen aus der Tabelle. Die gelben Punkte zeigen, wo die Sprungbahn die Linie der Lichtschranke kreuzt. Zählt sie.
        </p>
      </div>
      <SkateBild t={t} />
      <div className="ls-slider">
        <label htmlFor={sliderId}>
          Sensorhöhe <M>t</M> = <span className="ls-slider-value">{fmt(t, 2)}</span> m
        </label>
        <input
          id={sliderId}
          type="range"
          min={0}
          max={T_MAX}
          step={0.25}
          value={t}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setT(Number(e.target.value))}
        />
      </div>
      <div className="ls-readout">
        <div className="ls-readout-box ls-readout-b">
          <strong>Lichtschranke:</strong> <M>{`g(x) = 0{,}5x + ${tx(t)}`}</M>
        </div>
        <div className="ls-readout-box ls-readout-a">
          <strong>gelbe Punkte im Bild:</strong> {n}
        </div>
      </div>
    </div>
  )
}

/** Eingabefeld für die Versuchstabelle */
function zaehlFeld(expected: number, key: number) {
  return (
    <span key={key}>
      <CheckedNumberInput expected={expected} tolerance={0.001} className="bk-input lp-input lp-input-sm" />
    </span>
  )
}

const VERSUCHE = [0, 1, 2, 2.25, 3]

/* ── Seite ───────────────────────────────────────────────────────────────── */

export default function SkateEinstieg({ erklaerung, onBack, onPractice }: { erklaerung: ReactNode; onBack: () => void; onPractice: () => void }) {
  const [pred, setPred] = useState<Prediction>({ choice: null, tGrenze: 2, saved: false })

  return (
    <ErklaerungCtx.Provider value={erklaerung}>
      <TaskShell title="Schnittpunkte von Parabel und Gerade" subtitle="Lernsituation: Löst der Sprung die Lichtschranke aus?" width="wide">
        <div className="lp">
          <div>
            <button type="button" className="bk-btn bk-btn-sm bk-btn-ghost" onClick={onBack}>
              <i className="fa-solid fa-arrow-left" aria-hidden="true" /> Zurück zur Auswahl
            </button>
          </div>
          <div className="lp-goal">
            <i className="fa-solid fa-bullseye" aria-hidden="true" />
            <div>
              <strong>Das lernst du hier:</strong> Du findest heraus, wie viele gemeinsame Punkte eine Parabel und eine Gerade haben können und woran du das beim Rechnen
              erkennst. Dann berechnest du die Schnittpunkte.
            </div>
          </div>

          {/* 1 Aktivieren */}
          <Phase no={1} title="Fit für den Start" social="EA" minutes={5}>
            <p>Diese drei kurzen Aufgaben brauchst du gleich. Löse sie allein.</p>
            <div className="lp-exlist">
              <CheckCard
                title="a) Punktprobe bei einer Parabel"
                prompt={
                  <p>
                    Liegt der Punkt <M>{'P(2 \\mid 3)'}</M> auf der Parabel <M>{'p(x) = -0{,}25x^2 + 2x'}</M>? Halte deinen Rechenweg schriftlich fest.
                  </p>
                }
                fields={[{ kind: 'select', key: 'p', label: 'Antwort', options: ['Ja', 'Nein'], expected: 0 }]}
                solution={
                  <>
                    <p>x-Wert einsetzen und mit dem y-Wert vergleichen:</p>
                    <MB>{'p(2) = -0{,}25 \\cdot 2^2 + 2 \\cdot 2 = -1 + 4 = 3 \\;\\checkmark'}</MB>
                    <p>Der y-Wert stimmt, also liegt P auf der Parabel.</p>
                  </>
                }
              />
              <CheckCard
                title="b) Quadratische Gleichung lösen"
                prompt={
                  <p>
                    Löse <M>{'x^2 - 6x + 8 = 0'}</M> mit der abc-Formel. Berechne zuerst den Term unter der Wurzel <M>{'D = b^2 - 4ac'}</M>. Halte deinen Rechenweg schriftlich fest.
                  </p>
                }
                fieldsRow
                fields={[
                  { kind: 'num', key: 'd', label: <M>{'D ='}</M>, expected: 4 },
                  { kind: 'num', key: 'x1', label: <>kleinere Lösung <M>{'x_1 ='}</M></>, expected: 2 },
                  { kind: 'num', key: 'x2', label: <>größere Lösung <M>{'x_2 ='}</M></>, expected: 4 },
                ]}
                solution={
                  <>
                    <MB>{'D = b^2 - 4ac = (-6)^2 - 4 \\cdot 1 \\cdot 8 = 36 - 32 = 4'}</MB>
                    <MB>{'x_{1,2} = \\frac{-b \\pm \\sqrt{D}}{2a} = \\frac{6 \\pm 2}{2} \\;\\Rightarrow\\; x_1 = 2,\\; x_2 = 4'}</MB>
                  </>
                }
              />
              <McCard
                title="c) Gleichsetzen und umformen"
                prompt={
                  <p>
                    Du setzt <M>{'p(x) = -0{,}25x^2 + 2x'}</M> und <M>{'g(x) = 0{,}5x + 2'}</M> gleich. Welche Gleichung entsteht, wenn du alles auf eine Seite bringst
                    (rechts steht 0)?
                  </p>
                }
                options={[
                  { text: <M>{'-0{,}25x^2 + 1{,}5x - 2 = 0'}</M>, correct: true, feedback: 'Du ziehst 0,5x und 2 auf beiden Seiten ab: 2x − 0,5x = 1,5x.' },
                  { text: <M>{'-0{,}25x^2 + 2{,}5x + 2 = 0'}</M>, feedback: 'Beim Verschieben auf die linke Seite ändern sich die Vorzeichen: Aus +0,5x wird −0,5x und aus +2 wird −2.' },
                  { text: <M>{'-0{,}25x^2 + 1{,}5x + 2 = 0'}</M>, feedback: 'Die 1,5x stimmen, aber die 2 wechselt beim Verschieben auf die linke Seite das Vorzeichen: −2.' },
                  { text: <M>{'-0{,}25x^2 + 2x = 0{,}5x + 2'}</M>, feedback: 'Das ist die Gleichung nach dem Gleichsetzen. Für die abc-Formel muss rechts aber 0 stehen.' },
                ]}
              />
            </div>
          </Phase>

          {/* 2 Situation & Festlegung */}
          <Phase no={2} title="Die Situation: Trick-Contest im Skatepark" social="EA" minutes={5}>
            <p>
              Im Skatepark wird ein Trick-Contest veranstaltet. Eine Lichtschranke misst, ob ein Sprung eine bestimmte Linie kreuzt. Das Bild zeigt den Park von der Seite
              (1 Kästchen = 1 m). Der Sprung startet bei <M>{'x = 0'}</M> und landet bei <M>{'x = 8'}</M>. Die Wertung zählt jeden Punkt, an dem die Sprungbahn die Linie der
              Lichtschranke kreuzt.
            </p>
            <SkateBild t={1} punkte={false} />
            <div className="ls-flyers">
              <div className="ls-flyer ls-flyer-a">
                <div className="ls-flyer-name">Sprungbahn</div>
                <div className="ls-flyer-price">
                  Parabel{' '}
                  <strong>
                    <M>{'p(x) = -0{,}25x^2 + 2x'}</M>
                  </strong>
                </div>
              </div>
              <div className="ls-flyer ls-flyer-b">
                <div className="ls-flyer-name">Lichtschranke</div>
                <div className="ls-flyer-price">
                  Gerade{' '}
                  <strong>
                    <M>{'g(x) = 0{,}5x + t'}</M>
                  </strong>
                </div>
                <div className="ls-flyer-sub">
                  <M>t</M> ist die Höhe des Sensors am linken Pfosten. Im Bild ist <M>{'t = 1'}</M> m.
                </div>
              </div>
            </div>
            <div className="ls-question">
              <i className="fa-solid fa-circle-question" aria-hidden="true" />
              <span>Wie oft kreuzt der Sprung die Lichtschranke, und bis zu welcher Sensorhöhe passiert das überhaupt?</span>
            </div>

            <div className="lp-ex bk-panel" data-no-autocheck>
              <CardHead title="Deine Vermutung" />
              {pred.saved && pred.choice ? (
                <>
                  <div className="ls-saved" role="status">
                    <i className="fa-solid fa-lock" aria-hidden="true" /> Gespeichert: <strong>{CHOICE_TEXT[pred.choice]}</strong> (bei <M>{'t = 1'}</M>). Deine Schätzung: Bis{' '}
                    <strong>t ≈ {fmt(pred.tGrenze, 2)} m</strong> löst der Sprung die Schranke noch aus. Am Ende schauen wir, ob du recht hattest.
                  </div>
                  <div>
                    <button type="button" className="bk-btn bk-btn-sm bk-btn-ghost" onClick={() => setPred({ ...pred, saved: false })}>
                      Vermutung ändern
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p>Rechne noch nicht! Entscheide spontan und schreibe einen Satz als Begründung in dein Heft.</p>
                  <div className="ls-options" role="radiogroup" aria-label="Vermutung für t = 1">
                    {(['null', 'eins', 'zwei'] as const).map((c) => (
                      <label key={c} className="bk-choice ls-option">
                        <input type="radio" name="lab-pred" checked={pred.choice === c} onChange={() => setPred({ ...pred, choice: c })} />
                        <span>{CHOICE_TEXT[c]}</span>
                      </label>
                    ))}
                  </div>
                  <div className="ls-slider">
                    <label htmlFor="lab-pred-t">
                      Ich schätze: Bis zur Sensorhöhe <M>t</M> ≈ <span className="ls-slider-value">{fmt(pred.tGrenze, 2)}</span> m wird die Schranke noch ausgelöst.
                    </label>
                    <input
                      id="lab-pred-t"
                      type="range"
                      min={0}
                      max={T_MAX}
                      step={0.25}
                      value={pred.tGrenze}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setPred({ ...pred, tGrenze: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <button type="button" className="bk-btn bk-btn-primary" disabled={!pred.choice} onClick={() => setPred({ ...pred, saved: true })}>
                      <i className="fa-solid fa-lock" aria-hidden="true" /> Vermutung festhalten
                    </button>
                  </div>
                </>
              )}
            </div>
          </Phase>

          {/* 3 Experimentieren */}
          <Phase no={3} title="Ab ins Labor: Findet es heraus" social="PA" minutes={15}>
            <p>
              <strong>Auftrag:</strong> Führt zu zweit die Versuche aus und haltet eure Beobachtungen im Laborprotokoll fest. Jede Person tippt auf dem eigenen Gerät, ihr
              besprecht jede Antwort kurz miteinander.
            </p>

            <LabKarte no={1} title="Sensor verschieben und Punkte zählen" level="basis">
              <LabRegler />
              <div className="lp-ex bk-panel">
                <div className="lp-ex-prompt">
                  <p>Tragt ein, wie viele gemeinsame Punkte die Sprungbahn und die Lichtschranke bei jeder Sensorhöhe haben. Die Felder färben sich von selbst grün oder rot.</p>
                </div>
                <div className="lab-table-wrap">
                  <QuerTabelle
                    rows={[
                      { head: 'Sensorhöhe t in m', cells: VERSUCHE.map((t) => <strong key={t}>{fmt(t, 2)}</strong>) },
                      { head: 'Anzahl gemeinsamer Punkte', cells: VERSUCHE.map((t) => zaehlFeld(schnitt(t).length, t)) },
                    ]}
                  />
                </div>
                <p className="lp-hint">Bei t = 2,25 m sieht man im Bild nur einen Punkt. Versucht auch Höhen knapp darüber und darunter: 2 m und 2,5 m.</p>
                <Hilfen
                  steps={[
                    <>Zählt nur die gelben Punkte, in denen Sprungbahn und Lichtschranke wirklich zusammentreffen.</>,
                    <>Schiebt den Regler in kleinen Schritten von unten nach oben und beobachtet, wann sich die Anzahl der Punkte ändert.</>,
                    <>
                      Bei <M>{'t = 0'}</M> trifft die Schranke die Sprungbahn schon beim Absprung <M>{'(0 \\mid 0)'}</M> und noch einmal weiter rechts. Das sind zwei Punkte.
                    </>,
                  ]}
                />
              </div>
              <McCard
                title="Beobachtung festhalten"
                prompt={<p>Was passiert, wenn der Sensor immer höher gestellt wird? Wähle die Beobachtung, die zu eurer Tabelle passt.</p>}
                options={[
                  { text: 'Erst zwei gemeinsame Punkte, dann genau ein Punkt, dann kein Punkt.', correct: true, feedback: 'Zwischen „zwei“ und „keiner“ liegt genau eine Höhe, bei der die Gerade die Parabel nur berührt.' },
                  { text: 'Erst zwei gemeinsame Punkte, dann plötzlich kein Punkt mehr.', feedback: 'Schaut noch einmal bei t = 2,25 m nach: Dort gibt es genau einen Punkt, die Lichtschranke berührt die Sprungbahn nur.' },
                  { text: 'Es gibt immer zwei gemeinsame Punkte, egal wie hoch der Sensor steht.', feedback: 'Bei t = 3 m ist die Lichtschranke über der ganzen Sprungbahn, dort gibt es keinen gemeinsamen Punkt.' },
                  { text: 'Erst kein Punkt, dann ein Punkt, dann zwei Punkte.', feedback: 'Die Reihenfolge ist umgekehrt: Je höher der Sensor, desto weniger Punkte.' },
                ]}
              />
            </LabKarte>

            <LabKarte no={2} title="Nachrechnen für t = 2" level="standard">
              <CheckCard
                title="Rechnerisch prüfen"
                prompt={
                  <>
                    <p>
                      Die Tabelle zeigt für <M>{'t = 2'}</M> zwei Punkte. Berechnet sie jetzt genau. Setzt dazu <M>{'p(x) = g(x)'}</M> gleich:
                    </p>
                    <MB>{'-0{,}25x^2 + 2x = 0{,}5x + 2'}</MB>
                    <p>
                      Bringt alles auf die linke Seite, sodass die Gleichung <M>{'ax^2 + bx + c = 0'}</M> entsteht, und löst sie mit der abc-Formel. Haltet eure Rechenwege
                      schriftlich fest.
                    </p>
                  </>
                }
                fieldsRow
                fields={[
                  { kind: 'num', key: 'a', label: <M>{'a ='}</M>, expected: -0.25 },
                  { kind: 'num', key: 'b', label: <M>{'b ='}</M>, expected: 1.5 },
                  { kind: 'num', key: 'c', label: <M>{'c ='}</M>, expected: -2 },
                  { kind: 'num', key: 'd', label: <M>{'D = b^2 - 4ac ='}</M>, expected: 0.25 },
                  { kind: 'num', key: 'x1', label: <>kleinere Lösung <M>{'x_1 ='}</M></>, expected: 2 },
                  { kind: 'num', key: 'x2', label: <>größere Lösung <M>{'x_2 ='}</M></>, expected: 4 },
                ]}
                solution={
                  <>
                    <MB>{'\\begin{aligned} -0{,}25x^2 + 2x &= 0{,}5x + 2 && \\mid -0{,}5x \\mid -2 \\\\ -0{,}25x^2 + 1{,}5x - 2 &= 0 \\end{aligned}'}</MB>
                    <p>
                      Also <M>{'a = -0{,}25'}</M>, <M>{'b = 1{,}5'}</M>, <M>{'c = -2'}</M>.
                    </p>
                    <MB>{'D = 1{,}5^2 - 4 \\cdot (-0{,}25) \\cdot (-2) = 2{,}25 - 2 = 0{,}25'}</MB>
                    <MB>{'x_{1,2} = \\frac{-1{,}5 \\pm \\sqrt{0{,}25}}{2 \\cdot (-0{,}25)} = \\frac{-1{,}5 \\pm 0{,}5}{-0{,}5} \\;\\Rightarrow\\; x_1 = 2,\\; x_2 = 4'}</MB>
                    <p>Die zwei Lösungen entsprechen den zwei gelben Punkten im Bild.</p>
                  </>
                }
                help={
                  <Hilfen
                    steps={[
                      <>Auf welcher Seite soll am Ende die 0 stehen? Was musst du dafür auf beiden Seiten abziehen?</>,
                      <>
                        Ziehe auf beiden Seiten <M>{'0{,}5x'}</M> und <M>{'2'}</M> ab und fasse die x-Terme zusammen: <M>{'2x - 0{,}5x'}</M>.
                      </>,
                      <>
                        Es entsteht <M>{'-0{,}25x^2 + 1{,}5x - 2 = 0'}</M>. Beachte beim Einsetzen in <M>{'D = b^2 - 4ac'}</M>, dass <M>a</M> und <M>c</M> negativ sind.
                      </>,
                    ]}
                  />
                }
              />
              <McCard
                title="Zusammenhang entdecken"
                prompt={
                  <p>
                    Für <M>{'t = 2'}</M> habt ihr <M>{'D = 0{,}25'}</M> berechnet und zwei Lösungen gefunden. Was vermutet ihr: Wie hängt <M>D</M> mit der Anzahl der Schnittpunkte zusammen?
                  </p>
                }
                options={[
                  { text: 'Die Anzahl der Lösungen der Gleichung ist die Anzahl der Schnittpunkte. Und D zeigt, ob es zwei, eine oder keine Lösung gibt.', correct: true, feedback: 'Genau. Eine Lösung der Gleichung ist ein x-Wert, an dem Parabel und Gerade denselben y-Wert haben.' },
                  { text: 'D ist die Anzahl der Schnittpunkte.', feedback: 'D ist eine Zahl unter der Wurzel, zum Beispiel 0,25. Die Anzahl der Schnittpunkte kann nur 0, 1 oder 2 sein.' },
                  { text: 'Schnittpunkte gibt es nur, wenn D eine ganze Zahl ist.', feedback: 'D = 0,25 ist keine ganze Zahl, und trotzdem gibt es zwei Schnittpunkte.' },
                  { text: 'Die Rechnung hat mit den Schnittpunkten nichts zu tun, man muss sie trotzdem im Bild zählen.', feedback: 'Doch: Beim Gleichsetzen suchst du die x-Werte, an denen beide y-Werte gleich sind. Das sind genau die Schnittpunkte.' },
                ]}
              />
            </LabKarte>

            <LabKarte no={3} title="Die Berührhöhe berechnen" level="erweiterung">
              <CheckCard
                title="Wann berührt die Schranke die Bahn nur?"
                prompt={
                  <>
                    <p>
                      Jetzt ist <M>t</M> unbekannt. Setzt <M>{'p(x) = g(x)'}</M> gleich und bringt alles auf eine Seite:
                    </p>
                    <MB>{'-0{,}25x^2 + 1{,}5x - t = 0'}</MB>
                    <p>
                      Berechnet <M>D</M> in Abhängigkeit von <M>t</M> und bestimmt, für welches <M>t</M> es genau einen Schnittpunkt gibt. Gebt dann den Berührpunkt an. Haltet
                      eure Rechenwege schriftlich fest und beschreibt im Heft, was für größere <M>t</M> gilt.
                    </p>
                  </>
                }
                fieldsRow
                fields={[
                  { kind: 'num', key: 'd0', label: <><M>D</M> bei <M>{'t = 0'}</M>:</>, expected: 2.25 },
                  { kind: 'num', key: 't', label: <>Berührhöhe <M>{'t ='}</M></>, expected: T_TOUCH, unit: 'm' },
                  { kind: 'num', key: 'x', label: <>Berührpunkt <M>{'x ='}</M></>, expected: 3 },
                  { kind: 'num', key: 'y', label: <M>{'y ='}</M>, expected: 3.75 },
                ]}
                solution={
                  <>
                    <MB>{'D = 1{,}5^2 - 4 \\cdot (-0{,}25) \\cdot (-t) = 2{,}25 - t'}</MB>
                    <p>
                      Genau ein Schnittpunkt heißt <M>{'D = 0'}</M>, also <M>{'2{,}25 - t = 0'}</M> und damit <M>{'t = 2{,}25'}</M>.
                    </p>
                    <p>Bei D = 0 ist die Wurzel 0, es bleibt eine Lösung:</p>
                    <MB>{'x = \\frac{-1{,}5}{2 \\cdot (-0{,}25)} = 3 \\qquad y = g(3) = 0{,}5 \\cdot 3 + 2{,}25 = 3{,}75'}</MB>
                    <p>
                      Der Berührpunkt ist <M>{'B(3 \\mid 3{,}75)'}</M>. Für <M>{'t > 2{,}25'}</M> ist <M>{'D < 0'}</M>, es gibt keine Lösung und keinen Schnittpunkt.
                    </p>
                  </>
                }
                help={
                  <Hilfen
                    steps={[
                      <>Was bedeutet „genau ein Schnittpunkt“ für die Anzahl der Lösungen der Gleichung, und was für D?</>,
                      <>
                        Setze <M>{'a = -0{,}25'}</M>, <M>{'b = 1{,}5'}</M> und <M>{'c = -t'}</M> in <M>{'D = b^2 - 4ac'}</M> ein. Das Ergebnis enthält noch das <M>t</M>.
                      </>,
                      <>
                        <M>{'D = 2{,}25 - t'}</M>. Setze <M>{'D = 0'}</M> und löse nach <M>t</M> auf. Bei D = 0 gilt <M>{'x = \\frac{-b}{2a}'}</M>.
                      </>,
                    ]}
                  />
                }
              />
            </LabKarte>
          </Phase>

          {/* 4 Austausch */}
          <Phase no={4} title="Vergleicht eure Ergebnisse" social="Plenum" minutes={5}>
            <div className="ls-stop">
              <div className="ls-stop-title">
                <i className="fa-solid fa-hand" aria-hidden="true" /> Stopp: Besprecht eure Ergebnisse mit der Klasse.
              </div>
              <ul>
                <li>Warum gibt es genau eine Höhe, bei der die Lichtschranke die Sprungbahn nur berührt?</li>
                <li>Wie sicher kann man die Berührhöhe am Regler ablesen? Wie genau ist die Rechnung?</li>
                <li>Was sagt das Vorzeichen von D über die Lichtschranke und die Sprungbahn?</li>
              </ul>
            </div>
            <p>
              <strong>Du arbeitest allein?</strong> So haben zwei andere Jugendliche gedacht. Klappe die Wege auf und vergleiche sie mit deinem.
            </p>
            <div className="ls-ways">
              <details className="ls-way">
                <summary>Mila hat mit dem Regler gearbeitet</summary>
                <div className="ls-way-body">
                  <p>„Ich habe den Regler hochgeschoben, bis nur noch ein Punkt übrig war. Das war bei 2,25. Bei 2,5 war kein Punkt mehr da.“</p>
                  <p>
                    <strong>Gut:</strong> Man sieht sofort, wie sich die Anzahl der Punkte ändert. <strong>Aber:</strong> Der Regler springt in 0,25er-Schritten. Ob es bei 2,3 noch
                    zwei Punkte gibt, weiß man nicht genau, und die Punktkoordinaten kann man nur schätzen.
                  </p>
                </div>
              </details>
              <details className="ls-way">
                <summary>Tarek hat gerechnet</summary>
                <div className="ls-way-body">
                  <p>
                    „Ich habe <M>{'p(x) = g(x)'}</M> gleichgesetzt und alles auf eine Seite gebracht. Dann habe ich D mit dem t darin ausgerechnet: <M>{'D = 2{,}25 - t'}</M>. Wenn t
                    kleiner als 2,25 ist, ist D positiv, also gibt es zwei Lösungen. Bei <M>{'t = 2{,}25'}</M> ist D gleich 0, also eine Lösung. Danach ist D negativ, und die
                    Wurzel gibt es nicht.“
                  </p>
                  <p>
                    <strong>Gut:</strong> Man weiß genau, wann sich was ändert, auch ohne Zeichnung. <strong>Aber:</strong> Man muss sauber umformen, sonst stimmt D nicht.
                  </p>
                </div>
              </details>
            </div>
            <p>
              Beide Wege führen zum selben Ergebnis. Der Regler hilft beim Verstehen, die Rechnung liefert dir die genauen Punkte und die Antwort auf die Frage nach der Anzahl, ohne
              dass du zeichnen musst.
            </p>
          </Phase>

          {/* 5 Sichern */}
          <Phase no={5} title="So findest du die Schnittpunkte" social="EA" minutes={8}>
            <Rueckbezug pred={pred} />
            <p>
              Du hast gesehen, dass die Gleichung <M>{'p(x) = g(x)'}</M> zwei, eine oder keine Lösung haben kann. Decke das Beispiel Schritt für Schritt auf.
            </p>
            <Beispiel
              title="Wo löst der Sprung die Lichtschranke aus (t = 2)?"
              aufgabe={
                <p>
                  Sprungbahn <M>{'p(x) = -0{,}25x^2 + 2x'}</M>, Lichtschranke <M>{'g(x) = 0{,}5x + 2'}</M>. Berechne die gemeinsamen Punkte.
                </p>
              }
              steps={[
                {
                  title: 'Gleichsetzen',
                  body: (
                    <>
                      <p>Im Schnittpunkt haben beide Funktionen denselben y-Wert:</p>
                      <MB>{'-0{,}25x^2 + 2x = 0{,}5x + 2'}</MB>
                    </>
                  ),
                },
                {
                  title: 'Auf Null bringen',
                  body: (
                    <>
                      <p>Alles auf eine Seite, rechts steht 0:</p>
                      <MB>{'-0{,}25x^2 + 1{,}5x - 2 = 0 \\qquad (a = -0{,}25,\\; b = 1{,}5,\\; c = -2)'}</MB>
                    </>
                  ),
                },
                {
                  title: 'D berechnen und Anzahl bestimmen',
                  body: (
                    <>
                      <MB>{'D = b^2 - 4ac = 1{,}5^2 - 4 \\cdot (-0{,}25) \\cdot (-2) = 0{,}25'}</MB>
                      <p>
                        <M>{'D > 0'}</M>: Es gibt zwei Lösungen, also zwei Schnittpunkte.
                      </p>
                    </>
                  ),
                },
                {
                  title: 'x-Werte mit der abc-Formel',
                  body: <MB>{'x_{1,2} = \\frac{-1{,}5 \\pm \\sqrt{0{,}25}}{2 \\cdot (-0{,}25)} = \\frac{-1{,}5 \\pm 0{,}5}{-0{,}5} \\;\\Rightarrow\\; x_1 = 2,\\; x_2 = 4'}</MB>,
                },
                {
                  title: 'y-Werte mit der Geradengleichung',
                  body: (
                    <>
                      <p>Setze die x-Werte in die einfachere Gleichung (die Gerade) ein:</p>
                      <MB>{'g(2) = 0{,}5 \\cdot 2 + 2 = 3 \\qquad g(4) = 0{,}5 \\cdot 4 + 2 = 4'}</MB>
                      <p>
                        Probe mit der Parabel: <M>{'p(2) = -1 + 4 = 3'}</M> ✓ und <M>{'p(4) = -4 + 8 = 4'}</M> ✓
                      </p>
                    </>
                  ),
                },
                {
                  title: 'Schnittpunkte angeben und deuten',
                  body: (
                    <>
                      <MB>{'S_1(2 \\mid 3) \\qquad S_2(4 \\mid 4)'}</MB>
                      <p>
                        Bei einem Sensor in 2 m Höhe kreuzt die Sprungbahn die Lichtschranke zweimal: nach 2 m in 3 m Höhe und nach 4 m in 4 m Höhe, genau am höchsten Punkt des
                        Sprungs.
                      </p>
                    </>
                  ),
                },
              ]}
            />
            <ErklaerungAufklappen label="Noch ein Beispiel und das Erklärvideo ansehen" />
            <Merke title="Schnittpunkte von Parabel und Gerade">
              <p>
                Eine Parabel <M>{'p(x) = ax^2 + bx + c'}</M> und eine Gerade <M>{'g(x) = mx + t'}</M> haben <strong>höchstens zwei</strong> gemeinsame Punkte.
              </p>
              <ol>
                <li>
                  Gleichsetzen <M>{'p(x) = g(x)'}</M> und alles auf eine Seite bringen: <M>{'Ax^2 + Bx + C = 0'}</M>.
                </li>
                <li>
                  <M>{'D = B^2 - 4AC'}</M> berechnen. Das sagt dir, wie viele Schnittpunkte es gibt:
                  <ul>
                    <li>
                      <M>{'D > 0'}</M>: zwei Schnittpunkte (Sekante)
                    </li>
                    <li>
                      <M>{'D = 0'}</M>: genau ein Schnittpunkt, die Gerade berührt die Parabel (Tangente)
                    </li>
                    <li>
                      <M>{'D < 0'}</M>: kein Schnittpunkt (Passante)
                    </li>
                  </ul>
                </li>
                <li>Die x-Werte mit der abc-Formel berechnen.</li>
                <li>
                  Die y-Werte berechnen, indem du die x-Werte in die Geradengleichung einsetzt. Schnittpunkte als <M>{'S(x \\mid y)'}</M> angeben.
                </li>
              </ol>
            </Merke>
            <div className="lp-ex bk-panel">
              <CardHead title="Dein Spickzettel (Lernprodukt)" />
              <p>Gestalte eine Karteikarte „Schnittpunkte von Parabel und Gerade“ für dich. Sie darf genau eine Karteikarte füllen. Hake ab, was du schon hast:</p>
              <div className="ls-criteria">
                {[
                  'Drei kleine Skizzen: Gerade schneidet die Parabel zweimal, berührt sie, verfehlt sie',
                  'Die Rechenschritte in der richtigen Reihenfolge: gleichsetzen, auf Null bringen, D, abc-Formel, y-Werte',
                  'Eine Tabelle: D > 0, D = 0, D < 0 mit der Anzahl der Schnittpunkte',
                  'Ein eigenes kurzes Beispiel mit Antwortsatz',
                ].map((c) => (
                  <label key={c}>
                    <input type="checkbox" /> <span>{c}</span>
                  </label>
                ))}
              </div>
            </div>
          </Phase>

          {/* 6 Check */}
          <Phase no={6} title="Check: Hast du es verstanden?" social="EA" minutes={7}>
            <div className="lp-exlist">
              <McCard
                title="Check 1: Was sagt D?"
                level="basis"
                prompt={
                  <p>
                    Beim Gleichsetzen einer Parabel und einer Geraden kommt <M>{'D = -3'}</M> heraus. Was bedeutet das?
                  </p>
                }
                options={[
                  { text: 'Es gibt zwei Schnittpunkte, weil die Zahl 3 vorkommt.', feedback: 'Nicht die Zahl 3 zählt, sondern das Vorzeichen von D.' },
                  { text: 'Es gibt keinen Schnittpunkt.', correct: true, feedback: 'Aus einer negativen Zahl gibt es keine Wurzel, also keine x-Werte und keinen Schnittpunkt.' },
                  { text: 'Man hat sich verrechnet, D darf nie negativ sein.', feedback: 'D darf negativ sein. Dann hat die Gleichung keine Lösung und Parabel und Gerade haben keinen gemeinsamen Punkt.' },
                  { text: 'Es gibt genau einen Schnittpunkt bei x = −3.', feedback: 'D = −3 ist kein x-Wert. Einen Schnittpunkt gäbe es nur bei D = 0.' },
                ]}
              />
              <McCard
                title="Check 2: Wer hat recht?"
                level="standard"
                prompt={
                  <>
                    <p>
                      Parabel <M>{'p(x) = x^2'}</M> und Gerade <M>{'g(x) = 2x - 1'}</M>. Mia sagt: „Eine Gerade und eine Parabel schneiden sich immer zweimal.“ Leon sagt: „Hier ist es
                      nur ein Punkt.“ Rechne nach (Gleichsetzen, D, ggf. abc-Formel) und wähle die richtige Aussage.
                    </p>
                  </>
                }
                options={[
                  { text: 'Mia hat recht: Es gibt zwei Schnittpunkte, x = 1 und x = −1.', feedback: 'Aus x² = 2x − 1 wird x² − 2x + 1 = 0 mit D = 0. Damit gibt es nur eine Lösung. Außerdem gibt es nicht immer zwei Schnittpunkte.' },
                  { text: 'Leon hat recht: Es gibt genau einen Schnittpunkt S(1 | 1).', correct: true, feedback: 'D = (−2)² − 4 · 1 · 1 = 0, also x = 1 und y = g(1) = 1. Die Gerade berührt die Parabel in S(1 | 1).' },
                  { text: 'Beide haben unrecht: Es gibt keinen Schnittpunkt, weil D = 0 ist.', feedback: 'D = 0 heißt nicht „keine Lösung“. Keine Lösung gibt es bei D < 0. Bei D = 0 gibt es genau eine Lösung.' },
                  { text: 'Leon hat recht, der Schnittpunkt ist x = 1.', feedback: 'Der x-Wert stimmt, aber ein Schnittpunkt hat zwei Koordinaten. Setze x = 1 noch in g(x) ein.' },
                ]}
              />
              <CheckCard
                title="Check 3: Jetzt ganz allein"
                level="erweiterung"
                prompt={
                  <>
                    <p>
                      Gegeben sind die Parabel <M>{'p(x) = x^2 + 3'}</M> und die Gerade <M>{'g(x) = 2x + t'}</M>. Für welches <M>t</M> berührt die Gerade die Parabel nur? Wo liegt
                      der Berührpunkt? Halte deinen Rechenweg schriftlich fest.
                    </p>
                  </>
                }
                fieldsRow
                fields={[
                  { kind: 'num', key: 't', label: <M>{'t ='}</M>, expected: 2 },
                  { kind: 'num', key: 'x', label: <M>{'x_B ='}</M>, expected: 1 },
                  { kind: 'num', key: 'y', label: <M>{'y_B ='}</M>, expected: 4 },
                ]}
                solution={
                  <>
                    <MB>{'\\begin{aligned} x^2 + 3 &= 2x + t && \\mid -2x \\mid -t \\\\ x^2 - 2x + (3 - t) &= 0 \\end{aligned}'}</MB>
                    <MB>{'D = (-2)^2 - 4 \\cdot 1 \\cdot (3 - t) = 4 - 12 + 4t = 4t - 8'}</MB>
                    <p>
                      Genau ein Schnittpunkt heißt <M>{'D = 0'}</M>: <M>{'4t - 8 = 0'}</M>, also <M>{'t = 2'}</M>.
                    </p>
                    <MB>{'x_B = \\frac{-b}{2a} = \\frac{2}{2} = 1 \\qquad y_B = g(1) = 2 \\cdot 1 + 2 = 4'}</MB>
                    <p>
                      Probe mit der Parabel: <M>{'p(1) = 1 + 3 = 4'}</M> ✓. Der Berührpunkt ist <M>{'B(1 \\mid 4)'}</M>.
                    </p>
                  </>
                }
                help={
                  <Hilfen
                    steps={[
                      <>Was muss für D gelten, damit es genau einen Schnittpunkt gibt?</>,
                      <>
                        Setze gleich und bringe alles auf eine Seite. Dann ist <M>{'a = 1'}</M>, <M>{'b = -2'}</M> und <M>{'c = 3 - t'}</M>.
                      </>,
                      <>
                        <M>{'D = 4 - 4(3 - t) = 4t - 8'}</M>. Setze D = 0. Den x-Wert findest du bei D = 0 mit <M>{'x = \\frac{-b}{2a}'}</M>.
                      </>,
                    ]}
                  />
                }
              />
            </div>
          </Phase>

          <nav className="lp-nav" aria-label="Weiter">
            <button type="button" className="bk-btn" onClick={onBack}>
              <i className="fa-solid fa-arrow-left" aria-hidden="true" /> Zurück zur Auswahl
            </button>
            <button type="button" className="bk-btn bk-btn-primary" onClick={onPractice}>
              Weiter üben: Schnittpunkte berechnen (Einfach) <i className="fa-solid fa-arrow-right" aria-hidden="true" />
            </button>
          </nav>
        </div>
      </TaskShell>
    </ErklaerungCtx.Provider>
  )
}

/** Rückbezug auf die Vermutung aus Phase 2 */
function Rueckbezug({ pred }: { pred: Prediction }) {
  if (!pred.saved || !pred.choice) {
    return (
      <div className="ls-back">
        <p>Du hast in Abschnitt 2 noch keine Vermutung festgehalten. Hole das kurz nach, dann siehst du hier, ob du richtig lagst.</p>
      </div>
    )
  }
  const diff = Math.abs(pred.tGrenze - T_TOUCH)
  return (
    <div className="ls-back">
      <p>
        <strong>Du hattest vermutet:</strong> {CHOICE_TEXT[pred.choice]} (bei <M>{'t = 1'}</M>) und die Schranke wird bis <M>t</M> ≈ {fmt(pred.tGrenze, 2)} m ausgelöst.
      </p>
      <p>
        {pred.choice === 'zwei' ? (
          <>Das stimmt: Bei t = 1 m gibt es zwei gemeinsame Punkte. Gut gesehen!</>
        ) : (
          <>Bei t = 1 m gibt es zwei gemeinsame Punkte, die Sprungbahn kreuzt die Lichtschranke also zweimal. Hier hat das Bild dich in die Irre geführt.</>
        )}
      </p>
      <p>
        Die größte Sensorhöhe mit Auslösung ist <strong>t = 2,25 m</strong>, dort berührt die Lichtschranke die Bahn genau einmal.{' '}
        {diff < 1e-9 ? 'Deine Schätzung war genau richtig!' : `Deine Schätzung lag ${fmt(diff, 2)} m daneben.`} Die Rechnung hat gezeigt, warum: Dort ist <M>{'D = 0'}</M>.
      </p>
    </div>
  )
}

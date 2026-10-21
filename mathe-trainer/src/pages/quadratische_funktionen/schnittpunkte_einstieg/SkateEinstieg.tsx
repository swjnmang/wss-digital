import { useId, useState, type ChangeEvent, type ReactNode } from 'react'
import TaskShell from '../../../components/layout/TaskShell'
import CheckedNumberInput from '../../../components/CheckedNumberInput'
import { Beispiel, M, MB, Merke, QuerTabelle, Vorgehen, fmt } from '../../daten_und_zufall/lernpfad/kit'
import { Arbeitsweise, CardHead, CheckCard, ErklaerungAufklappen, ErklaerungCtx, Hilfen, LevelTag, McCard, tx } from '../../lineare_funktionen/lernsituation_kit/kit'
import { Etappe, Fortschritt, Teil } from '../../lineare_funktionen/lernsituation_kit/phasen'
import '../../daten_und_zufall/lernpfad/lernpfad.css'
import './lab.css'

// Einstiegs-Lernsituation „Löst der Sprung die Lichtschranke aus?“ zu Schnittpunkten von Parabel und Gerade.
// Format Experimentierlabor, Look Laborprotokoll, Lernprodukt analog (Spickzettel).
// Instruktionsreihenfolge: Problem zuerst, die Infokarte zum Gleichsetzen kommt nach dem ersten Versuch. Die SuS können
// quadratische Gleichungen mit der Mitternachtsformel lösen; neu ist das Gleichsetzen von Parabel und Gerade und dass die
// Zahl unter der Wurzel die Anzahl der Schnittpunkte bestimmt. Es wird immer vollständig mit der Mitternachtsformel gerechnet.
// Phasen: Aktivieren → Situation & Festlegung → Experimentieren → Austausch → Sichern → Check.
// Die Festlegung bleibt nur im Seitenzustand (kein Speichern).
// Wird als Modus „Lernsituation“ auf der Seite „Schnittpunkte von Parabel und Gerade“ angezeigt; der Infoteil
// (Erklärung mit Erklärvideo) kommt von dort, damit er nur an einer Stelle gepflegt wird.

/* ── Situation ───────────────────────────────────────────────────────────── */

// Seitenansicht des Skateparks, 1 LE = 1 m. Absprung von der 3 m hohen Rampe bei (0|3), Landung bei (6|0),
// höchster Punkt (2|4). Der Sensor der Lichtschranke steht am linken Pfosten in Höhe t, der Strahl fällt pro Meter um 0,5 m.
const p = (x: number) => -0.25 * x * x + x + 3
const g = (t: number) => (x: number) => -0.5 * x + t
/** Zahl unter der Wurzel in der Mitternachtsformel beim Gleichsetzen von Sprungbahn und Lichtschranke, also −0,25x² + 1,5x + (3 − t) = 0 */
const wurzelterm = (t: number) => 5.25 - t
const T_TOUCH = 5.25
const T_MIN = 3
const T_MAX = 6.5

/** gemeinsame Punkte von Sprungbahn und Lichtschranke */
function schnitt(t: number): { x: number; y: number }[] {
  const d = wurzelterm(t)
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

const S = { w: 640, h: 330, l: 44, r: 14, t: 12, b: 34, xMin: -1, xMax: 9, yMin: -0.6, yMax: 7 }
const bx = (x: number) => S.l + ((x - S.xMin) / (S.xMax - S.xMin)) * (S.w - S.l - S.r)
const by = (y: number) => S.h - S.b - ((y - S.yMin) / (S.yMax - S.yMin)) * (S.h - S.t - S.b)

const PARABEL = Array.from({ length: 61 }, (_, i) => i / 10)
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
        {Array.from({ length: 9 }, (_, i) => i).map((v) => (
          <g key={`x${v}`}>
            <line x1={bx(v)} x2={bx(v)} y1={by(0)} y2={by(S.yMax)} stroke="var(--grid)" />
            <text x={bx(v)} y={by(0) + 24} textAnchor="middle" fontSize="19" fill="var(--ink-muted)">
              {v}
            </text>
          </g>
        ))}
        {[1, 2, 3, 4, 5, 6].map((v) => (
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
        {/* Absprungrampe */}
        <rect x={bx(-1)} y={by(3)} width={bx(0) - bx(-1)} height={by(0) - by(3)} fill="var(--surface-sunken)" stroke="var(--ink)" strokeWidth="2" />
        <text x={(bx(-1) + bx(0)) / 2 + 2} y={by(1.5)} textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--ink)">
          Rampe
        </text>
        {/* Sensor am Pfosten */}
        <line x1={bx(0)} y1={by(3)} x2={bx(0)} y2={by(t)} stroke="var(--ink)" strokeWidth="3" />
        <rect x={bx(0) - 9} y={by(t) - 12} width="18" height="24" rx="3" fill="var(--ink)" />
        <text x={bx(0) + 14} y={by(t) - 14} fontSize="15" fontWeight="700" fill="var(--ink)">
          Sensor
        </text>
        <text x={bx(4.7)} y={by(p(4.7)) - 14} fontSize="24" fontWeight="700" fill="var(--primary)">
          p
        </text>
        {gt(6.6) > 0.3 && (
          <text x={bx(6.6)} y={by(gt(6.6)) - 12} fontSize="24" fontWeight="700" fill="var(--hint)">
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
  const [t, setT] = useState(4)
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
          min={T_MIN}
          max={T_MAX}
          step={0.25}
          value={t}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setT(Number(e.target.value))}
        />
      </div>
      <div className="ls-readout">
        <div className="ls-readout-box ls-readout-b">
          <strong>Lichtschranke:</strong> <M>{`y = -0{,}5x + ${tx(t)}`}</M>
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

const VERSUCHE = [3, 4, 5, 5.25, 6]

/* ── Seite ───────────────────────────────────────────────────────────────── */

export default function SkateEinstieg({ erklaerung, onBack, onPractice }: { erklaerung: ReactNode; onBack: () => void; onPractice: () => void }) {
  const [pred, setPred] = useState<Prediction>({ choice: null, tGrenze: 4.5, saved: false })

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
          <Arbeitsweise />

          {/* 1 Aktivieren */}
          <Fortschritt prefix="skate" />

          <Etappe
            prefix="skate"
            art="start"
            social="EA"
            minutes={5}
            was={<>Kurze Aufgaben allein lösen.</>}
            wozu={<>Du frischst auf, was du gleich zum Lösen des Problems brauchst.</>}
          >
            <p>Diese vier kurzen Aufgaben brauchst du gleich. Löse sie allein.</p>
            <div className="lp-exlist">
              <CheckCard
                title="a) Punktprobe bei einer Parabel"
                prompt={
                  <p>
                    Liegt der Punkt <M>{'P(2 \\mid 4)'}</M> auf der Parabel <M>{'y = -0{,}25x^2 + x + 3'}</M>?
                  </p>
                }
                fields={[{ kind: 'select', key: 'p', label: 'Antwort', options: ['Ja', 'Nein'], expected: 0 }]}
                solution={
                  <>
                    <p>x-Wert einsetzen und mit dem y-Wert vergleichen:</p>
                    <MB>{'x = 2: \\quad y = -0{,}25 \\cdot 2^2 + 2 + 3 = -1 + 2 + 3 = 4 \\;\\checkmark'}</MB>
                    <p>Der y-Wert stimmt, also liegt P auf der Parabel.</p>
                  </>
                }
              />
              <CheckCard
                title="b) y-Wert einer Geraden berechnen"
                prompt={
                  <p>
                    Eine Gerade hat die Gleichung <M>{'y = -0{,}5x + 5'}</M>. Berechne den y-Wert an der Stelle <M>{'x = 4'}</M>.
                  </p>
                }
                fields={[{ kind: 'num', key: 'y', label: <M>{'y ='}</M>, expected: 3 }]}
                solution={<MB>{'x = 4: \\quad y = -0{,}5 \\cdot 4 + 5 = -2 + 5 = 3'}</MB>}
              />
              <CheckCard
                title="c) Quadratische Gleichung lösen"
                prompt={
                  <p>
                    Löse <M>{'x^2 - 6x + 8 = 0'}</M> mit der Mitternachtsformel.
                  </p>
                }
                fieldsRow
                fields={[
                  { kind: 'num', key: 'x1', label: <>kleinere Lösung <M>{'x_1 ='}</M></>, expected: 2 },
                  { kind: 'num', key: 'x2', label: <>größere Lösung <M>{'x_2 ='}</M></>, expected: 4 },
                ]}
                solution={
                  <>
                    <p>
                      Es ist <M>{'a = 1'}</M>, <M>{'b = -6'}</M> und <M>{'c = 8'}</M>.
                    </p>
                    <MB>{'x_{1,2} = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a} = \\frac{6 \\pm \\sqrt{36 - 32}}{2} = \\frac{6 \\pm 2}{2}'}</MB>
                    <MB>{'x_1 = 2 \\qquad x_2 = 4'}</MB>
                  </>
                }
              />
              <McCard
                title="d) Wenn die Wurzel nicht geht"
                prompt={
                  <p>
                    Du löst <M>{'x^2 + 2x + 5 = 0'}</M> mit der Mitternachtsformel. Unter der Wurzel steht <M>{'2^2 - 4 \\cdot 1 \\cdot 5'}</M>. Was ergibt sich für die Gleichung?
                  </p>
                }
                options={[
                  { text: 'Keine Lösung, denn unter der Wurzel steht −16.', correct: true, feedback: 'Aus einer negativen Zahl kann man im Reellen keine Wurzel ziehen, also gibt es keine Lösung.' },
                  { text: 'Zwei Lösungen, denn man rechnet mit √16 = 4.', feedback: 'Unter der Wurzel steht 4 − 20 = −16, nicht +16. Das Vorzeichen ist entscheidend.' },
                  { text: 'Eine Lösung x = −1.', feedback: 'Nur wenn unter der Wurzel genau 0 steht, bleibt eine Lösung übrig. Hier steht −16.' },
                  { text: 'Zwei Lösungen, eine positive und eine negative.', feedback: 'Das ± in der Formel liefert nur zwei Lösungen, wenn die Wurzel ausgerechnet werden kann. Bei −16 geht das nicht.' },
                ]}
              />
            </div>
          </Etappe>

          {/* 2 Situation & Festlegung */}
          <Etappe
            prefix="skate"
            art="problem"
            social="EA"
            minutes={5}
            was={<>Die Situation lesen und deine Vermutung festhalten. Noch nicht rechnen.</>}
            wozu={<>Du weißt genau, welche Frage du in Phase 3 beantwortest.</>}
          >
            <Teil title="Die Situation: Trick-Contest im Skatepark">
              <p>
                Im Skatepark wird ein Trick-Contest veranstaltet. Eine Lichtschranke misst, ob ein Sprung eine bestimmte Linie kreuzt. Das Bild zeigt den Park von der Seite
                (1 Kästchen = 1 m). Der Sprung startet von einer 3 m hohen Rampe bei <M>{'x = 0'}</M> und landet bei <M>{'x = 6'}</M>. Die Wertung zählt jeden Punkt, an dem die Sprungbahn die Linie der
                Lichtschranke kreuzt.
              </p>
              <SkateBild t={4} punkte={false} />
              <div className="ls-flyers">
                <div className="ls-flyer ls-flyer-a">
                  <div className="ls-flyer-name">Sprungbahn</div>
                  <div className="ls-flyer-price">
                    Parabel{' '}
                    <strong>
                      <M>{'y = -0{,}25x^2 + x + 3'}</M>
                    </strong>
                  </div>
                </div>
                <div className="ls-flyer ls-flyer-b">
                  <div className="ls-flyer-name">Lichtschranke</div>
                  <div className="ls-flyer-price">
                    Gerade{' '}
                    <strong>
                      <M>{'y = -0{,}5x + t'}</M>
                    </strong>
                  </div>
                  <div className="ls-flyer-sub">
                    <M>t</M> ist die Höhe des Sensors am linken Pfosten. Im Bild ist <M>{'t = 4'}</M> m.
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
                      <i className="fa-solid fa-lock" aria-hidden="true" /> Gespeichert: <strong>{CHOICE_TEXT[pred.choice]}</strong> (bei <M>{'t = 4'}</M>). Deine Schätzung: Bis{' '}
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
                    <div className="ls-options" role="radiogroup" aria-label="Vermutung für t = 4">
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
                        min={T_MIN}
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
            </Teil>
          </Etappe>

          {/* 3 Experimentieren */}
          <Etappe
            prefix="skate"
            art="loesen"
            minutes={21}
            was={<>Zu zweit im Labor untersuchen, wie oft die Sprungbahn die Lichtschranke kreuzt. Danach vergleicht ihr eure Ergebnisse.</>}
            wozu={<>So berechnest du die Schnittpunkte von Parabel und Gerade und erkennst, wie viele es gibt.</>}
          >
            <Teil title="Ab ins Labor: Findet es heraus" social="PA" minutes={17}>
              <p>
                <strong>Auftrag:</strong> Führt zu zweit die Versuche aus und haltet eure Beobachtungen im Laborprotokoll fest. Jede Person tippt auf dem eigenen Gerät, ihr
                besprecht jede Antwort kurz miteinander. Wie man Schnittpunkte genau berechnet, steht in der Infokarte nach Versuch 1.
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
                  <p className="lp-hint">Bei t = 5,25 m sieht man im Bild nur einen Punkt. Schaut auch knapp darüber und darunter: 5 m und 5,5 m.</p>
                  <Hilfen
                    steps={[
                      <>Stellt den Regler auf den Wert aus der Tabelle und zählt nur die gelben Punkte, in denen die Sprungbahn und die gestrichelte Linie wirklich zusammentreffen.</>,
                      <>Geht die Tabelle von links nach rechts durch. Schiebt den Regler dazu jeweils genau auf die Höhe in der Spalte, zum Beispiel erst auf 0, dann auf 1.</>,
                      <>
                        Bei <M>{'t = 3'}</M> startet die Linie im Absprungpunkt <M>{'(0 \\mid 3)'}</M> und endet im Landepunkt <M>{'(6 \\mid 0)'}</M>. Das sind zwei Punkte, also tragt ihr eine 2 ein.
                      </>,
                    ]}
                  />
                </div>
                <McCard
                  title="Beobachtung festhalten"
                  prompt={<p>Was passiert, wenn der Sensor immer höher gestellt wird? Wähle die Beobachtung, die zu eurer Tabelle passt.</p>}
                  options={[
                    { text: 'Erst zwei gemeinsame Punkte, dann genau ein Punkt, dann kein Punkt.', correct: true, feedback: 'Zwischen „zwei“ und „keiner“ liegt genau eine Höhe, bei der die Gerade die Parabel nur berührt.' },
                    { text: 'Erst zwei gemeinsame Punkte, dann plötzlich kein Punkt mehr.', feedback: 'Schaut noch einmal bei t = 5,25 m nach: Dort gibt es genau einen Punkt, die Lichtschranke berührt die Sprungbahn nur.' },
                    { text: 'Es gibt immer zwei gemeinsame Punkte, egal wie hoch der Sensor steht.', feedback: 'Bei t = 6 m ist die Lichtschranke über der ganzen Sprungbahn, dort gibt es keinen gemeinsamen Punkt.' },
                    { text: 'Erst kein Punkt, dann ein Punkt, dann zwei Punkte.', feedback: 'Die Reihenfolge ist umgekehrt: Je höher der Sensor, desto weniger Punkte.' },
                  ]}
                />
              </LabKarte>

              <div className="lp-ex bk-panel">
                <CardHead title="Infokarte: So berechnest du die Schnittpunkte von Parabel und Gerade" />
                <p>
                  Zeichnen und Ablesen ist ungenau. Mit dem <strong>Gleichsetzungsverfahren</strong> und der Mitternachtsformel rechnest du die Schnittpunkte genau aus. Der Gedanke
                  dahinter: Im Schnittpunkt haben die Parabel und die Gerade <strong>denselben x-Wert und denselben y-Wert</strong>. Also dürfen die beiden Funktionsterme gleichgesetzt werden.
                </p>
                <Vorgehen
                  title="So gehst du vor"
                  steps={[
                    <>
                      <strong>Gleichsetzen:</strong> Den Term der Parabel und den Term der Geraden gleichsetzen.
                    </>,
                    <>
                      <strong>Auf Null bringen:</strong> Alles auf eine Seite rechnen, bis rechts 0 steht. Gleichartige Terme zusammenfassen. Es entsteht <M>{'ax^2 + bx + c = 0'}</M>.
                    </>,
                    <>
                      <strong>Mitternachtsformel:</strong> <M>a</M>, <M>b</M> und <M>c</M> ablesen und einsetzen: <M>{'x_{1,2} = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}'}</M>. Das liefert die x-Werte der
                      Schnittpunkte.
                    </>,
                    <>
                      <strong>y-Werte:</strong> Jeden x-Wert in die Geradengleichung einsetzen (das ist einfacher als in die Parabel). Zur Probe die Parabel nutzen.
                    </>,
                    <>
                      <strong>Antwort:</strong> Schnittpunkte als <M>{'S_1(x_1 \\mid y_1)'}</M> und <M>{'S_2(x_2 \\mid y_2)'}</M> angeben und in der Situation deuten.
                    </>,
                  ]}
                />
                <Beispiel
                  title="Parabel und Gerade mit anderen Zahlen"
                  aufgabe={
                    <p>
                      Berechne die Schnittpunkte der Parabel <M>{'y = x^2 - 2x - 3'}</M> und der Geraden <M>{'y = x + 1'}</M>.
                    </p>
                  }
                  steps={[
                    {
                      title: 'Gleichsetzen',
                      body: <MB>{'x^2 - 2x - 3 = x + 1'}</MB>,
                    },
                    {
                      title: 'Auf Null bringen',
                      body: (
                        <>
                          <MB>{'\\begin{aligned} x^2 - 2x - 3 &= x + 1 && \\mid -x \\mid -1 \\\\ x^2 - 3x - 4 &= 0 \\end{aligned}'}</MB>
                          <p>
                            Jetzt kannst du ablesen: <M>{'a = 1'}</M>, <M>{'b = -3'}</M>, <M>{'c = -4'}</M>.
                          </p>
                        </>
                      ),
                    },
                    {
                      title: 'Mitternachtsformel',
                      body: <MB>{'x_{1,2} = \\frac{3 \\pm \\sqrt{(-3)^2 - 4 \\cdot 1 \\cdot (-4)}}{2 \\cdot 1} = \\frac{3 \\pm \\sqrt{25}}{2} = \\frac{3 \\pm 5}{2} \\;\\Rightarrow\\; x_1 = 4,\\; x_2 = -1'}</MB>,
                    },
                    {
                      title: 'y-Werte mit der Geraden',
                      body: (
                        <>
                          <MB>{'x = 4: \\; y = 4 + 1 = 5 \\qquad x = -1: \\; y = -1 + 1 = 0'}</MB>
                          <p>
                            Probe mit der Parabel: <M>{'x = 4: \\; y = 16 - 8 - 3 = 5'}</M> ✓ und <M>{'x = -1: \\; y = 1 + 2 - 3 = 0'}</M> ✓
                          </p>
                        </>
                      ),
                    },
                    {
                      title: 'Antwort',
                      body: <MB>{'S_1(4 \\mid 5) \\qquad S_2(-1 \\mid 0)'}</MB>,
                    },
                  ]}
                />
                <ErklaerungAufklappen label="Noch ein Beispiel und das Erklärvideo ansehen" />
              </div>

              <LabKarte no={2} title="Nachrechnen für t = 5" level="standard">
                <CheckCard
                  title="Rechnerisch prüfen"
                  prompt={
                    <>
                      <p>
                        Die Tabelle zeigt für <M>{'t = 5'}</M> zwei Punkte. Berechnet sie jetzt genau und geht dabei Schritt für Schritt vor wie im Beispiel der Infokarte:
                      </p>
                      <p>
                        Sprungbahn <M>{'y = -0{,}25x^2 + x + 3'}</M>, Lichtschranke <M>{'y = -0{,}5x + 5'}</M>.
                      </p>
                      <ol className="lp-hint">
                        <li>Gleichsetzen und alles auf eine Seite bringen. Lest dann <M>a</M>, <M>b</M> und <M>c</M> ab.</li>
                        <li>x-Werte mit der Mitternachtsformel berechnen.</li>
                        <li>y-Werte mit der Geradengleichung berechnen.</li>
                      </ol>
                    </>
                  }
                  fieldsRow
                  fields={[
                    { kind: 'num', key: 'a', label: <M>{'a ='}</M>, expected: -0.25 },
                    { kind: 'num', key: 'b', label: <M>{'b ='}</M>, expected: 1.5 },
                    { kind: 'num', key: 'c', label: <M>{'c ='}</M>, expected: -2 },
                    { kind: 'num', key: 'x1', label: <>kleinere Lösung <M>{'x_1 ='}</M></>, expected: 2 },
                    { kind: 'num', key: 'x2', label: <>größere Lösung <M>{'x_2 ='}</M></>, expected: 4 },
                    { kind: 'num', key: 'y1', label: <><M>{'y_1 ='}</M></>, expected: 4 },
                    { kind: 'num', key: 'y2', label: <><M>{'y_2 ='}</M></>, expected: 3 },
                  ]}
                  solution={
                    <>
                      <p>Gleichsetzen und auf Null bringen:</p>
                      <MB>{'\\begin{aligned} -0{,}25x^2 + x + 3 &= -0{,}5x + 5 && \\mid +0{,}5x \\mid -5 \\\\ -0{,}25x^2 + 1{,}5x - 2 &= 0 \\end{aligned}'}</MB>
                      <p>
                        Also <M>{'a = -0{,}25'}</M>, <M>{'b = 1{,}5'}</M>, <M>{'c = -2'}</M>. Mitternachtsformel:
                      </p>
                      <MB>{'x_{1,2} = \\frac{-1{,}5 \\pm \\sqrt{1{,}5^2 - 4 \\cdot (-0{,}25) \\cdot (-2)}}{2 \\cdot (-0{,}25)} = \\frac{-1{,}5 \\pm \\sqrt{0{,}25}}{-0{,}5} = \\frac{-1{,}5 \\pm 0{,}5}{-0{,}5}'}</MB>
                      <MB>{'x_1 = 2 \\qquad x_2 = 4'}</MB>
                      <MB>{'y_1 = -0{,}5 \\cdot 2 + 5 = 4 \\qquad y_2 = -0{,}5 \\cdot 4 + 5 = 3'}</MB>
                      <p>
                        Die Schnittpunkte sind <M>{'S_1(2 \\mid 4)'}</M> und <M>{'S_2(4 \\mid 3)'}</M>. Das passt zu den zwei gelben Punkten im Bild.
                      </p>
                    </>
                  }
                  help={
                    <Hilfen
                      steps={[
                        <>
                          Schlagt in der Infokarte das Beispiel auf. Dort steht <M>{'x^2 - 2x - 3 = x + 1'}</M> in Schritt 1 und <M>{'x^2 - 3x - 4 = 0'}</M> in Schritt 2. Genauso macht ihr aus{' '}
                          <M>{'-0{,}25x^2 + x + 3 = -0{,}5x + 5'}</M> eine Gleichung mit 0 auf der rechten Seite.
                        </>,
                        <>
                          Addiert auf beiden Seiten <M>{'0{,}5x'}</M> und zieht <M>{'5'}</M> ab. Danach fasst ihr die x-Terme zusammen (<M>{'x + 0{,}5x'}</M>) und die Zahlen (<M>{'3 - 5'}</M>). Die Zahl vor <M>{'x^2'}</M> ist <M>a</M>, die Zahl
                          vor <M>x</M> ist <M>b</M> und die Zahl ohne x ist <M>c</M>.
                        </>,
                        <>
                          Es entsteht <M>{'-0{,}25x^2 + 1{,}5x - 2 = 0'}</M>. Setzt in die Formel ein, mit Klammern bei negativen Zahlen:{' '}
                          <M>{'x_{1,2} = \\frac{-1{,}5 \\pm \\sqrt{1{,}5^2 - 4 \\cdot (-0{,}25) \\cdot (-2)}}{2 \\cdot (-0{,}25)}'}</M>
                        </>,
                      ]}
                    />
                  }
                />
                <McCard
                  title="Zusammenhang entdecken"
                  prompt={
                    <p>
                      In eurer Rechnung stand unter der Wurzel die Zahl <M>{'0{,}25'}</M>, und ihr habt zwei Lösungen bekommen. Bei <M>{'t = 6'}</M> gibt es im Bild keinen Punkt, bei{' '}
                      <M>{'t = 5{,}25'}</M> genau einen. Was entscheidet in der Mitternachtsformel darüber, ob es zwei, eine oder keine Lösung gibt?
                    </p>
                  }
                  options={[
                    { text: 'Die Zahl unter der Wurzel: Ist sie positiv, gibt es zwei Lösungen, ist sie 0, eine Lösung, ist sie negativ, keine Lösung.', correct: true, feedback: 'Genau. Bei √0 fällt das ± weg, und bei einer negativen Zahl lässt sich die Wurzel nicht ziehen. Jede Lösung ist ein Schnittpunkt.' },
                    { text: 'Der Wert von a: Ist a negativ, gibt es immer zwei Lösungen.', feedback: 'a ist in allen Versuchen negativ (−0,25) und trotzdem ändert sich die Anzahl der Punkte. Es kommt auf die Zahl unter der Wurzel an.' },
                    { text: 'Der Nenner 2a: Nur wenn er ganzzahlig ist, gibt es Lösungen.', feedback: 'Der Nenner hier ist −0,5 und es gibt trotzdem zwei Lösungen. Entscheidend ist, was unter der Wurzel steht.' },
                    { text: 'Nichts: Eine Gleichung hat immer genau zwei Lösungen, man muss nur richtig rechnen.', feedback: 'Bei einer negativen Zahl unter der Wurzel gibt es keine Lösung, bei 0 nur eine.' },
                  ]}
                />
              </LabKarte>

              <LabKarte no={3} title="Und bei t = 5,25?" level="erweiterung">
                <CheckCard
                  title="Genau ein Punkt: nachrechnen"
                  prompt={
                    <>
                      <p>
                        Im Regler habt ihr gesehen: Bei <M>{'t = 5{,}25'}</M> gibt es nur einen gemeinsamen Punkt. Rechnet das nach. Geht genauso vor wie in Versuch 2, mit
                      </p>
                      <p>
                        <M>{'y = -0{,}25x^2 + x + 3'}</M> und <M>{'y = -0{,}5x + 5{,}25'}</M>.
                      </p>
                      <p>
                        Achtet darauf, was in der Mitternachtsformel unter der Wurzel herauskommt. Beschreibt im Heft, warum es nur eine
                        Lösung gibt.
                      </p>
                    </>
                  }
                  fieldsRow
                  fields={[
                    { kind: 'num', key: 'u', label: <>Zahl unter der Wurzel:</>, expected: 0 },
                    { kind: 'num', key: 'x', label: <>Berührpunkt <M>{'x ='}</M></>, expected: 3 },
                    { kind: 'num', key: 'y', label: <M>{'y ='}</M>, expected: 3.75 },
                  ]}
                  solution={
                    <>
                      <MB>{'\\begin{aligned} -0{,}25x^2 + x + 3 &= -0{,}5x + 5{,}25 && \\mid +0{,}5x \\mid -5{,}25 \\\\ -0{,}25x^2 + 1{,}5x - 2{,}25 &= 0 \\end{aligned}'}</MB>
                      <p>
                        Also <M>{'a = -0{,}25'}</M>, <M>{'b = 1{,}5'}</M>, <M>{'c = -2{,}25'}</M>. Mitternachtsformel:
                      </p>
                      <MB>{'x = \\frac{-1{,}5 \\pm \\sqrt{1{,}5^2 - 4 \\cdot (-0{,}25) \\cdot (-2{,}25)}}{2 \\cdot (-0{,}25)} = \\frac{-1{,}5 \\pm \\sqrt{2{,}25 - 2{,}25}}{-0{,}5} = \\frac{-1{,}5 \\pm 0}{-0{,}5} = 3'}</MB>
                      <p>Unter der Wurzel steht 0. Das ± ändert nichts, es bleibt eine einzige Lösung.</p>
                      <MB>{'y = -0{,}5 \\cdot 3 + 5{,}25 = 3{,}75'}</MB>
                      <p>
                        Die Lichtschranke berührt die Sprungbahn nur im Punkt <M>{'B(3 \\mid 3{,}75)'}</M>.
                      </p>
                    </>
                  }
                  help={
                    <Hilfen
                      steps={[
                        <>Schlagt in der Infokarte die fünf Schritte nach. Der erste Schritt ist wieder das Gleichsetzen der beiden Terme.</>,
                        <>
                          Addiert auf beiden Seiten <M>{'0{,}5x'}</M> und zieht <M>{'5{,}25'}</M> ab. Danach fasst ihr zusammen (<M>{'x + 0{,}5x'}</M> und <M>{'3 - 5{,}25'}</M>) und lest <M>a</M>,{' '}
                          <M>b</M> und <M>c</M> ab.
                        </>,
                        <>
                          Es entsteht <M>{'-0{,}25x^2 + 1{,}5x - 2{,}25 = 0'}</M>. Setzt in die Formel ein, mit Klammern bei negativen Zahlen:{' '}
                          <M>{'x = \\frac{-1{,}5 \\pm \\sqrt{1{,}5^2 - 4 \\cdot (-0{,}25) \\cdot (-2{,}25)}}{2 \\cdot (-0{,}25)}'}</M>. Rechnet zuerst die Zahl unter der Wurzel aus.
                        </>,
                      ]}
                    />
                  }
                />
              </LabKarte>
            </Teil>


          {/* 4 Austausch */}
            <Teil title="Vergleicht eure Ergebnisse" social="Plenum" minutes={4}>
              <div className="ls-stop">
                <div className="ls-stop-title">
                  <i className="fa-solid fa-hand" aria-hidden="true" /> Stopp: Besprecht eure Ergebnisse mit der Klasse.
                </div>
                <ul>
                  <li>Warum gibt es genau eine Höhe, bei der die Lichtschranke die Sprungbahn nur berührt?</li>
                  <li>Wie sicher kann man die Berührhöhe am Regler ablesen? Wie genau ist die Rechnung?</li>
                  <li>Was passiert in der Mitternachtsformel, wenn die Zahl unter der Wurzel kleiner wird und schließlich negativ?</li>
                </ul>
              </div>
              <p>
                <strong>Du arbeitest allein?</strong> So haben zwei andere Jugendliche gedacht. Klappe die Wege auf und vergleiche sie mit deinem.
              </p>
              <div className="ls-ways">
                <details className="ls-way">
                  <summary>Mila hat mit dem Regler gearbeitet</summary>
                  <div className="ls-way-body">
                    <p>„Ich habe den Regler hochgeschoben, bis nur noch ein Punkt übrig war. Das war bei 5,25. Bei 5,5 war kein Punkt mehr da.“</p>
                    <p>
                      <strong>Gut:</strong> Man sieht sofort, wie sich die Anzahl der Punkte ändert. <strong>Aber:</strong> Der Regler springt in 0,25er-Schritten. Ob es bei 5,3 noch
                      zwei Punkte gibt, weiß man nicht genau, und die Punktkoordinaten kann man nur schätzen.
                    </p>
                  </div>
                </details>
                <details className="ls-way">
                  <summary>Tarek hat gerechnet</summary>
                  <div className="ls-way-body">
                    <p>
                      „Ich habe die Terme von Sprungbahn und Lichtschranke gleichgesetzt und mit der Mitternachtsformel gerechnet, einmal für <M>{'t = 5'}</M>, einmal für <M>{'t = 5{,}25'}</M> und einmal für{' '}
                      <M>{'t = 6'}</M>. Unter der Wurzel kam <M>{'0{,}25'}</M>, dann <M>{'0'}</M> und dann <M>{'-0{,}75'}</M> heraus. Bei 0,25 gab es zwei Lösungen, bei 0 nur eine, und bei
                      −0,75 geht die Wurzel nicht, also keine Lösung.“
                    </p>
                    <p>
                      <strong>Gut:</strong> Man weiß genau, was bei einer bestimmten Höhe passiert, auch ohne Zeichnung. <strong>Aber:</strong> Man muss sauber umformen und einsetzen, sonst
                      stimmt die Zahl unter der Wurzel nicht.
                    </p>
                  </div>
                </details>
              </div>
              <p>
                Beide Wege führen zum selben Ergebnis. Der Regler hilft beim Verstehen, die Rechnung liefert dir die genauen Punkte und die Antwort auf die Frage nach der Anzahl, ohne
                dass du zeichnen musst.
              </p>
            </Teil>
          </Etappe>

          {/* 5 Sichern */}
          <Etappe
            prefix="skate"
            art="sichern"
            social="EA"
            minutes={14}
            was={<>Das Wichtigste in deinem Heft festhalten und dann allein prüfen, ob du es kannst.</>}
            wozu={<>Dein Hefteintrag hilft dir bei allen Aufgaben dieser Art. Der Check zeigt dir, wo du noch unsicher bist.</>}
          >
            <Teil title="Das hältst du fest" social="EA" minutes={8}>
              <Rueckbezug pred={pred} />
              <Beispiel
                title="Wo löst der Sprung die Lichtschranke aus (t = 5)?"
                aufgabe={
                  <p>
                    Sprungbahn <M>{'y = -0{,}25x^2 + x + 3'}</M>, Lichtschranke <M>{'y = -0{,}5x + 5'}</M>. Berechne die gemeinsamen Punkte.
                  </p>
                }
                steps={[
                  {
                    title: 'Gleichsetzen',
                    body: (
                      <>
                        <p>Im Schnittpunkt haben beide Funktionen denselben y-Wert:</p>
                        <MB>{'-0{,}25x^2 + x + 3 = -0{,}5x + 5'}</MB>
                      </>
                    ),
                  },
                  {
                    title: 'Auf Null bringen',
                    body: (
                      <>
                        <p>
                          Auf beiden Seiten <M>{'+0{,}5x'}</M> und <M>{'-5'}</M>, dann steht rechts 0:
                        </p>
                        <MB>{'-0{,}25x^2 + 1{,}5x - 2 = 0 \\qquad (a = -0{,}25,\\; b = 1{,}5,\\; c = -2)'}</MB>
                      </>
                    ),
                  },
                  {
                    title: 'Mitternachtsformel',
                    body: (
                      <>
                        <MB>{'x_{1,2} = \\frac{-1{,}5 \\pm \\sqrt{1{,}5^2 - 4 \\cdot (-0{,}25) \\cdot (-2)}}{2 \\cdot (-0{,}25)} = \\frac{-1{,}5 \\pm \\sqrt{0{,}25}}{-0{,}5} = \\frac{-1{,}5 \\pm 0{,}5}{-0{,}5}'}</MB>
                        <p>
                          Unter der Wurzel steht eine positive Zahl. Das ± liefert zwei verschiedene Lösungen: <M>{'x_1 = 2'}</M> und <M>{'x_2 = 4'}</M>.
                        </p>
                      </>
                    ),
                  },
                  {
                    title: 'y-Werte mit der Geradengleichung',
                    body: (
                      <>
                        <MB>{'x = 2: \\; y = -0{,}5 \\cdot 2 + 5 = 4 \\qquad x = 4: \\; y = -0{,}5 \\cdot 4 + 5 = 3'}</MB>
                        <p>
                          Probe mit der Parabel: <M>{'x = 2: \\; y = -1 + 2 + 3 = 4'}</M> ✓ und <M>{'x = 4: \\; y = -4 + 4 + 3 = 3'}</M> ✓
                        </p>
                      </>
                    ),
                  },
                  {
                    title: 'Schnittpunkte angeben und deuten',
                    body: (
                      <>
                        <MB>{'S_1(2 \\mid 4) \\qquad S_2(4 \\mid 3)'}</MB>
                        <p>
                          Bei einem Sensor in 5 m Höhe kreuzt die Sprungbahn die Lichtschranke zweimal: nach 2 m in 4 m Höhe (genau am höchsten Punkt des Sprungs) und nach 4 m in 3 m
                          Höhe.
                        </p>
                      </>
                    ),
                  },
                ]}
              />
              <Merke title="Schnittpunkte von Parabel und Gerade">
                <p>
                  Eine Parabel <M>{'y = ax^2 + bx + c'}</M> und eine Gerade <M>{'y = mx + t'}</M> haben <strong>höchstens zwei</strong> gemeinsame Punkte.
                </p>
                <ol>
                  <li>
                    Die Terme gleichsetzen <M>{'ax^2 + bx + c = mx + t'}</M> und alles auf eine Seite bringen: <M>{'Ax^2 + Bx + C = 0'}</M>.
                  </li>
                  <li>
                    Mitternachtsformel anwenden: <M>{'x_{1,2} = \\frac{-B \\pm \\sqrt{B^2 - 4AC}}{2A}'}</M>. Die Zahl unter der Wurzel entscheidet über die Anzahl der Schnittpunkte:
                    <ul>
                      <li>positiv: zwei Lösungen, also zwei Schnittpunkte</li>
                      <li>gleich 0: eine Lösung, also genau ein Schnittpunkt (die Gerade berührt die Parabel)</li>
                      <li>negativ: keine Lösung, also kein Schnittpunkt</li>
                    </ul>
                  </li>
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
                    'Die Rechenschritte in der richtigen Reihenfolge: gleichsetzen, auf Null bringen, Mitternachtsformel, y-Werte',
                    'Eine Tabelle: Zahl unter der Wurzel positiv, 0, negativ mit der Anzahl der Schnittpunkte',
                    'Ein eigenes kurzes Beispiel mit Antwortsatz',
                  ].map((c) => (
                    <label key={c}>
                      <input type="checkbox" /> <span>{c}</span>
                    </label>
                  ))}
                </div>
              </div>
            </Teil>


          {/* 6 Check */}
            <Teil title="Check: Hast du es verstanden?" social="EA" minutes={6}>
              <div className="lp-exlist">
                <McCard
                  title="Check 1: Was bedeutet das Ergebnis?"
                  level="basis"
                  prompt={
                    <p>
                      Du setzt eine Parabel und eine Gerade gleich und bringst alles auf eine Seite. In der Mitternachtsformel steht unter der Wurzel <M>{'-3'}</M>. Was bedeutet das?
                    </p>
                  }
                  options={[
                    { text: 'Es gibt zwei Schnittpunkte, weil die Zahl 3 vorkommt.', feedback: 'Nicht die Zahl 3 zählt, sondern das Vorzeichen der Zahl unter der Wurzel.' },
                    { text: 'Es gibt keinen Schnittpunkt.', correct: true, feedback: 'Aus einer negativen Zahl gibt es keine Wurzel, also keine x-Werte und keinen Schnittpunkt.' },
                    { text: 'Man hat sich verrechnet, unter der Wurzel darf nie etwas Negatives stehen.', feedback: 'Das kann vorkommen. Dann hat die Gleichung keine Lösung, und Parabel und Gerade haben keinen gemeinsamen Punkt.' },
                    { text: 'Es gibt genau einen Schnittpunkt bei x = −3.', feedback: 'Die −3 unter der Wurzel ist kein x-Wert. Einen Schnittpunkt gäbe es nur, wenn dort 0 stünde.' },
                  ]}
                />
                <McCard
                  title="Check 2: Wer hat recht?"
                  rechnen
                  level="standard"
                  prompt={
                    <>
                      <p>
                        Parabel <M>{'y = x^2'}</M> und Gerade <M>{'y = 2x - 1'}</M>. Mia sagt: „Eine Gerade und eine Parabel schneiden sich immer zweimal.“ Leon sagt: „Hier ist es
                        nur ein Punkt.“ Rechne nach (Gleichsetzen, Mitternachtsformel, y-Wert) und wähle die richtige Aussage.
                      </p>
                    </>
                  }
                  options={[
                    { text: 'Mia hat recht: Es gibt zwei Schnittpunkte, x = 1 und x = −1.', feedback: 'Aus x² = 2x − 1 wird x² − 2x + 1 = 0. In der Formel steht unter der Wurzel 4 − 4 = 0, also nur eine Lösung. Außerdem gibt es nicht immer zwei Schnittpunkte.' },
                    { text: 'Leon hat recht: Es gibt genau einen Schnittpunkt S(1 | 1).', correct: true, feedback: 'x = (2 ± √(4 − 4)) / 2 = 1, und y = 2 · 1 − 1 = 1. Die Gerade berührt die Parabel in S(1 | 1).' },
                    { text: 'Beide haben unrecht: Es gibt keinen Schnittpunkt, weil unter der Wurzel 0 steht.', feedback: 'Wurzel aus 0 ist 0, das geht. Dann bleibt genau eine Lösung. Keine Lösung gibt es nur bei einer negativen Zahl unter der Wurzel.' },
                    { text: 'Leon hat recht, der Schnittpunkt ist x = 1.', feedback: 'Der x-Wert stimmt, aber ein Schnittpunkt hat zwei Koordinaten. Setze x = 1 noch in die Geradengleichung ein.' },
                  ]}
                />
                <CheckCard
                  title="Check 3: Jetzt ganz allein"
                  level="erweiterung"
                  prompt={
                    <>
                      <p>
                        Berechne die Schnittpunkte der Parabel <M>{'y = 0{,}5x^2 - 2x + 1'}</M> und der Geraden <M>{'y = 0{,}5x - 2'}</M>. Rechne mit der Mitternachtsformel.
                      </p>
                    </>
                  }
                  fieldsRow
                  fields={[
                    { kind: 'num', key: 'x1', label: <>kleinere Lösung <M>{'x_1 ='}</M></>, expected: 2 },
                    { kind: 'num', key: 'x2', label: <>größere Lösung <M>{'x_2 ='}</M></>, expected: 3 },
                    { kind: 'num', key: 'y1', label: <M>{'y_1 ='}</M>, expected: -1 },
                    { kind: 'num', key: 'y2', label: <M>{'y_2 ='}</M>, expected: -0.5 },
                  ]}
                  solution={
                    <>
                      <MB>{'\\begin{aligned} 0{,}5x^2 - 2x + 1 &= 0{,}5x - 2 && \\mid -0{,}5x \\mid +2 \\\\ 0{,}5x^2 - 2{,}5x + 3 &= 0 \\end{aligned}'}</MB>
                      <p>
                        Also <M>{'a = 0{,}5'}</M>, <M>{'b = -2{,}5'}</M>, <M>{'c = 3'}</M>. Mitternachtsformel:
                      </p>
                      <MB>{'x_{1,2} = \\frac{2{,}5 \\pm \\sqrt{(-2{,}5)^2 - 4 \\cdot 0{,}5 \\cdot 3}}{2 \\cdot 0{,}5} = \\frac{2{,}5 \\pm \\sqrt{0{,}25}}{1} = 2{,}5 \\pm 0{,}5'}</MB>
                      <MB>{'x_1 = 2 \\qquad x_2 = 3'}</MB>
                      <MB>{'y_1 = 0{,}5 \\cdot 2 - 2 = -1 \\qquad y_2 = 0{,}5 \\cdot 3 - 2 = -0{,}5'}</MB>
                      <p>
                        Probe mit der Parabel: <M>{'x = 2: \\; y = 2 - 4 + 1 = -1'}</M> ✓ und <M>{'x = 3: \\; y = 4{,}5 - 6 + 1 = -0{,}5'}</M> ✓. Die Schnittpunkte sind <M>{'S_1(2 \\mid -1)'}</M> und{' '}
                        <M>{'S_2(3 \\mid -0{,}5)'}</M>.
                      </p>
                    </>
                  }
                  help={
                    <Hilfen
                      steps={[
                        <>Wie in der Infokarte: Zuerst gleichsetzen und alles auf eine Seite bringen, sodass rechts 0 steht.</>,
                        <>
                          Ziehe auf beiden Seiten <M>{'0{,}5x'}</M> ab und addiere <M>{'2'}</M>. Fasse dann zusammen (<M>{'-2x - 0{,}5x'}</M> und <M>{'1 + 2'}</M>). Lies <M>a</M>, <M>b</M> und{' '}
                          <M>c</M> ab.
                        </>,
                        <>
                          Es entsteht <M>{'0{,}5x^2 - 2{,}5x + 3 = 0'}</M>. Setze in die Formel ein: <M>{'x = \\frac{2{,}5 \\pm \\sqrt{(-2{,}5)^2 - 4 \\cdot 0{,}5 \\cdot 3}}{2 \\cdot 0{,}5}'}</M>. Die
                          y-Werte rechnest du mit der Geraden aus.
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
        <p>Du hast in Phase 2 noch keine Vermutung festgehalten. Hole das kurz nach, dann siehst du hier, ob du richtig lagst.</p>
      </div>
    )
  }
  const diff = Math.abs(pred.tGrenze - T_TOUCH)
  return (
    <div className="ls-back">
      <p>
        <strong>Du hattest vermutet:</strong> {CHOICE_TEXT[pred.choice]} (bei <M>{'t = 4'}</M>) und die Schranke wird bis <M>t</M> ≈ {fmt(pred.tGrenze, 2)} m ausgelöst.
      </p>
      <p>
        {pred.choice === 'zwei' ? (
          <>Das stimmt: Bei t = 4 m gibt es zwei gemeinsame Punkte. Gut gesehen!</>
        ) : (
          <>Bei t = 4 m gibt es zwei gemeinsame Punkte, die Sprungbahn kreuzt die Lichtschranke also zweimal. Hier hat das Bild dich in die Irre geführt.</>
        )}
      </p>
      <p>
        Die größte Sensorhöhe mit Auslösung ist <strong>t = 5,25 m</strong>, dort berührt die Lichtschranke die Bahn genau einmal.{' '}
        {diff < 1e-9 ? 'Deine Schätzung war genau richtig!' : `Deine Schätzung lag ${fmt(diff, 2)} m daneben.`} Die Rechnung hat gezeigt, warum: Dort steht unter der Wurzel genau 0.
      </p>
    </div>
  )
}

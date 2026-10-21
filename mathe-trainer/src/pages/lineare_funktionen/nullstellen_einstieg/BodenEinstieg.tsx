import { useId, useState, type ChangeEvent, type ReactNode } from 'react'
import TaskShell from '../../../components/layout/TaskShell'
import CheckedNumberInput from '../../../components/CheckedNumberInput'
import { Beispiel, M, MB, Merke, QuerTabelle, fmt } from '../../daten_und_zufall/lernpfad/kit'
import {
  Arbeitsweise, CardHead, CheckCard, ErklaerungAufklappen, ErklaerungCtx, HeftHinweis, Hilfen, McCard, Phase, TrackedCheck, TrackedMc, tx,
} from '../lernsituation_kit/kit'

// Einstiegs-Lernsituation „Welche Gerade erreicht den Boden zuerst?“ zu den Nullstellen linearer Funktionen.
// Rein grafische Deutung: Die x-Achse ist der „Boden“, die Nullstelle ist der Punkt, an dem eine Gerade ihn berührt.
// Phasen: Aktivieren → Situation & Vorhersage → Erkunden (Tabelle, Graph) → Austausch → Verfahren → Üben → Check.
// Die Vorhersage bleibt nur im Seitenzustand (kein Speichern).
// Wird als Modus „Lernsituation“ auf der Seite „Nullstellen berechnen“ angezeigt; der Infoteil (Erklärung mit Video)
// kommt von dort.

/* ── Situation ───────────────────────────────────────────────────────────── */

// Drei Geraden starten an der y-Achse und fallen nach rechts. Die steilste (f) startet am höchsten und landet zuletzt.
const f = (x: number) => -2 * x + 8 // Nullstelle 4
const g = (x: number) => -0.5 * x + 1.5 // Nullstelle 3
const h = (x: number) => -x + 3.75 // Nullstelle 3,75
const NF = 4
const NG = 3
const NH = 3.75

type Line = 'f' | 'g' | 'h'
type Prediction = { first: Line | null; x: number; saved: boolean }

const FIRST_TEXT: Record<Line, string> = {
  f: 'Gerade f erreicht den Boden zuerst',
  g: 'Gerade g erreicht den Boden zuerst',
  h: 'Gerade h erreicht den Boden zuerst',
}

/* ── Sachbild: drei Geraden über dem Boden ───────────────────────────────── */

const S = { w: 640, h: 430, l: 46, r: 16, t: 14, b: 38, xMin: -0.5, xMax: 5.5, yMin: -2.5, yMax: 8.5 }
const bx = (x: number) => S.l + ((x - S.xMin) / (S.xMax - S.xMin)) * (S.w - S.l - S.r)
const by = (y: number) => S.h - S.b - ((y - S.yMin) / (S.yMax - S.yMin)) * (S.h - S.t - S.b)

const LINES: { id: Line; fn: (x: number) => number; to: number; color: string; dash?: string }[] = [
  { id: 'f', fn: f, to: 5.25, color: 'var(--primary)' },
  { id: 'g', fn: g, to: 5.5, color: 'var(--hint)', dash: '10 5' },
  { id: 'h', fn: h, to: 5.5, color: 'var(--correct-ink)', dash: '3 5' },
]

/** Koordinatensystem mit den drei Geraden; marker: senkrechte Messlinie bei x */
function BodenBild({ marker }: { marker?: number }) {
  return (
    <div className="bk-graph ls-graph">
      <svg viewBox={`0 0 ${S.w} ${S.h}`} role="img" aria-label="Koordinatensystem mit drei fallenden Geraden f, g und h, die die x-Achse (den Boden) schneiden">
        <rect x={bx(S.xMin)} y={by(0)} width={bx(S.xMax) - bx(S.xMin)} height={by(S.yMin) - by(0)} fill="var(--surface-sunken)" />
        {Array.from({ length: 7 }, (_, i) => i).map((v) => (
          <g key={`x${v}`}>
            <line x1={bx(v)} x2={bx(v)} y1={by(S.yMin)} y2={by(S.yMax)} stroke="var(--grid)" />
            <text x={bx(v)} y={by(S.yMin) + 26} textAnchor="middle" fontSize="19" fill="var(--ink-muted)">
              {v}
            </text>
          </g>
        ))}
        {[-2, 0, 2, 4, 6, 8].map((v) => (
          <g key={`y${v}`}>
            <line x1={bx(S.xMin)} x2={bx(S.xMax)} y1={by(v)} y2={by(v)} stroke="var(--grid)" />
            <text x={bx(0) - 8} y={by(v) + 6} textAnchor="end" fontSize="19" fill="var(--ink-muted)">
              {v}
            </text>
          </g>
        ))}
        <line x1={bx(0)} x2={bx(0)} y1={by(S.yMin)} y2={by(S.yMax)} stroke="var(--ink)" strokeWidth="1.5" />
        <line x1={bx(S.xMin)} x2={bx(S.xMax)} y1={by(0)} y2={by(0)} stroke="var(--ink)" strokeWidth="4" />
        <text x={bx(S.xMax) - 4} y={by(0) - 8} textAnchor="end" fontSize="18" fontWeight="700" fill="var(--ink)">
          Boden (x-Achse)
        </text>
        <text x={bx(S.xMax) - 4} y={by(0) + 24} textAnchor="end" fontSize="16" fill="var(--ink-muted)">
          unter dem Boden
        </text>
        {LINES.map((l) => (
          <g key={l.id}>
            <line x1={bx(0)} y1={by(l.fn(0))} x2={bx(l.to)} y2={by(l.fn(l.to))} stroke={l.color} strokeWidth="3.5" strokeDasharray={l.dash} strokeLinecap="round" />
            <text x={bx(0.18)} y={by(l.fn(0.18)) - 10} fontSize="24" fontWeight="700" fill={l.color}>
              {l.id}
            </text>
          </g>
        ))}
        {marker !== undefined && (
          <>
            <line x1={bx(marker)} x2={bx(marker)} y1={by(S.yMin)} y2={by(S.yMax)} stroke="var(--ink-muted)" strokeDasharray="4 4" />
            {LINES.map((l) => (
              <circle key={l.id} cx={bx(marker)} cy={by(l.fn(marker))} r="7" fill={l.color} stroke="var(--surface)" strokeWidth="2" />
            ))}
          </>
        )}
      </svg>
    </div>
  )
}

/** Weg 2: Messlinie verschieben und die y-Werte ablesen */
function GraphKarte() {
  const sliderId = useId()
  const [x, setX] = useState(1)
  const zero = [f, g, h].some((fn) => Math.abs(fn(x)) < 1e-9)
  const names = LINES.filter((l) => Math.abs(l.fn(x)) < 1e-9).map((l) => l.id)
  return (
    <div className="lp-ex bk-panel">
      <CardHead title="Weg 2: Graph" level="standard" />
      <div className="lp-ex-prompt">
        <p>
          Verschiebt die Messlinie. Die Punkte zeigen, wie hoch jede Gerade an dieser Stelle über dem Boden liegt. Wo berührt jede Gerade den Boden, also wo ist ihr{' '}
          <M>y</M>-Wert genau 0?
        </p>
      </div>
      <BodenBild marker={x} />
      <div className="ls-slider">
        <label htmlFor={sliderId}>
          Messlinie bei <M>x</M> = <span className="ls-slider-value">{fmt(x, 2)}</span>
        </label>
        <input id={sliderId} type="range" min={0} max={5.5} step={0.25} value={x} onChange={(e: ChangeEvent<HTMLInputElement>) => setX(Math.round(Number(e.target.value) * 100) / 100)} />
      </div>
      <div className="ls-readout ls-readout-3">
        {LINES.map((l) => (
          <div key={l.id} className={`ls-readout-box ls-readout-${l.id}`}>
            <M>{`${l.id}(${tx(x, 2)}) = ${tx(l.fn(x), 3)}`}</M>
            <div className="ls-readout-note">{l.fn(x) > 1e-9 ? 'über dem Boden' : l.fn(x) < -1e-9 ? 'unter dem Boden' : 'auf dem Boden'}</div>
          </div>
        ))}
      </div>
      {zero && (
        <div className="ls-equal" role="status">
          <i className="fa-solid fa-flag-checkered" aria-hidden="true" /> {names.join(' und ')} berührt hier den Boden: y = 0!
        </div>
      )}
      <p className="lp-hint">Im Heft: Zeichnet die drei Geraden in ein Koordinatensystem (1 cm für 1 Einheit) und markiert, wo jede die x-Achse berührt.</p>
      <Hilfen
        steps={[
          <>Schiebt die Messlinie nach rechts: Was passiert mit den y-Werten der drei Geraden?</>,
          <>Sucht für jede Gerade die Stelle, an der der Punkt genau auf dem Boden liegt. Das erkennt ihr am Wert 0 und am Hinweis „auf dem Boden“.</>,
          <>
            Bei <M>x = 3</M> berührt eine Gerade den Boden, bei <M>x = 4</M> eine andere. Wo ist die dritte? Probiert die Stelle dazwischen aus: Was passiert bei{' '}
            <M>{'x = 3{,}75'}</M>?
          </>,
        ]}
      />
    </div>
  )
}

/* ── Seite ───────────────────────────────────────────────────────────────── */

const TABLE_X = [0, 2, 3, 4, 5]

function cellInput(expected: number, key: number) {
  return (
    <span key={key}>
      <CheckedNumberInput expected={expected} tolerance={0.005} className="bk-input lp-input lp-input-sm" />
    </span>
  )
}

export default function BodenEinstieg({ erklaerung, onBack, onPractice }: { erklaerung: ReactNode; onBack: () => void; onPractice: () => void }) {
  const [pred, setPred] = useState<Prediction>({ first: null, x: 3.5, saved: false })

  return (
    <ErklaerungCtx.Provider value={erklaerung}>
    <TaskShell title="Nullstellen berechnen" subtitle="Lernsituation: Welche Gerade erreicht den Boden zuerst?" width="wide">
      <div className="lp">
        <div>
          <button type="button" className="bk-btn bk-btn-sm bk-btn-ghost" onClick={onBack}>
            <i className="fa-solid fa-arrow-left" aria-hidden="true" /> Zurück zur Auswahl
          </button>
        </div>
        <div className="lp-goal">
          <i className="fa-solid fa-bullseye" aria-hidden="true" />
          <div>
            <strong>Das lernst du hier:</strong> Du findest heraus, wo eine Gerade die x-Achse schneidet: erst mit Tabelle und Graph, dann genau durch Rechnen. Diese Stelle heißt
            Nullstelle.
          </div>
        </div>
        <Arbeitsweise />

        {/* 1 Aktivieren */}
        <Phase no={1} title="Fit für den Start" social="EA" minutes={5}>
          <p>Diese vier kurzen Aufgaben brauchst du gleich. Löse sie allein.</p>
          <div className="lp-exlist">
            <CheckCard
              title="a) y-Wert berechnen"
              prompt={
                <p>
                  Berechne den y-Wert der Geraden <M>{'g(x) = -0{,}5x + 1{,}5'}</M> an der Stelle <M>{'x = 2'}</M>.
                </p>
              }
              fields={[{ kind: 'num', key: 'y', label: <M>{'g(2) ='}</M>, expected: 0.5 }]}
              solution={<MB>{'g(2) = -0{,}5 \\cdot 2 + 1{,}5 = -1 + 1{,}5 = 0{,}5'}</MB>}
            />
            <CheckCard
              title="b) Gleichung lösen"
              prompt={<p>Löse die gegebene Gleichung nach <M>x</M> auf.</p>}
              lead={<M>{'2x + 6 = 14 \\qquad \\Rightarrow'}</M>}
              fields={[{ kind: 'num', key: 'x', label: <M>{'x ='}</M>, expected: 4 }]}
              solution={<MB>{'\\begin{aligned} 2x + 6 &= 14 && \\mid -6 \\\\ 2x &= 8 && \\mid :2 \\\\ x &= 4 \\end{aligned}'}</MB>}
            />
            <McCard
              title="c) Punkt auf dem Boden"
              prompt={
                <p>
                  Ein Punkt hat die y-Koordinate 0, zum Beispiel <M>{'P(5 \\mid 0)'}</M>. Wo liegt er? Wähle die passende Aussage.
                </p>
              }
              options={[
                { text: 'Auf der x-Achse.', correct: true, feedback: 'Alle Punkte mit y = 0 liegen auf der x-Achse, also auf dem Boden.' },
                { text: 'Auf der y-Achse.', feedback: 'Auf der y-Achse liegen Punkte mit x = 0, nicht mit y = 0.' },
                { text: 'Im Ursprung.', feedback: 'Der Ursprung ist O(0 | 0). Hier ist aber x = 5, der Punkt liegt rechts davon.' },
                { text: 'Unterhalb der x-Achse.', feedback: 'Unterhalb der x-Achse ist y negativ. Bei y = 0 liegt der Punkt genau auf der Achse.' },
              ]}
            />
            <CheckCard
              title="d) Gleichung lösen"
              prompt={<p>Löse die gegebene Gleichung nach <M>x</M> auf.</p>}
              lead={<M>{'-2x + 10 = 4 \\qquad \\Rightarrow'}</M>}
              fields={[{ kind: 'num', key: 'x', label: <M>{'x ='}</M>, expected: 3 }]}
              solution={<MB>{'\\begin{aligned} -2x + 10 &= 4 && \\mid -10 \\\\ -2x &= -6 && \\mid :(-2) \\\\ x &= 3 \\end{aligned}'}</MB>}
            />
          </div>
        </Phase>

        {/* 2 Situation & Vorhersage */}
        <Phase no={2} title="Die Situation: Drei Geraden im Sinkflug" social="EA" minutes={5}>
          <p>
            Im Koordinatensystem starten drei Geraden an der y-Achse und fallen nach rechts. Die x-Achse ist der <strong>Boden</strong>. Eine Gerade „landet“, sobald sie
            den Boden berührt.
          </p>
          <BodenBild />
          <div className="ls-flyers ls-flyers-3">
            <div className="ls-flyer ls-flyer-a">
              <div className="ls-flyer-name">Gerade f</div>
              <div className="ls-flyer-price">
                <strong>
                  <M>{'f(x) = -2x + 8'}</M>
                </strong>
              </div>
            </div>
            <div className="ls-flyer ls-flyer-b">
              <div className="ls-flyer-name">Gerade g</div>
              <div className="ls-flyer-price">
                <strong>
                  <M>{'g(x) = -0{,}5x + 1{,}5'}</M>
                </strong>
              </div>
            </div>
            <div className="ls-flyer ls-flyer-c">
              <div className="ls-flyer-name">Gerade h</div>
              <div className="ls-flyer-price">
                <strong>
                  <M>{'h(x) = -x + 3{,}75'}</M>
                </strong>
              </div>
            </div>
          </div>
          <div className="ls-question">
            <i className="fa-solid fa-circle-question" aria-hidden="true" />
            <span>Welche der drei Geraden erreicht den Boden zuerst?</span>
          </div>

          <div className="lp-ex bk-panel" data-no-autocheck>
            <CardHead title="Deine Vermutung" />
            {pred.saved && pred.first ? (
              <>
                <div className="ls-saved" role="status">
                  <i className="fa-solid fa-lock" aria-hidden="true" /> Gespeichert: <strong>{FIRST_TEXT[pred.first]}</strong>. Gerade h schätzt du bei{' '}
                  <strong>x ≈ {fmt(pred.x, 2)}</strong>. Am Ende schauen wir, ob du recht hattest.
                </div>
                <div>
                  <button type="button" className="bk-btn bk-btn-sm bk-btn-ghost" onClick={() => setPred({ ...pred, saved: false })}>
                    Vermutung ändern
                  </button>
                </div>
              </>
            ) : (
              <>
                <p>Rechne noch nicht! Schau nur auf das Bild, entscheide spontan und schreibe einen Satz als Begründung in dein Heft.</p>
                <div className="ls-options" role="radiogroup" aria-label="Vermutung">
                  {(['f', 'g', 'h'] as const).map((c) => (
                    <label key={c} className="bk-choice ls-option">
                      <input type="radio" name="ls-pred" checked={pred.first === c} onChange={() => setPred({ ...pred, first: c })} />
                      <span>{FIRST_TEXT[c]}</span>
                    </label>
                  ))}
                </div>
                <div className="ls-slider">
                  <label htmlFor="ls-pred-x">
                    Gerade h berührt den Boden bei x ≈ <span className="ls-slider-value">{fmt(pred.x, 2)}</span>
                  </label>
                  <input
                    id="ls-pred-x"
                    type="range"
                    min={2}
                    max={5}
                    step={0.25}
                    value={pred.x}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setPred({ ...pred, x: Math.round(Number(e.target.value) * 100) / 100 })}
                  />
                </div>
                <div>
                  <button type="button" className="bk-btn bk-btn-primary" disabled={!pred.first} onClick={() => setPred({ ...pred, saved: true })}>
                    <i className="fa-solid fa-lock" aria-hidden="true" /> Vermutung festhalten
                  </button>
                </div>
              </>
            )}
          </div>
        </Phase>

        {/* 3 Erkunden */}
        <Phase no={3} title="Findet es heraus" social="PA" minutes={12}>
          <p>
            <strong>Auftrag:</strong> Findet zu zweit heraus, wo jede Gerade den Boden berührt und in welcher Reihenfolge sie landen. Ihr habt zwei Wege: Tabelle und Graph.
            Fangt mit einem an, wer fertig ist, probiert auch den anderen. Jede Person tippt auf dem eigenen Gerät.
          </p>

          <div className="lp-ex bk-panel" data-no-autocheck>
            <CardHead title="Weg 1: Tabelle" level="basis" />
            <div className="lp-ex-prompt">
              <p>Wie hoch liegt jede Gerade an diesen Stellen über dem Boden? Füllt die Tabelle aus. Die Felder färben sich von selbst grün oder rot. Negative Werte heißen: unter dem Boden.</p>
            </div>
            <HeftHinweis><strong>Im Heft:</strong> Rechne die Tabellenwerte mit Rechenweg in deinem Heft aus. Trage dann nur die Ergebnisse ein.</HeftHinweis>
            <QuerTabelle
              rows={[
                { head: 'x', cells: TABLE_X.map((x) => <strong key={x}>{x}</strong>) },
                { head: 'f(x)', cells: TABLE_X.map((x) => (x === 0 ? <span key={x}>{f(0)}</span> : cellInput(f(x), x))) },
                { head: 'g(x)', cells: TABLE_X.map((x) => (x === 0 ? <span key={x}>{fmt(g(0), 1)}</span> : cellInput(g(x), x))) },
                { head: 'h(x)', cells: TABLE_X.map((x) => (x === 0 ? <span key={x}>{fmt(h(0), 2)}</span> : cellInput(h(x), x))) },
              ]}
            />
            <p className="lp-hint">Sucht in jeder Zeile die Stelle, an der der Wert 0 wird oder von positiv zu negativ wechselt. Was fällt euch bei h auf?</p>
            <Hilfen
              steps={[
                <>Setzt jeden x-Wert in die Gleichung ein. Was ist f(2), was ist g(2)?</>,
                <>
                  Pro Schritt nach rechts fällt f um 2, g um 0,5 und h um 1. Ihr könnt also auch vom vorigen Feld aus weiterrechnen. Achtung: Die Schritte in der Tabelle sind
                  nicht immer 1 breit.
                </>,
                <>
                  Für <M>x = 2</M>: <M>{'f(2) = -2 \\cdot 2 + 8 = 4'}</M> und <M>{'g(2) = -0{,}5 \\cdot 2 + 1{,}5 = 0{,}5'}</M>.
                </>,
              ]}
            />
          </div>

          <GraphKarte />

          <CheckCard
            title="Euer Ergebnis"
            rechnen={false}
            prompt={<p>Egal, welchen Weg ihr genommen habt: Tragt euer Ergebnis ein und haltet eure Rechenwege oder Ablesungen schriftlich fest.</p>}
            fields={[
              { kind: 'num', key: 'xg', label: <>Gerade g berührt den Boden bei <M>x</M> =</>, expected: NG },
              { kind: 'num', key: 'xf', label: <>Gerade f berührt den Boden bei <M>x</M> =</>, expected: NF },
              { kind: 'num', key: 'xh', label: <>Gerade h berührt den Boden bei <M>x</M> ≈</>, expected: NH, tol: 0.3 },
              { kind: 'select', key: 'first', label: 'Welche Gerade erreicht den Boden zuerst?', options: ['Gerade f', 'Gerade g', 'Gerade h'], expected: 1 },
              { kind: 'select', key: 'last', label: 'Welche Gerade erreicht den Boden zuletzt?', options: ['Gerade f', 'Gerade g', 'Gerade h'], expected: 0 },
            ]}
          />

          <CheckCard
            title="Zusatzfrage: Über und unter dem Boden"
            rechnen={false}
            level="erweiterung"
            prompt={
              <>
                <p>
                  Ihr seid schon fertig? Schaut auf das Vorzeichen der y-Werte: Liegt eine Gerade über dem Boden, ist ihr y-Wert positiv, unter dem Boden negativ.
                </p>
                <p>Haltet im Heft fest: Was gilt links einer Nullstelle, was rechts davon? Warum ist das bei allen drei Geraden so?</p>
                <BodenBild />
              </>
            }
            fields={[
              { kind: 'select', key: 'm', label: <>Welche Geraden liegen bei <M>{'x = 3{,}5'}</M> noch über dem Boden?</>, options: ['nur f', 'f und h', 'g und h', 'alle drei'], expected: 1 },
              { kind: 'num', key: 'ab', label: 'Alle drei liegen unter dem Boden ab der ganzen Zahl x =', expected: 5, tol: 0 },
            ]}
            help={
              <Hilfen
                steps={[
                  <>Eine Gerade liegt über dem Boden, solange ihre Nullstelle noch weiter rechts liegt. Schaut deshalb auf die Nullstellen 3, 3,75 und 4.</>,
                  <>
                    Bei <M>{'x = 3{,}5'}</M> haben g (Nullstelle 3) schon den Boden erreicht, f (4) und h (3,75) noch nicht.
                  </>,
                  <>
                    Alle drei sind unter dem Boden, wenn <M>x</M> größer ist als die größte Nullstelle, also größer als 4. Welche ganze Zahl ist das erste Mal größer?
                  </>,
                ]}
              />
            }
            solution={
              <>
                <p>
                  Nullstellen: g bei 3, h bei 3,75, f bei 4. Eine Gerade liegt <strong>links</strong> ihrer Nullstelle über dem Boden (y positiv) und <strong>rechts</strong> davon unter
                  dem Boden (y negativ), weil alle drei fallen.
                </p>
                <p>
                  Bei <M>{'x = 3{,}5'}</M> liegen f und h noch über dem Boden, g schon darunter. Alle drei liegen unter dem Boden, sobald <M>x</M> größer als 4 ist. Die erste ganze Zahl
                  dafür ist 5.
                </p>
              </>
            }
          />
        </Phase>

        {/* 4 Austausch */}
        <Phase no={4} title="Vergleicht eure Wege" social="Plenum" minutes={5}>
          <div className="ls-stop">
            <div className="ls-stop-title">
              <i className="fa-solid fa-hand" aria-hidden="true" /> Stopp: Besprecht eure Ergebnisse mit der Klasse.
            </div>
            <ul>
              <li>Woran erkennt ihr in der Tabelle und im Graphen, dass eine Gerade den Boden berührt?</li>
              <li>Gerade f ist die steilste. Warum landet sie trotzdem zuletzt?</li>
              <li>Bei Gerade h: Wie sicher könnt ihr den Wert ablesen? 3,7 oder 3,8?</li>
            </ul>
          </div>
          <p>
            <strong>Du arbeitest allein?</strong> So haben zwei andere Jugendliche gedacht. Klappe die Wege auf und vergleiche sie mit deinem.
          </p>
          <div className="ls-ways">
            <details className="ls-way">
              <summary>Jonas hat eine Tabelle gemacht</summary>
              <div className="ls-way-body">
                <p>
                  „Bei g steht bei x = 3 genau 0, bei f bei x = 4. Bei h steht bei x = 3 noch 0,75, bei x = 4 schon −0,25. Das Vorzeichen wechselt also dazwischen, wahrscheinlich
                  näher bei 4.“
                </p>
                <p>
                  <strong>Gut:</strong> Den Wechsel von positiv zu negativ erkennt man sofort. <strong>Aber:</strong> Liegt die Nullstelle nicht auf einem Tabellenwert, muss man
                  immer feiner nachrechnen.
                </p>
              </div>
            </details>
            <details className="ls-way">
              <summary>Aylin hat im Graphen abgelesen</summary>
              <div className="ls-way-body">
                <p>
                  „Gerade f ist sehr steil, aber sie startet bei 8 ganz weit oben, deshalb braucht sie am längsten. h berührt den Boden kurz vor f. Ob bei 3,7 oder 3,8, kann ich nicht
                  genau sehen.“
                </p>
                <p>
                  <strong>Gut:</strong> Man sieht die Reihenfolge und das Gesamtbild. <strong>Aber:</strong> Ablesen ist nur so genau wie die Zeichnung.
                </p>
              </div>
            </details>
          </div>
          <p>
            Die Stelle, an der eine Gerade die x-Achse berührt, heißt <strong>Nullstelle</strong>. Beide Wege zeigen sie nur ungefähr, wenn sie zwischen zwei Tabellenwerten liegt.
            Im nächsten Abschnitt lernst du, wie du sie immer genau ausrechnest.
          </p>
        </Phase>

        {/* 5 Verfahren und Sichern */}
        <Phase no={5} title="So rechnest du die Nullstelle aus" social="EA" minutes={8}>
          <Rueckbezug pred={pred} />
          <p>
            Eine Nullstelle liegt auf der x-Achse, dort ist der y-Wert immer 0. Das nutzt du zum Rechnen. Decke das Beispiel Schritt für Schritt auf.
          </p>
          <Beispiel
            title="Wo berührt Gerade h den Boden?"
            aufgabe={
              <p>
                Gerade h: <M>{'h(x) = -x + 3{,}75'}</M>. Berechne die Nullstelle.
              </p>
            }
            steps={[
              {
                title: 'Verstehen, was gesucht ist',
                body: (
                  <p>
                    Die Nullstelle ist der <M>x</M>-Wert, an dem die Gerade die x-Achse schneidet. Dort ist die Höhe über dem Boden genau 0, also <M>{'y = 0'}</M>.
                  </p>
                ),
              },
              {
                title: 'Den Funktionswert gleich 0 setzen',
                body: (
                  <>
                    <p>Setze den Funktionsterm gleich 0:</p>
                    <MB>{'-x + 3{,}75 = 0'}</MB>
                  </>
                ),
              },
              {
                title: 'Nach x auflösen',
                body: (
                  <>
                    <p>Bringe das x auf die Seite, auf der es positiv wird:</p>
                    <MB>{'\\begin{aligned} -x + 3{,}75 &= 0 && \\mid +x \\\\ 3{,}75 &= x \\end{aligned}'}</MB>
                  </>
                ),
              },
              {
                title: 'Nullstelle angeben und Probe',
                body: (
                  <>
                    <MB>{'N(3{,}75 \\mid 0)'}</MB>
                    <p>
                      Probe: <M>{'h(3{,}75) = -3{,}75 + 3{,}75 = 0'}</M> ✓
                    </p>
                  </>
                ),
              },
              {
                title: 'Im Bild deuten',
                body: (
                  <p>
                    Gerade h berührt den Boden bei <M>{'x = 3{,}75'}</M>. Das liegt zwischen den Nullstellen von g (3) und f (4). Also landet erst g, dann h, zuletzt f.
                  </p>
                ),
              },
            ]}
          />
          <ErklaerungAufklappen label="Noch ein Beispiel und das Erklärvideo ansehen" />
          <Merke title="Nullstelle einer Geraden">
            <p>
              Die <strong>Nullstelle</strong> ist der <M>x</M>-Wert, bei dem die Gerade die x-Achse schneidet. Dort gilt <M>{'f(x) = 0'}</M>. Der Punkt heißt{' '}
              <M>{'N(x_N \\mid 0)'}</M>.
            </p>
            <p>So berechnest du sie:</p>
            <ol>
              <li>
                Funktionsterm gleich 0 setzen: <M>{'m x + t = 0'}</M>
              </li>
              <li>
                Nach <M>x</M> auflösen, das ergibt <M>{'x_N'}</M>.
              </li>
              <li>
                Nullstelle angeben: <M>{'N(x_N \\mid 0)'}</M>, bei Sachaufgaben mit Antwortsatz und Deutung im Bild.
              </li>
            </ol>
            <p>
              Links der Nullstelle liegt eine fallende Gerade über der x-Achse, rechts davon darunter. Die Nullstelle ist die Grenze.
            </p>
          </Merke>
          <div className="lp-ex bk-panel">
            <CardHead title="Dein Hefteintrag" />
            <p>Übertrage den Merkkasten in dein Heft und ergänze ihn mit dem Beispiel. Hake ab, was du schon hast:</p>
            <div className="ls-criteria">
              {[
                'Überschrift „Nullstelle“ und die Gleichungen der drei Geraden f, g und h',
                'Skizze der drei Geraden mit beschrifteten Achsen und den markierten Nullstellen N(3 | 0), N(3,75 | 0) und N(4 | 0)',
                'Rechnung für h: Funktionsterm gleich 0 setzen, nach x auflösen, Probe',
                'Antwortsatz: In welcher Reihenfolge landen die Geraden, und warum landet die steilste zuletzt?',
              ].map((c) => (
                <label key={c}>
                  <input type="checkbox" /> <span>{c}</span>
                </label>
              ))}
            </div>
          </div>
        </Phase>

        {/* 6 Üben */}
        <Phase no={6} title="Jetzt du: Schritt für Schritt üben" social="EA" minutes={7}>
          <p>Hier rechnest du Nullstellen selbst. Die erste Aufgabe gibt dir die Schritte vor, bei der zweiten stellst du die Gleichung erst selbst auf.</p>
          <div className="lp-exlist">
            <CheckCard
              title="Übung 1: Mit Geländer"
              level="basis"
              prompt={
                <>
                  <p>Berechne die Nullstelle der Geraden <M>{'p(x) = 3x - 12'}</M>. Fülle die Lücken der Rechnung aus.</p>
                </>
              }
              rechnung={[
                { l: ['3x - 12'], r: ['0'], u: '\\mid +12' },
                { l: ['3x'], r: [{ luecke: 'dreix' }], u: '\\mid :3' },
                { l: ['x_N'], r: [{ luecke: 'x' }] },
              ]}
              fields={[
                { kind: 'num', key: 'dreix', label: '3x', expected: 12 },
                { kind: 'num', key: 'x', label: 'x_N', expected: 4 },
              ]}
              solution={
                <>
                  <MB>{'\\begin{aligned} 3x - 12 &= 0 && \\mid +12 \\\\ 3x &= 12 && \\mid :3 \\\\ x &= 4 \\end{aligned}'}</MB>
                  <MB>{'N(4 \\mid 0)'}</MB>
                </>
              }
              help={
                <Hilfen
                  steps={[
                    <>Setze den Funktionsterm gleich 0. Was musst du auf beiden Seiten rechnen, damit links nur noch <M>3x</M> steht?</>,
                    <>
                      Addiere auf beiden Seiten 12. Dann steht links <M>3x</M> und rechts eine Zahl. Teile danach durch 3.
                    </>,
                    <>
                      <M>{'3x = 12'}</M>, also <M>{'x = 4'}</M>.
                    </>,
                  ]}
                />
              }
            />
            <CheckCard
              title="Übung 2: Gerade aus zwei Punkten"
              level="standard"
              prompt={
                <>
                  <p>
                    Eine Gerade geht durch die Punkte <M>{'A(0 \\mid 6)'}</M> und <M>{'B(2 \\mid 2)'}</M>. Stelle die Funktionsgleichung auf und berechne die Nullstelle.
                  </p>
                </>
              }
              fields={[
                { kind: 'num', key: 'm', label: <M>{'m ='}</M>, expected: -2 },
                { kind: 'num', key: 't', label: <M>{'t ='}</M>, expected: 6 },
                { kind: 'num', key: 'x', label: <M>{'x_N ='}</M>, expected: 3 },
              ]}
              fieldsRow
              solution={
                <>
                  <MB>{'m = \\frac{2 - 6}{2 - 0} = -2 \\qquad t = 6 \\;(\\text{A liegt auf der y-Achse})'}</MB>
                  <MB>{'f(x) = -2x + 6'}</MB>
                  <MB>{'\\begin{aligned} -2x + 6 &= 0 && \\mid -6 \\\\ -2x &= -6 && \\mid :(-2) \\\\ x &= 3 \\end{aligned}'}</MB>
                  <MB>{'N(3 \\mid 0)'}</MB>
                </>
              }
              help={
                <Hilfen
                  steps={[
                    <>Berechne zuerst die Steigung aus den beiden Punkten: <M>{'m = \\frac{y_2 - y_1}{x_2 - x_1}'}</M>.</>,
                    <>
                      Der Punkt A liegt auf der y-Achse (x = 0). Was sagt dir das über <M>t</M>?
                    </>,
                    <>
                      <M>{'f(x) = -2x + 6'}</M>. Setze den Term gleich 0 und löse: <M>{'-2x + 6 = 0'}</M>.
                    </>,
                  ]}
                />
              }
            />
            <CheckCard
              title="Übung 3: Umgekehrt gedacht"
              level="erweiterung"
              prompt={
                <p>
                  Die Gerade <M>{'k(x) = -0{,}5x + t'}</M> soll den Boden bei <M>{'x = 5'}</M> berühren. Welchen Wert muss <M>t</M> haben?
                </p>
              }
              fields={[{ kind: 'num', key: 't', label: <M>{'t ='}</M>, expected: 2.5 }]}
              solution={
                <>
                  <p>Die Nullstelle ist 5, also muss <M>{'k(5) = 0'}</M> sein:</p>
                  <MB>{'\\begin{aligned} -0{,}5 \\cdot 5 + t &= 0 \\\\ -2{,}5 + t &= 0 && \\mid +2{,}5 \\\\ t &= 2{,}5 \\end{aligned}'}</MB>
                </>
              }
              help={
                <Hilfen
                  steps={[
                    <>Diesmal kennst du die Nullstelle schon. Welcher y-Wert gehört zu <M>x = 5</M>?</>,
                    <>
                      Setze <M>{'x = 5'}</M> in den Term ein und den ganzen Term gleich 0. Die Unbekannte ist <M>t</M>.
                    </>,
                    <>
                      <M>{'-0{,}5 \\cdot 5 + t = 0'}</M>, also <M>{'-2{,}5 + t = 0'}</M>. Jetzt nach <M>t</M> auflösen.
                    </>,
                  ]}
                />
              }
            />
          </div>
        </Phase>

        {/* 7 Check */}
        <Phase no={7} title="Check: Hast du es verstanden?" social="EA" minutes={6}>
          <div className="lp-exlist">
            <TrackedMc
              topic="Nullstellen-Einstieg: Bedeutung (Basis)"
              title="Check 1: Was bedeutet die Nullstelle?"
              level="basis"
              prompt={
                <p>
                  Für eine Gerade gilt <M>{'N(3 \\mid 0)'}</M>. Was bedeutet das?
                </p>
              }
              options={[
                { text: 'Die Gerade schneidet die x-Achse bei x = 3.', correct: true, feedback: 'N(3 | 0) liegt auf der x-Achse: Dort ist x = 3 und y = 0.' },
                { text: 'Die Gerade schneidet die y-Achse bei y = 3.', feedback: 'Das wäre der y-Achsenabschnitt t = 3. Die Nullstelle liegt auf der x-Achse, dort ist y = 0.' },
                { text: 'Die Gerade schneidet die y-Achse bei x = 0 und y = 3.', feedback: 'Hier sind die Koordinaten vertauscht: Bei N(3 | 0) steht zuerst der x-Wert 3, dann der y-Wert 0.' },
                { text: 'Die Gerade geht durch den Ursprung.', feedback: 'Der Ursprung ist O(0 | 0). Hier ist x = 3, die Gerade berührt die x-Achse rechts davon.' },
              ]}
            />
            <TrackedMc
              topic="Nullstellen-Einstieg: Berechnen (Standard)"
              title="Check 2: Nullstelle berechnen"
              rechnen
              level="standard"
              prompt={
                <>
                  <p>Berechne die Nullstelle. Wähle dann die richtige Antwort aus.</p>
                  <MB>{'f(x) = -3x + 12'}</MB>
                </>
              }
              options={[
                { text: <M>{'x = -4'}</M>, feedback: 'Vorzeichenfehler: Aus −3x + 12 = 0 folgt −3x = −12, also x = (−12) : (−3) = 4.' },
                { text: <M>{'x = 12'}</M>, feedback: 'Die 12 ist der y-Achsenabschnitt t, nicht die Nullstelle. Setze den Term gleich 0 und löse nach x auf.' },
                { text: <M>{'N(0 \\mid 4)'}</M>, feedback: 'Die Zahl stimmt, aber die Koordinaten sind vertauscht. Die Nullstelle liegt auf der x-Achse: N(4 | 0).' },
                { text: <M>{'x = 4'}</M>, correct: true, feedback: '−3x + 12 = 0 ergibt −3x = −12, also x = 4. Probe: f(4) = −12 + 12 = 0.' },
              ]}
            />
            <TrackedCheck
              topic="Nullstellen-Einstieg: Berechnen (Erweiterung)"
              title="Check 3: Jetzt ganz allein"
              level="erweiterung"
              prompt={
                <>
                  <p>Berechne die Nullstelle der Geraden.</p>
                  <MB>{'k(x) = 0{,}25x - 1{,}5'}</MB>
                </>
              }
              fields={[{ kind: 'num', key: 'x', label: <M>{'x_N ='}</M>, expected: 6 }]}
              solution={
                <>
                  <MB>{'\\begin{aligned} 0{,}25x - 1{,}5 &= 0 && \\mid +1{,}5 \\\\ 0{,}25x &= 1{,}5 && \\mid :0{,}25 \\\\ x &= 6 \\end{aligned}'}</MB>
                  <p>
                    Probe: <M>{'k(6) = 0{,}25 \\cdot 6 - 1{,}5 = 0'}</M> ✓
                  </p>
                </>
              }
            />
          </div>
        </Phase>

        <nav className="lp-nav" aria-label="Weiter">
          <button type="button" className="bk-btn" onClick={onBack}>
            <i className="fa-solid fa-arrow-left" aria-hidden="true" /> Zurück zur Auswahl
          </button>
          <button type="button" className="bk-btn bk-btn-primary" onClick={onPractice}>
            Weiter üben: Nullstellen berechnen (Einfach) <i className="fa-solid fa-arrow-right" aria-hidden="true" />
          </button>
        </nav>
      </div>
    </TaskShell>
    </ErklaerungCtx.Provider>
  )
}

/** Rückbezug auf die Vermutung aus Phase 2 */
function Rueckbezug({ pred }: { pred: Prediction }) {
  if (!pred.saved || !pred.first) {
    return (
      <div className="ls-back">
        <p>Du hast in Abschnitt 2 noch keine Vermutung festgehalten. Hole das kurz nach, dann siehst du hier, ob du richtig lagst.</p>
      </div>
    )
  }
  const diff = Math.abs(pred.x - NH)
  let verdict: ReactNode
  if (pred.first === 'g') verdict = <>Das stimmt: Gerade g landet bei x = 3 als Erste. Sie fällt am langsamsten, startet aber auch nur bei y = 1,5.</>
  else if (pred.first === 'f')
    verdict = (
      <>
        Fast alle denken zuerst an die steilste Gerade. Sie landet aber als Letzte, weil sie bei y = 8 startet und einen weiten Weg hat. Als Erste landet g.
      </>
    )
  else verdict = <>Gerade h landet bei x = 3,75 und damit in der Mitte. Als Erste landet g bei x = 3.</>

  return (
    <div className="ls-back">
      <p>
        <strong>Du hattest vermutet:</strong> {FIRST_TEXT[pred.first]}. Für Gerade h hattest du x ≈ {fmt(pred.x, 2)} geschätzt.
      </p>
      <p>{verdict}</p>
      <p>
        Gerade h berührt den Boden bei x = 3,75. {diff < 1e-9 ? 'Deine Schätzung war genau richtig!' : `Deine Schätzung lag ${fmt(diff, 2)} Einheiten daneben.`} Wie man die Stelle genau
        ausrechnet, siehst du jetzt.
      </p>
    </div>
  )
}

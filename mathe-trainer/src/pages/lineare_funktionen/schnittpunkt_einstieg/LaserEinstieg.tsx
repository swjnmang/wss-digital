import { useId, useState, type ChangeEvent, type ReactNode } from 'react'
import TaskShell from '../../../components/layout/TaskShell'
import CheckedNumberInput from '../../../components/CheckedNumberInput'
import { Beispiel, M, MB, Merke, QuerTabelle, fmt } from '../../daten_und_zufall/lernpfad/kit'
import {
  CardHead, CheckCard, ErklaerungAufklappen, ErklaerungCtx, Hilfen, McCard, Phase, TrackedCheck, TrackedMc, tx,
} from '../lernsituation_kit/kit'
import '../../daten_und_zufall/lernpfad/lernpfad.css'

// Einstiegs-Lernsituation „Treffen sich die Laserstrahlen über dem DJ-Pult?“ zum Schnittpunkt zweier Geraden
// mit grafischer Deutung im Sachbild (wie in den Prüfungsaufgaben: Gerade = Gegenstand im Koordinatensystem).
// Phasen: Aktivieren → Situation & Vorhersage → Erkunden (Tabelle, Graph) → Austausch → Verfahren → Üben → Check.
// Die Vorhersage bleibt nur im Seitenzustand (kein Speichern).
// Wird als Modus „Lernsituation“ auf der Seite „Schnittpunkt zweier Geraden“ angezeigt; der Infoteil
// (Erklärung mit Erklärvideo) kommt von dort, damit er nur an einer Stelle gepflegt wird.

/* ── Situation ───────────────────────────────────────────────────────────── */

// Seitenansicht der Bühne, 1 LE = 1 m. y-Achse = Mitte des DJ-Pults, x-Achse = Boden, Decke in 4 m Höhe.
// Linker Laser L(−4|4) trifft den Boden bei x = 4, rechter Laser R(5|4) bei x = −3.
const L = { x: -4, y: 4 }
const R = { x: 5, y: 4 }
const f = (x: number) => -0.5 * x + 2
const g = (x: number) => 0.5 * x + 1.5
/** rechter Strahl bei anderer Steigung m (Strahler bleibt in R) */
const gm = (m: number) => (x: number) => m * (x - R.x) + R.y
const XS = 0.5
const YS = 1.75
const PULT = { l: -0.4, r: 0.4, h: 1.1 }


type Choice = 'ueber' | 'links' | 'rechts'
type Prediction = { choice: Choice | null; x: number; saved: boolean }

const CHOICE_TEXT: Record<Choice, string> = {
  ueber: 'Die Strahlen kreuzen sich über dem Pult',
  links: 'Sie kreuzen sich links neben dem Pult',
  rechts: 'Sie kreuzen sich rechts neben dem Pult',
}

/* ── Sachbild: Bühne in der Seitenansicht ────────────────────────────────── */

const S = { w: 640, h: 330, l: 40, r: 14, t: 12, b: 34, xMin: -5, xMax: 6, yMax: 4.6 }
const bx = (x: number) => S.l + ((x - S.xMin) / (S.xMax - S.xMin)) * (S.w - S.l - S.r)
const by = (y: number) => S.h - S.b - (y / S.yMax) * (S.h - S.t - S.b)

/** Kreuzungspunkt der Strahlen, wenn der rechte Strahl die Steigung m hat */
function kreuzung(m: number) {
  const x = (5 * m - 2) / (0.5 + m)
  return { x, y: f(x) }
}

/**
 * Seitenansicht der Bühne mit beiden Laserstrahlen.
 * marker: senkrechte Messlinie bei x, mRight: Steigung des rechten Strahls, cross: Kreuzungspunkt markieren
 */
function LaserBild({ marker, mRight = 0.5, cross = false }: { marker?: number; mRight?: number; cross?: boolean }) {
  const right = gm(mRight)
  // rechter Strahl endet auf dem Boden oder am linken Bildrand
  const floorX = R.x - R.y / mRight
  const end = floorX >= S.xMin ? { x: floorX, y: 0 } : { x: S.xMin, y: right(S.xMin) }
  const k = kreuzung(mRight)
  return (
    <div className="bk-graph ls-graph">
      <svg viewBox={`0 0 ${S.w} ${S.h}`} role="img" aria-label="Seitenansicht der Bühne mit zwei Laserstrahlen und dem DJ-Pult">
        {Array.from({ length: S.xMax - S.xMin + 1 }, (_, i) => S.xMin + i).map((v) => (
          <g key={`x${v}`}>
            <line x1={bx(v)} x2={bx(v)} y1={by(0)} y2={by(4.3)} stroke="var(--grid)" />
            <text x={bx(v)} y={by(0) + 24} textAnchor="middle" fontSize="19" fill="var(--ink-muted)">
              {v}
            </text>
          </g>
        ))}
        {[1, 2, 3, 4].map((v) => (
          <g key={`y${v}`}>
            <line x1={bx(S.xMin)} x2={bx(S.xMax)} y1={by(v)} y2={by(v)} stroke="var(--grid)" />
            <text x={bx(0) - 6} y={by(v) + 5} textAnchor="end" fontSize="19" fill="var(--ink-muted)">
              {v}
            </text>
          </g>
        ))}
        {/* Decke und Boden */}
        <rect x={bx(S.xMin)} y={by(4.45)} width={bx(S.xMax) - bx(S.xMin)} height={by(4.3) - by(4.45)} fill="var(--line-strong)" />
        <text x={bx(S.xMax) - 4} y={by(4.45) - 2} textAnchor="end" fontSize="14" fill="var(--ink-muted)">
          Decke
        </text>
        <line x1={bx(S.xMin)} x2={bx(S.xMax)} y1={by(0)} y2={by(0)} stroke="var(--ink)" strokeWidth="2.5" />
        <line x1={bx(0)} x2={bx(0)} y1={by(0)} y2={by(4.3)} stroke="var(--ink)" strokeWidth="1.5" />
        <text x={bx(S.xMax) - 4} y={by(0) - 6} textAnchor="end" fontSize="14" fill="var(--ink-muted)">
          Boden (x in m)
        </text>
        {/* DJ-Pult */}
        <rect x={bx(PULT.l)} y={by(PULT.h)} width={bx(PULT.r) - bx(PULT.l)} height={by(0) - by(PULT.h)} fill="var(--surface-sunken)" stroke="var(--ink)" strokeWidth="2" />
        <text x={bx(0)} y={by(0.45)} textAnchor="middle" fontSize="15" fontWeight="700" fill="var(--ink)">
          DJ
        </text>
        {/* Laserstrahler an der Decke */}
        {[L, R].map((p) => (
          <rect key={p.x} x={bx(p.x) - 12} y={by(4.3)} width="24" height={by(4) - by(4.3)} rx="3" fill="var(--ink)" />
        ))}
        {/* Strahlen */}
        <line x1={bx(L.x)} y1={by(L.y)} x2={bx(4)} y2={by(0)} stroke="var(--primary)" strokeWidth="3" />
        <line x1={bx(R.x)} y1={by(R.y)} x2={bx(end.x)} y2={by(end.y)} stroke="var(--hint)" strokeWidth="3" strokeDasharray="10 5" />
        <text x={bx(-3.1)} y={by(f(-3.1)) - 10} fontSize="24" fontWeight="700" fill="var(--primary)">
          f
        </text>
        <text x={bx(4.1)} y={by(right(4.1)) - 10} textAnchor="end" fontSize="24" fontWeight="700" fill="var(--hint)">
          g
        </text>
        {marker !== undefined && (
          <>
            <line x1={bx(marker)} x2={bx(marker)} y1={by(0)} y2={by(4)} stroke="var(--ink-muted)" strokeDasharray="4 4" />
            <circle cx={bx(marker)} cy={by(f(marker))} r="6" fill="var(--primary)" stroke="var(--surface)" strokeWidth="2" />
            <circle cx={bx(marker)} cy={by(right(marker))} r="6" fill="var(--hint)" stroke="var(--surface)" strokeWidth="2" />
          </>
        )}
        {cross && (
          <>
            <circle cx={bx(k.x)} cy={by(k.y)} r="7" fill="var(--highlight)" stroke="var(--ink)" strokeWidth="2" />
            <text x={bx(k.x) + 10} y={by(k.y) - 10} fontSize="18" fontWeight="700" fill="var(--ink)">
              S
            </text>
          </>
        )}
      </svg>
    </div>
  )
}

/** Weg 2: am Bild messen mit einer verschiebbaren Messlinie */
function GraphKarte() {
  const sliderId = useId()
  const [x, setX] = useState(-2)
  const a = f(x)
  const b = g(x)
  return (
    <div className="lp-ex bk-panel">
      <CardHead title="Weg 2: Graph" level="standard" />
      <div className="lp-ex-prompt">
        <p>
          Verschiebt die Messlinie. Die Punkte zeigen, wie hoch die beiden Strahlen an dieser Stelle sind. Wo sind beide Strahlen gleich hoch? Liegt die Stelle über dem Pult
          (von <M>{'-0{,}4'}</M> bis <M>{'0{,}4'}</M>)?
        </p>
      </div>
      <LaserBild marker={x} />
      <div className="ls-slider">
        <label htmlFor={sliderId}>
          Messlinie bei <M>x</M> = <span className="ls-slider-value">{fmt(x, 1)}</span> m
        </label>
        <input id={sliderId} type="range" min={-3} max={4} step={0.1} value={x} onChange={(e: ChangeEvent<HTMLInputElement>) => setX(Math.round(Number(e.target.value) * 10) / 10)} />
      </div>
      <div className="ls-readout">
        <div className="ls-readout-box ls-readout-a">
          <strong>linker Strahl:</strong> <M>{`f(${tx(x)}) = ${tx(a)}`}</M> m
        </div>
        <div className="ls-readout-box ls-readout-b">
          <strong>rechter Strahl:</strong> <M>{`g(${tx(x)}) = ${tx(b)}`}</M> m
        </div>
      </div>
      {Math.abs(a - b) < 1e-9 && (
        <div className="ls-equal" role="status">
          <i className="fa-solid fa-equals" aria-hidden="true" /> Hier sind beide Strahlen gleich hoch: Sie kreuzen sich!
        </div>
      )}
      <p className="lp-hint">Im Heft: Zeichnet beide Strahlen und das Pult in ein Koordinatensystem (1 cm für 1 m) und markiert den Kreuzungspunkt.</p>
      <Hilfen
        steps={[
          <>Welcher Strahl ist links von der Bühnenmitte höher, welcher rechts davon?</>,
          <>Schiebt die Messlinie, bis beide Punkte aufeinanderliegen. Lest dann x und y ab.</>,
          <>
            Bei <M>{'x = 0'}</M> ist der linke Strahl 0,5 m höher als der rechte, bei <M>{'x = 1'}</M> ist er 0,5 m tiefer. Die gesuchte Stelle liegt genau dazwischen.
          </>,
        ]}
      />
    </div>
  )
}

/** Zusatzfrage: rechten Strahler drehen und den Kreuzungspunkt wandern lassen */
function DrehenAnsicht() {
  const sliderId = useId()
  const [m, setM] = useState(0.5)
  const k = kreuzung(m)
  return (
    <>
      <LaserBild mRight={m} cross />
      <div className="ls-slider">
        <label htmlFor={sliderId}>
          Steigung des rechten Strahls: <M>{`m = ${tx(m, 2)}`}</M>
        </label>
        <input id={sliderId} type="range" min={0.2} max={0.8} step={0.05} value={m} onChange={(e: ChangeEvent<HTMLInputElement>) => setM(Math.round(Number(e.target.value) * 100) / 100)} />
      </div>
      <div className="ls-readout-box ls-readout-b">
        Der Kreuzungspunkt liegt ungefähr bei <M>{`S(${tx(k.x, 2)} \\mid ${tx(k.y, 2)})`}</M>.
      </div>
    </>
  )
}

/* ── Seite ───────────────────────────────────────────────────────────────── */

const COARSE_X = [-2, -1, 0, 1, 2]
const LUPE_X = [0, 0.25, 0.5, 0.75, 1]

function cellInput(expected: number, key: number) {
  return (
    <span key={key}>
      <CheckedNumberInput expected={expected} tolerance={0.005} className="bk-input lp-input lp-input-sm" />
    </span>
  )
}

export default function LaserEinstieg({ erklaerung, onBack, onPractice }: { erklaerung: ReactNode; onBack: () => void; onPractice: () => void }) {
  const [pred, setPred] = useState<Prediction>({ choice: null, x: 0, saved: false })

  return (
    <ErklaerungCtx.Provider value={erklaerung}>
    <TaskShell title="Schnittpunkt zweier Geraden" subtitle="Lernsituation: Treffen sich die Laserstrahlen über dem DJ-Pult?" width="wide">
      <div className="lp">
        <div>
          <button type="button" className="bk-btn bk-btn-sm bk-btn-ghost" onClick={onBack}>
            <i className="fa-solid fa-arrow-left" aria-hidden="true" /> Zurück zur Auswahl
          </button>
        </div>
        <div className="lp-goal">
          <i className="fa-solid fa-bullseye" aria-hidden="true" />
          <div>
            <strong>Das lernst du hier:</strong> Du findest heraus, wo sich zwei Geraden in einem Bild schneiden: erst mit Tabelle und Graph, dann genau mit dem
            Gleichsetzungsverfahren. Und du deutest den Schnittpunkt in der Situation.
          </div>
        </div>

        {/* 1 Aktivieren */}
        <Phase no={1} title="Fit für den Start" social="EA" minutes={5}>
          <p>Diese vier kurzen Aufgaben brauchst du gleich. Löse sie allein.</p>
          <div className="lp-exlist">
            <CheckCard
              title="a) Punktprobe"
              prompt={
                <p>
                  Berechne, ob der Punkt <M>{'P(2 \\mid 1)'}</M> auf der Geraden <M>{'f(x) = -0{,}5x + 2'}</M> liegt. Halte deinen Rechenweg schriftlich fest.
                </p>
              }
              fields={[{ kind: 'select', key: 'p', label: 'Antwort', options: ['Ja', 'Nein'], expected: 0 }]}
              solution={
                <>
                  <p>x-Wert einsetzen und mit dem y-Wert vergleichen:</p>
                  <MB>{'f(2) = -0{,}5 \\cdot 2 + 2 = 1 \\;\\checkmark'}</MB>
                  <p>Der y-Wert stimmt, also liegt P auf der Geraden.</p>
                </>
              }
            />
            <CheckCard
              title="b) Gleichung aus zwei Punkten"
              prompt={
                <p>
                  Eine Gerade geht durch <M>{'R(5 \\mid 4)'}</M> und <M>{'Q(-3 \\mid 0)'}</M>. Berechne die Funktionsgleichung <M>{'g(x) = m x + t'}</M>. Halte deine Rechenwege schriftlich fest.
                </p>
              }
              fieldsRow
              fields={[
                { kind: 'num', key: 'm', label: <M>{'m ='}</M>, expected: 0.5 },
                { kind: 'num', key: 't', label: <M>{'t ='}</M>, expected: 1.5 },
              ]}
              solution={
                <>
                  <MB>{'m = \\frac{y_2 - y_1}{x_2 - x_1} = \\frac{4 - 0}{5 - (-3)} = \\frac{4}{8} = 0{,}5'}</MB>
                  <p>Einen Punkt einsetzen, z. B. R:</p>
                  <MB>{'\\begin{aligned} 4 &= 0{,}5 \\cdot 5 + t \\\\ 4 &= 2{,}5 + t && \\mid -2{,}5 \\\\ t &= 1{,}5 \\end{aligned}'}</MB>
                  <MB>{'g(x) = 0{,}5x + 1{,}5'}</MB>
                </>
              }
            />
            <McCard
              title="c) y-Achsenabschnitt deuten"
              prompt={
                <p>
                  Ein Laserstrahl hat die Gleichung <M>{'f(x) = -0{,}5x + 2'}</M>. Die y-Achse geht durch die Mitte der Bühne. Was bedeutet die 2? Wähle die passende Aussage.
                </p>
              }
              options={[
                { text: 'Der Strahl ist in der Bühnenmitte 2 m hoch.', correct: true, feedback: 'Bei x = 0 ist f(0) = 2. Dort schneidet der Strahl die y-Achse.' },
                { text: 'Der Strahl trifft 2 m neben der Mitte auf den Boden.', feedback: 'Das wäre die Nullstelle. Die liegt hier bei x = 4.' },
                { text: 'Der Strahler hängt 2 m hoch.', feedback: 'Der Strahler hängt weiter außen. Die 2 gilt nur genau in der Bühnenmitte (x = 0).' },
                { text: 'Der Strahl fällt pro Meter um 2 m.', feedback: 'Das wäre die Steigung m. Die ist hier −0,5: pro Meter nach rechts fällt der Strahl um 0,5 m.' },
              ]}
            />
            <CheckCard
              title="d) Gleichung lösen"
              prompt={<p>Löse die gegebene Gleichung nach <M>x</M> auf. Halte deinen Rechenweg schriftlich fest.</p>}
              lead={<M>{'0{,}5x + 1{,}5 = 2 \\qquad \\Rightarrow'}</M>}
              fields={[{ kind: 'num', key: 'x', label: <M>{'x ='}</M>, expected: 1 }]}
              solution={<MB>{'\\begin{aligned} 0{,}5x + 1{,}5 &= 2 && \\mid -1{,}5 \\\\ 0{,}5x &= 0{,}5 && \\mid :0{,}5 \\\\ x &= 1 \\end{aligned}'}</MB>}
            />
          </div>
        </Phase>

        {/* 2 Situation & Vorhersage */}
        <Phase no={2} title="Die Situation: Lasershow für die Abschlussparty" social="EA" minutes={5}>
          <p>
            Für eure Abschlussparty baut ihr in der Aula eine Lasershow auf. An der Decke hängen zwei Laserstrahler. Ihr wollt, dass sich die beiden Strahlen genau über dem
            DJ-Pult kreuzen, das sieht am besten aus.
          </p>
          <p>
            Das Bild zeigt die Bühne von der Seite in einem Koordinatensystem. Ein Kästchen ist 1 m. Die y-Achse geht genau durch die Mitte des DJ-Pults, die x-Achse ist der
            Boden.
          </p>
          <LaserBild />
          <div className="ls-flyers">
            <div className="ls-flyer ls-flyer-a">
              <div className="ls-flyer-name">Linker Laser</div>
              <div className="ls-flyer-price">
                Strahl <strong>
                  <M>{'f(x) = -0{,}5x + 2'}</M>
                </strong>
              </div>
            </div>
            <div className="ls-flyer ls-flyer-b">
              <div className="ls-flyer-name">Rechter Laser</div>
              <div className="ls-flyer-price">
                Strahl <strong>
                  <M>{'g(x) = 0{,}5x + 1{,}5'}</M>
                </strong>
              </div>
            </div>
          </div>
          <p>Das DJ-Pult ist 80 cm breit (von x = −0,4 bis x = 0,4) und 1,10 m hoch.</p>
          <div className="ls-question">
            <i className="fa-solid fa-circle-question" aria-hidden="true" />
            <span>Kreuzen sich die beiden Laserstrahlen über dem DJ-Pult?</span>
          </div>

          <div className="lp-ex bk-panel" data-no-autocheck>
            <CardHead title="Deine Vermutung" />
            {pred.saved && pred.choice ? (
              <>
                <div className="ls-saved" role="status">
                  <i className="fa-solid fa-lock" aria-hidden="true" /> Gespeichert: <strong>{CHOICE_TEXT[pred.choice]}</strong>. Deine Schätzung: bei etwa{' '}
                  <strong>x = {fmt(pred.x, 1)}</strong>. Am Ende schauen wir, ob du recht hattest.
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
                  {(['ueber', 'links', 'rechts'] as const).map((c) => (
                    <label key={c} className="bk-choice ls-option">
                      <input type="radio" name="ls-pred" checked={pred.choice === c} onChange={() => setPred({ ...pred, choice: c })} />
                      <span>{CHOICE_TEXT[c]}</span>
                    </label>
                  ))}
                </div>
                <div className="ls-slider">
                  <label htmlFor="ls-pred-x">
                    Ich schätze, die Strahlen kreuzen sich bei x ≈ <span className="ls-slider-value">{fmt(pred.x, 1)}</span>
                  </label>
                  <input
                    id="ls-pred-x"
                    type="range"
                    min={-2}
                    max={2}
                    step={0.1}
                    value={pred.x}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setPred({ ...pred, x: Math.round(Number(e.target.value) * 10) / 10 })}
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

        {/* 3 Erkunden */}
        <Phase no={3} title="Findet es heraus" social="PA" minutes={12}>
          <p>
            <strong>Auftrag:</strong> Findet zu zweit heraus, wo sich die beiden Strahlen kreuzen und ob das über dem Pult ist. Ihr habt zwei Wege: Tabelle und Graph. Fangt
            mit einem an, wer fertig ist, probiert auch den anderen. Jede Person tippt auf dem eigenen Gerät.
          </p>

          <div className="lp-ex bk-panel" data-no-autocheck>
            <CardHead title="Weg 1: Tabelle" level="basis" />
            <div className="lp-ex-prompt">
              <p>Wie hoch sind die Strahlen an diesen Stellen? Füllt die Tabelle aus. Die Felder färben sich von selbst grün oder rot.</p>
            </div>
            <QuerTabelle
              rows={[
                { head: 'x in m', cells: COARSE_X.map((x) => <strong key={x}>{fmt(x, 2)}</strong>) },
                { head: 'linker Strahl f(x)', cells: COARSE_X.map((x) => cellInput(f(x), x)) },
                { head: 'rechter Strahl g(x)', cells: COARSE_X.map((x) => cellInput(g(x), x)) },
              ]}
            />
            <p>
              Zwischen welchen beiden x-Werten tauschen die Strahlen die Plätze, sodass plötzlich der andere höher ist? Schaut mit der Lupe genauer hin:
            </p>
            <QuerTabelle
              rows={[
                { head: 'x in m', cells: LUPE_X.map((x) => <strong key={x}>{fmt(x, 2)}</strong>) },
                { head: 'linker Strahl f(x)', cells: LUPE_X.map((x) => (x === 0 || x === 1 ? <span key={x}>{fmt(f(x), 3)}</span> : cellInput(f(x), x))) },
                { head: 'rechter Strahl g(x)', cells: LUPE_X.map((x) => (x === 0 || x === 1 ? <span key={x}>{fmt(g(x), 3)}</span> : cellInput(g(x), x))) },
              ]}
            />
            <p className="lp-hint">Vergleicht die beiden Zeilen Spalte für Spalte: Wo sind beide Strahlen gleich hoch?</p>
            <Hilfen
              steps={[
                <>Setzt jeden x-Wert in die Gleichung ein. Was ist f(0), was ist g(0)?</>,
                <>
                  Pro Meter nach rechts wird der linke Strahl 0,5 m tiefer, der rechte 0,5 m höher. Ihr könnt also auch vom vorigen Feld aus weiterrechnen. In der Lupe sind es
                  Schritte von 0,25 m, also ändert sich die Höhe um 0,125 m.
                </>,
                <>
                  Für <M>{'x = -2'}</M>: <M>{'f(-2) = -0{,}5 \\cdot (-2) + 2 = 3'}</M> und <M>{'g(-2) = 0{,}5 \\cdot (-2) + 1{,}5 = 0{,}5'}</M>.
                </>,
              ]}
            />
          </div>

          <GraphKarte />

          <CheckCard
            title="Euer Ergebnis"
            prompt={<p>Egal, welchen Weg ihr genommen habt: Tragt euer Ergebnis ein und haltet eure Rechenwege oder Ablesungen schriftlich fest.</p>}
            fields={[
              { kind: 'num', key: 'x', label: <>Die Strahlen kreuzen sich bei <M>x</M> =</>, expected: XS, unit: 'm' },
              { kind: 'num', key: 'y', label: <>in der Höhe <M>y</M> =</>, expected: YS, unit: 'm' },
              {
                kind: 'select',
                key: 'pult',
                label: 'Kreuzen sich die Strahlen über dem Pult?',
                options: ['Ja, genau über der Mitte', 'Ja, über dem Pult, aber nicht in der Mitte', 'Nein, knapp rechts neben dem Pult', 'Nein, links neben dem Pult'],
                expected: 2,
              },
            ]}
          />

          <CheckCard
            title="Zusatzfrage: Den Strahler neu ausrichten"
            level="erweiterung"
            prompt={
              <>
                <p>
                  Ihr seid schon fertig? Der rechte Strahler hängt fest in <M>{'R(5 \\mid 4)'}</M>, aber ihr könnt ihn drehen. Dadurch ändert sich die Steigung seines Strahls.
                  Stellt ihn so ein, dass sich die Strahlen <strong>genau über der Mitte des Pults</strong> kreuzen.
                </p>
                <p>Haltet eure Rechenwege schriftlich fest und beschreibt im Heft: In welche Richtung wandert der Kreuzungspunkt, wenn der rechte Strahl steiler wird? Warum?</p>
                <DrehenAnsicht />
              </>
            }
            fields={[
              { kind: 'num', key: 'm', label: <>Nötige Steigung <M>m</M> =</>, expected: 0.4 },
              { kind: 'num', key: 'y', label: <>Höhe des Kreuzungspunkts <M>y</M> =</>, expected: 2, unit: 'm' },
            ]}
            help={
              <Hilfen
                steps={[
                  <>Schiebt den Regler: Wandert der Kreuzungspunkt nach links oder nach rechts, wenn der Strahl steiler wird?</>,
                  <>
                    Über der Pultmitte ist <M>{'x = 0'}</M>. Wie hoch ist der linke Strahl dort? Das ist sein y-Achsenabschnitt.
                  </>,
                  <>
                    Der rechte Strahl muss durch <M>{'R(5 \\mid 4)'}</M> und durch <M>{'(0 \\mid 2)'}</M> gehen. Steigung aus zwei Punkten:{' '}
                    <M>{'m = \\frac{4 - 2}{5 - 0}'}</M>
                  </>,
                ]}
              />
            }
            solution={
              <>
                <p>
                  Über der Pultmitte ist <M>{'x = 0'}</M>. Der linke Strahl ist dort <M>{'f(0) = 2'}</M> m hoch. Der rechte Strahl muss also durch <M>{'(0 \\mid 2)'}</M> und{' '}
                  <M>{'R(5 \\mid 4)'}</M> gehen:
                </p>
                <MB>{'m = \\frac{4 - 2}{5 - 0} = \\frac{2}{5} = 0{,}4'}</MB>
                <p>
                  Der Kreuzungspunkt liegt dann bei <M>{'S(0 \\mid 2)'}</M>, also 2 m hoch über der Pultmitte. Je steiler der rechte Strahl ist, desto weiter rechts und tiefer
                  liegt der Kreuzungspunkt, denn der Strahl fällt nach links schneller ab.
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
              <li>Wo sieht man in der Tabelle und im Bild, dass sich die Strahlen kreuzen?</li>
              <li>Warum hat die Tabelle mit ganzen Metern nicht gereicht?</li>
              <li>Im Bild sieht es fast so aus, als würden sich die Strahlen über dem Pult kreuzen. Wie sicher könnt ihr euch beim Ablesen sein?</li>
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
                  „Bei x = 0 ist der linke Strahl höher, bei x = 1 der rechte. Dazwischen müssen sie sich kreuzen. Mit der Lupe habe ich gesehen: Bei x = 0,5 sind beide 1,75 m
                  hoch.“
                </p>
                <p>
                  <strong>Gut:</strong> Man kann den Bereich Schritt für Schritt eingrenzen. <strong>Aber:</strong> Liegt der Punkt nicht genau auf einem Tabellenwert, muss man
                  immer feiner rechnen.
                </p>
              </div>
            </details>
            <details className="ls-way">
              <summary>Aylin hat im Bild abgelesen</summary>
              <div className="ls-way-body">
                <p>„Die Strahlen kreuzen sich ein Stück rechts von der y-Achse, knapp unter 2 m. Ist das jetzt noch über dem Pult oder schon daneben? Das sehe ich nicht genau.“</p>
                <p>
                  <strong>Gut:</strong> Man sieht sofort, wo ungefähr der Schnittpunkt liegt. <strong>Aber:</strong> Ablesen ist nur so genau wie die Zeichnung, bei 10 cm
                  Unterschied reicht das nicht.
                </p>
              </div>
            </details>
          </div>
          <p>
            Beide Wege haben einen Haken: Liegt der Schnittpunkt nicht genau in der Tabelle oder auf einer Gitterlinie, findet man ihn nur ungefähr. Im nächsten Abschnitt
            lernst du ein Verfahren, mit dem du ihn immer genau ausrechnest.
          </p>
        </Phase>

        {/* 5 Verfahren und Sichern */}
        <Phase no={5} title="So rechnest du den Schnittpunkt aus" social="EA" minutes={8}>
          <Rueckbezug pred={pred} />
          <p>
            Mit dem <strong>Gleichsetzungsverfahren</strong> rechnest du den Schnittpunkt immer genau aus. Decke das Beispiel Schritt für Schritt auf.
          </p>
          <Beispiel
            title="Wo kreuzen sich die Laserstrahlen?"
            aufgabe={
              <p>
                Linker Strahl: <M>{'f(x) = -0{,}5x + 2'}</M>, rechter Strahl: <M>{'g(x) = 0{,}5x + 1{,}5'}</M>. Das Pult reicht von <M>{'x = -0{,}4'}</M> bis{' '}
                <M>{'x = 0{,}4'}</M>.
              </p>
            }
            steps={[
              {
                title: 'Funktionsgleichungen bereitlegen',
                body: (
                  <p>
                    Hier sind sie gegeben. In Prüfungsaufgaben musst du sie oft zuerst aus zwei Punkten aufstellen, wie in Aufgabe 1 b): <M>{'m = \\frac{y_2 - y_1}{x_2 - x_1}'}</M>,
                    dann einen Punkt einsetzen und <M>t</M> berechnen.
                  </p>
                ),
              },
              {
                title: 'Gleichsetzen',
                body: (
                  <>
                    <p>Im Schnittpunkt sind beide Strahlen gleich hoch, also sind beide y-Werte gleich. Deshalb darfst du die rechten Seiten gleichsetzen:</p>
                    <MB>{'-0{,}5x + 2 = 0{,}5x + 1{,}5'}</MB>
                  </>
                ),
              },
              {
                title: 'Nach x auflösen',
                body: (
                  <>
                    <p>Alle x auf eine Seite, alle Zahlen auf die andere. Tipp: Bringe die x auf die Seite, auf der sie positiv bleiben.</p>
                    <MB>{'\\begin{aligned} -0{,}5x + 2 &= 0{,}5x + 1{,}5 && \\mid +0{,}5x \\\\ 2 &= x + 1{,}5 && \\mid -1{,}5 \\\\ 0{,}5 &= x \\end{aligned}'}</MB>
                  </>
                ),
              },
              {
                title: 'x einsetzen und y ausrechnen',
                body: (
                  <>
                    <p>Setze x = 0,5 in eine der beiden Gleichungen ein. Zur Probe in die andere:</p>
                    <MB>{'f(0{,}5) = -0{,}5 \\cdot 0{,}5 + 2 = 1{,}75 \\qquad \\text{Probe: } g(0{,}5) = 0{,}25 + 1{,}5 = 1{,}75 \\;\\checkmark'}</MB>
                  </>
                ),
              },
              {
                title: 'Schnittpunkt angeben und im Bild deuten',
                body: (
                  <>
                    <MB>{'S(0{,}5 \\mid 1{,}75)'}</MB>
                    <p>
                      Die Strahlen kreuzen sich 0,5 m rechts von der Pultmitte in 1,75 m Höhe. Das Pult reicht nur bis 0,4 m, der Kreuzungspunkt liegt also 10 cm rechts neben
                      dem Pult. Außerdem sind 1,75 m genau Kopfhöhe, und Laser dürfen niemandem in die Augen leuchten. Der Strahler sollte also neu ausgerichtet werden.
                    </p>
                  </>
                ),
              },
            ]}
          />
          <ErklaerungAufklappen label="Noch ein Beispiel und das Erklärvideo ansehen" />
          <Merke title="Schnittpunkt zweier Geraden">
            <p>
              Im <strong>Schnittpunkt</strong> <M>{'S(x_S \\mid y_S)'}</M> haben beide Geraden denselben <M>x</M>-Wert <strong>und</strong> denselben <M>y</M>-Wert.
            </p>
            <p>So berechnest du ihn (Gleichsetzungsverfahren):</p>
            <ol>
              <li>
                Beide Funktionsterme gleichsetzen: <M>{'m_1 x + t_1 = m_2 x + t_2'}</M>
              </li>
              <li>
                Nach <M>x</M> auflösen, das ergibt <M>{'x_S'}</M>.
              </li>
              <li>
                <M>{'x_S'}</M> in eine der beiden Gleichungen einsetzen, das ergibt <M>{'y_S'}</M>.
              </li>
              <li>
                Schnittpunkt angeben: <M>{'S(x_S \\mid y_S)'}</M>, bei Sachaufgaben mit Antwortsatz und Deutung im Bild.
              </li>
            </ol>
            <p>
              Lasershow: <M>{'S(0{,}5 \\mid 1{,}75)'}</M>: Die Strahlen kreuzen sich 0,5 m rechts der Pultmitte in 1,75 m Höhe, also knapp neben dem Pult.
            </p>
          </Merke>
          <div className="lp-ex bk-panel">
            <CardHead title="Dein Hefteintrag" />
            <p>Übertrage den Merkkasten in dein Heft und ergänze ihn mit dem Laser-Beispiel. Hake ab, was du schon hast:</p>
            <div className="ls-criteria">
              {[
                'Überschrift „Schnittpunkt zweier Geraden“ und die beiden Funktionsgleichungen der Strahlen',
                'Skizze der Bühne mit beiden Strahlen, dem Pult und dem markierten Schnittpunkt S(0,5 | 1,75)',
                'Gleichsetzen mit allen Rechenschritten, Einsetzen für y und Probe',
                'Antwortsatz: Wo genau und wie hoch kreuzen sich die Strahlen, und ist das über dem Pult?',
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
          <p>Hier rechnest du das Verfahren selbst. Die erste Aufgabe gibt dir die Schritte vor, bei der zweiten stellst du auch die Gleichungen aus zwei Punkten auf.</p>
          <div className="lp-exlist">
            <CheckCard
              title="Übung 1: Mit Geländer"
              level="basis"
              prompt={
                <>
                  <p>Berechne den Schnittpunkt der beiden Geraden. Fülle die Lücken der Rechnung aus und halte deinen Rechenweg schriftlich fest.</p>
                  <MB>{'f(x) = 4x + 1 \\qquad g(x) = 2x + 7'}</MB>
                  <MB>{'\\begin{aligned} 4x + 1 &= 2x + 7 && \\mid -2x \\\\ 2x + 1 &= 7 && \\mid -1 \\\\ 2x &= \\;\\fbox{?} && \\mid :2 \\\\ x &= \\;\\fbox{?} \\end{aligned}'}</MB>
                  <p>
                    Dann <M>x</M> in <M>f</M> einsetzen: <M>{'y = 4 \\cdot x + 1'}</M>
                  </p>
                </>
              }
              fieldsRow
              fields={[
                { kind: 'num', key: 'zweix', label: <M>{'2x ='}</M>, expected: 6 },
                { kind: 'num', key: 'x', label: <M>{'x ='}</M>, expected: 3 },
                { kind: 'num', key: 'y', label: <M>{'y ='}</M>, expected: 13 },
              ]}
              solution={
                <>
                  <MB>{'\\begin{aligned} 4x + 1 &= 2x + 7 && \\mid -2x \\\\ 2x + 1 &= 7 && \\mid -1 \\\\ 2x &= 6 && \\mid :2 \\\\ x &= 3 \\end{aligned}'}</MB>
                  <MB>{'y = 4 \\cdot 3 + 1 = 13 \\qquad \\Rightarrow \\qquad S(3 \\mid 13)'}</MB>
                </>
              }
              help={
                <Hilfen
                  steps={[
                    <>Rechne Schritt für Schritt: Was bleibt übrig, wenn du auf beiden Seiten 1 abziehst?</>,
                    <>
                      Nach dem Abziehen steht links nur noch <M>2x</M>. Teile dann beide Seiten durch 2.
                    </>,
                    <>
                      <M>{'2x = 6'}</M>, also <M>{'x = 3'}</M>. Für <M>y</M>: <M>{'4 \\cdot 3 + 1'}</M>
                    </>,
                  ]}
                />
              }
            />
            <CheckCard
              title="Übung 2: Scheinwerfer im Schultheater"
              level="standard"
              prompt={
                <>
                  <p>
                    Im Schultheater leuchten zwei Scheinwerfer auf die Bühne (1 LE = 1 m, y-Achse = Bühnenmitte). Der Lichtstrahl von Scheinwerfer 1 geht durch die Punkte{' '}
                    <M>{'A(0 \\mid 1)'}</M> und <M>{'B(5 \\mid 5)'}</M>, der von Scheinwerfer 2 durch <M>{'C(-4 \\mid 6{,}2)'}</M> und <M>{'D(6 \\mid 2{,}2)'}</M>.
                  </p>
                  <p>Stelle beide Funktionsgleichungen auf und berechne, wo sich die Lichtstrahlen kreuzen. Halte deine Rechenwege schriftlich fest.</p>
                </>
              }
              fields={[
                { kind: 'num', key: 'm1', label: <>Strahl 1: <M>m</M> =</>, expected: 0.8 },
                { kind: 'num', key: 't1', label: <>Strahl 1: <M>t</M> =</>, expected: 1 },
                { kind: 'num', key: 'm2', label: <>Strahl 2: <M>m</M> =</>, expected: -0.4 },
                { kind: 'num', key: 't2', label: <>Strahl 2: <M>t</M> =</>, expected: 4.6 },
                { kind: 'num', key: 'x', label: <M>{'x_S ='}</M>, expected: 3 },
                { kind: 'num', key: 'y', label: <M>{'y_S ='}</M>, expected: 3.4 },
              ]}
              solution={
                <>
                  <MB>{'m_1 = \\frac{5 - 1}{5 - 0} = 0{,}8 \\qquad t_1 = 1 \\;(\\text{A liegt auf der y-Achse})'}</MB>
                  <MB>{'m_2 = \\frac{2{,}2 - 6{,}2}{6 - (-4)} = \\frac{-4}{10} = -0{,}4 \\qquad 2{,}2 = -0{,}4 \\cdot 6 + t_2 \\;\\Rightarrow\\; t_2 = 4{,}6'}</MB>
                  <MB>{'\\begin{aligned} 0{,}8x + 1 &= -0{,}4x + 4{,}6 && \\mid +0{,}4x \\\\ 1{,}2x + 1 &= 4{,}6 && \\mid -1 \\\\ 1{,}2x &= 3{,}6 && \\mid :1{,}2 \\\\ x &= 3 \\end{aligned}'}</MB>
                  <MB>{'y = 0{,}8 \\cdot 3 + 1 = 3{,}4 \\qquad \\Rightarrow \\qquad S(3 \\mid 3{,}4)'}</MB>
                  <p>Die Lichtstrahlen kreuzen sich 3 m rechts der Bühnenmitte in 3,4 m Höhe.</p>
                </>
              }
              help={
                <Hilfen
                  steps={[
                    <>
                      Zuerst die Steigung aus zwei Punkten: <M>{'m = \\frac{y_2 - y_1}{x_2 - x_1}'}</M>. Fällt dir bei Punkt A etwas auf?
                    </>,
                    <>
                      A liegt auf der y-Achse, also ist <M>{'t_1 = 1'}</M>. Bei Strahl 2 setzt du nach der Steigung einen Punkt ein, z. B. <M>{'D(6 \\mid 2{,}2)'}</M>, und löst
                      nach <M>t</M> auf.
                    </>,
                    <>
                      <M>{'f(x) = 0{,}8x + 1'}</M> und <M>{'g(x) = -0{,}4x + 4{,}6'}</M>. Gleichsetzen und zuerst <M>{'\\mid +0{,}4x'}</M> rechnen.
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
                  Zurück zur Lasershow: Damit niemand geblendet wird, sollen sich die Strahlen in <strong>2,5 m Höhe</strong> kreuzen. Der linke Strahl bleibt{' '}
                  <M>{'f(x) = -0{,}5x + 2'}</M>, der rechte Strahler bleibt in <M>{'R(5 \\mid 4)'}</M> und wird gedreht. An welcher Stelle liegt der neue Kreuzungspunkt, und
                  welche Steigung braucht der rechte Strahl? Halte deine Rechenwege schriftlich fest.
                </p>
              }
              fields={[
                { kind: 'num', key: 'x', label: <M>{'x_S ='}</M>, expected: -1 },
                { kind: 'num', key: 'm', label: <>Steigung <M>m</M> des rechten Strahls =</>, expected: 0.25 },
              ]}
              solution={
                <>
                  <p>Der Kreuzungspunkt liegt auf dem linken Strahl in 2,5 m Höhe:</p>
                  <MB>{'\\begin{aligned} -0{,}5x + 2 &= 2{,}5 && \\mid -2 \\\\ -0{,}5x &= 0{,}5 && \\mid :(-0{,}5) \\\\ x &= -1 \\end{aligned}'}</MB>
                  <p>
                    Der rechte Strahl muss durch <M>{'S(-1 \\mid 2{,}5)'}</M> und <M>{'R(5 \\mid 4)'}</M> gehen:
                  </p>
                  <MB>{'m = \\frac{4 - 2{,}5}{5 - (-1)} = \\frac{1{,}5}{6} = 0{,}25'}</MB>
                </>
              }
              help={
                <Hilfen
                  steps={[
                    <>Diesmal kennst du den y-Wert des Schnittpunkts schon. Auf welchem Strahl liegt er sicher?</>,
                    <>
                      Setze <M>{'f(x) = 2{,}5'}</M> und löse nach <M>x</M> auf. Dann kennst du einen zweiten Punkt des rechten Strahls.
                    </>,
                    <>
                      <M>{'x = -1'}</M>. Der rechte Strahl geht also durch <M>{'(-1 \\mid 2{,}5)'}</M> und <M>{'R(5 \\mid 4)'}</M>. Jetzt die Steigung aus zwei Punkten berechnen.
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
              topic="Schnittpunkt-Einstieg: Deutung im Bild (Basis)"
              title="Check 1: Was bedeutet der Schnittpunkt?"
              level="basis"
              prompt={
                <p>
                  Für die Lasershow gilt <M>{'S(0{,}5 \\mid 1{,}75)'}</M>. Die y-Achse ist die Pultmitte, die x-Achse der Boden. Was bedeutet das?
                </p>
              }
              options={[
                { text: 'Die Strahlen kreuzen sich 1,75 m rechts von der Pultmitte in 0,5 m Höhe.', feedback: 'Hier sind x und y vertauscht: Zuerst kommt der x-Wert (Stelle), dann der y-Wert (Höhe).' },
                { text: 'Die Strahlen kreuzen sich 0,5 m rechts von der Pultmitte in 1,75 m Höhe.', correct: true, feedback: 'x = 0,5 m ist die Stelle, y = 1,75 m die Höhe des Kreuzungspunkts.' },
                { text: 'Der linke Strahl ist über der Pultmitte 1,75 m hoch.', feedback: 'Über der Pultmitte (x = 0) ist der linke Strahl f(0) = 2 m hoch, das ist der y-Achsenabschnitt. Der Schnittpunkt liegt woanders.' },
                { text: 'Die Strahlen kreuzen sich über dem Pult, weil 0,5 fast 0 ist.', feedback: 'Das Pult reicht nur bis x = 0,4. Der Kreuzungspunkt bei 0,5 liegt 10 cm daneben.' },
              ]}
            />
            <TrackedMc
              topic="Schnittpunkt-Einstieg: Gleichsetzen (Standard)"
              title="Check 2: Schnittpunkt berechnen"
              level="standard"
              prompt={
                <>
                  <p>Berechne den Schnittpunkt der beiden Geraden. Halte deinen Rechenweg schriftlich fest und wähle dann die richtige Antwort aus.</p>
                  <MB>{'f(x) = 2x + 1 \\qquad g(x) = -x + 7'}</MB>
                </>
              }
              options={[
                { text: <M>{'x = 2'}</M>, feedback: 'Der x-Wert stimmt, aber ein Schnittpunkt hat zwei Koordinaten. Setze x = 2 noch in f(x) ein.' },
                { text: <M>{'S(5 \\mid 2)'}</M>, feedback: 'Die Zahlen stimmen, aber x und y sind vertauscht. Zuerst kommt der x-Wert.' },
                { text: <M>{'S(6 \\mid 13)'}</M>, feedback: 'Beim Umstellen ist ein Vorzeichen verloren gegangen: Aus 2x + 1 = −x + 7 wird mit +x die Gleichung 3x + 1 = 7.' },
                { text: <M>{'S(2 \\mid 5)'}</M>, correct: true, feedback: '2x + 1 = −x + 7 ergibt 3x = 6, also x = 2 und y = 2 · 2 + 1 = 5.' },
              ]}
            />
            <TrackedCheck
              topic="Schnittpunkt-Einstieg: Gleichsetzen (Erweiterung)"
              title="Check 3: Jetzt ganz allein"
              level="erweiterung"
              prompt={
                <>
                  <p>Berechne den Schnittpunkt durch Gleichsetzen. Halte deinen Rechenweg schriftlich fest.</p>
                  <MB>{'f(x) = 3x - 2 \\qquad g(x) = x + 4'}</MB>
                </>
              }
              fieldsRow
              fields={[
                { kind: 'num', key: 'x', label: <M>{'x_S ='}</M>, expected: 3 },
                { kind: 'num', key: 'y', label: <M>{'y_S ='}</M>, expected: 7 },
              ]}
              solution={
                <>
                  <MB>{'\\begin{aligned} 3x - 2 &= x + 4 && \\mid -x \\\\ 2x - 2 &= 4 && \\mid +2 \\\\ 2x &= 6 && \\mid :2 \\\\ x &= 3 \\end{aligned}'}</MB>
                  <MB>{'y = 3 \\cdot 3 - 2 = 7 \\qquad \\Rightarrow \\qquad S(3 \\mid 7)'}</MB>
                  <p>
                    Probe mit <M>{'g'}</M>: <M>{'3 + 4 = 7'}</M>. Stimmt!
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
            Weiter üben: Schnittpunkt berechnen (Einfach) <i className="fa-solid fa-arrow-right" aria-hidden="true" />
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
  const diffCm = Math.round(Math.abs(pred.x - XS) * 100)
  let verdict: ReactNode
  if (pred.choice === 'rechts') verdict = <>Das stimmt: Die Strahlen kreuzen sich knapp rechts neben dem Pult. Gut hingeschaut!</>
  else if (pred.choice === 'ueber')
    verdict = <>Knapp daneben. Im Bild sieht es fast so aus, als lägen sie über dem Pult. Erst genaues Rechnen zeigt: Der Kreuzungspunkt ist 10 cm rechts vom Pult.</>
  else verdict = <>Das stimmt nicht: Die Strahlen kreuzen sich rechts von der Pultmitte, nicht links davon.</>

  return (
    <div className="ls-back">
      <p>
        <strong>Du hattest vermutet:</strong> {CHOICE_TEXT[pred.choice]}, bei etwa x = {fmt(pred.x, 1)}.
      </p>
      <p>{verdict}</p>
      <p>
        Der Schnittpunkt liegt bei x = 0,5. {diffCm === 0 ? 'Deine Schätzung war genau richtig!' : `Deine Schätzung lag ${diffCm} cm daneben.`} Wie man ihn genau ausrechnet,
        siehst du jetzt.
      </p>
    </div>
  )
}

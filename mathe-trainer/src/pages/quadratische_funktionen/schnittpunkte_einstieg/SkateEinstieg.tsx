import { useId, type ChangeEvent, type ReactNode } from 'react'
import TaskShell from '../../../components/layout/TaskShell'
import { useSitzungState } from '../../../hooks/useSitzung'
import { Beispiel, M, MB, Merke, fmt } from '../../daten_und_zufall/lernpfad/kit'
import { CheckCard, ErklaerungCtx, Hilfen, Loesungsweg, McCard, TrackedCheck, TrackedMc, tx } from '../../lineare_funktionen/lernsituation_kit/kit'
import { Abschnitt, Aufklappbar, BeispielMitVideo, BonusSpiel, Handlungsprodukt, SeitenLernsituation, type Bildwelt, type Seite, type Thema } from '../../lineare_funktionen/lernsituation_kit/seiten'
import { Bilanz } from '../../lineare_funktionen/lernsituation_kit/punkte'
import { Kriterien, Vermutung, standardKriterien, type Festlegung } from '../../finanzmathe/zins_kit/zins_kit'
import SchrankenCheck from './SchrankenCheck'
import titelBild from './bilder/skate-titel.webp'
import spickzettelBild from './bilder/skate-spickzettel.webp'
import '../../daten_und_zufall/lernpfad/lernpfad.css'
import './skate.css'

// Lernsituation „Der Skatepark“: Schnittpunkte von Parabel und Gerade (ca. 60–90 min), Neuaufbau nach dem aktuellen Skill.
// Format Experimentierlabor: Beim Trick-Contest misst eine Lichtschranke, ob ein Sprung eine Linie kreuzt. Die Sprungbahn ist
// y = −0,25x² + x + 3, die Lichtschranke y = −0,5x + t (t = Höhe des Sensors am linken Pfosten).
// Problem erkennen: Festlegung (wie oft bei t = 4, bis zu welcher Sensorhöhe), dann mit dem Regler die Punkte zählen.
// Aha: Bei t = 5,25 sieht man nur ungefähr einen Punkt. Sicher entscheidet erst die Rechnung: Die Zahl unter der Wurzel ist 0.
// Problem lösen in zwei Teilen auf je einer eigenen Seite: Teil 1 Schnittpunkte für t = 5 (gleichsetzen, auf Null bringen,
// Mitternachtsformel, y-Werte: S₁(2 | 4), S₂(4 | 3)); Teil 2 t = 5,25 (Zahl unter der Wurzel 0, Berührpunkt B(3 | 3,75)), Zusammenhang
// Zahl unter der Wurzel ↔ Anzahl, Handlungsprodukt analog: Spickzettel (Karteikarte) „Schnittpunkte von Parabel und Gerade“, Rückbezug, Merke.
// Phase 4: Bedeutung der negativen Zahl unter der Wurzel, Wer hat recht? (immer zwei Schnittpunkte?), Schnittpunkte selbst berechnen,
// Profi: Ab welcher Sensorhöhe löst der Sprung nicht mehr aus? Bonus-Spiel „Schranken-Check“.
// Punkte nach Aufwand: Warm-up 2/2/3/4/2 = 13, Festlegung 3, Zählen 3, Teil 1 12, Teil 2 10, Zusammenhang 3, Spickzettel 5,
// Übungen 4/6/8, Profi 9 (Pflicht zusammen 69: Warm-up 19 %, Problem lösen 30 = 43 %, Übungen 18 = 26 %), Bonus-Spiel 4 Runden à 2.
// Identität: Themenfarbe Beere, Symbol fa-person-skating, Titelbild Plakat „Trick-Contest“, Leitobjekt die Lichtschranke.
// Bildwelt Siebdruck / dreifarbig: Titelbild und Spickzettel sind gerenderte WebP-Dateien aus bilder-quelle/skate-*.bild.html
// (Druckgänge in bilder-quelle/_siebdruck.js); das Skatepark-Bild mit Regler bleibt Inline-SVG.

/** Lernvideo aus den Übungsaufgaben „Schnittpunkte von Parabel und Gerade“ */
const VIDEO_SCHNITTPUNKTE = 'https://www.youtube.com/watch?v=l_TwKs9TWoA'

const THEMA: Thema = {
  name: 'Der Skatepark',
  farbe: 'beere',
  icon: 'fa-person-skating',
  bild: (
    <img
      src={titelBild}
      width={1200}
      height={600}
      alt="Plakat im Siebdruck-Stil: Trick-Contest. Wie oft kreuzt der Sprung die Lichtschranke? Von einer Rampe startet die Sprungbahn y = −0,25x² + x + 3, gestrichelt läuft die Lichtschranke y = −0,5x + t vom Sensor am Pfosten schräg nach unten."
    />
  ),
}
const BILDWELT: Bildwelt = { welt: 'siebdruck', variante: 'dreifarbig' }

/* ── Situation ───────────────────────────────────────────────────────────── */

// Seitenansicht des Skateparks, 1 LE = 1 m. Absprung von der 3 m hohen Rampe bei (0 | 3), Landung bei (6 | 0), höchster Punkt (2 | 4).
const p = (x: number) => -0.25 * x * x + x + 3
const g = (t: number) => (x: number) => -0.5 * x + t
/** Zahl unter der Wurzel in der Mitternachtsformel beim Gleichsetzen: −0,25x² + 1,5x + (3 − t) = 0 */
const wurzelterm = (t: number) => 5.25 - t
const T_TOUCH = 5.25
const T_MIN = 3
const T_MAX = 6.5

function schnitt(t: number): { x: number; y: number }[] {
  const d = wurzelterm(t)
  if (d < -1e-9) return []
  if (Math.abs(d) < 1e-9) return [{ x: 3, y: g(t)(3) }]
  const w = 2 * Math.sqrt(d)
  return [3 - w, 3 + w].map((x) => ({ x, y: g(t)(x) }))
}

type Wahl = 'null' | 'eins' | 'zwei'
const WAHL: Record<Wahl, string> = {
  null: 'Bei t = 4 löst der Sprung die Lichtschranke gar nicht aus.',
  eins: 'Bei t = 4 löst er sie genau einmal aus.',
  zwei: 'Bei t = 4 löst er sie zweimal aus.',
}

/* ── Sachbild: Skatepark von der Seite (Inline-SVG, ändert sich mit dem Regler) ─ */

const S = { w: 640, h: 330, l: 44, r: 14, t: 12, b: 34, xMin: -1, xMax: 9, yMin: -0.6, yMax: 7 }
const bx = (x: number) => S.l + ((x - S.xMin) / (S.xMax - S.xMin)) * (S.w - S.l - S.r)
const by = (y: number) => S.h - S.b - ((y - S.yMin) / (S.yMax - S.yMin)) * (S.h - S.t - S.b)
const PARABEL = Array.from({ length: 61 }, (_, i) => i / 10)
  .map((x) => `${bx(x)},${by(p(x))}`)
  .join(' ')

function SkateBild({ t, punkte = true, label }: { t: number; punkte?: boolean; label?: string }) {
  const clip = useId().replace(/[^a-zA-Z0-9]/g, '')
  const gt = g(t)
  const pts = schnitt(t)
  return (
    <div className="bk-graph ls-graph">
      <svg viewBox={`0 0 ${S.w} ${S.h}`} role="img" aria-label={label ?? `Seitenansicht des Skateparks mit der Sprungbahn als Parabel und der Lichtschranke als Gerade bei der Sensorhöhe ${fmt(t, 2)} m`}>
        <defs>
          <clipPath id={clip}>
            <rect x={bx(S.xMin)} y={S.t} width={bx(S.xMax) - bx(S.xMin)} height={by(S.yMin) - S.t} />
          </clipPath>
        </defs>
        <rect x={bx(S.xMin)} y={by(0)} width={bx(S.xMax) - bx(S.xMin)} height={by(S.yMin) - by(0)} fill="var(--surface-sunken)" />
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
        <line x1={bx(S.xMin)} x2={bx(S.xMax)} y1={by(0)} y2={by(0)} stroke="var(--ink)" strokeWidth="3" />
        <line x1={bx(0)} x2={bx(0)} y1={by(S.yMin)} y2={by(S.yMax)} stroke="var(--ink)" strokeWidth="1.5" />
        <text x={bx(S.xMax) - 4} y={by(S.yMax) + 14} textAnchor="end" fontSize="16" fill="var(--ink-muted)">
          x in m
        </text>
        <g clipPath={`url(#${clip})`}>
          <line x1={bx(0)} y1={by(gt(0))} x2={bx(S.xMax)} y2={by(gt(S.xMax))} stroke="var(--ink)" strokeWidth="3.5" strokeDasharray="10 5" />
          <polyline points={PARABEL} fill="none" stroke="var(--primary)" strokeWidth="4" strokeLinecap="round" />
        </g>
        <rect x={bx(-1)} y={by(3)} width={bx(0) - bx(-1)} height={by(0) - by(3)} fill="var(--surface-sunken)" stroke="var(--ink)" strokeWidth="2" />
        <text x={(bx(-1) + bx(0)) / 2 + 2} y={by(1.5)} textAnchor="middle" fontSize="15" fontWeight="700" fill="var(--ink)">
          Rampe
        </text>
        <line x1={bx(0)} y1={by(3)} x2={bx(0)} y2={by(t)} stroke="var(--ink)" strokeWidth="3" />
        <rect x={bx(0) - 9} y={by(t) - 12} width="18" height="24" rx="3" fill="var(--ink)" />
        <text x={bx(0) + 14} y={by(t) - 14} fontSize="17" fontWeight="700" fill="var(--ink)">
          Sensor
        </text>
        <text x={bx(4.7)} y={by(p(4.7)) - 14} fontSize="22" fontWeight="700" fill="var(--primary)">
          Sprungbahn
        </text>
        {punkte &&
          pts.map((q, i) => <circle key={i} cx={bx(q.x)} cy={by(q.y)} r="8" fill="var(--highlight)" stroke="var(--ink)" strokeWidth="2.5" />)}
      </svg>
    </div>
  )
}

/** Regler für die Sensorhöhe mit Bild und Anzeige der gemeinsamen Punkte */
function SensorRegler() {
  const id = useId()
  const [t, setT] = useSitzungState('sk-regler', 4)
  return (
    <div className="sk-regler">
      <SkateBild t={t} />
      <div className="ls-slider">
        <label htmlFor={id}>
          Sensorhöhe <M>t</M> = <span className="ls-slider-value">{fmt(t, 2)}</span> m
        </label>
        <input id={id} type="range" min={T_MIN} max={T_MAX} step={0.25} value={t} onChange={(e: ChangeEvent<HTMLInputElement>) => setT(Number(e.target.value))} />
      </div>
      <div className="sk-anzeige">
        <span>
          Lichtschranke: <M>{`y = -0{,}5x + ${tx(t)}`}</M>
        </span>
        <span>
          gelbe Punkte im Bild: <strong>{schnitt(t).length}</strong>
        </span>
      </div>
    </div>
  )
}

/* ── Rechenbeispiel (andere Zahlen) und Lösungswege ──────────────────────── */

const BSP_AUFGABE = (
  <p>
    Berechne die Schnittpunkte der Parabel <M>{'y = x^2 - 2x - 3'}</M> und der Geraden <M>{'y = x + 1'}</M>.
  </p>
)
const BSP_SCHRITTE: { title: ReactNode; body: ReactNode }[] = [
  {
    title: 'Die Terme gleichsetzen',
    body: (
      <>
        <p>Im Schnittpunkt haben Parabel und Gerade denselben x-Wert und denselben y-Wert:</p>
        <MB>{'x^2 - 2x - 3 = x + 1'}</MB>
      </>
    ),
  },
  {
    title: 'Auf Null bringen',
    body: (
      <>
        <MB>{'x^2 - 2x - 3 = x + 1 \\quad \\mid -x \\quad \\mid -1'}</MB>
        <MB>{'x^2 - 3x - 4 = 0'}</MB>
        <p>
          Jetzt kannst du ablesen: <M>{'a = 1'}</M>, <M>{'b = -3'}</M>, <M>{'c = -4'}</M>.
        </p>
      </>
    ),
  },
  {
    title: 'Mitternachtsformel',
    body: (
      <>
        <MB>{'x_{1,2} = \\dfrac{3 \\pm \\sqrt{(-3)^2 - 4 \\cdot 1 \\cdot (-4)}}{2 \\cdot 1} = \\dfrac{3 \\pm \\sqrt{25}}{2}'}</MB>
        <MB>{'x_1 = \\dfrac{3 + 5}{2} = 4'}</MB>
        <MB>{'x_2 = \\dfrac{3 - 5}{2} = -1'}</MB>
      </>
    ),
  },
  {
    title: 'y-Werte mit der Geraden',
    body: (
      <>
        <MB>{'x = 4{:}\\; y = 4 + 1 = 5'}</MB>
        <MB>{'x = -1{:}\\; y = -1 + 1 = 0'}</MB>
      </>
    ),
  },
  {
    title: 'Schnittpunkte angeben',
    body: <MB>{'S_1(4 \\mid 5) \\qquad S_2(-1 \\mid 0)'}</MB>,
  },
]

const LOESUNG1 = (
  <Loesungsweg
    schritte={[
      { titel: 'Die Terme gleichsetzen', tex: '-0{,}25x^2 + x + 3 = -0{,}5x + 5' },
      { titel: 'Auf Null bringen', tex: ['-0{,}25x^2 + x + 3 = -0{,}5x + 5 \\quad \\mid +0{,}5x \\quad \\mid -5', '-0{,}25x^2 + 1{,}5x - 2 = 0'] },
      { titel: <><M>a</M>, <M>b</M> und <M>c</M> notieren</>, tex: 'a = -0{,}25 \\qquad b = 1{,}5 \\qquad c = -2' },
      { titel: 'In die Mitternachtsformel einsetzen', tex: ['x_{1,2} = \\dfrac{-1{,}5 \\pm \\sqrt{1{,}5^2 - 4 \\cdot (-0{,}25) \\cdot (-2)}}{2 \\cdot (-0{,}25)}', 'x_{1,2} = \\dfrac{-1{,}5 \\pm \\sqrt{0{,}25}}{-0{,}5}'] },
      { titel: <><M>{'x_1'}</M> und <M>{'x_2'}</M> berechnen</>, tex: ['x_1 = \\dfrac{-1{,}5 + 0{,}5}{-0{,}5} = 2', 'x_2 = \\dfrac{-1{,}5 - 0{,}5}{-0{,}5} = 4'] },
      { titel: 'y-Werte mit der Geraden', tex: ['y_1 = -0{,}5 \\cdot 2 + 5 = 4', 'y_2 = -0{,}5 \\cdot 4 + 5 = 3'] },
      { titel: 'Schnittpunkte angeben', tex: ['S_1(2 \\mid 4)', 'S_2(4 \\mid 3)'], text: 'Bei einem Sensor in 5 m Höhe kreuzt der Sprung die Lichtschranke zweimal.' },
    ]}
  />
)

const LOESUNG2 = (
  <Loesungsweg
    schritte={[
      { titel: 'Die Terme gleichsetzen', tex: '-0{,}25x^2 + x + 3 = -0{,}5x + 5{,}25' },
      { titel: 'Auf Null bringen', tex: ['-0{,}25x^2 + x + 3 = -0{,}5x + 5{,}25 \\quad \\mid +0{,}5x \\quad \\mid -5{,}25', '-0{,}25x^2 + 1{,}5x - 2{,}25 = 0'] },
      { titel: 'Zahl unter der Wurzel', tex: '1{,}5^2 - 4 \\cdot (-0{,}25) \\cdot (-2{,}25) = 2{,}25 - 2{,}25 = 0' },
      { titel: 'Mitternachtsformel', tex: 'x = \\dfrac{-1{,}5 \\pm 0}{-0{,}5} = 3', text: 'Das ± ändert nichts, es bleibt eine einzige Lösung.' },
      { titel: 'y-Wert mit der Geraden', tex: 'y = -0{,}5 \\cdot 3 + 5{,}25 = 3{,}75' },
      { titel: 'Berührpunkt angeben', tex: 'B(3 \\mid 3{,}75)' },
    ]}
  />
)

/* ── Seite ───────────────────────────────────────────────────────────────── */

export default function SkateEinstieg({ erklaerung, onBack, onPractice }: { erklaerung: ReactNode; onBack: () => void; onPractice: () => void }) {
  const [fest, setFest] = useSitzungState<Festlegung<Wahl>>('sk-fest', { wahl: null, wert: 4.5, fest: false })
  const [geloest, setGeloest] = useSitzungState('sk-geloest', false)
  const [uebungen, setUebungen] = useSitzungState<string[]>('sk-uebungen', [])
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
          <p className="sl-text">Diese fünf kurzen Aufgaben brauchst du gleich. Einzelarbeit, ca. 10 Minuten.</p>
          <CheckCard
            onSolved={fertig.teil('a')}
            punkte={2}
            title="a) Punktprobe bei einer Parabel"
            prompt={
              <p>
                Liegt der Punkt <M>{'P(2 \\mid 4)'}</M> auf der Parabel <M>{'y = -0{,}25x^2 + x + 3'}</M>?
              </p>
            }
            fields={[{ kind: 'select', key: 'p', label: 'P liegt …', options: ['nicht auf der Parabel', 'auf der Parabel'], expected: 1 }]}
            solution={
              <Loesungsweg
                schritte={[
                  { titel: <><M>{'x = 2'}</M> einsetzen</>, tex: 'y = -0{,}25 \\cdot 2^2 + 2 + 3 = 4' },
                  { titel: 'Mit dem y-Wert vergleichen', tex: '4 = 4', text: 'P liegt auf der Parabel.' },
                ]}
              />
            }
          />
          <CheckCard
            onSolved={fertig.teil('b')}
            punkte={2}
            title="b) y-Wert einer Geraden"
            prompt={
              <p>
                Gerade <M>{'y = -0{,}5x + 5'}</M>. Berechne den y-Wert an der Stelle <M>{'x = 4'}</M>.
              </p>
            }
            fields={[{ kind: 'num', key: 'y', label: <M>{'y ='}</M>, expected: 3 }]}
            solution={<MB>{'x = 4{:}\\quad y = -0{,}5 \\cdot 4 + 5 = 3'}</MB>}
          />
          <CheckCard
            onSolved={fertig.teil('c')}
            punkte={3}
            title="c) Auf Null bringen"
            prompt={<p>Bringe alles auf die linke Seite, sodass rechts 0 steht. Trage die Zahlen mit Vorzeichen ein.</p>}
            rechnung={[
              { l: ['x^2 + 1'], r: ['2x + 4'], u: '\\mid -2x \\quad \\mid -4' },
              { l: ['x^2', { luecke: 'b' }, 'x', { luecke: 'c' }], r: ['0'] },
            ]}
            fields={[
              { kind: 'num', key: 'b', label: 'Zahl vor x mit Vorzeichen', expected: -2 },
              { kind: 'num', key: 'c', label: 'Zahl ohne x mit Vorzeichen', expected: -3 },
            ]}
            solution={
              <Loesungsweg
                schritte={[
                  { titel: <>Auf beiden Seiten <M>{'-2x'}</M> und <M>{'-4'}</M></>, tex: 'x^2 + 1 - 2x - 4 = 0' },
                  { titel: 'Zusammenfassen', tex: 'x^2 - 2x - 3 = 0' },
                ]}
              />
            }
          />
          <CheckCard
            onSolved={fertig.teil('d')}
            punkte={4}
            title="d) Mitternachtsformel"
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
              <Loesungsweg
                schritte={[
                  { titel: <><M>a</M>, <M>b</M> und <M>c</M> notieren</>, tex: 'a = 1 \\qquad b = -6 \\qquad c = 8' },
                  { titel: 'In die Formel einsetzen', tex: ['x_{1,2} = \\dfrac{6 \\pm \\sqrt{36 - 32}}{2}', 'x_{1,2} = \\dfrac{6 \\pm 2}{2}'] },
                  { titel: 'Beide Lösungen', tex: ['x_1 = \\dfrac{6 - 2}{2} = 2', 'x_2 = \\dfrac{6 + 2}{2} = 4'] },
                ]}
              />
            }
          />
          <McCard
            onSolved={fertig.teil('e')}
            punkte={2}
            title="e) Wenn die Wurzel nicht geht"
            prompt={
              <p>
                Du löst <M>{'x^2 + 2x + 5 = 0'}</M>. Unter der Wurzel steht <M>{'2^2 - 4 \\cdot 1 \\cdot 5'}</M>. Was ergibt sich?
              </p>
            }
            options={[
              { text: 'Zwei Lösungen, denn man rechnet mit √16 = 4.', feedback: 'Unter der Wurzel steht 4 − 20 = −16, nicht +16. Das Vorzeichen ist entscheidend.' },
              { text: 'Eine Lösung x = −1.', feedback: 'Nur wenn unter der Wurzel genau 0 steht, bleibt eine Lösung übrig. Hier steht −16.' },
              { text: 'Keine Lösung, denn unter der Wurzel steht −16.', correct: true, feedback: 'Aus einer negativen Zahl kann man keine Wurzel ziehen, also gibt es keine Lösung.' },
              { text: 'Zwei Lösungen, eine positive und eine negative.', feedback: 'Das ± liefert nur zwei Lösungen, wenn die Wurzel ausgerechnet werden kann. Bei −16 geht das nicht.' },
            ]}
          />
        </>
      ),
    },
    {
      art: 'problem',
      titel: 'Der Trick-Contest im Skatepark',
      pflicht: ['fest', 'zaehlen'],
      inhalt: (fertig) => (
        <>
          <p className="sl-text">
            Beim Trick-Contest im Skatepark misst eine Lichtschranke, ob ein Sprung eine bestimmte Linie kreuzt. Die Wertung zählt jeden Punkt, an dem die Sprungbahn die
            Linie der Lichtschranke kreuzt. Der Sprung startet von einer 3 m hohen Rampe bei <M>{'x = 0'}</M> und landet bei <M>{'x = 6'}</M> (1 Kästchen = 1 m).
          </p>
          <p className="sl-text">
            Gegeben sind die Sprungbahn <M>{'y = -0{,}25x^2 + x + 3'}</M> und die Lichtschranke <M>{'y = -0{,}5x + t'}</M>. <M>t</M> ist die Höhe des Sensors am linken
            Pfosten. Gesucht ist, wie oft der Sprung die Lichtschranke kreuzt und bis zu welcher Sensorhöhe das überhaupt passiert.
          </p>
          <div className="sl-fokus">
            <p className="sl-fokus-titel">Dein Auftrag: Erst festlegen, dann ausprobieren</p>
            <p>Lege dich fest, ohne zu rechnen. Stelle dann den Sensor mit dem Regler auf verschiedene Höhen und zähle die gemeinsamen Punkte.</p>
          </div>
          <p className="sl-hinweis">Einzel- oder Partnerarbeit, ca. 10 Minuten.</p>
          <SkateBild t={4} punkte={false} label="Seitenansicht des Skateparks: Sprungbahn von der Rampe und Lichtschranke bei der Sensorhöhe 4 m, ohne markierte Punkte" />
          <Vermutung
            optionen={WAHL}
            regler={{
              min: T_MIN,
              max: T_MAX,
              step: 0.25,
              text: (v) => (
                <>
                  Ich schätze: Bis zur Sensorhöhe <M>t</M> ≈ <span className="ls-slider-value">{fmt(v, 2)}</span> m löst der Sprung die Schranke noch aus.
                </>
              ),
            }}
            wert={fest}
            onChange={setFest}
            onFest={fertig.teil('fest')}
            gespeichert={(w) => (
              <>
                <strong>{w.wahl ? WAHL[w.wahl] : ''}</strong> Deine Schätzung: bis <M>t</M> ≈ {fmt(w.wert, 2)} m.
              </>
            )}
          />
          {fest.fest && (
            <Abschnitt titel="Den Sensor verschieben und Punkte zählen">
              <SensorRegler />
              <CheckCard
                onSolved={fertig.teil('zaehlen')}
                punkte={3}
                rechnen={false}
                title="Punkte zählen"
                prompt={<p>Wie viele gemeinsame Punkte haben Sprungbahn und Lichtschranke bei diesen Sensorhöhen? Stelle den Regler jeweils auf die Höhe und zähle.</p>}
                fieldsRow
                fields={[
                  { kind: 'num', key: 't3', label: <M>{'t = 3{:}'}</M>, expected: 2 },
                  { kind: 'num', key: 't5', label: <M>{'t = 5{:}'}</M>, expected: 2 },
                  { kind: 'num', key: 't525', label: <M>{'t = 5{,}25{:}'}</M>, expected: 1 },
                  { kind: 'num', key: 't6', label: <M>{'t = 6{:}'}</M>, expected: 0 },
                ]}
                help={
                  <Hilfen
                    steps={[
                      <>Zähle nur die gelben Punkte, in denen die Sprungbahn und die gestrichelte Linie zusammentreffen.</>,
                      <>
                        Bei <M>{'t = 3'}</M> startet die Linie im Absprungpunkt <M>{'(0 \\mid 3)'}</M> und endet im Landepunkt <M>{'(6 \\mid 0)'}</M>: zwei Punkte.
                      </>,
                      <>Bei 5,25 m siehst du nur einen Punkt, bei 6 m liegt die Schranke über der ganzen Sprungbahn.</>,
                    ]}
                  />
                }
              />
              <p className="sl-hinweis">
                Bei 5,25 m sieht man nur ungefähr einen Punkt. Ob die Schranke die Bahn dort wirklich nur berührt, zeigt erst die Rechnung. Gleich lernst du, wie du die
                Punkte genau berechnest.
              </p>
            </Abschnitt>
          )}
        </>
      ),
    },
    {
      art: 'loesen',
      titel: 'Teil 1: Die Schnittpunkte für t = 5',
      bedingung: 'Berechne beide Schnittpunkte richtig, dann geht es zu Teil 2.',
      inhalt: (fertig) => (
        <>
          <p className="sl-hinweis">Einzelarbeit, ca. 20 Minuten.</p>
          <div className="sl-fokus">
            <p className="sl-fokus-titel">Deine Aufgabe: Berechne, wo der Sprung die Lichtschranke kreuzt</p>
            <p>
              Der Sensor steht in 5 m Höhe. Sprungbahn: <M>{'y = -0{,}25x^2 + x + 3'}</M>, Lichtschranke: <M>{'y = -0{,}5x + 5'}</M>. Berechne in deinem Heft beide
              Schnittpunkte <M>{'S_1'}</M> und <M>{'S_2'}</M>: Terme gleichsetzen, auf Null bringen, Mitternachtsformel, y-Werte.
            </p>
          </div>
          <SkateBild t={5} punkte={false} label="Seitenansicht des Skateparks mit der Sprungbahn und der Lichtschranke bei der Sensorhöhe 5 m" />
          <BeispielMitVideo video={VIDEO_SCHNITTPUNKTE} videoTitel="Lernvideo: Schnittpunkte von Parabel und Gerade">
            <Beispiel offen title="Parabel und Gerade mit anderen Zahlen" aufgabe={BSP_AUFGABE} steps={BSP_SCHRITTE} />
          </BeispielMitVideo>
          <Abschnitt titel="Vergleiche deine Ergebnisse">
            <CheckCard
              onSolved={fertig}
              punkte={12}
              title="Die Schnittpunkte bei t = 5"
              prompt={<p>Trage die Ergebnisse aus deinem Heft ein. Jedes Feld zeigt dir sofort, ob es stimmt.</p>}
              fieldsRow
              fields={[
                { kind: 'num', key: 'x1', label: <>kleinere Lösung <M>{'x_1 ='}</M></>, expected: 2 },
                { kind: 'num', key: 'y1', label: <M>{'y_1 ='}</M>, expected: 4 },
                { kind: 'num', key: 'x2', label: <>größere Lösung <M>{'x_2 ='}</M></>, expected: 4 },
                { kind: 'num', key: 'y2', label: <M>{'y_2 ='}</M>, expected: 3 },
              ]}
              loesungNachFehler
              solution={LOESUNG1}
              help={
                <Hilfen
                  steps={[
                    <>Wie im Rechenbeispiel: Zuerst die beiden Terme gleichsetzen und alles auf eine Seite bringen, sodass rechts 0 steht.</>,
                    <>
                      Addiere auf beiden Seiten <M>{'0{,}5x'}</M> und ziehe 5 ab. Fasse zusammen: <M>{'x + 0{,}5x'}</M> und <M>{'3 - 5'}</M>.
                    </>,
                    <>
                      Es entsteht <M>{'-0{,}25x^2 + 1{,}5x - 2 = 0'}</M>. Setze in die Formel ein, mit Klammern bei negativen Zahlen. Die y-Werte rechnest du mit der Geraden aus.
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
      titel: 'Teil 2: Genau ein Punkt bei t = 5,25?',
      pflicht: ['teil2', 'zusammenhang', 'produkt'],
      inhalt: (fertig) => (
        <>
          <p className="sl-hinweis">Einzel- oder Partnerarbeit, ca. 20 Minuten.</p>
          <div className="sl-fokus">
            <p className="sl-fokus-titel">Deine Aufgabe: Prüfe rechnerisch, ob es nur einen Punkt gibt</p>
            <p>
              Mit dem Regler hast du bei <M>{'t = 5{,}25'}</M> nur einen Punkt gesehen. Rechne mit <M>{'y = -0{,}25x^2 + x + 3'}</M> und <M>{'y = -0{,}5x + 5{,}25'}</M>{' '}
              genauso wie in Teil 1. Achte darauf, was in der Mitternachtsformel unter der Wurzel herauskommt.
            </p>
          </div>
          <SkateBild t={5.25} punkte={false} label="Seitenansicht des Skateparks mit der Sprungbahn und der Lichtschranke bei der Sensorhöhe 5,25 m" />
          <BeispielMitVideo>
            <Beispiel offen title="Parabel und Gerade mit anderen Zahlen" aufgabe={BSP_AUFGABE} steps={BSP_SCHRITTE} />
          </BeispielMitVideo>
          <Abschnitt titel="Vergleiche deine Ergebnisse">
            <CheckCard
              onSolved={() => {
                fertig.teil('teil2')()
                setGeloest(true)
              }}
              punkte={10}
              title="Der Berührpunkt"
              prompt={<p>Trage die Ergebnisse aus deinem Heft ein. Jedes Feld zeigt dir sofort, ob es stimmt.</p>}
              fieldsRow
              fields={[
                { kind: 'num', key: 'u', label: 'Welche Zahl steht unter der Wurzel?', expected: 0 },
                { kind: 'num', key: 'x', label: <>Berührpunkt <M>{'x ='}</M></>, expected: 3 },
                { kind: 'num', key: 'y', label: <M>{'y ='}</M>, expected: 3.75 },
              ]}
              loesungNachFehler
              solution={LOESUNG2}
              help={
                <Hilfen
                  steps={[
                    <>Gleichsetzen und auf Null bringen wie in Teil 1, nur mit 5,25 statt 5.</>,
                    <>
                      Es entsteht <M>{'-0{,}25x^2 + 1{,}5x - 2{,}25 = 0'}</M>. Rechne zuerst nur die Zahl unter der Wurzel aus: <M>{'b^2 - 4ac'}</M>.
                    </>,
                    <>
                      <M>{'1{,}5^2 - 4 \\cdot (-0{,}25) \\cdot (-2{,}25) = 2{,}25 - 2{,}25'}</M>. Dann <M>{'x = \\dfrac{-1{,}5}{-0{,}5}'}</M>.
                    </>,
                  ]}
                />
              }
            />
          </Abschnitt>
          <Abschnitt titel="Zusammenhang entdecken">
            <McCard
              onSolved={fertig.teil('zusammenhang')}
              punkte={3}
              title="Was entscheidet über die Anzahl?"
              prompt={
                <p>
                  Bei <M>{'t = 5'}</M> stand unter der Wurzel <M>{'0{,}25'}</M>, bei <M>{'t = 5{,}25'}</M> genau 0. Bei <M>{'t = 6'}</M> gibt es keinen Punkt. Was entscheidet in der
                  Mitternachtsformel, ob es zwei, einen oder keinen Schnittpunkt gibt?
                </p>
              }
              options={[
                { text: 'Der Wert von a: Ist a negativ, gibt es immer zwei Lösungen.', feedback: 'a ist in allen Rechnungen −0,25 und trotzdem ändert sich die Anzahl der Punkte.' },
                { text: 'Der Nenner 2a: Nur wenn er ganzzahlig ist, gibt es Lösungen.', feedback: 'Der Nenner ist hier −0,5 und es gibt trotzdem Lösungen.' },
                {
                  text: 'Die Zahl unter der Wurzel: positiv heißt zwei, 0 heißt einer, negativ heißt kein Schnittpunkt.',
                  correct: true,
                  feedback: 'Genau. Bei √0 fällt das ± weg, und bei einer negativen Zahl lässt sich die Wurzel nicht ziehen.',
                },
                { text: 'Nichts: Eine Gleichung hat immer genau zwei Lösungen.', feedback: 'Bei einer negativen Zahl unter der Wurzel gibt es keine Lösung, bei 0 nur eine.' },
              ]}
            />
          </Abschnitt>
          <Handlungsprodukt titel="Spickzettel „Schnittpunkte von Parabel und Gerade“">
            <figure className="sl-foto sl-foto-klein">
              <img
                src={spickzettelBild}
                width={800}
                height={400}
                alt="Plakat im Siebdruck-Stil: Schnittpunkte 2, 1, 0. Drei kleine Skizzen: Die Gerade schneidet die Parabel zweimal (Wurzel größer 0), berührt sie (Wurzel gleich 0) und verfehlt sie (Wurzel kleiner 0)."
              />
            </figure>
            <p className="sl-text">
              Gestalte in deinem Heft oder auf einer Karteikarte einen Spickzettel „Schnittpunkte von Parabel und Gerade“: die Rechenschritte, drei kleine Skizzen (zwei, ein,
              kein Schnittpunkt) und deine Rechnung für <M>{'t = 5'}</M> als Beispiel.
            </p>
            <Aufklappbar label="Satzanfänge ansehen" icon="fa-comment-dots">
              <ul className="zk-liste">
                <li>„Im Schnittpunkt sind die y-Werte gleich, deshalb setze ich …“</li>
                <li>„Ich bringe alles auf eine Seite, bis rechts … steht.“</li>
                <li>„Unter der Wurzel steht eine positive Zahl / 0 / eine negative Zahl, also …“</li>
                <li>„Die y-Werte berechne ich mit der Geradengleichung, weil …“</li>
              </ul>
            </Aufklappbar>
          </Handlungsprodukt>
          <Abschnitt titel="Ist dein Spickzettel vollständig?">
            <Kriterien onAlle={fertig.teil('produkt')} items={standardKriterien()} />
          </Abschnitt>
          {geloest && (
            <Abschnitt titel="Das hältst du fest">
              <Rueckbezug fest={fest} />
              <Merke title="Schnittpunkte von Parabel und Gerade">
                <p>
                  Eine Parabel und eine Gerade haben <strong>höchstens zwei</strong> gemeinsame Punkte.
                </p>
                <ol>
                  <li>Die Terme gleichsetzen und alles auf eine Seite bringen, bis rechts 0 steht.</li>
                  <li>
                    Mit der Mitternachtsformel die x-Werte berechnen. Die Zahl unter der Wurzel entscheidet: positiv heißt zwei Schnittpunkte, 0 heißt ein Berührpunkt, negativ
                    heißt kein Schnittpunkt.
                  </li>
                  <li>Die y-Werte mit der Geradengleichung berechnen und die Punkte angeben.</li>
                </ol>
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
            Prüfe und vertiefe dein Wissen mit drei Aufgaben, die vierte ist für Profis. Wenn du die drei Pflichtaufgaben gelöst hast, wartet unten ein Spiel auf dich. Einzelarbeit,
            ca. 20 Minuten.
          </p>
          <Abschnitt titel="Übung 1: Was bedeutet das Ergebnis?">
            <TrackedMc
              topic="Schnittpunkte Parabel und Gerade (Lernsituation, Basis)"
              onSolved={uebung('1', fertig.teil('1'))}
              punkte={4}
              title="Übung 1"
              level="basis"
              prompt={<p>Du setzt eine Parabel und eine Gerade gleich und bringst alles auf eine Seite. Unter der Wurzel steht <M>{'-3'}</M>. Was bedeutet das?</p>}
              options={[
                { text: 'Es gibt zwei Schnittpunkte, weil die Zahl 3 vorkommt.', feedback: 'Nicht die Zahl 3 zählt, sondern das Vorzeichen der Zahl unter der Wurzel.' },
                { text: 'Man hat sich verrechnet, unter der Wurzel darf nie etwas Negatives stehen.', feedback: 'Das kann vorkommen. Dann haben Parabel und Gerade keinen gemeinsamen Punkt.' },
                { text: 'Es gibt keinen Schnittpunkt.', correct: true, feedback: 'Aus einer negativen Zahl gibt es keine Wurzel, also keine x-Werte und keinen Schnittpunkt.' },
                { text: 'Es gibt genau einen Schnittpunkt bei x = −3.', feedback: 'Die −3 unter der Wurzel ist kein x-Wert. Einen Berührpunkt gäbe es nur bei 0.' },
              ]}
            />
          </Abschnitt>
          <Abschnitt titel="Übung 2: Wer hat recht?">
            <TrackedMc
              topic="Schnittpunkte Parabel und Gerade (Lernsituation, Standard)"
              onSolved={uebung('2', fertig.teil('2'))}
              punkte={6}
              title="Übung 2"
              level="standard"
              rechnen
              prompt={
                <p>
                  Parabel <M>{'y = x^2'}</M> und Gerade <M>{'y = 2x - 1'}</M>. Mia sagt: „Eine Gerade und eine Parabel schneiden sich immer zweimal.“ Leon sagt: „Hier ist es nur
                  ein Punkt.“ Rechne nach und wähle die richtige Aussage.
                </p>
              }
              options={[
                { text: 'Mia hat recht: Es gibt zwei Schnittpunkte, x = 1 und x = −1.', feedback: 'Aus x² = 2x − 1 wird x² − 2x + 1 = 0. Unter der Wurzel steht 4 − 4 = 0, also nur eine Lösung.' },
                { text: 'Beide haben unrecht: Es gibt keinen Schnittpunkt, weil unter der Wurzel 0 steht.', feedback: 'Die Wurzel aus 0 ist 0. Dann bleibt genau eine Lösung.' },
                { text: 'Leon hat recht: Es gibt genau einen Schnittpunkt S(1 | 1).', correct: true, feedback: 'x = (2 ± √0) : 2 = 1 und y = 2 · 1 − 1 = 1. Die Gerade berührt die Parabel in S(1 | 1).' },
                { text: 'Leon hat recht, der Schnittpunkt ist x = 1.', feedback: 'Der x-Wert stimmt, aber ein Punkt hat zwei Koordinaten. Setze x = 1 noch in die Gerade ein.' },
              ]}
            />
          </Abschnitt>
          <Abschnitt titel="Übung 3: Jetzt ganz allein">
            <TrackedCheck
              topic="Schnittpunkte Parabel und Gerade (Lernsituation, Erweiterung)"
              onSolved={uebung('3', fertig.teil('3'))}
              punkte={8}
              title="Übung 3"
              level="erweiterung"
              prompt={
                <p>
                  Berechne die Schnittpunkte der Parabel <M>{'y = 0{,}5x^2 - 2x + 1'}</M> und der Geraden <M>{'y = 0{,}5x - 2'}</M>.
                </p>
              }
              fieldsRow
              fields={[
                { kind: 'num', key: 'x1', label: <>kleinere Lösung <M>{'x_1 ='}</M></>, expected: 2 },
                { kind: 'num', key: 'y1', label: <M>{'y_1 ='}</M>, expected: -1 },
                { kind: 'num', key: 'x2', label: <>größere Lösung <M>{'x_2 ='}</M></>, expected: 3 },
                { kind: 'num', key: 'y2', label: <M>{'y_2 ='}</M>, expected: -0.5 },
              ]}
              solution={
                <Loesungsweg
                  schritte={[
                    { titel: 'Gleichsetzen und auf Null bringen', tex: ['0{,}5x^2 - 2x + 1 = 0{,}5x - 2 \\quad \\mid -0{,}5x \\quad \\mid +2', '0{,}5x^2 - 2{,}5x + 3 = 0'] },
                    { titel: 'Mitternachtsformel', tex: ['x_{1,2} = \\dfrac{2{,}5 \\pm \\sqrt{(-2{,}5)^2 - 4 \\cdot 0{,}5 \\cdot 3}}{2 \\cdot 0{,}5}', 'x_{1,2} = 2{,}5 \\pm 0{,}5'] },
                    { titel: <><M>{'x_1'}</M> und <M>{'x_2'}</M></>, tex: ['x_1 = 2', 'x_2 = 3'] },
                    { titel: 'y-Werte mit der Geraden', tex: ['y_1 = 0{,}5 \\cdot 2 - 2 = -1', 'y_2 = 0{,}5 \\cdot 3 - 2 = -0{,}5'] },
                    { titel: 'Schnittpunkte angeben', tex: ['S_1(2 \\mid -1)', 'S_2(3 \\mid -0{,}5)'] },
                  ]}
                />
              }
              help={
                <Hilfen
                  steps={[
                    <>Zuerst gleichsetzen und alles auf eine Seite bringen, sodass rechts 0 steht.</>,
                    <>
                      Ziehe <M>{'0{,}5x'}</M> ab und addiere 2. Es entsteht <M>{'0{,}5x^2 - 2{,}5x + 3 = 0'}</M>.
                    </>,
                    <>Setze in die Mitternachtsformel ein. Die y-Werte rechnest du mit der Geraden aus.</>,
                  ]}
                />
              }
            />
          </Abschnitt>
          <Abschnitt titel="Übung 4 für Profis: Ab wann löst der Sprung nicht mehr aus?">
            <CheckCard
              profi
              punkte={9}
              title="Übung 4"
              level="erweiterung"
              prompt={
                <p>
                  Beim Gleichsetzen von Sprungbahn und Lichtschranke entsteht <M>{'-0{,}25x^2 + 1{,}5x + (3 - t) = 0'}</M>. Für welche Sensorhöhe <M>t</M> steht unter der Wurzel genau
                  0? Ab dieser Höhe löst der Sprung nicht mehr zweimal aus.
                </p>
              }
              fields={[{ kind: 'num', key: 't', label: <M>{'t ='}</M>, expected: T_TOUCH, unit: 'm' }]}
              solution={
                <Loesungsweg
                  schritte={[
                    { titel: 'Zahl unter der Wurzel aufstellen', tex: ['1{,}5^2 - 4 \\cdot (-0{,}25) \\cdot (3 - t) = 0', '2{,}25 + (3 - t) = 0'] },
                    { titel: <>Nach <M>t</M> auflösen</>, tex: ['5{,}25 - t = 0 \\quad \\mid +t', 't = 5{,}25'], text: 'Bei 5,25 m berührt die Schranke die Bahn nur, darüber gibt es keinen Schnittpunkt.' },
                  ]}
                />
              }
              help={
                <Hilfen
                  steps={[
                    <>Lies ab: <M>{'a = -0{,}25'}</M>, <M>{'b = 1{,}5'}</M>, <M>{'c = 3 - t'}</M>.</>,
                    <>
                      Setze in <M>{'b^2 - 4ac = 0'}</M> ein: <M>{'1{,}5^2 - 4 \\cdot (-0{,}25) \\cdot (3 - t) = 0'}</M>.
                    </>,
                    <>
                      <M>{'-4 \\cdot (-0{,}25) = 1'}</M>, also <M>{'2{,}25 + 3 - t = 0'}</M>.
                    </>,
                  ]}
                />
              }
            />
          </Abschnitt>
          <BonusSpiel frei={uebungen.length === 3} titel="Schranken-Check">
            <SchrankenCheck />
          </BonusSpiel>
          <Bilanz />
          <div className="sl-ende">
            <p>Du kannst jetzt die Schnittpunkte von Parabel und Gerade berechnen und an der Zahl unter der Wurzel erkennen, wie viele es gibt.</p>
            <div className="bk-actions">
              <button type="button" className="bk-btn" onClick={onBack}>
                <i className="fa-solid fa-arrow-left" aria-hidden="true" /> Zurück zur Auswahl
              </button>
              <button type="button" className="bk-btn bk-btn-primary" onClick={onPractice}>
                Weiter üben: Schnittpunkte berechnen <i className="fa-solid fa-arrow-right" aria-hidden="true" />
              </button>
            </div>
          </div>
        </>
      ),
    },
  ]

  return (
    <ErklaerungCtx.Provider value={erklaerung}>
      <TaskShell title="Schnittpunkte: Der Skatepark" width="wide" kompakt parent={{ to: '/quadratische_funktionen/schnittpunkte', label: 'Schnittpunkte von Parabel und Gerade' }}>
        <SeitenLernsituation
          ruhig
          punkte
          thema={THEMA}
          bildwelt={BILDWELT}
          ziel={<>Du bist beim Trick-Contest im Skatepark. Du lernst, die Schnittpunkte von Parabel und Gerade zu berechnen und zu erkennen, wie viele es gibt.</>}
          seiten={seiten}
        />
      </TaskShell>
    </ErklaerungCtx.Provider>
  )
}

/** Rückbezug auf die Festlegung aus „Problem erkennen“ */
function Rueckbezug({ fest }: { fest: Festlegung<Wahl> }) {
  const diff = Math.abs(fest.wert - T_TOUCH)
  return (
    <div className="ls-back">
      <p>
        <strong>Du hattest vermutet:</strong> {fest.wahl ? WAHL[fest.wahl] : 'keine Wahl'} Bis <M>t</M> ≈ {fmt(fest.wert, 2)} m wird die Schranke ausgelöst.
      </p>
      <p>
        Bei <M>{'t = 4'}</M> gibt es zwei Schnittpunkte. Die größte Sensorhöhe mit Auslösung ist <M>{'t = 5{,}25'}</M>: Dort steht unter der Wurzel genau 0, die Schranke berührt
        die Bahn nur einmal. {diff < 1e-9 ? 'Deine Schätzung war genau richtig!' : `Deine Schätzung lag ${fmt(diff, 2)} m daneben.`}
      </p>
    </div>
  )
}


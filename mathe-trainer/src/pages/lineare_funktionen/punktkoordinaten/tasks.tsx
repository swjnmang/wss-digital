import { useRef, useState } from 'react'
import { X_COL, Y_COL, dropLines, originPath } from '../../../components/CoordSystem'
import type { Pt, Segment, SysPoint } from '../../../components/CoordSystem'
import {
  CoordSystem,
  InputTask,
  LETTERS,
  M,
  McTask,
  NAMES,
  PlotTask,
  Way,
  coordTex,
  named,
  pick,
  plain,
  randPoint,
  shuffle,
  stepsX,
  stepsY,
} from './shared'
import type { InputCfg, Level, McCfg, McOption, Result, TaskProps } from './shared'

// Aufgaben-Generatoren und die Zuordnung "Aufgabenart -> Komponente".

export type Kind =
  | 'read'
  | 'plot'
  | 'axisPlot'
  | 'whichSystem'
  | 'whichCoords'
  | 'quadrant'
  | 'axisWhich'
  | 'axisValue'
  | 'error'
  | 'mapRead'
  | 'mapWhich'
  | 'walk'

const TOPIC: Record<Kind, string> = {
  read: 'Punktkoordinaten – Ablesen',
  plot: 'Punktkoordinaten – Einzeichnen',
  axisPlot: 'Punktkoordinaten – Achsen & Quadranten',
  whichSystem: 'Punktkoordinaten – x oder y?',
  whichCoords: 'Punktkoordinaten – x oder y?',
  quadrant: 'Punktkoordinaten – Achsen & Quadranten',
  axisWhich: 'Punktkoordinaten – Achsen & Quadranten',
  axisValue: 'Punktkoordinaten – Achsen & Quadranten',
  error: 'Punktkoordinaten – Fehler finden',
  mapRead: 'Punktkoordinaten – Schatzkarte',
  mapWhich: 'Punktkoordinaten – Schatzkarte',
  walk: 'Punktkoordinaten – Schatzkarte',
}

export const EXAM_TOPIC = 'Punktkoordinaten – Abschlusstest'

const NONZERO = [-5, -4, -3, -2, -1, 1, 2, 3, 4, 5]
const DARK = '#1e293b'

// ---------------------------------------------------------------------------------------------
// Ablesen
// ---------------------------------------------------------------------------------------------

function ReadTask({ level, guides, ...c }: TaskProps & { level: Level; guides: boolean }) {
  const [p] = useState(() => randPoint(level))
  const [name] = useState(() => pick(NAMES))
  const cfg: InputCfg = {
    question: (
      <>
        Lies die Koordinaten des Punktes <b>{name}</b> ab. Erst x (waagrecht), dann y (senkrecht).
      </>
    ),
    visual: (reveal) => <CoordSystem points={[{ ...p, label: name, color: DARK }]} segments={reveal ? originPath(p) : guides ? dropLines(p) : []} />,
    fields: [
      { key: 'x', label: 'x', color: X_COL, answer: p.x, sign: 'x: Links von der y-Achse ist x negativ, rechts davon positiv.' },
      { key: 'y', label: 'y', color: Y_COL, answer: p.y, sign: 'y: Unterhalb der x-Achse ist y negativ, oberhalb positiv.' },
    ],
    solution: <Way p={p} name={name} />,
    answerTex: named(name, p),
  }
  return <InputTask cfg={cfg} {...c} />
}

// ---------------------------------------------------------------------------------------------
// Einzeichnen
// ---------------------------------------------------------------------------------------------

function PlotSingle({ level, ...c }: TaskProps & { level: Level }) {
  const [t] = useState(() => randPoint(level))
  const [name] = useState(() => pick(NAMES))
  return <PlotTask name={name} target={t} {...c} />
}

function AxisPlot(c: TaskProps) {
  const [t] = useState<Pt>(() => {
    const k = pick(NONZERO)
    return Math.random() < 0.5 ? { x: k, y: 0 } : { x: 0, y: k }
  })
  const [name] = useState(() => pick(NAMES))
  const note = t.y === 0 ? 'Punkte auf der x-Achse haben immer y = 0.' : 'Punkte auf der y-Achse haben immer x = 0.'
  return <PlotTask name={name} target={t} note={note} {...c} />
}

// ---------------------------------------------------------------------------------------------
// x oder y? Auswahlaufgaben mit typischen Fehlern als Antwortmöglichkeiten
// ---------------------------------------------------------------------------------------------

interface Distractor {
  pt: Pt
  swap?: boolean
  why: string
}

const R = 5

function distractors(level: Level, p: Pt): Distractor[] {
  const { x: a, y: b } = p
  const swap: Distractor = { pt: { x: b, y: a }, swap: true, why: 'Hier sind x und y vertauscht! Erst x (waagrecht), dann y (senkrecht).' }
  if (level === 'q1') {
    return [
      swap,
      { pt: { x: a, y: b < R ? b + 1 : b - 1 }, why: 'Der y-Wert stimmt nicht: Zähle die Einheiten nach oben noch einmal.' },
      { pt: { x: a > 1 ? a - 1 : a + 1, y: b }, why: 'Der x-Wert stimmt nicht: Zähle die Einheiten nach rechts noch einmal.' },
    ]
  }
  return [
    swap,
    { pt: { x: -a, y: b }, why: 'Das Vorzeichen von x stimmt nicht: Der Punkt liegt auf der falschen Seite der y-Achse.' },
    { pt: { x: a, y: -b }, why: 'Das Vorzeichen von y stimmt nicht: Der Punkt liegt auf der falschen Seite der x-Achse.' },
  ]
}

function makeWhichSystem(level: Level): McCfg {
  const p = randPoint(level)
  const name = pick(NAMES)
  const raw = [
    { key: 'ok', pt: p, correct: true, swap: false, why: '' },
    ...distractors(level, p).map((d, i) => ({ key: `d${i}`, pt: d.pt, correct: false, swap: !!d.swap, why: `Dieses Koordinatensystem zeigt ${name}${plain(d.pt)}. ${d.why}` })),
  ]
  const options: McOption[] = shuffle(raw).map((o) => ({
    key: o.key,
    correct: o.correct,
    swap: o.swap,
    why: o.why,
    content: <CoordSystem compact points={[{ ...o.pt, label: name, color: DARK }]} />,
  }))
  return {
    layout: 'systems',
    question: (
      <>
        Welches Koordinatensystem zeigt den Punkt <M t={named(name, p)} />?
      </>
    ),
    options,
    explain: (
      <>
        <p className="bk-solution-title">So findest du den Punkt</p>
        <Way p={p} name={name} />
      </>
    ),
  }
}

function makeWhichCoords(level: Level): McCfg {
  const p = randPoint(level)
  const name = pick(NAMES)
  const raw = [
    { key: 'ok', pt: p, correct: true, swap: false, why: '' },
    ...distractors(level, p).map((d, i) => ({ key: `d${i}`, pt: d.pt, correct: false, swap: !!d.swap, why: `${name}${plain(d.pt)} wäre ein anderer Punkt. ${d.why}` })),
  ]
  const options: McOption[] = shuffle(raw).map((o) => ({
    key: o.key,
    correct: o.correct,
    swap: o.swap,
    why: o.why,
    content: <M t={named(name, o.pt)} />,
  }))
  return {
    question: <>Welche Koordinaten hat der eingezeichnete Punkt {name}?</>,
    visual: <CoordSystem points={[{ ...p, label: name, color: DARK }]} />,
    options,
    explain: (
      <>
        <p className="bk-solution-title">So liest du den Punkt ab</p>
        <Way p={p} name={name} />
      </>
    ),
  }
}

// ---------------------------------------------------------------------------------------------
// Achsen und Quadranten
// ---------------------------------------------------------------------------------------------

const QUAD = ['I', 'II', 'III', 'IV']
const QUAD_SIGNS = ['(+|+)', '(−|+)', '(−|−)', '(+|−)']
const QUAD_WHERE = ['rechts oben', 'links oben', 'links unten', 'rechts unten']

export const quadrantOf = (p: Pt): 1 | 2 | 3 | 4 => (p.x > 0 ? (p.y > 0 ? 1 : 4) : p.y > 0 ? 2 : 3)

function makeQuadrant(): McCfg {
  const p = randPoint('all')
  const name = pick(NAMES)
  const q = quadrantOf(p)
  const sx = p.x > 0 ? 'positiv (+)' : 'negativ (−)'
  const sy = p.y > 0 ? 'positiv (+)' : 'negativ (−)'
  const options: McOption[] = [1, 2, 3, 4].map((n) => ({
    key: `q${n}`,
    correct: n === q,
    content: <span>Quadrant {QUAD[n - 1]}</span>,
    why: `Schau auf die Vorzeichen: x ist ${sx}, y ist ${sy}. Quadrant ${QUAD[n - 1]} hat die Vorzeichen ${QUAD_SIGNS[n - 1]}.`,
  }))
  return {
    question: (
      <>
        In welchem Quadranten liegt der Punkt <M t={named(name, p)} />?
      </>
    ),
    options,
    explain: (
      <>
        <p className="bk-solution-title">Begründung</p>
        <p>
          x = {String(p.x).replace('-', '−')} ist {sx}, y = {String(p.y).replace('-', '−')} ist {sy}. Das passt zu den Vorzeichen {QUAD_SIGNS[q - 1]}, also liegt der Punkt in Quadrant {QUAD[q - 1]} ({QUAD_WHERE[q - 1]}).
        </p>
        <CoordSystem compact shade={q} points={[{ ...p, label: name, color: DARK }]} />
      </>
    ),
  }
}

function makeAxisWhich(): McCfg {
  const axis = pick(['x', 'y'] as const)
  const k = pick(NONZERO)
  const on: Pt = axis === 'x' ? { x: k, y: 0 } : { x: 0, y: k }
  const swap: Pt = axis === 'x' ? { x: 0, y: k } : { x: k, y: 0 }
  const other: Pt = { x: k, y: k }
  const other2: Pt = axis === 'x' ? { x: -k, y: k } : { x: k, y: -k }
  const none = 'Hier sind beide Koordinaten ungleich 0, der Punkt liegt auf keiner Achse.'
  const raw: (McOption & { pt: Pt })[] = [
    { key: 'ok', pt: on, correct: true, content: null },
    { key: 'swap', pt: swap, swap: true, content: null, why: `${plain(swap)} liegt auf der ${axis === 'x' ? 'y' : 'x'}-Achse – x und y sind vertauscht.` },
    { key: 'o1', pt: other, content: null, why: none },
    { key: 'o2', pt: other2, content: null, why: none },
  ]
  const options = shuffle(raw).map((o) => ({ ...o, content: <M t={coordTex(o.pt)} /> }))
  return {
    question: (
      <>
        Welcher Punkt liegt auf der{' '}
        <b style={{ color: axis === 'x' ? X_COL : Y_COL }}>{axis}-Achse</b>?
      </>
    ),
    options,
    explain: (
      <>
        <p className="bk-solution-title">Begründung</p>
        <p>
          {axis === 'x'
            ? 'Auf der x-Achse gehst du nur waagrecht und gar nicht nach oben oder unten. Deshalb ist y = 0.'
            : 'Auf der y-Achse gehst du gar nicht nach rechts oder links, nur senkrecht. Deshalb ist x = 0.'}
        </p>
        <CoordSystem compact points={[{ ...on, label: 'P', color: DARK }]} segments={originPath(on)} />
      </>
    ),
  }
}

function makeAxisValue(): InputCfg {
  const axis = pick(['x', 'y'] as const)
  const k = pick(NONZERO)
  const name = pick(NAMES)
  const full: Pt = axis === 'x' ? { x: k, y: 0 } : { x: 0, y: k }
  const tex = axis === 'x' ? `${name}(${k}\\,|\\,?)` : `${name}(?\\,|\\,${k})`
  return {
    question: (
      <>
        Der Punkt <M t={tex} /> liegt auf der <b style={{ color: axis === 'x' ? X_COL : Y_COL }}>{axis}-Achse</b>. Wie lautet {axis === 'x' ? 'seine y-Koordinate' : 'seine x-Koordinate'}?
      </>
    ),
    fields: axis === 'x' ? [{ key: 'y', label: 'y', color: Y_COL, answer: 0 }] : [{ key: 'x', label: 'x', color: X_COL, answer: 0 }],
    visual: (reveal) => <CoordSystem compact points={reveal ? [{ ...full, label: name, color: DARK }] : []} segments={reveal ? originPath(full) : []} />,
    solution: (
      <p>
        {axis === 'x'
          ? 'Auf der x-Achse bist du nicht nach oben oder unten gegangen. Deshalb ist y = 0.'
          : 'Auf der y-Achse bist du nicht nach rechts oder links gegangen. Deshalb ist x = 0.'}
      </p>
    ),
    answerTex: named(name, full),
  }
}

// ---------------------------------------------------------------------------------------------
// Fehler finden: vier Punkte, einer ist falsch eingezeichnet
// ---------------------------------------------------------------------------------------------

type ErrKind = 'swap' | 'mirrorX' | 'mirrorY'

function makeErrorScenario() {
  for (;;) {
    const given: Pt[] = []
    while (given.length < 4) given.push(randPoint('all', given))
    const wrong = Math.floor(Math.random() * 4)
    const kind = pick<ErrKind>(['swap', 'mirrorX', 'mirrorY'])
    const g = given[wrong]
    const bad: Pt = kind === 'swap' ? { x: g.y, y: g.x } : kind === 'mirrorX' ? { x: -g.x, y: g.y } : { x: g.x, y: -g.y }
    if (given.some((p, i) => i !== wrong && p.x === bad.x && p.y === bad.y)) continue
    return { given, wrong, kind, bad }
  }
}

const ERR_REASON: Record<ErrKind, string> = {
  swap: 'x und y wurden vertauscht.',
  mirrorX: 'Das Vorzeichen von x wurde nicht beachtet: Der Punkt liegt auf der falschen Seite der y-Achse.',
  mirrorY: 'Das Vorzeichen von y wurde nicht beachtet: Der Punkt liegt auf der falschen Seite der x-Achse.',
}

function ErrorTask(c: TaskProps) {
  const [sc] = useState(makeErrorScenario)
  const [stage, setStage] = useState<'pick' | 'fix'>('pick')
  const first = useRef<Result | null>(null)
  const { given, wrong, kind, bad } = sc
  const letter = LETTERS[wrong]
  const drawn = given.map((p, i) => (i === wrong ? bad : p))
  const labelled: SysPoint[] = drawn.map((p, i) => ({ ...p, label: LETTERS[i], color: DARK }))

  if (stage === 'pick') {
    const cfg: McCfg = {
      question: (
        <>
          Diese Punkte sollten eingezeichnet werden: <M t={given.map((p, i) => named(LETTERS[i], p)).join(',\\; ')} />. Einer wurde <b>falsch</b> eingezeichnet. Welcher?
        </>
      ),
      visual: <CoordSystem points={labelled} />,
      options: LETTERS.slice(0, 4).map((L, i) => ({
        key: L,
        correct: i === wrong,
        content: <span>Punkt {L}</span>,
        why: `Punkt ${L} stimmt: Von O aus ${stepsX(given[i].x)} und dann ${stepsY(given[i].y)} führt genau zum Punkt in der Zeichnung. Suche weiter!`,
      })),
      explain: <p>Gut gefunden! Jetzt bestimmst du, wo der Punkt {letter} in der Zeichnung wirklich liegt.</p>,
    }
    return (
      <McTask
        cfg={cfg}
        topic={c.topic}
        exam={c.exam}
        onDone={(r) => {
          first.current = r
        }}
        onNext={() => setStage('fix')}
        nextLabel="Weiter"
      />
    )
  }

  const fix: InputCfg = {
    question: (
      <>
        Punkt {letter} sollte bei <M t={coordTex(given[wrong])} /> liegen, ist aber falsch eingezeichnet. Welche Koordinaten hat er in der Zeichnung wirklich?
      </>
    ),
    visual: (reveal) => (
      <CoordSystem points={drawn.map((p, i) => ({ ...p, label: LETTERS[i], color: DARK, ring: i === wrong }))} segments={reveal ? originPath(bad) : []} />
    ),
    fields: [
      { key: 'x', label: 'x', color: X_COL, answer: bad.x, sign: 'x: Links von der y-Achse ist x negativ, rechts davon positiv.' },
      { key: 'y', label: 'y', color: Y_COL, answer: bad.y, sign: 'y: Unterhalb der x-Achse ist y negativ, oberhalb positiv.' },
    ],
    solution: (
      <>
        <Way p={bad} name={letter} />
        <p className="mt-2">
          Fehler: {ERR_REASON[kind]}
        </p>
      </>
    ),
    answerTex: named(letter, bad),
  }
  return (
    <InputTask
      cfg={fix}
      topic={c.topic}
      exam={c.exam}
      onDone={(r) => c.onDone?.({ firstTry: !!first.current?.firstTry && r.firstTry, swapped: !!first.current?.swapped || r.swapped })}
      onNext={c.onNext}
      nextLabel={c.nextLabel}
    />
  )
}

// ---------------------------------------------------------------------------------------------
// Schatzkarte (Anwendung im kartesischen Koordinatensystem)
// ---------------------------------------------------------------------------------------------

const PLACES = [
  { name: 'Hafen', emoji: '⚓' },
  { name: 'Leuchtturm', emoji: '🗼' },
  { name: 'Palmeninsel', emoji: '🌴' },
  { name: 'Vulkan', emoji: '🌋' },
  { name: 'Schiff', emoji: '🚢' },
  { name: 'Burg', emoji: '🏰' },
  { name: 'Zeltlager', emoji: '⛺' },
  { name: 'Schatzkiste', emoji: '💰' },
]

interface Place {
  name: string
  emoji: string
  x: number
  y: number
}

function makePlaces(n: number, forced: Pt[] = []): Place[] {
  const names = shuffle(PLACES).slice(0, n)
  const pts: Pt[] = [...forced]
  while (pts.length < n) pts.push(randPoint('all', pts))
  return names.map((pl, i) => ({ ...pl, x: pts[i].x, y: pts[i].y }))
}

const mapPoints = (places: Place[]): SysPoint[] => places.map((p) => ({ x: p.x, y: p.y, emoji: p.emoji }))

function Legend({ places }: { places: Place[] }) {
  return (
    <p className="text-sm text-center" style={{ color: 'var(--ink-muted)' }}>
      {places.map((p) => `${p.emoji} ${p.name}`).join('   ·   ')}
    </p>
  )
}

function MapRead(c: TaskProps) {
  const [places] = useState(() => makePlaces(5))
  const [target] = useState(() => pick(places))
  const t: Pt = { x: target.x, y: target.y }
  const cfg: InputCfg = {
    question: (
      <>
        Auf der Schatzkarte: Lies die Koordinaten von {target.emoji} <b>{target.name}</b> ab.
      </>
    ),
    visual: (reveal) => (
      <div className="bk-stack" style={{ gap: 8 }}>
        <Legend places={places} />
        <CoordSystem points={mapPoints(places)} segments={reveal ? originPath(t) : []} />
      </div>
    ),
    fields: [
      { key: 'x', label: 'x', color: X_COL, answer: t.x, sign: 'x: Links von der y-Achse ist x negativ, rechts davon positiv.' },
      { key: 'y', label: 'y', color: Y_COL, answer: t.y, sign: 'y: Unterhalb der x-Achse ist y negativ, oberhalb positiv.' },
    ],
    solution: <Way p={t} name="P" />,
    answerTex: named(target.name, t),
  }
  return <InputTask cfg={cfg} {...c} />
}

function MapWhich(c: TaskProps) {
  const [sc] = useState(() => {
    const t = randPoint('all')
    const places = makePlaces(4, [t, { x: t.y, y: t.x }])
    return { t, places }
  })
  const [options] = useState<McOption[]>(() =>
    shuffle(sc.places.map((p, i) => ({ p, i }))).map(({ p, i }) => ({
      key: p.name,
      correct: i === 0,
      swap: i === 1,
      content: (
        <span>
          {p.emoji} {p.name}
        </span>
      ),
      why:
        i === 1
          ? `${p.emoji} ${p.name} liegt bei ${plain(p)} – das sind x und y vertauscht!`
          : `${p.emoji} ${p.name} liegt bei ${plain(p)}, nicht bei ${plain(sc.t)}.`,
    })),
  )
  const cfg: McCfg = {
    question: (
      <>
        Welcher Ort liegt bei <M t={coordTex(sc.t)} />?
      </>
    ),
    visual: (
      <div className="bk-stack" style={{ gap: 8 }}>
        <Legend places={sc.places} />
        <CoordSystem points={mapPoints(sc.places)} />
      </div>
    ),
    options,
    explain: (
      <>
        <p className="bk-solution-title">So findest du den Ort</p>
        <Way p={sc.t} name="P" />
      </>
    ),
  }
  return <McTask cfg={cfg} {...c} />
}

function Walk(c: TaskProps) {
  const [sc] = useState(() => {
    for (;;) {
      const s = randPoint('all')
      const e = randPoint('all')
      if (e.x !== s.x && e.y !== s.y) return { s, e, place: pick(PLACES) }
    }
  })
  const { s, e, place } = sc
  const dx = e.x - s.x
  const dy = e.y - s.y
  const mid: Pt = { x: e.x, y: s.y }
  const walkSegs: Segment[] = [
    { a: s, b: mid, color: X_COL },
    { a: mid, b: e, color: Y_COL },
  ]
  const cfg: InputCfg = {
    question: (
      <>
        Du startest beim {place.emoji} {place.name} <M t={coordTex(s)} />. Gehe <b style={{ color: X_COL }}>{stepsX(dx)}</b> und dann <b style={{ color: Y_COL }}>{stepsY(dy)}</b>. Auf welchem Punkt kommst du an?
      </>
    ),
    visual: (reveal) => (
      <CoordSystem
        points={[{ ...s, emoji: place.emoji }, ...(reveal ? [{ ...e, label: 'Ziel', color: '#16a34a' }] : [])]}
        segments={reveal ? walkSegs : []}
      />
    ),
    fields: [
      { key: 'x', label: 'x', color: X_COL, answer: e.x, sign: 'x: Nach rechts wird x größer, nach links kleiner. Prüfe die Richtung.' },
      { key: 'y', label: 'y', color: Y_COL, answer: e.y, sign: 'y: Nach oben wird y größer, nach unten kleiner. Prüfe die Richtung.' },
    ],
    solution: (
      <ol className="list-decimal pl-5 space-y-1">
        <li>
          <b style={{ color: X_COL }}>x-Richtung:</b> <M t={`x = ${s.x} ${dx > 0 ? '+' : '-'} ${Math.abs(dx)} = ${e.x}`} />
        </li>
        <li>
          <b style={{ color: Y_COL }}>y-Richtung:</b> <M t={`y = ${s.y} ${dy > 0 ? '+' : '-'} ${Math.abs(dy)} = ${e.y}`} />
        </li>
        <li>
          Zielpunkt: <M t={named('Z', e)} />
        </li>
      </ol>
    ),
    answerTex: named('Z', e),
  }
  return <InputTask cfg={cfg} {...c} />
}

// ---------------------------------------------------------------------------------------------
// Zuordnung Aufgabenart -> Komponente
// ---------------------------------------------------------------------------------------------

export interface RunProps {
  level: Level
  guides?: boolean
  exam?: boolean
  onDone?: (r: Result) => void
  onNext?: () => void
  nextLabel?: string
}

function WhichSystem({ level, ...c }: TaskProps & { level: Level }) {
  const [cfg] = useState(() => makeWhichSystem(level))
  return <McTask cfg={cfg} {...c} />
}
function WhichCoords({ level, ...c }: TaskProps & { level: Level }) {
  const [cfg] = useState(() => makeWhichCoords(level))
  return <McTask cfg={cfg} {...c} />
}
function Quadrant(c: TaskProps) {
  const [cfg] = useState(makeQuadrant)
  return <McTask cfg={cfg} {...c} />
}
function AxisWhich(c: TaskProps) {
  const [cfg] = useState(makeAxisWhich)
  return <McTask cfg={cfg} {...c} />
}
function AxisValue(c: TaskProps) {
  const [cfg] = useState(makeAxisValue)
  return <InputTask cfg={cfg} {...c} />
}

export function Task({ kind, level, guides = true, exam, onDone, onNext, nextLabel }: RunProps & { kind: Kind }) {
  const c: TaskProps = { topic: exam ? EXAM_TOPIC : TOPIC[kind], exam, onDone, onNext, nextLabel }
  switch (kind) {
    case 'read':
      return <ReadTask level={level} guides={guides} {...c} />
    case 'plot':
      return <PlotSingle level={level} {...c} />
    case 'axisPlot':
      return <AxisPlot {...c} />
    case 'whichSystem':
      return <WhichSystem level={level} {...c} />
    case 'whichCoords':
      return <WhichCoords level={level} {...c} />
    case 'quadrant':
      return <Quadrant {...c} />
    case 'axisWhich':
      return <AxisWhich {...c} />
    case 'axisValue':
      return <AxisValue {...c} />
    case 'error':
      return <ErrorTask {...c} />
    case 'mapRead':
      return <MapRead {...c} />
    case 'mapWhich':
      return <MapWhich {...c} />
    case 'walk':
      return <Walk {...c} />
  }
}

export { TOPIC }

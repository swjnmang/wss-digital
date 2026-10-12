import { Achtung, Beispiel, Lesson, M, MB, Merke, QuerTabelle, Section, Uebungen, Vorgehen, frac, pick, rnd, shuffle, tex, texPct, type ExerciseDef } from './kit'

// Schritt 6: Zufallsexperiment, Ergebnismenge, Ereignis, Laplace-Wahrscheinlichkeit, Gegenereignis

const FARBEN: Record<string, string> = { rot: '#d64545', blau: '#1d3f9e', grün: '#2f9e5b', gelb: '#e8b923', rosa: '#e98bb5', schwarz: '#1b2433', weiß: '#ffffff', orange: '#e67e22' }

export function Urne({ counts }: { counts: [string, number][] }) {
  const balls = counts.flatMap(([c, n]) => Array(n).fill(c) as string[])
  const perRow = Math.min(8, Math.max(4, Math.ceil(Math.sqrt(balls.length * 2))))
  const rows = Math.ceil(balls.length / perRow)
  const W = perRow * 30 + 40
  const H = rows * 30 + 40
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={counts.map(([c, n]) => `${n} ${c}`).join(', ')}>
      <path d={`M10 10 V${H - 14} Q10 ${H - 4} 22 ${H - 4} H${W - 22} Q${W - 10} ${H - 4} ${W - 10} ${H - 14} V10`} fill="none" stroke="var(--ink)" strokeWidth="2" />
      {balls.map((c, i) => (
        <circle key={i} cx={34 + (i % perRow) * 30} cy={H - 24 - Math.floor(i / perRow) * 30} r="12" fill={FARBEN[c] ?? c} stroke="var(--ink)" strokeWidth="1.2" />
      ))}
    </svg>
  )
}

export function Gluecksrad({ felder }: { felder: { label: string; color: string }[] }) {
  const r = 90
  const c = 100
  const n = felder.length
  const pt = (deg: number, rr = r) => [c + rr * Math.cos(((deg - 90) * Math.PI) / 180), c + rr * Math.sin(((deg - 90) * Math.PI) / 180)]
  return (
    <svg width="200" height="210" viewBox="0 0 200 210" role="img" aria-label={`Glücksrad mit ${n} gleich großen Feldern`}>
      {felder.map((f, i) => {
        const [x1, y1] = pt((i * 360) / n)
        const [x2, y2] = pt(((i + 1) * 360) / n)
        const [lx, ly] = pt(((i + 0.5) * 360) / n, 62)
        return (
          <g key={i}>
            <path d={`M${c} ${c} L${x1} ${y1} A${r} ${r} 0 0 1 ${x2} ${y2} Z`} fill={FARBEN[f.color] ?? f.color} stroke="var(--ink)" strokeWidth="1.5" opacity="0.85" />
            <text x={lx} y={ly + 6} textAnchor="middle" fontSize="18" fontWeight="800" fill={f.color === 'gelb' || f.color === 'weiß' ? '#1b2433' : '#fff'}>
              {f.label}
            </text>
          </g>
        )
      })}
      <path d="M100 4 l-8 -2 l8 16 l8 -16 Z" fill="var(--ink)" />
    </svg>
  )
}

/* ── Übungen ───────────────────────────────────────────────────────────── */

const EREIGNISSE: { name: string; test: (x: number) => boolean }[] = [
  { name: 'eine gerade Zahl', test: (x) => x % 2 === 0 },
  { name: 'eine ungerade Zahl', test: (x) => x % 2 === 1 },
  { name: 'eine Zahl größer als 4', test: (x) => x > 4 },
  { name: 'eine Zahl kleiner als 3', test: (x) => x < 3 },
  { name: 'eine Primzahl', test: (x) => [2, 3, 5, 7, 11].includes(x) },
  { name: 'ein Vielfaches von 3', test: (x) => x % 3 === 0 },
  { name: 'höchstens eine 2', test: (x) => x <= 2 },
  { name: 'mindestens eine 5', test: (x) => x >= 5 },
]

const ereignisMenge: ExerciseDef = {
  id: 'menge',
  title: 'Ergebnismenge und Ereignis',
  level: 1,
  gen: () => {
    const sides = pick([6, 8, 12])
    const omega = Array.from({ length: sides }, (_, i) => i + 1)
    let e = pick(EREIGNISSE)
    while (omega.filter(e.test).length === 0) e = pick(EREIGNISSE)
    const E = omega.filter(e.test)
    return {
      prompt: (
        <p>
          Ein fairer {sides}-seitiger Würfel mit den Zahlen 1 bis {sides} wird einmal geworfen. Betrachtet wird das Ereignis <M>E</M>: „Der Würfel zeigt {e.name}.“
        </p>
      ),
      fields: [
        { kind: 'num', key: 'om', label: <>Anzahl der möglichen Ergebnisse <M>{'|\\Omega|'}</M></>, expected: sides, tol: 0 },
        { kind: 'set', key: 'E', label: <>Wähle alle Ergebnisse aus, die zu <M>E</M> gehören:</>, options: omega.map(String), expected: E.map(String) },
        { kind: 'prob', key: 'P', label: <><M>P(E)</M></>, expected: E.length / sides },
      ],
      solution: (
        <>
          <MB>{`\\Omega = \\{${omega.join('; ')}\\} \\qquad |\\Omega| = ${sides}`}</MB>
          <MB>{`E = \\{${E.join('; ')}\\} \\qquad |E| = ${E.length}`}</MB>
          <MB>{`P(E) = \\frac{${E.length}}{${sides}}${frac(E.length, sides) !== `\\tfrac{${E.length}}{${sides}}` ? ` = ${frac(E.length, sides).replace('tfrac', 'frac')}` : ''} \\approx ${texPct(E.length / sides)}`}</MB>
        </>
      ),
    }
  },
}

const URNEN_FARBEN = ['rot', 'blau', 'grün', 'gelb']

const urne: ExerciseDef = {
  id: 'urne',
  title: 'Ziehen aus einer Urne',
  level: 1,
  gen: () => {
    const farben = shuffle(URNEN_FARBEN).slice(0, 3)
    const counts = farben.map(() => rnd(1, 7))
    const n = counts.reduce((a, b) => a + b, 0)
    const i = rnd(0, 2)
    const j = (i + 1) % 3
    const typ = rnd(0, 2)
    const ev = [
      { name: `Die Kugel ist ${farben[i]}.`, g: counts[i] },
      { name: `Die Kugel ist ${farben[i]} oder ${farben[j]}.`, g: counts[i] + counts[j] },
      { name: `Die Kugel ist nicht ${farben[i]}.`, g: n - counts[i] },
    ][typ]
    return {
      prompt: (
        <>
          <p>
            In einer Urne liegen {counts.map((c, k) => `${c} ${farben[k]}e`).join(', ').replace(/, ([^,]*)$/, ' und $1')} Kugeln. Es wird eine Kugel zufällig gezogen.
          </p>
          <Urne counts={farben.map((f, k) => [f, counts[k]] as [string, number])} />
          <p>
            Ereignis <M>E</M>: „{ev.name}“
          </p>
        </>
      ),
      fields: [{ kind: 'prob', key: 'P', label: <><M>P(E)</M></>, expected: ev.g / n }],
      solution: (
        <>
          <p>
            Alle Kugeln sind gleich wahrscheinlich (Laplace-Experiment). Es gibt <M>{`${counts.join(' + ')} = ${n}`}</M> mögliche Ergebnisse, davon sind {ev.g} günstig für <M>E</M>.
          </p>
          <MB>{`P(E) = \\frac{\\text{günstige Ergebnisse}}{\\text{mögliche Ergebnisse}} = \\frac{${ev.g}}{${n}} \\approx ${tex(ev.g / n, 4)} = ${texPct(ev.g / n)}`}</MB>
          {typ === 2 && (
            <p>
              Alternativ mit dem Gegenereignis: <M>{`P(E) = 1 - \\frac{${counts[i]}}{${n}} = \\frac{${n - counts[i]}}{${n}}`}</M>
            </p>
          )}
        </>
      ),
    }
  },
}

const gluecksrad: ExerciseDef = {
  id: 'gluecksrad',
  title: 'Glücksrad',
  level: 2,
  gen: () => {
    const n = pick([6, 8, 10, 12])
    const colors = ['rot', 'blau', 'gelb', 'grün']
    let felder: { label: string; color: string }[]
    do felder = Array.from({ length: n }, () => ({ label: String(rnd(1, 4)), color: pick(colors.slice(0, 3)) }))
    while (new Set(felder.map((f) => f.color)).size < 3)
    const c = pick([...new Set(felder.map((f) => f.color))])
    const z = rnd(2, 3)
    const g1 = felder.filter((f) => f.color === c).length
    const g2 = felder.filter((f) => Number(f.label) >= z).length
    const g3 = felder.filter((f) => f.color === c && Number(f.label) >= z).length
    return {
      prompt: (
        <>
          <p>Das Glücksrad hat {n} gleich große Felder und wird einmal gedreht.</p>
          <Gluecksrad felder={felder} />
        </>
      ),
      fields: [
        { kind: 'prob', key: 'a', label: `P(„${c}“)`, expected: g1 / n },
        { kind: 'prob', key: 'b', label: `P(„Zahl mindestens ${z}“)`, expected: g2 / n },
        { kind: 'prob', key: 'c', label: `P(„${c} und Zahl mindestens ${z}“)`, expected: g3 / n },
      ],
      solution: (
        <>
          <p>Jedes Feld ist gleich wahrscheinlich. Zähle die Felder, die zum Ereignis passen, und teile durch {n}.</p>
          <MB>{`P(\\text{${c}}) = \\frac{${g1}}{${n}} \\approx ${texPct(g1 / n)}`}</MB>
          <MB>{`P(\\text{Zahl} \\ge ${z}) = \\frac{${g2}}{${n}} \\approx ${texPct(g2 / n)}`}</MB>
          <MB>{`P(\\text{${c} und Zahl} \\ge ${z}) = \\frac{${g3}}{${n}} \\approx ${texPct(g3 / n)}`}</MB>
          <p>Bei „und“ müssen beide Bedingungen gleichzeitig erfüllt sein.</p>
        </>
      ),
    }
  },
}

const ROT = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]
const ROULETTE = [
  { name: 'Die Kugel bleibt auf einer roten Zahl liegen.', g: 18 },
  { name: 'Die Kugel bleibt auf einer schwarzen Zahl liegen.', g: 18 },
  { name: 'Die Kugel bleibt auf der grünen 0 liegen.', g: 1 },
  { name: 'Eine Zahl von 1 bis 12 wird gespielt.', g: 12 },
  { name: 'Die Kugel bleibt auf der roten 1 liegen.', g: 1 },
  { name: 'Eine der Zahlen 1, 2, 4 oder 5 wird gespielt.', g: 4 },
  { name: 'Eine gerade Zahl (ohne 0) wird gespielt.', g: 18 },
  { name: 'Eine rote Zahl zwischen 1 und 10 wird gespielt.', g: ROT.filter((x) => x <= 10).length },
]

const roulette: ExerciseDef = {
  id: 'roulette',
  title: 'Roulette',
  level: 2,
  gen: () => {
    const [a, b] = shuffle(ROULETTE).slice(0, 2)
    return {
      prompt: (
        <p>
          Beim Roulette gibt es die Zahlen 0 bis 36. Die 0 ist grün, 18 Zahlen sind rot ({ROT.slice(0, 5).join(', ')}, …) und 18 sind schwarz. Jede Zahl ist gleich
          wahrscheinlich.
        </p>
      ),
      fields: [
        { kind: 'prob', key: 'a', label: <><M>{'P(E_1)'}</M>: {a.name}</>, expected: a.g / 37 },
        { kind: 'prob', key: 'b', label: <><M>{'P(E_2)'}</M>: {b.name}</>, expected: b.g / 37 },
      ],
      solution: (
        <>
          <p>
            Es gibt 37 mögliche Ergebnisse (0 bis 36): <M>{'|\\Omega| = 37'}</M>.
          </p>
          <MB>{`P(E_1) = \\frac{${a.g}}{37} \\approx ${texPct(a.g / 37)} \\qquad P(E_2) = \\frac{${b.g}}{37} \\approx ${texPct(b.g / 37)}`}</MB>
          <p>Achtung: Wegen der grünen 0 ist „rot“ nicht genau 50 %.</p>
        </>
      ),
    }
  },
}

const GEGEN = [
  { e: 'Ein Bus kommt pünktlich.', q: 'Der Bus kommt nicht pünktlich.' },
  { e: 'Ein Los ist ein Gewinn.', q: 'Das Los ist eine Niete.' },
  { e: 'Ein Bauteil ist fehlerfrei.', q: 'Das Bauteil ist fehlerhaft.' },
  { e: 'Eine befragte Person nutzt Streamingdienste.', q: 'Die Person nutzt keine Streamingdienste.' },
]

const gegenereignis: ExerciseDef = {
  id: 'gegen',
  title: 'Gegenereignis',
  level: 1,
  gen: () => {
    const g = pick(GEGEN)
    const p = rnd(5, 95)
    const useFrac = Math.random() < 0.4
    const nen = pick([8, 10, 20, 25])
    const z = rnd(1, nen - 1)
    const P = useFrac ? z / nen : p / 100
    return {
      prompt: (
        <p>
          Für das Ereignis <M>E</M>: „{g.e}“ gilt <M>{`P(E) = ${useFrac ? `\\frac{${z}}{${nen}}` : `${p}\\,\\%`}`}</M>. Berechne die Wahrscheinlichkeit des Gegenereignisses{' '}
          <M>{'\\overline{E}'}</M>: „{g.q}“
        </p>
      ),
      fields: [{ kind: 'prob', key: 'q', label: <><M>{'P(\\overline{E})'}</M></>, expected: 1 - P }],
      solution: (
        <>
          <p>Ein Ereignis und sein Gegenereignis ergeben zusammen immer 1 (100 %):</p>
          <MB>{`P(\\overline{E}) = 1 - P(E) = 1 - ${useFrac ? `\\frac{${z}}{${nen}} = \\frac{${nen - z}}{${nen}}` : `${tex(p / 100)} = ${tex(1 - p / 100)}`} = ${texPct(1 - P)}`}</MB>
        </>
      ),
    }
  },
}

const jahrmarkt: ExerciseDef = {
  id: 'jahrmarkt',
  title: 'Glücksspiel auf dem Jahrmarkt',
  level: 2,
  gen: () => {
    const s = pick([10, 12, 20])
    const g = rnd(2, Math.floor(s / 3))
    const haupt = 1
    const verlust = s - g - haupt
    return {
      prompt: (
        <p>
          Ein fairer {s}-seitiger Würfel ist mit den Zahlen 1 bis {s} beschriftet. Du gewinnst bei einer Zahl von 1 bis {g}. Bei der {s} bekommst du den Hauptgewinn.
          Bei allen anderen Zahlen verlierst du.
        </p>
      ),
      fields: [
        { kind: 'prob', key: 'g', label: 'P(Gewinn)', expected: g / s },
        { kind: 'prob', key: 'h', label: 'P(Hauptgewinn)', expected: haupt / s },
        { kind: 'prob', key: 'v', label: 'P(Verlust)', expected: verlust / s },
      ],
      solution: (
        <>
          <MB>{`|\\Omega| = ${s}`}</MB>
          <MB>{`P(\\text{Gewinn}) = \\frac{${g}}{${s}} \\approx ${texPct(g / s)} \\qquad P(\\text{Hauptgewinn}) = \\frac{1}{${s}} = ${texPct(1 / s)}`}</MB>
          <p>Verlust bei den Zahlen {g + 1} bis {s - 1}, das sind {verlust} Zahlen:</p>
          <MB>{`P(\\text{Verlust}) = \\frac{${verlust}}{${s}} \\approx ${texPct(verlust / s)}`}</MB>
          <p>
            Kontrolle: <M>{`\\frac{${g}}{${s}} + \\frac{1}{${s}} + \\frac{${verlust}}{${s}} = \\frac{${s}}{${s}} = 1`}</M> ✓
          </p>
        </>
      ),
    }
  },
}

export const EXERCISES_ZUFALL = [ereignisMenge, urne, gegenereignis, gluecksrad, jahrmarkt, roulette]

export default function Zufallsexperimente() {
  return (
    <Lesson goal="Du beschreibst Zufallsexperimente mit Ergebnismenge und Ereignissen und berechnest Laplace-Wahrscheinlichkeiten – auch über das Gegenereignis.">
      <Section no={1} title="Das musst du wissen">
        <p>
          Würfeln, ein Glücksrad drehen oder eine Kugel aus einer Urne ziehen: Das sind <strong>Zufallsexperimente</strong>. Man kennt alle möglichen Ausgänge, kann aber nicht
          vorhersagen, welcher eintritt.
        </p>
        <div className="lp-grid2">
          <Merke title="Ergebnis, Ergebnismenge, Ereignis">
            <ul>
              <li>
                <strong>Ergebnis</strong>: ein möglicher Ausgang, z. B. „Würfel zeigt 4“.
              </li>
              <li>
                <strong>Ergebnismenge</strong> <M>{'\\Omega'}</M> (Omega): alle möglichen Ergebnisse, z. B. <M>{'\\Omega = \\{1; 2; 3; 4; 5; 6\\}'}</M>.
              </li>
              <li>
                <strong>Ereignis</strong> <M>E</M>: eine Zusammenfassung von Ergebnissen, z. B. „gerade Zahl“: <M>{'E = \\{2; 4; 6\\}'}</M>.
              </li>
              <li>
                <strong>Gegenereignis</strong> <M>{'\\overline{E}'}</M>: alle Ergebnisse, die nicht zu <M>E</M> gehören: <M>{'\\overline{E} = \\{1; 3; 5\\}'}</M>.
              </li>
            </ul>
          </Merke>
          <Merke title="Laplace-Wahrscheinlichkeit (Merkhilfe)">
            <p>Wenn alle Ergebnisse gleich wahrscheinlich sind:</p>
            <MB>{'P(E) = \\frac{\\text{Anzahl der Ergebnisse, bei denen } E \\text{ eintritt}}{\\text{Anzahl aller möglichen Ergebnisse}}'}</MB>
            <ul>
              <li>
                <M>{'0 \\le P(E) \\le 1'}</M>; unmögliches Ereignis: <M>0</M>, sicheres Ereignis: <M>1</M>
              </li>
              <li>
                <M>{'P(\\overline{E}) = 1 - P(E)'}</M>
              </li>
            </ul>
          </Merke>
        </div>
        <Vorgehen
          steps={[
            <>Schreibe die Ergebnismenge <M>{'\\Omega'}</M> auf und zähle die möglichen Ergebnisse.</>,
            <>Schreibe das Ereignis als Menge auf und zähle die günstigen Ergebnisse.</>,
            <>Teile: günstige durch mögliche Ergebnisse. Kürze den Bruch und gib das Ergebnis eventuell in Prozent an.</>,
            <>Ist das Gegenereignis einfacher zu zählen („nicht …“), rechne <M>{'1 - P(\\overline{E})'}</M>.</>,
          ]}
        />
      </Section>

      <Section no={2} title="Beispiel Schritt für Schritt">
        <Beispiel
          title="Ziehen aus der Urne auf dem Jahrmarkt"
          aufgabe={
            <>
              <p>In einer Urne befinden sich 11 Kugeln: 4 rote, 3 grüne, 3 gelbe und 1 rosa Kugel. Du ziehst einmal.</p>
              <Urne counts={[['rot', 4], ['grün', 3], ['gelb', 3], ['rosa', 1]]} />
              <p>Grün gewinnt, Rosa ist der Hauptgewinn, Rot und Gelb verlieren. Wie wahrscheinlich ist ein Gewinn, der Hauptgewinn und ein Verlust?</p>
            </>
          }
          steps={[
            { title: 'Mögliche Ergebnisse zählen', body: <p>Jede der 11 Kugeln kann gezogen werden: <M>{'|\\Omega| = 11'}</M>.</p> },
            { title: 'Gewinn (grün)', body: <MB>{'P(\\text{Gewinn}) = \\frac{3}{11} \\approx 0{,}2727 = 27{,}27\\,\\%'}</MB> },
            { title: 'Hauptgewinn (rosa)', body: <MB>{'P(\\text{Hauptgewinn}) = \\frac{1}{11} \\approx 9{,}09\\,\\%'}</MB> },
            {
              title: 'Verlust (rot oder gelb)',
              body: (
                <>
                  <MB>{'P(\\text{Verlust}) = \\frac{4 + 3}{11} = \\frac{7}{11} \\approx 63{,}64\\,\\%'}</MB>
                  <p>Kontrolle: <M>{'\\frac{3}{11} + \\frac{1}{11} + \\frac{7}{11} = 1'}</M> ✓</p>
                </>
              ),
            },
          ]}
        />
        <QuerTabelle
          rows={[
            { head: 'Schreibweise', cells: [<M key="1">{'\\tfrac{3}{8}'}</M>, <M key="2">{'0{,}375'}</M>, <M key="3">{'37{,}5\\,\\%'}</M>] },
            { head: 'Bedeutung', cells: ['Bruch', 'Dezimalzahl', 'Prozent'] },
          ]}
        />
        <Achtung
          items={[
            'Die Laplace-Formel gilt nur, wenn alle Ergebnisse gleich wahrscheinlich sind (fairer Würfel, gleich große Felder, gleiche Kugeln).',
            <>Beim Roulette gibt es 37 Zahlen (mit der 0), nicht 36.</>,
            'Bei „oder“ werden die günstigen Ergebnisse zusammengezählt, bei „und“ müssen beide Bedingungen gleichzeitig gelten.',
          ]}
        />
      </Section>

      <Section no={3} title="Jetzt du!">
        <Uebungen defs={EXERCISES_ZUFALL} />
      </Section>
    </Lesson>
  )
}

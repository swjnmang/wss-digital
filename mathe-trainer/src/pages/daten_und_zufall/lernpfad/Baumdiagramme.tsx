import Baum, { type Knoten } from './Baum'
import { Urne } from './Zufallsexperimente'
import { Achtung, Beispiel, Lesson, M, MB, Merke, Section, Uebungen, Vorgehen, fmt, fracText, pick, rnd, shuffle, tex, type ExerciseDef } from './kit'

// Schritt 7: mehrstufige Zufallsexperimente als Baumdiagramm (mit/ohne Zurücklegen, aus Prozentangaben)

const FARB_PAARE: [string, string, string, string][] = [
  ['rot', 'blau', 'r', 'b'],
  ['grün', 'gelb', 'g', 'y'],
  ['schwarz', 'weiß', 's', 'w'],
]

/** Zweistufiger Baum mit zwei Sorten; ohne Zurücklegen, wenn ohne = true */
export function zweiSorten(a: number, b: number, la: string, lb: string, ohne: boolean, withKeys = false): Knoten[] {
  const n = a + b
  const m = ohne ? n - 1 : n
  const t = (z: number, nn: number) => `${z}/${nn}`
  return [
    {
      label: la,
      p: t(a, n),
      key: withKeys ? 'A' : undefined,
      children: [
        { label: la, p: t(ohne ? a - 1 : a, m), key: withKeys ? 'AA' : undefined },
        { label: lb, p: t(b, m), key: withKeys ? 'AB' : undefined },
      ],
    },
    {
      label: lb,
      p: t(b, n),
      key: withKeys ? 'B' : undefined,
      children: [
        { label: la, p: t(a, m), key: withKeys ? 'BA' : undefined },
        { label: lb, p: t(ohne ? b - 1 : b, m), key: withKeys ? 'BB' : undefined },
      ],
    },
  ]
}

function zweiSortenFields(a: number, b: number, ohne: boolean) {
  const n = a + b
  const m = ohne ? n - 1 : n
  const vals: Record<string, number> = {
    A: a / n,
    B: b / n,
    AA: (ohne ? a - 1 : a) / m,
    AB: b / m,
    BA: a / m,
    BB: (ohne ? b - 1 : b) / m,
  }
  return Object.entries(vals).map(([key, expected]) => ({ kind: 'prob' as const, key, expected, placeholder: '?', inline: true }))
}

const mitZuruecklegen: ExerciseDef = {
  id: 'mit',
  title: 'Baumdiagramm: Ziehen mit Zurücklegen',
  level: 1,
  gen: () => {
    const [fa, fb, la, lb] = pick(FARB_PAARE)
    const a = rnd(2, 6)
    const b = rnd(2, 6)
    return {
      prompt: (F) => (
        <>
          <p>
            In einer Urne liegen {a} {fa}e ({la}) und {b} {fb}e ({lb}) Kugeln. Du ziehst eine Kugel, notierst die Farbe, <strong>legst sie zurück</strong> und ziehst ein
            zweites Mal. Trage alle Übergangswahrscheinlichkeiten ein.
          </p>
          <Urne counts={[[fa, a], [fb, b]]} />
          <Baum root={zweiSorten(a, b, la, lb, false, true)} F={F} stages={['1. Zug', '2. Zug']} />
        </>
      ),
      fields: zweiSortenFields(a, b, false),
      hint: 'Brüche wie 3/7 eingeben.',
      solution: (
        <>
          <p>
            Insgesamt sind {a + b} Kugeln in der Urne. Weil die Kugel zurückgelegt wird, ist die Urne beim 2. Zug wieder genauso gefüllt – die Wahrscheinlichkeiten bleiben gleich.
          </p>
          <Baum root={zweiSorten(a, b, la, lb, false)} stages={['1. Zug', '2. Zug']} />
          <p>
            Kontrolle: An jeder Verzweigung ergeben die Äste zusammen 1, z. B. <M>{`\\frac{${a}}{${a + b}} + \\frac{${b}}{${a + b}} = 1`}</M>.
          </p>
        </>
      ),
    }
  },
}

const ohneZuruecklegen: ExerciseDef = {
  id: 'ohne',
  title: 'Baumdiagramm: Ziehen ohne Zurücklegen',
  level: 2,
  gen: () => {
    const ctx = pick([
      { text: (a: number, b: number) => `Eine Klasse besteht aus ${a} Jungen (J) und ${b} Mädchen (M). Die Lehrkraft wählt nacheinander zufällig zwei Personen aus, die an der Tafel geprüft werden.`, la: 'J', lb: 'M', s: ['1. Person', '2. Person'] },
      { text: (a: number, b: number) => `In einer Tüte sind ${a} rote (r) und ${b} grüne (g) Gummibärchen. Du ziehst eines, isst es auf und ziehst ein zweites.`, la: 'r', lb: 'g', s: ['1. Bärchen', '2. Bärchen'] },
      { text: (a: number, b: number) => `In einer Losbox sind ${a} Gewinne (G) und ${b} Nieten (N). Du ziehst nacheinander zwei Lose und legst sie nicht zurück.`, la: 'G', lb: 'N', s: ['1. Los', '2. Los'] },
    ])
    const a = rnd(3, 12)
    const b = rnd(3, 12)
    return {
      prompt: (F) => (
        <>
          <p>{ctx.text(a, b)} Trage alle Übergangswahrscheinlichkeiten ein.</p>
          <Baum root={zweiSorten(a, b, ctx.la, ctx.lb, true, true)} F={F} stages={ctx.s} />
        </>
      ),
      fields: zweiSortenFields(a, b, true),
      hint: 'Brüche wie 9/19 eingeben (gekürzt oder ungekürzt).',
      solution: (
        <>
          <p>
            1. Stufe: insgesamt {a + b}. Nach dem ersten Zug ist eine Person/ein Stück weniger da: Der Nenner wird zu {a + b - 1}. Bei der Sorte, die schon gezogen wurde,
            sinkt auch der Zähler um 1.
          </p>
          <Baum root={zweiSorten(a, b, ctx.la, ctx.lb, true)} stages={ctx.s} />
        </>
      ),
    }
  },
}

const PROZENT_KONTEXTE = [
  { text: (p: number, q: number, r: number) => `In der Mensa wählen ${p} % das Fleischgericht (F), die anderen das vegetarische Gericht (V). ${q} % der Fleischesser trinken Saft (S), die anderen Wasser (W). Von den Vegetariern trinken ${r} % Wasser.`, a: ['F', 'V'], b: ['S', 'W'], flipR: true, s: ['Gericht', 'Getränk'] },
  { text: (p: number, q: number, r: number) => `${p} % der Internetnutzer verwenden Streamingdienste (S), die anderen nicht (N). Von den Nutzern zahlen ${q} % für ein Abo (A), die anderen nutzen gratis (G). Bei den Nicht-Nutzern planen ${r} % ein Abo (A), die übrigen nicht (G).`, a: ['S', 'N'], b: ['A', 'G'], flipR: false, s: ['Nutzung', 'Abo'] },
  { text: (p: number, q: number, r: number) => `${p} % der Fahrgäste haben ein Monatsticket (M), die anderen ein Einzelticket (E). ${q} % der Fahrgäste mit Monatsticket sitzen (S), die übrigen stehen (T). Von den Fahrgästen mit Einzelticket stehen ${r} %.`, a: ['M', 'E'], b: ['S', 'T'], flipR: true, s: ['Ticket', 'Platz'] },
]

const ausProzent: ExerciseDef = {
  id: 'prozent',
  title: 'Baumdiagramm aus Prozentangaben',
  level: 2,
  gen: () => {
    const k = pick(PROZENT_KONTEXTE)
    const p = pick([60, 65, 70, 75, 80])
    const q = pick([40, 55, 60, 70, 85])
    const r = pick([20, 30, 45, 80, 90])
    const pa = p / 100
    const pq = q / 100
    // r bezieht sich je nach Kontext auf den 2. oder 1. Ast der unteren Verzweigung
    const pr1 = k.flipR ? 1 - r / 100 : r / 100
    const t = (x: number) => fmt(x, 2)
    const tree = (keys: boolean): Knoten[] => [
      { label: k.a[0], p: t(pa), key: keys ? 'a' : undefined, children: [{ label: k.b[0], p: t(pq), key: keys ? 'aa' : undefined }, { label: k.b[1], p: t(1 - pq), key: keys ? 'ab' : undefined }] },
      { label: k.a[1], p: t(1 - pa), key: keys ? 'b' : undefined, children: [{ label: k.b[0], p: t(pr1), key: keys ? 'ba' : undefined }, { label: k.b[1], p: t(1 - pr1), key: keys ? 'bb' : undefined }] },
    ]
    return {
      prompt: (F) => (
        <>
          <p>{k.text(p, q, r)}</p>
          <p>Trage die Übergangswahrscheinlichkeiten als Dezimalzahlen ein.</p>
          <Baum root={tree(true)} F={F} stages={k.s} />
        </>
      ),
      fields: [
        { kind: 'prob', key: 'a', expected: pa, placeholder: '?', inline: true },
        { kind: 'prob', key: 'b', expected: 1 - pa, placeholder: '?', inline: true },
        { kind: 'prob', key: 'aa', expected: pq, placeholder: '?', inline: true },
        { kind: 'prob', key: 'ab', expected: 1 - pq, placeholder: '?', inline: true },
        { kind: 'prob', key: 'ba', expected: pr1, placeholder: '?', inline: true },
        { kind: 'prob', key: 'bb', expected: 1 - pr1, placeholder: '?', inline: true },
      ],
      solution: (
        <>
          <p>Prozentangaben als Dezimalzahl schreiben. Fehlende Äste ergänzt du zu 1, denn an jeder Verzweigung gilt: Summe = 1.</p>
          <MB>{`P(${k.a[1]}) = 1 - ${tex(pa)} = ${tex(1 - pa)}`}</MB>
          <p>
            Achtung: Die zweite Angabe bezieht sich nur auf die Personen im jeweiligen Ast. „{q} % der …“ ist deshalb die Wahrscheinlichkeit am Ast <em>nach</em> {k.a[0]}, nicht
            die Wahrscheinlichkeit für den ganzen Pfad.
          </p>
          <Baum root={tree(false)} stages={k.s} />
        </>
      ),
    }
  },
}

const anzahlPfade: ExerciseDef = {
  id: 'pfade',
  title: 'Wie viele Möglichkeiten gibt es?',
  level: 1,
  gen: () => {
    const f = rnd(2, 3)
    const g = rnd(2, 4)
    const h = rnd(2, 5)
    const anzahl = f * g * h
    return {
      prompt: (
        <>
          <p>
            Ein Fahrradhersteller bietet ein Modell mit {f} Felgenarten, {g} Federungsarten und {h} Farben an. Ein Vater wählt rein zufällig eine Ausführung aus.
          </p>
        </>
      ),
      fields: [
        { kind: 'num', key: 'n', label: 'Anzahl der verschiedenen Ausführungen (Pfade im Baumdiagramm)', expected: anzahl, tol: 0 },
        { kind: 'prob', key: 'p', label: 'Wahrscheinlichkeit, dass er genau das Wunschrad seines Sohnes wählt', expected: 1 / anzahl },
      ],
      solution: (
        <>
          <p>
            Das Baumdiagramm hat 3 Stufen. Von jedem der {f} Äste der 1. Stufe gehen {g} Äste ab, von jedem dieser Äste wieder {h}. Die Anzahl der Pfade ist deshalb das Produkt:
          </p>
          <MB>{`${f} \\cdot ${g} \\cdot ${h} = ${anzahl}`}</MB>
          <p>Jede Ausführung ist gleich wahrscheinlich:</p>
          <MB>{`P(\\text{Wunschrad}) = \\frac{1}{${f}} \\cdot \\frac{1}{${g}} \\cdot \\frac{1}{${h}} = \\frac{1}{${anzahl}} \\approx ${tex((1 / anzahl) * 100, 2)}\\,\\%`}</MB>
        </>
      ),
    }
  },
}

const dreiSorten: ExerciseDef = {
  id: 'drei',
  title: 'Drei Sorten ohne Zurücklegen',
  level: 3,
  gen: () => {
    const s = shuffle([
      ['rot', 'r'],
      ['gelb', 'y'],
      ['grün', 'g'],
    ])
    const c = s.map(() => rnd(2, 6))
    const n = c.reduce((x, y) => x + y, 0)
    const build = (keys: boolean): Knoten[] =>
      s.map(([, l], i) => ({
        label: l,
        p: `${c[i]}/${n}`,
        key: keys ? `k${i}` : undefined,
        children: s.map(([, l2], j) => ({ label: l2, p: `${i === j ? c[j] - 1 : c[j]}/${n - 1}`, key: keys ? `k${i}${j}` : undefined })),
      }))
    const fields = [
      ...s.map((_, i) => ({ kind: 'prob' as const, key: `k${i}`, expected: c[i] / n, placeholder: '?', inline: true })),
      ...s.flatMap((_, i) => s.map((__, j) => ({ kind: 'prob' as const, key: `k${i}${j}`, expected: (i === j ? c[j] - 1 : c[j]) / (n - 1), placeholder: '?', inline: true }))),
    ]
    return {
      prompt: (F) => (
        <>
          <p>
            In einer Tüte sind {c[0]} {s[0][0]}e ({s[0][1]}), {c[1]} {s[1][0]}e ({s[1][1]}) und {c[2]} {s[2][0]}e ({s[2][1]}) Gummibärchen. Du ziehst zwei Bärchen nacheinander
            und isst sie auf. Vervollständige das Baumdiagramm.
          </p>
          <Baum root={build(true)} F={F} stages={['1. Zug', '2. Zug']} />
        </>
      ),
      fields,
      solution: (
        <>
          <p>
            1. Zug: Nenner {n}. 2. Zug: Nenner {n - 1}. Die Sorte, die im 1. Zug gezogen wurde, hat im 2. Zug ein Bärchen weniger.
          </p>
          <Baum root={build(false)} stages={['1. Zug', '2. Zug']} />
          <p>
            Kontrolle am Ast {s[0][1]}: <M>{`\\frac{${c[0] - 1}}{${n - 1}} + \\frac{${c[1]}}{${n - 1}} + \\frac{${c[2]}}{${n - 1}} = \\frac{${n - 1}}{${n - 1}} = 1`}</M> ✓
          </p>
        </>
      ),
    }
  },
}

export const EXERCISES_BAUM = [mitZuruecklegen, anzahlPfade, ohneZuruecklegen, ausProzent, dreiSorten]

export default function Baumdiagramme() {
  return (
    <Lesson goal="Du stellst mehrstufige Zufallsexperimente als Baumdiagramm dar und trägst die Übergangswahrscheinlichkeiten richtig ein – mit und ohne Zurücklegen.">
      <Section no={1} title="Das musst du wissen">
        <p>
          Werden mehrere Zufallsexperimente nacheinander ausgeführt (zweimal ziehen, dreimal schießen, Gericht und dann Getränk wählen), spricht man von einem{' '}
          <strong>mehrstufigen Zufallsexperiment</strong>. Ein <strong>Baumdiagramm</strong> zeigt alle Möglichkeiten übersichtlich.
        </p>
        <div className="lp-grid2">
          <Merke title="Aufbau eines Baumdiagramms">
            <ul>
              <li>Jede Stufe des Experiments ist eine Ebene im Baum.</li>
              <li>An jedem Ast steht die <strong>Übergangswahrscheinlichkeit</strong>.</li>
              <li>
                An jeder Verzweigung ergeben die Äste zusammen <M>1</M> (Merkhilfe: <M>{'p_1 + p_2 = 1'}</M>).
              </li>
              <li>Jeder Weg vom Start bis zum Ende ist ein <strong>Pfad</strong> = ein Ergebnis.</li>
            </ul>
          </Merke>
          <Merke title="Mit oder ohne Zurücklegen?">
            <ul>
              <li>
                <strong>Mit Zurücklegen</strong> (Glücksrad, Münze, Würfel, zurückgelegte Kugel): Die Wahrscheinlichkeiten sind auf jeder Stufe <em>gleich</em>.
              </li>
              <li>
                <strong>Ohne Zurücklegen</strong> (Gummibärchen essen, Personen auswählen, Lose ziehen): Auf der 2. Stufe ist der Nenner um 1 kleiner, bei der gezogenen Sorte auch
                der Zähler.
              </li>
            </ul>
          </Merke>
        </div>
        <Vorgehen
          steps={[
            'Überlege: Wie viele Stufen hat das Experiment? Welche Ergebnisse gibt es auf jeder Stufe?',
            'Zeichne von einem Startpunkt die Äste der 1. Stufe und beschrifte die Enden (z. B. r, b).',
            'Zeichne an jedes Ende die Äste der nächsten Stufe.',
            'Trage an jeden Ast die Wahrscheinlichkeit ein. Ohne Zurücklegen: Nenner und ggf. Zähler anpassen.',
            'Kontrolle: An jeder Verzweigung ergibt die Summe 1.',
          ]}
        />
      </Section>

      <Section no={2} title="Beispiel Schritt für Schritt">
        <Beispiel
          title="Das Gummibärchen-Experiment"
          aufgabe={
            <>
              <p>In einer Tüte sind 10 rote (r), 9 gelbe (y) und 6 grüne (g) Gummibärchen. Du ziehst eins, isst es auf und ziehst ein zweites. Zeichne das Baumdiagramm.</p>
              <Urne counts={[['rot', 10], ['gelb', 9], ['grün', 6]]} />
            </>
          }
          steps={[
            {
              title: 'Stufen erkennen',
              body: <p>Zwei Stufen (1. und 2. Bärchen), auf jeder Stufe drei Ergebnisse: r, y, g. Das Bärchen wird gegessen → <strong>ohne Zurücklegen</strong>.</p>,
            },
            {
              title: '1. Stufe',
              body: (
                <>
                  <p>Insgesamt 25 Bärchen:</p>
                  <MB>{'P(r) = \\tfrac{10}{25} \\qquad P(y) = \\tfrac{9}{25} \\qquad P(g) = \\tfrac{6}{25}'}</MB>
                </>
              ),
            },
            {
              title: '2. Stufe',
              body: (
                <p>
                  Jetzt sind nur noch 24 Bärchen in der Tüte (Nenner 24). Wurde zuerst ein rotes gezogen, sind nur noch 9 rote übrig: <M>{'\\tfrac{9}{24}'}</M>. Die anderen Sorten
                  bleiben gleich: <M>{'\\tfrac{9}{24}'}</M> gelb, <M>{'\\tfrac{6}{24}'}</M> grün.
                </p>
              ),
            },
            {
              title: 'Fertiges Baumdiagramm',
              body: (
                <Baum
                  stages={['1. Bärchen', '2. Bärchen']}
                  root={[
                    { label: 'r', p: '10/25', children: [{ label: 'r', p: '9/24' }, { label: 'y', p: '9/24' }, { label: 'g', p: '6/24' }] },
                    { label: 'y', p: '9/25', children: [{ label: 'r', p: '10/24' }, { label: 'y', p: '8/24' }, { label: 'g', p: '6/24' }] },
                    { label: 'g', p: '6/25', children: [{ label: 'r', p: '10/24' }, { label: 'y', p: '9/24' }, { label: 'g', p: '5/24' }] },
                  ]}
                />
              ),
            },
            { title: 'Kontrolle', body: <p>Am Ast r: <M>{'\\tfrac{9}{24} + \\tfrac{9}{24} + \\tfrac{6}{24} = \\tfrac{24}{24} = 1'}</M> ✓ – an allen Verzweigungen genauso.</p> },
          ]}
        />
        <Achtung
          items={[
            'Ohne Zurücklegen den Nenner auf der 2. Stufe verkleinern – das wird am häufigsten vergessen.',
            <>Bei Prozentangaben wie „80 % der Vegetarier trinken Wasser“ gehört <M>{'0{,}8'}</M> an den Ast <em>nach</em> V – nicht an den Anfang.</>,
            `Brüche im Baum müssen nicht gekürzt werden (z. B. ${fracText(6, 24)} oder 6/24) – beim Weiterrechnen ist ungekürzt oft sogar praktischer.`,
          ]}
        />
      </Section>

      <Section no={3} title="Jetzt du!">
        <Uebungen defs={EXERCISES_BAUM} />
      </Section>
    </Lesson>
  )
}

import Baum, { type Knoten } from './Baum'
import { zweiSorten } from './Baumdiagramme'
import { Achtung, Beispiel, Lesson, M, MB, Merke, Section, Uebungen, Vorgehen, fmt, frac, pick, rnd, tex, texPct, type ExerciseDef } from './kit'

// Schritt 8: Pfadregeln (Merkhilfe: 1. Pfadregel = Produktregel, 2. Pfadregel = Summenregel)

const f = (z: number, n: number) => `\\frac{${z}}{${n}}`
/** Ergebnis eines Bruchs: gekürzt, als Dezimalzahl und in Prozent */
const ergebnis = (z: number, n: number) => {
  const g = frac(z, n).replace('tfrac', 'frac')
  return `${g !== f(z, n) ? `= ${g} ` : ''}\\approx ${tex(z / n, 4)} = ${texPct(z / n)}`
}

const URNEN = [
  { a: 'rot', b: 'blau', la: 'r', lb: 'b' },
  { a: 'grün', b: 'gelb', la: 'g', lb: 'y' },
]

const produktregel: ExerciseDef = {
  id: 'produkt',
  title: '1. Pfadregel (Produktregel)',
  level: 1,
  gen: () => {
    const u = pick(URNEN)
    const a = rnd(2, 7)
    const b = rnd(2, 7)
    const ohne = Math.random() < 0.5
    const n = a + b
    const m = ohne ? n - 1 : n
    const pfad = pick(['AA', 'AB', 'BA', 'BB'])
    const z1 = pfad[0] === 'A' ? a : b
    const z2 = pfad[1] === 'A' ? (pfad[0] === 'A' && ohne ? a - 1 : a) : pfad[0] === 'B' && ohne ? b - 1 : b
    const name = (c: string) => (c === 'A' ? u.a : u.b)
    const lab = pfad.split('').map((c) => (c === 'A' ? u.la : u.lb)).join('')
    return {
      prompt: (
        <>
          <p>
            In einer Urne liegen {a} {u.a}e und {b} {u.b}e Kugeln. Es werden zwei Kugeln {ohne ? 'ohne' : 'mit'} Zurücklegen gezogen.
          </p>
          <Baum root={zweiSorten(a, b, u.la, u.lb, ohne)} stages={['1. Zug', '2. Zug']} />
          <p>
            Berechne die Wahrscheinlichkeit, dass zuerst eine {name(pfad[0])}e und dann eine {name(pfad[1])}e Kugel gezogen wird.
          </p>
        </>
      ),
      fields: [{ kind: 'prob', key: 'p', label: <M>{`P(${lab})`}</M>, expected: (z1 * z2) / (n * m) }],
      solution: (
        <>
          <p>Es gehört genau ein Pfad dazu. Entlang des Pfades werden die Wahrscheinlichkeiten multipliziert:</p>
          <MB>{`P(${lab}) = ${f(z1, n)} \\cdot ${f(z2, m)} = ${f(z1 * z2, n * m)} ${ergebnis(z1 * z2, n * m)}`}</MB>
        </>
      ),
    }
  },
}

const summenregel: ExerciseDef = {
  id: 'summe',
  title: '2. Pfadregel (Summenregel): genau eine',
  level: 2,
  gen: () => {
    const u = pick(URNEN)
    const a = rnd(2, 7)
    const b = rnd(2, 7)
    const ohne = Math.random() < 0.6
    const n = a + b
    const m = ohne ? n - 1 : n
    const zaehler = a * b + b * a
    const typ = rnd(0, 1)
    const leaves: Knoten[] = zweiSorten(a, b, u.la, u.lb, ohne)
    // passende Pfade hervorheben
    leaves[0].children![1].hi = true
    leaves[1].children![0].hi = true
    const gleich = ohne ? a * (a - 1) + b * (b - 1) : a * a + b * b
    return {
      prompt: (
        <>
          <p>
            In einer Urne liegen {a} {u.a}e ({u.la}) und {b} {u.b}e ({u.lb}) Kugeln. Es werden zwei Kugeln {ohne ? 'ohne' : 'mit'} Zurücklegen gezogen.
          </p>
          <Baum root={zweiSorten(a, b, u.la, u.lb, ohne)} stages={['1. Zug', '2. Zug']} />
        </>
      ),
      fields: [
        typ === 0
          ? { kind: 'prob', key: 'p', label: <>P(„genau eine {u.a}e Kugel“)</>, expected: zaehler / (n * m) }
          : { kind: 'prob', key: 'p', label: <>P(„beide Kugeln haben die gleiche Farbe“)</>, expected: gleich / (n * m) },
      ],
      solution:
        typ === 0 ? (
          <>
            <p>
              Zwei Pfade gehören zum Ereignis: <M>{`${u.la}${u.lb}`}</M> und <M>{`${u.lb}${u.la}`}</M>. Erst jeden Pfad mit der Produktregel berechnen, dann addieren:
            </p>
            <Baum root={leaves} stages={['1. Zug', '2. Zug']} />
            <MB>{`P = ${f(a, n)} \\cdot ${f(b, m)} + ${f(b, n)} \\cdot ${f(a, m)} = ${f(a * b, n * m)} + ${f(b * a, n * m)} = ${f(zaehler, n * m)} ${ergebnis(zaehler, n * m)}`}</MB>
          </>
        ) : (
          <>
            <p>
              Gleiche Farbe bedeutet die Pfade <M>{`${u.la}${u.la}`}</M> und <M>{`${u.lb}${u.lb}`}</M>:
            </p>
            <MB>{`P = ${f(a, n)} \\cdot ${f(ohne ? a - 1 : a, m)} + ${f(b, n)} \\cdot ${f(ohne ? b - 1 : b, m)} = ${f(gleich, n * m)} ${ergebnis(gleich, n * m)}`}</MB>
          </>
        ),
    }
  },
}

const mindestens: ExerciseDef = {
  id: 'mindestens',
  title: '„Mindestens“ und „höchstens“',
  level: 2,
  gen: () => {
    const n = rnd(18, 28)
    const w = rnd(7, n - 7)
    const j = n - w
    const N = n * (n - 1)
    const jj = j * (j - 1)
    const mm = w * (w - 1)
    return {
      prompt: (
        <>
          <p>
            Eine Klasse hat {n} Schülerinnen und Schüler, darunter {w} Mädchen (M) und {j} Jungen (J). Die Lehrkraft wählt nacheinander zufällig zwei verschiedene Personen
            für eine mündliche Abfrage aus.
          </p>
          <Baum root={zweiSorten(j, w, 'J', 'M', true)} stages={['1. Person', '2. Person']} />
        </>
      ),
      fields: [
        { kind: 'prob', key: 'e1', label: <><M>{'E_1'}</M>: „kein Mädchen“</>, expected: jj / N },
        { kind: 'prob', key: 'e2', label: <><M>{'E_2'}</M>: „höchstens ein Junge“</>, expected: 1 - jj / N },
        { kind: 'prob', key: 'e3', label: <><M>{'E_3'}</M>: „mindestens ein Junge“</>, expected: 1 - mm / N },
      ],
      hint: 'Bruch oder Prozent (zwei Nachkommastellen).',
      solution: (
        <>
          <p>
            <M>{'E_1'}</M>: kein Mädchen = zwei Jungen (Pfad JJ):
          </p>
          <MB>{`P(E_1) = ${f(j, n)} \\cdot ${f(j - 1, n - 1)} = ${f(jj, N)} ${ergebnis(jj, N)}`}</MB>
          <p>
            <M>{'E_2'}</M>: „höchstens ein Junge“ heißt 0 oder 1 Junge. Das Gegenereignis ist „zwei Jungen“ (JJ) – damit geht es schneller:
          </p>
          <MB>{`P(E_2) = 1 - P(JJ) = 1 - ${f(jj, N)} = ${f(N - jj, N)} ${ergebnis(N - jj, N)}`}</MB>
          <p>
            <M>{'E_3'}</M>: „mindestens ein Junge“ heißt 1 oder 2 Jungen. Gegenereignis: „kein Junge“ (MM):
          </p>
          <MB>{`P(E_3) = 1 - P(MM) = 1 - ${f(w, n)} \\cdot ${f(w - 1, n - 1)} = 1 - ${f(mm, N)} = ${f(N - mm, N)} ${ergebnis(N - mm, N)}`}</MB>
        </>
      ),
    }
  },
}

const elfmeter: ExerciseDef = {
  id: 'elfmeter',
  title: 'Dreistufig: Elfmeterschießen',
  level: 3,
  gen: () => {
    const p = pick([0.6, 0.7, 0.75, 0.8, 0.85, 0.9])
    const q = 1 - p
    const T = 'T'
    const V = 'V'
    const t = (x: number) => fmt(x, 2)
    const stage = (depth: number): Knoten[] =>
      [T, V].map((l) => ({ label: l, p: t(l === T ? p : q), children: depth > 1 ? stage(depth - 1) : undefined }))
    return {
      prompt: (
        <>
          <p>
            Eine Spielerin trifft beim Elfmeter mit einer Wahrscheinlichkeit von {fmt(p * 100, 0)} %. Sie schießt dreimal; die Schüsse sind voneinander unabhängig (T = Treffer,
            V = verschossen).
          </p>
          <Baum root={stage(3)} stages={['1. Schuss', '2. Schuss', '3. Schuss']} />
        </>
      ),
      fields: [
        { kind: 'prob', key: 'a', label: 'P(„dreimal Treffer“)', expected: p ** 3 },
        { kind: 'prob', key: 'b', label: 'P(„genau zwei Treffer“)', expected: 3 * p * p * q },
        { kind: 'prob', key: 'c', label: 'P(„mindestens ein Treffer“)', expected: 1 - q ** 3 },
      ],
      hint: 'Auf zwei Nachkommastellen in Prozent runden (oder als Dezimalzahl mit vier Stellen).',
      solution: (
        <>
          <MB>{`P(TTT) = ${tex(p)} \\cdot ${tex(p)} \\cdot ${tex(p)} = ${tex(p ** 3, 4)} = ${texPct(p ** 3)}`}</MB>
          <p>Genau zwei Treffer: Pfade TTV, TVT und VTT – jeder hat die Wahrscheinlichkeit <M>{`${tex(p)}^2 \\cdot ${tex(q)}`}</M>:</p>
          <MB>{`P = 3 \\cdot ${tex(p)} \\cdot ${tex(p)} \\cdot ${tex(q)} = ${tex(3 * p * p * q, 4)} = ${texPct(3 * p * p * q)}`}</MB>
          <p>Mindestens ein Treffer: Gegenereignis „kein Treffer“ (VVV):</p>
          <MB>{`P = 1 - ${tex(q)}^3 = 1 - ${tex(q ** 3, 4)} = ${tex(1 - q ** 3, 4)} = ${texPct(1 - q ** 3)}`}</MB>
        </>
      ),
    }
  },
}

const mensa: ExerciseDef = {
  id: 'mensa',
  title: 'Prüfungsaufgabe: Mensa',
  level: 2,
  gen: () => {
    const pf = pick([0.6, 0.7, 0.75, 0.8])
    const sf = pick([0.4, 0.5, 0.6, 0.65])
    const wv = pick([0.7, 0.75, 0.8, 0.9])
    const pv = 1 - pf
    const sv = 1 - wv
    const klasse = pick([20, 24, 25, 28, 30])
    const t = (x: number) => fmt(x, 2)
    const pS = pf * sf + pv * sv
    const pVW = pv * wv
    return {
      prompt: (
        <>
          <p>
            In der Mensa wählen {fmt(pf * 100, 0)} % das Fleischgericht (F), die anderen das vegetarische Gericht (V). {fmt(sf * 100, 0)} % der Fleischesser trinken Saft (S),
            die übrigen Wasser (W). Von den „Vegetariern“ trinken {fmt(wv * 100, 0)} % Wasser.
          </p>
          <Baum
            stages={['Gericht', 'Getränk']}
            root={[
              { label: 'F', p: t(pf), children: [{ label: 'S', p: t(sf) }, { label: 'W', p: t(1 - sf) }] },
              { label: 'V', p: t(pv), children: [{ label: 'S', p: t(sv) }, { label: 'W', p: t(wv) }] },
            ]}
          />
        </>
      ),
      fields: [
        { kind: 'prob', key: 's', label: <>a) <M>{'E_1'}</M>: „Eine Person trinkt Saft.“</>, expected: pS },
        { kind: 'num', key: 'anz', label: `b) Wie viele von ${klasse} Personen wählen voraussichtlich vegetarisch mit Wasser?`, expected: klasse * pVW, tol: 0.051 },
        { kind: 'prob', key: 'e2', label: <>c) <M>{'E_2'}</M>: „Eine Person wählt kein vegetarisches Gericht mit Saft.“</>, expected: 1 - pv * sv },
      ],
      solution: (
        <>
          <p>a) Saft trinkt man auf zwei Pfaden (FS und VS) – Produktregel, dann Summenregel:</p>
          <MB>{`P(E_1) = ${tex(pf)} \\cdot ${tex(sf)} + ${tex(pv)} \\cdot ${tex(sv)} = ${tex(pf * sf, 4)} + ${tex(pv * sv, 4)} = ${tex(pS, 4)} = ${texPct(pS)}`}</MB>
          <p>b) Erst die Pfadwahrscheinlichkeit, dann mit der Anzahl der Personen multiplizieren:</p>
          <MB>{`P(VW) = ${tex(pv)} \\cdot ${tex(wv)} = ${tex(pVW, 4)} \\qquad ${klasse} \\cdot ${tex(pVW, 4)} = ${tex(klasse * pVW, 2)}`}</MB>
          <p>c) Gegenereignis: „vegetarisch mit Saft“ (VS):</p>
          <MB>{`P(E_2) = 1 - P(VS) = 1 - ${tex(pv)} \\cdot ${tex(sv)} = 1 - ${tex(pv * sv, 4)} = ${tex(1 - pv * sv, 4)} = ${texPct(1 - pv * sv)}`}</MB>
        </>
      ),
    }
  },
}

const tshirt: ExerciseDef = {
  id: 'tshirt',
  title: 'Prüfungsaufgabe: Lieferung mit Mängeln',
  level: 3,
  gen: () => {
    const m = pick([2, 3, 4, 5, 6])
    const fz = pick([1, 2, 3])
    const pm = m / 100
    const pf = fz / 50
    const ok = (1 - pm) * (1 - pf)
    return {
      prompt: (
        <p>
          Ein Händler liefert bedruckte T-Shirts. Erfahrungsgemäß sind {m} von 100 Motivdrucken fehlerhaft und {fz} von 50 T-Shirts haben die falsche Farbe. Beide Fehler treten
          unabhängig voneinander auf. Zeichne zuerst das Baumdiagramm (Stufe 1: Motiv in Ordnung M / fehlerhaft <M>{'\\overline{M}'}</M>, Stufe 2: Farbe richtig F / falsch{' '}
          <M>{'\\overline{F}'}</M>).
        </p>
      ),
      fields: [
        { kind: 'prob', key: 'a', label: 'P(„T-Shirt ohne Mängel“)', expected: ok },
        { kind: 'prob', key: 'b', label: 'P(„höchstens ein Mangel“)', expected: 1 - pm * pf },
      ],
      hint: 'In Prozent mit zwei Nachkommastellen oder als Dezimalzahl mit vier Stellen.',
      solution: (
        <>
          <Baum
            stages={['Motiv', 'Farbe']}
            pathNames={false}
            root={[
              { label: 'M', p: fmt(1 - pm, 2), children: [{ label: 'F', p: fmt(1 - pf, 2), hi: true, end: 'ohne Mängel' }, { label: 'F̄', p: fmt(pf, 2) }] },
              { label: 'M̄', p: fmt(pm, 2), children: [{ label: 'F', p: fmt(1 - pf, 2) }, { label: 'F̄', p: fmt(pf, 2), end: 'zwei Mängel' }] },
            ]}
          />
          <MB>{`P(MF) = ${tex(1 - pm)} \\cdot ${tex(1 - pf)} = ${tex(ok, 4)} = ${texPct(ok)}`}</MB>
          <p>„Höchstens ein Mangel“ ist alles außer „zwei Mängel“:</p>
          <MB>{`P = 1 - P(\\overline{M}\\,\\overline{F}) = 1 - ${tex(pm)} \\cdot ${tex(pf)} = 1 - ${tex(pm * pf, 4)} = ${tex(1 - pm * pf, 4)} = ${texPct(1 - pm * pf)}`}</MB>
        </>
      ),
    }
  },
}

export const EXERCISES_PFADREGELN = [produktregel, summenregel, mindestens, mensa, elfmeter, tshirt]

export default function Pfadregeln() {
  return (
    <Lesson goal="Du berechnest mit der Produkt- und der Summenregel Wahrscheinlichkeiten in mehrstufigen Zufallsexperimenten und nutzt das Gegenereignis bei „mindestens“ und „höchstens“.">
      <Section no={1} title="Das musst du wissen">
        <div className="lp-grid2">
          <Merke title="1. Pfadregel (Produktregel)">
            <p>Die Wahrscheinlichkeit eines Pfades ist das <strong>Produkt</strong> der Wahrscheinlichkeiten entlang dieses Pfades.</p>
            <MB>{'P(\\{AKM\\}) = p_1 \\cdot p_3 \\cdot p_5'}</MB>
          </Merke>
          <Merke title="2. Pfadregel (Summenregel)">
            <p>Gehören mehrere Pfade zu einem Ereignis, werden ihre Pfadwahrscheinlichkeiten <strong>addiert</strong>.</p>
            <MB>{'P(\\{ALM; BKN\\}) = p_1 \\cdot p_4 \\cdot p_5 + p_2 \\cdot p_3 \\cdot p_6'}</MB>
          </Merke>
        </div>
        <Merke title="Signalwörter">
          <ul>
            <li>
              <strong>„genau“</strong>: alle passenden Pfade suchen und addieren.
            </li>
            <li>
              <strong>„mindestens einer“</strong>: Gegenereignis „keiner“ → <M>{'P = 1 - P(\\text{keiner})'}</M>
            </li>
            <li>
              <strong>„höchstens einer“</strong> (bei 2 Stufen): Gegenereignis „beide“ → <M>{'P = 1 - P(\\text{beide})'}</M>
            </li>
            <li>
              <strong>„Wie viele von n Personen …?“</strong>: erwartete Anzahl <M>{'= n \\cdot P'}</M>
            </li>
          </ul>
        </Merke>
        <Vorgehen
          steps={[
            'Baumdiagramm zeichnen bzw. vervollständigen.',
            'Alle Pfade markieren, die zum gesuchten Ereignis gehören. Gibt es sehr viele, prüfe, ob das Gegenereignis weniger Pfade hat.',
            'Für jeden markierten Pfad die Wahrscheinlichkeiten multiplizieren (Produktregel).',
            'Die Ergebnisse der Pfade addieren (Summenregel) – bzw. vom Gegenereignis aus 1 − … rechnen.',
            'Ergebnis sinnvoll angeben (Bruch, Dezimalzahl oder Prozent) und mit einem Satz antworten.',
          ]}
        />
      </Section>

      <Section no={2} title="Beispiel Schritt für Schritt">
        <Beispiel
          title="Abschlussprüfung: Essen in der Mensa"
          aufgabe={
            <p>
              Eine Klasse kann zwischen Fleischgericht (F) und vegetarischem Gericht (V) wählen, als Getränk Saft (S) oder Wasser (W). ¾ der Schüler wählen das Fleischgericht. 80 %
              der „Vegetarier“ trinken Wasser, 60 % der „Fleischesser“ trinken Saft. a) Wie wahrscheinlich trinkt ein Schüler Saft? b) Wie viele von 20 Schülern wählen vegetarisch
              mit Wasser? c) Wie wahrscheinlich wählt ein Schüler <em>kein</em> vegetarisches Gericht mit Saft?
            </p>
          }
          steps={[
            {
              title: 'Baumdiagramm aufstellen',
              body: (
                <Baum
                  stages={['Gericht', 'Getränk']}
                  root={[
                    { label: 'F', p: '0,75', children: [{ label: 'S', p: '0,6', end: '0,75 · 0,6 = 0,45' }, { label: 'W', p: '0,4', end: '0,75 · 0,4 = 0,3' }] },
                    { label: 'V', p: '0,25', children: [{ label: 'S', p: '0,2', end: '0,25 · 0,2 = 0,05' }, { label: 'W', p: '0,8', end: '0,25 · 0,8 = 0,2' }] },
                  ]}
                />
              ),
            },
            {
              title: 'a) Saft – zwei Pfade (FS und VS)',
              body: <MB>{'P(S) = 0{,}75 \\cdot 0{,}6 + 0{,}25 \\cdot 0{,}2 = 0{,}45 + 0{,}05 = 0{,}5 = 50\\,\\%'}</MB>,
            },
            {
              title: 'b) Erwartete Anzahl',
              body: (
                <>
                  <MB>{'P(VW) = 0{,}25 \\cdot 0{,}8 = 0{,}2 \\qquad 20 \\cdot 0{,}2 = 4'}</MB>
                  <p>Etwa 4 Schüler wählen ein vegetarisches Menü mit Wasser.</p>
                </>
              ),
            },
            {
              title: 'c) Gegenereignis nutzen',
              body: (
                <>
                  <p>„Kein vegetarisches Gericht mit Saft“ sind drei Pfade (FS, FW, VW). Schneller geht es mit dem Gegenereignis VS:</p>
                  <MB>{'P(E_2) = 1 - P(VS) = 1 - 0{,}05 = 0{,}95 = 95\\,\\%'}</MB>
                </>
              ),
            },
          ]}
        />
        <Achtung
          items={[
            'Entlang eines Pfades wird multipliziert, verschiedene Pfade werden addiert – nicht umgekehrt.',
            <>„Genau eine rote Kugel“ hat bei zwei Zügen <em>zwei</em> Pfade: rb und br.</>,
            '„Mindestens einer“ und „keiner“ sind Gegenereignisse – das spart viel Rechenarbeit.',
            'Ohne Zurücklegen ändern sich die Wahrscheinlichkeiten auf der zweiten Stufe.',
          ]}
        />
      </Section>

      <Section no={3} title="Jetzt du!">
        <Uebungen defs={EXERCISES_PFADREGELN} />
      </Section>
    </Lesson>
  )
}

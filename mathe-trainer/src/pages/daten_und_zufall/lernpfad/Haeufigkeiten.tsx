import { Achtung, Beispiel, Lesson, M, MB, Merke, QuerTabelle, Section, Tabelle, Uebungen, Vorgehen, fmt, frac, gcd, pick, rnd, shuffle, tex, texPct, type ExerciseDef } from './kit'

// Schritt 2: absolute und relative Häufigkeit (Merkhilfe: H, h = H : n)

const SITUATIONEN = [
  { text: (n: number, h: number) => `Bei einer Umfrage unter ${n} Jugendlichen gaben ${h} an, täglich mehr als drei Stunden am Smartphone zu verbringen.`, merkmal: 'mehr als drei Stunden am Smartphone' },
  { text: (n: number, h: number) => `Von ${n} Schülerinnen und Schülern der Abschlussklassen wollen ${h} nach der Wirtschaftsschule eine kaufmännische Ausbildung beginnen.`, merkmal: 'kaufmännische Ausbildung' },
  { text: (n: number, h: number) => `Eine Münze wurde ${n}-mal geworfen. Dabei fiel ${h}-mal „Zahl“.`, merkmal: '„Zahl“' },
  { text: (n: number, h: number) => `In einer Lieferung von ${n} T-Shirts waren ${h} falsch bedruckt.`, merkmal: 'falsch bedruckt' },
  { text: (n: number, h: number) => `Bei einer Verkehrskontrolle wurden ${n} Fahrräder überprüft, ${h} davon hatten kein funktionierendes Licht.`, merkmal: 'ohne Licht' },
]

const NS = [20, 25, 40, 50, 80, 120, 125, 200, 250, 400]

const relativBerechnen: ExerciseDef = {
  id: 'relativ',
  title: 'Relative Häufigkeit berechnen',
  level: 1,
  gen: () => {
    const s = pick(SITUATIONEN)
    const n = pick(NS)
    const H = rnd(Math.ceil(n * 0.08), Math.floor(n * 0.7))
    const h = H / n
    return {
      prompt: <p>{s.text(n, H)}</p>,
      fields: [
        { kind: 'num', key: 'H', label: 'absolute Häufigkeit H', expected: H, tol: 0 },
        { kind: 'num', key: 'n', label: 'Anzahl aller Daten n', expected: n, tol: 0 },
        { kind: 'prob', key: 'h', label: 'relative Häufigkeit h (in %)', expected: h, placeholder: 'z. B. 12,5 %' },
      ],
      hint: 'Die relative Häufigkeit darfst du als Bruch, Dezimalzahl oder in Prozent eingeben (gerundet auf zwei Nachkommastellen).',
      solution: (
        <>
          <p>
            Absolute Häufigkeit: <M>{`H = ${H}`}</M>, Anzahl aller Daten: <M>{`n = ${n}`}</M>
          </p>
          <MB>{`h = \\frac{H}{n} = \\frac{${H}}{${n}}${gcd(H, n) > 1 ? ` = ${frac(H, n).replace('tfrac', 'frac')}` : ''} = ${tex(h, 4)} = ${texPct(h)}`}</MB>
        </>
      ),
    }
  },
}

const BUCHSTABEN = ['A', 'D', 'I', 'R', 'T', 'W']

const tabelleRelativ: ExerciseDef = {
  id: 'tabelle-relativ',
  title: 'Häufigkeitstabelle mit relativen Häufigkeiten',
  level: 2,
  gen: () => {
    const n = pick([20, 25, 40, 50])
    const letters = shuffle(BUCHSTABEN).slice(0, 4).sort()
    const seq = Array.from({ length: n }, () => pick(letters))
    // jeder Buchstabe mindestens einmal
    letters.forEach((l, i) => (seq[i] = l))
    const shuffled = shuffle(seq)
    const H = letters.map((l) => shuffled.filter((x) => x === l).length)
    return {
      prompt: (F) => (
        <>
          <p>
            Lilly wirft {n}-mal einen Buchstabenwürfel und notiert die Ergebnisse:
          </p>
          <p style={{ fontFamily: 'monospace', fontSize: 20, letterSpacing: 3, wordBreak: 'break-all' }}>{shuffled.join('')}</p>
          <p>Bestimme die absoluten und die relativen Häufigkeiten.</p>
          <QuerTabelle
            rows={[
              { head: 'Buchstabe', cells: letters },
              { head: 'H', cells: letters.map((_, i) => F(`H${i}`)) },
              { head: 'h', cells: letters.map((_, i) => F(`h${i}`)) },
            ]}
          />
        </>
      ),
      fields: [
        ...H.map((v, i) => ({ kind: 'num' as const, key: `H${i}`, expected: v, tol: 0, size: 'sm' as const })),
        ...H.map((v, i) => ({ kind: 'prob' as const, key: `h${i}`, expected: v / n, size: 'sm' as const, placeholder: 'h' })),
      ],
      hint: 'h als Bruch (z. B. 7/20), Dezimalzahl oder Prozent.',
      solution: (
        <>
          <p>
            Zähle jeden Buchstaben (<M>H</M>) und teile durch die Anzahl aller Würfe <M>{`n = ${n}`}</M>:
          </p>
          <Tabelle
            head={['Buchstabe', 'H', 'h = H : n', 'in %']}
            rows={letters.map((l, i) => [l, String(H[i]), <M key="a">{`\\tfrac{${H[i]}}{${n}} = ${tex(H[i] / n, 4)}`}</M>, `${fmt((H[i] / n) * 100, 2)} %`])}
          />
          <p>
            Kontrolle: <M>{`${H.join(' + ')} = ${n}`}</M> und alle relativen Häufigkeiten ergeben zusammen <M>{'1 = 100\\,\\%'}</M>.
          </p>
        </>
      ),
    }
  },
}

const rueckwaerts: ExerciseDef = {
  id: 'rueckwaerts',
  title: 'Rückwärts rechnen: H oder n gesucht',
  level: 2,
  gen: () => {
    const pct = pick([5, 8, 12, 15, 16, 20, 24, 25, 30, 35, 36, 40, 45, 60, 64, 75])
    // nur Kombinationen mit ganzzahligem H
    const n = pick([50, 125, 200, 250, 300, 400, 500, 600, 800, 1200].filter((v) => Number.isInteger((pct * v) / 100)))
    const H = (pct * n) / 100
    const ctx = pick([
      { gruppe: 'Jugendliche', merkmal: 'nutzen täglich einen Streamingdienst' },
      { gruppe: 'Kundinnen und Kunden', merkmal: 'bezahlen mit dem Smartphone' },
      { gruppe: 'Beschäftigte', merkmal: 'kommen mit dem Fahrrad zur Arbeit' },
      { gruppe: 'Besucherinnen und Besucher', merkmal: 'kaufen ein Getränk am Kiosk' },
    ])
    if (Math.random() < 0.5) {
      return {
        prompt: (
          <p>
            Bei einer Befragung von {fmt(n, 0)} {ctx.gruppe} gaben {pct} % an: Sie {ctx.merkmal}. Wie viele Befragte sind das?
          </p>
        ),
        fields: [{ kind: 'num', key: 'H', label: 'absolute Häufigkeit H', expected: H, tol: 0 }],
        solution: (
          <>
            <p>Gegeben sind <M>{`h = ${pct}\\,\\% = ${tex(pct / 100)}`}</M> und <M>{`n = ${n}`}</M>. Gesucht ist <M>H</M>.</p>
            <MB>{`h = \\frac{H}{n} \\quad \\big| \\cdot n`}</MB>
            <MB>{`H = h \\cdot n = ${tex(pct / 100)} \\cdot ${n} = ${H}`}</MB>
            <p>Es sind <strong>{fmt(H, 0)}</strong> Personen.</p>
          </>
        ),
      }
    }
    return {
      prompt: (
        <p>
          {fmt(H, 0)} der befragten {ctx.gruppe} {ctx.merkmal}. Das sind {pct} % aller Befragten. Wie viele Personen wurden insgesamt befragt?
        </p>
      ),
      fields: [{ kind: 'num', key: 'n', label: 'Anzahl aller Befragten n', expected: n, tol: 0 }],
      solution: (
        <>
          <p>Gegeben sind <M>{`H = ${H}`}</M> und <M>{`h = ${pct}\\,\\% = ${tex(pct / 100)}`}</M>. Gesucht ist <M>n</M>.</p>
          <MB>{`h = \\frac{H}{n} \\quad \\big| \\cdot n`}</MB>
          <MB>{`h \\cdot n = H \\quad \\big| : h`}</MB>
          <MB>{`n = \\frac{H}{h} = \\frac{${H}}{${tex(pct / 100)}} = ${n}`}</MB>
          <p>Es wurden <strong>{fmt(n, 0)}</strong> Personen befragt.</p>
        </>
      ),
    }
  },
}

const GRUPPEN = ['15 – 19', '20 – 24', '25 – 29', '30 – 34']

const tabelleAP: ExerciseDef = {
  id: 'tabelle-ap',
  title: 'Prüfungsaufgabe: Tabelle auswerten',
  level: 3,
  gen: () => {
    const ctx = pick([
      { titel: 'Ein Sportverein hat seine Mitglieder befragt, ob sie an Wettkämpfen teilnehmen.', zeile1: 'befragte Mitglieder', zeile2: 'davon mit Wettkampf', ereignis: 'nimmt an Wettkämpfen teil' },
      { titel: 'Eine Krankenkasse hat erhoben, wie viele Versicherte regelmäßig Sport treiben.', zeile1: 'befragte Personen', zeile2: 'davon treiben Sport', ereignis: 'treibt regelmäßig Sport' },
      { titel: 'Ein Mobilfunkanbieter hat untersucht, wie viele Kunden einen Vertrag mit Datenflatrate haben.', zeile1: 'Kunden', zeile2: 'davon mit Flatrate', ereignis: 'hat eine Datenflatrate' },
    ])
    const ns = GRUPPEN.map(() => rnd(16, 40) * 10)
    const ks = ns.map((n) => Math.round(n * rnd(25, 70) / 100))
    const g = rnd(0, 3)
    const a = rnd(0, 2)
    const Hsum = ks[a] + ks[a + 1]
    const hG = ks[g] / ns[g]
    const total = ns.reduce((s, v) => s + v, 0)
    const ktotal = ks.reduce((s, v) => s + v, 0)
    return {
      prompt: (
        <>
          <p>{ctx.titel}</p>
          <QuerTabelle
            rows={[
              { head: 'Altersgruppe', cells: GRUPPEN },
              { head: ctx.zeile1, cells: ns.map(String) },
              { head: ctx.zeile2, cells: ks.map(String) },
            ]}
          />
        </>
      ),
      fields: [
        { kind: 'num', key: 'H', label: `a) Absolute Häufigkeit der Personen aus den Gruppen ${GRUPPEN[a]} und ${GRUPPEN[a + 1]}, für die gilt: „${ctx.ereignis}“`, expected: Hsum, tol: 0 },
        { kind: 'prob', key: 'h', label: `b) Relative Häufigkeit von E: „Person ${ctx.ereignis}“ in der Gruppe ${GRUPPEN[g]}`, expected: hG },
        { kind: 'prob', key: 'hq', label: 'c) Relative Häufigkeit des Gegenereignisses in derselben Gruppe', expected: 1 - hG },
        { kind: 'prob', key: 'hg', label: 'd) Prozentualer Anteil über alle Gruppen zusammen', expected: ktotal / total },
      ],
      hint: 'Relative Häufigkeiten auf zwei Nachkommastellen in Prozent runden (z. B. 37,29 %) oder als Bruch angeben.',
      solution: (
        <>
          <p>
            <strong>a)</strong> Die beiden Werte aus der unteren Zeile addieren: <M>{`H = ${ks[a]} + ${ks[a + 1]} = ${Hsum}`}</M>
          </p>
          <p>
            <strong>b)</strong> In der Gruppe {GRUPPEN[g]}: <M>{`h(E) = \\frac{${ks[g]}}{${ns[g]}} \\approx ${tex(hG, 4)} = ${texPct(hG)}`}</M>
          </p>
          <p>
            <strong>c)</strong> Gegenereignis: <M>{`h(\\overline{E}) = 1 - h(E) = 1 - ${tex(hG, 4)} = ${tex(1 - hG, 4)} = ${texPct(1 - hG)}`}</M>
          </p>
          <p>
            <strong>d)</strong> Alle Personen mit dem Merkmal durch alle Befragten:
          </p>
          <MB>{`h = \\frac{${ks.join(' + ')}}{${ns.join(' + ')}} = \\frac{${ktotal}}{${total}} \\approx ${texPct(ktotal / total)}`}</MB>
        </>
      ),
    }
  },
}

const MOEGLICH = ['0', '1', '0,35', '7/8', '42 %', '0,05', '100 %', '3/20']
const UNMOEGLICH = ['1,2', '105 %', '−0,1', '9/7', '−5 %', '1,01']

const welcherWert: ExerciseDef = {
  id: 'welcher-wert',
  title: 'Kann das eine relative Häufigkeit sein?',
  level: 1,
  gen: () => {
    const bad = pick(UNMOEGLICH)
    const options = shuffle([...shuffle(MOEGLICH).slice(0, 3), bad])
    return {
      prompt: <p>Drei der vier Werte können relative Häufigkeiten sein, einer nicht. Welcher Wert ist <strong>keine</strong> relative Häufigkeit?</p>,
      fields: [{ kind: 'choice', key: 'w', options, expected: options.indexOf(bad), display: 'buttons' }],
      solution: (
        <>
          <p>
            Für jede relative Häufigkeit gilt <M>{'0 \\le h \\le 1'}</M> bzw. <M>{'0\\,\\% \\le h \\le 100\\,\\%'}</M>, denn <M>H</M> kann nie negativ und nie größer als <M>n</M> sein.
          </p>
          <p>
            <strong>{bad}</strong> liegt außerhalb dieses Bereichs und kann daher keine relative Häufigkeit sein.
          </p>
        </>
      ),
    }
  },
}

export const EXERCISES_HAEUFIGKEITEN = [welcherWert, relativBerechnen, tabelleRelativ, rueckwaerts, tabelleAP]

export default function Haeufigkeiten() {
  const H = [10, 4, 16, 11, 12, 7]
  return (
    <Lesson goal="Du unterscheidest absolute und relative Häufigkeit, rechnest zwischen Bruch, Dezimalzahl und Prozent um und nutzt das Gegenereignis.">
      <Section no={1} title="Das musst du wissen">
        <div className="lp-grid2">
          <Merke title="Absolute Häufigkeit H">
            <p>
              Die <strong>absolute Häufigkeit</strong> <M>H</M> gibt an, <em>wie oft</em> ein Ergebnis vorkommt – also die Anzahl der Merkmalsträger mit diesem Merkmal. Man
              erhält sie durch Abzählen.
            </p>
            <p>Beispiel: Beim 60-maligen Würfeln fiel 16-mal die Drei: <M>{'H(3) = 16'}</M>.</p>
          </Merke>
          <Merke title="Relative Häufigkeit h (Merkhilfe)">
            <MB>{'h = \\frac{\\text{Absolute Häufigkeit } H}{\\text{Grundgesamtheit } n}'}</MB>
            <p>
              Sie gibt den <em>Anteil</em> an. Beispiel: <M>{'h(3) = \\frac{16}{60} \\approx 0{,}2667 = 26{,}67\\,\\%'}</M>
            </p>
          </Merke>
        </div>
        <Merke title="Wichtige Eigenschaften">
          <ul>
            <li>
              Es gilt immer <M>{'0 \\le h \\le 1'}</M>, also zwischen <M>{'0\\,\\%'}</M> und <M>{'100\\,\\%'}</M>.
            </li>
            <li>
              Alle relativen Häufigkeiten zusammen ergeben <M>{'1 = 100\\,\\%'}</M>.
            </li>
            <li>
              <strong>Gegenereignis</strong> <M>{'\\overline{E}'}</M> („nicht E“): <M>{'h(\\overline{E}) = 1 - h(E)'}</M>
            </li>
            <li>
              Umrechnen: Bruch → Dezimalzahl (Zähler : Nenner) → Prozent (· 100): <M>{'\\tfrac{3}{8} = 0{,}375 = 37{,}5\\,\\%'}</M>
            </li>
          </ul>
        </Merke>
        <Vorgehen
          steps={[
            <>Bestimme <M>n</M>: Wie viele Daten gibt es insgesamt?</>,
            <>Zähle ab, wie oft das gesuchte Merkmal vorkommt → <M>H</M>.</>,
            <>Teile: <M>{'h = H : n'}</M>. Schreibe das Ergebnis als Bruch, Dezimalzahl oder in Prozent.</>,
            <>Ist <M>H</M> oder <M>n</M> gesucht, stellst du die Formel um: <M>{'H = h \\cdot n'}</M> bzw. <M>{'n = H : h'}</M>.</>,
          ]}
        />
      </Section>

      <Section no={2} title="Beispiel Schritt für Schritt">
        <Beispiel
          title="Würfeltest mit 60 Würfen"
          aufgabe={
            <>
              <p>Ein Würfel wurde 60-mal geworfen:</p>
              <QuerTabelle rows={[{ head: 'Augenzahl', cells: ['1', '2', '3', '4', '5', '6'] }, { head: 'H', cells: H.map(String) }]} />
              <p>Berechne die relativen Häufigkeiten und die relative Häufigkeit des Ereignisses E: „keine Sechs“.</p>
            </>
          }
          steps={[
            { title: 'Grundgesamtheit bestimmen', body: <p><M>{'n = 10 + 4 + 16 + 11 + 12 + 7 = 60'}</M></p> },
            {
              title: 'Relative Häufigkeiten berechnen',
              body: (
                <Tabelle
                  head={['Augenzahl', 'h als Bruch', 'Dezimalzahl', 'Prozent']}
                  rows={H.map((v, i) => [String(i + 1), <M key="b">{`\\tfrac{${v}}{60}${gcd(v, 60) > 1 ? ` = ${frac(v, 60)}` : ''}`}</M>, fmt(v / 60, 4), `${fmt((v / 60) * 100, 2)} %`])}
                />
              ),
            },
            { title: 'Kontrolle', body: <p>Die Summe aller relativen Häufigkeiten ist <M>{'\\tfrac{60}{60} = 1 = 100\\,\\%'}</M> ✓</p> },
            {
              title: 'Gegenereignis nutzen',
              body: (
                <>
                  <p>„keine Sechs“ ist das Gegenereignis zu „Sechs“:</p>
                  <MB>{'h(\\overline{6}) = 1 - h(6) = 1 - \\tfrac{7}{60} = \\tfrac{53}{60} \\approx 88{,}33\\,\\%'}</MB>
                </>
              ),
            },
          ]}
        />
        <Achtung
          items={[
            <>Nicht durch die falsche Zahl teilen: Im Nenner steht immer die <strong>Gesamtzahl</strong> <M>n</M>.</>,
            <>Prozent ist nur eine andere Schreibweise: <M>{'0{,}25 = 25\\,\\%'}</M> – nicht <M>{'0{,}25\\,\\%'}</M>!</>,
            'Bei Tabellen genau lesen, welche Zeile die Gesamtzahl und welche die gesuchte Teilmenge enthält.',
          ]}
        />
      </Section>

      <Section no={3} title="Jetzt du!">
        <Uebungen defs={EXERCISES_HAEUFIGKEITEN} />
      </Section>
    </Lesson>
  )
}

import { Achtung, Beispiel, Lesson, M, MB, Merke, QuerTabelle, Reihe, Section, Uebungen, Vorgehen, fmt, pick, rnd, shuffle, sum, tex, type ExerciseDef } from './kit'
import { MedianWeg, MittelWeg, mean, median, sorted } from './stats'

// Schritt 5: Kennwerte vergleichen, Ausreißer, Rückwärtsaufgaben (Skript Daten, Kap. 10–12)

const KENNWERTE = ['Modalwert', 'Median', 'arithmetisches Mittel', 'Spannweite']

const AUSREISSER = [
  { text: 'Ein Supermarkt hat Kundinnen und Kunden gefragt, wie weit (in km) sie vom Geschäft entfernt wohnen:', unit: 'km', d: 1, base: () => rnd(3, 45) / 10, out: () => rnd(180, 900) },
  { text: 'In einer kleinen Firma verdienen die Beschäftigten monatlich (in €):', unit: '€', d: 0, base: () => rnd(24, 38) * 100, out: () => rnd(15, 25) * 1000 },
  { text: 'Die Wartezeiten (in Minuten) an einer Hotline betrugen:', unit: 'min', d: 0, base: () => rnd(2, 9), out: () => rnd(55, 95) },
]

const ausreisser: ExerciseDef = {
  id: 'ausreisser',
  title: 'Ausreißer erkennen',
  level: 2,
  gen: () => {
    const k = pick(AUSREISSER)
    const n = rnd(6, 8)
    const v = shuffle([...Array.from({ length: n }, k.base), k.out()])
    const options = ['Das arithmetische Mittel', 'Der Median']
    return {
      prompt: (
        <>
          <p>{k.text}</p>
          <Reihe values={v} d={k.d} />
        </>
      ),
      fields: [
        { kind: 'num', key: 'x', label: <>arithmetisches Mittel <M>{'\\overline{x}'}</M></>, expected: mean(v), tol: 0.0051, unit: k.unit },
        { kind: 'num', key: 'med', label: <>Median <M>{'x_{med}'}</M></>, expected: median(v), tol: 0.0051, unit: k.unit },
        { kind: 'choice', key: 'besser', label: 'Welcher Wert beschreibt einen „typischen“ Wert besser?', options, expected: 1, display: 'buttons' },
      ],
      hint: 'Auf zwei Nachkommastellen runden.',
      solution: (
        <>
          <MittelWeg v={v} d={k.d} unit={k.unit} />
          <MedianWeg v={v} d={k.d} unit={k.unit} />
          <p>
            Der Wert {fmt(Math.max(...v), k.d)} {k.unit} ist ein <strong>Ausreißer</strong>: Er ist viel größer als alle anderen Werte und zieht das arithmetische Mittel stark
            nach oben. Der Median ändert sich durch einen Ausreißer kaum. Deshalb beschreibt hier der <strong>Median</strong> einen typischen Wert besser.
          </p>
        </>
      ),
    }
  },
}

const SITUATIONEN = [
  { text: 'Ein Schuhladen möchte wissen, welche Schuhgröße er am meisten nachbestellen soll.', richtig: 0, grund: 'Gesucht ist die Größe, die am häufigsten verkauft wird – das ist der Modalwert. Eine „durchschnittliche“ Größe wie 39,28 gibt es gar nicht zu kaufen.' },
  { text: 'In einem Dorf leben viele Familien mit normalem Einkommen und ein Millionär. Welcher Wert beschreibt das typische Einkommen am besten?', richtig: 1, grund: 'Der Millionär ist ein Ausreißer. Der Median wird davon kaum beeinflusst, das arithmetische Mittel schon.' },
  { text: 'Fünf Freunde wollen die Rechnung für eine Pizza gerecht aufteilen. Welcher Wert gibt an, wie viel jeder zahlen muss?', richtig: 2, grund: 'Beim arithmetischen Mittel wird die Gesamtsumme gleichmäßig auf alle verteilt – genau das passiert beim Aufteilen.' },
  { text: 'Ein Wetterdienst möchte angeben, wie stark die Temperaturen an einem Tag geschwankt haben.', richtig: 3, grund: 'Die Spannweite R = x_max − x_min gibt an, wie weit die Werte auseinanderliegen.' },
  { text: 'Die Schülerzeitung möchte die beliebteste Pausensnack-Sorte angeben.', richtig: 0, grund: 'Die beliebteste Sorte ist die, die am häufigsten genannt wird – der Modalwert. Bei Sorten kann man gar keinen Durchschnitt berechnen.' },
  { text: 'Eine Lehrkraft möchte den Notendurchschnitt einer Schulaufgabe angeben.', richtig: 2, grund: 'Der Notendurchschnitt ist das arithmetische Mittel aller Noten.' },
  { text: 'Ein Lieferdienst möchte wissen, wie groß der Unterschied zwischen der schnellsten und der langsamsten Lieferung war.', richtig: 3, grund: 'Unterschied zwischen größtem und kleinstem Wert = Spannweite.' },
  { text: 'Eine Immobilienseite gibt den „mittleren“ Mietpreis an. Einige wenige Luxuswohnungen sind extrem teuer.', richtig: 1, grund: 'Wegen der extrem teuren Ausreißer ist der Median aussagekräftiger als das arithmetische Mittel.' },
]

const passend: ExerciseDef = {
  id: 'passend',
  title: 'Welcher Kennwert passt?',
  level: 1,
  gen: () => {
    const s = pick(SITUATIONEN)
    return {
      prompt: <p>{s.text}</p>,
      fields: [{ kind: 'choice', key: 'k', options: KENNWERTE, expected: s.richtig, display: 'buttons' }],
      solution: (
        <p>
          <strong>{KENNWERTE[s.richtig]}</strong>: {s.grund}
        </p>
      ),
    }
  },
}

const fehlenderWert: ExerciseDef = {
  id: 'fehlend',
  title: 'Fehlenden Wert berechnen',
  level: 2,
  gen: () => {
    const n = rnd(4, 6)
    const ziel = rnd(18, 40)
    const bekannt = Array.from({ length: n - 1 }, () => rnd(ziel - 12, ziel + 12))
    const fehlt = ziel * n - sum(bekannt)
    if (fehlt <= 0) return fehlenderWert.gen()
    const ctx = pick(['Punkte in einem Test', 'verkaufte Brezeln pro Tag', 'gelaufene Kilometer pro Woche'])
    return {
      prompt: (
        <>
          <p>
            Von {n} Werten ({ctx}) sind {n - 1} bekannt:
          </p>
          <Reihe values={bekannt} d={0} />
          <p>
            Das arithmetische Mittel aller {n} Werte soll genau <M>{`\\overline{x} = ${ziel}`}</M> betragen.
          </p>
        </>
      ),
      fields: [
        { kind: 'num', key: 'S', label: `Welche Summe müssen alle ${n} Werte haben?`, expected: ziel * n, tol: 0 },
        { kind: 'num', key: 'x', label: 'Wie groß muss der fehlende Wert sein?', expected: fehlt, tol: 0 },
      ],
      solution: (
        <>
          <p>Setze den fehlenden Wert als <M>x</M> in die Formel ein und forme um:</p>
          <MB>{`\\frac{${bekannt.join(' + ')} + x}{${n}} = ${ziel} \\quad \\big| \\cdot ${n}`}</MB>
          <MB>{`${sum(bekannt)} + x = ${ziel * n} \\quad \\big| - ${sum(bekannt)}`}</MB>
          <MB>{`x = ${fehlt}`}</MB>
          <p>
            Probe: <M>{`\\frac{${sum(bekannt)} + ${fehlt}}{${n}} = \\frac{${ziel * n}}{${n}} = ${ziel}`}</M> ✓
          </p>
        </>
      ),
    }
  },
}

const neuerWert: ExerciseDef = {
  id: 'neu',
  title: 'Ein neuer Wert kommt hinzu',
  level: 3,
  gen: () => {
    const n = pick([7, 9, 11])
    const v = Array.from({ length: n }, () => rnd(4, 40) * 10)
    const s = sorted(v)
    // neuer Wert innerhalb der Spannweite, damit R gleich bleibt
    const neu = rnd(s[1] / 10, s[n - 2] / 10) * 10
    const w = [...v, neu]
    return {
      prompt: (
        <>
          <p>Die monatlichen Ausgaben (in €) der Schülerinnen und Schüler einer Lerngruppe sind:</p>
          <Reihe values={v} d={0} />
          <p>
            Ein neuer Schüler kommt dazu. Er gibt im Monat <strong>{neu} €</strong> aus.
          </p>
        </>
      ),
      fields: [
        { kind: 'num', key: 'med1', label: 'Median vorher', expected: median(v), tol: 0.001, unit: '€' },
        { kind: 'num', key: 'med2', label: 'Median nachher', expected: median(w), tol: 0.001, unit: '€' },
        { kind: 'num', key: 'R2', label: 'Spannweite nachher', expected: Math.max(...w) - Math.min(...w), tol: 0, unit: '€' },
        { kind: 'num', key: 'x2', label: 'arithmetisches Mittel nachher', expected: mean(w), tol: 0.0051, unit: '€' },
      ],
      hint: 'Mittelwert auf zwei Nachkommastellen runden.',
      solution: (
        <>
          <p>
            <strong>Vorher</strong> (<M>{`n = ${n}`}</M>):
          </p>
          <MedianWeg v={v} d={0} unit="€" />
          <p>
            <strong>Nachher</strong> (<M>{`n = ${n + 1}`}</M>), der neue Wert {neu} € wird an der richtigen Stelle einsortiert:
          </p>
          <MedianWeg v={w} d={0} unit="€" />
          <p>
            Spannweite: Der neue Wert liegt zwischen Minimum und Maximum, also ändert sie sich nicht: <M>{`R = ${Math.max(...w)} - ${Math.min(...w)} = ${Math.max(...w) - Math.min(...w)}\\,\\text{Euro}`}</M>
          </p>
          <MittelWeg v={w} d={0} unit="€" />
        </>
      ),
    }
  },
}

const streichen: ExerciseDef = {
  id: 'streichen',
  title: 'Wertungen streichen (Eiskunstlauf)',
  level: 2,
  gen: () => {
    const v = Array.from({ length: 9 }, () => rnd(50, 59) / 10)
    v[rnd(0, 8)] = rnd(40, 46) / 10
    const s = sorted(v)
    const rest = s.slice(2, 7)
    return {
      prompt: (
        <>
          <p>Neun Wertungsrichter vergeben für einen Sprung (0 bis 6 Punkte):</p>
          <QuerTabelle rows={[{ head: 'Richter', cells: v.map((_, i) => String(i + 1)) }, { head: 'Punkte', cells: v.map((x) => fmt(x, 1)) }]} />
          <p>Bei Wettkämpfen werden die beiden höchsten und die beiden niedrigsten Wertungen gestrichen. Die Punktzahl ist das Mittel der übrigen fünf Wertungen.</p>
        </>
      ),
      fields: [
        { kind: 'num', key: 'alle', label: 'arithmetisches Mittel aller 9 Wertungen', expected: mean(v), tol: 0.0051 },
        { kind: 'num', key: 'rest', label: 'Mittel nach dem Streichen', expected: mean(rest), tol: 0.0051 },
        {
          kind: 'choice',
          key: 'warum',
          label: 'Warum wird gestrichen?',
          options: ['Damit einzelne Richter mit extremen Wertungen das Ergebnis nicht stark beeinflussen.', 'Damit die Rechnung schneller geht.', 'Weil Wertungen über 5 Punkte nicht erlaubt sind.'],
          expected: 0,
          display: 'buttons',
        },
      ],
      hint: 'Auf zwei Nachkommastellen runden.',
      solution: (
        <>
          <MittelWeg v={v} d={1} unit="" />
          <p>Rangliste – die äußeren zwei Werte auf jeder Seite werden gestrichen:</p>
          <Reihe values={s} d={1} highlight={[2, 3, 4, 5, 6]} />
          <MittelWeg v={rest} d={1} unit="" />
          <p>So können einzelne Richter mit einer extrem hohen oder niedrigen Wertung das Ergebnis nicht verfälschen.</p>
        </>
      ),
    }
  },
}

const AUSSAGEN = [
  { t: 'Der Median wird von einem Ausreißer kaum beeinflusst.', w: true },
  { t: 'Das arithmetische Mittel wird von einem Ausreißer stark beeinflusst.', w: true },
  { t: 'Der Median ist immer einer der Werte der Datenreihe.', w: false },
  { t: 'Eine Datenreihe kann mehrere Modalwerte haben.', w: true },
  { t: 'Die Spannweite kann negativ sein.', w: false },
  { t: 'Das arithmetische Mittel liegt immer zwischen Minimum und Maximum.', w: true },
  { t: 'Den Median kann man direkt aus der Urliste ablesen.', w: false },
  { t: 'Kommt ein Wert hinzu, der größer als das Maximum ist, wird die Spannweite größer.', w: true },
  { t: 'Bei einer geraden Anzahl von Werten gibt es keinen Median.', w: false },
  { t: 'Bei Lieblingsfarben kann man ein arithmetisches Mittel berechnen.', w: false },
]

const wahrFalsch: ExerciseDef = {
  id: 'wahr-falsch',
  title: 'Wahr oder falsch?',
  level: 1,
  gen: () => {
    const a = shuffle(AUSSAGEN).slice(0, 4)
    return {
      prompt: (F) => (
        <>
          <p>Entscheide für jede Aussage, ob sie stimmt.</p>
          {a.map((x, i) => (
            <div key={i} className="lp-num" style={{ gap: 12, flexWrap: 'wrap' }}>
              {F(`a${i}`)} <span>{x.t}</span>
            </div>
          ))}
        </>
      ),
      fields: a.map((x, i) => ({ kind: 'choice' as const, key: `a${i}`, options: ['wahr', 'falsch'], expected: x.w ? 0 : 1 })),
      solution: (
        <ul>
          {a.map((x, i) => (
            <li key={i}>
              <strong>{x.w ? 'wahr' : 'falsch'}</strong>: {x.t}
            </li>
          ))}
        </ul>
      ),
    }
  },
}

export const EXERCISES_BEWERTEN = [passend, wahrFalsch, ausreisser, fehlenderWert, streichen, neuerWert]

export default function KennwerteBewerten() {
  const km = [2.1, 1.0, 2.3, 0.5, 1.4, 0.3, 1.3, 4.2, 0.7, 2.2, 1.4, 2511, 3.1]
  return (
    <Lesson goal="Du entscheidest, welcher Kennwert zu einer Situation passt, erkennst Ausreißer und berechnest fehlende Werte rückwärts.">
      <Section no={1} title="Das musst du wissen">
        <div className="lp-grid2">
          <Merke title="Welcher Mittelwert wann?">
            <ul>
              <li>
                <strong>Modalwert</strong>: wenn der <em>häufigste</em> Wert gesucht ist (z. B. meistverkaufte Größe) oder wenn man nicht rechnen kann (Farben, Sorten).
              </li>
              <li>
                <strong>Median</strong>: wenn es <em>Ausreißer</em> gibt. Er teilt die Daten in zwei gleich große Hälften.
              </li>
              <li>
                <strong>Arithmetisches Mittel</strong>: wenn eine Summe <em>gleichmäßig verteilt</em> werden soll (Durchschnitt, Notenschnitt).
              </li>
            </ul>
          </Merke>
          <Merke title="Ausreißer">
            <p>
              Ein <strong>Ausreißer</strong> ist ein Wert, der viel größer oder kleiner als alle anderen ist. Er verändert das arithmetische Mittel und die Spannweite stark,
              den Median dagegen kaum.
            </p>
          </Merke>
        </div>
        <Vorgehen
          title="Rückwärts rechnen (fehlender Wert)"
          steps={[
            <>Setze den gesuchten Wert als <M>x</M> in die Formel <M>{'\\overline{x} = \\frac{x_1 + \\ldots + x_n}{n}'}</M> ein.</>,
            <>Multipliziere beide Seiten mit <M>n</M>: So erhältst du die nötige Gesamtsumme.</>,
            <>Subtrahiere die Summe der bekannten Werte – das Ergebnis ist <M>x</M>.</>,
            <>Mache die Probe.</>,
          ]}
        />
      </Section>

      <Section no={2} title="Beispiel Schritt für Schritt">
        <Beispiel
          title="Herr Wolf und seine Flyer"
          aufgabe={
            <>
              <p>Herr Wolf befragt 13 Kunden seines Supermarkts nach der Entfernung ihres Wohnorts (in km):</p>
              <Reihe values={km} d={1} />
              <p>
                Er berechnet das arithmetische Mittel und verteilt Flyer im Umkreis von 200 km. Ist das sinnvoll? Welcher Kennwert hilft ihm besser?
              </p>
            </>
          }
          steps={[
            {
              title: 'Arithmetisches Mittel berechnen',
              body: (
                <>
                  <MB>{`\\overline{x} = \\frac{${tex(sum(km), 1)}}{13} \\approx ${tex(mean(km), 2)}\\,\\text{km}`}</MB>
                  <p>Fast alle Kunden wohnen aber weniger als 5 km entfernt!</p>
                </>
              ),
            },
            { title: 'Ausreißer erkennen', body: <p>Kunde L wohnt 2511 km entfernt (Urlauber). Dieser Ausreißer verfälscht das arithmetische Mittel völlig.</p> },
            { title: 'Median bestimmen', body: <MedianWeg v={km} d={1} unit="km" /> },
            {
              title: 'Antwort formulieren',
              body: (
                <p>
                  Die Hälfte der Kunden wohnt höchstens 1,4 km entfernt. Bis auf den Ausreißer wohnen alle höchstens 4,2 km entfernt. Herr Wolf sollte die Flyer daher im
                  Umkreis von etwa 4–5 km verteilen – nicht im Umkreis von 200 km.
                </p>
              ),
            },
          ]}
        />
        <Achtung
          items={[
            'Nicht automatisch das arithmetische Mittel nehmen – erst prüfen, ob es Ausreißer gibt.',
            'Bei Rückwärtsaufgaben die Probe machen: Ergibt sich wirklich der vorgegebene Mittelwert?',
            'Kommt ein Wert hinzu, ändert sich n. Den Median also neu aus der verlängerten Rangliste bestimmen.',
          ]}
        />
      </Section>

      <Section no={3} title="Jetzt du!">
        <Uebungen defs={EXERCISES_BEWERTEN} />
      </Section>
    </Lesson>
  )
}

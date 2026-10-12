import { Saeulen } from './Charts'
import { Achtung, Beispiel, Lesson, M, MB, Merke, QuerTabelle, Reihe, Section, Uebungen, Vorgehen, fmt, pick, rnd, tex, type ExerciseDef } from './kit'
import { KONTEXTE, MedianWeg, MittelWeg, datenreihe, mean, median, modes, sorted, unitTex } from './stats'

// Schritt 4: Spannweite, Modalwert, Median, arithmetisches Mittel (Merkhilfe „Statistische Kenngrößen“)

const tolFor = (d: number) => (d === 0 ? 0.001 : 0.5 * 10 ** -d + 0.0001)

const spannweite: ExerciseDef = {
  id: 'spannweite',
  title: 'Minimum, Maximum und Spannweite',
  level: 1,
  gen: () => {
    const k = pick(KONTEXTE)
    const v = datenreihe(k, rnd(6, 10))
    const min = Math.min(...v)
    const max = Math.max(...v)
    return {
      prompt: (
        <>
          <p>{k.text}</p>
          <Reihe values={v} d={k.d} />
        </>
      ),
      fields: [
        { kind: 'num', key: 'min', label: <>Minimum <M>{'x_{min}'}</M></>, expected: min, tol: tolFor(k.d), unit: k.unit },
        { kind: 'num', key: 'max', label: <>Maximum <M>{'x_{max}'}</M></>, expected: max, tol: tolFor(k.d), unit: k.unit },
        { kind: 'num', key: 'R', label: <>Spannweite <M>R</M></>, expected: max - min, tol: tolFor(k.d), unit: k.unit },
      ],
      solution: (
        <>
          <p>
            Kleinster Wert: <M>{`x_{min} = ${tex(min, k.d)}`}</M>, größter Wert: <M>{`x_{max} = ${tex(max, k.d)}`}</M>
          </p>
          <MB>{`R = x_{max} - x_{min} = ${tex(max, k.d)} - ${tex(min, k.d)} = ${tex(max - min, k.d)}${unitTex(k.unit)}`}</MB>
          <p>Die Werte liegen also höchstens {fmt(max - min, k.d)} {k.unit} auseinander.</p>
        </>
      ),
    }
  },
}

const modalwert: ExerciseDef = {
  id: 'modalwert',
  title: 'Modalwert bestimmen',
  level: 1,
  gen: () => {
    const k = pick(KONTEXTE.filter((x) => x.d === 0))
    const v = datenreihe(k, rnd(8, 12), true)
    const m = modes(v)[0]
    const s = sorted(v)
    return {
      prompt: (
        <>
          <p>{k.text}</p>
          <Reihe values={v} d={0} />
        </>
      ),
      fields: [
        { kind: 'num', key: 'mod', label: <>Modalwert <M>{'x_{mod}'}</M></>, expected: m, tol: 0.001, unit: k.unit },
        { kind: 'num', key: 'anz', label: 'Wie oft kommt er vor?', expected: v.filter((x) => x === m).length, tol: 0 },
      ],
      solution: (
        <>
          <p>In der Rangliste stehen gleiche Werte nebeneinander – so siehst du sofort, welcher Wert am häufigsten vorkommt:</p>
          <Reihe values={s} d={0} highlight={s.map((x, i) => (x === m ? i : -1)).filter((i) => i >= 0)} />
          <MB>{`x_{mod} = ${tex(m, 0)}${unitTex(k.unit)} \\quad (${v.filter((x) => x === m).length}\\text{-mal})`}</MB>
        </>
      ),
    }
  },
}

const medianAufgabe: ExerciseDef = {
  id: 'median',
  title: 'Median bestimmen',
  level: 2,
  gen: () => {
    const k = pick(KONTEXTE)
    const v = datenreihe(k, rnd(7, 12))
    return {
      prompt: (
        <>
          <p>{k.text}</p>
          <Reihe values={v} d={k.d} />
        </>
      ),
      fields: [
        { kind: 'num', key: 'n', label: 'Anzahl der Werte n', expected: v.length, tol: 0 },
        { kind: 'num', key: 'med', label: <>Median <M>{'x_{med}'}</M></>, expected: median(v), tol: tolFor(k.d + 1), unit: k.unit },
      ],
      solution: <MedianWeg v={v} d={k.d} unit={k.unit} />,
    }
  },
}

const mittelwert: ExerciseDef = {
  id: 'mittelwert',
  title: 'Arithmetisches Mittel berechnen',
  level: 1,
  gen: () => {
    const k = pick(KONTEXTE)
    const v = datenreihe(k, rnd(5, 9))
    return {
      prompt: (
        <>
          <p>{k.text}</p>
          <Reihe values={v} d={k.d} />
        </>
      ),
      fields: [{ kind: 'num', key: 'x', label: <>arithmetisches Mittel <M>{'\overline{x}'}</M></>, expected: mean(v), tol: 0.0051, unit: k.unit }],
      hint: 'Auf zwei Nachkommastellen runden.',
      solution: (
        <>
          <p>Alle Werte addieren und durch die Anzahl der Werte teilen:</p>
          <MittelWeg v={v} d={k.d} unit={k.unit} />
        </>
      ),
    }
  },
}

const alleKennwerte: ExerciseDef = {
  id: 'alle',
  title: 'Alle Kennwerte auf einmal (Prüfungsstil)',
  level: 2,
  gen: () => {
    const k = pick(KONTEXTE.filter((x) => x.d === 0))
    const v = datenreihe(k, rnd(8, 11), true)
    const min = Math.min(...v)
    const max = Math.max(...v)
    return {
      prompt: (
        <>
          <p>{k.text}</p>
          <Reihe values={v} d={0} />
          <p>Bestimme die statistischen Kennwerte.</p>
        </>
      ),
      fields: [
        { kind: 'num', key: 'R', label: <>Spannweite <M>R</M></>, expected: max - min, tol: 0.001, unit: k.unit },
        { kind: 'num', key: 'mod', label: <>Modalwert <M>{'x_{mod}'}</M></>, expected: modes(v)[0], tol: 0.001, unit: k.unit },
        { kind: 'num', key: 'med', label: <>Median <M>{'x_{med}'}</M></>, expected: median(v), tol: 0.051, unit: k.unit },
        { kind: 'num', key: 'x', label: <>arithmetisches Mittel <M>{'\overline{x}'}</M></>, expected: mean(v), tol: 0.0051, unit: k.unit },
      ],
      hint: 'Arithmetisches Mittel auf zwei Nachkommastellen runden.',
      solution: (
        <>
          <MedianWeg v={v} d={0} unit={k.unit} />
          <MB>{`R = x_{max} - x_{min} = ${max} - ${min} = ${max - min}${unitTex(k.unit)}`}</MB>
          <MB>{`x_{mod} = ${modes(v)[0]}${unitTex(k.unit)}`}</MB>
          <MittelWeg v={v} d={0} unit={k.unit} />
        </>
      ),
    }
  },
}

const NOTEN = [1, 2, 3, 4, 5, 6]

const ausTabelle: ExerciseDef = {
  id: 'tabelle',
  title: 'Kennwerte aus einer Häufigkeitstabelle',
  level: 3,
  gen: () => {
    let H: number[]
    do H = [rnd(1, 4), rnd(2, 7), rnd(3, 9), rnd(2, 7), rnd(0, 4), rnd(0, 2)]
    while (modes(NOTEN.flatMap((x, i) => Array(H[i]).fill(x))).length > 1)
    const v = NOTEN.flatMap((x, i) => Array(H[i]).fill(x) as number[])
    const n = v.length
    const total = NOTEN.reduce((s, x, i) => s + x * H[i], 0)
    const m = Math.floor(n / 2)
    return {
      prompt: (
        <>
          <p>Die Noten einer Schulaufgabe sind im Diagramm und in der Tabelle dargestellt.</p>
          <QuerTabelle rows={[{ head: 'Note', cells: NOTEN.map(String) }, { head: 'Anzahl', cells: H.map(String) }]} />
          <Saeulen labels={NOTEN.map(String)} values={H} step={1} yTitle="Anzahl" label="Säulendiagramm der Noten" />
        </>
      ),
      fields: [
        { kind: 'num', key: 'n', label: 'Anzahl der Noten n', expected: n, tol: 0 },
        { kind: 'num', key: 'mod', label: 'Modalwert', expected: modes(v)[0], tol: 0 },
        { kind: 'num', key: 'med', label: 'Median', expected: median(v), tol: 0.001 },
        { kind: 'num', key: 'x', label: <>Notendurchschnitt <M>{'\overline{x}'}</M></>, expected: total / n, tol: 0.0051 },
      ],
      hint: 'Notendurchschnitt auf zwei Nachkommastellen runden.',
      solution: (
        <>
          <p>
            <M>{`n = ${H.join(' + ')} = ${n}`}</M>. Modalwert = Note mit der höchsten Säule: <M>{`x_{mod} = ${modes(v)[0]}`}</M>
          </p>
          <p>
            Für den Median brauchst du die Mitte der Rangliste. {n % 2 ? `Sie liegt an Stelle ${m + 1}.` : `Die beiden mittleren Werte stehen an Stelle ${m} und ${m + 1}.`} Zähle in der
            Tabelle von der Note 1 aus weiter, bis du diese Stelle erreichst:
          </p>
          <MB>{`x_{med} = ${tex(median(v), 1)}`}</MB>
          <p>Beim Mittelwert musst du jede Note so oft zählen, wie sie vorkommt („Note mal Anzahl“):</p>
          <MB>{`\\overline{x} = \\frac{${NOTEN.map((x, i) => `${x} \\cdot ${H[i]}`).join(' + ')}}{${n}} = \\frac{${total}}{${n}} \\approx ${tex(total / n, 2)}`}</MB>
        </>
      ),
    }
  },
}

export const EXERCISES_KENNWERTE = [spannweite, modalwert, medianAufgabe, mittelwert, alleKennwerte, ausTabelle]

export default function Kennwerte() {
  const urliste = [38, 39, 37, 40, 42, 38, 40, 36, 39, 39, 38, 41, 38, 37]
  return (
    <Lesson goal="Du bestimmst Minimum, Maximum, Spannweite, Modalwert, Median und arithmetisches Mittel – mit den Bezeichnungen aus der Merkhilfe.">
      <Section no={1} title="Das musst du wissen">
        <p>
          Kennwerte fassen eine ganze Datenreihe in einer Zahl zusammen. Die drei <strong>Mittelwerte</strong> (Modalwert, Median, arithmetisches Mittel) sagen, was ein
          „typischer“ Wert ist. Die <strong>Spannweite</strong> sagt, wie weit die Daten auseinanderliegen.
        </p>
        <div className="lp-grid2">
          <Merke title={<>Spannweite <M>R</M></>}>
            <MB>{'R = x_{max} - x_{min}'}</MB>
            <p>größter Wert minus kleinster Wert</p>
          </Merke>
          <Merke title={<>Modalwert <M>{'x_{mod}'}</M></>}>
            <p>
              Der <strong>häufigste Wert</strong> der Datenreihe. Es kann auch mehrere Modalwerte geben.
            </p>
          </Merke>
          <Merke title={<>Median <M>{'x_{med}'}</M> (Zentralwert)</>}>
            <p>
              Der Wert, der in der <strong>Mitte der Rangliste</strong> steht. Bei einer geraden Anzahl von Werten liegt er genau zwischen den beiden mittleren Werten.
            </p>
            <p>Die Hälfte der Werte ist kleiner oder gleich dem Median, die andere Hälfte größer oder gleich.</p>
          </Merke>
          <Merke title={<>Arithmetisches Mittel <M>{'\overline{x}'}</M> (Durchschnitt)</>}>
            <MB>{'\\overline{x} = \\frac{x_1 + x_2 + \\ldots + x_n}{n}'}</MB>
            <p>Summe aller Werte geteilt durch die Anzahl der Werte.</p>
          </Merke>
        </div>
        <Vorgehen
          steps={[
            <>Erstelle zuerst eine <strong>Rangliste</strong>. Damit siehst du sofort Minimum, Maximum und Modalwert.</>,
            <>Spannweite: <M>{'R = x_{max} - x_{min}'}</M>.</>,
            <>Median: Ist <M>n</M> ungerade, nimm den Wert an Stelle <M>{'\\tfrac{n+1}{2}'}</M>. Ist <M>n</M> gerade, nimm den Mittelwert der beiden Werte an Stelle <M>{'\\tfrac{n}{2}'}</M> und <M>{'\\tfrac{n}{2}+1'}</M>.</>,
            <>Arithmetisches Mittel: alle Werte addieren, durch <M>n</M> teilen, sinnvoll runden.</>,
          ]}
        />
      </Section>

      <Section no={2} title="Beispiel Schritt für Schritt">
        <Beispiel
          title="Schuhgrößen von 14 Kundinnen und Kunden"
          aufgabe={
            <>
              <p>Urliste:</p>
              <Reihe values={urliste} d={0} />
              <p>Bestimme alle Kennwerte.</p>
            </>
          }
          steps={[
            { title: 'Rangliste erstellen', body: <Reihe values={sorted(urliste)} d={0} /> },
            {
              title: 'Minimum, Maximum, Spannweite',
              body: <MB>{'x_{min} = 36,\\quad x_{max} = 42,\\quad R = 42 - 36 = 6'}</MB>,
            },
            {
              title: 'Modalwert',
              body: (
                <>
                  <Reihe values={sorted(urliste)} d={0} highlight={[3, 4, 5, 6]} />
                  <p>Die 38 kommt viermal vor – öfter als jeder andere Wert: <M>{'x_{mod} = 38'}</M></p>
                </>
              ),
            },
            { title: 'Median', body: <MedianWeg v={urliste} d={0} unit="" /> },
            {
              title: 'Arithmetisches Mittel',
              body: (
                <>
                  <MittelWeg v={urliste} d={0} unit="" />
                  <p>Die durchschnittliche Schuhgröße ist etwa {fmt(mean(urliste), 1)}.</p>
                </>
              ),
            },
          ]}
        />
        <Achtung
          items={[
            'Den Median immer aus der sortierten Rangliste bestimmen – nie aus der Urliste!',
            'Bei gerader Anzahl gibt es zwei mittlere Werte: Ihr Mittelwert ist der Median.',
            <>Beim Mittelwert durch die Anzahl der <em>Werte</em> teilen, nicht durch die Anzahl verschiedener Werte.</>,
            'Modalwert und Median sind Werte aus den Daten (bzw. dazwischen) – nicht ihre Position in der Liste.',
          ]}
        />
      </Section>

      <Section no={3} title="Jetzt du!">
        <Uebungen defs={EXERCISES_KENNWERTE} />
      </Section>
    </Lesson>
  )
}

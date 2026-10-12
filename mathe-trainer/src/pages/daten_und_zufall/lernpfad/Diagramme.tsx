import { Link } from 'react-router-dom'
import { Kreis, Saeulen } from './Charts'
import { Achtung, Beispiel, Lesson, M, MB, Merke, QuerTabelle, Section, Tabelle, Uebungen, Vorgehen, fmt, pick, rnd, shuffle, tex, texPct, type ExerciseDef } from './kit'

// Schritt 3: Diagramme lesen, erstellen (Kreisdiagramm: Winkel) und kritisch hinterfragen

const THEMEN = [
  { frage: 'Wie kommst du zur Schule?', items: ['Bus', 'Fahrrad', 'zu Fuß', 'Auto', 'Zug'] },
  { frage: 'Welches Pausenangebot kaufst du am liebsten?', items: ['Brezel', 'Pizza', 'Obst', 'Müsliriegel'] },
  { frage: 'Welchen Ausbildungsweg planst du?', items: ['kaufmännisch', 'technisch', 'handwerklich', 'FOS', 'sonstiges'] },
  { frage: 'Welches Musikgenre hörst du am meisten?', items: ['Pop', 'Hip-Hop', 'Rock', 'Elektro'] },
]

/** Prozentanteile (ganzzahlig, Summe 100) */
function anteile(k: number, step = 1) {
  for (;;) {
    const raw = Array.from({ length: k }, () => rnd(2, 10))
    const s = raw.reduce((a, b) => a + b, 0)
    const p = raw.map((r) => Math.round((r / s) * (100 / step)) * step)
    const diff = 100 - p.reduce((a, b) => a + b, 0)
    p[p.indexOf(Math.max(...p))] += diff
    if (p.every((x) => x > 0)) return p
  }
}

const winkelAusProzent: ExerciseDef = {
  id: 'winkel-prozent',
  title: 'Winkel für ein Kreisdiagramm berechnen',
  level: 1,
  gen: () => {
    const t = pick(THEMEN)
    const p = anteile(t.items.length)
    return {
      prompt: (F) => (
        <>
          <p>
            Bei einer Umfrage „{t.frage}“ ergaben sich diese Anteile. Berechne für ein Kreisdiagramm die Mittelpunktswinkel.
          </p>
          <QuerTabelle
            rows={[
              { head: 'Antwort', cells: t.items },
              { head: 'Anteil', cells: p.map((x) => `${x} %`) },
              { head: 'Winkel', cells: p.map((_, i) => F(`w${i}`)) },
            ]}
          />
        </>
      ),
      fields: p.map((x, i) => ({ kind: 'num' as const, key: `w${i}`, expected: x * 3.6, tol: 0.051, size: 'sm' as const })),
      hint: 'Gib die Winkel in Grad an (auf eine Nachkommastelle genau).',
      solution: (
        <>
          <p>
            Der ganze Kreis hat <M>{'360^\\circ'}</M> und entspricht <M>{'100\\,\\%'}</M>. Also gilt <M>{'1\\,\\% \\;\\widehat{=}\\; 3{,}6^\\circ'}</M>.
          </p>
          <Tabelle head={['Antwort', 'Rechnung', 'Winkel']} rows={t.items.map((it, i) => [it, <M key="r">{`${p[i]} \\cdot 3{,}6^\\circ`}</M>, `${fmt(p[i] * 3.6, 1)}°`])} />
          <p>
            Kontrolle: <M>{`${p.map((x) => tex(x * 3.6, 1)).join(' + ')} = 360^\\circ`}</M> ✓
          </p>
          <Kreis labels={t.items} values={p} label="Lösung als Kreisdiagramm" showAngles />
        </>
      ),
    }
  },
}

const winkelAusH: ExerciseDef = {
  id: 'winkel-H',
  title: 'Kreisdiagramm aus absoluten Häufigkeiten',
  level: 2,
  gen: () => {
    const t = pick(THEMEN)
    const n = pick([40, 60, 72, 80, 90, 120])
    const p = anteile(t.items.length)
    const H = p.map((x) => Math.max(1, Math.round((x / 100) * n)))
    H[H.indexOf(Math.max(...H))] += n - H.reduce((a, b) => a + b, 0)
    return {
      prompt: (F) => (
        <>
          <p>
            {n} Personen wurden gefragt: „{t.frage}“ Berechne die Winkel für ein Kreisdiagramm.
          </p>
          <QuerTabelle
            rows={[
              { head: 'Antwort', cells: t.items },
              { head: 'Anzahl H', cells: H.map(String) },
              { head: 'Winkel', cells: H.map((_, i) => F(`w${i}`)) },
            ]}
          />
        </>
      ),
      fields: H.map((h, i) => ({ kind: 'num' as const, key: `w${i}`, expected: (h / n) * 360, tol: 0.51, size: 'sm' as const })),
      hint: 'Runde auf ganze Grad.',
      solution: (
        <>
          <p>Winkel = relative Häufigkeit · 360°:</p>
          <MB>{'\\alpha = h \\cdot 360^\\circ = \\frac{H}{n} \\cdot 360^\\circ'}</MB>
          <Tabelle
            head={['Antwort', 'Rechnung', 'Winkel']}
            rows={t.items.map((it, i) => [it, <M key="r">{`\\tfrac{${H[i]}}{${n}} \\cdot 360^\\circ`}</M>, `≈ ${fmt((H[i] / n) * 360, 0)}°`])}
          />
          <Kreis labels={t.items} values={H} label="Lösung als Kreisdiagramm" showAngles />
        </>
      ),
    }
  },
}

const ablesen: ExerciseDef = {
  id: 'ablesen',
  title: 'Säulendiagramm ablesen',
  level: 1,
  gen: () => {
    const t = pick(THEMEN)
    const step = pick([2, 5])
    const H = t.items.map(() => rnd(1, 8) * step)
    const n = H.reduce((a, b) => a + b, 0)
    const a = rnd(0, t.items.length - 1)
    return {
      prompt: (
        <>
          <p>Das Säulendiagramm zeigt das Ergebnis einer Umfrage „{t.frage}“.</p>
          <Saeulen labels={t.items} values={H} step={step} yTitle="Anzahl" label={`Säulendiagramm mit ${t.items.length} Säulen`} />
        </>
      ),
      fields: [
        { kind: 'num', key: 'Ha', label: `Wie viele Personen antworteten „${t.items[a]}“?`, expected: H[a], tol: 0 },
        { kind: 'num', key: 'n', label: 'Wie viele Personen wurden insgesamt befragt?', expected: n, tol: 0 },
        { kind: 'prob', key: 'h', label: `Relative Häufigkeit von „${t.items[a]}“`, expected: H[a] / n },
      ],
      solution: (
        <>
          <p>Lies an der Hochachse ab, wie hoch jede Säule reicht (eine Kästchenlinie entspricht {step} Personen):</p>
          <QuerTabelle rows={[{ head: 'Antwort', cells: t.items }, { head: 'H', cells: H.map(String) }]} />
          <p>
            <M>{`n = ${H.join(' + ')} = ${n}`}</M>
          </p>
          <MB>{`h(\\text{${t.items[a]}}) = \\frac{${H[a]}}{${n}} \\approx ${tex(H[a] / n, 4)} = ${texPct(H[a] / n)}`}</MB>
        </>
      ),
    }
  },
}

const winkelZurueck: ExerciseDef = {
  id: 'winkel-zurueck',
  title: 'Vom Winkel zurück zur Anzahl',
  level: 2,
  gen: () => {
    const pct = pick([5, 10, 15, 20, 25, 30, 35, 40, 45, 12.5, 37.5])
    const n = pick([80, 120, 200, 240, 400, 480].filter((v) => Number.isInteger((pct * v) / 100)))
    const w = pct * 3.6
    const ctx = pick(['ihr Taschengeld für Kleidung ausgeben', 'in einem Verein Sport treiben', 'ein eigenes Tablet besitzen', 'mit dem Bus zur Schule fahren'])
    return {
      prompt: (
        <p>
          In einem Kreisdiagramm zu einer Umfrage unter {n} Jugendlichen hat der Kreisausschnitt „{ctx}“ einen Mittelpunktswinkel von {fmt(w, 1)}°.
        </p>
      ),
      fields: [
        { kind: 'prob', key: 'p', label: 'Anteil in Prozent', expected: pct / 100 },
        { kind: 'num', key: 'H', label: 'Anzahl der Jugendlichen', expected: (pct * n) / 100, tol: 0 },
      ],
      solution: (
        <>
          <p>Der Winkel ist derselbe Anteil von 360°, wie die Gruppe von allen Befragten:</p>
          <MB>{`h = \\frac{${tex(w, 1)}^\\circ}{360^\\circ} = ${tex(pct / 100, 4)} = ${tex(pct, 1)}\\,\\%`}</MB>
          <MB>{`H = h \\cdot n = ${tex(pct / 100, 4)} \\cdot ${n} = ${(pct * n) / 100}`}</MB>
        </>
      ),
    }
  },
}

const FAELSCHUNG = [
  'Die Hochachse beginnt nicht bei 0. Dadurch wirken kleine Unterschiede riesig.',
  'Die Säulen sind unterschiedlich breit gezeichnet.',
  'Die Werte sind falsch beschriftet.',
  'Ein Säulendiagramm darf man für Prozentwerte nicht verwenden.',
]

const kritisch: ExerciseDef = {
  id: 'kritisch',
  title: 'Diagramme kritisch hinterfragen',
  level: 2,
  gen: () => {
    const ctx = pick([
      { items: ['Klasse 10a', 'Klasse 10c'], what: 'durchschnittliche Punktzahl im Test', unit: '' },
      { items: ['Pizzastück', 'Schokoriegel'], what: 'Anteil der Befragten, die das Angebot mögen (in %)', unit: '' },
      { items: ['Filiale Nord', 'Filiale Süd'], what: 'Umsatz in Tausend €', unit: '' },
    ])
    const start = pick([60, 70, 80])
    const b = start + rnd(2, 4)
    const a = b + rnd(2, 5)
    const options = shuffle(FAELSCHUNG)
    const visual = (a - start) / (b - start)
    return {
      prompt: (
        <>
          <p>
            Eine Zeitung zeigt dieses Diagramm zur Frage „{ctx.what}“ und schreibt: <em>„{ctx.items[0]} ist {fmt(visual, 1)}-mal so gut wie {ctx.items[1]}!“</em>
          </p>
          <Saeulen labels={ctx.items} values={[a, b]} yStart={start} yMax={start + 10} step={2} showValues label="Säulendiagramm mit abgeschnittener Hochachse" />
        </>
      ),
      fields: [
        { kind: 'choice', key: 'grund', label: 'Was ist an dem Diagramm irreführend?', options, expected: options.indexOf(FAELSCHUNG[0]), display: 'buttons' },
        { kind: 'num', key: 'diff', label: `Um wie viel Prozent ist der Wert von ${ctx.items[0]} tatsächlich größer?`, expected: ((a - b) / b) * 100, tol: 0.051, unit: '%' },
      ],
      hint: 'Prozentwert auf eine Nachkommastelle runden.',
      solution: (
        <>
          <p>
            Die Hochachse beginnt bei {start} und nicht bei 0. Die Säule von {ctx.items[0]} ist deshalb {fmt(visual, 1)}-mal so hoch wie die von {ctx.items[1]}, obwohl die Werte
            fast gleich sind.
          </p>
          <MB>{`\\frac{${a} - ${b}}{${b}} = \\frac{${a - b}}{${b}} \\approx ${tex((a - b) / b, 4)} = ${tex(((a - b) / b) * 100, 1)}\\,\\%`}</MB>
          <p>Mit einer Achse ab 0 sieht man, wie klein der Unterschied wirklich ist:</p>
          <Saeulen labels={ctx.items} values={[a, b]} yMax={start + 20} step={10} showValues label="Dasselbe Diagramm mit Hochachse ab 0" />
        </>
      ),
    }
  },
}

export const EXERCISES_DIAGRAMME = [ablesen, winkelAusProzent, winkelAusH, winkelZurueck, kritisch]

export default function Diagramme() {
  const items = ['Bus', 'Fahrrad', 'zu Fuß', 'Auto']
  const H = [14, 12, 6, 8]
  return (
    <Lesson goal="Du liest Werte aus Diagrammen ab, berechnest die Winkel für ein Kreisdiagramm und erkennst, wenn ein Diagramm täuscht.">
      <Section no={1} title="Das musst du wissen">
        <div className="lp-grid2">
          <Merke title="Säulen- und Balkendiagramm">
            <p>
              Jede Kategorie bekommt eine Säule (senkrecht) bzw. einen Balken (waagrecht). Die <strong>Höhe</strong> zeigt die Häufigkeit. Gut geeignet, um Werte zu
              <strong> vergleichen</strong>.
            </p>
            <p>Die Achse mit den Zahlen beginnt bei 0 und ist gleichmäßig eingeteilt.</p>
          </Merke>
          <Merke title="Kreisdiagramm">
            <p>
              Der ganze Kreis steht für alle Daten (100 %). Gut geeignet, um <strong>Anteile</strong> zu zeigen.
            </p>
            <MB>{'\\alpha = h \\cdot 360^\\circ \\qquad 1\\,\\% \\;\\widehat{=}\\; 3{,}6^\\circ'}</MB>
          </Merke>
        </div>
        <Vorgehen
          title="So erstellst du ein Kreisdiagramm"
          steps={[
            <>Bestimme für jede Kategorie die relative Häufigkeit <M>{'h = H : n'}</M>.</>,
            <>Rechne den Winkel aus: <M>{'\\alpha = h \\cdot 360^\\circ'}</M> (bei Prozent: Prozentzahl · 3,6°).</>,
            <>Kontrolle: Alle Winkel zusammen ergeben 360°.</>,
            <>Zeichne einen Kreis, einen Radius als Startlinie und trage die Winkel mit dem Geodreieck nacheinander ab. Beschrifte jeden Ausschnitt.</>,
          ]}
        />
      </Section>

      <Section no={2} title="Beispiel Schritt für Schritt">
        <Beispiel
          title="Schulweg von 40 Schülerinnen und Schülern"
          aufgabe={
            <>
              <QuerTabelle rows={[{ head: 'Verkehrsmittel', cells: items }, { head: 'Anzahl H', cells: H.map(String) }]} />
              <p>Stelle das Ergebnis in einem Kreisdiagramm dar.</p>
            </>
          }
          steps={[
            { title: 'Anzahl aller Daten', body: <p><M>{'n = 14 + 12 + 6 + 8 = 40'}</M></p> },
            {
              title: 'Relative Häufigkeiten und Winkel',
              body: (
                <Tabelle
                  head={['', 'h', 'Winkel']}
                  rows={items.map((it, i) => [it, <M key="h">{`\\tfrac{${H[i]}}{40} = ${tex(H[i] / 40, 2)}`}</M>, <M key="w">{`${tex(H[i] / 40, 2)} \\cdot 360^\\circ = ${(H[i] / 40) * 360}^\\circ`}</M>])}
                />
              ),
            },
            { title: 'Kontrolle', body: <p><M>{'126^\\circ + 108^\\circ + 54^\\circ + 72^\\circ = 360^\\circ'}</M> ✓</p> },
            { title: 'Zeichnen', body: <Kreis labels={items} values={H} label="Kreisdiagramm Schulweg" showAngles /> },
          ]}
        />
        <Merke title="Diagramme kritisch lesen">
          <ul>
            <li>Beginnt die Hochachse bei 0? Wenn nicht, wirken kleine Unterschiede riesig.</li>
            <li>Ist die Achse gleichmäßig eingeteilt? Ist die Einteilung zu grob, verschwinden Unterschiede.</li>
            <li>Sind Bilder statt Säulen verwendet? Doppelte Höhe bedeutet bei Bildern vierfache Fläche.</li>
            <li>Ergeben die Anteile in einem Kreisdiagramm zusammen 100 %?</li>
          </ul>
        </Merke>
        <Achtung
          items={[
            <>Beim Kreisdiagramm nicht mit <M>{'100'}</M> statt mit <M>{'360^\\circ'}</M> multiplizieren.</>,
            'Beim Ablesen genau auf die Einteilung der Achse achten: Ein Kästchen ist nicht immer 1.',
          ]}
        />
      </Section>

      <Section no={3} title="Jetzt du!">
        <Uebungen defs={EXERCISES_DIAGRAMME} />
        <p>
          Mehr Übung beim Zeichnen: <Link to="/daten-und-zufall/diagramme-erstellen">Diagramme selbst zeichnen</Link>
        </p>
      </Section>
    </Lesson>
  )
}

import { Achtung, Beispiel, Lesson, M, Merke, QuerTabelle, Reihe, Section, Uebungen, Vorgehen, fmt, pick, rnd, shuffle, type ExerciseDef } from './kit'

// Schritt 1: Urliste, Rangliste, Häufigkeitstabelle (Skript Daten, Kap. 1)

/** Strichliste: Fünferbündel mit Querstrich */
export function Striche({ n }: { n: number }) {
  const groups = Math.floor(n / 5)
  const restN = n % 5
  const w = groups * 34 + restN * 7 + 4
  return (
    <svg width={Math.max(w, 10)} height="24" viewBox={`0 0 ${Math.max(w, 10)} 24`} role="img" aria-label={`${n} Striche`} style={{ verticalAlign: 'middle' }}>
      {Array.from({ length: groups }, (_, g) => (
        <g key={g} stroke="var(--ink)" strokeWidth="2" strokeLinecap="round">
          {[0, 1, 2, 3].map((i) => (
            <line key={i} x1={4 + g * 34 + i * 6} x2={4 + g * 34 + i * 6} y1="3" y2="21" />
          ))}
          <line x1={g * 34} y1="18" x2={g * 34 + 26} y2="6" />
        </g>
      ))}
      {Array.from({ length: restN }, (_, i) => (
        <line key={i} x1={4 + groups * 34 + i * 7} x2={4 + groups * 34 + i * 7} y1="3" y2="21" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round" />
      ))}
    </svg>
  )
}

const KONTEXTE_RANG = [
  { text: 'Beim Eiskunstlaufen vergeben die Wertungsrichter für einen Sprung folgende Punkte:', gen: () => rnd(48, 59) / 10, d: 1, unit: 'Punkte' },
  { text: 'Beim 100-m-Sprint wurden folgende Zeiten (in Sekunden) gemessen:', gen: () => rnd(118, 162) / 10, d: 1, unit: 's' },
  { text: 'Die Schuhgrößen der letzten Kundinnen und Kunden eines Schuhladens waren:', gen: () => rnd(36, 45), d: 0, unit: '' },
  { text: 'Beim Kugelstoßen wurden folgende Weiten (in m) erreicht:', gen: () => rnd(30, 105) / 10, d: 1, unit: 'm' },
  { text: 'Die monatlichen Handykosten (in €) einiger Schülerinnen und Schüler betragen:', gen: () => rnd(5, 40), d: 0, unit: '€' },
]

const rangliste: ExerciseDef = {
  id: 'rangliste',
  title: 'Rangliste erstellen',
  level: 1,
  gen: () => {
    const k = pick(KONTEXTE_RANG)
    const n = rnd(6, 9)
    const values = Array.from({ length: n }, k.gen)
    const sorted = [...values].sort((a, b) => a - b)
    return {
      prompt: (F) => (
        <>
          <p>{k.text}</p>
          <Reihe values={values} d={k.d} />
          <p>
            Ordne die Werte der Größe nach – <strong>vom kleinsten zum größten Wert</strong>.
          </p>
          <div className="lp-row">
            {sorted.map((_, i) => (
              <span key={i}>{F(`r${i}`)}</span>
            ))}
          </div>
        </>
      ),
      fields: sorted.map((v, i) => ({ kind: 'num' as const, key: `r${i}`, expected: v, tol: 0.001, size: 'sm' as const })),
      solution: (
        <>
          <p>Suche immer den kleinsten noch nicht verwendeten Wert und streiche ihn in der Urliste ab. Gleiche Werte schreibst du mehrfach hin.</p>
          <p>
            <strong>Rangliste:</strong>
          </p>
          <Reihe values={sorted} d={k.d} />
          <p>
            Kontrolle: Urliste und Rangliste haben gleich viele Werte (<M>{`n = ${n}`}</M>).
          </p>
        </>
      ),
    }
  },
}

const KONTEXTE_TAB = [
  { text: 'In einer Klasse wurden bei der letzten Schulaufgabe folgende Noten geschrieben:', werte: [1, 2, 3, 4, 5, 6], head: 'Note', gewichte: [2, 4, 5, 4, 2, 1] },
  { text: 'Die Schülerinnen und Schüler einer Klasse wurden nach der Anzahl ihrer Geschwister gefragt:', werte: [0, 1, 2, 3, 4], head: 'Geschwister', gewichte: [3, 5, 3, 2, 1] },
  { text: 'Ein Würfel wurde mehrmals geworfen. Die Augenzahlen waren:', werte: [1, 2, 3, 4, 5, 6], head: 'Augenzahl', gewichte: [1, 1, 1, 1, 1, 1] },
  { text: 'Bei einer Verkehrszählung wurde notiert, wie viele Personen in einem Auto sitzen:', werte: [1, 2, 3, 4, 5], head: 'Personen', gewichte: [6, 4, 2, 2, 1] },
]

function ziehe(werte: number[], gewichte: number[]) {
  const total = gewichte.reduce((s, g) => s + g, 0)
  let r = Math.random() * total
  for (let i = 0; i < werte.length; i++) {
    r -= gewichte[i]
    if (r < 0) return werte[i]
  }
  return werte[werte.length - 1]
}

const haeufigkeitstabelle: ExerciseDef = {
  id: 'haeufigkeitstabelle',
  title: 'Häufigkeitstabelle ausfüllen',
  level: 1,
  gen: () => {
    const k = pick(KONTEXTE_TAB)
    const n = rnd(12, 20)
    const values = Array.from({ length: n }, () => ziehe(k.werte, k.gewichte))
    const counts = k.werte.map((w) => values.filter((v) => v === w).length)
    return {
      prompt: (F) => (
        <>
          <p>{k.text}</p>
          <Reihe values={values} d={0} />
          <p>Zähle, wie oft jeder Wert vorkommt, und gib die Anzahl aller Daten an.</p>
          <QuerTabelle
            rows={[
              { head: k.head, cells: [...k.werte.map((w) => String(w)), <strong key="s">Summe n</strong>] },
              { head: 'Anzahl', cells: [...k.werte.map((_, i) => F(`h${i}`)), F('n')] },
            ]}
          />
        </>
      ),
      fields: [
        ...counts.map((c, i) => ({ kind: 'num' as const, key: `h${i}`, expected: c, tol: 0, size: 'sm' as const })),
        { kind: 'num' as const, key: 'n', expected: n, tol: 0, size: 'sm' as const },
      ],
      solution: (
        <>
          <p>Gehe die Urliste von links nach rechts durch und mache für jeden Wert einen Strich (Strichliste). Danach zählst du die Striche.</p>
          <QuerTabelle
            rows={[
              { head: k.head, cells: [...k.werte.map((w) => String(w)), 'Summe'] },
              { head: 'Strichliste', cells: [...counts.map((c, i) => <Striche key={i} n={c} />), ''] },
              { head: 'Anzahl', cells: [...counts.map(String), String(n)] },
            ]}
          />
          <p>
            Kontrolle: Die Summe aller Anzahlen muss die Anzahl der Daten ergeben: <M>{`${counts.join(' + ')} = ${n}`}</M>.
          </p>
        </>
      ),
    }
  },
}

const KATEGORIEN = [
  { frage: 'Lieblingsfach', items: ['Mathe', 'Deutsch', 'Sport', 'BWR', 'Englisch'] },
  { frage: 'Verkehrsmittel zur Schule', items: ['Bus', 'Fahrrad', 'zu Fuß', 'Auto', 'Zug'] },
  { frage: 'Lieblingsgetränk in der Pause', items: ['Wasser', 'Saft', 'Tee', 'Kakao'] },
  { frage: 'Lieblings-Social-Media-App', items: ['App A', 'App B', 'App C', 'App D'] },
]

const strichliste: ExerciseDef = {
  id: 'strichliste',
  title: 'Strichliste auswerten',
  level: 1,
  gen: () => {
    const k = pick(KATEGORIEN)
    let counts = k.items.map(() => rnd(2, 14))
    // eindeutiger häufigster Wert
    while (counts.filter((c) => c === Math.max(...counts)).length > 1) counts = k.items.map(() => rnd(2, 14))
    const n = counts.reduce((s, c) => s + c, 0)
    const top = counts.indexOf(Math.max(...counts))
    return {
      prompt: (F) => (
        <>
          <p>
            Bei einer Umfrage zum Thema <strong>„{k.frage}“</strong> wurde eine Strichliste geführt. Jede befragte Person hat genau eine Antwort gegeben.
          </p>
          <QuerTabelle
            rows={[
              { head: 'Antwort', cells: [...k.items, 'Summe n'] },
              { head: 'Strichliste', cells: [...counts.map((c, i) => <Striche key={i} n={c} />), ''] },
              { head: 'Anzahl', cells: [...counts.map((_, i) => F(`h${i}`)), F('n')] },
            ]}
          />
        </>
      ),
      fields: [
        ...counts.map((c, i) => ({ kind: 'num' as const, key: `h${i}`, expected: c, tol: 0, size: 'sm' as const })),
        { kind: 'num' as const, key: 'n', expected: n, tol: 0, size: 'sm' as const },
        { kind: 'choice' as const, key: 'top', label: 'Welche Antwort wurde am häufigsten gegeben?', options: k.items, expected: top },
      ],
      solution: (
        <>
          <p>Ein Bündel mit Querstrich steht für 5 Striche. Zähle zuerst die Bündel, dann die einzelnen Striche.</p>
          <QuerTabelle rows={[{ head: 'Antwort', cells: k.items }, { head: 'Anzahl', cells: counts.map(String) }]} />
          <p>
            <M>{`n = ${counts.join(' + ')} = ${n}`}</M> Personen wurden befragt.
          </p>
          <p>
            Am häufigsten wurde <strong>{k.items[top]}</strong> genannt ({counts[top]}-mal).
          </p>
        </>
      ),
    }
  },
}

const NAMEN = ['Lea', 'Tim', 'Mia', 'Ben', 'Emma', 'Noah', 'Sofia', 'Elias', 'Lina', 'Jonas', 'Hanna', 'Mo']

const ranglistePlatz: ExerciseDef = {
  id: 'rangplatz',
  title: 'Platzierungen aus der Rangliste',
  level: 2,
  gen: () => {
    const sprint = Math.random() < 0.5
    const names = shuffle(NAMEN).slice(0, 7)
    const used = new Set<number>()
    const vals = names.map(() => {
      let v: number
      do v = sprint ? rnd(118, 160) / 10 : rnd(30, 95) / 10
      while (used.has(v))
      used.add(v)
      return v
    })
    // Sprint: kleinste Zeit gewinnt; Kugelstoßen: größte Weite gewinnt
    const order = names.map((_, i) => i).sort((a, b) => (sprint ? vals[a] - vals[b] : vals[b] - vals[a]))
    const winner = order[0]
    const third = order[2]
    const last = order[order.length - 1]
    const unit = sprint ? 's' : 'm'
    return {
      prompt: (
        <>
          <p>
            {sprint ? 'Beim 100-m-Sprint' : 'Beim Kugelstoßen'} wurden diese Ergebnisse notiert ({sprint ? 'Zeit in Sekunden – die kürzeste Zeit gewinnt' : 'Weite in Metern – die größte Weite gewinnt'}):
          </p>
          <QuerTabelle rows={[{ head: 'Name', cells: names }, { head: sprint ? 'Zeit' : 'Weite', cells: vals.map((v) => `${fmt(v, 1)} ${unit}`) }]} />
        </>
      ),
      fields: [
        { kind: 'choice', key: 'p1', label: 'Wer belegt Platz 1?', options: names, expected: winner },
        { kind: 'num', key: 'v3', label: `Ergebnis auf Platz 3 (in ${unit})`, expected: vals[third], tol: 0.001 },
        { kind: 'choice', key: 'pl', label: 'Wer belegt den letzten Platz?', options: names, expected: last },
      ],
      solution: (
        <>
          <p>
            Erstelle eine Rangliste. {sprint ? 'Beim Sprint ist die kleinste Zeit die beste, also sortierst du aufsteigend.' : 'Beim Kugelstoßen ist die größte Weite die beste, also sortierst du absteigend.'}
          </p>
          <QuerTabelle
            rows={[
              { head: 'Platz', cells: order.map((_, i) => String(i + 1)) },
              { head: 'Name', cells: order.map((i) => names[i]) },
              { head: sprint ? 'Zeit' : 'Weite', cells: order.map((i) => `${fmt(vals[i], 1)} ${unit}`) },
            ]}
          />
          <p>
            Platz 1: <strong>{names[winner]}</strong>, Platz 3: <strong>{fmt(vals[third], 1)} {unit}</strong>, letzter Platz: <strong>{names[last]}</strong>.
          </p>
        </>
      ),
    }
  },
}

export const EXERCISES_DATEN_ORDNEN = [rangliste, haeufigkeitstabelle, strichliste, ranglistePlatz]

export default function DatenOrdnen() {
  return (
    <Lesson goal="Du bringst ungeordnete Daten in eine Rangliste und erstellst eine Häufigkeitstabelle. Das ist die Grundlage für alle weiteren Auswertungen.">
      <Section no={1} title="Das musst du wissen">
        <p>
          Bei einer Umfrage, einer Messung oder einem Experiment werden <strong>Daten</strong> gesammelt, z. B. Noten, Zeiten oder Antworten. Damit man sie auswerten kann,
          bringt man sie in Ordnung.
        </p>
        <div className="lp-grid2">
          <Merke title="Urliste und Rangliste">
            <p>
              Die <strong>Urliste</strong> enthält die Daten so, wie sie erhoben wurden – <em>unsortiert</em>.
            </p>
            <p>
              In der <strong>Rangliste</strong> stehen dieselben Daten <em>der Größe nach geordnet</em> (meist vom kleinsten zum größten Wert).
            </p>
            <p>
              <M>n</M> = Anzahl aller erfassten Daten.
            </p>
          </Merke>
          <Merke title="Häufigkeitstabelle">
            <p>
              In einer <strong>Häufigkeitstabelle</strong> steht, <em>wie oft</em> jeder Wert vorkommt. Zum Zählen hilft eine <strong>Strichliste</strong>: Jeder fünfte
              Strich wird quer durch die vier vorherigen gezogen (<Striche n={5} /> = 5).
            </p>
            <p>Die Summe aller Anzahlen ist wieder <M>n</M>.</p>
          </Merke>
        </div>
        <Vorgehen
          steps={[
            <>Zähle die Werte der Urliste: So erhältst du <M>n</M>.</>,
            <>Suche den kleinsten Wert, schreibe ihn auf und streiche ihn in der Urliste ab. Wiederhole das, bis alle Werte abgestrichen sind → Rangliste.</>,
            <>Für die Häufigkeitstabelle: Schreibe alle möglichen Werte nebeneinander und mache für jeden Wert der Urliste einen Strich.</>,
            <>Kontrolle: Rangliste und Häufigkeitstabelle enthalten zusammen wieder genau <M>n</M> Werte.</>,
          ]}
        />
      </Section>

      <Section no={2} title="Beispiel Schritt für Schritt">
        <Beispiel
          title="Antworten auf die Frage „Wie viele Stunden schläfst du vor einer Prüfung?“"
          aufgabe={
            <>
              <p>Urliste von 16 Schülerinnen und Schülern (in Stunden):</p>
              <Reihe values={[7, 6, 8, 7, 6, 8, 5, 7, 7, 6, 5, 8, 8, 7, 7, 8]} d={0} />
              <p>Erstelle die Rangliste und eine Häufigkeitstabelle.</p>
            </>
          }
          steps={[
            { title: 'Anzahl der Daten bestimmen', body: <p>Es sind 16 Werte, also <M>n = 16</M>.</p> },
            {
              title: 'Rangliste erstellen',
              body: (
                <>
                  <p>Der kleinste Wert ist 5 (zweimal), dann 6 (dreimal) usw.:</p>
                  <Reihe values={[5, 5, 6, 6, 6, 7, 7, 7, 7, 7, 7, 8, 8, 8, 8, 8]} d={0} />
                </>
              ),
            },
            {
              title: 'Strichliste und Häufigkeitstabelle',
              body: (
                <QuerTabelle
                  rows={[
                    { head: 'Stunden', cells: ['5', '6', '7', '8'] },
                    { head: 'Strichliste', cells: [<Striche key={1} n={2} />, <Striche key={2} n={3} />, <Striche key={3} n={6} />, <Striche key={4} n={5} />] },
                    { head: 'Anzahl', cells: ['2', '3', '6', '5'] },
                  ]}
                />
              ),
            },
            { title: 'Kontrolle', body: <p><M>{'2 + 3 + 6 + 5 = 16 = n'}</M> ✓ Es wurde kein Wert vergessen.</p> },
          ]}
        />
        <Achtung
          items={[
            'Gleiche Werte werden in der Rangliste mehrfach aufgeschrieben – nicht nur einmal!',
            'Am Ende immer prüfen, ob die Anzahl der Werte noch stimmt.',
            'Bei Zeiten im Sport ist der kleinste Wert der beste, bei Weiten der größte. Die Rangliste ist trotzdem einfach nur der Größe nach geordnet.',
          ]}
        />
      </Section>

      <Section no={3} title="Jetzt du!">
        <Uebungen defs={EXERCISES_DATEN_ORDNEN} />
      </Section>
    </Lesson>
  )
}

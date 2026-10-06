import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useTaskTracking } from '../../hooks/useTaskTracking'

// Fragen orientieren sich an den Themen der Übersichtsseite "Lineare Funktionen".
// answers[0] ist immer die richtige Antwort; die Reihenfolge wird beim Spielstart gemischt.
interface QuizQuestion {
  topic: string
  question: string
  answers: [string, string, string, string]
  hint: string
  explanation: string
}

const EASY: QuizQuestion[] = [
  {
    topic: 'Was ist linear?',
    question: 'Welche dieser Funktionen ist eine lineare Funktion?',
    answers: ['y = 3x + 2', 'y = x² + 1', 'y = 1/x', 'y = 2ˣ'],
    hint: 'Bei einer linearen Funktion kommt x nur in der ersten Potenz vor – also kein x², kein x im Nenner und kein x im Exponenten.',
    explanation: 'y = 3x + 2 hat die Form y = m·x + t. Alle anderen Funktionen enthalten x², 1/x oder x im Exponenten.'
  },
  {
    topic: 'Was ist linear?',
    question: 'Wie sieht der Graph einer linearen Funktion aus?',
    answers: ['Gerade', 'Parabel', 'Hyperbel', 'Kreis'],
    hint: 'Die Steigung bleibt überall gleich – der Graph knickt und krümmt sich nie.',
    explanation: 'Weil die Steigung konstant ist, ist der Graph einer linearen Funktion immer eine Gerade.'
  },
  {
    topic: 'Steigung',
    question: 'Wie heißt m in der Funktionsgleichung y = m·x + t?',
    answers: ['Steigung', 'y-Achsenabschnitt', 'Nullstelle', 'Schnittpunkt'],
    hint: 'm sagt dir, um wie viel y wächst, wenn x um 1 größer wird.',
    explanation: 'm ist die Steigung: Geht man 1 nach rechts, geht der Graph um m nach oben (bzw. unten).'
  },
  {
    topic: 'y-Achsenabschnitt',
    question: 'Welchen y-Achsenabschnitt hat die Gerade y = 4x − 7?',
    answers: ['−7', '4', '7', '−4'],
    hint: 'Setze x = 0 ein. Der y-Achsenabschnitt ist die Zahl ohne x.',
    explanation: 'Für x = 0 gilt y = −7. Der y-Achsenabschnitt ist t = −7, die Gerade schneidet die y-Achse in (0|−7).'
  },
  {
    topic: 'Steigung',
    question: 'Welche Steigung hat die Gerade y = −2x + 5?',
    answers: ['−2', '5', '2', '−5'],
    hint: 'Die Steigung ist die Zahl, die direkt vor dem x steht – inklusive Vorzeichen.',
    explanation: 'In y = m·x + t ist m = −2. Die Gerade fällt also um 2, wenn man 1 nach rechts geht.'
  },
  {
    topic: 'Proportionale Zusammenhänge',
    question: 'Durch welchen Punkt verläuft der Graph einer proportionalen Zuordnung immer?',
    answers: ['Ursprung (0|0)', '(1|1)', '(0|1)', '(1|0)'],
    hint: 'Bei proportionalen Zuordnungen gilt: Das Doppelte von x ergibt das Doppelte von y. Was gehört dann zu x = 0?',
    explanation: 'Proportionale Zuordnungen haben die Form y = m·x (t = 0). Für x = 0 ist y = 0 – der Graph ist eine Ursprungsgerade.'
  },
  {
    topic: 'Proportionale Zusammenhänge',
    question: '1 kg Äpfel kostet 2,40 €. Wie viel kosten 3 kg?',
    answers: ['7,20 €', '5,40 €', '4,80 €', '0,80 €'],
    hint: 'Der Preis ist proportional zur Menge: dreifache Menge, dreifacher Preis.',
    explanation: '3 · 2,40 € = 7,20 €. Die Zuordnung Menge → Preis ist proportional: y = 2,4·x.'
  },
  {
    topic: 'Wertetabelle',
    question: 'Welcher y-Wert gehört in der Wertetabelle von y = 2x + 1 zu x = 3?',
    answers: ['7', '6', '5', '9'],
    hint: 'Setze x = 3 in die Gleichung ein: zuerst mal 2, dann plus 1.',
    explanation: 'y = 2·3 + 1 = 6 + 1 = 7.'
  },
  {
    topic: 'Steigung',
    question: 'Was gilt für eine Gerade mit positiver Steigung (m > 0)?',
    answers: ['Sie steigt von links nach rechts.', 'Sie fällt von links nach rechts.', 'Sie verläuft waagrecht.', 'Sie verläuft immer durch den Ursprung.'],
    hint: 'Stell dir vor, du läufst auf dem Graphen von links nach rechts. Was bedeutet ein positives m?',
    explanation: 'Ist m > 0, wird y größer, wenn x größer wird – die Gerade steigt.'
  },
  {
    topic: 'Steigung',
    question: 'Welche Steigung hat eine waagrechte Gerade, z. B. y = 3?',
    answers: ['0', '3', '1', 'Sie hat keine Steigung, weil sie nicht linear ist.'],
    hint: 'Schreibe y = 3 als y = m·x + 3. Wie groß muss m sein?',
    explanation: 'y = 3 ist y = 0·x + 3. Die Steigung ist m = 0, die Gerade verläuft parallel zur x-Achse.'
  }
]

const MEDIUM: QuizQuestion[] = [
  {
    topic: 'Steigung berechnen',
    question: 'Welche Steigung hat die Gerade durch P(1|2) und Q(3|8)?',
    answers: ['3', '6', '2', '⅓'],
    hint: 'Steigungsdreieck: m = (y₂ − y₁) : (x₂ − x₁).',
    explanation: 'm = (8 − 2) : (3 − 1) = 6 : 2 = 3.'
  },
  {
    topic: 'Steigung berechnen',
    question: 'Welche Steigung hat die Gerade durch A(−2|5) und B(2|−3)?',
    answers: ['−2', '2', '−½', '−8'],
    hint: 'm = (y₂ − y₁) : (x₂ − x₁). Achte auf die Vorzeichen!',
    explanation: 'm = (−3 − 5) : (2 − (−2)) = −8 : 4 = −2.'
  },
  {
    topic: 'Punkt auf Gerade',
    question: 'Welcher Punkt liegt auf der Geraden y = 3x + 1?',
    answers: ['(2|7)', '(1|3)', '(0|3)', '(3|9)'],
    hint: 'Punktprobe: Setze den x-Wert ein und vergleiche das Ergebnis mit dem y-Wert.',
    explanation: '3·2 + 1 = 7 ✓. Bei den anderen Punkten passt es nicht: 3·1 + 1 = 4, 3·0 + 1 = 1, 3·3 + 1 = 10.'
  },
  {
    topic: 'Nullstellen',
    question: 'Wo liegt die Nullstelle von y = 2x − 6?',
    answers: ['x = 3', 'x = −3', 'x = 6', 'x = −6'],
    hint: 'An der Nullstelle ist y = 0. Löse also 0 = 2x − 6.',
    explanation: '0 = 2x − 6 ⇔ 6 = 2x ⇔ x = 3.'
  },
  {
    topic: 'Nullstellen',
    question: 'Wo liegt die Nullstelle von y = −4x + 2?',
    answers: ['x = 0,5', 'x = −0,5', 'x = 2', 'x = −2'],
    hint: 'Setze y = 0 und löse nach x auf.',
    explanation: '0 = −4x + 2 ⇔ 4x = 2 ⇔ x = 0,5.'
  },
  {
    topic: 'Parallele Geraden',
    question: 'Welche Gerade ist parallel zu y = 2x − 1?',
    answers: ['y = 2x + 5', 'y = −2x − 1', 'y = −½x + 3', 'y = ½x'],
    hint: 'Parallele Geraden haben dieselbe Steigung.',
    explanation: 'Parallel bedeutet: gleiche Steigung m = 2. Das trifft nur auf y = 2x + 5 zu.'
  },
  {
    topic: 'Senkrechte Geraden',
    question: 'Welche Gerade steht senkrecht auf y = 3x + 2?',
    answers: ['y = −⅓x + 1', 'y = 3x − 1', 'y = −3x + 2', 'y = ⅓x + 2'],
    hint: 'Für senkrechte Geraden gilt m₁ · m₂ = −1.',
    explanation: '3 · m₂ = −1 ⇔ m₂ = −⅓. Also steht y = −⅓x + 1 senkrecht auf y = 3x + 2.'
  },
  {
    topic: 'Funktionsgleichung aufstellen',
    question: 'Eine Gerade hat die Steigung m = 2 und verläuft durch P(1|5). Wie lautet ihre Gleichung?',
    answers: ['y = 2x + 3', 'y = 2x + 5', 'y = 2x + 1', 'y = 5x + 2'],
    hint: 'Setze m und die Koordinaten von P in y = m·x + t ein und berechne t.',
    explanation: '5 = 2·1 + t ⇔ t = 3. Also y = 2x + 3.'
  },
  {
    topic: 'Funktionsgleichung ablesen',
    question: 'Eine Gerade schneidet die y-Achse bei 2. Geht man 1 nach rechts, geht sie 3 nach oben. Wie lautet die Gleichung?',
    answers: ['y = 3x + 2', 'y = 2x + 3', 'y = 3x − 2', 'y = −3x + 2'],
    hint: '„1 nach rechts, 3 nach oben“ ist das Steigungsdreieck. Der Schnittpunkt mit der y-Achse liefert t.',
    explanation: 'Steigung m = 3, y-Achsenabschnitt t = 2 → y = 3x + 2.'
  },
  {
    topic: 'Wertetabelle',
    question: 'Zu welcher Funktion passt die Wertetabelle  x: 0 | 1 | 2   y: 4 | 1 | −2 ?',
    answers: ['y = −3x + 4', 'y = 3x + 4', 'y = 4x − 3', 'y = −3x − 4'],
    hint: 'Bei x = 0 liest du t ab. Um wie viel ändert sich y, wenn x um 1 größer wird?',
    explanation: 'Für x = 0 ist y = 4, also t = 4. Pro Schritt nimmt y um 3 ab, also m = −3: y = −3x + 4.'
  },
  {
    topic: 'Proportionale Zusammenhänge',
    question: 'Eine Ursprungsgerade verläuft durch den Punkt (4|2). Wie lautet ihre Gleichung?',
    answers: ['y = ½x', 'y = 2x', 'y = 4x + 2', 'y = x + 2'],
    hint: 'Ursprungsgerade: y = m·x. Setze den Punkt ein und berechne m.',
    explanation: '2 = m·4 ⇔ m = ½. Also y = ½x.'
  },
  {
    topic: 'Anwendungsaufgaben',
    question: 'Ein Taxi kostet 4 € Grundgebühr und 2 € pro gefahrenem Kilometer. Welche Funktion beschreibt den Preis y für x km?',
    answers: ['y = 2x + 4', 'y = 4x + 2', 'y = 6x', 'y = 2x − 4'],
    hint: 'Was hängt von den Kilometern ab (Steigung) und was fällt immer an (y-Achsenabschnitt)?',
    explanation: 'Der Kilometerpreis 2 € ist die Steigung, die Grundgebühr 4 € der y-Achsenabschnitt: y = 2x + 4.'
  },
  {
    topic: 'Anwendungsaufgaben',
    question: 'Ein Handytarif kostet 10 € im Monat plus 0,05 € pro Minute. Was zahlt man bei 200 Minuten?',
    answers: ['20 €', '15 €', '30 €', '10,05 €'],
    hint: 'Funktion: y = 0,05x + 10. Setze x = 200 ein.',
    explanation: 'y = 0,05 · 200 + 10 = 10 + 10 = 20 €.'
  },
  {
    topic: 'Punkt auf Gerade',
    question: 'Der Punkt P(x|11) liegt auf der Geraden y = 2x + 3. Wie groß ist x?',
    answers: ['4', '7', '25', '5,5'],
    hint: 'Setze y = 11 ein und löse die Gleichung 11 = 2x + 3 nach x auf.',
    explanation: '11 = 2x + 3 ⇔ 8 = 2x ⇔ x = 4.'
  }
]

const HARD: QuizQuestion[] = [
  {
    topic: 'Schnittpunkt',
    question: 'In welchem Punkt schneiden sich y = 2x + 1 und y = −x + 7?',
    answers: ['S(2|5)', 'S(5|2)', 'S(3|7)', 'S(2|3)'],
    hint: 'Gleichsetzen: 2x + 1 = −x + 7. Danach x in eine der Gleichungen einsetzen.',
    explanation: '2x + 1 = −x + 7 ⇔ 3x = 6 ⇔ x = 2. y = 2·2 + 1 = 5 → S(2|5).'
  },
  {
    topic: 'Schnittpunkt',
    question: 'In welchem Punkt schneiden sich y = 3x − 4 und y = x + 2?',
    answers: ['S(3|5)', 'S(5|3)', 'S(3|1)', 'S(2|4)'],
    hint: 'Setze die beiden rechten Seiten gleich und löse nach x auf.',
    explanation: '3x − 4 = x + 2 ⇔ 2x = 6 ⇔ x = 3. y = 3 + 2 = 5 → S(3|5).'
  },
  {
    topic: 'Funktionsgleichung aufstellen',
    question: 'Wie lautet die Gleichung der Geraden durch A(1|1) und B(3|5)?',
    answers: ['y = 2x − 1', 'y = 2x + 1', 'y = ½x + ½', 'y = 4x − 3'],
    hint: 'Erst die Steigung aus beiden Punkten berechnen, dann einen Punkt einsetzen und t bestimmen.',
    explanation: 'm = (5 − 1) : (3 − 1) = 2. 1 = 2·1 + t ⇔ t = −1 → y = 2x − 1.'
  },
  {
    topic: 'Funktionsgleichung aufstellen',
    question: 'Wie lautet die Gleichung der Geraden durch A(−2|7) und B(4|−5)?',
    answers: ['y = −2x + 3', 'y = 2x + 11', 'y = −2x − 3', 'y = −½x + 6'],
    hint: 'm = (y₂ − y₁) : (x₂ − x₁), danach A oder B in y = m·x + t einsetzen.',
    explanation: 'm = (−5 − 7) : (4 + 2) = −12 : 6 = −2. 7 = −2·(−2) + t ⇔ t = 3 → y = −2x + 3.'
  },
  {
    topic: 'Lineare Gleichungssysteme',
    question: 'Löse das Gleichungssystem:  x + y = 10  und  x − y = 4',
    answers: ['x = 7, y = 3', 'x = 3, y = 7', 'x = 6, y = 4', 'x = 8, y = 2'],
    hint: 'Additionsverfahren: Addiere beide Gleichungen – dann fällt y weg.',
    explanation: 'Addition: 2x = 14 ⇔ x = 7. Eingesetzt: 7 + y = 10 ⇔ y = 3.'
  },
  {
    topic: 'Lineare Gleichungssysteme',
    question: 'Löse das Gleichungssystem:  2x + y = 11  und  x − y = 1',
    answers: ['x = 4, y = 3', 'x = 3, y = 4', 'x = 5, y = 1', 'x = 3, y = 5'],
    hint: 'Additionsverfahren: Addiert man beide Gleichungen, fällt y weg.',
    explanation: 'Addition: 3x = 12 ⇔ x = 4. Eingesetzt: 4 − y = 1 ⇔ y = 3. Probe: 2·4 + 3 = 11 ✓.'
  },
  {
    topic: 'Senkrechte Geraden',
    question: 'Welche Gerade steht senkrecht auf y = −½x + 1 und verläuft durch P(2|1)?',
    answers: ['y = 2x − 3', 'y = −½x + 2', 'y = 2x + 1', 'y = −2x + 5'],
    hint: 'Senkrecht: m₁ · m₂ = −1. Danach P einsetzen, um t zu berechnen.',
    explanation: '−½ · m₂ = −1 ⇔ m₂ = 2. 1 = 2·2 + t ⇔ t = −3 → y = 2x − 3.'
  },
  {
    topic: 'Parallele Geraden',
    question: 'Welche Gerade ist parallel zu y = −3x + 4 und verläuft durch P(1|2)?',
    answers: ['y = −3x + 5', 'y = 3x − 1', 'y = −3x + 2', 'y = ⅓x + 5/3'],
    hint: 'Parallel heißt gleiche Steigung. Setze dann P ein, um t zu bestimmen.',
    explanation: 'm = −3. 2 = −3·1 + t ⇔ t = 5 → y = −3x + 5.'
  },
  {
    topic: 'Eigenschaften linearer Funktionen',
    question: 'Welche Aussage über die Gerade y = −2x + 4 ist richtig?',
    answers: ['Sie hat die Nullstelle x = 2.', 'Sie steigt von links nach rechts.', 'Sie schneidet die y-Achse bei −2.', 'Sie ist parallel zu y = 2x + 1.'],
    hint: 'Prüfe jede Aussage: Vorzeichen von m, Wert von t und die Lösung von 0 = −2x + 4.',
    explanation: '0 = −2x + 4 ⇔ x = 2. Die Gerade fällt (m = −2), schneidet die y-Achse bei 4 und ist wegen m = −2 ≠ 2 nicht parallel zu y = 2x + 1.'
  },
  {
    topic: 'Schnittpunkt',
    question: 'Zwei Geraden haben dieselbe Steigung, aber verschiedene y-Achsenabschnitte. Wie viele Schnittpunkte haben sie?',
    answers: ['Keinen', 'Genau einen', 'Genau zwei', 'Unendlich viele'],
    hint: 'Gleiche Steigung bedeutet, dass die Geraden parallel sind.',
    explanation: 'Die Geraden sind echt parallel – sie schneiden sich nie.'
  },
  {
    topic: 'Lineare Gleichungssysteme',
    question: 'Wie viele Lösungen hat das Gleichungssystem  y = 2x + 1  und  2y = 4x + 2 ?',
    answers: ['Unendlich viele', 'Keine', 'Genau eine', 'Genau zwei'],
    hint: 'Teile die zweite Gleichung durch 2 und vergleiche mit der ersten.',
    explanation: '2y = 4x + 2 ⇔ y = 2x + 1. Beide Gleichungen beschreiben dieselbe Gerade – jeder Punkt der Geraden ist eine Lösung.'
  },
  {
    topic: 'Anwendungsaufgaben',
    question: 'Tarif A: 5 € + 0,10 € pro Minute. Tarif B: 15 € + 0,05 € pro Minute. Bei wie vielen Minuten kosten beide gleich viel?',
    answers: ['200 Minuten', '100 Minuten', '150 Minuten', '300 Minuten'],
    hint: 'Stelle beide Funktionen auf und setze sie gleich: 0,10x + 5 = 0,05x + 15.',
    explanation: '0,10x + 5 = 0,05x + 15 ⇔ 0,05x = 10 ⇔ x = 200. Dann kosten beide Tarife 25 €.'
  },
  {
    topic: 'Anwendungsaufgaben',
    question: 'Eine 30 cm lange Kerze brennt pro Stunde um 2 cm ab. Nach wie vielen Stunden ist sie komplett abgebrannt?',
    answers: ['15 Stunden', '28 Stunden', '60 Stunden', '12 Stunden'],
    hint: 'Höhe: y = −2x + 30. Gesucht ist die Nullstelle.',
    explanation: '0 = −2x + 30 ⇔ 2x = 30 ⇔ x = 15. Nach 15 Stunden ist die Kerze abgebrannt.'
  },
  {
    topic: 'Nullstellen & y-Achsenabschnitt',
    question: 'Die Gerade y = −2x + 4 bildet mit den beiden Koordinatenachsen ein Dreieck. Wie groß ist sein Flächeninhalt?',
    answers: ['4 FE', '8 FE', '2 FE', '6 FE'],
    hint: 'Die Katheten des Dreiecks reichen vom Ursprung bis zur Nullstelle bzw. bis zum y-Achsenabschnitt. A = ½ · g · h.',
    explanation: 'Nullstelle: x = 2, y-Achsenabschnitt: 4. A = ½ · 2 · 4 = 4 FE.'
  },
  {
    topic: 'Punkt auf Gerade',
    question: 'Eine Gerade verläuft durch A(1|2) und B(5|10). Welchen y-Wert hat der Punkt P(3|y) auf dieser Geraden?',
    answers: ['6', '8', '4', '5'],
    hint: 'Bestimme zuerst die Gleichung: m aus A und B, dann t. Anschließend x = 3 einsetzen.',
    explanation: 'm = (10 − 2) : (5 − 1) = 2, 2 = 2·1 + t ⇔ t = 0 → y = 2x. Für x = 3: y = 6.'
  }
]

const PRIZES = [50, 100, 200, 300, 500, 1000, 2000, 4000, 8000, 16000, 32000, 64000, 125000, 500000, 1000000]
// Sicherheitsstufen (Index in PRIZES): 500 € und 16.000 €
const SAFE_LEVELS = [4, 9]
const LETTERS = ['A', 'B', 'C', 'D']

interface GameQuestion extends QuizQuestion {
  options: string[]
  correctIndex: number
}

type Phase = 'start' | 'question' | 'feedback' | 'end'

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function prepare(q: QuizQuestion): GameQuestion {
  const options = shuffle(q.answers)
  return { ...q, options, correctIndex: options.indexOf(q.answers[0]) }
}

function buildGame(): GameQuestion[] {
  return [
    ...shuffle(EASY).slice(0, 5),
    ...shuffle(MEDIUM).slice(0, 5),
    ...shuffle(HARD).slice(0, 5)
  ].map(prepare)
}

function formatPrize(value: number) {
  return value.toLocaleString('de-DE') + ' €'
}

// Sicher erreichter Gewinn, wenn bei Frage `level` (Index) falsch geantwortet wird.
function safePrize(level: number) {
  const reached = SAFE_LEVELS.filter((s) => s < level)
  return reached.length ? PRIZES[reached[reached.length - 1]] : 0
}

// Publikumsjoker: Je schwerer die Frage, desto unsicherer das Publikum.
function audienceVotes(q: GameQuestion, level: number, hidden: number[]): number[] {
  const visible = [0, 1, 2, 3].filter((i) => !hidden.includes(i))
  const reliability = level < 5 ? 0.95 : level < 10 ? 0.8 : 0.65
  const favourite = Math.random() < reliability ? q.correctIndex : visible.filter((i) => i !== q.correctIndex)[Math.floor(Math.random() * (visible.length - 1))]
  const raw = [0, 1, 2, 3].map((i) => {
    if (!visible.includes(i)) return 0
    const base = Math.random() * 20 + 5
    if (i === favourite) return base + (level < 5 ? 70 : level < 10 ? 45 : 25)
    if (i === q.correctIndex) return base + 10
    return base
  })
  const sum = raw.reduce((a, b) => a + b, 0)
  const votes = raw.map((v) => Math.round((v / sum) * 100))
  // Rundungsdifferenz dem Favoriten zuschlagen, damit die Summe 100 % ergibt.
  votes[favourite] += 100 - votes.reduce((a, b) => a + b, 0)
  return votes
}

interface PhoneAnswer {
  hint: string
  guess: number
  confidence: string
}

function phoneAnswer(q: GameQuestion, level: number, hidden: number[]): PhoneAnswer {
  const visible = [0, 1, 2, 3].filter((i) => !hidden.includes(i))
  const reliability = level < 5 ? 0.95 : level < 10 ? 0.85 : 0.7
  const right = Math.random() < reliability
  const wrongOptions = visible.filter((i) => i !== q.correctIndex)
  const guess = right ? q.correctIndex : wrongOptions[Math.floor(Math.random() * wrongOptions.length)]
  const confidence = level < 5 ? 'Da bin ich mir ziemlich sicher!' : level < 10 ? 'Ich glaube, das stimmt – aber rechne lieber nach.' : 'Puh, ganz sicher bin ich mir nicht …'
  return { hint: q.hint, guess, confidence }
}

export default function WerWirdMillionaer() {
  const tracking = useTaskTracking('Wer wird Millionär?', { shownOnMount: false })
  const [phase, setPhase] = useState<Phase>('start')
  const [questions, setQuestions] = useState<GameQuestion[]>([])
  const [level, setLevel] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [locked, setLocked] = useState(false)
  const [hidden, setHidden] = useState<number[]>([])
  const [jokers, setJokers] = useState({ fifty: true, audience: true, phone: true })
  const [votes, setVotes] = useState<number[] | null>(null)
  const [phone, setPhone] = useState<PhoneAnswer | null>(null)
  const [lastCorrect, setLastCorrect] = useState(false)
  const [result, setResult] = useState<{ prize: number; reason: 'won' | 'wrong' | 'quit' } | null>(null)
  const [showLadder, setShowLadder] = useState(false)

  const current = questions[level]

  const startQuestion = (qs: GameQuestion[], idx: number) => {
    setLevel(idx)
    setSelected(null)
    setLocked(false)
    setHidden([])
    setVotes(null)
    setPhone(null)
    setPhase('question')
    tracking.onTaskStart(`Wer wird Millionär? – ${qs[idx].topic}`)
  }

  const startGame = () => {
    const qs = buildGame()
    setQuestions(qs)
    setJokers({ fifty: true, audience: true, phone: true })
    setResult(null)
    startQuestion(qs, 0)
  }

  const handleFifty = () => {
    if (!jokers.fifty || locked) return
    const wrong = shuffle([0, 1, 2, 3].filter((i) => i !== current.correctIndex)).slice(0, 2)
    setHidden(wrong)
    if (selected !== null && wrong.includes(selected)) setSelected(null)
    if (votes) setVotes(null)
    setJokers((j) => ({ ...j, fifty: false }))
    tracking.onHintShown()
  }

  const handleAudience = () => {
    if (!jokers.audience || locked) return
    setVotes(audienceVotes(current, level, hidden))
    setJokers((j) => ({ ...j, audience: false }))
    tracking.onHintShown()
  }

  const handlePhone = () => {
    if (!jokers.phone || locked) return
    setPhone(phoneAnswer(current, level, hidden))
    setJokers((j) => ({ ...j, phone: false }))
    tracking.onHintShown()
  }

  const lockIn = () => {
    if (selected === null || locked) return
    setLocked(true)
    const correct = selected === current.correctIndex
    tracking.onCheck(correct)
    // Kurze Spannungspause wie in der Show, dann Auflösung.
    window.setTimeout(() => {
      setLastCorrect(correct)
      setPhase('feedback')
      if (correct && level === PRIZES.length - 1) {
        setResult({ prize: PRIZES[level], reason: 'won' })
      } else if (!correct) {
        setResult({ prize: safePrize(level), reason: 'wrong' })
      }
    }, 1200)
  }

  const next = () => {
    if (result) {
      setPhase('end')
      return
    }
    startQuestion(questions, level + 1)
  }

  const quit = () => {
    if (locked) return
    setResult({ prize: level > 0 ? PRIZES[level - 1] : 0, reason: 'quit' })
    setPhase('end')
  }

  const answerClass = (i: number) => {
    const base = 'relative w-full text-left rounded-full border-2 px-5 py-3 sm:py-4 font-semibold transition-all duration-200 flex items-center gap-3 min-h-[3.5rem]'
    if (hidden.includes(i)) return `${base} border-slate-700 bg-slate-900/40 text-transparent pointer-events-none`
    if (phase === 'feedback') {
      if (i === current.correctIndex) return `${base} border-emerald-300 bg-emerald-500 text-white`
      if (i === selected) return `${base} border-red-300 bg-red-600 text-white`
      return `${base} border-indigo-400/60 bg-indigo-950/70 text-indigo-100`
    }
    if (i === selected) return `${base} border-amber-200 bg-amber-400 text-indigo-950 ${locked ? 'animate-pulse' : ''}`
    return `${base} border-indigo-300/70 bg-indigo-950/80 text-white hover:bg-indigo-800 hover:border-amber-300`
  }

  const jokerButton = (available: boolean, onClick: () => void, label: string, content: ReactNode) => (
    <button
      type="button"
      onClick={onClick}
      disabled={!available || locked || phase !== 'question'}
      title={label}
      aria-label={label}
      className={`relative w-16 h-11 sm:w-20 sm:h-12 rounded-full border-2 flex items-center justify-center font-bold transition-all ${available ? 'border-amber-300 bg-indigo-900 text-amber-200 hover:bg-indigo-700 hover:scale-105' : 'border-slate-600 bg-slate-800 text-slate-500 cursor-not-allowed'}`}
    >
      {content}
      {!available && <span className="absolute inset-0 flex items-center justify-center text-red-500 text-3xl font-black">✕</span>}
    </button>
  )

  const ladder = (
    <ol className="flex flex-col-reverse gap-0.5 text-sm">
      {PRIZES.map((p, i) => {
        const isCurrent = phase !== 'start' && i === level
        const isDone = phase !== 'start' && (i < level || (i === level && phase === 'feedback' && lastCorrect))
        const isSafe = SAFE_LEVELS.includes(i) || i === PRIZES.length - 1
        return (
          <li
            key={p}
            className={`flex justify-between gap-4 px-3 py-1 rounded-md ${isCurrent ? 'bg-amber-400 text-indigo-950 font-bold' : isSafe ? 'text-white font-semibold' : 'text-amber-200/90'}`}
          >
            <span className="w-6 text-right">{i + 1}</span>
            <span className="flex-1 text-right">
              {isDone && !isCurrent && <span className="mr-1 text-amber-300">◆</span>}
              {formatPrize(p)}
            </span>
          </li>
        )
      })}
    </ol>
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-[#0b1446] to-black text-white flex flex-col">
      <div className="w-full max-w-6xl mx-auto px-4 pt-4">
        <Link to="/lineare_funktionen" className="inline-block text-sm text-indigo-200 hover:text-amber-300">
          ← Zurück zu Lineare Funktionen
        </Link>
      </div>

      {phase === 'start' && (
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-10 text-center">
          <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full border-4 border-amber-300 bg-gradient-to-br from-indigo-800 to-indigo-950 flex items-center justify-center shadow-[0_0_40px_rgba(251,191,36,0.35)] mb-6">
            <span className="text-5xl sm:text-6xl">€</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-amber-300 mb-2">Wer wird Millionär?</h1>
          <p className="text-lg sm:text-xl text-indigo-100 mb-8">Sonderausgabe: Lineare Funktionen</p>
          <div className="max-w-xl bg-indigo-950/70 border border-indigo-400/40 rounded-2xl p-5 text-left text-indigo-100 space-y-2 mb-8">
            <p className="text-left text-indigo-100">• 15 Fragen von leicht bis schwer – von 50 € bis zur Million.</p>
            <p className="text-left text-indigo-100">• Sicherheitsstufen bei <strong className="text-white">500 €</strong> und <strong className="text-white">16.000 €</strong>.</p>
            <p className="text-left text-indigo-100">• Drei Joker: <strong className="text-amber-300">50:50</strong>, <strong className="text-amber-300">Publikum</strong> und <strong className="text-amber-300">Telefon</strong> (gibt dir einen Rechentipp).</p>
            <p className="text-left text-indigo-100">• Du kannst jederzeit aussteigen und deinen bisherigen Gewinn mitnehmen.</p>
            <p className="text-left text-indigo-300 text-sm">Tipp: Schmierpapier bereitlegen!</p>
          </div>
          <button
            type="button"
            onClick={startGame}
            className="rounded-full bg-amber-400 hover:bg-amber-300 text-indigo-950 font-bold text-lg px-10 py-3 shadow-lg transition-transform hover:scale-105"
          >
            Spiel starten
          </button>
        </main>
      )}

      {(phase === 'question' || phase === 'feedback') && current && (
        <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-6 flex flex-col lg:flex-row gap-6">
          <section className="flex-1 flex flex-col gap-5">
            {/* Joker + Aussteigen */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex gap-2 sm:gap-3">
                {jokerButton(jokers.fifty, handleFifty, '50:50-Joker', <span>50:50</span>)}
                {jokerButton(jokers.audience, handleAudience, 'Publikumsjoker', <i className="fa-solid fa-users" />)}
                {jokerButton(jokers.phone, handlePhone, 'Telefonjoker', <i className="fa-solid fa-phone" />)}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowLadder((s) => !s)}
                  className="lg:hidden rounded-full border border-indigo-300/60 px-3 py-1.5 text-sm text-indigo-100 hover:bg-indigo-800"
                >
                  Gewinnstufen
                </button>
                {phase === 'question' && (
                  <button
                    type="button"
                    onClick={quit}
                    disabled={locked}
                    className="rounded-full border border-red-300/70 px-4 py-1.5 text-sm text-red-200 hover:bg-red-900/50 disabled:opacity-40"
                  >
                    Aussteigen ({formatPrize(level > 0 ? PRIZES[level - 1] : 0)})
                  </button>
                )}
              </div>
            </div>

            {showLadder && <div className="lg:hidden bg-indigo-950/80 border border-indigo-400/40 rounded-2xl p-3">{ladder}</div>}

            <div className="text-center text-amber-300 font-semibold">
              Frage {level + 1} von {PRIZES.length} · um {formatPrize(PRIZES[level])}
              <span className="block text-xs text-indigo-300 font-normal mt-0.5">Thema: {current.topic}</span>
            </div>

            {/* Frage */}
            <div className="rounded-3xl border-2 border-indigo-300/70 bg-gradient-to-b from-indigo-900 to-indigo-950 px-5 py-6 sm:px-8 sm:py-8 text-center text-lg sm:text-2xl font-semibold leading-snug shadow-[0_0_30px_rgba(99,102,241,0.25)] whitespace-pre-wrap">
              {current.question}
            </div>

            {/* Antworten */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {current.options.map((opt, i) => (
                <button
                  key={i}
                  type="button"
                  disabled={locked || phase !== 'question' || hidden.includes(i)}
                  onClick={() => setSelected(i)}
                  className={answerClass(i)}
                >
                  <span className={`font-bold ${hidden.includes(i) ? 'text-transparent' : 'text-amber-300'} ${(i === selected && phase === 'question') ? '!text-indigo-950' : ''} ${phase === 'feedback' && (i === current.correctIndex || i === selected) ? '!text-white' : ''}`}>
                    {LETTERS[i]}:
                  </span>
                  <span>{opt}</span>
                </button>
              ))}
            </div>

            {phase === 'question' && (
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={lockIn}
                  disabled={selected === null || locked}
                  className="rounded-full bg-amber-400 hover:bg-amber-300 text-indigo-950 font-bold px-8 py-3 disabled:opacity-40 disabled:hover:bg-amber-400 transition-colors"
                >
                  {locked ? 'Wird ausgewertet …' : selected === null ? 'Antwort auswählen' : `Antwort ${LETTERS[selected]} einloggen`}
                </button>
              </div>
            )}

            {/* Joker-Ergebnisse */}
            {votes && phase === 'question' && (
              <div className="rounded-2xl bg-indigo-950/80 border border-indigo-400/40 p-4">
                <p className="text-left font-semibold text-amber-300 mb-3"><i className="fa-solid fa-users mr-2" />Das Publikum hat abgestimmt:</p>
                <div className="flex items-end justify-around h-36 gap-3">
                  {votes.map((v, i) => (
                    <div key={i} className="flex flex-col items-center justify-end h-full flex-1">
                      <span className="text-sm mb-1">{hidden.includes(i) ? '' : `${v} %`}</span>
                      <div className="w-full max-w-[3rem] bg-gradient-to-t from-amber-500 to-amber-300 rounded-t" style={{ height: `${Math.max(v, 1)}%` }} />
                      <span className="mt-1 font-bold text-amber-200">{LETTERS[i]}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {phone && phase === 'question' && (
              <div className="rounded-2xl bg-indigo-950/80 border border-indigo-400/40 p-4 space-y-2">
                <p className="text-left font-semibold text-amber-300"><i className="fa-solid fa-phone mr-2" />Dein Telefonjoker sagt:</p>
                <p className="text-left italic text-white">„Okay, pass auf: {phone.hint}“</p>
                <p className="text-left italic text-white">„Ich würde <strong className="not-italic text-amber-300">{LETTERS[phone.guess]}</strong> nehmen. {phone.confidence}“</p>
              </div>
            )}

            {/* Auflösung */}
            {phase === 'feedback' && (
              <div className={`rounded-2xl p-5 border-2 ${lastCorrect ? 'bg-emerald-950/70 border-emerald-400' : 'bg-red-950/70 border-red-400'}`}>
                <p className="text-left text-xl font-bold mb-2 text-white">
                  {lastCorrect
                    ? level === PRIZES.length - 1
                      ? '🎉 Richtig! Du bist Millionär!'
                      : `Richtig! Du hast ${formatPrize(PRIZES[level])} sicher auf dem Konto.`
                    : `Leider falsch. Richtig wäre ${LETTERS[current.correctIndex]}: ${current.options[current.correctIndex]}`}
                </p>
                <p className="text-left text-indigo-100"><strong>Lösungsweg:</strong> {current.explanation}</p>
                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={next}
                    className="rounded-full bg-amber-400 hover:bg-amber-300 text-indigo-950 font-bold px-6 py-2"
                  >
                    {result ? 'Zum Ergebnis' : 'Nächste Frage'}
                  </button>
                </div>
              </div>
            )}
          </section>

          <aside className="hidden lg:block w-60 shrink-0 bg-indigo-950/70 border border-indigo-400/40 rounded-2xl p-3 self-start">
            {ladder}
          </aside>
        </main>
      )}

      {phase === 'end' && result && (
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-10 text-center">
          <div className="text-6xl mb-4">{result.reason === 'won' ? '🏆' : result.reason === 'quit' ? '💼' : '😕'}</div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-amber-300 mb-3">
            {result.reason === 'won' ? 'Du bist Millionär!' : result.reason === 'quit' ? 'Clever ausgestiegen!' : 'Spiel vorbei'}
          </h2>
          <p className="text-lg text-indigo-100 mb-2">
            {result.reason === 'won'
              ? 'Alle 15 Fragen richtig – du beherrschst lineare Funktionen!'
              : result.reason === 'quit'
                ? `Du bist bei Frage ${level + 1} ausgestiegen.`
                : `Du bist an Frage ${level + 1} gescheitert.`}
          </p>
          <p className="text-white text-2xl sm:text-3xl font-bold mb-8">
            Gewinn: <span className="text-amber-300">{formatPrize(result.prize)}</span>
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              type="button"
              onClick={startGame}
              className="rounded-full bg-amber-400 hover:bg-amber-300 text-indigo-950 font-bold text-lg px-8 py-3"
            >
              Neues Spiel
            </button>
            <Link
              to="/lineare_funktionen"
              className="rounded-full border-2 border-indigo-300 text-indigo-100 hover:bg-indigo-800 font-bold text-lg px-8 py-3"
            >
              Zur Übersicht
            </Link>
          </div>
        </main>
      )}
    </div>
  )
}

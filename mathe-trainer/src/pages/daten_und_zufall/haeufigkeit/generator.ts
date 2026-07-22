// Generator für Aufgaben zu absoluter und relativer Häufigkeit.
// Die Fragetexte benennen den gesuchten Häufigkeitstyp nie explizit –
// das muss aus der Formulierung und den gegebenen Informationen erschlossen werden.

export type Representation = 'text' | 'table' | 'tally' | 'chart';
export type ChartKind = 'bar' | 'pie';
export type QuestionKind = 'absolute' | 'relative' | 'missingAbsolute' | 'reverseAbsolute';
export type AnswerFormat = 'integer' | 'percentOrDecimal';

interface Category {
  name: string;
  icon: string;
}

interface Topic {
  key: string;
  titleSentence: (n: number) => string;
  unitPlural: string; // z.B. "Schülerinnen und Schüler", "Tage", "Produkte"
  unitPluralGenitive?: string; // abweichende Form nach "der"/"aller", nur bei substantivierten Partizipien nötig (z.B. "Teilnehmenden")
  categories: Category[];
  nRange: [number, number];
  minorityIndices?: number[]; // Kategorien, die aus Realismusgründen nie die Mehrheit stellen sollen (z.B. "fehlerhaft")
}

export interface CategoryResult extends Category {
  count: number;
  revealed: boolean;
}

export interface GeneratedTask {
  id: string;
  topicKey: string;
  representation: Representation;
  chartKind?: ChartKind;
  intro: string[];
  categories: CategoryResult[];
  total: number;
  unitPlural: string;
  hiddenCategoryName?: string;
  questionKind: QuestionKind;
  questionText: string;
  targetCategoryName: string;
  answerFormat: AnswerFormat;
  correctInteger?: number;
  correctPercent?: number;
  solutionSteps: string[];
}

const topics: Topic[] = [
  {
    key: 'farbe',
    titleSentence: (n) => `In einer Umfrage zur Lieblingsfarbe wurden ${n} Schülerinnen und Schüler befragt.`,
    unitPlural: 'Schülerinnen und Schüler',
    categories: [
      { name: 'Blau', icon: '🔵' },
      { name: 'Rot', icon: '🔴' },
      { name: 'Grün', icon: '🟢' },
      { name: 'Gelb', icon: '🟡' },
    ],
    nRange: [20, 120],
  },
  {
    key: 'haustier',
    titleSentence: (n) => `In einer Klasse mit ${n} Kindern wurde erfragt, welches Haustier sie haben.`,
    unitPlural: 'Kinder',
    categories: [
      { name: 'Hund', icon: '🐶' },
      { name: 'Katze', icon: '🐱' },
      { name: 'Kaninchen', icon: '🐰' },
      { name: 'keins', icon: '🚫' },
    ],
    nRange: [20, 100],
  },
  {
    key: 'schulweg',
    titleSentence: (n) => `${n} Schülerinnen und Schüler wurden gefragt, wie sie zur Schule kommen.`,
    unitPlural: 'Schülerinnen und Schüler',
    categories: [
      { name: 'zu Fuß', icon: '🚶' },
      { name: 'Fahrrad', icon: '🚲' },
      { name: 'Bus', icon: '🚌' },
      { name: 'Auto', icon: '🚗' },
    ],
    nRange: [25, 150],
  },
  {
    key: 'getraenk',
    titleSentence: (n) => `Bei einer Umfrage zum Lieblingsgetränk wurden ${n} Personen befragt.`,
    unitPlural: 'Personen',
    categories: [
      { name: 'Wasser', icon: '💧' },
      { name: 'Saft', icon: '🧃' },
      { name: 'Limonade', icon: '🥤' },
      { name: 'Tee', icon: '🍵' },
    ],
    nRange: [40, 250],
  },
  {
    key: 'sport',
    titleSentence: (n) => `In einem Sportverein mit ${n} Mitgliedern wurde die Lieblingssportart erfragt.`,
    unitPlural: 'Vereinsmitglieder',
    categories: [
      { name: 'Fußball', icon: '⚽' },
      { name: 'Schwimmen', icon: '🏊' },
      { name: 'Tennis', icon: '🎾' },
      { name: 'Leichtathletik', icon: '🏃' },
    ],
    nRange: [20, 150],
  },
  {
    key: 'handy',
    titleSentence: (n) => `Unter ${n} befragten Personen wurde das Betriebssystem ihres Smartphones erhoben.`,
    unitPlural: 'Personen',
    categories: [
      { name: 'Android', icon: '🤖' },
      { name: 'iOS', icon: '📱' },
      { name: 'Sonstiges', icon: '❔' },
    ],
    nRange: [20, 200],
    minorityIndices: [2],
  },
  {
    key: 'pizza',
    titleSentence: (n) => `An einem Abend bestellten ${n} Gäste in einer Pizzeria eine Pizza.`,
    unitPlural: 'Gäste',
    categories: [
      { name: 'Salami', icon: '🍕' },
      { name: 'Margherita', icon: '🍕' },
      { name: 'Schinken', icon: '🍕' },
      { name: 'Gemüse', icon: '🍕' },
    ],
    nRange: [20, 150],
  },
  {
    key: 'wetter',
    titleSentence: (n) => `An ${n} Tagen eines Monats wurde das Wetter notiert.`,
    unitPlural: 'Tage',
    categories: [
      { name: 'sonnig', icon: '☀️' },
      { name: 'bewölkt', icon: '☁️' },
      { name: 'regnerisch', icon: '🌧️' },
    ],
    nRange: [20, 31],
  },
  {
    key: 'fabrik',
    titleSentence: (n) => `Bei einer Qualitätskontrolle wurden ${n} Produkte geprüft.`,
    unitPlural: 'Produkte',
    categories: [
      { name: 'fehlerfrei', icon: '✅' },
      { name: 'fehlerhaft', icon: '❌' },
    ],
    nRange: [50, 300],
    minorityIndices: [1],
  },
  {
    key: 'verkehr',
    titleSentence: (n) => `An einer Kreuzung wurden an einem Vormittag ${n} Verkehrsteilnehmende gezählt.`,
    unitPlural: 'Verkehrsteilnehmende',
    unitPluralGenitive: 'Verkehrsteilnehmenden',
    categories: [
      { name: 'Autos', icon: '🚗' },
      { name: 'Fahrräder', icon: '🚲' },
      { name: 'Busse', icon: '🚌' },
      { name: 'Fußgänger', icon: '🚶' },
    ],
    nRange: [30, 200],
  },
  {
    key: 'quiz',
    titleSentence: (n) => `Bei einem Schulquiz nahmen ${n} Teilnehmende teil und erhielten eine Bewertung.`,
    unitPlural: 'Teilnehmende',
    unitPluralGenitive: 'Teilnehmenden',
    categories: [
      { name: 'Note 1', icon: '🥇' },
      { name: 'Note 2', icon: '🥈' },
      { name: 'Note 3 oder schlechter', icon: '📄' },
    ],
    nRange: [30, 150],
  },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function splitInteger(total: number, parts: number): number[] {
  const result = Array(parts).fill(1);
  let remaining = total - parts;
  while (remaining > 0) {
    const idx = Math.floor(Math.random() * parts);
    result[idx]++;
    remaining--;
  }
  return shuffle(result);
}

function generateNiceDistribution(k: number, nRange: [number, number]): { counts: number[]; total: number } {
  const denominators = [4, 5, 10, 20, 25].filter((d) => d >= k);
  for (let attempt = 0; attempt < 40; attempt++) {
    const D = denominators[Math.floor(Math.random() * denominators.length)];
    const numerators = splitInteger(D, k);
    const minM = Math.ceil(nRange[0] / D);
    const maxM = Math.floor(nRange[1] / D);
    if (minM > maxM) continue;
    const m = minM + Math.floor(Math.random() * (maxM - minM + 1));
    const total = D * m;
    const counts = numerators.map((n) => n * m);
    return { counts, total };
  }
  const total = nRange[0];
  const base = Math.floor(total / k);
  const counts = Array(k).fill(base);
  counts[0] += total - base * k;
  return { counts, total };
}

// Sorgt dafür, dass bestimmte Kategorien (z.B. "fehlerhaft") realistischerweise nie die Mehrheit stellen.
function applyMinorityConstraint(counts: number[], minorityIndices?: number[]): number[] {
  if (!minorityIndices || minorityIndices.length === 0) return counts;
  const sorted = [...counts].sort((a, b) => b - a);
  const minoritySet = new Set(minorityIndices);
  const majorityIndices = counts.map((_, i) => i).filter((i) => !minoritySet.has(i));
  const majorityValues = sorted.slice(0, majorityIndices.length);
  const minorityValues = sorted.slice(majorityIndices.length);
  const result = new Array(counts.length);
  majorityIndices.forEach((idx, i) => {
    result[idx] = majorityValues[i];
  });
  minorityIndices.forEach((idx, i) => {
    result[idx] = minorityValues[i];
  });
  return result;
}

function joinList(items: string[]): string {
  if (items.length === 1) return items[0];
  return `${items.slice(0, -1).join(', ')} und ${items[items.length - 1]}`;
}

let taskCounter = 0;

export function generateTask(): GeneratedTask {
  taskCounter += 1;
  const topic = topics[Math.floor(Math.random() * topics.length)];
  const k = topic.categories.length;
  const { counts: rawCounts, total } = generateNiceDistribution(k, topic.nRange);
  const counts = applyMinorityConstraint(rawCounts, topic.minorityIndices);
  const categories: CategoryResult[] = topic.categories.map((c, i) => ({ ...c, count: counts[i], revealed: true }));

  const representationRoll = Math.random();
  const representation: Representation =
    representationRoll < 0.28 ? 'text' : representationRoll < 0.56 ? 'table' : representationRoll < 0.78 ? 'tally' : 'chart';
  const chartKind: ChartKind | undefined = representation === 'chart' ? (Math.random() < 0.5 ? 'bar' : 'pie') : undefined;

  // "reverseAbsolute" nur bei Text-Darstellung: nur eine Kategorie wird als Prozentangabe genannt.
  const canReverse = representation === 'text';
  const canHide = representation === 'text' && k >= 3;

  let hiddenIndex = -1;
  let questionKind: QuestionKind;

  if (canReverse && Math.random() < 0.3) {
    questionKind = 'reverseAbsolute';
  } else if (canHide && Math.random() < 0.45) {
    hiddenIndex = Math.floor(Math.random() * k);
    questionKind = 'missingAbsolute';
  } else {
    questionKind = Math.random() < 0.5 ? 'absolute' : 'relative';
  }

  categories.forEach((c, i) => {
    c.revealed = i !== hiddenIndex;
  });

  const intro: string[] = [];
  let targetCategoryName = '';
  let answerFormat: AnswerFormat = 'integer';
  let correctInteger: number | undefined;
  let correctPercent: number | undefined;
  let questionText = '';
  let solutionSteps: string[] = [];

  if (questionKind === 'reverseAbsolute') {
    const targetIndex = Math.floor(Math.random() * k);
    const target = categories[targetIndex];
    targetCategoryName = target.name;
    const percent = Math.round((target.count / total) * 100);
    correctInteger = target.count;
    answerFormat = 'integer';

    intro.push(topic.titleSentence(total));
    intro.push(`${percent} % davon entfielen auf „${target.name}“.`);
    questionText = `Wie viele ${topic.unitPlural} entfielen auf „${target.name}“?`;
    solutionSteps = [
      `Gegeben: ${percent} % von ${total} ${topic.unitPlural}.`,
      `${percent} % von ${total} = ${percent}/100 × ${total} = ${target.count}.`,
    ];
  } else if (questionKind === 'missingAbsolute') {
    const hidden = categories[hiddenIndex];
    targetCategoryName = hidden.name;
    correctInteger = hidden.count;
    answerFormat = 'integer';

    const revealedCats = categories.filter((_, i) => i !== hiddenIndex);
    const revealedPhrases = revealedCats.map((c) => `${c.count} auf „${c.name}“`);

    intro.push(topic.titleSentence(total));
    intro.push(`Davon entfielen ${joinList(revealedPhrases)}. Die übrigen entfielen auf „${hidden.name}“.`);
    questionText = `Wie viele ${topic.unitPlural} entfielen auf „${hidden.name}“?`;

    const sum = revealedCats.reduce((a, c) => a + c.count, 0);
    solutionSteps = [
      `Gesamtanzahl: ${total}.`,
      `Bekannte Anzahl: ${revealedCats.map((c) => c.count).join(' + ')} = ${sum}.`,
      `Absolute Häufigkeit von „${hidden.name}“ = ${total} − ${sum} = ${hidden.count}.`,
    ];
  } else {
    const targetIndex = Math.floor(Math.random() * k);
    const target = categories[targetIndex];
    targetCategoryName = target.name;

    if (representation === 'text') {
      const phrases = categories.map((c) => `${c.count} auf „${c.name}“`);
      intro.push(topic.titleSentence(total));
      intro.push(`Davon entfielen ${joinList(phrases)}.`);
    } else if (representation === 'table') {
      intro.push(topic.titleSentence(total));
      intro.push('Das Ergebnis zeigt folgende Tabelle:');
    } else if (representation === 'tally') {
      intro.push(topic.titleSentence(total));
      intro.push('Das Ergebnis wurde in einer Strichliste festgehalten:');
    } else {
      intro.push(topic.titleSentence(total));
      intro.push('Das Ergebnis zeigt folgendes Diagramm:');
    }

    if (questionKind === 'absolute') {
      answerFormat = 'integer';
      correctInteger = target.count;
      questionText = `Wie viele der ${topic.unitPluralGenitive ?? topic.unitPlural} entfallen auf „${target.name}“?`;
      solutionSteps = [
        'Die absolute Häufigkeit ist die direkt gezählte Anzahl.',
        `Absolute Häufigkeit von „${target.name}“ = ${target.count}.`,
      ];
    } else {
      answerFormat = 'percentOrDecimal';
      const percent = Math.round((target.count / total) * 100 * 100) / 100;
      correctPercent = percent;
      questionText = `Welcher Anteil aller ${topic.unitPluralGenitive ?? topic.unitPlural} entfällt auf „${target.name}“? Gib deine Antwort in Prozent oder als Dezimalzahl an.`;
      solutionSteps = [
        'Relative Häufigkeit = Absolute Häufigkeit ÷ Gesamtanzahl.',
        `${target.count} ÷ ${total} = ${(target.count / total)
          .toFixed(4)
          .replace(/0+$/, '')
          .replace(/\.$/, '')
          .replace('.', ',')} = ${percent} %.`,
      ];
    }
  }

  return {
    id: `haeuf-${Date.now()}-${taskCounter}`,
    topicKey: topic.key,
    representation,
    chartKind,
    intro,
    categories,
    total,
    unitPlural: topic.unitPlural,
    hiddenCategoryName: hiddenIndex >= 0 ? categories[hiddenIndex].name : undefined,
    questionKind,
    questionText,
    targetCategoryName,
    answerFormat,
    correctInteger,
    correctPercent,
    solutionSteps,
  };
}

export function parseIntegerAnswer(raw: string): number | null {
  const cleaned = raw.trim().replace(',', '.');
  if (!cleaned) return null;
  const value = parseFloat(cleaned);
  return isNaN(value) ? null : value;
}

export function parsePercentOrDecimalAnswer(raw: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const hasPercentSign = trimmed.includes('%');
  const cleaned = trimmed.replace('%', '').replace(',', '.').trim();
  const value = parseFloat(cleaned);
  if (isNaN(value)) return null;
  if (hasPercentSign) return value;
  if (value <= 1) return value * 100;
  return value;
}

export function checkAnswer(task: GeneratedTask, rawAnswer: string): boolean {
  if (task.answerFormat === 'integer') {
    const value = parseIntegerAnswer(rawAnswer);
    if (value === null || task.correctInteger === undefined) return false;
    return Math.abs(value - task.correctInteger) < 0.001;
  }
  const value = parsePercentOrDecimalAnswer(rawAnswer);
  if (value === null || task.correctPercent === undefined) return false;
  return Math.abs(value - task.correctPercent) <= 0.5;
}

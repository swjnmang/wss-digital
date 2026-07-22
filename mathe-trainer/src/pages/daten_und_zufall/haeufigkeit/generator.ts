// Generator für Aufgaben zu absoluter und relativer Häufigkeit.
// Die Fragetexte benennen den gesuchten Häufigkeitstyp nie explizit –
// das muss aus der Formulierung und den gegebenen Informationen erschlossen werden.

export type Representation = 'text' | 'table' | 'tally' | 'chart' | 'crosstab';
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

export interface CrosstabData {
  columnGroupLabel: string;
  rowLabels: string[];
  columnLabels: string[];
  matrix: number[][]; // matrix[row][col]
  columnTotals: number[];
  grandTotal: number;
  hiddenCell?: { row: number; col: number };
  highlightRow?: number;
  highlightCols?: number[];
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
  crosstab?: CrosstabData;
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

interface CrosstabTopic {
  key: string;
  intro: (total: number) => string;
  columnGroupLabel: string; // Singular, Nominativ: "Klasse", "Jahr", "Schulart"
  columnGroupLabelPlural: string; // Plural, Nominativ/Akkusativ: "Klassen", "Jahre"
  columnGroupLabelDativePlural?: string; // Plural, Dativ, nur falls abweichend (z.B. "Jahren")
  inPhrase: string; // vollständige Präposition + Artikel für Mitten-im-Satz-Bezug, z.B. "im Jahr", "in der Schulart"
  columns: string[];
  rows: string[];
  unitPlural: string;
  unitPluralGenitive?: string;
  cellRange: [number, number];
}

const crosstabTopics: CrosstabTopic[] = [
  {
    key: 'berufswunsch',
    intro: (total) =>
      `Eine Wirtschaftsschule befragte ${total} Abschlussschülerinnen und -schüler zu ihrem Berufswunsch nach dem Abschluss. Das Ergebnis ist nach Klassen aufgeschlüsselt.`,
    columnGroupLabel: 'Klasse',
    columnGroupLabelPlural: 'Klassen',
    inPhrase: 'in Klasse',
    columns: ['10a', '10b', '10c'],
    rows: ['Technische Ausbildung', 'Kaufmännische Ausbildung', 'Handwerkliche Ausbildung', 'Weiterführende Schule', 'Keine Ausbildung'],
    unitPlural: 'Schülerinnen und Schüler',
    cellRange: [1, 9],
  },
  {
    key: 'zukunftsplaene',
    intro: (total) => `Eine Wirtschaftsschule erfasste über mehrere Jahre die Zukunftspläne ihrer insgesamt ${total} Absolventinnen und Absolventen.`,
    columnGroupLabel: 'Jahr',
    columnGroupLabelPlural: 'Jahre',
    columnGroupLabelDativePlural: 'Jahren',
    inPhrase: 'im Jahr',
    columns: ['2020', '2021', '2022', '2023'],
    rows: ['Industrie', 'Büro', 'Bank', 'IT-Berufe', 'Weiterführende Schule'],
    unitPlural: 'Absolventinnen und Absolventen',
    cellRange: [4, 22],
  },
  {
    key: 'geraetenutzung',
    intro: (total) => `Bei einer Umfrage unter ${total} Schülerinnen und Schülern wurde erfragt, wie oft sie ihr Smartphone zum Spielen nutzen.`,
    columnGroupLabel: 'Schulart',
    columnGroupLabelPlural: 'Schularten',
    inPhrase: 'in der Schulart',
    columns: ['Wirtschaftsschule', 'Realschule', 'Gymnasium'],
    rows: ['täglich', 'oft', 'selten', 'nie'],
    unitPlural: 'Befragte',
    unitPluralGenitive: 'Befragten',
    cellRange: [15, 70],
  },
  {
    key: 'abschlussmotiv',
    intro: (total) =>
      `Die Abschlussklassen stimmten unter insgesamt ${total} Schülerinnen und Schülern darüber ab, welches Motiv auf ihr gemeinsames Abschluss-T-Shirt gedruckt werden soll.`,
    columnGroupLabel: 'Klasse',
    columnGroupLabelPlural: 'Klassen',
    inPhrase: 'in Klasse',
    columns: ['10A', '10B'],
    rows: ['Schullogo', 'Name der Schule', 'eigene Zeichnung', 'lustiger Spruch'],
    unitPlural: 'Schülerinnen und Schüler',
    cellRange: [2, 15],
  },
  {
    key: 'musikgeschmack',
    intro: (total) => `Bei einer Umfrage unter ${total} Jugendlichen wurde die Lieblingsmusikrichtung erfragt.`,
    columnGroupLabel: 'Altersgruppe',
    columnGroupLabelPlural: 'Altersgruppen',
    inPhrase: 'in der Altersgruppe',
    columns: ['12–14 Jahre', '15–16 Jahre', '17–19 Jahre'],
    rows: ['Pop', 'Hip-Hop', 'Rock', 'Klassik', 'Elektro'],
    unitPlural: 'Befragte',
    unitPluralGenitive: 'Befragten',
    cellRange: [5, 25],
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

function joinList(items: string[], conjunction: string = 'und'): string {
  if (items.length === 1) return items[0];
  return `${items.slice(0, -1).join(', ')} ${conjunction} ${items[items.length - 1]}`;
}

function pickSubsetIndices(size: number, count: number): number[] {
  const indices = shuffle(Array.from({ length: count }, (_, i) => i)).slice(0, size);
  return indices.sort((a, b) => a - b);
}

function generateCrosstabMatrix(rows: number, cols: number, cellRange: [number, number]): number[][] {
  const matrix: number[][] = [];
  for (let r = 0; r < rows; r++) {
    const row: number[] = [];
    for (let c = 0; c < cols; c++) {
      row.push(cellRange[0] + Math.floor(Math.random() * (cellRange[1] - cellRange[0] + 1)));
    }
    matrix.push(row);
  }
  return matrix;
}

function formatDecimalComma(value: number): string {
  return value
    .toFixed(4)
    .replace(/0+$/, '')
    .replace(/\.$/, '')
    .replace('.', ',');
}

function formatPercentComma(value: number): string {
  return value.toFixed(1).replace('.', ',');
}

// Kreuztabellen-Aufgaben: mehrdimensionale Häufigkeitstabelle (Kategorie × Gruppe) mit
// zusammengesetzten Bedingungen (z.B. "Klasse A oder C" summieren) – deutlich anspruchsvoller
// als das einfache Ablesen einer einzelnen Zahl.
function buildCrosstabTask(id: string): GeneratedTask {
  const topic = crosstabTopics[Math.floor(Math.random() * crosstabTopics.length)];
  const rows = topic.rows;
  const cols = topic.columns;
  const matrix = generateCrosstabMatrix(rows.length, cols.length, topic.cellRange);
  const columnTotals = cols.map((_, c) => matrix.reduce((sum, row) => sum + row[c], 0));
  const grandTotal = columnTotals.reduce((a, b) => a + b, 0);

  const canSubset = cols.length >= 3;
  const roll = Math.random();
  type CrosstabKind = 'cell' | 'rowSum' | 'colSubsetSum' | 'missingCell' | 'relativeCell' | 'relativeSubsetSum';
  let kind: CrosstabKind;
  if (canSubset) {
    kind =
      roll < 0.1
        ? 'cell'
        : roll < 0.3
        ? 'rowSum'
        : roll < 0.6
        ? 'colSubsetSum'
        : roll < 0.75
        ? 'missingCell'
        : roll < 0.85
        ? 'relativeCell'
        : 'relativeSubsetSum';
  } else {
    kind = roll < 0.15 ? 'cell' : roll < 0.4 ? 'rowSum' : roll < 0.65 ? 'missingCell' : roll < 0.85 ? 'relativeCell' : 'relativeSubsetSum';
  }

  const rowIdx = Math.floor(Math.random() * rows.length);
  const dativePlural = topic.columnGroupLabelDativePlural ?? topic.columnGroupLabelPlural;
  const unitGenitive = topic.unitPluralGenitive ?? topic.unitPlural;
  const colLabel = (c: number) => `${topic.columnGroupLabel} „${cols[c]}“`;

  let questionText = '';
  let answerFormat: AnswerFormat = 'integer';
  let correctInteger: number | undefined;
  let correctPercent: number | undefined;
  let solutionSteps: string[] = [];
  let hiddenCell: { row: number; col: number } | undefined;
  let highlightCols: number[] | undefined;
  let questionKind: QuestionKind = 'absolute';
  const targetCategoryName = rows[rowIdx];

  if (kind === 'cell') {
    const colIdx = Math.floor(Math.random() * cols.length);
    correctInteger = matrix[rowIdx][colIdx];
    questionText = `${colLabel(colIdx)}: Wie viele ${topic.unitPlural} entfallen auf „${rows[rowIdx]}“?`;
    solutionSteps = ['Die absolute Häufigkeit ist die direkt abgelesene Anzahl.', `Absolute Häufigkeit = ${correctInteger}.`];
    highlightCols = [colIdx];
  } else if (kind === 'rowSum') {
    correctInteger = matrix[rowIdx].reduce((a, b) => a + b, 0);
    questionText = `Wie viele ${topic.unitPlural} entschieden sich – über alle ${topic.columnGroupLabelPlural} hinweg – für „${rows[rowIdx]}“?`;
    solutionSteps = [`Summe über alle ${topic.columnGroupLabelPlural}: ${matrix[rowIdx].join(' + ')} = ${correctInteger}.`];
    highlightCols = cols.map((_, c) => c);
  } else if (kind === 'colSubsetSum') {
    const size = 2 + Math.floor(Math.random() * Math.max(1, cols.length - 2));
    const subset = pickSubsetIndices(Math.min(size, cols.length - 1), cols.length);
    correctInteger = subset.reduce((sum, c) => sum + matrix[rowIdx][c], 0);
    const subsetNames = subset.map((c) => `„${cols[c]}“`);
    questionText = `Wie viele ${topic.unitPlural} aus den ${dativePlural} ${joinList(subsetNames, 'oder')} entschieden sich für „${rows[rowIdx]}“?`;
    solutionSteps = [`${subset.map((c) => `${matrix[rowIdx][c]} (${cols[c]})`).join(' + ')} = ${correctInteger}.`];
    highlightCols = subset;
  } else if (kind === 'missingCell') {
    const colIdx = Math.floor(Math.random() * cols.length);
    const hiddenValue = matrix[rowIdx][colIdx];
    correctInteger = hiddenValue;
    hiddenCell = { row: rowIdx, col: colIdx };
    const otherRowsSum = columnTotals[colIdx] - hiddenValue;
    questionText = `${colLabel(colIdx)}: Wie viele ${topic.unitPlural} entfallen auf „${rows[rowIdx]}“?`;
    solutionSteps = [
      `Gesamtzahl in ${colLabel(colIdx)}: ${columnTotals[colIdx]}.`,
      `Bekannte übrige Zeilen in dieser Spalte zusammen: ${otherRowsSum}.`,
      `Absolute Häufigkeit von „${rows[rowIdx]}“ = ${columnTotals[colIdx]} − ${otherRowsSum} = ${hiddenValue}.`,
    ];
    highlightCols = [colIdx];
  } else if (kind === 'relativeCell') {
    const colIdx = Math.floor(Math.random() * cols.length);
    const value = matrix[rowIdx][colIdx];
    const percent = Math.round((value / grandTotal) * 1000) / 10;
    correctPercent = percent;
    answerFormat = 'percentOrDecimal';
    questionKind = 'relative';
    questionText = `Welcher Anteil aller ${unitGenitive} entfällt auf „${rows[rowIdx]}“ ${topic.inPhrase} „${cols[colIdx]}“? Gib deine Antwort in Prozent an (eine Nachkommastelle).`;
    solutionSteps = [
      'Relative Häufigkeit = Absolute Häufigkeit ÷ Gesamtanzahl.',
      `${value} ÷ ${grandTotal} = ${formatDecimalComma(value / grandTotal)} ≈ ${formatPercentComma(percent)} %.`,
    ];
    highlightCols = [colIdx];
  } else {
    const maxSize = canSubset ? cols.length : cols.length;
    const size = canSubset ? 2 + Math.floor(Math.random() * Math.max(1, maxSize - 1)) : cols.length;
    const subset = pickSubsetIndices(Math.min(size, cols.length), cols.length);
    const value = subset.reduce((sum, c) => sum + matrix[rowIdx][c], 0);
    const percent = Math.round((value / grandTotal) * 1000) / 10;
    correctPercent = percent;
    answerFormat = 'percentOrDecimal';
    questionKind = 'relative';
    const subsetNames = subset.map((c) => `„${cols[c]}“`);
    const scopePhrase =
      subset.length === cols.length
        ? `– über alle ${topic.columnGroupLabelPlural} hinweg –`
        : `aus den ${dativePlural} ${joinList(subsetNames, 'oder')}`;
    questionText = `Wie viel Prozent aller ${unitGenitive} entschieden sich ${scopePhrase} für „${rows[rowIdx]}“? Gib deine Antwort in Prozent an (eine Nachkommastelle).`;
    solutionSteps = [
      `${subset.map((c) => `${matrix[rowIdx][c]} (${cols[c]})`).join(' + ')} = ${value}.`,
      `${value} ÷ ${grandTotal} = ${formatDecimalComma(value / grandTotal)} ≈ ${formatPercentComma(percent)} %.`,
    ];
    highlightCols = subset;
  }

  return {
    id,
    topicKey: `crosstab-${topic.key}`,
    representation: 'crosstab',
    intro: [topic.intro(grandTotal)],
    categories: [],
    total: grandTotal,
    unitPlural: topic.unitPlural,
    questionKind,
    questionText,
    targetCategoryName,
    answerFormat,
    correctInteger,
    correctPercent,
    solutionSteps,
    crosstab: {
      columnGroupLabel: topic.columnGroupLabel,
      rowLabels: rows,
      columnLabels: cols,
      matrix,
      columnTotals,
      grandTotal,
      hiddenCell,
      highlightRow: rowIdx,
      highlightCols,
    },
  };
}

function buildSimpleTask(id: string): GeneratedTask {
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
        `${target.count} ÷ ${total} = ${formatDecimalComma(target.count / total)} = ${percent} %.`,
      ];
    }
  }

  return {
    id,
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

let taskCounter = 0;

export function generateTask(): GeneratedTask {
  taskCounter += 1;
  const id = `haeuf-${Date.now()}-${taskCounter}`;
  if (Math.random() < 0.45) {
    return buildCrosstabTask(id);
  }
  return buildSimpleTask(id);
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

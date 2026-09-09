import type { ExcelTask } from '../types';

interface Mitarbeiter {
  nr: number;
  anrede: string;
  titel?: string;
  vorname: string;
  nachname: string;
  alter: number;
  gehalt: number;
  impfstoff: string;
}

const MITARBEITER: Mitarbeiter[] = [
  { nr: 1098596, anrede: 'Herr', vorname: 'Philipp', nachname: 'Seidel', alter: 73, gehalt: 7000, impfstoff: 'Biontech' },
  { nr: 1195311, anrede: 'Herr', vorname: 'Marinus', nachname: 'Vogt', alter: 52, gehalt: 7000, impfstoff: 'AstraZeneca' },
  { nr: 1221222, anrede: 'Frau', vorname: 'Walburga', nachname: 'Schulz', alter: 35, gehalt: 7000, impfstoff: 'Moderna' },
  { nr: 1249649, anrede: 'Frau', vorname: 'Dorothea', nachname: 'Janssen', alter: 48, gehalt: 5000, impfstoff: 'J&J' },
  { nr: 1318879, anrede: 'Frau', vorname: 'Noemi', nachname: 'Kuhn', alter: 51, gehalt: 10000, impfstoff: 'Biontech' },
  { nr: 1329576, anrede: 'Frau', vorname: 'Hannelore', nachname: 'Nowak', alter: 46, gehalt: 5000, impfstoff: 'AstraZeneca' },
  { nr: 1339613, anrede: 'Frau', vorname: 'Sieglinde', nachname: 'Wolff', alter: 57, gehalt: 7000, impfstoff: 'Moderna' },
  { nr: 1377759, anrede: 'Frau', titel: 'Dr.', vorname: 'Martina', nachname: 'Jäger', alter: 48, gehalt: 7000, impfstoff: 'J&J' },
  { nr: 1380721, anrede: 'Herr', vorname: 'Maximilian', nachname: 'Martinez', alter: 60, gehalt: 5000, impfstoff: 'Biontech' },
  { nr: 1386478, anrede: 'Frau', vorname: 'Selin', nachname: 'Özlü', alter: 51, gehalt: 7000, impfstoff: 'AstraZeneca' },
  { nr: 1446187, anrede: 'Herr', vorname: 'Alexander', nachname: 'Schneider', alter: 46, gehalt: 5000, impfstoff: 'Moderna' },
  { nr: 1489945, anrede: 'Frau', vorname: 'Jill', nachname: 'Schlüter', alter: 51, gehalt: 13000, impfstoff: 'J&J' },
  { nr: 1515480, anrede: 'Herr', vorname: 'Melchior', nachname: 'Thomas', alter: 59, gehalt: 5000, impfstoff: 'Biontech' },
  { nr: 1635207, anrede: 'Frau', vorname: 'Bianca', nachname: 'Marx', alter: 51, gehalt: 13000, impfstoff: 'Moderna' },
  { nr: 1638351, anrede: 'Herr', vorname: 'Hubert', nachname: 'Jung', alter: 21, gehalt: 7000, impfstoff: 'J&J' },
  { nr: 1646243, anrede: 'Frau', vorname: 'Genoveva', nachname: 'Perez', alter: 24, gehalt: 5000, impfstoff: 'Biontech' },
  { nr: 1667085, anrede: 'Herr', vorname: 'Franz', nachname: 'Lehmann', alter: 82, gehalt: 6000, impfstoff: 'AstraZeneca' },
  { nr: 1672891, anrede: 'Frau', vorname: 'Fatma', nachname: 'Tuna', alter: 51, gehalt: 7000, impfstoff: 'Moderna' },
  { nr: 1679533, anrede: 'Herr', vorname: 'Christian', nachname: 'Schmitz', alter: 50, gehalt: 6000, impfstoff: 'J&J' },
  { nr: 1687490, anrede: 'Frau', vorname: 'Anastasia', nachname: 'Romano', alter: 25, gehalt: 5000, impfstoff: 'Biontech' },
  { nr: 1709533, anrede: 'Herr', vorname: 'Sascha', nachname: 'Hoppe', alter: 54, gehalt: 13000, impfstoff: 'AstraZeneca' },
  { nr: 1727443, anrede: 'Herr', vorname: 'Sandro', nachname: 'Wagner', alter: 51, gehalt: 7000, impfstoff: 'Moderna' },
  { nr: 1808704, anrede: 'Herr', vorname: 'Florian', nachname: 'Schulze', alter: 20, gehalt: 6000, impfstoff: 'J&J' },
  { nr: 1822733, anrede: 'Frau', vorname: 'Victoria', nachname: 'Russo', alter: 18, gehalt: 5000, impfstoff: 'Biontech' },
  { nr: 1835056, anrede: 'Frau', vorname: 'Maria', nachname: 'Stein', alter: 71, gehalt: 7000, impfstoff: 'AstraZeneca' },
  { nr: 1851969, anrede: 'Frau', vorname: 'Theresa', nachname: 'Schneider', alter: 32, gehalt: 7000, impfstoff: 'Moderna' },
  { nr: 1901021, anrede: 'Herr', vorname: 'Eduard', nachname: 'Hartmann', alter: 65, gehalt: 6000, impfstoff: 'J&J' },
  { nr: 1948503, anrede: 'Herr', vorname: 'Valentin', nachname: 'Weber', alter: 21, gehalt: 7000, impfstoff: 'Biontech' },
  { nr: 1979278, anrede: 'Herr', vorname: 'Thilo', nachname: 'Vogel', alter: 51, gehalt: 7000, impfstoff: 'AstraZeneca' },
  { nr: 2029305, anrede: 'Herr', vorname: 'Alois', nachname: 'Meyer', alter: 65, gehalt: 5000, impfstoff: 'Moderna' },
  { nr: 2042461, anrede: 'Frau', vorname: 'Tina', nachname: 'Kirchner', alter: 44, gehalt: 13000, impfstoff: 'J&J' },
  { nr: 2052716, anrede: 'Frau', vorname: 'Christina', nachname: 'Krüger', alter: 44, gehalt: 6000, impfstoff: 'Biontech' },
  { nr: 2065295, anrede: 'Herr', vorname: 'Mansur', nachname: 'Yilmaz', alter: 51, gehalt: 7000, impfstoff: 'AstraZeneca' },
  { nr: 2067842, anrede: 'Herr', titel: 'Dr.', vorname: 'Manfred', nachname: 'Winter', alter: 73, gehalt: 7000, impfstoff: 'Moderna' },
];

const FIRST_ROW = 4;
const LAST_ROW = FIRST_ROW + MITARBEITER.length - 1;

const seed: ExcelTask['seed'] = [
  { cell: 'B1', value: 'Corona Impfstatistik Übungsunternehmen GmbH', bold: true },
  { cell: 'M2', value: 'Bonus' },
  { cell: 'N2', value: 0.05, numberFormat: '0%' },
  { cell: 'B3', value: 'Mitarbeiter Nr', bold: true, border: true },
  { cell: 'C3', value: 'Anrede', bold: true, border: true },
  { cell: 'D3', value: 'Titel', bold: true, border: true },
  { cell: 'E3', value: 'Vorname', bold: true, border: true },
  { cell: 'F3', value: 'Nachname', bold: true, border: true },
  { cell: 'G3', value: 'Alter', bold: true, border: true },
  { cell: 'H3', value: 'monatliches Gehalt', bold: true, border: true },
  { cell: 'I3', value: 'Bonuszahlung', bold: true, border: true },
  { cell: 'J3', value: 'Impfstoff', bold: true, border: true },
];

MITARBEITER.forEach((m, i) => {
  const row = FIRST_ROW + i;
  seed.push(
    { cell: `B${row}`, value: m.nr, border: true },
    { cell: `C${row}`, value: m.anrede, border: true },
    { cell: `D${row}`, value: m.titel ?? '', border: true },
    { cell: `E${row}`, value: m.vorname, border: true },
    { cell: `F${row}`, value: m.nachname, border: true },
    { cell: `G${row}`, value: m.alter, border: true },
    { cell: `H${row}`, value: m.gehalt, border: true },
    { cell: `I${row}`, border: true },
    { cell: `J${row}`, value: m.impfstoff, border: true },
  );
});

const summaryStart = LAST_ROW + 2;

seed.push(
  { cell: `B${summaryStart}`, value: 'Auswertung der Corona Impfstatistiken', bold: true },
  { cell: `B${summaryStart + 1}`, value: 'Altersdurchschnitt' },
  { cell: `C${summaryStart + 1}`, numberFormat: '0 "Jahre"' },
  { cell: `B${summaryStart + 2}`, value: 'Maximale Bonuszahlung' },
  { cell: `C${summaryStart + 2}`, numberFormat: '#,##0.00 "€"' },
  { cell: `B${summaryStart + 3}`, value: 'Summe Bonuszahlungen' },
  { cell: `C${summaryStart + 3}`, numberFormat: '#,##0.00 "€"' },
);

export const impfstatistikTask: ExcelTask = {
  id: 'impfstatistik',
  title: 'Impfstatistik',
  difficulty: 'schwer',
  sheetName: 'Impfstatistik',
  instruction: [
    'Sie werten in der Personalabteilung die Corona-Impfstatistik Ihres Unternehmens aus.',
    '1. Berechnen Sie in Spalte I die Bonuszahlung (5 % des monatlichen Gehalts) in Abhängigkeit von Zelle N2.',
    '2. Bonuszahlungen ab mindestens 500,00 € sollen automatisch rot markiert werden (bedingte Formatierung).',
    `3. Berechnen Sie den Altersdurchschnitt, die maximale Bonuszahlung und die Summe der Bonuszahlungen (Zeilen ${summaryStart + 1}-${summaryStart + 3}).`,
    'Alle Euro-Beträge sollen als Währung mit zwei Nachkommastellen formatiert werden.',
    'Ändern Sie den Namen dieses Tabellenblatts in "Impfstatistiken".',
    'Aktivieren Sie den Filter für die Überschriften und zeigen Sie nur Mitarbeiter*innen an, die mit Biontech geimpft wurden.',
  ],
  hint: 'Bonuszahlung = monatliches Gehalt × $N$2. Für den Altersdurchschnitt MITTELWERT, für die maximale Bonuszahlung MAX, für die Summe SUMME verwenden.',
  seed,
  columnWidths: { B: 100, C: 70, D: 60, E: 100, F: 100, G: 60, H: 130, I: 120, J: 100 },
  checks: [
    {
      type: 'formulaRange',
      column: 'I',
      startRow: FIRST_ROW,
      endRow: LAST_ROW,
      label: 'Bonuszahlung (Spalte I)',
      expected: (row) => [`=H${row}*$N$2`, `=H${row}*N2`],
      feedback: {
        correct: '✅ Bonuszahlung korrekt berechnet.',
        wrong: '❌ Bonuszahlung = monatliches Gehalt × N2.',
      },
    },
    {
      type: 'conditionalFormatExists',
      label: 'Rote Hervorhebung ab 500 €',
      feedback: {
        correct: '✅ Bedingte Formatierung vorhanden.',
        wrong: '❌ Es wurde noch keine bedingte Formatierung für hohe Bonuszahlungen angelegt.',
      },
    },
    {
      type: 'formula',
      cell: `C${summaryStart + 1}`,
      label: 'Altersdurchschnitt',
      expected: [`=MITTELWERT(G${FIRST_ROW}:G${LAST_ROW})`],
      feedback: { correct: '✅ Korrekt.', wrong: `❌ Verwende =MITTELWERT(G${FIRST_ROW}:G${LAST_ROW}).` },
    },
    {
      type: 'formula',
      cell: `C${summaryStart + 2}`,
      label: 'Maximale Bonuszahlung',
      expected: [`=MAX(I${FIRST_ROW}:I${LAST_ROW})`],
      feedback: { correct: '✅ Korrekt.', wrong: `❌ Verwende =MAX(I${FIRST_ROW}:I${LAST_ROW}).` },
    },
    {
      type: 'formula',
      cell: `C${summaryStart + 3}`,
      label: 'Summe Bonuszahlungen',
      expected: [`=SUMME(I${FIRST_ROW}:I${LAST_ROW})`],
      feedback: { correct: '✅ Korrekt.', wrong: `❌ Verwende =SUMME(I${FIRST_ROW}:I${LAST_ROW}).` },
    },
    {
      type: 'numberFormatContains',
      cell: `H${FIRST_ROW}`,
      expectedSubstring: '€',
      label: 'Währungsformat (Gehalt)',
      feedback: { correct: '✅ Korrekt formatiert.', wrong: '❌ Formatiere die Gehaltsspalte als Währung mit 2 Nachkommastellen.' },
    },
    {
      type: 'sheetName',
      expectedName: 'Impfstatistiken',
      label: 'Tabellenblatt umbenannt',
      feedback: { correct: '✅ Blattname korrekt.', wrong: '❌ Benenne das Tabellenblatt in "Impfstatistiken" um.' },
    },
    {
      type: 'filterActive',
      label: 'Filter aktiviert',
      feedback: { correct: '✅ Filter ist aktiv.', wrong: '❌ Aktiviere den Filter und zeige nur Biontech-Geimpfte an.' },
    },
  ],
};

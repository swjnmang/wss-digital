import type { ExcelTask } from '../types';

const CURRENCY = '#,##0.00 "€"';

interface Artikel {
  name: string;
  bestand: number;
  mindestbestand: number;
  ekp: number;
}

const ARTIKEL: Artikel[] = [
  { name: 'Kugelschreiber', bestand: 120, mindestbestand: 50, ekp: 0.35 },
  { name: 'Bleistifte', bestand: 40, mindestbestand: 60, ekp: 0.2 },
  { name: 'Spitzer', bestand: 80, mindestbestand: 30, ekp: 0.45 },
  { name: 'Radiergummis', bestand: 25, mindestbestand: 40, ekp: 0.3 },
  { name: 'Collegeblöcke', bestand: 60, mindestbestand: 20, ekp: 1.8 },
  { name: 'Ordner', bestand: 15, mindestbestand: 25, ekp: 2.5 },
  { name: 'Textmarker', bestand: 90, mindestbestand: 40, ekp: 0.6 },
  { name: 'Tacker', bestand: 12, mindestbestand: 10, ekp: 4.9 },
  { name: 'Locher', bestand: 8, mindestbestand: 10, ekp: 5.2 },
  { name: 'Scheren', bestand: 35, mindestbestand: 20, ekp: 1.1 },
];

const FIRST_ROW = 4;
const LAST_ROW = FIRST_ROW + ARTIKEL.length - 1;
const SUMMARY_ROW = LAST_ROW + 2;

const seed: ExcelTask['seed'] = [
  { cell: 'A1', value: 'Lagerbestand Schreibwaren Meyer OHG', bold: true },
  { cell: 'A3', value: 'Artikel', bold: true, border: true },
  { cell: 'B3', value: 'Bestand', bold: true, border: true },
  { cell: 'C3', value: 'Mindestbestand', bold: true, border: true },
  { cell: 'D3', value: 'Einkaufspreis/Stück', bold: true, border: true },
  { cell: 'E3', value: 'Bestandswert', bold: true, border: true },
  { cell: 'F3', value: 'Nachbestellen?', bold: true, border: true },
];

ARTIKEL.forEach((a, i) => {
  const row = FIRST_ROW + i;
  seed.push(
    { cell: `A${row}`, value: a.name, border: true },
    { cell: `B${row}`, value: a.bestand, border: true },
    { cell: `C${row}`, value: a.mindestbestand, border: true },
    { cell: `D${row}`, value: a.ekp, border: true, numberFormat: CURRENCY },
    { cell: `E${row}`, border: true, numberFormat: CURRENCY },
    { cell: `F${row}`, border: true },
  );
});

seed.push(
  { cell: `A${SUMMARY_ROW}`, value: 'Kleinster Bestandswert', border: true },
  { cell: `E${SUMMARY_ROW}`, border: true, numberFormat: CURRENCY },
  { cell: `A${SUMMARY_ROW + 1}`, value: 'Größter Bestandswert', border: true },
  { cell: `E${SUMMARY_ROW + 1}`, border: true, numberFormat: CURRENCY },
  { cell: `A${SUMMARY_ROW + 2}`, value: 'Durchschnittlicher Bestandswert', border: true },
  { cell: `E${SUMMARY_ROW + 2}`, border: true, numberFormat: CURRENCY },
  { cell: `A${SUMMARY_ROW + 3}`, value: 'Gesamtwert des Lagers', bold: true, border: true },
  { cell: `E${SUMMARY_ROW + 3}`, border: true, numberFormat: CURRENCY },
);

export const lagerbestandTask: ExcelTask = {
  id: 'lagerbestand',
  title: 'Lagerbestand',
  difficulty: 'einfach',
  sheetName: 'Lagerbestand',
  instruction: [
    'Die Schreibwaren Meyer OHG möchte ihren Lagerbestand auswerten und prüfen, welche Artikel nachbestellt werden müssen.',
    '1. Berechnen Sie in Spalte E den Bestandswert jedes Artikels (Bestand × Einkaufspreis/Stück).',
    '2. Ermitteln Sie in Spalte F mit einer Wenn-Dann-Formel, ob nachbestellt werden muss: Liegt der Bestand unter dem Mindestbestand, soll "Ja" erscheinen, sonst "Nein".',
    '3. Heben Sie alle Artikel, die nachbestellt werden müssen, farblich hervor (bedingte Formatierung).',
    `4. Berechnen Sie den kleinsten, größten und durchschnittlichen Bestandswert sowie den Gesamtwert des Lagers (Zeilen ${SUMMARY_ROW}-${SUMMARY_ROW + 3}).`,
  ],
  hint: 'Bestandswert = Bestand × Einkaufspreis/Stück. Nachbestellen: =WENN(B4<C4,"Ja","Nein"). Für die Auswertung: MIN, MAX, MITTELWERT und SUMME auf den Bereich E4:E13 anwenden.',
  seed,
  columnWidths: { A: 150, B: 90, C: 130, D: 150, E: 120, F: 120 },
  checks: [
    {
      type: 'formulaRange',
      column: 'E',
      startRow: FIRST_ROW,
      endRow: LAST_ROW,
      label: 'Bestandswert (Spalte E)',
      expected: (row) => [`=B${row}*D${row}`, `=D${row}*B${row}`],
      feedback: {
        correct: '✅ Bestandswert korrekt berechnet.',
        wrong: '❌ Bestandswert = Bestand × Einkaufspreis/Stück.',
      },
    },
    {
      type: 'formulaRange',
      column: 'F',
      startRow: FIRST_ROW,
      endRow: LAST_ROW,
      label: 'Nachbestellen? (Spalte F)',
      expected: (row) => [`=WENN(B${row}<C${row},"Ja","Nein")`],
      feedback: {
        correct: '✅ Korrekt berechnet.',
        wrong: '❌ Nutze eine Wenn-Dann-Formel: Bestand < Mindestbestand → "Ja", sonst "Nein".',
      },
    },
    {
      type: 'conditionalFormatExists',
      label: 'Farbliche Hervorhebung der Nachbestellungen',
      feedback: { correct: '✅ Bedingte Formatierung vorhanden.', wrong: '❌ Hebe die Artikel mit "Ja" farblich hervor.' },
    },
    {
      type: 'formula',
      cell: `E${SUMMARY_ROW}`,
      label: 'Kleinster Bestandswert',
      expected: [`=MIN(E${FIRST_ROW}:E${LAST_ROW})`],
      feedback: { correct: '✅ Korrekt.', wrong: `❌ Verwende =MIN(E${FIRST_ROW}:E${LAST_ROW}).` },
    },
    {
      type: 'formula',
      cell: `E${SUMMARY_ROW + 1}`,
      label: 'Größter Bestandswert',
      expected: [`=MAX(E${FIRST_ROW}:E${LAST_ROW})`],
      feedback: { correct: '✅ Korrekt.', wrong: `❌ Verwende =MAX(E${FIRST_ROW}:E${LAST_ROW}).` },
    },
    {
      type: 'formula',
      cell: `E${SUMMARY_ROW + 2}`,
      label: 'Durchschnittlicher Bestandswert',
      expected: [`=MITTELWERT(E${FIRST_ROW}:E${LAST_ROW})`],
      feedback: { correct: '✅ Korrekt.', wrong: `❌ Verwende =MITTELWERT(E${FIRST_ROW}:E${LAST_ROW}).` },
    },
    {
      type: 'formula',
      cell: `E${SUMMARY_ROW + 3}`,
      label: 'Gesamtwert des Lagers',
      expected: [`=SUMME(E${FIRST_ROW}:E${LAST_ROW})`],
      feedback: { correct: '✅ Korrekt.', wrong: `❌ Verwende =SUMME(E${FIRST_ROW}:E${LAST_ROW}).` },
    },
  ],
};

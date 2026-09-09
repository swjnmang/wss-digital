import type { ExcelTask } from '../types';

const CURRENCY = '#,##0.00 "€"';

interface Buchung {
  tag: string;
  einnahmen: number;
  ausgaben: number;
}

const BUCHUNGEN: Buchung[] = [
  { tag: 'Montag', einnahmen: 180, ausgaben: 60 },
  { tag: 'Dienstag', einnahmen: 210, ausgaben: 340 },
  { tag: 'Mittwoch', einnahmen: 95, ausgaben: 40 },
  { tag: 'Donnerstag', einnahmen: 260, ausgaben: 70 },
  { tag: 'Freitag', einnahmen: 340, ausgaben: 120 },
  { tag: 'Samstag', einnahmen: 410, ausgaben: 90 },
  { tag: 'Sonntag', einnahmen: 0, ausgaben: 30 },
  { tag: 'Montag', einnahmen: 150, ausgaben: 380 },
  { tag: 'Dienstag', einnahmen: 190, ausgaben: 55 },
  { tag: 'Mittwoch', einnahmen: 220, ausgaben: 65 },
];

const FIRST_ROW = 4;
const LAST_ROW = FIRST_ROW + BUCHUNGEN.length - 1;
const SUMMARY_ROW = LAST_ROW + 2;

const seed: ExcelTask['seed'] = [
  { cell: 'A1', value: 'Kassenbuch Kiosk Übungsfirma', bold: true },
  { cell: 'D1', value: 'Anfangskapital' },
  { cell: 'E1', value: 500, numberFormat: CURRENCY },
  { cell: 'A3', value: 'Tag', bold: true, border: true },
  { cell: 'B3', value: 'Einnahmen', bold: true, border: true },
  { cell: 'C3', value: 'Ausgaben', bold: true, border: true },
  { cell: 'D3', value: 'Tagessaldo', bold: true, border: true },
  { cell: 'E3', value: 'Kontostand', bold: true, border: true },
];

BUCHUNGEN.forEach((b, i) => {
  const row = FIRST_ROW + i;
  seed.push(
    { cell: `A${row}`, value: b.tag, border: true },
    { cell: `B${row}`, value: b.einnahmen, border: true, numberFormat: CURRENCY },
    { cell: `C${row}`, value: b.ausgaben, border: true, numberFormat: CURRENCY },
    { cell: `D${row}`, border: true, numberFormat: CURRENCY },
    { cell: `E${row}`, border: true, numberFormat: CURRENCY },
  );
});

seed.push(
  { cell: `A${SUMMARY_ROW}`, value: 'Schlechtester Tagessaldo', border: true },
  { cell: `D${SUMMARY_ROW}`, border: true, numberFormat: CURRENCY },
  { cell: `A${SUMMARY_ROW + 1}`, value: 'Bester Tagessaldo', border: true },
  { cell: `D${SUMMARY_ROW + 1}`, border: true, numberFormat: CURRENCY },
  { cell: `A${SUMMARY_ROW + 2}`, value: 'Durchschnittlicher Tagessaldo', border: true },
  { cell: `D${SUMMARY_ROW + 2}`, border: true, numberFormat: CURRENCY },
  { cell: `A${SUMMARY_ROW + 3}`, value: 'Summe Einnahmen', bold: true, border: true },
  { cell: `B${SUMMARY_ROW + 3}`, border: true, numberFormat: CURRENCY },
  { cell: `A${SUMMARY_ROW + 4}`, value: 'Summe Ausgaben', bold: true, border: true },
  { cell: `C${SUMMARY_ROW + 4}`, border: true, numberFormat: CURRENCY },
);

export const kassenbuchTask: ExcelTask = {
  id: 'kassenbuch',
  title: 'Kassenbuch',
  difficulty: 'mittel',
  sheetName: 'Kassenbuch',
  instruction: [
    'Der Kiosk der Übungsfirma führt ein Kassenbuch über 10 Tage. Das Anfangskapital steht in Zelle E1.',
    '1. Berechnen Sie in Spalte D den Tagessaldo (Einnahmen − Ausgaben).',
    '2. Berechnen Sie in Spalte E den laufenden Kontostand: In der ersten Zeile ist das der Anfangskapital plus Tagessaldo, in jeder weiteren Zeile der vorherige Kontostand plus Tagessaldo.',
    '3. Heben Sie alle Tage mit negativem Kontostand farblich hervor (bedingte Formatierung).',
    `4. Berechnen Sie den schlechtesten, besten und durchschnittlichen Tagessaldo sowie die Summe aller Einnahmen und Ausgaben (Zeilen ${SUMMARY_ROW}-${SUMMARY_ROW + 4}).`,
  ],
  hint: 'Erste Zeile: Kontostand = $E$1+D4. Danach jeweils: Kontostand = vorherige Zeile (Kontostand) + aktueller Tagessaldo, z. B. =E4+D5.',
  seed,
  columnWidths: { A: 100, B: 110, C: 110, D: 110, E: 120 },
  checks: [
    {
      type: 'formulaRange',
      column: 'D',
      startRow: FIRST_ROW,
      endRow: LAST_ROW,
      label: 'Tagessaldo (Spalte D)',
      expected: (row) => [`=B${row}-C${row}`],
      feedback: { correct: '✅ Korrekt berechnet.', wrong: '❌ Tagessaldo = Einnahmen − Ausgaben.' },
    },
    {
      type: 'formula',
      cell: `E${FIRST_ROW}`,
      label: 'Kontostand erste Zeile',
      expected: [`=$E$1+D${FIRST_ROW}`, `=E1+D${FIRST_ROW}`],
      feedback: { correct: '✅ Korrekt berechnet.', wrong: '❌ In der ersten Zeile: Kontostand = Anfangskapital (E1) + Tagessaldo.' },
    },
    {
      type: 'formulaRange',
      column: 'E',
      startRow: FIRST_ROW + 1,
      endRow: LAST_ROW,
      label: 'Kontostand (Spalte E, ab Zeile 2)',
      expected: (row) => [`=E${row - 1}+D${row}`],
      feedback: {
        correct: '✅ Korrekt berechnet.',
        wrong: '❌ Der Kontostand ergibt sich aus dem Kontostand der Vorzeile plus dem aktuellen Tagessaldo.',
      },
    },
    {
      type: 'conditionalFormatExists',
      label: 'Hervorhebung bei negativem Kontostand',
      feedback: { correct: '✅ Bedingte Formatierung vorhanden.', wrong: '❌ Hebe Tage mit negativem Kontostand farblich hervor.' },
    },
    {
      type: 'formula',
      cell: `D${SUMMARY_ROW}`,
      label: 'Schlechtester Tagessaldo',
      expected: [`=MIN(D${FIRST_ROW}:D${LAST_ROW})`],
      feedback: { correct: '✅ Korrekt.', wrong: `❌ Verwende =MIN(D${FIRST_ROW}:D${LAST_ROW}).` },
    },
    {
      type: 'formula',
      cell: `D${SUMMARY_ROW + 1}`,
      label: 'Bester Tagessaldo',
      expected: [`=MAX(D${FIRST_ROW}:D${LAST_ROW})`],
      feedback: { correct: '✅ Korrekt.', wrong: `❌ Verwende =MAX(D${FIRST_ROW}:D${LAST_ROW}).` },
    },
    {
      type: 'formula',
      cell: `D${SUMMARY_ROW + 2}`,
      label: 'Durchschnittlicher Tagessaldo',
      expected: [`=MITTELWERT(D${FIRST_ROW}:D${LAST_ROW})`],
      feedback: { correct: '✅ Korrekt.', wrong: `❌ Verwende =MITTELWERT(D${FIRST_ROW}:D${LAST_ROW}).` },
    },
    {
      type: 'formula',
      cell: `B${SUMMARY_ROW + 3}`,
      label: 'Summe Einnahmen',
      expected: [`=SUMME(B${FIRST_ROW}:B${LAST_ROW})`],
      feedback: { correct: '✅ Korrekt.', wrong: `❌ Verwende =SUMME(B${FIRST_ROW}:B${LAST_ROW}).` },
    },
    {
      type: 'formula',
      cell: `C${SUMMARY_ROW + 4}`,
      label: 'Summe Ausgaben',
      expected: [`=SUMME(C${FIRST_ROW}:C${LAST_ROW})`],
      feedback: { correct: '✅ Korrekt.', wrong: `❌ Verwende =SUMME(C${FIRST_ROW}:C${LAST_ROW}).` },
    },
  ],
};

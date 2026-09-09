import type { ExcelTask } from '../types';

const CURRENCY = '#,##0.00 "€"';

interface Produktgruppe {
  name: string;
  tage: number[]; // Mo-So
  ziel: number;
}

const PRODUKTGRUPPEN: Produktgruppe[] = [
  { name: 'Laufschuhe', tage: [420, 380, 290, 410, 650, 720, 340], ziel: 3000 },
  { name: 'Fitnessgeräte', tage: [180, 150, 200, 170, 300, 410, 90], ziel: 1800 },
  { name: 'Sportbekleidung', tage: [350, 300, 280, 320, 480, 600, 250], ziel: 2500 },
  { name: 'Fahrräder', tage: [900, 0, 0, 1200, 600, 1800, 0], ziel: 4000 },
  { name: 'Schwimmzubehör', tage: [60, 50, 40, 55, 90, 150, 200], ziel: 800 },
  { name: 'Wintersport', tage: [50, 40, 30, 45, 80, 300, 600], ziel: 1000 },
];

const DAY_COLS = ['B', 'C', 'D', 'E', 'F', 'G', 'H'];
const FIRST_ROW = 4;
const LAST_ROW = FIRST_ROW + PRODUKTGRUPPEN.length - 1;
const SUMMARY_ROW = LAST_ROW + 2;

const seed: ExcelTask['seed'] = [
  { cell: 'A1', value: 'Wochenverkaufsstatistik Sport Aktiv GmbH', bold: true },
  { cell: 'A3', value: 'Produktgruppe', bold: true, border: true },
  { cell: 'B3', value: 'Mo', bold: true, border: true },
  { cell: 'C3', value: 'Di', bold: true, border: true },
  { cell: 'D3', value: 'Mi', bold: true, border: true },
  { cell: 'E3', value: 'Do', bold: true, border: true },
  { cell: 'F3', value: 'Fr', bold: true, border: true },
  { cell: 'G3', value: 'Sa', bold: true, border: true },
  { cell: 'H3', value: 'So', bold: true, border: true },
  { cell: 'I3', value: 'Wochenumsatz', bold: true, border: true },
  { cell: 'J3', value: 'Tagesdurchschnitt', bold: true, border: true },
  { cell: 'K3', value: 'Wochenziel', bold: true, border: true },
  { cell: 'L3', value: 'Zielerreichung', bold: true, border: true },
];

PRODUKTGRUPPEN.forEach((p, i) => {
  const row = FIRST_ROW + i;
  seed.push({ cell: `A${row}`, value: p.name, border: true });
  p.tage.forEach((v, dayIdx) => {
    seed.push({ cell: `${DAY_COLS[dayIdx]}${row}`, value: v, border: true, numberFormat: CURRENCY });
  });
  seed.push(
    { cell: `I${row}`, border: true, numberFormat: CURRENCY },
    { cell: `J${row}`, border: true, numberFormat: CURRENCY },
    { cell: `K${row}`, value: p.ziel, border: true, numberFormat: CURRENCY },
    { cell: `L${row}`, border: true },
  );
});

seed.push(
  { cell: `A${SUMMARY_ROW}`, value: 'Umsatzschwächste Produktgruppe (Wochenumsatz)', border: true },
  { cell: `I${SUMMARY_ROW}`, border: true, numberFormat: CURRENCY },
  { cell: `A${SUMMARY_ROW + 1}`, value: 'Umsatzstärkste Produktgruppe (Wochenumsatz)', border: true },
  { cell: `I${SUMMARY_ROW + 1}`, border: true, numberFormat: CURRENCY },
  { cell: `A${SUMMARY_ROW + 2}`, value: 'Durchschnittlicher Wochenumsatz', border: true },
  { cell: `I${SUMMARY_ROW + 2}`, border: true, numberFormat: CURRENCY },
  { cell: `A${SUMMARY_ROW + 3}`, value: 'Gesamtumsatz aller Produktgruppen', bold: true, border: true },
  { cell: `I${SUMMARY_ROW + 3}`, border: true, numberFormat: CURRENCY },
);

export const verkaufsstatistikTask: ExcelTask = {
  id: 'verkaufsstatistik',
  title: 'Verkaufsstatistik',
  difficulty: 'schwer',
  sheetName: 'Verkaufsstatistik',
  instruction: [
    'Die Sport Aktiv GmbH wertet die Verkaufszahlen der letzten Woche je Produktgruppe aus.',
    '1. Berechnen Sie in Spalte I den Wochenumsatz jeder Produktgruppe mit der Summen-Formel.',
    '2. Berechnen Sie in Spalte J den durchschnittlichen Tagesumsatz jeder Produktgruppe.',
    '3. Ermitteln Sie in Spalte L mit einer Wenn-Dann-Formel, ob das Wochenziel (Spalte K) erreicht wurde: "erreicht" oder "verfehlt".',
    '4. Heben Sie "erreicht" grün und "verfehlt" rot hervor (bedingte Formatierung).',
    '5. Sortieren Sie die Produktgruppen nach Wochenumsatz absteigend (umsatzstärkste zuerst).',
    `6. Berechnen Sie die umsatzschwächste und umsatzstärkste Produktgruppe, den durchschnittlichen Wochenumsatz sowie den Gesamtumsatz (Zeilen ${SUMMARY_ROW}-${SUMMARY_ROW + 3}).`,
  ],
  hint: 'Wochenumsatz: =SUMME(B4:H4). Tagesdurchschnitt: =MITTELWERT(B4:H4). Zielerreichung: =WENN(I4>=K4,"erreicht","verfehlt").',
  seed,
  columnWidths: { A: 140, B: 80, C: 80, D: 80, E: 80, F: 80, G: 80, H: 80, I: 120, J: 130, K: 110, L: 120 },
  checks: [
    {
      type: 'formulaRange',
      column: 'I',
      startRow: FIRST_ROW,
      endRow: LAST_ROW,
      label: 'Wochenumsatz (Spalte I)',
      expected: (row) => [`=SUMME(B${row}:H${row})`],
      feedback: { correct: '✅ Korrekt berechnet.', wrong: '❌ Nutze die SUMME-Formel über Mo bis So.' },
    },
    {
      type: 'formulaRange',
      column: 'J',
      startRow: FIRST_ROW,
      endRow: LAST_ROW,
      label: 'Tagesdurchschnitt (Spalte J)',
      expected: (row) => [`=MITTELWERT(B${row}:H${row})`],
      feedback: { correct: '✅ Korrekt berechnet.', wrong: '❌ Nutze die MITTELWERT-Formel über Mo bis So.' },
    },
    {
      type: 'formulaRange',
      column: 'L',
      startRow: FIRST_ROW,
      endRow: LAST_ROW,
      label: 'Zielerreichung (Spalte L)',
      expected: (row) => [`=WENN(I${row}>=K${row},"erreicht","verfehlt")`],
      feedback: { correct: '✅ Korrekt berechnet.', wrong: '❌ Wenn Wochenumsatz ≥ Wochenziel → "erreicht", sonst "verfehlt".' },
    },
    {
      type: 'conditionalFormatExists',
      label: 'Farbliche Hervorhebung der Zielerreichung',
      feedback: { correct: '✅ Bedingte Formatierung vorhanden.', wrong: '❌ Hebe "erreicht" grün und "verfehlt" rot hervor.' },
    },
    {
      type: 'sortedByColumn',
      range: `I${FIRST_ROW}:I${LAST_ROW}`,
      columnOffset: 0,
      direction: 'desc',
      numeric: true,
      label: 'Sortierung nach Wochenumsatz (absteigend)',
      feedback: { correct: '✅ Korrekt sortiert.', wrong: '❌ Sortiere die Produktgruppen nach Wochenumsatz absteigend.' },
    },
    {
      type: 'formula',
      cell: `I${SUMMARY_ROW}`,
      label: 'Umsatzschwächste Produktgruppe',
      expected: [`=MIN(I${FIRST_ROW}:I${LAST_ROW})`],
      feedback: { correct: '✅ Korrekt.', wrong: `❌ Verwende =MIN(I${FIRST_ROW}:I${LAST_ROW}).` },
    },
    {
      type: 'formula',
      cell: `I${SUMMARY_ROW + 1}`,
      label: 'Umsatzstärkste Produktgruppe',
      expected: [`=MAX(I${FIRST_ROW}:I${LAST_ROW})`],
      feedback: { correct: '✅ Korrekt.', wrong: `❌ Verwende =MAX(I${FIRST_ROW}:I${LAST_ROW}).` },
    },
    {
      type: 'formula',
      cell: `I${SUMMARY_ROW + 2}`,
      label: 'Durchschnittlicher Wochenumsatz',
      expected: [`=MITTELWERT(I${FIRST_ROW}:I${LAST_ROW})`],
      feedback: { correct: '✅ Korrekt.', wrong: `❌ Verwende =MITTELWERT(I${FIRST_ROW}:I${LAST_ROW}).` },
    },
    {
      type: 'formula',
      cell: `I${SUMMARY_ROW + 3}`,
      label: 'Gesamtumsatz aller Produktgruppen',
      expected: [`=SUMME(I${FIRST_ROW}:I${LAST_ROW})`],
      feedback: { correct: '✅ Korrekt.', wrong: `❌ Verwende =SUMME(I${FIRST_ROW}:I${LAST_ROW}).` },
    },
  ],
};

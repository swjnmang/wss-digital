import type { ExcelTask } from '../types';

const CURRENCY = '#,##0.00 "€"';

interface Reise {
  name: string;
  km: number;
  uebernachtungen: number;
  verpflegungstage: number;
}

const REISEN: Reise[] = [
  { name: 'Meier', km: 850, uebernachtungen: 2, verpflegungstage: 3 },
  { name: 'Schulz', km: 1200, uebernachtungen: 3, verpflegungstage: 4 },
  { name: 'Fischer', km: 400, uebernachtungen: 1, verpflegungstage: 2 },
  { name: 'Wagner', km: 2100, uebernachtungen: 4, verpflegungstage: 5 },
  { name: 'Becker', km: 300, uebernachtungen: 0, verpflegungstage: 1 },
  { name: 'Hoffmann', km: 950, uebernachtungen: 2, verpflegungstage: 3 },
  { name: 'Schröder', km: 1600, uebernachtungen: 3, verpflegungstage: 4 },
  { name: 'Neumann', km: 500, uebernachtungen: 1, verpflegungstage: 2 },
];

const FIRST_ROW = 6;
const LAST_ROW = FIRST_ROW + REISEN.length - 1;
const SUMMARY_ROW = LAST_ROW + 2;

const seed: ExcelTask['seed'] = [
  { cell: 'A1', value: 'Reisekostenabrechnung Außendienst', bold: true },
  { cell: 'A3', value: 'Kilometerpauschale', border: true },
  { cell: 'B3', value: 0.3, border: true, numberFormat: CURRENCY },
  { cell: 'A4', value: 'Übernachtungspauschale', border: true },
  { cell: 'B4', value: 95, border: true, numberFormat: CURRENCY },
  { cell: 'C4', value: 'Verpflegungspauschale/Tag', border: true },
  { cell: 'D4', value: 28, border: true, numberFormat: CURRENCY },
  { cell: 'A5', value: 'Mitarbeiter', bold: true, border: true },
  { cell: 'B5', value: 'Gefahrene km', bold: true, border: true },
  { cell: 'C5', value: 'Übernachtungen', bold: true, border: true },
  { cell: 'D5', value: 'Verpflegungstage', bold: true, border: true },
  { cell: 'E5', value: 'Kilometererstattung', bold: true, border: true },
  { cell: 'F5', value: 'Übernachtungskosten', bold: true, border: true },
  { cell: 'G5', value: 'Verpflegung', bold: true, border: true },
  { cell: 'H5', value: 'Gesamterstattung', bold: true, border: true },
  { cell: 'I5', value: 'Genehmigung nötig?', bold: true, border: true },
];

REISEN.forEach((r, i) => {
  const row = FIRST_ROW + i;
  seed.push(
    { cell: `A${row}`, value: r.name, border: true },
    { cell: `B${row}`, value: r.km, border: true },
    { cell: `C${row}`, value: r.uebernachtungen, border: true },
    { cell: `D${row}`, value: r.verpflegungstage, border: true },
    { cell: `E${row}`, border: true, numberFormat: CURRENCY },
    { cell: `F${row}`, border: true, numberFormat: CURRENCY },
    { cell: `G${row}`, border: true, numberFormat: CURRENCY },
    { cell: `H${row}`, border: true, numberFormat: CURRENCY },
    { cell: `I${row}`, border: true },
  );
});

seed.push(
  { cell: `A${SUMMARY_ROW}`, value: 'Niedrigste Erstattung', border: true },
  { cell: `H${SUMMARY_ROW}`, border: true, numberFormat: CURRENCY },
  { cell: `A${SUMMARY_ROW + 1}`, value: 'Höchste Erstattung', border: true },
  { cell: `H${SUMMARY_ROW + 1}`, border: true, numberFormat: CURRENCY },
  { cell: `A${SUMMARY_ROW + 2}`, value: 'Durchschnittliche Erstattung', border: true },
  { cell: `H${SUMMARY_ROW + 2}`, border: true, numberFormat: CURRENCY },
  { cell: `A${SUMMARY_ROW + 3}`, value: 'Gesamtkosten aller Reisen', bold: true, border: true },
  { cell: `H${SUMMARY_ROW + 3}`, border: true, numberFormat: CURRENCY },
);

export const reisekostenTask: ExcelTask = {
  id: 'reisekosten',
  title: 'Reisekostenabrechnung',
  difficulty: 'mittel',
  sheetName: 'Reisekosten',
  instruction: [
    'Die Reisekostenstelle möchte die Reisekosten des Außendienstes für den letzten Monat auswerten.',
    '1. Berechnen Sie in Spalte E die Kilometererstattung (gefahrene km × Kilometerpauschale in B3).',
    '2. Berechnen Sie in Spalte F die Übernachtungskosten (Übernachtungen × Übernachtungspauschale in B4).',
    '3. Berechnen Sie in Spalte G die Verpflegungskosten (Verpflegungstage × Verpflegungspauschale in D4).',
    '4. Berechnen Sie in Spalte H die Gesamterstattung mit der Summen-Formel.',
    '5. Ermitteln Sie in Spalte I mit einer Wenn-Dann-Formel, ob die Reisekosten von der Geschäftsleitung genehmigt werden müssen: Bei einer Gesamterstattung über 1.000,00 € soll "Ja" erscheinen, sonst "Nein".',
    `6. Berechnen Sie die niedrigste, höchste und durchschnittliche Erstattung sowie die Gesamtkosten aller Reisen (Zeilen ${SUMMARY_ROW}-${SUMMARY_ROW + 3}).`,
  ],
  hint: 'Nutze bei den Pauschalen immer den $-Bezug (z. B. =B6*$B$3), damit du die Formel nach unten ziehen kannst. Gesamterstattung: =SUMME(E6:G6).',
  seed,
  columnWidths: { A: 100, B: 100, C: 110, D: 110, E: 130, F: 140, G: 100, H: 130, I: 120 },
  checks: [
    {
      type: 'formulaRange',
      column: 'E',
      startRow: FIRST_ROW,
      endRow: LAST_ROW,
      label: 'Kilometererstattung (Spalte E)',
      expected: (row) => [`=B${row}*$B$3`, `=B${row}*B3`],
      feedback: { correct: '✅ Korrekt berechnet.', wrong: '❌ Kilometererstattung = gefahrene km × Kilometerpauschale (B3).' },
    },
    {
      type: 'formulaRange',
      column: 'F',
      startRow: FIRST_ROW,
      endRow: LAST_ROW,
      label: 'Übernachtungskosten (Spalte F)',
      expected: (row) => [`=C${row}*$B$4`, `=C${row}*B4`],
      feedback: { correct: '✅ Korrekt berechnet.', wrong: '❌ Übernachtungskosten = Übernachtungen × Übernachtungspauschale (B4).' },
    },
    {
      type: 'formulaRange',
      column: 'G',
      startRow: FIRST_ROW,
      endRow: LAST_ROW,
      label: 'Verpflegungskosten (Spalte G)',
      expected: (row) => [`=D${row}*$D$4`, `=D${row}*D4`],
      feedback: { correct: '✅ Korrekt berechnet.', wrong: '❌ Verpflegungskosten = Verpflegungstage × Verpflegungspauschale (D4).' },
    },
    {
      type: 'formulaRange',
      column: 'H',
      startRow: FIRST_ROW,
      endRow: LAST_ROW,
      label: 'Gesamterstattung (Spalte H)',
      expected: (row) => [`=SUMME(E${row}:G${row})`, `=E${row}+F${row}+G${row}`],
      feedback: { correct: '✅ Korrekt berechnet.', wrong: '❌ Nutze die SUMME-Formel über Kilometererstattung, Übernachtung und Verpflegung.' },
    },
    {
      type: 'formulaRange',
      column: 'I',
      startRow: FIRST_ROW,
      endRow: LAST_ROW,
      label: 'Genehmigung nötig? (Spalte I)',
      expected: (row) => [`=WENN(H${row}>1000,"Ja","Nein")`],
      feedback: { correct: '✅ Korrekt berechnet.', wrong: '❌ Nutze eine Wenn-Dann-Formel: Gesamterstattung > 1000 € → "Ja", sonst "Nein".' },
    },
    {
      type: 'formula',
      cell: `H${SUMMARY_ROW}`,
      label: 'Niedrigste Erstattung',
      expected: [`=MIN(H${FIRST_ROW}:H${LAST_ROW})`],
      feedback: { correct: '✅ Korrekt.', wrong: `❌ Verwende =MIN(H${FIRST_ROW}:H${LAST_ROW}).` },
    },
    {
      type: 'formula',
      cell: `H${SUMMARY_ROW + 1}`,
      label: 'Höchste Erstattung',
      expected: [`=MAX(H${FIRST_ROW}:H${LAST_ROW})`],
      feedback: { correct: '✅ Korrekt.', wrong: `❌ Verwende =MAX(H${FIRST_ROW}:H${LAST_ROW}).` },
    },
    {
      type: 'formula',
      cell: `H${SUMMARY_ROW + 2}`,
      label: 'Durchschnittliche Erstattung',
      expected: [`=MITTELWERT(H${FIRST_ROW}:H${LAST_ROW})`],
      feedback: { correct: '✅ Korrekt.', wrong: `❌ Verwende =MITTELWERT(H${FIRST_ROW}:H${LAST_ROW}).` },
    },
    {
      type: 'formula',
      cell: `H${SUMMARY_ROW + 3}`,
      label: 'Gesamtkosten aller Reisen',
      expected: [`=SUMME(H${FIRST_ROW}:H${LAST_ROW})`],
      feedback: { correct: '✅ Korrekt.', wrong: `❌ Verwende =SUMME(H${FIRST_ROW}:H${LAST_ROW}).` },
    },
  ],
};

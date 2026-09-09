import type { ExcelTask } from '../types';

const ITEMS: Array<{ row: number; name: string; price: number; count: number }> = [
  { row: 6, name: 'Bürostuhl "Besta"', price: 199, count: 10 },
  { row: 7, name: 'Schreibtisch "Nitorp"', price: 249, count: 7 },
  { row: 8, name: 'Schreibtischlampe "Finn"', price: 29, count: 8 },
  { row: 9, name: 'Taschenrechner "Kalki"', price: 39.99, count: 20 },
  { row: 10, name: 'Aktenschrank "Mika"', price: 1189, count: 1 },
  { row: 11, name: 'Stiftehalter "Woody"', price: 9.99, count: 8 },
  { row: 12, name: 'Ablagefach "Ordning"', price: 4.99, count: 50 },
];

const CURRENCY_FORMAT = '#,##0.00 "€"';

const seed: ExcelTask['seed'] = [
  { cell: 'A1', value: 'Büromöbel', bold: true },
  { cell: 'A3', value: 'Kostenaufstellung Büromöbel', bold: true, border: true },
  { cell: 'H3', value: 'Mehrwertsteuer', border: true },
  { cell: 'A5', value: 'Möbelstück', border: true },
  { cell: 'B5', value: 'Einzelpreis', border: true },
  { cell: 'C5', value: 'Anzahl', border: true },
  { cell: 'D5', value: 'Gesamtpreis netto', border: true },
  { cell: 'E5', value: 'Mehrwertsteuer', border: true },
  { cell: 'F5', value: 'Gesamtpreis brutto', border: true },
  { cell: 'H4', value: 0.19, border: true, numberFormat: '0%' },
  { cell: 'C13', value: 'Summe:', bold: true, border: true },
];

for (const item of ITEMS) {
  seed.push(
    { cell: `A${item.row}`, value: item.name, border: true },
    { cell: `B${item.row}`, value: item.price, border: true, numberFormat: CURRENCY_FORMAT },
    { cell: `C${item.row}`, value: item.count, border: true },
    { cell: `D${item.row}`, border: true, numberFormat: CURRENCY_FORMAT },
    { cell: `E${item.row}`, border: true, numberFormat: CURRENCY_FORMAT },
    { cell: `F${item.row}`, border: true, numberFormat: CURRENCY_FORMAT },
  );
}

export const bueromoebelTask: ExcelTask = {
  id: 'bueromoebel',
  title: 'Büromöbel',
  difficulty: 'einfach',
  sheetName: 'Büromöbel',
  instruction: [
    'Sie sollen für Ihren Arbeitgeber eine Zusammenstellung aller gekauften Möbelstücke für das neu eingerichtete Büro auflisten und jeweils die Mehrwertsteuer angeben.',
    '1. Berechnen Sie den Gesamtpreis (netto) jeder Position in Spalte D.',
    '2. Berechnen Sie die Mehrwertsteuer jeder Position in Spalte E in Abhängigkeit von Zelle H4.',
    '3. Berechnen Sie den Gesamtpreis (brutto) jeder Position in Spalte F.',
    '4. Berechnen Sie die Summe in Zelle D13.',
    '5. Verändern Sie den Mehrwertsteuersatz in Zelle H4 auf 7 %.',
  ],
  hint: 'Gesamtpreis netto = Einzelpreis × Anzahl. Verweise beim Mehrwertsteuersatz immer auf H4, damit du die Formel einfach nach unten ziehen kannst. Falls das Ausfüllen per Ziehen des kleinen Quadrats nicht zuverlässig funktioniert: Bereich markieren und Strg+D drücken.',
  seed,
  columnWidths: { A: 180, B: 90, C: 70, D: 130, E: 110, F: 130, H: 110 },
  checks: [
    {
      type: 'formulaRange',
      column: 'D',
      startRow: 6,
      endRow: 12,
      label: 'Gesamtpreis netto (Spalte D)',
      expected: (row) => `=B${row}*C${row}`,
      feedback: {
        correct: '✅ Gesamtpreis netto korrekt berechnet.',
        wrong: '❌ Gesamtpreis netto (=Einzelpreis × Anzahl) ist nicht in jeder Zeile korrekt.',
        hint: 'Verwende z. B. =B6*C6 und ziehe die Formel bis Zeile 12 herunter.',
      },
    },
    {
      type: 'formulaRange',
      column: 'E',
      startRow: 6,
      endRow: 12,
      label: 'Mehrwertsteuer (Spalte E)',
      expected: (row) => [`=D${row}*$H$4`, `=D${row}*H4`],
      feedback: {
        correct: '✅ Mehrwertsteuer korrekt berechnet.',
        wrong: '❌ Die Mehrwertsteuer muss vom Gesamtpreis netto abhängig von Zelle H4 berechnet werden.',
        hint: 'Verwende z. B. =D6*$H$4 (mit $-Zeichen, damit der Bezug auf H4 beim Herunterziehen erhalten bleibt).',
      },
    },
    {
      type: 'formulaRange',
      column: 'F',
      startRow: 6,
      endRow: 12,
      label: 'Gesamtpreis brutto (Spalte F)',
      expected: (row) => [`=D${row}+E${row}`, `=D${row}*(1+$H$4)`, `=D${row}*(1+H4)`],
      feedback: {
        correct: '✅ Gesamtpreis brutto korrekt berechnet.',
        wrong: '❌ Gesamtpreis brutto (netto + Mehrwertsteuer) ist nicht in jeder Zeile korrekt.',
        hint: 'Verwende z. B. =D6+E6.',
      },
    },
    {
      type: 'formula',
      cell: 'D13',
      label: 'Summe (D13)',
      expected: '=SUMME(D6:D12)',
      feedback: {
        correct: '✅ Summe korrekt berechnet.',
        wrong: '❌ In D13 fehlt die richtige SUMME-Formel.',
        hint: 'Verwende =SUMME(D6:D12).',
      },
    },
    {
      type: 'value',
      cell: 'H4',
      label: 'Mehrwertsteuersatz auf 7 % geändert',
      expected: 0.07,
      tolerance: 0.001,
      feedback: {
        correct: '✅ Mehrwertsteuersatz wurde auf 7 % geändert.',
        wrong: '❌ Ändere den Wert in H4 auf 7 % (0,07).',
      },
    },
  ],
};

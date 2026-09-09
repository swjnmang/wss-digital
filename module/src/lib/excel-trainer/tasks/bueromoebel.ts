import type { ExcelTask } from '../types';

const ITEMS: Array<{ row: number; name: string; price: number; count: number }> = [
  { row: 15, name: 'Bürostuhl "Besta"', price: 199, count: 10 },
  { row: 16, name: 'Schreibtisch "Nitorp"', price: 249, count: 7 },
  { row: 17, name: 'Schreibtischlampe "Finn"', price: 29, count: 8 },
  { row: 18, name: 'Taschenrechner "Kalki"', price: 39.99, count: 20 },
  { row: 19, name: 'Aktenschrank "Mika"', price: 1189, count: 1 },
  { row: 20, name: 'Stiftehalter "Woody"', price: 9.99, count: 8 },
  { row: 21, name: 'Ablagefach "Ordning"', price: 4.99, count: 50 },
];

const CURRENCY_FORMAT = '#,##0.00 "€"';

const seed: ExcelTask['seed'] = [
  { cell: 'A1', value: 'Büromöbel', bold: true },
  { cell: 'A12', value: 'Kostenaufstellung Büromöbel', bold: true, border: true },
  { cell: 'H13', value: 'Mehrwertsteuer', border: true },
  { cell: 'A14', value: 'Möbelstück', border: true },
  { cell: 'B14', value: 'Einzelpreis', border: true },
  { cell: 'C14', value: 'Anzahl', border: true },
  { cell: 'D14', value: 'Gesamtpreis netto', border: true },
  { cell: 'E14', value: 'Mehrwertsteuer', border: true },
  { cell: 'F14', value: 'Gesamtpreis brutto', border: true },
  { cell: 'H14', value: 0.19, border: true, numberFormat: '0%' },
  { cell: 'C22', value: 'Summe:', bold: true, border: true },
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
    '2. Berechnen Sie die Mehrwertsteuer jeder Position in Spalte E in Abhängigkeit von Zelle H14.',
    '3. Berechnen Sie den Gesamtpreis (brutto) jeder Position in Spalte F.',
    '4. Berechnen Sie die Summe in Zelle D22.',
    '5. Verändern Sie den Mehrwertsteuersatz in Zelle H14 auf 7 %.',
  ],
  hint: 'Gesamtpreis netto = Einzelpreis × Anzahl. Verweise beim Mehrwertsteuersatz immer auf H14, damit du die Formel einfach nach unten ziehen kannst.',
  seed,
  columnWidths: { A: 180, B: 90, C: 70, D: 130, E: 110, F: 130, H: 110 },
  checks: [
    {
      type: 'formulaRange',
      column: 'D',
      startRow: 15,
      endRow: 21,
      label: 'Gesamtpreis netto (Spalte D)',
      expected: (row) => `=B${row}*C${row}`,
      feedback: {
        correct: '✅ Gesamtpreis netto korrekt berechnet.',
        wrong: '❌ Gesamtpreis netto (=Einzelpreis × Anzahl) ist nicht in jeder Zeile korrekt.',
        hint: 'Verwende z. B. =B15*C15 und ziehe die Formel bis Zeile 21 herunter.',
      },
    },
    {
      type: 'formulaRange',
      column: 'E',
      startRow: 15,
      endRow: 21,
      label: 'Mehrwertsteuer (Spalte E)',
      expected: (row) => [`=D${row}*$H$14`, `=D${row}*H14`],
      feedback: {
        correct: '✅ Mehrwertsteuer korrekt berechnet.',
        wrong: '❌ Die Mehrwertsteuer muss vom Gesamtpreis netto abhängig von Zelle H14 berechnet werden.',
        hint: 'Verwende z. B. =D15*$H$14 (mit $-Zeichen, damit der Bezug auf H14 beim Herunterziehen erhalten bleibt).',
      },
    },
    {
      type: 'formulaRange',
      column: 'F',
      startRow: 15,
      endRow: 21,
      label: 'Gesamtpreis brutto (Spalte F)',
      expected: (row) => [`=D${row}+E${row}`, `=D${row}*(1+$H$14)`, `=D${row}*(1+H14)`],
      feedback: {
        correct: '✅ Gesamtpreis brutto korrekt berechnet.',
        wrong: '❌ Gesamtpreis brutto (netto + Mehrwertsteuer) ist nicht in jeder Zeile korrekt.',
        hint: 'Verwende z. B. =D15+E15.',
      },
    },
    {
      type: 'formula',
      cell: 'D22',
      label: 'Summe (D22)',
      expected: '=SUMME(D15:D21)',
      feedback: {
        correct: '✅ Summe korrekt berechnet.',
        wrong: '❌ In D22 fehlt die richtige SUMME-Formel.',
        hint: 'Verwende =SUMME(D15:D21).',
      },
    },
    {
      type: 'value',
      cell: 'H14',
      label: 'Mehrwertsteuersatz auf 7 % geändert',
      expected: 0.07,
      tolerance: 0.001,
      feedback: {
        correct: '✅ Mehrwertsteuersatz wurde auf 7 % geändert.',
        wrong: '❌ Ändere den Wert in H14 auf 7 % (0,07).',
      },
    },
  ],
};

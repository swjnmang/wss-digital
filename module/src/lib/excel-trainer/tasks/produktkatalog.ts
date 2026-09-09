import type { ExcelTask } from '../types';
import rawRows from './produktkatalog-data.json';

const CURRENCY = '#,##0.00 "€"';
const HEADERS = ['Hersteller', 'Produktkategorie', 'Techn. Daten', 'Produktbezeichnung', 'Leistungsindex', 'Listen EKP', 'Sachbearbeiter', 'Listen VKP'];
const COLS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

const FIRST_ROW = 2;
const rows = rawRows as Array<Array<string | number | null>>;
const LAST_ROW = FIRST_ROW + rows.length - 1;

const seed: ExcelTask['seed'] = [
  { cell: 'J1', value: 0.2, numberFormat: '0%' },
];

HEADERS.forEach((h, i) => {
  seed.push({ cell: `${COLS[i]}1`, value: h, bold: true, border: true });
});
seed.push({ cell: 'I1', value: 'Rabattbetrag', bold: true, border: true });

rows.forEach((r, i) => {
  const row = FIRST_ROW + i;
  COLS.forEach((col, colIdx) => {
    const val = r[colIdx];
    if (val === null || val === undefined || val === '') {
      seed.push({ cell: `${col}${row}`, border: true });
      return;
    }
    const isCurrencyCol = col === 'F' || col === 'H';
    seed.push({
      cell: `${col}${row}`,
      value: val,
      border: true,
      numberFormat: isCurrencyCol ? CURRENCY : undefined,
    });
  });
  seed.push({ cell: `I${row}`, border: true, numberFormat: CURRENCY });
});

export const produktkatalogTask: ExcelTask = {
  id: 'produktkatalog',
  title: 'Produktkatalog',
  difficulty: 'schwer',
  sheetName: 'Produktkatalog',
  instruction: [
    'Die Daten in dieser Tabelle sind nur schwer lesbar. Bereite die Tabelle "optisch auf" und werte sie aus.',
    '1. Die Daten sollen vollständig lesbar sein, die Überschriften optisch hervorgehoben (z. B. fett/farblich) und die Tabelle vollständig mit Rahmenlinien versehen werden.',
    '2. Aktiviere den Filter für die Spalten A-H.',
    '3. Sortiere die Daten alphabetisch nach Herstellern von A-Z.',
    '4. Färbe alle Zellen, bei denen noch kein Listen VKP eingetragen wurde, rot ein (bedingte Formatierung).',
    '5. Alle Produkte mit einem Leistungsindex von 5 sollen automatisch grün eingefärbt werden (bedingte Formatierung).',
    '6. Alle Produkte sollen einen Rabatt in Höhe von 20 % erhalten (Zelle J1). Berechnen Sie den Rabattbetrag in Spalte I in Abhängigkeit von Zelle J1.',
  ],
  hint: 'Rabattbetrag = Listen VKP (Spalte H) × $J$1. Für die bedingte Formatierung: Regel "Zelle ist leer" für Spalte H bzw. "Zellwert = 5" für Spalte E.',
  seed,
  columnWidths: { A: 110, B: 130, C: 110, D: 150, E: 100, F: 100, G: 120, H: 100, I: 110, J: 70 },
  checks: [
    {
      type: 'bold',
      range: `A1:H1`,
      label: 'Überschriften hervorgehoben',
      feedback: { correct: '✅ Überschriften sind hervorgehoben.', wrong: '❌ Hebe die Überschriften optisch hervor (z. B. fett).' },
    },
    {
      type: 'border',
      range: `A1:H${LAST_ROW}`,
      label: 'Rahmenlinien für die Tabelle',
      feedback: { correct: '✅ Rahmenlinien vorhanden.', wrong: '❌ Versieh die komplette Tabelle mit Rahmenlinien.' },
    },
    {
      type: 'sortedByColumn',
      range: `A${FIRST_ROW}:A${LAST_ROW}`,
      columnOffset: 0,
      direction: 'asc',
      label: 'Sortierung nach Hersteller (A-Z)',
      feedback: { correct: '✅ Korrekt sortiert.', wrong: '❌ Sortiere die Daten alphabetisch nach Hersteller.' },
    },
    {
      type: 'conditionalFormatExists',
      label: 'Bedingte Formatierung vorhanden',
      feedback: {
        correct: '✅ Bedingte Formatierung(en) vorhanden.',
        wrong: '❌ Lege bedingte Formatierungen für leere Listen-VKP-Zellen und Leistungsindex = 5 an.',
      },
    },
    {
      type: 'formulaRange',
      column: 'I',
      startRow: FIRST_ROW,
      endRow: LAST_ROW,
      label: 'Rabattbetrag (Spalte I)',
      expected: (row) => [`=H${row}*$J$1`, `=H${row}*J1`],
      feedback: {
        correct: '✅ Rabattbetrag korrekt berechnet.',
        wrong: '❌ Rabattbetrag ist nicht in jeder Zeile korrekt.',
        hint: 'Verwende z. B. =H2*$J$1.',
      },
    },
  ],
};

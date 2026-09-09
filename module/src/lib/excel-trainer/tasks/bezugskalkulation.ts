import type { ExcelTask } from '../types';

const CURRENCY = '#,##0.00 "€"';

const PRODUCTS = [
  { col: 'H', name: 'Business 540', stueck: 10, lep: 1200, rabatt: 0.03, skonto: 0.02, bezugskosten: 15 },
  { col: 'I', name: 'Lell Xperion', stueck: 12, lep: 1340, rabatt: 0.05, skonto: 0.03, bezugskosten: 15 },
  { col: 'J', name: 'Sangmung XXL', stueck: 18, lep: 1150, rabatt: 0.02, skonto: 0.02, bezugskosten: 13.5 },
];

const CALC_COLS = ['C', 'D', 'E'];

const seed: ExcelTask['seed'] = [
  { cell: 'A1', value: 'Bezugskalkulation', bold: true },
  { cell: 'B3', value: 'Bezugskalkulation (pro Stück)', bold: true, border: true },
  { cell: 'G3', value: 'Dateneingaben', bold: true, border: true },
  { cell: 'B4', value: 'Bezeichnung', bold: true, border: true },
  { cell: 'G4', value: 'Artikelbezeichnung', border: true },
  { cell: 'G5', value: 'Stückzahl', border: true },
  { cell: 'G6', value: 'LEP/Stück', border: true },
  { cell: 'G7', value: 'Rabatt', border: true },
  { cell: 'G8', value: 'Skonto', border: true },
  { cell: 'G9', value: 'Bezugskosten pro Stück', border: true },
  { cell: 'B6', value: 'Listeneinkaufspreis netto', border: true },
  { cell: 'B7', value: '-Liefererrabatt', border: true },
  { cell: 'B8', value: 'Zieleinkaufspreis', border: true, bold: true },
  { cell: 'B9', value: '-Liefererskonto', border: true },
  { cell: 'B10', value: 'Bareinkaufspreis', border: true, bold: true },
  { cell: 'B11', value: '+Bezugskosten pro Stück', border: true },
  { cell: 'B12', value: 'Bezugspreis (pro Stück)', border: true, bold: true },
  { cell: 'B14', value: 'Analyse', bold: true, border: true },
  { cell: 'B15', value: 'Prozentualer Anteil Bezugskosten', border: true },
  { cell: 'B16', value: 'Produkt kaufen: ja oder nein?', border: true },
  { cell: 'B17', value: 'Bezugspreis der gesamten Bestellung', border: true },
];

PRODUCTS.forEach((p, i) => {
  const calc = CALC_COLS[i];
  seed.push(
    { cell: `${p.col}4`, value: p.name, border: true, bold: true },
    { cell: `${p.col}5`, value: p.stueck, border: true, numberFormat: '0 "Stück"' },
    { cell: `${p.col}6`, value: p.lep, border: true, numberFormat: CURRENCY },
    { cell: `${p.col}7`, value: p.rabatt, border: true, numberFormat: '0%' },
    { cell: `${p.col}8`, value: p.skonto, border: true, numberFormat: '0%' },
    { cell: `${p.col}9`, value: p.bezugskosten, border: true, numberFormat: CURRENCY },
    { cell: `${calc}4`, formula: `=${p.col}4`, border: true, bold: true },
  );
  for (const row of [6, 7, 8, 9, 10, 11, 12]) {
    seed.push({ cell: `${calc}${row}`, border: true, numberFormat: CURRENCY });
  }
  seed.push(
    { cell: `${calc}15`, border: true, numberFormat: '0.00%' },
    { cell: `${calc}16`, border: true },
    { cell: `${calc}17`, border: true, numberFormat: CURRENCY },
  );
});

export const bezugskalkulationTask: ExcelTask = {
  id: 'bezugskalkulation',
  title: 'Bezugskalkulation',
  difficulty: 'mittel',
  sheetName: 'Bezugskalkulation',
  instruction: [
    'In das Sortiment der MM5 GmbH sollen neue Hochleistungsrechner aufgenommen werden. Bevor bestellt wird, soll eine Bezugskalkulation pro Stück für drei Angebote erstellt werden.',
    '1. Berechnen Sie für jedes Produkt (Spalte C, D, E) die Kalkulation: Listeneinkaufspreis netto, Liefererrabatt, Zieleinkaufspreis, Liefererskonto, Bareinkaufspreis, Bezugskosten und Bezugspreis (jeweils pro Stück).',
    '2. Berechnen Sie den prozentualen Anteil der Bezugskosten am Bezugspreis (Zeile 15) mit zwei Nachkommastellen.',
    '3. Wenn dieser Anteil höchstens 1,25 % beträgt, soll "ja" erscheinen, ansonsten "nein" (Zeile 16).',
    '4. Für Profis: Steht in Zeile 16 "ja", berechnen Sie den Bezugspreis der gesamten Bestellung (Bezugspreis × Stückzahl) in Zeile 17, ansonsten soll dort ein Strich (-) stehen.',
  ],
  hint: 'Liefererrabatt = Listeneinkaufspreis × Rabattsatz. Zieleinkaufspreis = Listeneinkaufspreis − Liefererrabatt. Liefererskonto = Zieleinkaufspreis × Skontosatz. Bareinkaufspreis = Zieleinkaufspreis − Liefererskonto. Bezugspreis = Bareinkaufspreis + Bezugskosten.',
  seed,
  columnWidths: { A: 40, B: 220, C: 110, D: 110, E: 110, G: 170, H: 110, I: 110, J: 110 },
  checks: [
    {
      type: 'formulaRange',
      column: 'C',
      startRow: 6,
      endRow: 6,
      label: 'Listeneinkaufspreis netto',
      expected: () => ['=H6', '=$H$6'],
      feedback: { correct: '✅ Korrekt.', wrong: '❌ Listeneinkaufspreis netto muss auf LEP/Stück verweisen (Zeile 6, Spalte H/I/J).' },
    },
    {
      type: 'formula',
      cell: 'C7',
      label: 'Liefererrabatt (Business 540)',
      expected: ['=C6*H7', '=H7*C6'],
      feedback: { correct: '✅ Korrekt.', wrong: '❌ Liefererrabatt = Listeneinkaufspreis netto × Rabattsatz.' },
    },
    {
      type: 'formula',
      cell: 'C8',
      label: 'Zieleinkaufspreis (Business 540)',
      expected: '=C6-C7',
      feedback: { correct: '✅ Korrekt.', wrong: '❌ Zieleinkaufspreis = Listeneinkaufspreis netto − Liefererrabatt.' },
    },
    {
      type: 'formula',
      cell: 'C9',
      label: 'Liefererskonto (Business 540)',
      expected: ['=C8*H8', '=H8*C8'],
      feedback: { correct: '✅ Korrekt.', wrong: '❌ Liefererskonto = Zieleinkaufspreis × Skontosatz.' },
    },
    {
      type: 'formula',
      cell: 'C10',
      label: 'Bareinkaufspreis (Business 540)',
      expected: '=C8-C9',
      feedback: { correct: '✅ Korrekt.', wrong: '❌ Bareinkaufspreis = Zieleinkaufspreis − Liefererskonto.' },
    },
    {
      type: 'formula',
      cell: 'C11',
      label: 'Bezugskosten übernommen (Business 540)',
      expected: ['=H9', '=$H$9'],
      feedback: { correct: '✅ Korrekt.', wrong: '❌ Verweise auf die Bezugskosten pro Stück (Zeile 9).' },
    },
    {
      type: 'formula',
      cell: 'C12',
      label: 'Bezugspreis pro Stück (Business 540)',
      expected: '=C10+C11',
      feedback: { correct: '✅ Korrekt.', wrong: '❌ Bezugspreis = Bareinkaufspreis + Bezugskosten.' },
    },
    {
      type: 'value',
      cell: 'C15',
      label: 'Prozentualer Anteil Bezugskosten (Business 540)',
      expected: 0.012979,
      tolerance: 0.0003,
      feedback: { correct: '✅ Korrekt.', wrong: '❌ Anteil = Bezugskosten ÷ Bezugspreis (Zeile 11 ÷ Zeile 12).' },
    },
    {
      type: 'value',
      cell: 'C16',
      label: 'Kaufentscheidung (Business 540)',
      expected: 'nein',
      feedback: { correct: '✅ Korrekt.', wrong: '❌ Bei über 1,25 % Anteil muss "nein" stehen.' },
    },
    {
      type: 'value',
      cell: 'D16',
      label: 'Kaufentscheidung (Lell Xperion)',
      expected: 'ja',
      feedback: { correct: '✅ Korrekt.', wrong: '❌ Bei höchstens 1,25 % Anteil muss "ja" stehen.' },
    },
    {
      type: 'value',
      cell: 'D17',
      label: 'Bezugspreis gesamte Bestellung (Lell Xperion)',
      expected: 14997.72,
      tolerance: 1,
      feedback: { correct: '✅ Korrekt.', wrong: '❌ Bezugspreis (pro Stück) × Stückzahl, nur wenn Zeile 16 "ja" ist.' },
    },
  ],
};

import type { ExcelTask } from '../types';

const CURRENCY = '#,##0.00 "€"';

interface Produkt {
  nr: number;
  name: string;
  vkpAlt: number;
  menge: number;
}

const PRODUKTE: Produkt[] = [
  { nr: 24738, name: 'Merinoshirt Hike Männer', vkpAlt: 42, menge: 200 },
  { nr: 24739, name: 'Merinoshirt Trail Frauen', vkpAlt: 45, menge: 200 },
  { nr: 24740, name: 'Stirnlampe 40 Lumen, blau', vkpAlt: 32.5, menge: 50 },
  { nr: 24741, name: 'Stirnlampe 40 Lumen, rot', vkpAlt: 21, menge: 50 },
  { nr: 24742, name: 'Stirnlampe 40 Lumen, schwarz', vkpAlt: 21, menge: 50 },
  { nr: 24743, name: 'Stirnband Dynalight', vkpAlt: 18, menge: 250 },
  { nr: 24744, name: 'Stirnband Salve', vkpAlt: 34, menge: 250 },
  { nr: 24745, name: 'Trekkinghose Everest, Männer', vkpAlt: 110, menge: 60 },
  { nr: 24746, name: 'Trekkinghose Everest, Frauen', vkpAlt: 110, menge: 60 },
  { nr: 24747, name: 'Sonnenbrille "Shades of blue"', vkpAlt: 90, menge: 150 },
  { nr: 24748, name: 'Sonnenbrille "Shades of black"', vkpAlt: 90, menge: 150 },
];

const FIRST_ROW = 5;
const LAST_ROW = FIRST_ROW + PRODUKTE.length - 1;
const SUM_ROW = LAST_ROW + 1;

const seed: ExcelTask['seed'] = [
  { cell: 'A1', value: 'Vorgesehene Produkte Marktplätze', bold: true },
  { cell: 'B3', value: 'Erhöhung der Verkaufspreise:' },
  { cell: 'C3', value: 0.025, numberFormat: '0.00%' },
  { cell: 'G3', value: 'MwSt:' },
  { cell: 'H3', value: 0.19, numberFormat: '0%' },
  { cell: 'A4', value: '#', bold: true, border: true },
  { cell: 'B4', value: 'Artikelname', bold: true, border: true },
  { cell: 'C4', value: 'VKP alt', bold: true, border: true },
  { cell: 'D4', value: 'VKP neu', bold: true, border: true },
  { cell: 'E4', value: 'VKP brutto', bold: true, border: true },
  { cell: 'F4', value: 'absetzbare Menge', bold: true, border: true },
  { cell: 'G4', value: 'Umsatz', bold: true, border: true },
  { cell: 'H4', value: 'Entscheidung', bold: true, border: true },
  { cell: 'I4', value: 'erzielbarer Umsatz', bold: true, border: true },
];

PRODUKTE.forEach((p, i) => {
  const row = FIRST_ROW + i;
  seed.push(
    { cell: `A${row}`, value: p.nr, border: true },
    { cell: `B${row}`, value: p.name, border: true },
    { cell: `C${row}`, value: p.vkpAlt, border: true, numberFormat: CURRENCY },
    { cell: `D${row}`, border: true, numberFormat: CURRENCY },
    { cell: `E${row}`, border: true, numberFormat: CURRENCY },
    { cell: `F${row}`, value: p.menge, border: true, numberFormat: '0 "Stück"' },
    { cell: `G${row}`, border: true, numberFormat: CURRENCY },
    { cell: `H${row}`, border: true },
    { cell: `I${row}`, border: true, numberFormat: CURRENCY },
  );
});

seed.push(
  { cell: `H${SUM_ROW}`, value: 'maximal erzielbarer Gesamtumsatz:', bold: true },
  { cell: `I${SUM_ROW}`, border: true, numberFormat: CURRENCY },
);

export const marktplaetzeTask: ExcelTask = {
  id: 'marktplaetze',
  title: 'Marktplätze',
  difficulty: 'schwer',
  sheetName: 'Marktplätze',
  instruction: [
    'Die Sport Lilly e. K. plant ausgewählte Sportartikel auch auf Marktplätzen anzubieten. Die Verkaufspreise sollen dafür erhöht werden (Satz in Zelle C3).',
    '1. Berechnen Sie in Spalte D den neuen Listenpreis (VKP neu). Verwenden Sie dabei die absolute Adressierung auf C3.',
    '2. Berechnen Sie in Spalte E den Verkaufspreis brutto mit der Mehrwertsteuer aus Zelle H3.',
    '3. Berechnen Sie in Spalte G den Umsatz (VKP neu × absetzbare Menge).',
    '4. Treffen Sie in Spalte H die Entscheidung: Ist der Umsatz größer als 2000,00 €, soll "anbieten" erscheinen, sonst "entfernen" (Wenn-Dann-Formel). Heben Sie "anbieten" grün und "entfernen" rot hervor.',
    '5. Für Profis: Berechnen Sie in Spalte I den erzielbaren Umsatz – bei Umsatz über 2000,00 € wird der Umsatz übernommen, sonst 0.',
    '6. Berechnen Sie die Summe des maximal erzielbaren Gesamtumsatzes.',
    '7. Filtern Sie die Ergebnisse so, dass nur Artikel angezeigt werden, die angeboten werden sollen.',
  ],
  hint: 'VKP neu = VKP alt × (1 + $C$3). VKP brutto = VKP neu × (1 + $H$3). Umsatz = VKP neu × absetzbare Menge. Entscheidung: =WENN(G5>2000,"anbieten","entfernen") – in dieser Tabellenkalkulation werden die Argumente einer Formel mit Komma statt Semikolon getrennt.',
  seed,
  columnWidths: { A: 60, B: 200, C: 100, D: 100, E: 100, F: 130, G: 110, H: 110, I: 130 },
  checks: [
    {
      type: 'formulaRange',
      column: 'D',
      startRow: FIRST_ROW,
      endRow: LAST_ROW,
      label: 'VKP neu (Spalte D)',
      expected: (row) => [`=C${row}*(1+$C$3)`, `=C${row}*(1+C3)`],
      feedback: { correct: '✅ Korrekt berechnet.', wrong: '❌ VKP neu = VKP alt × (1 + Erhöhungssatz in C3), am besten mit $-Bezug.' },
    },
    {
      type: 'formulaRange',
      column: 'E',
      startRow: FIRST_ROW,
      endRow: LAST_ROW,
      label: 'VKP brutto (Spalte E)',
      expected: (row) => [`=D${row}*(1+$H$3)`, `=D${row}*(1+H3)`],
      feedback: { correct: '✅ Korrekt berechnet.', wrong: '❌ VKP brutto = VKP neu × (1 + Mehrwertsteuer in H3).' },
    },
    {
      type: 'formulaRange',
      column: 'G',
      startRow: FIRST_ROW,
      endRow: LAST_ROW,
      label: 'Umsatz (Spalte G)',
      expected: (row) => [`=D${row}*F${row}`, `=F${row}*D${row}`],
      feedback: { correct: '✅ Korrekt berechnet.', wrong: '❌ Umsatz = VKP neu × absetzbare Menge.' },
    },
    {
      type: 'formulaRange',
      column: 'H',
      startRow: FIRST_ROW,
      endRow: LAST_ROW,
      label: 'Entscheidung (Spalte H)',
      expected: (row) => [`=WENN(G${row}>2000;"anbieten";"entfernen")`, `=WENN(G${row}>2000,"anbieten","entfernen")`],
      feedback: { correct: '✅ Korrekt berechnet.', wrong: '❌ Nutze eine Wenn-Dann-Formel: Umsatz > 2000 € → "anbieten", sonst "entfernen".' },
    },
    {
      type: 'conditionalFormatExists',
      label: 'Farbliche Hervorhebung der Entscheidung',
      feedback: { correct: '✅ Bedingte Formatierung vorhanden.', wrong: '❌ Hebe "anbieten" grün und "entfernen" rot hervor.' },
    },
    {
      type: 'formula',
      cell: `I${SUM_ROW}`,
      label: 'Maximal erzielbarer Gesamtumsatz',
      expected: [`=SUMME(I${FIRST_ROW}:I${LAST_ROW})`],
      feedback: { correct: '✅ Korrekt.', wrong: `❌ Verwende =SUMME(I${FIRST_ROW}:I${LAST_ROW}).` },
    },
    {
      type: 'filterActive',
      label: 'Filter aktiviert',
      feedback: { correct: '✅ Filter ist aktiv.', wrong: '❌ Filtere die Tabelle so, dass nur "anbieten"-Artikel sichtbar sind.' },
    },
  ],
};

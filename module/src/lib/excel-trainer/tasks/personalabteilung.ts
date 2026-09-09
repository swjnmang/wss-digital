import type { ExcelTask } from '../types';

const CURRENCY = '#,##0.00 "€"';

interface Bewerber {
  name: string;
  vorname: string;
  abschluss: string;
  informatik: number;
  mathe: number;
  englisch: number;
  deutsch: number;
  anfahrtsweg: number;
  bewirtung: number;
}

const BEWERBER: Bewerber[] = [
  { name: 'Schieber', vorname: 'Juliane', abschluss: 'Abitur', informatik: 2, mathe: 3, englisch: 4, deutsch: 4, anfahrtsweg: 30, bewirtung: 9.5 },
  { name: 'Foda', vorname: 'Franco', abschluss: 'Fachabitur', informatik: 1, mathe: 2, englisch: 3, deutsch: 3, anfahrtsweg: 18, bewirtung: 9.5 },
  { name: 'Boa Morte', vorname: 'Luis', abschluss: 'Fachabitur', informatik: 2, mathe: 4, englisch: 2, deutsch: 1, anfahrtsweg: 40, bewirtung: 9.5 },
  { name: 'Carotti', vorname: 'Lorenzo', abschluss: 'Abitur', informatik: 1, mathe: 2, englisch: 2, deutsch: 3, anfahrtsweg: 10, bewirtung: 9.5 },
  { name: 'Roos', vorname: 'Axel', abschluss: 'Abitur', informatik: 3, mathe: 2, englisch: 1, deutsch: 3, anfahrtsweg: 25, bewirtung: 9.5 },
  { name: 'McJagger', vorname: 'Florian', abschluss: 'Fachabitur', informatik: 3, mathe: 2, englisch: 1, deutsch: 1, anfahrtsweg: 5, bewirtung: 9.5 },
  { name: 'Tonmeister', vorname: 'Gabriele', abschluss: 'Abitur', informatik: 4, mathe: 1, englisch: 1, deutsch: 1, anfahrtsweg: 24, bewirtung: 9.5 },
  { name: 'Henning', vorname: 'Gulliver', abschluss: 'Abitur', informatik: 2, mathe: 2, englisch: 1, deutsch: 2, anfahrtsweg: 9, bewirtung: 9.5 },
];

const FIRST_ROW = 5;

const seed: ExcelTask['seed'] = [
  { cell: 'A1', value: 'Bewerber studienbegleitende IT-Ausbildung', bold: true },
  { cell: 'K3', value: 'Erstattung/km' },
  { cell: 'L3', value: 0.25, numberFormat: CURRENCY },
  { cell: 'B4', value: 'Name', bold: true, border: true, align: 'center' },
  { cell: 'C4', value: 'Vorname', bold: true, border: true, align: 'center' },
  { cell: 'D4', value: 'Schulabschluss', bold: true, border: true, align: 'center' },
  { cell: 'E4', value: 'Informatik', bold: true, border: true, align: 'center' },
  { cell: 'F4', value: 'Mathe', bold: true, border: true, align: 'center' },
  { cell: 'G4', value: 'Englisch', bold: true, border: true, align: 'center' },
  { cell: 'H4', value: 'Deutsch', bold: true, border: true, align: 'center' },
  { cell: 'I4', value: 'Durchschnitt', bold: true, border: true, align: 'center' },
  { cell: 'J4', value: 'Anfahrtsweg', bold: true, border: true, align: 'center' },
  { cell: 'K4', value: 'Erstattung Fahrtkosten', bold: true, border: true, align: 'center' },
  { cell: 'L4', value: 'Kosten Bewirtung', bold: true, border: true, align: 'center' },
  { cell: 'M4', value: 'Summe d. Kosten', bold: true, border: true, align: 'center' },
];

BEWERBER.forEach((b, i) => {
  const row = FIRST_ROW + i;
  seed.push(
    { cell: `B${row}`, value: b.name, border: true },
    { cell: `C${row}`, value: b.vorname, border: true },
    { cell: `D${row}`, value: b.abschluss, border: true },
    { cell: `E${row}`, value: b.informatik, border: true },
    { cell: `F${row}`, value: b.mathe, border: true },
    { cell: `G${row}`, value: b.englisch, border: true },
    { cell: `H${row}`, value: b.deutsch, border: true },
    { cell: `I${row}`, border: true, numberFormat: '0.0' },
    { cell: `J${row}`, value: b.anfahrtsweg, border: true, numberFormat: '0 "km"' },
    { cell: `K${row}`, border: true, numberFormat: CURRENCY },
    { cell: `L${row}`, value: b.bewirtung, border: true, numberFormat: CURRENCY },
    { cell: `M${row}`, border: true, numberFormat: CURRENCY },
  );
});

const LAST_ROW = FIRST_ROW + BEWERBER.length - 1;

export const personalabteilungTask: ExcelTask = {
  id: 'personalabteilung',
  title: 'Durchschnitt (Personalabteilung)',
  difficulty: 'mittel',
  sheetName: 'Personalabteilung',
  instruction: [
    'Sie arbeiten in der Personalabteilung der IT-Profi GmbH und werten Bewerbungen für eine studienbegleitende IT-Ausbildung aus.',
    '1. Berechnen Sie in Spalte I den Durchschnitt (Mittelwert) der vier Schulnoten mit einer Nachkommastelle.',
    '2. Heben Sie die Noten farblich hervor: Note bis maximal 2 grün, ab Note 4 rot (bedingte Formatierung).',
    '3. Berechnen Sie in Spalte K die Erstattung der Fahrtkosten (Anfahrtsweg × Erstattungssatz in L3).',
    '4. Ändern Sie den Erstattungssatz in L3 auf 0,50 €.',
    '5. Berechnen Sie in Spalte M die Gesamtkosten je Bewerber (Erstattung + Bewirtungskosten) mit der Summen-Formel.',
    '6. Sortieren Sie die Bewerber nach Nachnamen von A-Z und filtern Sie: nur Bewerber mit Abitur (nicht Fachabitur) und Informatik-Note 2 oder besser.',
  ],
  hint: 'MITTELWERT(E5:H5) für den Notendurchschnitt. Erstattung = Anfahrtsweg × $L$3, damit der Bezug beim Herunterziehen erhalten bleibt.',
  seed,
  columnWidths: { A: 40, B: 110, C: 100, D: 110, E: 80, F: 80, G: 80, H: 80, I: 90, J: 100, K: 130, L: 120, M: 110 },
  checks: [
    {
      type: 'formulaRange',
      column: 'I',
      startRow: FIRST_ROW,
      endRow: LAST_ROW,
      label: 'Notendurchschnitt (Spalte I)',
      expected: (row) => [`=MITTELWERT(E${row}:H${row})`, `=MITTELWERT(E${row};F${row};G${row};H${row})`],
      feedback: {
        correct: '✅ Durchschnitt korrekt berechnet.',
        wrong: '❌ Der Notendurchschnitt ist nicht in jeder Zeile korrekt.',
        hint: 'Verwende z. B. =MITTELWERT(E5:H5).',
      },
    },
    {
      type: 'conditionalFormatExists',
      label: 'Farbliche Hervorhebung der Noten',
      feedback: {
        correct: '✅ Bedingte Formatierung vorhanden.',
        wrong: '❌ Es wurde noch keine bedingte Formatierung für die Noten angelegt.',
      },
    },
    {
      type: 'formulaRange',
      column: 'K',
      startRow: FIRST_ROW,
      endRow: LAST_ROW,
      label: 'Erstattung Fahrtkosten (Spalte K)',
      expected: (row) => [`=J${row}*$L$3`, `=J${row}*L3`],
      feedback: {
        correct: '✅ Erstattung korrekt berechnet.',
        wrong: '❌ Erstattung = Anfahrtsweg × Erstattungssatz (L3), am besten mit $-Bezug.',
      },
    },
    {
      type: 'value',
      cell: 'L3',
      label: 'Erstattungssatz auf 0,50 € geändert',
      expected: 0.5,
      tolerance: 0.001,
      feedback: { correct: '✅ Korrekt geändert.', wrong: '❌ Ändere den Wert in L3 auf 0,50.' },
    },
    {
      type: 'formulaRange',
      column: 'M',
      startRow: FIRST_ROW,
      endRow: LAST_ROW,
      label: 'Summe der Kosten (Spalte M)',
      expected: (row) => [`=SUMME(K${row}:L${row})`, `=K${row}+L${row}`],
      feedback: {
        correct: '✅ Summe korrekt berechnet.',
        wrong: '❌ Nutze die SUMME-Formel für Erstattung + Bewirtungskosten.',
      },
    },
    {
      type: 'sortedByColumn',
      range: `B${FIRST_ROW}:B${LAST_ROW}`,
      columnOffset: 0,
      direction: 'asc',
      label: 'Sortierung nach Nachname (A-Z)',
      feedback: { correct: '✅ Korrekt sortiert.', wrong: '❌ Die Bewerber sind noch nicht alphabetisch nach Nachname sortiert.' },
    },
    {
      type: 'filterActive',
      label: 'Filter aktiviert',
      feedback: {
        correct: '✅ Filter ist aktiv.',
        wrong: '❌ Aktiviere den Filter und zeige nur Abitur-Bewerber mit Informatik-Note 2 oder besser.',
      },
    },
  ],
};

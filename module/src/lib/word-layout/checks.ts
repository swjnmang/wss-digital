import type { LayoutDocument, LayoutParagraph } from './grading';
import type { LayoutCheck } from './types';

/** Liefert die zu prüfenden Absätze; `undefined` = Absatz nicht gefunden. */
export type Selector = (d: LayoutDocument) => (LayoutParagraph | undefined)[];

/** Absätze über ihren Textanfang (mit "=" am Anfang: exakter Text). */
export const byText =
  (...prefixes: string[]): Selector =>
  (d) =>
    prefixes.map((prefix) => d.find(prefix));

/** Erster Absatz, der mit `prefix` beginnt und länger als `minLength` ist (unterscheidet Überschrift und Fließtext). */
export const longParagraph =
  (prefix: string, minLength = 60): Selector =>
  (d) => [d.paragraphs.find((p) => p.text.trim().startsWith(prefix) && p.text.length > minLength)];

/** Tabellenzellen (erste Tabelle), ausgewählt über Zeile/Spalte (0-basiert). Leere Zellen werden übersprungen. */
export const cells =
  (filter: (row: number, col: number) => boolean, tableIndex = 0): Selector =>
  (d) => {
    const table = d.tables[tableIndex];
    if (!table) return [undefined];
    const out: (LayoutParagraph | undefined)[] = [];
    table.cells.forEach((row, r) =>
      row.forEach((cell, c) => {
        if (filter(r, c) && (!cell || cell.text.trim())) out.push(cell);
      }),
    );
    return out.length > 0 ? out : [undefined];
  };

/** Prüfung für einen oder mehrere Absätze (Anfang des Textes identifiziert sie); alle müssen passen. */
export function check(
  label: string,
  hint: string,
  target: string | string[] | Selector,
  test: (p: LayoutParagraph, d: LayoutDocument) => boolean,
): LayoutCheck {
  const selector = typeof target === 'function' ? target : byText(...(Array.isArray(target) ? target : [target]));
  return {
    label,
    hint,
    test: (d) => selector(d).every((p) => !!p && test(p, d)),
  };
}

/** Prüfung auf Dokumentebene (Seite, Kopfzeile, Abschnitte …). */
export const docCheck = (label: string, hint: string, test: (d: LayoutDocument) => boolean): LayoutCheck => ({ label, hint, test });

// Univer kennt mehrere Aufzählungs- und Nummerierungsstile (BULLET_LIST_1 … bzw. ORDER_LIST_QUICK_2 …) – alle zählen
export const isNumberedList = (p: LayoutParagraph) => p.isList && p.listType.startsWith('ORDER_LIST');
export const isBulletList = (p: LayoutParagraph) => p.isList && p.listType.startsWith('BULLET_LIST');

/** Abschnitt, in dem ein Absatz steht. */
export const sectionOf = (d: LayoutDocument, p: LayoutParagraph | undefined) => (p ? d.sections[p.section] : undefined);

// ---------- Einheitliche Bedienhinweise (PC und Tablet) ----------

/** Spalten der Farbpalette im Editor (von links). */
export const PALETTE_COLUMN = { grau: 1, blau: 2, rot: 3, orange: 4, gelb: 5, gruen: 6, tuerkis: 7, lila: 8, pink: 9 } as const;

export const H = {
  selectLine: 'Ganze Zeile markieren (PC: dreimal hineinklicken · Tablet: mit dem Finger vom ersten bis zum letzten Buchstaben über den Text wischen)',
  selectLines: 'Alle betroffenen Zeilen gemeinsam markieren: vor dem ersten Buchstaben ansetzen und bis hinter den letzten ziehen (Tablet: mit dem Finger darüber wischen)',
  bold: 'Start → B (Fett)',
  italic: 'Start → I (Kursiv)',
  underline: 'Start → U (Unterstrichen)',
  superscript: 'Nur das Zeichen markieren → Start → X² (Hochgestellt)',
  size: (pt: number) => `Start → Schriftgröße (Feld mit „11“) → ${pt} auswählen oder eintippen und Enter`,
  font: (name: string) => `Start → Schriftart (Feld mit „Arial“) → ${name}`,
  style: (name: string) => `Start → Formatvorlage (Feld mit „Normal“) → ${name}`,
  align: (name: string) => `Start → Ausrichtung (≡ mit Pfeil; am Tablet unter ⋮) → ${name}`,
  color: (name: string, col: number) => `Start → Schriftfarbe (A mit Farbbalken) → Pfeil → eine Farbe aus der ${col}. Spalte (${name})`,
  highlight: (name: string, col: number) => `Start → Texthintergrundfarbe (Farbeimer; am Tablet unter ⋮) → Pfeil → ${col}. Spalte (${name})`,
  bullets: 'Start → Aufzählungsliste (Symbol mit Punkten; am Tablet unter ⋮)',
  numbers: 'Start → Nummerierte Liste (Symbol mit 1-2-3; am Tablet unter ⋮)',
  paragraph: 'Text markieren → Knopf „¶ Absatzeinstellungen“ (PC auch: Rechtsklick → Absatzeinstellungen)',
  section: 'Cursor in den Abschnitt setzen → Knopf „▥ Abschnitt & Spalten“ (PC auch: Rechtsklick → Abschnittseinstellungen)',
  page: 'Knopf „📄 Seite einrichten“ → Oben/Unten/Links/Rechts in px eintragen → Bestätigen',
  header: 'Knopf „Kopfzeile bearbeiten“ drücken und direkt lostippen (PC auch: Doppelklick in den oberen Seitenrand). Danach „↩ Zurück zum Text“ drücken',
  footer: 'Knopf „Fußzeile bearbeiten“ drücken und direkt lostippen (PC auch: Doppelklick in den unteren Seitenrand). Danach „↩ Zurück zum Text“ drücken',
  insertBreak: (name: string) => `Cursor an die Stelle setzen → Einfügen → Umbrüche (Symbol neben dem Strich) → ${name}`,
} as const;

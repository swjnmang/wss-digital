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

export const isNumberedList = (p: LayoutParagraph) => p.isList && p.listType !== 'BULLET_LIST' && !/CHECK|TASK/i.test(p.listType);
export const isBulletList = (p: LayoutParagraph) => p.isList && p.listType === 'BULLET_LIST';

/** Abschnitt, in dem ein Absatz steht. */
export const sectionOf = (d: LayoutDocument, p: LayoutParagraph | undefined) => (p ? d.sections[p.section] : undefined);

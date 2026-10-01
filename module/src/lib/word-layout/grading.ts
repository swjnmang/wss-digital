import type { IDocumentData, ITextStyle } from '@univerjs/core';
import { BaselineOffset, BooleanNumber, ColumnSeparatorType, DataStreamTreeTokenType, HorizontalAlign, NamedStyleType, SpacingRule } from '@univerjs/core';
import type { FDocument } from '@univerjs/docs/facade';

/** Gelesener Absatz des Schüler-Dokuments (Text + wirksame Formatierung). */
export interface LayoutParagraph {
  text: string;
  /** Position des ersten Textzeichens im dataStream. */
  start: number;
  /** Position der Absatzmarke im dataStream. */
  end: number;
  namedStyle: number;
  align: number;
  isList: boolean;
  listType: string;
  /** Zeichenformat pro Zeichen (Text ohne Absatzmarke). */
  charStyles: ITextStyle[];
  inTable: boolean;
  /** Index des Abschnitts (nur Hauptdokument, Tabellenzellen zählen zum umgebenden Abschnitt). */
  section: number;
  /** Absatzeinstellungen in px bzw. als Mehrfaches; undefined = nicht gesetzt. */
  lineSpacing?: number;
  spacingRule: number;
  spaceAbove?: number;
  spaceBelow?: number;
  indentStart?: number;
  indentFirstLine?: number;
  hanging?: number;
}

export interface LayoutSection {
  columns: number;
  /** Spaltenabstand in px. */
  gap: number;
  separator: boolean;
  /** Seitenränder in px (Abschnitt oder – falls nicht gesetzt – Dokument). */
  margins: { top: number; bottom: number; left: number; right: number };
}

export interface LayoutDocument {
  paragraphs: LayoutParagraph[];
  tables: { rows: number; cols: number; cells: (LayoutParagraph | undefined)[][] }[];
  sections: LayoutSection[];
  headerText: string;
  footerText: string;
  defaults: ITextStyle;
  /** Kompletter Text inkl. Steuerzeichen (z. B. \v = Spaltenumbruch). */
  stream: string;
  /** Findet den Absatz, dessen Text mit `prefix` beginnt (mit "=" am Anfang: exakt gleich). */
  find: (prefix: string) => LayoutParagraph | undefined;
}

const T = DataStreamTreeTokenType;

const num = (v: { v: number } | number | undefined) => (v == null ? undefined : typeof v === 'number' ? v : v.v);
const cleanText = (stream: string) => [...stream].map((c) => (c.charCodeAt(0) < 32 ? ' ' : c)).join('').replace(/\s+/g, ' ').trim();

export function readLayoutDocument(data: IDocumentData): LayoutDocument {
  const body = data.body;
  const stream = body?.dataStream ?? '';
  const paragraphsRaw = body?.paragraphs ?? [];
  const runs = body?.textRuns ?? [];
  const defaults: ITextStyle = data.documentStyle?.textStyle ?? {};
  const tables = body?.tables ?? [];
  const docStyle = data.documentStyle ?? {};
  const inAnyTable = (i: number) => tables.some((t) => i >= t.startIndex && i < t.endIndex);

  // Abschnittsumbrüche in Tabellenzellen gehören nicht zur Seitengliederung
  const mainBreaks = (body?.sectionBreaks ?? []).filter((s) => !inAnyTable(s.startIndex));
  const sections: LayoutSection[] = mainBreaks.map((s) => {
    const cols = s.columnProperties ?? [];
    return {
      columns: Math.max(1, cols.length),
      gap: cols.length > 1 ? cols[0].paddingEnd : 0,
      separator: s.columnSeparatorType === ColumnSeparatorType.BETWEEN_EACH_COLUMN,
      margins: {
        top: s.marginTop ?? docStyle.marginTop ?? 0,
        bottom: s.marginBottom ?? docStyle.marginBottom ?? 0,
        left: s.marginLeft ?? docStyle.marginLeft ?? 0,
        right: s.marginRight ?? docStyle.marginRight ?? 0,
      },
    };
  });
  const sectionOf = (index: number) => {
    const i = mainBreaks.findIndex((s) => s.startIndex >= index);
    return i === -1 ? Math.max(0, mainBreaks.length - 1) : i;
  };

  const paragraphs: LayoutParagraph[] = [];
  let prevEnd = -1;
  for (const p of paragraphsRaw) {
    const start = prevEnd + 1;
    const end = p.startIndex;
    prevEnd = end;
    // Steuerzeichen (Tabellen-/Zellgrenzen, Abschnitts- und Spaltenumbrüche) gehören nicht zum Text
    let textStart = start;
    while (textStart < end && stream.charCodeAt(textStart) < 32) textStart += 1;
    const text = stream.slice(textStart, end);
    const charStyles: ITextStyle[] = [];
    for (let i = textStart; i < end; i++) {
      const run = runs.find((r) => r.st <= i && i < r.ed);
      charStyles.push({ ...defaults, ...(run?.ts ?? {}) });
    }
    const ps = p.paragraphStyle ?? {};
    paragraphs.push({
      text,
      start: textStart,
      end,
      namedStyle: ps.namedStyleType ?? NamedStyleType.NORMAL_TEXT,
      align: ps.horizontalAlign ?? HorizontalAlign.UNSPECIFIED,
      isList: !!p.bullet,
      listType: p.bullet?.listType ?? '',
      charStyles,
      inTable: inAnyTable(textStart),
      section: sectionOf(end),
      lineSpacing: ps.lineSpacing,
      spacingRule: ps.spacingRule ?? SpacingRule.AUTO,
      spaceAbove: num(ps.spaceAbove),
      spaceBelow: num(ps.spaceBelow),
      indentStart: num(ps.indentStart),
      indentFirstLine: num(ps.indentFirstLine),
      hanging: num(ps.hanging),
    });
  }

  const byEnd = new Map(paragraphs.map((p) => [p.end, p]));
  const tableInfos = tables.map((t) => {
    // Zellen über die Steuerzeichen zuordnen: jeweils der erste Absatz einer Zelle
    const cells: (LayoutParagraph | undefined)[][] = [];
    let row = -1;
    let col = -1;
    let cellHasParagraph = false;
    for (let i = t.startIndex; i < t.endIndex; i++) {
      const c = stream[i];
      if (c === T.TABLE_ROW_START) {
        row += 1;
        col = -1;
        cells[row] = [];
      } else if (c === T.TABLE_CELL_START) {
        col += 1;
        cellHasParagraph = false;
      } else if (c === T.PARAGRAPH && row >= 0 && col >= 0 && !cellHasParagraph) {
        cells[row][col] = byEnd.get(i);
        cellHasParagraph = true;
      }
    }
    const rows = cells.length;
    const cols = rows > 0 ? Math.round(cells.reduce((n, r) => n + r.length, 0) / rows) : 0;
    return { rows, cols, cells };
  });

  return {
    paragraphs,
    tables: tableInfos,
    sections,
    headerText: Object.values(data.headers ?? {}).map((h) => cleanText(h.body?.dataStream ?? '')).join(' ').trim(),
    footerText: Object.values(data.footers ?? {}).map((f) => cleanText(f.body?.dataStream ?? '')).join(' ').trim(),
    defaults,
    stream,
    // "=Text" verlangt einen exakten Treffer (z. B. für Tabellenzellen), sonst zählt der Textanfang
    find: (prefix) =>
      prefix.startsWith('=')
        ? paragraphs.find((p) => p.text.trim() === prefix.slice(1).trim())
        : paragraphs.find((p) => p.text.trim().startsWith(prefix.trim())),
  };
}

export function readFromFDocument(fDocument: FDocument): LayoutDocument {
  return readLayoutDocument(fDocument.save());
}

// ---------- Hilfsfunktionen für die Prüfungen ----------

/** Wert einer Zeicheneigenschaft, sofern er im ganzen Absatz einheitlich ist. */
function uniform<K extends keyof ITextStyle>(p: LayoutParagraph | undefined, key: K): ITextStyle[K] | undefined | 'mixed' {
  if (!p) return undefined;
  // Hoch-/tiefgestellte Zeichen (Fußnotenzeichen, m²) zählen bei Schriftart und -größe nicht mit
  const ignoreScript = key === 'ff' || key === 'fs';
  const vals = p.charStyles
    .filter((s, i) => p.text[i]?.trim() && !(ignoreScript && s.va != null && s.va !== BaselineOffset.NORMAL))
    .map((s) => JSON.stringify(s[key] ?? null));
  if (vals.length === 0) return undefined;
  return vals.every((v) => v === vals[0]) ? (JSON.parse(vals[0]) ?? undefined) : 'mixed';
}

export const isBold = (p?: LayoutParagraph) => uniform(p, 'bl') === BooleanNumber.TRUE;
export const isItalic = (p?: LayoutParagraph) => uniform(p, 'it') === BooleanNumber.TRUE;
export const isUnderlined = (p?: LayoutParagraph) => {
  const ul = uniform(p, 'ul');
  return !!ul && ul !== 'mixed' && (ul as { s?: number }).s === BooleanNumber.TRUE;
};
export const fontOf = (p?: LayoutParagraph) => uniform(p, 'ff');
export const sizeOf = (p?: LayoutParagraph) => uniform(p, 'fs');
export const rgbOf = (p?: LayoutParagraph): string | undefined => {
  const cl = uniform(p, 'cl');
  return cl && cl !== 'mixed' ? ((cl as { rgb?: string }).rgb ?? undefined) : undefined;
};
export const highlightOf = (p?: LayoutParagraph): string | undefined => {
  const bg = uniform(p, 'bg');
  return bg && bg !== 'mixed' ? ((bg as { rgb?: string }).rgb ?? undefined) : undefined;
};
export const isCentered = (p?: LayoutParagraph) => p?.align === HorizontalAlign.CENTER;
export const isRight = (p?: LayoutParagraph) => p?.align === HorizontalAlign.RIGHT;
export const isJustified = (p?: LayoutParagraph) => p?.align === HorizontalAlign.JUSTIFIED || p?.align === HorizontalAlign.BOTH;

export function hexToRgb(hex: string): [number, number, number] | null {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) {
    const rgb = /rgb\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/i.exec(hex);
    return rgb ? [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])] : null;
  }
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export type ColorFamily = 'red' | 'blue' | 'green' | 'orange' | 'yellow' | 'gray' | 'black' | 'other';

/** Ordnet eine Farbe grob einer Farbfamilie zu, damit jede passende Palettenfarbe akzeptiert wird. */
export function colorFamily(hex?: string): ColorFamily {
  const c = hex ? hexToRgb(hex) : null;
  if (!c) return 'black';
  const [r, g, b] = c.map((v) => v / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  if (l < 0.1) return 'black';
  const sat = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  if (sat < 0.2) return l > 0.9 ? 'other' : 'gray';
  let h: number;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
  else if (max === g) h = ((b - r) / d + 2) * 60;
  else h = ((r - g) / d + 4) * 60;
  if (h < 15 || h >= 340) return 'red';
  if (h < 45) return 'orange';
  if (h < 70) return 'yellow';
  if (h < 175) return 'green';
  if (h >= 200 && h < 260) return 'blue';
  return 'other';
}
export const colorIs = (p: LayoutParagraph | undefined, fam: ColorFamily) => colorFamily(rgbOf(p)) === fam;

// ---------- Absatz, Seite, Abschnitte ----------

/** Vergleich von px-Werten mit kleiner Toleranz (Eingaben werden teils gerundet). */
export const near = (value: number | undefined, target: number, tolerance = 1.5) => value != null && Math.abs(value - target) <= tolerance;

/** Zeilenabstand als Mehrfaches (z. B. 1,5 Zeilen). */
export const lineSpacingIs = (p: LayoutParagraph | undefined, multiple: number) =>
  !!p && p.spacingRule === SpacingRule.AUTO && p.lineSpacing != null && Math.abs(p.lineSpacing - multiple) < 0.01;

/** Zeichenformat an einer Stelle: `offset` Zeichen nach dem Beginn von `needle` im Absatz. */
export function styleAt(p: LayoutParagraph | undefined, needle: string, offset = 0): ITextStyle | undefined {
  if (!p) return undefined;
  const i = p.text.indexOf(needle);
  return i === -1 ? undefined : p.charStyles[i + offset];
}

export const isSuperscript = (ts?: ITextStyle) => ts?.va === BaselineOffset.SUPERSCRIPT;

/** Steht direkt vor `phrase` (Leerzeichen ignoriert) ein manueller Spaltenumbruch? */
export function columnBreakBefore(doc: LayoutDocument, phrase: string): boolean {
  const i = doc.stream.indexOf(phrase);
  if (i <= 0) return false;
  let j = i - 1;
  while (j >= 0 && doc.stream[j] === ' ') j -= 1;
  return doc.stream[j] === T.COLUMN_BREAK;
}

/** Datum im Format TT.MM.JJ bzw. TT.MM.JJJJ. */
export const containsDate = (text: string) => /\b\d{1,2}\.\d{1,2}\.(\d{4}|\d{2})\b/.test(text);

/** Mindestens Vorname, Nachname und Klasse (drei Wörter neben dem Datum). */
export const containsNameAndClass = (text: string) =>
  text.replace(/\b\d{1,2}\.\d{1,2}\.(\d{4}|\d{2})\b/g, ' ').split(/[\s,;|·/-]+/).filter((w) => /[\p{L}\d]/u.test(w)).length >= 3;

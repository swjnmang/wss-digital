import type { IDocumentData, ITextStyle } from '@univerjs/core';
import { BooleanNumber, DataStreamTreeTokenType, HorizontalAlign, NamedStyleType } from '@univerjs/core';
import type { FDocument } from '@univerjs/docs/facade';

/** Gelesener Absatz des Schüler-Dokuments (Text + wirksame Formatierung). */
export interface LayoutParagraph {
  text: string;
  namedStyle: number;
  align: number;
  isList: boolean;
  listType: string;
  /** Zeichenformat pro Zeichen (Text ohne Absatzmarke). */
  charStyles: ITextStyle[];
  inTable: boolean;
}

export interface LayoutDocument {
  paragraphs: LayoutParagraph[];
  tables: { rows: number; cols: number }[];
  defaults: ITextStyle;
  /** Findet den Absatz, dessen Text mit `prefix` beginnt (mit "=" am Anfang: exakt gleich). */
  find: (prefix: string) => LayoutParagraph | undefined;
}

const T = DataStreamTreeTokenType;

export function readLayoutDocument(data: IDocumentData): LayoutDocument {
  const body = data.body;
  const stream = body?.dataStream ?? '';
  const paragraphsRaw = body?.paragraphs ?? [];
  const runs = body?.textRuns ?? [];
  const defaults: ITextStyle = data.documentStyle?.textStyle ?? {};
  const tables = body?.tables ?? [];

  const paragraphs: LayoutParagraph[] = [];
  let prevEnd = -1;
  for (const p of paragraphsRaw) {
    const start = prevEnd + 1;
    const end = p.startIndex;
    prevEnd = end;
    // Steuerzeichen (Tabellen-/Zellgrenzen) gehören nicht zum Text
    let textStart = start;
    while (textStart < end && stream.charCodeAt(textStart) < 32) textStart += 1;
    const text = stream.slice(textStart, end);
    const charStyles: ITextStyle[] = [];
    for (let i = textStart; i < end; i++) {
      const run = runs.find((r) => r.st <= i && i < r.ed);
      charStyles.push({ ...defaults, ...(run?.ts ?? {}) });
    }
    const inTable = tables.some((t) => textStart >= t.startIndex && textStart < t.endIndex);
    paragraphs.push({
      text,
      namedStyle: p.paragraphStyle?.namedStyleType ?? NamedStyleType.NORMAL_TEXT,
      align: p.paragraphStyle?.horizontalAlign ?? HorizontalAlign.UNSPECIFIED,
      isList: !!p.bullet,
      listType: p.bullet?.listType ?? '',
      charStyles,
      inTable,
    });
  }

  const tableInfos = tables.map((t) => {
    const part = stream.slice(t.startIndex, t.endIndex);
    const rows = [...part].filter((c) => c === T.TABLE_ROW_START).length;
    const cells = [...part].filter((c) => c === T.TABLE_CELL_START).length;
    return { rows, cols: rows > 0 ? Math.round(cells / rows) : 0 };
  });

  return {
    paragraphs,
    tables: tableInfos,
    defaults,
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
  const vals = p.charStyles.filter((_, i) => p.text[i]?.trim()).map((s) => JSON.stringify(s[key] ?? null));
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

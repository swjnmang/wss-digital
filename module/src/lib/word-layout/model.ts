import type { IDocumentBody, IDocumentData, IParagraph, IParagraphStyle, ISectionBreak, ITextStyle } from '@univerjs/core';
import { ColumnSeparatorType, DataStreamTreeTokenType, SectionType } from '@univerjs/core';

/**
 * Neutrales Abbild eines Univer-Dokuments für die Exporte (Word und PDF):
 * Abschnitte → Blöcke (Absätze / Tabellen) → Textstücke mit Zeichenformat.
 */

export interface ExportRun {
  text: string;
  style: ITextStyle;
  /** Manueller Spaltenumbruch vor diesem Textstück. */
  columnBreak?: boolean;
}

export interface ExportParagraph {
  type: 'paragraph';
  runs: ExportRun[];
  style: IParagraphStyle;
  bullet?: { listType: string; listId: string; level: number };
}

export interface ExportTable {
  type: 'table';
  /** Spaltenbreiten in px. */
  columnWidths: number[];
  rows: ExportParagraph[][][];
}

export type ExportBlock = ExportParagraph | ExportTable;

export interface ExportSection {
  blocks: ExportBlock[];
  columns: number;
  /** Spaltenabstand in px. */
  columnGap: number;
  separator: boolean;
  margins: { top: number; bottom: number; left: number; right: number };
  /** Abschnitt beginnt auf einer neuen Seite (Univer: Typ am Abschnittsumbruch, wie in Word). */
  newPage: boolean;
}

export interface ExportDocument {
  pageWidth: number;
  pageHeight: number;
  defaults: ITextStyle;
  sections: ExportSection[];
  header: ExportBlock[];
  footer: ExportBlock[];
  /** Abstand der Kopf-/Fußzeile vom Seitenrand in px. */
  marginHeader: number;
  marginFooter: number;
}

const T = DataStreamTreeTokenType;
const NO_STYLE: ITextStyle = {};

function paragraphFrom(body: IDocumentBody, from: number, to: number, paragraph: IParagraph | undefined): ExportParagraph {
  const runs: ExportRun[] = [];
  const textRuns = body.textRuns ?? [];
  let pendingBreak = false;
  for (let i = from; i < to; i++) {
    const c = body.dataStream[i];
    if (c === T.COLUMN_BREAK) {
      pendingBreak = true;
      continue;
    }
    if (c.charCodeAt(0) < 32 && c !== '\t') continue;
    const run = textRuns.find((r) => r.st <= i && i < r.ed);
    const style = run?.ts ?? NO_STYLE;
    const last = runs[runs.length - 1];
    if (last && !pendingBreak && last.style === style) last.text += c;
    else runs.push({ text: c, style, columnBreak: pendingBreak || undefined });
    pendingBreak = false;
  }
  // Ein Spaltenumbruch am Absatzende wirkt auf den nächsten Absatz – hier als leeres Stück erhalten
  if (pendingBreak) runs.push({ text: '', style: {}, columnBreak: true });
  return {
    type: 'paragraph',
    runs,
    style: paragraph?.paragraphStyle ?? {},
    bullet: paragraph?.bullet ? { listType: paragraph.bullet.listType, listId: paragraph.bullet.listId, level: paragraph.bullet.nestingLevel ?? 0 } : undefined,
  };
}

/** Zerlegt einen Dokumentkörper in Blöcke; `onSection` wird an jedem Abschnittsende (außerhalb von Tabellen) aufgerufen. */
function walkBody(data: Pick<IDocumentData, 'tableSource'>, body: IDocumentBody, onSection?: (blocks: ExportBlock[], sectionBreak: ISectionBreak | undefined) => void): ExportBlock[] {
  const stream = body.dataStream;
  const paragraphByEnd = new Map((body.paragraphs ?? []).map((p) => [p.startIndex, p]));
  const sectionByIndex = new Map((body.sectionBreaks ?? []).map((s) => [s.startIndex, s]));
  const tables = body.tables ?? [];
  let blocks: ExportBlock[] = [];
  let paraStart = 0;

  for (let i = 0; i < stream.length; i++) {
    const c = stream[i];
    if (c === T.TABLE_START) {
      const table = tables.find((t) => t.startIndex === i);
      if (table) {
        const source = data.tableSource?.[table.tableId];
        const rows: ExportParagraph[][][] = [];
        let cellStart = 0;
        for (let j = i; j < table.endIndex; j++) {
          const t = stream[j];
          if (t === T.TABLE_ROW_START) rows.push([]);
          else if (t === T.TABLE_CELL_START) {
            rows[rows.length - 1]?.push([]);
            cellStart = j + 1;
          } else if (t === T.PARAGRAPH) {
            const row = rows[rows.length - 1];
            row?.[row.length - 1]?.push(paragraphFrom(body, cellStart, j, paragraphByEnd.get(j)));
            cellStart = j + 1;
          } else if (t === T.SECTION_BREAK) cellStart = j + 1;
        }
        blocks.push({
          type: 'table',
          columnWidths: (source?.tableColumns ?? []).map((col) => col.size?.width?.v ?? 0),
          rows,
        });
        i = table.endIndex - 1;
        paraStart = table.endIndex;
        continue;
      }
    }
    if (c === T.PARAGRAPH) {
      blocks.push(paragraphFrom(body, paraStart, i, paragraphByEnd.get(i)));
      paraStart = i + 1;
    } else if (c === T.SECTION_BREAK) {
      onSection?.(blocks, sectionByIndex.get(i));
      if (onSection) blocks = [];
      paraStart = i + 1;
    }
  }
  return blocks;
}

export function toExportDocument(data: IDocumentData): ExportDocument {
  const ds = data.documentStyle ?? {};
  const sections: ExportSection[] = [];
  if (data.body) {
    walkBody(data, data.body, (blocks, s) => {
      const cols = s?.columnProperties ?? [];
      sections.push({
        blocks,
        columns: Math.max(1, cols.length),
        columnGap: cols.length > 1 ? cols[0].paddingEnd : 0,
        separator: s?.columnSeparatorType === ColumnSeparatorType.BETWEEN_EACH_COLUMN,
        newPage: sections.length > 0 && s?.sectionType !== SectionType.CONTINUOUS && s?.sectionType !== SectionType.NEXT_COLUMN,
        margins: {
          top: s?.marginTop ?? ds.marginTop ?? 0,
          bottom: s?.marginBottom ?? ds.marginBottom ?? 0,
          left: s?.marginLeft ?? ds.marginLeft ?? 0,
          right: s?.marginRight ?? ds.marginRight ?? 0,
        },
      });
    });
  }

  const firstWithText = (parts: Record<string, { body?: IDocumentBody }> | undefined) => {
    for (const part of Object.values(parts ?? {})) {
      if (!part.body) continue;
      const blocks = walkBody(data, part.body);
      if (blocks.some((b) => b.type === 'table' || b.runs.some((r) => r.text.trim()))) return blocks;
    }
    return [];
  };

  return {
    pageWidth: ds.pageSize?.width ?? 793.8,
    pageHeight: ds.pageSize?.height ?? 1122.5,
    defaults: ds.textStyle ?? {},
    sections,
    header: firstWithText(data.headers),
    footer: firstWithText(data.footers),
    marginHeader: ds.marginHeader ?? 30,
    marginFooter: ds.marginFooter ?? 30,
  };
}

/** Farbe als „RRGGBB“ (ohne #) oder undefined. */
export function hexColor(value?: string | null | void): string | undefined {
  if (!value) return undefined;
  const hex = /^#?([0-9a-f]{6})$/i.exec(value.trim());
  if (hex) return hex[1].toUpperCase();
  const short = /^#?([0-9a-f]{3})$/i.exec(value.trim());
  if (short) return short[1].split('').map((ch) => ch + ch).join('').toUpperCase();
  const rgb = /rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)/i.exec(value);
  if (rgb) return [rgb[1], rgb[2], rgb[3]].map((n) => Number(n).toString(16).padStart(2, '0')).join('').toUpperCase();
  return undefined;
}

/** Univer-Standardgrößen der Formatvorlagen (pt), damit Exporte ähnlich aussehen. */
export const NAMED_STYLE_LOOK: Record<number, { fs: number; bold?: boolean; color?: string }> = {
  2: { fs: 26 },
  3: { fs: 15, color: '666666' },
  4: { fs: 20, bold: true },
  5: { fs: 16, bold: true },
  6: { fs: 14, bold: true },
  7: { fs: 12, bold: true },
  8: { fs: 11, bold: true },
};

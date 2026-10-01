import type { IDocumentData, IParagraph, ISectionBreak, ITable, ITableCell, ITextRun, ITextStyle } from '@univerjs/core';
import {
  BooleanNumber,
  DataStreamTreeTokenType,
  DocumentFlavor,
  HorizontalAlign,
  TableAlignmentType,
  TableRowHeightRule,
  TableSizeType,
  TableTextWrapType,
  ObjectRelativeFromH,
  ObjectRelativeFromV,
  createParagraphId,
  createSectionId,
} from '@univerjs/core';
import type { LayoutMargins, LayoutParagraphSeed, LayoutSeed, LayoutTableSeed, LayoutTask } from './types';

// 1 cm = 567 twips, Univer rechnet die Seitenmaße in px (15 twips = 1 px)
export const cmToPx = (cm: number) => (cm * 567) / 15;

const T = DataStreamTreeTokenType;
const PAGE_WIDTH_CM = 21;
const DEFAULT_MARGINS: LayoutMargins = { top: 2.5, bottom: 2, left: 2.5, right: 2.5 };

const HORIZONTAL: Record<NonNullable<LayoutParagraphSeed['align']>, HorizontalAlign> = {
  left: HorizontalAlign.LEFT,
  center: HorizontalAlign.CENTER,
  right: HorizontalAlign.RIGHT,
  justify: HorizontalAlign.JUSTIFIED,
};

const isTableSeed = (seed: LayoutSeed): seed is LayoutTableSeed => 'table' in seed;

const cellMargin = () => ({ start: { v: 10 }, end: { v: 10 }, top: { v: 5 }, bottom: { v: 5 } });

function runStyle(seed: { bold?: boolean; italic?: boolean; font?: string; size?: number }): ITextStyle {
  const ts: ITextStyle = {};
  if (seed.bold) ts.bl = BooleanNumber.TRUE;
  if (seed.italic) ts.it = BooleanNumber.TRUE;
  if (seed.font) ts.ff = seed.font;
  if (seed.size) ts.fs = seed.size;
  return ts;
}

/**
 * Baut das Ausgangsdokument für eine Layout-Aufgabe. Der Text ist vorgegeben und
 * bewusst unformatiert; die Schüler:innen formatieren direkt im Univer-Editor.
 * Tabellen werden in derselben Struktur angelegt, die Univer beim Einfügen erzeugt.
 */
export function buildLayoutDocumentData(task: Pick<LayoutTask, 'id' | 'title' | 'paragraphs' | 'margins' | 'baseFont'>): Partial<IDocumentData> {
  const margins = task.margins ?? DEFAULT_MARGINS;
  const contentWidth = cmToPx(PAGE_WIDTH_CM - margins.left - margins.right);

  let dataStream = '';
  const paragraphs: IParagraph[] = [];
  const textRuns: ITextRun[] = [];
  const sectionBreaks: ISectionBreak[] = [];
  const tables: { startIndex: number; endIndex: number; tableId: string }[] = [];
  const tableSource: Record<string, ITable> = {};
  const usedParagraphIds = new Set<string>();
  const usedSectionIds = new Set<string>();

  const addParagraph = (style: IParagraph['paragraphStyle']) => {
    const paragraphId = createParagraphId(usedParagraphIds);
    usedParagraphIds.add(paragraphId);
    paragraphs.push({ startIndex: dataStream.length, paragraphId, paragraphStyle: style });
    dataStream += T.PARAGRAPH;
  };
  const addSectionBreak = () => {
    const sectionId = createSectionId(usedSectionIds);
    usedSectionIds.add(sectionId);
    sectionBreaks.push({ sectionId, startIndex: dataStream.length });
    dataStream += T.SECTION_BREAK;
  };
  const addText = (text: string, ts: ITextStyle) => {
    const start = dataStream.length;
    dataStream += text;
    if (text.length > 0 && Object.keys(ts).length > 0) textRuns.push({ st: start, ed: dataStream.length, ts });
  };

  for (const seed of task.paragraphs) {
    if (isTableSeed(seed)) {
      const tableId = `tbl${tables.length + 1}`;
      const cols = Math.max(...seed.table.map((r) => r.length));
      const startIndex = dataStream.length;
      dataStream += T.TABLE_START;
      for (const row of seed.table) {
        dataStream += T.TABLE_ROW_START;
        for (let c = 0; c < cols; c++) {
          dataStream += T.TABLE_CELL_START;
          addText(row[c] ?? '', runStyle(seed));
          addParagraph({ spaceAbove: { v: 3 }, lineSpacing: 1, spaceBelow: { v: 3 } });
          addSectionBreak();
          dataStream += T.TABLE_CELL_END;
        }
        dataStream += T.TABLE_ROW_END;
      }
      dataStream += T.TABLE_END;
      tables.push({ startIndex, endIndex: dataStream.length, tableId });
      tableSource[tableId] = {
        tableId,
        tableRows: seed.table.map(() => ({
          tableCells: Array.from({ length: cols }, (): ITableCell => ({ margin: cellMargin() })),
          trHeight: { val: { v: 30 }, hRule: TableRowHeightRule.AUTO },
        })),
        tableColumns: Array.from({ length: cols }, () => ({
          size: { type: TableSizeType.SPECIFIED, width: { v: contentWidth / cols } },
        })),
        align: TableAlignmentType.START,
        indent: { v: 0 },
        textWrap: TableTextWrapType.NONE,
        position: {
          positionH: { relativeFrom: ObjectRelativeFromH.PAGE, posOffset: 0 },
          positionV: { relativeFrom: ObjectRelativeFromV.PAGE, posOffset: 0 },
        },
        dist: { distB: 0, distL: 0, distR: 0, distT: 0 },
        cellMargin: cellMargin(),
        size: { type: TableSizeType.UNSPECIFIED, width: { v: contentWidth } },
      };
      // Univer schließt eine Tabelle immer mit einem leeren Absatz ab
      addParagraph(undefined);
      continue;
    }

    addText(seed.text, runStyle(seed));
    const style: NonNullable<IParagraph['paragraphStyle']> = { spaceBelow: { v: seed.spaceBelow ?? 8 } };
    if (seed.align) style.horizontalAlign = HORIZONTAL[seed.align];
    if (seed.lineSpacing) style.lineSpacing = seed.lineSpacing;
    addParagraph(style);
  }

  addSectionBreak();

  return {
    id: task.id,
    title: task.title,
    documentStyle: {
      documentFlavor: DocumentFlavor.TRADITIONAL,
      pageSize: { width: cmToPx(PAGE_WIDTH_CM), height: cmToPx(29.7) },
      marginTop: cmToPx(margins.top),
      marginBottom: cmToPx(margins.bottom),
      marginLeft: cmToPx(margins.left),
      marginRight: cmToPx(margins.right),
      textStyle: { ff: task.baseFont?.family ?? 'Arial', fs: task.baseFont?.size ?? 11 },
    },
    tableSource,
    body: {
      dataStream,
      paragraphs,
      textRuns,
      tables,
      sectionBreaks,
    },
  };
}

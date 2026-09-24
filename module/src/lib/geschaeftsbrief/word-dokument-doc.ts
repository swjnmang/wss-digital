import type { FDocument } from '@univerjs/docs/facade';
import type {
  IDocumentData,
  IParagraph,
  ISectionBreak,
  ITable,
  ITableCell,
  ITableRow,
  ITextRun,
  ITextStyle,
} from '@univerjs/core';
import {
  BooleanNumber,
  DataStreamTreeTokenType,
  DocumentFlavor,
  ObjectRelativeFromH,
  ObjectRelativeFromV,
  SpacingRule,
  TableAlignmentType,
  TableLayoutType,
  TableRowHeightRule,
  TableSizeType,
  TableTextWrapType,
  createParagraphId,
  createSectionId,
} from '@univerjs/core';
import type { WordDokumentTask } from './word-dokument-tasks';

/**
 * One line ("paragraph") of the DIN-5008 letter document.
 *
 * The same plan drives both seeding (`applyTaskToDocument`/`buildInitialDocumentData`)
 * and grading (`word-dokument-grading.ts`), so the labels the student sees are exactly
 * the labels grading looks for. See the architecture note in
 * `word-dokument-grading.ts` for why this is text-position based rather than
 * relying on Univer's per-range document protection.
 *
 * The Anschriftenfeld and Infoblock fields (`section: 'anschriftenfeld' | 'infoblock'`)
 * are seeded inside the DIN-5008 header table built by `buildInitialDocumentData`,
 * not as flat top-level paragraphs — see that function for how this plan's field
 * entries are placed into the table's cells. Grading does not care about physical
 * position and simply searches the whole document body for each field's label.
 */
export type LetterLine =
  | { kind: 'static'; text: string; style: 'heading' }
  | { kind: 'blank' }
  | {
      kind: 'field';
      fieldId: string;
      label: string;
      expected: string;
      explanation: string;
      section: 'anschriftenfeld' | 'infoblock' | 'betreff' | 'anrede' | 'grussformel';
    }
  | { kind: 'field-date'; fieldId: 'datum'; label: string; explanation: string; section: 'infoblock' }
  | { kind: 'brieftext-marker'; boundary: 'start' | 'end'; text: string }
  | { kind: 'brieftext-placeholder' };

export const BRIEFTEXT_START_MARKER = 'Brieftext (bitte hier eintippen):';
export const BRIEFTEXT_END_MARKER = 'Grußformel & Unterschrift:';
export const BRIEFTEXT_PLACEHOLDER = '[Hier den vorgegebenen Brieftext vollständig abtippen …]';

/**
 * Builds the ordered list of lines that make up the editable DIN-5008 letter for a task.
 *
 * The Anschriftenfeld and Infoblock fields are listed here (for grading) but are
 * seeded into the header table's cells rather than as flat paragraphs — see
 * `buildInitialDocumentData`.
 */
export function buildLetterPlan(task: WordDokumentTask): LetterLine[] {
  const lines: LetterLine[] = [];

  // 1. Anschriftenfeld (editable, seeded into the table's address-field cell)
  for (const line of task.anschriftenfeld) {
    lines.push({
      kind: 'field',
      fieldId: line.id,
      label: line.caption,
      expected: line.expected,
      explanation: line.explanation,
      section: 'anschriftenfeld',
    });
  }

  // 2. Infoblock (editable, seeded into the table's Infoblock cell) inkl. Datum (heute-Prüfung)
  for (const line of task.infoblock) {
    // All infoblock lines in the current task data are plain text lines; other
    // `InfoblockLine` variants (choice/zeichen/name/email/date) are not used by
    // any of the four reused tasks, so they are skipped defensively here.
    if (line.type !== 'text') continue;
    lines.push({
      kind: 'field',
      fieldId: line.id,
      label: line.caption,
      expected: line.expected,
      explanation: line.explanation,
      section: 'infoblock',
    });
  }
  lines.push({
    kind: 'field-date',
    fieldId: 'datum',
    label: 'Datum',
    explanation: 'Beim Datum steht das heutige Tagesdatum im Format TT.MM.JJJJ.',
    section: 'infoblock',
  });

  // 3. Betreff
  lines.push({ kind: 'static', text: '3. Betreff', style: 'heading' });
  for (const line of task.betreff) {
    lines.push({
      kind: 'field',
      fieldId: line.id,
      label: line.caption,
      expected: line.expected,
      explanation: line.explanation,
      section: 'betreff',
    });
  }
  lines.push({ kind: 'blank' });

  // 4. Anrede
  lines.push({ kind: 'static', text: '4. Anrede', style: 'heading' });
  for (const line of task.anrede) {
    lines.push({
      kind: 'field',
      fieldId: line.id,
      label: line.caption,
      expected: line.expected,
      explanation: line.explanation,
      section: 'anrede',
    });
  }
  lines.push({ kind: 'blank' });

  // 5. Brieftext (freier, mehrzeiliger Fließtext zwischen zwei Markern)
  lines.push({ kind: 'static', text: '5. Brieftext', style: 'heading' });
  lines.push({ kind: 'brieftext-marker', boundary: 'start', text: BRIEFTEXT_START_MARKER });
  lines.push({ kind: 'brieftext-placeholder' });
  lines.push({ kind: 'blank' });

  // 6. Grußformel & Unterschrift (der End-Marker ist zugleich die Überschrift dieses Abschnitts)
  lines.push({ kind: 'brieftext-marker', boundary: 'end', text: BRIEFTEXT_END_MARKER });
  for (const line of task.grussformel) {
    lines.push({
      kind: 'field',
      fieldId: line.id,
      label: line.caption,
      expected: line.expected,
      explanation: line.explanation,
      section: 'grussformel',
    });
  }
  lines.push({ kind: 'blank' });
  lines.push({ kind: 'blank' });

  return lines;
}

/** The text initially written into a `field` line's paragraph (label + editable placeholder). */
export function fieldParagraphSeedText(label: string): string {
  return `${label}: `;
}

const GRAY = { rgb: '#8a8f98' };

// ---------------------------------------------------------------------------
// DIN-5008 header table geometry
//
// These are the exact OOXML measurements read out of the school's reference
// .dotx template (`word/document.xml`, in twips = 1/1440 inch), converted to
// the 96-DPI layout pixels the Univer Docs data model uses everywhere
// (`px = twips / 1440 * 96 = twips / 15`).
// ---------------------------------------------------------------------------
const TWIPS_PER_PX = 15;
const twipsToPx = (twips: number) => twips / TWIPS_PER_PX;
/** `ITextStyle.fs` / point-based paragraph spacing values are already in pt; only line-height-as-px needs this. */
const ptToPx = (pt: number) => (pt * 96) / 72;

const PAGE_WIDTH_TWIPS = 11906;
const PAGE_HEIGHT_TWIPS = 16838;
const MARGIN_TOP_TWIPS = 2835;
const MARGIN_RIGHT_TWIPS = 851;
const MARGIN_BOTTOM_TWIPS = 1134;
const MARGIN_LEFT_TWIPS = 1418;
const MARGIN_HEADER_TWIPS = 709;
const MARGIN_FOOTER_TWIPS = 283;

const TABLE_WIDTH_TWIPS = 9639;
const COL1_ANSCHRIFT_TWIPS = 4461; // ≈ 7.87 cm
const COL2_GAP_TWIPS = 1985; // ≈ 3.50 cm
const COL3_INFOBLOCK_TWIPS = 3193; // ≈ 5.63 cm
const ROW2_HEIGHT_TWIPS = 1774; // ≈ 3.13 cm, exact

/** `spacingRule: EXACT` line height matching the template's `lineRule="exact" line="240"` (12pt). */
const EXACT_12PT_SPACING = { spacingRule: SpacingRule.EXACT, lineSpacing: ptToPx(12) };

/** Page setup for a fresh document, matching the reference template's A4 + DIN-5008 margins. */
export function buildDocumentStyle(): IDocumentData['documentStyle'] {
  return {
    documentFlavor: DocumentFlavor.TRADITIONAL,
    pageSize: { width: twipsToPx(PAGE_WIDTH_TWIPS), height: twipsToPx(PAGE_HEIGHT_TWIPS) },
    marginTop: twipsToPx(MARGIN_TOP_TWIPS),
    marginRight: twipsToPx(MARGIN_RIGHT_TWIPS),
    marginBottom: twipsToPx(MARGIN_BOTTOM_TWIPS),
    marginLeft: twipsToPx(MARGIN_LEFT_TWIPS),
    marginHeader: twipsToPx(MARGIN_HEADER_TWIPS),
    marginFooter: twipsToPx(MARGIN_FOOTER_TWIPS),
  };
}

/** One paragraph's seed content for a table cell: text plus how much of its start is a styled label. */
interface CellParagraphSpec {
  text: string;
  /** Font size in pt for the whole paragraph (matches the template's 8pt/10pt cell text). */
  fs?: number;
  /** When set, the first `labelLength` characters get bold+gray "template label" styling. */
  labelLength?: number;
}

/** Builds the (text, style-split) specs for one Infoblock/Anschriftenfeld field line. */
function fieldSpec(label: string, fs?: number): CellParagraphSpec {
  const labelWithColon = `${label}:`;
  return { text: fieldParagraphSeedText(label), fs, labelLength: labelWithColon.length };
}

/**
 * Low-level builder for the raw document data stream (`\x1A`/`\x1B`/`\x1C` table
 * tokens, per Univer's `DataStreamTreeTokenType`). There is no Facade API to
 * create or populate a table (`FDocument` exposes no `insertTable`), so the
 * DIN-5008 header table is built directly as `IDocumentData` and handed to
 * `univerAPI.createDocument()` — the same raw model the Docs UI's own
 * "insert table" command builds internally (mirrored here from
 * `@univerjs/docs-ui`'s `genEmptyTable`/`genTableSource` helpers).
 */
class RawStreamBuilder {
  dataStream = '';
  paragraphs: IParagraph[] = [];
  textRuns: ITextRun[] = [];
  sectionBreaks: ISectionBreak[] = [];
  private paragraphIds = new Set<string>();
  private sectionIds = new Set<string>();

  get cursor() {
    return this.dataStream.length;
  }

  /** Appends one paragraph's text (with an optional styled label prefix) and its trailing `\r`. */
  paragraph(spec: CellParagraphSpec) {
    const start = this.cursor;
    this.dataStream += spec.text;
    if (spec.text.length > 0) {
      const baseStyle: ITextStyle | null = spec.fs != null ? { fs: spec.fs } : null;
      if (spec.labelLength && spec.labelLength > 0) {
        this.textRuns.push({
          st: start,
          ed: start + spec.labelLength,
          ts: { ...(baseStyle ?? {}), bl: BooleanNumber.TRUE, cl: GRAY },
        });
        if (spec.labelLength < spec.text.length && baseStyle) {
          this.textRuns.push({ st: start + spec.labelLength, ed: start + spec.text.length, ts: baseStyle });
        }
      } else if (baseStyle) {
        this.textRuns.push({ st: start, ed: start + spec.text.length, ts: baseStyle });
      }
    }
    const crPos = this.cursor;
    this.dataStream += DataStreamTreeTokenType.PARAGRAPH;
    this.paragraphs.push({ startIndex: crPos, paragraphId: createParagraphId(this.paragraphIds) });
  }

  /** Table-cell section break token (one per cell, right before its `TABLE_CELL_END`). */
  sectionBreak() {
    const pos = this.cursor;
    this.dataStream += DataStreamTreeTokenType.SECTION_BREAK;
    this.sectionBreaks.push({ sectionId: createSectionId(this.sectionIds), startIndex: pos });
  }

  raw(token: string) {
    this.dataStream += token;
  }
}

function buildTableCell(
  builder: RawStreamBuilder,
  paragraphSpecs: CellParagraphSpec[],
  options: { exactLineSpacing?: boolean; rowSpan?: number } = {},
): ITableCell {
  builder.raw(DataStreamTreeTokenType.TABLE_CELL_START);
  const paragraphStyle = options.exactLineSpacing
    ? { ...EXACT_12PT_SPACING, spaceAbove: { v: 0 }, spaceBelow: { v: 0 } }
    : undefined;
  const specs = paragraphSpecs.length > 0 ? paragraphSpecs : [{ text: '' }];
  for (const spec of specs) {
    builder.paragraph(spec);
    if (paragraphStyle) {
      builder.paragraphs[builder.paragraphs.length - 1].paragraphStyle = paragraphStyle;
    }
  }
  builder.sectionBreak();
  builder.raw(DataStreamTreeTokenType.TABLE_CELL_END);
  const cell: ITableCell = { margin: { start: { v: 0 }, end: { v: 0 }, top: { v: 0 }, bottom: { v: 0 } } };
  if (options.rowSpan != null) cell.rowSpan = options.rowSpan;
  return cell;
}

interface AddressInfoTableResult {
  dataStream: string;
  paragraphs: IParagraph[];
  textRuns: ITextRun[];
  sectionBreaks: ISectionBreak[];
  tableId: string;
  table: ITable;
  /** Exclusive offset immediately after the table's closing `TABLE_END` token. */
  endIndex: number;
}

/**
 * Builds the DIN-5008 header table: a fixed 3-column, 2-row table replicating
 * the reference template's Anschriftenfeld (top-left) / gap / Infoblock
 * (top-right, row-spanning) layout, column widths, exact row height and 8pt
 * "exact" line spacing.
 */
function buildAddressInfoTable(
  task: WordDokumentTask,
  anschriftenfeldFields: Extract<LetterLine, { kind: 'field' }>[],
  infoblockLines: (Extract<LetterLine, { kind: 'field' | 'field-date' }>)[],
): AddressInfoTableResult {
  const builder = new RawStreamBuilder();
  builder.raw(DataStreamTreeTokenType.TABLE_START);

  // Infoblock cell content: 4 "…Zeichen/Nachricht vom" fields, a 10pt spacer,
  // a static (ungraded) "Name:" label, Telefon/Fax/E-Mail, an 8pt spacer, Datum.
  const [ihrZeichen, ihreNachrichtVom, unserZeichen, unsereNachrichtVom, telefon, fax, email, datum] = infoblockLines;
  const infoblockSpecs: CellParagraphSpec[] = [
    fieldSpec(ihrZeichen.label, 8),
    fieldSpec(ihreNachrichtVom.label, 8),
    fieldSpec(unserZeichen.label, 8),
    fieldSpec(unsereNachrichtVom.label, 8),
    { text: '', fs: 10 },
    fieldSpec('Name', 8),
    fieldSpec(telefon.label, 8),
    fieldSpec(fax.label, 8),
    fieldSpec(email.label, 8),
    { text: '', fs: 8 },
    fieldSpec(datum.label, 8),
  ];

  // Row 1
  builder.raw(DataStreamTreeTokenType.TABLE_ROW_START);
  const senderSpecs: CellParagraphSpec[] = [
    { text: '', fs: 8 },
    { text: '', fs: 8 },
    { text: '', fs: 8 },
    { text: '', fs: 8 },
    { text: task.senderLine, fs: 8 },
  ];
  const row1Col1 = buildTableCell(builder, senderSpecs);
  const row1Col2 = buildTableCell(builder, [{ text: '' }], { exactLineSpacing: true });
  const row1Col3 = buildTableCell(builder, infoblockSpecs, { exactLineSpacing: true, rowSpan: 2 });
  builder.raw(DataStreamTreeTokenType.TABLE_ROW_END);

  // Row 2 (the Anschriftenfeld window students type the recipient's address into)
  builder.raw(DataStreamTreeTokenType.TABLE_ROW_START);
  const row2Col1 = buildTableCell(
    builder,
    anschriftenfeldFields.map((line) => fieldSpec(line.label)),
  );
  const row2Col2 = buildTableCell(builder, [{ text: '' }]);
  const row2Col3 = buildTableCell(builder, [{ text: '' }], { rowSpan: 0 }); // covered by row1Col3's rowSpan
  builder.raw(DataStreamTreeTokenType.TABLE_ROW_END);

  builder.raw(DataStreamTreeTokenType.TABLE_END);
  const endIndex = builder.cursor;

  const tableId = `geschaeftsbrief-table-${task.id}`;
  const tableRows: ITableRow[] = [
    { tableCells: [row1Col1, row1Col2, row1Col3], trHeight: { val: { v: 1 }, hRule: TableRowHeightRule.AUTO } },
    {
      tableCells: [row2Col1, row2Col2, row2Col3],
      trHeight: { val: { v: twipsToPx(ROW2_HEIGHT_TWIPS) }, hRule: TableRowHeightRule.EXACT },
    },
  ];
  const table: ITable = {
    tableId,
    tableRows,
    tableColumns: [
      { size: { type: TableSizeType.SPECIFIED, width: { v: twipsToPx(COL1_ANSCHRIFT_TWIPS) } } },
      { size: { type: TableSizeType.SPECIFIED, width: { v: twipsToPx(COL2_GAP_TWIPS) } } },
      { size: { type: TableSizeType.SPECIFIED, width: { v: twipsToPx(COL3_INFOBLOCK_TWIPS) } } },
    ],
    align: TableAlignmentType.START,
    indent: { v: 0 },
    textWrap: TableTextWrapType.NONE,
    layout: TableLayoutType.FIXED,
    position: {
      positionH: { relativeFrom: ObjectRelativeFromH.PAGE, posOffset: 0 },
      positionV: { relativeFrom: ObjectRelativeFromV.PAGE, posOffset: 0 },
    },
    dist: { distB: 0, distL: 0, distR: 0, distT: 0 },
    cellMargin: { start: { v: 0 }, end: { v: 0 }, top: { v: 0 }, bottom: { v: 0 } },
    size: { type: TableSizeType.SPECIFIED, width: { v: twipsToPx(TABLE_WIDTH_TWIPS) } },
  };

  return {
    dataStream: builder.dataStream,
    paragraphs: builder.paragraphs,
    textRuns: builder.textRuns,
    sectionBreaks: builder.sectionBreaks,
    tableId,
    table,
    endIndex,
  };
}

/**
 * Builds the full initial `IDocumentData` for a task: A4/DIN-5008 page setup
 * plus the DIN-5008 header table (Anschriftenfeld + Infoblock), ready to pass
 * to `univerAPI.createDocument()`. Everything below the table (Betreff,
 * Anrede, Brieftext, Grußformel) is appended afterwards through the normal
 * Facade paragraph APIs in `applyTaskToDocument`.
 */
export function buildInitialDocumentData(task: WordDokumentTask): Partial<IDocumentData> {
  const plan = buildLetterPlan(task);
  const anschriftenfeldFields = plan.filter(
    (line): line is Extract<LetterLine, { kind: 'field' }> => line.kind === 'field' && line.section === 'anschriftenfeld',
  );
  const infoblockLines = plan.filter(
    (line): line is Extract<LetterLine, { kind: 'field' | 'field-date' }> =>
      (line.kind === 'field' || line.kind === 'field-date') && line.section === 'infoblock',
  );

  const tableResult = buildAddressInfoTable(task, anschriftenfeldFields, infoblockLines);

  // A single empty paragraph must follow the table (Word/Univer requirement, and
  // where the below-table content in `applyTaskToDocument` starts writing from).
  const trailingParagraphStart = tableResult.endIndex;
  const dataStream = `${tableResult.dataStream}${DataStreamTreeTokenType.PARAGRAPH}${DataStreamTreeTokenType.SECTION_BREAK}`;
  const paragraphs: IParagraph[] = [
    ...tableResult.paragraphs,
    { startIndex: trailingParagraphStart, paragraphId: createParagraphId(new Set(tableResult.paragraphs.map((p) => p.paragraphId))) },
  ];

  return {
    id: task.id,
    title: task.title,
    documentStyle: buildDocumentStyle(),
    tableSource: { [tableResult.tableId]: tableResult.table },
    body: {
      dataStream,
      paragraphs,
      textRuns: tableResult.textRuns,
      sectionBreaks: tableResult.sectionBreaks,
      tables: [{ startIndex: 0, endIndex: tableResult.endIndex, tableId: tableResult.tableId }],
    },
  };
}

/**
 * Writes the DIN-5008 letter structure into a Univer document that was created
 * from `buildInitialDocumentData` (so the header table already exists).
 *
 * There is no supported way (in this client-only Univer Docs build) to make
 * only part of a paragraph truly read-only — see the note in
 * `word-dokument-grading.ts`. Instead, static/template text is visually
 * distinguished (gray, italic, or bold heading) and editable field labels
 * are bold, while the actual value the student types stays plain, freely
 * editable text on the same line.
 */
export function applyTaskToDocument(fDocument: FDocument, task: WordDokumentTask) {
  const plan = buildLetterPlan(task);

  // The document was created with the header table already in place, followed
  // by exactly one empty paragraph (the last paragraph in the body). Reuse it
  // for the first below-table line instead of appending a redundant one.
  let first = true;

  const writeLine = (text: string) => {
    if (first) {
      first = false;
      const paragraphs = fDocument.getParagraphs();
      const paragraph = paragraphs[paragraphs.length - 1];
      paragraph.setText(text);
      return paragraph;
    }
    return fDocument.appendParagraph(text);
  };

  for (const line of plan) {
    // Anschriftenfeld/Infoblock fields already live inside the header table.
    if (
      (line.kind === 'field' && (line.section === 'anschriftenfeld' || line.section === 'infoblock')) ||
      (line.kind === 'field-date' && line.section === 'infoblock')
    ) {
      continue;
    }

    if (line.kind === 'blank') {
      writeLine('');
      continue;
    }

    if (line.kind === 'static') {
      const paragraph = writeLine(line.text);
      paragraph.getTextRange().setTextStyle({ bl: BooleanNumber.TRUE, fs: 11 });
      continue;
    }

    if (line.kind === 'field') {
      const paragraph = writeLine(fieldParagraphSeedText(line.label));
      const labelRange = paragraph.findText(line.label);
      labelRange?.setTextStyle({ bl: BooleanNumber.TRUE, cl: GRAY });
      continue;
    }

    if (line.kind === 'brieftext-marker') {
      const paragraph = writeLine(line.text);
      paragraph.getTextRange().setTextStyle({ bl: BooleanNumber.TRUE, fs: 11 });
      continue;
    }

    if (line.kind === 'brieftext-placeholder') {
      const paragraph = writeLine(BRIEFTEXT_PLACEHOLDER);
      paragraph.getTextRange().setTextStyle({ it: BooleanNumber.TRUE, cl: GRAY });
      continue;
    }
  }

  applyHeaderFooter(fDocument);
}

/**
 * Adds the school's letterhead (page header) and address/contact footer as
 * real page header/footer content via the Facade's `ensurePageHeader()` /
 * `ensurePageFooter()`, matching the reference template's `header1.xml` /
 * `footer1.xml`. This is a simple 3-line static block rather than the
 * template's exact 3-column tab-stopped footer table — see the README note
 * in the trainer's task description for why that finer detail was skipped.
 */
function applyHeaderFooter(fDocument: FDocument) {
  const headerSegmentId = fDocument.ensurePageHeader();
  const headerLines = ['Unser Unternehmen', 'Plinganserstraße 28', '81369 München'];
  const headerParagraphs = fDocument.getParagraphs(headerSegmentId);
  headerParagraphs[0]?.setText(headerLines[0]);
  for (const text of headerLines.slice(1)) {
    fDocument.appendParagraph(text, headerSegmentId);
  }
  for (const paragraph of fDocument.getParagraphs(headerSegmentId)) {
    paragraph.getTextRange().setTextStyle({ fs: 9, cl: GRAY });
  }

  const footerSegmentId = fDocument.ensurePageFooter();
  const footerLines = [
    'Anschrift: Meindlstraße 8 a, 81373 München · Tel. 089 2388768-0 · Fax 089 2388768-22',
    'E-Mail: ws-staatlich@muenchen.de · Internet: www.ws-muenchen.de',
    'Bankverbindung: XY Bank · Konto-Nr. 123456 · BLZ 763 180 88',
  ];
  const footerParagraphs = fDocument.getParagraphs(footerSegmentId);
  footerParagraphs[0]?.setText(footerLines[0]);
  for (const text of footerLines.slice(1)) {
    fDocument.appendParagraph(text, footerSegmentId);
  }
  for (const paragraph of fDocument.getParagraphs(footerSegmentId)) {
    paragraph.getTextRange().setTextStyle({ it: BooleanNumber.TRUE, cl: GRAY, fs: 9 });
  }
}

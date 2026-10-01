import type { IParagraphStyle, ITextStyle } from '@univerjs/core';
import { BaselineOffset, BooleanNumber, HorizontalAlign, NamedStyleType, SpacingRule } from '@univerjs/core';
import {
  AlignmentType,
  ColumnBreak,
  Document,
  Footer,
  Header,
  HeadingLevel,
  LevelFormat,
  LineRuleType,
  Packer,
  Paragraph,
  SectionType,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  UnderlineType,
  WidthType,
  type ISectionOptions,
} from 'docx';
import { hexColor, NAMED_STYLE_LOOK, toExportDocument, type ExportBlock, type ExportParagraph } from './model';
import type { IDocumentData } from '@univerjs/core';

// Word rechnet in Twips: 1 px (96 dpi) = 15 Twips
const tw = (px: number | undefined) => Math.round((px ?? 0) * 15);
const num = (v: { v: number } | undefined) => v?.v;

const ALIGN: Partial<Record<HorizontalAlign, (typeof AlignmentType)[keyof typeof AlignmentType]>> = {
  [HorizontalAlign.LEFT]: AlignmentType.LEFT,
  [HorizontalAlign.CENTER]: AlignmentType.CENTER,
  [HorizontalAlign.RIGHT]: AlignmentType.RIGHT,
  [HorizontalAlign.JUSTIFIED]: AlignmentType.JUSTIFIED,
  [HorizontalAlign.BOTH]: AlignmentType.JUSTIFIED,
};

const HEADING: Partial<Record<NamedStyleType, (typeof HeadingLevel)[keyof typeof HeadingLevel]>> = {
  [NamedStyleType.TITLE]: HeadingLevel.TITLE,
  [NamedStyleType.HEADING_1]: HeadingLevel.HEADING_1,
  [NamedStyleType.HEADING_2]: HeadingLevel.HEADING_2,
  [NamedStyleType.HEADING_3]: HeadingLevel.HEADING_3,
  [NamedStyleType.HEADING_4]: HeadingLevel.HEADING_4,
  [NamedStyleType.HEADING_5]: HeadingLevel.HEADING_5,
};

function textRun(text: string, ts: ITextStyle, para: IParagraphStyle) {
  // Formatvorlagen geben Größe/Fettdruck vor, sofern der Text sie nicht selbst festlegt
  const look = NAMED_STYLE_LOOK[para.namedStyleType ?? NamedStyleType.NORMAL_TEXT];
  const color = hexColor(ts.cl?.rgb) ?? look?.color;
  const highlight = hexColor(ts.bg?.rgb);
  const size = ts.fs ?? look?.fs;
  return new TextRun({
    text,
    font: ts.ff ?? undefined,
    size: size ? Math.round(size * 2) : undefined,
    bold: ts.bl != null ? ts.bl === BooleanNumber.TRUE : look?.bold,
    italics: ts.it === BooleanNumber.TRUE || undefined,
    underline: ts.ul?.s === BooleanNumber.TRUE ? { type: UnderlineType.SINGLE } : undefined,
    strike: ts.st?.s === BooleanNumber.TRUE || undefined,
    color,
    shading: highlight ? { type: ShadingType.CLEAR, fill: highlight, color: 'auto' } : undefined,
    superScript: ts.va === BaselineOffset.SUPERSCRIPT || undefined,
    subScript: ts.va === BaselineOffset.SUBSCRIPT || undefined,
  });
}

function paragraph(p: ExportParagraph): Paragraph {
  const s = p.style;
  const children: (TextRun | ColumnBreak)[] = [];
  for (const run of p.runs) {
    if (run.columnBreak) children.push(new ColumnBreak());
    if (run.text) children.push(textRun(run.text, run.style, s));
  }

  const hanging = num(s.hanging);
  const indentStart = num(s.indentStart);
  const firstLine = num(s.indentFirstLine);
  const listIndent = p.bullet ? 24 * (p.bullet.level + 1) : 0;
  const hasIndent = hanging != null || indentStart != null || firstLine != null || p.bullet;

  let line: number | undefined;
  let lineRule: (typeof LineRuleType)[keyof typeof LineRuleType] | undefined;
  if (s.lineSpacing != null) {
    if ((s.spacingRule ?? SpacingRule.AUTO) === SpacingRule.AUTO) {
      line = Math.round(s.lineSpacing * 240);
      lineRule = LineRuleType.AUTO;
    } else {
      line = tw(s.lineSpacing);
      lineRule = s.spacingRule === SpacingRule.EXACT ? LineRuleType.EXACT : LineRuleType.AT_LEAST;
    }
  }

  return new Paragraph({
    children,
    heading: HEADING[s.namedStyleType as NamedStyleType],
    alignment: s.horizontalAlign != null ? ALIGN[s.horizontalAlign] : undefined,
    spacing: {
      before: num(s.spaceAbove) != null ? tw(num(s.spaceAbove)) : undefined,
      after: num(s.spaceBelow) != null ? tw(num(s.spaceBelow)) : undefined,
      line,
      lineRule,
    },
    indent: hasIndent
      ? {
          // Word: „links“ ist die Textkante; der hängende Einzug ragt davon nach links heraus
          left: tw((indentStart ?? 0) + (hanging ?? (p.bullet ? listIndent : 0))),
          hanging: hanging != null ? tw(hanging) : p.bullet ? tw(listIndent) : undefined,
          firstLine: firstLine != null && hanging == null ? tw(firstLine) : undefined,
          right: num(s.indentEnd) != null ? tw(num(s.indentEnd)) : undefined,
        }
      : undefined,
    numbering: p.bullet
      ? { reference: p.bullet.listType.startsWith('BULLET_LIST') ? 'bullets' : 'numbers', level: Math.min(p.bullet.level, 2), instance: hashInstance(p.bullet.listId) }
      : undefined,
  });
}

// Nummerierte Listen mit eigener listId beginnen in Word jeweils wieder bei 1
const instances = new Map<string, number>();
function hashInstance(listId: string) {
  if (!instances.has(listId)) instances.set(listId, instances.size + 1);
  return instances.get(listId)!;
}

function blocks(list: ExportBlock[], contentWidth: number): (Paragraph | Table)[] {
  const out: (Paragraph | Table)[] = [];
  for (const b of list) {
    if (b.type === 'paragraph') {
      out.push(paragraph(b));
      continue;
    }
    const widths = b.columnWidths.length > 0 ? b.columnWidths : [contentWidth];
    out.push(
      new Table({
        width: { size: tw(widths.reduce((a, w) => a + w, 0)), type: WidthType.DXA },
        columnWidths: widths.map(tw),
        rows: b.rows.map(
          (row) =>
            new TableRow({
              children: row.map(
                (cell, c) =>
                  new TableCell({
                    width: { size: tw(widths[c] ?? widths[0]), type: WidthType.DXA },
                    margins: { left: tw(10), right: tw(10), top: tw(5), bottom: tw(5) },
                    children: cell.length > 0 ? cell.map(paragraph) : [new Paragraph('')],
                  }),
              ),
            }),
        ),
      }),
    );
    // Word braucht nach einer Tabelle einen Absatz – den liefert Univer bereits mit
  }
  return out;
}

/** Wandelt das Univer-Dokument in eine echte Word-Datei (.docx) um. */
export async function exportDocx(data: IDocumentData): Promise<Blob> {
  instances.clear();
  const doc = toExportDocument(data);
  const defaults = doc.defaults;

  const sections: ISectionOptions[] = doc.sections.map((s, i) => {
    const contentWidth = doc.pageWidth - s.margins.left - s.margins.right;
    return {
      properties: {
        type: i === 0 ? undefined : s.newPage ? SectionType.NEXT_PAGE : SectionType.CONTINUOUS,
        page: {
          size: { width: tw(doc.pageWidth), height: tw(doc.pageHeight) },
          margin: {
            top: tw(s.margins.top),
            bottom: tw(s.margins.bottom),
            left: tw(s.margins.left),
            right: tw(s.margins.right),
            header: tw(doc.marginHeader),
            footer: tw(doc.marginFooter),
          },
        },
        column: s.columns > 1 ? { count: s.columns, space: tw(s.columnGap), separate: s.separator, equalWidth: true } : undefined,
      },
      headers: i === 0 && doc.header.length > 0 ? { default: new Header({ children: blocks(doc.header, contentWidth) }) } : undefined,
      footers: i === 0 && doc.footer.length > 0 ? { default: new Footer({ children: blocks(doc.footer, contentWidth) }) } : undefined,
      children: blocks(s.blocks, contentWidth),
    };
  });

  const levels = (format: (typeof LevelFormat)[keyof typeof LevelFormat], text: (l: number) => string) =>
    [0, 1, 2].map((level) => ({
      level,
      format,
      text: text(level),
      alignment: AlignmentType.LEFT,
      style: { paragraph: { indent: { left: tw(24 * (level + 1)), hanging: tw(24) } } },
    }));

  const document = new Document({
    creator: 'WSS digital – Layouten mit Word',
    title: data.title ?? 'Layout-Aufgabe',
    styles: {
      default: {
        document: {
          run: { font: defaults.ff ?? 'Arial', size: Math.round((defaults.fs ?? 11) * 2) },
          paragraph: { spacing: { after: 0, line: 276, lineRule: LineRuleType.AUTO } },
        },
      },
    },
    numbering: {
      config: [
        { reference: 'bullets', levels: levels(LevelFormat.BULLET, (l) => ['•', '◦', '▪'][l]) },
        { reference: 'numbers', levels: levels(LevelFormat.DECIMAL, (l) => `%${l + 1}.`) },
      ],
    },
    sections,
  });

  return Packer.toBlob(document);
}

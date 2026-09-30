import type { IDocumentData, IParagraph, ITextRun, ITextStyle } from '@univerjs/core';
import {
  BooleanNumber,
  DataStreamTreeTokenType,
  DocumentFlavor,
  HorizontalAlign,
  createParagraphId,
  createSectionId,
} from '@univerjs/core';
import type { LayoutParagraphSeed } from './types';

// 1 cm = 567 twips, Univer rechnet die Seitenmaße in px (15 twips = 1 px)
const cmToPx = (cm: number) => (cm * 567) / 15;

const HORIZONTAL: Record<NonNullable<LayoutParagraphSeed['align']>, HorizontalAlign> = {
  left: HorizontalAlign.LEFT,
  center: HorizontalAlign.CENTER,
  right: HorizontalAlign.RIGHT,
  justify: HorizontalAlign.JUSTIFIED,
};

/**
 * Baut das Ausgangsdokument für eine Layout-Aufgabe. Der Text ist vorgegeben und
 * bewusst unformatiert (Arial, 11 pt); die Schüler:innen formatieren direkt im
 * Univer-Editor.
 */
export function buildLayoutDocumentData(id: string, title: string, seeds: LayoutParagraphSeed[]): Partial<IDocumentData> {
  let dataStream = '';
  const paragraphs: IParagraph[] = [];
  const textRuns: ITextRun[] = [];
  const usedIds = new Set<string>();

  for (const seed of seeds) {
    const start = dataStream.length;
    dataStream += seed.text;
    const end = dataStream.length;
    dataStream += DataStreamTreeTokenType.PARAGRAPH;

    const paragraphId = createParagraphId(usedIds);
    usedIds.add(paragraphId);
    const paragraph: IParagraph = { startIndex: end, paragraphId, paragraphStyle: { spaceBelow: { v: 8 } } };
    if (seed.align) paragraph.paragraphStyle = { ...paragraph.paragraphStyle, horizontalAlign: HORIZONTAL[seed.align] };
    paragraphs.push(paragraph);

    if (seed.text.length > 0) {
      const ts: ITextStyle = {};
      if (seed.bold) ts.bl = BooleanNumber.TRUE;
      if (seed.italic) ts.it = BooleanNumber.TRUE;
      if (Object.keys(ts).length > 0) textRuns.push({ st: start, ed: end, ts });
    }
  }

  const sectionStart = dataStream.length;
  dataStream += DataStreamTreeTokenType.SECTION_BREAK;

  return {
    id,
    title,
    documentStyle: {
      documentFlavor: DocumentFlavor.TRADITIONAL,
      pageSize: { width: cmToPx(21), height: cmToPx(29.7) },
      marginTop: cmToPx(2.5),
      marginBottom: cmToPx(2),
      marginLeft: cmToPx(2.5),
      marginRight: cmToPx(2.5),
      textStyle: { ff: 'Arial', fs: 11 },
    },
    body: {
      dataStream,
      paragraphs,
      textRuns,
      sectionBreaks: [{ sectionId: createSectionId(new Set()), startIndex: sectionStart }],
    },
  };
}

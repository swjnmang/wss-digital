import { DataStreamTreeTokenType } from '@univerjs/core';
import type { FDocument } from '@univerjs/docs/facade';
import type { FDocumentParagraph } from '@univerjs/docs/facade';
import type { ValidationResult } from '../excel-trainer/types';
import type { TextLine } from './line-types';
import { isTodayGerman } from './line-types';
import { brieftextMatches } from './vollstaendiger-brief-types';
import { buildLetterPlan } from './word-dokument-doc';
import type { WordDokumentTask } from './word-dokument-tasks';

/**
 * ARCHITECTURE NOTE — label-anchored vs. position-anchored grading:
 *
 * The Univer Docs Facade API (`@univerjs/docs` 1.0.1) does expose a
 * `FDocumentPermission` / `FDocumentObjectPermission` surface with
 * `setReadOnly()` for the whole document, and `setObjectPermissions()` for
 * per-paragraph/section/entity edit policies. However, per-object policies
 * explicitly "require Authz support" (a collaboration/server backend) per
 * the type-level documentation and throw/no-op in a plain client-only
 * instance such as this one. There is no supported "visible but frozen
 * plain-text run" primitive in the client-only build. We therefore grade by
 * reading the live document back out through the Facade API rather than
 * through any protection mechanism.
 *
 * Since the whole point of this trainer is that the student must recognize
 * DIN-5008 structure themselves, the document body prints no captions for
 * Anschriftenfeld, Betreff, Anrede, Brieftext or Grußformel — only the
 * Infoblock keeps its genuine, permanent template labels ("Telefon:",
 * "Datum:", …). That means most fields can no longer be located by searching
 * for a label string. Instead:
 *
 * - Infoblock fields are still found via `findParagraphByText` — their
 *   labels are real, permanent parts of the template and remain unique,
 *   searchable strings.
 * - The Anschriftenfeld is graded by its table-cell position: the header
 *   table's raw data-stream is parsed for the second row's first cell (see
 *   `findAnschriftenfeldCellRange`), and every non-blank paragraph inside it
 *   is read off in order and matched positionally against the task's
 *   `anschriftenfeld` array.
 * - Betreff, Anrede, Brieftext and Grußformel are graded by reading every
 *   paragraph below the header table (found via `FDocument.getBody().tables`,
 *   which reflects live edits) in document order, discarding blank
 *   paragraphs, and mapping the remaining non-blank paragraphs positionally:
 *   the first N (N = `task.betreff.length`) are Betreff, the next M
 *   (`task.anrede.length`) are Anrede, the last K (`task.grussformel.length`)
 *   are Grußformel, and everything in between is the free-text Brieftext.
 *
 * This tolerates a student leaving extra or missing blank lines (blank
 * paragraphs are simply skipped, the same way a human grader reading down
 * the page would), which is the same trade-off the task brief anticipated as
 * an acceptable fallback. Known edge cases where this is less precise than
 * the old label-anchored approach:
 *
 * - If a student types a stray extra *non-blank* line inside the Betreff or
 *   Anrede zone (rather than leaving it blank), every field after it shifts
 *   by one and is graded against the wrong text.
 * - The Anschriftenfeld and Brieftext zones have no fixed size, so an
 *   Anschriftenfeld line intentionally left empty (e.g. no company line for
 *   a private recipient) is indistinguishable from one the student simply
 *   forgot — both are skipped and shift the remaining lines up by one. Real
 *   Anschriftenfeld data in the reused tasks always has every line filled,
 *   so this does not currently bite, but it would need re-visiting if a
 *   future task adds an intentionally blank address line.
 */

function valueAfterLabel(paragraphText: string, label: string): string {
  const prefix = `${label}:`;
  if (!paragraphText.startsWith(prefix)) return paragraphText.trim();
  return paragraphText.slice(prefix.length).trim();
}

function matchesExpected(actual: string, expected: string): boolean {
  return actual.trim().toUpperCase() === expected.trim().toUpperCase();
}

function gradeTextLine(line: TextLine, actual: string): ValidationResult {
  const success = matchesExpected(actual, line.expected);
  return {
    label: line.caption,
    success,
    message: success ? '✅ Korrekt!' : `❌ Nicht korrekt. ${line.explanation}`,
  };
}

/**
 * Locates the Anschriftenfeld cell's content range (row index 1, cell index 0
 * of the header table) as raw data-stream offsets, by walking the table's own
 * row/cell tokens. There is no Facade API exposing table row/cell content
 * ranges directly, so this mirrors the token layout `buildAddressInfoTable`
 * (in `word-dokument-doc.ts`) writes: `TABLE_ROW_START` … `TABLE_CELL_START`
 * (content start) … `SECTION_BREAK` (content end) … `TABLE_CELL_END` …
 * `TABLE_ROW_END`.
 */
function findAnschriftenfeldCellRange(
  dataStream: string,
  tableStart: number,
  tableEnd: number,
): { start: number; end: number } | null {
  let i = tableStart;
  let rowIndex = -1;
  while (i < tableEnd) {
    if (dataStream[i] === DataStreamTreeTokenType.TABLE_ROW_START) {
      rowIndex += 1;
      const rowEnd = dataStream.indexOf(DataStreamTreeTokenType.TABLE_ROW_END, i);
      if (rowEnd === -1) return null;
      if (rowIndex === 1) {
        const cellStart = dataStream.indexOf(DataStreamTreeTokenType.TABLE_CELL_START, i);
        if (cellStart === -1 || cellStart > rowEnd) return null;
        const cellContentEnd = dataStream.indexOf(DataStreamTreeTokenType.SECTION_BREAK, cellStart);
        if (cellContentEnd === -1 || cellContentEnd > rowEnd) return null;
        return { start: cellStart + 1, end: cellContentEnd };
      }
      i = rowEnd + 1;
      continue;
    }
    i += 1;
  }
  return null;
}

/** Every non-blank paragraph's text inside the Anschriftenfeld cell, in document order. */
function getAnschriftenfeldTexts(fDocument: FDocument): string[] {
  const body = fDocument.getBody();
  const table = body.tables?.[0];
  if (!table) return [];
  const range = findAnschriftenfeldCellRange(body.dataStream, table.startIndex, table.endIndex);
  if (!range) return [];
  return fDocument
    .getParagraphs()
    .filter((paragraph) => {
      const { startOffset } = paragraph.getInfo();
      return startOffset >= range.start && startOffset < range.end;
    })
    .map((paragraph) => paragraph.getText().trim())
    .filter((text) => text.length > 0);
}

/** Every paragraph below the header table (Betreff onward), in document order. */
function getBelowTableParagraphs(fDocument: FDocument): FDocumentParagraph[] {
  const body = fDocument.getBody();
  const table = body.tables?.[0];
  if (!table) return [];
  return fDocument
    .getParagraphs()
    .filter((paragraph) => paragraph.getInfo().startOffset >= table.endIndex);
}

function gradeInfoblock(fDocument: FDocument, task: WordDokumentTask): ValidationResult[] {
  const results: ValidationResult[] = [];
  for (const line of buildLetterPlan(task)) {
    if (line.kind === 'field' && line.section === 'infoblock') {
      const paragraph = fDocument.findParagraphByText(`${line.label}:`);
      const actual = paragraph ? valueAfterLabel(paragraph.getText(), line.label) : '';
      const success = matchesExpected(actual, line.expected);
      results.push({
        label: line.label,
        success,
        message: success ? '✅ Korrekt!' : `❌ Nicht korrekt. ${line.explanation}`,
      });
    } else if (line.kind === 'field-date') {
      const paragraph = fDocument.findParagraphByText(`${line.label}:`);
      const actual = paragraph ? valueAfterLabel(paragraph.getText(), line.label) : '';
      const success = isTodayGerman(actual);
      results.push({ label: line.label, success, message: success ? '✅ Korrekt!' : `❌ Nicht korrekt. ${line.explanation}` });
    }
  }
  return results;
}

function gradeAnschriftenfeld(fDocument: FDocument, task: WordDokumentTask): ValidationResult[] {
  const actualTexts = getAnschriftenfeldTexts(fDocument);
  return task.anschriftenfeld.map((line, i) => gradeTextLine(line, actualTexts[i] ?? ''));
}

/** Grades Betreff, Anrede, Brieftext and Grußformel by their position among the non-blank paragraphs below the table. */
function gradeLetterBody(fDocument: FDocument, task: WordDokumentTask): ValidationResult[] {
  const nonBlank = getBelowTableParagraphs(fDocument)
    .map((paragraph) => paragraph.getText().trim())
    .filter((text) => text.length > 0);

  const betreffCount = task.betreff.length;
  const anredeCount = task.anrede.length;
  const grussformelCount = task.grussformel.length;
  const afterAnrede = betreffCount + anredeCount;
  // Grußformel is always the tail end of the document, so it is matched from
  // the back — this stays correct regardless of how many (or few) paragraphs
  // the student used for the free-text Brieftext in between.
  const grussformelStart = Math.max(afterAnrede, nonBlank.length - grussformelCount);

  const betreffTexts = nonBlank.slice(0, betreffCount);
  const anredeTexts = nonBlank.slice(betreffCount, afterAnrede);
  const brieftextTexts = nonBlank.slice(afterAnrede, grussformelStart);
  const grussformelTexts = nonBlank.slice(grussformelStart);

  const results: ValidationResult[] = [
    ...task.betreff.map((line, i) => gradeTextLine(line, betreffTexts[i] ?? '')),
    ...task.anrede.map((line, i) => gradeTextLine(line, anredeTexts[i] ?? '')),
  ];

  const typedBrieftext = brieftextTexts.join(' ');
  const brieftextSuccess = typedBrieftext.length > 0 && brieftextMatches(typedBrieftext, task.brieftextReferenz);
  results.push({
    label: 'Brieftext',
    success: brieftextSuccess,
    message: brieftextSuccess
      ? '✅ Der Brieftext stimmt (kleine Abweichungen bei Leerzeichen werden toleriert).'
      : '❌ Der abgetippte Text weicht noch vom vorgegebenen Brieftext ab. Vergleiche jedes Wort und jedes Satzzeichen genau.',
  });

  results.push(...task.grussformel.map((line, i) => gradeTextLine(line, grussformelTexts[i] ?? '')));

  return results;
}

export function gradeWordDokument(fDocument: FDocument, task: WordDokumentTask): ValidationResult[] {
  return [
    ...gradeAnschriftenfeld(fDocument, task),
    ...gradeInfoblock(fDocument, task),
    ...gradeLetterBody(fDocument, task),
  ];
}

import type { FDocument } from '@univerjs/docs/facade';
import type { ValidationResult } from '../excel-trainer/types';
import { isTodayGerman } from './line-types';
import { brieftextMatches } from './vollstaendiger-brief-types';
import { BRIEFTEXT_END_MARKER, BRIEFTEXT_START_MARKER, buildLetterPlan } from './word-dokument-doc';
import type { WordDokumentTask } from './word-dokument-tasks';

/**
 * ARCHITECTURE NOTE — why this grades by text position instead of Univer Docs
 * "protected ranges":
 *
 * The Univer Docs Facade API (`@univerjs/docs` 1.0.1) does expose a
 * `FDocumentPermission` / `FDocumentObjectPermission` surface with
 * `setReadOnly()` for the whole document, and `setObjectPermissions()` for
 * per-paragraph/section/entity edit policies. However, per-object policies
 * explicitly "require Authz support" (a collaboration/server backend) per
 * the type-level documentation and throw/no-op in a plain client-only
 * instance such as this one. There is no supported "visible but frozen
 * plain-text run" primitive in the client-only build.
 *
 * We therefore fall back to the documented alternative: a clearly labeled,
 * fully editable template (bold/gray static labels the student is told not
 * to delete), and grade by reading the live document back out through the
 * Facade API (`findParagraphByText`, `getParagraphs`) rather than through
 * any protection mechanism. This is the same trade-off the task brief
 * anticipated as an acceptable fallback.
 */

function valueAfterLabel(paragraphText: string, label: string): string {
  const prefix = `${label}:`;
  if (!paragraphText.startsWith(prefix)) return paragraphText.trim();
  return paragraphText.slice(prefix.length).trim();
}

export function gradeWordDokument(fDocument: FDocument, task: WordDokumentTask): ValidationResult[] {
  const plan = buildLetterPlan(task);
  const results: ValidationResult[] = [];

  for (const line of plan) {
    if (line.kind === 'field') {
      const paragraph = fDocument.findParagraphByText(`${line.label}:`);
      const actual = paragraph ? valueAfterLabel(paragraph.getText(), line.label) : '';
      const success = actual.trim().toUpperCase() === line.expected.trim().toUpperCase();
      results.push({
        label: line.label,
        success,
        message: success
          ? '✅ Korrekt!'
          : `❌ Nicht korrekt. ${line.explanation}`,
      });
    }

    if (line.kind === 'field-date') {
      const paragraph = fDocument.findParagraphByText(`${line.label}:`);
      const actual = paragraph ? valueAfterLabel(paragraph.getText(), line.label) : '';
      const success = isTodayGerman(actual);
      results.push({
        label: line.label,
        success,
        message: success ? '✅ Korrekt!' : `❌ Nicht korrekt. ${line.explanation}`,
      });
    }
  }

  results.push(gradeBrieftext(fDocument, task));

  return results;
}

function gradeBrieftext(fDocument: FDocument, task: WordDokumentTask): ValidationResult {
  const label = 'Brieftext';
  const startParagraph = fDocument.findParagraphByText(BRIEFTEXT_START_MARKER);
  const endParagraph = fDocument.findParagraphByText(BRIEFTEXT_END_MARKER);

  if (!startParagraph || !endParagraph) {
    return {
      label,
      success: false,
      message: '❌ Die Brieftext-Markierungen im Dokument wurden verändert oder gelöscht. Aufgabe neu laden.',
    };
  }

  const startIndex = startParagraph.getInfo().paragraphIndex;
  const endIndex = endParagraph.getInfo().paragraphIndex;
  const allParagraphs = fDocument.getParagraphs();

  const typedParagraphs = allParagraphs
    .filter((p) => {
      const idx = p.getInfo().paragraphIndex;
      return idx > startIndex && idx < endIndex;
    })
    .map((p) => p.getText().trim())
    .filter((text) => text.length > 0);

  const typedText = typedParagraphs.join(' ');
  const success = typedText.length > 0 && brieftextMatches(typedText, task.brieftextReferenz);

  return {
    label,
    success,
    message: success
      ? '✅ Der Brieftext stimmt (kleine Abweichungen bei Leerzeichen werden toleriert).'
      : '❌ Der abgetippte Text weicht noch vom vorgegebenen Brieftext ab. Vergleiche jedes Wort und jedes Satzzeichen genau.',
  };
}

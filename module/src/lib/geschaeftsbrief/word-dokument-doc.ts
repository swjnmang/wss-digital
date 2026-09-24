import type { FDocument } from '@univerjs/docs/facade';
import { BooleanNumber } from '@univerjs/core';
import type { WordDokumentTask } from './word-dokument-tasks';

/**
 * One line ("paragraph") of the DIN-5008 letter document.
 *
 * The same plan drives both seeding (`applyTaskToDocument`) and grading
 * (`word-dokument-grading.ts`), so the labels the student sees are exactly
 * the labels grading looks for. See the architecture note in
 * `word-dokument-grading.ts` for why this is text-position based rather than
 * relying on Univer's per-range document protection.
 */
export type LetterLine =
  | { kind: 'static'; text: string; style: 'letterhead' | 'small' | 'heading' | 'footer' }
  | { kind: 'blank' }
  | {
      kind: 'field';
      fieldId: string;
      label: string;
      expected: string;
      explanation: string;
    }
  | { kind: 'field-date'; fieldId: 'datum'; label: string; explanation: string }
  | { kind: 'brieftext-marker'; boundary: 'start' | 'end'; text: string }
  | { kind: 'brieftext-placeholder' };

export const BRIEFTEXT_START_MARKER = 'Brieftext (bitte hier eintippen):';
export const BRIEFTEXT_END_MARKER = 'Grußformel & Unterschrift:';
export const BRIEFTEXT_PLACEHOLDER = '[Hier den vorgegebenen Brieftext vollständig abtippen …]';

/** Builds the ordered list of lines that make up the editable DIN-5008 letter for a task. */
export function buildLetterPlan(task: WordDokumentTask): LetterLine[] {
  const lines: LetterLine[] = [];

  // Briefkopf (Schul-Briefpapier, statisch, nicht Teil der Bewertung)
  lines.push({ kind: 'static', text: 'Unser Unternehmen', style: 'letterhead' });
  lines.push({ kind: 'static', text: 'Plinganserstraße 28', style: 'letterhead' });
  lines.push({ kind: 'static', text: '81369 München', style: 'letterhead' });
  lines.push({ kind: 'blank' });

  // Rücksendeangabe / Absenderzeile über dem Anschriftenfeld (DIN 5008, statisch)
  lines.push({ kind: 'static', text: task.senderLine, style: 'small' });
  lines.push({ kind: 'blank' });
  lines.push({ kind: 'blank' });

  // 1. Anschriftenfeld (editierbar)
  lines.push({ kind: 'static', text: '1. Anschriftenfeld', style: 'heading' });
  for (const line of task.anschriftenfeld) {
    lines.push({
      kind: 'field',
      fieldId: line.id,
      label: line.caption,
      expected: line.expected,
      explanation: line.explanation,
    });
  }
  lines.push({ kind: 'blank' });

  // 2. Infoblock (editierbar) inkl. Datum (heute-Prüfung)
  lines.push({ kind: 'static', text: '2. Infoblock', style: 'heading' });
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
    });
  }
  lines.push({
    kind: 'field-date',
    fieldId: 'datum',
    label: 'Datum',
    explanation: 'Beim Datum steht das heutige Tagesdatum im Format TT.MM.JJJJ.',
  });
  lines.push({ kind: 'blank' });

  // 3. Betreff
  lines.push({ kind: 'static', text: '3. Betreff', style: 'heading' });
  for (const line of task.betreff) {
    lines.push({
      kind: 'field',
      fieldId: line.id,
      label: line.caption,
      expected: line.expected,
      explanation: line.explanation,
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
    });
  }
  lines.push({ kind: 'blank' });
  lines.push({ kind: 'blank' });

  // Fußzeile (Schul-Briefpapier, statisch)
  lines.push({
    kind: 'static',
    text: 'Anschrift: Meindlstraße 8 a, 81373 München · Tel. 089 2388768-0 · Fax 089 2388768-22',
    style: 'footer',
  });
  lines.push({
    kind: 'static',
    text: 'E-Mail: ws-staatlich@muenchen.de · Internet: www.ws-muenchen.de',
    style: 'footer',
  });
  lines.push({
    kind: 'static',
    text: 'Bankverbindung: XY Bank · Konto-Nr. 123456 · BLZ 763 180 88',
    style: 'footer',
  });

  return lines;
}

/** The text initially written into a `field` line's paragraph (label + editable placeholder). */
export function fieldParagraphSeedText(label: string): string {
  return `${label}: `;
}

const GRAY = { rgb: '#8a8f98' };

/**
 * Writes the DIN-5008 letter structure into a fresh Univer document.
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

  // A freshly created document already has one empty paragraph; reuse it for the first line.
  let first = true;

  const writeLine = (text: string) => {
    if (first) {
      first = false;
      const paragraph = fDocument.getParagraphs()[0];
      paragraph.setText(text);
      return paragraph;
    }
    return fDocument.appendParagraph(text);
  };

  for (const line of plan) {
    if (line.kind === 'blank') {
      writeLine('');
      continue;
    }

    if (line.kind === 'static') {
      const paragraph = writeLine(line.text);
      if (line.style === 'letterhead' || line.style === 'footer') {
        paragraph.getTextRange().setTextStyle({ it: BooleanNumber.TRUE, cl: GRAY, fs: 9 });
      } else if (line.style === 'small') {
        paragraph.getTextRange().setTextStyle({ fs: 9, cl: GRAY });
      } else if (line.style === 'heading') {
        paragraph.getTextRange().setTextStyle({ bl: BooleanNumber.TRUE, fs: 11 });
      }
      continue;
    }

    if (line.kind === 'field' || line.kind === 'field-date') {
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
}

import { VOLLSTAENDIGER_BRIEF_TASKS } from './vollstaendiger-brief-tasks';
import type { VollstaendigerBriefTask } from './vollstaendiger-brief-types';

/**
 * The Word-Editor variant ("Univer Docs") reuses exactly the same four
 * pedagogical tasks as the typed-input trainer (`vollstaendiger-brief-tasks.ts`).
 * Only the presentation (a live, editable DIN-5008 document instead of
 * separate input fields) and the grading mechanism (reading text back out of
 * the document) differ.
 */
export type WordDokumentTask = VollstaendigerBriefTask;

export const WORD_DOKUMENT_TASKS: WordDokumentTask[] = VOLLSTAENDIGER_BRIEF_TASKS;

export function getWordDokumentTaskById(id: string): WordDokumentTask | undefined {
  return WORD_DOKUMENT_TASKS.find((task) => task.id === id);
}

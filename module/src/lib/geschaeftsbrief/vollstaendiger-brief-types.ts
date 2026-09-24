import type { InfoblockLine } from './infoblock-types';
import type { AnschriftLine } from './types';
import type { TextLine } from './line-types';

export type { InfoblockLine, AnschriftLine, TextLine };

export interface VollstaendigerBriefTask {
  id: string;
  title: string;
  difficulty: 'einfach' | 'mittel' | 'schwer';
  arbeitsauftrag: string;
  senderLine: string;
  anschriftenfeld: AnschriftLine[];
  infoblock: InfoblockLine[];
  betreff: TextLine[];
  anrede: TextLine[];
  /** Reference letter body (plain paragraphs, no lists/tables) the student must type themselves. */
  brieftextReferenz: string[];
  grussformel: TextLine[];
}

/** All typed single-line fields that get graded together (excludes the free-text Brieftext). */
export function allLineFields(task: VollstaendigerBriefTask): (AnschriftLine | InfoblockLine | TextLine)[] {
  return [
    ...task.anschriftenfeld,
    ...task.infoblock,
    ...task.betreff,
    ...task.anrede,
    ...task.grussformel,
  ];
}

/** Normalizes whitespace for a lenient comparison of the typed Brieftext against the reference. */
export function normalizeBrieftext(value: string): string {
  return value
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\s+([.,;:!?])/g, '$1');
}

export function brieftextMatches(value: string, reference: string[]): boolean {
  return normalizeBrieftext(value) === normalizeBrieftext(reference.join(' '));
}

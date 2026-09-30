import type { LayoutDocument } from './grading';

export interface LayoutParagraphSeed {
  text: string;
  align?: 'left' | 'center' | 'right' | 'justify';
  bold?: boolean;
  italic?: boolean;
}

export interface LayoutCheck {
  label: string;
  /** Wo finde ich das im Editor? */
  hint: string;
  test: (doc: LayoutDocument) => boolean;
}

export interface LayoutStep {
  title: string;
  instruction: string;
  checks: LayoutCheck[];
}

export interface LayoutTask {
  id: string;
  title: string;
  difficulty: 'einfach' | 'mittel' | 'schwer';
  intro: string;
  /** Kurze Situation / Auftrag oberhalb des Editors. */
  auftrag: string;
  paragraphs: LayoutParagraphSeed[];
  steps: LayoutStep[];
}

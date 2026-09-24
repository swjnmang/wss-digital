import type { TextLine } from './line-types';

export type { TextLine as AnschriftTextLine } from './line-types';

export interface AnschriftLine extends TextLine {
  /** Which zone of the 40mm-Anschriftenfeld this line belongs to. */
  zone: 'zusatz' | 'anschrift';
}

export interface AnschriftenfeldTask {
  id: string;
  title: string;
  difficulty: 'einfach' | 'mittel' | 'schwer';
  arbeitsauftrag: string;
  senderLine: string;
  lines: AnschriftLine[];
}

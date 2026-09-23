import type { Line } from './line-types';

export interface VollstaendigerBriefTask {
  id: string;
  title: string;
  difficulty: 'einfach' | 'mittel' | 'schwer';
  arbeitsauftrag: string;
  senderLine: string;
  anschriftenfeld: Line[];
  infoblock: Line[];
  betreff: Line[];
  anrede: Line[];
  grussformel: Line[];
}

export function allLines(task: VollstaendigerBriefTask): Line[] {
  return [
    ...task.anschriftenfeld,
    ...task.infoblock,
    ...task.betreff,
    ...task.anrede,
    ...task.grussformel,
  ];
}

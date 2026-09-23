import type { Line } from './line-types';

export interface GrussformelTask {
  id: string;
  title: string;
  difficulty: 'einfach' | 'mittel' | 'schwer';
  scenario: string;
  facts: string[];
  lines: Line[];
}

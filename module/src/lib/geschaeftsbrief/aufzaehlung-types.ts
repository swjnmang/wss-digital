import type { ChoiceLine } from './line-types';

export interface AufzaehlungBeispielZeile {
  text: string;
  indent?: boolean;
}

export interface AufzaehlungTask {
  id: string;
  title: string;
  difficulty: 'einfach' | 'mittel' | 'schwer';
  intro: string;
  beispiel: AufzaehlungBeispielZeile[];
  lines: ChoiceLine[];
}

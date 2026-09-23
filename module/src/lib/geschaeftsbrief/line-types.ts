export interface ChoiceOption {
  id: string;
  text: string;
  correct: boolean;
}

export interface ChoiceLine {
  type: 'choice';
  id: string;
  caption: string;
  options: ChoiceOption[];
  explanation: string;
}

export interface ZeichenLine {
  type: 'zeichen';
  id: string;
  caption: string;
  /** Lowercase initials of the Vorgesetzter/-r, e.g. "wv" for Werner Volk. */
  bossInitials: string;
  placeholder: string;
  explanation: string;
}

export interface FreitextLine {
  type: 'freitext';
  id: string;
  caption: string;
  placeholder: string;
  hint: string;
}

export type Line = ChoiceLine | ZeichenLine | FreitextLine;

export const BLEIBT_FREI = '(bleibt frei)';

export function zeichenPattern(bossInitials: string): RegExp {
  return new RegExp(`^${bossInitials}-[a-zäöüß]{2}$`);
}

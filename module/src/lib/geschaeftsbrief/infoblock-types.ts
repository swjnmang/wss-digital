export interface InfoblockChoiceOption {
  id: string;
  text: string;
  correct: boolean;
}

export interface InfoblockChoiceLine {
  type: 'choice';
  id: string;
  caption: string;
  options: InfoblockChoiceOption[];
  explanation: string;
}

export interface InfoblockZeichenLine {
  type: 'zeichen';
  id: string;
  caption: string;
  /** Lowercase initials of the Vorgesetzter/-r, e.g. "wv" for Werner Volk. */
  bossInitials: string;
  placeholder: string;
  explanation: string;
}

export interface InfoblockFreitextLine {
  type: 'freitext';
  id: string;
  caption: string;
  placeholder: string;
  hint: string;
}

export type InfoblockLine = InfoblockChoiceLine | InfoblockZeichenLine | InfoblockFreitextLine;

export interface InfoblockTask {
  id: string;
  title: string;
  difficulty: 'einfach' | 'mittel' | 'schwer';
  arbeitsauftrag: string;
  senderLine: string;
  empfaengerLines: string[];
  lines: InfoblockLine[];
}

export const BLEIBT_FREI = '(bleibt frei)';

export function zeichenPattern(bossInitials: string): RegExp {
  return new RegExp(`^${bossInitials}-[a-zäöüß]{2}$`);
}

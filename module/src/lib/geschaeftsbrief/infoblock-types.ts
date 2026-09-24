import type { Line } from './line-types';

export type {
  ChoiceOption as InfoblockChoiceOption,
  ChoiceLine as InfoblockChoiceLine,
  ZeichenLine as InfoblockZeichenLine,
  FreitextLine as InfoblockFreitextLine,
  NameLine as InfoblockNameLine,
  EmailLine as InfoblockEmailLine,
  TextLine as InfoblockTextLine,
  Line as InfoblockLine,
} from './line-types';
export { zeichenPattern, isValidName, deriveInitials, deriveEmail } from './line-types';

export interface InfoblockTask {
  id: string;
  title: string;
  difficulty: 'einfach' | 'mittel' | 'schwer';
  arbeitsauftrag: string;
  senderLine: string;
  empfaengerLines: string[];
  lines: Line[];
}

import type { ChoiceLine, ZeichenLine, NameLine, EmailLine, TextLine, DateLine } from './line-types';

export type {
  ChoiceOption as InfoblockChoiceOption,
  ChoiceLine as InfoblockChoiceLine,
  ZeichenLine as InfoblockZeichenLine,
  NameLine as InfoblockNameLine,
  EmailLine as InfoblockEmailLine,
  TextLine as InfoblockTextLine,
  DateLine as InfoblockDateLine,
} from './line-types';
export { zeichenPattern, isValidName, deriveInitials, deriveEmail, isTodayGerman } from './line-types';

export type InfoblockLine = ChoiceLine | ZeichenLine | NameLine | EmailLine | TextLine | DateLine;

export interface InfoblockTask {
  id: string;
  title: string;
  difficulty: 'einfach' | 'mittel' | 'schwer';
  arbeitsauftrag: string;
  senderLine: string;
  empfaengerLines: string[];
  lines: InfoblockLine[];
}

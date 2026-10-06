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
  placeholder?: string;
  explanation: string;
}

export interface FreitextLine {
  type: 'freitext';
  id: string;
  caption: string;
  placeholder: string;
  hint: string;
}

export interface TextLine {
  type: 'text';
  id: string;
  caption: string;
  /** Expected value, trimmed exact match. Empty string means the field should be left blank. */
  expected: string;
  placeholder?: string;
  explanation: string;
}

export interface NameLine {
  type: 'name';
  id: string;
  caption: string;
  /** Name des/der Vorgesetzten – darf nicht als eigener Name eingetragen werden. */
  bossName?: string;
  placeholder?: string;
  explanation: string;
}

export interface EmailLine {
  type: 'email';
  id: string;
  caption: string;
  /** Domain part after the @, e.g. "jordanmoebel.de". */
  domain: string;
  placeholder?: string;
  explanation: string;
}

export interface DateLine {
  type: 'date';
  id: string;
  caption: string;
  placeholder?: string;
  explanation: string;
}

export type Line = ChoiceLine | ZeichenLine | FreitextLine | NameLine | EmailLine | TextLine | DateLine;

export const BLEIBT_FREI = '(bleibt frei)';

export function zeichenPattern(bossInitials: string): RegExp {
  return new RegExp(`^${bossInitials}-[a-zäöüß]{2}$`);
}

/** Splits a full name into first/last tokens, e.g. "Hans Peter Schuster" -> ["Hans", "Schuster"]. */
function nameTokens(name: string): [string, string] | null {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length < 2) return null;
  return [parts[0], parts[parts.length - 1]];
}

export function isValidName(name: string): boolean {
  return nameTokens(name) !== null;
}

/** Vor- und Nachname ohne Titel, klein geschrieben – zum Vergleichen zweier Namen. */
function nameKey(name: string): string | null {
  const tokens = nameTokens(name.replace(/\b(Dr|Prof)\.\s*/g, ''));
  return tokens ? tokens.join(' ').toLowerCase() : null;
}

const PLATZHALTER_NAMEN = ['vorname nachname', 'max mustermann', 'erika mustermann', 'markus mustermann'];

export type NameProblem = 'unvollstaendig' | 'vorgesetzter' | 'platzhalter';

/** Prüft, ob ein eigener Vor- und Nachname eingetragen wurde (nicht der des Vorgesetzten, kein Platzhalter). */
export function nameProblem(name: string, bossName?: string): NameProblem | null {
  const key = nameKey(name);
  if (!key) return 'unvollstaendig';
  if (bossName && key === nameKey(bossName)) return 'vorgesetzter';
  if (PLATZHALTER_NAMEN.includes(key)) return 'platzhalter';
  return null;
}

/** Derives the "vorname.nachname" style initials for "Unser Zeichen", e.g. "Hans Schuster" -> "hs". */
export function deriveInitials(name: string): string | null {
  const tokens = nameTokens(name);
  if (!tokens) return null;
  const [first, last] = tokens;
  return `${first[0]?.toLowerCase() ?? ''}${last[0]?.toLowerCase() ?? ''}`;
}

/** Derives the "vorname.nachname@domain" email address from a full name. */
export function deriveEmail(name: string, domain: string): string | null {
  const tokens = nameTokens(name);
  if (!tokens) return null;
  const [first, last] = tokens;
  return `${first.toLowerCase()}.${last.toLowerCase()}@${domain}`;
}

/** Checks whether a "TT.MM.JJJJ" (or "T.M.JJJJ") string matches today's date. */
export function isTodayGerman(value: string): boolean {
  const match = value.trim().match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (!match) return false;
  const [, day, month, year] = match;
  const today = new Date();
  return (
    Number(day) === today.getDate() &&
    Number(month) === today.getMonth() + 1 &&
    Number(year) === today.getFullYear()
  );
}

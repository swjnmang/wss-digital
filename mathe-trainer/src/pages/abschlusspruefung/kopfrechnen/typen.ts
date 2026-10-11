// Aufgaben „Rechnen ohne Taschenrechner“ (Teil A der Abschlussprüfung).
// Texte, Antworten und Lösungen dürfen KaTeX in $…$ enthalten; eine Zeile, die mit $$ beginnt, wird abgesetzt gesetzt.

export type Thema = 'prozent' | 'zins' | 'zahlen' | 'terme' | 'funktionen' | 'trigo' | 'daten' | 'raum'

/** Block der Prüfung Teil A: Pflichtblock oder einer der drei Wahlblöcke */
export type Block = 'pflicht' | 'trigo' | 'daten' | 'raum'

export const THEMEN: { id: Thema; label: string }[] = [
  { id: 'prozent', label: 'Prozent & Dreisatz' },
  { id: 'zins', label: 'Zinsen & Darlehen' },
  { id: 'zahlen', label: 'Zahlen, Potenzen, Wurzeln' },
  { id: 'terme', label: 'Terme & Gleichungen' },
  { id: 'funktionen', label: 'Funktionen' },
  { id: 'trigo', label: 'Dreiecke & Trigonometrie' },
  { id: 'daten', label: 'Daten & Zufall' },
  { id: 'raum', label: 'Raum & Form' },
]

export const BLOCK_TITEL: Record<Block, string> = {
  pflicht: 'Block ohne Wahlmöglichkeit',
  trigo: 'Wahlblock Trigonometrie',
  daten: 'Wahlblock Daten und Zufall',
  raum: 'Wahlblock Raum und Form',
}

export const blockVon = (t: Thema): Block => (t === 'trigo' || t === 'daten' || t === 'raum' ? t : 'pflicht')

export interface Feld {
  /** Beschriftung vor dem Feld (KaTeX erlaubt), z. B. „$x =$“ */
  label?: string
  /** erwarteter Zahlenwert … */
  answer: number | string
  /** … oder Auswahl (z. B. ['w', 'f']); dann ist answer der richtige Eintrag */
  choices?: string[]
  /** Einheit hinter dem Feld */
  unit?: string
  /** erlaubte Abweichung (Standard 0,01) */
  tol?: number
}

export type Figur =
  | { k: 'rtri'; links?: string; unten?: string; hyp?: string; winkel?: string }
  | { k: 'tabelle'; zeilen: string[][] }
  | { k: 'balken'; daten: { label: string; wert: number }[]; einheit?: string; max: number; schritt: number }
  | { k: 'saeulen'; daten: { label: string; wert: number | null }[]; max: number; schritt: number; titel?: string }
  | { k: 'rad'; felder: string[]; markiert?: string }
  | { k: 'urne'; schwarz: number; weiss: number; baum?: [string, string] }
  | { k: 'bild'; name: 'dreieck60' | 'drachen' | 'wuerfelnetz' | 'strahlen' | 'parallelogramm' | 'giebel' | 'parallelen' | 'rechteckDiag' | 'sonnensegel' | 'vordach' }

interface Basis {
  id: string
  thema: Thema
  points: number
  text: string[]
  figur?: Figur
  /** Herkunft, z. B. „AP 2018 HT“ */
  quelle?: string
  /** Lösungsweg, Zeile für Zeile */
  loesung: string[]
}

export interface McAufgabe extends Basis { type: 'mc'; options: string[]; correct: number }
export interface NumAufgabe extends Basis { type: 'num'; fields: Feld[] }
/** wird im Heft gelöst und anhand der Musterlösung selbst eingeschätzt */
export interface SelbstAufgabe extends Basis { type: 'self' }

export type Aufgabe = McAufgabe | NumAufgabe | SelbstAufgabe

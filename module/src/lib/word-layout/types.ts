import type { LayoutDocument } from './grading';

export interface LayoutParagraphSeed {
  text: string;
  align?: 'left' | 'center' | 'right' | 'justify';
  bold?: boolean;
  italic?: boolean;
  /** Abweichende Startschrift für diesen Absatz. */
  font?: string;
  size?: number;
  /** Zeilenabstand (Mehrfach), z. B. 1 für einfach. */
  lineSpacing?: number;
  /** Abstand nach dem Absatz in px (Standard 8). */
  spaceBelow?: number;
}

/** Vorbefüllte Tabelle im Ausgangsdokument (Zeilen × Spalten, Zellen nur Text). */
export interface LayoutTableSeed {
  table: string[][];
  font?: string;
  size?: number;
}

export type LayoutSeed = LayoutParagraphSeed | LayoutTableSeed;

/** Seitenränder in cm. */
export interface LayoutMargins {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface LayoutCheck {
  label: string;
  /** Wo finde ich das im Editor? */
  hint: string;
  test: (doc: LayoutDocument) => boolean;
}

export interface LayoutStep {
  title: string;
  /** Mehrere Zeilen werden als Spiegelstriche angezeigt. */
  instruction: string;
  checks: LayoutCheck[];
}

export interface LayoutTask {
  id: string;
  title: string;
  difficulty: 'einfach' | 'mittel' | 'schwer';
  /** Grundlagen-Übung oder umfangreiche Projektaufgabe im Stil der Unterrichtsaufträge. */
  kind?: 'grundlage' | 'projekt';
  intro: string;
  /** Kurze Situation / Auftrag oberhalb des Editors. */
  auftrag: string;
  paragraphs: LayoutSeed[];
  /** Startwerte der Seite (Standard: oben 2,5 · unten 2 · links/rechts 2,5 cm). */
  margins?: LayoutMargins;
  /** Grundschrift des Dokuments (Standard: Arial 11 pt). */
  baseFont?: { family: string; size: number };
  steps: LayoutStep[];
}

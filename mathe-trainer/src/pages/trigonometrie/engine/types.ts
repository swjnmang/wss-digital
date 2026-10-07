import type { ReactNode } from 'react';

/**
 * Texte (Aufgabe, Tipps, Lösung, Auswahloptionen) dürfen Formeln in $…$ (KaTeX),
 * **fett** und Zeilenumbrüche (\n) enthalten.
 */
export type Rich = string;

export type Level = 'einfach' | 'mittel' | 'schwer';

export const LEVEL_LABEL: Record<Level, string> = {
  einfach: 'Einfach',
  mittel: 'Mittel',
  schwer: 'Schwer',
};

export interface NumField {
  kind: 'num';
  /** Bezeichnung vor dem Eingabefeld, z. B. "$x$" */
  label: Rich;
  value: number;
  /** Einheit hinter dem Eingabefeld, z. B. "cm" oder "°" */
  unit?: string;
  /** absolute Toleranz; Standard: 1 % relativ, mindestens 0,011 */
  tol?: number;
}

export interface ChoiceField {
  kind: 'choice';
  label?: Rich;
  options: Rich[];
  correct: number;
}

export type Field = NumField | ChoiceField;

export interface Task {
  /** Kennung zum Erkennen doppelter Aufgaben auf einer Seite */
  key: string;
  text: Rich;
  figure?: ReactNode;
  fields: Field[];
  /** schrittweise Tipps */
  tips: Rich[];
  /** Lösungsweg, Zeile für Zeile */
  solution: Rich[];
}

/** Erzeugt eine Aufgabe; `slot` (0–5) erlaubt verschiedene Aufgabentypen auf einer Seite. */
export type Generator = (level: Level, slot: number) => Task;

export interface LevelInfo {
  id: Level;
  description: string;
  /** kurzes Beispiel auf der Auswahlkarte (Rich) */
  example?: Rich;
}

export interface TopicConfig {
  title: string;
  subtitle: string;
  trackingTopic: string;
  /** YouTube-ID des Erklärvideos */
  videoId?: string;
  /** Übungsblatt zum Herunterladen */
  pdf?: string;
  explanation: ReactNode;
  levels: LevelInfo[];
  generate: Generator;
  /** Hinweis über den Aufgaben, z. B. zur Rundung */
  roundingNote?: string;
}

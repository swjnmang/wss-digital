import type { ReactNode } from 'react';
import type { UnitId } from './util';

/**
 * Texte dürfen Formeln in $…$ enthalten (KaTeX), Zeilenumbrüche mit \n
 * und **fett** für Hervorhebungen.
 */
export type Rich = string;

export interface NumPart {
  kind: 'num';
  /** Teilfrage, z. B. "a) Berechne den Flächeninhalt." */
  q?: Rich;
  /** Kurzbezeichnung vor dem Eingabefeld, z. B. "$A$" oder "Anzahl" */
  label: Rich;
  /** exakter Wert in der Einheit `unit` */
  value: number;
  /** null = ohne Einheit (z. B. Streckfaktor k) */
  unit: UnitId | null;
  /** Einheit muss genau so gewählt werden (z. B. wenn „in Liter“ gefragt ist) */
  strict?: boolean;
  /** Ganzzahlige Antwort, muss exakt stimmen */
  integer?: boolean;
  /** eigene absolute Toleranz */
  tol?: number;
}

export interface ChoicePart {
  kind: 'choice';
  q?: Rich;
  label?: Rich;
  options: Rich[];
  correct: number;
}

export type Part = NumPart | ChoicePart;

export interface Task {
  title: string;
  /** Markierung oben rechts, z. B. "Anwendung" oder "Prüfung 2019" */
  badge?: string;
  text: Rich;
  figure?: ReactNode;
  parts: Part[];
  /** Lösungsweg, Zeile für Zeile */
  solution: Rich[];
}

export type Gen = () => Task;

export interface Example {
  title: string;
  text: Rich;
  figure?: ReactNode;
  steps: Rich[];
  /** Hinweis unter dem Beispiel, z. B. zur Einheit */
  tip?: Rich;
}

export interface PracticeConfig {
  slug: string;
  title: string;
  description: string;
  /** Formeln aus der Merkhilfe (KaTeX) */
  formulas?: string[];
  example?: Example;
  /** Grundaufgaben */
  gens: Gen[];
  /** kleinere Anwendungsaufgaben */
  apps?: Gen[];
  /** feste (z. B. Prüfungs-)Aufgaben */
  fixed?: Gen[];
  nBasic?: number;
  nApp?: number;
  nFixed?: number;
}

export interface TopicConfig {
  slug: string;
  title: string;
  description: string;
  icon: string;
  pages: PracticeConfig[];
}

import { bueromoebelTask } from './bueromoebel';
import { bezugskalkulationTask } from './bezugskalkulation';
import { personalabteilungTask } from './personalabteilung';
import { impfstatistikTask } from './impfstatistik';
import { marktplaetzeTask } from './marktplaetze';
import { produktkatalogTask } from './produktkatalog';
import { lagerbestandTask } from './lagerbestand';
import { reisekostenTask } from './reisekosten';
import { kassenbuchTask } from './kassenbuch';
import { verkaufsstatistikTask } from './verkaufsstatistik';
import type { ExcelTask } from '../types';

export const ALL_TASKS: ExcelTask[] = [
  bueromoebelTask,
  lagerbestandTask,
  bezugskalkulationTask,
  reisekostenTask,
  kassenbuchTask,
  personalabteilungTask,
  impfstatistikTask,
  marktplaetzeTask,
  verkaufsstatistikTask,
  produktkatalogTask,
];

export function getTaskById(id: string): ExcelTask | undefined {
  return ALL_TASKS.find((t) => t.id === id);
}

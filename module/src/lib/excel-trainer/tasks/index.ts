import { bueromoebelTask } from './bueromoebel';
import { bezugskalkulationTask } from './bezugskalkulation';
import { personalabteilungTask } from './personalabteilung';
import { impfstatistikTask } from './impfstatistik';
import { marktplaetzeTask } from './marktplaetze';
import { produktkatalogTask } from './produktkatalog';
import type { ExcelTask } from '../types';

export const ALL_TASKS: ExcelTask[] = [
  bueromoebelTask,
  bezugskalkulationTask,
  personalabteilungTask,
  impfstatistikTask,
  marktplaetzeTask,
  produktkatalogTask,
];

export function getTaskById(id: string): ExcelTask | undefined {
  return ALL_TASKS.find((t) => t.id === id);
}

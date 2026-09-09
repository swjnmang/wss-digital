import { bueromoebelTask } from './bueromoebel';
import type { ExcelTask } from '../types';

export const ALL_TASKS: ExcelTask[] = [bueromoebelTask];

export function getTaskById(id: string): ExcelTask | undefined {
  return ALL_TASKS.find((t) => t.id === id);
}

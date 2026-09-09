import type { ValidationResult } from './types';

export interface TaskLog {
  taskId: string;
  taskTitle: string;
  timeSpentMs: number;
  attempts: number;
  lastResults: ValidationResult[] | null;
}

export interface SessionRecord {
  studentName: string;
  startedAt: number;
  endedAt: number;
  taskLogs: TaskLog[];
}

export function formatDuration(ms: number): string {
  const totalSeconds = Math.max(0, Math.round(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')} min`;
}

export function summarizeResults(results: ValidationResult[] | null): string {
  if (!results || results.length === 0) return 'nicht geprüft';
  const correct = results.filter((r) => r.success).length;
  if (correct === results.length) return `alle ${results.length} Punkte korrekt`;
  return `${correct} von ${results.length} Punkten korrekt`;
}

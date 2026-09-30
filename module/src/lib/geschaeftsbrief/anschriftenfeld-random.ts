import type { AnschriftenfeldTask } from './types';
import { ANSCHRIFTENFELD_TASKS } from './anschriftenfeld-tasks';

const STORAGE_KEY = 'anschriftenfeld-gesehen';

function readSeen(): string[] {
  try {
    const parsed = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeSeen(ids: string[]) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // Speicher nicht verfügbar – dann gibt es eben keine Wiederholungssperre.
  }
}

export function markAnschriftenfeldSeen(id: string) {
  const seen = readSeen();
  if (!seen.includes(id)) writeSeen([...seen, id]);
}

/** Zufällige Aufgabe; bevorzugt solche, die in dieser Sitzung noch nicht dran waren. */
export function pickRandomAnschriftenfeldTask(options?: {
  difficulty?: AnschriftenfeldTask['difficulty'];
  excludeId?: string;
}): AnschriftenfeldTask {
  const pool = ANSCHRIFTENFELD_TASKS.filter(
    (t) => t.id !== options?.excludeId && (!options?.difficulty || t.difficulty === options.difficulty),
  );
  const candidates = pool.length > 0 ? pool : ANSCHRIFTENFELD_TASKS;
  let seen = readSeen();
  let unseen = candidates.filter((t) => !seen.includes(t.id));
  if (unseen.length === 0) {
    const poolIds = new Set(candidates.map((t) => t.id));
    seen = seen.filter((id) => !poolIds.has(id));
    unseen = candidates;
  }
  const task = unseen[Math.floor(Math.random() * unseen.length)];
  writeSeen([...seen, task.id]);
  return task;
}

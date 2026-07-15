// Anonymer Nachverfolgungsmodus für den Trigonometrie-Bereich.
// Alle Daten bleiben ausschließlich im Browser (localStorage) - kein Backend,
// kein Name, keine Klasse. Wird verwendet, wenn Schüler:innen den Modus im
// Header aktivieren, um am Ende eine Übersicht ihrer Übungssitzung zu erhalten.

// 'none': Lösung nie angeschaut. 'hint': erst nach einem falschen Versuch angeschaut
// (als Tipp genutzt). 'solution': vor dem ersten Versuch angeschaut (Musterlösung
// direkt übernommen, ohne es selbst zu probieren).
export type HelpUsage = 'none' | 'hint' | 'solution';

export interface TrackingEntry {
    topic: string;
    attempts: number;
    firstTryCorrect: boolean;
    solved: boolean;
    helpUsed: HelpUsage;
    timestamp: number;
}

const ACTIVE_KEY = 'trig_tracking_active';
const LOG_KEY = 'trig_tracking_log';
const STARTED_AT_KEY = 'trig_tracking_started_at';
const CHANGE_EVENT = 'trig-tracking-changed';

const notifyChange = () => {
    window.dispatchEvent(new Event(CHANGE_EVENT));
};

export const isTrackingActive = (): boolean => localStorage.getItem(ACTIVE_KEY) === 'true';

export const getTrackingStartedAt = (): number | null => {
    const raw = localStorage.getItem(STARTED_AT_KEY);
    return raw ? Number(raw) : null;
};

export const getTrackingLog = (): TrackingEntry[] => {
    const raw = localStorage.getItem(LOG_KEY);
    if (!raw) return [];
    try {
        return JSON.parse(raw) as TrackingEntry[];
    } catch {
        return [];
    }
};

export const startTrackingSession = (): void => {
    localStorage.setItem(ACTIVE_KEY, 'true');
    localStorage.setItem(STARTED_AT_KEY, String(Date.now()));
    localStorage.setItem(LOG_KEY, '[]');
    notifyChange();
};

export const stopTrackingSession = (): void => {
    localStorage.setItem(ACTIVE_KEY, 'false');
    notifyChange();
};

export const logTrackingEntry = (entry: Omit<TrackingEntry, 'timestamp'>): void => {
    if (!isTrackingActive()) return;
    const log = getTrackingLog();
    log.push({ ...entry, timestamp: Date.now() });
    localStorage.setItem(LOG_KEY, JSON.stringify(log));
};

export const TRACKING_CHANGE_EVENT = CHANGE_EVENT;

// Bepunktung pro Aufgabe: 3 = sofort und ohne Hilfe gelöst, 2 = ohne Hilfe,
// aber erst nach mehreren Versuchen gelöst, 1 = mit Tipp gelöst (Lösung erst
// nach einem falschen Versuch angeschaut), 0.5 = Musterlösung direkt
// angeschaut (vor dem ersten Versuch), 0 = nicht gelöst.
export const MAX_POINTS_PER_TASK = 3;

export const getEntryPoints = (entry: Pick<TrackingEntry, 'solved' | 'attempts' | 'helpUsed'>): number => {
    if (!entry.solved) return 0;
    if (entry.helpUsed === 'solution') return 0.5;
    if (entry.helpUsed === 'hint') return 1;
    return entry.attempts === 1 ? 3 : 2;
};

export const getTrackingScore = (log: TrackingEntry[]) => {
    const points = log.reduce((sum, entry) => sum + getEntryPoints(entry), 0);
    const maxPoints = log.length * MAX_POINTS_PER_TASK;
    const percent = maxPoints > 0 ? (points / maxPoints) * 100 : 0;
    return { points, maxPoints, percent };
};

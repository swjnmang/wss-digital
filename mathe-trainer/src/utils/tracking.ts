// Anonymer Nachverfolgungsmodus für den Trigonometrie-Bereich.
// Alle Daten bleiben ausschließlich im Browser (localStorage) - kein Backend,
// kein Name, keine Klasse. Wird verwendet, wenn Schüler:innen den Modus im
// Header aktivieren, um am Ende eine Übersicht ihrer Übungssitzung zu erhalten.

export interface TrackingEntry {
    topic: string;
    attempts: number;
    firstTryCorrect: boolean;
    solved: boolean;
    hintUsed: boolean;
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

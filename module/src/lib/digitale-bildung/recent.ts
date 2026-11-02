// „Zuletzt geöffnet“: bleibt nur in diesem Browser und enthält keine Namen.
const KEY = 'digitale-bildung-zuletzt';
const MAX = 3;

export interface RecentEntry {
  to: string;
  title: string;
  sub: string;
}

export function loadRecent(): RecentEntry[] {
  try {
    const value = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    return Array.isArray(value)
      ? value.filter((e) => typeof e?.to === 'string' && typeof e?.title === 'string').slice(0, MAX)
      : [];
  } catch {
    return [];
  }
}

export function rememberRecent(entry: RecentEntry) {
  try {
    const rest = loadRecent().filter((e) => e.title !== entry.title);
    localStorage.setItem(KEY, JSON.stringify([entry, ...rest].slice(0, MAX)));
  } catch {
    // Speicher nicht verfügbar: Die Liste bleibt dann einfach leer.
  }
}

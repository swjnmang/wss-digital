// Sitzungsspeicher: Der Stand einer Seite (erledigte Aufgaben, Eingaben, Punkte …) bleibt im localStorage erhalten, damit er
// nach „Zurück“, Neuladen oder einem vom Browser verworfenen Tab noch da ist. Er verfällt 30 Minuten nach der letzten Aktion.
// Pro Seite gibt es genau einen Eintrag mit einem gemeinsamen Zeitstempel, sodass der Stand nie nur teilweise verfällt.
// Auf gemeinsam genutzten Geräten hilft der Knopf „Neu beginnen“ (reset).

const PRAEFIX = 'mt-sitzung:v1:'
/** 30 Minuten ab der letzten Aktion */
export const SITZUNG_FRIST_MS = 30 * 60 * 1000
const SCHREIB_PAUSE_MS = 300

type Gespeichert = { t: number; slots: Record<string, unknown> }

const speicher = (): Storage | null => {
  try {
    return window.localStorage
  } catch {
    return null
  }
}

let aufgeraeumt = false
/** Entfernt abgelaufene Einträge anderer Seiten, damit nichts liegen bleibt */
function raeumeAuf() {
  if (aufgeraeumt) return
  aufgeraeumt = true
  const s = speicher()
  if (!s) return
  try {
    const jetzt = Date.now()
    for (let i = s.length - 1; i >= 0; i--) {
      const k = s.key(i)
      if (!k || !k.startsWith(PRAEFIX)) continue
      let abgelaufen = true
      try {
        const g = JSON.parse(s.getItem(k) ?? 'null') as Gespeichert | null
        abgelaufen = !g || typeof g.t !== 'number' || jetzt - g.t > SITZUNG_FRIST_MS
      } catch {
        /* kaputter Eintrag → weg */
      }
      if (abgelaufen) s.removeItem(k)
    }
  } catch {
    /* ohne Speicher gibt es nichts aufzuräumen */
  }
}

export class Sitzung {
  private slots: Record<string, unknown> = {}
  private t = 0
  private timer: number | undefined
  private offen = false

  constructor(readonly name: string) {
    raeumeAuf()
    const s = speicher()
    if (!s) return
    try {
      const g = JSON.parse(s.getItem(PRAEFIX + name) ?? 'null') as Gespeichert | null
      if (g && typeof g.t === 'number' && g.slots && typeof g.slots === 'object' && Date.now() - g.t <= SITZUNG_FRIST_MS) {
        this.slots = g.slots
        this.t = g.t
      } else if (g) {
        s.removeItem(PRAEFIX + name)
      }
    } catch {
      /* kaputter Eintrag → leer starten */
    }
  }

  /** Gibt es einen gespeicherten Stand dieser Seite? */
  get vorhanden() {
    return Object.keys(this.slots).length > 0
  }

  get<T>(slot: string): T | undefined {
    return this.slots[slot] as T | undefined
  }

  set(slot: string, wert: unknown) {
    this.slots[slot] = wert
    this.t = Date.now()
    this.offen = true
    if (this.timer === undefined) this.timer = window.setTimeout(() => this.flush(), SCHREIB_PAUSE_MS)
  }

  /** Schreibt ausstehende Änderungen sofort (beim Verlassen der Seite) */
  flush() {
    if (this.timer !== undefined) {
      window.clearTimeout(this.timer)
      this.timer = undefined
    }
    if (!this.offen) return
    this.offen = false
    try {
      speicher()?.setItem(PRAEFIX + this.name, JSON.stringify({ t: this.t, slots: this.slots } satisfies Gespeichert))
    } catch {
      /* Speicher voll oder gesperrt → Stand bleibt nur im Arbeitsspeicher */
    }
  }

  /** „Neu beginnen“: gespeicherten Stand löschen */
  reset() {
    if (this.timer !== undefined) window.clearTimeout(this.timer)
    this.timer = undefined
    this.offen = false
    this.slots = {}
    this.t = 0
    try {
      speicher()?.removeItem(PRAEFIX + this.name)
    } catch {
      /* nichts zu löschen */
    }
  }
}

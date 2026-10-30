import { createContext, useContext, useEffect, useId, useRef, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react'
import { Sitzung } from '../utils/sitzung'

// React-Anbindung des Sitzungsspeichers (src/utils/sitzung.ts). Innerhalb von <SitzungProvider> behalten die Hooks ihren Wert nach
// Zurück/Neuladen (30 Minuten ab der letzten Aktion); außerhalb verhalten sie sich wie ein gewöhnliches useState.
// Die Zuordnung zum gespeicherten Wert läuft über die Reihenfolge, in der die Bausteine beim Öffnen der Seite eingehängt werden
// (je Art durchnummeriert), dazu eine Signatur (z. B. die Feldnamen). Bausteine dürfen daher nur gespeichert werden, wenn sie
// nicht erst später durch Eingaben der SuS eingehängt werden.

type Kontext = { sitzung: Sitzung; neuerSlot: (art: string, signatur?: string) => string }
const SitzungCtx = createContext<Kontext | null>(null)

export function SitzungProvider({ name, children }: { name: string; children: ReactNode }) {
  const ref = useRef<Kontext | null>(null)
  if (!ref.current) {
    const sitzung = new Sitzung(name)
    const zaehler: Record<string, number> = {}
    ref.current = {
      sitzung,
      neuerSlot: (art, signatur = '') => {
        zaehler[art] = (zaehler[art] ?? -1) + 1
        return `${art}:${zaehler[art]}:${signatur}`
      },
    }
  }
  const { sitzung } = ref.current
  // Ausstehende Änderungen beim Verlassen schreiben, auch beim Schließen des Tabs und beim Wechsel in den Hintergrund (Handy)
  useEffect(() => {
    const flush = () => sitzung.flush()
    const sichtbar = () => document.visibilityState === 'hidden' && flush()
    window.addEventListener('pagehide', flush)
    document.addEventListener('visibilitychange', sichtbar)
    return () => {
      window.removeEventListener('pagehide', flush)
      document.removeEventListener('visibilitychange', sichtbar)
      flush()
    }
  }, [sitzung])
  return <SitzungCtx.Provider value={ref.current}>{children}</SitzungCtx.Provider>
}

/** Der Sitzungsspeicher der umgebenden Seite (null außerhalb eines SitzungProviders) */
export const useSitzung = () => useContext(SitzungCtx)?.sitzung ?? null

/**
 * Wie useState, aber der Wert überlebt Zurück und Neuladen. art: Art des Bausteins (z. B. 'check'), signatur: Merkmal, an dem
 * ein veralteter Stand erkannt wird (z. B. die Feldnamen). Werte müssen JSON-tauglich sein (keine Set/Map/Funktionen).
 */
export function useSitzungState<T>(art: string, initial: T | (() => T), signatur = ''): [T, Dispatch<SetStateAction<T>>] {
  const ctx = useContext(SitzungCtx)
  const slot = useRef<string | null>(null)
  if (slot.current === null) slot.current = ctx ? ctx.neuerSlot(art, signatur) : ''
  const wiederhergestellt = useRef(false)
  const [wert, setWert] = useState<T>(() => {
    if (ctx && slot.current) {
      const gespeichert = ctx.sitzung.get<T>(slot.current)
      if (gespeichert !== undefined) {
        wiederhergestellt.current = true
        return gespeichert
      }
    }
    return typeof initial === 'function' ? (initial as () => T)() : initial
  })
  // Ein einfacher Anfangswert wird nicht geschrieben (das Öffnen allein verlängert die Frist nicht). Ein per Funktion erzeugter
  // Anfangswert (z. B. zufällige Aufgaben) wird dagegen gleich gespeichert, sonst entstünden nach dem Neuladen andere Aufgaben.
  const erster = useRef(true)
  const erzeugt = typeof initial === 'function'
  useEffect(() => {
    if (erster.current) {
      erster.current = false
      if (!(erzeugt && !wiederhergestellt.current)) return
    }
    if (ctx && slot.current) ctx.sitzung.set(slot.current, wert)
  }, [wert])
  return [wert, setWert]
}

/** Stabile Kennung eines Bausteins über Neuladen hinweg (statt useId); ohne Sitzung die gewöhnliche useId */
export function useSitzungId(art: string): string {
  const ctx = useContext(SitzungCtx)
  const eigene = useId()
  const slot = useRef<string | null>(null)
  if (slot.current === null) slot.current = ctx ? ctx.neuerSlot(art) : ''
  return slot.current || eigene
}

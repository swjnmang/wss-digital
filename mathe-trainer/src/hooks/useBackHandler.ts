import { useEffect, useRef } from 'react'

// Zurück-Button im Kopf: Zeigt eine Seite gerade eine Unteransicht (z. B. einen gewählten Schwierigkeitsgrad
// oder eine Lernsituation), führt der Button zuerst zurück zur Auswahl auf derselben Seite statt eine Ebene höher.

type Handler = () => void

const stack: { current: Handler }[] = []

/** Meldet eine Unteransicht an, solange `active` wahr ist; `onBack` führt zurück zur Auswahl. */
export function useBackHandler(active: boolean, onBack: Handler) {
  const ref = useRef<Handler>(onBack)
  ref.current = onBack

  useEffect(() => {
    if (!active) return
    const entry = { current: () => ref.current() }
    stack.push(entry)
    return () => {
      const i = stack.indexOf(entry)
      if (i !== -1) stack.splice(i, 1)
    }
  }, [active])
}

/** Führt die zuletzt angemeldete Unteransicht zurück; liefert false, wenn keine aktiv ist. */
export function runBackHandler(): boolean {
  const entry = stack[stack.length - 1]
  if (!entry) return false
  entry.current()
  window.scrollTo({ top: 0 })
  return true
}

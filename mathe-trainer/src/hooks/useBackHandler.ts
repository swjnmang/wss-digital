import { useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

// Zurück zur Auswahl: Zeigt eine Seite gerade eine Unteransicht (z. B. einen gewählten Schwierigkeitsgrad
// oder eine Lernsituation), führen der Zurück-Button im Kopf, der Zurück-Knopf des Browsers und die
// Zurück-Geste am Handy/Tablet zuerst zurück zur Auswahl auf derselben Seite statt eine Ebene höher.
// Dafür legt die Unteransicht einen eigenen Verlaufseintrag (gleiche Adresse, Markierung im state) an.

type Handler = () => void

const stack: { current: Handler }[] = []
let nextId = 1

type SubViewState = { subView?: number } | null | undefined

/** Meldet eine Unteransicht an, solange `active` wahr ist; `onBack` führt zurück zur Auswahl. */
export function useBackHandler(active: boolean, onBack: Handler) {
  const navigate = useNavigate()
  const location = useLocation()
  const ref = useRef<Handler>(onBack)
  ref.current = onBack
  // Kennung des Verlaufseintrags, den diese Unteransicht angelegt hat
  const pushedId = useRef<number | null>(null)
  const state = location.state as SubViewState

  // Seite neu geladen o. Ä. auf einem alten Eintrag einer Unteransicht → Markierung entfernen
  useEffect(() => {
    if (state?.subView && !active) {
      const rest = { ...state }
      delete rest.subView
      navigate({ pathname: location.pathname, search: location.search, hash: location.hash }, { replace: true, state: rest })
    }
  }, [])

  // Unteransicht geöffnet → Verlaufseintrag anlegen; in der Seite geschlossen → Eintrag wieder entfernen
  useEffect(() => {
    if (active && pushedId.current === null) {
      const id = nextId++
      pushedId.current = id
      navigate(
        { pathname: location.pathname, search: location.search, hash: location.hash },
        { state: { ...(typeof state === 'object' && state ? state : {}), subView: id } },
      )
    } else if (!active && pushedId.current !== null) {
      const id = pushedId.current
      pushedId.current = null
      if (state?.subView === id) navigate(-1)
    }
  }, [active])

  // Browser-Zurück: Der Eintrag der Unteransicht ist nicht mehr der aktuelle → zur Auswahl
  useEffect(() => {
    if (pushedId.current !== null && state?.subView !== pushedId.current) {
      pushedId.current = null
      ref.current()
      window.scrollTo({ top: 0 })
    }
  }, [state])

  // Für den Zurück-Button im Kopf
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

import { useEffect } from 'react'

/**
 * Automatische Prüfung für alle Aufgaben der App.
 *
 * Sobald der Schüler eine Eingabe macht, wird nach einer kurzen Tipp-Pause
 * (oder beim Verlassen des Feldes) der zur Aufgabe gehörende „Prüfen“-Button
 * ausgelöst – aber nur, wenn alle Felder dieser Aufgabe ausgefüllt sind und
 * sich die Eingaben seit der letzten Prüfung geändert haben.
 *
 * Neue Seiten müssen dafür nichts tun: Es genügt ein Button mit der Beschriftung
 * „Prüfen“ / „Überprüfen“ / „Lösung prüfen“ / „Antwort prüfen“ in derselben
 * Aufgabenkarte wie die Eingabefelder.
 * Abschalten für einen Bereich: Attribut `data-no-autocheck` setzen.
 * In Prüfungsmodus-Seiten (URL enthält „pruefung“) ist die Funktion aus.
 */

const TIPP_PAUSE_MS = 1200
const BLUR_DELAY_MS = 150

const CHECK_LABEL = /^\W*((lösung|antwort|alle|ergebnis|ergebnisse|eingabe|eingaben)\s+)?(über)?prüfen\W*$/i

type Field = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement

const IGNORED_INPUT_TYPES = new Set(['button', 'submit', 'reset', 'hidden', 'range', 'checkbox', 'file', 'image', 'color'])

function isField(el: EventTarget | null): el is Field {
  if (el instanceof HTMLInputElement) return !IGNORED_INPUT_TYPES.has(el.type)
  return el instanceof HTMLSelectElement || el instanceof HTMLTextAreaElement
}

function isUsable(el: HTMLElement) {
  if ((el as HTMLButtonElement).disabled || (el as HTMLInputElement).readOnly) return false
  return el.offsetParent !== null || el.getClientRects().length > 0
}

function isCheckButton(el: Element): el is HTMLButtonElement {
  if (!(el instanceof HTMLButtonElement)) return false
  const text = (el.textContent || '').replace(/\s+/g, ' ').trim()
  return text.length > 0 && text.length < 40 && CHECK_LABEL.test(text)
}

function before(a: Node, b: Node) {
  return (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0
}

/** Sucht den Prüfen-Button der Aufgabe, zu der das Feld gehört, und deren Felder. */
function findTask(field: Field): { button: HTMLButtonElement; fields: Field[] } | null {
  let container: HTMLElement | null = field.parentElement
  while (container && container.tagName !== 'MAIN') {
    const buttons = Array.from(container.querySelectorAll('button')).filter(isCheckButton).filter(isUsable)
    if (buttons.length > 0) {
      // Erster Prüfen-Button nach dem Feld, sonst der letzte davor
      const button = buttons.find(b => before(field, b)) ?? buttons[buttons.length - 1]
      const index = buttons.indexOf(button)
      const previous = index > 0 ? buttons[index - 1] : null
      const fields = Array.from(container.querySelectorAll<Field>('input, select, textarea'))
        .filter(isField)
        .filter(isUsable)
        .filter(f => before(f, button) && (!previous || before(previous, f)))
      return { button, fields }
    }
    container = container.parentElement
  }
  return null
}

function allFilled(fields: Field[]) {
  const radioGroups = new Map<string, boolean>()
  for (const f of fields) {
    if (f instanceof HTMLInputElement && f.type === 'radio') {
      radioGroups.set(f.name, (radioGroups.get(f.name) ?? false) || f.checked)
    } else if (f.value.trim() === '') {
      return false
    }
  }
  return Array.from(radioGroups.values()).every(Boolean)
}

function snapshot(fields: Field[]) {
  return fields
    .map(f => (f instanceof HTMLInputElement && f.type === 'radio' ? `${f.name}=${f.checked}` : f.value.trim()))
    .join('\u0001')
}

export function useAutoCheck(pathname: string) {
  useEffect(() => {
    if (/pruefung/i.test(pathname)) return

    const lastChecked = new WeakMap<HTMLButtonElement, string>()
    let timer: number | undefined
    let pendingField: Field | null = null

    const run = () => {
      timer = undefined
      const field = pendingField
      pendingField = null
      if (!field || !field.isConnected || field.closest('[data-no-autocheck]')) return
      const task = findTask(field)
      if (!task || task.fields.length === 0 || !allFilled(task.fields)) return
      if (lastChecked.get(task.button) === snapshot(task.fields)) return
      task.button.click()
    }

    const schedule = (field: Field, delay: number) => {
      pendingField = field
      window.clearTimeout(timer)
      timer = window.setTimeout(run, delay)
    }

    const onInput = (e: Event) => {
      if (isField(e.target) && e.target.closest('main')) schedule(e.target, TIPP_PAUSE_MS)
    }

    const onFocusOut = (e: FocusEvent) => {
      if (isField(e.target) && e.target === pendingField) schedule(e.target, BLUR_DELAY_MS)
    }

    // Jede Prüfung (automatisch oder per Klick) merken, damit unveränderte Eingaben
    // nicht erneut geprüft und im Tracking doppelt gezählt werden.
    const onClick = (e: MouseEvent) => {
      const button = (e.target as Element | null)?.closest?.('button')
      if (!button || !isCheckButton(button)) return
      const firstField = Array.from(document.querySelectorAll<Field>('main input, main select, main textarea'))
        .filter(isField)
        .reverse()
        .find(f => before(f, button))
      const task = firstField ? findTask(firstField) : null
      if (task && task.button === button) lastChecked.set(button, snapshot(task.fields))
    }

    document.addEventListener('input', onInput)
    document.addEventListener('change', onInput)
    document.addEventListener('focusout', onFocusOut)
    document.addEventListener('click', onClick, true)
    return () => {
      window.clearTimeout(timer)
      document.removeEventListener('input', onInput)
      document.removeEventListener('change', onInput)
      document.removeEventListener('focusout', onFocusOut)
      document.removeEventListener('click', onClick, true)
    }
  }, [pathname])
}

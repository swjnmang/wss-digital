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
 * „Prüfen“, „Überprüfen“, „Auswerten“ oder „<ein, zwei Wörter> prüfen“
 * (z. B. „Lösung prüfen“, „Baumdiagramm prüfen“) in derselben Aufgabenkarte wie die Eingabefelder.
 * Abschalten für einen Bereich: Attribut `data-no-autocheck` setzen.
 * In Prüfungsmodus-Seiten (URL enthält „pruefung“) ist die Funktion aus.
 *
 * Zusätzlich werden die Felder nach jeder Prüfung grün/rot markiert (Attribut
 * `data-check="ok" | "no"`, Styles in `styles/kit.css`). Grundlage ist die
 * Rückmeldung, die die Seite nach dem Prüfen neu anzeigt („Richtig!“ / „Leider falsch“):
 * - eine Aufgabe mit nur einem Feld: Feld grün bzw. rot
 * - mehrere Felder und alles richtig: alle Felder grün
 * - mehrere Felder und etwas falsch: hier muss die Seite selbst die falschen Felder markieren,
 *   denn nur sie weiß, welche falsch sind – mit `fieldCheckClass(...)` aus `utils/fieldCheck.ts`.
 * Seiten, die ihre Felder selbst einfärben, behalten ihre Farben (Tailwind/Module gewinnen).
 */

const TIPP_PAUSE_MS = 1200
const BLUR_DELAY_MS = 150

const CHECK_LABEL = /^\W*([a-zäöüß]+\s+){0,2}((über)?prüfen|auswerten)\W*$/i

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
      // Felder der ganzen Aufgabe, auch wenn sie in anderen Blöcken als der Button stehen
      const scope = taskScope(button)
      let fields = Array.from(scope.querySelectorAll<Field>('input, select, textarea')).filter(isField).filter(isUsable)
      const scopeButtons = Array.from(scope.querySelectorAll('button')).filter(isCheckButton).filter(isUsable)
      if (scopeButtons.length > 1) {
        // Mehrere Aufgaben ohne eigene Hülle: nur die Felder zwischen vorigem und diesem Button
        const index = scopeButtons.indexOf(button)
        const previous = index > 0 ? scopeButtons[index - 1] : null
        fields = fields.filter(f => before(f, button) && (!previous || before(previous, f)))
      }
      return { button, fields }
    }
    container = container.parentElement
  }
  return null
}

/** Die ganze Aufgabe: größter Vorfahre, der nur diesen einen Prüfen-Button enthält. */
function taskScope(button: HTMLButtonElement): HTMLElement {
  let scope: HTMLElement = button.parentElement ?? button
  while (scope.parentElement && scope.parentElement.tagName !== 'MAIN') {
    const others = Array.from(scope.parentElement.querySelectorAll('button')).filter(isCheckButton).filter(isUsable)
    if (others.some(b => b !== button)) break
    scope = scope.parentElement
  }
  return scope
}

function textLines(el: HTMLElement) {
  return el.innerText.split('\n').map(l => l.trim()).filter(Boolean)
}

const NEGATIVE = /nicht\s+ganz|nicht\s+(richtig|korrekt)|falsch|leider|fehler|fehlt|fehlen|stimmt\s+(noch\s+)?nicht|noch\s+nicht|richtige\s+(lösung|antwort|ergebnis|wert)|korrekt\s+wäre|(über)?prüfe\s.*noch\s+(ein)?mal|versuch.{0,6}(noch|erneut|nochmal)|✗|✘|❌/i
const POSITIVE = /richtig|korrekt|super|sehr gut|perfekt|klasse|toll|genau so|stimmt|ausgezeichnet|prima|gut gemacht|✓|✔|✅/i

/** Wertet die nach dem Prüfen neu erschienenen Zeilen aus. */
function classify(baseline: Set<string>, scope: HTMLElement): 'ok' | 'no' | null {
  const fresh = textLines(scope).filter(l => !baseline.has(l) && l.length < 200)
  // „3 von 4 richtig“: nur vollständig richtig zählt als richtig
  for (const l of fresh) {
    const m = l.match(/(\d+)\s*(von|\/)\s*(\d+)/)
    if (m && /richtig|korrekt|gelöst/i.test(l)) return Number(m[1]) === Number(m[3]) ? 'ok' : 'no'
  }
  if (fresh.some(l => NEGATIVE.test(l))) return 'no'
  if (fresh.some(l => POSITIVE.test(l))) return 'ok'
  return null
}

function allFilled(fields: Field[]) {
  const radioGroups = new Map<string, boolean>()
  for (const f of fields) {
    if (f instanceof HTMLInputElement && f.type === 'radio') {
      radioGroups.set(f.name, (radioGroups.get(f.name) ?? false) || f.checked)
    } else if (f.value.trim() === '' || (f instanceof HTMLSelectElement && /^[-–—]+$/.test(f.value.trim()))) {
      // Auswahllisten mit Platzhalter „-“ gelten als leer
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
    const baselines = new WeakMap<HTMLElement, Set<string>>()
    const colored = new Map<Field, string>()
    // Ein Timer pro Aufgabe (Prüfen-Button), damit beim schnellen Wechsel keine Aufgabe verloren geht
    const timers = new Map<HTMLButtonElement, { timer: number; field: Field }>()

    const setCheck = (field: Field, state: 'ok' | 'no' | null) => {
      if (state) {
        field.setAttribute('data-check', state)
        colored.set(field, field.value)
      } else {
        field.removeAttribute('data-check')
        colored.delete(field)
      }
    }

    const run = (field: Field) => {
      if (!field.isConnected || field.closest('[data-no-autocheck]')) return
      const task = findTask(field)
      // Feld gehört zu keiner Aufgabe mit eigenem Prüfen-Button
      if (!task || !task.fields.includes(field) || !allFilled(task.fields)) return
      if (lastChecked.get(task.button) === snapshot(task.fields)) return
      task.button.click()
    }

    const schedule = (field: Field, delay: number) => {
      const task = findTask(field)
      if (!task || !task.fields.includes(field)) return
      const pending = timers.get(task.button)
      if (pending) window.clearTimeout(pending.timer)
      const timer = window.setTimeout(() => {
        timers.delete(task.button)
        run(field)
      }, delay)
      timers.set(task.button, { timer, field })
    }

    const onInput = (e: Event) => {
      if (!isField(e.target) || !e.target.closest('main')) return
      const field = e.target
      setCheck(field, null)
      const task = findTask(field)
      if (task && task.fields.includes(field)) {
        const scope = taskScope(task.button)
        if (!baselines.has(scope)) baselines.set(scope, new Set(textLines(scope)))
      }
      schedule(field, TIPP_PAUSE_MS)
    }

    const onFocusOut = (e: FocusEvent) => {
      if (!isField(e.target)) return
      const target = e.target
      // Nur beschleunigen, wenn für diese Aufgabe gerade eine Prüfung ansteht
      for (const pending of timers.values()) {
        if (pending.field === target) return schedule(target, BLUR_DELAY_MS)
      }
    }

    /** Nach einer Prüfung: merken (keine doppelte Prüfung) und Felder einfärben. */
    const afterCheck = (task: { button: HTMLButtonElement; fields: Field[] }) => {
      lastChecked.set(task.button, snapshot(task.fields))
      const scope = taskScope(task.button)
      const baseline = baselines.get(scope) ?? new Set(textLines(scope))
      baselines.set(scope, baseline)
      const fields = task.fields.filter(f => !(f instanceof HTMLInputElement && f.type === 'radio'))
      const apply = () => {
        const result = classify(baseline, scope)
        if (result === 'ok') fields.forEach(f => f.isConnected && setCheck(f, 'ok'))
        else if (result === 'no' && fields.length === 1) setCheck(fields[0], 'no')
        else fields.forEach(f => setCheck(f, null))
      }
      window.setTimeout(apply, 60)
      window.setTimeout(apply, 450)
    }

    const taskOfButton = (button: HTMLButtonElement) => {
      const candidates = [
        ...Array.from(taskScope(button).querySelectorAll<Field>('input, select, textarea')).filter(isField),
        ...Array.from(document.querySelectorAll<Field>('main input, main select, main textarea'))
          .filter(isField)
          .reverse()
          .filter(f => before(f, button)),
      ]
      for (const f of candidates) {
        const task = findTask(f)
        if (task && task.button === button) return task
      }
      return null
    }

    const onClick = (e: MouseEvent) => {
      const button = (e.target as Element | null)?.closest?.('button')
      if (!button || !button.closest('main')) return
      if (isCheckButton(button)) {
        const task = taskOfButton(button)
        if (task) afterCheck(task)
        return
      }
      // Anderer Button der Aufgabe (neue Aufgabe, Lösung anzeigen …): Ausgangstext neu erfassen
      const checkButtons = Array.from(document.querySelectorAll('main button')).filter(isCheckButton)
      for (const cb of checkButtons) {
        const scope = taskScope(cb)
        if (scope.contains(button)) baselines.delete(scope)
      }
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Enter' || !isField(e.target)) return
      const task = findTask(e.target)
      if (task && allFilled(task.fields)) afterCheck(task)
    }

    // Neue Aufgabe ohne Eingabe-Ereignis (z. B. automatisch generiert): veraltete Farben entfernen
    const observer = new MutationObserver(() => {
      colored.forEach((value, field) => {
        if (!field.isConnected) colored.delete(field)
        else if (field.value !== value) setCheck(field, null)
      })
    })
    const main = document.querySelector('main')
    if (main) observer.observe(main, { childList: true, subtree: true, characterData: true })

    document.addEventListener('input', onInput)
    document.addEventListener('change', onInput)
    document.addEventListener('focusout', onFocusOut)
    document.addEventListener('click', onClick, true)
    document.addEventListener('keydown', onKeyDown, true)
    return () => {
      observer.disconnect()
      document.removeEventListener('keydown', onKeyDown, true)
      timers.forEach(p => window.clearTimeout(p.timer))
      document.removeEventListener('input', onInput)
      document.removeEventListener('change', onInput)
      document.removeEventListener('focusout', onFocusOut)
      document.removeEventListener('click', onClick, true)
    }
  }, [pathname])
}

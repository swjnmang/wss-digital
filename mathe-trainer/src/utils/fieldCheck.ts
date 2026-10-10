/**
 * Einheitliche Einfärbung von Eingabefeldern nach dem Prüfen.
 * Richtig (grün): `true`, 'correct', 'right', 'ok'. Falsch (rot): `false`, 'incorrect', 'wrong', 'no'.
 * Alles andere (null, undefined, 'empty' …) = noch nicht geprüft.
 *
 *   <input className={`… ${fieldCheckClass(feldRichtig.a)}`} />
 */
export function fieldCheckClass(state: boolean | string | null | undefined): string {
  if (state === true || state === 'correct' || state === 'right' || state === 'ok') return 'bk-field-ok'
  if (state === false || state === 'incorrect' || state === 'wrong' || state === 'no') return 'bk-field-no'
  return ''
}

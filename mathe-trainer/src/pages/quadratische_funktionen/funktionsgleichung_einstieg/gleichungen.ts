import { tx } from '../../lineare_funktionen/lernsituation_kit/kit'

// Lineare Gleichungen a·x + b·y = c für „Das Gleichungs-Labor“ und das Bonus-Spiel „Ballon-Labor“.

/** Lineare Gleichung a·x + b·y = c */
export type Gl = { a: number; b: number; c: number }

/** Gleichung als TeX, z. B. „3x + 2y = 12“; mitNull zeigt auch „0y“ (im Labor, damit man sieht, was wegfällt) */
export const glTex = (g: Gl, mitNull = false) => {
  const teil = (k: number, v: string, erst: boolean) => {
    if (k === 0 && !mitNull) return ''
    const betrag = Math.abs(k)
    const zahl = betrag === 1 ? '' : tx(betrag)
    const zeichen = k < 0 ? (erst ? '-' : ' - ') : erst ? '' : ' + '
    return `${zeichen}${zahl}${v}`
  }
  const x = teil(g.a, 'x', true)
  const links = x + teil(g.b, 'y', x === '') || '0'
  return `${links} = ${tx(g.c)}`
}

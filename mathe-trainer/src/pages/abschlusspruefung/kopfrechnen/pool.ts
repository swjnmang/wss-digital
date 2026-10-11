import { AUFGABEN_AP } from './aufgabenAP'
import { AUFGABEN_NEU } from './aufgabenNeu'
import { blockVon, type Aufgabe, type Block } from './typen'
import { blockZiehen } from './pruefen'

export const POOL: Aufgabe[] = [...AUFGABEN_AP, ...AUFGABEN_NEU]

export const poolFuerBlock = (b: Block) => POOL.filter((a) => blockVon(a.thema) === b)

/** Punkte je Block wie in Teil A der Abschlussprüfung: Pflichtblock 7, Wahlblöcke je 4 */
export const BLOCK_PUNKTE: Record<Block, number> = { pflicht: 7, trigo: 4, daten: 4, raum: 4 }

export function teilAZiehen(wahl: Block[]): { block: Block; aufgaben: Aufgabe[] }[] {
  return (['pflicht', ...wahl] as Block[]).map((b) => ({ block: b, aufgaben: blockZiehen(poolFuerBlock(b), BLOCK_PUNKTE[b]) }))
}

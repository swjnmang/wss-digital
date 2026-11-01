import type { ReactNode } from 'react'
import type { AreaId } from '../../data/areas'

// Bereichs-Symbole „Anwendungsbilder“ (Variante C, Set 2): Strich in der Textfarbe, Füllung in der Kartenfarbe.
// Zeichenfläche 72 × 48; die Größe bestimmt der Aufrufer über die Höhe.

const S = { stroke: 'currentColor', strokeWidth: 2.5, strokeLinecap: 'round', strokeLinejoin: 'round' } as const
const W = 'var(--surface)'

const ICONS: Record<AreaId, ReactNode> = {
  // Waage: Gleichungen und Terme im Gleichgewicht
  rechnen: (
    <>
      <g {...S} fill="none">
        <path d="M36 6 V42 M24 44 H48 M12 12 H60" />
        <path d="M12 12 L4 28 H20 Z M60 12 L52 28 H68 Z" />
      </g>
      <circle cx="36" cy="6" r="3" fill="currentColor" />
    </>
  ),
  // Münzstapel, die wachsen
  finanz: (
    <>
      <g stroke="currentColor" strokeWidth="2.2" fill={W}>
        <ellipse cx="22" cy="40" rx="14" ry="4.5" />
        <ellipse cx="22" cy="33" rx="14" ry="4.5" />
        <ellipse cx="22" cy="26" rx="14" ry="4.5" />
        <ellipse cx="48" cy="40" rx="14" ry="4.5" />
        <ellipse cx="48" cy="33" rx="14" ry="4.5" />
        <ellipse cx="48" cy="26" rx="14" ry="4.5" />
        <ellipse cx="48" cy="19" rx="14" ry="4.5" />
        <ellipse cx="48" cy="12" rx="14" ry="4.5" />
      </g>
      <path d="M8 12 L22 4 M16 4 H22 V10" {...S} fill="none" />
    </>
  ),
  // zwei Geraden, die sich kreuzen
  linear: (
    <>
      <path d="M36 2 V46 M8 24 H66" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6 42 L66 8 M6 10 L66 38" {...S} strokeWidth={3} />
      <circle cx="36" cy="25" r="3.6" fill={W} stroke="currentColor" strokeWidth="2.5" />
    </>
  ),
  // Wurfbahn eines Balls
  quadrat: (
    <>
      <path d="M6 46 Q34 -18 66 46" {...S} fill="none" strokeDasharray="4 4" />
      <circle cx="50" cy="16" r="6" fill={W} stroke="currentColor" strokeWidth="2.5" />
      <path d="M2 46 H70" stroke="currentColor" strokeWidth="2" />
    </>
  ),
  // Würfel und Säulendiagramm
  daten: (
    <>
      <rect x="4" y="12" width="28" height="28" rx="6" fill={W} stroke="currentColor" strokeWidth="2.5" />
      <g fill="currentColor">
        <circle cx="12" cy="20" r="2.6" />
        <circle cx="18" cy="26" r="2.6" />
        <circle cx="24" cy="32" r="2.6" />
        <rect x="40" y="28" width="7" height="14" rx="1" />
        <rect x="51" y="14" width="7" height="28" rx="1" />
        <rect x="62" y="22" width="7" height="20" rx="1" />
      </g>
    </>
  ),
  // Zylinder und Kegel
  raum: (
    <g {...S} fill={W}>
      <path d="M6 10 V38 A12 4.5 0 0 0 30 38 V10" />
      <ellipse cx="18" cy="10" rx="12" ry="4.5" />
      <path d="M42 40 L54 4 L66 40" />
      <ellipse cx="54" cy="40" rx="12" ry="4.5" />
    </g>
  ),
  // Einheitskreis mit Sinuswelle
  trigo: (
    <>
      <circle cx="16" cy="24" r="13" fill={W} stroke="currentColor" strokeWidth="2.5" />
      <path d="M16 24 L25 15" {...S} />
      <path d="M25 15 H38" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 3" />
      <path d="M38 15 Q46 4 54 24 T70 33" {...S} strokeWidth={3} fill="none" />
    </>
  ),
}

export default function AreaIcon({ id, height = 48, className }: { id: AreaId; height?: number; className?: string }) {
  return (
    <svg viewBox="0 0 72 48" height={height} width={(height * 72) / 48} className={className} aria-hidden="true" focusable="false">
      {ICONS[id]}
    </svg>
  )
}

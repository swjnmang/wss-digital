import type { ReactNode } from 'react'

// Baumdiagramm von links nach rechts (wie in der Merkhilfe), beliebig viele Stufen und Äste.
// Wahrscheinlichkeiten an den Ästen als Text („0,6“) oder Bruch („3/10“, wird gestapelt gesetzt).
// Statt einer Zahl kann an einem Ast (key) oder am Pfadende (endKey) ein Eingabefeld stehen.

export interface Knoten {
  label: string
  /** Übergangswahrscheinlichkeit am Ast zu diesem Knoten */
  p?: string
  /** Eingabefeld statt p */
  key?: string
  children?: Knoten[]
  /** Text am Pfadende (nur Blätter), z. B. „P = 1/15“ */
  end?: string
  /** Eingabefeld am Pfadende */
  endKey?: string
  /** Pfad hervorheben (an Blättern setzen) */
  hi?: boolean
}

interface Props {
  root: Knoten[]
  F?: (key: string) => ReactNode
  /** Beschriftung der Stufen, z. B. ['1. Zug', '2. Zug'] */
  stages?: string[]
  /** Pfadnamen (z. B. „rg“) am Ende anzeigen */
  pathNames?: boolean
  label?: string
}

const STAGE_W = 170
const PAD_X = 24
const PAD_TOP = 34

interface Placed {
  node: Knoten
  x: number
  y: number
  parent?: Placed
  path: string[]
  hi: boolean
}

function leaves(n: Knoten): number {
  return n.children?.length ? n.children.reduce((s, c) => s + leaves(c), 0) : 1
}

function depth(nodes: Knoten[]): number {
  return Math.max(...nodes.map((n) => 1 + (n.children?.length ? depth(n.children) : 0)))
}

function hasHi(n: Knoten): boolean {
  return n.children?.length ? n.children.some(hasHi) : !!n.hi
}

function Prob({ x, y, text, color }: { x: number; y: number; text: string; color: string }) {
  const m = text.match(/^(\d+)\/(\d+)$/)
  if (m) {
    const w = Math.max(m[1].length, m[2].length) * 8 + 6
    return (
      <g fill={color} fontSize="14" fontWeight="700" textAnchor="middle">
        <rect x={x - w / 2 - 2} y={y - 18} width={w + 4} height={36} fill="var(--surface)" opacity="0.9" />
        <text x={x} y={y - 4}>{m[1]}</text>
        <line x1={x - w / 2} x2={x + w / 2} y1={y} y2={y} stroke={color} strokeWidth="1.3" />
        <text x={x} y={y + 14}>{m[2]}</text>
      </g>
    )
  }
  const w = text.length * 8 + 8
  return (
    <g fill={color} fontSize="15" fontWeight="700" textAnchor="middle">
      <rect x={x - w / 2} y={y - 12} width={w} height={20} fill="var(--surface)" opacity="0.9" />
      <text x={x} y={y + 4}>{text}</text>
    </g>
  )
}

export default function Baum({ root, F, stages, pathNames = true, label }: Props) {
  const total = root.reduce((s, n) => s + leaves(n), 0)
  // mit Eingabefeldern mehr Abstand, damit sich die Felder nicht überlappen
  const LEAF_H = F ? 84 : 50
  const d = depth(root)
  const anyEnd = root.some(function any(n: Knoten): boolean {
    return n.children?.length ? n.children.some(any) : !!(n.end || n.endKey)
  })
  const endW = 30 + (pathNames ? 50 : 0) + (anyEnd ? 170 : 0)
  const W = PAD_X * 2 + d * STAGE_W + endW
  const H = PAD_TOP + total * LEAF_H + 10

  const placed: Placed[] = []
  let leafIndex = 0
  const place = (n: Knoten, level: number, parent: Placed | undefined, path: string[]): Placed => {
    const p: Placed = { node: n, x: PAD_X + level * STAGE_W, y: 0, parent, path: [...path, n.label], hi: hasHi(n) }
    if (n.children?.length) {
      const kids = n.children.map((c) => place(c, level + 1, p, p.path))
      p.y = (kids[0].y + kids[kids.length - 1].y) / 2
    } else {
      p.y = PAD_TOP + leafIndex * LEAF_H + LEAF_H / 2
      leafIndex += 1
    }
    placed.push(p)
    return p
  }
  const top = root.map((n) => place(n, 1, undefined, []))
  const rootY = (top[0].y + top[top.length - 1].y) / 2
  const start = { x: PAD_X, y: rootY }

  const inputs: { key: string; x: number; y: number }[] = []

  return (
    <div className="lp-tree-scroll">
      <div className="lp-tree" style={{ width: W, maxWidth: 'none' }}>
        <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} role="img" aria-label={label ?? 'Baumdiagramm'}>
          {stages?.map((s, i) => (
            <text key={s} x={PAD_X + (i + 1) * STAGE_W} y={16} textAnchor="middle" fontSize="13" fill="var(--ink-muted)" fontWeight="700">
              {s}
            </text>
          ))}
          {placed.map((p, i) => {
            const from = p.parent ? { x: p.parent.x + 14, y: p.parent.y } : { x: start.x + 4, y: start.y }
            const to = { x: p.x - 14, y: p.y }
            const color = p.hi ? 'var(--primary)' : 'var(--ink)'
            const mx = (from.x + to.x) / 2
            const my = (from.y + to.y) / 2
            // Eingabefelder etwas näher am Astende, dort liegen die Äste weiter auseinander
            if (p.node.key) inputs.push({ key: p.node.key, x: from.x + (to.x - from.x) * 0.65, y: from.y + (to.y - from.y) * 0.65 })
            return (
              <g key={i}>
                <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke={color} strokeWidth={p.hi ? 3.5 : 1.6} strokeLinecap="round" />
                {p.node.p && !p.node.key && <Prob x={mx} y={my} text={p.node.p} color={p.hi ? 'var(--primary-ink)' : 'var(--ink)'} />}
              </g>
            )
          })}
          <circle cx={start.x} cy={start.y} r="4" fill="var(--ink)" />
          {placed.map((p, i) => {
            const leaf = !p.node.children?.length
            const endX = p.x + 26
            if (leaf && p.node.endKey) inputs.push({ key: p.node.endKey, x: endX + 120, y: p.y })
            return (
              <g key={`n${i}`}>
                <text x={p.x} y={p.y + 6} textAnchor="middle" fontSize="18" fontWeight="800" fill={p.hi ? 'var(--primary-ink)' : 'var(--ink)'}>
                  {p.node.label}
                </text>
                {leaf && pathNames && (
                  <text x={endX} y={p.y + 5} fontSize="14" fill="var(--ink-muted)">
                    {p.path.join('')}
                  </text>
                )}
                {leaf && p.node.end && (
                  <text x={endX + (pathNames ? 46 : 0)} y={p.y + 5} fontSize="14" fontWeight="700" fill={p.hi ? 'var(--primary-ink)' : 'var(--ink)'}>
                    {p.node.end}
                  </text>
                )}
              </g>
            )
          })}
        </svg>
        {F &&
          // Tab-Reihenfolge: Stufe für Stufe, jeweils von oben nach unten
          [...inputs].sort((a, b) => a.x - b.x || a.y - b.y).map((inp) => (
            <div key={inp.key} className="lp-tree-input" style={{ left: inp.x, top: inp.y }}>
              {F(inp.key)}
            </div>
          ))}
      </div>
    </div>
  )
}

import type { ReactNode } from 'react'
import type { SkizzeName } from './aufgaben'

// Skizzen zu den Anwendungsaufgaben (nicht maßstabsgetreu) im Heft-Stil: Koordinatensystem, Parabeln, Geraden, Punkte.

const INK = 'var(--ink)'
const BLUE = 'var(--primary-ink)'
const SOFT = 'var(--primary-soft)'
const MUTED = 'var(--line-strong)'
const FILL = '#eef1f6'
const TXT = { fontFamily: 'var(--font-body)', fontSize: 15, fill: INK } as const

const de = (n: number) => String(n).replace('.', ',')

interface Skala {
  x: (v: number) => number
  y: (v: number) => number
  kurve: (f: (x: number) => number, von: number, bis: number) => string
}

function Plot({ x, y, w, h, label, ticksX, ticksY, children }: {
  x: [number, number]; y: [number, number]; w: number; h: number; label: string
  ticksX?: number[]; ticksY?: number[]; children: (s: Skala) => ReactNode
}) {
  const rand = 28
  const sx = (v: number) => rand + ((v - x[0]) / (x[1] - x[0])) * (w - 2 * rand)
  const sy = (v: number) => h - rand - ((v - y[0]) / (y[1] - y[0])) * (h - 2 * rand)
  const kurve = (f: (x: number) => number, von: number, bis: number) => {
    const n = 80
    return Array.from({ length: n + 1 }, (_, i) => {
      const xv = von + ((bis - von) * i) / n
      return `${i ? 'L' : 'M'}${sx(xv).toFixed(1)} ${sy(f(xv)).toFixed(1)}`
    }).join(' ')
  }
  const s = { x: sx, y: sy, kurve }
  return (
    <div className="bk-anw-svg">
    <svg viewBox={`0 0 ${w} ${h}`} role="img" aria-label={label} style={{ width: '100%', minWidth: 520, height: 'auto', display: 'block' }}>
      <defs>
        <marker id="pfeil" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 z" fill={INK} />
        </marker>
      </defs>
      {children(s)}
      <line x1={sx(x[0])} y1={sy(0)} x2={sx(x[1])} y2={sy(0)} stroke={INK} strokeWidth={1.2} markerEnd="url(#pfeil)" />
      {x[0] <= 0 && <line x1={sx(0)} y1={sy(y[0])} x2={sx(0)} y2={sy(y[1])} stroke={INK} strokeWidth={1.2} markerEnd="url(#pfeil)" />}
      <text {...TXT} x={sx(x[1]) - 4} y={sy(0) + 16} textAnchor="end">x</text>
      {x[0] <= 0 && <text {...TXT} x={sx(0) + 6} y={sy(y[1]) + 4}>y</text>}
      {ticksX?.map((t) => (
        <g key={`tx${t}`}>
          <line x1={sx(t)} y1={sy(0) - 3} x2={sx(t)} y2={sy(0) + 3} stroke={INK} />
          <text {...TXT} fontSize={11} fill={MUTED} x={sx(t)} y={sy(0) + 15} textAnchor="middle">{de(t)}</text>
        </g>
      ))}
      {x[0] <= 0 && ticksY?.map((t) => (
        <g key={`ty${t}`}>
          <line x1={sx(0) - 3} y1={sy(t)} x2={sx(0) + 3} y2={sy(t)} stroke={INK} />
          <text {...TXT} fontSize={11} fill={MUTED} x={sx(0) - 6} y={sy(t) + 4} textAnchor="end">{de(t)}</text>
        </g>
      ))}
    </svg>
    </div>
  )
}

/** Punkt mit Beschriftung; dx/dy verschieben die Schrift */
function P({ s, x, y, t, dx = 6, dy = -8, anchor = 'start' }: { s: Skala; x: number; y: number; t: ReactNode; dx?: number; dy?: number; anchor?: 'start' | 'middle' | 'end' }) {
  return (
    <g>
      <circle cx={s.x(x)} cy={s.y(y)} r={4} fill={INK} />
      <text {...TXT} x={s.x(x) + dx} y={s.y(y) + dy} textAnchor={anchor}>{t}</text>
    </g>
  )
}

const parabel = (a: number, b: number, c: number) => (x: number) => a * x * x + b * x + c

export default function Skizze({ name }: { name: SkizzeName }) {
  switch (name) {
    case 'wurf': {
      const p = parabel(-0.01, 0.45, 2)
      const h = (x: number) => 0.15 * x - 1.8
      return (
        <Plot x={[-3, 46]} y={[-1, 9.5]} w={640} h={300} label="Flugparabel über eine Wand am Hang" ticksX={[10, 20, 30, 40]} ticksY={[2, 4, 6, 8]}>
          {(s) => (
            <>
              <path d={`M${s.x(12)} ${s.y(0)} L${s.x(45)} ${s.y(h(45))} L${s.x(45)} ${s.y(0)} Z`} fill={SOFT} />
              <line x1={s.x(12)} y1={s.y(0)} x2={s.x(45)} y2={s.y(h(45))} stroke={INK} strokeWidth={2.5} />
              <text {...TXT} x={s.x(20)} y={s.y(h(20)) - 8}>Hang h</text>
              <line x1={s.x(28)} y1={s.y(2.4)} x2={s.x(28)} y2={s.y(6.4)} stroke={INK} strokeWidth={5} />
              <text {...TXT} x={s.x(28) + 8} y={s.y(5.2)}>Wand 4 m</text>
              <path d={s.kurve(p, 0, 39.6)} fill="none" stroke={BLUE} strokeWidth={2} strokeDasharray="6 5" />
              <text {...TXT} fill={BLUE} x={s.x(30)} y={s.y(p(30)) - 10}>p</text>
              <P s={s} x={0} y={2} t="A (0 | 2)" />
              <P s={s} x={10} y={5.5} t="B (10 | 5,5)" dx={-4} dy={-10} anchor="end" />
              <P s={s} x={20} y={7} t="C (20 | 7)" dy={-10} />
              <P s={s} x={12} y={0} t="D (12 | 0)" dx={-4} dy={-10} anchor="end" />
              <P s={s} x={28} y={2.4} t="E (28 | 2,4)" dy={16} />
              <P s={s} x={39.6} y={4.14} t="F" dy={-8} />
            </>
          )}
        </Plot>
      )
    }
    case 'freiwurf': {
      const p1 = parabel(-0.25, 1.6, 2.5)
      const p2 = parabel(-0.5, 5.7, -15.4)
      return (
        <Plot x={[-0.5, 8.2]} y={[-0.4, 6.2]} w={560} h={340} label="Basketball-Freiwurf mit Bank an der Wand" ticksX={[1, 2, 3, 4, 5, 6, 7]} ticksY={[1, 2, 3, 4, 5]}>
          {(s) => (
            <>
              <rect x={s.x(7)} y={s.y(6)} width={s.x(8) - s.x(7)} height={s.y(0) - s.y(6)} fill={FILL} stroke={MUTED} />
              <text {...TXT} x={s.x(7.5)} y={s.y(5)} textAnchor="middle" fill={MUTED}>Wand</text>
              <line x1={s.x(6)} y1={s.y(3.1)} x2={s.x(7)} y2={s.y(3.1)} stroke={INK} strokeWidth={3} />
              <line x1={s.x(7)} y1={s.y(2.7)} x2={s.x(7)} y2={s.y(4.2)} stroke={INK} strokeWidth={4} />
              <path d={s.kurve(p1, 0, 6)} fill="none" stroke={BLUE} strokeWidth={2} strokeDasharray="6 5" />
              <text {...TXT} fill={BLUE} x={s.x(1)} y={s.y(p1(1)) - 10}>p₁</text>
              <line x1={s.x(5)} y1={s.y(0)} x2={s.x(7)} y2={s.y(1.6)} stroke={INK} strokeWidth={4} />
              <text {...TXT} x={s.x(6.3)} y={s.y(0.7)}>g</text>
              <line x1={s.x(6)} y1={s.y(3.1)} x2={s.x(6)} y2={s.y(0.8)} stroke={MUTED} strokeDasharray="3 4" />
              <text {...TXT} x={s.x(6) - 6} y={s.y(2)} textAnchor="end">f</text>
              <path d={s.kurve(p2, 4.4, 6)} fill="none" stroke={BLUE} strokeWidth={2} strokeDasharray="3 4" />
              <text {...TXT} fill={BLUE} x={s.x(4.9)} y={s.y(p2(4.9)) - 8}>p₂</text>
              <P s={s} x={0} y={2.5} t="A (0 | 2,5)" />
              <P s={s} x={2} y={4.7} t="B (2 | 4,7)" dy={-10} anchor="end" dx={-4} />
              <P s={s} x={6} y={3.1} t={<>K (6 | y<tspan baselineShift="sub" fontSize={10}>K</tspan>)</>} dx={-6} dy={-10} anchor="end" />
              <P s={s} x={5} y={0} t="P (5 | 0)" dx={-6} dy={16} anchor="end" />
              <P s={s} x={7} y={1.6} t="Q (7 | 1,6)" dx={-6} dy={-8} anchor="end" />
              <P s={s} x={6} y={0.8} t="C" dx={-12} dy={4} />
            </>
          )}
        </Plot>
      )
    }
    case 'feuerwehr': {
      const p = parabel(-0.12, 1.68, 2.12)
      return (
        <Plot x={[-0.6, 19.5]} y={[-0.5, 9.5]} w={620} h={330} label="Wasserstrahl auf das Dach einer Scheune" ticksX={[2, 4, 6, 8, 10, 12, 14, 16, 18]} ticksY={[2, 4, 6, 8]}>
          {(s) => (
            <>
              <rect x={s.x(10)} y={s.y(4)} width={s.x(16) - s.x(10)} height={s.y(0) - s.y(4)} fill={FILL} stroke={INK} strokeWidth={1.5} />
              <polygon points={`${s.x(10)},${s.y(4)} ${s.x(13)},${s.y(7.6)} ${s.x(16)},${s.y(4)}`} fill={FILL} />
              <line x1={s.x(9)} y1={s.y(2.8)} x2={s.x(13)} y2={s.y(7.6)} stroke={INK} strokeWidth={2.5} />
              <line x1={s.x(13)} y1={s.y(7.6)} x2={s.x(17.67)} y2={s.y(2)} stroke={INK} strokeWidth={2.5} />
              <line x1={s.x(11)} y1={s.y(5.2)} x2={s.x(12)} y2={s.y(6.4)} stroke={BLUE} strokeWidth={5} />
              <text {...TXT} x={s.x(13)} y={s.y(2)} textAnchor="middle" fill={MUTED}>Scheune</text>
              <text {...TXT} x={s.x(9)} y={s.y(3.4)} textAnchor="end">d₂</text>
              <text {...TXT} x={s.x(17)} y={s.y(3.6)}>d₁</text>
              <rect x={s.x(16.4)} y={s.y(0.8)} width={s.x(17.5) - s.x(16.4)} height={s.y(0.2) - s.y(0.8)} fill="var(--surface)" stroke={INK} />
              <circle cx={s.x(16.6)} cy={s.y(0.12)} r={4} fill={INK} /><circle cx={s.x(17.3)} cy={s.y(0.12)} r={4} fill={INK} />
              <path d={s.kurve(p, 0, 11.4)} fill="none" stroke={BLUE} strokeWidth={2.5} />
              <text {...TXT} fill={BLUE} x={s.x(2)} y={s.y(p(2)) - 10}>p</text>
              <P s={s} x={0} y={2.12} t="E" dx={8} dy={4} />
              <P s={s} x={4} y={6.92} t="W (4 | 6,92)" dy={-10} anchor="end" dx={-4} />
              <P s={s} x={7} y={8} t="S (7 | 8)" dy={-10} />
              <P s={s} x={16} y={4} t="A (16 | 4)" dx={8} dy={4} />
              <P s={s} x={14} y={6.4} t="B (14 | 6,4)" dx={8} dy={-4} />
              <P s={s} x={11} y={5.2} t="C" dx={-10} dy={4} />
              <P s={s} x={12} y={6.4} t="D" dx={-12} dy={-4} />
            </>
          )}
        </Plot>
      )
    }
    case 'haengebruecke': {
      const p1 = parabel(0.125, 2, 8)
      const p2 = parabel(0.1, -1.6, 8)
      const p3 = (x: number) => 0.125 * (x - 24) ** 2
      const seile = [-6, -4, -2, 2, 3, 4, 6, 8, 10, 12, 14, 18, 20, 22]
      const f = (x: number) => (x < 0 ? p1(x) : x <= 16 ? p2(x) : p3(x))
      return (
        <Plot x={[-11, 27]} y={[-8, 10]} w={640} h={340} label="Hängebrücke mit drei Parabelstücken über einen Fluss" ticksX={[-8, 8, 16, 24]} ticksY={[-6, 4, 8]}>
          {(s) => (
            <>
              <rect x={s.x(0)} y={s.y(-5)} width={s.x(16) - s.x(0)} height={s.y(-7) - s.y(-5)} fill={SOFT} />
              <text {...TXT} x={s.x(8)} y={s.y(-6.3)} textAnchor="middle" fill={BLUE}>Fluss</text>
              <line x1={s.x(-8)} y1={s.y(0)} x2={s.x(0)} y2={s.y(-6)} stroke={MUTED} strokeWidth={2} />
              <line x1={s.x(16)} y1={s.y(-6)} x2={s.x(24)} y2={s.y(0)} stroke={INK} strokeWidth={1.5} strokeDasharray="5 4" />
              <text {...TXT} x={s.x(21)} y={s.y(-3.5)}>g</text>
              {seile.map((x) => <line key={x} x1={s.x(x)} y1={s.y(0)} x2={s.x(x)} y2={s.y(f(x))} stroke={MUTED} />)}
              <line x1={s.x(3)} y1={s.y(0)} x2={s.x(3)} y2={s.y(p2(3))} stroke={BLUE} strokeWidth={2.5} />
              <text {...TXT} fill={BLUE} x={s.x(3) + 5} y={s.y(2)}>a₁</text>
              <line x1={s.x(0)} y1={s.y(-6)} x2={s.x(0)} y2={s.y(8.6)} stroke={INK} strokeWidth={4} />
              <line x1={s.x(16)} y1={s.y(-6)} x2={s.x(16)} y2={s.y(8.6)} stroke={INK} strokeWidth={4} />
              <text {...TXT} x={s.x(0) + 6} y={s.y(9.3)}>Stütze E</text>
              <text {...TXT} x={s.x(16) + 6} y={s.y(9.3)}>Stütze F</text>
              <path d={s.kurve(p1, -8, 0)} fill="none" stroke={INK} strokeWidth={2.5} />
              <path d={s.kurve(p2, 0, 16)} fill="none" stroke={INK} strokeWidth={2.5} />
              <path d={s.kurve(p3, 16, 24)} fill="none" stroke={INK} strokeWidth={2.5} />
              <text {...TXT} x={s.x(-4.5)} y={s.y(p1(-4.5)) - 8}>p₁</text>
              <text {...TXT} x={s.x(11)} y={s.y(p2(11)) - 8}>p₂</text>
              <text {...TXT} x={s.x(20)} y={s.y(p3(20)) - 8}>p₃</text>
              <P s={s} x={2} y={5.2} t="C (2 | 5,2)" dx={6} dy={-6} />
              <P s={s} x={4} y={3.2} t="D (4 | 3,2)" dx={6} dy={-6} />
              <P s={s} x={-8} y={0} t="A" dx={-4} dy={-8} anchor="end" />
              <P s={s} x={24} y={0} t="B (24 | 0)" dx={0} dy={-10} anchor="middle" />
              <P s={s} x={16} y={-6} t="G (16 | −6)" dx={6} dy={14} />
            </>
          )}
        </Plot>
      )
    }
    case 'skater': {
      const p = parabel(-0.25, 1.2, 1.05)
      const stufen = [[1, 1.6], [1.6, 1.3], [2.2, 1.0], [2.8, 0.7], [3.4, 0.45], [3.9, 0.2], [4.3, 0]] as const
      return (
        <Plot x={[-1.7, 6.8]} y={[-0.3, 3.1]} w={620} h={300} label="Skatesprung über Stufen auf die Straße" ticksX={[-1, 1, 2, 3, 4, 5, 6]} ticksY={[1, 2, 3]}>
          {(s) => {
            let d = `M${s.x(-1.6)} ${s.y(0)} L${s.x(-1.6)} ${s.y(1.6)}`
            let y = 1.6
            for (const [x, ny] of stufen) { d += ` L${s.x(x)} ${s.y(y)} L${s.x(x)} ${s.y(ny)}`; y = ny }
            d += ' Z'
            return (
              <>
                <path d={d} fill={FILL} stroke={INK} strokeWidth={1.5} />
                <rect x={s.x(4.3)} y={s.y(0)} width={s.x(5.3) - s.x(4.3)} height={10} fill="var(--line)" />
                <rect x={s.x(5.3)} y={s.y(0)} width={s.x(6.6) - s.x(5.3)} height={10} fill={MUTED} />
                <text {...TXT} fontSize={11} x={s.x(4.8)} y={s.y(0) + 24} textAnchor="middle">Schotter</text>
                <text {...TXT} fontSize={11} x={s.x(5.95)} y={s.y(0) + 24} textAnchor="middle">Straße</text>
                <polygon points={`${s.x(-1)},${s.y(1.6)} ${s.x(1)},${s.y(2)} ${s.x(1)},${s.y(1.6)}`} fill={SOFT} stroke={INK} strokeWidth={2} />
                <text {...TXT} x={s.x(0.2)} y={s.y(1.66)} textAnchor="middle">Rampe g</text>
                <path d={s.kurve(p, 1, 5.56)} fill="none" stroke={BLUE} strokeWidth={2} strokeDasharray="6 5" />
                <text {...TXT} fill={BLUE} x={s.x(2.6)} y={s.y(p(2.6)) - 10}>p</text>
                <P s={s} x={-1} y={1.6} t="A (−1 | 1,6)" dx={-4} dy={-10} anchor="middle" />
                <P s={s} x={1} y={2} t="C" dx={-14} dy={-6} />
                <P s={s} x={2} y={2.45} t="D (2 | 2,45)" dx={-6} dy={-10} anchor="end" />
                <P s={s} x={4} y={1.85} t="E (4 | 1,85)" dx={8} dy={-6} />
              </>
            )
          }}
        </Plot>
      )
    }
    case 'glastunnel': {
      const p = parabel(-0.25, 3, -2.75)
      const g = (x: number) => 0.5 * x + 3.5
      return (
        <Plot x={[-5, 13.5]} y={[-0.4, 10]} w={600} h={340} label="Glastunnel mit Rolltreppe und Besucherplattform" ticksX={[-4, -2, 2, 4, 6, 8, 10, 12]} ticksY={[2, 4, 6, 8]}>
          {(s) => (
            <>
              <path d={`${s.kurve(p, 1, 11)} Z`} fill={SOFT} stroke={INK} strokeWidth={2.5} />
              <rect x={s.x(4)} y={s.y(3.2)} width={s.x(8) - s.x(4)} height={s.y(0.3) - s.y(3.2)} rx={10} fill="var(--surface)" stroke={INK} strokeWidth={1.5} />
              <text {...TXT} x={s.x(6)} y={s.y(1.6)} textAnchor="middle">Bahn</text>
              <line x1={s.x(-4.5)} y1={s.y(g(-4.5))} x2={s.x(10)} y2={s.y(8.5)} stroke={INK} strokeWidth={2} />
              <text {...TXT} x={s.x(-1.6)} y={s.y(g(-1.6)) + 22} textAnchor="end">Rolltreppe g</text>
              <line x1={s.x(10)} y1={s.y(8.5)} x2={s.x(13)} y2={s.y(8.5)} stroke={INK} strokeWidth={4} />
              <text {...TXT} fontSize={11} x={s.x(11.5)} y={s.y(8.5) - 8} textAnchor="middle">Plattform</text>
              <line x1={s.x(10)} y1={s.y(8.5)} x2={s.x(10)} y2={s.y(p(10))} stroke={BLUE} strokeWidth={3} />
              <text {...TXT} fill={BLUE} x={s.x(10) + 5} y={s.y(5.4)}>s₁</text>
              <line x1={s.x(13)} y1={s.y(8.5)} x2={s.x(13)} y2={s.y(0)} stroke={INK} strokeWidth={2} />
              <text {...TXT} x={s.x(13) - 5} y={s.y(4)} textAnchor="end">s₂</text>
              <P s={s} x={6} y={6.25} t="S (6 | 6,25)" dx={4} dy={-12} />
              <P s={s} x={2} y={2.25} t="A (2 | 2,25)" dx={8} dy={4} />
              <P s={s} x={-3} y={2} t="B (−3 | 2)" dx={0} dy={16} anchor="middle" />
              <P s={s} x={10} y={8.5} t="C (10 | 8,5)" dx={-4} dy={-10} anchor="end" />
              <P s={s} x={1} y={0} t="D" dx={-10} dy={-4} />
              <P s={s} x={11} y={0} t="E" dx={6} dy={-4} />
            </>
          )}
        </Plot>
      )
    }
    case 'minigolf': {
      const p = parabel(-0.1, 0.9, 0.4)
      return (
        <Plot x={[-0.7, 11]} y={[-0.3, 5]} w={620} h={300} label="Minigolf-Flugbahn durch ein Loch in der Wand auf ein Brett" ticksX={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]} ticksY={[1, 2, 3, 4]}>
          {(s) => (
            <>
              <rect x={s.x(-0.6)} y={s.y(0.4)} width={s.x(0.6) - s.x(-0.6)} height={s.y(0) - s.y(0.4)} fill={FILL} stroke={INK} />
              <rect x={s.x(4.8)} y={s.y(3.4)} width={s.x(5.2) - s.x(4.8)} height={s.y(0) - s.y(3.4)} fill={FILL} stroke={INK} />
              <ellipse cx={s.x(5)} cy={s.y(2.4)} rx={5} ry={(s.y(1.9) - s.y(2.9)) / 2} fill="var(--surface)" stroke={INK} />
              <text {...TXT} x={s.x(5)} y={s.y(3.4) - 6} textAnchor="middle">Wand</text>
              <line x1={s.x(5)} y1={s.y(0)} x2={s.x(10)} y2={s.y(4.5)} stroke={INK} strokeWidth={3} />
              <text {...TXT} x={s.x(8.7)} y={s.y(3.6)}>Brett g</text>
              <line x1={s.x(9.6)} y1={s.y(0)} x2={s.x(9.6)} y2={s.y(1.6)} stroke={INK} strokeWidth={2} />
              <polygon points={`${s.x(9.6)},${s.y(1.6)} ${s.x(10.4)},${s.y(1.4)} ${s.x(9.6)},${s.y(1.2)}`} fill="var(--wrong)" />
              <path d={s.kurve(p, 0, 9.6)} fill="none" stroke={BLUE} strokeWidth={2} strokeDasharray="6 5" />
              <text {...TXT} fill={BLUE} x={s.x(1)} y={s.y(p(1)) - 10}>p</text>
              <P s={s} x={0} y={0.4} t="A (0 | 0,4)" dx={6} dy={16} />
              <P s={s} x={2} y={1.8} t="B (2 | 1,8)" dx={-4} dy={-10} anchor="end" />
              <P s={s} x={8} y={1.2} t="C (8 | 1,2)" dx={6} dy={14} />
              <P s={s} x={5} y={1.9} t="P₁" dx={-8} dy={12} anchor="end" />
              <P s={s} x={5} y={2.9} t="P₂" dx={-8} dy={-4} anchor="end" />
              <P s={s} x={5} y={0} t="M (5 | 0)" dx={6} dy={16} />
              <P s={s} x={10} y={4.5} t="N (10 | 4,5)" dx={-6} dy={-8} anchor="end" />
              <P s={s} x={7} y={1.8} t="E" dx={-14} dy={-6} />
            </>
          )}
        </Plot>
      )
    }
    case 'torbogen': {
      const p = parabel(-0.025, 7.5, -402.5)
      return (
        <Plot x={[-75, 335]} y={[-10, 185]} w={640} h={330} label="Parabelförmiger Torbogen mit Skywalk und Gondelbahnen" ticksX={[50, 100, 150, 200, 250, 300]} ticksY={[50, 100, 150]}>
          {(s) => (
            <>
              <path d={s.kurve(p, 70, 230)} fill="none" stroke={INK} strokeWidth={4} />
              <line x1={s.x(100)} y1={s.y(97.5)} x2={s.x(200)} y2={s.y(97.5)} stroke={BLUE} strokeWidth={2} strokeDasharray="5 4" />
              <text {...TXT} fill={BLUE} x={s.x(150)} y={s.y(97.5) + 16} textAnchor="middle">Skywalk</text>
              <line x1={s.x(-62.5)} y1={s.y(0)} x2={s.x(100)} y2={s.y(97.5)} stroke={INK} strokeWidth={1.5} />
              <line x1={s.x(200)} y1={s.y(97.5)} x2={s.x(335)} y2={s.y(-0.6 * 335 + 217.5)} stroke={INK} strokeWidth={1.5} />
              <text {...TXT} x={s.x(30)} y={s.y(0.6 * 30 + 37.5) - 10}>g</text>
              <text {...TXT} x={s.x(260)} y={s.y(-0.6 * 260 + 217.5) - 10}>h</text>
              <line x1={s.x(70)} y1={s.y(0) + 22} x2={s.x(230)} y2={s.y(0) + 22} stroke={INK} markerStart="url(#pfeil)" markerEnd="url(#pfeil)" />
              <text {...TXT} x={s.x(150)} y={s.y(0) + 18} textAnchor="middle">w</text>
              <text {...TXT} x={s.x(150)} y={s.y(130)} textAnchor="middle">p</text>
              <P s={s} x={100} y={97.5} t="A (100 | 97,5)" dx={-6} dy={-8} anchor="end" />
              <P s={s} x={200} y={97.5} t="B (200 | 97,5)" dx={6} dy={-8} />
              <P s={s} x={-20} y={25.5} t="C (−20 | 25,5)" dx={8} dy={4} />
              <P s={s} x={300} y={37.5} t={<>D (300 | y<tspan baselineShift="sub" fontSize={10}>D</tspan>)</>} dx={-6} dy={-10} anchor="end" />
            </>
          )}
        </Plot>
      )
    }
  }
}

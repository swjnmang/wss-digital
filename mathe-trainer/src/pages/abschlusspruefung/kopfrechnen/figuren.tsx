import type { ReactNode } from 'react'
import type { Figur } from './typen'
import { MathText } from './MathText'

// Skizzen zu den Kopfrechenaufgaben (nachgezeichnet, nicht maßstabsgetreu), im Heft-Stil: Tinte und Füller-Blau.

const INK = 'var(--ink)'
const BLUE = 'var(--primary-ink)'
const SOFT = 'var(--primary-soft)'
const T = { fontFamily: 'var(--font-body)', fontSize: 14, fill: INK } as const

function Svg({ w, h, label, children }: { w: number; h: number; label: string; children: ReactNode }) {
  return (
    <svg viewBox={`0 0 ${w} ${h}`} role="img" aria-label={label} style={{ width: '100%', maxWidth: w, height: 'auto', display: 'block' }}>
      {children}
    </svg>
  )
}

function RechtwinkligesDreieck({ links, unten, hyp, winkel }: { links?: string; unten?: string; hyp?: string; winkel?: string }) {
  return (
    <Svg w={320} h={190} label="Rechtwinkliges Dreieck">
      <polygon points="80,160 80,30 290,160" fill={SOFT} stroke={INK} strokeWidth={2} strokeLinejoin="round" />
      <path d="M80 140 H100 V160" fill="none" stroke={INK} strokeWidth={1.5} />
      <circle cx={90} cy={150} r={2} fill={INK} />
      {links && <text {...T} x={72} y={100} textAnchor="end">{links}</text>}
      {unten && <text {...T} x={185} y={182} textAnchor="middle">{unten}</text>}
      {hyp && <text {...T} x={192} y={86}>{hyp}</text>}
      {winkel && (
        <>
          <path d="M250 160 A40 40 0 0 0 256 139" fill="none" stroke={BLUE} strokeWidth={2} />
          <text {...T} x={232} y={153} fill={BLUE} textAnchor="end">{winkel}</text>
        </>
      )}
    </Svg>
  )
}

function Tabelle({ zeilen }: { zeilen: string[][] }) {
  return (
    <div className="overflow-x-auto">
      <table style={{ borderCollapse: 'collapse', background: 'var(--surface)', fontSize: 16 }}>
        <tbody>
          {zeilen.map((z, i) => (
            <tr key={i}>
              {z.map((c, j) => (
                <td key={j} style={{ border: '1.5px solid var(--edge)', padding: '6px 14px', textAlign: 'center', fontWeight: j === 0 ? 700 : 400, background: j === 0 ? 'var(--surface-sunken)' : undefined, whiteSpace: 'nowrap' }}>
                  <MathText text={c} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Balken({ daten, einheit, max, schritt }: { daten: { label: string; wert: number }[]; einheit?: string; max: number; schritt: number }) {
  const x0 = 60, breite = 260, zeile = 30, h = daten.length * zeile + 40
  const sx = (v: number) => x0 + (v / max) * breite
  const ticks = Array.from({ length: Math.floor(max / schritt) + 1 }, (_, i) => i * schritt)
  return (
    <Svg w={x0 + breite + 40} h={h} label="Balkendiagramm">
      {ticks.map((t) => (
        <g key={t}>
          <line x1={sx(t)} y1={8} x2={sx(t)} y2={h - 30} stroke="var(--line)" strokeWidth={1} />
          <text {...T} fontSize={12} x={sx(t)} y={h - 14} textAnchor="middle">{t}</text>
        </g>
      ))}
      {daten.map((d, i) => (
        <g key={d.label}>
          <text {...T} fontSize={13} x={x0 - 8} y={20 + i * zeile + 5} textAnchor="end">{d.label}</text>
          <rect x={x0} y={10 + i * zeile} width={sx(d.wert) - x0} height={18} fill={BLUE} rx={2} />
        </g>
      ))}
      <line x1={x0} y1={6} x2={x0} y2={h - 30} stroke={INK} strokeWidth={1.5} />
      {einheit && <text {...T} fontSize={12} x={x0 + breite + 30} y={h - 14} textAnchor="end">{einheit}</text>}
    </Svg>
  )
}

function Saeulen({ daten, max, schritt, titel }: { daten: { label: string; wert: number | null }[]; max: number; schritt: number; titel?: string }) {
  const y0 = 190, hoehe = 150, x0 = 50, sp = 90
  const sy = (v: number) => y0 - (v / max) * hoehe
  const ticks = Array.from({ length: Math.floor(max / schritt) + 1 }, (_, i) => i * schritt)
  return (
    <Svg w={x0 + daten.length * sp + 20} h={230} label={titel ?? 'Säulendiagramm'}>
      {titel && <text {...T} fontWeight={700} x={x0 + (daten.length * sp) / 2} y={22} textAnchor="middle">{titel}</text>}
      {ticks.map((t) => (
        <g key={t}>
          <line x1={x0} y1={sy(t)} x2={x0 + daten.length * sp} y2={sy(t)} stroke="var(--line)" />
          <text {...T} fontSize={12} x={x0 - 6} y={sy(t) + 4} textAnchor="end">{t}</text>
        </g>
      ))}
      {daten.map((d, i) => {
        const cx = x0 + i * sp + sp / 2
        return (
          <g key={d.label}>
            {d.wert !== null ? (
              <>
                <rect x={cx - 22} y={sy(d.wert)} width={44} height={y0 - sy(d.wert)} fill={BLUE} />
                <text {...T} fontSize={13} fontWeight={700} x={cx} y={sy(d.wert) - 6} textAnchor="middle">{d.wert}</text>
              </>
            ) : (
              <text {...T} fontSize={20} fontWeight={700} fill={BLUE} x={cx} y={y0 - 12} textAnchor="middle">?</text>
            )}
            <text {...T} fontSize={13} x={cx} y={y0 + 20} textAnchor="middle">{d.label}</text>
          </g>
        )
      })}
      <line x1={x0} y1={y0} x2={x0 + daten.length * sp} y2={y0} stroke={INK} strokeWidth={1.5} />
    </Svg>
  )
}

function Rad({ felder, markiert }: { felder: string[]; markiert?: string }) {
  const r = 90, c = 100, n = felder.length
  const pt = (k: number, rr = r) => [c + rr * Math.sin((2 * Math.PI * k) / n), c - rr * Math.cos((2 * Math.PI * k) / n)]
  return (
    <Svg w={200} h={210} label="Glücksrad">
      {felder.map((f, k) => {
        const [x1, y1] = pt(k)
        const [x2, y2] = pt(k + 1)
        const [tx, ty] = pt(k + 0.5, r * 0.62)
        return (
          <g key={k}>
            <path d={`M${c} ${c} L${x1} ${y1} A${r} ${r} 0 0 1 ${x2} ${y2} Z`} fill={f === markiert ? SOFT : 'var(--surface)'} stroke={INK} strokeWidth={1.5} />
            <text {...T} fontWeight={700} x={tx} y={ty + 5} textAnchor="middle">{f}</text>
          </g>
        )
      })}
      <polygon points={`${c - 7},2 ${c + 7},2 ${c},16`} fill={BLUE} />
    </Svg>
  )
}

function Urne({ schwarz, weiss, baum }: { schwarz: number; weiss: number; baum?: [string, string] }) {
  const kugeln = [...Array(schwarz).fill('s'), ...Array(weiss).fill('w')]
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
      <Svg w={150} h={170} label={`Urne mit ${schwarz} schwarzen Kugeln`}>
        <ellipse cx={75} cy={25} rx={60} ry={12} fill="none" stroke={INK} strokeWidth={1.5} />
        <path d="M15 25 V150 A60 12 0 0 0 135 150 V25" fill="none" stroke={INK} strokeWidth={1.5} />
        {kugeln.map((k, i) => (
          <circle key={i} cx={45 + (i % 3) * 30} cy={140 - Math.floor(i / 3) * 28} r={13} fill={k === 's' ? INK : 'var(--surface)'} stroke={INK} strokeWidth={1.5} />
        ))}
      </Svg>
      {baum && (
        <div style={{ display: 'grid', gridTemplateColumns: 'auto auto', gap: '18px 10px', alignItems: 'center', fontSize: 18 }}>
          <MathText text={`$${baum[0]}$`} />
          <span style={{ display: 'inline-block', width: 22, height: 22, borderRadius: '50%', border: `1.5px solid ${INK}`, background: 'var(--surface)' }} />
          <MathText text={`$${baum[1]}$`} />
          <span style={{ display: 'inline-block', width: 22, height: 22, borderRadius: '50%', background: INK }} />
        </div>
      )}
    </div>
  )
}

function Bild({ name }: { name: Extract<Figur, { k: 'bild' }>['name'] }) {
  switch (name) {
    case 'dreieck60':
      return (
        <Svg w={300} h={200} label="Dreieck mit zwei Seiten 20 cm, Winkel 60 Grad und Seite 14 cm">
          <polygon points="20,175 280,175 200,40" fill={SOFT} stroke={INK} strokeWidth={2} strokeLinejoin="round" />
          <path d="M65 175 A45 45 0 0 0 59 152" fill="none" stroke={BLUE} strokeWidth={2} />
          <text {...T} x={72} y={166} fill={BLUE}>60°</text>
          <text {...T} x={150} y={195} textAnchor="middle">20 cm</text>
          <text {...T} x={95} y={98} textAnchor="end">20 cm</text>
          <text {...T} x={250} y={102}>14 cm</text>
          <text {...T} x={10} y={190}>A</text><text {...T} x={284} y={190}>B</text><text {...T} x={196} y={32}>C</text>
        </Svg>
      )
    case 'drachen':
      return (
        <Svg w={240} h={280} label="Drachenviereck mit den Diagonalen e und f">
          <polygon points="120,15 200,85 120,265 40,85" fill={SOFT} stroke={INK} strokeWidth={2} strokeLinejoin="round" />
          <line x1={40} y1={85} x2={200} y2={85} stroke={INK} strokeWidth={1.5} />
          <line x1={120} y1={15} x2={120} y2={265} stroke={INK} strokeWidth={1.5} />
          <text {...T} x={116} y={10} >C</text><text {...T} x={205} y={90}>B</text><text {...T} x={24} y={90}>D</text><text {...T} x={116} y={280}>A</text>
          <text {...T} x={126} y={80}>E</text>
          <text {...T} fill={BLUE} x={168} y={45}>b</text><text {...T} fill={BLUE} x={64} y={45}>c</text>
          <text {...T} x={170} y={180}>a</text><text {...T} x={64} y={180}>d</text>
          <text {...T} x={126} y={170}>e</text><text {...T} x={78} y={102}>f</text>
        </Svg>
      )
    case 'wuerfelnetz': {
      const felder: [number, number, string][] = [[0, 0, '1'], [1, 0, '2'], [1, 1, '3'], [2, 1, 'G'], [2, 2, '4'], [3, 2, '5']]
      return (
        <Svg w={230} h={170} label="Würfelnetz mit Grundfläche G und den Feldern 1 bis 5">
          {felder.map(([x, y, l]) => (
            <g key={l}>
              <rect x={10 + x * 52} y={8 + y * 52} width={52} height={52} fill={l === 'G' ? SOFT : 'var(--surface)'} stroke={INK} strokeWidth={2} />
              <text {...T} fontSize={16} fontWeight={700} x={36 + x * 52} y={40 + y * 52} textAnchor="middle" fill={l === 'G' ? INK : BLUE}>{l}</text>
            </g>
          ))}
        </Svg>
      )
    }
    case 'strahlen':
      return (
        <Svg w={360} h={240} label="Strahlensatzfigur mit Zentrum Z">
          <line x1={30} y1={180} x2={125} y2={5} stroke={INK} strokeWidth={1.5} />
          <line x1={30} y1={180} x2={350} y2={218} stroke={INK} strokeWidth={1.5} />
          <line x1={83} y1={80} x2={230} y2={203} stroke={INK} strokeWidth={2} />
          <line x1={110} y1={30} x2={330} y2={215} stroke={INK} strokeWidth={2} />
          <line x1={83} y1={80} x2={110} y2={30} stroke="var(--wrong)" strokeWidth={4} />
          <text {...T} x={18} y={196}>Z</text><text {...T} x={68} y={82}>A</text><text {...T} x={92} y={28}>A'</text>
          <text {...T} x={226} y={222}>B</text><text {...T} x={330} y={234}>B'</text>
          <text {...T} x={44} y={130}>4 m</text>
          <text {...T} x={86} y={52} fill="var(--wrong-ink)" fontWeight={700}>x</text>
          <text {...T} x={150} y={130}>8 m</text><text {...T} x={232} y={110}>12 m</text>
        </Svg>
      )
    case 'parallelogramm':
      return (
        <Svg w={380} h={160} label="Parallelogramm ABCD mit Dreieck EDA">
          <polygon points="20,140 290,140 360,25 90,25" fill="none" stroke={INK} strokeWidth={2} strokeLinejoin="round" />
          <polygon points="20,140 90,25 230,25" fill={SOFT} stroke={INK} strokeWidth={2} strokeLinejoin="round" />
          <path d="M77 46 A25 25 0 0 0 115 25" fill="none" stroke={BLUE} strokeWidth={2} />
          <text {...T} x={98} y={50} fill={BLUE}>δ = 120°</text>
          <path d="M255 25 A25 25 0 0 1 211 38" fill="none" stroke={BLUE} strokeWidth={2} />
          <text {...T} x={248} y={48} fill={BLUE}>β</text>
          <text {...T} x={6} y={154}>A</text><text {...T} x={292} y={156}>B</text><text {...T} x={362} y={20}>C</text>
          <text {...T} x={80} y={18}>D</text><text {...T} x={226} y={18}>E</text>
        </Svg>
      )
    case 'giebel':
      return (
        <Svg w={300} h={230} label="Geräteschuppen mit dreieckigem Giebel DCE">
          <rect x={30} y={110} width={240} height={95} fill="none" stroke={INK} strokeWidth={2} />
          <polygon points="30,110 270,110 150,40" fill={SOFT} stroke={INK} strokeWidth={2} strokeLinejoin="round" />
          <line x1={150} y1={40} x2={150} y2={205} stroke={BLUE} strokeWidth={1.5} strokeDasharray="5 4" />
          <text {...T} x={16} y={112}>D</text><text {...T} x={274} y={112}>C</text><text {...T} x={145} y={32}>E</text>
          <text {...T} x={16} y={220}>A</text><text {...T} x={274} y={220}>B</text><text {...T} x={145} y={222}>F</text><text {...T} x={156} y={126}>G</text>
        </Svg>
      )
    case 'parallelen':
      return (
        <Svg w={380} h={230} label="Geraden a und b mit Winkeln 35, 85 und 120 Grad">
          <line x1={10} y1={40} x2={370} y2={40} stroke={INK} strokeWidth={2} />
          <line x1={10} y1={200} x2={370} y2={200} stroke={INK} strokeWidth={2} />
          <line x1={20} y1={214} x2={300} y2={18} stroke={INK} strokeWidth={1.5} />
          <line x1={280} y1={40} x2={340} y2={200} stroke={INK} strokeWidth={1.5} />
          <text {...T} x={14} y={32}>a</text><text {...T} x={14} y={192}>b</text><text {...T} x={120} y={130}>c</text>
          <text {...T} fill={BLUE} x={300} y={32}>35°</text>
          <text {...T} fill={BLUE} x={256} y={66}>85°</text>
          <text {...T} fill={BLUE} x={346} y={190}>120°</text>
        </Svg>
      )
    case 'rechteckDiag':
      return (
        <Svg w={300} h={200} label="Rechteckiges Grundstück 6 m mal 8 m mit Diagonale AB">
          <rect x={30} y={30} width={240} height={140} fill={SOFT} stroke={INK} strokeWidth={2} />
          <line x1={30} y1={170} x2={270} y2={30} stroke={BLUE} strokeWidth={2} strokeDasharray="7 5" />
          <text {...T} x={14} y={186}>A</text><text {...T} x={274} y={26}>B</text>
          <text {...T} x={150} y={190} textAnchor="middle">8 m</text><text {...T} x={278} y={104}>6 m</text>
        </Svg>
      )
    case 'sonnensegel':
      return (
        <Svg w={320} h={190} label="Dreieck mit Seiten 5 m, 6 m und 3 m">
          <polygon points="20,160 296,160 219,45" fill={SOFT} stroke={INK} strokeWidth={2} strokeLinejoin="round" />
          <path d="M60 160 A40 40 0 0 0 55 140" fill="none" stroke={BLUE} strokeWidth={2} />
          <text {...T} x={64} y={152} fill={BLUE}>α</text>
          <path d="M276 160 A20 20 0 0 1 285 143" fill="none" stroke={BLUE} strokeWidth={2} />
          <text {...T} x={262} y={150} fill={BLUE}>β</text>
          <text {...T} x={208} y={66} fill={BLUE}>93,7°</text>
          <text {...T} x={158} y={180} textAnchor="middle">6 m</text>
          <text {...T} x={104} y={94} textAnchor="end">5 m</text><text {...T} x={264} y={96}>3 m</text>
        </Svg>
      )
    case 'vordach':
      return (
        <Svg w={440} h={170} label="Vordach mit vier parallelen Streben">
          <line x1={20} y1={140} x2={420} y2={140} stroke={INK} strokeWidth={2} />
          <line x1={20} y1={140} x2={420} y2={20} stroke={INK} strokeWidth={2} />
          {[120, 220, 320, 420].map((x) => (
            <line key={x} x1={x} y1={140} x2={x} y2={140 - ((x - 20) * 120) / 400} stroke={x === 120 ? BLUE : INK} strokeWidth={x === 120 ? 3 : 2} />
          ))}
          <line x1={420} y1={10} x2={420} y2={165} stroke="var(--wrong)" strokeWidth={1.5} />
          <text {...T} x={126} y={128} fill={BLUE} fontWeight={700}>x</text>
          <text {...T} x={70} y={160} textAnchor="middle">50 cm</text>
          <text {...T} x={412} y={84} textAnchor="end">60 cm</text>
        </Svg>
      )
  }
}

export default function Figur({ figur }: { figur: Figur }) {
  switch (figur.k) {
    case 'rtri': return <RechtwinkligesDreieck {...figur} />
    case 'tabelle': return <Tabelle zeilen={figur.zeilen} />
    case 'balken': return <Balken {...figur} />
    case 'saeulen': return <Saeulen {...figur} />
    case 'rad': return <Rad {...figur} />
    case 'urne': return <Urne {...figur} />
    case 'bild': return <Bild name={figur.name} />
  }
}

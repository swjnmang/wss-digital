import { M } from '../../daten_und_zufall/lernpfad/kit';

// Seitenteil des Handyständers als rechtwinkliges Dreieck (Inline-SVG, Bildwelt Bauplan / Lasercut):
// Ecke A vorne unten (Winkel α), rechter Winkel hinten unten, Ecke oben (Winkel β). Boden waagrecht, Rücken senkrecht, Auflage schräg.

export type Kante = 'boden' | 'ruecken' | 'schraeg';

const FARBE_ROLLE = { H: 'var(--ink)', GK: 'var(--primary)', AK: '#2c6b74' } as const;

/** Rolle einer Kante, vom markierten Winkel aus gesehen */
export function rolle(k: Kante, winkel: 'alpha' | 'beta'): 'H' | 'GK' | 'AK' {
  if (k === 'schraeg') return 'H';
  if (winkel === 'alpha') return k === 'ruecken' ? 'GK' : 'AK';
  return k === 'boden' ? 'GK' : 'AK';
}

export default function Dreieck({
  boden,
  ruecken,
  labels,
  winkel = 'alpha',
  winkelText,
  rollen = false,
  ecken,
  breite = 380,
  label,
}: {
  /** Seitenlängen für die Form (Verhältnis zählt) */
  boden: number;
  ruecken: number;
  /** Beschriftung der Kanten (Text, wird kursiv gesetzt) */
  labels: Record<Kante, string>;
  /** markierter Winkel: vorne unten (α) oder oben (β); 'beide' markiert beide */
  winkel?: 'alpha' | 'beta' | 'beide';
  winkelText?: string;
  /** Kanten nach Rolle färben (H, GK, AK) */
  rollen?: boolean;
  /** Eckpunkte benennen [vorne unten, hinten unten, oben] */
  ecken?: [string, string, string];
  breite?: number;
  label: string;
}) {
  const W = breite;
  const HMAX = 280;
  // Platz links für die Beschriftung der schrägen Kante, rechts für die des Rückens
  const links = Math.max(60, labels.schraeg.length * 5.5 + 30);
  const rechts = labels.ruecken.length * 10.5 + 26;
  const s = Math.min((W - links - rechts) / boden, (HMAX - 2 * 46) / ruecken);
  const bw = boden * s;
  const rh = ruecken * s;
  // Höhe passt sich der Form an, flache Teile bekommen keinen leeren Rand
  const H = Math.round(rh + 2 * 46 + (ecken ? 6 : 0));
  const x0 = links + (W - links - rechts - bw) / 2;
  const y0 = H - 46;
  const A: [number, number] = [x0, y0];
  const B: [number, number] = [x0 + bw, y0];
  const C: [number, number] = [x0 + bw, y0 - rh];
  const blick = winkel === 'beta' ? 'beta' : 'alpha';
  const farbe = (k: Kante) => (rollen ? FARBE_ROLLE[rolle(k, blick)] : 'var(--ink)');
  const alphaGrad = (Math.atan2(ruecken, boden) * 180) / Math.PI;
  const bogen = (cx: number, cy: number, r: number, w1: number, w2: number) => {
    const p = (w: number) => [cx + r * Math.cos((w * Math.PI) / 180), cy - r * Math.sin((w * Math.PI) / 180)];
    const [ax, ay] = p(w1);
    const [bx, by] = p(w2);
    return `M${cx} ${cy} L${ax} ${ay} A${r} ${r} 0 0 0 ${bx} ${by} Z`;
  };
  const rA = Math.min(46, bw * 0.45);
  const rC = Math.min(40, rh * 0.3);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label} className="hs-dreieck" style={{ maxWidth: W }}>
      {(winkel === 'alpha' || winkel === 'beide') && (
        <>
          <path d={bogen(A[0], A[1], rA, 0, alphaGrad)} fill="var(--primary)" fillOpacity=".18" stroke="var(--primary)" strokeWidth="2" />
          <text
            x={A[0] + (rA + 16) * Math.cos((alphaGrad / 2) * (Math.PI / 180))}
            y={A[1] - (rA + 16) * Math.sin((alphaGrad / 2) * (Math.PI / 180)) + 7}
            textAnchor="middle"
            fontSize="20"
            fontWeight="700"
            fill="var(--primary)"
          >
            {winkel === 'alpha' && winkelText ? winkelText : 'α'}
          </text>
        </>
      )}
      {(winkel === 'beta' || winkel === 'beide') && (
        <>
          <path d={bogen(C[0], C[1], rC, 180 + alphaGrad, 270)} fill="var(--primary)" fillOpacity=".18" stroke="var(--primary)" strokeWidth="2" />
          <text
            x={C[0] - 14}
            y={C[1] + rC + 22}
            textAnchor="end"
            fontSize="20"
            fontWeight="700"
            fill="var(--primary)"
          >
            {winkel === 'beta' && winkelText ? winkelText : 'β'}
          </text>
        </>
      )}
      <line x1={A[0]} y1={A[1]} x2={B[0]} y2={B[1]} stroke={farbe('boden')} strokeWidth={rollen ? 6 : 3} strokeLinecap="round" />
      <line x1={B[0]} y1={B[1]} x2={C[0]} y2={C[1]} stroke={farbe('ruecken')} strokeWidth={rollen ? 6 : 3} strokeLinecap="round" />
      <line x1={C[0]} y1={C[1]} x2={A[0]} y2={A[1]} stroke={farbe('schraeg')} strokeWidth={rollen ? 6 : 3} strokeLinecap="round" />
      <path d={`M${B[0] - 18} ${B[1]} V${B[1] - 18} H${B[0]}`} fill="none" stroke="var(--ink)" strokeWidth="1.6" />
      <circle cx={B[0] - 9} cy={B[1] - 9} r="2.4" fill="var(--ink)" />
      <text x={(A[0] + B[0]) / 2} y={A[1] + 30} textAnchor="middle" fontSize="20" fontWeight="700" fill={farbe('boden')}>
        {labels.boden}
      </text>
      <text x={B[0] + 12} y={(B[1] + C[1]) / 2 + 7} textAnchor="start" fontSize="20" fontWeight="700" fill={farbe('ruecken')}>
        {labels.ruecken}
      </text>
      <text
        x={(A[0] + C[0]) / 2 - 14}
        y={(A[1] + C[1]) / 2 - 4}
        textAnchor="end"
        fontSize="20"
        fontWeight="700"
        fill={farbe('schraeg')}
      >
        {labels.schraeg}
      </text>
      {ecken && (
        <g fontSize="19" fontWeight="700" fill="var(--ink)">
          <text x={A[0] - 10} y={A[1] + 22} textAnchor="end">
            {ecken[0]}
          </text>
          <text x={B[0] + 10} y={B[1] + 22}>
            {ecken[1]}
          </text>
          <text x={C[0] + 10} y={C[1] + 4}>
            {ecken[2]}
          </text>
        </g>
      )}
    </svg>
  );
}

/** Kurze Legende der Farben H, GK, AK */
export function RollenLegende({ winkel }: { winkel: 'α' | 'β' }) {
  return (
    <p className="hs-legende">
      Vom Winkel <M>{winkel === 'α' ? '\\alpha' : '\\beta'}</M> aus: <span style={{ color: FARBE_ROLLE.H }}>Hypotenuse (H)</span>,{' '}
      <span style={{ color: FARBE_ROLLE.GK }}>Gegenkathete (GK)</span>, <span style={{ color: FARBE_ROLLE.AK }}>Ankathete (AK)</span>
    </p>
  );
}

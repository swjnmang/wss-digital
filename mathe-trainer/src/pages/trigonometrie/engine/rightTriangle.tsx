import TriangleFigure, {
  COLOR_ASKED,
  COLOR_GIVEN,
  randomPose,
  type Mark,
  type Pose,
  type Pt,
} from './TriangleFigure';
import { cosD, pick, randomNaming, sinD, type Naming } from './util';

export type Role = 'H' | 'G' | 'A';
export type Fn = 'sin' | 'cos' | 'tan';

export const ROLE_NAME: Record<Role, string> = {
  H: 'Hypotenuse',
  G: 'Gegenkathete',
  A: 'Ankathete',
};
export const FN_NAME: Record<Fn, string> = { sin: 'Sinus', cos: 'Kosinus', tan: 'Tangens' };
/** Zähler und Nenner der Winkelfunktionen */
export const FN_RATIO: Record<Fn, [Role, Role]> = {
  sin: ['G', 'H'],
  cos: ['A', 'H'],
  tan: ['G', 'A'],
};

/** Welche Winkelfunktion verbindet die beiden Seiten? */
export function fnFor(x: Role, y: Role): Fn {
  const s = new Set([x, y]);
  if (s.has('G') && s.has('H')) return 'sin';
  if (s.has('A') && s.has('H')) return 'cos';
  return 'tan';
}

/** Rechtwinkliges Dreieck mit rechtem Winkel an Ecke r und Bezugswinkel an Ecke p. */
export interface RT {
  n: Naming;
  r: number;
  p: number;
  q: number;
  /** Winkel an Ecke i */
  ang: [number, number, number];
  /** Länge der Seite gegenüber Ecke i */
  side: [number, number, number];
  pts: [Pt, Pt, Pt];
  pose: Pose;
}

/** Seitenindex (= gegenüberliegende Ecke) einer Rolle bezogen auf den Winkel an Ecke p. */
export const roleIndex = (t: RT, role: Role) => (role === 'H' ? t.r : role === 'G' ? t.p : t.q);

export function makeRT(opts: {
  theta: number;
  hyp: number;
  standard?: boolean;
  naming?: Naming;
}): RT {
  const n = opts.naming ?? randomNaming(opts.standard);
  const r = opts.standard ? 2 : pick([0, 1, 2]);
  const others = [0, 1, 2].filter((i) => i !== r);
  const p = pick(others);
  const q = others.find((i) => i !== p)!;
  const ang = [0, 0, 0] as [number, number, number];
  ang[r] = 90;
  ang[p] = opts.theta;
  ang[q] = 90 - opts.theta;
  const side = [0, 0, 0] as [number, number, number];
  side[r] = opts.hyp;
  side[p] = opts.hyp * sinD(opts.theta);
  side[q] = opts.hyp * cosD(opts.theta);
  const pts = [
    { x: 0, y: 0 },
    { x: 0, y: 0 },
    { x: 0, y: 0 },
  ] as [Pt, Pt, Pt];
  pts[p] = { x: side[q], y: 0 };
  pts[q] = { x: 0, y: side[p] };
  return { n, r, p, q, ang, side, pts, pose: randomPose() };
}

/** Länge einer Rolle aus einer gegebenen Seite und dem Winkel bestimmen. */
export function hypFrom(role: Role, length: number, theta: number) {
  return role === 'H' ? length : role === 'G' ? length / sinD(theta) : length / cosD(theta);
}

export const fnValue = (fn: Fn, theta: number) =>
  fn === 'sin' ? sinD(theta) : fn === 'cos' ? cosD(theta) : Math.tan((theta * Math.PI) / 180);

export function RTFigure({
  t,
  sides,
  angles,
}: {
  t: RT;
  sides: (Mark | null)[];
  angles: (Mark | null)[];
}) {
  return (
    <TriangleFigure
      pts={t.pts}
      names={t.n.V}
      sides={sides}
      angles={angles}
      right={t.r}
      pose={t.pose}
    />
  );
}

export const given = (text: string): Mark => ({ text, color: COLOR_GIVEN });
export const asked = (text: string): Mark => ({ text, color: COLOR_ASKED, bold: true });
export const plain = (text: string): Mark => ({ text, color: '#64748b' });

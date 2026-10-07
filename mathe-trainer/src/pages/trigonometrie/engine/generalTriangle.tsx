import TriangleFigure, {
  randomPose,
  trianglePoints,
  type Mark,
  type Pose,
  type Pt,
} from './TriangleFigure';
import { randInt, randFloat, randomNaming, sinD, type Naming } from './util';

/** Allgemeines Dreieck: Winkel an Ecke i, Seite gegenüber Ecke i. */
export interface GT {
  n: Naming;
  ang: [number, number, number];
  side: [number, number, number];
  pts: [Pt, Pt, Pt];
  pose: Pose;
}

/** Drei Winkel mit Summe 180°, jeder mindestens `min`, höchstens `max`. */
export function randomAngles(
  opts: { min?: number; max?: number; decimals?: boolean } = {}
): [number, number, number] {
  const min = opts.min ?? 28;
  const max = opts.max ?? 115;
  for (;;) {
    const a = opts.decimals ? randFloat(min, max, 1) : randInt(min, max);
    const b = opts.decimals ? randFloat(min, max, 1) : randInt(min, max);
    const c = Math.round((180 - a - b) * 10) / 10;
    if (c >= min && c <= max) return [a, b, c];
  }
}

/** Dreieck aus allen drei Winkeln und der Länge der Seite gegenüber Ecke k. */
export function gtFromAngles(
  ang: [number, number, number],
  k: number,
  length: number,
  standard = false
): GT {
  const d = length / sinD(ang[k]);
  const side = ang.map((w) => d * sinD(w)) as [number, number, number];
  return build(ang, side, standard);
}

/** Dreieck aus drei Seiten (müssen die Dreiecksungleichung erfüllen). */
export function gtFromSides(side: [number, number, number], standard = false): GT {
  const [a, b, c] = side;
  const al = (Math.acos((b * b + c * c - a * a) / (2 * b * c)) * 180) / Math.PI;
  const be = (Math.acos((a * a + c * c - b * b) / (2 * a * c)) * 180) / Math.PI;
  return build([al, be, 180 - al - be], side, standard);
}

function build(
  ang: [number, number, number],
  side: [number, number, number],
  standard: boolean
): GT {
  return {
    n: randomNaming(standard),
    ang,
    side,
    pts: trianglePoints(side[2], side[1], ang[0]),
    pose: standard ? { rotate: randInt(-12, 12), mirror: false } : randomPose(25),
  };
}

export function GTFigure({
  t,
  sides,
  angles,
}: {
  t: GT;
  sides: (Mark | null)[];
  angles: (Mark | null)[];
}) {
  return <TriangleFigure pts={t.pts} names={t.n.V} sides={sides} angles={angles} pose={t.pose} />;
}

/** Die beiden anderen Ecken. */
export const others = (i: number): [number, number] => [(i + 1) % 3, (i + 2) % 3];

// Baumdiagramm (von links nach rechts) für zwei- und dreistufige Zufallsexperimente.

import type { ReactNode } from 'react';
import { C } from '../raum_und_form/figures/Scene';

export interface TNode {
  /** Ergebnis an diesem Knoten, z. B. "R" */
  label: string;
  /** Wahrscheinlichkeit an der Kante zu diesem Knoten, z. B. "2/5" oder "?" */
  p?: string;
  children?: TNode[];
}

function leaves(n: TNode): number {
  return n.children?.length ? n.children.reduce((s, c) => s + leaves(c), 0) : 1;
}

export default function Tree({ root }: { root: TNode[] }) {
  const total = root.reduce((s, c) => s + leaves(c), 0);
  const depth = (ns: TNode[]): number => (ns.length ? 1 + Math.max(...ns.map((n) => depth(n.children ?? []))) : 0);
  const D = depth(root);
  const W = 300;
  const rowH = total > 6 ? 26 : 36;
  const H = total * rowH + 16;
  const colW = (W - 30) / D;
  const els: ReactNode[] = [];
  let leaf = 0;
  let k = 0;

  const place = (n: TNode, level: number, px: number, py: number): number => {
    let y: number;
    if (n.children?.length) {
      const ys = n.children.map((c) => place(c, level + 1, 0, 0));
      y = (ys[0] + ys[ys.length - 1]) / 2;
      const x = 14 + level * colW;
      n.children.forEach((c, i) => {
        const cx = 14 + (level + 1) * colW;
        const cy = ys[i];
        els.push(<line key={k++} x1={x + 8} y1={y} x2={cx - 8} y2={cy} stroke={C.line} strokeWidth={1.2} />);
        if (c.p) {
          const mx = (x + cx) / 2;
          const my = (y + cy) / 2;
          els.push(
            <text key={k++} x={mx} y={my - 3} fontSize={12} textAnchor="middle" fill={c.p.includes('?') ? C.red : C.blue} fontWeight={600}>
              {c.p}
            </text>,
          );
        }
      });
    } else {
      y = 8 + (leaf + 0.5) * rowH;
      leaf++;
    }
    void px;
    void py;
    const x = 14 + level * colW;
    els.push(
      <text key={k++} x={x} y={y + 4} fontSize={14} textAnchor="middle" fontWeight={700} fill={C.label}>
        {n.label}
      </text>,
    );
    return y;
  };

  const start: TNode = { label: '', children: root };
  place(start, 0, 0, 0);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="Baumdiagramm">
      <rect width={W} height={H} fill="#fff" rx={8} />
      {els}
    </svg>
  );
}

import React from 'react';

type AngleKey = 'alpha' | 'beta' | 'gamma';
type SideKey = 'a' | 'b' | 'c';

interface RightTriangleTaskSVGProps {
  rightAngleAtPoint: 'A' | 'B' | 'C';
  // Seiten/Winkel, die der Schüler berechnen soll -> werden rot markiert
  highlightSides?: SideKey[];
  highlightAngles?: AngleKey[];
}

const VIEW_WIDTH = 320;
const VIEW_HEIGHT = 260;

const angleSymbols: Record<AngleKey, string> = { alpha: 'α', beta: 'β', gamma: 'γ' };

const RED = '#DC2626';
const BLACK = '#1F2937';

const RightTriangleTaskSVG: React.FC<RightTriangleTaskSVGProps> = ({
  rightAngleAtPoint,
  highlightSides = [],
  highlightAngles = [],
}) => {
  const width = VIEW_WIDTH;
  const height = VIEW_HEIGHT;

  const cathetus1 = 200;
  const cathetus2 = 140;
  const margin = 40;

  let posA: [number, number];
  let posB: [number, number];
  let posC: [number, number];

  if (rightAngleAtPoint === 'A') {
    posA = [margin + 20, margin + 20];
    posB = [posA[0] + cathetus1, posA[1]];
    posC = [posA[0], posA[1] + cathetus2];
  } else if (rightAngleAtPoint === 'B') {
    posB = [width - margin - 20, height - margin - 20];
    posA = [posB[0] - cathetus1, posB[1]];
    posC = [posB[0], posB[1] - cathetus2];
  } else {
    posC = [margin + 20, height - margin - 20];
    posA = [posC[0] + cathetus1, posC[1]];
    posB = [posC[0], posC[1] - cathetus2];
  }

  const arcRadius = 25;

  const drawAngleArc = (
    vertex: [number, number],
    p1: [number, number],
    p2: [number, number],
    isRightAngle: boolean,
    label: string,
    color: string
  ) => {
    const v1 = [p1[0] - vertex[0], p1[1] - vertex[1]];
    const v2 = [p2[0] - vertex[0], p2[1] - vertex[1]];
    const len1 = Math.sqrt(v1[0] * v1[0] + v1[1] * v1[1]);
    const len2 = Math.sqrt(v2[0] * v2[0] + v2[1] * v2[1]);

    const unit1 = [v1[0] / len1, v1[1] / len1];
    const unit2 = [v2[0] / len2, v2[1] / len2];

    const start = [vertex[0] + unit1[0] * arcRadius, vertex[1] + unit1[1] * arcRadius];
    const end = [vertex[0] + unit2[0] * arcRadius, vertex[1] + unit2[1] * arcRadius];

    const angle1 = Math.atan2(v1[1], v1[0]);
    const angle2 = Math.atan2(v2[1], v2[0]);
    let delta = angle2 - angle1;
    delta = ((delta + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI;
    const largeArc = Math.abs(delta) > Math.PI / 2 + 0.001 ? 1 : 0;
    const sweep = delta > 0 ? 1 : 0;

    let bisector = [unit1[0] + unit2[0], unit1[1] + unit2[1]];
    const bisectorLen = Math.sqrt(bisector[0] * bisector[0] + bisector[1] * bisector[1]);
    bisector = bisectorLen > 0.0001 ? [bisector[0] / bisectorLen, bisector[1] / bisectorLen] : [unit1[0], unit1[1]];

    if (isRightAngle) {
      const sectorPath = `
        M ${vertex[0]} ${vertex[1]}
        L ${start[0]} ${start[1]}
        A ${arcRadius} ${arcRadius} 0 ${largeArc} ${sweep} ${end[0]} ${end[1]}
        Z
      `;
      const dotRadius = arcRadius * 0.55;
      const dotX = vertex[0] + bisector[0] * dotRadius;
      const dotY = vertex[1] + bisector[1] * dotRadius;

      return (
        <g key={`angle-${label}`}>
          <path d={sectorPath} fill="#9CA3AF" fillOpacity="0.35" stroke="#6B7280" strokeWidth="1" />
          <circle cx={dotX} cy={dotY} r="2.5" fill="#374151" />
        </g>
      );
    }

    const pathData = `
      M ${start[0]} ${start[1]}
      A ${arcRadius} ${arcRadius} 0 ${largeArc} ${sweep} ${end[0]} ${end[1]}
    `;
    const labelRadius = arcRadius + 15;
    const labelX = vertex[0] + bisector[0] * labelRadius;
    const labelY = vertex[1] + bisector[1] * labelRadius;

    return (
      <g key={`angle-${label}`}>
        <path d={pathData} fill="none" stroke={color} strokeWidth="2" />
        <text x={labelX} y={labelY} fontSize="16" fontWeight="bold" fill={color} textAnchor="middle" dy="0.3em">
          {label}
        </text>
      </g>
    );
  };

  const centroid: [number, number] = [
    (posA[0] + posB[0] + posC[0]) / 3,
    (posA[1] + posB[1] + posC[1]) / 3,
  ];

  const pointLabelProps = (pos: [number, number]) => {
    const dx = pos[0] - centroid[0];
    const dy = pos[1] - centroid[1];
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const offset = 16;
    const x = pos[0] + (dx / len) * offset;
    const y = pos[1] + (dy / len) * offset;
    const textAnchor = dx > 5 ? 'start' : dx < -5 ? 'end' : 'middle';
    const dyAttr = dy > 5 ? '0.8em' : dy < -5 ? '0em' : '0.3em';
    return { x, y, textAnchor, dyAttr };
  };

  const labelA = pointLabelProps(posA);
  const labelB = pointLabelProps(posB);
  const labelC = pointLabelProps(posC);

  const sideColor = (key: SideKey) => (highlightSides.includes(key) ? RED : BLACK);
  const angleColor = (key: AngleKey) => (highlightAngles.includes(key) ? RED : BLACK);

  const isRightAngleAtA = rightAngleAtPoint === 'A';
  const isRightAngleAtB = rightAngleAtPoint === 'B';
  const isRightAngleAtC = rightAngleAtPoint === 'C';

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet">
      <polygon
        points={`${posA[0]},${posA[1]} ${posB[0]},${posB[1]} ${posC[0]},${posC[1]}`}
        fill="rgba(6, 182, 201, 0.1)"
        stroke="black"
        strokeWidth="2"
      />

      <circle cx={posA[0]} cy={posA[1]} r="4" fill="black" />
      <circle cx={posB[0]} cy={posB[1]} r="4" fill="black" />
      <circle cx={posC[0]} cy={posC[1]} r="4" fill="black" />

      <text x={labelA.x} y={labelA.y} dy={labelA.dyAttr} textAnchor={labelA.textAnchor} fontSize="14" fontWeight="bold">
        A
      </text>
      <text x={labelB.x} y={labelB.y} dy={labelB.dyAttr} textAnchor={labelB.textAnchor} fontSize="14" fontWeight="bold">
        B
      </text>
      <text x={labelC.x} y={labelC.y} dy={labelC.dyAttr} textAnchor={labelC.textAnchor} fontSize="14" fontWeight="bold">
        C
      </text>

      {/* Seiten-Labels: a gegenüber A (zwischen B,C), b gegenüber B (zwischen A,C), c gegenüber C (zwischen A,B) */}
      <text
        x={(posB[0] + posC[0]) / 2 + 15}
        y={(posB[1] + posC[1]) / 2}
        fontSize="14"
        fontWeight="bold"
        fill={sideColor('a')}
        textAnchor="middle"
      >
        a
      </text>
      <text
        x={(posA[0] + posC[0]) / 2 - 20}
        y={(posA[1] + posC[1]) / 2}
        fontSize="14"
        fontWeight="bold"
        fill={sideColor('b')}
        textAnchor="middle"
      >
        b
      </text>
      <text
        x={(posA[0] + posB[0]) / 2}
        y={(posA[1] + posB[1]) / 2 - 15}
        fontSize="14"
        fontWeight="bold"
        fill={sideColor('c')}
        textAnchor="middle"
      >
        c
      </text>

      {drawAngleArc(posA, posC, posB, isRightAngleAtA, angleSymbols.alpha, angleColor('alpha'))}
      {drawAngleArc(posB, posA, posC, isRightAngleAtB, angleSymbols.beta, angleColor('beta'))}
      {drawAngleArc(posC, posB, posA, isRightAngleAtC, angleSymbols.gamma, angleColor('gamma'))}
    </svg>
  );
};

export default RightTriangleTaskSVG;
export type { AngleKey, SideKey };

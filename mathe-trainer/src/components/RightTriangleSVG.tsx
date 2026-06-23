import React from 'react';

interface RightTriangleSVGProps {
  pointA: string;
  pointB: string;
  pointC: string;
  sideA: string;      // Seite gegenüber von A (zwischen B und C)
  sideB: string;      // Seite gegenüber von B (zwischen A und C)
  sideC: string;      // Seite gegenüber von C (zwischen A und B)
  rightAngleAtPoint: string;  // Punkt wo der 90° Winkel ist
  markedAngle?: 'alpha' | 'beta';
  markedAngleAtPoint?: string; // Punkt wo der markierte Winkel ist
}

// Virtuelles Koordinatensystem für die Geometrie-Berechnung.
// Das SVG selbst skaliert über viewBox + width/height="100%" auf den verfügbaren Platz.
const VIEW_WIDTH = 320;
const VIEW_HEIGHT = 260;

const RightTriangleSVG: React.FC<RightTriangleSVGProps> = ({
  pointA,
  pointB,
  pointC,
  sideA,
  sideB,
  sideC,
  rightAngleAtPoint,
  markedAngleAtPoint,
}) => {
  const width = VIEW_WIDTH;
  const height = VIEW_HEIGHT;

  // Katheten-Längen (in SVG-Einheiten)
  const cathetus1 = 200;
  const cathetus2 = 140;

  // Bestimme die Positionen der Punkte
  let posA: [number, number];
  let posB: [number, number];
  let posC: [number, number];
  let rightAnglePoint: [number, number];

  const margin = 40;

  if (rightAngleAtPoint === pointA) {
    // Rechter Winkel bei A (oben links)
    posA = [margin + 20, margin + 20];
    posB = [posA[0] + cathetus1, posA[1]];           // Horizontal
    posC = [posA[0], posA[1] + cathetus2];           // Vertikal
    rightAnglePoint = posA;
  } else if (rightAngleAtPoint === pointB) {
    // Rechter Winkel bei B (unten rechts)
    posB = [width - margin - 20, height - margin - 20];
    posA = [posB[0] - cathetus1, posB[1]];           // Horizontal
    posC = [posB[0], posB[1] - cathetus2];           // Vertikal
    rightAnglePoint = posB;
  } else {
    // Rechter Winkel bei C (unten links)
    posC = [margin + 20, height - margin - 20];
    posA = [posC[0] + cathetus1, posC[1]];           // Horizontal
    posB = [posC[0], posC[1] - cathetus2];           // Vertikal
    rightAnglePoint = posC;
  }

  // Hilfsfunktion zum Berechnen des Winkels zwischen zwei Linien
  const calculateAngle = (
    p1: [number, number],
    vertex: [number, number],
    p2: [number, number]
  ): number => {
    const v1 = [p1[0] - vertex[0], p1[1] - vertex[1]];
    const v2 = [p2[0] - vertex[0], p2[1] - vertex[1]];
    const angle1 = Math.atan2(v1[1], v1[0]);
    const angle2 = Math.atan2(v2[1], v2[0]);
    return angle2 - angle1;
  };

  // Berechne Winkel für jeden Punkt
  const angleAtA = calculateAngle(posC, posA, posB);
  const angleAtB = calculateAngle(posA, posB, posC);
  const angleAtC = calculateAngle(posB, posC, posA);

  // Radius für die Winkel-Bögen
  const arcRadius = 25;

  // Hilfsfunktion zum Zeichnen eines Winkel-Bogens
  const drawAngleArc = (
    vertex: [number, number],
    p1: [number, number],
    p2: [number, number],
    radius: number,
    label: string,
    isRightAngle: boolean,
    isMarked: boolean
  ) => {
    const v1 = [p1[0] - vertex[0], p1[1] - vertex[1]];
    const v2 = [p2[0] - vertex[0], p2[1] - vertex[1]];
    const len1 = Math.sqrt(v1[0] * v1[0] + v1[1] * v1[1]);
    const len2 = Math.sqrt(v2[0] * v2[0] + v2[1] * v2[1]);

    const start = [
      vertex[0] + (v1[0] / len1) * radius,
      vertex[1] + (v1[1] / len1) * radius,
    ];
    const end = [
      vertex[0] + (v2[0] / len2) * radius,
      vertex[1] + (v2[1] / len2) * radius,
    ];

    if (isRightAngle) {
      // Zeichne einen grauen Viertelkreis-Bogen mit Punkt für den rechten Winkel
      const angle1 = Math.atan2(v1[1], v1[0]);
      const angle2 = Math.atan2(v2[1], v2[0]);
      const largeArc = Math.abs(angle2 - angle1) > Math.PI ? 1 : 0;

      const sectorPath = `
        M ${vertex[0]} ${vertex[1]}
        L ${start[0]} ${start[1]}
        A ${radius} ${radius} 0 ${largeArc} 1 ${end[0]} ${end[1]}
        Z
      `;

      const midAngle = (angle1 + angle2) / 2;
      const dotRadius = radius * 0.55;
      const dotX = vertex[0] + Math.cos(midAngle) * dotRadius;
      const dotY = vertex[1] + Math.sin(midAngle) * dotRadius;

      return (
        <g key={`angle-${label}`}>
          <path d={sectorPath} fill="#9CA3AF" fillOpacity="0.35" stroke="#6B7280" strokeWidth="1" />
          <circle cx={dotX} cy={dotY} r="2.5" fill="#374151" />
        </g>
      );
    } else {
      // Zeichne einen Bogen mit Label
      const angle1 = Math.atan2(v1[1], v1[0]);
      const angle2 = Math.atan2(v2[1], v2[0]);

      const largeArc = Math.abs(angle2 - angle1) > Math.PI ? 1 : 0;

      const pathData = `
        M ${start[0]} ${start[1]}
        A ${radius} ${radius} 0 ${largeArc} 1 ${end[0]} ${end[1]}
      `;

      // Berechne Label-Position
      const midAngle = (angle1 + angle2) / 2;
      const labelRadius = radius + 15;
      const labelX = vertex[0] + Math.cos(midAngle) * labelRadius;
      const labelY = vertex[1] + Math.sin(midAngle) * labelRadius;

      const color = isMarked ? '#DC2626' : '#06B6C9';

      return (
        <g key={`angle-${label}`}>
          <path d={pathData} fill="none" stroke={color} strokeWidth={isMarked ? 3 : 2} />
          <text
            x={labelX}
            y={labelY}
            fontSize="16"
            fontWeight="bold"
            fill={color}
            textAnchor="middle"
            dy="0.3em"
          >
            {label}
          </text>
        </g>
      );
    }
  };

  // Bestimme welcher Punkt den rechten Winkel hat
  const isRightAngleAtA = rightAngleAtPoint === pointA;
  const isRightAngleAtB = rightAngleAtPoint === pointB;
  const isRightAngleAtC = rightAngleAtPoint === pointC;

  return (
    <svg
      width="100%"
      height="100%"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Dreieck zeichnen */}
      <polygon
        points={`${posA[0]},${posA[1]} ${posB[0]},${posB[1]} ${posC[0]},${posC[1]}`}
        fill="rgba(6, 182, 201, 0.1)"
        stroke="black"
        strokeWidth="2"
      />

      {/* Punkte zeichnen */}
      <circle cx={posA[0]} cy={posA[1]} r="4" fill="black" />
      <circle cx={posB[0]} cy={posB[1]} r="4" fill="black" />
      <circle cx={posC[0]} cy={posC[1]} r="4" fill="black" />

      {/* Punkt-Labels */}
      <text x={posA[0] - 15} y={posA[1] - 10} fontSize="14" fontWeight="bold">
        {pointA}
      </text>
      <text x={posB[0] + 10} y={posB[1] - 10} fontSize="14" fontWeight="bold">
        {pointB}
      </text>
      <text x={posC[0] - 15} y={posC[1] + 20} fontSize="14" fontWeight="bold">
        {pointC}
      </text>

      {/* Seiten-Labels */}
      <text
        x={(posB[0] + posC[0]) / 2 + 15}
        y={(posB[1] + posC[1]) / 2}
        fontSize="13"
        fill="#333"
        textAnchor="middle"
      >
        {sideA}
      </text>
      <text
        x={(posA[0] + posC[0]) / 2 - 20}
        y={(posA[1] + posC[1]) / 2}
        fontSize="13"
        fill="#333"
        textAnchor="middle"
      >
        {sideB}
      </text>
      <text
        x={(posA[0] + posB[0]) / 2}
        y={(posA[1] + posB[1]) / 2 - 15}
        fontSize="13"
        fill="#333"
        textAnchor="middle"
      >
        {sideC}
      </text>

      {/* Winkel-Bögen */}
      {drawAngleArc(posA, posC, posB, arcRadius, 'α', isRightAngleAtA, markedAngleAtPoint === pointA)}
      {drawAngleArc(posB, posA, posC, arcRadius, 'β', isRightAngleAtB, markedAngleAtPoint === pointB)}
      {drawAngleArc(posC, posB, posA, arcRadius, 'γ', isRightAngleAtC, markedAngleAtPoint === pointC)}
    </svg>
  );
};

export default RightTriangleSVG;

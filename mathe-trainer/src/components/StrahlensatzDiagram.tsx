import React from 'react';

interface DiagramConfig {
  // Zentrum Z Position
  centerX: number;
  centerY: number;
  
  // Strahl 1: Richtungsvektor und Länge
  ray1Angle: number; // in Grad
  ray1Length: number;
  
  // Strahl 2: Richtungsvektor und Länge
  ray2Angle: number; // in Grad
  ray2Length: number;
  
  // Parallele Geraden: Parameter t entlang der Strahlen
  parallel1_t: number; // Position auf den Strahlen (0-1)
  parallel2_t: number; // Position auf den Strahlen (0-1)
  
  // Labels
  centerLabel: string;
  point1aLabel: string; // A (auf Strahl 1, parallel 1)
  point1bLabel: string; // A' (auf Strahl 2, parallel 1)
  point2aLabel: string; // B (auf Strahl 1, parallel 2)
  point2bLabel: string; // B' (auf Strahl 2, parallel 2)
  
  // Streckenlängen-Labels (optional)
  showMeasurements?: boolean;
  measurements?: {
    za?: string | number;
    ab?: string | number;
    za_strich?: string | number;
    ab_strich?: string | number;
  };
}

export default function StrahlensatzDiagram({ config }: { config: DiagramConfig }) {
  const svgWidth = 600;
  const svgHeight = 500;
  
  // Umrechnung von Grad zu Radiant
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  
  // Berechne Endpunkte der Strahlen
  const ray1End = {
    x: config.centerX + config.ray1Length * Math.cos(toRad(config.ray1Angle)),
    y: config.centerY - config.ray1Length * Math.sin(toRad(config.ray1Angle))
  };
  
  const ray2End = {
    x: config.centerX + config.ray2Length * Math.cos(toRad(config.ray2Angle)),
    y: config.centerY - config.ray2Length * Math.sin(toRad(config.ray2Angle))
  };
  
  // Berechne Schnittpunkte: Parallele 1
  const point1a = {
    x: config.centerX + config.parallel1_t * (ray1End.x - config.centerX),
    y: config.centerY + config.parallel1_t * (ray1End.y - config.centerY)
  };
  
  const point1b = {
    x: config.centerX + config.parallel1_t * (ray2End.x - config.centerX),
    y: config.centerY + config.parallel1_t * (ray2End.y - config.centerY)
  };
  
  // Berechne Schnittpunkte: Parallele 2
  const point2a = {
    x: config.centerX + config.parallel2_t * (ray1End.x - config.centerX),
    y: config.centerY + config.parallel2_t * (ray1End.y - config.centerY)
  };
  
  const point2b = {
    x: config.centerX + config.parallel2_t * (ray2End.x - config.centerX),
    y: config.centerY + config.parallel2_t * (ray2End.y - config.centerY)
  };
  
  // Hilfsfunktion: Distanz zwischen zwei Punkten berechnen
  const distance = (p1: { x: number; y: number }, p2: { x: number; y: number }) => {
    return Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
  };
  
  // Berechne echte Distanzen (für optionale Anzeige)
  const dist_za = distance({ x: config.centerX, y: config.centerY }, point1a);
  const dist_ab = distance(point1a, point2a);
  const dist_za_strich = distance({ x: config.centerX, y: config.centerY }, point1b);
  const dist_ab_strich = distance(point1b, point2b);
  
  return (
    <svg
      width="100%"
      height="auto"
      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
      className="border border-slate-200 rounded-lg bg-white"
    >
      {/* Hintergrund */}
      <rect width={svgWidth} height={svgHeight} fill="white" />
      
      {/* Strahlen */}
      <line
        x1={config.centerX}
        y1={config.centerY}
        x2={ray1End.x}
        y2={ray1End.y}
        stroke="black"
        strokeWidth="2"
      />
      <line
        x1={config.centerX}
        y1={config.centerY}
        x2={ray2End.x}
        y2={ray2End.y}
        stroke="black"
        strokeWidth="2"
      />
      
      {/* Parallele Geraden */}
      {/* Parallele 1 */}
      <line
        x1={point1a.x - (point2a.x - point1a.x) * 0.2}
        y1={point1a.y - (point2a.y - point1a.y) * 0.2}
        x2={point1b.x + (point2a.x - point1a.x) * 0.3}
        y2={point1b.y + (point2a.y - point1a.y) * 0.3}
        stroke="blue"
        strokeWidth="2.5"
        strokeDasharray="5,5"
      />
      
      {/* Parallele 2 */}
      <line
        x1={point2a.x - (point2a.x - point1a.x) * 0.2}
        y1={point2a.y - (point2a.y - point1a.y) * 0.2}
        x2={point2b.x + (point2a.x - point1a.x) * 0.3}
        y2={point2b.y + (point2a.y - point1a.y) * 0.3}
        stroke="blue"
        strokeWidth="2.5"
        strokeDasharray="5,5"
      />
      
      {/* Punkte (Schnittpunkte + Zentrum) */}
      {/* Zentrum Z */}
      <circle
        cx={config.centerX}
        cy={config.centerY}
        r="5"
        fill="black"
        stroke="black"
        strokeWidth="1"
      />
      <text
        x={config.centerX - 15}
        y={config.centerY - 10}
        fontSize="14"
        fontWeight="bold"
        fill="black"
      >
        {config.centerLabel}
      </text>
      
      {/* Punkt A (Strahl 1, Parallele 1) */}
      <circle cx={point1a.x} cy={point1a.y} r="5" fill="darkblue" stroke="darkblue" strokeWidth="1" />
      <text
        x={point1a.x - 15}
        y={point1a.y - 10}
        fontSize="13"
        fontWeight="bold"
        fill="darkblue"
      >
        {config.point1aLabel}
      </text>
      
      {/* Punkt A' (Strahl 2, Parallele 1) */}
      <circle cx={point1b.x} cy={point1b.y} r="5" fill="darkblue" stroke="darkblue" strokeWidth="1" />
      <text
        x={point1b.x + 8}
        y={point1b.y - 10}
        fontSize="13"
        fontWeight="bold"
        fill="darkblue"
      >
        {config.point1bLabel}
      </text>
      
      {/* Punkt B (Strahl 1, Parallele 2) */}
      <circle cx={point2a.x} cy={point2a.y} r="5" fill="darkblue" stroke="darkblue" strokeWidth="1" />
      <text
        x={point2a.x - 15}
        y={point2a.y + 20}
        fontSize="13"
        fontWeight="bold"
        fill="darkblue"
      >
        {config.point2aLabel}
      </text>
      
      {/* Punkt B' (Strahl 2, Parallele 2) */}
      <circle cx={point2b.x} cy={point2b.y} r="5" fill="darkblue" stroke="darkblue" strokeWidth="1" />
      <text
        x={point2b.x + 8}
        y={point2b.y + 20}
        fontSize="13"
        fontWeight="bold"
        fill="darkblue"
      >
        {config.point2bLabel}
      </text>
      
      {/* Optional: Streckenlängen-Labels */}
      {config.showMeasurements && (
        <>
          {/* ZA */}
          {config.measurements?.za && (
            <text
              x={(config.centerX + point1a.x) / 2 - 20}
              y={(config.centerY + point1a.y) / 2}
              fontSize="12"
              fill="darkgreen"
              fontWeight="bold"
              backgroundColor="white"
            >
              {config.measurements.za} cm
            </text>
          )}
          
          {/* AB */}
          {config.measurements?.ab && (
            <text
              x={(point1a.x + point2a.x) / 2 - 20}
              y={(point1a.y + point2a.y) / 2 + 15}
              fontSize="12"
              fill="darkgreen"
              fontWeight="bold"
            >
              {config.measurements.ab} cm
            </text>
          )}
          
          {/* ZA' */}
          {config.measurements?.za_strich && (
            <text
              x={(config.centerX + point1b.x) / 2 + 15}
              y={(config.centerY + point1b.y) / 2}
              fontSize="12"
              fill="darkgreen"
              fontWeight="bold"
            >
              {config.measurements.za_strich} cm
            </text>
          )}
          
          {/* A'B' */}
          {config.measurements?.ab_strich && (
            <text
              x={(point1b.x + point2b.x) / 2 + 15}
              y={(point1b.y + point2b.y) / 2 + 15}
              fontSize="12"
              fill="darkgreen"
              fontWeight="bold"
            >
              {config.measurements.ab_strich} cm
            </text>
          )}
        </>
      )}
      
      {/* Info-Text unten */}
      <text
        x="10"
        y={svgHeight - 10}
        fontSize="11"
        fill="gray"
      >
        Parallele Geraden (gestrichelt) schneiden die Strahlen
      </text>
    </svg>
  );
}

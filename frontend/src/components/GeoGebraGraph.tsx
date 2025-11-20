import React, { useEffect, useRef } from 'react';

interface GeoGebraGraphProps {
  m: number;
  t: number;
  width?: number;
  height?: number;
}

// Lädt das GeoGebra Applet als iframe mit passender Gerade, nur Koordinatensystem und Graph
const GeoGebraGraph: React.FC<GeoGebraGraphProps> = ({ m, t, width = 480, height = 360 }) => {
  // Baue die GeoGebra Graphing-URL mit der Geradengleichung und reduzierten UI-Parametern
  const equation = `y=${m}*x+${t}`;
  // Nutze den /graphing Endpunkt für ein reines Koordinatensystem ohne UI
  const url =
    `https://www.geogebra.org/graphing?embed&ui=0&toolbar=0&inputbar=0&menubar=0&resetIcon=0&cas=0&algebra=0&perspective=G` +
    `&command=${encodeURIComponent(equation)}`;

  return (
    <div className="geogebra-graph-container" style={{ width, height, margin: '0 auto' }}>
      <iframe
        title="GeoGebra Graph"
        src={url}
        width={width}
        height={height}
        style={{ border: 0 }}
        allowFullScreen
      />
    </div>
  );
};

export default GeoGebraGraph;

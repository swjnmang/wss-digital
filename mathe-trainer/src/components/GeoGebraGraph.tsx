import React from 'react';

interface GeoGebraGraphProps {
  m: number;
  t: number;
  width?: number | string;
  height?: number | string;
  hideUI?: boolean;
  showGrid?: boolean;
}

// Verbesserte GeoGebra-Komponente für konsistente Graph-Anzeige
const GeoGebraGraph: React.FC<GeoGebraGraphProps> = ({ 
  m, 
  t, 
  width = '100%', 
  height = 500,
  hideUI = true,
  showGrid = true
}) => {
  const equation = `y=${m}*x+${t}`;
  
  // Baue die URL mit optimierten Parametern
  const params = new URLSearchParams();
  params.append('command', equation);
  params.append('embed', '1');
  
  if (hideUI) {
    params.append('ui', '0');
    params.append('toolbar', '0');
    params.append('inputbar', '0');
    params.append('menubar', '0');
    params.append('resetIcon', '0');
    params.append('cas', '0');
    params.append('algebra', '0');
    params.append('perspective', 'G');
  }
  
  const url = `https://www.geogebra.org/graphing?${params.toString()}`;

  return (
    <div 
      className="geogebra-graph-container" 
      style={{ 
        width: typeof width === 'number' ? `${width}px` : width, 
        height: typeof height === 'number' ? `${height}px` : height,
        margin: '0 auto',
        borderRadius: '8px',
        overflow: 'hidden'
      }}
    >
      <iframe
        title="GeoGebra Graphing"
        src={url}
        style={{ 
          width: '100%',
          height: '100%',
          border: 'none',
          borderRadius: '8px'
        }}
        allowFullScreen
      />
    </div>
  );
};

export default GeoGebraGraph;

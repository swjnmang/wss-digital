import React from 'react';

interface GeoGebraAppletProps {
  filename?: string;
  width?: number;
  height?: number;
  borderColor?: string;
}

export default function GeoGebraApplet({
  filename,
  width = 800,
  height = 600,
  borderColor = "cccccc",
}: GeoGebraAppletProps) {
  
  if (!filename) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
        Keine Visualisierung angegeben
      </div>
    );
  }

  return (
    <div style={{ width: "100%", display: "flex", justifyContent: "center", marginBottom: "20px" }}>
      <iframe
        src={`/geogebra/${filename}.html`}
        width={width}
        height={height}
        style={{
          border: `2px solid #${borderColor}`,
          borderRadius: 8,
          backgroundColor: "white"
        }}
        title={`GeoGebra ${filename}`}
      />
    </div>
  );
}

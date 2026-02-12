import React, { useEffect, useRef } from 'react';

interface GeoGebraGraphProps {
  m: number;
  t: number;
  width?: number | string;
  height?: number | string;
}

const GeoGebraGraph: React.FC<GeoGebraGraphProps> = ({ 
  m, 
  t, 
  width = '100%', 
  height = 500
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const appletRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Lade deployggb.js wenn noch nicht geladen
    const existing = document.querySelector('script[src="https://www.geogebra.org/apps/deployggb.js"]');
    if (!existing) {
      const s = document.createElement('script');
      s.src = 'https://www.geogebra.org/apps/deployggb.js';
      document.head.appendChild(s);
    }

    // Warte bis GeoGebra bereit ist
    const timer = setTimeout(() => {
      if (typeof window !== 'undefined' && (window as any).GGBApplet) {
        const parameters = {
          id: `ggb_${Math.random().toString(36).substr(2, 9)}`,
          width: typeof width === 'number' ? width : '100%',
          height: typeof height === 'number' ? height : 500,
          showToolBar: false,
          showAlgebraInput: false,
          showMenuBar: false,
          enableShiftDragZoom: true,
          showResetIcon: false,
          algebraInputPosition: 'top',
          enableFileMenu: false,
          enableUndoRedo: false,
          showCasButton: false,
          showFullscreenButton: false,
          perspective: 'G',
          appName: 'graphing'
        };

        const applet = new (window as any).GGBApplet(parameters, true);
        appletRef.current = applet;
        applet.inject(containerRef.current);

        // Setze die Gleichung nach dem Laden
        setTimeout(() => {
          if (applet.getXML) {
            applet.evalCommand(`f(x) = ${m}*x + ${t}`);
          }
        }, 500);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [m, t, width, height]);

  return (
    <div 
      ref={containerRef}
      className="geogebra-graph-container" 
      style={{ 
        width: typeof width === 'number' ? `${width}px` : width, 
        height: typeof height === 'number' ? `${height}px` : height,
        margin: '0 auto',
        borderRadius: '8px',
        overflow: 'hidden'
      }}
    />
  );
};

export default GeoGebraGraph;

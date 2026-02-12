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
  const elementIdRef = useRef<string>(`ggb_${Math.random().toString(36).substr(2, 9)}`);

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
          id: elementIdRef.current,
          appName: 'graphing',
          width: typeof width === 'number' ? width : '100%',
          height: typeof height === 'number' ? height : 500,
          
          // UI-Elemente ausblenden - WICHTIG: false als Wert (nicht "false")
          showMenuBar: false,
          showToolBar: false,
          showAlgebraInput: false,
          showResetIcon: false,
          showFullscreenButton: false,
          enableShiftDragZoom: true,
          
          // Diese Parameter sind optional aber hilfreich
          enableRightClick: false,
          enableCAS: false,
          enableFileMenu: false,
          enableUndoRedo: false,
          perspective: 'G'
        };

        const applet = new (window as any).GGBApplet(parameters, true);
        appletRef.current = applet;
        
        // Injiziere das Applet in den Container
        applet.inject(containerRef.current);

        // Setze die Gleichung nach dem Laden
        setTimeout(() => {
          if (applet.evalCommand) {
            applet.evalCommand(`y = ${m}*x + ${t}`);
          }
        }, 1000);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [m, t, width, height]);

  return (
    <div 
      ref={containerRef}
      id={elementIdRef.current}
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

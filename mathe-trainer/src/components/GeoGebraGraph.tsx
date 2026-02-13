import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    GGBApplet: any;
  }
}

interface GeoGebraGraphProps {
  m: number;
  t: number;
  width?: number;
  height?: number;
}

const GeoGebraGraph: React.FC<GeoGebraGraphProps> = ({ 
  m, 
  t, 
  width = 600, 
  height = 500
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const appletRef = useRef<any>(null);
  const elementIdRef = useRef<string>(`ggb-elem-${Math.random().toString(36).substr(2, 9)}`);

  // Initialisiere GeoGebra einmalig
  useEffect(() => {
    const elementId = elementIdRef.current;
    
    const initApplet = () => {
      if (!window.GGBApplet || appletRef.current) return;

      const params = {
        appName: 'classic', // WICHTIG: Muss 'classic' sein, nicht 'graphing'!
        width: width,
        height: height,
        perspective: 'G', // Nur die Graphik-Ansicht
        showToolBar: false,
        showAlgebraInput: false,
        showMenuBar: false,
        showResetIcon: false,
        showFullscreenButton: false,
        showZoomButtons: true, // Zoom + / - Buttons anzeigen
        useBrowserForJS: true,
        appletOnLoad: (api: any) => {
          appletRef.current = api;
          // Setze die initiale Gleichung
          updateGraph(api, m, t);
        }
      };

      try {
        const applet = new window.GGBApplet(params, true);
        applet.inject(elementId);
      } catch (e) {
        console.error('GeoGebra Error beim Injizieren:', e);
      }
    };

    // Lade deployggb.js script wenn es noch nicht existiert
    const existing = document.querySelector('script[src="https://www.geogebra.org/apps/deployggb.js"]');
    
    if (!existing) {
      const s = document.createElement('script');
      s.src = 'https://www.geogebra.org/apps/deployggb.js';
      s.async = true;
      s.onload = () => {
        setTimeout(() => initApplet(), 100);
      };
      document.body.appendChild(s);
    } else {
      initApplet();
    }
  }, [width, height]);

  // Update Graph wenn m oder t sich ändert
  useEffect(() => {
    if (appletRef.current && appletRef.current.evalCommand) {
      updateGraph(appletRef.current, m, t);
    }
  }, [m, t]);

  const updateGraph = (api: any, m: number, t: number) => {
    try {
      api.reset();
      api.evalCommand(`f(x) = ${m}*x + ${t}`);
    } catch (e) {
      console.error('Fehler beim Update der Gleichung:', e);
    }
  };

  return (
    <div 
      ref={containerRef}
      style={{ 
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        backgroundColor: '#f9f9f9',
        padding: '10px',
        borderRadius: '8px'
      }}
    >
      <div 
        id={elementIdRef.current}
        style={{
          width: `${width}px`,
          height: `${height}px`,
          border: '1px solid #ddd',
          borderRadius: '4px'
        }}
      />
    </div>
  );
};

export default GeoGebraGraph;

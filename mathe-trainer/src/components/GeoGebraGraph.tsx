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
  const elementIdRef = useRef<string>(`ggb-element-${Math.random().toString(36).substr(2, 9)}`);
  const appletRef = useRef<any>(null);
  const containerIdRef = useRef<string>(`ggb-container-${Math.random().toString(36).substr(2, 9)}`);
  const initDoneRef = useRef(false);

  // Effekt nur für Initialization - läuft nur einmal
  useEffect(() => {
    if (initDoneRef.current) return;

    const initApplet = () => {
      if (!window.GGBApplet || appletRef.current) return;

      const params = {
        id: elementIdRef.current,
        appName: 'graphing',
        width: width,
        height: height,
        
        // UI verstecken
        showMenuBar: false,
        showToolBar: false,
        showAlgebraInput: false,
        showResetIcon: false,
        showFullscreenButton: false,
        enableShiftDragZoom: true,
        enableRightClick: false,
        showZoomButtons: true
      };

      try {
        const applet = new window.GGBApplet(params, true);
        applet.inject(elementIdRef.current);
        appletRef.current = applet;
        
        // Setze Graph nach längerer Zeit
        setTimeout(() => {
          if (appletRef.current && appletRef.current.evalCommand) {
            appletRef.current.evalCommand(`y = ${m}*x + ${t}`);
          }
        }, 1500);
        
        initDoneRef.current = true;
      } catch (e) {
        console.error('GeoGebra Applet Error:', e);
      }
    };

    // Lade deployggb.js
    const existing = document.querySelector('script[src="https://www.geogebra.org/apps/deployggb.js"]');
    
    if (!existing) {
      const s = document.createElement('script');
      s.src = 'https://www.geogebra.org/apps/deployggb.js';
      s.async = true;
      s.onload = () => {
        setTimeout(() => initApplet(), 300);
      };
      document.body.appendChild(s);
    } else {
      initApplet();
    }
  }, []); // Nur beim Mount

  // Effekt für Gleichungs-Updates
  useEffect(() => {
    if (!appletRef.current || !appletRef.current.evalCommand) return;

    // Warte kurz, dann update
    const timer = setTimeout(() => {
      try {
        appletRef.current.evalCommand(`y = ${m}*x + ${t}`);
      } catch (e) {
        console.error('Error updating graph:', e);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [m, t]);

  return (
    <div 
      id={containerIdRef.current}
      style={{ 
        width: '100%',
        height: 'auto'
      }}
    >
      <div 
        id={elementIdRef.current}
        style={{
          width: `${width}px`,
          height: `${height}px`,
          margin: '0 auto',
          border: '1px solid #ccc',
          borderRadius: '8px',
          backgroundColor: 'white'
        }}
      />
    </div>
  );
};

export default GeoGebraGraph;

import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    GGBApplet: any;
  }
}

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
  const elementIdRef = useRef<string>(`ggb-element-${Math.random().toString(36).substr(2, 9)}`);
  const appletRef = useRef<any>(null);

  useEffect(() => {
    const initApplet = () => {
      if (!window.GGBApplet) {
        console.warn('GGBApplet nicht verfügbar');
        return;
      }

      // Wenn bereits ein Applet existiert, versuche es zu aktualisieren
      if (appletRef.current && appletRef.current.evalCommand) {
        appletRef.current.evalCommand(`y = ${m}*x + ${t}`);
        return;
      }

      // Neues Applet erstellen
      const params = {
        id: elementIdRef.current,
        appName: 'graphing',
        width: typeof width === 'number' ? width : '100%',
        height: typeof height === 'number' ? height : 500,
        
        // UI verstecken
        showMenuBar: false,
        showToolBar: false,
        showAlgebraInput: false,
        showResetIcon: false,
        showFullscreenButton: false,
        enableShiftDragZoom: true,
        enableRightClick: false,
        useBrowserForJS: false
      };

      try {
        const applet = new window.GGBApplet(params, true);
        appletRef.current = applet;
        applet.inject(elementIdRef.current);

        // Setze die Gleichung nach dem Laden
        setTimeout(() => {
          if (applet.evalCommand) {
            applet.evalCommand(`y = ${m}*x + ${t}`);
          }
        }, 600);
      } catch (e) {
        console.error('GeoGebra Applet Error:', e);
      }
    };

    const existing = document.querySelector('script[src="https://www.geogebra.org/apps/deployggb.js"]');
    
    if (!existing) {
      const s = document.createElement('script');
      s.src = 'https://www.geogebra.org/apps/deployggb.js';
      s.async = true;
      s.onload = () => initApplet();
      document.body.appendChild(s);
    } else {
      initApplet();
    }
  }, [m, t, width, height]);

  return (
    <div 
      className="geogebra-container"
      style={{ 
        width: typeof width === 'number' ? `${width}px` : width, 
        height: typeof height === 'number' ? `${height}px` : height,
        margin: '0 auto',
        position: 'relative',
        backgroundColor: 'white'
      }}
    >
      <div 
        id={elementIdRef.current}
        className="geogebra-element"
        style={{
          width: '100%',
          height: '100%'
        }}
      />
    </div>
  );
};

export default GeoGebraGraph;

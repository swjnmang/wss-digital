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

  useEffect(() => {
    const initApplet = () => {
      if (!window.GGBApplet) {
        console.warn('GGBApplet nicht verfügbar');
        return;
      }

      // Wenn bereits ein Applet existiert, aktualisiere die Gleichung
      if (appletRef.current && appletRef.current.evalCommand) {
        try {
          appletRef.current.evalCommand(`y = ${m}*x + ${t}`);
        } catch (e) {
          console.error('Fehler beim Aktualisieren der Gleichung:', e);
        }
        return;
      }

      // Neues Applet erstellen
      const params = {
        id: elementIdRef.current,
        appName: 'graphing',
        width: width,
        height: height,
        
        // UI verstecken - WICHTIG: Explizit false setzen
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
        appletRef.current = applet;
        
        // Injiziere mit der String-ID
        applet.inject(elementIdRef.current);

        // Setze die Gleichung nach dem Laden
        setTimeout(() => {
          if (applet.evalCommand) {
            try {
              applet.evalCommand(`y = ${m}*x + ${t}`);
              // Stelle sicher dass Achsen und Grid sichtbar sind
              if (applet.setAxisVisible) {
                applet.setAxesVisible(true, true);
              }
              if (applet.setGridVisible) {
                applet.setGridVisible(true);
              }
            } catch (e) {
              console.error('Fehler beim Setzen der Gleichung:', e);
            }
          }
        }, 1000);
      } catch (e) {
        console.error('GeoGebra Applet Creation Error:', e);
      }
    };

    // Überprüfe ob deployggb.js bereits geladen ist
    const existing = document.querySelector('script[src="https://www.geogebra.org/apps/deployggb.js"]');
    
    if (!existing) {
      const s = document.createElement('script');
      s.src = 'https://www.geogebra.org/apps/deployggb.js';
      s.async = true;
      s.onload = () => {
        setTimeout(() => initApplet(), 200);
      };
      document.body.appendChild(s);
    } else {
      // Script ist schon geladen, initialisiere direkt
      setTimeout(() => initApplet(), 100);
    }
  }, [m, t, width, height]);

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

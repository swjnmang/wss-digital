import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    GGBApplet: any;
  }
}

interface GeoGebraQuadraticGraphProps {
  a: number;
  b: number;
  c: number;
  width?: number;
  height?: number;
}

const GeoGebraQuadraticGraph: React.FC<GeoGebraQuadraticGraphProps> = ({
  a,
  b,
  c,
  width = 600,
  height = 500
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const appletRef = useRef<any>(null);
  const elementIdRef = useRef<string>(`ggb-quad-elem-${Math.random().toString(36).substr(2, 9)}`);
  const [scriptLoaded, setScriptLoaded] = React.useState<boolean>(!!window.GGBApplet);
  const [error, setError] = React.useState<boolean>(false);

  // Initialisiere GeoGebra einmalig
  useEffect(() => {
    const elementId = elementIdRef.current;

    const initApplet = () => {
      if (!window.GGBApplet || appletRef.current) return;

      const params = {
        appName: 'classic',
        width: width,
        height: height,
        perspective: 'G',
        showToolBar: false,
        showAlgebraInput: false,
        showMenuBar: false,
        showResetIcon: true,
        showFullscreenButton: false,
        showZoomButtons: true,
        useBrowserForJS: true,
        appletOnLoad: (api: any) => {
          appletRef.current = api;
          updateGraph(api, a, b, c);
        }
      };

      try {
        const applet = new window.GGBApplet(params, true);
        applet.inject(elementId);
      } catch (e) {
        console.error('GeoGebra Error beim Injizieren:', e);
        setError(true);
      }
    };

    const existing = document.querySelector('script[src="https://www.geogebra.org/apps/deployggb.js"]');

    if (!existing) {
      const s = document.createElement('script');
      s.src = 'https://www.geogebra.org/apps/deployggb.js';
      s.async = true;
      s.onload = () => {
        setScriptLoaded(true);
        setTimeout(() => initApplet(), 150);
      };
      s.onerror = () => {
        console.error('Fehler beim Laden von GeoGebra Script');
        setError(true);
      };
      document.body.appendChild(s);
    } else {
      setScriptLoaded(true);
      setTimeout(() => initApplet(), 50);
    }
  }, [width, height]);

  // Update Graph wenn a, b oder c sich ändert
  useEffect(() => {
    if (appletRef.current && appletRef.current.evalCommand) {
      updateGraph(appletRef.current, a, b, c);
    }
  }, [a, b, c]);

  const updateGraph = (api: any, a: number, b: number, c: number) => {
    try {
      api.reset();
      api.evalCommand(`f(x) = ${a}*x^2 + ${b}*x + ${c}`);
      api.setColor('f', 0, 0, 255);
      api.setLineThickness('f', 3);
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
      {error ? (
        <div
          style={{
            width: `${width}px`,
            height: `${height}px`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px dashed #d1d5db',
            borderRadius: '4px',
            backgroundColor: '#f3f4f6',
            flexDirection: 'column',
            gap: '10px',
            color: '#6b7280',
            fontSize: '14px'
          }}
        >
          <span>⚠️ Graph konnte nicht geladen werden</span>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '8px 16px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '13px'
            }}
          >
            Seite neu laden
          </button>
        </div>
      ) : !scriptLoaded ? (
        <div
          style={{
            width: `${width}px`,
            height: `${height}px`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid #e5e7eb',
            borderRadius: '4px',
            backgroundColor: '#f9fafb',
            color: '#6b7280',
            fontSize: '14px'
          }}
        >
          ⏳ Graph wird geladen...
        </div>
      ) : (
        <div
          id={elementIdRef.current}
          style={{
            width: `${width}px`,
            height: `${height}px`,
            border: '1px solid #ddd',
            borderRadius: '4px'
          }}
        />
      )}
    </div>
  );
};

export default GeoGebraQuadraticGraph;

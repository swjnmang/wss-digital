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

const GGB_SRC = 'https://www.geogebra.org/apps/deployggb.js';
let ggbLoader: Promise<void> | null = null;

/** Lädt deployggb.js genau einmal; alle Aufrufer bekommen dasselbe Promise (auch während das Skript noch lädt). */
function loadGeoGebra(): Promise<void> {
  if (window.GGBApplet) return Promise.resolve();
  if (ggbLoader) return ggbLoader;
  ggbLoader = new Promise<void>((resolve, reject) => {
    const done = () => (window.GGBApplet ? resolve() : reject(new Error('GGBApplet fehlt')));
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${GGB_SRC}"]`);
    if (existing) {
      existing.addEventListener('load', done);
      existing.addEventListener('error', () => reject(new Error('GeoGebra-Skript nicht geladen')));
      return;
    }
    const s = document.createElement('script');
    s.src = GGB_SRC;
    s.async = true;
    s.onload = done;
    s.onerror = () => reject(new Error('GeoGebra-Skript nicht geladen'));
    document.body.appendChild(s);
  }).catch((e) => {
    ggbLoader = null; // beim nächsten Versuch neu laden
    throw e;
  });
  return ggbLoader;
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
  const [scriptLoaded, setScriptLoaded] = React.useState<boolean>(!!window.GGBApplet);
  const [error, setError] = React.useState<boolean>(false);
  const latest = useRef({ m, t });
  latest.current = { m, t };

  // Skript laden (einmal für die ganze Seite, alle Graphen warten auf dasselbe Laden)
  useEffect(() => {
    let cancelled = false
    loadGeoGebra()
      .then(() => { if (!cancelled) setScriptLoaded(true) })
      .catch(() => { if (!cancelled) setError(true) })
    return () => { cancelled = true }
  }, [])

  // Applet einfügen, sobald das Skript da ist und das Ziel-Element gerendert wurde
  useEffect(() => {
    if (!scriptLoaded || appletRef.current) return
    const elementId = elementIdRef.current
    let cancelled = false
    let retryTimer: ReturnType<typeof setTimeout> | undefined

    const inject = (attempt: number) => {
      if (cancelled || appletRef.current) return
      const el = document.getElementById(elementId)
      if (!el || !window.GGBApplet) {
        retryTimer = setTimeout(() => inject(attempt), 100)
        return
      }
      el.innerHTML = ''

      const params = {
        appName: 'classic', // WICHTIG: Muss 'classic' sein, nicht 'graphing'!
        width: width,
        height: height,
        perspective: 'G', // Nur die Graphik-Ansicht
        showToolBar: false,
        showAlgebraInput: false,
        showMenuBar: false,
        showResetIcon: true,
        showFullscreenButton: false,
        showZoomButtons: true, // Zoom + / - Buttons anzeigen
        useBrowserForJS: true,
        appletOnLoad: (api: any) => {
          if (cancelled) return
          appletRef.current = api
          // Setze die initiale Gleichung
          updateGraph(api, latest.current.m, latest.current.t)
        }
      }

      try {
        const applet = new window.GGBApplet(params, true)
        applet.inject(elementId)
      } catch (e) {
        console.error('GeoGebra Error beim Injizieren:', e)
        setError(true)
        return
      }

      // Wenn das Applet nicht meldet, dass es geladen ist: einmal neu versuchen, danach Fehlermeldung
      retryTimer = setTimeout(() => {
        if (cancelled || appletRef.current) return
        if (attempt < 2) inject(attempt + 1)
        else setError(true)
      }, 8000)
    }

    inject(1)
    return () => {
      cancelled = true
      if (retryTimer) clearTimeout(retryTimer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scriptLoaded, width, height])

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

export default GeoGebraGraph;

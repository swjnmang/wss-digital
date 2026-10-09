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
  /** Gitternetz anzeigen (zum Ablesen) */
  grid?: boolean;
  /** Sichtbarer Bereich [xMin, xMax, yMin, yMax] */
  view?: [number, number, number, number];
  /** Steigungsdreieck ab x = x1 mit waagrechter Kathete dx (Δx grün, Δy rot) */
  triangle?: { x1: number; dx: number } | null;
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
  height = 500,
  grid = false,
  view,
  triangle = null,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const appletRef = useRef<any>(null);
  const elementIdRef = useRef<string>(`ggb-elem-${Math.random().toString(36).substr(2, 9)}`);
  const [scriptLoaded, setScriptLoaded] = React.useState<boolean>(!!window.GGBApplet);
  const [error, setError] = React.useState<boolean>(false);
  const latest = useRef({ m, t, grid, view, triangle });
  latest.current = { m, t, grid, view, triangle };

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
        // Das eingebaute GeoGebra-Reset-Symbol setzt auf einen leeren Ausgangszustand zurück (Gerade weg);
        // stattdessen gibt es unten einen eigenen Button, der die Gerade neu zeichnet.
        showResetIcon: false,
        showFullscreenButton: false,
        showZoomButtons: true, // Zoom + / - Buttons anzeigen
        useBrowserForJS: true,
        appletOnLoad: (api: any) => {
          if (cancelled) return
          appletRef.current = api
          // Setze die initiale Gleichung
          updateGraph(api)
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
  const viewKey = view ? view.join(',') : '';
  const triangleKey = triangle ? `${triangle.x1},${triangle.dx}` : '';
  useEffect(() => {
    if (appletRef.current && appletRef.current.evalCommand) {
      updateGraph(appletRef.current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [m, t, grid, viewKey, triangleKey]);

  const updateGraph = (api: any) => {
    const { m, t, grid, view, triangle } = latest.current;
    try {
      api.reset();
      api.evalCommand(`f(x) = ${m}*x + ${t}`);
      if (grid) api.setGridVisible(true);
      if (view) api.setCoordSystem(view[0], view[1], view[2], view[3]);
      if (triangle) {
        const { x1, dx } = triangle;
        const x2 = x1 + dx;
        const y1 = m * x1 + t;
        const y2 = m * x2 + t;
        const dy = Math.round((y2 - y1) * 1000) / 1000;
        const fmt = (n: number) => String(n).replace('.', ',');
        api.evalCommand(`A = (${x1}, ${y1})`);
        api.evalCommand(`B = (${x2}, ${y2})`);
        api.evalCommand(`C = (${x2}, ${y1})`);
        api.evalCommand('dX = Segment(A, C)');
        api.evalCommand('dY = Segment(C, B)');
        api.setColor('dX', 22, 163, 74);
        api.setColor('dY', 220, 38, 38);
        api.setLineThickness('dX', 7);
        api.setLineThickness('dY', 7);
        ['A', 'B'].forEach((p) => { api.setColor(p, 30, 41, 59); api.setPointSize(p, 5); api.setFixed(p, true, false); });
        api.setVisible('C', false);
        api.setLabelVisible('dX', false);
        api.setLabelVisible('dY', false);
        // Beschriftungen Δx (unter/über der waagrechten Kathete) und Δy (neben der senkrechten Kathete)
        const below = dy > 0 ? -0.6 : 0.35;
        api.evalCommand(`tX = Text("Δx = ${fmt(dx)}", (${x1 + dx / 2 - 0.8}, ${y1 + below}))`);
        api.evalCommand(`tY = Text("Δy = ${fmt(dy)}", (${x2 + 0.2}, ${(y1 + y2) / 2}))`);
        api.setColor('tX', 22, 163, 74);
        api.setColor('tY', 220, 38, 38);
      }
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
        <div style={{ position: 'relative' }}>
        <div 
          id={elementIdRef.current}
          style={{
            width: `${width}px`,
            height: `${height}px`,
            border: '1px solid #ddd',
            borderRadius: '4px'
          }}
        />
          <button
            type="button"
            title="Graph neu laden"
            aria-label="Graph neu laden"
            onClick={() => {
              if (appletRef.current) updateGraph(appletRef.current)
            }}
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              width: 34,
              height: 34,
              borderRadius: 6,
              border: '1px solid #cbd5e1',
              background: 'rgba(255,255,255,0.92)',
              color: '#475569',
              fontSize: 20,
              lineHeight: 1,
              cursor: 'pointer',
            }}
          >
            ⟳
          </button>
        </div>
      )}
    </div>
  );
};

export default GeoGebraGraph;

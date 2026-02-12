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
  const containerRef = useRef<HTMLDivElement>(null);
  const elementIdRef = useRef<string>(`ggb-element-${Math.random().toString(36).substr(2, 9)}`);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const initApplet = () => {
      if (!window.GGBApplet) return;

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
        useBrowserForJS: false,
        
        // Initial equation
        ggbBase64: ''
      };

      // Warte kurz und injiziere dann
      setTimeout(() => {
        try {
          const applet = new window.GGBApplet(params, true);
          applet.inject(elementIdRef.current);

          // Setze die Gleichung nach dem Laden
          setTimeout(() => {
            if (applet.evalCommand) {
              applet.evalCommand(`y = ${m}*x + ${t}`);
            }
          }, 800);
        } catch (e) {
          console.error('GeoGebra Applet Injection Error:', e);
        }
      }, 100);
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
      ref={containerRef}
      className="geogebra-container"
      style={{ 
        width: typeof width === 'number' ? `${width}px` : width, 
        height: typeof height === 'number' ? `${height}px` : height,
        margin: '0 auto',
        position: 'relative'
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

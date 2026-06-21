import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    GGBApplet: any;
  }
}

interface GeoGebraRightTriangleProps {
  pointA: string;
  pointB: string;
  pointC: string;
  sideA: string;
  sideB: string;
  sideC: string;
  markedAngle: 'alpha' | 'beta';
  width?: number;
  height?: number;
}

const GeoGebraRightTriangle: React.FC<GeoGebraRightTriangleProps> = ({
  pointA,
  pointB,
  pointC,
  sideA,
  sideB,
  sideC,
  markedAngle,
  width = 600,
  height = 500,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const appletRef = useRef<any>(null);
  const elementIdRef = useRef<string>(`ggb-triangle-${Math.random().toString(36).substr(2, 9)}`);
  const [scriptLoaded, setScriptLoaded] = React.useState<boolean>(!!window.GGBApplet);
  const [error, setError] = React.useState<boolean>(false);

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
        showResetIcon: false,
        showFullscreenButton: false,
        enableShiftDragZoom: false,
        showAxes: false,
        showGrid: false,
        useBrowserForJS: true,
        appletOnLoad: (api: any) => {
          appletRef.current = api;
          setupTriangle(api);
        },
      };

      try {
        const applet = new window.GGBApplet(params, true);
        applet.inject(elementId);
      } catch (e) {
        console.error('GeoGebra Error:', e);
        setError(true);
      }
    };

    const setupTriangle = (api: any) => {
      try {
        // Definiere die Punkte des rechtwinkligen Dreiecks
        // pointB hat den rechten Winkel (90°)
        api.evalCommand(`${pointA} = (1, 1)`);
        api.evalCommand(`${pointB} = (5, 1)`);
        api.evalCommand(`${pointC} = (5, 4)`);

        // Zeichne die Dreiecksseiten
        api.evalCommand(`seg_${pointA}${pointB} = Segment(${pointA}, ${pointB})`);
        api.evalCommand(`seg_${pointB}${pointC} = Segment(${pointB}, ${pointC})`);
        api.evalCommand(`seg_${pointC}${pointA} = Segment(${pointC}, ${pointA})`);

        // Formatiere Segment-Linien (schwarz, Dicke 2)
        api.setLineStyle(`seg_${pointA}${pointB}`, 2);
        api.setLineStyle(`seg_${pointB}${pointC}`, 2);
        api.setLineStyle(`seg_${pointC}${pointA}`, 2);
        api.setColor(`seg_${pointA}${pointB}`, 0, 0, 0);
        api.setColor(`seg_${pointB}${pointC}`, 0, 0, 0);
        api.setColor(`seg_${pointC}${pointA}`, 0, 0, 0);

        // Punkte formatieren
        api.setLabelVisible(pointA, true);
        api.setLabelVisible(pointB, true);
        api.setLabelVisible(pointC, true);
        api.setPointSize(pointA, 8);
        api.setPointSize(pointB, 8);
        api.setPointSize(pointC, 8);
        api.setColor(pointA, 0, 0, 0);
        api.setColor(pointB, 0, 0, 0);
        api.setColor(pointC, 0, 0, 0);

        // Beschrifte die Seiten mit Labels
        // Setze Labels auf den Segmenten
        api.setCaption(`seg_${pointA}${pointB}`, sideB);
        api.setCaption(`seg_${pointB}${pointC}`, sideA);
        api.setCaption(`seg_${pointC}${pointA}`, sideC);

        // Label-Positionen visibel machen
        api.setLabelVisible(`seg_${pointA}${pointB}`, true);
        api.setLabelVisible(`seg_${pointB}${pointC}`, true);
        api.setLabelVisible(`seg_${pointC}${pointA}`, true);

        // Rechter Winkel Marker bei pointB (als kleine Polygon)
        api.evalCommand(`rightAngle_marker = Polygon(${pointB}, (${pointB}.x - 0.25, ${pointB}.y), (${pointB}.x - 0.25, ${pointB}.y + 0.25), (${pointB}.x, ${pointB}.y + 0.25))`);
        api.setFilling('rightAngle_marker', 0);
        api.setLineThickness('rightAngle_marker', 1);
        api.setColor('rightAngle_marker', 0, 0, 0);

        // Winkel zeichnen und markieren
        if (markedAngle === 'alpha') {
          // Winkel α bei pointA
          api.evalCommand(`angle_alpha = Angle(${pointB}, ${pointA}, ${pointC})`);
          api.setCaption('angle_alpha', 'α');
          api.setLabelVisible('angle_alpha', true);
          api.setColor('angle_alpha', 6, 182, 201);
          api.setLineStyle('angle_alpha', 2);
          api.setLineThickness('angle_alpha', 2);
        } else {
          // Winkel β bei pointC
          api.evalCommand(`angle_beta = Angle(${pointA}, ${pointC}, ${pointB})`);
          api.setCaption('angle_beta', 'β');
          api.setLabelVisible('angle_beta', true);
          api.setColor('angle_beta', 6, 182, 201);
          api.setLineStyle('angle_beta', 2);
          api.setLineThickness('angle_beta', 2);
        }

        // Zoom Einstellungen - Ausschnitt passend zum Dreieck
        api.setCoordSystem(0, 6, 0, 5);

      } catch (e) {
        console.error('Error setting up triangle:', e);
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
        console.error('Failed to load GeoGebra script');
        setError(true);
      };
      document.body.appendChild(s);
    } else {
      setScriptLoaded(true);
      setTimeout(() => initApplet(), 150);
    }

    return () => {
      // Cleanup ist optional da GeoGebra intern managed wird
    };
  }, [pointA, pointB, pointC, sideA, sideB, sideC, markedAngle, width, height]);

  if (error) {
    return (
      <div className="text-center p-4 bg-red-100 text-red-700 rounded">
        Fehler beim Laden von GeoGebra. Bitte aktualisieren Sie die Seite.
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      id={elementIdRef.current}
      style={{ 
        width: `${width}px`, 
        height: `${height}px`, 
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    />
  );
};

export default GeoGebraRightTriangle;

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
  sideA: string;      // Seite gegenüber von A (zwischen B und C)
  sideB: string;      // Seite gegenüber von B (zwischen A und C)
  sideC: string;      // Seite gegenüber von C (zwischen A und B)
  markedAngle: 'alpha' | 'beta';
  width?: number;
  height?: number;
  rightAngleAtPoint: string;  // Punkt wo der 90° Winkel ist
  markedAngleAtPoint?: string; // Punkt wo der markierte Winkel ist
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
  rightAngleAtPoint,
  markedAngleAtPoint = pointA,
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
        // Bestimme die Positionen basierend auf rightAngleAtPoint
        let pos: Record<string, [number, number]> = {};

        if (rightAngleAtPoint === pointA) {
          // Rechter Winkel bei A (links unten)
          pos[pointA] = [1, 1];
          pos[pointB] = [5, 1];
          pos[pointC] = [1, 4];
        } else if (rightAngleAtPoint === pointB) {
          // Rechter Winkel bei B (rechts unten) - Standard
          pos[pointA] = [1, 1];
          pos[pointB] = [5, 1];
          pos[pointC] = [5, 4];
        } else {
          // Rechter Winkel bei C (rechts oben)
          pos[pointA] = [1, 1];
          pos[pointB] = [1, 4];
          pos[pointC] = [5, 4];
        }

        // Erstelle die Punkte
        api.evalCommand(`${pointA} = (${pos[pointA][0]}, ${pos[pointA][1]})`);
        api.evalCommand(`${pointB} = (${pos[pointB][0]}, ${pos[pointB][1]})`);
        api.evalCommand(`${pointC} = (${pos[pointC][0]}, ${pos[pointC][1]})`);

        // Zeichne die Dreiecksseiten mit korrekten Benennungen (a, b, c - NICHT seg_a!)
        // Seite a: gegenüber von Punkt A (also zwischen B und C)
        api.evalCommand(`a = Segment(${pointB}, ${pointC})`);
        // Seite b: gegenüber von Punkt B (also zwischen A und C)
        api.evalCommand(`b = Segment(${pointA}, ${pointC})`);
        // Seite c: gegenüber von Punkt C (also zwischen A und B)
        api.evalCommand(`c = Segment(${pointA}, ${pointB})`);

        // Formatiere Segment-Linien
        ['a', 'b', 'c'].forEach((seg: string) => {
          api.setLineStyle(seg, 2);
          api.setColor(seg, 0, 0, 0);
        });

        // Punkte formatieren - SEHR KLEIN
        [pointA, pointB, pointC].forEach((pt: string) => {
          api.setLabelVisible(pt, true);
          api.setPointSize(pt, 3);
          api.setColor(pt, 0, 0, 0);
        });

        // Beschrifte die Seiten mit benutzerdefinierten Namen
        api.setCaption('a', sideA);   // Seite a gegenüber von A
        api.setLabelVisible('a', true);
        
        api.setCaption('b', sideB);   // Seite b gegenüber von B
        api.setLabelVisible('b', true);
        
        api.setCaption('c', sideC);   // Seite c gegenüber von C
        api.setLabelVisible('c', true);

        // Rechter Winkel Marker - Zeichne kleines Quadrat mit vier Segmenten
        const otherPoints = [pointA, pointB, pointC].filter(p => p !== rightAngleAtPoint);
        if (otherPoints.length === 2) {
          const rightPt = rightAngleAtPoint;
          // Erstelle Hilfspunkte für das Quadrat
          const sqSize = 0.3;
          // Die Katheten ermitteln (welche Seiten die rechten Winkel bilden)
          const catheti = otherPoints;
          
          try {
            // Zeichne vier kleine Segmente um ein Quadrat zu bilden
            // Dieses erzeugt einen visuellen rechten Winkel Marker
            api.evalCommand(`raHelper1 = (${rightPt}.x + ${sqSize}, ${rightPt}.y)`);
            api.evalCommand(`raHelper2 = (${rightPt}.x + ${sqSize}, ${rightPt}.y + ${sqSize})`);
            api.evalCommand(`raHelper3 = (${rightPt}.x, ${rightPt}.y + ${sqSize})`);
            
            // Zeichne die Quadrat-Segmente
            api.evalCommand(`raSeg1 = Segment(${rightPt}, raHelper1)`);
            api.evalCommand(`raSeg2 = Segment(raHelper1, raHelper2)`);
            api.evalCommand(`raSeg3 = Segment(raHelper2, raHelper3)`);
            
            // Formatiere die Quadrat-Segmente
            ['raSeg1', 'raSeg2', 'raSeg3'].forEach((seg: string) => {
              api.setLineThickness(seg, 1);
              api.setColor(seg, 0, 0, 0);
              api.setLabelVisible(seg, false);
            });
            
            // Verstecke die Hilfspunkte
            ['raHelper1', 'raHelper2', 'raHelper3'].forEach((pt: string) => {
              api.setVisible(pt, false);
            });
          } catch (e) {
            console.error('Error creating right angle marker:', e);
          }
        }

        // Markierter Winkel - INNENWINKEL des Dreiecks (NUR BESCHRIFTUNG, KEIN WINKELWERT)
        const otherPointsForAngle = [pointA, pointB, pointC].filter(p => p !== markedAngleAtPoint);
        if (otherPointsForAngle.length === 2) {
          // Angle(P1, Vertex, P2) misst den Winkel am Vertex zwischen den zwei Strahlen
          api.evalCommand(`angle_marked = Angle(${otherPointsForAngle[0]}, ${markedAngleAtPoint}, ${otherPointsForAngle[1]})`);
          // Verstecke den automatischen Winkelwert, zeige nur die Beschriftung
          try {
            api.setLabelMode('angle_marked', 4);  // Mode 4 = Name only (versteckt Winkelwert)
          } catch (e) {
            // Fallback wenn setLabelMode nicht unterstützt wird
          }
          api.setCaption('angle_marked', markedAngle === 'alpha' ? 'α' : 'β');
          api.setLabelVisible('angle_marked', true);
          api.setColor('angle_marked', 6, 182, 201);
          api.setLineStyle('angle_marked', 2);
          api.setLineThickness('angle_marked', 2);
        }

        // Zoom Einstellungen
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
  }, [pointA, pointB, pointC, sideA, sideB, sideC, markedAngle, width, height, rightAngleAtPoint, markedAngleAtPoint]);

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

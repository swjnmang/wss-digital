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
  // Trigger Vercel rebuild

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
        showXAxis: false,
        showYAxis: false,
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
        // Einfache Katheten-Längen (mit Pythagoras wird die Hypotenuse automatisch berechnet)
        const cathetus1 = 3;  // Eine Kathete
        const cathetus2 = 2;  // Andere Kathete
        
        // Bestimme die Positionen basierend auf rightAngleAtPoint
        // Der rechte Winkel ist immer bei dem Punkt, von dem die beiden Katheten ausgehen
        let pos: Record<string, [number, number]> = {};

        if (rightAngleAtPoint === pointA) {
          // Rechter Winkel bei A - horizontale und vertikale Katheten
          pos[pointA] = [1, 1];
          pos[pointB] = [1 + cathetus1, 1];      // Horizontal von A
          pos[pointC] = [1, 1 + cathetus2];      // Vertikal von A
        } else if (rightAngleAtPoint === pointB) {
          // Rechter Winkel bei B
          pos[pointB] = [3, 1];
          pos[pointA] = [3 - cathetus1, 1];      // Horizontal von B
          pos[pointC] = [3, 1 + cathetus2];      // Vertikal von B
        } else {
          // Rechter Winkel bei C
          pos[pointC] = [3, 3];
          pos[pointA] = [3 - cathetus1, 3];      // Horizontal von C
          pos[pointB] = [3, 3 - cathetus2];      // Vertikal von C
        }

        // Erstelle die Punkte
        api.evalCommand(`${pointA} = (${pos[pointA][0]}, ${pos[pointA][1]})`);
        api.evalCommand(`${pointB} = (${pos[pointB][0]}, ${pos[pointB][1]})`);
        api.evalCommand(`${pointC} = (${pos[pointC][0]}, ${pos[pointC][1]})`);

        // Punkte formatieren - SEHR KLEIN
        [pointA, pointB, pointC].forEach((pt: string) => {
          api.setPointSize(pt, 3);
          api.setColor(pt, 0, 0, 0);
        });

        // Definiere die Seiten basierend auf den Punkt-Positionen
        // Seite a: zwischen B und C
        api.evalCommand(`a = Segment(${pointB}, ${pointC})`);
        // Seite b: zwischen A und C
        api.evalCommand(`b = Segment(${pointA}, ${pointC})`);
        // Seite c: zwischen A und B
        api.evalCommand(`c = Segment(${pointA}, ${pointB})`);

        // Formatiere Segment-Linien
        ['a', 'b', 'c'].forEach((seg: string) => {
          api.setLineStyle(seg, 2);
          api.setColor(seg, 0, 0, 0);
          api.setLineThickness(seg, 2);
        });

        // Beschrifte die Seiten mit benutzerdefinierten Namen
        // Nutze setCaption für dynamische Namen
        api.setCaption('a', sideA);
        api.setLabelVisible('a', true);
        
        api.setCaption('b', sideB);
        api.setLabelVisible('b', true);
        
        api.setCaption('c', sideC);
        api.setLabelVisible('c', true);

        // WINKEL DEFINIEREN UND BESCHRIFTEN
        const angleLetters = ['α', 'β', 'γ'];
        const allPoints = [pointA, pointB, pointC];
        let rightAngleIndex = 0;

        // Bestimme welcher Winkel der rechte Winkel ist
        if (rightAngleAtPoint === pointB) rightAngleIndex = 1;
        if (rightAngleAtPoint === pointC) rightAngleIndex = 2;

        // Erstelle alle drei Winkel
        allPoints.forEach((vertex: string, idx: number) => {
          try {
            const otherPts = allPoints.filter(p => p !== vertex);
            if (otherPts.length === 2) {
              api.evalCommand(`angle_${idx} = Angle(${otherPts[0]}, ${vertex}, ${otherPts[1]})`);
              
              // Bei dem rechten Winkel: Keine Beschriftung anzeigen
              if (idx === rightAngleIndex) {
                api.setLabelVisible(`angle_${idx}`, false);
              } else {
                // Bei den anderen Winkeln: Beschriftung (α, β, γ) anzeigen
                api.setCaption(`angle_${idx}`, angleLetters[idx]);
                api.setLabelVisible(`angle_${idx}`, true);
                api.setColor(`angle_${idx}`, 6, 182, 201);
                api.setLineThickness(`angle_${idx}`, 2);
              }
            }
          } catch (e) {
            console.warn(`Fehler bei Winkel ${idx}:`, e);
          }
        });

        // Zoom Einstellungen
        api.setCoordSystem(0, 6, 0, 5);
        
        // Stelle sicher, dass Grid und Axes ausgeblendet sind
        try {
          api.setGridVisible(false);
          api.setAxisVisible(1, false);
          api.setAxisVisible(2, false);
        } catch (e) {
          // Fallback wenn diese Methoden nicht existieren
        }

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

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
        // P ist links unten, Q ist rechts unten, R ist oben rechts (90° Winkel)
        api.evalCommand(`${pointA} = (1, 1)`);
        api.evalCommand(`${pointB} = (5, 1)`);
        api.evalCommand(`${pointC} = (5, 4)`);

        // Zeichne die Dreiecksseiten
        api.evalCommand(`segment = Segment(${pointA}, ${pointB})`);
        api.evalCommand(`segment2 = Segment(${pointB}, ${pointC})`);
        api.evalCommand(`segment3 = Segment(${pointC}, ${pointA})`);

        // Formatiere die Segment-Linien
        api.setLineStyle('segment', 2);
        api.setLineStyle('segment2', 2);
        api.setLineStyle('segment3', 2);
        api.setColor('segment', 0, 0, 0);
        api.setColor('segment2', 0, 0, 0);
        api.setColor('segment3', 0, 0, 0);

        // Beschrifte die Punkte
        api.setLabelVisible(pointA, true);
        api.setLabelVisible(pointB, true);
        api.setLabelVisible(pointC, true);
        api.setPointSize(pointA, 8);
        api.setPointSize(pointB, 8);
        api.setPointSize(pointC, 8);
        api.setPointStyle(pointA, 0);
        api.setPointStyle(pointB, 0);
        api.setPointStyle(pointC, 0);
        api.setColor(pointA, 32, 32, 32);
        api.setColor(pointB, 32, 32, 32);
        api.setColor(pointC, 32, 32, 32);

        // Rechter Winkel Marker (bei ${pointB})
        const squareSize = 0.3;
        api.evalCommand(`rightAngleMarker = Polygon((${pointB.replace(/\s/g, '')}.x - ${squareSize}, ${pointB.replace(/\s/g, '')}.y), (${pointB.replace(/\s/g, '')}.x - ${squareSize}, ${pointB.replace(/\s/g, '')}.y + ${squareSize}), (${pointB.replace(/\s/g, '')}.x, ${pointB.replace(/\s/g, '')}.y + ${squareSize}), (${pointB.replace(/\s/g, '')}.x, ${pointB.replace(/\s/g, '')}.y))`);
        api.setFilling('rightAngleMarker', 0);
        api.setLineStyle('rightAngleMarker', 1);
        api.setColor('rightAngleMarker', 32, 32, 32);

        // Beschrifte die Seiten mit dynamischen Labels
        // Seite a (unten): ${sideB}
        const midAB = `midAB = Midpoint(${pointA}, ${pointB})`;
        api.evalCommand(midAB);
        api.evalCommand(`sideLabel1 = "${sideB}"`);
        api.evalCommand(`textSideB = Text(sideLabel1, midAB + (0, -0.5))`);
        api.setColor('textSideB', 234, 88, 12); // Orange
        api.setFontSize('textSideB', 18);

        // Seite b (rechts): ${sideA}
        const midBC = `midBC = Midpoint(${pointB}, ${pointC})`;
        api.evalCommand(midBC);
        api.evalCommand(`sideLabel2 = "${sideA}"`);
        api.evalCommand(`textSideA = Text(sideLabel2, midBC + (0.4, 0))`);
        api.setColor('textSideA', 234, 88, 12); // Orange
        api.setFontSize('textSideA', 18);

        // Seite c (Hypotenuse): ${sideC}
        const midCA = `midCA = Midpoint(${pointC}, ${pointA})`;
        api.evalCommand(midCA);
        api.evalCommand(`sideLabel3 = "${sideC}"`);
        api.evalCommand(`textSideC = Text(sideLabel3, midCA + (-0.5, 0.3))`);
        api.setColor('textSideC', 234, 88, 12); // Orange
        api.setFontSize('textSideC', 18);

        // Zeichne und beschrifte den hervorgehobenen Winkel
        if (markedAngle === 'alpha') {
          // Winkel α bei ${pointA}
          api.evalCommand(`angle_alpha = Angle(${pointB}, ${pointA}, ${pointC})`);
          api.evalCommand(`angleArc_alpha = Arc(${pointA}, 1, 0°, angle_alpha)`);
          api.setColor('angleArc_alpha', 6, 182, 201); // Cyan
          api.setLineStyle('angleArc_alpha', 2);
          api.setLineThickness('angleArc_alpha', 2);

          // Label für α
          api.evalCommand(`alphaLabel = "${markedAngle === 'alpha' ? 'α' : 'β'}"`);
          api.evalCommand(`textAlpha = Text(alphaLabel, ${pointA} + (0.6, 0.4))`);
          api.setColor('textAlpha', 6, 182, 201);
          api.setFontSize('textAlpha', 16);
          api.setFontStyle('textAlpha', true);
        } else {
          // Winkel β bei ${pointC}
          api.evalCommand(`angle_beta = Angle(${pointA}, ${pointC}, ${pointB})`);
          api.evalCommand(`angleArc_beta = Arc(${pointC}, 1, angle_beta, 90°)`);
          api.setColor('angleArc_beta', 6, 182, 201); // Cyan
          api.setLineStyle('angleArc_beta', 2);
          api.setLineThickness('angleArc_beta', 2);

          // Label für β
          api.evalCommand(`betaLabel = "${markedAngle === 'beta' ? 'β' : 'α'}"`);
          api.evalCommand(`textBeta = Text(betaLabel, ${pointC} + (-0.6, -0.4))`);
          api.setColor('textBeta', 6, 182, 201);
          api.setFontSize('textBeta', 16);
          api.setFontStyle('textBeta', true);
        }

        // Zoom Einstellungen
        api.setCoordSystem(-0.5, 6.5, -0.5, 5.5);

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
      style={{ width, height, borderRadius: '8px', overflow: 'hidden' }}
    />
  );
};

export default GeoGebraRightTriangle;

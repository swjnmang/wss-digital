import React, { useEffect, useRef, useState } from 'react';

// Zeichnet ein Dreieck als eingebettetes GeoGebra-Applet. GeoGebra übernimmt die
// Label-Platzierung selbst und liefert damit sauberere Skizzen als handgebaute
// SVGs. Schüler:innen können per Mausrad/Pinch und Zoom-Buttons rein- und
// rauszoomen; die Konstruktion selbst ist fixiert.
//
// Benötigt Internetzugang (deployggb.js von geogebra.org). Lädt das Script
// nicht, wird der übergebene fallback (z.B. die alte SVG-Skizze) gerendert.
//
// Verwendung und Details: siehe mathe-trainer/docs/geogebra-skizzen.md

declare global {
    interface Window {
        GGBApplet?: new (params: Record<string, unknown>, html5NoWebSimple?: boolean) => { inject: (id: string) => void };
    }
}

export interface GgbPoint {
    x: number;
    y: number;
    // Angezeigter Punktname (z.B. "A"). Ohne label bleibt der Punkt unbeschriftet.
    label?: string;
}

export interface GgbSide {
    label?: string;
    highlighted?: boolean;
}

export interface GgbAngle {
    // Ohne label wird nur der Winkelbogen gezeichnet.
    label?: string;
    highlighted?: boolean;
    // show: false unterdrückt den Winkel komplett (Standard: true).
    show?: boolean;
    // Rechter Winkel: wird als grauer Viertelkreis-Sektor mit Punkt in der
    // Mitte dargestellt statt als Bogen mit Label.
    rightAngle?: boolean;
}

export interface GeoGebraTriangleSketchProps {
    points: [GgbPoint, GgbPoint, GgbPoint];
    // Seiten in der Reihenfolge [P0P1, P1P2, P2P0].
    sides: [GgbSide, GgbSide, GgbSide];
    // Winkel an den Ecken [P0, P1, P2].
    angles: [GgbAngle, GgbAngle, GgbAngle];
    // Freier roter Hinweistext (z.B. "Fläche = ?"), platziert am Inkreismittelpunkt.
    askedLabel?: string;
    fallback: React.ReactNode;
}

let ggbScriptPromise: Promise<void> | null = null;
const loadGeoGebraScript = (): Promise<void> => {
    if (typeof window !== 'undefined' && window.GGBApplet) return Promise.resolve();
    if (!ggbScriptPromise) {
        ggbScriptPromise = new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://www.geogebra.org/apps/deployggb.js';
            script.async = true;
            script.onload = () => resolve();
            script.onerror = () => {
                ggbScriptPromise = null;
                reject(new Error('GeoGebra-Script konnte nicht geladen werden'));
            };
            document.head.appendChild(script);
        });
    }
    return ggbScriptPromise;
};

let ggbInstanceCounter = 0;

const GIVEN_RGB: [number, number, number] = [31, 41, 55];
const HIGHLIGHT_RGB: [number, number, number] = [220, 38, 38];
const POINT_RGB: [number, number, number] = [15, 23, 42];

const fmt = (value: number) => Number(value.toFixed(4)).toString();

interface GgbApi {
    evalCommand: (cmd: string) => boolean;
    evalCommandGetLabels: (cmd: string) => string;
    setColor: (obj: string, r: number, g: number, b: number) => void;
    setLineThickness: (obj: string, thickness: number) => void;
    setFixed: (obj: string, fixed: boolean, selectable?: boolean) => void;
    // Für Arc-/Sector-Objekte (Kreisausschnitte) funktionieren die evalCommand-
    // Textbefehle SetColor/ShowLabel/SetFixed/SetLineThickness/SetFilling NICHT
    // (evalCommand liefert false, ohne Fehlermeldung) - dort müssen stattdessen
    // diese direkten API-Methoden verwendet werden. Bei Punkten/Segmenten/Texten
    // funktionieren beide Wege.
    setVisible: (obj: string, visible: boolean) => void;
    setLabelVisible: (obj: string, visible: boolean) => void;
    setFilling: (obj: string, opacity: number) => void;
    setPointSize: (obj: string, size: number) => void;
    setCoordSystem: (xmin: number, xmax: number, ymin: number, ymax: number) => void;
    setAxesVisible: (x: boolean, y: boolean) => void;
    setGridVisible: (visible: boolean) => void;
    remove: () => void;
}

const drawTriangle = (api: GgbApi, props: GeoGebraTriangleSketchProps, width: number, height: number) => {
    const { points, sides, angles, askedLabel } = props;

    api.setAxesVisible(false, false);
    api.setGridVisible(false);

    // Interne Objektnamen V0..V2, damit Punktnamen wie "E" nicht mit
    // GeoGebra-Konstanten oder untereinander kollidieren können.
    points.forEach((p, i) => {
        api.evalCommand(`V${i}=(${fmt(p.x)},${fmt(p.y)})`);
    });

    // Polygon liefert seine Kanten in der Reihenfolge V0V1, V1V2, V2V0.
    let edges: [string, string, string];
    const returned = (api.evalCommandGetLabels('tri=Polygon(V0,V1,V2)') ?? '')
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
    if (returned.length >= 4) {
        edges = [returned[1], returned[2], returned[3]];
    } else {
        edges = ['seg01', 'seg12', 'seg20'];
        api.evalCommand('seg01=Segment(V0,V1)');
        api.evalCommand('seg12=Segment(V1,V2)');
        api.evalCommand('seg20=Segment(V2,V0)');
    }
    api.evalCommand('SetColor(tri, 238, 242, 255)');
    api.setFixed('tri', true, false);

    // Sichtbereich schon jetzt berechnen (gesetzt wird er am Ende): mit Rand für
    // die außenliegenden Labels, auf das Seitenverhältnis des Applets gebracht,
    // damit das Dreieck nicht verzerrt wird. Aus dem Sichtbereich ergibt sich
    // der Maßstab (Welt-Einheiten pro Pixel) für die Winkelbogen-Radien.
    const xs = points.map(p => p.x);
    const ys = points.map(p => p.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const span = Math.max(maxX - minX, maxY - minY, 0.0001);
    const padX = (maxX - minX) * 0.3 || 1;
    const padY = (maxY - minY) * 0.3 || 1;
    let x0 = minX - padX;
    let x1 = maxX + padX;
    let y0 = minY - padY;
    let y1 = maxY + padY;
    const targetRatio = width / height;
    const w = x1 - x0;
    const h = y1 - y0;
    if (w / h < targetRatio) {
        const extra = (h * targetRatio - w) / 2;
        x0 -= extra;
        x1 += extra;
    } else {
        const extra = (w / targetRatio - h) / 2;
        y0 -= extra;
        y1 += extra;
    }
    const worldPerPixel = (x1 - x0) / width;

    // Innenwinkel abhängig von der Umlaufrichtung des Dreiecks (GeoGebra misst
    // gegen den Uhrzeigersinn).
    const cross =
        (points[1].x - points[0].x) * (points[2].y - points[0].y) -
        (points[1].y - points[0].y) * (points[2].x - points[0].x);
    const ccw = cross > 0;
    const angleArgs: [number, number, number][] = ccw
        ? [
              [1, 0, 2],
              [2, 1, 0],
              [0, 2, 1]
          ]
        : [
              [2, 0, 1],
              [0, 1, 2],
              [1, 2, 0]
          ];
    // Winkel werden manuell als Kreis + Sektor/Bogen konstruiert (statt über das
    // native Angle()-Objekt), damit Radius und Stil (Viertelkreis+Punkt beim
    // rechten Winkel, größerer Bogen + Label sonst) selbst bestimmt werden können.
    // Arc()/Sector() erwarten dabei Winkel-PARAMETER in Radiant (nicht Punkte!),
    // und Arc-/Sector-Objekte akzeptieren SetColor & Co. nur als direkte
    // API-Methoden, nicht als evalCommand-Textbefehl (siehe GgbApi-Kommentar).
    angles.forEach((angle, i) => {
        if (angle.show === false) return;
        const [fromIdx, vertexIdx, toIdx] = angleArgs[i];
        const V = points[vertexIdx];
        const From = points[fromIdx];
        const To = points[toIdx];
        const d1 = { x: From.x - V.x, y: From.y - V.y };
        const d2 = { x: To.x - V.x, y: To.y - V.y };
        const len1 = Math.sqrt(d1.x * d1.x + d1.y * d1.y) || 1;
        const len2 = Math.sqrt(d2.x * d2.x + d2.y * d2.y) || 1;
        const u1 = { x: d1.x / len1, y: d1.y / len1 };
        const u2 = { x: d2.x / len2, y: d2.y / len2 };
        // Winkelgröße 50 Pixel (statt GeoGebra-Standard 30), gekappt auf die
        // kürzere anliegende Seite, damit der Bogen nie über das Dreieck
        // hinausragt.
        const radius = Math.min(50 * worldPerPixel, Math.min(len1, len2) * 0.45);
        const bis = { x: u1.x + u2.x, y: u1.y + u2.y };
        const bisLen = Math.sqrt(bis.x * bis.x + bis.y * bis.y) || 1;
        const bisUnit = { x: bis.x / bisLen, y: bis.y / bisLen };

        let t1 = Math.atan2(u1.y, u1.x);
        let t2 = Math.atan2(u2.y, u2.x);
        if (t2 < t1) t2 += 2 * Math.PI;

        const circ = `circAng${i}`;
        api.evalCommand(`${circ}=Circle((${fmt(V.x)},${fmt(V.y)}),${fmt(radius)})`);
        api.setVisible(circ, false);
        api.setFixed(circ, true, false);

        if (angle.rightAngle) {
            const sector = `sec${i}`;
            api.evalCommand(`${sector}=Sector(${circ},${fmt(t1)},${fmt(t2)})`);
            api.setColor(sector, 156, 163, 175);
            api.setFilling(sector, 0.35);
            api.setLineThickness(sector, 1);
            api.setLabelVisible(sector, false);
            api.setFixed(sector, true, false);

            // Großgeschriebener Name: "dot0=(x,y)" würde GeoGebra als Vektor
            // interpretieren (kleingeschrieben = Vektor, großgeschrieben = Punkt)
            // und SetPointSize schlüge dann fehl.
            const dotR = radius * 0.55;
            const dot = `RADot${i}`;
            api.evalCommand(`${dot}=(${fmt(V.x + bisUnit.x * dotR)},${fmt(V.y + bisUnit.y * dotR)})`);
            api.setColor(dot, 55, 65, 81);
            api.setPointSize(dot, 3);
            api.setLabelVisible(dot, false);
            api.setFixed(dot, true, false);
            return;
        }

        const arcObj = `arc${i}`;
        api.evalCommand(`${arcObj}=Arc(${circ},${fmt(t1)},${fmt(t2)})`);
        const [r, g, b] = angle.highlighted ? HIGHLIGHT_RGB : GIVEN_RGB;
        api.setColor(arcObj, r, g, b);
        api.setLineThickness(arcObj, angle.highlighted ? 4 : 3);
        api.setLabelVisible(arcObj, false);
        api.setFixed(arcObj, true, false);

        if (angle.label) {
            // Bei spitzen Winkeln das Label weiter nach außen schieben, damit es
            // mindestens ~14px Abstand zu beiden Schenkeln hat (gedeckelt, damit
            // es bei extrem spitzen Winkeln nicht beliebig weit wandert).
            const halfAngle = Math.max((t2 - t1) / 2, 0.01);
            const minClearance = (14 * worldPerPixel) / Math.sin(halfAngle);
            const labelR = Math.min(Math.max(radius * 1.35, minClearance), radius * 3);
            const lx = V.x + bisUnit.x * labelR;
            const ly = V.y + bisUnit.y * labelR;
            const lbl = `angLbl${i}`;
            api.evalCommand(`${lbl}=Text("${angle.label}", (${fmt(lx)},${fmt(ly)}))`);
            api.setColor(lbl, r, g, b);
            api.setFixed(lbl, true, false);
        }
    });

    sides.forEach((side, i) => {
        const edge = edges[i];
        const [r, g, b] = side.highlighted ? HIGHLIGHT_RGB : GIVEN_RGB;
        api.setColor(edge, r, g, b);
        api.setLineThickness(edge, side.highlighted ? 6 : 4);
        if (side.label) {
            api.evalCommand(`SetCaption(${edge}, "${side.label}")`);
            api.evalCommand(`SetLabelMode(${edge}, 3)`);
            api.evalCommand(`ShowLabel(${edge}, true)`);
        } else {
            api.evalCommand(`ShowLabel(${edge}, false)`);
        }
        api.setFixed(edge, true, false);
    });

    // Punktnamen als eigene Textobjekte, vom Schwerpunkt weg nach außen versetzt.
    // Die automatischen Punktlabels (immer oben rechts) würden sonst mit den
    // innenliegenden Winkellabels kollidieren.
    const centroidX = (points[0].x + points[1].x + points[2].x) / 3;
    const centroidY = (points[0].y + points[1].y + points[2].y) / 3;
    const labelOffset = span * 0.09;
    points.forEach((p, i) => {
        api.setColor(`V${i}`, POINT_RGB[0], POINT_RGB[1], POINT_RGB[2]);
        api.evalCommand(`SetPointSize(V${i}, 4)`);
        api.evalCommand(`ShowLabel(V${i}, false)`);
        api.setFixed(`V${i}`, true, false);

        if (!p.label) return;
        const dx = p.x - centroidX;
        const dy = p.y - centroidY;
        const len = Math.sqrt(dx * dx + dy * dy) || 1;
        const lx = p.x + (dx / len) * labelOffset;
        const ly = p.y + (dy / len) * labelOffset;
        api.evalCommand(`ptLbl${i}=Text("${p.label}", (${fmt(lx)},${fmt(ly)}))`);
        api.setColor(`ptLbl${i}`, POINT_RGB[0], POINT_RGB[1], POINT_RGB[2]);
        api.setFixed(`ptLbl${i}`, true, false);
    });

    if (askedLabel) {
        // Inkreismittelpunkt statt Schwerpunkt: liegt auch bei stumpfen Dreiecken
        // mittig im Inneren und schneidet keine Seite.
        const dist = (a: GgbPoint, b: GgbPoint) => Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
        const l0 = dist(points[1], points[2]);
        const l1 = dist(points[2], points[0]);
        const l2 = dist(points[0], points[1]);
        const perimeter = l0 + l1 + l2 || 1;
        const inX = (l0 * points[0].x + l1 * points[1].x + l2 * points[2].x) / perimeter;
        const inY = (l0 * points[0].y + l1 * points[1].y + l2 * points[2].y) / perimeter;
        api.evalCommand(`txtAsk=Text("${askedLabel}", (${fmt(inX - span * 0.12)},${fmt(inY)}))`);
        api.setColor('txtAsk', HIGHLIGHT_RGB[0], HIGHLIGHT_RGB[1], HIGHLIGHT_RGB[2]);
        api.setFixed('txtAsk', true, false);
    }

    api.setCoordSystem(x0, x1, y0, y1);
};

const GeoGebraTriangleSketch: React.FC<GeoGebraTriangleSketchProps> = props => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [failed, setFailed] = useState(false);
    const idRef = useRef(`ggb-triangle-${++ggbInstanceCounter}`);

    useEffect(() => {
        let cancelled = false;
        let api: GgbApi | null = null;
        const container = containerRef.current;

        loadGeoGebraScript()
            .then(() => {
                if (cancelled || !container || !window.GGBApplet) return;
                const width = Math.min(Math.max(container.offsetWidth || 340, 260), 560);
                const height = Math.min(Math.max(container.offsetHeight || 300, 240), 420);
                const applet = new window.GGBApplet(
                    {
                        appName: 'classic',
                        // Nur die Grafik-Ansicht, ohne Algebra-Seitenpanel.
                        perspective: 'G',
                        fontSize: 16,
                        width,
                        height,
                        showToolBar: false,
                        showAlgebraInput: false,
                        showMenuBar: false,
                        showResetIcon: true,
                        // Schüler:innen dürfen zoomen und die Ansicht verschieben.
                        showZoomButtons: true,
                        enableShiftDragZoom: true,
                        showFullscreenButton: false,
                        enableRightClick: false,
                        enableLabelDrags: false,
                        preventFocus: true,
                        borderColor: '#f8fafc',
                        appletOnLoad: (ggbApi: GgbApi) => {
                            if (cancelled) {
                                try {
                                    ggbApi.remove();
                                } catch {
                                    /* Applet war bereits entfernt */
                                }
                                return;
                            }
                            api = ggbApi;
                            try {
                                drawTriangle(ggbApi, props, width, height);
                            } catch {
                                setFailed(true);
                            }
                        }
                    },
                    true
                );
                applet.inject(idRef.current);
            })
            .catch(() => {
                if (!cancelled) setFailed(true);
            });

        return () => {
            cancelled = true;
            try {
                api?.remove();
            } catch {
                /* Applet war bereits entfernt */
            }
            if (container) container.innerHTML = '';
        };
        // Bewusst nur beim Mount: neue Aufgabenwerte kommen über einen key-Wechsel
        // (Remount) herein, nicht über Prop-Updates.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (failed) return <>{props.fallback}</>;
    return <div ref={containerRef} id={idRef.current} className="w-full h-full flex items-center justify-center" />;
};

export default GeoGebraTriangleSketch;

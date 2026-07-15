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
    // Ohne label wird nur der Winkelbogen gezeichnet (bei 90° zeigt GeoGebra
    // automatisch das Quadrat-Symbol für den rechten Winkel).
    label?: string;
    highlighted?: boolean;
    // show: false unterdrückt den Winkel komplett (Standard: true).
    show?: boolean;
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
    angles.forEach((angle, i) => {
        if (angle.show === false) return;
        const [from, vertex, to] = angleArgs[i];
        api.evalCommand(`ang${i}=Angle(V${from},V${vertex},V${to})`);
        const [r, g, b] = angle.highlighted ? HIGHLIGHT_RGB : GIVEN_RGB;
        api.setColor(`ang${i}`, r, g, b);
        if (angle.label) {
            api.evalCommand(`SetCaption(ang${i}, "${angle.label}")`);
            api.evalCommand(`SetLabelMode(ang${i}, 3)`);
            api.evalCommand(`ShowLabel(ang${i}, true)`);
        } else {
            api.evalCommand(`ShowLabel(ang${i}, false)`);
        }
        api.setFixed(`ang${i}`, true, false);
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
    const xs = points.map(p => p.x);
    const ys = points.map(p => p.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const span = Math.max(maxX - minX, maxY - minY, 0.0001);
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

    // Sichtbereich mit Rand für die außenliegenden Labels; auf das Seitenverhältnis
    // des Applets gebracht, damit das Dreieck nicht verzerrt wird.
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

import React, { useEffect, useRef, useState } from 'react';

// Zeichnet ein allgemeines Dreieck als eingebettetes GeoGebra-Applet (Pilot für die
// gemischten Übungsaufgaben). GeoGebra übernimmt die Label-Platzierung selbst und
// liefert damit sauberere Skizzen als die handgebaute SVG-Variante. Benötigt
// Internetzugang (deployggb.js von geogebra.org); wenn das Script nicht lädt,
// wird der übergebene fallback (SVG-Skizze) gerendert.

declare global {
    interface Window {
        GGBApplet?: new (params: Record<string, unknown>, html5NoWebSimple?: boolean) => { inject: (id: string) => void };
    }
}

type TriangleKey = 'a' | 'b' | 'c' | 'alpha' | 'beta' | 'gamma';

export interface GeoGebraTriangleSketchProps {
    // Geometrie: Punkt0 im Ursprung, Punkt1 bei (c, 0), Punkt2 über Winkel alpha und Seite b.
    b: number;
    c: number;
    alphaDeg: number;
    points: [string, string, string];
    labels: Record<TriangleKey, string>;
    highlightKey: TriangleKey | 'none';
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
    const { b, c, alphaDeg, points, labels, highlightKey, askedLabel } = props;
    const [p0, p1, p2] = points;
    const rad = (alphaDeg * Math.PI) / 180;
    const bx = b * Math.cos(rad);
    const by = b * Math.sin(rad);

    api.setAxesVisible(false, false);
    api.setGridVisible(false);

    api.evalCommand(`${p0}=(0,0)`);
    api.evalCommand(`${p1}=(${fmt(c)},0)`);
    api.evalCommand(`${p2}=(${fmt(bx)},${fmt(by)})`);

    // Polygon liefert seine Kanten in der Reihenfolge P0P1 (Seite c), P1P2 (Seite a), P2P0 (Seite b).
    let edgeC: string, edgeA: string, edgeB: string;
    const returned = (api.evalCommandGetLabels(`tri=Polygon(${p0},${p1},${p2})`) ?? '')
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
    if (returned.length >= 4) {
        [, edgeC, edgeA, edgeB] = returned;
    } else {
        edgeC = 'segC';
        edgeA = 'segA';
        edgeB = 'segB';
        api.evalCommand(`segC=Segment(${p0},${p1})`);
        api.evalCommand(`segA=Segment(${p1},${p2})`);
        api.evalCommand(`segB=Segment(${p2},${p0})`);
    }
    api.evalCommand('SetColor(tri, 238, 242, 255)');

    api.evalCommand(`angA=Angle(${p1},${p0},${p2})`);
    api.evalCommand(`angB=Angle(${p2},${p1},${p0})`);
    api.evalCommand(`angC=Angle(${p0},${p2},${p1})`);

    const styleObject = (obj: string, key: TriangleKey, caption: string) => {
        const highlighted = highlightKey === key;
        api.evalCommand(`SetCaption(${obj}, "${highlighted ? `${caption} = ?` : caption}")`);
        api.evalCommand(`SetLabelMode(${obj}, 3)`);
        api.evalCommand(`ShowLabel(${obj}, true)`);
        const [r, g, bl] = highlighted ? HIGHLIGHT_RGB : GIVEN_RGB;
        api.setColor(obj, r, g, bl);
        api.setLineThickness(obj, highlighted ? 6 : 4);
        api.setFixed(obj, true, false);
    };

    styleObject(edgeA, 'a', labels.a);
    styleObject(edgeB, 'b', labels.b);
    styleObject(edgeC, 'c', labels.c);
    styleObject('angA', 'alpha', labels.alpha);
    styleObject('angB', 'beta', labels.beta);
    styleObject('angC', 'gamma', labels.gamma);

    // Punktnamen als eigene Textobjekte, vom Schwerpunkt weg nach außen versetzt.
    // Die automatischen Punktlabels (immer oben rechts) würden sonst mit den
    // innenliegenden Winkellabels kollidieren.
    const coords: [number, number][] = [
        [0, 0],
        [c, 0],
        [bx, by]
    ];
    const centroidX = (0 + c + bx) / 3;
    const centroidY = by / 3;
    const span = Math.max(Math.max(0, c, bx) - Math.min(0, c, bx), by, 0.0001);
    const labelOffset = span * 0.09;
    [p0, p1, p2].forEach((p, i) => {
        api.setColor(p, 15, 23, 42);
        api.evalCommand(`SetPointSize(${p}, 4)`);
        api.evalCommand(`ShowLabel(${p}, false)`);
        api.setFixed(p, true, false);

        const [px, py] = coords[i];
        const dx = px - centroidX;
        const dy = py - centroidY;
        const len = Math.sqrt(dx * dx + dy * dy) || 1;
        const lx = px + (dx / len) * labelOffset;
        const ly = py + (dy / len) * labelOffset;
        api.evalCommand(`ptLbl${i}=Text("${p}", (${fmt(lx)},${fmt(ly)}))`);
        api.setColor(`ptLbl${i}`, 15, 23, 42);
        api.setFixed(`ptLbl${i}`, true, false);
    });
    api.setFixed('tri', true, false);

    if (askedLabel) {
        // Inkreismittelpunkt statt Schwerpunkt: liegt auch bei stumpfen Dreiecken
        // mittig im Inneren und schneidet keine Seite.
        const sideA = Math.sqrt((c - bx) * (c - bx) + by * by);
        const perimeter = sideA + b + c;
        const inX = (sideA * 0 + b * c + c * bx) / perimeter;
        const inY = (c * by) / perimeter;
        const spanForText = Math.max(Math.max(0, c, bx) - Math.min(0, c, bx), by, 0.0001);
        api.evalCommand(`txtAsk=Text("${askedLabel}", (${fmt(inX - spanForText * 0.12)},${fmt(inY)}))`);
        api.setColor('txtAsk', HIGHLIGHT_RGB[0], HIGHLIGHT_RGB[1], HIGHLIGHT_RGB[2]);
        api.setFixed('txtAsk', true, false);
    }

    // Sichtbereich mit Rand für die außenliegenden Labels; auf das Seitenverhältnis
    // des Applets gebracht, damit das Dreieck nicht verzerrt wird.
    const minX = Math.min(0, c, bx);
    const maxX = Math.max(0, c, bx);
    const minY = 0;
    const maxY = Math.max(by, 0.0001);
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
                        // Nur die Grafik-Ansicht, ohne Algebra-Seitenpanel der Geometry-App.
                        perspective: 'G',
                        fontSize: 16,
                        width,
                        height,
                        showToolBar: false,
                        showAlgebraInput: false,
                        showMenuBar: false,
                        showResetIcon: false,
                        showZoomButtons: false,
                        showFullscreenButton: false,
                        enableRightClick: false,
                        enableShiftDragZoom: false,
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

import React, { useEffect, useRef } from 'react';

declare global {
    interface Window {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        GGBApplet: any;
    }
}

type Props = {
    a: number;
    xs: number;
    ys: number;
    /** Scheitelpunkt als Punkt markieren */
    zeigeScheitel?: boolean;
    /** Sichtbarer Bereich: x und y jeweils von -bereich bis bereich */
    bereich?: number;
    /** Maximale Kantenlänge des (quadratischen) Applets in px */
    groesse?: number;
    /** Abstand der Achsenbeschriftung bzw. Gitterlinien (Standard: 1) */
    schrittweite?: number;
    /** Steigungsdreieck zum Ablesen von a einzeichnen (vom Scheitel 1 bzw. 2 Einheiten nach rechts) */
    zeigeFormfaktor?: boolean;
};

const SCRIPT_SRC = 'https://www.geogebra.org/apps/deployggb.js';
let zaehler = 0;

// Lädt das GeoGebra-Skript genau einmal, auch wenn mehrere Graphen gleichzeitig angezeigt werden.
const ladeGeoGebra = () =>
    new Promise<void>((resolve, reject) => {
        if (window.GGBApplet) return resolve();
        let script = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`);
        if (!script) {
            script = document.createElement('script');
            script.src = SCRIPT_SRC;
            script.async = true;
            document.body.appendChild(script);
        }
        script.addEventListener('load', () => resolve());
        script.addEventListener('error', () => reject(new Error('GeoGebra konnte nicht geladen werden')));
    });

/** Kompakter GeoGebra-Graph einer Parabel f(x) = a(x - xs)² + ys. */
const ParabelGraph = ({
    a,
    xs,
    ys,
    zeigeScheitel = false,
    bereich = 6,
    groesse = 240,
    schrittweite = 1,
    zeigeFormfaktor = false,
}: Props) => {
    const halterRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const halter = halterRef.current;
        if (!halter) return;
        let abgebrochen = false;

        // Für jede Parabel ein frisches Element mit eindeutiger ID, in das GeoGebra injiziert wird.
        const ziel = document.createElement('div');
        ziel.id = `ggb-parabel-${++zaehler}`;
        halter.replaceChildren(ziel);
        const kante = Math.min(groesse, halter.clientWidth || groesse);

        ladeGeoGebra()
            .then(() => {
                if (abgebrochen) return;
                const applet = new window.GGBApplet(
                    {
                        appName: 'classic',
                        width: kante,
                        height: kante,
                        perspective: 'G',
                        showToolBar: false,
                        showAlgebraInput: false,
                        showMenuBar: false,
                        showResetIcon: true,
                        showZoomButtons: false,
                        enableRightClick: false,
                        enableLabelDrags: false,
                        enableShiftDragZoom: true,
                        useBrowserForJS: true,
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        appletOnLoad: (api: any) => {
                            api.evalCommand(`f(x) = ${a}*(x - (${xs}))^2 + (${ys})`);
                            api.setColor('f', 37, 99, 235);
                            api.setLineThickness('f', 5);
                            api.setLabelVisible('f', false);
                            api.setFixed('f', true, false);
                            if (zeigeScheitel) {
                                api.evalCommand(`S = (${xs}, ${ys})`);
                                api.setColor('S', 220, 38, 38);
                                api.setPointSize('S', 5);
                                api.setFixed('S', true, false);
                            }
                            if (zeigeFormfaktor) {
                                // Bei |a| < 1 zwei Einheiten nach rechts, damit der Zielpunkt auf dem Gitter liegt.
                                const dx = Math.abs(a) < 1 ? 2 : 1;
                                const dy = a * dx * dx;
                                const xr = xs + dx;
                                const yz = ys + dy;
                                api.evalCommand(`hor = Segment((${xs}, ${ys}), (${xr}, ${ys}))`);
                                api.evalCommand(`ver = Segment((${xr}, ${ys}), (${xr}, ${yz}))`);
                                api.evalCommand(`P = (${xr}, ${yz})`);
                                api.evalCommand(
                                    `tx = Text("${dx}", (${xs + dx / 2 - 0.15}, ${ys + (dy > 0 ? -0.25 : 0.75)}))`
                                );
                                api.evalCommand(
                                    `ty = Text("${String(Math.abs(dy)).replace('.', ',')}", (${xr + 0.2}, ${
                                        ys + dy / 2 + 0.25
                                    }))`
                                );
                                ['hor', 'ver', 'P', 'tx', 'ty'].forEach((o) => {
                                    api.setColor(o, 234, 88, 12);
                                    api.setFixed(o, true, false);
                                    api.setLabelVisible(o, false);
                                });
                                api.setLineThickness('hor', 6);
                                api.setLineThickness('ver', 6);
                                api.setPointSize('P', 5);
                            }
                            api.setGridVisible(true);
                            api.setCoordSystem(-bereich, bereich, -bereich, bereich);
                            // Achsen in Einerschritten beschriften, damit sich jede Koordinate ablesen lässt.
                            const s = String(schrittweite);
                            api.setAxisSteps(1, s, s, s);
                            // Gitter passend zur Schrittweite (ältere GeoGebra-Versionen kennen das evtl. nicht)
                            try {
                                api.setGraphicsOptions?.(1, { gridDistance: { x: schrittweite, y: schrittweite } });
                            } catch {
                                /* Gitter bleibt automatisch */
                            }
                        },
                    },
                    true
                );
                applet.inject(ziel.id);
            })
            .catch(() => {
                ziel.textContent = 'Graph konnte nicht geladen werden.';
            });

        return () => {
            abgebrochen = true;
            halter.replaceChildren();
        };
    }, [a, xs, ys, zeigeScheitel, bereich, groesse, schrittweite, zeigeFormfaktor]);

    return (
        <div
            ref={halterRef}
            className="w-full rounded-md border border-gray-200 overflow-hidden bg-white"
            style={{ maxWidth: groesse, aspectRatio: '1 / 1' }}
        />
    );
};

export default ParabelGraph;

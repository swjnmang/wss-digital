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
const ParabelGraph = ({ a, xs, ys, zeigeScheitel = false, bereich = 6, groesse = 240 }: Props) => {
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
                            api.setGridVisible(true);
                            api.setCoordSystem(-bereich, bereich, -bereich, bereich);
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
    }, [a, xs, ys, zeigeScheitel, bereich, groesse]);

    return (
        <div
            ref={halterRef}
            className="w-full rounded-md border border-gray-200 overflow-hidden bg-white"
            style={{ maxWidth: groesse, minHeight: Math.min(groesse, 200) }}
        />
    );
};

export default ParabelGraph;

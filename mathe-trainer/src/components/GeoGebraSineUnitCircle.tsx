import React, { useEffect, useRef, useState } from 'react';

declare global {
    interface Window {
        GGBApplet: any;
    }
}

interface GeoGebraSineUnitCircleProps {
    width?: number;
    height?: number;
}

const ASPECT_RATIO = 760 / 230;

const GeoGebraSineUnitCircle: React.FC<GeoGebraSineUnitCircleProps> = ({ width = 760, height = 230 }) => {
    const wrapperRef = useRef<HTMLDivElement | null>(null);
    const appletRef = useRef<any>(null);
    const elementIdRef = useRef<string>(`ggb-sine-${Math.random().toString(36).substr(2, 9)}`);
    const [scriptLoaded, setScriptLoaded] = useState<boolean>(!!window.GGBApplet);
    const [error, setError] = useState<boolean>(false);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        const elementId = elementIdRef.current;

        const buildConstruction = (api: any) => {
            try {
                api.reset();
                api.setCoordSystem(-1.6, 9.4, -1.65, 1.65);

                // Schieberegler für den Winkel alpha in Grad (0 - 360)
                api.evalCommand('alpha=Slider(0,360,1)');
                api.setValue('alpha', 0);
                api.setAnimationSpeed('alpha', 0.6);

                // Einheitskreis
                api.evalCommand('O=(0,0)');
                api.evalCommand('X1=(1,0)');
                api.evalCommand('k=Circle(O,1)');
                api.evalCommand('P=(cos(alpha*pi/180),sin(alpha*pi/180))');
                api.evalCommand('winkel=Angle(X1,O,P)');

                api.evalCommand('segOP=Segment(O,P)');
                api.evalCommand('segSin=Segment(P,(x(P),0))');

                // Sinuskurve rechts vom Kreis, Offset entlang der x-Achse
                api.evalCommand('offset=2.6');
                api.evalCommand('kurve=Function(sin(x-offset),offset,offset+2*pi)');
                api.evalCommand('Q=(offset+alpha*pi/180,sin(alpha*pi/180))');
                api.evalCommand('segLink=Segment(P,Q)');
                api.evalCommand('segDown=Segment(Q,(x(Q),0))');

                // Optik — über die JS-API gesetzt, da SetColor & Co. per evalCommand in dieser
                // Konstellation unzuverlässig ausgeführt werden.
                api.setColor('k', 30, 64, 175);
                api.setColor('kurve', 30, 64, 175);
                api.setLineThickness('kurve', 4);
                api.setColor('P', 220, 38, 38);
                api.setColor('Q', 220, 38, 38);
                api.setColor('segOP', 71, 85, 105);
                api.setColor('segSin', 22, 163, 74);
                api.setLineThickness('segSin', 4);
                api.setColor('segLink', 148, 163, 184);
                api.setLineStyle('segLink', 1);
                api.setColor('segDown', 148, 163, 184);
                api.setLineStyle('segDown', 1);
                api.setFixed('alpha', false);
                api.setVisible('winkel', true);

                api.setLabelVisible('winkel', true);
                api.setLabelVisible('P', true);
                api.setLabelVisible('Q', false);
                api.setLabelVisible('O', false);
                api.setLabelVisible('X1', false);

                api.setRepaintingActive(true);
            } catch (e) {
                console.error('Fehler beim Aufbau der GeoGebra-Konstruktion:', e);
                setError(true);
            }
        };

        const getInitialWidth = () => Math.round(wrapperRef.current?.clientWidth || width);

        const initApplet = () => {
            if (!window.GGBApplet || appletRef.current) return;

            const initialWidth = getInitialWidth();
            const initialHeight = Math.round(initialWidth / ASPECT_RATIO);

            const params = {
                appName: 'classic',
                width: initialWidth,
                height: initialHeight,
                perspective: 'G',
                showToolBar: false,
                showAlgebraInput: false,
                showMenuBar: false,
                showResetIcon: true,
                showFullscreenButton: false,
                showZoomButtons: true,
                useBrowserForJS: true,
                appletOnLoad: (api: any) => {
                    appletRef.current = api;
                    buildConstruction(api);
                }
            };

            try {
                const applet = new window.GGBApplet(params, true);
                applet.inject(elementId);
            } catch (e) {
                console.error('GeoGebra Error beim Injizieren:', e);
                setError(true);
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
                console.error('Fehler beim Laden von GeoGebra Script');
                setError(true);
            };
            document.body.appendChild(s);
        } else {
            setScriptLoaded(true);
            setTimeout(() => initApplet(), 50);
        }
    }, [width, height]);

    // Applet bei Größenänderung des Containers (z. B. Fenster verkleinern) neu skalieren.
    useEffect(() => {
        const wrapper = wrapperRef.current;
        if (!wrapper) return;

        const observer = new ResizeObserver(entries => {
            const entry = entries[0];
            if (!entry || !appletRef.current) return;
            const newWidth = Math.round(entry.contentRect.width);
            const newHeight = Math.round(newWidth / ASPECT_RATIO);
            if (newWidth > 0 && newHeight > 0) {
                try {
                    appletRef.current.setSize(newWidth, newHeight);
                } catch (e) {
                    // Ignorieren, falls das Applet gerade neu aufgebaut wird.
                }
            }
        });

        observer.observe(wrapper);
        return () => observer.disconnect();
    }, []);

    const toggleAnimation = () => {
        const api = appletRef.current;
        if (!api) return;
        const next = !isAnimating;
        try {
            api.setAnimating('alpha', next);
            if (next) {
                api.startAnimation();
            } else {
                api.stopAnimation();
            }
        } catch (e) {
            console.error('Fehler beim Steuern der Animation:', e);
        }
        setIsAnimating(next);
    };

    const resetAngle = () => {
        const api = appletRef.current;
        if (!api) return;
        try {
            api.setAnimating('alpha', false);
            api.stopAnimation();
            api.setValue('alpha', 0);
        } catch (e) {
            console.error('Fehler beim Zurücksetzen:', e);
        }
        setIsAnimating(false);
    };

    return (
        <div ref={wrapperRef} className="w-full flex flex-col items-center gap-3">
            <div
                style={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    backgroundColor: '#f9f9f9',
                    padding: '10px',
                    borderRadius: '8px'
                }}
            >
                {error ? (
                    <div
                        style={{
                            width: '100%',
                            aspectRatio: `${ASPECT_RATIO}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '2px dashed #d1d5db',
                            borderRadius: '4px',
                            backgroundColor: '#f3f4f6',
                            flexDirection: 'column',
                            gap: '10px',
                            color: '#6b7280',
                            fontSize: '14px'
                        }}
                    >
                        <span>⚠️ Die interaktive Grafik konnte nicht geladen werden.</span>
                        <button
                            onClick={() => window.location.reload()}
                            style={{
                                padding: '8px 16px',
                                backgroundColor: '#3b82f6',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '13px'
                            }}
                        >
                            Seite neu laden
                        </button>
                    </div>
                ) : !scriptLoaded ? (
                    <div
                        style={{
                            width: '100%',
                            aspectRatio: `${ASPECT_RATIO}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid #e5e7eb',
                            borderRadius: '4px',
                            backgroundColor: '#f9fafb',
                            color: '#6b7280',
                            fontSize: '14px'
                        }}
                    >
                        ⏳ Grafik wird geladen...
                    </div>
                ) : (
                    <div
                        id={elementIdRef.current}
                        style={{
                            width: '100%',
                            aspectRatio: `${ASPECT_RATIO}`,
                            border: '1px solid #ddd',
                            borderRadius: '4px'
                        }}
                    />
                )}
            </div>

            {!error && scriptLoaded && (
                <div className="flex gap-3">
                    <button
                        onClick={toggleAnimation}
                        className="px-4 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors"
                    >
                        {isAnimating ? 'Animation stoppen' : 'Animation starten'}
                    </button>
                    <button
                        onClick={resetAngle}
                        className="px-4 py-2 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors"
                    >
                        Zurücksetzen
                    </button>
                </div>
            )}
        </div>
    );
};

export default GeoGebraSineUnitCircle;

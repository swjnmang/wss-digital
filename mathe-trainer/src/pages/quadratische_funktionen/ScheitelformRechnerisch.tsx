import React, { useState, useEffect, useRef } from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';

declare global {
  interface Window {
    GGBApplet: any;
  }
}

const ScheitelformRechnerisch = () => {
    const [taskData, setTaskData] = useState<{S: {x: number, y: number}, P: {x: number, y: number}} | null>(null);
    const [correctValues, setCorrectValues] = useState<{a: number, xs: number, ys: number} | null>(null);
    const [solutionSteps, setSolutionSteps] = useState<React.ReactNode>(null);
    const [geoSize, setGeoSize] = useState<{ width: number; height: number }>({ width: 600, height: 500 });
    
    const [userA, setUserA] = useState<string>('');
    const [userXs, setUserXs] = useState<string>('');
    const [userYs, setUserYs] = useState<string>('');
    const [feedback, setFeedback] = useState<string>('');
    const [isCorrect, setIsCorrect] = useState<boolean>(false);
    const [showSolution, setShowSolution] = useState<boolean>(false);
    const [streak, setStreak] = useState<number>(0);

    const ggbApiRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const VIDEO_URL = "https://www.youtube.com/watch?v=xgiAK3rLCow&t";

    const formatNumber = (num: number) => Math.round(num * 100) / 100;
    const randomInt = (max: number, min: number = 0) => Math.floor(Math.random() * (max - min + 1)) + min;
    const randomChoice = (arr: number[]) => arr[Math.floor(Math.random() * arr.length)];

    // Responsive sizing
    useEffect(() => {
        const calculateSize = () => {
            if (!containerRef.current) return;
            const parentWidth = containerRef.current.offsetWidth;
            const size = Math.min(Math.max(parentWidth * 0.9, 300), 700);
            setGeoSize({ width: size, height: size * 0.8 });
        };

        calculateSize();
        window.addEventListener('resize', calculateSize);
        return () => window.removeEventListener('resize', calculateSize);
    }, []);

    const initializeGeoGebra = (a: number, xs: number, ys: number, px: number, py: number) => {
        const existing = document.querySelector('script[src="https://www.geogebra.org/apps/deployggb.js"]');
        
        const initApplet = () => {
            if (!window.GGBApplet) return;
            
            const params: any = {
                appName: 'classic',
                width: geoSize.width,
                height: geoSize.height,
                showToolBar: false,
                showAlgebraInput: false,
                showMenuBar: false,
                perspective: 'G',
                useBrowserForJS: true,
                enableShiftDragZoom: true,
                showResetIcon: true,
                showZoomButtons: true,
                appletOnLoad: (api: any) => {
                    ggbApiRef.current = api;
                    
                    try {
                        api.reset();
                        api.evalCommand(`f(x) = ${a}*(x - (${xs}))^2 + ${ys}`);
                        api.setColor('f', 0, 0, 255);
                        api.setLineThickness('f', 3);
                        
                        api.evalCommand(`S=(${xs}, ${ys})`);
                        api.setColor('S', 255, 0, 0);
                        api.setPointSize('S', 8);
                        api.setLabelVisible('S', true);
                        
                        api.evalCommand(`P=(${px}, ${py})`);
                        api.setColor('P', 0, 128, 0);
                        api.setPointSize('P', 8);
                        api.setLabelVisible('P', true);
                        
                        const viewMargin = 5;
                        const xMin = xs - viewMargin;
                        const xMax = xs + viewMargin;
                        const yMin = ys - viewMargin;
                        const yMax = ys + viewMargin;
                        api.setCoordSystem(xMin, xMax, yMin, yMax);
                    } catch (e) {
                        console.error('GeoGebra error:', e);
                    }
                }
            };

            try {
                const applet = new window.GGBApplet(params, true);
                applet.inject('ggb-scheitelform-rechnerisch');
            } catch (e) {
                console.error('GeoGebra injection error:', e);
            }
        };

        if (!existing) {
            const script = document.createElement('script');
            script.src = 'https://www.geogebra.org/apps/deployggb.js';
            script.async = true;
            script.onload = () => setTimeout(initApplet, 100);
            document.body.appendChild(script);
        } else if (window.GGBApplet) {
            setTimeout(initApplet, 100);
        }
    };

    const generateNewTask = () => {
        // Reset UI
        setFeedback('');
        setUserA('');
        setUserXs('');
        setUserYs('');
        setShowSolution(false);
        setIsCorrect(false);

        const a = randomChoice([0.5, -0.5, 1.5, -1.5, 2, -2]);
        const xs = randomInt(4, -4);
        const ys = randomInt(4, -4);
        const px = xs + randomChoice([1, -1, 2, -2]);
        const py = formatNumber(a * Math.pow(px - xs, 2) + ys);

        setCorrectValues({ a, xs, ys });
        setTaskData({ S: { x: xs, y: ys }, P: { x: px, y: py } });

        setTimeout(() => {
            initializeGeoGebra(a, xs, ys, px, py);
        }, 100);

        const xsTermForInput = formatNumber(-xs);
        const ysTermForInput = ys;

        setSolutionSteps(
            <div>
                <p><strong>1. Scheitelpunkt S($x_s$|$y_s$) ablesen und einsetzen:</strong></p>
                <p>Aus S({xs}|{ys}) folgt: $x_s = {xs}$ und $y_s = {ys}$.</p>
                <p>Ansatz: $y = a(x - {xs})² + {ys}$</p>
                <br />
                <p><strong>2. Punkt P einsetzen, um a zu berechnen:</strong></p>
                <p>Setze P({px}|{py}) für x und y ein.</p>
                <p>${py} = a({px} - {xs})² + {ys} | -{ys}</p>
                <p>${formatNumber(py - ys)} = a \cdot {Math.pow(px - xs, 2)} | : {Math.pow(px - xs, 2)}</p>
                <p>a = {a}</p>
                <br />
                <p><strong>3. Werte in die Lösungsmaske eintragen:</strong></p>
                <ul className="list-disc pl-5">
                    <li>Für 'a' gibst du {a} ein.</li>
                    <li>In der Klammer (x...) wird das Vorzeichen von $x_s$ umgedreht: -({xs}) = {xsTermForInput}. Du gibst also <strong>{xsTermForInput > 0 ? '+' : ''}{xsTermForInput}</strong> ein.</li>
                    <li>Der letzte Wert ist $y_s$ direkt: Du gibst also <strong>{ysTermForInput > 0 ? '+' : ''}{ysTermForInput}</strong> ein.</li>
                </ul>
            </div>
        );
    };

    const checkSolution = () => {
        if (!correctValues) return;

        if (userA === '' || userXs === '' || userYs === '') {
            setFeedback('Bitte fülle alle drei Felder aus.');
            setIsCorrect(false);
            return;
        }

        const aVal = parseFloat(userA.replace(',', '.'));
        const xsVal = parseFloat(userXs.replace(',', '.'));
        const ysVal = parseFloat(userYs.replace(',', '.'));

        const correctXsForInput = formatNumber(-correctValues.xs);
        const correctYsForInput = correctValues.ys;

        const isACorrect = Math.abs(aVal - correctValues.a) < 0.01;
        const isXsCorrect = Math.abs(xsVal - correctXsForInput) < 0.01;
        const isYsCorrect = Math.abs(ysVal - correctYsForInput) < 0.01;

        if (isACorrect && isXsCorrect && isYsCorrect) {
            setFeedback('Richtig! Ausgezeichnet!');
            setIsCorrect(true);
            setStreak(s => s + 1);
        } else {
            setFeedback('Leider nicht ganz richtig. Überprüfe deine Werte und Vorzeichen!');
            setIsCorrect(false);
            setStreak(0);
        }
    };

    useEffect(() => {
        generateNewTask();
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
            <div className="container mx-auto px-4" ref={containerRef}>
                <div className="max-w-6xl mx-auto">
                    <div className="flex justify-between items-center mb-2">
                        <h1 className="text-4xl font-bold text-slate-800">Funktionsgleichung in Scheitelform bestimmen</h1>
                        <div className="bg-white px-4 py-2 rounded-lg shadow text-orange-500 font-bold border border-orange-200">
                            Streak: {streak} 🔥
                        </div>
                    </div>
                    <p className="text-slate-600 mb-6">Berechne die Parameter aus Scheitelpunkt und einem weiteren Punkt</p>
                    
                    <div className="grid lg:grid-cols-3 gap-6">
                        {/* GeoGebra */}
                        <div className="lg:col-span-2">
                            <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
                                <p className="text-lg font-bold text-slate-700 mb-4">Graph mit Scheitelpunkt S (rot) und Punkt P (grün):</p>
                                <div 
                                    id="ggb-scheitelform-rechnerisch"
                                    className="w-full bg-slate-50 rounded-lg border border-slate-200"
                                    style={{ minHeight: '500px' }}
                                ></div>
                            </div>
                        </div>

                        {/* Input und Buttons */}
                        <div className="lg:col-span-1">
                            <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200 sticky top-6">
                                <h3 className="text-lg font-bold text-slate-800 mb-4">Scheitelform</h3>
                                
                                <div className="text-sm text-slate-600 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
                                    <p className="mb-2"><strong>Bestimme:</strong></p>
                                    <p className="mb-3"><InlineMath math={String.raw`y = a(x - x_s)^2 + y_s`} /></p>
                                    <p className="text-xs">
                                        <strong>Gegeben:</strong> S{taskData && `(${taskData.S.x}|${taskData.S.y})`} und P{taskData && `(${taskData.P.x}|${taskData.P.y})`}
                                    </p>
                                </div>
                                
                                <div className="space-y-3 mb-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-600 mb-1">a</label>
                                        <input
                                            type="text"
                                            value={userA}
                                            onChange={(e) => setUserA(e.target.value)}
                                            placeholder="z.B. 1 oder -2"
                                            className="w-full p-3 border-2 border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none text-center"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-slate-600 mb-1">xs (Vorzeichen umgekehrt!)</label>
                                        <input
                                            type="text"
                                            value={userXs}
                                            onChange={(e) => setUserXs(e.target.value)}
                                            placeholder="z.B. +2 oder -3"
                                            className="w-full p-3 border-2 border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none text-center"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-slate-600 mb-1">ys</label>
                                        <input
                                            type="text"
                                            value={userYs}
                                            onChange={(e) => setUserYs(e.target.value)}
                                            placeholder="z.B. +1 oder -4"
                                            className="w-full p-3 border-2 border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none text-center"
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <button 
                                        onClick={checkSolution}
                                        className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-semibold transition-colors shadow-md"
                                    >
                                        Lösung prüfen
                                    </button>
                                    <button 
                                        onClick={generateNewTask}
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-semibold transition-colors shadow-md"
                                    >
                                        Neue Aufgabe
                                    </button>
                                    <a 
                                        href={VIDEO_URL} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors shadow-md"
                                    >
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                                        </svg>
                                        Video
                                    </a>
                                </div>

                                {feedback && (
                                    <div className={`mt-4 p-4 rounded-lg font-semibold text-center ${isCorrect ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-red-100 text-red-700 border border-red-300'}`}>
                                        {feedback}
                                    </div>
                                )}

                                {!isCorrect && feedback && (
                                    <button 
                                        onClick={() => setShowSolution(true)}
                                        className="w-full mt-3 text-blue-600 hover:text-blue-700 font-semibold hover:underline"
                                    >
                                        Lösung anzeigen
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {showSolution && solutionSteps && (
                        <div className="mt-6 bg-blue-50 p-6 rounded-xl border-2 border-blue-300">
                            <h3 className="font-bold text-lg mb-3 text-blue-900">Lösungsweg:</h3>
                            {solutionSteps}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ScheitelformRechnerisch;

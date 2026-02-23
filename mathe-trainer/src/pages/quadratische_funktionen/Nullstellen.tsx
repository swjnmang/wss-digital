import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

declare global {
  interface Window {
    GGBApplet: any;
  }
}

const Nullstellen = () => {
    // State
    const [params, setParams] = useState<{a: number, b: number, c: number} | null>(null);
    const [roots, setRoots] = useState<number[]>([]);
    const [userCount, setUserCount] = useState<string>("2");
    const [userX1, setUserX1] = useState<string>("");
    const [userX2, setUserX2] = useState<string>("");
    const [feedback, setFeedback] = useState<{type: 'success' | 'error' | 'info', message: string} | null>(null);
    const [showSolution, setShowSolution] = useState<boolean>(false);
    const [score, setScore] = useState<number>(0);
    const [attempted, setAttempted] = useState<boolean>(false);
    const [geoSize, setGeoSize] = useState<{ width: number; height: number }>({ width: 600, height: 500 });

    const ggbApiRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);

    // Helpers
    const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

    const smartFormat = (num: number, digits = 2) => {
        if (Math.abs(num) < 1e-9) return "0";
        if (Math.abs(num - Math.round(num)) < 1e-9) return Math.round(num).toString();
        return parseFloat(num.toFixed(digits)).toString();
    };

    const formatCoeff = (num: number, forLatex = false) => {
        const numStr = smartFormat(num, 4);
        if (forLatex) {
            return parseFloat(numStr) < 0 ? `(${numStr})` : numStr;
        }
        return numStr;
    };

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

    const initializeGeoGebra = (a: number, b: number, c: number) => {
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
                        api.evalCommand(`f(x) = ${a}*x^2 + ${b}*x + ${c}`);
                        api.setColor('f', 0, 0, 255);
                        api.setLineThickness('f', 3);
                        
                        // Mark zeros
                        roots.forEach((root, idx) => {
                            const pointName = `Z${idx}`;
                            api.evalCommand(`${pointName}=(${root}, 0)`);
                            api.setColor(pointName, 255, 0, 0);
                            api.setPointSize(pointName, 8);
                            api.setLabelVisible(pointName, true);
                        });
                        
                        api.setCoordSystem(-10, 10, -10, 10);
                    } catch (e) {
                        console.error('GeoGebra error:', e);
                    }
                }
            };

            try {
                const applet = new window.GGBApplet(params, true);
                applet.inject('ggb-nullstellen');
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

    const generateProblem = () => {
        setAttempted(false);
        setFeedback(null);
        setShowSolution(false);
        setUserX1("");
        setUserX2("");
        setUserCount("2");

        const fall = getRandomInt(1, 3);
        let a = 0, b = 0, c = 0;
        let realRoots: number[] = [];

        if (fall === 1) { // 2 Roots
            let x1, x2;
            do {
                x1 = getRandomInt(-6, 6);
                x2 = getRandomInt(-6, 6);
            } while (x1 === x2);
            
            a = getRandomInt(1, 2) * (Math.random() < 0.5 ? 1 : -1);
            b = -a * (x1 + x2);
            c = a * x1 * x2;
            realRoots = [x1, x2].sort((u, v) => u - v);
        } else if (fall === 2) { // 1 Root
            const x0 = getRandomInt(-5, 5);
            a = getRandomInt(1, 2) * (Math.random() < 0.5 ? 1 : -1);
            b = -2 * a * x0;
            c = a * x0 * x0;
            realRoots = [x0];
        } else { // 0 Roots
            a = getRandomInt(1, 2) * (Math.random() < 0.5 ? 1 : -1);
            const xv = getRandomInt(-4, 4);
            const yv_abs = getRandomInt(1, 10);
            const yv_sign = (a > 0) ? 1 : -1; // Vertex y must have same sign as a to have no roots
            
            b = -2 * a * xv;
            c = a * xv * xv + yv_sign * yv_abs;
            realRoots = [];
        }

        if (a === 0) a = 1; // Safety

        setParams({ a, b, c });
        setRoots(realRoots);
        
        setTimeout(() => {
            initializeGeoGebra(a, b, c);
        }, 100);
    };

    useEffect(() => {
        generateProblem();
    }, []);

    const getFunctionString = () => {
        if (!params) return "";
        const { a, b, c } = params;
        
        let str = "f(x) = ";
        
        // a term
        if (a === 1) str += "x^2";
        else if (a === -1) str += "-x^2";
        else str += `${formatCoeff(a)}x^2`;

        // b term
        if (b !== 0) {
            if (b > 0) str += " + ";
            else str += " - ";
            const absB = Math.abs(b);
            str += (absB === 1 ? "" : formatCoeff(absB)) + "x";
        }

        // c term
        if (c !== 0) {
            if (c > 0) str += " + ";
            else str += " - ";
            str += formatCoeff(Math.abs(c));
        }

        if (str === "f(x) = ") str += "0"; // Should not happen with current logic but good safety

        return str;
    };

    const checkAnswer = () => {
        if (!params) return;
        
        const count = parseInt(userCount);
        const correctCount = roots.length;
        
        if (count !== correctCount) {
            setFeedback({
                type: 'error',
                message: `Die Anzahl der Nullstellen ist nicht korrekt. Diese Funktion hat ${correctCount} reelle Nullstelle(n).`
            });
            return;
        }

        if (correctCount === 0) {
            setFeedback({ type: 'success', message: 'Korrekt! Die Funktion hat keine reellen Nullstellen.' });
            if (!attempted) setScore(s => s + 10);
            else if (!showSolution) setScore(s => s + 5);
            setAttempted(true);
            return;
        }

        if (correctCount === 1) {
            const uX1 = parseFloat(userX1.replace(',', '.'));
            if (isNaN(uX1)) {
                setFeedback({ type: 'info', message: 'Bitte gib eine gültige Zahl ein.' });
                return;
            }
            if (Math.abs(uX1 - roots[0]) < 0.01) {
                setFeedback({ type: 'success', message: `Korrekt! Die Nullstelle ist x = ${smartFormat(roots[0])}` });
                if (!attempted) setScore(s => s + 10);
                else if (!showSolution) setScore(s => s + 5);
                setAttempted(true);
            } else {
                setFeedback({ type: 'error', message: `Die Nullstelle ${smartFormat(uX1)} ist nicht korrekt.` });
            }
            return;
        }

        if (correctCount === 2) {
            const uX1 = parseFloat(userX1.replace(',', '.'));
            const uX2 = parseFloat(userX2.replace(',', '.'));
            
            if (isNaN(uX1) || isNaN(uX2)) {
                setFeedback({ type: 'info', message: 'Bitte gib gültige Zahlen ein.' });
                return;
            }

            const userRootsSorted = [uX1, uX2].sort((u, v) => u - v);
            const correctRootsSorted = [...roots].sort((u, v) => u - v);

            if (Math.abs(userRootsSorted[0] - correctRootsSorted[0]) < 0.01 && 
                Math.abs(userRootsSorted[1] - correctRootsSorted[1]) < 0.01) {
                setFeedback({ type: 'success', message: `Korrekt! Die Nullstellen sind x₁ = ${smartFormat(roots[0])} und x₂ = ${smartFormat(roots[1])}` });
                if (!attempted) setScore(s => s + 10);
                else if (!showSolution) setScore(s => s + 5);
                setAttempted(true);
            } else {
                setFeedback({ type: 'error', message: 'Die eingegebenen Nullstellen sind nicht korrekt.' });
            }
        }
    };

    const renderSolution = () => {
        if (!params) return null;
        const { a, b, c } = params;
        const D = b*b - 4*a*c;
        
        const aStr = formatCoeff(a, true);
        const bStr = formatCoeff(b, true);
        const cStr = formatCoeff(c, true);
        const negB = formatCoeff(-b);
        const twoA = formatCoeff(2*a);

        return (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 mb-3">Musterlösung</h3>
                
                <p className="mb-2">Die allgemeine Mitternachtsformel lautet:</p>
                <BlockMath math="x_{1,2} = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}" />
                
                <p className="mb-2 mt-4">Einsetzen der Koeffizienten ($a={smartFormat(a)}, b={smartFormat(b)}, c={smartFormat(c)}$):</p>
                <BlockMath math={`x_{1,2} = \\frac{-${bStr} \\pm \\sqrt{(${bStr})^2 - 4 \\cdot ${aStr} \\cdot ${cStr}}}{2 \\cdot ${aStr}}`} />
                
                <p className="mb-2 mt-4">Berechnung der Diskriminante $D$ (Term unter der Wurzel):</p>
                <BlockMath math={`D = (${bStr})^2 - 4 \\cdot ${aStr} \\cdot ${cStr} = ${smartFormat(b*b)} - (${smartFormat(4*a*c)}) = ${smartFormat(D)}`} />
                
                <div className="mt-4">
                    {D > 0.0001 && (
                        <>
                            <p>Da $D &gt; 0$, gibt es zwei verschiedene reelle Nullstellen:</p>
                            <BlockMath math={`x_1 = \\frac{${negB} - \\sqrt{${smartFormat(D)}}}{${twoA}} = \\frac{${smartFormat(-b - Math.sqrt(D))}}{${twoA}} = \\mathbf{${smartFormat(roots[0])}}`} />
                            <BlockMath math={`x_2 = \\frac{${negB} + \\sqrt{${smartFormat(D)}}}{${twoA}} = \\frac{${smartFormat(-b + Math.sqrt(D))}}{${twoA}} = \\mathbf{${smartFormat(roots[1])}}`} />
                        </>
                    )}
                    {Math.abs(D) <= 0.0001 && (
                        <>
                            <p>Da $D = 0$, gibt es genau eine reelle Nullstelle (doppelte Nullstelle):</p>
                            <BlockMath math={`x_0 = \\frac{${negB}}{${twoA}} = \\mathbf{${smartFormat(roots[0])}}`} />
                        </>
                    )}
                    {D < -0.0001 && (
                        <p>Da $D &lt; 0$, ist der Wert unter der Wurzel negativ. Es gibt <strong>keine reellen Nullstellen</strong>.</p>
                    )}
                </div>

                <div ref={containerRef} className="mt-6 w-full">
                    <div id="ggb-nullstellen" className="w-full rounded-lg border-2 border-slate-300 overflow-hidden"></div>
                </div>
            </div>
        );
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="bg-white rounded-xl shadow-lg p-6 relative">
                <div className="absolute top-4 right-4 bg-teal-50 text-teal-700 px-4 py-2 rounded-lg font-bold border border-teal-100">
                    Punkte: {score}
                </div>

                <h1 className="text-3xl font-bold text-teal-800 text-center mb-6">
                    Nullstellen berechnen 📐
                </h1>

                <div className="bg-blue-50 p-4 rounded-lg mb-6 text-center text-gray-700">
                    <p className="mb-2">Die Mitternachtsformel (abc-Formel) lautet:</p>
                    <BlockMath math="x_{1,2} = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}" />
                </div>

                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-6">
                    <p className="font-bold text-gray-700 mb-2">Arbeitsauftrag:</p>
                    <p className="mb-4">Berechne die Nullstelle(n) der folgenden Funktion:</p>
                    <div className="text-2xl font-bold text-pink-600 text-center my-4">
                        <InlineMath math={getFunctionString()} />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
                    <div className="mb-4">
                        <label className="block text-gray-700 font-medium mb-2">
                            Wie viele reelle Nullstellen erwartest du?
                        </label>
                        <select 
                            value={userCount}
                            onChange={(event: React.ChangeEvent<HTMLSelectElement>) => setUserCount(event.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        >
                            <option value="2">Zwei Nullstellen</option>
                            <option value="1">Eine Nullstelle</option>
                            <option value="0">Keine Nullstellen</option>
                        </select>
                    </div>

                    {userCount !== "0" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-gray-700 font-medium mb-2">
                                    {userCount === "1" ? "Nullstelle x₀:" : "Erste Nullstelle x₁ (kleinere):"}
                                </label>
                                <input 
                                    type="text" 
                                    value={userX1}
                                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => setUserX1(event.target.value)}
                                    placeholder="z.B. -2.5"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                />
                            </div>
                            {userCount === "2" && (
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2">
                                        Zweite Nullstelle x₂:
                                    </label>
                                    <input 
                                        type="text" 
                                        value={userX2}
                                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => setUserX2(event.target.value)}
                                        placeholder="z.B. 3"
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex flex-wrap gap-4 justify-center mb-6">
                    <button 
                        onClick={generateProblem}
                        className="px-6 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors"
                    >
                        Neue Aufgabe
                    </button>
                    <button 
                        onClick={checkAnswer}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                        Prüfen
                    </button>
                    <button 
                        onClick={() => setShowSolution(!showSolution)}
                        className="px-6 py-3 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors"
                    >
                        {showSolution ? "Lösung verbergen" : "Lösung anzeigen"}
                    </button>
                </div>

                {feedback && (
                    <div className={`p-4 rounded-lg mb-6 text-center font-medium ${
                        feedback.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' :
                        feedback.type === 'error' ? 'bg-red-100 text-red-800 border border-red-200' :
                        'bg-blue-100 text-blue-800 border border-blue-200'
                    }`}>
                        {feedback.message}
                    </div>
                )}

                {showSolution && renderSolution()}
            </div>
        </div>
    );
};

export default Nullstellen;

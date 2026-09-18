import React, { useState, useEffect, useRef } from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';

declare global {
  interface Window {
    GGBApplet: any;
  }
}

// Kleiner Umschalter, mit dem der Schüler selbst zwischen + und − wählt,
// statt ein Vorzeichen im Kopf umdrehen und als Zahl eintippen zu müssen.
const SignToggle = ({ value, onChange }: { value: '+' | '-' | null; onChange: (v: '+' | '-') => void }) => (
    <div className="inline-flex shrink-0 rounded-md overflow-hidden border-2 border-slate-300">
        <button
            type="button"
            onClick={() => onChange('+')}
            aria-label="Plus"
            className={`w-5 h-8 flex items-center justify-center text-xs font-bold transition-colors ${value === '+' ? 'bg-blue-600 text-white' : 'bg-white text-slate-500 hover:bg-slate-100'}`}
        >
            +
        </button>
        <button
            type="button"
            onClick={() => onChange('-')}
            aria-label="Minus"
            className={`w-5 h-8 flex items-center justify-center text-xs font-bold transition-colors border-l-2 border-slate-300 ${value === '-' ? 'bg-blue-600 text-white' : 'bg-white text-slate-500 hover:bg-slate-100'}`}
        >
            −
        </button>
    </div>
);

const Scheitelform = () => {
    const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
    const [correctA, setCorrectA] = useState<number>(0);
    const [correctXs, setCorrectXs] = useState<number>(0);
    const [correctYs, setCorrectYs] = useState<number>(0);
    const [solutionSteps, setSolutionSteps] = useState<React.ReactNode>(null);
    const [geoSize, setGeoSize] = useState<{ width: number; height: number }>({ width: 600, height: 500 });
    
    const [userA, setUserA] = useState<string>('');
    const [xsSign, setXsSign] = useState<'+' | '-' | null>(null);
    const [userXsAbs, setUserXsAbs] = useState<string>('');
    const [ysSign, setYsSign] = useState<'+' | '-' | null>(null);
    const [userYsAbs, setUserYsAbs] = useState<string>('');
    const [feedback, setFeedback] = useState<string>('');
    const [isCorrect, setIsCorrect] = useState<boolean>(false);
    const [showSolution, setShowSolution] = useState<boolean>(false);

    const ggbApiRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);

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

    const initializeGeoGebra = (a: number, xs: number, ys: number) => {
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
                        
                        api.evalCommand(`S = (${xs}, ${ys})`);
                        api.setColor('S', 255, 0, 0);
                        api.setPointSize('S', 8);
                        api.setLabelVisible('S', true);
                        
                        const margin = 3;
                        api.setCoordSystem(xs - margin - 2, xs + margin + 2, ys - 3, ys + 8);
                    } catch (e) {
                        console.error('GeoGebra error:', e);
                    }
                }
            };

            try {
                const applet = new window.GGBApplet(params, true);
                applet.inject('ggb-scheitelform');
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

    const generateNewTask = (level: 'easy' | 'medium' | 'hard') => {
        // Reset UI
        setFeedback('');
        setUserA('');
        setXsSign(null);
        setUserXsAbs('');
        setYsSign(null);
        setUserYsAbs('');
        setShowSolution(false);
        setIsCorrect(false);

        let a = 1, xs = 0, ys = 0;

        switch (level) {
            case 'medium':
                a = randomChoice([0.5, -0.5, 1.5, -1.5, 2, -2]);
                xs = randomInt(8, -8) / 2;
                ys = randomInt(8, -8) / 2;
                break;
            case 'hard':
                a = randomChoice([0.25, -0.25, 0.75, -0.75, 1.25, -1.25]);
                xs = randomInt(16, -16) / 4;
                ys = randomInt(16, -16) / 4;
                break;
            case 'easy':
            default:
                a = randomChoice([1, -1, 2, -2]);
                xs = randomInt(5, -5);
                ys = randomInt(5, -5);
                break;
        }

        const newCorrectA = formatNumber(a);
        const newCorrectXs = formatNumber(xs);
        const newCorrectYs = formatNumber(ys);

        setCorrectA(newCorrectA);
        setCorrectXs(newCorrectXs);
        setCorrectYs(newCorrectYs);

        // Initialize GeoGebra
        setTimeout(() => {
            initializeGeoGebra(newCorrectA, newCorrectXs, newCorrectYs);
        }, 100);

        const xsTermForInput = formatNumber(-newCorrectXs);
        const ysTermForInput = newCorrectYs;
        
        let finalEquationString = `y = ${newCorrectA === 1 ? '' : (newCorrectA === -1 ? '-' : newCorrectA)}(x`;
        if (xsTermForInput > 0) finalEquationString += `+${xsTermForInput}`;
        if (xsTermForInput < 0) finalEquationString += `${xsTermForInput}`;
        finalEquationString += `)²`;
        if (ysTermForInput > 0) finalEquationString += `+${ysTermForInput}`;
        if (ysTermForInput < 0) finalEquationString += `${ysTermForInput}`;

        setSolutionSteps(
            <div>
                <p><strong>1. Scheitelpunkt S(<InlineMath math="x_s" />|<InlineMath math="y_s" />) ablesen:</strong></p>
                <p>Der Scheitelpunkt liegt bei S({newCorrectXs}|{newCorrectYs}).</p>
                <p>Daraus folgt: <InlineMath math={`x_s = ${newCorrectXs}`} /> und <InlineMath math={`y_s = ${newCorrectYs}`} />.</p>
                <br />
                <p><strong>2. Formfaktor a bestimmen:</strong></p>
                <p>Der Formfaktor war mit <strong>a = {newCorrectA}</strong> gegeben.</p>
                <br />
                <p><strong>3. Werte in die Lösungsmaske eintragen:</strong></p>
                <ul className="list-disc pl-5">
                    <li>Der Wert für <strong>a</strong> ist {newCorrectA}.</li>
                    <li>In der Klammer (x ... ) wird das Vorzeichen von <InlineMath math="x_s" /> umgedreht: -({newCorrectXs}) = {xsTermForInput}. Du wählst also das Vorzeichen <strong>{xsTermForInput >= 0 ? '+' : '−'}</strong> und trägst die Zahl <strong>{Math.abs(xsTermForInput)}</strong> ein.</li>
                    <li>Nach der Klammer steht <InlineMath math="y_s" /> direkt: Du wählst das Vorzeichen <strong>{ysTermForInput >= 0 ? '+' : '−'}</strong> und trägst die Zahl <strong>{Math.abs(ysTermForInput)}</strong> ein.</li>
                </ul>
                <br />
                <p><strong>Finale Gleichung:</strong></p>
                <p className="font-mono text-lg">{finalEquationString}</p>
            </div>
        );
    };

    useEffect(() => {
        generateNewTask(difficulty);
    }, [difficulty]);

    const checkSolution = () => {
        if (userA === '' || xsSign === null || userXsAbs === '' || ysSign === null || userYsAbs === '') {
            setFeedback('Bitte fülle alle Felder aus und wähle die Vorzeichen.');
            setIsCorrect(false);
            return;
        }

        const aVal = parseFloat(userA.replace(',', '.').replace(/[−–—‐]/g, '-'));
        const xsAbsVal = parseFloat(userXsAbs.replace(',', '.').replace(/[−–—‐]/g, '-'));
        const ysAbsVal = parseFloat(userYsAbs.replace(',', '.').replace(/[−–—‐]/g, '-'));

        // In der Klammer (x ± xsAbs) steht das UMGEKEHRTE Vorzeichen von xs:
        // ist xs positiv, steht dort "-"; ist xs negativ, steht dort "+".
        const expectedXsAbs = Math.abs(correctXs);
        const expectedXsSign: '+' | '-' = correctXs > 0 ? '-' : '+';
        const isXsSignCorrect = correctXs === 0 ? true : xsSign === expectedXsSign;
        const isXsCorrect = isXsSignCorrect && Math.abs(xsAbsVal - expectedXsAbs) < 0.01;

        // Nach der Klammer steht ys direkt mit seinem eigenen Vorzeichen.
        const expectedYsAbs = Math.abs(correctYs);
        const expectedYsSign: '+' | '-' = correctYs < 0 ? '-' : '+';
        const isYsSignCorrect = correctYs === 0 ? true : ysSign === expectedYsSign;
        const isYsCorrect = isYsSignCorrect && Math.abs(ysAbsVal - expectedYsAbs) < 0.01;

        const isACorrect = Math.abs(aVal - correctA) < 0.01;

        if (isACorrect && isXsCorrect && isYsCorrect) {
            setFeedback('Richtig! Ausgezeichnet!');
            setIsCorrect(true);
        } else {
            setFeedback('Leider nicht ganz richtig. Überprüfe deine Werte und Vorzeichen!');
            setIsCorrect(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
            <div className="container mx-auto px-4" ref={containerRef}>
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-4xl font-bold mb-2 text-slate-800">Scheitelform aus Graph ablesen</h1>
                    <p className="text-slate-600 mb-6">Lese die Parameter a, xs und ys aus dem Graphen ab</p>
                    
                    <div className="mb-6">
                        <div className="flex gap-2 mb-6 flex-wrap justify-center">
                            <button 
                                onClick={() => setDifficulty('easy')}
                                className={`px-4 py-2 rounded-lg font-semibold transition-all ${difficulty === 'easy' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
                            >
                                Leicht
                            </button>
                            <button 
                                onClick={() => setDifficulty('medium')}
                                className={`px-4 py-2 rounded-lg font-semibold transition-all ${difficulty === 'medium' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
                            >
                                Mittel
                            </button>
                            <button 
                                onClick={() => setDifficulty('hard')}
                                className={`px-4 py-2 rounded-lg font-semibold transition-all ${difficulty === 'hard' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
                            >
                                Schwer
                            </button>
                        </div>

                        <div className="flex flex-col gap-6">
                            {/* GeoGebra */}
                            <div>
                                <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
                                    <p className="text-lg font-bold text-slate-700 mb-4">Graph der Parabel:</p>
                                    <div
                                        id="ggb-scheitelform"
                                        className="w-full bg-slate-50 rounded-lg border border-slate-200"
                                        style={{ minHeight: '500px' }}
                                    ></div>
                                </div>
                            </div>

                            {/* Input und Buttons */}
                            <div>
                                <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md border border-slate-200 max-w-xl mx-auto">
                                    <h3 className="text-lg font-bold text-slate-800 mb-4 text-center">Scheitelform</h3>

                                    <p className="text-sm text-slate-600 mb-4 text-center">
                                        Ergänze: <InlineMath math={String.raw`y = a(x - x_s)^2 + y_s`} /><br/>
                                        Der Formfaktor ist <strong>a = {correctA}</strong>.
                                    </p>

                                    <div className="flex flex-nowrap items-center justify-center gap-0.5 mb-6 bg-slate-50 py-2 px-1.5 rounded-lg border border-slate-200 font-mono text-sm overflow-x-auto">
                                        <span className="whitespace-nowrap shrink-0">y =</span>
                                        <input
                                            type="text"
                                            value={userA}
                                            onChange={(e) => setUserA(e.target.value)}
                                            placeholder="a"
                                            aria-label="Formfaktor a"
                                            className="w-8 h-9 shrink-0 p-1 border-2 border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none text-center"
                                        />
                                        <span className="whitespace-nowrap shrink-0">(x</span>
                                        <SignToggle value={xsSign} onChange={setXsSign} />
                                        <input
                                            type="text"
                                            value={userXsAbs}
                                            onChange={(e) => setUserXsAbs(e.target.value)}
                                            placeholder="xs"
                                            aria-label="Zahl im Klammerterm"
                                            className="w-8 h-9 shrink-0 p-1 border-2 border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none text-center"
                                        />
                                        <span className="whitespace-nowrap shrink-0">)²</span>
                                        <SignToggle value={ysSign} onChange={setYsSign} />
                                        <input
                                            type="text"
                                            value={userYsAbs}
                                            onChange={(e) => setUserYsAbs(e.target.value)}
                                            placeholder="ys"
                                            aria-label="Zahl ys"
                                            className="w-8 h-9 shrink-0 p-1 border-2 border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none text-center"
                                        />
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <button
                                            onClick={checkSolution}
                                            className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-semibold transition-colors shadow-md"
                                        >
                                            Lösung prüfen
                                        </button>
                                        <button
                                            onClick={() => generateNewTask(difficulty)}
                                            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-semibold transition-colors shadow-md"
                                        >
                                            Neue Aufgabe
                                        </button>
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
        </div>
    );
};

export default Scheitelform;

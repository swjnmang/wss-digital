import { useState, useEffect, useRef } from 'react';

declare global {
  interface Window {
    GGBApplet: any;
  }
}

const GraphZeichnen = () => {
    const [equation, setEquation] = useState<string>('');
    const [params, setParams] = useState<{a: number, b: number, c: number} | null>(null);
    const [showSolution, setShowSolution] = useState<boolean>(false);
    const [tableData, setTableData] = useState<{x: number, y: number}[]>([]);
    const [geoSize, setGeoSize] = useState<{ width: number; height: number }>({ width: 600, height: 500 });
    
    const ggbApiRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);

    const VIDEO_URL = "https://www.youtube.com/watch?v=jUJ9rB0XVy4";

    const formatNumber = (num: number) => Math.round(num * 100) / 100;
    const randomInt = (max: number, min: number = 0) => Math.floor(Math.random() * (max - min + 1)) + min;
    const randomHalfInt = (max: number, min: number) => randomInt(max * 2, min * 2) / 2;

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

    const generateNewTask = () => {
        setShowSolution(false);
        setTableData([]);

        let a = randomHalfInt(3, -3);
        while (Math.abs(a) < 0.2) {
            a = randomHalfInt(3, -3);
        }
        
        const b = randomHalfInt(3, -3);
        const c = randomHalfInt(3, -3);

        setParams({ a, b, c });

        const a_str = (a === 1) ? "x²" : (a === -1) ? "-x²" : `${a}x²`;
        const b_str = (b === 1) ? " + x" : (b === -1) ? " - x" : (b > 0) ? ` + ${b}x` : (b < 0) ? ` - ${Math.abs(b)}x` : "";
        const c_str = (c > 0) ? ` + ${c}` : (c < 0) ? ` - ${Math.abs(c)}` : "";
        
        setEquation(`y = ${a_str}${b_str}${c_str}`);
    };

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
                        const ggbEquation = `f(x) = ${a}*x^2 + ${b}*x + ${c}`;
                        api.evalCommand(ggbEquation);
                        api.setColor('f', 0, 0, 255);
                        api.setLineThickness('f', 3);
                    } catch (e) {
                        console.error('GeoGebra error:', e);
                    }
                }
            };

            try {
                const applet = new window.GGBApplet(params, true);
                applet.inject('ggb-graph-zeichnen');
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

    useEffect(() => {
        generateNewTask();
    }, []);

    const showSolutionHandler = () => {
        if (!params) return;
        
        setShowSolution(true);
        
        setTimeout(() => {
            initializeGeoGebra(params.a, params.b, params.c);
        }, 100);

        const newTableData = [];
        for (let x = -5; x <= 5; x += 0.5) {
            const y = params.a * x * x + params.b * x + params.c;
            newTableData.push({ x, y: formatNumber(y) });
        }
        setTableData(newTableData);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
            <div className="container mx-auto px-4" ref={containerRef}>
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-4xl font-bold mb-2 text-slate-800">Parabeln zeichnen (Allgemeine Form)</h1>
                    <p className="text-slate-600 mb-6">Erstelle eine Wertetabelle und zeichne den Graph</p>
                    
                    <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200 mb-6">
                        <div className="mb-6">
                            <p className="text-lg mb-4 text-slate-700">
                                Zeichne den Graphen der folgenden Funktion in ein Koordinatensystem auf einem Blatt Papier. 
                                Erstelle dazu eine Wertetabelle für den x-Bereich von -5 bis 5 mit einer Schrittweite von 0,5.
                            </p>
                            <div className="text-3xl font-mono text-center bg-blue-50 p-6 rounded-lg border-2 border-blue-400 text-blue-700 font-bold">
                                {equation}
                            </div>
                        </div>

                        <div className="flex gap-4 justify-center flex-wrap mb-8">
                            <button 
                                onClick={generateNewTask}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-md"
                            >
                                Neue Aufgabe
                            </button>
                            <button 
                                onClick={showSolutionHandler}
                                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors shadow-md"
                            >
                                Lösung (Graph & Tabelle) anzeigen
                            </button>
                            <a 
                                href={VIDEO_URL} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition-colors shadow-md"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                                </svg>
                                Erklärvideo
                            </a>
                        </div>

                        {showSolution && (
                            <div className="grid lg:grid-cols-3 gap-6 animate-fade-in">
                                <div className="lg:col-span-2">
                                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                                        <p className="text-lg font-bold text-slate-700 mb-4">Graph der Funktion:</p>
                                        <div 
                                            id="ggb-graph-zeichnen"
                                            className="w-full bg-white rounded-lg border border-slate-200"
                                            style={{ minHeight: '500px' }}
                                        ></div>
                                    </div>
                                </div>
                                <div className="lg:col-span-1">
                                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 max-h-[500px] overflow-y-auto">
                                        <p className="text-lg font-bold text-slate-700 mb-4">Wertetabelle:</p>
                                        <table className="w-full text-center border-collapse text-sm">
                                            <thead className="bg-blue-100 sticky top-0">
                                                <tr>
                                                    <th className="p-2 border border-slate-300 font-semibold">x</th>
                                                    <th className="p-2 border border-slate-300 font-semibold">y</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {tableData.map((row, index) => (
                                                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-100'}>
                                                        <td className="p-2 border border-slate-300">{row.x}</td>
                                                        <td className="p-2 border border-slate-300">{row.y}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GraphZeichnen;

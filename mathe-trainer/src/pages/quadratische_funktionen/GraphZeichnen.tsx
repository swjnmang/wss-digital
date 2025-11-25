import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import GeoGebraApplet from '../../components/GeoGebraApplet';

const GraphZeichnen = () => {
    const [equation, setEquation] = useState<string>('');
    const [params, setParams] = useState<{a: number, b: number, c: number} | null>(null);
    const [showSolution, setShowSolution] = useState<boolean>(false);
    const [tableData, setTableData] = useState<{x: number, y: number}[]>([]);
    
    const appletRef = useRef<any>(null);

    const VIDEO_URL = "https://www.youtube.com/watch?v=jUJ9rB0XVy4";

    const formatNumber = (num: number) => Math.round(num * 100) / 100;
    const randomInt = (max: number, min: number = 0) => Math.floor(Math.random() * (max - min + 1)) + min;
    const randomHalfInt = (max: number, min: number) => randomInt(max * 2, min * 2) / 2;

    const generateNewTask = () => {
        setShowSolution(false);
        setTableData([]);
        
        if (appletRef.current) {
            appletRef.current.reset();
        }

        let a = randomHalfInt(3, -3);
        while (Math.abs(a) < 0.2) { // Ensure 'a' is not too close to zero
            a = randomHalfInt(3, -3);
        }
        
        const b = randomHalfInt(3, -3);
        const c = randomHalfInt(3, -3);

        setParams({ a, b, c });

        // Build the display string
        const a_str = (a === 1) ? "x²" : (a === -1) ? "-x²" : `${a}x²`;
        const b_str = (b === 1) ? " + x" : (b === -1) ? " - x" : (b > 0) ? ` + ${b}x` : (b < 0) ? ` - ${Math.abs(b)}x` : "";
        const c_str = (c > 0) ? ` + ${c}` : (c < 0) ? ` - ${Math.abs(c)}` : "";
        
        setEquation(`y = ${a_str}${b_str}${c_str}`);
    };

    const handleAppletReady = (api: any) => {
        appletRef.current = api;
    };

    useEffect(() => {
        generateNewTask();
    }, []);

    const showSolutionHandler = () => {
        if (!params) return;
        
        setShowSolution(true);

        if (appletRef.current) {
            const ggbEquation = `f(x) = ${params.a}*x^2 + ${params.b}*x + ${params.c}`;
            appletRef.current.evalCommand(ggbEquation);
        }

        const newTableData = [];
        for (let x = -5; x <= 5; x += 0.5) {
            const y = params.a * x * x + params.b * x + params.c;
            newTableData.push({ x, y: formatNumber(y) });
        }
        setTableData(newTableData);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <Link to="/quadratische_funktionen" className="text-blue-600 hover:underline mb-4 inline-block">&larr; Zurück zur Übersicht</Link>
            
            <h1 className="text-3xl font-bold mb-6">Parabeln zeichnen (Allgemeine Form)</h1>
            
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <div className="mb-6">
                    <p className="text-lg mb-4">
                        Zeichne den Graphen der folgenden Funktion in ein Koordinatensystem auf einem Blatt Papier. 
                        Erstelle dazu eine Wertetabelle für den x-Bereich von -5 bis 5 mit einer Schrittweite von 0,5.
                    </p>
                    <div className="text-3xl font-mono text-center bg-gray-50 p-6 rounded text-blue-800 font-bold">
                        {equation}
                    </div>
                </div>

                <div className="flex gap-4 justify-center flex-wrap mb-8">
                    <button 
                        onClick={generateNewTask}
                        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                    >
                        Neue Aufgabe
                    </button>
                    <button 
                        onClick={showSolutionHandler}
                        className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
                    >
                        Lösung (Graph & Tabelle) anzeigen
                    </button>
                    <a 
                        href={VIDEO_URL} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 flex items-center gap-2"
                    >
                        Erklärvideo
                    </a>
                </div>

                {showSolution && (
                    <div className="flex flex-col lg:flex-row gap-6 animate-fade-in">
                        <div className="flex-grow lg:w-2/3 h-[500px] border rounded overflow-hidden">
                            <GeoGebraApplet 
                                id="graph-zeichnen-applet"
                                onAppletReady={handleAppletReady}
                                showToolbar={false}
                                showAlgebraInput={false}
                                showMenuBar={false}
                            />
                        </div>
                        <div className="lg:w-1/3 max-h-[500px] overflow-y-auto border rounded">
                            <table className="w-full text-center border-collapse">
                                <thead className="bg-gray-100 sticky top-0">
                                    <tr>
                                        <th className="p-2 border">x</th>
                                        <th className="p-2 border">y</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tableData.map((row, index) => (
                                        <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                            <td className="p-2 border">{row.x}</td>
                                            <td className="p-2 border">{row.y}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GraphZeichnen;

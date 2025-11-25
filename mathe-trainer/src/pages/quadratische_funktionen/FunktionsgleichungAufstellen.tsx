import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const FunktionsgleichungAufstellen = () => {
    const [taskType, setTaskType] = useState<'vertex' | 'points_and_factor'>('vertex');
    const [taskData, setTaskData] = useState<any>(null);
    const [currentSolution, setCurrentSolution] = useState<{a: number, b: number, c: number} | null>(null);
    const [solutionText, setSolutionText] = useState<JSX.Element | null>(null);
    
    const [userA, setUserA] = useState<string>('');
    const [userB, setUserB] = useState<string>('');
    const [userC, setUserC] = useState<string>('');
    const [feedback, setFeedback] = useState<{text: string, type: 'success' | 'error'} | null>(null);
    const [showSolution, setShowSolution] = useState<boolean>(false);

    const getRandomInt = (min: number, max: number) => {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    const formatNumber = (num: number) => {
        if (Number.isInteger(num)) {
            return num.toString();
        } else {
            return num.toFixed(2).replace(/\.00$/, '').replace(/\.0$/, '');
        }
    };

    const calculateY = (a: number, b: number, c: number, x: number) => {
        return a * x * x + b * x + c;
    };

    const formatQuadraticFunction = (a: number, b: number, c: number) => {
        let formula = "";
        
        if (a !== 0) {
            if (a < 0) formula = "-";
            if (Math.abs(a) !== 1) formula += formatNumber(Math.abs(a));
            formula += "x²";
        }
        
        if (b !== 0) {
            if (formula === "") {
                if (b < 0) formula = "-";
            } else {
                formula += b < 0 ? " - " : " + ";
            }
            if (Math.abs(b) !== 1) formula += formatNumber(Math.abs(b));
            formula += "x";
        }
        
        if (c !== 0) {
            if (formula === "") {
                formula = formatNumber(c);
            } else {
                formula += c < 0 ? " - " : " + ";
                formula += formatNumber(Math.abs(c));
            }
        } else if (formula === "") {
            formula = "0";
        }
        
        return formula;
    };

    const generateTask = () => {
        setUserA('');
        setUserB('');
        setUserC('');
        setFeedback(null);
        setShowSolution(false);

        const type = Math.random() < 0.5 ? 'vertex' : 'points_and_factor';
        setTaskType(type);

        if (type === 'vertex') {
            generateVertexTask();
        } else {
            generatePointsAndFactorTask();
        }
    };

    const generateVertexTask = () => {
        const h = getRandomInt(-5, 5);
        const k = getRandomInt(-5, 5);
        
        let a = getRandomInt(-3, 3);
        if (a === 0) a = 1;
        
        const b = -2 * a * h;
        const c = a * h * h + k;
        
        let x2;
        do {
            x2 = getRandomInt(-5, 5);
        } while (x2 === h);
        
        const y2 = calculateY(a, b, c, x2);

        setCurrentSolution({ a, b, c });
        setTaskData({
            type: 'vertex',
            S: { x: h, y: k },
            P: { x: x2, y: y2 }
        });

        setSolutionText(
            <div>
                <p>Wir stellen die Funktion zunächst in Scheitelpunktform auf:</p>
                <p className="font-mono">f(x) = a(x - {h})² + {k}</p>
                
                <p className="mt-2">Mit dem Punkt P({x2}|{formatNumber(y2)}) können wir a bestimmen:</p>
                <p className="font-mono">{formatNumber(y2)} = a({x2} - {h})² + {k}</p>
                <p className="font-mono">{formatNumber(y2)} - {k} = a · {Math.pow(x2 - h, 2)}</p>
                <p className="font-mono">{formatNumber(y2 - k)} = a · {Math.pow(x2 - h, 2)}</p>
                <p className="font-mono">a = {formatNumber(y2 - k)} / {Math.pow(x2 - h, 2)} = {formatNumber(a)}</p>
                
                <p className="mt-2">Damit haben wir die Scheitelpunktform:</p>
                <p className="font-mono">f(x) = {formatNumber(a)}(x - {h})² + {k}</p>
                
                <p className="mt-2">Umformen in die Normalform:</p>
                <p className="font-mono">f(x) = {formatNumber(a)}(x² - {2*h}x + {h*h}) + {k}</p>
                <p className="font-mono">f(x) = {formatNumber(a)}x² - {formatNumber(2*a*h)}x + {formatNumber(a*h*h)} + {k}</p>
                <p className="font-mono">f(x) = {formatNumber(a)}x² - {formatNumber(2*a*h)}x + {formatNumber(a*h*h + k)}</p>
                
                <p className="mt-4 font-bold">Die Koeffizienten der Normalform sind:</p>
                <p>a = {formatNumber(a)}</p>
                <p>b = {formatNumber(b)}</p>
                <p>c = {formatNumber(c)}</p>
            </div>
        );
    };

    const generatePointsAndFactorTask = () => {
        const knownCoefficient = ['a', 'b', 'c'][getRandomInt(0, 2)] as 'a' | 'b' | 'c';
        
        let x1 = getRandomInt(-5, 5);
        let x2;
        do {
            x2 = getRandomInt(-5, 5);
        } while (x2 === x1);
        
        let a = 0, b = 0, c = 0;

        if (knownCoefficient === 'a') {
            a = getRandomInt(-3, 3);
            if (a === 0) a = 1;
            b = getRandomInt(-5, 5);
            c = getRandomInt(-5, 5);
        } else if (knownCoefficient === 'b') {
            b = getRandomInt(-5, 5);
            a = getRandomInt(-3, 3);
            if (a === 0) a = 1;
            c = getRandomInt(-5, 5);
        } else {
            c = getRandomInt(-5, 5);
            a = getRandomInt(-3, 3);
            if (a === 0) a = 1;
            b = getRandomInt(-5, 5);
        }
        
        const y1 = calculateY(a, b, c, x1);
        const y2 = calculateY(a, b, c, x2);

        setCurrentSolution({ a, b, c });
        setTaskData({
            type: 'points_and_factor',
            P: { x: x1, y: y1 },
            Q: { x: x2, y: y2 },
            known: { coeff: knownCoefficient, val: knownCoefficient === 'a' ? a : knownCoefficient === 'b' ? b : c }
        });

        let solText;
        if (knownCoefficient === 'a') {
            solText = (
                <div>
                    <p>Wir wissen bereits a = {formatNumber(a)}</p>
                    <p>Wir setzen die Punkte in die Funktionsgleichung ein:</p>
                    <p className="font-mono">P({x1}|{formatNumber(y1)}): {formatNumber(y1)} = {formatNumber(a)} · {x1}² + b · {x1} + c</p>
                    <p className="font-mono">Q({x2}|{formatNumber(y2)}): {formatNumber(y2)} = {formatNumber(a)} · {x2}² + b · {x2} + c</p>
                    {/* Simplified solution steps for brevity, focusing on result */}
                    <p className="mt-2">Löse das Gleichungssystem für b und c.</p>
                </div>
            );
        } else if (knownCoefficient === 'b') {
            solText = (
                <div>
                    <p>Wir wissen bereits b = {formatNumber(b)}</p>
                    <p>Wir setzen die Punkte in die Funktionsgleichung ein:</p>
                    <p className="font-mono">P({x1}|{formatNumber(y1)}): {formatNumber(y1)} = a · {x1}² + {formatNumber(b)} · {x1} + c</p>
                    <p className="font-mono">Q({x2}|{formatNumber(y2)}): {formatNumber(y2)} = a · {x2}² + {formatNumber(b)} · {x2} + c</p>
                    <p className="mt-2">Löse das Gleichungssystem für a und c.</p>
                </div>
            );
        } else {
            solText = (
                <div>
                    <p>Wir wissen bereits c = {formatNumber(c)}</p>
                    <p>Wir setzen die Punkte in die Funktionsgleichung ein:</p>
                    <p className="font-mono">P({x1}|{formatNumber(y1)}): {formatNumber(y1)} = a · {x1}² + b · {x1} + {formatNumber(c)}</p>
                    <p className="font-mono">Q({x2}|{formatNumber(y2)}): {formatNumber(y2)} = a · {x2}² + b · {x2} + {formatNumber(c)}</p>
                    <p className="mt-2">Löse das Gleichungssystem für a und b.</p>
                </div>
            );
        }

        setSolutionText(
            <div>
                {solText}
                <p className="mt-4 font-bold">Die Koeffizienten der Normalform sind:</p>
                <p>a = {formatNumber(a)}</p>
                <p>b = {formatNumber(b)}</p>
                <p>c = {formatNumber(c)}</p>
                <p className="mt-2">Die Funktionsgleichung lautet also:</p>
                <p className="font-mono">f(x) = {formatQuadraticFunction(a, b, c)}</p>
            </div>
        );
    };

    useEffect(() => {
        generateTask();
    }, []);

    const checkAnswer = () => {
        if (!currentSolution) return;

        const aVal = parseFloat(userA);
        const bVal = parseFloat(userB);
        const cVal = parseFloat(userC);

        if (isNaN(aVal) || isNaN(bVal) || isNaN(cVal)) {
            setFeedback({ text: "Bitte gib Werte für a, b und c ein.", type: 'error' });
            return;
        }

        const tolerance = 0.01;
        const isCorrect = 
            Math.abs(aVal - currentSolution.a) < tolerance &&
            Math.abs(bVal - currentSolution.b) < tolerance &&
            Math.abs(cVal - currentSolution.c) < tolerance;

        if (isCorrect) {
            setFeedback({ text: "Richtig! Deine Antwort ist korrekt.", type: 'success' });
        } else {
            setFeedback({ text: "Leider nicht korrekt. Versuche es noch einmal oder schaue dir die Lösung an.", type: 'error' });
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <Link to="/quadratische_funktionen" className="text-blue-600 hover:underline mb-4 inline-block">&larr; Zurück zur Übersicht</Link>
            
            <h1 className="text-3xl font-bold mb-6">Funktionsgleichung aufstellen</h1>
            
            <div className="bg-white p-6 rounded-lg shadow-md mb-6 max-w-3xl mx-auto">
                <div className="mb-6 border-l-4 border-green-500 pl-4 bg-green-50 p-4 rounded">
                    <h2 className="font-bold text-lg mb-2">Aufgabe</h2>
                    {taskData && taskData.type === 'vertex' && (
                        <div>
                            <p>Bestimme die Funktionsgleichung einer quadratischen Funktion f(x) = ax² + bx + c mit:</p>
                            <ul className="list-disc pl-5 mt-2">
                                <li>Scheitelpunkt S({taskData.S.x}|{taskData.S.y})</li>
                                <li>Die Funktion geht durch den Punkt P({taskData.P.x}|{formatNumber(taskData.P.y)})</li>
                            </ul>
                        </div>
                    )}
                    {taskData && taskData.type === 'points_and_factor' && (
                        <div>
                            <p>Bestimme die Funktionsgleichung einer quadratischen Funktion f(x) = ax² + bx + c mit:</p>
                            <ul className="list-disc pl-5 mt-2">
                                <li>Die Funktion geht durch die Punkte P({taskData.P.x}|{formatNumber(taskData.P.y)}) und Q({taskData.Q.x}|{formatNumber(taskData.Q.y)})</li>
                                <li>{taskData.known.coeff} = {formatNumber(taskData.known.val)}</li>
                            </ul>
                        </div>
                    )}
                </div>

                <div className="mb-6 bg-blue-50 p-6 rounded-lg">
                    <h3 className="font-bold mb-4">Deine Antwort</h3>
                    <p className="mb-4">Gib die Koeffizienten der quadratischen Funktion f(x) = ax² + bx + c ein:</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center gap-2">
                            <label className="font-bold">a =</label>
                            <input 
                                type="number" 
                                step="0.01"
                                value={userA}
                                onChange={(e) => setUserA(e.target.value)}
                                className="w-full p-2 border rounded"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <label className="font-bold">b =</label>
                            <input 
                                type="number" 
                                step="0.01"
                                value={userB}
                                onChange={(e) => setUserB(e.target.value)}
                                className="w-full p-2 border rounded"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <label className="font-bold">c =</label>
                            <input 
                                type="number" 
                                step="0.01"
                                value={userC}
                                onChange={(e) => setUserC(e.target.value)}
                                className="w-full p-2 border rounded"
                            />
                        </div>
                    </div>
                    
                    <button 
                        onClick={checkAnswer}
                        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 w-full sm:w-auto"
                    >
                        Überprüfen
                    </button>

                    {feedback && (
                        <div className={`mt-4 p-3 rounded font-bold ${feedback.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {feedback.text}
                        </div>
                    )}
                </div>

                <div className="flex gap-4 justify-center mb-6">
                    <button 
                        onClick={generateTask}
                        className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
                    >
                        Neue Aufgabe
                    </button>
                    <button 
                        onClick={() => setShowSolution(!showSolution)}
                        className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700"
                    >
                        {showSolution ? 'Lösung verbergen' : 'Lösung anzeigen'}
                    </button>
                </div>

                {showSolution && solutionText && (
                    <div className="border-l-4 border-blue-500 pl-4 bg-blue-50 p-4 rounded animate-fade-in">
                        <h3 className="font-bold text-lg mb-2">Lösung</h3>
                        {solutionText}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FunktionsgleichungAufstellen;

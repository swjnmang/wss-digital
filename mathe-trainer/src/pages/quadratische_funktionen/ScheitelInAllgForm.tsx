import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const ScheitelInAllgForm = () => {
    const [scheitelformWerte, setScheitelformWerte] = useState<{a: number, xs: number, ys: number} | null>(null);
    const [korrekteWerte, setKorrekteWerte] = useState<{a: number, b: number, c: number} | null>(null);
    const [equation, setEquation] = useState<string>('');
    
    const [userA, setUserA] = useState<string>('');
    const [userB, setUserB] = useState<string>('');
    const [userC, setUserC] = useState<string>('');
    const [feedback, setFeedback] = useState<{text: string, type: 'success' | 'error'} | null>(null);
    const [showSolution, setShowSolution] = useState<boolean>(false);

    const generiereZufallszahl = (min: number, max: number) => {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    const neueAufgabe = () => {
        let a = generiereZufallszahl(2, 5) * (Math.random() < 0.5 ? 1 : -1);
        if ([-1, 0, 1].includes(a)) a = 2;
        
        const xs = generiereZufallszahl(-5, 5);
        const ys = generiereZufallszahl(-10, 10);
        
        const xs_text = xs === 0 ? "" : (xs > 0 ? ` - ${xs}` : ` + ${-xs}`);
        const ys_text = ys === 0 ? "" : (ys > 0 ? ` + ${ys}` : ` - ${-ys}`);
        const newEquation = `y = ${a}(x${xs_text})²${ys_text}`;

        const b = -2 * a * xs;
        const c = a * xs * xs + ys;

        setScheitelformWerte({ a, xs, ys });
        setKorrekteWerte({ a, b, c });
        setEquation(newEquation);
        
        setUserA('');
        setUserB('');
        setUserC('');
        setFeedback(null);
        setShowSolution(false);
    };

    useEffect(() => {
        neueAufgabe();
    }, []);

    const pruefeLoesung = () => {
        if (!korrekteWerte) return;

        const a_user = parseFloat(userA);
        const b_user = parseFloat(userB);
        const c_user = parseFloat(userC);

        if (a_user === korrekteWerte.a && b_user === korrekteWerte.b && c_user === korrekteWerte.c) {
            setFeedback({ text: "Super, alles richtig! ✅", type: 'success' });
        } else {
            setFeedback({ text: "Leider nicht ganz richtig. Versuche es erneut! ❌", type: 'error' });
        }
    };

    const formatSign = (num: number) => num >= 0 ? `+ ${num}` : `- ${Math.abs(num)}`;

    return (
        <div className="container mx-auto px-4 py-8">
            <Link to="/quadratische_funktionen" className="text-blue-600 hover:underline mb-4 inline-block">&larr; Zurück zur Übersicht</Link>
            
            <div className="bg-white p-8 rounded-xl shadow-lg max-w-2xl w-full mx-auto">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Aufgabengenerator</h1>
                <p className="text-gray-600 mb-6">Übe die Umformung von der Scheitelform zur allgemeinen Form.</p>

                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-md mb-6">
                    <h2 className="font-semibold text-gray-700">Gegebene Scheitelform:</h2>
                    <p className="text-xl font-mono tracking-wider mt-2 text-blue-900">{equation}</p>
                </div>

                <div className="mb-6">
                    <h2 className="font-semibold text-gray-700 mb-3">Deine Lösung für: <span className="font-mono">y = ax² + bx + c</span></h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="flex items-center space-x-2">
                            <label htmlFor="a-input" className="text-lg font-medium text-gray-600">a =</label>
                            <input 
                                type="number" 
                                id="a-input" 
                                value={userA}
                                onChange={(e) => setUserA(e.target.value)}
                                className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <label htmlFor="b-input" className="text-lg font-medium text-gray-600">b =</label>
                            <input 
                                type="number" 
                                id="b-input" 
                                value={userB}
                                onChange={(e) => setUserB(e.target.value)}
                                className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <label htmlFor="c-input" className="text-lg font-medium text-gray-600">c =</label>
                            <input 
                                type="number" 
                                id="c-input" 
                                value={userC}
                                onChange={(e) => setUserC(e.target.value)}
                                className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>
                </div>
                
                {feedback && (
                    <div className={`h-8 mb-4 text-center font-semibold text-lg ${feedback.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                        {feedback.text}
                    </div>
                )}

                <div className="flex flex-wrap gap-4 justify-center">
                    <button onClick={pruefeLoesung} className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors duration-200">Lösung prüfen</button>
                    <button onClick={neueAufgabe} className="bg-gray-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-gray-700 transition-colors duration-200">Neue Aufgabe</button>
                    <button onClick={() => setShowSolution(true)} className="bg-gray-200 text-gray-800 font-bold py-2 px-6 rounded-lg hover:bg-gray-300 transition-colors duration-200">Lösung anzeigen</button>
                </div>

                {showSolution && scheitelformWerte && korrekteWerte && (
                    <div className="mt-8 p-6 bg-gray-50 rounded-lg border border-gray-200 animate-fade-in">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Musterlösung</h3>
                        <div className="space-y-2 text-gray-700">
                            <p className="font-semibold"><strong>Ausgangsgleichung:</strong> <span className="font-mono">{equation}</span></p>
                            <div className="mt-4 border-t pt-4">
                                <p><strong>1. Klammer auflösen:</strong> <span className="font-mono">(x {scheitelformWerte.xs >= 0 ? '-' : '+'} {Math.abs(scheitelformWerte.xs)})² = x² {formatSign(-2 * scheitelformWerte.xs)}x {formatSign(scheitelformWerte.xs * scheitelformWerte.xs)}</span></p>
                                <p className="pl-4 text-sm text-gray-500">Dies geschieht durch Multiplikation: (x {scheitelformWerte.xs >= 0 ? '-' : '+'} {Math.abs(scheitelformWerte.xs)}) * (x {scheitelformWerte.xs >= 0 ? '-' : '+'} {Math.abs(scheitelformWerte.xs)})</p>
                            </div>
                            <div className="mt-4 border-t pt-4">
                                <p><strong>2. Den Faktor {scheitelformWerte.a} multiplizieren:</strong></p>
                                <p className="pl-4 font-mono">y = {scheitelformWerte.a} * (x² {formatSign(-2 * scheitelformWerte.xs)}x {formatSign(scheitelformWerte.xs * scheitelformWerte.xs)}) {formatSign(scheitelformWerte.ys)}</p>
                                <p className="pl-4 font-mono">y = {scheitelformWerte.a}x² {formatSign(scheitelformWerte.a * -2 * scheitelformWerte.xs)}x {formatSign(scheitelformWerte.a * scheitelformWerte.xs * scheitelformWerte.xs)} {formatSign(scheitelformWerte.ys)}</p>
                            </div>
                            <div className="mt-4 border-t pt-4">
                                <p><strong>3. Konstanten zusammenfassen:</strong></p>
                                <p className="pl-4 font-mono">y = {korrekteWerte.a}x² {formatSign(korrekteWerte.b)}x {formatSign(korrekteWerte.c)}</p>
                            </div>
                            <div className="mt-6 p-3 bg-blue-100 rounded-md text-center">
                                <p className="font-bold">Ergebnis: a = {korrekteWerte.a}, b = {korrekteWerte.b}, c = {korrekteWerte.c}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ScheitelInAllgForm;

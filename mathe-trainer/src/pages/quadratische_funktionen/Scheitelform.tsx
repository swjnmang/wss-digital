import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import GeoGebraApplet from '../../components/GeoGebraApplet';

const Scheitelform = () => {
    const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
    const [correctA, setCorrectA] = useState<number>(0);
    const [correctXs, setCorrectXs] = useState<number>(0);
    const [correctYs, setCorrectYs] = useState<number>(0);
    const [solutionSteps, setSolutionSteps] = useState<JSX.Element | null>(null);
    
    const [userA, setUserA] = useState<string>('');
    const [userXs, setUserXs] = useState<string>('');
    const [userYs, setUserYs] = useState<string>('');
    const [feedback, setFeedback] = useState<string>('');
    const [isCorrect, setIsCorrect] = useState<boolean>(false);
    const [showSolution, setShowSolution] = useState<boolean>(false);

    const appletRef = useRef<any>(null);

    const formatNumber = (num: number) => Math.round(num * 100) / 100;
    const randomInt = (max: number, min: number = 0) => Math.floor(Math.random() * (max - min + 1)) + min;
    const randomChoice = (arr: number[]) => arr[Math.floor(Math.random() * arr.length)];

    const generateNewTask = (level: 'easy' | 'medium' | 'hard') => {
        if (!appletRef.current) return;

        // Reset UI
        setFeedback('');
        setUserA('');
        setUserXs('');
        setUserYs('');
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

        const api = appletRef.current;
        api.reset();
        api.evalCommand(`f(x) = ${newCorrectA}*(x - (${newCorrectXs}))^2 + (${newCorrectYs})`);
        api.evalCommand(`S=(${newCorrectXs}, ${newCorrectYs})`);
        api.setColor('S', 255, 0, 0);
        api.setLabelVisible('S', true);

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
                <p><strong>1. Scheitelpunkt S($x_s$|$y_s$) ablesen:</strong></p>
                <p>Der Scheitelpunkt liegt bei S({newCorrectXs}|{newCorrectYs}).</p>
                <p>Daraus folgt: $x_s = {newCorrectXs}$ und $y_s = {newCorrectYs}$.</p>
                <br />
                <p><strong>2. Formfaktor a bestimmen:</strong></p>
                <p>Der Formfaktor war mit <strong>a = {newCorrectA}</strong> gegeben.</p>
                <br />
                <p><strong>3. Werte in die Lösungsmaske eintragen:</strong></p>
                <ul className="list-disc pl-5">
                    <li>Der Wert für <strong>a</strong> ist {newCorrectA}.</li>
                    <li>In der Klammer (x...) wird das Vorzeichen von $x_s$ umgedreht: -({newCorrectXs}) = {xsTermForInput}. Du gibst also <strong>{xsTermForInput > 0 ? '+' : ''}{xsTermForInput}</strong> ein.</li>
                    <li>Der letzte Wert ist $y_s$ direkt: Du gibst also <strong>{ysTermForInput > 0 ? '+' : ''}{ysTermForInput}</strong> ein.</li>
                </ul>
                <br />
                <p><strong>Finale Gleichung:</strong></p>
                <p className="font-mono text-lg">{finalEquationString}</p>
            </div>
        );
    };

    const handleAppletReady = (api: any) => {
        appletRef.current = api;
        generateNewTask(difficulty);
    };

    useEffect(() => {
        if (appletRef.current) {
            generateNewTask(difficulty);
        }
    }, [difficulty]);

    const checkSolution = () => {
        if (userA === '' || userXs === '' || userYs === '') {
            setFeedback('Bitte fülle alle drei Felder aus.');
            setIsCorrect(false);
            return;
        }

        const aVal = parseFloat(userA.replace(',', '.'));
        const xsVal = parseFloat(userXs.replace(',', '.'));
        const ysVal = parseFloat(userYs.replace(',', '.'));

        const correctXsForInput = formatNumber(-correctXs);
        const correctYsForInput = correctYs;

        const isACorrect = Math.abs(aVal - correctA) < 0.01;
        const isXsCorrect = Math.abs(xsVal - correctXsForInput) < 0.01;
        const isYsCorrect = Math.abs(ysVal - correctYsForInput) < 0.01;

        if (isACorrect && isXsCorrect && isYsCorrect) {
            setFeedback('Richtig! Ausgezeichnet!');
            setIsCorrect(true);
        } else {
            setFeedback('Leider nicht ganz richtig. Überprüfe deine Werte und Vorzeichen!');
            setIsCorrect(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <Link to="/quadratische_funktionen" className="text-blue-600 hover:underline mb-4 inline-block">&larr; Zurück zur Übersicht</Link>
            
            <h1 className="text-3xl font-bold mb-6">Scheitelform aus Graph ablesen</h1>
            
            <div className="mb-6">
                <div className="flex gap-2 mb-4 justify-center">
                    <button 
                        onClick={() => setDifficulty('easy')}
                        className={`px-4 py-2 rounded ${difficulty === 'easy' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                    >
                        Leicht
                    </button>
                    <button 
                        onClick={() => setDifficulty('medium')}
                        className={`px-4 py-2 rounded ${difficulty === 'medium' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                    >
                        Mittel
                    </button>
                    <button 
                        onClick={() => setDifficulty('hard')}
                        className={`px-4 py-2 rounded ${difficulty === 'hard' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                    >
                        Schwer
                    </button>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md mb-6 max-w-4xl mx-auto">
                    <div className="mb-6 h-[500px] border rounded">
                        <GeoGebraApplet 
                            id="scheitelform-applet"
                            onAppletReady={handleAppletReady}
                            showToolbar={false}
                            showAlgebraInput={false}
                            showMenuBar={false}
                        />
                    </div>

                    <p className="text-lg mb-4 text-center">
                        Ergänze alle fehlende Werte, um die Funktionsgleichung in Scheitelform ($y = a(x-x_s)²+y_s$) darzustellen. <br/>
                        Der Formfaktor ist <strong>a = {correctA}</strong>.
                    </p>

                    <div className="flex items-center justify-center gap-2 mb-6 text-xl font-mono flex-wrap">
                        <span>y = </span>
                        <input
                            type="text"
                            value={userA}
                            onChange={(e) => setUserA(e.target.value)}
                            placeholder="a"
                            className="w-16 p-2 border rounded text-center"
                        />
                        <span>(x </span>
                        <input
                            type="text"
                            value={userXs}
                            onChange={(e) => setUserXs(e.target.value)}
                            placeholder=""
                            className="w-16 p-2 border rounded text-center"
                        />
                        <span>)² </span>
                        <input
                            type="text"
                            value={userYs}
                            onChange={(e) => setUserYs(e.target.value)}
                            placeholder=""
                            className="w-16 p-2 border rounded text-center"
                        />
                    </div>

                    <div className="flex gap-4 justify-center">
                        <button 
                            onClick={checkSolution}
                            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
                        >
                            Lösung prüfen
                        </button>
                        <button 
                            onClick={() => generateNewTask(difficulty)}
                            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                        >
                            Neue Aufgabe
                        </button>
                    </div>

                    {feedback && (
                        <div className={`mt-4 text-center font-bold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                            {feedback}
                        </div>
                    )}

                    {!isCorrect && feedback && (
                        <div className="mt-4 text-center">
                            <button 
                                onClick={() => setShowSolution(true)}
                                className="text-blue-600 hover:underline"
                            >
                                Lösung anzeigen
                            </button>
                        </div>
                    )}
                </div>

                {showSolution && solutionSteps && (
                    <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 max-w-4xl mx-auto">
                        <h3 className="font-bold text-lg mb-4">Lösungsweg:</h3>
                        {solutionSteps}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Scheitelform;

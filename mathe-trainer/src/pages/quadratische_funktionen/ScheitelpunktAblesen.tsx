import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const ScheitelpunktAblesen = () => {
    const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
    const [taskType, setTaskType] = useState<'general_form' | 'vertex_form'>('general_form');
    const [equation, setEquation] = useState<string>('');
    const [correctXs, setCorrectXs] = useState<number>(0);
    const [correctYs, setCorrectYs] = useState<number>(0);
    const [solutionSteps, setSolutionSteps] = useState<JSX.Element | null>(null);
    
    const [userXs, setUserXs] = useState<string>('');
    const [userYs, setUserYs] = useState<string>('');
    const [feedback, setFeedback] = useState<string>('');
    const [isCorrect, setIsCorrect] = useState<boolean>(false);
    const [showSolution, setShowSolution] = useState<boolean>(false);

    const VIDEO_URL = "https://www.youtube.com/watch?v=VgsmYGAI-_8&list=PLI8kX0XEfSugainT6dHh9wGTGikzJ76d2&index=6";

    const formatNumber = (num: number) => Math.round(num * 100) / 100;

    const randomInt = (max: number, min: number = 0) => Math.floor(Math.random() * (max - min + 1)) + min;
    const randomChoice = (arr: number[]) => arr[Math.floor(Math.random() * arr.length)];

    const generateNewTask = (level: 'easy' | 'medium' | 'hard') => {
        // Reset UI
        setFeedback('');
        setUserXs('');
        setUserYs('');
        setShowSolution(false);
        setIsCorrect(false);

        const newType = Math.random() < 0.5 ? 'general_form' : 'vertex_form';
        setTaskType(newType);

        let a = 1, b = 0, c = 0;
        let xs = 0, ys = 0;
        let newCorrectXs = 0;
        let newCorrectYs = 0;
        let newEquation = '';
        let newSolutionSteps: JSX.Element | null = null;

        if (newType === 'general_form') {
            switch (level) {
                case 'medium':
                    a = randomChoice([-2, -1.5, -0.5, 0.5, 1.5, 2]);
                    b = randomInt(8, -8) / 2;
                    c = randomInt(10, -10) / 2;
                    break;
                case 'hard':
                    a = randomChoice([-0.75, -0.25, 0.25, 0.75, randomInt(3, -3)]);
                    b = randomInt(12, -12) / 3;
                    c = randomInt(15, -15) / 4;
                    break;
                case 'easy':
                default:
                    a = randomChoice([1, -1, 2, -2]);
                    b = randomInt(6, -6);
                    c = randomInt(10, -10);
                    break;
            }
            if (a === 0) a = 1;

            a = formatNumber(a); b = formatNumber(b); c = formatNumber(c);

            newCorrectXs = formatNumber(-b / (2 * a));
            newCorrectYs = formatNumber(a * newCorrectXs * newCorrectXs + b * newCorrectXs + c);

            const b_str = (b === 0) ? "" : (b > 0) ? ` + ${b}x` : ` - ${Math.abs(b)}x`;
            const c_str = (c === 0) ? "" : (c > 0) ? ` + ${c}` : ` - ${Math.abs(c)}`;
            newEquation = `y = ${a}x²${b_str}${c_str}`;

            newSolutionSteps = (
                <div>
                    <p><strong>1. x-Koordinate des Scheitelpunkts ($x_s$) berechnen:</strong></p>
                    <p>Formel: $x_s = -b / (2a)$</p>
                    <p>$x_s = -({b}) / (2 \cdot {a})$</p>
                    <p>$x_s = {newCorrectXs}$</p>
                    <br />
                    <p><strong>2. y-Koordinate des Scheitelpunkts ($y_s$) berechnen:</strong></p>
                    <p>Setze $x_s$ in die Funktionsgleichung ein.</p>
                    <p>$y_s = {a}({newCorrectXs})² + {b}({newCorrectXs}) + {c}$</p>
                    <p>$y_s = {newCorrectYs}$</p>
                    <br />
                    <p><strong>Scheitelpunkt: S({newCorrectXs}|{newCorrectYs})</strong></p>
                </div>
            );

        } else { // vertex_form
            switch (level) {
                case 'medium':
                    a = randomChoice([-2, -1.5, -0.5, 0.5, 1.5, 2]);
                    xs = randomInt(8, -8) / 2;
                    ys = randomInt(8, -8) / 2;
                    break;
                case 'hard':
                    a = randomChoice([-0.75, -0.25, 0.25, 0.75, randomInt(3, -3)]);
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
            if (a === 0) a = 1;

            a = formatNumber(a);
            newCorrectXs = formatNumber(xs);
            newCorrectYs = formatNumber(ys);

            const xs_str = (newCorrectXs >= 0) ? ` - ${newCorrectXs}` : ` + ${Math.abs(newCorrectXs)}`;
            const ys_str = (newCorrectYs >= 0) ? ` + ${newCorrectYs}` : ` - ${Math.abs(newCorrectYs)}`;
            newEquation = `y = ${a}(x${xs_str})²${ys_str}`;

            newSolutionSteps = (
                <div>
                    <p><strong>1. x-Koordinate des Scheitelpunkts ($x_s$) ablesen:</strong></p>
                    <p>In der Form $y = a(x - x_s)² + y_s$ wird das Vorzeichen von $x_s$ umgedreht.</p>
                    <p>Aus der Gleichung liest man {xs_str} ab, also ist $x_s = {newCorrectXs}$.</p>
                    <br />
                    <p><strong>2. y-Koordinate des Scheitelpunkts ($y_s$) ablesen:</strong></p>
                    <p>Der Wert $y_s$ wird direkt abgelesen.</p>
                    <p>Aus der Gleichung liest man {ys_str} ab, also ist $y_s = {newCorrectYs}$.</p>
                    <br />
                    <p><strong>Scheitelpunkt: S({newCorrectXs}|{newCorrectYs})</strong></p>
                </div>
            );
        }

        setCorrectXs(newCorrectXs);
        setCorrectYs(newCorrectYs);
        setEquation(newEquation);
        setSolutionSteps(newSolutionSteps);
    };

    useEffect(() => {
        generateNewTask(difficulty);
    }, [difficulty]);

    const checkSolution = () => {
        if (userXs === '' || userYs === '') {
            setFeedback('Bitte fülle beide Felder (xs und ys) aus.');
            setIsCorrect(false);
            return;
        }

        const xsVal = parseFloat(userXs.replace(',', '.'));
        const ysVal = parseFloat(userYs.replace(',', '.'));

        const isXsCorrect = Math.abs(xsVal - correctXs) < 0.01;
        const isYsCorrect = Math.abs(ysVal - correctYs) < 0.01;

        if (isXsCorrect && isYsCorrect) {
            setFeedback('Richtig! Ausgezeichnet!');
            setIsCorrect(true);
        } else {
            setFeedback('Leider nicht ganz richtig. Überprüfe die Koordinaten des Scheitelpunkts!');
            setIsCorrect(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <Link to="/quadratische_funktionen" className="text-blue-600 hover:underline mb-4 inline-block">&larr; Zurück zur Übersicht</Link>
            
            <h1 className="text-3xl font-bold mb-6">Scheitelpunkt bestimmen</h1>
            
            <div className="mb-6">
                <div className="flex gap-2 mb-4">
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

                <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                    <p className="text-lg mb-4">
                        {taskType === 'general_form' ? 'Berechne den Scheitelpunkt der Parabel:' : 'Lese den Scheitelpunkt der Parabel ab:'}
                    </p>
                    <div className="text-2xl font-mono text-center bg-gray-50 p-4 rounded mb-6">
                        {equation}
                    </div>

                    <div className="flex items-center justify-center gap-4 mb-6">
                        <span className="text-xl">S (</span>
                        <input
                            type="text"
                            value={userXs}
                            onChange={(e) => setUserXs(e.target.value)}
                            placeholder="xs"
                            className="w-20 p-2 border rounded text-center"
                        />
                        <span className="text-xl">|</span>
                        <input
                            type="text"
                            value={userYs}
                            onChange={(e) => setUserYs(e.target.value)}
                            placeholder="ys"
                            className="w-20 p-2 border rounded text-center"
                        />
                        <span className="text-xl">)</span>
                    </div>

                    <div className="flex gap-4 justify-center">
                        <button 
                            onClick={checkSolution}
                            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
                        >
                            Prüfen
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
                    <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                        <h3 className="font-bold text-lg mb-4">Lösungsweg:</h3>
                        {solutionSteps}
                    </div>
                )}
            </div>

            <div className="mt-8">
                <a 
                    href={VIDEO_URL} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                    </svg>
                    Erklärvideo ansehen
                </a>
            </div>
        </div>
    );
};

export default ScheitelpunktAblesen;

import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import GeoGebraApplet from '../../components/GeoGebraApplet';

const ScheitelformRechnerisch = () => {
    const [taskData, setTaskData] = useState<{S: {x: number, y: number}, P: {x: number, y: number}} | null>(null);
    const [correctValues, setCorrectValues] = useState<{a: number, xs: number, ys: number} | null>(null);
    const [solutionSteps, setSolutionSteps] = useState<JSX.Element | null>(null);
    
    const [userA, setUserA] = useState<string>('');
    const [userXs, setUserXs] = useState<string>('');
    const [userYs, setUserYs] = useState<string>('');
    const [feedback, setFeedback] = useState<string>('');
    const [isCorrect, setIsCorrect] = useState<boolean>(false);
    const [showSolution, setShowSolution] = useState<boolean>(false);
    const [streak, setStreak] = useState<number>(0);

    const appletRef = useRef<any>(null);
    const VIDEO_URL = "https://www.youtube.com/watch?v=xgiAK3rLCow&t";

    const formatNumber = (num: number) => Math.round(num * 100) / 100;
    const randomInt = (max: number, min: number = 0) => Math.floor(Math.random() * (max - min + 1)) + min;
    const randomChoice = (arr: number[]) => arr[Math.floor(Math.random() * arr.length)];

    const generateNewTask = () => {
        if (!appletRef.current) return;

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

        const api = appletRef.current;
        api.reset();
        api.evalCommand(`f(x) = ${a}*(x - (${xs}))^2 + ${ys}`);
        api.evalCommand(`S=(${xs}, ${ys})`);
        api.evalCommand(`P=(${px}, ${py})`);
        api.setLabelVisible('S', true);
        api.setLabelVisible('P', true);

        const viewMargin = 5;
        const xMin = xs - viewMargin;
        const xMax = xs + viewMargin;
        const yMin = ys - viewMargin;
        const yMax = ys + viewMargin;
        api.setCoordSystem(xMin, xMax, yMin, yMax);

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

    const handleAppletReady = (api: any) => {
        appletRef.current = api;
        generateNewTask();
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

    return (
        <div className="container mx-auto px-4 py-8">
            <Link to="/quadratische_funktionen" className="text-blue-600 hover:underline mb-4 inline-block">&larr; Zurück zur Übersicht</Link>
            
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Funktionsgleichung in Scheitelform bestimmen</h1>
                <div className="bg-white px-4 py-2 rounded shadow text-orange-500 font-bold">
                    Streak: {streak} 🔥
                </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md mb-6 max-w-4xl mx-auto">
                <div className="mb-6 h-[450px] w-full max-w-[450px] mx-auto border rounded overflow-hidden">
                    <GeoGebraApplet 
                        id="scheitelform-rechnerisch-applet"
                        onAppletReady={handleAppletReady}
                        showToolbar={false}
                        showAlgebraInput={false}
                        showMenuBar={false}
                    />
                </div>

                <div className="mb-6 text-center">
                    <p className="text-lg mb-2">
                        Bestimme die Funktionsgleichung der abgebildeten Parabel in Scheitelform ($y = a(x-x_s)²+y_s$). <br/>
                        Gegeben sind der Scheitelpunkt S und ein weiterer Punkt P.
                    </p>
                    {taskData && (
                        <div className="text-xl font-mono font-bold text-blue-800">
                            S({taskData.S.x}|{taskData.S.y}) und P({taskData.P.x}|{taskData.P.y})
                        </div>
                    )}
                </div>

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
                        placeholder="±xs"
                        className="w-16 p-2 border rounded text-center"
                    />
                    <span>)² </span>
                    <input
                        type="text"
                        value={userYs}
                        onChange={(e) => setUserYs(e.target.value)}
                        placeholder="±ys"
                        className="w-16 p-2 border rounded text-center"
                    />
                </div>

                <div className="flex gap-4 justify-center flex-wrap">
                    <button 
                        onClick={generateNewTask}
                        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                    >
                        Neue Aufgabe
                    </button>
                    <button 
                        onClick={checkSolution}
                        className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
                    >
                        Lösung prüfen
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

                {showSolution && solutionSteps && (
                    <div className="mt-6 bg-blue-50 p-6 rounded-lg border border-blue-200 text-left">
                        <h3 className="font-bold text-lg mb-4">Lösungsweg:</h3>
                        {solutionSteps}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ScheitelformRechnerisch;

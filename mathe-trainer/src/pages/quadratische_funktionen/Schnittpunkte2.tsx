import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import GeoGebraApplet from '../../components/GeoGebraApplet';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

interface Point {
    x: number;
    y: number;
}

interface TaskData {
    parabola: { a: number, b: number, c: number };
    line: { m: number, t: number }; // t is y-intercept
    solution: { count: number, points: Point[] };
    taskType: 'count' | 'calculate';
}

const Schnittpunkte2 = () => {
    const [task, setTask] = useState<TaskData | null>(null);
    const [userCount, setUserCount] = useState<string>('');
    const [userP1, setUserP1] = useState<{x: string, y: string}>({x: '', y: ''});
    const [userP2, setUserP2] = useState<{x: string, y: string}>({x: '', y: ''});
    const [feedback, setFeedback] = useState<{type: 'success' | 'error' | 'info', message: string} | null>(null);
    const [showSolution, setShowSolution] = useState<boolean>(false);
    const [showGraph, setShowGraph] = useState<boolean>(false);

    const formatTerm = (coeff: number, variable: string, isFirst = false) => {
        if (coeff === 0) return "";
        let sign = isFirst ? "" : (coeff > 0 ? " + " : " - ");
        if (isFirst && coeff < 0) sign = "-";
        
        const absCoeff = Math.abs(coeff);
        const coeffStr = (absCoeff === 1 && variable) ? "" : absCoeff.toString();

        return `${sign}${coeffStr}${variable}`;
    };

    const formatEquation = (parts: string[]) => {
        let equationStr = parts.filter(p => p).join('');
        if (!equationStr) return "0";
        if (equationStr.startsWith(" + ")) {
            equationStr = equationStr.substring(3);
        }
        return equationStr.trim();
    };

    const generateNewTask = () => {
        setFeedback(null);
        setShowSolution(false);
        setShowGraph(false);
        setUserCount('');
        setUserP1({x: '', y: ''});
        setUserP2({x: '', y: ''});

        let a_sol, b_sol, c_sol;
        const solutionType = Math.random();

        if (solutionType < 0.2) { // 0 solutions
            do {
                a_sol = (Math.floor(Math.random() * 4) + 1) * (Math.random() < 0.5 ? 1 : -1);
                b_sol = Math.floor(Math.random() * 9) - 4;
                c_sol = (Math.floor(Math.random() * 4) + 1) * (Math.random() < 0.5 ? 1 : -1);
            } while (b_sol * b_sol - 4 * a_sol * c_sol >= 0);
        } else if (solutionType < 0.5) { // 1 solution
            const d = (Math.floor(Math.random() * 3) + 1);
            const n = Math.floor(Math.random() * 9) - 4;
            a_sol = d * d * (Math.random() < 0.5 ? 1 : -1);
            if (a_sol === 0) a_sol = 1;
            b_sol = -2 * d * n;
            c_sol = n * n;
            const factor = (Math.floor(Math.random() * 2) + 1);
            a_sol *= factor; b_sol *= factor; c_sol *= factor;
        } else { // 2 solutions
            const denoms = [1, 2, 4];
            const d1 = denoms[Math.floor(Math.random() * denoms.length)];
            let n1 = Math.floor(Math.random() * 9) - 4;
            const d2 = denoms[Math.floor(Math.random() * denoms.length)];
            let n2 = Math.floor(Math.random() * 9) - 4;
            
            if (n1/d1 === n2/d2) {
                n2++; 
                if (n2 > 4) n2 = -4;
            }
            const x1 = n1 / d1;
            const x2 = n2 / d2;
            
            a_sol = d1 * d2 * (Math.random() < 0.5 ? 1 : -1);
            if (a_sol === 0) a_sol = 1;
            b_sol = -a_sol * (x1 + x2);
            c_sol = a_sol * x1 * x2;
        }

        const randomOneDecimal = (max: number, min = 0) => (Math.floor(Math.random() * (max * 10 - min * 10 + 1)) + min * 10) / 10;
        
        const p_a = a_sol; 
        const p_b = randomOneDecimal(5, -5);
        const g_m = Math.round((p_b - b_sol) * 10) / 10;
        const p_c = randomOneDecimal(10, -10);
        const g_b = Math.round((p_c - c_sol) * 10) / 10;

        const final_diskriminante = b_sol * b_sol - 4 * a_sol * c_sol;
        
        let count = 0;
        let points: Point[] = [];

        if (final_diskriminante < -0.001) {
            count = 0;
        } else if (Math.abs(final_diskriminante) < 0.001) {
            count = 1;
            const x = -b_sol / (2 * a_sol);
            const y = g_m * x + g_b;
            points.push({ x: Math.round(x * 100) / 100, y: Math.round(y * 100) / 100 });
        } else {
            count = 2;
            const x1 = (-b_sol + Math.sqrt(final_diskriminante)) / (2 * a_sol);
            const y1 = g_m * x1 + g_b;
            const x2 = (-b_sol - Math.sqrt(final_diskriminante)) / (2 * a_sol);
            const y2 = g_m * x2 + g_b;
            points.push({ x: Math.round(x1 * 100) / 100, y: Math.round(y1 * 100) / 100 });
            points.push({ x: Math.round(x2 * 100) / 100, y: Math.round(y2 * 100) / 100 });
        }

        setTask({
            parabola: { a: p_a, b: p_b, c: p_c },
            line: { m: g_m, t: g_b },
            solution: { count, points },
            taskType: Math.random() < 0.6 ? 'calculate' : 'count'
        });
    };

    useEffect(() => {
        generateNewTask();
    }, []);

    const checkSolution = () => {
        if (!task) return;

        let isCorrect = false;

        if (task.taskType === 'count') {
            if (userCount === "") {
                setFeedback({ type: 'info', message: 'Bitte gib eine Anzahl ein.' });
                return;
            }
            isCorrect = (parseInt(userCount) === task.solution.count);
        } else {
            const p1x = parseFloat(userP1.x.replace(',', '.'));
            const p1y = parseFloat(userP1.y.replace(',', '.'));
            const p2x = parseFloat(userP2.x.replace(',', '.'));
            const p2y = parseFloat(userP2.y.replace(',', '.'));

            const userPoints: Point[] = [];
            if (!isNaN(p1x) && !isNaN(p1y)) userPoints.push({ x: p1x, y: p1y });
            if (!isNaN(p2x) && !isNaN(p2y)) userPoints.push({ x: p2x, y: p2y });

            if (task.solution.count !== userPoints.length) {
                isCorrect = false;
            } else {
                if (task.solution.count === 0) {
                    isCorrect = true;
                } else if (task.solution.count === 1) {
                    const solP = task.solution.points[0];
                    const userP = userPoints[0];
                    isCorrect = Math.abs(solP.x - userP.x) < 0.05 && Math.abs(solP.y - userP.y) < 0.05;
                } else if (task.solution.count === 2) {
                    const solP1 = task.solution.points[0];
                    const solP2 = task.solution.points[1];
                    const userP1 = userPoints[0];
                    const userP2 = userPoints[1];
                    
                    const matchDirect = (Math.abs(solP1.x - userP1.x) < 0.05 && Math.abs(solP1.y - userP1.y) < 0.05) && 
                                      (Math.abs(solP2.x - userP2.x) < 0.05 && Math.abs(solP2.y - userP2.y) < 0.05);
                    const matchSwapped = (Math.abs(solP1.x - userP2.x) < 0.05 && Math.abs(solP1.y - userP2.y) < 0.05) && 
                                       (Math.abs(solP2.x - userP1.x) < 0.05 && Math.abs(solP2.y - userP1.y) < 0.05);

                    isCorrect = matchDirect || matchSwapped;
                }
            }
        }

        if (isCorrect) {
            setFeedback({ type: 'success', message: 'Richtig!' });
        } else {
            setFeedback({ type: 'error', message: 'Leider falsch. Überprüfe deine Rechnung und versuche es erneut!' });
        }
    };

    const getParabolaString = () => {
        if (!task) return "";
        const { a, b, c } = task.parabola;
        return formatEquation([
            formatTerm(a, 'x^2', true),
            formatTerm(b, 'x'),
            formatTerm(c, '')
        ]);
    };

    const getLineString = () => {
        if (!task) return "";
        const { m, t } = task.line;
        return formatEquation([
            formatTerm(m, 'x', true),
            formatTerm(t, '')
        ]);
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-3xl">
            <Link to="/quadratische_funktionen" className="text-teal-600 hover:text-teal-700 font-bold mb-4 inline-block">
                ← Zurück zur Übersicht
            </Link>
            
            <div className="bg-white rounded-xl shadow-lg p-6">
                <h1 className="text-2xl font-bold text-gray-800 text-center mb-6">
                    Aufgabengenerator: Schnittpunkt Gerade & Parabel
                </h1>

                {task && (
                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-6 text-center">
                        <p className="text-lg mb-4">
                            {task.taskType === 'calculate' 
                                ? <>Berechne die Schnittpunkte der Parabel und der Geraden:<br/><span className="text-sm text-gray-500">(Runde deine Ergebnisse auf zwei Nachkommastellen.)</span></>
                                : "Bestimme die Anzahl der Schnittpunkte der Parabel und der Geraden:"
                            }
                        </p>
                        <div className="text-xl font-bold space-y-2 font-mono bg-blue-50 p-4 rounded-lg inline-block">
                            <div className="text-red-600">p: y = {getParabolaString()}</div>
                            <div className="text-blue-600">g: y = {getLineString()}</div>
                        </div>
                    </div>
                )}

                <div className="bg-gray-50 p-6 rounded-lg mb-6">
                    {task?.taskType === 'count' ? (
                        <div className="flex justify-center">
                            <input 
                                type="number" 
                                value={userCount}
                                onChange={(e) => setUserCount(e.target.value)}
                                placeholder="Anzahl"
                                className="w-32 p-3 border border-gray-300 rounded-lg text-center text-lg focus:ring-2 focus:ring-teal-500"
                            />
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4 items-center">
                            <div className="flex items-center gap-2 text-lg">
                                <span className="font-bold">P1 (</span>
                                <input 
                                    type="text" 
                                    value={userP1.x}
                                    onChange={(e) => setUserP1({...userP1, x: e.target.value})}
                                    placeholder="x"
                                    className="w-20 p-2 border border-gray-300 rounded text-center"
                                />
                                <span>|</span>
                                <input 
                                    type="text" 
                                    value={userP1.y}
                                    onChange={(e) => setUserP1({...userP1, y: e.target.value})}
                                    placeholder="y"
                                    className="w-20 p-2 border border-gray-300 rounded text-center"
                                />
                                <span className="font-bold">)</span>
                            </div>
                            <div className="flex items-center gap-2 text-lg">
                                <span className="font-bold">P2 (</span>
                                <input 
                                    type="text" 
                                    value={userP2.x}
                                    onChange={(e) => setUserP2({...userP2, x: e.target.value})}
                                    placeholder="x"
                                    className="w-20 p-2 border border-gray-300 rounded text-center"
                                />
                                <span>|</span>
                                <input 
                                    type="text" 
                                    value={userP2.y}
                                    onChange={(e) => setUserP2({...userP2, y: e.target.value})}
                                    placeholder="y"
                                    className="w-20 p-2 border border-gray-300 rounded text-center"
                                />
                                <span className="font-bold">)</span>
                            </div>
                            <p className="text-sm text-gray-500">Lasse Felder leer, falls es weniger Schnittpunkte gibt.</p>
                        </div>
                    )}
                </div>

                <div className="flex flex-wrap gap-4 justify-center mb-6">
                    <button 
                        onClick={generateNewTask}
                        className="px-6 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors shadow-md"
                    >
                        Neue Aufgabe
                    </button>
                    <button 
                        onClick={checkSolution}
                        className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors shadow-md"
                    >
                        Lösung prüfen
                    </button>
                    <button 
                        onClick={() => setShowSolution(!showSolution)}
                        className="px-6 py-3 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors shadow-md"
                    >
                        {showSolution ? "Lösung verbergen" : "Lösung anzeigen"}
                    </button>
                    <button 
                        onClick={() => setShowGraph(!showGraph)}
                        className="px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors shadow-md"
                    >
                        {showGraph ? "Graph verbergen" : "In GeoGebra zeichnen"}
                    </button>
                </div>

                {feedback && (
                    <div className={`p-4 rounded-lg mb-6 text-center font-bold text-lg ${
                        feedback.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' :
                        feedback.type === 'error' ? 'bg-red-100 text-red-800 border border-red-200' :
                        'bg-blue-100 text-blue-800 border border-blue-200'
                    }`}>
                        {feedback.message}
                    </div>
                )}

                {showSolution && task && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                        <h3 className="font-bold text-green-800 mb-2">Korrekte Lösung:</h3>
                        {task.taskType === 'calculate' ? (
                            task.solution.count === 0 ? <p>Es gibt keine Schnittpunkte.</p> :
                            task.solution.count === 1 ? <p>Es gibt einen Berührpunkt: P({task.solution.points[0].x} | {task.solution.points[0].y})</p> :
                            <p>Die Schnittpunkte sind P1({task.solution.points[0].x} | {task.solution.points[0].y}) und P2({task.solution.points[1].x} | {task.solution.points[1].y})</p>
                        ) : (
                            <p>Anzahl der Schnittpunkte: {task.solution.count}</p>
                        )}
                    </div>
                )}

                {showGraph && task && (
                    <div className="mt-6 h-96 w-full border border-gray-200 rounded-lg overflow-hidden">
                        <GeoGebraApplet 
                            id="schnittpunkte2-ggb"
                            commands={[
                                `f(x) = ${task.parabola.a}x^2 + ${task.parabola.b}x + ${task.parabola.c}`,
                                `g(x) = ${task.line.m}x + ${task.line.t}`,
                                `SetColor(f, "red")`,
                                `SetColor(g, "blue")`,
                                `Intersect(f, g)`
                            ]}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default Schnittpunkte2;

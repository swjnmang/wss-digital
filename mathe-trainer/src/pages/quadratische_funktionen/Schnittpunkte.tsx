import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import GeoGebraApplet from '../../components/GeoGebraApplet';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

type TaskType = 'line-parabola' | 'parabola-parabola';
type Difficulty = 'leicht' | 'mittel' | 'schwer';

interface Point {
    x: number;
    y: number;
}

interface TaskParams {
    type: TaskType;
    // Line-Parabola
    a?: number;
    b?: number;
    c?: number;
    m?: number;
    t?: number;
    // Parabola-Parabola
    a1?: number;
    b1?: number;
    c1?: number;
    a2?: number;
    b2?: number;
    c2?: number;
    
    points: Point[];
    intersectionCount: number;
}

interface SchnittpunkteProps {
    initialTaskType?: TaskType;
}

const Schnittpunkte: React.FC<SchnittpunkteProps> = ({ initialTaskType = 'line-parabola' }) => {
    const [taskType, setTaskType] = useState<TaskType>(initialTaskType);
    const [difficulty, setDifficulty] = useState<Difficulty>('leicht');
    const [params, setParams] = useState<TaskParams | null>(null);
    
    // New state for structured input
    const [selectedCount, setSelectedCount] = useState<number | null>(null);
    const [userPoints, setUserPoints] = useState<{x: string, y: string}[]>([]);
    
    const [feedback, setFeedback] = useState<{type: 'success' | 'error' | 'info', message: string} | null>(null);
    const [showSolution, setShowSolution] = useState<boolean>(false);
    const [showGraph, setShowGraph] = useState<boolean>(false);

    // Helpers
    const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
    
    const randomFloat = (min: number, max: number, decimals = 1) => {
        const factor = Math.pow(10, decimals);
        return Math.round((Math.random() * (max - min) + min) * factor) / factor;
    };

    const roundTo = (value: number, decimals: number) => {
        const factor = Math.pow(10, decimals);
        return Math.round(value * factor) / factor;
    };

    const formatCoefficient = (value: number) => {
        if (value === 0) return "";
        if (value === 1) return "+ ";
        if (value === -1) return "- ";
        if (value > 0) return `+ ${value} `;
        return `- ${Math.abs(value)} `;
    };

    const formatConstant = (value: number) => {
        if (value === 0) return "";
        if (value > 0) return `+ ${value}`;
        return `- ${Math.abs(value)}`;
    };

    const generateLineParabolaTask = (diff: Difficulty): TaskParams => {
        let a, b, c, m, t;
        let intersectionCount;
        
        while (true) {
            if (diff === 'leicht') {
                a = randomInt(1, 2);
                m = randomInt(-3, 3);
                t = randomInt(-5, 5);
                const x1 = randomInt(-3, 3);
                const x2 = randomInt(-3, 3);
                b = -(x1 + x2) * a;
                c = x1 * x2 * a;
                t = a * x1 * x1 + b * x1; // Adjust t so line passes through (x1, y1) roughly? Wait, original logic:
                // t = a*x1*x1 + b*x1 is actually setting y_line(x1) = y_parabola(x1) IF m*x1 + t_new = a*x1^2 + b*x1 + c
                // But here t is reassigned.
                // Original: t = a * x1 * x1 + b * x1; 
                // This makes y_parabola(x1) = a*x1^2 + b*x1 + c (where c = a*x1*x2).
                // Wait, the original logic for 'leicht' seems to try to force intersection at x1.
                // Let's re-read carefully:
                // b = -(x1 + x2) * a; c = x1 * x2 * a; -> Roots of parabola are x1, x2? No, roots of ax^2+bx+c=0 are x1, x2.
                // Then t = a*x1*x1 + b*x1.
                // This sets t such that at x=x1, m*x1 + t = a*x1^2 + b*x1 + c?
                // No, c is already set.
                // If we want intersection at x1: m*x1 + t = a*x1^2 + b*x1 + c
                // t = a*x1^2 + b*x1 + c - m*x1.
                // The original code: t = a * x1 * x1 + b * x1;
                // This ignores c and m? That seems wrong or I misunderstood.
                // Ah, maybe it assumes intersection at (x1, 0)? No.
                // Let's stick to the "check discriminant" loop which is robust.
                // For 'leicht', I'll just use the loop but with integer constraints.
            } else if (diff === 'mittel') {
                a = randomFloat(-3, 3, 1);
                b = randomFloat(-5, 5, 1);
                c = randomFloat(-5, 5, 1);
                m = randomFloat(-3, 3, 1);
                t = randomFloat(-5, 5, 1);
            } else {
                a = randomFloat(-4, 4, 1);
                b = randomFloat(-8, 8, 1);
                c = randomFloat(-10, 10, 1);
                m = randomFloat(-5, 5, 1);
                t = randomFloat(-10, 10, 1);
            }

            // If 'leicht', override with simple integers and ensure solution
            if (diff === 'leicht') {
                 a = randomInt(1, 2) * (Math.random() < 0.5 ? 1 : -1);
                 b = randomInt(-5, 5);
                 c = randomInt(-5, 5);
                 m = randomInt(-3, 3);
                 t = randomInt(-5, 5);
            }

            if (a === 0) a = 1;

            const discriminant = Math.pow(b - m, 2) - 4 * a * (c - t);

            if (discriminant >= 0) {
                const x1 = (-1 * (b - m) + Math.sqrt(discriminant)) / (2 * a);
                const y1 = m * x1 + t;
                
                let points: Point[] = [];
                points.push({ x: roundTo(x1, 4), y: roundTo(y1, 4) });
                
                if (discriminant > 0.0001) {
                    const x2 = (-1 * (b - m) - Math.sqrt(discriminant)) / (2 * a);
                    const y2 = m * x2 + t;
                    points.push({ x: roundTo(x2, 4), y: roundTo(y2, 4) });
                    intersectionCount = 2;
                } else {
                    intersectionCount = 1;
                }

                // For 'leicht', ensure integer-ish results
                if (diff === 'leicht') {
                    const isNice = points.every(p => Math.abs(p.x - Math.round(p.x)) < 0.1 && Math.abs(p.y - Math.round(p.y)) < 0.1);
                    if (!isNice) continue;
                    // Round them to integers for display/check
                    points = points.map(p => ({x: Math.round(p.x), y: Math.round(p.y)}));
                }

                return {
                    type: 'line-parabola',
                    a, b, c, m, t,
                    points,
                    intersectionCount
                };
            }
        }
    };

    const generateParabolaParabolaTask = (diff: Difficulty): TaskParams => {
        let a1, b1, c1, a2, b2, c2;
        
        while (true) {
            if (diff === 'leicht') {
                a1 = randomInt(1, 2);
                a2 = randomInt(-2, -1); // Different signs to ensure intersection often
                b1 = randomInt(-5, 5);
                c1 = randomInt(-5, 5);
                b2 = randomInt(-5, 5);
                c2 = randomInt(-5, 5);
            } else if (diff === 'mittel') {
                a1 = randomFloat(1, 3, 1);
                b1 = randomFloat(-4, 4, 1);
                c1 = randomFloat(-5, 5, 1);
                a2 = randomFloat(-3, -1, 1);
                b2 = randomFloat(-4, 4, 1);
                c2 = randomFloat(-5, 5, 1);
            } else {
                a1 = randomFloat(-4, 4, 1);
                b1 = randomFloat(-5, 5, 1);
                c1 = randomFloat(-8, 8, 1);
                a2 = randomFloat(-4, 4, 1);
                b2 = randomFloat(-5, 5, 1);
                c2 = randomFloat(-8, 8, 1);
            }

            if (Math.abs(a1 - a2) < 0.1) {
                if (diff === 'leicht') continue;
                a2 += (a1 > 0) ? -1 : 1;
            }

            const A = a1 - a2;
            const B = b1 - b2;
            const C = c1 - c2;

            const discriminant = B * B - 4 * A * C;

            if (discriminant >= 0) {
                const x1 = (-B + Math.sqrt(discriminant)) / (2 * A);
                const y1 = a1 * x1 * x1 + b1 * x1 + c1;
                
                let points: Point[] = [];
                points.push({ x: roundTo(x1, 4), y: roundTo(y1, 4) });
                
                let intersectionCount = 1;
                if (discriminant > 0.0001) {
                    const x2 = (-B - Math.sqrt(discriminant)) / (2 * A);
                    const y2 = a1 * x2 * x2 + b1 * x2 + c1;
                    points.push({ x: roundTo(x2, 4), y: roundTo(y2, 4) });
                    intersectionCount = 2;
                }

                if (diff === 'leicht') {
                    const isNice = points.every(p => Math.abs(p.x - Math.round(p.x)) < 0.1 && Math.abs(p.y - Math.round(p.y)) < 0.1);
                    if (!isNice) continue;
                    points = points.map(p => ({x: Math.round(p.x), y: Math.round(p.y)}));
                }

                return {
                    type: 'parabola-parabola',
                    a1, b1, c1, a2, b2, c2,
                    points,
                    intersectionCount
                };
            }
        }
    };

    const generateNewTask = () => {
        setFeedback(null);
        setShowSolution(false);
        setShowGraph(false);
        setSelectedCount(null);
        setUserPoints([]);
        
        if (taskType === 'line-parabola') {
            setParams(generateLineParabolaTask(difficulty));
        } else {
            setParams(generateParabolaParabolaTask(difficulty));
        }
    };

    useEffect(() => {
        generateNewTask();
    }, [taskType, difficulty]);

    const handleCountSelect = (count: number) => {
        setSelectedCount(count);
        // Initialize points array with empty strings
        setUserPoints(Array(count).fill({ x: '', y: '' }));
        setFeedback(null);
    };

    const handlePointChange = (index: number, field: 'x' | 'y', value: string) => {
        const newPoints = [...userPoints];
        newPoints[index] = { ...newPoints[index], [field]: value };
        setUserPoints(newPoints);
    };

    const checkAnswer = () => {
        if (!params) return;

        if (selectedCount === null) {
            setFeedback({ type: 'info', message: 'Bitte wähle zuerst die Anzahl der Schnittpunkte aus.' });
            return;
        }

        if (selectedCount !== params.intersectionCount) {
            setFeedback({ 
                type: 'error', 
                message: `Falsch! Es gibt ${params.intersectionCount} Schnittpunkt(e), nicht ${selectedCount}.` 
            });
            return;
        }

        if (selectedCount === 0) {
            setFeedback({ type: 'success', message: 'Richtig! Es gibt keine Schnittpunkte.' });
            return;
        }

        // Check if all fields are filled
        if (userPoints.some(p => !p.x.trim() || !p.y.trim())) {
            setFeedback({ type: 'info', message: 'Bitte fülle alle Koordinatenfelder aus.' });
            return;
        }

        const parsedUserPoints = userPoints.map(p => ({
            x: parseFloat(p.x.replace(',', '.')),
            y: parseFloat(p.y.replace(',', '.'))
        }));

        // Check for valid numbers
        if (parsedUserPoints.some(p => isNaN(p.x) || isNaN(p.y))) {
            setFeedback({ type: 'error', message: 'Bitte gib gültige Zahlen ein.' });
            return;
        }

        let allCorrect = true;
        const tolerance = 0.1;

        // Create a copy of expected points to match against
        const remainingExpected = [...params.points];

        for (const userPoint of parsedUserPoints) {
            const matchIndex = remainingExpected.findIndex(expected => 
                Math.abs(userPoint.x - expected.x) <= tolerance && 
                Math.abs(userPoint.y - expected.y) <= tolerance
            );

            if (matchIndex !== -1) {
                remainingExpected.splice(matchIndex, 1);
            } else {
                allCorrect = false;
                break;
            }
        }

        if (allCorrect) {
            setFeedback({ type: 'success', message: 'Richtig! Deine Lösung ist korrekt.' });
        } else {
            setFeedback({ type: 'error', message: 'Leider falsch. Überprüfe deine Berechnung oder zeige die Lösung an.' });
        }
    };

    const renderSolution = () => {
        if (!params) return null;

        if (params.type === 'line-parabola') {
            const { a, b, c, m, t } = params;
            if (a === undefined || b === undefined || c === undefined || m === undefined || t === undefined) return null;
            
            const A = a;
            const B = b - m;
            const C = c - t;
            const D = B*B - 4*A*C;

            return (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-800 mb-3">Lösung</h3>
                    
                    <div className="mb-4">
                        <p className="font-bold">1. Gleichsetzen:</p>
                        <BlockMath math={`${m}x ${formatConstant(t)} = ${a}x^2 ${formatCoefficient(b)}x ${formatConstant(c)}`} />
                    </div>
                    
                    <div className="mb-4">
                        <p className="font-bold">2. Umformen zur Normalform (<InlineMath math="ax^2 + bx + c = 0" />):</p>
                        <BlockMath math={`${a}x^2 ${formatCoefficient(B)}x ${formatConstant(C)} = 0`} />
                    </div>

                    <div className="mb-4">
                        <p className="font-bold">3. Diskriminante berechnen:</p>
                        <BlockMath math={`D = (${roundTo(B, 2)})^2 - 4 \\cdot ${a} \\cdot (${roundTo(C, 2)}) = ${roundTo(D, 2)}`} />
                    </div>

                    {D >= 0 && (
                        <div className="mb-4">
                            <p className="font-bold">4. x-Werte berechnen (Mitternachtsformel):</p>
                            <BlockMath math={`x_{1,2} = \\frac{-(${roundTo(B, 2)}) \\pm \\sqrt{${roundTo(D, 2)}}}{2 \\cdot ${a}}`} />
                            <p>
                                Ergebnisse: <InlineMath math={`x_1 = ${roundTo(params.points[0].x, 3)}`} />
                                {params.points.length > 1 && <>, <InlineMath math={`x_2 = ${roundTo(params.points[1].x, 3)}`} /></>}
                            </p>
                        </div>
                    )}

                    <div className="mb-4">
                        <p className="font-bold">5. y-Werte berechnen (in Gerade einsetzen):</p>
                        {params.points.map((p, i) => (
                            <div key={i}>
                                <BlockMath math={`y_${i+1} = ${m} \\cdot (${roundTo(p.x, 3)}) ${formatConstant(t)} = ${roundTo(p.y, 3)}`} />
                            </div>
                        ))}
                    </div>

                    <div className="mb-4">
                        <p className="font-bold">6. Schnittpunkte:</p>
                        <p>
                            {params.points.map((p, i) => (
                                <span key={i} className="mr-4">
                                    <InlineMath math={`S_{${i+1}}(${roundTo(p.x, 3)} | ${roundTo(p.y, 3)})`} />
                                </span>
                            ))}
                        </p>
                    </div>
                </div>
            );
        } else {
            const { a1, b1, c1, a2, b2, c2 } = params;
            if (a1 === undefined || b1 === undefined || c1 === undefined || a2 === undefined || b2 === undefined || c2 === undefined) return null;

            const A = a1 - a2;
            const B = b1 - b2;
            const C = c1 - c2;
            const D = B*B - 4*A*C;

            return (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-800 mb-3">Lösung</h3>
                    
                    <div className="mb-4">
                        <p className="font-bold">1. Gleichsetzen:</p>
                        <BlockMath math={`${a1}x^2 ${formatCoefficient(b1)}x ${formatConstant(c1)} = ${a2}x^2 ${formatCoefficient(b2)}x ${formatConstant(c2)}`} />
                    </div>
                    
                    <div className="mb-4">
                        <p className="font-bold">2. Umformen zur Normalform:</p>
                        <BlockMath math={`${roundTo(A, 2)}x^2 ${formatCoefficient(B)}x ${formatConstant(C)} = 0`} />
                    </div>

                    <div className="mb-4">
                        <p className="font-bold">3. Diskriminante berechnen:</p>
                        <BlockMath math={`D = (${roundTo(B, 2)})^2 - 4 \\cdot ${roundTo(A, 2)} \\cdot (${roundTo(C, 2)}) = ${roundTo(D, 2)}`} />
                    </div>

                    {D >= 0 && (
                        <div className="mb-4">
                            <p className="font-bold">4. x-Werte berechnen:</p>
                            <BlockMath math={`x_{1,2} = \\frac{-(${roundTo(B, 2)}) \\pm \\sqrt{${roundTo(D, 2)}}}{2 \\cdot ${roundTo(A, 2)}}`} />
                            <p>
                                Ergebnisse: <InlineMath math={`x_1 = ${roundTo(params.points[0].x, 3)}`} />
                                {params.points.length > 1 && <>, <InlineMath math={`x_2 = ${roundTo(params.points[1].x, 3)}`} /></>}
                            </p>
                        </div>
                    )}

                    <div className="mb-4">
                        <p className="font-bold">5. y-Werte berechnen (in erste Parabel einsetzen):</p>
                        {params.points.map((p, i) => (
                            <div key={i}>
                                <BlockMath math={`y_${i+1} = ${a1} \\cdot (${roundTo(p.x, 3)})^2 ${formatCoefficient(b1)} \\cdot (${roundTo(p.x, 3)}) ${formatConstant(c1)} = ${roundTo(p.y, 3)}`} />
                            </div>
                        ))}
                    </div>

                    <div className="mb-4">
                        <p className="font-bold">6. Schnittpunkte:</p>
                        <p>
                            {params.points.map((p, i) => (
                                <span key={i} className="mr-4">
                                    <InlineMath math={`S_{${i+1}}(${roundTo(p.x, 3)} | ${roundTo(p.y, 3)})`} />
                                </span>
                            ))}
                        </p>
                    </div>
                </div>
            );
        }
    };

    const getGeoGebraCommands = () => {
        if (!params) return [];
        const cmds = [];
        if (params.type === 'line-parabola') {
            const { a, b, c, m, t } = params;
            cmds.push(`f(x) = ${a}x^2 + ${b}x + ${c}`);
            cmds.push(`g(x) = ${m}x + ${t}`);
            cmds.push(`SetColor(f, "red")`);
            cmds.push(`SetColor(g, "blue")`);
        } else {
            const { a1, b1, c1, a2, b2, c2 } = params;
            cmds.push(`f(x) = ${a1}x^2 + ${b1}x + ${c1}`);
            cmds.push(`g(x) = ${a2}x^2 + ${b2}x + ${c2}`);
            cmds.push(`SetColor(f, "red")`);
            cmds.push(`SetColor(g, "blue")`);
        }
        // Berechne Schnittpunkte und speichere sie in einer Liste
        cmds.push(`L1 = {Intersect(f, g)}`);
        // Markiere die Schnittpunkte
        cmds.push(`SetColor(L1, "orange")`);
        cmds.push(`SetPointSize(L1, 6)`);
        cmds.push(`ShowLabel(L1, true)`);
        // Zeige Name und Wert (Koordinaten)
        cmds.push(`SetLabelMode(L1, 1)`); 
        return cmds;
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <Link to="/quadratische_funktionen" className="text-teal-600 hover:text-teal-700 font-bold mb-4 inline-block">
                ← Zurück zur Übersicht
            </Link>
            
            <div className="bg-white rounded-xl shadow-lg p-6">
                <h1 className="text-3xl font-bold text-teal-800 text-center mb-6">
                    Schnittpunkte berechnen
                </h1>

                <div className="flex flex-wrap gap-4 mb-6 justify-center">
                    <div className="flex rounded-lg bg-gray-100 p-1">
                        <button 
                            onClick={() => setTaskType('line-parabola')}
                            className={`px-4 py-2 rounded-md transition-colors ${taskType === 'line-parabola' ? 'bg-white shadow text-teal-700 font-bold' : 'text-gray-600'}`}
                        >
                            Gerade & Parabel
                        </button>
                        <button 
                            onClick={() => setTaskType('parabola-parabola')}
                            className={`px-4 py-2 rounded-md transition-colors ${taskType === 'parabola-parabola' ? 'bg-white shadow text-teal-700 font-bold' : 'text-gray-600'}`}
                        >
                            Zwei Parabeln
                        </button>
                    </div>

                    <div className="flex rounded-lg bg-gray-100 p-1">
                        {(['leicht', 'mittel', 'schwer'] as Difficulty[]).map(d => (
                            <button 
                                key={d}
                                onClick={() => setDifficulty(d)}
                                className={`px-4 py-2 rounded-md capitalize transition-colors ${difficulty === d ? 'bg-white shadow text-teal-700 font-bold' : 'text-gray-600'}`}
                            >
                                {d}
                            </button>
                        ))}
                    </div>
                </div>

                {params && (
                    <div className="bg-blue-50 p-6 rounded-lg border border-blue-100 mb-6 text-center">
                        <p className="text-lg mb-4">Berechne die Schnittpunkte der folgenden Funktionen:</p>
                        <div className="text-xl font-bold space-y-2">
                            {params.type === 'line-parabola' ? (
                                <>
                                    <div className="text-red-600"><InlineMath math={`f(x) = ${params.a}x^2 ${formatCoefficient(params.b!)}x ${formatConstant(params.c!)}`} /></div>
                                    <div className="text-blue-600"><InlineMath math={`g(x) = ${params.m}x ${formatConstant(params.t!)}`} /></div>
                                </>
                            ) : (
                                <>
                                    <div className="text-red-600"><InlineMath math={`f(x) = ${params.a1}x^2 ${formatCoefficient(params.b1!)}x ${formatConstant(params.c1!)}`} /></div>
                                    <div className="text-blue-600"><InlineMath math={`g(x) = ${params.a2}x^2 ${formatCoefficient(params.b2!)}x ${formatConstant(params.c2!)}`} /></div>
                                </>
                            )}
                        </div>
                    </div>
                )}

                <div className="mb-6">
                    <p className="block text-gray-700 font-medium mb-3">Wie viele Schnittpunkte gibt es?</p>
                    <div className="flex gap-3 mb-4">
                        {[0, 1, 2].map(count => (
                            <button
                                key={count}
                                onClick={() => handleCountSelect(count)}
                                className={`px-4 py-2 rounded-lg border transition-colors ${
                                    selectedCount === count 
                                    ? 'bg-teal-600 text-white border-teal-600' 
                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                                {count === 0 ? 'Keine Schnittpunkte' : count === 1 ? 'Einen Schnittpunkt' : 'Zwei Schnittpunkte'}
                            </button>
                        ))}
                    </div>

                    {selectedCount !== null && selectedCount > 0 && (
                        <div className="space-y-4">
                            <p className="text-gray-700 font-medium">Gib die Koordinaten ein:</p>
                            {userPoints.map((point, index) => (
                                <div key={index} className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg border border-gray-200">
                                    <span className="font-bold text-gray-600">S{index + 1}:</span>
                                    <span className="text-gray-600">(</span>
                                    <input
                                        type="text"
                                        value={point.x}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePointChange(index, 'x', e.target.value)}
                                        placeholder="x"
                                        className="w-20 p-2 border border-gray-300 rounded text-center focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                    />
                                    <span className="text-gray-600">|</span>
                                    <input
                                        type="text"
                                        value={point.y}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handlePointChange(index, 'y', e.target.value)}
                                        placeholder="y"
                                        className="w-20 p-2 border border-gray-300 rounded text-center focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                    />
                                    <span className="text-gray-600">)</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex flex-wrap gap-4 justify-center mb-6">
                    <button 
                        onClick={generateNewTask}
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
                    <button 
                        onClick={() => setShowGraph(!showGraph)}
                        className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
                    >
                        {showGraph ? "Graph verbergen" : "Graph anzeigen"}
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

                {showGraph && (
                    <div className="mt-6 h-96 w-full border border-gray-200 rounded-lg overflow-hidden">
                        <GeoGebraApplet 
                            id="schnittpunkte-ggb"
                            commands={getGeoGebraCommands()}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default Schnittpunkte;

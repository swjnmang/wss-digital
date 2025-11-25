import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';

const angleSymbols = { alpha: 'α', beta: 'β', gamma: 'γ' } as const;
const angleKeys = ['alpha', 'beta', 'gamma'] as const;
const sideKeys = ['a', 'b', 'c'] as const;
type AngleKey = typeof angleKeys[number];
type SideKey = typeof sideKeys[number];

const angleToSideMap: Record<AngleKey, SideKey> = {
    alpha: 'a',
    beta: 'b',
    gamma: 'c'
};

const KOSINUSSATZ_VIDEO_URL = 'https://youtu.be/pLu62FC_m9s?si=Xz5Vl_R-vPcnZjuO';

const adjacentSides: Record<AngleKey, [SideKey, SideKey]> = {
    alpha: ['b', 'c'],
    beta: ['a', 'c'],
    gamma: ['a', 'b']
};

interface Triangle {
    a: number;
    b: number;
    c: number;
    alpha: number;
    beta: number;
    gamma: number;
}

interface SolutionStep {
    text: string;
    math?: string;
}

type TaskType = 'find_side' | 'find_angle';

interface CosTask {
    triangle: Triangle;
    type: TaskType;
    toFind: AngleKey | SideKey;
    prompt: string;
    steps: SolutionStep[];
    correctAnswer: number;
    unit: '°' | '';
    givenKeys: (AngleKey | SideKey)[];
    answerLabel: string;
}

const degToRad = (deg: number) => deg * (Math.PI / 180);
const radToDeg = (rad: number) => rad * (180 / Math.PI);
const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;
const round = (val: number, digits = 2) => parseFloat(val.toFixed(digits));
const formatValue = (val: number, unit: string) => `${round(val)}${unit}`;
const formatNumber = (val: number, digits = 2) => parseFloat(val.toFixed(digits)).toString();

interface SketchPoints {
    A: { x: number; y: number };
    B: { x: number; y: number };
    C: { x: number; y: number };
}

const buildSketchPoints = (triangle: Triangle): SketchPoints => {
    const width = 320;
    const height = 240;
    const margin = 40;
    const scale = (width - 2 * margin) / Math.max(triangle.a, triangle.b, triangle.c);
    const c = Math.max(triangle.c * scale, 1);
    const a = triangle.a * scale;
    const b = triangle.b * scale;
    const Ax = margin;
    const Ay = height - margin;
    const Bx = margin + c;
    const By = height - margin;
    const Px = (b * b + c * c - a * a) / (2 * c);
    const Py = Math.sqrt(Math.max(b * b - Px * Px, 4));
    const Cx = Ax + Px;
    const Cy = Ay - Py;

    return {
        A: { x: Ax, y: Ay },
        B: { x: Bx, y: By },
        C: { x: Cx, y: Cy }
    };
};

const TriangleSketch: React.FC<{
    triangle: Triangle;
    highlight?: AngleKey | SideKey;
    givenKeys: (AngleKey | SideKey)[];
}> = ({ triangle, highlight, givenKeys }) => {
    const points = buildSketchPoints(triangle);
    const givenSet = new Set(givenKeys);
    const colorFor = (key: AngleKey | SideKey) => (highlight === key ? '#dc2626' : '#1f2937');
    const getSideLabel = (side: SideKey) => {
        if (highlight === side) return `${side} = ?`;
        if (givenSet.has(side)) return `${side} = ${formatValue(triangle[side], '')}`;
        return side;
    };
    const getAngleLabel = (angle: AngleKey) => {
        const symbol = angleSymbols[angle];
        if (highlight === angle) return `${symbol} = ?`;
        if (givenSet.has(angle)) return `${symbol} = ${formatValue(triangle[angle], '°')}`;
        return symbol;
    };

    return (
        <svg width={360} height={260} viewBox="0 0 360 260" className="mx-auto">
            <polygon
                points={`${points.A.x},${points.A.y} ${points.B.x},${points.B.y} ${points.C.x},${points.C.y}`}
                fill="#eef2ff"
                stroke="#0f172a"
                strokeWidth={2}
            />
            <line x1={points.A.x} y1={points.A.y} x2={points.B.x} y2={points.B.y} stroke={colorFor('c')} strokeWidth={3} />
            <line x1={points.A.x} y1={points.A.y} x2={points.C.x} y2={points.C.y} stroke={colorFor('b')} strokeWidth={3} />
            <line x1={points.B.x} y1={points.B.y} x2={points.C.x} y2={points.C.y} stroke={colorFor('a')} strokeWidth={3} />

            <text x={points.A.x - 15} y={points.A.y + 15} fontWeight="bold">A</text>
            <text x={points.B.x + 10} y={points.B.y + 15} fontWeight="bold">B</text>
            <text x={points.C.x} y={points.C.y - 10} fontWeight="bold" textAnchor="middle">C</text>

            <text x={(points.A.x + points.B.x) / 2} y={points.A.y + 25} textAnchor="middle" fill={colorFor('c')}>
                {getSideLabel('c')}
            </text>
            <text x={(points.A.x + points.C.x) / 2 - 10} y={(points.A.y + points.C.y) / 2} textAnchor="end" fill={colorFor('b')}>
                {getSideLabel('b')}
            </text>
            <text x={(points.B.x + points.C.x) / 2 + 10} y={(points.B.y + points.C.y) / 2} fill={colorFor('a')}>
                {getSideLabel('a')}
            </text>

            <text x={points.A.x + 5} y={points.A.y - 10} fill={colorFor('alpha')}>
                {getAngleLabel('alpha')}
            </text>
            <text x={points.B.x - 80} y={points.B.y - 10} fill={colorFor('beta')}>
                {getAngleLabel('beta')}
            </text>
            <text x={points.C.x} y={points.C.y - 20} textAnchor="middle" fill={colorFor('gamma')}>
                {getAngleLabel('gamma')}
            </text>
        </svg>
    );
};

const buildTriangle = (): Triangle => {
    let alpha = randomInRange(35, 110);
    let beta = randomInRange(30, 110);
    let gamma = 180 - alpha - beta;
    while (gamma < 30 || gamma > 110) {
        alpha = randomInRange(35, 110);
        beta = randomInRange(30, 110);
        gamma = 180 - alpha - beta;
    }
    const a = randomInRange(5, 12);
    const b = (a * Math.sin(degToRad(beta))) / Math.sin(degToRad(alpha));
    const c = (a * Math.sin(degToRad(gamma))) / Math.sin(degToRad(alpha));
    return {
        a: round(a),
        b: round(b),
        c: round(c),
        alpha: round(alpha, 1),
        beta: round(beta, 1),
        gamma: round(gamma, 1)
    };
};

const Kosinussatz: React.FC = () => {
    const [task, setTask] = useState<CosTask | null>(null);
    const [userAnswer, setUserAnswer] = useState('');
    const [feedback, setFeedback] = useState<'correct' | 'incorrect' | 'info' | null>(null);
    const [showSolution, setShowSolution] = useState(false);

    const generateTask = () => {
        const triangle = buildTriangle();
        const type: TaskType = Math.random() < 0.5 ? 'find_side' : 'find_angle';

        if (type === 'find_side') {
            const targetSide = sideKeys[Math.floor(Math.random() * sideKeys.length)];
            const targetAngle = angleKeys.find(key => angleToSideMap[key] === targetSide) as AngleKey;
            const [adj1, adj2] = adjacentSides[targetAngle];
            const cosValue = Math.cos(degToRad(triangle[targetAngle]));
            const underRoot =
                Math.pow(triangle[adj1], 2) +
                Math.pow(triangle[adj2], 2) -
                2 * triangle[adj1] * triangle[adj2] * cosValue;

            const sideSteps: SolutionStep[] = [
                {
                    text: 'Nutze den Kosinussatz für die gesuchte Seite.',
                    math: `${targetSide}^2 = ${adj1}^2 + ${adj2}^2 - 2\cdot${adj1}\cdot${adj2}\cdot\cos(${angleSymbols[targetAngle]})`
                },
                {
                    text: 'Setze die bekannten Seiten und den Winkel ein.',
                    math: `${targetSide}^2 = ${formatNumber(triangle[adj1])}^2 + ${formatNumber(triangle[adj2])}^2 - 2\cdot${formatNumber(triangle[adj1])}\cdot${formatNumber(triangle[adj2])}\cdot\cos(${formatNumber(triangle[targetAngle], 1)}^{\\circ})`
                },
                {
                    text: 'Fasse den Term zusammen.',
                    math: `${targetSide}^2 = ${round(underRoot, 3)} \Leftrightarrow ${targetSide} = \\sqrt{${round(underRoot, 3)}}`
                },
                {
                    text: 'Ziehe die Wurzel, um die Seite zu erhalten.',
                    math: `${targetSide} \approx ${formatNumber(Math.sqrt(Math.max(underRoot, 0)))}`
                }
            ];

            setTask({
                triangle,
                type,
                toFind: targetSide,
                prompt: `Berechne die Seitenlänge ${targetSide}.`,
                steps: sideSteps,
                correctAnswer: triangle[targetSide],
                unit: '',
                givenKeys: [adj1, adj2, targetAngle],
                answerLabel: targetSide
            });
            setFeedback(null);
            setUserAnswer('');
            setShowSolution(false);
            return;
        }

        const targetAngle = angleKeys[Math.floor(Math.random() * angleKeys.length)];
        const [adj1, adj2] = adjacentSides[targetAngle];
        const opposite = angleToSideMap[targetAngle];
        const numerator =
            Math.pow(triangle[adj1], 2) + Math.pow(triangle[adj2], 2) - Math.pow(triangle[opposite], 2);
        const denominator = 2 * triangle[adj1] * triangle[adj2];
        const ratio = numerator / denominator;
        const clamped = Math.min(1, Math.max(-1, ratio));
        const computedAngle = radToDeg(Math.acos(clamped));

        const angleSteps: SolutionStep[] = [
            {
                text: 'Form des Kosinussatzes zur Winkelberechnung:',
                math: `\\cos(${angleSymbols[targetAngle]}) = \\frac{${adj1}^2 + ${adj2}^2 - ${opposite}^2}{2\\cdot${adj1}\\cdot${adj2}}`
            },
            {
                text: 'Setze die bekannten Seiten ein.',
                math: `\\cos(${angleSymbols[targetAngle]}) = \\frac{${formatNumber(triangle[adj1])}^2 + ${formatNumber(triangle[adj2])}^2 - ${formatNumber(triangle[opposite])}^2}{2\\cdot${formatNumber(triangle[adj1])}\\cdot${formatNumber(triangle[adj2])}}`
            },
            {
                text: 'Berechne den Quotienten.',
                math: `\\cos(${angleSymbols[targetAngle]}) = ${round(clamped, 4)} \Leftrightarrow ${angleSymbols[targetAngle]} = \\arccos(${round(clamped, 4)})`
            },
            {
                text: 'Bestimme den Winkel in Grad.',
                math: `${angleSymbols[targetAngle]} \approx ${formatNumber(triangle[targetAngle], 1)}^{\\circ}`
            }
        ];

        setTask({
            triangle,
            type,
            toFind: targetAngle,
            prompt: `Berechne den Winkel ${angleSymbols[targetAngle]}.`,
            steps: angleSteps,
            correctAnswer: triangle[targetAngle],
            unit: '°',
            givenKeys: [opposite, adj1, adj2],
            answerLabel: angleSymbols[targetAngle]
        });
        setFeedback(null);
        setUserAnswer('');
        setShowSolution(false);
    };

    useEffect(() => {
        generateTask();
    }, []);

    const tolerance = task?.unit === '°' ? 1 : 0.2;

    const checkAnswer = () => {
        if (!task) return;
        const value = parseFloat(userAnswer.replace(',', '.'));
        if (isNaN(value)) {
            setFeedback('info');
            return;
        }
        if (Math.abs(value - task.correctAnswer) <= tolerance) {
            setFeedback('correct');
        } else {
            setFeedback('incorrect');
        }
    };

    const givenSummary = task
        ? task.givenKeys
              .map(key => {
                  if (angleKeys.includes(key as AngleKey)) {
                      const angleKey = key as AngleKey;
                      return `${angleSymbols[angleKey]} = ${formatValue(task.triangle[angleKey], '°')}`;
                  }
                  const sideKey = key as SideKey;
                  return `${sideKey} = ${formatValue(task.triangle[sideKey], '')}`;
              })
              .filter((value, index, arr) => arr.indexOf(value) === index)
              .join(', ')
        : '';

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <Link to="/trigonometrie" className="text-teal-600 hover:text-teal-700 font-bold mb-4 inline-block">
                ← Zurück zur Übersicht
            </Link>

            <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-teal-800 mb-4">Kosinussatz im allgemeinen Dreieck</h1>
                    <p className="text-gray-700">
                        Der Kosinussatz hilft dir, Seiten oder Winkel zu bestimmen, wenn keine Gegenüber-Paare bekannt sind. Er verknüpft
                        zwei Seiten, den eingeschlossenen Winkel und die gegenüberliegende Seite. So kannst du auch stumpfe Dreiecke sicher berechnen.
                    </p>
                </div>

                <div className="bg-white border border-indigo-100 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center gap-4">
                    <h2 className="text-lg font-semibold text-indigo-900">Lernvideo zum Kosinussatz</h2>
                    <a
                        href={KOSINUSSATZ_VIDEO_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700"
                    >
                        Video ansehen
                    </a>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-gray-800">Training: Kosinussatz anwenden</h2>
                        <button
                            onClick={generateTask}
                            className="px-4 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700"
                        >
                            Neue Aufgabe
                        </button>
                    </div>

                    {task && (
                        <div className="space-y-4">
                            <div className="bg-white border border-gray-200 rounded-lg p-4">
                                <h3 className="font-semibold text-gray-800 mb-2">Skizze zum aktuellen Dreieck</h3>
                                <TriangleSketch triangle={task.triangle} highlight={task.toFind} givenKeys={task.givenKeys} />
                            </div>

                            <div className="bg-white border border-gray-200 rounded-lg p-4">
                                <p className="font-medium text-gray-800">{task.prompt}</p>
                                <p className="text-sm text-gray-600 mt-2">
                                    <span className="font-semibold">Gegeben:</span> {givenSummary}
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center gap-3">
                                <label className="font-semibold text-gray-700 w-full sm:w-auto">Antwort:</label>
                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                    <input
                                        type="text"
                                        value={userAnswer}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUserAnswer(e.target.value)}
                                        className="w-full sm:w-40 border border-gray-300 rounded-lg px-3 py-2 text-center"
                                        placeholder="Deine Lösung"
                                    />
                                    <span className="text-gray-600">{task.unit}</span>
                                </div>
                            </div>

                            {feedback === 'info' && (
                                <p className="text-yellow-700 bg-yellow-100 border border-yellow-200 rounded-lg p-3 text-sm">
                                    Bitte gib eine Zahl ein.
                                </p>
                            )}
                            {feedback === 'correct' && (
                                <p className="text-green-700 bg-green-100 border border-green-200 rounded-lg p-3 text-sm">
                                    Perfekt! Deine Rechnung stimmt.
                                </p>
                            )}
                            {feedback === 'incorrect' && (
                                <p className="text-red-700 bg-red-100 border border-red-200 rounded-lg p-3 text-sm">
                                    Das passt noch nicht. Schau dir den Lösungsweg an.
                                </p>
                            )}

                            <div className="flex gap-4 flex-wrap">
                                <button
                                    onClick={checkAnswer}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                                >
                                    Prüfen
                                </button>
                                <button
                                    onClick={() => setShowSolution(prev => !prev)}
                                    className="px-4 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600"
                                >
                                    {showSolution ? 'Lösung verbergen' : 'Lösung anzeigen'}
                                </button>
                            </div>

                            {showSolution && (
                                <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                                    <h3 className="font-semibold text-gray-800">Lösungsweg</h3>
                                    <ul className="list-decimal pl-5 text-gray-700 space-y-2 text-sm">
                                        {task.steps.map((step, index) => (
                                            <li key={`cos-step-${index}`} className="space-y-1">
                                                <p className="font-medium text-gray-800">{step.text}</p>
                                                {step.math && (
                                                    <div className="bg-gray-50 border border-gray-200 rounded px-2 py-1 inline-block">
                                                        <InlineMath math={step.math} />
                                                    </div>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="font-bold text-gray-900">
                                        Ergebnis: {task.answerLabel} = {formatValue(task.correctAnswer, task.unit)}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Kosinussatz;

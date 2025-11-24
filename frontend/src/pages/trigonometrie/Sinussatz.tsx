import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';

const SINUSSATZ_VIDEO_URL = 'https://youtu.be/zA7vfHfNw1E?si=qS_mb1RnX2S2WWo-';

const angleSymbols = { alpha: 'α', beta: 'β', gamma: 'γ' } as const;
const angleKeys = ['alpha', 'beta', 'gamma'] as const;
const sideKeys = ['a', 'b', 'c'] as const;

export type AngleKey = (typeof angleKeys)[number];
export type SideKey = (typeof sideKeys)[number];

type TaskType = 'find_side' | 'find_angle';

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

interface SinusTask {
    triangle: Triangle;
    type: TaskType;
    toFind: AngleKey | SideKey;
    prompt: string;
    steps: SolutionStep[];
    correctAnswer: number;
    unit: string;
    givenKeys: (AngleKey | SideKey)[];
    answerLabel: string;
}

interface SketchPoints {
    A: { x: number; y: number };
    B: { x: number; y: number };
    C: { x: number; y: number };
}

const angleToSideMap: Record<AngleKey, SideKey> = {
    alpha: 'a',
    beta: 'b',
    gamma: 'c'
};

const degToRad = (deg: number) => (deg * Math.PI) / 180;
const radToDeg = (rad: number) => (rad * 180) / Math.PI;
const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;
const roundTo = (value: number, digits = 2) => Number(value.toFixed(digits));
const formatNumber = (value: number, digits = 2) => Number(value.toFixed(digits)).toString();
const formatValue = (value: number, unit = '', digits = 2) => `${formatNumber(value, digits)}${unit ? ` ${unit}` : ''}`;

const buildTriangle = (): Triangle => {
    let alpha = randomInRange(35, 110);
    let beta = randomInRange(25, 110);
    let gamma = 180 - alpha - beta;

    while (gamma < 25 || gamma > 110) {
        alpha = randomInRange(35, 110);
        beta = randomInRange(25, 110);
        gamma = 180 - alpha - beta;
    }

    const a = randomInRange(5, 12);
    const b = (a * Math.sin(degToRad(beta))) / Math.sin(degToRad(alpha));
    const c = (a * Math.sin(degToRad(gamma))) / Math.sin(degToRad(alpha));

    return {
        a: roundTo(a, 2),
        b: roundTo(b, 2),
        c: roundTo(c, 2),
        alpha: roundTo(alpha, 1),
        beta: roundTo(beta, 1),
        gamma: roundTo(gamma, 1)
    };
};

const buildSketchPoints = (triangle: Triangle): SketchPoints => {
    const width = 360;
    const height = 260;
    const margin = 30;

    const scale = (width - 2 * margin) / triangle.c;
    const base = triangle.c * scale;
    const sideA = triangle.a * scale;
    const sideB = triangle.b * scale;

    const Ax = margin;
    const Ay = height - margin;
    const Bx = Ax + base;
    const By = Ay;

    const px = (sideB * sideB - sideA * sideA + base * base) / (2 * base);
    const heightSquared = Math.max(sideB * sideB - px * px, 36);
    const py = Math.sqrt(heightSquared);

    const Cx = Ax + px;
    const Cy = Ay - py;

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

    const colorFor = (key: AngleKey | SideKey) => (highlight === key ? '#dc2626' : '#0f172a');

    const sideLabel = (side: SideKey) => {
        if (highlight === side) return `${side} = ?`;
        if (givenSet.has(side)) return `${side} = ${formatValue(triangle[side], 'cm')}`;
        return side;
    };

    const angleLabel = (angle: AngleKey) => {
        const symbol = angleSymbols[angle];
        if (highlight === angle) return `${symbol} = ?`;
        if (givenSet.has(angle)) return `${symbol} = ${formatValue(triangle[angle], '°', 1)}`;
        return symbol;
    };

    return (
        <svg width={360} height={260} viewBox="0 0 360 260" className="mx-auto">
            <polygon
                points={`${points.A.x},${points.A.y} ${points.B.x},${points.B.y} ${points.C.x},${points.C.y}`}
                fill="#f0f9ff"
                stroke="#0f172a"
                strokeWidth={2}
            />
            <line x1={points.A.x} y1={points.A.y} x2={points.B.x} y2={points.B.y} stroke={colorFor('c')} strokeWidth={3} />
            <line x1={points.A.x} y1={points.A.y} x2={points.C.x} y2={points.C.y} stroke={colorFor('b')} strokeWidth={3} />
            <line x1={points.B.x} y1={points.B.y} x2={points.C.x} y2={points.C.y} stroke={colorFor('a')} strokeWidth={3} />

            <text x={points.A.x - 15} y={points.A.y + 15} fontWeight="bold">
                A
            </text>
            <text x={points.B.x + 10} y={points.B.y + 15} fontWeight="bold">
                B
            </text>
            <text x={points.C.x} y={points.C.y - 10} fontWeight="bold" textAnchor="middle">
                C
            </text>

            <text x={(points.A.x + points.B.x) / 2} y={points.A.y + 24} textAnchor="middle" fill={colorFor('c')}>
                {sideLabel('c')}
            </text>
            <text x={(points.A.x + points.C.x) / 2 - 12} y={(points.A.y + points.C.y) / 2} textAnchor="end" fill={colorFor('b')}>
                {sideLabel('b')}
            </text>
            <text x={(points.B.x + points.C.x) / 2 + 10} y={(points.B.y + points.C.y) / 2} fill={colorFor('a')}>
                {sideLabel('a')}
            </text>

            <text x={points.A.x + 5} y={points.A.y - 12} fill={colorFor('alpha')}>
                {angleLabel('alpha')}
            </text>
            <text x={points.B.x - 70} y={points.B.y - 12} fill={colorFor('beta')}>
                {angleLabel('beta')}
            </text>
            <text x={points.C.x} y={points.C.y - 18} textAnchor="middle" fill={colorFor('gamma')}>
                {angleLabel('gamma')}
            </text>
        </svg>
    );
};

const pickDifferentAngle = (angleToAvoid: AngleKey): AngleKey => {
    const options = angleKeys.filter(angle => angle !== angleToAvoid);
    return options[Math.floor(Math.random() * options.length)];
};

const createFindSideTask = (triangle: Triangle): SinusTask => {
    const targetAngle = angleKeys[Math.floor(Math.random() * angleKeys.length)];
    const referenceAngle = pickDifferentAngle(targetAngle);
    const targetSide = angleToSideMap[targetAngle];
    const referenceSide = angleToSideMap[referenceAngle];

    const steps: SolutionStep[] = [
        {
            text: 'Sinussatz aufschreiben',
            math: `\\frac{${targetSide}}{\\sin(${angleSymbols[targetAngle]})} = \\frac{${referenceSide}}{\\sin(${angleSymbols[referenceAngle]})}`
        },
        {
            text: `${targetSide} isolieren (Äquivalenzumformung)`,
            math: `${targetSide} = \\frac{\\sin(${angleSymbols[targetAngle]})}{\\sin(${angleSymbols[referenceAngle]})} \\cdot ${referenceSide}`
        },
        {
            text: 'Werte einsetzen',
            math: `${targetSide} = \\frac{\\sin(${formatNumber(triangle[targetAngle], 1)}^\\circ)}{\\sin(${formatNumber(triangle[referenceAngle], 1)}^\\circ)} \\cdot ${formatNumber(triangle[referenceSide])}`
        },
        {
            text: 'Berechnen und runden',
            math: `${targetSide} \\approx ${formatNumber(triangle[targetSide])}\\,\\text{cm}`
        }
    ];

    return {
        triangle,
        type: 'find_side',
        toFind: targetSide,
        prompt: `Berechne die Seitenlänge ${targetSide}.`,
        steps,
        correctAnswer: triangle[targetSide],
        unit: 'cm',
        givenKeys: [targetAngle, referenceAngle, referenceSide],
        answerLabel: targetSide
    };
};

const createFindAngleTask = (triangle: Triangle): SinusTask => {
    const targetAngle = angleKeys[Math.floor(Math.random() * angleKeys.length)];
    const referenceAngle = pickDifferentAngle(targetAngle);
    const targetSide = angleToSideMap[targetAngle];
    const referenceSide = angleToSideMap[referenceAngle];

    const ratio = (triangle[targetSide] / triangle[referenceSide]) * Math.sin(degToRad(triangle[referenceAngle]));
    const clamped = Math.min(1, Math.max(-1, ratio));
    const calculatedAngle = radToDeg(Math.asin(clamped));

    const steps: SolutionStep[] = [
        {
            text: 'Sinussatz mit Winkeln formulieren',
            math: `\\frac{\\sin(${angleSymbols[targetAngle]})}{${targetSide}} = \\frac{\\sin(${angleSymbols[referenceAngle]})}{${referenceSide}}`
        },
        {
            text: `${angleSymbols[targetAngle]} isolieren`,
            math: `\\sin(${angleSymbols[targetAngle]}) = \\frac{${targetSide}}{${referenceSide}} \\cdot \\sin(${angleSymbols[referenceAngle]})`
        },
        {
            text: 'Werte einsetzen',
            math: `\\sin(${angleSymbols[targetAngle]}) = \\frac{${formatNumber(triangle[targetSide])}}{${formatNumber(triangle[referenceSide])}} \\cdot \\sin(${formatNumber(triangle[referenceAngle], 1)}^\\circ)`
        },
        {
            text: 'Arcussinus verwenden',
            math: `${angleSymbols[targetAngle]} = \\arcsin(${formatNumber(clamped, 3)}) \\approx ${formatNumber(calculatedAngle, 1)}^\\circ`
        }
    ];

    return {
        triangle,
        type: 'find_angle',
        toFind: targetAngle,
        prompt: `Bestimme den Winkel ${angleSymbols[targetAngle]}.`,
        steps,
        correctAnswer: triangle[targetAngle],
        unit: '°',
        givenKeys: [targetSide, referenceAngle, referenceSide],
        answerLabel: angleSymbols[targetAngle]
    };
};

const Sinussatz: React.FC = () => {
    const [task, setTask] = useState<SinusTask | null>(null);
    const [userAnswer, setUserAnswer] = useState('');
    const [feedback, setFeedback] = useState<'correct' | 'incorrect' | 'info' | null>(null);
    const [showSolution, setShowSolution] = useState(false);

    const generateTask = () => {
        const triangle = buildTriangle();
        const generator = Math.random() < 0.5 ? createFindSideTask : createFindAngleTask;
        setTask(generator(triangle));
        setUserAnswer('');
        setFeedback(null);
        setShowSolution(false);
    };

    useEffect(() => {
        generateTask();
    }, []);

    const tolerance = task?.unit === '°' ? 1 : 0.2;

    const checkAnswer = () => {
        if (!task) return;
        const cleaned = userAnswer.replace(',', '.');
        const value = parseFloat(cleaned);
        if (Number.isNaN(value)) {
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
        ? Array.from(new Set(task.givenKeys))
              .map(key => {
                  if (angleKeys.includes(key as AngleKey)) {
                      const angleKey = key as AngleKey;
                      return `${angleSymbols[angleKey]} = ${formatValue(task.triangle[angleKey], '°', 1)}`;
                  }
                  const sideKey = key as SideKey;
                  return `${sideKey} = ${formatValue(task.triangle[sideKey], 'cm')}`;
              })
              .join(', ')
        : '';

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <Link to="/trigonometrie" className="text-teal-600 hover:text-teal-700 font-bold mb-4 inline-block">
                ← Zurück zur Übersicht
            </Link>

            <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-teal-800 mb-4">Sinussatz im allgemeinen Dreieck</h1>
                    <p className="text-gray-700">
                        Der Sinussatz verknüpft jede Seitenlänge mit dem gegenüberliegenden Winkel. Sobald ein gegenüberliegendes Paar
                        bekannt ist, kannst du damit fehlende Winkel oder Seiten berechnen. Achte bei der Äquivalenzumformung auf saubere
                        Bruchschreibweisen, damit die Struktur der Rechnung sichtbar bleibt.
                    </p>
                </div>

                <div className="bg-white border border-teal-100 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center gap-4">
                    <h2 className="text-lg font-semibold text-teal-800">Lernvideo zum Sinussatz</h2>
                    <a
                        href={SINUSSATZ_VIDEO_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700"
                    >
                        Video ansehen
                    </a>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-gray-800">Training: Sinussatz anwenden</h2>
                        <button onClick={generateTask} className="px-4 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700">
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
                                    Stark! Deine Lösung passt.
                                </p>
                            )}
                            {feedback === 'incorrect' && (
                                <p className="text-red-700 bg-red-100 border border-red-200 rounded-lg p-3 text-sm">
                                    Prüfe deine Rechnung noch einmal oder sieh dir den Lösungsweg an.
                                </p>
                            )}

                            <div className="flex gap-4 flex-wrap">
                                <button onClick={checkAnswer} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
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
                                    <ol className="list-decimal pl-5 text-gray-700 space-y-3 text-sm">
                                        {task.steps.map((step, index) => (
                                            <li key={`step-${index}`} className="space-y-1">
                                                <p>{step.text}</p>
                                                {step.math && (
                                                    <div className="text-base">
                                                        <InlineMath math={step.math} />
                                                    </div>
                                                )}
                                            </li>
                                        ))}
                                    </ol>
                                    <div className="font-bold text-gray-900">
                                        Ergebnis: {task.answerLabel} = {formatValue(task.correctAnswer, task.unit, task.unit === '°' ? 1 : 2)}
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

export default Sinussatz;

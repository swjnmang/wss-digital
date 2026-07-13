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

const SKETCH_WIDTH = 360;
const SKETCH_HEIGHT = 260;
const SKETCH_MARGIN = 50;

const buildSketchPoints = (triangle: Triangle): SketchPoints => {
    // Lege A im Ursprung und B auf der x-Achse fest, C ergibt sich über den Winkel alpha.
    const alphaRad = degToRad(triangle.alpha);
    const rawA = { x: 0, y: 0 };
    const rawB = { x: triangle.c, y: 0 };
    const rawC = { x: triangle.b * Math.cos(alphaRad), y: triangle.b * Math.sin(alphaRad) };

    const minX = Math.min(rawA.x, rawB.x, rawC.x);
    const maxX = Math.max(rawA.x, rawB.x, rawC.x);
    const minY = 0;
    const maxY = Math.max(rawC.y, 0.0001);

    const availableWidth = SKETCH_WIDTH - 2 * SKETCH_MARGIN;
    const availableHeight = SKETCH_HEIGHT - 2 * SKETCH_MARGIN;
    const scale = Math.min(availableWidth / (maxX - minX), availableHeight / (maxY - minY));

    const toScreen = (p: { x: number; y: number }) => ({
        x: SKETCH_MARGIN + (p.x - minX) * scale,
        y: SKETCH_HEIGHT - SKETCH_MARGIN - (p.y - minY) * scale
    });

    return {
        A: toScreen(rawA),
        B: toScreen(rawB),
        C: toScreen(rawC)
    };
};

const GIVEN_COLOR = '#1f2937';
const HIGHLIGHT_COLOR = '#dc2626';

// Zeichnet einen kleinen Winkel-Bogen an einem Dreiecks-Knoten, Label sitzt auf der Winkelhalbierenden nach außen versetzt.
const drawVertexAngleArc = (
    vertex: { x: number; y: number },
    p1: { x: number; y: number },
    p2: { x: number; y: number },
    radius: number,
    label: string,
    color: string,
    key: string
) => {
    const v1 = [p1.x - vertex.x, p1.y - vertex.y];
    const v2 = [p2.x - vertex.x, p2.y - vertex.y];
    const len1 = Math.sqrt(v1[0] * v1[0] + v1[1] * v1[1]) || 1;
    const len2 = Math.sqrt(v2[0] * v2[0] + v2[1] * v2[1]) || 1;
    const unit1 = [v1[0] / len1, v1[1] / len1];
    const unit2 = [v2[0] / len2, v2[1] / len2];

    const start = [vertex.x + unit1[0] * radius, vertex.y + unit1[1] * radius];
    const end = [vertex.x + unit2[0] * radius, vertex.y + unit2[1] * radius];

    const angle1 = Math.atan2(v1[1], v1[0]);
    const angle2 = Math.atan2(v2[1], v2[0]);
    let delta = angle2 - angle1;
    delta = ((delta + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI;
    const largeArc = Math.abs(delta) > Math.PI ? 1 : 0;
    const sweep = delta > 0 ? 1 : 0;

    let bisector = [unit1[0] + unit2[0], unit1[1] + unit2[1]];
    const bisectorLen = Math.sqrt(bisector[0] * bisector[0] + bisector[1] * bisector[1]);
    bisector = bisectorLen > 0.0001 ? [bisector[0] / bisectorLen, bisector[1] / bisectorLen] : [unit1[0], unit1[1]];

    const labelRadius = radius + 14;
    const labelX = vertex.x + bisector[0] * labelRadius;
    const labelY = vertex.y + bisector[1] * labelRadius;

    return (
        <g key={`arc-${key}`}>
            <path
                d={`M ${start[0]} ${start[1]} A ${radius} ${radius} 0 ${largeArc} ${sweep} ${end[0]} ${end[1]}`}
                fill="none"
                stroke={color}
                strokeWidth={1.2}
            />
            <text x={labelX} y={labelY} fontSize="13" fill={color} textAnchor="middle" dy="0.3em">
                {label}
            </text>
        </g>
    );
};

const TriangleSketch: React.FC<{
    triangle: Triangle;
    highlight?: AngleKey | SideKey;
    givenKeys: (AngleKey | SideKey)[];
}> = ({ triangle, highlight, givenKeys }) => {
    const points = buildSketchPoints(triangle);
    const givenSet = new Set(givenKeys);
    const colorFor = (key: AngleKey | SideKey) => (highlight === key ? HIGHLIGHT_COLOR : GIVEN_COLOR);
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

    const centroid = {
        x: (points.A.x + points.B.x + points.C.x) / 3,
        y: (points.A.y + points.B.y + points.C.y) / 3
    };

    const pointLabelProps = (p: { x: number; y: number }) => {
        const dx = p.x - centroid.x;
        const dy = p.y - centroid.y;
        const len = Math.sqrt(dx * dx + dy * dy) || 1;
        const offset = 16;
        return {
            x: p.x + (dx / len) * offset,
            y: p.y + (dy / len) * offset,
            textAnchor: dx > 5 ? 'start' : dx < -5 ? 'end' : 'middle',
            dy: dy > 5 ? '0.8em' : dy < -5 ? '0em' : '0.3em'
        } as const;
    };

    const labelA = pointLabelProps(points.A);
    const labelB = pointLabelProps(points.B);
    const labelC = pointLabelProps(points.C);

    const sideLabelPos = (p1: { x: number; y: number }, p2: { x: number; y: number }, offset = 16) => {
        const mx = (p1.x + p2.x) / 2;
        const my = (p1.y + p2.y) / 2;
        const dx = mx - centroid.x;
        const dy = my - centroid.y;
        const len = Math.sqrt(dx * dx + dy * dy) || 1;
        return { x: mx + (dx / len) * offset, y: my + (dy / len) * offset };
    };

    const sideLabelC = sideLabelPos(points.A, points.B);
    const sideLabelB = sideLabelPos(points.A, points.C);
    const sideLabelA = sideLabelPos(points.B, points.C);

    return (
        <svg width="100%" height="100%" viewBox={`0 0 ${SKETCH_WIDTH} ${SKETCH_HEIGHT}`} preserveAspectRatio="xMidYMid meet" className="mx-auto">
            <polygon
                points={`${points.A.x},${points.A.y} ${points.B.x},${points.B.y} ${points.C.x},${points.C.y}`}
                fill="#eef2ff"
                stroke="#0f172a"
                strokeWidth={2}
            />
            <line x1={points.A.x} y1={points.A.y} x2={points.B.x} y2={points.B.y} stroke={colorFor('c')} strokeWidth={3} />
            <line x1={points.A.x} y1={points.A.y} x2={points.C.x} y2={points.C.y} stroke={colorFor('b')} strokeWidth={3} />
            <line x1={points.B.x} y1={points.B.y} x2={points.C.x} y2={points.C.y} stroke={colorFor('a')} strokeWidth={3} />

            <circle cx={points.A.x} cy={points.A.y} r={2.5} fill="#0f172a" />
            <circle cx={points.B.x} cy={points.B.y} r={2.5} fill="#0f172a" />
            <circle cx={points.C.x} cy={points.C.y} r={2.5} fill="#0f172a" />

            <text x={labelA.x} y={labelA.y} dy={labelA.dy} textAnchor={labelA.textAnchor} fontSize="14" fontWeight="bold">
                A
            </text>
            <text x={labelB.x} y={labelB.y} dy={labelB.dy} textAnchor={labelB.textAnchor} fontSize="14" fontWeight="bold">
                B
            </text>
            <text x={labelC.x} y={labelC.y} dy={labelC.dy} textAnchor={labelC.textAnchor} fontSize="14" fontWeight="bold">
                C
            </text>

            <text x={sideLabelC.x} y={sideLabelC.y} textAnchor="middle" fontSize="13" fill={colorFor('c')}>
                {getSideLabel('c')}
            </text>
            <text x={sideLabelB.x} y={sideLabelB.y} textAnchor="middle" fontSize="13" fill={colorFor('b')}>
                {getSideLabel('b')}
            </text>
            <text x={sideLabelA.x} y={sideLabelA.y} textAnchor="middle" fontSize="13" fill={colorFor('a')}>
                {getSideLabel('a')}
            </text>

            {drawVertexAngleArc(points.A, points.C, points.B, 20, getAngleLabel('alpha'), colorFor('alpha'), 'alpha')}
            {drawVertexAngleArc(points.B, points.A, points.C, 20, getAngleLabel('beta'), colorFor('beta'), 'beta')}
            {drawVertexAngleArc(points.C, points.B, points.A, 20, getAngleLabel('gamma'), colorFor('gamma'), 'gamma')}
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
                    math: `${targetSide}^2 = ${adj1}^2 + ${adj2}^2 - 2\\cdot ${adj1}\\cdot ${adj2}\\cdot\\cos(${angleSymbols[targetAngle]})`
                },
                {
                    text: 'Setze die bekannten Seiten und den Winkel ein.',
                    math: `${targetSide}^2 = ${formatNumber(triangle[adj1])}^2 + ${formatNumber(triangle[adj2])}^2 - 2\\cdot${formatNumber(triangle[adj1])}\\cdot${formatNumber(triangle[adj2])}\\cdot\\cos(${formatNumber(triangle[targetAngle], 1)}^{\\circ})`
                },
                {
                    text: 'Fasse den Term zusammen.',
                    math: `${targetSide}^2 = ${round(underRoot, 3)} \\Leftrightarrow ${targetSide} = \\sqrt{${round(underRoot, 3)}}`
                },
                {
                    text: 'Ziehe die Wurzel, um die Seite zu erhalten.',
                    math: `${targetSide} \\approx ${formatNumber(Math.sqrt(Math.max(underRoot, 0)))}`
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
                math: `\\cos(${angleSymbols[targetAngle]}) = \\frac{${adj1}^2 + ${adj2}^2 - ${opposite}^2}{2\\cdot ${adj1}\\cdot ${adj2}}`
            },
            {
                text: 'Setze die bekannten Seiten ein.',
                math: `\\cos(${angleSymbols[targetAngle]}) = \\frac{${formatNumber(triangle[adj1])}^2 + ${formatNumber(triangle[adj2])}^2 - ${formatNumber(triangle[opposite])}^2}{2\\cdot${formatNumber(triangle[adj1])}\\cdot${formatNumber(triangle[adj2])}}`
            },
            {
                text: 'Berechne den Quotienten.',
                math: `\\cos(${angleSymbols[targetAngle]}) = ${round(clamped, 4)} \\Leftrightarrow ${angleSymbols[targetAngle]} = \\cos^{-1}(${round(clamped, 4)})`
            },
            {
                text: 'Bestimme den Winkel in Grad.',
                math: `${angleSymbols[targetAngle]} \\approx ${formatNumber(triangle[targetAngle], 1)}^{\\circ}`
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

    // Maximal 1% relative Toleranz, mit kleiner Mindesttoleranz für sehr kleine Werte
    const tolerance = task ? Math.max(Math.abs(task.correctAnswer) * 0.01, 0.01) : 0.01;

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
            <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-teal-800 mb-4">Kosinussatz im allgemeinen Dreieck</h1>
                    <p className="text-gray-700 max-w-2xl mx-auto">
                        Der Kosinussatz hilft dir, Seiten oder Winkel zu bestimmen, wenn keine Gegenüber-Paare bekannt sind. Er verknüpft
                        zwei Seiten, den eingeschlossenen Winkel und die gegenüberliegende Seite. So kannst du auch stumpfe Dreiecke sicher berechnen.
                    </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                    <h2 className="text-xl font-semibold text-gray-800 text-center mb-4">Training: Kosinussatz anwenden</h2>

                    {task && (
                        <div className="space-y-4">
                            <div className="bg-white border border-gray-200 rounded-lg p-4">
                                <h3 className="font-semibold text-gray-800 mb-2 text-center">Skizze zum aktuellen Dreieck</h3>
                                <div className="w-full max-w-[420px] mx-auto h-[300px]">
                                    <TriangleSketch triangle={task.triangle} highlight={task.toFind} givenKeys={task.givenKeys} />
                                </div>
                            </div>

                            <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                                <p className="font-medium text-gray-800">{task.prompt}</p>
                                <p className="text-sm text-gray-600 mt-2">
                                    <span className="font-semibold">Gegeben:</span> {givenSummary}
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                                <label className="font-semibold text-gray-700 w-full sm:w-auto text-center sm:text-left">Antwort:</label>
                                <div className="flex items-center gap-2 w-full sm:w-auto justify-center">
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
                                <p className="text-yellow-700 bg-yellow-100 border border-yellow-200 rounded-lg p-3 text-sm text-center max-w-md mx-auto">
                                    Bitte gib eine Zahl ein.
                                </p>
                            )}
                            {feedback === 'correct' && (
                                <p className="text-green-700 bg-green-100 border border-green-200 rounded-lg p-3 text-sm text-center max-w-md mx-auto">
                                    Perfekt! Deine Rechnung stimmt.
                                </p>
                            )}
                            {feedback === 'incorrect' && (
                                <p className="text-red-700 bg-red-100 border border-red-200 rounded-lg p-3 text-sm text-center max-w-md mx-auto">
                                    Das passt noch nicht. Schau dir den Lösungsweg an.
                                </p>
                            )}

                            <div className="flex gap-4 flex-wrap justify-center items-center">
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
                                <button
                                    onClick={generateTask}
                                    className="px-4 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700"
                                >
                                    Neue Aufgabe
                                </button>
                            </div>

                            <div className="flex justify-center">
                                <a
                                    href={KOSINUSSATZ_VIDEO_URL}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700"
                                >
                                    Video ansehen
                                </a>
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

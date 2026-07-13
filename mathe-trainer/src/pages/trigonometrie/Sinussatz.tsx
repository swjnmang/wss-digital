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
    const maxY = Math.max(rawC.y, 0.0001);

    const availableWidth = SKETCH_WIDTH - 2 * SKETCH_MARGIN;
    const availableHeight = SKETCH_HEIGHT - 2 * SKETCH_MARGIN;
    const scale = Math.min(availableWidth / (maxX - minX), availableHeight / maxY);

    const toScreen = (p: { x: number; y: number }) => ({
        x: SKETCH_MARGIN + (p.x - minX) * scale,
        y: SKETCH_HEIGHT - SKETCH_MARGIN - p.y * scale
    });

    return {
        A: toScreen(rawA),
        B: toScreen(rawB),
        C: toScreen(rawC)
    };
};

const GIVEN_COLOR = '#1F2937';
const HIGHLIGHT_COLOR = '#DC2626';

// Zeichnet einen kleinen Winkel-Bogen an einem Dreiecks-Knoten (TikZ-typisch: dünner Bogen + Symbol)
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
    const len1 = Math.sqrt(v1[0] * v1[0] + v1[1] * v1[1]);
    const len2 = Math.sqrt(v2[0] * v2[0] + v2[1] * v2[1]);
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

    const labelRadius = radius + 13;
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
            <text x={labelX} y={labelY} fontSize="14" fill={color} textAnchor="middle" dy="0.3em">
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

    // Punktlabels werden vom Dreiecksschwerpunkt weg nach außen versetzt (immer außerhalb der Fläche)
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
        };
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
        <svg
            width="100%"
            height="100%"
            viewBox={`0 0 ${SKETCH_WIDTH} ${SKETCH_HEIGHT}`}
            preserveAspectRatio="xMidYMid meet"
            className="mx-auto"
        >
            <polygon
                points={`${points.A.x},${points.A.y} ${points.B.x},${points.B.y} ${points.C.x},${points.C.y}`}
                fill="none"
                stroke="#0f172a"
                strokeWidth={1.3}
            />

            <circle cx={points.A.x} cy={points.A.y} r={2.5} fill="#0f172a" />
            <circle cx={points.B.x} cy={points.B.y} r={2.5} fill="#0f172a" />
            <circle cx={points.C.x} cy={points.C.y} r={2.5} fill="#0f172a" />

            <text x={labelA.x} y={labelA.y} dy={labelA.dy} textAnchor={labelA.textAnchor as 'start' | 'middle' | 'end'} fontSize="14">
                A
            </text>
            <text x={labelB.x} y={labelB.y} dy={labelB.dy} textAnchor={labelB.textAnchor as 'start' | 'middle' | 'end'} fontSize="14">
                B
            </text>
            <text x={labelC.x} y={labelC.y} dy={labelC.dy} textAnchor={labelC.textAnchor as 'start' | 'middle' | 'end'} fontSize="14">
                C
            </text>

            <text x={sideLabelC.x} y={sideLabelC.y} textAnchor="middle" fontSize="13" fill={colorFor('c')}>
                {sideLabel('c')}
            </text>
            <text x={sideLabelB.x} y={sideLabelB.y} textAnchor="middle" fontSize="13" fill={colorFor('b')}>
                {sideLabel('b')}
            </text>
            <text x={sideLabelA.x} y={sideLabelA.y} textAnchor="middle" fontSize="13" fill={colorFor('a')}>
                {sideLabel('a')}
            </text>

            {drawVertexAngleArc(points.A, points.C, points.B, 20, angleLabel('alpha'), colorFor('alpha'), 'alpha')}
            {drawVertexAngleArc(points.B, points.A, points.C, 20, angleLabel('beta'), colorFor('beta'), 'beta')}
            {drawVertexAngleArc(points.C, points.B, points.A, 20, angleLabel('gamma'), colorFor('gamma'), 'gamma')}
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
            text: 'Umkehrfunktion (Sinus⁻¹) verwenden',
            math: `${angleSymbols[targetAngle]} = \\sin^{-1}(${formatNumber(clamped, 3)}) \\approx ${formatNumber(calculatedAngle, 1)}^\\circ`
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

    // Maximal 1% relative Toleranz, mit kleiner Mindesttoleranz für sehr kleine Werte
    const tolerance = task ? Math.max(Math.abs(task.correctAnswer) * 0.01, 0.01) : 0.01;

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
            <div className="bg-white rounded-xl shadow-lg p-6">
                <h1 className="text-3xl font-bold text-teal-800 text-center mb-4">Sinussatz im allgemeinen Dreieck</h1>
                <p className="text-gray-700 text-center max-w-2xl mx-auto mb-6">
                    Der Sinussatz verknüpft jede Seitenlänge mit dem gegenüberliegenden Winkel. Sobald ein gegenüberliegendes
                    Paar bekannt ist, kannst du damit fehlende Winkel oder Seiten berechnen.
                </p>

                {task && (
                    <>
                        <div className="flex justify-center mb-6">
                            <div className="w-full max-w-[500px] mx-auto h-[350px] bg-gray-50 rounded-lg border-2 border-gray-200 p-4">
                                <TriangleSketch triangle={task.triangle} highlight={task.toFind} givenKeys={task.givenKeys} />
                            </div>
                        </div>

                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-6 text-center">
                            <p className="text-lg font-medium mb-2">{task.prompt}</p>
                            <p className="text-sm text-gray-600">
                                <span className="font-semibold">Gegeben:</span> {givenSummary}
                            </p>
                        </div>

                        <div className="flex justify-center mb-6">
                            <div className="flex items-center gap-2">
                                <label className="font-semibold text-gray-700">Antwort:</label>
                                <input
                                    type="text"
                                    value={userAnswer}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUserAnswer(e.target.value)}
                                    className="w-32 border border-gray-300 rounded-lg px-3 py-2 text-center"
                                    placeholder="Lösung"
                                />
                                <span className="text-gray-500 w-8">{task.unit}</span>
                            </div>
                        </div>

                        {feedback === 'info' && (
                            <p className="text-yellow-700 bg-yellow-100 border border-yellow-200 rounded-lg p-3 text-sm text-center mb-6 max-w-md mx-auto">
                                Bitte gib eine Zahl ein.
                            </p>
                        )}
                        {feedback === 'correct' && (
                            <p className="text-green-700 bg-green-100 border border-green-200 rounded-lg p-3 text-sm text-center mb-6 max-w-md mx-auto">
                                Stark! Deine Lösung passt.
                            </p>
                        )}
                        {feedback === 'incorrect' && (
                            <p className="text-red-700 bg-red-100 border border-red-200 rounded-lg p-3 text-sm text-center mb-6 max-w-md mx-auto">
                                Prüfe deine Rechnung noch einmal oder sieh dir den Lösungsweg an.
                            </p>
                        )}

                        <div className="flex justify-center gap-4 mb-6">
                            <button onClick={checkAnswer} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                                Prüfen
                            </button>
                            <button
                                onClick={() => setShowSolution(prev => !prev)}
                                className="px-6 py-2 bg-yellow-500 text-white rounded-lg font-medium hover:bg-yellow-600 transition-colors"
                            >
                                {showSolution ? 'Lösung verbergen' : 'Lösung anzeigen'}
                            </button>
                            <button onClick={generateTask} className="px-6 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors">
                                Neue Aufgabe
                            </button>
                        </div>

                        <div className="flex justify-center mb-6">
                            <a
                                href={SINUSSATZ_VIDEO_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700"
                            >
                                Video ansehen
                            </a>
                        </div>

                        {showSolution && (
                            <div className="bg-gray-100 p-6 rounded-lg border border-gray-200 text-left">
                                <h3 className="font-bold text-lg mb-4">Lösungsweg:</h3>
                                <div className="bg-white rounded-lg border border-gray-200 p-4">
                                    <ol className="list-decimal pl-5 space-y-3 text-sm text-gray-700">
                                        {task.steps.map((step, index) => (
                                            <li key={`step-${index}`} className="space-y-1">
                                                <p className="font-medium text-gray-800">{step.text}</p>
                                                {step.math && (
                                                    <div className="bg-gray-50 border border-gray-200 rounded px-2 py-1 inline-block">
                                                        <InlineMath math={step.math} />
                                                    </div>
                                                )}
                                            </li>
                                        ))}
                                    </ol>
                                    <div className="font-bold text-gray-900 mt-4">
                                        Ergebnis: {task.answerLabel} = {formatValue(task.correctAnswer, task.unit, task.unit === '°' ? 1 : 2)}
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Sinussatz;

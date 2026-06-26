import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';

type TaskType = 'percent_to_angle' | 'angle_to_percent';

interface SolutionStep {
    text: string;
    math?: string;
}

interface SlopeTask {
    type: TaskType;
    percent: number;
    angle: number;
    horizontal: number;
    vertical: number;
    prompt: string;
    steps: SolutionStep[];
    correctAnswer: number;
    unit: '%' | '°';
}

const degToRad = (deg: number) => deg * (Math.PI / 180);
const radToDeg = (rad: number) => rad * (180 / Math.PI);
const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;
const round = (val: number, digits = 2) => parseFloat(val.toFixed(digits));
const formatNumber = (val: number, digits = 2) => parseFloat(val.toFixed(digits)).toString();

const SlopeSketch: React.FC<{ horizontal: number; vertical: number; highlight: 'angle' | 'percent' }> = ({
    horizontal,
    vertical,
    highlight
}) => {
    const width = 400;
    const height = 240;
    const margin = 40;
    const rightLabelSpace = 90;
    const maxRun = width - 2 * margin - rightLabelSpace;
    const scale = maxRun / horizontal;
    const runPx = horizontal * scale;
    const riseRaw = vertical * scale;
    const riseCap = height - 2 * margin;
    const riseScaleAdjust = riseRaw > riseCap ? riseCap / riseRaw : 1;
    const runPxAdjusted = runPx * (riseRaw > riseCap ? riseScaleAdjust : 1);
    const risePx = riseRaw * (riseRaw > riseCap ? riseScaleAdjust : 1);

    const Ax = margin;
    const Ay = height - margin;
    const Bx = margin + runPxAdjusted;
    const By = height - margin;
    const Cx = Bx;
    const Cy = By - risePx;

    return (
        <svg width={400} height={240} viewBox="0 0 400 240" className="mx-auto">
            <polygon
                points={`${Ax},${Ay} ${Bx},${By} ${Cx},${Cy}`}
                fill="#eef2ff"
                stroke="#0f172a"
                strokeWidth={2}
            />
            <line x1={Ax} y1={Ay} x2={Bx} y2={By} stroke="#1f2937" strokeWidth={3} />
            <line x1={Bx} y1={By} x2={Cx} y2={Cy} stroke="#1f2937" strokeWidth={3} />
            <line x1={Ax} y1={Ay} x2={Cx} y2={Cy} stroke="#dc2626" strokeWidth={3} />

            <text x={(Ax + Bx) / 2} y={Ay + 22} textAnchor="middle" fontSize="13" fill="#1f2937">
                horizontale Strecke
            </text>
            <text x={Bx + 12} y={(By + Cy) / 2} fontSize="13" fill="#1f2937">
                Höhen-
            </text>
            <text x={Bx + 12} y={(By + Cy) / 2 + 16} fontSize="13" fill="#1f2937">
                unterschied
            </text>
            <text x={(Ax + Cx) / 2 - 10} y={(Ay + Cy) / 2 - 5} fontSize="13" fill="#dc2626" textAnchor="end">
                Weg
            </text>
            <text
                x={Ax + 28}
                y={Ay - 10}
                fontSize="14"
                fontWeight="bold"
                fill={highlight === 'angle' ? '#dc2626' : '#1f2937'}
            >
                α{highlight === 'angle' ? ' = ?' : ''}
            </text>
        </svg>
    );
};

const buildTask = (): SlopeTask => {
    const type: TaskType = Math.random() < 0.5 ? 'percent_to_angle' : 'angle_to_percent';
    const horizontal = round(randomInRange(50, 200), 0);

    if (type === 'percent_to_angle') {
        const percent = round(randomInRange(3, 60), 1);
        const angle = radToDeg(Math.atan(percent / 100));
        const vertical = (percent / 100) * horizontal;

        const steps: SolutionStep[] = [
            {
                text: 'Die Steigung in Prozent ist das Verhältnis von Höhenunterschied zu horizontaler Strecke, multipliziert mit 100.',
                math: `\\text{Steigung} = \\frac{\\text{Höhenunterschied}}{\\text{horizontale Strecke}} \\cdot 100\\%`
            },
            {
                text: 'Dieses Verhältnis ist genau der Tangens des Steigungswinkels.',
                math: `\\tan(\\alpha) = \\frac{\\text{Steigung in \\%}}{100} = \\frac{${formatNumber(percent, 1)}}{100} = ${formatNumber(percent / 100, 4)}`
            },
            {
                text: 'Löse mit der Umkehrfunktion Tangens⁻¹ nach dem Winkel auf.',
                math: `\\alpha = \\tan^{-1}(${formatNumber(percent / 100, 4)})`
            },
            {
                text: 'Berechne und runde den Winkel.',
                math: `\\alpha \\approx ${formatNumber(angle, 1)}^{\\circ}`
            }
        ];

        return {
            type,
            percent,
            angle: round(angle, 1),
            horizontal,
            vertical: round(vertical, 1),
            prompt: `Eine Straße hat eine Steigung von ${formatNumber(percent, 1)} %. Berechne den Steigungswinkel α in Grad.`,
            steps,
            correctAnswer: round(angle, 1),
            unit: '°'
        };
    }

    const angle = round(randomInRange(1, 40), 1);
    const percent = Math.tan(degToRad(angle)) * 100;
    const vertical = Math.tan(degToRad(angle)) * horizontal;

    const steps: SolutionStep[] = [
        {
            text: 'Im rechtwinkligen Dreieck beschreibt der Tangens des Steigungswinkels das Verhältnis von Höhenunterschied zu horizontaler Strecke.',
            math: `\\tan(\\alpha) = \\frac{\\text{Höhenunterschied}}{\\text{horizontale Strecke}}`
        },
        {
            text: 'Setze den gegebenen Winkel ein.',
            math: `\\tan(${formatNumber(angle, 1)}^{\\circ}) = ${formatNumber(percent / 100, 4)}`
        },
        {
            text: 'Die Steigung in Prozent ist dieses Verhältnis multipliziert mit 100.',
            math: `\\text{Steigung} = \\tan(${formatNumber(angle, 1)}^{\\circ}) \\cdot 100\\%`
        },
        {
            text: 'Berechne und runde das Ergebnis.',
            math: `\\text{Steigung} \\approx ${formatNumber(percent, 1)}\\,\\%`
        }
    ];

    return {
        type,
        percent: round(percent, 1),
        angle,
        horizontal,
        vertical: round(vertical, 1),
        prompt: `Eine Straße steigt unter einem Winkel von α = ${formatNumber(angle, 1)}°. Berechne die Steigung in Prozent.`,
        steps,
        correctAnswer: round(percent, 1),
        unit: '%'
    };
};

const SteigungswinkelProzentGrad: React.FC = () => {
    const [task, setTask] = useState<SlopeTask | null>(null);
    const [userAnswer, setUserAnswer] = useState('');
    const [feedback, setFeedback] = useState<'correct' | 'incorrect' | 'info' | null>(null);
    const [showSolution, setShowSolution] = useState(false);

    const generateTask = () => {
        setTask(buildTask());
        setUserAnswer('');
        setFeedback(null);
        setShowSolution(false);
    };

    useEffect(() => {
        generateTask();
    }, []);

    const tolerance = task?.unit === '°' ? 0.5 : 1;

    const checkAnswer = () => {
        if (!task) return;
        const value = parseFloat(userAnswer.replace(',', '.'));
        if (isNaN(value)) {
            setFeedback('info');
            return;
        }
        setFeedback(Math.abs(value - task.correctAnswer) <= tolerance ? 'correct' : 'incorrect');
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-teal-800 mb-4">Steigungswinkel in Prozent und Grad</h1>
                    <p className="text-gray-700">
                        Straßen- oder Dachneigungen werden oft in Prozent angegeben, mathematisch beschreibt man sie aber über den
                        Steigungswinkel in Grad. Beide Größen sind über den Tangens im rechtwinkligen Dreieck miteinander verknüpft.
                    </p>
                </div>

                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 space-y-3">
                    <h2 className="text-lg font-semibold text-indigo-900">So funktioniert die Umrechnung</h2>
                    <p className="text-gray-700 text-sm">
                        Stell dir ein rechtwinkliges Dreieck vor: Die horizontale Strecke ist die Ankathete, der Höhenunterschied die
                        Gegenkathete des Steigungswinkels α. Die Steigung in Prozent ist nichts anderes als dieses Seitenverhältnis,
                        multipliziert mit 100 – also genau der Tangens von α.
                    </p>
                    <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 inline-block">
                        <InlineMath math="\tan(\alpha) = \frac{\text{Höhenunterschied}}{\text{horizontale Strecke}} = \frac{\text{Steigung in \%}}{100}" />
                    </div>
                    <p className="text-gray-700 text-sm">Daraus ergeben sich zwei Umrechnungen:</p>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="bg-white border border-gray-200 rounded-lg px-3 py-2">
                            <p className="text-xs text-gray-500 mb-1">Von Prozent zu Grad</p>
                            <InlineMath math="\alpha = \tan^{-1}\!\left(\frac{\text{Steigung in \%}}{100}\right)" />
                        </div>
                        <div className="bg-white border border-gray-200 rounded-lg px-3 py-2">
                            <p className="text-xs text-gray-500 mb-1">Von Grad zu Prozent</p>
                            <InlineMath math="\text{Steigung in \%} = \tan(\alpha) \cdot 100" />
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-gray-800">Training: Steigung umrechnen</h2>
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
                                <h3 className="font-semibold text-gray-800 mb-2">Skizze zur aktuellen Aufgabe</h3>
                                <SlopeSketch
                                    horizontal={task.horizontal}
                                    vertical={task.vertical}
                                    highlight={task.type === 'percent_to_angle' ? 'angle' : 'percent'}
                                />
                            </div>

                            <div className="bg-white border border-gray-200 rounded-lg p-4">
                                <p className="font-medium text-gray-800">{task.prompt}</p>
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
                                            <li key={`slope-step-${index}`} className="space-y-1">
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
                                        Ergebnis: {task.unit === '°' ? 'α' : 'Steigung'} ={' '}
                                        {formatNumber(task.correctAnswer, 1)}
                                        {task.unit}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex justify-center">
                    <Link to="/trigonometrie" className="text-[var(--accent)] hover:underline text-sm sm:text-base">
                        <i className="fa-solid fa-arrow-left mr-2"></i>
                        Zurück zur Übersicht
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default SteigungswinkelProzentGrad;

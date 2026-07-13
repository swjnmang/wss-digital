import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';

interface SolutionStep {
    text: string;
    math?: string;
}

interface SketchSpec {
    horizontal: number;
    vertical: number;
    horizontalLabel: string;
    verticalLabel: string;
    hypotenuseLabel: string;
    angleLabel: string;
    highlight: 'horizontal' | 'vertical' | 'hypotenuse' | 'angle' | 'none';
    askedLabel?: string;
}

interface SlopeTask {
    prompt: string;
    steps: SolutionStep[];
    correctAnswer: number;
    unit: string;
    resultLabel: string;
    sketch: SketchSpec;
}

const degToRad = (deg: number) => deg * (Math.PI / 180);
const radToDeg = (rad: number) => rad * (180 / Math.PI);
const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;
const randomInt = (min: number, max: number) => Math.floor(randomInRange(min, max + 1));
const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const round = (val: number, digits = 2) => parseFloat(val.toFixed(digits));
const formatNumber = (val: number, digits = 2) => parseFloat(val.toFixed(digits)).toString();

interface Triangle {
    horizontal: number;
    vertical: number;
    hypotenuse: number;
    angle: number;
    percent: number;
}

const triangleFromHorizontalPercent = (horizontal: number, percent: number): Triangle => {
    const vertical = (horizontal * percent) / 100;
    const angle = radToDeg(Math.atan(percent / 100));
    const hypotenuse = Math.sqrt(horizontal ** 2 + vertical ** 2);
    return { horizontal, vertical, hypotenuse, angle, percent };
};

const triangleFromHorizontalAngle = (horizontal: number, angle: number): Triangle => {
    const vertical = horizontal * Math.tan(degToRad(angle));
    const percent = (vertical / horizontal) * 100;
    const hypotenuse = horizontal / Math.cos(degToRad(angle));
    return { horizontal, vertical, hypotenuse, angle, percent };
};

const triangleFromPercentDistance = (percent: number, distance: number): Triangle => {
    const angle = radToDeg(Math.atan(percent / 100));
    const vertical = Math.sin(degToRad(angle)) * distance;
    const horizontal = Math.cos(degToRad(angle)) * distance;
    return { horizontal, vertical, hypotenuse: distance, angle, percent };
};

const triangleFromHorizontalVertical = (horizontal: number, vertical: number): Triangle => {
    const angle = radToDeg(Math.atan(vertical / horizontal));
    const percent = (vertical / horizontal) * 100;
    const hypotenuse = Math.sqrt(horizontal ** 2 + vertical ** 2);
    return { horizontal, vertical, hypotenuse, angle, percent };
};

const SlopeSketch: React.FC<SketchSpec> = ({
    horizontal,
    vertical,
    horizontalLabel,
    verticalLabel,
    hypotenuseLabel,
    angleLabel,
    highlight,
    askedLabel
}) => {
    const width = 420;
    const height = 250;
    const margin = 44;
    const rightLabelSpace = 100;
    const maxRun = width - 2 * margin - rightLabelSpace;
    const riseCap = height - 2 * margin;
    // Steigungswinkel sind oft sehr flach (wenige Grad). Ohne eine Mindesthöhe
    // würde das Dreieck dann nur als winziger Strich am unteren Bildrand erscheinen.
    // Die Zeichnung ist bewusst nicht maßstabsgetreu, damit sie immer gut erkennbar ist.
    const minRisePx = riseCap * 0.4;
    const trueRisePx = (vertical / horizontal) * maxRun;
    const risePx = Math.min(riseCap, Math.max(minRisePx, trueRisePx));

    const Ax = margin;
    const Ay = height - margin;
    const Bx = margin + maxRun;
    const By = height - margin;
    const Cx = Bx;
    const Cy = By - risePx;

    const colorFor = (part: SketchSpec['highlight']) => (highlight === part ? '#dc2626' : '#1f2937');

    return (
        <svg width={420} height={250} viewBox="0 0 420 250" className="mx-auto">
            <polygon points={`${Ax},${Ay} ${Bx},${By} ${Cx},${Cy}`} fill="#eef2ff" stroke="#0f172a" strokeWidth={2} />
            <line x1={Ax} y1={Ay} x2={Bx} y2={By} stroke={colorFor('horizontal')} strokeWidth={3} />
            <line x1={Bx} y1={By} x2={Cx} y2={Cy} stroke={colorFor('vertical')} strokeWidth={3} />
            <line x1={Ax} y1={Ay} x2={Cx} y2={Cy} stroke={colorFor('hypotenuse')} strokeWidth={3} />

            <text x={(Ax + Bx) / 2} y={Ay + 22} textAnchor="middle" fontSize="13" fill={colorFor('horizontal')}>
                {horizontalLabel}
            </text>
            <text x={Bx + 12} y={(By + Cy) / 2} fontSize="13" fill={colorFor('vertical')}>
                {verticalLabel}
            </text>
            <text x={(Ax + Cx) / 2 - 10} y={(Ay + Cy) / 2 - 5} fontSize="13" fill={colorFor('hypotenuse')} textAnchor="end">
                {hypotenuseLabel}
            </text>
            <text x={Ax + 28} y={Ay - 10} fontSize="14" fontWeight="bold" fill={colorFor('angle')}>
                {angleLabel}
            </text>
            {askedLabel && (
                <text x={width - 16} y={28} textAnchor="end" fontSize="14" fontWeight="bold" fill="#dc2626">
                    {askedLabel}
                </text>
            )}
        </svg>
    );
};

const ALPINE_PASSES = [
    { name: 'der Fernpass', percent: 8 },
    { name: 'der Achenpass', percent: 12 },
    { name: 'das Hahntennjoch', percent: 15 },
    { name: 'der Monte Zoncolan', percent: 22 },
    { name: 'das Stilfser Joch', percent: 24 },
    { name: 'das Timmelsjoch', percent: 13 },
    { name: 'der Sölkpass', percent: 23 },
    { name: 'der Grimselpass', percent: 11 }
];

const SLOPE_NOUNS = ['Ein Forstweg', 'Eine Skipiste', 'Eine Tiefgaragenrampe', 'Eine Bergstraße', 'Ein Wanderweg', 'Eine Schotterpiste'];
const TRAVELERS = ['Ein Auto', 'Ein Fahrradfahrer', 'Ein Linienbus', 'Eine Wanderin', 'Ein Motorrad'];
const MAP_SCALES = [10000, 25000, 50000];

const buildPassTask = (): SlopeTask => {
    const pass = pick(ALPINE_PASSES);
    const horizontal = randomInt(80, 160);
    const t = triangleFromHorizontalPercent(horizontal, pass.percent);

    const steps: SolutionStep[] = [
        {
            text: 'Die Steigung in Prozent entspricht dem Tangens des Steigungswinkels.',
            math: `\\tan(\\alpha) = \\frac{\\text{Steigung in \\%}}{100} = \\frac{${formatNumber(pass.percent, 1)}}{100} = ${formatNumber(pass.percent / 100, 4)}`
        },
        {
            text: 'Löse mit der Umkehrfunktion Tangens⁻¹ nach dem Winkel auf.',
            math: `\\alpha = \\tan^{-1}(${formatNumber(pass.percent / 100, 4)})`
        },
        {
            text: 'Berechne und runde den Winkel.',
            math: `\\alpha \\approx ${formatNumber(t.angle, 1)}^{\\circ}`
        }
    ];

    return {
        prompt: `In den Alpen haben viele Passstraßen starke Steigungen. ${pass.name.charAt(0).toUpperCase()}${pass.name.slice(1)} hat eine maximale Steigung von ${formatNumber(pass.percent, 1)} %. Berechne den Steigungswinkel α dieses Straßenabschnitts.`,
        steps,
        correctAnswer: round(t.angle, 1),
        unit: '°',
        resultLabel: 'α',
        sketch: {
            horizontal: t.horizontal,
            vertical: t.vertical,
            horizontalLabel: 'horizontale Strecke',
            verticalLabel: `${formatNumber(t.vertical, 1)} m`,
            hypotenuseLabel: 'Weg',
            angleLabel: 'α = ?',
            highlight: 'angle'
        }
    };
};

const buildAngleToPercentTask = (): SlopeTask => {
    const noun = pick(SLOPE_NOUNS);
    const horizontal = randomInt(60, 150);
    const angle = round(randomInRange(2, 35), 1);
    const t = triangleFromHorizontalAngle(horizontal, angle);

    const steps: SolutionStep[] = [
        {
            text: 'Im rechtwinkligen Dreieck beschreibt der Tangens des Steigungswinkels das Verhältnis von Höhenunterschied zu horizontaler Strecke.',
            math: `\\tan(\\alpha) = \\frac{\\text{Höhenunterschied}}{\\text{horizontale Strecke}}`
        },
        {
            text: 'Setze den gegebenen Winkel ein.',
            math: `\\tan(${formatNumber(angle, 1)}^{\\circ}) = ${formatNumber(t.percent / 100, 4)}`
        },
        {
            text: 'Die Steigung in Prozent ist dieses Verhältnis multipliziert mit 100.',
            math: `\\text{Steigung} = \\tan(${formatNumber(angle, 1)}^{\\circ}) \\cdot 100\\,\\%`
        },
        {
            text: 'Berechne und runde das Ergebnis.',
            math: `\\text{Steigung} \\approx ${formatNumber(t.percent, 1)}\\,\\%`
        }
    ];

    return {
        prompt: `${noun} hat einen Steigungswinkel von α = ${formatNumber(angle, 1)}°. Berechne die Steigung in Prozent.`,
        steps,
        correctAnswer: round(t.percent, 1),
        unit: '%',
        resultLabel: 'Steigung',
        sketch: {
            horizontal: t.horizontal,
            vertical: t.vertical,
            horizontalLabel: 'horizontale Strecke',
            verticalLabel: '',
            hypotenuseLabel: 'Weg',
            angleLabel: `α = ${formatNumber(angle, 1)}°`,
            highlight: 'none',
            askedLabel: 'Steigung = ?'
        }
    };
};

const buildDistanceTask = (): SlopeTask => {
    const traveler = pick(TRAVELERS);
    const percent = round(randomInRange(4, 25), 1);
    const distance = randomInt(400, 3000);
    const t = triangleFromPercentDistance(percent, distance);

    const steps: SolutionStep[] = [
        {
            text: 'Die Steigung in Prozent entspricht dem Tangens des Steigungswinkels.',
            math: `\\tan(\\alpha) = \\frac{${formatNumber(percent, 1)}}{100} = ${formatNumber(percent / 100, 4)}`
        },
        {
            text: 'Bestimme den Neigungswinkel mit der Umkehrfunktion Tangens⁻¹.',
            math: `\\alpha = \\tan^{-1}(${formatNumber(percent / 100, 4)})`
        },
        {
            text: 'Berechne und runde den Winkel.',
            math: `\\alpha \\approx ${formatNumber(t.angle, 1)}^{\\circ}`
        }
    ];

    return {
        prompt: `${traveler} fährt auf einer Straße mit einem durchschnittlichen Gefälle von ${formatNumber(percent, 1)} % eine Fahrstrecke von ${formatNumber(distance, 0)} m. Bestimme den Neigungswinkel der Straße.`,
        steps,
        correctAnswer: round(t.angle, 1),
        unit: '°',
        resultLabel: 'α',
        sketch: {
            horizontal: t.horizontal,
            vertical: t.vertical,
            horizontalLabel: 'horizontale Strecke',
            verticalLabel: `${formatNumber(t.vertical, 0)} m`,
            hypotenuseLabel: `${formatNumber(distance, 0)} m`,
            angleLabel: 'α = ?',
            highlight: 'angle'
        }
    };
};

const buildMapScaleTask = (): SlopeTask => {
    const scale = pick(MAP_SCALES);
    const mapDistanceCm = round(randomInRange(2, 9), 1);
    const heightDiff = randomInt(12, 150);
    const horizontalCm = mapDistanceCm * scale;
    const horizontalM = horizontalCm / 100;
    const t = triangleFromHorizontalVertical(horizontalM, heightDiff);

    const steps: SolutionStep[] = [
        {
            text: 'Berechne zunächst die wahre horizontale Entfernung aus dem Kartenmaßstab.',
            math: `\\text{Strecke} = ${formatNumber(mapDistanceCm, 1)}\\,\\text{cm} \\cdot ${scale} = ${formatNumber(horizontalCm, 0)}\\,\\text{cm} = ${formatNumber(horizontalM, 0)}\\,\\text{m}`
        },
        {
            text: 'Die Steigung in Prozent ist der Höhenunterschied geteilt durch die horizontale Strecke, mal 100.',
            math: `\\text{Gefälle} = \\frac{\\text{Höhendifferenz}}{\\text{horizontale Strecke}} \\cdot 100\\,\\%`
        },
        {
            text: 'Setze die Werte ein.',
            math: `\\text{Gefälle} = \\frac{${formatNumber(heightDiff, 0)}}{${formatNumber(horizontalM, 0)}} \\cdot 100\\,\\%`
        },
        {
            text: 'Berechne und runde das Ergebnis.',
            math: `\\text{Gefälle} \\approx ${formatNumber(t.percent, 1)}\\,\\%`
        }
    ];

    return {
        prompt: `Zwei Orte sind durch eine geradlinige Straße verbunden. Auf einer Karte mit dem Maßstab 1 : ${scale} sind sie ${formatNumber(mapDistanceCm, 1)} cm voneinander entfernt. Ihre Höhendifferenz beträgt ${formatNumber(heightDiff, 0)} m. Berechne das Gefälle der Straße.`,
        steps,
        correctAnswer: round(t.percent, 1),
        unit: '%',
        resultLabel: 'Gefälle',
        sketch: {
            horizontal: t.horizontal,
            vertical: t.vertical,
            horizontalLabel: `${formatNumber(horizontalM, 0)} m`,
            verticalLabel: `${formatNumber(heightDiff, 0)} m`,
            hypotenuseLabel: 'Straße',
            angleLabel: `α ≈ ${formatNumber(t.angle, 1)}°`,
            highlight: 'none',
            askedLabel: 'Gefälle = ?'
        }
    };
};

const TASK_BUILDERS: (() => SlopeTask)[] = [
    buildPassTask,
    buildPassTask,
    buildAngleToPercentTask,
    buildAngleToPercentTask,
    buildDistanceTask,
    buildMapScaleTask
];

const buildTask = (): SlopeTask => pick(TASK_BUILDERS)();

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

    const checkAnswer = () => {
        if (!task) return;
        const value = parseFloat(userAnswer.replace(',', '.'));
        if (isNaN(value)) {
            setFeedback('info');
            return;
        }
        // Maximal 1% relative Toleranz, mit kleiner Mindesttoleranz für sehr kleine Werte
        const tolerance = Math.max(Math.abs(task.correctAnswer) * 0.01, 0.01);
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
                    <div className="flex justify-center">
                        <div className="bg-white border border-gray-200 rounded-lg px-3 py-2">
                            <InlineMath math="\tan(\alpha) = \frac{\text{Höhenunterschied}}{\text{horizontale Strecke}} = \frac{\text{Steigung in \%}}{100}" />
                        </div>
                    </div>
                    <p className="text-gray-700 text-sm">Daraus ergeben sich zwei Umrechnungen:</p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center items-stretch">
                        <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 flex flex-col items-center justify-center text-center">
                            <p className="text-xs text-gray-500 mb-1">Von Prozent zu Grad</p>
                            <InlineMath math="\alpha = \tan^{-1}\!\left(\frac{\text{Steigung in \%}}{100}\right)" />
                        </div>
                        <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 flex flex-col items-center justify-center text-center">
                            <p className="text-xs text-gray-500 mb-1">Von Grad zu Prozent</p>
                            <InlineMath math="\text{Steigung in \%} = \tan(\alpha) \cdot 100" />
                        </div>
                    </div>
                    <p className="text-gray-700 text-sm">
                        Ist statt der horizontalen Strecke die tatsächlich gefahrene Weglänge bekannt, hilft der Sinus weiter, denn der
                        Höhenunterschied ist dann die Gegenkathete zur Hypotenuse. Bei Aufgaben mit einer Landkarte musst du zusätzlich
                        zuerst den Kartenmaßstab in die wahre Streckenlänge umrechnen.
                    </p>
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
                                <h3 className="font-semibold text-gray-800 mb-2">Steigungsdreieck zur aktuellen Aufgabe</h3>
                                <SlopeSketch {...task.sketch} />
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
                                        Ergebnis: {task.resultLabel} = {formatNumber(task.correctAnswer, task.unit === '°' || task.unit === '%' ? 1 : 0)}
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

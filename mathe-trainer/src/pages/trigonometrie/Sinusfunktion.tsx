import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import GeoGebraSineUnitCircle from '../../components/GeoGebraSineUnitCircle';

const SINUSFUNKTION_VIDEO_ID = 'Zw0bByWHFeo';

interface SolutionStep {
    text: string;
    math?: string;
}

type SineTaskType = 'value' | 'symmetry' | 'sign' | 'extreme';

interface SinePoint {
    angleDeg: number;
    color: string;
    label: string;
    showSin?: boolean;
}

interface SineTask {
    type: SineTaskType;
    points: SinePoint[];
    prompt: string;
    steps: SolutionStep[];
    correctAnswer: string;
    isText: boolean;
    unit: string;
    resultLabel: string;
}

const degToRad = (deg: number) => (deg * Math.PI) / 180;
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// Exakte Werte für die gängigen "schönen" Winkel: [LaTeX-Bruch, Dezimalwert]
const EXACT_SINE_TABLE: Record<number, [string, number]> = {
    0: ['0', 0],
    30: ['\\frac{1}{2}', 0.5],
    45: ['\\frac{\\sqrt{2}}{2}', 0.71],
    60: ['\\frac{\\sqrt{3}}{2}', 0.87],
    90: ['1', 1],
    120: ['\\frac{\\sqrt{3}}{2}', 0.87],
    135: ['\\frac{\\sqrt{2}}{2}', 0.71],
    150: ['\\frac{1}{2}', 0.5],
    180: ['0', 0],
    210: ['-\\frac{1}{2}', -0.5],
    225: ['-\\frac{\\sqrt{2}}{2}', -0.71],
    240: ['-\\frac{\\sqrt{3}}{2}', -0.87],
    270: ['-1', -1],
    300: ['-\\frac{\\sqrt{3}}{2}', -0.87],
    315: ['-\\frac{\\sqrt{2}}{2}', -0.71],
    330: ['-\\frac{1}{2}', -0.5],
    360: ['0', 0]
};

const SPECIAL_ANGLES = Object.keys(EXACT_SINE_TABLE).map(Number);

const quadrantOf = (angleDeg: number): 1 | 2 | 3 | 4 => {
    const a = ((angleDeg % 360) + 360) % 360;
    if (a < 90) return 1;
    if (a < 180) return 2;
    if (a < 270) return 3;
    return 4;
};

const buildValueTask = (): SineTask => {
    const angle = pick(SPECIAL_ANGLES);
    const [exactLabel, value] = EXACT_SINE_TABLE[angle];

    const steps: SolutionStep[] = [
        {
            text: `Markiere den Winkel α = ${angle}° am Einheitskreis und lies die y-Koordinate des Punktes P ab.`,
            math: `P = (\\cos(${angle}^\\circ), \\sin(${angle}^\\circ))`
        },
        {
            text: 'Die y-Koordinate von P entspricht direkt dem Sinuswert.',
            math: `\\sin(${angle}^\\circ) = ${exactLabel} \\approx ${value.toFixed(2)}`
        }
    ];

    return {
        type: 'value',
        points: [{ angleDeg: angle, color: '#dc2626', label: 'P', showSin: true }],
        prompt: `Bestimme mithilfe des Einheitskreises: sin(${angle}°) = ?`,
        steps,
        correctAnswer: value.toFixed(2),
        isText: false,
        unit: '',
        resultLabel: `sin(${angle}°)`
    };
};

const buildSymmetryTask = (): SineTask => {
    const base = pick([15, 20, 25, 35, 40, 50, 55, 65, 70, 80]);
    const partner = 180 - base;
    const askPartner = Math.random() < 0.5;
    const given = askPartner ? base : partner;
    const target = askPartner ? partner : base;
    const sineValue = Math.sin(degToRad(given));

    const steps: SolutionStep[] = [
        {
            text: `Im Einheitskreis liegt zu jedem Winkel α im 1. Quadranten ein "Spiegelwinkel" 180° − α im 2. Quadranten mit demselben Sinuswert.`,
            math: `\\sin(${target}^\\circ) = \\sin(180^\\circ - ${target}^\\circ) = \\sin(${given}^\\circ) \\approx ${sineValue.toFixed(2)}`
        },
        {
            text: 'Löse die Gleichung nach dem gesuchten Winkel auf.',
            math: `${target}^\\circ = 180^\\circ - ${given}^\\circ`
        }
    ];

    return {
        type: 'symmetry',
        points: [
            { angleDeg: given, color: '#1f2937', label: 'gegeben' },
            { angleDeg: target, color: '#dc2626', label: '?' }
        ],
        prompt: `Es gilt sin(${given}°) ≈ ${sineValue.toFixed(2)}. Welcher Winkel α mit 90° < α < 180° hat denselben Sinuswert?`,
        steps,
        correctAnswer: target.toFixed(0),
        isText: false,
        unit: '°',
        resultLabel: 'α'
    };
};

const buildSignTask = (): SineTask => {
    let angle = randomInt(5, 355);
    while (angle % 90 === 0) {
        angle = randomInt(5, 355);
    }
    const sign = Math.sin(degToRad(angle)) > 0 ? 'positiv' : 'negativ';
    const quadrant = quadrantOf(angle);

    const steps: SolutionStep[] = [
        {
            text: `Der Winkel α = ${angle}° liegt im ${quadrant}. Quadranten des Einheitskreises.`
        },
        {
            text:
                quadrant === 1 || quadrant === 2
                    ? 'Im 1. und 2. Quadranten liegt der Punkt P oberhalb der x-Achse, also ist die y-Koordinate (der Sinuswert) positiv.'
                    : 'Im 3. und 4. Quadranten liegt der Punkt P unterhalb der x-Achse, also ist die y-Koordinate (der Sinuswert) negativ.'
        },
        {
            text: 'Ergebnis:',
            math: `\\sin(${angle}^\\circ) \\approx ${Math.sin(degToRad(angle)).toFixed(2)}`
        }
    ];

    return {
        type: 'sign',
        points: [{ angleDeg: angle, color: '#dc2626', label: 'P', showSin: true }],
        prompt: `Welches Vorzeichen hat sin(${angle}°) – positiv oder negativ?`,
        steps,
        correctAnswer: sign,
        isText: true,
        unit: '',
        resultLabel: `Vorzeichen von sin(${angle}°)`
    };
};

const buildExtremeTask = (): SineTask => {
    const wantMax = Math.random() < 0.5;
    const angle = wantMax ? 90 : 270;
    const value = wantMax ? 1 : -1;

    const steps: SolutionStep[] = [
        {
            text: wantMax
                ? 'Der Sinuswert ist am größten, wenn der Punkt P am höchsten Punkt des Einheitskreises liegt.'
                : 'Der Sinuswert ist am kleinsten, wenn der Punkt P am tiefsten Punkt des Einheitskreises liegt.'
        },
        {
            text: 'Das ist genau bei diesem Winkel der Fall:',
            math: `\\alpha = ${angle}^{\\circ}, \\quad \\sin(${angle}^\\circ) = ${value}`
        }
    ];

    return {
        type: 'extreme',
        points: [{ angleDeg: angle, color: '#dc2626', label: '?', showSin: true }],
        prompt: wantMax
            ? 'Bei welchem Winkel α (0° ≤ α ≤ 360°) erreicht die Sinusfunktion ihren größten Wert (sin(α) = 1)?'
            : 'Bei welchem Winkel α (0° ≤ α ≤ 360°) erreicht die Sinusfunktion ihren kleinsten Wert (sin(α) = −1)?',
        steps,
        correctAnswer: angle.toFixed(0),
        isText: false,
        unit: '°',
        resultLabel: 'α'
    };
};

const TASK_BUILDERS: (() => SineTask)[] = [buildValueTask, buildValueTask, buildSymmetryTask, buildSignTask, buildExtremeTask];
const buildTask = (): SineTask => pick(TASK_BUILDERS)();

const UnitCircleTaskSketch: React.FC<{ points: SinePoint[] }> = ({ points }) => {
    const size = 240;
    const cx = size / 2;
    const cy = size / 2;
    const r = 80;

    const coords = (angleDeg: number) => ({
        x: cx + r * Math.cos(degToRad(angleDeg)),
        y: cy - r * Math.sin(degToRad(angleDeg))
    });

    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="mx-auto">
            <line x1={cx - r - 20} y1={cy} x2={cx + r + 20} y2={cy} stroke="#cbd5e1" strokeWidth={1} />
            <line x1={cx} y1={cy - r - 20} x2={cx} y2={cy + r + 20} stroke="#cbd5e1" strokeWidth={1} />
            <circle cx={cx} cy={cy} r={r} fill="#eef2ff" stroke="#0f172a" strokeWidth={1.5} />

            {points.map((p, idx) => {
                const { x, y } = coords(p.angleDeg);
                return (
                    <g key={`pt-${idx}`}>
                        <line x1={cx} y1={cy} x2={x} y2={y} stroke={p.color} strokeWidth={1.5} />
                        {p.showSin && (
                            <line x1={x} y1={y} x2={x} y2={cy} stroke="#16a34a" strokeWidth={3} strokeDasharray="4 3" />
                        )}
                        <circle cx={x} cy={y} r={4} fill={p.color} />
                        <text
                            x={x + (x >= cx ? 8 : -8)}
                            y={y - 8}
                            fontSize="13"
                            fontWeight="bold"
                            fill={p.color}
                            textAnchor={x >= cx ? 'start' : 'end'}
                        >
                            {p.label}
                        </text>
                    </g>
                );
            })}
        </svg>
    );
};

const Sinusfunktion: React.FC = () => {
    const [task, setTask] = useState<SineTask | null>(null);
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
        if (task.isText) {
            const normalized = userAnswer.trim().toLowerCase();
            if (!normalized) {
                setFeedback('info');
                return;
            }
            setFeedback(normalized === task.correctAnswer ? 'correct' : 'incorrect');
            return;
        }

        const value = parseFloat(userAnswer.replace(',', '.'));
        if (isNaN(value)) {
            setFeedback('info');
            return;
        }
        const target = parseFloat(task.correctAnswer);
        // Maximal 1% relative Toleranz, mit kleiner Mindesttoleranz für sehr kleine Werte
        const tolerance = Math.max(Math.abs(target) * 0.01, 0.01);
        setFeedback(Math.abs(value - target) <= tolerance ? 'correct' : 'incorrect');
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-teal-800 mb-4">Die Sinusfunktion am Einheitskreis</h1>
                    <p className="text-gray-700 max-w-2xl mx-auto">
                        Am Einheitskreis (Radius 1) lässt sich der Sinus eines Winkels direkt als Höhe eines Punktes
                        ablesen. Drehst du den Winkel α von 0° bis 360°, entsteht aus dieser Höhe Schritt für Schritt
                        der bekannte Wellenverlauf der Sinusfunktion.
                    </p>
                </div>

                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 space-y-3">
                    <h2 className="text-lg font-semibold text-indigo-900 text-center">So hängen Kreis und Kurve zusammen</h2>
                    <ul className="text-gray-700 text-sm space-y-2 max-w-2xl mx-auto list-disc pl-5">
                        <li>
                            Der Punkt P liegt auf dem Einheitskreis. Seine Koordinaten sind{' '}
                            <InlineMath math="P = (\cos(\alpha), \sin(\alpha))" />.
                        </li>
                        <li>
                            Die grün markierte Strecke zeigt die <strong>y-Koordinate von P</strong> – das ist genau der
                            Wert <InlineMath math="\sin(\alpha)" />.
                        </li>
                        <li>
                            Diese Höhe wird nach rechts auf die Sinuskurve übertragen: Der Punkt dort hat als
                            x-Koordinate den Winkel α (im Bogenmaß) und als y-Koordinate denselben Sinuswert.
                        </li>
                        <li>
                            Lässt du α einmal vollständig von 0° bis 360° laufen, durchläuft die Sinuskurve genau
                            eine vollständige Periode.
                        </li>
                    </ul>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                    <h2 className="text-xl font-semibold text-gray-800 text-center mb-4">
                        Interaktive Grafik: Einheitskreis und Sinuskurve
                    </h2>
                    <p className="text-gray-600 text-sm text-center mb-4 max-w-2xl mx-auto">
                        Ziehe den Schieberegler <InlineMath math="\alpha" /> im Applet, bewege den Punkt P direkt auf
                        dem Kreis, oder starte die Animation, um zu beobachten, wie der Sinuswert die Kurve erzeugt.
                    </p>
                    <GeoGebraSineUnitCircle />
                </div>

                <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-gray-800">Training: Einheitskreis und Sinusfunktion</h2>
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
                                <UnitCircleTaskSketch points={task.points} />
                            </div>

                            <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                                <p className="font-medium text-gray-800">{task.prompt}</p>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                                <label className="font-semibold text-gray-700 w-full sm:w-auto text-center sm:text-left">
                                    Antwort:
                                </label>
                                <div className="flex items-center gap-2 w-full sm:w-auto justify-center">
                                    <input
                                        type="text"
                                        value={userAnswer}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUserAnswer(e.target.value)}
                                        className="w-full sm:w-40 border border-gray-300 rounded-lg px-3 py-2 text-center"
                                        placeholder={task.isText ? 'positiv / negativ' : 'Deine Lösung'}
                                    />
                                    <span className="text-gray-600">{task.unit}</span>
                                </div>
                            </div>

                            {feedback === 'info' && (
                                <p className="text-yellow-700 bg-yellow-100 border border-yellow-200 rounded-lg p-3 text-sm text-center max-w-md mx-auto">
                                    {task.isText ? 'Bitte gib "positiv" oder "negativ" ein.' : 'Bitte gib eine Zahl ein.'}
                                </p>
                            )}
                            {feedback === 'correct' && (
                                <p className="text-green-700 bg-green-100 border border-green-200 rounded-lg p-3 text-sm text-center max-w-md mx-auto">
                                    Perfekt! Deine Antwort stimmt.
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
                            </div>

                            {showSolution && (
                                <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
                                    <h3 className="font-semibold text-gray-800">Lösungsweg</h3>
                                    <ul className="list-decimal pl-5 text-gray-700 space-y-2 text-sm">
                                        {task.steps.map((step, index) => (
                                            <li key={`sine-step-${index}`} className="space-y-1">
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
                                        Ergebnis: {task.resultLabel} = {task.correctAnswer}
                                        {task.unit}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                    <h2 className="text-xl font-semibold text-gray-800 text-center mb-4">Lernvideo: Sinusfunktion am Einheitskreis</h2>
                    <div className="max-w-2xl mx-auto aspect-video rounded-lg overflow-hidden border border-gray-200">
                        <iframe
                            className="w-full h-full"
                            src={`https://www.youtube.com/embed/${SINUSFUNKTION_VIDEO_ID}`}
                            title="Lernvideo: Sinusfunktion am Einheitskreis"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    </div>
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

export default Sinusfunktion;

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

interface SolutionStep {
    text: string;
}

type RelType = 'Scheitelwinkel' | 'Nebenwinkel' | 'Stufenwinkel' | 'Wechselwinkel';

const RELATION_LABEL: Record<RelType, string> = {
    Scheitelwinkel: 'Scheitelwinkel',
    Nebenwinkel: 'Nebenwinkel (Nachbarwinkel)',
    Stufenwinkel: 'Stufenwinkel',
    Wechselwinkel: 'Wechselwinkel'
};

const RELATION_EXPLANATION: Record<RelType, string> = {
    Scheitelwinkel: 'Scheitelwinkel entstehen an derselben Kreuzung gegenüberliegend. Sie sind immer gleich groß.',
    Nebenwinkel:
        'Nebenwinkel (auch Nachbarwinkel genannt) liegen an derselben Kreuzung nebeneinander auf einer Geraden. Sie ergänzen sich immer zu 180°.',
    Stufenwinkel:
        'Stufenwinkel liegen an unterschiedlichen Kreuzungen an der gleichen Position (z. B. beide oben links). Bei parallelen Geraden sind sie immer gleich groß.',
    Wechselwinkel:
        'Wechselwinkel liegen an unterschiedlichen Kreuzungen auf verschiedenen Seiten der Schrägen, zwischen bzw. außerhalb der Parallelen. Bei parallelen Geraden sind sie immer gleich groß.'
};

// Positionen der acht Winkel um die beiden Kreuzungspunkte: 1-4 an g1 (oben), 5-8 an g2 (unten)
type Pos = 'TL' | 'TR' | 'BR' | 'BL';
const POSITION: Record<number, Pos> = { 1: 'TL', 2: 'TR', 3: 'BR', 4: 'BL', 5: 'TL', 6: 'TR', 7: 'BR', 8: 'BL' };

interface RelationPair {
    a: number;
    b: number;
    type: RelType;
}

const RELATIONS: RelationPair[] = [
    // Scheitelwinkel (an derselben Kreuzung, gegenüberliegend)
    { a: 1, b: 3, type: 'Scheitelwinkel' },
    { a: 2, b: 4, type: 'Scheitelwinkel' },
    { a: 5, b: 7, type: 'Scheitelwinkel' },
    { a: 6, b: 8, type: 'Scheitelwinkel' },
    // Nebenwinkel (an derselben Kreuzung, nebeneinander)
    { a: 1, b: 2, type: 'Nebenwinkel' },
    { a: 2, b: 3, type: 'Nebenwinkel' },
    { a: 3, b: 4, type: 'Nebenwinkel' },
    { a: 4, b: 1, type: 'Nebenwinkel' },
    { a: 5, b: 6, type: 'Nebenwinkel' },
    { a: 6, b: 7, type: 'Nebenwinkel' },
    { a: 7, b: 8, type: 'Nebenwinkel' },
    { a: 8, b: 5, type: 'Nebenwinkel' },
    // Stufenwinkel (gleiche Position an beiden Kreuzungen)
    { a: 1, b: 5, type: 'Stufenwinkel' },
    { a: 2, b: 6, type: 'Stufenwinkel' },
    { a: 3, b: 7, type: 'Stufenwinkel' },
    { a: 4, b: 8, type: 'Stufenwinkel' },
    // Wechselwinkel (verschiedene Kreuzungen, verschiedene Seiten der Schrägen)
    { a: 3, b: 5, type: 'Wechselwinkel' },
    { a: 4, b: 6, type: 'Wechselwinkel' },
    { a: 1, b: 7, type: 'Wechselwinkel' },
    { a: 2, b: 8, type: 'Wechselwinkel' }
];

const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randomTheta = () => randomInt(35, 75);

// Winkel 'TL'/'BR' entsprechen θ, 'TR'/'BL' entsprechen 180°-θ (siehe Skizzen-Geometrie unten)
const valueOf = (id: number, theta: number): number => {
    const pos = POSITION[id];
    return pos === 'TL' || pos === 'BR' ? theta : 180 - theta;
};

type TaskMode = 'calc' | 'classify';

interface Task {
    mode: TaskMode;
    theta: number;
    highlightA: number;
    highlightB: number;
    prompt: string;
    steps: SolutionStep[];
    correctAnswer: string;
    options?: string[];
}

const buildCalcTask = (): Task => {
    const theta = randomTheta();
    const rel = pick(RELATIONS);
    const swap = Math.random() < 0.5;
    const givenId = swap ? rel.b : rel.a;
    const targetId = swap ? rel.a : rel.b;
    const givenValue = valueOf(givenId, theta);
    const targetValue = valueOf(targetId, theta);

    const steps: SolutionStep[] = [
        { text: `∠${givenId} und ∠${targetId} sind ${RELATION_LABEL[rel.type]}.` },
        { text: RELATION_EXPLANATION[rel.type] },
        {
            text:
                rel.type === 'Nebenwinkel'
                    ? `∠${targetId} = 180° − ∠${givenId} = 180° − ${givenValue}° = ${targetValue}°`
                    : `∠${targetId} = ∠${givenId} = ${targetValue}°`
        }
    ];

    return {
        mode: 'calc',
        theta,
        highlightA: givenId,
        highlightB: targetId,
        prompt: `An den parallelen Geraden g₁ und g₂ gilt: ∠${givenId} und ∠${targetId} sind ${RELATION_LABEL[rel.type]}. Es gilt ∠${givenId} = ${givenValue}°. Berechne ∠${targetId}.`,
        steps,
        correctAnswer: targetValue.toString()
    };
};

const buildClassifyTask = (): Task => {
    const theta = randomTheta();
    const rel = pick(RELATIONS);
    const [idA, idB] = Math.random() < 0.5 ? [rel.a, rel.b] : [rel.b, rel.a];
    const options = ['Scheitelwinkel', 'Nebenwinkel (Nachbarwinkel)', 'Stufenwinkel', 'Wechselwinkel'];

    const steps: SolutionStep[] = [{ text: RELATION_EXPLANATION[rel.type] }];

    return {
        mode: 'classify',
        theta,
        highlightA: idA,
        highlightB: idB,
        prompt: `Welche Beziehung besteht zwischen ∠${idA} und ∠${idB}?`,
        steps,
        correctAnswer: RELATION_LABEL[rel.type],
        options
    };
};

const buildTask = (): Task => (Math.random() < 0.5 ? buildCalcTask() : buildClassifyTask());

// --- Geometrie der Skizze ---
const degToRad = (deg: number) => (deg * Math.PI) / 180;

const wedgeSpan = (pos: Pos, theta: number): [number, number] => {
    switch (pos) {
        case 'TL':
            return [180, 180 + theta];
        case 'TR':
            return [180 + theta, 360];
        case 'BR':
            return [0, theta];
        case 'BL':
            return [theta, 180];
    }
};

const arcPath = (cx: number, cy: number, r: number, startDeg: number, endDeg: number) => {
    const sx = cx + r * Math.cos(degToRad(startDeg));
    const sy = cy + r * Math.sin(degToRad(startDeg));
    const ex = cx + r * Math.cos(degToRad(endDeg));
    const ey = cy + r * Math.sin(degToRad(endDeg));
    return `M ${sx} ${sy} A ${r} ${r} 0 0 1 ${ex} ${ey}`;
};

const labelPos = (cx: number, cy: number, r: number, startDeg: number, endDeg: number) => {
    const mid = (startDeg + endDeg) / 2;
    return { x: cx + r * Math.cos(degToRad(mid)), y: cy + r * Math.sin(degToRad(mid)) };
};

const WinkelDiagramm: React.FC<{ theta: number; highlightA: number; highlightB: number }> = ({ theta, highlightA, highlightB }) => {
    const width = 420;
    const height = 300;
    const p1 = { x: 150, y: 90 };
    const thetaRad = degToRad(theta);
    const s = 130 / Math.sin(thetaRad);
    const p2 = { x: p1.x + s * Math.cos(thetaRad), y: p1.y + s * Math.sin(thetaRad) };

    const tExtStart = { x: p1.x - 60 * Math.cos(thetaRad), y: p1.y - 60 * Math.sin(thetaRad) };
    const tExtEnd = { x: p2.x + 60 * Math.cos(thetaRad), y: p2.y + 60 * Math.sin(thetaRad) };

    const vertexOf = (id: number) => (id <= 4 ? p1 : p2);

    const wedges = [1, 2, 3, 4, 5, 6, 7, 8].map(id => {
        const [start, end] = wedgeSpan(POSITION[id], theta);
        const v = vertexOf(id);
        return { id, start, end, v };
    });

    const isHighlighted = (id: number) => id === highlightA || id === highlightB;
    const colorOf = (id: number) => (id === highlightA ? '#2563eb' : id === highlightB ? '#dc2626' : '#94a3b8');

    return (
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="mx-auto">
            {/* Parallele Geraden */}
            <line x1={20} y1={p1.y} x2={400} y2={p1.y} stroke="#0f172a" strokeWidth={1.5} />
            <line x1={20} y1={p2.y} x2={400} y2={p2.y} stroke="#0f172a" strokeWidth={1.5} />
            {/* Parallelitätsmarkierungen */}
            <polygon points={`392,${p1.y - 5} 400,${p1.y} 392,${p1.y + 5}`} fill="#0f172a" />
            <polygon points={`392,${p2.y - 5} 400,${p2.y} 392,${p2.y + 5}`} fill="#0f172a" />
            <text x={404} y={p1.y + 4} fontSize="14" fontWeight="bold">g₁</text>
            <text x={404} y={p2.y + 4} fontSize="14" fontWeight="bold">g₂</text>
            {/* Schräge (Transversale) */}
            <line x1={tExtStart.x} y1={tExtStart.y} x2={tExtEnd.x} y2={tExtEnd.y} stroke="#0f172a" strokeWidth={1.5} />
            <text x={tExtEnd.x + 6} y={tExtEnd.y + 10} fontSize="14" fontWeight="bold">t</text>

            <circle cx={p1.x} cy={p1.y} r={2.5} fill="#0f172a" />
            <circle cx={p2.x} cy={p2.y} r={2.5} fill="#0f172a" />

            {wedges.map(w => {
                const highlighted = isHighlighted(w.id);
                const radius = highlighted ? 30 : 22;
                const lp = labelPos(w.v.x, w.v.y, radius + 16, w.start, w.end);
                return (
                    <g key={`wedge-${w.id}`}>
                        <path
                            d={arcPath(w.v.x, w.v.y, radius, w.start, w.end)}
                            fill="none"
                            stroke={colorOf(w.id)}
                            strokeWidth={highlighted ? 3 : 1.5}
                        />
                        <text
                            x={lp.x}
                            y={lp.y}
                            fontSize={highlighted ? 15 : 12}
                            fontWeight={highlighted ? 'bold' : 'normal'}
                            fill={colorOf(w.id)}
                            textAnchor="middle"
                            dominantBaseline="middle"
                        >
                            {w.id}
                        </text>
                    </g>
                );
            })}
        </svg>
    );
};

const Winkelbeziehungen: React.FC = () => {
    const [task, setTask] = useState<Task | null>(null);
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

    const checkAnswer = (choice?: string) => {
        if (!task) return;
        if (task.mode === 'classify') {
            const answer = choice ?? userAnswer;
            if (!answer) {
                setFeedback('info');
                return;
            }
            setFeedback(answer === task.correctAnswer ? 'correct' : 'incorrect');
            return;
        }

        const value = parseFloat(userAnswer.replace(',', '.'));
        if (isNaN(value)) {
            setFeedback('info');
            return;
        }
        setFeedback(value === parseFloat(task.correctAnswer) ? 'correct' : 'incorrect');
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-teal-800 mb-4">Winkelbeziehungen</h1>
                    <p className="text-gray-700 max-w-2xl mx-auto">
                        Schneidet eine Gerade (Schräge t) zwei parallele Geraden g₁ und g₂, entstehen acht Winkel.
                        Zwischen diesen Winkeln gibt es feste Beziehungen: Scheitelwinkel und Nebenwinkel an
                        derselben Kreuzung sowie Stufenwinkel und Wechselwinkel zwischen den beiden Kreuzungen.
                    </p>
                </div>

                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 space-y-2">
                    <h2 className="text-lg font-semibold text-indigo-900 text-center">Die vier Winkelbeziehungen</h2>
                    <ul className="text-gray-700 text-sm space-y-1.5 max-w-2xl mx-auto list-disc pl-5">
                        <li><strong>Scheitelwinkel</strong> – gegenüberliegend an derselben Kreuzung, gleich groß.</li>
                        <li><strong>Nebenwinkel (Nachbarwinkel)</strong> – nebeneinander an derselben Kreuzung, Summe 180°.</li>
                        <li><strong>Stufenwinkel</strong> – gleiche Position an beiden Kreuzungen, bei parallelen Geraden gleich groß.</li>
                        <li><strong>Wechselwinkel</strong> – verschiedene Seiten der Schrägen zwischen den Kreuzungen, bei parallelen Geraden gleich groß.</li>
                    </ul>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                    <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                        <h2 className="text-xl font-semibold text-gray-800">Training</h2>
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
                                <WinkelDiagramm theta={task.theta} highlightA={task.highlightA} highlightB={task.highlightB} />
                            </div>

                            <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                                <p className="font-medium text-gray-800">{task.prompt}</p>
                            </div>

                            {task.mode === 'calc' ? (
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
                                            placeholder="Deine Lösung"
                                        />
                                        <span className="text-gray-600">°</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto">
                                    {task.options?.map(opt => (
                                        <button
                                            key={opt}
                                            onClick={() => {
                                                setUserAnswer(opt);
                                                checkAnswer(opt);
                                            }}
                                            className={`px-4 py-2 rounded-lg border font-medium transition-colors ${
                                                userAnswer === opt
                                                    ? 'bg-blue-600 text-white border-blue-600'
                                                    : 'bg-white text-gray-800 border-gray-300 hover:border-blue-400'
                                            }`}
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {feedback === 'info' && (
                                <p className="text-yellow-700 bg-yellow-100 border border-yellow-200 rounded-lg p-3 text-sm text-center max-w-md mx-auto">
                                    {task.mode === 'calc' ? 'Bitte gib eine Zahl ein.' : 'Bitte wähle eine Antwort aus.'}
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
                                {task.mode === 'calc' && (
                                    <button
                                        onClick={() => checkAnswer()}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                                    >
                                        Prüfen
                                    </button>
                                )}
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
                                            <li key={`winkel-step-${index}`}>{step.text}</li>
                                        ))}
                                    </ul>
                                    <div className="font-bold text-gray-900">Ergebnis: {task.correctAnswer}{task.mode === 'calc' ? '°' : ''}</div>
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

export default Winkelbeziehungen;

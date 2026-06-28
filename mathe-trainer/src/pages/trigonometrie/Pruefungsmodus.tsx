import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface ExamTask {
    id: number;
    topic: string;
    prompt: string;
    unit: string;
    correctAnswer: string;
    isText: boolean;
    tolerance: number;
}

const degToRad = (deg: number) => (deg * Math.PI) / 180;
const radToDeg = (rad: number) => (rad * 180) / Math.PI;
const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;
const randomInt = (min: number, max: number) => Math.floor(randomInRange(min, max + 1));
const round = (val: number, digits = 2) => parseFloat(val.toFixed(digits));
const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

let idCounter = 0;
const nextId = () => {
    idCounter += 1;
    return idCounter;
};

// 1) Rechtwinkliges Dreieck: fehlende Seite mit Sinus/Kosinus berechnen
const buildRightTriangleSideTask = (): ExamTask => {
    const alpha = randomInt(20, 70);
    const hyp = round(randomInRange(5, 15), 2);
    const askOpposite = Math.random() < 0.5;
    const opposite = hyp * Math.sin(degToRad(alpha));
    const adjacent = hyp * Math.cos(degToRad(alpha));

    return {
        id: nextId(),
        topic: 'Rechtwinkliges Dreieck',
        prompt: askOpposite
            ? `In einem rechtwinkligen Dreieck ist die Hypotenuse c = ${hyp} cm und der Winkel α = ${alpha}°. Berechne die Gegenkathete a von α.`
            : `In einem rechtwinkligen Dreieck ist die Hypotenuse c = ${hyp} cm und der Winkel α = ${alpha}°. Berechne die Ankathete b von α.`,
        unit: 'cm',
        correctAnswer: (askOpposite ? opposite : adjacent).toFixed(2),
        isText: false,
        tolerance: 0.1
    };
};

// 2) Rechtwinkliges Dreieck: fehlenden Winkel berechnen
const buildRightTriangleAngleTask = (): ExamTask => {
    const adjacent = round(randomInRange(4, 12), 2);
    const opposite = round(randomInRange(4, 12), 2);
    const angle = radToDeg(Math.atan(opposite / adjacent));

    return {
        id: nextId(),
        topic: 'Rechtwinkliges Dreieck',
        prompt: `In einem rechtwinkligen Dreieck sind die Ankathete b = ${adjacent} cm und die Gegenkathete a = ${opposite} cm eines Winkels α bekannt. Berechne α.`,
        unit: '°',
        correctAnswer: angle.toFixed(1),
        isText: false,
        tolerance: 1
    };
};

// 3) Steigungswinkel: Grad <-> Prozent
const buildSteigungTask = (): ExamTask => {
    const askPercent = Math.random() < 0.5;
    if (askPercent) {
        const angle = round(randomInRange(5, 35), 1);
        const percent = Math.tan(degToRad(angle)) * 100;
        return {
            id: nextId(),
            topic: 'Steigungswinkel',
            prompt: `Eine Straße hat einen Steigungswinkel von α = ${angle}°. Berechne die Steigung in Prozent.`,
            unit: '%',
            correctAnswer: percent.toFixed(1),
            isText: false,
            tolerance: 1
        };
    }
    const percent = round(randomInRange(5, 30), 1);
    const angle = radToDeg(Math.atan(percent / 100));
    return {
        id: nextId(),
        topic: 'Steigungswinkel',
        prompt: `Eine Straße hat eine Steigung von ${percent} %. Berechne den Steigungswinkel α.`,
        unit: '°',
        correctAnswer: angle.toFixed(1),
        isText: false,
        tolerance: 1
    };
};

// 4) Sinussatz
const buildSinussatzTask = (): ExamTask => {
    let alpha = randomInRange(35, 110);
    let beta = randomInRange(25, 110);
    let gamma = 180 - alpha - beta;
    while (gamma < 25 || gamma > 110) {
        alpha = randomInRange(35, 110);
        beta = randomInRange(25, 110);
        gamma = 180 - alpha - beta;
    }
    const a = round(randomInRange(5, 12), 2);
    const b = (a * Math.sin(degToRad(beta))) / Math.sin(degToRad(alpha));
    alpha = round(alpha, 1);
    beta = round(beta, 1);

    const askSide = Math.random() < 0.5;
    if (askSide) {
        return {
            id: nextId(),
            topic: 'Sinussatz',
            prompt: `In einem Dreieck sind a = ${a} cm, α = ${alpha}° und β = ${beta}° gegeben. Berechne die Seite b mit dem Sinussatz.`,
            unit: 'cm',
            correctAnswer: round(b, 2).toFixed(2),
            isText: false,
            tolerance: 0.15
        };
    }
    return {
        id: nextId(),
        topic: 'Sinussatz',
        prompt: `In einem Dreieck sind a = ${a} cm, b = ${round(b, 2)} cm und α = ${alpha}° gegeben. Berechne den Winkel β mit dem Sinussatz.`,
        unit: '°',
        correctAnswer: beta.toFixed(1),
        isText: false,
        tolerance: 1
    };
};

// 5) Kosinussatz
const buildKosinussatzTask = (): ExamTask => {
    const b = round(randomInRange(5, 12), 2);
    const c = round(randomInRange(5, 12), 2);
    const alpha = round(randomInRange(35, 110), 1);
    const aSquared = b * b + c * c - 2 * b * c * Math.cos(degToRad(alpha));
    const a = Math.sqrt(Math.max(aSquared, 0));

    const askSide = Math.random() < 0.5;
    if (askSide) {
        return {
            id: nextId(),
            topic: 'Kosinussatz',
            prompt: `In einem Dreieck sind b = ${b} cm, c = ${c} cm und der eingeschlossene Winkel α = ${alpha}° gegeben. Berechne die Seite a mit dem Kosinussatz.`,
            unit: 'cm',
            correctAnswer: round(a, 2).toFixed(2),
            isText: false,
            tolerance: 0.15
        };
    }
    const cosBeta = (a * a + c * c - b * b) / (2 * a * c);
    const beta = radToDeg(Math.acos(Math.min(1, Math.max(-1, cosBeta))));
    return {
        id: nextId(),
        topic: 'Kosinussatz',
        prompt: `In einem Dreieck sind a = ${round(a, 2)} cm, b = ${b} cm und c = ${c} cm gegeben. Berechne den Winkel β mit dem Kosinussatz.`,
        unit: '°',
        correctAnswer: beta.toFixed(1),
        isText: false,
        tolerance: 1
    };
};

// 6) Flächensatz
const buildFlaechensatzTask = (): ExamTask => {
    const a = round(randomInRange(4, 12), 2);
    const b = round(randomInRange(4, 12), 2);
    const gamma = round(randomInRange(20, 150), 1);
    const area = 0.5 * a * b * Math.sin(degToRad(gamma));

    return {
        id: nextId(),
        topic: 'Flächensatz',
        prompt: `Ein Dreieck hat die Seiten a = ${a} cm und b = ${b} cm mit dem eingeschlossenen Winkel γ = ${gamma}°. Berechne den Flächeninhalt des Dreiecks.`,
        unit: 'cm²',
        correctAnswer: round(area, 2).toFixed(2),
        isText: false,
        tolerance: 0.2
    };
};

// 7) Einheitskreis: Sinuswert an "schönen" Winkeln
const EXACT_SINE_TABLE: Record<number, number> = {
    0: 0,
    30: 0.5,
    45: 0.71,
    60: 0.87,
    90: 1,
    120: 0.87,
    135: 0.71,
    150: 0.5,
    180: 0,
    210: -0.5,
    225: -0.71,
    240: -0.87,
    270: -1,
    300: -0.87,
    315: -0.71,
    330: -0.5,
    360: 0
};

const buildUnitCircleValueTask = (): ExamTask => {
    const angle = pick(Object.keys(EXACT_SINE_TABLE).map(Number));
    return {
        id: nextId(),
        topic: 'Einheitskreis',
        prompt: `Bestimme mithilfe des Einheitskreises: sin(${angle}°) = ?`,
        unit: '',
        correctAnswer: EXACT_SINE_TABLE[angle].toFixed(2),
        isText: false,
        tolerance: 0.03
    };
};

// 8) Einheitskreis: Vorzeichen
const buildUnitCircleSignTask = (): ExamTask => {
    let angle = randomInt(5, 355);
    while (angle % 90 === 0) {
        angle = randomInt(5, 355);
    }
    const sign = Math.sin(degToRad(angle)) > 0 ? 'positiv' : 'negativ';
    return {
        id: nextId(),
        topic: 'Einheitskreis',
        prompt: `Welches Vorzeichen hat sin(${angle}°) – positiv oder negativ?`,
        unit: '',
        correctAnswer: sign,
        isText: true,
        tolerance: 0
    };
};

const TASK_BUILDERS: (() => ExamTask)[] = [
    buildRightTriangleSideTask,
    buildRightTriangleAngleTask,
    buildSteigungTask,
    buildSinussatzTask,
    buildKosinussatzTask,
    buildFlaechensatzTask,
    buildUnitCircleValueTask,
    buildUnitCircleSignTask
];

const buildExam = (): ExamTask[] => {
    const shuffledBuilders = [...TASK_BUILDERS].sort(() => Math.random() - 0.5);
    const tasks: ExamTask[] = [];

    // Erst jeden Aufgabentyp einmal verwenden, danach zufällig auffüllen, bis 10 Aufgaben erreicht sind.
    shuffledBuilders.forEach(builder => tasks.push(builder()));
    while (tasks.length < 10) {
        tasks.push(pick(TASK_BUILDERS)());
    }

    return tasks.slice(0, 10).sort(() => Math.random() - 0.5);
};

const formatUnit = (unit: string) => (unit === '°' || unit === '%' || unit === '' ? unit : ` ${unit}`);

type Stage = 'form' | 'exam' | 'result';

const Pruefungsmodus: React.FC = () => {
    const [stage, setStage] = useState<Stage>('form');
    const [vorname, setVorname] = useState('');
    const [nachname, setNachname] = useState('');
    const [klasse, setKlasse] = useState('');
    const [tasks, setTasks] = useState<ExamTask[]>([]);
    const [answers, setAnswers] = useState<Record<number, string>>({});

    const canStart = vorname.trim() !== '' && nachname.trim() !== '' && klasse.trim() !== '';

    const startExam = () => {
        if (!canStart) return;
        setTasks(buildExam());
        setAnswers({});
        setStage('exam');
    };

    const isTaskCorrect = (task: ExamTask) => {
        const given = (answers[task.id] || '').trim();
        if (!given) return false;
        if (task.isText) {
            return given.toLowerCase() === task.correctAnswer.toLowerCase();
        }
        const value = parseFloat(given.replace(',', '.'));
        if (isNaN(value)) return false;
        const target = parseFloat(task.correctAnswer);
        return Math.abs(value - target) <= task.tolerance;
    };

    const score = tasks.filter(isTaskCorrect).length;
    const allAnswered = tasks.every(t => (answers[t.id] || '').trim() !== '');

    const restart = () => {
        setStage('form');
        setVorname('');
        setNachname('');
        setKlasse('');
        setTasks([]);
        setAnswers({});
    };

    const newExamSamePerson = () => {
        setTasks(buildExam());
        setAnswers({});
        setStage('exam');
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-teal-800 mb-2">Prüfungsmodus Trigonometrie</h1>
                    <p className="text-gray-700 max-w-2xl mx-auto">
                        Zehn vermischte Aufgaben aus der Trigonometrie. Während der Prüfung gibt es keine Lösungswege –
                        die Auswertung erscheint erst, nachdem du alle Aufgaben beantwortet und abgegeben hast.
                    </p>
                </div>

                {stage === 'form' && (
                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 max-w-md mx-auto space-y-4">
                        <h2 className="text-lg font-semibold text-gray-800 text-center mb-2">Angaben zur Person</h2>
                        <div className="space-y-3">
                            <input
                                type="text"
                                value={vorname}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVorname(e.target.value)}
                                placeholder="Vorname"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            />
                            <input
                                type="text"
                                value={nachname}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNachname(e.target.value)}
                                placeholder="Nachname"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            />
                            <input
                                type="text"
                                value={klasse}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setKlasse(e.target.value)}
                                placeholder="Klasse"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                            />
                        </div>
                        <div className="flex justify-center pt-2">
                            <button
                                onClick={startExam}
                                disabled={!canStart}
                                className="px-6 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                            >
                                Prüfung starten
                            </button>
                        </div>
                    </div>
                )}

                {stage === 'exam' && (
                    <div className="space-y-4">
                        <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 text-center text-sm text-indigo-900">
                            {vorname} {nachname} · Klasse {klasse}
                        </div>

                        {tasks.map((task, index) => (
                            <div key={task.id} className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                                <p className="text-xs font-semibold text-gray-500 mb-1">
                                    Aufgabe {index + 1} von {tasks.length} · {task.topic}
                                </p>
                                <p className="font-medium text-gray-800 mb-3">{task.prompt}</p>
                                <div className="flex items-center justify-center gap-2">
                                    <input
                                        type="text"
                                        value={answers[task.id] || ''}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                            setAnswers(prev => ({ ...prev, [task.id]: e.target.value }))
                                        }
                                        placeholder={task.isText ? 'positiv / negativ' : 'Deine Lösung'}
                                        className="w-full sm:w-48 border border-gray-300 rounded-lg px-3 py-2 text-center"
                                    />
                                    <span className="text-gray-600 w-10">{task.unit}</span>
                                </div>
                            </div>
                        ))}

                        <div className="flex flex-col items-center gap-2 pt-2">
                            {!allAnswered && (
                                <p className="text-yellow-700 bg-yellow-100 border border-yellow-200 rounded-lg p-3 text-sm text-center max-w-md">
                                    Bitte beantworte alle {tasks.length} Aufgaben, bevor du die Prüfung abgibst.
                                </p>
                            )}
                            <button
                                onClick={() => setStage('result')}
                                disabled={!allAnswered}
                                className="px-6 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                            >
                                Prüfung abgeben
                            </button>
                        </div>
                    </div>
                )}

                {stage === 'result' && (
                    <div className="space-y-4">
                        <div className="bg-teal-50 border border-teal-100 rounded-xl p-5 text-center">
                            <p className="text-lg font-semibold text-teal-900">
                                {vorname} {nachname} · Klasse {klasse}
                            </p>
                            <p className="text-3xl font-bold text-teal-800 mt-2">
                                {score} / {tasks.length} richtig
                            </p>
                        </div>

                        {tasks.map((task, index) => {
                            const correct = isTaskCorrect(task);
                            const given = answers[task.id] || '—';
                            return (
                                <div
                                    key={task.id}
                                    className={`rounded-xl p-5 border ${
                                        correct ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                                    }`}
                                >
                                    <p className="text-xs font-semibold text-gray-500 mb-1">
                                        Aufgabe {index + 1} · {task.topic} · {correct ? '✓ richtig' : '✗ falsch'}
                                    </p>
                                    <p className="font-medium text-gray-800 mb-2">{task.prompt}</p>
                                    <p className="text-sm text-gray-700">
                                        Deine Antwort: <strong>{given}{!task.isText && given !== '—' ? formatUnit(task.unit) : ''}</strong>
                                    </p>
                                    {!correct && (
                                        <p className="text-sm text-gray-700">
                                            Richtige Antwort: <strong>{task.correctAnswer}{!task.isText ? formatUnit(task.unit) : ''}</strong>
                                        </p>
                                    )}
                                </div>
                            );
                        })}

                        <div className="flex justify-center flex-wrap gap-4 pt-2">
                            <button
                                onClick={newExamSamePerson}
                                className="px-6 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors"
                            >
                                Neue Prüfung (gleiche Person)
                            </button>
                            <button
                                onClick={restart}
                                className="px-6 py-2 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors"
                            >
                                Zurück zur Eingabe
                            </button>
                        </div>
                    </div>
                )}

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

export default Pruefungsmodus;

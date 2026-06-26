import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

interface SolutionStep {
    heading: string;
    text: string;
    math?: string;
}

interface SubTask {
    title: string;
    context: string;
    question: string;
    inputSuffix?: string;
    correctAnswer: number;
    tolerancePercent?: number;
    solutionSteps: SolutionStep[];
}

const tasks: SubTask[] = [
    {
        title: 'Aufgabe 1',
        context:
            'Im Münchner Olympiapark soll eine neue Touristenattraktion installiert werden. Der Olympiaberg B, das ' +
            'Olympiastadion S und die Schwimmhalle H werden mit Hängebrücken verbunden.\n\n' +
            'Außerdem sollen zwei Flying-Fox-Anlagen gebaut werden. Die Anfängerstrecke verläuft vom Olympiaberg B ' +
            'zum Ufer des Sees Z. Für Fortgeschrittene ist eine Anlage vom Dach des Olympiastadions S ebenfalls zum ' +
            'Ufer Z geplant.',
        question: 'Berechnen Sie die nötige Gesamtlänge der Seile für beide Flying-Fox-Anlagen.',
        inputSuffix: 'm',
        correctAnswer: 1065.03,
        solutionSteps: [
            {
                heading: 'Schritt 1: Sinussatz aufstellen',
                text: 'Im Dreieck BSZ sind der Winkel bei B (42,03°), der Winkel bei S (59,75°) und die Seite |SZ| = 600 m bekannt:',
                math: '\\frac{|\\overline{BZ}|}{\\sin(42{,}03^\\circ)} = \\frac{600}{\\sin(59{,}75^\\circ)}'
            },
            {
                heading: 'Schritt 2: Nach |BZ| auflösen',
                math: '|\\overline{BZ}| = \\frac{600 \\cdot \\sin(42{,}03^\\circ)}{\\sin(59{,}75^\\circ)}'
            },
            {
                heading: 'Schritt 3: Berechnen',
                math: '|\\overline{BZ}| \\approx 465{,}03 \\text{ m}'
            },
            {
                heading: 'Schritt 4: Gesamtlänge bilden',
                text: 'Die Gesamtlänge ergibt sich aus beiden Flying-Fox-Strecken |BZ| und |SZ|:',
                math: '465{,}03 \\text{ m} + 600{,}00 \\text{ m} = 1.065{,}03 \\text{ m}'
            }
        ]
    },
    {
        title: 'Aufgabe 2',
        context: 'Aus statischen Gründen darf der Öffnungswinkel ε = ∢BSH zwischen den beiden Hängebrücken nicht größer als 60° sein.',
        question:
            'Prüfen Sie rechnerisch, ob diese Bedingung eingehalten wird. Berechnen Sie dazu den Winkel ε und ' +
            'geben Sie ihn in Grad ein.',
        inputSuffix: '°',
        correctAnswer: 55.40,
        solutionSteps: [
            {
                heading: 'Schritt 1: Kosinussatz aufstellen',
                text: 'Im Dreieck ZSH sind alle drei Seiten bekannt, daher liefert der Kosinussatz den Winkel bei S:',
                math: '\\cos(\\angle ZSH) = \\frac{600^2 + 565^2 - 140^2}{2 \\cdot 600 \\cdot 565}'
            },
            {
                heading: 'Schritt 2: Berechnen',
                math: '\\cos(\\angle ZSH) = \\frac{659.625}{678.000} \\approx 0{,}973 \\implies \\angle ZSH \\approx 13{,}37^\\circ'
            },
            {
                heading: 'Schritt 3: Winkel ε bestimmen',
                text: 'Der Öffnungswinkel ε setzt sich aus ∢ZSH und α zusammen:',
                math: '\\varepsilon = \\angle ZSH + \\alpha = 13{,}37^\\circ + 42{,}03^\\circ = 55{,}40^\\circ'
            },
            {
                heading: 'Schritt 4: Bedingung prüfen',
                text: 'Da ε = 55,40° ≤ 60° ist, wird die Bedingung eingehalten.'
            }
        ]
    },
    {
        title: 'Aufgabe 3',
        context:
            'Um Unfällen im Landebereich vorzubeugen, muss das dreieckige Gebiet FEZ abgesperrt werden. Die ' +
            'Anlagenbetreiber messen die Strecken mit |FZ| = 80 m und |EZ| = 70 m ab.',
        question: 'Berechnen Sie den Flächeninhalt dieses Gebietes.',
        inputSuffix: 'm²',
        correctAnswer: 2741.03,
        solutionSteps: [
            {
                heading: 'Schritt 1: Winkel ∢FZE bestimmen',
                text: 'Die Winkelsumme im Dreieck ergibt:',
                math: '\\angle FZE = 180^\\circ - 42{,}03^\\circ - 59{,}75^\\circ = 78{,}22^\\circ'
            },
            {
                heading: 'Schritt 2: Flächensatz aufstellen',
                math: 'A_{\\triangle FEZ} = \\frac{|\\overline{EZ}| \\cdot |\\overline{FZ}| \\cdot \\sin(\\angle FZE)}{2}'
            },
            {
                heading: 'Schritt 3: Werte einsetzen',
                math: 'A_{\\triangle FEZ} = \\frac{80 \\cdot 70 \\cdot \\sin(78{,}22^\\circ)}{2}'
            },
            {
                heading: 'Schritt 4: Berechnen',
                math: 'A_{\\triangle FEZ} \\approx 2.741{,}03 \\text{ m}^2'
            }
        ]
    }
];

const OlympiaparkMuenchen: React.FC = () => {
    const [currentTask, setCurrentTask] = useState(0);
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [feedback, setFeedback] = useState<Record<number, 'correct' | 'incorrect' | null>>({});
    const [showSolution, setShowSolution] = useState<Record<number, boolean>>({});

    const task = tasks[currentTask];
    const currentAnswer = answers[currentTask] ?? '';
    const currentFeedback = feedback[currentTask] ?? null;
    const currentShowSolution = showSolution[currentTask] ?? false;

    const handleAnswerChange = (value: string) => {
        setAnswers({ ...answers, [currentTask]: value });
        setFeedback({ ...feedback, [currentTask]: null });
    };

    const checkAnswer = () => {
        const normalized = currentAnswer.trim().replace(',', '.');
        const parsed = parseFloat(normalized);
        if (isNaN(parsed)) {
            setFeedback({ ...feedback, [currentTask]: 'incorrect' });
            return;
        }
        const tolerance = task.correctAnswer * ((task.tolerancePercent ?? 10) / 100);
        const isCorrect = Math.abs(parsed - task.correctAnswer) <= tolerance;
        setFeedback({ ...feedback, [currentTask]: isCorrect ? 'correct' : 'incorrect' });
    };

    const goTo = (index: number) => {
        if (index < 0 || index >= tasks.length) return;
        setCurrentTask(index);
    };

    return (
        <div className="min-h-screen bg-[var(--bg-color)] py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                <Link to="/trigonometrie/anwendungsaufgaben" className="inline-flex items-center gap-2 text-teal-700 hover:text-teal-900 text-sm font-medium mb-4">
                    <i className="fa-solid fa-arrow-left"></i> Zurück zur Übersicht
                </Link>

                <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
                    <h1 className="text-3xl font-bold text-teal-800 text-center">Olympiapark München</h1>

                    <div className="flex justify-center">
                        <img
                            src="/images/olympiapark-muenchen.png"
                            alt="Skizze der Hängebrücken und Flying-Fox-Anlagen im Olympiapark München mit den Punkten S, H, Z, E, B, A, F sowie den gegebenen Längen und Winkeln"
                            className="w-full max-w-2xl border border-slate-200 rounded-lg"
                        />
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
                        <h2 className="font-bold text-teal-700">{task.title}</h2>
                        <p className="whitespace-pre-wrap text-slate-700">{task.context}</p>
                        <p className="font-semibold text-slate-900">{task.question}</p>

                        <div
                            className={`flex flex-col items-center gap-3 rounded-xl border p-4 transition-colors duration-300 ${
                                currentFeedback === 'correct'
                                    ? 'bg-green-50 border-green-300'
                                    : currentFeedback === 'incorrect'
                                    ? 'bg-red-50 border-red-300'
                                    : 'bg-slate-50 border-slate-200'
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    inputMode="decimal"
                                    value={currentAnswer}
                                    onChange={(e) => handleAnswerChange(e.target.value)}
                                    placeholder={task.inputSuffix ? `Ergebnis in ${task.inputSuffix}` : 'Ergebnis'}
                                    className="w-40 px-3 py-2 border border-slate-300 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-teal-500"
                                />
                                <button
                                    onClick={checkAnswer}
                                    className="px-5 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                                >
                                    Prüfen
                                </button>
                            </div>

                            {currentFeedback === 'correct' && (
                                <p className="text-green-700 font-semibold flex items-center gap-2">
                                    <i className="fa-solid fa-circle-check"></i> Richtig! Sehr gut gemacht.
                                </p>
                            )}
                            {currentFeedback === 'incorrect' && (
                                <p className="text-red-600 font-semibold flex items-center gap-2">
                                    <i className="fa-solid fa-circle-xmark"></i> Noch nicht richtig. Versuch es
                                    erneut oder schau dir die Lösung an.
                                </p>
                            )}
                        </div>

                        <div className="flex justify-center">
                            <button
                                onClick={() => setShowSolution({ ...showSolution, [currentTask]: !currentShowSolution })}
                                className="px-6 py-2 bg-slate-700 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors"
                            >
                                {currentShowSolution ? 'Musterlösung verbergen' : 'Musterlösung anzeigen'}
                            </button>
                        </div>

                        {currentShowSolution && (
                            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                                <h3 className="text-lg font-bold mb-4 text-gray-800">Musterlösung</h3>
                                <div className="space-y-4">
                                    {task.solutionSteps.map((step, i) => (
                                        <div key={i}>
                                            <h4 className="font-bold text-teal-700 mb-1">{step.heading}</h4>
                                            {step.text && <p className="mb-1">{step.text}</p>}
                                            {step.math && (
                                                <div className="my-2">
                                                    <BlockMath math={step.math} />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => goTo(currentTask - 1)}
                            disabled={currentTask === 0}
                            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                                currentTask === 0
                                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                    : 'bg-teal-600 text-white hover:bg-teal-700'
                            }`}
                        >
                            ← Zurück
                        </button>

                        <div className="text-slate-700 font-semibold">
                            Aufgabe {currentTask + 1} von {tasks.length}
                        </div>

                        <button
                            onClick={() => goTo(currentTask + 1)}
                            disabled={currentTask === tasks.length - 1}
                            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                                currentTask === tasks.length - 1
                                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                    : 'bg-teal-600 text-white hover:bg-teal-700'
                            }`}
                        >
                            Weiter →
                        </button>
                    </div>

                    <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                            className="bg-teal-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${((currentTask + 1) / tasks.length) * 100}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OlympiaparkMuenchen;

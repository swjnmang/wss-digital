import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

interface SubTask {
    id: string;
    question: string;
    inputSuffix?: string;
    correctAnswer: number;
    tolerancePercent?: number;
    solutionSteps: { heading: string; text: string; math?: string }[];
}

// Hier werden die einzelnen Teilaufgaben ergänzt, sobald sie vorliegen.
const subTasks: SubTask[] = [];

function SubTaskCard({ index, task }: { index: number; task: SubTask }) {
    const [answer, setAnswer] = useState('');
    const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
    const [showSolution, setShowSolution] = useState(false);

    const checkAnswer = () => {
        const normalized = answer.trim().replace(',', '.');
        const parsed = parseFloat(normalized);
        if (isNaN(parsed)) {
            setFeedback('incorrect');
            return;
        }
        const tolerance = task.correctAnswer * ((task.tolerancePercent ?? 10) / 100);
        setFeedback(Math.abs(parsed - task.correctAnswer) <= tolerance ? 'correct' : 'incorrect');
    };

    return (
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
            <h3 className="font-bold text-teal-700">Teilaufgabe {index + 1}</h3>
            <p>{task.question}</p>

            <div
                className={`flex flex-col items-center gap-3 rounded-xl border p-4 transition-colors duration-300 ${
                    feedback === 'correct'
                        ? 'bg-green-50 border-green-300'
                        : feedback === 'incorrect'
                        ? 'bg-red-50 border-red-300'
                        : 'bg-slate-50 border-slate-200'
                }`}
            >
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        inputMode="decimal"
                        value={answer}
                        onChange={(e) => { setAnswer(e.target.value); setFeedback(null); }}
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

                {feedback === 'correct' && (
                    <p className="text-green-700 font-semibold flex items-center gap-2">
                        <i className="fa-solid fa-circle-check"></i> Richtig! Sehr gut gemacht.
                    </p>
                )}
                {feedback === 'incorrect' && (
                    <p className="text-red-600 font-semibold flex items-center gap-2">
                        <i className="fa-solid fa-circle-xmark"></i> Noch nicht richtig. Versuch es erneut oder
                        schau dir die Lösung an.
                    </p>
                )}
            </div>

            <div className="flex justify-center">
                <button
                    onClick={() => setShowSolution(!showSolution)}
                    className="px-6 py-2 bg-slate-700 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors"
                >
                    {showSolution ? 'Musterlösung verbergen' : 'Musterlösung anzeigen'}
                </button>
            </div>

            {showSolution && (
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <h4 className="text-lg font-bold mb-4 text-gray-800">Musterlösung</h4>
                    <div className="space-y-4">
                        {task.solutionSteps.map((step, i) => (
                            <div key={i}>
                                <h5 className="font-bold text-teal-700 mb-1">{step.heading}</h5>
                                <p className="mb-1">{step.text}</p>
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
    );
}

const OlympiaparkMuenchen: React.FC = () => {
    return (
        <div className="min-h-screen bg-[var(--bg-color)] py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                <Link to="/trigonometrie/anwendungsaufgaben" className="inline-flex items-center gap-2 text-teal-700 hover:text-teal-900 text-sm font-medium mb-4">
                    <i className="fa-solid fa-arrow-left"></i> Zurück zur Übersicht
                </Link>

                <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
                    <h1 className="text-3xl font-bold text-teal-800 text-center">Olympiapark München</h1>
                    <p className="text-slate-600 text-center">
                        Rund um den Olympiasee gibt es eine Hängebrücke und eine Flying-Fox-Anlage. Anhand der
                        Skizze berechnest du verschiedene Größen des Geländes.
                    </p>

                    <div className="flex justify-center">
                        <img
                            src="/images/olympiapark-muenchen.png"
                            alt="Skizze der Hängebrücke und Flying-Fox-Anlage im Olympiapark München mit den Punkten S, H, Z, E, B, A, F sowie den gegebenen Längen und Winkeln"
                            className="w-full max-w-2xl border border-slate-200 rounded-lg"
                        />
                    </div>

                    {subTasks.length === 0 && (
                        <p className="text-center text-slate-500 bg-slate-50 border border-slate-200 rounded-xl p-6">
                            Die Teilaufgaben zu dieser Anwendungsaufgabe folgen in Kürze.
                        </p>
                    )}

                    <div className="space-y-6">
                        {subTasks.map((task, index) => (
                            <SubTaskCard key={task.id} index={index} task={task} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OlympiaparkMuenchen;

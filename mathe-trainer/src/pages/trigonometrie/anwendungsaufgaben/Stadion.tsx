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
    image: string;
    imageAlt: string;
    context: string;
    question: string;
    hint: string;
    inputSuffix?: string;
    correctAnswer: number;
    tolerancePercent?: number;
    solutionSteps: SolutionStep[];
}

const SKETCH = '/images/stadion.png';
const SKETCH_ALT =
    'Querschnitt eines Stadions mit Spielfeld, Tribüne, Treppenaufgang CD, Außenwand AE, Stadiondach EF und den Punkten A, B, C, D, E, F, K, M';

const intro =
    'Ein Bundesligaverein plant den Bau eines neuen Stadions. Dazu hat der Architekt einen ' +
    'Entwurf des Neubaus gezeichnet. Die Abbildung zeigt das Stadion samt Spielfeld im ' +
    'Querschnitt. Folgende Vorgaben des Bauherrn liegen vor:';

const tasks: SubTask[] = [
    {
        title: 'Aufgabe 1',
        image: SKETCH,
        imageAlt: SKETCH_ALT,
        context:
            intro +
            '\n\nEine Sicherheitsvorschrift sieht vor, dass die Steigung des Treppenaufgangs ' +
            '|CD| der Tribüne maximal 50 % betragen darf.',
        question:
            'Entscheiden Sie mit Hilfe einer Rechnung, ob die Sicherheitsvorschrift eingehalten wird. ' +
            'Berechne dafür den Steigungswinkel in Prozent.',
        hint:
            'Tipp: Die Steigung in Prozent berechnest du, indem du die Höhe der Treppe durch die ' +
            'waagrechte Strecke teilst und mit 100 multiplizierst.',
        inputSuffix: '%',
        correctAnswer: 46.67,
        solutionSteps: [
            {
                heading: 'Schritt 1: Steigung berechnen',
                text: 'Die Steigung in Prozent ergibt sich aus dem Verhältnis der Höhe zur waagrechten Strecke:',
                math: '\\text{Steigung} = 100 \\cdot \\frac{14}{30}\\,\\%'
            },
            {
                heading: 'Schritt 2: Berechnen',
                math: '\\text{Steigung} \\approx 46{,}67\\,\\% < 50\\,\\%'
            },
            {
                heading: 'Ergebnis',
                text: 'Da die berechnete Steigung von 46,67 % kleiner als 50 % ist, wird die Sicherheitsvorschrift eingehalten.'
            }
        ]
    },
    {
        title: 'Aufgabe 2',
        image: SKETCH,
        imageAlt: SKETCH_ALT,
        context: 'Der Erhebungswinkel des Stadiondaches beträgt ε = 9,50°.',
        question: 'Berechnen Sie die Länge des Stadiondachs |EF|.',
        hint:
            'Tipp: Nutze den Kosinus des Erhebungswinkels ε, der das Verhältnis von Ankathete ' +
            '(|AB| + |BC|) zu Hypotenuse (|EF|) angibt.',
        inputSuffix: 'm',
        correctAnswer: 50.70,
        solutionSteps: [
            {
                heading: 'Schritt 1: Kosinus-Beziehung aufstellen',
                text: 'Im rechtwinkligen Dreieck gilt mit |AB| + |BC| als angrenzender Seite:',
                math: '\\cos \\varepsilon = \\frac{|\\overline{AB}| + |\\overline{BC}|}{|\\overline{EF}|}'
            },
            {
                heading: 'Schritt 2: Nach |EF| auflösen und Werte einsetzen',
                math: '|\\overline{EF}| = \\frac{20 + 30}{\\cos(9{,}50^\\circ)}'
            },
            {
                heading: 'Schritt 3: Berechnen',
                math: '|\\overline{EF}| \\approx 50{,}70 \\text{ m}'
            }
        ]
    },
    {
        title: 'Aufgabe 3',
        image: SKETCH,
        imageAlt: SKETCH_ALT,
        context: 'Die Strecke EF beträgt 50,70 Meter.',
        question: 'Berechnen Sie die Höhe der Außenwand |AE|.',
        hint:
            'Tipp: Bestimme zunächst die Innenwinkel des Dreiecks AEF und wende anschließend den ' +
            'Sinussatz an.',
        inputSuffix: 'm',
        correctAnswer: 26.65,
        solutionSteps: [
            {
                heading: 'Schritt 1: Winkel ∢AEF bestimmen',
                math: '\\angle AEF = 90^\\circ + \\varepsilon = 90^\\circ + 9{,}50^\\circ = 99{,}50^\\circ'
            },
            {
                heading: 'Schritt 2: Winkel ∢EFA bestimmen',
                math: '\\angle EFA = 180^\\circ - 55^\\circ - 99{,}50^\\circ = 25{,}50^\\circ'
            },
            {
                heading: 'Schritt 3: Sinussatz aufstellen',
                math: '\\frac{|\\overline{AE}|}{\\sin(\\angle EFA)} = \\frac{|\\overline{EF}|}{\\sin\\alpha}'
            },
            {
                heading: 'Schritt 4: Nach |AE| auflösen und berechnen',
                math: '|\\overline{AE}| = \\frac{50{,}70}{\\sin(55^\\circ)} \\cdot \\sin(25{,}50^\\circ) \\approx 26{,}65 \\text{ m}'
            }
        ]
    },
    {
        title: 'Aufgabe 4',
        image: SKETCH,
        imageAlt: SKETCH_ALT,
        context:
            'Die Fläche ADE soll für Werbezwecke verwendet werden. Die Strecke AE ist 26,65 m lang.',
        question: 'Berechnen Sie die Größe dieser Werbefläche.',
        hint:
            'Tipp: Berechne zunächst |AD| mit dem Satz des Pythagoras und nutze dann die ' +
            'Flächenformel mit Sinus.',
        inputSuffix: 'm²',
        correctAnswer: 266.44,
        solutionSteps: [
            {
                heading: 'Schritt 1: Satz des Pythagoras für |AD|',
                math: '|\\overline{AD}|^2 = |\\overline{AB}|^2 + |\\overline{BD}|^2 = 20^2 + 14^2'
            },
            {
                heading: 'Schritt 2: Berechnen',
                math: '|\\overline{AD}| \\approx 24{,}41 \\text{ m}'
            },
            {
                heading: 'Schritt 3: Flächensatz aufstellen',
                math: 'A_{\\text{Werbefläche}} = \\frac{1}{2} \\cdot |\\overline{AE}| \\cdot |\\overline{AD}| \\cdot \\sin\\alpha'
            },
            {
                heading: 'Schritt 4: Werte einsetzen und berechnen',
                math: 'A_{\\text{Werbefläche}} = \\frac{1}{2} \\cdot 26{,}65 \\cdot 24{,}41 \\cdot \\sin(55^\\circ) \\approx 266{,}44 \\text{ m}^2'
            }
        ]
    },
    {
        title: 'Aufgabe 5',
        image: SKETCH,
        imageAlt: SKETCH_ALT,
        context:
            'Am oberen Ende des Stadiondaches wird im Punkt F ein Flutlichtscheinwerfer ' +
            'angebracht, der die gesamte Spielfeldbreite ausleuchten soll.\n\n' +
            'Die Entfernung des Flutlichtscheinwerfers beträgt zum linken Spielfeldrand ' +
            '|FK| = 36,45 m und zum rechten Rand |FM| = 106,12 m.',
        question: 'Berechnen Sie den dafür notwendigen Abstrahlwinkel γ.',
        hint:
            'Tipp: Da alle drei Seiten des Dreiecks FKM bekannt sind, hilft dir der Kosinussatz, ' +
            'den Winkel γ zu berechnen.',
        inputSuffix: '°',
        correctAnswer: 54.52,
        solutionSteps: [
            {
                heading: 'Schritt 1: Kosinussatz aufstellen',
                text: 'Im Dreieck FKM sind alle drei Seiten bekannt, daher liefert der Kosinussatz den Winkel γ bei F:',
                math: '\\cos\\gamma = \\frac{|\\overline{FK}|^2 + |\\overline{FM}|^2 - |\\overline{KM}|^2}{2 \\cdot |\\overline{FK}| \\cdot |\\overline{FM}|}'
            },
            {
                heading: 'Schritt 2: Werte einsetzen',
                math: '\\cos\\gamma = \\frac{36{,}45^2 + 106{,}12^2 - 90^2}{2 \\cdot 36{,}45 \\cdot 106{,}12}'
            },
            {
                heading: 'Schritt 3: Berechnen',
                math: '\\gamma \\approx 54{,}52^\\circ'
            }
        ]
    }
];

const Stadion: React.FC = () => {
    const [currentTask, setCurrentTask] = useState(0);
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [feedback, setFeedback] = useState<Record<number, 'correct' | 'incorrect' | null>>({});
    const [showSolution, setShowSolution] = useState<Record<number, boolean>>({});
    const [wrongAttempt, setWrongAttempt] = useState<Record<number, boolean>>({});

    const task = tasks[currentTask];
    const currentAnswer = answers[currentTask] ?? '';
    const currentFeedback = feedback[currentTask] ?? null;
    const currentShowSolution = showSolution[currentTask] ?? false;
    const currentWrongAttempt = wrongAttempt[currentTask] ?? false;

    const handleAnswerChange = (value: string) => {
        setAnswers({ ...answers, [currentTask]: value });
        setFeedback({ ...feedback, [currentTask]: null });
    };

    const checkAnswer = () => {
        const normalized = currentAnswer.trim().replace(',', '.');
        const parsed = parseFloat(normalized);
        if (isNaN(parsed)) {
            setFeedback({ ...feedback, [currentTask]: 'incorrect' });
            setWrongAttempt({ ...wrongAttempt, [currentTask]: true });
            return;
        }
        const tolerance = task.correctAnswer * ((task.tolerancePercent ?? 5) / 100);
        const isCorrect = Math.abs(parsed - task.correctAnswer) <= tolerance;
        setFeedback({ ...feedback, [currentTask]: isCorrect ? 'correct' : 'incorrect' });
        if (!isCorrect) {
            setWrongAttempt({ ...wrongAttempt, [currentTask]: true });
        }
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
                    <h1 className="text-3xl font-bold text-teal-800 text-center">Stadionneubau</h1>

                    <div className="flex justify-center">
                        <img
                            src={task.image}
                            alt={task.imageAlt}
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
                                <div className="text-center">
                                    <p className="text-red-600 font-semibold flex items-center justify-center gap-2">
                                        <i className="fa-solid fa-circle-xmark"></i> Noch nicht richtig.
                                    </p>
                                    <p className="text-slate-600 text-sm mt-1">{task.hint}</p>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-center">
                            {currentWrongAttempt ? (
                                <button
                                    onClick={() => setShowSolution({ ...showSolution, [currentTask]: !currentShowSolution })}
                                    className="px-6 py-2 bg-slate-700 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors"
                                >
                                    {currentShowSolution ? 'Musterlösung verbergen' : 'Musterlösung anzeigen'}
                                </button>
                            ) : (
                                <p className="text-slate-400 text-sm italic">
                                    Versuche es zuerst selbst. Nach einem falschen Versuch kannst du dir die
                                    Musterlösung anzeigen lassen.
                                </p>
                            )}
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

export default Stadion;

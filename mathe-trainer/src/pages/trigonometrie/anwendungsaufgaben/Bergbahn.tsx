import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { renderTextWithMath } from '../../../components/TextWithMath';
import { UNIT_OPTIONS, isWithinTolerance } from '../../../utils/anwendungsaufgabenHelpers';

interface SolutionStep {
    heading: string;
    text?: string;
    math?: string;
}

interface SubTask {
    title: string;
    image: string;
    imageAlt: string;
    context: string;
    question: string;
    hint: string;
    correctAnswer: number;
    correctUnit: string;
    solutionSteps: SolutionStep[];
}

const SKETCH = '/images/bergbahn.svg';
const SKETCH_ALT =
    'Skizze einer Bergbahn mit Talstation T, Fußpunkt F, Mittelstation M, Messpunkt P, Bergstation B ' +
    'sowie den Hütten X und Y mit allen gegebenen Längen und Winkeln';

const intro =
    'In einem Skigebiet wird eine neue Bergbahn gebaut. Sie führt in zwei Sektionen von der ' +
    'Talstation T über die Mittelstation M hinauf zur Bergstation B. Alle bekannten Längen und ' +
    'Winkel findest du in der Skizze.';

const tasks: SubTask[] = [
    {
        title: 'Aufgabe 1',
        image: SKETCH,
        imageAlt: SKETCH_ALT,
        context:
            intro +
            '\n\nDie erste Sektion überwindet zwischen T und M einen Höhenunterschied von ' +
            '\\overline{FM} = 320 m bei einer horizontalen Entfernung von \\overline{TF} = 800 m. ' +
            'Bei F liegt ein rechter Winkel.',
        question: 'Unter welchem Steigungswinkel α steigt das Seil der ersten Sektion an?',
        hint:
            'Im rechtwinkligen Dreieck TFM kennst du die Gegenkathete und die Ankathete von α – ' +
            'nutze den Tangens.',
        correctAnswer: 21.80,
        correctUnit: '°',
        solutionSteps: [
            {
                heading: 'Schritt 1: Tangens-Beziehung aufstellen',
                text: 'Im rechtwinkligen Dreieck TFM ist \\overline{FM} die Gegenkathete und \\overline{TF} die Ankathete von α:',
                math: '\\tan\\alpha = \\frac{|\\overline{FM}|}{|\\overline{TF}|} = \\frac{320}{800}'
            },
            {
                heading: 'Schritt 2: Nach α auflösen',
                math: '\\alpha = \\tan^{-1}(0{,}4)'
            },
            {
                heading: 'Schritt 3: Berechnen',
                math: '\\alpha \\approx 21{,}80^\\circ'
            }
        ]
    },
    {
        title: 'Aufgabe 2',
        image: SKETCH,
        imageAlt: SKETCH_ALT,
        context:
            'Für die Baugenehmigung muss die Steigung der ersten Sektion zusätzlich in Prozent ' +
            'angegeben werden. Es gilt weiterhin \\overline{FM} = 320 m und \\overline{TF} = 800 m.',
        question: 'Wie groß ist die Steigung der ersten Sektion in Prozent?',
        hint:
            'Die Steigung in Prozent ist der Höhenunterschied geteilt durch die horizontale ' +
            'Entfernung, multipliziert mit 100.',
        correctAnswer: 40,
        correctUnit: '%',
        solutionSteps: [
            {
                heading: 'Schritt 1: Formel für die Steigung aufstellen',
                math: '\\text{Steigung} = \\frac{|\\overline{FM}|}{|\\overline{TF}|} \\cdot 100\\,\\%'
            },
            {
                heading: 'Schritt 2: Werte einsetzen und berechnen',
                math: '\\text{Steigung} = \\frac{320}{800} \\cdot 100\\,\\% = 40\\,\\%'
            }
        ]
    },
    {
        title: 'Aufgabe 3',
        image: SKETCH,
        imageAlt: SKETCH_ALT,
        context:
            'Der Steigungswinkel der ersten Sektion beträgt α = 21,80°, die horizontale ' +
            'Entfernung \\overline{TF} = 800 m.',
        question: 'Wie lang muss das Tragseil s₁ der ersten Sektion zwischen T und M mindestens sein?',
        hint:
            'Das Seil \\overline{TM} ist die Hypotenuse des rechtwinkligen Dreiecks. Du kennst die ' +
            'Ankathete \\overline{TF} und den Winkel α – nutze den Kosinus.',
        correctAnswer: 861.63,
        correctUnit: 'm',
        solutionSteps: [
            {
                heading: 'Schritt 1: Kosinus-Beziehung aufstellen',
                text: '\\overline{TF} ist die Ankathete von α, \\overline{TM} die Hypotenuse:',
                math: '\\cos\\alpha = \\frac{|\\overline{TF}|}{|\\overline{TM}|}'
            },
            {
                heading: 'Schritt 2: Nach |TM| auflösen',
                math: '|\\overline{TM}| = \\frac{|\\overline{TF}|}{\\cos\\alpha} = \\frac{800}{\\cos(21{,}80^\\circ)}'
            },
            {
                heading: 'Schritt 3: Berechnen',
                math: '|\\overline{TM}| \\approx 861{,}63 \\text{ m}'
            }
        ]
    },
    {
        title: 'Aufgabe 4',
        image: SKETCH,
        imageAlt: SKETCH_ALT,
        context:
            'Die zweite Sektion führt von M zur Bergstation B und überspannt dabei eine Geländemulde. ' +
            'Vom Messpunkt P in der Mulde aus wurde gemessen: \\overline{MP} = 450 m, der Winkel bei M ' +
            'beträgt 48°, der Winkel bei P beträgt 105°.',
        question: 'Wie lang muss das Tragseil s₂ der zweiten Sektion zwischen M und B mindestens sein?',
        hint:
            'Berechne zunächst den fehlenden Winkel bei B über die Winkelsumme im Dreieck und wende ' +
            'dann den Sinussatz an.',
        correctAnswer: 957.44,
        correctUnit: 'm',
        solutionSteps: [
            {
                heading: 'Schritt 1: Fehlenden Winkel bei B bestimmen',
                text: 'Die Winkelsumme im Dreieck MPB ergibt:',
                math: '\\angle MBP = 180^\\circ - 48^\\circ - 105^\\circ = 27^\\circ'
            },
            {
                heading: 'Schritt 2: Sinussatz aufstellen',
                math: '\\frac{|\\overline{MB}|}{\\sin(105^\\circ)} = \\frac{|\\overline{MP}|}{\\sin(27^\\circ)}'
            },
            {
                heading: 'Schritt 3: Nach |MB| auflösen',
                math: '|\\overline{MB}| = \\frac{450 \\cdot \\sin(105^\\circ)}{\\sin(27^\\circ)}'
            },
            {
                heading: 'Schritt 4: Berechnen',
                math: '|\\overline{MB}| \\approx 957{,}44 \\text{ m}'
            }
        ]
    },
    {
        title: 'Aufgabe 5',
        image: SKETCH,
        imageAlt: SKETCH_ALT,
        context:
            'Von der Bergstation B führen zwei Skipisten hinab zu den Hütten X und Y. Die Pisten sind ' +
            '\\overline{BX} = 1500 m und \\overline{BY} = 1300 m lang, die Hütten stehen ' +
            '\\overline{XY} = 700 m voneinander entfernt.',
        question: 'Wie groß ist der Öffnungswinkel γ zwischen den beiden Pisten an der Bergstation B?',
        hint: 'Alle drei Seiten des Dreiecks BXY sind bekannt – nutze den Kosinussatz.',
        correctAnswer: 27.80,
        correctUnit: '°',
        solutionSteps: [
            {
                heading: 'Schritt 1: Kosinussatz aufstellen',
                text: 'Im Dreieck BXY sind alle drei Seiten bekannt, daher liefert der Kosinussatz den Winkel γ bei B:',
                math: '\\cos\\gamma = \\frac{|\\overline{BX}|^2 + |\\overline{BY}|^2 - |\\overline{XY}|^2}{2 \\cdot |\\overline{BX}| \\cdot |\\overline{BY}|}'
            },
            {
                heading: 'Schritt 2: Werte einsetzen',
                math: '\\cos\\gamma = \\frac{1500^2 + 1300^2 - 700^2}{2 \\cdot 1500 \\cdot 1300} \\approx 0{,}8846'
            },
            {
                heading: 'Schritt 3: Berechnen',
                math: '\\gamma \\approx 27{,}80^\\circ'
            }
        ]
    },
    {
        title: 'Aufgabe 6',
        image: SKETCH,
        imageAlt: SKETCH_ALT,
        context:
            'Das dreieckige Waldstück zwischen den beiden Pisten (Dreieck BXY) wird als Wildschutzzone ' +
            'ausgewiesen. Es gilt \\overline{BX} = 1500 m, \\overline{BY} = 1300 m und γ = 27,80°.',
        question: 'Wie groß ist die Fläche der Wildschutzzone?',
        hint: 'Du kennst zwei Seiten und den eingeschlossenen Winkel – nutze den Flächensatz.',
        correctAnswer: 454727,
        correctUnit: 'm²',
        solutionSteps: [
            {
                heading: 'Schritt 1: Flächensatz aufstellen',
                math: 'A_{\\triangle BXY} = \\frac{1}{2} \\cdot |\\overline{BX}| \\cdot |\\overline{BY}| \\cdot \\sin\\gamma'
            },
            {
                heading: 'Schritt 2: Werte einsetzen',
                math: 'A_{\\triangle BXY} = \\frac{1}{2} \\cdot 1500 \\cdot 1300 \\cdot \\sin(27{,}80^\\circ)'
            },
            {
                heading: 'Schritt 3: Berechnen',
                math: 'A_{\\triangle BXY} \\approx 454.727 \\text{ m}^2 \\approx 45{,}5 \\text{ ha}'
            }
        ]
    }
];

const Bergbahn: React.FC = () => {
    const [currentTask, setCurrentTask] = useState(0);
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [units, setUnits] = useState<Record<number, string>>({});
    const [feedback, setFeedback] = useState<Record<number, 'correct' | 'incorrect' | null>>({});
    const [showSolution, setShowSolution] = useState<Record<number, boolean>>({});
    const [wrongAttempt, setWrongAttempt] = useState<Record<number, boolean>>({});
    const [showHint, setShowHint] = useState<Record<number, boolean>>({});

    const task = tasks[currentTask];
    const currentAnswer = answers[currentTask] ?? '';
    const currentUnit = units[currentTask] ?? '';
    const currentFeedback = feedback[currentTask] ?? null;
    const currentShowSolution = showSolution[currentTask] ?? false;
    const currentWrongAttempt = wrongAttempt[currentTask] ?? false;
    const currentShowHint = showHint[currentTask] ?? false;

    const handleAnswerChange = (value: string) => {
        setAnswers({ ...answers, [currentTask]: value });
        setFeedback({ ...feedback, [currentTask]: null });
    };

    const handleUnitChange = (value: string) => {
        setUnits({ ...units, [currentTask]: value });
        setFeedback({ ...feedback, [currentTask]: null });
    };

    const checkAnswer = () => {
        const raw = currentAnswer.trim();
        // Eingaben wie "454.727,5" (deutscher Tausenderpunkt) korrekt behandeln
        const normalized = raw.includes(',')
            ? raw.replace(/\./g, '').replace(',', '.')
            : raw;
        const value = parseFloat(normalized);
        if (isNaN(value) || !currentUnit) {
            setFeedback({ ...feedback, [currentTask]: 'incorrect' });
            setWrongAttempt({ ...wrongAttempt, [currentTask]: true });
            return;
        }
        const isCorrect = isWithinTolerance(value, task.correctAnswer) && currentUnit === task.correctUnit;
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
            <div className="mx-auto px-4 max-w-4xl">
                <Link to="/trigonometrie/anwendungsaufgaben" className="inline-flex items-center gap-2 text-teal-700 hover:text-teal-900 text-sm font-medium mb-4">
                    <i className="fa-solid fa-arrow-left"></i> Zurück zur Übersicht
                </Link>

                <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
                    <h1 className="text-3xl font-bold text-teal-800 text-center">Die Bergbahn</h1>

                    <div className="flex justify-center">
                        <img
                            src={task.image}
                            alt={task.imageAlt}
                            className="w-full max-w-2xl border border-slate-200 rounded-lg"
                        />
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
                        <h2 className="font-bold text-teal-700">{task.title}</h2>
                        <p className="whitespace-pre-wrap text-slate-700">{renderTextWithMath(task.context)}</p>
                        <p className="font-semibold text-slate-900">{renderTextWithMath(task.question)}</p>

                        <div
                            className={`flex flex-col items-center gap-3 rounded-xl border p-4 transition-colors duration-300 ${
                                currentFeedback === 'correct'
                                    ? 'bg-green-50 border-green-300'
                                    : currentFeedback === 'incorrect'
                                    ? 'bg-red-50 border-red-300'
                                    : 'bg-slate-50 border-slate-200'
                            }`}
                        >
                            <div className="flex flex-wrap items-center justify-center gap-2">
                                <input
                                    type="text"
                                    inputMode="decimal"
                                    value={currentAnswer}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleAnswerChange(e.target.value)}
                                    placeholder="Ergebnis"
                                    className="w-32 px-3 py-2 border border-slate-300 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-teal-500"
                                />
                                <select
                                    value={currentUnit}
                                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleUnitChange(e.target.value)}
                                    className="px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                                >
                                    <option value="" disabled>
                                        Einheit
                                    </option>
                                    {UNIT_OPTIONS.map((unit) => (
                                        <option key={unit} value={unit}>
                                            {unit}
                                        </option>
                                    ))}
                                </select>
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
                                <p className="text-red-600 font-semibold flex items-center justify-center gap-2">
                                    <i className="fa-solid fa-circle-xmark"></i> Noch nicht richtig.
                                </p>
                            )}
                        </div>

                        <div className="flex flex-wrap justify-center gap-3">
                            <button
                                onClick={() => setShowHint({ ...showHint, [currentTask]: !currentShowHint })}
                                className="px-6 py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors"
                            >
                                <i className="fa-solid fa-lightbulb mr-2"></i>
                                {currentShowHint ? 'Tipp verbergen' : 'Tipp anzeigen'}
                            </button>

                            {currentWrongAttempt && (
                                <button
                                    onClick={() => setShowSolution({ ...showSolution, [currentTask]: !currentShowSolution })}
                                    className="px-6 py-2 bg-slate-700 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors"
                                >
                                    {currentShowSolution ? 'Musterlösung verbergen' : 'Musterlösung anzeigen'}
                                </button>
                            )}
                        </div>

                        {!currentWrongAttempt && (
                            <p className="text-slate-400 text-sm italic text-center">
                                Versuche es zuerst selbst. Nach einem falschen Versuch kannst du dir die
                                Musterlösung anzeigen lassen.
                            </p>
                        )}

                        {currentShowHint && (
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                                <i className="fa-solid fa-lightbulb text-amber-500 mt-1"></i>
                                <p className="text-amber-800">{renderTextWithMath(task.hint)}</p>
                            </div>
                        )}

                        {currentShowSolution && (
                            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                                <h3 className="text-lg font-bold mb-4 text-gray-800">Musterlösung</h3>
                                <div className="space-y-4">
                                    {task.solutionSteps.map((step, i) => (
                                        <div key={i}>
                                            <h4 className="font-bold text-teal-700 mb-1">{step.heading}</h4>
                                            {step.text && <p className="mb-1">{renderTextWithMath(step.text)}</p>}
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

export default Bergbahn;

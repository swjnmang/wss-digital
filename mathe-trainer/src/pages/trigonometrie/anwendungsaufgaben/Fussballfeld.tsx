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

const SKETCH = '/images/fußballfeld.png';
const SKETCH_ALT =
    'Skizze eines Fußballfelds mit mehreren Dreiecken zwischen den Spielern M, O, N, P, Q, R, T, U, S, Z, W und V ' +
    'sowie den gegebenen Längen und Winkeln';

const intro =
    'Auf einem Fußball-Kleinfeld werden verschiedene Spielsituationen mit Hilfe von Dreiecksberechnungen ' +
    'ausgewertet. Da es sich um ein Kleinfeld handelt, ist das Tor nur 1 m breit. Die Positionen der ' +
    'Spieler und alle bekannten Längen und Winkel sind in der folgenden Skizze dargestellt.';

const tasks: SubTask[] = [
    {
        title: 'Aufgabe 1',
        image: SKETCH,
        imageAlt: SKETCH_ALT,
        context:
            intro +
            '\n\nIn der linken Ecke steht der Spieler in Punkt N. Die Punkte O und M liegen auf der ' +
            'Torlinie, \\overline{OM} = 1 m. Für die Abstände zum Spieler gilt \\overline{ON} = 1,58 m ' +
            'und \\overline{NM} = 2,12 m.',
        question:
            'Der Spieler in Punkt N schießt auf das Tor. Wie groß ist der Winkel α, den der Torhüter ' +
            'abdecken muss?',
        hint: 'Löse mit dem Kosinussatz.',
        correctAnswer: 26.58,
        correctUnit: '°',
        solutionSteps: [
            {
                heading: 'Schritt 1: Kosinussatz aufstellen',
                text: 'Im Dreieck ONM sind alle drei Seiten bekannt, daher liefert der Kosinussatz den Winkel α bei N:',
                math: '\\cos\\alpha = \\frac{|\\overline{ON}|^2 + |\\overline{NM}|^2 - |\\overline{OM}|^2}{2 \\cdot |\\overline{ON}| \\cdot |\\overline{NM}|}'
            },
            {
                heading: 'Schritt 2: Werte einsetzen',
                math: '\\cos\\alpha = \\frac{1{,}58^2 + 2{,}12^2 - 1^2}{2 \\cdot 1{,}58 \\cdot 2{,}12}'
            },
            {
                heading: 'Schritt 3: Berechnen',
                math: '\\alpha \\approx 26{,}58^\\circ'
            }
        ]
    },
    {
        title: 'Aufgabe 2',
        image: SKETCH,
        imageAlt: SKETCH_ALT,
        context:
            'Im Mittelfeld bilden die drei Abwehrspieler P, Q und R ein Dreieck. Es gilt ' +
            '\\overline{QP} = 2,52 m und \\overline{QR} = 2,12 m. Der Winkel bei P beträgt 33,04°, ' +
            'der Winkel bei R beträgt 40,36°.',
        question:
            'Wie groß ist die Fläche, die die Abwehrspieler P, Q und R gemeinsam im Dreieck abdecken?',
        hint: 'Löse mit dem Flächensatz.',
        correctAnswer: 2.56,
        correctUnit: 'm²',
        solutionSteps: [
            {
                heading: 'Schritt 1: Winkel bei Q bestimmen',
                text: 'Die Winkelsumme im Dreieck ergibt:',
                math: '\\angle PQR = 180^\\circ - 33{,}04^\\circ - 40{,}36^\\circ = 106{,}60^\\circ'
            },
            {
                heading: 'Schritt 2: Flächensatz aufstellen',
                math: 'A_{\\triangle PQR} = \\frac{1}{2} \\cdot |\\overline{QP}| \\cdot |\\overline{QR}| \\cdot \\sin(\\angle PQR)'
            },
            {
                heading: 'Schritt 3: Werte einsetzen',
                math: 'A_{\\triangle PQR} = \\frac{1}{2} \\cdot 2{,}52 \\cdot 2{,}12 \\cdot \\sin(106{,}60^\\circ)'
            },
            {
                heading: 'Schritt 4: Berechnen',
                math: 'A_{\\triangle PQR} \\approx 2{,}56 \\text{ m}^2'
            }
        ]
    },
    {
        title: 'Aufgabe 3',
        image: SKETCH,
        imageAlt: SKETCH_ALT,
        context:
            'Betrachte weiterhin das Dreieck aus Spieler P, Q und R mit \\overline{QP} = 2,52 m, ' +
            '\\overline{QR} = 2,12 m, dem Winkel bei P von 33,04° und dem Winkel bei R von 40,36°.',
        question: 'Wie weit stehen Spieler P und R voneinander entfernt?',
        hint: 'Berechne zunächst den fehlenden Winkel und löse dann mit dem Sinussatz.',
        correctAnswer: 3.73,
        correctUnit: 'm',
        solutionSteps: [
            {
                heading: 'Schritt 1: Fehlenden Winkel bestimmen',
                text: 'Die Winkelsumme im Dreieck ergibt:',
                math: '\\angle PQR = 180^\\circ - 33{,}04^\\circ - 40{,}36^\\circ = 106{,}60^\\circ'
            },
            {
                heading: 'Schritt 2: Sinussatz aufstellen',
                math: '\\frac{|\\overline{PR}|}{\\sin(\\angle PQR)} = \\frac{|\\overline{QP}|}{\\sin(40{,}36^\\circ)}'
            },
            {
                heading: 'Schritt 3: Nach |PR| auflösen',
                math: '|\\overline{PR}| = \\frac{2{,}52 \\cdot \\sin(106{,}60^\\circ)}{\\sin(40{,}36^\\circ)}'
            },
            {
                heading: 'Schritt 4: Berechnen',
                math: '|\\overline{PR}| \\approx 3{,}73 \\text{ m}'
            }
        ]
    },
    {
        title: 'Aufgabe 4',
        image: SKETCH,
        imageAlt: SKETCH_ALT,
        context:
            'In der rechten Ecke des Spielfelds führt Spieler S einen Eckball aus. Das Dreieck TUS ist ' +
            'bei U rechtwinklig, mit \\overline{TU} = 1,5 m und \\overline{TS} = 2,5 m.',
        question: 'In der rechten Ecke führt Spieler S einen Eckball aus. Wie groß ist der Winkel ε?',
        hint: 'Es ist ein rechtwinkliges Dreieck, bei dem Hypotenuse und Gegenkathete bekannt sind.',
        correctAnswer: 36.87,
        correctUnit: '°',
        solutionSteps: [
            {
                heading: 'Schritt 1: Sinus-Beziehung aufstellen',
                text: 'Im rechtwinkligen Dreieck TUS (rechter Winkel bei U) ist \\overline{TU} die Gegenkathete und \\overline{TS} die Hypotenuse von ε:',
                math: '\\sin\\varepsilon = \\frac{|\\overline{TU}|}{|\\overline{TS}|}'
            },
            {
                heading: 'Schritt 2: Werte einsetzen',
                math: '\\sin\\varepsilon = \\frac{1{,}5}{2{,}5}'
            },
            {
                heading: 'Schritt 3: Berechnen',
                math: '\\varepsilon \\approx 36{,}87^\\circ'
            }
        ]
    },
    {
        title: 'Aufgabe 5',
        image: SKETCH,
        imageAlt: SKETCH_ALT,
        context:
            'Der Trainer möchte den Steigungswinkel ε von Spieler S aus nicht nur in Grad, sondern auch ' +
            'als Steigung in Prozent kennen. Es gilt weiterhin \\overline{TU} = 1,5 m und \\overline{TS} = 2,5 m.',
        question: 'Wie groß ist die Steigung des Winkels ε in Prozent?',
        hint:
            'Berechne zunächst die Ankathete \\overline{US} mit dem Kosinus und bilde dann das Verhältnis ' +
            'von Gegenkathete zu Ankathete, multipliziert mit 100.',
        correctAnswer: 75,
        correctUnit: '%',
        solutionSteps: [
            {
                heading: 'Schritt 1: Ankathete berechnen',
                math: '|\\overline{US}| = |\\overline{TS}| \\cdot \\cos\\varepsilon = 2{,}5 \\cdot \\cos(36{,}87^\\circ) \\approx 2{,}00 \\text{ m}'
            },
            {
                heading: 'Schritt 2: Steigung-Formel aufstellen',
                text: 'Die Steigung in Prozent ist das Verhältnis von Gegenkathete zu Ankathete:',
                math: '\\text{Steigung} = \\frac{|\\overline{TU}|}{|\\overline{US}|} \\cdot 100\\,\\%'
            },
            {
                heading: 'Schritt 3: Werte einsetzen und berechnen',
                math: '\\text{Steigung} = \\frac{1{,}5}{2{,}00} \\cdot 100\\,\\% = 75\\,\\%'
            }
        ]
    },
    {
        title: 'Aufgabe 6',
        image: SKETCH,
        imageAlt: SKETCH_ALT,
        context:
            'Weiterhin gilt im Dreieck TUS: \\overline{TU} = 1,5 m, \\overline{TS} = 2,5 m und ε ≈ 36,87°.',
        question: 'Wie weit steht Spieler U von Spieler S entfernt?',
        hint: 'Du kennst Winkel, Hypotenuse und Gegenkathete.',
        correctAnswer: 2.00,
        correctUnit: 'm',
        solutionSteps: [
            {
                heading: 'Schritt 1: Kosinus-Beziehung aufstellen',
                text: '\\overline{US} ist die Ankathete von ε, \\overline{TS} die Hypotenuse:',
                math: '\\cos\\varepsilon = \\frac{|\\overline{US}|}{|\\overline{TS}|}'
            },
            {
                heading: 'Schritt 2: Nach |US| auflösen und Werte einsetzen',
                math: '|\\overline{US}| = |\\overline{TS}| \\cdot \\cos\\varepsilon = 2{,}5 \\cdot \\cos(36{,}87^\\circ)'
            },
            {
                heading: 'Schritt 3: Berechnen',
                math: '|\\overline{US}| \\approx 2{,}00 \\text{ m}'
            }
        ]
    },
    {
        title: 'Aufgabe 7',
        image: SKETCH,
        imageAlt: SKETCH_ALT,
        context:
            'Auf der gegenüberliegenden Spielfeldseite steht Spieler V genau in der Eckfahne und führt ' +
            'einen Eckball zu Spieler W aus. Es gilt \\overline{ZW} = 0,97 m, der Winkel bei Z ' +
            'ι = 58,53° sowie der Winkel θ = 57,31° zwischen der Seitenlinie und dem Passweg \\overline{VW} bei V.',
        question: 'Auf der Gegenseite führt Spieler V eine Ecke zu Spieler W aus. Wie lange ist der Passweg?',
        hint:
            'Berechne zunächst den Winkel bei Punkt V, indem du von 90° den Winkel θ = 57,31° abziehst. ' +
            'Löse dann mit dem Sinussatz!',
        correctAnswer: 1.53,
        correctUnit: 'm',
        solutionSteps: [
            {
                heading: 'Schritt 1: Winkel bei V bestimmen',
                text: 'Da V genau in der Eckfahne liegt, schließen Torlinie und Seitenlinie einen rechten Winkel ein:',
                math: '\\angle ZVW = 90^\\circ - \\theta = 90^\\circ - 57{,}31^\\circ = 32{,}69^\\circ'
            },
            {
                heading: 'Schritt 2: Sinussatz aufstellen',
                math: '\\frac{|\\overline{VW}|}{\\sin(\\iota)} = \\frac{|\\overline{ZW}|}{\\sin(\\angle ZVW)}'
            },
            {
                heading: 'Schritt 3: Nach |VW| auflösen',
                math: '|\\overline{VW}| = \\frac{0{,}97 \\cdot \\sin(58{,}53^\\circ)}{\\sin(32{,}69^\\circ)}'
            },
            {
                heading: 'Schritt 4: Berechnen',
                math: '|\\overline{VW}| \\approx 1{,}53 \\text{ m}'
            }
        ]
    }
];

const Fussballfeld: React.FC = () => {
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
        const normalized = currentAnswer.trim().replace(',', '.');
        const parsed = parseFloat(normalized);
        if (isNaN(parsed) || !currentUnit) {
            setFeedback({ ...feedback, [currentTask]: 'incorrect' });
            setWrongAttempt({ ...wrongAttempt, [currentTask]: true });
            return;
        }
        const isCorrect = isWithinTolerance(parsed, task.correctAnswer) && currentUnit === task.correctUnit;
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
        <div className="py-8">
            <div className="mx-auto px-4 max-w-4xl">
                <Link to="/trigonometrie/anwendungsaufgaben" className="inline-flex items-center gap-2 text-teal-700 hover:text-teal-900 text-sm font-medium mb-4">
                    <i className="fa-solid fa-arrow-left"></i> Zurück zur Übersicht
                </Link>

                <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
                    <h1 className="text-3xl font-bold text-teal-800 text-center">Das Fußballfeld</h1>

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

export default Fussballfeld;

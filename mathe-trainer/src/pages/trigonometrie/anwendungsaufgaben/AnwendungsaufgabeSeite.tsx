import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { renderTextWithMath } from '../../../components/TextWithMath';
import { UNIT_OPTIONS, isWithinTolerance } from '../../../utils/anwendungsaufgabenHelpers';
import TaskShell from '../../../components/layout/TaskShell';
import { fieldCheckClass } from '../../../utils/fieldCheck';
import { getAreaFromPath, HelpUsage, logTrackingEntry } from '../../../utils/tracking';
import { useFlushOnLeave } from '../../../hooks/useTaskTracking';

// Gemeinsame Seite für Anwendungsaufgaben der Trigonometrie: eine Skizze, mehrere
// Teilaufgaben nacheinander, Eingabe mit Einheit, Tipp und Musterlösung.
// Jede Teilaufgabe wird im Nachverfolgungsmodus als eigene Aufgabe protokolliert.

export interface SolutionStep {
    heading: string;
    text?: string;
    math?: string;
}

export interface SubTask {
    context: string;
    question: string;
    hint: string;
    correctAnswer: number;
    correctUnit: string;
    solutionSteps: SolutionStep[];
}

interface Props {
    title: string;
    image: string;
    imageAlt: string;
    tasks: SubTask[];
}

interface TrackState {
    attempts: number;
    firstTryCorrect: boolean;
    helpUsed: HelpUsage;
    started: boolean;
    logged: boolean;
}

const parseAnswer = (raw: string) => {
    const trimmed = raw.trim();
    // Eingaben wie "390.483,3" (deutscher Tausenderpunkt) korrekt behandeln
    const normalized = trimmed.includes(',')
        ? trimmed.replace(/\./g, '').replace(',', '.')
        : trimmed;
    return parseFloat(normalized.replace(/[−–—‐]/g, '-'));
};

// "390.483" ohne Komma kann Dezimal- oder Tausenderpunkt sein: beide Lesarten zulassen.
const matchesAnswer = (raw: string, expected: number) => {
    const value = parseAnswer(raw);
    if (!isNaN(value) && isWithinTolerance(value, expected)) return true;
    const trimmed = raw.trim();
    return /^-?\d{1,3}(\.\d{3})+$/.test(trimmed) && isWithinTolerance(parseFloat(trimmed.replace(/\./g, '')), expected);
};

const AnwendungsaufgabeSeite: React.FC<Props> = ({ title, image, imageAlt, tasks }) => {
    const [currentTask, setCurrentTask] = useState(0);
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [units, setUnits] = useState<Record<number, string>>({});
    const [feedback, setFeedback] = useState<Record<number, 'correct' | 'incorrect' | null>>({});
    const [showSolution, setShowSolution] = useState<Record<number, boolean>>({});
    const [wrongAttempt, setWrongAttempt] = useState<Record<number, boolean>>({});
    const [showHint, setShowHint] = useState<Record<number, boolean>>({});

    // Nachverfolgung je Teilaufgabe; angezeigte, aber nie gelöste Teilaufgaben werden
    // beim Verlassen der Seite als "nicht bearbeitet" bzw. "nicht gelöst" geloggt.
    const area = useRef(getAreaFromPath(window.location.pathname) ?? undefined);
    const track = useRef<Record<number, TrackState>>({});
    const getTrack = (i: number) => {
        if (!track.current[i]) {
            track.current[i] = { attempts: 0, firstTryCorrect: false, helpUsed: 'none', started: false, logged: false };
        }
        return track.current[i];
    };
    getTrack(currentTask);
    const topicOf = (i: number) => `${title}: Aufgabe ${i + 1}`;
    const logTask = (i: number, solved: boolean) => {
        const t = getTrack(i);
        if (t.logged) return;
        t.logged = true;
        logTrackingEntry({
            topic: topicOf(i),
            area: area.current,
            attempts: t.attempts,
            firstTryCorrect: t.firstTryCorrect,
            solved,
            helpUsed: t.helpUsed,
            started: t.started
        });
    };
    useFlushOnLeave(() => {
        Object.keys(track.current).forEach((key) => logTask(Number(key), false));
    });

    const task = tasks[currentTask];
    const currentAnswer = answers[currentTask] ?? '';
    const currentUnit = units[currentTask] ?? '';
    const currentFeedback = feedback[currentTask] ?? null;
    // Nach dem Prüfen: Zahl und Einheit einzeln grün/rot einfärben
    const parsedNow = parseAnswer(currentAnswer);
    const numberOk = currentFeedback === null ? null : matchesAnswer(currentAnswer, task.correctAnswer);
    const unitOk = currentFeedback === null || !currentUnit ? null : currentUnit === task.correctUnit;
    const currentShowSolution = showSolution[currentTask] ?? false;
    const currentWrongAttempt = wrongAttempt[currentTask] ?? false;
    const currentShowHint = showHint[currentTask] ?? false;

    const markInput = () => {
        const t = getTrack(currentTask);
        if (!t.logged) t.started = true;
    };

    const markHelp = () => {
        const t = getTrack(currentTask);
        if (t.attempts === 0) t.helpUsed = 'solution';
        else if (t.helpUsed === 'none') t.helpUsed = 'hint';
    };

    const handleAnswerChange = (value: string) => {
        setAnswers({ ...answers, [currentTask]: value });
        setFeedback({ ...feedback, [currentTask]: null });
        markInput();
    };

    const handleUnitChange = (value: string) => {
        setUnits({ ...units, [currentTask]: value });
        setFeedback({ ...feedback, [currentTask]: null });
        markInput();
    };

    const checkAnswer = () => {
        const value = parseAnswer(currentAnswer);
        if (isNaN(value) || !currentUnit) {
            setFeedback({ ...feedback, [currentTask]: 'incorrect' });
            return;
        }
        const isCorrect = matchesAnswer(currentAnswer, task.correctAnswer) && currentUnit === task.correctUnit;
        setFeedback({ ...feedback, [currentTask]: isCorrect ? 'correct' : 'incorrect' });
        if (!isCorrect) {
            setWrongAttempt({ ...wrongAttempt, [currentTask]: true });
        }
        const t = getTrack(currentTask);
        if (!t.logged) {
            t.attempts += 1;
            if (t.attempts === 1) t.firstTryCorrect = isCorrect;
            if (isCorrect) logTask(currentTask, true);
        }
    };

    const toggleHint = () => {
        if (!currentShowHint) markHelp();
        setShowHint({ ...showHint, [currentTask]: !currentShowHint });
    };

    const toggleSolution = () => {
        if (!currentShowSolution) markHelp();
        setShowSolution({ ...showSolution, [currentTask]: !currentShowSolution });
    };

    const goTo = (index: number) => {
        if (index < 0 || index >= tasks.length) return;
        setCurrentTask(index);
    };

    return (
        <TaskShell title={title} width="wide">
            <div className="mx-auto max-w-6xl">
                <Link to="/trigonometrie/anwendungsaufgaben" className="bk-btn bk-btn-ghost mb-3">
                    <i className="fa-solid fa-arrow-left"></i> Zurück zur Übersicht
                </Link>

                <div className="bk-panel p-6 space-y-6">
                    <div className="flex justify-center">
                        <img src={image} alt={imageAlt} className="w-full max-w-2xl border border-slate-200 rounded-lg" />
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
                        <h2 className="font-bold text-teal-700">Aufgabe {currentTask + 1}</h2>
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
                                    className={`w-36 px-3 py-2 border border-slate-300 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-teal-500 ${fieldCheckClass(numberOk)}`}
                                />
                                <select
                                    value={currentUnit}
                                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleUnitChange(e.target.value)}
                                    className={`px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 ${fieldCheckClass(unitOk)}`}
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
                                <button onClick={checkAnswer} className="bk-btn bk-btn-primary">
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
                                    <i className="fa-solid fa-circle-xmark"></i>
                                    {isNaN(parsedNow) || !currentUnit
                                        ? 'Bitte Ergebnis und Einheit angeben.'
                                        : 'Noch nicht richtig.'}
                                </p>
                            )}
                        </div>

                        <div className="flex flex-wrap justify-center gap-3">
                            <button onClick={toggleHint} className="bk-btn">
                                <i className="fa-solid fa-lightbulb mr-2"></i>
                                {currentShowHint ? 'Tipp verbergen' : 'Tipp anzeigen'}
                            </button>

                            {currentWrongAttempt && (
                                <button onClick={toggleSolution} className="bk-btn">
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
                                                <div className="my-2 overflow-x-auto">
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
        </TaskShell>
    );
};

export default AnwendungsaufgabeSeite;

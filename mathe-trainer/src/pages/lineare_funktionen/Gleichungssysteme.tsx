import React, { useEffect, useState } from 'react';
import { parseFlexibleNumber } from '../../utils/parseFlexibleNumber'
import { useTaskTracking } from '../../hooks/useTaskTracking'
import { Link, useSearchParams } from 'react-router-dom';
import TaskShell from '../../components/layout/TaskShell'

type Method = 'einsetzen' | 'gleichsetzen' | 'addieren';

interface SolutionStep {
    text: string;
}

interface Task {
    method: Method;
    systemLines: string[];
    question: string;
    steps: SolutionStep[];
    x: number;
    y: number;
    xLabel: string;
    yLabel: string;
}

const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const nonZero = () => pick([-3, -2, -1, 1, 2, 3]);
const nonZeroXY = () => {
    let v = randomInt(-6, 6);
    while (v === 0) v = randomInt(-6, 6);
    return v;
};

// Formatiert einen Term "coef * varName" mit korrektem Vorzeichen; isFirst = ohne führendes Vorzeichenleerzeichen
const term = (coef: number, varName: string, isFirst: boolean): string => {
    const abs = Math.abs(coef);
    const coefStr = abs === 1 ? '' : `${abs}`;
    if (isFirst) return `${coef < 0 ? '−' : ''}${coefStr}${varName}`;
    return coef < 0 ? ` − ${coefStr}${varName}` : ` + ${coefStr}${varName}`;
};

const eqString = (a: number, b: number, c: number, varX = 'x', varY = 'y'): string =>
    `${term(a, varX, true)}${term(b, varY, false)} = ${c}`;

const slopeForm = (m: number, t: number): string =>
    `y = ${term(m, 'x', true)}${t === 0 ? '' : t > 0 ? ` + ${t}` : ` − ${Math.abs(t)}`}`;

const signedNum = (n: number): string => (n < 0 ? `(−${Math.abs(n)})` : `${n}`);

// Stellt "coef * value" korrekt dar, z. B. für die Substitution eines Zahlenwerts in einen Term
const mulTerm = (coef: number, value: number): string => {
    if (coef === 1) return `${value < 0 ? `(${value})` : value}`;
    if (coef === -1) return `−(${value})`;
    return `${coef < 0 ? `−${Math.abs(coef)}` : coef} · (${value})`;
};

// Zeigt "y = m·x + t" als angehängten Term nach einem bereits eingesetzten x-Wert
const plusTerm = (t: number): string => (t === 0 ? '' : t > 0 ? ` + ${t}` : ` − ${Math.abs(t)}`);

// --- Einsetzungsverfahren ---

// Leicht: Gleichung I ist bereits nach y aufgelöst, nur Gleichung II ist einzusetzen.
const buildEinsetzenEasy = (): Task => {
    const x0 = nonZeroXY();
    const y0 = nonZeroXY();
    const m1 = nonZero();
    const t1 = y0 - m1 * x0;

    let a2 = nonZero();
    let b2 = nonZero();
    let tries = 0;
    while (a2 + b2 * m1 === 0 && tries < 30) {
        a2 = nonZero();
        b2 = nonZero();
        tries++;
    }
    const c2 = a2 * x0 + b2 * y0;

    const xCoeff = a2 + b2 * m1;
    const rhs = c2 - b2 * t1;

    const steps: SolutionStep[] = [
        { text: `Gleichung I ist bereits nach y aufgelöst: ${slopeForm(m1, t1)}` },
        { text: `Setze Gleichung I in Gleichung II ein: ${term(a2, 'x', true)} + ${signedNum(b2)} · (${slopeForm(m1, t1).replace('y = ', '')}) = ${c2}` },
        { text: `Klammer auflösen und zusammenfassen: ${term(xCoeff, 'x', true)} = ${rhs}` },
        { text: `Nach x auflösen: x = ${rhs} : ${xCoeff} = ${x0}` },
        { text: `x in Gleichung I einsetzen: y = ${mulTerm(m1, x0)}${plusTerm(t1)} = ${y0}` }
    ];

    return {
        method: 'einsetzen',
        systemLines: [`I:   ${slopeForm(m1, t1)}`, `II:  ${eqString(a2, b2, c2)}`],
        question: 'Löse das lineare Gleichungssystem mit dem Einsetzungsverfahren.',
        steps,
        x: x0,
        y: y0,
        xLabel: 'x',
        yLabel: 'y'
    };
};

// Schwer: Beide Gleichungen stehen in allgemeiner Form. Eine davon (mit y-Koeffizient ±1) muss
// zunächst selbst nach y aufgelöst werden, bevor eingesetzt werden kann.
const buildEinsetzenHard = (): Task => {
    const x0 = nonZeroXY();
    const y0 = nonZeroXY();

    const bA = pick([-1, 1]);
    const aA = nonZero();
    const cA = aA * x0 + bA * y0;
    const m1 = -aA * bA;
    const t1 = cA * bA;

    let aB = nonZero();
    let bB = nonZero();
    let tries = 0;
    while (aB + bB * m1 === 0 && tries < 30) {
        aB = nonZero();
        bB = nonZero();
        tries++;
    }
    const cB = aB * x0 + bB * y0;

    const xCoeff = aB + bB * m1;
    const rhs = cB - bB * t1;

    const isolateFirst = Math.random() < 0.5;
    const labelA = isolateFirst ? 'I' : 'II';
    const labelB = isolateFirst ? 'II' : 'I';
    const systemLines = isolateFirst
        ? [`I:   ${eqString(aA, bA, cA)}`, `II:  ${eqString(aB, bB, cB)}`]
        : [`I:   ${eqString(aB, bB, cB)}`, `II:  ${eqString(aA, bA, cA)}`];

    const steps: SolutionStep[] = [
        { text: `Gleichung ${labelA} ist noch nicht nach einer Variablen aufgelöst. Löse sie zunächst nach y auf: ${eqString(aA, bA, cA)}  ⇒  ${slopeForm(m1, t1)}` },
        { text: `Setze das Ergebnis in Gleichung ${labelB} ein: ${term(aB, 'x', true)} + ${signedNum(bB)} · (${slopeForm(m1, t1).replace('y = ', '')}) = ${cB}` },
        { text: `Klammer auflösen und zusammenfassen: ${term(xCoeff, 'x', true)} = ${rhs}` },
        { text: `Nach x auflösen: x = ${rhs} : ${xCoeff} = ${x0}` },
        { text: `x in Gleichung ${labelA} einsetzen: y = ${mulTerm(m1, x0)}${plusTerm(t1)} = ${y0}` }
    ];

    return {
        method: 'einsetzen',
        systemLines,
        question: 'Löse das lineare Gleichungssystem mit dem Einsetzungsverfahren.',
        steps,
        x: x0,
        y: y0,
        xLabel: 'x',
        yLabel: 'y'
    };
};

// --- Gleichsetzungsverfahren ---

// Leicht: Beide Gleichungen sind bereits nach y aufgelöst.
const buildGleichsetzenEasy = (): Task => {
    const x0 = nonZeroXY();
    const y0 = nonZeroXY();
    let m1 = nonZero();
    let m2 = nonZero();
    while (m1 === m2) m2 = nonZero();
    const t1 = y0 - m1 * x0;
    const t2 = y0 - m2 * x0;

    const xCoeff = m1 - m2;
    const rhs = t2 - t1;

    const steps: SolutionStep[] = [
        { text: 'Beide Gleichungen sind nach y aufgelöst. Gleichsetzen der rechten Seiten:' },
        { text: `${slopeForm(m1, t1).replace('y = ', '')} = ${slopeForm(m2, t2).replace('y = ', '')}` },
        { text: `x-Terme und Zahlen sortieren: ${term(xCoeff, 'x', true)} = ${rhs}` },
        { text: `Nach x auflösen: x = ${rhs} : ${xCoeff} = ${x0}` },
        { text: `x in Gleichung I einsetzen: y = ${mulTerm(m1, x0)}${plusTerm(t1)} = ${y0}` }
    ];

    return {
        method: 'gleichsetzen',
        systemLines: [`I:   ${slopeForm(m1, t1)}`, `II:  ${slopeForm(m2, t2)}`],
        question: 'Löse das lineare Gleichungssystem mit dem Gleichsetzungsverfahren.',
        steps,
        x: x0,
        y: y0,
        xLabel: 'x',
        yLabel: 'y'
    };
};

// Schwer: Beide Gleichungen stehen in allgemeiner Form (jeweils mit y-Koeffizient ±1) und müssen
// zunächst beide selbst nach y aufgelöst werden, bevor gleichgesetzt werden kann.
const buildGleichsetzenHard = (): Task => {
    const x0 = nonZeroXY();
    const y0 = nonZeroXY();

    const bA = pick([-1, 1]);
    const aA = nonZero();
    const cA = aA * x0 + bA * y0;
    const mA = -aA * bA;
    const tA = cA * bA;

    let bC = pick([-1, 1]);
    let aC = nonZero();
    let mC = -aC * bC;
    let tries = 0;
    while (mC === mA && tries < 30) {
        bC = pick([-1, 1]);
        aC = nonZero();
        mC = -aC * bC;
        tries++;
    }
    const cC = aC * x0 + bC * y0;
    const tC = cC * bC;

    const xCoeff = mA - mC;
    const rhs = tC - tA;

    const steps: SolutionStep[] = [
        { text: 'Beide Gleichungen sind noch nicht nach einer Variablen aufgelöst. Löse zunächst beide nach y auf:' },
        { text: `I:  ${eqString(aA, bA, cA)}  ⇒  ${slopeForm(mA, tA)}` },
        { text: `II: ${eqString(aC, bC, cC)}  ⇒  ${slopeForm(mC, tC)}` },
        { text: `Gleichsetzen der rechten Seiten: ${slopeForm(mA, tA).replace('y = ', '')} = ${slopeForm(mC, tC).replace('y = ', '')}` },
        { text: `x-Terme und Zahlen sortieren: ${term(xCoeff, 'x', true)} = ${rhs}` },
        { text: `Nach x auflösen: x = ${rhs} : ${xCoeff} = ${x0}` },
        { text: `x in Gleichung I einsetzen: y = ${mulTerm(mA, x0)}${plusTerm(tA)} = ${y0}` }
    ];

    return {
        method: 'gleichsetzen',
        systemLines: [`I:   ${eqString(aA, bA, cA)}`, `II:  ${eqString(aC, bC, cC)}`],
        question: 'Löse das lineare Gleichungssystem mit dem Gleichsetzungsverfahren.',
        steps,
        x: x0,
        y: y0,
        xLabel: 'x',
        yLabel: 'y'
    };
};

// --- Additionsverfahren ---

// Leicht: Die y-Koeffizienten sind bereits Gegenzahlen (b1 = -b2), es kann direkt addiert werden.
const buildAddierenEasy = (): Task => {
    const x0 = nonZeroXY();
    const y0 = nonZeroXY();

    const b1 = nonZero();
    const b2 = -b1;
    let a1 = nonZero();
    let a2 = nonZero();
    let tries = 0;
    while (a1 + a2 === 0 && tries < 30) {
        a1 = nonZero();
        a2 = nonZero();
        tries++;
    }
    const c1 = a1 * x0 + b1 * y0;
    const c2 = a2 * x0 + b2 * y0;

    const xCoeff = a1 + a2;
    const rhs = c1 + c2;
    const y = (c1 - a1 * x0) / b1;

    const steps: SolutionStep[] = [
        { text: 'Die y-Koeffizienten sind bereits Gegenzahlen (b₁ = −b₂) – du kannst die Gleichungen direkt addieren:' },
        { text: `I + II: ${term(xCoeff, 'x', true)} = ${rhs}` },
        { text: `Nach x auflösen: x = ${rhs} : ${xCoeff} = ${x0}` },
        { text: `x in Gleichung I einsetzen: ${mulTerm(a1, x0)}${term(b1, 'y', false)} = ${c1} → y = ${y}` }
    ];

    return {
        method: 'addieren',
        systemLines: [`I:   ${eqString(a1, b1, c1)}`, `II:  ${eqString(a2, b2, c2)}`],
        question: 'Löse das lineare Gleichungssystem mit dem Additionsverfahren.',
        steps,
        x: x0,
        y,
        xLabel: 'x',
        yLabel: 'y'
    };
};

// Schwer: Allgemeiner Fall – beide Gleichungen müssen mit unterschiedlichen Faktoren multipliziert
// werden, damit sich beim Addieren eine Variable aufhebt.
const buildAddierenHard = (): Task => {
    const x0 = nonZeroXY();
    const y0 = nonZeroXY();
    let a1 = nonZero();
    let b1 = nonZero();
    let a2 = nonZero();
    let b2 = nonZero();
    let tries = 0;
    while (a1 * b2 - a2 * b1 === 0 && tries < 30) {
        a1 = nonZero();
        b1 = nonZero();
        a2 = nonZero();
        b2 = nonZero();
        tries++;
    }
    const c1 = a1 * x0 + b1 * y0;
    const c2 = a2 * x0 + b2 * y0;

    const mult1 = b2;
    const mult2 = -b1;
    const xCoeff = a1 * mult1 + a2 * mult2;
    const rhs = c1 * mult1 + c2 * mult2;
    const x = rhs / xCoeff;
    const y = (c1 - a1 * x) / b1;

    const steps: SolutionStep[] = [
        {
            text: `Damit sich die y-Terme beim Addieren aufheben, wird Gleichung I mit ${signedNum(mult1)} und Gleichung II mit ${signedNum(mult2)} multipliziert:`
        },
        { text: `I':  ${eqString(a1 * mult1, b1 * mult1, c1 * mult1)}` },
        { text: `II': ${eqString(a2 * mult2, b2 * mult2, c2 * mult2)}` },
        { text: `Addition von I' und II': ${term(xCoeff, 'x', true)} = ${rhs}` },
        { text: `Nach x auflösen: x = ${rhs} : ${xCoeff} = ${x}` },
        { text: `x in Gleichung I einsetzen: ${mulTerm(a1, x)}${term(b1, 'y', false)} = ${c1} → y = ${y}` }
    ];

    return {
        method: 'addieren',
        systemLines: [`I:   ${eqString(a1, b1, c1)}`, `II:  ${eqString(a2, b2, c2)}`],
        question: 'Löse das lineare Gleichungssystem mit dem Additionsverfahren.',
        steps,
        x,
        y,
        xLabel: 'x',
        yLabel: 'y'
    };
};

const buildTask = (method: Method): Task => {
    const easy = Math.random() < 0.5;
    if (method === 'einsetzen') return easy ? buildEinsetzenEasy() : buildEinsetzenHard();
    if (method === 'gleichsetzen') return easy ? buildGleichsetzenEasy() : buildGleichsetzenHard();
    return easy ? buildAddierenEasy() : buildAddierenHard();
};

const METHOD_LABEL: Record<Method, string> = {
    einsetzen: 'Einsetzungsverfahren',
    gleichsetzen: 'Gleichsetzungsverfahren',
    addieren: 'Additionsverfahren'
};

// Startverfahren über die URL wählbar, z. B. ?verfahren=addieren
const isMethod = (v: string | null): v is Method => v === 'einsetzen' || v === 'gleichsetzen' || v === 'addieren';

const Gleichungssysteme: React.FC = () => {
    const [searchParams] = useSearchParams();
    const startMethod: Method = isMethod(searchParams.get('verfahren')) ? (searchParams.get('verfahren') as Method) : 'einsetzen';
    const [method, setMethod] = useState<Method>(startMethod);
    const [task, setTask] = useState<Task | null>(null);
    const [xInput, setXInput] = useState('');
    const [yInput, setYInput] = useState('');
    const [feedback, setFeedback] = useState<'correct' | 'incorrect' | 'info' | null>(null);
    const [showSolution, setShowSolution] = useState(false);
    // Ein Tracker pro Verfahren, damit der Eintrag das Thema des Verfahrens trägt.
    const trackers: Record<Method, ReturnType<typeof useTaskTracking>> = {
        einsetzen: useTaskTracking('Einsetzungsverfahren'),
        gleichsetzen: useTaskTracking('Gleichsetzungsverfahren'),
        addieren: useTaskTracking('Additionsverfahren')
    };

    const generateTask = (m: Method) => {
        Object.values(trackers).forEach(t => t.onTaskStart());
        setTask(buildTask(m));
        setXInput('');
        setYInput('');
        setFeedback(null);
        setShowSolution(false);
    };

    useEffect(() => {
        generateTask(startMethod);
    }, []);

    const chooseMethod = (m: Method) => {
        setMethod(m);
        generateTask(m);
    };

    const checkAnswer = () => {
        if (!task) return;
        const xVal = parseFlexibleNumber(xInput);
        const yVal = parseFlexibleNumber(yInput);
        if (isNaN(xVal) || isNaN(yVal)) {
            setFeedback('info');
            return;
        }
        const isCorrect = xVal === task.x && yVal === task.y;
        trackers[task.method].onCheck(isCorrect);
        setFeedback(isCorrect ? 'correct' : 'incorrect');
    };

    return (
        <TaskShell title="Lineare Gleichungssysteme" width="narrow">
            <div className="bk-panel space-y-6">
                <div>
                    <p className="text-ink text-left" style={{ maxWidth: '68ch' }}>
                        Übe die drei rechnerischen Lösungsverfahren für lineare Gleichungssysteme mit zwei
                        Unbekannten – Einsetzungs-, Gleichsetzungs- und Additionsverfahren. Die Aufgaben wechseln
                        zufällig zwischen einer leichteren Variante (Gleichung(en) bereits nach einer Variablen
                        aufgelöst) und einer schwereren Variante, bei der du zuerst selbst umformen musst. Das
                        grafische Lösungsverfahren (Schnittpunkt zweier Geraden) findest du unter{' '}
                        <Link to="/lineare_funktionen/schnittpunkt" className="text-[var(--accent)] hover:underline">
                            Schnittpunkt zweier Geraden
                        </Link>
                        .
                    </p>
                </div>

                <div className="bk-seg">
                    {(Object.keys(METHOD_LABEL) as Method[]).map(m => (
                        <button
                            key={m}
                            onClick={() => chooseMethod(m)}
                            className={`bk-seg-btn ${method === m ? 'bk-seg-btn-on' : ''}`}
                        >
                            {METHOD_LABEL[m]}
                        </button>
                    ))}
                </div>

                <div className="bg-sunken rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                        <h2 className="text-xl font-extrabold text-ink">{task ? METHOD_LABEL[task.method] : ''}</h2>
                        <button
                            onClick={() => generateTask(method)}
                            className="bk-btn"
                        >
                            Neue Aufgabe
                        </button>
                    </div>

                    {task && (
                        <div className="space-y-4">
                            <div className="bg-white border-2 border-edge rounded-xl p-4 space-y-1 font-display font-bold text-ink text-lg sm:text-xl">
                                {task.systemLines.map((line, idx) => (
                                    <p key={`sys-${idx}`}>{line}</p>
                                ))}
                            </div>

                            <div className="bk-taskbox">
                                <p className="font-medium text-ink">{task.question}</p>
                            </div>

                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <label className="font-display font-bold text-2xl text-ink">{task.xLabel} =</label>
                                    <input
                                        type="text"
                                        value={xInput}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setXInput(e.target.value)}
                                        className="bk-input w-28 text-center"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <label className="font-display font-bold text-2xl text-ink">{task.yLabel} =</label>
                                    <input
                                        type="text"
                                        value={yInput}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setYInput(e.target.value)}
                                        className="bk-input w-28 text-center"
                                    />
                                </div>
                            </div>

                            {feedback === 'info' && (
                                <p className="bk-feedback bk-feedback-info">
                                    Bitte gib für beide Größen eine Zahl ein.
                                </p>
                            )}
                            {feedback === 'correct' && (
                                <p className="bk-feedback bk-feedback-ok">
                                    Perfekt! Deine Lösung stimmt.
                                </p>
                            )}
                            {feedback === 'incorrect' && (
                                <p className="bk-feedback bk-feedback-no">
                                    Das passt noch nicht. Schau dir den Lösungsweg an.
                                </p>
                            )}

                            <div className="bk-actions">
                                <button
                                    onClick={checkAnswer}
                                    className="bk-btn bk-btn-primary"
                                >
                                    Prüfen
                                </button>
                                <button
                                    onClick={() => {
                                        if (!showSolution && task) trackers[task.method].onHintShown();
                                        setShowSolution(prev => !prev);
                                    }}
                                    className="bk-btn"
                                >
                                    {showSolution ? 'Lösung verbergen' : 'Lösung anzeigen'}
                                </button>
                            </div>

                            {showSolution && (
                                <div className="bk-solution space-y-3">
                                    <h3 className="bk-solution-title">Lösungsweg</h3>
                                    <ul className="list-decimal pl-5 text-ink space-y-2">
                                        {task.steps.map((step, index) => (
                                            <li key={`lgs-step-${index}`}>{step.text}</li>
                                        ))}
                                    </ul>
                                    <div className="bk-answer">
                                        Ergebnis: {task.xLabel} = {task.x}, {task.yLabel} = {task.y}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div>
                    <Link to="/lineare_funktionen" className="bk-btn bk-btn-ghost">
                        <i className="fa-solid fa-arrow-left" aria-hidden="true"></i>
                        Zurück zur Übersicht
                    </Link>
                </div>
            </div>
        </TaskShell>
    );
};

export default Gleichungssysteme;

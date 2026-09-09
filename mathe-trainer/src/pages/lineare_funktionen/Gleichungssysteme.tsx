import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

type Method = 'einsetzen' | 'gleichsetzen' | 'addieren' | 'sachaufgabe';

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

// --- Einsetzungsverfahren ---
const buildEinsetzen = (): Task => {
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
        { text: `x in Gleichung I einsetzen: y = ${mulTerm(m1, x0)}${t1 === 0 ? '' : t1 > 0 ? ` + ${t1}` : ` − ${Math.abs(t1)}`} = ${y0}` }
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

// --- Gleichsetzungsverfahren ---
const buildGleichsetzen = (): Task => {
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
        { text: `x in Gleichung I einsetzen: y = ${mulTerm(m1, x0)}${t1 === 0 ? '' : t1 > 0 ? ` + ${t1}` : ` − ${Math.abs(t1)}`} = ${y0}` }
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

// Generische Elimination (Additionsverfahren): a1x+b1y=c1, a2x+b2y=c2 -> eliminiert y
const solveElimination = (a1: number, b1: number, c1: number, a2: number, b2: number, c2: number) => {
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

    return { x, y, steps };
};

const buildAddieren = (): Task => {
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

    const { steps } = solveElimination(a1, b1, c1, a2, b2, c2);

    return {
        method: 'addieren',
        systemLines: [`I:   ${eqString(a1, b1, c1)}`, `II:  ${eqString(a2, b2, c2)}`],
        question: 'Löse das lineare Gleichungssystem mit dem Additionsverfahren.',
        steps,
        x: x0,
        y: y0,
        xLabel: 'x',
        yLabel: 'y'
    };
};

// --- Sachaufgaben ---
const buildSachZahlenraetsel = (): Task => {
    let x0 = randomInt(3, 15);
    let y0 = randomInt(3, 15);
    while (x0 === y0) y0 = randomInt(3, 15);
    const a1 = 1, b1 = 1, c1 = x0 + y0;
    const k = pick([2, 3]);
    const a2 = k, b2 = -1, c2 = k * x0 - y0;

    const { steps } = solveElimination(a1, b1, c1, a2, b2, c2);
    const introStep: SolutionStep = {
        text: `Aufstellen des Gleichungssystems: erste Zahl = x, zweite Zahl = y. I: x + y = ${c1}   II: ${k}x − y = ${c2}`
    };
    const resultStep: SolutionStep = { text: `Ergebnis im Sachzusammenhang: Die erste Zahl ist ${x0}, die zweite Zahl ist ${y0}.` };

    return {
        method: 'sachaufgabe',
        systemLines: [
            `Die Summe zweier Zahlen beträgt ${c1}.`,
            `Das ${k}-fache der ersten Zahl vermindert um die zweite Zahl ergibt ${c2}.`
        ],
        question: 'Bestimme die beiden Zahlen.',
        steps: [introStep, ...steps, resultStep],
        x: x0,
        y: y0,
        xLabel: 'erste Zahl',
        yLabel: 'zweite Zahl'
    };
};

const buildSachKinokarten = (): Task => {
    const x0 = randomInt(20, 80); // Erwachsene
    const y0 = randomInt(10, 60); // Kinder
    const pE = pick([9, 10, 11, 12]);
    const pK = pick([5, 6, 7]);
    const a1 = 1, b1 = 1, c1 = x0 + y0;
    const a2 = pE, b2 = pK, c2 = pE * x0 + pK * y0;

    const { steps } = solveElimination(a1, b1, c1, a2, b2, c2);
    const introStep: SolutionStep = {
        text: `Aufstellen des Gleichungssystems: Erwachsenenkarten = x, Kinderkarten = y. I: x + y = ${c1}   II: ${pE}x + ${pK}y = ${c2}`
    };
    const resultStep: SolutionStep = {
        text: `Ergebnis im Sachzusammenhang: Es wurden ${x0} Erwachsenenkarten und ${y0} Kinderkarten verkauft.`
    };

    return {
        method: 'sachaufgabe',
        systemLines: [
            `Bei einem Kinobesuch wurden insgesamt ${c1} Karten verkauft.`,
            `Eine Erwachsenenkarte kostet ${pE} €, eine Kinderkarte ${pK} €. Insgesamt wurden ${c2} € eingenommen.`
        ],
        question: 'Wie viele Erwachsenen- und Kinderkarten wurden verkauft?',
        steps: [introStep, ...steps, resultStep],
        x: x0,
        y: y0,
        xLabel: 'Erwachsenenkarten',
        yLabel: 'Kinderkarten'
    };
};

const buildSachRechteck = (): Task => {
    const y0 = randomInt(4, 15); // Breite
    const x0 = y0 + randomInt(2, 10); // Länge
    const halfUmfang = x0 + y0;
    const umfang = 2 * halfUmfang;
    const a1 = 1, b1 = 1, c1 = halfUmfang;
    const a2 = 1, b2 = -1, c2 = x0 - y0;

    const { steps } = solveElimination(a1, b1, c1, a2, b2, c2);
    const introStep: SolutionStep = {
        text: `Aufstellen des Gleichungssystems: Länge = x, Breite = y. Aus U = 2·(x+y) folgt x + y = ${halfUmfang}. I: x + y = ${halfUmfang}   II: x − y = ${c2}`
    };
    const resultStep: SolutionStep = {
        text: `Ergebnis im Sachzusammenhang: Die Länge beträgt ${x0} cm, die Breite ${y0} cm.`
    };

    return {
        method: 'sachaufgabe',
        systemLines: [`Ein Rechteck hat einen Umfang von ${umfang} cm.`, `Die Länge ist um ${c2} cm größer als die Breite.`],
        question: 'Berechne Länge und Breite.',
        steps: [introStep, ...steps, resultStep],
        x: x0,
        y: y0,
        xLabel: 'Länge',
        yLabel: 'Breite'
    };
};

const SACH_BUILDERS = [buildSachZahlenraetsel, buildSachKinokarten, buildSachRechteck];

const buildTask = (method: Method): Task => {
    if (method === 'einsetzen') return buildEinsetzen();
    if (method === 'gleichsetzen') return buildGleichsetzen();
    if (method === 'addieren') return buildAddieren();
    return pick(SACH_BUILDERS)();
};

const METHOD_LABEL: Record<Method, string> = {
    einsetzen: 'Einsetzungsverfahren',
    gleichsetzen: 'Gleichsetzungsverfahren',
    addieren: 'Additionsverfahren',
    sachaufgabe: 'Sachaufgabe'
};

const Gleichungssysteme: React.FC = () => {
    const [method, setMethod] = useState<Method>('einsetzen');
    const [task, setTask] = useState<Task | null>(null);
    const [xInput, setXInput] = useState('');
    const [yInput, setYInput] = useState('');
    const [feedback, setFeedback] = useState<'correct' | 'incorrect' | 'info' | null>(null);
    const [showSolution, setShowSolution] = useState(false);

    const generateTask = (m: Method) => {
        setTask(buildTask(m));
        setXInput('');
        setYInput('');
        setFeedback(null);
        setShowSolution(false);
    };

    useEffect(() => {
        generateTask('einsetzen');
    }, []);

    const chooseMethod = (m: Method) => {
        setMethod(m);
        generateTask(m);
    };

    const checkAnswer = () => {
        if (!task) return;
        const xVal = parseFloat(xInput.replace(',', '.'));
        const yVal = parseFloat(yInput.replace(',', '.'));
        if (isNaN(xVal) || isNaN(yVal)) {
            setFeedback('info');
            return;
        }
        setFeedback(xVal === task.x && yVal === task.y ? 'correct' : 'incorrect');
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-teal-800 mb-4">Lineare Gleichungssysteme</h1>
                    <p className="text-gray-700 max-w-2xl mx-auto">
                        Übe die drei rechnerischen Lösungsverfahren für lineare Gleichungssysteme mit zwei
                        Unbekannten – Einsetzungs-, Gleichsetzungs- und Additionsverfahren – sowie sachbezogene
                        Anwendungsaufgaben. Das grafische Lösungsverfahren (Schnittpunkt zweier Geraden) findest du
                        unter{' '}
                        <Link to="/lineare_funktionen/schnittpunkt" className="text-[var(--accent)] hover:underline">
                            Schnittpunkt zweier Geraden
                        </Link>
                        .
                    </p>
                </div>

                <div className="flex flex-wrap gap-2 justify-center">
                    {(Object.keys(METHOD_LABEL) as Method[]).map(m => (
                        <button
                            key={m}
                            onClick={() => chooseMethod(m)}
                            className={`px-4 py-2 rounded-lg font-medium border transition-colors ${
                                method === m
                                    ? 'bg-teal-600 text-white border-teal-600'
                                    : 'bg-white text-gray-800 border-gray-300 hover:border-teal-400'
                            }`}
                        >
                            {METHOD_LABEL[m]}
                        </button>
                    ))}
                </div>

                <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                    <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                        <h2 className="text-xl font-semibold text-gray-800">{task ? METHOD_LABEL[task.method] : ''}</h2>
                        <button
                            onClick={() => generateTask(method)}
                            className="px-4 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700"
                        >
                            Neue Aufgabe
                        </button>
                    </div>

                    {task && (
                        <div className="space-y-4">
                            <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-1 font-mono text-gray-800 text-sm sm:text-base">
                                {task.systemLines.map((line, idx) => (
                                    <p key={`sys-${idx}`}>{line}</p>
                                ))}
                            </div>

                            <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
                                <p className="font-medium text-gray-800">{task.question}</p>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <div className="flex items-center gap-2">
                                    <label className="font-semibold text-gray-700">{task.xLabel} =</label>
                                    <input
                                        type="text"
                                        value={xInput}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setXInput(e.target.value)}
                                        className="w-24 border border-gray-300 rounded-lg px-3 py-2 text-center"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <label className="font-semibold text-gray-700">{task.yLabel} =</label>
                                    <input
                                        type="text"
                                        value={yInput}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setYInput(e.target.value)}
                                        className="w-24 border border-gray-300 rounded-lg px-3 py-2 text-center"
                                    />
                                </div>
                            </div>

                            {feedback === 'info' && (
                                <p className="text-yellow-700 bg-yellow-100 border border-yellow-200 rounded-lg p-3 text-sm text-center max-w-md mx-auto">
                                    Bitte gib für beide Größen eine Zahl ein.
                                </p>
                            )}
                            {feedback === 'correct' && (
                                <p className="text-green-700 bg-green-100 border border-green-200 rounded-lg p-3 text-sm text-center max-w-md mx-auto">
                                    Perfekt! Deine Lösung stimmt.
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
                                            <li key={`lgs-step-${index}`}>{step.text}</li>
                                        ))}
                                    </ul>
                                    <div className="font-bold text-gray-900">
                                        Ergebnis: {task.xLabel} = {task.x}, {task.yLabel} = {task.y}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex justify-center">
                    <Link to="/lineare_funktionen" className="text-[var(--accent)] hover:underline text-sm sm:text-base">
                        <i className="fa-solid fa-arrow-left mr-2"></i>
                        Zurück zur Übersicht
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Gleichungssysteme;

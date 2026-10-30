import React, { useEffect, useState } from 'react';
import { parseFlexibleNumber } from '../../utils/parseFlexibleNumber'
import { useTaskTracking } from '../../hooks/useTaskTracking'
import { Link, useSearchParams } from 'react-router-dom';
import TaskShell from '../../components/layout/TaskShell'
import { fieldCheckClass } from '../../utils/fieldCheck';
import './gleichungssysteme.css';

type Method = 'einsetzen' | 'gleichsetzen' | 'addieren';

/** Eine Zeile im LGS-Block: Name der Gleichung (I, II, III …), Gleichung, Umformung (z. B. „| :2“), Hinweis, Strich darunter */
interface Zeile {
    label?: string;
    eq: string;
    op?: string;
    note?: string;
    strich?: boolean;
}

/** Ein Schritt des Lösungswegs: Erklärung links, Gleichungen rechts (wie im Heft) */
interface SolutionStep {
    text: string;
    zeilen: Zeile[];
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

/** Zahl mit echtem Minuszeichen */
const num = (n: number): string => (n < 0 ? `−${Math.abs(n)}` : `${n}`);

// Formatiert einen Term "coef * varName" mit korrektem Vorzeichen; isFirst = ohne führendes Vorzeichenleerzeichen
const term = (coef: number, varName: string, isFirst: boolean): string => {
    const abs = Math.abs(coef);
    const coefStr = abs === 1 ? '' : `${abs}`;
    if (isFirst) return `${coef < 0 ? '−' : ''}${coefStr}${varName}`;
    return coef < 0 ? ` − ${coefStr}${varName}` : ` + ${coefStr}${varName}`;
};

const eqString = (a: number, b: number, c: number, varX = 'x', varY = 'y'): string =>
    `${term(a, varX, true)}${term(b, varY, false)} = ${num(c)}`;

// Zeigt "+ t" bzw. "− t" als angehängten Summanden
const plusTerm = (t: number): string => (t === 0 ? '' : t > 0 ? ` + ${t}` : ` − ${Math.abs(t)}`);

const mxt = (m: number, t: number): string => `${term(m, 'x', true)}${plusTerm(t)}`;
const slopeForm = (m: number, t: number): string => `y = ${mxt(m, t)}`;

const signedNum = (n: number): string => (n < 0 ? `(−${Math.abs(n)})` : `${n}`);

// Stellt "coef * value" korrekt dar, z. B. für die Substitution eines Zahlenwerts in einen Term
const mulTerm = (coef: number, value: number): string => {
    const v = value < 0 ? `(${num(value)})` : `${value}`;
    if (coef === 1) return v;
    if (coef === -1) return `−${value < 0 ? v : `(${value})`}`;
    return `${num(coef)} · ${v}`;
};

/** Umformung, die den Summanden k (mit Variable v) von der linken Seite entfernt, z. B. „| − 4“ oder „| + 2x“ */
const opWeg = (k: number, v = ''): string => `| ${k > 0 ? '−' : '+'} ${Math.abs(k) === 1 && v ? '' : Math.abs(k)}${v}`;
/** Umformung, damit vor der Variablen 1 steht */
const opDurch = (k: number): string | undefined => (k === 1 ? undefined : k === -1 ? '| · (−1)' : `| : ${signedNum(k)}`);

/** Löst „coef·v + konst = rhs“ Zeile für Zeile nach v auf (erste Zeile ist die Gleichung selbst) */
const loese = (coef: number, konst: number, rhs: number, v: string, wert: number, label?: string, note?: string): Zeile[] => {
    const zeilen: Zeile[] = [];
    if (konst !== 0) zeilen.push({ label, note, eq: `${term(coef, v, true)}${plusTerm(konst)} = ${num(rhs)}`, op: opWeg(konst) });
    if (coef !== 1) zeilen.push({ label: zeilen.length ? undefined : label, note: zeilen.length ? undefined : note, eq: `${term(coef, v, true)} = ${num(rhs - konst)}`, op: opDurch(coef) });
    zeilen.push({ label: zeilen.length ? undefined : label, note: zeilen.length ? undefined : note, eq: `${v} = ${num(wert)}` });
    zeilen[zeilen.length - 1].eq = `⇒ ${zeilen[zeilen.length - 1].eq}`;
    return zeilen;
};

/** x-Wert in „a·x + b·y = c“ einsetzen und nach y auflösen */
const xEinsetzen = (a: number, b: number, c: number, x: number, y: number, label: string): Zeile[] => {
    const zeilen: Zeile[] = [{ label, eq: `${mulTerm(a, x)}${term(b, 'y', false)} = ${num(c)}` }];
    if (a * x !== 0) zeilen.push({ eq: `${num(a * x)}${term(b, 'y', false)} = ${num(c)}`, op: opWeg(a * x) });
    return [...zeilen, ...loese(b, 0, c - a * x, 'y', y)];
};

/** „a·x + b·y = c“ nach y auflösen (b = ±1) */
const nachYAufloesen = (a: number, b: number, c: number, label: string): Zeile[] => {
    const zeilen: Zeile[] = [{ label, eq: eqString(a, b, c), op: opWeg(a, 'x') }];
    if (b === -1) zeilen.push({ eq: `−y = ${mxt(-a, c)}`, op: opDurch(-1) });
    zeilen.push({ eq: `⇒ ${slopeForm(-a * b, c * b)}` });
    return zeilen;
};

/** Gleichungssystem untereinander, Strich nach der zweiten Gleichung */
const untereinander = (eqI: string, eqII: string): SolutionStep => ({
    text: 'Schreibe die beiden Gleichungen exakt untereinander und ziehe darunter einen Strich.',
    zeilen: [
        { label: 'I:', eq: eqI },
        { label: 'II:', eq: eqII, strich: true },
    ],
});

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
        untereinander(slopeForm(m1, t1), eqString(a2, b2, c2)),
        {
            text: 'Gleichung I ist schon nach y aufgelöst. Setze den Term für y aus I in Gleichung II ein (Klammer nicht vergessen), löse die Klammer auf, fasse zusammen und löse nach x auf.',
            zeilen: [
                { label: 'I in II:', eq: `${term(a2, 'x', true)} + ${signedNum(b2)} · (${mxt(m1, t1)}) = ${num(c2)}` },
                { eq: `${term(a2, 'x', true)}${term(b2 * m1, 'x', false)}${plusTerm(b2 * t1)} = ${num(c2)}` },
                ...loese(xCoeff, b2 * t1, c2, 'x', x0),
            ],
        },
        {
            text: `Setze x = ${num(x0)} in Gleichung I ein und berechne y.`,
            zeilen: [{ label: 'x in I:', eq: `y = ${mulTerm(m1, x0)}${plusTerm(t1)}` }, { eq: `⇒ y = ${num(y0)}` }],
        },
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
        untereinander(systemLines[0].replace(/^I:\s*/, ''), systemLines[1].replace(/^II:\s*/, '')),
        {
            text: `Gleichung ${labelA} ist noch nicht nach einer Variablen aufgelöst. Löse sie zuerst nach y auf.`,
            zeilen: nachYAufloesen(aA, bA, cA, `${labelA}:`),
        },
        {
            text: `Setze den Term für y in Gleichung ${labelB} ein (Klammer nicht vergessen), löse die Klammer auf, fasse zusammen und löse nach x auf.`,
            zeilen: [
                { label: `${labelA} in ${labelB}:`, eq: `${term(aB, 'x', true)} + ${signedNum(bB)} · (${mxt(m1, t1)}) = ${num(cB)}` },
                { eq: `${term(aB, 'x', true)}${term(bB * m1, 'x', false)}${plusTerm(bB * t1)} = ${num(cB)}` },
                ...loese(xCoeff, bB * t1, cB, 'x', x0),
            ],
        },
        {
            text: `Setze x = ${num(x0)} in die nach y aufgelöste Gleichung ${labelA} ein und berechne y.`,
            zeilen: [{ label: `x in ${labelA}:`, eq: `y = ${mulTerm(m1, x0)}${plusTerm(t1)}` }, { eq: `⇒ y = ${num(y0)}` }],
        },
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
        untereinander(slopeForm(m1, t1), slopeForm(m2, t2)),
        {
            text: 'Beide Gleichungen sind nach y aufgelöst. Setze die rechten Seiten gleich, bringe alle x auf die linke Seite und löse nach x auf.',
            zeilen: [
                { label: 'I = II:', eq: `${mxt(m1, t1)} = ${mxt(m2, t2)}`, op: opWeg(m2, 'x') },
                ...loese(xCoeff, t1, t2, 'x', x0),
            ],
        },
        {
            text: `Setze x = ${num(x0)} in Gleichung I ein und berechne y.`,
            zeilen: [{ label: 'x in I:', eq: `y = ${mulTerm(m1, x0)}${plusTerm(t1)}` }, { eq: `⇒ y = ${num(y0)}` }],
        },
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
        untereinander(eqString(aA, bA, cA), eqString(aC, bC, cC)),
        {
            text: 'Beide Gleichungen sind noch nicht nach y aufgelöst. Löse zuerst beide nach y auf.',
            zeilen: [...nachYAufloesen(aA, bA, cA, 'I:'), ...nachYAufloesen(aC, bC, cC, 'II:')],
        },
        {
            text: 'Setze die rechten Seiten gleich, bringe alle x auf die linke Seite und löse nach x auf.',
            zeilen: [
                { label: 'I = II:', eq: `${mxt(mA, tA)} = ${mxt(mC, tC)}`, op: opWeg(mC, 'x') },
                ...loese(xCoeff, tA, tC, 'x', x0),
            ],
        },
        {
            text: `Setze x = ${num(x0)} in die nach y aufgelöste Gleichung I ein und berechne y.`,
            zeilen: [{ label: 'x in I:', eq: `y = ${mulTerm(mA, x0)}${plusTerm(tA)}` }, { eq: `⇒ y = ${num(y0)}` }],
        },
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

// --- Additions- und Subtraktionsverfahren ---

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
        untereinander(eqString(a1, b1, c1), eqString(a2, b2, c2)),
        {
            text: `Vor y stehen schon Gegenzahlen (${num(b1)} und ${num(b2)}). Addiere die beiden Gleichungen Seite für Seite (I + II), dann fällt y weg. So entsteht Gleichung III.`,
            zeilen: [
                { label: 'I:', eq: eqString(a1, b1, c1) },
                { label: 'II:', eq: eqString(a2, b2, c2), strich: true },
                { label: 'III:', eq: `${term(xCoeff, 'x', true)} = ${num(rhs)}`, note: '(I + II)' },
            ],
        },
        {
            text: 'Löse Gleichung III wie gewohnt mit Äquivalenzumformungen nach x auf.',
            zeilen: loese(xCoeff, 0, rhs, 'x', x0, 'III:'),
        },
        {
            text: `Setze x = ${num(x0)} in Gleichung I ein und löse nach y auf.`,
            zeilen: xEinsetzen(a1, b1, c1, x0, y, 'x in I:'),
        },
    ];

    return {
        method: 'addieren',
        systemLines: [`I:   ${eqString(a1, b1, c1)}`, `II:  ${eqString(a2, b2, c2)}`],
        question: 'Löse das lineare Gleichungssystem mit dem Additions- und Subtraktionsverfahren.',
        steps,
        x: x0,
        y,
        xLabel: 'x',
        yLabel: 'y'
    };
};

// Schwer: Allgemeiner Fall – eine oder beide Gleichungen müssen erst multipliziert werden, damit vor y dieselbe Zahl steht;
// danach wird subtrahiert (gleiches Vorzeichen) oder addiert (Gegenzahlen).
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

    // Kleinste positive Faktoren, damit vor y dieselbe Zahl steht (bis aufs Vorzeichen):
    // gleiches Vorzeichen → subtrahieren, Gegenzahlen → addieren
    const ggt = (p: number, q: number): number => (q === 0 ? p : ggt(q, p % q));
    const g = ggt(Math.abs(b1), Math.abs(b2));
    const mult1 = Math.abs(b2) / g;
    const mult2 = Math.abs(b1) / g;
    const B1 = b1 * mult1;
    const B2 = b2 * mult2;
    const minus = B1 === B2;
    const xCoeff = minus ? a1 * mult1 - a2 * mult2 : a1 * mult1 + a2 * mult2;
    const rhs = minus ? c1 * mult1 - c2 * mult2 : c1 * mult1 + c2 * mult2;
    const x = rhs / xCoeff;
    const y = (c1 - a1 * x) / b1;

    // Mit Faktor 1 bleibt eine Gleichung, wie sie ist; sonst entsteht eine neue Gleichung (III, IV …)
    const neu: Zeile[] = [];
    let nr = 3;
    const roemisch = ['', 'I', 'II', 'III', 'IV', 'V'];
    const gleichung = (alt: string, f: number, a: number, b: number, c: number) => {
        if (f === 1) return { label: `${alt}:`, eq: eqString(a, b, c) };
        return { label: `${roemisch[nr++]}:`, eq: eqString(a * f, b * f, c * f), note: `(${alt} · ${f})` };
    };
    neu.push(gleichung('I', mult1, a1, b1, c1));
    neu.push({ ...gleichung('II', mult2, a2, b2, c2), strich: true });
    const summe = `${roemisch[nr]}:`;
    const nameA = neu[0].label?.replace(':', '');
    const nameB = neu[1].label?.replace(':', '');
    const multText = [mult1 === 1 ? '' : `Gleichung I mit ${mult1}`, mult2 === 1 ? '' : `Gleichung II mit ${mult2}`].filter(Boolean).join(' und ');

    const steps: SolutionStep[] = [
        untereinander(eqString(a1, b1, c1), eqString(a2, b2, c2)),
        ...(mult1 === 1 && mult2 === 1
            ? []
            : [
                  {
                      text: `Ziel ist es, vor einer der beiden Variablen (hier: y) dieselbe Zahl zu erhalten. Multipliziere dazu ${multText}, jeweils beide Seiten.`,
                      zeilen: [
                          { label: 'I:', eq: eqString(a1, b1, c1), op: mult1 === 1 ? undefined : `| · ${mult1}` },
                          { label: 'II:', eq: eqString(a2, b2, c2), op: mult2 === 1 ? undefined : `| · ${mult2}`, strich: true },
                          ...neu,
                      ],
                  },
              ]),
        {
            text: minus
                ? `Vor y steht jetzt dieselbe Zahl (${num(B1)}) mit demselben Vorzeichen. Subtrahiere die Gleichungen Seite für Seite (${nameA} − ${nameB}), dann fällt y weg.`
                : `Vor y stehen jetzt Gegenzahlen (${num(B1)} und ${num(B2)}). Addiere die Gleichungen Seite für Seite (${nameA} + ${nameB}), dann fällt y weg.`,
            zeilen: [...neu, { label: summe, eq: `${term(xCoeff, 'x', true)} = ${num(rhs)}`, note: `(${nameA} ${minus ? '−' : '+'} ${nameB})` }],
        },
        {
            text: `Löse Gleichung ${summe.replace(':', '')} wie gewohnt mit Äquivalenzumformungen nach x auf.`,
            zeilen: loese(xCoeff, 0, rhs, 'x', x, summe),
        },
        {
            text: `Setze x = ${num(x)} in Gleichung I ein und löse nach y auf.`,
            zeilen: xEinsetzen(a1, b1, c1, x, y, 'x in I:'),
        },
    ];

    return {
        method: 'addieren',
        systemLines: [`I:   ${eqString(a1, b1, c1)}`, `II:  ${eqString(a2, b2, c2)}`],
        question: 'Löse das lineare Gleichungssystem mit dem Additions- und Subtraktionsverfahren.',
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
    addieren: 'Additions-/Subtraktionsverfahren'
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
    const [fieldOk, setFieldOk] = useState<{ x?: boolean; y?: boolean }>({});
    const [showSolution, setShowSolution] = useState(false);
    // Ein Tracker pro Verfahren, damit der Eintrag das Thema des Verfahrens trägt.
    const trackers: Record<Method, ReturnType<typeof useTaskTracking>> = {
        einsetzen: useTaskTracking('Einsetzungsverfahren'),
        gleichsetzen: useTaskTracking('Gleichsetzungsverfahren'),
        addieren: useTaskTracking('Additions- und Subtraktionsverfahren')
    };

    const generateTask = (m: Method) => {
        Object.values(trackers).forEach(t => t.onTaskStart());
        setTask(buildTask(m));
        setXInput('');
        setYInput('');
        setFeedback(null);
        setFieldOk({});
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
        setFieldOk({ x: xVal === task.x, y: yVal === task.y });
    };

    return (
        <TaskShell title="Lineare Gleichungssysteme" width="narrow">
            <div className="bk-panel space-y-6">
                <div>
                    <p className="text-ink text-left" style={{ maxWidth: '68ch' }}>
                        Übe die drei rechnerischen Lösungsverfahren für lineare Gleichungssysteme mit zwei
                        Unbekannten – Einsetzungs-, Gleichsetzungs- sowie Additions- und Subtraktionsverfahren. Die Aufgaben wechseln
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
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setXInput(e.target.value); setFieldOk(f => ({ ...f, x: undefined })); }}
                                        className={`bk-input w-28 text-center ${fieldCheckClass(fieldOk.x)}`}
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <label className="font-display font-bold text-2xl text-ink">{task.yLabel} =</label>
                                    <input
                                        type="text"
                                        value={yInput}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setYInput(e.target.value); setFieldOk(f => ({ ...f, y: undefined })); }}
                                        className={`bk-input w-28 text-center ${fieldCheckClass(fieldOk.y)}`}
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
                                    <div className="lgs-weg">
                                        {task.steps.map((step, index) => (
                                            <div key={`lgs-step-${index}`} className="lgs-schritt">
                                                <p className="lgs-text">
                                                    <strong>{index + 1}.</strong> {step.text}
                                                </p>
                                                <div className="lgs-zeilen">
                                                    {step.zeilen.map((z, i) => (
                                                        <div key={i} className="lgs-zeile">
                                                            <span className={`lgs-label${z.strich ? ' lgs-strich' : ''}`}>{z.label}</span>
                                                            <span className={`lgs-eq${z.strich ? ' lgs-strich' : ''}`}>{z.eq}</span>
                                                            <span className="lgs-op">{z.op}</span>
                                                            <span className="lgs-note">{z.note}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="bk-answer">
                                        Ergebnis: {task.xLabel} = {num(task.x)}, {task.yLabel} = {num(task.y)}
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

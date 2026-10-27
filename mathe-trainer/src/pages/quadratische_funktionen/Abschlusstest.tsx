import React, { useState } from 'react';
import { Check, X, ArrowRight, RotateCcw, Play } from 'lucide-react';
import TaskShell from '../../components/layout/TaskShell';
import GleichungEingabe from '../../components/GleichungEingabe';
import ParabelGraph from '../../components/ParabelGraph';
import { checkQuadraticEquation } from '../../utils/parseFunctionEquation';
import { fieldCheckClass } from '../../utils/fieldCheck';
import { MitternachtsFullSteps, PRAISE, Steps, Tex, isIncomplete, parseAnswer, pick, q, randomInt, round2, tn } from './quadratischShared';

// --- LaTeX-Hilfen für Dezimalzahlen (a kann 0,5 sein) ---
const tnp = (n: number) => (n < 0 ? `(${tn(n)})` : tn(n));
const sg = (n: number) => (n < 0 ? `- ${tn(-n)}` : `+ ${tn(n)}`);
const coef = (n: number) => (n === 1 ? '' : n === -1 ? '-' : tn(n));
/** ax² + bx + c ohne „y =“, Summanden mit 0 entfallen */
const poly = (a: number, b: number, c: number) => {
    const teile: string[] = [];
    if (a !== 0) teile.push(`${coef(a)}x^2`);
    if (b !== 0) teile.push(teile.length ? `${b < 0 ? '-' : '+'} ${coef(Math.abs(b))}x` : `${coef(b)}x`);
    if (c !== 0 || teile.length === 0) teile.push(teile.length ? sg(c) : tn(c));
    return teile.join(' ');
};
const klammer = (xs: number) => (xs === 0 ? 'x^2' : `(x ${xs < 0 ? '+' : '-'} ${tn(Math.abs(xs))})^2`);
/** a(x − x_S)² + y_S ohne „y =“ */
const scheitelform = (a: number, xs: number, ys: number) => `${coef(a)}${klammer(xs)}${ys !== 0 ? ` ${sg(ys)}` : ''}`;
/** k·b als LaTeX, z. B. „b“, „-b“, „3b“ */
const bTerm = (k: number) => (k === 1 ? 'b' : k === -1 ? '-b' : `${tn(k)}b`);
/** „| − 3“ bzw. „| + 3“, um n auf die andere Seite zu bringen */
const wegMit = (n: number) => (n < 0 ? `+ ${tn(-n)}` : `- ${tn(n)}`);
const nahe = (u: number, s: number) => Number.isFinite(u) && Math.abs(u - s) < 0.01;

// --- Typen ---
type QuestionType =
    | 'graph_properties'
    | 'read_vertex'
    | 'vertex_form_graph'
    | 'convert_to_general'
    | 'calc_vertex'
    | 'calc_nullstellen'
    | 'vertex_form_from_points'
    | 'general_form_from_points';

type Format = 'mc_properties' | 'vertex' | 'nullstellen' | 'general_form' | 'vertex_form';

interface Antwort {
    xs: string;
    ys: string;
    n1: string;
    n2: string;
    isNone: boolean;
    gleichung: string;
    stretch: string | null;
    opening: string | null;
}

const LEER: Antwort = { xs: '', ys: '', n1: '', n2: '', isNone: false, gleichung: '', stretch: null, opening: null };

interface Question {
    type: QuestionType;
    format: Format;
    text: React.ReactNode;
    /** Gegebene Gleichung oder Punkte als LaTeX */
    tex?: string;
    /** Parabel, die als Graph angezeigt wird */
    graph?: { a: number; xs: number; ys: number; zeigeScheitel: boolean };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    answer: any;
    points: number;
    loesung: React.ReactNode;
    userAnswer?: Antwort;
}

/** Ergebnis je Feld: true = richtig, false = falsch */
type Bewertung = { felder: Record<string, boolean>; punkte: number; hinweis?: string };

const ORDER: QuestionType[] = [
    'graph_properties',
    'read_vertex',
    'vertex_form_graph',
    'convert_to_general',
    'calc_vertex',
    'calc_nullstellen',
    'vertex_form_from_points',
    'general_form_from_points',
];

const GRAPH_HINWEIS = (
    <p className="text-sm text-gray-500 mt-1">
        Tipp: Du kannst das Koordinatensystem mit der Maus bzw. dem Finger verschieben und vergrößern.
    </p>
);

// --- Aufgaben-Generatoren ---

const createGraphPropertiesQuestion = (): Question => {
    const a = pick([-3, -2, -1.5, -0.5, -0.25, 0.25, 0.5, 1.5, 2, 3]);
    const stretch = Math.abs(a) > 1 ? 'gestreckt' : 'gestaucht';
    const opening = a > 0 ? 'oben' : 'unten';
    // Bei |a| < 1 zwei Kästchen nach rechts, damit man auf einem Gitterpunkt landet
    const dx = Math.abs(a) < 1 ? 2 : 1;
    const dy = Math.abs(a) * dx * dx;
    return {
        type: 'graph_properties',
        format: 'mc_properties',
        text: (
            <>
                <p>
                    Abgebildet ist der Graph einer Funktion der Form <Tex tex="y = ax^2" />. Ist die Parabel im Vergleich zur Normalparabel{' '}
                    <Tex tex="y = x^2" /> gestreckt oder gestaucht? Ist sie nach oben oder nach unten geöffnet?
                </p>
                {GRAPH_HINWEIS}
            </>
        ),
        graph: { a, xs: 0, ys: 0, zeigeScheitel: true },
        answer: { stretch, opening },
        points: 2,
        loesung: (
            <>
                <p>
                    Vom Scheitelpunkt <Tex tex="S(0|0)" /> geht man <strong>{dx} Kästchen nach rechts</strong> und dann{' '}
                    <strong>{tn(dy)} Kästchen nach {a > 0 ? 'oben' : 'unten'}</strong>, um wieder auf die Parabel zu kommen:
                </p>
                <Tex display tex={`a = ${a > 0 ? '' : '-'}\\frac{${tn(dy)}}{${dx}^2} = ${tn(a)}`} />
                <p>
                    <Tex tex={`|a| = ${tn(Math.abs(a))} ${Math.abs(a) > 1 ? '> 1' : '< 1'}`} />: Die Parabel ist <strong>{stretch}</strong>{' '}
                    {stretch === 'gestreckt' ? '(enger als die Normalparabel)' : '(weiter als die Normalparabel)'}.
                </p>
                <p>
                    <Tex tex={`a ${a > 0 ? '> 0' : '< 0'}`} />: Die Parabel ist <strong>nach {opening} geöffnet</strong>.
                </p>
            </>
        ),
    };
};

const createReadVertexQuestion = (): Question => {
    const a = pick([1, -1, 2, -2, 0.5, -0.5, 3]);
    let xs: number;
    do { xs = randomInt(5, -5); } while (xs === 0);
    const ys = randomInt(5, -5);
    return {
        type: 'read_vertex',
        format: 'vertex',
        text: <p>Gib den Scheitelpunkt <Tex tex="S" /> der Parabel an.</p>,
        tex: `y = ${scheitelform(a, xs, ys)}`,
        answer: { xs, ys },
        points: 2,
        loesung: (
            <>
                <p>
                    Die Gleichung ist in der Scheitelform <Tex tex="y = a(x - x_S)^2 + y_S" />. In der Klammer steht{' '}
                    <Tex tex={`x ${xs < 0 ? '+' : '-'} ${Math.abs(xs)}`} />, das Vorzeichen von <Tex tex="x_S" /> dreht sich also um:
                </p>
                <Tex display tex={`x_S = ${xs}, \\qquad y_S = ${ys}`} />
                <p>
                    Scheitelpunkt: <strong><Tex tex={`S(${xs}\\,|\\,{${ys}})`} /></strong>
                </p>
            </>
        ),
    };
};

const createVertexFormFromGraphQuestion = (): Question => {
    const a = pick([-2, -1, -0.5, 0.5, 1, 2]);
    const xs = randomInt(3, -3);
    const ys = randomInt(3, -3);
    return {
        type: 'vertex_form_graph',
        format: 'vertex_form',
        text: (
            <>
                <p>
                    Bestimme die Funktionsgleichung der abgebildeten Parabel in Scheitelform <Tex tex="y = a(x - x_S)^2 + y_S" />. Der Formfaktor
                    ist <Tex tex={`a = ${tn(a)}`} />.
                </p>
                {GRAPH_HINWEIS}
            </>
        ),
        graph: { a, xs, ys, zeigeScheitel: true },
        answer: { a, xs, ys },
        points: 2,
        loesung: (
            <>
                <p>
                    1. Scheitelpunkt ablesen (roter Punkt): <Tex tex={`S(${xs}\\,|\\,{${ys}})`} />, also <Tex tex={`x_S = ${xs}`} /> und{' '}
                    <Tex tex={`y_S = ${ys}`} />.
                </p>
                <p>
                    2. Mit <Tex tex={`a = ${tn(a)}`} /> in <Tex tex="y = a(x - x_S)^2 + y_S" /> einsetzen:
                </p>
                <Tex display tex={`y = ${tn(a)} \\cdot (x - ${tnp(xs)})^2 + ${tnp(ys)}`} />
                <Tex display tex={`\\boldsymbol{y = ${scheitelform(a, xs, ys)}}`} />
            </>
        ),
    };
};

const createConvertToGeneralFormQuestion = (): Question => {
    const a = pick([1, -1, 2, -2, 0.5, 3]);
    let xs: number;
    do { xs = randomInt(4, -4); } while (xs === 0);
    const ys = randomInt(5, -5);
    const b = -2 * a * xs;
    const k = a * xs * xs;
    const c = k + ys;
    const ysTeil = ys !== 0 ? ` ${sg(ys)}` : '';
    const zeilen = [
        { tex: `y = ${scheitelform(a, xs, ys)}` },
        { tex: `y = ${coef(a)}\\left(x^2 ${xs > 0 ? '-' : '+'} ${2 * Math.abs(xs)}x + ${xs * xs}\\right)${ysTeil}` },
    ];
    if (ys !== 0) zeilen.push({ tex: `y = ${poly(a, b, k)}${ysTeil}` });
    zeilen.push({ tex: `\\boldsymbol{y = ${poly(a, b, c)}}` });
    return {
        type: 'convert_to_general',
        format: 'general_form',
        text: <p>Forme die Scheitelform in die allgemeine Form <Tex tex="y = ax^2 + bx + c" /> um.</p>,
        tex: `y = ${scheitelform(a, xs, ys)}`,
        answer: { a, b, c },
        points: 2,
        loesung: (
            <>
                <p>
                    Klammer mit der binomischen Formel <Tex tex={xs > 0 ? '(x - n)^2 = x^2 - 2nx + n^2' : '(x + n)^2 = x^2 + 2nx + n^2'} />{' '}
                    auflösen, dann mit <Tex tex={`a = ${tn(a)}`} /> ausmultiplizieren und zusammenfassen:
                </p>
                <Steps lines={zeilen} />
            </>
        ),
    };
};

const createCalcVertexQuestion = (): Question => {
    const a = pick([1, -1, 2, -2]);
    let xs: number;
    do { xs = randomInt(4, -4); } while (xs === 0);
    const ys = randomInt(6, -6);
    const b = -2 * a * xs;
    const c = a * xs * xs + ys;
    return {
        type: 'calc_vertex',
        format: 'vertex',
        text: <p>Berechne den Scheitelpunkt <Tex tex="S" /> der Parabel.</p>,
        tex: `y = ${poly(a, b, c)}`,
        answer: { xs, ys },
        points: 2,
        loesung: (
            <>
                <p>
                    Ablesen: <Tex tex={`a = ${a},\\quad b = ${b},\\quad c = ${c}`} />
                </p>
                <p>Formeln für den Scheitelpunkt (Merkhilfe):</p>
                <Tex display tex={`x_S = -\\frac{b}{2a} = -\\frac{${b}}{2 \\cdot ${tnp(a)}} = -\\frac{${b}}{${2 * a}} = \\boldsymbol{${xs}}`} />
                <Tex
                    display
                    tex={`y_S = c - \\frac{b^2}{4a} = ${c} - \\frac{${tnp(b)}^2}{4 \\cdot ${tnp(a)}} = ${c} - \\frac{${b * b}}{${4 * a}} = ${c} ${sg(-(b * b) / (4 * a))} = \\boldsymbol{${ys}}`}
                />
                <p>
                    Scheitelpunkt: <strong><Tex tex={`S(${xs}\\,|\\,{${ys}})`} /></strong>
                </p>
            </>
        ),
    };
};

const createNullstellenQuestion = (mitLoesung: boolean): Question => {
    const a = pick([1, -1, 2, -2]);
    let b: number, c: number;
    let answer: { n1?: number; n2?: number; isNone: boolean };
    if (mitLoesung) {
        let x1: number, x2: number;
        do {
            x1 = randomInt(5, -5);
            x2 = randomInt(5, -5);
        } while (x1 === x2 || Math.abs(a * x1 * x2) > 30);
        b = -a * (x1 + x2);
        c = a * x1 * x2;
        answer = { n1: Math.min(x1, x2), n2: Math.max(x1, x2), isNone: false };
    } else {
        // Scheitel oberhalb (a > 0) bzw. unterhalb (a < 0) der x-Achse → keine Nullstelle
        const xs = randomInt(3, -3);
        const ys = Math.sign(a) * randomInt(4, 1);
        b = -2 * a * xs;
        c = a * xs * xs + ys;
        answer = { isNone: true };
    }
    return {
        type: 'calc_nullstellen',
        format: 'nullstellen',
        text: <p>Berechne die Nullstellen der Funktion. Gibt es keine Nullstelle, kreuze „keine Nullstelle“ an.</p>,
        tex: `y = ${poly(a, b, c)}`,
        answer,
        points: 3,
        loesung: (
            <>
                <p>Für die Nullstellen setzt man <Tex tex="y = 0" />:</p>
                <Tex display tex={`0 = ${poly(a, b, c)}`} />
                <MitternachtsFullSteps a={q(a)} b={q(b)} c={q(c)} noun="Nullstelle" />
            </>
        ),
    };
};

const createVertexFormFromPointsQuestion = (): Question => {
    const a = pick([1, -1, 2, -2, 0.5, -0.5, 3]);
    const xs = randomInt(4, -4);
    const ys = randomInt(5, -5);
    let px: number;
    do { px = xs + randomInt(3, -3); } while (px === xs);
    const d = px - xs;
    const k = d * d;
    const py = round2(a * k + ys);
    const kA = k === 1 ? 'a' : `${k}a`;
    const klammerP = xs === 0 ? `${tnp(px)}^2` : `(${tn(px)} ${sg(-xs)})^2`;
    const zeilen: { tex: string; op?: string }[] = [
        { tex: `${tn(py)} = a \\cdot ${klammerP} ${sg(ys)}` },
        { tex: `${tn(py)} = ${kA} ${sg(ys)}`, op: wegMit(ys) },
        { tex: `${tn(round2(py - ys))} = ${kA}`, ...(k !== 1 ? { op: `: ${k}` } : {}) },
        { tex: `\\boldsymbol{a = ${tn(a)}}` },
    ];
    if (ys === 0) zeilen.splice(1, 2, { tex: `${tn(py)} = ${kA}`, ...(k !== 1 ? { op: `: ${k}` } : {}) });
    if (k === 1) zeilen.splice(zeilen.length - 2, 1);
    return {
        type: 'vertex_form_from_points',
        format: 'vertex_form',
        text: (
            <p>
                Eine Parabel hat den Scheitelpunkt <Tex tex="S" /> und verläuft durch den Punkt <Tex tex="P" />. Bestimme ihre Funktionsgleichung in
                Scheitelform <Tex tex="y = a(x - x_S)^2 + y_S" />.
            </p>
        ),
        tex: `S(${xs}\\,|\\,{${ys}}) \\qquad P(${px}\\,|\\,{${tn(py)}})`,
        answer: { a, xs, ys },
        points: 3,
        loesung: (
            <>
                <p>1. Scheitelpunkt in die Scheitelform einsetzen:</p>
                <Tex display tex={`y = a \\cdot ${klammer(xs)}${ys !== 0 ? ` ${sg(ys)}` : ''}`} />
                <p>
                    2. Punkt <Tex tex={`P(${px}\\,|\\,{${tn(py)}})`} /> einsetzen (<Tex tex={`x = ${px}`} />, <Tex tex={`y = ${tn(py)}`} />) und nach{' '}
                    <Tex tex="a" /> auflösen:
                </p>
                <Steps lines={zeilen} />
                <p>3. Funktionsgleichung:</p>
                <Tex display tex={`\\boldsymbol{y = ${scheitelform(a, xs, ys)}}`} />
            </>
        ),
    };
};

const createGeneralFormFromPointsQuestion = (): Question => {
    const a = pick([1, -1, 2, -2, 0.5, -0.5]);
    const b = randomInt(5, -5);
    const c = randomInt(5, -5);
    let x1: number, x2: number;
    do { x1 = randomInt(3, -3); } while (x1 === 0);
    do { x2 = randomInt(3, -3); } while (x2 === 0 || x2 === x1);
    const y1 = round2(a * x1 * x1 + b * x1 + c);
    const y2 = round2(a * x2 * x2 + b * x2 + c);
    const A1 = round2(a * x1 * x1);
    const A2 = round2(a * x2 * x2);
    const r1 = round2(y1 - A1);
    const r2 = round2(y2 - A2);
    const dx = x1 - x2;
    const gleichung = (nr: string, x: number, y: number, A: number, r: number) => [
        { tex: `\\text{${nr}:}\\; ${tn(y)} = ${tn(a)} \\cdot ${tnp(x)}^2 + b \\cdot ${tnp(x)} + c` },
        { tex: `\\text{${nr}:}\\; ${tn(y)} = ${tn(A)} ${x < 0 ? '-' : '+'} ${bTerm(Math.abs(x))} + c`, op: wegMit(A) },
        { tex: `\\text{${nr}:}\\; ${tn(r)} = ${bTerm(x)} + c` },
    ];
    const bx1 = round2(x1 * b);
    return {
        type: 'general_form_from_points',
        format: 'general_form',
        text: (
            <p>
                Eine Parabel mit dem Formfaktor <Tex tex={`a = ${tn(a)}`} /> verläuft durch die Punkte <Tex tex="P_1" /> und <Tex tex="P_2" />.
                Bestimme ihre Funktionsgleichung in allgemeiner Form <Tex tex="y = ax^2 + bx + c" />.
            </p>
        ),
        tex: `a = ${tn(a)} \\qquad P_1(${x1}\\,|\\,{${tn(y1)}}) \\qquad P_2(${x2}\\,|\\,{${tn(y2)}})`,
        answer: { a, b, c },
        points: 4,
        loesung: (
            <>
                <p>
                    1. <Tex tex={`a = ${tn(a)}`} /> und die Punkte in <Tex tex="y = ax^2 + bx + c" /> einsetzen:
                </p>
                <Steps lines={[...gleichung('I', x1, y1, A1, r1), ...gleichung('II', x2, y2, A2, r2)]} />
                <p>
                    2. Gleichung II von Gleichung I abziehen, dabei fällt <Tex tex="c" /> weg:
                </p>
                <Steps
                    lines={[
                        { tex: `\\text{I} - \\text{II}:\\; ${tn(r1)} - ${tnp(r2)} = ${bTerm(x1)} - ${tnp(x2)}b` },
                        { tex: `${tn(round2(r1 - r2))} = ${bTerm(dx)}`, ...(dx !== 1 ? { op: `: ${tnp(dx)}` } : {}) },
                        { tex: `\\boldsymbol{b = ${b}}` },
                    ]}
                />
                <p>
                    3. <Tex tex={`b = ${b}`} /> in Gleichung I einsetzen:
                </p>
                <Steps
                    lines={[
                        { tex: `${tn(r1)} = ${tn(x1)} \\cdot ${tnp(b)} + c` },
                        { tex: `${tn(r1)} = ${tn(bx1)} + c`, op: wegMit(bx1) },
                        { tex: `\\boldsymbol{c = ${c}}` },
                    ]}
                />
                <p>4. Funktionsgleichung:</p>
                <Tex display tex={`\\boldsymbol{y = ${poly(a, b, c)}}`} />
            </>
        ),
    };
};

/** 10 Aufgaben, die alle Themenbereiche abdecken, sortiert vom Ablesen zum Berechnen */
const createTest = (): Question[] => {
    const list: Question[] = [
        createGraphPropertiesQuestion(),
        createReadVertexQuestion(),
        createVertexFormFromGraphQuestion(),
        createConvertToGeneralFormQuestion(),
        createCalcVertexQuestion(),
        createNullstellenQuestion(true),
        createNullstellenQuestion(Math.random() < 0.5),
        createVertexFormFromPointsQuestion(),
        createGeneralFormFromPointsQuestion(),
    ];
    // Zusatzaufgabe, die sich von der gleichartigen Aufgabe unterscheidet
    const extra = pick([createCalcVertexQuestion, createConvertToGeneralFormQuestion, createVertexFormFromPointsQuestion]);
    let zusatz: Question;
    do { zusatz = extra(); } while (list.some((f) => f.tex === zusatz.tex));
    list.push(zusatz);
    return list.sort((x, y) => ORDER.indexOf(x.type) - ORDER.indexOf(y.type));
};

const TOTAL_QUESTIONS = 10;

// --- Auswertung ---

const bewerte = (frage: Question): Bewertung => {
    const ua = frage.userAnswer ?? LEER;
    const ca = frage.answer;
    const P = frage.points;
    if (frage.format === 'mc_properties') {
        const felder = { stretch: ua.stretch === ca.stretch, opening: ua.opening === ca.opening };
        return { felder, punkte: (P / 2) * Object.values(felder).filter(Boolean).length };
    }
    if (frage.format === 'vertex') {
        const felder = { xs: nahe(parseAnswer(ua.xs), ca.xs), ys: nahe(parseAnswer(ua.ys), ca.ys) };
        return { felder, punkte: (P / 2) * Object.values(felder).filter(Boolean).length };
    }
    if (frage.format === 'nullstellen') {
        if (ca.isNone) {
            const ok = ua.isNone;
            return { felder: { isNone: ok, n1: ok, n2: ok }, punkte: ok ? P : 0 };
        }
        if (ua.isNone) return { felder: { isNone: false, n1: false, n2: false }, punkte: 0 };
        const u1 = parseAnswer(ua.n1);
        const u2 = parseAnswer(ua.n2);
        // Reihenfolge egal: die Zuordnung mit mehr Treffern zählt
        const gerade = [nahe(u1, ca.n1), nahe(u2, ca.n2)];
        const getauscht = [nahe(u1, ca.n2), nahe(u2, ca.n1)];
        const best = gerade.filter(Boolean).length >= getauscht.filter(Boolean).length ? gerade : getauscht;
        const treffer = best.filter(Boolean).length;
        return { felder: { n1: best[0], n2: best[1] }, punkte: (P / 2) * treffer };
    }
    const soll =
        frage.format === 'general_form'
            ? { a: ca.a, b: ca.b, c: ca.c }
            : { a: ca.a, b: -2 * ca.a * ca.xs, c: ca.a * ca.xs * ca.xs + ca.ys };
    if (!ua.gleichung.trim()) return { felder: { gleichung: false }, punkte: 0 };
    const check = checkQuadraticEquation(ua.gleichung, soll, frage.format === 'general_form' ? 'allgemein' : 'scheitel', 0.01);
    const ok = check.status === 'ok';
    return { felder: { gleichung: ok }, punkte: ok ? P : 0, hinweis: ok ? undefined : check.text };
};

const richtigeAntwortTex = (frage: Question) => {
    const ca = frage.answer;
    switch (frage.format) {
        case 'mc_properties':
            return `\\text{${ca.stretch}, nach ${ca.opening} geöffnet}`;
        case 'vertex':
            return `S(${ca.xs}\\,|\\,{${ca.ys}})`;
        case 'nullstellen':
            return ca.isNone ? '\\text{keine Nullstelle}' : `x_1 = ${ca.n1}, \\quad x_2 = ${ca.n2}`;
        case 'general_form':
            return `y = ${poly(ca.a, ca.b, ca.c)}`;
        case 'vertex_form':
            return `y = ${scheitelform(ca.a, ca.xs, ca.ys)}`;
    }
};

const getGrade = (percentage: number) => {
    if (percentage >= 92) return { grade: 'Note 1 (sehr gut)', feedback: 'Hervorragende Leistung! Du beherrschst die quadratischen Funktionen ausgezeichnet.' };
    if (percentage >= 81) return { grade: 'Note 2 (gut)', feedback: 'Sehr gut gemacht! Du hast ein solides Verständnis für quadratische Funktionen.' };
    if (percentage >= 67) return { grade: 'Note 3 (befriedigend)', feedback: 'Gut gemacht! Einige Themen solltest du noch einmal wiederholen.' };
    if (percentage >= 50) return { grade: 'Note 4 (ausreichend)', feedback: 'Bestanden! Es gibt noch Lücken. Schau dir die Lösungswege der falschen Aufgaben genau an.' };
    if (percentage >= 30) return { grade: 'Note 5 (mangelhaft)', feedback: 'Das war leider noch nicht ausreichend. Arbeite die Lösungswege durch und übe die Themen noch einmal.' };
    return { grade: 'Note 6 (ungenügend)', feedback: 'Leider nicht bestanden. Wiederhole die Grundlagen von vorne, du schaffst das!' };
};

const punkteText = (n: number) => String(n).replace('.', ',');

// --- Eingabebereich (im Test bearbeitbar, in der Auswertung gesperrt und gefärbt) ---

const feldKlasse = 'border-2 border-slate-300 p-2 rounded w-24 text-center text-lg focus:border-blue-500 focus:outline-none';

function Eingabe({
    frage,
    antwort,
    onChange,
    bewertung,
}: {
    frage: Question;
    antwort: Antwort;
    onChange?: (a: Antwort) => void;
    bewertung?: Bewertung;
}) {
    const nurLesen = !onChange;
    const set = (teil: Partial<Antwort>) => onChange?.({ ...antwort, ...teil });
    const farbe = (feld: string) => (bewertung ? fieldCheckClass(bewertung.felder[feld]) : '');

    if (frage.format === 'vertex') {
        return (
            <div className="flex items-center gap-2 justify-center">
                <Tex tex="S\Big(" className="text-xl" />
                <input
                    type="text"
                    inputMode="decimal"
                    aria-label="x-Koordinate des Scheitelpunkts"
                    value={antwort.xs}
                    readOnly={nurLesen}
                    onChange={(e) => set({ xs: e.target.value })}
                    className={`${feldKlasse} ${farbe('xs')}`}
                    placeholder="x_S"
                />
                <Tex tex="\Big|" className="text-xl" />
                <input
                    type="text"
                    inputMode="decimal"
                    aria-label="y-Koordinate des Scheitelpunkts"
                    value={antwort.ys}
                    readOnly={nurLesen}
                    onChange={(e) => set({ ys: e.target.value })}
                    className={`${feldKlasse} ${farbe('ys')}`}
                    placeholder="y_S"
                />
                <Tex tex="\Big)" className="text-xl" />
            </div>
        );
    }
    if (frage.format === 'nullstellen') {
        return (
            <div className="flex flex-col items-center gap-4">
                <div className="flex flex-wrap items-center justify-center gap-4">
                    {(['n1', 'n2'] as const).map((k, i) => (
                        <label key={k} className="flex items-center gap-2">
                            <Tex tex={`x_${i + 1} =`} className="text-xl" />
                            <input
                                type="text"
                                inputMode="decimal"
                                aria-label={`Nullstelle x${i + 1}`}
                                value={antwort[k]}
                                readOnly={nurLesen}
                                disabled={antwort.isNone}
                                onChange={(e) => set(k === 'n1' ? { n1: e.target.value } : { n2: e.target.value })}
                                className={`${feldKlasse} ${antwort.isNone ? 'opacity-40' : farbe(k)}`}
                            />
                        </label>
                    ))}
                </div>
                <label
                    className={`flex items-center gap-2 px-3 py-1 rounded border-2 ${nurLesen ? '' : 'cursor-pointer'} ${
                        bewertung && (antwort.isNone || frage.answer.isNone) ? fieldCheckClass(bewertung.felder.isNone) : 'border-transparent'
                    }`}
                >
                    <input
                        type="checkbox"
                        checked={antwort.isNone}
                        disabled={nurLesen}
                        onChange={(e) => set({ isNone: e.target.checked, ...(e.target.checked ? { n1: '', n2: '' } : {}) })}
                        className="w-5 h-5"
                    />
                    <span>keine Nullstelle</span>
                </label>
            </div>
        );
    }
    if (frage.format === 'general_form' || frage.format === 'vertex_form') {
        return (
            <div className="flex justify-center">
                <GleichungEingabe
                    quadratisch
                    value={antwort.gleichung}
                    onChange={(v) => set({ gleichung: v })}
                    readOnly={nurLesen}
                    tasten={!nurLesen}
                    className={farbe('gleichung')}
                    placeholder={frage.format === 'general_form' ? 'z. B. y = 2x² − 3x + 1' : 'z. B. y = 2(x − 3)² + 1'}
                />
            </div>
        );
    }
    // Auswahl: gestreckt/gestaucht und Öffnung
    const knopf = (feld: 'stretch' | 'opening', wert: string, label: React.ReactNode) => {
        const gewaehlt = antwort[feld] === wert;
        const klasse = gewaehlt
            ? bewertung
                ? fieldCheckClass(bewertung.felder[feld])
                : 'bg-blue-600 text-white border-blue-600'
            : 'bg-white hover:bg-gray-100';
        return (
            <button
                type="button"
                disabled={nurLesen}
                aria-pressed={gewaehlt}
                className={`px-4 py-2 rounded border-2 ${klasse} ${nurLesen && !gewaehlt ? 'opacity-50' : ''}`}
                onClick={() => set(feld === 'stretch' ? { stretch: wert } : { opening: wert })}
            >
                {label}
            </button>
        );
    };
    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-4 justify-center">
                {knopf('stretch', 'gestreckt', <>gestreckt (<Tex tex="|a| > 1" />)</>)}
                {knopf('stretch', 'gestaucht', <>gestaucht (<Tex tex="|a| < 1" />)</>)}
            </div>
            <div className="flex flex-wrap gap-4 justify-center">
                {knopf('opening', 'oben', <>nach oben geöffnet (<Tex tex="a > 0" />)</>)}
                {knopf('opening', 'unten', <>nach unten geöffnet (<Tex tex="a < 0" />)</>)}
            </div>
        </div>
    );
}

function Aufgabe({ frage }: { frage: Question }) {
    return (
        <>
            <div className="mb-4 text-lg">{frage.text}</div>
            {frage.tex && (
                <div className="mb-4 text-center">
                    <div className="inline-block bg-gray-50 px-5 py-3 rounded-lg border border-gray-200 text-xl max-w-full">
                        <Tex tex={frage.tex} display />
                    </div>
                </div>
            )}
            {frage.graph && (
                <div className="mb-4 flex justify-center">
                    <ParabelGraph {...frage.graph} bereich={6} groesse={360} />
                </div>
            )}
        </>
    );
}

const istBeantwortet = (frage: Question, a: Antwort) => {
    switch (frage.format) {
        case 'mc_properties':
            return a.stretch !== null && a.opening !== null;
        case 'vertex':
            return !isIncomplete(a.xs) && !isIncomplete(a.ys);
        case 'nullstellen':
            return a.isNone || (!isIncomplete(a.n1) && !isIncomplete(a.n2));
        default:
            return a.gleichung.trim() !== '';
    }
};

const Abschlusstest: React.FC = () => {
    const [step, setStep] = useState<'start' | 'quiz' | 'result'>('start');
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [antwort, setAntwort] = useState<Antwort>(LEER);

    const startTest = () => {
        setQuestions(createTest());
        setCurrentQuestionIndex(0);
        setAntwort(LEER);
        setStep('quiz');
    };

    const handleNextQuestion = () => {
        const updated = questions.map((frage, i) => (i === currentQuestionIndex ? { ...frage, userAnswer: antwort } : frage));
        setQuestions(updated);
        setAntwort(LEER);
        if (currentQuestionIndex < TOTAL_QUESTIONS - 1) {
            setCurrentQuestionIndex((prev) => prev + 1);
        } else {
            setStep('result');
        }
        window.scrollTo({ top: 0 });
    };

    if (step === 'start') {
        return (
            <TaskShell title="Abschlusstest: Quadratische Funktionen" width="wide">
                <div className="text-center">
                    <p className="mb-4 text-gray-700 text-lg">
                        Beweise dein Können! Der Test besteht aus 10 zufälligen Aufgaben zu allen Themenbereichen: Graphen deuten, Scheitelpunkt
                        ablesen und berechnen, Scheitelform und allgemeine Form, Nullstellen und Funktionsgleichungen aufstellen.
                    </p>
                    <p className="mb-6 text-gray-700">
                        Rechne mit Stift und Papier im Heft und trage nur die Ergebnisse ein. Die Auswertung mit allen Lösungswegen bekommst du am Ende.
                    </p>
                    <button onClick={startTest} className="bk-btn bk-btn-primary text-xl flex items-center justify-center gap-2 mx-auto">
                        <Play size={24} /> Test starten
                    </button>
                </div>
            </TaskShell>
        );
    }

    if (step === 'result') {
        const bewertungen = questions.map(bewerte);
        const score = bewertungen.reduce((s, b) => s + b.punkte, 0);
        const maxScore = questions.reduce((s, frage) => s + frage.points, 0);
        const { grade, feedback } = getGrade((score / maxScore) * 100);

        return (
            <TaskShell title="Abschlusstest: Quadratische Funktionen" width="wide">
                <div data-no-autocheck>
                    <div className="text-center mb-8 border-b pb-6">
                        <h2 className="text-3xl font-bold mb-2 text-blue-600">Testergebnis</h2>
                        <div className="text-5xl font-bold mb-2">
                            {punkteText(score)} / {maxScore} Punkte
                        </div>
                        <div className="text-2xl font-semibold text-gray-700 mb-2">{grade}</div>
                        <p className="text-gray-600">{feedback}</p>
                        <button onClick={() => setStep('start')} className="bk-btn bk-btn-primary mt-6 flex items-center gap-2 mx-auto">
                            <RotateCcw size={20} /> Test wiederholen
                        </button>
                    </div>

                    <div className="space-y-6">
                        {questions.map((frage, idx) => {
                            const b = bewertungen[idx];
                            const voll = b.punkte === frage.points;
                            return (
                                <div
                                    key={idx}
                                    className={`p-4 rounded-lg border-2 ${voll ? 'border-green-300 bg-green-50' : b.punkte > 0 ? 'border-amber-300 bg-amber-50' : 'border-red-300 bg-red-50'}`}
                                >
                                    <div className="font-bold mb-3 flex justify-between items-center">
                                        <span>
                                            Aufgabe {idx + 1} ({punkteText(b.punkte)} von {frage.points} Punkten)
                                        </span>
                                        {voll ? <Check className="text-green-600" /> : <X className="text-red-600" />}
                                    </div>
                                    <Aufgabe frage={frage} />
                                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                                        <Eingabe frage={frage} antwort={frage.userAnswer ?? LEER} bewertung={b} />
                                    </div>
                                    {voll ? (
                                        <p className="mt-3 font-semibold text-green-700">{PRAISE[idx % PRAISE.length]}</p>
                                    ) : (
                                        <div className="mt-3 text-red-700">
                                            <p className="font-semibold">
                                                {b.punkte > 0 ? 'Teilweise richtig. ' : 'Leider falsch. '}Richtig ist:{' '}
                                                <Tex tex={richtigeAntwortTex(frage)} />
                                            </p>
                                            {b.hinweis && <p className="text-sm mt-1">{b.hinweis}</p>}
                                        </div>
                                    )}
                                    <details className="mt-3 bg-white rounded-lg border border-gray-200" open={!voll}>
                                        <summary className="cursor-pointer px-4 py-2 font-semibold text-gray-700">Lösungsweg</summary>
                                        <div className="px-4 pb-4 space-y-2 text-gray-800">{frage.loesung}</div>
                                    </details>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </TaskShell>
        );
    }

    const currentQ = questions[currentQuestionIndex];

    return (
        <TaskShell title="Abschlusstest: Quadratische Funktionen" width="wide">
            <div data-no-autocheck>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
                    <div
                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                        style={{ width: `${((currentQuestionIndex + 1) / TOTAL_QUESTIONS) * 100}%` }}
                    />
                </div>

                <div className="bk-panel p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-800">
                            Aufgabe {currentQuestionIndex + 1} von {TOTAL_QUESTIONS}
                        </h2>
                        <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">{currentQ.points} Punkte</span>
                    </div>

                    <Aufgabe key={currentQuestionIndex} frage={currentQ} />

                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                        <Eingabe key={currentQuestionIndex} frage={currentQ} antwort={antwort} onChange={setAntwort} />
                    </div>

                    <div className="mt-8 flex flex-wrap items-center justify-end gap-4">
                        {!istBeantwortet(currentQ, antwort) && <span className="text-sm text-gray-500">Noch nicht alles ausgefüllt.</span>}
                        <button onClick={handleNextQuestion} className="bk-btn bk-btn-primary flex items-center gap-2">
                            {currentQuestionIndex < TOTAL_QUESTIONS - 1 ? 'Nächste Aufgabe' : 'Test beenden'} <ArrowRight size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </TaskShell>
    );
};

export default Abschlusstest;

import React, { useState, useEffect, useRef } from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

declare global {
  interface Window {
    GGBApplet: any;
  }
}

interface Task {
    a: number;
    b: number;
    c: number;
    xs: number;
    ys: number;
}

type FieldKey = 'xs' | 'ys' | 'a' | 'fa' | 'fx' | 'fy';
type FieldState = Record<FieldKey, string>;
type FieldResult = Record<FieldKey, boolean | null>;

const EMPTY_FIELDS: FieldState = { xs: '', ys: '', a: '', fa: '', fx: '', fy: '' };
const EMPTY_RESULTS: FieldResult = { xs: null, ys: null, a: null, fa: null, fx: null, fy: null };

const round = (n: number) => Math.round(n * 1000) / 1000;
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomChoice = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

// Zahl für LaTeX mit deutschem Dezimalkomma
const num = (n: number) => String(round(n)).replace('.', '{,}');
// Zahl in Klammern, falls negativ
const numP = (n: number) => (n < 0 ? `(${num(n)})` : num(n));
// Zahl als Text (für Hinweise außerhalb von LaTeX)
const numText = (n: number) => String(round(n)).replace('.', ',');

// Vorfaktor vor x² bzw. vor einer Klammer: 1 -> "", -1 -> "-"
const leadCoef = (n: number) => (n === 1 ? '' : n === -1 ? '-' : num(n));
// Weiterer Summand mit Vorzeichen, z. B. "+ 3x" oder "- 2"
const signedTerm = (n: number, suffix = '') => {
    if (n === 0) return '';
    const abs = Math.abs(n);
    const coef = suffix && abs === 1 ? '' : num(abs);
    return ` ${n < 0 ? '-' : '+'} ${coef}${suffix}`;
};

const generalFormLatex = (t: Task) => `y = ${leadCoef(t.a)}x^2${signedTerm(t.b, 'x')}${signedTerm(t.c)}`;
const vertexFormLatex = (t: Task) => {
    const bracket = t.xs === 0 ? 'x^2' : `(x ${t.xs > 0 ? '-' : '+'} ${num(Math.abs(t.xs))})^2`;
    return `y = ${leadCoef(t.a)}${bracket}${signedTerm(t.ys)}`;
};

const parseInput = (raw: string): number => {
    const s = raw.trim().replace(/\s+/g, '').replace(/[−–—‐]/g, '-').replace(/,/g, '.').replace(/^\+/, '');
    if (s === '') return NaN;
    if (s.includes('/')) {
        const [p, q] = s.split('/');
        const pn = Number(p);
        const qn = Number(q);
        return qn === 0 ? NaN : pn / qn;
    }
    return Number(s);
};

const ScheitelformRechnerisch = () => {
    const [task, setTask] = useState<Task | null>(null);
    const [fields, setFields] = useState<FieldState>(EMPTY_FIELDS);
    const [results, setResults] = useState<FieldResult>(EMPTY_RESULTS);
    const [feedback, setFeedback] = useState<string>('');
    const [isCorrect, setIsCorrect] = useState<boolean>(false);
    const [showSolution, setShowSolution] = useState<boolean>(false);
    const [streak, setStreak] = useState<number>(0);

    const containerRef = useRef<HTMLDivElement | null>(null);
    const VIDEO_URL = "https://www.youtube.com/watch?v=xgiAK3rLCow&t";
    const showGraph = isCorrect || showSolution;

    const generateNewTask = () => {
        setFields(EMPTY_FIELDS);
        setResults(EMPTY_RESULTS);
        setFeedback('');
        setShowSolution(false);
        setIsCorrect(false);

        const a = randomChoice([1, -1, 2, -2, 3, -3, 0.5, -0.5]);
        // Bei a = ±0,5 gerades x_s wählen, damit b und c ganzzahlig bleiben
        const xs = Math.abs(a) === 0.5
            ? randomChoice([-4, -2, 2, 4])
            : randomChoice([-5, -4, -3, -2, -1, 1, 2, 3, 4, 5]);
        const ys = randomInt(-9, 9);
        const b = round(-2 * a * xs);
        const c = round(a * xs * xs + ys);

        setTask({ a, b, c, xs, ys });
    };

    useEffect(() => {
        generateNewTask();
    }, []);

    // Graph zur Kontrolle einblenden, sobald gelöst oder Lösung angezeigt
    useEffect(() => {
        if (!showGraph || !task) return;

        const initApplet = () => {
            if (!window.GGBApplet) return;
            const width = Math.min(Math.max((containerRef.current?.offsetWidth ?? 600) - 48, 280), 800);
            const params: any = {
                appName: 'classic',
                width,
                height: Math.round(width * 0.6),
                showToolBar: false,
                showAlgebraInput: false,
                showMenuBar: false,
                perspective: 'G',
                useBrowserForJS: true,
                enableShiftDragZoom: true,
                showResetIcon: true,
                showZoomButtons: true,
                appletOnLoad: (api: any) => {
                    try {
                        api.evalCommand(`f(x) = ${task.a}*x^2 + (${task.b})*x + (${task.c})`);
                        api.setColor('f', 37, 99, 235);
                        api.setLineThickness('f', 6);
                        api.evalCommand(`S = (${task.xs}, ${task.ys})`);
                        api.setColor('S', 220, 38, 38);
                        api.setPointSize('S', 6);
                        api.setLabelVisible('S', true);
                        api.setCoordSystem(task.xs - 6, task.xs + 6, task.ys - 8, task.ys + 8);
                    } catch (e) {
                        console.error('GeoGebra error:', e);
                    }
                }
            };
            try {
                new window.GGBApplet(params, true).inject('ggb-scheitelform-rechnerisch');
            } catch (e) {
                console.error('GeoGebra injection error:', e);
            }
        };

        const existing = document.querySelector('script[src="https://www.geogebra.org/apps/deployggb.js"]');
        if (!existing) {
            const script = document.createElement('script');
            script.src = 'https://www.geogebra.org/apps/deployggb.js';
            script.async = true;
            script.onload = () => setTimeout(initApplet, 100);
            document.body.appendChild(script);
        } else if (window.GGBApplet) {
            setTimeout(initApplet, 100);
        } else {
            existing.addEventListener('load', () => setTimeout(initApplet, 100), { once: true });
        }
    }, [showGraph, task]);

    const setField = (key: FieldKey, value: string) => {
        setFields(f => ({ ...f, [key]: value }));
        setResults(r => ({ ...r, [key]: null }));
    };

    const checkSolution = () => {
        if (!task) return;

        if (Object.values(fields).some(v => v.trim() === '')) {
            setFeedback('Bitte fülle alle Felder aus.');
            setIsCorrect(false);
            return;
        }

        const ok = (key: FieldKey, expected: number) => Math.abs(parseInput(fields[key]) - expected) < 0.01;
        const res: FieldResult = {
            xs: ok('xs', task.xs),
            ys: ok('ys', task.ys),
            a: ok('a', task.a),
            fa: ok('fa', task.a),
            fx: ok('fx', -task.xs),
            fy: ok('fy', task.ys),
        };
        setResults(res);

        if (Object.values(res).every(Boolean)) {
            setFeedback('Richtig! Ausgezeichnet!');
            setIsCorrect(true);
            setStreak(s => s + 1);
            return;
        }

        setIsCorrect(false);
        setStreak(0);
        if (!res.xs || !res.ys) {
            setFeedback('Der Scheitelpunkt stimmt noch nicht. Setze a, b und c sorgfältig in die Formel ein – achte auf die Vorzeichen!');
        } else if (!res.a) {
            setFeedback('Der Scheitelpunkt stimmt! Schau dir den Formfaktor a nochmal an: Welche Zahl steht in der allgemeinen Form vor x²?');
        } else {
            setFeedback('Scheitelpunkt und a stimmen! In der Scheitelform ist aber noch ein Fehler – beachte das Minus in (x − xₛ).');
        }
    };

    const inputClass = (key: FieldKey, extra = '') => {
        const state = results[key];
        const border = state === null ? 'border-slate-300 focus:border-blue-500' : state ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50';
        return `p-2 border-2 rounded-lg focus:outline-none text-center ${border} ${extra}`;
    };

    const onKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') checkSolution();
    };

    const renderSolution = (t: Task) => {
        const bSquared = round(t.b * t.b);
        const fourA = round(4 * t.a);
        const quotient = round(bSquared / fourA);
        return (
            <div className="space-y-3 text-slate-800">
                <p><strong>1. Koeffizienten aus der allgemeinen Form ablesen:</strong></p>
                <BlockMath>{generalFormLatex(t)}</BlockMath>
                <BlockMath>{`a = ${num(t.a)} \\qquad b = ${num(t.b)} \\qquad c = ${num(t.c)}`}</BlockMath>

                <p><strong>2. x-Koordinate des Scheitelpunkts berechnen:</strong></p>
                <BlockMath>{`x_s = -\\frac{b}{2 \\cdot a} = -\\frac{${num(t.b)}}{2 \\cdot ${numP(t.a)}} = -\\frac{${num(t.b)}}{${num(2 * t.a)}} = ${num(t.xs)}`}</BlockMath>

                <p><strong>3. y-Koordinate des Scheitelpunkts berechnen:</strong></p>
                <BlockMath>{`y_s = c - \\frac{b^2}{4 \\cdot a} = ${num(t.c)} - \\frac{${numP(t.b)}^2}{4 \\cdot ${numP(t.a)}} = ${num(t.c)} - \\frac{${num(bSquared)}}{${num(fourA)}} = ${num(t.c)} - ${numP(quotient)} = ${num(t.ys)}`}</BlockMath>
                <p>Der Scheitelpunkt lautet also <InlineMath>{`S(${num(t.xs)} \\,|\\, ${num(t.ys)})`}</InlineMath>.</p>

                <p><strong>4. Formfaktor a bestimmen:</strong></p>
                <p>
                    Der Formfaktor gibt an, wie stark die Parabel gestreckt/gestaucht und ob sie nach oben oder unten geöffnet ist.
                    Daran ändert sich beim Umformen nichts – <InlineMath>a</InlineMath> ist in der allgemeinen Form und in der Scheitelform gleich:
                </p>
                <BlockMath>{`a = ${num(t.a)}`}</BlockMath>

                <p><strong>5. Werte in die Scheitelform einsetzen:</strong></p>
                <BlockMath>{`y = a \\cdot (x - x_s)^2 + y_s`}</BlockMath>
                <BlockMath>{`y = ${num(t.a)} \\cdot (x - ${numP(t.xs)})^2 + ${numP(t.ys)}`}</BlockMath>
                <BlockMath>{vertexFormLatex(t)}</BlockMath>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8">
            <div className="container mx-auto px-4" ref={containerRef}>
                <div className="max-w-4xl mx-auto">
                    <div className="flex flex-wrap justify-between items-center gap-3 mb-2">
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-800">Umwandlung in die Scheitelform</h1>
                        <div className="bg-white px-4 py-2 rounded-lg shadow text-orange-500 font-bold border border-orange-200">
                            Streak: {streak} 🔥
                        </div>
                    </div>
                    <p className="text-slate-600 mb-6">
                        Bringe die Funktionsgleichung von der allgemeinen Form in die Scheitelform:
                        Berechne zuerst den Scheitelpunkt, bestimme dann den Formfaktor a und stelle die Scheitelform auf.
                    </p>

                    {/* Merkhilfe */}
                    <div className="bg-amber-50 border border-amber-300 rounded-xl p-5 mb-6">
                        <p className="font-bold text-amber-900 mb-3">📘 Merkhilfe</p>
                        <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-center text-slate-800">
                            <div>
                                <p className="text-sm text-slate-600">allgemeine Form</p>
                                <InlineMath>{`p\\colon\\; y = a \\cdot x^2 + b \\cdot x + c`}</InlineMath>
                            </div>
                            <div>
                                <p className="text-sm text-slate-600">Scheitelform</p>
                                <InlineMath>{`p\\colon\\; y = a \\cdot (x - x_s)^2 + y_s`}</InlineMath>
                            </div>
                            <div className="sm:col-span-2 mt-2">
                                <p className="text-sm text-slate-600">Scheitelpunktkoordinaten</p>
                                <BlockMath>{`S(x_s \\,|\\, y_s) = S\\left(-\\frac{b}{2 \\cdot a} \\;\\middle|\\; c - \\frac{b^2}{4 \\cdot a}\\right)`}</BlockMath>
                            </div>
                        </div>
                    </div>

                    {/* Aufgabe */}
                    <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200 mb-6">
                        <p className="text-lg font-bold text-slate-700 mb-2">Gegeben ist die Parabel in allgemeiner Form:</p>
                        <div className="text-xl md:text-2xl">
                            {task && <BlockMath>{`p\\colon\\; ${generalFormLatex(task)}`}</BlockMath>}
                        </div>
                    </div>

                    {/* Schritte */}
                    <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200 space-y-6">
                        <div>
                            <h3 className="font-bold text-slate-800 mb-1">Schritt 1: Scheitelpunkt berechnen</h3>
                            <p className="text-sm text-slate-600 mb-3">Lies a, b und c ab und setze sie in die Formel aus der Merkhilfe ein.</p>
                            <div className="flex flex-wrap items-center justify-center gap-2 text-lg">
                                <InlineMath>{`S\\Big(`}</InlineMath>
                                <input type="text" inputMode="decimal" aria-label="x-Koordinate des Scheitelpunkts" placeholder="xₛ"
                                    value={fields.xs} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField('xs', e.target.value)} onKeyDown={onKeyDown}
                                    className={inputClass('xs', 'w-20')} />
                                <InlineMath>{`\\Big|`}</InlineMath>
                                <input type="text" inputMode="decimal" aria-label="y-Koordinate des Scheitelpunkts" placeholder="yₛ"
                                    value={fields.ys} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField('ys', e.target.value)} onKeyDown={onKeyDown}
                                    className={inputClass('ys', 'w-20')} />
                                <InlineMath>{`\\Big)`}</InlineMath>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-bold text-slate-800 mb-1">Schritt 2: Formfaktor a bestimmen</h3>
                            <p className="text-sm text-slate-600 mb-3">Welchen Wert hat der Formfaktor a der Parabel?</p>
                            <div className="flex flex-wrap items-center justify-center gap-2 text-lg">
                                <InlineMath>{`a =`}</InlineMath>
                                <input type="text" inputMode="decimal" aria-label="Formfaktor a" placeholder="a"
                                    value={fields.a} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField('a', e.target.value)} onKeyDown={onKeyDown}
                                    className={inputClass('a', 'w-20')} />
                            </div>
                        </div>

                        <div>
                            <h3 className="font-bold text-slate-800 mb-1">Schritt 3: Funktionsgleichung in Scheitelform angeben</h3>
                            <p className="text-sm text-slate-600 mb-3">
                                Setze a und den Scheitelpunkt in <InlineMath>{`y = a \\cdot (x - x_s)^2 + y_s`}</InlineMath> ein.
                                Trage die Zahlen jeweils mit Vorzeichen ein (z. B. <strong>+3</strong> oder <strong>−2</strong>).
                            </p>
                            <div className="flex flex-wrap items-center justify-center gap-2 text-lg">
                                <InlineMath>{`y =`}</InlineMath>
                                <input type="text" inputMode="decimal" aria-label="Formfaktor in der Scheitelform" placeholder="a"
                                    value={fields.fa} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField('fa', e.target.value)} onKeyDown={onKeyDown}
                                    className={inputClass('fa', 'w-16')} />
                                <InlineMath>{`\\cdot\\, (x`}</InlineMath>
                                <input type="text" inputMode="decimal" aria-label="Zahl in der Klammer" placeholder="±"
                                    value={fields.fx} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField('fx', e.target.value)} onKeyDown={onKeyDown}
                                    className={inputClass('fx', 'w-16')} />
                                <InlineMath>{`)^2`}</InlineMath>
                                <input type="text" inputMode="decimal" aria-label="Summand hinter der Klammer" placeholder="±"
                                    value={fields.fy} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setField('fy', e.target.value)} onKeyDown={onKeyDown}
                                    className={inputClass('fy', 'w-16')} />
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 pt-2">
                            <button onClick={checkSolution}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-semibold transition-colors shadow-md">
                                Lösung prüfen
                            </button>
                            <button onClick={generateNewTask}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-semibold transition-colors shadow-md">
                                Neue Aufgabe
                            </button>
                            <a href={VIDEO_URL} target="_blank" rel="noopener noreferrer"
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors shadow-md">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                                </svg>
                                Video
                            </a>
                        </div>

                        {feedback && (
                            <div className={`p-4 rounded-lg font-semibold text-center ${isCorrect ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-red-100 text-red-700 border border-red-300'}`}>
                                {feedback}
                            </div>
                        )}

                        {!isCorrect && feedback && !showSolution && (
                            <button onClick={() => setShowSolution(true)}
                                className="w-full text-blue-600 hover:text-blue-700 font-semibold hover:underline">
                                Lösung anzeigen
                            </button>
                        )}
                    </div>

                    {showSolution && task && (
                        <div className="mt-6 bg-blue-50 p-6 rounded-xl border-2 border-blue-300">
                            <h3 className="font-bold text-lg mb-3 text-blue-900">Lösungsweg:</h3>
                            {renderSolution(task)}
                        </div>
                    )}

                    {showGraph && task && (
                        <div className="mt-6 bg-white p-6 rounded-xl shadow-md border border-slate-200">
                            <p className="text-lg font-bold text-slate-700 mb-1">Kontrolle am Graphen</p>
                            <p className="text-sm text-slate-600 mb-4">
                                Die Parabel <InlineMath>{vertexFormLatex(task)}</InlineMath> mit dem Scheitelpunkt S({numText(task.xs)}|{numText(task.ys)}) (rot).
                            </p>
                            <div id="ggb-scheitelform-rechnerisch" className="w-full flex justify-center"></div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ScheitelformRechnerisch;

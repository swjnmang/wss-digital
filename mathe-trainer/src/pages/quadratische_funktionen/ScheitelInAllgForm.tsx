import React, { useState, useEffect } from 'react';

type Aufgabe = {
    a: number;
    xs: number;
    ys: number;
    b: number;
    c: number;
    equation: string;
};

type Eingabe = { a: string; b: string; c: string };
type Feedback = 'richtig' | 'falsch' | null;

const ANZAHL_AUFGABEN = 5;

const generiereZufallszahl = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

const sgn = (num: number) => (num >= 0 ? `+ ${num}` : `- ${Math.abs(num)}`);
const klammerTerm = (xs: number) => `(x ${xs >= 0 ? '-' : '+'} ${Math.abs(xs)})`;

const erzeugeAufgabe = (): Aufgabe => {
    let a = generiereZufallszahl(2, 5) * (Math.random() < 0.5 ? 1 : -1);
    if ([-1, 0, 1].includes(a)) a = 2;

    let xs = generiereZufallszahl(-5, 5);
    if (xs === 0) xs = generiereZufallszahl(1, 5);
    const ys = generiereZufallszahl(-10, 10);

    const ys_text = ys === 0 ? '' : ` ${sgn(ys)}`;
    return {
        a,
        xs,
        ys,
        b: -2 * a * xs,
        c: a * xs * xs + ys,
        equation: `f(x) = ${a}${klammerTerm(xs)}²${ys_text}`,
    };
};

const erzeugeAufgaben = () => Array.from({ length: ANZAHL_AUFGABEN }, erzeugeAufgabe);
const leereEingaben = (): Eingabe[] =>
    Array.from({ length: ANZAHL_AUFGABEN }, () => ({ a: '', b: '', c: '' }));

const parseZahl = (s: string) => parseFloat(s.replace(/[−–—‐]/g, '-').replace(',', '.'));

const Loesungsweg = ({ t }: { t: Aufgabe }) => {
    const { a, xs, ys, b, c } = t;
    const k = klammerTerm(xs);
    const ysT = ys === 0 ? '' : ` ${sgn(ys)}`;
    const zeilen: { text: string; formel: string }[] = [
        {
            text: `Potenz auflösen. Aus ${k}² wird [${k}·${k}]`,
            formel: `f(x) = ${a}[${k}·${k}]${ysT}`,
        },
        {
            text: 'Innere Klammern ausmultiplizieren.',
            formel: `f(x) = ${a}[x² ${sgn(-xs)}x ${sgn(-xs)}x ${sgn(xs * xs)}]${ysT}`,
        },
        {
            text: 'Terme zusammenfassen (gleiche Familien suchen …)',
            formel: `f(x) = ${a}(x² ${sgn(-2 * xs)}x ${sgn(xs * xs)})${ysT}`,
        },
        {
            text: 'Klammer ausmultiplizieren.',
            formel: `f(x) = ${a}x² ${sgn(b)}x ${sgn(a * xs * xs)}${ysT}`,
        },
        {
            text: 'Zusammenfassen.',
            formel: `f(x) = ${a}x² ${sgn(b)}x ${sgn(c)}`,
        },
    ];

    return (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-3">Musterlösung</h3>
            <table className="w-full border-collapse text-gray-700">
                <tbody>
                    {zeilen.map((z, i) => (
                        <tr key={i} className="border border-gray-300">
                            <td className="bg-gray-200 p-2 align-top border-r border-gray-300">
                                {i + 1}. Schritt: {z.text}
                            </td>
                            <td className="p-2 font-mono whitespace-nowrap">{z.formel}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <p className="mt-3 font-bold text-center bg-blue-100 rounded-md p-2">
                Ergebnis: a = {a}, b = {b}, c = {c}
            </p>
        </div>
    );
};

const ScheitelInAllgForm = () => {
    const [aufgaben, setAufgaben] = useState<Aufgabe[]>([]);
    const [eingaben, setEingaben] = useState<Eingabe[]>(leereEingaben());
    const [feedback, setFeedback] = useState<Feedback[]>(Array(ANZAHL_AUFGABEN).fill(null));
    const [zeigeLoesung, setZeigeLoesung] = useState<boolean[]>(Array(ANZAHL_AUFGABEN).fill(false));

    const neueAufgaben = () => {
        setAufgaben(erzeugeAufgaben());
        setEingaben(leereEingaben());
        setFeedback(Array(ANZAHL_AUFGABEN).fill(null));
        setZeigeLoesung(Array(ANZAHL_AUFGABEN).fill(false));
    };

    useEffect(() => {
        neueAufgaben();
    }, []);

    const setEingabe = (i: number, feld: keyof Eingabe, wert: string) => {
        setEingaben((prev) => prev.map((e, idx) => (idx === i ? { ...e, [feld]: wert } : e)));
    };

    const pruefe = (i: number) => {
        const t = aufgaben[i];
        const e = eingaben[i];
        const ok =
            parseZahl(e.a) === t.a && parseZahl(e.b) === t.b && parseZahl(e.c) === t.c;
        setFeedback((prev) => prev.map((f, idx) => (idx === i ? (ok ? 'richtig' : 'falsch') : f)));
    };

    const toggleLoesung = (i: number) => {
        setZeigeLoesung((prev) => prev.map((v, idx) => (idx === i ? !v : v)));
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="bg-white p-8 rounded-xl shadow-lg max-w-3xl w-full mx-auto">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Von der Scheitelform zur allgemeinen Form</h1>
                <p className="text-gray-600 mb-6">
                    Forme jede der folgenden quadratischen Funktionen von der Scheitelform{' '}
                    <span className="font-mono">f(x) = a(x − xₛ)² + yₛ</span> in die allgemeine Form{' '}
                    <span className="font-mono">f(x) = ax² + bx + c</span> um. Rechne zuerst im Heft und trage dann
                    die Werte für a, b und c ein. Mit „Prüfen“ kontrollierst du dein Ergebnis, die Musterlösung
                    zeigt dir den Rechenweg Schritt für Schritt.
                </p>

                <div className="space-y-6">
                    {aufgaben.map((t, i) => (
                        <div key={i} className="border border-gray-200 rounded-lg p-4">
                            <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded-md mb-4">
                                <span className="font-semibold text-gray-700 mr-2">Aufgabe {i + 1}:</span>
                                <span className="text-xl font-mono tracking-wider text-blue-900">{t.equation}</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                                {(['a', 'b', 'c'] as const).map((feld) => (
                                    <div key={feld} className="flex items-center space-x-2">
                                        <label htmlFor={`${feld}-${i}`} className="text-lg font-medium text-gray-600">
                                            {feld} =
                                        </label>
                                        <input
                                            type="number"
                                            id={`${feld}-${i}`}
                                            value={eingaben[i]?.[feld] ?? ''}
                                            onChange={(ev: React.ChangeEvent<HTMLInputElement>) =>
                                                setEingabe(i, feld, ev.target.value)
                                            }
                                            className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                ))}
                            </div>

                            {feedback[i] && (
                                <div
                                    className={`mb-3 font-semibold ${feedback[i] === 'richtig' ? 'text-green-600' : 'text-red-600'}`}
                                >
                                    {feedback[i] === 'richtig'
                                        ? 'Super, alles richtig! ✅'
                                        : 'Leider nicht ganz richtig. Versuche es erneut! ❌'}
                                </div>
                            )}

                            <div className="flex flex-wrap gap-3">
                                <button
                                    onClick={() => pruefe(i)}
                                    className="bg-blue-600 text-white font-bold py-2 px-5 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                                >
                                    Prüfen
                                </button>
                                <button
                                    onClick={() => toggleLoesung(i)}
                                    className="bg-gray-200 text-gray-800 font-bold py-2 px-5 rounded-lg hover:bg-gray-300 transition-colors duration-200"
                                >
                                    {zeigeLoesung[i] ? 'Musterlösung verbergen' : 'Musterlösung anzeigen'}
                                </button>
                            </div>

                            {zeigeLoesung[i] && <Loesungsweg t={t} />}
                        </div>
                    ))}
                </div>

                <div className="flex justify-center mt-8">
                    <button
                        onClick={neueAufgaben}
                        className="bg-gray-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-gray-700 transition-colors duration-200"
                    >
                        5 neue Aufgaben
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ScheitelInAllgForm;

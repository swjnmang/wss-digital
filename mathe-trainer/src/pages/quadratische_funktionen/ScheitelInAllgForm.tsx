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
type Feld = keyof Eingabe;
type Status = 'leer' | 'richtig' | 'vorzeichen' | 'falsch';

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

const bewerte = (eingabe: string, korrekt: number): Status => {
    const wert = parseZahl(eingabe);
    if (Number.isNaN(wert)) return 'leer';
    if (wert === korrekt) return 'richtig';
    if (korrekt !== 0 && wert === -korrekt) return 'vorzeichen';
    return 'falsch';
};

const tippText = (feld: Feld): string => {
    switch (feld) {
        case 'a':
            return 'a ist der Faktor, der direkt vor der Klammer steht. Er bleibt beim Ausmultiplizieren der Potenz der Faktor vor x².';
        case 'b':
            return 'Löse zuerst die Klammer auf: (x − xₛ)² = x² − 2·xₛ·x + xₛ². Multipliziere dann alles mit a. Es gilt b = a · (−2 · xₛ).';
        case 'c':
            return 'Es gilt c = a · xₛ² + yₛ. Quadriere xₛ, multipliziere mit a und addiere dann yₛ (Vorzeichen beachten!).';
    }
};

const farbKlasse = (status: Status) =>
    status === 'richtig'
        ? 'border-green-500 bg-green-50 text-green-800 focus:ring-green-500 focus:border-green-500'
        : status === 'leer'
          ? 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
          : 'border-red-500 bg-red-50 text-red-800 focus:ring-red-500 focus:border-red-500';

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
    const [zeigeTipp, setZeigeTipp] = useState<Record<string, boolean>>({});
    const [zeigeLoesung, setZeigeLoesung] = useState<boolean[]>(Array(ANZAHL_AUFGABEN).fill(false));

    const neueAufgaben = () => {
        setAufgaben(erzeugeAufgaben());
        setEingaben(leereEingaben());
        setZeigeTipp({});
        setZeigeLoesung(Array(ANZAHL_AUFGABEN).fill(false));
    };

    useEffect(() => {
        neueAufgaben();
    }, []);

    const setEingabe = (i: number, feld: Feld, wert: string) => {
        setEingaben((prev) => prev.map((e, idx) => (idx === i ? { ...e, [feld]: wert } : e)));
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
                    die Werte für a, b und c ein. Richtige Werte werden sofort grün, falsche rot. Bei einem
                    falschen Wert kannst du dir einen Tipp anzeigen lassen. Die Musterlösung zeigt dir den
                    Rechenweg Schritt für Schritt.
                </p>

                <div className="space-y-6">
                    {aufgaben.map((t, i) => (
                        <div key={i} className="border border-gray-200 rounded-lg p-4">
                            <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded-md mb-4">
                                <span className="font-semibold text-gray-700 mr-2">Aufgabe {i + 1}:</span>
                                <span className="text-xl font-mono tracking-wider text-blue-900">{t.equation}</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-2">
                                {(['a', 'b', 'c'] as const).map((feld) => {
                                    const status = bewerte(eingaben[i]?.[feld] ?? '', t[feld]);
                                    const tippKey = `${i}-${feld}`;
                                    const istFalsch = status === 'falsch' || status === 'vorzeichen';
                                    return (
                                        <div key={feld}>
                                            <div className="flex items-center space-x-2">
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
                                                    className={`block w-full p-2 border-2 rounded-md shadow-sm ${farbKlasse(status)}`}
                                                />
                                            </div>
                                            {status === 'vorzeichen' && (
                                                <p className="mt-1 text-sm text-red-600 font-semibold">
                                                    Fast! Nur das Vorzeichen ist falsch.
                                                </p>
                                            )}
                                            {istFalsch && (
                                                <button
                                                    onClick={() => setZeigeTipp((prev) => ({ ...prev, [tippKey]: !prev[tippKey] }))}
                                                    className="mt-1 text-sm text-blue-700 underline hover:text-blue-900"
                                                >
                                                    {zeigeTipp[tippKey] ? 'Tipp verbergen' : 'Tipp anzeigen'}
                                                </button>
                                            )}
                                            {istFalsch && zeigeTipp[tippKey] && (
                                                <p className="mt-1 text-sm text-gray-700 bg-yellow-50 border border-yellow-300 rounded p-2">
                                                    💡 {tippText(feld)}
                                                </p>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="flex flex-wrap gap-3 mt-3">
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

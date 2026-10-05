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
const ANZAHL_SCHRITTE = 5;
const LOB = ['Super, alles richtig!', 'Sehr gut gemacht!', 'Top, perfekt gerechnet!', 'Stark, das stimmt alles!', 'Klasse Arbeit!'];
const LERNVIDEO_URL = 'https://www.youtube.com/watch?v=xLohr5cup-M';
const LERNVIDEO_EMBED_URL = 'https://www.youtube-nocookie.com/embed/xLohr5cup-M';
const BEISPIEL: Aufgabe = { a: 2, xs: 3, ys: 1, b: -12, c: 19, equation: 'f(x) = 2(x - 3)² + 1' };

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

// Die 5 Aufgaben eines Durchgangs sind immer paarweise verschieden.
const erzeugeAufgaben = () => {
    const aufgaben = new Map<string, Aufgabe>();
    while (aufgaben.size < ANZAHL_AUFGABEN) {
        const t = erzeugeAufgabe();
        aufgaben.set(t.equation, t);
    }
    return Array.from(aufgaben.values());
};
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

const farbKlasse = (status: Status) =>
    status === 'richtig'
        ? 'border-green-500 bg-green-50 text-green-800 focus:ring-green-500 focus:border-green-500'
        : status === 'leer'
          ? 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
          : 'border-red-500 bg-red-50 text-red-800 focus:ring-red-500 focus:border-red-500';

const Loesungsweg = ({ t, anzahl, titel }: { t: Aufgabe; anzahl: number; titel?: string }) => {
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
            <h3 className="text-lg font-bold text-gray-800 mb-3">{titel ?? (anzahl >= zeilen.length ? 'Lösungsweg' : 'Tipp: Lösungsweg')}</h3>
            <div className="overflow-x-auto"><table className="w-full border-collapse text-gray-700">
                <tbody>
                    {zeilen.slice(0, anzahl).map((z, i) => (
                        <tr key={i} className="border border-gray-300">
                            <td className="bg-gray-200 p-2 align-top border-r border-gray-300">
                                {i + 1}. Schritt: {z.text}
                            </td>
                            <td className="p-2 font-mono whitespace-nowrap">{z.formel}</td>
                        </tr>
                    ))}
                </tbody>
            </table></div>
            {anzahl >= zeilen.length && (
                <p className="mt-3 font-bold text-center bg-blue-100 rounded-md p-2">
                    Ergebnis: a = {a}, b = {b}, c = {c}
                </p>
            )}
        </div>
    );
};

const ScheitelInAllgForm = () => {
    const [aufgaben, setAufgaben] = useState<Aufgabe[]>([]);
    const [eingaben, setEingaben] = useState<Eingabe[]>(leereEingaben());
    const [tippSchritte, setTippSchritte] = useState<number[]>(Array(ANZAHL_AUFGABEN).fill(0));

    const neueAufgaben = () => {
        setAufgaben(erzeugeAufgaben());
        setEingaben(leereEingaben());
        setTippSchritte(Array(ANZAHL_AUFGABEN).fill(0));
    };

    useEffect(() => {
        neueAufgaben();
    }, []);

    const setEingabe = (i: number, feld: Feld, wert: string) => {
        setEingaben((prev) => prev.map((e, idx) => (idx === i ? { ...e, [feld]: wert } : e)));
    };

    const zeigeVollstaendigeLoesung = (i: number) => {
        setTippSchritte((prev) => prev.map((v, idx) => (idx === i ? ANZAHL_SCHRITTE : v)));
    };

    const naechsterTipp = (i: number) => {
        setTippSchritte((prev) => prev.map((v, idx) => (idx === i ? Math.min(v + 1, ANZAHL_SCHRITTE) : v)));
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="bg-white p-6 md:p-10 rounded-xl shadow-lg max-w-7xl w-full mx-auto text-left">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Von der Scheitelform zur allgemeinen Form</h1>

                <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-3">So funktioniert's</h2>
                        <p className="text-gray-700 mb-3">
                            Die Scheitelform <span className="font-mono">f(x) = a(x − xₛ)² + yₛ</span> willst du in die
                            allgemeine Form <span className="font-mono">f(x) = ax² + bx + c</span> umwandeln. Dafür löst
                            du die Klammer mit der Potenz auf, fasst zusammen und multiplizierst am Ende den Faktor a aus.
                        </p>
                        <p className="text-gray-700 mb-3">
                            <strong>Beispiel:</strong> <span className="font-mono">f(x) = 2(x − 3)² + 1</span>
                        </p>
                        <Loesungsweg t={BEISPIEL} anzahl={ANZAHL_SCHRITTE} titel="Beispiel: Lösungsweg" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-3">Lernvideo</h2>
                        <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
                            <iframe
                                className="absolute inset-0 w-full h-full rounded-lg"
                                src={LERNVIDEO_EMBED_URL}
                                title="Lernvideo: Von der Scheitelform zur allgemeinen Form"
                                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        </div>
                        <a
                            href={LERNVIDEO_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block mt-2 text-sm text-blue-700 underline hover:text-blue-900"
                        >
                            Video auf YouTube öffnen
                        </a>
                    </div>
                </section>

                <h2 className="text-xl font-semibold text-gray-800 mb-2">Deine Aufgaben</h2>
                <p className="text-gray-600 mb-6">
                    Forme jede Funktion in die allgemeine Form um. Rechne zuerst im Heft und trage dann die Werte für a, b
                    und c ein. Richtige Werte werden sofort grün, falsche rot. Wenn du nicht weiterkommst, zeigt dir
                    „Tipp anzeigen“ den Lösungsweg Schritt für Schritt.
                </p>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                    {aufgaben.map((t, i) => (
                        <div key={i} className="border border-gray-200 rounded-lg p-4">
                            <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded-md mb-4">
                                <span className="font-semibold text-gray-700 mr-2">Aufgabe {i + 1}:</span>
                                <span className="text-xl font-mono tracking-wider text-blue-900">{t.equation}</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-2">
                                {(['a', 'b', 'c'] as const).map((feld) => {
                                    const status = bewerte(eingaben[i]?.[feld] ?? '', t[feld]);
                                                    return (
                                        <div key={feld}>
                                            <div className="flex items-center space-x-2">
                                                <label htmlFor={`${feld}-${i}`} className="text-lg font-medium text-gray-600 whitespace-nowrap">
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
                                        </div>
                                    );
                                })}
                            </div>

                            {(['a', 'b', 'c'] as const).every((f) => bewerte(eingaben[i]?.[f] ?? '', t[f]) === 'richtig') && (
                                <div className="mt-3 p-3 bg-green-100 border border-green-400 rounded-md text-green-900 font-semibold">
                                    🎉 {LOB[i % LOB.length]}{' '}
                                    {i < aufgaben.length - 1
                                        ? `Weiter geht's mit Aufgabe ${i + 2}!`
                                        : 'Du hast alle Aufgaben geschafft – klicke unten auf „5 neue Aufgaben“, um weiterzuüben.'}
                                </div>
                            )}

                            <div className="flex flex-wrap gap-3 mt-3">
                                {tippSchritte[i] < ANZAHL_SCHRITTE && (
                                    <>
                                        <button
                                            onClick={() => naechsterTipp(i)}
                                            className="bg-yellow-100 text-yellow-900 font-bold py-2 px-5 rounded-lg hover:bg-yellow-200 transition-colors duration-200"
                                        >
                                            {tippSchritte[i] === 0 ? 'Tipp anzeigen' : 'Nächsten Tipp anzeigen'}
                                        </button>
                                        <button
                                            onClick={() => zeigeVollstaendigeLoesung(i)}
                                            className="bg-gray-200 text-gray-800 font-bold py-2 px-5 rounded-lg hover:bg-gray-300 transition-colors duration-200"
                                        >
                                            Vollständige Lösung anzeigen
                                        </button>
                                    </>
                                )}
                            </div>

                            {tippSchritte[i] > 0 && <Loesungsweg t={t} anzahl={tippSchritte[i]} />}
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

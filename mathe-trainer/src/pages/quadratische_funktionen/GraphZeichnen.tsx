import React, { useState, useEffect } from 'react';

type Aufgabe = {
    a: number;
    b: number;
    c: number;
    xs: number;
    ys: number;
    xWerte: number[];
    equation: string;
};

type Status = 'leer' | 'richtig' | 'vorzeichen' | 'falsch';

const ANZAHL_AUFGABEN = 4;
const LOB = ['Super, alles richtig!', 'Sehr gut gemacht!', 'Top, perfekt gerechnet!', 'Stark, das stimmt alles!', 'Klasse Arbeit!'];
const LERNVIDEO_URL = 'https://www.youtube.com/watch?v=F93pr2hAqsA';
const LERNVIDEO_EMBED_URL = 'https://www.youtube-nocookie.com/embed/F93pr2hAqsA';

const generiereZufallszahl = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

const runde = (n: number) => Math.round(n * 100) / 100;

/** Zahl mit deutschem Komma und echtem Minuszeichen */
const zahl = (n: number) => {
    const r = runde(n);
    return (r < 0 ? '−' : '') + String(Math.abs(r)).replace('.', ',');
};

/** Zahl mit Rechenzeichen davor, z. B. "+ 3" oder "− 0,5" */
const sgn = (n: number) => (n < 0 ? `− ${zahl(-n)}` : `+ ${zahl(n)}`);

/** Negative Zahlen beim Einsetzen in Klammern */
const klammer = (n: number) => (n < 0 ? `(${zahl(n)})` : zahl(n));

/** Koeffizient vor x bzw. x² (1 und −1 werden weggelassen) */
const koeff = (n: number) => (n === 1 ? '' : n === -1 ? '−' : zahl(n));

const termText = (a: number, b: number, c: number) => {
    let s = `${koeff(a)}x²`;
    if (b !== 0) s += ` ${b < 0 ? '−' : '+'} ${koeff(Math.abs(b))}x`;
    if (c !== 0) s += ` ${sgn(c)}`;
    return s;
};

const funktionswert = (t: { a: number; b: number; c: number }, x: number) => runde(t.a * x * x + t.b * x + t.c);

const baueAufgabe = (a: number, xs: number, ys: number, breite: number): Aufgabe => {
    const b = -2 * a * xs;
    const c = a * xs * xs + ys;
    const xWerte = Array.from({ length: 2 * breite + 1 }, (_, i) => xs - breite + i);
    return { a, b, c, xs, ys, xWerte, equation: `f(x) = ${termText(a, b, c)}` };
};

const BEISPIEL = baueAufgabe(1, 1, -4, 3);

const erzeugeAufgabe = (): Aufgabe => {
    const a = [-2, -1, -0.5, 0.5, 1, 2][generiereZufallszahl(0, 5)];
    const xs = generiereZufallszahl(-2, 2);
    const ys = generiereZufallszahl(-4, 4);
    // Bei steilen Parabeln reichen 5 Werte, sonst 7 – so bleiben die y-Werte überschaubar.
    return baueAufgabe(a, xs, ys, Math.abs(a) >= 2 ? 2 : 3);
};

// Die Aufgaben eines Durchgangs sind immer paarweise verschieden.
const erzeugeAufgaben = () => {
    const aufgaben = new Map<string, Aufgabe>();
    while (aufgaben.size < ANZAHL_AUFGABEN) {
        const t = erzeugeAufgabe();
        aufgaben.set(t.equation, t);
    }
    return Array.from(aufgaben.values());
};

const leereEingaben = (aufgaben: Aufgabe[]) => aufgaben.map((t) => t.xWerte.map(() => ''));

const parseZahl = (s: string) => {
    const t = s.trim().replace(/[−–—‐]/g, '-').replace(',', '.');
    return t === '' || t === '-' ? NaN : Number(t);
};

const bewerte = (eingabe: string, korrekt: number): Status => {
    const wert = parseZahl(eingabe);
    if (Number.isNaN(wert)) return 'leer';
    if (Math.abs(wert - korrekt) < 1e-9) return 'richtig';
    if (korrekt !== 0 && Math.abs(wert + korrekt) < 1e-9) return 'vorzeichen';
    return 'falsch';
};

const farbKlasse = (status: Status) =>
    status === 'richtig'
        ? 'border-green-500 bg-green-50 text-green-800 focus:ring-green-500 focus:border-green-500'
        : status === 'leer'
          ? 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
          : 'border-red-500 bg-red-50 text-red-800 focus:ring-red-500 focus:border-red-500';

/** Rechnung für einen x-Wert, z. B. f(−1) = 2·(−1)² − 4·(−1) + 1 = 2 + 4 + 1 = 7 */
const einsetzen = (t: Aufgabe, x: number) => {
    const { a, b, c } = t;
    let links = `${a === 1 ? '' : a === -1 ? '−' : `${zahl(a)}·`}${klammer(x)}²`;
    if (b !== 0) links += ` ${b < 0 ? '−' : '+'} ${Math.abs(b) === 1 ? '' : `${zahl(Math.abs(b))}·`}${klammer(x)}`;
    if (c !== 0) links += ` ${sgn(c)}`;
    const summanden = [a * x * x, ...(b !== 0 ? [b * x] : []), ...(c !== 0 ? [c] : [])];
    const mitte = summanden.map((v, i) => (i === 0 ? zahl(v) : sgn(v))).join(' ');
    const ergebnis = zahl(funktionswert(t, x));
    return `f(${zahl(x)}) = ${links} = ${summanden.length > 1 ? `${mitte} = ` : ''}${ergebnis}`;
};

const Graph = ({ t }: { t: Aufgabe }) => {
    const punkte = t.xWerte.map((x) => ({ x, y: funktionswert(t, x) }));
    const xMin = Math.min(t.xWerte[0], 0) - 1;
    const xMax = Math.max(t.xWerte[t.xWerte.length - 1], 0) + 1;
    const yMin = Math.floor(Math.min(...punkte.map((p) => p.y), 0)) - 1;
    const yMax = Math.ceil(Math.max(...punkte.map((p) => p.y), 0)) + 1;
    const yStep = yMax - yMin <= 14 ? 1 : yMax - yMin <= 28 ? 2 : 5;

    const W = 420;
    const H = 360;
    const R = 24;
    const sx = (x: number) => R + ((x - xMin) / (xMax - xMin)) * (W - 2 * R);
    const sy = (y: number) => H - R - ((y - yMin) / (yMax - yMin)) * (H - 2 * R);

    const xTicks = Array.from({ length: xMax - xMin + 1 }, (_, i) => xMin + i);
    const yTicks: number[] = [];
    for (let y = Math.ceil(yMin / yStep) * yStep; y <= yMax; y += yStep) yTicks.push(y);

    // Kurve nur im Bereich der Wertetabelle (plus etwas Rand) zeichnen
    const kurve: string[] = [];
    for (let x = t.xWerte[0] - 0.3; x <= t.xWerte[t.xWerte.length - 1] + 0.3; x += 0.05) {
        const y = t.a * x * x + t.b * x + t.c;
        if (y >= yMin && y <= yMax) kurve.push(`${sx(x).toFixed(1)},${sy(y).toFixed(1)}`);
    }

    return (
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-md mx-auto bg-white border border-gray-200 rounded-lg" role="img" aria-label={`Graph von ${t.equation}`}>
            {xTicks.map((x) => (
                <line key={`gx${x}`} x1={sx(x)} x2={sx(x)} y1={sy(yMin)} y2={sy(yMax)} stroke="#e5e7eb" />
            ))}
            {yTicks.map((y) => (
                <line key={`gy${y}`} x1={sx(xMin)} x2={sx(xMax)} y1={sy(y)} y2={sy(y)} stroke="#e5e7eb" />
            ))}
            <line x1={sx(xMin)} x2={sx(xMax)} y1={sy(0)} y2={sy(0)} stroke="#374151" strokeWidth={1.5} />
            <line x1={sx(0)} x2={sx(0)} y1={sy(yMin)} y2={sy(yMax)} stroke="#374151" strokeWidth={1.5} />
            <text x={sx(xMax) - 4} y={sy(0) - 6} fontSize={13} textAnchor="end" fill="#374151">x</text>
            <text x={sx(0) + 6} y={sy(yMax) + 12} fontSize={13} fill="#374151">y</text>
            {xTicks.filter((x) => x !== 0 && x !== xMin && x !== xMax).map((x) => (
                <text key={`lx${x}`} x={sx(x)} y={sy(0) + 14} fontSize={10} textAnchor="middle" fill="#6b7280">{zahl(x)}</text>
            ))}
            {yTicks.filter((y) => y !== 0 && y !== yMin && y !== yMax).map((y) => (
                <text key={`ly${y}`} x={sx(0) - 5} y={sy(y) + 3} fontSize={10} textAnchor="end" fill="#6b7280">{zahl(y)}</text>
            ))}
            <polyline points={kurve.join(' ')} fill="none" stroke="#2563eb" strokeWidth={2.5} />
            {punkte.map((p) => (
                <circle key={p.x} cx={sx(p.x)} cy={sy(p.y)} r={4} fill="#dc2626" />
            ))}
        </svg>
    );
};

const Wertetabelle = ({ t }: { t: Aufgabe }) => (
    <div className="overflow-x-auto">
        <table className="border-collapse text-gray-800 mx-auto">
            <tbody>
                <tr>
                    <th className="border border-gray-300 bg-gray-200 px-3 py-1">x</th>
                    {t.xWerte.map((x) => (
                        <td key={x} className="border border-gray-300 px-3 py-1 text-center font-mono">{zahl(x)}</td>
                    ))}
                </tr>
                <tr>
                    <th className="border border-gray-300 bg-gray-200 px-3 py-1">f(x)</th>
                    {t.xWerte.map((x) => (
                        <td key={x} className="border border-gray-300 px-3 py-1 text-center font-mono">{zahl(funktionswert(t, x))}</td>
                    ))}
                </tr>
            </tbody>
        </table>
    </div>
);

const Loesungsweg = ({ t, anzahl, titel }: { t: Aufgabe; anzahl: number; titel?: string }) => {
    const vollstaendig = anzahl >= t.xWerte.length;
    return (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-3">{titel ?? (vollstaendig ? 'Lösungsweg' : 'Tipp: Lösungsweg')}</h3>
            <div className="overflow-x-auto"><table className="w-full border-collapse text-gray-700">
                <tbody>
                    {t.xWerte.slice(0, anzahl).map((x, i) => (
                        <tr key={x} className="border border-gray-300">
                            <td className="bg-gray-200 p-2 align-top border-r border-gray-300 whitespace-nowrap">
                                {i + 1}. Wert: x = {zahl(x)} einsetzen
                            </td>
                            <td className="p-2 font-mono whitespace-nowrap">{einsetzen(t, x)}</td>
                        </tr>
                    ))}
                </tbody>
            </table></div>
            {vollstaendig && (
                <>
                    <p className="mt-4 mb-2 font-semibold text-gray-800">Fertige Wertetabelle:</p>
                    <Wertetabelle t={t} />
                    <p className="mt-4 mb-2 font-semibold text-gray-800">
                        Punkte eintragen und zu einer glatten Kurve verbinden:
                    </p>
                    <Graph t={t} />
                    <p className="mt-3 font-bold text-center bg-blue-100 rounded-md p-2">
                        Scheitelpunkt S({zahl(t.xs)} | {zahl(t.ys)}) – die Parabel ist nach {t.a > 0 ? 'oben' : 'unten'} geöffnet.
                    </p>
                </>
            )}
        </div>
    );
};

const GraphZeichnen = () => {
    const [aufgaben, setAufgaben] = useState<Aufgabe[]>([]);
    const [eingaben, setEingaben] = useState<string[][]>([]);
    const [tippSchritte, setTippSchritte] = useState<number[]>(Array(ANZAHL_AUFGABEN).fill(0));

    const neueAufgaben = () => {
        const neu = erzeugeAufgaben();
        setAufgaben(neu);
        setEingaben(leereEingaben(neu));
        setTippSchritte(Array(ANZAHL_AUFGABEN).fill(0));
    };

    useEffect(() => {
        neueAufgaben();
    }, []);

    const setEingabe = (i: number, j: number, wert: string) => {
        setEingaben((prev) => prev.map((e, idx) => (idx === i ? e.map((v, k) => (k === j ? wert : v)) : e)));
    };

    const zeigeVollstaendigeLoesung = (i: number) => {
        setTippSchritte((prev) => prev.map((v, idx) => (idx === i ? aufgaben[i].xWerte.length : v)));
    };

    const naechsterTipp = (i: number) => {
        setTippSchritte((prev) => prev.map((v, idx) => (idx === i ? Math.min(v + 1, aufgaben[i].xWerte.length) : v)));
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="bg-white p-6 md:p-10 rounded-xl shadow-lg max-w-3xl w-full mx-auto text-left">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Graph einer Parabel zeichnen</h1>

                <section className="flex flex-col gap-8 mb-10">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-3">So funktioniert&apos;s</h2>
                        <p className="text-gray-700 mb-3">
                            Um den Graphen einer quadratischen Funktion <span className="font-mono">f(x) = ax² + bx + c</span> zu
                            zeichnen, legst du eine Wertetabelle an:
                        </p>
                        <ol className="list-decimal pl-6 text-gray-700 mb-3 space-y-1">
                            <li>Wähle mehrere x-Werte (am besten rund um den Scheitelpunkt).</li>
                            <li>
                                Setze jeden x-Wert in die Funktion ein und berechne y. Negative Zahlen setzt du in Klammern –
                                denn <span className="font-mono">(−2)² = 4</span>. Rechne zuerst die Potenz, dann Punkt vor Strich.
                            </li>
                            <li>Trage die Punkte (x | y) in ein Koordinatensystem ein.</li>
                            <li>Verbinde die Punkte mit einer glatten, gebogenen Kurve – nicht mit dem Lineal!</li>
                        </ol>
                        <p className="text-gray-700 mb-3">
                            <strong>Beispiel:</strong> <span className="font-mono">{BEISPIEL.equation}</span>
                        </p>
                        <Loesungsweg t={BEISPIEL} anzahl={BEISPIEL.xWerte.length} titel="Beispiel: Lösungsweg" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-3">Lernvideo</h2>
                        <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
                            <iframe
                                className="absolute inset-0 w-full h-full rounded-lg"
                                src={LERNVIDEO_EMBED_URL}
                                title="Lernvideo: Graph einer Parabel zeichnen"
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
                    Vervollständige für jede Funktion die Wertetabelle. Rechne im Heft und trage die y-Werte ein (Dezimalzahlen
                    mit Komma, z. B. 2,5). Richtige Werte werden sofort grün, falsche rot. Zeichne anschließend den Graphen in
                    dein Heft. Mit „Vollständige Lösung anzeigen“ kannst du deinen Graphen vergleichen.
                </p>

                <div className="flex flex-col gap-6">
                    {aufgaben.map((t, i) => {
                        const status = t.xWerte.map((x, j) => bewerte(eingaben[i]?.[j] ?? '', funktionswert(t, x)));
                        const alleRichtig = status.every((s) => s === 'richtig');
                        return (
                            <div key={i} className="border border-gray-200 rounded-lg p-4">
                                <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded-md mb-4">
                                    <span className="font-semibold text-gray-700 mr-2">Aufgabe {i + 1}:</span>
                                    <span className="text-xl font-mono tracking-wider text-blue-900">{t.equation}</span>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="border-collapse text-gray-800">
                                        <tbody>
                                            <tr>
                                                <th className="border border-gray-300 bg-gray-200 px-3 py-2">x</th>
                                                {t.xWerte.map((x) => (
                                                    <td key={x} className="border border-gray-300 px-2 py-2 text-center font-mono">{zahl(x)}</td>
                                                ))}
                                            </tr>
                                            <tr>
                                                <th className="border border-gray-300 bg-gray-200 px-3 py-2">f(x)</th>
                                                {t.xWerte.map((x, j) => (
                                                    <td key={x} className="border border-gray-300 p-1">
                                                        <input
                                                            type="text"
                                                            inputMode="decimal"
                                                            aria-label={`f(${zahl(x)})`}
                                                            value={eingaben[i]?.[j] ?? ''}
                                                            onChange={(ev: React.ChangeEvent<HTMLInputElement>) =>
                                                                setEingabe(i, j, ev.target.value)
                                                            }
                                                            className={`block w-16 p-1 text-center border-2 rounded-md shadow-sm ${farbKlasse(status[j])}`}
                                                        />
                                                    </td>
                                                ))}
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                {status.includes('vorzeichen') && (
                                    <p className="mt-2 text-sm text-red-600 font-semibold">
                                        Fast! Bei mindestens einem Wert ist nur das Vorzeichen falsch. Denk an die Klammern bei
                                        negativen x-Werten.
                                    </p>
                                )}

                                {alleRichtig && (
                                    <div className="mt-3 p-3 bg-green-100 border border-green-400 rounded-md text-green-900 font-semibold">
                                        🎉 {LOB[i % LOB.length]} Zeichne jetzt die Punkte in dein Koordinatensystem und verbinde
                                        sie zu einer Parabel.{' '}
                                        {i < aufgaben.length - 1
                                            ? `Danach geht's weiter mit Aufgabe ${i + 2}!`
                                            : `Danach hast du alle Aufgaben geschafft – klicke unten auf „${ANZAHL_AUFGABEN} neue Aufgaben“, um weiterzuüben.`}
                                    </div>
                                )}

                                <div className="flex flex-wrap gap-3 mt-3">
                                    {tippSchritte[i] < t.xWerte.length && (
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
                        );
                    })}
                </div>

                <div className="flex justify-center mt-8">
                    <button
                        onClick={neueAufgaben}
                        className="bg-gray-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-gray-700 transition-colors duration-200"
                    >
                        {ANZAHL_AUFGABEN} neue Aufgaben
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GraphZeichnen;

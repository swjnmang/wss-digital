import React, { useState, useEffect } from 'react';

type Typ = 'graph' | 'gleichung';

type Aufgabe = {
    typ: Typ;
    a: number;
    xs: number;
    ys: number;
};

type Eingabe = { xs: string; ys: string };
type Feld = keyof Eingabe;
type Status = 'leer' | 'richtig' | 'vorzeichen' | 'falsch';

const ANZAHL_AUFGABEN = 5;
const TYPEN: Typ[] = ['graph', 'gleichung', 'graph', 'gleichung', 'graph'];
const STRECKFAKTOREN = [1, -1, 2, -2, 0.5, -0.5];
const BEREICH = 6; // Koordinatensystem von -6 bis 6
const VIDEO_URL = 'https://www.youtube.com/watch?v=VgsmYGAI-_8&list=PLI8kX0XEfSugainT6dHh9wGTGikzJ76d2&index=6';

const zufall = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const zahl = (n: number) => String(n).replace('.', ',').replace('-', '−');

const erzeugeAufgaben = (): Aufgabe[] => {
    const schonDa = new Set<string>();
    return TYPEN.map((typ) => {
        let a: number, xs: number, ys: number, key: string;
        do {
            a = STRECKFAKTOREN[zufall(0, STRECKFAKTOREN.length - 1)];
            xs = zufall(-4, 4);
            ys = zufall(-4, 4);
            key = `${xs}|${ys}`;
        } while (schonDa.has(key));
        schonDa.add(key);
        return { typ, a, xs, ys };
    });
};

const leereEingaben = (): Eingabe[] => Array.from({ length: ANZAHL_AUFGABEN }, () => ({ xs: '', ys: '' }));

const gleichung = ({ a, xs, ys }: Aufgabe) => {
    const faktor = a === 1 ? '' : a === -1 ? '−' : zahl(a);
    const quadrat = xs === 0 ? 'x²' : `(x ${xs > 0 ? '−' : '+'} ${Math.abs(xs)})²`;
    const rest = ys === 0 ? '' : ` ${ys > 0 ? '+' : '−'} ${Math.abs(ys)}`;
    return `f(x) = ${faktor}${quadrat}${rest}`;
};

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
        ? 'border-green-500 bg-green-50 text-green-800'
        : status === 'leer'
          ? 'border-gray-300 focus:border-blue-500'
          : 'border-red-500 bg-red-50 text-red-800';

const Graph = ({ a, xs, ys }: Aufgabe) => {
    const groesse = 200;
    const skala = groesse / (2 * BEREICH);
    const px = (x: number) => (x + BEREICH) * skala;
    const py = (y: number) => (BEREICH - y) * skala;
    const raster = Array.from({ length: 2 * BEREICH + 1 }, (_, i) => i - BEREICH);

    const punkte: string[] = [];
    for (let x = -BEREICH; x <= BEREICH; x += 0.05) {
        const y = a * (x - xs) ** 2 + ys;
        if (Math.abs(y) <= BEREICH + 1) punkte.push(`${px(x).toFixed(1)},${py(y).toFixed(1)}`);
    }

    return (
        <svg
            viewBox={`0 0 ${groesse} ${groesse}`}
            className="w-full max-w-[180px] bg-white rounded-md border border-gray-200"
            role="img"
            aria-label="Graph einer quadratischen Funktion"
        >
            <defs>
                <clipPath id="zeichenflaeche">
                    <rect x="0" y="0" width={groesse} height={groesse} />
                </clipPath>
            </defs>
            {raster.map((k) => (
                <g key={k}>
                    <line x1={px(k)} y1={0} x2={px(k)} y2={groesse} stroke="#e5e7eb" strokeWidth="1" />
                    <line x1={0} y1={py(k)} x2={groesse} y2={py(k)} stroke="#e5e7eb" strokeWidth="1" />
                </g>
            ))}
            <line x1={0} y1={py(0)} x2={groesse} y2={py(0)} stroke="#6b7280" strokeWidth="1.2" />
            <line x1={px(0)} y1={0} x2={px(0)} y2={groesse} stroke="#6b7280" strokeWidth="1.2" />
            {raster
                .filter((k) => k !== 0 && k % 2 === 0 && Math.abs(k) < BEREICH)
                .map((k) => (
                    <g key={`l${k}`} fontSize="7" fill="#6b7280">
                        <text x={px(k)} y={py(0) + 8} textAnchor="middle">
                            {k}
                        </text>
                        <text x={px(0) - 3} y={py(k) + 2.5} textAnchor="end">
                            {k}
                        </text>
                    </g>
                ))}
            <polyline
                points={punkte.join(' ')}
                fill="none"
                stroke="#2563eb"
                strokeWidth="2"
                clipPath="url(#zeichenflaeche)"
            />
        </svg>
    );
};

const Loesung = ({ t }: { t: Aufgabe }) => (
    <div className="mt-3 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-md p-3 space-y-1">
        {t.typ === 'gleichung' ? (
            <>
                <p>
                    Vergleiche mit der Scheitelform <span className="font-mono">f(x) = a(x − xₛ)² + yₛ</span>.
                </p>
                <p>
                    In der Klammer steht das <b>umgekehrte</b> Vorzeichen: xₛ = {zahl(t.xs)}
                </p>
                <p>Die Zahl hinter der Klammer wird direkt übernommen: yₛ = {zahl(t.ys)}</p>
            </>
        ) : (
            <p>
                Der Scheitelpunkt ist der {t.a > 0 ? 'tiefste' : 'höchste'} Punkt der Parabel. Lies seine Koordinaten
                an den Achsen ab.
            </p>
        )}
        <p className="font-bold">
            S({zahl(t.xs)} | {zahl(t.ys)})
        </p>
    </div>
);

const ScheitelpunktAblesen = () => {
    const [aufgaben, setAufgaben] = useState<Aufgabe[]>([]);
    const [eingaben, setEingaben] = useState<Eingabe[]>(leereEingaben());
    const [loesungen, setLoesungen] = useState<boolean[]>(Array(ANZAHL_AUFGABEN).fill(false));

    const neueAufgaben = () => {
        setAufgaben(erzeugeAufgaben());
        setEingaben(leereEingaben());
        setLoesungen(Array(ANZAHL_AUFGABEN).fill(false));
    };

    useEffect(() => {
        neueAufgaben();
    }, []);

    const setEingabe = (i: number, feld: Feld, wert: string) => {
        setEingaben((prev) => prev.map((e, idx) => (idx === i ? { ...e, [feld]: wert } : e)));
    };

    const zeigeLoesung = (i: number) => {
        setLoesungen((prev) => prev.map((v, idx) => (idx === i ? !v : v)));
    };

    const anzahlRichtig = aufgaben.filter(
        (t, i) => bewerte(eingaben[i]?.xs ?? '', t.xs) === 'richtig' && bewerte(eingaben[i]?.ys ?? '', t.ys) === 'richtig'
    ).length;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg max-w-3xl w-full mx-auto text-left">
                <div className="flex items-start justify-between gap-4 mb-2">
                    <h1 className="text-2xl font-bold text-gray-800">Scheitelpunkt ablesen</h1>
                    <span
                        className={`shrink-0 text-sm font-semibold px-3 py-1 rounded-full ${
                            anzahlRichtig === ANZAHL_AUFGABEN ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                        }`}
                    >
                        {anzahlRichtig} / {ANZAHL_AUFGABEN} richtig
                    </span>
                </div>
                <p className="text-gray-600 mb-6">
                    Lies den Scheitelpunkt S(xₛ | yₛ) aus dem Graphen bzw. aus der Scheitelform{' '}
                    <span className="font-mono">f(x) = a(x − xₛ)² + yₛ</span> ab. Richtige Werte werden sofort grün,
                    falsche rot.
                </p>

                <div className="space-y-4">
                    {aufgaben.map((t, i) => {
                        const statusX = bewerte(eingaben[i]?.xs ?? '', t.xs);
                        const statusY = bewerte(eingaben[i]?.ys ?? '', t.ys);
                        const fertig = statusX === 'richtig' && statusY === 'richtig';
                        return (
                            <div
                                key={i}
                                className={`border rounded-lg p-4 ${fertig ? 'border-green-300 bg-green-50/40' : 'border-gray-200'}`}
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                    <div className="sm:w-1/2">
                                        <p className="text-sm font-semibold text-gray-500 mb-2">Aufgabe {i + 1}</p>
                                        {t.typ === 'graph' ? (
                                            <Graph {...t} />
                                        ) : (
                                            <p className="text-xl font-mono text-blue-900 bg-blue-50 border-l-4 border-blue-500 rounded-md px-3 py-2 inline-block">
                                                {gleichung(t)}
                                            </p>
                                        )}
                                    </div>

                                    <div className="sm:w-1/2">
                                        <div className="flex items-center gap-1 text-xl font-mono text-gray-700">
                                            <span>S(</span>
                                            {(['xs', 'ys'] as const).map((feld, k) => {
                                                const status = feld === 'xs' ? statusX : statusY;
                                                return (
                                                    <span key={feld} className="flex items-center">
                                                        {k === 1 && <span className="px-1">|</span>}
                                                        <input
                                                            type="text"
                                                            inputMode="decimal"
                                                            aria-label={feld === 'xs' ? 'x-Koordinate' : 'y-Koordinate'}
                                                            placeholder={feld === 'xs' ? 'xₛ' : 'yₛ'}
                                                            value={eingaben[i]?.[feld] ?? ''}
                                                            onChange={(ev: React.ChangeEvent<HTMLInputElement>) =>
                                                                setEingabe(i, feld, ev.target.value)
                                                            }
                                                            className={`w-16 p-1.5 text-center border-2 rounded-md outline-none ${farbKlasse(status)}`}
                                                        />
                                                    </span>
                                                );
                                            })}
                                            <span>)</span>
                                        </div>
                                        {(statusX === 'vorzeichen' || statusY === 'vorzeichen') && (
                                            <p className="mt-1 text-sm text-red-600 font-semibold">
                                                Fast! Achte auf das Vorzeichen.
                                            </p>
                                        )}
                                        {!fertig && (
                                            <button
                                                onClick={() => zeigeLoesung(i)}
                                                className="mt-2 text-sm text-blue-600 hover:underline"
                                            >
                                                {loesungen[i] ? 'Lösung ausblenden' : 'Lösung anzeigen'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                                {loesungen[i] && !fertig && <Loesung t={t} />}
                            </div>
                        );
                    })}
                </div>

                <div className="flex flex-wrap justify-center items-center gap-4 mt-8">
                    <button
                        onClick={neueAufgaben}
                        className="bg-gray-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-gray-700 transition-colors duration-200"
                    >
                        5 neue Aufgaben
                    </button>
                    <a
                        href={VIDEO_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-red-600 hover:underline font-semibold"
                    >
                        ▶ Erklärvideo ansehen
                    </a>
                </div>
            </div>
        </div>
    );
};

export default ScheitelpunktAblesen;

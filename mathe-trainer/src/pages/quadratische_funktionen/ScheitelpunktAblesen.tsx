import React, { useState, useEffect } from 'react';
import ParabelGraph from '../../components/ParabelGraph';
import TaskShell from '../../components/layout/TaskShell'
import VideoButton from '../../components/VideoButton'

type Aufgabe = {
    a: number;
    xs: number;
    ys: number;
};

type Eingabe = { xs: string; ys: string };
type Feld = keyof Eingabe;
type Status = 'leer' | 'richtig' | 'vorzeichen' | 'falsch';

const ANZAHL_AUFGABEN = 5;
const STRECKFAKTOREN = [1, -1, 2, -2, 0.5, -0.5];
const VIDEO_URL = 'https://www.youtube.com/watch?v=VgsmYGAI-_8&list=PLI8kX0XEfSugainT6dHh9wGTGikzJ76d2&index=6';

const zufall = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const zahl = (n: number) => String(n).replace('.', ',').replace('-', '−');

const erzeugeAufgaben = (): Aufgabe[] => {
    const schonDa = new Set<string>();
    return Array.from({ length: ANZAHL_AUFGABEN }, () => {
        let a: number, xs: number, ys: number, key: string;
        do {
            a = STRECKFAKTOREN[zufall(0, STRECKFAKTOREN.length - 1)];
            xs = zufall(-4, 4);
            ys = zufall(-4, 4);
            key = `${xs}|${ys}`;
        } while (schonDa.has(key));
        schonDa.add(key);
        return { a, xs, ys };
    });
};

const leereEingaben = (): Eingabe[] => Array.from({ length: ANZAHL_AUFGABEN }, () => ({ xs: '', ys: '' }));

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

const Loesung = ({ t }: { t: Aufgabe }) => (
    <div className="mt-3 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-md p-3 space-y-1">
        <p>
            Der Scheitelpunkt ist der {t.a > 0 ? 'tiefste' : 'höchste'} Punkt der Parabel. Lies seine Koordinaten an
            den Achsen ab: zuerst den x-Wert, dann den y-Wert.
        </p>
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
        <TaskShell title="Scheitelpunkt ablesen" width="wide">
        <div className="container">
            <div className="bk-panel max-w-3xl w-full mx-auto text-left [&_p]:text-left">
                <div className="flex items-start justify-between gap-4 mb-2">
                    <span
                        className={`shrink-0 text-sm font-semibold px-3 py-1 rounded-full ${
                            anzahlRichtig === ANZAHL_AUFGABEN ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                        }`}
                    >
                        {anzahlRichtig} / {ANZAHL_AUFGABEN} richtig
                    </span>
                </div>
                <p className="text-gray-600 mb-6">
                    Lies den Scheitelpunkt S(xₛ | yₛ) aus dem Graphen ab. Ein Kästchen entspricht einer Einheit.
                    Richtige Werte werden sofort grün, falsche rot.
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
                                <div className="flex flex-col md:flex-row md:items-center gap-4">
                                    <div className="w-full md:w-auto md:flex-1">
                                        <p className="text-sm font-semibold text-gray-500 mb-2">Aufgabe {i + 1}</p>
                                        <ParabelGraph a={t.a} xs={t.xs} ys={t.ys} groesse={460} />
                                    </div>

                                    <div className="md:w-56 shrink-0">
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
                        className="bk-btn"
                    >
                        5 neue Aufgaben
                    </button>
                    <VideoButton url={VIDEO_URL} label="Erklärvideo ansehen" />
                </div>
            </div>
        </div>
        </TaskShell>
    );
};

export default ScheitelpunktAblesen;

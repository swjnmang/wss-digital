import React, { useState, useEffect } from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import ParabelGraph from '../../components/ParabelGraph';

type Vorzeichen = '+' | '-' | null;

type Aufgabe = { a: number; xs: number; ys: number };

type Eingabe = {
    a: string;
    xsSign: Vorzeichen;
    xsAbs: string;
    ysSign: Vorzeichen;
    ysAbs: string;
};

type Ergebnis = { richtig: boolean; text: string } | null;

const ANZAHL_AUFGABEN = 5;
const STRECKFAKTOREN = [1, -1, 2, -2, 0.5, -0.5];
const BEISPIEL: Aufgabe = { a: 2, xs: -3, ys: 1 };

const zufall = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const zahl = (n: number) => String(n).replace('.', ',');
const parseZahl = (s: string) => parseFloat(s.trim().replace(',', '.').replace(/[−–—‐]/g, '-'));

const erzeugeAufgaben = (): Aufgabe[] => {
    const schonDa = new Set<string>();
    return Array.from({ length: ANZAHL_AUFGABEN }, () => {
        let a: number, xs: number, ys: number;
        do {
            a = STRECKFAKTOREN[zufall(0, STRECKFAKTOREN.length - 1)];
            xs = zufall(-4, 4);
            ys = zufall(-4, 4);
        } while (schonDa.has(`${xs}|${ys}`));
        schonDa.add(`${xs}|${ys}`);
        return { a, xs, ys };
    });
};

const leereEingabe = (): Eingabe => ({ a: '', xsSign: null, xsAbs: '', ysSign: null, ysAbs: '' });

/** Fertige Scheitelform als LaTeX, z. B. y = 2(x + 3)^2 + 1 */
const scheitelformLatex = ({ a, xs, ys }: Aufgabe) => {
    const faktor = a === 1 ? '' : a === -1 ? '-' : zahl(a).replace(',', '{,}');
    const klammer = xs === 0 ? 'x^2' : `(x ${xs > 0 ? '-' : '+'} ${Math.abs(xs)})^2`;
    const rest = ys === 0 ? '' : ` ${ys > 0 ? '+' : '-'} ${Math.abs(ys)}`;
    return `y = ${faktor}${klammer}${rest}`;
};

/** Live-Vorschau aus den bisherigen Eingaben */
const vorschauLatex = (e: Eingabe) => {
    const sauber = (raw: string) => raw.trim().replace(',', '{,}').replace(/[−–—‐]/g, '-');
    const a = e.a.trim() !== '' ? sauber(e.a) : 'a';
    const xs = e.xsAbs.trim() !== '' ? sauber(e.xsAbs) : 'x_s';
    const ys = e.ysAbs.trim() !== '' ? sauber(e.ysAbs) : 'y_s';
    return `y = ${a}\\left(x ${e.xsSign ?? '\\pm'} ${xs}\\right)^2 ${e.ysSign ?? '\\pm'} ${ys}`;
};

const pruefe = (t: Aufgabe, e: Eingabe): Ergebnis => {
    if (e.a === '' || e.xsAbs === '' || e.ysAbs === '' || e.xsSign === null || e.ysSign === null) {
        return { richtig: false, text: 'Bitte fülle alle Felder aus und wähle die Vorzeichen.' };
    }

    const aRichtig = Math.abs(parseZahl(e.a) - t.a) < 0.01;
    // In der Klammer steht das UMGEKEHRTE Vorzeichen von xs.
    const xsRichtig =
        (t.xs === 0 || e.xsSign === (t.xs > 0 ? '-' : '+')) && Math.abs(parseZahl(e.xsAbs) - Math.abs(t.xs)) < 0.01;
    // Hinter der Klammer steht ys mit seinem eigenen Vorzeichen.
    const ysRichtig =
        (t.ys === 0 || e.ysSign === (t.ys < 0 ? '-' : '+')) && Math.abs(parseZahl(e.ysAbs) - Math.abs(t.ys)) < 0.01;

    if (aRichtig && xsRichtig && ysRichtig) return { richtig: true, text: 'Richtig!' };

    const fehler = [!aRichtig && 'a', !xsRichtig && 'Klammer', !ysRichtig && 'yₛ'].filter(Boolean).join(', ');
    return { richtig: false, text: `Noch nicht ganz. Überprüfe: ${fehler}` };
};

// Kleiner Umschalter, mit dem der Schüler selbst zwischen + und − wählt,
// statt ein Vorzeichen im Kopf umdrehen und als Zahl eintippen zu müssen.
const SignToggle = ({ value, onChange }: { value: Vorzeichen; onChange: (v: '+' | '-') => void }) => (
    <div className="inline-flex shrink-0 rounded-md overflow-hidden border-2 border-slate-300">
        <button
            type="button"
            onClick={() => onChange('+')}
            aria-label="Plus"
            className={`w-5 h-8 flex items-center justify-center text-xs font-bold transition-colors ${value === '+' ? 'bg-blue-600 text-white' : 'bg-white text-slate-500 hover:bg-slate-100'}`}
        >
            +
        </button>
        <button
            type="button"
            onClick={() => onChange('-')}
            aria-label="Minus"
            className={`w-5 h-8 flex items-center justify-center text-xs font-bold transition-colors border-l-2 border-slate-300 ${value === '-' ? 'bg-blue-600 text-white' : 'bg-white text-slate-500 hover:bg-slate-100'}`}
        >
            −
        </button>
    </div>
);

const eingabeKlasse =
    'w-14 h-9 shrink-0 p-1 border-2 border-slate-300 rounded-md focus:border-blue-500 focus:outline-none text-center';

const Loesungsweg = ({ t }: { t: Aufgabe }) => (
    <div className="mt-3 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-md p-3 space-y-1">
        <p>
            1. Scheitelpunkt ablesen: S({zahl(t.xs)} | {zahl(t.ys)})
        </p>
        <p>2. Formfaktor ist gegeben: a = {zahl(t.a)}</p>
        <p>
            3. Einsetzen in <InlineMath math="y = a(x - x_s)^2 + y_s" /> (in der Klammer dreht sich das Vorzeichen von{' '}
            <InlineMath math="x_s" /> um):
        </p>
        <p className="font-bold">
            <InlineMath math={scheitelformLatex(t)} />
        </p>
    </div>
);

const Scheitelform = () => {
    const [aufgaben, setAufgaben] = useState<Aufgabe[]>([]);
    const [eingaben, setEingaben] = useState<Eingabe[]>([]);
    const [ergebnisse, setErgebnisse] = useState<Ergebnis[]>([]);
    const [loesungen, setLoesungen] = useState<boolean[]>([]);

    const neueAufgaben = () => {
        setAufgaben(erzeugeAufgaben());
        setEingaben(Array.from({ length: ANZAHL_AUFGABEN }, leereEingabe));
        setErgebnisse(Array(ANZAHL_AUFGABEN).fill(null));
        setLoesungen(Array(ANZAHL_AUFGABEN).fill(false));
    };

    useEffect(() => {
        neueAufgaben();
    }, []);

    const setEingabe = (i: number, teil: Partial<Eingabe>) => {
        setEingaben((prev) => prev.map((e, idx) => (idx === i ? { ...e, ...teil } : e)));
        setErgebnisse((prev) => prev.map((r, idx) => (idx === i ? null : r)));
    };

    const pruefeAufgabe = (i: number) => {
        setErgebnisse((prev) => prev.map((r, idx) => (idx === i ? pruefe(aufgaben[i], eingaben[i]) : r)));
    };

    const toggleLoesung = (i: number) => {
        setLoesungen((prev) => prev.map((v, idx) => (idx === i ? !v : v)));
    };

    const anzahlRichtig = ergebnisse.filter((r) => r?.richtig).length;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg max-w-3xl w-full mx-auto text-left [&_p]:text-left">
                <div className="flex items-start justify-between gap-4 mb-2">
                    <h1 className="text-2xl font-bold text-gray-800">Scheitelform aus dem Graphen</h1>
                    <span
                        className={`shrink-0 text-sm font-semibold px-3 py-1 rounded-full ${
                            anzahlRichtig === ANZAHL_AUFGABEN ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                        }`}
                    >
                        {anzahlRichtig} / {ANZAHL_AUFGABEN} richtig
                    </span>
                </div>
                <p className="text-gray-600 mb-5">
                    Lies den Scheitelpunkt aus dem Graphen ab und stelle mit dem gegebenen Formfaktor a die Scheitelform{' '}
                    <InlineMath math="y = a(x - x_s)^2 + y_s" /> auf.
                </p>

                {/* Beispiel */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <p className="font-bold text-blue-900 mb-3">Beispiel</p>
                    <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
                        <div className="sm:w-[240px] shrink-0">
                            <ParabelGraph {...BEISPIEL} zeigeScheitel />
                            <p className="text-sm text-gray-600 mt-1">
                                gegeben: <b>a = {BEISPIEL.a}</b>
                            </p>
                        </div>
                        <ol className="text-sm text-gray-700 space-y-2 list-decimal pl-5">
                            <li>
                                Scheitelpunkt (tiefster bzw. höchster Punkt) ablesen:{' '}
                                <b>
                                    S({BEISPIEL.xs} | {BEISPIEL.ys})
                                </b>
                                , also <InlineMath math={`x_s = ${BEISPIEL.xs}`} /> und{' '}
                                <InlineMath math={`y_s = ${BEISPIEL.ys}`} />.
                            </li>
                            <li>
                                Werte einsetzen: <InlineMath math={`y = 2\\,(x - (${BEISPIEL.xs}))^2 + ${BEISPIEL.ys}`} />
                            </li>
                            <li>
                                Vorzeichen in der Klammer zusammenfassen – aus <InlineMath math="-(-3)" /> wird{' '}
                                <InlineMath math="+3" />: <InlineMath math={scheitelformLatex(BEISPIEL)} />
                            </li>
                        </ol>
                    </div>
                    <p className="text-xs text-blue-900 mt-3">
                        Merke: In der Klammer steht <b>das umgekehrte Vorzeichen</b> von <InlineMath math="x_s" />, hinter
                        der Klammer steht <InlineMath math="y_s" /> mit seinem eigenen Vorzeichen.
                    </p>
                </div>

                {/* Aufgaben */}
                <div className="space-y-4">
                    {aufgaben.map((t, i) => {
                        const e = eingaben[i];
                        const r = ergebnisse[i];
                        if (!e) return null;
                        return (
                            <div
                                key={i}
                                className={`border rounded-lg p-4 ${r?.richtig ? 'border-green-300 bg-green-50/40' : 'border-gray-200'}`}
                            >
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <div className="sm:w-[240px] shrink-0">
                                        <p className="text-sm font-semibold text-gray-500 mb-2">Aufgabe {i + 1}</p>
                                        <ParabelGraph a={t.a} xs={t.xs} ys={t.ys} />
                                    </div>

                                    <div className="flex-1 min-w-0 sm:pt-7">
                                        <p className="text-sm text-gray-600 mb-2">
                                            Formfaktor: <b>a = {zahl(t.a)}</b>
                                        </p>
                                        <div className="flex flex-nowrap items-center gap-1 bg-slate-50 py-2 px-1.5 rounded-lg border border-slate-200 font-mono text-sm overflow-x-auto">
                                            <span className="whitespace-nowrap shrink-0">y =</span>
                                            <input
                                                type="text"
                                                inputMode="decimal"
                                                value={e.a}
                                                onChange={(ev: React.ChangeEvent<HTMLInputElement>) => setEingabe(i, { a: ev.target.value })}
                                                placeholder="a"
                                                aria-label="Formfaktor a"
                                                className={eingabeKlasse}
                                            />
                                            <span className="whitespace-nowrap shrink-0">(x</span>
                                            <SignToggle value={e.xsSign} onChange={(v) => setEingabe(i, { xsSign: v })} />
                                            <input
                                                type="text"
                                                inputMode="decimal"
                                                value={e.xsAbs}
                                                onChange={(ev: React.ChangeEvent<HTMLInputElement>) => setEingabe(i, { xsAbs: ev.target.value })}
                                                placeholder="xs"
                                                aria-label="Zahl im Klammerterm"
                                                className={eingabeKlasse}
                                            />
                                            <span className="whitespace-nowrap shrink-0">)²</span>
                                            <SignToggle value={e.ysSign} onChange={(v) => setEingabe(i, { ysSign: v })} />
                                            <input
                                                type="text"
                                                inputMode="decimal"
                                                value={e.ysAbs}
                                                onChange={(ev: React.ChangeEvent<HTMLInputElement>) => setEingabe(i, { ysAbs: ev.target.value })}
                                                placeholder="ys"
                                                aria-label="Zahl ys"
                                                className={eingabeKlasse}
                                            />
                                        </div>

                                        <div className="mt-2 text-sm text-blue-900 overflow-x-auto">
                                            <span className="text-xs font-semibold text-blue-700 mr-2">Deine Gleichung:</span>
                                            <InlineMath math={vorschauLatex(e)} />
                                        </div>

                                        <div className="flex flex-wrap items-center gap-3 mt-3">
                                            <button
                                                onClick={() => pruefeAufgabe(i)}
                                                className="bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-1.5 rounded-md font-semibold transition-colors"
                                            >
                                                Prüfen
                                            </button>
                                            {r && (
                                                <span
                                                    className={`text-sm font-semibold ${r.richtig ? 'text-green-700' : 'text-red-600'}`}
                                                >
                                                    {r.text}
                                                </span>
                                            )}
                                            {r && !r.richtig && (
                                                <button
                                                    onClick={() => toggleLoesung(i)}
                                                    className="text-sm text-blue-600 hover:underline"
                                                >
                                                    {loesungen[i] ? 'Lösung ausblenden' : 'Lösung anzeigen'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                {loesungen[i] && !r?.richtig && <Loesungsweg t={t} />}
                            </div>
                        );
                    })}
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

export default Scheitelform;

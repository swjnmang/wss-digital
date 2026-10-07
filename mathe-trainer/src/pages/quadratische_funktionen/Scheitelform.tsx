import React, { useState } from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import ParabelGraph from '../../components/ParabelGraph';
import MarioSpiel from './MarioSpiel';
import { SignToggle, eingabeKlasse, type Vorzeichen } from './quadratischShared';

type Level = 'einfach' | 'fortgeschritten';

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
// Fortgeschritten: a muss abgelesen werden – nur Werte, die auf dem 1er-Gitter gut ablesbar sind
const STRECKFAKTOREN_ABLESEN = [1, -1, 2, -2, 3, -3, 0.5, -0.5];
const BEISPIEL: Aufgabe = { a: 2, xs: -3, ys: 1 };
const BEISPIEL_A: Aufgabe = { a: -2, xs: 1, ys: 3 };
const BEISPIEL_A_HALB: Aufgabe = { a: 0.5, xs: -2, ys: -3 };
const BEREICH = 6;
const GRAPH_GROESSE = 360;

const zufall = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const zahl = (n: number) => String(n).replace('.', ',');
const parseZahl = (s: string) =>
    parseFloat(
        s
            .trim()
            .replace(',', '.')
            .replace(/[−–—‐]/g, '-')
    );

/** Schritte zum Ablesen von a: bei |a| < 1 zwei Einheiten nach rechts, sonst eine */
const ableseSchritt = (a: number) => {
    const dx = Math.abs(a) < 1 ? 2 : 1;
    return { dx, dy: a * dx * dx };
};

const erzeugeAufgaben = (level: Level): Aufgabe[] => {
    const schonDa = new Set<string>();
    const faktoren = level === 'einfach' ? STRECKFAKTOREN : STRECKFAKTOREN_ABLESEN;
    return Array.from({ length: ANZAHL_AUFGABEN }, () => {
        let a: number, xs: number, ys: number;
        do {
            a = faktoren[zufall(0, faktoren.length - 1)];
            xs = zufall(-4, 4);
            ys = zufall(-4, 4);
            // Der Ablesepunkt neben dem Scheitel muss im sichtbaren Bereich liegen.
        } while (schonDa.has(`${xs}|${ys}`) || Math.abs(ys + ableseSchritt(a).dy) > BEREICH - 1);
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
    const sauber = (raw: string) =>
        raw
            .trim()
            .replace(',', '{,}')
            .replace(/[−–—‐]/g, '-');
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

/** Text, wie man a aus dem Graphen abliest, z. B. „1 nach rechts, 2 nach unten → a = −2“ */
const FormfaktorAblesen = ({ a }: { a: number }) => {
    const { dx, dy } = ableseSchritt(a);
    const richtung = dy > 0 ? 'oben' : 'unten';
    if (dx === 1) {
        return (
            <>
                Vom Scheitelpunkt 1 Kästchen nach rechts, dann {zahl(Math.abs(dy))} nach {richtung} bis zum Graphen,
                also <b>a = {zahl(a)}</b>.
            </>
        );
    }
    return (
        <>
            Vom Scheitelpunkt 2 Kästchen nach rechts, dann {zahl(Math.abs(dy))} nach {richtung} bis zum Graphen. Die
            Normalparabel ginge hier 4 nach oben, also{' '}
            <InlineMath math={`a = ${dy < 0 ? '-' : ''}\\frac{${Math.abs(dy)}}{4} = ${zahl(a).replace(',', '{,}')}`} />.
        </>
    );
};

const Loesungsweg = ({ t, level }: { t: Aufgabe; level: Level }) => (
    <div className="mt-3 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-md p-3 space-y-1">
        <p>
            1. Scheitelpunkt ablesen: S({zahl(t.xs)} | {zahl(t.ys)})
        </p>
        {level === 'einfach' ? (
            <p>2. Formfaktor ist gegeben: a = {zahl(t.a)}</p>
        ) : (
            <p>
                2. Formfaktor ablesen: <FormfaktorAblesen a={t.a} />
            </p>
        )}
        <p>
            3. Einsetzen in <InlineMath math="y = a(x - x_s)^2 + y_s" /> (in der Klammer dreht sich das Vorzeichen von{' '}
            <InlineMath math="x_s" /> um):
        </p>
        <p className="font-bold">
            <InlineMath math={scheitelformLatex(t)} />
        </p>
        {level === 'fortgeschritten' && (
            <div className="pt-2 max-w-[300px]">
                <ParabelGraph {...t} zeigeScheitel zeigeFormfaktor bereich={BEREICH} groesse={300} schrittweite={1} />
            </div>
        )}
    </div>
);

type GraphProps = { bereich: number; groesse: number; schrittweite: number };

const BeispielFortgeschritten = ({ graphProps }: { graphProps: GraphProps }) => (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 space-y-4">
        <p className="font-bold text-blue-900">So liest du den Formfaktor a ab</p>
        <p className="text-sm text-gray-700">
            Bei der Normalparabel <InlineMath math="y = x^2" /> geht man vom Scheitelpunkt <b>1 Kästchen nach rechts</b>{' '}
            und <b>1 Kästchen nach oben</b>, um wieder auf dem Graphen zu landen. Der Formfaktor a gibt an, wie weit man
            bei der gestreckten oder gestauchten Parabel nach oben (a &gt; 0) bzw. nach unten (a &lt; 0) gehen muss.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
            <div className="sm:w-[300px] shrink-0">
                <ParabelGraph {...BEISPIEL_A} zeigeScheitel zeigeFormfaktor {...graphProps} groesse={300} />
            </div>
            <ol className="text-sm text-gray-700 space-y-2 list-decimal pl-5">
                <li>
                    Scheitelpunkt ablesen:{' '}
                    <b>
                        S({BEISPIEL_A.xs} | {BEISPIEL_A.ys})
                    </b>
                    , also <InlineMath math={`x_s = ${BEISPIEL_A.xs}`} /> und{' '}
                    <InlineMath math={`y_s = ${BEISPIEL_A.ys}`} />.
                </li>
                <li>
                    Formfaktor ablesen: Vom Scheitelpunkt 1 Kästchen nach rechts, dann bis zum Graphen zählen: 2
                    Kästchen nach <b>unten</b>. Die Parabel ist nach unten geöffnet, also <InlineMath math="a = -2" />.
                </li>
                <li>
                    Einsetzen: <InlineMath math={scheitelformLatex(BEISPIEL_A)} />
                </li>
            </ol>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
            <div className="sm:w-[300px] shrink-0">
                <ParabelGraph {...BEISPIEL_A_HALB} zeigeScheitel zeigeFormfaktor {...graphProps} groesse={300} />
            </div>
            <div className="text-sm text-gray-700 space-y-2">
                <p>
                    <b>Tipp bei flachen Parabeln:</b> Landet man nach 1 Kästchen nach rechts nicht auf einem
                    Gitterpunkt, geht man <b>2 Kästchen nach rechts</b>. Die Normalparabel würde dort <b>4 Kästchen</b>{' '}
                    nach oben gehen (
                    <InlineMath math="2^2 = 4" />
                    ).
                </p>
                <p>
                    Hier: 2 nach rechts, 2 nach oben, also <InlineMath math="a = \frac{2}{4} = 0{,}5" />.
                </p>
                <p>
                    Ergebnis: <InlineMath math={scheitelformLatex(BEISPIEL_A_HALB)} />
                </p>
            </div>
        </div>

        <p className="text-xs text-blue-900">
            Merke: <b>a = Anzahl Kästchen nach oben/unten</b> (bei 1 nach rechts). Nach unten heißt: a ist negativ. In
            der Klammer steht das umgekehrte Vorzeichen von <InlineMath math="x_s" />.
        </p>
    </div>
);

const Scheitelform = () => {
    const [level, setLevel] = useState<Level | null>(null);
    const [aufgaben, setAufgaben] = useState<Aufgabe[]>([]);
    const [eingaben, setEingaben] = useState<Eingabe[]>([]);
    const [ergebnisse, setErgebnisse] = useState<Ergebnis[]>([]);
    const [loesungen, setLoesungen] = useState<boolean[]>([]);
    const [spielGeloest, setSpielGeloest] = useState(false);

    const neueAufgaben = (l: Level) => {
        setAufgaben(erzeugeAufgaben(l));
        setEingaben(Array.from({ length: ANZAHL_AUFGABEN }, leereEingabe));
        setErgebnisse(Array(ANZAHL_AUFGABEN).fill(null));
        setLoesungen(Array(ANZAHL_AUFGABEN).fill(false));
    };

    const waehleLevel = (l: Level | null) => {
        setLevel(l);
        if (l) neueAufgaben(l);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

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

    const anzahlRichtig = ergebnisse.filter((r) => r?.richtig).length + (spielGeloest ? 1 : 0);
    const ueberschrift = <h1 className="text-2xl font-bold text-gray-800">Scheitelform aus dem Graphen</h1>;

    if (!level) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-white p-6 md:p-10 rounded-xl shadow-lg max-w-3xl w-full mx-auto text-center">
                    <div className="mb-6">{ueberschrift}</div>
                    <h2 className="text-lg font-bold text-slate-800 mb-4">Wähle deinen Schwierigkeitsgrad</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button
                            onClick={() => waehleLevel('einfach')}
                            className="rounded-xl bg-green-600 hover:bg-green-700 text-white p-5 shadow-sm transition-colors"
                        >
                            <p className="text-lg font-bold mb-1 text-white">Einfach</p>
                            <p className="text-sm text-white/90">
                                Der Formfaktor a ist gegeben. Du liest nur den Scheitelpunkt ab.
                            </p>
                        </button>
                        <button
                            onClick={() => waehleLevel('fortgeschritten')}
                            className="rounded-xl bg-red-600 hover:bg-red-700 text-white p-5 shadow-sm transition-colors"
                        >
                            <p className="text-lg font-bold mb-1 text-white">Fortgeschritten</p>
                            <p className="text-sm text-white/90">
                                Kein Formfaktor gegeben: Du liest a, xₛ und yₛ aus dem Graphen ab.
                            </p>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const graphProps = { bereich: BEREICH, groesse: GRAPH_GROESSE, schrittweite: 1 };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg max-w-4xl w-full mx-auto text-left [&_p]:text-left">
                <div className="flex items-start justify-between gap-4 mb-2">
                    {ueberschrift}
                    <span
                        className={`shrink-0 text-sm font-semibold px-3 py-1 rounded-full ${
                            anzahlRichtig === ANZAHL_AUFGABEN + 1
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-600'
                        }`}
                    >
                        {anzahlRichtig} / {ANZAHL_AUFGABEN + 1} richtig
                    </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 mb-4">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-bold">
                        Schwierigkeitsgrad: {level === 'einfach' ? 'Einfach' : 'Fortgeschritten'}
                    </span>
                    <button
                        onClick={() => waehleLevel(null)}
                        className="text-blue-600 hover:underline text-sm font-semibold"
                    >
                        Schwierigkeitsgrad wechseln
                    </button>
                </div>
                <p className="text-gray-600 mb-5">
                    {level === 'einfach' ? (
                        <>
                            Lies den Scheitelpunkt aus dem Graphen ab und stelle mit dem gegebenen Formfaktor a die
                            Scheitelform <InlineMath math="y = a(x - x_s)^2 + y_s" /> auf.
                        </>
                    ) : (
                        <>
                            Lies den Scheitelpunkt <b>und</b> den Formfaktor a aus dem Graphen ab und stelle die
                            Scheitelform <InlineMath math="y = a(x - x_s)^2 + y_s" /> auf.
                        </>
                    )}
                </p>

                {/* Beispiel */}
                {level === 'einfach' ? (
                    <>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                            <p className="font-bold text-blue-900 mb-3">Beispiel</p>
                            <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
                                <div className="sm:w-[300px] shrink-0">
                                    <ParabelGraph {...BEISPIEL} zeigeScheitel {...graphProps} groesse={300} />
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
                                        Werte einsetzen:{' '}
                                        <InlineMath math={`y = 2\\,(x - (${BEISPIEL.xs}))^2 + ${BEISPIEL.ys}`} />
                                    </li>
                                    <li>
                                        Vorzeichen in der Klammer zusammenfassen – aus <InlineMath math="-(-3)" /> wird{' '}
                                        <InlineMath math="+3" />: <InlineMath math={scheitelformLatex(BEISPIEL)} />
                                    </li>
                                </ol>
                            </div>
                            <p className="text-xs text-blue-900 mt-3">
                                Merke: In der Klammer steht <b>das umgekehrte Vorzeichen</b> von{' '}
                                <InlineMath math="x_s" />, hinter der Klammer steht <InlineMath math="y_s" /> mit seinem
                                eigenen Vorzeichen.
                            </p>
                        </div>
                    </>
                ) : (
                    <BeispielFortgeschritten graphProps={graphProps} />
                )}

                {/* Aufgaben */}
                <div className="space-y-4">
                    {aufgaben.map((t, i) => {
                        const e = eingaben[i];
                        const r = ergebnisse[i];
                        if (!e) return null;
                        return (
                            <div
                                key={i}
                                className={`border rounded-lg p-4 ${
                                    r?.richtig ? 'border-green-300 bg-green-50/40' : 'border-gray-200'
                                }`}
                            >
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <div className="sm:w-[360px] shrink-0">
                                        <p className="text-sm font-semibold text-gray-500 mb-2">Aufgabe {i + 1}</p>
                                        <ParabelGraph a={t.a} xs={t.xs} ys={t.ys} {...graphProps} />
                                    </div>

                                    <div className="flex-1 min-w-0 sm:pt-7">
                                        <p className="text-sm text-gray-600 mb-2">
                                            {level === 'einfach' ? (
                                                <>
                                                    Formfaktor: <b>a = {zahl(t.a)}</b>
                                                </>
                                            ) : (
                                                <>Formfaktor a: aus dem Graphen ablesen</>
                                            )}
                                        </p>
                                        <div className="flex flex-nowrap items-center gap-1 bg-slate-50 py-2 px-1.5 rounded-lg border border-slate-200 font-mono text-sm overflow-x-auto">
                                            <span className="whitespace-nowrap shrink-0">y =</span>
                                            <input
                                                type="text"
                                                inputMode="decimal"
                                                value={e.a}
                                                onChange={(ev: React.ChangeEvent<HTMLInputElement>) =>
                                                    setEingabe(i, { a: ev.target.value })
                                                }
                                                placeholder="a"
                                                aria-label="Formfaktor a"
                                                className={eingabeKlasse}
                                            />
                                            <span className="whitespace-nowrap shrink-0">(x</span>
                                            <SignToggle
                                                value={e.xsSign}
                                                onChange={(v) => setEingabe(i, { xsSign: v })}
                                            />
                                            <input
                                                type="text"
                                                inputMode="decimal"
                                                value={e.xsAbs}
                                                onChange={(ev: React.ChangeEvent<HTMLInputElement>) =>
                                                    setEingabe(i, { xsAbs: ev.target.value })
                                                }
                                                placeholder="xs"
                                                aria-label="Zahl im Klammerterm"
                                                className={eingabeKlasse}
                                            />
                                            <span className="whitespace-nowrap shrink-0">)²</span>
                                            <SignToggle
                                                value={e.ysSign}
                                                onChange={(v) => setEingabe(i, { ysSign: v })}
                                            />
                                            <input
                                                type="text"
                                                inputMode="decimal"
                                                value={e.ysAbs}
                                                onChange={(ev: React.ChangeEvent<HTMLInputElement>) =>
                                                    setEingabe(i, { ysAbs: ev.target.value })
                                                }
                                                placeholder="ys"
                                                aria-label="Zahl ys"
                                                className={eingabeKlasse}
                                            />
                                        </div>

                                        <div className="mt-2 text-sm text-blue-900 overflow-x-auto">
                                            <span className="text-xs font-semibold text-blue-700 mr-2">
                                                Deine Gleichung:
                                            </span>
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
                                                    className={`text-sm font-semibold ${
                                                        r.richtig ? 'text-green-700' : 'text-red-600'
                                                    }`}
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
                                {loesungen[i] && !r?.richtig && <Loesungsweg t={t} level={level} />}
                            </div>
                        );
                    })}
                    <MarioSpiel onGeloest={() => setSpielGeloest(true)} />
                </div>

                <div className="flex justify-center mt-8">
                    <button
                        onClick={() => neueAufgaben(level)}
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

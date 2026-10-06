import React, { useMemo, useState } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

// ---------- Brüche (exakt rechnen, keine Rundungsfehler) ----------

type Bruch = { n: number; d: number };

const ggT = (x: number, y: number): number => (y === 0 ? Math.abs(x) : ggT(y, x % y));
const bruch = (n: number, d = 1): Bruch => {
    const g = ggT(n, d) || 1;
    const s = d < 0 ? -1 : 1;
    return { n: (s * n) / g, d: (s * d) / g };
};
const plus = (p: Bruch, q: Bruch) => bruch(p.n * q.d + q.n * p.d, p.d * q.d);
const mal = (p: Bruch, q: Bruch) => bruch(p.n * q.n, p.d * q.d);
const neg = (p: Bruch) => bruch(-p.n, p.d);
const wertVon = (p: Bruch) => p.n / p.d;
const ganz = (p: Bruch) => p.d === 1;

// LaTeX: Bruch als \frac, z. B. -\frac{3}{2}
const tex = (p: Bruch) => (ganz(p) ? `${p.n}` : `${p.n < 0 ? '-' : ''}\\frac{${Math.abs(p.n)}}{${p.d}}`);
// Faktor vor x² bzw. vor der Klammer: 1 und −1 werden nicht geschrieben
const faktor = (p: Bruch) => (p.n === p.d ? '' : p.n === -p.d ? '-' : tex(p));
// Term mit Rechenzeichen, z. B. "+ \frac{1}{2}x" oder "- x"; 0 entfällt
const term = (p: Bruch, variable = '') => {
    if (p.n === 0) return '';
    const betrag = bruch(Math.abs(p.n), p.d);
    const zahl = variable && betrag.n === betrag.d ? '' : tex(betrag);
    return ` ${p.n < 0 ? '-' : '+'} ${zahl}${variable}`;
};
const klammer = (xs: Bruch) => `\\left(x${term(neg(xs))}\\right)`;

// ---------- Aufgaben ----------

type Level = 'einfach' | 'fortgeschritten';

type Aufgabe = { a: Bruch; xs: Bruch; ys: Bruch; b: Bruch; c: Bruch; equation: string };

type Eingabe = { a: string; b: string; c: string };
type Feld = keyof Eingabe;
type Status = 'leer' | 'richtig' | 'vorzeichen' | 'falsch';

const ANZAHL_AUFGABEN = 5;
const ANZAHL_SCHRITTE = 5;
const LOB = ['Super, alles richtig!', 'Sehr gut gemacht!', 'Top, perfekt gerechnet!', 'Stark, das stimmt alles!', 'Klasse Arbeit!'];
const LERNVIDEO_URL = 'https://www.youtube.com/watch?v=xLohr5cup-M';
const LERNVIDEO_EMBED_URL = 'https://www.youtube-nocookie.com/embed/xLohr5cup-M';

const zufall = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const waehle = <T,>(liste: readonly T[]): T => liste[Math.floor(Math.random() * liste.length)];

const baueAufgabe = (a: Bruch, xs: Bruch, ys: Bruch): Aufgabe => ({
    a,
    xs,
    ys,
    b: mal(bruch(-2), mal(a, xs)),
    c: plus(mal(a, mal(xs, xs)), ys),
    equation: `f(x) = ${faktor(a)}${klammer(xs)}^2${term(ys)}`,
});

const BEISPIEL: Record<Level, Aufgabe> = {
    einfach: baueAufgabe(bruch(2), bruch(3), bruch(1)),
    fortgeschritten: baueAufgabe(bruch(1, 2), bruch(-1), bruch(-3, 2)),
};

// Einfach: nur ganze Zahlen
const erzeugeEinfach = (): Aufgabe => {
    const a = bruch(zufall(2, 5) * (Math.random() < 0.5 ? 1 : -1));
    let xs = zufall(-5, 5);
    if (xs === 0) xs = zufall(1, 5);
    return baueAufgabe(a, bruch(xs), bruch(zufall(-10, 10)));
};

// Fortgeschritten: a, xₛ und/oder yₛ sind Brüche
const A_WERTE = [[1, 2], [-1, 2], [3, 2], [-3, 2], [1, 3], [-1, 3], [2, 3], [-2, 3], [1, 4], [-1, 4], [2, 1], [-2, 1], [3, 1], [-3, 1]] as const;
const HALBE = [-5, -3, -1, 1, 3, 5].map((n) => bruch(n, 2));
const VIERTEL = [-3, -1, 1, 3].map((n) => bruch(n, 4));

const erzeugeFortgeschritten = (): Aufgabe => {
    for (;;) {
        const [an, ad] = waehle(A_WERTE);
        const a = bruch(an, ad);
        const ganzeX = [-4, -3, -2, -1, 1, 2, 3, 4].map((n) => bruch(n));
        // Bei Dritteln/Vierteln als Faktor bleibt xₛ ganzzahlig, damit die Nenner überschaubar bleiben
        const xs = waehle(a.d > 2 ? ganzeX : [...ganzeX, ...HALBE, ...HALBE]);
        const ganzeY = [-6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6].map((n) => bruch(n));
        const ys = waehle(a.d === 3 ? [...ganzeY, ...HALBE] : [...ganzeY, ...HALBE, ...VIERTEL]);
        const t = baueAufgabe(a, xs, ys);
        if ((!ganz(a) || !ganz(xs) || !ganz(ys)) && t.b.d <= 12 && t.c.d <= 12) return t;
    }
};

// Die 5 Aufgaben eines Durchgangs sind immer paarweise verschieden.
const erzeugeAufgaben = (level: Level) => {
    const aufgaben = new Map<string, Aufgabe>();
    while (aufgaben.size < ANZAHL_AUFGABEN) {
        const t = level === 'einfach' ? erzeugeEinfach() : erzeugeFortgeschritten();
        aufgaben.set(t.equation, t);
    }
    return Array.from(aufgaben.values());
};
const leereEingaben = (): Eingabe[] => Array.from({ length: ANZAHL_AUFGABEN }, () => ({ a: '', b: '', c: '' }));

// Erlaubt ganze Zahlen, Dezimalzahlen (Komma oder Punkt) und Brüche wie 3/4 oder -1/2
const parseZahl = (s: string): number => {
    const t = s.trim().replace(/[−–—‐]/g, '-').replace(/,/g, '.').replace(/\s+/g, '');
    const m = t.match(/^(-?)\(?(-?\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?)\)?$/);
    if (m) {
        const nenner = parseFloat(m[3]);
        if (nenner === 0) return NaN;
        return (m[1] ? -1 : 1) * (parseFloat(m[2]) / nenner);
    }
    return /^-?\d*\.?\d+$/.test(t) ? parseFloat(t) : NaN;
};

const bewerte = (eingabe: string, korrekt: Bruch): Status => {
    const wert = parseZahl(eingabe);
    if (Number.isNaN(wert)) return 'leer';
    const k = wertVon(korrekt);
    if (Math.abs(wert - k) < 1e-9) return 'richtig';
    if (k !== 0 && Math.abs(wert + k) < 1e-9) return 'vorzeichen';
    return 'falsch';
};

const farbKlasse = (status: Status) =>
    status === 'richtig'
        ? 'border-green-500 bg-green-50 text-green-800 focus:ring-green-500 focus:border-green-500'
        : status === 'leer'
          ? 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
          : 'border-red-500 bg-red-50 text-red-800 focus:ring-red-500 focus:border-red-500';

function Tex({ tex: formel, display = false, className = '' }: { tex: string; display?: boolean; className?: string }) {
    const html = useMemo(() => katex.renderToString(formel, { throwOnError: false, displayMode: display }), [formel, display]);
    return display ? (
        <div className={`overflow-x-auto overflow-y-hidden ${className}`} dangerouslySetInnerHTML={{ __html: html }} />
    ) : (
        <span className={className} dangerouslySetInnerHTML={{ __html: html }} />
    );
}

const Loesungsweg = ({ t, anzahl, titel }: { t: Aufgabe; anzahl: number; titel?: string }) => {
    const { a, xs, ys, b, c } = t;
    const k = klammer(xs);
    const fa = faktor(a);
    const ysT = term(ys);
    const zeilen: { text: string; formel: string }[] = [
        {
            text: `Potenz auflösen: Aus (x − xₛ)² wird (x − xₛ) · (x − xₛ).`,
            formel: `f(x) = ${fa}\\left[${k} \\cdot ${k}\\right]${ysT}`,
        },
        {
            text: 'Innere Klammern ausmultiplizieren.',
            formel: `f(x) = ${fa}\\left[x^2${term(neg(xs), 'x')}${term(neg(xs), 'x')}${term(mal(xs, xs))}\\right]${ysT}`,
        },
        {
            text: 'Terme zusammenfassen (gleiche Familien suchen …)',
            formel: `f(x) = ${fa}\\left(x^2${term(mal(bruch(-2), xs), 'x')}${term(mal(xs, xs))}\\right)${ysT}`,
        },
        {
            text: 'Klammer ausmultiplizieren.',
            formel: `f(x) = ${fa}x^2${term(b, 'x')}${term(mal(a, mal(xs, xs)))}${ysT}`,
        },
        {
            text: 'Zusammenfassen.',
            formel: `f(x) = ${fa}x^2${term(b, 'x')}${term(c)}`,
        },
    ];

    return (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-3">{titel ?? (anzahl >= zeilen.length ? 'Lösungsweg' : 'Tipp: Lösungsweg')}</h3>
            <div className="flex flex-col gap-2">
                {zeilen.slice(0, anzahl).map((z, i) => (
                    <div key={i} className="border border-gray-300 rounded-md overflow-hidden bg-white">
                        <div className="bg-gray-200 px-3 py-1.5 text-sm text-gray-700">
                            {i + 1}. Schritt: {z.text}
                        </div>
                        <Tex display tex={z.formel} className="px-3 py-1" />
                    </div>
                ))}
            </div>
            {anzahl >= zeilen.length && (
                <div className="mt-3 font-bold text-center bg-blue-100 rounded-md p-2">
                    Ergebnis: <Tex tex={`a = ${tex(a)},\\quad b = ${tex(b)},\\quad c = ${tex(c)}`} />
                </div>
            )}
        </div>
    );
};

const ScheitelInAllgForm = () => {
    const [level, setLevel] = useState<Level | null>(null);
    const [aufgaben, setAufgaben] = useState<Aufgabe[]>([]);
    const [eingaben, setEingaben] = useState<Eingabe[]>(leereEingaben());
    const [tippSchritte, setTippSchritte] = useState<number[]>(Array(ANZAHL_AUFGABEN).fill(0));

    const neueAufgaben = (l: Level) => {
        setAufgaben(erzeugeAufgaben(l));
        setEingaben(leereEingaben());
        setTippSchritte(Array(ANZAHL_AUFGABEN).fill(0));
    };

    const waehleLevel = (l: Level | null) => {
        setLevel(l);
        if (l) neueAufgaben(l);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const setEingabe = (i: number, feld: Feld, wert: string) => {
        setEingaben((prev) => prev.map((e, idx) => (idx === i ? { ...e, [feld]: wert } : e)));
    };

    const zeigeVollstaendigeLoesung = (i: number) => {
        setTippSchritte((prev) => prev.map((v, idx) => (idx === i ? ANZAHL_SCHRITTE : v)));
    };

    const naechsterTipp = (i: number) => {
        setTippSchritte((prev) => prev.map((v, idx) => (idx === i ? Math.min(v + 1, ANZAHL_SCHRITTE) : v)));
    };

    const ueberschrift = <h1 className="text-3xl font-bold text-gray-800 mb-6">Von der Scheitelform zur allgemeinen Form</h1>;

    if (!level) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-white p-6 md:p-10 rounded-xl shadow-lg max-w-3xl w-full mx-auto text-center">
                    {ueberschrift}
                    <h2 className="text-lg font-bold text-slate-800 mb-4">Wähle deinen Schwierigkeitsgrad</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button
                            onClick={() => waehleLevel('einfach')}
                            className="rounded-xl bg-green-600 hover:bg-green-700 text-white p-5 shadow-sm transition-colors"
                        >
                            <p className="text-lg font-bold mb-1 text-white">Einfach</p>
                            <Tex display className="text-xl mb-2 text-white" tex="f(x) = 2(x - 3)^2 + 1" />
                            <p className="text-sm text-white/90">Nur ganze Zahlen – in der Aufgabe und im Ergebnis.</p>
                        </button>
                        <button
                            onClick={() => waehleLevel('fortgeschritten')}
                            className="rounded-xl bg-red-600 hover:bg-red-700 text-white p-5 shadow-sm transition-colors"
                        >
                            <p className="text-lg font-bold mb-1 text-white">Fortgeschritten</p>
                            <Tex display className="text-xl mb-2 text-white" tex="f(x) = \frac{1}{2}\left(x + \frac{3}{2}\right)^2 - \frac{1}{4}" />
                            <p className="text-sm text-white/90">Auch mit Brüchen – rechne exakt mit Bruchrechnung.</p>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const beispiel = BEISPIEL[level];

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="bg-white p-6 md:p-10 rounded-xl shadow-lg max-w-3xl w-full mx-auto text-left">
                {ueberschrift}

                <div className="flex flex-wrap items-center gap-3 mb-6">
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-bold">
                        Schwierigkeitsgrad: {level === 'einfach' ? 'Einfach' : 'Fortgeschritten'}
                    </span>
                    <button onClick={() => waehleLevel(null)} className="text-blue-600 hover:underline text-sm font-semibold">
                        Schwierigkeitsgrad wechseln
                    </button>
                </div>

                <section className="flex flex-col gap-8 mb-10">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-3">So funktioniert's</h2>
                        <p className="text-gray-700 mb-3">
                            Die Scheitelform <Tex tex="f(x) = a(x - x_S)^2 + y_S" /> willst du in die allgemeine Form{' '}
                            <Tex tex="f(x) = ax^2 + bx + c" /> umwandeln. Dafür löst du die Klammer mit der Potenz auf, fasst
                            zusammen und multiplizierst am Ende den Faktor a aus.
                        </p>
                        {level === 'fortgeschritten' && (
                            <p className="text-gray-700 mb-3">
                                Bei Brüchen gilt: Zähler mal Zähler, Nenner mal Nenner, z. B.{' '}
                                <Tex tex="\frac{1}{2} \cdot \frac{3}{2} = \frac{3}{4}" />. Zum Addieren erst auf einen gemeinsamen
                                Nenner bringen, z. B. <Tex tex="\frac{1}{2} - \frac{3}{2} = -\frac{2}{2} = -1" />.
                            </p>
                        )}
                        <p className="text-gray-700 mb-3">
                            <strong>Beispiel:</strong> <Tex tex={beispiel.equation} />
                        </p>
                        <Loesungsweg t={beispiel} anzahl={ANZAHL_SCHRITTE} titel="Beispiel: Lösungsweg" />
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
                    {level === 'fortgeschritten' && ' Brüche gibst du mit Schrägstrich ein, z. B. 3/4 oder -1/2.'}
                </p>

                <div className="flex flex-col gap-6">
                    {aufgaben.map((t, i) => (
                        <div key={i} className="border border-gray-200 rounded-lg p-4">
                            <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded-md mb-4 flex flex-wrap items-center gap-x-2">
                                <span className="font-semibold text-gray-700">Aufgabe {i + 1}:</span>
                                <Tex tex={t.equation} className="text-xl text-blue-900" />
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
                                                    type="text"
                                                    inputMode={level === 'einfach' ? 'numeric' : 'text'}
                                                    autoComplete="off"
                                                    id={`${feld}-${i}`}
                                                    value={eingaben[i]?.[feld] ?? ''}
                                                    placeholder={level === 'fortgeschritten' ? 'z. B. 3/4' : ''}
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

export default ScheitelInAllgForm;

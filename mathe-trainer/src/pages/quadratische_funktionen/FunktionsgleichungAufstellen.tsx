import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';

// Typ 1: Scheitelpunkt S(h|k) und ein weiterer Punkt P gegeben
type ScheitelAufgabe = { typ: 'scheitel'; a: number; b: number; c: number; h: number; k: number; px: number; py: number };
// Typ 2: einer der Werte a, b oder c und zwei Punkte P, Q gegeben
type Bekannt = 'a' | 'b' | 'c';
type PunkteAufgabe = { typ: 'punkte'; bekannt: Bekannt; a: number; b: number; c: number; x1: number; y1: number; x2: number; y2: number };
type Aufgabe = ScheitelAufgabe | PunkteAufgabe;

type Eingabe = { a: string; b: string; c: string };
type Feld = keyof Eingabe;
type Status = 'leer' | 'richtig' | 'vorzeichen' | 'falsch';
type Schritt = { text: string; formeln: string[] };

const ANZAHL_AUFGABEN = 5;
type Modus = 'scheitel' | 'punkte' | 'gemischt';
const MODI: { id: Modus; titel: string; beschreibung: string }[] = [
    { id: 'scheitel', titel: 'Fall 1', beschreibung: 'Scheitelpunkt und ein weiterer Punkt' },
    { id: 'punkte', titel: 'Fall 2', beschreibung: 'Ein Wert (a, b oder c) und zwei Punkte' },
    { id: 'gemischt', titel: 'Fall 3', beschreibung: 'Gemischte Übungsaufgaben' },
];
// Reihenfolge der Aufgabentypen auf einer Seite je Modus
// (bei 'punkte' kommt jede Variante – a, b oder c bekannt – mindestens einmal vor)
const TYPEN: Record<Modus, Aufgabe['typ'][]> = {
    scheitel: ['scheitel', 'scheitel', 'scheitel', 'scheitel', 'scheitel'],
    punkte: ['punkte', 'punkte', 'punkte', 'punkte', 'punkte'],
    gemischt: ['scheitel', 'punkte', 'scheitel', 'punkte', 'punkte'],
};
const LOB = ['Super, alles richtig!', 'Sehr gut gemacht!', 'Top, perfekt gerechnet!', 'Stark, das stimmt alles!', 'Klasse Arbeit!'];
const LERNVIDEO_ID = 'hg9QipwqXxI';
const GLEICHUNGSSYSTEME_PFAD = '/lineare_funktionen/gleichungssysteme';

const BEISPIEL_SCHEITEL: ScheitelAufgabe = { typ: 'scheitel', a: 1, b: -4, c: 3, h: 2, k: -1, px: 4, py: 3 };
const BEISPIEL_PUNKTE: PunkteAufgabe = { typ: 'punkte', bekannt: 'a', a: -1, b: 2, c: 4, x1: 1, y1: 5, x2: 3, y2: 1 };

const zufall = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const auswahl = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

// ---------- LaTeX-Hilfen ----------
const num = (n: number) => String(Math.round(n * 1000) / 1000).replace('.', '{,}');
const kl = (n: number) => (n < 0 ? `(${num(n)})` : num(n));
// Vorfaktor ohne 1: 1 -> "", -1 -> "-"
const vorfaktor = (n: number) => (n === 1 ? '' : n === -1 ? '-' : num(n));
// Summand mit Vorzeichen, z. B. " + 3x" / " - 2"
const summand = (n: number, suffix = '') => {
    if (n === 0) return '';
    const abs = Math.abs(n);
    return ` ${n < 0 ? '-' : '+'} ${suffix && abs === 1 ? '' : num(abs)}${suffix}`;
};
const allgForm = (a: number, b: number, c: number) => `y = ${vorfaktor(a)}x^2${summand(b, 'x')}${summand(c)}`;
const klammer = (h: number) => (h === 0 ? 'x^2' : `(x ${h > 0 ? '-' : '+'} ${num(Math.abs(h))})^2`);
const scheitelForm = (a: number, h: number, k: number) => `y = ${vorfaktor(a)}${klammer(h)}${summand(k)}`;
// "| - 3" bzw. "| + 3", um n auf die andere Seite zu bringen
const minusRechnen = (n: number) => (n === 0 ? '' : ` \\quad |\\, ${n > 0 ? '-' : '+'}\\, ${num(Math.abs(n))}`);

// ---------- Aufgaben erzeugen ----------
const erzeugeScheitelAufgabe = (): ScheitelAufgabe => {
    const a = auswahl([1, -1, 2, -2, 3, -3]);
    const h = auswahl([-4, -3, -2, -1, 1, 2, 3, 4]);
    const k = zufall(-6, 6);
    // Bei großem |a| nur nahe Punkte, damit die y-Werte überschaubar bleiben
    const px = h + auswahl(Math.abs(a) === 1 ? [-3, -2, -1, 1, 2, 3] : [-2, -1, 1, 2]);
    const py = a * (px - h) ** 2 + k;
    return { typ: 'scheitel', a, b: -2 * a * h, c: a * h * h + k, h, k, px, py };
};

const erzeugePunkteAufgabe = (bekannt: Bekannt): PunkteAufgabe => {
    const a = auswahl([1, -1, 2, -2]);
    // Der bekannte Wert ist nie 0, sonst wäre die Angabe nichtssagend
    const b = bekannt === 'b' ? auswahl([-5, -4, -3, -2, -1, 1, 2, 3, 4, 5]) : zufall(-6, 6);
    const c = bekannt === 'c' ? auswahl([-5, -4, -3, -2, -1, 1, 2, 3, 4, 5]) : zufall(-6, 6);
    const xWerte = [-3, -2, -1, 1, 2, 3];
    const x1 = auswahl(xWerte);
    // Bei bekanntem b muss x2 ≠ -x1 sein, sonst fällt beim Abziehen auch a weg
    const x2 = auswahl(xWerte.filter(x => x !== x1 && (bekannt !== 'b' || x !== -x1)));
    const f = (x: number) => a * x * x + b * x + c;
    return { typ: 'punkte', bekannt, a, b, c, x1, y1: f(x1), x2, y2: f(x2) };
};

const schluessel = (t: Aufgabe) =>
    t.typ === 'scheitel' ? `s${t.h},${t.k},${t.px},${t.a}` : `p${t.bekannt},${t.a},${t.x1},${t.y1},${t.x2},${t.y2}`;

const mischen = <T,>(arr: T[]) => {
    const kopie = [...arr];
    for (let i = kopie.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [kopie[i], kopie[j]] = [kopie[j], kopie[i]];
    }
    return kopie;
};

const erzeugeAufgaben = (modus: Modus): Aufgabe[] => {
    const gesehen = new Set<string>();
    const bekanntReihenfolge = mischen<Bekannt>(['a', 'b', 'c']);
    let punkteNr = 0;
    return TYPEN[modus].map(typ => {
        const bekannt = bekanntReihenfolge[punkteNr % 3];
        if (typ === 'punkte') punkteNr++;
        let t: Aufgabe;
        do {
            t = typ === 'scheitel' ? erzeugeScheitelAufgabe() : erzeugePunkteAufgabe(bekannt);
        } while (gesehen.has(schluessel(t)));
        gesehen.add(schluessel(t));
        return t;
    });
};

const leereEingaben = (): Eingabe[] => Array.from({ length: ANZAHL_AUFGABEN }, () => ({ a: '', b: '', c: '' }));

const parseZahl = (s: string) => {
    const t = s.trim().replace(/\s+/g, '').replace(/[−–—‐]/g, '-').replace(',', '.').replace(/^\+/, '');
    return t === '' ? NaN : Number(t);
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

// ---------- Lösungsschritte ----------
const schritteScheitel = (t: ScheitelAufgabe): Schritt[] => {
    const { a, b, c, h, k, px, py } = t;
    const d2 = (px - h) ** 2;
    const aTerm = d2 === 1 ? 'a' : `${d2}a`;
    const aMal = a === 1 ? '' : a === -1 ? '-' : `${num(a)} \\cdot `;
    return [
        {
            text: `Scheitelpunkt S(${h}|${k}) in die Scheitelform einsetzen:`,
            formeln: ['y = a \\cdot (x - x_s)^2 + y_s', `y = a \\cdot ${klammer(h)}${summand(k)}`],
        },
        {
            text: `Punkt P(${px}|${py}) einsetzen (x = ${px}, y = ${py}) und nach a auflösen:`,
            formeln: [
                `${num(py)} = a \\cdot (${num(px)} ${h > 0 ? '-' : '+'} ${num(Math.abs(h))})^2${summand(k)}`,
                ...(k === 0 ? [] : [`${num(py)} = ${aTerm}${summand(k)}${minusRechnen(k)}`]),
                ...(d2 === 1 ? [] : [`${num(py - k)} = ${aTerm} \\quad |\\, : ${d2}`]),
                `a = ${num(a)}`,
            ],
        },
        {
            text: 'a einsetzen – damit ist die Funktionsgleichung in Scheitelform bestimmt:',
            formeln: [scheitelForm(a, h, k)],
        },
        {
            text: 'Klammer mit der binomischen Formel auflösen:',
            formeln: [`y = ${aMal}(x^2${summand(-2 * h, 'x')}${summand(h * h)})${summand(k)}`],
        },
        {
            text: 'Ausmultiplizieren und zusammenfassen – fertig ist die allgemeine Form:',
            formeln: [`y = ${vorfaktor(a)}x^2${summand(b, 'x')}${summand(a * h * h)}${summand(k)}`, allgForm(a, b, c)],
        },
    ];
};

const schritteABekannt = (t: PunkteAufgabe): Schritt[] => {
    const { a, b, c, x1, y1, x2, y2 } = t;
    const r1 = y1 - a * x1 * x1;
    const r2 = y2 - a * x2 * x2;
    const bTerm = (x: number) => `${vorfaktor(x)}b`;
    const bSumm = (x: number) => summand(x, 'b');
    const gleichung = (nr: string, x: number, y: number, r: number) => [
        `\\text{${nr}:}\\quad {${num(y)}} = ${num(a)} \\cdot ${kl(x)}^2 + b \\cdot ${kl(x)} + c`,
        `\\text{${nr}:}\\quad {${num(y)}} = ${num(a * x * x)}${bSumm(x)} + c${minusRechnen(a * x * x)}`,
        `\\text{${nr}:}\\quad {${num(r)}} = ${bTerm(x)} + c`,
    ];
    const diff = x1 - x2;
    return [
        {
            text: `Den bekannten Formfaktor a = ${a} in die allgemeine Form einsetzen:`,
            formeln: [`y = ${vorfaktor(a)}x^2 + bx + c`],
        },
        { text: `Punkt P(${x1}|${y1}) einsetzen → Gleichung I:`, formeln: gleichung('I', x1, y1, r1) },
        { text: `Punkt Q(${x2}|${y2}) einsetzen → Gleichung II:`, formeln: gleichung('II', x2, y2, r2) },
        {
            text: 'Gleichung II von Gleichung I abziehen (I − II). Dadurch fällt c weg und du kannst b berechnen:',
            formeln: [
                `${num(r1)} - ${kl(r2)} = ${bTerm(x1)} - ${x2 < 0 ? `(${bTerm(x2)})` : bTerm(x2)}`,
                `${num(r1 - r2)} = ${bTerm(diff)}${diff === 1 ? '' : ` \\quad |\\, : ${kl(diff)}`}`,
                `b = ${num(b)}`,
            ],
        },
        {
            text: 'b in Gleichung I einsetzen und c berechnen:',
            formeln: [
                `${num(r1)} = ${num(x1)} \\cdot ${kl(b)} + c`,
                `${num(r1)} = ${num(x1 * b)} + c${minusRechnen(x1 * b)}`,
                `c = ${num(c)}`,
            ],
        },
        { text: 'a, b und c in die allgemeine Form einsetzen:', formeln: [allgForm(a, b, c)] },
    ];
};

const schritteBBekannt = (t: PunkteAufgabe): Schritt[] => {
    const { a, b, c, x1, y1, x2, y2 } = t;
    const r1 = y1 - b * x1;
    const r2 = y2 - b * x2;
    const gleichung = (nr: string, x: number, y: number, r: number) => [
        `\\text{${nr}:}\\quad {${num(y)}} = a \\cdot ${kl(x)}^2 + ${kl(b)} \\cdot ${kl(x)} + c`,
        `\\text{${nr}:}\\quad {${num(y)}} = ${vorfaktor(x * x)}a${summand(b * x)} + c${minusRechnen(b * x)}`,
        `\\text{${nr}:}\\quad {${num(r)}} = ${vorfaktor(x * x)}a + c`,
    ];
    const diff = x1 * x1 - x2 * x2;
    return [
        {
            text: `Den bekannten Wert b = ${b} in die allgemeine Form einsetzen:`,
            formeln: [`y = ax^2${summand(b, 'x')} + c`],
        },
        { text: `Punkt P(${x1}|${y1}) einsetzen → Gleichung I:`, formeln: gleichung('I', x1, y1, r1) },
        { text: `Punkt Q(${x2}|${y2}) einsetzen → Gleichung II:`, formeln: gleichung('II', x2, y2, r2) },
        {
            text: 'Gleichung II von Gleichung I abziehen (I − II). Dadurch fällt c weg und du kannst a berechnen:',
            formeln: [
                `${num(r1)} - ${kl(r2)} = ${vorfaktor(x1 * x1)}a - ${vorfaktor(x2 * x2)}a`,
                `${num(r1 - r2)} = ${vorfaktor(diff)}a${diff === 1 ? '' : ` \\quad |\\, : ${kl(diff)}`}`,
                `a = ${num(a)}`,
            ],
        },
        {
            text: 'a in Gleichung I einsetzen und c berechnen:',
            formeln: [
                `${num(r1)} = ${num(x1 * x1)} \\cdot ${kl(a)} + c`,
                `${num(r1)} = ${num(x1 * x1 * a)} + c${minusRechnen(x1 * x1 * a)}`,
                `c = ${num(c)}`,
            ],
        },
        { text: 'a, b und c in die allgemeine Form einsetzen:', formeln: [allgForm(a, b, c)] },
    ];
};

const ggT = (m: number, n: number): number => (n === 0 ? Math.abs(m) : ggT(n, m % n));

const schritteCBekannt = (t: PunkteAufgabe): Schritt[] => {
    const { a, b, c, x1, y1, x2, y2 } = t;
    const r1 = y1 - c;
    const r2 = y2 - c;
    // Faktoren, damit vor b in beiden Gleichungen dieselbe Zahl (kgV von |x1| und |x2|) steht
    const kgV = Math.abs(x1 * x2) / ggT(x1, x2);
    const f1 = kgV / x1;
    const f2 = kgV / x2;
    const gleichung = (nr: string, x: number, y: number, r: number) => [
        `\\text{${nr}:}\\quad {${num(y)}} = a \\cdot ${kl(x)}^2 + b \\cdot ${kl(x)}${summand(c)}`,
        `\\text{${nr}:}\\quad {${num(y)}} = ${vorfaktor(x * x)}a${summand(x, 'b')}${summand(c)}${minusRechnen(c)}`,
        `\\text{${nr}:}\\quad {${num(r)}} = ${vorfaktor(x * x)}a${summand(x, 'b')}`,
    ];
    const multipliziert = (nr: string, f: number, x: number, r: number) =>
        f === 1 ? [] : [`\\text{${nr}} \\cdot ${kl(f)}:\\quad {${num(r * f)}} = ${vorfaktor(x * x * f)}a${summand(kgV, 'b')}`];
    const faktorText = [f1 !== 1 ? `Gleichung I mit ${f1}` : '', f2 !== 1 ? `Gleichung II mit ${f2}` : ''].filter(Boolean).join(' und ');
    const koeffA = x1 * x1 * f1 - x2 * x2 * f2;
    const rest = r1 - x1 * x1 * a;
    return [
        {
            text: `Den bekannten Wert c = ${c} in die allgemeine Form einsetzen:`,
            formeln: [`y = ax^2 + bx${summand(c)}`],
        },
        { text: `Punkt P(${x1}|${y1}) einsetzen → Gleichung I:`, formeln: gleichung('I', x1, y1, r1) },
        { text: `Punkt Q(${x2}|${y2}) einsetzen → Gleichung II:`, formeln: gleichung('II', x2, y2, r2) },
        {
            text:
                (faktorText
                    ? `Damit b wegfällt, muss vor b in beiden Gleichungen dieselbe Zahl stehen. Multipliziere dazu ${faktorText}. `
                    : 'Vor b steht in beiden Gleichungen schon dieselbe Zahl. ') +
                'Ziehe dann Gleichung II von Gleichung I ab (I − II) und berechne a:',
            formeln: [
                ...multipliziert('I', f1, x1, r1),
                ...multipliziert('II', f2, x2, r2),
                `\\text{I} - \\text{II}:\\quad {${num(r1 * f1 - r2 * f2)}} = ${vorfaktor(koeffA)}a${koeffA === 1 ? '' : ` \\quad |\\, : ${kl(koeffA)}`}`,
                `a = ${num(a)}`,
            ],
        },
        {
            text: 'a in Gleichung I einsetzen und b berechnen:',
            formeln: [
                `${num(r1)} = ${num(x1 * x1)} \\cdot ${kl(a)}${summand(x1, 'b')}`,
                `${num(r1)} = ${num(x1 * x1 * a)}${summand(x1, 'b')}${minusRechnen(x1 * x1 * a)}`,
                `${num(rest)} = ${vorfaktor(x1)}b${x1 === 1 ? '' : ` \\quad |\\, : ${kl(x1)}`}`,
                `b = ${num(b)}`,
            ],
        },
        { text: 'a, b und c in die allgemeine Form einsetzen:', formeln: [allgForm(a, b, c)] },
    ];
};

// Gleiche aufeinanderfolgende Zeilen (z. B. wenn ein Summand 0 ist) nur einmal zeigen
const ohneDoppelte = (liste: Schritt[]) =>
    liste.map(s => ({ ...s, formeln: s.formeln.filter((f, i, arr) => i === 0 || f !== arr[i - 1]) }));

const schritte = (t: Aufgabe) =>
    ohneDoppelte(
        t.typ === 'scheitel'
            ? schritteScheitel(t)
            : t.bekannt === 'a'
              ? schritteABekannt(t)
              : t.bekannt === 'b'
                ? schritteBBekannt(t)
                : schritteCBekannt(t)
    );

const gegebenePunkte = (t: Aufgabe) =>
    t.typ === 'scheitel'
        ? [
              { x: t.h, y: t.k, label: 'S', farbe: '#dc2626' },
              { x: t.px, y: t.py, label: 'P', farbe: '#16a34a' },
          ]
        : [
              { x: t.x1, y: t.y1, label: 'P', farbe: '#16a34a' },
              { x: t.x2, y: t.y2, label: 'Q', farbe: '#9333ea' },
          ];

// ---------- Funktionsgraph (SVG) ----------
type Punkt = { x: number; y: number; label: string; farbe: string };

const ParabelGraph = ({ a, b, c, punkte }: { a: number; b: number; c: number; punkte: Punkt[] }) => {
    const W = 360;
    const H = 300;
    const R = 26;
    const xs = -b / (2 * a);
    const ys = c - (b * b) / (4 * a);
    const alleX = [...punkte.map(p => p.x), xs, 0];
    const alleY = [...punkte.map(p => p.y), ys, 0];
    const xMin = Math.floor(Math.min(...alleX)) - 2;
    const xMax = Math.ceil(Math.max(...alleX)) + 2;
    const yMin = Math.floor(Math.min(...alleY)) - 2;
    const yMax = Math.ceil(Math.max(...alleY)) + 2;
    const sx = (x: number) => R + ((x - xMin) / (xMax - xMin)) * (W - 2 * R);
    const sy = (y: number) => H - R - ((y - yMin) / (yMax - yMin)) * (H - 2 * R);
    const schrittweite = (spanne: number) => (spanne > 24 ? 5 : spanne > 12 ? 2 : 1);
    const dx = schrittweite(xMax - xMin);
    const dy = schrittweite(yMax - yMin);
    const ticks = (min: number, max: number, d: number) => {
        const out: number[] = [];
        for (let v = Math.ceil(min / d) * d; v <= max; v += d) out.push(v);
        return out;
    };
    const kurve = Array.from({ length: 241 }, (_, i) => {
        const x = xMin + ((xMax - xMin) * i) / 240;
        return `${i === 0 ? 'M' : 'L'}${sx(x).toFixed(1)},${sy(a * x * x + b * x + c).toFixed(1)}`;
    }).join(' ');
    const clipId = `clip-${a}-${b}-${c}-${punkte.map(p => p.label + p.x + p.y).join('')}`.replace(/[^a-zA-Z0-9-]/g, '_');

    return (
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-md mx-auto bg-white rounded-lg border border-gray-200" role="img"
            aria-label={`Graph der Parabel mit den Punkten ${punkte.map(p => `${p.label}(${p.x}|${p.y})`).join(', ')}`}>
            <defs>
                <clipPath id={clipId}>
                    <rect x={R} y={R} width={W - 2 * R} height={H - 2 * R} />
                </clipPath>
            </defs>
            {ticks(xMin, xMax, dx).map(v => (
                <line key={`gx${v}`} x1={sx(v)} x2={sx(v)} y1={R} y2={H - R} stroke="#e5e7eb" strokeWidth={1} />
            ))}
            {ticks(yMin, yMax, dy).map(v => (
                <line key={`gy${v}`} x1={R} x2={W - R} y1={sy(v)} y2={sy(v)} stroke="#e5e7eb" strokeWidth={1} />
            ))}
            <line x1={R} x2={W - R + 8} y1={sy(0)} y2={sy(0)} stroke="#374151" strokeWidth={1.5} />
            <line x1={sx(0)} x2={sx(0)} y1={H - R} y2={R - 8} stroke="#374151" strokeWidth={1.5} />
            <text x={W - R + 6} y={sy(0) - 6} fontSize={12} fill="#374151" fontStyle="italic">x</text>
            <text x={sx(0) + 6} y={R - 4} fontSize={12} fill="#374151" fontStyle="italic">y</text>
            {ticks(xMin, xMax, dx).filter(v => v !== 0).map(v => (
                <text key={`tx${v}`} x={sx(v)} y={sy(0) + 13} fontSize={10} fill="#6b7280" textAnchor="middle">{v}</text>
            ))}
            {ticks(yMin, yMax, dy).filter(v => v !== 0).map(v => (
                <text key={`ty${v}`} x={sx(0) - 5} y={sy(v) + 3} fontSize={10} fill="#6b7280" textAnchor="end">{v}</text>
            ))}
            <path d={kurve} fill="none" stroke="#2563eb" strokeWidth={2.5} clipPath={`url(#${clipId})`} />
            {punkte.map(p => (
                <g key={p.label}>
                    <circle cx={sx(p.x)} cy={sy(p.y)} r={5} fill={p.farbe} stroke="white" strokeWidth={1.5} />
                    <text x={sx(p.x) + 8} y={sy(p.y) - 8} fontSize={13} fontWeight="bold" fill={p.farbe}>
                        {p.label}({p.x}|{p.y})
                    </text>
                </g>
            ))}
        </svg>
    );
};

// ---------- Lösungsweg ----------
const Loesungsweg = ({ t, anzahl, titel }: { t: Aufgabe; anzahl: number; titel?: string }) => {
    const alle = schritte(t);
    const fertig = anzahl >= alle.length;
    return (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-3">{titel ?? (fertig ? 'Lösungsweg' : 'Tipp: Lösungsweg')}</h3>
            <ol className="space-y-3">
                {alle.slice(0, anzahl).map((s, i) => (
                    <li key={i} className="border-l-4 border-blue-300 pl-3">
                        <p className="text-gray-700 font-medium">{i + 1}. Schritt: {s.text}</p>
                        <div className="overflow-x-auto">
                            {s.formeln.map((f, j) => (
                                <BlockMath key={j} math={f} />
                            ))}
                        </div>
                    </li>
                ))}
            </ol>
            {fertig && (
                <p className="mt-3 font-bold text-center bg-blue-100 rounded-md p-2">
                    Ergebnis: a = {t.a}, b = {t.b}, c = {t.c}
                </p>
            )}
        </div>
    );
};

const AufgabenText = ({ t }: { t: Aufgabe }) =>
    t.typ === 'scheitel' ? (
        <span>
            Die Parabel hat den Scheitelpunkt <strong>S({t.h}|{t.k})</strong> und verläuft durch den Punkt <strong>P({t.px}|{t.py})</strong>.
        </span>
    ) : (
        <span>
            {t.bekannt === 'a' ? (
                <>Die Parabel hat den Formfaktor <strong>a = {t.a}</strong></>
            ) : (
                <>
                    Für die Parabel <InlineMath math="y = ax^2 + bx + c" /> gilt <strong>{t.bekannt} = {t[t.bekannt]}</strong>. Sie
                </>
            )}{' '}
            {t.bekannt === 'a' ? 'und verläuft' : 'verläuft'} durch die Punkte <strong>P({t.x1}|{t.y1})</strong> und <strong>Q({t.x2}|{t.y2})</strong>.
        </span>
    );

// ---------- Erklärungen ----------
const Voraussetzung = () => (
    <div className="bg-amber-50 border-l-4 border-amber-500 rounded-md p-4 text-gray-800">
        <p className="font-semibold mb-1">⚠️ Voraussetzung: Additionsverfahren</p>
        <p>
            Für Fall 2 musst du ein lineares Gleichungssystem mit dem <strong>Additionsverfahren</strong> lösen können (Gleichungen
            gegebenenfalls multiplizieren und dann voneinander abziehen, sodass eine Unbekannte wegfällt). Wenn du das noch nicht sicher beherrschst, übe es zuerst noch einmal:{' '}
            <Link to={GLEICHUNGSSYSTEME_PFAD} className="font-semibold text-blue-700 underline hover:text-blue-900">
                Lineare Gleichungssysteme üben
            </Link>
        </p>
    </div>
);

const ErklaerungFall1 = () => (
    <div className="border border-gray-200 rounded-xl p-5">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Fall 1: Scheitelpunkt und ein weiterer Punkt</h2>
        <p className="text-gray-700 mb-3">
            Kennst du den Scheitelpunkt, startest du mit der <strong>Scheitelform</strong>{' '}
            <InlineMath math="y = a \cdot (x - x_s)^2 + y_s" />. Setze den Scheitelpunkt ein. Dann fehlt nur noch <InlineMath math="a" />:
            Dafür setzt du den zweiten Punkt für <InlineMath math="x" /> und <InlineMath math="y" /> ein und löst nach <InlineMath math="a" /> auf.
            Zum Schluss wandelst du die Scheitelform in die allgemeine Form um.
        </p>
        <p className="text-gray-700 mb-3">
            <strong>Beispiel:</strong> Scheitelpunkt <strong>S(2|−1)</strong>, Punkt <strong>P(4|3)</strong>
        </p>
        <ParabelGraph a={BEISPIEL_SCHEITEL.a} b={BEISPIEL_SCHEITEL.b} c={BEISPIEL_SCHEITEL.c} punkte={gegebenePunkte(BEISPIEL_SCHEITEL)} />
        <Loesungsweg t={BEISPIEL_SCHEITEL} anzahl={schritte(BEISPIEL_SCHEITEL).length} titel="Beispiel: Lösungsweg" />
    </div>
);

const ErklaerungFall2 = () => (
    <div className="border border-gray-200 rounded-xl p-5">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Fall 2: Ein Wert (a, b oder c) und zwei Punkte</h2>
        <p className="text-gray-700 mb-3">
            Ist einer der drei Werte bekannt (z. B. „verschobene Normalparabel“ bedeutet <InlineMath math="a = 1" />), setzt du ihn in{' '}
            <InlineMath math="y = ax^2 + bx + c" /> ein. Dann setzt du nacheinander beide Punkte ein und erhältst zwei Gleichungen (I und II)
            mit den zwei noch fehlenden Werten. Dieses Gleichungssystem löst du mit dem <strong>Additionsverfahren</strong>: Ziehst du II von I
            ab, fällt eine Unbekannte weg und du kannst die andere berechnen. Diese setzt du in Gleichung I ein und erhältst den letzten Wert.
        </p>
        <ul className="list-disc pl-5 text-gray-700 mb-3 space-y-1">
            <li><strong><InlineMath math="a" /> bekannt:</strong> Beim Abziehen fällt <InlineMath math="c" /> weg → zuerst <InlineMath math="b" />, dann <InlineMath math="c" />.</li>
            <li><strong><InlineMath math="b" /> bekannt:</strong> Beim Abziehen fällt <InlineMath math="c" /> weg → zuerst <InlineMath math="a" />, dann <InlineMath math="c" />.</li>
            <li>
                <strong><InlineMath math="c" /> bekannt:</strong> Vorher eine oder beide Gleichungen so multiplizieren, dass vor <InlineMath math="b" />{' '}
                dieselbe Zahl steht. Dann fällt beim Abziehen <InlineMath math="b" /> weg → zuerst <InlineMath math="a" />, dann <InlineMath math="b" />.
            </li>
        </ul>
        <p className="text-gray-700 mb-3">
            <strong>Beispiel:</strong> <strong>a = −1</strong>, Punkte <strong>P(1|5)</strong> und <strong>Q(3|1)</strong>
        </p>
        <ParabelGraph a={BEISPIEL_PUNKTE.a} b={BEISPIEL_PUNKTE.b} c={BEISPIEL_PUNKTE.c} punkte={gegebenePunkte(BEISPIEL_PUNKTE)} />
        <Loesungsweg t={BEISPIEL_PUNKTE} anzahl={schritte(BEISPIEL_PUNKTE).length} titel="Beispiel: Lösungsweg" />
    </div>
);

const Lernvideo = () => (
    <section className="mb-10">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">Lernvideo</h2>
        {LERNVIDEO_ID ? (
            <div className="max-w-3xl mx-auto">
                <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
                    <iframe
                        className="absolute inset-0 w-full h-full rounded-lg"
                        src={`https://www.youtube-nocookie.com/embed/${LERNVIDEO_ID}`}
                        title="Lernvideo: Funktionsgleichung aufstellen"
                        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
                </div>
                <a
                    href={`https://www.youtube.com/watch?v=${LERNVIDEO_ID}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-2 text-sm text-blue-700 underline hover:text-blue-900"
                >
                    Video auf YouTube öffnen
                </a>
            </div>
        ) : (
            <p className="text-gray-500 italic bg-gray-50 border border-dashed border-gray-300 rounded-lg p-4 max-w-3xl">
                Das Lernvideo zu diesem Thema folgt in Kürze.
            </p>
        )}
    </section>
);

// ---------- Seite ----------
const FunktionsgleichungAufstellen = () => {
    const [modus, setModus] = useState<Modus>('scheitel');
    const [aufgaben, setAufgaben] = useState<Aufgabe[]>([]);
    const [eingaben, setEingaben] = useState<Eingabe[]>(leereEingaben());
    const [tippSchritte, setTippSchritte] = useState<number[]>(Array(ANZAHL_AUFGABEN).fill(0));

    const neueAufgaben = (m: Modus = modus) => {
        setAufgaben(erzeugeAufgaben(m));
        setEingaben(leereEingaben());
        setTippSchritte(Array(ANZAHL_AUFGABEN).fill(0));
    };

    useEffect(() => {
        neueAufgaben('scheitel');
    }, []);

    const wechsleModus = (m: Modus) => {
        if (m === modus) return;
        setModus(m);
        neueAufgaben(m);
    };

    const setEingabe = (i: number, feld: Feld, wert: string) => {
        setEingaben(prev => prev.map((e, idx) => (idx === i ? { ...e, [feld]: wert } : e)));
    };

    const setTipp = (i: number, wert: number) => {
        setTippSchritte(prev => prev.map((v, idx) => (idx === i ? wert : v)));
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="bg-white p-6 md:p-10 rounded-xl shadow-lg max-w-7xl w-full mx-auto text-left">
                <h1 className="text-3xl font-bold text-gray-800 mb-3">Funktionsgleichung aufstellen</h1>
                <p className="text-gray-700 mb-6">
                    Gesucht ist die Funktionsgleichung einer Parabel in allgemeiner Form <InlineMath math="y = ax^2 + bx + c" />. Du musst also
                    die drei Werte <InlineMath math="a" />, <InlineMath math="b" /> und <InlineMath math="c" /> herausfinden. Je nachdem, was über die Parabel
                    bekannt ist, gehst du unterschiedlich vor. Wähle einen Fall aus:
                </p>

                {/* Auswahl */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8" role="tablist">
                    {MODI.map(m => {
                        const aktiv = m.id === modus;
                        return (
                            <button
                                key={m.id}
                                role="tab"
                                aria-selected={aktiv}
                                onClick={() => wechsleModus(m.id)}
                                className={`rounded-xl border-2 px-4 py-3 text-left transition-colors duration-200 ${
                                    aktiv
                                        ? 'border-blue-600 bg-blue-600 text-white shadow-md'
                                        : 'border-gray-200 bg-white text-gray-800 hover:border-blue-400 hover:bg-blue-50'
                                }`}
                            >
                                <span className="block text-lg font-bold">{m.titel}</span>
                                <span className={`block text-sm ${aktiv ? 'text-blue-100' : 'text-gray-600'}`}>{m.beschreibung}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Erklärung */}
                <section className="space-y-6 mb-8">
                    {modus === 'scheitel' && <ErklaerungFall1 />}
                    {modus === 'punkte' && (
                        <>
                            <Voraussetzung />
                            <ErklaerungFall2 />
                        </>
                    )}
                    {modus === 'gemischt' && (
                        <>
                            <Voraussetzung />
                            <p className="text-gray-700">
                                Hier kommen beide Fälle gemischt vor. Überlege bei jeder Aufgabe zuerst, welcher Fall vorliegt: Ist der{' '}
                                <strong>Scheitelpunkt</strong> gegeben, gehst du wie in <strong>Fall 1</strong> vor. Sind <strong>ein Wert und zwei Punkte</strong>{' '}
                                gegeben, gehst du wie in <strong>Fall 2</strong> vor. Die ausführlichen Erklärungen findest du über die Buttons „Fall 1“ und „Fall 2“.
                            </p>
                        </>
                    )}
                </section>

                <Lernvideo />

                <h2 className="text-xl font-semibold text-gray-800 mb-2">Deine Aufgaben</h2>
                <p className="text-gray-600 mb-6">
                    Bestimme jeweils die Funktionsgleichung in allgemeiner Form <InlineMath math="y = ax^2 + bx + c" />. Rechne zuerst im Heft und trage
                    dann a, b und c ein. Richtige Werte werden sofort grün, falsche rot. Wenn du nicht weiterkommst, zeigt dir „Tipp anzeigen“ den
                    Lösungsweg Schritt für Schritt.
                </p>

                <div className="flex flex-col gap-6">
                    {aufgaben.map((t, i) => {
                        const anzahlSchritte = schritte(t).length;
                        const alleRichtig = (['a', 'b', 'c'] as const).every(f => bewerte(eingaben[i]?.[f] ?? '', t[f]) === 'richtig');
                        return (
                            <div key={i} className="border border-gray-200 rounded-lg p-4">
                                <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded-md mb-4 text-gray-800">
                                    <span className="font-semibold mr-2">Aufgabe {i + 1}:</span>
                                    <AufgabenText t={t} />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-2">
                                    {(['a', 'b', 'c'] as const).map(feld => {
                                        const status = bewerte(eingaben[i]?.[feld] ?? '', t[feld]);
                                        return (
                                            <div key={feld}>
                                                <div className="flex items-center space-x-2">
                                                    <label htmlFor={`${feld}-${i}`} className="text-lg font-medium text-gray-600 whitespace-nowrap">
                                                        {feld} =
                                                    </label>
                                                    <input
                                                        type="text"
                                                        inputMode="decimal"
                                                        id={`${feld}-${i}`}
                                                        value={eingaben[i]?.[feld] ?? ''}
                                                        onChange={(ev: React.ChangeEvent<HTMLInputElement>) => setEingabe(i, feld, ev.target.value)}
                                                        className={`block w-full p-2 border-2 rounded-md shadow-sm ${farbKlasse(status)}`}
                                                    />
                                                </div>
                                                {status === 'vorzeichen' && (
                                                    <p className="mt-1 text-sm text-red-600 font-semibold">Fast! Nur das Vorzeichen ist falsch.</p>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {alleRichtig && (
                                    <div className="mt-3 p-3 bg-green-100 border border-green-400 rounded-md text-green-900 font-semibold">
                                        🎉 {LOB[i % LOB.length]} <InlineMath math={allgForm(t.a, t.b, t.c)} />{' '}
                                        {i < aufgaben.length - 1
                                            ? `Weiter geht's mit Aufgabe ${i + 2}!`
                                            : 'Du hast alle Aufgaben geschafft – klicke unten auf „5 neue Aufgaben“, um weiterzuüben.'}
                                    </div>
                                )}

                                <div className="flex flex-wrap gap-3 mt-3">
                                    {tippSchritte[i] < anzahlSchritte && (
                                        <>
                                            <button
                                                onClick={() => setTipp(i, Math.min(tippSchritte[i] + 1, anzahlSchritte))}
                                                className="bg-yellow-100 text-yellow-900 font-bold py-2 px-5 rounded-lg hover:bg-yellow-200 transition-colors duration-200"
                                            >
                                                {tippSchritte[i] === 0 ? 'Tipp anzeigen' : 'Nächsten Tipp anzeigen'}
                                            </button>
                                            <button
                                                onClick={() => setTipp(i, anzahlSchritte)}
                                                className="bg-gray-200 text-gray-800 font-bold py-2 px-5 rounded-lg hover:bg-gray-300 transition-colors duration-200"
                                            >
                                                Vollständige Lösung anzeigen
                                            </button>
                                        </>
                                    )}
                                </div>

                                {tippSchritte[i] > 0 && <Loesungsweg t={t} anzahl={tippSchritte[i]} />}

                                {(alleRichtig || tippSchritte[i] >= anzahlSchritte) && (
                                    <div className="mt-4">
                                        <p className="text-sm font-semibold text-gray-600 mb-2">Graph zur Kontrolle:</p>
                                        <ParabelGraph a={t.a} b={t.b} c={t.c} punkte={gegebenePunkte(t)} />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="flex justify-center mt-8">
                    <button
                        onClick={() => neueAufgaben()}
                        className="bg-gray-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-gray-700 transition-colors duration-200"
                    >
                        5 neue Aufgaben
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FunktionsgleichungAufstellen;

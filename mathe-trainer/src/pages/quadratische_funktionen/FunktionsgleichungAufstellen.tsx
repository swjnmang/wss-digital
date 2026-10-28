import React, { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import TaskShell from '../../components/layout/TaskShell'
import { VideoEmbed } from '../../components/VideoButton'
import GleichungEingabe from '../../components/GleichungEingabe';
import { fieldCheckClass } from '../../utils/fieldCheck';
import { checkQuadraticEquation } from '../../utils/parseFunctionEquation';

// Typ 1: Scheitelpunkt S(h|k) und ein weiterer Punkt P gegeben
type ScheitelAufgabe = { typ: 'scheitel'; a: number; b: number; c: number; h: number; k: number; px: number; py: number };
// Typ 2: einer der Werte a, b oder c und zwei Punkte P, Q gegeben
type Bekannt = 'a' | 'b' | 'c';
type PunkteAufgabe = { typ: 'punkte'; bekannt: Bekannt; a: number; b: number; c: number; x1: number; y1: number; x2: number; y2: number };
type Aufgabe = ScheitelAufgabe | PunkteAufgabe;

/** Die vollständig eingetippten Gleichungen in Scheitelform und allgemeiner Form */
type Form = 'scheitel' | 'allgemein';
type Eingabe = Record<Form, string>;
const FORMEN: { form: Form; label: string; placeholder: string }[] = [
    { form: 'scheitel', label: 'Scheitelform', placeholder: 'z. B. y = 2(x − 1)² + 3' },
    { form: 'allgemein', label: 'Allgemeine Form', placeholder: 'z. B. y = 2x² − 4x + 5' },
];
/** Fall 1: Scheitelform und allgemeine Form, Fall 2: nur die allgemeine Form */
const formenFuer = (t: Aufgabe) => (t.typ === 'scheitel' ? FORMEN : FORMEN.filter(f => f.form === 'allgemein'));
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
// Lernvideos je Fall (Fall 3 = gemischt hat kein eigenes Video)
export const LERNVIDEO_FALL1 = 'xgiAK3rLCow';
export const LERNVIDEO_FALL2 = 'hg9QipwqXxI';
const GLEICHUNGSSYSTEME_PFAD = '/lineare_funktionen/gleichungssysteme?verfahren=addieren';

const BEISPIEL_SCHEITEL: ScheitelAufgabe = { typ: 'scheitel', a: 1, b: -4, c: 3, h: 2, k: -1, px: 4, py: 3 };
const BEISPIEL_PUNKTE: PunkteAufgabe = { typ: 'punkte', bekannt: 'a', a: -1, b: 2, c: 4, x1: 2, y1: 4, x2: 3, y2: 1 };

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
    // Über einen ganzzahligen Scheitelpunkt erzeugt, damit a, b und c glatte Zahlen sind
    for (;;) {
        const a = auswahl([1, -1, 2, -2]);
        const h = zufall(-3, 3);
        const k = zufall(-6, 6);
        const b = -2 * a * h;
        const c = a * h * h + k;
        // Der bekannte Wert ist nie 0, sonst wäre die Angabe nichtssagend
        if ((bekannt === 'b' && b === 0) || (bekannt === 'c' && c === 0) || Math.abs(c) > 10) continue;
        // Keiner der gegebenen Punkte ist der Scheitelpunkt (x ≠ h)
        const xWerte = [-3, -2, -1, 1, 2, 3].filter(x => x !== h);
        const x1 = auswahl(xWerte);
        // Bei bekanntem b muss x2 ≠ -x1 sein, sonst fällt beim Abziehen auch a weg
        const x2 = auswahl(xWerte.filter(x => x !== x1 && (bekannt !== 'b' || x !== -x1)));
        const f = (x: number) => a * x * x + b * x + c;
        if (Math.abs(f(x1)) > 25 || Math.abs(f(x2)) > 25) continue;
        return { typ: 'punkte', bekannt, a, b, c, x1, y1: f(x1), x2, y2: f(x2) };
    }
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

const leereEingaben = (): Eingabe[] => Array.from({ length: ANZAHL_AUFGABEN }, () => ({ scheitel: '', allgemein: '' }));

const pruefeGleichung = (eingabe: string, t: Aufgabe, form: Form) => checkQuadraticEquation(eingabe, { a: t.a, b: t.b, c: t.c }, form, 1e-6);

// ---------- Lösungsschritte ----------
const schritteScheitel = (t: ScheitelAufgabe): Schritt[] => {
    const { a, b, c, h, k, px, py } = t;
    const d2 = (px - h) ** 2;
    const aTerm = d2 === 1 ? 'a' : `${d2}a`;
    const aMal = a === 1 ? '' : a === -1 ? '-' : `${num(a)} \\cdot `;
    const faktor = `(x ${h > 0 ? '-' : '+'} ${num(Math.abs(h))})`;
    return [
        {
            text: `Scheitelpunkt S(${h}|${k}) in die Scheitelform einsetzen:`,
            formeln: ['y = a(x - x_S)^2 + y_S', `y = a \\cdot ${klammer(h)}${summand(k)}`],
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
            text: 'Quadrat als Produkt zweier Klammern schreiben und ausmultiplizieren (jeder Summand der ersten Klammer mal jeder Summand der zweiten Klammer):',
            formeln: [
                `${klammer(h)} = ${faktor} \\cdot ${faktor}`,
                `= x \\cdot x + x \\cdot ${kl(-h)} + ${kl(-h)} \\cdot x + ${kl(-h)} \\cdot ${kl(-h)}`,
                `= x^2${summand(-h, 'x')}${summand(-h, 'x')}${summand(h * h)}`,
                `= x^2${summand(-2 * h, 'x')}${summand(h * h)}`,
            ],
        },
        {
            text: 'Das Ergebnis in die Scheitelform einsetzen (Klammer bleibt stehen):',
            formeln: [`y = ${aMal}(x^2${summand(-2 * h, 'x')}${summand(h * h)})${summand(k)}`],
        },
        {
            text: 'Klammer mit a ausmultiplizieren und zusammenfassen – fertig ist die allgemeine Form:',
            formeln: [`y = ${vorfaktor(a)}x^2${summand(b, 'x')}${summand(a * h * h)}${summand(k)}`, allgForm(a, b, c)],
        },
    ];
};

// ---------- Lineares Gleichungssystem darstellen ----------
// Zeile eines Gleichungssystems: Bezeichnung (TeX), linke Seite, rechte Seite, Umformung; 'strich' = Strich vor dem Ergebnis
type LgsZeile = [string, string, string, string?];
const lgs = (zeilen: (LgsZeile | 'strich')[]) => {
    const rows: string[] = [];
    let strich = false;
    for (const z of zeilen) {
        if (z === 'strich') {
            strich = true;
            continue;
        }
        rows.push(`${strich ? '\\hline ' : ''}${z[0]} & ${z[1]} & = & ${z[2]} & ${z[3] ?? ''}`);
        strich = false;
    }
    return `\\begin{array}{lrcll} ${rows.join(' \\\\ ')} \\end{array}`;
};
const I = '\\text{I:}';
const II = '\\text{II:}';
// Umformung hinter der Gleichung, z. B. "| : 3"
const umf = (s: string) => `\\quad |\\, ${s}`;
// Zahl auf die andere Seite bringen: "| − 3" bzw. "| + 3" (leer bei 0)
const weg = (n: number) => (n === 0 ? '' : umf(`${n > 0 ? '-' : '+'}\\, ${num(Math.abs(n))}`));
// Durch den Vorfaktor teilen (leer bei 1)
const teilen = (n: number) => (n === 1 ? '' : umf(`: ${kl(n)}`));
// Term aus Vorfaktor und Unbekannter, z. B. "3b", "-b"
const tm = (k: number, v: string) => `${vorfaktor(k)}${v}`;

// a bekannt (Unbekannte b, c) oder b bekannt (Unbekannte a, c): I: k1·u + c = r1, II: k2·u + c = r2
const schritteCFaelltWeg = (t: PunkteAufgabe, u: 'a' | 'b', k1: number, k2: number, r1: number, r2: number): Schritt[] => {
    const wert = t[u];
    const diff = k1 - k2;
    const prod = k1 * wert;
    return [
        {
            text:
                `Die Gleichungen I und II bilden ein lineares Gleichungssystem mit den zwei Unbekannten ${u} und c. ` +
                `Schreibe es geordnet untereinander: die Unbekannten links (gleiche Unbekannte genau untereinander), die Zahl rechts. ` +
                `Vor c steht in beiden Gleichungen dieselbe Zahl, nämlich 1. Ziehst du deshalb Gleichung II von Gleichung I ab (I − II), ` +
                `fällt c weg (c − c = 0). Du rechnest spaltenweise: ${u} minus ${u}, c minus c und rechts Zahl minus Zahl. ` +
                `Übrig bleibt eine Gleichung mit nur einer Unbekannten, die du nach ${u} auflöst:`,
            formeln: [
                lgs([
                    [I, `${tm(k1, u)} + c`, num(r1)],
                    [II, `${tm(k2, u)} + c`, num(r2)],
                    'strich',
                    ['\\text{I} - \\text{II:}', `${tm(k1, u)} - (${tm(k2, u)}) + c - c`, `${num(r1)} - ${kl(r2)}`],
                    ['', tm(diff, u), num(r1 - r2), teilen(diff)],
                    ['', u, num(wert)],
                ]),
            ],
        },
        {
            text: `${u} = ${num(wert).replace('{,}', ',')} in Gleichung I einsetzen und nach c auflösen:`,
            formeln: [
                lgs([
                    [I, `${tm(k1, u)} + c`, num(r1)],
                    ['', `${num(k1)} \\cdot ${kl(wert)} + c`, num(r1)],
                    ['', `${num(prod)} + c`, num(r1), weg(prod)],
                    ['', 'c', num(t.c)],
                ]),
            ],
        },
    ];
};

const schritteABekannt = (t: PunkteAufgabe): Schritt[] => {
    const { a, b, c, x1, y1, x2, y2 } = t;
    const r1 = y1 - a * x1 * x1;
    const r2 = y2 - a * x2 * x2;
    const bSumm = (x: number) => summand(x, 'b');
    const gleichung = (nr: string, x: number, y: number, r: number) => [
        `\\text{${nr}:}\\quad {${num(y)}} = ${num(a)} \\cdot ${kl(x)}^2 + b \\cdot ${kl(x)} + c`,
        `\\text{${nr}:}\\quad {${num(y)}} = ${num(a * x * x)}${bSumm(x)} + c${minusRechnen(a * x * x)}`,
        `\\text{${nr}:}\\quad {${num(r)}} = ${tm(x, 'b')} + c`,
    ];
    return [
        {
            text: `Den bekannten Formfaktor a = ${a} in die allgemeine Form einsetzen:`,
            formeln: [`y = ${vorfaktor(a)}x^2 + bx + c`],
        },
        { text: `Punkt P(${x1}|${y1}) einsetzen → Gleichung I:`, formeln: gleichung('I', x1, y1, r1) },
        { text: `Punkt Q(${x2}|${y2}) einsetzen → Gleichung II:`, formeln: gleichung('II', x2, y2, r2) },
        ...schritteCFaelltWeg(t, 'b', x1, x2, r1, r2),
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
    return [
        {
            text: `Den bekannten Wert b = ${b} in die allgemeine Form einsetzen:`,
            formeln: [`y = ax^2${summand(b, 'x')} + c`],
        },
        { text: `Punkt P(${x1}|${y1}) einsetzen → Gleichung I:`, formeln: gleichung('I', x1, y1, r1) },
        { text: `Punkt Q(${x2}|${y2}) einsetzen → Gleichung II:`, formeln: gleichung('II', x2, y2, r2) },
        ...schritteCFaelltWeg(t, 'a', x1 * x1, x2 * x2, r1, r2),
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
    const links = (x: number, f: number) => `${tm(x * x * f, 'a')}${summand(x * f, 'b')}`;
    const name = (nr: string, f: number) => (f === 1 ? `\\text{${nr}}` : `\\text{${nr}} \\cdot ${kl(f)}`);
    const zahlText = (n: number) => (n < 0 ? `(−${-n})` : String(n));
    const faktorText = [f1 !== 1 ? `Gleichung I mit ${zahlText(f1)}` : '', f2 !== 1 ? `Gleichung II mit ${zahlText(f2)}` : ''].filter(Boolean).join(' und ');
    const A1 = x1 * x1 * f1;
    const A2 = x2 * x2 * f2;
    const koeffA = A1 - A2;
    const prod = x1 * x1 * a;
    const rest = r1 - prod;
    return [
        {
            text: `Den bekannten Wert c = ${c} in die allgemeine Form einsetzen:`,
            formeln: [`y = ax^2 + bx${summand(c)}`],
        },
        { text: `Punkt P(${x1}|${y1}) einsetzen → Gleichung I:`, formeln: gleichung('I', x1, y1, r1) },
        { text: `Punkt Q(${x2}|${y2}) einsetzen → Gleichung II:`, formeln: gleichung('II', x2, y2, r2) },
        {
            text:
                'Die Gleichungen I und II bilden ein lineares Gleichungssystem mit den zwei Unbekannten a und b. ' +
                'Schreibe es geordnet untereinander: die Unbekannten links (gleiche Unbekannte genau untereinander), die Zahl rechts. ' +
                'Damit beim Abziehen eine Unbekannte wegfällt, muss vor ihr in beiden Gleichungen dieselbe Zahl stehen. ' +
                `Vor b stehen ${zahlText(x1)} und ${zahlText(x2)}. Multipliziere deshalb ${faktorText}, dann steht vor b in beiden Gleichungen ${kgV}. ` +
                'Wichtig: Jede Zahl auf beiden Seiten der Gleichung wird multipliziert.',
            formeln: [
                lgs([
                    [I, links(x1, 1), num(r1), f1 === 1 ? '' : umf(`\\cdot ${kl(f1)}`)],
                    [II, links(x2, 1), num(r2), f2 === 1 ? '' : umf(`\\cdot ${kl(f2)}`)],
                ]),
                lgs([
                    [`${name('I', f1)}:`, links(x1, f1), num(r1 * f1)],
                    [`${name('II', f2)}:`, links(x2, f2), num(r2 * f2)],
                ]),
            ],
        },
        {
            text:
                `Jetzt steht vor b in beiden Gleichungen ${kgV}. Ziehe die zweite Gleichung von der ersten ab: ` +
                'Du rechnest spaltenweise a minus a, b minus b und rechts Zahl minus Zahl. Dadurch fällt b weg und du kannst a berechnen:',
            formeln: [
                lgs([
                    [`${name('I', f1)}:`, links(x1, f1), num(r1 * f1)],
                    [`${name('II', f2)}:`, links(x2, f2), num(r2 * f2)],
                    'strich',
                    [`${name('I', f1)} - ${name('II', f2)}:`, `${tm(A1, 'a')} - (${tm(A2, 'a')}) + ${tm(kgV, 'b')} - ${tm(kgV, 'b')}`, `${num(r1 * f1)} - ${kl(r2 * f2)}`],
                    ['', tm(koeffA, 'a'), num(r1 * f1 - r2 * f2), teilen(koeffA)],
                    ['', 'a', num(a)],
                ]),
            ],
        },
        {
            text: `a = ${num(a).replace('{,}', ',')} in Gleichung I einsetzen und nach b auflösen:`,
            formeln: [
                lgs([
                    [I, links(x1, 1), num(r1)],
                    ['', `${num(x1 * x1)} \\cdot ${kl(a)}${summand(x1, 'b')}`, num(r1)],
                    ['', `${num(prod)}${summand(x1, 'b')}`, num(r1), weg(prod)],
                    ['', tm(x1, 'b'), num(rest), teilen(x1)],
                    ['', 'b', num(b)],
                ]),
            ],
        },
        { text: 'a, b und c in die allgemeine Form einsetzen:', formeln: [allgForm(a, b, c)] },
    ];
};

// Gleiche aufeinanderfolgende Zeilen (z. B. wenn ein Summand 0 ist) nur einmal zeigen
const ohneDoppelte = (liste: Schritt[]) =>
    liste.map(s => ({ ...s, formeln: s.formeln.filter((f, i, arr) => i === 0 || f !== arr[i - 1]) }));

// Fall 2 endet mit der allgemeinen Form (kein Scheitelpunkt, keine Scheitelform)
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
                <div className="mt-3 font-bold text-center bg-blue-100 rounded-md p-2 space-y-1">
                    {t.typ === 'scheitel' && <p>Scheitelform: <InlineMath math={scheitelForm(t.a, t.h, t.k)} /></p>}
                    <p>Allgemeine Form: <InlineMath math={allgForm(t.a, t.b, t.c)} /></p>
                </div>
            )}
        </div>
    );
};

const AufgabenText = ({ t }: { t: Aufgabe }) => {
    const [p1, p2] = gegebenePunkte(t).map(p => `${p.label}(${p.x}|${p.y})`);
    return (
        <span>
            {t.typ === 'scheitel' ? (
                <>Der Punkt <strong>S</strong> ist der Scheitelpunkt der Parabel.</>
            ) : t.bekannt === 'a' ? (
                <>Die Parabel hat den Formfaktor <strong>a = {t.a}</strong>.</>
            ) : (
                <>Für die Parabel <InlineMath math="y = ax^2 + bx + c" /> gilt <strong>{t.bekannt} = {t[t.bekannt]}</strong>.</>
            )}{' '}
            {t.typ === 'scheitel' ? (
                <>
                    Bestimme rechnerisch die Funktionsgleichung, die durch die Punkte <strong>{p1}</strong> und <strong>{p2}</strong> geht, in{' '}
                    <strong>Scheitelform</strong>. Berechne anschließend die dazugehörige <strong>allgemeine Form</strong>.
                </>
            ) : (
                <>
                    Bestimme rechnerisch die Funktionsgleichung der Parabel, die durch die Punkte <strong>{p1}</strong> und <strong>{p2}</strong> geht, in{' '}
                    <strong>allgemeiner Form</strong> <InlineMath math="y = ax^2 + bx + c" />.
                </>
            )}
        </span>
    );
};

// ---------- Erklärungen ----------
const Voraussetzung = () => (
    <div className="bg-amber-50 border-l-4 border-amber-500 rounded-md p-4 text-gray-800">
        <p className="font-semibold mb-1">⚠️ Voraussetzung: Additions- und Subtraktionsverfahren</p>
        <p>
            Für Fall 2 musst du ein lineares Gleichungssystem mit dem <strong>Additions- und Subtraktionsverfahren</strong> lösen können (Gleichungen
            gegebenenfalls multiplizieren und dann voneinander abziehen, sodass eine Unbekannte wegfällt). Wenn du das noch nicht sicher beherrschst, übe es zuerst noch einmal:{' '}
            <Link to={GLEICHUNGSSYSTEME_PFAD} className="font-semibold text-blue-700 underline hover:text-blue-900">
                Lineare Gleichungssysteme üben
            </Link>
        </p>
    </div>
);

export const ErklaerungFall1 = () => (
    <div className="border border-gray-200 rounded-xl p-5">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Fall 1: Scheitelpunkt und ein weiterer Punkt</h2>
        <p className="text-gray-700 mb-3">
            Kennst du den Scheitelpunkt, startest du mit der <strong>Scheitelform</strong>{' '}
            <InlineMath math="y = a(x - x_S)^2 + y_S" />. Setze den Scheitelpunkt ein. Dann fehlt nur noch <InlineMath math="a" />:
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

export const ErklaerungFall2 = () => (
    <div className="border border-gray-200 rounded-xl p-5">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Fall 2: Ein Wert (a, b oder c) und zwei Punkte</h2>
        <p className="text-gray-700 mb-3">
            Ist einer der drei Werte bekannt (z. B. „verschobene Normalparabel“ bedeutet <InlineMath math="a = 1" />), setzt du ihn in{' '}
            <InlineMath math="y = ax^2 + bx + c" /> ein. Dann setzt du nacheinander beide Punkte ein und erhältst zwei Gleichungen (I und II)
            mit den zwei noch fehlenden Werten. Dieses Gleichungssystem löst du mit dem <strong>Additions- und Subtraktionsverfahren</strong>: Ziehst du II von I
            ab, fällt eine Unbekannte weg und du kannst die andere berechnen. Diese setzt du in Gleichung I ein und erhältst den letzten Wert.
            Zum Schluss setzt du <InlineMath math="a" />, <InlineMath math="b" /> und <InlineMath math="c" /> in die allgemeine Form ein.
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
            <strong>Beispiel:</strong> <strong>a = −1</strong>, Punkte <strong>P(2|4)</strong> und <strong>Q(3|1)</strong>
        </p>
        <ParabelGraph a={BEISPIEL_PUNKTE.a} b={BEISPIEL_PUNKTE.b} c={BEISPIEL_PUNKTE.c} punkte={gegebenePunkte(BEISPIEL_PUNKTE)} />
        <Loesungsweg t={BEISPIEL_PUNKTE} anzahl={schritte(BEISPIEL_PUNKTE).length} titel="Beispiel: Lösungsweg" />
    </div>
);

export const Lernvideo = ({ id, fall }: { id: string; fall: string }) => (
    <section className="mb-10">
        <h2 className="text-xl font-semibold text-gray-800 mb-3">Lernvideo zu {fall}</h2>
        {id ? (
            <div className="max-w-3xl mx-auto text-center">
                <VideoEmbed src={`https://www.youtube-nocookie.com/embed/${id}`} title={`Lernvideo: Funktionsgleichung aufstellen – ${fall}`} />
                <a
                    href={`https://www.youtube.com/watch?v=${id}`}
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
// Startfall über die URL wählbar, z. B. ?fall=punkte (Weiter-Button der Lernsituation 2)
const istModus = (v: string | null): v is Modus => v === 'scheitel' || v === 'punkte' || v === 'gemischt';

const FunktionsgleichungAufstellen = () => {
    const [params] = useSearchParams();
    const startModus = params.get('fall');
    const [modus, setModus] = useState<Modus>(istModus(startModus) ? startModus : 'scheitel');
    const [aufgaben, setAufgaben] = useState<Aufgabe[]>([]);
    const [eingaben, setEingaben] = useState<Eingabe[]>(leereEingaben());
    const [tippSchritte, setTippSchritte] = useState<number[]>(Array(ANZAHL_AUFGABEN).fill(0));
    // Eingabe, die nach einer Tipp-Pause bewertet wurde: Erst dann wird eine falsche Gleichung rot
    const [bewertet, setBewertet] = useState<Eingabe[]>(leereEingaben());
    const timer = useRef<Record<string, number>>({});

    const neueAufgaben = (m: Modus = modus) => {
        setAufgaben(erzeugeAufgaben(m));
        setEingaben(leereEingaben());
        setBewertet(leereEingaben());
        setTippSchritte(Array(ANZAHL_AUFGABEN).fill(0));
    };

    useEffect(() => {
        neueAufgaben(modus);
    }, []);

    const wechsleModus = (m: Modus) => {
        if (m === modus) return;
        setModus(m);
        neueAufgaben(m);
    };

    const setEingabe = (i: number, form: Form, wert: string) => {
        setEingaben(prev => prev.map((e, idx) => (idx === i ? { ...e, [form]: wert } : e)));
        window.clearTimeout(timer.current[`${i}${form}`]);
        timer.current[`${i}${form}`] = window.setTimeout(() => bewerte(i, form, wert), 1200);
    };

    const bewerte = (i: number, form: Form, wert: string) => {
        window.clearTimeout(timer.current[`${i}${form}`]);
        setBewertet(prev => prev.map((e, idx) => (idx === i ? { ...e, [form]: wert } : e)));
    };

    /** richtig sofort, falsch erst nach der Tipp-Pause (bzw. beim Verlassen des Feldes) */
    const zustand = (i: number, form: Form): { richtig: boolean; fehler: string } => {
        const e = eingaben[i]?.[form] ?? '';
        if (!aufgaben[i] || e.trim() === '') return { richtig: false, fehler: '' };
        const r = pruefeGleichung(e, aufgaben[i], form);
        if (r.status === 'ok') return { richtig: true, fehler: '' };
        return { richtig: false, fehler: bewertet[i]?.[form] === e ? r.text : '' };
    };

    const setTipp = (i: number, wert: number) => {
        setTippSchritte(prev => prev.map((v, idx) => (idx === i ? wert : v)));
    };

    return (
        <TaskShell
            title="Funktionsgleichung aufstellen üben"
            width="wide"
            parent={{ to: '/quadratische_funktionen/funktionsgleichung_aufstellen', label: 'Funktionsgleichung aufstellen' }}
        >
        <div className="container">
            <div className="bk-panel max-w-7xl w-full mx-auto text-left">
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

                {modus === 'scheitel' && <Lernvideo id={LERNVIDEO_FALL1} fall="Fall 1" />}
                {modus === 'punkte' && <Lernvideo id={LERNVIDEO_FALL2} fall="Fall 2" />}

                <h2 className="text-xl font-semibold text-gray-800 mb-2">Deine Aufgaben</h2>
                <p className="text-gray-600 mb-6">
                    {modus === 'punkte' ? (
                        <>
                            Bestimme jeweils die Funktionsgleichung in allgemeiner Form <InlineMath math="y = ax^2 + bx + c" />. Rechne zuerst im Heft und tippe
                            dann die Gleichung vollständig ein, z. B. y = 2x² − 4x + 5.
                        </>
                    ) : (
                        <>
                            Bestimme {modus === 'gemischt' ? 'bei Fall 1' : 'jeweils'} die Funktionsgleichung in Scheitelform{' '}
                            <InlineMath math="y = a(x - x_S)^2 + y_S" /> und in allgemeiner Form <InlineMath math="y = ax^2 + bx + c" />
                            {modus === 'gemischt' ? ', bei Fall 2 nur in allgemeiner Form' : ''}. Rechne zuerst im Heft und tippe dann die Gleichungen vollständig
                            ein, z. B. y = 2(x − 1)² + 3 und y = 2x² − 4x + 5.
                        </>
                    )}{' '}
                    Eine richtige Gleichung wird sofort grün, eine falsche nach kurzer Pause rot. Wenn du nicht weiterkommst, zeigt dir
                    „Tipp anzeigen“ den Lösungsweg Schritt für Schritt.
                </p>

                <div className="flex flex-col gap-6">
                    {aufgaben.map((t, i) => {
                        const anzahlSchritte = schritte(t).length;
                        const felder = formenFuer(t).map(f => ({ ...f, ...zustand(i, f.form) }));
                        const alleRichtig = felder.every(f => f.richtig);
                        return (
                            <div key={i} className="border border-gray-200 rounded-lg p-4">
                                <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] items-start">
                                    <div>
                                        <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded-md mb-4 text-gray-800">
                                            <span className="font-semibold mr-2">Aufgabe {i + 1}:</span>
                                            <AufgabenText t={t} />
                                        </div>

                                        {felder.map(f => (
                                            <div key={f.form} className="mb-3">
                                                <label htmlFor={`gl-${i}-${f.form}`} className="block text-sm font-semibold text-gray-700 mb-1">
                                                    {f.label}:
                                                </label>
                                                <GleichungEingabe
                                                    quadratisch
                                                    id={`gl-${i}-${f.form}`}
                                                    value={eingaben[i]?.[f.form] ?? ''}
                                                    onChange={v => setEingabe(i, f.form, v)}
                                                    onBlur={v => bewerte(i, f.form, v)}
                                                    placeholder={f.placeholder}
                                                    ariaLabel={`Funktionsgleichung in ${f.form === 'scheitel' ? 'Scheitelform' : 'allgemeiner Form'}`}
                                                    className={fieldCheckClass(f.richtig ? true : f.fehler ? false : null)}
                                                />
                                                {f.fehler && <p className="mt-1 text-sm text-red-600 font-semibold">{f.fehler}</p>}
                                            </div>
                                        ))}
                                    </div>
                                    <ParabelGraph a={t.a} b={t.b} c={t.c} punkte={gegebenePunkte(t)} />
                                </div>

                                {alleRichtig && (
                                    <div className="mt-3 p-3 bg-green-100 border border-green-400 rounded-md text-green-900 font-semibold">
                                        🎉 {LOB[i % LOB.length]}{' '}
                                        {t.typ === 'scheitel' && (
                                            <>
                                                <InlineMath math={scheitelForm(t.a, t.h, t.k)} /> bzw.{' '}
                                            </>
                                        )}
                                        <InlineMath math={allgForm(t.a, t.b, t.c)} />{' '}
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

                            </div>
                        );
                    })}
                </div>

                <div className="flex justify-center mt-8">
                    <button
                        onClick={() => neueAufgaben()}
                        className="bk-btn"
                    >
                        5 neue Aufgaben
                    </button>
                </div>
            </div>
        </div>
        </TaskShell>
    );
};

export default FunktionsgleichungAufstellen;

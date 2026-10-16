// ============================================================================
// Ausklammern / Faktorisieren: Aufgaben-Generator, KaTeX-Formatierung und Prüfung
// ============================================================================

import {
  type Monom,
  type Poly,
  monom,
  mulMonoms,
  mulPolys,
  simplifyPoly,
  parseExpression,
  polysEquivalent,
  varKey,
} from '../terme/termAlgebra';

export type StufeId = 1 | 2 | 3 | 4;

export interface Stufe {
  id: StufeId;
  name: string;
  beschreibung: string;
}

export const STUFEN: Stufe[] = [
  { id: 1, name: 'Stufe 1: Zahlen ausklammern', beschreibung: 'Klammere den größten gemeinsamen Zahlenfaktor (ggT) aus.' },
  { id: 2, name: 'Stufe 2: Variablen ausklammern', beschreibung: 'Klammere Zahl und Variable aus, die in allen Summanden vorkommen.' },
  { id: 3, name: 'Stufe 3: Potenzen & mehrere Variablen', beschreibung: 'Drei Summanden, mehrere Variablen und Potenzen – klammere so viel wie möglich aus.' },
  { id: 4, name: 'Stufe 4: Klammern ausklammern', beschreibung: 'Der gemeinsame Faktor ist eine ganze Klammer.' },
];

export interface Aufgabe {
  id: string;
  stufe: StufeId;
  /** Aufgabe als KaTeX */
  aufgabeTex: string;
  /** ausmultiplizierte Form zum Vergleich */
  original: Poly;
  /** Musterlösung als KaTeX */
  loesungTex: string;
  /** Rechenweg, jede Zeile KaTeX (Text in \text{…}) */
  rechenweg: string[];
}

// ----------------------------------------------------------------------------
// Hilfen
// ----------------------------------------------------------------------------

const randInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const choice = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

function ggT(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a;
}

const ggTListe = (zahlen: number[]) => zahlen.reduce((g, z) => ggT(g, z), 0);

function pickVars(n: number): string[] {
  const pool = choice([['x', 'y'], ['a', 'b'], ['m', 'n'], ['r', 's']]);
  return pool.slice(0, n);
}

/** Größter gemeinsamer Faktor (Zahl und Variablen) aller Summanden */
export function gemeinsamerFaktor(p: Poly): Monom {
  const coeff = ggTListe(p.map((m) => Math.round(m.coeff)));
  const vars: Record<string, number> = {};
  const alle = new Set(p.flatMap((m) => Object.keys(m.vars)));
  for (const v of alle) {
    const e = Math.min(...p.map((m) => m.vars[v] ?? 0));
    if (e > 0) vars[v] = e;
  }
  return monom(coeff, vars);
}

/** Polynom ist „primitiv“: kein gemeinsamer Zahlen- oder Variablenfaktor mehr */
function istPrimitiv(p: Poly): boolean {
  const f = gemeinsamerFaktor(p);
  return f.coeff === 1 && varKey(f.vars) === '';
}

// ----------------------------------------------------------------------------
// KaTeX-Formatierung
// ----------------------------------------------------------------------------

function varsTex(vars: Record<string, number>): string {
  return Object.keys(vars)
    .filter((v) => vars[v] > 0)
    .sort()
    .map((v) => (vars[v] === 1 ? v : `${v}^{${vars[v]}}`))
    .join('');
}

/** Betrag eines Monoms als KaTeX (ohne Vorzeichen) */
function absMonomTex(m: Monom): string {
  const vt = varsTex(m.vars);
  const c = Math.abs(m.coeff);
  if (!vt) return String(c);
  return c === 1 ? vt : `${c}${vt}`;
}

export function monomTex(m: Monom): string {
  return (m.coeff < 0 ? '-' : '') + absMonomTex(m);
}

/** Summanden in gegebener Reihenfolge als KaTeX */
export function polyTex(p: Poly): string {
  return p
    .map((m, i) => {
      const body = absMonomTex(m);
      if (i === 0) return (m.coeff < 0 ? '-' : '') + body;
      return (m.coeff < 0 ? ' - ' : ' + ') + body;
    })
    .join('');
}

/** Faktor vor einer Klammer: 1 → nichts, −1 → „−“ */
function faktorTex(m: Monom): string {
  const isZahl = varKey(m.vars) === '';
  if (isZahl && m.coeff === 1) return '';
  if (isZahl && m.coeff === -1) return '-';
  return monomTex(m);
}

// ----------------------------------------------------------------------------
// Generatoren
// ----------------------------------------------------------------------------

let zaehler = 0;
const neueId = () => `t${Date.now()}_${zaehler++}`;

/** Zufälliges primitives Polynom aus `n` verschiedenen Summanden */
function zufallsKlammer(
  n: number,
  bausteine: Record<string, number>[],
  maxKoeff: number,
  mitKonstante: boolean,
): Poly {
  for (let guard = 0; guard < 500; guard++) {
    const auswahl: Record<string, number>[] = [];
    const pool = [...bausteine];
    if (mitKonstante) auswahl.push({});
    while (auswahl.length < n && pool.length) {
      const i = Math.floor(Math.random() * pool.length);
      auswahl.push(pool.splice(i, 1)[0]);
    }
    if (auswahl.length < n) continue;
    // nach Grad absteigend sortieren, Konstante zuletzt
    const grad = (v: Record<string, number>) => Object.values(v).reduce((s, e) => s + e, 0);
    auswahl.sort((a, b) => grad(b) - grad(a));
    const p: Poly = auswahl.map((vars, i) => {
      const c = randInt(1, maxKoeff);
      const neg = i > 0 && Math.random() < 0.45;
      return monom(neg ? -c : c, vars);
    });
    if (new Set(p.map((m) => varKey(m.vars))).size !== p.length) continue;
    if (!istPrimitiv(p)) continue;
    return p;
  }
  return [monom(2, { x: 1 }), monom(1)];
}

function aufgabeAusFaktor(stufe: StufeId, faktor: Monom, klammer: Poly): Aufgabe {
  const summanden = klammer.map((t) => mulMonoms(faktor, t));
  const original = simplifyPoly(summanden);
  const g = gemeinsamerFaktor(summanden);
  const loesungNegTex = `${faktorTex(faktor)}\\left(${polyTex(klammer)}\\right)`;
  // Bei negativem Faktor ist auch die Variante mit positivem Faktor richtig: −F(K) = F(−K)
  const posFaktor = monom(-faktor.coeff, faktor.vars);
  const loesungPosTex = `${faktorTex(posFaktor)}\\left(${polyTex(klammer.map((t) => monom(-t.coeff, t.vars)))}\\right)`;
  const loesungTex = faktor.coeff < 0 ? `${loesungNegTex} = ${loesungPosTex}` : loesungNegTex;

  const zahlen = summanden.map((m) => Math.abs(m.coeff));
  const gemVars = varsTex(g.vars);
  const rechenweg: string[] = [];
  rechenweg.push(`\\text{1. ggT der Zahlen: } \\operatorname{ggT}(${zahlen.join(';\\,')}) = ${g.coeff}`);
  if (gemVars) {
    const varText = Object.keys(g.vars)
      .sort()
      .map((v) => (g.vars[v] === 1 ? v : `${v}^{${g.vars[v]}}`))
      .join(',\\ ');
    rechenweg.push(
      `\\text{2. Gemeinsame Variablen (kleinster Exponent): } ${varText}`,
    );
  } else {
    rechenweg.push(`\\text{2. Keine Variable kommt in allen Summanden vor.}`);
  }
  if (faktor.coeff < 0) {
    rechenweg.push(
      `\\text{3. Der erste Summand ist negativ – wir klammern auch das Minus aus: } ${faktorTex(faktor)}`,
    );
    rechenweg.push(
      `\\quad \\text{(Ebenso richtig: nur } ${absMonomTex(faktor)} \\text{ ausklammern – dann bleiben die Vorzeichen in der Klammer gleich.)}`,
    );
  } else {
    rechenweg.push(`\\text{3. Gemeinsamer Faktor: } ${absMonomTex(faktor)}`);
  }
  rechenweg.push(`\\text{4. Jeden Summanden durch den Faktor teilen:}`);
  summanden.forEach((s, i) => {
    const f = faktor.coeff < 0 ? `(${monomTex(faktor)})` : monomTex(faktor);
    const z = s.coeff < 0 ? `(${monomTex(s)})` : monomTex(s);
    rechenweg.push(`\\quad ${z} : ${f} = ${monomTex(klammer[i])}`);
  });
  rechenweg.push(`\\text{5. Ergebnis: } ${polyTex(summanden)} = ${loesungNegTex}`);
  if (faktor.coeff < 0) {
    rechenweg.push(`\\quad \\text{oder mit positivem Faktor: } ${polyTex(summanden)} = ${loesungPosTex}`);
  }
  rechenweg.push(
    `\\text{Probe (ausmultiplizieren): } ${klammer
      .map((t) => {
        const f = faktor.coeff < 0 ? `(${monomTex(faktor)})` : monomTex(faktor);
        const tt = t.coeff < 0 ? `(${monomTex(t)})` : monomTex(t);
        return `${f}\\cdot ${tt}`;
      })
      .join(' + ')} = ${polyTex(summanden)}\\ \\checkmark`,
  );

  return { id: neueId(), stufe, aufgabeTex: polyTex(summanden), original, loesungTex, rechenweg };
}

function genStufe1(): Aufgabe {
  const g = randInt(2, 10);
  const [v, w] = pickVars(2);
  const variante = randInt(1, 3);
  let klammer: Poly;
  if (variante === 1) klammer = zufallsKlammer(2, [{ [v]: 1 }], 9, true);
  else if (variante === 2) klammer = zufallsKlammer(2, [{ [v]: 1 }, { [w]: 1 }], 9, false);
  else klammer = zufallsKlammer(3, [{ [v]: 1 }, { [w]: 1 }], 7, true);
  return aufgabeAusFaktor(1, monom(g, {}), klammer);
}

function genStufe2(): Aufgabe {
  const [v] = pickVars(1);
  const g = Math.random() < 0.3 ? 1 : randInt(2, 8);
  const zweiSummanden = Math.random() < 0.6;
  const klammer = zweiSummanden
    ? zufallsKlammer(2, [{ [v]: 1 }, { [v]: 2 }], 9, true)
    : zufallsKlammer(3, [{ [v]: 1 }, { [v]: 2 }], 7, true);
  return aufgabeAusFaktor(2, monom(g, { [v]: 1 }), klammer);
}

function genStufe3(): Aufgabe {
  const [v, w] = pickVars(2);
  const g = randInt(2, 9);
  const ev = randInt(1, 2);
  const ew = Math.random() < 0.25 ? 0 : randInt(1, 2);
  const faktorVars: Record<string, number> = { [v]: ev };
  if (ew > 0) faktorVars[w] = ew;
  const neg = Math.random() < 0.35;
  const bausteine = [
    { [v]: 1 }, { [w]: 1 }, { [v]: 2 }, { [w]: 2 }, { [v]: 1, [w]: 1 }, { [v]: 2, [w]: 1 },
  ];
  const klammer = zufallsKlammer(3, bausteine, 6, Math.random() < 0.6);
  return aufgabeAusFaktor(3, monom(neg ? -g : g, faktorVars), klammer);
}

/** Stufe 4: q₁·(B) ± q₂·(B) → (B)(q₁ ± q₂) */
function genStufe4(): Aufgabe {
  const [v, w] = pickVars(2);
  const [u, z] = choice([['x', 'y'], ['a', 'b'], ['p', 'q']].filter((p) => !p.includes(v) && !p.includes(w)));
  // gemeinsame Klammer B
  const bVariante = randInt(1, 3);
  let klammerB: Poly;
  if (bVariante === 1) klammerB = [monom(1, { [v]: 1 }), monom(choice([-1, 1]) * randInt(1, 9))];
  else if (bVariante === 2) klammerB = [monom(1, { [v]: 1 }), monom(choice([-1, 1]), { [w]: 1 })];
  else klammerB = [monom(randInt(2, 5), { [v]: 1 }), monom(choice([-1, 1]) * randInt(1, 9))];
  if (!istPrimitiv(klammerB)) klammerB = [monom(1, { [v]: 1 }), monom(randInt(1, 9))];

  // Faktoren vor den Klammern
  const qVariante = randInt(1, 4);
  let q: Poly;
  if (qVariante === 1) q = [monom(randInt(2, 9), { [u]: 1 }), monom(choice([-1, 1]) * randInt(2, 9))];
  else if (qVariante === 2) q = [monom(1, { [u]: 1 }), monom(choice([-1, 1]), { [z]: 1 })];
  else if (qVariante === 3) q = [monom(randInt(2, 9), { [u]: 1 }), monom(choice([-1, 1]))];
  else q = [monom(randInt(2, 6), { [u]: 1 }), monom(choice([-1, 1]) * randInt(2, 6), { [z]: 1 })];
  if (!istPrimitiv(q)) q = [monom(1, { [u]: 1 }), monom(1)];

  const bTex = `\\left(${polyTex(klammerB)}\\right)`;
  const aufgabeTex = q
    .map((m, i) => {
      const abs = Math.abs(m.coeff) === 1 && varKey(m.vars) === '' ? '' : absMonomTex(m);
      const vz = i === 0 ? (m.coeff < 0 ? '-' : '') : m.coeff < 0 ? ' - ' : ' + ';
      return `${vz}${abs}${bTex}`;
    })
    .join('');
  const original = simplifyPoly(mulPolys(q, klammerB));
  const loesungTex = `${bTex}\\left(${polyTex(q)}\\right)`;
  const rechenweg = [
    `\\text{1. In beiden Summanden steht dieselbe Klammer: } ${bTex}`,
    ...(q.some((m) => Math.abs(m.coeff) === 1 && varKey(m.vars) === '')
      ? [`\\text{Tipp: Steht die Klammer allein, ist ihr Faktor } 1 \\text{: } ${bTex} = 1\\cdot ${bTex}`]
      : []),
    `\\text{2. Die Klammer als gemeinsamen Faktor ausklammern, die Restfaktoren kommen in die zweite Klammer:}`,
    `\\quad ${aufgabeTex} = ${loesungTex}`,
    `\\text{Probe (ausmultiplizieren): } ${loesungTex} = ${polyTex(original)} \\ \\checkmark`,
  ];
  return { id: neueId(), stufe: 4, aufgabeTex, original, loesungTex, rechenweg };
}

const GENERATOREN: Record<StufeId, () => Aufgabe> = { 1: genStufe1, 2: genStufe2, 3: genStufe3, 4: genStufe4 };

export function generiereSet(stufe: StufeId, anzahl: number): Aufgabe[] {
  const list: Aufgabe[] = [];
  const seen = new Set<string>();
  for (let guard = 0; list.length < anzahl && guard < 300; guard++) {
    const a = GENERATOREN[stufe]();
    if (seen.has(a.aufgabeTex)) continue;
    seen.add(a.aufgabeTex);
    list.push(a);
  }
  return list;
}

// ----------------------------------------------------------------------------
// Prüfung
// ----------------------------------------------------------------------------

export type Ergebnis =
  | { status: 'richtig' }
  | { status: 'unvollstaendig'; hinweis: string }
  | { status: 'falsch'; hinweis: string };

/** Zerlegt eine Eingabe in den Faktor außerhalb der Klammern und die Klammerinhalte. */
function zerlegeProdukt(raw: string): { aussen: string; klammern: string[] } | null {
  const s = raw
    .replace(/\s+/g, '')
    .toLowerCase()
    .replace(/[−–]/g, '-')
    .replace(/[·×]/g, '*')
    .replace(/\[/g, '(')
    .replace(/\]/g, ')');
  let tiefe = 0;
  let aussen = '';
  let aktuell = '';
  const klammern: string[] = [];
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === '(') {
      if (tiefe === 0) {
        aktuell = '';
        aussen += '*';
      } else aktuell += c;
      tiefe++;
    } else if (c === ')') {
      tiefe--;
      if (tiefe < 0) return null;
      if (tiefe === 0) {
        klammern.push(aktuell);
        aussen += '*';
        if (s[i + 1] === '^' || s[i + 1] === '²' || s[i + 1] === '³') return null;
      } else aktuell += c;
    } else if (tiefe > 0) {
      aktuell += c;
    } else {
      if ((c === '+' || c === '-') && i > 0) return null; // Summe auf oberster Ebene → kein Produkt
      aussen += c;
    }
  }
  if (tiefe !== 0) return null;
  aussen = aussen.replace(/\*+/g, '*').replace(/^\+/, '');
  aussen = aussen.replace(/^-\*/, '-').replace(/^\*+|\*+$/g, '');
  if (aussen === '-') aussen = '-1';
  return { aussen, klammern };
}

export function pruefeAntwort(aufgabe: Aufgabe, eingabe: string): Ergebnis {
  const gesamt = parseExpression(eingabe);
  if (!gesamt) {
    return { status: 'falsch', hinweis: 'Diese Eingabe kann ich nicht lesen. Achte auf die Klammern, z. B. 3x(2x + 5).' };
  }
  const gleichwertig = polysEquivalent(gesamt, aufgabe.original);
  const teile = zerlegeProdukt(eingabe);

  if (!gleichwertig) {
    const negiert = aufgabe.original.map((m) => monom(-m.coeff, m.vars));
    if (aufgabe.stufe !== 4 && teile && polysEquivalent(gesamt, negiert)) {
      return {
        status: 'falsch',
        hinweis:
          'Fast! Die Vorzeichen stimmen nicht. Klammerst du den positiven Faktor aus, bleiben die Vorzeichen in der Klammer gleich; klammerst du den negativen Faktor aus, drehen sich alle Vorzeichen in der Klammer um.',
      };
    }
    return {
      status: 'falsch',
      hinweis: 'Leider falsch. Multipliziere dein Ergebnis zur Probe aus – es muss wieder der Ausgangsterm herauskommen.',
    };
  }
  if (!teile || teile.klammern.length === 0) {
    return {
      status: 'falsch',
      hinweis: 'Der Term ist noch nicht ausgeklammert. Schreibe ihn als Produkt: Faktor · (Klammer).',
    };
  }

  const klammerPolys = teile.klammern.map((k) => parseExpression(k));
  if (klammerPolys.some((p) => !p)) {
    return { status: 'falsch', hinweis: 'Diese Eingabe kann ich nicht lesen.' };
  }
  const echteKlammern = (klammerPolys as Poly[]).filter((p) => p.length >= 2);

  if (aufgabe.stufe === 4) {
    if (echteKlammern.length < 2) {
      return {
        status: 'falsch',
        hinweis: 'Klammere die gemeinsame Klammer aus. Das Ergebnis besteht aus zwei Klammern: (…)(…).',
      };
    }
    if (!echteKlammern.every(istPrimitiv)) {
      return {
        status: 'unvollstaendig',
        hinweis: 'Fast! Richtig umgeformt, aber in einer Klammer steckt noch ein gemeinsamer Faktor.',
      };
    }
    return { status: 'richtig' };
  }

  if (echteKlammern.length !== 1) {
    return { status: 'falsch', hinweis: 'Schreibe das Ergebnis mit genau einer Klammer: Faktor · (Klammer).' };
  }
  // Einzelne Faktoren in Klammern, z. B. (2a + 1)·(−6ab), zählen zum Faktor vor der Klammer
  let aussen = teile.aussen ? parseExpression(teile.aussen) : [monom(1)];
  for (const k of klammerPolys as Poly[]) {
    if (aussen && k.length === 1) aussen = mulPolys(aussen, k);
  }
  if (!aussen || aussen.length !== 1) {
    return { status: 'falsch', hinweis: 'Vor der Klammer darf nur ein einzelner Faktor stehen, z. B. 4x.' };
  }
  const soll = gemeinsamerFaktor(aufgabe.original);
  const ist = aussen[0];
  if (Math.abs(Math.abs(ist.coeff) - soll.coeff) < 1e-9 && varKey(ist.vars) === varKey(soll.vars)) {
    return { status: 'richtig' };
  }
  return {
    status: 'unvollstaendig',
    hinweis: 'Fast! Richtig umgeformt, aber du kannst noch mehr ausklammern – in der Klammer steckt noch ein gemeinsamer Faktor.',
  };
}

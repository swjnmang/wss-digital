import { useEffect, useState } from 'react';
import { fieldCheckClass } from '../../../utils/fieldCheck';
import { VideoEmbed } from '../../../components/VideoButton';

/**
 * Bruchgleichungen auf FOS/BOS-Niveau (Vorklasse):
 * Definitionsmenge bestimmen, Nenner faktorisieren, Hauptnenner bilden,
 * mit dem Hauptnenner multiplizieren, lineare Gleichung lösen, Lösung mit D abgleichen.
 */

// Lösung als Bruch zaehler/nenner; null = leere Lösungsmenge
type Loesung = { z: number; n: number } | null;

interface FosAufgabe {
  id: string;
  gleichung: string;
  loesung: Loesung;
  // Faktorisierung der Nenner (wird vor dem Rechenweg angezeigt)
  faktor?: string[];
  rechenweg: string[];
}

const r = String.raw;

const AUFGABEN: FosAufgabe[] = [
  {
    id: 'f1',
    gleichung: r`\frac{x-3}{4} - \frac{2x-1}{6} = \frac{x+5}{3} - 4`,
    loesung: { z: 21, n: 5 },
    rechenweg: [
      r`D = \mathbb{R}`,
      r`\text{HN} = 12`,
      r`\frac{x-3}{4} - \frac{2x-1}{6} = \frac{x+5}{3} - 4  | \cdot 12`,
      r`3(x-3) - 2(2x-1) = 4(x+5) - 48`,
      r`3x - 9 - 4x + 2 = 4x + 20 - 48`,
      r`-x - 7 = 4x - 28  | -4x + 7`,
      r`-5x = -21  | : (-5)`,
      r`x = \frac{21}{5} = 4{,}2 \in D`,
      r`L = \{4{,}2\}`,
    ],
  },
  {
    id: 'f2',
    gleichung: r`\frac{2x-1}{3} - \frac{x+2}{6} = \frac{x-3}{2} + 1`,
    loesung: null,
    rechenweg: [
      r`D = \mathbb{R}`,
      r`\text{HN} = 6`,
      r`\frac{2x-1}{3} - \frac{x+2}{6} = \frac{x-3}{2} + 1  | \cdot 6`,
      r`2(2x-1) - (x+2) = 3(x-3) + 6`,
      r`4x - 2 - x - 2 = 3x - 9 + 6`,
      r`3x - 4 = 3x - 3  | -3x`,
      r`-4 = -3 \quad \text{(falsche Aussage)}`,
      r`L = \{\,\}`,
    ],
  },
  {
    id: 'f3',
    gleichung: r`12 : (2x-1) - 4 = 0`,
    loesung: { z: 2, n: 1 },
    rechenweg: [
      r`D = \mathbb{R} \setminus \left\{\tfrac{1}{2}\right\}`,
      r`\frac{12}{2x-1} - 4 = 0  | + 4`,
      r`\frac{12}{2x-1} = 4  | \cdot (2x-1)`,
      r`12 = 4(2x-1)`,
      r`12 = 8x - 4  | + 4`,
      r`16 = 8x  | : 8`,
      r`x = 2 \in D`,
      r`L = \{2\}`,
    ],
  },
  {
    id: 'f4',
    gleichung: r`\frac{2}{x} - \frac{x}{x+2} = -1`,
    loesung: { z: -1, n: 1 },
    rechenweg: [
      r`D = \mathbb{R} \setminus \{-2;\, 0\}`,
      r`\text{HN} = x(x+2)`,
      r`\frac{2}{x} - \frac{x}{x+2} = -1  | \cdot x(x+2)`,
      r`2(x+2) - x \cdot x = -x(x+2)`,
      r`2x + 4 - x^2 = -x^2 - 2x  | + x^2 + 2x`,
      r`4x + 4 = 0  | -4`,
      r`4x = -4  | : 4`,
      r`x = -1 \in D`,
      r`L = \{-1\}`,
    ],
  },
  {
    id: 'f5',
    gleichung: r`5 \cdot \frac{4-x}{2x} = \frac{3}{4x} + \frac{7}{x} - \frac{1}{4}`,
    loesung: { z: 1, n: 1 },
    rechenweg: [
      r`D = \mathbb{R} \setminus \{0\}`,
      r`\text{HN} = 4x`,
      r`\frac{5(4-x)}{2x} = \frac{3}{4x} + \frac{7}{x} - \frac{1}{4}  | \cdot 4x`,
      r`10(4-x) = 3 + 28 - x`,
      r`40 - 10x = 31 - x  | + 10x - 31`,
      r`9 = 9x  | : 9`,
      r`x = 1 \in D`,
      r`L = \{1\}`,
    ],
  },
  {
    id: 'f6',
    gleichung: r`\frac{0{,}4}{2x} + \left(\frac{0{,}3}{x} - \frac{0{,}5}{4}\right) \cdot 2 = 0`,
    loesung: { z: 16, n: 5 },
    rechenweg: [
      r`D = \mathbb{R} \setminus \{0\}`,
      r`\text{HN} = 4x`,
      r`\frac{0{,}4}{2x} + \left(\frac{0{,}3}{x} - \frac{0{,}5}{4}\right) \cdot 2 = 0  | \cdot 4x`,
      r`0{,}8 + (1{,}2 - 0{,}5x) \cdot 2 = 0`,
      r`0{,}8 + 2{,}4 - x = 0`,
      r`3{,}2 - x = 0  | + x`,
      r`x = 3{,}2 \in D`,
      r`L = \{3{,}2\}`,
    ],
  },
  {
    id: 'f7',
    gleichung: r`\frac{x^2-9}{2x} - \frac{3-x}{2} = x - \frac{5}{x}`,
    loesung: { z: 1, n: 3 },
    rechenweg: [
      r`D = \mathbb{R} \setminus \{0\}`,
      r`\text{HN} = 2x`,
      r`\frac{x^2-9}{2x} - \frac{3-x}{2} = x - \frac{5}{x}  | \cdot 2x`,
      r`x^2 - 9 - x(3-x) = 2x^2 - 10`,
      r`x^2 - 9 - 3x + x^2 = 2x^2 - 10`,
      r`2x^2 - 3x - 9 = 2x^2 - 10  | -2x^2 + 9`,
      r`-3x = -1  | : (-3)`,
      r`x = \frac{1}{3} \in D`,
      r`L = \left\{\tfrac{1}{3}\right\}`,
    ],
  },
  {
    id: 'f8',
    gleichung: r`\frac{2}{x-3} = \frac{6}{x^2-3x}`,
    loesung: null,
    faktor: [r`x^2 - 3x = x(x-3)`],
    rechenweg: [
      r`D = \mathbb{R} \setminus \{0;\, 3\}`,
      r`\text{HN} = x(x-3)`,
      r`\frac{2}{x-3} = \frac{6}{x(x-3)}  | \cdot x(x-3)`,
      r`2x = 6  | : 2`,
      r`x = 3 \notin D`,
      r`L = \{\,\}`,
    ],
  },
  {
    id: 'f9',
    gleichung: r`\frac{x+5}{2x+2} + \frac{x-1}{3x+3} = 1`,
    loesung: { z: 7, n: 1 },
    faktor: [r`2x+2 = 2(x+1)`, r`3x+3 = 3(x+1)`],
    rechenweg: [
      r`D = \mathbb{R} \setminus \{-1\}`,
      r`\text{HN} = 6(x+1)`,
      r`\frac{x+5}{2(x+1)} + \frac{x-1}{3(x+1)} = 1  | \cdot 6(x+1)`,
      r`3(x+5) + 2(x-1) = 6(x+1)`,
      r`3x + 15 + 2x - 2 = 6x + 6`,
      r`5x + 13 = 6x + 6  | -5x - 6`,
      r`x = 7 \in D`,
      r`L = \{7\}`,
    ],
  },
  {
    id: 'f10',
    gleichung: r`\frac{2}{x} = \frac{1}{x-2} + \frac{1}{x+4}`,
    loesung: { z: 8, n: 1 },
    rechenweg: [
      r`D = \mathbb{R} \setminus \{-4;\, 0;\, 2\}`,
      r`\text{HN} = x(x-2)(x+4)`,
      r`\frac{2}{x} = \frac{1}{x-2} + \frac{1}{x+4}  | \cdot x(x-2)(x+4)`,
      r`2(x-2)(x+4) = x(x+4) + x(x-2)`,
      r`2(x^2 + 2x - 8) = x^2 + 4x + x^2 - 2x`,
      r`2x^2 + 4x - 16 = 2x^2 + 2x  | -2x^2 - 2x + 16`,
      r`2x = 16  | : 2`,
      r`x = 8 \in D`,
      r`L = \{8\}`,
    ],
  },
  {
    id: 'f11',
    gleichung: r`\frac{x+4}{x} = \frac{x+1}{x-1}`,
    loesung: { z: 2, n: 1 },
    rechenweg: [
      r`D = \mathbb{R} \setminus \{0;\, 1\}`,
      r`\text{HN} = x(x-1)`,
      r`\frac{x+4}{x} = \frac{x+1}{x-1}  | \cdot x(x-1) \;\text{(„über Kreuz“)}`,
      r`(x+4)(x-1) = x(x+1)`,
      r`x^2 + 3x - 4 = x^2 + x  | -x^2 - x + 4`,
      r`2x = 4  | : 2`,
      r`x = 2 \in D`,
      r`L = \{2\}`,
    ],
  },
  {
    id: 'f12',
    gleichung: r`\frac{2x+1}{4x-3} = \frac{x}{2x+5}`,
    loesung: { z: -1, n: 3 },
    rechenweg: [
      r`D = \mathbb{R} \setminus \left\{-\tfrac{5}{2};\, \tfrac{3}{4}\right\}`,
      r`\text{HN} = (4x-3)(2x+5)`,
      r`\frac{2x+1}{4x-3} = \frac{x}{2x+5}  | \cdot (4x-3)(2x+5)`,
      r`(2x+1)(2x+5) = x(4x-3)`,
      r`4x^2 + 12x + 5 = 4x^2 - 3x  | -4x^2 + 3x - 5`,
      r`15x = -5  | : 15`,
      r`x = -\frac{1}{3} \in D`,
      r`L = \left\{-\tfrac{1}{3}\right\}`,
    ],
  },
  {
    id: 'f13',
    gleichung: r`\frac{1}{2-x} + \frac{2}{x+1} = \frac{4}{3x-6}`,
    loesung: { z: -19, n: 1 },
    faktor: [r`3x - 6 = -3(2-x)`],
    rechenweg: [
      r`D = \mathbb{R} \setminus \{-1;\, 2\}`,
      r`\text{HN} = 3(2-x)(x+1)`,
      r`\frac{1}{2-x} + \frac{2}{x+1} = \frac{-4}{3(2-x)}  | \cdot 3(2-x)(x+1)`,
      r`3(x+1) + 6(2-x) = -4(x+1)`,
      r`3x + 3 + 12 - 6x = -4x - 4`,
      r`-3x + 15 = -4x - 4  | + 4x - 15`,
      r`x = -19 \in D`,
      r`L = \{-19\}`,
    ],
  },
  {
    id: 'f14',
    gleichung: r`\frac{1}{x+1} + \left(\frac{1}{2x-4} - \frac{5}{6x-12}\right) = 0`,
    loesung: { z: 7, n: 2 },
    faktor: [r`2x-4 = 2(x-2)`, r`6x-12 = 6(x-2)`],
    rechenweg: [
      r`D = \mathbb{R} \setminus \{-1;\, 2\}`,
      r`\text{HN} = 6(x+1)(x-2)`,
      r`\frac{1}{x+1} + \frac{1}{2(x-2)} - \frac{5}{6(x-2)} = 0  | \cdot 6(x+1)(x-2)`,
      r`6(x-2) + 3(x+1) - 5(x+1) = 0`,
      r`6x - 12 + 3x + 3 - 5x - 5 = 0`,
      r`4x - 14 = 0  | + 14`,
      r`4x = 14  | : 4`,
      r`x = \frac{7}{2} = 3{,}5 \in D`,
      r`L = \{3{,}5\}`,
    ],
  },
  {
    id: 'f15',
    gleichung: r`\frac{1}{2x} - \frac{3-4x}{2x-8x^2} = \frac{5}{4x-1}`,
    loesung: { z: 1, n: 5 },
    faktor: [r`2x - 8x^2 = 2x(1-4x)`, r`4x - 1 = -(1-4x)`],
    rechenweg: [
      r`D = \mathbb{R} \setminus \left\{0;\, \tfrac{1}{4}\right\}`,
      r`\text{HN} = 2x(1-4x)`,
      r`\frac{1}{2x} - \frac{3-4x}{2x(1-4x)} = \frac{-5}{1-4x}  | \cdot 2x(1-4x)`,
      r`(1-4x) - (3-4x) = -5 \cdot 2x`,
      r`1 - 4x - 3 + 4x = -10x`,
      r`-2 = -10x  | : (-10)`,
      r`x = \frac{1}{5} = 0{,}2 \in D`,
      r`L = \{0{,}2\}`,
    ],
  },
  {
    id: 'f16',
    gleichung: r`\frac{3x-20}{x+2} - 3 = 4 \cdot \frac{x+2}{x^2-4}`,
    loesung: { z: 22, n: 15 },
    faktor: [r`x^2 - 4 = (x+2)(x-2)`],
    rechenweg: [
      r`D = \mathbb{R} \setminus \{-2;\, 2\}`,
      r`\text{HN} = (x+2)(x-2)`,
      r`\frac{3x-20}{x+2} - 3 = \frac{4(x+2)}{(x+2)(x-2)}  | \cdot (x+2)(x-2)`,
      r`(3x-20)(x-2) - 3(x^2-4) = 4(x+2)`,
      r`3x^2 - 26x + 40 - 3x^2 + 12 = 4x + 8`,
      r`-26x + 52 = 4x + 8  | -4x - 52`,
      r`-30x = -44  | : (-30)`,
      r`x = \frac{22}{15} \approx 1{,}47 \in D`,
      r`L = \left\{\tfrac{22}{15}\right\}`,
    ],
  },
  {
    id: 'f17',
    gleichung: r`\frac{x+4}{x-2} - \frac{3}{x+2} = \frac{x^2+20}{x^2-4}`,
    loesung: null,
    faktor: [r`x^2 - 4 = (x+2)(x-2)`],
    rechenweg: [
      r`D = \mathbb{R} \setminus \{-2;\, 2\}`,
      r`\text{HN} = (x+2)(x-2)`,
      r`\frac{x+4}{x-2} - \frac{3}{x+2} = \frac{x^2+20}{(x+2)(x-2)}  | \cdot (x+2)(x-2)`,
      r`(x+4)(x+2) - 3(x-2) = x^2 + 20`,
      r`x^2 + 6x + 8 - 3x + 6 = x^2 + 20`,
      r`x^2 + 3x + 14 = x^2 + 20  | -x^2 - 14`,
      r`3x = 6  | : 3`,
      r`x = 2 \notin D`,
      r`L = \{\,\}`,
    ],
  },
  {
    id: 'f18',
    gleichung: r`\frac{1}{2x^3-8x^2+8x} + \frac{1}{x^2+2x} = \frac{1}{x^2-4}`,
    loesung: { z: 10, n: 3 },
    faktor: [r`2x^3 - 8x^2 + 8x = 2x(x^2 - 4x + 4) = 2x(x-2)^2`, r`x^2 + 2x = x(x+2)`, r`x^2 - 4 = (x+2)(x-2)`],
    rechenweg: [
      r`D = \mathbb{R} \setminus \{-2;\, 0;\, 2\}`,
      r`\text{HN} = 2x(x-2)^2(x+2)`,
      r`\frac{1}{2x(x-2)^2} + \frac{1}{x(x+2)} = \frac{1}{(x+2)(x-2)}  | \cdot 2x(x-2)^2(x+2)`,
      r`(x+2) + 2(x-2)^2 = 2x(x-2)`,
      r`x + 2 + 2x^2 - 8x + 8 = 2x^2 - 4x`,
      r`2x^2 - 7x + 10 = 2x^2 - 4x  | -2x^2 + 7x`,
      r`10 = 3x  | : 3`,
      r`x = \frac{10}{3} \in D`,
      r`L = \left\{\tfrac{10}{3}\right\}`,
    ],
  },
];

const LOB = ['Super, richtig!', 'Sehr gut gelöst!', 'Klasse – genau so!', 'Stark, das stimmt!', 'Perfekt!'];

const LEER_EINGABEN = ['leer', 'keine', 'keinelösung', 'keinelosung', '{}', '∅', 'ø', 'l={}'];

/**
 * Wertet die Eingabe aus. Akzeptiert: ganze Zahlen, Dezimalzahlen (Komma/Punkt),
 * Brüche (a/b), gemischte Zahlen (6 1/2), optional mit „x =“ oder „L = { … }“.
 * Rückgabe: 'leer' für die leere Menge, eine Zahl, oder undefined bei unlesbarer Eingabe.
 */
function parseEingabe(raw: string): number | 'leer' | undefined {
  let s = raw.trim().toLowerCase().replace(/[−–—‐]/g, '-');
  const kompakt = s.replace(/\s+/g, '');
  if (LEER_EINGABEN.includes(kompakt) || /^(l=)?\{\}$/.test(kompakt)) return 'leer';
  s = s.replace(/^l\s*=\s*/, '').replace(/^x\s*=\s*/, '').replace(/[{}]/g, '').trim().replace(/,/g, '.');
  if (s === '') return 'leer';
  const gemischt = s.match(/^(-?)(\d+)\s+(\d+)\s*\/\s*(\d+)$/);
  if (gemischt) {
    const wert = Number(gemischt[2]) + Number(gemischt[3]) / Number(gemischt[4]);
    return gemischt[1] === '-' ? -wert : wert;
  }
  const bruch = s.match(/^(-?\d+(?:\.\d+)?)\s*\/\s*(-?\d+(?:\.\d+)?)$/);
  if (bruch) {
    const n = Number(bruch[2]);
    return n === 0 ? undefined : Number(bruch[1]) / n;
  }
  if (/^-?\d+(\.\d+)?$/.test(s) || /^-?\.\d+$/.test(s)) return Number(s);
  return undefined;
}

function istRichtig(eingabe: number | 'leer', loesung: Loesung): boolean {
  if (loesung === null) return eingabe === 'leer';
  if (eingabe === 'leer') return false;
  const exakt = loesung.z / loesung.n;
  // exakte Brüche und auf zwei Nachkommastellen gerundete Dezimalzahlen zulassen
  return Math.abs(eingabe - exakt) < 1e-9 || Math.abs(eingabe - Math.round(exakt * 100) / 100) < 1e-9;
}

/**
 * Rechenweg mit untereinander stehenden Gleichheitszeichen und Kommandostrich.
 * Kompakt (inline-grid) und mit großen Brüchen (\displaystyle), damit mehrstöckige Nenner lesbar bleiben.
 */
function Schritte({ zeilen }: { zeilen: string[] }) {
  const tex = (t: string) => `$\\displaystyle ${t}$`;
  return (
    <div style={{ display: 'inline-grid', gridTemplateColumns: 'auto auto auto auto', columnGap: '0.5rem', rowGap: '0.6rem', alignItems: 'center' }}>
      {zeilen.map((zeile, i) => {
        const [gleichung, op] = zeile.split('|').map((t) => t.trim());
        const eq = gleichung.indexOf('=');
        const operation = op ? (
          <div className="text-gray-500 whitespace-nowrap flex items-center gap-2"><span>|</span>
            {tex(op)}</div>
        ) : (
          <div />
        );
        if (eq === -1) {
          return (
            <div key={i} style={{ display: 'contents' }}>
              <div style={{ gridColumn: '1 / span 3' }} className="whitespace-nowrap">{tex(gleichung)}</div>
              {operation}
            </div>
          );
        }
        return (
          <div key={i} style={{ display: 'contents' }}>
            <div className="text-right whitespace-nowrap">{tex(gleichung.slice(0, eq).trim())}</div>
            <div>{'$=$'}</div>
            <div className="whitespace-nowrap">{tex(gleichung.slice(eq + 1).trim())}</div>
            {operation}
          </div>
        );
      })}
    </div>
  );
}

type Status = { wert: string; richtig: boolean | null; meldung: string };

export default function BruchgleichungenFOSBOS() {
  const [status, setStatus] = useState<Record<string, Status>>({});
  const [offen, setOffen] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const mj = (window as any).MathJax;
    mj?.typesetPromise?.().catch(() => {});
  }, [offen]);

  const setWert = (id: string, wert: string) =>
    setStatus((alt) => ({ ...alt, [id]: { wert, richtig: null, meldung: '' } }));

  const pruefen = (aufgabe: FosAufgabe) => {
    const wert = status[aufgabe.id]?.wert ?? '';
    const eingabe = parseEingabe(wert);
    if (wert.trim() === '' || eingabe === undefined) {
      setStatus((alt) => ({
        ...alt,
        [aufgabe.id]: { wert, richtig: null, meldung: 'Gib eine Zahl (z. B. 2, -1/3, 4,2) oder „leer“ ein.' },
      }));
      return;
    }
    const richtig = istRichtig(eingabe, aufgabe.loesung);
    const meldung = richtig
      ? LOB[Math.floor(Math.random() * LOB.length)]
      : eingabe === 'leer'
        ? 'Leider falsch – die Gleichung hat eine Lösung.'
        : aufgabe.loesung === null
          ? 'Leider falsch – prüfe, ob dein Ergebnis in der Definitionsmenge liegt.'
          : 'Leider falsch – rechne noch einmal nach.';
    setStatus((alt) => ({ ...alt, [aufgabe.id]: { wert, richtig, meldung } }));
  };

  const anzahlRichtig = Object.values(status).filter((s) => s.richtig === true).length;

  return (
    <div>
      <div className="mb-4 p-3 bg-white rounded border border-gray-200 text-sm text-gray-700 space-y-1">
        <p className="font-semibold">So gehst du vor:</p>
        <p>1. Nenner faktorisieren &nbsp; 2. Definitionsmenge $D$ bestimmen &nbsp; 3. Hauptnenner (HN) bilden</p>
        <p>4. Gleichung mit dem HN multiplizieren &nbsp; 5. lineare Gleichung lösen &nbsp; 6. Lösung mit $D$ vergleichen</p>
        <p className="text-gray-600">
          Eingabe: die Lösung als Zahl oder Bruch (z. B. <code>-19</code>, <code>4,2</code>, <code>22/15</code>).
          Ist die Lösungsmenge leer, tippe <code>leer</code>.
        </p>
      </div>

      <VideoEmbed
        src="https://www.youtube.com/watch?v=DZ29fqns_k0"
        title="Erklärvideo: Bruchgleichungen lösen"
        className="mb-4 max-w-[640px]"
      />

      <div className="grid gap-4 grid-cols-1">
        {AUFGABEN.map((aufgabe, index) => {
          const st = status[aufgabe.id] ?? { wert: '', richtig: null, meldung: '' };
          const zeigen = offen[aufgabe.id] ?? false;
          return (
            <div key={aufgabe.id} className="bg-white rounded p-3 shadow border-l-2 border-purple-300 space-y-3">
              <div className="flex items-start gap-2">
                <span className="text-base font-bold text-gray-600">{index + 1})</span>
                <div className="text-lg overflow-x-auto flex-1">{`$\\displaystyle ${aufgabe.gleichung}$`}</div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-lg whitespace-nowrap">{'$L = \\{$'}</span>
                <input
                  type="text"
                  inputMode="text"
                  placeholder="..."
                  aria-label={`Lösung Aufgabe ${index + 1}`}
                  value={st.wert}
                  onChange={(e) => setWert(aufgabe.id, e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && pruefen(aufgabe)}
                  className={`w-28 px-3 py-2 rounded border-2 border-gray-300 font-mono text-base ${fieldCheckClass(st.richtig)}`}
                />
                <span className="text-lg">{'$\\}$'}</span>
                <button onClick={() => pruefen(aufgabe)} className="bk-btn">
                  Prüfen
                </button>
                <button
                  onClick={() => setOffen((alt) => ({ ...alt, [aufgabe.id]: !alt[aufgabe.id] }))}
                  className="bk-btn whitespace-nowrap"
                >
                  {zeigen ? 'Lösungsweg ausblenden' : 'Lösungsweg'}
                </button>
              </div>

              {st.meldung && (
                <p
                  className="text-sm font-semibold"
                  style={{
                    color:
                      st.richtig === true ? 'var(--correct-ink)' : st.richtig === false ? 'var(--wrong-ink)' : undefined,
                  }}
                >
                  {st.meldung}
                </p>
              )}

              {zeigen && (
                <div className="p-3 bg-purple-50 rounded border-l-2 border-purple-400 text-base overflow-x-auto">
                  {aufgabe.faktor && (
                    <div className="mb-3">
                      <p className="text-sm font-semibold text-gray-700 mb-1">Nenner faktorisieren:</p>
                      <Schritte zeilen={aufgabe.faktor} />
                    </div>
                  )}
                  <Schritte zeilen={aufgabe.rechenweg} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 p-3 bg-white rounded shadow border border-gray-200">
        <p className="text-base font-semibold text-gray-800">
          Fortschritt: {anzahlRichtig} / {AUFGABEN.length} korrekt
        </p>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
          <div
            className="bg-purple-500 h-2 rounded-full transition-all"
            style={{ width: `${(anzahlRichtig / AUFGABEN.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}

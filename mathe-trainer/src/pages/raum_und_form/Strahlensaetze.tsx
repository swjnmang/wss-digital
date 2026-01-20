import { useEffect, useId, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { InlineMath } from "react-katex";

type RayTask = {
  type: "ray1_segment" | "ray1_ratio" | "ray2_segment" | "ray2_ratio" | "similarity" | "parallel_segment" | "diagonal_segment";
  scenario: number;
  p: number;
  q: number;
  r: number;
  expectedAnswer: number;
  unit: string;
  tolerance: number;
  description: string;
  hint: string;
  solution: string[];
};

function generateTask(): RayTask {
  // Zufällig Zahlenwerte generieren
  // Bereiche gewählt, um geometrisch sinnvolle Aufgaben zu garantieren (rs > 0)
  const p = randomBetween(2, 3.5);
  const q = randomBetween(8, 12);
  const r = randomBetween(5, 8);  // R weiter von O entfernt
  
  // Berechnete Werte
  const pq = q - p;  // Abschnitt PQ
  const os = (q * r) / p;  // OS nach Strahlensatz 1
  const rs = os - r;  // Abschnitt RS

  // Zufällig zwischen 1. und 2. Strahlensatz wählen (50/50)
  const useTheorem2 = Math.random() > 0.5;
  
  // Zufällig Task-Kategorie wählen: 1) Theorem 1, 2) Theorem 2, 3) Parallele Geraden, 4) Diagonale Strecken
  const taskCategory = Math.floor(Math.random() * 4);
  
  if (taskCategory === 2) {
    // 2. STRAHLENSATZ - Aufgabentypen (zwischen Parallelen auf den Strahlen)
    const theorem2Types = [
      {
        name: "PQ_berechnen",
        expectedAnswer: (p * rs) / r,
        description: `Gegeben sind: $\\overline{OP} = ${p.toFixed(1)}$ cm, $\\overline{OR} = ${r.toFixed(1)}$ cm, $\\overline{RS} = ${rs.toFixed(1)}$ cm. Zwei parallele Geraden schneiden zwei Strahlen mit gemeinsamen Startpunkt O. Berechne die Länge der Strecke $\\overline{PQ}$ (zwischen den parallelen Geraden auf dem ersten Strahl).`,
        hint: "Strahlensatz 2: $\\frac{\\overline{PQ}}{\\overline{RS}} = \\frac{\\overline{OP}}{\\overline{OR}}$. Stelle nach $\\overline{PQ}$ um!",
        solution: [
          "Strahlensatz 2: $\\frac{\\overline{PQ}}{\\overline{RS}} = \\frac{\\overline{OP}}{\\overline{OR}}$",
          "",
          `$\\frac{\\overline{PQ}}{${rs.toFixed(1)}} = \\frac{${p.toFixed(1)}}{${r.toFixed(1)}}$`,
          "",
          `$\\overline{PQ} = ${rs.toFixed(1)} \\times \\frac{${p.toFixed(1)}}{${r.toFixed(1)}}$`,
          `$\\overline{PQ} = ${((p * rs) / r).toFixed(2)}$ cm`
        ]
      },
      {
        name: "RS_berechnen",
        expectedAnswer: (pq * r) / p,
        description: `Gegeben sind: $\\overline{OP} = ${p.toFixed(1)}$ cm, $\\overline{OR} = ${r.toFixed(1)}$ cm, $\\overline{PQ} = ${pq.toFixed(1)}$ cm. Zwei parallele Geraden schneiden zwei Strahlen mit gemeinsamen Startpunkt O. Berechne die Länge der Strecke $\\overline{RS}$ (zwischen den parallelen Geraden auf dem zweiten Strahl).`,
        hint: "Strahlensatz 2: $\\frac{\\overline{PQ}}{\\overline{RS}} = \\frac{\\overline{OP}}{\\overline{OR}}$. Stelle nach $\\overline{RS}$ um!",
        solution: [
          "Strahlensatz 2: $\\frac{\\overline{PQ}}{\\overline{RS}} = \\frac{\\overline{OP}}{\\overline{OR}}$",
          "",
          `$\\frac{${pq.toFixed(1)}}{\\overline{RS}} = \\frac{${p.toFixed(1)}}{${r.toFixed(1)}}$`,
          "",
          `$\\overline{RS} = ${pq.toFixed(1)} \\times \\frac{${r.toFixed(1)}}{${p.toFixed(1)}}$`,
          `$\\overline{RS} = ${((pq * r) / p).toFixed(2)}$ cm`
        ]
      },
      {
        name: "OP_berechnen",
        expectedAnswer: p,
        description: `Gegeben sind: $\\overline{PQ} = ${pq.toFixed(1)}$ cm, $\\overline{OR} = ${r.toFixed(1)}$ cm, $\\overline{RS} = ${rs.toFixed(1)}$ cm. Zwei parallele Geraden schneiden zwei Strahlen mit gemeinsamen Startpunkt O. Berechne die Länge der Strecke $\\overline{OP}$.`,
        hint: "Strahlensatz 2: $\\frac{\\overline{PQ}}{\\overline{RS}} = \\frac{\\overline{OP}}{\\overline{OR}}$. Stelle nach $\\overline{OP}$ um!",
        solution: [
          "Strahlensatz 2: $\\frac{\\overline{PQ}}{\\overline{RS}} = \\frac{\\overline{OP}}{\\overline{OR}}$",
          "",
          `$\\frac{${pq.toFixed(1)}}{${rs.toFixed(1)}} = \\frac{\\overline{OP}}{${r.toFixed(1)}}$`,
          "",
          `$\\overline{OP} = ${r.toFixed(1)} \\times \\frac{${pq.toFixed(1)}}{${rs.toFixed(1)}}$`,
          `$\\overline{OP} = ${p.toFixed(2)}$ cm`
        ]
      },
      {
        name: "OR_berechnen",
        expectedAnswer: r,
        description: `Gegeben sind: $\\overline{PQ} = ${pq.toFixed(1)}$ cm, $\\overline{OP} = ${p.toFixed(1)}$ cm, $\\overline{RS} = ${rs.toFixed(1)}$ cm. Zwei parallele Geraden schneiden zwei Strahlen mit gemeinsamen Startpunkt O. Berechne die Länge der Strecke $\\overline{OR}$.`,
        hint: "Strahlensatz 2: $\\frac{\\overline{PQ}}{\\overline{RS}} = \\frac{\\overline{OP}}{\\overline{OR}}$. Stelle nach $\\overline{OR}$ um!",
        solution: [
          "Strahlensatz 2: $\\frac{\\overline{PQ}}{\\overline{RS}} = \\frac{\\overline{OP}}{\\overline{OR}}$",
          "",
          `$\\frac{${pq.toFixed(1)}}{${rs.toFixed(1)}} = \\frac{${p.toFixed(1)}}{\\overline{OR}}$`,
          "",
          `$\\overline{OR} = ${p.toFixed(1)} \\times \\frac{${rs.toFixed(1)}}{${pq.toFixed(1)}}$`,
          `$\\overline{OR} = ${r.toFixed(2)}$ cm`
        ]
      }
    ];
    
    const selectedType = theorem2Types[Math.floor(Math.random() * theorem2Types.length)];
    
    return {
      type: "ray2_segment",
      scenario: Math.floor(Math.random() * 4),
      p,
      q,
      r,
      expectedAnswer: selectedType.expectedAnswer,
      unit: "cm",
      tolerance: 0.2,
      description: selectedType.description,
      hint: selectedType.hint,
      solution: selectedType.solution
    };
  } else if (taskCategory === 1) {
    // PARALLEL LINES - Aufgabentypen (auf den Parallelen und Strahlen)
    const parallelTypes = [
      {
        name: "PQ_auf_parallel",
        expectedAnswer: pq,
        description: `Gegeben sind: $\\overline{OP} = ${p.toFixed(1)}$ cm, $\\overline{OQ} = ${q.toFixed(1)}$ cm. Zwei parallele Geraden schneiden zwei Strahlen mit gemeinsamen Startpunkt O. Berechne die Länge der Strecke $\\overline{PQ}$ auf dem ersten Strahl.`,
        hint: "Die Strecke PQ liegt auf dem ersten Strahl zwischen den Punkten P und Q.",
        solution: [
          `$\\overline{PQ} = \\overline{OQ} - \\overline{OP}$`,
          `$\\overline{PQ} = ${q.toFixed(1)} - ${p.toFixed(1)}$`,
          `$\\overline{PQ} = ${pq.toFixed(2)}$ cm`
        ]
      },
      {
        name: "RS_auf_strahl",
        expectedAnswer: rs,
        description: `Gegeben sind: $\\overline{OP} = ${p.toFixed(1)}$ cm, $\\overline{OQ} = ${q.toFixed(1)}$ cm, $\\overline{OR} = ${r.toFixed(1)}$ cm. Zwei parallele Geraden schneiden zwei Strahlen mit gemeinsamen Startpunkt O. Berechne die Länge der Strecke $\\overline{RS}$ auf dem zweiten Strahl.`,
        hint: "Berechne zuerst $\\overline{OS}$ mit dem Strahlensatz 1, dann $\\overline{RS} = \\overline{OS} - \\overline{OR}$.",
        solution: [
          "Zuerst berechnen wir $\\overline{OS}$ mit Strahlensatz 1:",
          `$\\frac{\\overline{OP}}{\\overline{OQ}} = \\frac{\\overline{OR}}{\\overline{OS}}$`,
          `$\\frac{${p.toFixed(1)}}{${q.toFixed(1)}} = \\frac{${r.toFixed(1)}}{\\overline{OS}}$`,
          `$\\overline{OS} = ${os.toFixed(2)}$ cm`,
          "",
          "Dann berechnen wir $\\overline{RS}$:",
          `$\\overline{RS} = \\overline{OS} - \\overline{OR}$`,
          `$\\overline{RS} = ${os.toFixed(2)} - ${r.toFixed(1)}$`,
          `$\\overline{RS} = ${rs.toFixed(2)}$ cm`
        ]
      },
      {
        name: "OP_auf_strahl",
        expectedAnswer: p,
        description: `Gegeben sind: $\\overline{OQ} = ${q.toFixed(1)}$ cm, $\\overline{OR} = ${r.toFixed(1)}$ cm, $\\overline{OS} = ${os.toFixed(1)}$ cm. Zwei parallele Geraden schneiden zwei Strahlen mit gemeinsamen Startpunkt O. Berechne die Länge der Strecke $\\overline{OP}$ auf dem ersten Strahl.`,
        hint: "Strahlensatz 1: $\\frac{\\overline{OP}}{\\overline{OQ}} = \\frac{\\overline{OR}}{\\overline{OS}}$. Stelle nach $\\overline{OP}$ um!",
        solution: [
          "Strahlensatz 1: $\\frac{\\overline{OP}}{\\overline{OQ}} = \\frac{\\overline{OR}}{\\overline{OS}}$",
          "",
          `$\\frac{\\overline{OP}}{${q.toFixed(1)}} = \\frac{${r.toFixed(1)}}{${os.toFixed(1)}}$`,
          "",
          `$\\overline{OP} = ${q.toFixed(1)} \\times \\frac{${r.toFixed(1)}}{${os.toFixed(1)}}$`,
          `$\\overline{OP} = ${p.toFixed(2)}$ cm`
        ]
      },
      {
        name: "OR_auf_strahl",
        expectedAnswer: r,
        description: `Gegeben sind: $\\overline{OP} = ${p.toFixed(1)}$ cm, $\\overline{OQ} = ${q.toFixed(1)}$ cm, $\\overline{OS} = ${os.toFixed(1)}$ cm. Zwei parallele Geraden schneiden zwei Strahlen mit gemeinsamen Startpunkt O. Berechne die Länge der Strecke $\\overline{OR}$ auf dem zweiten Strahl.`,
        hint: "Strahlensatz 1: $\\frac{\\overline{OP}}{\\overline{OQ}} = \\frac{\\overline{OR}}{\\overline{OS}}$. Stelle nach $\\overline{OR}$ um!",
        solution: [
          "Strahlensatz 1: $\\frac{\\overline{OP}}{\\overline{OQ}} = \\frac{\\overline{OR}}{\\overline{OS}}$",
          "",
          `$\\frac{${p.toFixed(1)}}{${q.toFixed(1)}} = \\frac{\\overline{OR}}{${os.toFixed(1)}}$`,
          "",
          `$\\overline{OR} = ${p.toFixed(1)} \\times \\frac{${os.toFixed(1)}}{${q.toFixed(1)}}$`,
          `$\\overline{OR} = ${r.toFixed(2)}$ cm`
        ]
      }
    ];
    
    const selectedType = parallelTypes[Math.floor(Math.random() * parallelTypes.length)];
    
    return {
      type: "parallel_segment",
      scenario: Math.floor(Math.random() * 4),
      p,
      q,
      r,
      expectedAnswer: selectedType.expectedAnswer,
      unit: "cm",
      tolerance: 0.2,
      description: selectedType.description,
      hint: selectedType.hint,
      solution: selectedType.solution
    };
  } else if (taskCategory === 0) {
    // 1. STRAHLENSATZ - Aufgabentypen
    const theorem1Types = [
      {
        name: "OS_berechnen",
        expectedAnswer: os,
        description: `Gegeben sind: $\\overline{OP} = ${p.toFixed(1)}$ cm, $\\overline{OQ} = ${q.toFixed(1)}$ cm, $\\overline{OR} = ${r.toFixed(1)}$ cm. Zwei parallele Geraden schneiden zwei Strahlen mit gemeinsamen Startpunkt O. Berechne die Länge der Strecke $\\overline{OS}$.`,
        hint: "Strahlensatz 1: $\\frac{\\overline{OP}}{\\overline{OQ}} = \\frac{\\overline{OR}}{\\overline{OS}}$. Stelle nach $\\overline{OS}$ um!",
        solution: [
          "Strahlensatz 1: $\\frac{\\overline{OP}}{\\overline{OQ}} = \\frac{\\overline{OR}}{\\overline{OS}}$",
          "",
          `$\\frac{${p.toFixed(1)}}{${q.toFixed(1)}} = \\frac{${r.toFixed(1)}}{\\overline{OS}}$`,
          "",
          `$\\overline{OS} = ${r.toFixed(1)} \\times \\frac{${q.toFixed(1)}}{${p.toFixed(1)}}$`,
          `$\\overline{OS} = ${os.toFixed(2)}$ cm`
        ]
      },
      {
        name: "OQ_berechnen",
        expectedAnswer: q,
        description: `Gegeben sind: $\\overline{OP} = ${p.toFixed(1)}$ cm, $\\overline{OR} = ${r.toFixed(1)}$ cm, $\\overline{OS} = ${os.toFixed(1)}$ cm. Zwei parallele Geraden schneiden zwei Strahlen mit gemeinsamen Startpunkt O. Berechne die Länge der Strecke $\\overline{OQ}$.`,
        hint: "Strahlensatz 1: $\\frac{\\overline{OP}}{\\overline{OQ}} = \\frac{\\overline{OR}}{\\overline{OS}}$. Stelle nach $\\overline{OQ}$ um!",
        solution: [
          "Strahlensatz 1: $\\frac{\\overline{OP}}{\\overline{OQ}} = \\frac{\\overline{OR}}{\\overline{OS}}$",
          "",
          `$\\frac{${p.toFixed(1)}}{\\overline{OQ}} = \\frac{${r.toFixed(1)}}{${os.toFixed(1)}}$`,
          "",
          `$\\overline{OQ} = ${p.toFixed(1)} \\times \\frac{${os.toFixed(1)}}{${r.toFixed(1)}}$`,
          `$\\overline{OQ} = ${q.toFixed(2)}$ cm`
        ]
      },
      {
        name: "OR_berechnen",
        expectedAnswer: (p * os) / q,
        description: `Gegeben sind: $\\overline{OP} = ${p.toFixed(1)}$ cm, $\\overline{OQ} = ${q.toFixed(1)}$ cm, $\\overline{OS} = ${os.toFixed(1)}$ cm. Zwei parallele Geraden schneiden zwei Strahlen mit gemeinsamen Startpunkt O. Berechne die Länge der Strecke $\\overline{OR}$.`,
        hint: "Strahlensatz 1: $\\frac{\\overline{OP}}{\\overline{OQ}} = \\frac{\\overline{OR}}{\\overline{OS}}$. Stelle nach $\\overline{OR}$ um!",
        solution: [
          "Strahlensatz 1: $\\frac{\\overline{OP}}{\\overline{OQ}} = \\frac{\\overline{OR}}{\\overline{OS}}$",
          "",
          `$\\frac{${p.toFixed(1)}}{${q.toFixed(1)}} = \\frac{\\overline{OR}}{${os.toFixed(1)}}$`,
          "",
          `$\\overline{OR} = ${p.toFixed(1)} \\times \\frac{${os.toFixed(1)}}{${q.toFixed(1)}}$`,
          `$\\overline{OR} = ${((p * os) / q).toFixed(2)}$ cm`
        ]
      },
      {
        name: "PQ_berechnen",
        expectedAnswer: pq,
        description: `Gegeben sind: $\\overline{OP} = ${p.toFixed(1)}$ cm, $\\overline{OQ} = ${q.toFixed(1)}$ cm, $\\overline{OR} = ${r.toFixed(1)}$ cm. Zwei parallele Geraden schneiden zwei Strahlen mit gemeinsamen Startpunkt O. Berechne die Länge der Strecke $\\overline{PQ}$ auf dem ersten Strahl.`,
        hint: "Die Strecke $\\overline{PQ}$ ist die Differenz zwischen $\\overline{OQ}$ und $\\overline{OP}$.",
        solution: [
          "Die Strecke $\\overline{PQ}$ liegt zwischen den Punkten P und Q auf dem ersten Strahl.",
          "",
          `$\\overline{PQ} = \\overline{OQ} - \\overline{OP}$`,
          `$\\overline{PQ} = ${q.toFixed(1)} - ${p.toFixed(1)}$`,
          `$\\overline{PQ} = ${pq.toFixed(2)}$ cm`
        ]
      },
      {
        name: "RS_berechnen",
        expectedAnswer: rs,
        description: `Gegeben sind: $\\overline{OP} = ${p.toFixed(1)}$ cm, $\\overline{OQ} = ${q.toFixed(1)}$ cm, $\\overline{OR} = ${r.toFixed(1)}$ cm. Zwei parallele Geraden schneiden zwei Strahlen mit gemeinsamen Startpunkt O. Berechne die Länge der Strecke $\\overline{RS}$ auf dem zweiten Strahl.`,
        hint: "Berechne zuerst $\\overline{OS}$ mit dem Strahlensatz, dann $\\overline{RS} = \\overline{OS} - \\overline{OR}$",
        solution: [
          "Zuerst berechnen wir $\\overline{OS}$ mit Strahlensatz 1:",
          `$\\frac{\\overline{OP}}{\\overline{OQ}} = \\frac{\\overline{OR}}{\\overline{OS}}$`,
          `$\\frac{${p.toFixed(1)}}{${q.toFixed(1)}} = \\frac{${r.toFixed(1)}}{\\overline{OS}}$`,
          `$\\overline{OS} = ${os.toFixed(2)}$ cm`,
          "",
          "Dann berechnen wir $\\overline{RS}$:",
          `$\\overline{RS} = \\overline{OS} - \\overline{OR}$`,
          `$\\overline{RS} = ${os.toFixed(2)} - ${r.toFixed(1)}$`,
          `$\\overline{RS} = ${rs.toFixed(2)}$ cm`
        ]
      }
    ];
    
    const selectedType = theorem1Types[Math.floor(Math.random() * theorem1Types.length)];
    
    return {
      type: "ray1_segment",
      scenario: Math.floor(Math.random() * 4),
      p,
      q,
      r,
      expectedAnswer: selectedType.expectedAnswer,
      unit: "cm",
      tolerance: 0.2,
      description: selectedType.description,
      hint: selectedType.hint,
      solution: selectedType.solution
    };
  } else {
    // 4. DIAGONALEN MIT STRAHLENSÄTZEN - QR und PS berechenbar via ähnliche Dreiecke
    // Ähnliche Dreiecke: OQR ~ OPS
    // Verhältnis: OQ/OP = OR/OS = QR/PS (Strahlensatz!)
    
    const angle = 60 * (Math.PI / 180);
    
    // Koordinaten
    const pX = p, pY = 0;         // P auf ray1
    const qX = q, qY = 0;         // Q auf ray1
    const rX = r * Math.cos(angle), rY = r * Math.sin(angle);       // R auf ray2
    const sX = os * Math.cos(angle), sY = os * Math.sin(angle);     // S auf ray2
    
    // Diagonalen (für Berechnung)
    const qr = Math.sqrt((rX - qX) ** 2 + (rY - qY) ** 2);  // Von Q zu R
    const ps = Math.sqrt((sX - pX) ** 2 + (sY - pY) ** 2);  // Von P zu S
    
    // Verhältnis aus Strahlensatz
    const ratio = q / p;  // = OQ/OP, sollte auch = OR/OS = QR/PS sein
    
    const diagonalTypes = [
      {
        name: "QR_berechnen",
        expectedAnswer: qr,
        description: `Gegeben sind: $\\overline{OP} = ${p.toFixed(1)}$ cm, $\\overline{OQ} = ${q.toFixed(1)}$ cm, $\\overline{OR} = ${r.toFixed(1)}$ cm, $\\overline{OS} = ${os.toFixed(1)}$ cm, $\\overline{PS} = ${ps.toFixed(2)}$ cm. Zwei ähnliche Dreiecke OPS und OQR entstehen durch zwei Strahlen mit gemeinsamen Startpunkt O. Berechne mit Strahlensätzen die Länge der Strecke $\\overline{QR}$.`,
        hint: "Die Dreiecke OQR und OPS sind ähnlich! Nutze den Strahlensatz: $\\frac{\\overline{OQ}}{\\overline{OP}} = \\frac{\\overline{QR}}{\\overline{PS}}$. Stelle nach $\\overline{QR}$ um!",
        solution: [
          "Mit ähnlichen Dreiecken OQR ~ OPS gilt der Strahlensatz:",
          `$\\frac{\\overline{OQ}}{\\overline{OP}} = \\frac{\\overline{QR}}{\\overline{PS}}$`,
          "",
          `$\\frac{${q.toFixed(1)}}{${p.toFixed(1)}} = \\frac{\\overline{QR}}{${ps.toFixed(2)}}$`,
          "",
          `$\\overline{QR} = ${ps.toFixed(2)} \\times \\frac{${q.toFixed(1)}}{${p.toFixed(1)}}$`,
          `$\\overline{QR} = ${qr.toFixed(2)}$ cm`,
          "",
          `Probe: $\\frac{\\overline{OR}}{\\overline{OS}} = \\frac{${r.toFixed(1)}}{${os.toFixed(2)}} = ${(r/os).toFixed(3)}$ und $\\frac{\\overline{OQ}}{\\overline{OP}} = \\frac{${q.toFixed(1)}}{${p.toFixed(1)}} = ${(q/p).toFixed(3)}$ ✓`
        ]
      },
      {
        name: "PS_berechnen",
        expectedAnswer: ps,
        description: `Gegeben sind: $\\overline{OP} = ${p.toFixed(1)}$ cm, $\\overline{OQ} = ${q.toFixed(1)}$ cm, $\\overline{OR} = ${r.toFixed(1)}$ cm, $\\overline{OS} = ${os.toFixed(1)}$ cm, $\\overline{QR} = ${qr.toFixed(2)}$ cm. Zwei ähnliche Dreiecke OPS und OQR entstehen durch zwei Strahlen mit gemeinsamen Startpunkt O. Berechne mit Strahlensätzen die Länge der Strecke $\\overline{PS}$.`,
        hint: "Die Dreiecke OQR und OPS sind ähnlich! Nutze den Strahlensatz: $\\frac{\\overline{OP}}{\\overline{OQ}} = \\frac{\\overline{PS}}{\\overline{QR}}$. Stelle nach $\\overline{PS}$ um!",
        solution: [
          "Mit ähnlichen Dreiecken OPS ~ OQR gilt der Strahlensatz:",
          `$\\frac{\\overline{OP}}{\\overline{OQ}} = \\frac{\\overline{PS}}{\\overline{QR}}$`,
          "",
          `$\\frac{${p.toFixed(1)}}{${q.toFixed(1)}} = \\frac{\\overline{PS}}{${qr.toFixed(2)}}$`,
          "",
          `$\\overline{PS} = ${qr.toFixed(2)} \\times \\frac{${p.toFixed(1)}}{${q.toFixed(1)}}$`,
          `$\\overline{PS} = ${ps.toFixed(2)}$ cm`,
          "",
          `Probe: $\\frac{\\overline{OR}}{\\overline{OS}} = \\frac{${r.toFixed(1)}}{${os.toFixed(2)}} = ${(r/os).toFixed(3)}$ und $\\frac{\\overline{OP}}{\\overline{OQ}} = \\frac{${p.toFixed(1)}}{${q.toFixed(1)}} = ${(p/q).toFixed(3)}$ ✓`
        ]
      }
    ];
    
    const selectedType = diagonalTypes[Math.floor(Math.random() * diagonalTypes.length)];
    
    return {
      type: "diagonal_segment",
      scenario: Math.floor(Math.random() * 4),
      p,
      q,
      r,
      expectedAnswer: selectedType.expectedAnswer,
      unit: "cm",
      tolerance: 0.2,
      description: selectedType.description,
      hint: selectedType.hint,
      solution: selectedType.solution
    };
  }
}

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

const cardClass = "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6";
const buttonClass = "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-900 text-slate-50 bg-slate-900 px-4 py-2 text-sm font-semibold hover:bg-slate-800";

// Helper function to render mixed text/math content
function renderMixedMath(text: string) {
  const parts = text.split(/(\$[^$]+\$)/);
  return parts.map((part, idx) => {
    if (part.startsWith('$') && part.endsWith('$')) {
      return <InlineMath key={idx}>{part.slice(1, -1)}</InlineMath>;
    }
    return <span key={idx}>{part}</span>;
  });
}

export default function Strahlensaetze() {
  const [task, setTask] = useState<RayTask>(() => generateTask());
  const [lastAnswer, setLastAnswer] = useState<number>(() => {
    const initialTask = generateTask();
    setTask(initialTask);
    return initialTask.expectedAnswer;
  });
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showSolution, setShowSolution] = useState(false);

  const handleCheck = () => {
    const val = parseFloat(input.replace(",", "."));
    if (Number.isNaN(val)) {
      setFeedback("Bitte gib eine gültige Zahl ein.");
      return;
    }

    const withinTol = Math.abs(val - task.expectedAnswer) <= task.tolerance;
    setFeedback(
      withinTol
        ? `✓ Richtig! Die Antwort ist ${task.expectedAnswer.toFixed(2)} ${task.unit}`
        : `✗ Das ist nicht ganz richtig. ${task.hint}`
    );
    
    if (!withinTol) {
      setShowSolution(true);
    }
  };

  const handleNew = () => {
    let newTask: RayTask;
    // Stelle sicher, dass die nächste Aufgabe eine andere expectedAnswer hat
    do {
      newTask = generateTask();
    } while (Math.abs(newTask.expectedAnswer - lastAnswer) < 0.01);
    
    setTask(newTask);
    setLastAnswer(newTask.expectedAnswer);
    setInput("");
    setFeedback(null);
    setShowSolution(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="max-w-5xl mx-auto px-4 py-10 space-y-6">
        <Link
          to="/raum-und-form"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-5 w-5" />
          Zurück
        </Link>

        <div className="space-y-2 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Geometrie - Raum und Form</p>
          <h1 className="text-3xl font-bold">Strahlensätze</h1>
          <p className="text-slate-600 max-w-3xl mx-auto">
            Berechne fehlende Streckenlängen und Verhältnisse mithilfe der Strahlensätze.
          </p>
        </div>

        <div className={cardClass}>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Aufgabe</p>
              <h2 className="text-lg font-bold">Strahlensätze anwenden</h2>
            </div>
            <button className={buttonClass} onClick={handleNew}>Neue Aufgabe</button>
          </div>

          <RaySketch task={task} />

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900">
            {renderMixedMath(task.description)}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">
              Deine Antwort {task.unit && `(${task.unit})`}:
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                step="0.01"
                placeholder="Ergebnis eingeben..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
              <button
                onClick={handleCheck}
                className={buttonClass}
              >
                Prüfen
              </button>
            </div>
          </div>

          {feedback && (
            <div
              className={`rounded-lg p-4 text-sm font-medium ${
                feedback.startsWith("✓")
                  ? "bg-green-50 text-green-900 border border-green-200"
                  : "bg-yellow-50 text-yellow-900 border border-yellow-200"
              }`}
            >
              {feedback}
            </div>
          )}

          {showSolution && (
            <div className="border-t border-slate-200 pt-6 space-y-3">
              <button
                onClick={() => setShowSolution(!showSolution)}
                className="text-slate-900 hover:text-slate-700 font-semibold text-sm"
              >
                {showSolution ? "Lösung ausblenden" : "Lösung anzeigen"}
              </button>
              {showSolution && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900 space-y-2">
                  {task.solution.map((line, idx) => (
                    <div key={idx}>
                      {line.includes('$') ? (
                        renderMixedMath(line)
                      ) : (
                        <div className="font-mono text-slate-700">{line}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function RaySketch({ task }: { task: RayTask }) {
  const containerId = useId().replace(/[:]/g, "");
  const [scriptReady, setScriptReady] = useState(false);
  const [appletReady, setAppletReady] = useState(false);
  const apiRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if ((window as any).GGBApplet) {
      setScriptReady(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://www.geogebra.org/apps/deployggb.js";
    script.async = true;
    script.onload = () => setScriptReady(true);
    script.onerror = () => setScriptReady(false);
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (!scriptReady) return;
    const params = {
      id: containerId,
      appName: "classic",
      width: 700,
      height: 400,
      showToolBar: false,
      showMenuBar: false,
      showAlgebraInput: false,
      showResetIcon: false,
      showZoomButtons: false,
      allowStyleBar: false,
      enableShiftDragZoom: false,
      perspective: "G",
      showGrid: false,
      showAxes: false,
      language: "de",
      appletOnLoad: () => {
        const api = (window as any)[containerId] || (window as any).ggbApplet;
        apiRef.current = api;
        setAppletReady(true);
      }
    } as any;

    const applet = new (window as any).GGBApplet(params, true);
    const inject = () => applet.inject(containerId);
    if (document.readyState === "complete") {
      inject();
    } else {
      window.addEventListener("load", inject, { once: true });
    }

    return () => {
      try {
        applet.remove?.();
      } catch (err) {
        console.warn("GeoGebra cleanup failed", err);
      }
    };
  }, [scriptReady, containerId]);

  useEffect(() => {
    if (!appletReady || !apiRef.current) return;
    drawRays(apiRef.current, task);
  }, [appletReady, task]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-2 mx-auto flex justify-center">
      {!scriptReady && <div className="h-96 w-full animate-pulse rounded-xl bg-slate-100" />}
      <div id={containerId} className="w-full" />
    </div>
  );
}

function drawRays(api: any, task: RayTask) {
  if (!api) return;
  try {
    api.reset();
    api.setGridVisible(false);
    api.setAxesVisible(false, false);
    api.setPointSize(6);

    // Zufällige Position und Winkel für O
    const originVariant = Math.floor(Math.random() * 4);
    let originX, originY, angle1, angle2;
    
    if (originVariant === 0) {
      // Links unten
      originX = 1.5;
      originY = 1.5;
      angle1 = 30;
      angle2 = -30;
    } else if (originVariant === 1) {
      // Rechts oben
      originX = 8;
      originY = 3.5;
      angle1 = 160;
      angle2 = -160;
    } else if (originVariant === 2) {
      // Mitte
      originX = 4;
      originY = 2;
      angle1 = 50;
      angle2 = -50;
    } else {
      // Rechts unten
      originX = 7.5;
      originY = 1;
      angle1 = 120;
      angle2 = -120;
    }

    // Startpunkt O
    api.evalCommand(`O=(${originX},${originY})`);
    api.setPointStyle("O", 0);
    api.setLabelVisible("O", true);

    // Zwei Strahlen - SCHWARZ und DICK
    const rad1 = (angle1 * Math.PI) / 180;
    const endX1 = originX + 10 * Math.cos(rad1);
    const endY1 = originY + 10 * Math.sin(rad1);
    api.evalCommand(`ray1 = Ray(O, (${endX1.toFixed(2)}, ${endY1.toFixed(2)}))`);
    api.setColor("ray1", 0, 0, 0);
    api.setLineThickness("ray1", 4);
    api.setLabelVisible("ray1", false);

    const rad2 = (angle2 * Math.PI) / 180;
    const endX2 = originX + 10 * Math.cos(rad2);
    const endY2 = originY + 10 * Math.sin(rad2);
    api.evalCommand(`ray2 = Ray(O, (${endX2.toFixed(2)}, ${endY2.toFixed(2)}))`);
    api.setColor("ray2", 0, 0, 0);
    api.setLineThickness("ray2", 4);
    api.setLabelVisible("ray2", false);

    // Skalierung für Punkte
    const p = task.p / 2.5;
    const q = task.q / 2.5;
    const r = task.r / 2.5;
    const s = (p * r) / q;

    // Punkte auf den Strahlen
    const x_p = originX + p * Math.cos(rad1);
    const y_p = originY + p * Math.sin(rad1);
    const x_q = originX + q * Math.cos(rad1);
    const y_q = originY + q * Math.sin(rad1);
    const x_r = originX + r * Math.cos(rad2);
    const y_r = originY + r * Math.sin(rad2);
    const x_s = originX + s * Math.cos(rad2);
    const y_s = originY + s * Math.sin(rad2);

    // Punkte definieren
    api.evalCommand(`P=(${x_p.toFixed(2)}, ${y_p.toFixed(2)})`);
    api.evalCommand(`Q=(${x_q.toFixed(2)}, ${y_q.toFixed(2)})`);
    api.evalCommand(`R=(${x_r.toFixed(2)}, ${y_r.toFixed(2)})`);
    api.evalCommand(`S=(${x_s.toFixed(2)}, ${y_s.toFixed(2)})`);

    // Punkte styling
    ["P", "Q", "R", "S"].forEach(pt => {
      api.setPointStyle(pt, 0);
      api.setLabelVisible(pt, true);
    });

    // Parallele Geraden - GRÜN und DICK (für beide Strahlensatz-Typen)
    // Gerade 1 durch Q und R
    api.evalCommand(`g1 = Line(Q, R)`);
    api.setColor("g1", 34, 139, 34);
    api.setLineThickness("g1", 3);
    api.setLabelVisible("g1", false);

    // Gerade 2 durch P und S (parallel zu g1)
    api.evalCommand(`g2 = Line(P, S)`);
    api.setColor("g2", 34, 139, 34);
    api.setLineThickness("g2", 3);
    api.setLabelVisible("g2", false);

    api.setCoordSystem(-1, 11, -4, 6);
  } catch (err) {
    console.warn("GeoGebra draw failed", err);
  }
}

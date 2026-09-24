import { useEffect, useId, useRef, useState } from "react";
import { InlineMath } from "react-katex";
import TaskLayout from "../../components/raum-und-form/TaskLayout";

type RayLabels = {
  center: string;
  near1: string;
  far1: string;
  near2: string;
  far2: string;
};

type RayTask = {
  type: "ray1_segment" | "ray2_segment" | "parallel_segment" | "similarity_segment";
  scenario: number;
  p: number;
  q: number;
  r: number;
  labels: RayLabels;
  expectedAnswer: number;
  unit: string;
  tolerance: number;
  description: string;
  hint: string;
  solution: string[];
};

// Ohne I (zu leicht mit 1/l zu verwechseln) - sorgt für abwechslungsreiche
// Beschriftungen statt immer derselben Buchstaben O, P, Q, R, S.
const LABEL_POOL = "ABCDEFGHJKLMNOPQRSTUVWXYZ".split("");

function pickLabels(): RayLabels {
  const pool = [...LABEL_POOL];
  const take = () => pool.splice(Math.floor(Math.random() * pool.length), 1)[0];
  return { center: take(), near1: take(), far1: take(), near2: take(), far2: take() };
}

function generateTask(): RayTask {
  const labels = pickLabels();
  const { center: O, near1: P, far1: Q, near2: R, far2: S } = labels;
  const ov = (a: string, b: string) => `\\overline{${a}${b}}`;
  const OP = ov(O, P), OQ = ov(O, Q), OR = ov(O, R), OS = ov(O, S);
  const PQ = ov(P, Q), RS = ov(R, S), PR = ov(P, R), QS = ov(Q, S);

  // Zufällig Zahlenwerte generieren
  // Bereiche gewählt, um geometrisch sinnvolle Aufgaben zu garantieren (rs > 0)
  const p = randomBetween(2, 3.5);
  const q = randomBetween(8, 12);
  const r = randomBetween(5, 8);  // R weiter von O entfernt

  // Berechnete Werte
  const pq = q - p;  // Abschnitt PQ
  const os = (q * r) / p;  // OS nach Strahlensatz 1
  const rs = os - r;  // Abschnitt RS

  // Zufällig Task-Kategorie wählen: 0) Strahlensatz 1, 1) Parallele Geraden, 2) Strahlensatz 2, 3) Ähnliche Dreiecke
  const taskCategory = Math.floor(Math.random() * 4);

  if (taskCategory === 2) {
    // 2. STRAHLENSATZ - Aufgabentypen (zwischen Parallelen auf den Strahlen)
    const theorem2Types = [
      {
        name: "PQ_berechnen",
        expectedAnswer: (p * rs) / r,
        description: `Gegeben sind: $${OP} = ${p.toFixed(1)}$ cm, $${OR} = ${r.toFixed(1)}$ cm, $${RS} = ${rs.toFixed(1)}$ cm. Zwei parallele Geraden schneiden zwei Strahlen mit gemeinsamem Startpunkt ${O}. Berechne die Länge der Strecke $${PQ}$ (zwischen den parallelen Geraden auf dem ersten Strahl).`,
        hint: `Strahlensatz 2: $\\frac{${PQ}}{${RS}} = \\frac{${OP}}{${OR}}$. Stelle nach $${PQ}$ um!`,
        solution: [
          `Strahlensatz 2: $\\frac{${PQ}}{${RS}} = \\frac{${OP}}{${OR}}$`,
          "",
          `$\\frac{${PQ}}{${rs.toFixed(1)}} = \\frac{${p.toFixed(1)}}{${r.toFixed(1)}}$`,
          "",
          `$${PQ} = ${rs.toFixed(1)} \\times \\frac{${p.toFixed(1)}}{${r.toFixed(1)}}$`,
          `$${PQ} = ${((p * rs) / r).toFixed(2)}$ cm`
        ]
      },
      {
        name: "RS_berechnen",
        expectedAnswer: (pq * r) / p,
        description: `Gegeben sind: $${OP} = ${p.toFixed(1)}$ cm, $${OR} = ${r.toFixed(1)}$ cm, $${PQ} = ${pq.toFixed(1)}$ cm. Zwei parallele Geraden schneiden zwei Strahlen mit gemeinsamem Startpunkt ${O}. Berechne die Länge der Strecke $${RS}$ (zwischen den parallelen Geraden auf dem zweiten Strahl).`,
        hint: `Strahlensatz 2: $\\frac{${PQ}}{${RS}} = \\frac{${OP}}{${OR}}$. Stelle nach $${RS}$ um!`,
        solution: [
          `Strahlensatz 2: $\\frac{${PQ}}{${RS}} = \\frac{${OP}}{${OR}}$`,
          "",
          `$\\frac{${pq.toFixed(1)}}{${RS}} = \\frac{${p.toFixed(1)}}{${r.toFixed(1)}}$`,
          "",
          `$${RS} = ${pq.toFixed(1)} \\times \\frac{${r.toFixed(1)}}{${p.toFixed(1)}}$`,
          `$${RS} = ${((pq * r) / p).toFixed(2)}$ cm`
        ]
      },
      {
        name: "OP_berechnen",
        expectedAnswer: p,
        description: `Gegeben sind: $${PQ} = ${pq.toFixed(1)}$ cm, $${OR} = ${r.toFixed(1)}$ cm, $${RS} = ${rs.toFixed(1)}$ cm. Zwei parallele Geraden schneiden zwei Strahlen mit gemeinsamem Startpunkt ${O}. Berechne die Länge der Strecke $${OP}$.`,
        hint: `Strahlensatz 2: $\\frac{${PQ}}{${RS}} = \\frac{${OP}}{${OR}}$. Stelle nach $${OP}$ um!`,
        solution: [
          `Strahlensatz 2: $\\frac{${PQ}}{${RS}} = \\frac{${OP}}{${OR}}$`,
          "",
          `$\\frac{${pq.toFixed(1)}}{${rs.toFixed(1)}} = \\frac{${OP}}{${r.toFixed(1)}}$`,
          "",
          `$${OP} = ${r.toFixed(1)} \\times \\frac{${pq.toFixed(1)}}{${rs.toFixed(1)}}$`,
          `$${OP} = ${p.toFixed(2)}$ cm`
        ]
      },
      {
        name: "OR_berechnen",
        expectedAnswer: r,
        description: `Gegeben sind: $${PQ} = ${pq.toFixed(1)}$ cm, $${OP} = ${p.toFixed(1)}$ cm, $${RS} = ${rs.toFixed(1)}$ cm. Zwei parallele Geraden schneiden zwei Strahlen mit gemeinsamem Startpunkt ${O}. Berechne die Länge der Strecke $${OR}$.`,
        hint: `Strahlensatz 2: $\\frac{${PQ}}{${RS}} = \\frac{${OP}}{${OR}}$. Stelle nach $${OR}$ um!`,
        solution: [
          `Strahlensatz 2: $\\frac{${PQ}}{${RS}} = \\frac{${OP}}{${OR}}$`,
          "",
          `$\\frac{${pq.toFixed(1)}}{${rs.toFixed(1)}} = \\frac{${p.toFixed(1)}}{${OR}}$`,
          "",
          `$${OR} = ${p.toFixed(1)} \\times \\frac{${rs.toFixed(1)}}{${pq.toFixed(1)}}$`,
          `$${OR} = ${r.toFixed(2)}$ cm`
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
      labels,
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
        description: `Gegeben sind: $${OP} = ${p.toFixed(1)}$ cm, $${OQ} = ${q.toFixed(1)}$ cm. Zwei parallele Geraden schneiden zwei Strahlen mit gemeinsamem Startpunkt ${O}. Berechne die Länge der Strecke $${PQ}$ auf dem ersten Strahl.`,
        hint: `Die Strecke ${P}${Q} liegt auf dem ersten Strahl zwischen den Punkten ${P} und ${Q}.`,
        solution: [
          `$${PQ} = ${OQ} - ${OP}$`,
          `$${PQ} = ${q.toFixed(1)} - ${p.toFixed(1)}$`,
          `$${PQ} = ${pq.toFixed(2)}$ cm`
        ]
      },
      {
        name: "RS_auf_strahl",
        expectedAnswer: rs,
        description: `Gegeben sind: $${OP} = ${p.toFixed(1)}$ cm, $${OQ} = ${q.toFixed(1)}$ cm, $${OR} = ${r.toFixed(1)}$ cm. Zwei parallele Geraden schneiden zwei Strahlen mit gemeinsamem Startpunkt ${O}. Berechne die Länge der Strecke $${RS}$ auf dem zweiten Strahl.`,
        hint: `Berechne zuerst $${OS}$ mit dem Strahlensatz 1, dann $${RS} = ${OS} - ${OR}$.`,
        solution: [
          `Zuerst berechnen wir $${OS}$ mit Strahlensatz 1:`,
          `$\\frac{${OP}}{${OQ}} = \\frac{${OR}}{${OS}}$`,
          `$\\frac{${p.toFixed(1)}}{${q.toFixed(1)}} = \\frac{${r.toFixed(1)}}{${OS}}$`,
          `$${OS} = ${os.toFixed(2)}$ cm`,
          "",
          `Dann berechnen wir $${RS}$:`,
          `$${RS} = ${OS} - ${OR}$`,
          `$${RS} = ${os.toFixed(2)} - ${r.toFixed(1)}$`,
          `$${RS} = ${rs.toFixed(2)}$ cm`
        ]
      },
      {
        name: "OP_auf_strahl",
        expectedAnswer: p,
        description: `Gegeben sind: $${OQ} = ${q.toFixed(1)}$ cm, $${OR} = ${r.toFixed(1)}$ cm, $${OS} = ${os.toFixed(1)}$ cm. Zwei parallele Geraden schneiden zwei Strahlen mit gemeinsamem Startpunkt ${O}. Berechne die Länge der Strecke $${OP}$ auf dem ersten Strahl.`,
        hint: `Strahlensatz 1: $\\frac{${OP}}{${OQ}} = \\frac{${OR}}{${OS}}$. Stelle nach $${OP}$ um!`,
        solution: [
          `Strahlensatz 1: $\\frac{${OP}}{${OQ}} = \\frac{${OR}}{${OS}}$`,
          "",
          `$\\frac{${OP}}{${q.toFixed(1)}} = \\frac{${r.toFixed(1)}}{${os.toFixed(1)}}$`,
          "",
          `$${OP} = ${q.toFixed(1)} \\times \\frac{${r.toFixed(1)}}{${os.toFixed(1)}}$`,
          `$${OP} = ${p.toFixed(2)}$ cm`
        ]
      },
      {
        name: "OR_auf_strahl",
        expectedAnswer: r,
        description: `Gegeben sind: $${OP} = ${p.toFixed(1)}$ cm, $${OQ} = ${q.toFixed(1)}$ cm, $${OS} = ${os.toFixed(1)}$ cm. Zwei parallele Geraden schneiden zwei Strahlen mit gemeinsamem Startpunkt ${O}. Berechne die Länge der Strecke $${OR}$ auf dem zweiten Strahl.`,
        hint: `Strahlensatz 1: $\\frac{${OP}}{${OQ}} = \\frac{${OR}}{${OS}}$. Stelle nach $${OR}$ um!`,
        solution: [
          `Strahlensatz 1: $\\frac{${OP}}{${OQ}} = \\frac{${OR}}{${OS}}$`,
          "",
          `$\\frac{${p.toFixed(1)}}{${q.toFixed(1)}} = \\frac{${OR}}{${os.toFixed(1)}}$`,
          "",
          `$${OR} = ${p.toFixed(1)} \\times \\frac{${os.toFixed(1)}}{${q.toFixed(1)}}$`,
          `$${OR} = ${r.toFixed(2)}$ cm`
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
      labels,
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
        description: `Gegeben sind: $${OP} = ${p.toFixed(1)}$ cm, $${OQ} = ${q.toFixed(1)}$ cm, $${OR} = ${r.toFixed(1)}$ cm. Zwei parallele Geraden schneiden zwei Strahlen mit gemeinsamem Startpunkt ${O}. Berechne die Länge der Strecke $${OS}$.`,
        hint: `Strahlensatz 1: $\\frac{${OP}}{${OQ}} = \\frac{${OR}}{${OS}}$. Stelle nach $${OS}$ um!`,
        solution: [
          `Strahlensatz 1: $\\frac{${OP}}{${OQ}} = \\frac{${OR}}{${OS}}$`,
          "",
          `$\\frac{${p.toFixed(1)}}{${q.toFixed(1)}} = \\frac{${r.toFixed(1)}}{${OS}}$`,
          "",
          `$${OS} = ${r.toFixed(1)} \\times \\frac{${q.toFixed(1)}}{${p.toFixed(1)}}$`,
          `$${OS} = ${os.toFixed(2)}$ cm`
        ]
      },
      {
        name: "OQ_berechnen",
        expectedAnswer: q,
        description: `Gegeben sind: $${OP} = ${p.toFixed(1)}$ cm, $${OR} = ${r.toFixed(1)}$ cm, $${OS} = ${os.toFixed(1)}$ cm. Zwei parallele Geraden schneiden zwei Strahlen mit gemeinsamem Startpunkt ${O}. Berechne die Länge der Strecke $${OQ}$.`,
        hint: `Strahlensatz 1: $\\frac{${OP}}{${OQ}} = \\frac{${OR}}{${OS}}$. Stelle nach $${OQ}$ um!`,
        solution: [
          `Strahlensatz 1: $\\frac{${OP}}{${OQ}} = \\frac{${OR}}{${OS}}$`,
          "",
          `$\\frac{${p.toFixed(1)}}{${OQ}} = \\frac{${r.toFixed(1)}}{${os.toFixed(1)}}$`,
          "",
          `$${OQ} = ${p.toFixed(1)} \\times \\frac{${os.toFixed(1)}}{${r.toFixed(1)}}$`,
          `$${OQ} = ${q.toFixed(2)}$ cm`
        ]
      },
      {
        name: "OR_berechnen",
        expectedAnswer: (p * os) / q,
        description: `Gegeben sind: $${OP} = ${p.toFixed(1)}$ cm, $${OQ} = ${q.toFixed(1)}$ cm, $${OS} = ${os.toFixed(1)}$ cm. Zwei parallele Geraden schneiden zwei Strahlen mit gemeinsamem Startpunkt ${O}. Berechne die Länge der Strecke $${OR}$.`,
        hint: `Strahlensatz 1: $\\frac{${OP}}{${OQ}} = \\frac{${OR}}{${OS}}$. Stelle nach $${OR}$ um!`,
        solution: [
          `Strahlensatz 1: $\\frac{${OP}}{${OQ}} = \\frac{${OR}}{${OS}}$`,
          "",
          `$\\frac{${p.toFixed(1)}}{${q.toFixed(1)}} = \\frac{${OR}}{${os.toFixed(1)}}$`,
          "",
          `$${OR} = ${p.toFixed(1)} \\times \\frac{${os.toFixed(1)}}{${q.toFixed(1)}}$`,
          `$${OR} = ${((p * os) / q).toFixed(2)}$ cm`
        ]
      },
      {
        name: "PQ_berechnen",
        expectedAnswer: pq,
        description: `Gegeben sind: $${OP} = ${p.toFixed(1)}$ cm, $${OQ} = ${q.toFixed(1)}$ cm, $${OR} = ${r.toFixed(1)}$ cm. Zwei parallele Geraden schneiden zwei Strahlen mit gemeinsamem Startpunkt ${O}. Berechne die Länge der Strecke $${PQ}$ auf dem ersten Strahl.`,
        hint: `Die Strecke $${PQ}$ ist die Differenz zwischen $${OQ}$ und $${OP}$.`,
        solution: [
          `Die Strecke $${PQ}$ liegt zwischen den Punkten ${P} und ${Q} auf dem ersten Strahl.`,
          "",
          `$${PQ} = ${OQ} - ${OP}$`,
          `$${PQ} = ${q.toFixed(1)} - ${p.toFixed(1)}$`,
          `$${PQ} = ${pq.toFixed(2)}$ cm`
        ]
      },
      {
        name: "RS_berechnen",
        expectedAnswer: rs,
        description: `Gegeben sind: $${OP} = ${p.toFixed(1)}$ cm, $${OQ} = ${q.toFixed(1)}$ cm, $${OR} = ${r.toFixed(1)}$ cm. Zwei parallele Geraden schneiden zwei Strahlen mit gemeinsamem Startpunkt ${O}. Berechne die Länge der Strecke $${RS}$ auf dem zweiten Strahl.`,
        hint: `Berechne zuerst $${OS}$ mit dem Strahlensatz, dann $${RS} = ${OS} - ${OR}$`,
        solution: [
          `Zuerst berechnen wir $${OS}$ mit Strahlensatz 1:`,
          `$\\frac{${OP}}{${OQ}} = \\frac{${OR}}{${OS}}$`,
          `$\\frac{${p.toFixed(1)}}{${q.toFixed(1)}} = \\frac{${r.toFixed(1)}}{${OS}}$`,
          `$${OS} = ${os.toFixed(2)}$ cm`,
          "",
          `Dann berechnen wir $${RS}$:`,
          `$${RS} = ${OS} - ${OR}$`,
          `$${RS} = ${os.toFixed(2)} - ${r.toFixed(1)}$`,
          `$${RS} = ${rs.toFixed(2)}$ cm`
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
      labels,
      expectedAnswer: selectedType.expectedAnswer,
      unit: "cm",
      tolerance: 0.2,
      description: selectedType.description,
      hint: selectedType.hint,
      solution: selectedType.solution
    };
  } else {
    // 4. VERBINDENDE STRECKEN PR und QS - ähnliche Dreiecke OPR und OQS
    // O, P, R liegen im "nahen" Dreieck, O, Q, S im "fernen" Dreieck.
    // Beide Dreiecke teilen den Winkel bei O, und die anliegenden Seiten stehen
    // im gleichen Verhältnis (OP/OQ = OR/OS, siehe Strahlensatz 1 oben) - damit
    // sind sie nach SAS ähnlich, unabhängig vom tatsächlichen Winkel bei O:
    // OP/OQ = OR/OS = PR/QS.
    // PR selbst ist geometrisch frei wählbar (hängt vom Winkel bei O ab); wir
    // wählen einen Wert, der die Dreiecksungleichung in Dreieck OPR erfüllt.
    const minPr = Math.abs(p - r) + 0.5;
    const maxPr = p + r - 0.5;
    const pr = randomBetween(minPr, maxPr);
    const qs = pr * (q / p);

    const similarityTypes = [
      {
        name: "QS_berechnen",
        expectedAnswer: qs,
        description: `Gegeben sind: $${OP} = ${p.toFixed(1)}$ cm, $${OQ} = ${q.toFixed(1)}$ cm, $${OR} = ${r.toFixed(1)}$ cm, $${OS} = ${os.toFixed(1)}$ cm, $${PR} = ${pr.toFixed(2)}$ cm. Die Strecken $${PR}$ (nahe Punkte) und $${QS}$ (ferne Punkte) verbinden die beiden Strahlen und sind parallel zueinander. Die Dreiecke $${O}${P}${R}$ und $${O}${Q}${S}$ sind ähnlich. Berechne die Länge der Strecke $${QS}$.`,
        hint: `Die Dreiecke ${O}${P}${R} und ${O}${Q}${S} sind ähnlich (gemeinsamer Winkel bei ${O}, anliegende Seiten im gleichen Verhältnis): $\\frac{${OP}}{${OQ}} = \\frac{${OR}}{${OS}} = \\frac{${PR}}{${QS}}$. Stelle nach $${QS}$ um!`,
        solution: [
          `Die Dreiecke ${O}${P}${R} und ${O}${Q}${S} sind ähnlich, da sie den Winkel bei ${O} gemeinsam haben und die anliegenden Seiten im gleichen Verhältnis stehen:`,
          `Probe: $\\frac{${OP}}{${OQ}} = \\frac{${p.toFixed(1)}}{${q.toFixed(1)}} = ${(p / q).toFixed(3)}$ und $\\frac{${OR}}{${OS}} = \\frac{${r.toFixed(1)}}{${os.toFixed(1)}} = ${(r / os).toFixed(3)}$ ✓`,
          "",
          `$\\frac{${PR}}{${QS}} = \\frac{${OP}}{${OQ}}$`,
          `$\\frac{${pr.toFixed(2)}}{${QS}} = \\frac{${p.toFixed(1)}}{${q.toFixed(1)}}$`,
          `$${QS} = ${pr.toFixed(2)} \\times \\frac{${q.toFixed(1)}}{${p.toFixed(1)}}$`,
          `$${QS} = ${qs.toFixed(2)}$ cm`
        ]
      },
      {
        name: "PR_berechnen",
        expectedAnswer: pr,
        description: `Gegeben sind: $${OP} = ${p.toFixed(1)}$ cm, $${OQ} = ${q.toFixed(1)}$ cm, $${OR} = ${r.toFixed(1)}$ cm, $${OS} = ${os.toFixed(1)}$ cm, $${QS} = ${qs.toFixed(2)}$ cm. Die Strecken $${PR}$ (nahe Punkte) und $${QS}$ (ferne Punkte) verbinden die beiden Strahlen und sind parallel zueinander. Die Dreiecke $${O}${P}${R}$ und $${O}${Q}${S}$ sind ähnlich. Berechne die Länge der Strecke $${PR}$.`,
        hint: `Die Dreiecke ${O}${P}${R} und ${O}${Q}${S} sind ähnlich (gemeinsamer Winkel bei ${O}, anliegende Seiten im gleichen Verhältnis): $\\frac{${OP}}{${OQ}} = \\frac{${OR}}{${OS}} = \\frac{${PR}}{${QS}}$. Stelle nach $${PR}$ um!`,
        solution: [
          `Die Dreiecke ${O}${P}${R} und ${O}${Q}${S} sind ähnlich, da sie den Winkel bei ${O} gemeinsam haben und die anliegenden Seiten im gleichen Verhältnis stehen:`,
          `Probe: $\\frac{${OP}}{${OQ}} = \\frac{${p.toFixed(1)}}{${q.toFixed(1)}} = ${(p / q).toFixed(3)}$ und $\\frac{${OR}}{${OS}} = \\frac{${r.toFixed(1)}}{${os.toFixed(1)}} = ${(r / os).toFixed(3)}$ ✓`,
          "",
          `$\\frac{${PR}}{${QS}} = \\frac{${OP}}{${OQ}}$`,
          `$\\frac{${PR}}{${qs.toFixed(2)}} = \\frac{${p.toFixed(1)}}{${q.toFixed(1)}}$`,
          `$${PR} = ${qs.toFixed(2)} \\times \\frac{${p.toFixed(1)}}{${q.toFixed(1)}}$`,
          `$${PR} = ${pr.toFixed(2)}$ cm`
        ]
      }
    ];

    const selectedType = similarityTypes[Math.floor(Math.random() * similarityTypes.length)];

    return {
      type: "similarity_segment",
      scenario: Math.floor(Math.random() * 4),
      p,
      q,
      r,
      labels,
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
    const val = parseFloat(input.replace(",", ".").replace(/[−–—‐]/g, '-'));
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
    <TaskLayout
      breadcrumbs={[{ label: "Raum & Form", href: "/raum-und-form" }, { label: "Strahlensätze" }]}
      title="Strahlensätze"
      description="Berechne fehlende Streckenlängen und Verhältnisse mithilfe der Strahlensätze."
      backHref="/raum-und-form"
    >
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
              {renderMixedMath(feedback)}
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
    </TaskLayout>
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
      showResetIcon: true,
      showZoomButtons: true,
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

    const { center: O, near1: P, far1: Q, near2: R, far2: S } = task.labels;

    // Zufällige Position und Winkel für den Zentrumspunkt
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

    // Zentrumspunkt
    api.evalCommand(`${O}=(${originX},${originY})`);
    api.setPointStyle(O, 0);
    api.setLabelVisible(O, true);

    // Zwei Strahlen - SCHWARZ und DICK
    const rad1 = (angle1 * Math.PI) / 180;
    const endX1 = originX + 10 * Math.cos(rad1);
    const endY1 = originY + 10 * Math.sin(rad1);
    api.evalCommand(`ray1 = Ray(${O}, (${endX1.toFixed(2)}, ${endY1.toFixed(2)}))`);
    api.setColor("ray1", 0, 0, 0);
    api.setLineThickness("ray1", 4);
    api.setLabelVisible("ray1", false);

    const rad2 = (angle2 * Math.PI) / 180;
    const endX2 = originX + 10 * Math.cos(rad2);
    const endY2 = originY + 10 * Math.sin(rad2);
    api.evalCommand(`ray2 = Ray(${O}, (${endX2.toFixed(2)}, ${endY2.toFixed(2)}))`);
    api.setColor("ray2", 0, 0, 0);
    api.setLineThickness("ray2", 4);
    api.setLabelVisible("ray2", false);

    // Skalierung für Punkte
    const p = task.p / 2.5;
    const q = task.q / 2.5;
    const r = task.r / 2.5;
    // Strahlensatz 1: OP/OQ = OR/OS => OS = OQ*OR/OP (identische Formel wie in generateTask)
    const s = (q * r) / p;

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
    api.evalCommand(`${P}=(${x_p.toFixed(2)}, ${y_p.toFixed(2)})`);
    api.evalCommand(`${Q}=(${x_q.toFixed(2)}, ${y_q.toFixed(2)})`);
    api.evalCommand(`${R}=(${x_r.toFixed(2)}, ${y_r.toFixed(2)})`);
    api.evalCommand(`${S}=(${x_s.toFixed(2)}, ${y_s.toFixed(2)})`);

    // Punkte styling
    [P, Q, R, S].forEach(pt => {
      api.setPointStyle(pt, 0);
      api.setLabelVisible(pt, true);
    });

    // Parallele Strecken - GRÜN und DICK: nahe Punkte P-R, ferne Punkte Q-S.
    // Das sind die einzigen beiden Paarungen, die (bei OS = OQ*OR/OP) tatsächlich
    // parallel zueinander sind und die ähnlichen Dreiecke OPR/OQS aufspannen.
    api.evalCommand(`g1 = Segment(${P}, ${R})`);
    api.setColor("g1", 34, 139, 34);
    api.setLineThickness("g1", 3);
    api.setLabelVisible("g1", false);

    api.evalCommand(`g2 = Segment(${Q}, ${S})`);
    api.setColor("g2", 34, 139, 34);
    api.setLineThickness("g2", 3);
    api.setLabelVisible("g2", false);

    // Die beiden ähnlichen Dreiecke leicht einfärben, damit sichtbar wird,
    // dass OPR (klein) und OQS (groß) zueinander ähnlich sind. Polygon() legt
    // dabei automatisch eigene Kanten-Objekte an (überlagern Strahlen/g1/g2) -
    // die werden ausgeblendet, nur die Füllung soll sichtbar bleiben.
    const hidePolygonEdges = (labels: string) => {
      labels
        .split(",")
        .map((lbl) => lbl.trim())
        .filter(Boolean)
        .slice(1)
        .forEach((edge) => api.setVisible(edge, false));
    };
    hidePolygonEdges(api.evalCommandGetLabels(`triSmall = Polygon(${O}, ${P}, ${R})`) ?? "");
    api.setColor("triSmall", 59, 130, 246);
    api.setFilling("triSmall", 0.12);
    api.setLabelVisible("triSmall", false);

    hidePolygonEdges(api.evalCommandGetLabels(`triBig = Polygon(${O}, ${Q}, ${S})`) ?? "");
    api.setColor("triBig", 59, 130, 246);
    api.setFilling("triBig", 0.05);
    api.setLabelVisible("triBig", false);

    // Sichtbereich aus den tatsächlichen Punktkoordinaten berechnen (statt fest
    // codiert) - sonst fallen bei großen OS-Werten Punkte wie S aus dem Bild.
    const xs = [originX, x_p, x_q, x_r, x_s];
    const ys = [originY, y_p, y_q, y_r, y_s];
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const padX = (maxX - minX) * 0.2 || 1;
    const padY = (maxY - minY) * 0.2 || 1;
    let x0 = minX - padX;
    let x1 = maxX + padX;
    let y0 = minY - padY;
    let y1 = maxY + padY;
    const targetRatio = 700 / 400; // width/height des Applets (siehe RaySketch)
    const w = x1 - x0;
    const h = y1 - y0;
    if (w / h < targetRatio) {
      const extra = (h * targetRatio - w) / 2;
      x0 -= extra;
      x1 += extra;
    } else {
      const extra = (w / targetRatio - h) / 2;
      y0 -= extra;
      y1 += extra;
    }
    api.setCoordSystem(x0, x1, y0, y1);
  } catch (err) {
    console.warn("GeoGebra draw failed", err);
  }
}

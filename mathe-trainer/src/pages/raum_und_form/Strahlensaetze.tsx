import { useEffect, useId, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { InlineMath } from "react-katex";

type RayTask = {
  type: "ray1_segment" | "ray1_ratio" | "ray2_segment" | "ray2_ratio" | "similarity";
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
  // Zufällig eine der 8 Aufgaben auswählen
  const taskIndex = Math.floor(Math.random() * 8);
  const p = randomBetween(2, 5);
  const q = randomBetween(6, 10);
  const r = randomBetween(3, 6);

  const createTask = (
    type: "ray1_segment" | "ray1_ratio" | "ray2_segment" | "ray2_ratio" | "similarity",
    scenario: number,
    expectedAnswer: number,
    description: string,
    hint: string,
    solution: string[]
  ): RayTask => ({
    type,
    scenario,
    p,
    q,
    r,
    expectedAnswer,
    unit: "cm",
    tolerance: 0.2,
    description,
    hint,
    solution
  });

  const tasks: RayTask[] = [
    // Aufgabe 0: |OS| berechnen
    createTask(
      "ray1_segment",
      0,
      (q * r) / p,
      `Gegeben sind: $\\overline{OP} = ${p.toFixed(1)}$ cm, $\\overline{OQ} = ${q.toFixed(1)}$ cm, $\\overline{OR} = ${r.toFixed(1)}$ cm. Zwei parallele Geraden schneiden zwei Strahlen mit gemeinsamen Startpunkt O. Berechne die Länge der Strecke $\\overline{OS}$.`,
      "Strahlensatz 1: $\\frac{\\overline{OP}}{\\overline{OQ}} = \\frac{\\overline{OR}}{\\overline{OS}}$. Stelle nach $\\overline{OS}$ um!",
      [
        "Strahlensatz 1: $\\frac{\\overline{OP}}{\\overline{OQ}} = \\frac{\\overline{OR}}{\\overline{OS}}$",
        "",
        `$\\frac{${p.toFixed(1)}}{${q.toFixed(1)}} = \\frac{${r.toFixed(1)}}{\\overline{OS}}$`,
        "",
        `$\\overline{OS} = ${r.toFixed(1)} \\times \\frac{${q.toFixed(1)}}{${p.toFixed(1)}}$`,
        `$\\overline{OS} = ${((q * r) / p).toFixed(2)}$ cm`
      ]
    ),
    // Aufgabe 1: |OQ| berechnen
    createTask(
      "ray1_segment",
      1,
      q,
      `Gegeben sind: $\\overline{OP} = ${p.toFixed(1)}$ cm, $\\overline{OR} = ${r.toFixed(1)}$ cm, $\\overline{OS} = ${((q * r) / p).toFixed(1)}$ cm. Zwei parallele Geraden schneiden zwei Strahlen mit gemeinsamen Startpunkt O. Berechne die Länge der Strecke $\\overline{OQ}$.`,
      "Strahlensatz 1: $\\frac{\\overline{OP}}{\\overline{OQ}} = \\frac{\\overline{OR}}{\\overline{OS}}$. Stelle nach $\\overline{OQ}$ um!",
      [
        "Strahlensatz 1: $\\frac{\\overline{OP}}{\\overline{OQ}} = \\frac{\\overline{OR}}{\\overline{OS}}$",
        "",
        `$\\frac{${p.toFixed(1)}}{\\overline{OQ}} = \\frac{${r.toFixed(1)}}{${((q * r) / p).toFixed(1)}}$`,
        "",
        `$\\overline{OQ} = ${p.toFixed(1)} \\times \\frac{${((q * r) / p).toFixed(1)}}{${r.toFixed(1)}}$`,
        `$\\overline{OQ} = ${q.toFixed(2)}$ cm`
      ]
    ),
    // Aufgabe 2: |OR| berechnen
    createTask(
      "ray1_segment",
      2,
      (p * r) / q,
      `Gegeben sind: $\\overline{OP} = ${p.toFixed(1)}$ cm, $\\overline{OQ} = ${q.toFixed(1)}$ cm, $\\overline{OS} = ${r.toFixed(1)}$ cm. Zwei parallele Geraden schneiden zwei Strahlen mit gemeinsamen Startpunkt O. Berechne die Länge der Strecke $\\overline{OR}$.`,
      "Strahlensatz 1: $\\frac{\\overline{OP}}{\\overline{OQ}} = \\frac{\\overline{OR}}{\\overline{OS}}$. Stelle nach $\\overline{OR}$ um!",
      [
        "Strahlensatz 1: $\\frac{\\overline{OP}}{\\overline{OQ}} = \\frac{\\overline{OR}}{\\overline{OS}}$",
        "",
        `$\\frac{${p.toFixed(1)}}{${q.toFixed(1)}} = \\frac{\\overline{OR}}{${r.toFixed(1)}}$`,
        "",
        `$\\overline{OR} = ${p.toFixed(1)} \\times \\frac{${r.toFixed(1)}}{${q.toFixed(1)}}$`,
        `$\\overline{OR} = ${((p * r) / q).toFixed(2)}$ cm`
      ]
    ),
    // Aufgabe 3: |PQ| berechnen
    createTask(
      "ray1_segment",
      3,
      q - p,
      `Gegeben sind: $\\overline{OP} = ${p.toFixed(1)}$ cm, $\\overline{OQ} = ${q.toFixed(1)}$ cm, $\\overline{OR} = ${r.toFixed(1)}$ cm. Zwei parallele Geraden schneiden zwei Strahlen mit gemeinsamen Startpunkt O. Berechne die Länge der Strecke $\\overline{PQ}$ auf dem ersten Strahl.`,
      "Die Strecke $\\overline{PQ}$ ist die Differenz zwischen $\\overline{OQ}$ und $\\overline{OP}$.",
      [
        "Die Strecke $\\overline{PQ}$ liegt zwischen den Punkten P und Q auf dem ersten Strahl.",
        "",
        `$\\overline{PQ} = \\overline{OQ} - \\overline{OP}$`,
        `$\\overline{PQ} = ${q.toFixed(1)} - ${p.toFixed(1)}$`,
        `$\\overline{PQ} = ${(q - p).toFixed(2)}$ cm`
      ]
    ),
    // Aufgabe 4: |OQ| berechnen (Variante 2)
    createTask(
      "ray1_segment",
      4,
      q,
      `Gegeben sind: $\\overline{OP} = ${p.toFixed(1)}$ cm, $\\overline{OR} = ${r.toFixed(1)}$ cm, $\\overline{OS} = ${((q * r) / p).toFixed(1)}$ cm. Zwei parallele Geraden schneiden zwei Strahlen mit gemeinsamen Startpunkt O. Berechne die Länge der Strecke $\\overline{OQ}$.`,
      "Strahlensatz 1: $\\frac{\\overline{OP}}{\\overline{OQ}} = \\frac{\\overline{OR}}{\\overline{OS}}$. Stelle nach $\\overline{OQ}$ um!",
      [
        "Strahlensatz 1: $\\frac{\\overline{OP}}{\\overline{OQ}} = \\frac{\\overline{OR}}{\\overline{OS}}$",
        "",
        `$\\frac{${p.toFixed(1)}}{\\overline{OQ}} = \\frac{${r.toFixed(1)}}{${((q * r) / p).toFixed(1)}}$`,
        "",
        `$\\overline{OQ} = ${p.toFixed(1)} \\times \\frac{${((q * r) / p).toFixed(1)}}{${r.toFixed(1)}}$`,
        `$\\overline{OQ} = ${q.toFixed(2)}$ cm`
      ]
    ),
    // Aufgabe 5: |RS| berechnen
    createTask(
      "ray1_segment",
      5,
      ((q * r) / p) - r,
      `Gegeben sind: $\\overline{OP} = ${p.toFixed(1)}$ cm, $\\overline{OQ} = ${q.toFixed(1)}$ cm, $\\overline{OR} = ${r.toFixed(1)}$ cm. Zwei parallele Geraden schneiden zwei Strahlen mit gemeinsamen Startpunkt O. Berechne die Länge der Strecke $\\overline{RS}$ auf dem zweiten Strahl.`,
      "Berechne zuerst $\\overline{OS}$ mit dem Strahlensatz, dann $\\overline{RS} = \\overline{OS} - \\overline{OR}$",
      [
        "Zuerst berechnen wir $\\overline{OS}$ mit Strahlensatz 1:",
        `$\\frac{\\overline{OP}}{\\overline{OQ}} = \\frac{\\overline{OR}}{\\overline{OS}}$`,
        `$\\frac{${p.toFixed(1)}}{${q.toFixed(1)}} = \\frac{${r.toFixed(1)}}{\\overline{OS}}$`,
        `$\\overline{OS} = ${((q * r) / p).toFixed(2)}$ cm`,
        "",
        "Dann berechnen wir $\\overline{RS}$:",
        `$\\overline{RS} = \\overline{OS} - \\overline{OR}$`,
        `$\\overline{RS} = ${((q * r) / p).toFixed(2)} - ${r.toFixed(1)}$`,
        `$\\overline{RS} = ${(((q * r) / p) - r).toFixed(2)}$ cm`
      ]
    ),
    // Aufgabe 6: |OR| berechnen (Variante 2)
    createTask(
      "ray1_segment",
      6,
      (p * r) / q,
      `Gegeben sind: $\\overline{OP} = ${p.toFixed(1)}$ cm, $\\overline{OQ} = ${q.toFixed(1)}$ cm, $\\overline{OS} = ${r.toFixed(1)}$ cm. Zwei parallele Geraden schneiden zwei Strahlen mit gemeinsamen Startpunkt O. Berechne die Länge der Strecke $\\overline{OR}$.`,
      "Strahlensatz 1: $\\frac{\\overline{OP}}{\\overline{OQ}} = \\frac{\\overline{OR}}{\\overline{OS}}$. Stelle nach $\\overline{OR}$ um!",
      [
        "Strahlensatz 1: $\\frac{\\overline{OP}}{\\overline{OQ}} = \\frac{\\overline{OR}}{\\overline{OS}}$",
        "",
        `$\\frac{${p.toFixed(1)}}{${q.toFixed(1)}} = \\frac{\\overline{OR}}{${r.toFixed(1)}}$`,
        "",
        `$\\overline{OR} = ${p.toFixed(1)} \\times \\frac{${r.toFixed(1)}}{${q.toFixed(1)}}$`,
        `$\\overline{OR} = ${((p * r) / q).toFixed(2)}$ cm`
      ]
    ),
    // Aufgabe 7: |OS| berechnen (Wiederholung mit neuen Werten)
    createTask(
      "ray1_segment",
      7,
      (q * r) / p,
      `Gegeben sind: $\\overline{OP} = ${p.toFixed(1)}$ cm, $\\overline{OQ} = ${q.toFixed(1)}$ cm, $\\overline{OR} = ${r.toFixed(1)}$ cm. Zwei parallele Geraden schneiden zwei Strahlen mit gemeinsamen Startpunkt O. Berechne die Länge der Strecke $\\overline{OS}$.`,
      "Strahlensatz 1: $\\frac{\\overline{OP}}{\\overline{OQ}} = \\frac{\\overline{OR}}{\\overline{OS}}$. Stelle nach $\\overline{OS}$ um!",
      [
        "Strahlensatz 1: $\\frac{\\overline{OP}}{\\overline{OQ}} = \\frac{\\overline{OR}}{\\overline{OS}}$",
        "",
        `$\\frac{${p.toFixed(1)}}{${q.toFixed(1)}} = \\frac{${r.toFixed(1)}}{\\overline{OS}}$`,
        "",
        `$\\overline{OS} = ${r.toFixed(1)} \\times \\frac{${q.toFixed(1)}}{${p.toFixed(1)}}$`,
        `$\\overline{OS} = ${((q * r) / p).toFixed(2)}$ cm`
      ]
    )
  ];

  return tasks[taskIndex];
}

const cardClass = "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6";
const buttonClass = "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-900 text-slate-50 bg-slate-900 px-4 py-2 text-sm font-semibold hover:bg-slate-800";

// Helper function to render mixed text/math content
function renderMixedMath(text: string) {
  const parts = text.split(/(\$[^$]+\$)/);
  return parts.map((part, idx) => {
    if (part.startsWith('$') && part.endsWith('$')) {
      // Remove dollar signs and render as math
      const mathContent = part.slice(1, -1);
      return <InlineMath key={idx} math={mathContent} />;
    }
    return part ? <span key={idx}>{part}</span> : null;
  });
}

export default function Strahlensaetze() {
  const [task, setTask] = useState<RayTask>(() => generateTask());
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
    setTask(generateTask());
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
                        <InlineMath math={line} />
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

    // Parallele Geraden - GRÜN und DICK
    if (task.type.includes("ray1")) {
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
    }

    api.setCoordSystem(-1, 11, -4, 6);
  } catch (err) {
    console.warn("GeoGebra draw failed", err);
  }
}

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

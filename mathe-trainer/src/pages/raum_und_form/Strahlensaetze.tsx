import { useEffect, useId, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

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
  const taskType = Math.floor(Math.random() * 5);
  
  const p = randomBetween(2, 5);
  const q = randomBetween(6, 10);
  const r = randomBetween(3, 6);

  const tasks: RayTask[] = [
    // Strahlensatz 1: Streckenlänge berechnen
    {
      type: "ray1_segment",
      scenario: 0,
      p,
      q,
      r,
      expectedAnswer: (q * r) / p,
      unit: "cm",
      tolerance: 0.2,
      description: `Strahlensatz 1: Zwei Strahlen werden von parallelen Geraden geschnitten.
      Auf dem ersten Strahl: P = ${p.toFixed(1)} cm, Q = ${q.toFixed(1)} cm.
      Auf dem zweiten Strahl: R = ${r.toFixed(1)} cm.
      Berechne S auf dem zweiten Strahl.`,
      hint: "P/Q = R/S. Stelle nach S um!",
      solution: [
        "Strahlensatz 1: P/Q = R/S",
        "",
        `${p.toFixed(1)}/${q.toFixed(1)} = ${r.toFixed(1)}/S`,
        "",
        `S = ${r.toFixed(1)} × ${q.toFixed(1)} / ${p.toFixed(1)}`,
        `S = ${((q * r) / p).toFixed(2)} cm`
      ]
    },
    // Strahlensatz 1: Verhältnis
    {
      type: "ray1_ratio",
      scenario: 0,
      p,
      q,
      r,
      expectedAnswer: p / q,
      unit: "",
      tolerance: 0.01,
      description: `Strahlensatz 1: P = ${p.toFixed(1)} cm, Q = ${q.toFixed(1)} cm.
      Berechne das Verhältnis P:Q als Dezimalzahl.`,
      hint: "Berechne P ÷ Q!",
      solution: [
        "Verhältnis P:Q = P ÷ Q",
        "",
        `P:Q = ${p.toFixed(1)} ÷ ${q.toFixed(1)}`,
        `P:Q = ${(p / q).toFixed(3)}`
      ]
    },
    // Strahlensatz 2
    {
      type: "ray2_segment",
      scenario: 1,
      p,
      q,
      r,
      expectedAnswer: (r * q) / p,
      unit: "cm",
      tolerance: 0.2,
      description: `Strahlensatz 2: Zwei Strahlen werden von parallelen Geraden geschnitten.
      Innere Strecke: ${p.toFixed(1)} cm, Äußere Strecke: ${q.toFixed(1)} cm.
      Erste parallele Strecke: ${r.toFixed(1)} cm.
      Berechne die zweite parallele Strecke.`,
      hint: "p/q = parallele1/parallele2",
      solution: [
        "Strahlensatz 2: p/q = parallele1/parallele2",
        "",
        `${p.toFixed(1)}/${q.toFixed(1)} = ${r.toFixed(1)}/parallele2`,
        "",
        `parallele2 = ${r.toFixed(1)} × ${q.toFixed(1)} / ${p.toFixed(1)}`,
        `parallele2 = ${((r * q) / p).toFixed(2)} cm`
      ]
    },
    // Ähnlichkeit
    {
      type: "similarity",
      scenario: 2,
      p,
      q,
      r,
      expectedAnswer: p / q,
      unit: "",
      tolerance: 0.01,
      description: `Ähnliche Dreiecke: Seite 1 = ${p.toFixed(1)} cm, Seite 2 = ${q.toFixed(1)} cm.
      Berechne den Ähnlichkeitsfaktor k.`,
      hint: "Ähnlichkeitsfaktor k = kleinere Seite ÷ größere Seite",
      solution: [
        "Ähnlichkeitsfaktor k = kleinere ÷ größere Seite",
        "",
        `k = ${p.toFixed(1)} ÷ ${q.toFixed(1)}`,
        `k = ${(p / q).toFixed(3)}`
      ]
    },
    // Strahlensatz 1: Alternative
    {
      type: "ray1_segment",
      scenario: 1,
      p,
      q,
      r,
      expectedAnswer: (p * r) / q,
      unit: "cm",
      tolerance: 0.2,
      description: `Strahlensatz 1: Q = ${q.toFixed(1)} cm, P = ${p.toFixed(1)} cm, R = ${r.toFixed(1)} cm.
      Berechne S.`,
      hint: "Q/P = S/R",
      solution: [
        "Q/P = S/R",
        "",
        `${q.toFixed(1)}/${p.toFixed(1)} = S/${r.toFixed(1)}`,
        "",
        `S = ${r.toFixed(1)} × ${p.toFixed(1)} / ${q.toFixed(1)}`,
        `S = ${((p * r) / q).toFixed(2)} cm`
      ]
    }
  ];

  return tasks[taskType % tasks.length];
}

const cardClass = "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6";
const buttonClass = "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-900 text-slate-50 bg-slate-900 px-4 py-2 text-sm font-semibold hover:bg-slate-800";

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
              <h2 className="text-lg font-bold">{task.description.split('\n')[0]}</h2>
            </div>
            <button className={buttonClass} onClick={handleNew}>Neue Aufgabe</button>
          </div>

          <RaySketch task={task} />

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
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900 space-y-1">
                  {task.solution.map((line, idx) => (
                    <div key={idx} className="font-mono">{line}</div>
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
    api.setPointSize(5);

    const originX = 2;
    const originY = 1;
    const angle1 = 35;
    const angle2 = -35;

    api.evalCommand(`O=(${originX},${originY})`);
    api.setPointStyle("O", 0);
    api.setLabelVisible("O", true);

    const rad1 = (angle1 * Math.PI) / 180;
    const endX1 = originX + 10 * Math.cos(rad1);
    const endY1 = originY + 10 * Math.sin(rad1);
    api.evalCommand(`ray1 = Ray(O, (${endX1.toFixed(2)}, ${endY1.toFixed(2)}))`);
    api.setColor("ray1", 100, 150, 200);
    api.setLineThickness("ray1", 2);

    const rad2 = (angle2 * Math.PI) / 180;
    const endX2 = originX + 10 * Math.cos(rad2);
    const endY2 = originY + 10 * Math.sin(rad2);
    api.evalCommand(`ray2 = Ray(O, (${endX2.toFixed(2)}, ${endY2.toFixed(2)}))`);
    api.setColor("ray2", 150, 100, 200);
    api.setLineThickness("ray2", 2);

    const p = task.p / 2;
    const q = task.q / 2;
    const r = task.r / 2;
    const s = (p * r) / q;

    const x_p = originX + p * Math.cos(rad1);
    const y_p = originY + p * Math.sin(rad1);
    const x_q = originX + q * Math.cos(rad1);
    const y_q = originY + q * Math.sin(rad1);
    const x_r = originX + r * Math.cos(rad2);
    const y_r = originY + r * Math.sin(rad2);
    const x_s = originX + s * Math.cos(rad2);
    const y_s = originY + s * Math.sin(rad2);

    api.evalCommand(`P=(${x_p.toFixed(2)}, ${y_p.toFixed(2)})`);
    api.evalCommand(`Q=(${x_q.toFixed(2)}, ${y_q.toFixed(2)})`);
    api.evalCommand(`R=(${x_r.toFixed(2)}, ${y_r.toFixed(2)})`);
    api.evalCommand(`S=(${x_s.toFixed(2)}, ${y_s.toFixed(2)})`);

    ["P", "Q", "R", "S"].forEach(pt => {
      api.setPointStyle(pt, 0);
      api.setLabelVisible(pt, true);
    });

    if (task.type.includes("ray1")) {
      api.evalCommand(
        `g1 = Line(P, (${(x_p + 1).toFixed(2)}, ${(y_p + 0.5).toFixed(2)}))`
      );
      api.setColor("g1", 50, 150, 50);
      api.setLineThickness("g1", 2);

      api.evalCommand(
        `g2 = Line(Q, (${(x_q + 1).toFixed(2)}, ${(y_q + 0.5).toFixed(2)}))`
      );
      api.setColor("g2", 50, 150, 50);
      api.setLineThickness("g2", 2);
    }

    api.setCoordSystem(-1, 11, -4, 6);
  } catch (err) {
    console.warn("GeoGebra draw failed", err);
  }
}

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

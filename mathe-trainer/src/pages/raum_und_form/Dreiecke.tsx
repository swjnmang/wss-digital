import { useEffect, useId, useRef, useState } from "react";
import TaskLayout from "../../components/raum-und-form/TaskLayout";

declare global {
  interface Window {
    GGBApplet?: any;
    triangleApplet?: any;
    ggbApplet?: any;
  }
}

type TriangleType = "gleichseitig" | "gleichschenklig" | "allgemein";
type TaskType = "klassifizieren" | "flaeche";

type TriangleSketch = {
  type: TriangleType;
  base: number;
  height: number;
  sideA: number;
  sideB: number;
  sideC: number;
  vertices: [string, string, string];
  sideLabels: [string, string, string];
  heightLabel: string;
};

const cardClass = "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6 text-center";
const buttonClass =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-900 text-slate-50 bg-slate-900 px-4 py-2 text-sm font-semibold hover:bg-slate-800";

export default function Dreiecke() {
  const [taskType, setTaskType] = useState<TaskType>(() => (Math.random() > 0.5 ? "klassifizieren" : "flaeche"));
  const [sketch, setSketch] = useState<TriangleSketch>(() => makeTriangleSketch());
  const [selection, setSelection] = useState<TriangleType | null>(null);
  const [areaInput, setAreaInput] = useState("");
  const [perimeterInput, setPerimeterInput] = useState("");
  const [areaUnit, setAreaUnit] = useState("cm²");
  const [perimeterUnit, setPerimeterUnit] = useState("cm");
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    setFeedback(null);
    setSelection(null);
    setAreaInput("");
    setPerimeterInput("");
    setAreaUnit("cm²");
    setPerimeterUnit("cm");
  }, [taskType, sketch]);

  const showNext = () => {
    setSketch(makeTriangleSketch());
    setTaskType(Math.random() > 0.5 ? "klassifizieren" : "flaeche");
  };

  const area = 0.5 * sketch.base * sketch.height;
  const perimeter = sketch.sideA + sketch.sideB + sketch.sideC;

  const classificationText = `Gegeben ist das Dreieck ${sketch.vertices.join("")} mit den Strecken ${
    sketch.sideLabels[0]
  } = ${formatNumber(sketch.sideA)} cm, ${sketch.sideLabels[1]} = ${formatNumber(sketch.sideB)} cm, ${
    sketch.sideLabels[2]
  } = ${formatNumber(sketch.sideC)} cm. Bestimme den Dreieckstyp.`;

  const areaText = `Gegeben ist das Dreieck ${sketch.vertices.join("")} mit den Streckenlängen ${
    sketch.sideLabels[0]
  } = ${formatNumber(sketch.sideA)} cm, ${sketch.sideLabels[1]} = ${formatNumber(sketch.sideB)} cm, ${
    sketch.sideLabels[2]
  } = ${formatNumber(sketch.sideC)} cm und Höhe ${sketch.heightLabel} = ${formatNumber(sketch.height)} cm. Berechne Flächeninhalt A und Umfang U.`;

  const handleSubmit = () => {
    if (taskType === "klassifizieren") {
      if (!selection) {
        setFeedback("Bitte wähle einen Typ.");
        return;
      }
      const correct = selection === sketch.type;
      setFeedback(correct ? "Richtig erkannt!" : `Nicht ganz. Es ist ${label(sketch.type)}.`);
      if (correct) setTimeout(showNext, 900);
      return;
    }

    const areaVal = parseFloat(areaInput.replace(",", ".").replace(/[−–—‐]/g, '-'));
    const perVal = parseFloat(perimeterInput.replace(",", ".").replace(/[−–—‐]/g, '-'));
    if (Number.isNaN(areaVal) || Number.isNaN(perVal)) {
      setFeedback("Bitte beide Werte eingeben.");
      return;
    }
    const correctAreaUnit = areaUnit === "cm²";
    const correctPerUnit = perimeterUnit === "cm";
    const areaOk = Math.abs(areaVal - area) < 0.1 * area + 0.05;
    const perOk = Math.abs(perVal - perimeter) < 0.1 * perimeter + 0.05;
    const allOk = areaOk && perOk && correctAreaUnit && correctPerUnit;
    setFeedback(
      allOk
        ? "Super! Beide Ergebnisse passen."
        : "Prüfe Werte und Einheiten (cm² für Fläche, cm für Umfang)."
    );
    if (allOk) setTimeout(showNext, 1200);
  };

  return (
    <TaskLayout
      breadcrumbs={[{ label: "Raum & Form", href: "/raum-und-form" }, { label: "Flächengeometrie", href: "/raum-und-form/flaechengeometrie" }, { label: "Dreiecke" }]}
      title="Dreiecke"
      description="Eine Aufgabe pro Seite: Entweder Typ erkennen oder Fläche/Umfang berechnen."
      backHref="/raum-und-form/flaechengeometrie"
    >
      <div className={cardClass}>
          <div className="flex items-center justify-center gap-3 flex-wrap text-center">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                {taskType === "klassifizieren" ? "Aufgabe: Typ erkennen" : "Aufgabe: Fläche & Umfang"}
              </p>
              <h2 className="text-xl font-bold">
                {taskType === "klassifizieren" ? "Welcher Dreiecks-Typ?" : "Fläche und Umfang berechnen"}
              </h2>
              <p className="text-slate-600 max-w-3xl mx-auto">
                {taskType === "klassifizieren" ? classificationText : areaText}
              </p>
            </div>
            <div className="flex gap-2 flex-wrap justify-center">
              <button className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold" onClick={() => setTaskType("klassifizieren")}>Typ-Aufgabe</button>
              <button className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold" onClick={() => setTaskType("flaeche")}>Fläche/Umfang</button>
              <button className={buttonClass} onClick={showNext}>Neue Aufgabe</button>
            </div>
          </div>

          <GeoGebraSketch sketch={sketch} showHeight={taskType === "flaeche"} />

          {taskType === "klassifizieren" ? (
            <div className="grid gap-3 sm:grid-cols-3 justify-items-center">
              {(["gleichseitig", "gleichschenklig", "allgemein"] as TriangleType[]).map(option => (
                <label
                  key={option}
                  className={`rounded-xl border px-4 py-3 text-sm font-semibold cursor-pointer transition w-full text-center ${
                    selection === option ? "border-slate-900 bg-slate-100" : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="triangle-type"
                    className="mr-2"
                    checked={selection === option}
                    onChange={() => setSelection(option)}
                  />
                  {label(option)}
                </label>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2 justify-items-center text-center">
                <div className="space-y-2 w-full">
                  <label className="text-sm font-semibold text-slate-700">Flächeninhalt A</label>
                  <div className="flex gap-2">
                    <input
                      className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm"
                      value={areaInput}
                      onChange={e => setAreaInput(e.target.value)}
                      inputMode="decimal"
                      aria-label="Flächeninhalt"
                    />
                    <select
                      className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
                      value={areaUnit}
                      onChange={e => setAreaUnit(e.target.value)}
                    >
                      <option value="cm²">cm²</option>
                      <option value="mm²">mm²</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2 w-full">
                  <label className="text-sm font-semibold text-slate-700">Umfang U</label>
                  <div className="flex gap-2">
                    <input
                      className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm"
                      value={perimeterInput}
                      onChange={e => setPerimeterInput(e.target.value)}
                      inputMode="decimal"
                      aria-label="Umfang"
                    />
                    <select
                      className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
                      value={perimeterUnit}
                      onChange={e => setPerimeterUnit(e.target.value)}
                    >
                      <option value="cm">cm</option>
                      <option value="mm">mm</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 flex-wrap items-center justify-center">
            <button className={buttonClass} onClick={handleSubmit}>
              Prüfen
            </button>
            {feedback && <span className="text-sm font-semibold text-slate-800">{feedback}</span>}
          </div>
      </div>
    </TaskLayout>
  );
}

function GeoGebraSketch({ sketch, showHeight }: { sketch: TriangleSketch; showHeight: boolean }) {
  const containerId = useId().replace(/[:]/g, "");
  const [scriptReady, setScriptReady] = useState(false);
  const [appletReady, setAppletReady] = useState(false);
  const apiRef = useRef<any>(null);

  // Load GeoGebra script once
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

  // Inject applet
  useEffect(() => {
    if (!scriptReady) return;
    const params = {
      id: "triangleApplet",
      appName: "classic",
      width: 640,
      height: 380,
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
        const api = (window as any).triangleApplet || (window as any).ggbApplet;
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

  // Draw/update sketch whenever data changes
  useEffect(() => {
    if (!appletReady || !apiRef.current) return;
    drawTriangle(apiRef.current, sketch, showHeight);
  }, [appletReady, sketch, showHeight]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-2 mx-auto flex justify-center">
      {!scriptReady && <div className="h-64 w-full animate-pulse rounded-xl bg-slate-100" />}
      <div id={containerId} className="w-full" />
    </div>
  );
}

function InfoChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-sm font-semibold text-slate-800">{value}</p>
    </div>
  );
}

function label(type: TriangleType) {
  if (type === "gleichseitig") return "Gleichseitig";
  if (type === "gleichschenklig") return "Gleichschenklig";
  return "Allgemein (ungleichseitig)";
}

function formatNumber(value: number) {
  return value.toFixed(1);
}

function makeTriangleSketch(): TriangleSketch {
  const [v1, v2, v3] = pickVertexLabels();
  const sideLabels: [string, string, string] = [v1.toLowerCase(), v2.toLowerCase(), v3.toLowerCase()];
  const heightLabel = `h_${v3.toLowerCase()}`;

  const choice = Math.random();
  if (choice < 0.33) return makeEquilateral(sideLabels, heightLabel, [v1, v2, v3]);
  if (choice < 0.66) return makeIsosceles(sideLabels, heightLabel, [v1, v2, v3]);
  return makeScalene(sideLabels, heightLabel, [v1, v2, v3]);
}

function makeEquilateral(sideLabels: [string, string, string], heightLabel: string, vertices: [string, string, string]): TriangleSketch {
  const side = randomBetween(8, 14);
  const base = side;
  const height = (Math.sqrt(3) / 2) * side;

  return {
    type: "gleichseitig",
    base,
    height,
    sideA: side,
    sideB: side,
    sideC: base,
    vertices,
    sideLabels,
    heightLabel
  };
}

function makeIsosceles(sideLabels: [string, string, string], heightLabel: string, vertices: [string, string, string]): TriangleSketch {
  const base = randomBetween(10, 16);
  let equalSide = randomBetween(10, 16);
  while (2 * equalSide <= base) {
    equalSide = randomBetween(10, 16);
  }
  const height = Math.sqrt(Math.max(equalSide ** 2 - (base / 2) ** 2, 0.5));

  const sideA = equalSide; // BC
  const sideB = equalSide; // AC
  const sideC = base; // AB

  return { type: "gleichschenklig", base, height, sideA, sideB, sideC, vertices, sideLabels, heightLabel };
}

function makeScalene(sideLabels: [string, string, string], heightLabel: string, vertices: [string, string, string]): TriangleSketch {
  let base = randomBetween(10, 16);
  let sideA = randomBetween(9, 16); // BC
  let sideB = randomBetween(9, 16); // AC

  let attempts = 0;
  while ((sideA + sideB <= base || Math.abs(sideA - sideB) < 1.5) && attempts < 20) {
    base = randomBetween(10, 16);
    sideA = randomBetween(9, 16);
    sideB = randomBetween(9, 16);
    attempts += 1;
  }

  const xFromA = (sideB ** 2 + base ** 2 - sideA ** 2) / (2 * base);
  const height = Math.max(Math.sqrt(Math.max(sideB ** 2 - xFromA ** 2, 0.3)), 0.3);

  return { type: "allgemein", base, height, sideA, sideB, sideC: base, vertices, sideLabels, heightLabel };
}

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function pickVertexLabels(): [string, string, string] {
  const letters = ["A", "B", "C", "D", "E", "F", "G"];
  const shuffled = letters.sort(() => 0.5 - Math.random());
  return [shuffled[0], shuffled[1], shuffled[2]] as [string, string, string];
}

function drawTriangle(api: any, sketch: TriangleSketch, showHeight: boolean) {
  if (!api) return;

  try {
    api.reset();
    api.setGridVisible(false);
    api.setAxesVisible(false, false);

    const { base, sideA, sideB, height } = sketch;
    const xC = (sideB ** 2 + base ** 2 - sideA ** 2) / (2 * base);
    const pad = Math.max(base, height) * 0.35;

    const [V1, V2, V3] = sketch.vertices;
    const [s1, s2, s3] = sketch.sideLabels;

    // Base triangle
    api.evalCommand(`${V1}=(0,0)`);
    api.evalCommand(`${V2}=(${base.toFixed(2)},0)`);
    api.evalCommand(`${V3}=(${xC.toFixed(2)},${height.toFixed(2)})`);
    api.evalCommand(`poly=Polygon(${V1},${V2},${V3})`);
    api.setColor("poly", 15, 118, 178);
    api.setFilling("poly", 0.2);
    api.setLineThickness("poly", 3);
    api.setPointSize(4);
    api.setLabelVisible("poly", false);
    api.setLabelVisible(V1, true);
    api.setLabelVisible(V2, true);
    api.setLabelVisible(V3, true);
    api.setPointStyle(V1, 0);
    api.setPointStyle(V2, 0);
    api.setPointStyle(V3, 0);

    // Keep everything in view with padding
    api.setCoordSystem(-pad, base + pad, -pad, height + pad);

    // Height line (drawn) plus text label only
    let heightPoint = "";
    if (showHeight) {
      api.evalCommand(`H=(x(${V3}),0)`);
      heightPoint = "H";
      api.evalCommand("h_temp=Segment(" + V3 + ",H)");
      api.setLineStyle("h_temp", 1);
      api.setColor("h_temp", 239, 123, 16);
      api.setLineThickness("h_temp", 5);
      api.setLabelVisible("h_temp", false);
      api.evalCommand("SetVisibleInView(H,1,false)");
      api.evalCommand(`hLabel=Text("${sketch.heightLabel}", Midpoint(${V3},H)+(0.35,0.15))`);
      api.setColor("hLabel", 239, 123, 16);
      api.setLabelVisible("hLabel", true);
    }

    // Custom side labels via text objects (name only)
    api.evalCommand("s_temp1=Segment(" + V2 + "," + V3 + ")"); // opposite V1
    api.evalCommand("s_temp2=Segment(" + V1 + "," + V3 + ")"); // opposite V2
    api.evalCommand("s_temp3=Segment(" + V1 + "," + V2 + ")"); // opposite V3 (base)

    api.setLabelVisible("s_temp1", false);
    api.setLabelVisible("s_temp2", false);
    api.setLabelVisible("s_temp3", false);

    api.evalCommand(`m1=Midpoint(${V2},${V3})`);
    api.evalCommand(`m2=Midpoint(${V1},${V3})`);
    api.evalCommand(`m3=Midpoint(${V1},${V2})`);
    api.evalCommand(`o1=0.6*UnitVector(PerpendicularVector(Vector(${V2},${V3})))`);
    api.evalCommand(`o2=0.6*UnitVector(PerpendicularVector(Vector(${V1},${V3})))`);
    api.evalCommand(`o3=0.6*UnitVector(PerpendicularVector(Vector(${V1},${V2})))`);

    api.evalCommand("SetVisibleInView(m1,1,false)");
    api.evalCommand("SetVisibleInView(m2,1,false)");
    api.evalCommand("SetVisibleInView(m3,1,false)");
    api.evalCommand("SetVisibleInView(o1,1,false)");
    api.evalCommand("SetVisibleInView(o2,1,false)");
    api.evalCommand("SetVisibleInView(o3,1,false)");

    api.evalCommand(`t1=Text("${s1}", m1+o1)`);
    api.evalCommand(`t2=Text("${s2}", m2+o2)`);
    api.evalCommand(`t3=Text("${s3}", m3+o3+(0,0.1))`);
    api.setColor("t1", 51, 65, 85);
    api.setColor("t2", 51, 65, 85);
    api.setColor("t3", 51, 65, 85);
  } catch (err) {
    console.warn("GeoGebra draw failed", err);
  }
}

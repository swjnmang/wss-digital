import { useEffect, useId, useRef, useState } from "react";

type TrapezTask = {
  baseA: number;
  baseC: number;
  leg: number;
  height: number;
};

const cardClass = "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6 text-center";
const buttonClass =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-900 text-slate-50 bg-slate-900 px-4 py-2 text-sm font-semibold hover:bg-slate-800";

export default function Trapez() {
  const [task, setTask] = useState<TrapezTask>(() => makeTask());
  const [areaInput, setAreaInput] = useState("");
  const [perimeterInput, setPerimeterInput] = useState("");
  const [areaUnit, setAreaUnit] = useState("cm²");
  const [perimeterUnit, setPerimeterUnit] = useState("cm");
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    setAreaInput("");
    setPerimeterInput("");
    setAreaUnit("cm²");
    setPerimeterUnit("cm");
    setFeedback(null);
  }, [task]);

  const area = 0.5 * (task.baseA + task.baseC) * task.height;
  const perimeter = task.baseA + task.baseC + 2 * task.leg;

  const handleCheck = () => {
    const areaVal = parseFloat(areaInput.replace(",", "."));
    const perVal = parseFloat(perimeterInput.replace(",", "."));
    if (Number.isNaN(areaVal) || Number.isNaN(perVal)) {
      setFeedback("Bitte beide Werte eingeben.");
      return;
    }
    const correctAreaUnit = areaUnit === "cm²";
    const correctPerUnit = perimeterUnit === "cm";
    const areaOk = withinTolerance(areaVal, area);
    const perOk = withinTolerance(perVal, perimeter);
    const allOk = areaOk && perOk && correctAreaUnit && correctPerUnit;
    setFeedback(
      allOk
        ? "Richtig – Fläche und Umfang passen."
        : "Prüfe Werte und Einheiten (cm² für Fläche, cm für Umfang)."
    );
    if (allOk) setTimeout(() => setTask(makeTask()), 900);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="max-w-5xl mx-auto px-4 py-10 space-y-6 text-center">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Flächengeometrie</p>
          <h1 className="text-3xl font-bold">Trapez</h1>
          <p className="text-slate-600 max-w-3xl mx-auto">
            Gegeben ist ein gleichschenkliges Trapez mit Grundseiten a = {format(task.baseA)} cm und c = {format(task.baseC)} cm, Schenkellänge s = {format(task.leg)} cm und Höhe h = {format(task.height)} cm. Berechne Flächeninhalt A und Umfang U.
          </p>
        </div>

        <div className={cardClass}>
          <div className="flex items-center justify-center gap-3 flex-wrap text-center">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Aufgabe</p>
              <h2 className="text-xl font-bold">Fläche und Umfang berechnen</h2>
            </div>
            <div className="flex gap-2 flex-wrap justify-center">
              <button className={buttonClass} onClick={() => setTask(makeTask())}>Neue Aufgabe</button>
            </div>
          </div>

          <TrapezSketch a={task.baseA} c={task.baseC} leg={task.leg} height={task.height} />

          <div className="grid gap-3 sm:grid-cols-2 justify-items-center text-center">
            <div className="space-y-2 w-full">
              <label className="text-sm font-semibold text-slate-700">Flächeninhalt A</label>
              <div className="flex gap-2">
                <input
                  className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  value={areaInput}
                  onChange={e => setAreaInput(e.target.value)}
                  inputMode="decimal"
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

          <div className="flex gap-3 flex-wrap items-center justify-center">
            <button className={buttonClass} onClick={handleCheck}>
              Prüfen
            </button>
            {feedback && <span className="text-sm font-semibold text-slate-800">{feedback}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

function TrapezSketch({ a, c, leg, height }: { a: number; c: number; leg: number; height: number }) {
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
      width: 640,
      height: 380,
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
    drawTrapez(apiRef.current, a, c, leg, height);
  }, [appletReady, a, c, leg, height]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-2 mx-auto flex justify-center">
      {!scriptReady && <div className="h-64 w-full animate-pulse rounded-xl bg-slate-100" />}
      <div id={containerId} className="w-full" />
    </div>
  );
}

function drawTrapez(api: any, a: number, c: number, leg: number, height: number) {
  if (!api) return;
  try {
    api.reset();
    api.setGridVisible(false);
    api.setAxesVisible(false, false);
    api.setPointSize(4);

    const diff = (a - c) / 2;

    api.evalCommand("A=(0,0)");
    api.evalCommand(`B=(${a.toFixed(2)},0)`);
    api.evalCommand(`D=(${diff.toFixed(2)},${height.toFixed(2)})`);
    api.evalCommand(`C=(${(diff + c).toFixed(2)},${height.toFixed(2)})`);

    api.evalCommand("poly=Polygon(A,B,C,D)");
    api.setColor("poly", 15, 118, 178);
    api.setFilling("poly", 0.2);
    api.setLineThickness("poly", 3);
    api.setLabelVisible("poly", false);
    ["A", "B", "C", "D"].forEach(pt => {
      api.setPointStyle(pt, 0);
      api.setLabelVisible(pt, true);
    });

    api.evalCommand("H=(" + diff.toFixed(2) + ",0)");
    api.evalCommand("hSeg=Segment(D,H)");
    api.setColor("hSeg", 239, 123, 16);
    api.setLineThickness("hSeg", 5);
    api.setLineStyle("hSeg", 1);
    api.setLabelVisible("H", false);
    api.setLabelVisible("hSeg", false);

    api.evalCommand(`aLabel=Text("a = ${format(a)} cm", Midpoint(A,B)+(0,0.4))`);
    api.evalCommand(`cLabel=Text("c = ${format(c)} cm", Midpoint(C,D)+(0,0.4))`);
    api.evalCommand(`sLabel=Text("s = ${format(leg)} cm", Midpoint(B,C)+(0.55,0))`);
    api.evalCommand(`hLabel=Text("h = ${format(height)} cm", Midpoint(D,H)+(0.45,0))`);
    api.setColor("aLabel", 15, 118, 178);
    api.setColor("cLabel", 15, 118, 178);
    api.setColor("sLabel", 15, 118, 178);
    api.setColor("hLabel", 239, 123, 16);

    const width = Math.max(a, diff + c);
    const pad = Math.max(width, height) * 0.7;
    api.setCoordSystem(-pad, width + pad, -pad, height + pad);
  } catch (err) {
    console.warn("GeoGebra draw failed", err);
  }
}

function makeTask(): TrapezTask {
  const baseA = randomBetween(14, 20);
  const baseC = randomBetween(8, 12);
  const diff = (baseA - baseC) / 2;
  let leg = randomBetween(diff + 2, diff + 6);
  let height = Math.sqrt(Math.max(leg ** 2 - diff ** 2, 1));
  // ensure reasonable height
  if (height < 5) {
    leg = diff + 6;
    height = Math.sqrt(Math.max(leg ** 2 - diff ** 2, 1));
  }
  return { baseA, baseC, leg, height };
}

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function format(value: number) {
  return value.toFixed(1);
}

function withinTolerance(given: number, target: number) {
  const tol = Math.max(0.05, target * 0.02);
  return Math.abs(given - target) <= tol;
}

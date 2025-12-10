import { useEffect, useId, useRef, useState } from "react";

type CircleTask = {
  radius: number;
};

const cardClass = "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6 text-center";
const buttonClass =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-900 text-slate-50 bg-slate-900 px-4 py-2 text-sm font-semibold hover:bg-slate-800";

export default function Kreis() {
  const [task, setTask] = useState<CircleTask>(() => makeTask());
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

  const area = Math.PI * task.radius * task.radius;
  const circumference = 2 * Math.PI * task.radius;

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
    const perOk = withinTolerance(perVal, circumference);
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
          <h1 className="text-3xl font-bold">Kreis</h1>
          <p className="text-slate-600 max-w-3xl mx-auto">
            Gegeben ist ein Kreis mit Radius r = {format(task.radius)} cm. Berechne Flächeninhalt A und Umfang U.
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

          <CircleSketch radius={task.radius} />

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

function CircleSketch({ radius }: { radius: number }) {
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
    drawCircle(apiRef.current, radius);
  }, [appletReady, radius]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-2 mx-auto flex justify-center">
      {!scriptReady && <div className="h-64 w-full animate-pulse rounded-xl bg-slate-100" />}
      <div id={containerId} className="w-full" />
    </div>
  );
}

function drawCircle(api: any, radius: number) {
  if (!api) return;
  try {
    api.reset();
    api.setGridVisible(false);
    api.setAxesVisible(false, false);
    api.setPointSize(4);

    api.evalCommand("M=(0,0)");
    api.evalCommand(`p=((${radius.toFixed(2)}),0)`);
    api.evalCommand(`c=Circle(M, ${radius.toFixed(2)})`);
    api.evalCommand("rLine=Segment(M,p)");

    api.setColor("c", 15, 118, 178);
    api.setFilling("c", 0.15);
    api.setLineThickness("c", 4);
    api.setLabelVisible("c", false);
    api.setPointStyle("M", 0);
    api.setLabelVisible("M", true);
    api.setLabelVisible("p", false);
    api.setColor("rLine", 239, 123, 16);
    api.setLineThickness("rLine", 4);
    api.setLabelVisible("rLine", false);

    api.evalCommand(`rLabel=Text("r = ${format(radius)} cm", Midpoint(M,p)+(0,0.5))`);
    api.setColor("rLabel", 239, 123, 16);

    const pad = radius * 2;
    api.setCoordSystem(-pad, pad, -pad, pad);
  } catch (err) {
    console.warn("GeoGebra draw failed", err);
  }
}

function makeTask(): CircleTask {
  return {
    radius: randomBetween(4, 9)
  };
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

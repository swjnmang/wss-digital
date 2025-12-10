import { useEffect, useId, useRef, useState } from "react";

type ShapeType = "dreieck" | "trapez" | "parallelogramm" | "raute" | "kreis" | "rechteck";

type ShapeSketch =
  | { type: Exclude<ShapeType, "kreis">; points: [number, number][] }
  | { type: "kreis"; radius: number };

const cardClass = "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6 text-center";
const buttonClass =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-900 text-slate-50 bg-slate-900 px-4 py-2 text-sm font-semibold hover:bg-slate-800";

const shapeOptions: { value: ShapeType; label: string }[] = [
  { value: "dreieck", label: "Dreieck" },
  { value: "trapez", label: "Trapez" },
  { value: "parallelogramm", label: "Parallelogramm" },
  { value: "raute", label: "Raute" },
  { value: "rechteck", label: "Rechteck" },
  { value: "kreis", label: "Kreis" }
];

export default function FormenErkennen() {
  const [sketch, setSketch] = useState<ShapeSketch>(() => generateSketch());
  const [selection, setSelection] = useState<ShapeType | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null);

  const showNext = () => {
    setSketch(generateSketch());
    setSelection(null);
    setFeedback(null);
    setLastCorrect(null);
  };

  const handleCheck = (choice: ShapeType) => {
    setSelection(choice);
    const correct = choice === sketch.type;
    setLastCorrect(correct);
    if (correct) {
      setFeedback("Richtig erkannt!");
    } else {
      setFeedback(getWrongReason(choice, sketch.type));
    }
    if (correct) setTimeout(showNext, 900);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="max-w-5xl mx-auto px-4 py-10 space-y-6 text-center">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Flächengeometrie</p>
          <h1 className="text-3xl font-bold">Formen erkennen</h1>
          <p className="text-slate-600 max-w-3xl mx-auto">
            GeoGebra zeichnet zufällig eine Form. Wähle, ob es sich um Dreieck, Trapez, Parallelogramm, Raute, Rechteck oder Kreis handelt.
          </p>
        </div>

        <div className={cardClass}>
          <div className="flex items-center justify-center gap-3 flex-wrap text-center">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Aufgabe</p>
              <h2 className="text-xl font-bold">Welche Form ist dargestellt?</h2>
            </div>
            <div className="flex gap-2 flex-wrap justify-center">
              <button className={buttonClass} onClick={showNext}>Neue Aufgabe</button>
            </div>
          </div>

          <GeoGebraShape sketch={sketch} />

          <div className="grid gap-3 sm:grid-cols-3 justify-items-center">
            {shapeOptions.map(option => (
              <button
                key={option.value}
                className={`rounded-xl border px-4 py-3 text-sm font-semibold transition w-full text-center flex items-center justify-center gap-2 ${
                  selection === option.value
                    ? lastCorrect === true && selection === option.value
                      ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                      : lastCorrect === false && selection === option.value
                        ? "border-rose-500 bg-rose-50 text-rose-800"
                        : "border-slate-900 bg-slate-100"
                    : "border-slate-200 hover:border-slate-300"
                }`}
                onClick={() => handleCheck(option.value)}
              >
                {lastCorrect && selection === option.value ? "✓" : ""}
                {option.label}
                {lastCorrect === true && selection === option.value ? "– Richtig" : ""}
              </button>
            ))}
          </div>

          <div className="flex gap-3 flex-wrap items-center justify-center">
            {feedback && <span className="text-sm font-semibold text-slate-800">{feedback}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

function GeoGebraShape({ sketch }: { sketch: ShapeSketch }) {
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
      id: "shapeApplet",
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
        const api = (window as any).shapeApplet || (window as any).ggbApplet;
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
    drawShape(apiRef.current, sketch);
  }, [appletReady, sketch]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-2 mx-auto flex justify-center">
      {!scriptReady && <div className="h-64 w-full animate-pulse rounded-xl bg-slate-100" />}
      <div id={containerId} className="w-full" />
    </div>
  );
}

function drawShape(api: any, sketch: ShapeSketch) {
  if (!api) return;
  try {
    api.reset();
    api.setGridVisible(false);
    api.setAxesVisible(false, false);

    const viewWidth = 640;
    const viewHeight = 380;
    const aspect = viewHeight / viewWidth; // match units per pixel

    if (sketch.type === "kreis") {
      const r = sketch.radius;
      api.evalCommand("M=(0,0)");
      api.evalCommand(`c=Circle(M, ${r.toFixed(2)})`);
      api.setColor("c", 15, 118, 178);
      api.setLineThickness("c", 4);
      api.setFilling("c", 0.1);
      api.setLabelVisible("c", false);
      api.setLabelVisible("M", true);
      const padX = r * 2.0; // more breathing room horizontally
      const padY = padX * aspect; // keep circular aspect
      api.setCoordSystem(-padX, padX, -padY, padY);
      return;
    }

    const letters = ["A", "B", "C", "D"];
    const pts = sketch.points;
    pts.forEach((p, idx) => {
      api.evalCommand(`${letters[idx]}=(${p[0].toFixed(2)},${p[1].toFixed(2)})`);
    });
    const vertNames = letters.slice(0, pts.length).join(",");
    api.evalCommand(`poly=Polygon(${vertNames})`);
    api.setColor("poly", 15, 118, 178);
    api.setFilling("poly", 0.2);
    api.setLineThickness("poly", 3);
    api.setLabelVisible("poly", false);
    api.setPointSize(4);
    vertNames.split(",").forEach(name => {
      api.setLabelVisible(name, true);
      api.setPointStyle(name, 0);
    });

    const xs = pts.map(p => p[0]);
    const ys = pts.map(p => p[1]);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const spanX = maxX - minX;
    const spanY = maxY - minY;
    const padX = spanX * 0.35 || 5;
    const padY = spanY * 0.35 || 5;

    let viewMinX = minX - padX;
    let viewMaxX = maxX + padX;
    let viewMinY = minY - padY;
    let viewMaxY = maxY + padY;

    let viewSpanX = viewMaxX - viewMinX;
    let viewSpanY = viewMaxY - viewMinY;

    // Enforce equal units per pixel to avoid distortion
    if (viewSpanY / viewSpanX < aspect) {
      // too wide; expand Y span
      const targetY = viewSpanX * aspect;
      const extraY = targetY - viewSpanY;
      viewMinY -= extraY / 2;
      viewMaxY += extraY / 2;
      viewSpanY = targetY;
    } else if (viewSpanY / viewSpanX > aspect) {
      // too tall; expand X span
      const targetX = viewSpanY / aspect;
      const extraX = targetX - viewSpanX;
      viewMinX -= extraX / 2;
      viewMaxX += extraX / 2;
      viewSpanX = targetX;
    }

    api.setCoordSystem(viewMinX, viewMaxX, viewMinY, viewMaxY);
  } catch (err) {
    console.warn("GeoGebra draw failed", err);
  }
}

function generateSketch(): ShapeSketch {
  const roll = Math.random();
  if (roll < 0.18) return makeTriangle();
  if (roll < 0.36) return makeTrapezoid();
  if (roll < 0.54) return makeParallelogram();
  if (roll < 0.72) return makeRhombus();
  if (roll < 0.9) return makeRectangle();
  return makeCircle();
}

function makeTriangle(): ShapeSketch {
  const base = randomBetween(10, 16);
  const sideB = randomBetween(9, 15);
  const sideC = randomBetween(9, 15);
  const xC = (sideB ** 2 + base ** 2 - sideC ** 2) / (2 * base);
  const height = Math.max(Math.sqrt(Math.max(sideB ** 2 - xC ** 2, 0.5)), 0.5);
  return {
    type: "dreieck",
    points: [
      [0, 0],
      [base, 0],
      [xC, height]
    ]
  };
}

function makeRectangle(): ShapeSketch {
  let w = randomBetween(10, 16);
  let h = randomBetween(6, 11);
  // Avoid quadrat-Optik: Seiten sollen sich klar unterscheiden
  let tries = 0;
  while (Math.abs(w - h) < 2 && tries < 10) {
    w = randomBetween(10, 16);
    h = randomBetween(6, 11);
    tries += 1;
  }
  return {
    type: "rechteck",
    points: [
      [0, 0],
      [w, 0],
      [w, h],
      [0, h]
    ]
  };
}

function makeParallelogram(): ShapeSketch {
  const base = randomBetween(12, 18);
  const height = randomBetween(6, 11);
  let offset = randomBetween(base * 0.2, base * 0.6); // sorgt für deutliche Schräglage
  let side = Math.sqrt(offset ** 2 + height ** 2);
  // Vermeide Rhombus-/Rechteck-Eindruck: Seitenlängen sollen sich unterscheiden
  let tries = 0;
  while (Math.abs(side - base) < 1.5 && tries < 10) {
    offset = randomBetween(base * 0.25, base * 0.65);
    side = Math.sqrt(offset ** 2 + height ** 2);
    tries += 1;
  }
  return {
    type: "parallelogramm",
    points: [
      [0, 0],
      [base, 0],
      [base + offset, height],
      [offset, height]
    ]
  };
}

function makeRhombus(): ShapeSketch {
  const side = randomBetween(10, 15);
  // Winkel bewusst weg von 90°, damit kein Quadrat entsteht
  const angleChoice = Math.random() < 0.5 ? randomBetween(55, 75) : randomBetween(105, 125);
  const angle = angleChoice * (Math.PI / 180);
  const dx = side * Math.cos(angle);
  const dy = side * Math.sin(angle);
  return {
    type: "raute",
    points: [
      [0, 0],
      [side, 0],
      [side + dx, dy],
      [dx, dy]
    ]
  };
}

function makeTrapezoid(): ShapeSketch {
  const baseA = randomBetween(14, 20);
  const baseC = randomBetween(8, 13); // klar kürzer, damit nicht wie Parallelogramm/Rechteck wirkt
  const height = randomBetween(6, 10);
  const offsetMax = Math.max(4, baseA - baseC - 2);
  let offset = randomBetween(2, offsetMax);
  // Vermeide zentriertes, fast symmetrisches Trapez
  const midOffset = (baseA - baseC) / 2;
  if (Math.abs(offset - midOffset) < 1) {
    offset = Math.min(offsetMax, midOffset + 1.5);
  }
  return {
    type: "trapez",
    points: [
      [0, 0],
      [baseA, 0],
      [offset + baseC, height],
      [offset, height]
    ]
  };
}

function makeCircle(): ShapeSketch {
  const radius = randomBetween(1.6, 2.4);
  return { type: "kreis", radius };
}

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function getWrongReason(chosen: ShapeType, actual: ShapeType): string {
  if (actual === "kreis") return "Das ist ein Kreis: keine Ecken, alle Punkte haben den gleichen Abstand zum Mittelpunkt.";
  if (actual === "dreieck") return "Es sind nur drei Ecken – das ist ein Dreieck, kein " + labelGerman(chosen) + ".";
  if (actual === "rechteck") return "Rechteck: vier rechte Winkel, gegenüberliegende Seiten parallel und ungleich lang.";
  if (actual === "parallelogramm") return "Parallelogramm: gegenüberliegende Seiten parallel, keine rechten Winkel.";
  if (actual === "raute") return "Raute: alle vier Seiten gleich lang, aber keine rechten Winkel.";
  if (actual === "trapez") return "Trapez: genau ein Paar paralleler Seiten, die andere Seite ist nicht parallel.";
  return "Nicht ganz – schau auf Anzahl Ecken, Parallelen und rechte Winkel.";
}

function labelGerman(shape: ShapeType): string {
  switch (shape) {
    case "dreieck":
      return "Dreieck";
    case "trapez":
      return "Trapez";
    case "parallelogramm":
      return "Parallelogramm";
    case "raute":
      return "Raute";
    case "kreis":
      return "Kreis";
    case "rechteck":
      return "Rechteck";
    default:
      return "Form";
  }
}

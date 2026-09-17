import { useMemo, useState, useEffect } from "react";
import TaskLayout from "../../components/raum-und-form/TaskLayout";

type Shape =
  | { kind: "rectangle"; w: number; h: number; unit: Unit }
  | { kind: "square"; a: number; unit: Unit }
  | { kind: "triangle"; b: number; h: number; sides?: [number, number, number]; unit: Unit }
  | { kind: "trapezoid"; a: number; b: number; h: number; legs?: [number, number]; unit: Unit }
  | { kind: "parallelogram"; b: number; h: number; side: number; unit: Unit }
  | { kind: "rhombus"; d1: number; d2: number; side: number; unit: Unit }
  | { kind: "circle"; r: number; unit: Unit }
  | { kind: "lshape"; w1: number; h1: number; w2: number; h2: number; unit: Unit }
  | { kind: "rect_plus_triangle"; w: number; h: number; b: number; tHeight: number; unit: Unit }
  | { kind: "semi_circle_rect"; w: number; h: number; r: number; unit: Unit }
  | { kind: "rect_cut_circle"; w: number; h: number; r: number; unit: Unit }
  | { kind: "rect_cut_rect"; w: number; h: number; cutW: number; cutH: number; unit: Unit }
  | { kind: "rect_plus_circle"; w: number; h: number; r: number; unit: Unit }
  | { kind: "rect_frame"; outerW: number; outerH: number; innerW: number; innerH: number; unit: Unit }
  | { kind: "ring"; outerR: number; innerR: number; unit: Unit }
  | { kind: "stadium"; w: number; h: number; r: number; unit: Unit }
  | { kind: "tshape"; stemW: number; stemH: number; topW: number; topH: number; unit: Unit }
  | { kind: "rect_cut_corner"; w: number; h: number; cutW: number; cutH: number; unit: Unit }
  | { kind: "rect_cut_two_circles"; w: number; h: number; r1: number; r2: number; unit: Unit }
  | { kind: "rect_plus_sector"; w: number; h: number; r: number; angle: number; unit: Unit };

type Unit = "cm" | "m";

type Task = {
  id: number;
  title: string;
  question: string;
  ask: "area" | "perimeter" | "both";
  shape: Shape;
  area?: number;
  perimeter?: number;
};

const cardClass = "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm";
const buttonClass =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-900 text-slate-50 bg-slate-900 px-4 py-2 text-sm font-semibold hover:bg-slate-800";

export default function GemischteFlaechenaufgaben() {
  const tasks = useMemo(() => shuffle(buildTasks()), []);
  const [index, setIndex] = useState(0);
  const task = tasks[index];

  const [areaInput, setAreaInput] = useState("");
  const [perimeterInput, setPerimeterInput] = useState("");
  const [areaUnit, setAreaUnit] = useState("-");
  const [perimeterUnit, setPerimeterUnit] = useState("-");
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    setAreaInput("");
    setPerimeterInput("");
    setAreaUnit("-");
    setPerimeterUnit("-");
    setFeedback(null);
  }, [task]);

  const goPrev = () => setIndex(i => (i === 0 ? tasks.length - 1 : i - 1));
  const goNext = () => setIndex(i => (i + 1) % tasks.length);

  const handleCheck = () => {
    const mistakes: string[] = [];

    if (task.ask === "area" || task.ask === "both") {
      const val = parseNumber(areaInput);
      if (Number.isNaN(val)) mistakes.push("Fläche fehlt");
      else if (!task.area || !withinTolerance(val, task.area)) mistakes.push("Fläche passt nicht");
      if (areaUnit !== getAreaUnit(task.shape)) mistakes.push("Einheit Fläche");
    }

    if (task.ask === "perimeter" || task.ask === "both") {
      const val = parseNumber(perimeterInput);
      if (Number.isNaN(val)) mistakes.push("Umfang fehlt");
      else if (!task.perimeter || !withinTolerance(val, task.perimeter)) mistakes.push("Umfang passt nicht");
      if (perimeterUnit !== getLengthUnit(task.shape)) mistakes.push("Einheit Umfang");
    }

    if (mistakes.length === 0) {
      setFeedback("Super! Alles stimmt.");
      return;
    }

    setFeedback(`Bitte prüfen: ${mistakes.join(", ")}`);
  };

  const areaOptions = areaUnitChoices(task.shape);
  const perimeterOptions = lengthUnitChoices(task.shape);

  return (
    <TaskLayout
      breadcrumbs={[{ label: "Raum & Form", href: "/raum-und-form" }, { label: "Flächengeometrie", href: "/raum-und-form/flaechengeometrie" }, { label: "Gemischte Übungsaufgaben" }]}
      title="Gemischte Übungsaufgaben"
      description="Wähle die korrekte Einheit und runde jede Lösung auf 2 Nachkommastellen."
      backHref="/raum-und-form/flaechengeometrie"
    >
      <div className={cardClass + " space-y-6"} id="print-area">
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Aufgabe {task.id} / {tasks.length}</p>
            <h2 className="text-xl font-bold">{task.title}</h2>
            <p className="text-slate-700 leading-relaxed">{task.question}</p>
          </div>

          <div className="grid gap-6 md:grid-cols-[1.1fr,1fr]">
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <Sketch shape={task.shape} />
              <p className="mt-3 text-sm text-slate-600 text-center">Skizze (schematisch, nicht maßstabsgerecht)</p>
            </div>

            <div className="space-y-4">
              {(task.ask === "area" || task.ask === "both") && (
                <label className="block space-y-1">
                  <span className="text-sm font-semibold text-slate-700">Flächeninhalt A</span>
                  <div className="flex gap-2">
                    <input
                      className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm"
                      value={areaInput}
                      onChange={e => setAreaInput(e.target.value)}
                      placeholder="Zahl eingeben"
                      inputMode="decimal"
                    />
                    <select
                      className="min-w-[92px] rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700"
                      value={areaUnit}
                      onChange={e => setAreaUnit(e.target.value)}
                    >
                      <option value="-">-</option>
                      {areaOptions.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                  <p className="text-xs text-slate-500">Runde auf 2 Nachkommastellen und wähle die passende Einheit.</p>
                </label>
              )}

              {(task.ask === "perimeter" || task.ask === "both") && (
                <label className="block space-y-1">
                  <span className="text-sm font-semibold text-slate-700">Umfang U</span>
                  <div className="flex gap-2">
                    <input
                      className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm"
                      value={perimeterInput}
                      onChange={e => setPerimeterInput(e.target.value)}
                      placeholder="Zahl eingeben"
                      inputMode="decimal"
                    />
                    <select
                      className="min-w-[92px] rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700"
                      value={perimeterUnit}
                      onChange={e => setPerimeterUnit(e.target.value)}
                    >
                      <option value="-">-</option>
                      {perimeterOptions.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                </label>
              )}

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button className={buttonClass} onClick={handleCheck}>Prüfen</button>
                <div className="flex gap-2">
                  <button className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold" onClick={goPrev}>Vorherige Aufgabe</button>
                  <button className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold" onClick={goNext}>Nächste Aufgabe</button>
                </div>
                {feedback && <span className="text-sm font-semibold text-slate-800">{feedback}</span>}
              </div>
            </div>
          </div>
      </div>
    </TaskLayout>
  );
}

function Sketch({ shape }: { shape: Shape }) {
  return (
    <svg viewBox="0 0 260 220" className="w-full" role="img" aria-label="Skizze">
      <rect x="0" y="0" width="260" height="220" fill="#f8fafc" />
      {drawShape(shape)}
    </svg>
  );
}

function drawShape(shape: Shape) {
  const stroke = "#0f172a";
  const fill = "#e2e8f0";

  switch (shape.kind) {
    case "rectangle": {
      const w = 140;
      const h = 90;
      return <rect x={(260 - w) / 2} y={(220 - h) / 2} width={w} height={h} fill={fill} stroke={stroke} strokeWidth={3} />;
    }
    case "square": {
      const s = 110;
      return <rect x={(260 - s) / 2} y={(220 - s) / 2} width={s} height={s} fill={fill} stroke={stroke} strokeWidth={3} />;
    }
    case "triangle": {
      const points = "60,170 200,170 130,60";
      return <polygon points={points} fill={fill} stroke={stroke} strokeWidth={3} />;
    }
    case "trapezoid": {
      const points = "70,170 190,170 220,110 40,110";
      return <polygon points={points} fill={fill} stroke={stroke} strokeWidth={3} />;
    }
    case "parallelogram": {
      const points = "60,170 190,170 210,110 80,110";
      return <polygon points={points} fill={fill} stroke={stroke} strokeWidth={3} />;
    }
    case "rhombus": {
      const points = "130,60 210,140 130,200 50,120";
      return <polygon points={points} fill={fill} stroke={stroke} strokeWidth={3} />;
    }
    case "circle": {
      return <circle cx={130} cy={120} r={70} fill={fill} stroke={stroke} strokeWidth={3} />;
    }
    case "lshape": {
      return (
        <g fill={fill} stroke={stroke} strokeWidth={3}>
          <rect x={50} y={90} width={120} height={90} rx={0} ry={0} />
          <rect x={50} y={40} width={60} height={50} rx={0} ry={0} />
        </g>
      );
    }
    case "rect_plus_triangle": {
      return (
        <g fill={fill} stroke={stroke} strokeWidth={3}>
          <rect x={60} y={110} width={140} height={70} rx={0} ry={0} />
          <polygon points="60,110 200,110 130,60" />
        </g>
      );
    }
    case "semi_circle_rect": {
      return (
        <g fill={fill} stroke={stroke} strokeWidth={3}>
          <rect x={60} y={110} width={140} height={70} rx={0} ry={0} />
          <path d="M60 110 A70 70 0 0 1 200 110" />
        </g>
      );
    }
    case "rect_cut_circle": {
      return (
        <g stroke={stroke} strokeWidth={3}>
          <rect x={50} y={70} width={160} height={100} fill={fill} />
          <circle cx={130} cy={120} r={35} fill="#f8fafc" />
        </g>
      );
    }
    case "rect_cut_rect": {
      return (
        <g stroke={stroke} strokeWidth={3}>
          <rect x={50} y={70} width={160} height={100} fill={fill} />
          <rect x={100} y={100} width={60} height={50} fill="#f8fafc" />
        </g>
      );
    }
    case "rect_plus_circle": {
      return (
        <g stroke={stroke} strokeWidth={3}>
          <rect x={60} y={110} width={110} height={70} fill={fill} />
          <circle cx={200} cy={145} r={30} fill={fill} />
        </g>
      );
    }
    case "rect_frame": {
      return (
        <g stroke={stroke} strokeWidth={3}>
          <rect x={40} y={60} width={180} height={120} fill={fill} />
          <rect x={80} y={90} width={100} height={70} fill="#f8fafc" />
        </g>
      );
    }
    case "ring": {
      return (
        <g stroke={stroke} strokeWidth={3} fill={fill}>
          <circle cx={130} cy={120} r={70} />
          <circle cx={130} cy={120} r={40} fill="#f8fafc" />
        </g>
      );
    }
    case "stadium": {
      return (
        <g stroke={stroke} strokeWidth={3} fill={fill}>
          <rect x={60} y={90} width={120} height={60} />
          <path d="M60 90 a30 30 0 0 0 0 60" />
          <path d="M180 150 a30 30 0 0 0 0 -60" />
        </g>
      );
    }
    case "tshape": {
      return (
        <g stroke={stroke} strokeWidth={3} fill={fill}>
          <rect x={110} y={70} width={40} height={110} />
          <rect x={80} y={70} width={100} height={35} />
        </g>
      );
    }
    case "rect_cut_corner": {
      return (
        <g stroke={stroke} strokeWidth={3}>
          <rect x={60} y={70} width={140} height={100} fill={fill} />
          <polygon points="200,170 200,140 170,170" fill="#f8fafc" />
        </g>
      );
    }
    case "rect_cut_two_circles": {
      return (
        <g stroke={stroke} strokeWidth={3}>
          <rect x={50} y={70} width={160} height={100} fill={fill} />
          <circle cx={95} cy={120} r={22} fill="#f8fafc" />
          <circle cx={165} cy={120} r={18} fill="#f8fafc" />
        </g>
      );
    }
    case "rect_plus_sector": {
      return (
        <g stroke={stroke} strokeWidth={3}>
          <rect x={70} y={90} width={120} height={80} fill={fill} />
          <path d="M190 90 A50 50 0 0 1 220 140 L190 140 Z" fill={fill} />
        </g>
      );
    }
    default:
      return null;
  }
}

function buildTasks(): Task[] {
  const roundingNote = " Wähle die passende Einheit und runde auf zwei Nachkommastellen.";
  const defs: Omit<Task, "id" | "area" | "perimeter">[] = [
    { title: "Holzplatte mit Kreisausschnitt", ask: "area", shape: { kind: "rect_cut_circle", w: 240, h: 160, r: 20, unit: "cm" }, question: "Eine rechteckige Holzplatte ist 240 cm × 160 cm groß. Mittig wird ein Kreis mit Radius 20 cm ausgeschnitten. Berechne die verbleibende Fläche." },
    { title: "Bühnenboden mit rundem Loch", ask: "area", shape: { kind: "rect_cut_circle", w: 9, h: 6, r: 1.5, unit: "m" }, question: "Ein Bühnenboden misst 9 m × 6 m. Ein rundes Loch mit Radius 1,5 m wird entfernt. Wie groß ist die Restfläche?" },
    { title: "Deckplatte mit Fenster", ask: "area", shape: { kind: "rect_cut_rect", w: 180, h: 120, cutW: 50, cutH: 35, unit: "cm" }, question: "Eine Platte ist 180 cm × 120 cm groß. Ein rechteckiges Fenster von 50 cm × 35 cm wird ausgeschnitten. Berechne die resultierende Fläche." },
    { title: "Grundplatte mit Technikschacht", ask: "area", shape: { kind: "rect_cut_rect", w: 12, h: 8, cutW: 3, cutH: 2.5, unit: "m" }, question: "Eine Grundplatte misst 12 m × 8 m. Ein Schacht von 3 m × 2,5 m wird herausgetrennt. Bestimme die verbleibende Fläche." },
    { title: "L-förmige Terrasse", ask: "area", shape: { kind: "lshape", w1: 9, h1: 6, w2: 4, h2: 3, unit: "m" }, question: "Eine Terrasse ist L-förmig (9 m × 6 m plus 4 m × 3 m angesetzt). Berechne die Gesamtfläche." },
    { title: "Lagerfläche in L-Form", ask: "area", shape: { kind: "lshape", w1: 11, h1: 7, w2: 3.5, h2: 3, unit: "m" }, question: "Ein Lagerbereich hat zwei rechteckige Teile: 11 m × 7 m und 3,5 m × 3 m als L-Form. Wie groß ist die Fläche?" },
    { title: "Dach mit Dreiecksgiebel", ask: "area", shape: { kind: "rect_plus_triangle", w: 10, h: 6, b: 10, tHeight: 3.5, unit: "m" }, question: "Ein Dach besteht aus einem Rechteck 10 m × 6 m mit aufgesetztem Dreieck (Grundseite 10 m, Höhe 3,5 m). Berechne die Gesamtfläche." },
    { title: "Werbebanner mit Spitze", ask: "area", shape: { kind: "rect_plus_triangle", w: 6, h: 3, b: 6, tHeight: 2.5, unit: "m" }, question: "Ein Banner besteht aus einem Rechteck 6 m × 3 m und einem Dreieck (Grundseite 6 m, Höhe 2,5 m) obenauf. Bestimme den Flächeninhalt." },
    { title: "Halbrunder Vorbau", ask: "area", shape: { kind: "semi_circle_rect", w: 8, h: 5, r: 4, unit: "m" }, question: "Ein Vorbau kombiniert ein Rechteck 8 m × 5 m mit einem halbrunden Abschluss (Radius 4 m). Berechne die Gesamtfläche." },
    { title: "Fenster mit Rundbogen", ask: "area", shape: { kind: "semi_circle_rect", w: 2.4, h: 1.6, r: 1.2, unit: "m" }, question: "Ein Fenster besteht aus einem Rechteck 2,4 m × 1,6 m und einem halbrunden Aufsatz (Radius 1,2 m). Bestimme die Fläche." },
    { title: "Steg mit Kreisausschnitt", ask: "area", shape: { kind: "rect_cut_circle", w: 12, h: 4, r: 1, unit: "m" }, question: "Ein Steg ist 12 m × 4 m groß. Für eine Leiter wird ein Kreis mit Radius 1 m ausgeschnitten. Wie groß bleibt die Fläche?" },
    { title: "Plattform mit rechteckigem Ausschnitt", ask: "area", shape: { kind: "rect_cut_rect", w: 320, h: 180, cutW: 80, cutH: 50, unit: "cm" }, question: "Eine Plattform misst 320 cm × 180 cm. Ein Ausschnitt von 80 cm × 50 cm wird entfernt. Berechne die Restfläche." },
    { title: "Terrasse mit Rundung", ask: "area", shape: { kind: "rect_plus_circle", w: 7, h: 5, r: 2, unit: "m" }, question: "Eine Terrasse besteht aus einem Rechteck 7 m × 5 m und einem angesetzten Kreis (Radius 2 m). Wie groß ist die Gesamtfläche?" },
    { title: "Gartenfläche mit Halbkreis", ask: "area", shape: { kind: "semi_circle_rect", w: 10, h: 6, r: 5, unit: "m" }, question: "Eine Gartenfläche setzt sich aus 10 m × 6 m Rechteck und einem Halbkreis (Radius 5 m) an der Breitseite zusammen. Berechne die Fläche." },
    { title: "Rahmen aus Brettern", ask: "area", shape: { kind: "rect_frame", outerW: 12, outerH: 9, innerW: 8, innerH: 5, unit: "m" }, question: "Ein rechteckiger Rahmen hat Außenmaße 12 m × 9 m und eine Öffnung von 8 m × 5 m. Wie groß ist die Holzfläche?" },
    { title: "Bilderrahmen", ask: "area", shape: { kind: "rect_frame", outerW: 50, outerH: 40, innerW: 36, innerH: 24, unit: "cm" }, question: "Ein Bilderrahmen ist außen 50 cm × 40 cm und hat ein Innenfenster 36 cm × 24 cm. Berechne die Rahmenfläche." },
    { title: "Laufbahn (Rundrechteck)", ask: "area", shape: { kind: "stadium", w: 40, h: 10, r: 5, unit: "m" }, question: "Eine Trainingsbahn besteht aus einem 40 m langen Rechteck (Breite 10 m) mit halbrunden Enden Radius 5 m. Berechne die Fläche der Bahn." },
    { title: "Sandkasten-Stadion", ask: "area", shape: { kind: "stadium", w: 6, h: 2, r: 1, unit: "m" }, question: "Ein Sandkasten hat ein Mittelteil 6 m × 2 m und an beiden Enden Halbkreise Radius 1 m. Wie groß ist die Fläche?" },
    { title: "Zierteich als Ring", ask: "area", shape: { kind: "ring", outerR: 6, innerR: 2.5, unit: "m" }, question: "Ein Teich besteht aus einem äußeren Kreis Radius 6 m; mittig ist eine Insel Kreis Radius 2,5 m. Berechne die Wasserfläche (Ring)." },
    { title: "Lichtkranz", ask: "area", shape: { kind: "ring", outerR: 120, innerR: 50, unit: "cm" }, question: "Ein runder Lichtkranz hat äußeren Radius 120 cm und inneren Radius 50 cm. Wie groß ist die leuchtende Fläche?" },
    { title: "T-förmige Bühne", ask: "area", shape: { kind: "tshape", stemW: 4, stemH: 8, topW: 10, topH: 3, unit: "m" }, question: "Eine Bühne ist T-förmig: ein Steg 4 m × 8 m und oben quer 10 m × 3 m. Bestimme die Gesamtfläche." },
    { title: "T-förmiger Steg", ask: "area", shape: { kind: "tshape", stemW: 2.5, stemH: 6, topW: 6, topH: 2.5, unit: "m" }, question: "Ein Steg ins Wasser ist T-förmig: ein Stegteil 2,5 m × 6 m, am Ende ein Querpodest 6 m × 2,5 m. Wie groß ist die Fläche?" },
    { title: "Eckige Platte mit Abkappung", ask: "area", shape: { kind: "rect_cut_corner", w: 220, h: 180, cutW: 30, cutH: 30, unit: "cm" }, question: "Eine Platte misst 220 cm × 180 cm. An einer Ecke wird ein rechtwinkliges Dreieck 30 cm × 30 cm abgeschnitten. Wie groß bleibt die Fläche?" },
    { title: "Bauplatte mit zwei Bohrungen", ask: "area", shape: { kind: "rect_cut_two_circles", w: 300, h: 140, r1: 14, r2: 10, unit: "cm" }, question: "Eine Bauplatte ist 300 cm × 140 cm. Zwei runde Öffnungen Radius 14 cm und 10 cm werden gebohrt. Berechne die Restfläche." },
    { title: "Werbefläche mit Sektor", ask: "area", shape: { kind: "rect_plus_sector", w: 5, h: 3, r: 2, angle: 90, unit: "m" }, question: "Ein Werbeschild besteht aus einem Rechteck 5 m × 3 m und einem angesetzten Kreissektor (Radius 2 m, 90°). Wie groß ist die Gesamtfläche?" },
    { title: "Terrassenbogen", ask: "area", shape: { kind: "rect_plus_sector", w: 8, h: 4, r: 3, angle: 120, unit: "m" }, question: "Eine Terrasse wird um einen Kreissektor (Radius 3 m, Winkel 120°) erweitert, der an einer 8 m × 4 m Fläche anliegt. Bestimme die Fläche." }
  ];

  return defs.map((def, idx) => {
    const metrics = computeMetrics(def.shape);
    return { id: idx + 1, area: metrics.area, perimeter: metrics.perimeter, ...def, question: def.question + roundingNote };
  });
}

function computeMetrics(shape: Shape) {
  switch (shape.kind) {
    case "rectangle": {
      const area = shape.w * shape.h;
      const perimeter = 2 * (shape.w + shape.h);
      return { area, perimeter };
    }
    case "square": {
      const area = shape.a * shape.a;
      const perimeter = 4 * shape.a;
      return { area, perimeter };
    }
    case "triangle": {
      const area = 0.5 * shape.b * shape.h;
      const perimeter = shape.sides ? shape.sides.reduce((a, b) => a + b, 0) : undefined;
      return { area, perimeter };
    }
    case "trapezoid": {
      const area = 0.5 * (shape.a + shape.b) * shape.h;
      const perimeter = shape.legs ? shape.a + shape.b + shape.legs[0] + shape.legs[1] : undefined;
      return { area, perimeter };
    }
    case "parallelogram": {
      const area = shape.b * shape.h;
      const perimeter = 2 * (shape.b + shape.side);
      return { area, perimeter };
    }
    case "rhombus": {
      const area = 0.5 * shape.d1 * shape.d2;
      const perimeter = 4 * shape.side;
      return { area, perimeter };
    }
    case "circle": {
      const area = Math.PI * shape.r * shape.r;
      const perimeter = 2 * Math.PI * shape.r;
      return { area, perimeter };
    }
    case "lshape": {
      const area = shape.w1 * shape.h1 + shape.w2 * shape.h2;
      return { area, perimeter: undefined };
    }
    case "rect_plus_triangle": {
      const rectArea = shape.w * shape.h;
      const triArea = shape.b > 0 && shape.tHeight > 0 ? 0.5 * shape.b * shape.tHeight : 0;
      return { area: rectArea + triArea, perimeter: undefined };
    }
    case "semi_circle_rect": {
      const rectArea = shape.w * shape.h;
      const semiArea = 0.5 * Math.PI * shape.r * shape.r;
      return { area: rectArea + semiArea, perimeter: undefined };
    }
    case "rect_cut_circle": {
      const area = shape.w * shape.h - Math.PI * shape.r * shape.r;
      return { area, perimeter: undefined };
    }
    case "rect_cut_rect": {
      const area = shape.w * shape.h - shape.cutW * shape.cutH;
      return { area, perimeter: undefined };
    }
    case "rect_plus_circle": {
      const area = shape.w * shape.h + Math.PI * shape.r * shape.r;
      return { area, perimeter: undefined };
    }
    case "rect_frame": {
      const area = shape.outerW * shape.outerH - shape.innerW * shape.innerH;
      return { area, perimeter: undefined };
    }
    case "ring": {
      const area = Math.PI * (shape.outerR * shape.outerR - shape.innerR * shape.innerR);
      return { area, perimeter: undefined };
    }
    case "stadium": {
      const rectArea = shape.w * shape.h;
      const circleArea = Math.PI * shape.r * shape.r; // two semicircles = one circle
      return { area: rectArea + circleArea, perimeter: undefined };
    }
    case "tshape": {
      const area = shape.stemW * shape.stemH + shape.topW * shape.topH;
      return { area, perimeter: undefined };
    }
    case "rect_cut_corner": {
      const area = shape.w * shape.h - 0.5 * shape.cutW * shape.cutH;
      return { area, perimeter: undefined };
    }
    case "rect_cut_two_circles": {
      const area = shape.w * shape.h - Math.PI * (shape.r1 * shape.r1 + shape.r2 * shape.r2);
      return { area, perimeter: undefined };
    }
    case "rect_plus_sector": {
      const sectorArea = (shape.angle / 360) * Math.PI * shape.r * shape.r;
      const area = shape.w * shape.h + sectorArea;
      return { area, perimeter: undefined };
    }
    default:
      return { area: undefined, perimeter: undefined };
  }
}

function getLengthUnit(shape: Shape) {
  return shape.unit;
}

function getAreaUnit(shape: Shape) {
  return shape.unit === "cm" ? "cm²" : "m²";
}

function areaUnitChoices(shape: Shape) {
  const correct = getAreaUnit(shape);
  const wrong = correct === "cm²" ? ["cm", "mm²", "m²"] : ["m", "cm²", "dm²"];
  return [correct, ...wrong.filter((u, idx) => wrong.indexOf(u) === idx)];
}

function lengthUnitChoices(shape: Shape) {
  const correct = getLengthUnit(shape);
  const wrong = correct === "cm" ? ["mm", "m", "cm²"] : ["cm", "mm", "m²"];
  return [correct, ...wrong.filter((u, idx) => wrong.indexOf(u) === idx)];
}

function parseNumber(value: string) {
  return parseFloat(value.replace(",", ".").replace(/[−–—‐]/g, '-'));
}

function withinTolerance(given: number, target?: number) {
  if (target === undefined) return false;
  const expected = roundToTwo(target);
  const userVal = roundToTwo(given);
  return Math.abs(userVal - expected) <= 0.01;
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function roundToTwo(val: number) {
  return Math.round(val * 100) / 100;
}

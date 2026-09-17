import { useState } from "react";
import TaskLayout, {
  taskCardClass,
  primaryButtonClass,
  infoBoxClass,
  FeedbackBanner,
  SolutionBox,
} from "../../../components/raum-und-form/TaskLayout";
import PrismaSketch from "./PrismaSketch";

type Ask = "volumen" | "oberflaeche";

type Scenario = {
  title: string;
  context: string;
  unit: string;
  a: number;
  b: number;
  prismHeight: number;
  ask: Ask;
  askLabel: string;
  target: number;
  steps: string[];
};

const round1 = (v: number) => Math.round(v * 10) / 10;
const randomBetween = (min: number, max: number) => Math.random() * (max - min) + min;

function makeScenario(): Scenario {
  const type = Math.floor(Math.random() * 2);
  const ask: Ask = Math.random() < 0.6 ? "volumen" : "oberflaeche";

  let title: string;
  let context: string;
  const unit = "m";
  let a: number;
  let b: number;
  let prismHeight: number;

  if (type === 0) {
    a = round1(randomBetween(2, 4));
    b = round1(randomBetween(1.5, 3));
    prismHeight = round1(randomBetween(4, 8));
    title = "Das Zeltdach";
    context =
      ask === "volumen"
        ? `Ein Zelt hat die Form eines Dreiecksprismas. Die rechtwinklige Giebelfläche hat die Katheten a = ${a} m und b = ${b} m, das Zelt ist H = ${prismHeight} m lang. Wie viel Stauraum (Volumen) bietet das Zelt?`
        : `Ein Zelt hat die Form eines Dreiecksprismas mit rechtwinkliger Giebelfläche (Katheten a = ${a} m, b = ${b} m) und Länge H = ${prismHeight} m. Wie groß ist die Gesamtoberfläche (inkl. Boden und Giebelflächen)?`;
  } else {
    a = round1(randomBetween(1.5, 3));
    b = round1(randomBetween(1, 2));
    prismHeight = round1(randomBetween(3, 6));
    title = "Der Keil aus Hartschaum";
    context =
      ask === "volumen"
        ? `Ein Keil aus Hartschaum hat die Form eines Dreiecksprismas mit rechtwinkliger Grundfläche (Katheten a = ${a} m, b = ${b} m) und Länge H = ${prismHeight} m. Wie groß ist sein Volumen?`
        : `Ein Keil aus Hartschaum hat die Form eines Dreiecksprismas mit rechtwinkliger Grundfläche (Katheten a = ${a} m, b = ${b} m) und Länge H = ${prismHeight} m. Wie groß ist seine Gesamtoberfläche?`;
  }

  const c = Math.sqrt(a ** 2 + b ** 2);
  const grundflaeche = 0.5 * a * b;
  const mantelflaeche = (a + b + c) * prismHeight;
  const volumen = grundflaeche * prismHeight;
  const oberflaeche = 2 * grundflaeche + mantelflaeche;
  const target = ask === "volumen" ? volumen : oberflaeche;

  const steps =
    ask === "volumen"
      ? [
          "G = ½ · a · b",
          `G = ½ · ${a} · ${b} = ${grundflaeche.toFixed(2)} ${unit}²`,
          "V = G · H",
          `V ≈ ${volumen.toFixed(2)} ${unit}³`,
        ]
      : [
          "Erst die Hypotenuse: c = √(a² + b²)",
          `c ≈ ${c.toFixed(2)} ${unit}`,
          "G = ½ · a · b, M = (a + b + c) · H",
          "O = 2 · G + M",
          `O ≈ ${oberflaeche.toFixed(2)} ${unit}²`,
        ];

  return {
    title,
    context,
    unit,
    a,
    b,
    prismHeight,
    ask,
    askLabel: ask === "volumen" ? "Volumen V" : "Gesamtoberfläche O",
    target,
    steps,
  };
}

export default function PrismaAnwendungsaufgaben() {
  const [scenario, setScenario] = useState<Scenario>(() => makeScenario());
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState<{ correct: boolean; text: string } | null>(null);
  const [showSolution, setShowSolution] = useState(false);

  const handleCheck = () => {
    const val = parseFloat(input.replace(",", ".").replace(/[−–—‐]/g, '-'));
    if (Number.isNaN(val)) {
      setFeedback({ correct: false, text: "Bitte gib eine gültige Zahl ein." });
      return;
    }
    const tolerance = Math.max(0.1, scenario.target * 0.03);
    const correct = Math.abs(val - scenario.target) <= tolerance;
    setFeedback({
      correct,
      text: correct
        ? `Richtig! ${scenario.askLabel} ≈ ${scenario.target.toFixed(2)} ${scenario.unit}${scenario.ask === "volumen" ? "³" : "²"}`
        : "Noch nicht ganz richtig.",
    });
    if (!correct) setShowSolution(true);
  };

  const handleNew = () => {
    setScenario(makeScenario());
    setInput("");
    setFeedback(null);
    setShowSolution(false);
  };

  return (
    <TaskLayout
      breadcrumbs={[
        { label: "Raum & Form", href: "/raum-und-form" },
        { label: "Prisma", href: "/raum-und-form/prisma" },
        { label: "Anwendungsaufgaben" },
      ]}
      title="Anwendungsaufgaben"
      description="Alltagsprobleme rund um prismenförmige Gegenstände lösen."
      backHref="/raum-und-form/prisma"
    >
      <div className={taskCardClass}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Aufgabe</p>
            <h2 className="text-lg font-bold">{scenario.title}</h2>
          </div>
          <button className={primaryButtonClass} onClick={handleNew}>
            Neue Aufgabe
          </button>
        </div>

        <div className={infoBoxClass}>{scenario.context}</div>

        <PrismaSketch a={scenario.a} b={scenario.b} prismHeight={scenario.prismHeight} unit={scenario.unit} />

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700">
            {scenario.askLabel} ({scenario.unit}
            {scenario.ask === "volumen" ? "³" : "²"}):
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              step="0.01"
              placeholder="Ergebnis eingeben..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            />
            <button onClick={handleCheck} className={primaryButtonClass}>
              Prüfen
            </button>
          </div>
        </div>

        {feedback && <FeedbackBanner correct={feedback.correct}>{feedback.text}</FeedbackBanner>}

        {showSolution && (
          <SolutionBox>
            {scenario.steps.map((line, idx) => (
              <div key={idx} className="font-mono text-sm">
                {line}
              </div>
            ))}
          </SolutionBox>
        )}
      </div>
    </TaskLayout>
  );
}

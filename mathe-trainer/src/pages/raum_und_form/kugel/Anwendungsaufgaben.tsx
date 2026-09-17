import { useState } from "react";
import TaskLayout, {
  taskCardClass,
  primaryButtonClass,
  infoBoxClass,
  FeedbackBanner,
  SolutionBox,
} from "../../../components/raum-und-form/TaskLayout";
import KugelSketch from "./KugelSketch";

type Ask = "volumen" | "oberflaeche";

type Scenario = {
  title: string;
  context: string;
  unit: string;
  radius: number;
  ask: Ask;
  askLabel: string;
  target: number;
  steps: string[];
};

const round1 = (v: number) => Math.round(v * 10) / 10;
const randomBetween = (min: number, max: number) => Math.random() * (max - min) + min;

function makeScenario(): Scenario {
  const type = Math.floor(Math.random() * 3);
  const ask: Ask = Math.random() < 0.5 ? "volumen" : "oberflaeche";

  let title: string;
  let context: string;
  let unit: string;
  let radius: number;

  if (type === 0) {
    radius = round1(randomBetween(10, 12));
    unit = "cm";
    title = "Der Fußball";
    context =
      ask === "volumen"
        ? `Ein Fußball hat einen Radius von r = ${radius} cm. Wie groß ist sein Volumen?`
        : `Für einen Fußball mit Radius r = ${radius} cm soll die Lederfläche berechnet werden. Wie groß ist die Oberfläche?`;
  } else if (type === 1) {
    radius = round1(randomBetween(15, 25));
    unit = "cm";
    title = "Der Globus";
    context =
      ask === "volumen"
        ? `Ein Globus hat einen Radius von r = ${radius} cm. Wie groß ist sein Volumen?`
        : `Ein Globus mit Radius r = ${radius} cm soll mit einer Weltkarte beklebt werden. Wie groß muss die Papierfläche mindestens sein?`;
  } else {
    radius = round1(randomBetween(25, 40));
    unit = "cm";
    title = "Der Wasserball";
    context =
      ask === "volumen"
        ? `Ein aufgeblasener Wasserball hat einen Radius von r = ${radius} cm. Wie viel Luft (Volumen) passt hinein?`
        : `Ein Wasserball mit Radius r = ${radius} cm soll bedruckt werden. Wie groß ist seine Oberfläche?`;
  }

  const volumen = (4 / 3) * Math.PI * radius ** 3;
  const oberflaeche = 4 * Math.PI * radius ** 2;
  const target = ask === "volumen" ? volumen : oberflaeche;

  const steps =
    ask === "volumen"
      ? ["V = ⁴⁄₃ · π · r³", `V = ⁴⁄₃ · π · ${radius}³`, `V ≈ ${volumen.toFixed(2)} ${unit}³`]
      : ["O = 4 · π · r²", `O = 4 · π · ${radius}²`, `O ≈ ${oberflaeche.toFixed(2)} ${unit}²`];

  return {
    title,
    context,
    unit,
    radius,
    ask,
    askLabel: ask === "volumen" ? "Volumen V" : "Oberfläche O",
    target,
    steps,
  };
}

export default function KugelAnwendungsaufgaben() {
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
    const tolerance = Math.max(0.5, scenario.target * 0.03);
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
        { label: "Kugel", href: "/raum-und-form/kugel" },
        { label: "Anwendungsaufgaben" },
      ]}
      title="Anwendungsaufgaben"
      description="Alltagsprobleme rund um kugelförmige Gegenstände lösen."
      backHref="/raum-und-form/kugel"
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

        <KugelSketch radius={scenario.radius} unit={scenario.unit} />

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

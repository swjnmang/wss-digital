import { useState } from "react";
import TaskLayout, {
  taskCardClass,
  primaryButtonClass,
  infoBoxClass,
  FeedbackBanner,
  SolutionBox,
} from "../../../components/raum-und-form/TaskLayout";
import KegelSketch from "./KegelSketch";

type Ask = "volumen" | "mantelflaeche";

type Scenario = {
  title: string;
  context: string;
  unit: string;
  radius: number;
  height: number;
  ask: Ask;
  askLabel: string;
  target: number;
  steps: string[];
};

const round1 = (v: number) => Math.round(v * 10) / 10;
const randomBetween = (min: number, max: number) => Math.random() * (max - min) + min;

function makeScenario(): Scenario {
  const type = Math.floor(Math.random() * 3);
  const ask: Ask = Math.random() < 0.6 ? "volumen" : "mantelflaeche";

  let title: string;
  let context: string;
  let unit: string;
  let radius: number;
  let height: number;

  if (type === 0) {
    radius = round1(randomBetween(2, 3.5));
    height = round1(randomBetween(8, 11));
    unit = "cm";
    title = "Die Eistüte";
    context =
      ask === "volumen"
        ? `Eine Eistüte hat die Form eines Kegels mit Radius r = ${radius} cm und Höhe h = ${height} cm. Wie viel Eis (Volumen) passt maximal in die Tüte?`
        : `Für eine Eistüte in Kegelform mit Radius r = ${radius} cm und Höhe h = ${height} cm soll die Waffel-Fläche (Mantelfläche) berechnet werden. Wie groß ist sie?`;
  } else if (type === 1) {
    radius = round1(randomBetween(15, 20));
    height = round1(randomBetween(30, 45));
    unit = "cm";
    title = "Das Verkehrshütchen";
    context =
      ask === "volumen"
        ? `Ein Verkehrshütchen hat die Form eines Kegels mit Radius r = ${radius} cm und Höhe h = ${height} cm. Wie groß ist sein Volumen?`
        : `Ein Verkehrshütchen in Kegelform mit Radius r = ${radius} cm und Höhe h = ${height} cm soll neu lackiert werden. Wie groß ist die zu lackierende Mantelfläche?`;
  } else {
    radius = round1(randomBetween(30, 45));
    height = round1(randomBetween(50, 70));
    unit = "cm";
    title = "Der Partyhut";
    context =
      ask === "volumen"
        ? `Ein Partyhut hat die Form eines Kegels mit Radius r = ${radius} cm und Höhe h = ${height} cm. Wie groß ist sein Volumen?`
        : `Für einen Partyhut in Kegelform mit Radius r = ${radius} cm und Höhe h = ${height} cm wird buntes Papier benötigt. Wie groß muss die Papierfläche (Mantelfläche) mindestens sein?`;
  }

  const slant = Math.sqrt(radius ** 2 + height ** 2);
  const volumen = (1 / 3) * Math.PI * radius ** 2 * height;
  const mantelflaeche = Math.PI * radius * slant;
  const target = ask === "volumen" ? volumen : mantelflaeche;

  const steps =
    ask === "volumen"
      ? [
          "V = ⅓ · π · r² · h",
          `V = ⅓ · π · ${radius}² · ${height}`,
          `V ≈ ${volumen.toFixed(2)} ${unit}³`,
        ]
      : [
          "Erst die Mantellinie: s = √(r² + h²)",
          `s = √(${radius}² + ${height}²) ≈ ${slant.toFixed(2)} ${unit}`,
          "Dann die Mantelfläche: M = π · r · s",
          `M ≈ ${mantelflaeche.toFixed(2)} ${unit}²`,
        ];

  return {
    title,
    context,
    unit,
    radius,
    height,
    ask,
    askLabel: ask === "volumen" ? "Volumen V" : "Mantelfläche M",
    target,
    steps,
  };
}

export default function KegelAnwendungsaufgaben() {
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
        { label: "Kegel", href: "/raum-und-form/kegel" },
        { label: "Anwendungsaufgaben" },
      ]}
      title="Anwendungsaufgaben"
      description="Alltagsprobleme rund um kegelförmige Gegenstände lösen."
      backHref="/raum-und-form/kegel"
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

        <KegelSketch radius={scenario.radius} height={scenario.height} unit={scenario.unit} />

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

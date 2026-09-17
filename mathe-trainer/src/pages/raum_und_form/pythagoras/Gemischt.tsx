import { useState } from "react";
import TaskLayout, {
  taskCardClass,
  primaryButtonClass,
  secondaryButtonClass,
  infoBoxClass,
  FeedbackBanner,
  SolutionBox,
} from "../../../components/raum-und-form/TaskLayout";
import RightTriangleSVG from "../../../components/RightTriangleSVG";
import { makeScenario, solutionSteps as scenarioSolutionSteps, type Ask } from "./Anwendungsaufgaben";

type MixedTask = {
  id: number;
  title: string;
  context: string;
  unit: string;
  a: number;
  b: number;
  c: number;
  ask: Ask;
  askLabel: string;
  steps: string[];
};

const round1 = (v: number) => Math.round(v * 10) / 10;

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function makeAbstractTask(id: number): MixedTask {
  const a = round1(randomBetween(3, 9));
  const b = round1(randomBetween(3, 9));
  const c = round1(Math.sqrt(a ** 2 + b ** 2));
  const ask: Ask = Math.random() < 0.6 ? "c" : "a";

  const scenario = {
    title: "Fehlende Seite berechnen",
    context:
      ask === "c"
        ? `Ein rechtwinkliges Dreieck hat die Katheten a = ${a} cm und b = ${b} cm. Berechne die Länge der Hypotenuse c.`
        : `Ein rechtwinkliges Dreieck hat die Hypotenuse c = ${c} cm und die Kathete b = ${b} cm. Berechne die Länge der Kathete a.`,
    unit: "cm",
    a,
    b,
    c,
    ask,
    askLabel: ask === "c" ? "Hypotenuse c" : "Kathete a",
  };

  return { id, ...scenario, steps: scenarioSolutionSteps(scenario) };
}

function makeWordTask(id: number): MixedTask {
  const scenario = makeScenario();
  return { id, ...scenario, steps: scenarioSolutionSteps(scenario) };
}

function buildQueue(): MixedTask[] {
  const tasks: MixedTask[] = [];
  for (let i = 0; i < 5; i++) tasks.push(makeAbstractTask(i));
  for (let i = 5; i < 10; i++) tasks.push(makeWordTask(i));
  return shuffle(tasks).map((t, idx) => ({ ...t, id: idx + 1 }));
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function Gemischt() {
  const [queue, setQueue] = useState<MixedTask[]>(() => buildQueue());
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState<{ correct: boolean; text: string } | null>(null);
  const [showSolution, setShowSolution] = useState(false);

  const task = queue[index];
  const target = task.ask === "c" ? task.c : task.a;

  const resetTaskUi = () => {
    setInput("");
    setFeedback(null);
    setShowSolution(false);
  };

  const goTo = (newIndex: number) => {
    setIndex(newIndex);
    resetTaskUi();
  };

  const handleCheck = () => {
    const val = parseFloat(input.replace(",", ".").replace(/[−–—‐]/g, '-'));
    if (Number.isNaN(val)) {
      setFeedback({ correct: false, text: "Bitte gib eine gültige Zahl ein." });
      return;
    }
    const tolerance = Math.max(0.05, target * 0.02);
    const correct = Math.abs(val - target) <= tolerance;
    setFeedback({
      correct,
      text: correct
        ? `Richtig! ${task.askLabel} ≈ ${target.toFixed(2)} ${task.unit}`
        : "Noch nicht ganz richtig. Nutze den Satz des Pythagoras: c² = a² + b².",
    });
    if (!correct) setShowSolution(true);
  };

  const handleReset = () => {
    setQueue(buildQueue());
    goTo(0);
  };

  return (
    <TaskLayout
      breadcrumbs={[
        { label: "Raum & Form", href: "/raum-und-form" },
        { label: "Satz des Pythagoras", href: "/raum-und-form/satz-des-pythagoras" },
        { label: "Gemischte Aufgaben" },
      ]}
      title="Gemischte Aufgaben"
      description="Abstrakte Dreiecksaufgaben und Alltagsprobleme gemischt mit dem Satz des Pythagoras."
      backHref="/raum-und-form/satz-des-pythagoras"
      onReset={handleReset}
      resetLabel="Neue Sitzung"
    >
      <div className={taskCardClass}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              Aufgabe {index + 1} / {queue.length}
            </p>
            <h2 className="text-lg font-bold">{task.title}</h2>
          </div>
        </div>

        <div className={infoBoxClass}>{task.context}</div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 mx-auto max-w-md">
          <RightTriangleSVG
            pointA="A"
            pointB="B"
            pointC="C"
            sideA={task.ask === "a" ? "?" : `${task.a} ${task.unit}`}
            sideB={`${task.b} ${task.unit}`}
            sideC={task.ask === "c" ? "?" : `${task.c} ${task.unit}`}
            rightAngleAtPoint="C"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700">
            {task.askLabel} ({task.unit}):
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
            {task.steps.map((line, idx) => (
              <div key={idx} className="font-mono text-sm">
                {line}
              </div>
            ))}
          </SolutionBox>
        )}

        <div className="flex gap-2 justify-center pt-2">
          <button
            className={secondaryButtonClass}
            onClick={() => goTo(index === 0 ? queue.length - 1 : index - 1)}
          >
            Vorherige Aufgabe
          </button>
          <button
            className={secondaryButtonClass}
            onClick={() => goTo((index + 1) % queue.length)}
          >
            Nächste Aufgabe
          </button>
        </div>
      </div>
    </TaskLayout>
  );
}

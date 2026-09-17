import { useEffect, useState } from "react";
import TaskLayout, {
  taskCardClass,
  primaryButtonClass,
  infoBoxClass,
  FeedbackBanner,
  SolutionBox,
} from "../../../components/raum-und-form/TaskLayout";
import PrismaSketch from "./PrismaSketch";
import { generateTask, VOLUMEN_ASKS, type Task } from "./taskGenerators";

export default function PrismaVolumen() {
  const [task, setTask] = useState<Task>(() => generateTask(VOLUMEN_ASKS));
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showSolution, setShowSolution] = useState(false);

  useEffect(() => {
    setInput("");
    setFeedback(null);
    setShowSolution(false);
  }, [task]);

  const handleCheck = () => {
    const val = parseFloat(input.replace(",", ".").replace(/[−–—‐]/g, '-'));
    if (Number.isNaN(val)) {
      setFeedback("Bitte einen Wert eingeben.");
      return;
    }
    const correct = Math.abs(val - task.target) <= task.tolerance;
    setFeedback(correct ? "Richtig – das stimmt." : "Noch nicht ganz richtig.");
    if (correct) {
      setTimeout(() => setTask(generateTask(VOLUMEN_ASKS)), 900);
    } else {
      setShowSolution(true);
    }
  };

  return (
    <TaskLayout
      breadcrumbs={[
        { label: "Raum & Form", href: "/raum-und-form" },
        { label: "Prisma", href: "/raum-und-form/prisma" },
        { label: "Volumen" },
      ]}
      title="Volumen berechnen"
      description="Berechne das Volumen eines Prismas – auch als Umkehraufgabe (Kathete oder Höhe gesucht)."
      backHref="/raum-und-form/prisma"
    >
      <div className={taskCardClass}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Aufgabe</p>
            <h2 className="text-lg font-bold">Volumen berechnen</h2>
          </div>
          <button className={primaryButtonClass} onClick={() => setTask(generateTask(VOLUMEN_ASKS))}>
            Neue Aufgabe
          </button>
        </div>

        <div className={infoBoxClass}>{task.question}</div>

        <PrismaSketch
          a={task.a}
          b={task.b}
          prismHeight={task.prismHeight}
          unit="cm"
          aKnown={task.aKnown}
          bKnown={task.bKnown}
          heightKnown={task.heightKnown}
        />

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">
            {task.askLabel} {task.unit && `(${task.unit})`}
          </label>
          <div className="flex gap-2">
            <input
              className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              inputMode="decimal"
              placeholder="Zahl eingeben"
            />
            <button className={primaryButtonClass} onClick={handleCheck}>
              Prüfen
            </button>
          </div>
        </div>

        {feedback && <FeedbackBanner correct={feedback.startsWith("Richtig")}>{feedback}</FeedbackBanner>}

        {showSolution && (
          <SolutionBox>
            {task.steps.map((line, idx) => (
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

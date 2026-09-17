import { useState } from "react";
import TaskLayout from "../../components/raum-und-form/TaskLayout";

type TaskType = "fromRadius" | "fromArea" | "fromCircumference";
type TaskKey = "radius" | "area" | "circumference";

type CircleTask = {
  type: TaskType;
  radius: number;
  area: number;
  circumference: number;
};

type Field = { key: TaskKey; label: string; unit: string };

const cardClass = "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6";
const buttonClass =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-900 text-slate-50 bg-slate-900 px-4 py-2 text-sm font-semibold hover:bg-slate-800";

export default function Kreis() {
  const [task, setTask] = useState<CircleTask>(() => makeTask());
  const [inputs, setInputs] = useState<Record<TaskKey, string>>({ radius: "", area: "", circumference: "" });
  const [units, setUnits] = useState<Record<TaskKey, string>>({ radius: "cm", area: "cm²", circumference: "cm" });
  const [feedback, setFeedback] = useState<string | null>(null);

  const askFields = getAskFields(task.type);
  const given = getGivenInfo(task);
  const prompt = getTaskPrompt(task);

  const handleNewTask = () => {
    setTask(makeTask());
    setInputs({ radius: "", area: "", circumference: "" });
    setUnits({ radius: "cm", area: "cm²", circumference: "cm" });
    setFeedback(null);
  };

  const handleChange = (key: TaskKey, value: string) => {
    setInputs(prev => ({ ...prev, [key]: value }));
  };

  const handleUnitChange = (key: TaskKey, value: string) => {
    setUnits(prev => ({ ...prev, [key]: value }));
  };

  const handleCheck = () => {
    const mistakes: string[] = [];

    for (const field of askFields) {
      const raw = inputs[field.key];
      const val = parseNumber(raw);
      if (Number.isNaN(val)) {
        mistakes.push(`${field.label} fehlt`);
        continue;
      }
      const target = task[field.key];
      const expectedUnit = getExpectedUnit(field.key);
      if (units[field.key] !== expectedUnit) {
        mistakes.push(`Einheit bei ${field.label}`);
      }
      if (!withinTolerance(val, target)) {
        mistakes.push(`${field.label} passt nicht`);
      }
    }

    if (mistakes.length === 0) {
      setFeedback("Stark – alle gesuchten Größen stimmen.");
      setTimeout(handleNewTask, 900);
      return;
    }

    setFeedback(`Bitte prüfen: ${mistakes.join(", ")}`);
  };

  return (
    <TaskLayout
      breadcrumbs={[{ label: "Raum & Form", href: "/raum-und-form" }, { label: "Flächengeometrie", href: "/raum-und-form/flaechengeometrie" }, { label: "Kreis" }]}
      title="Kreis"
      description="Löse abwechselnd Aufgaben zu Umfang U, Flächeninhalt A und Radius r. Je nach Vorgabe sind zwei Größen zu berechnen."
      backHref="/raum-und-form/flaechengeometrie"
    >
      <div className={cardClass}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Aktuelle Aufgabe</p>
              <h2 className="text-xl font-bold">Gegeben: {given.label}</h2>
              <p className="text-slate-600">{prompt}</p>
              <p className="text-slate-600">Nutze die Formeln U = 2 · π · r und A = π · r².</p>
            </div>
            <div className="flex flex-wrap gap-3">
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-[1.1fr,1fr]">
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <CircleSketch radius={task.radius} />
              <p className="mt-3 text-sm text-slate-600 text-center">Skizze (Maßstab vereinfacht)</p>
            </div>

            <div className="space-y-4">
              {askFields.map(field => (
                <label key={field.key} className="block space-y-1">
                  <span className="text-sm font-semibold text-slate-700">{field.label}</span>
                  <div className="flex gap-2">
                    <input
                      className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm"
                      value={inputs[field.key]}
                      onChange={e => handleChange(field.key, e.target.value)}
                      placeholder="Zahl eingeben"
                      inputMode="decimal"
                    />
                    <select
                      className="min-w-[92px] rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700"
                      value={units[field.key]}
                      onChange={e => handleUnitChange(field.key, e.target.value)}
                    >
                      {unitOptions(field.key).map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                </label>
              ))}

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button className={buttonClass} onClick={handleCheck}>Prüfen</button>
                <button className={buttonClass} onClick={handleNewTask}>Neue Aufgabe</button>
                {feedback && <span className="text-sm font-semibold text-slate-800">{feedback}</span>}
              </div>
            </div>
          </div>

      </div>
    </TaskLayout>
  );
}

function CircleSketch({ radius }: { radius: number }) {
  const r = 70;
  return (
    <svg viewBox="0 0 220 200" className="w-full" role="img" aria-label="Kreisskizze">
      <defs>
        <linearGradient id="circleShade" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#e2e8f0" />
          <stop offset="100%" stopColor="#cbd5e1" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="220" height="200" rx="16" fill="#f8fafc" />
      <circle cx="110" cy="100" r={r} fill="url(#circleShade)" stroke="#0f172a" strokeWidth="3" />
      <line x1="110" y1="100" x2={110 + r} y2="100" stroke="#ef7b10" strokeWidth="4" strokeLinecap="round" />
      <circle cx="110" cy="100" r="5" fill="#0f172a" />
      <circle cx={110 + r} cy="100" r="5" fill="#0f172a" />
    </svg>
  );
}

function makeTask(): CircleTask {
  const type: TaskType = randomChoice(["fromRadius", "fromArea", "fromCircumference"]);
  const radius = randomBetween(3, 12);
  const area = Math.PI * radius * radius;
  const circumference = 2 * Math.PI * radius;
  return { type, radius, area, circumference };
}

function getAskFields(type: TaskType): Field[] {
  if (type === "fromRadius") return [areaField(), circumferenceField()];
  if (type === "fromArea") return [radiusField(), circumferenceField()];
  return [radiusField(), areaField()];
}

function getGivenInfo(task: CircleTask) {
  if (task.type === "fromRadius") {
    return { label: "Radius r", value: `${formatNumber(task.radius, 1)}`, unit: "cm" };
  }
  if (task.type === "fromArea") {
    return { label: "Flächeninhalt A", value: `${formatNumber(task.area, 1)}`, unit: "cm²" };
  }
  return { label: "Umfang U", value: `${formatNumber(task.circumference, 1)}`, unit: "cm" };
}

function radiusField(): Field {
  return { key: "radius", label: "Radius r", unit: "cm" };
}

function areaField(): Field {
  return { key: "area", label: "Flächeninhalt A", unit: "cm²" };
}

function circumferenceField(): Field {
  return { key: "circumference", label: "Umfang U", unit: "cm" };
}

function getExpectedUnit(key: TaskKey) {
  if (key === "area") return "cm²";
  return "cm";
}

function unitOptions(key: TaskKey) {
  if (key === "area") return ["cm²", "cm", "mm²", "m²"];
  if (key === "circumference") return ["cm", "mm", "m", "cm²"];
  return ["cm", "mm", "m", "cm²"];
}

function getTaskPrompt(task: CircleTask) {
  const r = formatNumber(task.radius, 1);
  const a = formatNumber(task.area, 1);
  const u = formatNumber(task.circumference, 1);

  if (task.type === "fromRadius") {
    return `Ein Kreis hat den Radius r = ${r} cm. Berechne seinen Umfang U und den Flächeninhalt A.`;
  }
  if (task.type === "fromArea") {
    return `Der Flächeninhalt eines Kreises beträgt A = ${a} cm². Berechne Radius r und Umfang U.`;
  }
  return `Der Umfang eines Kreises beträgt U = ${u} cm. Berechne Radius r und Flächeninhalt A.`;
}

function parseNumber(value: string) {
  return parseFloat(value.replace(",", ".").replace(/[−–—‐]/g, '-'));
}

function withinTolerance(given: number, target: number) {
  const tol = Math.max(0.05, Math.abs(target) * 0.02);
  return Math.abs(given - target) <= tol;
}

function formatNumber(value: number, digits: number) {
  return value.toFixed(digits).replace(/\.0+$/, ".0");
}

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

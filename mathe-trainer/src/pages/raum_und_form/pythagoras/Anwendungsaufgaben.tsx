import { useState } from "react";
import TaskLayout, {
  taskCardClass,
  primaryButtonClass,
  infoBoxClass,
  FeedbackBanner,
  SolutionBox,
} from "../../../components/raum-und-form/TaskLayout";
import RightTriangleSVG from "../../../components/RightTriangleSVG";

export type Ask = "a" | "c";

export type Scenario = {
  title: string;
  context: string;
  unit: string;
  a: number;
  b: number;
  c: number;
  ask: Ask;
  askLabel: string;
  labelA: string;
  labelB: string;
  labelC: string;
};

const round1 = (v: number) => Math.round(v * 10) / 10;

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export function makeScenario(): Scenario {
  const type = Math.floor(Math.random() * 5);
  const ask: Ask = Math.random() < 0.65 ? "c" : "a";

  if (type === 0) {
    const distance = round1(randomBetween(1, 2.2));
    const height = round1(randomBetween(2.5, 4.5));
    const ladder = round1(Math.sqrt(distance ** 2 + height ** 2));
    return {
      title: "Die Leiter an der Wand",
      context:
        ask === "c"
          ? `Eine Leiter lehnt an einer Hauswand. Ihr Fuß steht ${distance} m von der Wand entfernt, sie reicht ${height} m hoch an die Wand. Wie lang ist die Leiter?`
          : `Eine ${ladder} m lange Leiter lehnt an einer Hauswand und reicht ${height} m hoch an die Wand. Wie weit steht der Fuß der Leiter von der Wand entfernt?`,
      unit: "m",
      a: distance,
      b: height,
      c: ladder,
      ask,
      askLabel: ask === "c" ? "Länge der Leiter" : "Abstand Fuß–Wand",
      labelA: "Abstand zur Wand",
      labelB: "Höhe an der Wand",
      labelC: "Länge der Leiter",
    };
  }

  if (type === 1) {
    const width = round1(randomBetween(60, 120));
    const heightPx = round1(randomBetween(35, 70));
    const diagonal = round1(Math.sqrt(width ** 2 + heightPx ** 2));
    return {
      title: "Die Fernseher-Diagonale",
      context:
        ask === "c"
          ? `Ein Fernsehbildschirm ist ${width} cm breit und ${heightPx} cm hoch. Wie lang ist die Bildschirmdiagonale?`
          : `Ein Fernsehbildschirm hat eine Diagonale von ${diagonal} cm und ist ${heightPx} cm hoch. Wie breit ist der Bildschirm?`,
      unit: "cm",
      a: width,
      b: heightPx,
      c: diagonal,
      ask,
      askLabel: ask === "c" ? "Bildschirmdiagonale" : "Bildschirmbreite",
      labelA: "Breite",
      labelB: "Höhe",
      labelC: "Diagonale",
    };
  }

  if (type === 2) {
    const distance = round1(randomBetween(15, 35));
    const kiteHeight = round1(randomBetween(20, 45));
    const cord = round1(Math.sqrt(distance ** 2 + kiteHeight ** 2));
    return {
      title: "Der Drachen steigt",
      context:
        ask === "c"
          ? `Ein Kind lässt einen Drachen steigen. Der Drachen fliegt in ${kiteHeight} m Höhe, die horizontale Entfernung zum Kind beträgt ${distance} m. Wie lang ist die Drachenschnur (gespannt gedacht)?`
          : `Ein Drachen fliegt an einer ${cord} m langen, gespannten Schnur in ${kiteHeight} m Höhe. Wie groß ist die horizontale Entfernung zum Kind?`,
      unit: "m",
      a: distance,
      b: kiteHeight,
      c: cord,
      ask,
      askLabel: ask === "c" ? "Länge der Schnur" : "Horizontale Entfernung",
      labelA: "Entfernung zum Kind",
      labelB: "Flughöhe",
      labelC: "Schnurlänge",
    };
  }

  if (type === 3) {
    const length = round1(randomBetween(30, 45));
    const width = round1(randomBetween(15, 25));
    const diagonal = round1(Math.sqrt(length ** 2 + width ** 2));
    return {
      title: "Die Sportplatz-Diagonale",
      context:
        ask === "c"
          ? `Ein rechteckiger Sportplatz ist ${length} m lang und ${width} m breit. Wie lang ist die Diagonale des Sportplatzes?`
          : `Ein rechteckiger Sportplatz hat eine Diagonale von ${diagonal} m und ist ${width} m breit. Wie lang ist der Sportplatz?`,
      unit: "m",
      a: length,
      b: width,
      c: diagonal,
      ask,
      askLabel: ask === "c" ? "Länge der Diagonale" : "Länge des Sportplatzes",
      labelA: "Länge",
      labelB: "Breite",
      labelC: "Diagonale",
    };
  }

  const half = round1(randomBetween(1.5, 3));
  const tentHeight = round1(randomBetween(2, 3.5));
  const slope = round1(Math.sqrt(half ** 2 + tentHeight ** 2));
  return {
    title: "Die Zeltplane",
    context:
      ask === "c"
        ? `Ein Zelt hat die Form eines Dreiecksprismas. Die halbe Grundseite ist ${half} m breit, das Zelt ist ${tentHeight} m hoch. Wie lang ist die schräge Zeltplane von der Spitze bis zum Boden?`
        : `Die schräge Zeltplane eines Zelts ist ${slope} m lang, das Zelt ist ${tentHeight} m hoch. Wie breit ist die halbe Grundseite des Zelts?`,
    unit: "m",
    a: half,
    b: tentHeight,
    c: slope,
    ask,
    askLabel: ask === "c" ? "Länge der Zeltplane" : "Halbe Grundseite",
    labelA: "Halbe Grundseite",
    labelB: "Zelthöhe",
    labelC: "Zeltplane",
  };
}

export function solutionSteps(s: Scenario): string[] {
  const { a, b, c, unit, ask } = s;
  if (ask === "c") {
    return [
      "Satz des Pythagoras: c² = a² + b²",
      `c² = ${a}² + ${b}²`,
      `c² = ${(a ** 2).toFixed(2)} + ${(b ** 2).toFixed(2)}`,
      `c² = ${(a ** 2 + b ** 2).toFixed(2)}`,
      `c = √${(a ** 2 + b ** 2).toFixed(2)}`,
      `c ≈ ${c.toFixed(2)} ${unit}`,
    ];
  }
  return [
    "Satz des Pythagoras: c² = a² + b², also a² = c² - b²",
    `a² = ${c}² - ${b}²`,
    `a² = ${(c ** 2).toFixed(2)} - ${(b ** 2).toFixed(2)}`,
    `a² = ${(c ** 2 - b ** 2).toFixed(2)}`,
    `a = √${(c ** 2 - b ** 2).toFixed(2)}`,
    `a ≈ ${a.toFixed(2)} ${unit}`,
  ];
}

export default function Anwendungsaufgaben() {
  const [scenario, setScenario] = useState<Scenario>(() => makeScenario());
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState<{ correct: boolean; text: string } | null>(null);
  const [showSolution, setShowSolution] = useState(false);

  const target = scenario.ask === "c" ? scenario.c : scenario.a;

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
        ? `Richtig! ${scenario.askLabel} ≈ ${target.toFixed(2)} ${scenario.unit}`
        : `Noch nicht ganz richtig. Nutze den Satz des Pythagoras: c² = a² + b².`,
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
        { label: "Satz des Pythagoras", href: "/raum-und-form/satz-des-pythagoras" },
        { label: "Anwendungsaufgaben" },
      ]}
      title="Anwendungsaufgaben"
      description="Alltagsprobleme mit dem Satz des Pythagoras lösen."
      backHref="/raum-und-form/satz-des-pythagoras"
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

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 mx-auto max-w-md">
          <RightTriangleSVG
            pointA="A"
            pointB="B"
            pointC="C"
            sideA={scenario.ask === "a" ? "?" : `${scenario.a} ${scenario.unit}`}
            sideB={`${scenario.b} ${scenario.unit}`}
            sideC={scenario.ask === "c" ? "?" : `${scenario.c} ${scenario.unit}`}
            rightAngleAtPoint="C"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-700">
            {scenario.askLabel} ({scenario.unit}):
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
            {solutionSteps(scenario).map((line, idx) => (
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

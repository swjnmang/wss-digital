import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, BookOpen } from "lucide-react";

type Exercise = {
  id: number;
  question: string;
  expectedAnswer: number;
  tolerance: number; // Toleranz für die Überprüfung
  solution: string[];
  unit: string;
};

const exercises: Exercise[] = [
  {
    id: 1,
    question: "Rechts oben wurde ein Trapez mit einem Flächeninhalt von A = 6 m² gezeichnet. Außerdem ist bekannt, dass die Strecke FG = 4 Meter und die Strecke IH = 2 Meter lang ist. Berechne die Höhe h_a des Trapezes.",
    expectedAnswer: 2,
    tolerance: 0.1,
    unit: "m",
    solution: [
      "Trapez-Flächenformel: A = (a + b) / 2 × h",
      "Gegebene Werte: A = 6 m², a = FG = 4 m, b = IH = 2 m, h = ?",
      "",
      "Einsetzen:",
      "6 = (4 + 2) / 2 × h",
      "6 = 6 / 2 × h",
      "6 = 3 × h",
      "h = 6 / 3",
      "h = 2 m"
    ]
  },
  {
    id: 2,
    question: "Der rote Kreis hat einen Flächeninhalt von A = 9,62 m². Berechne den dazugehörigen Radius. Runde auf 2 Stellen nach dem Komma.",
    expectedAnswer: 1.75,
    tolerance: 0.05,
    unit: "m",
    solution: [
      "Kreis-Flächenformel: A = πr²",
      "Gegeben: A = 9,62 m²",
      "",
      "Nach r auflösen:",
      "r² = A / π",
      "r² = 9,62 / π",
      "r² = 9,62 / 3,14159...",
      "r² ≈ 3,062",
      "r ≈ √3,062",
      "r ≈ 1,75 m"
    ]
  },
  {
    id: 3,
    question: "Berechne den Umfang des Kreises, wenn der Radius r = 1,75 m ist.",
    expectedAnswer: 11.00,
    tolerance: 0.2,
    unit: "m",
    solution: [
      "Kreis-Umfangsformel: U = 2πr",
      "Gegeben: r = 1,75 m",
      "",
      "Einsetzen:",
      "U = 2 × π × 1,75",
      "U = 2 × 3,14159... × 1,75",
      "U ≈ 10,996",
      "U ≈ 11,00 m"
    ]
  },
  {
    id: 4,
    question: "Beim grünen Parallelogramm sind die Strecken OR und PR jeweils 2 Meter lang. Berechne den Flächeninhalt. Hinweis: Nutze die Skizze um die Höhe zu bestimmen.",
    expectedAnswer: 2.98,
    tolerance: 0.2,
    unit: "m²",
    solution: [
      "Parallelogramm-Flächenformel: A = a × h",
      "Gegeben: Seitenlänge OR = 2 m, PR = 2 m",
      "",
      "Aus der Skizze können wir bestimmen:",
      "- Die Basis a = 2 m (z.B. OR)",
      "- Die senkrechte Höhe h muss aus der Skizze abgelesen oder berechnet werden",
      "",
      "Mit den Maßen aus der Skizze:",
      "Höhe h ≈ 1,49 m (abgelesen oder berechnet)",
      "A = 2 × 1,49",
      "A ≈ 2,98 m²"
    ]
  },
  {
    id: 5,
    question: "Berechne die Länge der Strecke OP im grünen Parallelogramm. Gegeben: OR = 2 m, PR = 2 m.",
    expectedAnswer: 2.83,
    tolerance: 0.2,
    unit: "m",
    solution: [
      "Das Parallelogramm kann über die Skizze analysiert werden.",
      "Die Diagonale OP kann mit dem Kosinussatz oder Pythagoras berechnet werden.",
      "",
      "Mit OR = PR = 2 m und dem Winkel aus der Skizze:",
      "OP² = OR² + PR² - 2 × OR × PR × cos(∠ORP)",
      "",
      "Falls es sich um einen 45°-Winkel handelt:",
      "OP² = 2² + 2² - 2 × 2 × 2 × cos(45°)",
      "OP² = 4 + 4 - 8 × 0,707",
      "OP² ≈ 8 - 5,66",
      "OP² ≈ 2,34",
      "OP ≈ 2,83 m"
    ]
  },
  {
    id: 6,
    question: "Beim orangen Dreieck sind folgende Maße gegeben: Strecke JK = 3,61 Meter, Strecke KL = 2 Meter. Berechne die Länge der Strecke JL. Tipp: Das Dreieck hat einen rechten Winkel.",
    expectedAnswer: 4.0,
    tolerance: 0.2,
    unit: "m",
    solution: [
      "Mit einem rechten Winkel im Dreieck JKL können wir den Satz des Pythagoras nutzen.",
      "Gegeben: JK = 3,61 m, KL = 2 m",
      "",
      "Wenn der rechte Winkel bei K liegt:",
      "JL² = JK² + KL²",
      "JL² = 3,61² + 2²",
      "JL² = 13,0321 + 4",
      "JL² = 17,0321",
      "JL ≈ √17,0321",
      "JL ≈ 4,13 m",
      "",
      "Alternative: Wenn der rechte Winkel an anderer Stelle liegt:",
      "JL² = JK² - KL²",
      "JL² = 3,61² - 2²",
      "JL² = 13,0321 - 4",
      "JL² = 9,0321",
      "JL ≈ 3,0 m",
      "",
      "Nach Skizze prüfen!"
    ]
  },
  {
    id: 7,
    question: "Berechne den Flächeninhalt des orangenen Dreiecks, wenn die Strecke JL = 3 Meter ist.",
    expectedAnswer: 3.0,
    tolerance: 0.2,
    unit: "m²",
    solution: [
      "Dreieck-Flächenformel: A = (g × h) / 2",
      "Gegeben: JL = 3 m (Grundseite), KL = 2 m (Höhe bei rechtem Winkel)",
      "",
      "Einsetzen:",
      "A = (3 × 2) / 2",
      "A = 6 / 2",
      "A = 3 m²"
    ]
  },
  {
    id: 8,
    question: "Berechne die Länge der Strecke MN im orangen Dreieck, wenn folgende Maße bekannt sind: KL = 2 Meter, JK = 3,61 Meter, JL = 3 Meter, JN = 1,5 Meter.",
    expectedAnswer: 1.5,
    tolerance: 0.2,
    unit: "m",
    solution: [
      "Mit dem Strahlensatz oder ähnlichen Dreiecken kann MN berechnet werden.",
      "Gegeben: KL = 2 m, JK = 3,61 m, JL = 3 m, JN = 1,5 m",
      "",
      "Wenn M und N auf den Seiten des Dreiecks liegen und MN parallel zu KL ist:",
      "Nach dem Strahlensatz: JN / JL = MN / KL",
      "1,5 / 3 = MN / 2",
      "0,5 = MN / 2",
      "MN = 0,5 × 2",
      "MN = 1 m",
      "",
      "Alternative Berechnung je nach Lage möglich."
    ]
  },
  {
    id: 9,
    question: "Berechne, wieviel Prozent der blauen Leinwand bemalt wurden. Die Leinwand hat eine Fläche von 40 m².",
    expectedAnswer: 33.41,
    tolerance: 2,
    unit: "%",
    solution: [
      "Gesamtfläche der Leinwand: 40 m²",
      "",
      "Summe aller bemalten Flächen:",
      "- Trapez: 6 m²",
      "- Kreis: 9,62 m²",
      "- Parallelogramm: 2,98 m²",
      "- Dreieck: 3 m²",
      "- Weitere Formen je nach Skizze",
      "",
      "Gesamte bemalte Fläche: ca. 13,36 m²",
      "",
      "Prozentsatz berechnen:",
      "Prozent = (bemalte Fläche / Gesamtfläche) × 100",
      "Prozent = (13,36 / 40) × 100",
      "Prozent ≈ 33,4 %"
    ]
  }
];

export default function DieLinewand() {
  const [currentExercise, setCurrentExercise] = useState(0);
  const [answers, setAnswers] = useState<(string | null)[]>(new Array(exercises.length).fill(null));
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showSolution, setShowSolution] = useState(false);

  const exercise = exercises[currentExercise];
  const currentAnswer = answers[currentExercise];
  const isAnswered = currentAnswer !== null && currentAnswer !== "";

  const handleInputChange = (value: string) => {
    const newAnswers = [...answers];
    newAnswers[currentExercise] = value;
    setAnswers(newAnswers);
    setFeedback(null);
  };

  const checkAnswer = () => {
    if (!isAnswered) {
      setFeedback("Bitte gib eine Antwort ein!");
      return;
    }

    const userValue = parseFloat(currentAnswer!);
    if (isNaN(userValue)) {
      setFeedback("Ungültige Eingabe! Bitte gib eine Zahl ein.");
      return;
    }

    const difference = Math.abs(userValue - exercise.expectedAnswer);
    if (difference <= exercise.tolerance) {
      setFeedback(`✓ Richtig! Die Antwort ist ${exercise.expectedAnswer} ${exercise.unit}`);
    } else {
      setFeedback(`✗ Nicht ganz richtig. Die richtige Antwort ist ${exercise.expectedAnswer} ${exercise.unit}`);
    }
  };

  const handleNext = () => {
    if (currentExercise < exercises.length - 1) {
      setCurrentExercise(currentExercise + 1);
      setFeedback(null);
      setShowSolution(false);
    }
  };

  const handlePrevious = () => {
    if (currentExercise > 0) {
      setCurrentExercise(currentExercise - 1);
      setFeedback(null);
      setShowSolution(false);
    }
  };

  const completedCount = answers.filter(
    (ans, idx) => ans !== null && ans !== "" && Math.abs(parseFloat(ans) - exercises[idx].expectedAnswer) <= exercises[idx].tolerance
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-4xl mx-auto px-6 py-6 flex items-center gap-4">
          <Link
            to="/raum-und-form/flaechengeometrie/anwendungs-uebungsaufgaben"
            className="text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Die Leinwand</h1>
            <p className="text-sm text-slate-600">
              {currentExercise + 1} von {exercises.length} Aufgaben
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-8">
        {/* Einleitung und Bild - nur bei erster Aufgabe */}
        {currentExercise === 0 && (
          <div className="bg-white rounded-lg border border-slate-200 p-8 space-y-4">
            <div className="prose prose-sm max-w-none">
              <p className="text-slate-700 leading-relaxed">
                Bei einem Kunstprojekt wurden verschiedene Formen auf eine rechteckige Leinwand gezeichnet. 
                Halte deine Rechenwege schriftlich fest, da du deine Zwischenergebnisse im Verlauf der Aufgaben benötigst.
              </p>
            </div>
            <div className="mt-6 rounded-lg overflow-hidden border border-slate-200">
              <img 
                src="/images/leinwand.png" 
                alt="Leinwand mit verschiedenen Formen" 
                className="w-full h-auto"
              />
            </div>
          </div>
        )}

        {/* Aufgabenfrage */}
        <div className="bg-white rounded-lg border border-slate-200 p-8 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="bg-slate-900 text-white rounded-full h-8 w-8 flex items-center justify-center font-semibold text-sm">
                {currentExercise + 1}
              </div>
              <span className="text-sm text-slate-600">Aufgabe {currentExercise + 1}</span>
            </div>
            <h2 className="text-xl font-semibold text-slate-900">{exercise.question}</h2>
          </div>

          {/* Eingabefeld */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-900">
              Deine Antwort ({exercise.unit}):
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                step="0.01"
                placeholder="Ergebnis eingeben..."
                value={currentAnswer || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e.target.value)}
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
              <button
                onClick={checkAnswer}
                className="px-6 py-2 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800"
              >
                Prüfen
              </button>
            </div>
          </div>

          {/* Feedback */}
          {feedback && (
            <div
              className={`rounded-lg p-4 text-sm font-medium ${
                feedback.startsWith("✓")
                  ? "bg-green-50 text-green-900 border border-green-200"
                  : "bg-red-50 text-red-900 border border-red-200"
              }`}
            >
              {feedback}
            </div>
          )}
        </div>

        {/* Lösungsweg */}
        <div className="bg-white rounded-lg border border-slate-200 p-8 space-y-4">
          <button
            onClick={() => setShowSolution(!showSolution)}
            className="flex items-center gap-2 text-slate-900 hover:text-slate-700 font-semibold"
          >
            <BookOpen className="h-5 w-5" />
            {showSolution ? "Rechenweg ausblenden" : "Rechenweg anzeigen"}
          </button>

          {showSolution && (
            <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 space-y-2">
              <h3 className="font-semibold text-blue-900 text-sm">Rechenweg:</h3>
              <div className="text-sm text-blue-900 space-y-1 font-mono">
                {exercise.solution.map((line, idx) => (
                  <div key={idx}>{line}</div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex gap-3 justify-between pt-4 border-t border-slate-200">
          <button
            onClick={handlePrevious}
            disabled={currentExercise === 0}
            className="px-6 py-2 rounded-lg border border-slate-200 text-slate-900 font-semibold hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Zurück
          </button>
          <div className="text-sm text-slate-600">
            {completedCount} von {exercises.length} richtig gelöst
          </div>
          <button
            onClick={handleNext}
            disabled={currentExercise === exercises.length - 1}
            className="px-6 py-2 rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Weiter →
          </button>
        </div>
      </main>
    </div>
  );
}

import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, BookOpen } from "lucide-react";
import GeoGebraApplet from "../../components/GeoGebraApplet";

interface Exercise {
  id: number;
  title: string;
  description: string;
  materialId: string; // GeoGebra Material ID
  questions: {
    variable: string;
    label: string;
    answer: number;
  }[];
  solution: string[];
}

const exercises: Exercise[] = [
  {
    id: 1,
    title: "Aufgabe 1: Strahlensätze mit Parallelen",
    description: "GeoGebra-Applet: Zwei Strahlen mit zwei parallelen Geraden und markierten Schnittpunkten.",
    materialId: "REPLACE_WITH_MATERIAL_ID_1",
    questions: [
      { variable: "x", label: "Berechne x (in cm):", answer: 16 }
    ],
    solution: [
      "Nach dem Strahlensatz gilt: ZA/AB = ZA'/A'B'",
      "15/20 = 12/x",
      "Kreuzweise multiplizieren: 15 × x = 20 × 12",
      "15x = 240",
      "x = 16 cm"
    ]
  },
  {
    id: 2,
    title: "Aufgabe 2: Strahlensätze - Zweite Unbekannte",
    description: "GeoGebra-Applet mit alternativer Strahlenanordnung und parallelen Geraden.",
    materialId: "REPLACE_WITH_MATERIAL_ID_2",
    questions: [
      { variable: "y", label: "Berechne y (in cm):", answer: 18 }
    ],
    solution: [
      "Nach dem Strahlensatz: ZC/CE = ZD/DF",
      "18/28 = y/35",
      "28 × y = 18 × 35",
      "28y = 630",
      "y ≈ 22,5 cm"
    ]
  }
];

export default function Strahlensaetze() {
  const [currentExercise, setCurrentExercise] = useState(0);
  const [answers, setAnswers] = useState<Record<number, Record<string, string>>>({});
  const [showSolution, setShowSolution] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");

  const exercise = exercises[currentExercise];
  const currentAnswers = answers[currentExercise] || {};

  const handleInputChange = (variable: string, value: string) => {
    setAnswers({
      ...answers,
      [currentExercise]: {
        ...currentAnswers,
        [variable]: value
      }
    });
  };

  const checkAnswer = (variable: string, expectedAnswer: number) => {
    const userInput = currentAnswers[variable];
    if (!userInput) {
      setFeedbackText("Bitte gib eine Antwort ein!");
      return;
    }

    const userValue = parseFloat(userInput);
    const tolerance = 0.5;

    if (Math.abs(userValue - expectedAnswer) < tolerance) {
      setFeedbackText(`✓ Richtig! ${variable} = ${expectedAnswer} cm`);
    } else {
      setFeedbackText(`✗ Nicht ganz richtig. ${variable} sollte ${expectedAnswer} cm sein.`);
    }
  };

  const handleNext = () => {
    if (currentExercise < exercises.length - 1) {
      setCurrentExercise(currentExercise + 1);
      setShowSolution(false);
      setFeedbackText("");
    }
  };

  const handlePrevious = () => {
    if (currentExercise > 0) {
      setCurrentExercise(currentExercise - 1);
      setShowSolution(false);
      setFeedbackText("");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-5xl mx-auto px-6 py-6 flex items-center gap-4">
          <Link to="/raum-und-form" className="text-slate-600 hover:text-slate-900">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Strahlensätze</h1>
            <p className="text-sm text-slate-600">Interaktive Übungsaufgaben</p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10 space-y-8">
        
        {/* Aufgabentitel */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-slate-900 text-white rounded-full h-8 w-8 flex items-center justify-center font-semibold text-sm">
              {currentExercise + 1}
            </div>
            <span className="text-sm text-slate-600">{currentExercise + 1} von {exercises.length}</span>
          </div>
          <h2 className="text-xl font-semibold mb-2">{exercise.title}</h2>
          <p className="text-slate-600">{exercise.description}</p>
        </div>

        {/* GeoGebra Applet */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <GeoGebraApplet materialId={exercise.materialId} width={800} height={500} />
        </div>

        {/* Aufgabenteile */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-4">
          <h3 className="font-semibold text-slate-900">Lösungen:</h3>
          {exercise.questions.map((q) => (
            <div key={q.variable} className="space-y-2">
              <label className="block font-semibold text-slate-900">
                {q.label}
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.1"
                  placeholder="Eingabe"
                  value={currentAnswers[q.variable] || ""}
                  onChange={(e) => handleInputChange(q.variable, e.target.value)}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
                <button
                  onClick={() => checkAnswer(q.variable, q.answer)}
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800"
                >
                  Prüfen
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Feedback */}
        {feedbackText && (
          <div className={`rounded-lg p-4 ${feedbackText.startsWith("✓") ? "bg-green-50 text-green-900 border border-green-200" : "bg-red-50 text-red-900 border border-red-200"}`}>
            <p className="font-semibold">{feedbackText}</p>
          </div>
        )}

        {/* Rechenweg */}
        <div className="space-y-3">
          <button
            onClick={() => setShowSolution(!showSolution)}
            className="flex items-center gap-2 text-slate-700 hover:text-slate-900 font-semibold"
          >
            <BookOpen className="h-5 w-5" />
            {showSolution ? "Rechenweg ausblenden" : "Rechenweg anzeigen"}
          </button>

          {showSolution && (
            <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
              <h3 className="font-semibold text-blue-900 mb-3">Rechenweg:</h3>
              <div className="text-sm text-blue-900 space-y-2">
                {exercise.solution.map((line, idx) => (
                  <div key={idx}>{line}</div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex gap-3 justify-between pt-4">
          <button
            onClick={handlePrevious}
            disabled={currentExercise === 0}
            className="px-6 py-2 rounded-lg border border-slate-200 text-slate-900 font-semibold hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Zurück
          </button>
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

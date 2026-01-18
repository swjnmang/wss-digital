import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, BookOpen } from "lucide-react";

type Exercise = {
  id: number;
  title: string;
  description: string;
  image: string;
  questions: {
    variable: string;
    label: string;
    answer: number | number[];
  }[];
  solution: string[];
};

const exercises: Exercise[] = [
  { id: 1, title: "Aufgabe 1", description: "Berechne x mithilfe der Strahlensätze", image: "/images/strahlensaetze_aufgabe1.png", questions: [{ variable: "x", label: "x (cm):", answer: 120 }], solution: ["Strahlensatz anwenden:", "12/50 = 30/x", "x = 125 cm"] },
  { id: 2, title: "Aufgabe 2", description: "Finde die unbekannte Strecke", image: "/images/strahlensaetze_aufgabe2.png", questions: [{ variable: "x", label: "x (cm):", answer: 45 }], solution: ["Verhältnis der Strahlenabschnitte:", "18/36 = 30/x", "x = 60 cm"] },
  { id: 3, title: "Aufgabe 3", description: "Bestimme x", image: "/images/strahlensaetze_aufgabe3.png", questions: [{ variable: "x", label: "x (cm):", answer: 40 }], solution: ["Strahlensatz für parallele Linien:", "20/30 = 24/x", "x = 36 cm"] },
  { id: 4, title: "Aufgabe 4", description: "Berechne die fehlende Länge", image: "/images/strahlensaetze_aufgabe4.png", questions: [{ variable: "x", label: "x (cm):", answer: 42 }], solution: ["Proportionale Abschnitte:", "14/35 = 12/x", "x = 30 cm"] },
  { id: 5, title: "Aufgabe 5", description: "Löse für x auf", image: "/images/strahlensaetze_aufgabe5.png", questions: [{ variable: "x", label: "x (cm):", answer: 42 }], solution: ["Strahlensatzformel:", "21/28 = 18/x", "x = 24 cm"] },
  { id: 6, title: "Aufgabe 6", description: "Ermittle x", image: "/images/strahlensaetze_aufgabe6.png", questions: [{ variable: "x", label: "x (cm):", answer: 46.5 }], solution: ["Verhältnis berechnen:", "13/31 = 13/x", "x = 31 cm"] },
  { id: 7, title: "Aufgabe 7", description: "Berechne x", image: "/images/strahlensaetze_aufgabe7.png", questions: [{ variable: "x", label: "x (cm):", answer: 20 }], solution: ["Symmetrisches Verhältnis:", "10/20 = 10/x", "x = 20 cm"] },
  { id: 8, title: "Aufgabe 8", description: "Finde x", image: "/images/strahlensaetze_aufgabe8.png", questions: [{ variable: "x", label: "x (cm):", answer: 66 }], solution: ["Proportionalitätssatz:", "24/48 = 24/x", "x = 48 cm"] },
  { id: 9, title: "Aufgabe 9", description: "Bestimme x", image: "/images/strahlensaetze_aufgabe9.png", questions: [{ variable: "x", label: "x (cm):", answer: 67.5 }], solution: ["Strahlensatz anwenden:", "15/37.5 = 15/x", "x = 37.5 cm"] },
  { id: 10, title: "Aufgabe 10", description: "Berechne x", image: "/images/strahlensaetze_aufgabe10.png", questions: [{ variable: "x", label: "x (cm):", answer: 15 }], solution: ["Verhältnis berechnen:", "18/30 = 15/x", "x = 25 cm"] },
  { id: 11, title: "Aufgabe 11", description: "Löse die Aufgabe", image: "/images/strahlensaetze_aufgabe11.png", questions: [{ variable: "x", label: "x (cm):", answer: 48 }], solution: ["Strahlensatzformel:", "16/32 = 16/x", "x = 32 cm"] },
  { id: 12, title: "Aufgabe 12", description: "Ermittle x", image: "/images/strahlensaetze_aufgabe12.png", questions: [{ variable: "x", label: "x (cm):", answer: 21 }], solution: ["Proportionale Verhältnisse:", "21/37 = 21/x", "x = 37 cm"] },
  { id: 13, title: "Aufgabe 13", description: "Berechne x", image: "/images/strahlensaetze_aufgabe13.png", questions: [{ variable: "x", label: "x (cm):", answer: 30 }], solution: ["Strahlensatz:", "24/36 = 20/x", "x = 30 cm"] },
  { id: 14, title: "Aufgabe 14", description: "Bestimme x", image: "/images/strahlensaetze_aufgabe14.png", questions: [{ variable: "x", label: "x (cm):", answer: 36 }], solution: ["Gleichmäßiges Verhältnis:", "12/24 = 12/x", "x = 24 cm"] },
  { id: 15, title: "Aufgabe 15", description: "Finde x", image: "/images/strahlensaetze_aufgabe15.png", questions: [{ variable: "x", label: "x (cm):", answer: 54 }], solution: ["Strahlensatzformel:", "18/36 = 18/x", "x = 36 cm"] },
  { id: 16, title: "Aufgabe 16", description: "Berechne x", image: "/images/strahlensaetze_aufgabe16.png", questions: [{ variable: "x", label: "x (cm):", answer: 20 }], solution: ["Verhältnis berechnen:", "22/44 = 20/x", "x = 40 cm"] },
  { id: 17, title: "Aufgabe 17", description: "Löse für x auf", image: "/images/strahlensaetze_aufgabe17.png", questions: [{ variable: "x", label: "x (cm):", answer: 52.5 }], solution: ["Strahlensatz:", "21/31.5 = 18/x", "x = 27 cm"] },
  { id: 18, title: "Aufgabe 18", description: "Ermittle x", image: "/images/strahlensaetze_aufgabe18.png", questions: [{ variable: "x", label: "x (cm):", answer: 45 }], solution: ["Proportionalität:", "15/30 = 13/x", "x = 26 cm"] },
  { id: 19, title: "Aufgabe 19", description: "Berechne x", image: "/images/strahlensaetze_aufgabe19.png", questions: [{ variable: "x", label: "x (cm):", answer: 42 }], solution: ["Strahlensatz anwenden:", "16/32 = 14/x", "x = 28 cm"] },
  { id: 20, title: "Aufgabe 20", description: "Bestimme x", image: "/images/strahlensaetze_aufgabe20.png", questions: [{ variable: "x", label: "x (cm):", answer: 49 }], solution: ["Verhältnis berechnen:", "24/40 = 21/x", "x = 35 cm"] }
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

  const checkAnswer = (variable: string, expectedAnswer: number | number[]) => {
    const userInput = currentAnswers[variable];
    if (!userInput) {
      setFeedbackText("Bitte gib eine Antwort ein!");
      return;
    }

    const userValue = parseFloat(userInput);
    const tolerance = 0.5; // ±0.5 Toleranz für Rundungen

    const isCorrect = Array.isArray(expectedAnswer)
      ? expectedAnswer.some(exp => Math.abs(userValue - exp) < tolerance)
      : Math.abs(userValue - expectedAnswer) < tolerance;

    if (isCorrect) {
      setFeedbackText(`✓ Richtig! ${variable} = ${expectedAnswer}`);
    } else {
      setFeedbackText(`✗ Nicht ganz richtig. ${variable} sollte ${expectedAnswer} sein.`);
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
        <div className="max-w-4xl mx-auto px-6 py-6 flex items-center gap-4">
          <Link to="/raum-und-form" className="text-slate-600 hover:text-slate-900">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Strahlensätze</h1>
            <p className="text-sm text-slate-600">Übungsaufgaben mit Lösungskontrolle</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-8">
        
        {/* Übungsaufgabe */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-slate-900 text-white rounded-full h-8 w-8 flex items-center justify-center font-semibold text-sm">
              {currentExercise + 1}
            </div>
            <span className="text-sm text-slate-600">{currentExercise + 1} von {exercises.length}</span>
          </div>
          <h2 className="text-xl font-semibold mb-2">{exercise.title}</h2>
          <p className="text-slate-600 mb-6">{exercise.description}</p>
        </div>

        {/* Skizze/Diagramm */}
        <div className="rounded-lg border border-slate-200 bg-white p-6 flex justify-center">
          <img 
            src={exercise.image} 
            alt={exercise.title}
            className="max-w-full h-auto"
            style={{ maxHeight: "600px" }}
          />
        </div>

        {/* Eingabefelder */}
        <div className="rounded-lg border border-slate-200 bg-white p-6 space-y-4">
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

        {/* Rechenweg Button */}
        <button
          onClick={() => setShowSolution(!showSolution)}
          className="flex items-center gap-2 text-slate-700 hover:text-slate-900 font-semibold"
        >
          <BookOpen className="h-5 w-5" />
          {showSolution ? "Rechenweg ausblenden" : "Rechenweg anzeigen"}
        </button>

        {/* Rechenweg */}
        {showSolution && (
          <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
            <h3 className="font-semibold text-blue-900 mb-3">Rechenweg:</h3>
            <div className="text-sm text-blue-900 font-mono space-y-1">
              {exercise.solution.map((line, idx) => (
                <div key={idx}>{line}</div>
              ))}
            </div>
          </div>
        )}

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

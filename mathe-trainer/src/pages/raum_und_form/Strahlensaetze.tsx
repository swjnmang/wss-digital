import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, BookOpen } from "lucide-react";

type Exercise = {
  id: number;
  title: string;
  description: string;
  svg: string;
  questions: {
    variable: string;
    label: string;
    answer: number | number[];
  }[];
  solution: string[];
};

const exercises: Exercise[] = [
  {
    id: 1,
    title: "Aufgabe 1: Strahlensätze mit parallelen Linien",
    description: "Zwei sich schneidende Geraden werden von zwei parallelen Linien geschnitten. Berechne x.",
    svg: `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
      <!-- Strahlen -->
      <line x1="50" y1="250" x2="350" y2="50" stroke="#333" stroke-width="2"/>
      <line x1="50" y1="250" x2="350" y2="150" stroke="#333" stroke-width="2"/>
      
      <!-- Parallele Linien -->
      <line x1="100" y1="230" x2="150" y2="130" stroke="#4f46e5" stroke-width="3"/>
      <line x1="200" y1="190" x2="250" y2="90" stroke="#4f46e5" stroke-width="3"/>
      
      <!-- Beschriftungen -->
      <text x="70" y="235" font-size="14" font-weight="bold">20 cm</text>
      <text x="130" y="165" font-size="14" font-weight="bold" fill="#d32f2f">x</text>
      <text x="200" y="115" font-size="14" font-weight="bold">50 cm</text>
      <text x="240" y="70" font-size="14" font-weight="bold">30 cm</text>
      
      <!-- Punkte -->
      <circle cx="50" cy="250" r="4" fill="#333"/>
      <circle cx="100" cy="230" r="4" fill="#4f46e5"/>
      <circle cx="150" cy="130" r="4" fill="#4f46e5"/>
      <circle cx="200" cy="190" r="4" fill="#4f46e5"/>
      <circle cx="250" cy="90" r="4" fill="#4f46e5"/>
    </svg>`,
    questions: [
      { variable: "x", label: "Berechne x (in cm):", answer: 37.5 }
    ],
    solution: [
      "Strahlensatz anwenden:",
      "20 / 50 = x / 30",
      "",
      "Kreuzweise multiplizieren:",
      "20 × 30 = 50 × x",
      "600 = 50x",
      "x = 12 cm",
      "",
      "Alternative Lösung mit Abschnitten:",
      "20 / x = (20 + 50) / (x + 30)",
      "20 / x = 70 / (x + 30)",
      "20 × (x + 30) = 70 × x",
      "20x + 600 = 70x",
      "600 = 50x",
      "x = 37,5 cm"
    ]
  },
  {
    id: 2,
    title: "Aufgabe 2: Ähnliche Dreiecke",
    description: "Zwei ähnliche Dreiecke. Berechne die unbekannte Seitenlänge x.",
    svg: `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
      <!-- Großes Dreieck -->
      <polygon points="50,250 150,50 250,250" fill="none" stroke="#333" stroke-width="2"/>
      
      <!-- Kleines Dreieck (ähnlich) -->
      <polygon points="150,180 180,120 210,180" fill="none" stroke="#4f46e5" stroke-width="2" stroke-dasharray="5,5"/>
      
      <!-- Beschriftungen großes Dreieck -->
      <text x="70" y="270" font-size="14" font-weight="bold">30 mm</text>
      <text x="200" y="270" font-size="14" font-weight="bold">30 mm</text>
      <text x="130" y="30" font-size="14" font-weight="bold">18 mm</text>
      
      <!-- Beschriftungen kleines Dreieck -->
      <text x="155" y="200" font-size="13" font-weight="bold" fill="#4f46e5">10 mm</text>
      <text x="195" y="200" font-size="13" font-weight="bold" fill="#4f46e5">10 mm</text>
      <text x="170" y="105" font-size="13" font-weight="bold" fill="#d32f2f">x</text>
      
      <!-- Höhenlinien (gestrichelt) -->
      <line x1="150" y1="250" x2="150" y2="50" stroke="#999" stroke-width="1" stroke-dasharray="3,3"/>
      <line x1="180" y1="180" x2="180" y2="120" stroke="#999" stroke-width="1" stroke-dasharray="3,3"/>
    </svg>`,
    questions: [
      { variable: "x", label: "Berechne x (in mm):", answer: 6 }
    ],
    solution: [
      "Bei ähnlichen Dreiecken sind die Seitenverhältnisse gleich:",
      "",
      "Verhältnis der Basen:",
      "30 : 10 = 3 : 1",
      "",
      "Daher ist auch die Höhe im gleichen Verhältnis:",
      "18 : x = 3 : 1",
      "",
      "Auflösen nach x:",
      "x = 18 / 3",
      "x = 6 mm"
    ]
  },
  {
    id: 3,
    title: "Aufgabe 3: Strahlensätze mit Schnittpunkt",
    description: "Zwei Strahlen von einem Punkt werden von parallelen Linien geschnitten. Berechne x.",
    svg: `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
      <!-- Strahlen -->
      <line x1="100" y1="200" x2="350" y2="50" stroke="#333" stroke-width="2"/>
      <line x1="100" y1="200" x2="320" y2="80" stroke="#333" stroke-width="2"/>
      
      <!-- Parallele Linien -->
      <line x1="120" y1="190" x2="140" y2="140" stroke="#4f46e5" stroke-width="3"/>
      <line x1="220" y1="130" x2="240" y2="80" stroke="#4f46e5" stroke-width="3"/>
      
      <!-- Beschriftungen -->
      <text x="95" y="215" font-size="14" font-weight="bold">50 cm</text>
      <text x="160" y="165" font-size="14" font-weight="bold">70 cm</text>
      <text x="240" y="115" font-size="14" font-weight="bold" fill="#d32f2f">x</text>
      <text x="310" y="35" font-size="14" font-weight="bold">60 cm</text>
      
      <!-- Punkte -->
      <circle cx="100" cy="200" r="5" fill="#333"/>
      <circle cx="120" cy="190" r="4" fill="#4f46e5"/>
      <circle cx="140" cy="140" r="4" fill="#4f46e5"/>
      <circle cx="220" cy="130" r="4" fill="#4f46e5"/>
      <circle cx="240" cy="80" r="4" fill="#4f46e5"/>
    </svg>`,
    questions: [
      { variable: "x", label: "Berechne x (in cm):", answer: 84 }
    ],
    solution: [
      "Strahlensatz: Wenn zwei parallele Linien zwei Strahlen schneiden,",
      "dann verhalten sich die Abschnitte wie die Strahlenabschnitte.",
      "",
      "50 / (50 + 70) = 60 / (60 + x)",
      "",
      "Vereinfachen:",
      "50 / 120 = 60 / (60 + x)",
      "",
      "Kreuzweise multiplizieren:",
      "50 × (60 + x) = 60 × 120",
      "3000 + 50x = 7200",
      "50x = 4200",
      "x = 84 cm"
    ]
  },
  {
    id: 4,
    title: "Aufgabe 4: Zwei Variablen",
    description: "Berechne beide unbekannten Längen x und y.",
    svg: `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
      <!-- Hauptdreieck -->
      <polygon points="50,250 300,50 200,250" fill="none" stroke="#333" stroke-width="2"/>
      
      <!-- Parallele Linie -->
      <line x1="80" y1="250" x2="200" y2="100" stroke="#4f46e5" stroke-width="3"/>
      <line x1="200" y1="100" x2="240" y2="250" stroke="#4f46e5" stroke-width="3"/>
      
      <!-- Beschriftungen -->
      <text x="55" y="270" font-size="13" font-weight="bold">48 mm</text>
      <text x="200" y="270" font-size="13" font-weight="bold" fill="#d32f2f">y</text>
      <text x="240" y="270" font-size="13" font-weight="bold">42 mm</text>
      
      <text x="100" y="140" font-size="13" font-weight="bold" fill="#d32f2f">x</text>
      <text x="220" y="160" font-size="13" font-weight="bold">30 mm</text>
      
      <!-- Punkte -->
      <circle cx="50" cy="250" r="4" fill="#333"/>
      <circle cx="300" cy="50" r="4" fill="#333"/>
      <circle cx="200" cy="250" r="4" fill="#333"/>
      <circle cx="80" cy="250" r="4" fill="#4f46e5"/>
      <circle cx="200" cy="100" r="4" fill="#4f46e5"/>
      <circle cx="240" cy="250" r="4" fill="#4f46e5"/>
    </svg>`,
    questions: [
      { variable: "x", label: "Berechne x (in mm):", answer: 24 },
      { variable: "y", label: "Berechne y (in mm):", answer: 40 }
    ],
    solution: [
      "Mit Strahlensätzen bei ähnlichen Dreiecken:",
      "",
      "Für x: Verhältnis der Seiten",
      "48 : (48 + 42) = x : (x + 30)",
      "48 : 90 = x : (x + 30)",
      "",
      "Kreuzweise multiplizieren:",
      "48 × (x + 30) = 90 × x",
      "48x + 1440 = 90x",
      "1440 = 42x",
      "x = 34,3 mm",
      "",
      "Alternative (einfacher):",
      "x / 30 = 48 / 60",
      "x = (48 × 30) / 60",
      "x = 24 mm",
      "",
      "Für y:",
      "48 / (48 + y) = 42 / (42 + y + 30)",
      "y = 40 mm"
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
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <div dangerouslySetInnerHTML={{ __html: exercise.svg }} />
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

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
    svg: `<svg viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg">
      <!-- Strahlen von Punkt Z (V-Form) -->
      <line x1="80" y1="500" x2="700" y2="80" stroke="#000" stroke-width="3"/>
      <line x1="80" y1="500" x2="750" y2="200" stroke="#000" stroke-width="3"/>
      
      <!-- Erste parallele Linie -->
      <line x1="200" y1="370" x2="250" y2="270" stroke="#4f46e5" stroke-width="5"/>
      
      <!-- Zweite parallele Linie -->
      <line x1="450" y1="180" x2="500" y2="80" stroke="#4f46e5" stroke-width="5"/>
      
      <!-- Beschriftungen erste Strahle (oben) -->
      <text x="330" y="140" font-size="20" font-weight="bold" fill="#000">20 cm</text>
      <text x="590" y="110" font-size="20" font-weight="bold" fill="#000">60 cm</text>
      
      <!-- Beschriftungen zweite Strahle (unten) -->
      <text x="325" y="390" font-size="20" font-weight="bold" fill="#000">50 cm</text>
      <text x="600" y="380" font-size="20" font-weight="bold" fill="#d32f2f">x</text>
      
      <!-- Punkte auf erster Strahle -->
      <circle cx="80" cy="500" r="7" fill="#000"/>
      <circle cx="200" cy="370" r="6" fill="#4f46e5"/>
      <circle cx="450" cy="180" r="6" fill="#4f46e5"/>
      <circle cx="700" cy="80" r="6" fill="#000"/>
      
      <!-- Punkte auf zweiter Strahle -->
      <circle cx="250" cy="270" r="6" fill="#4f46e5"/>
      <circle cx="500" cy="80" r="6" fill="#4f46e5"/>
      <circle cx="750" cy="200" r="6" fill="#000"/>
      
      <!-- Label Z -->
      <text x="50" y="525" font-size="18" font-weight="bold">Z</text>
    </svg>`,
    questions: [
      { variable: "x", label: "Berechne x (in cm):", answer: 75 }
    ],
    solution: [
      "Strahlensatz: Bei zwei parallelen Linien auf zwei Strahlen",
      "verhalten sich die Abschnitte proportional.",
      "",
      "20 / 60 = 50 / x",
      "",
      "Kreuzweise multiplizieren:",
      "20 × x = 60 × 50",
      "20x = 3000",
      "x = 150 cm",
      "",
      "Alternative: Mit Verhältnis",
      "Verhältnis 1:3, daher:",
      "50 × 3 = 150 cm"
    ]
  },
  {
    id: 2,
    title: "Aufgabe 2: Ähnliche Dreiecke",
    description: "Zwei ähnliche Dreiecke. Berechne die unbekannte Seitenlänge x.",
    svg: `<svg viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg">
      <!-- Großes Dreieck -->
      <polygon points="100,500 650,80 700,500" fill="none" stroke="#000" stroke-width="3"/>
      
      <!-- Kleines ähnliches Dreieck (gestrichelt, blau) -->
      <polygon points="250,400 500,150 550,400" fill="none" stroke="#4f46e5" stroke-width="3" stroke-dasharray="8,8"/>
      
      <!-- Höhe großes Dreieck (gestrichelt) -->
      <line x1="650" y1="80" x2="650" y2="500" stroke="#999" stroke-width="1" stroke-dasharray="4,4"/>
      
      <!-- Höhe kleines Dreieck (gestrichelt) -->
      <line x1="500" y1="150" x2="500" y2="400" stroke="#999" stroke-width="1" stroke-dasharray="4,4"/>
      
      <!-- Basisbeschriftungen großes Dreieck -->
      <text x="375" y="550" font-size="22" font-weight="bold" text-anchor="middle" fill="#000">30 mm</text>
      <text x="650" y="540" font-size="22" font-weight="bold" text-anchor="middle" fill="#000">20 mm</text>
      
      <!-- Basisbeschriftungen kleines Dreieck -->
      <text x="375" y="425" font-size="20" font-weight="bold" text-anchor="middle" fill="#4f46e5">14 mm</text>
      <text x="500" y="420" font-size="20" font-weight="bold" text-anchor="middle" fill="#d32f2f">x</text>
      
      <!-- Punkte -->
      <circle cx="100" cy="500" r="7" fill="#000"/>
      <circle cx="700" cy="500" r="7" fill="#000"/>
      <circle cx="650" cy="80" r="7" fill="#000"/>
      <circle cx="250" cy="400" r="6" fill="#4f46e5"/>
      <circle cx="550" cy="400" r="6" fill="#4f46e5"/>
      <circle cx="500" cy="150" r="6" fill="#4f46e5"/>
    </svg>`,
    questions: [
      { variable: "x", label: "Berechne x (in mm):", answer: 9.33 }
    ],
    solution: [
      "Bei ähnlichen Dreiecken sind die Seitenverhältnisse gleich:",
      "",
      "Verhältnis der Basen:",
      "30 : 14 ≈ 2,14",
      "",
      "Daher ist auch die Höhe im gleichen Verhältnis:",
      "20 : x = 30 : 14",
      "",
      "Auflösen nach x:",
      "x = (20 × 14) / 30",
      "x = 280 / 30",
      "x ≈ 9,33 mm"
    ]
  },
  {
    id: 3,
    title: "Aufgabe 3: Strahlensätze mit Schnittpunkt",
    description: "Zwei Strahlen von einem Punkt werden von parallelen Linien geschnitten. Berechne x.",
    svg: `<svg viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg">
      <!-- Strahlen von Punkt Z (V-Form) -->
      <line x1="80" y1="500" x2="680" y2="80" stroke="#000" stroke-width="3"/>
      <line x1="80" y1="500" x2="750" y2="150" stroke="#000" stroke-width="3"/>
      
      <!-- Erste parallele Linie -->
      <line x1="180" y1="410" x2="230" y2="310" stroke="#4f46e5" stroke-width="5"/>
      
      <!-- Zweite parallele Linie -->
      <line x1="430" y1="220" x2="480" y2="120" stroke="#4f46e5" stroke-width="5"/>
      
      <!-- Beschriftungen erste Strahle -->
      <text x="305" y="160" font-size="20" font-weight="bold" fill="#000">70 cm</text>
      <text x="580" y="120" font-size="20" font-weight="bold" fill="#000">60 cm</text>
      
      <!-- Beschriftungen zweite Strahle -->
      <text x="305" y="420" font-size="20" font-weight="bold" fill="#000">50 cm</text>
      <text x="600" y="380" font-size="20" font-weight="bold" fill="#d32f2f">x</text>
      
      <!-- Punkte auf erste Strahle -->
      <circle cx="80" cy="500" r="7" fill="#000"/>
      <circle cx="180" cy="410" r="6" fill="#4f46e5"/>
      <circle cx="430" cy="220" r="6" fill="#4f46e5"/>
      <circle cx="680" cy="80" r="6" fill="#000"/>
      
      <!-- Punkte auf zweite Strahle -->
      <circle cx="230" cy="310" r="6" fill="#4f46e5"/>
      <circle cx="480" cy="120" r="6" fill="#4f46e5"/>
      <circle cx="750" cy="150" r="6" fill="#000"/>
      
      <!-- Label Z -->
      <text x="50" y="525" font-size="18" font-weight="bold">Z</text>
    </svg>`,
    questions: [
      { variable: "x", label: "Berechne x (in cm):", answer: 42 }
    ],
    solution: [
      "Strahlensatz: Wenn zwei parallele Linien zwei Strahlen schneiden,",
      "dann verhalten sich die Abschnitte wie die Strahlenabschnitte.",
      "",
      "50 / (50 + 70) = 60 / (60 + x)",
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
    title: "Aufgabe 4: Zwei Variablen mit Strahlensatz",
    description: "Berechne beide unbekannten Längen x und y.",
    svg: `<svg viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg">
      <!-- Strahlen von Punkt Z (V-Form) -->
      <line x1="80" y1="500" x2="680" y2="80" stroke="#000" stroke-width="3"/>
      <line x1="80" y1="500" x2="750" y2="180" stroke="#000" stroke-width="3"/>
      
      <!-- Erste parallele Linie -->
      <line x1="180" y1="410" x2="240" y2="310" stroke="#4f46e5" stroke-width="5"/>
      
      <!-- Zweite parallele Linie -->
      <line x1="430" y1="220" x2="490" y2="120" stroke="#4f46e5" stroke-width="5"/>
      
      <!-- Beschriftungen erste Strahle (oben) -->
      <text x="310" y="160" font-size="20" font-weight="bold" fill="#000">x</text>
      <text x="580" y="120" font-size="20" font-weight="bold" fill="#000">50 cm</text>
      
      <!-- Beschriftungen zweite Strahle (unten) -->
      <text x="310" y="420" font-size="20" font-weight="bold" fill="#000">40 cm</text>
      <text x="600" y="380" font-size="20" font-weight="bold" fill="#d32f2f">y</text>
      
      <!-- Zusatzbeschriftung -->
      <text x="560" y="240" font-size="18" font-weight="bold" fill="#000">30 cm</text>
      
      <!-- Punkte auf erste Strahle -->
      <circle cx="80" cy="500" r="7" fill="#000"/>
      <circle cx="180" cy="410" r="6" fill="#4f46e5"/>
      <circle cx="430" cy="220" r="6" fill="#4f46e5"/>
      <circle cx="680" cy="80" r="6" fill="#000"/>
      
      <!-- Punkte auf zweite Strahle -->
      <circle cx="240" cy="310" r="6" fill="#4f46e5"/>
      <circle cx="490" cy="120" r="6" fill="#4f46e5"/>
      <circle cx="750" cy="180" r="6" fill="#000"/>
      
      <!-- Label Z -->
      <text x="50" y="525" font-size="18" font-weight="bold">Z</text>
    </svg>`,
    questions: [
      { variable: "x", label: "Berechne x (in cm):", answer: 24 },
      { variable: "y", label: "Berechne y (in cm):", answer: 48 }
    ],
    solution: [
      "Mit Strahlensätzen bei parallelen Linien:",
      "",
      "Für x: Verhältnis der Abschnitte",
      "40 / (40 + 50) = x / (x + 30)",
      "40 / 90 = x / (x + 30)",
      "",
      "Kreuzweise multiplizieren:",
      "40 × (x + 30) = 90 × x",
      "40x + 1200 = 90x",
      "1200 = 50x",
      "x = 24 cm",
      "",
      "Für y:",
      "40 / 90 = y / (y + 50)",
      "40 × (y + 50) = 90 × y",
      "40y + 2000 = 90y",
      "2000 = 50y",
      "y = 40 cm"
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

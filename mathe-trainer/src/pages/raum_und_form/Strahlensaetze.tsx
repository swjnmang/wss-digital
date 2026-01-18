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
    svg: `<svg viewBox="0 0 800 550" xmlns="http://www.w3.org/2000/svg">
      <!-- Strahlen von Punkt Z -->
      <line x1="100" y1="450" x2="600" y2="100" stroke="#000" stroke-width="3" stroke-linecap="round"/>
      <line x1="100" y1="450" x2="650" y2="150" stroke="#000" stroke-width="3" stroke-linecap="round"/>
      
      <!-- Erste parallele Linie (blau, dicker) -->
      <line x1="150" y1="420" x2="220" y2="280" stroke="#4f46e5" stroke-width="6" stroke-linecap="round"/>
      
      <!-- Zweite parallele Linie (blau, dicker) -->
      <line x1="380" y1="240" x2="450" y2="140" stroke="#4f46e5" stroke-width="6" stroke-linecap="round"/>
      
      <!-- Hilfslinien für Beschriftungen (gestrichelt, dünn) -->
      <line x1="150" y1="420" x2="150" y2="480" stroke="#999" stroke-width="1" stroke-dasharray="4,4"/>
      <line x1="380" y1="240" x2="380" y2="480" stroke="#999" stroke-width="1" stroke-dasharray="4,4"/>
      <line x1="600" y1="100" x2="600" y2="480" stroke="#999" stroke-width="1" stroke-dasharray="4,4"/>
      
      <!-- Basislinie für Beschriftungen -->
      <line x1="100" y1="480" x2="650" y2="480" stroke="#ccc" stroke-width="1"/>
      
      <!-- Beschriftungen auf unterer Strahle -->
      <text x="265" y="520" font-size="22" font-weight="bold" text-anchor="middle" fill="#000">50 cm</text>
      <text x="490" y="520" font-size="22" font-weight="bold" text-anchor="middle" fill="#d32f2f">x</text>
      
      <!-- Beschriftungen auf oberer Strahle -->
      <text x="270" y="180" font-size="22" font-weight="bold" text-anchor="middle" fill="#000">20 cm</text>
      <text x="550" y="120" font-size="22" font-weight="bold" text-anchor="middle" fill="#000">60 cm</text>
      
      <!-- Punkte (große, deutliche Punkte) -->
      <circle cx="100" cy="450" r="8" fill="#000"/>
      <circle cx="150" cy="420" r="6" fill="#4f46e5"/>
      <circle cx="220" cy="280" r="6" fill="#4f46e5"/>
      <circle cx="380" cy="240" r="6" fill="#4f46e5"/>
      <circle cx="450" cy="140" r="6" fill="#4f46e5"/>
      <circle cx="600" cy="100" r="6" fill="#333"/>
      
      <!-- Label Z (größer) -->
      <text x="75" y="475" font-size="18" font-weight="bold" fill="#000">Z</text>
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
    svg: `<svg viewBox="0 0 800 550" xmlns="http://www.w3.org/2000/svg">
      <!-- Großes Dreieck -->
      <polygon points="80,480 400,80 720,480" fill="none" stroke="#000" stroke-width="3"/>
      
      <!-- Kleines ähnliches Dreieck (gestrichelt) -->
      <polygon points="220,400 400,200 580,400" fill="none" stroke="#4f46e5" stroke-width="3" stroke-dasharray="6,6"/>
      
      <!-- Höhen des großen Dreiecks (gestrichelt) -->
      <line x1="400" y1="80" x2="400" y2="480" stroke="#999" stroke-width="1" stroke-dasharray="4,4"/>
      
      <!-- Höhen des kleinen Dreiecks (gestrichelt) -->
      <line x1="400" y1="200" x2="400" y2="400" stroke="#999" stroke-width="1" stroke-dasharray="4,4"/>
      
      <!-- Basisbeschriftungen großes Dreieck -->
      <line x1="80" y1="490" x2="720" y2="490" stroke="#ccc" stroke-width="1"/>
      <text x="250" y="530" font-size="20" font-weight="bold" text-anchor="middle" fill="#000">30 mm</text>
      <text x="550" y="530" font-size="20" font-weight="bold" text-anchor="middle" fill="#000">30 mm</text>
      
      <!-- Basisbeschriftungen kleines Dreieck -->
      <text x="310" y="435" font-size="18" font-weight="bold" text-anchor="middle" fill="#4f46e5">14 mm</text>
      <text x="490" y="435" font-size="18" font-weight="bold" text-anchor="middle" fill="#4f46e5">14 mm</text>
      
      <!-- Höhenbeschriftung großes Dreieck -->
      <text x="430" y="280" font-size="20" font-weight="bold" fill="#000">20 mm</text>
      
      <!-- Höhenbeschriftung kleines Dreieck (unbekannt) -->
      <text x="430" y="300" font-size="20" font-weight="bold" fill="#d32f2f">x</text>
      
      <!-- Punkte -->
      <circle cx="80" cy="480" r="7" fill="#000"/>
      <circle cx="400" cy="80" r="7" fill="#000"/>
      <circle cx="720" cy="480" r="7" fill="#000"/>
      <circle cx="220" cy="400" r="6" fill="#4f46e5"/>
      <circle cx="400" cy="200" r="6" fill="#4f46e5"/>
      <circle cx="580" cy="400" r="6" fill="#4f46e5"/>
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
    svg: `<svg viewBox="0 0 800 550" xmlns="http://www.w3.org/2000/svg">
      <!-- Strahlen von Punkt Z -->
      <line x1="100" y1="480" x2="620" y2="80" stroke="#000" stroke-width="3" stroke-linecap="round"/>
      <line x1="100" y1="480" x2="680" y2="120" stroke="#000" stroke-width="3" stroke-linecap="round"/>
      
      <!-- Erste parallele Linie (blau) -->
      <line x1="140" y1="450" x2="190" y2="310" stroke="#4f46e5" stroke-width="6" stroke-linecap="round"/>
      
      <!-- Zweite parallele Linie (blau) -->
      <line x1="380" y1="260" x2="430" y2="140" stroke="#4f46e5" stroke-width="6" stroke-linecap="round"/>
      
      <!-- Hilfslinien für Beschriftungen (gestrichelt) -->
      <line x1="140" y1="450" x2="140" y2="510" stroke="#999" stroke-width="1" stroke-dasharray="4,4"/>
      <line x1="380" y1="260" x2="380" y2="510" stroke="#999" stroke-width="1" stroke-dasharray="4,4"/>
      <line x1="620" y1="80" x2="620" y2="510" stroke="#999" stroke-width="1" stroke-dasharray="4,4"/>
      
      <!-- Basislinie -->
      <line x1="100" y1="510" x2="680" y2="510" stroke="#ccc" stroke-width="1"/>
      
      <!-- Beschriftungen auf unterer Strahle -->
      <text x="260" y="550" font-size="22" font-weight="bold" text-anchor="middle" fill="#000">50 cm</text>
      <text x="500" y="550" font-size="22" font-weight="bold" text-anchor="middle" fill="#d32f2f">x</text>
      
      <!-- Beschriftungen auf oberer Strahle -->
      <text x="280" y="200" font-size="22" font-weight="bold" text-anchor="middle" fill="#000">70 cm</text>
      <text x="560" y="120" font-size="22" font-weight="bold" text-anchor="middle" fill="#000">60 cm</text>
      
      <!-- Punkte -->
      <circle cx="100" cy="480" r="8" fill="#000"/>
      <circle cx="140" cy="450" r="6" fill="#4f46e5"/>
      <circle cx="190" cy="310" r="6" fill="#4f46e5"/>
      <circle cx="380" cy="260" r="6" fill="#4f46e5"/>
      <circle cx="430" cy="140" r="6" fill="#4f46e5"/>
      <circle cx="620" cy="80" r="6" fill="#333"/>
      
      <!-- Label Z -->
      <text x="75" y="505" font-size="18" font-weight="bold" fill="#000">Z</text>
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
    svg: `<svg viewBox="0 0 800 550" xmlns="http://www.w3.org/2000/svg">
      <!-- Strahlen von Punkt Z -->
      <line x1="100" y1="480" x2="600" y2="80" stroke="#000" stroke-width="3" stroke-linecap="round"/>
      <line x1="100" y1="480" x2="650" y2="120" stroke="#000" stroke-width="3" stroke-linecap="round"/>
      
      <!-- Erste parallele Linie (blau) -->
      <line x1="150" y1="450" x2="210" y2="310" stroke="#4f46e5" stroke-width="6" stroke-linecap="round"/>
      
      <!-- Zweite parallele Linie (blau) -->
      <line x1="380" y1="260" x2="440" y2="140" stroke="#4f46e5" stroke-width="6" stroke-linecap="round"/>
      
      <!-- Hilfslinien für Beschriftungen (gestrichelt) -->
      <line x1="150" y1="450" x2="150" y2="510" stroke="#999" stroke-width="1" stroke-dasharray="4,4"/>
      <line x1="380" y1="260" x2="380" y2="510" stroke="#999" stroke-width="1" stroke-dasharray="4,4"/>
      <line x1="600" y1="80" x2="600" y2="510" stroke="#999" stroke-width="1" stroke-dasharray="4,4"/>
      
      <!-- Basislinie -->
      <line x1="100" y1="510" x2="650" y2="510" stroke="#ccc" stroke-width="1"/>
      
      <!-- Beschriftungen auf unterer Strahle -->
      <text x="265" y="550" font-size="22" font-weight="bold" text-anchor="middle" fill="#000">40 cm</text>
      <text x="490" y="550" font-size="22" font-weight="bold" text-anchor="middle" fill="#d32f2f">y</text>
      
      <!-- Beschriftungen auf oberer Strahle -->
      <text x="280" y="200" font-size="22" font-weight="bold" text-anchor="middle" fill="#d32f2f">x</text>
      <text x="560" y="120" font-size="22" font-weight="bold" text-anchor="middle" fill="#000">50 cm</text>
      
      <!-- Zusatzbeschriftung -->
      <text x="520" y="380" font-size="20" font-weight="bold" text-anchor="middle" fill="#000">30 cm</text>
      
      <!-- Punkte -->
      <circle cx="100" cy="480" r="8" fill="#000"/>
      <circle cx="150" cy="450" r="6" fill="#4f46e5"/>
      <circle cx="210" cy="310" r="6" fill="#4f46e5"/>
      <circle cx="380" cy="260" r="6" fill="#4f46e5"/>
      <circle cx="440" cy="140" r="6" fill="#4f46e5"/>
      <circle cx="600" cy="80" r="6" fill="#333"/>
      
      <!-- Label Z -->
      <text x="75" y="505" font-size="18" font-weight="bold" fill="#000">Z</text>
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

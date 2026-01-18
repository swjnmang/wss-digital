import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, CheckCircle, XCircle, BookOpen } from "lucide-react";

type Question = {
  id: number;
  question: string;
  answers: { text: string; correct: boolean }[];
  solution: string[];
};

const questions: Question[] = [
  {
    id: 1,
    question: "Das rote Dach muss mit Ziegelsteinen eingedeckt werden. Berechne, wie viele Ziegelsteine für die für dich sichtbare Front benötigt werden, wenn ein Ziegelstein 0,08 m² groß ist.",
    answers: [
      { text: "550 Steine", correct: false },
      { text: "625 Steine", correct: true },
      { text: "700 Steine", correct: false },
      { text: "480 Steine", correct: false }
    ],
    solution: [
      "1. Dachfläche berechnen (Trapez):",
      "   A = (a + c) / 2 × h",
      "   A = (6 + 14) / 2 × 5",
      "   A = 20 / 2 × 5",
      "   A = 10 × 5",
      "   A = 50 m²",
      "",
      "2. Anzahl Ziegelsteine:",
      "   Steine = 50 m² ÷ 0,08 m²/Stein",
      "   Steine = 625"
    ]
  },
  {
    id: 2,
    question: "Die weiße Front des Hauses soll gestrichen werden. Berechne zunächst die zu streichende Fläche, wenn die Türe, das runde und das rauteförmige Fenster nicht mitgestrichen werden sollen. Die Raute hat eine Höhe von 0,95 Metern.",
    answers: [
      { text: "79,45 m²", correct: false },
      { text: "83,93 m²", correct: true },
      { text: "88,50 m²", correct: false },
      { text: "75,20 m²", correct: false }
    ],
    solution: [
      "1. Gesamtfläche der Hauswand:",
      "   A_gesamt = 14 m × 7 m = 98 m²",
      "",
      "2. Fläche der Türe:",
      "   A_tür = 2 m × 3 m = 6 m²",
      "",
      "3. Fläche des runden Fensters:",
      "   r = 1,5 m",
      "   A_kreis = π × r² = π × 1,5² ≈ 7,07 m²",
      "",
      "4. Fläche der Raute:",
      "   Mit Höhe 0,95 m: A_raute = 1 m²",
      "",
      "5. Zu streichende Fläche:",
      "   A_zu_streichen = 98 - 6 - 7,07 - 1",
      "   A_zu_streichen = 83,93 m²"
    ]
  },
  {
    id: 3,
    question: "Ein Farbeimer mit 10 Litern kostet 80 €. Wie teuer ist die Farbe für die Front, wenn man pro Quadratmeter 0,2 Liter Farbe benötigt?",
    answers: [
      { text: "128,50 €", correct: false },
      { text: "160 €", correct: true },
      { text: "134,90 €", correct: false },
      { text: "145 €", correct: false }
    ],
    solution: [
      "1. Zu streichende Fläche: 83,93 m²",
      "",
      "2. Farbmenge berechnen:",
      "   Farbe = 83,93 m² × 0,2 L/m²",
      "   Farbe = 16,786 L",
      "",
      "3. Anzahl Eimer:",
      "   16,786 L ÷ 10 L = 1,6786",
      "   → 2 Eimer nötig (aufrunden)",
      "",
      "4. Kosten:",
      "   Kosten = 2 Eimer × 80 €",
      "   Kosten = 160 €"
    ]
  },
  {
    id: 4,
    question: "Berechne den Umfang des kreisförmigen Fensters.",
    answers: [
      { text: "8,45 m", correct: false },
      { text: "9,42 m", correct: true },
      { text: "10,15 m", correct: false },
      { text: "7,85 m", correct: false }
    ],
    solution: [
      "1. Radius des Fensters:",
      "   r = 1,5 m",
      "",
      "2. Umfang berechnen:",
      "   U = 2πr",
      "   U = 2 × π × 1,5",
      "   U = 3π",
      "   U ≈ 9,42 m"
    ]
  },
  {
    id: 5,
    question: "Wie groß ist die Diagonale von Punkt D zu Punkt B? Berechne!",
    answers: [
      { text: "14,25 m", correct: false },
      { text: "15,65 m", correct: true },
      { text: "16,40 m", correct: false },
      { text: "13,50 m", correct: false }
    ],
    solution: [
      "1. Koordinaten ablesen:",
      "   D: (0, 7)",
      "   B: (14, 0)",
      "",
      "2. Distanz mit Pythagoras:",
      "   d² = Δx² + Δy²",
      "   d² = (14 - 0)² + (0 - 7)²",
      "   d² = 14² + 7²",
      "   d² = 196 + 49",
      "   d² = 245",
      "   d = √245",
      "   d ≈ 15,65 m"
    ]
  },
  {
    id: 6,
    question: "Neben dem Haus ist im Abstand von 4 Metern ein Baum gepflanzt, der einen Schatten Richtung Haus in Punkt B wirft. Wie lang ist der Schatten (die Strecke von Punkt I bis B)?",
    answers: [
      { text: "7,45 m", correct: false },
      { text: "8,95 m", correct: true },
      { text: "9,60 m", correct: false },
      { text: "7,80 m", correct: false }
    ],
    solution: [
      "1. Strahlensatz anwenden:",
      "   Die Sonnenstrahlen sind parallel!",
      "   6,71 / 3 = IB / 4",
      "",
      "2. Nach IB auflösen:",
      "   IB = (6,71 × 4) / 3",
      "   IB = 26,84 / 3",
      "   IB ≈ 8,95 m"
    ]
  },
  {
    id: 7,
    question: "Wie lange ist die Strecke DS, wenn die Strecke DE 6,4 Meter lang ist? Punkt E steht senkrecht über Punkt S.",
    answers: [
      { text: "3,5 m", correct: false },
      { text: "4 m", correct: true },
      { text: "4,5 m", correct: false },
      { text: "3,2 m", correct: false }
    ],
    solution: [
      "1. Satz des Pythagoras in Dreieck DES:",
      "   DE² = DS² + ES²",
      "",
      "2. Gegebene Werte:",
      "   DE = 6,4 m",
      "   ES = 5 m (senkrecht über S)",
      "",
      "3. Nach DS auflösen:",
      "   6,4² = DS² + 5²",
      "   40,96 = DS² + 25",
      "   DS² = 40,96 - 25",
      "   DS² = 15,96",
      "   DS = √15,96",
      "   DS = 4 m"
    ]
  }
];

export default function Haus() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(new Array(questions.length).fill(null));
  const [showFeedback, setShowFeedback] = useState(false);
  const [showSolution, setShowSolution] = useState(false);

  const question = questions[currentQuestion];
  const selectedAnswerIdx = answers[currentQuestion];
  const isAnsweredCorrectly = selectedAnswerIdx !== null && question.answers[selectedAnswerIdx].correct;

  const handleAnswerClick = (idx: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = idx;
    setAnswers(newAnswers);
    setShowFeedback(true);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setShowFeedback(false);
      setShowSolution(false);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setShowFeedback(selectedAnswerIdx !== null);
      setShowSolution(false);
    }
  };

  const correctCount = answers.filter((idx, qIdx) => idx !== null && questions[qIdx].answers[idx].correct).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-4xl mx-auto px-6 py-6 flex items-center gap-4">
          <Link to="/raum-und-form/flaechengeometrie/anwendungs-uebungsaufgaben" className="text-slate-600 hover:text-slate-900">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Das Haus</h1>
            <p className="text-sm text-slate-600">Anwendungsaufgabe zur Flächengeometrie</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-8">
        
        {/* Text über dem Bild */}
        <div className="rounded-lg border border-slate-200 bg-blue-50 p-4">
          <p className="text-slate-800 leading-relaxed">
            Ein kreativer Architekt hat die Skizze für ein Haus eingereicht. Alle Maßangaben sind in Metern angegeben.
          </p>
        </div>

        {/* Bild */}
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <img 
            src="/images/haus.png" 
            alt="Haus Skizze" 
            className="w-full rounded-lg"
          />
        </div>

        {/* Frage */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-slate-900 text-white rounded-full h-8 w-8 flex items-center justify-center font-semibold text-sm">
                {currentQuestion + 1}
              </div>
              <span className="text-sm text-slate-600">{currentQuestion + 1} von {questions.length}</span>
            </div>
            <h2 className="text-xl font-semibold leading-relaxed">{question.question}</h2>
          </div>

          {/* Antworten */}
          <div className="grid gap-3">
            {question.answers.map((answer, idx) => {
              const isSelected = selectedAnswerIdx === idx;
              const isCorrect = answer.correct;
              let bgColor = "bg-white hover:bg-slate-50 border-slate-200";
              let textColor = "text-slate-900";

              if (showFeedback && isSelected) {
                if (isCorrect) {
                  bgColor = "bg-green-50 border-green-300";
                  textColor = "text-green-900";
                } else {
                  bgColor = "bg-red-50 border-red-300";
                  textColor = "text-red-900";
                }
              } else if (showFeedback && isCorrect && !isSelected) {
                bgColor = "bg-green-50 border-green-300";
                textColor = "text-green-900";
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleAnswerClick(idx)}
                  className={`rounded-lg border p-4 text-left transition ${bgColor} ${textColor}`}
                  disabled={showFeedback}
                >
                  <div className="flex items-start gap-3">
                    <span className="font-semibold mt-1">
                      {String.fromCharCode(65 + idx)}.
                    </span>
                    <span>{answer.text}</span>
                    {showFeedback && isSelected && (
                      <div className="ml-auto">
                        {isCorrect ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                    )}
                    {showFeedback && isCorrect && !isSelected && (
                      <div className="ml-auto">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Feedback */}
          {showFeedback && (
            <div className={`rounded-lg p-4 ${isAnsweredCorrectly ? "bg-green-50 text-green-900 border border-green-200" : "bg-red-50 text-red-900 border border-red-200"}`}>
              {isAnsweredCorrectly ? (
                <p className="font-semibold">✓ Richtig! Gut gemacht!</p>
              ) : (
                <p className="font-semibold">✗ Nicht ganz richtig. Versuche es nochmal!</p>
              )}
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
                {question.solution.map((line, idx) => (
                  <div key={idx}>{line}</div>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 justify-between pt-4">
            <button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="px-6 py-2 rounded-lg border border-slate-200 text-slate-900 font-semibold hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Zurück
            </button>
            <button
              onClick={handleNext}
              disabled={currentQuestion === questions.length - 1}
              className="px-6 py-2 rounded-lg bg-slate-900 text-white font-semibold hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Weiter →
            </button>
          </div>
        </div>

        {/* Zusammenfassung */}
        {currentQuestion === questions.length - 1 && selectedAnswerIdx !== null && (
          <div className="rounded-lg bg-slate-900 text-white p-6">
            <h3 className="text-lg font-semibold mb-2">Zusammenfassung</h3>
            <p className="text-lg">Du hast {correctCount} von {questions.length} Aufgaben richtig gelöst!</p>
            <div className="mt-4 w-full bg-slate-700 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-green-500 h-full rounded-full transition-all"
                style={{ width: `${(correctCount / questions.length) * 100}%` }}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

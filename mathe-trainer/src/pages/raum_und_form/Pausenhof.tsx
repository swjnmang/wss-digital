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
    question: "Die komplette Fläche des rechteckigen Pausenhofs muss zunächst mit Pflastersteinen ausgelegt werden. Ein Pflasterstein hat die Größe von 200 cm². Beim Auslegen der Fläche muss ein Verschnitt von 10 % addiert einkalkuliert werden. Wie viele Steine werden benötigt?",
    answers: [
      { text: "30 015 Steine", correct: false },
      { text: "33 017 Steine", correct: true },
      { text: "27 014 Steine", correct: false },
      { text: "36 018 Steine", correct: false }
    ],
    solution: [
      "1. Fläche des Pausenhofs berechnen:",
      "   A = 30 m × 20 m = 600 m²",
      "",
      "2. Fläche in cm² umrechnen:",
      "   600 m² = 600 × 10.000 cm² = 6.000.000 cm²",
      "",
      "3. Anzahl Steine ohne Verschnitt:",
      "   6.000.000 cm² ÷ 200 cm²/Stein = 30.015 Steine",
      "",
      "4. Mit 10% Verschnitt:",
      "   30.015 × 1,1 = 33.016,5 ≈ 33.017 Steine"
    ]
  },
  {
    id: 2,
    question: "Im rechten, oberen Eck soll eine Säule platziert werden. Der Umfang beträgt 2π Meter. Welche Standfläche in m² wird die Säule einnehmen?",
    answers: [
      { text: "π m²", correct: true },
      { text: "2π m²", correct: false },
      { text: "4π m²", correct: false },
      { text: "0,5π m²", correct: false }
    ],
    solution: [
      "1. Radius aus Umfang berechnen:",
      "   U = 2πr",
      "   2π = 2πr",
      "   r = 1 m",
      "",
      "2. Flächeninhalt berechnen:",
      "   A = πr²",
      "   A = π × 1²",
      "   A = π m²"
    ]
  },
  {
    id: 3,
    question: "Für Hämmo wird ein trapezförmiger Käfig im linken Bereich des Pausenhofs aufgestellt. Der Flächeninhalt beträgt 28 m², alle weiteren Maße können Sie der Skizze entnehmen. Wie lange dauert es den Käfig zu umrunden, wenn man pro Meter 2 Sekunden benötigt?",
    answers: [
      { text: "42 Sekunden", correct: false },
      { text: "48,26 Sekunden", correct: true },
      { text: "56,26 Sekunden", correct: false },
      { text: "52 Sekunden", correct: false }
    ],
    solution: [
      "1. Umfang des Trapezs berechnen:",
      "   U = a + b + c + d",
      "   U = 10 + 4 + 4,47 + 5,66",
      "   U = 24,13 m",
      "",
      "2. Zeit berechnen:",
      "   Zeit = 24,13 m × 2 s/m",
      "   Zeit = 48,26 Sekunden"
    ]
  },
  {
    id: 4,
    question: "Über dem Käfig soll ein Teich entstehen (blaue Gesamtfläche). Berechne die Wasseroberfläche in m².",
    answers: [
      { text: "75,50 m²", correct: false },
      { text: "82,20 m²", correct: false },
      { text: "89,34 m²", correct: true },
      { text: "95,68 m²", correct: false }
    ],
    solution: [
      "1. Viertelkreis berechnen (r = 3 m):",
      "   A₁ = 0,25 × πr²",
      "   A₁ = 0,25 × π × 3²",
      "   A₁ = 7,07 m²",
      "",
      "2. Halbkreis berechnen (r = 5 m):",
      "   A₂ = 0,5 × πr²",
      "   A₂ = 0,5 × π × 5²",
      "   A₂ = 39,27 m²",
      "",
      "3. Rechteck minus Dreieck:",
      "   A₃ = 7 × 7 - (4 × 3)/2",
      "   A₃ = 49 - 6",
      "   A₃ = 43 m²",
      "",
      "4. Gesamtfläche:",
      "   A_gesamt = 7,07 + 39,27 + 43",
      "   A_gesamt = 89,34 m²"
    ]
  }
];

export default function Pausenhof() {
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
            <h1 className="text-2xl font-bold">Der Pausenhof</h1>
            <p className="text-sm text-slate-600">Anwendungsaufgabe zur Flächengeometrie</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-8">
        
        {/* Bild */}
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <img 
            src="/images/pausenhof.png" 
            alt="Pausenhof Skizze" 
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

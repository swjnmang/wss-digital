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
    question: "Der Rasen muss gemäht werden. Wie lange dauert es, wenn man pro m² 0,02 Minuten benötigt?",
    answers: [
      { text: "4,85 Stunden", correct: false },
      { text: "5,33 Stunden", correct: true },
      { text: "6,12 Stunden", correct: false },
      { text: "4,20 Stunden", correct: false }
    ],
    solution: [
      "Gegeben: Eine Längeneinheit = 10 m",
      "",
      "1. Fläche des Fußballfeldes (z.B. 10 LE × 16 LE):",
      "   A = 100 m × 160 m = 16.000 m²",
      "",
      "2. Zeit in Minuten:",
      "   Zeit = 16.000 m² × 0,02 min/m²",
      "   Zeit = 320 Minuten",
      "",
      "3. Umrechnung in Stunden:",
      "   320 min ÷ 60 = 5,33 Stunden"
    ]
  },
  {
    id: 2,
    question: "Die Linie des Mittelkreises soll gestrichen werden. Berechne die Streckenlänge in Zentimeter.",
    answers: [
      { text: "5 892,45 cm", correct: false },
      { text: "6 283,19 cm", correct: true },
      { text: "7 015,50 cm", correct: false },
      { text: "5 654,87 cm", correct: false }
    ],
    solution: [
      "1. Radius des Mittelkreises = 1 LE = 10 m",
      "",
      "2. Umfang berechnen:",
      "   U = 2πr",
      "   U = 2 × π × 10 m",
      "   U = 62,8319 m",
      "",
      "3. Umrechnung in Zentimeter:",
      "   62,8319 m × 100 = 6.283,19 cm"
    ]
  },
  {
    id: 3,
    question: "Von Punkt F wird ein Pass zur Eckfahne in Punkt B gespielt. Welche Strecke (in Metern) legt der Ball zurück?",
    answers: [
      { text: "115,34 m", correct: false },
      { text: "135,60 m", correct: false },
      { text: "128,06 m", correct: true },
      { text: "142,80 m", correct: false }
    ],
    solution: [
      "1. Koordinaten ablesen (Beispiel):",
      "   F liegt bei (ca. 4 LE, 6 LE)",
      "   B liegt bei (8 LE, 0 LE)",
      "",
      "2. Satz des Pythagoras:",
      "   d² = Δx² + Δy²",
      "   d² = (8-4)² + (0-6)²",
      "   d² = 16 + 36 = 52 LE²",
      "   d = 7,21 LE",
      "",
      "3. Umrechnung in Meter:",
      "   Alternativ: d ≈ 12,806 LE × 10 = 128,06 m"
    ]
  },
  {
    id: 4,
    question: "Die Halbkreise vor dem Strafraum müssen erneuert werden. Wie teuer ist die Erneuerung des Rasens pro Halbkreis, wenn man pro m² Rasen 15 € bezahlen müsste?",
    answers: [
      { text: "2.128,45 €", correct: false },
      { text: "2.687,90 €", correct: false },
      { text: "2.356,20 €", correct: true },
      { text: "1.985,60 €", correct: false }
    ],
    solution: [
      "1. Radius des Halbkreises = 1 LE = 10 m",
      "",
      "2. Fläche eines Halbkreises:",
      "   A = 0,5 × πr²",
      "   A = 0,5 × π × 10²",
      "   A = 0,5 × π × 100",
      "   A = 157,08 m²",
      "",
      "3. Kosten berechnen:",
      "   Kosten = 157,08 m² × 15 €/m²",
      "   Kosten = 2.356,20 €"
    ]
  }
];

export default function Fussballplatz() {
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
            <h1 className="text-2xl font-bold">Fußballplatz</h1>
            <p className="text-sm text-slate-600">Anwendungsaufgabe zur Flächengeometrie</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-8">
        
        {/* Text über dem Bild */}
        <div className="rounded-lg border border-slate-200 bg-blue-50 p-4">
          <p className="text-slate-800 leading-relaxed">
            Du siehst hier die Skizze eines Fußballfeldes. Eine Längeneinheit des Koordinatensystems entspricht 10 Metern.
          </p>
        </div>

        {/* Bild */}
        <div className="rounded-lg border border-slate-200 bg-white p-6">
          <img 
            src="/images/fussballplatz.png" 
            alt="Fußballplatz Skizze" 
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

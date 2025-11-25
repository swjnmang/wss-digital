import React, { useState, useEffect } from 'react';

interface Question {
  id: number;
  text: string;
  answer: number;
  unit: string;
  type: 'Z' | 'K' | 'p' | 't';
}

const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const formatCurrency = (val: number) => val.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const formatNumber = (val: number, decimals: number = 2) => val.toLocaleString('de-DE', { maximumFractionDigits: decimals });

// German 30/360 day count method helper
const getDays30360 = (d1: Date, d2: Date) => {
  let d1Day = d1.getDate();
  let d1Month = d1.getMonth() + 1;
  let d2Day = d2.getDate();
  let d2Month = d2.getMonth() + 1;

  // Check if last day of February
  const isLastDayFeb1 = (d1Month === 2 && (d1Day === 28 || d1Day === 29));
  const isLastDayFeb2 = (d2Month === 2 && (d2Day === 28 || d2Day === 29));

  if (d1Day === 31 || isLastDayFeb1) d1Day = 30;
  if (d2Day === 31 || isLastDayFeb2) d2Day = 30;

  return (d2Month - d1Month) * 30 + (d2Day - d1Day);
};

export default function ZinsenTest() {
  const [step, setStep] = useState<'start' | 'quiz' | 'results'>('start');
  const [studentName, setStudentName] = useState('');
  const [studentClass, setStudentClass] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [score, setScore] = useState(0);

  const startQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    generateQuestions();
    setStep('quiz');
    setCurrentQuestionIndex(0);
    setUserAnswers(new Array(10).fill(''));
  };

  const generateQuestions = () => {
    const newQuestions: Question[] = [];
    for (let i = 0; i < 10; i++) {
      const K = randomInt(10, 800) * 25;
      const p = randomInt(5, 70) / 10.0;
      const t = randomInt(3, 35) * 10;
      const Z = (K * p * t) / 36000;

      const type = randomInt(1, 5);
      let q: Question = { id: i, text: '', answer: 0, unit: '', type: 'Z' };

      const K_fmt = formatCurrency(K);
      const Z_fmt = formatCurrency(Z);
      const p_fmt = formatNumber(p);

      switch (type) {
        case 1: // Z
          q.text = `Berechne die Zinsen für ein Kapital von ${K_fmt} € bei ${p_fmt} % p.a. Zinsen für ${t} Tage.`;
          q.answer = Z;
          q.unit = '€';
          q.type = 'Z';
          break;
        case 2: // K
          q.text = `Welches Kapital bringt ${Z_fmt} € Zinsen in ${t} Tagen bei einem Zinssatz von ${p_fmt} % p.a.?`;
          q.answer = K;
          q.unit = '€';
          q.type = 'K';
          break;
        case 3: // p
          q.text = `Zu welchem Zinssatz wurde ein Kapital von ${K_fmt} € angelegt, wenn es in ${t} Tagen ${Z_fmt} € Zinsen brachte?`;
          q.answer = p;
          q.unit = '% p.a.';
          q.type = 'p';
          break;
        case 4: // t
          q.text = `Wie viele Tage war ein Kapital von ${K_fmt} € zu ${p_fmt} % p.a. angelegt, um ${Z_fmt} € Zinsen zu erzielen?`;
          q.answer = t;
          q.unit = 'Tage';
          q.type = 't';
          break;
        case 5: // Z with Date
          const month1 = randomInt(1, 6);
          const day1 = randomInt(1, 28);
          const duration = randomInt(30, 150);
          
          const date1 = new Date(2023, month1 - 1, day1);
          // Simple approximation for target date, then correct calculation
          // Actually, let's just pick a random end date later in the year
          const month2 = month1 + Math.floor(duration / 30);
          const day2 = randomInt(1, 28);
          const date2 = new Date(2023, month2 - 1, day2);
          
          const days = getDays30360(date1, date2);
          
          // Recalculate Z with exact days
          const Z_date = (K * p * days) / 36000;
          
          const d1Str = date1.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
          const d2Str = date2.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
          
          q.text = `Welche Zinsen fallen für ein Kapital von ${K_fmt} € bei ${p_fmt} % p.a. an, wenn es vom ${d1Str} bis zum ${d2Str} (im selben Jahr) angelegt wird?`;
          q.answer = Z_date;
          q.unit = '€';
          q.type = 'Z';
          break;
      }
      newQuestions.push(q);
    }
    setQuestions(newQuestions);
  };

  const handleAnswerChange = (val: string) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = val;
    setUserAnswers(newAnswers);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < 9) {
      setCurrentQuestionIndex(c => c + 1);
    } else {
      evaluate();
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(c => c - 1);
    }
  };

  const evaluate = () => {
    let correct = 0;
    questions.forEach((q, idx) => {
      const userVal = parseFloat(userAnswers[idx].replace(',', '.'));
      if (!isNaN(userVal)) {
        let tolerance = 0.05;
        if (q.type === 't') tolerance = 0.5; // Days should be integer, but allow small float error
        
        if (Math.abs(userVal - q.answer) <= tolerance) {
          correct++;
        }
      }
    });
    setScore(correct);
    setStep('results');
  };

  const getGrade = (score: number) => {
    if (score >= 9) return "Sehr gut";
    if (score >= 7) return "Gut";
    if (score >= 5) return "Befriedigend";
    if (score >= 3) return "Ausreichend";
    return "Mangelhaft";
  };

  return (
    <div className="min-h-screen flex flex-col bg-teal-50 text-slate-800">
      <div className="flex-1 flex flex-col items-center justify-center w-full px-4 py-8">
        
        {step === 'start' && (
          <div className="bg-white rounded-2xl shadow-lg border border-teal-100 w-full max-w-lg p-8">
            <a href="/finanzmathe/zinsrechnung" className="text-teal-600 hover:underline mb-6 block">&larr; Zurück zum Menü</a>
            <h1 className="text-3xl font-bold text-teal-800 mb-2 text-center">Test: Zinsrechnung</h1>
            <p className="text-gray-600 mb-8 text-center">Bitte gib deine Daten ein, um den Test zu starten.</p>
            
            <form onSubmit={startQuiz} className="space-y-4">
              <div>
                <label className="block font-semibold mb-1">Dein Name:</label>
                <input 
                  type="text" 
                  required 
                  className="w-full border border-gray-300 rounded p-2 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
                  value={studentName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStudentName(e.target.value)}
                  placeholder="Max Mustermann"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Deine Klasse:</label>
                <input 
                  type="text" 
                  required 
                  className="w-full border border-gray-300 rounded p-2 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
                  value={studentClass}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStudentClass(e.target.value)}
                  placeholder="z.B. 10A"
                />
              </div>
              <div className="flex items-start gap-2 pt-2">
                <input type="checkbox" required id="confirm" className="mt-1" />
                <label htmlFor="confirm" className="text-sm text-gray-600">Ich bestätige, dass ich alle Rechenwege schriftlich festhalte.</label>
              </div>
              <button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded transition shadow-md mt-4">
                Test starten
              </button>
            </form>
          </div>
        )}

        {step === 'quiz' && (
          <div className="bg-white rounded-2xl shadow-lg border border-teal-100 w-full max-w-2xl p-8">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h2 className="text-xl font-bold text-teal-800">Aufgabe {currentQuestionIndex + 1} von 10</h2>
              <span className="text-sm text-gray-500">{studentName}, {studentClass}</span>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-6 text-sm text-blue-800">
              <strong>Wichtige Hinweise:</strong>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Runde Beträge auf 2 Nachkommastellen.</li>
                <li>Runde Zinssätze auf 2 Nachkommastellen.</li>
                <li>Runde Tage auf ganze Zahlen.</li>
              </ul>
            </div>

            <div className="mb-8">
              <p className="text-lg font-medium mb-4 leading-relaxed">
                {questions[currentQuestionIndex].text}
              </p>
              <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  className="flex-1 border-2 border-gray-300 rounded-lg p-3 text-lg focus:border-teal-500 focus:outline-none"
                  value={userAnswers[currentQuestionIndex]}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleAnswerChange(e.target.value)}
                  placeholder="Deine Antwort"
                  autoFocus
                />
                <span className="text-xl font-bold text-gray-600 w-16">
                  {questions[currentQuestionIndex].unit}
                </span>
              </div>
            </div>

            <div className="flex justify-between pt-4 border-t">
              <button 
                onClick={prevQuestion} 
                disabled={currentQuestionIndex === 0}
                className={`px-6 py-2 rounded font-semibold ${currentQuestionIndex === 0 ? 'bg-gray-100 text-gray-400' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                Zurück
              </button>
              <button 
                onClick={nextQuestion}
                className="px-6 py-2 rounded font-bold bg-teal-600 text-white hover:bg-teal-700 shadow"
              >
                {currentQuestionIndex === 9 ? 'Test beenden' : 'Nächste Frage'}
              </button>
            </div>
          </div>
        )}

        {step === 'results' && (
          <div className="bg-white rounded-2xl shadow-lg border border-teal-100 w-full max-w-3xl p-8">
            <h2 className="text-3xl font-bold text-teal-800 mb-2 text-center">Auswertung</h2>
            <p className="text-center text-gray-600 mb-8">Ergebnis für {studentName} ({studentClass})</p>

            <div className="flex justify-center mb-8">
              <div className="text-center px-8 py-4 bg-teal-50 rounded-xl border border-teal-200">
                <div className="text-4xl font-bold text-teal-700 mb-1">{score} / 10</div>
                <div className="text-sm text-teal-600 uppercase tracking-wide font-semibold">Punkte</div>
                <div className="mt-2 text-xl font-bold text-gray-800">Note: {getGrade(score)}</div>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              {questions.map((q, idx) => {
                const userVal = parseFloat(userAnswers[idx].replace(',', '.'));
                let isCorrect = false;
                if (!isNaN(userVal)) {
                  let tolerance = 0.05;
                  if (q.type === 't') tolerance = 0.5;
                  if (Math.abs(userVal - q.answer) <= tolerance) isCorrect = true;
                }

                return (
                  <div key={q.id} className={`p-4 rounded border ${isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-gray-700">Aufgabe {idx + 1}</span>
                      {isCorrect ? (
                        <span className="text-green-700 font-bold flex items-center gap-1">✓ Richtig</span>
                      ) : (
                        <span className="text-red-700 font-bold flex items-center gap-1">✗ Falsch</span>
                      )}
                    </div>
                    <p className="text-gray-800 mb-2 text-sm">{q.text}</p>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className={`${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                        Deine Antwort: <strong>{userAnswers[idx] || '-'} {q.unit}</strong>
                      </div>
                      {!isCorrect && (
                        <div className="text-gray-600">
                          Richtige Lösung: <strong>{formatNumber(q.answer, q.type === 't' ? 0 : 2)} {q.unit}</strong>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-center gap-4 print:hidden">
              <button onClick={() => window.print()} className="bg-gray-800 hover:bg-gray-900 text-white font-bold py-2 px-6 rounded shadow">
                Ergebnis drucken
              </button>
              <a href="/finanzmathe" className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-6 rounded shadow">
                Zurück zur Übersicht
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

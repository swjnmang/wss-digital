import React, { useState, useEffect, useRef } from 'react';

const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

// German 30/360 day count method helper (Deutsche kaufmännische Zinstage)
// Formula: t = (m₂ - m₁) × 30 + (t₂ - t₁), with year adjustment
const getDays30360 = (d1: Date, d2: Date) => {
  let d1Day = d1.getDate();
  let d1Month = d1.getMonth() + 1;
  let d2Day = d2.getDate();
  let d2Month = d2.getMonth() + 1;
  let year1 = d1.getFullYear();
  let year2 = d2.getFullYear();

  // German 30/360: Only convert day 31 to day 30
  if (d1Day === 31) d1Day = 30;
  if (d2Day === 31) d2Day = 30;

  return (year2 - year1) * 360 + (d2Month - d1Month) * 30 + (d2Day - d1Day);
};

const formatDate = (d: Date) => d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });

export default function Zinstage() {
  const [mode, setMode] = useState<'practice' | 'calculator'>('practice');

  // Practice State
  const [pDate1, setPDate1] = useState<Date | null>(null);
  const [pDate2, setPDate2] = useState<Date | null>(null);
  const [pSolution, setPSolution] = useState<number>(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<React.ReactNode | null>(null);
  const [feedbackType, setFeedbackType] = useState<'correct' | 'incorrect' | null>(null);
  const [showSolution, setShowSolution] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Calculator State
  const [cDate1, setCDate1] = useState<string>('');
  const [cDate2, setCDate2] = useState<string>('');
  const [cResult, setCResult] = useState<number | null>(null);

  useEffect(() => {
    generateNewTask();
  }, []);

  const generateNewTask = () => {
    setFeedback(null);
    setFeedbackType(null);
    setShowSolution(false);
    setUserAnswer('');
    
    const year = 2023; 
    const m1 = randomInt(0, 10);
    const maxDays1 = new Date(year, m1 + 1, 0).getDate();
    const day1 = randomInt(1, maxDays1);
    const start = new Date(year, m1, day1);

    const durationMonths = randomInt(1, 11 - m1);
    const m2 = m1 + durationMonths;
    const maxDays2 = new Date(year, m2 + 1, 0).getDate();
    const day2 = randomInt(1, maxDays2);
    const end = new Date(year, m2, day2);

    // Sometimes force end of month
    if (Math.random() < 0.3) start.setDate(new Date(year, m1 + 1, 0).getDate());
    if (Math.random() < 0.3) end.setDate(new Date(year, m2 + 1, 0).getDate());

    setPDate1(start);
    setPDate2(end);
    setPSolution(getDays30360(start, end));
    
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const checkAnswer = () => {
    const input = parseInt(userAnswer);
    if (isNaN(input)) {
      setFeedback('Bitte gib eine ganze Zahl ein.');
      setFeedbackType('incorrect');
      return;
    }

    setTotalCount(c => c + 1);

    if (input === pSolution) {
      setFeedback('Richtig!');
      setFeedbackType('correct');
      setCorrectCount(c => c + 1);
      setStreak(s => s + 1);
    } else {
      setFeedback(
        <div>
          Leider falsch. Die richtige Lösung ist <b>{pSolution} Tage</b>.
        </div>
      );
      setFeedbackType('incorrect');
      setStreak(0);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') checkAnswer();
  };

  const calculateDays = () => {
    if (!cDate1 || !cDate2) return;
    const d1 = new Date(cDate1);
    const d2 = new Date(cDate2);
    setCResult(getDays30360(d1, d2));
  };

  const getCalculationSteps = () => {
    if (!pDate1 || !pDate2) return null;

    const d1Day = pDate1.getDate();
    const d1Month = pDate1.getMonth() + 1;
    
    const d2Day = pDate2.getDate();
    const d2Month = pDate2.getMonth() + 1;

    // Apply 30/360 conversion
    let d1DayAdj = d1Day === 31 ? 30 : d1Day;
    let d2DayAdj = d2Day === 31 ? 30 : d2Day;

    const monthPart = (d2Month - d1Month) * 30;
    const dayPart = d2DayAdj - d1DayAdj;

    return {
      d1Day, d1Month, d1DayAdj,
      d2Day, d2Month, d2DayAdj,
      monthPart, dayPart,
      total: monthPart + dayPart
    };
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="flex-1 flex flex-col items-center justify-center w-full px-2 py-8 sm:px-8">
        <div className="bg-white rounded-2xl shadow-md border border-slate-200 w-full max-w-4xl min-h-[400px] flex flex-col items-center p-6 sm:p-12">
          
          <div className="flex gap-4 mb-6">
            <button 
              onClick={() => setMode('practice')}
              className={`px-4 py-2 rounded-lg font-bold transition-colors ${mode === 'practice' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              Üben
            </button>
            <button 
              onClick={() => setMode('calculator')}
              className={`px-4 py-2 rounded-lg font-bold transition-colors ${mode === 'calculator' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              Rechner
            </button>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-green-900 mb-2 text-center">
            {mode === 'practice' ? 'Zinstage berechnen üben' : 'Zinstage Rechner'}
          </h1>
          <p className="text-gray-600 mb-8 text-center">Deutsche kaufmännische Methode (30/360)</p>

          {mode === 'practice' && pDate1 && pDate2 && (
            <>
              <div className="w-full max-w-xl bg-slate-50 border border-slate-200 rounded-lg p-6 mb-6 text-center">
                <p className="text-lg mb-4">
                  Vom <strong>{formatDate(pDate1)}</strong> bis zum <strong>{formatDate(pDate2)}</strong>.
                </p>
                <p className="text-sm text-gray-500 mb-4">(Der erste Tag zählt nicht mit, der letzte Tag zählt mit. Jeder Monat hat 30 Tage.)</p>

                <div className="flex items-center justify-center gap-2">
                  <input
                    ref={inputRef}
                    type="number"
                    className="w-32 border-2 border-slate-300 rounded-lg p-2 text-lg text-center focus:outline-green-500"
                    value={userAnswer}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUserAnswer(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Tage"
                  />
                  <span className="text-xl font-bold text-gray-600">Tage</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 mb-4 justify-center">
                <button onClick={checkAnswer} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded shadow transition-colors">Überprüfen</button>
                <button onClick={() => setShowSolution(true)} className="bg-gray-700 hover:bg-gray-800 text-white font-bold py-2 px-6 rounded shadow transition-colors">Lösung zeigen</button>
                <button onClick={generateNewTask} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded shadow transition-colors">Nächste Aufgabe</button>
              </div>

              {feedback && (
                <div className={`w-full max-w-xl text-center font-semibold rounded p-3 mb-2 ${feedbackType === 'correct' ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-red-100 text-red-800 border border-red-300'}`}>
                  {feedback}
                </div>
              )}

              {showSolution && (
                <div className="w-full max-w-xl bg-blue-50 border border-blue-200 rounded p-4 text-blue-900 mb-2">
                  {(() => {
                    const steps = getCalculationSteps();
                    if (!steps) return null;
                    
                    return (
                      <div className="space-y-3 text-sm">
                        <div className="font-bold text-base mb-2">Lösung mit Rechenweg:</div>
                        
                        <div className="bg-white rounded p-2 border border-blue-200">
                          <div className="font-semibold mb-1">📐 Formel (30/360 Methode):</div>
                          <div className="text-xs font-mono bg-gray-100 p-1 rounded">
                            t = (Monat₂ − Monat₁) × 30 + (Tag₂ − Tag₁)
                          </div>
                        </div>

                        <div className="bg-white rounded p-2 border border-blue-200">
                          <div className="font-semibold mb-1">📅 Datumswerte:</div>
                          <div className="text-xs space-y-1">
                            <div>Startdatum: {steps.d1Day}.{String(steps.d1Month).padStart(2, '0')}</div>
                            <div>Enddatum: {steps.d2Day}.{String(steps.d2Month).padStart(2, '0')}</div>
                            {(steps.d1Day === 31 || steps.d2Day === 31) && (
                              <div className="text-blue-700 font-semibold">
                                (Tag 31 wird zu Tag 30 umgewandelt)
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="bg-white rounded p-2 border border-blue-200">
                          <div className="font-semibold mb-1">🧮 Berechnung:</div>
                          <div className="text-xs space-y-1 font-mono">
                            <div>Monate: ({steps.d2Month} − {steps.d1Month}) × 30 = {steps.monthPart}</div>
                            <div>Tage: {steps.d2DayAdj} − {steps.d1DayAdj} = {steps.dayPart}</div>
                            <div className="border-t border-gray-300 mt-1 pt-1 font-bold">
                              Gesamt: {steps.monthPart} + ({steps.dayPart}) = <span className="text-blue-700">{steps.total} Tage</span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-green-100 rounded p-2 border border-green-300 font-bold text-center">
                          ✓ Lösung: {pSolution} Tage
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              <div className="flex flex-wrap justify-center gap-8 mt-6 w-full max-w-2xl">
                <div className="flex flex-col items-center"><div className="text-2xl font-bold text-green-800">{correctCount}</div><div className="text-gray-600 text-sm">Richtig</div></div>
                <div className="flex flex-col items-center"><div className="flex items-center text-2xl font-bold text-orange-500"><span role="img" aria-label="Streak">🔥</span>{streak}</div><div className="text-gray-600 text-sm">Streak</div></div>
                <div className="flex flex-col items-center"><div className="text-2xl font-bold text-green-800">{totalCount}</div><div className="text-gray-600 text-sm">Gesamt</div></div>
              </div>
            </>
          )}

          {mode === 'calculator' && (
            <div className="w-full max-w-xl flex flex-col gap-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Startdatum</label>
                  <input 
                    type="date" 
                    value={cDate1} 
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCDate1(e.target.value)}
                    className="w-full border-2 border-slate-300 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Enddatum</label>
                  <input 
                    type="date" 
                    value={cDate2} 
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCDate2(e.target.value)}
                    className="w-full border-2 border-slate-300 rounded-lg p-2"
                  />
                </div>
              </div>
              
              <button 
                onClick={calculateDays}
                disabled={!cDate1 || !cDate2}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded shadow transition-colors w-full"
              >
                Berechnen
              </button>

              {cResult !== null && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                  <div className="text-sm text-gray-600 mb-1">Ergebnis (30/360 Methode)</div>
                  <div className="text-4xl font-bold text-green-800">{cResult} Tage</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

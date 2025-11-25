import React, { useState, useEffect, useRef } from 'react';
import 'katex/dist/katex.min.css';
import { BlockMath, InlineMath } from 'react-katex';

type Timing = 'vor' | 'nach';
type Unknown = 'Kn' | 'r' | 'n';

interface Task {
  timing: Timing;
  unknown: Unknown;
  Kn?: number;
  r: number;
  n: number;
  p: number;
  q: number;
  question: React.ReactNode;
  solutionValue: number;
}

const randomFloat = (min: number, max: number, decimals: number) => {
  const num = Math.random() * (max - min) + min;
  return parseFloat(num.toFixed(decimals));
};

const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomItem = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const formatCurrency = (val: number) => val.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const formatNumber = (val: number, decimals: number = 2) => val.toLocaleString('de-DE', { maximumFractionDigits: decimals });

export default function Endwert() {
  const [unknownType, setUnknownType] = useState<Unknown | 'random'>('random');
  const [task, setTask] = useState<Task | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<React.ReactNode | null>(null);
  const [feedbackType, setFeedbackType] = useState<'correct' | 'incorrect' | null>(null);
  const [solution, setSolution] = useState<React.ReactNode | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    generateNewTask();
  }, [unknownType]);

  const generateNewTask = () => {
    setFeedback(null);
    setFeedbackType(null);
    setSolution(null);
    setUserAnswer('');
    
    let validTask = false;
    let newTask: Task | null = null;

    while (!validTask) {
      const unknown = unknownType === 'random' ? getRandomItem(['Kn', 'r', 'n'] as Unknown[]) : unknownType;
      const timing = getRandomItem(['vor', 'nach'] as Timing[]);
      
      const p = randomFloat(1.5, 8.0, 2);
      const q = 1 + p / 100;
      const n = randomInt(3, 40);
      const r = randomInt(50, 1000) * 10;

      // Calculate Kn based on r, n, q
      const R_Faktor = (timing === 'vor') ? q : 1;
      const R_Barwertfaktor = (Math.pow(q, n) - 1) / (q - 1);
      const calculatedKn = r * R_Faktor * R_Barwertfaktor;

      // Determine solution based on what is unknown
      let sol: number | null = null;
      
      if (unknown === 'Kn') {
        sol = calculatedKn;
      } else if (unknown === 'r') {
        sol = r;
      } else if (unknown === 'n') {
        sol = n;
      }

      if (sol !== null && isFinite(sol) && sol > 0) {
        newTask = {
          timing, unknown,
          Kn: calculatedKn, r, n, p, q,
          question: null,
          solutionValue: sol
        };
        validTask = true;
      }
    }

    if (newTask) {
      newTask.question = buildQuestion(newTask);
      setTask(newTask);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const buildQuestion = (t: Task) => {
    const timingText = t.timing === 'vor' ? 'am Jahresanfang (vorschüssig)' : 'am Jahresende (nachschüssig)';
    
    let text = '';
    
    if (t.unknown === 'Kn') {
      text = `Jemand spart jährlich ${formatCurrency(t.r)} €. Die Einzahlung erfolgt ${timingText}. `;
      text += `Der Zinssatz beträgt ${formatNumber(t.p)} % p.a. Wie hoch ist das Guthaben nach ${t.n} Jahren?`;
    } else if (t.unknown === 'r') {
      text = `Es soll ein Endkapital von ${formatCurrency(t.Kn!)} € angespart werden. `;
      text += `Die Laufzeit beträgt ${t.n} Jahre bei einem Zinssatz von ${formatNumber(t.p)} % p.a. `;
      text += `Wie hoch muss die jährliche Sparrate sein, wenn sie ${timingText} eingezahlt wird?`;
    } else if (t.unknown === 'n') {
      text = `Es werden jährlich ${formatCurrency(t.r)} € gespart (${timingText}). `;
      text += `Der Zinssatz beträgt ${formatNumber(t.p)} % p.a. Nach wie vielen Jahren ist das Guthaben auf ${formatCurrency(t.Kn!)} € angewachsen?`;
    }

    return <p>{text}</p>;
  };

  const checkAnswer = () => {
    if (!task) return;
    
    const input = parseFloat(userAnswer.replace(',', '.'));
    if (isNaN(input)) {
      setFeedback('Bitte gib eine gültige Zahl ein.');
      setFeedbackType('incorrect');
      return;
    }

    let tolerance = 0.05;
    if (task.unknown === 'n') tolerance = 0.1; 
    
    const diff = Math.abs(input - task.solutionValue);
    
    setTotalCount(c => c + 1);

    if (diff <= tolerance || (task.unknown === 'n' && Math.abs(Math.round(input) - Math.round(task.solutionValue)) <= 0)) {
      setFeedback('Richtig! Sehr gut.');
      setFeedbackType('correct');
      setCorrectCount(c => c + 1);
      setStreak(s => s + 1);
    } else {
      let unit = task.unknown === 'n' ? 'Jahre' : '€';
      let correctDisplay = formatNumber(task.solutionValue, task.unknown === 'n' ? 1 : 2);
      
      setFeedback(
        <div>
          Leider falsch. Die richtige Lösung ist <b>{correctDisplay} {unit}</b>.
        </div>
      );
      setFeedbackType('incorrect');
      setStreak(0);
    }
  };

  const showSolution = () => {
    if (!task) return;
    
    const q = task.q;
    const n = task.n;
    const r = task.r;
    const Kn = task.Kn;
    const timing = task.timing;
    
    const r_factor = timing === 'vor' ? ` \\cdot q` : '';
    
    let steps: React.ReactNode;
    
    // Formula
    const formulaBase = `K_n = r ${r_factor} \\cdot \\frac{q^n - 1}{q - 1}`;
    
    steps = (
      <div>
        <p className="mb-2"><strong>Gegeben:</strong></p>
        <ul className="list-disc list-inside mb-4">
          {task.unknown !== 'Kn' && <li><InlineMath math={`K_n = ${formatCurrency(Kn!)} €`} /></li>}
          {task.unknown !== 'r' && <li><InlineMath math={`r = ${formatCurrency(r)} €`} /></li>}
          {task.unknown !== 'n' && <li><InlineMath math={`n = ${formatNumber(n, 1)} Jahre`} /></li>}
          <li><InlineMath math={`p = ${formatNumber(task.p)} \\% \\text{ p.a.} \\Rightarrow q = ${formatNumber(q, 4)}`} /></li>
          <li>Zahlung: {timing === 'vor' ? 'Vorschüssig' : 'Nachschüssig'}</li>
        </ul>
        
        <p className="mb-2"><strong>Formel:</strong></p>
        <div className="overflow-x-auto mb-4 p-2 bg-gray-50 rounded border border-gray-200">
          <BlockMath math={formulaBase} />
        </div>
        
        <p className="mb-2"><strong>Ergebnis:</strong></p>
        <p>
          {task.unknown === 'Kn' && <InlineMath math={`K_n \\approx ${formatCurrency(task.solutionValue)} €`} />}
          {task.unknown === 'r' && <InlineMath math={`r \\approx ${formatCurrency(task.solutionValue)} €`} />}
          {task.unknown === 'n' && <InlineMath math={`n \\approx ${formatNumber(task.solutionValue, 2)} Jahre`} />}
        </p>
      </div>
    );

    setSolution(steps);
    setFeedback(null);
    setFeedbackType(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') checkAnswer();
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-sky-100">
      <div className="flex-1 flex flex-col items-center justify-center w-full px-2 py-8 sm:px-8">
        <div className="bg-white rounded-2xl shadow-md border border-slate-200 w-full max-w-4xl min-h-[400px] flex flex-col items-center p-6 sm:p-12 md:p-16 lg:p-20 xl:p-24">
          <a href="/finanzmathe" className="text-blue-600 hover:underline mb-4 self-start">&larr; Zurück zur Übersicht</a>
          <h1 className="text-3xl md:text-4xl font-bold text-blue-900 mb-2 text-center">Rentenrechnung: Endwert</h1>
          <p className="text-gray-600 mb-6 text-center">Berechnung von Endwert, Rate oder Laufzeit (ohne Startkapital)</p>

          <div className="flex flex-wrap gap-2 mb-6 justify-center">
            <button onClick={() => setUnknownType('random')} className={`px-4 py-2 rounded font-bold transition ${unknownType === 'random' ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-700'}`}>Zufall</button>
            <button onClick={() => setUnknownType('Kn')} className={`px-4 py-2 rounded font-bold transition ${unknownType === 'Kn' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>Gesucht: <InlineMath math="K_n" /></button>
            <button onClick={() => setUnknownType('r')} className={`px-4 py-2 rounded font-bold transition ${unknownType === 'r' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>Gesucht: <InlineMath math="r" /></button>
            <button onClick={() => setUnknownType('n')} className={`px-4 py-2 rounded font-bold transition ${unknownType === 'n' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>Gesucht: <InlineMath math="n" /></button>
          </div>

          {task && (
            <div className="w-full max-w-xl bg-slate-100 border border-slate-200 rounded-lg p-6 mb-4">
              <div className="text-lg mb-4 leading-relaxed">
                {task.question}
              </div>

              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-700 whitespace-nowrap">
                  Deine Antwort:
                </span>
                <input
                  ref={inputRef}
                  type="text"
                  className="flex-1 border-2 border-slate-300 rounded-lg p-2 text-lg focus:outline-blue-400"
                  value={userAnswer}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUserAnswer(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={task.unknown === 'n' ? 'z.B. 10.5' : 'z.B. 1234,56'}
                />
                <span className="text-xl font-bold text-gray-600">
                  {task.unknown === 'n' ? 'Jahre' : '€'}
                </span>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-4 mb-4">
            <button onClick={checkAnswer} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded shadow transition-colors">Überprüfen</button>
            <button onClick={showSolution} className="bg-gray-700 hover:bg-gray-800 text-white font-bold py-2 px-6 rounded shadow transition-colors">Lösung zeigen</button>
            <button onClick={generateNewTask} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded shadow transition-colors">Nächste Aufgabe</button>
          </div>

          {feedback && (
            <div className={`w-full max-w-xl text-center font-semibold rounded p-3 mb-2 ${feedbackType === 'correct' ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-red-100 text-red-800 border border-red-300'}`}>
              {feedback}
            </div>
          )}
          
          {solution && (
            <div className="w-full max-w-xl bg-blue-50 border border-blue-200 rounded p-4 text-blue-900 mb-2 text-base md:text-lg">
              <b>Musterlösung:</b>
              <div className="mt-2 space-y-2">
                {solution}
              </div>
            </div>
          )}

          <div className="flex flex-wrap justify-center gap-8 mt-6 w-full max-w-2xl">
            <div className="flex flex-col items-center"><div className="text-2xl font-bold text-blue-800">{correctCount}</div><div className="text-gray-600 text-sm">Richtig</div></div>
            <div className="flex flex-col items-center"><div className="flex items-center text-2xl font-bold text-orange-500"><span role="img" aria-label="Streak">🔥</span>{streak}</div><div className="text-gray-600 text-sm">Streak</div></div>
            <div className="flex flex-col items-center"><div className="text-2xl font-bold text-blue-800">{totalCount}</div><div className="text-gray-600 text-sm">Gesamt</div></div>
          </div>
        </div>
      </div>
    </div>
  );
}

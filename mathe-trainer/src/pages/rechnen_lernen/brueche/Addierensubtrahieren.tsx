import React, { useEffect, useRef, useState } from 'react';

type Difficulty = 'easy' | 'medium' | 'hard';

interface Fraction { numerator: number; denominator: number }
interface Task { fraction1: Fraction; fraction2: Fraction; operation: '+' | '-' }

function gcd(a: number, b: number): number {
  a = Math.abs(a); b = Math.abs(b);
  return b === 0 ? a : gcd(b, a % b);
}
function lcm(a: number, b: number): number { return (a * b) / gcd(a, b); }
function rand(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function generateFraction(level: Difficulty): Fraction {
  let den: number, num: number;
  switch (level) {
    case 'easy':
      den = rand(2, 5); num = rand(1, den - 1); num *= Math.random() > 0.5 ? 1 : -1; break;
    case 'medium':
      den = rand(2, 10); num = rand(1, 15); num *= Math.random() > 0.5 ? 1 : -1; break;
    case 'hard':
      den = rand(3, 15); num = rand(2, 25); num *= Math.random() > 0.5 ? 1 : -1; break;
    default:
      den = rand(2, 10); num = rand(1, den - 1);
  }
  return { numerator: num, denominator: den };
}

function FractionDisplay({ num, den }: { num: number; den: number }) {
  return (
    <span className="inline-block align-middle text-xl md:text-2xl mx-1">
      <span className="block border-b-2 border-black px-2">{num}</span>
      <span className="block px-2">{den}</span>
    </span>
  );
}

export default function Addierensubtrahieren() {
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [task, setTask] = useState<Task | null>(null);
  const [inputNum, setInputNum] = useState('');
  const [inputDen, setInputDen] = useState('');
  const [feedback, setFeedback] = useState<React.ReactNode | null>(null);
  const [feedbackType, setFeedbackType] = useState<'correct' | 'incorrect' | null>(null);
  const [solution, setSolution] = useState<React.ReactNode | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const numInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { generateNewTask(difficulty); /* eslint-disable-line */ }, [difficulty]);

  function generateNewTask(level: Difficulty) {
    setFeedback(null); setFeedbackType(null); setSolution(null);
    setInputNum(''); setInputDen('');
    const operation: Task['operation'] = Math.random() > 0.5 ? '+' : '-';
    const f1 = generateFraction(level);
    const f2 = generateFraction(level);
    setTask({ fraction1: f1, fraction2: f2, operation });
    setTimeout(() => numInputRef.current?.focus(), 50);
  }

  function computeSimplifiedResult(t: Task) {
    const common = lcm(t.fraction1.denominator, t.fraction2.denominator);
    const m1 = common / t.fraction1.denominator;
    const m2 = common / t.fraction2.denominator;
    const a1 = t.fraction1.numerator * m1;
    const a2 = t.fraction2.numerator * m2;
    const num = t.operation === '+' ? a1 + a2 : a1 - a2;
    const den = common;
    const g = gcd(Math.abs(num), den);
    return { num: num / g, den: den / g, steps: { common, a1, a2, num, den, g } };
  }

  function handleCheck() {
    if (!task) return;
    setSolution(null);
    const num = parseInt(inputNum, 10);
    const den = parseInt(inputDen, 10);
    if (isNaN(num) || isNaN(den) || den === 0) {
      setFeedback('Bitte gib gültige ganze Zahlen ein (Nenner ≠ 0).');
      setFeedbackType('incorrect');
      return;
    }
    setTotalCount(c => c + 1);
    const res = computeSimplifiedResult(task);
    if (num === res.num && den === res.den) {
      setFeedback('Richtig! Super gemacht!');
      setFeedbackType('correct');
      setCorrectCount(c => c + 1);
      setStreak(s => s + 1);
    } else {
      setFeedback(
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <span>Leider falsch. Die richtige Lösung ist:</span>
          <FractionDisplay num={res.num} den={res.den} />
        </div>
      );
      setFeedbackType('incorrect');
      setStreak(0);
    }
  }

  function handleShowSolution() {
    if (!task) return;
    const { num, den, steps } = computeSimplifiedResult(task);
    
    setSolution(
      <div className="flex flex-col items-center gap-2">
        <div className="text-sm text-gray-600">1) Gemeinsamer Nenner: {steps.common}</div>
        <div className="flex items-center flex-wrap justify-center gap-2">
          <span className="text-sm text-gray-600">2) Angepasst:</span>
          <FractionDisplay num={steps.a1} den={steps.common} />
          <span className="text-xl">{task.operation}</span>
          <FractionDisplay num={steps.a2} den={steps.common} />
          <span className="text-xl">=</span>
          <FractionDisplay num={steps.num} den={steps.den} />
        </div>
        <div className="flex items-center justify-center gap-2">
          <span className="text-sm text-gray-600">3) Kürzen mit GGT {steps.g}:</span>
          <FractionDisplay num={num} den={den} />
        </div>
      </div>
    );
    setFeedback(null);
    setFeedbackType(null);
  }

  function handleKeyDown(e: React.KeyboardEvent) { if (e.key === 'Enter') handleCheck(); }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-sky-100">
      <div className="flex-1 flex flex-col items-center justify-center w-full px-2 py-8 sm:px-8">
        <div className="bg-white rounded-2xl shadow-md border border-slate-200 w-full max-w-4xl min-h-[400px] flex flex-col items-center p-6 sm:p-12 md:p-16 lg:p-20 xl:p-24">
          <a href="/rechnen_lernen/brueche" className="text-blue-600 hover:underline mb-4 self-start">&larr; Zurück zur Bruch-Übersicht</a>
          <h1 className="text-3xl md:text-4xl font-bold text-blue-900 mb-2 text-center">Brüche addieren und subtrahieren</h1>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6 w-full max-w-2xl">
            <h3 className="font-semibold text-blue-800 mb-1">Anleitung:</h3>
            <ol className="list-decimal list-inside text-gray-700 text-sm md:text-base">
              <li>Wähle eine Schwierigkeitsstufe.</li>
              <li>Bringe die Brüche ggf. auf gemeinsamen Nenner.</li>
              <li>Rechne und kürze vollständig.</li>
            </ol>
          </div>

          <div className="flex gap-2 mb-6">
            <button onClick={() => setDifficulty('easy')} className={`px-4 py-2 rounded font-bold transition ${difficulty === 'easy' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'}`}>Leicht</button>
            <button onClick={() => setDifficulty('medium')} className={`px-4 py-2 rounded font-bold transition ${difficulty === 'medium' ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-700'}`}>Mittel</button>
            <button onClick={() => setDifficulty('hard')} className={`px-4 py-2 rounded font-bold transition ${difficulty === 'hard' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'}`}>Schwer</button>
          </div>

          {task && (
            <div className="w-full max-w-xl bg-slate-100 border border-slate-200 rounded-lg p-6 mb-4 text-center">
              <div className="font-semibold text-blue-800 mb-2 text-base md:text-lg">Berechne die Lösung:</div>
              <div className="mb-4 text-2xl md:text-3xl flex items-center justify-center gap-4">
                <FractionDisplay num={task.fraction1.numerator} den={task.fraction1.denominator} />
                <span className="text-blue-500 text-2xl">{task.operation}</span>
                <FractionDisplay num={task.fraction2.numerator} den={task.fraction2.denominator} />
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                <div className="flex flex-col items-center">
                  <input
                    ref={numInputRef}
                    type="number"
                    className={`num w-20 text-center border-2 rounded-t-lg py-2 text-lg font-semibold focus:outline-blue-400 ${feedbackType === 'correct' ? 'border-green-400 bg-green-50' : feedbackType === 'incorrect' ? 'border-red-400 bg-red-50' : 'border-slate-300 bg-white'}`}
                    value={inputNum}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputNum(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Zähler"
                  />
                  <div className="fraction-line w-20 border-t-2 border-black" />
                  <input
                    type="number"
                    className={`den w-20 text-center border-2 rounded-b-lg py-2 text-lg font-semibold focus:outline-blue-400 ${feedbackType === 'correct' ? 'border-green-400 bg-green-50' : feedbackType === 'incorrect' ? 'border-red-400 bg-red-50' : 'border-slate-300 bg-white'}`}
                    value={inputDen}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputDen(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Nenner"
                    min={1}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-4 mb-4">
            <button onClick={handleCheck} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded shadow transition-colors">Überprüfen</button>
            <button onClick={handleShowSolution} className="bg-gray-700 hover:bg-gray-800 text-white font-bold py-2 px-6 rounded shadow transition-colors">Lösung zeigen</button>
            <button onClick={() => generateNewTask(difficulty)} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded shadow transition-colors">Nächste Aufgabe</button>
          </div>

          {feedback && (
            <div className={`w-full max-w-xl text-center font-semibold rounded p-3 mb-2 ${feedbackType === 'correct' ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-red-100 text-red-800 border border-red-300'}`}>{feedback}</div>
          )}
          {solution && (
            <div className="w-full max-w-xl bg-blue-50 border border-blue-200 rounded p-4 text-blue-900 mb-2 text-center text-base md:text-lg">
              <b>Musterlösung:</b> <br />{solution}
            </div>
          )}

          <div className="flex flex-wrap justify-center gap-8 mt-6 w-full max-w-2xl">
            <div className="flex flex-col items-center">
              <div className="text-2xl font-bold text-blue-800">{correctCount}</div>
              <div className="text-gray-600 text-sm">Richtig</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center text-2xl font-bold text-orange-500"><span role="img" aria-label="Streak">🔥</span>{streak}</div>
              <div className="text-gray-600 text-sm">Streak</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-2xl font-bold text-blue-800">{totalCount}</div>
              <div className="text-gray-600 text-sm">Gesamt</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

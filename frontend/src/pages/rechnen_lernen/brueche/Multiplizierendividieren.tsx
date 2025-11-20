import React, { useEffect, useRef, useState } from 'react';

type Difficulty = 'easy' | 'medium' | 'hard';
type Op = '*' | ':';
interface Fraction { numerator: number; denominator: number }
interface Task { a: Fraction; b: Fraction; op: Op }

const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b));
const simplify = (n: number, d: number) => { const g = gcd(n, d); return { n: n / g, d: d / g, g }; };
const r = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

function makeFraction(level: Difficulty): Fraction {
  switch (level) {
    case 'easy': return { numerator: r(1, 9), denominator: r(2, 9) };
    case 'medium': return { numerator: r(2, 15), denominator: r(2, 12) };
    case 'hard': return { numerator: r(3, 25), denominator: r(2, 20) };
    default: return { numerator: r(1, 9), denominator: r(2, 9) };
  }
}

function FractionDisplay({ num, den }: { num: number; den: number }) {
  return (
    <span className="inline-block align-middle text-xl md:text-2xl mx-1">
      <span className="block border-b-2 border-black px-2">{num}</span>
      <span className="block px-2">{den}</span>
    </span>
  );
}

export default function Multiplizierendividieren() {
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [task, setTask] = useState<Task | null>(null);
  const [num, setNum] = useState('');
  const [den, setDen] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackType, setFeedbackType] = useState<'correct' | 'incorrect' | null>(null);
  const [solution, setSolution] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const numRef = useRef<HTMLInputElement>(null);

  useEffect(() => { newTask(difficulty); /* eslint-disable-line */ }, [difficulty]);

  function newTask(level: Difficulty) {
    const a = makeFraction(level);
    const b = makeFraction(level);
    const op: Op = Math.random() > 0.5 ? '*' : ':';
    setTask({ a, b, op });
    setNum(''); setDen(''); setFeedback(null); setFeedbackType(null); setSolution(null);
    setTimeout(() => numRef.current?.focus(), 50);
  }

  function compute(t: Task) {
    let n: number, d: number;
    if (t.op === '*') { n = t.a.numerator * t.b.numerator; d = t.a.denominator * t.b.denominator; }
    else { n = t.a.numerator * t.b.denominator; d = t.a.denominator * t.b.numerator; }
    const s = simplify(n, d);
    return { n: s.n, d: s.d, steps: { nRaw: n, dRaw: d, g: s.g } };
  }

  function check() {
    if (!task) return;
    const n = parseInt(num, 10); const d = parseInt(den, 10);
    if (isNaN(n) || isNaN(d) || d === 0) { setFeedback('Bitte gib gültige ganze Zahlen ein (Nenner ≠ 0).'); setFeedbackType('incorrect'); return; }
    setTotalCount(c => c + 1);
    const res = compute(task);
    if (n === res.n && d === res.d) { setFeedback('Richtig!'); setFeedbackType('correct'); setCorrectCount(c => c + 1); setStreak(s => s + 1); }
    else { setFeedback(`Leider falsch. Die richtige Lösung ist ${res.n}/${res.d}.`); setFeedbackType('incorrect'); setStreak(0); }
  }

  function showSolution() {
    if (!task) return;
    const res = compute(task);
    const opTxt = task.op === '*' ? '×' : '÷';
    const html = `${task.a.numerator}/${task.a.denominator} ${opTxt} ${task.b.numerator}/${task.b.denominator} = ${res.steps.nRaw}/${res.steps.dRaw} → kürzen mit GGT ${res.steps.g} → ${res.n}/${res.d}`;
    setSolution(html); setFeedback(null); setFeedbackType(null);
  }

  function onKey(e: React.KeyboardEvent) { if (e.key === 'Enter') check(); }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-sky-100">
      <div className="flex-1 flex flex-col items-center justify-center w-full px-2 py-8 sm:px-8">
        <div className="bg-white rounded-2xl shadow-md border border-slate-200 w-full max-w-4xl min-h-[400px] flex flex-col items-center p-6 sm:p-12 md:p-16 lg:p-20 xl:p-24">
          <a href="/rechnen_lernen/brueche" className="text-blue-600 hover:underline mb-4 self-start">&larr; Zurück zur Bruch-Übersicht</a>
          <h1 className="text-3xl md:text-4xl font-bold text-blue-900 mb-2 text-center">Brüche multiplizieren und dividieren</h1>

          <div className="flex gap-2 mb-6">
            <button onClick={() => setDifficulty('easy')} className={`px-4 py-2 rounded font-bold transition ${difficulty === 'easy' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'}`}>Leicht</button>
            <button onClick={() => setDifficulty('medium')} className={`px-4 py-2 rounded font-bold transition ${difficulty === 'medium' ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-700'}`}>Mittel</button>
            <button onClick={() => setDifficulty('hard')} className={`px-4 py-2 rounded font-bold transition ${difficulty === 'hard' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'}`}>Schwer</button>
          </div>

          {task && (
            <div className="w-full max-w-xl bg-slate-100 border border-slate-200 rounded-lg p-6 mb-4 text-center">
              <div className="font-semibold text-blue-800 mb-2 text-base md:text-lg">Berechne die Lösung:</div>
              <div className="mb-4 text-2xl md:text-3xl flex items-center justify-center gap-4">
                <FractionDisplay num={task.a.numerator} den={task.a.denominator} />
                <span className="text-blue-500 text-2xl">{task.op === '*' ? '×' : '÷'}</span>
                <FractionDisplay num={task.b.numerator} den={task.b.denominator} />
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                <div className="flex flex-col items-center">
                  <input ref={numRef} type="number" className={`num w-20 text-center border-2 rounded-t-lg py-2 text-lg font-semibold focus:outline-blue-400 ${feedbackType === 'correct' ? 'border-green-400 bg-green-50' : feedbackType === 'incorrect' ? 'border-red-400 bg-red-50' : 'border-slate-300 bg-white'}`} value={num} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNum(e.target.value)} onKeyDown={onKey} placeholder="Zähler" />
                  <div className="fraction-line w-20 border-t-2 border-black" />
                  <input type="number" className={`den w-20 text-center border-2 rounded-b-lg py-2 text-lg font-semibold focus:outline-blue-400 ${feedbackType === 'correct' ? 'border-green-400 bg-green-50' : feedbackType === 'incorrect' ? 'border-red-400 bg-red-50' : 'border-slate-300 bg-white'}`} value={den} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDen(e.target.value)} onKeyDown={onKey} placeholder="Nenner" min={1} />
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-4 mb-4">
            <button onClick={check} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded shadow transition-colors">Überprüfen</button>
            <button onClick={showSolution} className="bg-gray-700 hover:bg-gray-800 text-white font-bold py-2 px-6 rounded shadow transition-colors">Lösung zeigen</button>
            <button onClick={() => newTask(difficulty)} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded shadow transition-colors">Nächste Aufgabe</button>
          </div>

          {feedback && (<div className={`w-full max-w-xl text-center font-semibold rounded p-3 mb-2 ${feedbackType === 'correct' ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-red-100 text-red-800 border border-red-300'}`}>{feedback}</div>)}
          {solution && (<div className="w-full max-w-xl bg-blue-50 border border-blue-200 rounded p-4 text-blue-900 mb-2 text-center text-base md:text-lg"><b>Musterlösung:</b> <br />{solution}</div>)}

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

import React, { useState, useRef, useEffect } from 'react';

type Difficulty = 'easy' | 'medium' | 'hard';
type TaskType = 'shorten' | 'expand';

interface Task {
  type: TaskType;
  displayNumerator?: number;
  displayDenominator?: number;
  expectedNumerator: number;
  expectedDenominator: number;
  factor: number;
  baseNumerator?: number;
  baseDenominator?: number;
}

function gcd(a: number, b: number): number {
  a = Math.abs(a); b = Math.abs(b);
  return b === 0 ? a : gcd(b, a % b);
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateFraction(level: Difficulty, ensureSimplified: boolean) {
  let num, den;
  do {
    switch (level) {
      case 'easy':
        num = randomInt(1, 5); den = randomInt(num + 1, 10); break;
      case 'medium':
        num = randomInt(2, 15); den = randomInt(num + 1, 25); break;
      case 'hard':
        num = randomInt(3, 30); den = randomInt(num + 1, 50); break;
      default:
        num = randomInt(1, 10); den = randomInt(num + 1, 20);
    }
  } while (ensureSimplified && gcd(num, den) !== 1);
  return { numerator: num, denominator: den };
}

function createShortenTask(level: Difficulty): Task {
  const base = generateFraction(level, true);
  let factor = 2;
  switch (level) {
    case 'easy': factor = randomInt(2, 5); break;
    case 'medium': factor = randomInt(2, 10); break;
    case 'hard': factor = randomInt(3, 15); break;
    default: factor = randomInt(2, 7);
  }
  return {
    type: 'shorten',
    displayNumerator: base.numerator * factor,
    displayDenominator: base.denominator * factor,
    expectedNumerator: base.numerator,
    expectedDenominator: base.denominator,
    factor
  };
}

function createExpandTask(level: Difficulty): Task {
  const base = generateFraction(level, false);
  let factor = 2;
  switch (level) {
    case 'easy': factor = randomInt(2, 5); break;
    case 'medium': factor = randomInt(2, 10); break;
    case 'hard': factor = randomInt(3, 15); break;
    default: factor = randomInt(2, 7);
  }
  return {
    type: 'expand',
    baseNumerator: base.numerator,
    baseDenominator: base.denominator,
    expectedNumerator: base.numerator * factor,
    expectedDenominator: base.denominator * factor,
    factor
  };
}

function FractionDisplay({ num, den }: { num: number; den: number }) {
  return (
    <span className="inline-block align-middle text-xl md:text-2xl mx-1">
      <span className="block border-b-2 border-black px-2">{num}</span>
      <span className="block px-2">{den}</span>
    </span>
  );
}

export default function Kuerzenerweitern() {
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

  useEffect(() => {
    generateNewTask(difficulty);
    // eslint-disable-next-line
  }, [difficulty]);

  function generateNewTask(level: Difficulty) {
    setFeedback(null);
    setFeedbackType(null);
    setSolution(null);
    setInputNum('');
    setInputDen('');
    setTimeout(() => numInputRef.current?.focus(), 100);
    const type: TaskType = Math.random() > 0.5 ? 'shorten' : 'expand';
    setTask(type === 'shorten' ? createShortenTask(level) : createExpandTask(level));
  }

  function handleCheck() {
    if (!task) return;
    setFeedback(null);
    setFeedbackType(null);
    setSolution(null);
    if (inputNum.trim() === '' || inputDen.trim() === '') {
      setFeedback('Bitte gib Zähler und Nenner ein.');
      setFeedbackType('incorrect');
      return;
    }
    const num = parseInt(inputNum, 10);
    const den = parseInt(inputDen, 10);
    if (isNaN(num) || isNaN(den) || den === 0) {
      setFeedback('Bitte gib gültige ganze Zahlen ein (Nenner ≠ 0).');
      setFeedbackType('incorrect');
      return;
    }
    setTotalCount((c) => c + 1);
    if (task.type === 'shorten') {
      const isCorrect = num === task.expectedNumerator && den === task.expectedDenominator;
      const isSimplified = gcd(num, den) === 1 || num === 0;
      if (isCorrect && isSimplified) {
        setFeedback('Richtig! Gut gekürzt!');
        setFeedbackType('correct');
        setCorrectCount((c) => c + 1);
        setStreak((s) => s + 1);
      } else {
        setStreak(0);
        const expectedRatio = task.expectedNumerator / task.expectedDenominator;
        const inputRatio = num / den;
        if (Math.abs(expectedRatio - inputRatio) < 0.0001 && !isSimplified) {
          setFeedback(
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <span>Fast! Der Bruch</span>
              <FractionDisplay num={num} den={den} />
              <span>ist wertgleich, aber nicht vollständig gekürzt. Die Lösung ist:</span>
              <FractionDisplay num={task.expectedNumerator} den={task.expectedDenominator} />
            </div>
          );
        } else {
          setFeedback(
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <span>Leider falsch. Die richtige Lösung ist:</span>
              <FractionDisplay num={task.expectedNumerator} den={task.expectedDenominator} />
            </div>
          );
        }
        setFeedbackType('incorrect');
      }
    } else {
      // expand
      const isCorrect = num === task.expectedNumerator && den === task.expectedDenominator;
      if (isCorrect) {
        setFeedback('Richtig! Gut erweitert!');
        setFeedbackType('correct');
        setCorrectCount((c) => c + 1);
        setStreak((s) => s + 1);
      } else {
        setFeedback(
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <span>Leider falsch. Die richtige Lösung ist:</span>
            <FractionDisplay num={task.expectedNumerator} den={task.expectedDenominator} />
          </div>
        );
        setFeedbackType('incorrect');
        setStreak(0);
      }
    }
  }

  function handleShowSolution() {
    if (!task) return;
    
    if (task.type === 'shorten') {
      setSolution(
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center flex-wrap justify-center gap-2">
            <span>Der Bruch</span>
            <FractionDisplay num={task.displayNumerator!} den={task.displayDenominator!} />
            <span>wird vollständig gekürzt, indem Zähler und Nenner durch {task.factor} geteilt werden:</span>
          </div>
          <div className="flex items-center flex-wrap justify-center gap-2">
            <span>{task.displayNumerator} ÷ {task.factor} = {task.expectedNumerator}</span>
            <span>,</span>
            <span>{task.displayDenominator} ÷ {task.factor} = {task.expectedDenominator}</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <span>Ergebnis:</span>
            <FractionDisplay num={task.expectedNumerator} den={task.expectedDenominator} />
          </div>
        </div>
      );
    } else {
      setSolution(
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center flex-wrap justify-center gap-2">
            <span>Der Bruch</span>
            <FractionDisplay num={task.baseNumerator!} den={task.baseDenominator!} />
            <span>wird mit {task.factor} erweitert:</span>
          </div>
          <div className="flex items-center flex-wrap justify-center gap-2">
            <span>{task.baseNumerator} × {task.factor} = {task.expectedNumerator}</span>
            <span>,</span>
            <span>{task.baseDenominator} × {task.factor} = {task.expectedDenominator}</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <span>Ergebnis:</span>
            <FractionDisplay num={task.expectedNumerator} den={task.expectedDenominator} />
          </div>
        </div>
      );
    }
    setFeedback(null);
    setFeedbackType(null);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleCheck();
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-sky-100">
      <div className="flex-1 flex flex-col items-center justify-center w-full px-2 py-8 sm:px-8">
        <div className="bg-white rounded-2xl shadow-md border border-slate-200 w-full max-w-4xl min-h-[400px] flex flex-col items-center p-6 sm:p-12 md:p-16 lg:p-20 xl:p-24">
          <a href="/rechnen_lernen/brueche" className="text-blue-600 hover:underline mb-4 self-start">&larr; Zurück zur Bruch-Übersicht</a>
          <h1 className="text-3xl md:text-4xl font-bold text-blue-900 mb-2 text-center">Brüche kürzen und erweitern</h1>
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6 w-full max-w-2xl">
            <h3 className="font-semibold text-blue-800 mb-1">Anleitung:</h3>
            <ol className="list-decimal list-inside text-gray-700 text-sm md:text-base">
              <li>Wähle eine Schwierigkeitsstufe (Leicht, Mittel, Schwer).</li>
              <li>Die Aufgabe (Kürzen oder Erweitern) wird angezeigt.</li>
              <li>Gib die Lösung als Bruch in die Felder ein (Zähler oben, Nenner unten).</li>
              <li>Klicke auf "Überprüfen" oder drücke Enter.</li>
              <li>Bei jeder richtigen Antwort steigt dein <span role="img" aria-label="Streak">🔥</span>-Streak!</li>
            </ol>
          </div>
          <div className="flex gap-2 mb-6">
            <button onClick={() => setDifficulty('easy')} className={`px-4 py-2 rounded font-bold transition ${difficulty === 'easy' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'}`}>Leicht</button>
            <button onClick={() => setDifficulty('medium')} className={`px-4 py-2 rounded font-bold transition ${difficulty === 'medium' ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-700'}`}>Mittel</button>
            <button onClick={() => setDifficulty('hard')} className={`px-4 py-2 rounded font-bold transition ${difficulty === 'hard' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'}`}>Schwer</button>
          </div>
          {task && (
            <div className="w-full max-w-xl bg-slate-100 border border-slate-200 rounded-lg p-6 mb-4 text-center">
              <div className="font-semibold text-blue-800 mb-2 text-base md:text-lg">
                {task.type === 'shorten' ? 'Kürze den Bruch vollständig:' : 'Erweitere den Bruch:'}
              </div>
              <div className="mb-4 text-2xl md:text-3xl flex items-center justify-center gap-4">
                {task.type === 'shorten' ? (
                  <FractionDisplay num={task.displayNumerator!} den={task.displayDenominator!} />
                ) : (
                  <>
                    <FractionDisplay num={task.baseNumerator!} den={task.baseDenominator!} />
                    <span className="text-blue-500 text-2xl">→</span>
                    <span className="text-base md:text-lg">Erweitere mit <b>{task.factor}</b></span>
                  </>
                )}
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
                    min={0}
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
              <b>Lösung:</b> <br />{solution}
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

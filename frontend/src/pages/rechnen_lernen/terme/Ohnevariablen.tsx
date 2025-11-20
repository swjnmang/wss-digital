import React, { useEffect, useRef, useState } from 'react';
import { parseLocalizedNumber } from '../../../utils/numbers';

const GOAL_SCORE = 20;

function randomInt(max: number, min = 1) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function formatSign(val: number) {
  return val >= 0 ? `+ ${val}` : `- ${Math.abs(val)}`;
}
function formatNumber(val: number) {
  return Math.round(val * 100) / 100;
}

type Difficulty = 'easy' | 'medium' | 'hard';

export default function Ohnevariablen() {
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [score, setScore] = useState(0);
  const [totalFirstTries, setTotalFirstTries] = useState(0);
  const [correctFirstTries, setCorrectFirstTries] = useState(0);
  const [isFirstTry, setIsFirstTry] = useState(true);
  const [term, setTerm] = useState('');
  const [solution, setSolution] = useState<number>(0);
  const [solutionSteps, setSolutionSteps] = useState('');
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState('');
  const [feedbackClass, setFeedbackClass] = useState('');
  const [showSolution, setShowSolution] = useState(false);
  const [win, setWin] = useState(false);
  const solutionInputRef = useRef<HTMLInputElement>(null);

  // MathJax rendering
  useEffect(() => {
    if ((window as any).MathJax && (window as any).MathJax.typeset) {
      (window as any).MathJax.typeset();
    }
  }, [term, showSolution, solutionSteps]);

  useEffect(() => {
    generateNewTask(difficulty);
    // eslint-disable-next-line
  }, [difficulty]);

  function updateScore(points: number) {
    setScore((s) => Math.max(0, s + points));
  }

  function handleDifficulty(level: Difficulty) {
    setDifficulty(level);
    setScore(0);
    setTotalFirstTries(0);
    setCorrectFirstTries(0);
    setWin(false);
    setShowSolution(false);
    setFeedback('');
    setFeedbackClass('');
    setInput('');
    setIsFirstTry(true);
    generateNewTask(level);
  }

  function generateNewTask(level: Difficulty) {
    setIsFirstTry(true);
    setFeedback('');
    setFeedbackClass('');
    setInput('');
    setShowSolution(false);
    let t = '';
    let sol = 0;
    let steps = '';
    if (level === 'hard') {
      if (Math.random() < 0.5) {
        // a * (b + c) + d/e
        const a = randomInt(10, 2);
        const b = randomInt(10, -10);
        const c = randomInt(10, -10);
        const e = randomInt(5, 2);
        const d = randomInt(10, 1) * e;
        t = `${a} * (${b} ${formatSign(c)}) ${formatSign(d)} / ${e}`;
        sol = a * (b + c) + d / e;
        steps = `Punkt vor Strich & Klammern zuerst!<br/>${t}<br/>= ${a} * (${b + c}) + ${d / e}<br/>= ${a * (b + c)} + ${d / e}<br/>= ${formatNumber(sol)}`;
      } else {
        // Brüche mit MathJax
        const n1 = randomInt(20, 1);
        const d1 = randomInt(10, 2);
        const n2 = randomInt(20, 1);
        const d2 = randomInt(10, 2);
        t = `$$\\frac{${n1}}{${d1}} * ${n2} + \\frac{${d1 * n2}}{${d1}}$$`;
        sol = (n1 / d1) * n2 + (d1 * n2) / d1;
        steps = `${t}<br/>= ${formatNumber(n1 / d1)} * ${n2} + ${formatNumber((d1 * n2) / d1)}<br/>= ${formatNumber((n1 / d1) * n2)} + ${formatNumber((d1 * n2) / d1)}<br/>= ${formatNumber(sol)}`;
      }
    } else if (level === 'medium') {
      // a * (b + c) + d
      const a = randomInt(10, 2);
      const b = randomInt(10, -10);
      const c = randomInt(10, -10);
      const d = randomInt(20, -20);
      t = `${a} * (${b} ${formatSign(c)}) ${formatSign(d)}`;
      sol = a * (b + c) + d;
      steps = `Klammer zuerst!<br/>${t}<br/>= ${a} * (${b + c}) ${formatSign(d)}<br/>= ${a * (b + c)} ${formatSign(d)}<br/>= ${formatNumber(sol)}`;
    } else {
      // easy: Summen
      const n1 = randomInt(20, -20);
      const n2 = randomInt(20, -20);
      const n3 = randomInt(20, -20);
      const n4 = randomInt(20, -20);
      t = `${n1} ${formatSign(n2)} ${formatSign(n3)} ${formatSign(n4)}`;
      sol = n1 + n2 + n3 + n4;
      steps = `${t}<br/>= ${n1 + n2} ${formatSign(n3)} ${formatSign(n4)}<br/>= ${n1 + n2 + n3} ${formatSign(n4)}<br/>= ${formatNumber(sol)}`;
    }
    setTerm(t);
    setSolution(sol);
    setSolutionSteps(steps);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInput(e.target.value);
  }

  function checkSolution() {
    if (input.trim() === '') {
      setFeedback('Bitte gib eine Lösung ein.');
      setFeedbackClass('incorrect');
      return;
    }
  let userSolution = parseLocalizedNumber(input);
    if (isNaN(userSolution)) {
      setFeedback('Bitte gib eine gültige Zahl ein.');
      setFeedbackClass('incorrect');
      return;
    }
    if (isFirstTry) setTotalFirstTries((n) => n + 1);
    if (Math.abs(userSolution - solution) < 0.01) {
      setFeedback('Richtig! Ausgezeichnet!');
      setFeedbackClass('correct');
      setShowSolution(false);
      if (isFirstTry) {
        setCorrectFirstTries((n) => n + 1);
        updateScore(1);
      }
      setTimeout(() => {
        if (score + 1 >= GOAL_SCORE) {
          setWin(true);
        } else {
          generateNewTask(difficulty);
        }
      }, 900);
    } else {
      setFeedback('Leider nicht ganz richtig. Überprüfe deinen Rechenweg!');
      setFeedbackClass('incorrect');
      setShowSolution(false);
      if (isFirstTry) updateScore(-0.5);
    }
    setIsFirstTry(false);
  }

  function handleShowSolution() {
    setShowSolution(true);
    setIsFirstTry(false);
    if (isFirstTry) setTotalFirstTries((n) => n + 1);
  }

  function handleNewGame() {
    setScore(0);
    setTotalFirstTries(0);
    setCorrectFirstTries(0);
    setWin(false);
    setShowSolution(false);
    setFeedback('');
    setFeedbackClass('');
    setInput('');
    setIsFirstTry(true);
    generateNewTask(difficulty);
  }

  // Autofocus input on new task
  useEffect(() => {
    if (solutionInputRef.current) solutionInputRef.current.focus();
  }, [term]);

  const successRate = totalFirstTries > 0 ? Math.round((correctFirstTries / totalFirstTries) * 100) : 0;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-sky-100">
      <div className={`bg-white rounded-2xl shadow-md border border-slate-200 p-8 max-w-2xl w-full mt-12 ${feedbackClass === 'correct' ? 'ring-2 ring-green-400' : ''}`}> 
        <h2 className="text-2xl font-bold text-blue-900 mb-2">Terme zusammenfassen</h2>
        <div className="mb-4">
          <div className="flex gap-2 justify-center mb-2">
            <button className={`difficulty-button px-4 py-2 rounded-lg border ${difficulty === 'easy' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-blue-900'}`} onClick={() => handleDifficulty('easy')}>Leicht</button>
            <button className={`difficulty-button px-4 py-2 rounded-lg border ${difficulty === 'medium' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-blue-900'}`} onClick={() => handleDifficulty('medium')}>Mittel</button>
            <button className={`difficulty-button px-4 py-2 rounded-lg border ${difficulty === 'hard' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-blue-900'}`} onClick={() => handleDifficulty('hard')}>Schwer</button>
          </div>
        </div>
        <div className="mb-4">
          <div className="w-full bg-gray-200 rounded-full h-3 mb-1">
            <div className="bg-orange-400 h-3 rounded-full transition-all duration-500" style={{ width: `${(score / GOAL_SCORE) * 100}%` }}></div>
          </div>
          <div className="text-sm font-bold text-gray-700">Punkte: {score} / {GOAL_SCORE}</div>
        </div>
        {!win ? (
          <>
            <div className="mb-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="mb-2">Fasse den folgenden Term schriftlich zusammen und berechne das Ergebnis.</p>
              <div className="equation-display text-xl font-mono text-blue-800" dangerouslySetInnerHTML={{ __html: term }} />
            </div>
            <div className="flex items-center justify-center gap-2 mb-2 text-lg font-mono">
              = <input ref={solutionInputRef} type="text" className="equation-input border rounded px-2 py-1 w-24 text-center" value={input} onChange={handleInputChange} onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter') checkSolution(); }} autoFocus />
            </div>
            <div className={`min-h-[24px] font-bold mb-2 ${feedbackClass === 'correct' ? 'text-green-600' : feedbackClass === 'incorrect' ? 'text-red-600' : ''}`}>{feedback}</div>
            <div className="flex gap-3 justify-center mt-2 flex-wrap">
              <button className="generator-button bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-5 rounded-lg shadow transition-colors" onClick={() => generateNewTask(difficulty)}>Neue Aufgabe</button>
              <button className="generator-button bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-5 rounded-lg shadow transition-colors" onClick={checkSolution}>Lösung prüfen</button>
              <button className="generator-button bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-5 rounded-lg shadow transition-colors" onClick={handleShowSolution} disabled={showSolution}>Lösung anzeigen</button>
            </div>
            {showSolution && (
              <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg p-4 mt-4" dangerouslySetInnerHTML={{ __html: solutionSteps }} />
            )}
          </>
        ) : (
          <div className="text-center py-8">
            <h3 className="text-2xl font-bold text-green-700 mb-2">🎉 Geschafft! 🎉</h3>
            <p className="mb-2">Herzlichen Glückwunsch, du hast {GOAL_SCORE} Punkte erreicht!</p>
            <p className="font-bold text-blue-900 mb-4">Du hast {successRate}% der Fragen im ersten Versuch korrekt beantwortet.</p>
            <button className="generator-button bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-5 rounded-lg shadow transition-colors" onClick={handleNewGame}>Neue Runde starten</button>
          </div>
        )}
      </div>
    </div>
  );
}

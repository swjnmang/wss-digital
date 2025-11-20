import React, { useEffect, useRef, useState } from 'react';
import { parseLocalizedNumber } from '../../../utils/numbers';

type Difficulty = 'leicht' | 'schwer';

function rand(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }

export default function WurzelnUebung() {
  const [difficulty, setDifficulty] = useState<Difficulty>('leicht');
  const [equation, setEquation] = useState<string>('');
  const [solution, setSolution] = useState<number>(0);
  const [steps, setSteps] = useState<string>('');
  const [feedback, setFeedback] = useState<string>('');
  const [showSteps, setShowSteps] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { generate(); /* eslint-disable-line */ }, [difficulty]);
  useEffect(() => { if ((window as any).MathJax?.typeset) (window as any).MathJax.typeset(); }, [equation, showSteps, steps]);

  function generate() {
    setFeedback(''); setShowSteps(false);
    let root = 2, base = 2, radicand = 4;
    if (difficulty === 'leicht') {
      root = 2; base = rand(2, 20); radicand = base * base;
      setEquation(`$$\\sqrt{${radicand}}$$`);
      setSolution(base); setSteps(`Weil ${base} \u00d7 ${base} = ${radicand} ist.`);
    } else {
      root = rand(2, 5);
      if (root === 2) base = rand(2, 20); else if (root === 3) base = rand(2, 10); else if (root === 4) base = rand(2, 6); else base = rand(2, 4);
      radicand = Math.pow(base, root);
      setEquation(root === 2 ? `$$\\sqrt{${radicand}}$$` : `$$\\sqrt[${root}]{${radicand}}$$`);
      setSolution(base); setSteps(`Weil ${base}<sup>${root}</sup> = ${radicand} ist.`);
    }
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  function check() {
  const raw = (inputRef.current?.value || '');
  if (raw.trim() === '') { setFeedback('Bitte gib eine Lösung ein.'); return; }
  const n = parseLocalizedNumber(raw);
    if (Math.abs(n - solution) < 0.01) { setFeedback('Richtig! Ausgezeichnet!'); setTimeout(generate, 1200); }
    else { setFeedback('Leider nicht ganz richtig. Überprüfe deinen Rechenweg!'); }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-sky-100">
      <div className="flex-1 flex flex-col items-center justify-center w-full px-2 py-8 sm:px-8">
        <div className="bg-white rounded-2xl shadow-md border border-slate-200 w-full max-w-3xl md:max-w-4xl min-h-[400px] flex flex-col items-center p-6 sm:p-12 md:p-16 lg:p-20 xl:p-24">
          <a href="/rechnen_lernen/wurzeln" className="text-blue-600 hover:underline mb-4 self-start">&larr; Zurück zur Wurzel-Übersicht</a>
          <h1 className="text-3xl md:text-4xl font-bold text-blue-900 mb-2 text-center">Wurzelziehen</h1>
          <div className="flex gap-2 mb-6">
            <button onClick={() => setDifficulty('leicht')} className={`px-4 py-2 rounded font-bold transition ${difficulty === 'leicht' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'}`}>Leicht</button>
            <button onClick={() => setDifficulty('schwer')} className={`px-4 py-2 rounded font-bold transition ${difficulty === 'schwer' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'}`}>Schwer</button>
          </div>
          <div className="w-full max-w-xl bg-slate-100 border border-slate-200 rounded-lg p-6 mb-4 text-center">
            <div id="equation-display" className="equation-display text-2xl md:text-3xl" dangerouslySetInnerHTML={{ __html: equation }} />
            <div className="mt-4">
              <input ref={inputRef} type="number" placeholder="Ergebnis" className="w-40 text-center border-2 rounded py-2 text-lg font-semibold focus:outline-blue-400" onKeyDown={(e: React.KeyboardEvent) => e.key === 'Enter' && check()} />
            </div>
          </div>
          <div className="flex flex-wrap gap-4 mb-4">
            <button onClick={check} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded shadow transition-colors">Lösung prüfen</button>
            <button onClick={() => setShowSteps(true)} disabled={feedback.startsWith('Richtig!')} className="bg-gray-700 hover:bg-gray-800 disabled:opacity-50 text-white font-bold py-2 px-6 rounded shadow transition-colors">Lösung anzeigen</button>
            <button onClick={generate} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded shadow transition-colors">Neue Aufgabe</button>
          </div>
          {feedback && (<div className={`w-full max-w-xl text-center font-semibold rounded p-3 mb-2 ${feedback.startsWith('Richtig') ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-red-100 text-red-800 border border-red-300'}`}>{feedback}</div>)}
          {showSteps && (
            <div id="solution-output" className="w-full max-w-xl bg-blue-50 border border-blue-200 rounded p-4 text-blue-900 mb-2 text-center text-base md:text-lg" dangerouslySetInnerHTML={{ __html: steps }} />
          )}
        </div>
      </div>
    </div>
  );
}

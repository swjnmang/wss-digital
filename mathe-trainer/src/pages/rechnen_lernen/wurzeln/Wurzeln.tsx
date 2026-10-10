import React, { useEffect, useRef, useState } from 'react';
import { parseLocalizedNumber } from '../../../utils/numbers';
import TaskShell from '../../../components/layout/TaskShell'

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
    <TaskShell title="Wurzelrechnung – Übung" width="narrow">
    <div className="flex flex-col">
      <div className="flex flex-col items-center w-full">
        <div className="bk-panel w-full max-w-3xl md:max-w-6xl min-h-[480px] flex flex-col items-center">
          <div className="flex gap-2 mb-6">
            <button onClick={() => setDifficulty('leicht')} className={`bk-seg-btn ${difficulty === 'leicht' ? 'bk-seg-btn-on' : ''}`}>Leicht</button>
            <button onClick={() => setDifficulty('schwer')} className={`bk-seg-btn ${difficulty === 'schwer' ? 'bk-seg-btn-on' : ''}`}>Schwer</button>
          </div>
          <div className="w-full max-w-xl bk-taskbox mb-4 text-center">
            <div id="equation-display" className="equation-display text-2xl md:text-3xl" dangerouslySetInnerHTML={{ __html: equation }} />
            <div className="mt-4">
              <input ref={inputRef} type="number" placeholder="Ergebnis" className="w-40 text-center border-2 rounded py-2 text-lg font-semibold focus:outline-blue-400" onKeyDown={(e: React.KeyboardEvent) => e.key === 'Enter' && check()} />
            </div>
          </div>
          <div className="flex flex-wrap gap-4 mb-4">
            <button onClick={check} className="bk-btn bk-btn-primary">Lösung prüfen</button>
            <button onClick={() => setShowSteps(true)} disabled={feedback.startsWith('Richtig!')} className="bk-btn disabled:opacity-50">Lösung anzeigen</button>
            <button onClick={generate} className="bk-btn">Neue Aufgabe</button>
          </div>
          {feedback && (<div className={`w-full max-w-xl text-center font-semibold rounded p-3 mb-2 ${feedback.startsWith('Richtig') ? 'bk-feedback bk-feedback-ok block' : 'bk-feedback bk-feedback-no block'}`}>{feedback}</div>)}
          {showSteps && (
            <div id="solution-output" className="w-full max-w-xl bg-blue-50 border border-blue-200 rounded p-4 text-blue-900 mb-2 text-center text-base md:text-lg" dangerouslySetInnerHTML={{ __html: steps }} />
          )}
        </div>
      </div>
    </div>
    </TaskShell>
  );
}

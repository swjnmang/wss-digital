import React, { useEffect, useRef, useState } from 'react';
import { parseLocalizedNumber } from '../../../utils/numbers';
import TaskShell from '../../../components/layout/TaskShell'

type Difficulty = 'leicht' | 'mittel' | 'schwer';
type Mode = 'W' | 'p' | 'G'; // Prozentwert, Prozentsatz, Grundwert

function r(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }

export default function ProzentrechnungUebung() {
  const [difficulty, setDifficulty] = useState<Difficulty>('leicht');
  const [mode, setMode] = useState<Mode>('W');
  const [G, setG] = useState(100);
  const [p, setP] = useState(10);
  const [W, setW] = useState(10);
  const [question, setQuestion] = useState('');
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState<string>('');
  const [solution, setSolution] = useState<string>('');
  const inpRef = useRef<HTMLInputElement>(null);

  useEffect(() => { gen(); /* eslint-disable-line */ }, [difficulty]);

  function gen() {
    setFeedback(''); setSolution(''); setInput('');
    // ranges by difficulty
    let gMin = 50, gMax = 500, pMin = 5, pMax = 40;
    if (difficulty === 'mittel') { gMin = 100; gMax = 2000; pMin = 2; pMax = 60; }
    if (difficulty === 'schwer') { gMin = 200; gMax = 10000; pMin = 1; pMax = 80; }
    const newG = r(gMin, gMax) * (Math.random() > 0.5 ? 1 : 10);
    const newP = r(pMin, pMax);
    const newMode: Mode = (['W','p','G'] as Mode[])[r(0,2)];
    let newW = Math.round((newG * newP) / 100);
    setG(newG); setP(newP); setW(newW); setMode(newMode);
    if (newMode === 'W') setQuestion(`Berechne den Prozentwert W zu G = ${newG} und p = ${newP}%`);
    if (newMode === 'p') setQuestion(`Berechne den Prozentsatz p in % zu G = ${newG} und W = ${newW}`);
    if (newMode === 'G') setQuestion(`Berechne den Grundwert G zu W = ${newW} und p = ${newP}%`);
    setTimeout(() => inpRef.current?.focus(), 50);
  }

  function check() {
  const val = parseLocalizedNumber(input);
    if (isNaN(val)) { setFeedback('Bitte gib eine Zahl ein.'); return; }
    let correct = 0; let steps = '';
    if (mode === 'W') { correct = Math.round((G * p) / 100); steps = `W = G · p/100 = ${G} · ${p}/100 = ${correct}`; }
    if (mode === 'p') { correct = Math.round((W / G) * 100); steps = `p = W/G · 100 = ${W}/${G} · 100 = ${((W / G) * 100).toFixed(2)}% ≈ ${correct}%`; }
    if (mode === 'G') { correct = Math.round((W * 100) / p); steps = `G = W · 100/p = ${W} · 100/${p} = ${((W * 100) / p).toFixed(2)} ≈ ${correct}`; }
    if (Math.abs(val - correct) < 0.01) { setFeedback('Richtig!'); setSolution(`Rechnung: ${steps}`); setTimeout(gen, 1000); }
    else { setFeedback(`Leider falsch. Korrekt wäre ${correct}.`); setSolution(`Rechnung: ${steps}`); }
  }

  function onKey(e: React.KeyboardEvent) { if (e.key === 'Enter') check(); }

  return (
    <TaskShell title="Prozentrechnung üben" width="narrow">
    <div className="flex flex-col">
      <div className="flex flex-col items-center w-full">
        <div className="bk-panel w-full max-w-3xl md:max-w-6xl min-h-[480px] flex flex-col items-center">
          <div className="flex gap-2 mb-6">
            <button onClick={() => setDifficulty('leicht')} className={`bk-seg-btn ${difficulty === 'leicht' ? 'bk-seg-btn-on' : ''}`}>Leicht</button>
            <button onClick={() => setDifficulty('mittel')} className={`bk-seg-btn ${difficulty === 'mittel' ? 'bk-seg-btn-on' : ''}`}>Mittel</button>
            <button onClick={() => setDifficulty('schwer')} className={`bk-seg-btn ${difficulty === 'schwer' ? 'bk-seg-btn-on' : ''}`}>Schwer</button>
          </div>
          <div className="w-full max-w-xl bk-taskbox mb-4 text-center">
            <div className="font-semibold text-blue-800 mb-2 text-base md:text-lg">{question}</div>
            <input ref={inpRef} className="w-56 text-center border-2 rounded py-2 text-lg font-semibold focus:outline-blue-400" type="number" value={input} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)} onKeyDown={onKey} placeholder="Deine Lösung" />
          </div>
          <div className="flex flex-wrap gap-4 mb-4">
            <button onClick={check} className="bk-btn bk-btn-primary">Überprüfen</button>
            <button onClick={gen} className="bk-btn">Neue Aufgabe</button>
          </div>
          {feedback && (<div className={`w-full max-w-xl text-center font-semibold rounded p-3 mb-2 ${feedback.startsWith('Richtig') ? 'bk-feedback bk-feedback-ok block' : 'bk-feedback bk-feedback-no block'}`}>{feedback}</div>)}
          {solution && (<div className="w-full max-w-xl bg-blue-50 border border-blue-200 rounded p-4 text-blue-900 mb-2 text-center text-base md:text-lg">{solution}</div>)}
        </div>
      </div>
    </div>
    </TaskShell>
  );
}

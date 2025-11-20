import React, { useEffect, useRef, useState } from 'react';
import { parseLocalizedNumber } from '../../../utils/numbers';

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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-sky-100">
      <div className="flex-1 flex flex-col items-center justify-center w-full px-2 py-8 sm:px-8">
        <div className="bg-white rounded-2xl shadow-md border border-slate-200 w-full max-w-3xl md:max-w-4xl min-h-[400px] flex flex-col items-center p-6 sm:p-12 md:p-16 lg:p-20 xl:p-24">
          <a href="/rechnen_lernen/prozentrechnung" className="text-blue-600 hover:underline mb-4 self-start">&larr; Zurück zur Prozent-Übersicht</a>
          <h1 className="text-3xl md:text-4xl font-bold text-blue-900 mb-2 text-center">Grundlagen der Prozentrechnung</h1>
          <div className="flex gap-2 mb-6">
            <button onClick={() => setDifficulty('leicht')} className={`px-4 py-2 rounded font-bold transition ${difficulty === 'leicht' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'}`}>Leicht</button>
            <button onClick={() => setDifficulty('mittel')} className={`px-4 py-2 rounded font-bold transition ${difficulty === 'mittel' ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-700'}`}>Mittel</button>
            <button onClick={() => setDifficulty('schwer')} className={`px-4 py-2 rounded font-bold transition ${difficulty === 'schwer' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'}`}>Schwer</button>
          </div>
          <div className="w-full max-w-xl bg-slate-100 border border-slate-200 rounded-lg p-6 mb-4 text-center">
            <div className="font-semibold text-blue-800 mb-2 text-base md:text-lg">{question}</div>
            <input ref={inpRef} className="w-56 text-center border-2 rounded py-2 text-lg font-semibold focus:outline-blue-400" type="number" value={input} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)} onKeyDown={onKey} placeholder="Deine Lösung" />
          </div>
          <div className="flex flex-wrap gap-4 mb-4">
            <button onClick={check} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded shadow transition-colors">Überprüfen</button>
            <button onClick={gen} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded shadow transition-colors">Neue Aufgabe</button>
          </div>
          {feedback && (<div className={`w-full max-w-xl text-center font-semibold rounded p-3 mb-2 ${feedback.startsWith('Richtig') ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-red-100 text-red-800 border border-red-300'}`}>{feedback}</div>)}
          {solution && (<div className="w-full max-w-xl bg-blue-50 border border-blue-200 rounded p-4 text-blue-900 mb-2 text-center text-base md:text-lg">{solution}</div>)}
        </div>
      </div>
    </div>
  );
}

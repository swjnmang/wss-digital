import React, { useEffect, useRef, useState } from 'react';

type Difficulty = 'leicht' | 'schwer';

interface Aufgabe {
  base: string | number; // Variable oder Zahl
  innerExp: number;
  outerExp: number;
  resultExp: number; // multipliziert
  isVariable: boolean;
}

function rand(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }

export default function Potenzieren() {
  const [difficulty, setDifficulty] = useState<Difficulty>('leicht');
  const [aufgabe, setAufgabe] = useState<Aufgabe | null>(null);
  const [baseInput, setBaseInput] = useState('');
  const [expInput, setExpInput] = useState('');
  const [answerOne, setAnswerOne] = useState('');
  const [feedback, setFeedback] = useState('');
  const [punkte, setPunkte] = useState(0);
  const [showRules, setShowRules] = useState(false);

  const baseRef = useRef<HTMLInputElement>(null);
  const expRef = useRef<HTMLInputElement>(null);
  const oneRef = useRef<HTMLInputElement>(null);

  useEffect(() => { neueAufgabe(); /* eslint-disable-line react-hooks/exhaustive-deps */ }, [difficulty]);
  useEffect(() => { if ((window as any).MathJax?.typeset) (window as any).MathJax.typeset(); }, [aufgabe, showRules]);

  function displayPowerOfPower(a: string | number, m: number, n: number) {
    let baseDisp: string | number = a;
    if (typeof a === 'number') {
      if (a < 0) baseDisp = `(${a})`; // Klammern um negative Basen
    }
    return `(${baseDisp}<sup>${m}</sup>)<sup>${n}</sup>`;
  }

  function neueAufgabe() {
    setShowRules(false); setFeedback(''); setBaseInput(''); setExpInput(''); setAnswerOne('');
    let base: string | number; let innerExp: number; let outerExp: number; let isVariable = false;
    if (difficulty === 'leicht') {
      base = rand(2, 4);
      innerExp = rand(2, 3);
      outerExp = 2; // fix 2 wie Legacy
    } else { // schwer
      if (Math.random() < 0.5) { // variable Basis
        base = ['x','y','z'][rand(0,2)]; isVariable = true;
      } else {
        base = rand(2, 6);
        if (Math.random() < 0.3) base = -base;
      }
      innerExp = rand(-5,5);
      outerExp = rand(-4,4);
      if (innerExp === 0 && outerExp === 0) { if (Math.random() < 0.5) innerExp = 1; else outerExp = 1; }
    }
    const resultExp = innerExp * outerExp;
    const neu: Aufgabe = { base, innerExp, outerExp, resultExp, isVariable };
    setAufgabe(neu);
    // Fokus setzen
    setTimeout(() => {
      if (resultExp === 0) oneRef.current?.focus(); else baseRef.current?.focus();
    }, 50);
  }

  function pruefen() {
    if (!aufgabe) return;
    let korrekt = false;
    if (aufgabe.resultExp === 0) {
      const val = parseInt(answerOne, 10);
      if (!isNaN(val) && val === 1) korrekt = true;
    } else {
      // Variable / numerische Basis unterscheiden
      if (aufgabe.isVariable) {
        const validVars = ['x','y','z'];
        if (!validVars.includes(baseInput.trim())) { setFeedback('❌ Ungültige Variable (x, y oder z).'); return; }
        const exp = parseInt(expInput, 10);
        if (isNaN(exp)) { setFeedback('❌ Bitte Exponent eingeben.'); return; }
        if (baseInput.trim() === aufgabe.base && exp === aufgabe.resultExp) korrekt = true;
      } else {
        const baseNum = parseInt(baseInput, 10);
        const exp = parseInt(expInput, 10);
        if (isNaN(baseNum) || isNaN(exp)) { setFeedback('❌ Basis und Exponent als Zahl eingeben.'); return; }
        if (baseNum === aufgabe.base && exp === aufgabe.resultExp) korrekt = true;
      }
    }
    if (korrekt) {
      setFeedback('✅ Richtig!'); setPunkte(p => p + (difficulty === 'leicht' ? 1 : 3));
      setTimeout(neueAufgabe, 1000);
    } else {
      setFeedback('❌ Leider nicht korrekt.'); setPunkte(p => Math.max(0, p - 0.5));
    }
  }

  function toggleRules() { setShowRules(s => !s); }
  function key(e: React.KeyboardEvent<HTMLInputElement>) { if (e.key === 'Enter') pruefen(); }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-sky-100">
      <div className="flex-1 flex flex-col items-center justify-center w-full px-2 py-8 sm:px-8">
        <div className="bg-white rounded-2xl shadow-md border border-slate-200 w-full max-w-3xl md:max-w-4xl min-h-[460px] flex flex-col items-center p-6 sm:p-12 md:p-16 lg:p-20 xl:p-24">
          <a href="/rechnen_lernen/potenzen" className="text-blue-600 hover:underline mb-4 self-start">&larr; Zurück zur Potenz-Übersicht</a>
          <h1 className="text-3xl md:text-4xl font-bold text-blue-900 mb-2 text-center">Potenzen potenzieren</h1>
          <div className="flex gap-2 mb-6">
            <button onClick={() => setDifficulty('leicht')} className={`px-4 py-2 rounded font-bold transition ${difficulty === 'leicht' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'}`}>Leicht</button>
            <button onClick={() => setDifficulty('schwer')} className={`px-4 py-2 rounded font-bold transition ${difficulty === 'schwer' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'}`}>Schwer</button>
          </div>
          <div className="flex flex-wrap gap-4 mb-4">
            <button onClick={neueAufgabe} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded shadow transition-colors">Neue Aufgabe</button>
            <button onClick={pruefen} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded shadow transition-colors">Überprüfen</button>
            <button onClick={toggleRules} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded shadow transition-colors">Regeln</button>
          </div>
          <div className="w-full max-w-2xl bg-slate-100 border border-slate-200 rounded-lg p-6 mb-4 text-center min-h-[150px] flex flex-col justify-center">
            {aufgabe && (
              <div className="text-2xl md:text-3xl font-semibold text-blue-800 mb-4" dangerouslySetInnerHTML={{ __html: `${displayPowerOfPower(aufgabe.base, aufgabe.innerExp, aufgabe.outerExp)} =` }} />
            )}
            {aufgabe && aufgabe.resultExp === 0 ? (
              <div className="flex flex-col items-center gap-2">
                <p className="text-sm text-slate-700">Sonderfall: Exponent wird 0 ⇒ Ergebnis ist 1 (für Basis ≠ 0).</p>
                <input ref={oneRef} type="number" value={answerOne} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAnswerOne(e.target.value)} onKeyDown={key} placeholder="1" className="w-24 text-center border-2 rounded py-2 text-lg font-semibold focus:outline-blue-400" />
              </div>
            ) : (
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <label className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Basis</span>
                  <input
                    ref={baseRef}
                    type={aufgabe?.isVariable ? 'text' : 'number'}
                    value={baseInput}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBaseInput(e.target.value)}
                    onKeyDown={key}
                    className="w-28 text-center border-2 rounded py-2 text-lg font-semibold focus:outline-blue-400"
                    placeholder={aufgabe?.isVariable ? 'x' : 'Basis'}
                  />
                </label>
                <span className="text-xl font-semibold">^</span>
                <label className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Exponent</span>
                  <input
                    ref={expRef}
                    type="number"
                    value={expInput}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setExpInput(e.target.value)}
                    onKeyDown={key}
                    className="w-24 text-center border-2 rounded py-2 text-lg font-semibold focus:outline-blue-400"
                    placeholder="n"
                  />
                </label>
              </div>
            )}
          </div>
          {feedback && (
            <div className={`w-full max-w-2xl text-center font-semibold rounded p-3 mb-2 ${feedback.startsWith('✅') ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-red-100 text-red-800 border border-red-300'}`}>{feedback}</div>
          )}
          {showRules && (
            <div className="w-full max-w-2xl bg-yellow-50 border border-yellow-200 text-yellow-900 rounded p-4 text-sm mb-2 text-left whitespace-pre-wrap">
              <h3 className="font-bold mb-2">Regeln</h3>
              <p>(a^m)^n = a^(m × n)</p>
              <p>Beispiel: (3^2)^3 = 3^(2 × 3) = 3^6</p>
              <p className="mt-2">Sonderfall: a^0 = 1 (a ≠ 0)</p>
              <p className="mt-2">Negative & variable Basen sind erlaubt. Exponenten können negativ sein.</p>
            </div>
          )}
          <div className="w-full max-w-2xl text-center text-sm mt-4 text-slate-600">Punkte: {punkte.toFixed(1)}</div>
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useRef, useState } from 'react';

type Difficulty = 'leicht' | 'mittel' | 'schwer';
interface Aufgabe { base: string | number; terms: { op: '*' | ':'; exp: number }[]; resultExp: number; isVariable: boolean; }

function rand(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }

export default function Multiplizierendividieren() {
  const [difficulty, setDifficulty] = useState<Difficulty>('leicht');
  const [aufgabe, setAufgabe] = useState<Aufgabe | null>(null);
  const [baseInput, setBaseInput] = useState('');
  const [expInput, setExpInput] = useState('');
  const [feedback, setFeedback] = useState('');
  const [punkte, setPunkte] = useState(0);
  const [showRules, setShowRules] = useState(false);

  const baseRef = useRef<HTMLInputElement>(null);
  const expRef = useRef<HTMLInputElement>(null);

  useEffect(() => { neueAufgabe(); /* eslint-disable-line react-hooks/exhaustive-deps */ }, [difficulty]);
  useEffect(() => { if ((window as any).MathJax?.typeset) (window as any).MathJax.typeset(); }, [aufgabe, showRules]);

  function displayPower(b: string | number, e: number) {
    let baseDisp: string | number = b;
    if (typeof b === 'number' && b < 0) baseDisp = `(${b})`;
    return `${baseDisp}<sup>${e}</sup>`;
  }

  function neueAufgabe() {
    setFeedback(''); setBaseInput(''); setExpInput(''); setShowRules(false);
    let numTerms = 2; let allowNeg = false; let base: string | number = 2; let isVar = false;
    if (difficulty === 'leicht') { numTerms = 2; base = rand(2,6); }
    else if (difficulty === 'mittel') { numTerms = 3; base = rand(2,6); }
    else if (difficulty === 'schwer') {
      numTerms = rand(3,5); allowNeg = true; if (Math.random() < 0.6) { base = ['x','y','z'][rand(0,2)]; isVar = true; } else { base = rand(2,6); if (Math.random()<0.3) base = -Number(base); }
    }
    const terms: { op: '*' | ':'; exp: number }[] = [];
    let resultExp = 0;
    function genExp() { return allowNeg ? rand(-10,10) : rand(1,10); }
    resultExp = 0; // start value
    // first term (implicitly multiplication base^exp)
    const firstExp = genExp();
    terms.push({ op: '*', exp: firstExp });
    resultExp += firstExp;
    for (let i=1;i<numTerms;i++) {
      const op: '*' | ':' = Math.random()<0.5 ? '*' : ':';
      const e = genExp();
      terms.push({ op, exp: e });
      resultExp = op === '*' ? resultExp + e : resultExp - e;
    }
    const neu: Aufgabe = { base, terms, resultExp, isVariable: isVar };
    setAufgabe(neu);
    setTimeout(()=> baseRef.current?.focus(),50);
  }

  function pruefen() {
    if (!aufgabe) return;
    let correct = false;
    const exp = parseInt(expInput,10);
    if (aufgabe.isVariable) {
      const valid = ['x','y','z'];
      if (!valid.includes(baseInput.trim())) { setFeedback('❌ Ungültige Variable (x,y,z).'); return; }
      if (isNaN(exp)) { setFeedback('❌ Exponent fehlt.'); return; }
      correct = baseInput.trim() === aufgabe.base && exp === aufgabe.resultExp;
    } else {
      const baseNum = parseInt(baseInput,10);
      if (isNaN(baseNum) || isNaN(exp)) { setFeedback('❌ Basis und Exponent eingeben.'); return; }
      correct = baseNum === aufgabe.base && exp === aufgabe.resultExp;
    }
    if (correct) { setFeedback('✅ Richtig!'); setPunkte(p=> p + (difficulty==='leicht'?1: difficulty==='mittel'?2:3)); setTimeout(neueAufgabe,1000); }
    else { setFeedback('❌ Leider nicht korrekt.'); setPunkte(p=> Math.max(0,p-0.5)); }
  }

  function key(e: React.KeyboardEvent<HTMLInputElement>) { if (e.key==='Enter') pruefen(); }
  function toggleRules() { setShowRules(s=>!s); }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-sky-100">
      <div className="flex-1 flex flex-col items-center justify-center w-full px-2 py-8 sm:px-8">
        <div className="bg-white rounded-2xl shadow-md border border-slate-200 w-full max-w-4xl min-h-[480px] flex flex-col items-center p-6 sm:p-12 md:p-16 lg:p-20 xl:p-24">
          <a href="/rechnen_lernen/potenzen" className="text-blue-600 hover:underline mb-4 self-start">&larr; Zurück zur Potenz-Übersicht</a>
          <h1 className="text-3xl md:text-4xl font-bold text-blue-900 mb-2 text-center">Potenzen multiplizieren & dividieren</h1>
          <div className="flex gap-2 mb-6">
            <button onClick={()=> setDifficulty('leicht')} className={`px-4 py-2 rounded font-bold transition ${difficulty==='leicht'?'bg-green-500 text-white':'bg-gray-200 text-gray-700'}`}>Leicht</button>
            <button onClick={()=> setDifficulty('mittel')} className={`px-4 py-2 rounded font-bold transition ${difficulty==='mittel'?'bg-yellow-500 text-white':'bg-gray-200 text-gray-700'}`}>Mittel</button>
            <button onClick={()=> setDifficulty('schwer')} className={`px-4 py-2 rounded font-bold transition ${difficulty==='schwer'?'bg-red-500 text-white':'bg-gray-200 text-gray-700'}`}>Schwer</button>
          </div>
          <div className="flex flex-wrap gap-4 mb-4">
            <button onClick={neueAufgabe} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded shadow transition-colors">Neue Aufgabe</button>
            <button onClick={pruefen} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded shadow transition-colors">Überprüfen</button>
            <button onClick={toggleRules} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded shadow transition-colors">Regeln</button>
          </div>
          <div className="w-full bg-slate-100 border border-slate-200 rounded-lg p-6 mb-4 text-center min-h-[160px] flex flex-col justify-center">
            {aufgabe && (
              <div className="text-xl md:text-2xl font-semibold text-blue-800 mb-4" dangerouslySetInnerHTML={{ __html: `${aufgabe.terms.map((t,i)=> (i===0? displayPower(aufgabe.base, t.exp): `${t.op==='*'?' · ':' : '} ${displayPower(aufgabe.base,t.exp)}`)).join('')} =` }} />
            )}
            {aufgabe && (
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <label className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Basis</span>
                  <input ref={baseRef} type={aufgabe.isVariable?'text':'number'} value={baseInput} onChange={(e:React.ChangeEvent<HTMLInputElement>)=> setBaseInput(e.target.value)} onKeyDown={key} className="w-28 text-center border-2 rounded py-2 text-lg font-semibold focus:outline-blue-400" placeholder={aufgabe.isVariable?'x':'Basis'} />
                </label>
                <span className="text-xl font-semibold">^</span>
                <label className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Exponent</span>
                  <input ref={expRef} type="number" value={expInput} onChange={(e:React.ChangeEvent<HTMLInputElement>)=> setExpInput(e.target.value)} onKeyDown={key} className="w-24 text-center border-2 rounded py-2 text-lg font-semibold focus:outline-blue-400" placeholder="n" />
                </label>
              </div>
            )}
          </div>
          {feedback && (<div className={`w-full max-w-2xl text-center font-semibold rounded p-3 mb-2 ${feedback.startsWith('✅')?'bg-green-100 text-green-800 border border-green-300':'bg-red-100 text-red-800 border border-red-300'}`}>{feedback}</div>)}
          {showRules && (
            <div className="w-full max-w-2xl bg-yellow-50 border border-yellow-200 text-yellow-900 rounded p-4 text-sm mb-2 text-left whitespace-pre-wrap">
              <h3 className="font-bold mb-2">Regeln</h3>
              <p><strong>Multiplikation:</strong> a^m · a^n = a^(m+n)</p>
              <p><strong>Division:</strong> a^m : a^n = a^(m-n)</p>
              <p className="mt-2">Gilt auch für Variablen (x,y,z) und negative Exponenten.</p>
            </div>
          )}
          <div className="w-full max-w-2xl text-center text-sm mt-4 text-slate-600">Punkte: {punkte.toFixed(1)}</div>
        </div>
      </div>
    </div>
  );
}

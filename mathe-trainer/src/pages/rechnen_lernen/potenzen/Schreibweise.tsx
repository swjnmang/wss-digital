import React, { useEffect, useRef, useState } from 'react';

type Difficulty = 'leicht' | 'mittel' | 'schwer';
type Mode = 'produktToPotenz' | 'potenzToProdukt';

function rand(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }

export default function Schreibweise() {
  const [difficulty, setDifficulty] = useState<Difficulty>('leicht');
  const [mode, setMode] = useState<Mode>('produktToPotenz');
  const [basis, setBasis] = useState<string>('');
  const [exponent, setExponent] = useState<number>(2);
  const [aufgabeHTML, setAufgabeHTML] = useState<string>('');
  const [falsche, setFalsche] = useState(0);
  const [feedback, setFeedback] = useState<string>('');
  const [hint, setHint] = useState<string>('');
  const basisRef = useRef<HTMLInputElement>(null);
  const produktRef = useRef<HTMLInputElement>(null);

  const [inBasis, setInBasis] = useState('');
  const [inExp, setInExp] = useState('');
  const [inProdukt, setInProdukt] = useState('');

  useEffect(() => { neueAufgabe(); /* eslint-disable-line */ }, [difficulty]);

  function neueAufgabe() {
    setFeedback(''); setHint(''); setFalsche(0);
    const m: Mode = Math.random() < 0.5 ? 'produktToPotenz' : 'potenzToProdukt';
    setMode(m);

    let maxBasisZahl = 10, maxExponentZahl = 3, useVar = 0;
    if (difficulty === 'mittel') { maxBasisZahl = 15; maxExponentZahl = 5; useVar = 0.6; }
    if (difficulty === 'schwer') { maxBasisZahl = 20; maxExponentZahl = 6; useVar = 0.8; }

    const useVariable = Math.random() < useVar;
    let b: string, e: number;
    if (useVariable) {
      b = String.fromCharCode(rand(97, 122));
      e = rand(2, maxExponentZahl);
    } else {
      b = String(rand(2, maxBasisZahl));
      e = rand(2, Math.min(maxExponentZahl, 4));
    }
    setBasis(b); setExponent(e);

    if (m === 'produktToPotenz') {
      const prod = Array.from({ length: e }, () => b).join(' * ');
      setAufgabeHTML(`Wandle folgendes Produkt in eine Potenz um: ${prod}`);
      setInBasis(''); setInExp('');
      setTimeout(() => basisRef.current?.focus(), 50);
    } else {
      setAufgabeHTML(`Wandle folgende Potenz in ein Produkt um: ${b}<sup>${e}</sup>`);
      setInProdukt('');
      setTimeout(() => produktRef.current?.focus(), 50);
    }
  }

  function pruefen() {
    setFeedback(''); setHint('');
    if (mode === 'produktToPotenz') {
      const ok = inBasis.trim() === basis && inExp.trim() === String(exponent);
      if (ok) {
        setFeedback('✅ Richtig!');
      } else {
        // genaueres Feedback
        if (inBasis.trim() !== basis && inExp.trim() !== String(exponent)) setFeedback(`❌ Basis und Exponent sind falsch. Richtig wäre ${basis}^${exponent}.`);
        else if (inBasis.trim() !== basis) setFeedback(`❌ Die Basis ist falsch. Richtig wäre ${basis}.`);
        else setFeedback(`❌ Der Exponent ist falsch. Richtig wäre ${exponent}.`);
        setFalsche(x => x + 1);
      }
    } else {
      const produkt = Array.from({ length: exponent }, () => basis).join(' * ');
      const cleanStu = inProdukt.replace(/\s/g, '');
      const cleanCor = produkt.replace(/\s/g, '');
      let ok = cleanStu === cleanCor;
      if (!ok) {
        const onlyBases = new RegExp(`^${basis.repeat(exponent)}$`);
        ok = onlyBases.test(cleanStu);
      }
      if (ok) setFeedback('✅ Richtig!');
      else { setFeedback(`❌ Falsch. Die richtige Antwort wäre ${produkt}.`); setFalsche(x => x + 1); }
    }
  }

  useEffect(() => {
    if (falsche >= 2) {
      if (mode === 'produktToPotenz') setHint(`Hinweis: Zähle, wie oft die Basis (${basis}) multipliziert wird. Das ist dein Exponent.`);
      else setHint(`Hinweis: Die Basis (${basis}) wird ${exponent} Mal mit sich selbst multipliziert. Schreibe sie entsprechend oft mit *.`);
    } else setHint('');
  }, [falsche, mode, basis, exponent]);

  function keyDown(e: React.KeyboardEvent) { if (e.key === 'Enter') pruefen(); }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-sky-100">
      <div className="flex-1 flex flex-col items-center justify-center w-full px-2 py-8 sm:px-8">
        <div className="bg-white rounded-2xl shadow-md border border-slate-200 w-full max-w-3xl md:max-w-4xl min-h-[400px] flex flex-col items-center p-6 sm:p-12 md:p-16 lg:p-20 xl:p-24">
          <a href="/rechnen_lernen/potenzen" className="text-blue-600 hover:underline mb-4 self-start">&larr; Zurück zur Potenz-Übersicht</a>
          <h1 className="text-3xl md:text-4xl font-bold text-blue-900 mb-2 text-center">Potenzschreibweise</h1>

          <div className="flex gap-2 mb-6">
            <button onClick={() => setDifficulty('leicht')} className={`px-4 py-2 rounded font-bold transition ${difficulty === 'leicht' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'}`}>Leicht</button>
            <button onClick={() => setDifficulty('mittel')} className={`px-4 py-2 rounded font-bold transition ${difficulty === 'mittel' ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-700'}`}>Mittel</button>
            <button onClick={() => setDifficulty('schwer')} className={`px-4 py-2 rounded font-bold transition ${difficulty === 'schwer' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'}`}>Schwer</button>
          </div>

          <div className="w-full max-w-2xl bg-slate-100 border border-slate-200 rounded-lg p-6 mb-4 text-center">
            <div className="text-base md:text-lg font-semibold text-blue-800 mb-2" dangerouslySetInnerHTML={{ __html: aufgabeHTML }} />
            {mode === 'produktToPotenz' ? (
              <div className="flex items-end justify-center gap-2">
                <div className="relative inline-flex items-end pr-10">
                  <input ref={basisRef} type="text" value={inBasis} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInBasis(e.target.value)} onKeyDown={keyDown} className="basis-input w-16 text-center border-2 rounded py-2 text-lg font-semibold focus:outline-blue-400" placeholder="Basis" />
                  <input type="text" value={inExp} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInExp(e.target.value)} onKeyDown={keyDown} className="exponent-input absolute right-0 top-0 w-12 text-center border-2 rounded text-sm py-1 font-semibold focus:outline-blue-400" placeholder="Exp" />
                </div>
              </div>
            ) : (
              <div className="text-center">
                <input ref={produktRef} type="text" value={inProdukt} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInProdukt(e.target.value)} onKeyDown={keyDown} className="single-input w-64 max-w-xs text-center border-2 rounded py-2 text-lg font-semibold focus:outline-blue-400" placeholder="z.B. a * a * a" />
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-4 mb-4">
            <button onClick={pruefen} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded shadow transition-colors">Überprüfen</button>
            <button onClick={neueAufgabe} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded shadow transition-colors">Nächste Aufgabe</button>
          </div>

          {feedback && (<div className={`w-full max-w-2xl text-center font-semibold rounded p-3 mb-2 ${feedback.startsWith('✅') ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-red-100 text-red-800 border border-red-300'}`} dangerouslySetInnerHTML={{ __html: feedback }} />)}
          {hint && (<div className="w-full max-w-2xl bg-yellow-50 border border-yellow-200 text-yellow-900 rounded p-3 text-center text-sm">{hint}</div>)}
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useRef, useState } from 'react';
import TaskShell from '../../../components/layout/TaskShell'

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
    <TaskShell title="Potenzschreibweise" width="narrow">
    <div className="flex flex-col">
      <div className="flex flex-col items-center w-full">
        <div className="bk-panel w-full max-w-3xl md:max-w-6xl flex flex-col items-center">

          <div className="flex gap-2 mb-6">
            <button onClick={() => setDifficulty('leicht')} className={`bk-seg-btn ${difficulty === 'leicht' ? 'bk-seg-btn-on' : ''}`}>Leicht</button>
            <button onClick={() => setDifficulty('mittel')} className={`bk-seg-btn ${difficulty === 'mittel' ? 'bk-seg-btn-on' : ''}`}>Mittel</button>
            <button onClick={() => setDifficulty('schwer')} className={`bk-seg-btn ${difficulty === 'schwer' ? 'bk-seg-btn-on' : ''}`}>Schwer</button>
          </div>

          <div className="w-full max-w-2xl bk-taskbox mb-4 text-center">
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
            <button onClick={pruefen} className="bk-btn bk-btn-primary">Überprüfen</button>
            <button onClick={neueAufgabe} className="bk-btn">Nächste Aufgabe</button>
          </div>

          {feedback && (<div className={`w-full max-w-2xl text-center font-semibold rounded p-3 mb-2 ${feedback.startsWith('✅') ? 'bk-feedback bk-feedback-ok block' : 'bk-feedback bk-feedback-no block'}`} dangerouslySetInnerHTML={{ __html: feedback }} />)}
          {hint && (<div className="w-full max-w-2xl bk-feedback bk-feedback-info block rounded p-3 text-center text-sm">{hint}</div>)}
        </div>
      </div>
    </div>
    </TaskShell>
  );
}

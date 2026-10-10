import React, { useEffect, useRef, useState } from 'react';
import TaskShell from '../../../components/layout/TaskShell'
import { fieldCheckClass } from '../../../utils/fieldCheck';

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
  const [fieldOk, setFieldOk] = useState<{ base?: boolean; exp?: boolean; one?: boolean }>({});
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
    setShowRules(false); setFeedback(''); setFieldOk({}); setBaseInput(''); setExpInput(''); setAnswerOne('');
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
      const val = parseInt(answerOne.replace(/[−–—‐]/g, '-'), 10);
      if (!isNaN(val) && val === 1) korrekt = true;
    } else {
      // Variable / numerische Basis unterscheiden
      if (aufgabe.isVariable) {
        const validVars = ['x','y','z'];
        if (!validVars.includes(baseInput.trim())) { setFeedback('❌ Ungültige Variable (x, y oder z).'); return; }
        const exp = parseInt(expInput.replace(/[−–—‐]/g, '-'), 10);
        if (isNaN(exp)) { setFeedback('❌ Bitte Exponent eingeben.'); return; }
        if (baseInput.trim() === aufgabe.base && exp === aufgabe.resultExp) korrekt = true;
      } else {
        const baseNum = parseInt(baseInput.replace(/[−–—‐]/g, '-'), 10);
        const exp = parseInt(expInput.replace(/[−–—‐]/g, '-'), 10);
        if (isNaN(baseNum) || isNaN(exp)) { setFeedback('❌ Basis und Exponent als Zahl eingeben.'); return; }
        if (baseNum === aufgabe.base && exp === aufgabe.resultExp) korrekt = true;
      }
    }
    if (aufgabe.resultExp === 0) {
      setFieldOk({ one: korrekt });
    } else {
      const baseOk = aufgabe.isVariable
        ? baseInput.trim() === aufgabe.base
        : parseInt(baseInput.replace(/[−–—‐]/g, '-'), 10) === aufgabe.base;
      setFieldOk({ base: baseOk, exp: parseInt(expInput.replace(/[−–—‐]/g, '-'), 10) === aufgabe.resultExp });
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
    <TaskShell title="Potenzen potenzieren" width="narrow">
    <div className="flex flex-col">
      <div className="flex flex-col items-center w-full">
        <div className="bk-panel w-full max-w-3xl md:max-w-6xl min-h-[460px] flex flex-col items-center">
          <div className="flex gap-2 mb-6">
            <button onClick={() => setDifficulty('leicht')} className={`bk-seg-btn ${difficulty === 'leicht' ? 'bk-seg-btn-on' : ''}`}>Leicht</button>
            <button onClick={() => setDifficulty('schwer')} className={`bk-seg-btn ${difficulty === 'schwer' ? 'bk-seg-btn-on' : ''}`}>Schwer</button>
          </div>
          <div className="flex flex-wrap gap-4 mb-4">
            <button onClick={neueAufgabe} className="bk-btn">Neue Aufgabe</button>
            <button onClick={pruefen} className="bk-btn bk-btn-primary">Überprüfen</button>
            <button onClick={toggleRules} className="bk-btn">Regeln</button>
          </div>
          <div className="w-full max-w-2xl bk-taskbox mb-4 text-center min-h-[150px] flex flex-col justify-center">
            {aufgabe && (
              <div className="text-2xl md:text-3xl font-semibold text-blue-800 mb-4" dangerouslySetInnerHTML={{ __html: `${displayPowerOfPower(aufgabe.base, aufgabe.innerExp, aufgabe.outerExp)} =` }} />
            )}
            {aufgabe && aufgabe.resultExp === 0 ? (
              <div className="flex flex-col items-center gap-2">
                <p className="text-sm text-slate-700">Sonderfall: Exponent wird 0 ⇒ Ergebnis ist 1 (für Basis ≠ 0).</p>
                <input ref={oneRef} type="number" value={answerOne} onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setAnswerOne(e.target.value); setFieldOk(f => ({ ...f, one: undefined })); }} onKeyDown={key} placeholder="1" className={`w-24 text-center border-2 rounded py-2 text-lg font-semibold focus:outline-blue-400 ${fieldCheckClass(fieldOk.one)}`} />
              </div>
            ) : (
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <label className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Basis</span>
                  <input
                    ref={baseRef}
                    type={aufgabe?.isVariable ? 'text' : 'number'}
                    value={baseInput}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setBaseInput(e.target.value); setFieldOk(f => ({ ...f, base: undefined })); }}
                    onKeyDown={key}
                    className={`w-28 text-center border-2 rounded py-2 text-lg font-semibold focus:outline-blue-400 ${fieldCheckClass(fieldOk.base)}`}
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
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setExpInput(e.target.value); setFieldOk(f => ({ ...f, exp: undefined })); }}
                    onKeyDown={key}
                    className={`w-24 text-center border-2 rounded py-2 text-lg font-semibold focus:outline-blue-400 ${fieldCheckClass(fieldOk.exp)}`}
                    placeholder="n"
                  />
                </label>
              </div>
            )}
          </div>
          {feedback && (
            <div className={`w-full max-w-2xl text-center font-semibold rounded p-3 mb-2 ${feedback.startsWith('✅') ? 'bk-feedback bk-feedback-ok block' : 'bk-feedback bk-feedback-no block'}`}>{feedback}</div>
          )}
          {showRules && (
            <div className="w-full max-w-2xl bk-feedback bk-feedback-info block rounded p-4 text-sm mb-2 text-left whitespace-pre-wrap">
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
    </TaskShell>
  );
}

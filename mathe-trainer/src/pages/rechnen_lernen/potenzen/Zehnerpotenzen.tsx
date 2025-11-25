import React, { useEffect, useRef, useState } from 'react';
import { parseLocalizedNumber } from '../../../utils/numbers';

type Schwierigkeit = 'leicht' | 'mittel' | 'schwer';
type ProblemTyp = 'toScientific' | 'fromScientific';

interface Problem {
  typ: ProblemTyp;
  value: number; // Ursprungswert als Zahl
  mantissa: number; // korrekte Mantisse
  exponent: number; // korrekter Exponent
  anzeige: string; // Anzeige im Aufgabenbereich (Standardzahl oder LaTeX)
}

function zufallsInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Parsen deutscher Eingaben (Komma als Dezimal, Tausenderpunkte, evtl Leerzeichen)
// Lokale Legacy-Funktion entfernt, wir nutzen nun parseLocalizedNumber aus utils.

export default function Zehnerpotenzen() {
  const [difficulty, setDifficulty] = useState<Schwierigkeit>('leicht');
  const [problem, setProblem] = useState<Problem | null>(null);
  const [mantissaInput, setMantissaInput] = useState('');
  const [exponentInput, setExponentInput] = useState('');
  const [standardInput, setStandardInput] = useState('');
  const [feedback, setFeedback] = useState('');
  const [showTips, setShowTips] = useState(false);
  const [falschCounter, setFalschCounter] = useState(0);
  const [korrekt, setKorrekt] = useState(0);
  const [gesamt, setGesamt] = useState(0);

  const mantissaRef = useRef<HTMLInputElement>(null);
  const exponentRef = useRef<HTMLInputElement>(null);
  const standardRef = useRef<HTMLInputElement>(null);

  // Bei Schwierigkeitswechsel neue Aufgabe
  useEffect(() => { neueAufgabe(); /* eslint-disable-line react-hooks/exhaustive-deps */ }, [difficulty]);

  // MathJax nach Render versuchen
  useEffect(() => {
    if (problem?.typ === 'fromScientific') {
      setTimeout(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).MathJax?.typesetPromise?.();
      }, 30);
    }
  }, [problem]);

  function neueAufgabe() {
    setFeedback(''); setShowTips(false); setFalschCounter(0);
    setMantissaInput(''); setExponentInput(''); setStandardInput('');

    const typ: ProblemTyp = Math.random() < 0.5 ? 'toScientific' : 'fromScientific';

    // Parameter je Schwierigkeit
    let exponentRange = { min: 3, max: 6 }; // nur für fromScientific
    let sigDigits = { min: 1, max: 1 }; // signif. Stellen für toScientific
    let zeroCount = { min: 3, max: 6 }; // Anzahl Nullen (große/kleine Zahlen)
    let allowNegatives = false;
    if (difficulty === 'mittel') {
      exponentRange = { min: -6, max: 6 };
      sigDigits = { min: 1, max: 2 };
      zeroCount = { min: 3, max: 6 };
    }
    if (difficulty === 'schwer') {
      exponentRange = { min: -10, max: 10 };
      sigDigits = { min: 1, max: 3 };
      zeroCount = { min: 5, max: 10 };
      allowNegatives = true;
    }

    let value: number; let mantissa: number; let exponent: number; let anzeige: string;

    if (typ === 'toScientific') {
      const numSig = zufallsInt(sigDigits.min, sigDigits.max);
      const firstDigit = zufallsInt(1, 9);
      let numberPart = firstDigit.toString();
      for (let i = 1; i < numSig; i++) numberPart += zufallsInt(0, 9);
      const zeros = zufallsInt(zeroCount.min, zeroCount.max);
      let standardString: string; let calcExp: number;
      const generateSmall = difficulty !== 'leicht' && Math.random() < 0.5;
      if (generateSmall) {
        standardString = '0.' + '0'.repeat(zeros) + numberPart;
        calcExp = -(zeros + numSig);
      } else {
        standardString = numberPart + '0'.repeat(zeros);
        calcExp = zeros + (numSig - 1);
      }
      value = parseFloat(standardString);
      if (difficulty === 'schwer' && allowNegatives && Math.random() < 0.3) {
        value = -value;
        standardString = '-' + standardString;
      }
      const sci = value.toExponential().toLowerCase();
      const parts = sci.split('e');
      mantissa = parseFloat(parts[0]);
      exponent = parseInt(parts[1]);
      anzeige = standardString; // Standardzahl zeigen
      setTimeout(() => mantissaRef.current?.focus(), 50);
    } else { // fromScientific
      exponent = zufallsInt(exponentRange.min, exponentRange.max);
      mantissa = parseFloat((Math.random() * 9 + 1).toFixed(sigDigits.max));
      if (difficulty === 'schwer' && allowNegatives && Math.random() < 0.3) mantissa = -mantissa;
      value = mantissa * Math.pow(10, exponent);
      anzeige = `$${mantissa} \\times 10^{${exponent}}$`;
      setTimeout(() => standardRef.current?.focus(), 50);
    }

    setProblem({ typ, value, mantissa, exponent, anzeige });
  }

  function pruefen() {
    if (!problem) return;
    setGesamt(g => g + 1); // immer eine Aufgabe gezählt
    let isCorrect = false;
    const tolerance = 1e-10;
    if (problem.typ === 'toScientific') {
  const m = parseLocalizedNumber(mantissaInput);
      const e = parseInt(exponentInput, 10);
      if (isNaN(m) || isNaN(e)) {
        setFeedback('❌ Bitte Mantisse und Exponent eingeben.');
        setFalschCounter(x => x + 1);
        return;
      }
      const studentValue = m * Math.pow(10, e);
      const standardFormat = problem.value >= 0 ? (m >= 1 && m < 10) : (m <= -1 && m > -10);
      if (Math.abs(studentValue - problem.value) < tolerance && standardFormat) {
        isCorrect = true;
      } else {
        if (Math.abs(studentValue - problem.value) >= tolerance) setFeedback('❌ Der numerische Wert stimmt nicht.');
        else if (!standardFormat) setFeedback('❌ Mantisse muss zwischen 1 und 10 (bzw. -1 und -10) liegen.');
        else setFeedback('❌ Leider nicht korrekt.');
      }
    } else {
  const stu = parseLocalizedNumber(standardInput);
      if (isNaN(stu)) {
        setFeedback('❌ Bitte eine Zahl eingeben.');
        setFalschCounter(x => x + 1);
        return;
      }
      if (Math.abs(stu - problem.value) < tolerance) isCorrect = true; else setFeedback('❌ Leider nicht korrekt.');
    }

    if (isCorrect) {
      setFeedback('✅ Richtig!');
      setKorrekt(k => k + 1);
    } else setFalschCounter(x => x + 1);
  }

  function tipText(): { titel: string; body: string; example: string } {
    if (!problem) return { titel: '', body: '', example: '' };
    if (problem.typ === 'toScientific') {
      const ex = `${problem.mantissa} x 10^${problem.exponent}`;
      return {
        titel: 'Tipps zur Umwandlung Standard → Wissenschaftlich',
        body: `1. Finde die erste Ziffer ungleich Null.\n2. Setze das Komma nach dieser Ziffer.\n3. Zähle die Verschiebung: das ist der Betrag des Exponenten.\n4. Verschiebung nach links ⇒ Exponent positiv; nach rechts ⇒ Exponent negativ.\n5. Mantisse muss zwischen 1 und 10 liegen (oder -1 bis -10 bei negativen Zahlen).`,
        example: `Beispiel: ${problem.value} = ${ex}`
      };
    }
    const ex2 = `${problem.mantissa} x 10^${problem.exponent}`;
    return {
      titel: 'Tipps zur Umwandlung Wissenschaftlich → Standard',
      body: `1. Sieh den Exponenten an.\n2. Positiver Exponent: Komma nach rechts schieben. Füge Nullen an.\n3. Negativer Exponent: Komma nach links schieben. Nullen nach dem Komma ergänzen.`,
      example: `Beispiel: ${ex2} = ${problem.value}`
    };
  }

  useEffect(() => {
    if (falschCounter >= 2 && !showTips) setShowTips(true);
  }, [falschCounter, showTips]);

  function keyDown(e: React.KeyboardEvent<HTMLInputElement>) { if (e.key === 'Enter') pruefen(); }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-sky-100">
      <div className="flex-1 flex flex-col items-center justify-center w-full px-2 py-8 sm:px-8">
        <div className="bg-white rounded-2xl shadow-md border border-slate-200 w-full max-w-3xl md:max-w-4xl min-h-[480px] flex flex-col items-center p-6 sm:p-12 md:p-16 lg:p-20 xl:p-24">
          <a href="/rechnen_lernen/potenzen" className="text-blue-600 hover:underline mb-4 self-start">&larr; Zurück zur Potenz-Übersicht</a>
          <h1 className="text-3xl md:text-4xl font-bold text-blue-900 mb-2 text-center">Zehnerpotenzen Umwandlung</h1>

          {/* Schwierigkeit */}
          <div className="flex gap-2 mb-6">
            <button onClick={() => setDifficulty('leicht')} className={`px-4 py-2 rounded font-bold transition ${difficulty === 'leicht' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'}`}>Leicht</button>
            <button onClick={() => setDifficulty('mittel')} className={`px-4 py-2 rounded font-bold transition ${difficulty === 'mittel' ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-700'}`}>Mittel</button>
            <button onClick={() => setDifficulty('schwer')} className={`px-4 py-2 rounded font-bold transition ${difficulty === 'schwer' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'}`}>Schwer</button>
          </div>

          {/* Neue Aufgabe */}
          <div className="flex flex-wrap gap-4 mb-4">
            <button onClick={neueAufgabe} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded shadow transition-colors">Neue Aufgabe</button>
            <button onClick={pruefen} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded shadow transition-colors">Überprüfen</button>
            <button onClick={() => setShowTips(t => !t)} className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-6 rounded shadow transition-colors">Tipps</button>
          </div>

          {/* Aufgabenanzeige */}
            <div className="w-full max-w-2xl bg-slate-100 border border-slate-200 rounded-lg p-6 mb-4 text-center min-h-[140px] flex flex-col justify-center">
              {problem && (
                <div className="text-base md:text-lg font-semibold text-blue-800 mb-3" dangerouslySetInnerHTML={{ __html: problem.anzeige }} />
              )}
              {problem && problem.typ === 'toScientific' && (
                <>
                  <p className="text-sm text-slate-700 mb-2">Aufgabe: Wandle die gegebene Zahl in wissenschaftliche Schreibweise.</p>
                  <div className="flex items-center justify-center gap-3 flex-wrap">
                    <label className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">Basis</span>
                      <input
                        ref={mantissaRef}
                        type="text"
                        aria-label="Basis (zwischen 1 und 10)"
                        value={mantissaInput}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMantissaInput(e.target.value)}
                        onKeyDown={keyDown}
                        className="w-28 text-center border-2 rounded py-2 text-lg font-semibold focus:outline-blue-400"
                        placeholder="Basis"
                      />
                    </label>
                    <span className="text-xl font-semibold">× 10^</span>
                    <label className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">Exponent</span>
                      <input
                        ref={exponentRef}
                        type="text"
                        aria-label="Exponent"
                        value={exponentInput}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setExponentInput(e.target.value)}
                        onKeyDown={keyDown}
                        className="w-24 text-center border-2 rounded py-2 text-lg font-semibold focus:outline-blue-400"
                        placeholder="n"
                      />
                    </label>
                  </div>
                </>
              )}
              {problem && problem.typ === 'fromScientific' && (
                <>
                  <p className="text-sm text-slate-700 mb-2">Aufgabe: Wandle aus wissenschaftlicher Schreibweise in eine normale Dezimalzahl.</p>
                  <div className="text-center">
                    <input
                      ref={standardRef}
                      type="text"
                      value={standardInput}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStandardInput(e.target.value)}
                      onKeyDown={keyDown}
                      className="w-80 max-w-xs text-center border-2 rounded py-2 text-lg font-semibold focus:outline-blue-400"
                      placeholder="Standardzahl"
                      aria-label="Standardzahl"
                    />
                  </div>
                </>
              )}
              {problem?.typ === 'toScientific' && (
                <p className="mt-3 text-xs text-slate-600">Gib die Form Basis × 10^n an mit 1 ≤ |Basis| &lt; 10.</p>
              )}
            </div>

          {/* Feedback */}
          {feedback && (
            <div className={`w-full max-w-2xl text-center font-semibold rounded p-3 mb-2 ${feedback.startsWith('✅') ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-red-100 text-red-800 border border-red-300'}`}>{feedback}</div>
          )}

          {/* Tipps */}
          {showTips && problem && (
            <div className="w-full max-w-2xl bg-yellow-50 border border-yellow-200 text-yellow-900 rounded p-4 text-sm whitespace-pre-wrap mb-2">
              <h3 className="font-bold mb-1">{tipText().titel}</h3>
              <div className="mb-2">{tipText().body}</div>
              <div className="italic text-yellow-800">{tipText().example}</div>
            </div>
          )}

          {/* Fortschritt */}
          <div className="w-full max-w-2xl text-center text-sm mt-4 text-slate-600">
            Richtig gelöst: {korrekt} von {gesamt} Aufgaben
          </div>
        </div>
      </div>
    </div>
  );
}

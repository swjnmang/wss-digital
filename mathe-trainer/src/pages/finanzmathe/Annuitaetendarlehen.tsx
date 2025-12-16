import React, { useState, useEffect } from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';

interface Task {
  K0: number;
  n: number;
  p: number;
  v: number; // Random intermediate year
  A: number; // Constant annuity
  intro: string;
}

const randomFloat = (min: number, max: number, decimals: number) => {
  const num = Math.random() * (max - min) + min;
  return parseFloat(num.toFixed(decimals));
};

const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomItem = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const round2 = (val: number) => Math.round(val * 100) / 100;
const parseNumberInput = (raw: string) => {
  // Accept thousand separators (dot, space, apostrophe) and comma as decimal
  let s = raw.trim().replace(/\s|'/g, '');
  if (s.includes(',')) {
    s = s.replace(/\./g, '').replace(',', '.');
  } else {
    s = s.replace(/,/g, '');
  }
  return parseFloat(s);
};

const formatCurrency = (val: number) => val.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const formatNumber = (val: number, decimals: number = 2) => val.toLocaleString('de-DE', { maximumFractionDigits: decimals });
const texNum = (val: number, decimals = 2) => val.toFixed(decimals);

export default function Annuitaetendarlehen() {
  const [task, setTask] = useState<Task | null>(null);
  // Removed navigate hook and handleBack function
  
  // Inputs
  const [inputs, setInputs] = useState({
    k0: '', z1: '', t1: '', a1: '',
    k1: '', z2: '', t2: '', a2: '',
    kv: '', zv: '', tv: '', av: ''
  });

  const [feedback, setFeedback] = useState<{[key: string]: 'correct' | 'incorrect' | null}>({});
  const [showSolution, setShowSolution] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [explanationTitle, setExplanationTitle] = useState<string | null>(null);
  const [explanationText, setExplanationText] = useState<string | null>(null);
  const [unlockedV, setUnlockedV] = useState(false);
  const [encouragement, setEncouragement] = useState<string | null>(null);

  useEffect(() => {
    generateNewTask();
  }, []);

  const generateNewTask = () => {
    const K0 = randomInt(50, 150) * 1000;
    const n = randomInt(5, 25);
    const p = round2(randomFloat(1.5, 8.0, 2));
    const v = randomInt(3, n - 1);
    
    const q = 1 + p / 100;
    const A = round2(K0 * (Math.pow(q, n) * (q - 1)) / (Math.pow(q, n) - 1));

    const intros = [
      "Ein Bauherr nimmt ein Annuitätendarlehen auf.",
      "Für eine Anschaffung wird ein Kredit benötigt.",
      "Die Finanzierung erfolgt über ein Annuitätendarlehen.",
      "Ein Darlehen soll in gleichbleibenden Raten zurückgezahlt werden."
    ];

    setTask({
      K0, n, p, v, A,
      intro: getRandomItem(intros)
    });

    setInputs({
      k0: '', z1: '', t1: '', a1: '',
      k1: '', z2: '', t2: '', a2: '',
      kv: '', zv: '', tv: '', av: ''
    });
    setFeedback({});
    setShowSolution(false);
    setUnlockedV(false);
    setEncouragement(null);
  };

  const handleInputChange = (field: string, value: string) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  const checkAnswers = () => {
    if (!task) return;

    const toleranceDefault = 0.01;
    const tolerancePrincipal = 0.05;
    const check = (val: string, expected: number, usePrincipalTol = false): 'correct' | 'incorrect' => {
      const num = parseNumberInput(val);
      if (isNaN(num)) return 'incorrect';
      const tol = usePrincipalTol ? tolerancePrincipal : toleranceDefault;
      return Math.abs(num - expected) <= tol ? 'correct' : 'incorrect';
    };

    const exactRate = round2(task.p) / 100; // q = 1 + p
    const q = 1 + exactRate;
    const A = round2(task.A); // A = K0 * q^n * (q-1) / (q^n - 1)

    // Tilgungsanteil Jahr 1 aus Formelblatt: T1 = K0*(q-1)/(q^n -1)
    const T1 = round2(task.K0 * (q - 1) / (Math.pow(q, task.n) - 1));
    const Z1 = round2(A - T1); // Z1 = K0*(q-1)
    const K1 = round2(task.K0 - T1); // Schuld zu Jahresbeginn 2

    // Jahr 2
    const K_before_2 = round2(task.K0 * Math.pow(q, 1) - A * (Math.pow(q, 1) - 1) / (q - 1));
    const Z2 = round2(K_before_2 * (q - 1));
    const T2 = round2(A - Z2);

    // Jahr v
    const qPowVminus1 = Math.pow(q, task.v - 1);
    const qPowV = Math.pow(q, task.v);
    const K_before_v = round2(task.K0 * qPowVminus1 - A * (qPowV - 1) / (q - 1));
    const Zv = round2(K_before_v * (q - 1));
    const Tv = round2(A - Zv);

    const newFeedback = {
      k0: check(inputs.k0, task.K0, true),
      z1: check(inputs.z1, Z1),
      t1: check(inputs.t1, T1),
      a1: check(inputs.a1, A),
      
      k1: check(inputs.k1, K1, true),
      z2: check(inputs.z2, Z2),
      t2: check(inputs.t2, T2),
      a2: check(inputs.a2, A),
      
      kv: check(inputs.kv, K_before_v, true),
      zv: check(inputs.zv, Zv),
      tv: check(inputs.tv, Tv),
      av: check(inputs.av, A),
    };

    setFeedback(newFeedback);
    const baseFields = ['k0','z1','t1','a1','k1','z2','t2','a2'];
    const baseCorrect = baseFields.every(f => newFeedback[f] === 'correct');
    if (baseCorrect) {
      setUnlockedV(true);
      setEncouragement(`Super gemacht! Trage jetzt mit Hilfe der Merkhilfe-Formeln die Werte für das ${task?.v}. Jahr in die Tabelle ein.`);
    } else {
      setEncouragement(null);
    }
    
    const allCorrect = Object.values(newFeedback).every(s => s === 'correct');
    if (allCorrect && !showSolution) {
      setCorrectCount(c => c + 1);
    }
    setTotalCount(c => c + 1);
  };

  const revealSolution = () => {
    setShowSolution(true);
  };

  const showExplanation = (field: string) => {
    if (!task) return;
    const exactRate = round2(task.p) / 100;
    const q = 1 + exactRate;
    const qPowN = Math.pow(q, task.n);
    const qPowVminus1 = Math.pow(q, task.v - 1);
    const qPowV = Math.pow(q, task.v);
    const qMinus1 = q - 1;
    const A = round2(task.A);
    const T1 = round2(task.K0 * (qMinus1) / (qPowN - 1));
    const Z1 = round2(A - T1);
    const K1 = round2(task.K0 - T1);
    const K_before_2 = round2(task.K0 * Math.pow(q, 1) - A * (Math.pow(q, 1) - 1) / (qMinus1));
    const Z2 = round2(K_before_2 * (qMinus1));
    const T2 = round2(A - Z2);
    const K_before_v = round2(task.K0 * qPowVminus1 - A * (qPowV - 1) / (qMinus1));
    const Zv = round2(K_before_v * (qMinus1));
    const Tv = round2(A - Zv);

    const lines: Record<string, { title: string; text: string }> = {
      k0: { title: 'K₀', text: String.raw`K_0 = ${texNum(task.K0, 2)}\,€` },
      a1: { title: 'A', text: String.raw`A = \dfrac{K_0\,q^{n}\,(q-1)}{q^{n}-1} = \dfrac{${texNum(task.K0, 2)}\,€ \cdot ${texNum(q, 4)}^{${task.n}} \cdot (${texNum(q, 4)}-1)}{${texNum(q, 4)}^{${task.n}}-1} = ${texNum(A, 2)}\,€` },
      t1: { title: 'T₁', text: String.raw`T_1 = \dfrac{K_0\,(q-1)}{q^{n}-1} = \dfrac{${texNum(task.K0, 2)}\,€ \cdot (${texNum(q, 4)}-1)}{${texNum(q, 4)}^{${task.n}}-1} = ${texNum(T1, 2)}\,€` },
      z1: { title: 'Z₁', text: String.raw`Z_1 = A - T_1 = ${texNum(A, 2)}\,€ - ${texNum(T1, 2)}\,€ = ${texNum(Z1, 2)}\,€` },
      k1: { title: 'K₁', text: String.raw`K_1 = K_0 - T_1 = ${texNum(task.K0, 2)}\,€ - ${texNum(T1, 2)}\,€ = ${texNum(K1, 2)}\,€` },
      t2: { title: 'T₂', text: String.raw`T_2 = T_1 \cdot q^{2-1} = ${texNum(T1, 2)}\,€ \cdot ${texNum(q, 4)} = ${texNum(T2, 2)}\,€` },
      z2: { title: 'Z₂', text: String.raw`Z_2 = A - T_2 = ${texNum(A, 2)}\,€ - ${texNum(T2, 2)}\,€ = ${texNum(Z2, 2)}\,€` },
      kv: { title: `K${task.v-1}`, text: String.raw`K_v = K_0\,q^{v-1} - A\,\dfrac{q^{v}-1}{q-1} = ${texNum(task.K0, 2)}\,€ \cdot ${texNum(q, 4)}^{(${task.v}-1)} - ${texNum(A, 2)}\,€ \cdot \dfrac{${texNum(q, 4)}^{${task.v}}-1}{${texNum(q, 4)}-1} = ${texNum(K_before_v, 2)}\,€` },
      tv: { title: `T${task.v}`, text: String.raw`T_v = T_1\,q^{v-1} = ${texNum(T1, 2)}\,€ \cdot ${texNum(q, 4)}^{(${task.v}-1)} = ${texNum(Tv, 2)}\,€` },
      zv: { title: `Z${task.v}`, text: String.raw`Z_v = A - T_v = ${texNum(A, 2)}\,€ - ${texNum(Tv, 2)}\,€ = ${texNum(Zv, 2)}\,€` },
      av: { title: 'A', text: String.raw`A \text{ bleibt konstant}: ${texNum(A, 2)}\,€` },
    };

    const entry = lines[field];
    if (entry) {
      setExplanationTitle(entry.title);
      setExplanationText(entry.text);
    }
  };

  if (!task) return <div>Lade...</div>;

  const getInputClass = (field: string) => {
    const status = feedback[field];
    let base = "w-full p-2 border rounded text-right ";
    if (status === 'correct') return base + "bg-green-100 border-green-500 text-green-900";
    if (status === 'incorrect') return base + "bg-red-100 border-red-500 text-red-900";
    return base + "border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500";
  };

  // Helper to get solution value for display
  const getSol = (field: string) => {
    const exactRate = task.p / 100;
    const q = 1 + exactRate;
    const A = round2(task.A);
    const qPowVminus1 = Math.pow(q, task.v - 1);
    const qPowV = Math.pow(q, task.v);
    
    const T1 = round2(task.K0 * (q - 1) / (Math.pow(q, task.n) - 1));
    const Z1 = round2(A - T1);
    const K1 = round2(task.K0 - T1);
    
    const K_before_2 = round2(task.K0 * Math.pow(q, 1) - A * (Math.pow(q, 1) - 1) / (q - 1));
    const Z2 = round2(K_before_2 * (q - 1));
    const T2 = round2(A - Z2);
    
    const K_before_v = round2(task.K0 * qPowVminus1 - A * (qPowV - 1) / (q - 1));
    const Zv = round2(K_before_v * (q - 1));
    const Tv = round2(A - Zv);

    switch(field) {
      case 'k0': return task.K0;
      case 'z1': return Z1;
      case 't1': return T1;
      case 'a1': return A;
      case 'k1': return K1;
      case 'z2': return Z2;
      case 't2': return T2;
      case 'a2': return A;
      case 'kv': return K_before_v;
      case 'zv': return Zv;
      case 'tv': return Tv;
      case 'av': return A;
      default: return 0;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-sky-100">
      <div className="flex-1 flex flex-col items-center justify-center w-full px-2 py-8 sm:px-8">
        <div className="bg-white rounded-2xl shadow-md border border-slate-200 w-full max-w-5xl flex flex-col items-center p-6 sm:p-8">
          {/* Removed back button as header covers back navigation */}
          <h1 className="text-3xl font-bold text-blue-900 mb-2 text-center">Annuitätendarlehen: Tilgungsplan</h1>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 w-full">
            <p className="mb-2">{task.intro}</p>
            <p className="mb-2">
              Darlehenshöhe: <strong>{formatCurrency(task.K0)} €</strong>, 
              Laufzeit: <strong>{task.n} Jahre</strong>, 
              Zinssatz: <strong>{formatNumber(task.p, 2)} % p.a.</strong>.
            </p>
            <p className="text-sm text-gray-600">
              Fülle die Tabelle für die ersten beiden Jahre und das {task.v}. Jahr aus.
              (Hinweis: Bei einem Annuitätendarlehen ist die Annuität (Rate) konstant.)
            </p>
          </div>

          <div className="overflow-x-auto w-full mb-6">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-700">
                  <th className="p-3 border text-left">Jahr (v)</th>
                  <th className="p-3 border text-right">Schuld (Anfang)</th>
                  <th className="p-3 border text-right">Tilgung</th>
                  <th className="p-3 border text-right">Zinsen</th>
                  <th className="p-3 border text-right">Annuität</th>
                </tr>
              </thead>
              <tbody>
                {/* Year 1 */}
                <tr>
                  <td className="p-3 border font-bold text-center">1</td>
                  <td className="p-2 border">
                    <input 
                      type="text" 
                      value={inputs.k0} 
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('k0', e.target.value)}
                      className={getInputClass('k0')}
                      placeholder="K₀"
                    />
                    {showSolution && (
                      <button type="button" onClick={() => showExplanation('k0')} className="text-xs text-blue-600 text-right mt-1 underline">
                        {formatCurrency(getSol('k0'))}
                      </button>
                    )}
                  </td>
                  <td className="p-2 border">
                    <input 
                      type="text" 
                      value={inputs.t1} 
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('t1', e.target.value)}
                      className={getInputClass('t1')}
                      placeholder="T₁"
                    />
                    {showSolution && (
                      <button type="button" onClick={() => showExplanation('t1')} className="text-xs text-blue-600 text-right mt-1 underline">
                        {formatCurrency(getSol('t1'))}
                      </button>
                    )}
                  </td>
                  <td className="p-2 border">
                    <input 
                      type="text" 
                      value={inputs.z1} 
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('z1', e.target.value)}
                      className={getInputClass('z1')}
                      placeholder="Z₁"
                    />
                    {showSolution && (
                      <button type="button" onClick={() => showExplanation('z1')} className="text-xs text-blue-600 text-right mt-1 underline">
                        {formatCurrency(getSol('z1'))}
                      </button>
                    )}
                  </td>
                  <td className="p-2 border">
                    <input 
                      type="text" 
                      value={inputs.a1} 
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('a1', e.target.value)}
                      className={getInputClass('a1')}
                      placeholder="A"
                    />
                    {showSolution && (
                      <button type="button" onClick={() => showExplanation('a1')} className="text-xs text-blue-600 text-right mt-1 underline">
                        {formatCurrency(getSol('a1'))}
                      </button>
                    )}
                  </td>
                </tr>

                {/* Year 2 */}
                <tr>
                  <td className="p-3 border font-bold text-center">2</td>
                  <td className="p-2 border">
                    <input 
                      type="text" 
                      value={inputs.k1} 
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('k1', e.target.value)}
                      className={getInputClass('k1')}
                      placeholder="K₁"
                    />
                    {showSolution && (
                      <button type="button" onClick={() => showExplanation('k1')} className="text-xs text-blue-600 text-right mt-1 underline">
                        {formatCurrency(getSol('k1'))}
                      </button>
                    )}
                  </td>
                  <td className="p-2 border">
                    <input 
                      type="text" 
                      value={inputs.t2} 
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('t2', e.target.value)}
                      className={getInputClass('t2')}
                      placeholder="T₂"
                    />
                    {showSolution && (
                      <button type="button" onClick={() => showExplanation('t2')} className="text-xs text-blue-600 text-right mt-1 underline">
                        {formatCurrency(getSol('t2'))}
                      </button>
                    )}
                  </td>
                  <td className="p-2 border">
                    <input 
                      type="text" 
                      value={inputs.z2} 
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('z2', e.target.value)}
                      className={getInputClass('z2')}
                      placeholder="Z₂"
                    />
                    {showSolution && (
                      <button type="button" onClick={() => showExplanation('z2')} className="text-xs text-blue-600 text-right mt-1 underline">
                        {formatCurrency(getSol('z2'))}
                      </button>
                    )}
                  </td>
                  <td className="p-2 border">
                    <input 
                      type="text" 
                      value={inputs.a2} 
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('a2', e.target.value)}
                      className={getInputClass('a2')}
                      placeholder="A"
                    />
                    {showSolution && (
                      <button type="button" onClick={() => showExplanation('a2')} className="text-xs text-blue-600 text-right mt-1 underline">
                        {formatCurrency(getSol('a2'))}
                      </button>
                    )}
                  </td>
                </tr>

                {/* Separator / gating */}
                {!unlockedV && !showSolution && (
                  <tr>
                    <td colSpan={5} className="p-3 border bg-gray-50 text-center text-gray-600 text-sm">
                      Das weitere Jahr wird freigeschaltet, sobald Jahr 1 und 2 korrekt sind.
                    </td>
                  </tr>
                )}

                {/* Arbeitsauftrag und Jahr v */}
                {(unlockedV || showSolution) && (
                  <>
                    <tr>
                      <td colSpan={5} className="p-3 border bg-yellow-50 text-center text-yellow-900 text-base font-medium">
                        {`Arbeitsauftrag: Trage nun die Werte für das ${task.v}. Jahr mit Hilfe der Formeln aus der Merkhilfe in die folgende Zeile ein.`}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-3 border font-bold text-center">{task.v}</td>
                      <td className="p-2 border">
                        <input 
                          type="text" 
                          value={inputs.kv} 
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('kv', e.target.value)}
                          className={getInputClass('kv')}
                          placeholder={`K${task.v-1}`}
                          disabled={!unlockedV && !showSolution}
                        />
                        {showSolution && (
                          <button type="button" onClick={() => showExplanation('kv')} className="text-xs text-blue-600 text-right mt-1 underline">
                            {formatCurrency(getSol('kv'))}
                          </button>
                        )}
                      </td>
                      <td className="p-2 border">
                        <input 
                          type="text" 
                          value={inputs.tv} 
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('tv', e.target.value)}
                          className={getInputClass('tv')}
                          placeholder={`T${task.v}`}
                          disabled={!unlockedV && !showSolution}
                        />
                        {showSolution && (
                          <button type="button" onClick={() => showExplanation('tv')} className="text-xs text-blue-600 text-right mt-1 underline">
                            {formatCurrency(getSol('tv'))}
                          </button>
                        )}
                      </td>
                      <td className="p-2 border">
                        <input 
                          type="text" 
                          value={inputs.zv} 
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('zv', e.target.value)}
                          className={getInputClass('zv')}
                          placeholder={`Z${task.v}`}
                          disabled={!unlockedV && !showSolution}
                        />
                        {showSolution && (
                          <button type="button" onClick={() => showExplanation('zv')} className="text-xs text-blue-600 text-right mt-1 underline">
                            {formatCurrency(getSol('zv'))}
                          </button>
                        )}
                      </td>
                      <td className="p-2 border">
                        <input 
                          type="text" 
                          value={inputs.av} 
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('av', e.target.value)}
                          className={getInputClass('av')}
                          placeholder="A"
                          disabled={!unlockedV && !showSolution}
                        />
                        {showSolution && (
                          <button type="button" onClick={() => showExplanation('av')} className="text-xs text-blue-600 text-right mt-1 underline">
                            {formatCurrency(getSol('av'))}
                          </button>
                        )}
                      </td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap gap-4 mb-4">
            <button onClick={checkAnswers} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded shadow transition-colors">Prüfen</button>
            <button onClick={revealSolution} className="bg-gray-700 hover:bg-gray-800 text-white font-bold py-2 px-6 rounded shadow transition-colors">Lösung zeigen</button>
            <button onClick={generateNewTask} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded shadow transition-colors">Neue Aufgabe</button>
            <a href="https://youtu.be/uFL2B_whhXY?si=xaj3C7iqgYn8fucv" target="_blank" rel="noopener noreferrer" className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded shadow transition-colors flex items-center">
              Lernvideo
            </a>
          </div>

          <div className="flex flex-wrap justify-center gap-8 mt-6 w-full max-w-2xl">
            <div className="flex flex-col items-center"><div className="text-2xl font-bold text-blue-800">{correctCount}</div><div className="text-gray-600 text-sm">Richtig</div></div>
            <div className="flex flex-col items-center"><div className="text-2xl font-bold text-blue-800">{totalCount}</div><div className="text-gray-600 text-sm">Gesamt</div></div>
          </div>

          {encouragement && (
            <div className="mt-4 w-full max-w-3xl border border-green-200 bg-green-50 text-green-800 px-4 py-3 rounded">
              {encouragement}
            </div>
          )}

          {explanationText && (
            <div className="mt-6 w-full max-w-3xl border border-slate-200 rounded-lg bg-slate-50 p-4">
              <div className="text-sm font-semibold text-slate-700 mb-1">Rechenweg {explanationTitle}</div>
              <div className="text-sm text-slate-800 flex flex-wrap items-center gap-2">
                <InlineMath math={explanationText} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

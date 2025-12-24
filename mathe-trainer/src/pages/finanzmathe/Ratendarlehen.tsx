import React, { useState, useEffect } from 'react';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';

interface Task {
  K0: number;
  n: number;
  p: number;
  v: number; // Random intermediate year
  T: number; // Constant repayment
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

export default function Ratendarlehen() {
  const [task, setTask] = useState<Task | null>(null);
  
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
    const n = randomInt(9, 30);
    const p = round2(randomFloat(1.0, 10.0, 2));
    const v = randomInt(4, n - 1);
    const T = K0 / n;

    const intros = [
      "Ein Unternehmen nimmt ein Darlehen auf.",
      "Für eine Investition wird ein Kredit benötigt.",
      "Familie Müller finanziert ihr Eigenheim.",
      "Ein Start-up benötigt Startkapital."
    ];

    setTask({
      K0, n, p, v, T,
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

  const validateField = (field: string, value: string) => {
    if (!task) return null;
    
    const toleranceDefault = 0.01;
    const tolerancePrincipal = 0.05;
    const check = (val: string, expected: number, usePrincipalTol = false): 'correct' | 'incorrect' | null => {
      if (!val.trim()) return null; // Don't validate empty fields
      const num = parseNumberInput(val);
      if (isNaN(num)) return 'incorrect';
      const tol = usePrincipalTol ? tolerancePrincipal : toleranceDefault;
      return Math.abs(num - expected) <= tol ? 'correct' : 'incorrect';
    };

    const exactRate = task.p / 100;
    const q = 1 + exactRate;
    const T = task.T;
    const Z1 = round2(task.K0 * exactRate);
    const T1 = T;
    const A1 = round2(Z1 + T1);
    const K1 = round2(task.K0 - T1);
    const K_before_2 = K1;
    const Z2 = round2(K_before_2 * exactRate);
    const T2 = T;
    const A2 = round2(Z2 + T2);
    const K_before_v = round2(task.K0 - T * (task.v - 1));
    const Zv = round2(K_before_v * exactRate);
    const Tv = T;
    const Av = round2(Zv + Tv);

    switch (field) {
      case 'k0': return check(value, task.K0, true);
      case 'z1': return check(value, Z1);
      case 't1': return check(value, T1);
      case 'a1': return check(value, A1);
      case 'k1': return check(value, K1, true);
      case 'z2': return check(value, Z2);
      case 't2': return check(value, T2);
      case 'a2': return check(value, A2);
      case 'kv': return check(value, K_before_v, true);
      case 'zv': return check(value, Zv);
      case 'tv': return check(value, Tv);
      case 'av': return check(value, Av);
      default: return null;
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setInputs(prev => ({ ...prev, [field]: value }));
    const validationResult = validateField(field, value);
    setFeedback(prev => ({ ...prev, [field]: validationResult }));
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
    const T = round2(task.K0 / task.n); // T = K0 / n (konstant)

    // Jahr 1 (v = 1)
    const Z1 = round2(T * (q - 1) * task.n); // Z1 = T*(q-1)*(n-1+1)
    const A1 = round2(T + Z1);            // A1 = T + Z1
    const K1 = round2(T * (task.n - 1));  // K1 = T*(n-1) (Schuld zu Jahresbeginn Jahr 2)

    // Jahr 2 (v = 2)
    const Z2 = round2(T * (q - 1) * (task.n - 1));
    const A2 = round2(T + Z2);

    // Jahr v (Schuld zu Jahresbeginn v = K_{v-1} = T*(n-v+1))
    const Kv_start = round2(T * (task.n - task.v + 1));
    const Zv = round2(T * (q - 1) * (task.n - task.v + 1));
    const Av = round2(T + Zv);

    const newFeedback = {
      k0: check(inputs.k0, task.K0, true),
      z1: check(inputs.z1, Z1),
      t1: check(inputs.t1, T),
      a1: check(inputs.a1, A1),
      
      k1: check(inputs.k1, K1, true),
      z2: check(inputs.z2, Z2),
      t2: check(inputs.t2, T),
      a2: check(inputs.a2, A2),
      
      kv: check(inputs.kv, Kv_start, true),
      zv: check(inputs.zv, Zv),
      tv: check(inputs.tv, T),
      av: check(inputs.av, Av),
    };

    setFeedback(newFeedback);
    const baseFields = ['k0','z1','t1','a1','k1','z2','t2','a2'];
    const baseCorrect = baseFields.every(f => newFeedback[f] === 'correct');
    if (baseCorrect) {
      setUnlockedV(true);
      setEncouragement(`Stark! Trage jetzt mit Hilfe der Merkhilfe-Formeln die Werte für das ${task?.v}. Jahr in die Tabelle ein.`);
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
    const T = round2(task.K0 / task.n);
    const Z1 = round2(T * (q - 1) * task.n);
    const A1 = round2(T + Z1);
    const K1 = round2(T * (task.n - 1));
    const Z2 = round2(T * (q - 1) * (task.n - 1));
    const A2 = round2(T + Z2);
    const Kv_start = round2(T * (task.n - task.v + 1));
    const Zv = round2(T * (q - 1) * (task.n - task.v + 1));
    const Av = round2(T + Zv);

    const lines: Record<string, { title: string; text: string }> = {
      k0: { title: 'K₀', text: String.raw`K_0 = T \cdot n = ${texNum(T, 2)}\,€ \cdot ${task.n} = ${texNum(task.K0, 2)}\,€` },
      t1: { title: 'T', text: String.raw`T = \dfrac{K_0}{n} = \dfrac{${texNum(task.K0, 2)}\,€}{${task.n}} = ${texNum(T, 2)}\,€` },
      z1: { title: 'Z₁', text: String.raw`Z_1 = T\,(q-1)\,n = ${texNum(T, 2)}\,€ \cdot (${texNum(q, 4)}-1) \cdot ${task.n} = ${texNum(Z1, 2)}\,€` },
      a1: { title: 'A₁', text: String.raw`A_1 = T + Z_1 = ${texNum(T, 2)}\,€ + ${texNum(Z1, 2)}\,€ = ${texNum(A1, 2)}\,€` },
      k1: { title: 'K₁', text: String.raw`K_1 = T\,(n-1) = ${texNum(T, 2)}\,€ \cdot (${task.n}-1) = ${texNum(K1, 2)}\,€` },
      z2: { title: 'Z₂', text: String.raw`Z_2 = T\,(q-1)\,(n-1) = ${texNum(T, 2)}\,€ \cdot (${texNum(q, 4)}-1) \cdot (${task.n}-1) = ${texNum(Z2, 2)}\,€` },
      t2: { title: 'T', text: String.raw`T = ${texNum(T, 2)}\,€ \text{ (konstant)}` },
      a2: { title: 'A₂', text: String.raw`A_2 = T + Z_2 = ${texNum(T, 2)}\,€ + ${texNum(Z2, 2)}\,€ = ${texNum(A2, 2)}\,€` },
      kv: { title: `K${task.v-1}`, text: String.raw`K_{v-1} = T\,(n-v+1) = ${texNum(T, 2)}\,€ \cdot (${task.n}-${task.v}+1) = ${texNum(Kv_start, 2)}\,€` },
      zv: { title: `Z${task.v}`, text: String.raw`Z_v = T\,(q-1)\,(n-v+1) = ${texNum(T, 2)}\,€ \cdot (${texNum(q, 4)}-1) \cdot (${task.n}-${task.v}+1) = ${texNum(Zv, 2)}\,€` },
      tv: { title: 'T', text: String.raw`T = ${texNum(T, 2)}\,€ \text{ (konstant)}` },
      av: { title: `A${task.v}`, text: String.raw`A_v = T + Z_v = ${texNum(T, 2)}\,€ + ${texNum(Zv, 2)}\,€ = ${texNum(Av, 2)}\,€` },
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
    const T = round2(task.K0 / task.n);
    const Z1 = round2(T * (q - 1) * task.n);
    const A1 = round2(T + Z1);
    const K1 = round2(T * (task.n - 1));
    const Z2 = round2(T * (q - 1) * (task.n - 1));
    const A2 = round2(T + Z2);
    const Kv_start = round2(T * (task.n - task.v + 1));
    const Zv = round2(T * (q - 1) * (task.n - task.v + 1));
    const Av = round2(T + Zv);

    switch(field) {
      case 'k0': return task.K0;
      case 'z1': return Z1;
      case 't1': return T;
      case 'a1': return A1;
      case 'k1': return K1;
      case 'z2': return Z2;
      case 't2': return T;
      case 'a2': return A2;
      case 'kv': return Kv_start;
      case 'zv': return Zv;
      case 'tv': return T;
      case 'av': return Av;
      default: return 0;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-sky-100">
      <div className="flex-1 flex flex-col items-center justify-center w-full px-2 py-8 sm:px-8">
        <div className="bg-white rounded-2xl shadow-md border border-slate-200 w-full max-w-5xl flex flex-col items-center p-6 sm:p-8">
          {/* Back button removed */}
          <h1 className="text-3xl font-bold text-blue-900 mb-2 text-center">Ratendarlehen: Tilgungsplan</h1>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 w-full">
            <p className="mb-2">{task.intro}</p>
            <p className="mb-2">
              Darlehenshöhe: <strong>{formatCurrency(task.K0)} €</strong>, 
              Laufzeit: <strong>{task.n} Jahre</strong>, 
              Zinssatz: <strong>{formatNumber(task.p, 2)} % p.a.</strong>.
            </p>
            <p className="text-sm text-gray-600">
              Fülle die Tabelle für die ersten beiden Jahre und das {task.v}. Jahr aus.
              (Hinweis: Bei einem Ratendarlehen ist die Tilgung konstant.)
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
                      placeholder="T"
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
                      placeholder="A₁"
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
                      placeholder="T"
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
                      placeholder="A₂"
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
                          placeholder="T"
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
                          placeholder={`A${task.v}`}
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
            <a href="https://youtu.be/w_UjVYwD_Xo?si=yh1nyuwz-teRXxqH" target="_blank" rel="noopener noreferrer" className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded shadow transition-colors flex items-center">
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


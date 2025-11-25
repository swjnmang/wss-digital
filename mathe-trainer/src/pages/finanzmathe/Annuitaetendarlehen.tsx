import React, { useState, useEffect } from 'react';

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

const formatCurrency = (val: number) => val.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const formatNumber = (val: number, decimals: number = 2) => val.toLocaleString('de-DE', { maximumFractionDigits: decimals });

export default function Annuitaetendarlehen() {
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

  useEffect(() => {
    generateNewTask();
  }, []);

  const generateNewTask = () => {
    const K0 = randomInt(50, 150) * 1000;
    const n = randomInt(5, 25);
    const p = randomFloat(1.5, 8.0, 2);
    const v = randomInt(3, n - 1);
    
    const q = 1 + p / 100;
    const A = K0 * (Math.pow(q, n) * (q - 1)) / (Math.pow(q, n) - 1);

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
  };

  const handleInputChange = (field: string, value: string) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  const checkAnswers = () => {
    if (!task) return;

    const tolerance = 0.05;
    const check = (val: string, expected: number): 'correct' | 'incorrect' => {
      const num = parseFloat(val.replace(',', '.'));
      if (isNaN(num)) return 'incorrect';
      return Math.abs(num - expected) <= tolerance ? 'correct' : 'incorrect';
    };

    const exactRate = task.p / 100;
    const q = 1 + exactRate;
    const A = task.A;
    
    // Year 1
    const Z1 = task.K0 * exactRate;
    const T1 = A - Z1;
    const K1 = task.K0 - T1; // Debt at start of year 2

    // Year 2
    const Z2 = K1 * exactRate;
    const T2 = A - Z2;
    const K2 = K1 - T2; 

    // Year v
    // Debt at start of year v (end of v-1)
    // Formula: R_k = K0 * (q^n - q^k) / (q^n - 1)
    const Kv_start = task.K0 * (Math.pow(q, task.n) - Math.pow(q, task.v - 1)) / (Math.pow(q, task.n) - 1);
    
    const Zv = Kv_start * exactRate;
    const Tv = A - Zv;
    // Av is constant A

    const newFeedback = {
      k0: check(inputs.k0, task.K0),
      z1: check(inputs.z1, Z1),
      t1: check(inputs.t1, T1),
      a1: check(inputs.a1, A),
      
      k1: check(inputs.k1, K1),
      z2: check(inputs.z2, Z2),
      t2: check(inputs.t2, T2),
      a2: check(inputs.a2, A),
      
      kv: check(inputs.kv, Kv_start),
      zv: check(inputs.zv, Zv),
      tv: check(inputs.tv, Tv),
      av: check(inputs.av, A),
    };

    setFeedback(newFeedback);
    
    const allCorrect = Object.values(newFeedback).every(s => s === 'correct');
    if (allCorrect && !showSolution) {
      setCorrectCount(c => c + 1);
    }
    setTotalCount(c => c + 1);
  };

  const revealSolution = () => {
    setShowSolution(true);
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
    const A = task.A;
    
    const Z1 = task.K0 * exactRate;
    const T1 = A - Z1;
    const K1 = task.K0 - T1;
    
    const Z2 = K1 * exactRate;
    const T2 = A - Z2;
    
    const Kv_start = task.K0 * (Math.pow(q, task.n) - Math.pow(q, task.v - 1)) / (Math.pow(q, task.n) - 1);
    const Zv = Kv_start * exactRate;
    const Tv = A - Zv;

    switch(field) {
      case 'k0': return task.K0;
      case 'z1': return Z1;
      case 't1': return T1;
      case 'a1': return A;
      case 'k1': return K1;
      case 'z2': return Z2;
      case 't2': return T2;
      case 'a2': return A;
      case 'kv': return Kv_start;
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
          <a href="/finanzmathe" className="text-blue-600 hover:underline mb-4 self-start">&larr; Zurück zur Übersicht</a>
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
                  <th className="p-3 border text-left">Jahr</th>
                  <th className="p-3 border text-right">Schuld (Anfang)</th>
                  <th className="p-3 border text-right">Zinsen</th>
                  <th className="p-3 border text-right">Tilgung</th>
                  <th className="p-3 border text-right">Annuität (Rate)</th>
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
                    {showSolution && <div className="text-xs text-blue-600 text-right mt-1">{formatCurrency(getSol('k0'))}</div>}
                  </td>
                  <td className="p-2 border">
                    <input 
                      type="text" 
                      value={inputs.z1} 
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('z1', e.target.value)}
                      className={getInputClass('z1')}
                      placeholder="Z₁"
                    />
                    {showSolution && <div className="text-xs text-blue-600 text-right mt-1">{formatCurrency(getSol('z1'))}</div>}
                  </td>
                  <td className="p-2 border">
                    <input 
                      type="text" 
                      value={inputs.t1} 
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('t1', e.target.value)}
                      className={getInputClass('t1')}
                      placeholder="T₁"
                    />
                    {showSolution && <div className="text-xs text-blue-600 text-right mt-1">{formatCurrency(getSol('t1'))}</div>}
                  </td>
                  <td className="p-2 border">
                    <input 
                      type="text" 
                      value={inputs.a1} 
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('a1', e.target.value)}
                      className={getInputClass('a1')}
                      placeholder="A"
                    />
                    {showSolution && <div className="text-xs text-blue-600 text-right mt-1">{formatCurrency(getSol('a1'))}</div>}
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
                    {showSolution && <div className="text-xs text-blue-600 text-right mt-1">{formatCurrency(getSol('k1'))}</div>}
                  </td>
                  <td className="p-2 border">
                    <input 
                      type="text" 
                      value={inputs.z2} 
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('z2', e.target.value)}
                      className={getInputClass('z2')}
                      placeholder="Z₂"
                    />
                    {showSolution && <div className="text-xs text-blue-600 text-right mt-1">{formatCurrency(getSol('z2'))}</div>}
                  </td>
                  <td className="p-2 border">
                    <input 
                      type="text" 
                      value={inputs.t2} 
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('t2', e.target.value)}
                      className={getInputClass('t2')}
                      placeholder="T₂"
                    />
                    {showSolution && <div className="text-xs text-blue-600 text-right mt-1">{formatCurrency(getSol('t2'))}</div>}
                  </td>
                  <td className="p-2 border">
                    <input 
                      type="text" 
                      value={inputs.a2} 
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('a2', e.target.value)}
                      className={getInputClass('a2')}
                      placeholder="A"
                    />
                    {showSolution && <div className="text-xs text-blue-600 text-right mt-1">{formatCurrency(getSol('a2'))}</div>}
                  </td>
                </tr>

                {/* Separator */}
                <tr>
                  <td colSpan={5} className="p-2 border bg-gray-50 text-center text-gray-400">...</td>
                </tr>

                {/* Year v */}
                <tr>
                  <td className="p-3 border font-bold text-center">{task.v}</td>
                  <td className="p-2 border">
                    <input 
                      type="text" 
                      value={inputs.kv} 
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('kv', e.target.value)}
                      className={getInputClass('kv')}
                      placeholder={`K${task.v-1}`}
                    />
                    {showSolution && <div className="text-xs text-blue-600 text-right mt-1">{formatCurrency(getSol('kv'))}</div>}
                  </td>
                  <td className="p-2 border">
                    <input 
                      type="text" 
                      value={inputs.zv} 
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('zv', e.target.value)}
                      className={getInputClass('zv')}
                      placeholder={`Z${task.v}`}
                    />
                    {showSolution && <div className="text-xs text-blue-600 text-right mt-1">{formatCurrency(getSol('zv'))}</div>}
                  </td>
                  <td className="p-2 border">
                    <input 
                      type="text" 
                      value={inputs.tv} 
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('tv', e.target.value)}
                      className={getInputClass('tv')}
                      placeholder={`T${task.v}`}
                    />
                    {showSolution && <div className="text-xs text-blue-600 text-right mt-1">{formatCurrency(getSol('tv'))}</div>}
                  </td>
                  <td className="p-2 border">
                    <input 
                      type="text" 
                      value={inputs.av} 
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('av', e.target.value)}
                      className={getInputClass('av')}
                      placeholder="A"
                    />
                    {showSolution && <div className="text-xs text-blue-600 text-right mt-1">{formatCurrency(getSol('av'))}</div>}
                  </td>
                </tr>
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
        </div>
      </div>
    </div>
  );
}

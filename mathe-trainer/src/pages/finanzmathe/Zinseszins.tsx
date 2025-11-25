import React, { useState, useEffect, useRef } from 'react';
import 'katex/dist/katex.min.css';
import { BlockMath, InlineMath } from 'react-katex';

type TaskType = 'k_end' | 'k_start' | 'p' | 'n';

interface Task {
  type: TaskType;
  K0: number;
  Kn: number;
  p: number;
  n: number;
  question: React.ReactNode;
}

const randomFloat = (min: number, max: number, decimals: number) => {
  const num = Math.random() * (max - min) + min;
  return parseFloat(num.toFixed(decimals));
};

const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const formatCurrency = (val: number) => val.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const formatNumber = (val: number, decimals: number = 2) => val.toLocaleString('de-DE', { maximumFractionDigits: decimals });

export default function Zinseszins() {
  const [taskType, setTaskType] = useState<TaskType | 'random'>('random');
  const [task, setTask] = useState<Task | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<React.ReactNode | null>(null);
  const [feedbackType, setFeedbackType] = useState<'correct' | 'incorrect' | null>(null);
  const [solution, setSolution] = useState<React.ReactNode | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    generateNewTask();
  }, [taskType]);

  const generateNewTask = () => {
    setFeedback(null);
    setFeedbackType(null);
    setSolution(null);
    setUserAnswer('');
    
    let type: TaskType;
    if (taskType === 'random') {
      const types: TaskType[] = ['k_end', 'k_start', 'p', 'n'];
      type = types[randomInt(0, 3)];
    } else {
      type = taskType;
    }

    let K0 = 0, Kn = 0, p = 0, n = 0;
    let question: React.ReactNode;

    switch (type) {
      case 'k_end': {
        K0 = randomInt(500, 20000);
        p = randomFloat(0.5, 8, 2);
        n = randomInt(2, 15);
        const q = 1 + p / 100;
        Kn = K0 * Math.pow(q, n);
        
        question = (
          <div>
            <p className="mb-2">Frau Müller eröffnet bei ihrer Bank ein Festgeldkonto und zahlt <strong>{formatCurrency(K0)} €</strong> ein. Die Bank bietet ihr für eine Laufzeit von <strong>{n} Jahren</strong> einen jährlichen Zinssatz von <strong>{formatNumber(p)} % p.a.</strong>.</p>
            <p className="font-semibold text-blue-800">Welchen Betrag <InlineMath math="K_n" /> kann Frau Müller am Ende der Laufzeit von ihrem Konto abheben?</p>
          </div>
        );
        break;
      }
      case 'k_start': {
        const targetKn = randomInt(1000, 25000);
        p = randomFloat(0.5, 8, 2);
        n = randomInt(2, 15);
        const q = 1 + p / 100;
        K0 = targetKn / Math.pow(q, n);
        Kn = targetKn; // Use the target as Kn
        
        question = (
          <div>
            <p className="mb-2">Herr Schmidt möchte in <strong>{n} Jahren</strong> über ein Kapital von <strong>{formatCurrency(Kn)} €</strong> für eine größere Anschaffung verfügen. Seine Bank bietet ihm einen Sparvertrag mit einem jährlichen Zinssatz von <strong>{formatNumber(p)} % p.a.</strong> an.</p>
            <p className="font-semibold text-blue-800">Welchen Betrag <InlineMath math="K_0" /> müsste Herr Schmidt heute einmalig anlegen, um sein Ziel zu erreichen?</p>
          </div>
        );
        break;
      }
      case 'p': {
        K0 = randomInt(500, 15000);
        n = randomInt(2, 12);
        const targetP = randomFloat(0.5, 7.5, 2);
        const q = 1 + targetP / 100;
        Kn = K0 * Math.pow(q, n);
        p = targetP;

        question = (
          <div>
            <p className="mb-2">Vor <strong>{n} Jahren</strong> hat Familie Meier einen Betrag von <strong>{formatCurrency(K0)} €</strong> in einen Investmentfonds eingezahlt. Heute beträgt der Wert des Fondsanteils <strong>{formatCurrency(Kn)} €</strong>.</p>
            <p className="font-semibold text-blue-800">Welchen durchschnittlichen jährlichen Zinssatz <InlineMath math="p" /> (in % p.a.) hat die Geldanlage von Familie Meier erzielt?</p>
          </div>
        );
        break;
      }
      case 'n': {
        K0 = randomInt(500, 10000);
        p = randomInt(1, 10);
        const q = 1 + p / 100;
        const targetN = randomInt(2, 20);
        Kn = K0 * Math.pow(q, targetN);
        n = targetN;

        question = (
          <div>
            <p className="mb-2">Ein junger Sparer legt <strong>{formatCurrency(K0)} €</strong> auf einem Konto an, das mit <strong>{formatNumber(p)} % p.a.</strong> verzinst wird. Er möchte wissen, wann sein Guthaben auf <strong>{formatCurrency(Kn)} €</strong> angewachsen sein wird.</p>
            <p className="font-semibold text-blue-800">Nach wie vielen Jahren <InlineMath math="n" /> (ganze Zahl) erreicht der Sparer sein Ziel?</p>
          </div>
        );
        break;
      }
    }

    setTask({ type, K0, Kn, p, n, question });
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const checkAnswer = () => {
    if (!task) return;
    
    const input = parseFloat(userAnswer.replace(',', '.'));
    if (isNaN(input)) {
      setFeedback('Bitte gib eine gültige Zahl ein.');
      setFeedbackType('incorrect');
      return;
    }

    let correctValue = 0;
    let unit = '';
    let tolerance = 0.02; // Default tolerance

    switch (task.type) {
      case 'k_end': correctValue = task.Kn; unit = '€'; break;
      case 'k_start': correctValue = task.K0; unit = '€'; break;
      case 'p': correctValue = task.p; unit = '% p.a.'; tolerance = 0.05; break;
      case 'n': correctValue = task.n; unit = 'Jahre'; tolerance = 0.1; break;
    }

    const diff = Math.abs(input - correctValue);
    
    setTotalCount(c => c + 1);

    if (diff <= tolerance) {
      setFeedback('Richtig! Sehr gut gemacht!');
      setFeedbackType('correct');
      setCorrectCount(c => c + 1);
      setStreak(s => s + 1);
    } else {
      setFeedback(
        <div>
          Leider falsch. Die richtige Lösung ist <b>{formatNumber(correctValue, task.type === 'n' ? 0 : 2)} {unit}</b>.
        </div>
      );
      setFeedbackType('incorrect');
      setStreak(0);
    }
  };

  const showSolution = () => {
    if (!task) return;
    
    let steps: React.ReactNode;
    const q = 1 + task.p / 100;
    
    switch (task.type) {
      case 'k_end':
        steps = (
          <div>
            <p>Gesucht ist das Endkapital <InlineMath math="K_n" />.</p>
            <p>Formel: <InlineMath math="K_n = K_0 \cdot q^n" /> mit <InlineMath math="q = 1 + \frac{p}{100}" /></p>
            <p><InlineMath math={`q = 1 + \\frac{${formatNumber(task.p)}}{100} = ${formatNumber(q, 4)}`} /></p>
            <p>Einsetzen: <InlineMath math={`K_n = ${formatCurrency(task.K0)} \\cdot ${formatNumber(q, 4)}^{${task.n}}`} /></p>
            <p>Ergebnis: <b>{formatCurrency(task.Kn)} €</b></p>
          </div>
        );
        break;
      case 'k_start':
        steps = (
          <div>
            <p>Gesucht ist das Anfangskapital <InlineMath math="K_0" />.</p>
            <p>Formel umgestellt: <InlineMath math="K_0 = \frac{K_n}{q^n}" /></p>
            <p><InlineMath math={`q = 1 + \\frac{${formatNumber(task.p)}}{100} = ${formatNumber(q, 4)}`} /></p>
            <p>Einsetzen: <InlineMath math={`K_0 = \\frac{${formatCurrency(task.Kn)}}{${formatNumber(q, 4)}^{${task.n}}}`} /></p>
            <p>Ergebnis: <b>{formatCurrency(task.K0)} €</b></p>
          </div>
        );
        break;
      case 'p':
        steps = (
          <div>
            <p>Gesucht ist der Zinssatz <InlineMath math="p" />.</p>
            <p>Formel umgestellt: <InlineMath math="q = \sqrt[n]{\frac{K_n}{K_0}}" /></p>
            <p>Einsetzen: <InlineMath math={`q = \\sqrt[${task.n}]{\\frac{${formatCurrency(task.Kn)}}{${formatCurrency(task.K0)}}} \\approx ${formatNumber(q, 4)}`} /></p>
            <p><InlineMath math={`p = (q - 1) \\cdot 100 = (${formatNumber(q, 4)} - 1) \\cdot 100`} /></p>
            <p>Ergebnis: <b>{formatNumber(task.p)} % p.a.</b></p>
          </div>
        );
        break;
      case 'n':
        steps = (
          <div>
            <p>Gesucht ist die Laufzeit <InlineMath math="n" />.</p>
            <p>Formel umgestellt: <InlineMath math="n = \frac{\ln(K_n / K_0)}{\ln(q)}" /></p>
            <p><InlineMath math={`q = 1 + \\frac{${formatNumber(task.p)}}{100} = ${formatNumber(q, 4)}`} /></p>
            <p>Einsetzen: <InlineMath math={`n = \\frac{\\ln(${formatCurrency(task.Kn)} / ${formatCurrency(task.K0)})}{\\ln(${formatNumber(q, 4)})}`} /></p>
            <p>Ergebnis: <b>{task.n} Jahre</b></p>
          </div>
        );
        break;
    }

    setSolution(steps);
    setFeedback(null);
    setFeedbackType(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') checkAnswer();
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-sky-100">
      <div className="flex-1 flex flex-col items-center justify-center w-full px-2 py-8 sm:px-8">
        <div className="bg-white rounded-2xl shadow-md border border-slate-200 w-full max-w-4xl min-h-[400px] flex flex-col items-center p-6 sm:p-12 md:p-16 lg:p-20 xl:p-24">
          <a href="/finanzmathe" className="text-blue-600 hover:underline mb-4 self-start">&larr; Zurück zur Übersicht</a>
          <h1 className="text-3xl md:text-4xl font-bold text-blue-900 mb-2 text-center">Zinseszins-Rechner</h1>
          
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6 w-full max-w-2xl text-center">
            <div className="text-lg font-serif mb-2">
              <BlockMath math="K_n = K_0 \cdot q^n" />
            </div>
            <p className="text-sm text-gray-600">
              <InlineMath math="q = 1 + \frac{p}{100}" />
            </p>
          </div>

          <div className="flex flex-wrap gap-2 mb-6 justify-center">
            <button onClick={() => setTaskType('random')} className={`px-4 py-2 rounded font-bold transition ${taskType === 'random' ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-700'}`}>Zufall</button>
            <button onClick={() => setTaskType('k_end')} className={`px-4 py-2 rounded font-bold transition ${taskType === 'k_end' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>Endkapital <InlineMath math="K_n" /></button>
            <button onClick={() => setTaskType('k_start')} className={`px-4 py-2 rounded font-bold transition ${taskType === 'k_start' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>Anfangskapital <InlineMath math="K_0" /></button>
            <button onClick={() => setTaskType('p')} className={`px-4 py-2 rounded font-bold transition ${taskType === 'p' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>Zinssatz <InlineMath math="p" /></button>
            <button onClick={() => setTaskType('n')} className={`px-4 py-2 rounded font-bold transition ${taskType === 'n' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>Laufzeit <InlineMath math="n" /></button>
          </div>

          {task && (
            <div className="w-full max-w-xl bg-slate-100 border border-slate-200 rounded-lg p-6 mb-4">
              <div className="text-lg mb-4">
                {task.question}
              </div>

              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-700 whitespace-nowrap">
                  {task.type === 'k_end' && <span>Endkapital <InlineMath math="K_n" />:</span>}
                  {task.type === 'k_start' && <span>Anfangskapital <InlineMath math="K_0" />:</span>}
                  {task.type === 'p' && <span>Zinssatz <InlineMath math="p" />:</span>}
                  {task.type === 'n' && <span>Laufzeit <InlineMath math="n" />:</span>}
                </span>
                <input
                  ref={inputRef}
                  type="text"
                  className="flex-1 border-2 border-slate-300 rounded-lg p-2 text-lg focus:outline-blue-400"
                  value={userAnswer}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUserAnswer(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={task.type === 'n' ? 'z.B. 5' : 'z.B. 1234,56'}
                />
                <span className="text-xl font-bold text-gray-600">
                  {task.type === 'k_end' || task.type === 'k_start' ? '€' : task.type === 'p' ? '% p.a.' : 'Jahre'}
                </span>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-4 mb-4">
            <button onClick={checkAnswer} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded shadow transition-colors">Überprüfen</button>
            <button onClick={showSolution} className="bg-gray-700 hover:bg-gray-800 text-white font-bold py-2 px-6 rounded shadow transition-colors">Lösung zeigen</button>
            <button onClick={generateNewTask} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded shadow transition-colors">Nächste Aufgabe</button>
          </div>

          {feedback && (
            <div className={`w-full max-w-xl text-center font-semibold rounded p-3 mb-2 ${feedbackType === 'correct' ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-red-100 text-red-800 border border-red-300'}`}>
              {feedback}
            </div>
          )}
          
          {solution && (
            <div className="w-full max-w-xl bg-blue-50 border border-blue-200 rounded p-4 text-blue-900 mb-2 text-base md:text-lg overflow-x-auto">
              <b>Musterlösung:</b>
              <div className="mt-2 space-y-2">
                {solution}
              </div>
            </div>
          )}

          <div className="flex flex-wrap justify-center gap-8 mt-6 w-full max-w-2xl">
            <div className="flex flex-col items-center"><div className="text-2xl font-bold text-blue-800">{correctCount}</div><div className="text-gray-600 text-sm">Richtig</div></div>
            <div className="flex flex-col items-center"><div className="flex items-center text-2xl font-bold text-orange-500"><span role="img" aria-label="Streak">🔥</span>{streak}</div><div className="text-gray-600 text-sm">Streak</div></div>
            <div className="flex flex-col items-center"><div className="text-2xl font-bold text-blue-800">{totalCount}</div><div className="text-gray-600 text-sm">Gesamt</div></div>
          </div>
        </div>
      </div>
    </div>
  );
}

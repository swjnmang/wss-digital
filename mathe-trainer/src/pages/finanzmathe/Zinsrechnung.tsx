import React, { useState, useEffect, useRef } from 'react';
import 'katex/dist/katex.min.css';
import { BlockMath, InlineMath } from 'react-katex';

type Difficulty = 'easy' | 'medium' | 'hard';
type TaskType = 'zinsen' | 'kapital' | 'zinssatz' | 'laufzeit';

interface Task {
  type: TaskType;
  K: number;
  p: number;
  t: number;
  Z: number;
  missing: string;
  text: string;
}

const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomFloat = (min: number, max: number, decimals: number) => {
  const num = Math.random() * (max - min) + min;
  return parseFloat(num.toFixed(decimals));
};

const formatCurrency = (val: number) => val.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const formatNumber = (val: number) => val.toLocaleString('de-DE', { maximumFractionDigits: 4 });

const getWordProblem = (type: TaskType, K: number, p: number, t: number, Z: number) => {
  const K_str = formatCurrency(K) + ' €';
  const p_str = formatNumber(p) + ' %';
  const t_str = t + ' Tage';
  const Z_str = formatCurrency(Z) + ' €';

  const templates = {
    zinsen: [
      `Herr Müller legt ${K_str} zu einem Zinssatz von ${p_str} für ${t_str} an. Wie viel Zinsen erhält er?`,
      `Ein Guthaben von ${K_str} wird ${t_str} lang mit ${p_str} verzinst. Berechne den Zinsertrag.`,
      `Die Firma Schmidt hat ein Geschäftskonto mit ${K_str} Guthaben. Die Bank zahlt ${p_str} Zinsen. Wie hoch sind die Zinsen nach ${t_str}?`,
      `Für einen Kredit von ${K_str} müssen für ${t_str} ${p_str} Zinsen gezahlt werden. Berechne die Zinskosten.`,
      `Auf einem Sparbuch befinden sich ${K_str}. Der Zinssatz beträgt ${p_str}. Wie viele Zinsen fallen für einen Zeitraum von ${t_str} an?`,
      `Ein Anleger investiert ${K_str} in eine kurzfristige Anlage (${t_str}) zu ${p_str}. Welchen Zinsbetrag erhält er?`,
      `Wie viel Zinsen bringt ein Kapital von ${K_str}, wenn es zu ${p_str} für ${t_str} angelegt wird?`,
      `Berechne die Zinsen für ein Darlehen über ${K_str} bei einem Zinssatz von ${p_str} und einer Laufzeit von ${t_str}.`
    ],
    kapital: [
      `Welches Kapital bringt bei ${p_str} Zinsen in ${t_str} genau ${Z_str} Zinsen?`,
      `Frau Schmidt erhält ${Z_str} Zinsen für eine Anlage über ${t_str} zu ${p_str}. Wie hoch war die Anlage?`,
      `Ein Unternehmer zahlt für einen Überziehungskredit ${Z_str} Zinsen. Der Zinssatz beträgt ${p_str}, die Laufzeit war ${t_str}. Wie hoch war der Kredit?`,
      `Wie viel Geld muss man zu ${p_str} anlegen, um in ${t_str} ${Z_str} Zinsen zu erhalten?`,
      `Nach ${t_str} erhält ein Sparer ${Z_str} Zinsen. Der Zinssatz lag bei ${p_str}. Berechne das angelegte Kapital.`,
      `Für eine Investition fielen in ${t_str} ${Z_str} Zinsen an (Zinssatz: ${p_str}). Wie hoch war die Investitionssumme?`,
      `Ein Betrag wurde für ${t_str} zu ${p_str} fest angelegt und brachte ${Z_str} Ertrag. Wie hoch war der Betrag?`,
      `Berechne das Kapital, das bei ${p_str} Verzinsung in ${t_str} ${Z_str} Zinsen abwirft.`
    ],
    zinssatz: [
      `Ein Kapital von ${K_str} bringt in ${t_str} ${Z_str} Zinsen. Wie hoch ist der Zinssatz?`,
      `Zu welchem Zinssatz wurde ein Betrag von ${K_str} angelegt, wenn er in ${t_str} ${Z_str} Zinsen brachte?`,
      `Für einen Kredit von ${K_str} mussten nach ${t_str} ${Z_str} Zinsen gezahlt werden. Berechne den Zinssatz.`,
      `Herr Klein erhält für seine Anlage von ${K_str} nach ${t_str} ${Z_str} Zinsen. Wie hoch war der Zinssatz?`,
      `Ein Geschäftskonto mit ${K_str} Guthaben erwirtschaftet in ${t_str} ${Z_str} Zinsen. Wie hoch ist der Zinssatz p.a.?`,
      `Welcher Zinssatz liegt zugrunde, wenn ${K_str} in ${t_str} ${Z_str} Zinsen erbringen?`,
      `Berechne den Zinssatz: Kapital = ${K_str}, Laufzeit = ${t_str}, Zinsen = ${Z_str}.`,
      `Bei welchem Zinssatz wachsen ${K_str} in ${t_str} um ${Z_str} an?`
    ],
    laufzeit: [
      `Wie lange muss man ${K_str} zu ${p_str} anlegen, um ${Z_str} Zinsen zu erhalten?`,
      `Nach wie vielen Tagen bringen ${K_str} bei ${p_str} Zinsen einen Ertrag von ${Z_str}?`,
      `Ein Kredit über ${K_str} kostet bei ${p_str} Zinsen genau ${Z_str}. Wie lange war die Laufzeit?`,
      `Für welchen Zeitraum wurde ein Kapital von ${K_str} angelegt, wenn es bei ${p_str} Zinsen ${Z_str} Ertrag brachte?`,
      `Frau Weber zahlt für ${K_str} Schulden ${Z_str} Zinsen (Zinssatz ${p_str}). Wie viele Tage lief der Kredit?`,
      `Ein Anleger möchte ${Z_str} Zinsen mit ${K_str} Kapital bei ${p_str} erzielen. Wie lange muss er das Geld anlegen?`,
      `Berechne die Laufzeit in Tagen: Kapital ${K_str}, Zinssatz ${p_str}, Zinsen ${Z_str}.`,
      `Wann sind ${Z_str} Zinsen fällig, wenn man ${K_str} zu ${p_str} leiht?`
    ]
  };

  const options = templates[type];
  return options[randomInt(0, options.length - 1)];
};

export default function Zinsrechnung() {
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
  }, []);

  const generateNewTask = () => {
    setFeedback(null);
    setFeedbackType(null);
    setSolution(null);
    setUserAnswer('');
    
    const types: TaskType[] = ['zinsen', 'kapital', 'zinssatz', 'laufzeit'];
    const type = types[randomInt(0, 3)];
    
    // Use a balanced difficulty logic (formerly 'medium')
    const K = randomInt(50, 500) * 100; // 5000 ... 50000
    const p = randomFloat(1.5, 7.5, 1);
    const t = randomInt(15, 270);

    // Calculate Z based on K, p, t
    // Z = (K * p * t) / (100 * 360)
    const Z = (K * p * t) / (100 * 360);
    
    const text = getWordProblem(type, K, p, t, Z);

    setTask({ type, K, p, t, Z, missing: type, text });
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
    
    switch (task.type) {
      case 'zinsen': correctValue = task.Z; unit = '€'; break;
      case 'kapital': correctValue = task.K; unit = '€'; break;
      case 'zinssatz': correctValue = task.p; unit = '% p.a.'; break;
      case 'laufzeit': correctValue = task.t; unit = 'Tage'; break;
    }

    // Allow small tolerance
    const tolerance = task.type === 'kapital' ? 0.1 : 0.05;
    const diff = Math.abs(input - correctValue);
    
    setTotalCount(c => c + 1);

    if (diff <= tolerance || (task.type === 'laufzeit' && Math.abs(Math.round(input) - Math.round(correctValue)) <= 1)) {
      setFeedback('Richtig!');
      setFeedbackType('correct');
      setCorrectCount(c => c + 1);
      setStreak(s => s + 1);
    } else {
      setFeedback(
        <div>
          Leider falsch. Die richtige Lösung ist <b>{formatNumber(correctValue)} {unit}</b>.
        </div>
      );
      setFeedbackType('incorrect');
      setStreak(0);
    }
  };

  const showSolution = () => {
    if (!task) return;
    
    let steps: React.ReactNode;
    
    const K_str = formatCurrency(task.K);
    const p_str = formatNumber(task.p);
    const t_str = Math.round(task.t).toString();
    const Z_str = formatCurrency(task.Z);

    switch (task.type) {
      case 'zinsen':
        steps = (
          <div>
            <p>Gesucht sind die Zinsen Z.</p>
            <p>Formel: <InlineMath math="Z = \frac{K \cdot p \cdot t}{100 \cdot 360}" /></p>
            <p>Einsetzen: <InlineMath math={`Z = \\frac{${K_str} \\cdot ${p_str} \\cdot ${t_str}}{36000}`} /></p>
            <p>Ergebnis: <b>{Z_str} €</b></p>
          </div>
        );
        break;
      case 'kapital':
        steps = (
          <div>
            <p>Gesucht ist das Kapital K.</p>
            <p>Formel umgestellt: <InlineMath math="K = \frac{Z \cdot 100 \cdot 360}{p \cdot t}" /></p>
            <p>Einsetzen: <InlineMath math={`K = \\frac{${Z_str} \\cdot 36000}{${p_str} \\cdot ${t_str}}`} /></p>
            <p>Ergebnis: <b>{K_str} €</b></p>
          </div>
        );
        break;
      case 'zinssatz':
        steps = (
          <div>
            <p>Gesucht ist der Zinssatz p.</p>
            <p>Formel umgestellt: <InlineMath math="p = \frac{Z \cdot 100 \cdot 360}{K \cdot t}" /></p>
            <p>Einsetzen: <InlineMath math={`p = \\frac{${Z_str} \\cdot 36000}{${K_str} \\cdot ${t_str}}`} /></p>
            <p>Ergebnis: <b>{p_str} % p.a.</b></p>
          </div>
        );
        break;
      case 'laufzeit':
        steps = (
          <div>
            <p>Gesucht ist die Laufzeit t.</p>
            <p>Formel umgestellt: <InlineMath math="t = \frac{Z \cdot 100 \cdot 360}{K \cdot p}" /></p>
            <p>Einsetzen: <InlineMath math={`t = \\frac{${Z_str} \\cdot 36000}{${K_str} \\cdot ${p_str}}`} /></p>
            <p>Ergebnis: <b>{t_str} Tage</b></p>
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
          <a href="/finanzmathe/zinsrechnung" className="text-blue-600 hover:underline mb-4 self-start">&larr; Zurück zum Menü</a>
          <h1 className="text-3xl md:text-4xl font-bold text-blue-900 mb-2 text-center">Zinsrechnung (Tageszinsen)</h1>
          
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6 w-full max-w-2xl text-center">
            <div className="text-lg font-serif mb-2">
              <BlockMath math="Z = \frac{K \cdot p \cdot t}{100 \cdot 360}" />
            </div>
            <p className="text-sm text-gray-600">
              Z = Zinsen, K = Kapital, p = Zinssatz (% p.a.), t = Tage (360/Jahr)
            </p>
          </div>

          {task && (
            <div className="w-full max-w-xl bg-slate-100 border border-slate-200 rounded-lg p-6 mb-4">
              <div className="mb-6 text-lg text-gray-800 font-medium leading-relaxed">
                {task.text}
              </div>
              
              <div className="font-bold text-blue-800 mb-2">Berechne:</div>
              <p className="mb-2">
                {task.type === 'zinsen' && 'Die Zinsen Z'}
                {task.type === 'kapital' && 'Das Kapital K'}
                {task.type === 'zinssatz' && 'Den Zinssatz p'}
                {task.type === 'laufzeit' && 'Die Laufzeit t'}
              </p>

              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  className="flex-1 border-2 border-slate-300 rounded-lg p-2 text-lg focus:outline-blue-400"
                  value={userAnswer}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUserAnswer(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ergebnis"
                />
                <span className="text-xl font-bold text-gray-600">
                  {task.type === 'zinsen' || task.type === 'kapital' ? '€' : task.type === 'zinssatz' ? '% p.a.' : 'Tage'}
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

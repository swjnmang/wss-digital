import React, { useState, useEffect, useRef } from 'react';
import 'katex/dist/katex.min.css';
import { BlockMath, InlineMath } from 'react-katex';

type TaskType = 'mehrung' | 'minderung';
type Timing = 'vor' | 'nach';
type Unknown = 'Kn' | 'K0' | 'r' | 'n';

interface Task {
  type: TaskType;
  timing: Timing;
  unknown: Unknown;
  K0: number;
  Kn?: number;
  r: number;
  n: number;
  p: number;
  q: number;
  question: React.ReactNode;
  solutionValue: number;
  solutionRaw?: number;
}

const randomFloat = (min: number, max: number, decimals: number) => {
  const num = Math.random() * (max - min) + min;
  return parseFloat(num.toFixed(decimals));
};

const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomItem = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const formatCurrency = (val: number) => val.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const formatNumber = (val: number, decimals: number = 2) => val.toLocaleString('de-DE', { maximumFractionDigits: decimals });
const formatMathNumber = (val: number, decimals: number = 2) => val.toLocaleString('de-DE', { maximumFractionDigits: decimals, minimumFractionDigits: decimals, useGrouping: false });
const roundYearsLogical = (years: number, type: TaskType) => {
  const rounded = type === 'mehrung' ? Math.ceil(years) : Math.floor(years);
  return Math.max(1, rounded);
};

export default function MehrungMinderung() {
  const [unknownType, setUnknownType] = useState<Unknown | 'random'>('random');
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
  }, [unknownType]);

  const generateNewTask = () => {
    setFeedback(null);
    setFeedbackType(null);
    setSolution(null);
    setUserAnswer('');
    
    let validTask = false;
    let newTask: Task | null = null;

    while (!validTask) {
      const unknown = unknownType === 'random' ? getRandomItem(['Kn', 'K0', 'r', 'n'] as Unknown[]) : unknownType;
      const type = getRandomItem(['mehrung', 'minderung'] as TaskType[]);
      const timing = getRandomItem(['vor', 'nach'] as Timing[]);
      
      const p = randomFloat(1.5, 6.5, 2);
      const q = 1 + p / 100;
      const n = randomInt(5, 30);
      const r = randomInt(50, 500) * 10;
      let K0 = randomInt(100, 1000) * 50;

      // Adjust values to make sense
      const K0_compounded = K0 * Math.pow(q, n);
      let Kn = 0;

      if (unknown === 'Kn') {
        if (type === 'minderung' && K0_compounded < (r * n * 1.2)) {
           K0 *= 2; // Increase K0 if it's too small for the withdrawals
        }
      } else if (unknown === 'K0') {
        if (type === 'mehrung') {
            Kn = K0_compounded + (r * n * 1.5);
        } else {
            Kn = K0_compounded * randomFloat(0.1, 0.7, 2);
            if (Kn < 0) Kn = 0;
        }
      } else if (unknown === 'r') {
        if (type === 'mehrung') {
            Kn = K0_compounded * randomFloat(1.2, 2.5, 2);
        } else {
            Kn = K0 * randomFloat(0.1, 0.7, 2);
        }
      } else if (unknown === 'n') {
        if (type === 'mehrung') {
            Kn = K0 * randomFloat(1.5, 4.0, 2);
        } else {
            Kn = K0 * randomFloat(0.1, 0.7, 2);
        }
      }

      // Calculate solution
      const sol = solveTask(K0, Kn, r, n, q, type, timing, unknown);
      
      if (sol !== null && isFinite(sol) && (sol > 0 || unknown === 'Kn' || (unknown === 'K0' && sol >= 0))) {
        if (unknown === 'n' && sol < 1.0) continue;
        
        // If we calculated a value (like Kn, K0, r), we should use THAT value in the task description 
        // instead of the random one, to ensure consistency.
        // Wait, if unknown is Kn, we calculate Kn.
        // If unknown is K0, we calculate K0 based on Kn, r, n. So we need Kn in the task.
        
        let finalK0 = K0;
        let finalKn = Kn;
        let finalR = r;
        let finalN = n;
        let solutionValue = sol;
        
        if (unknown === 'Kn') finalKn = sol;
        if (unknown === 'K0') finalK0 = sol;
        if (unknown === 'r') finalR = sol;
        if (unknown === 'n') {
          finalN = roundYearsLogical(sol, type);
          solutionValue = finalN;
        }

        // Re-verify if n was unknown, that the integer n produces close enough result? 
        // Or just accept the calculated float n for internal logic but display rounded?
        // The original code calculates float n.
        
        newTask = {
          type, timing, unknown,
          K0: finalK0, Kn: finalKn, r: finalR, n: finalN, p, q,
          question: null, // Will build below
          solutionValue,
          solutionRaw: unknown === 'n' ? sol : undefined
        };
        validTask = true;
      }
    }

    if (newTask) {
      newTask.question = buildQuestion(newTask);
      setTask(newTask);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const solveTask = (K0: number, Kn: number, r: number, n: number, q: number, type: TaskType, timing: Timing, unknown: Unknown): number | null => {
    const R_Faktor = (timing === 'vor') ? q : 1;
    const R_Barwertfaktor = (Math.pow(q, n) - 1) / (q - 1);
    const K0_Teil = K0 * Math.pow(q, n);
    const R_Teil = r * R_Faktor * R_Barwertfaktor;

    try {
      switch (unknown) {
        case 'Kn':
          return (type === 'mehrung')
            ? (K0_Teil + R_Teil)
            : Math.max(0, K0_Teil - R_Teil);
        case 'K0':
          return (type === 'mehrung') ? ((Kn - R_Teil) / Math.pow(q, n)) : ((Kn + R_Teil) / Math.pow(q, n));
        case 'r':
          return (type === 'mehrung') ? ((Kn - K0_Teil) / (R_Faktor * R_Barwertfaktor)) : ((K0_Teil - Kn) / (R_Faktor * R_Barwertfaktor));
        case 'n': {
          const C = r * R_Faktor;
          const qm1 = q - 1;
          let numerator, denominator;
          if (type === 'mehrung') {
            numerator = Kn * qm1 + C;
            denominator = K0 * qm1 + C;
          } else {
            numerator = Kn * qm1 - C;
            denominator = K0 * qm1 - C;
          }
          if (numerator / denominator <= 0) return null;
          return Math.log(numerator / denominator) / Math.log(q);
        }
      }
    } catch (e) {
      return null;
    }
    return null;
  };

  const buildQuestion = (t: Task) => {
    const people = ["Herr Schmidt", "Frau Müller", "Eine clevere Studentin", "Ein junger Unternehmer", "Eine Ärztin", "Familie Wagner"];
    const person = getRandomItem(people);
    
    const timingText = t.timing === 'vor' ? 'am Jahresanfang' : 'am Jahresende';
    const timingAdv = t.timing === 'vor' ? 'vorschüssig' : 'nachschüssig';
    
    let text = '';
    
    if (t.type === 'mehrung') {
      text = `${person} besitzt ein Startkapital von ${formatCurrency(t.K0)} €. `;
      text += `Zusätzlich spart ${person.split(' ')[0] === 'Familie' ? 'sie' : 'er/sie'} jährlich ${timingText} einen Betrag von ${formatCurrency(t.r)} €. `;
      text += `Das Geld wird mit ${formatNumber(t.p)} % p.a. verzinst. `;
      
      if (t.unknown === 'Kn') {
        text += `Über welches Kapital verfügt ${person} nach ${t.n} Jahren?`;
      } else if (t.unknown === 'n') {
        text += `Nach wie vielen Jahren ist das Kapital auf ${formatCurrency(t.Kn!)} € angewachsen?`;
      } else if (t.unknown === 'r') {
        // This case is tricky because r is in the text.
        // We need to rephrase: "Wie viel muss ... sparen, damit ..."
        text = `${person} besitzt ein Startkapital von ${formatCurrency(t.K0)} €. `;
        text += `${person.split(' ')[0] === 'Familie' ? 'Sie möchte' : 'Er/Sie möchte'} jährlich ${timingText} einen festen Betrag sparen, um nach ${t.n} Jahren über ${formatCurrency(t.Kn!)} € zu verfügen. `;
        text += `Der Zinssatz beträgt ${formatNumber(t.p)} % p.a. Wie hoch muss die jährliche Sparrate sein?`;
      } else if (t.unknown === 'K0') {
        text = `${person} möchte durch jährliche Sparraten von ${formatCurrency(t.r)} € (${timingAdv}) nach ${t.n} Jahren ein Endkapital von ${formatCurrency(t.Kn!)} € erreichen. `;
        text += `Der Zinssatz beträgt ${formatNumber(t.p)} % p.a. Welches Startkapital ist dafür heute notwendig?`;
      }
    } else {
      // Minderung (Entnahme)
      text = `${person} verfügt über ein Kapital von ${formatCurrency(t.K0)} €. `;
      text += `Davon möchte ${person.split(' ')[0] === 'Familie' ? 'sie' : 'er/sie'} sich jährlich ${timingText} ${formatCurrency(t.r)} € auszahlen lassen. `;
      text += `Das restliche Geld wird mit ${formatNumber(t.p)} % p.a. verzinst. `;
      
      if (t.unknown === 'Kn') {
        text += `Wie viel Kapital ist nach ${t.n} Jahren noch übrig?`;
      } else if (t.unknown === 'n') {
        text = `${person} hat ${formatCurrency(t.K0)} € angelegt (${formatNumber(t.p)} % p.a. Zins). `;
        text += `Wie viele Jahre lang kann ${person.split(' ')[0] === 'Familie' ? 'sie' : 'er/sie'} sich jährlich ${timingText} ${formatCurrency(t.r)} € auszahlen lassen, bis das Kapital auf ${formatCurrency(t.Kn!)} € geschrumpft ist?`;
      } else if (t.unknown === 'r') {
        text = `${person} hat ${formatCurrency(t.K0)} € angelegt (${formatNumber(t.p)} % p.a. Zins). `;
        text += `Welchen Betrag kann ${person.split(' ')[0] === 'Familie' ? 'sie' : 'er/sie'} sich jährlich ${timingText} auszahlen lassen, damit nach ${t.n} Jahren noch ${formatCurrency(t.Kn!)} € übrig sind?`;
      } else if (t.unknown === 'K0') {
        text = `${person} möchte sich ${t.n} Jahre lang jährlich ${timingText} ${formatCurrency(t.r)} € auszahlen lassen. `;
        text += `Am Ende sollen noch ${formatCurrency(t.Kn!)} € übrig bleiben. Der Zinssatz beträgt ${formatNumber(t.p)} % p.a. Welches Kapital muss heute angelegt werden?`;
      }
    }

    return <p>{text}</p>;
  };

  const checkAnswer = () => {
    if (!task) return;
    
    const input = parseFloat(userAnswer.replace(',', '.'));
    if (isNaN(input)) {
      setFeedback('Bitte gib eine gültige Zahl ein.');
      setFeedbackType('incorrect');
      return;
    }

    const tolerance = task.unknown === 'n' ? 0.01 : 0.05;
    const diff = Math.abs(input - task.solutionValue);
    
    setTotalCount(c => c + 1);

    if (task.unknown === 'n' ? Math.round(input) === Math.round(task.solutionValue) : diff <= tolerance) {
      setFeedback('Richtig! Hervorragend.');
      setFeedbackType('correct');
      setCorrectCount(c => c + 1);
      setStreak(s => s + 1);
    } else {
      let unit = task.unknown === 'n' ? 'Jahre' : '€';
      let correctDisplay = formatNumber(task.solutionValue, task.unknown === 'n' ? 0 : 2);
      
      setFeedback(
        <div>
          Leider falsch. Die richtige Lösung ist <b>{correctDisplay} {unit}</b>.
        </div>
      );
      setFeedbackType('incorrect');
      setStreak(0);
    }
  };

  const showSolution = () => {
    if (!task) return;
    
    const q = task.q;
    const n = task.n;
    const r = task.r;
    const K0 = task.K0;
    const Kn = task.Kn;
    const type = task.type;
    const timing = task.timing;
    
    const sign = type === 'mehrung' ? '+' : '-';
    const r_factor = timing === 'vor' ? ` \\cdot ${formatNumber(q, 4)}` : '';
    const rFactorNumeric = timing === 'vor' ? q : 1;
    const qPowN = Math.pow(q, n);
    const rentenFaktor = (qPowN - 1) / (q - 1);
    const rentenFaktorLatex = formatMathNumber(rentenFaktor, 4);
    const qLatex = formatMathNumber(q, 4);
    const nLatex = formatMathNumber(n, 1);
    const k0Latex = formatMathNumber(K0, 2).replace('.', '\\,');
    const knLatex = Kn ? formatMathNumber(Kn, 2).replace('.', '\\,') : '';
    const rLatex = formatMathNumber(r, 2).replace('.', '\\,');
    const rfLatex = timing === 'vor' ? `${qLatex}` : '1';
    
    let steps: React.ReactNode;
    
    // Basic formula display
    const formulaBase = `K_n = K_0 \\cdot q^n ${sign} r ${timing === 'vor' ? '\\cdot q' : ''} \\cdot \\frac{q^n - 1}{q - 1}`;

    const substituted = (() => {
      const left = task.unknown === 'Kn' ? 'K_n' : knLatex || 'K_n';
      const k0Term = task.unknown === 'K0' ? 'K_0' : k0Latex;
      const rTerm = task.unknown === 'r' ? 'r' : rLatex;
      const nTerm = task.unknown === 'n' ? 'n' : nLatex;
      return `${left} = ${k0Term} \\cdot ${qLatex}^{${nTerm}} ${sign} ${rTerm} \\cdot ${rfLatex} \\cdot \\frac{${qLatex}^{${nTerm}} - 1}{${qLatex} - 1}`;
    })();

    const buildSolveLatex = () => {
      if (task.unknown === 'Kn') {
        const annuityPart = r * rFactorNumeric * rentenFaktor;
        const resultLatex = formatMathNumber(task.solutionValue, 2).replace('.', '\\,');
        return `\\begin{aligned}
K_n &= ${k0Latex} \\cdot ${qLatex}^{${nLatex}} ${sign} ${rLatex} \\cdot ${rfLatex} \\cdot ${rentenFaktorLatex}\\\\
      &= ${formatMathNumber(K0 * qPowN, 2)} ${sign} ${formatMathNumber(annuityPart, 2)}\\\\
&\\approx ${resultLatex}\\,€
\\end{aligned}`;
      }

      if (task.unknown === 'K0') {
        const numerator = type === 'mehrung'
          ? `${knLatex} - ${rLatex} \\cdot ${rfLatex} \\cdot ${rentenFaktorLatex}`
          : `${knLatex} + ${rLatex} \\cdot ${rfLatex} \\cdot ${rentenFaktorLatex}`;
        const resultLatex = formatMathNumber(task.solutionValue, 2).replace('.', '\\,');
        return `\\begin{aligned}
${knLatex} &= K_0 \\cdot ${qLatex}^{${nLatex}} ${sign} ${rLatex} \\cdot ${rfLatex} \\cdot ${rentenFaktorLatex}\\\\
${knLatex} &= K_0 \\cdot ${formatMathNumber(qPowN, 4)} ${sign} ${formatMathNumber(r * rFactorNumeric * rentenFaktor, 2)}\\\\
K_0 &= \\frac{${numerator}}{${qLatex}^{${nLatex}}}\\\\
&\\approx ${resultLatex}\\,€
\\end{aligned}`;
      }

      if (task.unknown === 'r') {
        const numerator = type === 'mehrung'
          ? `${knLatex} - ${k0Latex} \\cdot ${qLatex}^{${nLatex}}`
          : `${k0Latex} \\cdot ${qLatex}^{${nLatex}} - ${knLatex}`;
        const resultLatex = formatMathNumber(task.solutionValue, 2).replace('.', '\\,');
        return `\\begin{aligned}
${knLatex} &= ${k0Latex} \\cdot ${qLatex}^{${nLatex}} ${sign} r \\cdot ${rfLatex} \\cdot ${rentenFaktorLatex}\\\\
${knLatex} &= ${k0Latex} \\cdot ${formatMathNumber(qPowN, 4)} ${sign} r \\cdot ${formatMathNumber(rFactorNumeric * rentenFaktor, 4)}\\\\
r &= \\frac{${numerator}}{${rfLatex} \\cdot ${rentenFaktorLatex}}\\\\
&\\approx ${resultLatex}\\,€
\\end{aligned}`;
      }

      // unknown n
      const qm1 = q - 1;
      const qm1Latex = formatMathNumber(qm1, 4);
      const C = r * rFactorNumeric;
      const CLatex = formatMathNumber(C, 2);
      const numValue = type === 'mehrung'
        ? (Kn ?? 0) * qm1 + C
        : (Kn ?? 0) * qm1 - C;
      const denValue = type === 'mehrung'
        ? K0 * qm1 + C
        : K0 * qm1 - C;
      const num = formatMathNumber(numValue, 2);
      const den = formatMathNumber(denValue, 2);
      const resultLatex = formatMathNumber(task.solutionValue, 0);
      const rawLatex = formatMathNumber(task.solutionRaw ?? task.solutionValue, 2);
      return `\\begin{aligned}
    &${knLatex} = ${k0Latex} \\cdot q^n ${sign} ${rLatex} \\cdot ${rfLatex} \\cdot \\frac{q^n-1}{q-1}\\\\
    &${knLatex} = ${k0Latex} \\cdot ${qLatex}^n ${sign} ${rLatex} \\cdot ${rfLatex} \\cdot \\frac{${qLatex}^n-1}{${qLatex}-1}\\\\
    &\\Rightarrow \\frac{${num}}{${den}} = q^n\\\\
    &\\Rightarrow n = \\log_{${qLatex}}\\left(\\frac{${num}}{${den}}\\right)\\\\
    n_{\\text{berechnet}} &\\approx ${rawLatex}\\ \\text{Jahre}\\\\
    n_{\\text{sachlogisch}} &= ${resultLatex}\\ \\text{Jahre}
    \\end{aligned}`;
    };

    const solveLatex = buildSolveLatex();
    
    steps = (
      <div>
        <p className="mb-2"><strong>Gegeben:</strong></p>
        <ul className="list-disc list-inside mb-4">
          {task.unknown !== 'K0' && <li><InlineMath math={`K_0 = ${formatCurrency(K0)} €`} /></li>}
          {task.unknown !== 'Kn' && <li><InlineMath math={`K_n = ${formatCurrency(Kn!)} €`} /></li>}
          {task.unknown !== 'r' && <li><InlineMath math={`r = ${formatCurrency(r)} €`} /></li>}
          {task.unknown !== 'n' && <li><InlineMath math={`n = ${formatNumber(n, 1)} Jahre`} /></li>}
            <li><InlineMath math={`p = ${formatNumber(task.p)} \\% \\text{ p.a.} \\Rightarrow q = ${formatNumber(q, 4)}`} /></li>
          <li>Typ: {type === 'mehrung' ? 'Sparplan (Mehrung)' : 'Entnahmeplan (Minderung)'}</li>
          <li>Zahlung: {timing === 'vor' ? 'Vorschüssig' : 'Nachschüssig'}</li>
        </ul>
        
        <p className="mb-2"><strong>Grundformel:</strong></p>
        <div className="overflow-x-hidden mb-4 p-2 bg-gray-50 rounded border border-gray-200 text-[15px] leading-7 md:text-base">
          <BlockMath math={formulaBase} className="math-compact" />
        </div>

        <p className="mb-2"><strong>Einsetzen:</strong></p>
        <div className="mb-4 p-2 bg-gray-50 rounded border border-gray-200 text-[15px] leading-7 md:text-base overflow-x-hidden">
          <BlockMath math={substituted} className="math-compact" />
        </div>

        <p className="mb-2"><strong>Auflösen nach der gesuchten Größe:</strong></p>
        <div className="mb-4 p-2 bg-gray-50 rounded border border-gray-200 text-[15px] leading-7 md:text-base overflow-x-hidden">
          <BlockMath math={solveLatex} className="math-compact" />
        </div>
        
        <p className="mb-2"><strong>Ergebnis:</strong></p>
        <p>
          {task.unknown === 'Kn' && <InlineMath math={`K_n \\approx ${formatCurrency(task.solutionValue)} €`} />}
          {task.unknown === 'K0' && <InlineMath math={`K_0 \\approx ${formatCurrency(task.solutionValue)} €`} />}
          {task.unknown === 'r' && <InlineMath math={`r \\approx ${formatCurrency(task.solutionValue)} €`} />}
          {task.unknown === 'n' && (
            <InlineMath
              math={`n_{\\text{berechnet}} \\approx ${formatNumber(task.solutionRaw ?? task.solutionValue, 2)}\\ \\text{Jahre}\\;\\Rightarrow\\; n_{\\text{sachlogisch}} = ${formatNumber(task.solutionValue, 0)}\\ \\text{Jahre}`}
            />
          )}
        </p>
      </div>
    );

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
          <h1 className="text-3xl md:text-4xl font-bold text-blue-900 mb-2 text-center">Kapitalmehrung und - minderung</h1>
          <p className="text-gray-600 mb-6 text-center">Kombinierte Zinseszins- und Rentenrechnung</p>

          <div className="flex flex-wrap gap-2 mb-6 justify-center">
            <button onClick={() => setUnknownType('random')} className={`px-4 py-2 rounded font-bold transition ${unknownType === 'random' ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-700'}`}>Zufall</button>
            <button onClick={() => setUnknownType('Kn')} className={`px-4 py-2 rounded font-bold transition ${unknownType === 'Kn' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>Gesucht: <InlineMath math="K_n" /></button>
            <button onClick={() => setUnknownType('K0')} className={`px-4 py-2 rounded font-bold transition ${unknownType === 'K0' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>Gesucht: <InlineMath math="K_0" /></button>
            <button onClick={() => setUnknownType('r')} className={`px-4 py-2 rounded font-bold transition ${unknownType === 'r' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>Gesucht: <InlineMath math="r" /></button>
            <button onClick={() => setUnknownType('n')} className={`px-4 py-2 rounded font-bold transition ${unknownType === 'n' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>Gesucht: <InlineMath math="n" /></button>
          </div>

          {task && (
            <div className="w-full max-w-xl bg-slate-100 border border-slate-200 rounded-lg p-6 mb-4">
              <div className="text-lg mb-4 leading-relaxed">
                {task.question}
              </div>

              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-700 whitespace-nowrap">
                  Deine Antwort:
                </span>
                <input
                  ref={inputRef}
                  type="text"
                  className="flex-1 border-2 border-slate-300 rounded-lg p-2 text-lg focus:outline-blue-400"
                  value={userAnswer}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUserAnswer(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={task.unknown === 'n' ? 'z.B. 10' : 'z.B. 1234,56'}
                />
                <span className="text-xl font-bold text-gray-600">
                  {task.unknown === 'n' ? 'Jahre' : '€'}
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
            <div className="w-full max-w-2xl bg-blue-50 border border-blue-200 rounded p-4 text-blue-900 mb-2 text-base md:text-lg">
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

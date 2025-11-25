import React, { useEffect, useRef, useState } from 'react';

type Difficulty = 'easy' | 'medium' | 'hard';
type Op = '*' | ':';

interface Monomial {
  coeff: number;
  vars: string; // sorted characters, e.g. "axy"
}

interface Fraction {
  numerator: Monomial;
  denominator: Monomial;
}

interface Task {
  a: Fraction;
  b: Fraction;
  op: Op;
}

// Helper to count characters
const countChars = (str: string) => {
  const map: Record<string, number> = {};
  for (const char of str) map[char] = (map[char] || 0) + 1;
  return map;
};

const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b));

const parseMonomial = (input: string): Monomial => {
  const clean = input.replace(/\s+/g, '');
  if (!clean) return { coeff: NaN, vars: '' };
  
  const match = clean.match(/^(-?\d*)([a-z]*)$/i);
  if (!match) return { coeff: NaN, vars: '' };
  
  const coeffStr = match[1];
  const varsStr = match[2];
  
  let coeff = 1;
  if (coeffStr === '' || coeffStr === '+') {
    coeff = 1;
  } else if (coeffStr === '-') {
    coeff = -1;
  } else {
    coeff = parseInt(coeffStr, 10);
  }
  
  const vars = varsStr.split('').sort().join('');
  return { coeff, vars };
};

const formatMonomial = (m: Monomial): string => {
  if (isNaN(m.coeff)) return '?';
  if (m.coeff === 0) return '0';
  
  let str = '';
  if (m.vars === '') {
    return m.coeff.toString();
  } else {
    if (m.coeff === -1) str = '-';
    else if (m.coeff !== 1) str = m.coeff.toString();
  }
  str += m.vars;
  return str;
};

const multiplyMonomials = (m1: Monomial, m2: Monomial): Monomial => {
  return {
    coeff: m1.coeff * m2.coeff,
    vars: (m1.vars + m2.vars).split('').sort().join('')
  };
};

const simplifyFraction = (n: Monomial, d: Monomial) => {
  let nc = n.coeff;
  let dc = d.coeff;
  
  if (dc < 0) {
    nc = -nc;
    dc = -dc;
  }
  
  const gCoeff = gcd(nc, dc);
  const nCoeff = nc / gCoeff;
  const dCoeff = dc / gCoeff;
  
  const nMap = countChars(n.vars);
  const dMap = countChars(d.vars);
  const allVars = Array.from(new Set([...Object.keys(nMap), ...Object.keys(dMap)]));
  
  let nVarsNew = "";
  let dVarsNew = "";
  let gVars = "";
  
  allVars.forEach(v => {
    const countN = nMap[v] || 0;
    const countD = dMap[v] || 0;
    const min = Math.min(countN, countD);
    
    gVars += v.repeat(min);
    nVarsNew += v.repeat(countN - min);
    dVarsNew += v.repeat(countD - min);
  });
  
  nVarsNew = nVarsNew.split('').sort().join('');
  dVarsNew = dVarsNew.split('').sort().join('');
  gVars = gVars.split('').sort().join('');
  
  return {
    n: { coeff: nCoeff, vars: nVarsNew },
    d: { coeff: dCoeff, vars: dVarsNew },
    g: { coeff: gCoeff, vars: gVars }
  };
};

const r = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const pickVar = () => {
    const vars = ['x', 'y', 'a', 'b'];
    return vars[Math.floor(Math.random() * vars.length)];
};

function makeMonomial(level: Difficulty, isNum: boolean): Monomial {
    let coeff = 1;
    
    if (level === 'easy') {
        coeff = isNum ? r(1, 9) : r(2, 9);
    } else if (level === 'medium') {
        coeff = isNum ? r(2, 15) : r(2, 12);
    } else {
        coeff = isNum ? r(3, 25) : r(2, 20);
    }
    
    let vars = "";
    if (level === 'hard') {
        if (Math.random() < 0.6) {
            vars = pickVar();
            if (Math.random() < 0.2) {
                vars += pickVar();
                vars = vars.split('').sort().join('');
            }
        }
    }
    
    return { coeff, vars };
}

function makeFraction(level: Difficulty): Fraction {
  return {
    numerator: makeMonomial(level, true),
    denominator: makeMonomial(level, false)
  };
}

function FractionDisplay({ num, den }: { num: Monomial; den: Monomial }) {
  return (
    <span className="inline-block align-middle text-xl md:text-2xl mx-1">
      <span className="block border-b-2 border-black px-2">{formatMonomial(num)}</span>
      <span className="block px-2">{formatMonomial(den)}</span>
    </span>
  );
}

export default function Multiplizierendividieren() {
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [task, setTask] = useState<Task | null>(null);
  const [num, setNum] = useState('');
  const [den, setDen] = useState('');
  const [feedback, setFeedback] = useState<React.ReactNode | null>(null);
  const [feedbackType, setFeedbackType] = useState<'correct' | 'incorrect' | null>(null);
  const [solution, setSolution] = useState<React.ReactNode | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const numRef = useRef<HTMLInputElement>(null);

  useEffect(() => { newTask(difficulty); /* eslint-disable-line */ }, [difficulty]);

  function newTask(level: Difficulty) {
    const a = makeFraction(level);
    const b = makeFraction(level);
    const op: Op = Math.random() > 0.5 ? '*' : ':';
    setTask({ a, b, op });
    setNum(''); setDen(''); setFeedback(null); setFeedbackType(null); setSolution(null);
    setTimeout(() => numRef.current?.focus(), 50);
  }

  function compute(t: Task) {
    let n: Monomial, d: Monomial;
    if (t.op === '*') {
        n = multiplyMonomials(t.a.numerator, t.b.numerator);
        d = multiplyMonomials(t.a.denominator, t.b.denominator);
    } else {
        n = multiplyMonomials(t.a.numerator, t.b.denominator);
        d = multiplyMonomials(t.a.denominator, t.b.numerator);
    }
    
    const s = simplifyFraction(n, d);
    return { n: s.n, d: s.d, steps: { nRaw: n, dRaw: d, g: s.g } };
  }

  function check() {
    if (!task) return;
    
    const nParsed = parseMonomial(num);
    const dParsed = parseMonomial(den);
    
    if (isNaN(nParsed.coeff) || isNaN(dParsed.coeff)) {
        setFeedback('Bitte gib gültige Werte ein.');
        setFeedbackType('incorrect');
        return;
    }
    
    if (dParsed.coeff === 0) {
        setFeedback('Der Nenner darf nicht 0 sein.');
        setFeedbackType('incorrect');
        return;
    }
    
    setTotalCount(c => c + 1);
    const res = compute(task);
    
    // Compare
    const nCorrect = nParsed.coeff === res.n.coeff && nParsed.vars === res.n.vars;
    const dCorrect = dParsed.coeff === res.d.coeff && dParsed.vars === res.d.vars;
    
    if (nCorrect && dCorrect) {
        setFeedback('Richtig!');
        setFeedbackType('correct');
        setCorrectCount(c => c + 1);
        setStreak(s => s + 1);
    } else {
        setFeedback(
            <div className="flex items-center justify-center gap-2 flex-wrap">
                <span>Leider falsch. Die richtige Lösung ist:</span>
                <FractionDisplay num={res.n} den={res.d} />
            </div>
        );
        setFeedbackType('incorrect');
        setStreak(0);
    }
  }

  function showSolution() {
    if (!task) return;
    const res = compute(task);
    const opTxt = task.op === '*' ? '×' : '÷';
    
    setSolution(
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center flex-wrap justify-center gap-2">
          <FractionDisplay num={task.a.numerator} den={task.a.denominator} />
          <span className="text-xl">{opTxt}</span>
          <FractionDisplay num={task.b.numerator} den={task.b.denominator} />
          <span className="text-xl">=</span>
          <FractionDisplay num={res.steps.nRaw} den={res.steps.dRaw} />
        </div>
        <div className="text-sm text-gray-600">
          Kürzen mit GGT {formatMonomial(res.steps.g)}
        </div>
        <div className="flex items-center justify-center gap-2">
          <span className="text-xl">=</span>
          <FractionDisplay num={res.n} den={res.d} />
        </div>
      </div>
    );
    setFeedback(null); setFeedbackType(null);
  }

  function onKey(e: React.KeyboardEvent) { if (e.key === 'Enter') check(); }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-sky-100">
      <div className="flex-1 flex flex-col items-center justify-center w-full px-2 py-8 sm:px-8">
        <div className="bg-white rounded-2xl shadow-md border border-slate-200 w-full max-w-4xl min-h-[400px] flex flex-col items-center p-6 sm:p-12 md:p-16 lg:p-20 xl:p-24">
          <a href="/rechnen_lernen/brueche" className="text-blue-600 hover:underline mb-4 self-start">&larr; Zurück zur Bruch-Übersicht</a>
          <h1 className="text-3xl md:text-4xl font-bold text-blue-900 mb-2 text-center">Brüche multiplizieren und dividieren</h1>

          <div className="flex gap-2 mb-6">
            <button onClick={() => setDifficulty('easy')} className={`px-4 py-2 rounded font-bold transition ${difficulty === 'easy' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'}`}>Leicht</button>
            <button onClick={() => setDifficulty('medium')} className={`px-4 py-2 rounded font-bold transition ${difficulty === 'medium' ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-700'}`}>Mittel</button>
            <button onClick={() => setDifficulty('hard')} className={`px-4 py-2 rounded font-bold transition ${difficulty === 'hard' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'}`}>Schwer</button>
          </div>

          {task && (
            <div className="w-full max-w-xl bg-slate-100 border border-slate-200 rounded-lg p-6 mb-4 text-center">
              <div className="font-semibold text-blue-800 mb-2 text-base md:text-lg">Berechne die Lösung:</div>
              <div className="mb-4 text-2xl md:text-3xl flex items-center justify-center gap-4">
                <FractionDisplay num={task.a.numerator} den={task.a.denominator} />
                <span className="text-blue-500 text-2xl">{task.op === '*' ? '×' : '÷'}</span>
                <FractionDisplay num={task.b.numerator} den={task.b.denominator} />
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                <div className="flex flex-col items-center">
                  <input ref={numRef} type="text" className={`num w-24 text-center border-2 rounded-t-lg py-2 text-lg font-semibold focus:outline-blue-400 ${feedbackType === 'correct' ? 'border-green-400 bg-green-50' : feedbackType === 'incorrect' ? 'border-red-400 bg-red-50' : 'border-slate-300 bg-white'}`} value={num} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNum(e.target.value)} onKeyDown={onKey} placeholder="Zähler" />
                  <div className="fraction-line w-24 border-t-2 border-black" />
                  <input type="text" className={`den w-24 text-center border-2 rounded-b-lg py-2 text-lg font-semibold focus:outline-blue-400 ${feedbackType === 'correct' ? 'border-green-400 bg-green-50' : feedbackType === 'incorrect' ? 'border-red-400 bg-red-50' : 'border-slate-300 bg-white'}`} value={den} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDen(e.target.value)} onKeyDown={onKey} placeholder="Nenner" />
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-4 mb-4">
            <button onClick={check} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded shadow transition-colors">Überprüfen</button>
            <button onClick={showSolution} className="bg-gray-700 hover:bg-gray-800 text-white font-bold py-2 px-6 rounded shadow transition-colors">Lösung zeigen</button>
            <button onClick={() => newTask(difficulty)} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded shadow transition-colors">Nächste Aufgabe</button>
          </div>

          {feedback && (<div className={`w-full max-w-xl text-center font-semibold rounded p-3 mb-2 ${feedbackType === 'correct' ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-red-100 text-red-800 border border-red-300'}`}>{feedback}</div>)}
          {solution && (<div className="w-full max-w-xl bg-blue-50 border border-blue-200 rounded p-4 text-blue-900 mb-2 text-center text-base md:text-lg"><b>Musterlösung:</b> <br />{solution}</div>)}

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

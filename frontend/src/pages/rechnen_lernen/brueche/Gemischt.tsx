import React, { useEffect, useRef, useState } from 'react';

type Difficulty = 'easy' | 'medium' | 'hard';
type Op = '+' | '-' | '*' | ':';
interface Fr { n: number; d: number }
interface Task { a: Fr; b: Fr; op: Op }

const r = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const gcd = (a: number, b: number): number => (b === 0 ? Math.abs(a) : gcd(b, a % b));
const lcm = (a: number, b: number) => (a * b) / gcd(a, b);

function makeFr(level: Difficulty): Fr {
  switch (level) {
    case 'easy': return { n: r(1, 9) * (Math.random() > 0.5 ? 1 : -1), d: r(2, 9) };
    case 'medium': return { n: r(2, 18) * (Math.random() > 0.5 ? 1 : -1), d: r(2, 15) };
    case 'hard': return { n: r(3, 28) * (Math.random() > 0.5 ? 1 : -1), d: r(2, 20) };
    default: return { n: r(1, 9), d: r(2, 9) };
  }
}

function Frac({ n, d }: { n: number; d: number }) {
  return (
    <span className="inline-block align-middle text-xl md:text-2xl mx-1">
      <span className="block border-b-2 border-black px-2">{n}</span>
      <span className="block px-2">{d}</span>
    </span>
  );
}

export default function Gemischt() {
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [task, setTask] = useState<Task | null>(null);
  const [n, setN] = useState('');
  const [d, setD] = useState('');
  const [fb, setFb] = useState<string | null>(null);
  const [fbType, setFbType] = useState<'correct' | 'incorrect' | null>(null);
  const [sol, setSol] = useState<string | null>(null);
  const [ok, setOk] = useState(0);
  const [tot, setTot] = useState(0);
  const [streak, setStreak] = useState(0);
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => { next(difficulty); /* eslint-disable-line */ }, [difficulty]);

  function next(level: Difficulty) {
    const a = makeFr(level), b = makeFr(level);
    const ops: Op[] = ['+', '-', '*', ':'];
    const op = ops[r(0, ops.length - 1)];
    setTask({ a, b, op });
    setN(''); setD(''); setFb(null); setFbType(null); setSol(null);
    setTimeout(() => ref.current?.focus(), 50);
  }

  function result(t: Task) {
    if (t.op === '*' || t.op === ':') {
      let nn: number, dd: number;
      if (t.op === '*') { nn = t.a.n * t.b.n; dd = t.a.d * t.b.d; }
      else { nn = t.a.n * t.b.d; dd = t.a.d * t.b.n; }
      const g = gcd(nn, dd); return { n: nn / g, d: dd / g, raw: { nn, dd, g } };
    } else {
      const c = lcm(t.a.d, t.b.d); const m1 = c / t.a.d; const m2 = c / t.b.d;
      const a1 = t.a.n * m1; const a2 = t.b.n * m2; const nn = t.op === '+' ? a1 + a2 : a1 - a2; const dd = c;
      const g = gcd(Math.abs(nn), dd); return { n: nn / g, d: dd / g, raw: { c, a1, a2, nn, dd, g } };
    }
  }

  function check() {
    if (!task) return;
    const ni = parseInt(n, 10), di = parseInt(d, 10);
    if (isNaN(ni) || isNaN(di) || di === 0) { setFb('Bitte gib gültige ganze Zahlen ein (Nenner ≠ 0).'); setFbType('incorrect'); return; }
    setTot(t => t + 1);
    const rres = result(task);
    if (ni === rres.n && di === rres.d) { setFb('Richtig!'); setFbType('correct'); setOk(o => o + 1); setStreak(s => s + 1); }
    else { setFb(`Leider falsch. Die richtige Lösung ist ${rres.n}/${rres.d}.`); setFbType('incorrect'); setStreak(0); }
  }

  function show() {
    if (!task) return;
    const rr = result(task);
    let txt = '';
    if (task.op === '*' || task.op === ':') {
      const op = task.op === '*' ? '×' : '÷';
      txt = `${task.a.n}/${task.a.d} ${op} ${task.b.n}/${task.b.d} = ${rr.raw.nn}/${rr.raw.dd} → GGT ${rr.raw.g} → ${rr.n}/${rr.d}`;
    } else {
      const op = task.op;
      txt = `${task.a.n}/${task.a.d} ${op} ${task.b.n}/${task.b.d} = ${rr.raw.a1}/${rr.raw.c} ${op} ${rr.raw.a2}/${rr.raw.c} = ${rr.raw.nn}/${rr.raw.dd} → GGT ${rr.raw.g} → ${rr.n}/${rr.d}`;
    }
    setSol(txt); setFb(null); setFbType(null);
  }

  function onKey(e: React.KeyboardEvent) { if (e.key === 'Enter') check(); }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-sky-100">
      <div className="flex-1 flex flex-col items-center justify-center w-full px-2 py-8 sm:px-8">
        <div className="bg-white rounded-2xl shadow-md border border-slate-200 w-full max-w-4xl min-h-[400px] flex flex-col items-center p-6 sm:p-12 md:p-16 lg:p-20 xl:p-24">
          <a href="/rechnen_lernen/brueche" className="text-blue-600 hover:underline mb-4 self-start">&larr; Zurück zur Bruch-Übersicht</a>
          <h1 className="text-3xl md:text-4xl font-bold text-blue-900 mb-2 text-center">Gemischte Bruchaufgaben</h1>

          <div className="flex gap-2 mb-6">
            <button onClick={() => setDifficulty('easy')} className={`px-4 py-2 rounded font-bold transition ${difficulty === 'easy' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'}`}>Leicht</button>
            <button onClick={() => setDifficulty('medium')} className={`px-4 py-2 rounded font-bold transition ${difficulty === 'medium' ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-700'}`}>Mittel</button>
            <button onClick={() => setDifficulty('hard')} className={`px-4 py-2 rounded font-bold transition ${difficulty === 'hard' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'}`}>Schwer</button>
          </div>

          {task && (
            <div className="w-full max-w-xl bg-slate-100 border border-slate-200 rounded-lg p-6 mb-4 text-center">
              <div className="font-semibold text-blue-800 mb-2 text-base md:text-lg">Berechne die Lösung:</div>
              <div className="mb-4 text-2xl md:text-3xl flex items-center justify-center gap-4">
                <Frac n={task.a.n} d={task.a.d} />
                <span className="text-blue-500 text-2xl">{task.op === '*' ? '×' : task.op === ':' ? '÷' : task.op}</span>
                <Frac n={task.b.n} d={task.b.d} />
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                <div className="flex flex-col items-center">
                  <input ref={ref} type="number" className={`num w-20 text-center border-2 rounded-t-lg py-2 text-lg font-semibold focus:outline-blue-400 ${fbType === 'correct' ? 'border-green-400 bg-green-50' : fbType === 'incorrect' ? 'border-red-400 bg-red-50' : 'border-slate-300 bg-white'}`} value={n} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setN(e.target.value)} onKeyDown={onKey} placeholder="Zähler" />
                  <div className="fraction-line w-20 border-t-2 border-black" />
                  <input type="number" className={`den w-20 text-center border-2 rounded-b-lg py-2 text-lg font-semibold focus:outline-blue-400 ${fbType === 'correct' ? 'border-green-400 bg-green-50' : fbType === 'incorrect' ? 'border-red-400 bg-red-50' : 'border-slate-300 bg-white'}`} value={d} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setD(e.target.value)} onKeyDown={onKey} placeholder="Nenner" min={1} />
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-4 mb-4">
            <button onClick={check} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded shadow transition-colors">Überprüfen</button>
            <button onClick={show} className="bg-gray-700 hover:bg-gray-800 text-white font-bold py-2 px-6 rounded shadow transition-colors">Lösung zeigen</button>
            <button onClick={() => next(difficulty)} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded shadow transition-colors">Nächste Aufgabe</button>
          </div>

          {fb && (<div className={`w-full max-w-xl text-center font-semibold rounded p-3 mb-2 ${fbType === 'correct' ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-red-100 text-red-800 border border-red-300'}`}>{fb}</div>)}
          {sol && (<div className="w-full max-w-xl bg-blue-50 border border-blue-200 rounded p-4 text-blue-900 mb-2 text-center text-base md:text-lg"><b>Musterlösung:</b> <br />{sol}</div>)}

          <div className="flex flex-wrap justify-center gap-8 mt-6 w-full max-w-2xl">
            <div className="flex flex-col items-center"><div className="text-2xl font-bold text-blue-800">{ok}</div><div className="text-gray-600 text-sm">Richtig</div></div>
            <div className="flex flex-col items-center"><div className="flex items-center text-2xl font-bold text-orange-500"><span role="img" aria-label="Streak">🔥</span>{streak}</div><div className="text-gray-600 text-sm">Streak</div></div>
            <div className="flex flex-col items-center"><div className="text-2xl font-bold text-blue-800">{tot}</div><div className="text-gray-600 text-sm">Gesamt</div></div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';

type Level = 1 | 2 | 3 | 4;
type Term = { coeff: number; base: string; exp: number };
type Question = { html: string; options: string[]; correct: string };

function r(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function formatTerm({ coeff, base, exp }: Term, isFirst = false): string {
  let s = '';
  const abs = Math.abs(coeff);
  if (coeff < 0) s += isFirst ? '-' : ' - ';
  else if (!isFirst) s += ' + ';
  // zeige Koeffizient nur, wenn nötig (1 wird bei Basis mit Exp>0 weggelassen)
  if (abs !== 1 || !base || exp === 0) s += `${abs}`;
  s += base;
  if (base && exp !== 0 && exp !== 1) s += `<sup>${exp}</sup>`;
  return s;
}

function formatExpression(terms: Term[]): string {
  let out = '';
  terms.forEach((t, i) => { out += formatTerm(t, i === 0); });
  return out + ' = ?';
}

function genQuestion(level: Level): Question {
  const vars = ['a','b','c','x','y','z','m','n','p','k'];
  const numTerms = level === 1 ? 2 : level === 2 ? r(2,3) : level === 3 ? 3 : r(3,4);
  const base = vars[r(0, vars.length - 1)];
  const exp = level === 1 ? r(2,5) : level === 2 ? r(2,7) : level === 3 ? r(3,9) : r(4,12);
  const allowDecimals = level === 4 && Math.random() < 0.3;
  const coeffRange = level === 1 ? [1,10] : level === 2 ? [-10,10] : level === 3 ? [-15,15] : [-20,20];

  const terms: Term[] = [];
  let sum = 0;
  for (let i=0;i<numTerms;i++) {
    let c: number;
    do {
      if (allowDecimals) {
        c = Math.round((r(coeffRange[0]*10, coeffRange[1]*10))/10);
      } else {
        c = r(coeffRange[0], coeffRange[1]);
      }
    } while (c === 0);
    terms.push({ coeff: c, base, exp });
    sum = allowDecimals ? Math.round((sum + c)*10)/10 : sum + c;
  }
  if (sum === 0) { // vermeide 0-Ergebnis
    const last = terms[terms.length-1];
    last.coeff += allowDecimals ? 0.1 : (Math.random()<0.5?1:-1);
    sum = terms.reduce((a,t)=> allowDecimals? Math.round((a+t.coeff)*10)/10 : a + t.coeff, 0);
    if (allowDecimals) sum = Math.round(sum*10)/10;
  }

  const html = formatExpression(terms);
  const correct = formatTerm({ coeff: sum, base, exp }, true).replace(/\s*[+-]\s*$/, '').trim();

  // Optionen bauen
  const opts = new Set<string>();
  opts.add(correct);
  while (opts.size < 4) {
    const type = r(1,3);
    let wrongCoeff = sum;
    let wrongExp = exp;
    if (type === 1) wrongCoeff = allowDecimals ? Math.round((sum + (Math.random()<0.5?-0.5:0.5))*10)/10 : sum + (Math.random()<0.5?-2:2);
    else if (type === 2 && exp > 1) wrongExp = exp + (Math.random()<0.5?-1:1);
    else wrongCoeff = allowDecimals ? Math.round((sum + (Math.random()<0.5?-0.3:0.3))*10)/10 : sum + (Math.random()<0.5?-1:1);
    if (wrongCoeff === 0) wrongCoeff = 1;
    const f = formatTerm({ coeff: wrongCoeff, base, exp: wrongExp }, true).replace(/\s*[+-]\s*$/, '').trim();
    if (f !== correct) opts.add(f);
  }
  const options = Array.from(opts);
  // shuffle
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }
  return { html, options, correct };
}

export default function Addierensubtrahieren() {
  const [level, setLevel] = useState<Level>(1);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [correctInLevel, setCorrectInLevel] = useState(0);
  const [q, setQ] = useState<Question | null>(null);
  const [feedback, setFeedback] = useState('');

  useEffect(() => { setQ(genQuestion(level)); setFeedback(''); /* eslint-disable-line */ }, [level]);

  function next() { setQ(genQuestion(level)); setFeedback(''); }

  function check(ans: string) {
    if (!q) return;
    const ok = ans === q.correct;
    setAnswered(n=> n+1);
    if (ok) { setFeedback('✅ Richtig!'); setScore(s=> s + 10*level); setStreak(s=> s+1); setCorrectInLevel(c=> c+1); }
    else { setFeedback('❌ Falsch.'); setStreak(0); }
    // Levelaufstieg
    const total = answered + 1;
    const corr = correctInLevel + (ok?1:0);
    if (total >= 5) {
      const acc = corr / total;
      if (acc >= 0.8 && level < 4) {
        setLevel((l)=> (l+1) as Level);
        setAnswered(0); setCorrectInLevel(0);
      }
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-sky-100">
      <div className="flex-1 flex flex-col items-center justify-center w-full px-2 py-8 sm:px-8">
        <div className="bg-white rounded-2xl shadow-md border border-slate-200 w-full max-w-3xl md:max-w-4xl min-h-[520px] flex flex-col items-center p-6 sm:p-12 md:p-16 lg:p-20 xl:p-24">
          <a href="/rechnen_lernen/potenzen" className="text-blue-600 hover:underline mb-4 self-start">&larr; Zurück zur Potenz-Übersicht</a>
          <h1 className="text-3xl md:text-4xl font-bold text-blue-900 mb-2 text-center">Potenzen addieren & subtrahieren</h1>

          <div className="w-full max-w-2xl bg-slate-100 border border-slate-200 rounded-lg p-4 mb-4 text-center">
            <div className="text-sm text-slate-700 mb-2">Fasse so weit wie möglich zusammen. Addition/Subtraktion nur bei identischer Basis und identischem Exponenten.</div>
            <div className="text-xl md:text-2xl font-semibold text-blue-800 min-h-[64px] flex items-center justify-center" dangerouslySetInnerHTML={{ __html: q?.html || '' }} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl mb-2">
            {q?.options.map((opt, i) => (
              <button key={i} onClick={()=> check(opt)} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded shadow text-base md:text-lg" dangerouslySetInnerHTML={{ __html: opt }} />
            ))}
          </div>

          <div className="flex gap-3 mb-2">
            <button onClick={next} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded shadow">Nächste Frage</button>
            <div className="text-sm text-slate-600 self-center">Level: {['Einfach','Mittel','Schwer','Ultimativ'][level-1]} · Punkte: {score} · Streak: {streak}</div>
          </div>

          {feedback && (<div className={`w-full max-w-2xl text-center font-semibold rounded p-3 ${feedback.startsWith('✅')? 'bg-green-100 text-green-800 border border-green-300':'bg-red-100 text-red-800 border border-red-300'}`}>{feedback}</div>)}
        </div>
      </div>
    </div>
  );
}

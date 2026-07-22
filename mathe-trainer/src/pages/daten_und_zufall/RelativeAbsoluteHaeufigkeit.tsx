import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, RefreshCw, AlignLeft, Table2, Hash, BarChart3, PieChart as PieChartIcon, Lightbulb } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { generateTask, checkAnswer, GeneratedTask } from './haeufigkeit/generator';

const COLORS = ['#6366f1', '#f43f5e', '#10b981', '#f59e0b', '#0ea5e9', '#a855f7'];

const REPRESENTATION_LABEL: Record<GeneratedTask['representation'], { label: string; icon: React.ReactNode }> = {
  text: { label: 'Sachtext', icon: <AlignLeft className="w-4 h-4" /> },
  table: { label: 'Tabelle', icon: <Table2 className="w-4 h-4" /> },
  tally: { label: 'Strichliste', icon: <Hash className="w-4 h-4" /> },
  chart: { label: 'Diagramm', icon: <BarChart3 className="w-4 h-4" /> },
};

const TallyBundle: React.FC<{ strokes: number }> = ({ strokes }) => {
  const spacing = 7;
  const lines: React.ReactNode[] = [];
  for (let i = 0; i < Math.min(strokes, 4); i++) {
    lines.push(
      <line key={i} x1={4 + i * spacing} y1={2} x2={4 + i * spacing} y2={26} stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" />
    );
  }
  if (strokes === 5) {
    lines.push(
      <line key="diag" x1={0} y1={28} x2={4 + 3 * spacing + 3} y2={0} stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" />
    );
  }
  const width = 4 + 3 * spacing + 8;
  return (
    <svg width={width} height={30} viewBox={`0 0 ${width} 30`} className="text-indigo-600 flex-shrink-0">
      {lines}
    </svg>
  );
};

const TallyMarks: React.FC<{ count: number }> = ({ count }) => {
  const fullBundles = Math.floor(count / 5);
  const remainder = count % 5;
  const bundles = [...Array(fullBundles).fill(5), ...(remainder > 0 ? [remainder] : [])];
  if (count === 0) return <span className="text-slate-400 text-sm">–</span>;
  return (
    <div className="flex flex-wrap items-end gap-2">
      {bundles.map((s, idx) => (
        <span key={idx} className="inline-flex">
          <TallyBundle strokes={s} />
        </span>
      ))}
    </div>
  );
};

const RelativeAbsoluteHaeufigkeit: React.FC = () => {
  const [task, setTask] = useState<GeneratedTask>(() => generateTask());
  const [answer, setAnswer] = useState('');
  const [status, setStatus] = useState<'blank' | 'correct' | 'incorrect'>('blank');
  const [showSolution, setShowSolution] = useState(false);
  const [stats, setStats] = useState({ attempted: 0, correct: 0 });

  const newTask = () => {
    setTask(generateTask());
    setAnswer('');
    setStatus('blank');
    setShowSolution(false);
  };

  const handleCheck = () => {
    const isCorrect = checkAnswer(task, answer);
    setStatus(isCorrect ? 'correct' : 'incorrect');
    setStats((prev) => ({ attempted: prev.attempted + 1, correct: prev.correct + (isCorrect ? 1 : 0) }));
  };

  const repInfo = REPRESENTATION_LABEL[task.representation];
  const revealedCategories = task.categories.filter((c) => c.revealed);
  const chartData = revealedCategories.map((c) => ({ name: c.name, value: c.count }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link to="/daten-und-zufall" className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-2">
            <ArrowLeft className="w-5 h-5" />
            Zurück
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Absolute und relative Häufigkeit</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Session-Statistik */}
        <div className="flex justify-between items-center mb-6 text-sm font-semibold text-slate-600">
          <span className="inline-flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full shadow-sm border border-slate-100">
            {repInfo.icon}
            {repInfo.label}-Aufgabe
          </span>
          <span>
            {stats.correct} von {stats.attempted} richtig
          </span>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-6">
          {/* Aufgabentext */}
          <div className="mb-6 space-y-2">
            {task.intro.map((line, idx) => (
              <p key={idx} className="text-slate-700 leading-relaxed">
                {line}
              </p>
            ))}
          </div>

          {/* Darstellung der Daten */}
          {task.representation === 'table' && (
            <div className="mb-6 overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-indigo-50">
                    <th className="text-left p-3 rounded-l-lg font-semibold text-slate-700 border-b-2 border-indigo-200">Kategorie</th>
                    <th className="text-right p-3 rounded-r-lg font-semibold text-slate-700 border-b-2 border-indigo-200">Anzahl</th>
                  </tr>
                </thead>
                <tbody>
                  {task.categories.map((c) => (
                    <tr key={c.name} className="border-b border-slate-100">
                      <td className="p-3 text-slate-700">
                        <span className="mr-2">{c.icon}</span>
                        {c.name}
                      </td>
                      <td className="p-3 text-right font-mono font-semibold text-slate-900">{c.count}</td>
                    </tr>
                  ))}
                  <tr>
                    <td className="p-3 font-bold text-slate-900">Gesamt</td>
                    <td className="p-3 text-right font-mono font-bold text-slate-900">{task.total}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {task.representation === 'tally' && (
            <div className="mb-6 space-y-4 bg-slate-50 rounded-lg p-4 border border-slate-200">
              {task.categories.map((c) => (
                <div key={c.name} className="flex items-center gap-4">
                  <span className="w-36 flex-shrink-0 text-slate-700 font-medium">
                    <span className="mr-1.5">{c.icon}</span>
                    {c.name}
                  </span>
                  <TallyMarks count={c.count} />
                </div>
              ))}
              <div className="pt-2 border-t border-slate-200 text-sm text-slate-500">Gesamt: {task.total}</div>
            </div>
          )}

          {task.representation === 'chart' && (
            <div className="mb-6 h-72 bg-slate-50 rounded-lg border border-slate-200 p-2">
              <div className="flex items-center gap-2 text-xs text-slate-400 px-2 pt-1">
                {task.chartKind === 'pie' ? <PieChartIcon className="w-3.5 h-3.5" /> : <BarChart3 className="w-3.5 h-3.5" />}
                {task.chartKind === 'pie' ? 'Kreisdiagramm' : 'Balkendiagramm'}
              </div>
              <ResponsiveContainer width="100%" height="100%">
                {task.chartKind === 'pie' ? (
                  <PieChart>
                    <Pie data={chartData} cx="50%" cy="50%" outerRadius={85} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                      {chartData.map((_, idx) => (
                        <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                ) : (
                  <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="value">
                      {chartData.map((_, idx) => (
                        <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          )}

          {/* Frage */}
          <div className="mb-6">
            <p className="text-lg font-semibold text-slate-900 mb-4">{task.questionText}</p>
            <input
              type="text"
              value={answer}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setAnswer(e.target.value);
                setStatus('blank');
              }}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === 'Enter' && answer && status === 'blank') handleCheck();
              }}
              placeholder={task.answerFormat === 'percentOrDecimal' ? 'z.B. 25% oder 0,25' : 'Antwort eingeben...'}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-lg"
            />
          </div>

          {/* Feedback */}
          {status !== 'blank' && (
            <div
              className={`flex items-start gap-3 p-4 rounded-lg mb-6 ${
                status === 'correct' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              }`}
            >
              {status === 'correct' ? (
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <p className={`font-semibold ${status === 'correct' ? 'text-green-800' : 'text-red-800'}`}>
                  {status === 'correct' ? 'Richtig!' : 'Noch nicht ganz richtig'}
                </p>
                {status === 'correct' && (
                  <div className="mt-2 space-y-1">
                    {task.solutionSteps.map((step, idx) => (
                      <p key={idx} className="text-sm text-green-700">
                        {step}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Lösung anzeigen */}
          {status !== 'correct' && (
            <button
              onClick={() => setShowSolution(!showSolution)}
              className="w-full mb-4 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors inline-flex items-center justify-center gap-2"
            >
              <Lightbulb className="w-4 h-4" />
              {showSolution ? 'Lösung verstecken' : 'Lösung anzeigen'}
            </button>
          )}

          {showSolution && status !== 'correct' && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 space-y-1">
              {task.solutionSteps.map((step, idx) => (
                <p key={idx} className="text-amber-800 text-sm">
                  {step}
                </p>
              ))}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            {status === 'blank' && (
              <button
                onClick={handleCheck}
                disabled={!answer}
                className="flex-1 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold rounded-lg transition-colors"
              >
                Antwort prüfen
              </button>
            )}
            <button
              onClick={newTask}
              className="flex-1 px-6 py-3 border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold rounded-lg transition-colors inline-flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Neue Aufgabe
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RelativeAbsoluteHaeufigkeit;

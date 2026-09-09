import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ALL_TASKS } from '../../lib/excel-trainer/tasks';
import { useExcelSession } from '../../lib/excel-trainer/ExcelSessionContext';

const difficultyLabel: Record<string, string> = {
  einfach: 'Einfach',
  mittel: 'Mittel',
  schwer: 'Schwer',
};

export default function ExcelTaskSelect() {
  const navigate = useNavigate();
  const { recording, startRecording } = useExcelSession();
  const [recordingChoiceMade, setRecordingChoiceMade] = useState(false);

  const chooseRecording = (record: boolean) => {
    if (record) startRecording();
    setRecordingChoiceMade(true);
  };

  const goToTask = (taskId: string) => {
    navigate(`/digitale-bildung/excel-trainer/${taskId}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-gradient-to-br from-slate-800 to-slate-700 text-white py-8 px-4 text-center relative">
        <Link
          to="/digitale-bildung"
          className="absolute top-4 left-4 text-slate-300 hover:text-white flex items-center gap-2 text-sm font-medium transition-colors"
        >
          ← Digitale Bildung
        </Link>
        <h1 className="text-2xl font-bold">📊 Excel-Trainer</h1>
        <p className="text-slate-300 text-sm mt-1">Wähle eine Übung aus.</p>
      </header>

      <main className="flex-1 w-full max-w-3xl mx-auto p-6 flex flex-col gap-6">
        {!recordingChoiceMade ? (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 text-center">
            <h2 className="text-lg font-bold text-slate-800 mb-2">Fortschritt aufzeichnen?</h2>
            <p className="text-sm text-slate-600 mb-5 max-w-md mx-auto">
              Wenn du aufzeichnest, wird deine Bearbeitungszeit und dein Ergebnis festgehalten. Am Ende kannst du dir
              ein PDF als Arbeitsnachweis herunterladen – praktisch für freie Arbeitsphasen oder Hausaufgaben.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => chooseRecording(true)}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm"
              >
                Ja, aufzeichnen
              </button>
              <button
                onClick={() => chooseRecording(false)}
                className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-semibold text-sm"
              >
                Nein, ohne Aufzeichnung
              </button>
            </div>
          </div>
        ) : (
          <div
            className={`text-sm rounded-lg px-4 py-2 flex items-center gap-2 ${
              recording ? 'bg-slate-100 text-slate-700 border border-slate-200' : 'bg-slate-50 text-slate-500'
            }`}
          >
            {recording ? (
              <>
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                Aufzeichnung aktiv – deine Ergebnisse werden festgehalten.
              </>
            ) : (
              'Du arbeitest ohne Aufzeichnung.'
            )}
            <button onClick={() => setRecordingChoiceMade(false)} className="ml-auto underline text-slate-500 hover:text-slate-700">
              ändern
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {ALL_TASKS.map((task) => (
            <button
              key={task.id}
              onClick={() => goToTask(task.id)}
              className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 text-left hover:-translate-y-0.5 hover:shadow-md transition-all"
            >
              <span className="inline-block text-xs font-semibold uppercase tracking-wide text-blue-600 bg-blue-50 rounded-full px-2 py-1 mb-2">
                {difficultyLabel[task.difficulty] ?? task.difficulty}
              </span>
              <h3 className="text-base font-bold text-slate-800 mb-1">{task.title}</h3>
              <p className="text-sm text-slate-500 line-clamp-2">{task.instruction[0]}</p>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}

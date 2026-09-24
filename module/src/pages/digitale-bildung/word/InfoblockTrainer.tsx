import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { INFOBLOCK_TASKS, getInfoblockTaskById } from '../../../lib/geschaeftsbrief/infoblock-tasks';
import { isValidName, deriveInitials, deriveEmail, isTodayGerman } from '../../../lib/geschaeftsbrief/infoblock-types';
import { InfoblockTippsButton } from './InfoblockTipps';

const difficultyLabel: Record<string, string> = {
  einfach: 'Einfach',
  mittel: 'Mittel',
  schwer: 'Schwer',
};

export default function InfoblockTrainer() {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const task = taskId ? getInfoblockTaskById(taskId) : undefined;
  const [values, setValues] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);
  const [loadedTaskId, setLoadedTaskId] = useState(taskId);

  useEffect(() => {
    if (!task) {
      navigate('/digitale-bildung/word/geschaeftsbrief/infoblock/uebersicht', { replace: true });
    }
  }, [task, navigate]);

  if (taskId !== loadedTaskId) {
    setLoadedTaskId(taskId);
    setValues({});
    setChecked(false);
  }

  if (!task) return null;

  const taskIndex = INFOBLOCK_TASKS.findIndex((t) => t.id === task.id);
  const nextTask = INFOBLOCK_TASKS[taskIndex + 1];
  const gradableLines = task.lines;
  const nameValue = values['name'] ?? '';

  const changeGraded = (lineId: string, text: string) => {
    setValues((prev) => ({ ...prev, [lineId]: text }));
    setChecked(false);
  };

  const isLineCorrect = (line: (typeof task.lines)[number]): boolean => {
    const value = values[line.id] ?? '';
    if (line.type === 'text') {
      return value.trim() === line.expected.trim();
    }
    if (line.type === 'name') {
      return isValidName(value);
    }
    if (line.type === 'zeichen') {
      const studentInitials = deriveInitials(nameValue);
      if (!studentInitials) return false;
      return value.trim() === `${line.bossInitials}-${studentInitials}`;
    }
    if (line.type === 'email') {
      const expected = deriveEmail(nameValue, line.domain);
      if (!expected) return false;
      return value.trim() === expected;
    }
    if (line.type === 'date') {
      return isTodayGerman(value);
    }
    return true;
  };

  const isRequired = (line: (typeof task.lines)[number]): boolean => {
    if (line.type === 'text') return line.expected.trim() !== '';
    return true;
  };

  const allAnswered = task.lines.filter(isRequired).every((line) => (values[line.id] ?? '').trim() !== '');
  const correctCount = gradableLines.filter((line) => isLineCorrect(line)).length;
  const allCorrect = checked && correctCount === gradableLines.length;

  const renderRow = (line: (typeof task.lines)[number]) => {
    const value = values[line.id] ?? '';
    const correct = isLineCorrect(line);
    // Show a result even for an intentionally empty "text" field (expected === '').
    const showResult = checked && (value.trim() !== '' || (line.type === 'text' && line.expected === ''));
    const placeholder = 'placeholder' in line ? line.placeholder : undefined;
    return (
      <div key={line.id}>
        <div className="grid grid-cols-[130px_1fr] gap-x-3 items-center">
          <label className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 leading-tight">
            {line.caption}
          </label>
          <input
            type="text"
            value={value}
            onChange={(e) => changeGraded(line.id, e.target.value)}
            placeholder={placeholder}
            className={`w-full px-3 py-2 rounded-lg text-sm font-mono border-2 transition-all outline-none ${
              showResult
                ? correct
                  ? 'bg-green-50 border-green-400 text-green-800'
                  : 'bg-red-50 border-red-400 text-red-800'
                : 'bg-white border-slate-200 text-slate-800 focus:border-blue-400'
            }`}
          />
        </div>
        {showResult && (
          <div className="grid grid-cols-[130px_1fr] gap-x-3">
            <div />
            <p
              className={`mt-1 text-xs rounded-lg px-3 py-2 ${
                correct ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
              }`}
            >
              {line.explanation}
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-gradient-to-br from-slate-800 to-slate-700 text-white py-6 px-4 relative">
        <div className="max-w-6xl mx-auto flex flex-col items-center text-center">
          <Link
            to="/digitale-bildung/word/geschaeftsbrief/infoblock/uebersicht"
            className="absolute top-4 left-4 text-slate-300 hover:text-white flex items-center gap-2 text-sm font-medium transition-colors"
          >
            ← Aufgabenübersicht
          </Link>
          <InfoblockTippsButton className="absolute top-4 right-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold bg-white/10 hover:bg-white/20 text-white transition-colors" />
          <span className="inline-block text-xs font-semibold uppercase tracking-wide text-blue-200 bg-white/10 rounded-full px-2 py-1 mb-2">
            {difficultyLabel[task.difficulty] ?? task.difficulty}
          </span>
          <h1 className="text-xl font-bold">{task.title}</h1>
        </div>
      </header>

      <main className="flex-1 w-full max-w-6xl mx-auto p-6 flex flex-col gap-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 mb-2">📝 Arbeitsauftrag</p>
          {task.arbeitsauftrag.split('\n\n').map((absatz, i) => (
            <p key={i} className="text-slate-700 mb-2 last:mb-0 whitespace-pre-line">
              {absatz}
            </p>
          ))}
        </div>

        {/* Briefseite: Anschriftenfeld und Infoblock nebeneinander, wie auf einem echten Briefbogen */}
        <div className="bg-white rounded-xl border-2 border-slate-300 shadow-sm p-6 md:p-10">
          <div className="flex flex-col md:flex-row md:items-start gap-8 md:gap-16">
            {/* Anschriftenfeld (Kontext) */}
            <div className="w-full md:w-[360px] shrink-0 md:sticky md:top-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Anschriftenfeld</p>
              <div className="border border-dashed border-slate-300 rounded-lg p-3 bg-slate-50 font-mono">
                <div className="text-[10px] text-slate-500 mb-1">{task.senderLine}</div>
                <div className="border-t border-slate-300 my-1" />
                {task.empfaengerLines.map((line) => (
                  <div key={line} className="text-sm text-slate-800">
                    {line}
                  </div>
                ))}
              </div>
            </div>

            {/* Infoblock: direkt ausfüllbar */}
            <div className="w-full md:w-[460px] shrink-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">Infoblock</p>
              <div className="flex flex-col gap-3">
                {task.lines.map((line, i) => (
                  <div key={line.id}>
                    {renderRow(line)}
                    {(i === 3 || i === 7) && <div className="h-1" />}
                  </div>
                ))}
              </div>

              <div className="mt-5 pt-4 border-t border-slate-200">
                <div className="text-sm font-semibold text-slate-600 mb-3">
                  {checked ? `${correctCount} / ${gradableLines.length} Felder korrekt` : 'Noch nicht geprüft'}
                </div>
                <button
                  onClick={() => setChecked(true)}
                  disabled={!allAnswered}
                  className={`w-full px-4 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                    allAnswered
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  Prüfen
                </button>
                {!allAnswered && (
                  <p className="mt-2 text-xs text-slate-400 text-center">
                    Fülle alle Felder aus, die eine Angabe benötigen, bevor du prüfst.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="hidden md:block mt-10 pt-6 border-t border-dashed border-slate-200 text-xs text-slate-300 text-center">
            (Brieftext folgt hier im weiteren Verlauf des Geschäftsbriefs …)
          </div>
        </div>

        {allCorrect && (
          <div className="bg-green-50 border-2 border-green-400 rounded-xl p-5 text-center">
            <p className="text-green-800 font-semibold mb-3">🎉 Super! Der Infoblock ist korrekt ausgefüllt.</p>
            {nextTask ? (
              <button
                onClick={() => navigate(`/digitale-bildung/word/geschaeftsbrief/infoblock/${nextTask.id}`)}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm"
              >
                Nächste Aufgabe →
              </button>
            ) : (
              <Link
                to="/digitale-bildung/word/geschaeftsbrief/infoblock/uebersicht"
                className="inline-block px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm"
              >
                Zur Aufgabenübersicht
              </Link>
            )}
          </div>
        )}
        {checked && !allCorrect && (
          <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-5 text-center">
            <p className="text-amber-800 font-semibold">
              Noch nicht ganz richtig ({correctCount} / {gradableLines.length}). Korrigiere die rot markierten Felder
              und klicke erneut auf „Prüfen“.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

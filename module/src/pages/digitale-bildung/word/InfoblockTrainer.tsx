import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { INFOBLOCK_TASKS, getInfoblockTaskById } from '../../../lib/geschaeftsbrief/infoblock-tasks';
import { isValidName, deriveInitials, deriveEmail } from '../../../lib/geschaeftsbrief/infoblock-types';
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
  const gradableLines = task.lines.filter((line) => line.type !== 'freitext');

  const chooseOption = (lineId: string, optionId: string) => {
    setValues((prev) => ({ ...prev, [lineId]: optionId }));
    setChecked(false);
  };

  const changeGraded = (lineId: string, text: string) => {
    setValues((prev) => ({ ...prev, [lineId]: text }));
    setChecked(false);
  };

  const changeFreitext = (lineId: string, text: string) => {
    setValues((prev) => ({ ...prev, [lineId]: text }));
  };

  const nameValue = values['name'] ?? '';

  // "Unser Zeichen" and "E-Mail" are derived from "Name", so ask for the name first.
  const editOrder = [...task.lines].sort((a, b) => (a.id === 'name' ? -1 : b.id === 'name' ? 1 : 0));

  const isLineCorrect = (line: (typeof task.lines)[number]): boolean => {
    const value = values[line.id] ?? '';
    if (line.type === 'choice') {
      return line.options.find((o) => o.id === value)?.correct ?? false;
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
    return true;
  };

  const allAnswered = gradableLines.every((line) => (values[line.id] ?? '').trim() !== '');
  const correctCount = gradableLines.filter((line) => isLineCorrect(line)).length;
  const allCorrect = checked && correctCount === gradableLines.length;

  const previewText = (line: (typeof task.lines)[number]): string => {
    const value = values[line.id] ?? '';
    if (line.type === 'choice') {
      return line.options.find((o) => o.id === value)?.text ?? '';
    }
    return value;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-gradient-to-br from-slate-800 to-slate-700 text-white py-6 px-4 relative">
        <div className="max-w-5xl mx-auto flex flex-col items-center text-center">
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

      <main className="flex-1 w-full max-w-5xl mx-auto p-6 flex flex-col gap-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 mb-2">📝 Arbeitsauftrag</p>
          {task.arbeitsauftrag.split('\n\n').map((absatz, i) => (
            <p key={i} className="text-slate-700 mb-2 last:mb-0 whitespace-pre-line">
              {absatz}
            </p>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,320px)_1fr] gap-6 items-start">
          {/* Briefkopf-Vorschau: Anschriftenfeld + Infoblock */}
          <div className="flex flex-col gap-4 lg:sticky lg:top-6">
            <div className="bg-white rounded-xl border-2 border-slate-300 shadow-sm p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">
                Anschriftenfeld (Kontext)
              </p>
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

            <div className="bg-white rounded-xl border-2 border-slate-300 shadow-sm p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Infoblock</p>
              <div className="border border-dashed border-slate-300 rounded-lg p-3 bg-slate-50 font-mono flex flex-col gap-1">
                {task.lines.map((line, i) => {
                  const value = previewText(line);
                  const correct = line.type !== 'freitext' && isLineCorrect(line);
                  const showResult = checked && line.type !== 'freitext';
                  return (
                    <div key={line.id}>
                      <div className="text-[10px] text-slate-500">{line.caption}:</div>
                      <div
                        className={`text-sm min-h-[16px] ${
                          !value
                            ? 'text-slate-300'
                            : showResult
                              ? correct
                                ? 'text-green-700 font-medium'
                                : 'text-red-600 font-medium'
                              : 'text-slate-800 font-medium'
                        }`}
                      >
                        {value || '…'}
                      </div>
                      {(i === 3 || i === 7) && <div className="h-2" />}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-xl border-2 border-slate-300 shadow-sm p-4">
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
                  Fülle alle bewerteten Felder aus, bevor du prüfst.
                </p>
              )}
            </div>
          </div>

          {/* Eingabe je Feld */}
          <div className="flex flex-col gap-4">
            {editOrder.map((line) => {
              if (line.type === 'choice') {
                const chosenId = values[line.id];
                const correct = isLineCorrect(line);
                return (
                  <div key={line.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                    <p className="text-sm font-semibold text-slate-700 mb-3">{line.caption}</p>
                    <div className="flex flex-wrap gap-2">
                      {line.options.map((option) => {
                        const selected = chosenId === option.id;
                        const showResult = checked && selected;
                        return (
                          <button
                            key={option.id}
                            onClick={() => chooseOption(line.id, option.id)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium border-2 transition-all ${
                              showResult
                                ? option.correct
                                  ? 'bg-green-100 text-green-800 border-green-400'
                                  : 'bg-red-100 text-red-800 border-red-400'
                                : selected
                                  ? 'bg-blue-100 text-blue-800 border-blue-400'
                                  : 'bg-slate-50 text-slate-700 border-transparent hover:border-slate-200'
                            }`}
                          >
                            {showResult && (option.correct ? '✅ ' : '❌ ')}
                            {option.text}
                          </button>
                        );
                      })}
                    </div>
                    {checked && chosenId && (
                      <p
                        className={`mt-3 text-sm rounded-lg px-3 py-2 ${
                          correct ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                        }`}
                      >
                        {line.explanation}
                      </p>
                    )}
                  </div>
                );
              }

              if (line.type === 'zeichen' || line.type === 'name' || line.type === 'email') {
                const value = values[line.id] ?? '';
                const correct = isLineCorrect(line);
                const showResult = checked && value.trim() !== '';
                return (
                  <div key={line.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                    <p className="text-sm font-semibold text-slate-700 mb-3">{line.caption}</p>
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => changeGraded(line.id, e.target.value)}
                      placeholder={line.placeholder}
                      className={`w-full max-w-xs px-3 py-2 rounded-lg text-sm font-mono border-2 transition-all outline-none ${
                        showResult
                          ? correct
                            ? 'bg-green-100 text-green-800 border-green-400'
                            : 'bg-red-100 text-red-800 border-red-400'
                          : 'bg-slate-50 text-slate-800 border-slate-200 focus:border-blue-400'
                      }`}
                    />
                    {showResult && (
                      <p
                        className={`mt-3 text-sm rounded-lg px-3 py-2 ${
                          correct ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                        }`}
                      >
                        {line.explanation}
                      </p>
                    )}
                  </div>
                );
              }

              const value = values[line.id] ?? '';
              return (
                <div key={line.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <p className="text-sm font-semibold text-slate-700">{line.caption}</p>
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 bg-slate-100 rounded-full px-2 py-0.5">
                      nicht bewertet
                    </span>
                  </div>
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => changeFreitext(line.id, e.target.value)}
                    placeholder={line.placeholder}
                    className="w-full max-w-xs px-3 py-2 rounded-lg text-sm font-mono border-2 border-slate-200 bg-slate-50 text-slate-800 focus:border-blue-400 outline-none"
                  />
                  <p className="mt-3 text-sm text-slate-500">{line.hint}</p>
                </div>
              );
            })}
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

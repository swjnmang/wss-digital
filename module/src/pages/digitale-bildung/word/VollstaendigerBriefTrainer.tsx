import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  VOLLSTAENDIGER_BRIEF_TASKS,
  getVollstaendigerBriefTaskById,
} from '../../../lib/geschaeftsbrief/vollstaendiger-brief-tasks';
import { allLines } from '../../../lib/geschaeftsbrief/vollstaendiger-brief-types';
import type { ChoiceLine } from '../../../lib/geschaeftsbrief/line-types';

const difficultyLabel: Record<string, string> = {
  einfach: 'Einfach',
  mittel: 'Mittel',
  schwer: 'Schwer',
};

export default function VollstaendigerBriefTrainer() {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const task = taskId ? getVollstaendigerBriefTaskById(taskId) : undefined;
  const [values, setValues] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);
  const [loadedTaskId, setLoadedTaskId] = useState(taskId);

  useEffect(() => {
    if (!task) {
      navigate('/digitale-bildung/word/geschaeftsbrief/vollstaendiger-brief/uebersicht', { replace: true });
    }
  }, [task, navigate]);

  if (taskId !== loadedTaskId) {
    setLoadedTaskId(taskId);
    setValues({});
    setChecked(false);
  }

  if (!task) return null;

  const lines = allLines(task) as ChoiceLine[];
  const taskIndex = VOLLSTAENDIGER_BRIEF_TASKS.findIndex((t) => t.id === task.id);
  const nextTask = VOLLSTAENDIGER_BRIEF_TASKS[taskIndex + 1];

  const choose = (lineId: string, optionId: string) => {
    setValues((prev) => ({ ...prev, [lineId]: optionId }));
    setChecked(false);
  };

  const getLine = (id: string) => lines.find((l) => l.id === id);
  const optionText = (id: string) => {
    const line = getLine(id);
    const chosen = values[id];
    return line?.options.find((o) => o.id === chosen)?.text ?? '';
  };
  const isCorrect = (id: string) => {
    const line = getLine(id);
    const chosen = values[id];
    return line?.options.find((o) => o.id === chosen)?.correct ?? false;
  };

  const allAnswered = lines.every((line) => values[line.id]);
  const correctCount = lines.filter((line) => isCorrect(line.id)).length;
  const allCorrect = checked && correctCount === lines.length;

  const previewCell = (id: string) => {
    const text = optionText(id);
    if (!text) return { text: '…', tone: 'empty' as const };
    if (!checked) return { text, tone: 'neutral' as const };
    return { text, tone: isCorrect(id) ? ('correct' as const) : ('wrong' as const) };
  };

  const toneClass: Record<string, string> = {
    empty: 'text-slate-300',
    neutral: 'text-slate-800 font-medium',
    correct: 'text-green-700 font-medium',
    wrong: 'text-red-600 font-medium',
  };

  const blank = <div className="text-slate-300">(Leerzeile)</div>;

  const grussformelRows = [
    { key: 'gruss', cell: previewCell('gruss') },
    { key: 'b1', blank: true },
    { key: 'branche', cell: previewCell('branche') },
    { key: 'firma', cell: previewCell('firma') },
    { key: 'b2', blank: true },
    { key: 'mitte', cell: getLine('mittlere-leerzeile') ? previewCell('mittlere-leerzeile') : null, blank: !getLine('mittlere-leerzeile') },
    { key: 'b3', blank: true },
    { key: 'name-gruss', cell: previewCell('name-gruss') },
  ];

  const renderSection = (title: string, sectionLines: ChoiceLine[]) => (
    <section className="flex flex-col gap-4">
      <h2 className="text-base font-bold text-slate-800">{title}</h2>
      {sectionLines.map((line) => {
        const chosenId = values[line.id];
        const correct = isCorrect(line.id);
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
                    onClick={() => choose(line.id, option.id)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium border-2 transition-all text-left ${
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
      })}
    </section>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-gradient-to-br from-slate-800 to-slate-700 text-white py-6 px-4 relative">
        <div className="max-w-6xl mx-auto flex flex-col items-center text-center">
          <Link
            to="/digitale-bildung/word/geschaeftsbrief/vollstaendiger-brief/uebersicht"
            className="absolute top-4 left-4 text-slate-300 hover:text-white flex items-center gap-2 text-sm font-medium transition-colors"
          >
            ← Aufgabenübersicht
          </Link>
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

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,320px)_1fr] gap-6 items-start">
          {/* Briefvorschau */}
          <div className="flex flex-col gap-4 lg:sticky lg:top-6">
            <div className="bg-white rounded-xl border-2 border-slate-300 shadow-sm p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Anschriftenfeld</p>
              <div className="border border-dashed border-slate-300 rounded-lg p-3 bg-slate-50 font-mono text-sm">
                <div className="text-[10px] text-slate-500 mb-1">{task.senderLine}</div>
                <div className="border-t border-slate-300 my-1" />
                {task.anschriftenfeld.map((line) => {
                  const { text, tone } = previewCell(line.id);
                  return (
                    <div key={line.id} className={toneClass[tone]}>
                      {text}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-xl border-2 border-slate-300 shadow-sm p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Infoblock</p>
              <div className="border border-dashed border-slate-300 rounded-lg p-3 bg-slate-50 font-mono flex flex-col gap-1">
                {task.infoblock.map((line, i) => {
                  const { text, tone } = previewCell(line.id);
                  return (
                    <div key={line.id}>
                      <div className="text-[10px] text-slate-500">{line.caption.replace('Infoblock – ', '')}:</div>
                      <div className={`text-sm min-h-[16px] ${toneClass[tone]}`}>{text}</div>
                      {i === 3 && <div className="h-2" />}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-xl border-2 border-slate-300 shadow-sm p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Betreff &amp; Anrede</p>
              <div className="border border-dashed border-slate-300 rounded-lg p-3 bg-slate-50 font-mono text-sm flex flex-col gap-2">
                <div className={toneClass[previewCell('betreff').tone]}>{previewCell('betreff').text}</div>
                <div>{blank}</div>
                <div className={toneClass[previewCell('anrede').tone]}>{previewCell('anrede').text}</div>
              </div>
            </div>

            <div className="bg-white rounded-xl border-2 border-slate-300 shadow-sm p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">Grußformel-Block</p>
              <div className="border border-dashed border-slate-300 rounded-lg p-3 bg-slate-50 font-mono text-sm">
                {grussformelRows.map((row) =>
                  row.blank ? (
                    <div key={row.key}>{blank}</div>
                  ) : (
                    <div key={row.key} className={toneClass[row.cell!.tone]}>
                      {row.cell!.text}
                    </div>
                  ),
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl border-2 border-slate-300 shadow-sm p-4">
              <div className="text-sm font-semibold text-slate-600 mb-3">
                {checked ? `${correctCount} / ${lines.length} Felder korrekt` : 'Noch nicht geprüft'}
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
                  Fülle alle Felder aus, bevor du prüfst.
                </p>
              )}
            </div>
          </div>

          {/* Eingabe */}
          <div className="flex flex-col gap-8">
            {renderSection('1. Anschriftenfeld', task.anschriftenfeld as ChoiceLine[])}
            {renderSection('2. Infoblock', task.infoblock as ChoiceLine[])}
            {renderSection('3. Betreff', task.betreff as ChoiceLine[])}
            {renderSection('4. Anrede', task.anrede as ChoiceLine[])}
            {renderSection('5. Grußformel & Unterschrift', task.grussformel as ChoiceLine[])}
          </div>
        </div>

        {allCorrect && (
          <div className="bg-green-50 border-2 border-green-400 rounded-xl p-5 text-center">
            <p className="text-green-800 font-semibold mb-3">🎉 Super! Der komplette Geschäftsbrief ist korrekt.</p>
            {nextTask ? (
              <button
                onClick={() => navigate(`/digitale-bildung/word/geschaeftsbrief/vollstaendiger-brief/${nextTask.id}`)}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm"
              >
                Nächste Aufgabe →
              </button>
            ) : (
              <Link
                to="/digitale-bildung/word/geschaeftsbrief/vollstaendiger-brief/uebersicht"
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
              Noch nicht ganz richtig ({correctCount} / {lines.length}). Korrigiere die rot markierten Felder und
              klicke erneut auf „Prüfen“.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

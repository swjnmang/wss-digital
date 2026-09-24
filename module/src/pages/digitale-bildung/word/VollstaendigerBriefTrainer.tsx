import { useEffect, useState } from 'react';
import type { ClipboardEvent, MouseEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  VOLLSTAENDIGER_BRIEF_TASKS,
  getVollstaendigerBriefTaskById,
} from '../../../lib/geschaeftsbrief/vollstaendiger-brief-tasks';
import { allLineFields, brieftextMatches } from '../../../lib/geschaeftsbrief/vollstaendiger-brief-types';
import { AnschriftenfeldTippsButton } from './AnschriftenfeldTipps';
import { InfoblockTippsButton } from './InfoblockTipps';

const difficultyLabel: Record<string, string> = {
  einfach: 'Einfach',
  mittel: 'Mittel',
  schwer: 'Schwer',
};

interface SimpleLine {
  id: string;
  caption: string;
  expected: string;
  explanation: string;
  placeholder?: string;
  zone?: 'zusatz' | 'anschrift';
}

function preventCopy(e: ClipboardEvent | MouseEvent) {
  e.preventDefault();
}

export default function VollstaendigerBriefTrainer() {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const task = taskId ? getVollstaendigerBriefTaskById(taskId) : undefined;
  const [values, setValues] = useState<Record<string, string>>({});
  const [brieftext, setBrieftext] = useState('');
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
    setBrieftext('');
    setChecked(false);
  }

  if (!task) return null;

  const lines = allLineFields(task) as SimpleLine[];
  const taskIndex = VOLLSTAENDIGER_BRIEF_TASKS.findIndex((t) => t.id === task.id);
  const nextTask = VOLLSTAENDIGER_BRIEF_TASKS[taskIndex + 1];

  const change = (lineId: string, text: string) => {
    setValues((prev) => ({ ...prev, [lineId]: text }));
    setChecked(false);
  };

  const isLineCorrect = (line: SimpleLine) => (values[line.id] ?? '').trim() === line.expected.trim();
  const isBrieftextCorrect = () => brieftextMatches(brieftext, task.brieftextReferenz);

  const isRequired = (line: SimpleLine) => line.expected.trim() !== '';
  const allAnswered =
    lines.filter(isRequired).every((line) => (values[line.id] ?? '').trim() !== '') && brieftext.trim() !== '';

  const totalFields = lines.length + 1; // +1 for the Brieftext
  const correctCount = lines.filter(isLineCorrect).length + (isBrieftextCorrect() ? 1 : 0);
  const allCorrect = checked && correctCount === totalFields;

  const renderRow = (line: SimpleLine) => {
    const value = values[line.id] ?? '';
    const correct = isLineCorrect(line);
    const showResult = checked && (value.trim() !== '' || line.expected === '');
    const small = line.zone === 'zusatz';
    return (
      <div key={line.id}>
        <div className="grid grid-cols-[170px_1fr] gap-x-3 items-center">
          <label className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 leading-tight">
            {line.caption}
          </label>
          <input
            type="text"
            value={value}
            onChange={(e) => change(line.id, e.target.value)}
            placeholder={line.placeholder}
            className={`w-full px-3 py-2 rounded-lg font-mono border-2 transition-all outline-none ${
              small ? 'text-xs' : 'text-sm'
            } ${
              showResult
                ? correct
                  ? 'bg-green-50 border-green-400 text-green-800'
                  : 'bg-red-50 border-red-400 text-red-800'
                : 'bg-white border-slate-200 text-slate-800 focus:border-blue-400'
            }`}
          />
        </div>
        {showResult && (
          <div className="grid grid-cols-[170px_1fr] gap-x-3">
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

  const renderSection = (title: string, sectionLines: SimpleLine[]) => (
    <div className="bg-white rounded-xl border-2 border-slate-300 shadow-sm p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">{title}</p>
      <div className="flex flex-col gap-3">{sectionLines.map(renderRow)}</div>
    </div>
  );

  const brieftextShowResult = checked && brieftext.trim() !== '';
  const brieftextOk = isBrieftextCorrect();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-gradient-to-br from-slate-800 to-slate-700 text-white py-6 px-4 relative">
        <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
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

      <main className="flex-1 w-full max-w-4xl mx-auto p-6 flex flex-col gap-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 mb-2">📝 Arbeitsauftrag</p>
          {task.arbeitsauftrag.split('\n\n').map((absatz, i) => (
            <p key={i} className="text-slate-700 mb-2 last:mb-0 whitespace-pre-line">
              {absatz}
            </p>
          ))}
        </div>

        <div className="flex flex-col gap-5">
          {renderSection('1. Anschriftenfeld', task.anschriftenfeld as SimpleLine[])}
          {renderSection('2. Infoblock', task.infoblock as SimpleLine[])}
          {renderSection('3. Betreff', task.betreff as SimpleLine[])}
          {renderSection('4. Anrede', task.anrede as SimpleLine[])}

          {/* Brieftext: Referenztext anzeigen (nicht kopierbar), Student tippt selbst ab */}
          <div className="bg-white rounded-xl border-2 border-slate-300 shadow-sm p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">5. Brieftext</p>
            <p className="text-xs text-slate-500 mb-2">
              Lies den vorgegebenen Brieftext und tippe ihn vollständig und wortgenau in das Textfeld darunter ab. Der
              Text lässt sich nicht kopieren – du musst ihn selbst schreiben.
            </p>
            <div
              className="bg-slate-50 border border-dashed border-slate-300 rounded-lg p-4 mb-3 text-sm text-slate-700 leading-relaxed flex flex-col gap-3"
              style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
              onCopy={preventCopy}
              onCut={preventCopy}
              onContextMenu={preventCopy}
            >
              {task.brieftextReferenz.map((absatz, i) => (
                <p key={i}>{absatz}</p>
              ))}
            </div>
            <textarea
              value={brieftext}
              onChange={(e) => {
                setBrieftext(e.target.value);
                setChecked(false);
              }}
              onPaste={preventCopy}
              rows={8}
              placeholder="Tippe hier den Brieftext ab …"
              className={`w-full px-3 py-2 rounded-lg text-sm border-2 transition-all outline-none leading-relaxed ${
                brieftextShowResult
                  ? brieftextOk
                    ? 'bg-green-50 border-green-400 text-green-800'
                    : 'bg-red-50 border-red-400 text-red-800'
                  : 'bg-white border-slate-200 text-slate-800 focus:border-blue-400'
              }`}
            />
            {brieftextShowResult && (
              <p
                className={`mt-2 text-xs rounded-lg px-3 py-2 ${
                  brieftextOk ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                }`}
              >
                {brieftextOk
                  ? 'Der Brieftext stimmt (kleine Abweichungen bei Leerzeichen werden toleriert).'
                  : 'Der abgetippte Text weicht noch vom vorgegebenen Brieftext ab. Vergleiche jedes Wort und jedes Satzzeichen genau.'}
              </p>
            )}
          </div>

          {renderSection('6. Grußformel & Unterschrift', task.grussformel as SimpleLine[])}

          <div className="bg-white rounded-xl border-2 border-slate-300 shadow-sm p-5">
            <div className="text-sm font-semibold text-slate-600 mb-3">
              {checked ? `${correctCount} / ${totalFields} Felder korrekt` : 'Noch nicht geprüft'}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setChecked(true)}
                disabled={!allAnswered}
                className={`flex-1 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                  allAnswered
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                Prüfen
              </button>
              <AnschriftenfeldTippsButton className="px-4 py-2.5 rounded-lg text-sm font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors whitespace-nowrap" />
              <InfoblockTippsButton className="px-4 py-2.5 rounded-lg text-sm font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors whitespace-nowrap" />
            </div>
            {!allAnswered && (
              <p className="mt-2 text-xs text-slate-400 text-center">
                Fülle alle Felder sowie den Brieftext aus, bevor du prüfst.
              </p>
            )}
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
              Noch nicht ganz richtig ({correctCount} / {totalFields}). Korrigiere die rot markierten Felder und
              klicke erneut auf „Prüfen“.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

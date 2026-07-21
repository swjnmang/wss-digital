import React, { useCallback, useEffect, useRef, useState } from 'react';
import { checkAnswer, hasFactorOutsideBrackets } from './terme/termAlgebra';
import { KATEGORIEN, GeneratedTask } from './terme/termAufgaben';

const AUFGABEN_PRO_SET = 8;

function generiereSet(katIndex: number, stufeIndex: number): GeneratedTask[] {
  const gen = KATEGORIEN[katIndex].stufen[stufeIndex].generate;
  const list: GeneratedTask[] = [];
  const seen = new Set<string>();
  let guard = 0;
  while (list.length < AUFGABEN_PRO_SET && guard < 300) {
    guard++;
    const t = gen();
    const key = `${t.frage ?? ''}|${t.ausdruck}`;
    if (seen.has(key)) continue;
    seen.add(key);
    list.push(t);
  }
  return list;
}

const TermeZusammenfassen: React.FC = () => {
  const [katIndex, setKatIndex] = useState(0);
  const [stufeIndex, setStufeIndex] = useState(0);
  const [tasks, setTasks] = useState<GeneratedTask[]>(() => generiereSet(0, 0));
  const [answers, setAnswers] = useState<Record<string, { value: string; isCorrect: boolean | null }>>({});
  const [choiceAnswers, setChoiceAnswers] = useState<Record<string, number>>({});
  const [showSolutions, setShowSolutions] = useState<Record<string, boolean>>({});
  const [zeigeAbschlussDialog, setZeigeAbschlussDialog] = useState(false);

  const kategorie = KATEGORIEN[katIndex];
  const stufe = kategorie.stufen[stufeIndex];
  const hatNaechsteStufe = stufeIndex < kategorie.stufen.length - 1;

  const dialogGezeigtRef = useRef(false);

  const neueAufgaben = useCallback((kIdx: number, sIdx: number) => {
    dialogGezeigtRef.current = false;
    setZeigeAbschlussDialog(false);
    setTasks(generiereSet(kIdx, sIdx));
    setAnswers({});
    setChoiceAnswers({});
    setShowSolutions({});
  }, []);

  useEffect(() => {
    neueAufgaben(katIndex, stufeIndex);
  }, [katIndex, stufeIndex, neueAufgaben]);

  const handleInputChange = (task: GeneratedTask, value: string) => {
    const trimmed = value.trim();
    let isCorrect: boolean | null = null;
    if (trimmed) {
      isCorrect = checkAnswer(trimmed, task.expected);
      if (isCorrect && task.requireBracket && !hasFactorOutsideBrackets(trimmed)) {
        isCorrect = false;
      }
    }
    setAnswers((prev) => ({ ...prev, [task.id]: { value, isCorrect } }));
  };

  const handleChoice = (task: GeneratedTask, idx: number) => {
    setChoiceAnswers((prev) => (task.id in prev ? prev : { ...prev, [task.id]: idx }));
  };

  const toggleSolution = (taskId: string) => {
    setShowSolutions((prev) => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  const istRichtig = (task: GeneratedTask): boolean => {
    if (task.format === 'auswahl') {
      return choiceAnswers[task.id] !== undefined && choiceAnswers[task.id] === task.correctChoice;
    }
    return answers[task.id]?.isCorrect === true;
  };

  const richtigCount = tasks.filter(istRichtig).length;
  const prozent = tasks.length ? Math.round((richtigCount / tasks.length) * 100) : 0;

  const istBeantwortet = (task: GeneratedTask): boolean => {
    if (task.format === 'auswahl') return choiceAnswers[task.id] !== undefined;
    return (answers[task.id]?.value ?? '').trim() !== '';
  };

  useEffect(() => {
    if (dialogGezeigtRef.current || tasks.length === 0) return;
    if (!tasks.every(istBeantwortet)) return;
    dialogGezeigtRef.current = true;
    setZeigeAbschlussDialog(true);
    // Bewusst nur an tasks/answers/choiceAnswers gekoppelt (nicht an stufeIndex/kategorie):
    // Beim Stufenwechsel ändert sich stufeIndex einen Render *bevor* die neuen (leeren)
    // tasks/answers ankommen – wäre stufeIndex mit in den Deps, würde der Effekt kurz mit
    // altem, bereits vollständig beantwortetem Set laufen und den Dialog fälschlich erneut zeigen.
  }, [tasks, answers, choiceAnswers]);

  const zurNaechstenStufe = () => {
    setZeigeAbschlussDialog(false);
    setStufeIndex((i) => i + 1);
  };

  const stufeWiederholen = () => {
    neueAufgaben(katIndex, stufeIndex);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50 p-3">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-orange-900 mb-1">Terme zusammenfassen</h1>
          <p className="text-xs text-gray-600">
            Wähle eine Kategorie und eine Stufe. Die Stufen bauen aufeinander auf – jede Aufgabe
            wird neu für dich erzeugt. Sind alle 8 Aufgaben beantwortet, entscheidest du, wie es
            weitergeht.
          </p>
        </div>

        {/* Kategorie-Tabs */}
        <div className="flex flex-wrap gap-2 mb-3">
          {KATEGORIEN.map((kat, index) => (
            <button
              key={kat.name}
              onClick={() => {
                setKatIndex(index);
                setStufeIndex(0);
              }}
              className={`px-3 py-1 text-sm rounded font-semibold transition-all ${
                katIndex === index
                  ? 'bg-orange-500 text-white shadow-lg'
                  : 'bg-white text-gray-700 border border-gray-300 hover:border-orange-300'
              }`}
            >
              {kat.name}
            </button>
          ))}
        </div>

        {/* Stufen */}
        <div className="flex flex-wrap gap-2 mb-2">
          {kategorie.stufen.map((s, index) => (
            <button
              key={s.name}
              onClick={() => setStufeIndex(index)}
              className={`px-3 py-1 text-xs rounded-full font-semibold transition-all ${
                stufeIndex === index
                  ? 'bg-orange-600 text-white shadow'
                  : 'bg-orange-100 text-orange-900 hover:bg-orange-200'
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <p className="text-sm text-gray-700">{stufe.beschreibung}</p>
          <button
            onClick={() => neueAufgaben(katIndex, stufeIndex)}
            className="px-3 py-1 text-sm bg-orange-500 text-white rounded font-semibold hover:bg-orange-600 transition-all shadow"
          >
            Neue Aufgaben
          </button>
        </div>

        {/* Eingabe-Tipps */}
        <div className="mb-3 px-3 py-2 bg-orange-100/70 border border-orange-200 rounded text-xs text-orange-900">
          <span className="font-semibold">Eingabe-Tipps:</span> Potenzen als x² oder x^2 · das
          Mal-Zeichen kannst du weglassen (3x) · Dezimalzahlen mit Komma oder Punkt · die
          Reihenfolge der Terme ist egal.
        </div>

        {/* Aufgaben */}
        <div className="space-y-1">
          {tasks.map((task, index) => {
            const answer = answers[task.id] || { value: '', isCorrect: null };
            const showSolution = showSolutions[task.id] || false;
            const chosen = choiceAnswers[task.id];
            const beantwortet = chosen !== undefined;

            return (
              <div key={task.id} className="space-y-1">
                <div className="bg-white rounded p-2 shadow border-l-2 border-orange-300">
                  {task.frage && (
                    <p className="text-sm text-gray-700 mb-1">
                      <span className="font-bold text-gray-600">{index + 1})</span> {task.frage}
                    </p>
                  )}

                  {task.format === 'eingabe' ? (
                    <div className="flex items-center gap-2 flex-wrap">
                      {!task.frage && (
                        <span className="text-sm font-bold text-gray-600 whitespace-nowrap">
                          {index + 1})
                        </span>
                      )}
                      {task.ausdruck && (
                        <div className="text-sm font-mono bg-gray-50 px-2 py-1 rounded border border-gray-200 whitespace-nowrap">
                          {task.ausdruck}
                        </div>
                      )}
                      <span className="text-sm font-bold text-gray-500 whitespace-nowrap">
                        {task.eingabeLabel ?? '='}
                      </span>
                      <input
                        type="text"
                        placeholder="..."
                        value={answer.value}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          handleInputChange(task, e.target.value)
                        }
                        className={`flex-1 min-w-[8rem] px-2 py-1 rounded border-2 font-mono text-sm transition-all ${
                          answer.isCorrect === null
                            ? 'border-gray-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-200'
                            : answer.isCorrect
                            ? 'border-green-500 bg-green-50 focus:ring-1 focus:ring-green-200'
                            : 'border-red-500 bg-red-50 focus:ring-1 focus:ring-red-200'
                        }`}
                      />
                      <div className="w-5 h-5 flex items-center justify-center">
                        {answer.isCorrect === true && (
                          <span className="text-green-600 font-bold text-sm">✓</span>
                        )}
                        {answer.isCorrect === false && (
                          <span className="text-red-600 font-bold text-sm">✗</span>
                        )}
                      </div>
                      <button
                        onClick={() => toggleSolution(task.id)}
                        className="text-sm px-2 py-1 bg-orange-500 text-white rounded hover:bg-orange-600 transition-all whitespace-nowrap font-semibold"
                      >
                        {showSolution ? '✕' : '?'}
                      </button>
                    </div>
                  ) : (
                    <div>
                      {task.ausdruck && (
                        <div className="text-sm font-mono bg-gray-50 px-2 py-1 rounded border border-gray-200 mb-2 overflow-x-auto">
                          {task.ausdruck}
                        </div>
                      )}
                      <div className="flex flex-col gap-1">
                        {task.choices?.map((c, idx) => {
                          const istKorrekt = idx === task.correctChoice;
                          let cls =
                            'text-left text-sm px-2 py-1 rounded border transition-all font-mono ';
                          if (!beantwortet) {
                            cls += 'bg-white border-gray-300 hover:border-orange-400 hover:bg-orange-50';
                          } else if (istKorrekt) {
                            cls += 'bg-green-50 border-green-500 text-green-900';
                          } else if (chosen === idx) {
                            cls += 'bg-red-50 border-red-500 text-red-900';
                          } else {
                            cls += 'bg-white border-gray-200 text-gray-400';
                          }
                          return (
                            <button
                              key={idx}
                              disabled={beantwortet}
                              onClick={() => handleChoice(task, idx)}
                              className={cls}
                            >
                              {c}
                            </button>
                          );
                        })}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {beantwortet && (
                          <span
                            className={`text-sm font-semibold ${
                              chosen === task.correctChoice ? 'text-green-600' : 'text-red-600'
                            }`}
                          >
                            {chosen === task.correctChoice ? '✓ Richtig!' : '✗ Leider falsch.'}
                          </span>
                        )}
                        <button
                          onClick={() => toggleSolution(task.id)}
                          className="text-sm px-2 py-1 bg-orange-500 text-white rounded hover:bg-orange-600 transition-all whitespace-nowrap font-semibold"
                        >
                          {showSolution ? '✕' : '?'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Rechenweg */}
                {showSolution && (
                  <div className="p-2 bg-orange-50 rounded border-l-2 border-orange-400 text-sm ml-8">
                    <div className="space-y-0.5">
                      {task.rechenweg.map((schritt, i) => (
                        <p key={i} className="text-gray-700">
                          {i > 0 && '→ '} {schritt}
                        </p>
                      ))}
                    </div>
                    <p className="font-semibold text-orange-900 mt-1">
                      Lösung: <span className="font-mono bg-white px-1 rounded">{task.loesungText}</span>
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Fortschritt */}
        <div className="mt-4 p-3 bg-white rounded shadow border border-gray-200">
          <p className="text-sm font-semibold text-gray-800">
            Fortschritt: {richtigCount} / {tasks.length} korrekt
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div
              className="bg-orange-500 h-2 rounded-full transition-all"
              style={{ width: `${tasks.length ? (richtigCount / tasks.length) * 100 : 0}%` }}
            ></div>
          </div>
        </div>

        {/* Abschluss-Dialog: Stufe komplett beantwortet */}
        {zeigeAbschlussDialog && (
          <div
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
            role="button"
            tabIndex={0}
            aria-label="Dialog schließen"
            onClick={() => setZeigeAbschlussDialog(false)}
            onKeyDown={(e: React.KeyboardEvent) => {
              if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') {
                setZeigeAbschlussDialog(false);
              }
            }}
          >
            {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/click-events-have-key-events */}
            <div
              className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 relative"
              role="dialog"
              aria-modal="true"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              <button
                onClick={() => setZeigeAbschlussDialog(false)}
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-sm"
                aria-label="Schließen"
              >
                ✕
              </button>
              <h2 className="text-lg font-bold text-orange-900 mb-2">Stufe geschafft!</h2>
              <p className="text-sm text-gray-700 mb-1">
                Du hast <span className="font-semibold">{richtigCount} von {tasks.length}</span>{' '}
                Aufgaben in „{stufe.name}&quot; richtig gelöst.
              </p>
              <p className="text-3xl font-bold text-orange-600 mb-4">{prozent}%</p>
              <div className="flex flex-col gap-2">
                {hatNaechsteStufe ? (
                  <button
                    onClick={zurNaechstenStufe}
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-all shadow"
                  >
                    Weiter zu „{kategorie.stufen[stufeIndex + 1].name}&quot;
                  </button>
                ) : (
                  <p className="text-sm text-green-700 font-semibold text-center">
                    Du hast die höchste Stufe dieser Kategorie erreicht! 🎉
                  </p>
                )}
                <button
                  onClick={stufeWiederholen}
                  className="px-4 py-2 bg-orange-100 text-orange-900 rounded-lg font-semibold hover:bg-orange-200 transition-all"
                >
                  Diese Stufe nochmal üben
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TermeZusammenfassen;

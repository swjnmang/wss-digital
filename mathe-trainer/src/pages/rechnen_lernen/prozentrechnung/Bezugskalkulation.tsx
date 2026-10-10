import React, { useEffect, useState } from 'react';
import { FeedbackIcon, FeedbackStatus } from '../../../components/FeedbackIcon';
import { parseLocalizedNumber } from '../../../utils/numbers';
import { formatCurrency, formatPercent, roundToTwoDecimals, withinTolerance } from '../../../utils/prozent';
import TaskShell from '../../../components/layout/TaskShell'

type FieldKey = 'rabattBetrag' | 'zieleinkaufspreis' | 'skontoBetrag' | 'bareinkaufspreis' | 'bezugspreis';

type CorrectValues = {
  listenpreis: number;
  rabattProzent: number;
  rabattBetrag: number;
  zieleinkaufspreis: number;
  skontoProzent: number;
  skontoBetrag: number;
  bareinkaufspreis: number;
  bezugskosten: number;
  bezugspreis: number;
};

const editableFields: FieldKey[] = ['rabattBetrag', 'zieleinkaufspreis', 'skontoBetrag', 'bareinkaufspreis', 'bezugspreis'];

const createEmptyInputs = () => {
  const next: Record<FieldKey, string> = {} as Record<FieldKey, string>;
  editableFields.forEach((key) => { next[key] = ''; });
  return next;
};

const createEmptyFeedback = () => {
  const next: Record<FieldKey, FeedbackStatus> = {} as Record<FieldKey, FeedbackStatus>;
  editableFields.forEach((key) => { next[key] = null; });
  return next;
};

const tolerance = 0.01;

function buildSolution(values: CorrectValues) {
  return [
    'Musterlösung:',
    '',
    `Listenpreis: ${formatCurrency(values.listenpreis)} €`,
    `- Rabatt (${formatPercent(values.rabattProzent, 2)}%): ${formatCurrency(values.rabattBetrag)} €`,
    `  => Zieleinkaufspreis: ${formatCurrency(values.zieleinkaufspreis)} €`,
    `- Skonto (${formatPercent(values.skontoProzent, 2)}%): ${formatCurrency(values.skontoBetrag)} €`,
    `  => Bareinkaufspreis: ${formatCurrency(values.bareinkaufspreis)} €`,
    `+ Bezugskosten: ${formatCurrency(values.bezugskosten)} €`,
    `  => Bezugspreis: ${formatCurrency(values.bezugspreis)} €`,
  ].join('\n');
}

function createProblem() {
  const listenpreis = roundToTwoDecimals(Math.random() * 500 + 100);
  const rabattProzent = roundToTwoDecimals(Math.random() * 20 + 5);
  const skontoProzent = roundToTwoDecimals(Math.random() * 3 + 1);
  const bezugskosten = roundToTwoDecimals(Math.random() * 50 + 10);

  const rabattBetrag = roundToTwoDecimals(listenpreis * (rabattProzent / 100));
  const zieleinkaufspreis = roundToTwoDecimals(listenpreis - rabattBetrag);
  const skontoBetrag = roundToTwoDecimals(zieleinkaufspreis * (skontoProzent / 100));
  const bareinkaufspreis = roundToTwoDecimals(zieleinkaufspreis - skontoBetrag);
  const bezugspreis = roundToTwoDecimals(bareinkaufspreis + bezugskosten);

  const values: CorrectValues = {
    listenpreis,
    rabattProzent,
    rabattBetrag,
    zieleinkaufspreis,
    skontoProzent,
    skontoBetrag,
    bareinkaufspreis,
    bezugskosten,
    bezugspreis,
  };

  const templates = [
    `Ein Unternehmen kauft Waren mit einem Listenpreis von ${formatCurrency(listenpreis)} €.
Der Lieferant gewährt ${formatPercent(rabattProzent, 2)}% Rabatt.
Bei Zahlung innerhalb von 10 Tagen werden zusätzlich ${formatPercent(skontoProzent, 2)}% Skonto gewährt.
Die Bezugskosten betragen ${formatCurrency(bezugskosten)} €.
Berechne den Bezugspreis.`,
    `Für eine Bestellung wird ein Listenpreis von ${formatCurrency(listenpreis)} € vereinbart.
Es wird ein Handelsrabatt von ${formatPercent(rabattProzent, 2)}% gewährt.
Zusätzlich kann ein Skonto von ${formatPercent(skontoProzent, 2)}% abgezogen werden.
Die Bezugskosten betragen ${formatCurrency(bezugskosten)} €.
Ermittle den Bezugspreis.`,
    `Der Katalogpreis für ein Produkt beträgt ${formatCurrency(listenpreis)} €.
Es gibt ${formatPercent(rabattProzent, 2)}% Mengenrabatt und ${formatPercent(skontoProzent, 2)}% Skonto.
Die Bezugskosten liegen bei ${formatCurrency(bezugskosten)} €.
Wie hoch ist der Bezugspreis?`,
  ];

  const description = templates[Math.floor(Math.random() * templates.length)];
  return { values, description };
}

export default function Bezugskalkulation() {
  const [problemText, setProblemText] = useState('');
  const [correctValues, setCorrectValues] = useState<CorrectValues | null>(null);
  const [userInputs, setUserInputs] = useState<Record<FieldKey, string>>(createEmptyInputs);
  const [fieldFeedback, setFieldFeedback] = useState<Record<FieldKey, FeedbackStatus>>(createEmptyFeedback);
  const [solutionText, setSolutionText] = useState('');
  const [showSolution, setShowSolution] = useState(false);
  const [progress, setProgress] = useState({ correct: 0, total: 0 });
  const [overallFeedback, setOverallFeedback] = useState('');
  const [overallStatus, setOverallStatus] = useState<'success' | 'error' | 'idle'>('idle');

  useEffect(() => {
    generateNewProblem();
  }, []);

  function generateNewProblem() {
    const { values, description } = createProblem();
    setCorrectValues(values);
    setProblemText(description);
    setUserInputs(createEmptyInputs());
    setFieldFeedback(createEmptyFeedback());
    setSolutionText(buildSolution(values));
    setShowSolution(false);
    setOverallFeedback('');
    setOverallStatus('idle');
  }

  function handleInputChange(key: FieldKey) {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target;
      setUserInputs((prev) => ({ ...prev, [key]: value }));
      setFieldFeedback((prev) => ({ ...prev, [key]: null }));
      setOverallStatus('idle');
      setOverallFeedback('');
    };
  }

  function checkAnswers() {
    if (!correctValues) return;

    let allCorrect = true;
    const nextFeedback: Record<FieldKey, FeedbackStatus> = createEmptyFeedback();

    editableFields.forEach((key) => {
      const studentValue = parseLocalizedNumber(userInputs[key]);
      const expected = correctValues[key];

      if (typeof studentValue === 'number' && !Number.isNaN(studentValue) && withinTolerance(studentValue, expected, tolerance)) {
        nextFeedback[key] = 'correct';
      } else {
        nextFeedback[key] = 'incorrect';
        allCorrect = false;
      }
    });

    setFieldFeedback(nextFeedback);
    setProgress((prev) => ({
      total: prev.total + 1,
      correct: prev.correct + (allCorrect ? 1 : 0),
    }));

    if (allCorrect) {
      setOverallFeedback('Sehr gut! Die Bezugskalkulation ist korrekt.');
      setOverallStatus('success');
    } else {
      setOverallFeedback('Leider sind noch nicht alle Werte richtig. Prüfe deine Zwischenschritte.');
      setOverallStatus('error');
    }
  }

  function handleShowSolution() {
    if (!solutionText) {
      setSolutionText(correctValues ? buildSolution(correctValues) : '');
    }
    setShowSolution(true);
  }

  return (
    <TaskShell title="Bezugskalkulation" width="wide">
    <div className="flex flex-col">
      <div className="flex flex-col items-center">
        <div className="bk-panel w-full max-w-6xl p-6 sm:p-10">
          <p className="text-slate-600 mb-6">Trainiere die komplette Bezugskalkulation mit zufälligen Aufgaben und erhalte sofortiges Feedback zu jedem Zwischenschritt.</p>

          <div className="bk-taskbox whitespace-pre-line text-slate-800 text-sm sm:text-base mb-6">
            {problemText}
          </div>

          <div className="overflow-x-auto mb-6">
            <table className="min-w-full border border-slate-200 text-sm md:text-base">
              <thead className="bg-slate-100 text-left">
                <tr>
                  <th className="p-3 border border-slate-200">Posten</th>
                  <th className="p-3 border border-slate-200">Betrag (€)</th>
                  <th className="p-3 border border-slate-200 text-center">Feedback</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-3 border border-slate-200">Listenpreis</td>
                  <td className="p-3 border border-slate-200">
                    <input
                      type="number"
                      readOnly
                      className="w-full border border-slate-200 rounded px-2 py-1 bg-slate-50 text-right"
                      value={formatCurrency(correctValues?.listenpreis)}
                    />
                  </td>
                  <td className="p-3 border border-slate-200 text-center">—</td>
                </tr>
                <tr>
                  <td className="p-3 border border-slate-200">- Rabatt ({formatPercent(correctValues?.rabattProzent, 2)}%)</td>
                  <td className="p-3 border border-slate-200">
                    <input
                      type="number"
                      inputMode="decimal"
                      className="w-full border border-slate-200 rounded px-2 py-1 text-right"
                      value={userInputs.rabattBetrag}
                      onChange={handleInputChange('rabattBetrag')}
                    />
                  </td>
                  <td className="p-3 border border-slate-200 text-center">
                    <FeedbackIcon status={fieldFeedback.rabattBetrag} />
                  </td>
                </tr>
                <tr>
                  <td className="p-3 border border-slate-200">= Zieleinkaufspreis</td>
                  <td className="p-3 border border-slate-200">
                    <input
                      type="number"
                      inputMode="decimal"
                      className="w-full border border-slate-200 rounded px-2 py-1 text-right"
                      value={userInputs.zieleinkaufspreis}
                      onChange={handleInputChange('zieleinkaufspreis')}
                    />
                  </td>
                  <td className="p-3 border border-slate-200 text-center">
                    <FeedbackIcon status={fieldFeedback.zieleinkaufspreis} />
                  </td>
                </tr>
                <tr>
                  <td className="p-3 border border-slate-200">- Skonto ({formatPercent(correctValues?.skontoProzent, 2)}%)</td>
                  <td className="p-3 border border-slate-200">
                    <input
                      type="number"
                      inputMode="decimal"
                      className="w-full border border-slate-200 rounded px-2 py-1 text-right"
                      value={userInputs.skontoBetrag}
                      onChange={handleInputChange('skontoBetrag')}
                    />
                  </td>
                  <td className="p-3 border border-slate-200 text-center">
                    <FeedbackIcon status={fieldFeedback.skontoBetrag} />
                  </td>
                </tr>
                <tr>
                  <td className="p-3 border border-slate-200">= Bareinkaufspreis</td>
                  <td className="p-3 border border-slate-200">
                    <input
                      type="number"
                      inputMode="decimal"
                      className="w-full border border-slate-200 rounded px-2 py-1 text-right"
                      value={userInputs.bareinkaufspreis}
                      onChange={handleInputChange('bareinkaufspreis')}
                    />
                  </td>
                  <td className="p-3 border border-slate-200 text-center">
                    <FeedbackIcon status={fieldFeedback.bareinkaufspreis} />
                  </td>
                </tr>
                <tr>
                  <td className="p-3 border border-slate-200">+ Bezugskosten</td>
                  <td className="p-3 border border-slate-200">
                    <input
                      type="number"
                      readOnly
                      className="w-full border border-slate-200 rounded px-2 py-1 bg-slate-50 text-right"
                      value={formatCurrency(correctValues?.bezugskosten)}
                    />
                  </td>
                  <td className="p-3 border border-slate-200 text-center">—</td>
                </tr>
                <tr>
                  <td className="p-3 border border-slate-200">= Bezugspreis</td>
                  <td className="p-3 border border-slate-200">
                    <input
                      type="number"
                      inputMode="decimal"
                      className="w-full border border-slate-200 rounded px-2 py-1 text-right"
                      value={userInputs.bezugspreis}
                      onChange={handleInputChange('bezugspreis')}
                    />
                  </td>
                  <td className="p-3 border border-slate-200 text-center">
                    <FeedbackIcon status={fieldFeedback.bezugspreis} />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap gap-3 mb-4">
            <button onClick={checkAnswers} className="bk-btn bk-btn-primary flex-1 min-w-[180px]">
              Überprüfen
            </button>
            <button onClick={generateNewProblem} className="bk-btn flex-1 min-w-[180px]">
              Neue Aufgabe
            </button>
            <button onClick={handleShowSolution} className="bk-btn flex-1 min-w-[180px]">
              Musterlösung anzeigen
            </button>
          </div>

          {overallFeedback && (
            <div
              className={`w-full rounded-xl border px-4 py-3 mb-4 text-center font-semibold ${
                overallStatus === 'success'
                  ? 'bg-green-50 border-green-200 text-green-700'
                  : 'bg-red-50 border-red-200 text-red-700'
              }`}
            >
              {overallFeedback}
            </div>
          )}

          {showSolution && (
            <pre className="bk-taskbox text-sm md:text-base whitespace-pre-line mb-4 text-slate-800">
              {solutionText}
            </pre>
          )}

          <div className="text-center text-sm text-slate-600">Richtig gelöst: {progress.correct} von {progress.total} Aufgaben</div>
        </div>
      </div>
    </div>
    </TaskShell>
  );
}

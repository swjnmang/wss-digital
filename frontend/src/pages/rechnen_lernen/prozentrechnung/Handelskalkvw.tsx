import React, { useEffect, useState } from 'react';
import { FeedbackIcon, FeedbackStatus } from '../../../components/FeedbackIcon';
import { parseLocalizedNumber } from '../../../utils/numbers';
import { formatCurrency, formatPercent, roundToPointFive, roundToTwoDecimals, withinTolerance } from '../../../utils/prozent';

type FieldKey =
  | 'liefererrabattBetrag'
  | 'zieleinkaufspreis'
  | 'liefererskontoBetrag'
  | 'bareinkaufspreis'
  | 'bezugspreis'
  | 'handlungskostenzuschlagBetrag'
  | 'selbstkosten'
  | 'gewinnBetrag'
  | 'barverkaufspreisVerkauf'
  | 'kundenskontoBetrag'
  | 'zielverkaufspreis'
  | 'kundenrabattBetrag'
  | 'nettoverkaufspreis'
  | 'umsatzsteuerBetrag'
  | 'bruttoverkaufspreis';

type CorrectValues = {
  listeneinkaufspreisNetto: number;
  liefererrabattProzent: number;
  liefererrabattBetrag: number;
  zieleinkaufspreis: number;
  liefererskontoProzent: number;
  liefererskontoBetrag: number;
  bareinkaufspreis: number;
  bezugskosten: number;
  bezugspreis: number;
  handlungskostenzuschlagProzent: number;
  handlungskostenzuschlagBetrag: number;
  selbstkosten: number;
  gewinnProzent: number;
  gewinnBetrag: number;
  barverkaufspreisVerkauf: number;
  kundenskontoProzent: number;
  kundenskontoBetrag: number;
  zielverkaufspreis: number;
  kundenrabattProzent: number;
  kundenrabattBetrag: number;
  nettoverkaufspreis: number;
  umsatzsteuerProzent: number;
  umsatzsteuerBetrag: number;
  bruttoverkaufspreis: number;
};

const editableFields: FieldKey[] = [
  'liefererrabattBetrag',
  'zieleinkaufspreis',
  'liefererskontoBetrag',
  'bareinkaufspreis',
  'bezugspreis',
  'handlungskostenzuschlagBetrag',
  'selbstkosten',
  'gewinnBetrag',
  'barverkaufspreisVerkauf',
  'kundenskontoBetrag',
  'zielverkaufspreis',
  'kundenrabattBetrag',
  'nettoverkaufspreis',
  'umsatzsteuerBetrag',
  'bruttoverkaufspreis',
];

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
    `Listeneinkaufspreis netto: ${formatCurrency(values.listeneinkaufspreisNetto)} €`,
    `- Liefererrabatt (${formatPercent(values.liefererrabattProzent)}%): ${formatCurrency(values.liefererrabattBetrag)} €`,
    `  => Zieleinkaufspreis: ${formatCurrency(values.zieleinkaufspreis)} €`,
    `- Liefererskonto (${formatPercent(values.liefererskontoProzent)}%): ${formatCurrency(values.liefererskontoBetrag)} €`,
    `  => Bareinkaufspreis: ${formatCurrency(values.bareinkaufspreis)} €`,
    `+ Bezugskosten: ${formatCurrency(values.bezugskosten)} €`,
    `  => Bezugspreis: ${formatCurrency(values.bezugspreis)} €`,
    `+ Handlungskostenzuschlag (${formatPercent(values.handlungskostenzuschlagProzent)}%): ${formatCurrency(values.handlungskostenzuschlagBetrag)} €`,
    `  => Selbstkosten: ${formatCurrency(values.selbstkosten)} €`,
    `+ Gewinn (${formatPercent(values.gewinnProzent)}%): ${formatCurrency(values.gewinnBetrag)} €`,
    `  => Barverkaufspreis: ${formatCurrency(values.barverkaufspreisVerkauf)} €`,
    `+ Kundenskonto (${formatPercent(values.kundenskontoProzent)}%): ${formatCurrency(values.kundenskontoBetrag)} €`,
    `  => Zielverkaufspreis: ${formatCurrency(values.zielverkaufspreis)} €`,
    `+ Kundenrabatt (${formatPercent(values.kundenrabattProzent)}%): ${formatCurrency(values.kundenrabattBetrag)} €`,
    `  => Nettoverkaufspreis: ${formatCurrency(values.nettoverkaufspreis)} €`,
    `+ Umsatzsteuer (${formatPercent(values.umsatzsteuerProzent, 0)}%): ${formatCurrency(values.umsatzsteuerBetrag)} €`,
    `  => Bruttoverkaufspreis: ${formatCurrency(values.bruttoverkaufspreis)} €`,
  ].join('\n');
}

function createProblem() {
  const listeneinkaufspreisNetto = roundToTwoDecimals(Math.random() * 500 + 100);
  const liefererrabattProzent = roundToPointFive(Math.random() * 15 + 5);
  const liefererskontoProzent = roundToPointFive(Math.random() * 2 + 1);
  const bezugskosten = roundToTwoDecimals(Math.random() * 40 + 10);
  const handlungskostenzuschlagProzent = roundToPointFive(Math.random() * 20 + 10);
  const gewinnProzent = roundToPointFive(Math.random() * 15 + 5);
  const kundenskontoProzent = roundToPointFive(Math.random() * 2 + 1);
  const kundenrabattProzent = roundToPointFive(Math.random() * 10 + 2);
  const umsatzsteuerProzent = 19;

  const liefererrabattBetrag = roundToTwoDecimals(listeneinkaufspreisNetto * (liefererrabattProzent / 100));
  const zieleinkaufspreis = roundToTwoDecimals(listeneinkaufspreisNetto - liefererrabattBetrag);
  const liefererskontoBetrag = roundToTwoDecimals(zieleinkaufspreis * (liefererskontoProzent / 100));
  const bareinkaufspreis = roundToTwoDecimals(zieleinkaufspreis - liefererskontoBetrag);
  const bezugspreis = roundToTwoDecimals(bareinkaufspreis + bezugskosten);
  const handlungskostenzuschlagBetrag = roundToTwoDecimals(bezugspreis * (handlungskostenzuschlagProzent / 100));
  const selbstkosten = roundToTwoDecimals(bezugspreis + handlungskostenzuschlagBetrag);
  const gewinnBetrag = roundToTwoDecimals(selbstkosten * (gewinnProzent / 100));
  const barverkaufspreisVerkauf = roundToTwoDecimals(selbstkosten + gewinnBetrag);
  const zielverkaufspreis = roundToTwoDecimals(barverkaufspreisVerkauf / (1 - kundenskontoProzent / 100));
  const kundenskontoBetrag = roundToTwoDecimals(zielverkaufspreis - barverkaufspreisVerkauf);
  const nettoverkaufspreis = roundToTwoDecimals(zielverkaufspreis / (1 - kundenrabattProzent / 100));
  const kundenrabattBetrag = roundToTwoDecimals(nettoverkaufspreis - zielverkaufspreis);
  const umsatzsteuerBetrag = roundToTwoDecimals(nettoverkaufspreis * (umsatzsteuerProzent / 100));
  const bruttoverkaufspreis = roundToTwoDecimals(nettoverkaufspreis + umsatzsteuerBetrag);

  const values: CorrectValues = {
    listeneinkaufspreisNetto,
    liefererrabattProzent,
    liefererrabattBetrag,
    zieleinkaufspreis,
    liefererskontoProzent,
    liefererskontoBetrag,
    bareinkaufspreis,
    bezugskosten,
    bezugspreis,
    handlungskostenzuschlagProzent,
    handlungskostenzuschlagBetrag,
    selbstkosten,
    gewinnProzent,
    gewinnBetrag,
    barverkaufspreisVerkauf,
    kundenskontoProzent,
    kundenskontoBetrag,
    zielverkaufspreis,
    kundenrabattProzent,
    kundenrabattBetrag,
    nettoverkaufspreis,
    umsatzsteuerProzent,
    umsatzsteuerBetrag,
    bruttoverkaufspreis,
  };

  const templates = [
    `Ein Händler kauft Waren mit einem Listeneinkaufspreis netto von ${formatCurrency(listeneinkaufspreisNetto)} €.
Liefererrabatt: ${formatPercent(liefererrabattProzent)} %, Liefererskonto: ${formatPercent(liefererskontoProzent)} %.
Bezugskosten: ${formatCurrency(bezugskosten)} €, Handlungskosten: ${formatPercent(handlungskostenzuschlagProzent)} %.
Gewinnzuschlag: ${formatPercent(gewinnProzent)} %, Kundenskonto: ${formatPercent(kundenskontoProzent)} %, Kundenrabatt: ${formatPercent(kundenrabattProzent)} %.
Umsatzsteuer: ${umsatzsteuerProzent}%.
Erstelle die vollständige Handelskalkulation.`,
    `Berechne die Vorwärtskalkulation mit folgenden Werten:
Listeneinkaufspreis netto ${formatCurrency(listeneinkaufspreisNetto)} €,
Liefererrabatt ${formatPercent(liefererrabattProzent)} %, Liefererskonto ${formatPercent(liefererskontoProzent)} %,
Bezugskosten ${formatCurrency(bezugskosten)} €, Handlungskosten ${formatPercent(handlungskostenzuschlagProzent)} %,
Gewinn ${formatPercent(gewinnProzent)} %, Kundenskonto ${formatPercent(kundenskontoProzent)} %, Kundenrabatt ${formatPercent(kundenrabattProzent)} %,
Umsatzsteuer ${umsatzsteuerProzent}%.`,
  ];

  const description = templates[Math.floor(Math.random() * templates.length)];
  return { values, description };
}

export default function Handelskalkvw() {
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
      setOverallFeedback('Top! Alle Werte der Handelskalkulation stimmen.');
      setOverallStatus('success');
    } else {
      setOverallFeedback('Da fehlen noch richtige Werte. Prüfe Mengen- und Prozentsätze noch einmal.');
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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-sky-100">
      <div className="flex-1 flex flex-col items-center px-3 py-10">
        <div className="bg-white rounded-2xl shadow-md border border-slate-200 w-full max-w-5xl p-6 sm:p-10">
          <a href="/rechnen_lernen/prozentrechnung" className="text-blue-600 hover:underline mb-4 inline-block">&larr; Zurück zur Prozent-Übersicht</a>
          <h1 className="text-3xl font-bold text-blue-900 mb-2">Handelskalkulation (Vorwärts)</h1>
          <p className="text-slate-600 mb-6">Führe die vollständige Vorwärtskalkulation durch: vom Listeneinkaufspreis bis zum Bruttoverkaufspreis.</p>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 whitespace-pre-line text-slate-800 text-sm sm:text-base mb-6">
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
                  <td className="p-3 border border-slate-200">Listeneinkaufspreis netto</td>
                  <td className="p-3 border border-slate-200">
                    <input
                      type="number"
                      readOnly
                      className="w-full border border-slate-200 rounded px-2 py-1 bg-slate-50 text-right"
                      value={formatCurrency(correctValues?.listeneinkaufspreisNetto)}
                    />
                  </td>
                  <td className="p-3 border border-slate-200 text-center">—</td>
                </tr>
                <tr>
                  <td className="p-3 border border-slate-200">- Liefererrabatt ({formatPercent(correctValues?.liefererrabattProzent)}%)</td>
                  <td className="p-3 border border-slate-200">
                    <input
                      type="number"
                      inputMode="decimal"
                      className="w-full border border-slate-200 rounded px-2 py-1 text-right"
                      value={userInputs.liefererrabattBetrag}
                      onChange={handleInputChange('liefererrabattBetrag')}
                    />
                  </td>
                  <td className="p-3 border border-slate-200 text-center"><FeedbackIcon status={fieldFeedback.liefererrabattBetrag} /></td>
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
                  <td className="p-3 border border-slate-200 text-center"><FeedbackIcon status={fieldFeedback.zieleinkaufspreis} /></td>
                </tr>
                <tr>
                  <td className="p-3 border border-slate-200">- Liefererskonto ({formatPercent(correctValues?.liefererskontoProzent)}%)</td>
                  <td className="p-3 border border-slate-200">
                    <input
                      type="number"
                      inputMode="decimal"
                      className="w-full border border-slate-200 rounded px-2 py-1 text-right"
                      value={userInputs.liefererskontoBetrag}
                      onChange={handleInputChange('liefererskontoBetrag')}
                    />
                  </td>
                  <td className="p-3 border border-slate-200 text-center"><FeedbackIcon status={fieldFeedback.liefererskontoBetrag} /></td>
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
                  <td className="p-3 border border-slate-200 text-center"><FeedbackIcon status={fieldFeedback.bareinkaufspreis} /></td>
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
                  <td className="p-3 border border-slate-200 text-center"><FeedbackIcon status={fieldFeedback.bezugspreis} /></td>
                </tr>
                <tr>
                  <td className="p-3 border border-slate-200">+ Handlungskostenzuschlag ({formatPercent(correctValues?.handlungskostenzuschlagProzent)}%)</td>
                  <td className="p-3 border border-slate-200">
                    <input
                      type="number"
                      inputMode="decimal"
                      className="w-full border border-slate-200 rounded px-2 py-1 text-right"
                      value={userInputs.handlungskostenzuschlagBetrag}
                      onChange={handleInputChange('handlungskostenzuschlagBetrag')}
                    />
                  </td>
                  <td className="p-3 border border-slate-200 text-center"><FeedbackIcon status={fieldFeedback.handlungskostenzuschlagBetrag} /></td>
                </tr>
                <tr>
                  <td className="p-3 border border-slate-200">= Selbstkosten</td>
                  <td className="p-3 border border-slate-200">
                    <input
                      type="number"
                      inputMode="decimal"
                      className="w-full border border-slate-200 rounded px-2 py-1 text-right"
                      value={userInputs.selbstkosten}
                      onChange={handleInputChange('selbstkosten')}
                    />
                  </td>
                  <td className="p-3 border border-slate-200 text-center"><FeedbackIcon status={fieldFeedback.selbstkosten} /></td>
                </tr>
                <tr>
                  <td className="p-3 border border-slate-200">+ Gewinn ({formatPercent(correctValues?.gewinnProzent)}%)</td>
                  <td className="p-3 border border-slate-200">
                    <input
                      type="number"
                      inputMode="decimal"
                      className="w-full border border-slate-200 rounded px-2 py-1 text-right"
                      value={userInputs.gewinnBetrag}
                      onChange={handleInputChange('gewinnBetrag')}
                    />
                  </td>
                  <td className="p-3 border border-slate-200 text-center"><FeedbackIcon status={fieldFeedback.gewinnBetrag} /></td>
                </tr>
                <tr>
                  <td className="p-3 border border-slate-200">= Barverkaufspreis</td>
                  <td className="p-3 border border-slate-200">
                    <input
                      type="number"
                      inputMode="decimal"
                      className="w-full border border-slate-200 rounded px-2 py-1 text-right"
                      value={userInputs.barverkaufspreisVerkauf}
                      onChange={handleInputChange('barverkaufspreisVerkauf')}
                    />
                  </td>
                  <td className="p-3 border border-slate-200 text-center"><FeedbackIcon status={fieldFeedback.barverkaufspreisVerkauf} /></td>
                </tr>
                <tr>
                  <td className="p-3 border border-slate-200">+ Kundenskonto ({formatPercent(correctValues?.kundenskontoProzent)}%)</td>
                  <td className="p-3 border border-slate-200">
                    <input
                      type="number"
                      inputMode="decimal"
                      className="w-full border border-slate-200 rounded px-2 py-1 text-right"
                      value={userInputs.kundenskontoBetrag}
                      onChange={handleInputChange('kundenskontoBetrag')}
                    />
                  </td>
                  <td className="p-3 border border-slate-200 text-center"><FeedbackIcon status={fieldFeedback.kundenskontoBetrag} /></td>
                </tr>
                <tr>
                  <td className="p-3 border border-slate-200">= Zielverkaufspreis</td>
                  <td className="p-3 border border-slate-200">
                    <input
                      type="number"
                      inputMode="decimal"
                      className="w-full border border-slate-200 rounded px-2 py-1 text-right"
                      value={userInputs.zielverkaufspreis}
                      onChange={handleInputChange('zielverkaufspreis')}
                    />
                  </td>
                  <td className="p-3 border border-slate-200 text-center"><FeedbackIcon status={fieldFeedback.zielverkaufspreis} /></td>
                </tr>
                <tr>
                  <td className="p-3 border border-slate-200">+ Kundenrabatt ({formatPercent(correctValues?.kundenrabattProzent)}%)</td>
                  <td className="p-3 border border-slate-200">
                    <input
                      type="number"
                      inputMode="decimal"
                      className="w-full border border-slate-200 rounded px-2 py-1 text-right"
                      value={userInputs.kundenrabattBetrag}
                      onChange={handleInputChange('kundenrabattBetrag')}
                    />
                  </td>
                  <td className="p-3 border border-slate-200 text-center"><FeedbackIcon status={fieldFeedback.kundenrabattBetrag} /></td>
                </tr>
                <tr>
                  <td className="p-3 border border-slate-200">= Nettoverkaufspreis</td>
                  <td className="p-3 border border-slate-200">
                    <input
                      type="number"
                      inputMode="decimal"
                      className="w-full border border-slate-200 rounded px-2 py-1 text-right"
                      value={userInputs.nettoverkaufspreis}
                      onChange={handleInputChange('nettoverkaufspreis')}
                    />
                  </td>
                  <td className="p-3 border border-slate-200 text-center"><FeedbackIcon status={fieldFeedback.nettoverkaufspreis} /></td>
                </tr>
                <tr>
                  <td className="p-3 border border-slate-200">+ Umsatzsteuer ({formatPercent(correctValues?.umsatzsteuerProzent, 0)}%)</td>
                  <td className="p-3 border border-slate-200">
                    <input
                      type="number"
                      inputMode="decimal"
                      className="w-full border border-slate-200 rounded px-2 py-1 text-right"
                      value={userInputs.umsatzsteuerBetrag}
                      onChange={handleInputChange('umsatzsteuerBetrag')}
                    />
                  </td>
                  <td className="p-3 border border-slate-200 text-center"><FeedbackIcon status={fieldFeedback.umsatzsteuerBetrag} /></td>
                </tr>
                <tr>
                  <td className="p-3 border border-slate-200">= Bruttoverkaufspreis</td>
                  <td className="p-3 border border-slate-200">
                    <input
                      type="number"
                      inputMode="decimal"
                      className="w-full border border-slate-200 rounded px-2 py-1 text-right"
                      value={userInputs.bruttoverkaufspreis}
                      onChange={handleInputChange('bruttoverkaufspreis')}
                    />
                  </td>
                  <td className="p-3 border border-slate-200 text-center"><FeedbackIcon status={fieldFeedback.bruttoverkaufspreis} /></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap gap-3 mb-4">
            <button onClick={checkAnswers} className="flex-1 min-w-[180px] bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition">Überprüfen</button>
            <button onClick={generateNewProblem} className="flex-1 min-w-[180px] bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition">Neue Aufgabe</button>
            <button onClick={handleShowSolution} className="flex-1 min-w-[180px] bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2 px-4 rounded-lg transition">Musterlösung anzeigen</button>
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
            <pre className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm md:text-base whitespace-pre-line mb-4 text-slate-800">
              {solutionText}
            </pre>
          )}

          <div className="text-center text-sm text-slate-600">Richtig gelöst: {progress.correct} von {progress.total} Aufgaben</div>
        </div>
      </div>
    </div>
  );
}

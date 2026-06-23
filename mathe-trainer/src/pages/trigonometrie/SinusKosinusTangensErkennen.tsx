import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import RightTriangleSVG from '../../components/RightTriangleSVG';

type SideRole = 'hypotenuse' | 'opposite' | 'adjacent';
type TrigFunction = 'sin' | 'cos' | 'tan';

const roleLabel: Record<SideRole, string> = {
  hypotenuse: 'Hypotenuse',
  opposite: 'Gegenkathete',
  adjacent: 'Ankathete',
};

const trigFunctionLabel: Record<TrigFunction, string> = {
  sin: 'Sinus',
  cos: 'Kosinus',
  tan: 'Tangens',
};

const greekSymbols: Record<'alpha' | 'beta' | 'gamma', string> = {
  alpha: 'α',
  beta: 'β',
  gamma: 'γ',
};

interface Triangle {
  rightAngleAtPoint: string;
  markedAngleAtPoint: string;
  markedAngle: 'alpha' | 'beta' | 'gamma';
  sideOf: Record<SideRole, string>; // welche Seite (a/b/c) welche Rolle hat
}

const generateTriangle = (): Triangle => {
  const points = ['A', 'B', 'C'];
  const sides = ['a', 'b', 'c'];

  const rightAngleAtPoint = points[Math.floor(Math.random() * 3)];
  const otherPoints = points.filter((p) => p !== rightAngleAtPoint);
  const markedAngleAtPoint = otherPoints[Math.floor(Math.random() * 2)];

  const angleNames: Record<string, 'alpha' | 'beta' | 'gamma'> = {
    A: 'alpha',
    B: 'beta',
    C: 'gamma',
  };

  const hypotenuse = sides[points.indexOf(rightAngleAtPoint)];
  const opposite = sides[points.indexOf(markedAngleAtPoint)];
  const adjacent = sides.find((s) => s !== hypotenuse && s !== opposite)!;

  return {
    rightAngleAtPoint,
    markedAngleAtPoint,
    markedAngle: angleNames[markedAngleAtPoint],
    sideOf: { hypotenuse, opposite, adjacent },
  };
};

// Alle 6 möglichen geordneten Seiten-Verhältnisse (Zähler/Nenner)
const ALL_RATIOS: [SideRole, SideRole][] = [
  ['opposite', 'hypotenuse'],
  ['adjacent', 'hypotenuse'],
  ['opposite', 'adjacent'],
  ['hypotenuse', 'opposite'],
  ['hypotenuse', 'adjacent'],
  ['adjacent', 'opposite'],
];

const ratioToFunction = (num: SideRole, den: SideRole): TrigFunction | null => {
  if (num === 'opposite' && den === 'hypotenuse') return 'sin';
  if (num === 'adjacent' && den === 'hypotenuse') return 'cos';
  if (num === 'opposite' && den === 'adjacent') return 'tan';
  return null;
};

const shuffle = <T,>(arr: T[]): T[] => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

type QuestionType = 'functionToRatio' | 'ratioToFunction';

interface Question {
  type: QuestionType;
  triangle: Triangle;
  // functionToRatio
  askedFunction?: TrigFunction;
  // ratioToFunction
  askedRatio?: [SideRole, SideRole];
  options: string[];
  correctOption: string;
}

const buildQuestion = (): Question => {
  const triangle = generateTriangle();
  const symbol = greekSymbols[triangle.markedAngle];
  const type: QuestionType = Math.random() < 0.5 ? 'functionToRatio' : 'ratioToFunction';

  if (type === 'functionToRatio') {
    const fn: TrigFunction = (['sin', 'cos', 'tan'] as TrigFunction[])[Math.floor(Math.random() * 3)];
    const correctPair = ALL_RATIOS.find(([num, den]) => ratioToFunction(num, den) === fn)!;
    const correctOption = `${triangle.sideOf[correctPair[0]]}/${triangle.sideOf[correctPair[1]]}`;

    const distractorPairs = shuffle(ALL_RATIOS.filter(([num, den]) => !(num === correctPair[0] && den === correctPair[1])));
    const distractorOptions = distractorPairs
      .slice(0, 3)
      .map(([num, den]) => `${triangle.sideOf[num]}/${triangle.sideOf[den]}`);

    return {
      type,
      triangle,
      askedFunction: fn,
      options: shuffle([correctOption, ...distractorOptions]),
      correctOption,
    };
  }

  const [num, den] = ALL_RATIOS[Math.floor(Math.random() * ALL_RATIOS.length)];
  const fn = ratioToFunction(num, den);
  const correctOption = fn ? trigFunctionLabel[fn] : 'Keine der drei';
  const allOptions = ['Sinus', 'Kosinus', 'Tangens', 'Keine der drei'];

  return {
    type,
    triangle,
    askedRatio: [num, den],
    options: allOptions,
    correctOption,
  };
};

const SinusKosinusTangensErkennen: React.FC = () => {
  const [question, setQuestion] = useState<Question | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [taskCount, setTaskCount] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [showHelp, setShowHelp] = useState(false);

  const nextQuestion = () => {
    setQuestion(buildQuestion());
    setSelected(null);
    setTaskCount((c) => c + 1);
  };

  useEffect(() => {
    nextQuestion();
  }, []);

  if (!question) {
    return <div className="text-center py-8">Laden...</div>;
  }

  const symbol = greekSymbols[question.triangle.markedAngle];

  const handleSelect = (option: string) => {
    if (selected) return;
    setSelected(option);
    if (option === question.correctOption) {
      setCorrect((c) => c + 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <Link to="/trigonometrie" className="text-blue-600 hover:text-blue-800 font-semibold">
            ← Zurück zur Übersicht
          </Link>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-orange-900">Sinus, Kosinus und Tangens erkennen</h1>
            <p className="text-gray-600 mt-2">
              Aufgabe {taskCount} | Richtig: {correct}/{Math.max(taskCount - 1, 0)}
            </p>
          </div>
          <div></div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="mb-6">
            <button
              onClick={() => setShowHelp(!showHelp)}
              className="text-sm font-semibold text-blue-600 hover:text-blue-800"
            >
              {showHelp ? 'Merkhilfe verbergen' : 'Merkhilfe anzeigen'}
            </button>
            {showHelp && (
              <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl p-4 grid sm:grid-cols-3 gap-4 text-center">
                <div>
                  <p className="font-semibold text-blue-900 mb-1">Sinus</p>
                  <InlineMath math={'\\sin(\\alpha) = \\dfrac{\\text{Gegenkathete}}{\\text{Hypotenuse}}'} />
                </div>
                <div>
                  <p className="font-semibold text-blue-900 mb-1">Kosinus</p>
                  <InlineMath math={'\\cos(\\alpha) = \\dfrac{\\text{Ankathete}}{\\text{Hypotenuse}}'} />
                </div>
                <div>
                  <p className="font-semibold text-blue-900 mb-1">Tangens</p>
                  <InlineMath math={'\\tan(\\alpha) = \\dfrac{\\text{Gegenkathete}}{\\text{Ankathete}}'} />
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Dreieck */}
            <div className="flex flex-col items-center justify-center">
              <div className="bg-gray-50 rounded-lg w-full h-[400px] border-2 border-gray-200 p-4">
                <RightTriangleSVG
                  pointA="A"
                  pointB="B"
                  pointC="C"
                  sideA="a"
                  sideB="b"
                  sideC="c"
                  rightAngleAtPoint={question.triangle.rightAngleAtPoint}
                  markedAngle={question.triangle.markedAngle}
                  markedAngleAtPoint={question.triangle.markedAngleAtPoint}
                />
              </div>
              <p className="text-sm text-gray-600 mt-4 text-center">
                Der markierte Winkel ist {symbol}.
              </p>
            </div>

            {/* Frage */}
            <div className="flex flex-col justify-center">
              {question.type === 'functionToRatio' ? (
                <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">
                  Welcher Bruch entspricht {trigFunctionLabel[question.askedFunction!]}({symbol})?
                </h2>
              ) : (
                <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">
                  Welche Funktion beschreibt den Bruch{' '}
                  <InlineMath
                    math={`\\dfrac{${question.triangle.sideOf[question.askedRatio![0]]}}{${
                      question.triangle.sideOf[question.askedRatio![1]]
                    }}`}
                  />{' '}
                  in Bezug auf {symbol}?
                </h2>
              )}

              <div className="grid grid-cols-2 gap-4">
                {question.options.map((option) => {
                  const isSelected = selected === option;
                  const isCorrectOption = option === question.correctOption;
                  let style = 'bg-gray-50 border-gray-300 hover:bg-gray-100';
                  if (selected) {
                    if (isCorrectOption) style = 'bg-green-100 border-green-500';
                    else if (isSelected) style = 'bg-red-100 border-red-500';
                  }
                  return (
                    <button
                      key={option}
                      onClick={() => handleSelect(option)}
                      disabled={!!selected}
                      className={`border-2 rounded-xl p-4 text-lg font-semibold transition ${style}`}
                    >
                      {question.type === 'functionToRatio' ? (
                        <InlineMath math={`\\dfrac{${option.split('/')[0]}}{${option.split('/')[1]}}`} />
                      ) : (
                        option
                      )}
                    </button>
                  );
                })}
              </div>

              {selected && (
                <div
                  className={`mt-6 p-4 rounded-lg text-white font-semibold text-center ${
                    selected === question.correctOption ? 'bg-green-500' : 'bg-red-500'
                  }`}
                >
                  {selected === question.correctOption
                    ? '✓ Richtig!'
                    : `✗ Nicht ganz richtig. Richtig wäre: ${
                        question.type === 'functionToRatio'
                          ? question.correctOption.replace('/', ' / ')
                          : question.correctOption
                      }`}
                </div>
              )}

              <button
                onClick={nextQuestion}
                className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition"
              >
                Nächste Aufgabe
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SinusKosinusTangensErkennen;

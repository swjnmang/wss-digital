import React, { useState, useEffect } from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

interface Task {
  type: 'hypotenuse' | 'kathete';
  kathete1: number;
  kathete2: number;
  hypotenuse: number;
  given: { side1: string; value1: number; side2: string; value2: number };
  unknown: { side: string; value: number };
  orientation: 'standard' | 'rotated90' | 'rotated180' | 'rotated270';
  labels: { bottom: string; left: string; diagonal: string };
  contextIntro: string;
}

const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomItem = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const round2 = (val: number) => Math.round(val * 100) / 100;

const parseNumberInput = (raw: string) => {
  let s = raw.trim().replace(/\s/g, '');
  if (s.includes(',')) {
    s = s.replace(/\./g, '').replace(',', '.');
  }
  return parseFloat(s);
};

export default function SeitenBerechnen() {
  const [task, setTask] = useState<Task | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [showSolution, setShowSolution] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    generateNewTask();
  }, []);

  const generateNewTask = () => {
    // Zufällige Katheten generieren (pythagoreische Tripel oder nahe dran)
    const tripels = [
      [3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25],
      [6, 8, 10], [9, 12, 15], [12, 16, 20], [15, 20, 25]
    ];
    
    const useExact = Math.random() < 0.7; // 70% exakte Tripel
    let k1: number, k2: number, h: number;
    
    if (useExact) {
      const tripel = getRandomItem(tripels);
      k1 = tripel[0];
      k2 = tripel[1];
      h = tripel[2];
    } else {
      k1 = randomInt(3, 12);
      k2 = randomInt(3, 12);
      h = round2(Math.sqrt(k1 * k1 + k2 * k2));
    }

    const taskType: 'hypotenuse' | 'kathete' = Math.random() < 0.5 ? 'hypotenuse' : 'kathete';
    const orientation = getRandomItem<Task['orientation']>(['standard', 'rotated90', 'rotated180', 'rotated270']);

    // Kreative Buchstaben auswählen
    const letterSets = [
      ['p', 'q', 'r'], ['x', 'y', 'z'], ['m', 'n', 'o'], 
      ['u', 'v', 'w'], ['d', 'e', 'f'], ['g', 'h', 'i'],
      ['r', 's', 't'], ['k', 'l', 'm']
    ];
    const chosenSet = getRandomItem(letterSets);
    const [l1, l2, l3] = chosenSet;

    const labels = {
      bottom: l1,
      left: l2,
      diagonal: l3
    };

    const contexts = [
      "Ein rechtwinkliges Dreieck hat folgende Seitenlängen:",
      "Berechne die fehlende Seite des rechtwinkligen Dreiecks:",
      "Gegeben ist ein rechtwinkliges Dreieck mit:",
      "In einem rechtwinkligen Dreieck sind bekannt:",
      "Ein Zimmermann vermisst ein rechtwinkliges Dreiecksegel:",
      "Bei einem Dachkonstruktionsdreieck gilt:",
      "Ein Navigationsdreieck hat die Maße:"
    ];

    let given: Task['given'];
    let unknown: Task['unknown'];

    if (taskType === 'hypotenuse') {
      // Beide Katheten gegeben, Hypotenuse gesucht
      given = {
        side1: labels.bottom,
        value1: k1,
        side2: labels.left,
        value2: k2
      };
      unknown = {
        side: labels.diagonal,
        value: h
      };
    } else {
      // Hypotenuse und eine Kathete gegeben, andere Kathete gesucht
      if (Math.random() < 0.5) {
        given = {
          side1: labels.diagonal,
          value1: h,
          side2: labels.bottom,
          value2: k1
        };
        unknown = {
          side: labels.left,
          value: k2
        };
      } else {
        given = {
          side1: labels.diagonal,
          value1: h,
          side2: labels.left,
          value2: k2
        };
        unknown = {
          side: labels.bottom,
          value: k1
        };
      }
    }

    setTask({
      type: taskType,
      kathete1: k1,
      kathete2: k2,
      hypotenuse: h,
      given,
      unknown,
      orientation,
      labels,
      contextIntro: getRandomItem(contexts)
    });

    setUserAnswer('');
    setFeedback(null);
    setShowSolution(false);
  };

  const checkAnswer = () => {
    if (!task) return;

    const userValue = parseNumberInput(userAnswer);
    if (isNaN(userValue)) {
      setFeedback('incorrect');
      setTotalCount(c => c + 1);
      return;
    }

    const tolerance = 0.1;
    if (Math.abs(userValue - task.unknown.value) <= tolerance) {
      setFeedback('correct');
      setCorrectCount(c => c + 1);
    } else {
      setFeedback('incorrect');
    }
    setTotalCount(c => c + 1);
  };

  const revealSolution = () => {
    setShowSolution(true);
  };

  const renderTriangle = () => {
    if (!task) return null;

    // Dynamische Skalierung basierend auf den Seitenlängen
    const maxSide = Math.max(task.kathete1, task.kathete2, task.hypotenuse);
    const scale = maxSide > 20 ? 280 / maxSide : 25;
    const k1 = task.kathete1;
    const k2 = task.kathete2;

    let points = '';
    let rightAngleMarker = { x: 0, y: 0, rotation: 0 };

    const offsetX = 100;
    const offsetY = 100;
    const baseY = 400;

    switch (task.orientation) {
      case 'standard':
        points = `${offsetX},${baseY - k2 * scale} ${offsetX},${baseY} ${offsetX + k1 * scale},${baseY}`;
        rightAngleMarker = { x: offsetX, y: baseY, rotation: 0 };
        break;
      case 'rotated90':
        points = `${offsetX},${baseY} ${offsetX + k1 * scale},${baseY} ${offsetX + k1 * scale},${baseY - k2 * scale}`;
        rightAngleMarker = { x: offsetX + k1 * scale, y: baseY, rotation: 270 };
        break;
      case 'rotated180':
        points = `${offsetX + k1 * scale},${offsetY + k2 * scale} ${offsetX + k1 * scale},${offsetY} ${offsetX},${offsetY}`;
        rightAngleMarker = { x: offsetX + k1 * scale, y: offsetY, rotation: 180 };
        break;
      case 'rotated270':
        points = `${offsetX + k1 * scale},${offsetY} ${offsetX},${offsetY} ${offsetX},${offsetY + k2 * scale}`;
        rightAngleMarker = { x: offsetX, y: offsetY, rotation: 90 };
        break;
    }

    const pointsArray = points.split(' ').map(p => {
      const [x, y] = p.split(',').map(Number);
      return { x, y };
    });

    const midBottom = {
      x: (pointsArray[0].x + pointsArray[1].x) / 2,
      y: (pointsArray[0].y + pointsArray[1].y) / 2
    };
    const midLeft = {
      x: (pointsArray[1].x + pointsArray[2].x) / 2,
      y: (pointsArray[1].y + pointsArray[2].y) / 2
    };
    const midDiagonal = {
      x: (pointsArray[2].x + pointsArray[0].x) / 2,
      y: (pointsArray[2].y + pointsArray[0].y) / 2
    };

    // Welche Seite ist welche und was ist gegeben/gesucht
    const getSideInfo = (label: string) => {
      if (label === task.given.side1) return { value: task.given.value1, isKnown: true };
      if (label === task.given.side2) return { value: task.given.value2, isKnown: true };
      if (label === task.unknown.side) return { value: '?', isKnown: false };
      return { value: '', isKnown: false };
    };

    const bottomInfo = getSideInfo(task.labels.bottom);
    const leftInfo = getSideInfo(task.labels.left);
    const diagonalInfo = getSideInfo(task.labels.diagonal);

    return (
      <div className="flex flex-col items-center gap-4 w-full">
        <svg viewBox="0 0 500 500" className="w-full max-w-lg h-auto border border-slate-200 rounded-lg bg-white">
          <polygon
            points={points}
            fill="rgba(59, 130, 246, 0.1)"
            stroke="rgb(59, 130, 246)"
            strokeWidth="2"
          />
          
          {/* Rechter Winkel Marker */}
          <g transform={`translate(${rightAngleMarker.x}, ${rightAngleMarker.y}) rotate(${rightAngleMarker.rotation})`}>
            <path d="M 0,-20 A 20,20 0 0,1 20,0" fill="none" stroke="rgb(239, 68, 68)" strokeWidth="2" />
            <circle cx="10" cy="-10" r="3" fill="rgb(239, 68, 68)" />
          </g>

          {/* Labels mit Werten */}
          <text x={midBottom.x} y={midBottom.y + (task.orientation === 'standard' || task.orientation === 'rotated90' ? 30 : -20)} 
                textAnchor="middle" className="font-bold fill-slate-700" fontSize="16">
            {task.labels.bottom}
            {bottomInfo.isKnown && ` = ${bottomInfo.value} cm`}
            {!bottomInfo.isKnown && ` = ?`}
          </text>
          <text x={midLeft.x - (task.orientation === 'standard' || task.orientation === 'rotated270' ? 35 : -35)} 
                y={midLeft.y + 5} textAnchor="middle" className="font-bold fill-slate-700" fontSize="16">
            {task.labels.left}
            {leftInfo.isKnown && ` = ${leftInfo.value} cm`}
            {!leftInfo.isKnown && ` = ?`}
          </text>
          <text x={midDiagonal.x} 
                y={midDiagonal.y - 10} textAnchor="middle" className="font-bold fill-slate-700" fontSize="16">
            {task.labels.diagonal}
            {diagonalInfo.isKnown && ` = ${diagonalInfo.value} cm`}
            {!diagonalInfo.isKnown && ` = ?`}
          </text>
        </svg>
      </div>
    );
  };

  const renderSolution = () => {
    if (!task) return null;

    const k1Label = task.labels.bottom;
    const k2Label = task.labels.left;
    const hLabel = task.labels.diagonal;

    if (task.type === 'hypotenuse') {
      // Hypotenuse berechnen
      const formula = `${hLabel}^2 = ${k1Label}^2 + ${k2Label}^2`;
      const substitution = `${hLabel}^2 = ${task.kathete1}^2 + ${task.kathete2}^2 = ${task.kathete1 * task.kathete1} + ${task.kathete2 * task.kathete2} = ${task.kathete1 * task.kathete1 + task.kathete2 * task.kathete2}`;
      const result = `${hLabel} = \\sqrt{${task.kathete1 * task.kathete1 + task.kathete2 * task.kathete2}} = ${task.hypotenuse}`;

      return (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
          <h3 className="font-semibold text-blue-900">Lösungsweg:</h3>
          <div className="space-y-2 text-blue-900">
            <p className="text-sm">
              Da die Hypotenuse gesucht ist und beide Katheten gegeben sind, verwenden wir:
            </p>
            <div className="bg-white p-3 rounded">
              <BlockMath math={`\\text{Kathete}^2 + \\text{Kathete}^2 = \\text{Hypotenuse}^2`} />
            </div>
            <p className="text-sm font-semibold">Schritt 1: Formel aufstellen</p>
            <div className="bg-white p-2 rounded">
              <BlockMath math={formula} />
            </div>
            <p className="text-sm font-semibold">Schritt 2: Werte einsetzen</p>
            <div className="bg-white p-2 rounded">
              <BlockMath math={substitution} />
            </div>
            <p className="text-sm font-semibold">Schritt 3: Wurzel ziehen</p>
            <div className="bg-white p-2 rounded">
              <BlockMath math={result + `\\text{ cm}`} />
            </div>
          </div>
        </div>
      );
    } else {
      // Kathete berechnen
      const unknownLabel = task.unknown.side;
      const knownKatheteLabel = task.given.side1 === hLabel ? task.given.side2 : task.given.side1;
      const knownKatheteValue = task.given.side1 === hLabel ? task.given.value2 : task.given.value1;
      
      const formula = `${hLabel}^2 = ${k1Label}^2 + ${k2Label}^2`;
      const rearranged = `${unknownLabel}^2 = ${hLabel}^2 - ${knownKatheteLabel}^2`;
      const substitution = `${unknownLabel}^2 = ${task.hypotenuse}^2 - ${knownKatheteValue}^2 = ${round2(task.hypotenuse * task.hypotenuse)} - ${round2(knownKatheteValue * knownKatheteValue)} = ${round2(task.hypotenuse * task.hypotenuse - knownKatheteValue * knownKatheteValue)}`;
      const result = `${unknownLabel} = \\sqrt{${round2(task.hypotenuse * task.hypotenuse - knownKatheteValue * knownKatheteValue)}} = ${task.unknown.value}`;

      return (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
          <h3 className="font-semibold text-blue-900">Lösungsweg:</h3>
          <div className="space-y-2 text-blue-900">
            <p className="text-sm">
              Da eine Kathete gesucht ist und die Hypotenuse sowie die andere Kathete gegeben sind, verwenden wir:
            </p>
            <div className="bg-white p-3 rounded">
              <BlockMath math={`\\text{Kathete}^2 + \\text{Kathete}^2 = \\text{Hypotenuse}^2`} />
            </div>
            <p className="text-sm font-semibold">Schritt 1: Formel aufstellen</p>
            <div className="bg-white p-2 rounded">
              <BlockMath math={formula} />
            </div>
            <p className="text-sm font-semibold">Schritt 2: Nach der gesuchten Kathete umstellen</p>
            <div className="bg-white p-2 rounded">
              <BlockMath math={rearranged} />
            </div>
            <p className="text-sm font-semibold">Schritt 3: Werte einsetzen</p>
            <div className="bg-white p-2 rounded">
              <BlockMath math={substitution} />
            </div>
            <p className="text-sm font-semibold">Schritt 4: Wurzel ziehen</p>
            <div className="bg-white p-2 rounded">
              <BlockMath math={result + `\\text{ cm}`} />
            </div>
          </div>
        </div>
      );
    }
  };

  if (!task) return <div>Lade...</div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-slate-900">Seiten berechnen</h1>
          <p className="text-slate-600">
            Berechne die fehlende Seite mit dem Satz des Pythagoras: <InlineMath math="a^2 + b^2 = c^2" />
          </p>
        </div>

        {/* Statistik */}
        <div className="flex justify-center gap-4 text-sm">
          <span className="text-slate-600">
            Richtig: <strong className="text-green-600">{correctCount}</strong> / {totalCount}
          </span>
        </div>

        {/* Aufgabe */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">{task.contextIntro}</h2>
          
          <div className="flex flex-col items-center gap-4">
            <div className="text-slate-700 space-y-1">
              <p><InlineMath math={`${task.given.side1} = ${task.given.value1}\\text{ cm}`} /></p>
              <p><InlineMath math={`${task.given.side2} = ${task.given.value2}\\text{ cm}`} /></p>
              <p className="font-semibold text-blue-700">
                Gesucht: <InlineMath math={`${task.unknown.side} = \\,?`} />
              </p>
            </div>

            {renderTriangle()}
          </div>

          {/* Eingabe */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 justify-center">
              <label className="text-slate-700 font-medium">
                <InlineMath math={`${task.unknown.side} =`} />
              </label>
              <input
                type="text"
                value={userAnswer}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUserAnswer(e.target.value)}
                className="w-32 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="?"
                disabled={showSolution}
              />
              <span className="text-slate-600">cm</span>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 justify-center flex-wrap">
              <button
                onClick={checkAnswer}
                disabled={showSolution}
                className="generator-button bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Prüfen
              </button>
              <button
                onClick={revealSolution}
                disabled={showSolution}
                className="generator-button bg-amber-500 hover:bg-amber-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Lösung zeigen
              </button>
              <button
                onClick={generateNewTask}
                className="generator-button bg-green-600 hover:bg-green-700 text-white"
              >
                Neue Aufgabe
              </button>
            </div>
          </div>

          {/* Feedback */}
          {feedback && !showSolution && (
            <div className={`text-center p-4 rounded-lg ${
              feedback === 'correct' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {feedback === 'correct' 
                ? `✓ Richtig! ${task.unknown.side} = ${task.unknown.value} cm` 
                : `✗ Das ist leider nicht korrekt. Die richtige Antwort ist ${task.unknown.side} = ${task.unknown.value} cm`}
            </div>
          )}

          {/* Lösung */}
          {showSolution && renderSolution()}
        </div>
      </div>
    </div>
  );
}

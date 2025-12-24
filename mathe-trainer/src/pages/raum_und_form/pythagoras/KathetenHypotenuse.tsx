import React, { useState, useEffect } from 'react';

interface Triangle {
  type: 'rechtwinklig';
  orientation: 'standard' | 'rotated90' | 'rotated180' | 'rotated270';
  kathete1: number;
  kathete2: number;
  hypotenuse: number;
  rightAnglePosition: 'bottomLeft' | 'bottomRight' | 'topLeft' | 'topRight';
  sides: {
    bottom: { label: string; isHypotenuse: boolean; isKathete: boolean };
    left: { label: string; isHypotenuse: boolean; isKathete: boolean };
    diagonal: { label: string; isHypotenuse: boolean; isKathete: boolean };
  };
}

const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomItem = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export default function KathetenHypotenuse() {
  const [triangle, setTriangle] = useState<Triangle | null>(null);
  const [userAnswers, setUserAnswers] = useState<{
    hypotenuse: string;
    kathete1: string;
    kathete2: string;
  }>({ hypotenuse: '', kathete1: '', kathete2: '' });
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [showSolution, setShowSolution] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    generateNewTriangle();
  }, []);

  const generateNewTriangle = () => {
    const k1 = randomInt(3, 8);
    const k2 = randomInt(3, 8);
    const h = Math.sqrt(k1 * k1 + k2 * k2);
    
    const orientations: Triangle['orientation'][] = ['standard', 'rotated90', 'rotated180', 'rotated270'];
    const orientation = getRandomItem(orientations);

    // Labels für die Seiten - wir vergeben sie einfach zufällig aus dem Alphabet
    const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
    const shuffled: string[] = [];
    while (shuffled.length < 3) {
      const letter = getRandomItem(alphabet);
      if (!shuffled.includes(letter)) {
        shuffled.push(letter);
      }
    }

    let rightAnglePosition: Triangle['rightAnglePosition'];
    let sides: Triangle['sides'];

    // Die Diagonale ist IMMER die Hypotenuse (gegenüber dem rechten Winkel)
    // bottom und left sind IMMER die Katheten (bilden den rechten Winkel)
    // Je nach Orientierung ändern sich nur die Positionen im SVG, nicht die Rollen
    rightAnglePosition = orientation === 'standard' ? 'bottomLeft' :
                         orientation === 'rotated90' ? 'bottomRight' :
                         orientation === 'rotated180' ? 'topRight' : 'topLeft';
    
    sides = {
      bottom: { label: shuffled[0], isHypotenuse: false, isKathete: true },
      left: { label: shuffled[1], isHypotenuse: false, isKathete: true },
      diagonal: { label: shuffled[2], isHypotenuse: true, isKathete: false }
    };

    setTriangle({
      type: 'rechtwinklig',
      orientation,
      kathete1: k1,
      kathete2: k2,
      hypotenuse: h,
      rightAnglePosition,
      sides
    });

    setUserAnswers({ hypotenuse: '', kathete1: '', kathete2: '' });
    setFeedback(null);
    setShowSolution(false);
  };

  const checkAnswers = () => {
    if (!triangle) return;

    const hypLabel = Object.entries(triangle.sides).find(([_, side]) => side.isHypotenuse)?.[1].label;
    const katLabels = Object.entries(triangle.sides)
      .filter(([_, side]) => side.isKathete)
      .map(([_, side]) => side.label)
      .sort();

    const userKatheten = [userAnswers.kathete1, userAnswers.kathete2].sort();

    const hypCorrect = userAnswers.hypotenuse.toLowerCase().trim() === hypLabel;
    const katCorrect = 
      userKatheten[0] && userKatheten[1] &&
      katLabels.includes(userKatheten[0].toLowerCase().trim()) &&
      katLabels.includes(userKatheten[1].toLowerCase().trim()) &&
      userKatheten[0].toLowerCase().trim() !== userKatheten[1].toLowerCase().trim();

    if (hypCorrect && katCorrect) {
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
    if (!triangle) return null;

    const scale = 40; // Skalierungsfaktor für die Darstellung
    const k1 = triangle.kathete1;
    const k2 = triangle.kathete2;

    let points = '';
    let rightAngleMarker = { x: 0, y: 0, rotation: 0 };

    // Koordinaten basierend auf Orientierung
    switch (triangle.orientation) {
      case 'standard':
        // Rechter Winkel unten links
        points = `50,${350 - k2 * scale} 50,350 ${50 + k1 * scale},350`;
        rightAngleMarker = { x: 50, y: 350, rotation: 0 };
        break;
      case 'rotated90':
        // Rechter Winkel unten rechts
        points = `50,350 ${50 + k1 * scale},350 ${50 + k1 * scale},${350 - k2 * scale}`;
        rightAngleMarker = { x: 50 + k1 * scale, y: 350, rotation: 270 };
        break;
      case 'rotated180':
        // Rechter Winkel oben rechts
        points = `${50 + k1 * scale},${50 + k2 * scale} ${50 + k1 * scale},50 50,50`;
        rightAngleMarker = { x: 50 + k1 * scale, y: 50, rotation: 180 };
        break;
      case 'rotated270':
        // Rechter Winkel oben links
        points = `${50 + k1 * scale},50 50,50 50,${50 + k2 * scale}`;
        rightAngleMarker = { x: 50, y: 50, rotation: 90 };
        break;
    }

    // Berechne Label-Positionen
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

    return (
      <div className="flex flex-col items-center gap-4 w-full">
        <svg viewBox="0 0 450 450" className="w-full max-w-md h-auto border border-slate-200 rounded-lg bg-white">
          <polygon
            points={points}
            fill="rgba(59, 130, 246, 0.1)"
            stroke="rgb(59, 130, 246)"
            strokeWidth="2"
          />
          
          {/* Rechter Winkel Marker - Viertelkreis mit Punkt */}
          <g transform={`translate(${rightAngleMarker.x}, ${rightAngleMarker.y}) rotate(${rightAngleMarker.rotation})`}>
            {/* Viertelkreis */}
            <path
              d="M 0,-20 A 20,20 0 0,1 20,0"
              fill="none"
              stroke="rgb(239, 68, 68)"
              strokeWidth="2"
            />
            {/* Punkt in der Mitte */}
            <circle cx="10" cy="-10" r="3" fill="rgb(239, 68, 68)" />
          </g>

          {/* Labels */}
          <text x={midBottom.x} y={midBottom.y + (triangle.orientation === 'standard' || triangle.orientation === 'rotated90' ? 20 : -10)} 
                textAnchor="middle" className="text-lg font-bold fill-slate-700">
            {triangle.sides.bottom.label}
          </text>
          <text x={midLeft.x - (triangle.orientation === 'standard' || triangle.orientation === 'rotated270' ? 20 : -20)} 
                y={midLeft.y} textAnchor="middle" className="text-lg font-bold fill-slate-700">
            {triangle.sides.left.label}
          </text>
          <text x={midDiagonal.x} y={midDiagonal.y} textAnchor="middle" className="text-lg font-bold fill-slate-700">
            {triangle.sides.diagonal.label}
          </text>
        </svg>

        <div className="text-sm text-slate-600 bg-slate-100 px-4 py-2 rounded-lg">
          <span className="text-red-600 font-bold">●</span> Der rechte Winkel ist rot markiert
        </div>
      </div>
    );
  };

  if (!triangle) return <div>Lade...</div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-slate-900">Katheten und Hypotenuse erkennen</h1>
          <p className="text-slate-600">
            Identifiziere die <strong>Hypotenuse</strong> (die längste Seite gegenüber dem rechten Winkel)
            und die beiden <strong>Katheten</strong> (die beiden Seiten, die den rechten Winkel bilden).
          </p>
        </div>

        {/* Statistik */}
        <div className="flex justify-center gap-4 text-sm">
          <span className="text-slate-600">
            Richtig: <strong className="text-green-600">{correctCount}</strong> / {totalCount}
          </span>
        </div>

        {/* Dreieck */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          {renderTriangle()}
        </div>

        {/* Eingabefelder */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Welche Seite ist welche?</h2>
          
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Hypotenuse
              </label>
              <input
                type="text"
                value={userAnswers.hypotenuse}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUserAnswers({ ...userAnswers, hypotenuse: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="z.B. a"
                disabled={showSolution}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                1. Kathete
              </label>
              <input
                type="text"
                value={userAnswers.kathete1}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUserAnswers({ ...userAnswers, kathete1: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="z.B. b"
                disabled={showSolution}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                2. Kathete
              </label>
              <input
                type="text"
                value={userAnswers.kathete2}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUserAnswers({ ...userAnswers, kathete2: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="z.B. c"
                disabled={showSolution}
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 justify-center flex-wrap">
            <button
              onClick={checkAnswers}
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
              onClick={generateNewTriangle}
              className="generator-button bg-green-600 hover:bg-green-700 text-white"
            >
              Neue Aufgabe
            </button>
          </div>

          {/* Feedback */}
          {feedback && !showSolution && (
            <div className={`text-center p-4 rounded-lg ${
              feedback === 'correct' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {feedback === 'correct' 
                ? '✓ Richtig! Die Hypotenuse liegt immer gegenüber dem rechten Winkel, die Katheten bilden den rechten Winkel.' 
                : '✗ Das ist leider nicht korrekt. Tipp: Die Hypotenuse ist die längste Seite und liegt dem rechten Winkel gegenüber.'}
            </div>
          )}

          {/* Lösung */}
          {showSolution && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
              <h3 className="font-semibold text-blue-900">Lösung:</h3>
              <div className="space-y-1 text-blue-900">
                <p>
                  <strong>Hypotenuse:</strong> {Object.entries(triangle.sides).find(([_, side]) => side.isHypotenuse)?.[1].label}
                  {' '}(die Seite gegenüber dem rechten Winkel)
                </p>
                <p>
                  <strong>Katheten:</strong>{' '}
                  {Object.entries(triangle.sides)
                    .filter(([_, side]) => side.isKathete)
                    .map(([_, side]) => side.label)
                    .join(' und ')}
                  {' '}(die Seiten, die den rechten Winkel bilden)
                </p>
              </div>
              <div className="mt-3 text-sm text-blue-800 bg-blue-100 p-3 rounded">
                <p className="font-semibold">Merke:</p>
                <p>Kathete² + Kathete² = Hypotenuse²</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

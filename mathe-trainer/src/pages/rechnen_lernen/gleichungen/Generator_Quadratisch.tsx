import React, { useState } from 'react';

type Difficulty = 'einfach' | 'mittel' | 'schwer';

interface Aufgabe {
  id: string;
  aufgabe: string;
  loesungen: number[];
}

// NUR REIN-QUADRATISCHE GLEICHUNGEN (x², ±a Form, kein linearer Term bx)

const aufgaben: Aufgabe[] = [
  // EINFACH (e1-e50)
  { id: 'e1', aufgabe: 'x² = 9', loesungen: [3, -3] },
  { id: 'e2', aufgabe: 'x² = 16', loesungen: [4, -4] },
  { id: 'e3', aufgabe: 'x² = 25', loesungen: [5, -5] },
  { id: 'e4', aufgabe: 'x² = 36', loesungen: [6, -6] },
  { id: 'e5', aufgabe: 'x² = 49', loesungen: [7, -7] },
  { id: 'e6', aufgabe: '2x² = 50', loesungen: [5, -5] },
  { id: 'e7', aufgabe: '3x² = 75', loesungen: [5, -5] },
  { id: 'e8', aufgabe: '4x² = 64', loesungen: [4, -4] },
  { id: 'e9', aufgabe: '5x² = 45', loesungen: [3, -3] },
  { id: 'e10', aufgabe: '2x² = 18', loesungen: [3, -3] },
  { id: 'e11', aufgabe: 'x² - 4 = 0', loesungen: [2, -2] },
  { id: 'e12', aufgabe: 'x² - 9 = 0', loesungen: [3, -3] },
  { id: 'e13', aufgabe: 'x² - 16 = 0', loesungen: [4, -4] },
  { id: 'e14', aufgabe: 'x² - 25 = 0', loesungen: [5, -5] },
  { id: 'e15', aufgabe: 'x² - 36 = 0', loesungen: [6, -6] },
  { id: 'e16', aufgabe: '2x² - 8 = 0', loesungen: [2, -2] },
  { id: 'e17', aufgabe: '3x² - 27 = 0', loesungen: [3, -3] },
  { id: 'e18', aufgabe: '4x² - 100 = 0', loesungen: [5, -5] },
  { id: 'e19', aufgabe: 'x² - 25 = 0', loesungen: [5, -5] },
  { id: 'e20', aufgabe: '2x² - 32 = 0', loesungen: [4, -4] },
  { id: 'e21', aufgabe: 'x² = 1', loesungen: [1, -1] },
  { id: 'e22', aufgabe: 'x² - 1 = 0', loesungen: [1, -1] },
  { id: 'e23', aufgabe: '3x² - 12 = 0', loesungen: [2, -2] },
  { id: 'e24', aufgabe: '5x² - 20 = 0', loesungen: [2, -2] },
  { id: 'e25', aufgabe: 'x² - 36 = 0', loesungen: [6, -6] },
  { id: 'e26', aufgabe: '(x - 2)² = 0', loesungen: [2] },
  { id: 'e27', aufgabe: '(x + 3)² = 0', loesungen: [-3] },
  { id: 'e28', aufgabe: '(x - 1)² = 4', loesungen: [3, -1] },
  { id: 'e29', aufgabe: '(x + 2)² = 9', loesungen: [1, -5] },
  { id: 'e30', aufgabe: '(x - 3)² = 25', loesungen: [8, -2] },
  { id: 'e31', aufgabe: '(x + 1)² = 4', loesungen: [1, -3] },
  { id: 'e32', aufgabe: '(x - 4)² = 9', loesungen: [7, 1] },
  { id: 'e33', aufgabe: '2x² = 32', loesungen: [4, -4] },
  { id: 'e34', aufgabe: '3x² = 48', loesungen: [4, -4] },
  { id: 'e35', aufgabe: '6x² - 24 = 0', loesungen: [2, -2] },
  { id: 'e36', aufgabe: '4x² - 16 = 0', loesungen: [2, -2] },
  { id: 'e37', aufgabe: 'x² - 64 = 0', loesungen: [8, -8] },
  { id: 'e38', aufgabe: '5x² = 5', loesungen: [1, -1] },
  { id: 'e39', aufgabe: '7x² - 7 = 0', loesungen: [1, -1] },
  { id: 'e40', aufgabe: '(x + 4)² = 16', loesungen: [0, -8] },
  { id: 'e41', aufgabe: '(x - 5)² = 25', loesungen: [10, 0] },
  { id: 'e42', aufgabe: '(x + 5)² = 25', loesungen: [0, -10] },
  { id: 'e43', aufgabe: '2x² = 8', loesungen: [2, -2] },
  { id: 'e44', aufgabe: '3x² = 12', loesungen: [2, -2] },
  { id: 'e45', aufgabe: '4x² = 36', loesungen: [3, -3] },
  { id: 'e46', aufgabe: 'x² = 100', loesungen: [10, -10] },
  { id: 'e47', aufgabe: 'x² - 49 = 0', loesungen: [7, -7] },
  { id: 'e48', aufgabe: 'x² - 81 = 0', loesungen: [9, -9] },
  { id: 'e49', aufgabe: '(x - 6)² = 0', loesungen: [6] },
  { id: 'e50', aufgabe: '(x + 7)² = 0', loesungen: [-7] },

  // MITTEL (m1-m50)
  { id: 'm1', aufgabe: 'x² = 144', loesungen: [12, -12] },
  { id: 'm2', aufgabe: 'x² = 121', loesungen: [11, -11] },
  { id: 'm3', aufgabe: '2x² = 128', loesungen: [8, -8] },
  { id: 'm4', aufgabe: '3x² = 192', loesungen: [8, -8] },
  { id: 'm5', aufgabe: '4x² = 144', loesungen: [6, -6] },
  { id: 'm6', aufgabe: '5x² = 80', loesungen: [4, -4] },
  { id: 'm7', aufgabe: '6x² = 150', loesungen: [5, -5] },
  { id: 'm8', aufgabe: '7x² = 175', loesungen: [5, -5] },
  { id: 'm9', aufgabe: '8x² = 32', loesungen: [2, -2] },
  { id: 'm10', aufgabe: '9x² = 81', loesungen: [3, -3] },
  { id: 'm11', aufgabe: 'x² - 121 = 0', loesungen: [11, -11] },
  { id: 'm12', aufgabe: 'x² - 144 = 0', loesungen: [12, -12] },
  { id: 'm13', aufgabe: '2x² - 128 = 0', loesungen: [8, -8] },
  { id: 'm14', aufgabe: '3x² - 192 = 0', loesungen: [8, -8] },
  { id: 'm15', aufgabe: '4x² - 144 = 0', loesungen: [6, -6] },
  { id: 'm16', aufgabe: '(x - 6)² = 0', loesungen: [6] },
  { id: 'm17', aufgabe: '(x + 7)² = 0', loesungen: [-7] },
  { id: 'm18', aufgabe: '(x - 5)² = 36', loesungen: [11, -1] },
  { id: 'm19', aufgabe: '(x + 6)² = 49', loesungen: [1, -13] },
  { id: 'm20', aufgabe: '(x - 8)² = 64', loesungen: [16, 0] },
  { id: 'm21', aufgabe: '(x + 9)² = 81', loesungen: [0, -18] },
  { id: 'm22', aufgabe: '(x - 10)² = 100', loesungen: [20, 0] },
  { id: 'm23', aufgabe: '(x + 10)² = 100', loesungen: [0, -20] },
  { id: 'm24', aufgabe: '(x - 7)² = 49', loesungen: [14, 0] },
  { id: 'm25', aufgabe: '(x + 8)² = 64', loesungen: [0, -16] },
  { id: 'm26', aufgabe: '(x + 2)² = 25', loesungen: [3, -7] },
  { id: 'm27', aufgabe: '(x - 3)² = 49', loesungen: [10, -4] },
  { id: 'm28', aufgabe: '2(x - 1)² = 8', loesungen: [3, -1] },
  { id: 'm29', aufgabe: '3(x + 2)² = 27', loesungen: [1, -5] },
  { id: 'm30', aufgabe: 'x² - 169 = 0', loesungen: [13, -13] },
  { id: 'm31', aufgabe: 'x² - 196 = 0', loesungen: [14, -14] },
  { id: 'm32', aufgabe: 'x² - 225 = 0', loesungen: [15, -15] },
  { id: 'm33', aufgabe: 'x² - 256 = 0', loesungen: [16, -16] },
  { id: 'm34', aufgabe: '10x² = 40', loesungen: [2, -2] },
  { id: 'm35', aufgabe: '11x² = 99', loesungen: [3, -3] },
  { id: 'm36', aufgabe: '12x² = 48', loesungen: [2, -2] },
  { id: 'm37', aufgabe: '(x - 12)² = 144', loesungen: [24, 0] },
  { id: 'm38', aufgabe: '(x + 12)² = 144', loesungen: [0, -24] },
  { id: 'm39', aufgabe: 'x² = 289', loesungen: [17, -17] },
  { id: 'm40', aufgabe: 'x² = 361', loesungen: [19, -19] },
  { id: 'm41', aufgabe: '2x² = 200', loesungen: [10, -10] },
  { id: 'm42', aufgabe: '3x² = 300', loesungen: [10, -10] },
  { id: 'm43', aufgabe: '4x² = 400', loesungen: [10, -10] },
  { id: 'm44', aufgabe: '5x² = 125', loesungen: [5, -5] },
  { id: 'm45', aufgabe: '6x² = 96', loesungen: [4, -4] },
  { id: 'm46', aufgabe: '4(x - 2)² = 36', loesungen: [4.5, -0.5] },
  { id: 'm47', aufgabe: '5(x + 1)² = 45', loesungen: [2, -4] },
  { id: 'm48', aufgabe: '(x - 15)² = 0', loesungen: [15] },
  { id: 'm49', aufgabe: '(x + 15)² = 0', loesungen: [-15] },
  { id: 'm50', aufgabe: '(x - 20)² = 400', loesungen: [40, 0] },

  // SCHWER (s1-s50)
  { id: 's1', aufgabe: 'x² = 441', loesungen: [21, -21] },
  { id: 's2', aufgabe: 'x² = 484', loesungen: [22, -22] },
  { id: 's3', aufgabe: 'x² = 529', loesungen: [23, -23] },
  { id: 's4', aufgabe: 'x² = 576', loesungen: [24, -24] },
  { id: 's5', aufgabe: 'x² = 625', loesungen: [25, -25] },
  { id: 's6', aufgabe: 'x² = 676', loesungen: [26, -26] },
  { id: 's7', aufgabe: 'x² = 729', loesungen: [27, -27] },
  { id: 's8', aufgabe: 'x² = 784', loesungen: [28, -28] },
  { id: 's9', aufgabe: 'x² = 841', loesungen: [29, -29] },
  { id: 's10', aufgabe: 'x² = 900', loesungen: [30, -30] },
  { id: 's11', aufgabe: '2x² = 450', loesungen: [15, -15] },
  { id: 's12', aufgabe: '3x² = 507', loesungen: [13, -13] },
  { id: 's13', aufgabe: '4x² = 484', loesungen: [11, -11] },
  { id: 's14', aufgabe: '5x² = 500', loesungen: [10, -10] },
  { id: 's15', aufgabe: '6x² = 600', loesungen: [10, -10] },
  { id: 's16', aufgabe: '7x² = 700', loesungen: [10, -10] },
  { id: 's17', aufgabe: '8x² = 512', loesungen: [8, -8] },
  { id: 's18', aufgabe: '9x² = 729', loesungen: [9, -9] },
  { id: 's19', aufgabe: '10x² = 1000', loesungen: [10, -10] },
  { id: 's20', aufgabe: '12x² = 1200', loesungen: [10, -10] },
  { id: 's21', aufgabe: 'x² - 361 = 0', loesungen: [19, -19] },
  { id: 's22', aufgabe: 'x² - 400 = 0', loesungen: [20, -20] },
  { id: 's23', aufgabe: 'x² - 441 = 0', loesungen: [21, -21] },
  { id: 's24', aufgabe: 'x² - 484 = 0', loesungen: [22, -22] },
  { id: 's25', aufgabe: 'x² - 529 = 0', loesungen: [23, -23] },
  { id: 's26', aufgabe: '(x - 15)² = 0', loesungen: [15] },
  { id: 's27', aufgabe: '(x + 15)² = 0', loesungen: [-15] },
  { id: 's28', aufgabe: '(x - 20)² = 400', loesungen: [40, 0] },
  { id: 's29', aufgabe: '(x + 20)² = 400', loesungen: [0, -40] },
  { id: 's30', aufgabe: '(x - 25)² = 625', loesungen: [50, 0] },
  { id: 's31', aufgabe: '(x + 25)² = 625', loesungen: [0, -50] },
  { id: 's32', aufgabe: '(x - 9)² = 81', loesungen: [18, 0] },
  { id: 's33', aufgabe: '(x + 9)² = 81', loesungen: [0, -18] },
  { id: 's34', aufgabe: '2(x - 5)² = 32', loesungen: [9, 1] },
  { id: 's35', aufgabe: '3(x + 4)² = 75', loesungen: [1, -9] },
  { id: 's36', aufgabe: '4(x - 3)² = 100', loesungen: [8, -2] },
  { id: 's37', aufgabe: '5(x + 2)² = 45', loesungen: [1, -5] },
  { id: 's38', aufgabe: '6(x - 1)² = 96', loesungen: [5, -3] },
  { id: 's39', aufgabe: '7(x + 3)² = 175', loesungen: [2, -8] },
  { id: 's40', aufgabe: '8(x - 2)² = 128', loesungen: [6, -2] },
  { id: 's41', aufgabe: '(x - 30)² = 900', loesungen: [60, 0] },
  { id: 's42', aufgabe: '(x + 30)² = 900', loesungen: [0, -60] },
  { id: 's43', aufgabe: 'x² - 576 = 0', loesungen: [24, -24] },
  { id: 's44', aufgabe: 'x² - 625 = 0', loesungen: [25, -25] },
  { id: 's45', aufgabe: '15x² = 960', loesungen: [8, -8] },
  { id: 's46', aufgabe: '16x² = 1024', loesungen: [8, -8] },
  { id: 's47', aufgabe: '20x² = 500', loesungen: [5, -5] },
  { id: 's48', aufgabe: '25x² = 625', loesungen: [5, -5] },
  { id: 's49', aufgabe: '(x - 11)² = 121', loesungen: [22, 0] },
  { id: 's50', aufgabe: '(x + 11)² = 121', loesungen: [0, -22] },
];

export default function Generator_Quadratisch() {
  const [difficulty, setDifficulty] = useState<Difficulty>('einfach');
  const [selectedId, setSelectedId] = useState('e1');
  const [solution1, setSolution1] = useState('');
  const [solution2, setSolution2] = useState('');
  const [feedback, setFeedback] = useState('');
  const [showSolution, setShowSolution] = useState(false);

  const filteredAufgaben = aufgaben.filter((a) => a.id.startsWith(difficulty[0]));
  const currentAufgabe = aufgaben.find((a) => a.id === selectedId) || filteredAufgaben[0];

  const checkAnswer = () => {
    const s1 = solution1.trim().replace(',', '.') ? parseFloat(solution1.replace(',', '.')) : null;
    const s2 = solution2.trim().replace(',', '.') ? parseFloat(solution2.replace(',', '.')) : null;

    const entered = [s1, s2].filter((x) => x !== null && !isNaN(x)).sort((a, b) => a - b);
    const expected = currentAufgabe.loesungen.sort((a, b) => a - b);

    if (entered.length === 0) {
      setFeedback('Bitte gib mindestens eine Lösung ein.');
      return;
    }

    const isCorrect =
      entered.length === expected.length &&
      entered.every((val, idx) => Math.abs(val - expected[idx]) < 0.01);

    if (isCorrect) {
      setFeedback('✓ Richtig!');
    } else {
      const correctSol = expected.map((x) => (Number.isInteger(x) ? x.toString() : x.toFixed(1))).join(';  ');
      setFeedback(`✗ Falsch. Richtig: ${correctSol}`);
    }
    setShowSolution(true);
  };

  const changeDifficulty = (newDiff: Difficulty) => {
    setDifficulty(newDiff);
    setSelectedId(aufgaben.find((a) => a.id.startsWith(newDiff[0]))?.id || 'e1');
    setSolution1('');
    setSolution2('');
    setFeedback('');
    setShowSolution(false);
  };

  const selectAufgabe = (id: string) => {
    setSelectedId(id);
    setSolution1('');
    setSolution2('');
    setFeedback('');
    setShowSolution(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-sky-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto w-full">
        <h1 className="text-4xl md:text-5xl font-bold text-blue-900 mb-2 text-center">
          Quadratische Gleichungen
        </h1>
        <p className="text-gray-700 mb-8 text-center text-lg">
          Löse die quadratischen Gleichungen. Gib beide Lösungen ein (oder nur eine, wenn es nur eine gibt).
        </p>

        {/* Schwierigkeitsgrad Buttons */}
        <div className="flex gap-4 mb-8 justify-center flex-wrap">
          {(['einfach', 'mittel', 'schwer'] as Difficulty[]).map((diff) => (
            <button
              key={diff}
              onClick={() => changeDifficulty(diff)}
              className={`px-6 py-3 rounded-lg font-bold text-lg transition ${
                difficulty === diff
                  ? diff === 'einfach'
                    ? 'bg-green-500 text-white'
                    : diff === 'mittel'
                    ? 'bg-yellow-500 text-white'
                    : 'bg-red-500 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              {diff.charAt(0).toUpperCase() + diff.slice(1)}
            </button>
          ))}
        </div>

        {/* Grid mit Aufgaben */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-8 gap-2 mb-8">
          {filteredAufgaben.map((aufgabe) => (
            <button
              key={aufgabe.id}
              onClick={() => selectAufgabe(aufgabe.id)}
              className={`p-3 rounded-lg font-bold text-sm transition border-2 ${
                selectedId === aufgabe.id
                  ? 'bg-blue-600 text-white border-blue-800'
                  : 'bg-white text-gray-800 border-gray-300 hover:border-blue-400'
              }`}
            >
              {aufgabe.id}
            </button>
          ))}
        </div>

        {/* Aufgabencard */}
        {currentAufgabe && (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 max-w-2xl mx-auto">
            <p className="text-center text-gray-600 mb-4 text-sm font-semibold">
              Aufgabe: {currentAufgabe.id}
            </p>
            <div className="text-center mb-8 p-6 bg-blue-50 rounded-lg border-2 border-blue-200">
              <p className="text-4xl font-bold text-blue-900">{currentAufgabe.aufgabe}</p>
            </div>

            {/* Eingabefelder */}
            <div className="mb-8">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Lösungen eingeben:
              </label>
              <div className="flex gap-4 mb-4">
                <input
                  type="text"
                  value={solution1}
                  onChange={(e) => setSolution1(e.target.value)}
                  placeholder="Erste Lösung (z.B. 3)"
                  className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-lg font-semibold"
                />
                <input
                  type="text"
                  value={solution2}
                  onChange={(e) => setSolution2(e.target.value)}
                  placeholder="Zweite Lösung (optional, z.B. -3)"
                  className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-lg font-semibold"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 mb-6">
              <button
                onClick={checkAnswer}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-bold text-lg hover:bg-blue-700 transition"
              >
                Überprüfen
              </button>
              <button
                onClick={() => setShowSolution(!showSolution)}
                className="flex-1 px-6 py-3 bg-orange-500 text-white rounded-lg font-bold text-lg hover:bg-orange-600 transition"
              >
                {showSolution ? 'Ausblenden' : 'Lösung anzeigen'}
              </button>
            </div>

            {/* Feedback */}
            {feedback && (
              <div
                className={`p-4 rounded-lg text-center font-bold text-lg mb-6 ${
                  feedback.startsWith('✓')
                    ? 'bg-green-100 text-green-800 border-2 border-green-300'
                    : feedback.includes('Bitte')
                    ? 'bg-yellow-100 text-yellow-800 border-2 border-yellow-300'
                    : 'bg-red-100 text-red-800 border-2 border-red-300'
                }`}
              >
                {feedback}
              </div>
            )}

            {/* Lösung */}
            {showSolution && (
              <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200">
                <p className="text-lg font-bold text-blue-900 mb-2">Lösung:</p>
                <p className="text-2xl font-bold text-green-700">
                  L = {'{'}
                  {currentAufgabe.loesungen.length === 0
                    ? '∅'
                    : currentAufgabe.loesungen
                        .map((x) => (Number.isInteger(x) ? x.toString() : x.toFixed(1)))
                        .join(';  ')}
                  {'}'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

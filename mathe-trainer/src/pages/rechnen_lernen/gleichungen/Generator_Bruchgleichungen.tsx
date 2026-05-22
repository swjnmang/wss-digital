import React, { useState } from 'react';

/**
 * Vergleicht zwei Lösungen auf Äquivalenz
 * Akzeptiert Rundungen auf 1-2 Dezimalstellen
 */
function areEquivalentSolutions(input: string, expectedSolution: number): boolean {
  try {
    const userSolution = parseFloat(input.trim());
    if (isNaN(userSolution)) return false;
    
    // Runde beide Werte auf maximal 2 Dezimalstellen für Vergleich
    const rounded1 = Math.round(userSolution * 100) / 100;
    const rounded2 = Math.round(expectedSolution * 100) / 100;
    
    return Math.abs(rounded1 - rounded2) < 0.01;
  } catch {
    return false;
  }
}

interface Aufgabe {
  id: string;
  aufgabe: string;
  loesung: number;
  rechenweg: string[];
}

interface Kategorie {
  name: string;
  aufgaben: Aufgabe[];
}

const AUFGABEN_KATEGORIEN: Kategorie[] = [
  {
    name: 'Einfach',
    aufgaben: [
      // Typ: A = X/B => X = A*B
      { id: 'e1', aufgabe: '2 = x/3', loesung: 6, rechenweg: ['2 = x/3', 'Multipliziere beide Seiten mit 3', '2 · 3 = (x/3) · 3', '6 = x', 'x = 6'] },
      { id: 'e2', aufgabe: '5 = x/4', loesung: 20, rechenweg: ['5 = x/4', 'Multipliziere beide Seiten mit 4', '5 · 4 = (x/4) · 4', '20 = x', 'x = 20'] },
      { id: 'e3', aufgabe: '3 = x/2', loesung: 6, rechenweg: ['3 = x/2', 'Multipliziere beide Seiten mit 2', '3 · 2 = (x/2) · 2', '6 = x', 'x = 6'] },
      { id: 'e4', aufgabe: '4 = x/5', loesung: 20, rechenweg: ['4 = x/5', 'Multipliziere beide Seiten mit 5', '4 · 5 = (x/5) · 5', '20 = x', 'x = 20'] },
      { id: 'e5', aufgabe: '7 = x/2', loesung: 14, rechenweg: ['7 = x/2', 'Multipliziere beide Seiten mit 2', '7 · 2 = (x/2) · 2', '14 = x', 'x = 14'] },
      // Typ: B = A/X => X = A/B
      { id: 'e6', aufgabe: '3 = 12/x', loesung: 4, rechenweg: ['3 = 12/x', 'Multipliziere beide Seiten mit x', '3x = 12', 'Teile beide Seiten durch 3', 'x = 4'] },
      { id: 'e7', aufgabe: '2 = 8/x', loesung: 4, rechenweg: ['2 = 8/x', 'Multipliziere beide Seiten mit x', '2x = 8', 'Teile beide Seiten durch 2', 'x = 4'] },
      { id: 'e8', aufgabe: '5 = 25/x', loesung: 5, rechenweg: ['5 = 25/x', 'Multipliziere beide Seiten mit x', '5x = 25', 'Teile beide Seiten durch 5', 'x = 5'] },
      { id: 'e9', aufgabe: '4 = 16/x', loesung: 4, rechenweg: ['4 = 16/x', 'Multipliziere beide Seiten mit x', '4x = 16', 'Teile beide Seiten durch 4', 'x = 4'] },
      { id: 'e10', aufgabe: '6 = 18/x', loesung: 3, rechenweg: ['6 = 18/x', 'Multipliziere beide Seiten mit x', '6x = 18', 'Teile beide Seiten durch 6', 'x = 3'] },
    ],
  },
  {
    name: 'Mittel',
    aufgaben: [
      // Typ: A = X/B
      { id: 'm1', aufgabe: '8 = x/3', loesung: 24, rechenweg: ['8 = x/3', 'Multipliziere beide Seiten mit 3', '8 · 3 = (x/3) · 3', '24 = x', 'x = 24'] },
      { id: 'm2', aufgabe: '6 = x/4', loesung: 24, rechenweg: ['6 = x/4', 'Multipliziere beide Seiten mit 4', '6 · 4 = (x/4) · 4', '24 = x', 'x = 24'] },
      { id: 'm3', aufgabe: '9 = x/5', loesung: 45, rechenweg: ['9 = x/5', 'Multipliziere beide Seiten mit 5', '9 · 5 = (x/5) · 5', '45 = x', 'x = 45'] },
      { id: 'm4', aufgabe: '7 = x/6', loesung: 42, rechenweg: ['7 = x/6', 'Multipliziere beide Seiten mit 6', '7 · 6 = (x/6) · 6', '42 = x', 'x = 42'] },
      { id: 'm5', aufgabe: '11 = x/3', loesung: 33, rechenweg: ['11 = x/3', 'Multipliziere beide Seiten mit 3', '11 · 3 = (x/3) · 3', '33 = x', 'x = 33'] },
      { id: 'm6', aufgabe: '2.5 = x/4', loesung: 10, rechenweg: ['2.5 = x/4', 'Multipliziere beide Seiten mit 4', '2.5 · 4 = (x/4) · 4', '10 = x', 'x = 10'] },
      { id: 'm7', aufgabe: '3.5 = x/2', loesung: 7, rechenweg: ['3.5 = x/2', 'Multipliziere beide Seiten mit 2', '3.5 · 2 = (x/2) · 2', '7 = x', 'x = 7'] },
      { id: 'm8', aufgabe: '4.5 = x/2', loesung: 9, rechenweg: ['4.5 = x/2', 'Multipliziere beide Seiten mit 2', '4.5 · 2 = (x/2) · 2', '9 = x', 'x = 9'] },
      // Typ: B = A/X
      { id: 'm9', aufgabe: '7 = 35/x', loesung: 5, rechenweg: ['7 = 35/x', 'Multipliziere beide Seiten mit x', '7x = 35', 'Teile beide Seiten durch 7', 'x = 5'] },
      { id: 'm10', aufgabe: '8 = 32/x', loesung: 4, rechenweg: ['8 = 32/x', 'Multipliziere beide Seiten mit x', '8x = 32', 'Teile beide Seiten durch 8', 'x = 4'] },
      { id: 'm11', aufgabe: '9 = 45/x', loesung: 5, rechenweg: ['9 = 45/x', 'Multipliziere beide Seiten mit x', '9x = 45', 'Teile beide Seiten durch 9', 'x = 5'] },
      { id: 'm12', aufgabe: '10 = 50/x', loesung: 5, rechenweg: ['10 = 50/x', 'Multipliziere beide Seiten mit x', '10x = 50', 'Teile beide Seiten durch 10', 'x = 5'] },
      { id: 'm13', aufgabe: '12 = 36/x', loesung: 3, rechenweg: ['12 = 36/x', 'Multipliziere beide Seiten mit x', '12x = 36', 'Teile beide Seiten durch 12', 'x = 3'] },
      { id: 'm14', aufgabe: '6 = 24/x', loesung: 4, rechenweg: ['6 = 24/x', 'Multipliziere beide Seiten mit x', '6x = 24', 'Teile beide Seiten durch 6', 'x = 4'] },
      { id: 'm15', aufgabe: '5 = 40/x', loesung: 8, rechenweg: ['5 = 40/x', 'Multipliziere beide Seiten mit x', '5x = 40', 'Teile beide Seiten durch 5', 'x = 8'] },
    ],
  },
  {
    name: 'Schwer',
    aufgaben: [
      // Typ: A = X/B mit größeren Zahlen
      { id: 's1', aufgabe: '13 = x/4', loesung: 52, rechenweg: ['13 = x/4', 'Multipliziere beide Seiten mit 4', '13 · 4 = (x/4) · 4', '52 = x', 'x = 52'] },
      { id: 's2', aufgabe: '15 = x/3', loesung: 45, rechenweg: ['15 = x/3', 'Multipliziere beide Seiten mit 3', '15 · 3 = (x/3) · 3', '45 = x', 'x = 45'] },
      { id: 's3', aufgabe: '14 = x/2', loesung: 28, rechenweg: ['14 = x/2', 'Multipliziere beide Seiten mit 2', '14 · 2 = (x/2) · 2', '28 = x', 'x = 28'] },
      { id: 's4', aufgabe: '19 = x/3', loesung: 57, rechenweg: ['19 = x/3', 'Multipliziere beide Seiten mit 3', '19 · 3 = (x/3) · 3', '57 = x', 'x = 57'] },
      { id: 's5', aufgabe: '22 = x/2', loesung: 44, rechenweg: ['22 = x/2', 'Multipliziere beide Seiten mit 2', '22 · 2 = (x/2) · 2', '44 = x', 'x = 44'] },
      { id: 's6', aufgabe: '6.5 = x/4', loesung: 26, rechenweg: ['6.5 = x/4', 'Multipliziere beide Seiten mit 4', '6.5 · 4 = (x/4) · 4', '26 = x', 'x = 26'] },
      { id: 's7', aufgabe: '8.5 = x/2', loesung: 17, rechenweg: ['8.5 = x/2', 'Multipliziere beide Seiten mit 2', '8.5 · 2 = (x/2) · 2', '17 = x', 'x = 17'] },
      { id: 's8', aufgabe: '12.5 = x/4', loesung: 50, rechenweg: ['12.5 = x/4', 'Multipliziere beide Seiten mit 4', '12.5 · 4 = (x/4) · 4', '50 = x', 'x = 50'] },
      // Typ: B = A/X mit größeren Zahlen
      { id: 's9', aufgabe: '11 = 55/x', loesung: 5, rechenweg: ['11 = 55/x', 'Multipliziere beide Seiten mit x', '11x = 55', 'Teile beide Seiten durch 11', 'x = 5'] },
      { id: 's10', aufgabe: '13 = 65/x', loesung: 5, rechenweg: ['13 = 65/x', 'Multipliziere beide Seiten mit x', '13x = 65', 'Teile beide Seiten durch 13', 'x = 5'] },
      { id: 's11', aufgabe: '15 = 60/x', loesung: 4, rechenweg: ['15 = 60/x', 'Multipliziere beide Seiten mit x', '15x = 60', 'Teile beide Seiten durch 15', 'x = 4'] },
      { id: 's12', aufgabe: '20 = 100/x', loesung: 5, rechenweg: ['20 = 100/x', 'Multipliziere beide Seiten mit x', '20x = 100', 'Teile beide Seiten durch 20', 'x = 5'] },
      { id: 's13', aufgabe: '25 = 150/x', loesung: 6, rechenweg: ['25 = 150/x', 'Multipliziere beide Seiten mit x', '25x = 150', 'Teile beide Seiten durch 25', 'x = 6'] },
      { id: 's14', aufgabe: '16 = 48/x', loesung: 3, rechenweg: ['16 = 48/x', 'Multipliziere beide Seiten mit x', '16x = 48', 'Teile beide Seiten durch 16', 'x = 3'] },
      { id: 's15', aufgabe: '18 = 72/x', loesung: 4, rechenweg: ['18 = 72/x', 'Multipliziere beide Seiten mit x', '18x = 72', 'Teile beide Seiten durch 18', 'x = 4'] },
    ],
  },
];

export default function Generator_Bruchgleichungen() {
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [answers, setAnswers] = useState<Record<string, { value: string; isCorrect: boolean | null }>>({});
  const [showSolutions, setShowSolutions] = useState<Record<string, boolean>>({});

  const currentKategorie = AUFGABEN_KATEGORIEN[selectedCategory];
  const currentAufgaben = currentKategorie.aufgaben;

  const handleInputChange = (aufgabenId: string, value: string) => {
    const trimmedValue = value.trim();

    // Finde die zugehörige Aufgabe
    const aufgabe = currentAufgaben.find((a) => a.id === aufgabenId);
    if (!aufgabe) return;

    const isCorrect = trimmedValue ? areEquivalentSolutions(trimmedValue, aufgabe.loesung) : null;

    setAnswers({
      ...answers,
      [aufgabenId]: { value: trimmedValue, isCorrect },
    });
  };

  const toggleSolution = (aufgabenId: string) => {
    setShowSolutions({
      ...showSolutions,
      [aufgabenId]: !showSolutions[aufgabenId],
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 p-3">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-purple-900 mb-1">Bruchgleichungen lösen</h1>
          <p className="text-xs text-gray-600">
            Löse die Bruchgleichung und gib nur die Lösung für x ein (z.B.: 5, -2, 1.5)
          </p>
        </div>

        {/* Kategorie Tabs */}
        <div className="flex flex-wrap gap-2 mb-4">
          {AUFGABEN_KATEGORIEN.map((kategorie, index) => (
            <button
              key={index}
              onClick={() => setSelectedCategory(index)}
              className={`px-3 py-1 text-sm rounded font-semibold transition-all ${
                selectedCategory === index
                  ? 'bg-purple-500 text-white shadow-lg'
                  : 'bg-white text-gray-700 border border-gray-300 hover:border-purple-300'
              }`}
            >
              {kategorie.name} ({kategorie.aufgaben.length})
            </button>
          ))}
        </div>

        {/* Aufgaben */}
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <p className="text-sm font-semibold text-gray-700 mb-2 col-span-full">Löse die Bruchgleichung</p>
          {currentAufgaben.map((aufgabe, index) => {
            const answer = answers[aufgabe.id] || { value: '', isCorrect: null };
            const showSolution = showSolutions[aufgabe.id] || false;

            return (
              <div key={aufgabe.id} className="space-y-0 col-span-1">
                {/* Aufgabe in einer Zeile */}
                <div className="bg-white rounded p-2 shadow border-l-2 border-purple-300 flex items-center gap-2">
                  {/* Nummer */}
                  <span className="text-sm font-bold text-gray-600 whitespace-nowrap">
                    {index + 1})
                  </span>

                  {/* Aufgabe */}
                  <div className="text-sm font-mono bg-gray-50 px-2 py-1 rounded border border-gray-200 whitespace-nowrap">
                    {aufgabe.aufgabe}
                  </div>

                  {/* Gleichheitszeichen */}
                  <span className="text-lg font-bold text-gray-500">=</span>

                  {/* Input */}
                  <input
                    type="text"
                    placeholder="..."
                    value={answer.value}
                    onChange={(e) => handleInputChange(aufgabe.id, e.target.value)}
                    className={`flex-1 min-w-0 px-2 py-1 rounded border-2 font-mono text-sm transition-all ${
                      answer.isCorrect === null
                        ? 'border-gray-300 focus:border-purple-500 focus:ring-1 focus:ring-purple-200'
                        : answer.isCorrect
                        ? 'border-green-500 bg-green-50 focus:ring-1 focus:ring-green-200'
                        : 'border-red-500 bg-red-50 focus:ring-1 focus:ring-red-200'
                    }`}
                  />

                  {/* Status Indicator */}
                  <div className="w-5 h-5 flex items-center justify-center">
                    {answer.isCorrect === true && (
                      <span className="text-green-600 font-bold text-sm">✓</span>
                    )}
                    {answer.isCorrect === false && (
                      <span className="text-red-600 font-bold text-sm">✗</span>
                    )}
                  </div>

                  {/* Button */}
                  <button
                    onClick={() => toggleSolution(aufgabe.id)}
                    className="text-sm px-2 py-1 bg-purple-500 text-white rounded hover:bg-purple-600 transition-all whitespace-nowrap font-semibold"
                  >
                    {showSolution ? '✕' : '?'}
                  </button>
                </div>

                {/* Rechenweg - ausklappbar unter der Aufgabe */}
                {showSolution && (
                  <div className="p-2 bg-purple-50 rounded border-l-2 border-purple-400 text-sm ml-8">
                    <div className="space-y-0.5">
                      {aufgabe.rechenweg.map((schritt, i) => (
                        <p key={i} className="text-gray-700">
                          {i > 0 && '→ '} {schritt}
                        </p>
                      ))}
                    </div>
                    <p className="font-semibold text-purple-900 mt-1">
                      Lösung: <span className="font-mono bg-white px-1 rounded">x = {aufgabe.loesung}</span>
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
            Fortschritt: {Object.values(answers).filter((a) => a.isCorrect === true).length} /{' '}
            {currentAufgaben.length} korrekt
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div
              className="bg-purple-500 h-2 rounded-full transition-all"
              style={{
                width: `${
                  (Object.values(answers).filter((a) => a.isCorrect === true).length /
                    currentAufgaben.length) *
                  100
                }%`,
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, CheckCircle, XCircle, Calculator, Youtube } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Dataset {
  values: number[];
  mean: number;
  median: number;
  mode: number[];
  range: number;
  min: number;
  max: number;
  context: string;
  unit: string;
}

const StatistischeKennwerte: React.FC = () => {
  const [data, setData] = useState<Dataset | null>(null);
  const [userInputs, setUserInputs] = useState({
    mean: '',
    median: '',
    mode: '',
    range: '',
    min: '',
    max: ''
  });
  const [feedback, setFeedback] = useState<{ [key: string]: boolean | null }>({});
  const [showSolution, setShowSolution] = useState(false);

  const scenarios = [
    {
      name: "Klassenarbeit Noten",
      text: "In einer Klasse wurden folgende Noten geschrieben:",
      unit: "",
      gen: () => Array.from({ length: Math.floor(Math.random() * 5) + 8 }, () => Math.floor(Math.random() * 6) + 1)
    },
    {
      name: "Körpergrößen",
      text: "Die Körpergrößen (in cm) einer Gruppe von Schülern sind:",
      unit: "cm",
      gen: () => Array.from({ length: Math.floor(Math.random() * 5) + 5 }, () => Math.floor(Math.random() * 40) + 150)
    },
    {
      name: "Temperaturen",
      text: "Die gemessenen Temperaturen (in °C) der letzten Tage waren:",
      unit: "°C",
      gen: () => Array.from({ length: 7 }, () => Math.floor(Math.random() * 25) + 5)
    },
    {
      name: "Tore",
      text: "Die Anzahl der Tore in den letzten Fußballspielen waren:",
      unit: "Tore",
      gen: () => Array.from({ length: Math.floor(Math.random() * 5) + 6 }, () => Math.floor(Math.random() * 5))
    },
    {
      name: "Schuhgrößen",
      text: "Die Schuhgrößen einer Gruppe von Jugendlichen sind:",
      unit: "",
      gen: () => Array.from({ length: Math.floor(Math.random() * 5) + 6 }, () => Math.floor(Math.random() * 10) + 35)
    }
  ];

  const generateData = () => {
    const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    const rawValues = scenario.gen();
    const sortedValues = [...rawValues].sort((a, b) => a - b);
    const count = rawValues.length;

    const sum = sortedValues.reduce((a, b) => a + b, 0);
    const mean = parseFloat((sum / count).toFixed(2));
    
    const mid = Math.floor(count / 2);
    const median = count % 2 !== 0 ? sortedValues[mid] : (sortedValues[mid - 1] + sortedValues[mid]) / 2;

    const counts: { [key: number]: number } = {};
    sortedValues.forEach(v => counts[v] = (counts[v] || 0) + 1);
    let maxFreq = 0;
    for (const v in counts) {
      if (counts[v] > maxFreq) maxFreq = counts[v];
    }
    const mode = Object.keys(counts).map(Number).filter(k => counts[k] === maxFreq);

    const min = Math.min(...sortedValues);
    const max = Math.max(...sortedValues);
    const range = max - min;

    setData({ values: rawValues, mean, median, mode, range, min, max, context: scenario.text, unit: scenario.unit });
    setUserInputs({ mean: '', median: '', mode: '', range: '', min: '', max: '' });
    setFeedback({});
    setShowSolution(false);
  };

  useEffect(() => {
    generateData();
  }, []);

  const checkAnswers = () => {
    if (!data) return;

    const newFeedback: { [key: string]: boolean } = {};

    // Mean (allow small error margin)
    const userMean = parseFloat(userInputs.mean.replace(',', '.'));
    newFeedback.mean = !isNaN(userMean) && Math.abs(userMean - data.mean) < 0.1;

    // Median
    const userMedian = parseFloat(userInputs.median.replace(',', '.'));
    newFeedback.median = !isNaN(userMedian) && userMedian === data.median;

    // Mode (comma separated if multiple)
    const userModes = userInputs.mode.split(/[,;]/).map(s => parseFloat(s.trim())).filter(n => !isNaN(n)).sort((a, b) => a - b);
    const correctModes = [...data.mode].sort((a, b) => a - b);
    // Check if arrays are equal
    const modeCorrect = userModes.length === correctModes.length && userModes.every((val, index) => val === correctModes[index]);
    newFeedback.mode = modeCorrect;

    // Range
    const userRange = parseFloat(userInputs.range.replace(',', '.'));
    newFeedback.range = !isNaN(userRange) && userRange === data.range;

    // Min
    const userMin = parseFloat(userInputs.min.replace(',', '.'));
    newFeedback.min = !isNaN(userMin) && userMin === data.min;

    // Max
    const userMax = parseFloat(userInputs.max.replace(',', '.'));
    newFeedback.max = !isNaN(userMax) && userMax === data.max;

    setFeedback(newFeedback);
    setShowSolution(true);
  };

  const handleInputChange = (field: string, value: string) => {
    setUserInputs(prev => ({ ...prev, [field]: value }));
  };

  const getInputClass = (field: string) => {
    const baseClass = "w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none";
    if (!showSolution) return baseClass + " border-gray-300";
    return baseClass + (feedback[field] ? " border-green-500 bg-green-50" : " border-red-500 bg-red-50");
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center mb-4">
        <Link to="/daten-und-zufall" className="flex items-center text-blue-600 hover:text-blue-800">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Zurück zur Übersicht
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex items-center gap-2">
          <Calculator className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-800">Statistische Kennwerte</h2>
        </div>
        <div className="p-6 space-y-6">
          <div className="bg-slate-100 p-6 rounded-lg text-center">
            <h3 className="text-lg font-semibold mb-2">Aufgabe:</h3>
            <p className="text-md mb-4 text-gray-700">{data?.context}</p>
            <div className="text-2xl font-mono tracking-wider mb-2">
              {data?.values.join(', ')} {data?.unit && <span className="text-lg text-gray-600 ml-1">{data.unit}</span>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="min" className="block text-sm font-medium text-gray-700">Minimum</label>
                <div className="flex items-center gap-2">
                  <input 
                    id="min" 
                    value={userInputs.min} 
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('min', e.target.value)}
                    className={getInputClass('min')}
                    placeholder="Wert eingeben"
                  />
                  {showSolution && (feedback.min ? <CheckCircle className="text-green-500 w-5 h-5 flex-shrink-0" /> : <span className="text-red-500 font-semibold flex-shrink-0">{data?.min}</span>)}
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="max" className="block text-sm font-medium text-gray-700">Maximum</label>
                <div className="flex items-center gap-2">
                  <input 
                    id="max" 
                    value={userInputs.max} 
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('max', e.target.value)}
                    className={getInputClass('max')}
                    placeholder="Wert eingeben"
                  />
                  {showSolution && (feedback.max ? <CheckCircle className="text-green-500 w-5 h-5 flex-shrink-0" /> : <span className="text-red-500 font-semibold flex-shrink-0">{data?.max}</span>)}
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="range" className="block text-sm font-medium text-gray-700">Spannweite (Range)</label>
                <div className="flex items-center gap-2">
                  <input 
                    id="range" 
                    value={userInputs.range} 
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('range', e.target.value)}
                    className={getInputClass('range')}
                    placeholder="Wert eingeben"
                  />
                  {showSolution && (feedback.range ? <CheckCircle className="text-green-500 w-5 h-5 flex-shrink-0" /> : <span className="text-red-500 font-semibold flex-shrink-0">{data?.range}</span>)}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="mean" className="block text-sm font-medium text-gray-700">Arithmetisches Mittel (Durchschnitt)</label>
                <div className="flex items-center gap-2">
                  <input 
                    id="mean" 
                    value={userInputs.mean} 
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('mean', e.target.value)}
                    className={getInputClass('mean')}
                    placeholder="Wert eingeben"
                  />
                  {showSolution && (feedback.mean ? <CheckCircle className="text-green-500 w-5 h-5 flex-shrink-0" /> : <span className="text-red-500 font-semibold flex-shrink-0">{data?.mean}</span>)}
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="median" className="block text-sm font-medium text-gray-700">Median (Zentralwert)</label>
                <div className="flex items-center gap-2">
                  <input 
                    id="median" 
                    value={userInputs.median} 
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('median', e.target.value)}
                    className={getInputClass('median')}
                    placeholder="Wert eingeben"
                  />
                  {showSolution && (feedback.median ? <CheckCircle className="text-green-500 w-5 h-5 flex-shrink-0" /> : <span className="text-red-500 font-semibold flex-shrink-0">{data?.median}</span>)}
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="mode" className="block text-sm font-medium text-gray-700">Modalwert (Modus)</label>
                <div className="flex items-center gap-2">
                  <input 
                    id="mode" 
                    value={userInputs.mode} 
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('mode', e.target.value)}
                    className={getInputClass('mode')}
                    placeholder="Wert eingeben"
                  />
                  {showSolution && (feedback.mode ? <CheckCircle className="text-green-500 w-5 h-5 flex-shrink-0" /> : <span className="text-red-500 font-semibold flex-shrink-0">{data?.mode.join(', ')}</span>)}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 mt-6">
            <button 
              onClick={checkAnswers} 
              className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Lösung prüfen
            </button>
            <button 
              onClick={generateData} 
              className="w-full sm:w-auto px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Neue Aufgabe
            </button>
            <a 
              href="https://youtu.be/UxKgca3l1G4?si=RmHTHR7RnA5oywNV" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center justify-center gap-2 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              <Youtube className="w-4 h-4" />
              Erklärvideo
            </a>
          </div>

          {showSolution && (
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-md text-blue-800">
              <strong>Hinweis:</strong> Bei mehreren Modalwerten alle mit Komma trennen. Das arithmetische Mittel auf 2 Nachkommastellen runden.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatistischeKennwerte;

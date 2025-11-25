import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface TaskData {
  description: string;
  items: { [key: string]: number };
  colors: string[];
  total: number;
  withReplacement: boolean;
  solution: {
    stage1: { [key: string]: string };
    stage2: { [key: string]: string };
  };
}

const Baumdiagramme2: React.FC = () => {
  const [task, setTask] = useState<TaskData | null>(null);
  const [userInputs, setUserInputs] = useState<{ [key: string]: { num: string, den: string } }>({});
  const [activeInputs, setActiveInputs] = useState<{ [key: string]: boolean }>({});
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: "" });
  const [validationResults, setValidationResults] = useState<{ [key: string]: boolean | null }>({});

  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        setDimensions({ width, height: width * 0.7 });
      }
    };

    window.addEventListener('resize', updateDimensions);
    updateDimensions();

    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const generateTask = () => {
    const scenarios = [
      { type: "Urne", text: "In einer Urne befinden sich {items}. Du ziehst zweimal {replacement}." },
      { type: "Lostrommel", text: "In einer Lostrommel sind {items}. Du ziehst zwei Lose nacheinander." },
      { type: "Glücksrad", text: "Ein Glücksrad mit {total} Feldern ({items}) wird zweimal gedreht." }
    ];

    const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    const withReplacement = scenario.type === "Glücksrad" ? true : (scenario.type === "Lostrommel" ? false : Math.random() > 0.5);
    const availableItems = scenario.type === "Lostrommel" ? ['Gewinn', 'Niete'] : ['rot', 'blau', 'gelb', 'grün'];
    const numColors = scenario.type === "Lostrommel" ? 2 : (Math.random() > 0.4 ? 2 : 3);

    let items: { [key: string]: number } = {};
    let colors: string[] = [];
    let total = 0;
    let itemsTextParts: string[] = [];

    for (let i = 0; i < numColors; i++) {
      const color = availableItems[i];
      const count = Math.floor(Math.random() * 6) + 3;
      items[color] = count;
      colors.push(color);
      total += count;

      if (color === 'Niete') itemsTextParts.push(`${count} ${count > 1 ? 'Nieten' : 'Niete'}`);
      else if (color === 'Gewinn') itemsTextParts.push(`${count} ${count > 1 ? 'Gewinne' : 'Gewinn'}`);
      else itemsTextParts.push(`${count} ${color}e`);
    }

    const itemsText = itemsTextParts.join(', ');
    const description = scenario.text
      .replace('{items}', itemsText)
      .replace('{total}', total.toString())
      .replace('{replacement}', withReplacement ? 'mit Zurücklegen' : 'ohne Zurücklegen');

    const solution: TaskData['solution'] = { stage1: {}, stage2: {} };

    colors.forEach(color1 => {
      solution.stage1[color1] = `${items[color1]}/${total}`;
      colors.forEach(color2 => {
        let num, den;
        if (withReplacement) {
          num = items[color2];
          den = total;
        } else {
          den = total - 1;
          num = (color1 === color2) ? items[color2] - 1 : items[color2];
        }
        solution.stage2[`${color1}_${color2}`] = `${Math.max(0, num)}/${den}`;
      });
    });

    setTask({ description, items, colors, total, withReplacement, solution });
    setUserInputs({});
    setActiveInputs({});
    setFeedback({ type: null, message: "" });
    setValidationResults({});
  };

  useEffect(() => {
    generateTask();
  }, []);

  const handleInputChange = (id: string, field: 'num' | 'den', value: string) => {
    setUserInputs(prev => ({
      ...prev,
      [id]: { ...prev[id] || { num: '', den: '' }, [field]: value }
    }));
  };

  const checkSolution = () => {
    if (!task) return;

    let allCorrect = true;
    const newValidationResults: { [key: string]: boolean } = {};

    const checkFraction = (id: string, correctFraction: string) => {
      const input = userInputs[id];
      if (!input || !input.num || !input.den) {
        newValidationResults[id] = false;
        allCorrect = false;
        return;
      }

      const [correctNum, correctDen] = correctFraction.split('/').map(Number);
      const userNum = parseInt(input.num, 10);
      const userDen = parseInt(input.den, 10);

      if (!isNaN(userNum) && !isNaN(userDen) && userDen !== 0 && Math.abs(userNum / userDen - correctNum / correctDen) < 0.0001) {
        newValidationResults[id] = true;
      } else {
        newValidationResults[id] = false;
        allCorrect = false;
      }
    };

    task.colors.forEach(color1 => {
      checkFraction(`s1_${color1}`, task.solution.stage1[color1]);
      task.colors.forEach(color2 => {
        checkFraction(`s2_${color1}_${color2}`, task.solution.stage2[`${color1}_${color2}`]);
      });
    });

    setValidationResults(newValidationResults);

    if (allCorrect) {
      setFeedback({ type: 'success', message: "Super! Alles richtig gelöst." });
    } else {
      setFeedback({ type: 'error', message: "Leider nicht ganz richtig. Überprüfe die rot markierten Felder." });
    }
  };

  const mapColor = (name: string) => {
    const colorMap: { [key: string]: string } = {
      'rot': '#ef4444', 'blau': '#3b82f6', 'gelb': '#eab308', 'grün': '#22c55e',
      'gewinn': '#22c55e', 'niete': '#ef4444', 'grau': '#6b7280', 'weiss': '#f9fafb'
    };
    return colorMap[name.toLowerCase()] || '#9ca3af';
  };

  const renderTree = () => {
    if (!task) return null;

    const { width, height } = dimensions;
    const nodeRadius = Math.min(width, height) * 0.03;
    const startX = width * 0.1;
    const level1X = width * 0.4;
    const level2X = width * 0.75;
    const startY = height / 2;

    const elements: JSX.Element[] = [];

    // Start Node
    elements.push(
      <g key="start">
        <circle cx={startX} cy={startY} r={nodeRadius} fill={mapColor('grau')} stroke="#4b5563" strokeWidth="2" />
        <text x={startX} y={startY} textAnchor="middle" dy=".3em" fill="white" fontSize={nodeRadius} fontWeight="bold">Start</text>
      </g>
    );

    const level1Spacing = (height * 0.8) / task.colors.length;

    task.colors.forEach((color1, i) => {
      const y1 = (height * 0.1) + (i * level1Spacing) + (level1Spacing / 2);
      
      // Line to Level 1
      elements.push(
        <line key={`line_s1_${i}`} x1={startX + nodeRadius} y1={startY} x2={level1X - nodeRadius} y2={y1} stroke="#6b7280" strokeWidth="2" />
      );

      // Input for Level 1
      const inputX1 = (startX + level1X) / 2;
      const inputY1 = (startY + y1) / 2;
      elements.push(renderInput(`s1_${color1}`, inputX1, inputY1, i, task.colors.length, height * 0.05));

      // Node Level 1
      elements.push(
        <g key={`node_s1_${i}`}>
          <circle cx={level1X} cy={y1} r={nodeRadius} fill={mapColor(color1)} stroke="#4b5563" strokeWidth="2" />
          <text x={level1X} y={y1} textAnchor="middle" dy=".3em" fill={['weiss', 'gelb', 'gewinn'].includes(color1.toLowerCase()) ? '#1f2937' : 'white'} fontSize={nodeRadius * 0.8} fontWeight="bold">{color1.substring(0, 1).toUpperCase()}</text>
        </g>
      );

      const level2Spacing = level1Spacing / task.colors.length;

      task.colors.forEach((color2, j) => {
        const y2 = (y1 - level1Spacing / 2) + (j * level2Spacing) + (level2Spacing / 2);

        // Line to Level 2
        elements.push(
          <line key={`line_s2_${i}_${j}`} x1={level1X + nodeRadius} y1={y1} x2={level2X - nodeRadius} y2={y2} stroke="#6b7280" strokeWidth="2" />
        );

        // Input for Level 2
        const inputX2 = (level1X + level2X) / 2;
        const inputY2 = (y1 + y2) / 2;
        elements.push(renderInput(`s2_${color1}_${color2}`, inputX2, inputY2, j, task.colors.length, height * 0.04));

        // Node Level 2
        elements.push(
          <g key={`node_s2_${i}_${j}`}>
            <circle cx={level2X} cy={y2} r={nodeRadius} fill={mapColor(color2)} stroke="#4b5563" strokeWidth="2" />
            <text x={level2X} y={y2} textAnchor="middle" dy=".3em" fill={['weiss', 'gelb', 'gewinn'].includes(color2.toLowerCase()) ? '#1f2937' : 'white'} fontSize={nodeRadius * 0.8} fontWeight="bold">{color2.substring(0, 1).toUpperCase()}</text>
          </g>
        );
      });
    });

    return elements;
  };

  const renderInput = (id: string, x: number, y: number, index: number, total: number, offsetBase: number) => {
    // Adjust Y position to avoid overlapping with lines
    let yOffset = 0;
    if (total > 1) {
        if (index === 0) yOffset = -offsetBase;
        else if (index === total - 1) yOffset = offsetBase;
    }
    const finalY = y + yOffset;

    const isActive = activeInputs[id];
    const isValid = validationResults[id];
    const inputState = isValid === true ? 'border-green-500 text-green-600' : isValid === false ? 'border-red-500 text-red-600' : 'border-gray-300';

    return (
      <foreignObject key={`input_${id}`} x={x - 25} y={finalY - 25} width="50" height="50" className="overflow-visible">
        {!isActive ? (
          <div 
            className={`w-8 h-8 bg-white border-2 ${isValid === true ? 'border-green-500 bg-green-50' : 'border-gray-300'} rounded-full flex items-center justify-center cursor-pointer shadow-sm hover:bg-gray-50 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2`}
            onClick={() => setActiveInputs(prev => ({ ...prev, [id]: true }))}
          >
            {isValid === true ? <CheckCircle className="w-5 h-5 text-green-600" /> : <span className="font-bold text-gray-600">?</span>}
          </div>
        ) : (
          <div className="flex flex-col items-center bg-white p-1 rounded shadow-md border border-gray-200 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
            <input 
              type="text" 
              className={`w-8 h-6 text-center text-sm border rounded ${inputState}`}
              value={userInputs[id]?.num || ''}
              onChange={(e) => handleInputChange(id, 'num', e.target.value)}
              placeholder="?"
            />
            <div className="w-full h-px bg-gray-800 my-1"></div>
            <input 
              type="text" 
              className={`w-8 h-6 text-center text-sm border rounded ${inputState}`}
              value={userInputs[id]?.den || ''}
              onChange={(e) => handleInputChange(id, 'den', e.target.value)}
              placeholder="?"
            />
          </div>
        )}
      </foreignObject>
    );
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Link to="/daten-und-zufall" className="flex items-center text-blue-600 hover:text-blue-800 mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Zurück zur Übersicht
      </Link>

      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">Interaktives Baumdiagramm-Training</h2>
        </div>
        <div className="p-6 space-y-6">
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <h3 className="font-semibold mb-2">Deine Aufgabe:</h3>
            <p className="text-lg mb-4">{task?.description}</p>
            
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={checkSolution}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Lösung prüfen
              </button>
              <button 
                onClick={generateTask}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Neue Aufgabe
              </button>
              <a
                href="https://youtu.be/PcKEXYJ4C-U?si=CwwSuTa6C-e6PktL"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 flex items-center"
              >
                Erklärvideo anschauen
              </a>
            </div>

            {feedback.message && (
              <div className={`mt-4 p-4 rounded-md flex items-start ${feedback.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                {feedback.type === 'success' ? <CheckCircle className="h-5 w-5 mt-0.5 mr-2" /> : <XCircle className="h-5 w-5 mt-0.5 mr-2" />}
                <div className="font-medium">
                  {feedback.message}
                </div>
              </div>
            )}
          </div>

          <div ref={containerRef} className="w-full overflow-hidden bg-white rounded-lg border border-slate-200 relative" style={{ height: dimensions.height }}>
            <svg width={dimensions.width} height={dimensions.height} viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}>
              {renderTree()}
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Baumdiagramme2;

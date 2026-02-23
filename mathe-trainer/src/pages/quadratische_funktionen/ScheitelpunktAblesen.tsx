import React, { useState, useEffect, useRef } from 'react';

declare global {
  interface Window {
    GGBApplet: any;
  }
}

interface Task {
  a: number;
  xs: number;
  ys: number;
  type: 'graph' | 'equation';
  solutionSteps: string;
}

const ScheitelpunktAblesen = () => {
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [task, setTask] = useState<Task | null>(null);
  const [tasksCompleted, setTasksCompleted] = useState(0);
  
  const [userXs, setUserXs] = useState<string>('');
  const [userYs, setUserYs] = useState<string>('');
  const [feedback, setFeedback] = useState<string>('');
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [showSolution, setShowSolution] = useState<boolean>(false);

  const ggbApiRef = useRef<any>(null);
  const VIDEO_URL = "https://www.youtube.com/watch?v=VgsmYGAI-_8&list=PLI8kX0XEfSugainT6dHh9wGTGikzJ76d2&index=6";

  const formatNumber = (num: number) => Math.round(num * 100) / 100;
  const randomInt = (max: number, min: number = 0) => Math.floor(Math.random() * (max - min + 1)) + min;
  const randomChoice = (arr: number[]) => arr[Math.floor(Math.random() * arr.length)];

  const generateNewTask = (level: 'easy' | 'medium' | 'hard') => {
    setFeedback('');
    setUserXs('');
    setUserYs('');
    setShowSolution(false);
    setIsCorrect(false);

    // Alternate between graph and equation type
    const taskType = tasksCompleted % 2 === 0 ? 'graph' : 'equation';

    let a: number, xs: number, ys: number;

    switch (level) {
      case 'easy':
        a = randomChoice([1, -1, 2, -2]);
        xs = randomInt(5, -5);
        ys = randomInt(5, -5);
        break;
      case 'medium':
        a = randomChoice([-2, -1.5, -0.5, 0.5, 1.5, 2]);
        xs = randomInt(8, -8) / 2;
        ys = randomInt(8, -8) / 2;
        break;
      case 'hard':
        a = randomChoice([-0.75, -0.25, 0.25, 0.75, randomInt(3, -3)]);
        xs = randomInt(16, -16) / 4;
        ys = randomInt(16, -16) / 4;
        break;
    }

    if (a === 0) a = 1;
    a = formatNumber(a);
    xs = formatNumber(xs);
    ys = formatNumber(ys);

    const xs_str = (xs >= 0) ? ` - ${xs}` : ` + ${Math.abs(xs)}`;
    const ys_str = (ys >= 0) ? ` + ${ys}` : ` - ${Math.abs(ys)}`;
    const equation = `y = ${a}(x${xs_str})²${ys_str}`;

    const solutionSteps = `
      Der Scheitelpunkt wird aus der Scheitelform y = a(x - xs)² + ys abgelesen.
      Das Vorzeichen in der Klammer wird umgekehrt: xs = ${xs}
      Der Wert nach dem ² wird direkt abgelesen: ys = ${ys}
      Also ist der Scheitelpunkt S(${xs}|${ys})
    `;

    const newTask = { a, xs, ys, type: taskType, solutionSteps };
    setTask(newTask);

    // Initialize GeoGebra for graph type
    if (taskType === 'graph') {
      setTimeout(() => {
        initializeGeoGebra(a, xs, ys);
      }, 100);
    }

    setTasksCompleted(t => t + 1);
  };

  const initializeGeoGebra = (a: number, xs: number, ys: number) => {
    const existing = document.querySelector('script[src="https://www.geogebra.org/apps/deployggb.js"]');
    
    const initApplet = () => {
      if (!window.GGBApplet) return;
      
      const params: any = {
        appName: 'classic',
        width: 500,
        height: 400,
        showToolBar: false,
        showAlgebraInput: false,
        showMenuBar: false,
        perspective: 'G',
        useBrowserForJS: true,
        enableShiftDragZoom: true,
        showResetIcon: true,
        appletOnLoad: (api: any) => {
          ggbApiRef.current = api;
          
          try {
            api.reset();
            // Draw the parabola: y = a(x-xs)² + ys
            api.evalCommand(`f(x) = ${a}*(x - (${xs}))^2 + ${ys}`);
            api.setColor('f', 0, 0, 255);
            api.setLineThickness('f', 3);
            
            // Mark the vertex
            api.evalCommand(`S = (${xs}, ${ys})`);
            api.setColor('S', 255, 0, 0);
            api.setPointSize('S', 8);
            api.setLabelVisible('S', true);
            
            // Set appropriate view
            const margin = 3;
            api.setCoordSystem(xs - margin - 2, xs + margin + 2, ys - 3, ys + 8);
          } catch (e) {
            console.error('GeoGebra error:', e);
          }
        }
      };

      try {
        const applet = new window.GGBApplet(params, true);
        applet.inject('ggb-scheitelpunkt');
      } catch (e) {
        console.error('GeoGebra injection error:', e);
      }
    };

    if (!existing) {
      const script = document.createElement('script');
      script.src = 'https://www.geogebra.org/apps/deployggb.js';
      script.async = true;
      script.onload = () => setTimeout(initApplet, 100);
      document.body.appendChild(script);
    } else if (window.GGBApplet) {
      setTimeout(initApplet, 100);
    }
  };

  useEffect(() => {
    generateNewTask(difficulty);
  }, [difficulty]);

  const checkSolution = () => {
    if (!task || userXs === '' || userYs === '') {
      setFeedback('Bitte fülle beide Felder (xs und ys) aus.');
      setIsCorrect(false);
      return;
    }

    const xsVal = parseFloat(userXs.replace(',', '.'));
    const ysVal = parseFloat(userYs.replace(',', '.'));

    const isXsCorrect = Math.abs(xsVal - task.xs) < 0.01;
    const isYsCorrect = Math.abs(ysVal - task.ys) < 0.01;

    if (isXsCorrect && isYsCorrect) {
      setFeedback('Richtig! Ausgezeichnet!');
      setIsCorrect(true);
    } else {
      setFeedback('Leider nicht ganz richtig. Überprüfe die Koordinaten des Scheitelpunkts!');
      setIsCorrect(false);
    }
  };

  if (!task) return <div>Lädt...</div>;

  const equation = task.type === 'equation' 
    ? `y = ${task.a}(x ${task.xs >= 0 ? '-' : '+'} ${Math.abs(task.xs)})² ${task.ys >= 0 ? '+' : '-'} ${Math.abs(task.ys)}`
    : '';

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Scheitelpunkt ablesen</h1>
      
      <div className="mb-6">
        <div className="flex gap-2 mb-4">
          <button 
            onClick={() => setDifficulty('easy')}
            className={`px-4 py-2 rounded ${difficulty === 'easy' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            Leicht
          </button>
          <button 
            onClick={() => setDifficulty('medium')}
            className={`px-4 py-2 rounded ${difficulty === 'medium' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            Mittel
          </button>
          <button 
            onClick={() => setDifficulty('hard')}
            className={`px-4 py-2 rounded ${difficulty === 'hard' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            Schwer
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <p className="text-lg mb-4 font-bold">
            {task.type === 'graph' 
              ? 'Lese den Scheitelpunkt aus dem Graphen ab:' 
              : 'Lese den Scheitelpunkt aus der Gleichung ab:'}
          </p>

          {task.type === 'graph' ? (
            <div id="ggb-scheitelpunkt" style={{ width: '100%', height: '400px', marginBottom: '20px' }}></div>
          ) : (
            <div className="text-2xl font-mono text-center bg-gray-50 p-4 rounded mb-6">
              {equation}
            </div>
          )}

          <div className="flex items-center justify-center gap-4 mb-6">
            <span className="text-xl">S (</span>
            <input
              type="text"
              value={userXs}
              onChange={(e) => setUserXs(e.target.value)}
              placeholder="xs"
              className="w-20 p-2 border rounded text-center"
            />
            <span className="text-xl">|</span>
            <input
              type="text"
              value={userYs}
              onChange={(e) => setUserYs(e.target.value)}
              placeholder="ys"
              className="w-20 p-2 border rounded text-center"
            />
            <span className="text-xl">)</span>
          </div>

          <div className="flex gap-4 justify-center">
            <button 
              onClick={checkSolution}
              className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
            >
              Prüfen
            </button>
            <button 
              onClick={() => generateNewTask(difficulty)}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              Neue Aufgabe
            </button>
          </div>

          {feedback && (
            <div className={`mt-4 text-center font-bold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
              {feedback}
            </div>
          )}

          {!isCorrect && feedback && (
            <div className="mt-4 text-center">
              <button 
                onClick={() => setShowSolution(true)}
                className="text-blue-600 hover:underline"
              >
                Lösung anzeigen
              </button>
            </div>
          )}
        </div>

        {showSolution && (
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h3 className="font-bold text-lg mb-4">Lösungsweg:</h3>
            <p className="whitespace-pre-wrap">{task.solutionSteps}</p>
          </div>
        )}
      </div>

      <div className="mt-8">
        <a 
          href={VIDEO_URL} 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
          </svg>
          Erklärvideo ansehen
        </a>
      </div>
    </div>
  );
};

export default ScheitelpunktAblesen;

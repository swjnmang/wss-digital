import React, { useState, useEffect, useRef } from 'react';

declare global {
  interface Window {
    GGBApplet: any;
  }
}

interface TaskState {
  a: number;
  correctAnswers: {
    1: string;
    2: string;
    3: string;
    4: string;
  };
  options3: string[];
}

export default function Normalparabel() {
  const [task, setTask] = useState<TaskState | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<{ text: string; type: 'correct' | 'incorrect' } | null>(null);
  const [showSolution, setShowSolution] = useState(false);
  const ggbApiRef = useRef<any>(null);

  useEffect(() => {
    // Load GeoGebra script once
    const existing = document.querySelector('script[src="https://www.geogebra.org/apps/deployggb.js"]');
    
    const initApplet = () => {
      if (!window.GGBApplet) return;
      
      const params: any = {
        appName: 'classic',
        width: 600,
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
          generateNewTask();
        }
      };

      try {
        const applet = new window.GGBApplet(params, true);
        applet.inject('ggb-normalparabel');
      } catch (e) {
        console.error('GeoGebra Error:', e);
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
  }, []);

  const generateNewTask = () => {
    const possibleA = [-4, -3, -2, -1.5, -0.5, 0.5, 1.5, 2, 3, 4];
    const a = possibleA[Math.floor(Math.random() * possibleA.length)];

    const correctAnswers = {
      1: Math.abs(a) > 1 ? 'gestreckt' : 'gestaucht',
      2: a > 0 ? 'oben' : 'unten',
      3: `y = ${a}x²`,
      4: a > 0 ? 'niedrigster' : 'hoechster'
    };

    let options3 = [correctAnswers[3]];
    options3.push(`y = ${-a}x²`);
    options3.push(`y = x²`);
    options3.sort(() => Math.random() - 0.5);

    const newTask = { a, correctAnswers, options3 };
    setTask(newTask);
    setCurrentQuestion(1);
    setFeedback(null);
    setShowSolution(false);
    
    // Update GeoGebra
    if (ggbApiRef.current) {
      try {
        ggbApiRef.current.reset();
        ggbApiRef.current.evalCommand(`f(x) = ${a}*x^2`);
        ggbApiRef.current.evalCommand('n(x) = x^2');
        ggbApiRef.current.setLineStyle('n', 1);
        ggbApiRef.current.setColor('n', 150, 150, 150);
        ggbApiRef.current.evalCommand('S=(0,0)');
        ggbApiRef.current.setLabelVisible('S', true);
        ggbApiRef.current.setCoordSystem(-5, 5, -5, 5);
      } catch (e) {
        console.error('GeoGebra update error:', e);
      }
    }
  };

  const checkAnswer = (qNumber: number, answer: string) => {
    if (!task) return;

    // @ts-ignore
    if (answer === task.correctAnswers[qNumber]) {
      setFeedback({ text: 'Richtig!', type: 'correct' });
      setScore(s => s + 1);
      setTimeout(() => {
        setFeedback(null);
        if (currentQuestion < 4) {
          setCurrentQuestion(c => c + 1);
        } else {
          setFeedback({ text: 'Sehr gut! Alle Fragen richtig beantwortet.', type: 'correct' });
        }
      }, 1000);
    } else {
      setFeedback({ text: 'Leider falsch. Versuche es erneut!', type: 'incorrect' });
      setScore(s => s - 0.5);
    }
  };

  const renderQuestion = () => {
    if (!task) return null;

    switch (currentQuestion) {
      case 1:
        return (
          <div className="question-block">
            <p className="font-bold mb-4">1. Ist die Parabel gestreckt oder gestaucht?</p>
            <div className="flex gap-4 justify-center">
              <button onClick={() => checkAnswer(1, 'gestreckt')} className="btn-option">Gestreckt (|a| &gt; 1)</button>
              <button onClick={() => checkAnswer(1, 'gestaucht')} className="btn-option">Gestaucht (|a| &lt; 1)</button>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="question-block">
            <p className="font-bold mb-4">2. Ist die Parabel nach oben oder unten geöffnet?</p>
            <div className="flex gap-4 justify-center">
              <button onClick={() => checkAnswer(2, 'oben')} className="btn-option">Nach oben (a &gt; 0)</button>
              <button onClick={() => checkAnswer(2, 'unten')} className="btn-option">Nach unten (a &lt; 0)</button>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="question-block">
            <p className="font-bold mb-4">3. Wie lautet die Funktionsgleichung?</p>
            <div className="flex gap-4 justify-center flex-wrap">
              {task.options3.map((opt, idx) => (
                <button key={idx} onClick={() => checkAnswer(3, opt)} className="btn-option">{opt}</button>
              ))}
            </div>
          </div>
        );
      case 4:
        return (
          <div className="question-block">
            <p className="font-bold mb-4">4. Ist der Scheitelpunkt der höchste oder niedrigste Punkt?</p>
            <div className="flex gap-4 justify-center">
              <button onClick={() => checkAnswer(4, 'niedrigster')} className="btn-option">Niedrigster (Tiefpunkt)</button>
              <button onClick={() => checkAnswer(4, 'hoechster')} className="btn-option">Höchster (Hochpunkt)</button>
            </div>
          </div>
        );
      default:
        return <div className="text-green-600 font-bold text-xl">Alle Fragen beantwortet!</div>;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200">
          <h1 className="text-2xl font-bold text-slate-800 mb-6 text-center">Eigenschaften von Parabeln</h1>
          
          <div className="mb-8 border rounded-lg overflow-hidden shadow-inner bg-white">
            <div id="ggb-normalparabel" style={{ width: '100%', height: '400px' }}></div>
          </div>

          <div className="text-center mb-6 text-slate-600 text-sm">
            Die graue Parabel ist die Normalparabel f(x) = x².
          </div>

          <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 mb-6 text-center min-h-[150px] flex flex-col justify-center">
            {renderQuestion()}
          </div>

          {feedback && (
            <div className={`text-center font-bold p-3 rounded mb-4 ${feedback.type === 'correct' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {feedback.text}
            </div>
          )}

          <div className="flex flex-wrap justify-center gap-4 items-center">
            <button onClick={generateNewTask} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded shadow transition-colors">
              Neue Aufgabe
            </button>
            <button 
              onClick={() => setShowSolution(true)} 
              className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded shadow transition-colors"
              disabled={showSolution}
            >
              Lösung anzeigen
            </button>
            <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded font-bold">
              Punkte: {score}
            </div>
          </div>

          {showSolution && task && (
            <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6 text-green-900">
              <h3 className="font-bold text-lg mb-4">Lösung:</h3>
              <p>Der Formfaktor ist <strong>a = {task.a}</strong>.</p>
              <ul className="list-disc list-inside space-y-2 mt-2">
                <li>
                  <strong>Frage 1 (Form):</strong> Der Betrag von a ist |{task.a}| = {Math.abs(task.a)}. 
                  Da |a| {Math.abs(task.a) > 1 ? '>' : '<'} 1, ist die Parabel <strong>{task.correctAnswers[1]}</strong>.
                </li>
                <li>
                  <strong>Frage 2 (Öffnung):</strong> Da a {task.a > 0 ? '>' : '<'} 0, ist die Parabel <strong>nach {task.correctAnswers[2]} geöffnet</strong>.
                </li>
                <li>
                  <strong>Frage 3 (Gleichung):</strong> Aus den Eigenschaften folgt die Gleichung <strong>{task.correctAnswers[3]}</strong>.
                </li>
                <li>
                  <strong>Frage 4 (Scheitelpunkt):</strong> Weil die Parabel nach {task.correctAnswers[2]} geöffnet ist, ist der Scheitelpunkt S ihr <strong>{task.correctAnswers[4]}ster Punkt</strong>.
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
      <style>{`
        .btn-option {
          background-color: white;
          border: 1px solid #cbd5e1;
          padding: 0.75rem 1.5rem;
          border-radius: 0.5rem;
          font-weight: 500;
          color: #334155;
          transition: all 0.2s;
        }
        .btn-option:hover {
          background-color: #f1f5f9;
          border-color: #94a3b8;
          color: #0f172a;
        }
      `}</style>
    </div>
  );
}

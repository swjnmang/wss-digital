import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string;
  type: 'multiple-choice' | 'numeric' | 'fraction';
  scenario: string;
  question: string;
  options?: string[];
  correctAnswer: string | number;
  tolerance?: number;
  solution: string;
  explanation: string;
}

interface TaskState {
  answer: string | number;
  status: 'blank' | 'correct' | 'incorrect' | 'invalid';
  showSolution: boolean;
  attempts: number;
}

const tasks: Task[] = [
  {
    id: 'hauf-01',
    title: 'Umfrage zur Lieblingsfarbe',
    description: 'Absolute und relative Häufigkeit verstehen',
    type: 'multiple-choice',
    scenario: 'In einer Klasse mit 20 Schülern wurden diese nach ihrer Lieblingsfarbe befragt. 8 Schüler antworteten "Blau".',
    question: 'Wie viel Prozent der Schüler bevorzugen Blau?',
    options: ['20%', '32%', '40%', '50%'],
    correctAnswer: '40%',
    solution: 'Relative Häufigkeit = Absolute Häufigkeit / Gesamtmenge = 8 / 20 = 0,4 = 40%',
    explanation: 'Die absolute Häufigkeit ist 8 (konkrete Anzahl). Die relative Häufigkeit ist der Anteil: 8/20 = 2/5 = 40%.'
  },
  {
    id: 'hauf-02',
    title: 'Würfelwürfe',
    description: 'Häufigkeiten bei Zufallsexperimenten',
    type: 'numeric',
    scenario: 'Ein Würfel wird 60-mal geworfen. Dabei wird die "6" insgesamt 12-mal geworfen.',
    question: 'Wie groß ist die relative Häufigkeit der "6"? Antworte als Dezimalzahl.',
    correctAnswer: 0.2,
    tolerance: 0.01,
    solution: 'Relative Häufigkeit = 12 / 60 = 1/5 = 0,2',
    explanation: 'Die absolute Häufigkeit der 6 ist 12. Die relative Häufigkeit ist 12 von 60 Würfen, also 12/60 = 0,2.'
  },
  {
    id: 'hauf-03',
    title: 'Absatzquote berechnen',
    description: 'Von 150 hergestellten Produkten sind 3 fehlerhaft',
    type: 'numeric',
    scenario: 'In einer Fabrik wurden 150 Produkte hergestellt. Davon waren 3 Produkte fehlerhaft.',
    question: 'Wie groß ist die relative Häufigkeit der fehlerhaften Produkte? (als Dezimalzahl, 4 Stellen)',
    correctAnswer: 0.02,
    tolerance: 0.001,
    solution: 'Relative Häufigkeit = 3 / 150 = 1/50 = 0,02 = 2%',
    explanation: '3 fehlerhafte Produkte von 150 insgesamt: 3/150 = 0,02 = 2%. Dies ist eine sehr gute Qualitätsquote!'
  },
  {
    id: 'hauf-04',
    title: 'Umschlag mit Kugeln',
    description: 'Relative Häufigkeit und Gesamtanzahl',
    type: 'numeric',
    scenario: 'In einem Beutel sind insgesamt 25 Kugeln. 40% davon sind rot.',
    question: 'Wie viele rote Kugeln sind im Beutel? (absolute Häufigkeit)',
    correctAnswer: 10,
    tolerance: 0,
    solution: 'Absolute Häufigkeit = Relative Häufigkeit × Gesamtmenge = 0,4 × 25 = 10',
    explanation: 'Wenn 40% von 25 Kugeln rot sind: 0,4 × 25 = 10 rote Kugeln.'
  },
  {
    id: 'hauf-05',
    title: 'Befragung schulischer Aktivitäten',
    description: 'Klassendiskussion mit relativen Häufigkeiten',
    type: 'multiple-choice',
    scenario: 'In einer Klasse mit 32 Schülern spielen 16 Schüler in der Schulband.',
    question: 'Welche relative Häufigkeit haben die Schüler in der Schulband?',
    options: ['1/4', '1/3', '1/2', '2/3'],
    correctAnswer: '1/2',
    solution: 'Relative Häufigkeit = 16 / 32 = 1/2 = 50%',
    explanation: 'Die Hälfte der Klasse spielt in der Schulband (50% oder 1/2).'
  },
  {
    id: 'hauf-06',
    title: 'Münzwurf Experiment',
    description: 'Häufigkeitsverhältnisse erkennen',
    type: 'numeric',
    scenario: 'Eine Münze wird 80-mal geworfen. 32-mal zeigt sie "Zahl".',
    question: 'Wie groß ist die relative Häufigkeit von "Zahl"? (als Dezimalzahl)',
    correctAnswer: 0.4,
    tolerance: 0.01,
    solution: 'Relative Häufigkeit = 32 / 80 = 2/5 = 0,4 = 40%',
    explanation: 'Bei 32 "Zahl" von 80 Würfen: 32/80 = 0,4. Dies weicht leicht von der theoretischen Wahrscheinlichkeit von 50% ab.'
  },
  {
    id: 'hauf-07',
    title: 'Rückwärts rechnen: Von relativ zu absolut',
    description: 'Absolute Häufigkeit aus relativer Häufigkeit berechnen',
    type: 'numeric',
    scenario: 'Bei einer Befragung von 200 Personen gaben 35% an, Sport zu treiben.',
    question: 'Wie viele Personen treiben Sport? (absolute Häufigkeit)',
    correctAnswer: 70,
    tolerance: 0,
    solution: 'Absolute Häufigkeit = Relative Häufigkeit × Gesamtmenge = 0,35 × 200 = 70',
    explanation: '35% von 200 = 0,35 × 200 = 70 Personen treiben Sport.'
  },
  {
    id: 'hauf-08',
    title: 'Vergleich von Häufigkeiten',
    description: 'Relative Häufigkeiten richtig interpretieren',
    type: 'multiple-choice',
    scenario: 'Klasse A hat 25 Schüler, davon fahren 10 mit dem Bus. Klasse B hat 20 Schüler, davon fahren 9 mit dem Bus.',
    question: 'In welcher Klasse ist der Busfahrer-Anteil höher?',
    options: ['In Klasse A (40%)', 'In Klasse B (45%)', 'In beiden Klassen gleich', 'Es kann nicht bestimmt werden'],
    correctAnswer: 'In Klasse B (45%)',
    solution: 'Klasse A: 10/25 = 0,4 = 40%, Klasse B: 9/20 = 0,45 = 45%. Klasse B hat einen höheren Anteil!',
    explanation: 'Obwohl Klasse A mehr absolute Busfahrer hat (10 vs 9), ist der relative Anteil in Klasse B höher (45% vs 40%).'
  },
  {
    id: 'hauf-09',
    title: 'Meinungsumfrage mit Dezimalzahlen',
    description: 'Relative Häufigkeit in Dezimalform',
    type: 'numeric',
    scenario: 'Von 250 befragten Personen befürworten 87 eine Maßnahme.',
    question: 'Wie groß ist die relative Häufigkeit der Befürworter? (4 Dezimalstellen)',
    correctAnswer: 0.348,
    tolerance: 0.01,
    solution: 'Relative Häufigkeit = 87 / 250 = 0,348 = 34,8%',
    explanation: '87 von 250 Personen = 87/250 = 0,348 ≈ 35% der Befragten befürworten die Maßnahme.'
  },
  {
    id: 'hauf-10',
    title: 'Quiz-Auswertung',
    description: 'Häufigkeiten bei Mehrfachnennung',
    type: 'numeric',
    scenario: 'Bei einem Quiz mit 5 Fragen bekamen 60 Schüler folgende Noten: 12 bekamen eine "1", 18 bekamen eine "2", die restlichen bekamen eine "3" oder schlechter.',
    question: 'Wie viel Prozent der Schüler bekamen eine "1" oder "2"? (als ganze Zahl mit %)',
    correctAnswer: 50,
    tolerance: 1,
    solution: 'Schüler mit "1" oder "2": 12 + 18 = 30. Relative Häufigkeit = 30/60 = 0,5 = 50%',
    explanation: 'Von 60 Schülern hatten 30 die Note "1" oder "2". Das entspricht 50%.'
  }
];

const RelativeAbsoluteHaeufigkeit: React.FC = () => {
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [taskStates, setTaskStates] = useState<Record<string, TaskState>>(() => {
    const states: Record<string, TaskState> = {};
    tasks.forEach(task => {
      states[task.id] = {
        answer: '',
        status: 'blank',
        showSolution: false,
        attempts: 0
      };
    });
    return states;
  });

  const currentTask = tasks[currentTaskIndex];
  const currentState = taskStates[currentTask.id];

  const handleAnswerChange = (value: string | number) => {
    setTaskStates(prev => ({
      ...prev,
      [currentTask.id]: {
        ...prev[currentTask.id],
        answer: value,
        status: 'blank'
      }
    }));
  };

  const checkAnswer = () => {
    const state = taskStates[currentTask.id];
    let isCorrect = false;

    if (currentTask.type === 'multiple-choice') {
      isCorrect = state.answer === currentTask.correctAnswer;
    } else if (currentTask.type === 'numeric') {
      const numAnswer = parseFloat(String(state.answer));
      const numCorrect = parseFloat(String(currentTask.correctAnswer));
      const tolerance = currentTask.tolerance || 0;
      isCorrect = Math.abs(numAnswer - numCorrect) <= tolerance;
    } else if (currentTask.type === 'fraction') {
      isCorrect = state.answer === currentTask.correctAnswer;
    }

    setTaskStates(prev => ({
      ...prev,
      [currentTask.id]: {
        ...prev[currentTask.id],
        status: isCorrect ? 'correct' : 'incorrect',
        attempts: prev[currentTask.id].attempts + 1
      }
    }));
  };

  const toggleSolution = () => {
    setTaskStates(prev => ({
      ...prev,
      [currentTask.id]: {
        ...prev[currentTask.id],
        showSolution: !prev[currentTask.id].showSolution
      }
    }));
  };

  const goToNextTask = () => {
    if (currentTaskIndex < tasks.length - 1) {
      setCurrentTaskIndex(currentTaskIndex + 1);
    }
  };

  const goToPreviousTask = () => {
    if (currentTaskIndex > 0) {
      setCurrentTaskIndex(currentTaskIndex - 1);
    }
  };

  const correctCount = Object.values(taskStates).filter(state => state.status === 'correct').length;
  const progress = ((correctCount + 1) / tasks.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link to="/daten-und-zufall" className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-2">
            <ArrowLeft className="w-5 h-5" />
            Zurück
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Relative- und absolute Häufigkeit</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-semibold text-slate-600">Aufgabe {currentTaskIndex + 1} von {tasks.length}</span>
            <span className="text-sm font-semibold text-slate-600">{correctCount} korrekt</span>
          </div>
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Task Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">{currentTask.title}</h2>
            <p className="text-sm text-slate-500">{currentTask.description}</p>
          </div>

          {/* Scenario */}
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-slate-900 mb-2">Aufgabenszenario:</h3>
            <p className="text-slate-700">{currentTask.scenario}</p>
          </div>

          {/* Question */}
          <div className="mb-6">
            <h3 className="font-semibold text-slate-900 mb-3">Frage:</h3>
            <p className="text-lg text-slate-700 mb-4">{currentTask.question}</p>

            {/* Answer Input */}
            <div className="space-y-3">
              {currentTask.type === 'multiple-choice' && (
                <div className="grid grid-cols-1 gap-2">
                  {currentTask.options?.map((option) => (
                    <label key={option} className="flex items-center p-3 border border-slate-200 rounded-lg hover:bg-indigo-50 cursor-pointer transition-colors">
                      <input
                        type="radio"
                        name={currentTask.id}
                        value={option}
                        checked={String(currentState.answer) === option}
                        onChange={(e) => handleAnswerChange(e.target.value)}
                        className="w-4 h-4 text-indigo-600"
                      />
                      <span className="ml-3 text-slate-700">{option}</span>
                    </label>
                  ))}
                </div>
              )}

              {(currentTask.type === 'numeric' || currentTask.type === 'fraction') && (
                <input
                  type="text"
                  value={currentState.answer}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                  placeholder="Antwort eingeben..."
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              )}
            </div>
          </div>

          {/* Feedback */}
          {currentState.status !== 'blank' && (
            <div className={`flex items-start gap-3 p-4 rounded-lg mb-6 ${
              currentState.status === 'correct' 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              {currentState.status === 'correct' ? (
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <p className={`font-semibold ${currentState.status === 'correct' ? 'text-green-800' : 'text-red-800'}`}>
                  {currentState.status === 'correct' ? '✓ Korrekt!' : '✗ Nicht ganz korrekt'}
                </p>
                <p className={`text-sm mt-1 ${currentState.status === 'correct' ? 'text-green-700' : 'text-red-700'}`}>
                  {currentState.status === 'correct' ? 'Ausgezeichnet!' : `Versuche: ${currentState.attempts}`}
                </p>
              </div>
            </div>
          )}

          {/* Solution */}
          {currentState.status === 'correct' && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-slate-900 mb-2">Erklärung:</h4>
              <p className="text-slate-700 mb-2">{currentTask.solution}</p>
              <p className="text-slate-600 text-sm">{currentTask.explanation}</p>
            </div>
          )}

          {/* Show Solution Button */}
          {currentState.status !== 'correct' && (
            <button
              onClick={toggleSolution}
              className="w-full mb-4 px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg transition-colors"
            >
              {currentState.showSolution ? 'Lösung verstecken' : 'Lösung anzeigen'}
            </button>
          )}

          {currentState.showSolution && currentState.status !== 'correct' && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-amber-900 mb-2">Lösung:</h4>
              <p className="text-amber-800 mb-2">{currentTask.solution}</p>
              <p className="text-amber-700 text-sm">{currentTask.explanation}</p>
            </div>
          )}

          {/* Check Button */}
          {currentState.status === 'blank' && (
            <button
              onClick={checkAnswer}
              disabled={!currentState.answer}
              className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold rounded-lg transition-colors"
            >
              Antwort prüfen
            </button>
          )}
        </div>

        {/* Navigation */}
        <div className="flex gap-4 justify-between">
          <button
            onClick={goToPreviousTask}
            disabled={currentTaskIndex === 0}
            className="px-6 py-2 bg-slate-200 hover:bg-slate-300 disabled:bg-slate-100 disabled:text-slate-400 text-slate-700 font-semibold rounded-lg transition-colors"
          >
            ← Zurück
          </button>

          <button
            onClick={goToNextTask}
            disabled={currentTaskIndex === tasks.length - 1}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:text-slate-400 text-white font-semibold rounded-lg transition-colors"
          >
            Weiter →
          </button>
        </div>

        {/* Task Overview */}
        <div className="mt-8 bg-slate-50 rounded-lg p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Aufgabenübersicht ({correctCount}/{tasks.length} korrekt)</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {tasks.map((task, index) => (
              <button
                key={task.id}
                onClick={() => setCurrentTaskIndex(index)}
                className={`p-3 rounded-lg font-semibold transition-colors ${
                  taskStates[task.id].status === 'correct'
                    ? 'bg-green-500 text-white'
                    : taskStates[task.id].status === 'incorrect'
                    ? 'bg-red-500 text-white'
                    : index === currentTaskIndex
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white border-2 border-slate-200 text-slate-700 hover:border-indigo-400'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default RelativeAbsoluteHaeufigkeit;

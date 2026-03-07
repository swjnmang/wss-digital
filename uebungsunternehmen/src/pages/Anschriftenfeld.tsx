import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import { addressTasks, type AddressExercise } from '../data/addressTasks';

type Mode = 'practice' | 'exam-intro' | 'exam' | 'exam-result';

interface ExamResult {
  taskId: string;
  inputs: string[];
  score: number;
}

interface ExamState {
  studentName: string;
  studentClass: string;
  tasks: AddressExercise[];
  currentIndex: number;
  results: ExamResult[];
}

export default function Anschriftenfeld() {
  const [mode, setMode] = useState<Mode>('practice');
  const [currentTask, setCurrentTask] = useState<AddressExercise>(addressTasks[0]);
  const [inputs, setInputs] = useState<string[]>(Array(6).fill(''));
  const [showFeedback, setShowFeedback] = useState(false);
  const [shuffledElements, setShuffledElements] = useState<string[]>([]);
  const [showSolution, setShowSolution] = useState(false);
  
  // Exam State
  const [examState, setExamState] = useState<ExamState>({
    studentName: '',
    studentClass: '',
    tasks: [],
    currentIndex: 0,
    results: []
  });

  // Initialize with a random task
  useEffect(() => {
    generateRandomTask();
  }, []);

  const generateRandomTask = () => {
    // 30% Private, 70% Business
    const isPrivate = Math.random() < 0.3;
    const category = isPrivate ? 'Privat' : 'Geschäftlich';
    const filteredTasks = addressTasks.filter(t => t.category === category);
    const randomTask = filteredTasks[Math.floor(Math.random() * filteredTasks.length)];
    
    setCurrentTask(randomTask);
    setInputs(Array(6).fill(''));
    setShowFeedback(false);
    setShowSolution(false);
    
    // Shuffle address elements
    const nonEmptyElements = randomTask.solution.filter(el => el.trim() !== '');
    const shuffled = [...nonEmptyElements].sort(() => Math.random() - 0.5);
    setShuffledElements(shuffled);
  };

  const handleInputChange = (index: number, value: string) => {
    const newInputs = [...inputs];
    newInputs[index] = value;
    setInputs(newInputs);
    setShowFeedback(false);
    setShowSolution(false);
  };

  // --- Practice Mode Logic ---
  const checkPracticeSolution = () => {
    setShowFeedback(true);
  };

  const isLineCorrect = (index: number, task: AddressExercise = currentTask) => {
    const input = inputs[index].trim().toLowerCase();
    const solution = task.solution[index].trim().toLowerCase();
    return input === solution;
  };

  const isCorrect = inputs.every((_, index) => isLineCorrect(index));

  // --- Exam Mode Logic ---
  const startExam = () => {
    if (!examState.studentName || !examState.studentClass) {
      alert('Bitte Name und Klasse eingeben!');
      return;
    }

    // Select 10 random tasks (3 Private, 7 Business)
    const privateTasks = addressTasks.filter(t => t.category === 'Privat');
    const businessTasks = addressTasks.filter(t => t.category === 'Geschäftlich');
    
    // Shuffle and slice
    const shuffledPrivate = [...privateTasks].sort(() => 0.5 - Math.random()).slice(0, 3);
    const shuffledBusiness = [...businessTasks].sort(() => 0.5 - Math.random()).slice(0, 7);
    
    const examTasks = [...shuffledPrivate, ...shuffledBusiness].sort(() => 0.5 - Math.random());

    setExamState(prev => ({
      ...prev,
      tasks: examTasks,
      currentIndex: 0,
      results: []
    }));
    
    setInputs(Array(6).fill(''));
    
    // Shuffle elements for first task
    const nonEmptyElements = examTasks[0].solution.filter(el => el.trim() !== '');
    const shuffled = [...nonEmptyElements].sort(() => Math.random() - 0.5);
    setShuffledElements(shuffled);
    
    setMode('exam');
  };

  const submitExamAnswer = () => {
    const currentExamTask = examState.tasks[examState.currentIndex];
    let score = 0;

    inputs.forEach((line, index) => {
      const isCorrect = line.trim().toLowerCase() === currentExamTask.solution[index].trim().toLowerCase();
      if (isCorrect) {
        score += 0.5;
      } else {
        score -= 0.5;
      }
    });

    const newResult: ExamResult = {
      taskId: currentExamTask.id,
      inputs: [...inputs],
      score: score
    };

    const nextIndex = examState.currentIndex + 1;

    if (nextIndex < examState.tasks.length) {
      setExamState(prev => ({
        ...prev,
        results: [...prev.results, newResult],
        currentIndex: nextIndex
      }));
      setInputs(Array(6).fill(''));
      
      // Shuffle elements for next task
      const nextTask = examState.tasks[nextIndex];
      const nonEmptyElements = nextTask.solution.filter(el => el.trim() !== '');
      const shuffled = [...nonEmptyElements].sort(() => Math.random() - 0.5);
      setShuffledElements(shuffled);
    } else {
      setExamState(prev => ({
        ...prev,
        results: [...prev.results, newResult]
      }));
      setMode('exam-result');
    }
  };

  const getTotalScore = () => {
    return examState.results.reduce((sum, r) => sum + r.score, 0);
  };

  const generateCertificate = () => {
    const doc = new jsPDF();
    const totalScore = getTotalScore();
    const maxScore = 30; // 10 tasks * 6 lines * 0.5
    
    doc.setFontSize(24);
    doc.text('Zertifikat', 105, 30, { align: 'center' });
    
    doc.setFontSize(16);
    doc.text('Anschriftenfeld-Prüfung', 105, 45, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text(`Name: ${examState.studentName}`, 20, 70);
    doc.text(`Klasse: ${examState.studentClass}`, 20, 80);
    doc.text(`Datum: ${new Date().toLocaleDateString()}`, 20, 90);
    
    doc.setFontSize(14);
    doc.text(`Erreichte Punktzahl: ${totalScore.toFixed(1)} / ${maxScore}`, 20, 110);
    
    let grade = '';
    const percentage = (totalScore / maxScore) * 100;
    if (percentage >= 92) grade = 'Sehr gut';
    else if (percentage >= 81) grade = 'Gut';
    else if (percentage >= 67) grade = 'Befriedigend';
    else if (percentage >= 50) grade = 'Ausreichend';
    else if (percentage >= 30) grade = 'Mangelhaft';
    else grade = 'Ungenügend';

    doc.text(`Note: ${grade}`, 20, 120);

    doc.save('Zertifikat_Anschriftenfeld.pdf');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link to="/" className="text-blue-600 hover:text-blue-800 font-semibold text-sm">
            ← Zurück
          </Link>
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Übungsunternehmen</p>
            <h1 className="text-xl font-bold">Anschriftenfeld Trainer</h1>
          </div>
          <div className="ml-auto flex gap-2">
            {mode === 'practice' && (
              <button 
                onClick={() => setMode('exam-intro')}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700"
              >
                Prüfungsmodus starten
              </button>
            )}
            {mode !== 'practice' && (
              <button 
                onClick={() => setMode('practice')}
                className="bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-300"
              >
                Übungsmodus
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto px-4 py-8 w-full">
        
        {/* --- EXAM INTRO --- */}
        {mode === 'exam-intro' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm max-w-md mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">Prüfungsmodus</h2>
            <p className="text-slate-600 mb-6">
              Du musst 10 Anschriftenfelder lösen.<br/>
              Richtig: +0,5 Pkt | Falsch: -0,5 Pkt.
            </p>
            <div className="space-y-4 text-left">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Dein Name</label>
                <input 
                  type="text" 
                  value={examState.studentName}
                  onChange={e => setExamState(prev => ({...prev, studentName: e.target.value}))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2"
                  placeholder="Max Mustermann"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Deine Klasse</label>
                <input 
                  type="text" 
                  value={examState.studentClass}
                  onChange={e => setExamState(prev => ({...prev, studentClass: e.target.value}))}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2"
                  placeholder="10a"
                />
              </div>
              <button 
                onClick={startExam}
                className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 mt-4"
              >
                Prüfung starten
              </button>
            </div>
          </div>
        )}

        {/* --- EXAM RESULT --- */}
        {mode === 'exam-result' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm max-w-md mx-auto text-center">
            <h2 className="text-2xl font-bold mb-2">Prüfung beendet!</h2>
            <div className="text-4xl font-bold text-indigo-600 my-6">
              {getTotalScore().toFixed(1)} <span className="text-lg text-slate-400">/ 30 Punkte</span>
            </div>
            <p className="text-slate-600 mb-8">
              Du hast alle 10 Aufgaben bearbeitet. Lade jetzt dein Zertifikat herunter.
            </p>
            <div className="space-y-3">
              <button 
                onClick={generateCertificate}
                className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700"
              >
                📄 Zertifikat herunterladen
              </button>
              <button 
                onClick={() => setMode('practice')}
                className="w-full bg-slate-100 text-slate-700 py-3 rounded-xl font-semibold hover:bg-slate-200"
              >
                Zurück zum Üben
              </button>
            </div>
          </div>
        )}

        {/* --- PRACTICE & EXAM WORKSPACE --- */}
        {(mode === 'practice' || mode === 'exam') && (
          <div className="space-y-6">
            
            {/* Progress Bar (Exam only) */}
            {mode === 'exam' && (
              <div className="flex items-center justify-between text-sm font-medium text-slate-500">
                <span>Aufgabe {examState.currentIndex + 1} von 10</span>
                <span>Prüfung läuft...</span>
              </div>
            )}

            {/* Task Description */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm relative overflow-hidden">
              <div className={`absolute top-0 left-0 w-1 h-full ${
                (mode === 'exam' ? examState.tasks[examState.currentIndex] : currentTask).category === 'Privat' 
                  ? 'bg-emerald-400' 
                  : 'bg-indigo-400'
              }`}></div>
              <span className={`inline-block px-2 py-1 rounded text-xs font-bold mb-3 ${
                (mode === 'exam' ? examState.tasks[examState.currentIndex] : currentTask).category === 'Privat' 
                  ? 'bg-emerald-100 text-emerald-800' 
                  : 'bg-indigo-100 text-indigo-800'
              }`}>
                {(mode === 'exam' ? examState.tasks[examState.currentIndex] : currentTask).category}
              </span>
              <h2 className="text-xl font-bold mb-2">
                {(mode === 'exam' ? examState.tasks[examState.currentIndex] : currentTask).title}
              </h2>
              <p className="text-slate-600 leading-relaxed italic mb-4">
                Fülle das Anschriftenfeld für den nachfolgenden Addressaten korrekt aus.
              </p>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <p className="text-sm text-slate-700 font-medium mb-2">Verfügbare Adresselemente:</p>
                <div className="flex flex-wrap gap-2">
                  {shuffledElements.map((element, index) => (
                    <span
                      key={index}
                      className="bg-white border border-slate-300 rounded-lg px-3 py-1 text-sm text-slate-700 shadow-sm"
                    >
                      {element}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Interactive Address Field */}
            <div className="bg-slate-200 p-8 rounded-3xl flex justify-center">
              <div className="bg-white w-[400px] h-[200px] shadow-lg rounded-lg p-4 relative flex flex-col">
                {/* Window Frame Simulation */}
                <div className="absolute top-0 left-0 w-full h-full border-4 border-slate-100 rounded-lg pointer-events-none"></div>
                
                <div className="flex-1 flex flex-col justify-center space-y-[1px]">
                  {/* Anschriftzone Label */}
                  <div className="absolute -left-24 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 text-right w-20">
                    Anschriftzone<br/>(6 Zeilen)
                  </div>

                  {inputs.map((line, index) => (
                    <div key={index} className="relative group">
                      <input
                        type="text"
                        value={line}
                        onChange={(e) => handleInputChange(index, e.target.value)}
                        placeholder={`Zeile ${index + 1}`}
                        className={`w-full text-sm font-mono px-2 py-0.5 border-b border-transparent focus:border-blue-300 focus:outline-none focus:bg-blue-50 transition-colors ${
                          mode === 'practice' && showFeedback 
                            ? isLineCorrect(index) 
                              ? 'bg-emerald-50 text-emerald-900' 
                              : 'bg-red-50 text-red-900'
                            : 'hover:bg-slate-50'
                        }`} 
                      />
                      {/* Line Number Hint */}
                      <span className="absolute -right-6 top-1 text-[9px] text-slate-300 select-none">
                        {index + 1}
                      </span>
                      {/* Feedback Icon (Practice only) */}
                      {mode === 'practice' && showFeedback && (
                        <span className="absolute right-2 top-1 text-xs">
                          {isLineCorrect(index) ? '✅' : '❌'}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between">
              {mode === 'practice' ? (
                <>
                  <button
                    onClick={checkPracticeSolution}
                    className="bg-blue-600 text-white px-6 py-2 rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-sm active:scale-95"
                  >
                    Prüfen
                  </button>
                  
                  <button
                    onClick={generateRandomTask}
                    className="bg-slate-800 text-white px-6 py-2 rounded-xl font-semibold hover:bg-slate-900 transition-colors shadow-sm active:scale-95"
                  >
                    Neue Aufgabe generieren
                  </button>
                </>
              ) : (
                <button
                  onClick={submitExamAnswer}
                  className="w-full bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-sm active:scale-95"
                >
                  {examState.currentIndex < 9 ? 'Nächste Aufgabe →' : 'Prüfung beenden'}
                </button>
              )}
            </div>

            {/* Feedback (Practice only) */}
            {mode === 'practice' && showFeedback && (
              <div className={`text-center text-sm font-semibold ${isCorrect ? 'text-emerald-600' : 'text-amber-600'}`}>
                {isCorrect ? 'Perfekt! Alles richtig.' : 'Noch nicht ganz korrekt. Schau dir die Hinweise an.'}
              </div>
            )}

            {/* Hints (Practice only) */}
            {mode === 'practice' && showFeedback && !isCorrect && (
              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 text-sm text-amber-900 space-y-4">
                <div>
                  <h3 className="font-bold mb-2">Tipps zur Lösung:</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {currentTask.hints.map((hint, i) => (
                      <li key={i}>{hint}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setShowSolution(!showSolution)}
                    className="flex-1 bg-amber-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-amber-700 transition-colors text-sm"
                  >
                    {showSolution ? 'Lösung verstecken' : 'Lösung anzeigen'}
                  </button>
                </div>

                {showSolution && (
                  <div className="mt-3 pt-3 border-t border-amber-200">
                    <h4 className="font-bold mb-2">Richtige Lösung:</h4>
                    <div className="bg-white rounded-lg p-3 space-y-1 font-mono text-xs">
                      {currentTask.solution.map((line, i) => (
                        <div key={i} className="text-slate-700">
                          {line || '(leer)'}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        )}
      </main>
    </div>
  );
}
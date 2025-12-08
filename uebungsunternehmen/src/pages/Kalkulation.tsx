import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import { generateTask, type CalcTask, SCHEMA_ROWS, type CalculationSchema, type CalculationDirection, getCalculationExplanation } from '../data/calculationTasks';

type Mode = 'practice' | 'exam-intro' | 'exam' | 'exam-result';

interface ExamResult {
  taskId: string;
  schema: CalculationSchema;
  direction: CalculationDirection;
  totalFields: number;
  correctFields: number;
  errors: number;
}

interface ExamState {
  studentName: string;
  taskCount: number;
  tasks: CalcTask[];
  currentIndex: number;
  results: ExamResult[];
}

export default function Kalkulation() {
  const [mode, setMode] = useState<Mode>('practice');
  
  // Practice State
  const [task, setTask] = useState<CalcTask | null>(null);
  const [userInputs, setUserInputs] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<Record<string, boolean>>({}); // true = correct, false = wrong
  const [expandedExplanations, setExpandedExplanations] = useState<Record<string, boolean>>({});
  const [showSolution, setShowSolution] = useState(false);
  const [schema, setSchema] = useState<CalculationSchema>('Bezugskalkulation');
  const [direction, setDirection] = useState<CalculationDirection>('Vorwärts');

  // Exam State
  const [examState, setExamState] = useState<ExamState>({
    studentName: '',
    taskCount: 3,
    tasks: [],
    currentIndex: 0,
    results: []
  });

  useEffect(() => {
    if (mode === 'practice') {
      newTask();
    }
  }, [schema, direction, mode]);

  const newTask = () => {
    const t = generateTask(schema, direction);
    setTask(t);
    resetInputs(t, direction, schema);
  };

  const resetInputs = (t: CalcTask, dir: CalculationDirection, sch: CalculationSchema) => {
    // Pre-fill given values based on direction
    const initialInputs: Record<string, string> = {};
    
    // Bezugskosten is typically given in both directions
    initialInputs['bezugskosten'] = t.values.bezugskosten.toFixed(2).replace('.', ',');
    
    if (dir === 'Vorwärts') {
      initialInputs['lep'] = t.values.lep.toFixed(2).replace('.', ',');
    } else if (dir === 'Rückwärts') {
      // Rückwärts
      if (sch === 'Bezugskalkulation') {
        initialInputs['bp'] = t.values.bp.toFixed(2).replace('.', ',');
      } else {
        initialInputs['brutto'] = t.values.brutto.toFixed(2).replace('.', ',');
      }
    } else if (dir === 'Differenz') {
      initialInputs['lep'] = t.values.lep.toFixed(2).replace('.', ',');
      initialInputs['brutto'] = t.values.brutto.toFixed(2).replace('.', ',');
    }

    setUserInputs(initialInputs);
    setFeedback({});
    setExpandedExplanations({});
    setShowSolution(false);
  };

  const startExam = () => {
    if (!examState.studentName.trim()) {
      alert('Bitte gib deinen Namen ein.');
      return;
    }

    const tasks: CalcTask[] = [];
    const count = Math.max(1, Math.min(20, examState.taskCount)); // Limit between 1 and 20

    for (let i = 0; i < count; i++) {
      // Randomly decide type: 33% Purchase, 67% Sales
      const isPurchase = Math.random() < 0.33;
      
      if (isPurchase) {
        const dir = Math.random() > 0.5 ? 'Vorwärts' : 'Rückwärts';
        tasks.push(generateTask('Bezugskalkulation', dir));
      } else {
        // Sales: Mix of Forward, Backward, and Difference
        const rand = Math.random();
        let dir: CalculationDirection = 'Vorwärts';
        if (rand > 0.33 && rand <= 0.66) dir = 'Rückwärts';
        if (rand > 0.66) dir = 'Differenz';
        
        tasks.push(generateTask('Handelskalkulation', dir));
      }
    }

    setExamState(prev => ({
      ...prev,
      tasks,
      currentIndex: 0,
      results: []
    }));
    
    setTask(tasks[0]);
    resetInputs(tasks[0], tasks[0].direction, tasks[0].schema);
    setMode('exam');
  };

  const handleExamCheck = () => {
    if (!task) return;
    
    const newFeedback: Record<string, boolean> = {};
    
    SCHEMA_ROWS.forEach(row => {
      // Skip rows not in current schema
      if (task.schema === 'Bezugskalkulation' && row.key === 'hkz') return; 
      
      const userValStr = userInputs[row.key];
      if (!userValStr) return;

      const normalizedStr = userValStr.replace(/\./g, '').replace(',', '.');
      const userVal = parseFloat(normalizedStr);
      const correctVal = task.values[row.key];
      
      if (Math.abs(userVal - correctVal) <= 0.05) {
        newFeedback[row.key] = true;
      } else {
        newFeedback[row.key] = false;
      }
    });

    // Add check for gewinn_p if Differenz
    if (task.direction === 'Differenz') {
      const userValStr = userInputs['gewinn_p'];
      if (userValStr) {
        const normalizedStr = userValStr.replace(/\./g, '').replace(',', '.');
        const userVal = parseFloat(normalizedStr);
        const correctVal = task.percentages['gewinn_p'];
        
        if (Math.abs(userVal - correctVal) <= 0.05) {
          newFeedback['gewinn_p'] = true;
        } else {
          newFeedback['gewinn_p'] = false;
        }
      }
    }

    setFeedback(newFeedback);
  };

  const handleExamNext = () => {
    if (!task) return;

    // Calculate Score based on current inputs
    let correct = 0;
    let total = 0;
    let errors = 0;

    const relevantRows = SCHEMA_ROWS.filter(row => {
      if (task.schema === 'Bezugskalkulation') {
        const index = SCHEMA_ROWS.findIndex(r => r.key === 'bp');
        const rowIndex = SCHEMA_ROWS.findIndex(r => r.key === row.key);
        return rowIndex <= index;
      }
      return true;
    });

    relevantRows.forEach(row => {
      const isReadOnly = 
        row.key === 'bezugskosten' ||
        (task.direction === 'Vorwärts' && row.key === 'lep') ||
        (task.direction === 'Rückwärts' && (
          (task.schema === 'Bezugskalkulation' && row.key === 'bp') ||
          (task.schema === 'Handelskalkulation' && row.key === 'brutto')
        ));
      
      if (isReadOnly) return;

      total++;
      const userValStr = userInputs[row.key];
      if (!userValStr) {
        errors++;
        return;
      }

      const normalizedStr = userValStr.replace(/\./g, '').replace(',', '.');
      const userVal = parseFloat(normalizedStr);
      const correctVal = task.values[row.key];

      if (Math.abs(userVal - correctVal) <= 0.05) {
        correct++;
      } else {
        errors++;
      }
    });

    // Add check for gewinn_p if Differenz
    if (task.direction === 'Differenz') {
      total++;
      const userValStr = userInputs['gewinn_p'];
      if (!userValStr) {
        errors++;
      } else {
        const normalizedStr = userValStr.replace(/\./g, '').replace(',', '.');
        const userVal = parseFloat(normalizedStr);
        const correctVal = task.percentages['gewinn_p'];

        if (Math.abs(userVal - correctVal) <= 0.05) {
          correct++;
        } else {
          errors++;
        }
      }
    }

    const result: ExamResult = {
      taskId: task.id,
      schema: task.schema,
      direction: task.direction,
      totalFields: total,
      correctFields: correct,
      errors: errors
    };

    const newResults = [...examState.results, result];

    if (examState.currentIndex < examState.tasks.length - 1) {
      // Next Task
      const nextIndex = examState.currentIndex + 1;
      const nextTask = examState.tasks[nextIndex];
      
      setExamState(prev => ({
        ...prev,
        results: newResults,
        currentIndex: nextIndex
      }));
      
      setTask(nextTask);
      resetInputs(nextTask, nextTask.direction, nextTask.schema);
      window.scrollTo(0, 0);
    } else {
      // Finish
      setExamState(prev => ({
        ...prev,
        results: newResults
      }));
      setMode('exam-result');
    }
  };

  const generateCertificate = () => {
    const doc = new jsPDF({ orientation: 'landscape' });
    
    // Background
    doc.setFillColor(240, 249, 255);
    doc.rect(0, 0, 297, 210, 'F');
    
    // Border
    doc.setDrawColor(37, 99, 235);
    doc.setLineWidth(2);
    doc.rect(10, 10, 277, 190);

    // Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(32);
    doc.setTextColor(30, 58, 138);
    doc.text('Zertifikat', 148.5, 40, { align: 'center' });
    
    doc.setFontSize(18);
    doc.setTextColor(71, 85, 105);
    doc.text('Kalkulation im Groß- und Außenhandel', 148.5, 55, { align: 'center' });

    // Content
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text(`Hiermit wird bestätigt, dass`, 148.5, 80, { align: 'center' });
    
    doc.setFontSize(24);
    doc.setTextColor(37, 99, 235);
    doc.text(examState.studentName, 148.5, 95, { align: 'center' });

    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text(`die Prüfung zur Kalkulation erfolgreich absolviert hat.`, 148.5, 110, { align: 'center' });

    // Results Table
    let y = 130;
    const totalErrors = examState.results.reduce((acc, r) => acc + r.errors, 0);
    const totalCorrect = examState.results.reduce((acc, r) => acc + r.correctFields, 0);
    const totalFields = examState.results.reduce((acc, r) => acc + r.totalFields, 0);
    const percentage = Math.round((totalCorrect / totalFields) * 100);

    doc.setFontSize(12);
    doc.text('Ergebnisse im Detail:', 40, y);
    y += 10;

    examState.results.forEach((res, idx) => {
      const label = `${idx + 1}. ${res.schema} (${res.direction})`;
      const score = `${res.correctFields} von ${res.totalFields} richtig (${res.errors} Fehler)`;
      doc.text(label, 40, y);
      doc.text(score, 180, y);
      y += 8;
    });

    y += 10;
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(40, y, 257, y);
    y += 10;

    doc.setFont('helvetica', 'bold');
    doc.text(`Gesamtergebnis: ${percentage}% korrekt`, 40, y);
    doc.text(`${totalErrors} Fehler gesamt`, 180, y);

    // Footer
    const date = new Date().toLocaleDateString('de-DE');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Ausgestellt am ${date}`, 148.5, 180, { align: 'center' });
    doc.text('Übungsunternehmen Digital', 148.5, 185, { align: 'center' });

    doc.save('Zertifikat_Kalkulation.pdf');
  };

  const generateWorksheet = () => {
    const doc = new jsPDF();
    const tasks: CalcTask[] = [
      generateTask('Bezugskalkulation', 'Vorwärts'),
      generateTask('Bezugskalkulation', 'Rückwärts'),
      generateTask('Handelskalkulation', 'Vorwärts'),
      generateTask('Handelskalkulation', 'Rückwärts'),
      generateTask('Handelskalkulation', 'Differenz')
    ];

    // Page 1: Tasks
    doc.setFontSize(18);
    doc.text("Übungsaufgaben Kalkulation", 20, 20);
    
    let y = 40;
    tasks.forEach((t, i) => {
      if (y > 250) {
        doc.addPage();
        y = 20;
      }
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      const title = `Aufgabe ${i + 1}: ${t.schema} (${t.direction})`;
      doc.text(title, 20, y);
      y += 7;
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      const splitText = doc.splitTextToSize(t.description, 170);
      doc.text(splitText, 20, y);
      y += splitText.length * 6 + 10;
    });

    // Page 2: Solutions
    doc.addPage();
    doc.setFontSize(18);
    doc.text("Lösungen", 20, 20);
    
    y = 40;
    tasks.forEach((t, i) => {
      // Estimate height needed for this solution
      const rows = SCHEMA_ROWS.filter(row => {
        if (t.schema === 'Bezugskalkulation') {
          // Include up to 'bp'
          const index = SCHEMA_ROWS.findIndex(r => r.key === 'bp');
          const thisIndex = SCHEMA_ROWS.findIndex(r => r.key === row.key);
          return thisIndex <= index;
        }
        return true;
      });
      
      const heightNeeded = rows.length * 6 + 20;
      
      if (y + heightNeeded > 280) {
        doc.addPage();
        y = 20;
      }

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`Lösung Aufgabe ${i + 1}`, 20, y);
      y += 8;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');

      rows.forEach(row => {
        const val = t.values[row.key];
        const op = row.operator || '';
        
        doc.text(op, 20, y);
        doc.text(row.label, 28, y);
        
        // Percentage?
        if (row.percentageKey) {
          const pVal = t.percentages[row.percentageKey];
          doc.text(`${pVal} %`, 100, y, { align: 'right' });
        }
        
        doc.text(`${val.toFixed(2).replace('.', ',')} €`, 160, y, { align: 'right' });
        y += 6;
      });
      
      // Add Gewinn % for Differenz
      if (t.direction === 'Differenz') {
         doc.text(`Gewinnzuschlag: ${t.percentages.gewinn_p.toFixed(2).replace('.', ',')} %`, 28, y);
         y += 6;
      }

      y += 10;
    });

    doc.save("Kalkulation_Uebungsblatt.pdf");
  };

  const handleInputChange = (key: string, value: string) => {
    setUserInputs(prev => ({ ...prev, [key]: value }));
    // Clear feedback for this field when edited
    if (feedback[key] !== undefined) {
      const newFeedback = { ...feedback };
      delete newFeedback[key];
      setFeedback(newFeedback);
      
      // Also hide explanation
      if (expandedExplanations[key]) {
        const newExpl = { ...expandedExplanations };
        delete newExpl[key];
        setExpandedExplanations(newExpl);
      }
    }
  };

  const getVideoUrl = (s: CalculationSchema, d: CalculationDirection) => {
    if (s === 'Bezugskalkulation') {
      if (d === 'Vorwärts') return 'https://www.youtube.com/watch?v=URqXjPs8Il0&list=PLI8kX0XEfSujoVzZ8Ke9MOCvqsul2vA9X&index=2';
      if (d === 'Rückwärts') return 'https://www.youtube.com/watch?v=aDeM613ptCc&list=PLI8kX0XEfSujoVzZ8Ke9MOCvqsul2vA9X&index=2';
    } else if (s === 'Handelskalkulation') {
      if (d === 'Vorwärts') return 'https://www.youtube.com/watch?v=uQnPU3-D4G4&list=PLI8kX0XEfSujoVzZ8Ke9MOCvqsul2vA9X&index=3&';
      if (d === 'Rückwärts') return 'https://www.youtube.com/watch?v=zraF7yKjdnE&list=PLI8kX0XEfSujoVzZ8Ke9MOCvqsul2vA9X&index=4&';
      if (d === 'Differenz') return 'https://youtu.be/A05uMq5OWOk?si=4V3lvLYtWTSVHhuo';
    }
    return null;
  };

  const checkSolution = () => {
    if (!task) return;
    
    const newFeedback: Record<string, boolean> = {};
    
    SCHEMA_ROWS.forEach(row => {
      // Skip rows not in current schema
      if (task.schema === 'Bezugskalkulation' && row.key === 'hkz') return; // Stop after BP
      // Actually we need to filter the rows properly in the render loop too.
      
      const userValStr = userInputs[row.key];
      if (!userValStr) return;

      // Handle German number format (1.234,56)
      // Remove thousands separator (.) and replace decimal separator (,) with (.)
      const normalizedStr = userValStr.replace(/\./g, '').replace(',', '.');
      const userVal = parseFloat(normalizedStr);
      const correctVal = task.values[row.key];
      
      // Allow 0.05 tolerance
      if (Math.abs(userVal - correctVal) <= 0.05) {
        newFeedback[row.key] = true;
      } else {
        newFeedback[row.key] = false;
      }
    });

    // Add check for gewinn_p if Differenz
    if (task.direction === 'Differenz') {
      const userValStr = userInputs['gewinn_p'];
      if (userValStr) {
        const normalizedStr = userValStr.replace(/\./g, '').replace(',', '.');
        const userVal = parseFloat(normalizedStr);
        const correctVal = task.percentages['gewinn_p'];
        
        if (Math.abs(userVal - correctVal) <= 0.05) {
          newFeedback['gewinn_p'] = true;
        } else {
          newFeedback['gewinn_p'] = false;
        }
      }
    }

    setFeedback(newFeedback);
  };

  // Filter rows based on schema
  const visibleRows = SCHEMA_ROWS.filter(row => {
    if (!task) return false;
    if (task.schema === 'Bezugskalkulation') {
      // Show up to 'bp'
      const index = SCHEMA_ROWS.findIndex(r => r.key === 'bp');
      const rowIndex = SCHEMA_ROWS.findIndex(r => r.key === row.key);
      return rowIndex <= index;
    }
    return true;
  });

  if (!task && mode === 'practice') return <div>Laden...</div>;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="bg-white shadow-sm p-4 flex items-center sticky top-0 z-10 justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-2">
            ← Zurück
          </Link>
          <h1 className="text-xl font-bold text-slate-800">
            {mode === 'practice' ? 'Kalkulation üben' : 'Kalkulation Prüfung'}
          </h1>
        </div>
        {mode === 'practice' && (
          <div className="flex gap-2">
            <button 
              onClick={generateWorksheet}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm"
            >
              Übungsblatt PDF
            </button>
            <button 
              onClick={() => setMode('exam-intro')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm"
            >
              Zum Prüfungsmodus
            </button>
          </div>
        )}
        {mode !== 'practice' && mode !== 'exam-result' && (
          <button 
            onClick={() => setMode('practice')}
            className="text-slate-500 hover:text-slate-700 text-sm"
          >
            Abbrechen
          </button>
        )}
      </header>

      <main className="p-2 md:p-8 max-w-5xl mx-auto w-full">
        
        {mode === 'exam-intro' && (
          <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-md text-center">
            <h2 className="text-2xl font-bold mb-4 text-slate-800">Prüfungsmodus</h2>
            <p className="text-slate-600 mb-6">
              Wähle die Anzahl der Aufgaben und gib deinen Namen ein.
              Am Ende erhältst du ein Zertifikat mit deiner Auswertung.
            </p>
            
            <div className="mb-4 text-left">
              <label className="block text-sm font-medium text-slate-700 mb-1">Anzahl der Aufgaben (1-20)</label>
              <input
                type="number"
                min="1"
                max="20"
                value={examState.taskCount}
                onChange={(e) => setExamState(prev => ({ ...prev, taskCount: parseInt(e.target.value) || 3 }))}
                className="w-full p-3 border rounded-lg text-center text-lg"
              />
            </div>

            <div className="mb-6 text-left">
              <label className="block text-sm font-medium text-slate-700 mb-1">Dein Name</label>
              <input
                type="text"
                placeholder="Max Mustermann"
                value={examState.studentName}
                onChange={(e) => setExamState(prev => ({ ...prev, studentName: e.target.value }))}
                className="w-full p-3 border rounded-lg text-center text-lg"
              />
            </div>

            <button
              onClick={startExam}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-bold text-lg shadow-lg transition-transform active:scale-95"
            >
              Prüfung starten
            </button>
          </div>
        )}

        {mode === 'exam-result' && (
          <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-md text-center">
            <h2 className="text-3xl font-bold mb-6 text-slate-800">Prüfung abgeschlossen!</h2>
            
            <div className="grid gap-4 mb-8">
              {examState.results.map((res, idx) => (
                <div key={idx} className="bg-slate-50 p-4 rounded-lg flex justify-between items-center border border-slate-200">
                  <div className="text-left">
                    <div className="font-bold text-slate-700">Aufgabe {idx + 1}</div>
                    <div className="text-sm text-slate-500">{res.schema}, {res.direction}</div>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold ${res.errors === 0 ? 'text-green-600' : 'text-orange-600'}`}>
                      {res.errors === 0 ? 'Perfekt!' : `${res.errors} Fehler`}
                    </div>
                    <div className="text-xs text-slate-400">
                      {res.correctFields} / {res.totalFields} Felder korrekt
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={generateCertificate}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-bold shadow-lg flex items-center gap-2"
              >
                <span>📄</span> Zertifikat herunterladen
              </button>
              <button
                onClick={() => setMode('practice')}
                className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-8 py-3 rounded-lg font-bold"
              >
                Zurück zum Üben
              </button>
            </div>
          </div>
        )}

        {(mode === 'practice' || mode === 'exam') && task && (
          <>
            {/* Controls (Only in Practice) */}
            {mode === 'practice' && (
              <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm mb-4 md:mb-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex gap-2 md:gap-4 w-full sm:w-auto">
                  <select 
                    value={schema} 
                    onChange={(e) => {
                      const newSchema = e.target.value as CalculationSchema;
                      setSchema(newSchema);
                      if (newSchema === 'Bezugskalkulation' && direction === 'Differenz') {
                        setDirection('Vorwärts');
                      }
                    }}
                    className="p-2 border rounded shadow-sm text-sm flex-1 sm:flex-none"
                  >
                    <option value="Bezugskalkulation">Bezugskalkulation</option>
                    <option value="Handelskalkulation">Handelskalkulation</option>
                  </select>
                  
                  <select 
                    value={direction} 
                    onChange={(e) => setDirection(e.target.value as CalculationDirection)}
                    className="p-2 border rounded shadow-sm text-sm flex-1 sm:flex-none"
                  >
                    <option value="Vorwärts">Vorwärts</option>
                    <option value="Rückwärts">Rückwärts</option>
                    {schema === 'Handelskalkulation' && (
                      <option value="Differenz">Differenz</option>
                    )}
                  </select>
                </div>

                <button 
                  onClick={newTask}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow-sm transition-colors flex items-center gap-2 text-sm w-full sm:w-auto justify-center"
                >
                  <span>↻</span> Neue Aufgabe
                </button>
              </div>
            )}

            {/* Exam Progress */}
            {mode === 'exam' && (
              <div className="mb-6 flex justify-between items-center bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                <span className="font-bold text-indigo-900">Prüfung: Aufgabe {examState.currentIndex + 1} von {examState.tasks.length}</span>
                <span className="text-sm text-indigo-700">{task.schema} ({task.direction})</span>
              </div>
            )}

            {/* Task Description */}
            <div className="bg-blue-50 border border-blue-100 p-4 md:p-6 rounded-xl mb-4 md:mb-8 text-slate-800 leading-relaxed shadow-sm text-sm md:text-base">
              {task.description}
            </div>

            {/* Calculation Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200 text-xs md:text-base">
              <div className="grid grid-cols-[1fr_90px_32px] sm:grid-cols-[1fr_120px_50px] md:grid-cols-[1fr_180px_80px] bg-slate-100 border-b border-slate-200 font-bold text-slate-700">
                <div className="p-1 md:p-3">Posten</div>
                <div className="p-1 md:p-3 text-right md:text-left">Betrag (€)</div>
                <div className="p-1 md:p-3 text-center">Status</div>
              </div>

              {visibleRows.map((row, idx) => {
                const isReadOnly = 
                  row.key === 'bezugskosten' ||
                  (task.direction === 'Vorwärts' && row.key === 'lep') ||
                  (task.direction === 'Rückwärts' && (
                    (task.schema === 'Bezugskalkulation' && row.key === 'bp') ||
                    (task.schema === 'Handelskalkulation' && row.key === 'brutto')
                  )) ||
                  (task.direction === 'Differenz' && (row.key === 'lep' || row.key === 'brutto'));
                
                // Determine percentage label
                let label = row.label;
                const isDifferenceProfit = task.direction === 'Differenz' && row.key === 'gewinn';

                if (row.percentageKey) {
                  if (isDifferenceProfit) {
                    label = `${row.operator} ${row.label}`;
                  } else {
                    label = `${row.operator} ${row.label} (${task.percentages[row.percentageKey]}%)`;
                  }
                } else if (row.operator) {
                  label = `${row.operator} ${row.label}`;
                }

                return (
                  <div key={row.key} className={`grid grid-cols-[1fr_90px_32px] sm:grid-cols-[1fr_120px_50px] md:grid-cols-[1fr_180px_80px] border-b border-slate-100 items-center hover:bg-slate-50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                    <div className="p-1 pl-2 md:p-2 md:pl-4 text-slate-700 font-medium truncate" title={label}>
                      {label}
                      {isDifferenceProfit && (
                        <span className="ml-2">
                          <input
                            type="text"
                            value={showSolution ? task.percentages['gewinn_p'].toString().replace('.', ',') : (userInputs['gewinn_p'] || '')}
                            onChange={(e) => handleInputChange('gewinn_p', e.target.value)}
                            disabled={showSolution}
                            className={`w-12 md:w-16 p-0.5 md:p-1 border rounded text-right font-mono text-xs md:text-base inline-block ${
                              feedback['gewinn_p'] === true ? 'border-green-500 bg-green-50' : 
                              feedback['gewinn_p'] === false ? 'border-red-500 bg-red-50' : 'bg-white border-slate-300'
                            }`}
                            placeholder="0"
                          /> %
                        </span>
                      )}
                    </div>
                    <div className="p-0.5 md:p-1">
                      <input 
                        type="text" 
                        value={showSolution ? task.values[row.key].toFixed(2).replace('.', ',') : (userInputs[row.key] || '')}
                        onChange={(e) => handleInputChange(row.key, e.target.value)}
                        disabled={isReadOnly || showSolution}
                        className={`w-full p-0.5 md:p-1.5 border rounded text-right font-mono text-xs md:text-base ${
                          isReadOnly ? 'bg-slate-100 text-slate-500' : 'bg-white focus:ring-2 focus:ring-blue-500 outline-none border-slate-300'
                        } ${
                          feedback[row.key] === true ? 'border-green-500 bg-green-50' : 
                          feedback[row.key] === false ? 'border-red-500 bg-red-50' : ''
                        }`}
                        placeholder="0,00"
                      />
                    </div>
                    <div className="p-0.5 md:p-2 flex flex-col items-center justify-center relative">
                      <div className="flex items-center gap-0.5 md:gap-2 text-base md:text-xl">
                        {feedback[row.key] === true && <span className="text-green-500">✓</span>}
                        {feedback[row.key] === false && (
                          <>
                            <span className="text-red-500">✗</span>
                            {mode === 'practice' && (
                              <button 
                                onClick={() => setExpandedExplanations(prev => ({...prev, [row.key]: !prev[row.key]}))}
                                className="text-[10px] md:text-xs bg-blue-100 text-blue-700 px-1 py-0.5 md:px-2 md:py-1 rounded hover:bg-blue-200 font-bold"
                                title="Erklärung anzeigen"
                              >
                                ?
                              </button>
                            )}
                          </>
                        )}
                      </div>
                      {mode === 'practice' && expandedExplanations[row.key] && feedback[row.key] === false && (
                        <div className="absolute right-full top-0 mr-2 z-20 w-40 md:w-64 text-[10px] md:text-xs text-slate-600 bg-white p-2 rounded-lg border border-blue-200 shadow-xl">
                          <div className="font-bold text-blue-800 mb-1">Lösungsweg:</div>
                          {getCalculationExplanation(row.key, task.direction, task)}
                          <div className="absolute right-[-6px] top-3 w-3 h-3 bg-white border-t border-r border-blue-200 rotate-45"></div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex gap-4">
              {mode === 'practice' ? (
                <>
                  <button 
                    onClick={checkSolution}
                    className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-bold shadow-sm transition-colors flex-1 md:flex-none"
                  >
                    ✓ Überprüfen
                  </button>
                  
                  <button 
                    onClick={() => setShowSolution(!showSolution)}
                    className="bg-orange-400 hover:bg-orange-500 text-white px-6 py-3 rounded-lg font-bold shadow-sm transition-colors flex-1 md:flex-none"
                  >
                    ℹ Musterlösung {showSolution ? 'ausblenden' : 'anzeigen'}
                  </button>

                  {getVideoUrl(schema, direction) && (
                    <a 
                      href={getVideoUrl(schema, direction)!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-bold shadow-sm transition-colors flex-1 md:flex-none flex items-center justify-center gap-2"
                    >
                      <span>▶</span> Lernvideo
                    </a>
                  )}
                </>
              ) : (
                <div className="flex gap-4 w-full">
                  <button 
                    onClick={handleExamCheck}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-bold shadow-sm transition-colors flex-1"
                  >
                    🔍 Eingaben prüfen
                  </button>
                  <button 
                    onClick={handleExamNext}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg font-bold shadow-lg flex-1"
                  >
                    {examState.currentIndex < examState.tasks.length - 1 ? 'Nächste Aufgabe →' : 'Prüfung beenden ✓'}
                  </button>
                </div>
              )}
            </div>
          </>
        )}

      </main>
    </div>
  );
}


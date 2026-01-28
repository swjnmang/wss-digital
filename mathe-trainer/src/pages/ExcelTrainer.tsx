import React, { useState, useMemo, useCallback } from 'react';
import { OnlyOfficeEditor } from '../components/ExcelTrainer/LuckesheetEditor';
import { TaskPanel } from '../components/ExcelTrainer/TaskPanel';
import excelTasks from '../data/excelTasks.json';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const ExcelTrainer: React.FC = () => {
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [validation, setValidation] = useState<any>(null);

  const currentTask = excelTasks.tasks[currentTaskIndex];

  const handleCheck = useCallback(() => {
    if (!currentTask) return { success: false, message: '', type: 'error' as const };

    const validations = Array.isArray(currentTask.validation)
      ? currentTask.validation
      : [currentTask.validation];

    let allCorrect = true;
    const results: any[] = [];

    for (const val of validations) {
      // Get the cell value from Jspreadsheet
      const cells = document.querySelectorAll('input[type="text"]');
      let cellValue = '';

      // Find cell by data attribute or search in spreadsheet
      cells.forEach((cell: any) => {
        if (cell.value && (cell.value.includes('SUMME') || cell.value.includes('MIN') || cell.value.includes('MAX'))) {
          cellValue = cell.value;
        }
      });

      if (!cellValue) {
        results.push({
          label: val.label || 'Formel',
          success: false,
          message: 'Formel nicht gefunden. Gib die Formel in die Zelle ein!',
        });
        allCorrect = false;
        continue;
      }

      const userInput = cellValue.trim().toUpperCase();
      const expectedFormula = val.expectedFormula?.trim().toUpperCase() || '';

      if (userInput === expectedFormula) {
        results.push({
          label: val.label || 'Formel',
          success: true,
          message: val.feedback?.correct || '✅ Korrekt!',
        });
      } else {
        results.push({
          label: val.label || 'Formel',
          success: false,
          message: val.feedback?.wrongFormula || '❌ Überprüfe die Formel',
        });
        allCorrect = false;
      }
    }

    setValidation({ success: allCorrect, results });
    return {
      success: allCorrect,
      message: allCorrect ? '✅ Alle Formeln korrekt!' : '❌ Überprüfe die Formeln',
      type: (allCorrect ? 'correct' : 'error') as const,
    };
  }, [currentTask]);

  const handleNextTask = () => {
    if (currentTaskIndex < excelTasks.tasks.length - 1) {
      setCurrentTaskIndex(currentTaskIndex + 1);
      setValidation(null);
    }
  };

  const handlePreviousTask = () => {
    if (currentTaskIndex > 0) {
      setCurrentTaskIndex(currentTaskIndex - 1);
      setValidation(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">📊 Excel Trainer</h1>
          <p className="text-gray-600 mt-2">Lerne Excel-Formeln interaktiv mit echten Berechnungen</p>
        </div>

        {/* Progress */}
        <div className="mb-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Aufgabe <span className="font-bold">{currentTaskIndex + 1}</span> von{' '}
            <span className="font-bold">{excelTasks.tasks.length}</span>
          </div>
          <div className="w-48 bg-gray-300 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${((currentTaskIndex + 1) / excelTasks.tasks.length) * 100}%`,
              }}
            ></div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
          {/* Left Panel */}
          <div className="lg:col-span-1">
            <TaskPanel
              title={currentTask?.title || ''}
              description={currentTask?.description || ''}
              instruction={currentTask?.instruction || ''}
              difficulty={currentTask?.difficulty || 'einfach'}
              hint={
                Array.isArray(currentTask?.validation)
                  ? currentTask.validation[0]?.feedback?.hint
                  : currentTask?.validation?.feedback?.hint
              }
              onCheck={handleCheck}
              validationResult={validation}
            />
          </div>

          {/* Right Panel - Spreadsheet */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              {currentTask && (
                <OnlyOfficeEditor
                  task={currentTask}
                  key={currentTaskIndex}
                  onDataChange={(data) => console.log('OnlyOffice Data changed:', data)}
                />
              )}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={handlePreviousTask}
            disabled={currentTaskIndex === 0}
            className="flex items-center gap-2 px-4 py-2 bg-gray-400 hover:bg-gray-500 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            <ChevronLeft size={20} />
            Zurück
          </button>

          <div className="text-center text-sm text-gray-600">
            Aufgabe {currentTaskIndex + 1} / {excelTasks.tasks.length}
          </div>

          <button
            onClick={handleNextTask}
            disabled={currentTaskIndex === excelTasks.tasks.length - 1}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            Weiter
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

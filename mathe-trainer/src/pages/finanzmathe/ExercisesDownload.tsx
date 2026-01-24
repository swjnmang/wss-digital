import React, { useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {
  createSimpleInterestTask,
  createZinseszinsTask,
  createKapitalmehrungTask,
  createKapitalminderungTask,
  createRentenEndwertTask,
  createRatendarlehenPlanTask,
  createAnnuitaetPlanTask,
} from './GemischteFinanzaufgaben';

type TaskType =
  | 'simple_interest'
  | 'zinseszins'
  | 'kapitalmehrung'
  | 'kapitalminderung'
  | 'renten_endwert'
  | 'ratendarlehen_plan'
  | 'annuitaet_plan';

const taskTypeLabels: Record<TaskType, string> = {
  simple_interest: 'Zinsrechnung',
  zinseszins: 'Zinseszins',
  kapitalmehrung: 'Kapitalmehrung',
  kapitalminderung: 'Kapitalminderung',
  renten_endwert: 'Rentensparrate',
  ratendarlehen_plan: 'Ratendarlehen',
  annuitaet_plan: 'Annuitätendarlehen',
};

const taskGenerators: Record<TaskType, () => any> = {
  simple_interest: createSimpleInterestTask,
  zinseszins: createZinseszinsTask,
  kapitalmehrung: createKapitalmehrungTask,
  kapitalminderung: createKapitalminderungTask,
  renten_endwert: createRentenEndwertTask,
  ratendarlehen_plan: createRatendarlehenPlanTask,
  annuitaet_plan: createAnnuitaetPlanTask,
};

export default function ExercisesDownload() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<Set<TaskType>>(new Set(Object.keys(taskTypeLabels) as TaskType[]));
  const [taskCount, setTaskCount] = useState(10);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleToggleType = (type: TaskType) => {
    const newSelected = new Set(selectedTypes);
    if (newSelected.has(type)) {
      newSelected.delete(type);
    } else {
      newSelected.add(type);
    }
    setSelectedTypes(newSelected);
  };

  const handleSelectAll = () => {
    setSelectedTypes(new Set(Object.keys(taskTypeLabels) as TaskType[]));
  };

  const handleDeselectAll = () => {
    setSelectedTypes(new Set());
  };

  const generatePDF = async () => {
    if (selectedTypes.size === 0) {
      alert('Bitte wähle mindestens einen Aufgabentyp aus!');
      return;
    }

    setIsGenerating(true);

    try {
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 10;
      const contentWidth = pageWidth - 2 * margin;
      let currentY = margin;

      // Titel
      doc.setFontSize(20);
      doc.text('Übungsaufgaben Finanzmathematik', pageWidth / 2, currentY, { align: 'center' });
      currentY += 15;

      // Generiere Aufgaben
      const selectedTypeArray = Array.from(selectedTypes);
      const tasksPerType = Math.floor(taskCount / selectedTypeArray.length);
      const remainder = taskCount % selectedTypeArray.length;

      const tasks: Array<{ type: TaskType; task: any; number: number }> = [];
      selectedTypeArray.forEach((type, index) => {
        const count = tasksPerType + (index < remainder ? 1 : 0);
        const generator = taskGenerators[type];
        for (let i = 0; i < count; i++) {
          tasks.push({
            type,
            task: generator(),
            number: tasks.length + 1,
          });
        }
      });

      // Aufgaben auf Seiten
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);

      for (const item of tasks) {
        // Prüfe ob neuer Seitenumbruch nötig ist
        if (currentY > pageHeight - 50) {
          doc.addPage();
          currentY = margin;
        }

        // Aufgabennummer und Typ
        doc.setTextColor(0, 0, 139);
        doc.setFont('Helvetica', 'bold');
        doc.text(
          `Aufgabe ${item.number}: ${taskTypeLabels[item.type as TaskType]}`,
          margin,
          currentY
        );
        currentY += 7;

        // Aufgabentext (vereinfacht - zeige nur Struktur)
        doc.setTextColor(0, 0, 0);
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(10);
        
        const questionText = item.task.question?.toString?.() || '[Aufgabentext]';
        const wrappedText = doc.splitTextToSize(questionText.substring(0, 100) + '...', contentWidth - 4);
        doc.text(wrappedText, margin + 2, currentY, { maxWidth: contentWidth - 4 });
        currentY += wrappedText.length * 5 + 8;

        // Eingabefeld für Antwort
        doc.setDrawColor(200, 200, 200);
        doc.rect(margin + 2, currentY, contentWidth - 4, 15);
        currentY += 18;

        // Trennlinie
        doc.setDrawColor(220, 220, 220);
        doc.line(margin, currentY, pageWidth - margin, currentY);
        currentY += 3;
      }

      // Lösungsseiten
      doc.addPage();
      currentY = margin;

      doc.setFontSize(16);
      doc.setTextColor(0, 0, 139);
      doc.setFont('Helvetica', 'bold');
      doc.text('Musterlösungen', pageWidth / 2, currentY, { align: 'center' });
      currentY += 15;

      for (const item of tasks) {
        // Neuer Seitenumbruch wenn nötig
        if (currentY > pageHeight - 40) {
          doc.addPage();
          currentY = margin;
        }

        // Lösungstitel
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 139);
        doc.setFont('Helvetica', 'bold');
        doc.text(`Lösung Aufgabe ${item.number}`, margin, currentY);
        currentY += 7;

        // Lösungstext
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.setFont('Helvetica', 'normal');
        
        const solutionText = item.task.solution?.toString?.() || '[Lösungstext]';
        const wrappedSolution = doc.splitTextToSize(solutionText.substring(0, 150) + '...', contentWidth - 4);
        doc.text(wrappedSolution, margin + 2, currentY, { maxWidth: contentWidth - 4 });
        currentY += wrappedSolution.length * 5 + 8;

        // Trennlinie
        doc.setDrawColor(220, 220, 220);
        doc.line(margin, currentY, pageWidth - margin, currentY);
        currentY += 3;
      }

      // Speichern
      doc.save(`Übungsaufgaben_Finanzmathematik_${new Date().toLocaleDateString('de-DE')}.pdf`);
      setIsOpen(false);
    } catch (error) {
      console.error('PDF-Generierungsfehler:', error);
      alert('Fehler beim Generieren des PDFs. Bitte versuche es später erneut.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      {/* Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="block p-6 bg-purple-50 rounded-xl hover:bg-purple-100 transition border border-purple-200 w-full"
      >
        <h2 className="text-xl font-bold text-purple-800 mb-2">📥 Download Übungsaufgaben</h2>
        <p className="text-gray-600">Generiere Übungsaufgaben als PDF zum Ausdrucken.</p>
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 max-h-96 overflow-y-auto">
            <h2 className="text-2xl font-bold text-blue-900 mb-4">Übungsaufgaben generieren</h2>

            {/* Aufgabenanzahl */}
            <div className="mb-6">
              <label className="block font-semibold text-gray-700 mb-2">Anzahl Aufgaben:</label>
              <select
                value={taskCount}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTaskCount(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
              >
                {[5, 10, 15, 20].map((num) => (
                  <option key={num} value={num}>
                    {num} Aufgaben
                  </option>
                ))}
              </select>
            </div>

            {/* Aufgabentypen */}
            <div className="mb-6">
              <label className="block font-semibold text-gray-700 mb-3">Aufgabentypen:</label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {(Object.entries(taskTypeLabels) as [TaskType, string][]).map(([type, label]) => (
                  <label key={type} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedTypes.has(type)}
                      onChange={() => handleToggleType(type)}
                      className="mr-3 w-4 h-4 rounded"
                    />
                    <span className="text-gray-700">{label}</span>
                  </label>
                ))}
              </div>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleSelectAll}
                  className="flex-1 px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm font-medium hover:bg-blue-200"
                >
                  Alle
                </button>
                <button
                  onClick={handleDeselectAll}
                  className="flex-1 px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm font-medium hover:bg-gray-200"
                >
                  Keine
                </button>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setIsOpen(false)}
                disabled={isGenerating}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 disabled:opacity-50"
              >
                Abbrechen
              </button>
              <button
                onClick={generatePDF}
                disabled={isGenerating || selectedTypes.size === 0}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
              >
                {isGenerating ? 'Generiere...' : 'PDF generieren'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

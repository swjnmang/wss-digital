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

  const getInputDescription = (taskType: TaskType, input: any) => {
    // Beschreibungen basierend auf Task-Type und Input-ID
    const descriptions: Record<TaskType, Record<string, string>> = {
      simple_interest: { Z: 'Zinsen', K: 'Kapital', p: 'Zinssatz', t: 'Tage' },
      zinseszins: { Kn: 'Endkapital', K0: 'Anfangskapital', p: 'Zinssatz', n: 'Jahre' },
      kapitalmehrung: { Kn: 'Endkapital', K0: 'Anfangskapital', r: 'Jahresrate', n: 'Jahre' },
      kapitalminderung: { Kn: 'Endkapital', K0: 'Anfangskapital', r: 'Jahresrate', n: 'Jahre' },
      renten_endwert: { Kn: 'Endwert', r: 'Jahresrate', n: 'Jahre' },
      ratendarlehen_plan: { debt: 'Schuld', interest: 'Zinsen', rate: 'Tilgung' },
      annuitaet_plan: { debt: 'Schuld', interest: 'Zinsen', annuity: 'Annuität' },
    };

    const taskDesc = descriptions[taskType];
    if (!taskDesc) return input.label || input.id || '?';

    // Prüfe ob es ein dynamisches Feld ist (z.B. "plan_y2_debt")
    if (input.id.includes('_y')) {
      const match = input.id.match(/_y(\d+)_(.*)/);
      if (match) {
        const [, year, type] = match;
        const typeDesc = descriptions[taskType]?.[type] || type;
        return `Jahr ${year}: ${typeDesc}`;
      }
    }

    return taskDesc[input.id] || input.label || input.id || '?';
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

      // Kopfzeile mit Website
      const addHeader = () => {
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text('wss-digital.de - wirtschaftsschule digital - Portal für die Wirtschaftsschule', pageWidth / 2, 7, { align: 'center' });
        doc.setDrawColor(220, 220, 220);
        doc.line(margin, 10, pageWidth - margin, 10);
      };

      // Helper: Füge neue Seite hinzu
      const addNewPage = () => {
        doc.addPage();
        addHeader();
        currentY = margin + 15;
      };

      // Titel auf erster Seite
      addHeader();
      doc.setFontSize(20);
      doc.setTextColor(0, 0, 139);
      doc.text('Übungsaufgaben Finanzmathematik', pageWidth / 2, currentY + 10, { align: 'center' });
      currentY += 25;

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
        if (currentY > pageHeight - 80) {
          addNewPage();
        }

        // Aufgabennummer und Typ
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 139);
        doc.setFont('Helvetica', 'bold');
        doc.text(
          `Aufgabe ${item.number}: ${taskTypeLabels[item.type as TaskType]}`,
          margin,
          currentY
        );
        currentY += 8;

        // Aufgaben-Text: Zeige alle Inputs außer dem letzten (der letzte ist normalerweise der gesuchte)
        doc.setTextColor(0, 0, 0);
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(10);

        // Zeige die gegebenen Werte (alle außer dem letzten Input-Feld)
        const givenInputs = item.task.inputs.slice(0, -1);
        for (const input of givenInputs) {
          const description = getInputDescription(item.type, input);
          const displayValue = typeof input.correctValue === 'number' 
            ? input.correctValue.toLocaleString('de-DE', { 
                minimumFractionDigits: input.displayDecimals || 2, 
                maximumFractionDigits: input.displayDecimals || 2 
              })
            : input.correctValue;
          
          const givenLine = `Gegeben: ${description} = ${displayValue} ${input.unit}`;
          const wrappedGiven = doc.splitTextToSize(givenLine, contentWidth - 4);
          doc.text(wrappedGiven, margin + 2, currentY);
          currentY += wrappedGiven.length * 4;
        }

        // Zeige das gesuchte Feld (letzter Input)
        if (item.task.inputs.length > 0) {
          const lastInput = item.task.inputs[item.task.inputs.length - 1];
          const description = getInputDescription(item.type, lastInput);
          const soughtLine = `Gesucht: ${description} (${lastInput.unit})`;
          doc.setFont('Helvetica', 'bold');
          doc.setTextColor(0, 0, 139);
          doc.text(soughtLine, margin + 2, currentY);
          currentY += 6;

          // Eingabefeld
          doc.setTextColor(0, 0, 0);
          doc.setFont('Helvetica', 'normal');
          doc.setDrawColor(150, 150, 150);
          doc.rect(margin + 2, currentY, contentWidth - 4, 8);
          currentY += 12;
        }

        // Trennlinie
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, currentY, pageWidth - margin, currentY);
        currentY += 5;
      }

      // === LÖSUNGSSEITEN ===
      addNewPage();

      doc.setFontSize(16);
      doc.setTextColor(0, 0, 139);
      doc.setFont('Helvetica', 'bold');
      doc.text('Musterlösungen', pageWidth / 2, currentY, { align: 'center' });
      currentY += 12;

      for (const item of tasks) {
        // Neuer Seitenumbruch wenn nötig
        if (currentY > pageHeight - 60) {
          addNewPage();
        }

        // Lösungstitel
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 139);
        doc.setFont('Helvetica', 'bold');
        doc.text(`Lösung Aufgabe ${item.number}`, margin, currentY);
        currentY += 7;

        // Givenene Werte
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.setFont('Helvetica', 'normal');
        
        const givenInputs = item.task.inputs.slice(0, -1);
        for (const input of givenInputs) {
          const description = getInputDescription(item.type, input);
          const displayValue = typeof input.correctValue === 'number' 
            ? input.correctValue.toLocaleString('de-DE', { 
                minimumFractionDigits: input.displayDecimals || 2, 
                maximumFractionDigits: input.displayDecimals || 2 
              })
            : input.correctValue;
          
          const givenLine = `${description} = ${displayValue} ${input.unit}`;
          doc.text(givenLine, margin + 2, currentY);
          currentY += 4;
        }

        currentY += 2;

        // Lösungswerte (Rechnung)
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.setFont('Helvetica', 'bold');

        if (item.task.inputs.length > 0) {
          const lastInput = item.task.inputs[item.task.inputs.length - 1];
          const description = getInputDescription(item.type, lastInput);
          const displayValue = typeof lastInput.correctValue === 'number' 
            ? lastInput.correctValue.toLocaleString('de-DE', { 
                minimumFractionDigits: lastInput.displayDecimals || 2, 
                maximumFractionDigits: lastInput.displayDecimals || 2 
              })
            : lastInput.correctValue;
          
          const lösungsText = `${description} = ${displayValue} ${lastInput.unit}`;
          doc.text(lösungsText, margin + 2, currentY);
          currentY += 7;
        }

        // Trennlinie
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, currentY, pageWidth - margin, currentY);
        currentY += 4;
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
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8">
            <h2 className="text-2xl font-bold text-blue-900 mb-6">Übungsaufgaben generieren</h2>

            <div className="grid grid-cols-2 gap-8">
              {/* Aufgabenanzahl */}
              <div>
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
              <div>
                <label className="block font-semibold text-gray-700 mb-2">Aufgabentypen:</label>
                <div className="space-y-2">
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
              </div>
            </div>

            {/* Select All / Deselect All Buttons */}
            <div className="flex gap-2 mt-6 mb-6">
              <button
                onClick={handleSelectAll}
                className="flex-1 px-3 py-2 bg-blue-100 text-blue-700 rounded text-sm font-medium hover:bg-blue-200"
              >
                Alle
              </button>
              <button
                onClick={handleDeselectAll}
                className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded text-sm font-medium hover:bg-gray-200"
              >
                Keine
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setIsOpen(false)}
                disabled={isGenerating}
                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 disabled:opacity-50"
              >
                Abbrechen
              </button>
              <button
                onClick={generatePDF}
                disabled={isGenerating || selectedTypes.size === 0}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
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

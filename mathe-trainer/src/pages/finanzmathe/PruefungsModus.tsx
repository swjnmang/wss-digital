import React, { useState, useEffect } from 'react';
import 'katex/dist/katex.min.css';
import { jsPDF } from 'jspdf';

// Import der Task-Generatoren aus GemischteFinanzaufgaben
import {
  createSimpleInterestTask,
  createZinseszinsTask,
  createKapitalmehrungTask,
  createKapitalminderungTask,
  createRentenEndwertTask,
  createRatendarlehenPlanTask,
  createAnnuitaetPlanTask,
} from './GemischteFinanzaufgaben';

interface PruefungsAufgabe {
  id: string;
  type: string;
  points: number;
  question: React.ReactNode;
  solution: React.ReactNode;
  inputs: any[];
  userAnswers: Record<string, string>;
  earnedPoints: number;
}

// Nur serialisierbare Daten für localStorage
interface PruefungsAufgabeSerialized {
  id: string;
  type: string;
  points: number;
  inputs: Array<{
    id: string;
    label: string;
    unit: string;
    placeholder: string;
    correctValue: number;
    tolerance: number;
    displayDecimals?: number;
    type?: string;
    options?: string[];
  }>;
  userAnswers: Record<string, string>;
  earnedPoints: number;
}

interface PruefungsZustandSerialized {
  name: string;
  klasse: string;
  aufgaben: PruefungsAufgabeSerialized[];
  aktuelleAufgabeIndex: number;
  gestartet: boolean;
  beendet: boolean;
  termsAkzeptiert: boolean;
}

interface PruefungsZustand {
  name: string;
  klasse: string;
  aufgaben: PruefungsAufgabe[];
  aktuelleAufgabeIndex: number;
  gestartet: boolean;
  beendet: boolean;
  termsAkzeptiert: boolean;
}

const STORAGE_KEY = 'pruefung_zustand';
const MAX_AUFGABEN = 10;

// Aufgabenkonfiguration mit Punkten
const aufgabenkonfig = [
  { generatorKey: 'simple_interest', points: 2, name: 'Zinsrechnung' },
  { generatorKey: 'zinseszins', points: 4, name: 'Zinseszins' },
  { generatorKey: 'kapitalmehrung', points: 4, name: 'Kapitalmehrung' },
  { generatorKey: 'kapitalminderung', points: 4, name: 'Kapitalminderung' },
  { generatorKey: 'renten_endwert', points: 6, name: 'Rentenrechnung' },
  { generatorKey: 'ratendarlehen_plan', points: 4, name: 'Ratendarlehen' },
  { generatorKey: 'annuitaet_plan', points: 4, name: 'Annuitätendarlehen' },
];

const generatePruefungsaufgaben = (): PruefungsAufgabe[] => {
  const aufgaben: PruefungsAufgabe[] = [];
  const generatoren: Record<string, () => any> = {
    simple_interest: createSimpleInterestTask,
    zinseszins: createZinseszinsTask,
    kapitalmehrung: createKapitalmehrungTask,
    kapitalminderung: createKapitalminderungTask,
    renten_endwert: createRentenEndwertTask,
    ratendarlehen_plan: createRatendarlehenPlanTask,
    annuitaet_plan: createAnnuitaetPlanTask,
  };

  // NEUE STRATEGIE: Wähle genau eine Aufgabe pro Typ aus (max 1x pro Typ)
  // Das gewährleistet keine Duplikate
  const sortedConfigs = [...aufgabenkonfig].sort(() => Math.random() - 0.5);
  
  // Begrenze auf MAX_AUFGABEN Arten, aber nimm alle, wenn weniger als MAX_AUFGABEN
  const selectedConfigs = sortedConfigs.slice(0, Math.min(MAX_AUFGABEN, aufgabenkonfig.length));

  // Generiere Aufgaben - eine pro ausgewähltem Typ
  for (let i = 0; i < selectedConfigs.length; i++) {
    const config = selectedConfigs[i];
    const generator = generatoren[config.generatorKey];
    const task = generator();

    // WICHTIG: Setze Toleranz auf 0,5% für alle Aufgaben im Prüfungsmodus
    const adjustedInputs = task.inputs.map((input: any) => ({
      ...input,
      tolerance: Math.max(input.correctValue * 0.005, 0.01), // 0,5% relative Toleranz
    }));

    aufgaben.push({
      id: `aufgabe_${i}`,
      type: config.generatorKey,
      points: config.points,
      question: task.question,
      solution: task.solution,
      inputs: adjustedInputs,
      userAnswers: {},
      earnedPoints: 0,
    });
  }

  return aufgaben;
};

// Hilfsfunktionen für Serialisierung
const serializePruefung = (zustand: PruefungsZustand): PruefungsZustandSerialized => {
  return {
    name: zustand.name,
    klasse: zustand.klasse,
    aufgaben: zustand.aufgaben.map(a => ({
      id: a.id,
      type: a.type,
      points: a.points,
      inputs: a.inputs,
      userAnswers: a.userAnswers,
      earnedPoints: a.earnedPoints,
    })),
    aktuelleAufgabeIndex: zustand.aktuelleAufgabeIndex,
    gestartet: zustand.gestartet,
    beendet: zustand.beendet,
    termsAkzeptiert: zustand.termsAkzeptiert,
  };
};

const deserializePruefung = (serialized: PruefungsZustandSerialized): PruefungsZustand => {
  const generatoren: Record<string, () => any> = {
    simple_interest: createSimpleInterestTask,
    zinseszins: createZinseszinsTask,
    kapitalmehrung: createKapitalmehrungTask,
    kapitalminderung: createKapitalminderungTask,
    renten_endwert: createRentenEndwertTask,
    ratendarlehen_plan: createRatendarlehenPlanTask,
    annuitaet_plan: createAnnuitaetPlanTask,
  };

  return {
    name: serialized.name,
    klasse: serialized.klasse,
    aufgaben: serialized.aufgaben.map(a => {
      // Regeneriere die Aufgabe basierend auf ihrem Type, um question/solution zu erhalten
      const generator = generatoren[a.type];
      const task = generator ? generator() : { question: 'Fehler', solution: 'Fehler', inputs: [] };
      
      // WICHTIG: Benutze DIE GESPEICHERTEN inputs (mit correctValue etc), nicht die neu generierten!
      // Das stellt sicher, dass wir die gleichen Werte zur Bewertung verwenden
      return {
        id: a.id,
        type: a.type,
        points: a.points,
        question: task.question,
        solution: task.solution,
        inputs: a.inputs, // Use serialized inputs, not newly generated ones!
        userAnswers: a.userAnswers,
        earnedPoints: a.earnedPoints,
      };
    }),
    aktuelleAufgabeIndex: serialized.aktuelleAufgabeIndex,
    gestartet: serialized.gestartet,
    beendet: serialized.beendet,
    termsAkzeptiert: serialized.termsAkzeptiert,
  };
};

const StartScreen: React.FC<{
  onStart: (name: string, klasse: string) => void;
}> = ({ onStart }) => {
  const [name, setName] = useState('');
  const [klasse, setKlasse] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);

  const handleStart = () => {
    if (name.trim() && klasse.trim() && termsAccepted) {
      onStart(name, klasse);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-8">
        <h1 className="text-3xl font-bold text-center mb-2 text-blue-900">Prüfungsmodus</h1>
        <p className="text-center text-gray-600 mb-6">Finanzmathe Test</p>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Dein Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="z.B. Max Mustermann"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Klasse *</label>
            <input
              type="text"
              value={klasse}
              onChange={(e) => setKlasse(e.target.value)}
              placeholder="z.B. 9a"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
          <p className="text-sm text-gray-700">
            <span className="font-semibold text-blue-900">Wichtige Hinweise:</span>
          </p>
          <ul className="text-sm text-gray-700 mt-2 space-y-1">
            <li>• Halte deine Rechenwege schriftlich fest</li>
            <li>• Nach Abschluss des Tests erhältst du ein PDF-Zertifikat</li>
            <li>• Du kannst die Prüfung unterbrechen und später fortsetzen</li>
            <li>• Keine Lösungen sind während der Prüfung sichtbar</li>
          </ul>
        </div>

        <div className="flex items-start mb-6">
          <input
            type="checkbox"
            id="terms"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
          />
          <label htmlFor="terms" className="ml-2 text-sm text-gray-700">
            Ich habe die Hinweise gelesen und verstanden und bin bereit für die Prüfung.
          </label>
        </div>

        <button
          onClick={handleStart}
          disabled={!name.trim() || !klasse.trim() || !termsAccepted}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition duration-200"
        >
          Prüfung starten
        </button>
      </div>
    </div>
  );
};

const parseGermanNumber = (str: string): number => {
  let cleaned = str.trim();
  
  // Akzeptiere verschiedene Formate:
  // - Kaufmännisch: 30.000,00 oder 30.000
  // - Ohne Trennzeichen: 30000 oder 30000,00
  // - Englisch mit Punkt als Dezimal wäre falsch (30,000 = 30)
  
  // Wenn ein Komma vorhanden ist, ist es immer das Dezimaltrennzeichen
  if (cleaned.includes(',')) {
    // Entferne alle Punkte (das sind Tausender-Trennzeichen)
    cleaned = cleaned.replace(/\./g, '');
    // Ersetze Komma durch Punkt
    cleaned = cleaned.replace(',', '.');
  } else {
    // Kein Komma: Entferne auch alle Punkte (die sind Tausender-Trennzeichen)
    cleaned = cleaned.replace(/\./g, '');
  }
  
  return parseFloat(cleaned);
};

const isInputCorrect = (input: any, userValue: string): boolean => {
  if (!userValue.trim()) return false;
  const parsed = parseGermanNumber(userValue);
  return !Number.isNaN(parsed) && Math.abs(parsed - input.correctValue) <= input.tolerance;
};

interface ExamScreenProps {
  zustand: PruefungsZustand;
  onUpdateAnswer: (aufgabeIndex: number, inputId: string, value: string) => void;
  onNavigate: (direction: 'prev' | 'next') => void;
  onFinish: () => void;
}

const ExamScreen: React.FC<ExamScreenProps> = ({ zustand, onUpdateAnswer, onNavigate, onFinish }) => {
  const aktuelleAufgabe = zustand.aufgaben[zustand.aktuelleAufgabeIndex];
  const isLastQuestion = zustand.aktuelleAufgabeIndex === zustand.aufgaben.length - 1;
  const isFirstQuestion = zustand.aktuelleAufgabeIndex === 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header mit Fortschrittsbalken */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-2xl font-bold text-gray-900">Prüfung: {zustand.name}</h1>
            <span className="text-lg font-semibold text-blue-600">
              Aufgabe {zustand.aktuelleAufgabeIndex + 1}/{zustand.aufgaben.length}
            </span>
          </div>
          <div className="w-full bg-gray-300 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((zustand.aktuelleAufgabeIndex + 1) / zustand.aufgaben.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Aufgabenkarte */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          {/* Aufgabentext */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Aufgabe</h2>
            <div className="prose prose-table:w-full prose-th:bg-blue-100 prose-th:text-blue-900 prose-th:font-bold prose-td:border prose-td:border-gray-300 prose-td:px-3 prose-td:py-2 prose-th:border prose-th:border-gray-300 prose-th:px-3 prose-th:py-2 max-w-none">
              {aktuelleAufgabe.question}
            </div>
          </div>

          {/* Eingabefelder */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Deine Antworten:</h3>
            
            {/* Prüfe, ob es Tilgungsplan-Inputs sind (ratendarlehen oder annuitaet) */}
            {(aktuelleAufgabe.type === 'ratendarlehen_plan' || aktuelleAufgabe.type === 'annuitaet_plan') ? (
              // Tabellarische Darstellung für Tilgungspläne
              <div className="overflow-x-auto">
                <table className="w-full text-sm border border-gray-300 bg-white mb-4">
                  <thead>
                    <tr className="bg-blue-100">
                      <th className="p-3 text-left border border-gray-300 font-bold text-blue-900">Jahr</th>
                      <th className="p-3 text-left border border-gray-300 font-bold text-blue-900">Schuld (€)</th>
                      <th className="p-3 text-left border border-gray-300 font-bold text-blue-900">Zins (€)</th>
                      <th className="p-3 text-left border border-gray-300 font-bold text-blue-900">Tilgung (€)</th>
                      <th className="p-3 text-left border border-gray-300 font-bold text-blue-900">Annuität (€)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Extrahiere Jahre aus den Input-IDs und gruppiere sie */}
                    {(() => {
                      const years = new Set<number>();
                      const prefix = aktuelleAufgabe.type === 'ratendarlehen_plan' ? 'rate' : 'ann';
                      
                      aktuelleAufgabe.inputs.forEach(input => {
                        const match = input.id.match(/_y(\d+)_/);
                        if (match) years.add(parseInt(match[1]));
                      });
                      
                      const sortedYears = Array.from(years).sort((a, b) => a - b);
                      
                      return sortedYears.map(year => (
                        <tr key={year} className="border-t border-gray-300 hover:bg-blue-50">
                          <td className="p-3 border border-gray-300 font-semibold">{year}</td>
                          <td className="p-3 border border-gray-300">
                            <input
                              type="text"
                              value={aktuelleAufgabe.userAnswers[`${prefix}_y${year}_debt`] || ''}
                              onChange={(e) => onUpdateAnswer(zustand.aktuelleAufgabeIndex, `${prefix}_y${year}_debt`, e.target.value)}
                              placeholder="z.B. 100.000,00"
                              className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                            />
                          </td>
                          <td className="p-3 border border-gray-300">
                            <input
                              type="text"
                              value={aktuelleAufgabe.userAnswers[`${prefix}_y${year}_interest`] || ''}
                              onChange={(e) => onUpdateAnswer(zustand.aktuelleAufgabeIndex, `${prefix}_y${year}_interest`, e.target.value)}
                              placeholder="z.B. 3.200,00"
                              className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                            />
                          </td>
                          <td className="p-3 border border-gray-300">
                            <input
                              type="text"
                              value={aktuelleAufgabe.userAnswers[`${prefix}_y${year}_tilgung`] || ''}
                              onChange={(e) => onUpdateAnswer(zustand.aktuelleAufgabeIndex, `${prefix}_y${year}_tilgung`, e.target.value)}
                              placeholder="z.B. 12.500,00"
                              className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                            />
                          </td>
                          <td className="p-3 border border-gray-300">
                            <input
                              type="text"
                              value={aktuelleAufgabe.userAnswers[`${prefix}_y${year}_annuity`] || ''}
                              onChange={(e) => onUpdateAnswer(zustand.aktuelleAufgabeIndex, `${prefix}_y${year}_annuity`, e.target.value)}
                              placeholder="z.B. 15.700,00"
                              className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                            />
                          </td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>
            ) : (
              // Normale Darstellung für andere Aufgabentypen
              <div className="space-y-4">
                {aktuelleAufgabe.inputs.map(input => (
                  <div key={input.id}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {input.label || input.id} {input.unit && `(${input.unit})`}
                    </label>
                    <input
                      type="text"
                      value={aktuelleAufgabe.userAnswers[input.id] || ''}
                      onChange={(e) => onUpdateAnswer(zustand.aktuelleAufgabeIndex, input.id, e.target.value)}
                      placeholder={input.placeholder}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Navigationstasten */}
          <div className="flex justify-between items-center">
            <button
              onClick={() => onNavigate('prev')}
              disabled={isFirstQuestion}
              className="px-6 py-2 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white font-semibold rounded-lg transition"
            >
              ← Zurück
            </button>

            <div className="flex gap-4">
              {!isLastQuestion ? (
                <button
                  onClick={() => onNavigate('next')}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
                >
                  Weiter →
                </button>
              ) : (
                <button
                  onClick={onFinish}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition"
                >
                  Prüfung beenden
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface ResultsScreenProps {
  zustand: PruefungsZustand;
  onRestart: () => void;
}

const ResultsScreen: React.FC<ResultsScreenProps> = ({ zustand, onRestart }) => {
  const totalPoints = zustand.aufgaben.reduce((sum, aufgabe) => {
    return sum + aufgabe.earnedPoints;
  }, 0);
  
  const maxPoints = zustand.aufgaben.reduce((sum, aufgabe) => sum + aufgabe.points, 0);
  const percentage = Math.round((totalPoints / maxPoints) * 100);
  const passed = percentage >= 50;

  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const textWidth = pageWidth - 2 * margin; // Verfügbare Breite für Text
    let currentY = margin;

    // Helper-Funktion für Text mit Umbruch und Sicherheit
    const addWrappedText = (text: string, x: number, fontSize: number, maxWidth: number) => {
      doc.setFontSize(fontSize);
      const lines = doc.splitTextToSize(text, maxWidth);
      const lineHeight = fontSize * 0.35; // Zeilenabstand
      
      lines.forEach((line, idx) => {
        if (currentY > pageHeight - 15) {
          doc.addPage();
          currentY = margin;
        }
        doc.text(line, x, currentY);
        currentY += lineHeight + 2;
      });
      return lines.length;
    };

    // Header
    doc.setFontSize(22);
    doc.setFont(undefined, 'bold');
    doc.text('Prüfungszertifikat', pageWidth / 2, currentY, { align: 'center' });
    currentY += 12;
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text('Finanzmathe Prüfung | wss-digital.de', pageWidth / 2, currentY, { align: 'center' });
    currentY += 10;
    
    // Trennlinie
    doc.setDrawColor(100, 100, 100);
    doc.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 8;

    // Studentinformation
    doc.setFont(undefined, 'bold');
    doc.setFontSize(11);
    doc.text('Schüler/in:', margin, currentY);
    currentY += 6;
    
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    doc.text(`Name: ${zustand.name.substring(0, 50)}`, margin + 8, currentY);
    currentY += 5;
    doc.text(`Klasse: ${zustand.klasse.substring(0, 30)}`, margin + 8, currentY);
    currentY += 5;
    doc.text(`Datum: ${new Date().toLocaleDateString('de-DE')}`, margin + 8, currentY);
    currentY += 10;

    // Ergebnisse
    doc.setFont(undefined, 'bold');
    doc.setFontSize(11);
    doc.text('Ergebnisse:', margin, currentY);
    currentY += 6;
    
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    doc.text(`Erreichte Punkte: ${totalPoints.toFixed(1)} / ${maxPoints}`, margin + 8, currentY);
    currentY += 5;
    doc.text(`Erfolgsquote: ${percentage}%`, margin + 8, currentY);
    currentY += 8;

    // Status
    doc.setFont(undefined, 'bold');
    doc.setFontSize(12);
    if (passed) {
      doc.setTextColor(34, 197, 94);
      doc.text('✓ BESTANDEN', margin + 8, currentY);
    } else {
      doc.setTextColor(220, 38, 38);
      doc.text('✗ NICHT BESTANDEN', margin + 8, currentY);
      doc.setFont(undefined, 'normal');
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
      currentY += 5;
      doc.text('(Mindestens 50% erforderlich)', margin + 8, currentY);
    }
    doc.setTextColor(0, 0, 0);
    currentY += 10;

    // Aufgabenübersicht
    if (currentY > pageHeight - 40) {
      doc.addPage();
      currentY = margin;
    }
    
    doc.setFont(undefined, 'bold');
    doc.setFontSize(11);
    doc.text('Aufgabenübersicht:', margin, currentY);
    currentY += 7;

    doc.setFont(undefined, 'normal');
    doc.setFontSize(9);
    zustand.aufgaben.forEach((aufgabe, index) => {
      if (currentY > pageHeight - 20) {
        doc.addPage();
        currentY = margin;
      }
      const earned = aufgabe.earnedPoints;
      const status = earned === aufgabe.points ? '✓' : earned > 0 ? '◐' : '✗';
      const line = `${status} Aufgabe ${index + 1}: ${aufgabe.points} Pkt. (${earned.toFixed(1)} erhalten)`;
      doc.text(line, margin + 4, currentY);
      currentY += 4.5;
    });

    // === Seite 2: Detaillierte Lösungen ===
    doc.addPage();
    currentY = margin;
    doc.setFont(undefined, 'bold');
    doc.setFontSize(12);
    doc.text('Detaillierte Lösungen:', margin, currentY);
    currentY += 8;

    // Detaillierte Aufgaben
    zustand.aufgaben.forEach((aufgabe, index) => {
      if (currentY > pageHeight - 25) {
        doc.addPage();
        currentY = margin;
      }

      // Aufgabentitel
      doc.setFont(undefined, 'bold');
      doc.setFontSize(10);
      const statusText = aufgabe.earnedPoints === aufgabe.points ? '✓' : aufgabe.earnedPoints > 0 ? '◐' : '✗';
      const titleLine = `Aufgabe ${index + 1} - ${statusText} (${aufgabe.earnedPoints.toFixed(1)}/${aufgabe.points} Pkt.)`;
      doc.text(titleLine, margin, currentY);
      currentY += 6;

      doc.setFont(undefined, 'normal');
      doc.setFontSize(8);
      
      // Input-Details mit sicherer Textumbruchlogik
      aufgabe.inputs.forEach(input => {
        if (currentY > pageHeight - 12) {
          doc.addPage();
          currentY = margin;
        }

        const userValue = aufgabe.userAnswers[input.id];
        const isCorrect = userValue && isInputCorrect(input, userValue);
        const status = isCorrect ? '✓' : userValue ? '✗' : '−';
        
        const label = (input.label || input.id).substring(0, 30);
        const unit = input.unit ? ` (${input.unit})` : '';
        const expected = input.correctValue.toFixed(input.displayDecimals || 2).substring(0, 20);
        const answered = (userValue || '−').substring(0, 20);

        // Kompaktes Format mit Sicherheit
        const line = `${status} ${label}${unit}: ${answered} [erw. ${expected}]`;
        const wrappedLines = doc.splitTextToSize(line, textWidth - 8);
        
        wrappedLines.forEach((wrappedLine, idx) => {
          if (currentY > pageHeight - 10) {
            doc.addPage();
            currentY = margin;
          }
          doc.text(wrappedLine, margin + 4, currentY);
          currentY += 3.5;
        });
      });

      currentY += 2;
    });

    // Footer auf allen Seiten
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFont(undefined, 'italic');
      doc.setFontSize(8);
      doc.text(`Seite ${i} von ${totalPages}`, pageWidth / 2, pageHeight - 8, { align: 'center' });
    }

    // Speichern
    const safeName = zustand.name.replace(/[^a-zA-Z0-9äöüß\-_]/g, '_').substring(0, 50);
    const filename = `Pruefungszertifikat_${safeName}_${new Date().toLocaleDateString('de-DE', { year: 'numeric', month: '2-digit', day: '2-digit' })}.pdf`;
    doc.save(filename);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Ergebniskarte */}
        <div className="bg-white rounded-lg shadow-2xl p-8 mb-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Prüfung abgeschlossen!</h1>
            <p className="text-lg text-gray-600">Herzlichen Glückwunsch, {zustand.name}!</p>
          </div>

          {/* Ergebnissummary */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-8 mb-8">
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{totalPoints}/{maxPoints}</div>
                <div className="text-sm text-gray-600">Punkte</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{percentage}%</div>
                <div className="text-sm text-gray-600">Prozentangabe</div>
              </div>
              <div className="text-center">
                <div className={`text-3xl font-bold ${passed ? 'text-green-600' : 'text-red-600'}`}>
                  {passed ? '✓' : '✗'}
                </div>
                <div className={`text-sm font-semibold ${passed ? 'text-green-600' : 'text-red-600'}`}>
                  {passed ? 'BESTANDEN' : 'NICHT BESTANDEN'}
                </div>
              </div>
            </div>

            {!passed && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 text-sm text-red-700">
                <p><strong>Achtung:</strong> Du hast weniger als 50% der Punkte erreicht. Bitte wiederhole die Prüfung.</p>
              </div>
            )}
          </div>

          {/* Aufgabendetails */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Aufgabenrückmeldung</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {zustand.aufgaben.map((aufgabe, index) => (
                <div key={aufgabe.id} className={`p-4 rounded-lg border-l-4 ${
                  aufgabe.earnedPoints === aufgabe.points ? 'bg-green-50 border-green-500' : aufgabe.earnedPoints > 0 ? 'bg-blue-50 border-blue-500' : 'bg-red-50 border-red-500'
                }`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className={`font-semibold ${
                        aufgabe.earnedPoints === aufgabe.points ? 'text-green-900' : aufgabe.earnedPoints > 0 ? 'text-blue-900' : 'text-red-900'
                      }`}>
                        Aufgabe {index + 1}: {aufgabe.type} {aufgabe.earnedPoints === aufgabe.points ? '✓' : aufgabe.earnedPoints > 0 ? '◐' : '✗'}
                      </h3>
                      <div className="text-sm mt-2 space-y-1">
                        {aufgabe.inputs.map(input => (
                          <div key={input.id}>
                            <strong>{input.label}:</strong> Deine Antwort: {aufgabe.userAnswers[input.id] || '(keine Antwort)'} | 
                            Korrekt: {input.correctValue.toFixed(input.displayDecimals || 2)}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className={`text-lg font-bold ${
                      aufgabe.earnedPoints === aufgabe.points ? 'text-green-600' : aufgabe.earnedPoints > 0 ? 'text-blue-600' : 'text-red-600'
                    }`}>
                      {aufgabe.earnedPoints.toFixed(1)}/{aufgabe.points}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Aktionstasten */}
          <div className="flex gap-4">
            <button
              onClick={generatePDF}
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
            >
              📥 PDF herunterladen
            </button>
            <button
              onClick={onRestart}
              className="flex-1 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition"
            >
              Neue Prüfung starten
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const PruefungsModus: React.FC = () => {
  const [zustand, setZustand] = useState<PruefungsZustand | null>(null);

  useEffect(() => {
    // Lade Zustand aus localStorage
    const gespeichert = localStorage.getItem(STORAGE_KEY);
    if (gespeichert) {
      try {
        const serialized = JSON.parse(gespeichert) as PruefungsZustandSerialized;
        const restored = deserializePruefung(serialized);
        setZustand(restored);
      } catch (e) {
        console.error('Fehler beim Laden des Prüfungszustands:', e);
      }
    }
  }, []);

  const saveZustand = (neuerZustand: PruefungsZustand) => {
    setZustand(neuerZustand);
    const serialized = serializePruefung(neuerZustand);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serialized));
  };

  const handleStart = (name: string, klasse: string) => {
    const aufgaben = generatePruefungsaufgaben();
    const neuerZustand: PruefungsZustand = {
      name,
      klasse,
      aufgaben,
      aktuelleAufgabeIndex: 0,
      gestartet: true,
      beendet: false,
      termsAkzeptiert: true,
    };
    saveZustand(neuerZustand);
  };

  const handleUpdateAnswer = (aufgabeIndex: number, inputId: string, value: string) => {
    if (!zustand) return;
    
    const neuerZustand = { ...zustand };
    neuerZustand.aufgaben[aufgabeIndex].userAnswers[inputId] = value;
    saveZustand(neuerZustand);
  };

  const handleNavigate = (direction: 'prev' | 'next') => {
    if (!zustand) return;
    
    const newIndex = direction === 'next' 
      ? Math.min(zustand.aktuelleAufgabeIndex + 1, zustand.aufgaben.length - 1)
      : Math.max(zustand.aktuelleAufgabeIndex - 1, 0);
    
    const neuerZustand = { ...zustand, aktuelleAufgabeIndex: newIndex };
    saveZustand(neuerZustand);
  };

  const handleFinish = () => {
    if (!zustand) return;

    // Bewerte alle Aufgaben mit flexibler Punkt-Vergabe
    const aufgabenMitErgebnissen = zustand.aufgaben.map(aufgabe => {
      let earnedPoints = 0;

      // Für Tilgungspläne: 0,5 Punkte pro richtige Zelle
      if (aufgabe.type === 'ratendarlehen_plan' || aufgabe.type === 'annuitaet_plan') {
        const correctCells = aufgabe.inputs.filter(input => {
          const userValue = aufgabe.userAnswers[input.id];
          const hasValue = userValue && userValue.trim();
          const isCorrect = hasValue && isInputCorrect(input, userValue);
          
          console.log(`[${aufgabe.type}] Input ${input.id}:`, {
            userValue: userValue || '(empty)',
            correctValue: input.correctValue,
            tolerance: input.tolerance,
            isCorrect,
          });
          
          return isCorrect;
        }).length;
        
        console.log(`[${aufgabe.type}] Correct cells: ${correctCells}/${aufgabe.inputs.length}`);
        earnedPoints = Math.min(correctCells * 0.5, aufgabe.points);
      } else {
        // Für andere Aufgaben: Alle Inputs müssen richtig sein (alles-oder-nichts)
        const allCorrect = aufgabe.inputs.every(input =>
          aufgabe.userAnswers[input.id] && isInputCorrect(input, aufgabe.userAnswers[input.id])
        );
        earnedPoints = allCorrect ? aufgabe.points : 0;
      }

      console.log(`Aufgabe ${aufgabe.type}: earned=${earnedPoints}/${aufgabe.points}`);

      return {
        ...aufgabe,
        earnedPoints: Math.round(earnedPoints * 10) / 10, // Runde auf 0,1 Punkte
      };
    });

    const neuerZustand = {
      ...zustand,
      aufgaben: aufgabenMitErgebnissen,
      beendet: true,
    };
    saveZustand(neuerZustand);
  };

  const handleRestart = () => {
    localStorage.removeItem(STORAGE_KEY);
    setZustand(null);
  };

  if (!zustand) {
    return <StartScreen onStart={handleStart} />;
  }

  if (!zustand.gestartet) {
    return <StartScreen onStart={handleStart} />;
  }

  return (
    <>
      {!zustand.beendet ? (
        <ExamScreen 
          zustand={zustand}
          onUpdateAnswer={handleUpdateAnswer}
          onNavigate={handleNavigate}
          onFinish={handleFinish}
        />
      ) : (
        <ResultsScreen 
          zustand={zustand}
          onRestart={handleRestart}
        />
      )}
    </>
  );
};

export default PruefungsModus;

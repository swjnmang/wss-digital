import React, { useState } from 'react';
import { ArrowLeft, PieChart, BarChart as BarChartIcon, BarChart2, RefreshCw, CheckCircle, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PieChart as RePieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

type DiagramType = 'pie' | 'bar' | 'column';

interface DataPoint {
  name: string;
  value: number;
  color?: string;
  [key: string]: any;
}

interface Scenario {
  title: string;
  description: string;
  type: DiagramType;
  data: DataPoint[];
  unit: string;
  question: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const DiagrammeErstellen: React.FC = () => {
  const [selectedType, setSelectedType] = useState<DiagramType | 'random' | null>(null);
  const [currentScenario, setCurrentScenario] = useState<Scenario | null>(null);
  const [showSolution, setShowSolution] = useState(false);

  const generateScenario = (type: DiagramType | 'random'): Scenario => {
    const targetType = type === 'random' ? (['pie', 'bar', 'column'][Math.floor(Math.random() * 3)] as DiagramType) : type;
    
    const pieScenarios = [
      () => {
        const v1 = Math.floor(Math.random() * 50) + 20;
        const v2 = Math.floor(Math.random() * 50) + 20;
        const v3 = Math.floor(Math.random() * 40) + 10;
        const v4 = Math.floor(Math.random() * 30) + 5;
        return {
          title: "Wahlergebnisse der Schülersprecherwahl",
          description: "Bei der Wahl zum Schülersprecher wurden die Stimmen ausgezählt. Erstelle ein Kreisdiagramm, um die Verteilung der Stimmen darzustellen.",
          type: 'pie' as DiagramType,
          unit: "Stimmen",
          question: "Berechne zuerst die Anteile (Prozent) und anschließend die Winkel für das Kreisdiagramm.",
          data: [
            { name: "Anna", value: v1 },
            { name: "Ben", value: v2 },
            { name: "Clara", value: v3 },
            { name: "David", value: v4 },
          ]
        };
      },
      () => {
        const v1 = Math.floor(Math.random() * 15) + 5;
        const v2 = Math.floor(Math.random() * 15) + 5;
        const v3 = Math.floor(Math.random() * 15) + 5;
        const v4 = Math.floor(Math.random() * 10) + 2;
        return {
          title: "Verkehrsmittel zur Schule",
          description: "In einer Klasse wurde gefragt, wie die Schüler zur Schule kommen. Stelle die Ergebnisse in einem Kreisdiagramm dar.",
          type: 'pie' as DiagramType,
          unit: "Schüler",
          question: "Berechne zuerst die Anteile (Prozent) und anschließend die Winkel für das Kreisdiagramm.",
          data: [
            { name: "Bus", value: v1 },
            { name: "Fahrrad", value: v2 },
            { name: "Zu Fuß", value: v3 },
            { name: "Auto", value: v4 },
          ]
        };
      },
      () => {
        const v1 = Math.floor(Math.random() * 10) + 2;
        const v2 = Math.floor(Math.random() * 10) + 2;
        const v3 = Math.floor(Math.random() * 10) + 2;
        const v4 = Math.floor(Math.random() * 10) + 2;
        const v5 = Math.floor(Math.random() * 5) + 1;
        return {
          title: "Lieblings-Eissorten",
          description: "Eine Eisdiele hat notiert, welche Eissorten am häufigsten bestellt wurden. Zeichne ein Kreisdiagramm.",
          type: 'pie' as DiagramType,
          unit: "Kugeln",
          question: "Berechne zuerst die Anteile (Prozent) und anschließend die Winkel für das Kreisdiagramm.",
          data: [
            { name: "Vanille", value: v1 },
            { name: "Schoko", value: v2 },
            { name: "Erdbeer", value: v3 },
            { name: "Zitrone", value: v4 },
            { name: "Nuss", value: v5 },
          ]
        };
      },
      () => {
        const v1 = Math.floor(Math.random() * 15) + 5;
        const v2 = Math.floor(Math.random() * 15) + 5;
        const v3 = Math.floor(Math.random() * 15) + 5;
        const v4 = Math.floor(Math.random() * 10) + 2;
        const v5 = Math.floor(Math.random() * 8) + 2;
        return {
          title: "Lieblingsfach",
          description: "In einer Umfrage wurde nach dem Lieblingsfach gefragt. Stelle die Ergebnisse in einem Kreisdiagramm dar.",
          type: 'pie' as DiagramType,
          unit: "Stimmen",
          question: "Berechne zuerst die Anteile (Prozent) und anschließend die Winkel für das Kreisdiagramm.",
          data: [
            { name: "Mathe", value: v1 },
            { name: "Deutsch", value: v2 },
            { name: "Englisch", value: v3 },
            { name: "Sport", value: v4 },
            { name: "Kunst", value: v5 },
          ]
        };
      },
      () => {
        const v1 = Math.floor(Math.random() * 20) + 5;
        const v2 = Math.floor(Math.random() * 20) + 5;
        const v3 = Math.floor(Math.random() * 20) + 5;
        const v4 = Math.floor(Math.random() * 10) + 2;
        return {
          title: "Urlaubsziele",
          description: "Die Schüler wurden gefragt, wo sie ihren letzten Urlaub verbracht haben.",
          type: 'pie' as DiagramType,
          unit: "Nennungen",
          question: "Berechne zuerst die Anteile (Prozent) und anschließend die Winkel für das Kreisdiagramm.",
          data: [
            { name: "Italien", value: v1 },
            { name: "Spanien", value: v2 },
            { name: "Deutschland", value: v3 },
            { name: "Andere", value: v4 },
          ]
        };
      },
      () => {
        const v1 = Math.floor(Math.random() * 30) + 10;
        const v2 = Math.floor(Math.random() * 30) + 10;
        const v3 = Math.floor(Math.random() * 20) + 5;
        const v4 = Math.floor(Math.random() * 10) + 2;
        return {
          title: "Handymarken",
          description: "Welche Handymarken nutzen die Schüler? Erstelle ein Kreisdiagramm.",
          type: 'pie' as DiagramType,
          unit: "Anzahl",
          question: "Berechne zuerst die Anteile (Prozent) und anschließend die Winkel für das Kreisdiagramm.",
          data: [
            { name: "Samsung", value: v1 },
            { name: "Apple", value: v2 },
            { name: "Xiaomi", value: v3 },
            { name: "Andere", value: v4 },
          ]
        };
      },
      () => {
        const v1 = Math.floor(Math.random() * 15) + 5;
        const v2 = Math.floor(Math.random() * 15) + 5;
        const v3 = Math.floor(Math.random() * 15) + 5;
        const v4 = Math.floor(Math.random() * 10) + 2;
        return {
          title: "Musikgeschmack",
          description: "Welche Musikrichtung hören die Jugendlichen am liebsten?",
          type: 'pie' as DiagramType,
          unit: "Stimmen",
          question: "Berechne zuerst die Anteile (Prozent) und anschließend die Winkel für das Kreisdiagramm.",
          data: [
            { name: "Pop", value: v1 },
            { name: "Rock", value: v2 },
            { name: "HipHop", value: v3 },
            { name: "Klassik", value: v4 },
          ]
        };
      },
      () => {
        const v1 = Math.floor(Math.random() * 20) + 5;
        const v2 = Math.floor(Math.random() * 20) + 5;
        const v3 = Math.floor(Math.random() * 15) + 5;
        const v4 = Math.floor(Math.random() * 15) + 5;
        return {
          title: "Freizeitaktivitäten",
          description: "Was machen die Schüler am liebsten in ihrer Freizeit?",
          type: 'pie' as DiagramType,
          unit: "Nennungen",
          question: "Berechne zuerst die Anteile (Prozent) und anschließend die Winkel für das Kreisdiagramm.",
          data: [
            { name: "Sport", value: v1 },
            { name: "Zocken", value: v2 },
            { name: "Lesen", value: v3 },
            { name: "Freunde", value: v4 },
          ]
        };
      }
    ];

    const barScenarios = [
      () => {
        return {
          title: "Lieblingsfarben in der Klasse 7a",
          description: "In einer Umfrage wurde nach der Lieblingsfarbe gefragt. Erstelle ein Balkendiagramm (waagerecht).",
          type: 'bar' as DiagramType,
          unit: "Stimmen",
          question: "Zeichne die Balken entsprechend der Anzahl der Nennungen.",
          data: [
            { name: "Blau", value: Math.floor(Math.random() * 10) + 5 },
            { name: "Rot", value: Math.floor(Math.random() * 10) + 2 },
            { name: "Grün", value: Math.floor(Math.random() * 10) + 3 },
            { name: "Gelb", value: Math.floor(Math.random() * 5) + 1 },
            { name: "Schwarz", value: Math.floor(Math.random() * 5) + 1 },
          ]
        };
      },
      () => {
        return {
          title: "Augenfarben der Schüler",
          description: "Die Augenfarben der Schüler einer Klasse wurden gezählt. Stelle die Daten in einem Balkendiagramm dar.",
          type: 'bar' as DiagramType,
          unit: "Anzahl",
          question: "Zeichne die Balken waagerecht.",
          data: [
            { name: "Blau", value: Math.floor(Math.random() * 12) + 4 },
            { name: "Braun", value: Math.floor(Math.random() * 15) + 5 },
            { name: "Grün", value: Math.floor(Math.random() * 8) + 2 },
            { name: "Grau", value: Math.floor(Math.random() * 5) + 1 },
          ]
        };
      },
      () => {
        return {
          title: "Haustiere der Schüler",
          description: "Es wurde gefragt, welche Haustiere die Schüler zu Hause haben. Erstelle ein Balkendiagramm.",
          type: 'bar' as DiagramType,
          unit: "Anzahl",
          question: "Zeichne für jedes Tier einen passenden Balken.",
          data: [
            { name: "Hund", value: Math.floor(Math.random() * 10) + 3 },
            { name: "Katze", value: Math.floor(Math.random() * 12) + 3 },
            { name: "Nager", value: Math.floor(Math.random() * 8) + 1 },
            { name: "Fische", value: Math.floor(Math.random() * 5) + 1 },
            { name: "Keine", value: Math.floor(Math.random() * 8) + 2 },
          ]
        };
      },
      () => {
        return {
          title: "Geschwisteranzahl",
          description: "Wie viele Geschwister haben die Schüler der Klasse 6b?",
          type: 'bar' as DiagramType,
          unit: "Anzahl Schüler",
          question: "Erstelle ein Balkendiagramm zur Anzahl der Geschwister.",
          data: [
            { name: "0", value: Math.floor(Math.random() * 8) + 2 },
            { name: "1", value: Math.floor(Math.random() * 12) + 5 },
            { name: "2", value: Math.floor(Math.random() * 8) + 3 },
            { name: "3", value: Math.floor(Math.random() * 4) + 1 },
            { name: "4+", value: Math.floor(Math.random() * 3) },
          ]
        };
      },
      () => {
        return {
          title: "Lieblingssportart",
          description: "Welche Sportart betreiben die Jugendlichen im Verein?",
          type: 'bar' as DiagramType,
          unit: "Anzahl",
          question: "Zeichne die Balken waagerecht.",
          data: [
            { name: "Fußball", value: Math.floor(Math.random() * 15) + 5 },
            { name: "Handball", value: Math.floor(Math.random() * 10) + 2 },
            { name: "Tennis", value: Math.floor(Math.random() * 8) + 2 },
            { name: "Schwimmen", value: Math.floor(Math.random() * 8) + 2 },
            { name: "Tanzen", value: Math.floor(Math.random() * 10) + 3 },
          ]
        };
      },
      () => {
        return {
          title: "Geburtstage pro Quartal",
          description: "Wann haben die Schüler Geburtstag? Die Daten sind nach Quartalen zusammengefasst.",
          type: 'bar' as DiagramType,
          unit: "Anzahl",
          question: "Erstelle ein Balkendiagramm.",
          data: [
            { name: "Q1 (Jan-Mär)", value: Math.floor(Math.random() * 10) + 2 },
            { name: "Q2 (Apr-Jun)", value: Math.floor(Math.random() * 10) + 2 },
            { name: "Q3 (Jul-Sep)", value: Math.floor(Math.random() * 10) + 2 },
            { name: "Q4 (Okt-Dez)", value: Math.floor(Math.random() * 10) + 2 },
          ]
        };
      },
      () => {
        return {
          title: "Schuhgrößen",
          description: "Die Schuhgrößen der Jungen in der 9. Klasse wurden notiert.",
          type: 'bar' as DiagramType,
          unit: "Anzahl",
          question: "Zeichne ein Balkendiagramm für die Schuhgrößen.",
          data: [
            { name: "38", value: Math.floor(Math.random() * 5) + 1 },
            { name: "39", value: Math.floor(Math.random() * 8) + 2 },
            { name: "40", value: Math.floor(Math.random() * 10) + 3 },
            { name: "41", value: Math.floor(Math.random() * 8) + 2 },
            { name: "42", value: Math.floor(Math.random() * 6) + 1 },
          ]
        };
      },
      () => {
        return {
          title: "Lieblingsessen in der Mensa",
          description: "Was essen die Schüler am liebsten in der Mittagspause?",
          type: 'bar' as DiagramType,
          unit: "Stimmen",
          question: "Erstelle ein Balkendiagramm.",
          data: [
            { name: "Pizza", value: Math.floor(Math.random() * 20) + 10 },
            { name: "Nudeln", value: Math.floor(Math.random() * 20) + 10 },
            { name: "Döner", value: Math.floor(Math.random() * 15) + 5 },
            { name: "Burger", value: Math.floor(Math.random() * 15) + 5 },
            { name: "Salat", value: Math.floor(Math.random() * 10) + 2 },
          ]
        };
      }
    ];

    const columnScenarios = [
      () => {
        return {
          title: "Besucher im Freibad",
          description: "Die Besucherzahlen im Freibad wurden über eine Woche festgehalten. Erstelle ein Säulendiagramm (senkrecht).",
          type: 'column' as DiagramType,
          unit: "Besucher",
          question: "Trage die Besucherzahlen für jeden Tag in ein Säulendiagramm ein.",
          data: [
            { name: "Mo", value: Math.floor(Math.random() * 100) + 50 },
            { name: "Di", value: Math.floor(Math.random() * 100) + 60 },
            { name: "Mi", value: Math.floor(Math.random() * 150) + 80 },
            { name: "Do", value: Math.floor(Math.random() * 150) + 70 },
            { name: "Fr", value: Math.floor(Math.random() * 200) + 100 },
            { name: "Sa", value: Math.floor(Math.random() * 300) + 150 },
            { name: "So", value: Math.floor(Math.random() * 300) + 200 },
          ]
        };
      },
      () => {
        return {
          title: "Niederschlagsmenge im ersten Halbjahr",
          description: "Die Niederschlagsmenge (in mm) wurde von Januar bis Juni gemessen. Zeichne ein Säulendiagramm.",
          type: 'column' as DiagramType,
          unit: "mm",
          question: "Zeichne für jeden Monat eine Säule mit der entsprechenden Höhe.",
          data: [
            { name: "Jan", value: Math.floor(Math.random() * 80) + 20 },
            { name: "Feb", value: Math.floor(Math.random() * 70) + 20 },
            { name: "Mär", value: Math.floor(Math.random() * 60) + 30 },
            { name: "Apr", value: Math.floor(Math.random() * 50) + 30 },
            { name: "Mai", value: Math.floor(Math.random() * 60) + 40 },
            { name: "Jun", value: Math.floor(Math.random() * 80) + 50 },
          ]
        };
      },
      () => {
        return {
          title: "Verkaufte Brötchen in der Pause",
          description: "Der Hausmeister hat notiert, wie viele Brötchen er in der großen Pause verkauft hat.",
          type: 'column' as DiagramType,
          unit: "Stück",
          question: "Stelle die Verkaufszahlen der Woche in einem Säulendiagramm dar.",
          data: [
            { name: "Mo", value: Math.floor(Math.random() * 50) + 30 },
            { name: "Di", value: Math.floor(Math.random() * 50) + 30 },
            { name: "Mi", value: Math.floor(Math.random() * 60) + 40 },
            { name: "Do", value: Math.floor(Math.random() * 50) + 30 },
            { name: "Fr", value: Math.floor(Math.random() * 40) + 20 },
          ]
        };
      },
      () => {
        return {
          title: "Temperaturverlauf",
          description: "Die Höchsttemperaturen einer Woche im Sommer wurden gemessen.",
          type: 'column' as DiagramType,
          unit: "°C",
          question: "Zeichne ein Säulendiagramm für den Temperaturverlauf.",
          data: [
            { name: "Mo", value: Math.floor(Math.random() * 10) + 20 },
            { name: "Di", value: Math.floor(Math.random() * 10) + 22 },
            { name: "Mi", value: Math.floor(Math.random() * 10) + 25 },
            { name: "Do", value: Math.floor(Math.random() * 10) + 23 },
            { name: "Fr", value: Math.floor(Math.random() * 10) + 20 },
            { name: "Sa", value: Math.floor(Math.random() * 10) + 24 },
            { name: "So", value: Math.floor(Math.random() * 10) + 26 },
          ]
        };
      },
      () => {
        return {
          title: "Durchschnittliches Taschengeld",
          description: "Wie viel Taschengeld bekommen Schüler durchschnittlich pro Monat?",
          type: 'column' as DiagramType,
          unit: "Euro",
          question: "Stelle das Taschengeld nach Klassenstufe dar.",
          data: [
            { name: "Kl. 5", value: 20 + Math.floor(Math.random() * 5) },
            { name: "Kl. 6", value: 25 + Math.floor(Math.random() * 5) },
            { name: "Kl. 7", value: 30 + Math.floor(Math.random() * 10) },
            { name: "Kl. 8", value: 40 + Math.floor(Math.random() * 10) },
            { name: "Kl. 9", value: 50 + Math.floor(Math.random() * 10) },
            { name: "Kl. 10", value: 60 + Math.floor(Math.random() * 20) },
          ]
        };
      },
      () => {
        return {
          title: "Social Media Nutzung",
          description: "Ein Schüler hat seine tägliche Nutzungsdauer von Social Media Apps protokolliert.",
          type: 'column' as DiagramType,
          unit: "Minuten",
          question: "Zeichne ein Säulendiagramm für die Nutzungsdauer.",
          data: [
            { name: "Mo", value: Math.floor(Math.random() * 60) + 30 },
            { name: "Di", value: Math.floor(Math.random() * 60) + 30 },
            { name: "Mi", value: Math.floor(Math.random() * 60) + 30 },
            { name: "Do", value: Math.floor(Math.random() * 60) + 30 },
            { name: "Fr", value: Math.floor(Math.random() * 90) + 60 },
            { name: "Sa", value: Math.floor(Math.random() * 120) + 60 },
            { name: "So", value: Math.floor(Math.random() * 120) + 60 },
          ]
        };
      }
    ];

    if (targetType === 'pie') return pieScenarios[Math.floor(Math.random() * pieScenarios.length)]();
    if (targetType === 'bar') return barScenarios[Math.floor(Math.random() * barScenarios.length)]();
    return columnScenarios[Math.floor(Math.random() * columnScenarios.length)]();
  };

  const handleStart = (type: DiagramType | 'random') => {
    setSelectedType(type);
    setCurrentScenario(generateScenario(type));
    setShowSolution(false);
  };

  const handleNewTask = () => {
    if (selectedType) {
      setCurrentScenario(generateScenario(selectedType));
      setShowSolution(false);
    }
  };

  if (!currentScenario) {
    return (
      <div className="container mx-auto p-4 space-y-6">
        <Link to="/daten-und-zufall" className="flex items-center text-blue-600 hover:text-blue-800 mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Zurück zur Übersicht
        </Link>
        
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-8">Diagramme erstellen</h2>
          <p className="text-gray-600 mb-8 text-lg">Wähle einen Diagrammtyp, den du üben möchtest:</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <button onClick={() => handleStart('pie')} className="p-6 border-2 border-blue-100 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all flex flex-col items-center gap-4 group">
              <div className="p-4 bg-blue-100 rounded-full group-hover:bg-blue-200 text-blue-600">
                <PieChart className="w-8 h-8" />
              </div>
              <span className="font-semibold text-gray-700">Kreisdiagramm</span>
            </button>

            <button onClick={() => handleStart('bar')} className="p-6 border-2 border-green-100 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all flex flex-col items-center gap-4 group">
              <div className="p-4 bg-green-100 rounded-full group-hover:bg-green-200 text-green-600">
                <BarChartIcon className="w-8 h-8" />
              </div>
              <span className="font-semibold text-gray-700">Balkendiagramm</span>
            </button>

            <button onClick={() => handleStart('column')} className="p-6 border-2 border-purple-100 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all flex flex-col items-center gap-4 group">
              <div className="p-4 bg-purple-100 rounded-full group-hover:bg-purple-200 text-purple-600">
                <BarChart2 className="w-8 h-8" />
              </div>
              <span className="font-semibold text-gray-700">Säulendiagramm</span>
            </button>

            <button onClick={() => handleStart('random')} className="p-6 border-2 border-orange-100 rounded-xl hover:border-orange-500 hover:bg-orange-50 transition-all flex flex-col items-center gap-4 group">
              <div className="p-4 bg-orange-100 rounded-full group-hover:bg-orange-200 text-orange-600">
                <HelpCircle className="w-8 h-8" />
              </div>
              <span className="font-semibold text-gray-700">Zufälliges Diagramm</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <button onClick={() => setCurrentScenario(null)} className="flex items-center text-blue-600 hover:text-blue-800">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Zurück zur Auswahl
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <h2 className="text-2xl font-bold text-gray-800">{currentScenario.title}</h2>
          <p className="text-gray-600 mt-2">{currentScenario.description}</p>
        </div>

        <div className="p-6 grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="font-semibold text-lg mb-4">Datenwerte:</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-blue-200">
                      <th className="py-2 px-4 font-semibold text-blue-800">Kategorie</th>
                      <th className="py-2 px-4 font-semibold text-blue-800">Wert ({currentScenario.unit})</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentScenario.data.map((item, index) => (
                      <tr key={index} className="border-b border-blue-100 last:border-0">
                        <td className="py-2 px-4">{item.name}</td>
                        <td className="py-2 px-4 font-mono">{item.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h4 className="font-semibold text-yellow-800 mb-2">Aufgabe:</h4>
              <p className="text-yellow-900">{currentScenario.question}</p>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => setShowSolution(!showSolution)}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                {showSolution ? "Lösung verbergen" : "Musterlösung anzeigen"}
              </button>
              <button 
                onClick={handleNewTask}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Neue Aufgabe
              </button>
            </div>
          </div>

          <div className="min-h-[400px] flex flex-col items-center justify-center bg-gray-50 rounded-lg border border-gray-200 p-4">
            {showSolution ? (
              <div className="w-full h-full flex flex-col">
                <h3 className="text-center font-bold text-gray-700 mb-4">Musterlösung</h3>
                <div className="flex-1 min-h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    {currentScenario.type === 'pie' ? (
                      <RePieChart>
                        <Pie
                          data={currentScenario.data}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          label={({ name, percent }: any) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {currentScenario.data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </RePieChart>
                    ) : currentScenario.type === 'bar' ? (
                      <BarChart layout="vertical" data={currentScenario.data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={100} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" fill="#82ca9d" name={currentScenario.unit} />
                      </BarChart>
                    ) : (
                      <BarChart data={currentScenario.data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" fill="#8884d8" name={currentScenario.unit} />
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                </div>
                
                {currentScenario.type === 'pie' && (
                  <div className="mt-6 bg-white p-4 rounded border border-gray-200 text-sm">
                    <h4 className="font-bold mb-2">Rechenweg (Winkelberechnung):</h4>
                    <p className="mb-2">Gesamtsumme = {currentScenario.data.reduce((a, b) => a + b.value, 0)} {currentScenario.unit}</p>
                    <ul className="space-y-3 font-mono text-gray-600">
                      {currentScenario.data.map((item, idx) => {
                        const total = currentScenario.data.reduce((a, b) => a + b.value, 0);
                        const percent = (item.value / total * 100).toFixed(1);
                        const angle = (item.value / total * 360).toFixed(1);
                        return (
                          <li key={idx} className="border-b border-gray-100 pb-2 last:border-0">
                            <div className="font-bold text-gray-700">{item.name}: {item.value} {currentScenario.unit}</div>
                            <div className="pl-4">
                              1. Anteil: {item.value} / {total} ≈ {percent}%
                            </div>
                            <div className="pl-4 text-blue-600">
                              2. Winkel: {percent} • 3,6° ≈ {angle}°
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-400">
                <BarChart2 className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p>Erstelle das Diagramm auf Papier.</p>
                <p className="text-sm mt-2">Klicke auf "Musterlösung anzeigen", um dein Ergebnis zu überprüfen.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiagrammeErstellen;

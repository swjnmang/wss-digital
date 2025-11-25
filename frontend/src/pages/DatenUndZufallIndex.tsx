import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, BarChart3, Dice3, Network, PieChart } from 'lucide-react';

const DatenUndZufallIndex: React.FC = () => {
  const topics = [
    {
      title: "Statistische Kennwerte",
      path: "/daten-und-zufall/statistische-kennwerte",
      description: "Berechne Mittelwert, Median, Modalwert, Spannweite, Minimum und Maximum.",
      icon: <BarChart3 className="w-10 h-10 text-blue-500" />
    },
    {
      title: "Diagramme erstellen",
      path: "/daten-und-zufall/diagramme-erstellen",
      description: "Erstelle Kreis-, Balken- und Säulendiagramme zu verschiedenen Themen.",
      icon: <PieChart className="w-10 h-10 text-purple-500" />
    },
    {
      title: "Interaktives Baumdiagramm",
      path: "/daten-und-zufall/baumdiagramme2",
      description: "Erstelle Baumdiagramme interaktiv und berechne Wahrscheinlichkeiten.",
      icon: <Network className="w-10 h-10 text-green-500" />
    },
    {
      title: "Wahrscheinlichkeiten berechnen",
      path: "/daten-und-zufall/wahrscheinlichkeiten",
      description: "20 Aufgaben zu ein- und mehrstufigen Zufallsexperimenten mit Musterlösungen.",
      icon: <Dice3 className="w-10 h-10 text-orange-500" />
    }
  ];

  return (
    <div className="container mx-auto p-4">
      <Link to="/" className="flex items-center text-blue-600 hover:text-blue-800 mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Zurück zur Übersicht
      </Link>
      
      <h1 className="text-3xl font-bold mb-8 text-center">Daten und Zufall</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {topics.map((topic) => (
          <Link key={topic.path} to={topic.path} className="block h-full">
            <div className="h-full bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer overflow-hidden">
              <div className="p-6 flex flex-row items-center gap-4 border-b border-gray-100">
                <div className="p-2 bg-slate-100 rounded-lg">
                  {topic.icon}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">{topic.title}</h3>
                </div>
              </div>
              <div className="p-6">
                <p className="text-base text-gray-600">
                  {topic.description}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default DatenUndZufallIndex;

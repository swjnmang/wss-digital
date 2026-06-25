import { Link } from 'react-router-dom';
import { BarChart3, Dice3, Network, PieChart, Percent } from 'lucide-react';

const topics = [
  {
    title: "Statistische Kennwerte",
    path: "/daten-und-zufall/statistische-kennwerte",
    description: "Berechne Mittelwert, Median, Modalwert, Spannweite, Minimum und Maximum.",
    icon: BarChart3,
  },
  {
    title: "Diagramme erstellen",
    path: "/daten-und-zufall/diagramme-erstellen",
    description: "Erstelle Kreis-, Balken- und Säulendiagramme zu verschiedenen Themen.",
    icon: PieChart,
  },
  {
    title: "Interaktives Baumdiagramm",
    path: "/daten-und-zufall/baumdiagramme2",
    description: "Erstelle Baumdiagramme interaktiv und berechne Wahrscheinlichkeiten.",
    icon: Network,
  },
  {
    title: "Relative- und absolute Häufigkeit",
    path: "/daten-und-zufall/relative-absolute-haeufigkeit",
    description: "Lerne den Unterschied zwischen absoluter und relativer Häufigkeit mit praktischen Übungsaufgaben.",
    icon: Percent,
  },
  {
    title: "Wahrscheinlichkeiten berechnen",
    path: "/daten-und-zufall/wahrscheinlichkeiten",
    description: "20 Aufgaben zu ein- und mehrstufigen Zufallsexperimenten mit Musterlösungen.",
    icon: Dice3,
  },
];

export default function DatenUndZufallIndex() {
  return (
    <div className="min-h-screen bg-[var(--bg-color)] flex flex-col text-slate-900">
      <header className="w-full text-white py-10 sm:py-14 text-center shadow-md relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-700" />
        <div className="relative max-w-4xl mx-auto px-4 space-y-3">
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">Daten und Zufall</h1>
          <p className="text-base sm:text-lg text-slate-200 max-w-2xl mx-auto">
            Wähle ein Thema aus, um zu den Übungen zu gelangen.
          </p>
        </div>
      </header>

      <main className="flex-1 w-full px-4 sm:px-6 lg:px-10 py-6 sm:py-8 flex flex-col items-center">
        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-5">
          {topics.map((topic) => {
            const Icon = topic.icon;
            return (
              <Link
                key={topic.path}
                to={topic.path}
                className="bg-white rounded-2xl p-4 sm:p-5 text-center text-slate-900 shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex flex-col items-center h-full border border-slate-100"
              >
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-blue-50 flex items-center justify-center text-[var(--accent)] mb-3">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold mb-1.5 text-slate-800">{topic.title}</h3>
                <p className="text-slate-500 leading-snug text-sm">{topic.description}</p>
                <div className="mt-auto" aria-hidden="true" />
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}

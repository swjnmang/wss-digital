import { Link } from 'react-router-dom';

interface Tool {
  id: string;
  title: string;
  emoji: string;
  description: string;
  enabled: boolean;
  href: string;
}

// Weitere Buttons hier einfach ergänzen.
const tools: Tool[] = [
  {
    id: 'rover-island',
    title: 'Rover Island',
    emoji: '🤖',
    description: 'Roverhead-Simulator: Programmiere den Rover auf Rover Island. (Robotik Klasse 10)',
    enabled: true,
    href: 'https://rover.herrzim.de/',
  },
];

export default function RobotikIndex() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-gradient-to-br from-slate-800 to-slate-700 text-white py-12 px-4 text-center shadow-md relative">
        <Link to="/" className="absolute top-4 left-4 text-slate-300 hover:text-white flex items-center gap-2 text-sm font-medium transition-colors">
          ← Zurück zu Module
        </Link>
        <h1 className="text-4xl font-bold mb-2 tracking-tight">Robotik</h1>
        <p className="text-lg text-slate-300 max-w-xl mx-auto">Robotik Klasse 10</p>
      </header>

      <main className="flex-1 w-full max-w-5xl mx-auto p-8 flex items-center justify-center">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {tools.map((tool) =>
            tool.enabled ? (
              <a
                key={tool.id}
                href={tool.href}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white rounded-xl p-6 text-center text-slate-900 shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex flex-col items-center h-full border border-slate-100"
              >
                <div className="text-4xl mb-4 text-blue-500">{tool.emoji}</div>
                <h2 className="text-lg font-semibold mb-2 text-slate-800">{tool.title}</h2>
                <p className="text-sm text-slate-500 leading-relaxed">{tool.description}</p>
              </a>
            ) : (
              <div
                key={tool.id}
                className="bg-slate-100 rounded-xl p-6 text-center text-slate-500 shadow-sm flex flex-col items-center h-full border border-slate-200 opacity-50 cursor-not-allowed"
              >
                <div className="text-4xl mb-4 text-slate-400">{tool.emoji}</div>
                <h2 className="text-lg font-semibold mb-2 text-slate-600">{tool.title}</h2>
                <p className="text-sm text-slate-500 leading-relaxed">{tool.description}</p>
                <span className="text-xs font-semibold text-slate-500 mt-3 uppercase tracking-wide">Demnächst</span>
              </div>
            ),
          )}
        </div>
      </main>
    </div>
  );
}

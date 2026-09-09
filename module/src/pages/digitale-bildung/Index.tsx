import { Link } from 'react-router-dom';

interface Tool {
  id: string;
  title: string;
  emoji: string;
  description: string;
  enabled: boolean;
  path: string;
}

const tools: Tool[] = [
  {
    id: 'excel',
    title: 'Excel',
    emoji: '📊',
    description: 'Formeln, Zellbezüge und Formatierung in einer echten Tabellenkalkulation üben – mit direktem Feedback.',
    enabled: true,
    path: '/digitale-bildung/excel-trainer',
  },
  {
    id: 'geschaeftsbrief',
    title: 'Geschäftsbrief',
    emoji: '✉️',
    description: 'Geschäftsbriefe nach DIN-Norm formatieren und aufbauen.',
    enabled: false,
    path: '/digitale-bildung/geschaeftsbrief',
  },
  {
    id: 'powerpoint',
    title: 'PowerPoint',
    emoji: '📽️',
    description: 'Präsentationen strukturieren und gestalten.',
    enabled: false,
    path: '/digitale-bildung/powerpoint',
  },
];

export default function DigitaleBildungIndex() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-gradient-to-br from-slate-800 to-slate-700 text-white py-12 px-4 text-center shadow-md relative">
        <Link to="/" className="absolute top-4 left-4 text-slate-300 hover:text-white flex items-center gap-2 text-sm font-medium transition-colors">
          ← Zurück zu Module
        </Link>
        <h1 className="text-4xl font-bold mb-2 tracking-tight">Digitale Bildung</h1>
        <p className="text-lg text-slate-300 max-w-xl mx-auto">
          Übe den Umgang mit digitalen Werkzeugen für den Büroalltag.
        </p>
      </header>

      <main className="flex-1 w-full max-w-5xl mx-auto p-8 flex items-center justify-center">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full">
          {tools.map((tool) =>
            tool.enabled ? (
              <Link
                key={tool.id}
                to={tool.path}
                className="bg-white rounded-xl p-6 text-center text-slate-900 shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex flex-col items-center h-full border border-slate-100"
              >
                <div className="text-4xl mb-4 text-blue-500">{tool.emoji}</div>
                <h2 className="text-lg font-semibold mb-2 text-slate-800">{tool.title}</h2>
                <p className="text-sm text-slate-500 leading-relaxed">{tool.description}</p>
              </Link>
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

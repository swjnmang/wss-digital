import { Link } from 'react-router-dom';

interface WordTopic {
  id: string;
  title: string;
  emoji: string;
  description: string;
  enabled: boolean;
  path: string;
}

const topics: WordTopic[] = [
  {
    id: 'geschaeftsbrief',
    title: 'Geschäftsbrief nach DIN 5008',
    emoji: '✉️',
    description: 'Aufbau, Anschriftenfeld, Aufzählungen und Tabellen im Geschäftsbrief – Schritt für Schritt.',
    enabled: true,
    path: '/digitale-bildung/word/geschaeftsbrief',
  },
];

export default function WordIndex() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-gradient-to-br from-slate-800 to-slate-700 text-white py-8 px-4 text-center relative">
        <Link
          to="/digitale-bildung"
          className="absolute top-4 left-4 text-slate-300 hover:text-white flex items-center gap-2 text-sm font-medium transition-colors"
        >
          ← Digitale Bildung
        </Link>
        <h1 className="text-2xl font-bold">✉️ Word</h1>
        <p className="text-slate-300 text-sm mt-1">Wähle ein Thema aus.</p>
      </header>

      <main className="flex-1 w-full max-w-3xl mx-auto p-6 flex flex-col gap-4">
        {topics.map((topic) =>
          topic.enabled ? (
            <Link
              key={topic.id}
              to={topic.path}
              className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 hover:-translate-y-0.5 hover:shadow-md transition-all flex items-center gap-4"
            >
              <div className="text-3xl">{topic.emoji}</div>
              <div>
                <h2 className="text-lg font-bold text-slate-800 mb-1">{topic.title}</h2>
                <p className="text-sm text-slate-500">{topic.description}</p>
              </div>
            </Link>
          ) : (
            <div
              key={topic.id}
              className="bg-slate-100 rounded-xl border border-slate-200 p-6 flex items-center gap-4 opacity-50 cursor-not-allowed"
            >
              <div className="text-3xl">{topic.emoji}</div>
              <div>
                <h2 className="text-lg font-bold text-slate-600 mb-1">{topic.title}</h2>
                <p className="text-sm text-slate-500">{topic.description}</p>
                <span className="text-xs font-semibold text-slate-500 mt-1 inline-block uppercase tracking-wide">
                  Demnächst
                </span>
              </div>
            </div>
          ),
        )}
      </main>
    </div>
  );
}

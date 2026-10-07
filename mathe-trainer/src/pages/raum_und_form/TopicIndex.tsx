import { Link, useParams } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import Home from '../Home';
import { findTopic } from './registry';
import { TOPIC_ICONS } from './icons';

export default function TopicIndex() {
  const { topic: slug } = useParams();
  const topic = findTopic(slug);
  if (!topic) return <Home />;
  const Icon = TOPIC_ICONS[topic.icon];
  return (
    <div className="min-h-screen bg-[var(--bg-color)] text-left text-slate-900">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-x-3 gap-y-1 px-3 py-3 sm:px-4">
          <Link to="/raum-und-form" className="text-xs font-semibold uppercase tracking-wide text-[var(--accent)] hover:underline">
            Raum &amp; Form
          </Link>
          <h1 className="text-left flex items-center gap-2 text-xl font-bold tracking-tight sm:text-2xl">
            {Icon && <Icon className="h-6 w-6 text-[var(--accent)]" />}
            {topic.title}
          </h1>
          <p className="text-left text-sm text-slate-500">{topic.description}</p>
        </div>
      </div>
      <main className="mx-auto max-w-[1600px] px-3 py-4 sm:px-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {topic.pages.map((p, i) => (
            <Link
              key={p.slug}
              to={`/raum-und-form/${topic.slug}/${p.slug}`}
              className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-blue-300 hover:shadow-md"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-[var(--accent)]">
                {i + 1}
              </span>
              <span className="flex-1">
                <span className="block font-semibold text-slate-800">{p.title}</span>
                <span className="block text-sm text-slate-500">{p.description}</span>
              </span>
              <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-[var(--accent)]" />
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}

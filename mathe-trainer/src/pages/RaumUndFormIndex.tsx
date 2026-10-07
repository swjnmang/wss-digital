import { Link } from 'react-router-dom';
import { TOPICS } from './raum_und_form/registry';
import { TOPIC_ICONS } from './raum_und_form/icons';

export default function RaumUndFormIndex() {
  return (
    <div className="min-h-screen bg-[var(--bg-color)] text-left text-slate-900">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-[1600px] px-3 py-4 sm:px-4">
          <h1 className="text-left text-2xl font-bold tracking-tight sm:text-3xl">Raum &amp; Form</h1>
          <p className="text-left text-slate-500">Wähle ein Thema. Jede Übungsseite beginnt mit einem Beispiel – danach rechnest du selbst.</p>
        </div>
      </div>
      <main className="mx-auto max-w-[1600px] px-3 py-4 sm:px-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {TOPICS.map((t) => {
            const Icon = TOPIC_ICONS[t.icon];
            return (
              <Link
                key={t.slug}
                to={`/raum-und-form/${t.slug}`}
                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-blue-300 hover:shadow-md"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[var(--accent)]">
                  {Icon && <Icon className="h-5 w-5" />}
                </span>
                <span>
                  <span className="block font-semibold text-slate-800">{t.title}</span>
                  <span className="block text-sm leading-snug text-slate-500">{t.description}</span>
                </span>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}

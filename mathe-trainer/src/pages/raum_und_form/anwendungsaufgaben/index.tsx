import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import { Waves, Umbrella } from "lucide-react";

type Item = { title: string; desc: string; href: string; icon: LucideIcon };

const items: Item[] = [
  { 
    icon: Waves, 
    title: "Der Pool", 
    desc: "Zylinderförmiger Pool und Pavillon", 
    href: "pool" 
  },
  {
    icon: Umbrella,
    title: "Schwimmbad mit Schirm",
    desc: "Schwimmbecken mit Sonnenschirm",
    href: "schwimmbad-mit-schirm"
  }
];

export default function AnwendungsaufgabenIndex() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="max-w-6xl mx-auto px-6 py-12 space-y-8">
        <div className="space-y-2 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Geometrie – Raum und Form</p>
          <h1 className="text-3xl font-bold">Anwendungsaufgaben</h1>
          <p className="text-slate-600">Löse praxisnahe Aufgaben zu verschiedenen geometrischen Formen.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {items.map(({ href, title, desc, icon: Icon }) => (
            <Link
              key={href}
              to={href}
              className="rounded-xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm transition p-4 text-center text-slate-900 font-semibold flex flex-col items-center gap-3"
            >
              <div className="rounded-xl bg-slate-100 text-slate-700 p-2">
                <Icon className="h-6 w-6" aria-hidden="true" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="text-sm text-slate-600">{desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

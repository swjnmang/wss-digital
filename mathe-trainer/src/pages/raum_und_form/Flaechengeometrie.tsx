import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import { Circle, Diamond, Layers, Ruler, Shuffle, Square, Triangle, BookOpen } from "lucide-react";

const topics: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/raum-und-form/flaechengeometrie/dreiecke", label: "Dreiecke", icon: Triangle },
  { href: "/raum-und-form/flaechengeometrie/trapez", label: "Trapez", icon: Ruler },
  { href: "/raum-und-form/flaechengeometrie/rechteck", label: "Rechteck", icon: Square },
  { href: "/raum-und-form/flaechengeometrie/parallelogramm", label: "Parallelogramm", icon: Layers },
  { href: "/raum-und-form/flaechengeometrie/raute", label: "Raute", icon: Diamond },
  { href: "/raum-und-form/flaechengeometrie/kreis", label: "Kreis", icon: Circle },
  { href: "/raum-und-form/flaechengeometrie/gemischte-aufgaben", label: "Gemischte Übungsaufgaben", icon: Shuffle },
  { href: "/raum-und-form/flaechengeometrie/anwendungs-uebungsaufgaben", label: "Anwendungs- und Übungsaufgaben", icon: BookOpen }
];

export default function Flaechengeometrie() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="max-w-6xl mx-auto px-6 py-12 space-y-8">
        <div className="space-y-2 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Flächengeometrie</p>
          <h1 className="text-3xl font-bold">Wähle ein Unterthema</h1>
          <p className="text-slate-600">Dreiecke, Vierecke und Kreis als einzelne Übungspfade.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {topics.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              to={href}
              className="rounded-xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm transition p-4 text-center text-slate-900 font-semibold flex flex-col items-center gap-2"
            >
              <Icon className="h-6 w-6 text-slate-500" aria-hidden="true" />
              <span>{label}</span>
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}

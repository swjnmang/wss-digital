import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import { Triangle, Calculator, Ruler, Shuffle } from "lucide-react";

const topics: { href: string; label: string; icon: LucideIcon; desc: string }[] = [
  { href: "/raum-und-form/satz-des-pythagoras/katheten-hypotenuse", label: "Katheten und Hypotenuse erkennen", icon: Triangle, desc: "Lerne die Begriffe kennen" },
  { href: "/raum-und-form/satz-des-pythagoras/berechnen", label: "Seiten berechnen", icon: Calculator, desc: "Fehlende Seiten ermitteln" },
  { href: "/raum-und-form/satz-des-pythagoras/anwendung", label: "Coming soon", icon: Ruler, desc: "Alltag & Modelle" },
  { href: "/raum-und-form/satz-des-pythagoras/gemischt", label: "Gemischte Aufgaben", icon: Shuffle, desc: "Coming Soon" }
];

export default function PythagorasIndex() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="max-w-6xl mx-auto px-6 py-12 space-y-8">
        <div className="space-y-2 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Geometrie – Raum und Form</p>
          <h1 className="text-3xl font-bold">Satz des Pythagoras</h1>
          <p className="text-slate-600">Kathete² + Kathete² = Hypotenuse²</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {topics.map(({ href, label, icon: Icon, desc }) => (
            <Link
              key={href}
              to={href}
              className="rounded-xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm transition p-5 text-slate-900 flex flex-col items-center gap-3"
            >
              <div className="rounded-xl bg-slate-100 text-slate-700 p-2">
                <Icon className="h-6 w-6" aria-hidden="true" />
              </div>
              <div className="text-center space-y-1">
                <span className="font-semibold block">{label}</span>
                <span className="text-xs text-slate-500">{desc}</span>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}

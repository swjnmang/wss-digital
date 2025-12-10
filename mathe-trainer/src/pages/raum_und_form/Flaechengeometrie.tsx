import { Link } from "react-router-dom";

const topics = [
  { href: "/raum-und-form/flaechengeometrie/dreiecke", label: "Dreiecke" },
  { href: "/raum-und-form/flaechengeometrie/formen-erkennen", label: "Formen erkennen" },
  { href: "/raum-und-form/flaechengeometrie/trapez", label: "Trapez" },
  { href: "/raum-und-form/flaechengeometrie/rechteck", label: "Rechteck" },
  { href: "/raum-und-form/flaechengeometrie/parallelogramm", label: "Parallelogramm" },
  { href: "/raum-und-form/flaechengeometrie/raute", label: "Raute" },
  { href: "/raum-und-form/flaechengeometrie/kreis", label: "Kreis" }
];

export default function Flaechengeometrie() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-6">
        <div className="space-y-2 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Flächengeometrie</p>
          <h1 className="text-3xl font-bold">Wähle ein Unterthema</h1>
          <p className="text-slate-600">Dreiecke, Vierecke und Kreis als einzelne Übungspfade.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {topics.map(topic => (
            <Link
              key={topic.href}
              to={topic.href}
              className="rounded-xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm transition p-4 text-center text-slate-900 font-semibold"
            >
              {topic.label}
            </Link>
          ))}
        </div>

        <div className="text-center pt-6">
          <Link to="/raum-und-form" className="text-sm font-semibold text-slate-900 hover:underline">
            Zurück zur Übersicht
          </Link>
        </div>
      </div>
    </div>
  );
}

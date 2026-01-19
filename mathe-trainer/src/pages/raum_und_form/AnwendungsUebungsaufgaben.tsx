import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import { BookOpen } from "lucide-react";

type ApplicationItem = { href: string; label: string; desc: string; icon: LucideIcon };

const applications: ApplicationItem[] = [
  { 
    href: "/raum-und-form/flaechengeometrie/anwendungs-uebungsaufgaben/pausenhof", 
    label: "Der Pausenhof", 
    desc: "Berechne Flächen, Umfang und mehr",
    icon: BookOpen 
  },
  { 
    href: "/raum-und-form/flaechengeometrie/anwendungs-uebungsaufgaben/fussballplatz", 
    label: "Fußballplatz", 
    desc: "Berechne Rasen, Linien und Strecken",
    icon: BookOpen 
  },
  { 
    href: "/raum-und-form/flaechengeometrie/anwendungs-uebungsaufgaben/haus", 
    label: "Das Haus", 
    desc: "Berechne Flächen und Strecken am Hausplan",
    icon: BookOpen 
  },
  { 
    href: "/raum-und-form/flaechengeometrie/anwendungs-uebungsaufgaben/die-leinwand", 
    label: "Die Leinwand", 
    desc: "Löse realistische Anwendungsaufgaben mit verschiedenen Formen",
    icon: BookOpen 
  }
];

export default function AnwendungsUebungsaufgaben() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="max-w-6xl mx-auto px-6 py-12 space-y-8">
        <div className="space-y-2 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Anwendungs- und Übungsaufgaben</p>
          <h1 className="text-3xl font-bold">Wähle eine Aufgabe</h1>
          <p className="text-slate-600">Löse realistische Anwendungsaufgaben zur Flächengeometrie.</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          {applications.map(({ href, label, desc, icon: Icon }) => (
            <Link
              key={href}
              to={href}
              className="rounded-xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-md transition p-6 text-slate-900 no-underline flex flex-col gap-3"
            >
              <div className="rounded-lg bg-slate-100 text-slate-700 p-3 w-fit">
                <Icon className="h-6 w-6" aria-hidden="true" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">{label}</h3>
                <p className="text-sm text-slate-600 mt-1">{desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

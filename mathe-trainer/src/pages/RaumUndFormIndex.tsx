import { Link } from "react-router-dom";
import { Ruler, Triangle, Expand, Circle, Box, Cone, Pyramid, Cylinder, BookOpen } from "lucide-react";

const items = [
  { icon: Ruler, title: "Flächengeometrie", desc: "Unterthemen öffnen", href: "flaechengeometrie" },
  { icon: Triangle, title: "Satz des Pythagoras", desc: "Katheten und Hypotenuse verstehen", href: "satz-des-pythagoras" },
  { icon: Expand, title: "Strahlensätze", desc: "Coming Soon", href: "strahlensaetze" },
  { icon: Circle, title: "Kugel", desc: "Coming Soon", href: "kugel" },
  { icon: Box, title: "Prisma", desc: "Coming Soon", href: "prisma" },
  { icon: Cone, title: "Kegel", desc: "Coming Soon", href: "kegel" },
  { icon: Pyramid, title: "Pyramide", desc: "Coming Soon", href: "pyramide" },
  { icon: Cylinder, title: "Zylinder", desc: "Coming Soon", href: "zylinder" },
  { icon: BookOpen, title: "Anwendungsaufgaben", desc: "Übungsaufgaben aus dem Alltag", href: "anwendungsaufgaben" },
];

export default function RaumUndFormIndex() {
  return (
    <div className="min-h-screen bg-[var(--bg-color)] flex flex-col text-slate-900">
      <header className="w-full text-white py-10 sm:py-14 text-center shadow-md relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-700" />
        <div className="relative max-w-4xl mx-auto px-4 space-y-3">
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">Raum &amp; Form</h1>
          <p className="text-base sm:text-lg text-slate-200 max-w-2xl mx-auto">
            Wähle ein Thema aus, um zu den Übungen zu gelangen.
          </p>
        </div>
      </header>

      <main className="flex-1 w-full px-4 sm:px-6 lg:px-10 py-8 sm:py-12 flex items-center justify-center">
        <div className="w-full max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                to={`/raum-und-form/${item.href}`}
                className="bg-white rounded-2xl p-6 sm:p-8 text-center text-slate-900 shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex flex-col items-center h-full border border-slate-100"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-blue-50 flex items-center justify-center text-[var(--accent)] mb-4 sm:mb-5">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold mb-2 text-slate-800">{item.title}</h3>
                <p className="text-slate-500 leading-relaxed mb-4 sm:mb-5 text-sm sm:text-base">{item.desc}</p>
                <div className="mt-auto" aria-hidden="true" />
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}

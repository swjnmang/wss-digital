import { Link } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import { Ruler, Triangle, Circle, Cone, Pyramid, Cylinder, Boxes } from 'lucide-react';

const items: Array<{ title: string; desc: string; href: string; accent: string; icon: LucideIcon }> = [
  {
    title: 'Flächengeometrie',
    desc: 'Rechtecke, Dreiecke, Trapeze und Kreise – berechne Flächen präzise.',
    href: 'flaechengeometrie',
    accent: 'bg-rose-100 text-rose-700',
    icon: Ruler
  },
  {
    title: 'Satz des Pythagoras',
    desc: 'Finde Hypotenusen und Katheten in praxisnahen Szenarien.',
    href: 'satz-des-pythagoras',
    accent: 'bg-indigo-100 text-indigo-700',
    icon: Triangle
  },
  {
    title: 'Kugel',
    desc: 'Volumen und Oberfläche für kugelförmige Bauteile.',
    href: 'kugel',
    accent: 'bg-emerald-100 text-emerald-700',
    icon: Circle
  },
  {
    title: 'Kegel',
    desc: 'Berechne Volumen oder Mantel für konische Körper.',
    href: 'kegel',
    accent: 'bg-amber-100 text-amber-700',
    icon: Cone
  },
  {
    title: 'Pyramide',
    desc: 'Grundfläche und Höhe geschickt kombinieren.',
    href: 'pyramide',
    accent: 'bg-violet-100 text-violet-700',
    icon: Pyramid
  },
  {
    title: 'Zylinder',
    desc: 'Oberfläche und Volumen für Tanks & Displays.',
    href: 'zylinder',
    accent: 'bg-cyan-100 text-cyan-700',
    icon: Cylinder
  },
  {
    title: 'Prisma',
    desc: 'Quader- und Dreiecksprismen mit realen Maßangaben.',
    href: 'prisma',
    accent: 'bg-emerald-100 text-emerald-700',
    icon: Boxes
  }
];

export default function RaumUndFormIndex() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-white via-slate-50 to-white text-slate-900">
      <header className="w-full py-12 px-4 md:px-12 bg-white/90 backdrop-blur border-b border-slate-200">
        <h1 className="text-4xl font-bold mb-3 text-slate-900">Raum &amp; Form</h1>
        <p className="text-lg text-slate-600 max-w-3xl">Übungsaufgaben zur Flächen- und Körpergeometrie</p>
      </header>

      <div className="w-full max-w-6xl mx-auto px-4 mt-6">
        <Link to="/" className="inline-block text-slate-500 hover:text-slate-900 mb-4">
          ← Zurück zur Hauptübersicht
        </Link>
      </div>

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 pb-16 grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {items.map(item => {
          const Icon = item.icon;
          return (
            <div
              key={item.href}
              className="bg-white rounded-3xl shadow-xl border border-slate-200 p-6 flex flex-col text-slate-900"
            >
              <span
                className={`text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full inline-block mb-4 text-center w-full ${item.accent}`}
              >
                {item.title}
              </span>
              <p className="text-slate-600 flex-1">{item.desc}</p>
              <Link
                to={`/raum-und-form/${item.href}`}
                className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 text-white font-semibold py-2 px-4 hover:bg-slate-800"
              >
                <Icon className="w-4 h-4" aria-hidden="true" />
                Jetzt üben
              </Link>
            </div>
          );
        })}
      </main>
    </div>
  );
}

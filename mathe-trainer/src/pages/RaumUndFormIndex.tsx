import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import { Ruler, Triangle, Expand, Circle, Box, Cone, Pyramid, Cylinder, BookOpen } from "lucide-react";

type Item = { title: string; desc: string; href: string; icon: LucideIcon };
type SectionData = { title: string; items: Item[] };

const sections: SectionData[] = [
  {
    title: "Geometrie – Raum und Form",
    items: [
      { icon: Ruler, title: "Flächengeometrie", desc: "Unterthemen öffnen", href: "flaechengeometrie" },
      { icon: Triangle, title: "Satz des Pythagoras", desc: "Katheten und Hypotenuse verstehen", href: "satz-des-pythagoras" },
      { icon: Expand, title: "Strahlensätze", desc: "Coming Soon", href: "strahlensaetze" },
      { icon: Circle, title: "Kugel", desc: "Coming Soon", href: "kugel" },
      { icon: Box, title: "Prisma", desc: "Coming Soon", href: "prisma" },
      { icon: Cone, title: "Kegel", desc: "Coming Soon", href: "kegel" },
      { icon: Pyramid, title: "Pyramide", desc: "Coming Soon", href: "pyramide" },
      { icon: Cylinder, title: "Zylinder", desc: "Coming Soon", href: "zylinder" },
      { icon: BookOpen, title: "Anwendungsaufgaben", desc: "Übungsaufgaben aus dem Alltag", href: "anwendungsaufgaben" }
    ]
  }
];

const cardBase =
  "group rounded-2xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm transition-colors p-5 w-full max-w-sm";
const buttonBase =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-900 text-slate-50 bg-slate-900 px-4 py-2 text-sm font-semibold hover:bg-slate-800";

export default function RaumUndFormIndex() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white/90">
        <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col gap-4">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl md:text-4xl font-bold leading-tight">Geometrie – Raum und Form</h1>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-10 space-y-10">
        {sections.map(section => (
          <div key={section.title}>
            <Section title={section.title} items={section.items} />
          </div>
        ))}
      </main>
    </div>
  );
}

function Section({ title, items }: { title: string; items: Item[] }) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-center">
        <h2 className="text-xl font-bold text-slate-900 text-center">{title}</h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 justify-items-center">
        {items.map(item => {
          const Icon = item.icon;
          return (
            <Link key={item.href} to={`/raum-und-form/${item.href}`} className={`${cardBase} no-underline`}>
              <div className="flex flex-col items-center text-center gap-3">
                <div className="rounded-xl bg-slate-100 text-slate-700 p-2">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold leading-tight">{item.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

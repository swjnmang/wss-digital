import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import { Ruler, Triangle, Circle, Cone, Pyramid, Cylinder, Boxes, ArrowLeft } from "lucide-react";

type Item = { title: string; desc: string; href: string; tag: string; icon: LucideIcon };

const surfaceItems: Item[] = [
  {
    title: "Flächengeometrie",
    desc: "Rechtecke, Dreiecke, Trapeze und Kreise in ruhigem Layout  mit klaren Skizzen und Einheiten.",
    href: "flaechengeometrie",
    tag: "Flächen",
    icon: Ruler
  },
  {
    title: "Satz des Pythagoras",
    desc: "Hypotenuse oder Kathete finden  rechtwinklige Dreiecke ohne Ballast.",
    href: "satz-des-pythagoras",
    tag: "Dreiecke",
    icon: Triangle
  }
];

const solidItems: Item[] = [
  {
    title: "Kugel",
    desc: "Volumen und Oberfläche für Kugeln, sauber beschriftet.",
    href: "kugel",
    tag: "Körper",
    icon: Circle
  },
  {
    title: "Kegel",
    desc: "Mantel und Volumen mit klaren Höhen- und Radiusangaben.",
    href: "kegel",
    tag: "Körper",
    icon: Cone
  },
  {
    title: "Pyramide",
    desc: "Grundfläche, Höhe, Mantel  kompakt dargestellt.",
    href: "pyramide",
    tag: "Körper",
    icon: Pyramid
  },
  {
    title: "Zylinder",
    desc: "Tank- und Dosenaufgaben mit sauberen Netzen.",
    href: "zylinder",
    tag: "Körper",
    icon: Cylinder
  },
  {
    title: "Prisma",
    desc: "Quader-, Dreiecks- und Trapezprismen mit eindeutigen Kanten.",
    href: "prisma",
    tag: "Körper",
    icon: Boxes
  }
];

const cardBase =
  "group rounded-2xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm transition-colors p-5 flex flex-col gap-3";
const tagBase = "inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500";
const buttonBase =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-900 text-slate-50 bg-slate-900 px-4 py-2 text-sm font-semibold hover:bg-slate-800";

export default function RaumUndFormIndex() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white/90">
        <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col gap-4">
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <Link to="/" className="hover:text-slate-800 font-semibold">
              Zurück zur Hauptübersicht
            </Link>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Raum &amp; Form</p>
            <h1 className="text-3xl md:text-4xl font-bold leading-tight">Übersicht der Teilgebiete</h1>
            <p className="text-base md:text-lg text-slate-600 max-w-3xl leading-relaxed">
              Kompakte Übungskarten mit ruhigem Layout, klaren Skizzen und eindeutigen Einheiten. Wähle ein Teilgebiet und starte direkt.
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-10 space-y-10">
        <Section title="Flächen & Dreiecke" items={surfaceItems} />
        <Section title="Körpergeometrie" items={solidItems} />
      </main>
    </div>
  );
}

function Section({ title, items }: { title: string; items: Item[] }) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h2 className="text-xl font-bold text-slate-900">{title}</h2>
        <p className="text-sm text-slate-500">Direkter Einstieg in die Aufgabengeneratoren</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map(item => {
          const Icon = item.icon;
          return (
            <div key={item.href} className={cardBase}>
              <span className={tagBase}>
                <span className="h-2 w-2 rounded-full bg-slate-400" aria-hidden="true" />
                {item.tag}
              </span>
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-slate-100 text-slate-700 p-2">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold leading-tight">{item.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
                </div>
              </div>
              <div className="pt-1">
                <Link to={`/raum-und-form/${item.href}`} className={buttonBase}>
                  Jetzt öffnen
                  <span aria-hidden="true"></span>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function Strahlensaetze() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-4xl mx-auto px-6 py-6 flex items-center gap-4">
          <Link to="/raum-und-form" className="text-slate-600 hover:text-slate-900">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Strahlensätze</h1>
            <p className="text-sm text-slate-600">Übungsaufgaben in Bearbeitung</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="bg-white rounded-lg border border-slate-200 p-8 text-center space-y-4">
          <h2 className="text-xl font-semibold">Aufgaben werden überarbeitet</h2>
          <p className="text-slate-600">
            Die Strahlensatz-Aufgaben werden derzeit überarbeitet, um eine bessere Qualität und Verständlichkeit zu erreichen.
          </p>
          <p className="text-sm text-slate-500">
            Bitte versuchen Sie es später erneut.
          </p>
        </div>
      </main>
    </div>
  );
}

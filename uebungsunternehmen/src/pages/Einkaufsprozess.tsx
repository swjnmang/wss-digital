import { Link } from 'react-router-dom';

export default function Einkaufsprozess() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-600 to-green-700 text-white py-8 px-4 shadow-lg">
        <div className="max-w-6xl mx-auto">
          <Link to="/" className="inline-flex items-center gap-2 text-green-100 hover:text-white mb-4 text-md font-medium transition-colors">
            ← Zurück zur Übersicht
          </Link>
          <h1 className="text-4xl font-bold mb-2">🛍️ Einkaufsprozess</h1>
          <p className="text-lg text-green-100">
            Lerne den kompletten Beschaffungsprozess: Von der Bedarfsprüfung bis zur Rechnungsprüfung
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full p-8">
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <div className="text-6xl mb-6">🏗️</div>
          <h2 className="text-3xl font-bold text-slate-800 mb-4">In Entwicklung</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8">
            Der Einkaufsprozess wird in Kürze mit einem vollständigen interaktiven System befüllt.
            Hier werden Schüler:innen lernen, wie man Lieferanten bewerte, Angebote einholt und Bestellungen korrekt verwaltet.
          </p>
          <Link to="/" className="inline-block px-8 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors">
            Zur Übersicht zurück
          </Link>
        </div>
      </main>
    </div>
  );
}

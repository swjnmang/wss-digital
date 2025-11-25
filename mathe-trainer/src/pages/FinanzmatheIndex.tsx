import React from 'react';
import { Link } from 'react-router-dom';

export default function FinanzmatheIndex() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-sky-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-4xl font-bold text-blue-900 mb-8 text-center">Finanzmathematik</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link to="/finanzmathe/zinsrechnung" className="block p-6 bg-blue-50 rounded-xl hover:bg-blue-100 transition border border-blue-200">
            <h2 className="text-xl font-bold text-blue-800 mb-2">Zinsrechnung</h2>
            <p className="text-gray-600">Grundlagen der Zinsrechnung üben.</p>
          </Link>

          <Link to="/finanzmathe/zinseszins" className="block p-6 bg-blue-50 rounded-xl hover:bg-blue-100 transition border border-blue-200">
            <h2 className="text-xl font-bold text-blue-800 mb-2">Zinseszins</h2>
            <p className="text-gray-600">Zinseszins und gemischte Aufgaben.</p>
          </Link>

          <Link to="/finanzmathe/mehrung_minderung" className="block p-6 bg-blue-50 rounded-xl hover:bg-blue-100 transition border border-blue-200">
            <h2 className="text-xl font-bold text-blue-800 mb-2">Kapitalmehrung und - minderung</h2>
            <p className="text-gray-600">Kombinierte Zinseszins- und Rentenrechnung.</p>
          </Link>

          <Link to="/finanzmathe/endwert" className="block p-6 bg-blue-50 rounded-xl hover:bg-blue-100 transition border border-blue-200">
            <h2 className="text-xl font-bold text-blue-800 mb-2">Rentenrechnung: Endwert</h2>
            <p className="text-gray-600">Berechnung von Endwert, Rate oder Laufzeit (ohne Startkapital).</p>
          </Link>

          <Link to="/finanzmathe/ratendarlehen" className="block p-6 bg-blue-50 rounded-xl hover:bg-blue-100 transition border border-blue-200">
            <h2 className="text-xl font-bold text-blue-800 mb-2">Ratendarlehen</h2>
            <p className="text-gray-600">Tilgungspläne für Ratendarlehen erstellen.</p>
          </Link>

          <Link to="/finanzmathe/annuitaetendarlehen" className="block p-6 bg-blue-50 rounded-xl hover:bg-blue-100 transition border border-blue-200">
            <h2 className="text-xl font-bold text-blue-800 mb-2">Annuitätendarlehen</h2>
            <p className="text-gray-600">Tilgungspläne für Annuitätendarlehen erstellen.</p>
          </Link>
        </div>

        <div className="mt-8 text-center">
          <Link to="/" className="text-blue-600 hover:underline">Zurück zur Startseite</Link>
        </div>
      </div>
    </div>
  );
}

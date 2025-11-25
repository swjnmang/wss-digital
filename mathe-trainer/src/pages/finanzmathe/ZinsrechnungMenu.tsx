import React from 'react';
import { Link } from 'react-router-dom';

export default function ZinsrechnungMenu() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-sky-100">
      <div className="flex-1 flex flex-col items-center justify-center w-full px-4 py-8">
        <div className="bg-white rounded-2xl shadow-md border border-slate-200 w-full max-w-2xl p-8">
          <a href="/finanzmathe" className="text-blue-600 hover:underline mb-6 block">&larr; Zurück zur Übersicht</a>
          <h1 className="text-3xl font-bold text-blue-900 mb-8 text-center">Zinsrechnung</h1>
          
          <div className="grid gap-4">
            <Link to="/finanzmathe/zinsrechnung/ueben" className="block p-6 bg-blue-50 rounded-xl hover:bg-blue-100 transition border border-blue-200 text-center">
              <h2 className="text-xl font-bold text-blue-800 mb-2">Zinsrechnung üben</h2>
              <p className="text-gray-600">Berechne Zinsen, Kapital, Zinssatz oder Laufzeit.</p>
            </Link>

            <Link to="/finanzmathe/zinsrechnung/tage" className="block p-6 bg-green-50 rounded-xl hover:bg-green-100 transition border border-green-200 text-center">
              <h2 className="text-xl font-bold text-green-800 mb-2">Zinstage aus Datum berechnen</h2>
              <p className="text-gray-600">Bestimme die Zinstage t zwischen zwei Kalenderdaten.</p>
            </Link>

            <Link to="/finanzmathe/zinsen_test" className="block p-6 bg-purple-50 rounded-xl hover:bg-purple-100 transition border border-purple-200 text-center">
              <h2 className="text-xl font-bold text-purple-800 mb-2">Test: Zinsrechnung</h2>
              <p className="text-gray-600">Teste dein Wissen unter Prüfungsbedingungen.</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

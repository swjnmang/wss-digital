import React from 'react';
import { Link } from 'react-router-dom';

export default function TrigonometrieIndex() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-4xl font-bold text-orange-900 mb-8 text-center">Trigonometrie</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link to="/trigonometrie/rechtwinklig-beschriften" className="block p-6 bg-orange-50 rounded-xl hover:bg-orange-100 transition border border-orange-200">
            <h2 className="text-xl font-bold text-orange-800 mb-2">1. Rechtwinklige Dreiecke beschriften</h2>
            <p className="text-gray-600">Hypotenuse, Gegenkathete und Ankathete korrekt zuordnen.</p>
          </Link>

          <Link to="/trigonometrie/rechtwinklig2" className="block p-6 bg-orange-50 rounded-xl hover:bg-orange-100 transition border border-orange-200">
            <h2 className="text-xl font-bold text-orange-800 mb-2">2. Rechtwinklige Dreiecke 2</h2>
            <p className="text-gray-600">Erweiterte Übungen: Winkel aus Seiten berechnen und Seiten aus Winkel/Seite.</p>
          </Link>

          <Link to="/trigonometrie/sinussatz" className="block p-6 bg-orange-50 rounded-xl hover:bg-orange-100 transition border border-orange-200">
            <h2 className="text-xl font-bold text-orange-800 mb-2">3. Sinussatz</h2>
            <p className="text-gray-600">Seiten und Winkel mithilfe von gegenüberliegenden Paaren berechnen.</p>
          </Link>

          <Link to="/trigonometrie/kosinussatz" className="block p-6 bg-orange-50 rounded-xl hover:bg-orange-100 transition border border-orange-200">
            <h2 className="text-xl font-bold text-orange-800 mb-2">4. Kosinussatz</h2>
            <p className="text-gray-600">Mit zwei Seiten und dem eingeschlossenen Winkel fehlende Größen bestimmen.</p>
          </Link>

          <Link to="/trigonometrie/flaechensatz" className="block p-6 bg-orange-50 rounded-xl hover:bg-orange-100 transition border border-orange-200">
            <h2 className="text-xl font-bold text-orange-800 mb-2">5. Flächensatz</h2>
            <p className="text-gray-600">Flächeninhalt und fehlende Größen im allgemeinen Dreieck berechnen.</p>
          </Link>

          <Link to="/trigonometrie/gemischte-aufgaben" className="block p-6 bg-orange-50 rounded-xl hover:bg-orange-100 transition border border-orange-200">
            <h2 className="text-xl font-bold text-orange-800 mb-2">6. Gemischte Anwendungen</h2>
            <p className="text-gray-600">20 praxisnahe Aufgaben mit Skizzen, Hinweisen und Konzeptfilter.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { Link } from 'react-router-dom';

const menuItems = [
  {
    title: '1. Normalparabel',
    description: 'Lerne die Grundlagen der Normalparabel und ihre Eigenschaften kennen.',
    path: '/quadratische_funktionen/normalparabel',
    icon: 'bezier-curve',
    color: 'blue'
  },
  {
    title: '2. Scheitelpunkt ablesen',
    description: 'Übe das Ablesen des Scheitelpunkts direkt aus dem Graphen.',
    path: '/quadratische_funktionen/scheitelpunkt_ablesen',
    icon: 'map-pin',
    color: 'green'
  },
  {
    title: '3. Scheitelform',
    description: 'Verstehe den Aufbau und die Vorteile der Scheitelpunktform.',
    path: '/quadratische_funktionen/scheitelform',
    icon: 's', // FontAwesome 's' might not be standard, using a placeholder or text
    color: 'purple'
  },
  {
    title: '4. Graph zeichnen',
    description: 'Zeichne Parabeln anhand ihrer Funktionsgleichung.',
    path: '/quadratische_funktionen/graph_zeichnen',
    icon: 'pencil',
    color: 'orange'
  },
  {
    title: '5. Scheitelpunkt berechnen',
    description: 'Berechne den Scheitelpunkt aus der Normal- oder allgemeinen Form.',
    path: '/quadratische_funktionen/scheitelpunkt',
    icon: 'calculator',
    color: 'red'
  },
  {
    title: '6. Umwandlung in Scheitelform',
    description: 'Forme die allgemeine Form in die Scheitelpunktform um.',
    path: '/quadratische_funktionen/scheitelform_rechnerisch',
    icon: 'right-left', // exchange-alt
    color: 'teal'
  },
  {
    title: '7. Umwandlung in Allg. Form',
    description: 'Wandle die Scheitelpunktform in die allgemeine Form um.',
    path: '/quadratische_funktionen/scheitel_in_allg_form',
    icon: 'left-right',
    color: 'indigo'
  },
  {
    title: '8. Funktionsgleichung aufstellen',
    description: 'Stelle eine Funktionsgleichung aus Punkten oder Eigenschaften auf.',
    path: '/quadratische_funktionen/funktionsgleichung_aufstellen',
    icon: 'pen-ruler',
    color: 'pink'
  },
  {
    title: '9. Nullstellen berechnen',
    description: 'Finde die Schnittpunkte einer Parabel mit der x-Achse.',
    path: '/quadratische_funktionen/nullstellen',
    icon: 'arrows-down-to-line',
    color: 'cyan'
  },
  {
    title: '10. Schnittpunkte (Parabel-Gerade)',
    description: 'Berechne die Schnittpunkte zwischen einer Parabel und einer Geraden.',
    path: '/quadratische_funktionen/schnittpunkte_gerade',
    icon: 'arrows-turn-to-dots',
    color: 'lime'
  },
  {
    title: '11. Schnittpunkte (Parabel-Parabel)',
    description: 'Berechne die Schnittpunkte zwischen zwei Parabeln.',
    path: '/quadratische_funktionen/schnittpunkte_parabel',
    icon: 'code-compare',
    color: 'amber'
  },
  {
    title: '12. Spiel: Nullstellen finden',
    description: 'Eine spielerische Anwendung zum Thema Nullstellen.',
    path: '/quadratische_funktionen/spiel_nullstellen',
    icon: 'gamepad',
    color: 'fuchsia'
  },
  {
    title: '13. Abschlusstest',
    description: 'Teste dein Wissen über quadratische Funktionen.',
    path: '/quadratische_funktionen/abschlusstest',
    icon: 'graduation-cap',
    color: 'rose'
  }
];

export default function QuadratischeFunktionenMenu() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-gray-100">
      <div className="flex-1 flex flex-col items-center w-full px-4 py-8">
        <div className="w-full max-w-6xl">
          <a href="/" className="text-blue-600 hover:underline mb-6 block font-medium">&larr; Zurück zur Hauptübersicht</a>
          
          <header className="mb-10 text-center">
            <h1 className="text-4xl font-bold text-slate-900 mb-4">Quadratische Funktionen</h1>
            <p className="text-xl text-slate-600">Wähle eine Aufgabe aus der folgenden Liste aus.</p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menuItems.map((item, index) => (
              <Link 
                key={index} 
                to={item.path}
                className={`group block p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-slate-200 hover:border-${item.color}-400 relative overflow-hidden`}
              >
                <div className={`absolute top-0 left-0 w-1 h-full bg-${item.color}-500 group-hover:w-2 transition-all`}></div>
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg bg-${item.color}-50 text-${item.color}-600`}>
                    {/* We're not using FontAwesome directly here to avoid dependency issues if not installed, 
                        but we could use lucide-react or similar if available. 
                        For now, we'll just use a generic placeholder or the icon name as class if FA is global. */}
                    <i className={`fa-solid fa-${item.icon} text-xl`}></i>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-blue-700 transition-colors">{item.title}</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">{item.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

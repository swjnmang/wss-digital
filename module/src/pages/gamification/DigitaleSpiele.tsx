import { Link } from 'react-router-dom'
import { useState } from 'react'

export default function DigitaleSpiele() {
  const [activeTab, setActiveTab] = useState('aufgaben')

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-gradient-to-br from-slate-800 to-slate-700 text-white py-12 px-4 text-center shadow-md relative">
        <Link to="/gamification" className="absolute top-4 left-4 text-slate-300 hover:text-white flex items-center gap-2 text-sm font-medium transition-colors">
          ← Zurück
        </Link>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">Gamification</p>
        <h1 className="text-4xl font-bold mb-2 tracking-tight">📱 Digitale Spiele untersuchen & bewerten</h1>
        <p className="text-lg text-slate-300">Analysiere und evaluiere digitale Spiele</p>
      </header>

      <main className="flex-1 w-full max-w-6xl mx-auto p-12">
        <div className="bg-white rounded-2xl p-10 shadow-sm border border-slate-100">
          
          <div className="flex gap-4 mb-10 border-b border-slate-200">
            <button
              onClick={() => setActiveTab('aufgaben')}
              className={`pb-4 px-2 font-semibold transition-colors ${
                activeTab === 'aufgaben'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Aufgaben
            </button>
            <button
              onClick={() => setActiveTab('texte')}
              className={`pb-4 px-2 font-semibold transition-colors ${
                activeTab === 'texte'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Texte
            </button>
            <button
              onClick={() => setActiveTab('uebungen')}
              className={`pb-4 px-2 font-semibold transition-colors ${
                activeTab === 'uebungen'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Übungen
            </button>
          </div>

          {activeTab === 'aufgaben' && (
            <div>
              <h2 className="text-2xl font-semibold text-slate-900 mb-6">Aufgaben</h2>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                    <div className="text-4xl mb-4">🎮</div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">Aufgabe {i}</h3>
                    <p className="text-slate-600 text-sm mb-4">Analysiere ein digitales Spiel...</p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-blue-600">100 Punkte</span>
                      <button className="py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium">
                        Öffnen
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'texte' && (
            <div>
              <h2 className="text-2xl font-semibold text-slate-900 mb-6">Texte & Erklärungen</h2>
              <div className="bg-slate-50 rounded-xl p-8 border border-slate-200">
                <h3 className="text-xl font-semibold text-slate-900 mb-4">Analyse von digitalen Spielen</h3>
                <p className="text-slate-700 mb-4 leading-relaxed">
                  Digitale Spiele haben eigene Merkmale wie Grafik, Sounddesign, Interaktivität und Storytelling. Durch ihre Analyse können wir verstehen, wie sie Spieler motivieren und engagieren.
                </p>
                <p className="text-slate-700 leading-relaxed">
                  Bei der Bewertung achten wir auf Spielmechaniken, Herausforderungsgrad, Lerninhalte und die Nutzererfahrung.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'uebungen' && (
            <div>
              <h2 className="text-2xl font-semibold text-slate-900 mb-6">Praktische Übungen</h2>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-6">
                {[1, 2].map((i) => (
                  <div key={i} className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                    <h3 className="text-lg font-semibold text-slate-900 mb-3">Übung {i}</h3>
                    <p className="text-slate-600 text-sm mb-4">Untersuche ein Spiel und evaluiere es...</p>
                    <button className="w-full py-2 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium text-sm">
                      Übung starten
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

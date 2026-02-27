import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function GamificationModule() {
  const [activeTab, setActiveTab] = useState('aufgaben')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Header with Back Button */}
      <header className="bg-slate-900 text-white py-6 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <Link to="/" className="text-blue-400 hover:text-blue-300 mb-2 inline-block">
              ← Zurück
            </Link>
            <h1 className="text-4xl font-bold">Gamification</h1>
            <p className="text-slate-300">Lerne spielerisch mit Punkten und Abzeichen</p>
          </div>
          <div className="text-5xl">🎮</div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto flex">
          <button
            onClick={() => setActiveTab('aufgaben')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'aufgaben'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            Aufgaben
          </button>
          <button
            onClick={() => setActiveTab('texte')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'texte'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            Texte
          </button>
          <button
            onClick={() => setActiveTab('uebungen')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'uebungen'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            Übungen
          </button>
        </div>
      </div>

      {/* Content Area */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        {activeTab === 'aufgaben' && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Aufgaben</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer"
                >
                  <div className="text-4xl mb-4">⭐</div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Aufgabe {i}</h3>
                  <p className="text-slate-600 mb-4">Beschreibung der Aufgabe...</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-blue-600">100 Punkte</span>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
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
            <h2 className="text-2xl font-bold text-white mb-6">Texte & Erklärungen</h2>
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h3 className="text-xl font-bold text-slate-900 mb-4">Einführung in Gamification</h3>
              <p className="text-slate-700 mb-4">
                Gamification ist die Anwendung von Spielmechaniken in nicht-spielerischen Kontexten...
              </p>
              <p className="text-slate-700">Weitere Inhalte folgen...</p>
            </div>
          </div>
        )}

        {activeTab === 'uebungen' && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Praktische Übungen</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-3">Übung {i}</h3>
                  <p className="text-slate-600 mb-4">Praktische Aufgabe zur Anwendung...</p>
                  <button className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 font-semibold">
                    Übung starten
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

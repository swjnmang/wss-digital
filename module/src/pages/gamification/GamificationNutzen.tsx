import { Link } from 'react-router-dom'
import { useState } from 'react'

export default function GamificationNutzen() {
  const [activeTab, setActiveTab] = useState('aufgaben')
  const [expandedTasks, setExpandedTasks] = useState<Record<number, boolean>>({})

  const toggleTask = (taskId: number) => {
    setExpandedTasks(prev => ({ ...prev, [taskId]: !prev[taskId] }))
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-gradient-to-br from-slate-800 to-slate-700 text-white py-12 px-4 text-center shadow-md relative">
        <Link to="/gamification" className="absolute top-4 left-4 text-slate-300 hover:text-white flex items-center gap-2 text-sm font-medium transition-colors">
          ← Zurück
        </Link>        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">Gamification</p>        <h1 className="text-4xl font-bold mb-2 tracking-tight">🎯 Gamification identifizieren und nutzen</h1>
        <p className="text-lg text-slate-300">Erkenne und wende Gamification strategisch an</p>
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
            <div className="space-y-6">
              {/* Arbeitsauftrag 1 */}
              <div className="bg-slate-50 rounded-xl border-2 border-slate-200 overflow-hidden">
                <button
                  onClick={() => toggleTask(1)}
                  className="w-full p-6 hover:bg-slate-100 transition-colors flex items-center justify-between"
                >
                  <div className="text-left">
                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                      🎮 Arbeitsauftrag 1: Gamification, Serious-Games, Simulationen & Lernspiele – Unterschiede kennenlernen
                    </h3>
                    <p className="text-slate-600 text-sm mt-2">
                      Lerne die Unterschiede zwischen Gamification, Serious Games, Simulationen und Lernspielen kennen
                    </p>
                  </div>
                  <span className={`text-2xl transform transition-transform flex-shrink-0 ml-4 ${expandedTasks[1] ? 'rotate-45' : ''}`}>➕</span>
                </button>
                {expandedTasks[1] && (
                  <div className="px-6 pb-6 border-t border-slate-200">
                    <div className="bg-white p-6 rounded-lg mt-4 text-slate-700 leading-relaxed">
                      <p className="italic text-slate-500">Inhalt folgt …</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Arbeitsauftrag 2 */}
              <div className="bg-slate-50 rounded-xl border-2 border-slate-200 overflow-hidden">
                <button
                  onClick={() => toggleTask(2)}
                  className="w-full p-6 hover:bg-slate-100 transition-colors flex items-center justify-between"
                >
                  <div className="text-left">
                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                      📱 Arbeitsauftrag 2: Eine App untersuchen und kritisch testen
                    </h3>
                    <p className="text-slate-600 text-sm mt-2">
                      Analysiere und bewerte eine App auf Gamification-Elemente
                    </p>
                  </div>
                  <span className={`text-2xl transform transition-transform flex-shrink-0 ml-4 ${expandedTasks[2] ? 'rotate-45' : ''}`}>➕</span>
                </button>
                {expandedTasks[2] && (
                  <div className="px-6 pb-6 border-t border-slate-200">
                    <div className="bg-white p-6 rounded-lg mt-4 text-slate-700 leading-relaxed">
                      <p className="italic text-slate-500">Inhalt folgt …</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Arbeitsauftrag 3 */}
              <div className="bg-slate-50 rounded-xl border-2 border-slate-200 overflow-hidden">
                <button
                  onClick={() => toggleTask(3)}
                  className="w-full p-6 hover:bg-slate-100 transition-colors flex items-center justify-between"
                >
                  <div className="text-left">
                    <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                      ⚖️ Arbeitsauftrag 3: Chancen & Risiken von Gamification
                    </h3>
                    <p className="text-slate-600 text-sm mt-2">
                      Diskutiere und bewerte die Vor- und Nachteile von Gamification
                    </p>
                  </div>
                  <span className={`text-2xl transform transition-transform flex-shrink-0 ml-4 ${expandedTasks[3] ? 'rotate-45' : ''}`}>➕</span>
                </button>
                {expandedTasks[3] && (
                  <div className="px-6 pb-6 border-t border-slate-200">
                    <div className="bg-white p-6 rounded-lg mt-4 text-slate-700 leading-relaxed">
                      <p className="italic text-slate-500">Inhalt folgt …</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'texte' && (
            <div>
              <h2 className="text-2xl font-semibold text-slate-900 mb-6">Texte & Erklärungen</h2>
              <div className="bg-slate-50 rounded-xl p-8 border border-slate-200">
                <h3 className="text-xl font-semibold text-slate-900 mb-4">Gamification in der Praxis</h3>
                <p className="text-slate-700 mb-4 leading-relaxed">
                  Gamification wendet Spielelemente auf nichtspielerische Kontexte an. Dazu gehören Punkte, Abzeichen, Leaderboards, Quests und Fortschrittsbars.
                </p>
                <p className="text-slate-700 leading-relaxed">
                  Durch das strategische Design dieser Elemente können wir Engagement, Motivation und Lerneffektivität in vielen Bereichen verbessern.
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
                    <p className="text-slate-600 text-sm mb-4">Entwerfe ein Gamification-System...</p>
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

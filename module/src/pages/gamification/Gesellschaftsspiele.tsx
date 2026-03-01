import { Link } from 'react-router-dom'
import { useState } from 'react'
import FragebogenFormular from './FragebogenFormular'
import BartleTest from './BartleTest'
import NickYeeTest from './NickYeeTest'
import Uebung1Matching from './Uebung1Matching'
import Uebung2MiniSpiele from './Uebung2MiniSpiele'
import Uebung3SpielAnalyse from './Uebung3SpielAnalyse'
import Uebung4MechanikenVergleich from './Uebung4MechanikenVergleich'
import Uebung5SpielDesign from './Uebung5SpielDesign'

export default function Gesellschaftsspiele() {
  const [activeTab, setActiveTab] = useState('aufgaben')
  const [showFragebogen, setShowFragebogen] = useState(false)
  const [selectedTest, setSelectedTest] = useState<'bartle' | 'nickyee' | null>(null)
  const [expandedExercises, setExpandedExercises] = useState<Record<number, boolean>>({
    1: false,
    2: false,
    3: false,
    4: false,
    5: false,
  })
  const [expandedTasks, setExpandedTasks] = useState<Record<number, boolean>>({
    1: false,
    2: false,
  })

  const toggleExercise = (exerciseNum: number) => {
    setExpandedExercises(prev => ({
      ...prev,
      [exerciseNum]: !prev[exerciseNum],
    }))
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-gradient-to-br from-slate-800 to-slate-700 text-white py-12 px-4 text-center shadow-md relative">
        <Link to="/gamification" className="absolute top-4 left-4 text-slate-300 hover:text-white flex items-center gap-2 text-sm font-medium transition-colors">
          ← Zurück
        </Link>        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">Gamification</p>        <h1 className="text-4xl font-bold mb-2 tracking-tight">🎮 Gesellschaftsspiele entschlüsseln</h1>
        <p className="text-lg text-slate-300">Lerne Mechaniken und Strukturen von Gesellschaftsspielen</p>
      </header>

      <main className="flex-1 w-full max-w-6xl mx-auto p-12">
        <div className="bg-white rounded-2xl p-10 shadow-sm border border-slate-100">
          
          {/* Navigation Tabs */}
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
              Kostenlose Gesellschaftsspiele
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

          {/* Content */}
          {activeTab === 'aufgaben' && (
            <div>
              <h2 className="text-2xl font-semibold text-slate-900 mb-6">Aufgaben</h2>
              
              {/* Aufgabe 1 - Behind Button */}
              <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
                <button
                  onClick={() => setExpandedTasks(prev => ({
                    ...prev,
                    1: !prev[1],
                  }))}
                  className="w-full p-6 hover:bg-slate-100 transition-colors flex items-center justify-between"
                >
                  <div className="text-left">
                    <h3 className="text-lg font-semibold text-slate-900">
                      Spielmechaniken & typische Elemente entschlüsseln
                    </h3>
                    <p className="text-sm text-slate-600 mt-1">
                      Analysiere ein Gesellschaftsspiel und decke seine inneren Mechanismen auf
                    </p>
                  </div>
                  <span
                    className={`text-2xl transform transition-transform ${
                      expandedTasks[1] ? 'rotate-45' : ''
                    }`}
                  >
                    ➕
                  </span>
                </button>
                
                {expandedTasks[1] && (
                  <div className="px-6 pb-6 border-t border-slate-200">
                    <div className="prose prose-sm max-w-none text-slate-700">
                      <p className="mb-6 leading-relaxed">
                        Hallo zusammen, heute werdet ihr zu Spiele-Detektiven! Eure Aufgabe ist es, ein Gesellschaftsspiel genau unter die Lupe zu nehmen und seine inneren Mechanismen aufzudecken.
                      </p>

                      <h4 className="text-lg font-semibold text-slate-900 mt-6 mb-4">Arbeitsauftrag 1:</h4>

                      <div className="space-y-6">
                        <div>
                          <h5 className="font-semibold text-slate-900 mb-3">Schritt 1: Team & Spiel finden</h5>
                          <p className="mb-3 leading-relaxed">
                            Findet euch in einer Gruppe von 3-4 Personen zusammen. Wählt dann gemeinsam ein Spiel aus, das ihr analysieren wollt. Es sollte nicht zu simpel sein, damit wir auch etwas entdecken können. Ihr könnt entweder ein eigenes Spiel von zu Hause mitbringen oder eines aus der Sammlung in der Schule nutzen. Gute Beispiele sind:
                          </p>
                          <ul className="list-disc list-inside space-y-2 ml-2 text-slate-700">
                            <li>Die Siedler von Catan</li>
                            <li>Phase 10</li>
                            <li>Just One</li>
                            <li>Wizzard</li>
                            <li>Dominion</li>
                          </ul>
                        </div>

                        <div>
                          <h5 className="font-semibold text-slate-900 mb-3">Schritt 2: Spielen!</h5>
                          <p className="leading-relaxed">
                            Kennt ihr das Spiel noch nicht? Kein Problem! Lest euch die Anleitung durch oder schaut euch ein kurzes Erklärvideo auf YouTube an. Spielt danach mindestens 2-3 komplette Runden. Ihr habt dafür mehrere Unterrichtsstunden Zeit! Du kannst auch zwei unterschiedliche Spiele spielen.
                          </p>
                        </div>

                        <div>
                          <h5 className="font-semibold text-slate-900 mb-3">Schritt 3: Analysieren</h5>
                          <p className="leading-relaxed">
                            Wenn ihr mit dem Spielen fertig seid, füllt den digitalen Fragebogen gemeinsam aus. Du wirst dort auf Begriffe treffen, die du vorher noch nie gehört hast. Notiere diese inklusive einer Erklärung und beschreibe den Fachbegriff.
                          </p>
                          <button
                            onClick={() => setShowFragebogen(!showFragebogen)}
                            className="mt-4 inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                          >
                            <span className={`inline-block transform transition-transform ${showFragebogen ? 'rotate-45' : ''}`}>
                              ➕
                            </span>
                            {showFragebogen ? 'Fragebogen ausblenden' : 'Fragebogen ausfüllen'}
                          </button>

                          {showFragebogen && (
                            <div className="mt-6 bg-white rounded-lg border border-slate-300 p-6">
                              <FragebogenFormular />
                            </div>
                          )}
                        </div>

                        <div>
                          <h5 className="font-semibold text-slate-900 mb-3">Schritt 4: Abgeben</h5>
                          <p className="leading-relaxed">
                            Habt ihr alles ausgefüllt? Perfekt! Klickt auf die Schaltfläche am Ende der Seite, um eure Antworten als PDF zu speichern (meist über die Option "Als PDF drucken"). Schickt diese PDF-Datei anschließend per E-Mail oder über den BycS-Messenger an eure Lehrkraft.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Aufgabe 2 - Spieletyp Tests (Bartle & Nick Yee) */}
              <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden mt-6">
                <button
                  onClick={() => {
                    setExpandedTasks(prev => ({
                      ...prev,
                      2: !prev[2],
                    }))
                    setSelectedTest(null)
                  }}
                  className="w-full p-6 hover:bg-slate-100 transition-colors flex items-center justify-between"
                >
                  <div className="text-left">
                    <h3 className="text-lg font-semibold text-slate-900">
                      Welcher Spieletyp bist du? 🎮
                    </h3>
                    <p className="text-sm text-slate-600 mt-1">
                      Wähle einen der beiden Tests, um deinen Spielertyp zu entdecken
                    </p>
                  </div>
                  <span
                    className={`text-2xl transform transition-transform ${
                      expandedTasks[2] ? 'rotate-45' : ''
                    }`}
                  >
                    ➕
                  </span>
                </button>
                
                {expandedTasks[2] && (
                  <div className="px-6 pb-6 border-t border-slate-200">
                    {/* Test Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <button
                        onClick={() => setSelectedTest('bartle')}
                        className={`p-4 rounded-lg border-2 transition-all text-left font-semibold ${
                          selectedTest === 'bartle'
                            ? 'bg-blue-50 border-blue-500 text-blue-900'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <div className="text-2xl mb-2">🎭</div>
                        <div className="font-semibold">Bartle Player Type</div>
                        <div className="text-sm font-normal text-slate-600">20 Fragen • 3 Minuten</div>
                      </button>
                      <button
                        onClick={() => setSelectedTest('nickyee')}
                        className={`p-4 rounded-lg border-2 transition-all text-left font-semibold ${
                          selectedTest === 'nickyee'
                            ? 'bg-cyan-50 border-cyan-500 text-cyan-900'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <div className="text-2xl mb-2">🔬</div>
                        <div className="font-semibold">Nick Yee Gamer Profile</div>
                        <div className="text-sm font-normal text-slate-600">48 Fragen • 7 Minuten</div>
                      </button>
                    </div>

                    {/* Test Selection Info */}
                    {selectedTest && (
                      <div className="mb-6 p-4 bg-slate-100 rounded-lg border border-slate-300">
                        {selectedTest === 'bartle' && (
                          <p className="text-sm text-slate-700">
                            <strong>Bartle Player Type:</strong> Ein klassisches Modell mit 4 Spielertypen. Beantworte 20 Fragen und entdecke, welcher Typ du bist: Achiever, Explorer, Socializer oder Killer.
                          </p>
                        )}
                        {selectedTest === 'nickyee' && (
                          <p className="text-sm text-slate-700">
                            <strong>Nick Yee Gamer Motivation Profile:</strong> Ein detailliertes Modell mit 12 Motivationsdimensionen. Beantworte 48 Fragen und erhalte eine tiefgründige Analyse deiner Spielermotivationen.
                          </p>
                        )}
                      </div>
                    )}

                    {/* Render Selected Test */}
                    {selectedTest === 'bartle' && <BartleTest />}
                    {selectedTest === 'nickyee' && <NickYeeTest />}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'texte' && (
            <div>
              <h2 className="text-2xl font-semibold text-slate-900 mb-6">🎮 Digitale, kostenlose Gesellschaftsspiele</h2>
              <p className="text-slate-700 mb-8 leading-relaxed">
                Hier findest du eine Liste von beliebten Gesellschaftsspielen, die du online kostenlos spielen kannst. Ideal zum Kennenlernen von Spielmechaniken!
              </p>
              
              <div className="space-y-4">
                {/* Siedler von Catan */}
                <a
                  href="https://colonist.io/de"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border-2 border-blue-300 hover:shadow-lg transition-shadow cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-blue-900 mb-2">🏘️ Siedler von Catan</h3>
                      <p className="text-blue-800 mb-3">
                        Ein Klassiker! Baut Siedlungen, sammelt Rohstoffe und entwickelt eure Strategien. 
                        Das Spiel lehrt Ressourcen-Management und Verhandlungen.
                      </p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="bg-blue-200 text-blue-900 px-3 py-1 rounded-full font-semibold">2-4 Spieler</span>
                        <span className="text-blue-700">💰 Kostenlos</span>
                      </div>
                    </div>
                    <span className="text-3xl">→</span>
                  </div>
                </a>

                {/* Cascadia */}
                <a
                  href="https://cascadiagame.github.io/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-6 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border-2 border-green-300 hover:shadow-lg transition-shadow cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-green-900 mb-2">🌿 Cascadia</h3>
                      <p className="text-green-800 mb-3">
                        Ein entspannendes Tile-Placement Spiel über die Schönheit der Pazifik-Nordwestregion. 
                        Platziere Landschaften und Tiere strategisch für Punkte. Perfekt zum Lernen von Tile-Placement!
                      </p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="bg-green-200 text-green-900 px-3 py-1 rounded-full font-semibold">1-4 Spieler</span>
                        <span className="text-green-700">💰 Kostenlos</span>
                      </div>
                    </div>
                    <span className="text-3xl">→</span>
                  </div>
                </a>

                {/* Brettspielewelt */}
                <a
                  href="https://www.brettspielwelt.de/Spiele/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-6 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl border-2 border-purple-300 hover:shadow-lg transition-shadow cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-purple-900 mb-2">🎲 Brettspielewelt</h3>
                      <p className="text-purple-800 mb-3">
                        Eine riesige Auswahl verschiedenster Gesellschaftsspiele zum Online-Spielen! 
                        Von Klassikern bis zu modernen Spielen - hier findest du hunderte kostenlose Spiele.
                      </p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="bg-purple-200 text-purple-900 px-3 py-1 rounded-full font-semibold">Viele</span>
                        <span className="text-purple-700">💰 Kostenlos</span>
                      </div>
                    </div>
                    <span className="text-3xl">→</span>
                  </div>
                </a>

                {/* Weitere Spiele - Platzhalter */}
                <div className="p-6 bg-slate-50 rounded-xl border-2 border-slate-300">
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">🎲 Weitere beliebte Spiele</h3>
                  <p className="text-slate-700 mb-4">
                    Hier könnten weitere kostenlose Online-Spiele hinzugefügt werden, wie:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-slate-700">
                    <li><strong>Carcassonne</strong> - Tile-Placement Klassiker (Erweiterung des Lernens)</li>
                    <li><strong>Splendor</strong> - Hand-Management & Ressourcen-Sammlung</li>
                    <li><strong>7 Wonders</strong> - Zivilisations-Bau & Strategie</li>
                    <li><strong>Ticket to Ride</strong> - Netzwerk-Building & Planung</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'uebungen' && (
            <div>
              <h2 className="text-2xl font-semibold text-slate-900 mb-6">Praktische Übungen</h2>
              <div className="space-y-4">
                {/* Übung 1 */}
                <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
                  <button
                    onClick={() => toggleExercise(1)}
                    className="w-full p-6 hover:bg-slate-100 transition-colors flex items-center justify-between"
                  >
                    <div className="text-left">
                      <h3 className="text-lg font-semibold text-slate-900">
                        Übung 1: Fachbegriffe Zuordnen
                      </h3>
                      <p className="text-sm text-slate-600">
                        Ordne Begriffe zu Definitionen zu und meistere das Matching-Quiz
                      </p>
                    </div>
                    <span
                      className={`text-2xl transform transition-transform ${
                        expandedExercises[1] ? 'rotate-45' : ''
                      }`}
                    >
                      📋
                    </span>
                  </button>
                  {expandedExercises[1] && (
                    <div className="px-6 pb-6 border-t border-slate-200">
                      <Uebung1Matching />
                    </div>
                  )}
                </div>

                {/* Übung 2 */}
                <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
                  <button
                    onClick={() => toggleExercise(2)}
                    className="w-full p-6 hover:bg-slate-100 transition-colors flex items-center justify-between"
                  >
                    <div className="text-left">
                      <h3 className="text-lg font-semibold text-slate-900">
                        Übung 2: Mini-Digital-Spiele
                      </h3>
                      <p className="text-sm text-slate-600">
                        Erlebe Worker-Placement, Tile-Placement, Set-Collection und
                        Emotionen hautnah!
                      </p>
                    </div>
                    <span
                      className={`text-2xl transform transition-transform ${
                        expandedExercises[2] ? 'rotate-45' : ''
                      }`}
                    >
                      🎮
                    </span>
                  </button>
                  {expandedExercises[2] && (
                    <div className="px-6 pb-6 border-t border-slate-200">
                      <Uebung2MiniSpiele />
                    </div>
                  )}
                </div>

                {/* Übung 3 */}
                <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
                  <button
                    onClick={() => toggleExercise(3)}
                    className="w-full p-6 hover:bg-slate-100 transition-colors flex items-center justify-between"
                  >
                    <div className="text-left">
                      <h3 className="text-lg font-semibold text-slate-900">
                        Übung 3: 📊 Spiel-Analyse Projekt
                      </h3>
                      <p className="text-sm text-slate-600">
                        Analysiere ein Lieblingsspiel systematisch und erstelle deine eigene Spiel-Analyse
                      </p>
                    </div>
                    <span
                      className={`text-2xl transform transition-transform ${
                        expandedExercises[3] ? 'rotate-45' : ''
                      }`}
                    >
                      📊
                    </span>
                  </button>
                  {expandedExercises[3] && (
                    <div className="px-6 pb-6 border-t border-slate-200">
                      <Uebung3SpielAnalyse />
                    </div>
                  )}
                </div>

                {/* Übung 4 */}
                <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
                  <button
                    onClick={() => toggleExercise(4)}
                    className="w-full p-6 hover:bg-slate-100 transition-colors flex items-center justify-between"
                  >
                    <div className="text-left">
                      <h3 className="text-lg font-semibold text-slate-900">
                        Übung 4: 🔄 Mechaniken-Vergleich
                      </h3>
                      <p className="text-sm text-slate-600">
                        Vergleiche bis zu 3 Spiele und entdecke gemeinsame und unterschiedliche Mechaniken
                      </p>
                    </div>
                    <span
                      className={`text-2xl transform transition-transform ${
                        expandedExercises[4] ? 'rotate-45' : ''
                      }`}
                    >
                      ⚖️
                    </span>
                  </button>
                  {expandedExercises[4] && (
                    <div className="px-6 pb-6 border-t border-slate-200">
                      <Uebung4MechanikenVergleich />
                    </div>
                  )}
                </div>

                {/* Übung 5 */}
                <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
                  <button
                    onClick={() => toggleExercise(5)}
                    className="w-full p-6 hover:bg-slate-100 transition-colors flex items-center justify-between"
                  >
                    <div className="text-left">
                      <h3 className="text-lg font-semibold text-slate-900">
                        Übung 5: 🎨 Spiel-Design Challenge
                      </h3>
                      <p className="text-sm text-slate-600">
                        Entwirf dein eigenes Mini-Spiel mit 1-3 Mechaniken und teste es!
                      </p>
                    </div>
                    <span
                      className={`text-2xl transform transition-transform ${
                        expandedExercises[5] ? 'rotate-45' : ''
                      }`}
                    >
                      🎨
                    </span>
                  </button>
                  {expandedExercises[5] && (
                    <div className="px-6 pb-6 border-t border-slate-200">
                      <Uebung5SpielDesign />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

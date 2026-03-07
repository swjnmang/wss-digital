import { Link } from 'react-router-dom'
import { useState } from 'react'

export default function Lernspielen() {
  const [activeTab, setActiveTab] = useState('aufgaben')
  const [expandedAufgabe1, setExpandedAufgabe1] = useState(true)
  const [expandedAufgabe2, setExpandedAufgabe2] = useState(false)

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-gradient-to-br from-slate-800 to-slate-700 text-white py-12 px-4 text-center shadow-md relative">
        <Link to="/gamification" className="absolute top-4 left-4 text-slate-300 hover:text-white flex items-center gap-2 text-sm font-medium transition-colors">
          ← Zurück
        </Link>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">Gamification</p>
        <h1 className="text-4xl font-bold mb-2 tracking-tight">📚 Mit Lernspielen motivieren und fördern</h1>
        <p className="text-lg text-slate-300">Entdecke die Kraft von Lernspielen</p>
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
            <div className="space-y-8">
              {/* AUFGABE 1: Grundlagen der Motivationspsychologie */}
              <div className="bg-slate-50 rounded-xl border-2 border-slate-200 overflow-hidden">
                <button
                  onClick={() => setExpandedAufgabe1(!expandedAufgabe1)}
                  className="w-full p-6 hover:bg-slate-100 transition-colors flex items-center justify-between"
                >
                  <div className="text-left flex-1">
                    <h3 className="text-2xl font-bold text-slate-900">📋 Aufgabe 1: Grundlagen der Motivationspsychologie</h3>
                    <p className="text-slate-600 text-sm mt-2">Entdecke die Geheimisse menschlicher Motivation - Das Langeweile-Manifest</p>
                  </div>
                  <span className="text-3xl ml-4 transition-transform duration-300" style={{ transform: expandedAufgabe1 ? 'rotate(45deg)' : 'rotate(0deg)' }}>➕</span>
                </button>
                
                {expandedAufgabe1 && (
                <div className="px-8 py-6 border-t border-slate-200 bg-white space-y-6">
                  {/* Narrative Introduction */}
                  <div className="bg-slate-50 border-l-4 border-slate-400 p-6 rounded-lg">
                    <h4 className="text-lg font-bold text-slate-900 mb-4">📖 Die Geschichte: Das Langeweile-Manifest</h4>
                    <div className="bg-white p-4 rounded border border-slate-200 italic text-slate-700 space-y-3">
                      <p>
                        <strong>Szenario:</strong> Du hast gerade eine frustrierende Nachhilfestunde beendet und hast von Schule die Nase voll. Du verfasst einen geheimen Aufruf, das "Langeweile-Manifest", der nur an die vertrauenswürdigsten und kreativsten Mitschüler/innen (die "<strong>A-Tutor-League</strong>") verschickt wird.
                      </p>
                      <hr className="border-slate-200" />
                      <div className="bg-slate-50 p-3 rounded border border-slate-200">
                        <p className="font-semibold text-slate-900 mb-2">💌 Original-Botschaft von Alex an das Team (Auszug):</p>
                        <blockquote className="text-sm leading-relaxed">
                          „Liebe Mitstreiter, wir können so nicht weitermachen. Die aktuellen Arbeitsblätter und PowerPoints sind digitale Schlaftabletten! Unsere Mitschüler/innen verlieren das Interesse, bevor sie überhaupt angefangen haben zu lernen.
                          <br /><br />
                          Wenn wir das Fach retten wollen, müssen wir eine Revolution starten. Unser Ziel: Motivierenden Unterricht durch Gamification erschaffen. Wir sind die letzte Hoffnung.
                          <br /><br />
                          Wir starten die '<strong>A-Tutor-League</strong>' und unser erstes Projekt ist die Entwicklung von Lernspielen, die wirklich funktionieren. Wir müssen deshalb zunächst herausfinden, wie Motivation bei Menschen funktioniert."
                        </blockquote>
                      </div>
                    </div>
                  </div>

                  {/* Mission Brief */}
                  <div className="bg-slate-50 border-2 border-slate-300 p-6 rounded-lg">
                    <h4 className="text-lg font-bold text-slate-900 mb-3">🎯 Euer Auftrag</h4>
                    <p className="text-slate-700 mb-4">
                      Um funktionierende Lernspiele zu entwickeln, müsst ihr zunächst verstehen, wie menschliche Motivation funktioniert. Die <strong>A-Tutor-League</strong> hat euch daher einen Gruppenauftrag gegeben:
                    </p>
                    <div className="bg-white p-4 rounded border border-slate-200">
                      <ol className="space-y-2 text-slate-700">
                        <li className="flex gap-3">
                          <span className="font-bold text-slate-700">1.</span>
                          <span>Bildet <strong>5 Gruppen</strong> zu je 4-5 Personen</span>
                        </li>
                        <li className="flex gap-3">
                          <span className="font-bold text-slate-700">2.</span>
                          <span>Jede Gruppe wählt eines der 5 untenstehenden <strong>Motivations-Themen</strong></span>
                        </li>
                        <li className="flex gap-3">
                          <span className="font-bold text-slate-700">3.</span>
                          <span>Informiert euch gründlich über das Thema (nutzt die bereitgestellten Links & Texte)</span>
                        </li>
                        <li className="flex gap-3">
                          <span className="font-bold text-slate-700">4.</span>
                          <span>Erstellt eine <strong>10-15 Minuten</strong> Präsentation für die Klasse</span>
                        </li>
                        <li className="flex gap-3">
                          <span className="font-bold text-slate-700">5.</span>
                          <span>Erklärt, <strong>wie euer Konzept in Lernspielen angewendet werden kann</strong></span>
                        </li>
                      </ol>
                    </div>
                  </div>

                  {/* Group Topics */}
                  <div className="space-y-3">
                    <h4 className="text-lg font-bold text-slate-900">👥 Die 5 Gruppen und ihre Themen</h4>
                    <div className="grid gap-4">
                      {[
                        {
                          group: 'Gruppe 1',
                          title: 'Bedürfnispyramide nach Maslow',
                          emoji: '🔺',
                          desc: 'Wie beeinflussen Grundbedürfnisse, Sicherheit, Zugehörigkeit, Anerkennung und Selbstverwirklichung die Lernmotivation?',
                          color: 'blue',
                        },
                        {
                          group: 'Gruppe 2',
                          title: 'Klassische Konditionierung',
                          emoji: '🔔',
                          desc: 'Wie können wir durch gezielte Reize-Reaktions-Muster (wie Pavlovs Hunde) Lernende motivieren?',
                          color: 'purple',
                        },
                        {
                          group: 'Gruppe 3',
                          title: 'Flow-Theorie nach Csikszentmihalyi',
                          emoji: '🌊',
                          desc: 'Wie bringt man Lernende in einen Zustand vollständiger Hingabe, wo Zeit und Selbstzweifel vergessen sind?',
                          color: 'cyan',
                        },
                        {
                          group: 'Gruppe 4',
                          title: 'Intrinsische & Extrinsische Motivation',
                          emoji: '⚡',
                          desc: 'Welche Motivation ist nachhaltiger? Punkte und Noten vs. innere Zufriedenheit und Interessenspflege?',
                          color: 'amber',
                        },
                        {
                          group: 'Gruppe 5',
                          title: 'Belohnungssysteme im Gehirn',
                          emoji: '🎁',
                          desc: 'In unserem Gehirn gibt es ein Zentrum, das uns steuert: das Belohnungssystem. Es ist dafür da, dass wir Dinge wiederholen, die gut für uns sind (wie Essen oder Lernen). Der wichtigste Botenstoff dabei ist Dopamin.',
                          color: 'slate',
                        },
                      ].map((item, idx) => {
                        const colors = {
                          blue: 'bg-slate-50 border-slate-200',
                          purple: 'bg-slate-50 border-slate-200',
                          cyan: 'bg-slate-50 border-slate-200',
                          amber: 'bg-slate-50 border-slate-200',
                          rose: 'bg-slate-50 border-slate-200',
                          slate: 'bg-slate-50 border-slate-200',
                        }
                        return (
                          <div key={idx} className={`${colors[item.color as keyof typeof colors]} p-4 rounded-lg border-2`}>
                            <div className="flex gap-3">
                              <span className="text-3xl">{item.emoji}</span>
                              <div className="flex-1">
                                <div className="flex items-baseline gap-2 mb-1">
                                  <span className="font-bold text-slate-700">{item.group}</span>
                                  <span className="text-lg font-bold text-slate-900">{item.title}</span>
                                </div>
                                <p className="text-sm text-slate-700">{item.desc}</p>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Deliverables */}
                  <div className="bg-slate-50 border-2 border-slate-300 p-6 rounded-lg">
                    <h4 className="text-lg font-bold text-slate-900 mb-4">📊 Was muss präsentiert werden?</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-white p-4 rounded border border-slate-200">
                        <h5 className="font-bold text-slate-900 mb-2">Teil 1: Theorie (5-7 Min)</h5>
                        <ul className="text-sm text-slate-700 space-y-1">
                          <li>✓ Grundkonzepte & Definitionen</li>
                          <li>✓ Historischer Kontext & Erfinder</li>
                          <li>✓ Forschungsergebnisse & Belege</li>
                          <li>✓ Praktische Beispiele aus Alltag</li>
                        </ul>
                      </div>
                      <div className="bg-white p-4 rounded border border-orange-200">
                        <h5 className="font-bold text-slate-900 mb-2">Teil 2: Anwendung (5-8 Min)</h5>
                        <ul className="text-sm text-slate-700 space-y-1">
                          <li>✓ Wie würde man dies in einem Lernspiel nutzen?</li>
                          <li>✓ Wo genau könnte man es einbauen?</li>
                          <li>✓ Prototype/Mockup oder Beispiel-Gameplay</li>
                          <li>✓ Chancen & Risiken dieser Methode</li>
                        </ul>
                      </div>
                    </div>
                  </div>


                </div>
                )}
              </div>

              {/* AUFGABE 2: Experimente Durchführen */}
              <div className="bg-slate-50 rounded-xl border-2 border-slate-200 overflow-hidden">
                <button
                  onClick={() => setExpandedAufgabe2(!expandedAufgabe2)}
                  className="w-full p-6 hover:bg-slate-100 transition-colors flex items-center justify-between"
                >
                  <div className="text-left flex-1">
                    <h3 className="text-2xl font-bold text-slate-900">🧪 Aufgabe 2: Experimente Durchführen - Motivationstheorien</h3>
                    <p className="text-slate-600 text-sm mt-2">Führt Experimente durch und testet die Motivationstheorien in der Praxis</p>
                  </div>
                  <span className="text-3xl ml-4 transition-transform duration-300" style={{ transform: expandedAufgabe2 ? 'rotate(45deg)' : 'rotate(0deg)' }}>➕</span>
                </button>

                {expandedAufgabe2 && (
                <div className="px-8 py-6 border-t border-slate-200 bg-white space-y-6">
                  {/* Aufgabe 2 Introduction */}
                  <div className="bg-slate-50 border-l-4 border-slate-400 p-6 rounded-lg">
                    <h4 className="text-lg font-bold text-slate-900 mb-4">🔬 Theorie in die Praxis: Experiment durchführen</h4>
                    <p className="text-slate-700 mb-4">
                      Nachdem ihr die Motivationstheorien kennengelernt habt, ist es Zeit, diese <strong>selbst zu testen!</strong> Jede Gruppe wählt sich passende Experimente für ihr Thema aus, führt diese durch und dokumentiert die Ergebnisse.
                    </p>
                    <div className="bg-white p-4 rounded border border-slate-200">
                      <p className="font-semibold text-slate-900 mb-2">📋 Wie es funktioniert:</p>
                      <ol className="text-sm text-slate-700 space-y-1 list-decimal list-inside">
                        <li>Wähle 1-2 Experimente aus, die zu deinem Thema passen</li>
                        <li>Plane das Experiment (Material, Zeit, Teilnehmer)</li>
                        <li>Führe es durch und beobachte/dokumentiere genau</li>
                        <li>Präsentiere deine Erkenntnisse der Klasse</li>
                        <li>Erkläre, wie diese Erkenntnisse Lernspiele besser machen</li>
                      </ol>
                    </div>
                  </div>

                  {/* Experiment Groups */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-bold text-slate-900">📚 Experimente nach Thema</h4>
                    
                    {/* Maslow Experiments */}
                    <div className="bg-white border-2 border-slate-200 p-6 rounded-lg">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-3xl">🔺</span>
                        <h5 className="text-xl font-bold text-slate-900">Bedürfnispyramide nach Maslow</h5>
                      </div>
                      <div className="space-y-3 text-slate-700">
                        <div className="bg-slate-50 p-3 rounded border border-slate-200">
                          <p className="font-semibold mb-1">💡 Experiment 1: Die "Insel-Challenge"</p>
                          <p className="text-sm">Stellt euch vor, ihr strandet auf einer einsamen Insel. In welcher Reihenfolge würdet ihr eure Probleme lösen? Deckt sich das mit Maslows Pyramide? Fragt mehrere Personen und vergleicht die Antworten.</p>
                        </div>
                        <div className="bg-slate-50 p-3 rounded border border-slate-200">
                          <p className="font-semibold mb-1">💡 Experiment 2: Werbung analysieren</p>
                          <p className="text-sm">Sucht euch ein bekanntes Produkt (z. B. ein teures Auto oder ein Parfüm). Welche Stufe der Pyramide versucht die Werbung anzusprechen? Analysiert mindestens 3 Werbungen.</p>
                        </div>
                        <div className="bg-slate-50 p-3 rounded border border-slate-200">
                          <p className="font-semibold mb-1">💡 Experiment 3: Kultur-Check</p>
                          <p className="text-sm">Glaubt ihr, die Pyramide sieht in einer armen Region der Welt genauso aus wie in einer reichen Stadt? Recherchiert und diskutiert eure Hypothesen.</p>
                        </div>
                        <div className="bg-slate-50 p-3 rounded border border-slate-200">
                          <p className="font-semibold mb-1">💡 Experiment 4: Schul-Check</p>
                          <p className="text-sm">Auf welcher Stufe befindet ihr euch meistens, wenn ihr im Klassenzimmer sitzt? Macht eine kurze Umfrage unter Mitschülern.</p>
                        </div>
                      </div>
                    </div>

                    {/* Classical Conditioning Experiments */}
                    <div className="bg-white border-2 border-slate-200 p-6 rounded-lg">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-3xl">🔔</span>
                        <h5 className="text-xl font-bold text-slate-900">Klassische Konditionierung</h5>
                      </div>
                      <div className="space-y-3 text-slate-700">
                        <div className="bg-slate-50 p-3 rounded border border-slate-200">
                          <p className="font-semibold mb-1">💡 Experiment 1: Das "Zitronen-Experiment"</p>
                          <p className="text-sm">Stellt euch vor, ihr beißt in eine gelbe, saure Zitrone. Der Saft läuft in euren Mund. Was passiert gerade mit eurem Speichelfluss? Erklärt, warum allein der Gedanke daran eine Reaktion auslöst und testet das bei anderen.</p>
                        </div>
                        <div className="bg-slate-50 p-3 rounded border border-slate-200">
                          <p className="font-semibold mb-1">💡 Experiment 2: Konditionierung im Sport</p>
                          <p className="text-sm">Warum tragen Profisportler oft "Glücksbringer" oder haben feste Rituale vor dem Spiel? Ist das eine Art Konditionierung? Interviewt Sportler und Trainer.</p>
                        </div>
                        <div className="bg-slate-50 p-3 rounded border border-slate-200">
                          <p className="font-semibold mb-1">💡 Experiment 3: Medien & Töne</p>
                          <p className="text-sm">Warum greifen viele Menschen sofort zum Handy, wenn es "Pling" macht, selbst wenn sie gerade mitten im Gespräch sind? Beobachtet diesen Reflex bei euren Mitschülern.</p>
                        </div>
                        <div className="bg-slate-50 p-3 rounded border border-slate-200">
                          <p className="font-semibold mb-1">💡 Experiment 4: Gegen-Konditionierung</p>
                          <p className="text-sm">Wie könnte man jemandem die Angst vor Spinnen "verlernen"? Entwerft einen praktischen Plan basierend auf klassischer Konditionierung.</p>
                        </div>
                      </div>
                    </div>

                    {/* Flow Theory Experiments */}
                    <div className="bg-white border-2 border-slate-200 p-6 rounded-lg">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-3xl">🌊</span>
                        <h5 className="text-xl font-bold text-slate-900">Die Flow-Theorie</h5>
                      </div>
                      <div className="space-y-3 text-slate-700">
                        <div className="bg-slate-50 p-3 rounded border border-slate-200">
                          <p className="font-semibold mb-1">💡 Experiment 1: Flow-Killer finden</p>
                          <p className="text-sm">Was sind die größten Feinde des Flow-Zustands in eurem Zimmer oder im Unterricht? (z. B. Handy, Lärm, Unterbrechungen). Erstellt eine Top-5-Liste.</p>
                        </div>
                        <div className="bg-slate-50 p-3 rounded border border-slate-200">
                          <p className="font-semibold mb-1">💡 Experiment 2: Die Grafik-Aufgabe</p>
                          <p className="text-sm">Zeichnet ein Diagramm mit den Achsen "Angst", "Langeweile" und "Flow". Wo landet man, wenn man ein Videospiel auf dem Level "Einfach" spielt, obwohl man Profi ist? Testet das mit verschiedenen Spielern.</p>
                        </div>
                        <div className="bg-slate-50 p-3 rounded border border-slate-200">
                          <p className="font-semibold mb-1">💡 Experiment 3: Flow in der Gruppe</p>
                          <p className="text-sm">Kann eine ganze Band oder eine Fußballmannschaft gleichzeitig im Flow sein? Wie fühlt sich das an? Interviewt Musiker/innen oder Sportler/innen.</p>
                        </div>
                        <div className="bg-slate-50 p-3 rounded border border-slate-200">
                          <p className="font-semibold mb-1">💡 Experiment 4: Tipps für Lehrer</p>
                          <p className="text-sm">Schreibt drei konkrete Tipps auf, wie ein Lehrer eine Aufgabe stellen muss, damit die Chance auf Flow steigt. Testet diese in echten Klassen-Situationen.</p>
                        </div>
                      </div>
                    </div>

                    {/* Intrinsic/Extrinsic Motivation Experiments */}
                    <div className="bg-white border-2 border-slate-200 p-6 rounded-lg">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-3xl">⚡</span>
                        <h5 className="text-xl font-bold text-slate-900">Intrinsische & Extrinsische Motivation</h5>
                      </div>
                      <div className="space-y-3 text-slate-700">
                        <div className="bg-slate-50 p-3 rounded border border-slate-200">
                          <p className="font-semibold mb-1">💡 Experiment 1: Das "Profi-Dilemma"</p>
                          <p className="text-sm">Ein leidenschaftlicher Gamer wird dafür bezahlt, 10 Stunden am Tag ein bestimmtes Spiel zu spielen. Bleibt seine Motivation intrinsisch? Diskutiert und recherchiert Real-Life-Beispiele (z.B. Esports-Profis).</p>
                        </div>
                        <div className="bg-slate-50 p-3 rounded border border-slate-200">
                          <p className="font-semibold mb-1">💡 Experiment 2: Noten-Debatte</p>
                          <p className="text-sm">Wärt ihr noch motiviert zu lernen, wenn es ab morgen keine Noten mehr gäbe, sondern nur noch Feedback-Gespräche? Führt eine Klassendiskussion durch und dokumentiert die Ergebnisse.</p>
                        </div>
                        <div className="bg-slate-50 p-3 rounded border border-slate-200">
                          <p className="font-semibold mb-1">💡 Experiment 3: Die "Superkraft"</p>
                          <p className="text-sm">Wenn ihr euch aussuchen könntet, für ein Schulfach plötzlich intrinsisch motiviert zu sein – welches wäre das und was würde sich in eurem Leben ändern? Umfrage bei mehreren Schülern.</p>
                        </div>
                        <div className="bg-slate-50 p-3 rounded border border-slate-200">
                          <p className="font-semibold mb-1">💡 Experiment 4: Motivation mischen</p>
                          <p className="text-sm">Kann man eine Aufgabe extrinsisch starten (z. B. Hausaufgaben für Belohnung) und dann intrinsisch beenden? Testet den Wechsel im realen Schulalltag.</p>
                        </div>
                      </div>
                    </div>

                    {/* Reward System Experiments */}
                    <div className="bg-white border-2 border-slate-200 p-6 rounded-lg">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-3xl">🎁</span>
                        <h5 className="text-xl font-bold text-slate-900">Belohnungssysteme im Gehirn</h5>
                      </div>
                      <div className="space-y-3 text-slate-700">
                        <div className="bg-slate-50 p-3 rounded border border-slate-200">
                          <p className="font-semibold mb-1">💡 Experiment 1: Der "Social Media Check"</p>
                          <p className="text-sm">Warum gibt es bei Instagram kein "Ende" beim Scrollen? Wie nutzt das Design unser Dopamin aus? Analysiert die Mechaniken und macht ein Poster darüber.</p>
                        </div>
                        <div className="bg-slate-50 p-3 rounded border border-slate-200">
                          <p className="font-semibold mb-1">💡 Experiment 2: Dopamin-Fasten</p>
                          <p className="text-sm">Was würde passieren, wenn ihr 24 Stunden auf alle schnellen Belohnungen (Handy, Zucker, Gaming) verzichtet? Wie würde sich euer Gehirn nach 5 Stunden anfühlen? Dokumentiert das Experiment.</p>
                        </div>
                        <div className="bg-slate-50 p-3 rounded border border-slate-200">
                          <p className="font-semibold mb-1">💡 Experiment 3: Erfolgstagebuch</p>
                          <p className="text-sm">Warum fühlt es sich gut an, Aufgaben auf einer Liste abzuhaken? Erklärt den biologischen Grund dahinter und testet das mit der Klasse (Dopamin-Freisetzung durch kleine Siege).</p>
                        </div>
                        <div className="bg-slate-50 p-3 rounded border border-slate-200">
                          <p className="font-semibold mb-1">💡 Experiment 4: Gefährliche Belohnung</p>
                          <p className="text-sm">Erklärt den Unterschied zwischen einer "gesunden" Belohnung (z. B. Stolz nach dem Sport) und einer "künstlichen" Belohnung (z. B. Glücksspiel). Fallstudien sammeln und analysieren.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Deliverables for Task 2 */}
                  <div className="bg-slate-50 border-2 border-slate-300 p-6 rounded-lg">
                    <h4 className="text-lg font-bold text-slate-900 mb-4">📊 Was muss abgegeben werden?</h4>
                    <div className="space-y-3">
                      <div className="bg-white p-4 rounded border border-slate-200">
                        <h5 className="font-bold text-slate-900 mb-2">📝 Experiment-Dokumentation</h5>
                        <ul className="text-sm text-slate-700 space-y-1">
                          <li>✓ Gewählte Experimente (1-2 pro Gruppe)</li>
                          <li>✓ Hypothesis & Vorbereitungsplan</li>
                          <li>✓ Durchführung (Foto/Video, wenn möglich)</li>
                          <li>✓ Dokumentierte Beobachtungen & Ergebnisse</li>
                          <li>✓ Verbindung zur Theorie erklären</li>
                        </ul>
                      </div>
                      <div className="bg-white p-4 rounded border border-slate-200">
                        <h5 className="font-bold text-slate-900 mb-2">🎮 Gamification-Anwendung</h5>
                        <ul className="text-sm text-slate-700 space-y-1">
                          <li>✓ Wie könnte man diese Erkenntnisse in Lernspielen nutzen?</li>
                          <li>✓ Konkrete Beispiele & Ideen für Game-Mechaniken</li>
                          <li>✓ Wie helfen eure Erkenntnisse, bessere Lernerfahrungen zu schaffen?</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'texte' && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">📚 Lernmaterialien für jedes Thema</h2>
              
              {/* Maslow */}
              <div className="bg-slate-50 border-2 border-slate-300 p-6 rounded-lg">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">🔺</span>
                  <h3 className="text-2xl font-bold text-slate-900">Bedürfnispyramide nach Maslow</h3>
                </div>
                <div className="bg-white p-4 rounded border border-slate-200 space-y-3 text-slate-700">
                  <p><strong>Kernidee:</strong> Menschen werden motiviert durch ein Hierarchie von Bedürfnissen - von physischen Grundbedürfnissen bis hin zu Selbstverwirklichung.</p>
                  <div className="space-y-2">
                    <p className="font-semibold">📖 Ressourcen:</p>
                    <ul className="space-y-1 text-sm">
                      <li>🎥 <a href="https://youtu.be/O-4XJlH5zQ4" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Video: Maslows Pyramid Explained (englisch)</a></li>
                      <li>📄 Artikel: Physiologische, Sicherheits-, Soziale-, Anerkennungs- & Selbstverwirklichungsbedürfnisse</li>
                      <li>💡 Wie könnte man Level-Up-Systeme mit Maslows Pyramide verbinden?</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Klassische Konditionierung */}
              <div className="bg-slate-50 border-2 border-slate-300 p-6 rounded-lg">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">🔔</span>
                  <h3 className="text-2xl font-bold text-slate-900">Klassische Konditionierung</h3>
                </div>
                <div className="bg-white p-4 rounded border border-slate-200 space-y-3 text-slate-700">
                  <p><strong>Kernidee:</strong> Wenn man einen neutralen Reiz (z.B. einen Sound) wiederholt mit einem positiven Event (Belohnung) koppelt, beginnt man diese zu assoziieren.</p>
                  <div className="space-y-2">
                    <p className="font-semibold">📖 Ressourcen:</p>
                    <ul className="space-y-1 text-sm">
                      <li>🎥 <a href="https://youtu.be/rrKvFeW43K0" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Video: Pavlovs Dogs - Classic Conditioning Explained</a></li>
                      <li>📄 Pavlov, Watson & moderne Anwendungen in Gamification</li>
                      <li>💡 Sound-Design in Spielen: Warum das ding-Sound beim Achievement so motivierend wirkt</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Flow-Theorie */}
              <div className="bg-slate-50 border-2 border-slate-300 p-6 rounded-lg">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">🌊</span>
                  <h3 className="text-2xl font-bold text-slate-900">Flow-Theorie nach Csikszentmihalyi</h3>
                </div>
                <div className="bg-white p-4 rounded border border-slate-200 space-y-3 text-slate-700">
                  <p><strong>Kernidee:</strong> Flow ist der optimale Zustand von Konzentration und Problemlösung - wenn Herausforderung und Fähigkeit perfekt ausbalanciert sind.</p>
                  <div className="space-y-2">
                    <p className="font-semibold">📖 Ressourcen:</p>
                    <ul className="space-y-1 text-sm">
                      <li>🎥 <a href="https://youtu.be/fXIeFJCqsPs" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">TED Talk: Mihaly Csikszentmihalyi - Flow</a></li>
                      <li>📄 Die 9 Flow-Merkmale: Challenge, Skill, Clear Goals, Feedback, Concentration...</li>
                      <li>💡 Level-Design in Spielen: Wie man Progressive Difficulty für Flow nutzt</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Intrinsische vs. Extrinsische Motivation */}
              <div className="bg-slate-50 border-2 border-slate-300 p-6 rounded-lg">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">⚡</span>
                  <h3 className="text-2xl font-bold text-slate-900">Intrinsische & Extrinsische Motivation</h3>
                </div>
                <div className="bg-white p-4 rounded border border-slate-200 space-y-3 text-slate-700">
                  <p><strong>Kernidee:</strong> Intrinsische Motivation (innere Antriebe) ist nachhaltiger als extrinsische (äußere Belohnungen wie Noten).</p>
                  <div className="space-y-2">
                    <p className="font-semibold">📖 Ressourcen:</p>
                    <ul className="space-y-1 text-sm">
                      <li>🎥 <a href="https://youtu.be/u6XAPnuFjJc" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">TED Talk: Daniel Pink - The Puzzle of Motivation</a></li>
                      <li>📄 Deci & Ryan Selbstbestimmungstheorie (SDT): Autonomy, Competence, Relatedness</li>
                      <li>💡 Warum Punkte allein nicht motivieren - Die Rolle von inneren Werten</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Belohnungssysteme */}
              <div className="bg-slate-50 border-2 border-slate-300 p-6 rounded-lg">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">🎁</span>
                  <h3 className="text-2xl font-bold text-slate-900">Belohnungssysteme im Gehirn</h3>
                </div>
                <div className="bg-white p-4 rounded border border-slate-200 space-y-3 text-slate-700">
                  <p><strong>Kernidee:</strong> In unserem Gehirn gibt es ein Zentrum, das uns steuert: das Belohnungssystem. Es ist dafür da, dass wir Dinge wiederholen, die gut für uns sind. Der wichtigste Botenstoff dabei ist Dopamin.</p>
                  <div className="space-y-2">
                    <p className="font-semibold">📖 Ressourcen:</p>
                    <ul className="space-y-1 text-sm">
                      <li>🎥 <a href="https://youtu.be/VrDiAg4ZdoM" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Video: Das Dopamin-System im Gehirn</a></li>
                      <li>📄 Nucleus Accumbens, Dopamin-Rezeptoren und ihre Rolle bei Motivation & Lernen</li>
                      <li>💡 Wie man Dopamin-Freisetzung in Lernspielen nutzt: Progression, Rewards und Feedback-Loops</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* General Tips */}
              <div className="bg-slate-100 border-2 border-slate-300 p-6 rounded-lg">
                <h4 className="text-lg font-bold text-slate-900 mb-3">💡 Recherche-Tipps</h4>
                <ul className="space-y-2 text-sm text-slate-700">
                  <li>✓ Nutzt die Schulbibliothek für Psychologie-Fachliteratur</li>
                  <li>✓ Google Scholar (scholar.google.com) für kostenlose Forschungsartikel</li>
                  <li>✓ YouTube: Suche nach "Motivation Psychology" oder deinem spezifischen Tema</li>
                  <li>✓ Respektiert Urheberrechte! Zitiert korrekt!</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'uebungen' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Praktische Übungen</h2>
              <p className="text-slate-700 mb-6">Hier kannst du dein Wissen über Motivationspsychologie in praktischen Szenarien testen und anwenden.</p>
              
              <div className="grid gap-4">
                {[
                  { title: 'Szenario-Analyse', desc: 'Analysiere ein bestehendes Lernspiel und identifiziere welche Motivationskonzepte dort eingebaut sind.' },
                  { title: 'Lernspiel-Prototyp', desc: 'Entwerfe einen Prototyp für ein Lernspiel basierend auf einer der 5 Motivationstheorien.' },
                ].map((ex, idx) => (
                  <div key={idx} className="bg-gradient-to-r from-slate-50 to-slate-100 border-2 border-slate-300 rounded-lg p-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{ex.title}</h3>
                    <p className="text-slate-700 mb-4">{ex.desc}</p>
                    <button className="py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium text-sm transition-colors">
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

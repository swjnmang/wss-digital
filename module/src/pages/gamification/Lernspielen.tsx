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
                    <h4 className="text-lg font-bold text-slate-900">📚 Experimente & Reflexionsfragen nach Thema</h4>
                    
                    {/* Maslow Experiments */}
                    <div className="bg-white border-2 border-slate-200 p-6 rounded-lg">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-3xl">🔺</span>
                        <h5 className="text-xl font-bold text-slate-900">Bedürfnispyramide nach Maslow</h5>
                      </div>
                      
                      <div className="space-y-4">
                        {/* Experiments */}
                        <div>
                          <p className="font-semibold text-slate-900 mb-2">🧪 Echte Experimente:</p>
                          <div className="space-y-2 text-slate-700">
                            <div className="bg-blue-50 p-3 rounded border border-blue-200">
                              <p className="font-semibold mb-1">Experiment 1: "Bedürfnis-Ranking unter Druck"</p>
                              <p className="text-sm"><strong>Hypothese:</strong> Unter Druck priorisieren Menschen zuerst Sicherheitsbedürfnisse über Selbstverwirklichung.</p>
                              <p className="text-sm"><strong>Methode:</strong> Zeige 20 Schülern Listen von verschiedenen Bedürfnissen. Lass sie in 3 Szenarien sortieren: (1) Normal, (2) Stresstest (Lärm, Zeitdruck), (3) Sicherheitsbedrohung. Dokumentiere die Unterschiede.</p>
                            </div>
                            <div className="bg-blue-50 p-3 rounded border border-blue-200">
                              <p className="font-semibold mb-1">Experiment 2: "Hunger vs. Konzentration"</p>
                              <p className="text-sm"><strong>Hypothese:</strong> Hungrige Schüler können sich weniger auf komplexe Aufgaben konzentrieren.</p>
                              <p className="text-sm"><strong>Methode:</strong> Teile eine Gruppe: Hälfte bekommt Snack, Hälfte nicht. Beide lösen dieselbe Aufgabe. Messung: Fehlerquote, Bearbeitungszeit, Zufriedenheit.</p>
                            </div>
                          </div>
                        </div>

                        {/* Reflection Questions */}
                        <div className="border-t pt-4">
                          <p className="font-semibold text-slate-900 mb-2">🤔 Reflexionsfragen:</p>
                          <ul className="space-y-1 text-sm text-slate-700 list-disc list-inside">
                            <li>Auf welcher Stufe der Pyramide bewegen wir uns im Klassenzimmer normalerweise?</li>
                            <li>Warum versuchen Luxusmarken, auf den oberen Stufen anzusprechen?</li>
                            <li>Ist Maslows Pyramide in allen Kulturen gleich gültig?</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Classical Conditioning Experiments */}
                    <div className="bg-white border-2 border-slate-200 p-6 rounded-lg">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-3xl">🔔</span>
                        <h5 className="text-xl font-bold text-slate-900">Klassische Konditionierung</h5>
                      </div>

                      <div className="space-y-4">
                        {/* Experiments */}
                        <div>
                          <p className="font-semibold text-slate-900 mb-2">🧪 Echte Experimente:</p>
                          <div className="space-y-2 text-slate-700">
                            <div className="bg-purple-50 p-3 rounded border border-purple-200">
                              <p className="font-semibold mb-1">Experiment 1: "Sound-Konditionierung"</p>
                              <p className="text-sm"><strong>Hypothese:</strong> Nach mehreren Wiederholungen löst der Ton allein bereits Freude aus.</p>
                              <p className="text-sm"><strong>Methode:</strong> Spiel einen Ton (z.B. Glocke) ab, gefolgt von etwas Positivem (Süßigkeit/Lob). 10x wiederholen. Dann: Spiel nur noch den Ton - misst die emotionale & körperliche Reaktion (Lächeln, Pupillenreaktion, etc.).</p>
                            </div>
                            <div className="bg-purple-50 p-3 rounded border border-purple-200">
                              <p className="font-semibold mb-1">Experiment 2: "Reflex-Reaktionszeit"</p>
                              <p className="text-sm"><strong>Hypothese:</strong> Konditionierte Handy-Nutzer reagieren schneller auf "Pling"-Töne als auf andere Reize.</p>
                              <p className="text-sm"><strong>Methode:</strong> Messung der Reaktionszeit von 15 Schülern auf verschiedene Töne (Handy-Benachrichtigung, andere Sounds). Vergleiche mit ihrer durchschnittlichen Handy-Nutzung/Tag.</p>
                            </div>
                          </div>
                        </div>

                        {/* Reflection Questions */}
                        <div className="border-t pt-4">
                          <p className="font-semibold text-slate-900 mb-2">🤔 Reflexionsfragen:</p>
                          <ul className="space-y-1 text-sm text-slate-700 list-disc list-inside">
                            <li>Warum sind Glücksbringer von Sportlern eine Form der Konditionierung?</li>
                            <li>Wie können wir negative Konditionierungen (z.B. Angst vor Tests) durch positive ersetzen?</li>
                            <li>Nutzen Videospiele klassische Konditionierung mit ihren Sound-Designs?</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Flow Theory Experiments */}
                    <div className="bg-white border-2 border-slate-200 p-6 rounded-lg">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-3xl">🌊</span>
                        <h5 className="text-xl font-bold text-slate-900">Die Flow-Theorie</h5>
                      </div>

                      <div className="space-y-4">
                        {/* Experiments */}
                        <div>
                          <p className="font-semibold text-slate-900 mb-2">🧪 Echte Experimente:</p>
                          <div className="space-y-2 text-slate-700">
                            <div className="bg-cyan-50 p-3 rounded border border-cyan-200">
                              <p className="font-semibold mb-1">Experiment 1: "Challenge-Skill-Balance"</p>
                              <p className="text-sm"><strong>Hypothese:</strong> Schüler sind am meisten fokussiert, wenn Challenge und Skill perfekt ausbalanciert sind - nicht zu einfach, nicht zu schwer.</p>
                              <p className="text-sm"><strong>Methode:</strong> Schüler lösen Aufgaben mit 3 Schwierigkeitsgraden. Messung: Fokus-Zeit, Fehlerquote, Subjektive "Flow"-Bewertung (1-10). Finde den Balance-Punkt.</p>
                            </div>
                            <div className="bg-cyan-50 p-3 rounded border border-cyan-200">
                              <p className="font-semibold mb-1">Experiment 2: "Zeitverzerrung im Flow"</p>
                              <p className="text-sm"><strong>Hypothese:</strong> Im Flow-Zustand nehmen Menschen Zeit als schneller vergehend wahr (Minuten fühlen sich wie Sekunden an).</p>
                              <p className="text-sm"><strong>Methode:</strong> Schüler arbeiten 15 Min an einer Aufgabe im Flow-Zustand. Dann: Schätzen, wie lange sie gearbeitet haben. Vergleich: Schätzung vs. Realität.</p>
                            </div>
                          </div>
                        </div>

                        {/* Reflection Questions */}
                        <div className="border-t pt-4">
                          <p className="font-semibold text-slate-900 mb-2">🤔 Reflexionsfragen:</p>
                          <ul className="space-y-1 text-sm text-slate-700 list-disc list-inside">
                            <li>Was sind die größten Flow-Killer im Klassenzimmer?</li>
                            <li>Wie kann ein Lehrer Aufgaben so gestalten, dass Flow wahrscheinlicher wird?</li>
                            <li>Gibt es den Flow-Zustand auch in Gruppen oder nur im Einzelgehen?</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Intrinsic/Extrinsic Motivation Experiments */}
                    <div className="bg-white border-2 border-slate-200 p-6 rounded-lg">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-3xl">⚡</span>
                        <h5 className="text-xl font-bold text-slate-900">Intrinsische & Extrinsische Motivation</h5>
                      </div>

                      <div className="space-y-4">
                        {/* Experiments */}
                        <div>
                          <p className="font-semibold text-slate-900 mb-2">🧪 Echte Experimente:</p>
                          <div className="space-y-2 text-slate-700">
                            <div className="bg-amber-50 p-3 rounded border border-amber-200">
                              <p className="font-semibold mb-1">Experiment 1: "Rewards-Paradox"</p>
                              <p className="text-sm"><strong>Hypothese:</strong> Externe Belohnungen können intrinsische Motivation unterminieren (Overjustification-Effekt).</p>
                              <p className="text-sm"><strong>Methode:</strong> Gruppe A: Aufgabe mit Belohnung versprochen. Gruppe B: Gleiche Aufgabe, keine Belohnung. Danach: Beide Gruppen können freiwillig weitermachen. Messung: Wie lange macht jede Gruppe freiwillig weiter?</p>
                            </div>
                            <div className="bg-amber-50 p-3 rounded border border-amber-200">
                              <p className="font-semibold mb-1">Experiment 2: "Autonomie & Intrinsik"</p>
                              <p className="text-sm"><strong>Hypothese:</strong> Schüler mit Wahlmöglichkeit arbeiten intrinsisch motivierter, auch bei gleicher Aufgabe.</p>
                              <p className="text-sm"><strong>Methode:</strong> Gruppe A: Aufgabe vorgegeben. Gruppe B: Aufgabe gewählt. Messung: Qualität der Arbeit, Engagement, Freude, Zeiteinsatz.</p>
                            </div>
                          </div>
                        </div>

                        {/* Reflection Questions */}
                        <div className="border-t pt-4">
                          <p className="font-semibold text-slate-900 mb-2">🤔 Reflexionsfragen:</p>
                          <ul className="space-y-1 text-sm text-slate-700 list-disc list-inside">
                            <li>Warum kann eine Note die intrinsische Motivation zu lernen zerstören?</li>
                            <li>Gibt es Unterschiede zwischen verschiedenen Arten von Belohnungen (materielle vs. soziale)?</li>
                            <li>Wie können Lehrer Schüler von extrinsisch zu intrinsischer Motivation führen?</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Reward System Experiments */}
                    <div className="bg-white border-2 border-slate-200 p-6 rounded-lg">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-3xl">🎁</span>
                        <h5 className="text-xl font-bold text-slate-900">Belohnungssysteme im Gehirn</h5>
                      </div>

                      <div className="space-y-4">
                        {/* Experiments */}
                        <div>
                          <p className="font-semibold text-slate-900 mb-2">🧪 Echte Experimente:</p>
                          <div className="space-y-2 text-slate-700">
                            <div className="bg-rose-50 p-3 rounded border border-rose-200">
                              <p className="font-semibold mb-1">Experiment 1: "Variable Ratio Schedule"</p>
                              <p className="text-sm"><strong>Hypothese:</strong> Unvorhersehbare Belohnungen sind süchtiger machend als regelmäßige (wie beim Glücksspiel).</p>
                              <p className="text-sm"><strong>Methode:</strong> Schüler spielen ein einfaches Spiel mit 3 Bedingungen: (1) Jeder Sieg = Punkt, (2) Zufällige Belohnungen, (3) Keine Belohnungen. Messung: Wie lange spielen sie jeweils? (Immer freiwillig).</p>
                            </div>
                            <div className="bg-rose-50 p-3 rounded border border-rose-200">
                              <p className="font-semibold mb-1">Experiment 2: "Dopamin-Timing"</p>
                              <p className="text-sm"><strong>Hypothese:</strong> Sofortige Belohnungen führen zu mehr Wiederholungen als verzögerte Belohnungen.</p>
                              <p className="text-sm"><strong>Methode:</strong> Gruppe A: Aufgabe lösen → sofort Belohnung. Gruppe B: Aufgabe lösen → Belohnung nach 1 Woche. Messung: Wie viele Aufgaben absolviert jede Gruppe freiwillig?</p>
                            </div>
                          </div>
                        </div>

                        {/* Reflection Questions */}
                        <div className="border-t pt-4">
                          <p className="font-semibold text-slate-900 mb-2">🤔 Reflexionsfragen:</p>
                          <ul className="space-y-1 text-sm text-slate-700 list-disc list-inside">
                            <li>Warum ist Social Media so süchtig machend? Welche Dopamin-Mechaniken nutzen sie?</li>
                            <li>Ist es ethisch vertretbar, Game-Mechaniken zur Suchtförderung zu nutzen? Gibt es Grenzen?</li>
                            <li>Wie unterscheidet sich eine "gute" Belohnung (Lernspiel) von einer "schädlichen" (Glücksspiel)?</li>
                          </ul>
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

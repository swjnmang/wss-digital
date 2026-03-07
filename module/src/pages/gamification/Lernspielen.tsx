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
                          <p className="font-semibold text-slate-900 mb-2">🧪 Wähle eines dieser 4 Experimente:</p>
                          <div className="space-y-3 text-slate-700">
                            <div className="bg-blue-50 p-4 rounded border border-blue-200">
                              <p className="font-semibold mb-2">Experiment 1: Die "Insel-Challenge"</p>
                              <div className="text-sm space-y-2">
                                <p><strong>Vorbereitung:</strong> 10-15 Minuten, kleine Gruppenarbeit</p>
                                <p><strong>Anleitung:</strong> Schreibe diese Situation auf: "Ihr strandet auf einer einsamen Insel. Es gibt kein Essen, kein Wasser, kein Dach. Es ist kalt. Es gibt aber Werkzeuge und Material." Lass deine Klasse (oder 10-15 Personen) in Gruppen die Probleme in der Reihenfolge aufschreiben, in der sie sie lösen würden.</p>
                                <p><strong>Dokumentation:</strong> Schreibe auf: In welcher Reihenfolge haben sie Probleme gelöst? Vergleiche mit Maslows Pyramide (Physische Bedürfnisse → Sicherheit → Zugehörigkeit → Anerkennung → Selbstverwirklichung).</p>
                                <p><strong>Erkenntnis:</strong> Folgt die Praxis Maslows Theorie oder nicht?</p>
                              </div>
                            </div>
                            <div className="bg-blue-50 p-4 rounded border border-blue-200">
                              <p className="font-semibold mb-2">Experiment 2: Werbung analysieren</p>
                              <div className="text-sm space-y-2">
                                <p><strong>Vorbereitung:</strong> 3-4 Werbespots oder Anzeigen aussuchen (Auto, Schmuck, Energydrink, Krankenkasse)</p>
                                <p><strong>Anleitung:</strong> Zeige die Werbungen ohne Ton oder nur kurz. Lass deine Schüler aufschreiben: Was wird verkauft? Welches Bedürfnis spricht die Werbung an? (Sicherheit=Versicherung, Anerkennung=Auto, Zugehörigkeit=Energydrink für coole Kids, etc.)</p>
                                <p><strong>Dokumentation:</strong> Erstelle eine Tabelle mit Produkt, Art der Werbung und Maslows-Stufe. Diskutiert: Werden wir manipuliert?</p>
                                <p><strong>Erkenntnis:</strong> Marketer verstehen Maslows Pyramide und nutzen sie gezielt.</p>
                              </div>
                            </div>
                            <div className="bg-blue-50 p-4 rounded border border-blue-200">
                              <p className="font-semibold mb-2">Experiment 3: Selbst-Check im Klassenzimmer</p>
                              <div className="text-sm space-y-2">
                                <p><strong>Vorbereitung:</strong> Arbeitsblatt mit den 5 Bedürfnis-Stufen</p>
                                <p><strong>Anleitung:</strong> Jeder Schüler füllt privat aus: "Welche Bedürfnisse sind während der Schule erfüllt? Welche fehlen?" Beispiele: Sicherheit (ja, die Schule ist sicher), Hunger (nein, bis zur Pause), Anerkennung (manchmal), Selbstverwirklichung (eher nicht).</p>
                                <p><strong>Dokumentation:</strong> Sammelt die Ergebnisse anonym ohne Namen. Welche Bedürfnisse fehlen am meisten? Wann ist die Motivation am höchsten?</p>
                                <p><strong>Erkenntnis:</strong> Die Schule erfüllt nicht alle Bedürfnisse - das beeinflusst die Motivation.</p>
                              </div>
                            </div>
                            <div className="bg-blue-50 p-4 rounded border border-blue-200">
                              <p className="font-semibold mb-2">Experiment 4: Menschen interviewen</p>
                              <div className="text-sm space-y-2">
                                <p><strong>Vorbereitung:</strong> Interviewfragen schreiben (z.B. "Was brauchst du, um glücklich zu sein?", "Was ist dir am wichtigsten im Leben?")</p>
                                <p><strong>Anleitung:</strong> Interviewt mindestens 5 verschiedene Menschen (Mitschüler, Lehrer, Familie, ältere Personen). Schreibt ihre Antworten auf.</p>
                                <p><strong>Dokumentation:</strong> Ordnet jede Antwort einer Stufe der Pyramide zu. Vergleicht: Unterscheiden sich die Antworten je nach Alter, Geschlecht oder sozialer Situation?</p>
                                <p><strong>Erkenntnis:</strong> Nicht alle Menschen priorisieren Bedürfnisse gleich.</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Reflection Questions */}
                        <div className="border-t pt-4">
                          <p className="font-semibold text-slate-900 mb-2">🤔 Reflexionsfragen zum Nachdenken:</p>
                          <ul className="space-y-1 text-sm text-slate-700 list-disc list-inside">
                            <li>Warum können Luxusmarken hohe Preise verlangen, obwohl sie dasselbe leisten wie günstige Alternativen?</li>
                            <li>Kann ein Schüler gut lernen, wenn er hungrig ist oder Angst vor Tests hat?</li>
                            <li>Funktioniert Maslows Pyramide überall in der Welt gleich oder gibt es kulturelle Unterschiede?</li>
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
                          <p className="font-semibold text-slate-900 mb-2">🧪 Wähle eines dieser 4 Experimente:</p>
                          <div className="space-y-3 text-slate-700">
                            <div className="bg-purple-50 p-4 rounded border border-purple-200">
                              <p className="font-semibold mb-2">Experiment 1: Der Handy-Reflex</p>
                              <div className="text-sm space-y-2">
                                <p><strong>Vorbereitung:</strong> Stopuhr, Notizblock</p>
                                <p><strong>Anleitung:</strong> Beobachtet eure Mitschüler eine Woche lang. Jedes Mal, wenn das Handy "pling" macht (Nachricht, Notification etc.), messt wie schnell die Person zum Handy greift. Zählt auch: Wie viele schaffen es, 5 Sekunden zu warten?</p>
                                <p><strong>Dokumentation:</strong> Durchschnittliche Reaktionszeit? Wie viele Menschen greifen sofort zu? Macht es einen Unterschied, ob sie gerade essen oder schlafen wollen?</p>
                                <p><strong>Erkenntnis:</strong> Klassische Konditionierung: Ton = Belohnung (neue Nachricht), darum automatisch reagieren.</p>
                              </div>
                            </div>
                            <div className="bg-purple-50 p-4 rounded border border-purple-200">
                              <p className="font-semibold mb-2">Experiment 2: Musik = Erinnerung</p>
                              <div className="text-sm space-y-2">
                                <p><strong>Vorbereitung:</strong> Playlist mit 5-8 Songs, Notizbuch</p>
                                <p><strong>Anleitung:</strong> Jeder Schüler notiert einen Song, der ihn/sie an etwas erinnert (positiv oder negativ). Spielt die Songs ab und beobachtet: Welche Gefühle/Erinnerungen kommen zurück? Werden manche traurig, nostalgisch, fröhlich?</p>
                                <p><strong>Dokumentation:</strong> Tabelle: Song → Emotion → Erinnerung. Warum verbinden wir Musik mit bestimmten Momenten? Wie alt waren die Erinnerungen?</p>
                                <p><strong>Erkenntnis:</strong> Musik ist ein konditionierter Reiz - der Song allein löst die Erinnerung aus.</p>
                              </div>
                            </div>
                            <div className="bg-purple-50 p-4 rounded border border-purple-200">
                              <p className="font-semibold mb-2">Experiment 3: Schulklingel & Konditionierung</p>
                              <div className="text-sm space-y-2">
                                <p><strong>Vorbereitung:</strong> Beobachtungsblatt, Kamera (optional)</p>
                                <p><strong>Anleitung:</strong> Hört auf die automatischen Reaktionen wenn die Schulklingel ertönt. Wer springt auf? Wer wird nervös? Wer seufzt? Seit wann kennen eure Mitschüler diesen Klingelton? Was würde passieren, wenn die Schule den Klingelton ändert?</p>
                                <p><strong>Dokumentation:</strong> Dokumentiert die Reaktionen. Fragt: "Wie habt ihr euch beim Sound gefühlt?" Vergleicht ältere und jüngere Schüler.</p>
                                <p><strong>Erkenntnis:</strong> Nach jahrelanger Schule ist der Klingelton ein konditionierter Reiz für "Ende der Stunde" oder "Stress".</p>
                              </div>
                            </div>
                            <div className="bg-purple-50 p-4 rounded border border-purple-200">
                              <p className="font-semibold mb-2">Experiment 4: Ritualen von Athleten</p>
                              <div className="text-sm space-y-2">
                                <p><strong>Vorbereitung:</strong> YouTube-Videos von Profisportlern, Fragebogen</p>
                                <p><strong>Anleitung:</strong> Recherchiert Rituale von bekannten Athleten (Fußballer, Tennis, Basketball). Beispiele: Schuhe in bestimmter Reihenfolge spielen, bestimmte Musik hören, Handshakes. Fragt dann: Ist das Aberglaube oder klassische Konditionierung?</p>
                                <p><strong>Dokumentation:</strong> Sammelt Rituale. Fragt auch Sportler in deiner Schule: Haben sie vor Spielen Rituale? Warum?</p>
                                <p><strong>Erkenntnis:</strong> Athleten haben durch Wiederholung gelernt: Dieses Ritual = gutes Gefühl = erfolgreiche Performance. Das ist Konditionierung.</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Reflection Questions */}
                        <div className="border-t pt-4">
                          <p className="font-semibold text-slate-900 mb-2">🤔 Reflexionsfragen zum Nachdenken:</p>
                          <ul className="space-y-1 text-sm text-slate-700 list-disc list-inside">
                            <li>Sind Werbejingles (z.B. McDonald's, Coca-Cola) beispiele für klassische Konditionierung?</li>
                            <li>Könnte man negative Konditionierungen (z.B. Angst vor Zahnarzt) bewusst abbauen?</li>
                            <li>Warum funktioniert klassische Konditionierung - hat sie einen biologischen Grund?</li>
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
                          <p className="font-semibold text-slate-900 mb-2">🧪 Wähle eines dieser 4 Experimente:</p>
                          <div className="space-y-3 text-slate-700">
                            <div className="bg-cyan-50 p-4 rounded border border-cyan-200">
                              <p className="font-semibold mb-2">Experiment 1: Dein persönlicher Flow-Moment</p>
                              <div className="text-sm space-y-2">
                                <p><strong>Vorbereitung:</strong> Fragebogen oder kurzes Interview</p>
                                <p><strong>Anleitung:</strong> Befragt 10-15 Personen: "Wann gehst du völlig auf?" (Gaming, Sport, Musik, Lesen, Malen, etc.). "Wie fühlt sich das an?" "Wie lange dauert das?" "Warum ist das anders als normaler Unterricht?"</p>
                                <p><strong>Dokumentation:</strong> Tabelle: Aktivität → Wie lange im Flow? → Warum Flow? Gibt es Unterschiede zwischen Alter/Geschlecht?</p>
                                <p><strong>Erkenntnis:</strong> Flow passiert bei Aktivitäten mit perfektem Balance zwischen Challenge und Skill.</p>
                              </div>
                            </div>
                            <div className="bg-cyan-50 p-4 rounded border border-cyan-200">
                              <p className="font-semibold mb-2">Experiment 2: Zu leicht = langweilig, zu schwer = stressig</p>
                              <div className="text-sm space-y-2">
                                <p><strong>Vorbereitung:</strong> 3 Varianten einer Aufgabe (zu einfach, perfekt, unmöglich)</p>
                                <p><strong>Anleitung:</strong> Lass Schüler nacheinander: (1) Eine Aufgabe für 3. Klasse machen (2 Min), (2) eine Aufgabe auf ihrem Level (5 Min), (3) eine unmögliche Aufgabe (2 Min). Danach: Wie habt ihr euch gefühlt?</p>
                                <p><strong>Dokumentation:</strong> Ratet ihre Gefühle: Langeweile/Frustration/Flow? Wann hatten sie am meisten Spaß?</p>
                                <p><strong>Erkenntnis:</strong> Nur die mittlere Schwierigkeit führt zu Flow.</p>
                              </div>
                            </div>
                            <div className="bg-cyan-50 p-4 rounded border border-cyan-200">
                              <p className="font-semibold mb-2">Experiment 3: Flow-Killer finden</p>
                              <div className="text-sm space-y-2">
                                <p><strong>Vorbereitung:</strong> Stoppuhr, Konzentrationsaufgabe</p>
                                <p><strong>Anleitung:</strong> Lass 5 Personen 15 Minuten konzentriert an einer Aufgabe arbeiten. Danach: Alle 2 Minuten etwas machen, das stört: laut sind, mit Handy spielen, Fragen stellen. Wie lange halten sie jetzt durch? Was zerstört ihren Focus am meisten?</p>
                                <p><strong>Dokumentation:</strong> Vergleiche: Ungestört vs. mit Störungen. Was war der größte Killer: Lärm, visueller Reiz, soziale Unterbrechung?</p>
                                <p><strong>Erkenntnis:</strong> Flow braucht Schutz vor Ablenkung.</p>
                              </div>
                            </div>
                            <div className="bg-cyan-50 p-4 rounded border border-cyan-200">
                              <p className="font-semibold mb-2">Experiment 4: Videospiel-Schwierigkeitsstufen</p>
                              <div className="text-sm space-y-2">
                                <p><strong>Vorbereitung:</strong> Ein Spiel auf dem Computer/Handy (beliebig)</p>
                                <p><strong>Anleitung:</strong> Lass Schüler dasselbe Spiel spielen auf 3 Schwierigkeitsgraden: (1) Einfach, (2) Normal, (3) Hard/Unmöglich. Bei jedem Level: Wie viel Spaß? (1-10)</p>
                                <p><strong>Dokumentation:</strong> Durchschnittliche Spaß-Bewertung pro Level. Welcher Level war am besten? Wann wurden sie frustriert?</p>
                                <p><strong>Erkenntnis:</strong> Spiele-Designer wissen: Die richtige Schwierigkeit = maximaler Spaß und Flow.</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Reflection Questions */}
                        <div className="border-t pt-4">
                          <p className="font-semibold text-slate-900 mb-2">🤔 Reflexionsfragen zum Nachdenken:</p>
                          <ul className="space-y-1 text-sm text-slate-700 list-disc list-inside">
                            <li>Warum verlieren viele Menschen das Interesse an einem Hobby, wenn es ihnen zu langweilig wird?</li>
                            <li>Können mehrere Menschen gleichzeitig im Flow sein (z.B. eine Band, ein Sportteam)?</li>
                            <li>Wie könnten Schulen ihre Unterrichtsstunden so gestalten, dass Flow wahrscheinlicher wird?</li>
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
                          <p className="font-semibold text-slate-900 mb-2">🧪 Wähle eines dieser 4 Experimente:</p>
                          <div className="space-y-3 text-slate-700">
                            <div className="bg-amber-50 p-4 rounded border border-amber-200">
                              <p className="font-semibold mb-2">Experiment 1: Mit und ohne Belohnung</p>
                              <div className="text-sm space-y-2">
                                <p><strong>Vorbereitung:</strong> Zwei ähnliche Aufgaben (z.B. Rätsel oder Mathe)</p>
                                <p><strong>Anleitung:</strong> Teilt die Klasse: Gruppe A bekommt eine Aufgabe ohne Belohnung, weil das Thema interessant ist. Gruppe B bekommt dieselbe Aufgabe, aber mit Belohnung versprochen (Punkte, kleine Süßigkeit). Beobachtet: Wer arbeitet lieber? Wer macht bessere Qualität?</p>
                                <p><strong>Dokumentation:</strong> Befrage beide Gruppen nach: Spaß (1-10), Motivation (1-10), würdet ihr die Aufgabe auch ohne Belohnung machen?</p>
                                <p><strong>Erkenntnis:</strong> Manchmal zerstört eine verspielte Belohnung die innere Motivation.</p>
                              </div>
                            </div>
                            <div className="bg-amber-50 p-4 rounded border border-amber-200">
                              <p className="font-semibold mb-2">Experiment 2: Noten vs. Lust am Lernen</p>
                              <div className="text-sm space-y-2">
                                <p><strong>Vorbereitung:</strong> Anonimer Fragebogen</p>
                                <p><strong>Anleitung:</strong> Jeder Schüler antwortet privat und anonym: "Für welche Fächer lernst du aus Interesse? Für welche nur wegen Noten? Gibt es einen Unterschied in deiner Motivation?" "Was würde sich ändern, wenn es keine Noten mehr gäbe?"</p>
                                <p><strong>Dokumentation:</strong> Sammelt die Ergebnisse. Wie viele Fächer werden nur wegen Noten gelernt? Würden Schüler andere Fächer wählen ohne Note?</p>
                                <p><strong>Erkenntnis:</strong> Noten können auch demotivieren statt zu motivieren.</p>
                              </div>
                            </div>
                            <div className="bg-amber-50 p-4 rounded border border-amber-200">
                              <p className="font-semibold mb-2">Experiment 3: Hobbys ohne Druck</p>
                              <div className="text-sm space-y-2">
                                <p><strong>Vorbereitung:</strong> Interviews mit Schülern</p>
                                <p><strong>Anleitung:</strong> Befragt 10-15 Schüler nach ihrem Lieblingshobby: "Warum machst du das?" "Wie viel Zeit investierst du darin?" "Was würde passieren, wenn dir jemand Punkte oder Noten dafür geben würde?" "Würde das Spaß immer noch Spaß machen?" "Wäre es weniger Spaß?"</p>
                                <p><strong>Dokumentation:</strong> Vergleicht: Hobbys (intrinsisch) vs. Schulfächer (extrinsisch). Unterschied in Begeisterung?</p>
                                <p><strong>Erkenntnis:</strong> Externe Belohnungen können innere Freude zerstören.</p>
                              </div>
                            </div>
                            <div className="bg-amber-50 p-4 rounded border border-amber-200">
                              <p className="font-semibold mb-2">Experiment 4: Interessante Aufgabe vs. Belohnung</p>
                              <div className="text-sm space-y-2">
                                <p><strong>Vorbereitung:</strong> Diskussions-Szenario</p>
                                <p><strong>Anleitung:</strong> Diskutiert mit der Klasse: "Stellt euch vor, es gäbe ab morgen keine Noten mehr - nur Feedback-Gespräche. Würdet ihr noch genauso viel lernen? Würdet ihr andere Fächer interessanter finden? Würde sich eure Motivation ändern?"</p>
                                <p><strong>Dokumentation:</strong> Sammelt Pro und Contra. Würde das System besser funktionieren?</p>
                                <p><strong>Erkenntnis:</strong> Vielleicht läuft unser Schulsystem intrinsischer Motivation zuwider.</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Reflection Questions */}
                        <div className="border-t pt-4">
                          <p className="font-semibold text-slate-900 mb-2">🤔 Reflexionsfragen zum Nachdenken:</p>
                          <ul className="space-y-1 text-sm text-slate-700 list-disc list-inside">
                            <li>Kann eine externe Belohnung die innere Motivation zerstören?</li>
                            <li>Warum sind manche Menschen intrinsisch für Sport motiviert, aber nicht für Mathe?</li>
                            <li>Wie könnten Schulen den Fokus mehr auf innere Motivation legen statt auf Noten?</li>
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
                          <p className="font-semibold text-slate-900 mb-2">🧪 Wähle eines dieser 4 Experimente:</p>
                          <div className="space-y-3 text-slate-700">
                            <div className="bg-rose-50 p-4 rounded border border-rose-200">
                              <p className="font-semibold mb-2">Experiment 1: Das Instagram-Scroll-Phänomen</p>
                              <div className="text-sm space-y-2">
                                <p><strong>Vorbereitung:</strong> Instagram/TikTok öffnen, Stoppuhr, Fragebogen</p>
                                <p><strong>Anleitung:</strong> Lass Schüler 10 Minuten scrollen und beobachte: Wann lächeln sie? Wann sieht man Überraschung? Lass sie hinterher aufschreiben: "Was hat mir Gefallen gemacht?" Warum hat es Gefallen gemacht? Konnte ich aufhören zu scrollen?"</p>
                                <p><strong>Dokumentation:</strong> Wie oft wechseln zwischen Emotionen? Wie oft sagen "noch eines", obwohl sie aufhören wollen? Ist das Zufall oder Design?</p>
                                <p><strong>Erkenntnis:</strong> Social Media nutzt Dopamin gezielt: neue Inhalte = Überraschung = Dopamin-Hit. Variable Belohnungen = suchtiger.</p>
                              </div>
                            </div>
                            <div className="bg-rose-50 p-4 rounded border border-rose-200">
                              <p className="font-semibold mb-2">Experiment 2: Sofortige vs. verzögerte Belohnung</p>
                              <div className="text-sm space-y-2">
                                <p><strong>Vorbereitung:</strong> Zwei Szenarien aufschreiben</p>
                                <p><strong>Anleitung:</strong> Frag die Klasse: "Würdest du lieber heute eine kleine Süßigkeit bekommen oder nächste Woche eine große?" Zählt: Wer sagt sofort ja? Wer kann warten? Unterschiede zwischen Alter/Persönlichkeit?</p>
                                <p><strong>Dokumentation:</strong> Prozentsatz für sofort vs. später. Korreliert das mit anderen Verhaltensweisen (Impulsivität, Geduld)?</p>
                                <p><strong>Erkenntnis:</strong> Unser Gehirn liebt sofortige Belohnungen (Dopamin-Peak jetzt!) mehr als verzögerte. Das ist biologisch.</p>
                              </div>
                            </div>
                            <div className="bg-rose-50 p-4 rounded border border-rose-200">
                              <p className="font-semibold mb-2">Experiment 3: Liste abhaken = gutes Gefühl</p>
                              <div className="text-sm space-y-2">
                                <p><strong>Vorbereitung:</strong> To-Do-Listen-Vorlage, Gefühlstagebuch</p>
                                <p><strong>Anleitung:</strong> Lass 10-15 Schüler eine Woche lang eine To-Do-Liste führen und Aufgaben abhaken. Jeden Tag: "Wie fühlt sich das Abhaken an?" (Zahlenreihe 1-10). Fragt: "Wartest du die Belohnung ab oder machst du andere Dinge?"</p>
                                <p><strong>Dokumentation:</strong> Durchschnittliches Glücksgefühl pro Tag. Motiviert es zum Weitermachen?</p>
                                <p><strong>Erkenntnis:</strong> Kleine Siege geben Dopamin-Hits. Das ist warum Achievement-Systeme in Spielen funktionieren.</p>
                              </div>
                            </div>
                            <div className="bg-rose-50 p-4 rounded border border-rose-200">
                              <p className="font-semibold mb-2">Experiment 4: Zufällige vs. regelmäßige Belohnungen</p>
                              <div className="text-sm space-y-2">
                                <p><strong>Vorbereitung:</strong> Ein einfaches Online-Spiel oder ein selbstgemachtes Spiel</p>
                                <p><strong>Anleitung:</strong> Lass zwei Gruppen spielen: Gruppe A: Regelmäßige Belohnungen (jeder richtige Treffer = Punkt). Gruppe B: Zufällige Belohnungen (manchmal ja, manchmal nein). Beobachte: Wer spielt länger? Wer ist frustierter? Welcher Modus ist "süchtiger"?</p>
                                <p><strong>Dokumentation:</strong> Spielzeit, Frustrationsquoten, Besessenheit. Welche Gruppe wählt sich das Spiel nächstes Mal wieder aus?</p>
                                <p><strong>Erkenntnis:</strong> Zufälligkeit = größere Dopamin-Spikes = süchtiger machend. (Wie Glücksspiele oder Loot Boxes.)</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Reflection Questions */}
                        <div className="border-t pt-4">
                          <p className="font-semibold text-slate-900 mb-2">🤔 Reflexionsfragen zum Nachdenken:</p>
                          <ul className="space-y-1 text-sm text-slate-700 list-disc list-inside">
                            <li>Warum können manche Menschen nicht aufhören, Spiele zu spielen oder Social Media zu nutzen?</li>
                            <li>Ist die Design von Videospielen ethisch vertretbar, wenn sie auf Dopamin-Sucht abzielen?</li>
                            <li>Ist Dopamin immer "schlecht" oder gibt es auch "gutes" Dopamin (z.B. beim Sport)?</li>
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

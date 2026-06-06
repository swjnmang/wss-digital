import { Link } from 'react-router-dom'
import { useState } from 'react'

export default function GamificationNutzen() {
  const [activeTab, setActiveTab] = useState('aufgaben')
  const [expandedTasks, setExpandedTasks] = useState<Record<number, boolean>>({})
  const [expandedTexts, setExpandedTexts] = useState<Record<number, boolean>>({})

  const toggleTask = (taskId: number) => {
    setExpandedTasks(prev => ({ ...prev, [taskId]: !prev[taskId] }))
  }

  const toggleText = (textId: number) => {
    setExpandedTexts(prev => ({ ...prev, [textId]: !prev[textId] }))
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
              Informationstexte
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
                    <div className="bg-white p-6 rounded-lg mt-4 space-y-6">

                      {/* Lernsituation */}
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
                        <h4 className="text-lg font-bold text-blue-900 mb-3">📋 Lernsituation: Die Experten-Konferenz der Redaktion „Pixel-Probe"</h4>
                        <div className="text-slate-700 leading-relaxed space-y-3">
                          <p>
                            Ihr seid Redaktionsmitglieder bei <strong>„Pixel-Probe"</strong>, einem erfolgreichen Online-Magazin für Tech, Medien und Wirtschaft.
                            Euer Chefredakteur hat einen Trendbericht auf den Tisch bekommen: An den Wirtschaftsschulen soll das Thema
                            <em> „Gamification und digitale Spielwelten"</em> genauer untersucht werden.
                          </p>
                          <p>
                            Das Problem: In der Öffentlichkeit wird aktuell alles wild durcheinandergeworfen.
                            Ob Fitness-App, Flugsimulator oder Vokabel-Game – für viele ist das einfach alles „nur Zocken".
                          </p>
                          <p>Der Chefredakteur erteilt eurer Redaktion daher folgenden zweistufigen Großauftrag:</p>
                          <blockquote className="border-l-4 border-blue-400 pl-4 italic text-slate-600">
                            „Leute, wir brauchen Struktur! Wir teilen unsere Redaktion in vier Spezialistenteams auf.
                            Jedes Team durchleuchtet genau eine Kategorie, bereitet ein Infoplakat vor und schult danach
                            die restliche Redaktion. Wenn alle Bescheid wissen, testen wir unser Wissen an 20 konkreten
                            App-Beispielen aus dem echten Leben!"
                          </blockquote>
                        </div>
                      </div>

                      {/* Arbeitsauftrag */}
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
                        <h4 className="text-lg font-bold text-amber-900 mb-3">
                          🛠️ Phase 1 – Die Experten-Runde{' '}
                          <span className="font-normal text-sm">(ca. 30 Minuten)</span>
                        </h4>
                        <p className="text-slate-700 mb-4">
                          Schließt euch in euren Spezialistenteams zusammen. Ihr seid ab jetzt die Experten für eine der vier Kategorien:
                        </p>

                        <div className="grid grid-cols-2 gap-3 mb-5">
                          {[
                            { num: '1', label: 'Die Gamification-Spezialisten' },
                            { num: '2', label: 'Die Serious-Games-Analysten' },
                            { num: '3', label: 'Die Simulations-Experten' },
                            { num: '4', label: 'Die Lernspiel-Prüfer' },
                          ].map(team => (
                            <div key={team.num} className="bg-white border border-amber-200 rounded-lg p-3 flex items-center gap-3">
                              <span className="w-8 h-8 rounded-full bg-amber-500 text-white font-bold flex items-center justify-center flex-shrink-0">{team.num}</span>
                              <span className="text-slate-800 font-medium text-sm">Team {team.num}: {team.label}</span>
                            </div>
                          ))}
                        </div>

                        <h5 className="font-bold text-slate-800 mb-3">Eure Aufgaben im Spezialistenteam:</h5>
                        <ol className="space-y-3 text-slate-700">
                          <li className="flex gap-3">
                            <span className="w-6 h-6 rounded-full bg-amber-500 text-white font-bold flex items-center justify-center flex-shrink-0 text-sm">1</span>
                            <div>
                              <strong>Informationen auswerten:</strong> Lest den Informationstext zu eurer Kategorie (Reiter „Informationstexte") aufmerksam durch.
                            </div>
                          </li>
                          <li className="flex gap-3">
                            <span className="w-6 h-6 rounded-full bg-amber-500 text-white font-bold flex items-center justify-center flex-shrink-0 text-sm">2</span>
                            <div>
                              <strong>Das Experten-Plakat gestalten:</strong> Erstellt gemeinsam ein übersichtliches Plakat (analog oder digital). Euer Plakat muss folgende Elemente enthalten:
                              <ul className="mt-2 ml-4 space-y-1 list-disc text-slate-600">
                                <li>Der Name eurer Kategorie als große Überschrift</li>
                                <li>Die Definition in eigenen, leicht verständlichen Worten</li>
                                <li>Die Kernmerkmale: Woran erkennt man diese Kategorie sofort? (Mindestens 3 Stichpunkte)</li>
                              </ul>
                            </div>
                          </li>
                          <li className="flex gap-3">
                            <span className="w-6 h-6 rounded-full bg-amber-500 text-white font-bold flex items-center justify-center flex-shrink-0 text-sm">3</span>
                            <div>
                              <strong>App/Spiel digital vorführen:</strong> Das Beispiel für eine entsprechende App, ein Spiel oder eine Anwendung aus eurem Text sollt ihr digital vorführen (auf dem Smartphone, Tablet oder Computer).
                            </div>
                          </li>
                          <li className="flex gap-3">
                            <span className="w-6 h-6 rounded-full bg-amber-500 text-white font-bold flex items-center justify-center flex-shrink-0 text-sm">4</span>
                            <div>
                              <strong>Die Redaktionsschulung vorbereiten:</strong> Bestimmt zwei Sprecher aus eurem Team, die euer Plakat in maximal <strong>3 Minuten</strong> vor der gesamten Klasse präsentieren, damit alle anderen von eurem Wissen lernen können.
                            </div>
                          </li>
                        </ol>
                      </div>

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
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-slate-900">Informationstexte</h2>

              {/* Text 1 */}
              <div className="bg-slate-50 rounded-xl border-2 border-slate-200 overflow-hidden">
                <button
                  onClick={() => toggleText(1)}
                  className="w-full p-6 hover:bg-slate-100 transition-colors flex items-center justify-between"
                >
                  <div className="text-left">
                    <h3 className="text-xl font-bold text-slate-900">📄 Was ist eigentlich Gamification?</h3>
                    <p className="text-slate-600 text-sm mt-1">Informationstext für Team 1: Die Gamification-Spezialisten</p>
                  </div>
                  <span className={`text-2xl transform transition-transform flex-shrink-0 ml-4 ${expandedTexts[1] ? 'rotate-45' : ''}`}>➕</span>
                </button>
                {expandedTexts[1] && (
                  <div className="px-6 pb-6 border-t border-slate-200">
                    <div className="bg-white p-6 rounded-lg mt-4 space-y-4 text-slate-700 leading-relaxed">
                      <div>
                        <h4 className="font-bold text-slate-900 mb-2">Was ist das überhaupt?</h4>
                        <p>
                          Stellt euch vor, ihr müsst eine total langweilige Aufgabe erledigen – zum Beispiel euer Zimmer aufräumen, Steuererklärungen ausfüllen oder Vokabeln büffeln. Eigentlich habt ihr null Bock darauf. Genau hier setzt <strong>Gamification</strong> (auf Deutsch: Spielifizierung) ein. Gamification bedeutet: Man nimmt spieltypische Elemente und baut sie in einen Alltagskontext ein, der eigentlich überhaupt nichts mit Spielen zu tun hat. Das Ziel dahinter ist es, die Motivation von Menschen zu steigern, Verhaltensweisen zu ändern oder langweilige Prozesse spannend zu machen.
                        </p>
                        <p className="mt-3">
                          Wichtig ist: Bei Gamification spielt man kein eigenständiges, vollwertiges Videospiel. Man erledigt immer noch die reale Aufgabe, aber sie fühlt sich durch die eingebauten Mechanismen wie ein Spiel an.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 mb-2">Woran erkennt man Gamification? (Kernmerkmale)</h4>
                        <ul className="space-y-2 ml-4 list-disc">
                          <li><strong>Das PBL-System:</strong> Points (Punkte), Badges (virtuelle Abzeichen) und Leaderboards (Ranglisten). Wer eine Aufgabe erledigt, sammelt Punkte und steigt in Ligen auf.</li>
                          <li><strong>Fortschrittsbalken:</strong> Ein visueller Balken zeigt an, dass ihr z. B. euer Profil zu „80 % vervollständigt" habt. Das triggert unser Gehirn, die 100 % vollmachen zu wollen.</li>
                          <li><strong>Streaks (Serien):</strong> Ihr werdet belohnt, wenn ihr eine Aufgabe jeden Tag ohne Unterbrechung erledigt (z. B. der Flammen-Streak bei Snapchat oder tägliche Log-In-Boni).</li>
                        </ul>
                      </div>
                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                        <h4 className="font-bold text-slate-800 mb-1">💡 Beispiel: Duolingo</h4>
                        <p>
                          Im Kern ist Duolingo nichts anderes als ein digitaler Karteikasten mit Grammatikübungen. Aber die App nutzt die volle Power der Gamification: tägliche Streaks, Erfahrungspunkte (XP), wöchentliche Ranglisten und glitzernde Abzeichen. Das eigentliche Ziel ist das Lernen einer Sprache – aber das System motiviert wie ein Onlinespiel.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Text 2 */}
              <div className="bg-slate-50 rounded-xl border-2 border-slate-200 overflow-hidden">
                <button
                  onClick={() => toggleText(2)}
                  className="w-full p-6 hover:bg-slate-100 transition-colors flex items-center justify-between"
                >
                  <div className="text-left">
                    <h3 className="text-xl font-bold text-slate-900">📄 Was sind Serious-Games?</h3>
                    <p className="text-slate-600 text-sm mt-1">Informationstext für Team 2: Die Serious-Games-Analysten</p>
                  </div>
                  <span className={`text-2xl transform transition-transform flex-shrink-0 ml-4 ${expandedTexts[2] ? 'rotate-45' : ''}`}>➕</span>
                </button>
                {expandedTexts[2] && (
                  <div className="px-6 pb-6 border-t border-slate-200">
                    <div className="bg-white p-6 rounded-lg mt-4 space-y-4 text-slate-700 leading-relaxed">
                      <div>
                        <h4 className="font-bold text-slate-900 mb-2">Was ist das überhaupt?</h4>
                        <p>
                          <strong>Serious Games</strong> (auf Deutsch: Ernste Spiele) sehen optisch oft wie normale Videospiele aus – aber sie verfolgen ein höheres Ziel. Ein Serious Game ist ein eigenständiges, vollwertiges Videospiel, das jedoch entwickelt wurde, um ernste, reale und oft komplexe Themen spürbar und erlebbar zu machen. Es geht nicht ums bloße Auswendiglernen, sondern darum, durch schwierige Entscheidungen im Spiel ein tiefes Verständnis für gesellschaftliche Probleme, Geschichte, Politik oder Ethik zu entwickeln.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 mb-2">Woran erkennt man Serious Games? (Kernmerkmale)</h4>
                        <ul className="space-y-2 ml-4 list-disc">
                          <li><strong>Echte Spielwelt und Story:</strong> Es gibt Charaktere, eine Handlung, eine Grafik und richtiges Gameplay (laufen, steuern, verwalten).</li>
                          <li><strong>Ethische Dilemmata:</strong> Spieler werden gezwungen, schwierige Entscheidungen zu treffen, die oft keine perfekte Lösung haben und deren Konsequenzen man tragen muss.</li>
                          <li><strong>Perspektivenwechsel:</strong> Man schlüpft in Rollen von Menschen, mit denen man im echten Leben selten tauschen möchte (z. B. Geflüchtete, historische Figuren oder Menschen in Krisengebieten).</li>
                        </ul>
                      </div>
                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                        <h4 className="font-bold text-slate-800 mb-1">💡 Beispiel: The Evolution of Trust</h4>
                        <p className="mb-3">
                          In diesem animierten, interaktiven Spiel untersucht man die Psychologie und Spieltheorie. Ihr interagiert mit verschiedenen Charakter-Typen (z. B. treuen „Nachäffern" oder hinterlistigen „Betrügern") und schaut, was passiert, wenn man kooperiert oder hintergeht. Das Spiel zeigt auf geniale Weise, warum Vertrauen in unserer Gesellschaft so schwer aufzubauen, aber leicht zu zerstören ist.
                        </p>
                        <a
                          href="https://jkoelling.github.io/trust/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:underline"
                        >
                          🔗 Zum Spiel: jkoelling.github.io/trust
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Text 3 */}
              <div className="bg-slate-50 rounded-xl border-2 border-slate-200 overflow-hidden">
                <button
                  onClick={() => toggleText(3)}
                  className="w-full p-6 hover:bg-slate-100 transition-colors flex items-center justify-between"
                >
                  <div className="text-left">
                    <h3 className="text-xl font-bold text-slate-900">📄 Was sind Simulationen?</h3>
                    <p className="text-slate-600 text-sm mt-1">Informationstext für Team 3: Die Simulations-Experten</p>
                  </div>
                  <span className={`text-2xl transform transition-transform flex-shrink-0 ml-4 ${expandedTexts[3] ? 'rotate-45' : ''}`}>➕</span>
                </button>
                {expandedTexts[3] && (
                  <div className="px-6 pb-6 border-t border-slate-200">
                    <div className="bg-white p-6 rounded-lg mt-4 space-y-4 text-slate-700 leading-relaxed">
                      <div>
                        <h4 className="font-bold text-slate-900 mb-2">Was ist das überhaupt?</h4>
                        <p>
                          Eine <strong>Simulation</strong> ist das möglichst realitätsgetreue, exakte Nachbilden von komplexen Systemen, Prozessen oder Berufen in einer virtuellen Umgebung. Im Gegensatz zu normalen Videospielen gibt es hier oft keine künstliche Story und keine erfundenen Monster. Die Software verhält sich haargenau so, wie sich die echte Welt verhalten würde. Es geht darum, durch diese virtuelle Schnittstelle reale Abläufe fehlerfrei zu trainieren.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 mb-2">Woran erkennt man Simulationen? (Kernmerkmale)</h4>
                        <ul className="space-y-2 ml-4 list-disc">
                          <li><strong>Exakte Realitätstreue:</strong> Physik, mathematische Marktregeln oder technische Knöpfe entsprechen 1:1 der Wirklichkeit.</li>
                          <li><strong>Experimentieren mit Ursache und Wirkung:</strong> Wenn man in einer Wirtschaftssimulation die Preise zu hoch ansetzt, bricht der Umsatz exakt so ein, wie es auf einem echten Markt passieren würde.</li>
                          <li><strong>Fehler ohne Risiko:</strong> Man kann ausprobieren, was passiert wenn etwas schiefgeht (z. B. Triebwerksausfall oder Börsencrash), ohne dass echter Schaden entsteht.</li>
                        </ul>
                      </div>
                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                        <h4 className="font-bold text-slate-800 mb-1">💡 Beispiel: GeoFS Flight Simulator</h4>
                        <p className="mb-3">
                          Diese Software bildet das Cockpit von echten Flugzeugen detailgetreu nach. Sogar das Wetter, der Wind und die Flugplätze weltweit werden über Satellitendaten in Echtzeit simuliert. Piloten nutzen solche Systeme weltweit zur Ausbildung, weil sich das virtuelle Flugzeug physikalisch exakt so verhält wie eine echte Boeing oder ein Airbus.
                        </p>
                        <a
                          href="https://www.geo-fs.com/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:underline"
                        >
                          🔗 Kostenlos spielbar: geo-fs.com
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Text 4 */}
              <div className="bg-slate-50 rounded-xl border-2 border-slate-200 overflow-hidden">
                <button
                  onClick={() => toggleText(4)}
                  className="w-full p-6 hover:bg-slate-100 transition-colors flex items-center justify-between"
                >
                  <div className="text-left">
                    <h3 className="text-xl font-bold text-slate-900">📄 Was sind Lernspiele?</h3>
                    <p className="text-slate-600 text-sm mt-1">Informationstext für Team 4: Die Lernspiel-Prüfer</p>
                  </div>
                  <span className={`text-2xl transform transition-transform flex-shrink-0 ml-4 ${expandedTexts[4] ? 'rotate-45' : ''}`}>➕</span>
                </button>
                {expandedTexts[4] && (
                  <div className="px-6 pb-6 border-t border-slate-200">
                    <div className="bg-white p-6 rounded-lg mt-4 space-y-4 text-slate-700 leading-relaxed">
                      <div>
                        <h4 className="font-bold text-slate-900 mb-2">Was ist das überhaupt?</h4>
                        <p>
                          Ein <strong>Lernspiel</strong> (oft auch Educational Game genannt) ist ein Spiel, das von Pädagogen und Softwareentwicklern speziell für den Einsatz in der Schule oder beim Lernen zu Hause entwickelt wurde. Das primäre Ziel ist das Erreichen eines konkreten Lernziels aus dem Lehrplan (z. B. Einmaleins, Rechtschreibung oder Tastaturschreiben). Um das Üben schmackhafter zu machen, wird der Lernstoff in eine meist einfache, kindgerechte oder motivierende Rahmenhandlung verpackt.
                        </p>
                        <p className="mt-3 text-sm bg-slate-100 border border-slate-200 rounded p-3">
                          <strong>Wichtig zur Abgrenzung:</strong> Bei der Gamification (Team 1) verändert man den Alltag. Beim Lernspiel spielt man ein echtes, kleines Spiel – aber der Inhalt besteht fast ausschließlich aus Schulstoff.
                        </p>
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 mb-2">Woran erkennt man Lernspiele? (Kernmerkmale)</h4>
                        <ul className="space-y-2 ml-4 list-disc">
                          <li><strong>Direkter Lehrplanbezug:</strong> Die Aufgaben spiegeln genau das wider, was auch im Schulbuch steht (Matheaufgaben, Vokabeltests, Zuordnungen).</li>
                          <li><strong>Fortschritt durch Wissen:</strong> Man kommt im Spiel nur weiter, wenn man eine Denk- oder Wissensaufgabe richtig gelöst hat (z. B. Türen öffnen sich nur durch die richtige Rechenaufgabe).</li>
                          <li><strong>Belohnung durch Spielzeit:</strong> Nach einer erfolgreichen Lernphase darf man zur Belohnung oft ein kleines, spaßiges Minispiel spielen.</li>
                        </ul>
                      </div>
                      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                        <h4 className="font-bold text-slate-800 mb-1">💡 Beispiel: ANTON App</h4>
                        <p>
                          Die an vielen bayerischen Schulen genutzte ANTON App lässt Schüler ihr Fach und ihre Jahrgangsstufe auswählen und interaktive Aufgaben lösen (z. B. Brüche zuordnen oder Satzglieder bestimmen). Für jede fehlerfreie Kachel verdienen sie virtuelle Münzen – mit denen sie im integrierten „Spiele-Shop" einfache Geschicklichkeitsspiele freischalten können. Das Spiel dient als direkte Belohnung für den messbaren Lernerfolg.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
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

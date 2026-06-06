import { Link } from 'react-router-dom'
import { useState } from 'react'

type Category = 'Gamification' | 'Lernspiel' | 'Serious Game' | 'Simulation'

interface AppItem {
  name: string
  description: string
  correct: Category
  explanation: string
}

const APP_ITEMS: AppItem[] = [
  {
    name: 'Duolingo',
    description: 'Eine Sprachlern-App, bei der du täglich Lektionen absolvierst. Für richtige Antworten sammelst du Erfahrungspunkte (XP), hältst deinen täglichen Streak aufrecht und steigst in wöchentlichen Ranglisten gegen andere Nutzer auf. Das eigentliche Ziel ist das Erlernen einer Sprache.',
    correct: 'Gamification',
    explanation: 'Duolingo ist Gamification: Das Lernen einer Sprache (kein Spiel) wird durch Spielelemente (XP, Streaks, Ranglisten) motivierender gestaltet.'
  },
  {
    name: 'ANTON App',
    description: 'Eine Schul-App, bei der Schüler ihr Fach und ihre Jahrgangsstufe wählen und dann interaktive Lehrplan-Aufgaben lösen (z. B. Brüche, Satzglieder). Für jede richtige Antwort verdienen sie Münzen, die sie im integrierten Spiele-Shop einlösen können.',
    correct: 'Lernspiel',
    explanation: 'ANTON ist ein Lernspiel: Der Inhalt des Spiels besteht direkt aus Schulstoff. Man kommt nur weiter, wenn man Lernaufgaben löst.'
  },
  {
    name: 'The Evolution of Trust',
    description: 'Ein animiertes Browser-Spiel, in dem man mit verschiedenen Charakter-Typen interagiert und dabei die Spieltheorie und Psychologie des Vertrauens entdeckt. Es hat eine richtige Spielmechanik, aber kein klassisches Unterhaltungsziel.',
    correct: 'Serious Game',
    explanation: 'Ein Serious Game: Es ist ein vollwertiges Spiel, aber das eigentliche Ziel ist das Verständnis von Spieltheorie und gesellschaftlichem Vertrauen.'
  },
  {
    name: 'GeoFS Flight Simulator',
    description: 'Eine kostenlose Browser-Software, die ein Flugzeug-Cockpit mit echten Wetterdaten, echten Flughäfen und realistischer Physik nachbildet. Keine Story, kein Punktesystem – einfach fliegen wie in der Wirklichkeit.',
    correct: 'Simulation',
    explanation: 'Eine Simulation: Die Software bildet die Realität 1:1 nach. Keine erfundene Story, nur echte Physik und Daten.'
  },
  {
    name: 'Habitica',
    description: 'Eine To-Do-Listen-App, die dein echtes Leben in ein Rollenspiel verwandelt. Erledigst du eine Aufgabe auf deiner Liste, bekommt dein Charakter Erfahrungspunkte. Lässt du Aufgaben liegen, verliert dein Charakter Lebenspunkte.',
    correct: 'Gamification',
    explanation: 'Gamification: Die eigentliche Aufgabe (Produktivität, Aufgaben erledigen) ist kein Spiel. Spielelemente (RPG-Charakter, HP, XP) machen es motivierender.'
  },
  {
    name: 'Kahoot!',
    description: 'Eine Quiz-Plattform, die Lehrkräfte im Unterricht einsetzen. Die Schüler beantworten Fragen zu aktuellen Unterrichtsthemen auf Zeit. Der Schnellste mit der richtigen Antwort bekommt die meisten Punkte.',
    correct: 'Lernspiel',
    explanation: 'Ein Lernspiel: Der Inhalt sind konkrete Lehrplanthemen. Das Spiel funktioniert nur durch das Beantworten von Wissensfragen.'
  },
  {
    name: 'This War of Mine',
    description: 'Ein Videospiel, in dem du eine Gruppe Zivilisten durch einen Krieg führst. Du triffst schwere moralische Entscheidungen: Stehle ich Medikamente von einem alten Mann? Das Spiel basiert auf realen Kriegserfahrungen.',
    correct: 'Serious Game',
    explanation: 'Ein Serious Game: Es ist ein vollwertiges Videospiel, aber der Zweck ist, den Spieler die menschliche Seite des Krieges erleben zu lassen.'
  },
  {
    name: 'Microsoft Flight Simulator (2024)',
    description: 'Eine Software, die Flugzeuge und die gesamte Erde mit echten Satellitendaten und Live-Wetter in Echtzeit nachbildet. Piloten weltweit nutzen vergleichbare Systeme zur Ausbildung.',
    correct: 'Simulation',
    explanation: 'Eine Simulation: Maximale Realitätstreue, echte Daten, kein Spielziel – nur die exakte Nachbildung des Fliegens.'
  },
  {
    name: 'Nike Run Club',
    description: 'Eine Lauf-App, die deine Läufe aufzeichnet und dich mit Abzeichen belohnt, wenn du bestimmte Distanzen erreichst. Du kannst dich in Challenges mit Freunden messen und auf einer Rangliste aufsteigen.',
    correct: 'Gamification',
    explanation: 'Gamification: Das Laufen selbst ist kein Spiel. Badges, Challenges und Ranglisten werden hinzugefügt, um die Motivation zu steigern.'
  },
  {
    name: 'Papers, Please',
    description: 'Ein Videospiel, in dem du als Grenzbeamter eines fiktiven Landes Einreisedokumente prüfst. Du musst täglich Entscheidungen treffen: Lässt du eine Familie durch, die falsche Papiere hat? Dein Gehalt hängt von deiner Produktivität ab.',
    correct: 'Serious Game',
    explanation: 'Ein Serious Game: Es ist ein vollwertiges Spiel, das Bürokratie, Moral und politische Systeme erlebbar macht.'
  },
  {
    name: 'SimCity (EA)',
    description: 'Eine Software, in der du eine Stadt planst und verwaltest. Du musst Steuern festlegen, Infrastruktur bauen und auf Naturkatastrophen reagieren. Die Wirtschafts- und Verkehrsmodelle orientieren sich an echten stadtplanerischen Konzepten.',
    correct: 'Simulation',
    explanation: 'Eine Simulation: Stadtplanung und Wirtschaft werden realitätsnah modelliert, auch wenn es spielerische Elemente gibt.'
  },
  {
    name: 'Quizlet',
    description: 'Eine Lernplattform, auf der Schüler digitale Karteikarten zu Unterrichtsthemen erstellen oder nutzen. Im Lern-Modus "Match" musst du Begriffe und Definitionen so schnell wie möglich einander zuordnen.',
    correct: 'Lernspiel',
    explanation: 'Ein Lernspiel: Der gesamte Inhalt ist Schulstoff. Das Spielprinzip funktioniert nur durch das Anwenden von Lernmaterial.'
  },
  // --- Neue Einträge ---
  {
    name: 'Forest (App)',
    description: 'Eine Produktivitäts-App, bei der ein virtueller Baum wächst, solange du das Smartphone nicht anfasst. Legt man das Handy weg, wächst der Baum; bricht man ab, stirbt er. Das Ziel ist konzentriertes Arbeiten – kein Spiel.',
    correct: 'Gamification',
    explanation: 'Gamification: Das eigentliche Ziel ist Produktivität (kein Spiel). Der wachsende Baum ist ein spieltypisches Element, das die Motivation steigert, das Handy wegzulegen.'
  },
  {
    name: 'Payback-Punktesystem',
    description: 'Ein reales Einkaufssystem: Durch Einkäufe sammelst du Punkte, steigst in Coupons auf und schaltest "X-fach-Punkte-Aktionen" frei. Du sammelst auf einer Karte, wie weit du von der nächsten Prämie entfernt bist.',
    correct: 'Gamification',
    explanation: 'Gamification: Das Einkaufen ist keine Spielaktivität. Punkte, Abzeichen und Belohnungen (typische Spielelemente) werden hinzugefügt, um Kundentreue zu erzeugen.'
  },
  {
    name: 'LinkedIn-Profilstärke',
    description: 'Beim Erstellen des Profils zeigt ein Kreis- oder Balkendiagramm an, zu wie viel Prozent das Profil vollständig ist – „Erreiche den Status Profi". Nutzer werden so animiert, weitere Daten einzutragen.',
    correct: 'Gamification',
    explanation: 'Gamification: Das Ausfüllen eines Profils ist keine Spielaktivität. Der Fortschrittsbalken und die Level-Bezeichnungen sind Spielelemente, die das Verhalten steuern sollen.'
  },
  {
    name: 'Plague Inc.',
    description: 'Ein Strategiespiel, in dem man einen Erreger so weiterentwickelt, dass er die gesamte Menschheit infiziert. Es wird von Gesundheitsbehörden wie der CDC gelobt, weil es realistisch zeigt, wie sich Pandemien ausbreiten und wie Impfkampagnen wirken.',
    correct: 'Serious Game',
    explanation: 'Serious Game: Es ist ein vollwertiges Strategiespiel mit echter Spielmechanik, das aber gezielt das Verständnis von Epidemiologie und Gesundheitspolitik fördern soll.'
  },
  {
    name: 'Orwell (Videospiel)',
    description: 'Du spielst als Ermittler eines staatlichen Überwachungsprogramms und durchleuchtest Internet-Aktivitäten, Chats und Profile von Bürgern, um Terrorismus aufzudecken. Das Spiel regt zur Diskussion über Datenschutz und Überwachungsstaaten an.',
    correct: 'Serious Game',
    explanation: 'Serious Game: Das Spiel hat eine vollwertige Mechanik, verfolgt aber das ernste Ziel, Datenschutz und staatliche Überwachung kritisch erfahrbar zu machen.'
  },
  {
    name: 'Alba: A Wildlife Adventure',
    description: 'Ein Spiel, in dem man als junges Mädchen eine Mittelmeerinsel erkundet, Tiere fotografiert und Müll einsammelt, um ein Naturschutzgebiet vor einem Hotelbau zu retten. Themen: Umweltschutz und zivilgesellschaftliches Engagement.',
    correct: 'Serious Game',
    explanation: 'Serious Game: Es ist ein vollwertiges Abenteuersspiel, dessen eigentlicher Zweck ist, Bewusstsein für Umweltschutz und Aktivismus zu schaffen.'
  },
  {
    name: 'Planspiel Börse (Sparkassen)',
    description: 'Eine Simulation des echten Aktienmarktes mit realen Live-Kursen. Schüler handeln mit virtuellem Startkapital unter echten Marktbedingungen, um den Wertpapierhandel ohne finanzielles Risiko zu erlernen.',
    correct: 'Simulation',
    explanation: 'Simulation: Echte Börsenkurse, echte Marktregeln – nur das Geld ist virtuell. Fehler haben keine realen Konsequenzen, aber die Mechanismen sind 1:1 realitätstreu.'
  },
  {
    name: 'Euro Truck Simulator 2',
    description: 'Eine detailgetreue Simulation des Berufsalltags eines LKW-Fahrers: Ruhezeiten einhalten, Spritverbrauch managen, Verkehrsregeln beachten und Fracht durch Europa transportieren. Kein Spielziel – nur realistischer Alltag.',
    correct: 'Simulation',
    explanation: 'Simulation: Alle Abläufe (Logistik, Fahrphysik, Verkehrsrecht) entsprechen der Realität. Es gibt keine erfundene Story, nur das Nachbilden eines echten Berufs.'
  },
  {
    name: 'PC Building Simulator',
    description: 'Eine Software, in der man lernt, wie Computerhardware exakt zusammengebaut wird. Kabel, Steckplätze und die Kompatibilität echter PC-Komponenten werden haargenau nachgebildet – wie in der Realität.',
    correct: 'Simulation',
    explanation: 'Simulation: Die Bauteilkompatibilität und Montage entsprechen 1:1 der Wirklichkeit. Die Software wird sogar in IT-Ausbildungen eingesetzt.'
  },
  {
    name: 'Mathepiraten / Matheking',
    description: 'Online-Plattformen für Grund- und Wirtschaftsschüler: Man löst Rechenaufgaben aus dem Lehrplan, um auf einer Schatzkarte voranzukommen oder Piratenschiffe freizuschalten. Ohne richtige Rechenergebnisse kein Fortschritt.',
    correct: 'Lernspiel',
    explanation: 'Lernspiel: Der Spielfortschritt ist direkt an das Lösen von Lehrplan-Rechenaufgaben gebunden. Das Spiel existiert nur, um Mathe-Übungen zu verpacken.'
  },
  {
    name: 'Professor Layton (Reihe)',
    description: 'Ein Abenteuer-Videospiel, dessen gesamter Fortschritt an das Lösen von logischen, mathematischen und rätselbasierten Denkaufgaben gekoppelt ist. Man kommt in der Geschichte nur weiter, wenn man die Aufgaben löst.',
    correct: 'Lernspiel',
    explanation: 'Lernspiel: Der Fortschritt im Spiel funktioniert ausschließlich durch das Lösen von Denk- und Wissensaufgaben – klassisches Lernspiel-Prinzip.'
  },
  {
    name: 'Type Rush / Tipp-Trainer',
    description: 'Ein Rennspiel, bei dem dein Auto umso schneller fährt, je schneller und fehlerfreier du Blindschreiben auf der Tastatur beherrschst. Das Ziel ist das Erlernen des Zehnfingersystems.',
    correct: 'Lernspiel',
    explanation: 'Lernspiel: Das Spielprinzip (Rennen gewinnen) funktioniert nur durch das korrekte Ausführen einer Lernaufgabe (Tastaturschreiben). Der Lernstoff ist der Spielinhalt.'
  },
]

const CATEGORIES: Category[] = ['Gamification', 'Lernspiel', 'Serious Game', 'Simulation']

const CATEGORY_COLORS: Record<Category, string> = {
  'Gamification': 'bg-blue-500 hover:bg-blue-600 border-blue-500',
  'Lernspiel': 'bg-green-500 hover:bg-green-600 border-green-500',
  'Serious Game': 'bg-purple-500 hover:bg-purple-600 border-purple-500',
  'Simulation': 'bg-amber-500 hover:bg-amber-600 border-amber-500',
}

export default function GamificationNutzen() {
  const [activeTab, setActiveTab] = useState('aufgaben')
  const [expandedTasks, setExpandedTasks] = useState<Record<number, boolean>>({})
  const [expandedTexts, setExpandedTexts] = useState<Record<number, boolean>>({})

  // Übung 1 State
  const [quiz1Index, setQuiz1Index] = useState(0)
  const [quiz1Selected, setQuiz1Selected] = useState<Category | null>(null)
  const [quiz1Score, setQuiz1Score] = useState(0)
  const [quiz1Done, setQuiz1Done] = useState(false)
  const [quiz1Expanded, setQuiz1Expanded] = useState(false)

  const toggleTask = (taskId: number) => {
    setExpandedTasks(prev => ({ ...prev, [taskId]: !prev[taskId] }))
  }

  const toggleText = (textId: number) => {
    setExpandedTexts(prev => ({ ...prev, [textId]: !prev[textId] }))
  }

  const handleQuiz1Answer = (cat: Category) => {
    if (quiz1Selected !== null) return
    setQuiz1Selected(cat)
    if (cat === APP_ITEMS[quiz1Index].correct) {
      setQuiz1Score(s => s + 1)
    }
  }

  const handleQuiz1Next = () => {
    if (quiz1Index + 1 >= APP_ITEMS.length) {
      setQuiz1Done(true)
    } else {
      setQuiz1Index(i => i + 1)
      setQuiz1Selected(null)
    }
  }

  const handleQuiz1Restart = () => {
    setQuiz1Index(0)
    setQuiz1Selected(null)
    setQuiz1Score(0)
    setQuiz1Done(false)
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
                  <svg className={`w-5 h-5 text-slate-400 flex-shrink-0 ml-4 transform transition-transform ${expandedTasks[1] ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
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
                  <svg className={`w-5 h-5 text-slate-400 flex-shrink-0 ml-4 transform transition-transform ${expandedTasks[2] ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
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
                  <svg className={`w-5 h-5 text-slate-400 flex-shrink-0 ml-4 transform transition-transform ${expandedTasks[3] ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
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
                  <svg className={`w-5 h-5 text-slate-400 flex-shrink-0 ml-4 transform transition-transform ${expandedTexts[1] ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
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

                      <div>
                        <h4 className="font-bold text-slate-900 mb-3">🎬 Video: Was ist Gamification?</h4>
                        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                          <iframe
                            className="absolute inset-0 w-full h-full rounded-lg"
                            src="https://www.youtube.com/embed/8Dw7HWZYP8M"
                            title="Was ist Gamification?"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
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
                  <svg className={`w-5 h-5 text-slate-400 flex-shrink-0 ml-4 transform transition-transform ${expandedTexts[2] ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
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

                      <div>
                        <h4 className="font-bold text-slate-900 mb-3">🎬 Video: Was sind Serious Games?</h4>
                        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                          <iframe
                            className="absolute inset-0 w-full h-full rounded-lg"
                            src="https://www.youtube.com/embed/M_pgMJ6DStU"
                            title="Was sind Serious Games?"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
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
                  <svg className={`w-5 h-5 text-slate-400 flex-shrink-0 ml-4 transform transition-transform ${expandedTexts[3] ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
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
                  <svg className={`w-5 h-5 text-slate-400 flex-shrink-0 ml-4 transform transition-transform ${expandedTexts[4] ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
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
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-slate-900">Übungen</h2>

              {/* Übung 1 */}
              <div className="bg-slate-50 rounded-xl border-2 border-slate-200 overflow-hidden">
                <button
                  onClick={() => setQuiz1Expanded(e => !e)}
                  className="w-full p-6 hover:bg-slate-100 transition-colors flex items-center justify-between"
                >
                  <div className="text-left">
                    <h3 className="text-xl font-bold text-slate-900">🗂️ 1. Gamification, Lernspiel, Serious Game oder Simulation?</h3>
                    <p className="text-slate-600 text-sm mt-1">
                      Lies die App-Beschreibung und ordne sie der richtigen Kategorie zu – {APP_ITEMS.length} Runden
                    </p>
                  </div>
                  <svg className={`w-5 h-5 text-slate-400 flex-shrink-0 ml-4 transform transition-transform ${quiz1Expanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                </button>

                {quiz1Expanded && (
                  <div className="px-6 pb-6 border-t border-slate-200">
                    <div className="mt-4">

                      {quiz1Done ? (
                        /* ===== ERGEBNIS ===== */
                        <div className="text-center py-10 space-y-4">
                          <div className="text-6xl mb-2">{quiz1Score >= 10 ? '🏆' : quiz1Score >= 7 ? '👍' : '📚'}</div>
                          <h3 className="text-2xl font-bold text-slate-900">
                            Du hast {quiz1Score} von {APP_ITEMS.length} richtig!
                          </h3>
                          <p className="text-slate-600">
                            {quiz1Score >= 10
                              ? 'Hervorragend – du kennst die Unterschiede wie ein Profi!'
                              : quiz1Score >= 7
                              ? 'Gut gemacht! Wiederhole die Infotexte für die Kategorien, bei denen du unsicher warst.'
                              : 'Schau dir noch einmal die Informationstexte an und versuche es erneut!'}
                          </p>
                          <button
                            onClick={handleQuiz1Restart}
                            className="mt-4 px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            🔄 Nochmal versuchen
                          </button>
                        </div>
                      ) : (
                        /* ===== FRAGE ===== */
                        <div className="space-y-5">
                          {/* Fortschritt */}
                          <div className="flex items-center justify-between text-sm text-slate-500 mb-1">
                            <span>App {quiz1Index + 1} von {APP_ITEMS.length}</span>
                            <span className="font-semibold text-slate-700">{quiz1Score} Punkte</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full transition-all"
                              style={{ width: `${(quiz1Index / APP_ITEMS.length) * 100}%` }}
                            />
                          </div>

                          {/* App-Karte */}
                          <div className="bg-white border-2 border-slate-200 rounded-xl p-6">
                            <h4 className="text-xl font-bold text-slate-900 mb-3">
                              📱 {APP_ITEMS[quiz1Index].name}
                            </h4>
                            <p className="text-slate-700 leading-relaxed">
                              {APP_ITEMS[quiz1Index].description}
                            </p>
                          </div>

                          {/* Kategorie-Buttons */}
                          <div className="grid grid-cols-2 gap-3">
                            {CATEGORIES.map(cat => {
                              const isSelected = quiz1Selected === cat
                              const isCorrect = cat === APP_ITEMS[quiz1Index].correct
                              const answered = quiz1Selected !== null

                              let btnClass = 'w-full py-3 px-4 rounded-lg font-semibold text-white transition-all border-2 '
                              if (!answered) {
                                btnClass += CATEGORY_COLORS[cat]
                              } else if (isCorrect) {
                                btnClass += 'bg-green-500 border-green-500 scale-105 shadow-md'
                              } else if (isSelected && !isCorrect) {
                                btnClass += 'bg-red-400 border-red-400 opacity-75'
                              } else {
                                btnClass += 'bg-slate-300 border-slate-300 text-slate-600 opacity-50'
                              }

                              return (
                                <button
                                  key={cat}
                                  onClick={() => handleQuiz1Answer(cat)}
                                  disabled={answered}
                                  className={btnClass}
                                >
                                  {answered && isCorrect && '✓ '}
                                  {answered && isSelected && !isCorrect && '✗ '}
                                  {cat}
                                </button>
                              )
                            })}
                          </div>

                          {/* Feedback */}
                          {quiz1Selected !== null && (
                            <div className={`rounded-xl p-4 border-2 ${quiz1Selected === APP_ITEMS[quiz1Index].correct ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}`}>
                              <p className="font-bold mb-1">
                                {quiz1Selected === APP_ITEMS[quiz1Index].correct ? '✅ Richtig!' : `❌ Leider falsch – es ist: ${APP_ITEMS[quiz1Index].correct}`}
                              </p>
                              <p className="text-slate-700 text-sm leading-relaxed">
                                {APP_ITEMS[quiz1Index].explanation}
                              </p>
                            </div>
                          )}

                          {/* Weiter-Button */}
                          {quiz1Selected !== null && (
                            <button
                              onClick={handleQuiz1Next}
                              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors"
                            >
                              {quiz1Index + 1 >= APP_ITEMS.length ? '🏁 Ergebnis anzeigen' : 'Weiter →'}
                            </button>
                          )}
                        </div>
                      )}

                    </div>
                  </div>
                )}
              </div>

            </div>
          )}
        </div>
      </main>
    </div>
  )
}

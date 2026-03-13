import { Link } from 'react-router-dom'
import { useState } from 'react'

interface QuizQuestion {
  id: number
  theory: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

const quizQuestions: QuizQuestion[] = [
  {
    id: 1,
    theory: 'Maslow',
    question: 'Nach Maslow gibt es eine Hierarchie der Bedürfnisse. Welche Bedürfnisse sind die Basis?',
    options: ['Sicherheitsbedürfnisse', 'Physiologische Bedürfnisse', 'Selbstverwirklichung', 'Soziale Bedürfnisse'],
    correctAnswer: 1,
    explanation: 'Physische Bedürfnisse wie Hunger, Durst und Schlaf sind die Grundlage von Maslow\'s Pyramide.'
  },
  {
    id: 2,
    theory: 'Maslow',
    question: 'Was versteht Maslow unter "Selbstverwirklichung"?',
    options: ['Viel Geld verdienen', 'Das volle Potenzial ausschöpfen', 'Berühmtheit erlangen', 'Andere kontrollieren'],
    correctAnswer: 1,
    explanation: 'Selbstverwirklichung bedeutet, sein volles Potenzial zu entwickeln und kreativ zu sein.'
  },
  {
    id: 3,
    theory: 'Konditionierung',
    question: 'Bei der klassischen Konditionierung ist der unkonditionierte Reiz:',
    options: ['Der erlernte Reiz', 'Der natürlich wirksame Reiz', 'Eine neue Assoziation', 'Immer ein Klang'],
    correctAnswer: 1,
    explanation: 'Der unkonditionierte Reiz wirkt natürlicherweise, z.B. Futter für einen Hund.'
  },
  {
    id: 4,
    theory: 'Konditionierung',
    question: 'Bei der operanten Konditionierung kommt es auf an:',
    options: ['Ein vorhandener Reflex', 'Die Folgen des Verhaltens', 'Unbewusste Prozesse', 'Genetische Faktoren'],
    correctAnswer: 1,
    explanation: 'Operante Konditionierung basiert auf Verstärkung oder Bestrafung nach dem Verhalten.'
  },
  {
    id: 5,
    theory: 'Flow',
    question: 'Wann entsteht der Flow-Zustand nach Csikszentmihalyi?',
    options: ['Wenn die Aufgabe sehr einfach ist', 'Wenn Fähigkeiten und Herausforderungen im Gleichgewicht sind', 'Bei chaotischen Bedingungen', 'Wenn man entspannt ist'],
    correctAnswer: 1,
    explanation: 'Flow entsteht, wenn die Schwierigkeit der Aufgabe Fähigkeiten und Anforderungen des Menschen entspricht.'
  },
  {
    id: 6,
    theory: 'Flow',
    question: 'Welcher Zustand tritt auf, wenn die Herausforderung größer ist als die Fähigkeiten?',
    options: ['Flow', 'Apathie', 'Angst', 'Langeweile'],
    correctAnswer: 2,
    explanation: 'Wenn die Herausforderung zu groß ist, führt das zu Angst oder Frustration.'
  },
  {
    id: 7,
    theory: 'Intrinsisch/Extrinsisch',
    question: 'Eine intrinsische Motivation ist...',
    options: ['Motivation durch externe Belohnungen', 'Motivation aus innerem Antrieb', 'Immer stärker als extrinsisch', 'Basiert auf Angst'],
    correctAnswer: 1,
    explanation: 'Intrinsische Motivation kommt aus innerer Interesse und Freude an der Tätigkeit selbst.'
  },
  {
    id: 8,
    theory: 'Intrinsisch/Extrinsisch',
    question: 'Welches ist ein Beispiel für extrinsische Motivation?',
    options: ['Lernen, weil man ein Thema interessant findet', 'Eine gute Note für eine Prüfung erhalten', 'Hobbys nachgehen', 'Ein Buch lesen aus Leidenschaft'],
    correctAnswer: 1,
    explanation: 'Extrinsische Motivation bezieht sich auf externe Faktoren wie Noten, Geld oder Belohnungen.'
  },
  {
    id: 9,
    theory: 'Dopamin',
    question: 'Dopamin ist ein Botenstoff, der besonders wichtig für...',
    options: ['Muskelaufbau', 'Schlaf', 'Das Belohnungssystem und Motivation', 'Knochengesundheit'],
    correctAnswer: 2,
    explanation: 'Dopamin ist der Neurotransmitter des Belohnungssystems und fördert Motivation und Lernverhalten.'
  },
  {
    id: 10,
    theory: 'Dopamin',
    question: 'Warum sind "Likes" auf Social Media so süchtig machend?',
    options: ['Sie are immer verfügbar', 'Man weiß nie, wann der nächste kommt (intermittierende Verstärkung)', 'Sie sind sehr wertvoll', 'Man kann sie sparen'],
    correctAnswer: 1,
    explanation: 'Unvorhersehbare Belohnungen führen zu einer intensiveren Dopaminausschüttung als vorhersehbare.'
  },
  {
    id: 11,
    theory: 'Mixed',
    question: 'Welche zwei Motivationsarten sollten idealerweise kombiniert werden?',
    options: ['Nur intrinsisch', 'Nur extrinsisch', 'Intrinsisch UND extrinsisch', 'Weder noch - Motivationen konkurrieren'],
    correctAnswer: 2,
    explanation: 'Die beste Motivation entsteht durch die Kombination von innerer Freude und angemessener externer Struktur.'
  },
  {
    id: 12,
    theory: 'Mixed',
    question: 'Nach welcher Theorie kann eine Schule ein "Lernspiel" nutzen, um alle Motivationsebenen anzusprechen?',
    options: ['Nur Flow', 'Nur Dopamin', 'Alle Theorien zusammen (Maslow, Flow, Dopamin, etc.)', 'Nur Konditionierung'],
    correctAnswer: 2,
    explanation: 'Effektive Lernspielen kombinieren Elemente aus mehreren Motivationstheorien für maximalen Erfolg.'
  },
]

export default function Lernspielen() {
  const [activeTab, setActiveTab] = useState('aufgaben')
  const [expandedAufgabe1, setExpandedAufgabe1] = useState(false)
  const [expandedAufgabe2, setExpandedAufgabe2] = useState(false)
  const [expandedAufgabe3, setExpandedAufgabe3] = useState(false)
  const [expandedPhase1, setExpandedPhase1] = useState(false)
  const [expandedPhase2, setExpandedPhase2] = useState(false)
  const [expandedPhase3, setExpandedPhase3] = useState(false)
  const [expandedPhase4, setExpandedPhase4] = useState(false)
  const [expandedInfotexte, setExpandedInfotexte] = useState<Record<number, boolean>>({
    1: false,
    2: false,
    3: false,
    4: false,
    5: false,
  })
  
  // Quiz state
  const [quizStarted, setQuizStarted] = useState(false)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [answered, setAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [answers, setAnswers] = useState<(number | null)[]>(new Array(quizQuestions.length).fill(null))


  const handleAnswerClick = (optionIndex: number) => {
    if (answered) return
    
    setSelectedAnswer(optionIndex)
    setAnswered(true)
    
    const currentQuestion = quizQuestions[currentQuestionIndex]
    const isCorrect = optionIndex === currentQuestion.correctAnswer
    
    if (isCorrect) {
      setScore(score + 1)
    }
    
    const newAnswers = [...answers]
    newAnswers[currentQuestionIndex] = optionIndex
    setAnswers(newAnswers)
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setSelectedAnswer(null)
      setAnswered(false)
    }
  }

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
      setSelectedAnswer(answers[currentQuestionIndex - 1])
      setAnswered(true)
    }
  }

  const handleRestartQuiz = () => {
    setQuizStarted(false)
    setCurrentQuestionIndex(0)
    setSelectedAnswer(null)
    setAnswered(false)
    setScore(0)
    setAnswers(new Array(quizQuestions.length).fill(null))
  }

  const getProgressPercentage = () => {
    return Math.round(((currentQuestionIndex + 1) / quizQuestions.length) * 100)
  }

  const currentQuestion = quizQuestions[currentQuestionIndex]
  const isQuizComplete = currentQuestionIndex === quizQuestions.length - 1 && answered

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
              onClick={() => setActiveTab('infotexte')}
              className={`pb-4 px-2 font-semibold transition-colors ${
                activeTab === 'infotexte'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Infotexte
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
                <div className="px-8 py-6 border-t border-slate-200 bg-white space-y-8">
                  
                  {/* 1. The Story */}
                  <section>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-3xl">📖</span>
                      <h4 className="text-xl font-bold text-slate-900">Die Geschichte: Das Langeweile-Manifest</h4>
                    </div>
                    <div className="space-y-4 text-slate-700">
                      <div className="bg-white p-6 rounded-lg border border-slate-200">
                        <p className="mb-3 leading-relaxed">
                          <strong className="text-slate-900">Szenario:</strong> Du hast gerade eine frustrierende Nachhilfestunde beendet und hast von Schule die Nase voll. Du verfasst einen geheimen Aufruf, das <em>"Langeweile-Manifest"</em>, der nur an die vertrauenswürdigsten und kreativsten Mitschüler/innen (die <strong>"A-Tutor-League"</strong>) verschickt wird.
                        </p>
                      </div>
                      
                      <div className="bg-slate-50 border-l-4 border-slate-300 p-6 rounded-lg">
                        <p className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                          <span>💌</span> Original-Botschaft von Alex an das Team
                        </p>
                        <blockquote className="italic text-slate-700 leading-relaxed space-y-3">
                          <p>
                            "Liebe Mitstreiter, wir können so nicht weitermachen. Die aktuellen Arbeitsblätter und PowerPoints sind digitale Schlaftabletten! Unsere Mitschüler/innen verlieren das Interesse, bevor sie überhaupt angefangen haben zu lernen.
                          </p>
                          <p>
                            Wenn wir das Fach retten wollen, müssen wir eine Revolution starten. Unser Ziel: Motivierenden Unterricht durch Gamification erschaffen. Wir sind die letzte Hoffnung.
                          </p>
                          <p>
                            Wir starten die <strong>'A-Tutor-League'</strong> und unser erstes Projekt ist die Entwicklung von Lernspielen, die wirklich funktionieren. Wir müssen deshalb zunächst herausfinden, wie Motivation bei Menschen funktioniert."
                          </p>
                        </blockquote>
                      </div>
                    </div>
                  </section>

                  <hr className="border-slate-200" />

                  {/* 2. The Mission */}
                  <section>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-3xl">🎯</span>
                      <h4 className="text-xl font-bold text-slate-900">Euer Auftrag</h4>
                    </div>
                    <p className="text-slate-700 mb-6 leading-relaxed">
                      Um funktionierende Lernspiele zu entwickeln, müsst ihr zunächst verstehen, wie menschliche Motivation funktioniert. Die <strong>A-Tutor-League</strong> hat euch daher einen Gruppenauftrag gegeben:
                    </p>
                    <div className="bg-slate-50 p-6 rounded-lg border border-slate-300">
                      <ol className="space-y-4">
                        {[
                          'Bildet 5 Gruppen',
                          'Jede Gruppe wählt eines der 5 untenstehenden Motivations-Themen',
                          'Informiert euch gründlich über das Thema (nutzt die bereitgestellten Links & Texte)',
                          'Erstellt eine 10-15 Minuten Präsentation für die Klasse',
                          'Erklärt, wie euer Konzept in Lernspielen angewendet werden kann'
                        ].map((task, idx) => (
                          <li key={idx} className="flex gap-4 text-slate-700">
                            <span className="font-bold text-slate-700 text-lg flex-shrink-0 w-7 h-7 flex items-center justify-center bg-slate-100 rounded-full">{idx + 1}</span>
                            <span className="pt-1">{task}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </section>

                  <hr className="border-slate-200" />

                  {/* 3. Group Topics */}
                  <section>
                    <div className="flex items-center gap-3 mb-6">
                      <span className="text-3xl">👥</span>
                      <h4 className="text-xl font-bold text-slate-900">Die 5 Gruppen und ihre Themen</h4>
                    </div>
                    <div className="space-y-3">
                      {[
                        {
                          group: 'Gruppe 1',
                          title: 'Bedürfnispyramide nach Maslow',
                          emoji: '🔺',
                          desc: 'Wie beeinflussen Grundbedürfnisse, Sicherheit, Zugehörigkeit, Anerkennung und Selbstverwirklichung die Lernmotivation?',
                        },
                        {
                          group: 'Gruppe 2',
                          title: 'Klassische Konditionierung',
                          emoji: '🔔',
                          desc: 'Wie können wir durch gezielte Reize-Reaktions-Muster (wie Pavlovs Hunde) Lernende motivieren?',
                        },
                        {
                          group: 'Gruppe 3',
                          title: 'Flow-Theorie nach Csikszentmihalyi',
                          emoji: '🌊',
                          desc: 'Wie bringt man Lernende in einen Zustand vollständiger Hingabe, wo Zeit und Selbstzweifel vergessen sind?',
                        },
                        {
                          group: 'Gruppe 4',
                          title: 'Intrinsische & Extrinsische Motivation',
                          emoji: '⚡',
                          desc: 'Welche Motivation ist nachhaltiger? Punkte und Noten vs. innere Zufriedenheit und Interessenspflege?',
                        },
                        {
                          group: 'Gruppe 5',
                          title: 'Belohnungssysteme im Gehirn',
                          emoji: '🎁',
                          desc: 'In unserem Gehirn gibt es ein Zentrum, das uns steuert: das Belohnungssystem. Es ist dafür da, dass wir Dinge wiederholen, die gut für uns sind (wie Essen oder Lernen). Der wichtigste Botenstoff dabei ist Dopamin.',
                        },
                      ].map((item, idx) => (
                        <div key={idx} className="bg-slate-50 p-4 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors">
                          <div className="flex gap-3">
                            <span className="text-2xl flex-shrink-0">{item.emoji}</span>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-semibold text-slate-600 uppercase">{item.group}</span>
                              </div>
                              <h5 className="font-semibold text-slate-900 text-base mb-1">{item.title}</h5>
                              <p className="text-slate-700 text-xs leading-relaxed">{item.desc}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  <hr className="border-slate-200" />

                  {/* 4. Deliverables */}
                  <section>
                    <div className="flex items-center gap-3 mb-6">
                      <span className="text-3xl">📊</span>
                      <h4 className="text-xl font-bold text-slate-900">Was muss präsentiert werden?</h4>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-slate-50 border border-slate-200 p-5 rounded-lg">
                        <div className="flex items-center gap-2 mb-4">
                          <span className="text-xl">🎓</span>
                          <h5 className="font-semibold text-slate-900">Teil 1: Theorie (5-7 Min)</h5>
                        </div>
                        <ul className="text-slate-700 space-y-2 text-sm">
                          <li className="flex gap-2">
                            <span className="text-slate-600 font-bold">•</span>
                            <span>Grundkonzepte & Definitionen</span>
                          </li>
                          <li className="flex gap-2">
                            <span className="text-slate-600 font-bold">•</span>
                            <span>Historischer Kontext & Erfinder</span>
                          </li>
                          <li className="flex gap-2">
                            <span className="text-slate-600 font-bold">•</span>
                            <span>Forschungsergebnisse & Belege</span>
                          </li>
                          <li className="flex gap-2">
                            <span className="text-slate-600 font-bold">•</span>
                            <span>Praktische Beispiele aus Alltag</span>
                          </li>
                        </ul>
                      </div>
                      <div className="bg-slate-50 border border-slate-200 p-5 rounded-lg">
                        <div className="flex items-center gap-2 mb-4">
                          <span className="text-xl">🎮</span>
                          <h5 className="font-semibold text-slate-900">Teil 2: Anwendung (5-8 Min)</h5>
                        </div>
                        <ul className="text-slate-700 space-y-2 text-sm">
                          <li className="flex gap-2">
                            <span className="text-slate-600 font-bold">•</span>
                            <span>Wie würde man dies in einem Lernspiel nutzen?</span>
                          </li>
                          <li className="flex gap-2">
                            <span className="text-slate-600 font-bold">•</span>
                            <span>Wo genau könnte man es einbauen?</span>
                          </li>
                          <li className="flex gap-2">
                            <span className="text-slate-600 font-bold">•</span>
                            <span>Prototype/Mockup oder Beispiel-Gameplay</span>
                          </li>
                          <li className="flex gap-2">
                            <span className="text-slate-600 font-bold">•</span>
                            <span>Chancen & Risiken dieser Methode</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </section>

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
                                <p><strong>Anleitung:</strong> Beobachtet eure Mitschüler eine Woche lang. Jedes Mal, wenn das Handy "pling" macht (Nachricht, Notification etc.), messt, wie schnell die Person zum Handy greift. Zählt auch: Wie viele schaffen es, 5 Sekunden zu warten?</p>
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
                                <p><strong>Anleitung:</strong> Hört auf die automatischen Reaktionen, wenn die Schulklingel ertönt. Wer springt auf? Wer wird nervös? Wer seufzt? Seit wann kennen eure Mitschüler diesen Klingelton? Was würde passieren, wenn die Schule den Klingelton ändert?</p>
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
                            <li>Ist das Design von Videospielen ethisch vertretbar, wenn sie auf Dopamin-Sucht abzielen?</li>
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

              {/* AUFGABE 3: Lernspiel entwickeln */}
              <div className="bg-slate-50 rounded-xl border-2 border-slate-200 overflow-hidden">
                <button
                  onClick={() => setExpandedAufgabe3(!expandedAufgabe3)}
                  className="w-full p-6 hover:bg-slate-100 transition-colors flex items-center justify-between"
                >
                  <div className="text-left flex-1">
                    <h3 className="text-2xl font-bold text-slate-900">🎮 Aufgabe 3: Lernspiel entwickeln & durchführen</h3>
                    <p className="text-slate-600 text-sm mt-2">Entwerft und testet euer eigenes Lernspiel - die A-Tutor-League wird aktiv!</p>
                  </div>
                  <span className="text-3xl ml-4 transition-transform duration-300" style={{ transform: expandedAufgabe3 ? 'rotate(45deg)' : 'rotate(0deg)' }}>➕</span>
                </button>

                {expandedAufgabe3 && (
                <div className="px-8 py-6 border-t border-slate-200 bg-white space-y-8">
                  
                  {/* Introduction */}
                  <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                    <h4 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <span>🚀</span> Die A-Tutor-League wird praktisch!
                    </h4>
                    <p className="text-slate-700 mb-4">
                      Ihr habt nun die theoretischen Grundlagen der Motivationspsychologie kennengelernt und Experimente durchgeführt. Jetzt ist es Zeit für die große Aktion: <strong>Ihr entwickelt ein eigenes Lernspiel!</strong>
                    </p>
                    <div className="bg-white p-4 rounded border border-slate-200 mt-4">
                      <p className="font-semibold text-slate-900 mb-3">📋 Aufbau dieser Arbeitsaufgabe:</p>
                      <ol className="text-sm text-slate-700 space-y-2 list-decimal list-inside">
                        <li><strong>Planung:</strong> Was wollt ihr erreichen? Wer spielt? Was ist das Ziel?</li>
                        <li><strong>Entwicklung:</strong> Erstellt das konkrete Spiel</li>
                        <li><strong>Test & Optimierung:</strong> Testet mit anderen Schülern</li>
                        <li><strong>Evaluation:</strong> Ihr erstellt einen Bewertungsbogen & messt Lernerfolg</li>
                      </ol>
                    </div>
                  </div>

                  {/* Phase 1: Planung */}
                  <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setExpandedPhase1(!expandedPhase1)}
                      className="w-full p-6 hover:bg-slate-50 transition-colors flex items-center justify-between"
                    >
                      <div className="text-left flex-1">
                        <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                          <span>📐</span> Phase 1: Planung - Das Konzept
                        </h4>
                      </div>
                      <span className="text-2xl ml-4 transition-transform duration-300" style={{ transform: expandedPhase1 ? 'rotate(45deg)' : 'rotate(0deg)' }}>➕</span>
                    </button>

                    {expandedPhase1 && (
                    <div className="px-6 py-6 border-t border-slate-200 bg-slate-50 space-y-4">
                      <p className="text-slate-700 mb-4">
                        Bevor ihr anfangt zu programmieren oder zu basteln, müsst ihr genau planen. Beantwortet diese Fragen als Gruppe:
                      </p>
                    
                    <div className="space-y-4">
                      <div className="bg-white p-4 rounded border border-slate-200">
                        <p className="font-semibold text-slate-900 mb-2">👥 Zielgruppe</p>
                        <ul className="text-sm text-slate-700 space-y-1 list-disc list-inside">
                          <li>Alter & Klassenstufe des Schülerkreises?</li>
                          <li>Vorwissen: Was können die Spieler schon?</li>
                          <li>Binnendifferenzierung: Gibt es verschiedene Schwierigkeitsstufen?</li>
                          <li>Sprachbarrieren oder motorische Anforderungen?</li>
                        </ul>
                      </div>

                      <div className="bg-white p-4 rounded border border-slate-200">
                        <p className="font-semibold text-slate-900 mb-2">🎯 Zielsetzung</p>
                        <ul className="text-sm text-slate-700 space-y-1 list-disc list-inside">
                          <li><strong>Lernziel:</strong> Was sollen die Spieler lernen/können?</li>
                          <li><strong>Kompetenzen:</strong> Welche Fähigkeiten werden gefördert? (Wissen, Denken, Zusammenarbeit)</li>
                          <li><strong>Verhaltensänderung:</strong> Soll das Spiel Motivation oder Einstellung ändern?</li>
                          <li><strong>Spaßfaktor:</strong> Soll es einfach nur Spaß machen oder auch lehren?</li>
                        </ul>
                      </div>

                      <div className="bg-white p-4 rounded border border-slate-200">
                        <p className="font-semibold text-slate-900 mb-2">📚 Fachgebiet & Themenbereich</p>
                        <ul className="text-sm text-slate-700 space-y-1 list-disc list-inside">
                          <li>Welches Fach? (Mathe, Englisch, Biologie, Geschichte, etc.)</li>
                          <li>Konkretes Thema? (z.B. „Englische Vokabeln", „Photosynthese", „Quadratische Gleichungen")</li>
                          <li>Exaktes Curriculum-Niveau?</li>
                        </ul>
                      </div>

                      <div className="bg-white p-4 rounded border border-slate-200">
                        <p className="font-semibold text-slate-900 mb-2">🛠️ Materialien & Werkzeuge</p>
                        <ul className="text-sm text-slate-700 space-y-1 list-disc list-inside">
                          <li>Was braucht ihr? (Papier, Karten, Würfel, Computer, etc.)</li>
                          <li>Zeitbudget? (Wie lange dauert eine Runde?)</li>
                          <li>Raumbu dget? (Kleiner Tisch, ganze Klassenzimmer, Outdoor?)</li>
                          <li>Budget? (Kostet die Herstellung etwas?)</li>
                        </ul>
                      </div>

                      <div className="bg-white p-4 rounded border border-slate-200">
                        <p className="font-semibold text-slate-900 mb-2">🎮 Umsetzungsmöglichkeiten (Vorschläge & Inspirationen)</p>
                        <p className="text-sm text-slate-700 mb-3">
                          Hier sind einige Beispiele, wie euer Lernspiel aussehen könnte. Das sind aber nur <strong>Gedankenanstoße</strong> - ihr könnt natürlich auch ganz andere Formate wählen!
                        </p>
                        <ul className="text-sm text-slate-700 space-y-2 list-none">
                          <li>💡 <strong>Analog:</strong> Brettspiel, Kartenspiel, Activity-ähnlich, Tabu, Schnitzeljagd, Tabletop-Rollenspiel, etc.</li>
                          <li>💡 <strong>Digital:</strong> Quiz-App (Kahoot), HTML-Spiel, Online-Tool, Interactive Story, etc.</li>
                          <li>💡 <strong>Hybrid:</strong> Mischung aus analog und digital</li>
                          <li>💡 <strong>Virtuell:</strong> VR/AR-Elemente (falls verfügbar)</li>
                          <li>💡 <strong>Eure Idee:</strong> Habt ihr eine ganz andere Idee? Noch besser! Z.B. Podcast+Quiz, Instagram-Story-Format, Video-Game-Stil, etc.</li>
                        </ul>
                      </div>

                      <div className="bg-white p-4 rounded border border-slate-200">
                        <p className="font-semibold text-slate-900 mb-2">🧠 Motivationstheorien im Spiel</p>
                        <p className="text-sm text-slate-700 mb-3">
                          <strong>Wichtig:</strong> Denkt dabei an eure 5 Motivationstheorien! Welche werdet ihr nutzen?
                        </p>
                        <ul className="text-sm text-slate-700 space-y-2 list-none">
                          <li>🔺 <strong>Maslow:</strong> Erfüllt das Spiel bestimmte Bedürfnisse? (z.B. Zugehörigkeit durch Teamspiel, Anerkennung durch Punkte)</li>
                          <li>🔔 <strong>Konditionierung:</strong> Welche Reize & Belohnungen verbinden die Spieler mit eurem Spiel?</li>
                          <li>🌊 <strong>Flow:</strong> Passt die Schwierigkeit? Ist es weder zu leicht noch zu schwer?</li>
                          <li>💜 <strong>Intrinsisch/Extrinsisch:</strong> Was motiviert mehr - der Inhalt selbst oder externe Belohnungen?</li>
                          <li>🧬 <strong>Dopamin:</strong> Welche Momente erzeugen Glücksgefühle und wiederholen das Spielen?</li>
                        </ul>
                      </div>

                      <div className="bg-white p-4 rounded border border-slate-200">
                        <p className="font-semibold text-slate-900 mb-2">🎯 Gamification Elemente</p>
                        <p className="text-sm text-slate-700 mb-3">
                          Welche klassischen Gamification-Mechaniken werdet ihr einbauen?
                        </p>
                        <ul className="text-sm text-slate-700 space-y-1 list-disc list-inside">
                          <li><strong>Punkte/Scoring:</strong> Wie verdienen Spieler Punkte?</li>
                          <li><strong>Levels/Ränge:</strong> Gibt es verschiedene Schwierigkeitsstufen oder Progression?</li>
                          <li><strong>Belohnungen:</strong> Was gewinnt der Spieler? (Badges, Medaillen, Titel, Privileg)</li>
                          <li><strong>Leaderboards/Rankings:</strong> Vergleichen sich Spieler mit anderen?</li>
                          <li><strong>Challenges/Missionen:</strong> Gibt es spezielle Aufgaben mit Boni?</li>
                          <li><strong>Feedback:</strong> Wann weiß der Spieler, dass er richtig oder falsch war?</li>
                          <li><strong>Story/Narrative:</strong> Hat das Spiel eine Geschichte oder nur reine Aufgaben?</li>
                          <li><strong>Zusammenarbeit/Kompetition:</strong> Spielen alle gegeneinander oder zusammen?</li>
                        </ul>
                      </div>
                    </div>

                    {/* Checklist */}
                    <div className="mt-6 bg-slate-50 p-4 rounded border border-slate-300">
                      <p className="font-semibold text-slate-900 mb-3">✅ Planung Checklist:</p>
                      <ul className="text-sm text-slate-700 space-y-1 list-none">
                        <li>☐ Zielgruppe klargestellt</li>
                        <li>☐ Lernziel definiert</li>
                        <li>☐ Fach & Thema konkretisiert</li>
                        <li>☐ Material- & Zeitbudget geplant</li>
                        <li>☐ Type des Spiels entschieden</li>
                        <li>☐ Motivationstheorien ausgewählt & geplant</li>
                        <li>☐ Gamification Elemente definiert</li>
                        <li>☐ Gruppenmitglieder & Rollen verteilt</li>
                      </ul>
                    </div>
                    </div>
                    )}
                  </div>

                  {/* Phase 2: Entwicklung & Prototype */}
                  <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setExpandedPhase2(!expandedPhase2)}
                      className="w-full p-6 hover:bg-slate-50 transition-colors flex items-center justify-between"
                    >
                      <div className="text-left flex-1">
                        <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                          <span>🔨</span> Phase 2: Entwicklung & Prototype
                        </h4>
                      </div>
                      <span className="text-2xl ml-4 transition-transform duration-300" style={{ transform: expandedPhase2 ? 'rotate(45deg)' : 'rotate(0deg)' }}>➕</span>
                    </button>

                    {expandedPhase2 && (
                    <div className="px-6 py-6 border-t border-slate-200 bg-slate-50 space-y-4">
                    <p className="text-slate-700 mb-4">
                      Jetzt wird es konkret! Hier sind die Schritte, je nach Spieltyp:
                    </p>

                    <div className="space-y-4">
                      <div className="bg-white p-4 rounded border border-slate-200">
                        <p className="font-semibold text-slate-900 mb-2">📀 Allgemein: Was muss klar sein?</p>
                        <ul className="text-sm text-slate-700 space-y-1 list-disc list-inside">
                          <li><strong>Spielregeln:</strong> Schreibt sie auf! Klar & verständlich. Testet sie mit Unbeteiligten.</li>
                          <li><strong>Spielablauf:</strong> Wie lange dauert eine Runde? Wann endet es?</li>
                          <li><strong>Punkte/Gewinner:</strong> Wie gewinnt man? Was ist die Metrik?</li>
                          <li><strong>Spieler-Erlebnis:</strong> Wo sind die motivierenden Momente? (Challenges, Belohnungen, FUN!)</li>
                        </ul>
                      </div>

                      <div className="bg-white p-4 rounded border border-slate-200">
                        <p className="font-semibold text-slate-900 mb-2">📋 Für Kahoot/Quiz:</p>
                        <ul className="text-sm text-slate-700 space-y-1 list-disc list-inside">
                          <li>Registriert euch auf Kahoot.com</li>
                          <li>Schreibt 10-20 gute Fragen (je schwächer zu. Oder: Mix?)</li>
                          <li>Multiple-Choice mit 4 Optionen</li>
                          <li>Testet es in der Gruppe</li>
                        </ul>
                      </div>

                      <div className="bg-white p-4 rounded border border-slate-200">
                        <p className="font-semibold text-slate-900 mb-2">🎲 Für Brettspiel:</p>
                        <ul className="text-sm text-slate-700 space-y-1 list-disc list-inside">
                          <li>Spielfeld designen (z.B. auf großem Papier)</li>
                          <li>30-50 Aufgabenkarten beschreiben</li>
                          <li>Würfel & Spielfiguren besorgen</li>
                          <li>Spielregeln testen in Gruppe</li>
                        </ul>
                      </div>

                      <div className="bg-white p-4 rounded border border-slate-200">
                        <p className="font-semibold text-slate-900 mb-2">🎭 Für Activity/Tabu:</p>
                        <ul className="text-sm text-slate-700 space-y-1 list-disc list-inside">
                          <li>100+ Begriffe schreiben (oder Bilder zeichnen)</li>
                          <li>Karten schön beschriften</li>
                          <li>Stoppen & Teamverwaltung: Wie zählt man?</li>
                          <li>Testlauf mit echtem Team</li>
                        </ul>
                      </div>
                    </div>
                    </div>
                    )}
                  </div>

                  {/* Phase 3: Test mit Schülern & Optimierung */}
                  <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setExpandedPhase3(!expandedPhase3)}
                      className="w-full p-6 hover:bg-slate-50 transition-colors flex items-center justify-between"
                    >
                      <div className="text-left flex-1">
                        <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                          <span>🧪</span> Phase 3: Test mit Schülern & Optimierung
                        </h4>
                      </div>
                      <span className="text-2xl ml-4 transition-transform duration-300" style={{ transform: expandedPhase3 ? 'rotate(45deg)' : 'rotate(0deg)' }}>➕</span>
                    </button>

                    {expandedPhase3 && (
                    <div className="px-6 py-6 border-t border-slate-200 bg-slate-50 space-y-4">
                    <p className="text-slate-700 mb-4">
                      Ihr testertet das Spiel mit echten Spielern (andere Schüler, nicht eure Gruppe):
                    </p>

                    <div className="space-y-4">
                      <div className="bg-white p-4 rounded border border-slate-200">
                        <p className="font-semibold text-slate-900 mb-2">📝 Versuchsaufbau</p>
                        <ul className="text-sm text-slate-700 space-y-1 list-disc list-inside">
                          <li><strong>Versuchsgruppe:</strong> Schüler, die das Lernspiel spielen (min. 10 Personen, besser mehr)</li>
                          <li><strong>Kontrollgruppe (optional):</strong> Schüler, die traditionell lernen (zum Vergleich)</li>
                          <li><strong>Zeit:</strong> Ein oder mehrere Sessions durchführen</li>
                          <li><strong>Beobachtung:</strong> Macht Notizen! Wo lachen Spieler? Wo verstehen sie nicht?</li>
                        </ul>
                      </div>

                      <div className="bg-white p-4 rounded border border-slate-200">
                        <p className="font-semibold text-slate-900 mb-2">📋 Beobachtungskriterien (Vor & Nach)</p>
                        <ul className="text-sm text-slate-700 space-y-1 list-disc list-inside">
                          <li><strong>Ausgangs-Zustand (Vor Spiel):</strong> Wie motiviert sind die Spieler? (1-10 Skala)</li>
                          <li><strong>Während Spiel:</strong> Engagement, Spaß, Verständnis des Inhalts?</li>
                          <li><strong>End-Zustand (Nach Spiel):</strong> Haben sie gelernt? Macht es noch Spaß? Möchten sie nochmal?</li>
                        </ul>
                      </div>

                      <div className="bg-white p-4 rounded border border-slate-200">
                        <p className="font-semibold text-slate-900 mb-2">🔄 Optimierung</p>
                        <p className="text-sm text-slate-700 mb-2">Nach dem ersten Test: Was funktioniert NICHT?</p>
                        <ul className="text-sm text-slate-700 space-y-1 list-disc list-inside">
                          <li>Sind Regeln zu komplex? → Vereinfachen!</li>
                          <li>Ist es ZU einfach? → Schwierigkeit erhöhen</li>
                          <li>Finden Spieler das Thema langweilig? → Motivations-Element verstärken (Gamification!)</li>
                          <li>Technische Probleme bei Kahoot? → Check Internet & Geräte</li>
                          <li>Zu laut/chaotisch? → Raumänderung oder Regeln anpassen</li>
                        </ul>
                      </div>
                    </div>
                    </div>
                    )}
                  </div>

                  {/* Phase 4: Evaluation & Lernerfolg-Messung */}
                  <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setExpandedPhase4(!expandedPhase4)}
                      className="w-full p-6 hover:bg-slate-50 transition-colors flex items-center justify-between"
                    >
                      <div className="text-left flex-1">
                        <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                          <span>📊</span> Phase 4: Evaluation & Lernerfolg-Messung
                        </h4>
                      </div>
                      <span className="text-2xl ml-4 transition-transform duration-300" style={{ transform: expandedPhase4 ? 'rotate(45deg)' : 'rotate(0deg)' }}>➕</span>
                    </button>

                    {expandedPhase4 && (
                    <div className="px-6 py-6 border-t border-slate-200 bg-slate-50 space-y-4">
                    <p className="text-slate-700 mb-4">
                      Jetzt wird es wissenschaftlich! Ihr müsst klar zeigen: Hat das Lernspiel funktioniert?
                    </p>

                    <div className="space-y-4">
                      <div className="bg-white p-4 rounded border border-slate-200">
                        <p className="font-semibold text-slate-900 mb-2">📝 Evaluationsbogen (von euch erstellt!)</p>
                        <p className="text-xs text-slate-600 mb-2">Ein Evaluationsbogen sollte folgende Bereiche checken:</p>
                        <ul className="text-sm text-slate-700 space-y-2 list-none">
                          <li><strong>✓ Spaßfaktor:</strong> "Hat dir das Spiel Spaß gemacht?" (1-5 oder ja/nein)</li>
                          <li><strong>✓ Verständnis:</strong> Konkrete Fragen zum gelernten Inhalt</li>
                          <li><strong>✓ Motivation:</strong> "Sind die bereit nochmal zu spielen?" / Vergleich zu normalem Unterricht</li>
                          <li><strong>✓ Teamfähigkeit:</strong> "Warst du mit anderen zusammengearbeitet?" (falls relevant)</li>
                          <li><strong>✓ Usability:</strong> "Waren die Regeln verständlich?" "Haben die Grafiken/Musik geholfen?"</li>
                          <li><strong>✓ Verbesserungen:</strong> Offene Frage: Was hätte beliebt sein können?</li>
                        </ul>
                      </div>

                      <div className="bg-white p-4 rounded border border-slate-200">
                        <p className="font-semibold text-slate-900 mb-2">📈 Wie messt ihr Lernerfolg? (Theorieteil)</p>
                        <div className="text-sm text-slate-700 space-y-2">
                          <p><strong>Methode 1: Pre-Post Test</strong></p>
                          <p className="ml-4">- Test VOR dem Spiel (Pre-Test)</p>
                          <p className="ml-4">- Spiel spielen</p>
                          <p className="ml-4">- Test NACH dem Spiel (Post-Test)</p>
                          <p className="ml-4">- Unterschied = Lernerfolg</p>
                          
                          <p className="mt-2"><strong>Methode 2: Beobachtung & Dokumentation</strong></p>
                          <p className="ml-4">- Konnte der Spieler vorher Rechnungen lösen? Nein!</p>
                          <p className="ml-4">- Nach dem Spiel? Ja! → Lernerfolg!</p>
                          
                          <p className="mt-2"><strong>Methode 3: Zufriedenheitsvergleich</strong></p>
                          <p className="ml-4">- "Wie viel Spaß hat Lernspiel gemacht?" (1-10)</p>
                          <p className="ml-4">- "Wie viel Spaß macht normaler Unterricht?" (1-10)</p>
                          <p className="ml-4">- Unterschied zeigt Motivation-Boost</p>
                        </div>
                      </div>

                      <div className="bg-white p-4 rounded border border-slate-200">
                        <p className="font-semibold text-slate-900 mb-2">🎯 Konkrete Maßnahmen (Pick 1-2):</p>
                        <div className="text-sm text-slate-700 space-y-2">
                          <p><strong>Option A: Mini-Leistungsnachweis</strong></p>
                          <p className="ml-4">z.B. kleiner 5-Minuten-Test zu den Lerninhalten NACH dem Spiel</p>
                          <p className="ml-4">→ "Konnten 80% der Spieler die Aufgaben lösen?"</p>
                          
                          <p className="mt-2"><strong>Option B: Zufriedenheitsumfrage</strong></p>
                          <p className="ml-4">Fragebogen an die Spieler: Spaß? Lernerfolg? Engagement?</p>
                          
                          <p className="mt-2"><strong>Option C: Lehrer-Feedback (falls Lehrperson dabei war)</strong></p>
                          <p className="ml-4">0-10 Rating: "Hat das Lernspiel einen Unterschied gemacht?"</p>
                        </div>
                      </div>

                      <div className="bg-white p-4 rounded border border-slate-200">
                        <p className="font-semibold text-slate-900 mb-2">🔒 Wichtig - Datenschutz!</p>
                        <p className="text-sm text-slate-700">
                          ⚠️ Wenn ihr Feedback sammelt: KEINE persönlichen Daten! Keine Namen in Umfragen! Alles anonym halten. Wenn Lehrperson oder Eltern involved: Erlaubnis holen!
                        </p>
                      </div>
                    </div>
                    </div>
                    )}
                  </div>

                  {/* Checklist */}
                  <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                    <p className="font-bold text-slate-900 mb-4 text-lg">✅ Komplett-Checklist für Aufgabe 3</p>
                    <div className="grid md:grid-cols-2 gap-6 text-sm text-slate-700">
                      <div>
                        <p className="font-semibold text-slate-900 mb-2">📋 Planung:</p>
                        <ul className="space-y-1 list-none">
                          <li>☐ Zielgruppe & Alter</li>
                          <li>☐ Lernziel konkret</li>
                          <li>☐ Fach & Thema</li>
                          <li>☐ Material & Werkzeuge</li>
                          <li>☐ Spieltyp gewählt</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 mb-2">🎮 Entwicklung:</p>
                        <ul className="space-y-1 list-none">
                          <li>☐ Regeln aufgeschrieben</li>
                          <li>☐ Prototype/Prototyp gemacht</li>
                          <li>☐ Inhaltliche Korrektheit gecheckt</li>
                          <li>☐ Mit Gruppe getestet</li>
                          <li>☐ Bugs/Fehler behoben</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 mb-2">🧪 Test & Iteration:</p>
                        <ul className="space-y-1 list-none">
                          <li>☐ Mit 10+ anderen Schülern getestet</li>
                          <li>☐ Beobachtungen dokumentiert</li>
                          <li>☐ Feedback gesammelt</li>
                          <li>☐ Optimierungen gemacht</li>
                          <li>☐ Version 2.0 erstellt</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 mb-2">📊 Evaluation:</p>
                        <ul className="space-y-1 list-none">
                          <li>☐ Evaluationsbogen erstellt</li>
                          <li>☐ Pre/Post Tests durchgeführt</li>
                          <li>☐ Daten gesammelt & ausgewertet</li>
                          <li>☐ Ergebnisse dokumentiert</li>
                          <li>☐ Präsentation vorbereitet</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Final Note */}
                  <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                    <p className="font-bold text-slate-900 mb-2 text-lg">🚀 Die große Mission der A-Tutor-League</p>
                    <p className="text-slate-700">
                      Mit dieser Aufgabe zeigt ihr nicht nur, dass ihr die Motivationspsychologie versteht, sondern auch, dass ihr sie PRAKTISCH umsetzen könnt! Das Ziel ist klar: Ein Lernspiel, das real funktioniert, echte Schüler motiviert und echte Lehrinhalte vermittelt. 
                    </p>
                    <p className="text-slate-700 mt-3">
                      <strong>Das ist Gamification in echt!</strong> 🎮✨
                    </p>
                  </div>
                </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'infotexte' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">📚 Infotexte zu den 5 Motivationstheorien</h2>
              
              {/* Maslow */}
              <div className="border rounded-lg overflow-hidden">
                <button
                  onClick={() => setExpandedInfotexte({ ...expandedInfotexte, 1: !expandedInfotexte[1] })}
                  className="w-full px-6 py-4 bg-slate-50 hover:bg-slate-100 transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-3 text-left flex-1">
                    <span className="text-2xl">🔺</span>
                    <h3 className="font-bold text-slate-900">Bedürfnispyramide nach Maslow</h3>
                  </div>
                  <span className="text-2xl ml-4 transition-transform duration-300" style={{ transform: expandedInfotexte[1] ? 'rotate(45deg)' : 'rotate(0deg)' }}>➕</span>
                </button>
                {expandedInfotexte[1] && (
                  <div className="px-6 py-4 bg-white border-t space-y-3 text-slate-700 text-sm leading-relaxed">
                    <p><strong>Was ist das?</strong> Der Psychologe Abraham Maslow wollte verstehen, was Menschen antreibt. Er fand heraus, dass wir viele verschiedene Bedürfnisse haben. Diese ordnete er in einer Pyramide mit fünf Stufen an. Die Grundidee ist einfach: Man muss erst die unteren Stufen erfüllen, bevor man sich um die höheren Dinge kümmern kann.</p>
                    
                    <div>
                      <p className="font-semibold mb-2">Die fünf Stufen im Detail:</p>
                      <ol className="list-decimal list-inside space-y-2 ml-2">
                        <li><strong>Grundbedürfnisse:</strong> Das ist das Fundament. Hierzu gehören Essen, Trinken, Schlafen und Atmen. Wenn ein Mensch hungrig ist oder keine Luft bekommt, ist ihm alles andere egal.</li>
                        <li><strong>Sicherheit:</strong> Wenn wir satt sind, wollen wir uns sicher fühlen. Wir brauchen eine Wohnung, Schutz vor Gewalt, einen festen Job und Gesetze, auf die wir uns verlassen können.</li>
                        <li><strong>Soziale Bedürfnisse:</strong> Der Mensch ist ein Gruppentier. Wir brauchen Freunde, Familie und das Gefühl, geliebt zu werden und dazuzugehören. Niemand ist gerne dauerhaft allein.</li>
                        <li><strong>Anerkennung und Erfolg:</strong> Hier geht es um das Ego. Wir möchten, dass andere uns loben und respektieren. Wir wollen wichtig sein, Erfolg im Beruf haben und ein gesundes Selbstbewusstsein aufbauen.</li>
                        <li><strong>Selbstverwirklichung:</strong> Das ist die Spitze. Hier geht es darum, seine eigenen Talente zu nutzen. Ein Maler will malen, ein Musiker will spielen. Man möchte die beste Version seiner selbst werden.</li>
                      </ol>
                    </div>
                    
                    <p><strong>Besonderheiten:</strong> Maslow sagt, dass die ersten vier Stufen „Defizitbedürfnisse" sind. Das bedeutet: Wenn sie fehlen, sind wir unglücklich. Wenn sie erfüllt sind, denken wir nicht mehr viel darüber nach. Die 5. Stufe ist ein „Wachstumsbedürfnis". Man kann nie „genug" Selbstverwirklichung haben.</p>
                    
                    <div className="bg-slate-50 p-3 rounded">
                      <p className="font-semibold mb-2">Fragen für die Gruppe:</p>
                      <ul className="space-y-1 ml-4 list-disc list-inside">
                        <li>Warum kann ein Schüler, der in der Schule gemobbt wird (Stufe 2/3), sich oft schlecht auf den Lernstoff konzentrieren?</li>
                        <li>Gibt es Menschen, die Stufe 5 erreichen, obwohl sie arm sind? Findet Beispiele.</li>
                        <li>Erstellt eine eigene Pyramide für euren Alltag: Was ist für euch persönlich am wichtigsten?</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              {/* Klassische Konditionierung */}
              <div className="border rounded-lg overflow-hidden">
                <button
                  onClick={() => setExpandedInfotexte({ ...expandedInfotexte, 2: !expandedInfotexte[2] })}
                  className="w-full px-6 py-4 bg-slate-50 hover:bg-slate-100 transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-3 text-left flex-1">
                    <span className="text-2xl">🔔</span>
                    <h3 className="font-bold text-slate-900">Klassische Konditionierung</h3>
                  </div>
                  <span className="text-2xl ml-4 transition-transform duration-300" style={{ transform: expandedInfotexte[2] ? 'rotate(45deg)' : 'rotate(0deg)' }}>➕</span>
                </button>
                {expandedInfotexte[2] && (
                  <div className="px-6 py-4 bg-white border-t space-y-3 text-slate-700 text-sm leading-relaxed">
                    <p><strong>Was ist das?</strong> Die klassische Konditionierung erklärt, wie wir lernen, zwei Dinge miteinander zu verknüpfen. Entdeckt wurde das vom Forscher Iwan Pawlow. Er arbeitete mit Hunden und bemerkte, dass sie schon Speichel produzierten, bevor das Futter überhaupt da war.</p>
                    
                    <div>
                      <p className="font-semibold mb-2">Wie funktioniert der Prozess?</p>
                      <ol className="list-decimal list-inside space-y-2 ml-2">
                        <li><strong>Vor dem Lernen:</strong> Es gibt natürliche Reize. Wenn ein Hund Futter sieht, läuft ihm das Wasser im Mund zusammen. Das ist ein angeborener Reflex. Ein neutrales Geräusch, wie eine Glocke, löst erst einmal gar nichts aus.</li>
                        <li><strong>Während des Lernens:</strong> Man lässt die Glocke läuten und gibt dem Hund direkt danach Futter. Das wiederholt man viele Male. Das Gehirn des Hundes lernt: „Glocke bedeutet Futter!".</li>
                        <li><strong>Nach dem Lernen:</strong> Jetzt reicht das Geräusch der Glocke allein aus. Der Hund produziert Speichel, auch wenn gar kein Futter zu sehen ist. Er ist „konditioniert".</li>
                      </ol>
                    </div>
                    
                    <div>
                      <p className="font-semibold mb-2">Wichtige Begriffe:</p>
                      <ul className="space-y-1 ml-4 list-disc list-inside">
                        <li><strong>Reiz-Reaktions-Kette:</strong> Ein Signal führt automatisch zu einem Verhalten.</li>
                        <li><strong>Löschung:</strong> Wenn man die Glocke 100-mal läutet, ohne jemals wieder Futter zu geben, vergisst der Hund die Verbindung irgendwann.</li>
                        <li><strong>Generalisierung:</strong> Wenn der Hund auch auf ein ähnliches Geräusch (z.B. eine Klingel) reagiert, nennt man das Generalisierung.</li>
                      </ul>
                    </div>
                    
                    <div className="bg-slate-50 p-3 rounded">
                      <p className="font-semibold mb-2">Fragen für die Gruppe:</p>
                      <ul className="space-y-1 ml-4 list-disc list-inside">
                        <li>Ein Schüler hat einmal eine schlimme Erfahrung bei einer Mathearbeit gemacht. Jetzt hat er schon Angst, wenn er nur den Matheraum betritt. Erklärt das mit der Theorie von Pawlow.</li>
                        <li>Wie nutzt die Werbung dieses Prinzip? (Tipp: Schöne Musik + ein neues Handy).</li>
                        <li>Kann man Konditionierung im Alltag nutzen, um sich selbst bessere Gewohnheiten anzugewöhnen?</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              {/* Flow */}
              <div className="border rounded-lg overflow-hidden">
                <button
                  onClick={() => setExpandedInfotexte({ ...expandedInfotexte, 3: !expandedInfotexte[3] })}
                  className="w-full px-6 py-4 bg-slate-50 hover:bg-slate-100 transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-3 text-left flex-1">
                    <span className="text-2xl">🌊</span>
                    <h3 className="font-bold text-slate-900">Flow-Theorie nach Csikszentmihalyi</h3>
                  </div>
                  <span className="text-2xl ml-4 transition-transform duration-300" style={{ transform: expandedInfotexte[3] ? 'rotate(45deg)' : 'rotate(0deg)' }}>➕</span>
                </button>
                {expandedInfotexte[3] && (
                  <div className="px-6 py-4 bg-white border-t space-y-3 text-slate-700 text-sm leading-relaxed">
                    <p><strong>Was ist das?</strong> Der Forscher Mihály Csíkszentmihályi untersuchte Menschen, die in ihrer Arbeit völlig aufgehen. Er nannte diesen Zustand „Flow" (Englisch für Fließen). Im Flow vergisst man die Welt um sich herum, man spürt keinen Hunger und verliert das Zeitgefühl.</p>
                    
                    <div>
                      <p className="font-semibold mb-2">Wann entsteht Flow? Flow passiert nicht einfach so. Es müssen bestimmte Bedingungen erfüllt sein:</p>
                      <ol className="list-decimal list-inside space-y-2 ml-2">
                        <li><strong>Das richtige Gleichgewicht:</strong> Die Aufgabe darf nicht zu schwer sein (sonst bekommt man Angst oder Stress). Sie darf aber auch nicht zu leicht sein (sonst wird einem langweilig). Die Anforderung muss genau zu deinen Fähigkeiten passen.</li>
                        <li><strong>Klares Ziel:</strong> Du musst genau wissen, was zu tun ist.</li>
                        <li><strong>Direktes Feedback:</strong> Du musst sofort merken, ob du Erfolg hast (z.B. beim Klettern hält der Griff, beim Videospiel steigt die Punktzahl).</li>
                        <li><strong>Tiefe Konzentration:</strong> Man ist so fokussiert, dass man das eigene „Ich" und alle Sorgen vergisst.</li>
                      </ol>
                    </div>
                    
                    <p><strong>Warum ist Flow wichtig?</strong> Menschen im Flow sind extrem leistungsfähig und gleichzeitig sehr glücklich. Es ist eine der gesündesten Formen der Arbeit.</p>
                    
                    <div className="bg-slate-50 p-3 rounded">
                      <p className="font-semibold mb-2">Fragen für die Gruppe:</p>
                      <ul className="space-y-1 ml-4 list-disc list-inside">
                        <li>Warum fühlen sich viele Schüler im Unterricht eher gelangweilt oder gestresst statt im „Flow"?</li>
                        <li>Gamer erleben oft Flow. Welche Elemente in Videospielen sorgen dafür?</li>
                        <li>Überlegt euch eine Aktivität (Sport, Musik, Hobby) und beschreibt genau, wie sich Flow dort anfühlt.</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              {/* Intrinsische / Extrinsische Motivation */}
              <div className="border rounded-lg overflow-hidden">
                <button
                  onClick={() => setExpandedInfotexte({ ...expandedInfotexte, 4: !expandedInfotexte[4] })}
                  className="w-full px-6 py-4 bg-slate-50 hover:bg-slate-100 transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-3 text-left flex-1">
                    <span className="text-2xl">⚡</span>
                    <h3 className="font-bold text-slate-900">Intrinsische & Extrinsische Motivation</h3>
                  </div>
                  <span className="text-2xl ml-4 transition-transform duration-300" style={{ transform: expandedInfotexte[4] ? 'rotate(45deg)' : 'rotate(0deg)' }}>➕</span>
                </button>
                {expandedInfotexte[4] && (
                  <div className="px-6 py-4 bg-white border-t space-y-3 text-slate-700 text-sm leading-relaxed">
                    <p><strong>Was ist das?</strong> Motivation ist der Grund, warum wir morgens aufstehen und Dinge tun. Die Psychologie unterscheidet zwei Quellen für diesen Antrieb:</p>
                    
                    <div>
                      <p className="font-semibold mb-2">1. Intrinsische Motivation (von innen):</p>
                      <p className="ml-4">Du tust etwas, weil die Sache selbst dir Spaß macht. Du liest ein Buch, weil die Geschichte spannend ist. Du spielst Fußball, weil du die Bewegung liebst.</p>
                      <ul className="space-y-1 ml-4 mt-2 list-disc list-inside">
                        <li><strong>Vorteil:</strong> Man hält länger durch, ist kreativer und glücklicher.</li>
                        <li><strong>Bedingung:</strong> Man muss sich frei fühlen und merken, dass man etwas gut kann.</li>
                      </ul>
                    </div>
                    
                    <div>
                      <p className="font-semibold mb-2">2. Extrinsische Motivation (von außen):</p>
                      <p className="ml-4">Du tust etwas, um eine Belohnung zu bekommen oder eine Strafe zu vermeiden. Du lernst für eine gute Note. Du arbeitest für Geld. Du räumst dein Zimmer auf, damit deine Eltern nicht schimpfen.</p>
                      <ul className="space-y-1 ml-4 mt-2 list-disc list-inside">
                        <li><strong>Vorteil:</strong> Sie hilft uns, auch langweilige Aufgaben zu erledigen.</li>
                        <li><strong>Nachteil:</strong> Wenn die Belohnung (z.B. das Geld) wegfällt, hört man sofort auf.</li>
                      </ul>
                    </div>
                    
                    <div className="bg-blue-50 p-3 rounded">
                      <p className="font-semibold mb-2">Das Problem der Belohnung (Korrumpierungseffekt):</p>
                      <p>Forscher haben herausgefunden: Wenn man jemandem Geld für eine Sache gibt, die er vorher freiwillig und gerne gemacht hat, verliert er oft den Spaß daran. Die äußere Belohnung „zerstört" die innere Freude.</p>
                    </div>
                    
                    <div className="bg-slate-50 p-3 rounded">
                      <p className="font-semibold mb-2">Fragen für die Gruppe:</p>
                      <ul className="space-y-1 ml-4 list-disc list-inside">
                        <li>Seid ihr für die Schule eher intrinsisch oder extrinsisch motiviert? Woran liegt das?</li>
                        <li>Sollten Eltern ihre Kinder für gute Noten mit Geld belohnen? Diskutiert die Vor- und Nachteile.</li>
                        <li>Wie kann ein Lehrer den Unterricht so gestalten, dass Schüler mehr Lust „von innen" bekommen?</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              {/* Dopamin / Belohnungssystem */}
              <div className="border rounded-lg overflow-hidden">
                <button
                  onClick={() => setExpandedInfotexte({ ...expandedInfotexte, 5: !expandedInfotexte[5] })}
                  className="w-full px-6 py-4 bg-slate-50 hover:bg-slate-100 transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-3 text-left flex-1">
                    <span className="text-2xl">🎁</span>
                    <h3 className="font-bold text-slate-900">Belohnungssysteme im Gehirn</h3>
                  </div>
                  <span className="text-2xl ml-4 transition-transform duration-300" style={{ transform: expandedInfotexte[5] ? 'rotate(45deg)' : 'rotate(0deg)' }}>➕</span>
                </button>
                {expandedInfotexte[5] && (
                  <div className="px-6 py-4 bg-white border-t space-y-3 text-slate-700 text-sm leading-relaxed">
                    <p><strong>Was ist das?</strong> In unserem Gehirn gibt es ein Zentrum, das uns steuert: das Belohnungssystem. Es ist dafür da, dass wir Dinge wiederholen, die gut für uns sind (wie Essen oder Lernen). Der wichtigste Botenstoff dabei ist Dopamin.</p>
                    
                    <div>
                      <p className="font-semibold mb-2">Wie funktioniert es?</p>
                      <p className="ml-4">Wenn wir ein Ziel erreichen oder eine positive Überraschung erleben, schüttet das Gehirn Dopamin aus. Das fühlt sich toll an – wie ein kleiner Glücksschub. Unser Gehirn merkt sich das und sagt: „Das war super, mach das nochmal!"</p>
                    </div>
                    
                    <div>
                      <p className="font-semibold mb-2">Die zwei Seiten des Systems:</p>
                      <ol className="list-decimal list-inside space-y-2 ml-2">
                        <li><strong>Die gute Seite:</strong> Es hilft uns, motiviert zu bleiben. Wenn wir eine schwierige Aufgabe lösen, fühlen wir uns stolz. Das ist der natürliche Lohn.</li>
                        <li><strong>Die Gefahr:</strong> Das Gehirn kann ausgetrickst werden. Drogen, Zucker, aber auch soziale Medien (Likes auf Instagram, TikTok-Videos) schütten künstlich viel Dopamin aus. Das Gehirn will dann immer mehr davon. So entstehen Süchte.</li>
                      </ol>
                    </div>
                    
                    <div className="bg-orange-50 p-3 rounded">
                      <p className="font-semibold mb-2">Wichtig zu wissen:</p>
                      <p>Das Gehirn reagiert besonders stark auf unvorhersehbare Belohnungen. Wenn wir nicht wissen, ob wir im nächsten Moment ein „Like" bekommen oder im Spiel gewinnen, bleibt der Dopaminspiegel besonders hoch. Das nennt man „Intermittierende Verstärkung".</p>
                    </div>
                    
                    <div className="bg-slate-50 p-3 rounded">
                      <p className="font-semibold mb-2">Fragen für die Gruppe:</p>
                      <ul className="space-y-1 ml-4 list-disc list-inside">
                        <li>Warum ist es so schwer, das Handy wegzulegen, wenn man einmal angefangen hat zu scrollen? Erklärt es mit dem Belohnungssystem.</li>
                        <li>Wie fühlt man sich, wenn man eine Belohnung fest erwartet hat, sie dann aber nicht bekommt? Was passiert dann mit der Motivation?</li>
                        <li>Wie kann man sich selbst beim Lernen belohnen, ohne in eine Suchtfalle zu tappen?</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'uebungen' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Praktische Übungen</h2>
              
              {!quizStarted ? (
                <div className="space-y-6">
                  <p className="text-slate-700 mb-6">Hier kannst du dein Wissen über Motivationspsychologie in praktischen Szenarien testen und anwenden.</p>
                  
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-8">
                    <h3 className="text-2xl font-bold text-slate-900 mb-4">🧠 Quiz: Motivationstheorien</h3>
                    <p className="text-slate-700 mb-6">Teste dein Wissen zu den 5 Motivationstheorien! Das Quiz hat 12 Fragen mit sofortigem Feedback nach jeder Antwort.</p>
                    <div className="space-y-3 mb-8">
                      <p className="text-sm text-slate-600">✓ Maslow - Bedürfnishierarchie</p>
                      <p className="text-sm text-slate-600">✓ Klassische & Operante Konditionierung</p>
                      <p className="text-sm text-slate-600">✓ Flow-Zustand nach Csikszentmihalyi</p>
                      <p className="text-sm text-slate-600">✓ Intrinsische & Extrinsische Motivation</p>
                      <p className="text-sm text-slate-600">✓ Dopamin & Belohnungssystem</p>
                    </div>
                    <button
                      onClick={() => setQuizStarted(true)}
                      className="py-3 px-6 bg-slate-700 hover:bg-slate-800 text-white rounded-lg font-bold text-lg transition-colors"
                    >
                      Quiz starten
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white border-2 border-slate-200 rounded-lg p-8">
                  {/* Progress Bar */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-semibold text-slate-700">Frage {currentQuestionIndex + 1} von {quizQuestions.length}</span>
                      <span className="text-sm font-semibold text-slate-700">{getProgressPercentage()}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-3">
                      <div
                        className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${getProgressPercentage()}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Quiz Complete Screen */}
                  {isQuizComplete && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                      <div className="bg-white rounded-lg p-8 max-w-md">
                        <h3 className="text-2xl font-bold text-center mb-4">🎉 Quiz abgeschlossen!</h3>
                        <div className="text-center mb-6">
                          <p className="text-5xl font-bold text-slate-800 mb-2">{score}/{quizQuestions.length}</p>
                          <p className="text-lg text-slate-700">Punkte erreicht</p>
                          <p className="text-sm text-slate-600 mt-2">
                            {score === quizQuestions.length && 'Perfekt! Du beherrschst alle Theorien!'}
                            {score >= 10 && score < quizQuestions.length && 'Sehr gut! Dein Wissen ist beeindruckend!'}
                            {score >= 8 && score < 10 && 'Gut! Du hast ein solides Verständnis.'}
                            {score >= 6 && score < 8 && 'Naja, noch Raum für Verbesserung. Lies die Infotexte nochmal durch!'}
                            {score < 6 && 'Hast du die Infotexte gelesen? Versuch es nochmal!'}
                          </p>
                        </div>
                        <button
                          onClick={handleRestartQuiz}
                          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-colors"
                        >
                          Quiz erneut starten
                        </button>
                      </div>
                    </div>
                  )}

                  {!isQuizComplete && (
                    <>
                      {/* Theory Badge */}
                      <div className="mb-6 inline-block">
                        <span className="bg-slate-200 text-slate-700 px-4 py-2 rounded-full text-sm font-semibold">
                          Theorie: {currentQuestion.theory}
                        </span>
                      </div>

                      {/* Question */}
                      <h3 className="text-xl font-bold text-slate-900 mb-8">{currentQuestion.question}</h3>

                      {/* Answer Options */}
                      <div className="space-y-4 mb-8">
                        {currentQuestion.options.map((option, idx) => {
                          const isSelected = selectedAnswer === idx
                          const isCorrect = idx === currentQuestion.correctAnswer
                          const showFeedback = answered

                          let buttonClass = 'bg-white border-2 border-slate-300 hover:border-blue-400'

                          if (showFeedback) {
                            if (isCorrect) {
                              buttonClass = 'bg-green-50 border-2 border-green-500'
                            } else if (isSelected && !isCorrect) {
                              buttonClass = 'bg-red-50 border-2 border-red-500'
                            }
                          } else if (isSelected) {
                            buttonClass = 'bg-blue-50 border-2 border-blue-500'
                          }

                          return (
                            <button
                              key={idx}
                              onClick={() => handleAnswerClick(idx)}
                              disabled={answered}
                              className={`w-full p-4 rounded-lg font-semibold text-left transition-colors ${buttonClass} ${
                                answered ? 'cursor-default' : 'cursor-pointer'
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-6 h-6 rounded-full border-2 border-current flex items-center justify-center mt-0.5">
                                  {showFeedback && isCorrect && <span className="text-green-600">✓</span>}
                                  {showFeedback && isSelected && !isCorrect && <span className="text-red-600">✗</span>}
                                  {!showFeedback && <span className="text-slate-400">{idx + 1}</span>}
                                </div>
                                <span>{option}</span>
                              </div>
                            </button>
                          )
                        })}
                      </div>

                      {/* Feedback */}
                      {answered && (
                        <div className={`p-4 rounded-lg mb-8 ${
                          selectedAnswer === currentQuestion.correctAnswer
                            ? 'bg-green-50 border-l-4 border-green-500 text-green-800'
                            : 'bg-red-50 border-l-4 border-red-500 text-red-800'
                        }`}>
                          <p className="font-semibold mb-2">
                            {selectedAnswer === currentQuestion.correctAnswer ? '✓ Korrekt!' : '✗ Leider falsch'}
                          </p>
                          <p className="text-sm">{currentQuestion.explanation}</p>
                        </div>
                      )}

                      {/* Navigation Buttons */}
                      <div className="flex gap-4">
                        <button
                          onClick={handlePreviousQuestion}
                          disabled={currentQuestionIndex === 0}
                          className={`py-3 px-6 rounded-lg font-semibold transition-colors ${
                            currentQuestionIndex === 0
                              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                              : 'bg-slate-300 hover:bg-slate-400 text-slate-900'
                          }`}
                        >
                          ← Vorherige
                        </button>
                        
                        {!isQuizComplete ? (
                          <button
                            onClick={handleNextQuestion}
                            disabled={!answered}
                            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-colors ${
                              !answered
                                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                            }`}
                          >
                            Nächste →
                          </button>
                        ) : (
                          <button
                            onClick={handleRestartQuiz}
                            className="flex-1 py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
                          >
                            Neu starten
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

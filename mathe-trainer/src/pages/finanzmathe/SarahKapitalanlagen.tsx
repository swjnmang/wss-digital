import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface PartAnswer {
  input: string
  feedback: string
  showSolution: boolean
}

export default function SarahKapitalanlagen() {
  const navigate = useNavigate()
  const [answers, setAnswers] = useState<Record<string, PartAnswer>>({
    '1.1': { input: '', feedback: '', showSolution: false },
    '1.2': { input: '', feedback: '', showSolution: false },
    '1.3': { input: '', feedback: '', showSolution: false },
    '1.4': { input: '', feedback: '', showSolution: false },
    '1.5': { input: '', feedback: '', showSolution: false }
  })

  const updateAnswer = (part: string, field: string, value: any) => {
    setAnswers(prev => ({
      ...prev,
      [part]: { ...prev[part], [field]: value }
    }))
  }

  const parseInput = (value: string) => {
    return parseFloat(value.replace(',', '.'))
  }

  const checkAnswer = (part: string, correctValue: number, tolerance: number = 1) => {
    const userValue = parseInput(answers[part].input)
    if (isNaN(userValue)) {
      updateAnswer(part, 'feedback', '❌ Bitte eine gültige Zahl eingeben.')
      return
    }
    
    if (Math.abs(userValue - correctValue) <= tolerance) {
      updateAnswer(part, 'feedback', '✅ Richtig! Gute Arbeit.')
    } else {
      updateAnswer(part, 'feedback', `❌ Nicht ganz richtig. Versuche es nochmal oder schau dir die Lösung an.`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-100 rounded-lg shadow-sm transition-colors"
        >
          <i className="fa-solid fa-arrow-left"></i>
          Zurück
        </button>

        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
          <h1 className="text-3xl font-bold text-purple-600 mb-2">Sarah's Finanzplanung</h1>
          <p className="text-gray-500 mb-8 text-sm">Abschlussprüfung Finanzmathematik - Bearbeitungszeit: ca. 45 Minuten</p>

          {/* Aufgabe 1.1 - Zinseszins mit Kontoauszug */}
          <div className="border-l-4 border-purple-600 pl-6 mb-8 pb-8 border-b">
            <h2 className="text-xl font-bold text-gray-800 mb-4">1.1 Kapitalentwicklung</h2>
            <p className="text-gray-700 mb-4">
              Sarah erhält zu ihrem 18. Geburtstag am 15.03.2016 von ihren Großeltern eine Geldanlage von 4.000,00 €. Diesen Betrag legt sie bei ihrer Bank an. Nach Abzug aller Kosten erhält sie jährlich 1,2 % Zinsen auf ihr Guthaben.
              <br/><br/>
              <strong>Berechne, über welches Kapital Sarah am 31.12.2020 verfügen kann.</strong>
            </p>

            {/* Kontoauszug */}
            <div className="bg-gray-50 border border-gray-300 rounded p-4 mb-6 overflow-x-auto">
              <h3 className="font-bold text-center mb-3 text-sm">Kontoauszug Sarah M. - Anlagekonto</h3>
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-300">
                    <th className="px-2 py-2 text-left border">Datum</th>
                    <th className="px-2 py-2 text-left border">Beschreibung</th>
                    <th className="px-2 py-2 text-right border">Betrag (€)</th>
                    <th className="px-2 py-2 text-right border">Kontostand (€)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-white">
                    <td className="px-2 py-2 border">15.03.2016</td>
                    <td className="px-2 py-2 border">Einzahlung Geschenk Großeltern</td>
                    <td className="px-2 py-2 text-right border">4.000,00</td>
                    <td className="px-2 py-2 text-right border font-semibold">4.000,00</td>
                  </tr>
                  <tr className="bg-blue-50">
                    <td className="px-2 py-2 border">31.12.2016</td>
                    <td className="px-2 py-2 border">Zinsgutschrift 1,2%</td>
                    <td className="px-2 py-2 text-right border">48,00</td>
                    <td className="px-2 py-2 text-right border font-semibold">4.048,00</td>
                  </tr>
                  <tr className="bg-white">
                    <td className="px-2 py-2 border">31.12.2017</td>
                    <td className="px-2 py-2 border">Zinsgutschrift 1,2%</td>
                    <td className="px-2 py-2 text-right border">48,58</td>
                    <td className="px-2 py-2 text-right border font-semibold">4.096,58</td>
                  </tr>
                  <tr className="bg-blue-50">
                    <td className="px-2 py-2 border">31.12.2018</td>
                    <td className="px-2 py-2 border">Zinsgutschrift 1,2%</td>
                    <td className="px-2 py-2 text-right border">49,16</td>
                    <td className="px-2 py-2 text-right border font-semibold">4.145,74</td>
                  </tr>
                  <tr className="bg-white">
                    <td className="px-2 py-2 border">31.12.2019</td>
                    <td className="px-2 py-2 border">Zinsgutschrift 1,2%</td>
                    <td className="px-2 py-2 text-right border">49,75</td>
                    <td className="px-2 py-2 text-right border font-semibold">4.195,49</td>
                  </tr>
                  <tr className="bg-blue-50">
                    <td className="px-2 py-2 border">31.12.2020</td>
                    <td className="px-2 py-2 border">Zinsgutschrift 1,2%</td>
                    <td className="px-2 py-2 text-right border">50,35</td>
                    <td className="px-2 py-2 text-right border font-semibold">4.245,84</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <label className="flex items-center gap-2">
                <span className="font-semibold">Kapital am 31.12.2020:</span>
                <input
                  type="text"
                  value={answers['1.1'].input}
                  onChange={(e) => updateAnswer('1.1', 'input', e.target.value)}
                  placeholder="z.B. 4.245,84"
                  className="border border-gray-300 rounded px-3 py-2 w-32"
                />
                <span className="text-gray-600">€</span>
              </label>
            </div>
            <div className="flex gap-3 flex-wrap mb-4">
              <button
                onClick={() => checkAnswer('1.1', 4245.84, 2)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition"
              >
                Prüfen
              </button>
              <button
                onClick={() => updateAnswer('1.1', 'showSolution', !answers['1.1'].showSolution)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition"
              >
                {answers['1.1'].showSolution ? 'Lösung verbergen' : 'Lösung anzeigen'}
              </button>
            </div>
            {answers['1.1'].feedback && <p className="text-sm mb-3">{answers['1.1'].feedback}</p>}
            {answers['1.1'].showSolution && (
              <div className="bg-blue-50 border border-blue-200 rounded p-4 text-sm text-gray-700">
                <strong>Lösung (Zinseszinsformel):</strong><br/>
                K_n = K₀ · q^n<br/>
                K_n = 4.000,00 € · 1,012⁴,8<br/>
                (von 15.03.2016 bis 31.12.2020 ≈ 4,8 Jahre)<br/>
                K_n ≈ 4.245,84 €
              </div>
            )}
          </div>

          {/* Aufgabe 1.2 - Zinsatzberechnung */}
          <div className="border-l-4 border-purple-600 pl-6 mb-8 pb-8 border-b">
            <h2 className="text-xl font-bold text-gray-800 mb-4">1.2 Zinsatzberechnung</h2>
            <p className="text-gray-700 mb-4">
              Sarah überlegt, einen Betrag von 3.500,00 € auf dem Sparkonto anzulegen. Sie möchte, dass dieser Betrag nach 6 Jahren auf 3.750,00 € anwächst.
              <br/><br/>
              <strong>Berechne den erforderlichen Zinssatz in Prozent pro Jahr.</strong>
            </p>
            <div className="flex items-center gap-4 mb-4">
              <label className="flex items-center gap-2">
                <span className="font-semibold">Zinssatz p:</span>
                <input
                  type="text"
                  value={answers['1.2'].input}
                  onChange={(e) => updateAnswer('1.2', 'input', e.target.value)}
                  placeholder="z.B. 1,05"
                  className="border border-gray-300 rounded px-3 py-2 w-32"
                />
                <span className="text-gray-600">%</span>
              </label>
            </div>
            <div className="flex gap-3 flex-wrap mb-4">
              <button
                onClick={() => checkAnswer('1.2', 1.05, 0.15)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition"
              >
                Prüfen
              </button>
              <button
                onClick={() => updateAnswer('1.2', 'showSolution', !answers['1.2'].showSolution)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition"
              >
                {answers['1.2'].showSolution ? 'Lösung verbergen' : 'Lösung anzeigen'}
              </button>
            </div>
            {answers['1.2'].feedback && <p className="text-sm mb-3">{answers['1.2'].feedback}</p>}
            {answers['1.2'].showSolution && (
              <div className="bg-blue-50 border border-blue-200 rounded p-4 text-sm text-gray-700">
                <strong>Lösung:</strong><br/>
                K_n = K₀ · q^n<br/>
                3.750,00 = 3.500,00 · q⁶<br/>
                q⁶ = 3.750,00 / 3.500,00 = 1,0714<br/>
                q = ⁶√1,0714 ≈ 1,0105<br/>
                p = (q - 1) · 100 = 1,05 %
              </div>
            )}
          </div>

          {/* Aufgabe 1.3 - Laufzeitberechnung */}
          <div className="border-l-4 border-purple-600 pl-6 mb-8 pb-8 border-b">
            <h2 className="text-xl font-bold text-gray-800 mb-4">1.3 Laufzeitberechnung</h2>
            <p className="text-gray-700 mb-4">
              Sarah hat 2.500,00 € auf einem Sparkonto und möchte über 3.500,00 € verfügen. Die Bank bietet einen Zinssatz von 1,8 % pro Jahr.
              <br/><br/>
              <strong>Berechne, wie lange Sarah warten muss, bis sie über den gewünschten Betrag verfügt.</strong>
            </p>
            <div className="flex items-center gap-4 mb-4">
              <label className="flex items-center gap-2">
                <span className="font-semibold">Laufzeit:</span>
                <input
                  type="text"
                  value={answers['1.3'].input}
                  onChange={(e) => updateAnswer('1.3', 'input', e.target.value)}
                  placeholder="z.B. 19,50"
                  className="border border-gray-300 rounded px-3 py-2 w-32"
                />
                <span className="text-gray-600">Jahre</span>
              </label>
            </div>
            <div className="flex gap-3 flex-wrap mb-4">
              <button
                onClick={() => checkAnswer('1.3', 19.50, 0.5)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition"
              >
                Prüfen
              </button>
              <button
                onClick={() => updateAnswer('1.3', 'showSolution', !answers['1.3'].showSolution)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition"
              >
                {answers['1.3'].showSolution ? 'Lösung verbergen' : 'Lösung anzeigen'}
              </button>
            </div>
            {answers['1.3'].feedback && <p className="text-sm mb-3">{answers['1.3'].feedback}</p>}
            {answers['1.3'].showSolution && (
              <div className="bg-blue-50 border border-blue-200 rounded p-4 text-sm text-gray-700">
                <strong>Lösung:</strong><br/>
                K_n = K₀ · q^n<br/>
                3.500,00 = 2.500,00 · 1,018^n<br/>
                1,4 = 1,018^n<br/>
                n · lg(1,018) = lg(1,4)<br/>
                n = lg(1,4) / lg(1,018) ≈ 19,50 Jahre
              </div>
            )}
          </div>

          {/* Aufgabe 1.4 - Tilgungsplan mit Darlehensvertrag */}
          <div className="border-l-4 border-purple-600 pl-6 mb-8 pb-8 border-b">
            <h2 className="text-xl font-bold text-gray-800 mb-4">1.4 Tilgungsplan</h2>
            <p className="text-gray-700 mb-4">
              Sarah möchte eine Eigentumswohnung kaufen. Sie benötigt dafür einen Kreditvertrag mit ihrer Bank. Der Darlehensvertrag ist nachfolgend abgedruckt:
            </p>

            {/* Darlehensvertrag */}
            <div className="bg-gray-50 border border-gray-400 rounded p-6 mb-6 text-sm">
              <h3 className="font-bold text-center mb-4">DARLEHENSVERTRAG</h3>
              <p className="mb-4">
                <strong>Zwischen</strong><br/>
                STADTBANK München GmbH<br/>
                Bankstraße 42<br/>
                80802 München<br/>
                <strong>und</strong><br/>
                Sarah M.<br/>
                Musterstraße 15<br/>
                80001 München<br/>
                <br/>
                <strong>wird folgender Vertrag geschlossen:</strong>
              </p>

              <div className="space-y-3">
                <p>
                  <strong>§1 Darlehensbetrag und Auszahlung</strong><br/>
                  Der Darlehensgeber stellt dem Darlehensnehmer einen Betrag von 80.000,00 € zur Verfügung.
                </p>

                <p>
                  <strong>§2 Zinssatz</strong><br/>
                  Das Darlehen ist über den gesamten Zeitraum mit 2,5 % pro Jahr zu verzinsen.
                </p>

                <p>
                  <strong>§3 Laufzeit und Tilgung</strong><br/>
                  (1) Die Darlehenslaufzeit beträgt 5 Jahre ab dem 01.01.2021.<br/>
                  (2) Das Darlehen ist mit jährlich gleichen Raten (Annuität) jeweils zum 31.12. eines jeden Jahres zu tilgen.<br/>
                  (3) Die Laufzeit endet am 31.12.2025.
                </p>

                <p>
                  <strong>§4 Sondertilgung</strong><br/>
                  Der Darlehensnehmer kann jederzeit nach fünf Jahren das Darlehen durch eine Sondertilgung vollständig zurückzahlen.
                </p>
              </div>
            </div>

            <p className="text-gray-700 mb-4">
              <strong>Erstelle einen Tilgungsplan für die ersten zwei Jahre.</strong>
            </p>

            <div className="bg-gray-50 border border-gray-200 rounded p-4 mb-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-300">
                    <th className="px-2 py-2 text-left border">Jahr</th>
                    <th className="px-2 py-2 text-right border">Restschuld</th>
                    <th className="px-2 py-2 text-right border">Zinsen</th>
                    <th className="px-2 py-2 text-right border">Tilgung</th>
                    <th className="px-2 py-2 text-right border">Annuität</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-white">
                    <td className="px-2 py-2 border font-semibold">1</td>
                    <td className="px-2 py-2 text-right border">80.000,00 €</td>
                    <td className="px-2 py-2 text-right border">2.000,00 €</td>
                    <td className="px-2 py-2 text-right border">16.909,60 €</td>
                    <td className="px-2 py-2 text-right border font-semibold">18.909,60 €</td>
                  </tr>
                  <tr className="bg-blue-50">
                    <td className="px-2 py-2 border font-semibold">2</td>
                    <td className="px-2 py-2 text-right border">63.090,40 €</td>
                    <td className="px-2 py-2 text-right border">1.577,26 €</td>
                    <td className="px-2 py-2 text-right border">17.332,34 €</td>
                    <td className="px-2 py-2 text-right border font-semibold">18.909,60 €</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex gap-3 flex-wrap mb-4">
              <button
                onClick={() => updateAnswer('1.4', 'showSolution', !answers['1.4'].showSolution)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition"
              >
                {answers['1.4'].showSolution ? 'Erklärung verbergen' : 'Erklärung anzeigen'}
              </button>
            </div>
            {answers['1.4'].showSolution && (
              <div className="bg-blue-50 border border-blue-200 rounded p-4 text-sm text-gray-700">
                <strong>Erklärung der Annuität:</strong><br/>
                A = K₀ · (q^n · (q - 1)) / (q^n - 1)<br/>
                A = 80.000,00 € · (1,025⁵ · 0,025) / (1,025⁵ - 1)<br/>
                A = 80.000,00 € · 0,2364 ≈ 18.909,60 €<br/><br/>
                <strong>Jahr 1:</strong><br/>
                Zinsen = 80.000,00 € · 0,025 = 2.000,00 €<br/>
                Tilgung = 18.909,60 € - 2.000,00 € = 16.909,60 €<br/>
                Restschuld = 80.000,00 € - 16.909,60 € = 63.090,40 €<br/><br/>
                <strong>Jahr 2:</strong><br/>
                Zinsen = 63.090,40 € · 0,025 = 1.577,26 €<br/>
                Tilgung = 18.909,60 € - 1.577,26 € = 17.332,34 €
              </div>
            )}
          </div>

          {/* Aufgabe 1.5 - Restschuld berechnen */}
          <div className="border-l-4 border-purple-600 pl-6 mb-8 pb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">1.5 Restschuld nach 5 Jahren</h2>
            <p className="text-gray-700 mb-4">
              Sarah denkt über eine Sondertilgung nach. Zur Vorbereitung ihrer Finanzplanung benötigt sie zu wissen, welche Restschuld nach 5 Jahren noch vorhanden ist.
              <br/><br/>
              <strong>Berechne die Restschuld K_v am Ende des 5. Jahres (31.12.2025).</strong>
            </p>
            <div className="flex items-center gap-4 mb-4">
              <label className="flex items-center gap-2">
                <span className="font-semibold">Restschuld am 31.12.2025:</span>
                <input
                  type="text"
                  value={answers['1.5'].input}
                  onChange={(e) => updateAnswer('1.5', 'input', e.target.value)}
                  placeholder="z.B. 0,00"
                  className="border border-gray-300 rounded px-3 py-2 w-40"
                />
                <span className="text-gray-600">€</span>
              </label>
            </div>
            <div className="flex gap-3 flex-wrap mb-4">
              <button
                onClick={() => checkAnswer('1.5', 0.00, 1)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition"
              >
                Prüfen
              </button>
              <button
                onClick={() => updateAnswer('1.5', 'showSolution', !answers['1.5'].showSolution)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition"
              >
                {answers['1.5'].showSolution ? 'Lösung verbergen' : 'Lösung anzeigen'}
              </button>
            </div>
            {answers['1.5'].feedback && <p className="text-sm mb-3">{answers['1.5'].feedback}</p>}
            {answers['1.5'].showSolution && (
              <div className="bg-blue-50 border border-blue-200 rounded p-4 text-sm text-gray-700">
                <strong>Lösung (Restschuld-Formel für Annuitätendarlehen):</strong><br/>
                K_v = K₀ · q^v - A · (q^v - 1) / (q - 1)<br/>
                K_v = 80.000,00 · 1,025⁵ - 18.909,60 · (1,025⁵ - 1) / 0,025<br/>
                K_v = 80.000,00 · 1,1314 - 18.909,60 · 5,2563<br/>
                K_v = 90.510,98 - 99.510,98<br/>
                K_v ≈ 0,00 € (vollständig getilgt)
              </div>
            )}
          </div>

          <div className="mt-10 text-center text-sm text-gray-500">
            <p>Gesamtaufgabe: 15 Punkte</p>
          </div>
        </div>
      </div>
    </div>
  )
}

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface PartAnswer {
  input: string
  feedback: string
  showSolution: boolean
}

export default function LucasKapitalanlagen() {
  const navigate = useNavigate()
  const [answers, setAnswers] = useState<Record<string, PartAnswer>>({
    '1.1': { input: '', feedback: '', showSolution: false },
    '1.2': { input: '', feedback: '', showSolution: false },
    '1.3': { input: '', feedback: '', showSolution: false },
    '1.4a': { input: '', feedback: '', showSolution: false },
    '1.4b': { input: '', feedback: '', showSolution: false },
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

  const checkAnswer = (part: string, correctValue: number, tolerance: number = 0.5) => {
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
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-100 rounded-lg shadow-sm transition-colors"
        >
          <i className="fa-solid fa-arrow-left"></i>
          Zurück
        </button>

        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
          <h1 className="text-3xl font-bold text-purple-600 mb-2">Lucas Kapitalanlagen</h1>
          <p className="text-gray-500 mb-8 text-sm">Abschlussprüfung Finanzmathematik - Bearbeitungszeit: ca. 45 Minuten</p>

          {/* Aufgabe 1.1 */}
          <div className="border-l-4 border-purple-600 pl-6 mb-8 pb-8 border-b">
            <h2 className="text-xl font-bold text-gray-800 mb-4">1.1 Kapitalberechnung</h2>
            <p className="text-gray-700 mb-4">
              Lucas eröffnet am 01.01.2020 ein Sparkonto bei seiner Bank mit einer Einzahlung von 2.500,00 €. Der Zinssatz beträgt 1,8 % pro Jahr.
              <br/><br/>
              <strong>Berechne, über welches Kapital Lucas am 31.12.2024 verfügen kann, wenn er keine weiteren Ein- oder Auszahlungen vornimmt.</strong>
            </p>
            <div className="flex items-center gap-4 mb-4">
              <label className="flex items-center gap-2">
                <span className="font-semibold">Kapital am 31.12.2024:</span>
                <input
                  type="text"
                  value={answers['1.1'].input}
                  onChange={(e) => updateAnswer('1.1', 'input', e.target.value)}
                  placeholder="z.B. 2.750,50"
                  className="border border-gray-300 rounded px-3 py-2 w-32"
                />
                <span className="text-gray-600">€</span>
              </label>
            </div>
            <div className="flex gap-3 flex-wrap mb-4">
              <button
                onClick={() => checkAnswer('1.1', 2764.50, 1)}
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
                <strong>Lösung:</strong><br/>
                K = K₀ · qⁿ<br/>
                K = 2.500,00 € · 1,018⁵<br/>
                K = 2.500,00 € · 1,10580<br/>
                K = 2.764,50 €
              </div>
            )}
          </div>

          {/* Aufgabe 1.2 */}
          <div className="border-l-4 border-purple-600 pl-6 mb-8 pb-8 border-b">
            <h2 className="text-xl font-bold text-gray-800 mb-4">1.2 Zinsatzberechnung</h2>
            <p className="text-gray-700 mb-4">
              Lucas möchte ein Kapital von 1.800,00 € auf einen Wert von 1.950,40 € anwachsen lassen. Eine Bank verspricht ihm, dass dies in 3 Jahren möglich ist.
              <br/><br/>
              <strong>Berechne den erforderlichen Zinssatz in Prozent.</strong>
            </p>
            <div className="flex items-center gap-4 mb-4">
              <label className="flex items-center gap-2">
                <span className="font-semibold">Zinssatz:</span>
                <input
                  type="text"
                  value={answers['1.2'].input}
                  onChange={(e) => updateAnswer('1.2', 'input', e.target.value)}
                  placeholder="z.B. 2,75"
                  className="border border-gray-300 rounded px-3 py-2 w-32"
                />
                <span className="text-gray-600">%</span>
              </label>
            </div>
            <div className="flex gap-3 flex-wrap mb-4">
              <button
                onClick={() => checkAnswer('1.2', 2.75, 0.1)}
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
                K = K₀ · qⁿ<br/>
                1.950,40 = 1.800,00 · q³<br/>
                q³ = 1.950,40 / 1.800,00 = 1,0836<br/>
                q = ∛1,0836 = 1,0275<br/>
                p = (q - 1) · 100 % = 2,75 %
              </div>
            )}
          </div>

          {/* Aufgabe 1.3 */}
          <div className="border-l-4 border-purple-600 pl-6 mb-8 pb-8 border-b">
            <h2 className="text-xl font-bold text-gray-800 mb-4">1.3 Laufzeitberechnung</h2>
            <p className="text-gray-700 mb-4">
              Lucas hat 5.000,00 € gespart und möchte dieses Geld mit einem Zinssatz von 2,1 % anlegen. Nach welcher Zeit kann er über einen Betrag von 5.500,00 € verfügen, wenn die Zinsen dem Konto automatisch gutgeschrieben werden?
              <br/><br/>
              <strong>Berechne die erforderliche Laufzeit in Jahren.</strong>
            </p>
            <div className="flex items-center gap-4 mb-4">
              <label className="flex items-center gap-2">
                <span className="font-semibold">Laufzeit:</span>
                <input
                  type="text"
                  value={answers['1.3'].input}
                  onChange={(e) => updateAnswer('1.3', 'input', e.target.value)}
                  placeholder="z.B. 4,5"
                  className="border border-gray-300 rounded px-3 py-2 w-32"
                />
                <span className="text-gray-600">Jahre</span>
              </label>
            </div>
            <div className="flex gap-3 flex-wrap mb-4">
              <button
                onClick={() => checkAnswer('1.3', 4.64, 0.15)}
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
                K = K₀ · qⁿ<br/>
                5.500,00 = 5.000,00 · 1,021ⁿ<br/>
                1,1 = 1,021ⁿ<br/>
                n · lg(1,021) = lg(1,1)<br/>
                n = lg(1,1) / lg(1,021) = 4,64 Jahre
              </div>
            )}
          </div>

          {/* Aufgabe 1.4 */}
          <div className="border-l-4 border-purple-600 pl-6 mb-8 pb-8 border-b">
            <h2 className="text-xl font-bold text-gray-800 mb-4">1.4 Tilgungsplan</h2>
            <p className="text-gray-700 mb-4">
              Lucas möchte sich ein Auto kaufen und benötigt einen Kredit von 18.000,00 €. Sein Kreditvertrag mit der Bank sieht vor:
              <br/>
              - <strong>Darlehensbetrag:</strong> 18.000,00 €
              <br/>
              - <strong>Zinssatz:</strong> 4,5 % pro Jahr
              <br/>
              - <strong>Laufzeit:</strong> 4 Jahre
              <br/>
              - <strong>Tilgungsform:</strong> Annuitätendarlehen (gleiche Jahresraten)
              <br/><br/>
              <strong>a) Berechne die Höhe der jährlichen Annuität (Jahresrate).</strong>
            </p>
            <div className="flex items-center gap-4 mb-6">
              <label className="flex items-center gap-2">
                <span className="font-semibold">Annuität:</span>
                <input
                  type="text"
                  value={answers['1.4a'].input}
                  onChange={(e) => updateAnswer('1.4a', 'input', e.target.value)}
                  placeholder="z.B. 5.150,00"
                  className="border border-gray-300 rounded px-3 py-2 w-40"
                />
                <span className="text-gray-600">€</span>
              </label>
            </div>
            <div className="flex gap-3 flex-wrap mb-4">
              <button
                onClick={() => checkAnswer('1.4a', 5168.40, 10)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition"
              >
                Prüfen
              </button>
              <button
                onClick={() => updateAnswer('1.4a', 'showSolution', !answers['1.4a'].showSolution)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition"
              >
                {answers['1.4a'].showSolution ? 'Lösung verbergen' : 'Lösung anzeigen'}
              </button>
            </div>
            {answers['1.4a'].feedback && <p className="text-sm mb-3">{answers['1.4a'].feedback}</p>}
            {answers['1.4a'].showSolution && (
              <div className="bg-blue-50 border border-blue-200 rounded p-4 text-sm text-gray-700 mb-6">
                <strong>Lösung:</strong><br/>
                A = S₀ · (q · (q^n - 1)) / (q^n - 1)<br/>
                A = 18.000,00 € · (1,045 · (1,045⁴ - 1)) / (1,045⁴ - 1)<br/>
                A = 18.000,00 € · 0,2872<br/>
                A = 5.168,40 €
              </div>
            )}

            <p className="text-gray-700 mb-4">
              <strong>b) Erstelle einen Tilgungsplan für die ersten zwei Jahre.</strong>
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded p-4 mb-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="px-2 py-2 text-left">Jahr</th>
                    <th className="px-2 py-2 text-left">Restschuld</th>
                    <th className="px-2 py-2 text-left">Zinsen</th>
                    <th className="px-2 py-2 text-left">Tilgung</th>
                    <th className="px-2 py-2 text-left">Annuität</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="px-2 py-2 border-t">1</td>
                    <td className="px-2 py-2 border-t">18.000,00 €</td>
                    <td className="px-2 py-2 border-t">810,00 €</td>
                    <td className="px-2 py-2 border-t">4.358,40 €</td>
                    <td className="px-2 py-2 border-t">5.168,40 €</td>
                  </tr>
                  <tr>
                    <td className="px-2 py-2 border-t">2</td>
                    <td className="px-2 py-2 border-t">13.641,60 €</td>
                    <td className="px-2 py-2 border-t">613,87 €</td>
                    <td className="px-2 py-2 border-t">4.554,53 €</td>
                    <td className="px-2 py-2 border-t">5.168,40 €</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="flex gap-3 flex-wrap mb-4">
              <button
                onClick={() => updateAnswer('1.4b', 'showSolution', !answers['1.4b'].showSolution)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition"
              >
                {answers['1.4b'].showSolution ? 'Erklärung verbergen' : 'Erklärung anzeigen'}
              </button>
            </div>
            {answers['1.4b'].showSolution && (
              <div className="bg-blue-50 border border-blue-200 rounded p-4 text-sm text-gray-700">
                <strong>Erklärung:</strong><br/>
                - <strong>Jahr 1:</strong> Zinsen = 18.000,00 € · 0,045 = 810,00 €; Tilgung = 5.168,40 € - 810,00 € = 4.358,40 €<br/>
                - <strong>Restschuld Ende Jahr 1:</strong> 18.000,00 € - 4.358,40 € = 13.641,60 €<br/>
                - <strong>Jahr 2:</strong> Zinsen = 13.641,60 € · 0,045 = 613,87 €; Tilgung = 5.168,40 € - 613,87 € = 4.554,53 €
              </div>
            )}
          </div>

          {/* Aufgabe 1.5 */}
          <div className="border-l-4 border-purple-600 pl-6 mb-8 pb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">1.5 Gesamtbetrachtung</h2>
            <p className="text-gray-700 mb-4">
              Lucas verdient monatlich 2.800,00 € netto. Er zahlt monatlich 432,00 € aus seiner Sparrate für das Auto ab (das ist 1/12 der jährlichen Annuität).
              <br/><br/>
              <strong>Überprüfe rechnerisch, ob Lucas diese monatliche Belastung dauerhaft tragen kann, wenn er monatliche Lebenshaltungskosten von 1.950,00 € hat.</strong>
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mb-6">
              <p className="text-sm text-gray-700">
                <strong>Anleitung:</strong> Berechne, wie viel Geld Lucas monatlich nach Lebenshaltungskosten und Kreditrate noch übrig hat. Das Ergebnis sollte ≥ 0 € sein, damit es wirtschaftlich tragbar ist.
              </p>
            </div>
            <div className="flex items-center gap-4 mb-4">
              <label className="flex items-center gap-2">
                <span className="font-semibold">Verbleibendes Geld monatlich:</span>
                <input
                  type="text"
                  value={answers['1.5'].input}
                  onChange={(e) => updateAnswer('1.5', 'input', e.target.value)}
                  placeholder="z.B. 416,00"
                  className="border border-gray-300 rounded px-3 py-2 w-40"
                />
                <span className="text-gray-600">€</span>
              </label>
            </div>
            <div className="flex gap-3 flex-wrap mb-4">
              <button
                onClick={() => checkAnswer('1.5', 416, 5)}
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
                <strong>Lösung:</strong><br/>
                Monatliches Einkommen: 2.800,00 €<br/>
                - Lebenshaltungskosten: 1.950,00 €<br/>
                - Kreditrate: 432,00 €<br/>
                = Verbleibendes Geld: 2.800,00 € - 1.950,00 € - 432,00 € = <strong>416,00 €</strong><br/><br/>
                ✓ Die Belastung ist tragbar, da noch 416,00 € monatlich übrig bleiben.
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

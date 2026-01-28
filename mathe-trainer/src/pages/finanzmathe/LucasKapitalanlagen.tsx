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
          <h1 className="text-3xl font-bold text-purple-600 mb-2">Sarah's Finanzplanung</h1>
          <p className="text-gray-500 mb-8 text-sm">Abschlussprüfung Finanzmathematik - Bearbeitungszeit: ca. 45 Minuten</p>

          {/* Aufgabe 1.1 - Nachschüssige Kapitalmehrung */}
          <div className="border-l-4 border-purple-600 pl-6 mb-8 pb-8 border-b">
            <h2 className="text-xl font-bold text-gray-800 mb-4">1.1 Altersvorsorge durch Sparplan</h2>
            <p className="text-gray-700 mb-4">
              Sarah möchte ab dem 01.01.2021 für ihre Altersvorsorge sparen. Sie zahlt jeweils zum Ende eines Jahres 1.200,00 € auf ein Sparkonto ein. Die Bank gewährt einen Zinssatz von 2,0 % p.a.
              <br/><br/>
              <strong>Berechne das Kapital, das Sarah bis zum 31.12.2025 angespart hat.</strong>
            </p>
            <div className="flex items-center gap-4 mb-4">
              <label className="flex items-center gap-2">
                <span className="font-semibold">Ersparnisse nach 5 Jahren:</span>
                <input
                  type="text"
                  value={answers['1.1'].input}
                  onChange={(e) => updateAnswer('1.1', 'input', e.target.value)}
                  placeholder="z.B. 6.244,86"
                  className="border border-gray-300 rounded px-3 py-2 w-32"
                />
                <span className="text-gray-600">€</span>
              </label>
            </div>
            <div className="flex gap-3 flex-wrap mb-4">
              <button
                onClick={() => checkAnswer('1.1', 6244.86, 2)}
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
                <strong>Lösung (Nachschüssige Rente - Endwert):</strong><br/>
                K = R · (q^n - 1) / (q - 1)<br/>
                K = 1.200,00 € · (1,02⁵ - 1) / (1,02 - 1)<br/>
                K = 1.200,00 € · 0,10408 / 0,02<br/>
                K = 1.200,00 € · 5,20404<br/>
                K = 6.244,86 €
              </div>
            )}
          </div>

          {/* Aufgabe 1.2 - Zinseszins */}
          <div className="border-l-4 border-purple-600 pl-6 mb-8 pb-8 border-b">
            <h2 className="text-xl font-bold text-gray-800 mb-4">1.2 Zinseszinsen für Langzeitanlage</h2>
            <p className="text-gray-700 mb-4">
              Sarah hat zusätzlich 8.500,00 € geerbt. Sie legt diesen Betrag zum 01.01.2021 zu einem Zinssatz von 2,5 % p.a. an und lässt die Zinsen automatisch kapitalisieren.
              <br/><br/>
              <strong>Berechne, welcher Betrag ihr am 31.12.2025 zur Verfügung steht.</strong>
            </p>
            <div className="flex items-center gap-4 mb-4">
              <label className="flex items-center gap-2">
                <span className="font-semibold">Kapital nach 5 Jahren:</span>
                <input
                  type="text"
                  value={answers['1.2'].input}
                  onChange={(e) => updateAnswer('1.2', 'input', e.target.value)}
                  placeholder="z.B. 9.615,56"
                  className="border border-gray-300 rounded px-3 py-2 w-32"
                />
                <span className="text-gray-600">€</span>
              </label>
            </div>
            <div className="flex gap-3 flex-wrap mb-4">
              <button
                onClick={() => checkAnswer('1.2', 9615.56, 2)}
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
                <strong>Lösung (Zinseszins):</strong><br/>
                K = K₀ · q^n<br/>
                K = 8.500,00 € · 1,025⁵<br/>
                K = 8.500,00 € · 1,13141<br/>
                K = 9.615,56 €
              </div>
            )}
          </div>

          {/* Aufgabe 1.3 - Vorschüssige Kapitalminderung */}
          <div className="border-l-4 border-purple-600 pl-6 mb-8 pb-8 border-b">
            <h2 className="text-xl font-bold text-gray-800 mb-4">1.3 Rentenzahlungen aus ersparten Mitteln</h2>
            <p className="text-gray-700 mb-4">
              Sarah möchte die gesammelten Mittel (6.244,86 € + 9.615,56 € = 15.860,42 €) ab 01.01.2026 für ihre vorzeitige Rente nutzen. Sie entnimmt jeweils zum Anfang eines Jahres einen Betrag von 3.000,00 €. Die verbleibenden Mittel werden zu 1,5 % p.a. verzinst.
              <br/><br/>
              <strong>Berechne, wie lange Sarah diese vorschüssigen Rentenzahlungen beziehen kann (auf 2 Dezimalstellen genau).</strong>
            </p>
            <div className="flex items-center gap-4 mb-4">
              <label className="flex items-center gap-2">
                <span className="font-semibold">Zeitraum:</span>
                <input
                  type="text"
                  value={answers['1.3'].input}
                  onChange={(e) => updateAnswer('1.3', 'input', e.target.value)}
                  placeholder="z.B. 5,75"
                  className="border border-gray-300 rounded px-3 py-2 w-32"
                />
                <span className="text-gray-600">Jahre</span>
              </label>
            </div>
            <div className="flex gap-3 flex-wrap mb-4">
              <button
                onClick={() => checkAnswer('1.3', 5.46, 0.2)}
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
                <strong>Lösung (Vorschüssige Kapitalminderung):</strong><br/>
                K₀ = R · q · (q^n - 1) / (q - 1)<br/>
                15.860,42 = 3.000,00 · 1,015 · (1,015^n - 1) / 0,015<br/>
                15.860,42 = 3.045,00 · (1,015^n - 1) / 0,015<br/>
                n = 5,46 Jahre
              </div>
            )}
          </div>

          {/* Aufgabe 1.4 - Annuitätendarlehen */}
          <div className="border-l-4 border-purple-600 pl-6 mb-8 pb-8 border-b">
            <h2 className="text-xl font-bold text-gray-800 mb-4">1.4 Immobilienfinanzierung</h2>
            <p className="text-gray-700 mb-4">
              Nach ihrer beruflichen Neuorientierung möchte Sarah eine kleine Wohnung kaufen. Sie benötigt einen Kredit von 120.000,00 €. Ihre Bank bietet folgende Konditionen:
              <br/>
              - <strong>Darlehensbetrag:</strong> 120.000,00 €
              <br/>
              - <strong>Zinssatz:</strong> 3,5 % pro Jahr
              <br/>
              - <strong>Laufzeit:</strong> 10 Jahre
              <br/>
              - <strong>Tilgungsform:</strong> Annuitätendarlehen (gleiche Jahresraten)
              <br/><br/>
              <strong>a) Berechne die Höhe der jährlichen Annuität.</strong>
            </p>
            <div className="flex items-center gap-4 mb-6">
              <label className="flex items-center gap-2">
                <span className="font-semibold">Annuität:</span>
                <input
                  type="text"
                  value={answers['1.4a'].input}
                  onChange={(e) => updateAnswer('1.4a', 'input', e.target.value)}
                  placeholder="z.B. 14.045,60"
                  className="border border-gray-300 rounded px-3 py-2 w-40"
                />
                <span className="text-gray-600">€</span>
              </label>
            </div>
            <div className="flex gap-3 flex-wrap mb-4">
              <button
                onClick={() => checkAnswer('1.4a', 14045.60, 20)}
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
                A = S₀ · (q^n · (q - 1)) / (q^n - 1)<br/>
                A = 120.000,00 € · (1,035¹⁰ · 0,035) / (1,035¹⁰ - 1)<br/>
                A = 120.000,00 € · 0,11723<br/>
                A = 14.045,60 €
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
                    <td className="px-2 py-2 border-t">120.000,00 €</td>
                    <td className="px-2 py-2 border-t">4.200,00 €</td>
                    <td className="px-2 py-2 border-t">9.845,60 €</td>
                    <td className="px-2 py-2 border-t">14.045,60 €</td>
                  </tr>
                  <tr>
                    <td className="px-2 py-2 border-t">2</td>
                    <td className="px-2 py-2 border-t">110.154,40 €</td>
                    <td className="px-2 py-2 border-t">3.855,41 €</td>
                    <td className="px-2 py-2 border-t">10.190,19 €</td>
                    <td className="px-2 py-2 border-t">14.045,60 €</td>
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
                - <strong>Jahr 1:</strong> Zinsen = 120.000,00 € · 0,035 = 4.200,00 €; Tilgung = 14.045,60 € - 4.200,00 € = 9.845,60 €<br/>
                - <strong>Restschuld Ende Jahr 1:</strong> 120.000,00 € - 9.845,60 € = 110.154,40 €<br/>
                - <strong>Jahr 2:</strong> Zinsen = 110.154,40 € · 0,035 = 3.855,41 €; Tilgung = 14.045,60 € - 3.855,41 € = 10.190,19 €
              </div>
            )}
          </div>

          {/* Aufgabe 1.5 - Überprüfung der Tragfähigkeit */}
          <div className="border-l-4 border-purple-600 pl-6 mb-8 pb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">1.5 Finanzielle Tragfähigkeit</h2>
            <p className="text-gray-700 mb-4">
              Sarah verdient als Projektmanagerin ein Bruttoeinkommen von 3.800,00 € monatlich. Nach Steuern und Sozialversicherungen hat sie netto 2.650,00 € zur Verfügung. Ihre monatlichen Lebenshaltungskosten betragen 1.450,00 € (ohne Wohnen). Die Annuität wird monatlich als 1/12-Tel bezahlt.
              <br/><br/>
              <strong>Überprüfe rechnerisch, ob Sarah die monatliche Belastung durch die Darlehensrate ohne finanzielle Schwierigkeiten tragen kann.</strong>
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mb-6">
              <p className="text-sm text-gray-700">
                <strong>Anleitung:</strong> Berechne das monatlich verbleibende Einkommen nach Lebenshaltungskosten und Kreditrate. Dieses sollte positiv sein.
              </p>
            </div>
            <div className="flex items-center gap-4 mb-4">
              <label className="flex items-center gap-2">
                <span className="font-semibold">Verbleibendes Geld monatlich:</span>
                <input
                  type="text"
                  value={answers['1.5'].input}
                  onChange={(e) => updateAnswer('1.5', 'input', e.target.value)}
                  placeholder="z.B. 298,96"
                  className="border border-gray-300 rounded px-3 py-2 w-40"
                />
                <span className="text-gray-600">€</span>
              </label>
            </div>
            <div className="flex gap-3 flex-wrap mb-4">
              <button
                onClick={() => checkAnswer('1.5', 298.96, 5)}
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
                Monatliches Nettoeinkommen: 2.650,00 €<br/>
                - Lebenshaltungskosten: 1.450,00 €<br/>
                - Kreditrate (14.045,60 € ÷ 12): 1.170,47 €<br/>
                = Verbleibendes Geld: 2.650,00 € - 1.450,00 € - 900,57 € = <strong>298,96 €</strong><br/><br/>
                ✓ Die Belastung ist tragbar, da noch ca. 299,00 € monatlich als Rücklagen/Reserve zur Verfügung stehen.
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

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import katex from 'katex'
import 'katex/dist/katex.min.css'

interface PartAnswer {
  input: string
  feedback: string
  showSolution: boolean
}

const InlineMath: React.FC<{ math: string }> = ({ math }) => {
  try {
    const html = katex.renderToString(math, { throwOnError: false })
    return <span dangerouslySetInnerHTML={{ __html: html }} />
  } catch {
    return <span>{math}</span>
  }
}

const BlockMath: React.FC<{ math: string }> = ({ math }) => {
  try {
    const html = katex.renderToString(math, { throwOnError: false, displayMode: true })
    return <div dangerouslySetInnerHTML={{ __html: html }} className="my-3" />
  } catch {
    return <div>{math}</div>
  }
}

export default function DerFoodtruck() {
  const navigate = useNavigate()
  const [answers, setAnswers] = useState<Record<string, PartAnswer>>({
    '1': { input: '', feedback: '', showSolution: false },
    '2': { input: '', feedback: '', showSolution: false },
    '3': { input: '', feedback: '', showSolution: false },
    '4': { input: '', feedback: '', showSolution: false },
    '5': { input: '', feedback: '', showSolution: false }
  })

  const updateAnswer = (part: string, field: string, value: any) => {
    setAnswers(prev => ({
      ...prev,
      [part]: { ...prev[part], [field]: value }
    }))
  }

  const parseInput = (value: string) => {
    const raw = value.trim()
    const normalized = raw.includes(',') ? raw.replace(/\./g, '').replace(',', '.') : raw
    return parseFloat(normalized)
  }

  const checkAnswer = (part: string, correctValue: number) => {
    const userValue = parseInput(answers[part].input)
    if (isNaN(userValue)) {
      updateAnswer(part, 'feedback', '❌ Bitte eine gültige Zahl eingeben.')
      return
    }
    const tolerance = Math.abs(correctValue) * 0.03
    if (Math.abs(userValue - correctValue) <= tolerance) {
      updateAnswer(part, 'feedback', '✅ Richtig!')
    } else {
      updateAnswer(part, 'feedback', '❌ Versuche es nochmal oder schau dir die Lösung an.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => navigate('/finanzmathe/anwendungsaufgaben')}
          className="mb-6 flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-100 rounded-lg shadow-sm transition-colors"
        >
          <i className="fa-solid fa-arrow-left"></i>
          Zurück
        </button>

        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
          <h1 className="text-3xl font-bold text-purple-600 mb-8">Der Foodtruck</h1>

          {/* Aufgabe 1 */}
          <div className="border-l-4 border-purple-600 pl-6 mb-8 pb-8 border-b">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Aufgabe 1</h2>
            <p className="text-gray-700 mb-4 text-center">
              Selin träumt von ihrem eigenen Foodtruck. Vor 8 Jahren hat sie 9.500,00 € auf einem
              Festgeldkonto angelegt. Heute verfügt sie durch Zins und Zinseszins über ein Guthaben
              von 11.000,00 €.
              <br/><br/>
              <strong>Berechnen Sie, mit welchem jährlichen Zinssatz das Kapital verzinst wurde.</strong>
            </p>
            <div className="flex flex-col items-center gap-4 mb-4">
              <label className="flex items-center gap-2 justify-center">
                <span className="font-semibold">Zinssatz p:</span>
                <input
                  type="text"
                  value={answers['1'].input}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateAnswer('1', 'input', e.target.value)}
                  placeholder="z.B. 1,50"
                  className="border border-gray-300 rounded px-3 py-2 w-32 text-center"
                />
                <span className="text-gray-600">%</span>
              </label>
            </div>
            <div className="flex gap-3 flex-wrap mb-4 justify-center">
              <button
                onClick={() => checkAnswer('1', 1.85)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition"
              >
                Prüfen
              </button>
              <button
                onClick={() => updateAnswer('1', 'showSolution', !answers['1'].showSolution)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition"
              >
                {answers['1'].showSolution ? 'Lösung verbergen' : 'Lösung anzeigen'}
              </button>
            </div>
            {answers['1'].feedback && <p className="text-sm mb-3 text-center">{answers['1'].feedback}</p>}
            {answers['1'].showSolution && (
              <div className="bg-blue-50 border border-blue-200 rounded p-4 text-sm text-gray-700 text-center">
                <strong>Lösung (Zinseszins, Zinssatz gesucht):</strong>
                <BlockMath math="K_n = K_0 \cdot q^n \implies 11.000,00 = 9.500,00 \cdot q^8" />
                <BlockMath math="q = \sqrt[8]{\frac{11.000,00}{9.500,00}} \approx 1,0185" />
                <BlockMath math="p = (q - 1) \cdot 100 \approx 1,85\,\%" />
              </div>
            )}
          </div>

          {/* Aufgabe 2 */}
          <div className="border-l-4 border-purple-600 pl-6 mb-8 pb-8 border-b">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Aufgabe 2</h2>
            <p className="text-gray-700 mb-4 text-center">
              Um ihr Eigenkapital weiter zu erhöhen, spart Selin zusätzlich sechs Jahre lang jeweils am
              Jahresende 1.800,00 € auf einem separaten Konto mit einem Zinssatz von 1,75 % p. a. an.
              <br/><br/>
              <strong>Berechnen Sie, über welchen Betrag sie auf diesem Konto nach sechs Jahren verfügen kann.</strong>
            </p>
            <div className="flex flex-col items-center gap-4 mb-4">
              <label className="flex items-center gap-2 justify-center">
                <span className="font-semibold">Endkapital:</span>
                <input
                  type="text"
                  value={answers['2'].input}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateAnswer('2', 'input', e.target.value)}
                  placeholder="z.B. 11000,00"
                  className="border border-gray-300 rounded px-3 py-2 w-36 text-center"
                />
                <span className="text-gray-600">€</span>
              </label>
            </div>
            <div className="flex gap-3 flex-wrap mb-4 justify-center">
              <button
                onClick={() => checkAnswer('2', 11283.67)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition"
              >
                Prüfen
              </button>
              <button
                onClick={() => updateAnswer('2', 'showSolution', !answers['2'].showSolution)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition"
              >
                {answers['2'].showSolution ? 'Lösung verbergen' : 'Lösung anzeigen'}
              </button>
            </div>
            {answers['2'].feedback && <p className="text-sm mb-3 text-center">{answers['2'].feedback}</p>}
            {answers['2'].showSolution && (
              <div className="bg-blue-50 border border-blue-200 rounded p-4 text-sm text-gray-700 text-center">
                <strong>Lösung (Nachschüssige Kapitalmehrung ohne Anfangskapital):</strong>
                <BlockMath math="K_n = r \cdot \frac{q^n - 1}{q - 1}" />
                <BlockMath math="K_6 = 1.800,00 \cdot \frac{1,0175^{6} - 1}{0,0175}" />
                <BlockMath math="K_6 \approx 11.283,67 \text{ €}" />
              </div>
            )}
          </div>

          {/* Aufgabe 3 */}
          <div className="border-l-4 border-purple-600 pl-6 mb-8 pb-8 border-b">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Aufgabe 3</h2>
            <p className="text-gray-700 mb-4 text-center">
              Der Foodtruck kostet inklusive Ausstattung 62.000,00 €. Selin bringt 22.000,00 €
              Eigenkapital ein. Den Restbetrag von 40.000,00 € finanziert sie über ein
              Annuitätendarlehen mit einem Zinssatz von 4,60 % p. a. und einer Laufzeit von 8 Jahren.
              <br/><br/>
              <strong>Berechnen Sie die Höhe der jährlichen Annuität.</strong>
            </p>
            <div className="flex flex-col items-center gap-4 mb-4">
              <label className="flex items-center gap-2 justify-center">
                <span className="font-semibold">Annuität A:</span>
                <input
                  type="text"
                  value={answers['3'].input}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateAnswer('3', 'input', e.target.value)}
                  placeholder="z.B. 5900,00"
                  className="border border-gray-300 rounded px-3 py-2 w-36 text-center"
                />
                <span className="text-gray-600">€</span>
              </label>
            </div>
            <div className="flex gap-3 flex-wrap mb-4 justify-center">
              <button
                onClick={() => checkAnswer('3', 6089.19)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition"
              >
                Prüfen
              </button>
              <button
                onClick={() => updateAnswer('3', 'showSolution', !answers['3'].showSolution)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition"
              >
                {answers['3'].showSolution ? 'Lösung verbergen' : 'Lösung anzeigen'}
              </button>
            </div>
            {answers['3'].feedback && <p className="text-sm mb-3 text-center">{answers['3'].feedback}</p>}
            {answers['3'].showSolution && (
              <div className="bg-blue-50 border border-blue-200 rounded p-4 text-sm text-gray-700 text-center">
                <strong>Lösung (Annuitätenformel):</strong>
                <BlockMath math="A = K_0 \cdot \frac{q^n \cdot (q - 1)}{q^n - 1}" />
                <BlockMath math="A = 40.000,00 \cdot \frac{1,046^{8} \cdot 0,046}{1,046^{8} - 1}" />
                <BlockMath math="A \approx 6.089,19 \text{ €}" />
              </div>
            )}
          </div>

          {/* Aufgabe 4 */}
          <div className="border-l-4 border-purple-600 pl-6 mb-8 pb-8 border-b">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Aufgabe 4</h2>
            <p className="text-gray-700 mb-4 text-center">
              <strong>Erstellen Sie einen Tilgungsplan für die ersten beiden Jahre.</strong><br/>
              <em className="text-gray-600">(Zwischenergebnis: A = 6.089,19 €)</em>
            </p>

            {/* Tilgungsplan Tabelle */}
            <div className="bg-gray-50 border border-gray-200 rounded p-4 mb-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-300">
                    <th className="px-2 py-2 text-left border">Jahr</th>
                    <th className="px-2 py-2 text-right border">Restschuld Anfang (€)</th>
                    <th className="px-2 py-2 text-right border">Zinsen (€)</th>
                    <th className="px-2 py-2 text-right border">Tilgung (€)</th>
                    <th className="px-2 py-2 text-right border">Annuität (€)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-white">
                    <td className="px-2 py-2 border font-semibold">1</td>
                    <td className="px-2 py-2 text-right border"><input type="text" placeholder="€" className="border border-gray-300 rounded px-2 py-1 w-24" /></td>
                    <td className="px-2 py-2 text-right border"><input type="text" placeholder="€" className="border border-gray-300 rounded px-2 py-1 w-24" /></td>
                    <td className="px-2 py-2 text-right border"><input type="text" placeholder="€" className="border border-gray-300 rounded px-2 py-1 w-24" /></td>
                    <td className="px-2 py-2 text-right border"><input type="text" placeholder="€" className="border border-gray-300 rounded px-2 py-1 w-24" /></td>
                  </tr>
                  <tr className="bg-blue-50">
                    <td className="px-2 py-2 border font-semibold">2</td>
                    <td className="px-2 py-2 text-right border"><input type="text" placeholder="€" className="border border-gray-300 rounded px-2 py-1 w-24" /></td>
                    <td className="px-2 py-2 text-right border"><input type="text" placeholder="€" className="border border-gray-300 rounded px-2 py-1 w-24" /></td>
                    <td className="px-2 py-2 text-right border"><input type="text" placeholder="€" className="border border-gray-300 rounded px-2 py-1 w-24" /></td>
                    <td className="px-2 py-2 text-right border"><input type="text" placeholder="€" className="border border-gray-300 rounded px-2 py-1 w-24" /></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex gap-3 flex-wrap mb-4 justify-center">
              <button
                onClick={() => updateAnswer('4', 'showSolution', !answers['4'].showSolution)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition"
              >
                {answers['4'].showSolution ? 'Erklärung verbergen' : 'Erklärung anzeigen'}
              </button>
            </div>
            {answers['4'].showSolution && (
              <div className="bg-blue-50 border border-blue-200 rounded p-4 text-sm text-gray-700 text-center">
                <strong>Erklärung:</strong>
                <p className="mt-3"><strong>Jahr 1:</strong></p>
                <BlockMath math="Z_1 = 40.000,00 \cdot 0,046 = 1.840,00 \text{ €}" />
                <BlockMath math="T_1 = 6.089,19 - 1.840,00 = 4.249,19 \text{ €}" />
                <BlockMath math="K_1 = 40.000,00 - 4.249,19 = 35.750,81 \text{ €}" />
                <p className="mt-3"><strong>Jahr 2:</strong></p>
                <BlockMath math="Z_2 = 35.750,81 \cdot 0,046 = 1.644,54 \text{ €}" />
                <BlockMath math="T_2 = 6.089,19 - 1.644,54 = 4.444,65 \text{ €}" />
              </div>
            )}
          </div>

          {/* Aufgabe 5 */}
          <div className="border-l-4 border-purple-600 pl-6 mb-8 pb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Aufgabe 5</h2>
            <p className="text-gray-700 mb-4 text-center">
              Nach fünf erfolgreichen Jahren mit dem Foodtruck wird ein alter Sparbrief von Selin in
              Höhe von 17.000,00 € fällig. Sie möchte damit das Darlehen zu diesem Zeitpunkt
              vollständig zurückzahlen.
              <br/><br/>
              <strong>Berechnen Sie die Restschuld nach 5 Jahren und überprüfen Sie, ob das Vorhaben gelingt.</strong>
            </p>
            <div className="flex flex-col items-center gap-4 mb-4">
              <label className="flex items-center gap-2 justify-center">
                <span className="font-semibold">Restschuld nach 5 Jahren:</span>
                <input
                  type="text"
                  value={answers['5'].input}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateAnswer('5', 'input', e.target.value)}
                  placeholder="z.B. 16000,00"
                  className="border border-gray-300 rounded px-3 py-2 w-40 text-center"
                />
                <span className="text-gray-600">€</span>
              </label>
            </div>
            <div className="flex gap-3 flex-wrap mb-4 justify-center">
              <button
                onClick={() => checkAnswer('5', 16707.44)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition"
              >
                Prüfen
              </button>
              <button
                onClick={() => updateAnswer('5', 'showSolution', !answers['5'].showSolution)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition"
              >
                {answers['5'].showSolution ? 'Lösung verbergen' : 'Lösung anzeigen'}
              </button>
            </div>
            {answers['5'].feedback && <p className="text-sm mb-3 text-center">{answers['5'].feedback}</p>}
            {answers['5'].showSolution && (
              <div className="bg-blue-50 border border-blue-200 rounded p-4 text-sm text-gray-700 text-center">
                <strong>Lösung (Restschuldformel):</strong>
                <BlockMath math="K_v = K_0 \cdot q^v - A \cdot \frac{q^v - 1}{q - 1}" />
                <BlockMath math="K_5 = 40.000,00 \cdot 1,046^5 - 6.089,19 \cdot \frac{1,046^5 - 1}{0,046}" />
                <BlockMath math="K_5 \approx 16.707,44 \text{ €}" />
                <p className="mt-3"><strong>Prüfung:</strong></p>
                <p>Verfügbare Mittel: 17.000,00 € &nbsp;|&nbsp; Restschuld: 16.707,44 €</p>
                <p className="text-green-700 font-semibold">✅ Das Vorhaben gelingt, da 16.707,44 € &lt; 17.000,00 €. Es bleiben 292,56 € übrig.</p>
              </div>
            )}
          </div>

          <div className="mt-10 text-center text-sm text-gray-500">
            <p>Prüfungsähnliche Übungsaufgabe – ca. 15 Punkte</p>
          </div>
        </div>
      </div>
    </div>
  )
}

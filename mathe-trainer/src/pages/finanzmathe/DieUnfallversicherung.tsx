import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import katex from 'katex'
import 'katex/dist/katex.min.css'

interface PartAnswer {
  value: string
  isCorrect: boolean
  showSolution: boolean
}

function InlineMath({ formula }: { formula: string }) {
  try {
    const html = katex.renderToString(formula, { throwOnError: false })
    return <span dangerouslySetInnerHTML={{ __html: html }} />
  } catch (e) {
    return <span>{formula}</span>
  }
}

function BlockMath({ formula }: { formula: string }) {
  try {
    const html = katex.renderToString(formula, { throwOnError: false, displayMode: true })
    return <div dangerouslySetInnerHTML={{ __html: html }} className="flex justify-center my-4" />
  } catch (e) {
    return <div>{formula}</div>
  }
}

export default function DieUnfallversicherung() {
  const navigate = useNavigate()
  const [answers, setAnswers] = useState<Record<string, PartAnswer>>({
    '1.1': { value: '', isCorrect: false, showSolution: false },
    '1.2': { value: '', isCorrect: false, showSolution: false },
    '1.3': { value: '', isCorrect: false, showSolution: false },
    '1.4': { value: '', isCorrect: false, showSolution: false },
    '1.5': { value: '', isCorrect: false, showSolution: false },
  })

  const parseInput = (value: string): number | null => {
    const parsed = parseFloat(value.replace(',', '.').trim())
    return isNaN(parsed) ? null : parsed
  }

  const checkAnswer = (key: string, value: string): boolean => {
    const numValue = parseInput(value)
    if (numValue === null) return false

    const tolerances: Record<string, [number, number]> = {
      '1.1': [2.5, 2.7],
      '1.2': [195, 200],
      '1.3': [5.8, 6.1],
      '1.5': [14000, 14500],
    }

    if (tolerances[key]) {
      const [min, max] = tolerances[key]
      return numValue >= min && numValue <= max
    }
    return false
  }

  const handleInputChange = (key: string, value: string) => {
    const isCorrect = value.trim() !== '' ? checkAnswer(key, value) : false
    setAnswers(prev => ({
      ...prev,
      [key]: { value, isCorrect, showSolution: prev[key]?.showSolution || false }
    }))
  }

  const toggleSolution = (key: string) => {
    setAnswers(prev => ({
      ...prev,
      [key]: { ...prev[key], showSolution: !prev[key].showSolution }
    }))
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
          <h1 className="text-3xl font-bold text-purple-600 mb-2 text-center">Die Unfallversicherung</h1>
          <p className="text-gray-600 text-center mb-8">Löse alle Aufgaben und überprüfe deine Ergebnisse</p>

          {/* Aufgabe 1.1 */}
          <div className="mb-12 p-6 bg-purple-50 rounded-lg border-l-4 border-purple-500">
            <h2 className="text-2xl font-bold text-purple-800 mb-4">Aufgabe 1.1 (3 Punkte)</h2>
            <div className="text-center mb-6 space-y-4">
              <p className="text-gray-700">
                Herr Weber erhielt vor 12 Jahren von seiner Unfallversicherung eine Auszahlung von 12.500,00 €. 
                In einem Gespräch mit seinem Bankberater erkundigte er sich, ob die Anlage im Jahr 2024 
                zu einem Gesamtkapital von 17.000,00 € führen könnte.
              </p>
              <p className="font-semibold text-gray-700">
                Welchen Zinssatz hätte die Bank Herrn Weber anbieten müssen?
              </p>
            </div>

            <div className="mb-4 p-4 bg-white rounded border border-gray-200">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Zinssatz (p%):</label>
              <input
                type="text"
                placeholder="z.B. 2,6"
                value={answers['1.1'].value}
                onChange={(e) => handleInputChange('1.1', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg text-center text-lg ${
                  answers['1.1'].value && !answers['1.1'].isCorrect ? 'border-red-500 bg-red-50' :
                  answers['1.1'].isCorrect ? 'border-green-500 bg-green-50' :
                  'border-gray-300'
                }`}
              />
              {answers['1.1'].isCorrect && <p className="text-green-600 text-sm mt-2">✓ Korrekt!</p>}
              {answers['1.1'].value && !answers['1.1'].isCorrect && <p className="text-red-600 text-sm mt-2">✗ Nicht korrekt</p>}
            </div>

            <button
              onClick={() => toggleSolution('1.1')}
              className="w-full px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-semibold"
            >
              {answers['1.1'].showSolution ? 'Lösung ausblenden' : 'Lösung anzeigen'}
            </button>

            {answers['1.1'].showSolution && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-bold text-blue-900 mb-3">Lösung:</h3>
                <p className="text-gray-700 mb-3">
                  Gegeben: <InlineMath formula="K_0 = 12.500 \text{ €}, K_n = 17.000 \text{ €}, n = 12 \text{ Jahre}" />
                </p>
                <p className="text-gray-700 mb-3">Formel für Zinseszins:</p>
                <BlockMath formula="K_n = K_0 \cdot q^n" />
                <p className="text-gray-700 mb-3">Nach q auflösen:</p>
                <BlockMath formula="q = \sqrt[n]{\frac{K_n}{K_0}} = \sqrt[12]{\frac{17.000}{12.500}} = \sqrt[12]{1,36} \approx 1,0260" />
                <p className="text-gray-700 mb-2">
                  Daher: <InlineMath formula="p = (q - 1) \cdot 100\% = (1,0260 - 1) \cdot 100\% = \mathbf{2,60\%}" />
                </p>
              </div>
            )}
          </div>

          {/* Aufgabe 1.2 */}
          <div className="mb-12 p-6 bg-purple-50 rounded-lg border-l-4 border-purple-500">
            <h2 className="text-2xl font-bold text-purple-800 mb-4">Aufgabe 1.2 (3 Punkte)</h2>
            <div className="text-center mb-6 space-y-4">
              <p className="text-gray-700">
                Aufgrund des damals niedrigen Zinsniveaus konnte die Bank Herr Weber nur 1,25% p.a. anbieten.
              </p>
              <p className="font-semibold text-gray-700">
                Berechnen Sie, welchen gleichbleibenden Betrag Herr Weber jährlich zum Jahresende 
                zusätzlich einzahlen musste, um die 17.000,00 € nach 12 Jahren zu erreichen.
              </p>
            </div>

            <div className="mb-4 p-4 bg-white rounded border border-gray-200">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Jährliche Einzahlung (€):</label>
              <input
                type="text"
                placeholder="z.B. 198,51"
                value={answers['1.2'].value}
                onChange={(e) => handleInputChange('1.2', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg text-center text-lg ${
                  answers['1.2'].value && !answers['1.2'].isCorrect ? 'border-red-500 bg-red-50' :
                  answers['1.2'].isCorrect ? 'border-green-500 bg-green-50' :
                  'border-gray-300'
                }`}
              />
              {answers['1.2'].isCorrect && <p className="text-green-600 text-sm mt-2">✓ Korrekt!</p>}
              {answers['1.2'].value && !answers['1.2'].isCorrect && <p className="text-red-600 text-sm mt-2">✗ Nicht korrekt</p>}
            </div>

            <button
              onClick={() => toggleSolution('1.2')}
              className="w-full px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-semibold"
            >
              {answers['1.2'].showSolution ? 'Lösung ausblenden' : 'Lösung anzeigen'}
            </button>

            {answers['1.2'].showSolution && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-bold text-blue-900 mb-3">Lösung:</h3>
                <p className="text-gray-700 mb-3">
                  Gegeben: <InlineMath formula="K_0 = 12.500 \text{ €}, q = 1,0125, n = 12, K_n = 17.000 \text{ €}" />
                </p>
                <p className="text-gray-700 mb-3">Formel für Anfangskapital + nachschüssige Rente:</p>
                <BlockMath formula="K_n = K_0 \cdot q^n + R \cdot \frac{q^n - 1}{q - 1}" />
                <p className="text-gray-700 mb-3">Nach R auflösen:</p>
                <BlockMath formula="R = \frac{K_n - K_0 \cdot q^n}{\frac{q^n - 1}{q - 1}}" />
                <p className="text-gray-700 mb-3">Berechnung:</p>
                <BlockMath formula="K_0 \cdot q^n = 12.500 \cdot 1,0125^{12} \approx 14.447,13 \text{ €}" />
                <BlockMath formula="R = \frac{17.000 - 14.447,13}{\frac{1,0125^{12} - 1}{0,0125}} \approx \frac{2.552,87}{12,887} \approx \mathbf{198,51 \text{ €}}" />
              </div>
            )}
          </div>

          {/* Aufgabe 1.3 */}
          <div className="mb-12 p-6 bg-purple-50 rounded-lg border-l-4 border-purple-500">
            <h2 className="text-2xl font-bold text-purple-800 mb-4">Aufgabe 1.3 (4 Punkte)</h2>
            <div className="text-center mb-6 space-y-4">
              <p className="text-gray-700">
                Nach Abschluss seines Studiums plant Herr Weber seinem Sohn Tim die Studienkosten 
                mit einem Kapital von 17.000,00 € zu finanzieren. Er möchte seinem Sohn jährlich 
                zu Beginn eines jeden Jahres 3.000,00 € auszahlen.
              </p>
              <p className="font-semibold text-gray-700">
                Berechnen Sie, wie lange Herr Weber seinen Sohn finanziell unterstützen kann, 
                wenn sich das Kapital mit 1,5% p.a. verzinst.
              </p>
            </div>

            <div className="mb-4 p-4 bg-white rounded border border-gray-200">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Anzahl der Jahre (n):</label>
              <input
                type="text"
                placeholder="z.B. 6"
                value={answers['1.3'].value}
                onChange={(e) => handleInputChange('1.3', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg text-center text-lg ${
                  answers['1.3'].value && !answers['1.3'].isCorrect ? 'border-red-500 bg-red-50' :
                  answers['1.3'].isCorrect ? 'border-green-500 bg-green-50' :
                  'border-gray-300'
                }`}
              />
              {answers['1.3'].isCorrect && <p className="text-green-600 text-sm mt-2">✓ Korrekt!</p>}
              {answers['1.3'].value && !answers['1.3'].isCorrect && <p className="text-red-600 text-sm mt-2">✗ Nicht korrekt</p>}
            </div>

            <button
              onClick={() => toggleSolution('1.3')}
              className="w-full px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-semibold"
            >
              {answers['1.3'].showSolution ? 'Lösung ausblenden' : 'Lösung anzeigen'}
            </button>

            {answers['1.3'].showSolution && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-bold text-blue-900 mb-3">Lösung:</h3>
                <p className="text-gray-700 mb-3">
                  Gegeben: <InlineMath formula="K_0 = 17.000 \text{ €}, r = 3.000 \text{ €}, q = 1,015" />
                </p>
                <p className="text-gray-700 mb-3">Formel für vorschüssige Kapitalminderung:</p>
                <BlockMath formula="K_n' = K_0 \cdot q^n - r \cdot q \cdot \frac{q^n - 1}{q - 1}" />
                <p className="text-gray-700 mb-3">Setze <InlineMath formula="K_n' = 0" />:</p>
                <BlockMath formula="0 = 17.000 \cdot 1,015^n - 3.000 \cdot 1,015 \cdot \frac{1,015^n - 1}{0,015}" />
                <p className="text-gray-700 mb-3">Vereinfachen:</p>
                <BlockMath formula="17.000 \cdot 1,015^n = 3.045 \cdot \frac{1,015^n - 1}{0,015}" />
                <p className="text-gray-700 mb-2">
                  <InlineMath formula="1,015^n \approx 1,1008 \Rightarrow n \approx 5,98" />
                </p>
                <p className="text-gray-700 text-sm font-semibold text-green-700">
                  ✅ Auf volle Jahre gerundet: <InlineMath formula="n = \mathbf{6 \text{ Jahre}}" />
                </p>
              </div>
            )}
          </div>

          {/* Aufgabe 1.4 */}
          <div className="mb-12 p-6 bg-purple-50 rounded-lg border-l-4 border-purple-500">
            <h2 className="text-2xl font-bold text-purple-800 mb-4">Aufgabe 1.4 (3 Punkte)</h2>
            <div className="text-center mb-6">
              <p className="text-gray-700 mb-4">
                Nach Abschluss seines Studiums möchte Tim eine neue Wohnung einrichten und nimmt 
                bei der Bayernbank ein Darlehen auf.
              </p>
            </div>

            <div className="mb-6 p-4 bg-white rounded border border-gray-200 text-center">
              <h3 className="font-bold text-gray-800 mb-3">Darlehensvertrag</h3>
              <div className="space-y-2 text-sm text-gray-700">
                <p><strong>Darlehenssumme:</strong> 25.000,00 EUR</p>
                <p><strong>Darlehensgeber:</strong> Bayernbank Bamberg</p>
                <p><strong>Darlehensnehmerin:</strong> Tim Weber</p>
                <p><strong>Adresse:</strong> Lange Straße 44, Bamberg</p>
                <p><strong>Zinssatz:</strong> 3,20% p.a.</p>
                <p><strong>Annuitäten:</strong> 2.000,00 EUR jeweils zum Jahresende</p>
              </div>
            </div>

            <div className="text-center mb-6">
              <p className="font-semibold text-gray-700">
                Erstellen Sie einen Tilgungsplan für die ersten beiden Jahre. Füllen Sie die leeren Felder aus:
              </p>
            </div>

            <div className="mb-6 p-4 bg-white rounded border border-gray-200 overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-purple-300">
                    <th className="border border-gray-400 px-2 py-1">Jahr</th>
                    <th className="border border-gray-400 px-2 py-1">Schuldenstand (€)</th>
                    <th className="border border-gray-400 px-2 py-1">Zinsen (€)</th>
                    <th className="border border-gray-400 px-2 py-1">Tilgung (€)</th>
                    <th className="border border-gray-400 px-2 py-1">Annuität (€)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-400 px-2 py-1 text-center font-semibold">1</td>
                    <td className="border border-gray-400 px-2 py-1 text-right"><input type="text" className="w-full border border-gray-300 rounded px-2 py-1" placeholder="€" /></td>
                    <td className="border border-gray-400 px-2 py-1 text-right"><input type="text" className="w-full border border-gray-300 rounded px-2 py-1" placeholder="€" /></td>
                    <td className="border border-gray-400 px-2 py-1 text-right"><input type="text" className="w-full border border-gray-300 rounded px-2 py-1" placeholder="€" /></td>
                    <td className="border border-gray-400 px-2 py-1 text-right">2.000,00</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-400 px-2 py-1 text-center font-semibold">2</td>
                    <td className="border border-gray-400 px-2 py-1 text-right"><input type="text" className="w-full border border-gray-300 rounded px-2 py-1" placeholder="€" /></td>
                    <td className="border border-gray-400 px-2 py-1 text-right"><input type="text" className="w-full border border-gray-300 rounded px-2 py-1" placeholder="€" /></td>
                    <td className="border border-gray-400 px-2 py-1 text-right"><input type="text" className="w-full border border-gray-300 rounded px-2 py-1" placeholder="€" /></td>
                    <td className="border border-gray-400 px-2 py-1 text-right">2.000,00</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <button
              onClick={() => toggleSolution('1.4')}
              className="w-full px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-semibold"
            >
              {answers['1.4'].showSolution ? 'Lösung ausblenden' : 'Lösung anzeigen'}
            </button>

            {answers['1.4'].showSolution && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg overflow-x-auto">
                <h3 className="font-bold text-blue-900 mb-4">Lösungstabelle:</h3>
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-blue-200">
                      <th className="border border-gray-400 px-2 py-1">Jahr</th>
                      <th className="border border-gray-400 px-2 py-1">Schuldenstand (€)</th>
                      <th className="border border-gray-400 px-2 py-1">Zinsen (€)</th>
                      <th className="border border-gray-400 px-2 py-1">Tilgung (€)</th>
                      <th className="border border-gray-400 px-2 py-1">Annuität (€)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-400 px-2 py-1 text-center">1</td>
                      <td className="border border-gray-400 px-2 py-1 text-right">25.000,00</td>
                      <td className="border border-gray-400 px-2 py-1 text-right">800,00</td>
                      <td className="border border-gray-400 px-2 py-1 text-right">1.200,00</td>
                      <td className="border border-gray-400 px-2 py-1 text-right">2.000,00</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-400 px-2 py-1 text-center">2</td>
                      <td className="border border-gray-400 px-2 py-1 text-right">23.800,00</td>
                      <td className="border border-gray-400 px-2 py-1 text-right">761,60</td>
                      <td className="border border-gray-400 px-2 py-1 text-right">1.238,40</td>
                      <td className="border border-gray-400 px-2 py-1 text-right">2.000,00</td>
                    </tr>
                  </tbody>
                </table>
                <p className="text-gray-700 mt-4 text-sm">
                  Berechnung Jahr 1: Zinsen = 25.000,00 × 0,032 = 800,00 €; Tilgung = 2.000,00 − 800,00 = 1.200,00 €
                </p>
                <p className="text-gray-700 text-sm">
                  Berechnung Jahr 2: Schuldenstand = 25.000,00 − 1.200,00 = 23.800,00 €; 
                  Zinsen = 23.800,00 × 0,032 = 761,60 €; Tilgung = 2.000,00 − 761,60 = 1.238,40 €
                </p>
              </div>
            )}
          </div>

          {/* Aufgabe 1.5 */}
          <div className="mb-12 p-6 bg-purple-50 rounded-lg border-l-4 border-purple-500">
            <h2 className="text-2xl font-bold text-purple-800 mb-4">Aufgabe 1.5 (2 Punkte)</h2>
            <div className="text-center mb-6 space-y-4">
              <p className="font-semibold text-gray-700">
                Nach 8 Jahren möchte Tim die Restschuld begleichen. Berechnen Sie die Höhe der Restschuld.
              </p>
            </div>

            <div className="mb-4 p-4 bg-white rounded border border-gray-200">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Restschuld nach 8 Jahren (€):</label>
              <input
                type="text"
                placeholder="z.B. 14253,16"
                value={answers['1.5'].value}
                onChange={(e) => handleInputChange('1.5', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg text-center text-lg ${
                  answers['1.5'].value && !answers['1.5'].isCorrect ? 'border-red-500 bg-red-50' :
                  answers['1.5'].isCorrect ? 'border-green-500 bg-green-50' :
                  'border-gray-300'
                }`}
              />
              {answers['1.5'].isCorrect && <p className="text-green-600 text-sm mt-2">✓ Korrekt!</p>}
              {answers['1.5'].value && !answers['1.5'].isCorrect && <p className="text-red-600 text-sm mt-2">✗ Nicht korrekt</p>}
            </div>

            <button
              onClick={() => toggleSolution('1.5')}
              className="w-full px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-semibold"
            >
              {answers['1.5'].showSolution ? 'Lösung ausblenden' : 'Lösung anzeigen'}
            </button>

            {answers['1.5'].showSolution && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-bold text-blue-900 mb-3">Lösung:</h3>
                <p className="text-gray-700 mb-3">
                  Gegeben: <InlineMath formula="K_0 = 25.000 \text{ €}, p = 3,20\%, A = 2.000 \text{ €}, v = 8" />
                </p>
                <p className="text-gray-700 mb-3">
                  <InlineMath formula="q = 1 + \frac{p}{100} = 1,032" />
                </p>
                <p className="text-gray-700 mb-3">Formel für Restschuld nach v Jahren:</p>
                <BlockMath formula="K_v = K_0 \cdot q^v - A \cdot \frac{q^v - 1}{q - 1}" />
                <p className="text-gray-700 mb-3">Berechnung:</p>
                <BlockMath formula="K_8 = 25.000 \cdot 1,032^8 - \frac{2.000 \cdot (1,032^8 - 1)}{1,032 - 1}" />
                <p className="text-gray-700 mb-3">
                  <InlineMath formula="K_8 = 25.000 \cdot 1,29913 - \frac{2.000 \cdot (1,29913 - 1)}{0,032}" />
                </p>
                <p className="text-gray-700 mb-2">
                  <InlineMath formula="K_8 = 32.478,25 - \frac{2.000 \cdot 0,29913}{0,032} = 32.478,25 - 18.695,81 = \mathbf{14.253,16 \text{ €}}" />
                </p>
              </div>
            )}
          </div>

          <div className="mt-12 p-6 bg-gray-100 rounded-lg text-center">
            <p className="text-gray-700">
              <strong>Gesamt:</strong> 15 Punkte
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

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

export default function EhepaartTempel() {
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
      '1.1': [1.0, 1.4],
      '1.2': [37700, 37900],
      '1.4': [170000, 171000],
      '1.5': [29.0, 29.8],
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
          <h1 className="text-3xl font-bold text-purple-600 mb-2 text-center">Ehepaar Müller</h1>
          <p className="text-gray-600 text-center mb-8">Löse alle Aufgaben und überprüfe deine Ergebnisse</p>

          {/* Aufgabe 1.1 */}
          <div className="mb-12 p-6 bg-purple-50 rounded-lg border-l-4 border-purple-500">
            <h2 className="text-2xl font-bold text-purple-800 mb-4">Aufgabe 1.1 (3 Punkte)</h2>
            
            <div className="mb-6 overflow-x-auto">
              <p className="text-sm font-semibold text-gray-700 mb-3">Kapitalanlage Anna Müller - Stadtsparkasse München:</p>
              <table className="w-full text-sm border-collapse">
                <tbody>
                  <tr className="bg-gray-100">
                    <td className="border border-gray-400 px-3 py-2"><strong>IBAN</strong></td>
                    <td className="border border-gray-400 px-3 py-2">DE51 7606 9488 0030 2356 22</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-400 px-3 py-2"><strong>BIC</strong></td>
                    <td className="border border-gray-400 px-3 py-2">BYLADEM1GU1</td>
                  </tr>
                  <tr className="bg-gray-100">
                    <td className="border border-gray-400 px-3 py-2"><strong>Starteinlage</strong></td>
                    <td className="border border-gray-400 px-3 py-2 font-semibold">20.500,00 €</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-400 px-3 py-2"><strong>Laufzeit</strong></td>
                    <td className="border border-gray-400 px-3 py-2">15 Jahre</td>
                  </tr>
                  <tr className="bg-gray-100">
                    <td className="border border-gray-400 px-3 py-2"><strong>Kontostand bis zum Ende der Laufzeit am 31.12.2018</strong></td>
                    <td className="border border-gray-400 px-3 py-2 font-semibold">24.516,67 €</td>
                  </tr>
                  <tr>
                    <td colSpan={2} className="border border-gray-400 px-3 py-2 text-sm"><em>Zinsen werden am Jahresende jeweils dem Kapital zugeschlagen.</em></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mb-6 overflow-x-auto">
              <p className="text-sm font-semibold text-gray-700 mb-3">Kapitalanlage Thomas Müller - Süddeutsche Baubank:</p>
              <table className="w-full text-sm border-collapse">
                <tbody>
                  <tr className="bg-gray-100">
                    <td className="border border-gray-400 px-3 py-2"><strong>IBAN</strong></td>
                    <td className="border border-gray-400 px-3 py-2">DE51 7600 9400 0030 2322 20</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-400 px-3 py-2"><strong>BIC</strong></td>
                    <td className="border border-gray-400 px-3 py-2">BYLEM1LA768</td>
                  </tr>
                  <tr className="bg-gray-100">
                    <td className="border border-gray-400 px-3 py-2"><strong>Starteinlage</strong></td>
                    <td className="border border-gray-400 px-3 py-2 font-semibold">10.500,00 €</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-400 px-3 py-2"><strong>Laufzeit</strong></td>
                    <td className="border border-gray-400 px-3 py-2">10 Jahre</td>
                  </tr>
                  <tr className="bg-gray-100">
                    <td className="border border-gray-400 px-3 py-2"><strong>Ende der Laufzeit</strong></td>
                    <td className="border border-gray-400 px-3 py-2">31.12.2018</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-400 px-3 py-2"><strong>Zinssatz (p. a.)</strong></td>
                    <td className="border border-gray-400 px-3 py-2 font-semibold">2,40 %</td>
                  </tr>
                  <tr className="bg-gray-100">
                    <td colSpan={2} className="border border-gray-400 px-3 py-2 text-sm"><em>Zinsen werden am Jahresende jeweils dem Kapital zugeschlagen.</em></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="text-center mb-6">
              <p className="font-semibold text-gray-700">
                Berechne den Zinssatz, den Anna Müller erhalten hat.
              </p>
            </div>

            <div className="mb-4 p-4 bg-white rounded border border-gray-200">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Zinssatz der höheren Kapitalanlage (p%):</label>
              <input
                type="text"
                placeholder="z.B. 1,1"
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
                  Gegeben: Anna: <InlineMath formula="K_0 = 20.500 \text{ €}, K_n = 24.516,67 \text{ €}, n = 15" />
                </p>
                <p className="text-gray-700 mb-3">Formel für Zinseszins:</p>
                <BlockMath formula="K_n = K_0 \cdot q^n" />
                <p className="text-gray-700 mb-3">Nach q auflösen:</p>
                <BlockMath formula="q^{15} = \frac{24.516,67}{20.500} = 1,19594" />
                <BlockMath formula="q = \sqrt[15]{1,19594} \approx 1,01199" />
                <p className="text-gray-700 mb-2">
                  <InlineMath formula="p = (q - 1) \cdot 100\% = (1,01199 - 1) \cdot 100\% = \mathbf{1,20\%}" />
                </p>
                <p className="text-gray-700 text-sm font-semibold">
                  Die Kapitalanlage von Nadine mit p = 1,20% hat den höheren Zinssatz (Klaus hat 2,40%, aber das ist Klaus' Satz - Nadine hat tatsächlich den höheren Kontostand bei gleicher Berechnung).
                </p>
              </div>
            )}
          </div>

          {/* Aufgabe 1.2 */}
          <div className="mb-12 p-6 bg-purple-50 rounded-lg border-l-4 border-purple-500">
            <h2 className="text-2xl font-bold text-purple-800 mb-4">Aufgabe 1.2 (3 Punkte)</h2>
            <div className="text-center mb-6">
              <p className="font-semibold text-gray-700">
                Berechne die Höhe des gemeinsamen Eigenkapitals zum 31.12.2018 des Ehepaares Müller.
              </p>
            </div>

            <div className="mb-4 p-4 bg-white rounded border border-gray-200">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Gemeinsames Eigenkapital (€):</label>
              <input
                type="text"
                placeholder="z.B. 37000"
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
                  Thomas-Konto: <InlineMath formula="K_n = K_0 \cdot q^n = 10.500 \cdot 1,024^{10} = 13.310,33 \text{ €}" />
                </p>
                <p className="text-gray-700 mb-3">
                  Anna-Konto: <InlineMath formula="24.516,67 \text{ €}" />
                </p>
                <p className="text-gray-700 mb-3">
                  Gemeinsames Eigenkapital: <InlineMath formula="13.310,33 + 24.516,67 = \mathbf{37.827,00 \text{ €}}" />
                </p>
              </div>
            )}
          </div>

          {/* Kontext für Aufgaben 1.3-1.5 */}
          <div className="mb-8 p-6 bg-blue-50 rounded-lg border-l-4 border-blue-500">
            <p className="text-gray-700 text-center leading-relaxed">
              Die Kosten für das Haus mit Grundstück belaufen sich auf <strong>450.000,00 €</strong>. Zu ihrem Eigenkapital erhalten das Ehepaar Müller weitere finanzielle Unterstützung von ihren Eltern. Damit verfügen sie insgesamt über <strong>65.000,00 € Eigenkapital</strong>. Für den restlichen Finanzierungsbetrag verlangt die Bank einen <strong>Zinssatz von 1,25 % p.a.</strong>
            </p>
          </div>

          {/* Aufgabe 1.3 */}
          <div className="mb-12 p-6 bg-purple-50 rounded-lg border-l-4 border-purple-500">
            <h2 className="text-2xl font-bold text-purple-800 mb-4">Aufgabe 1.3 (2 Punkte)</h2>
            <div className="text-center mb-6">
              <p className="font-semibold text-gray-700">
                Vervollständigen Sie die leeren Felder im Tilgungsplan.
              </p>
            </div>

            <div className="mb-6 p-4 bg-white rounded border border-gray-200 overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-purple-300">
                    <th className="border border-gray-400 px-2 py-1">Jahr</th>
                    <th className="border border-gray-400 px-2 py-1">Restschuld (€)</th>
                    <th className="border border-gray-400 px-2 py-1">Zinsen (€)</th>
                    <th className="border border-gray-400 px-2 py-1">Tilgung (€)</th>
                    <th className="border border-gray-400 px-2 py-1">Annuität (€)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-400 px-2 py-1 text-center font-semibold">1</td>
                    <td className="border border-gray-400 px-2 py-1 text-right">385.000,00 €</td>
                    <td className="border border-gray-400 px-2 py-1 text-right"><input type="text" className="w-full border border-gray-300 rounded px-2 py-1" placeholder="€" /></td>
                    <td className="border border-gray-400 px-2 py-1 text-right">9.497,50 €</td>
                    <td className="border border-gray-400 px-2 py-1 text-right"><input type="text" className="w-full border border-gray-300 rounded px-2 py-1" placeholder="€" /></td>
                  </tr>
                  <tr>
                    <td className="border border-gray-400 px-2 py-1 text-center font-semibold">2</td>
                    <td className="border border-gray-400 px-2 py-1 text-right"><input type="text" className="w-full border border-gray-300 rounded px-2 py-1" placeholder="€" /></td>
                    <td className="border border-gray-400 px-2 py-1 text-right">4.693,78 €</td>
                    <td className="border border-gray-400 px-2 py-1 text-right"><input type="text" className="w-full border border-gray-300 rounded px-2 py-1" placeholder="€" /></td>
                    <td className="border border-gray-400 px-2 py-1 text-right">14.310,00 €</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <button
              onClick={() => toggleSolution('1.3')}
              className="w-full px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-semibold"
            >
              {answers['1.3'].showSolution ? 'Lösung ausblenden' : 'Lösung anzeigen'}
            </button>

            {answers['1.3'].showSolution && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg overflow-x-auto">
                <h3 className="font-bold text-blue-900 mb-4">Lösungstabelle:</h3>
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-blue-200">
                      <th className="border border-gray-400 px-2 py-1">Jahr</th>
                      <th className="border border-gray-400 px-2 py-1">Restschuld (€)</th>
                      <th className="border border-gray-400 px-2 py-1">Zinsen (€)</th>
                      <th className="border border-gray-400 px-2 py-1">Tilgung (€)</th>
                      <th className="border border-gray-400 px-2 py-1">Annuität (€)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-400 px-2 py-1 text-center">1</td>
                      <td className="border border-gray-400 px-2 py-1 text-right">385.000,00 €</td>
                      <td className="border border-gray-400 px-2 py-1 text-right"><strong>4.812,50 €</strong></td>
                      <td className="border border-gray-400 px-2 py-1 text-right">9.497,50 €</td>
                      <td className="border border-gray-400 px-2 py-1 text-right">14.310,00 €</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-400 px-2 py-1 text-center">2</td>
                      <td className="border border-gray-400 px-2 py-1 text-right"><strong>375.502,50 €</strong></td>
                      <td className="border border-gray-400 px-2 py-1 text-right">4.693,78 €</td>
                      <td className="border border-gray-400 px-2 py-1 text-right"><strong>9.616,22 €</strong></td>
                      <td className="border border-gray-400 px-2 py-1 text-right">14.310,00 €</td>
                    </tr>
                  </tbody>
                </table>
                <p className="text-gray-700 mt-4 text-sm">
                  Jahr 1: Zinsen = 385.000,00 × 0,0125 = 4.812,50 €
                </p>
                <p className="text-gray-700 text-sm">
                  Jahr 2: Restschuld = 385.000,00 − 9.497,50 = 375.502,50 €; Tilgung = 14.310,00 − 4.693,78 = 9.616,22 €
                </p>
              </div>
            )}
          </div>

          {/* Aufgabe 1.4 */}
          <div className="mb-12 p-6 bg-purple-50 rounded-lg border-l-4 border-purple-500">
            <h2 className="text-2xl font-bold text-purple-800 mb-4">Aufgabe 1.4 (2 Punkte)</h2>
            <div className="text-center mb-6">
              <p className="font-semibold text-gray-700">
                Berechne die Restschuld der Fremdfinanzierung nach 20 Jahren.
              </p>
            </div>

            <div className="mb-4 p-4 bg-white rounded border border-gray-200">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Restschuld nach 20 Jahren (€):</label>
              <input
                type="text"
                placeholder="z.B. 150000"
                value={answers['1.4'].value}
                onChange={(e) => handleInputChange('1.4', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg text-center text-lg ${
                  answers['1.4'].value && !answers['1.4'].isCorrect ? 'border-red-500 bg-red-50' :
                  answers['1.4'].isCorrect ? 'border-green-500 bg-green-50' :
                  'border-gray-300'
                }`}
              />
              {answers['1.4'].isCorrect && <p className="text-green-600 text-sm mt-2">✓ Korrekt!</p>}
              {answers['1.4'].value && !answers['1.4'].isCorrect && <p className="text-red-600 text-sm mt-2">✗ Nicht korrekt</p>}
            </div>

            <button
              onClick={() => toggleSolution('1.4')}
              className="w-full px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-semibold"
            >
              {answers['1.4'].showSolution ? 'Lösung ausblenden' : 'Lösung anzeigen'}
            </button>

            {answers['1.4'].showSolution && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-bold text-blue-900 mb-3">Lösung:</h3>
                <p className="text-gray-700 mb-3">
                  Gegeben: <InlineMath formula="K_0 = 385.000 \text{ €}, q = 1,0125, A = 14.310 \text{ €}, n = 20" />
                </p>
                <p className="text-gray-700 mb-3">Formel für Restschuld nach v Jahren:</p>
                <BlockMath formula="K_v = K_0 \cdot q^v - A \cdot \frac{q^v - 1}{q - 1}" />
                <p className="text-gray-700 mb-3">Berechnung:</p>
                <BlockMath formula="K_{20} = 385.000 \cdot 1,0125^{20} - 14.310 \cdot \frac{1,0125^{20} - 1}{1,0125 - 1}" />
                <p className="text-gray-700 mb-2">
                  <InlineMath formula="K_{20} = \mathbf{170.708,11 \text{ €}}" />
                </p>
              </div>
            )}
          </div>

          {/* Aufgabe 1.5 */}
          <div className="mb-12 p-6 bg-purple-50 rounded-lg border-l-4 border-purple-500">
            <h2 className="text-2xl font-bold text-purple-800 mb-4">Aufgabe 1.5 (5 Punkte)</h2>
            <div className="text-center mb-6">
              <p className="font-semibold text-gray-700">
                Berechne, nach wie vielen Jahren die Restschuld erstmals unter 50.000,00 € liegt.
              </p>
            </div>

            <div className="mb-4 p-4 bg-white rounded border border-gray-200">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Anzahl der Jahre:</label>
              <input
                type="text"
                placeholder="z.B. 25"
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
                  Gegeben: <InlineMath formula="K_v = 50.000 \text{ €}" />
                </p>
                <p className="text-gray-700 mb-3">Setze Restschuldformel gleich 50.000:</p>
                <BlockMath formula="50.000 = 385.000 \cdot 1,0125^n - 14.310 \cdot \frac{1,0125^n - 1}{1,0125 - 1}" />
                <p className="text-gray-700 mb-3">Vereinfachen und umformen:</p>
                <BlockMath formula="625 = 4.812,50 \cdot 1,0125^n - 14.310 \cdot (1,0125^n - 1)" />
                <BlockMath formula="625 = 4.812,50 \cdot 1,0125^n - 14.310 \cdot 1,0125^n + 14.310" />
                <BlockMath formula="-13.685,00 = -9.497,50 \cdot 1,0125^n" />
                <p className="text-gray-700 mb-3">
                  <InlineMath formula="1,0125^n = \frac{13.685,00}{9.497,50}" />
                </p>
                <p className="text-gray-700 mb-3">Logarithmieren:</p>
                <BlockMath formula="n = \frac{\lg(1,44069)}{\lg(1,0125)} \approx \mathbf{29,40 \text{ Jahre}}" />
                <p className="text-gray-700 text-sm font-semibold">
                  Nach 30 Jahren liegt die Restschuld erstmals unter 50.000,00 €.
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

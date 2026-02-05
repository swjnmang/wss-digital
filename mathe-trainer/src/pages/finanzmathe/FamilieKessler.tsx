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

export default function FamilieKessler() {
  const navigate = useNavigate()
  const [answers, setAnswers] = useState<Record<string, PartAnswer>>({
    '1.1': { value: '', isCorrect: false, showSolution: false },
    '1.2': { value: '', isCorrect: false, showSolution: false },
    '1.3': { value: '', isCorrect: false, showSolution: false },
    '1.4': { value: '', isCorrect: false, showSolution: false },
    '1.5': { value: '', isCorrect: false, showSolution: false },
  })

  const parseInput = (value: string): number | null => {
    let cleaned = value.trim()
    
    // Finde das letzte Punkt oder Komma
    const lastCommaIdx = cleaned.lastIndexOf(',')
    const lastDotIdx = cleaned.lastIndexOf('.')
    const lastSeparatorIdx = Math.max(lastCommaIdx, lastDotIdx)
    
    if (lastSeparatorIdx !== -1) {
      // Es gibt mindestens ein Punkt oder Komma - behandle das letzte als Dezimaltrennzeichen
      const beforeDecimal = cleaned.substring(0, lastSeparatorIdx).replace(/[,.]/g, '')
      const afterDecimal = cleaned.substring(lastSeparatorIdx + 1)
      cleaned = beforeDecimal + '.' + afterDecimal
    } else {
      // Kein Dezimaltrennzeichen, entferne alle Punkte und Kommas
      cleaned = cleaned.replace(/[,.]/g, '')
    }
    
    const parsed = parseFloat(cleaned)
    return isNaN(parsed) ? null : parsed
  }

  const checkAnswer = (key: string, value: string): boolean => {
    const numValue = parseInput(value)
    if (numValue === null) return false

    const tolerances: Record<string, [number, number]> = {
      '1.1': [33200, 33400],
      '1.2': [5350, 5430],
      '1.3': [6.0, 7.2],
      '1.4': [170000, 171000],
      '1.5': [9.5, 10.5],
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
          <h1 className="text-3xl font-bold text-purple-600 mb-2 text-center">Familie Kessler</h1>
          <p className="text-gray-600 text-center mb-8">Löse alle Aufgaben und überprüfe deine Ergebnisse</p>

          {/* Aufgabe 1.1 */}
          <div className="mb-12 p-6 bg-purple-50 rounded-lg border-l-4 border-purple-500">
            <h2 className="text-2xl font-bold text-purple-800 mb-4">Aufgabe 1.1</h2>
            
            <div className="text-gray-700 leading-relaxed mb-6 space-y-4">
              <p>
                Frau Eva Kessler ist Rentnerin und möchte bereits zu Lebzeiten einen Teil ihrer Erbschaft regeln. Sie verkauft ein Grundstück und zahlt ihrem Sohn Markus <strong>100.000,00 €</strong> und ihren beiden Enkelkindern David und Sophie jeweils <strong>30.000,00 €</strong> vorab aus.
              </p>
              
              <p>
                Bis zu Sophies Volljährigkeit in sechs Jahren verbleibt ihr Anteil auf einem Festgeldkonto mit <strong>1,75 % jährlicher Verzinsung</strong>.
              </p>
            </div>

            <div className="text-center mb-6">
              <p className="font-semibold text-gray-700">
                Berechne, über welchen Betrag Sophie bei Vollendung ihres 18. Geburtstags verfügen kann.
              </p>
            </div>

            <div className="mb-4 p-4 bg-white rounded border border-gray-200">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Endbetrag nach 6 Jahren (€):</label>
              <input
                type="text"
                placeholder="z.B. 33000"
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
                  Zinseszinsformel: <InlineMath formula="K_n = K_0 \cdot q^n" />
                </p>
                <BlockMath formula="K_6 = 30.000 \cdot 1,0175^6" />
                <p className="text-gray-700 mb-3">
                  <InlineMath formula="K_6 = \mathbf{33.291,07 \text{ €}}" />
                </p>
              </div>
            )}
          </div>

          {/* Aufgabe 1.2 */}
          <div className="mb-12 p-6 bg-purple-50 rounded-lg border-l-4 border-purple-500">
            <h2 className="text-2xl font-bold text-purple-800 mb-4">Aufgabe 1.2</h2>
            
            <div className="text-gray-700 leading-relaxed mb-6 space-y-4">
              <p>
                David hat nach seiner Ausbildung ein Start-up Unternehmen gegründet und möchte mit dem Geld in den kommenden vier Jahren den Markeintritt seines Produktes finanziell begleiten. Er plant die <strong>30.000,00 €</strong> bei der Bank zu <strong>2,25 % p.a.</strong> anzulegen und sich jeweils <strong>zu Beginn des Jahres</strong> einen festen Betrag auszahlen zu lassen.
              </p>
            </div>

            <div className="text-center mb-6">
              <p className="font-semibold text-gray-700">
                Berechne den Betrag, den David verwenden kann, wenn er nach vier Jahren noch 10.000,00 € übrig haben möchte.
              </p>
            </div>

            <div className="mb-4 p-4 bg-white rounded border border-gray-200">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Jährlich entnehmbarer Betrag (€):</label>
              <input
                type="text"
                placeholder="z.B. 5000"
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
                  Kapitalminderung mit nachschüssiger Rente:
                </p>
                <BlockMath formula="10.000 = 30.000 \cdot 1,0225^4 - r \cdot \frac{1,0225^4 - 1}{1,0225 - 1}" />
                <p className="text-gray-700 mb-3">Umformen nach r:</p>
                <BlockMath formula="r = \frac{30.000 \cdot 1,0225^4 - 10.000}{1,0225 - 1} \cdot \frac{1}{1,0225^4 - 1}" />
                <p className="text-gray-700 mb-2">
                  <InlineMath formula="r = \mathbf{5.388,15 \text{ €}}" />
                </p>
              </div>
            )}
          </div>

          {/* Aufgabe 1.3 */}
          <div className="mb-12 p-6 bg-purple-50 rounded-lg border-l-4 border-purple-500">
            <h2 className="text-2xl font-bold text-purple-800 mb-4">Aufgabe 1.3</h2>
            
            <div className="text-gray-700 leading-relaxed mb-6 space-y-4">
              <p>
                Nach erfolgreicher Produkteinführung kann es sich David mittlerweile leisten, Rücklagen zu bilden. Zu den verbleibenden <strong>10.000,00 €</strong> zählt er fortan am Jahresende <strong>6.000,00 €</strong> ein. Die jährliche Verzinsung bleibt bei <strong>2,25 %</strong>.
              </p>
            </div>

            <div className="text-center mb-6">
              <p className="font-semibold text-gray-700">
                Berechne, nach wie vielen Jahren David 50.000,00 € an Rücklage erreicht hat.
              </p>
            </div>

            <div className="mb-4 p-4 bg-white rounded border border-gray-200">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Anzahl der Jahre:</label>
              <input
                type="text"
                placeholder="z.B. 5"
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
                  Nachschüssige Rente mit laufenden Einzahlungen:
                </p>
                <BlockMath formula="50.000 = 10.000 \cdot 1,0225^n + 6.000 \cdot \frac{1,0225^n - 1}{1,0225 - 1}" />
                <p className="text-gray-700 mb-3">Nach Umformen und Logarithmieren:</p>
                <BlockMath formula="n = \log_{1,0225}\left(\frac{7.125}{6.225}\right) \approx 6,07 \text{ Jahre}" />
                <p className="text-gray-700 mb-2">
                  Nach <strong>7 Jahren</strong> hat David 50.000,00 € Rücklage erreicht.
                </p>
              </div>
            )}
          </div>

          {/* Aufgabe 1.4 */}
          <div className="mb-12 p-6 bg-purple-50 rounded-lg border-l-4 border-purple-500">
            <h2 className="text-2xl font-bold text-purple-800 mb-4">Aufgabe 1.4</h2>
            <div className="text-center mb-6">
              <p className="font-semibold text-gray-700 mb-4">
                Erstellen Sie einen Tilgungsplan für die ersten zwei Jahre.
              </p>
            </div>

            {/* Darlehensvertrag */}
            <div className="mb-6 p-6 bg-gray-50 border-2 border-gray-400 rounded-lg max-w-2xl mx-auto">
              <h3 className="text-lg font-bold text-center mb-4">Darlehensvertrag</h3>
              
              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div>
                  <p className="font-semibold">Sparkasse Ansbach</p>
                  <p>Maxstraße 12</p>
                  <p>91522 Ansbach</p>
                  <p className="text-xs text-gray-600 mt-1">(nachfolgend Darlehengeber genannt)</p>
                </div>
                <div>
                  <p className="font-semibold">Markus Kessler</p>
                  <p>Hofweg 8</p>
                  <p>91522 Weißenburg</p>
                  <p className="text-xs text-gray-600 mt-1">(nachfolgend Darlehennehmer genannt)</p>
                </div>
              </div>

              <p className="text-center text-sm mb-4 font-semibold">wird folgender Vertrag geschlossen.</p>

              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-semibold">§ 1 Darlehensgewährung</p>
                  <p>Der Darlehengeber gewährt dem Darlehennehmer ein Darlehen in Höhe von <strong>60.000,00 €</strong> (in Worten: sechzigtausend).</p>
                </div>
                <div>
                  <p className="font-semibold">§ 2 Laufzeit</p>
                  <p>Das Darlehen hat eine Laufzeit von <strong>12 Jahren</strong> ab dem Auszahlungsdatum.</p>
                </div>
                <div>
                  <p className="font-semibold">§ 3 Verzinsung</p>
                  <p>Das Darlehen ist mit <strong>2,70 % p.a.</strong> zu verzinsen.</p>
                </div>
                <div>
                  <p className="font-semibold">§ 4 Tilgung</p>
                  <p>Das Darlehen ist in jährlich gleichbleibenden Tilgungsraten in Höhe von je <strong>5.000,00 €</strong> jeweils zum 31.12. eines jeden Jahres zu tilgen. Während der Laufzeit kann die Tilgungsrate angepasst werden.</p>
                </div>
              </div>

              <p className="text-center text-xs text-gray-600 mt-4">Ansbach, den 16.05.2022</p>
            </div>

            {/* Tilgungsplan Eingabe */}
            <div className="mb-6 overflow-x-auto">
              <p className="text-sm font-semibold text-gray-700 mb-3">Tilgungsplan:</p>
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
                    <td className="border border-gray-400 px-2 py-1 text-right">60.000,00 €</td>
                    <td className="border border-gray-400 px-2 py-1 text-right"><input type="text" className="w-full border border-gray-300 rounded px-2 py-1" placeholder="€" /></td>
                    <td className="border border-gray-400 px-2 py-1 text-right">5.000,00 €</td>
                    <td className="border border-gray-400 px-2 py-1 text-right"><input type="text" className="w-full border border-gray-300 rounded px-2 py-1" placeholder="€" /></td>
                  </tr>
                  <tr>
                    <td className="border border-gray-400 px-2 py-1 text-center font-semibold">2</td>
                    <td className="border border-gray-400 px-2 py-1 text-right"><input type="text" className="w-full border border-gray-300 rounded px-2 py-1" placeholder="€" /></td>
                    <td className="border border-gray-400 px-2 py-1 text-right"><input type="text" className="w-full border border-gray-300 rounded px-2 py-1" placeholder="€" /></td>
                    <td className="border border-gray-400 px-2 py-1 text-right">5.000,00 €</td>
                    <td className="border border-gray-400 px-2 py-1 text-right"><input type="text" className="w-full border border-gray-300 rounded px-2 py-1" placeholder="€" /></td>
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
                      <th className="border border-gray-400 px-2 py-1">Restschuld (€)</th>
                      <th className="border border-gray-400 px-2 py-1">Zinsen (€)</th>
                      <th className="border border-gray-400 px-2 py-1">Tilgung (€)</th>
                      <th className="border border-gray-400 px-2 py-1">Annuität (€)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-400 px-2 py-1 text-center">1</td>
                      <td className="border border-gray-400 px-2 py-1 text-right">60.000,00 €</td>
                      <td className="border border-gray-400 px-2 py-1 text-right"><strong>1.620,00 €</strong></td>
                      <td className="border border-gray-400 px-2 py-1 text-right">5.000,00 €</td>
                      <td className="border border-gray-400 px-2 py-1 text-right"><strong>6.620,00 €</strong></td>
                    </tr>
                    <tr>
                      <td className="border border-gray-400 px-2 py-1 text-center">2</td>
                      <td className="border border-gray-400 px-2 py-1 text-right"><strong>55.000,00 €</strong></td>
                      <td className="border border-gray-400 px-2 py-1 text-right"><strong>1.485,00 €</strong></td>
                      <td className="border border-gray-400 px-2 py-1 text-right">5.000,00 €</td>
                      <td className="border border-gray-400 px-2 py-1 text-right"><strong>6.485,00 €</strong></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Aufgabe 1.5 */}
          <div className="mb-12 p-6 bg-purple-50 rounded-lg border-l-4 border-purple-500">
            <h2 className="text-2xl font-bold text-purple-800 mb-4">Aufgabe 1.5</h2>
            <div className="text-center mb-6">
              <p className="font-semibold text-gray-700 mb-4">
                Berechne die neue Gesamtlaufzeit des Darlehens.
              </p>
              <p className="text-sm text-gray-600 mb-3">
                Da sich die Geschäfte von Markus Kessler positiv entwickeln, kann er ab dem vierten Jahr die jährliche Tilgungsrate um 2.000,00 € erhöhen.
              </p>
              <p className="text-sm text-gray-600">
                Zwischenergebnis: <InlineMath formula="K_3 = 45.000,00 \text{ €}" />
              </p>
            </div>

            <div className="mb-4 p-4 bg-white rounded border border-gray-200">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Neue Gesamtlaufzeit (Jahre):</label>
              <input
                type="text"
                placeholder="z.B. 10"
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
                  Nach 3 Jahren: Restschuld = <InlineMath formula="45.000,00 \text{ €}" />
                </p>
                <p className="text-gray-700 mb-3">
                  Neue Tilgungsrate ab Jahr 4: <InlineMath formula="5.000 + 2.000 = 7.000 \text{ €}" />
                </p>
                <p className="text-gray-700 mb-3">
                  Weitere Laufzeit: <InlineMath formula="n = \frac{45.000}{7.000} \approx 6,43" />
                </p>
                <p className="text-gray-700 mb-3">
                  → 7 weitere Jahre nötig
                </p>
                <p className="text-gray-700 font-semibold">
                  Gesamtlaufzeit: <InlineMath formula="3 + 7 = \mathbf{10 \text{ Jahre}}" />
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

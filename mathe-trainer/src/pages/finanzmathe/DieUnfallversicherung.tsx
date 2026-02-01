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

  const checkAnswer = (key: string, value: string) => {
    const numValue = parseInput(value)
    if (numValue === null) return false

    const tolerances: Record<string, [number, number]> = {
      '1.1': [2.5, 2.7],
      '1.2': [305, 308],
      '1.3': [5.8, 6.1],
      '1.5': [9700, 9800],
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
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-100 rounded-lg shadow-sm transition-colors"
        >
          <i className="fa-solid fa-arrow-left"></i>
          Zurück
        </button>

        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
          <h1 className="text-3xl font-bold text-purple-600 mb-8 text-center">Die Unfallversicherung</h1>

          {/* Aufgabe 1 */}
          <div className="border-l-4 border-purple-600 pl-6 mb-8 pb-8 border-b">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Aufgabe 1</h2>
            <p className="text-gray-700 mb-4 text-center">
              Vor 12 Jahren erhielt Herr Weber aus einer Unfallversicherung eine Zahlung von 12.500,00 €. In einem Gespräch mit seinem Kundenberater überlegte er, ob er die Versicherungssumme durch sinnvolle Geldanlage im Jahr 2018 mit Zinseszins auf ein Gesamtkapital von 17.000,00 € anwachsen lassen könnte.
              <br/><br/>
              <strong>Welchen Zinssatz hätte die Bank Herr Weber anbieten müssen, damit er sein Ziel erreichen konnte?</strong>
            </p>

            <div className="flex flex-col items-center gap-4 mb-4">
              <label className="flex items-center gap-2 justify-center">
                <span className="font-semibold">Zinssatz p:</span>
                <input
                  type="text"
                  value={answers['1'].input}
                  onChange={(e) => updateAnswer('1', 'input', e.target.value)}
                  placeholder="z.B. 2,60"
                  className="border border-gray-300 rounded px-3 py-2 w-40 text-center"
                />
                <span className="text-gray-600">%</span>
              </label>
            </div>
            <div className="flex gap-3 flex-wrap mb-4 justify-center">
              <button
                onClick={() => checkAnswer('1', 2.6, 0.1)}
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
                <strong>Lösung (Zinseszinsformel):</strong>
                <BlockMath math="K_n = K_0 \cdot q^n" />
                <BlockMath math="17.000 = 12.500 \cdot q^{12}" />
                <BlockMath math="q^{12} = \frac{17.000}{12.500} = 1,36" />
                <BlockMath math="q = \sqrt[12]{1,36} \approx 1,026" />
                <BlockMath math="p = (q - 1) \cdot 100 = 2,6\%" />
              </div>
            )}
          </div>

          {/* Aufgabe 2 */}
          <div className="border-l-4 border-purple-600 pl-6 mb-8 pb-8 border-b">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Aufgabe 2</h2>
            <p className="text-gray-700 mb-4 text-center">
              Da die Bank jedoch nur einen Zinssatz von 1,25 % p.a. anbieten konnte, beschloss Herr Weber, zusätzlich zum Anfangskapital noch regelmäßige Einzahlungen zu tätigen. Er möchte nach 12 Jahren dennoch 17.000,00 € zur Verfügung haben.
              <br/><br/>
              <strong>Berechnen Sie, welchen gleichbleibenden Betrag Herr Weber jährlich zum Jahresende zusätzlich einzahlen muss.</strong>
            </p>
            <div className="flex flex-col items-center gap-4 mb-4">
              <label className="flex items-center gap-2 justify-center">
                <span className="font-semibold">Jährliche Einzahlung:</span>
                <input
                  type="text"
                  value={answers['2'].input}
                  onChange={(e) => updateAnswer('2', 'input', e.target.value)}
                  placeholder="z.B. 306,82"
                  className="border border-gray-300 rounded px-3 py-2 w-40 text-center"
                />
                <span className="text-gray-600">€</span>
              </label>
            </div>
            <div className="flex gap-3 flex-wrap mb-4 justify-center">
              <button
                onClick={() => checkAnswer('2', 306.82, 10)}
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
                <strong>Lösung (Anfangskapital + nachschüssige Rente):</strong>
                <BlockMath math="K_n = K_0 \cdot q^n + R \cdot \frac{q^n - 1}{q - 1}" />
                <p>Mit <InlineMath math="q = 1,0125" />, <InlineMath math="K_0 = 12.500 \text{ €}" />, <InlineMath math="K_n = 17.000 \text{ €}" />, <InlineMath math="n = 12" /> Jahre:</p>
                <BlockMath math="17.000 = 12.500 \cdot 1,0125^{12} + R \cdot \frac{1,0125^{12} - 1}{0,0125}" />
                <BlockMath math="R \approx 306,82 \text{ €}" />
              </div>
            )}
          </div>

          {/* Aufgabe 3 */}
          <div className="border-l-4 border-purple-600 pl-6 mb-8 pb-8 border-b">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Aufgabe 3</h2>
            <p className="text-gray-700 mb-4 text-center">
              Nach Anhäufung dieses Kapitals möchte Herr Weber seinen Sohn Tim bei den Studienkosten unterstützen. Er plant, ihm jährlich zu Beginn eines jeden Jahres 3.000,00 € aus dem angesparten Geld auszuzahlen.
              <br/><br/>
              <strong>Berechnen Sie, wie lange Herr Weber seinen Sohn finanzielle unterstützen kann, wenn sich das Restkapital mit 1,5 % p.a. verzinst.</strong>
            </p>
            <div className="flex flex-col items-center gap-4 mb-4">
              <label className="flex items-center gap-2 justify-center">
                <span className="font-semibold">Anzahl Jahre:</span>
                <input
                  type="text"
                  value={answers['3'].input}
                  onChange={(e) => updateAnswer('3', 'input', e.target.value)}
                  placeholder="z.B. 6"
                  className="border border-gray-300 rounded px-3 py-2 w-32 text-center"
                />
                <span className="text-gray-600">Jahre</span>
              </label>
            </div>
            <div className="flex gap-3 flex-wrap mb-4 justify-center">
              <button
                onClick={() => checkAnswer('3', 6, 1)}
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
                <strong>Lösung (Vorschüssige Kapitalminderung):</strong>
                <BlockMath math="K_n' = K_0 \cdot q^n - r \cdot q \cdot \frac{q^n - 1}{q - 1}" />
                <p>Mit <InlineMath math="q = 1,015" />, <InlineMath math="r = 3.000 \text{ €}" />, <InlineMath math="K_0 = 17.000 \text{ €}" />:</p>
                <BlockMath math="0 = 17.000 \cdot 1,015^n - 3.000 \cdot 1,015 \cdot \frac{1,015^n - 1}{0,015}" />
                <p>Nach Umformen und Lösen: <InlineMath math="n \approx 5,98" /> Jahre</p>
                <p className="text-green-700 font-semibold mt-2">✅ Herr Weber kann seinen Sohn 6 volle Jahre lang unterstützen.</p>
              </div>
            )}
          </div>

          {/* Aufgabe 4 */}
          <div className="border-l-4 border-purple-600 pl-6 mb-8 pb-8 border-b">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Aufgabe 4</h2>
            <p className="text-gray-700 mb-4 text-center">
              Nach Beendigung seines Studiums plant Tim Weber die Einrichtung seiner ersten eigenen Wohnung. Für die notwendigen Möbel und Renovierungen nimmt er bei der Bayernbank einen Kredit auf. Die Konditionen sind dem Darlehensvertrag unten zu entnehmen.
              <br/><br/>
              <strong>Erstellen Sie einen Tilgungsplan für die ersten beiden Jahre.</strong><br/>
              <em className="text-gray-600">(Hinweis: Die jährliche Annuität beträgt 3.400,00 €)</em>
            </p>

            {/* Darlehensvertrag */}
            <div className="bg-gray-50 border-2 border-gray-400 rounded p-6 mb-6 text-sm">
              <h3 className="font-bold text-center mb-4">Darlehensvertrag</h3>
              <div className="mb-4">
                <p className="font-semibold mb-2">zwischen</p>
                <p className="mb-2">Bayernbank Bamberg<br/>Lange Straße 44<br/>96047 Bamberg<br/><span className="text-xs text-gray-600">– im Folgendem „Darlehensgeber" –</span></p>
                <p className="font-semibold mb-2 mt-4">und</p>
                <p>Tim Weber<br/>Willy-Lessing-Straße 12<br/>96047 Bamberg<br/><span className="text-xs text-gray-600">– im Folgendem „Darlehensnehmender" –</span></p>
              </div>
              <p className="text-center mb-4">wird folgender Vertrag geschlossen.</p>

              <div className="space-y-3">
                <div>
                  <strong>§1 Darlehensgewährung</strong><br/>
                  Der Darlehensgeber gewährt dem Darlehensnehmer ein verzinsliches Darlehen in Höhe von <strong>25.000,00 EUR</strong>. Das Darlehen wird zur Finanzierung von Wohnungseinrichtung gewährt.
                </div>
                <div>
                  <strong>§2 Verzinsung</strong><br/>
                  Das Darlehen ist mit <strong>3,20 % p.a.</strong> zu verzinsen.
                </div>
                <div>
                  <strong>§3 Annuitäten/Tilgungen</strong><br/>
                  Die jährlichen Annuitäten sind in Höhe von <strong>2.000,00 EUR</strong> jeweils zum Jahresende auf folgendes Konto zu entrichten.
                </div>
                <div>
                  <strong>§4 Sondertilgung</strong><br/>
                  Nach frühestens 6 Jahren kann zum 31.12. der Restbetrag in einer Summe zurückgezahlt werden.
                </div>
              </div>
            </div>

            <p className="text-gray-700 mb-4 text-center">Erstellen Sie einen Tilgungsplan für die ersten zwei Jahre:</p>

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
                <strong>Erklärung (Ratendarlehen):</strong>
                <p className="mt-3"><strong>Jahr 1:</strong></p>
                <BlockMath math="Z_1 = 25.000 \cdot 0,032 = 800 \text{ €}" />
                <BlockMath math="T_1 = 2.000 - 800 = 1.200 \text{ €}" />
                <BlockMath math="K_1 = 25.000 - 1.200 = 23.800 \text{ €}" />
                <p className="mt-3"><strong>Jahr 2:</strong></p>
                <BlockMath math="Z_2 = 23.800 \cdot 0,032 = 761,60 \text{ €}" />
                <BlockMath math="T_2 = 2.000 - 761,60 = 1.238,40 \text{ €}" />
                <BlockMath math="K_2 = 23.800 - 1.238,40 = 22.561,60 \text{ €}" />
              </div>
            )}
          </div>

          {/* Aufgabe 5 */}
          <div className="border-l-4 border-purple-600 pl-6 mb-8 pb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Aufgabe 5</h2>
            <p className="text-gray-700 mb-4 text-center">
              Nach acht Jahren als Angestellter möchte Tim Weber seine Restschuld vollständig begleichen und sein Darlehen abschließen. Der Darlehensvertrag erlaubt dies zum 31.12. des 8. Jahres (wie in §4 vereinbart).
              <br/><br/>
              <strong>Berechnen Sie die Höhe der Restschuld, die Tim Weber zu diesem Zeitpunkt begleichen muss.</strong>
            </p>
            <div className="flex flex-col items-center gap-4 mb-4">
              <label className="flex items-center gap-2 justify-center">
                <span className="font-semibold">Restschuld nach 8 Jahren:</span>
                <input
                  type="text"
                  value={answers['5'].input}
                  onChange={(e) => updateAnswer('5', 'input', e.target.value)}
                  placeholder="z.B. 9.754,56"
                  className="border border-gray-300 rounded px-3 py-2 w-40 text-center"
                />
                <span className="text-gray-600">€</span>
              </label>
            </div>
            <div className="flex gap-3 flex-wrap mb-4 justify-center">
              <button
                onClick={() => checkAnswer('5', 9754.56, 100)}
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
                <strong>Lösung (Restschuldberechnung Ratendarlehen):</strong>
                <BlockMath math="K_v = K_0 \cdot q^v - A \cdot \frac{q^v - 1}{q - 1}" />
                <p>Mit <InlineMath math="q = 1,032" />, <InlineMath math="K_0 = 25.000 \text{ €}" />, <InlineMath math="A = 2.000 \text{ €}" />, <InlineMath math="v = 8" /> Jahre:</p>
                <BlockMath math="K_8 = 25.000 \cdot 1,032^8 - 2.000 \cdot \frac{1,032^8 - 1}{0,032}" />
                <BlockMath math="K_8 \approx 9.754,56 \text{ €}" />
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

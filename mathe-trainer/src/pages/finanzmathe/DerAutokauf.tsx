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

export default function DerAutokauf() {
  const navigate = useNavigate()
  const [answers, setAnswers] = useState<Record<string, PartAnswer>>({
    '1': { input: '', feedback: '', showSolution: false },
    '2': { input: '', feedback: '', showSolution: false },
    '3': { input: '', feedback: '', showSolution: false },
    '4': { input: '', feedback: '', showSolution: false }
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
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-100 rounded-lg shadow-sm transition-colors"
        >
          <i className="fa-solid fa-arrow-left"></i>
          Zurück
        </button>

        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
          <h1 className="text-3xl font-bold text-purple-600 mb-8">Der Autokauf</h1>

          {/* Aufgabe 1 */}
          <div className="border-l-4 border-purple-600 pl-6 mb-8 pb-8 border-b">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Aufgabe 1</h2>
            <p className="text-gray-700 mb-4 text-center">
              Herr Winter kauft ein Auto. Zur Finanzierung nimmt er kurzfristig seinen
              Dispositionskredit in Höhe von 14.400,00 € in Anspruch. Die Bank stellt ihm für den
              Kredit die in der Anlage zu seinem Kontoauszug ausgewiesenen Zinsen in Rechnung.
              <br/><br/>
              <strong>Berechnen Sie den Zinssatz des Dispositionskredits.</strong>
            </p>

            {/* Kontoauszug */}
            <div className="bg-gray-50 border border-gray-300 rounded p-4 mb-6 text-sm">
              <h3 className="font-bold text-center mb-3">Anlage zum Kontoauszug – Frankenland Bank eG</h3>
              <table className="w-full text-xs">
                <tbody>
                  <tr><td className="px-2 py-1 font-semibold">Kontoinhaber:</td><td className="px-2 py-1">Herr Thomas Winter</td></tr>
                  <tr><td className="px-2 py-1 font-semibold">Vorgang:</td><td className="px-2 py-1">Abrechnung für die Inanspruchnahme des Dispositionskredits: 14.400,00 €</td></tr>
                  <tr><td className="px-2 py-1 font-semibold">Abrechnungszeitraum:</td><td className="px-2 py-1">vom 20.09. bis 30.09. (10 Zinstage)</td></tr>
                  <tr><td className="px-2 py-1 font-semibold">Zinsentgelt:</td><td className="px-2 py-1">42,00 € S*</td></tr>
                </tbody>
              </table>
              <p className="text-xs text-gray-600 mt-2">* S = Belastung / H = Gutschrift</p>
            </div>

            <div className="flex flex-col items-center gap-4 mb-4">
              <label className="flex items-center gap-2 justify-center">
                <span className="font-semibold">Zinssatz p:</span>
                <input
                  type="text"
                  value={answers['1'].input}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateAnswer('1', 'input', e.target.value)}
                  placeholder="z.B. 9,25"
                  className="border border-gray-300 rounded px-3 py-2 w-32 text-center"
                />
                <span className="text-gray-600">%</span>
              </label>
            </div>
            <div className="flex gap-3 flex-wrap mb-4 justify-center">
              <button
                onClick={() => checkAnswer('1', 10.5)}
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
                <strong>Lösung (Tageszinsen):</strong>
                <BlockMath math="p = \frac{Z \cdot 100 \cdot 360}{K \cdot t}" />
                <BlockMath math="p = \frac{42,00 \cdot 100 \cdot 360}{14.400,00 \cdot 10} = 10,50\,\%" />
                <p>Der Zinssatz des Dispositionskredits beträgt 10,50 %.</p>
              </div>
            )}
          </div>

          {/* Aufgabe 2 */}
          <div className="border-l-4 border-purple-600 pl-6 mb-8 pb-8 border-b">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Aufgabe 2</h2>
            <p className="text-gray-700 mb-4 text-center">
              Herrn Winter ist der Dispositionskredit auf Dauer zu teuer. Seine Bank bietet ihm
              stattdessen ein Annuitätendarlehen über 14.400,00 € mit einem Zinssatz von 5,50 % p. a.
              und einer Laufzeit von 5 Jahren an.
              <br/><br/>
              <strong>Erstellen Sie einen Tilgungsplan für die ersten beiden Jahre.</strong><br/>
              <em className="text-gray-600">(Zwischenergebnis: A = 3.372,14 €)</em>
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
                onClick={() => updateAnswer('2', 'showSolution', !answers['2'].showSolution)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition"
              >
                {answers['2'].showSolution ? 'Erklärung verbergen' : 'Erklärung anzeigen'}
              </button>
            </div>
            {answers['2'].showSolution && (
              <div className="bg-blue-50 border border-blue-200 rounded p-4 text-sm text-gray-700 text-center">
                <strong>Erklärung (Annuitätendarlehen):</strong>
                <BlockMath math="A = K_0 \cdot \frac{q^n \cdot (q - 1)}{q^n - 1} = 14.400 \cdot \frac{1,055^{5} \cdot 0,055}{1,055^{5} - 1} \approx 3.372,14 \text{ €}" />
                <p className="mt-3"><strong>Jahr 1:</strong></p>
                <BlockMath math="Z_1 = 14.400 \cdot 0,055 = 792,00 \text{ €}" />
                <BlockMath math="T_1 = 3.372,14 - 792,00 = 2.580,14 \text{ €}" />
                <BlockMath math="K_1 = 14.400 - 2.580,14 = 11.819,86 \text{ €}" />
                <p className="mt-3"><strong>Jahr 2:</strong></p>
                <BlockMath math="Z_2 = 11.819,86 \cdot 0,055 = 650,09 \text{ €}" />
                <BlockMath math="T_2 = 3.372,14 - 650,09 = 2.722,05 \text{ €}" />
              </div>
            )}
          </div>

          {/* Aufgabe 3 */}
          <div className="border-l-4 border-purple-600 pl-6 mb-8 pb-8 border-b">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Aufgabe 3</h2>
            <p className="text-gray-700 mb-4 text-center">
              Herr Winter hat sich frühzeitig um seine private Altersvorsorge gekümmert. Vor 20 Jahren
              hat er eine Lebensversicherung abgeschlossen, in die er zu Beginn eines jeden Jahres
              2.400,00 € einzahlt. Vertraglich ist eine jährliche Mindestverzinsung von 3,25 % garantiert.
              <br/><br/>
              <strong>Berechnen Sie den Betrag, über den Herr Winter nach 20 Jahren bei Versicherungsende mindestens verfügen kann.</strong>
            </p>
            <div className="flex flex-col items-center gap-4 mb-4">
              <label className="flex items-center gap-2 justify-center">
                <span className="font-semibold">Versicherungssumme:</span>
                <input
                  type="text"
                  value={answers['3'].input}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateAnswer('3', 'input', e.target.value)}
                  placeholder="z.B. 65000,00"
                  className="border border-gray-300 rounded px-3 py-2 w-40 text-center"
                />
                <span className="text-gray-600">€</span>
              </label>
            </div>
            <div className="flex gap-3 flex-wrap mb-4 justify-center">
              <button
                onClick={() => checkAnswer('3', 68304.20)}
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
                <strong>Lösung (Vorschüssige Kapitalmehrung):</strong>
                <BlockMath math="K_n = R \cdot q \cdot \frac{q^n - 1}{q - 1}" />
                <BlockMath math="K_{20} = 2.400,00 \cdot 1,0325 \cdot \frac{1,0325^{20} - 1}{0,0325}" />
                <BlockMath math="K_{20} \approx 68.304,20 \text{ €}" />
                <p>Herr Winter kann bei Versicherungsende über mindestens 68.304,20 € verfügen.</p>
              </div>
            )}
          </div>

          {/* Aufgabe 4 */}
          <div className="border-l-4 border-purple-600 pl-6 mb-8 pb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Aufgabe 4</h2>
            <p className="text-gray-700 mb-4 text-center">
              Das Versicherungsunternehmen teilt Herrn Winter mit, dass er bei Vertragsende über einen
              garantierten Mindestbetrag von 68.000,00 € verfügen kann. Laut Vertrag wird die
              Versicherungssumme in einer jährlich vorschüssigen Rente in Höhe von 9.000,00 €
              ausgezahlt. Das verbleibende Kapital wird mit 0,8 % verzinst.
              <br/><br/>
              <strong>Berechnen Sie, wie viele volle Rentenauszahlungen Herr Winter erhalten wird.</strong>
            </p>
            <div className="flex flex-col items-center gap-4 mb-4">
              <label className="flex items-center gap-2 justify-center">
                <span className="font-semibold">Volle Auszahlungen:</span>
                <input
                  type="text"
                  value={answers['4'].input}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateAnswer('4', 'input', e.target.value)}
                  placeholder="z.B. 6"
                  className="border border-gray-300 rounded px-3 py-2 w-32 text-center"
                />
              </label>
            </div>
            <div className="flex gap-3 flex-wrap mb-4 justify-center">
              <button
                onClick={() => checkAnswer('4', 7)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition"
              >
                Prüfen
              </button>
              <button
                onClick={() => updateAnswer('4', 'showSolution', !answers['4'].showSolution)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition"
              >
                {answers['4'].showSolution ? 'Lösung verbergen' : 'Lösung anzeigen'}
              </button>
            </div>
            {answers['4'].feedback && <p className="text-sm mb-3 text-center">{answers['4'].feedback}</p>}
            {answers['4'].showSolution && (
              <div className="bg-blue-50 border border-blue-200 rounded p-4 text-sm text-gray-700 text-center">
                <strong>Lösung (Vorschüssige Kapitalminderung):</strong>
                <BlockMath math="0 = K_0 \cdot q^n - R \cdot q \cdot \frac{q^n - 1}{q - 1}" />
                <BlockMath math="0 = 68.000,00 \cdot 1,008^n - 9.000,00 \cdot 1,008 \cdot \frac{1,008^n - 1}{0,008}" />
                <p>Umformen liefert:</p>
                <BlockMath math="1,008^n = \frac{1.134.000}{1.134.000 - 68.000} = \frac{1.134.000}{1.066.000}" />
                <BlockMath math="n = \frac{\lg\left(\frac{1.134.000}{1.066.000}\right)}{\lg 1,008} \approx 7,76" />
                <p>Herr Winter erhält <strong>7 volle Rentenauszahlungen</strong> in Höhe von je 9.000,00 €.</p>
              </div>
            )}
          </div>

          <div className="mt-10 text-center text-sm text-gray-500">
            <p>Angelehnt an eine Abschlussprüfung – ca. 15 Punkte</p>
          </div>
        </div>
      </div>
    </div>
  )
}

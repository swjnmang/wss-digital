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

export default function ArdasKapitalanlagen() {
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
    return parseFloat(value.replace(',', '.'))
  }

  const checkAnswer = (part: string, correctValue: number, tolerance: number = 50) => {
    const userValue = parseInput(answers[part].input)
    if (isNaN(userValue)) {
      updateAnswer(part, 'feedback', '❌ Bitte eine gültige Zahl eingeben.')
      return
    }
    
    if (Math.abs(userValue - correctValue) <= tolerance) {
      updateAnswer(part, 'feedback', '✅ Richtig!')
    } else {
      updateAnswer(part, 'feedback', `❌ Versuche es nochmal oder schau dir die Lösung an.`)
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
          <h1 className="text-3xl font-bold text-purple-600 mb-8">Ardas Kapitalanlagen</h1>

          {/* Aufgabe 1 */}
          <div className="border-l-4 border-purple-600 pl-6 mb-8 pb-8 border-b">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Aufgabe 1</h2>
            <p className="text-gray-700 mb-4 text-center">
              Herr Abel eröffnet zu Ardas Geburt am 01.01.2001 ein Sparkonto mit 3.000,00 €. Jedes Jahr überweist er zum Jahresende denselben Betrag dazu. Der Kontoauszug vom Ende 2001 zeigt die Kontoentwicklung mit einem Zinssatz von 1,1%.
              <br/><br/>
              <strong>Wie viel Geld wird Arda nach 18 Jahren auf seinem Konto haben?</strong>
            </p>

            {/* Kontoauszug */}
            <div className="bg-gray-50 border border-gray-300 rounded p-4 mb-6 overflow-x-auto">
              <h3 className="font-bold text-center mb-3 text-sm">Kontoauszug - Geschäftsgiro S-ONLINE 10103554</h3>
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
                    <td className="px-2 py-2 border">01.01.2001</td>
                    <td className="px-2 py-2 border">Kontostand (Anfang)</td>
                    <td className="px-2 py-2 text-right border">—</td>
                    <td className="px-2 py-2 text-right border font-semibold">3.000,00</td>
                  </tr>
                  <tr className="bg-blue-50">
                    <td className="px-2 py-2 border">31.12.2001</td>
                    <td className="px-2 py-2 border">Überweisung Einzahlung Martin Abel</td>
                    <td className="px-2 py-2 text-right border">1.500,00</td>
                    <td className="px-2 py-2 text-right border font-semibold">4.500,00</td>
                  </tr>
                  <tr className="bg-white">
                    <td className="px-2 py-2 border">31.12.2001</td>
                    <td className="px-2 py-2 border">Zinsen (p = 1,1%)</td>
                    <td className="px-2 py-2 text-right border">33,00</td>
                    <td className="px-2 py-2 text-right border font-semibold">4.533,00</td>
                  </tr>
                </tbody>
              </table>
              <p className="text-xs text-gray-600 mt-2">Moneybank Niederbayern-Mitte</p>
            </div>

            <div className="flex flex-col items-center gap-4 mb-4">
              <label className="flex items-center gap-2 justify-center">
                <span className="font-semibold">Kapital am 01.01.2019:</span>
                <input
                  type="text"
                  value={answers['1'].input}
                  onChange={(e) => updateAnswer('1', 'input', e.target.value)}
                  placeholder="z.B. 33.331,84"
                  className="border border-gray-300 rounded px-3 py-2 w-40 text-center"
                />
                <span className="text-gray-600">€</span>
              </label>
            </div>
            <div className="flex gap-3 flex-wrap mb-4 justify-center">
              <button
                onClick={() => checkAnswer('1', 33331.84, 100)}
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
                <strong>Lösung:</strong>
                <BlockMath math="K_n = K_0 \cdot q^n + R \cdot \frac{q^n - 1}{q - 1}" />
                <p>Mit <InlineMath math="q = 1,011" />, <InlineMath math="K_0 = 3.000 \text{ €}" />, <InlineMath math="R = 1.500 \text{ €}" />, <InlineMath math="n = 18" /> Jahre:</p>
                <BlockMath math="K_{18} = 3.000 \cdot 1,011^{18} + 1.500 \cdot \frac{1,011^{18} - 1}{0,011}" />
                <BlockMath math="K_{18} \approx 33.331,84 \text{ €}" />
              </div>
            )}
          </div>

          {/* Aufgabe 2 */}
          <div className="border-l-4 border-purple-600 pl-6 mb-8 pb-8 border-b">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Aufgabe 2</h2>
            <p className="text-gray-700 mb-4 text-center">
              Das angesparte Kapital von 33.331,84 € soll nicht angetastet werden. Arda möchte in 3 Jahren insgesamt 35.000,00 € zur Verfügung haben. Dafür benötigt er einen besseren Zinssatz.
              <br/><br/>
              <strong>Berechnen Sie, mit welchem jährlichen Zinssatz dies möglich ist.</strong>
            </p>
            <div className="flex flex-col items-center gap-4 mb-4">
              <label className="flex items-center gap-2 justify-center">
                <span className="font-semibold">Zinssatz p:</span>
                <input
                  type="text"
                  value={answers['2'].input}
                  onChange={(e) => updateAnswer('2', 'input', e.target.value)}
                  placeholder="z.B. 1,65"
                  className="border border-gray-300 rounded px-3 py-2 w-32 text-center"
                />
                <span className="text-gray-600">%</span>
              </label>
            </div>
            <div className="flex gap-3 flex-wrap mb-4 justify-center">
              <button
                onClick={() => checkAnswer('2', 1.65, 0.1)}
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
                <strong>Lösung:</strong>
                <BlockMath math="K_n = K_0 \cdot q^n" />
                <BlockMath math="35.000 = 33.331,84 \cdot q^3" />
                <BlockMath math="q^3 = \frac{35.000}{33.331,84} = 1,05000" />
                <BlockMath math="q = \sqrt[3]{1,05000} \approx 1,0165" />
                <BlockMath math="p = (q - 1) \cdot 100 = 1,65\%" />
              </div>
            )}
          </div>

          {/* Aufgabe 3 */}
          <div className="border-l-4 border-purple-600 pl-6 mb-8 pb-8 border-b">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Aufgabe 3</h2>
            <p className="text-gray-700 mb-4 text-center">
              Nach verschiedenen Ausgaben für Auto und Freizeit verbleiben noch 20.000,00 € auf Ardas Sparkonto. Von diesem Guthaben möchte er sich am Anfang jeden Jahres 4.500,00 € auszahlen lassen.
              <br/><br/>
              <strong>Wie lange kann Arda diese jährliche Auszahlung durchführen, wenn der Zinssatz 1,64 % beträgt?</strong>
            </p>
            <div className="flex flex-col items-center gap-4 mb-4">
              <label className="flex items-center gap-2 justify-center">
                <span className="font-semibold">Anzahl Jahre:</span>
                <input
                  type="text"
                  value={answers['3'].input}
                  onChange={(e) => updateAnswer('3', 'input', e.target.value)}
                  placeholder="z.B. 4"
                  className="border border-gray-300 rounded px-3 py-2 w-32 text-center"
                />
                <span className="text-gray-600">Jahre</span>
              </label>
            </div>
            <div className="flex gap-3 flex-wrap mb-4 justify-center">
              <button
                onClick={() => checkAnswer('3', 4, 1)}
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
                <BlockMath math="K_0 = R \cdot q \cdot \frac{q^n - 1}{q - 1}" />
                <BlockMath math="20.000 = 4.500 \cdot 1,0164 \cdot \frac{1,0164^n - 1}{0,0164}" />
                <p>Nach Umformen und Lösen: <InlineMath math="n \approx 4" /> Jahre (exakt: <InlineMath math="n \approx 4,51" /> Jahre)</p>
              </div>
            )}
          </div>

          {/* Aufgabe 4 */}
          <div className="border-l-4 border-purple-600 pl-6 mb-8 pb-8 border-b">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Aufgabe 4</h2>
            <p className="text-gray-700 mb-4 text-center">
              Herr Abel plant eine Hausrenovierung und benötigt einen Kreditvertrag von seiner Bank. Die Konditionen sind dem Vertrag unten zu entnehmen.
              <br/><br/>
              <strong>Erstellen Sie einen Tilgungsplan für die ersten beiden Jahre.</strong><br/>
              <em className="text-gray-600">(Hinweis: Die jährliche Annuität beträgt 4.314,42 €)</em>
            </p>

            {/* Darlehensvertrag */}
            <div className="bg-gray-50 border-2 border-gray-400 rounded p-6 mb-6 text-sm">
              <h3 className="font-bold text-center mb-4">Darlehensvertrag</h3>
              <div className="mb-4">
                <p className="font-semibold mb-2">zwischen</p>
                <p className="mb-2">Martin Abel<br/>Hans Carossa Str. 5<br/>94447 Plattling<br/><span className="text-xs text-gray-600">– im Folgendem „Darlehensnehmer" –</span></p>
                <p className="font-semibold mb-2 mt-4">und</p>
                <p>Moneybank Niederbayern-Mitte<br/>Frühlingsstraße 12<br/>94469 Deggendorf<br/><span className="text-xs text-gray-600">– im Folgendem „Darlehensgeber" –</span></p>
              </div>
              <p className="text-center mb-4">wird folgender Vertrag geschlossen.</p>

              <div className="space-y-3">
                <div>
                  <strong>§1 Darlehensbetrag</strong><br/>
                  Der Darlehensgeber stellt dem Darlehensnehmern einen Betrag von <strong>40.000,00 €</strong> als Darlehen zur Verfügung.
                </div>
                <div>
                  <strong>§2 Verzinsung</strong><br/>
                  Das Darlehen ist über den gesamten Zeitraum mit <strong>1,40 % p.a.</strong> zu verzinsen.
                </div>
                <div>
                  <strong>§3 Laufzeit</strong><br/>
                  (1) Der Darlehensgeber gewährt dem Darlehenehmenden den in §1 vereinbarten Kreditvertrag für die Dauer von <strong>10 Jahren</strong> nach Kreditaufnahme.<br/>
                  (2) Das Darlehen ist mit jährlich gleichen Raten (Tilgung + Zinsen) jeweils zum <strong>31.12.</strong> eines jeden Jahres zu tilgen.<br/>
                  (3) Die Laufzeit beginnt mit dem <strong>01.01.2020.</strong>
                </div>
                <div>
                  <strong>§4 Sondertilgung</strong><br/>
                  Der Darlehensnehmer kann erstmalig nach fünf Jahren das Darlehen zum 01.01.2025 durch eine Sondertilgung vollständig zurückzahlen.
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
                <strong>Erklärung (Annuitätendarlehen):</strong>
                <BlockMath math="A = K_0 \cdot \frac{q^n \cdot (q - 1)}{q^n - 1}" />
                <BlockMath math="A = 40.000 \cdot \frac{1,014^{10} \cdot 0,014}{1,014^{10} - 1} \approx 4.314,42 \text{ €}" />
                <p className="mt-3"><strong>Jahr 1:</strong></p>
                <BlockMath math="Z_1 = 40.000 \cdot 0,014 = 560 \text{ €}" />
                <BlockMath math="T_1 = 4.314,42 - 560 = 3.754,42 \text{ €}" />
                <BlockMath math="K_1 = 40.000 - 3.754,42 = 36.245,58 \text{ €}" />
                <p className="mt-3"><strong>Jahr 2:</strong></p>
                <BlockMath math="Z_2 = 36.245,58 \cdot 0,014 = 507,44 \text{ €}" />
                <BlockMath math="T_2 = 4.314,42 - 507,44 = 3.806,98 \text{ €}" />
              </div>
            )}
          </div>

          {/* Aufgabe 5 */}
          <div className="border-l-4 border-purple-600 pl-6 mb-8 pb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Aufgabe 5</h2>
            <p className="text-gray-700 mb-4 text-center">
              Eine alte Geldanlage von Herr Abel wird fällig und erbringt 21.000,00 €. Mit diesem Geld möchte er das Darlehen zum frühestmöglichen Zeitpunkt ablösen und nutzt die im Vertrag vereinbarte Sondertilgungsmöglichkeit.
              <br/><br/>
              <strong>Überprüfen Sie durch Rechnung, ob die verfügbaren Mittel ausreichen.</strong>
            </p>
            <div className="flex flex-col items-center gap-4 mb-4">
              <label className="flex items-center gap-2 justify-center">
                <span className="font-semibold">Restschuld am 01.01.2025:</span>
                <input
                  type="text"
                  value={answers['5'].input}
                  onChange={(e) => updateAnswer('5', 'input', e.target.value)}
                  placeholder="z.B. 19.500,00"
                  className="border border-gray-300 rounded px-3 py-2 w-40 text-center"
                />
                <span className="text-gray-600">€</span>
              </label>
            </div>
            <div className="flex gap-3 flex-wrap mb-4 justify-center">
              <button
                onClick={() => checkAnswer('5', 19500, 100)}
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
                <BlockMath math="K_v = 40.000 \cdot 1,014^5 - 4.314,42 \cdot \frac{1,014^5 - 1}{0,014}" />
                <BlockMath math="K_v = 40.000 \cdot 1,0719 - 4.314,42 \cdot 5,1477" />
                <BlockMath math="K_v = 42.876 - 22.211,38 \approx 20.664,62 \text{ €}" />
                <p className="mt-3"><strong>Prüfung:</strong></p>
                <p>Verfügbare Mittel: 21.000,00 €</p>
                <p>Restschuld: ca. 20.665,00 €</p>
                <p className="text-green-700 font-semibold">✅ Ja, das Vorhaben gelingt! Es bleibt ca. 335,00 € übrig.</p>
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

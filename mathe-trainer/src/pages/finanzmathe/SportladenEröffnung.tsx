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

export default function SportladenEröffnung() {
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
          <h1 className="text-3xl font-bold text-purple-600 mb-8 text-center">Sportladen Eröffnung</h1>

          {/* Aufgabe 1 */}
          <div className="border-l-4 border-purple-600 pl-6 mb-8 pb-8 border-b">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Aufgabe 1</h2>
            <p className="text-gray-700 mb-4 text-center">
              Eine angehende Unternehmerin träumt davon, einen Sportladen zu eröffnen. Zu diesem Zweck hat ihr Vater am Anfang des Jahres 2010 einen Sparvertrag für sie abgeschlossen, bei dem eine Einzelzahlung von 7.500,00 € zum Jahresanfang vorgenommen wurde und seitdem zu Jahresbeginn jedes Jahr 2.500,00 € eingezahlt werden. Der Vertrag wurde mit 2,10 % verzinst.
              <br/><br/>
              <strong>Wie viel Geld kann sie am Ende des Jahres 2019 für die Ladeneröffnung zur Verfügung haben?</strong>
            </p>

            <div className="bg-gray-50 border border-gray-300 rounded p-4 mb-6 overflow-x-auto">
              <h3 className="font-bold text-center mb-3 text-sm">Sparplan - Übersicht 2010-2019</h3>
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-300">
                    <th className="px-2 py-2 text-left border">Zeitpunkt</th>
                    <th className="px-2 py-2 text-left border">Beschreibung</th>
                    <th className="px-2 py-2 text-right border">Betrag (€)</th>
                    <th className="px-2 py-2 text-right border">Kontostand (€)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-white">
                    <td className="px-2 py-2 border">01.01.2010</td>
                    <td className="px-2 py-2 border">Anfangseinzahlung</td>
                    <td className="px-2 py-2 text-right border">7.500,00</td>
                    <td className="px-2 py-2 text-right border font-semibold">7.500,00</td>
                  </tr>
                  <tr className="bg-blue-50">
                    <td className="px-2 py-2 border">01.01.2011</td>
                    <td className="px-2 py-2 border">Zinsen (p = 2,10%) + Einzahlung</td>
                    <td className="px-2 py-2 text-right border">157,50 + 2.500,00</td>
                    <td className="px-2 py-2 text-right border font-semibold">10.157,50</td>
                  </tr>
                  <tr className="bg-white">
                    <td className="px-2 py-2 border">31.12.2019</td>
                    <td className="px-2 py-2 border">Kapital nach 10 Jahren</td>
                    <td className="px-2 py-2 text-right border">—</td>
                    <td className="px-2 py-2 text-right border font-semibold">?</td>
                  </tr>
                </tbody>
              </table>
              <p className="text-xs text-gray-600 mt-2">Sparbank Unterfranken</p>
            </div>

            <div className="flex flex-col items-center gap-4 mb-4">
              <label className="flex items-center gap-2 justify-center">
                <span className="font-semibold">Kapital am 31.12.2019:</span>
                <input
                  type="text"
                  value={answers['1'].input}
                  onChange={(e) => updateAnswer('1', 'input', e.target.value)}
                  placeholder="z.B. 37.309,77"
                  className="border border-gray-300 rounded px-3 py-2 w-40 text-center"
                />
                <span className="text-gray-600">€</span>
              </label>
            </div>
            <div className="flex gap-3 flex-wrap mb-4 justify-center">
              <button
                onClick={() => checkAnswer('1', 37309.77, 100)}
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
                <strong>Lösung (Vorschüssige Rente mit Anfangskapital):</strong>
                <BlockMath math="K_n = K_0 \cdot q^n + R \cdot q \cdot \frac{q^n - 1}{q - 1}" />
                <p>Mit <InlineMath math="q = 1,021" />, <InlineMath math="K_0 = 7.500 \text{ €}" />, <InlineMath math="R = 2.500 \text{ €}" />, <InlineMath math="n = 10" /> Jahre:</p>
                <BlockMath math="K_{10} = 7.500 \cdot 1,021^{10} + 2.500 \cdot 1,021 \cdot \frac{1,021^{10} - 1}{0,021}" />
                <BlockMath math="K_{10} \approx 37.309,77 \text{ €}" />
              </div>
            )}
          </div>

          {/* Aufgabe 2 */}
          <div className="border-l-4 border-purple-600 pl-6 mb-8 pb-8 border-b">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Aufgabe 2</h2>
            <p className="text-gray-700 mb-4 text-center">
              Nachdem sie den Laden nun eröffnet hat, erhält sie von ihrer Großmutter ein Sparbuch als Erbschaft. Das Guthaben beträgt 40.000,00 €. Sie möchte dieses Guthaben auf ihr bestehendes Sparkonto (mit aktuell 37.309,77 € bei Verzinsung) übertragen. Nach genau 3 Jahren soll das Gesamtkapital 78.000,00 € betragen.
              <br/><br/>
              <strong>Berechnen Sie den erforderlichen Zinssatz für diese Vermögensanlage.</strong>
            </p>
            <div className="flex flex-col items-center gap-4 mb-4">
              <label className="flex items-center gap-2 justify-center">
                <span className="font-semibold">Zinssatz p:</span>
                <input
                  type="text"
                  value={answers['2'].input}
                  onChange={(e) => updateAnswer('2', 'input', e.target.value)}
                  placeholder="z.B. 1,50"
                  className="border border-gray-300 rounded px-3 py-2 w-32 text-center"
                />
                <span className="text-gray-600">%</span>
              </label>
            </div>
            <div className="flex gap-3 flex-wrap mb-4 justify-center">
              <button
                onClick={() => checkAnswer('2', 1.50, 0.1)}
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
                <BlockMath math="78.000 = 77.309,77 \cdot q^3" />
                <BlockMath math="q^3 = \frac{78.000}{77.309,77} \approx 1,00893" />
                <BlockMath math="q = \sqrt[3]{1,00893} \approx 1,0150" />
                <BlockMath math="p = (q - 1) \cdot 100 = 1,50\%" />
              </div>
            )}
          </div>

          {/* Aufgabe 3 */}
          <div className="border-l-4 border-purple-600 pl-6 mb-8 pb-8 border-b">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Aufgabe 3</h2>
            <p className="text-gray-700 mb-4 text-center">
              Für die Finanzierung ihrer Geschäftsausstattung benötigt die Unternehmerin einen Kreditvertrag. Sie erhält einen Kredit von 40.000,00 €. Sie plant, von diesem Guthaben jeweils zu Jahresbeginn 5.200,00 € zur Bezahlung ihrer Werbepartner zu entnehmen.
              <br/><br/>
              <strong>Berechnen Sie, wie viele volle Jahre die Unternehmerin diese jährliche Entnahme durchführen kann, bis ihr Konto leer ist. Der Zinssatz beträgt 1,80 % pro Jahr.</strong>
            </p>
            <div className="flex flex-col items-center gap-4 mb-4">
              <label className="flex items-center gap-2 justify-center">
                <span className="font-semibold">Anzahl Jahre:</span>
                <input
                  type="text"
                  value={answers['3'].input}
                  onChange={(e) => updateAnswer('3', 'input', e.target.value)}
                  placeholder="z.B. 8"
                  className="border border-gray-300 rounded px-3 py-2 w-32 text-center"
                />
                <span className="text-gray-600">Jahre</span>
              </label>
            </div>
            <div className="flex gap-3 flex-wrap mb-4 justify-center">
              <button
                onClick={() => checkAnswer('3', 8, 1)}
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
                <p>Mit <InlineMath math="q = 1,018" />, <InlineMath math="r = 5.200 \text{ €}" />, <InlineMath math="K_0 = 40.000 \text{ €}" />:</p>
                <BlockMath math="0 = 40.000 \cdot 1,018^n - 5.200 \cdot 1,018 \cdot \frac{1,018^n - 1}{0,018}" />
                <BlockMath math="0 = 720 \cdot 1,018^n - 5.293,60 \cdot (1,018^n - 1)" />
                <BlockMath math="0 = 720 \cdot 1,018^n - 5.293,60 \cdot 1,018^n + 5.293,60" />
                <BlockMath math="- 5.293,60 = (720 - 5.293,60) \cdot 1,018^n" />
                <BlockMath math="- 5.293,60 = - 4.573,60 \cdot 1,018^n" />
                <BlockMath math="1,018^n = \frac{5.293,60}{4.573,60} = 1,1574" />
                <BlockMath math="n = \log_{1,018}(1,1574) \approx 8,19" />
                <p className="text-green-700 font-semibold mt-2">✅ Die Unternehmerin kann 8 volle Jahre lang die jährliche Entnahme durchführen.</p>
              </div>
            )}
          </div>

          {/* Aufgabe 4 */}
          <div className="border-l-4 border-purple-600 pl-6 mb-8 pb-8 border-b">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Aufgabe 4</h2>
            <p className="text-gray-700 mb-4 text-center">
              Für die langfristige Finanzierung ihres Geschäfts benötigt die Unternehmerin einen Kreditvertrag. Die Konditionen sind dem Vertrag unten zu entnehmen.
              <br/><br/>
              <strong>Erstellen Sie einen Tilgungsplan für die ersten beiden Jahre.</strong><br/>
              <em className="text-gray-600">(Hinweis: Die jährliche Annuität beträgt 5.249,60 €)</em>
            </p>

            {/* Darlehensvertrag */}
            <div className="bg-gray-50 border-2 border-gray-400 rounded p-6 mb-6 text-sm">
              <h3 className="font-bold text-center mb-4">Darlehensvertrag</h3>
              <div className="mb-4">
                <p className="font-semibold mb-2">zwischen</p>
                <p className="mb-2">Sparbank Unterfranken<br/>Weißenburger Str. 35<br/>63739 Aschaffenburg<br/><span className="text-xs text-gray-600">– im Folgendem „Darlehensgeber" –</span></p>
                <p className="font-semibold mb-2 mt-4">und</p>
                <p>Name: Vorname<br/>Meisterstr. 4<br/>63801 Kleinosheim<br/><span className="text-xs text-gray-600">– im Folgendem „Darlehensnehmerin" –</span></p>
              </div>
              <p className="text-center mb-4">wird folgender Vertrag geschlossen.</p>

              <div className="space-y-3">
                <div>
                  <strong>§1 Darlehensgewährung</strong><br/>
                  Der Darlehensgeber gewährt der Darlehensnehmerin ein verzinsliches Darlehen in Höhe von <strong>57.800,00 EUR</strong>. Das Darlehen hat eine Laufzeit von <strong>17</strong> Jahren ab dem Auszahlungsdatum.
                </div>
                <div>
                  <strong>§2 Verzinsung</strong><br/>
                  Das Darlehen ist mit <strong>3,20 %</strong> p.a. zu verzinsen. Die Zinsen werden jeweils jährlich berechnet.
                </div>
                <div>
                  <strong>§3 Tilgung</strong><br/>
                  Das Darlehen ist in jährlich gleichbleibenden Tilgungsraten in Höhe von <strong>3.400,00</strong> EUR zu tilgen. Tilgung und Zinsen werden automatisch am Jahresende von ihrem Konto eingezogen. Bitte achten Sie auf ausreichende Deckung.
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
                <BlockMath math="Z_1 = 57.800 \cdot 0,032 = 1.849,60 \text{ €}" />
                <BlockMath math="T_1 = 3.400,00 \text{ €}" />
                <BlockMath math="A_1 = Z_1 + T_1 = 5.249,60 \text{ €}" />
                <BlockMath math="K_1 = 57.800 - 3.400 = 54.400,00 \text{ €}" />
                <p className="mt-3"><strong>Jahr 2:</strong></p>
                <BlockMath math="Z_2 = 54.400 \cdot 0,032 = 1.740,80 \text{ €}" />
                <BlockMath math="T_2 = 3.400,00 \text{ €}" />
                <BlockMath math="A_2 = 1.740,80 + 3.400 = 5.140,80 \text{ €}" />
              </div>
            )}
          </div>

          {/* Aufgabe 5 */}
          <div className="border-l-4 border-purple-600 pl-6 mb-8 pb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Aufgabe 5</h2>
            <p className="text-gray-700 mb-4 text-center">
              Die Unternehmerin verfolgt die Entwicklung ihrer Kreditrückzahlung genau. Sie möchte wissen, ab welchem Jahr die jährlich anfallenden Zinsen für ihr Darlehen erstmals weniger als 1.000,00 € betragen.
              <br/><br/>
              <strong>Nach wie vielen Jahren betragen die Zinsen des Ratendarlehens erstmalig weniger als 1.000,00 €?</strong>
            </p>
            <div className="flex flex-col items-center gap-4 mb-4">
              <label className="flex items-center gap-2 justify-center">
                <span className="font-semibold">Nach wie vielen Jahren:</span>
                <input
                  type="text"
                  value={answers['5'].input}
                  onChange={(e) => updateAnswer('5', 'input', e.target.value)}
                  placeholder="z.B. 9"
                  className="border border-gray-300 rounded px-3 py-2 w-32 text-center"
                />
                <span className="text-gray-600">Jahren</span>
              </label>
            </div>
            <div className="flex gap-3 flex-wrap mb-4 justify-center">
              <button
                onClick={() => checkAnswer('5', 9, 1)}
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
                <strong>Lösung (Restschuldzinsen Ratendarlehen):</strong>
                <BlockMath math="Z_v = T \cdot (q - 1) \cdot (n - v + 1)" />
                <p>Mit <InlineMath math="T = 3.400 \text{ €}" />, <InlineMath math="q = 1,032" />, <InlineMath math="n = 17" /> Jahre:</p>
                <BlockMath math="1.000,00 = 3.400,00 \cdot 0,032 \cdot (17 - v + 1)" />
                <BlockMath math="\frac{1.000,00}{108,80} = 18 - v" />
                <BlockMath math="v = 8,81" />
                <p className="text-green-700 font-semibold mt-2">✅ Nach 9 Jahren betragen die Zinsen erstmalig weniger als 1.000,00 €.</p>
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

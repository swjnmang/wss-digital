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

export default function DasElektroauto() {
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
          <h1 className="text-3xl font-bold text-purple-600 mb-8">Das Elektroauto</h1>

          {/* Aufgabe 1 */}
          <div className="border-l-4 border-purple-600 pl-6 mb-8 pb-8 border-b">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Aufgabe 1</h2>
            <p className="text-gray-700 mb-4 text-center">
              Tante Marie legte zur Geburt ihrer Nichte Emma ein Sparkonto an und zahlte darauf
              2.000,00 € ein. Danach überwies sie jeweils am Jahresende einen festen Betrag auf dieses
              Konto. Die Bank gewährte ihr für die komplette Laufzeit einen jährlichen Zinssatz von
              1,40 %. Nach 16 Jahren betrug der Kontostand 15.000,00 €.
              <br/><br/>
              <strong>Berechnen Sie die Höhe des jährlichen Betrages.</strong>
            </p>
            <div className="flex flex-col items-center gap-4 mb-4">
              <label className="flex items-center gap-2 justify-center">
                <span className="font-semibold">Jährlicher Betrag r:</span>
                <input
                  type="text"
                  value={answers['1'].input}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateAnswer('1', 'input', e.target.value)}
                  placeholder="z.B. 650,00"
                  className="border border-gray-300 rounded px-3 py-2 w-36 text-center"
                />
                <span className="text-gray-600">€</span>
              </label>
            </div>
            <div className="flex gap-3 flex-wrap mb-4 justify-center">
              <button
                onClick={() => checkAnswer('1', 702.55)}
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
                <strong>Lösung (Nachschüssige Kapitalmehrung):</strong>
                <BlockMath math="K_n = K_0 \cdot q^n + r \cdot \frac{q^n - 1}{q - 1}" />
                <BlockMath math="15.000,00 = 2.000,00 \cdot 1,014^{16} + r \cdot \frac{1,014^{16} - 1}{0,014}" />
                <BlockMath math="r = \frac{(15.000,00 - 2.000,00 \cdot 1,014^{16}) \cdot 0,014}{1,014^{16} - 1}" />
                <BlockMath math="r \approx 702,55 \text{ €}" />
              </div>
            )}
          </div>

          {/* Aufgabe 2 */}
          <div className="border-l-4 border-purple-600 pl-6 mb-8 pb-8 border-b">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Aufgabe 2</h2>
            <p className="text-gray-700 mb-4 text-center">
              Das Guthaben von 15.000,00 € wurde am Ende der Laufzeit auf Emmas eigenes Konto
              (p = 1,1 % p. a.) überwiesen. Emma träumt von einem Elektroauto, das 18.000,00 € kostet.
              Es werden keine weiteren jährlichen Einzahlungen getätigt.
              <br/><br/>
              <strong>Berechnen Sie, um wie viel Euro Emma den Geldbetrag auf ihrem Konto einmalig
              erhöhen müsste, um sich nach weiteren vier Jahren das Elektroauto leisten zu können.</strong><br/>
              <em className="text-gray-600">(Zwischenergebnis: benötigtes Anfangskapital K₀ = 17.229,31 €)</em>
            </p>
            <div className="flex flex-col items-center gap-4 mb-4">
              <label className="flex items-center gap-2 justify-center">
                <span className="font-semibold">Einmalige Erhöhung:</span>
                <input
                  type="text"
                  value={answers['2'].input}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateAnswer('2', 'input', e.target.value)}
                  placeholder="z.B. 2000,00"
                  className="border border-gray-300 rounded px-3 py-2 w-36 text-center"
                />
                <span className="text-gray-600">€</span>
              </label>
            </div>
            <div className="flex gap-3 flex-wrap mb-4 justify-center">
              <button
                onClick={() => checkAnswer('2', 2229.31)}
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
                <strong>Lösung (Abzinsung mit Zinseszins):</strong>
                <BlockMath math="K_n = K_0 \cdot q^n \implies 18.000,00 = K_0 \cdot 1,011^4" />
                <BlockMath math="K_0 = \frac{18.000,00}{1,011^4} \approx 17.229,31 \text{ €}" />
                <p>Erforderliche einmalige Erhöhung:</p>
                <BlockMath math="17.229,31 - 15.000,00 = 2.229,31 \text{ €}" />
              </div>
            )}
          </div>

          {/* Aufgabe 3 */}
          <div className="border-l-4 border-purple-600 pl-6 mb-8 pb-8 border-b">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Aufgabe 3</h2>
            <p className="text-gray-700 mb-4 text-center">
              Die mittlerweile 22-jährige Emma entscheidet sich für ein größeres Modell. Für die noch
              fehlenden 12.000,00 € muss sie ein Darlehen aufnehmen. Die Bank legt ihr folgenden
              Darlehensvertrag zur Unterschrift vor.
              <br/><br/>
              <strong>Erstellen Sie einen Tilgungsplan für die ersten beiden Jahre.</strong><br/>
              <em className="text-gray-600">(Zwischenergebnis: A = 3.321,48 €)</em>
            </p>

            {/* Darlehensvertrag */}
            <div className="bg-gray-50 border-2 border-gray-400 rounded p-6 mb-6 text-sm">
              <h3 className="font-bold text-center mb-4">Darlehensvertrag</h3>
              <div className="mb-4">
                <p className="font-semibold mb-2">zwischen</p>
                <p className="mb-2">Volksbank Dachs eG<br/>Bahnhofstr. 8<br/>80331 München<br/><span className="text-xs text-gray-600">– nachfolgend Darlehensgeber genannt –</span></p>
                <p className="font-semibold mb-2 mt-4">und</p>
                <p>Emma Reiter<br/>Gartenweg 3<br/>80992 München<br/><span className="text-xs text-gray-600">– nachfolgend Darlehensnehmerin genannt –</span></p>
              </div>
              <div className="space-y-3">
                <div>
                  <strong>§1 Darlehensbetrag und Auszahlung</strong><br/>
                  Der Darlehensgeber gewährt der Darlehensnehmerin ein Darlehen in Höhe von <strong>12.000,00 €</strong> (in Worten: zwölftausend Euro).
                </div>
                <div>
                  <strong>§2 Zinsen</strong><br/>
                  Das Darlehen wird mit <strong>4,20 % jährlich</strong> verzinst.
                </div>
                <div>
                  <strong>§3 Tilgung</strong><br/>
                  Die jährlich gleichbleibende Annuität errechnet sich aus dem festgelegten Zinssatz und der vereinbarten Laufzeit von <strong>4 Jahren</strong>. Die Raten werden jeweils zum 30.12. eines Jahres fällig.
                </div>
              </div>
            </div>

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
                onClick={() => updateAnswer('3', 'showSolution', !answers['3'].showSolution)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition"
              >
                {answers['3'].showSolution ? 'Erklärung verbergen' : 'Erklärung anzeigen'}
              </button>
            </div>
            {answers['3'].showSolution && (
              <div className="bg-blue-50 border border-blue-200 rounded p-4 text-sm text-gray-700 text-center">
                <strong>Erklärung (Annuitätendarlehen):</strong>
                <BlockMath math="A = K_0 \cdot \frac{q^n \cdot (q - 1)}{q^n - 1} = 12.000 \cdot \frac{1,042^{4} \cdot 0,042}{1,042^{4} - 1} \approx 3.321,48 \text{ €}" />
                <p className="mt-3"><strong>Jahr 1:</strong></p>
                <BlockMath math="Z_1 = 12.000 \cdot 0,042 = 504,00 \text{ €}" />
                <BlockMath math="T_1 = 3.321,48 - 504,00 = 2.817,48 \text{ €}" />
                <BlockMath math="K_1 = 12.000 - 2.817,48 = 9.182,52 \text{ €}" />
                <p className="mt-3"><strong>Jahr 2:</strong></p>
                <BlockMath math="Z_2 = 9.182,52 \cdot 0,042 = 385,67 \text{ €}" />
                <BlockMath math="T_2 = 3.321,48 - 385,67 = 2.935,81 \text{ €}" />
              </div>
            )}
          </div>

          {/* Aufgabe 4 */}
          <div className="border-l-4 border-purple-600 pl-6 mb-8 pb-8 border-b">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Aufgabe 4</h2>
            <p className="text-gray-700 mb-4 text-center">
              <strong>Berechnen Sie die Höhe der Zinsen für die gesamte Laufzeit des Darlehens.</strong>
            </p>
            <div className="flex flex-col items-center gap-4 mb-4">
              <label className="flex items-center gap-2 justify-center">
                <span className="font-semibold">Zinsen gesamt:</span>
                <input
                  type="text"
                  value={answers['4'].input}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateAnswer('4', 'input', e.target.value)}
                  placeholder="z.B. 1200,00"
                  className="border border-gray-300 rounded px-3 py-2 w-36 text-center"
                />
                <span className="text-gray-600">€</span>
              </label>
            </div>
            <div className="flex gap-3 flex-wrap mb-4 justify-center">
              <button
                onClick={() => checkAnswer('4', 1285.91)}
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
                <strong>Lösung:</strong>
                <BlockMath math="Z_{\text{gesamt}} = n \cdot A - K_0 = 4 \cdot 3.321,48 - 12.000,00 = 1.285,91 \text{ €}" />
                <p className="text-xs text-gray-500 mt-1">(kleine Abweichung durch Rundung der Annuität möglich)</p>
              </div>
            )}
          </div>

          {/* Aufgabe 5 */}
          <div className="border-l-4 border-purple-600 pl-6 mb-8 pb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Aufgabe 5</h2>
            <p className="text-gray-700 mb-4 text-center">
              Alternativ könnte Emma das Elektroauto auch leasen. Die jährliche Rate in Höhe von
              3.000,00 € müsste am Anfang des Jahres bezahlt werden. Ihr Kapital von 18.000,00 € liegt
              auf dem Sparkonto mit einem jährlichen Zinssatz von 0,9 %.
              <br/><br/>
              <strong>Berechnen Sie, wie viele ganze Jahre Emma das Auto leasen könnte, bis ihr Kapital
              aufgebraucht ist.</strong>
            </p>
            <div className="flex flex-col items-center gap-4 mb-4">
              <label className="flex items-center gap-2 justify-center">
                <span className="font-semibold">Ganze Jahre:</span>
                <input
                  type="text"
                  value={answers['5'].input}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateAnswer('5', 'input', e.target.value)}
                  placeholder="z.B. 5"
                  className="border border-gray-300 rounded px-3 py-2 w-32 text-center"
                />
              </label>
            </div>
            <div className="flex gap-3 flex-wrap mb-4 justify-center">
              <button
                onClick={() => checkAnswer('5', 6)}
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
                <strong>Lösung (Vorschüssige Kapitalminderung):</strong>
                <BlockMath math="0 = 18.000,00 \cdot 1,009^n - 3.000,00 \cdot 1,009 \cdot \frac{1,009^n - 1}{0,009}" />
                <p>Mit <InlineMath math="3.000 \cdot 1,009 : 0,009 = 336.333,33" /> folgt:</p>
                <BlockMath math="1,009^n = \frac{336.333,33}{336.333,33 - 18.000,00} = \frac{336.333,33}{318.333,33}" />
                <BlockMath math="n = \frac{\lg\left(\frac{336.333,33}{318.333,33}\right)}{\lg 1,009} \approx 6,14" />
                <p>Emma kann das Auto <strong>6 ganze Jahre</strong> leasen.</p>
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

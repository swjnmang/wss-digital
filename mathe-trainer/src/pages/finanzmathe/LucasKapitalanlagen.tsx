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
    '1.4': { input: '', feedback: '', showSolution: false },
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
          <h1 className="text-3xl font-bold text-purple-600 mb-2">Finanzmathematik - Aufgabenteil B</h1>
          <p className="text-gray-500 mb-8 text-sm">Abschlussprüfung WS 2019 - Gesamtpunkte: 15</p>

          {/* Aufgabe 1.1 */}
          <div className="border-l-4 border-purple-600 pl-6 mb-8 pb-8 border-b">
            <h2 className="text-xl font-bold text-gray-800 mb-4">1.1 Kapitalentwicklung bis 18. Geburtstag (2 Punkte)</h2>
            <p className="text-gray-700 mb-4">
              Zur Geburt seines Sohnes Luca am 01.01.2001 hat Herr Abel 3.000,00 € auf ein Konto seiner Hausbank angelegt. Des Weiteren überweist er zukünftig jeweils am Jahresende die bestimmte Summe auf dieses Konto. Am Ende des Jahres 2001 erhielt Herr Abel einen Kontoauszug von seiner Hausbank.
              <br/><br/>
              <strong>Berechnen Sie über wie viel Geld Luca zu seinem 18. Geburtstag verfügen kann.</strong>
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

            <div className="flex items-center gap-4 mb-4">
              <label className="flex items-center gap-2">
                <span className="font-semibold">Kapital am 01.01.2019 (18. Geburtstag):</span>
                <input
                  type="text"
                  value={answers['1.1'].input}
                  onChange={(e) => updateAnswer('1.1', 'input', e.target.value)}
                  placeholder="z.B. 33.331,84"
                  className="border border-gray-300 rounded px-3 py-2 w-40"
                />
                <span className="text-gray-600">€</span>
              </label>
            </div>
            <div className="flex gap-3 flex-wrap mb-4">
              <button
                onClick={() => checkAnswer('1.1', 33331.84, 100)}
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
                <strong>Lösung (Nachschüssige Rente + Anfangskapital):</strong><br/>
                K_n = K₀ · q^n + R · (q^n - 1) / (q - 1)<br/>
                Mit q = 1,011, K₀ = 3.000€, R = 1.500€, n = 18 Jahre<br/>
                K₁₈ = 3.000 · 1,011^18 + 1.500 · (1,011^18 - 1) / 0,011<br/>
                K₁₈ ≈ 33.331,84 €
              </div>
            )}
          </div>

          {/* Aufgabe 1.2 */}
          <div className="border-l-4 border-purple-600 pl-6 mb-8 pb-8 border-b">
            <h2 className="text-xl font-bold text-gray-800 mb-4">1.2 Zinsatzberechnung (3 Punkte)</h2>
            <p className="text-gray-700 mb-4">
              Luca möchte das angesparte Kapital in Höhe von 33.331,84 € zunächst auf dem Konto belassen. Damit er in drei Jahren ohne weitere Einzahlungen über die Summe von 35.000,00 € verfügen kann, verhandelt er mit der Bank einen höheren Zinssatz.
              <br/><br/>
              <strong>Berechnen Sie, welchen gleichbleibenden Zinssatz die Bank Luca anbieten müsste.</strong>
            </p>
            <div className="flex items-center gap-4 mb-4">
              <label className="flex items-center gap-2">
                <span className="font-semibold">Zinssatz p:</span>
                <input
                  type="text"
                  value={answers['1.2'].input}
                  onChange={(e) => updateAnswer('1.2', 'input', e.target.value)}
                  placeholder="z.B. 1,65"
                  className="border border-gray-300 rounded px-3 py-2 w-32"
                />
                <span className="text-gray-600">%</span>
              </label>
            </div>
            <div className="flex gap-3 flex-wrap mb-4">
              <button
                onClick={() => checkAnswer('1.2', 1.65, 0.1)}
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
                <strong>Lösung (Zinseszinsformel):</strong><br/>
                K_n = K₀ · q^n<br/>
                35.000,00 = 33.331,84 · q³<br/>
                q³ = 35.000,00 / 33.331,84 = 1,05000<br/>
                q = ³√1,05000 ≈ 1,0165<br/>
                p = (q - 1) · 100 = 1,65 %
              </div>
            )}
          </div>

          {/* Aufgabe 1.3 */}
          <div className="border-l-4 border-purple-600 pl-6 mb-8 pb-8 border-b">
            <h2 className="text-xl font-bold text-gray-800 mb-4">1.3 Laufzeitberechnung - Vorschüssige Kapitalminderung (4 Punkte)</h2>
            <p className="text-gray-700 mb-4">
              Nachdem Luca für Auto und Urlaub einiges von dem Geld benötigt hat, befinden sich noch 20.000,00 € auf dem Konto. Davon möchte er sich zukünftig jeweils am Jahresanfang 4.500,00 € für die Finanzierung seines Studiums auszahlen lassen.
              <br/><br/>
              <strong>Berechnen Sie, wie viele Jahre sich Luca den vollen Betrag bei einem Zinssatz von 1,64 % auszahlen lassen kann.</strong>
            </p>
            <div className="flex items-center gap-4 mb-4">
              <label className="flex items-center gap-2">
                <span className="font-semibold">Laufzeit:</span>
                <input
                  type="text"
                  value={answers['1.3'].input}
                  onChange={(e) => updateAnswer('1.3', 'input', e.target.value)}
                  placeholder="z.B. 4"
                  className="border border-gray-300 rounded px-3 py-2 w-32"
                />
                <span className="text-gray-600">Jahre</span>
              </label>
            </div>
            <div className="flex gap-3 flex-wrap mb-4">
              <button
                onClick={() => checkAnswer('1.3', 4, 1)}
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
                20.000,00 = 4.500,00 · 1,0164 · (1,0164^n - 1) / 0,0164<br/>
                Nach Auflösen: n ≈ 4 Jahre (exakt: n ≈ 4,51 Jahre)
              </div>
            )}
          </div>

          {/* Aufgabe 1.4 */}
          <div className="border-l-4 border-purple-600 pl-6 mb-8 pb-8 border-b">
            <h2 className="text-xl font-bold text-gray-800 mb-4">1.4 Tilgungsplan (3 Punkte)</h2>
            <p className="text-gray-700 mb-4">
              Herr Abel benötigt für die Modernisierung seines Hauses einen Kredit. Von seiner Hausbank erhält er einen Darlehensvertrag (siehe unten).
              <br/><br/>
              <strong>Erstellen Sie einen Tilgungsplan für die ersten zwei Jahre.</strong><br/>
              <em className="text-gray-600">(Zwischenergebnis: A = 4.314,42 €)</em>
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
                  Der Darlehenehmerkann erstmalig nach fünf Jahren das Darlehen zum 01.01.2025 durch eine Sondertilgung vollständig zurückzahlen.
                </div>
              </div>
            </div>

            <p className="text-gray-700 mb-4">Erstelle einen Tilgungsplan für die ersten zwei Jahre:</p>

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
                    <td className="px-2 py-2 text-right border">40.000,00</td>
                    <td className="px-2 py-2 text-right border">560,00</td>
                    <td className="px-2 py-2 text-right border">3.754,42</td>
                    <td className="px-2 py-2 text-right border font-semibold">4.314,42</td>
                  </tr>
                  <tr className="bg-blue-50">
                    <td className="px-2 py-2 border font-semibold">2</td>
                    <td className="px-2 py-2 text-right border">36.245,58</td>
                    <td className="px-2 py-2 text-right border">507,44</td>
                    <td className="px-2 py-2 text-right border">3.806,98</td>
                    <td className="px-2 py-2 text-right border font-semibold">4.314,42</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex gap-3 flex-wrap mb-4">
              <button
                onClick={() => updateAnswer('1.4', 'showSolution', !answers['1.4'].showSolution)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition"
              >
                {answers['1.4'].showSolution ? 'Erklärung verbergen' : 'Erklärung anzeigen'}
              </button>
            </div>
            {answers['1.4'].showSolution && (
              <div className="bg-blue-50 border border-blue-200 rounded p-4 text-sm text-gray-700">
                <strong>Erklärung (Annuitätendarlehen):</strong><br/>
                A = K₀ · (q^n · (q - 1)) / (q^n - 1)<br/>
                A = 40.000,00 · (1,014^10 · 0,014) / (1,014^10 - 1)<br/>
                A ≈ 4.314,42 €<br/><br/>
                <strong>Jahr 1:</strong><br/>
                Zinsen = 40.000,00 · 0,014 = 560,00 €<br/>
                Tilgung = 4.314,42 - 560,00 = 3.754,42 €<br/>
                Restschuld = 40.000,00 - 3.754,42 = 36.245,58 €<br/><br/>
                <strong>Jahr 2:</strong><br/>
                Zinsen = 36.245,58 · 0,014 = 507,44 €<br/>
                Tilgung = 4.314,42 - 507,44 = 3.806,98 €
              </div>
            )}
          </div>

          {/* Aufgabe 1.5 */}
          <div className="border-l-4 border-purple-600 pl-6 mb-8 pb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">1.5 Sondertilgung (3 Punkte)</h2>
            <p className="text-gray-700 mb-4">
              Herr Abel möchte mit Hilfe eines fälligen Sparbriefes in Höhe von 21.000,00 € das Darlehen zum erstmöglichen Zeitpunkt vollständig zurückzahlen. Darum plant er von seinem vereinbarten Sondertilgungsrecht Gebrauch zu machen.
              <br/><br/>
              <strong>Überprüfen Sie rechnerisch, ob dieses Vorhaben gelingt.</strong>
            </p>
            <div className="flex items-center gap-4 mb-4">
              <label className="flex items-center gap-2">
                <span className="font-semibold">Restschuld am 01.01.2025:</span>
                <input
                  type="text"
                  value={answers['1.5'].input}
                  onChange={(e) => updateAnswer('1.5', 'input', e.target.value)}
                  placeholder="z.B. 19.500,00"
                  className="border border-gray-300 rounded px-3 py-2 w-40"
                />
                <span className="text-gray-600">€</span>
              </label>
            </div>
            <div className="flex gap-3 flex-wrap mb-4">
              <button
                onClick={() => checkAnswer('1.5', 19500, 100)}
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
                <strong>Lösung (Restschuld nach 5 Jahren):</strong><br/>
                K_v = K₀ · q^v - A · (q^v - 1) / (q - 1)<br/>
                K_v = 40.000,00 · 1,014⁵ - 4.314,42 · (1,014⁵ - 1) / 0,014<br/>
                K_v = 40.000,00 · 1,0719 - 4.314,42 · 5,1477<br/>
                K_v = 42.876,00 - 22.211,38<br/>
                K_v ≈ 20.664,62 €<br/><br/>
                <strong>Ergebnis:</strong><br/>
                Sparbriefguthaben: 21.000,00 €<br/>
                Restschuld am 01.01.2025: ca. 20.665,00 €<br/>
                ✅ Ja, das Vorhaben gelingt! Es bleibt ca. 335,00 € übrig.
              </div>
            )}
          </div>

          <div className="mt-10 text-center text-sm text-gray-500">
            <p>Gesamtaufgabe: 15 Punkte | Prüfung WS 2019</p>
          </div>
        </div>
      </div>
    </div>
  )
}

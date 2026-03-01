import { useState, useRef } from 'react'

export default function FragebogenFormular() {
  const fragebogenRef = useRef<HTMLDivElement>(null)
  const [formData, setFormData] = useState({
    gameName: '',
    groupMembers: '',
    spielidee: '',
    zielgruppe: '',
    komplexitaet: '',
    komplexitaet_begruendung: '',
    punkte_beispiel: '',
    belohnungen_beispiel: '',
    missionen_beispiel: '',
    erfolge_beispiel: '',
    ranglisten_beispiel: '',
    feedback_beispiel: '',
    set_collection_erklaerung: '',
    tile_placement_erklaerung: '',
    worker_placement_erklaerung: '',
    deckbuilding_erklaerung: '',
    andere_erklaerung: '',
    emotionen_spannung: '',
    emotionen_glueck: '',
    emotionen_frustration: '',
    emotionen_empathie: '',
    ranking_strategie: '',
    ranking_problemloesung: '',
    ranking_kreativitaet: '',
    ranking_resilienz: '',
    interaktion: '',
    teamarbeit: '',
    wertebildung: '',
  })

  const [checkboxes, setCheckboxes] = useState({
    punkte: false,
    belohnungen: false,
    missionen: false,
    erfolge: false,
    ranglisten: false,
    feedback: false,
    set_collection: false,
    tile_placement: false,
    worker_placement: false,
    deckbuilding: false,
    andere: false,
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (name: keyof typeof checkboxes) => {
    setCheckboxes(prev => ({ ...prev, [name]: !prev[name] }))
  }

  const handlePrint = () => {
    if (!fragebogenRef.current) return

    // Clone the fragebogen element
    const printWindow = window.open('', '', 'height=600,width=800')
    if (!printWindow) return

    const fragebogenHTML = fragebogenRef.current.innerHTML
    const printStyles = `
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          background-color: white;
          padding: 20px;
          color: #1f2937;
        }
        .no-print {
          display: none !important;
        }
        h3 {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 1.5rem;
          color: #111827;
        }
        h4 {
          font-size: 1rem;
          font-weight: 600;
          margin: 2rem 0 1rem 0;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid #e5e7eb;
          color: #1f2937;
        }
        .bg-white {
          background-color: white;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          padding: 1.5rem;
          margin-bottom: 2rem;
          page-break-inside: avoid;
        }
        label {
          display: block;
          font-weight: 600;
          color: #374151;
          margin-bottom: 0.5rem;
          font-size: 0.95rem;
        }
        textarea, input[type="text"], input[type="number"] {
          width: 100%;
          border: 1px solid #d1d5db;
          border-radius: 0.25rem;
          padding: 0.5rem;
          margin-bottom: 1rem;
          font-family: inherit;
          font-size: 0.95rem;
          background-color: #f9fafb;
        }
        input[type="radio"], input[type="checkbox"] {
          margin-right: 0.5rem;
        }
        .space-y-3 > div {
          margin-bottom: 0.75rem;
        }
        .space-y-6 > div {
          margin-bottom: 1.5rem;
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
        }
        .flex {
          display: flex;
          align-items: center;
        }
        .gap-4 {
          gap: 1rem;
        }
        .ml-6 {
          margin-left: 1.5rem;
        }
        .ml-2 {
          margin-left: 0.5rem;
        }
        .mb-2 {
          margin-bottom: 0.5rem;
        }
        .mb-3 {
          margin-bottom: 0.75rem;
        }
        .mb-4 {
          margin-bottom: 1rem;
        }
        .mt-4 {
          margin-top: 1rem;
        }
        .text-sm {
          font-size: 0.875rem;
        }
        p {
          color: #4b5563;
          line-height: 1.5;
        }
      </style>
    `

    printWindow.document.write('<!DOCTYPE html>')
    printWindow.document.write('<html>')
    printWindow.document.write('<head>')
    printWindow.document.write('<meta charset="utf-8">')
    printWindow.document.write(printStyles)
    printWindow.document.write('</head>')
    printWindow.document.write('<body>')
    printWindow.document.write(fragebogenHTML)
    printWindow.document.write('</body>')
    printWindow.document.write('</html>')
    printWindow.document.close()

    setTimeout(() => {
      printWindow.print()
    }, 250)
  }

  const handlePrintEmpty = () => {
    if (!fragebogenRef.current) return

    // Reset form data
    const emptyFormData = {
      gameName: '',
      groupMembers: '',
      spielidee: '',
      zielgruppe: '',
      komplexitaet: '',
      komplexitaet_begruendung: '',
      punkte_beispiel: '',
      belohnungen_beispiel: '',
      missionen_beispiel: '',
      erfolge_beispiel: '',
      ranglisten_beispiel: '',
      feedback_beispiel: '',
      set_collection_erklaerung: '',
      tile_placement_erklaerung: '',
      worker_placement_erklaerung: '',
      deckbuilding_erklaerung: '',
      andere_erklaerung: '',
      emotionen_spannung: '',
      emotionen_glueck: '',
      emotionen_frustration: '',
      emotionen_empathie: '',
      ranking_strategie: '',
      ranking_problemloesung: '',
      ranking_kreativitaet: '',
      ranking_resilienz: '',
      interaktion: '',
      teamarbeit: '',
      wertebildung: '',
    }

    const emptyCheckboxes = {
      punkte: false,
      belohnungen: false,
      missionen: false,
      erfolge: false,
      ranglisten: false,
      feedback: false,
      set_collection: false,
      tile_placement: false,
      worker_placement: false,
      deckbuilding: false,
      andere: false,
    }

    setFormData(emptyFormData)
    setCheckboxes(emptyCheckboxes)

    // Wait for state update, then print
    setTimeout(() => {
      if (!fragebogenRef.current) return

      const printWindow = window.open('', '', 'height=600,width=800')
      if (!printWindow) return

      const fragebogenHTML = fragebogenRef.current.innerHTML
      const printStyles = `
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background-color: white;
            padding: 20px;
            color: #1f2937;
          }
          .no-print {
            display: none !important;
          }
          h3 {
            font-size: 1.5rem;
            font-weight: 600;
            margin-bottom: 1.5rem;
            color: #111827;
          }
          h4 {
            font-size: 1rem;
            font-weight: 600;
            margin: 2rem 0 1rem 0;
            padding-bottom: 0.5rem;
            border-bottom: 1px solid #e5e7eb;
            color: #1f2937;
          }
          .bg-white {
            background-color: white;
            border: 1px solid #e5e7eb;
            border-radius: 0.5rem;
            padding: 1.5rem;
            margin-bottom: 2rem;
            page-break-inside: avoid;
          }
          label {
            display: block;
            font-weight: 600;
            color: #374151;
            margin-bottom: 0.5rem;
            font-size: 0.95rem;
          }
          textarea, input[type="text"], input[type="number"] {
            width: 100%;
            border: 1px solid #d1d5db;
            border-radius: 0.25rem;
            padding: 0.5rem;
            margin-bottom: 1rem;
            font-family: inherit;
            font-size: 0.95rem;
            background-color: #f9fafb;
          }
          input[type="radio"], input[type="checkbox"] {
            margin-right: 0.5rem;
          }
          .space-y-3 > div {
            margin-bottom: 0.75rem;
          }
          .space-y-6 > div {
            margin-bottom: 1.5rem;
          }
          .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1.5rem;
          }
          .flex {
            display: flex;
            align-items: center;
          }
          .gap-4 {
            gap: 1rem;
          }
          .ml-6 {
            margin-left: 1.5rem;
          }
          .ml-2 {
            margin-left: 0.5rem;
          }
          .mb-2 {
            margin-bottom: 0.5rem;
          }
          .mb-3 {
            margin-bottom: 0.75rem;
          }
          .mb-4 {
            margin-bottom: 1rem;
          }
          .mt-4 {
            margin-top: 1rem;
          }
          .text-sm {
            font-size: 0.875rem;
          }
          p {
            color: #4b5563;
            line-height: 1.5;
          }
        </style>
      `

      printWindow.document.write('<!DOCTYPE html>')
      printWindow.document.write('<html>')
      printWindow.document.write('<head>')
      printWindow.document.write('<meta charset="utf-8">')
      printWindow.document.write(printStyles)
      printWindow.document.write('</head>')
      printWindow.document.write('<body>')
      printWindow.document.write(fragebogenHTML)
      printWindow.document.write('</body>')
      printWindow.document.write('</html>')
      printWindow.document.close()

      setTimeout(() => {
        printWindow.print()
      }, 250)
    }, 100)
  }

  const Tooltip = ({ text, children }: { text: string; children: React.ReactNode }) => {
    const [showTooltip, setShowTooltip] = useState(false)

    return (
      <div className="relative inline-flex items-center cursor-help" onMouseEnter={() => setShowTooltip(true)} onMouseLeave={() => setShowTooltip(false)}>
        {children}
        <span className="ml-2 w-5 h-5 bg-slate-500 text-white rounded-full flex items-center justify-center text-xs font-bold hover:bg-teal-600">
          ?
        </span>
        {showTooltip && (
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 bg-slate-800 text-white text-sm rounded-lg p-3 z-10 shadow-lg">
            {text}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div ref={fragebogenRef} className="bg-slate-50 rounded-xl p-8 border border-slate-200">
      <h3 className="text-2xl font-semibold text-slate-900 mb-6">Fragebogen zur Spielanalyse</h3>
      
      <form className="space-y-8">
        {/* Allgemeine Informationen */}
        <div className="bg-white rounded-lg p-6 border border-slate-200">
          <h4 className="text-xl font-semibold mb-4 pb-2 border-b text-slate-800">Allgemeine Informationen</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-semibold text-slate-700 mb-2">Name des Spiels:</label>
              <input
                type="text"
                name="gameName"
                value={formData.gameName}
                onChange={handleInputChange}
                placeholder="z.B. Siedler von Catan"
                className="w-full border border-slate-300 rounded py-2 px-3 focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-2">Namen der Gruppenmitglieder:</label>
              <input
                type="text"
                name="groupMembers"
                value={formData.groupMembers}
                onChange={handleInputChange}
                placeholder="Max, Erika, ..."
                className="w-full border border-slate-300 rounded py-2 px-3 focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
              />
            </div>
          </div>
        </div>

        {/* Teil A */}
        <div className="bg-white rounded-lg p-6 border border-slate-200">
          <h4 className="text-xl font-semibold mb-4 pb-2 border-b text-slate-800">Teil A: Grundlegende Merkmale</h4>
          <div className="space-y-6">
            <div>
              <label className="block font-semibold text-slate-700 mb-2">1. Spielidee & Ziel:</label>
              <textarea
                name="spielidee"
                value={formData.spielidee}
                onChange={handleInputChange}
                placeholder="Was ist die grundlegende Idee und das Ziel des Spiels?"
                className="w-full border border-slate-300 rounded py-2 px-3 min-h-24 focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-2">2. Zielgruppe:</label>
              <textarea
                name="zielgruppe"
                value={formData.zielgruppe}
                onChange={handleInputChange}
                placeholder="Für wen ist dieses Spiel gedacht? Begründet eure Einschätzung."
                className="w-full border border-slate-300 rounded py-2 px-3 min-h-24 focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-2">3. Komplexität (1 = sehr einfach, 5 = sehr komplex):</label>
              <div className="flex items-center gap-4 mb-4">
                {[1, 2, 3, 4, 5].map(num => (
                  <label key={num} className="flex items-center">
                    <input
                      type="radio"
                      name="komplexitaet"
                      value={num.toString()}
                      checked={formData.komplexitaet === num.toString()}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    {num}
                  </label>
                ))}
              </div>
              <textarea
                name="komplexitaet_begruendung"
                value={formData.komplexitaet_begruendung}
                onChange={handleInputChange}
                placeholder="Begründet eure Einschätzung kurz."
                className="w-full border border-slate-300 rounded py-2 px-3 min-h-20 focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
              />
            </div>
          </div>
        </div>

        {/* Teil B */}
        <div className="bg-white rounded-lg p-6 border border-slate-200">
          <h4 className="text-xl font-semibold mb-4 pb-2 border-b text-slate-800">Teil B: Spieltypische Elemente & Mechaniken</h4>
          <div className="space-y-6">
            <div>
              <p className="font-semibold text-slate-700 mb-4">1. Elemente im Spiel (ankreuzen und Beispiel nennen):</p>
              <div className="space-y-3">
                {[
                  { id: 'punkte', label: 'Punkte:', key: 'punkte_beispiel', placeholder: 'Wofür erhält man Punkte?' },
                  { id: 'belohnungen', label: 'Belohnungen:', key: 'belohnungen_beispiel', placeholder: 'Was bekommt man für eine gute Aktion?' },
                  { id: 'missionen', label: 'Missionen/Aufgaben:', key: 'missionen_beispiel', placeholder: 'Gibt es konkrete Aufträge?' },
                  { id: 'erfolge', label: 'Erfolge/Abzeichen:', key: 'erfolge_beispiel', placeholder: 'Gibt es besondere Titel oder Auszeichnungen?' },
                  { id: 'ranglisten', label: 'Ranglisten/Level:', key: 'ranglisten_beispiel', placeholder: 'Gibt es eine sichtbare Rangfolge?' },
                  { id: 'feedback', label: 'Feedback:', key: 'feedback_beispiel', placeholder: 'Woran erkennt man einen guten/schlechten Zug?' },
                ].map(item => (
                  <div key={item.id}>
                    <div className="flex items-center mb-2">
                      <input
                        type="checkbox"
                        id={item.id}
                        checked={checkboxes[item.id as keyof typeof checkboxes]}
                        onChange={() => handleCheckboxChange(item.id as keyof typeof checkboxes)}
                        className="mr-2 h-5 w-5"
                      />
                      <label htmlFor={item.id} className="font-medium text-slate-700">
                        {item.label}
                      </label>
                    </div>
                    <textarea
                      name={item.key}
                      value={formData[item.key as keyof typeof formData]}
                      onChange={handleInputChange}
                      placeholder={item.placeholder}
                      className="w-full border border-slate-300 rounded py-2 px-3 min-h-16 ml-6 focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="font-semibold text-slate-700 mb-4">2. Spielmechaniken (ankreuzen und erklären):</p>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      id="set-collection"
                      checked={checkboxes.set_collection}
                      onChange={() => handleCheckboxChange('set_collection')}
                      className="mr-2 h-5 w-5"
                    />
                    <Tooltip text="Das Sammeln von zusammengehörigen Sets (z.B. Karten einer Farbe, gleiche Zahlen, bestimmte Rohstoffe).">
                      <label htmlFor="set-collection" className="font-medium text-slate-700">
                        Set-Collection
                      </label>
                    </Tooltip>
                  </div>
                  <textarea
                    name="set_collection_erklaerung"
                    value={formData.set_collection_erklaerung}
                    onChange={handleInputChange}
                    placeholder="Erklärung: Wie funktioniert das Sammeln von Sets im Spiel?"
                    className="w-full border border-slate-300 rounded py-2 px-3 min-h-20 ml-6 focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
                  />
                </div>

                <div>
                  <div className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      id="tile-placement"
                      checked={checkboxes.tile_placement}
                      onChange={() => handleCheckboxChange('tile_placement')}
                      className="mr-2 h-5 w-5"
                    />
                    <Tooltip text="Das Legen von Plättchen auf einem Spielbrett, um eine Landschaft zu gestalten, Gebiete zu beanspruchen oder Aktionen auszulösen.">
                      <label htmlFor="tile-placement" className="font-medium text-slate-700">
                        Tile-Placement
                      </label>
                    </Tooltip>
                  </div>
                  <textarea
                    name="tile_placement_erklaerung"
                    value={formData.tile_placement_erklaerung}
                    onChange={handleInputChange}
                    placeholder="Erklärung: Wie funktioniert das Legen von Plättchen?"
                    className="w-full border border-slate-300 rounded py-2 px-3 min-h-20 ml-6 focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
                  />
                </div>

                <div>
                  <div className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      id="worker-placement"
                      checked={checkboxes.worker_placement}
                      onChange={() => handleCheckboxChange('worker_placement')}
                      className="mr-2 h-5 w-5"
                    />
                    <Tooltip text="Das Einsetzen von Spielfiguren ('Worker') auf Aktionsfelder, um eine bestimmte Aktion für sich zu beanspruchen. Oft ist ein Feld danach blockiert.">
                      <label htmlFor="worker-placement" className="font-medium text-slate-700">
                        Worker-Placement
                      </label>
                    </Tooltip>
                  </div>
                  <textarea
                    name="worker_placement_erklaerung"
                    value={formData.worker_placement_erklaerung}
                    onChange={handleInputChange}
                    placeholder="Erklärung: Wie funktioniert das Einsetzen von Figuren?"
                    className="w-full border border-slate-300 rounded py-2 px-3 min-h-20 ml-6 focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
                  />
                </div>

                <div>
                  <div className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      id="deckbuilding"
                      checked={checkboxes.deckbuilding}
                      onChange={() => handleCheckboxChange('deckbuilding')}
                      className="mr-2 h-5 w-5"
                    />
                    <Tooltip text="Spieler starten mit einem kleinen Kartendeck und kaufen im Laufe des Spiels stärkere Karten hinzu, um ihr Deck zu verbessern.">
                      <label htmlFor="deckbuilding" className="font-medium text-slate-700">
                        Deckbuilding
                      </label>
                    </Tooltip>
                  </div>
                  <textarea
                    name="deckbuilding_erklaerung"
                    value={formData.deckbuilding_erklaerung}
                    onChange={handleInputChange}
                    placeholder="Erklärung: Wie wird das Kartendeck im Spiel verbessert?"
                    className="w-full border border-slate-300 rounded py-2 px-3 min-h-20 ml-6 focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
                  />
                </div>

                <div>
                  <div className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      id="andere"
                      checked={checkboxes.andere}
                      onChange={() => handleCheckboxChange('andere')}
                      className="mr-2 h-5 w-5"
                    />
                    <label htmlFor="andere" className="font-medium text-slate-700">
                      Andere wichtige Mechanik:
                    </label>
                  </div>
                  <textarea
                    name="andere_erklaerung"
                    value={formData.andere_erklaerung}
                    onChange={handleInputChange}
                    placeholder="z.B. Würfeln, Hand-Management, Bluffen. Erklärt die wichtigste andere Mechanik."
                    className="w-full border border-slate-300 rounded py-2 px-3 min-h-20 ml-6 focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Teil C */}
        <div className="bg-white rounded-lg p-6 border border-slate-200">
          <h4 className="text-xl font-semibold mb-4 pb-2 border-b text-slate-800">Teil C: Das Spielerlebnis & Persönliche Entwicklung</h4>
          <div className="space-y-6">
            <div>
              <label className="block font-semibold text-slate-700 mb-3">1. Emotionen im Spiel (nennt konkrete Beispiele):</label>
              <textarea
                name="emotionen_spannung"
                value={formData.emotionen_spannung}
                onChange={handleInputChange}
                placeholder="Spannung:"
                className="w-full border border-slate-300 rounded py-2 px-3 min-h-16 mb-2 focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
              />
              <textarea
                name="emotionen_glueck"
                value={formData.emotionen_glueck}
                onChange={handleInputChange}
                placeholder="Glück/Freude:"
                className="w-full border border-slate-300 rounded py-2 px-3 min-h-16 mb-2 focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
              />
              <textarea
                name="emotionen_frustration"
                value={formData.emotionen_frustration}
                onChange={handleInputChange}
                placeholder="Frustration:"
                className="w-full border border-slate-300 rounded py-2 px-3 min-h-16 mb-2 focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
              />
              <textarea
                name="emotionen_empathie"
                value={formData.emotionen_empathie}
                onChange={handleInputChange}
                placeholder="Empathie:"
                className="w-full border border-slate-300 rounded py-2 px-3 min-h-16 focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-3">2. Geforderte Fähigkeiten (ordnet nach Wichtigkeit: 1 = am wichtigsten):</label>
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    name="ranking_strategie"
                    value={formData.ranking_strategie}
                    onChange={handleInputChange}
                    min="1"
                    max="4"
                    className="w-16 border border-slate-300 rounded py-2 px-3 text-center focus:outline-none focus:border-teal-600"
                  />
                  <label className="text-slate-700">Strategisches Denken (Langfristige Planung)</label>
                </div>
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    name="ranking_problemloesung"
                    value={formData.ranking_problemloesung}
                    onChange={handleInputChange}
                    min="1"
                    max="4"
                    className="w-16 border border-slate-300 rounded py-2 px-3 text-center focus:outline-none focus:border-teal-600"
                  />
                  <label className="text-slate-700">Problemlösung (Auf neue Situationen reagieren)</label>
                </div>
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    name="ranking_kreativitaet"
                    value={formData.ranking_kreativitaet}
                    onChange={handleInputChange}
                    min="1"
                    max="4"
                    className="w-16 border border-slate-300 rounded py-2 px-3 text-center focus:outline-none focus:border-teal-600"
                  />
                  <label className="text-slate-700">Kreativität (Ungewöhnliche Lösungswege finden)</label>
                </div>
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    name="ranking_resilienz"
                    value={formData.ranking_resilienz}
                    onChange={handleInputChange}
                    min="1"
                    max="4"
                    className="w-16 border border-slate-300 rounded py-2 px-3 text-center focus:outline-none focus:border-teal-600"
                  />
                  <Tooltip text="Die Fähigkeit, mit Pech, Rückschlägen oder Niederlagen umzugehen und trotzdem motiviert weiterzuspielen.">
                    <label className="text-slate-700">Resilienz (Mit Pech oder Rückschlägen umgehen)</label>
                  </Tooltip>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Teil D */}
        <div className="bg-white rounded-lg p-6 border border-slate-200">
          <h4 className="text-xl font-semibold mb-4 pb-2 border-b text-slate-800">Teil D: Soziale Entwicklung</h4>
          <div className="space-y-6">
            <div>
              <label className="block font-semibold text-slate-700 mb-2">1. Interaktion & Kommunikation:</label>
              <textarea
                name="interaktion"
                value={formData.interaktion}
                onChange={handleInputChange}
                placeholder="Wie interagieren die Spieler miteinander? Ist Kommunikation wichtig?"
                className="w-full border border-slate-300 rounded py-2 px-3 min-h-24 focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-2">2. Teamarbeit & Inklusion:</label>
              <textarea
                name="teamarbeit"
                value={formData.teamarbeit}
                onChange={handleInputChange}
                placeholder="Fördert das Spiel Teamarbeit? Werden alle einbezogen?"
                className="w-full border border-slate-300 rounded py-2 px-3 min-h-24 focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-2">3. Wertebildung:</label>
              <textarea
                name="wertebildung"
                value={formData.wertebildung}
                onChange={handleInputChange}
                placeholder="Vermittelt das Spiel bestimmte Werte (z.B. Fairness, Kooperation)?"
                className="w-full border border-slate-300 rounded py-2 px-3 min-h-24 focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
              />
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="no-print flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
          <button
            type="button"
            onClick={handlePrint}
            className="w-full sm:w-auto bg-teal-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-400 transition"
          >
            Antworten drucken / Als PDF speichern
          </button>
          <button
            type="button"
            onClick={handlePrintEmpty}
            className="w-full sm:w-auto bg-slate-200 text-slate-700 font-bold py-3 px-8 rounded-lg hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-300 transition"
          >
            Leeren Fragebogen drucken
          </button>
        </div>
      </form>

      <div className="text-center mt-8 text-slate-500 text-sm no-print">
        <p>© 2025 - Erstellt für den Unterricht</p>
      </div>
    </div>
  )
}

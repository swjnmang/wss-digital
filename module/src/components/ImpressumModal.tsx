import { useState } from 'react'

export default function ImpressumModal() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Footer Link */}
      <footer className="bg-slate-100 border-t border-slate-200 py-6 px-4 mt-12">
        <div className="max-w-6xl mx-auto flex items-center justify-center">
          <button
            onClick={() => setIsOpen(true)}
            className="text-sm text-slate-600 hover:text-slate-900 underline transition-colors font-medium"
          >
            Impressum
          </button>
        </div>
      </footer>

      {/* Modal Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setIsOpen(false)}
        >
          {/* Modal Content */}
          <div
            className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-slate-900">Impressum</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-2xl text-slate-500 hover:text-slate-700 transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="prose prose-sm max-w-none text-slate-700 space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">Angaben gemäß § 5 TMG</h3>
                  <p className="mb-2">
                    <strong>Jonathan Mangold</strong>
                  </p>
                  <p>
                    c/o Schenkenstraße 10<br />
                    74544 Michelbach, Deutschland
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">Vertreten durch</h3>
                  <p>Jonathan Mangold</p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">Kontakt</h3>
                  <p>
                    <strong>E-Mail:</strong> <a href="mailto:info@wss-digital.de" className="text-blue-600 hover:text-blue-700">info@wss-digital.de</a>
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h3>
                  <p>
                    Jonathan Mangold<br />
                    (Anschrift wie oben)
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-200">
                  <p className="text-xs text-slate-500">
                    Diese Website betreibt ein Lern- und Gamification-Modul. Alle Inhalte dienen zu Bildungszwecken.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="mt-6 w-full px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors font-semibold"
              >
                Schließen
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

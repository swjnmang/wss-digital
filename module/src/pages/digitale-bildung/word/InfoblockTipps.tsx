import { useState } from 'react';

function InfoblockTippsModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 bg-slate-900/50 flex items-start sm:items-center justify-center p-4 z-50 overflow-y-auto"
      onClick={onClose}
    >
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl my-8" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-800">💡 Tipps: Der Infoblock</h2>
          <button
            onClick={onClose}
            aria-label="Schließen"
            className="text-slate-400 hover:text-slate-600 text-xl leading-none px-2"
          >
            ×
          </button>
        </div>

        <div className="p-5 flex flex-col gap-5">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-900 leading-relaxed">
            <p>
              Der Infoblock steht rechts neben dem Anschriftenfeld (Breite 7,5&nbsp;cm) und enthält auf einen Blick
              die wichtigsten Angaben zum Vorgang: Bezüge auf frühere Schreiben, ein Kürzel für den Vorgang, den
              Ansprechpartner mit Kontaktdaten und das Datum.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
              <p className="text-sm font-semibold text-slate-800 mb-1">Ihr Zeichen / Ihre Nachricht vom</p>
              <p className="text-xs text-slate-600">
                Werden nur ausgefüllt, wenn auf ein Schreiben des Geschäftspartners geantwortet wird – dann
                übernimmst du dessen Zeichen und Datum unverändert. Gibt es keinen solchen Bezug, bleiben beide
                Felder leer.
              </p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
              <p className="text-sm font-semibold text-slate-800 mb-1">Unsere Nachricht vom</p>
              <p className="text-xs text-slate-600">
                Wird nur ausgefüllt, wenn ihr selbst schon einmal in dieser Sache geschrieben habt. Ohne ein
                eigenes vorheriges Schreiben bleibt das Feld leer.
              </p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 sm:col-span-2">
              <p className="text-sm font-semibold text-slate-800 mb-1">Unser Zeichen</p>
              <p className="text-xs text-slate-600 mb-2">
                Kürzel des Vorgesetzten und deines eigenen Namens: jeweils der erste Buchstabe des Vor- und
                Nachnamens, klein geschrieben, getrennt durch einen Bindestrich. Der Auftraggeber (z.&nbsp;B. der
                Vorgesetzte) wird zuerst genannt.
              </p>
              <div className="border border-dashed border-slate-300 rounded-lg p-3 bg-white font-mono text-sm text-slate-800">
                Beispiel: Alfred Maier (Vorgesetzter) beauftragt Hans Schuster → <strong>am-hs</strong>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Akademische Titel wie „Dr.“ oder „Prof.“ zählen dabei nicht mit.
              </p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 sm:col-span-2">
              <p className="text-sm font-semibold text-slate-800 mb-1">Name, Telefon, Fax, E-Mail, Datum</p>
              <p className="text-xs text-slate-600">
                Name des Verfassers/der Verfasserin sowie die vorgegebenen Kontaktdaten werden unverändert
                übernommen. Enthält eine E-Mail-Vorlage einen Platzhalter wie „vorname.nachname“, setzt du dort die
                echten Vor- und Nachnamen der Kontaktperson ein. Wird eine Angabe (z.&nbsp;B. Fax) gar nicht
                genannt, bleibt das Feld leer. Das Datum ist immer das heutige Tagesdatum.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function InfoblockTippsButton({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={
          className ??
          'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold bg-white/10 hover:bg-white/20 text-white transition-colors'
        }
      >
        💡 Tipps
      </button>
      {open && <InfoblockTippsModal onClose={() => setOpen(false)} />}
    </>
  );
}

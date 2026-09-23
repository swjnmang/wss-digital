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
              <p className="text-sm font-semibold text-slate-800 mb-1">Name → Unser Zeichen &amp; E-Mail</p>
              <p className="text-xs text-slate-600 mb-2">
                Trage zuerst deinen eigenen Vor- und Nachnamen ein. Daraus ergibt sich dein Kürzel bei „Unser
                Zeichen“ (erster Buchstabe von Vor- und Nachname, klein geschrieben) sowie deine eigene
                E-Mail-Adresse nach dem Muster „vorname.nachname@domain“ – <strong>nicht</strong> die des
                Vorgesetzten. Bei „Unser Zeichen“ wird zuerst das Kürzel des Vorgesetzten genannt (Auftraggeber),
                dann mit Bindestrich getrennt dein eigenes Kürzel.
              </p>
              <div className="border border-dashed border-slate-300 rounded-lg p-3 bg-white font-mono text-sm text-slate-800">
                Beispiel: Alfred Maier (Vorgesetzter) beauftragt Hans Schuster
                <br />
                Unser Zeichen → <strong>am-hs</strong> · E-Mail → <strong>hans.schuster@firma.de</strong>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Akademische Titel wie „Dr.“ oder „Prof.“ zählen dabei nicht mit.
              </p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 sm:col-span-2">
              <p className="text-sm font-semibold text-slate-800 mb-1">Telefon, Fax, Datum</p>
              <p className="text-xs text-slate-600">
                Beim Telefon trägst du nur die Durchwahlnummer selbst ein (z.&nbsp;B. „142“), ohne das Wort
                „Durchwahl“ davor – die Beschriftung „Telefon:“ steht ja schon davor. Ist stattdessen eine
                vollständige Telefonnummer angegeben, wird genau diese übernommen. Beim Fax gilt dasselbe. Wird eine
                Angabe (z.&nbsp;B. Fax) gar nicht genannt, bleibt das Feld leer. Das Datum ist immer das heutige
                Tagesdatum.
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

import { useState } from 'react';
import { Lightbulb } from 'lucide-react';
import { TipsPanel } from '../../../components/digitale-bildung/Werkbank';

function InfoblockTippsModal({ onClose }: { onClose: () => void }) {
  return (
    <TipsPanel title="Tipps: Der Infoblock" onClose={onClose}>
      <div className="flex flex-col gap-5">
          <div className="bg-tool-soft border border-line rounded-lg p-4 text-[15px] text-ink leading-relaxed">
            <p>
              Der Infoblock steht rechts neben dem Anschriftenfeld (Breite 7,5&nbsp;cm) und enthält auf einen Blick
              die wichtigsten Angaben zum Vorgang: Bezüge auf frühere Schreiben, ein Kürzel für den Vorgang, den
              Ansprechpartner mit Kontaktdaten und das Datum.
            </p>
          </div>

          <div className="grid grid-cols-1  gap-3">
            <div className="bg-canvas border border-line rounded-lg p-3">
              <p className="text-[15px] font-semibold text-ink mb-1">Ihr Zeichen / Ihre Nachricht vom</p>
              <p className="text-[13px] text-ink-soft">
                Werden nur ausgefüllt, wenn auf ein Schreiben des Geschäftspartners geantwortet wird – dann
                übernimmst du dessen Zeichen und Datum unverändert. Gibt es keinen solchen Bezug, bleiben beide
                Felder leer.
              </p>
            </div>
            <div className="bg-canvas border border-line rounded-lg p-3">
              <p className="text-[15px] font-semibold text-ink mb-1">Unsere Nachricht vom</p>
              <p className="text-[13px] text-ink-soft">
                Wird nur ausgefüllt, wenn ihr selbst schon einmal in dieser Sache geschrieben habt. Ohne ein
                eigenes vorheriges Schreiben bleibt das Feld leer.
              </p>
            </div>
            <div className="bg-canvas border border-line rounded-lg p-3 ">
              <p className="text-[15px] font-semibold text-ink mb-1">Name → Unser Zeichen &amp; E-Mail</p>
              <p className="text-[13px] text-ink-soft mb-2">
                Trage zuerst deinen eigenen Vor- und Nachnamen ein. Daraus ergibt sich dein Kürzel bei „Unser
                Zeichen“ (erster Buchstabe von Vor- und Nachname, klein geschrieben) sowie deine eigene
                E-Mail-Adresse nach dem Muster „vorname.nachname@domain“ – <strong>nicht</strong> die des
                Vorgesetzten. Bei „Unser Zeichen“ wird zuerst das Kürzel des Vorgesetzten genannt (Auftraggeber),
                dann mit Bindestrich getrennt dein eigenes Kürzel.
              </p>
              <div className="border border-dashed border-line-strong rounded-lg p-3 bg-surface font-werkbank-mono text-[15px] text-ink">
                Beispiel: Alfred Maier (Vorgesetzter) beauftragt Hans Schuster
                <br />
                Unser Zeichen → <strong>am-hs</strong> · E-Mail → <strong>hans.schuster@firma.de</strong>
              </div>
              <p className="text-[13px] text-ink-soft mt-2">
                Akademische Titel wie „Dr.“ oder „Prof.“ zählen dabei nicht mit.
              </p>
            </div>
            <div className="bg-canvas border border-line rounded-lg p-3 ">
              <p className="text-[15px] font-semibold text-ink mb-1">Telefon, Fax, Datum</p>
              <p className="text-[13px] text-ink-soft">
                Beim Telefon trägst du nur die Durchwahlnummer selbst ein (z.&nbsp;B. „142“), ohne das Wort
                „Durchwahl“ davor – die Beschriftung „Telefon:“ steht ja schon davor. Ist stattdessen eine
                vollständige Telefonnummer angegeben, wird genau diese übernommen. Beim Fax gilt dasselbe. Wird eine
                Angabe (z.&nbsp;B. Fax) gar nicht genannt, bleibt das Feld leer. Das Datum ist immer das heutige
                Tagesdatum.
              </p>
            </div>
          </div>
        </div>
    </TipsPanel>
  );
}

export function InfoblockTippsButton({ className, label = 'Tipps' }: { className?: string; label?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={
          className ??
          'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[15px] font-semibold bg-surface/10 hover:bg-surface/20 text-white transition-colors'
        }
      >
        <Lightbulb size={18} aria-hidden="true" />
        {label}
      </button>
      {open && <InfoblockTippsModal onClose={() => setOpen(false)} />}
    </>
  );
}

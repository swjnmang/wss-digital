import { useState } from 'react';

function AufzaehlungTippsModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 bg-slate-900/50 flex items-start sm:items-center justify-center p-4 z-50 overflow-y-auto"
      onClick={onClose}
    >
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl my-8" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-800">💡 Tipps: Aufzählung &amp; Nummerierung</h2>
          <button
            onClick={onClose}
            aria-label="Schließen"
            className="text-slate-400 hover:text-slate-600 text-xl leading-none px-2"
          >
            ×
          </button>
        </div>

        <div className="p-5 flex flex-col gap-3">
          <p className="text-sm text-slate-700">
            Für Aufzählungen (•) und Nummerierungen (1., 2., …) gelten nach DIN 5008 fünf Grundregeln:
          </p>
          <ol className="text-sm text-slate-700 list-decimal list-inside space-y-2">
            <li>Vor und nach der Liste steht jeweils eine Leerzeile.</li>
            <li>Das Aufzählungs- bzw. Nummerierungszeichen steht auf der Fluchtlinie (0 cm).</li>
            <li>Der Text nach dem Zeichen beginnt bei einem Einzug von 0,75 cm – auch in Folgezeilen.</li>
            <li>
              Sobald ein Stichpunkt mehr als eine Zeile benötigt, steht auch zwischen den anderen (einzeiligen)
              Punkten eine Leerzeile.
            </li>
            <li>
              Satzzeichen richten sich danach, ob die Liste einen Satz fortsetzt (Kommas, Schlusspunkt) oder jeder
              Punkt ein eigener vollständiger Satz ist (jeweils ein Punkt am Ende).
            </li>
          </ol>

          <div className="border border-dashed border-slate-300 rounded-lg p-3 bg-slate-50 font-mono text-sm text-slate-800 mt-2">
            <div>In unserem Geschäft erhalten Sie</div>
            <div className="text-slate-300">(Leerzeile)</div>
            <div className="pl-3">1. Blusen,</div>
            <div className="pl-3">2. Kleider,</div>
            <div className="pl-3">3. Hosen,</div>
            <div className="pl-3">4. Röcke.</div>
            <div className="text-slate-300">(Leerzeile)</div>
            <div>Wir freuen uns auf Ihren Besuch.</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AufzaehlungTippsButton({ className }: { className?: string }) {
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
      {open && <AufzaehlungTippsModal onClose={() => setOpen(false)} />}
    </>
  );
}

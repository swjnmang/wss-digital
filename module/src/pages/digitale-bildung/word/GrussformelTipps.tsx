import { useState } from 'react';

function GrussformelTippsModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 bg-slate-900/50 flex items-start sm:items-center justify-center p-4 z-50 overflow-y-auto"
      onClick={onClose}
    >
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl my-8" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-800">💡 Tipps: Grußformel &amp; Unterschrift</h2>
          <button
            onClick={onClose}
            aria-label="Schließen"
            className="text-slate-400 hover:text-slate-600 text-xl leading-none px-2"
          >
            ×
          </button>
        </div>

        <div className="p-5 flex flex-col gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-900 leading-relaxed">
            <p>
              Wie im Privatbrief endet der Geschäftsbrief mit „Freundliche Grüße“. Danach folgt mit einer Leerzeile
              Abstand die Unternehmensbranche und darunter der Unternehmensname. Anschließend werden exakt drei
              Leerzeilen für die Unterschrift freigelassen, bevor der Name gedruckt wird.
            </p>
          </div>

          <div className="border border-dashed border-slate-300 rounded-lg p-3 bg-slate-50 font-mono text-sm text-slate-800">
            <div>Freundliche Grüße</div>
            <div className="text-slate-300">(Leerzeile)</div>
            <div>Möbelherstellung</div>
            <div>MÖBELFABRIK Peter Jordan GmbH</div>
            <div className="text-slate-300">(Leerzeile)</div>
            <div className="text-slate-300">(Leerzeile)</div>
            <div className="text-slate-300">(Leerzeile)</div>
            <div>i. A. Hans Schuster</div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
            <p className="text-sm font-semibold text-slate-800 mb-1">Schreibst du „im Auftrag“?</p>
            <p className="text-xs text-slate-600">
              Verfasst du den Brief für deinen Arbeitgeber, wird dein vollständiger Name mit vorangestelltem „i. A.“
              gedruckt (z.&nbsp;B. „i. A. Hans Schuster“). Alternativ kann „i. A.“ auch allein in die mittlere der
              drei Leerzeilen geschrieben werden – dann steht danach nur noch der Name ohne Zusatz. Unterschreibt die
              Person selbst, entfällt „i. A.“ komplett.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function GrussformelTippsButton({ className }: { className?: string }) {
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
      {open && <GrussformelTippsModal onClose={() => setOpen(false)} />}
    </>
  );
}

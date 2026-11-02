import { useState } from 'react';
import { Lightbulb } from 'lucide-react';
import { TipsPanel } from '../../../components/digitale-bildung/Werkbank';

function GrussformelTippsModal({ onClose }: { onClose: () => void }) {
  return (
    <TipsPanel title="Tipps: Grußformel & Unterschrift" onClose={onClose}>
      <div className="flex flex-col gap-4">
          <div className="bg-tool-soft border border-line rounded-lg p-4 text-[15px] text-ink leading-relaxed">
            <p>
              Wie im Privatbrief endet der Geschäftsbrief mit „Freundliche Grüße“. Danach folgt mit einer Leerzeile
              Abstand die Unternehmensbranche und darunter der Unternehmensname. Anschließend werden exakt drei
              Leerzeilen für die Unterschrift freigelassen, bevor der Name gedruckt wird.
            </p>
          </div>

          <div className="border border-dashed border-line-strong rounded-lg p-3 bg-canvas font-werkbank-mono text-[15px] text-ink">
            <div>Freundliche Grüße</div>
            <div className="text-ink-muted">(Leerzeile)</div>
            <div>Möbelherstellung</div>
            <div>MÖBELFABRIK Peter Jordan GmbH</div>
            <div className="text-ink-muted">(Leerzeile)</div>
            <div className="text-ink-muted">(Leerzeile)</div>
            <div className="text-ink-muted">(Leerzeile)</div>
            <div>i. A. Hans Schuster</div>
          </div>

          <div className="bg-canvas border border-line rounded-lg p-3">
            <p className="text-[15px] font-semibold text-ink mb-1">Schreibst du „im Auftrag“?</p>
            <p className="text-[13px] text-ink-soft">
              Verfasst du den Brief für deinen Arbeitgeber, wird dein vollständiger Name mit vorangestelltem „i. A.“
              gedruckt (z.&nbsp;B. „i. A. Hans Schuster“). Alternativ kann „i. A.“ auch allein in die mittlere der
              drei Leerzeilen geschrieben werden – dann steht danach nur noch der Name ohne Zusatz. Unterschreibt die
              Person selbst, entfällt „i. A.“ komplett.
            </p>
          </div>
        </div>
    </TipsPanel>
  );
}

export function GrussformelTippsButton({ className, label = 'Tipps' }: { className?: string; label?: string }) {
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
      {open && <GrussformelTippsModal onClose={() => setOpen(false)} />}
    </>
  );
}

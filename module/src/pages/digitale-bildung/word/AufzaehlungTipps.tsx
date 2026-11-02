import { useState } from 'react';
import { Lightbulb } from 'lucide-react';
import { TipsPanel } from '../../../components/digitale-bildung/Werkbank';

function AufzaehlungTippsModal({ onClose }: { onClose: () => void }) {
  return (
    <TipsPanel title="Tipps: Aufzählung & Nummerierung" onClose={onClose}>
      <div className="flex flex-col gap-3">
          <p className="text-[15px] text-ink">
            Für Aufzählungen (•) und Nummerierungen (1., 2., …) gelten nach DIN 5008 fünf Grundregeln:
          </p>
          <ol className="text-[15px] text-ink list-decimal list-inside space-y-2">
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

          <div className="border border-dashed border-line-strong rounded-lg p-3 bg-canvas font-werkbank-mono text-[15px] text-ink mt-2">
            <div>In unserem Geschäft erhalten Sie</div>
            <div className="text-ink-muted">(Leerzeile)</div>
            <div className="pl-3">1. Blusen,</div>
            <div className="pl-3">2. Kleider,</div>
            <div className="pl-3">3. Hosen,</div>
            <div className="pl-3">4. Röcke.</div>
            <div className="text-ink-muted">(Leerzeile)</div>
            <div>Wir freuen uns auf Ihren Besuch.</div>
          </div>
        </div>
    </TipsPanel>
  );
}

export function AufzaehlungTippsButton({ className, label = 'Tipps' }: { className?: string; label?: string }) {
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
      {open && <AufzaehlungTippsModal onClose={() => setOpen(false)} />}
    </>
  );
}

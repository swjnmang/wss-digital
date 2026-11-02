import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExcelSession } from '../../lib/excel-trainer/ExcelSessionContext';

interface GuardedBackLinkProps {
  to: string;
  className?: string;
  label?: string;
  children: React.ReactNode;
}

export function GuardedBackLink({ to, className, label, children }: GuardedBackLinkProps) {
  const navigate = useNavigate();
  const { recording, hasProgress, finishRecording, discardRecording } = useExcelSession();
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (recording && hasProgress) {
      setShowModal(true);
    } else {
      navigate(to);
    }
  };

  const leaveWithoutPdf = () => {
    discardRecording();
    setShowModal(false);
    navigate(to);
  };

  const leaveWithPdf = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    finishRecording(trimmed);
    setShowModal(false);
    navigate(to);
  };

  return (
    <>
      <a href={to} onClick={handleClick} className={className} aria-label={label} title={label}>
        {children}
      </a>

      {showModal && (
        <div className="werkbank-light fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-lg shadow-xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold text-ink mb-2">Aufzeichnung läuft noch</h3>
            <p className="text-sm text-ink-soft mb-4">
              Wenn du jetzt gehst, ohne die Aufzeichnung zu beenden, geht dein bisheriger Fortschritt verloren. Möchtest
              du stattdessen jetzt deinen Arbeitsnachweis als PDF erstellen?
            </p>
            <input
              autoFocus
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && leaveWithPdf()}
              placeholder="Vor- und Nachname für das PDF"
              className="w-full min-h-11 px-3 py-2 border border-line-strong rounded-lg text-sm mb-4 focus:border-tool"
            />
            <div className="flex flex-col gap-2">
              <button
                onClick={leaveWithPdf}
                disabled={!name.trim()}
                className="min-h-11 px-4 py-2 bg-tool hover:bg-tool-dark disabled:opacity-40 text-white rounded-lg text-sm font-semibold"
              >
                PDF erstellen und verlassen
              </button>
              <button
                onClick={leaveWithoutPdf}
                className="min-h-11 px-4 py-2 bg-canvas hover:bg-line text-ink rounded-lg text-sm font-medium"
              >
                Ohne PDF verlassen (Fortschritt geht verloren)
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="min-h-11 px-4 py-2 text-sm text-ink-soft hover:text-ink"
              >
                Abbrechen, hier bleiben
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

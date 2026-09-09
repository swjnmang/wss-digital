import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExcelSession } from '../../lib/excel-trainer/ExcelSessionContext';

interface GuardedBackLinkProps {
  to: string;
  className?: string;
  children: React.ReactNode;
}

export function GuardedBackLink({ to, className, children }: GuardedBackLinkProps) {
  const navigate = useNavigate();
  const { recording, hasProgress, finishRecording, discardRecording } = useExcelSession();
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');

  const handleClick = (e: React.MouseEvent) => {
    if (recording && hasProgress) {
      e.preventDefault();
      setShowModal(true);
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
      <a href={to} onClick={handleClick} className={className}>
        {children}
      </a>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Aufzeichnung läuft noch</h3>
            <p className="text-sm text-slate-600 mb-4">
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
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <div className="flex flex-col gap-2">
              <button
                onClick={leaveWithPdf}
                disabled={!name.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-lg text-sm font-semibold"
              >
                PDF erstellen und verlassen
              </button>
              <button
                onClick={leaveWithoutPdf}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium"
              >
                Ohne PDF verlassen (Fortschritt geht verloren)
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700"
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

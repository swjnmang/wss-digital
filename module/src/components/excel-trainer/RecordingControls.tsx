import { useState } from 'react';

interface RecordingControlsProps {
  recording: boolean;
  onStart: () => void;
  onFinish: (name: string) => void;
}

export function RecordingControls({ recording, onStart, onFinish }: RecordingControlsProps) {
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [name, setName] = useState('');

  const handleFinishClick = () => {
    setShowNamePrompt(true);
  };

  const handleConfirm = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setShowNamePrompt(false);
    setName('');
    onFinish(trimmed);
  };

  return (
    <>
      {!recording ? (
        <button
          onClick={onStart}
          className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-lg font-medium text-sm transition-colors"
        >
          ⏺ Aufzeichnung starten
        </button>
      ) : (
        <button
          onClick={handleFinishClick}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg font-medium text-xs transition-colors whitespace-nowrap"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          Aufzeichnung beenden
        </button>
      )}

      {showNamePrompt && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Arbeitsnachweis erstellen</h3>
            <p className="text-sm text-slate-600 mb-4">
              Bitte gib deinen Namen ein. Danach wird ein PDF mit deinem Arbeitsnachweis heruntergeladen.
            </p>
            <input
              autoFocus
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
              placeholder="Vor- und Nachname"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowNamePrompt(false)}
                className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800"
              >
                Abbrechen
              </button>
              <button
                onClick={handleConfirm}
                disabled={!name.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-lg text-sm font-semibold"
              >
                PDF erstellen
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

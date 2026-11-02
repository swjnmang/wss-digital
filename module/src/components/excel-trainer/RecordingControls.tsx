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
          className="flex items-center gap-2 min-h-11 px-4 py-2 bg-shell hover:bg-shell-2 text-white rounded-lg font-medium text-sm transition-colors"
        >
          Aufzeichnung starten
        </button>
      ) : (
        <button
          onClick={handleFinishClick}
          className="inline-flex h-11 items-center gap-2 rounded-md border border-shell-line px-3.5 text-[15.5px] font-semibold whitespace-nowrap text-white transition-colors hover:bg-shell-2"
        >
          <span className="h-2 w-2 rounded-full bg-[#ff8a5c] animate-pulse" />
          Aufzeichnung beenden
        </button>
      )}

      {showNamePrompt && (
        <div className="werkbank-light fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-lg shadow-xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold text-ink mb-2">Arbeitsnachweis erstellen</h3>
            <p className="text-sm text-ink-soft mb-4">
              Bitte gib deinen Namen ein. Danach wird ein PDF mit deinem Arbeitsnachweis heruntergeladen.
            </p>
            <input
              autoFocus
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
              placeholder="Vor- und Nachname"
              className="w-full min-h-11 px-3 py-2 border border-line-strong rounded-lg text-sm mb-4 focus:border-tool"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowNamePrompt(false)}
                className="min-h-11 px-4 py-2 text-sm text-ink-soft hover:text-ink"
              >
                Abbrechen
              </button>
              <button
                onClick={handleConfirm}
                disabled={!name.trim()}
                className="min-h-11 px-4 py-2 bg-tool hover:bg-tool-dark disabled:opacity-40 text-white rounded-lg text-sm font-semibold"
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

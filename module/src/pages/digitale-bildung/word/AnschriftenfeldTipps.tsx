import { useState } from 'react';

interface Beispiel {
  title: string;
  note: string;
  senderLine: string;
  lines: string[];
}

const BEISPIELE: Beispiel[] = [
  {
    title: 'Privatperson',
    note: 'Die Anrede „Herrn“ (nicht „Herr“) bzw. „Frau“ steht in einer eigenen Zeile über dem Namen.',
    senderLine: 'Markus Mustermann, Musterstraße 1, 11111 Musterstadt',
    lines: ['Herrn', 'Stephan Breitner', 'Birkenweg 11', '54344 Kenn'],
  },
  {
    title: 'Privatperson mit Titel',
    note: 'Titel (z. B. „Dr.“) stehen mit Leerzeichen vor dem Vornamen, die Anrede bleibt unverändert.',
    senderLine: 'Markus Mustermann, Musterstraße 1, 11111 Musterstadt',
    lines: ['Frau', 'Dr. Stephanie Breitner', 'Birkenweg 11', '54344 Kenn'],
  },
  {
    title: 'Unternehmen ohne Ansprechpartner',
    note: 'Ohne persönlichen Ansprechpartner steht die Firma direkt in der ersten Zeile – ohne Anrede.',
    senderLine: 'Markus Mustermann, Musterstraße 1, 11111 Musterstadt',
    lines: ['Stahlbau Weidert KG', 'Maienweg 11 a', '89081 Ulm'],
  },
  {
    title: 'Unternehmen mit Ansprechpartner',
    note: 'Die Firma steht über dem Namen. Anrede und Name stehen dabei in einer gemeinsamen Zeile.',
    senderLine: 'Markus Mustermann, Musterstraße 1, 11111 Musterstadt',
    lines: ['Stahlbau Weidert KG', 'Herrn Stephan Breitner', 'Maienweg 11 a', '89081 Ulm'],
  },
];

function AnschriftBeispiel({ beispiel }: { beispiel: Beispiel }) {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
      <p className="text-sm font-semibold text-slate-800 mb-2">{beispiel.title}</p>
      <div className="border border-dashed border-slate-300 rounded-lg p-3 bg-white font-mono">
        <div className="text-[10px] text-slate-500 mb-1">{beispiel.senderLine}</div>
        <div className="border-t border-slate-300 my-1" />
        {beispiel.lines.map((line) => (
          <div key={line} className="text-sm text-slate-800">
            {line}
          </div>
        ))}
      </div>
      <p className="text-xs text-slate-500 mt-2">{beispiel.note}</p>
    </div>
  );
}

function AnschriftenfeldTippsModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 bg-slate-900/50 flex items-start sm:items-center justify-center p-4 z-50 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-2xl my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-800">💡 Tipps: Das Anschriftenfeld</h2>
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
              Das Anschriftenfeld ist 40&nbsp;mm hoch, 85&nbsp;mm breit und besteht aus 11&nbsp;Zeilen. Die ersten
              5&nbsp;Zeilen (Schriftgröße 8&nbsp;pt) bilden die Zusatz- und Vermerkzone: ganz oben steht die
              Rücksendeangabe, darunter Platz für postalische Vermerke wie „Einschreiben“ oder „Privat“. Ab
              Zeile&nbsp;6 beginnt die eigentliche Anschrift (Schriftgröße 11&nbsp;pt): Anrede, Name,
              Straße/Hausnummer (oder Postfach), PLZ/Ort und bei Auslandsbriefen zusätzlich das Land in
              GROSSBUCHSTABEN.
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-700 mb-3">Beispiele</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {BEISPIELE.map((beispiel) => (
                <AnschriftBeispiel key={beispiel.title} beispiel={beispiel} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AnschriftenfeldTippsButton({ className }: { className?: string }) {
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
      {open && <AnschriftenfeldTippsModal onClose={() => setOpen(false)} />}
    </>
  );
}

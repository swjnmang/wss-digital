import { useState } from 'react';
import { Lightbulb } from 'lucide-react';
import { TipsPanel } from '../../../components/digitale-bildung/Werkbank';

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
    <div className="bg-canvas border border-line rounded-lg p-3">
      <p className="text-[15px] font-semibold text-ink mb-2">{beispiel.title}</p>
      <div className="border border-dashed border-line-strong rounded-lg p-3 bg-surface font-werkbank-mono">
        <div className="text-[13px] text-ink-soft mb-1">{beispiel.senderLine}</div>
        <div className="border-t border-line-strong my-1" />
        {beispiel.lines.map((line) => (
          <div key={line} className="text-[15px] text-ink">
            {line}
          </div>
        ))}
      </div>
      <p className="text-[13px] text-ink-soft mt-2">{beispiel.note}</p>
    </div>
  );
}

function AnschriftenfeldTippsModal({ onClose }: { onClose: () => void }) {
  return (
    <TipsPanel title="Tipps: Das Anschriftenfeld" onClose={onClose}>
      <div className="flex flex-col gap-5">
          <div className="bg-tool-soft border border-line rounded-lg p-4 text-[15px] text-ink leading-relaxed">
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
            <p className="text-[15px] font-semibold text-ink mb-3">Beispiele</p>
            <div className="grid grid-cols-1  gap-3">
              {BEISPIELE.map((beispiel) => (
                <AnschriftBeispiel key={beispiel.title} beispiel={beispiel} />
              ))}
            </div>
          </div>
        </div>
    </TipsPanel>
  );
}

export function AnschriftenfeldTippsButton({ className, label = 'Tipps' }: { className?: string; label?: string }) {
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
      {open && <AnschriftenfeldTippsModal onClose={() => setOpen(false)} />}
    </>
  );
}

import { InfoBox, PageHead, Tile, TileGrid, WerkbankShell, tipsLightClass } from '../../../components/digitale-bildung/Werkbank';
import { AnschriftenfeldTippsButton } from './AnschriftenfeldTipps';
import { baustein } from './bausteinPfad';

const BASE = '/digitale-bildung/word/geschaeftsbrief/anschriftenfeld';

const levels = [
  { key: '', label: 'Alle Stufen', text: 'Eine beliebige Aufgabe, jedes Mal eine andere.' },
  { key: 'einfach', label: 'Einfach', text: 'Privatpersonen, Unternehmen und Behörden.' },
  { key: 'mittel', label: 'Mittel', text: 'Titel, Berufsbezeichnungen, Postfach und erste Auslandsanschriften.' },
  { key: 'schwer', label: 'Schwer', text: 'Vermerke, Ansprechpartner mit Titel und knifflige Auslandsanschriften.' },
];

export default function AnschriftenfeldTaskSelect() {
  return (
    <WerkbankShell tool="word" tree path={baustein('Anschriftenfeld')}>
      <PageHead title="Anschriftenfeld" intro="Wähle eine Schwierigkeitsstufe. Die Aufgabe wird zufällig ausgewählt.">
        <AnschriftenfeldTippsButton className={tipsLightClass} />
      </PageHead>
      <InfoBox>
        Das Anschriftenfeld ist 40&nbsp;mm hoch, 85&nbsp;mm breit und besteht aus 11&nbsp;Zeilen. Die ersten 5&nbsp;Zeilen
        (Schriftgröße 8&nbsp;pt) bilden die Zusatz- und Vermerkzone. Hier steht ganz oben die Rücksendeangabe. Ab Zeile 6
        beginnt die eigentliche Anschrift (Schriftgröße 11&nbsp;pt).
      </InfoBox>
      <TileGrid>
        {levels.map((level) => (
          <Tile key={level.key} to={`${BASE}${level.key ? `?stufe=${level.key}` : ''}`} title={level.label} text={level.text} meta="Zufällige Übung" />
        ))}
      </TileGrid>
    </WerkbankShell>
  );
}

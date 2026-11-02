import { PageHead, Tile, TileGrid, WerkbankShell } from '../../../components/digitale-bildung/Werkbank';
import { baustein } from './bausteinPfad';

const BASE = '/digitale-bildung/word/geschaeftsbrief';

export default function VollstaendigerBriefFormatSelect() {
  return (
    <WerkbankShell tool="word" tree path={baustein('Vollständiger Geschäftsbrief')}>
      <PageHead title="Vollständiger Geschäftsbrief" intro="Wähle, in welcher Übungsform du den kompletten Brief üben möchtest." />
      <TileGrid>
        <Tile
          to={`${BASE}/vollstaendiger-brief`}
          title="Eingabefelder (Boxen)"
          text="Jedes Element (Anschriftenfeld, Infoblock, Betreff, Anrede, Grußformel) hat ein eigenes, beschriftetes Eingabefeld direkt im Briefbogen."
        />
        <Tile
          to={`${BASE}/vollstaendiger-brief-doc`}
          title="Word-Editor"
          text="Ein echter, frei editierbarer Texteditor wie in Word, ohne vorgegebene Beschriftungen. Du musst selbst erkennen, welche Elemente fehlen und wie sie aufgebaut werden."
        />
      </TileGrid>
    </WerkbankShell>
  );
}

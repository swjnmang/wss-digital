import { PageHead, Tile, TileGrid, WerkbankShell } from '../../../components/digitale-bildung/Werkbank';

const BASE = '/digitale-bildung/word/geschaeftsbrief';

const bausteine = [
  { title: 'Anschriftenfeld', text: 'Herrn/Frau, Titel, Firmen als Anschriftpartner und die Zusatz- und Vermerkzone korrekt eintragen.', to: `${BASE}/anschriftenfeld` },
  { title: 'Infoblock', text: 'Ihr Zeichen, unser Zeichen, Ansprechpartner und Datum richtig aufbauen.', to: `${BASE}/infoblock` },
  { title: 'Grußformel & Unterschrift', text: 'Leerzeilen, Unternehmensname und „i. A.“ korrekt platzieren.', to: `${BASE}/grussformel` },
  { title: 'Aufzählung & Nummerierung', text: 'Leerzeilen, Einzug und Satzzeichen bei Listen nach DIN 5008.', to: `${BASE}/aufzaehlung` },
  {
    title: 'Vollständiger Geschäftsbrief',
    text: 'Alle Bausteine zusammen in einem kompletten Geschäftsbrief üben, wahlweise mit beschrifteten Eingabefeldern oder in einem freien Word-Editor.',
    to: `${BASE}/vollstaendiger-brief-waehlen`,
  },
];

export default function GeschaeftsbriefIndex() {
  return (
    <WerkbankShell
      tool="word"
      tree
      path={[
        { label: 'Digitale Bildung', to: '/digitale-bildung' },
        { label: 'Word', to: '/digitale-bildung/word' },
        { label: 'Geschäftsbrief' },
      ]}
    >
      <PageHead title="Geschäftsbrief nach DIN 5008" intro="Wähle einen Baustein des Geschäftsbriefs aus." />
      <TileGrid>
        {bausteine.map((b, i) => (
          <Tile key={b.to} nr={String(i + 1).padStart(2, '0')} to={b.to} title={b.title} text={b.text} />
        ))}
      </TileGrid>
    </WerkbankShell>
  );
}

import { PageHead, Tile, TileGrid, WerkbankShell } from '../../../components/digitale-bildung/Werkbank';

export default function WordIndex() {
  return (
    <WerkbankShell tool="word" tree path={[{ label: 'Digitale Bildung', to: '/digitale-bildung' }, { label: 'Word' }]}>
      <PageHead title="Word" intro="Wähle ein Thema aus." />
      <TileGrid>
        <Tile
          to="/digitale-bildung/word/geschaeftsbrief"
          title="Geschäftsbrief nach DIN 5008"
          text="Aufbau, Anschriftenfeld, Aufzählungen und Tabellen im Geschäftsbrief, Schritt für Schritt."
        />
        <Tile
          to="/digitale-bildung/word/layout"
          title="Layouten mit Word"
          text="Text gestalten: Schriftart und -größe, Farben, Ausrichtung, Überschriften, Listen und Tabellen."
        />
      </TileGrid>
    </WerkbankShell>
  );
}

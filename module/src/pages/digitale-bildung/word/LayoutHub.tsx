import { PageHead, Tile, TileGrid, WerkbankShell } from '../../../components/digitale-bildung/Werkbank';
import { ARBEITSAUFTRAEGE } from '../../../lib/word-layout/arbeitsauftraege';
import { LAYOUT_TASKS } from '../../../lib/word-layout/tasks';

export default function LayoutHub() {
  return (
    <WerkbankShell
      tool="word"
      tree
      path={[
        { label: 'Digitale Bildung', to: '/digitale-bildung' },
        { label: 'Word', to: '/digitale-bildung/word' },
        { label: 'Layouten' },
      ]}
    >
      <PageHead title="Layouten mit Word" intro="Wie möchtest du üben?" />
      <TileGrid>
        <Tile
          to="/digitale-bildung/word/layout/arbeitsauftraege"
          title="Arbeitsaufträge für Word"
          text="Gestalte vorgegebene Texte direkt in Microsoft Word. Vorlage herunterladen, Schritt für Schritt bearbeiten und am Ende mit der Lösung vergleichen."
          meta={`${ARBEITSAUFTRAEGE.length} Arbeitsaufträge · Vorlage & Lösung`}
        />
        <Tile
          to="/digitale-bildung/word/layout/uebungen"
          title="Digitale Übungen"
          text="Üben direkt im Browser, ohne Word. Mit „Prüfen“ siehst du sofort, welche Vorgaben du schon erfüllt hast."
          meta={`${LAYOUT_TASKS.length} Übungen · automatische Prüfung`}
        />
      </TileGrid>
    </WerkbankShell>
  );
}

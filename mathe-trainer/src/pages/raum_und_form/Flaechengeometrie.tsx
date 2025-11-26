import GeometryTaskPage from '../../components/geometry/GeometryTaskPage';
import { generateSurfaceTask } from '../../utils/geometryGenerators';

export default function Flaechengeometrie() {
  return (
    <GeometryTaskPage
      title="Raum & Form · Flächengeometrie"
      subtitle="Trainiere die klassischen Formeln für Rechtecke, Dreiecke, Trapeze und Kreise mit praxisnahen Kontexten."
      description="Jede Karte liefert zufällige Maße und verlangt, dass du die Fläche exakt mit den passenden Einheiten berechnest."
      generator={generateSurfaceTask}
      theme="coral"
      badgeLabel="Fläche"
    />
  );
}

import GeometryTaskPage from '../../components/geometry/GeometryTaskPage';
import { generatePyramidTask } from '../../utils/geometryGenerators';

export default function Pyramide() {
  return (
    <GeometryTaskPage
      title="Raum & Form · Pyramide"
      subtitle="Berechne Volumina von Glas- und Holzpyramiden, indem du Grundfläche und Höhe geschickt kombinierst."
      description="Ideal zur Vorbereitung auf Anwendungen in Architektur oder Produktdesign, inklusive ausführlichem Rechenweg."
      generator={generatePyramidTask}
      theme="violet"
      badgeLabel="Pyramide"
    />
  );
}

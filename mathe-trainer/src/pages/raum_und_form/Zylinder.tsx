import GeometryTaskPage from '../../components/geometry/GeometryTaskPage';
import { generateCylinderTask } from '../../utils/geometryGenerators';

export default function Zylinder() {
  return (
    <GeometryTaskPage
      title="Raum & Form · Zylinder"
      subtitle="Wechsle zwischen Oberflächen- und Volumenaufgaben für Tanks, Dosen oder Displays."
      description="Alle Maße werden zufällig generiert, damit du Formeln sicher umstellen und präzise runden lernst."
      generator={generateCylinderTask}
      theme="cyan"
      badgeLabel="Zylinder"
    />
  );
}

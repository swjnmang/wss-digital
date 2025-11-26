import GeometryTaskPage from '../../components/geometry/GeometryTaskPage';
import { generateSphereTask } from '../../utils/geometryGenerators';

export default function Kugel() {
  return (
    <GeometryTaskPage
      title="Raum & Form · Kugel"
      subtitle="Wechsle zwischen Volumen- und Oberflächenberechnungen für kugelförmige Bauteile."
      description="Die Aufgaben liefern dir zufällige Radien in cm, damit du Produktions- oder Designprozesse realitätsnah durchrechnen kannst."
      generator={generateSphereTask}
      theme="emerald"
      badgeLabel="Kugel"
    />
  );
}

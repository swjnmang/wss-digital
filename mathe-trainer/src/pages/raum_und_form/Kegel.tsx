import GeometryTaskPage from '../../components/geometry/GeometryTaskPage';
import { generateConeTask } from '../../utils/geometryGenerators';

export default function Kegel() {
  return (
    <GeometryTaskPage
      title="Raum & Form · Kegel"
      subtitle="Übe Mantel- und Volumenberechnungen an konischen Körpern wie Trichtern oder Werbekegeln."
      description="Die Generatoren mischen Radius, Höhe und Mantellinie – du entscheidest, ob du Oberfläche oder Volumen brauchst."
      generator={generateConeTask}
      theme="amber"
      badgeLabel="Kegel"
    />
  );
}

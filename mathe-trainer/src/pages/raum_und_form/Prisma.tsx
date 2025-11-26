import GeometryTaskPage from '../../components/geometry/GeometryTaskPage';
import { generatePrismTask } from '../../utils/geometryGenerators';

export default function Prisma() {
  return (
    <GeometryTaskPage
      title="Raum & Form · Prisma"
      subtitle="Vom Quader bis zum Dreiecksprisma: berechne Volumina für Verpackungen und Leichtbau."
      description="Die Aufgaben wechseln zwischen rechteckigen und dreieckigen Grundflächen und führen dich Schritt für Schritt durch den Lösungsweg."
      generator={generatePrismTask}
      theme="emerald"
      badgeLabel="Prisma"
    />
  );
}

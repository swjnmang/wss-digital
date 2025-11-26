import GeometryTaskPage from '../../components/geometry/GeometryTaskPage';
import { generatePythagorasTask } from '../../utils/geometryGenerators';

export default function SatzDesPythagoras() {
  return (
    <GeometryTaskPage
      title="Raum & Form · Satz des Pythagoras"
      subtitle="Berechne fehlende Seitenlängen in rechtwinkligen Dreiecken und sichere dir Routine für Konstruktionen und Auflager." 
      description="Mal suchst du die Hypotenuse, mal eine Kathete. Die Generatoren liefern abwechslungsreiche Maße in cm, damit du den Satz sicher anwenden kannst."
      generator={generatePythagorasTask}
      theme="indigo"
      badgeLabel="Dreiecke"
    />
  );
}

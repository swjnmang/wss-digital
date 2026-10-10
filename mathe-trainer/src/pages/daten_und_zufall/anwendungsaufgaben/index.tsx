import MenuPage, { type MenuItem } from '../../../components/layout/MenuPage';

export const tasks: MenuItem[] = [
  { title: '1. Die Mensa-Umfrage', desc: 'Zweistufiges Baumdiagramm zum Mensa-Essen, Pfad- und Summenregel sowie Kennwerte des Getränkeverkaufs.', path: '/daten-und-zufall/anwendungsaufgaben/mensa-umfrage', icon: 'fa-solid fa-utensils' },
  { title: '2. Die Ticketkontrolle', desc: 'Dreistufiges Baumdiagramm ohne Zurücklegen, Schwarzfahrer-Statistik und Fahrgastzählung mit Häufigkeiten.', path: '/daten-und-zufall/anwendungsaufgaben/ticketkontrolle', icon: 'fa-solid fa-bus' },
  { title: '3. Das Elfmeterschießen', desc: 'Relative Häufigkeit, Kennwerte der Zuschauerzahlen und dreistufiges Baumdiagramm mit konstanter Trefferquote.', path: '/daten-und-zufall/anwendungsaufgaben/elfmeterschiessen', icon: 'fa-solid fa-futbol' },
  { title: '4. Das Sommerfest', desc: 'Kreuztabelle mit Kreisdiagramm, Tombola-Baumdiagramm ohne Zurücklegen sowie Kennwerte und Diagrammkritik.', path: '/daten-und-zufall/anwendungsaufgaben/sommerfest', icon: 'fa-solid fa-ticket' },
  { title: '5. Die Fahrradstation', desc: 'Balkendiagramm, dreiästiges Baumdiagramm mit Zurücklegen, Kennwerte der Mietdauer und Kritik am Mittelwert.', path: '/daten-und-zufall/anwendungsaufgaben/fahrradstation', icon: 'fa-solid fa-bicycle' },
  { title: '6. Die Bio-Kiste', desc: 'Kreisdiagramm, Baumdiagramm ohne Zurücklegen mit drei Sorten, Kennwerte des Gewichts und kritische Werbeaussage.', path: '/daten-und-zufall/anwendungsaufgaben/bio-kiste', icon: 'fa-solid fa-basket-shopping' },
];

export default function DatenZufallAnwendungsaufgaben() {
  return <MenuPage title="Anwendungsaufgaben" subtitle="Prüfungsnahe Aufgaben zu Daten und Zufall – wähle eine Aufgabe aus, um sie Schritt für Schritt zu bearbeiten." items={tasks} />;
}

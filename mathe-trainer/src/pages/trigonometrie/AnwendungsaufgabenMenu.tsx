import MenuPage, { type MenuItem } from '../../components/layout/MenuPage';

export const tasks: MenuItem[] = [
  { title: 'Olympiapark München', desc: 'Hängebrücke, Flying-Fox und Dreiecksberechnungen rund um den Olympiasee.', path: '/trigonometrie/anwendungsaufgaben/olympiapark-muenchen', icon: 'fa-solid fa-person-falling' },
  { title: 'Stadionneubau', desc: 'Steigung, Dachneigung und Flutlicht rund um einen Stadionquerschnitt.', path: '/trigonometrie/anwendungsaufgaben/stadion', icon: 'fa-solid fa-futbol' },
  { title: 'Das Fußballfeld', desc: 'Winkel, Flächen und Passwege zwischen Spielern auf dem Fußballfeld berechnen.', path: '/trigonometrie/anwendungsaufgaben/fussballfeld', icon: 'fa-solid fa-futbol' },
  { title: 'Die Bergbahn', desc: 'Steigung, Seillängen und Pistenwinkel einer Seilbahn im Skigebiet berechnen.', path: '/trigonometrie/anwendungsaufgaben/bergbahn', icon: 'fa-solid fa-mountain' },
];

export default function AnwendungsaufgabenMenu() {
  return <MenuPage title="Anwendungsaufgaben" subtitle="Wähle eine Aufgabe aus, um sie Schritt für Schritt zu bearbeiten." items={tasks} />;
}

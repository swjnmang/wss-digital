import MenuPage, { type MenuItem } from '../../components/layout/MenuPage';

export const tasks: MenuItem[] = [
  { title: 'Olympiapark München', desc: 'Hängebrücke, Flying-Fox und Dreiecksberechnungen rund um den Olympiasee.', path: '/trigonometrie/anwendungsaufgaben/olympiapark-muenchen', icon: 'fa-solid fa-person-falling' },
  { title: 'Stadionneubau', desc: 'Steigung, Dachneigung und Flutlicht rund um einen Stadionquerschnitt.', path: '/trigonometrie/anwendungsaufgaben/stadion', icon: 'fa-solid fa-futbol' },
  { title: 'Das Fußballfeld', desc: 'Winkel, Flächen und Passwege zwischen Spielern auf dem Fußballfeld berechnen.', path: '/trigonometrie/anwendungsaufgaben/fussballfeld', icon: 'fa-solid fa-futbol' },
  { title: 'Die Bergbahn', desc: 'Steigung, Seillängen und Pistenwinkel einer Seilbahn im Skigebiet berechnen.', path: '/trigonometrie/anwendungsaufgaben/bergbahn', icon: 'fa-solid fa-mountain' },
  { title: 'Der Strommast', desc: 'Stangenlängen, Strebe und Werbefläche an einem rostigen Strommast berechnen.', path: '/trigonometrie/anwendungsaufgaben/strommast', icon: 'fa-solid fa-bolt' },
  { title: 'Das Baugerüst', desc: 'Querstreben, Logo-Fläche und Abspannseile eines Gerüsts am Hang berechnen.', path: '/trigonometrie/anwendungsaufgaben/baugeruest', icon: 'fa-solid fa-helmet-safety' },
  { title: 'Der Badesee', desc: 'Entfernungen, Blickwinkel und den Nichtschwimmerbereich auf einem See berechnen.', path: '/trigonometrie/anwendungsaufgaben/badesee', icon: 'fa-solid fa-person-swimming' },
  { title: 'Das Fachwerkhaus', desc: 'Balkenlängen, Glasfläche und Dachneigung einer Fachwerkfassade berechnen.', path: '/trigonometrie/anwendungsaufgaben/fachwerkhaus', icon: 'fa-solid fa-house' },
];

export default function AnwendungsaufgabenMenu() {
  return <MenuPage title="Anwendungsaufgaben" subtitle="Wähle eine Aufgabe aus, um sie Schritt für Schritt zu bearbeiten." items={tasks} />;
}

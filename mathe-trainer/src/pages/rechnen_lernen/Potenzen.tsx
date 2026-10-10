import MenuPage, { type MenuItem } from '../../components/layout/MenuPage';

export const aufgaben: MenuItem[] = [
  { title: '1. Schreibweise und Grundlagen', desc: 'Lerne die Grundlagen der Potenzschreibweise und einfache Berechnungen.', path: '/rechnen_lernen/potenzen/schreibweise' },
  { title: '2. Zehnerpotenzen', desc: 'Übungen zur wissenschaftlichen Schreibweise und zum Rechnen mit Zehnerpotenzen.', path: '/rechnen_lernen/potenzen/zehnerpotenzen', icon: 'fa-solid fa-superscript' },
  { title: '3. Addieren und Subtrahieren', desc: 'Übe das Addieren und Subtrahieren von Potenzen mit gleicher Basis.', path: '/rechnen_lernen/potenzen/addierensubtrahieren', icon: 'fa-solid fa-plus-minus' },
  { title: '4. Multiplizieren und Dividieren', desc: 'Wende die Potenzgesetze für die Multiplikation und Division an.', path: '/rechnen_lernen/potenzen/multiplizierendividieren', icon: 'fa-solid fa-xmark' },
  { title: '5. Potenzieren von Potenzen', desc: 'Lerne, wie Potenzen potenziert werden und wende das Gesetz an.', path: '/rechnen_lernen/potenzen/potenzieren', icon: 'fa-solid fa-layer-group' },
  { title: '6. Gemischte Aufgaben', desc: 'Wende alle Potenzgesetze in gemischten Aufgaben an.', path: '/rechnen_lernen/potenzen/gemischt', icon: 'fa-solid fa-shuffle' },
];

export default function Potenzen() {
  return <MenuPage title="Potenzrechnung" items={aufgaben} />;
}

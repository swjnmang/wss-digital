import MenuPage, { type MenuItem } from '../../components/layout/MenuPage';

export const aufgaben: MenuItem[] = [
  { title: '1. Kürzen und Erweitern', desc: 'Grundlagen der Bruchrechnung: Lerne, Brüche zu kürzen und zu erweitern.', path: '/rechnen_lernen/brueche/kuerzenerweitern' },
  { title: '2. Addieren und Subtrahieren', desc: 'Übe das Addieren und Subtrahieren von Brüchen mit gleichen und ungleichen Nennern.', path: '/rechnen_lernen/brueche/addierensubtrahieren', icon: 'fa-solid fa-plus-minus' },
  { title: '3. Multiplizieren und Dividieren', desc: 'Verstehe und übe die Multiplikation und Division von Brüchen.', path: '/rechnen_lernen/brueche/multiplizierendividieren', icon: 'fa-solid fa-xmark' },
  { title: '4. Gemischte Aufgaben', desc: 'Wende alle Rechenarten in gemischten Aufgaben zur Bruchrechnung an.', path: '/rechnen_lernen/brueche/gemischt', icon: 'fa-solid fa-shuffle' },
];

export default function Brueche() {
  return <MenuPage title="Bruchrechnung" items={aufgaben} />;
}

import MenuPage, { type MenuItem } from '../../components/layout/MenuPage';

export const aufgaben: MenuItem[] = [
  { title: '1. Lineare Gleichungen', desc: 'Übe das Lösen von linearen Gleichungen mit einer Unbekannten.', path: '/rechnen_lernen/gleichungen/generator_lineare' },
  { title: '2. Quadratische Gleichungen', desc: 'Lerne verschiedene Methoden zum Lösen von quadratischen Gleichungen.', path: '/rechnen_lernen/gleichungen/quadratisch', icon: 'fa-solid fa-superscript' },
  { title: '3. Bruchgleichungen', desc: 'Löse Bruchgleichungen der Form A = X/B und B = A/X.', path: '/rechnen_lernen/gleichungen/bruchgleichungen', icon: 'fa-solid fa-divide' },
  { title: '4. Abschlusstest', desc: 'Teste dein Wissen im Lösen von linearen und quadratischen Gleichungen.', path: '/rechnen_lernen/gleichungen/abschlusstest', icon: 'fa-solid fa-graduation-cap' },
];

export default function Gleichungen() {
  return <MenuPage title="Gleichungen lösen" items={aufgaben} />;
}

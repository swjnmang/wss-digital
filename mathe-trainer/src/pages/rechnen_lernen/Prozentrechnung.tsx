import MenuPage, { type MenuItem } from '../../components/layout/MenuPage';

export const aufgaben: MenuItem[] = [
  { title: '1. Grundlagen der Prozentrechnung', desc: 'Lerne die Basics: Prozentwert, Prozentsatz und Grundwert berechnen.', path: '/rechnen_lernen/prozentrechnung/prozentrechnung' },
  { title: '2. Bezugskalkulation', desc: 'Berechne den Bezugs- oder Einstandspreis von Waren.', path: '/rechnen_lernen/prozentrechnung/bezugskalkulation', icon: 'fa-solid fa-truck' },
  { title: '3. Handelskalkulation (Vorwärts)', desc: 'Kalkuliere den Verkaufspreis vom Listeneinkaufspreis ausgehend.', path: '/rechnen_lernen/prozentrechnung/handelskalkvw', icon: 'fa-solid fa-arrow-right' },
  { title: '4. Handelskalkulation (Rückwärts)', desc: 'Ermittle den maximalen Listeneinkaufspreis vom Verkaufspreis.', path: '/rechnen_lernen/prozentrechnung/handelskalkrw', icon: 'fa-solid fa-arrow-left' },
  { title: '5. Handelskalkulation (Differenz)', desc: 'Berechne Gewinn, Handelsspanne und andere Kennzahlen.', path: '/rechnen_lernen/prozentrechnung/handelskalkdif', icon: 'fa-solid fa-scale-balanced' },
];

export default function Prozentrechnung() {
  return <MenuPage title="Prozentrechnung & Kalkulation" items={aufgaben} />;
}

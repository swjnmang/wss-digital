import MenuPage, { type MenuItem } from '../../components/layout/MenuPage';

const aufgaben: MenuItem[] = [
  { title: '1. Terme ohne Variablen', desc: 'Berechne den Wert von Termen, die nur aus Zahlen bestehen.', path: '/rechnen_lernen/terme/ohnevariablen', icon: 'fa-solid fa-calculator' },
  { title: '2. Terme mit Variablen', desc: 'Lerne, gleichartige Terme mit Variablen zusammenzufassen.', path: '/rechnen_lernen/terme/zusammenfassen', icon: 'fa-solid fa-layer-group' },
  { title: '3. Terme mit Potenzen', desc: 'Fasse Terme zusammen, die auch Potenzen enthalten. Lerne Potenzregeln!', path: '/rechnen_lernen/terme/mitpotenzen', icon: 'fa-solid fa-superscript' },
];

export default function Terme() {
  return <MenuPage title="Terme" items={aufgaben} />;
}

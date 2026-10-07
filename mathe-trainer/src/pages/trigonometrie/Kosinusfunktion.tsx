import Practice from './engine/Practice';
import { circleConfig } from './engine/unitCircle';

export const cfg = circleConfig('cos');

export default function Kosinusfunktion() {
  return <Practice cfg={cfg} />;
}

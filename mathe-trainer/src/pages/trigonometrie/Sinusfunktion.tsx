import Practice from './engine/Practice';
import { circleConfig } from './engine/unitCircle';

export const cfg = circleConfig('sin');

export default function Sinusfunktion() {
  return <Practice cfg={cfg} />;
}

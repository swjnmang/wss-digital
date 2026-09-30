import { useState } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { pickRandomAnschriftenfeldTask } from '../../../lib/geschaeftsbrief/anschriftenfeld-random';
import type { AnschriftenfeldTask } from '../../../lib/geschaeftsbrief/types';

/** Leitet auf eine zufällige Anschriftenfeld-Aufgabe weiter (optional gefiltert mit ?stufe=einfach|mittel|schwer). */
export default function AnschriftenfeldRandom() {
  const [params] = useSearchParams();
  const stufe = params.get('stufe');
  const difficulty =
    stufe === 'einfach' || stufe === 'mittel' || stufe === 'schwer'
      ? (stufe as AnschriftenfeldTask['difficulty'])
      : undefined;
  const [taskId] = useState(() => pickRandomAnschriftenfeldTask({ difficulty }).id);
  return <Navigate to={`/digitale-bildung/word/geschaeftsbrief/anschriftenfeld/${taskId}`} replace />;
}

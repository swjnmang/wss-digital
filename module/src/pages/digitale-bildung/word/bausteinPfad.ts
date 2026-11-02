import type { Crumb } from '../../../components/digitale-bildung/Werkbank';

/** Pfad für alle Seiten unterhalb des Geschäftsbriefs. */
export const baustein = (label: string): Crumb[] => [
  { label: 'Digitale Bildung', to: '/digitale-bildung' },
  { label: 'Word', to: '/digitale-bildung/word' },
  { label: 'Geschäftsbrief', to: '/digitale-bildung/word/geschaeftsbrief' },
  { label },
];

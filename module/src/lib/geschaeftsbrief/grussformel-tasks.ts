import type { GrussformelTask } from './grussformel-types';

export const GRUSSFORMEL_TASKS: GrussformelTask[] = [
  {
    id: 'radwelt-sturm',
    title: 'Radwelt Sturm: Chefin unterschreibt selbst',
    difficulty: 'einfach',
    scenario:
      'Der Brief wird direkt von der Geschäftsführerin Petra Sturm unterschrieben – sie hat niemanden beauftragt, für sie zu schreiben.',
    facts: ['Branche: Fahrradzubehör', 'Firma: Radwelt Sturm GmbH', 'Unterzeichnerin: Petra Sturm (unterschreibt selbst)'],
    lines: [
      {
        type: 'choice',
        id: 'gruss',
        caption: 'Grußformel',
        options: [
          { id: 'a', text: 'Mit freundlichen Grüßen', correct: false },
          { id: 'b', text: 'Viele Grüße', correct: false },
          { id: 'c', text: 'Freundliche Grüße', correct: true },
        ],
        explanation: 'Der Geschäftsbrief endet mit der Grußformel „Freundliche Grüße“.',
      },
      {
        type: 'choice',
        id: 'branche',
        caption: 'Zeile nach der Leerzeile: Unternehmensbranche',
        options: [
          { id: 'a', text: 'Radwelt Sturm GmbH', correct: false },
          { id: 'b', text: 'Petra Sturm', correct: false },
          { id: 'c', text: 'Fahrradzubehör', correct: true },
        ],
        explanation: 'Nach einer Leerzeile folgt zunächst die Unternehmensbranche.',
      },
      {
        type: 'choice',
        id: 'firma',
        caption: 'Nächste Zeile: Firmenname',
        options: [
          { id: 'a', text: 'Radwelt Sturm', correct: false },
          { id: 'b', text: 'Petra Sturm', correct: false },
          { id: 'c', text: 'Radwelt Sturm GmbH', correct: true },
        ],
        explanation: 'Direkt darunter steht der vollständige Unternehmensname.',
      },
      {
        type: 'choice',
        id: 'leerzeilen',
        caption: 'Anzahl der Leerzeilen für die Unterschrift',
        options: [
          { id: 'a', text: '2', correct: false },
          { id: 'b', text: '4', correct: false },
          { id: 'c', text: '3', correct: true },
        ],
        explanation: 'Für die handschriftliche Unterschrift werden exakt drei Leerzeilen freigelassen.',
      },
      {
        type: 'choice',
        id: 'name',
        caption: 'Gedruckter Name nach den drei Leerzeilen',
        options: [
          { id: 'a', text: 'i. A. Petra Sturm', correct: false },
          { id: 'b', text: 'P. Sturm', correct: false },
          { id: 'c', text: 'Petra Sturm', correct: true },
        ],
        explanation:
          'Unterschreibt die Person selbst, wird nach den drei Leerzeilen einfach der vollständige Name gedruckt – ohne „i. A.“',
      },
    ],
  },
  {
    id: 'moebelfabrik-jordan-gruss',
    title: 'Möbelfabrik Jordan: „i. A.“ vor dem Namen',
    difficulty: 'einfach',
    scenario:
      'Hans Schuster schreibt den Brief im Auftrag seines Vorgesetzten Werner Volk. „i. A.“ soll direkt vor dem gedruckten Namen stehen.',
    facts: [
      'Branche: Möbelherstellung',
      'Firma: MÖBELFABRIK Peter Jordan GmbH',
      'Verfasser: Hans Schuster (schreibt im Auftrag von Werner Volk)',
    ],
    lines: [
      {
        type: 'choice',
        id: 'gruss',
        caption: 'Grußformel',
        options: [
          { id: 'a', text: 'Mit freundlichen Grüßen', correct: false },
          { id: 'b', text: 'Freundliche Grüße', correct: true },
          { id: 'c', text: 'Beste Grüße', correct: false },
        ],
        explanation: 'Der Geschäftsbrief endet mit der Grußformel „Freundliche Grüße“.',
      },
      {
        type: 'choice',
        id: 'branche',
        caption: 'Zeile nach der Leerzeile: Unternehmensbranche',
        options: [
          { id: 'a', text: 'MÖBELFABRIK Peter Jordan GmbH', correct: false },
          { id: 'b', text: 'Werner Volk', correct: false },
          { id: 'c', text: 'Möbelherstellung', correct: true },
        ],
        explanation: 'Nach einer Leerzeile folgt zunächst die Unternehmensbranche.',
      },
      {
        type: 'choice',
        id: 'firma',
        caption: 'Nächste Zeile: Firmenname',
        options: [
          { id: 'a', text: 'Peter Jordan', correct: false },
          { id: 'b', text: 'MÖBELFABRIK Peter Jordan GmbH', correct: true },
          { id: 'c', text: 'Möbelfabrik', correct: false },
        ],
        explanation: 'Direkt darunter steht der vollständige Unternehmensname.',
      },
      {
        type: 'choice',
        id: 'leerzeilen',
        caption: 'Anzahl der Leerzeilen für die Unterschrift',
        options: [
          { id: 'a', text: '3', correct: true },
          { id: 'b', text: '1', correct: false },
          { id: 'c', text: '2', correct: false },
        ],
        explanation: 'Für die handschriftliche Unterschrift werden exakt drei Leerzeilen freigelassen.',
      },
      {
        type: 'choice',
        id: 'name',
        caption: 'Gedruckter Name nach den drei Leerzeilen',
        options: [
          { id: 'a', text: 'Hans Schuster i. A.', correct: false },
          { id: 'b', text: 'Hans Schuster', correct: false },
          { id: 'c', text: 'i. A. Hans Schuster', correct: true },
        ],
        explanation:
          'Wird der Brief im Auftrag verfasst, kann „i. A.“ direkt vor dem gedruckten Namen stehen: „i. A. Hans Schuster“.',
      },
    ],
  },
  {
    id: 'kern-verpackungstechnik-gruss',
    title: 'Kern Verpackungstechnik: „i. A.“ in der Leerzeile',
    difficulty: 'mittel',
    scenario:
      'Anna Berg schreibt im Auftrag ihrer Vorgesetzten Julia Kern. Diesmal soll „i. A.“ nicht vor dem Namen stehen, sondern allein in der mittleren der drei Leerzeilen.',
    facts: [
      'Branche: Verpackungstechnik',
      'Firma: Kern Verpackungstechnik e. K.',
      'Verfasserin: Anna Berg (schreibt im Auftrag von Julia Kern)',
    ],
    lines: [
      {
        type: 'choice',
        id: 'gruss',
        caption: 'Grußformel',
        options: [
          { id: 'a', text: 'Viele Grüße', correct: false },
          { id: 'b', text: 'Mit freundlichen Grüßen', correct: false },
          { id: 'c', text: 'Freundliche Grüße', correct: true },
        ],
        explanation: 'Der Geschäftsbrief endet mit der Grußformel „Freundliche Grüße“.',
      },
      {
        type: 'choice',
        id: 'branche',
        caption: 'Zeile nach der Leerzeile: Unternehmensbranche',
        options: [
          { id: 'a', text: 'Kern Verpackungstechnik e. K.', correct: false },
          { id: 'b', text: 'Verpackungstechnik', correct: true },
          { id: 'c', text: 'Julia Kern', correct: false },
        ],
        explanation: 'Nach einer Leerzeile folgt zunächst die Unternehmensbranche.',
      },
      {
        type: 'choice',
        id: 'firma',
        caption: 'Nächste Zeile: Firmenname',
        options: [
          { id: 'a', text: 'Kern Verpackungstechnik e. K.', correct: true },
          { id: 'b', text: 'Verpackungstechnik Kern', correct: false },
          { id: 'c', text: 'Kern GmbH', correct: false },
        ],
        explanation: 'Direkt darunter steht der vollständige Unternehmensname.',
      },
      {
        type: 'choice',
        id: 'mittlere-leerzeile',
        caption: 'Was steht in der mittleren der drei Leerzeilen?',
        options: [
          { id: 'a', text: 'nichts, sie bleibt leer', correct: false },
          { id: 'b', text: 'der Firmenname noch einmal', correct: false },
          { id: 'c', text: 'i. A.', correct: true },
        ],
        explanation:
          '„i. A.“ kann alternativ allein in die mittlere der drei Leerzeilen geschrieben werden – dann bleibt der Name ohne Zusatz.',
      },
      {
        type: 'choice',
        id: 'name',
        caption: 'Gedruckter Name nach den drei Leerzeilen',
        options: [
          { id: 'a', text: 'i. A. Anna Berg', correct: false },
          { id: 'b', text: 'Anna Berg i. A.', correct: false },
          { id: 'c', text: 'Anna Berg', correct: true },
        ],
        explanation: 'Steht „i. A.“ bereits in der mittleren Leerzeile, wird der Name ohne Zusatz gedruckt.',
      },
    ],
  },
  {
    id: 'gartenwelt-lang-gruss',
    title: 'Gartenwelt Lang: Chef unterschreibt selbst',
    difficulty: 'einfach',
    scenario: 'Der Brief wird direkt vom Inhaber Peter Lang unterschrieben – ohne Auftrag an eine andere Person.',
    facts: ['Branche: Gartenbau', 'Firma: Gartenwelt Lang GmbH', 'Unterzeichner: Peter Lang (unterschreibt selbst)'],
    lines: [
      {
        type: 'choice',
        id: 'gruss',
        caption: 'Grußformel',
        options: [
          { id: 'a', text: 'Freundliche Grüße', correct: true },
          { id: 'b', text: 'Mit freundlichen Grüßen', correct: false },
          { id: 'c', text: 'Herzliche Grüße', correct: false },
        ],
        explanation: 'Der Geschäftsbrief endet mit der Grußformel „Freundliche Grüße“.',
      },
      {
        type: 'choice',
        id: 'branche',
        caption: 'Zeile nach der Leerzeile: Unternehmensbranche',
        options: [
          { id: 'a', text: 'Gartenwelt Lang GmbH', correct: false },
          { id: 'b', text: 'Peter Lang', correct: false },
          { id: 'c', text: 'Gartenbau', correct: true },
        ],
        explanation: 'Nach einer Leerzeile folgt zunächst die Unternehmensbranche.',
      },
      {
        type: 'choice',
        id: 'firma',
        caption: 'Nächste Zeile: Firmenname',
        options: [
          { id: 'a', text: 'Gartenwelt Lang GmbH', correct: true },
          { id: 'b', text: 'Gartenwelt Lang', correct: false },
          { id: 'c', text: 'Lang GmbH', correct: false },
        ],
        explanation: 'Direkt darunter steht der vollständige Unternehmensname.',
      },
      {
        type: 'choice',
        id: 'leerzeilen',
        caption: 'Anzahl der Leerzeilen für die Unterschrift',
        options: [
          { id: 'a', text: '4', correct: false },
          { id: 'b', text: '3', correct: true },
          { id: 'c', text: '2', correct: false },
        ],
        explanation: 'Für die handschriftliche Unterschrift werden exakt drei Leerzeilen freigelassen.',
      },
      {
        type: 'choice',
        id: 'name',
        caption: 'Gedruckter Name nach den drei Leerzeilen',
        options: [
          { id: 'a', text: 'P. Lang', correct: false },
          { id: 'b', text: 'i. A. Peter Lang', correct: false },
          { id: 'c', text: 'Peter Lang', correct: true },
        ],
        explanation:
          'Unterschreibt die Person selbst, wird nach den drei Leerzeilen einfach der vollständige Name gedruckt – ohne „i. A.“',
      },
    ],
  },
  {
    id: 'it-service-neumann-gruss',
    title: 'IT-Service Neumann: „i. A.“ mit Titel',
    difficulty: 'mittel',
    scenario:
      'Dr. Lisa Kern schreibt im Auftrag ihres Vorgesetzten Dr. Michael Ostermann. „i. A.“ soll direkt vor ihrem gedruckten Namen stehen.',
    facts: [
      'Branche: IT-Dienstleistungen',
      'Firma: IT-Service Neumann GmbH',
      'Verfasserin: Dr. Lisa Kern (schreibt im Auftrag von Dr. Michael Ostermann)',
    ],
    lines: [
      {
        type: 'choice',
        id: 'gruss',
        caption: 'Grußformel',
        options: [
          { id: 'a', text: 'Mit freundlichen Grüßen', correct: false },
          { id: 'b', text: 'Beste Grüße', correct: false },
          { id: 'c', text: 'Freundliche Grüße', correct: true },
        ],
        explanation: 'Der Geschäftsbrief endet mit der Grußformel „Freundliche Grüße“.',
      },
      {
        type: 'choice',
        id: 'branche',
        caption: 'Zeile nach der Leerzeile: Unternehmensbranche',
        options: [
          { id: 'a', text: 'IT-Service Neumann GmbH', correct: false },
          { id: 'b', text: 'IT-Dienstleistungen', correct: true },
          { id: 'c', text: 'Dr. Michael Ostermann', correct: false },
        ],
        explanation: 'Nach einer Leerzeile folgt zunächst die Unternehmensbranche.',
      },
      {
        type: 'choice',
        id: 'firma',
        caption: 'Nächste Zeile: Firmenname',
        options: [
          { id: 'a', text: 'IT-Service Neumann', correct: false },
          { id: 'b', text: 'Neumann GmbH', correct: false },
          { id: 'c', text: 'IT-Service Neumann GmbH', correct: true },
        ],
        explanation: 'Direkt darunter steht der vollständige Unternehmensname.',
      },
      {
        type: 'choice',
        id: 'leerzeilen',
        caption: 'Anzahl der Leerzeilen für die Unterschrift',
        options: [
          { id: 'a', text: '3', correct: true },
          { id: 'b', text: '2', correct: false },
          { id: 'c', text: '4', correct: false },
        ],
        explanation: 'Für die handschriftliche Unterschrift werden exakt drei Leerzeilen freigelassen.',
      },
      {
        type: 'choice',
        id: 'name',
        caption: 'Gedruckter Name nach den drei Leerzeilen',
        options: [
          { id: 'a', text: 'i. A. Dr. Lisa Kern', correct: true },
          { id: 'b', text: 'Dr. i. A. Lisa Kern', correct: false },
          { id: 'c', text: 'Lisa Kern i. A.', correct: false },
        ],
        explanation:
          '„i. A.“ steht direkt vor dem vollständigen gedruckten Namen (inklusive Titel): „i. A. Dr. Lisa Kern“.',
      },
    ],
  },
  {
    id: 'spedition-hartmann-gruss',
    title: 'Spedition Hartmann: „i. A.“ mit Titel in der Leerzeile',
    difficulty: 'schwer',
    scenario:
      'Dr. Tom Weber schreibt im Auftrag seines Vorgesetzten Frank Hartmann. „i. A.“ soll diesmal allein in der mittleren der drei Leerzeilen stehen.',
    facts: [
      'Branche: Speditionswesen',
      'Firma: Spedition Hartmann GmbH & Co. KG',
      'Verfasser: Dr. Tom Weber (schreibt im Auftrag von Frank Hartmann)',
    ],
    lines: [
      {
        type: 'choice',
        id: 'gruss',
        caption: 'Grußformel',
        options: [
          { id: 'a', text: 'Mit freundlichen Grüßen', correct: false },
          { id: 'b', text: 'Freundliche Grüße', correct: true },
          { id: 'c', text: 'Freundliche Grüsse', correct: false },
        ],
        explanation: 'Der Geschäftsbrief endet mit der Grußformel „Freundliche Grüße“.',
      },
      {
        type: 'choice',
        id: 'branche',
        caption: 'Zeile nach der Leerzeile: Unternehmensbranche',
        options: [
          { id: 'a', text: 'Spedition Hartmann GmbH & Co. KG', correct: false },
          { id: 'b', text: 'Frank Hartmann', correct: false },
          { id: 'c', text: 'Speditionswesen', correct: true },
        ],
        explanation: 'Nach einer Leerzeile folgt zunächst die Unternehmensbranche.',
      },
      {
        type: 'choice',
        id: 'firma',
        caption: 'Nächste Zeile: Firmenname',
        options: [
          { id: 'a', text: 'Spedition Hartmann', correct: false },
          { id: 'b', text: 'Spedition Hartmann GmbH & Co. KG', correct: true },
          { id: 'c', text: 'Hartmann GmbH', correct: false },
        ],
        explanation: 'Direkt darunter steht der vollständige Unternehmensname.',
      },
      {
        type: 'choice',
        id: 'mittlere-leerzeile',
        caption: 'Was steht in der mittleren der drei Leerzeilen?',
        options: [
          { id: 'a', text: 'der Firmenname noch einmal', correct: false },
          { id: 'b', text: 'i. A.', correct: true },
          { id: 'c', text: 'nichts, sie bleibt leer', correct: false },
        ],
        explanation:
          '„i. A.“ kann alternativ allein in die mittlere der drei Leerzeilen geschrieben werden – dann bleibt der Name ohne Zusatz.',
      },
      {
        type: 'choice',
        id: 'name',
        caption: 'Gedruckter Name nach den drei Leerzeilen',
        options: [
          { id: 'a', text: 'i. A. Dr. Tom Weber', correct: false },
          { id: 'b', text: 'Dr. Tom Weber i. A.', correct: false },
          { id: 'c', text: 'Dr. Tom Weber', correct: true },
        ],
        explanation:
          'Steht „i. A.“ bereits in der mittleren Leerzeile, wird der vollständige Name (inklusive Titel) ohne weiteren Zusatz gedruckt.',
      },
    ],
  },
];

export function getGrussformelTaskById(id: string) {
  return GRUSSFORMEL_TASKS.find((task) => task.id === id);
}

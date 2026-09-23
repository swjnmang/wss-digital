import type { AufzaehlungTask } from './aufzaehlung-types';

export const AUFZAEHLUNG_TASKS: AufzaehlungTask[] = [
  {
    id: 'kleiderboutique-nummeriert',
    title: 'Neueröffnung: nummerierte Liste',
    difficulty: 'einfach',
    intro: 'Lies dir das folgende, korrekt formatierte Beispiel genau durch und beantworte dann die Fragen dazu.',
    beispiel: [
      { text: 'In unserem Geschäft erhalten Sie' },
      { text: '' },
      { text: '1. Blusen,', indent: true },
      { text: '2. Kleider,', indent: true },
      { text: '3. Hosen,', indent: true },
      { text: '4. Röcke.', indent: true },
      { text: '' },
      { text: 'Wir freuen uns auf Ihren Besuch.' },
    ],
    lines: [
      {
        type: 'choice',
        id: 'leerzeile-vor',
        caption: 'Wie viele Leerzeilen stehen vor der Nummerierung?',
        options: [
          { id: 'a', text: '0', correct: false },
          { id: 'b', text: '2', correct: false },
          { id: 'c', text: '1', correct: true },
        ],
        explanation: 'Vor der Aufzählung bzw. Nummerierung steht immer genau eine Leerzeile.',
      },
      {
        type: 'choice',
        id: 'leerzeile-nach',
        caption: 'Wie viele Leerzeilen stehen nach der Nummerierung?',
        options: [
          { id: 'a', text: '2', correct: false },
          { id: 'b', text: '1', correct: true },
          { id: 'c', text: '0', correct: false },
        ],
        explanation: 'Auch nach der Aufzählung bzw. Nummerierung steht genau eine Leerzeile.',
      },
      {
        type: 'choice',
        id: 'position-nummer',
        caption: 'Auf welcher Position steht die Nummer (z. B. „1.“)?',
        options: [
          { id: 'a', text: '0,75 cm eingerückt', correct: false },
          { id: 'b', text: '1,5 cm eingerückt', correct: false },
          { id: 'c', text: 'auf der Fluchtlinie, also bei 0 cm', correct: true },
        ],
        explanation: 'Das Nummerierungszeichen steht auf der Fluchtlinie – also genau am linken Seitenrand (0 cm).',
      },
      {
        type: 'choice',
        id: 'einzug-text',
        caption: 'Bei welchem Einzug beginnt der Text nach der Nummer?',
        options: [
          { id: 'a', text: '0 cm', correct: false },
          { id: 'b', text: '0,75 cm', correct: true },
          { id: 'c', text: '1 cm', correct: false },
        ],
        explanation: 'Der Text nach dem Nummerierungszeichen beginnt bei einem Einzug von 0,75 cm.',
      },
      {
        type: 'choice',
        id: 'leerzeilen-zwischen',
        caption: 'Stehen zwischen den Punkten 1.–4. zusätzliche Leerzeilen?',
        options: [
          { id: 'a', text: 'Ja, immer eine Leerzeile zwischen jedem Punkt', correct: false },
          { id: 'b', text: 'Nur zwischen dem ersten und letzten Punkt', correct: false },
          { id: 'c', text: 'Nein, da kein Punkt mehr als eine Zeile benötigt', correct: true },
        ],
        explanation:
          'Leerzeilen zwischen den Punkten sind nur nötig, sobald mindestens ein Stichpunkt mehr als eine Zeile benötigt. Hier ist jeder Punkt einzeilig.',
      },
      {
        type: 'choice',
        id: 'satzzeichen',
        caption: 'Welche Satzzeichen stehen am Ende der Punkte?',
        options: [
          { id: 'a', text: 'Alle vier Punkte enden mit einem Punkt', correct: false },
          { id: 'b', text: 'Keine Satzzeichen, da es eine Liste ist', correct: false },
          { id: 'c', text: 'Die Punkte 1–3 enden mit Komma, Punkt 4 mit einem Punkt', correct: true },
        ],
        explanation:
          'Der Satz vor der Liste wird durch die Liste fortgeführt: Die Satzzeichen entsprechen denen, die ohne die Liste an dieser Stelle stünden – also Kommas zwischen den Aufzählungsteilen und ein Punkt am Ende.',
      },
    ],
  },
  {
    id: 'kleiderboutique-aufzaehlung',
    title: 'Neueröffnung: Aufzählung mit mehrzeiligem Punkt',
    difficulty: 'mittel',
    intro:
      'In diesem Beispiel benötigt einer der Stichpunkte zwei Zeilen. Beobachte genau, was das für die Abstände zwischen ALLEN Punkten bedeutet.',
    beispiel: [
      { text: 'Wir möchten Ihnen Folgendes versprechen:' },
      { text: '' },
      { text: '• Der Kunde ist bei uns König.', indent: true },
      { text: '' },
      { text: '• Unsere Mitarbeiterinnen und Mitarbeiter sind ausgebildete Fachkräfte und werden den', indent: true },
      { text: 'passenden Stil finden, der individuell zu Ihnen passt.', indent: true },
      { text: '' },
      { text: '• Sollte Ihr Einkauf etwas länger dauern, servieren wir Ihnen gerne einen Espresso.', indent: true },
      { text: '' },
      { text: 'Wir würden uns freuen, Sie von uns überzeugen zu können.' },
    ],
    lines: [
      {
        type: 'choice',
        id: 'grund-leerzeilen',
        caption: 'Warum stehen hier zwischen ALLEN drei Punkten Leerzeilen, obwohl zwei davon einzeilig sind?',
        options: [
          { id: 'a', text: 'Nur um den mehrzeiligen Punkt herum ist eine Leerzeile nötig', correct: false },
          { id: 'b', text: 'Bei Aufzählungszeichen (•) gilt das immer, bei Nummerierungen nicht', correct: false },
          {
            id: 'c',
            text: 'Sobald ein Punkt mehr als eine Zeile benötigt, steht auch zwischen allen anderen Punkten eine Leerzeile',
            correct: true,
          },
        ],
        explanation:
          'Sobald bereits ein Stichpunkt mehr als eine Zeile benötigt, ist auch zwischen den übrigen (einzeiligen) Punkten eine Leerzeile einzufügen.',
      },
      {
        type: 'choice',
        id: 'folgezeile-einzug',
        caption: 'Bei welchem Einzug beginnt die zweite Zeile des mehrzeiligen Punktes („passenden Stil…“)?',
        options: [
          { id: 'a', text: 'Auf der Fluchtlinie, also bei 0 cm', correct: false },
          { id: 'b', text: 'Bei 0,75 cm – wie der Text der ersten Zeile', correct: true },
          { id: 'c', text: 'Zentriert unter dem Aufzählungszeichen', correct: false },
        ],
        explanation:
          'Die Folgezeile eines mehrzeiligen Punktes beginnt beim gleichen Einzug von 0,75 cm wie der Text der ersten Zeile.',
      },
      {
        type: 'choice',
        id: 'satzzeichen',
        caption: 'Welches Satzzeichen steht am Ende jedes einzelnen Punktes?',
        options: [
          { id: 'a', text: 'Ein Komma, da die Liste den einleitenden Satz fortsetzt', correct: false },
          { id: 'b', text: 'Kein Satzzeichen', correct: false },
          { id: 'c', text: 'Ein Punkt, da jeder Stichpunkt hier ein eigener vollständiger Satz ist', correct: true },
        ],
        explanation:
          'Anders als bei der nummerierten Liste zuvor ist hier jeder Stichpunkt ein eigenständiger, vollständiger Satz – daher endet jeder Punkt mit einem Punkt.',
      },
      {
        type: 'choice',
        id: 'leerzeile-vor',
        caption: 'Wie viele Leerzeilen stehen vor der ersten Aufzählung?',
        options: [
          { id: 'a', text: '1', correct: true },
          { id: 'b', text: '2', correct: false },
          { id: 'c', text: '0', correct: false },
        ],
        explanation: 'Vor der Aufzählung bzw. Nummerierung steht immer genau eine Leerzeile.',
      },
      {
        type: 'choice',
        id: 'leerzeile-nach',
        caption: 'Wie viele Leerzeilen stehen nach der letzten Aufzählung?',
        options: [
          { id: 'a', text: '0', correct: false },
          { id: 'b', text: '1', correct: true },
          { id: 'c', text: '2', correct: false },
        ],
        explanation: 'Auch nach der Aufzählung bzw. Nummerierung steht genau eine Leerzeile.',
      },
    ],
  },
  {
    id: 'lieferbedingungen-nummeriert',
    title: 'Lieferbedingungen: nummerierte Liste',
    difficulty: 'einfach',
    intro: 'Ein neues Beispiel mit einzeiligen, nummerierten Punkten. Wende die DIN-5008-Regeln erneut an.',
    beispiel: [
      { text: 'Für Ihre Bestellung gelten folgende Lieferbedingungen:' },
      { text: '' },
      { text: '1. Lieferung innerhalb von 5 Werktagen,', indent: true },
      { text: '2. Versand versichert bis 500 €,', indent: true },
      { text: '3. Rückgabe innerhalb von 14 Tagen möglich.', indent: true },
      { text: '' },
      { text: 'Weitere Informationen finden Sie im beiliegenden Flyer.' },
    ],
    lines: [
      {
        type: 'choice',
        id: 'leerzeile-vor',
        caption: 'Wie viele Leerzeilen stehen vor der Nummerierung?',
        options: [
          { id: 'a', text: '2', correct: false },
          { id: 'b', text: '1', correct: true },
          { id: 'c', text: '0', correct: false },
        ],
        explanation: 'Vor der Aufzählung bzw. Nummerierung steht immer genau eine Leerzeile.',
      },
      {
        type: 'choice',
        id: 'leerzeile-nach',
        caption: 'Wie viele Leerzeilen stehen nach der Nummerierung?',
        options: [
          { id: 'a', text: '1', correct: true },
          { id: 'b', text: '0', correct: false },
          { id: 'c', text: '2', correct: false },
        ],
        explanation: 'Auch nach der Aufzählung bzw. Nummerierung steht genau eine Leerzeile.',
      },
      {
        type: 'choice',
        id: 'position-nummer',
        caption: 'Auf welcher Position steht die Nummer?',
        options: [
          { id: 'a', text: 'auf der Fluchtlinie, also bei 0 cm', correct: true },
          { id: 'b', text: '0,75 cm eingerückt', correct: false },
          { id: 'c', text: '1 cm eingerückt', correct: false },
        ],
        explanation: 'Das Nummerierungszeichen steht auf der Fluchtlinie – also genau am linken Seitenrand (0 cm).',
      },
      {
        type: 'choice',
        id: 'leerzeilen-zwischen',
        caption: 'Stehen zwischen den Punkten 1.–3. zusätzliche Leerzeilen?',
        options: [
          { id: 'a', text: 'Ja, immer', correct: false },
          { id: 'b', text: 'Nein, da kein Punkt mehr als eine Zeile benötigt', correct: true },
          { id: 'c', text: 'Nur zwischen Punkt 2 und 3', correct: false },
        ],
        explanation:
          'Leerzeilen zwischen den Punkten sind nur nötig, sobald mindestens ein Stichpunkt mehr als eine Zeile benötigt. Hier ist jeder Punkt einzeilig.',
      },
      {
        type: 'choice',
        id: 'satzzeichen',
        caption: 'Welche Satzzeichen stehen am Ende der Punkte?',
        options: [
          { id: 'a', text: 'Die Punkte 1–2 enden mit Komma, Punkt 3 mit einem Punkt', correct: true },
          { id: 'b', text: 'Alle drei Punkte enden mit einem Punkt', correct: false },
          { id: 'c', text: 'Keine Satzzeichen, da es eine Liste ist', correct: false },
        ],
        explanation:
          'Der einleitende Satz wird durch die Liste fortgeführt: Kommas zwischen den Aufzählungsteilen, ein Punkt am Ende des letzten Punktes.',
      },
    ],
  },
  {
    id: 'oeffnungszeiten-aufzaehlung',
    title: 'Serviceleistungen: Aufzählung mit mehrzeiligem Punkt',
    difficulty: 'mittel',
    intro: 'Wieder ein Beispiel mit einem mehrzeiligen Stichpunkt – prüfe erneut die Abstände zwischen den Punkten.',
    beispiel: [
      { text: 'Als Kunde bei uns profitieren Sie von folgenden Leistungen.' },
      { text: '' },
      { text: '• Kostenlose Lieferung ab einem Bestellwert von 50 €.', indent: true },
      { text: '' },
      { text: '• Unser Kundenservice berät Sie persönlich zu allen Fragen rund um Ihre Bestellung und', indent: true },
      { text: 'ist von Montag bis Freitag telefonisch erreichbar.', indent: true },
      { text: '' },
      { text: '• Reklamationen bearbeiten wir innerhalb von 48 Stunden.', indent: true },
    ],
    lines: [
      {
        type: 'choice',
        id: 'grund-leerzeilen',
        caption: 'Warum steht auch vor und nach dem ersten (einzeiligen) Punkt eine Leerzeile?',
        options: [
          { id: 'a', text: 'Weil Aufzählungszeichen (•) das immer verlangen', correct: false },
          {
            id: 'b',
            text: 'Weil ein anderer Punkt dieser Liste mehr als eine Zeile benötigt',
            correct: true,
          },
          { id: 'c', text: 'Das ist ein Fehler, hier dürfte keine Leerzeile stehen', correct: false },
        ],
        explanation:
          'Sobald bereits ein Stichpunkt mehr als eine Zeile benötigt, ist auch zwischen den übrigen (einzeiligen) Punkten eine Leerzeile einzufügen.',
      },
      {
        type: 'choice',
        id: 'satzzeichen',
        caption: 'Welches Satzzeichen steht am Ende jedes Punktes?',
        options: [
          { id: 'a', text: 'Ein Punkt, da jeder Stichpunkt ein eigener vollständiger Satz ist', correct: true },
          { id: 'b', text: 'Ein Komma, da der einleitende Satz fortgesetzt wird', correct: false },
          { id: 'c', text: 'Kein Satzzeichen', correct: false },
        ],
        explanation: 'Jeder Stichpunkt ist hier ein eigenständiger, vollständiger Satz und endet daher mit einem Punkt.',
      },
      {
        type: 'choice',
        id: 'einzug-text',
        caption: 'Bei welchem Einzug beginnt der Text nach dem Aufzählungszeichen?',
        options: [
          { id: 'a', text: '0 cm', correct: false },
          { id: 'b', text: '0,75 cm', correct: true },
          { id: 'c', text: '1,5 cm', correct: false },
        ],
        explanation: 'Der Text nach dem Aufzählungszeichen beginnt bei einem Einzug von 0,75 cm.',
      },
      {
        type: 'choice',
        id: 'position-zeichen',
        caption: 'Auf welcher Position steht das Aufzählungszeichen (•)?',
        options: [
          { id: 'a', text: 'auf der Fluchtlinie, also bei 0 cm', correct: true },
          { id: 'b', text: '0,75 cm eingerückt', correct: false },
          { id: 'c', text: 'zentriert auf der Seite', correct: false },
        ],
        explanation: 'Das Aufzählungszeichen steht auf der Fluchtlinie – also genau am linken Seitenrand (0 cm).',
      },
    ],
  },
  {
    id: 'satzzeichen-vergleich',
    title: 'Satzzeichen: Liste im Satz vs. eigenständige Punkte',
    difficulty: 'schwer',
    intro:
      'Vergleiche die beiden folgenden kurzen Listen genau miteinander und beantworte die Fragen zum Unterschied.',
    beispiel: [
      { text: 'Variante A – der Satz wird durch die Liste fortgeführt:' },
      { text: 'Zum Sortiment gehören' },
      { text: '' },
      { text: '1. Schreibwaren,', indent: true },
      { text: '2. Bürobedarf,', indent: true },
      { text: '3. Geschenkartikel.', indent: true },
      { text: '' },
      { text: 'Variante B – jeder Punkt ist ein eigener, vollständiger Satz:' },
      { text: 'Wir bieten Ihnen:' },
      { text: '' },
      { text: '• Kostenlose Beratung.', indent: true },
      { text: '• Schnelle Lieferung.', indent: true },
      { text: '• Faire Preise.', indent: true },
    ],
    lines: [
      {
        type: 'choice',
        id: 'variante-a-satzzeichen',
        caption: 'Warum enden die Punkte 1 und 2 in Variante A mit einem Komma, Punkt 3 aber mit einem Punkt?',
        options: [
          { id: 'a', text: 'Weil es sich um eine Nummerierung statt einer Aufzählung handelt', correct: false },
          {
            id: 'b',
            text: 'Weil die Liste den einleitenden Satz „Zum Sortiment gehören …“ grammatisch fortsetzt',
            correct: true,
          },
          { id: 'c', text: 'Weil jeder Punkt weniger als drei Wörter hat', correct: false },
        ],
        explanation:
          'Wird ein Satz über die Liste hinaus fortgeführt, gelten die Satzzeichen, die im Satz auch ohne die Liste stehen würden – hier also Kommas und ein abschließender Punkt.',
      },
      {
        type: 'choice',
        id: 'variante-b-satzzeichen',
        caption: 'Warum endet in Variante B jeder Punkt mit einem eigenen Punkt?',
        options: [
          { id: 'a', text: 'Weil Aufzählungszeichen (•) das immer verlangen', correct: false },
          { id: 'b', text: 'Weil jeder Stichpunkt ein eigenständiger, vollständiger Satz ist', correct: true },
          { id: 'c', text: 'Das ist falsch, es müssten Kommas stehen', correct: false },
        ],
        explanation:
          'In Variante B ist jeder Stichpunkt für sich ein vollständiger Satz, daher steht am Ende jedes Punktes ein eigener Punkt statt eines Kommas.',
      },
      {
        type: 'choice',
        id: 'gemeinsamkeit',
        caption: 'Was ist bei BEIDEN Varianten hinsichtlich Leerzeilen und Einzug gleich?',
        options: [
          {
            id: 'a',
            text: 'Eine Leerzeile vor und nach der Liste, Zeichen auf der Fluchtlinie, Text bei 0,75 cm Einzug',
            correct: true,
          },
          { id: 'b', text: 'Variante A benötigt keine Leerzeilen, Variante B schon', correct: false },
          { id: 'c', text: 'Der Einzug unterscheidet sich je nach Satzzeichen am Ende', correct: false },
        ],
        explanation:
          'Die Regeln zu Leerzeilen (je eine davor/danach), zur Position des Zeichens (Fluchtlinie) und zum Texteinzug (0,75 cm) gelten unabhängig von der Satzzeichen-Variante immer gleich.',
      },
    ],
  },
  {
    id: 'fehlersuche-aufzaehlung',
    title: 'Fehlersuche: Was ist hier falsch formatiert?',
    difficulty: 'schwer',
    intro:
      'Das folgende Beispiel enthält mehrere Formatierungsfehler. Finde heraus, welche DIN-5008-Regeln hier verletzt wurden.',
    beispiel: [
      { text: 'Unser Sortiment umfasst:' },
      { text: '1. Bücher,', indent: true },
      { text: '2. Zeitschriften,', indent: true },
      { text: '3. Schreibwaren.', indent: true },
      { text: 'Besuchen Sie uns gerne vor Ort.' },
    ],
    lines: [
      {
        type: 'choice',
        id: 'fehler-leerzeile-vor',
        caption: 'Welcher Fehler liegt zwischen der Einleitung und der Nummerierung vor?',
        options: [
          { id: 'a', text: 'Es fehlt die Leerzeile vor der Nummerierung', correct: true },
          { id: 'b', text: 'Es steht eine Leerzeile zu viel davor', correct: false },
          { id: 'c', text: 'Hier liegt kein Fehler vor', correct: false },
        ],
        explanation:
          'Vor der Aufzählung bzw. Nummerierung muss immer genau eine Leerzeile stehen – hier fehlt sie.',
      },
      {
        type: 'choice',
        id: 'fehler-leerzeile-nach',
        caption: 'Welcher Fehler liegt zwischen der Nummerierung und dem letzten Satz vor?',
        options: [
          { id: 'a', text: 'Hier liegt kein Fehler vor', correct: false },
          { id: 'b', text: 'Es fehlt die Leerzeile nach der Nummerierung', correct: true },
          { id: 'c', text: 'Es müsste eine Leerzeile zwischen jedem einzelnen Punkt stehen', correct: false },
        ],
        explanation: 'Auch nach der Aufzählung bzw. Nummerierung muss genau eine Leerzeile stehen – hier fehlt sie.',
      },
      {
        type: 'choice',
        id: 'was-waere-richtig',
        caption: 'Was müsste korrigiert werden, damit die Liste den DIN-5008-Regeln entspricht?',
        options: [
          { id: 'a', text: 'Nur die Satzzeichen am Ende der Punkte müssten geändert werden', correct: false },
          { id: 'b', text: 'Der Einzug der Punkte auf 1,5 cm erhöhen', correct: false },
          {
            id: 'c',
            text: 'Vor und nach der Nummerierung jeweils eine Leerzeile einfügen',
            correct: true,
          },
        ],
        explanation:
          'Die Satzzeichen (Kommas, Schlusspunkt) und der Einzug (0,75 cm) sind hier bereits korrekt – es fehlen ausschließlich die Leerzeilen vor und nach der Liste.',
      },
    ],
  },
];

export function getAufzaehlungTaskById(id: string) {
  return AUFZAEHLUNG_TASKS.find((task) => task.id === id);
}

import { InlineMath, BlockMath } from 'react-katex'
import QGUebung, { Beispiel, Merke } from './QGUebung'
import {
  erzeugeAnzahl,
  erzeugeAXQuadrat,
  erzeugeAXQuadratC,
  erzeugeGemischt,
  erzeugeNullprodukt,
  erzeugeUmformen,
  erzeugeXQuadrat,
} from './aufgaben'

// Die Themenseiten des Bereichs „Quadratische Gleichungen“ (Reihenfolge = Lernweg).
// Nur reinquadratische Gleichungen (Umformen nach x², Wurzelziehen) und ax² + bx = 0 (x ausklammern, Satz vom Nullprodukt).
// Keine Lösungsformel, keine binomischen Formeln (Wunsch der Lehrkraft).

export const QG_BASIS = '/quadratische_gleichungen'
const W = '\\mid \\sqrt{\\phantom{x}}'

export function XQuadrat() {
  return (
    <QGUebung
      titel="Gleichungen der Form x² = d"
      erklaerungTitel="So löst du x² = d durch Wurzelziehen"
      weiter={{ to: `${QG_BASIS}/ax2-gleich-d`, label: 'Gleichungen der Form ax² = d' }}
      stufen={[
        { id: 1, name: 'Stufe 1: Quadratzahlen', beschreibung: 'Rechts steht eine Quadratzahl, z. B. x² = 49.' },
        { id: 2, name: 'Stufe 2: Dezimalzahlen und große Zahlen', beschreibung: 'Z. B. x² = 0,36 oder x² = 400.' },
        { id: 3, name: 'Stufe 3: Runden', beschreibung: 'Keine Quadratzahl – runde auf zwei Nachkommastellen (Taschenrechner).' },
      ]}
      erzeuge={erzeugeXQuadrat}
      erklaerung={
        <>
          <p>
            Eine Gleichung, in der x nur als <strong>x²</strong> vorkommt (kein einzelnes x), heißt{' '}
            <strong>reinquadratische Gleichung</strong>. Die einfachste Form ist <InlineMath math="x^2 = d" />.
          </p>
          <p>
            Gesucht sind alle Zahlen, die mit sich selbst multipliziert d ergeben. Weil <InlineMath math="3^2 = 9" /> und
            auch <InlineMath math="(-3)^2 = 9" /> ist, hat <InlineMath math="x^2 = 9" /> <strong>zwei Lösungen</strong>.
          </p>
          <Merke>
            Beim Wurzelziehen entstehen zwei Lösungen: <InlineMath math="x_1 = \sqrt{d}" /> und{' '}
            <InlineMath math="x_2 = -\sqrt{d}" />. Vergiss die negative Lösung nicht!
          </Merke>
          <Beispiel
            zeilen={[
              ['x^2', '49', W],
              ['x_1', '\\sqrt{49} = 7'],
              ['x_2', '-\\sqrt{49} = -7'],
            ]}
            schluss="\mathbb{L} = \{-7;\ 7\}"
          />
          <p className="text-xs text-gray-500">Eingabe: Trage beide Lösungen ein, die Reihenfolge ist egal. Dezimalzahlen mit Komma, z. B. 0,6.</p>
        </>
      }
    />
  )
}

export function AXQuadrat() {
  return (
    <QGUebung
      titel="Gleichungen der Form ax² = d"
      erklaerungTitel="So löst du ax² = d"
      weiter={{ to: `${QG_BASIS}/ax2-plus-c`, label: 'Gleichungen der Form ax² + c = d' }}
      stufen={[
        { id: 1, name: 'Stufe 1: a positiv', beschreibung: 'Z. B. 3x² = 75.' },
        { id: 2, name: 'Stufe 2: a negativ oder Dezimalzahl', beschreibung: 'Z. B. −2x² = −32 oder 0,5x² = 8.' },
        { id: 3, name: 'Stufe 3: Runden', beschreibung: 'Ergebnis auf zwei Nachkommastellen runden.' },
      ]}
      erzeuge={erzeugeAXQuadrat}
      erklaerung={
        <>
          <p>
            Steht vor dem <InlineMath math="x^2" /> eine Zahl a, musst du zuerst <strong>durch a teilen</strong>. Erst
            wenn <InlineMath math="x^2" /> allein steht, ziehst du die Wurzel.
          </p>
          <ol className="list-decimal ml-5 space-y-1">
            <li>Durch die Zahl vor x² teilen → <InlineMath math="x^2 = \ldots" /></li>
            <li>Wurzel ziehen → zwei Lösungen <InlineMath math="x_1" /> und <InlineMath math="x_2" /></li>
            <li>Lösungsmenge angeben</li>
          </ol>
          <Beispiel
            zeilen={[
              ['3x^2', '75', '\\mid\\ {:}\\,3'],
              ['x^2', '25', W],
              ['x_1', '\\sqrt{25} = 5'],
              ['x_2', '-\\sqrt{25} = -5'],
            ]}
            schluss="\mathbb{L} = \{-5;\ 5\}"
          />
          <Merke>
            Ist a negativ, teilst du durch die negative Zahl, z. B. <InlineMath math="\mid\ {:}\,(-2)" />. Dabei ändert sich das
            Vorzeichen der rechten Seite.
          </Merke>
        </>
      }
    />
  )
}

export function AXQuadratC() {
  return (
    <QGUebung
      titel="Gleichungen der Form ax² + c = d"
      erklaerungTitel="So löst du ax² + c = d"
      weiter={{ to: `${QG_BASIS}/anzahl-loesungen`, label: 'Anzahl der Lösungen' }}
      stufen={[
        { id: 1, name: 'Stufe 1: x² + c = d', beschreibung: 'Z. B. x² − 16 = 0 oder x² + 5 = 41.' },
        { id: 2, name: 'Stufe 2: ax² + c = d', beschreibung: 'Z. B. 2x² − 8 = 42.' },
        { id: 3, name: 'Stufe 3: Profi', beschreibung: 'Negative Zahlen, Dezimalzahlen und Runden.' },
      ]}
      erzeuge={erzeugeAXQuadratC}
      erklaerung={
        <>
          <p>
            Jetzt kommt noch eine Zahl <strong>c</strong> ohne x dazu. Bringe sie zuerst mit einer{' '}
            <strong>Äquivalenzumformung</strong> auf die andere Seite. Danach geht es weiter wie bei{' '}
            <InlineMath math="ax^2 = d" />.
          </p>
          <ol className="list-decimal ml-5 space-y-1">
            <li>Zahl ohne x auf die rechte Seite bringen (<InlineMath math="\mid -c" /> bzw. <InlineMath math="\mid +c" />)</li>
            <li>Durch a teilen</li>
            <li>Wurzel ziehen → zwei Lösungen</li>
          </ol>
          <Beispiel
            zeilen={[
              ['2x^2 - 8', '42', '\\mid +8'],
              ['2x^2', '50', '\\mid\\ {:}\\,2'],
              ['x^2', '25', W],
              ['x_1', '\\sqrt{25} = 5'],
              ['x_2', '-\\sqrt{25} = -5'],
            ]}
            schluss="\mathbb{L} = \{-5;\ 5\}"
          />
          <Merke>Was du auf der einen Seite machst, machst du auch auf der anderen Seite.</Merke>
        </>
      }
    />
  )
}

export function AnzahlLoesungen() {
  return (
    <QGUebung
      titel="Anzahl der Lösungen"
      erklaerungTitel="Zwei, eine oder keine Lösung?"
      weiter={{ to: `${QG_BASIS}/erst-umformen`, label: 'Gleichungen erst umformen' }}
      stufen={[
        { id: 1, name: 'Stufe 1: ax² = d', beschreibung: 'Entscheide, wie viele Lösungen es gibt, und gib sie an.' },
        { id: 2, name: 'Stufe 2: ax² + c = d', beschreibung: 'Erst umformen, dann entscheiden.' },
      ]}
      erzeuge={erzeugeAnzahl}
      erklaerung={
        <>
          <p>
            Nicht jede reinquadratische Gleichung hat zwei Lösungen. Forme zuerst so um, dass{' '}
            <InlineMath math="x^2 = d" /> dasteht. Dann entscheidet die Zahl d:
          </p>
          <BlockMath math="\begin{aligned} d > 0 &: \text{ zwei Lösungen } x_1 = \sqrt{d},\ x_2 = -\sqrt{d} \\ d = 0 &: \text{ eine Lösung } x = 0 \\ d < 0 &: \text{ keine Lösung, } \mathbb{L} = \{\,\} \end{aligned}" />
          <Merke>
            Das Quadrat einer Zahl ist nie negativ. Deshalb hat z. B. <InlineMath math="x^2 = -4" /> keine Lösung.
          </Merke>
          <Beispiel
            zeilen={[
              ['3x^2 + 12', '0', '\\mid -12'],
              ['3x^2', '-12', '\\mid\\ {:}\\,3'],
              ['x^2', '-4', '\\text{kein Wurzelziehen möglich}'],
            ]}
            schluss="\mathbb{L} = \{\,\}"
          />
          <p className="text-xs text-gray-500">Wähle zuerst die Anzahl der Lösungen. Danach erscheinen die passenden Eingabefelder.</p>
        </>
      }
    />
  )
}

export function ErstUmformen() {
  return (
    <QGUebung
      titel="Gleichungen erst umformen"
      erklaerungTitel="Mit Termumformungen zur Form x² = d"
      weiter={{ to: `${QG_BASIS}/satz-vom-nullprodukt`, label: 'Satz vom Nullprodukt' }}
      stufen={[
        { id: 1, name: 'Stufe 1: x² auf beiden Seiten', beschreibung: 'Z. B. 5x² − 7 = 2x² + 20.' },
        { id: 2, name: 'Stufe 2: mit Klammern', beschreibung: 'Z. B. 3(x² − 4) = 2x² + 13.' },
      ]}
      erzeuge={erzeugeUmformen}
      erklaerung={
        <>
          <p>
            Manchmal sieht man erst nach dem Umformen, dass eine reinquadratische Gleichung vorliegt. Löse Klammern auf,
            fasse zusammen und bringe alle x²-Glieder auf eine Seite und alle Zahlen auf die andere.
          </p>
          <Beispiel
            zeilen={[
              ['3(x^2 - 4)', '2x^2 + 13', '\\text{Klammer auflösen}'],
              ['3x^2 - 12', '2x^2 + 13', '\\mid -2x^2'],
              ['x^2 - 12', '13', '\\mid +12'],
              ['x^2', '25', W],
              ['x_1', '\\sqrt{25} = 5'],
              ['x_2', '-\\sqrt{25} = -5'],
            ]}
            schluss="\mathbb{L} = \{-5;\ 5\}"
          />
          <Merke>Was du auf der einen Seite machst, machst du auch auf der anderen Seite.</Merke>
        </>
      }
    />
  )
}

export function Nullprodukt() {
  return (
    <QGUebung
      titel="Satz vom Nullprodukt"
      erklaerungTitel="So löst du ax² + bx = 0 mit Ausklammern und dem Satz vom Nullprodukt"
      weiter={{ to: `${QG_BASIS}/gemischte-uebungen`, label: 'Gemischte Übungen' }}
      stufen={[
        { id: 1, name: 'Stufe 1: Satz vom Nullprodukt verstehen', beschreibung: 'Das x ist schon ausgeklammert, z. B. x(x − 4) = 0.' },
        { id: 2, name: 'Stufe 2: x² + bx = 0', beschreibung: 'Erst x ausklammern, z. B. x² − 6x = 0.' },
        { id: 3, name: 'Stufe 3: ax² + bx = 0', beschreibung: 'Mit einer Zahl vor x², z. B. 2x² + 10x = 0.' },
        { id: 4, name: 'Stufe 4: erst umformen', beschreibung: 'Zuerst alles auf eine Seite bringen, z. B. 3x² = 12x.' },
      ]}
      erzeuge={erzeugeNullprodukt}
      erklaerung={
        <>
          <p>
            Bei Gleichungen wie <InlineMath math="x^2 - 6x = 0" /> fehlt die Zahl ohne x. Hier hilft kein Wurzelziehen, denn
            x kommt einmal als <InlineMath math="x^2" /> und einmal als <InlineMath math="x" /> vor. Stattdessen{' '}
            <strong>klammerst du x aus</strong>:
          </p>
          <BlockMath math="x^2 - 6x = x \cdot x - 6 \cdot x = x(x - 6)" />
          <Merke>
            <strong>Satz vom Nullprodukt:</strong> Ein Produkt ist genau dann 0, wenn mindestens einer der Faktoren 0 ist.
            <br />
            Aus <InlineMath math="x \cdot (x - 6) = 0" /> folgt: <InlineMath math="x = 0" /> <strong>oder</strong>{' '}
            <InlineMath math="x - 6 = 0" />.
          </Merke>
          <ol className="list-decimal ml-5 space-y-1">
            <li>Alles auf eine Seite bringen, sodass rechts 0 steht.</li>
            <li>x ausklammern → <InlineMath math="x(\ldots) = 0" /></li>
            <li>Jeden Faktor gleich 0 setzen: <InlineMath math="x_1 = 0" /> und die Klammer nach x auflösen.</li>
          </ol>
          <Beispiel
            zeilen={[
              ['2x^2 - 8x', '0', '\\text{x ausklammern}'],
              ['x(2x - 8)', '0', '\\text{Satz vom Nullprodukt}'],
              ['x_1 = 0 \\quad \\text{oder} \\quad 2x - 8', '0', '\\mid +8'],
              ['2x', '8', '\\mid\\ {:}\\,2'],
              ['x_2', '4'],
            ]}
            schluss="\mathbb{L} = \{0;\ 4\}"
          />
          <Merke>
            Teile <strong>nie durch x</strong>! Dabei verlierst du die Lösung <InlineMath math="x = 0" />.
          </Merke>
        </>
      }
    />
  )
}

export function GemischteUebungen() {
  return (
    <QGUebung
      titel="Gemischte Übungen"
      erklaerungTitel="Alles gemischt"
      anzahl={8}
      stufen={[
        { id: 1, name: 'Stufe 1: Basis', beschreibung: 'Gemischte Aufgaben aller Themen – zuerst die Anzahl der Lösungen wählen.' },
        { id: 2, name: 'Stufe 2: Fortgeschritten', beschreibung: 'Mit negativen Zahlen, Dezimalzahlen und Klammern.' },
        { id: 3, name: 'Stufe 3: Profi', beschreibung: 'Mit Klammern, Satz vom Nullprodukt und Runden auf zwei Nachkommastellen.' },
      ]}
      erzeuge={erzeugeGemischt}
      erklaerung={
        <>
          <p>Hier kommen alle Arten von Gleichungen aus diesem Kapitel gemischt vor. Gehe immer so vor:</p>
          <ol className="list-decimal ml-5 space-y-1">
            <li>Klammern auflösen und zusammenfassen (falls nötig)</li>
            <li>x²-Glieder auf eine Seite, Zahlen auf die andere Seite bringen</li>
            <li>Gibt es ein Glied mit einzelnem x und rechts steht 0? → x ausklammern und Satz vom Nullprodukt</li>
            <li>Sonst: durch die Zahl vor x² teilen → <InlineMath math="x^2 = d" />, an d die Anzahl der Lösungen ablesen und ggf. die Wurzel ziehen</li>
          </ol>
        </>
      }
    />
  )
}

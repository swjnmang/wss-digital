import React from 'react';
import { Link } from 'react-router-dom';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

// Statische Skizze: Dreieck ABC mit Höhe h von B auf die Seite b (Linie CA)
// C = (50,200), A = (250,200) -> Seite b liegt auf der x-Achse
// B = (146.4, 85.1) -> Winkel gamma = 50° bei C, Seite a = CB = 150px (entspricht 6 cm bei 25px/cm)
const DERIVATION_SVG = `
<svg width="100%" height="100%" viewBox="0 0 320 240" xmlns="http://www.w3.org/2000/svg">
  <polygon points="50,200 250,200 146.4,85.1" style="fill:#ecfeff;stroke:#0f766e;stroke-width:2" />
  <line x1="146.4" y1="85.1" x2="146.4" y2="200" stroke="#dc2626" stroke-width="1.5" stroke-dasharray="5,4" />
  <text x="160" y="150" font-size="14" fill="#dc2626">h</text>

  <text x="40" y="215" font-size="15" text-anchor="middle" fill="#1e293b">C</text>
  <text x="258" y="215" font-size="15" text-anchor="middle" fill="#1e293b">A</text>
  <text x="146.4" y="75" font-size="15" text-anchor="middle" fill="#1e293b">B</text>
  <text x="146.4" y="215" font-size="13" text-anchor="middle" fill="#64748b">H</text>

  <text x="195" y="190" font-size="15" text-anchor="middle" fill="#0f766e">b</text>
  <text x="80" y="135" font-size="15" text-anchor="end" fill="#0f766e">a</text>

  <path d="M 76,200 A 26,26 0 0 1 64.5,182.8" fill="none" stroke="#1e293b" stroke-width="1.2" />
  <text x="72" y="178" font-size="14" fill="#1e293b">γ</text>
</svg>`;

const FlaechensatzEinstieg: React.FC = () => {
    return (
        <div className="min-h-screen bg-[var(--bg-color)] py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                <Link to="/trigonometrie/flaechensatz" className="inline-flex items-center gap-2 text-teal-700 hover:text-teal-900 text-sm font-medium mb-4">
                    <i className="fa-solid fa-arrow-left"></i> Zurück zur Übersicht
                </Link>

                <div className="bg-white rounded-xl shadow-lg p-6 space-y-8">
                    <div>
                        <h1 className="text-3xl font-bold text-teal-800 text-center mb-2">
                            Einstiegsaufgaben zum Flächensatz
                        </h1>
                        <p className="text-center text-slate-600">
                            Wie berechnet man den Flächeninhalt eines beliebigen Dreiecks, wenn kein rechter Winkel vorliegt?
                        </p>
                    </div>

                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-teal-700">1. Die Ausgangslage</h2>
                        <p>
                            Für ein rechtwinkliges Dreieck kennst du die einfache Flächenformel{' '}
                            <InlineMath math="A = \frac{1}{2} \cdot g \cdot h" />. Bei einem{' '}
                            <strong>allgemeinen Dreieck</strong> ohne rechten Winkel ist die Höhe <InlineMath math="h" />{' '}
                            aber meist nicht direkt gegeben &ndash; stattdessen kennst du oft zwei Seiten und den
                            Winkel zwischen ihnen. Genau hier hilft der <strong>Flächensatz</strong>.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-teal-700">2. Herleitung: Die Höhe sichtbar machen</h2>
                        <p>
                            Betrachte ein Dreieck <InlineMath math="ABC" /> mit den Seiten{' '}
                            <InlineMath math="a" /> und <InlineMath math="b" />, die den Winkel{' '}
                            <InlineMath math="\gamma" /> einschließen. Fällst du von Punkt <InlineMath math="B" />{' '}
                            das Lot auf die Seite <InlineMath math="b" />, entsteht der Höhenfußpunkt{' '}
                            <InlineMath math="H" /> und ein rechtwinkliges Teildreieck <InlineMath math="CHB" />.
                        </p>

                        <div className="flex justify-center">
                            <div
                                className="w-full max-w-xs border border-slate-200 rounded-lg bg-white p-4"
                                dangerouslySetInnerHTML={{ __html: DERIVATION_SVG }}
                            />
                        </div>

                        <p>
                            In diesem rechtwinkligen Teildreieck ist <InlineMath math="a" /> die Hypotenuse und{' '}
                            <InlineMath math="h" /> die dem Winkel <InlineMath math="\gamma" /> gegenüberliegende
                            Kathete. Daher gilt:
                        </p>
                        <BlockMath math="\sin(\gamma) = \frac{h}{a} \quad \Longrightarrow \quad h = a \cdot \sin(\gamma)" />

                        <p>
                            Setzt du dieses <InlineMath math="h" /> in die bekannte Flächenformel{' '}
                            <InlineMath math="A = \frac{1}{2} \cdot b \cdot h" /> ein (mit{' '}
                            <InlineMath math="b" /> als Grundseite), erhältst du den Flächensatz:
                        </p>
                    </section>

                    <section className="bg-teal-50 border border-teal-200 rounded-xl p-5 text-center space-y-2">
                        <p className="font-semibold text-teal-900">Merksatz: Der Flächensatz</p>
                        <BlockMath math="A = \frac{1}{2} \cdot a \cdot b \cdot \sin(\gamma)" />
                        <p className="text-sm text-slate-600">
                            Je nachdem, welche zwei Seiten und welcher eingeschlossene Winkel bekannt sind, gibt es
                            zwei weitere gleichwertige Varianten:
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4 text-sm">
                            <BlockMath math="A = \frac{1}{2} \cdot b \cdot c \cdot \sin(\alpha)" />
                            <BlockMath math="A = \frac{1}{2} \cdot a \cdot c \cdot \sin(\beta)" />
                        </div>
                        <p className="text-sm text-slate-600">
                            Wichtig: Der Winkel, der in die Formel eingesetzt wird, muss immer der{' '}
                            <strong>von den beiden Seiten eingeschlossene Winkel</strong> sein.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-xl font-bold text-teal-700">3. Beispielaufgabe</h2>
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                            <p>
                                Ein Dreieck hat die Seiten <InlineMath math="a = 6\text{ cm}" /> und{' '}
                                <InlineMath math="b = 8\text{ cm}" />. Der eingeschlossene Winkel beträgt{' '}
                                <InlineMath math="\gamma = 50^\circ" />. Berechne den Flächeninhalt.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <h3 className="font-bold text-teal-700 mb-1">Schritt 1: Formel aufschreiben</h3>
                                <p className="mb-1">Zwei Seiten und der eingeschlossene Winkel sind bekannt, also nutzen wir:</p>
                                <BlockMath math="A = \frac{1}{2} \cdot a \cdot b \cdot \sin(\gamma)" />
                            </div>
                            <div>
                                <h3 className="font-bold text-teal-700 mb-1">Schritt 2: Werte einsetzen</h3>
                                <BlockMath math="A = \frac{1}{2} \cdot 6\text{ cm} \cdot 8\text{ cm} \cdot \sin(50^\circ)" />
                            </div>
                            <div>
                                <h3 className="font-bold text-teal-700 mb-1">Schritt 3: Berechnen</h3>
                                <BlockMath math="A \approx 18{,}39 \text{ cm}^2" />
                            </div>
                        </div>
                    </section>

                    <div className="flex justify-center pt-2">
                        <Link
                            to="/trigonometrie/flaechensatz/uebung"
                            className="px-6 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors"
                        >
                            Jetzt selbst üben
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FlaechensatzEinstieg;

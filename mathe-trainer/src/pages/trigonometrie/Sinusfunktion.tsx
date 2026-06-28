import React from 'react';
import { Link } from 'react-router-dom';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import GeoGebraSineUnitCircle from '../../components/GeoGebraSineUnitCircle';

const SINUSFUNKTION_VIDEO_ID = 'Zw0bByWHFeo';

const Sinusfunktion: React.FC = () => {
    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-teal-800 mb-4">Die Sinusfunktion am Einheitskreis</h1>
                    <p className="text-gray-700 max-w-2xl mx-auto">
                        Am Einheitskreis (Radius 1) lässt sich der Sinus eines Winkels direkt als Höhe eines Punktes
                        ablesen. Drehst du den Winkel α von 0° bis 360°, entsteht aus dieser Höhe Schritt für Schritt
                        der bekannte Wellenverlauf der Sinusfunktion.
                    </p>
                </div>

                <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 space-y-3">
                    <h2 className="text-lg font-semibold text-indigo-900 text-center">So hängen Kreis und Kurve zusammen</h2>
                    <ul className="text-gray-700 text-sm space-y-2 max-w-2xl mx-auto list-disc pl-5">
                        <li>
                            Der Punkt P liegt auf dem Einheitskreis. Seine Koordinaten sind{' '}
                            <InlineMath math="P = (\cos(\alpha), \sin(\alpha))" />.
                        </li>
                        <li>
                            Die grün markierte Strecke zeigt die <strong>y-Koordinate von P</strong> – das ist genau der
                            Wert <InlineMath math="\sin(\alpha)" />.
                        </li>
                        <li>
                            Diese Höhe wird nach rechts auf die Sinuskurve übertragen: Der Punkt dort hat als
                            x-Koordinate den Winkel α (im Bogenmaß) und als y-Koordinate denselben Sinuswert.
                        </li>
                        <li>
                            Lässt du α einmal vollständig von 0° bis 360° laufen, durchläuft die Sinuskurve genau
                            eine vollständige Periode.
                        </li>
                    </ul>
                </div>

                <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                    <h2 className="text-xl font-semibold text-gray-800 text-center mb-4">
                        Interaktive Grafik: Einheitskreis und Sinuskurve
                    </h2>
                    <p className="text-gray-600 text-sm text-center mb-4 max-w-2xl mx-auto">
                        Ziehe den Schieberegler <InlineMath math="\alpha" /> im Applet, bewege den Punkt P direkt auf
                        dem Kreis, oder starte die Animation, um zu beobachten, wie der Sinuswert die Kurve erzeugt.
                    </p>
                    <GeoGebraSineUnitCircle />
                </div>

                <div className="bg-gray-50 rounded-xl p-6 border border-gray-100">
                    <h2 className="text-xl font-semibold text-gray-800 text-center mb-4">Lernvideo: Sinusfunktion am Einheitskreis</h2>
                    <div className="max-w-2xl mx-auto aspect-video rounded-lg overflow-hidden border border-gray-200">
                        <iframe
                            className="w-full h-full"
                            src={`https://www.youtube.com/embed/${SINUSFUNKTION_VIDEO_ID}`}
                            title="Lernvideo: Sinusfunktion am Einheitskreis"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    </div>
                </div>

                <div className="flex justify-center">
                    <Link to="/trigonometrie" className="text-[var(--accent)] hover:underline text-sm sm:text-base">
                        <i className="fa-solid fa-arrow-left mr-2"></i>
                        Zurück zur Übersicht
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Sinusfunktion;

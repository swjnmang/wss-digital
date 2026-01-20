import React from 'react';
import { Link } from 'react-router-dom';

const Impressum: React.FC = () => {
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white px-4 py-10">
            <div className="max-w-3xl mx-auto space-y-6 bg-white border border-slate-200 shadow-lg rounded-3xl p-8">
                <div className="flex items-center gap-3 text-sm text-slate-600">
                    <Link to="/" className="text-blue-600 font-semibold hover:text-blue-800">Startseite</Link>
                    <span>›</span>
                    <span>Impressum</span>
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-blue-900 mb-4">Impressum</h1>
                    <p className="text-slate-600">Angaben gemäß § 5 TMG</p>
                </div>
                <section className="space-y-1 text-slate-700">
                    <p className="font-semibold">Verantwortlich für den Inhalt</p>
                    <p>Jonathan Mangold</p>
                    <p>Schenkenstraße 10</p>
                    <p>74544 Michelbach</p>
                    <p>E-Mail: <a href="mailto:info@wss-digital.de" className="text-blue-600 hover:text-blue-800">info@wss-digital.de</a></p>
                </section>
                <section className="space-y-2 text-slate-700">
                    <p>
                        Diese Lernplattform richtet sich an Schülerinnen und Schüler der Wirtschaftsschule und stellt interaktive Übungen,
                        Aufgaben sowie begleitende Lernmaterialien zur Verfügung. Alle Inhalte wurden nach bestem Wissen erstellt.
                    </p>
                    <p>
                        Trotz sorgfältiger inhaltlicher Kontrolle übernehmen wir keine Haftung für die Inhalte externer Links. Für den Inhalt
                        der verlinkten Seiten sind ausschließlich deren Betreiber verantwortlich.
                    </p>
                </section>
                <section className="space-y-1 text-slate-700">
                    <p className="font-semibold">Hinweise zur Kontaktaufnahme</p>
                    <p>
                        Bei Fragen, Feedback oder Hinweisen zu Fehlern in den Materialien freuen wir uns über eine kurze Nachricht an die
                        oben genannte E-Mail-Adresse.
                    </p>
                </section>
            </div>
        </div>
    );
};

export default Impressum;

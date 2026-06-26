import React from 'react';
import { Link } from 'react-router-dom';

const SteigungswinkelProzentGrad: React.FC = () => {
    return (
        <div className="min-h-screen bg-[var(--bg-color)]">
            <header className="w-full text-white py-10 sm:py-14 text-center shadow-md relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-700" />
                <div className="relative max-w-4xl mx-auto px-4 space-y-3">
                    <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">Steigungswinkel in Prozent und Grad</h1>
                    <p className="text-base sm:text-lg text-slate-200 max-w-2xl mx-auto">
                        Diese Seite wird in Kürze mit Inhalten gefüllt.
                    </p>
                </div>
            </header>

            <main className="flex-1 w-full px-4 sm:px-6 lg:px-10 py-6 sm:py-8 flex flex-col items-center">
                <Link
                    to="/trigonometrie"
                    className="text-[var(--accent)] hover:underline text-sm sm:text-base"
                >
                    <i className="fa-solid fa-arrow-left mr-2"></i>
                    Zurück zur Übersicht
                </Link>
            </main>
        </div>
    );
};

export default SteigungswinkelProzentGrad;

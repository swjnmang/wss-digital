import React from 'react';
import { Link } from 'react-router-dom';

const FlaechensatzMenu: React.FC = () => {
    return (
        <div className="min-h-screen bg-[var(--bg-color)]">
            <header className="w-full text-white py-10 sm:py-14 text-center shadow-md relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-700" />
                <div className="relative max-w-4xl mx-auto px-4 space-y-3">
                    <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white">Flächensatz im Dreieck</h1>
                    <p className="text-base sm:text-lg text-slate-200 max-w-2xl mx-auto">
                        Wähle einen Bereich, um zu starten.
                    </p>
                </div>
            </header>

            <main className="flex-1 w-full px-4 sm:px-6 lg:px-10 py-6 sm:py-8 flex flex-col items-center">
                <div className="w-full max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                    <Link
                        to="/trigonometrie/flaechensatz/einstieg"
                        className="bg-white rounded-2xl p-5 sm:p-6 text-center text-slate-900 shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex flex-col items-center h-full border border-slate-100"
                    >
                        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-teal-50 flex items-center justify-center text-lg sm:text-xl text-teal-600 mb-3">
                            <i className="fa-solid fa-book-open"></i>
                        </div>
                        <h3 className="text-lg sm:text-xl font-semibold mb-1.5 text-slate-800">Einstiegsaufgaben zum Flächensatz</h3>
                        <p className="text-slate-500 leading-snug text-sm">Verstehe, wie der Flächensatz herleitet wird und wie man ihn anwendet.</p>
                    </Link>
                    <Link
                        to="/trigonometrie/flaechensatz/uebung"
                        className="bg-white rounded-2xl p-5 sm:p-6 text-center text-slate-900 shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex flex-col items-center h-full border border-slate-100"
                    >
                        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-teal-50 flex items-center justify-center text-lg sm:text-xl text-teal-600 mb-3">
                            <i className="fa-solid fa-pen-ruler"></i>
                        </div>
                        <h3 className="text-lg sm:text-xl font-semibold mb-1.5 text-slate-800">Übungsaufgaben zum Flächensatz</h3>
                        <p className="text-slate-500 leading-snug text-sm">Berechne Flächeninhalte, Seiten und Winkel mit dem Flächensatz.</p>
                    </Link>
                </div>
            </main>
        </div>
    );
};

export default FlaechensatzMenu;

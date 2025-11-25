import React from 'react';
import { Link } from 'react-router-dom';

const TrigonometrieIndex: React.FC = () => {
    const topics = [
        {
            title: 'Rechtwinklige Dreiecke 2',
            path: '/trigonometrie/rechtwinklig2',
            description: 'Erweiterte Übungen: Winkel aus Seiten berechnen und Seiten aus Winkel/Seite',
            icon: '📐'
        },
        {
            title: 'Sinussatz',
            path: '/trigonometrie/sinussatz',
            description: 'Seiten und Winkel mithilfe von gegenüberliegenden Paaren berechnen',
            icon: '∿'
        },
        {
            title: 'Kosinussatz',
            path: '/trigonometrie/kosinussatz',
            description: 'Mit zwei Seiten und dem eingeschlossenen Winkel fehlende Größen bestimmen',
            icon: '📏'
        },
        {
            title: 'Flächensatz',
            path: '/trigonometrie/flaechensatz',
            description: 'Flächeninhalt und fehlende Größen im allgemeinen Dreieck berechnen',
            icon: 'areas'
        },
        {
            title: 'Gemischte Anwendungen',
            path: '/trigonometrie/gemischte-aufgaben',
            description: '20 praxisnahe Aufgaben mit Skizzen, Hinweisen und Konzeptfilter',
            icon: '🧭'
        }
    ];

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <Link to="/" className="text-teal-600 hover:text-teal-700 font-bold mb-4 inline-block">
                ← Zurück zur Startseite
            </Link>
            
            <h1 className="text-4xl font-bold text-teal-800 text-center mb-12">
                Trigonometrie
            </h1>

            <div className="grid md:grid-cols-2 gap-6">
                {topics.map((topic) => (
                    <Link 
                        key={topic.path}
                        to={topic.path}
                        className="block bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 hover:border-teal-200 group"
                    >
                        <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                            {topic.icon === 'areas' ? (
                                <svg className="w-10 h-10 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            ) : (
                                <span role="img" aria-label="icon">{topic.icon}</span>
                            )}
                        </div>
                        <h2 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-teal-600 transition-colors">
                            {topic.title}
                        </h2>
                        <p className="text-gray-600">
                            {topic.description}
                        </p>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default TrigonometrieIndex;

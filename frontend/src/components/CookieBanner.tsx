import React, { useEffect, useState } from 'react';

const STORAGE_KEY = 'cookieConsent';

const CookieBanner: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem(STORAGE_KEY);
        if (!consent) {
            setIsVisible(true);
        }
    }, []);

    const acceptCookies = () => {
        localStorage.setItem(STORAGE_KEY, 'accepted');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl shadow-slate-200/80 p-5 z-50">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Cookies & lokale Speicherung</h3>
            <p className="text-sm text-slate-600 mb-4">
                Diese Anwendung verwendet technisch notwendige Cookies und Lokalspeicher-Einträge, um deinen Fortschritt und
                Einstellungen (z. B. Antworten, Einwilligungen) zu sichern. Es werden keine Tracking- oder Marketing-Cookies eingesetzt.
            </p>
            <div className="flex flex-wrap gap-3">
                <button
                    onClick={acceptCookies}
                    className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700"
                >
                    Einverstanden
                </button>
                <button
                    onClick={acceptCookies}
                    className="px-4 py-2 text-sm text-slate-600 font-semibold hover:text-slate-800"
                >
                    Nur notwendige speichern
                </button>
            </div>
        </div>
    );
};

export default CookieBanner;

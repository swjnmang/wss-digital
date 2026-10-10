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
        <div className="bk-card fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md p-5 z-50" style={{ boxShadow: '0 6px 0 var(--edge)' }}>
            <h3 className="text-xl font-extrabold text-ink mb-2 text-left">Cookies & lokale Speicherung</h3>
            <p className="text-sm text-muted mb-4 text-left">
                Diese Anwendung verwendet technisch notwendige Cookies und Lokalspeicher-Einträge, um deinen Fortschritt und
                Einstellungen (z. B. Antworten, Einwilligungen) zu sichern. Es werden keine Tracking- oder Marketing-Cookies eingesetzt.
            </p>
            <div className="flex flex-wrap gap-3">
                <button
                    onClick={acceptCookies}
                    className="bk-btn bk-btn-primary"
                >
                    Einverstanden
                </button>
                <button
                    onClick={acceptCookies}
                    className="bk-btn bk-btn-ghost"
                >
                    Nur notwendige speichern
                </button>
            </div>
        </div>
    );
};

export default CookieBanner;

import { useEffect, useRef, useState } from 'react';
import {
    HelpUsage,
    isTrackingActive,
    logTrackingEntry,
    TRACKING_CHANGE_EVENT
} from '../utils/tracking';

// Für Einzelaufgaben-Seiten (ein Task-State pro Komponente). Kapselt Versuche,
// "sofort richtig" und Lösungsweg-Nutzung der aktuell offenen Aufgabe und schreibt
// beim Abschluss (gelöst / neue Aufgabe / Seite verlassen) einen Eintrag in den
// Nachverfolgungs-Log.
export const useTaskTracking = (topic: string) => {
    const attempts = useRef(0);
    const firstTryCorrect = useRef(false);
    const helpUsed = useRef<HelpUsage>('none');
    const solved = useRef(false);

    const flush = () => {
        if (attempts.current > 0) {
            logTrackingEntry({
                topic,
                attempts: attempts.current,
                firstTryCorrect: firstTryCorrect.current,
                solved: solved.current,
                helpUsed: helpUsed.current
            });
        }
        attempts.current = 0;
        firstTryCorrect.current = false;
        helpUsed.current = 'none';
        solved.current = false;
    };

    const onTaskStart = () => {
        flush();
    };

    const onCheck = (isCorrect: boolean) => {
        if (solved.current) return;
        attempts.current += 1;
        if (attempts.current === 1) {
            firstTryCorrect.current = isCorrect;
        }
        if (isCorrect) {
            solved.current = true;
            flush();
        }
    };

    // Vor dem ersten Versuch angeschaut -> Musterlösung direkt übernommen.
    // Erst nach einem falschen Versuch angeschaut -> als Tipp genutzt.
    const onHintShown = () => {
        if (attempts.current === 0) {
            helpUsed.current = 'solution';
        } else if (helpUsed.current === 'none') {
            helpUsed.current = 'hint';
        }
    };

    useEffect(() => () => flush(), []);

    return { onTaskStart, onCheck, onHintShown };
};

// Für den Header: hält den Aktiv-Status des Nachverfolgungsmodus reaktiv,
// über Routen-/Komponentengrenzen hinweg (kein globaler Context im Projekt).
export const useTrackingSession = () => {
    const [active, setActive] = useState(isTrackingActive);

    useEffect(() => {
        const update = () => setActive(isTrackingActive());
        window.addEventListener(TRACKING_CHANGE_EVENT, update);
        window.addEventListener('storage', update);
        return () => {
            window.removeEventListener(TRACKING_CHANGE_EVENT, update);
            window.removeEventListener('storage', update);
        };
    }, []);

    return active;
};

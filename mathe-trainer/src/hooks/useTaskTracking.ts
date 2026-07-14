import { useEffect, useRef, useState } from 'react';
import {
    isTrackingActive,
    logTrackingEntry,
    TRACKING_CHANGE_EVENT
} from '../utils/tracking';

// Für Einzelaufgaben-Seiten (ein Task-State pro Komponente). Kapselt Versuche,
// "sofort richtig" und Tipp-Nutzung der aktuell offenen Aufgabe und schreibt
// beim Abschluss (gelöst / neue Aufgabe / Seite verlassen) einen Eintrag in den
// Nachverfolgungs-Log.
export const useTaskTracking = (topic: string) => {
    const attempts = useRef(0);
    const firstTryCorrect = useRef(false);
    const hintUsed = useRef(false);
    const solved = useRef(false);

    const flush = () => {
        if (attempts.current > 0) {
            logTrackingEntry({
                topic,
                attempts: attempts.current,
                firstTryCorrect: firstTryCorrect.current,
                solved: solved.current,
                hintUsed: hintUsed.current
            });
        }
        attempts.current = 0;
        firstTryCorrect.current = false;
        hintUsed.current = false;
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

    const onHintShown = () => {
        hintUsed.current = true;
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

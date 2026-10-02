import { useEffect, useRef, useState } from 'react';
import {
    getAreaFromPath,
    HelpUsage,
    isTrackingActive,
    logTrackingEntry,
    TRACKING_CHANGE_EVENT
} from '../utils/tracking';

// Führt flush beim Verlassen der Seite aus: beim Unmount (Navigation innerhalb der App) und
// bei 'pagehide' (Neuladen, Tab schließen, Navigation per vollem Seitenwechsel) - dort laufen
// keine Effekt-Aufräumfunktionen, offene Aufgaben gingen sonst verloren. flush muss daher
// mehrfach aufrufbar sein, ohne doppelt zu loggen.
export const useFlushOnLeave = (flush: () => void) => {
    const flushRef = useRef(flush);
    flushRef.current = flush;
    useEffect(() => {
        const onPageHide = () => flushRef.current();
        window.addEventListener('pagehide', onPageHide);
        return () => {
            window.removeEventListener('pagehide', onPageHide);
            flushRef.current();
        };
    }, []);
};

// Für Einzelaufgaben-Seiten (ein Task-State pro Komponente). Kapselt Versuche,
// "sofort richtig" und Lösungsweg-Nutzung der aktuell offenen Aufgabe und schreibt
// beim Abschluss (gelöst / neue Aufgabe / Seite verlassen) einen Eintrag in den
// Nachverfolgungs-Log.
// shownOnMount: false, wenn beim Öffnen der Seite noch keine Aufgabe sichtbar ist
// (z. B. erst Schwierigkeitsgrad wählen); dann zählt erst onTaskStart die Aufgabe.
export const useTaskTracking = (topic: string, { shownOnMount = true }: { shownOnMount?: boolean } = {}) => {
    const attempts = useRef(0);
    const firstTryCorrect = useRef(false);
    const helpUsed = useRef<HelpUsage>('none');
    const solved = useRef(false);
    // Eingaben gemacht (auch ohne Prüfen) -> "begonnen".
    const started = useRef(false);
    // Aufgabe gelöst und geloggt -> weitere Prüfungen derselben Aufgabe nicht erneut zählen.
    const done = useRef(false);
    // Thema der aktuellen Aufgabe (z. B. mit Schwierigkeitsgrad), überschreibbar per onTaskStart.
    const currentTopic = useRef(topic);
    // Aufgabe ist angezeigt, aber noch nicht abgeschlossen -> zählt auch ohne Versuch
    // als "nicht bearbeitet". Die erste Aufgabe ist mit dem Öffnen der Seite sichtbar.
    const shown = useRef(shownOnMount);
    const firstStart = useRef(true);
    // Bereich beim Mounten festhalten: beim Verlassen der Seite ist die URL schon eine andere.
    const area = useRef(getAreaFromPath(window.location.pathname) ?? undefined);

    const flush = () => {
        if (attempts.current > 0 || shown.current || started.current) {
            logTrackingEntry({
                topic: currentTopic.current,
                area: area.current,
                attempts: attempts.current,
                firstTryCorrect: firstTryCorrect.current,
                solved: solved.current,
                helpUsed: helpUsed.current,
                started: started.current
            });
        }
        shown.current = false;
        started.current = false;
        attempts.current = 0;
        firstTryCorrect.current = false;
        helpUsed.current = 'none';
        solved.current = false;
    };

    const onTaskStart = (taskTopic: string = topic) => {
        // Der erste Aufruf beim Öffnen der Seite erzeugt die bereits gezählte erste Aufgabe.
        if (firstStart.current && attempts.current === 0 && !started.current) {
            firstStart.current = false;
            shown.current = true;
            currentTopic.current = taskTopic;
            return;
        }
        firstStart.current = false;
        flush();
        shown.current = true;
        done.current = false;
        currentTopic.current = taskTopic;
    };

    // Schüler:in hat etwas eingegeben (ohne zu prüfen).
    const onInput = () => {
        if (!done.current) started.current = true;
    };

    const onCheck = (isCorrect: boolean) => {
        if (solved.current || done.current) return;
        attempts.current += 1;
        if (attempts.current === 1) {
            firstTryCorrect.current = isCorrect;
        }
        if (isCorrect) {
            solved.current = true;
            flush();
            done.current = true;
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

    useFlushOnLeave(flush);

    return { onTaskStart, onInput, onCheck, onHintShown };
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

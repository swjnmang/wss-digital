# Mathe-Trainer – Konventionen

## Nachverfolgungsmodus (Tracking)

Jede **neue Übungsaufgabe** in den Bereichen Trigonometrie (`/trigonometrie/...`) und
Lineare Funktionen (`/lineare_funktionen/...`) muss den Nachverfolgungsmodus unterstützen.
Der Modus wird nicht automatisch erkannt: Jede Seite muss ihn selbst einbinden.

- Einzelaufgaben-Seite: `const tracking = useTaskTracking('Thema')` aus `src/hooks/useTaskTracking.ts`
  - `tracking.onTaskStart()` beim Erzeugen einer neuen Aufgabe
  - `tracking.onCheck(isCorrect)` bei jedem echten Prüfen (nicht bei Eingabefehlern)
  - `tracking.onHintShown()` wenn Lösung/Tipp/Lösungsweg eingeblendet wird
- Mehrere Aufgaben gleichzeitig auf einer Seite: `logTrackingEntry(...)` aus `src/utils/tracking.ts`
  direkt nutzen (Beispiele: `trigonometrie/GemischteUebungsaufgaben.tsx`, `lineare_funktionen/GemischteAufgaben.tsx`).
- Der Bereich (`trigonometrie` / `lineare_funktionen`) wird aus der URL abgeleitet; der Header-Button
  und der Bericht (`/<bereich>/nachverfolgung-bericht`) funktionieren dann ohne weitere Arbeit.
- Neuer Themenbereich: in `TRACKING_AREAS` (`src/utils/tracking.ts`) eintragen und eine Bericht-Route in `App.tsx` ergänzen.
- Angezeigte, aber nie geprüfte Aufgaben erscheinen im Bericht als „nicht bearbeitet“ (`attempts: 0`).
  Der Hook erledigt das selbst; bei direktem `logTrackingEntry` muss jede angezeigte Aufgabe beim Generieren
  registriert und beim Flush (neue Aufgabe / Seite verlassen) mitgeloggt werden.

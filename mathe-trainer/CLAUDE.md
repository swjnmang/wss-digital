# Mathe-Trainer – Konventionen

## Nachverfolgungsmodus (Tracking)

Jede **neue Übungsaufgabe** in den Bereichen Trigonometrie (`/trigonometrie/...`) und
Lineare Funktionen (`/lineare_funktionen/...`) muss den Nachverfolgungsmodus unterstützen.
Der Modus wird nicht automatisch erkannt: Jede Seite muss ihn selbst einbinden.

- Einzelaufgaben-Seite: `const tracking = useTaskTracking('Thema')` aus `src/hooks/useTaskTracking.ts`
  - `tracking.onTaskStart()` beim Erzeugen einer neuen Aufgabe
  - `tracking.onCheck(isCorrect)` bei jedem echten Prüfen (nicht bei Eingabefehlern)
  - `tracking.onHintShown()` wenn Lösung/Tipp/Lösungsweg eingeblendet wird
  - `tracking.onInput()` bei Eingaben (Aufgabe erscheint dann als „begonnen, aber nicht geprüft“, auch ohne Prüfen)
  - Thema mit Schwierigkeitsgrad: `tracking.onTaskStart('Thema (Mittel)')`
  - Ist beim Öffnen noch keine Aufgabe sichtbar (erst Schwierigkeitsgrad wählen): `useTaskTracking('Thema', { shownOnMount: false })`
  - Ohne automatische Prüfung (z. B. Zeichnen im Heft): Selbsteinschätzung „stimmt / stimmt nicht“ → `onCheck(...)`
- Mehrere Aufgaben gleichzeitig auf einer Seite: `logTrackingEntry(...)` aus `src/utils/tracking.ts`
  direkt nutzen (Beispiele: `trigonometrie/GemischteUebungsaufgaben.tsx`, `lineare_funktionen/GemischteAufgaben.tsx`).
- Der Bereich (`trigonometrie` / `lineare_funktionen`) wird aus der URL abgeleitet; der Header-Button
  und der Bericht (`/<bereich>/nachverfolgung-bericht`) funktionieren dann ohne weitere Arbeit.
- Neuer Themenbereich: in `TRACKING_AREAS` (`src/utils/tracking.ts`) eintragen und eine Bericht-Route in `App.tsx` ergänzen.
- Angezeigte, aber nie geprüfte Aufgaben erscheinen im Bericht als „nicht bearbeitet“ (`attempts: 0`).
  Der Hook erledigt das selbst; bei direktem `logTrackingEntry` muss jede angezeigte Aufgabe beim Generieren
  registriert und beim Flush (neue Aufgabe / Seite verlassen) mitgeloggt werden.
  Den Flush beim Verlassen über `useFlushOnLeave(flush)` (`src/hooks/useTaskTracking.ts`) einbinden, nicht über
  `useEffect(() => () => flush(), [])`: nur so werden offene Aufgaben auch bei Neuladen/Tab schließen geloggt.
  Der Flush muss mehrfach aufrufbar sein, ohne doppelt zu loggen.
- In der Entwicklung (`npm run dev`, React StrictMode) erscheinen zusätzliche „nicht bearbeitet“-Einträge,
  weil Effekte doppelt laufen. Tracking daher mit `vite build` + `vite preview` testen.

## Git-Workflow

Fertige Änderungen immer direkt in `main` committen und pushen (ausdrücklicher Wunsch des Repo-Inhabers),
nicht nur auf einen Feature-Branch. Vorher `main` aktualisieren und mergen, keine Force-Pushes.

## Automatische Prüfung & Farben für richtig/falsch

- Alle Aufgaben werden automatisch geprüft (`src/hooks/useAutoCheck.ts`, in `App.tsx` eingebunden):
  Nach ca. 1,2 s Tipp-Pause oder beim Verlassen eines Feldes wird der „Prüfen“-Button der Aufgabe ausgelöst,
  sobald alle Felder der Aufgabe ausgefüllt sind und sich die Eingaben seit der letzten Prüfung geändert haben.
- Neue Aufgaben brauchen dafür nichts Eigenes, nur einen Button mit der Beschriftung „Prüfen“, „Überprüfen“,
  „Auswerten“ oder „<ein, zwei Wörter> prüfen“ (z. B. „Lösung prüfen“) in derselben Aufgabenkarte wie die Felder.
- Jedes Eingabefeld (auch Auswahllisten) muss nach dem Prüfen einzeln grün (richtig) bzw. rot (falsch) werden.
  Dafür `fieldCheckClass(zustand)` aus `src/utils/fieldCheck.ts` an die Klasse hängen
  (`true`/'correct' = grün, `false`/'incorrect' = rot, sonst neutral) und den Zustand bei Eingabe und neuer Aufgabe zurücksetzen.
  Bei Aufgaben mit nur einem Feld färbt `useAutoCheck` das Feld anhand der Rückmeldung auch selbst; bei mehreren Feldern
  weiß nur die Seite, welches falsch ist, daher dort immer `fieldCheckClass` je Feld.
- Tabellenfelder ohne eigenen Prüfen-Button (z. B. Tilgungsplan zum Ausfüllen): `CheckedNumberInput`
  (`src/components/CheckedNumberInput.tsx`) mit `expected={…}` verwenden, das prüft sich selbst.
- Farben nur über die Tokens: `var(--correct)` / `var(--correct-soft)` / `var(--correct-ink)` und
  `var(--wrong)` / `var(--wrong-soft)` / `var(--wrong-ink)` (Tailwind `green-*` / `red-*` sind auf dieselbe Palette gelegt).
- Farbe „richtig“ ist Pastell-Mint (#2f9e5b / #dcf5e3), „falsch“ Rot (#d64545 / #fde2e2). Kein Blau für „richtig“.
- Abschalten für einen Bereich: Attribut `data-no-autocheck`. Prüfungsmodus-Seiten (URL mit „pruefung“) sind ausgenommen.

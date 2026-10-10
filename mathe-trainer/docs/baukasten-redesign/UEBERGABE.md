# Baukasten-Redesign – Übergabe

Stand: 2026-10-10 · Alle Bereiche umgestellt und auf Wunsch des Nutzers in `main` gemergt (Branch `redesign-baukasten-2`).

## Entscheidungen des Nutzers
- Design „C · Baukasten“ (Design-System: https://claude.ai/artifact/11HX32HsiudkB3yen3HufZ), **nur hell**.
- Zielgeräte: Tablet quer zuerst, Smartphone hoch, selten PC.
- **Aufgaben, Texte, Zufallsbereiche, Prüflogik, Lösungswege und Nachverfolgung bleiben 1:1** – nur Darstellung/Bedienung ändern.
- GeoGebra bleibt überall; SVG nur als Vorschlag auflisten (nicht selbst umstellen).
- Schriften (Figtree, Bricolage Grotesque) und Font Awesome selbst gehostet (npm), kein Google-CDN.
- Mathe-Tastatur auf Touch-Geräten (global, `src/components/MathKeypad.tsx`).
- Erklärvideos: erst beim Klick laden, youtube-nocookie, eingebettet (`VideoEmbed` im Inhalt, `VideoButton`/`VideoModal` als Fenster); Start-/Endzeiten erhalten.
- Ergänzungen erlaubt: Bereiche gliedern (Abschnitte), Emojis in Knöpfen durch Icons ersetzen, Suche, **Gemischtes Training** (noch offen).
- Mit umstellen: Druck/PDF (Schrift), Nachverfolgung + Bericht, Impressum, Cookie-Hinweis. Excel-Trainer **nicht**.
- Kein gespeicherter Fortschritt/kein Login.
- Vorgehen: erst Pilot (Lineare Funktionen) → Freigabe → restliche Bereiche.

## Was fertig ist
- Grundgerüst: Tokens/Palette (`tailwind.config.cjs` bildet Tailwind-Farben auf Baukasten ab, `src/main.css`), `src/styles/layout.css`, `src/styles/kit.css` (bk-*-Bausteine), Kopfleiste (`components/layout/AppHeader.tsx`), Suche (`SearchOverlay.tsx`), Seitenrahmen (`TaskShell.tsx`), Bereichsseite (`pages/AreaPage.tsx`), Startseite (`pages/Home.tsx`), Bereichsverzeichnis (`src/data/areas.ts`, Raum & Form kommt aus `pages/raum_und_form/registry.ts`).
- `main.tsx` lädt `main.css` **vor** App, damit CSS-Module die globalen Klassen überschreiben können.
- `public/style.css`: keine erzwungene Zentrierung mehr.
- Pilot **Lineare Funktionen**: alle 32 Seiten umgestellt (Ausnahme bewusst: „Wer wird Millionär?“ behält Quizshow-Look).

## Zweite Runde (alle Bereiche)
- Bereichsseiten aller sieben Bereiche über `AreaPage` (alte `*Index.tsx` gelöscht); Quadratische Funktionen mit allen 15 Übungen in `areas.ts`.
- Untermenüs (Terme, Brüche, Potenzen, Wurzeln, Prozentrechnung, Gleichungen, Zinsrechnung, alle Anwendungsaufgaben-Listen, Raum-&-Form-Themen) über `components/layout/MenuPage.tsx`.
- Raum & Form: Engine (`engine/PracticePage.tsx`, `TaskCard.tsx`) im Baukasten; `TaskShell` hat dafür `parent` (Zwischenebene im Kopf).
- Trigonometrie: Engine `engine/Practice.tsx` + Sonderseiten (Gemischt, Prüfungsmodus, Anwendungsaufgaben, Nachverfolgungs-Bericht).
- Rechnen lernen, Finanzmathematik, Quadratische Funktionen, Daten und Zufall: alle Übungsseiten in `TaskShell`, Knöpfe/Karten/Rückmeldungen als bk-Bausteine, Videos über `VideoEmbed`/`VideoButton`.
- Gemischtes Training: `/gemischtes-training` (`pages/GemischtesTraining.tsx`, `data/training.ts`) – 10 zufällige Übungen reihum aus den gewählten Bereichen, Untermenüs werden durch ihre Übungen ersetzt, Tests/Spiele ausgenommen; Zusammenstellung und Haken nur in sessionStorage.
- Impressum im Baukasten, Druckansicht (`@media print` in `styles/layout.css`: Kopfleiste/Tastatur/Cookie-Hinweis aus, keine Schatten).
- Tailwind: `rounded`/`-md`/`-lg`/`-xl` weicher (8/10/12/16 px), damit Altseiten zum Baukasten passen.
- SVG-Kandidaten: siehe `SVG-KANDIDATEN.md`.

## Was offen ist
1. Feedback des Nutzers zu allen Bereichen einarbeiten.
2. Bewusst nicht umgestellt: Excel-Trainer, „Wer wird Millionär?“ (Quizshow-Look), `quadratische_funktionen/MarioSpiel.tsx` (keine Route).
3. PDF-Erzeugung (jsPDF: Prüfungszertifikate, Bericht, Übungsblatt) nutzt weiterhin Helvetica; Figtree müsste als TTF eingebettet werden.
4. Innere Details mancher Altseiten (z. B. farbige Spezialknöpfe in Template-Strings) sind über die Palette angepasst, aber nicht einzeln nachgezeichnet.

## Arbeitsweise / Werkzeuge (`tools/`)
- `bk.py`: `Page`-Klasse (rep/sub mit Zählprüfung, Abbruch bei Abweichung), `yt_modal`, `common`, `primary`, `shell`/`close_shell`.
- `family.py`: Umstellung der „neuen“ Seiten mit Konstanten `panel`/`btnPrimary`/`btnSecondary` (+ `skin()` für häufige Tailwind-Muster, `videos()` → VideoEmbed, `wrappers()` → TaskShell).
- `check_modules.py`: findet CSS-Modul-Klassen, die eine Seite nutzt, aber das Modul nicht definiert (auch Umlaute wie `lösungBox`).
- `ashot.sh`: Headless-Chrome-Screenshot einer lokalen Route (Breite ≥ 500 px; Handy-Ansicht im Browser-Pane prüfen); `SHOT_DIR`/`SHOT_PORT` setzen.
- `sheet.py`: viele Routen auf einmal fotografieren und als Übersichtsbild zusammensetzen (Routen ohne führenden `/` angeben – Git-Bash wandelt sie sonst in Windows-Pfade um).
- `legacy.py`: allgemeine Umstellung klassischer Seiten (`frame` → TaskShell, `skin`, `buttons`, `videos`); `do_*.py` = Sonderfälle je Bereich; `rebtn.py` wiederholt Knopf-/Klassen-Umstellung; `logic_check.py` listet entfernte Nicht-Darstellungszeilen.
- Achtung: Vite cached bei OneDrive gelegentlich eine leere Datei → Dev-Server neu starten.
- Nach jeder Umstellung: `npx vite build`, Diff auf entfernte Logikzeilen prüfen (`git diff -U0 origin/main -- <dateien> | grep '^-'`), Screenshots.
- Python-Skripte als Dateien schreiben (Heredocs mit JSX/Quotes brechen in der Bash dieses Rechners).

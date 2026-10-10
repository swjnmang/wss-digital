# Baukasten-Redesign – Übergabe

Stand: 2026-10-10 · Branch: `redesign-baukasten-2` (auf origin/main aufgesetzt) · **nicht in main mergen**, bis der Nutzer alles getestet und freigegeben hat.

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

## Was offen ist
1. Feedback des Nutzers zum Pilot einarbeiten.
2. Übrige Bereiche: Trigonometrie (läuft über `pages/trigonometrie/engine/Practice.tsx` → einmal umstellen deckt viel ab), Raum & Form (eigene Engine `pages/raum_und_form/engine`), Rechnen lernen (verschachtelt), Finanzmathematik, Quadratische Funktionen, Daten und Zufall. Bereichsseiten-Routen auf `<AreaPage id="…" />` umstellen.
3. Gemischtes Training (Startseiten-Kachel steht als „Folgt nach dem Pilot“).
4. Druck/PDF-Schrift, Nachverfolgungs-Bericht, Impressum.
5. Liste der SVG-Kandidaten (statische GeoGebra-Graphen) für den Nutzer.
6. Vercel-Vorschau: Projekt „wss-digital“ (Root mathe-trainer) baut Branches, die nicht `claude/**` heißen; Vorschau ist per Vercel-Login geschützt.

## Arbeitsweise / Werkzeuge (`tools/`)
- `bk.py`: `Page`-Klasse (rep/sub mit Zählprüfung, Abbruch bei Abweichung), `yt_modal`, `common`, `primary`, `shell`/`close_shell`.
- `family.py`: Umstellung der „neuen“ Seiten mit Konstanten `panel`/`btnPrimary`/`btnSecondary` (+ `skin()` für häufige Tailwind-Muster, `videos()` → VideoEmbed, `wrappers()` → TaskShell).
- `check_modules.py`: findet CSS-Modul-Klassen, die eine Seite nutzt, aber das Modul nicht definiert (auch Umlaute wie `lösungBox`).
- `ashot.sh`: Headless-Chrome-Screenshot einer lokalen Route (Breite ≥ 500 px; Handy-Ansicht im Browser-Pane prüfen).
- Nach jeder Umstellung: `npx vite build`, Diff auf entfernte Logikzeilen prüfen (`git diff -U0 origin/main -- <dateien> | grep '^-'`), Screenshots.
- Python-Skripte als Dateien schreiben (Heredocs mit JSX/Quotes brechen in der Bash dieses Rechners).

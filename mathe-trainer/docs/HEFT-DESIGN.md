# Heft-Design

Stand: 2026-10-11 · löst das Baukasten-Design ab. Entwürfe: https://claude.ai/artifact/86JtHB47aEeUWeEosC8E9q (Reihe „E · Heft“).

## Entscheidungen des Nutzers
- Ruhig statt bunt: Karopapier, Tinte (`#1b2433`), Füller-Blau (`#1d3f9e`) als einzige Akzentfarbe. Bereiche haben keine eigenen Farben mehr.
- Schrift: Atkinson Hyperlegible (selbst gehostet, `@fontsource/atkinson-hyperlegible`).
- Zielgeräte: Tablet quer zuerst, dann Smartphone.
- Navigation wie ein Heft-Inhaltsverzeichnis: Bereiche = Kapitel (1–7), Übungen nummeriert (z. B. 2.5), Pfad „Inhalt / 2 Finanzmathematik“ über jedem Titel.
- Suche immer erreichbar (Kopfzeile, Startseite, auf dem Handy zusätzlich in der Leiste unten).
- Leiste unten (Inhalt · Suchen · Prüfung) nur auf dem Handy.
- Kein Korrekturrand: Auswertung und Rechenwege bleiben unter den Aufgaben (lange Rechenwege passen nicht an den Rand).
- Tabellen (z. B. Tilgungsplan) bleiben echte Tabellen: auf dem Handy seitlich wischen, erste Spalte bleibt stehen
  (globale Regel in `styles/layout.css` für Tabellen in `.overflow-x-auto` innerhalb von `.bk-task-body`).
- Rechenwege mathematisch korrekt mit KaTeX.
- Startseite ohne „Los geht’s“ und ohne Kachel „10 Übungen aus allen Bereichen“.
- Neues Kapitel „Vorbereitung Abschlussprüfung“ (`/abschlusspruefung`, `data/areas.ts` → `EXAM`):
  Rechnen ohne Taschenrechner, Finanzmathe, Funktionen, Raum & Form, Daten & Zufall, Trigonometrie (Inhalt folgt,
  Platzhalter `/abschlusspruefung/:teil`) und „Alles gemischt“ (vorerst → Gemischtes Training).
- Aufgaben, Texte, Prüflogik bleiben 1:1 – nur Darstellung/Bedienung.

## Umsetzung
- Tokens in `src/main.css` (gleiche Variablennamen wie im Baukasten), Tailwind-Farbfamilien in `tailwind.config.cjs`
  auf die Heft-Palette gelegt (lila/rosa/türkis → Blau, orange → Gelb), harte Schatten aus, Rahmen 1,5 px.
- `components/layout/ContentIndex.tsx` (Inhaltsverzeichnis), `BottomNav.tsx`, `TaskShell.tsx` (Pfad + Nummer),
  `MenuPage.tsx`, `pages/Home.tsx`, `pages/AreaPage.tsx` (Seitenleiste ab 900 px), `pages/Abschlusspruefung.tsx`.
- Offene Idee: „Mathe-Stadt“ als zweite, spielerische Navigation (Skizze im Entwurf).

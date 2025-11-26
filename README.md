# wss-digital

Zentrale Landingpage der Wirtschaftsschule digital mit Links zu mehreren eigenständigen Lern-Apps.

## Projektstruktur

- `index.html` – moderne Landingpage im Repo-Root (lokale Vorschau).
- `docs/index.html` – identische Landingpage-Kopie für GitHub Pages (Pages-Quelle: `main` → `docs`).
- `mathe-trainer/` – Vite/Tailwind-App mit interaktiven Matheaufgaben (deployt via Vercel, Root-Dir entsprechend wählen).
- `digital-bildung/`, `planspiel/`, `module/` – leere Container-Verzeichnisse für kommende Apps; jedes erhält später sein eigenes Build-Setup und Deployment.
- `archive_original_site/` – Archiv der ursprünglichen statischen Seiten.
- `scripts/` – Node-Skripte zum Kopieren oder Archivieren älterer Inhalte.

## Workflow für neue Apps

1. Lege den App-Code in einem der vorgesehenen Ordner (oder füge bei Bedarf einen neuen Unterordner hinzu) mit eigener `package.json` an.
2. Passe die Landingpage (`index.html`) an, damit der entsprechende Button auf den neuen Pfad oder das externe Deployment zeigt.
3. Kopiere Änderungen danach in `docs/index.html`, damit GitHub Pages (Quelle `docs/`) dieselbe Version ausliefert.
4. Deploye jede App separat (z. B. über Vercel) und verwende dabei das jeweilige Unterverzeichnis als Root Directory.

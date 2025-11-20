# Mathe-Trainer — Frontend (Vite + React + TypeScript)

Dieses Verzeichnis enthält ein kleines Vite + React (TypeScript) Grundgerüst für das Projekt `mathe-trainer`.

Schnellstart (in PowerShell):

```powershell
cd frontend
npm install
npm run dev
```

Build für Produktion:

```powershell
npm run build
npm run preview
```

Deployment auf Vercel:

- Wenn du das gesamte Repo deployen willst, lege beim Vercel-Projekt den Project Root / Root Directory auf `frontend` fest.
- Build Command: `npm run build`, Output Directory: `dist` (oder verwende die automatisch erkannten Einstellungen)

Nächste Schritte:

- Alte HTML-Seiten aus dem Repository nach `src/pages/` verschieben und als React-Komponenten anpassen.
- Assets aus dem Root-Ordner ggf. nach `public/` oder `src/assets/` verschieben.

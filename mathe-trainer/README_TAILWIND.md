Tailwind & CSS Modules — quick setup

What I changed:
- Added Tailwind config (`tailwind.config.cjs`) and PostCSS config (`postcss.config.cjs`).
- Added Tailwind directives to `src/main.css`.
- Added typing for CSS Modules in `src/types/css.d.ts`.
- Converted the `lineare_funktionen` topic pages into React components under `src/pages/lineare_funktionen/` and used a small CSS Module for shared styles.

What you need to do locally:
1. From the `mathe-trainer` folder run:

```powershell
npm install
```

2. Start the dev server:

```powershell
npm run dev
```

Notes:
- Tailwind requires `postcss` and `tailwindcss` to be installed — they are added to `devDependencies` in `package.json` but you must run `npm install` locally.
- CSS Modules are supported by Vite out of the box (`*.module.css`).
- I converted the interactive "Steigung aus zwei Punkten" page to a React component with the same logic and added other placeholder pages for the section.

/** @type {import('tailwindcss').Config} */

// Heft-Design: Die Tailwind-Farbfamilien werden auf die Heft-Palette abgebildet,
// damit alle bestehenden Seiten ohne Eingriff in die Aufgabenlogik die neue Farbwelt bekommen.
// grün = "richtig" (Pastell-Mint), rot = "falsch" (Rot), grau/slate = kühle Neutraltöne (Tinte),
// blau = Füller-Blau. Bunte Familien (lila, rosa, türkis) laufen auf Blau, damit es ruhig bleibt.
const neutral = {
  50: '#f7f8fa', 100: '#eef1f6', 200: '#e3e6eb', 300: '#c3c9d2', 400: '#8a93a1',
  500: '#6b7482', 600: '#5b6472', 700: '#3f4757', 800: '#2a3242', 900: '#1b2433', 950: '#0f1520',
}
const blue = {
  50: '#f1f4fb', 100: '#e8edf8', 200: '#cdd8f0', 300: '#a3b6e3', 400: '#6f8cd0',
  500: '#3f63bd', 600: '#1d3f9e', 700: '#183585', 800: '#142b6b', 900: '#112456', 950: '#0b1838',
}
const correct = {
  50: '#effaf3', 100: '#dcf5e3', 200: '#b9ebc8', 300: '#8ddba5', 400: '#5cc47f',
  500: '#2f9e5b', 600: '#24834a', 700: '#1e6b3d', 800: '#1a5532', 900: '#154529', 950: '#0b2a18',
}
const wrong = {
  50: '#fef2f2', 100: '#fde2e2', 200: '#fbc5c5', 300: '#f59b9b', 400: '#ec6c6c',
  500: '#d64545', 600: '#b93232', 700: '#a32d2d', 800: '#842626', 900: '#6b2020', 950: '#401010',
}
const yellow = {
  50: '#fffbea', 100: '#fff4cc', 200: '#ffe999', 300: '#ffdc66', 400: '#ffcf33',
  500: '#f2b705', 600: '#c99300', 700: '#8a5a00', 800: '#6e4800', 900: '#5a3b00', 950: '#3a2600',
}

module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}', './public/**/*.html'],
  theme: {
    extend: {
      colors: {
        gray: neutral, slate: neutral, zinc: neutral, neutral: neutral, stone: neutral,
        blue: blue, sky: blue, indigo: blue, cyan: blue, teal: blue,
        green: correct, emerald: correct, lime: correct,
        red: wrong, rose: wrong, pink: blue,
        yellow: yellow, amber: yellow, orange: yellow,
        purple: blue, violet: blue, fuchsia: blue,
        // Semantische Baukasten-Tokens (siehe src/main.css)
        ground: 'var(--ground)',
        surface: 'var(--surface)',
        sunken: 'var(--surface-sunken)',
        ink: 'var(--ink)',
        muted: 'var(--ink-muted)',
        edge: 'var(--edge)',
        primary: 'var(--primary)',
        accent: 'var(--highlight)',
      },
      fontFamily: {
        sans: ['"Atkinson Hyperlegible"', '"Segoe UI"', 'system-ui', 'sans-serif'],
        display: ['"Atkinson Hyperlegible"', '"Segoe UI"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        // Ecken wie im Heft-Design (auch für bestehende rounded-/rounded-lg-Klassen)
        DEFAULT: '8px',
        md: '10px',
        lg: '12px',
        xl: '16px',
        bk: '14px',
        'bk-sm': '10px',
      },
      boxShadow: {
        hard: 'none',
        'hard-sm': 'none',
      },
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */

// Baukasten-Design: Die Tailwind-Farbfamilien werden auf die Baukasten-Palette abgebildet,
// damit alle bestehenden Seiten ohne Eingriff in die Aufgabenlogik die neue Farbwelt bekommen.
// grün = "richtig" (Petrol), rot = "noch nicht" (Orange), grau/slate = warme Neutraltöne.
const neutral = {
  50: '#faf9f6', 100: '#f3f2ee', 200: '#e3e0d8', 300: '#cfcbc1', 400: '#a29e94',
  500: '#85817a', 600: '#5a5750', 700: '#45423c', 800: '#2b2926', 900: '#191919', 950: '#0e0e0e',
}
const blue = {
  50: '#eef4ff', 100: '#dbe8ff', 200: '#bcd6ff', 300: '#8ec5ff', 400: '#5a9bf5',
  500: '#2f74e6', 600: '#1a56db', 700: '#1745b0', 800: '#163a8a', 900: '#142f6b', 950: '#0f2150',
}
const correct = {
  50: '#ecf7fa', 100: '#dff0f6', 200: '#b4dfeb', 300: '#7cc6dc', 400: '#3ea7c4',
  500: '#128aa8', 600: '#0b6a8f', 700: '#0a5876', 800: '#0a475f', 900: '#0a3a4d', 950: '#06262f',
}
const wrong = {
  50: '#fef4ee', 100: '#fde6da', 200: '#f9c9b0', 300: '#f4a47f', 400: '#ec7a4c',
  500: '#d95a24', 600: '#b03a0a', 700: '#923009', 800: '#74280b', 900: '#5e220c', 950: '#3a1405',
}
const yellow = {
  50: '#fffbea', 100: '#fff4cc', 200: '#ffe999', 300: '#ffdc66', 400: '#ffcf33',
  500: '#f2b705', 600: '#c99300', 700: '#8a5a00', 800: '#6e4800', 900: '#5a3b00', 950: '#3a2600',
}
const coral = {
  50: '#fff3ee', 100: '#ffe4d9', 200: '#ffc9b5', 300: '#ff9f80', 400: '#f9805a',
  500: '#ec6339', 600: '#c94c24', 700: '#a33c1c', 800: '#7f2f17', 900: '#632614', 950: '#3d170b',
}
const lavender = {
  50: '#f6f2ff', 100: '#ece5ff', 200: '#dccfff', 300: '#c9b6ff', 400: '#a88cf7',
  500: '#8a6ae8', 600: '#6f4fd0', 700: '#5b3fb0', 800: '#4a348c', 900: '#3c2c6e', 950: '#251a47',
}
const teal = {
  50: '#ecfbfb', 100: '#d3f5f5', 200: '#a8eaea', 300: '#6fd6d6', 400: '#3ebdbd',
  500: '#1f9f9f', 600: '#13807f', 700: '#126766', 800: '#125352', 900: '#114443', 950: '#062b2b',
}

module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}', './public/**/*.html'],
  theme: {
    extend: {
      colors: {
        gray: neutral, slate: neutral, zinc: neutral, neutral: neutral, stone: neutral,
        blue: blue, sky: blue, indigo: blue, cyan: teal, teal: teal,
        green: correct, emerald: correct, lime: correct,
        red: wrong, rose: wrong, pink: coral,
        yellow: yellow, amber: yellow, orange: coral,
        purple: lavender, violet: lavender, fuchsia: lavender,
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
        sans: ['"Figtree Variable"', 'Figtree', '"Segoe UI"', 'system-ui', 'sans-serif'],
        display: ['"Bricolage Grotesque Variable"', '"Bricolage Grotesque"', '"Segoe UI"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        bk: '24px',
        'bk-sm': '12px',
      },
      boxShadow: {
        hard: '0 4px 0 #191919',
        'hard-sm': '0 3px 0 #191919',
      },
    },
  },
  plugins: [],
}

// Bilddateien (z. B. gerenderte Bilder der Lernsituationen) liefert Vite als URL
declare module '*.webp' {
  const src: string
  export default src
}

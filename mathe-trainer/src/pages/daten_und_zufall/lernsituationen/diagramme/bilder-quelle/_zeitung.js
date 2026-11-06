// Gemeinsame Bausteine der Bildwelt Reportage / Zeitung: Zeitungspapier, Rasterpunkte, Druckkorn (alles Schwarzweiß).
window.ZT = {
  defs: `<defs>
  <pattern id="raster" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="8" height="8" fill="#f4f1ea"/><circle cx="4" cy="4" r="1.9" fill="#222"/></pattern>
  <pattern id="rasterHell" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="8" height="8" fill="#f4f1ea"/><circle cx="4" cy="4" r="1.1" fill="#444"/></pattern>
  <filter id="korn"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="5"/><feColorMatrix values="0 0 0 0 .2  0 0 0 0 .2  0 0 0 0 .2  0 0 0 .14 0"/></filter>
  <filter id="schatten"><feDropShadow dx="6" dy="9" stdDeviation="8" flood-opacity=".35"/></filter>
 </defs>`,
  korn: (w, h) => `<rect width="${w}" height="${h}" filter="url(#korn)"/>`,
  zeilen: (x, y, w, n, abst = 18) => Array.from({ length: n }, (_, i) => `<rect x="${x}" y="${y + i * abst}" width="${i === n - 1 ? w * 0.6 : w}" height="7" fill="#9a968e"/>`).join(''),
};

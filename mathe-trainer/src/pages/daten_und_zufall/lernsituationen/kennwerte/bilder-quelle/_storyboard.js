// Gemeinsame Bausteine der Bildwelt Comic / Storyboard: graue Marker, Bleistiftlinien, Bildrahmen mit Szenen- und Kameraangabe, eine Akzentfarbe.
window.SB = (akzent) => ({
  defs: `<defs>
  <filter id="marker"><feTurbulence type="fractalNoise" baseFrequency=".04 .6" numOctaves="2" seed="4"/><feDisplacementMap in="SourceGraphic" scale="6"/></filter>
  <filter id="strich"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="1" seed="2"/><feDisplacementMap in="SourceGraphic" scale="2.2"/></filter>
  <filter id="korn"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="9"/><feColorMatrix values="0 0 0 0 .3  0 0 0 0 .3  0 0 0 0 .3  0 0 0 .08 0"/></filter>
 </defs>`,
  papier: (w, h) => `<rect width="${w}" height="${h}" fill="#f7f6f2"/>`,
  korn: (w, h) => `<rect width="${w}" height="${h}" filter="url(#korn)"/>`,
  // Bildrahmen mit Szenen-Nummer und Kameraangabe darüber
  rahmen: (x, y, w, h, szene, kamera, inhalt) =>
    `<text x="${x}" y="${y - 12}" font-family="Bangers" font-size="26" letter-spacing="1" fill="#2b2b2b">SZENE ${szene}</text>` +
    `<text x="${x + w}" y="${y - 12}" text-anchor="end" font-family="Comic Neue" font-weight="700" font-size="22" fill="#777">${kamera}</text>` +
    `<clipPath id="c${szene}"><rect x="${x}" y="${y}" width="${w}" height="${h}"/></clipPath><g clip-path="url(#c${szene})"><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#fff"/>${inhalt}</g>` +
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="#2b2b2b" stroke-width="4"/>`,
  // Markerfläche in Grau (hell, mittel, dunkel) oder Akzent
  grau: (d, ton = 1) => `<path d="${d}" fill="${['#e2e2df', '#c4c4c0', '#9a9a95'][ton]}" filter="url(#marker)"/>`,
  akz: (d) => `<path d="${d}" fill="${akzent}" fill-opacity=".85" filter="url(#marker)"/>`,
  linie: (d, w = 4) => `<path d="${d}" fill="none" stroke="#2b2b2b" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" filter="url(#strich)"/>`,
  notiz: (x, y, text, fs = 24, anchor = 'start') => `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="Comic Neue" font-weight="700" font-size="${fs}" fill="#2b2b2b">${text}</text>`,
  pfeil: (x1, y1, x2, y2) => `<path d="M${x1} ${y1} L${x2} ${y2}" stroke="${akzent}" stroke-width="5" fill="none" marker-end="url(#spitze)"/>`,
});

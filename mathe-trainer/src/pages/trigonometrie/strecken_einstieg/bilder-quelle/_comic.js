// Gemeinsame Bausteine der Bildwelt Comic (Unter-Variante pop): Rasterpunkte, Panels, Sprechblasen, Erzählkasten.
// farbe = Themenfarbe, hell = heller Ton der Themenfarbe
window.CO = (farbe, hell) => ({
  defs: `<defs>
  <pattern id="pT" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(20)"><rect width="14" height="14" fill="${hell}"/><circle cx="7" cy="7" r="3.4" fill="${farbe}" fill-opacity=".55"/></pattern>
  <pattern id="pG" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="12" height="12" fill="#fff6c9"/><circle cx="6" cy="6" r="3" fill="#f5c400"/></pattern>
  <pattern id="pF" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(30)"><rect width="9" height="9" fill="#fff"/><circle cx="4.5" cy="4.5" r="1.5" fill="${farbe}" fill-opacity=".35"/></pattern>
  <filter id="korn" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="9"/><feColorMatrix type="matrix" values="0 0 0 0 .2  0 0 0 0 .15  0 0 0 0 .05  0 0 0 .07 0"/></filter>
 </defs>`,
  papier: (w, h) => `<rect width="${w}" height="${h}" fill="#fbf8ef"/>`,
  korn: (w, h) => `<rect width="${w}" height="${h}" filter="url(#korn)"/>`,
  // Panel als Polygon mit Füllung und Inhalt (geclippt)
  panel: (id, pts, fill, inhalt) => `<clipPath id="${id}"><polygon points="${pts}"/></clipPath><g clip-path="url(#${id})"><polygon points="${pts}" fill="${fill}"/>${inhalt}</g><polygon points="${pts}" fill="none" stroke="#141414" stroke-width="7" stroke-linejoin="round"/>`,
  // Sprechblase (Rechteck mit Zipfel nach (zx, zy)), Zeilen zentriert
  blase: (x, y, w, h, zx, zy, zeilen, fs = 28) => {
    const r = 16, bx = Math.min(Math.max(zx, x + 40), x + w - 80);
    const unten = zy > y + h;
    const path = unten
      ? `M${x + r} ${y} H${x + w - r} Q${x + w} ${y} ${x + w} ${y + r} V${y + h - r} Q${x + w} ${y + h} ${x + w - r} ${y + h} H${bx + 40} L${zx} ${zy} L${bx} ${y + h} H${x + r} Q${x} ${y + h} ${x} ${y + h - r} V${y + r} Q${x} ${y} ${x + r} ${y} Z`
      : `M${x + r} ${y} H${bx} L${zx} ${zy} L${bx + 40} ${y} H${x + w - r} Q${x + w} ${y} ${x + w} ${y + r} V${y + h - r} Q${x + w} ${y + h} ${x + w - r} ${y + h} H${x + r} Q${x} ${y + h} ${x} ${y + h - r} V${y + r} Q${x} ${y} ${x + r} ${y} Z`;
    const lh = fs * 1.22, y0 = y + h / 2 - ((zeilen.length - 1) * lh) / 2 + fs * 0.35;
    return `<path d="${path}" fill="#fff" stroke="#141414" stroke-width="5" stroke-linejoin="round"/>` +
      zeilen.map((z, i) => `<text x="${x + w / 2}" y="${y0 + i * lh}" font-family="Comic Neue" font-weight="700" font-size="${fs}" text-anchor="middle" fill="#141414">${z}</text>`).join('');
  },
  kasten: (x, y, w, h, text, fs = 34, rot = -2) => `<g transform="rotate(${rot} ${x + w / 2} ${y + h / 2})"><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#f5c400" stroke="#141414" stroke-width="5"/><text x="${x + w / 2}" y="${y + h / 2 + fs * 0.36}" font-family="Lilita One" font-size="${fs}" text-anchor="middle" fill="#141414" letter-spacing="1">${text}</text></g>`,
  laut: (x, y, text, fs = 56, rot = -6, fill = '#f5c400') => `<text x="${x}" y="${y}" font-family="Bangers" font-size="${fs}" fill="${fill}" stroke="#141414" stroke-width="5" paint-order="stroke" transform="rotate(${rot} ${x} ${y})" letter-spacing="2">${text}</text>`,
});

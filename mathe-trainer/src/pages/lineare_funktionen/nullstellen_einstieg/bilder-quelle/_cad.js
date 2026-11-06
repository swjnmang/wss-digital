// Gemeinsame Bausteine der Bildwelt Bauplan / CAD dunkel: Linien in hellem Grau und der Themenfarbe auf Anthrazit, Raster, Maßlinien, Schriftfeld
window.CAD = (akzent) => ({
  L: '#d9dee6', A: akzent,
  defs: `<defs>
  <pattern id="r1" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" fill="none" stroke="#fff" stroke-opacity=".05"/></pattern>
  <pattern id="r5" width="100" height="100" patternUnits="userSpaceOnUse"><path d="M100 0H0V100" fill="none" stroke="#fff" stroke-opacity=".1"/></pattern>
  <pattern id="schraffur" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="8" stroke="#d9dee6" stroke-opacity=".45" stroke-width="1.3"/></pattern>
  <marker id="pf" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="12" markerHeight="12" orient="auto-start-reverse" markerUnits="userSpaceOnUse"><path d="M0 1.5 L10 5 L0 8.5 Z" fill="#d9dee6"/></marker>
  <radialGradient id="glow" cx=".5" cy=".4" r=".8"><stop offset="0" stop-color="#2b313c"/><stop offset="1" stop-color="#1b1f26"/></radialGradient>
 </defs>`,
  grund: (w, h) => `<rect width="${w}" height="${h}" fill="url(#glow)"/><rect width="${w}" height="${h}" fill="url(#r1)"/><rect width="${w}" height="${h}" fill="url(#r5)"/>`,
  mass: (x1, y1, x2, y2, text, farbe = '#d9dee6') => {
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, vert = x1 === x2, tw = text.length * 11.5 + 16;
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${farbe}" stroke-width="1.5" marker-start="url(#pf)" marker-end="url(#pf)"/><rect x="${mx - tw / 2}" y="${vert ? my - 16 : my - 30}" width="${tw}" height="${vert ? 30 : 28}" fill="#21262e"/><text x="${mx}" y="${vert ? my + 8 : my - 9}" font-family="Barlow Condensed" font-weight="600" font-size="24" fill="${farbe}" text-anchor="middle">${text}</text>`;
  },
  feld: (x, y, w, titel, zeilen, akzent) => {
    const zh = 42, h = 50 + zeilen.length * zh;
    let s = `<g font-family="Barlow Condensed" fill="#d9dee6"><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#20252d" stroke="#d9dee6" stroke-width="1.6"/><rect x="${x}" y="${y}" width="${w}" height="50" fill="${akzent}" fill-opacity=".25"/><line x1="${x}" x2="${x + w}" y1="${y + 50}" y2="${y + 50}" stroke="#d9dee6" stroke-width="1.6"/><text x="${x + 16}" y="${y + 34}" font-size="28" font-weight="700" fill="#fff">${titel}</text>`;
    zeilen.forEach(([k, v], i) => {
      const yy = y + 50 + i * zh;
      if (i) s += `<line x1="${x}" x2="${x + w}" y1="${yy}" y2="${yy}" stroke="#d9dee6" stroke-opacity=".6"/>`;
      s += `<text x="${x + 14}" y="${yy + 28}" font-size="20" font-weight="500" fill-opacity=".7">${k}</text><text x="${x + 132}" y="${yy + 29}" font-size="24" font-weight="600">${v}</text>`;
    });
    return s + `<line x1="${x + 120}" x2="${x + 120}" y1="${y + 50}" y2="${y + h}" stroke="#d9dee6" stroke-opacity=".6"/></g>`;
  },
});

// Gemeinsame Bausteine der Bildwelt Bauplan / Millimeterpapier: orangefarbenes mm-Raster, schwarze Tusche, Akzent in der Themenfarbe
window.MM = {
  T: '#1a1a1a',
  defs: `<defs>
  <pattern id="mm1" width="8" height="8" patternUnits="userSpaceOnUse"><path d="M8 0H0V8" fill="none" stroke="#e08a3c" stroke-opacity=".22" stroke-width=".8"/></pattern>
  <pattern id="mm5" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="#e08a3c" stroke-opacity=".45" stroke-width="1.1"/></pattern>
  <pattern id="mm10" width="80" height="80" patternUnits="userSpaceOnUse"><path d="M80 0H0V80" fill="none" stroke="#d26e1e" stroke-opacity=".55" stroke-width="1.6"/></pattern>
  <filter id="tusche"><feTurbulence type="fractalNoise" baseFrequency="1.2" seed="5"/><feDisplacementMap in="SourceGraphic" scale="1.1"/></filter>
  <filter id="korn" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="3"/><feColorMatrix type="matrix" values="0 0 0 0 .4  0 0 0 0 .3  0 0 0 0 .2  0 0 0 .06 0"/></filter>
  <marker id="pf" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="12" markerHeight="12" orient="auto-start-reverse" markerUnits="userSpaceOnUse"><path d="M0 1.5 L10 5 L0 8.5 Z" fill="#1a1a1a"/></marker>
 </defs>`,
  grund: (w, h) => `<rect width="${w}" height="${h}" fill="#fdfcf6"/><rect width="${w}" height="${h}" fill="url(#mm1)"/><rect width="${w}" height="${h}" fill="url(#mm5)"/><rect width="${w}" height="${h}" fill="url(#mm10)"/>`,
  korn: (w, h) => `<rect width="${w}" height="${h}" filter="url(#korn)"/>`,
  feld: (x, y, w, titel, zeilen, akzent) => {
    const zh = 42, h = 50 + zeilen.length * zh;
    let s = `<g font-family="Barlow Condensed" fill="#1a1a1a"><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#fff" stroke="#1a1a1a" stroke-width="2"/><rect x="${x + 5}" y="${y + 5}" width="${w - 10}" height="${h - 10}" fill="none" stroke="#1a1a1a" stroke-width=".8"/><line x1="${x}" x2="${x + w}" y1="${y + 50}" y2="${y + 50}" stroke="#1a1a1a" stroke-width="1.6"/><text x="${x + 16}" y="${y + 34}" font-size="28" font-weight="700" fill="${akzent}">${titel}</text>`;
    zeilen.forEach(([k, v], i) => {
      const yy = y + 50 + i * zh;
      if (i) s += `<line x1="${x}" x2="${x + w}" y1="${yy}" y2="${yy}" stroke="#1a1a1a" stroke-opacity=".6"/>`;
      s += `<text x="${x + 14}" y="${yy + 28}" font-size="20" font-weight="500" fill-opacity=".7">${k}</text><text x="${x + 132}" y="${yy + 29}" font-size="24" font-weight="600">${v}</text>`;
    });
    return s + `<line x1="${x + 120}" x2="${x + 120}" y1="${y + 50}" y2="${y + h}" stroke="#1a1a1a" stroke-opacity=".6"/></g>`;
  },
};

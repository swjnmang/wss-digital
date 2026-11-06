// Gemeinsame Bausteine der Bildwelt Bauplan / Blaupause (wird von den *.bild.html dieses Ordners eingebunden)
window.BP = {
  defs: `<defs>
  <filter id="papier" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".012" numOctaves="3" seed="4" result="w"/><feColorMatrix in="w" type="matrix" values="0 0 0 0 .05  0 0 0 0 .2  0 0 0 0 .42  0 0 0 .55 0"/><feComposite in2="SourceGraphic" operator="over"/></filter>
  <filter id="korn" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="7"/><feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .07 0"/></filter>
  <filter id="druck"><feTurbulence type="fractalNoise" baseFrequency="1.4" seed="3"/><feDisplacementMap in="SourceGraphic" scale="1.2"/></filter>
  <pattern id="raster" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" fill="none" stroke="#fff" stroke-opacity=".09"/></pattern>
  <pattern id="raster100" width="100" height="100" patternUnits="userSpaceOnUse"><path d="M100 0H0V100" fill="none" stroke="#fff" stroke-opacity=".16"/></pattern>
  <pattern id="schraffur" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="8" stroke="#fff" stroke-opacity=".55" stroke-width="1.4"/></pattern>
  <marker id="pf" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="12" markerHeight="12" orient="auto-start-reverse" markerUnits="userSpaceOnUse"><path d="M0 1.5 L10 5 L0 8.5 Z" fill="#fff"/></marker>
 </defs>`,
  grund: (w, h) => `<rect width="${w}" height="${h}" fill="#1d5596"/><rect width="${w}" height="${h}" fill="#1d5596" filter="url(#papier)"/><rect width="${w}" height="${h}" fill="url(#raster)"/><rect width="${w}" height="${h}" fill="url(#raster100)"/>
  <rect x="20" y="20" width="${w - 40}" height="${h - 40}" fill="none" stroke="#fff" stroke-opacity=".85" stroke-width="2.5"/><rect x="28" y="28" width="${w - 56}" height="${h - 56}" fill="none" stroke="#fff" stroke-opacity=".5"/>`,
  korn: (w, h) => `<rect width="${w}" height="${h}" filter="url(#korn)"/>`,
  // Maßlinie mit Pfeilen und Text in der Mitte (horizontal oder vertikal)
  mass: (x1, y1, x2, y2, text, seite = 1) => {
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, vert = x1 === x2;
    const tw = text.length * 12 + 16;
    const box = vert ? `<rect x="${mx - tw / 2}" y="${my - 16}" width="${tw}" height="30" fill="#1d5596"/>` : `<rect x="${mx - tw / 2}" y="${my - 30}" width="${tw}" height="28" fill="#1d5596"/>`;
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#fff" stroke-width="1.5" marker-start="url(#pf)" marker-end="url(#pf)"/>${box}<text x="${mx}" y="${vert ? my + 9 : my - 9}" font-family="Barlow Condensed" font-weight="600" font-size="26" fill="#fff" text-anchor="middle">${text}</text>`;
  },
  feld: (x, y, w, titel, zeilen) => {
    const zh = 44, h = 50 + zeilen.length * zh;
    let s = `<g font-family="Barlow Condensed" fill="#fff"><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#1a4d88" stroke="#fff" stroke-width="1.8"/><line x1="${x}" x2="${x + w}" y1="${y + 50}" y2="${y + 50}" stroke="#fff" stroke-width="1.8"/><text x="${x + 16}" y="${y + 35}" font-size="29" font-weight="700">${titel}</text>`;
    zeilen.forEach(([k, v], i) => {
      const yy = y + 50 + i * zh;
      if (i) s += `<line x1="${x}" x2="${x + w}" y1="${yy}" y2="${yy}" stroke="#fff" stroke-width="1.2"/>`;
      s += `<text x="${x + 16}" y="${yy + 30}" font-size="21" font-weight="500" fill-opacity=".75">${k}</text><text x="${x + 128}" y="${yy + 31}" font-size="25" font-weight="600">${v}</text>`;
    });
    return s + `<line x1="${x + 116}" x2="${x + 116}" y1="${y + 50}" y2="${y + h}" stroke="#fff" stroke-width="1.2"/></g>`;
  },
};

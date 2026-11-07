// Gemeinsame Zeichnungen der Lernsituation „Die Drehleiter“ (Bildwelt Comic / pop): Fahrzeug mit Leiter, Hauswand, Maßpfeile.
window.DL = (() => {
  const ink = '#141414';
  const kupfer = '#9a4515';
  const rad = (g) => (g * Math.PI) / 180;
  // Fahrzeug von der Seite, Drehpunkt bei (dx, dy); Leiter mit Länge len (px) und Winkel w (Grad)
  const fahrzeug = (dx, dy, len, w, s = 1) => {
    const ex = dx + len * Math.cos(rad(w));
    const ey = dy - len * Math.sin(rad(w));
    const n = Math.floor(len / 26);
    let sprossen = '';
    for (let i = 1; i < n; i++) {
      const t = i / n;
      const x = dx + (ex - dx) * t, y = dy + (ey - dy) * t;
      const nx = -Math.sin(rad(w)) * 9, ny = -Math.cos(rad(w)) * 9;
      sprossen += `<line x1="${x - nx}" y1="${y - ny}" x2="${x + nx}" y2="${y + ny}" stroke="${ink}" stroke-width="3"/>`;
    }
    const nx = -Math.sin(rad(w)) * 9, ny = -Math.cos(rad(w)) * 9;
    return `<g stroke="${ink}" stroke-width="5" stroke-linejoin="round">
      <rect x="${dx - 170 * s}" y="${dy + 4}" width="${230 * s}" height="${62 * s}" rx="8" fill="${kupfer}"/>
      <path d="M${dx + 60 * s} ${dy + 4} h${70 * s} l${26 * s} ${30 * s} v${32 * s} h-${96 * s} z" fill="${kupfer}"/>
      <rect x="${dx + 74 * s}" y="${dy + 12}" width="${40 * s}" height="${22 * s}" fill="#d6eef2"/>
      <rect x="${dx - 160 * s}" y="${dy + 22}" width="${200 * s}" height="${12 * s}" fill="#fff"/>
      <circle cx="${dx - 120 * s}" cy="${dy + 70 * s}" r="${22 * s}" fill="#fff"/><circle cx="${dx + 110 * s}" cy="${dy + 70 * s}" r="${22 * s}" fill="#fff"/>
      <rect x="${dx - 18}" y="${dy - 12}" width="36" height="18" fill="#9aa3ab"/>
      <line x1="${dx + nx}" y1="${dy + ny}" x2="${ex + nx}" y2="${ey + ny}" stroke-width="5"/>
      <line x1="${dx - nx}" y1="${dy - ny}" x2="${ex - nx}" y2="${ey - ny}" stroke-width="5"/>
      ${sprossen}
      <circle cx="${dx}" cy="${dy}" r="9" fill="#fff"/>
    </g>`;
  };
  // Winkelbogen am Drehpunkt mit Text
  const winkel = (dx, dy, w, r, text, fs = 34) => {
    const x2 = dx + r * Math.cos(rad(w)), y2 = dy - r * Math.sin(rad(w));
    const tx = dx + (r + 14) * Math.cos(rad(w / 2)) + 8, ty = dy - (r + 14) * Math.sin(rad(w / 2)) + 10;
    return `<path d="M${dx} ${dy} L${dx + r} ${dy} A${r} ${r} 0 0 0 ${x2} ${y2} Z" fill="#f5c400" stroke="${ink}" stroke-width="4"/>
      <line x1="${dx}" y1="${dy}" x2="${dx + r + 40}" y2="${dy}" stroke="${ink}" stroke-width="3" stroke-dasharray="10 7"/>
      <text x="${tx}" y="${ty}" font-family="Bangers" font-size="${fs}" fill="${ink}" letter-spacing="1">${text}</text>`;
  };
  // Hauswand mit Fensterraster ab x, Boden bei yb, oben bis yt
  const haus = (x, yt, yb, breite, fill = '#fff') => {
    let f = '';
    for (let y = yb - 70; y > yt + 20; y -= 62) for (let xx = x + 26; xx < x + breite - 50; xx += 76) f += `<rect x="${xx}" y="${y}" width="44" height="34" fill="#d6eef2" stroke="${ink}" stroke-width="3"/>`;
    return `<rect x="${x}" y="${yt}" width="${breite}" height="${yb - yt}" fill="${fill}" stroke="${ink}" stroke-width="6"/>${f}`;
  };
  // senkrechter Maßpfeil mit Beschriftung
  const mass = (x, y1, y2, text, fs = 34, links = true, schrift = 'Bangers') => `<g stroke="${ink}" stroke-width="4" fill="${ink}">
    <line x1="${x}" y1="${y1}" x2="${x}" y2="${y2}"/>
    <path d="M${x} ${y1} l-9 16 h18 z" stroke-width="2"/><path d="M${x} ${y2} l-9 -16 h18 z" stroke-width="2"/></g>
    <text x="${links ? x - 14 : x + 14}" y="${(y1 + y2) / 2 + fs * 0.35}" text-anchor="${links ? 'end' : 'start'}" font-family="${schrift}" font-weight="700" font-size="${fs}" fill="${ink}" stroke="#fff" stroke-width="6" paint-order="stroke" letter-spacing="1">${text}</text>`;
  return { fahrzeug, winkel, haus, mass, ink, kupfer, rad };
})();

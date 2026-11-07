// Gemeinsame Bausteine der Lernsituation „Das Balkonkraftwerk“ (Bildwelt Diorama / Sommerwiese): isometrische Quader, Solarmodul, Bühne.
window.ISO = (ox, oy) => {
  const c = Math.cos(Math.PI / 6), s = Math.sin(Math.PI / 6);
  const P = (x, y, z) => [ox + (x - y) * c, oy + (x + y) * s - z];
  const poly = (pts, fill, extra = '') => `<polygon points="${pts.map((p) => P(...p).join(',')).join(' ')}" fill="${fill}" ${extra}/>`;
  const box = (x, y, z, w, d, h, top, left, right) =>
    poly([[x, y + d, z], [x + w, y + d, z], [x + w, y + d, z + h], [x, y + d, z + h]], left) +
    poly([[x + w, y, z], [x + w, y + d, z], [x + w, y + d, z + h], [x + w, y, z + h]], right) +
    poly([[x, y, z + h], [x + w, y, z + h], [x + w, y + d, z + h], [x, y + d, z + h]], top);
  // Solarmodul: Unterkante bei (x..x+w, y0, z0), steigt in -y-Richtung (nach hinten) um den Winkel a mit Länge L
  const modul = (x, y0, z0, w, L, a, farbe = '#0e6670') => {
    const r = (a * Math.PI) / 180, dy = L * Math.cos(r), dz = L * Math.sin(r);
    let g = '';
    // Stützen hinten
    g += box(x + 6, y0 - dy - 3, z0, 6, 6, dz, '#8a96a0', '#7a858e', '#6a747c');
    g += box(x + w - 12, y0 - dy - 3, z0, 6, 6, dz, '#8a96a0', '#7a858e', '#6a747c');
    g += poly([[x, y0, z0], [x + w, y0, z0], [x + w, y0 - dy, z0 + dz], [x, y0 - dy, z0 + dz]], farbe, 'stroke="#22313d" stroke-width="2"');
    // Zellenraster
    for (let i = 1; i < 6; i++) {
      const t = i / 6;
      g += `<line x1="${P(x + w * t, y0, z0)[0]}" y1="${P(x + w * t, y0, z0)[1]}" x2="${P(x + w * t, y0 - dy, z0 + dz)[0]}" y2="${P(x + w * t, y0 - dy, z0 + dz)[1]}" stroke="rgba(255,255,255,.35)" stroke-width="1.5"/>`;
    }
    for (let i = 1; i < 4; i++) {
      const t = i / 4;
      g += `<line x1="${P(x, y0 - dy * t, z0 + dz * t)[0]}" y1="${P(x, y0 - dy * t, z0 + dz * t)[1]}" x2="${P(x + w, y0 - dy * t, z0 + dz * t)[0]}" y2="${P(x + w, y0 - dy * t, z0 + dz * t)[1]}" stroke="rgba(255,255,255,.35)" stroke-width="1.5"/>`;
    }
    return g;
  };
  const baum = (x, y) => {
    const [px, py] = P(x, y, 26);
    return box(x - 4, y - 4, 0, 8, 8, 26, '#8a6a45', '#7a5a35', '#6a4a2a') + `<circle cx="${px}" cy="${py - 22}" r="26" fill="#4f9a5d"/><circle cx="${px - 9}" cy="${py - 30}" r="12" fill="#6bb877"/>`;
  };
  const insel = (x, y, w, d) => box(x, y, -56, w, d, 48, '#9fd18f', '#8a6a45', '#73573a') + box(x, y, -8, w, d, 8, '#9fd18f', '#78b06b', '#679a5c');
  const schild = (x, y, zeilen, breite = 220) => {
    const [sx, sy] = P(x, y, 0);
    const h = 24 + zeilen.length * 32;
    return `<line x1="${sx}" y1="${sy}" x2="${sx}" y2="${sy - 70}" stroke="#6a4a2a" stroke-width="6"/>` +
      `<rect x="${sx - breite / 2}" y="${sy - 70 - h}" width="${breite}" height="${h}" rx="12" fill="#fff" stroke="#24323f" stroke-width="3"/>` +
      zeilen.map((z, i) => `<text x="${sx}" y="${sy - 70 - h + 40 + i * 32}" text-anchor="middle" font-family="Fredoka" font-size="${i === 0 ? 26 : 24}" font-weight="${i === 0 ? 600 : 500}" fill="${i === 0 ? '#0e6670' : '#24323f'}">${z}</text>`).join('');
  };
  const hintergrund = (w, h) => `<defs><radialGradient id="bg" cx=".5" cy=".35" r=".85"><stop offset="0" stop-color="#f6f9fb"/><stop offset="1" stop-color="#d6e4ec"/></radialGradient><filter id="sh"><feGaussianBlur stdDeviation="20"/></filter></defs><rect width="${w}" height="${h}" fill="url(#bg)"/>`;
  const label = (x, y, text, farbe = '#24323f', fs = 26, anchor = 'middle') => `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="Fredoka" font-size="${fs}" font-weight="600" fill="${farbe}" stroke="#fff" stroke-width="6" paint-order="stroke">${text}</text>`;
  return { P, poly, box, modul, baum, insel, schild, hintergrund, label };
};

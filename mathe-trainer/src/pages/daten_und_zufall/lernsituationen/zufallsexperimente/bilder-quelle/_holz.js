// Gemeinsame Bausteine der Bildwelt Diorama / Holzspielzeug: isometrische Klötze mit Holzmaserung, lackierte Farben, weiche Schatten.
window.HZ = (ox, oy, k = 1) => {
  const c = Math.cos(Math.PI / 6), s = Math.sin(Math.PI / 6);
  const P = (x, y, z) => [ox + (x - y) * c * k, oy + (x + y) * s * k - z * k];
  const poly = (pts, fill, extra = '') => '<polygon points="' + pts.map((p) => P(...p).join(',')).join(' ') + '" fill="' + fill + '" ' + extra + '/>';
  const box = (x, y, z, w, d, h, top, left, right, mas = true) =>
    poly([[x, y + d, z], [x + w, y + d, z], [x + w, y + d, z + h], [x, y + d, z + h]], left, mas ? 'filter="url(#maser)"' : '') +
    poly([[x + w, y, z], [x + w, y + d, z], [x + w, y + d, z + h], [x + w, y, z + h]], right, mas ? 'filter="url(#maser)"' : '') +
    poly([[x, y, z + h], [x + w, y, z + h], [x + w, y + d, z + h], [x, y + d, z + h]], top, mas ? 'filter="url(#maser)"' : '');
  const defs = (w, h) => `<defs><radialGradient id="bg" cx=".5" cy=".4" r=".85"><stop offset="0" stop-color="#fbf4e8"/><stop offset="1" stop-color="#ead9bf"/></radialGradient>
   <filter id="sh"><feGaussianBlur stdDeviation="16"/></filter>
   <filter id="maser" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".004 .09" numOctaves="2" seed="6" result="t"/><feColorMatrix in="t" values="0 0 0 0 .35  0 0 0 0 .2  0 0 0 0 .08  0 0 0 .55 -.1" result="m"/><feComposite in="m" in2="SourceGraphic" operator="in" result="mm"/><feBlend in="SourceGraphic" in2="mm" mode="multiply"/></filter>
   <filter id="lack"><feSpecularLighting surfaceScale="2" specularConstant=".5" specularExponent="18" lighting-color="#fff" result="sp"><fePointLight x="-200" y="-300" z="400"/></feSpecularLighting><feComposite in="sp" in2="SourceAlpha" operator="in" result="s2"/><feComposite in="SourceGraphic" in2="s2" operator="arithmetic" k2="1" k3=".35"/></filter></defs>
   <rect width="${w}" height="${h}" fill="url(#bg)"/>`;
  return { P, poly, box, defs };
};
// Glücksrad als lackierte Holzscheibe (Frontansicht mit Kante). felder = Liste der Füllfarben, zeichen = Liste der Symbole
window.RAD = (cx, cy, r, felder, zeichen = [], kante = 16) => {
  const n = felder.length, w = 360 / n;
  const pt = (rr, g) => [cx + rr * Math.sin((g * Math.PI) / 180), cy - rr * Math.cos((g * Math.PI) / 180)];
  let g = `<ellipse cx="${cx + kante * 0.6}" cy="${cy + kante * 0.4}" rx="${r}" ry="${r}" fill="#b98a55" filter="url(#maser)"/>`;
  felder.forEach((f, i) => {
    const [x0, y0] = pt(r, i * w), [x1, y1] = pt(r, (i + 1) * w), [tx, ty] = pt(r * 0.7, i * w + w / 2);
    g += `<path d="M${cx} ${cy} L${x0} ${y0} A${r} ${r} 0 0 1 ${x1} ${y1} Z" fill="${f}" stroke="#5a3d22" stroke-width="2.5"/>`;
    if (zeichen[i]) g += `<text x="${tx}" y="${ty + 12}" text-anchor="middle" font-family="Arial" font-weight="700" font-size="${r * 0.2}" fill="#2b2140">${zeichen[i]}</text>`;
  });
  g += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#5a3d22" stroke-width="5"/><circle cx="${cx}" cy="${cy}" r="${r * 0.1}" fill="#d9a441" stroke="#5a3d22" stroke-width="3"/>`;
  return `<g filter="url(#lack)">${g}</g>`;
};

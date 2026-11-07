// Gemeinsame Bausteine der Bildwelt Bauplan / Lasercut: Sperrholzplatte mit Maserung, ausgeschnittene Bauteile mit Brandkanten,
// eingravierte Beschriftungen, Maßlinien und Winkelbögen in der Themenfarbe, Schriftfeld. Schrift Barlow Condensed.
window.LC = {
  T: '#3b230e', // Brandkante / Gravur
  A: '#8a5800', // Themenfarbe Ocker (Maße, Winkel)
  defs: `<defs>
  <filter id="lc-holz" x="0" y="0" width="100%" height="100%">
   <feTurbulence type="fractalNoise" baseFrequency=".0025 .09" numOctaves="3" seed="11"/>
   <feColorMatrix type="matrix" values="0 0 0 0 .55  0 0 0 0 .36  0 0 0 0 .16  0 0 0 .55 -.12"/>
  </filter>
  <filter id="lc-korn" x="0" y="0" width="100%" height="100%">
   <feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="4"/>
   <feColorMatrix type="matrix" values="0 0 0 0 .35  0 0 0 0 .22  0 0 0 0 .1  0 0 0 .08 0"/>
  </filter>
  <filter id="lc-brand" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="2.2"/></filter>
  <filter id="lc-schatten" x="-10%" y="-10%" width="130%" height="130%"><feDropShadow dx="5" dy="7" stdDeviation="5" flood-color="#3b230e" flood-opacity=".28"/></filter>
  <filter id="lc-rauh"><feTurbulence type="fractalNoise" baseFrequency="1.1" seed="6"/><feDisplacementMap in="SourceGraphic" scale="1"/></filter>
  <marker id="lc-pf" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="14" markerHeight="14" orient="auto-start-reverse" markerUnits="userSpaceOnUse"><path d="M0 1.5 L10 5 L0 8.5 Z" fill="#8a5800"/></marker>
 </defs>`,
  /** Sperrholzplatte als Untergrund */
  grund: (w, h, farbe = '#ecd3a4') =>
    `<rect width="${w}" height="${h}" fill="${farbe}"/><rect width="${w}" height="${h}" filter="url(#lc-holz)"/><rect width="${w}" height="${h}" filter="url(#lc-korn)"/>`,
  /** Ausgeschnittenes Bauteil: hellere Holzfläche, Schatten, Brandkante */
  teil: (d, farbe = '#f3dfb7') =>
    `<g><path d="${d}" fill="${farbe}" filter="url(#lc-schatten)"/><path d="${d}" fill="#000" fill-opacity=".001" stroke="#5a3412" stroke-opacity=".35" stroke-width="9" filter="url(#lc-brand)"/>` +
    `<path d="${d}" fill="none" stroke="#3b230e" stroke-width="3" stroke-linejoin="round" filter="url(#lc-rauh)"/></g>`,
  /** Eingravierter Text */
  gravur: (x, y, t, size = 26, anchor = 'start', farbe = '#4a2b10', weight = 600, rot = 0) =>
    `<text x="${x}" y="${y}" font-family="Barlow Condensed" font-weight="${weight}" font-size="${size}" text-anchor="${anchor}" fill="${farbe}" fill-opacity=".92"${rot ? ` transform="rotate(${rot} ${x} ${y})"` : ''}>${t}</text>`,
  /** Maßlinie zwischen zwei Punkten, um abstand senkrecht versetzt, Beschriftung mittig auf hellem Grund */
  mass: (x1, y1, x2, y2, label, abstand = 34, farbe = '#8a5800') => {
    const dx = x2 - x1, dy = y2 - y1, l = Math.hypot(dx, dy), nx = -dy / l, ny = dx / l;
    const a = [x1 + nx * abstand, y1 + ny * abstand], b = [x2 + nx * abstand, y2 + ny * abstand];
    const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
    let rot = (Math.atan2(dy, dx) * 180) / Math.PI;
    if (rot > 90) rot -= 180;
    if (rot < -90) rot += 180;
    const bw = label.length * 12.5 + 18;
    return `<g stroke="${farbe}" fill="none" stroke-width="1.6"><path d="M${x1 + nx * 8} ${y1 + ny * 8} L${a[0] + nx * 8} ${a[1] + ny * 8} M${x2 + nx * 8} ${y2 + ny * 8} L${b[0] + nx * 8} ${b[1] + ny * 8}" stroke-opacity=".75"/>` +
      `<path d="M${a[0]} ${a[1]} L${b[0]} ${b[1]}" stroke-width="2" marker-start="url(#lc-pf)" marker-end="url(#lc-pf)"/></g>` +
      `<g transform="translate(${mx} ${my}) rotate(${rot})"><rect x="${-bw / 2}" y="-17" width="${bw}" height="34" rx="3" fill="#fbf3e2" stroke="${farbe}" stroke-width="1.4"/>` +
      `<text x="0" y="9" text-anchor="middle" font-family="Barlow Condensed" font-weight="700" font-size="26" fill="${farbe}">${label}</text></g>`;
  },
  /** Winkelbogen am Scheitel (cx, cy) von Richtung w1 bis w2 (Grad, mathematisch, y nach oben) */
  winkel: (cx, cy, r, w1, w2, label, farbe = '#8a5800', lr = r + 26) => {
    const p = (w, rr) => [cx + rr * Math.cos((w * Math.PI) / 180), cy - rr * Math.sin((w * Math.PI) / 180)];
    const [ax, ay] = p(w1, r), [bx, by] = p(w2, r), m = (w1 + w2) / 2, [lx, ly] = p(m, lr);
    return `<path d="M${cx} ${cy} L${ax} ${ay} A${r} ${r} 0 0 0 ${bx} ${by} Z" fill="${farbe}" fill-opacity=".22" stroke="${farbe}" stroke-width="2.5"/>` +
      `<text x="${lx}" y="${ly + 10}" text-anchor="middle" font-family="Barlow Condensed" font-weight="700" font-size="30" fill="${farbe}">${label}</text>`;
  },
  /** Rechter Winkel als Viertelkreis mit Punkt (nie als Quadrat); Ecke (x, y), Richtungen sx/sy der beiden Schenkel */
  rechter: (x, y, sx, sy, s = 28, farbe = '#3b230e') =>
    `<path d="M${x + sx * s} ${y} A${s} ${s} 0 0 ${sx * sy > 0 ? 1 : 0} ${x} ${y + sy * s}" fill="none" stroke="${farbe}" stroke-width="2.2"/><circle cx="${x + sx * s * 0.38}" cy="${y + sy * s * 0.38}" r="3.2" fill="${farbe}"/>`,
  /** Schriftfeld wie auf einer technischen Zeichnung, aber eingraviert */
  feld: (x, y, w, titel, zeilen) => {
    const zh = 40, h = 48 + zeilen.length * zh, T = '#3b230e';
    let s = `<g font-family="Barlow Condensed"><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#fbf3e2" fill-opacity=".9" stroke="${T}" stroke-width="2"/><rect x="${x + 5}" y="${y + 5}" width="${w - 10}" height="${h - 10}" fill="none" stroke="${T}" stroke-width=".8"/><line x1="${x}" x2="${x + w}" y1="${y + 48}" y2="${y + 48}" stroke="${T}" stroke-width="1.6"/><text x="${x + 16}" y="${y + 33}" font-size="27" font-weight="700" fill="#8a5800">${titel}</text>`;
    zeilen.forEach(([k, v], i) => {
      const yy = y + 48 + i * zh;
      if (i) s += `<line x1="${x}" x2="${x + w}" y1="${yy}" y2="${yy}" stroke="${T}" stroke-opacity=".5"/>`;
      s += `<text x="${x + 14}" y="${yy + 27}" font-size="21" font-weight="500" fill="${T}" fill-opacity=".75">${k}</text><text x="${x + 128}" y="${yy + 28}" font-size="24" font-weight="700" fill="${T}">${v}</text>`;
    });
    return s + `<line x1="${x + 116}" x2="${x + 116}" y1="${y + 48}" y2="${y + h}" stroke="${T}" stroke-opacity=".5"/></g>`;
  },
};

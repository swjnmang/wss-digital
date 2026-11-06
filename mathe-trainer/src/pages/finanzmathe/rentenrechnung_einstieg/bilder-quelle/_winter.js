// Gemeinsame Bausteine der Bildwelt Diorama / Winter: isometrische Projektion (P), Flächen (poly), Quader (box), verschneite Bäume und Schneeflocken.
window.DI = (ox, oy, k = 1) => {
  const c = Math.cos(Math.PI / 6), s = Math.sin(Math.PI / 6);
  const P = (x, y, z) => [ox + (x - y) * c * k, oy + (x + y) * s * k - z * k];
  const poly = (pts, fill, extra = '') => '<polygon points="' + pts.map((p) => P(...p).join(',')).join(' ') + '" fill="' + fill + '" ' + extra + '/>';
  const box = (x, y, z, w, d, h, top, left, right) =>
    poly([[x, y + d, z], [x + w, y + d, z], [x + w, y + d, z + h], [x, y + d, z + h]], left) +
    poly([[x + w, y, z], [x + w, y + d, z], [x + w, y + d, z + h], [x + w, y, z + h]], right) +
    poly([[x, y, z + h], [x + w, y, z + h], [x + w, y + d, z + h], [x, y + d, z + h]], top);
  const baum = (x, y) => {
    let g = box(x - 4, y - 4, 0, 8, 8, 16, '#8a6a45', '#7a5a35', '#6a4a2a');
    const [px, py] = P(x, y, 16);
    g += `<polygon points="${px - 26},${py} ${px + 26},${py} ${px},${py - 46}" fill="#3f7a5a"/><polygon points="${px - 20},${py - 22} ${px + 20},${py - 22} ${px},${py - 62}" fill="#4f8f68"/>`;
    g += `<polygon points="${px - 8},${py - 48} ${px + 8},${py - 48} ${px},${py - 62}" fill="#fff"/><path d="M${px - 22} ${py - 24} Q${px} ${py - 30} ${px + 22} ${py - 24}" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round"/>`;
    return g;
  };
  const flocken = (w, h, n = 70, seed = 3) => {
    let r = seed, g = '';
    const rnd = () => ((r = (r * 9301 + 49297) % 233280) / 233280);
    for (let i = 0; i < n; i++) g += `<circle cx="${(rnd() * w).toFixed(1)}" cy="${(rnd() * h).toFixed(1)}" r="${(1.5 + rnd() * 3).toFixed(1)}" fill="#fff" opacity="${(0.55 + rnd() * 0.4).toFixed(2)}"/>`;
    return g;
  };
  const insel = (x, y, w, d) =>
    box(x, y, -60, w, d, 60, '#f7fafc', '#9a7650', '#7f6040') + box(x, y, -8, w, d, 8, '#f7fafc', '#dfe8f0', '#c9d6e2') + poly([[x, y, 0], [x + w, y, 0], [x + w, y + d, 0], [x, y + d, 0]], '#f7fafc');
  const hinter = (w, h) =>
    `<defs><radialGradient id="bg" cx=".5" cy=".35" r=".85"><stop offset="0" stop-color="#ffffff"/><stop offset=".6" stop-color="#e6eef6"/><stop offset="1" stop-color="#c9d7e6"/></radialGradient><filter id="sh"><feGaussianBlur stdDeviation="18"/></filter></defs><rect width="${w}" height="${h}" fill="url(#bg)"/>`;
  return { P, poly, box, baum, flocken, insel, hinter };
};

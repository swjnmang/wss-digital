// Seitenansicht im Diorama-Stil (Bildwelt Diorama / Sommerwiese): schwebende Wiesenscheibe, Garage, Solarmodul mit Stütze und Winkelbogen.
// 1 m = 260 px. Für balkonkraftwerk-dach und balkonkraftwerk-stuetze.
window.SEITE = ({ loecher = false, schild = false } = {}) => {
  const m = 260, a = Math.asin(0.8 / 1.72);
  const A = [330, 330], L = 1.72 * m;
  const T = [A[0] + L * Math.cos(a), A[1] - L * Math.sin(a)];
  const lab = (x, y, t, f = '#22313d', fs = 30, anchor = 'middle') => `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="Fredoka" font-size="${fs}" font-weight="600" fill="${f}" stroke="#fff" stroke-width="7" paint-order="stroke">${t}</text>`;
  let g = `<defs><radialGradient id="bg" cx=".5" cy=".35" r=".85"><stop offset="0" stop-color="#f6f9fb"/><stop offset="1" stop-color="#d6e4ec"/></radialGradient><filter id="sh"><feGaussianBlur stdDeviation="18"/></filter></defs><rect width="1200" height="600" fill="url(#bg)"/>`;
  g += `<g fill="#fff" opacity=".85"><ellipse cx="170" cy="90" rx="70" ry="22"/><ellipse cx="215" cy="78" rx="46" ry="22"/></g>`;
  g += `<g transform="translate(1050 100)"><circle r="40" fill="#f6c445"/>${[...Array(10)].map((_, i) => `<line x1="0" y1="-54" x2="0" y2="-72" stroke="#f6c445" stroke-width="6" stroke-linecap="round" transform="rotate(${i * 36})"/>`).join('')}</g>`;
  g += `<ellipse cx="600" cy="575" rx="420" ry="18" fill="#5b6b7a" opacity=".25" filter="url(#sh)"/>`;
  // Wiesenscheibe mit Tiefe
  g += `<path d="M120 520 L160 500 L1100 500 L1060 520 Z" fill="#9fd18f"/><rect x="120" y="520" width="940" height="16" fill="#78b06b"/><rect x="120" y="536" width="940" height="26" fill="#8a6a45"/>`;
  // Garage: Seitenwand mit Dachplatte, leichte Tiefe nach hinten
  g += `<path d="M230 340 L262 322 L1002 322 L970 340 Z" fill="#bcc6cd"/>`;
  g += `<rect x="230" y="340" width="740" height="180" fill="#ece8e1" stroke="#22313d" stroke-width="2"/><rect x="222" y="${A[1]}" width="756" height="12" rx="3" fill="#cfd8de" stroke="#22313d" stroke-width="2"/>`;
  g += `<rect x="290" y="400" width="80" height="60" fill="#cfe6ee" stroke="#22313d" stroke-width="2"/>`;
  // Bäume
  [[180, 500], [1030, 500]].forEach(([x, y]) => { g += `<rect x="${x - 6}" y="${y - 50}" width="12" height="50" fill="#7a5a35"/><circle cx="${x}" cy="${y - 74}" r="34" fill="#4f9a5d"/><circle cx="${x - 12}" cy="${y - 86}" r="14" fill="#6bb877"/>`; });
  // Stütze (mit Lochraster)
  const fussY = A[1];
  g += `<rect x="${T[0] - 8}" y="${loecher ? A[1] - 1.05 * m : T[1]}" width="16" height="${loecher ? 1.05 * m : A[1] - T[1]}" rx="4" fill="#8a96a0" stroke="#22313d" stroke-width="2"/>`;
  // Modul mit Rahmen und Tiefe
  const n = [-Math.sin(a), -Math.cos(a)];
  g += `<polygon points="${A[0]},${A[1]} ${T[0]},${T[1]} ${T[0] + 26 * Math.cos(a + Math.PI / 2) * -1},${T[1] - 18} ${A[0] + 26 * Math.cos(a + Math.PI / 2) * -1},${A[1] - 18}" fill="#0b5058"/>`;
  g += `<line x1="${A[0]}" y1="${A[1]}" x2="${T[0]}" y2="${T[1]}" stroke="#0e6670" stroke-width="16" stroke-linecap="round"/>`;
  // Winkelbogen
  const r = 80;
  g += `<path d="M${A[0]} ${A[1]} L${A[0] + r} ${A[1]} A${r} ${r} 0 0 0 ${A[0] + r * Math.cos(a)} ${A[1] - r * Math.sin(a)} Z" fill="#f6c445" fill-opacity=".85" stroke="#22313d" stroke-width="2.5"/>`;
  g += lab(A[0] + r + 16, A[1] - 16, 'α = ?', '#22313d', 32, 'start');
  g += lab((A[0] + T[0]) / 2 - 30, (A[1] + T[1]) / 2 - 34, 'Modul 1,72 m', '#0e6670', 34);
  g += `<path d="M${T[0] - 36} ${A[1]} A28 28 0 0 1 ${T[0] - 8} ${A[1] - 28}" fill="none" stroke="#22313d" stroke-width="2.5"/><circle cx="${T[0] - 19}" cy="${A[1] - 11}" r="4" fill="#22313d"/>`;
  if (loecher) {
    [0.8, 0.95].forEach((h) => { const y = A[1] - h * m; g += `<circle cx="${T[0]}" cy="${y}" r="7" fill="#fff" stroke="#22313d" stroke-width="2.5"/>` + `<line x1="${T[0] + 14}" y1="${y}" x2="${T[0] + 48}" y2="${y}" stroke="#22313d" stroke-width="2"/>` + lab(T[0] + 56, y + 10, h.toFixed(2).replace('.', ',') + ' m', '#22313d', 30, 'start'); });
    g += lab(T[0] + 56, A[1] - 0.4 * m, 'Lochraster', '#5b6670', 26, 'start');
  } else {
    g += lab(T[0] + 22, (A[1] + T[1]) / 2 + 10, 'Stütze 0,80 m', '#22313d', 32, 'start');
  }
  if (schild) {
    g += `<line x1="880" y1="500" x2="880" y2="${430}" stroke="#6a4a2a" stroke-width="6"/><rect x="770" y="350" width="220" height="84" rx="12" fill="#fff" stroke="#24323f" stroke-width="3"/>` +
      `<text x="880" y="386" text-anchor="middle" font-family="Fredoka" font-size="26" font-weight="600" fill="#0e6670">Neigung ideal</text><text x="880" y="418" text-anchor="middle" font-family="Fredoka" font-size="24" font-weight="500" fill="#24323f">30° bis 35°</text>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="600" viewBox="0 0 1200 600">${g}</svg>`;
};

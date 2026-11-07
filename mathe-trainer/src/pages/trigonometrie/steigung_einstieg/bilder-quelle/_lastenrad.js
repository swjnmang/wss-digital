// Gemeinsame Formen der Lernsituation „Das Lastenrad“ (Bildwelt Siebdruck / zweifarbig, Indigo + Leuchtpink).
window.LR = {
  INDIGO: '#4338a6', PINK: '#ff4f98',
  kopf: '<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wdth,wght@12..96,75..100,500..800&display=swap" rel="stylesheet">',
  // Lastenrad als Silhouette (Linien in der aktuellen Druckfarbe), Hinterrad bei (x, y), um w Grad geneigt
  rad(x, y, s = 1, w = 0) {
    return `<g transform="translate(${x} ${y}) rotate(${-w}) scale(${s})" fill="none" stroke-width="9" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="0" cy="-42" r="42"/><circle cx="230" cy="-34" r="34"/>
      <path d="M0 -42 L70 -42 L60 -120 L0 -42 M70 -42 L110 -40 L230 -34 M60 -120 L140 -120 L150 -60"/>
      <rect x="130" y="-118" width="100" height="70" stroke="none" fill="#4338a6"/>
      <path d="M40 -130 h44 M140 -120 L150 -160 h-28"/></g>`;
  },
  // Verkehrsschild Steigung (Dreieck) mit Text
  schild(x, y, text, unter) {
    return `<polygon points="${x},${y - 150} ${x + 150},${y + 110} ${x - 150},${y + 110}" fill="none" stroke-width="18" stroke-linejoin="round"/>
      <polygon points="${x - 95},${y + 80} ${x + 95},${y + 80} ${x + 95},${y + 20}" stroke="none"/>
      <text x="${x}" y="${y + 5}" text-anchor="middle" font-size="64" font-weight="800" stroke="none">${text}</text>
      <text x="${x}" y="${y + 175}" text-anchor="middle" font-size="36" font-weight="700" stroke="none">${unter}</text>`;
  },
};

// Gemeinsame Bausteine der Bildwelt Skizzenbuch / Tafel: dunkelgrüne Tafel mit Kreidestaub, Kreidestrich (Wackel-Filter), Holzrahmen
window.TAFEL = {
  K: '#f3f1e7',
  defs: `<defs>
  <radialGradient id="tafel" cx=".35" cy=".25" r=".95"><stop offset="0" stop-color="#36503f"/><stop offset=".6" stop-color="#2a3f32"/><stop offset="1" stop-color="#1f3027"/></radialGradient>
  <filter id="staub" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".012" numOctaves="3" seed="6"/><feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .16 0"/></filter>
  <filter id="kreide" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="3" result="r"/><feDisplacementMap in="SourceGraphic" in2="r" scale="2.4" result="d"/><feTurbulence type="fractalNoise" baseFrequency="1.6" seed="9" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.4 1.25" result="m"/><feComposite in="d" in2="m" operator="in"/></filter>
  <linearGradient id="holz" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9a6a3c"/><stop offset="1" stop-color="#6f4521"/></linearGradient>
 </defs>`,
  grund: (w, h) => `<rect width="${w}" height="${h}" fill="url(#holz)"/><rect x="18" y="18" width="${w - 36}" height="${h - 36}" rx="4" fill="url(#tafel)"/><rect x="18" y="18" width="${w - 36}" height="${h - 36}" filter="url(#staub)"/>`,
};

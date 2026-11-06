// Gemeinsame Bausteine der Bildwelt Skizzenbuch / Packpapier: braunes Packpapier mit Fasern, schwarzer Fineliner (Wackel-Strich),
// weiße Highlights, Aquarellflecken in der Themenfarbe, Handschrift Caveat.
window.PP = (farbe) => ({
  defs: `<defs>
  <filter id="fasern" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9 .04" numOctaves="3" seed="4"/><feColorMatrix type="matrix" values="0 0 0 0 .35  0 0 0 0 .22  0 0 0 0 .1  0 0 0 .22 0"/></filter>
  <filter id="wolke" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".006" numOctaves="3" seed="2"/><feColorMatrix type="matrix" values="0 0 0 0 .5  0 0 0 0 .35  0 0 0 0 .2  0 0 0 .25 0"/></filter>
  <filter id="liner"><feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="2" seed="7"/><feDisplacementMap in="SourceGraphic" scale="3.2"/></filter>
  <filter id="aquarell" x="-20%" y="-20%" width="140%" height="140%"><feTurbulence type="fractalNoise" baseFrequency=".03" numOctaves="3" seed="5" result="t"/><feDisplacementMap in="SourceGraphic" in2="t" scale="26" result="d"/><feGaussianBlur in="d" stdDeviation="2"/></filter>
 </defs>`,
  grund: (w, h) => `<rect width="${w}" height="${h}" fill="#d8bf95"/><rect width="${w}" height="${h}" filter="url(#wolke)"/><rect width="${w}" height="${h}" filter="url(#fasern)"/>`,
  fleck: (x, y, rx, ry, f = farbe, o = 0.45) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${f}" opacity="${o}" filter="url(#aquarell)"/>`,
  T: '#1c1a17',
});

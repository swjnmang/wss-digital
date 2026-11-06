// Gemeinsame Bausteine der Bildwelt Skizzenbuch / kariert: Karopapier, Bleistift mit Wackel-Filter, Aquarell-Flecken, Klebestreifen, Handschrift.
window.SK = {
  defs: `<defs>
  <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0V24" fill="none" stroke="#9fb7c9" stroke-width="0.8" opacity=".55"/></pattern>
  <filter id="paper"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="3" seed="3"/><feColorMatrix values="0 0 0 0 .55  0 0 0 0 .5  0 0 0 0 .42  0 0 0 .09 0"/><feComposite in2="SourceGraphic" operator="in"/><feBlend in2="SourceGraphic" mode="multiply"/></filter>
  <filter id="wobble"><feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="2" seed="7"/><feDisplacementMap in="SourceGraphic" scale="5"/></filter>
  <filter id="wash" x="-20%" y="-20%" width="140%" height="140%"><feTurbulence type="fractalNoise" baseFrequency=".022" numOctaves="4" seed="11"/><feDisplacementMap in="SourceGraphic" scale="46"/><feGaussianBlur stdDeviation="2.2"/></filter>
 </defs>`,
  papier: (w, h) => `<rect width="${w}" height="${h}" fill="#fbf8f1"/><rect width="${w}" height="${h}" fill="#fbf8f1" filter="url(#paper)" opacity=".9"/><rect width="${w}" height="${h}" fill="url(#grid)"/>`,
  tape: (x, y, rot) => `<rect x="${x}" y="${y}" width="150" height="38" fill="#e9c46a" opacity=".55" transform="rotate(${rot} ${x + 75} ${y + 19})"/>`,
  wash: (inhalt) => `<g style="mix-blend-mode:multiply">${inhalt}</g>`,
  fleck: (cx, cy, rx, ry, farbe, op = .3) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${farbe}" opacity="${op}" filter="url(#wash)"/>`,
  stift: (inhalt, w = 3.5) => `<g fill="none" stroke="#2c2a27" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" filter="url(#wobble)">${inhalt}</g>`,
  hand: (x, y, text, fs = 34, farbe = '#2c2a27', anchor = 'start', rot = 0) => `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="Caveat" font-weight="700" font-size="${fs}" fill="${farbe}" transform="rotate(${rot} ${x} ${y})">${text}</text>`,
};

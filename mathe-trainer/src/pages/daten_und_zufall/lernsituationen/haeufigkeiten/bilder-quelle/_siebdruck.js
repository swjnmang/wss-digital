// Gemeinsame Bausteine der Bildwelt Siebdruck: Druckgänge als eigene Ebenen (mix-blend-mode: multiply), Passerversatz, raue Kanten, Papierkorn.
// SD.bild(w, h, gaenge) mit gaenge = [{ farbe, versatz: [dx, dy], svg: '…' }] erzeugt das fertige Bild im Element #bild.
window.SD = {
  bild(w, h, gaenge, papier = '#f1efe9') {
    const el = document.getElementById('bild');
    el.style.cssText = `position:relative;width:${w}px;height:${h}px;background:${papier};overflow:hidden`;
    const rauh = (id, seed) => `<filter id="${id}"><feTurbulence type="fractalNoise" baseFrequency=".75" seed="${seed}"/><feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -0.7 1.3"/><feComposite in="SourceGraphic" operator="in"/></filter>`;
    el.innerHTML = gaenge.map((g, i) => `<div style="position:absolute;inset:0;mix-blend-mode:multiply;transform:translate(${(g.versatz || [0, 0])[0]}px,${(g.versatz || [0, 0])[1]}px)"><svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="display:block"><defs>${rauh('r' + i, 2 + i * 3)}<pattern id="raster${i}" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(${15 + i * 30})"><circle cx="7" cy="7" r="4.2" fill="${g.farbe}"/></pattern></defs><g filter="url(#r${i})" fill="${g.farbe}" stroke="${g.farbe}">${g.svg.replaceAll('RASTER', `url(#raster${i})`)}</g></svg></div>`).join('') +
      `<div style="position:absolute;inset:0"><svg width="${w}" height="${h}"><filter id="korn"><feTurbulence type="fractalNoise" baseFrequency=".95" numOctaves="2" seed="11"/><feColorMatrix type="matrix" values="0 0 0 0 .3  0 0 0 0 .28  0 0 0 0 .22  0 0 0 .09 0"/></filter><rect width="${w}" height="${h}" filter="url(#korn)"/></svg></div>`;
  },
};

#!/usr/bin/env node
/*
 * Rendert Bildquellen der Lernsituationen (*.bild.html) zu echten Bilddateien (WebP).
 *
 * Aufruf:
 *   node scripts/bilder-rendern.cjs <quelle.bild.html> <ziel.webp> [qualitaet 0–1, Standard 0.86]
 *   node scripts/bilder-rendern.cjs <ordner>      rendert jede bilder-quelle/*.bild.html nach bilder/*.webp
 *
 * Die Quelle ist eine normale HTML-Datei. Gerendert wird das Element mit id="bild" in doppelter Auflösung.
 * Schriften dürfen von Google Fonts kommen (sie werden beim Rendern geladen und ins Bild gebrannt).
 * Voraussetzung: Playwright mit Chromium (in den Claude-Cloud-Sitzungen vorinstalliert).
 */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

async function rendern(page, quelle, ziel, qualitaet) {
  const html = fs.readFileSync(quelle, 'utf8');
  await page.setContent(html, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  const el = page.locator('#bild');
  if ((await el.count()) === 0) throw new Error(`${quelle}: kein Element mit id="bild"`);
  const png = await el.screenshot({ type: 'png' });
  // PNG im Browser in WebP umwandeln (kein Zusatzpaket nötig)
  const webp = await page.evaluate(
    async ({ b64, q }) => {
      const img = new Image();
      img.src = 'data:image/png;base64,' + b64;
      await img.decode();
      const c = document.createElement('canvas');
      c.width = img.naturalWidth;
      c.height = img.naturalHeight;
      c.getContext('2d').drawImage(img, 0, 0);
      return c.toDataURL('image/webp', q).split(',')[1];
    },
    { b64: png.toString('base64'), q: qualitaet },
  );
  fs.mkdirSync(path.dirname(ziel), { recursive: true });
  fs.writeFileSync(ziel, Buffer.from(webp, 'base64'));
  const kb = Math.round(fs.statSync(ziel).size / 1024);
  console.log(`${path.relative(process.cwd(), ziel)}  (${kb} KB)`);
}

(async () => {
  const [a, b, q] = process.argv.slice(2);
  if (!a) {
    console.error('Aufruf: node scripts/bilder-rendern.cjs <quelle.bild.html> <ziel.webp> | <ordner>');
    process.exit(1);
  }
  const auftraege = [];
  if (fs.statSync(a).isDirectory()) {
    const qdir = path.join(a, 'bilder-quelle');
    for (const f of fs.readdirSync(qdir).filter((f) => f.endsWith('.bild.html'))) {
      auftraege.push([path.join(qdir, f), path.join(a, 'bilder', f.replace(/\.bild\.html$/, '.webp'))]);
    }
  } else {
    auftraege.push([a, b || a.replace(/\.bild\.html$|\.html$/, '') + '.webp']);
  }
  const browser = await chromium.launch();
  try {
    // Jede Quelle bekommt eine frische Seite: Skripte mehrerer Quellen teilen sonst ihre globalen Variablen (let/const kollidieren)
    for (const [quelle, ziel] of auftraege) {
      const page = await browser.newPage({ deviceScaleFactor: 2, viewport: { width: 1400, height: 900 } });
      await rendern(page, quelle, ziel, Number(q) || 0.86);
      await page.close();
    }
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});

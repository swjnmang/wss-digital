#!/usr/bin/env node
/**
 * Generate Sitemap from App.tsx routes
 * Usage: node scripts/generate-sitemap.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');

const BASE_URL = 'https://ws-mathe-trainer.vercel.app';

// Define all routes manually with metadata
const routes = [
  // Home
  { path: '/', priority: 1.0, changefreq: 'weekly' },

  // Rechnen Lernen
  { path: '/rechnen_lernen', priority: 0.9, changefreq: 'monthly' },
  { path: '/rechnen_lernen/terme', priority: 0.8, changefreq: 'monthly' },
  { path: '/rechnen_lernen/terme/ohnevariablen', priority: 0.7, changefreq: 'monthly' },
  { path: '/rechnen_lernen/terme/zusammenfassen', priority: 0.7, changefreq: 'monthly' },
  { path: '/rechnen_lernen/terme/mitpotenzen', priority: 0.7, changefreq: 'monthly' },
  { path: '/rechnen_lernen/brueche', priority: 0.8, changefreq: 'monthly' },
  { path: '/rechnen_lernen/brueche/kuerzenerweitern', priority: 0.7, changefreq: 'monthly' },
  { path: '/rechnen_lernen/brueche/addierensubtrahieren', priority: 0.7, changefreq: 'monthly' },
  { path: '/rechnen_lernen/brueche/multiplizierendividieren', priority: 0.7, changefreq: 'monthly' },
  { path: '/rechnen_lernen/potenzen', priority: 0.8, changefreq: 'monthly' },
  { path: '/rechnen_lernen/wurzeln', priority: 0.8, changefreq: 'monthly' },
  { path: '/rechnen_lernen/prozentrechnung', priority: 0.8, changefreq: 'monthly' },
  { path: '/rechnen_lernen/gleichungen', priority: 0.8, changefreq: 'monthly' },

  // Lineare Funktionen
  { path: '/lineare_funktionen', priority: 0.95, changefreq: 'weekly' },
  { path: '/lineare_funktionen/wertetabelle', priority: 0.8, changefreq: 'monthly' },
  { path: '/lineare_funktionen/zeichnen', priority: 0.8, changefreq: 'monthly' },
  { path: '/lineare_funktionen/ablesen', priority: 0.8, changefreq: 'monthly' },
  { path: '/lineare_funktionen/steigung', priority: 0.8, changefreq: 'monthly' },
  { path: '/lineare_funktionen/steigung/ablesen', priority: 0.8, changefreq: 'monthly' },
  { path: '/lineare_funktionen/steigung/berechnen', priority: 0.8, changefreq: 'monthly' },
  { path: '/lineare_funktionen/y_achsenabschnitt', priority: 0.8, changefreq: 'monthly' },
  { path: '/lineare_funktionen/funktionsgleichung', priority: 0.8, changefreq: 'monthly' },
  { path: '/lineare_funktionen/punkt_gerade', priority: 0.8, changefreq: 'monthly' },
  { path: '/lineare_funktionen/parallel_senkrecht', priority: 0.8, changefreq: 'monthly' },
  { path: '/lineare_funktionen/nullstellen', priority: 0.8, changefreq: 'monthly' },
  { path: '/lineare_funktionen/schnittpunkt', priority: 0.8, changefreq: 'monthly' },
  { path: '/lineare_funktionen/gemischte-aufgaben', priority: 0.8, changefreq: 'monthly' },
  { path: '/lineare_funktionen/anwendungsaufgaben', priority: 0.85, changefreq: 'weekly' },
  { path: '/lineare_funktionen/anwendungsaufgaben/fussballplatz', priority: 0.8, changefreq: 'monthly' },
  { path: '/lineare_funktionen/anwendungsaufgaben/tipi', priority: 0.8, changefreq: 'monthly' },
  { path: '/lineare_funktionen/anwendungsaufgaben/berg', priority: 0.8, changefreq: 'monthly' },
  { path: '/lineare_funktionen/test', priority: 0.7, changefreq: 'monthly' },
  { path: '/lineare_funktionen/wer_wird_millionaer', priority: 0.6, changefreq: 'monthly' },

  // Finanzmathe
  { path: '/finanzmathe', priority: 0.9, changefreq: 'monthly' },
  { path: '/finanzmathe/zinsrechnung', priority: 0.8, changefreq: 'monthly' },
  { path: '/finanzmathe/zinsrechnung/ueben', priority: 0.8, changefreq: 'monthly' },
  { path: '/finanzmathe/zinseszins', priority: 0.8, changefreq: 'monthly' },
  { path: '/finanzmathe/endwert', priority: 0.8, changefreq: 'monthly' },
  { path: '/finanzmathe/ratendarlehen', priority: 0.8, changefreq: 'monthly' },
  { path: '/finanzmathe/anwendungsaufgaben', priority: 0.8, changefreq: 'monthly' },
  { path: '/finanzmathe/anwendungsaufgaben/escape-room-zinseszins', priority: 0.6, changefreq: 'monthly' },

  // Quadratische Funktionen
  { path: '/quadratische_funktionen', priority: 0.9, changefreq: 'monthly' },
  { path: '/quadratische_funktionen/normalparabel', priority: 0.8, changefreq: 'monthly' },
  { path: '/quadratische_funktionen/scheitelpunkt', priority: 0.8, changefreq: 'monthly' },
  { path: '/quadratische_funktionen/scheitelform', priority: 0.8, changefreq: 'monthly' },
  { path: '/quadratische_funktionen/nullstellen', priority: 0.8, changefreq: 'monthly' },

  // Trigonometrie
  { path: '/trigonometrie', priority: 0.8, changefreq: 'monthly' },

  // Daten und Zufall
  { path: '/daten-und-zufall', priority: 0.8, changefreq: 'monthly' },

  // Raum und Form
  { path: '/raum-und-form', priority: 0.8, changefreq: 'monthly' },
  { path: '/raum-und-form/einheiten', priority: 0.7, changefreq: 'monthly' },
  { path: '/raum-und-form/einheiten/laengen', priority: 0.6, changefreq: 'monthly' },
  { path: '/raum-und-form/einheiten/flaechen', priority: 0.6, changefreq: 'monthly' },
  { path: '/raum-und-form/einheiten/volumen', priority: 0.6, changefreq: 'monthly' },
  { path: '/raum-und-form/einheiten/welche-einheit', priority: 0.6, changefreq: 'monthly' },
  { path: '/raum-und-form/flaechengeometrie', priority: 0.7, changefreq: 'monthly' },
  { path: '/raum-und-form/flaechengeometrie/rechteck', priority: 0.6, changefreq: 'monthly' },
  { path: '/raum-und-form/flaechengeometrie/dreiecke', priority: 0.6, changefreq: 'monthly' },
  { path: '/raum-und-form/flaechengeometrie/parallelogramm', priority: 0.6, changefreq: 'monthly' },
  { path: '/raum-und-form/flaechengeometrie/raute', priority: 0.6, changefreq: 'monthly' },
  { path: '/raum-und-form/flaechengeometrie/trapez', priority: 0.6, changefreq: 'monthly' },
  { path: '/raum-und-form/flaechengeometrie/kreis', priority: 0.6, changefreq: 'monthly' },
  { path: '/raum-und-form/flaechengeometrie/zusammengesetzte-flaechen', priority: 0.6, changefreq: 'monthly' },
  { path: '/raum-und-form/flaechengeometrie/gemischte-aufgaben', priority: 0.6, changefreq: 'monthly' },
  { path: '/raum-und-form/flaechengeometrie/anwendungs-uebungsaufgaben', priority: 0.6, changefreq: 'monthly' },
  { path: '/raum-und-form/satz-des-pythagoras', priority: 0.7, changefreq: 'monthly' },
  { path: '/raum-und-form/satz-des-pythagoras/katheten-hypotenuse', priority: 0.6, changefreq: 'monthly' },
  { path: '/raum-und-form/satz-des-pythagoras/berechnen', priority: 0.6, changefreq: 'monthly' },
  { path: '/raum-und-form/satz-des-pythagoras/rechtwinklig-pruefen', priority: 0.6, changefreq: 'monthly' },
  { path: '/raum-und-form/satz-des-pythagoras/anwendung', priority: 0.6, changefreq: 'monthly' },
  { path: '/raum-und-form/satz-des-pythagoras/gemischt', priority: 0.6, changefreq: 'monthly' },
  { path: '/raum-und-form/strahlensaetze', priority: 0.7, changefreq: 'monthly' },
  { path: '/raum-und-form/strahlensaetze/streckfaktor', priority: 0.6, changefreq: 'monthly' },
  { path: '/raum-und-form/strahlensaetze/erster-strahlensatz', priority: 0.6, changefreq: 'monthly' },
  { path: '/raum-und-form/strahlensaetze/zweiter-strahlensatz', priority: 0.6, changefreq: 'monthly' },
  { path: '/raum-und-form/strahlensaetze/anwendung', priority: 0.6, changefreq: 'monthly' },
  { path: '/raum-und-form/strahlensaetze/gemischt', priority: 0.6, changefreq: 'monthly' },
  { path: '/raum-und-form/kugel', priority: 0.7, changefreq: 'monthly' },
  { path: '/raum-und-form/kugel/volumen', priority: 0.6, changefreq: 'monthly' },
  { path: '/raum-und-form/kugel/oberflaeche', priority: 0.6, changefreq: 'monthly' },
  { path: '/raum-und-form/kugel/gemischt', priority: 0.6, changefreq: 'monthly' },
  { path: '/raum-und-form/kugel/anwendungsaufgaben', priority: 0.6, changefreq: 'monthly' },
  { path: '/raum-und-form/prisma', priority: 0.7, changefreq: 'monthly' },
  { path: '/raum-und-form/prisma/volumen', priority: 0.6, changefreq: 'monthly' },
  { path: '/raum-und-form/prisma/oberflaeche', priority: 0.6, changefreq: 'monthly' },
  { path: '/raum-und-form/prisma/gemischt', priority: 0.6, changefreq: 'monthly' },
  { path: '/raum-und-form/prisma/anwendungsaufgaben', priority: 0.6, changefreq: 'monthly' },
  { path: '/raum-und-form/kegel', priority: 0.7, changefreq: 'monthly' },
  { path: '/raum-und-form/kegel/volumen', priority: 0.6, changefreq: 'monthly' },
  { path: '/raum-und-form/kegel/oberflaeche', priority: 0.6, changefreq: 'monthly' },
  { path: '/raum-und-form/kegel/gemischt', priority: 0.6, changefreq: 'monthly' },
  { path: '/raum-und-form/kegel/anwendungsaufgaben', priority: 0.6, changefreq: 'monthly' },
  { path: '/raum-und-form/pyramide', priority: 0.7, changefreq: 'monthly' },
  { path: '/raum-und-form/pyramide/volumen', priority: 0.6, changefreq: 'monthly' },
  { path: '/raum-und-form/pyramide/oberflaeche', priority: 0.6, changefreq: 'monthly' },
  { path: '/raum-und-form/pyramide/gemischt', priority: 0.6, changefreq: 'monthly' },
  { path: '/raum-und-form/pyramide/anwendungsaufgaben', priority: 0.6, changefreq: 'monthly' },
  { path: '/raum-und-form/zylinder', priority: 0.7, changefreq: 'monthly' },
  { path: '/raum-und-form/zylinder/volumen', priority: 0.6, changefreq: 'monthly' },
  { path: '/raum-und-form/zylinder/oberflaeche', priority: 0.6, changefreq: 'monthly' },
  { path: '/raum-und-form/zylinder/gemischt', priority: 0.6, changefreq: 'monthly' },
  { path: '/raum-und-form/zylinder/anwendungsaufgaben', priority: 0.6, changefreq: 'monthly' },
  { path: '/raum-und-form/anwendungsaufgaben', priority: 0.7, changefreq: 'monthly' },
  { path: '/raum-und-form/anwendungsaufgaben/pruefungsaufgaben', priority: 0.6, changefreq: 'monthly' },
  { path: '/raum-und-form/anwendungsaufgaben/koerper-gemischt', priority: 0.6, changefreq: 'monthly' },

  // Sonstiges
  { path: '/excel-trainer', priority: 0.7, changefreq: 'monthly' },
  { path: '/impressum', priority: 0.5, changefreq: 'yearly' },
];

function generateSitemap() {
  const today = new Date().toISOString().split('T')[0];

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  routes.forEach((route) => {
    xml += '  <url>\n';
    xml += `    <loc>${BASE_URL}${route.path}</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += `    <changefreq>${route.changefreq}</changefreq>\n`;
    xml += `    <priority>${route.priority}</priority>\n`;
    xml += '  </url>\n';
  });

  xml += '</urlset>\n';

  const sitemapPath = path.join(projectRoot, 'public', 'sitemap.xml');
  fs.writeFileSync(sitemapPath, xml);
  console.log(`✓ Sitemap generated: ${sitemapPath}`);
  console.log(`✓ Total routes: ${routes.length}`);
}

generateSitemap();

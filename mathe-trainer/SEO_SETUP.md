# SEO Configuration für WSS-Digital Mathe-Trainer

## ✅ Implementierte SEO-Maßnahmen

### 1. **robots.txt** 
📁 `/public/robots.txt`
- Erlaubt Google, Bing und anderen Suchmaschinen, die gesamte Website zu crawlen
- Zeigt auf die Sitemap
- Optimierte Crawl-Delays für verschiedene Bots

### 2. **Sitemap.xml**
📁 `/public/sitemap.xml`
- Enthält alle wichtigen Seiten der Website
- Automatically generiert und aktualisiert
- Wird bei jedem Build neu erstellt
- Enthält bis zu 48 URL-Einträge mit korrekten Prioritäten

### 3. **Meta Tags in index.html**
- ✅ Title Tag (mit Keywords)
- ✅ Meta Description
- ✅ Keywords Meta Tag
- ✅ Author Tag
- ✅ Robots Meta Tag
- ✅ Open Graph Tags (Facebook/LinkedIn)
- ✅ Twitter Card Tags
- ✅ Canonical URL
- ✅ Language Tag
- ✅ Structured Data (Schema.org JSON-LD)

### 4. **Automatische Sitemap-Generierung**

#### Kommandos:
```bash
# Sitemap manuell generieren
npm run generate-sitemap

# Build (generiert Sitemap automatisch)
npm run build
```

#### Wie es funktioniert:
- Script: `scripts/generate-sitemap.mjs`
- Wird automatisch vor jedem Build ausgeführt
- Aktualisiert `public/sitemap.xml` mit aktuellem Datum
- Alle neuen Routen sollten im Script eingetragen werden

## 📋 Nächste Schritte für vollständige SEO

### 1. **Google Search Console einrichten**
```
1. Gehe zu https://search.google.com/search-console
2. Füge deine Domain "ws-mathe-trainer.vercel.app" hinzu
3. Verifiziere die Ownership via DNS oder HTML-Datei
4. Gehe zu "Sitemaps" und gib ein:
   https://ws-mathe-trainer.vercel.app/sitemap.xml
5. Gib URLs zur Indexierung an
```

### 2. **Bing Webmaster Tools**
```
1. Gehe zu https://www.bing.com/webmasters
2. Füge die Website hinzu
3. Importiere die Sitemap aus Google Search Console
```

### 3. **Optimale robots.txt URL**
Die robots.txt ist unter folgenden URLs erreichbar:
- https://ws-mathe-trainer.vercel.app/robots.txt

### 4. **Monitoring & Updates**

Wenn du neue Seiten hinzufügst:
1. Aktualisiere die `routes` array in `scripts/generate-sitemap.mjs`
2. Führe `npm run generate-sitemap` aus
3. Committe und pushe die neue `sitemap.xml`
4. Reiche die Seite in Google Search Console zur Indexierung ein

## 📊 Sitemap-Struktur

Die Sitemap ist in folgende Kategorien unterteilt:

| Kategorie | Anzahl URLs | Update-Häufigkeit | Priorität |
|-----------|-------------|-------------------|-----------|
| Home | 1 | weekly | 1.0 |
| Lineare Funktionen | 16 | weekly/monthly | 0.8-0.95 |
| Finanzmathe | 7 | monthly | 0.8-0.9 |
| Quadratische Funktionen | 5 | monthly | 0.8-0.9 |
| Rechnen Lernen | 13 | monthly | 0.7-0.9 |
| Weitere Kategorien | 6 | monthly | 0.5-0.8 |

## 🔍 SEO-Best-Practices implementiert

✅ **On-Page SEO:**
- Aussagekräftige Title Tags
- Meta Descriptions
- Structured Data (Schema.org)
- Open Graph Tags
- Canonical URLs

✅ **Technical SEO:**
- robots.txt konfiguriert
- Sitemap.xml erstellt
- Mobile-responsive Design (Vite/React)
- HTTPS (via Vercel)
- Schnelle Ladezeiten (Vercel CDN)

✅ **Content SEO:**
- Keyword-optimierte Titles
- Beschreibungen für Nutzer und Suchmaschinen
- Thematische Kategorisierung

## ⚠️ Wichtig: Domain-Anpassung

Falls du deine Domain zu `wss-digital.de` änderst:
1. Aktualisiere `BASE_URL` in `scripts/generate-sitemap.mjs`:
   ```javascript
   const BASE_URL = 'https://wss-digital.de'
   ```
2. Aktualisiere `robots.txt`:
   ```
   Sitemap: https://wss-digital.de/sitemap.xml
   ```
3. Starte neu: `npm run generate-sitemap`

## 📈 Performance-Tipps

- Nutze Google Analytics für Traffic-Daten
- Überwache Core Web Vitals in Search Console
- Aktualisiere regelmäßig neue Inhalte (neue Aufgaben, etc.)
- Erstelle Backlinks von Bildungsseiten

---

**Letzte Aktualisierung:** February 17, 2025
**Status:** ✅ SEO-Konfiguration vollständig

# SVG-Kandidaten (Vorschlag, nichts umgestellt)

Stand: 2026-10-10. GeoGebra bleibt überall (Entscheidung des Nutzers). Diese Liste zeigt nur, wo ein
statisches SVG reichen würde – also Graphen, die **nur angezeigt** werden (höchstens Zoom), ohne Schieberegler,
ziehbare Punkte oder Zeichnen. Vorteil SVG: lädt sofort, kein externes Skript, druckt sauber, kein Flackern.

## Gute Kandidaten (reine Anzeige)

| Komponente | genutzt in | Hinweis |
|---|---|---|
| `components/GeoGebraGraph.tsx` | LF: Ablesen, Steigung ablesen, Steigung berechnen, Funktionsgleichung, Test, Gemischte Aufgaben, Übungsblatt-Generator | Geraden + feste Punkte A/B. Beim Übungsblatt (PDF) wäre SVG besonders sinnvoll. |
| `components/ResponsiveGeoGebraGraph.tsx` | LF: Ablesen, Zeichnen (Lösungsanzeige) | Hülle um GeoGebraGraph. |
| `components/GeoGebraMultiGraph.tsx` | LF: Gemischte Aufgaben | Mehrere Geraden, nur Anzeige. |
| `components/ParabelGraph.tsx` | QF: Scheitelform aus dem Graphen, Scheitelpunkt ablesen | Eine Parabel, Zoom erlaubt. |
| `quadratische_funktionen/Schnittpunkte2.tsx` | QF: Schnittpunkte (Variante 2) | Keine Interaktion im Applet gefunden. |
| `quadratische_funktionen/Abschlusstest.tsx` | QF: Abschlusstest | Graphen nur zur Anzeige. |
| `components/GeoGebraTriangleSketch.tsx` | Trigonometrie: Gemischte Übungsaufgaben | Dreiecksskizzen; die Trigonometrie-Engine nutzt bereits SVG (`engine/TriangleFigure.tsx`) – gleiche Darstellung wäre möglich. |

## Prüfen (teilweise interaktiv)

| Datei | Grund |
|---|---|
| `quadratische_funktionen/ScheitelformRechnerisch.tsx` | Applet mit lösbaren Objekten – evtl. nur Kontrollgraph. |
| `quadratische_funktionen/Schnittpunkte.tsx` | Applet mit lösbaren Objekten – evtl. nur Kontrollgraph. |
| `lineare_funktionen/Proportional.tsx` | Applet-Modus wird gesetzt; vermutlich Punkte setzen. |

## Bleibt GeoGebra (echte Interaktion)

- Normalparabel, Verschiebung der Normalparabel (Schieberegler)
- Sinus-/Kosinusfunktion am Einheitskreis (`GeoGebraSineUnitCircle`, Schieberegler)
- Wertetabellen LF und QF (Punkte/Parabel selbst einzeichnen)

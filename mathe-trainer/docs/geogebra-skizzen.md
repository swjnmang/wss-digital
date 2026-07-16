# GeoGebra-Skizzen einbinden

Die Komponente [`src/components/GeoGebraTriangleSketch.tsx`](../src/components/GeoGebraTriangleSketch.tsx)
zeichnet Dreiecksskizzen als eingebettetes GeoGebra-Applet. GeoGebra platziert
Beschriftungen selbst und liefert damit deutlich sauberere Skizzen als
handgebaute SVGs. Erstmals eingesetzt in den gemischten Übungsaufgaben
Trigonometrie (`src/pages/trigonometrie/GemischteUebungsaufgaben.tsx`).

## Funktionsweise

- Beim ersten Mount wird einmalig das offizielle Embedding-Script
  `https://www.geogebra.org/apps/deployggb.js` nachgeladen (Singleton-Promise,
  mehrere Applets teilen sich das Script und den GeoGebra-Core).
- Pro Skizze wird ein `GGBApplet` mit `appName: 'classic'` und
  `perspective: 'G'` (nur Grafik-Ansicht, kein Algebra-Panel) in einen Container
  injiziert. Alle UI-Elemente (Toolbar, Menü) sind ausgeblendet.
- Das Dreieck wird im `appletOnLoad`-Callback per `evalCommand` konstruiert:
  Punkte, `Polygon` (Kantennamen kommen aus `evalCommandGetLabels` zurück),
  Captions über `SetCaption` + `SetLabelMode(obj, 3)`.
- Winkel werden **manuell** als unsichtbarer `Circle` + `Arc`/`Sector`
  gezeichnet (nicht über das native `Angle()`-Objekt), damit Radius und Stil
  steuerbar sind: Bogengröße 50 px (statt GeoGebra-Standard 30, gekappt auf die
  kürzere anliegende Seite), rechter Winkel als grauer Viertelkreis-Sektor mit
  Punkt darin, Winkellabels als eigene Text-Objekte auf der Winkelhalbierenden
  (bei spitzen Winkeln dynamisch weiter außen).
- Alle Objekte sind fixiert (`setFixed`); Schüler:innen können aber **zoomen und
  die Ansicht verschieben** (`enableShiftDragZoom: true`, `showZoomButtons: true`)
  und über das Reset-Icon zur Ausgangsansicht zurückkehren.
- Der Sichtbereich wird aus den Punktkoordinaten plus Rand berechnet und auf das
  Seitenverhältnis des Applets gebracht, damit nichts verzerrt.

## Wichtige Konventionen

- **Punktnamen sind nur Anzeige**: Intern heißen die Punkte immer `V0`–`V2`,
  die sichtbaren Namen werden als eigene `Text`-Objekte vom Schwerpunkt weg nach
  außen versetzt. Das verhindert Kollisionen mit den innenliegenden
  Winkellabels und Namenskonflikte mit GeoGebra-Konstanten (z. B. `e`).
- **Rechter Winkel**: `rightAngle: true` zeichnet den klassischen grauen
  Viertelkreis-Sektor mit Punkt in der Mitte; ein Winkel ohne `label` zeigt nur
  den Bogen.
- **GeoGebra-Stolperfallen** (kosteten Debugging-Zeit, unbedingt beachten):
  - `Arc(kreis, ...)` / `Sector(kreis, ...)` erwarten **Winkel-Parameter in
    Radiant** (`Arc(c, t1, t2)`), nicht zwei Punkte. Varianten wie
    `CircularArc`/`CircularSector`/`Arc(c, P, Q)` schlagen als evalCommand fehl.
  - Arc-/Sector-Objekte akzeptieren `SetColor`/`ShowLabel`/`SetFixed`/
    `SetLineThickness`/`SetFilling` **nicht als evalCommand-Textbefehl**
    (liefert nur `false`) – dort müssen die direkten API-Methoden
    (`api.setColor(...)`, `api.setLabelVisible(...)`, …) verwendet werden.
    Bei Punkten/Segmenten/Texten funktionieren beide Wege.
  - `name=(x,y)` mit **kleingeschriebenem** Namen erzeugt einen **Vektor**,
    kein Punkt – `SetPointSize` wirft dann einen sichtbaren Fehlerdialog.
    Punktnamen immer mit Großbuchstaben beginnen.
  - `SetFontSize` existiert nicht als GeoGebra-Befehl (sichtbarer
    Fehlerdialog); Schriftgröße nur global über den Applet-Parameter
    `fontSize`.
- **Gesuchte Größen**: `highlighted: true` färbt rot und zeichnet dicker. Das
  „= ?" hängt der Aufrufer selbst an den Label-Text an.
- **Neu zeichnen**: Die Komponente zeichnet nur beim Mount. Neue Aufgabenwerte
  müssen über einen `key`-Wechsel (Remount) hereinkommen, nicht über
  Prop-Updates.
- **Fallback**: Lädt das Script nicht (kein Internet, Schulfilter), wird der
  `fallback`-Knoten gerendert – dafür bleiben die alten SVG-Skizzen erhalten.
- **Mathe-Konvention**: Zu Punkt A gehört Winkel α und die gegenüberliegende
  Seite a. Wenn ein Aufgabentyp die interne Geometrie umlegt (z. B. Flächensatz:
  gegebener Winkel γ liegt an der internen alpha-Position), müssen die
  Punktnamen mit umsortiert werden.

## API

```tsx
<GeoGebraTriangleSketch
    // Eckpunkte in Weltkoordinaten; label = angezeigter Punktname (optional)
    points={[
        { x: 0, y: 0, label: 'A' },
        { x: 6, y: 0, label: 'B' },
        { x: 2, y: 4, label: 'C' }
    ]}
    // Seiten in der Reihenfolge [P0P1, P1P2, P2P0]
    sides={[
        { label: 'c' },
        { label: 'a = ?', highlighted: true },
        { label: 'b' }
    ]}
    // Winkel an den Ecken [P0, P1, P2]; {} = nur Bogen (rechter Winkel),
    // { show: false } = Winkel weglassen
    angles={[
        { label: 'α' },
        { label: 'β' },
        { label: 'γ' }
    ]}
    // Optionaler roter Hinweistext am Inkreismittelpunkt
    askedLabel="Fläche = ?"
    // Wird gerendert, wenn GeoGebra nicht lädt
    fallback={<MeineSvgSkizze />}
/>
```

## Hinweise für die Ausweitung auf weitere Seiten

- Der Container sollte eine feste Höhe haben (die Komponente misst
  `offsetWidth`/`offsetHeight` beim Mount, geklemmt auf 260–560 × 240–420 px).
- Erste Ladezeit: das GeoGebra-Script ist einige MB groß (danach im
  Browser-Cache); das Applet erscheint ca. 2–3 s nach Seitenaufruf.
- Mehrere Applets pro Seite funktionieren, teilen sich den Core, kosten aber
  RAM – bei sehr vielen Skizzen auf einer Seite Performance im Blick behalten.
- Für andere Formen als Dreiecke: gleiche Bausteine verwenden
  (Script-Loader, `appletOnLoad` + `evalCommand`, Fallback-Pattern) und die
  Zeichenlogik in `drawTriangle` als Vorlage nehmen.

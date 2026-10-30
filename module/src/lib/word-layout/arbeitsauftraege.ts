// Automatisch erzeugt aus den Word-Arbeitsaufträgen (Layout). Markup in den Texten:
// **fett**  ~~kursiv~~  __unterstrichen__  {{Menü > Pfad}} (rote Klickwege)
export type AuftragItem =
  | { t: string }
  | { b: string }
  | { s: string }
  | { tipp: string }
  | { img: string }
  | { beispiel: [string, string] };

export interface AuftragZeile {
  titel: string;
  inhalt: AuftragItem[];
}

export interface Arbeitsauftrag {
  slug: string;
  kurz: string;
  level: string;
  teaser: string;
  material: { label: string; datei: string; downloadName: string }[];
  thema: string;
  titel: string;
  szenario: string;
  start: number;
  rows: AuftragZeile[];
}

export const ARBEITSAUFTRAEGE: Arbeitsauftrag[] = [
  {
    "slug": "einstieg",
    "kurz": "Einstieg Layout",
    "level": "Einstieg",
    "teaser": "Alle wichtigen Grundfunktionen an einem Übungsblatt ausprobieren.",
    "material": [
      {
        "label": "Übungsdatei (.docx)",
        "datei": "vorlage.docx",
        "downloadName": "00 Einstieg Layout.docx"
      },
      {
        "label": "Bild „logo.png“",
        "datei": "logo.png",
        "downloadName": "logo.png"
      }
    ],
    "thema": "Einstieg",
    "titel": "Einstieg Layout",
    "szenario": "Nimm alle Änderungen direkt in der Datei „00 Einstieg Layout_v2.docx“ vor – öffne kein neues Dokument. Informiere dich selbstständig (z. B. im Internet), wie die entsprechenden Formatierungen vorgenommen werden können!",
    "start": 1,
    "rows": [
      {
        "titel": "Speichern",
        "inhalt": [
          {
            "b": "Speichere das Dokument in **deinem** DB-Klassenordner ab. Wähle als Dateiname deinen Nachnamen."
          }
        ]
      },
      {
        "titel": "Office-Design",
        "inhalt": [
          {
            "b": "Ändere das Office-Design auf „Weiß“ (zu finden unter {{Datei > Optionen > Allgemein}})"
          },
          {
            "img": "ein_office_design.png"
          }
        ]
      },
      {
        "titel": "Seitenränder",
        "inhalt": [
          {
            "b": "Ändere die Seitenränder (oben, unten, links, rechts) auf **1,5 cm** ab."
          }
        ]
      },
      {
        "titel": "Textbegrenzungen",
        "inhalt": [
          {
            "b": "Aktiviere die Textbegrenzungen in Word. Dir sollten anschließend Hilfslinien angezeigt werden, die beim Druck des Dokuments nicht abgebildet sind."
          },
          {
            "s": "{{Datei > Optionen > Erweitert}} ➔ scrolle runter bis „Dokumentinhalt anzeigen“ ➔ aktiviere **„Textbegrenzungen anzeigen“**"
          },
          {
            "img": "ein_textbegrenzungen.png"
          }
        ]
      },
      {
        "titel": "Silbentrennung",
        "inhalt": [
          {
            "b": "Aktiviere für das gesamte Dokument die **automatische Silbentrennung**: {{Layout > Silbentrennung > Automatisch}}"
          }
        ]
      },
      {
        "titel": "Rechtsbündig",
        "inhalt": [
          {
            "b": "Formatiere den rechts abgebildeten Text **rechtsbündig**."
          }
        ]
      },
      {
        "titel": "Zentriert",
        "inhalt": [
          {
            "b": "Formatiere den rechts abgebildeten Text **zentriert**."
          }
        ]
      },
      {
        "titel": "Bild einfügen",
        "inhalt": [
          {
            "b": "Füge in die rechte Spalte das Bild **„logo.png“** ein, welches dir von deiner Lehrkraft bereitgestellt wurde."
          },
          {
            "b": "Verändere die Höhe des Bilds auf **2 cm**, ohne dass sich die Seitenverhältnisse ändern!"
          }
        ]
      },
      {
        "titel": "Zeilenabstand",
        "inhalt": [
          {
            "b": "Der rechts abgebildete Text soll einen Zeilenabstand **„mehrfach“ von 2** erhalten."
          }
        ]
      },
      {
        "titel": "Aufzählung",
        "inhalt": [
          {
            "b": "Die Stichpunkte rechts sollen als Aufzählung formatiert werden."
          },
          {
            "s": "Aktiviere hierfür zunächst die Aufzählungszeichen der drei Stichpunkte."
          },
          {
            "s": "Markiere anschließend die drei Stichpunkte, öffne das Absatzmenü und stelle den „Einzug Links“ auf **0 cm** und den „Sondereinzug“ auf **Hängend um 0,75 cm**."
          },
          {
            "img": "ein_aufzaehlung.png"
          }
        ]
      },
      {
        "titel": "Hyperlink",
        "inhalt": [
          {
            "b": "Der Text rechts („Link zur Schulhomepage“) soll als Hyperlink formatiert werden. Wenn man daraufklickt, soll man auf der Schulhomepage **www.ws-muenchen.de** landen."
          }
        ]
      },
      {
        "titel": "Schriftfarbe",
        "inhalt": [
          {
            "b": "Der Text rechts soll die Farbe **„Rot“** erhalten."
          }
        ]
      },
      {
        "titel": "Datum",
        "inhalt": [
          {
            "b": "Rechts soll das heutige Datum eingefügt werden, welches sich jeden Tag **automatisch aktualisiert**! Das Format soll „Wochentag, TT.MM.JJJJ“ sein – also zum Beispiel „Donnerstag, 17.07.2026“."
          }
        ]
      },
      {
        "titel": "Seitenzahl",
        "inhalt": [
          {
            "b": "In der Fußzeile soll automatisch die **Seitenzahl** angezeigt werden."
          }
        ]
      },
      {
        "titel": "Kreisdiagramm",
        "inhalt": [
          {
            "b": "Rechts soll ein **Kreisdiagramm** eingefügt werden, das die Altersstruktur deiner DB-Gruppe abbildet (Alter und Anzahl). Du kannst das Alter deiner Mitschülerinnen und Mitschüler schätzen."
          },
          {
            "b": "Verkleinere das Diagramm so, dass es gut in den dafür vorgesehenen Platz passt."
          }
        ]
      },
      {
        "titel": "Zellen verbinden",
        "inhalt": [
          {
            "b": "Verbinde die Zelle „Verbinde diese Zelle …“ mit der Zelle „… mit dieser!“."
          }
        ]
      },
      {
        "titel": "Designfarben",
        "inhalt": [
          {
            "b": "Ändere die Farbe des rechten Texts auf **„Lavendel, Akzent 4, dunkler 25 %“**."
          },
          {
            "s": "Hierfür musst du zunächst das Farbset des kompletten Dokuments ändern: {{Entwurf > Farben}} ➔ **„Papier“** auswählen."
          }
        ]
      },
      {
        "titel": "Bildrahmen und Textumbruch",
        "inhalt": [
          {
            "b": "Das Logo auf der rechten Seite soll einen **Bildrahmen in Schwarz, Stärke 1** erhalten und mit einem **quadratischen Textumbruch** dargestellt werden."
          },
          {
            "b": "Verschiebe das Logo dann rechts neben den Text."
          }
        ]
      },
      {
        "titel": "Fußnote",
        "inhalt": [
          {
            "b": "Der Text rechts soll eine Fußnote erhalten. Du findest sie unter {{Referenzen}}."
          },
          {
            "b": "Schreibe „Text der Fußnote“ in die Fußnote. Klingt doof, ist aber so!"
          }
        ]
      },
      {
        "titel": "Schriftart",
        "inhalt": [
          {
            "b": "Ändere die Schriftart des gesamten Dokuments zu **„Aptos Narrow“**."
          },
          {
            "tipp": "Mit der Tastenkombination **Strg + A** kannst du alles markieren!"
          }
        ]
      },
      {
        "titel": "Als PDF speichern",
        "inhalt": [
          {
            "b": "Speichere das Dokument nun als PDF ab: {{Datei > Speichern unter}} ➔ Format **PDF** auswählen."
          }
        ]
      }
    ]
  },
  {
    "slug": "ausbildung",
    "kurz": "Infoblatt „Rechte und Pflichten für Azubis“",
    "level": "Einfach",
    "teaser": "Seitenränder, Formatvorlagen, Initiale, Listen, Infokasten und Fußnote – mit genauen Klickwegen.",
    "material": [
      {
        "label": "Vorlage (.docx)",
        "datei": "vorlage.docx",
        "downloadName": "01 vorlage – Infoblatt Ausbildung.docx"
      },
      {
        "label": "Bild",
        "datei": "bild_ausbildung.png",
        "downloadName": "bild_ausbildung.png"
      }
    ],
    "thema": "Ausbildung",
    "titel": "Erstellung eines Infoblatts",
    "szenario": "Sie absolvieren ein Praktikum bei der Ausbildungsberatung der Industrie- und Handelskammer. Für den Berufsorientierungstag an Schulen soll ein Infoblatt „Rechte und Pflichten für Azubis“ gestaltet werden. Der Text wurde bereits zur Verfügung gestellt (01 vorlage.docx). Sie passen lediglich das Layout nach folgenden Angaben an:",
    "start": 0,
    "rows": [
      {
        "titel": "Vorbereitung",
        "inhalt": [
          {
            "b": "Öffne die Datei **01 vorlage.docx** und speichere sie sofort unter deinem Nachnamen: {{Datei > Speichern unter > Durchsuchen}} – Dateiname: **nachname.docx**"
          },
          {
            "b": "Trage oben in der Kopfzeile deinen Namen und deine Klasse ein: Doppelklick auf die Kopfzeile, dann in die Tabellenzellen klicken und überschreiben."
          },
          {
            "b": "Füge in die Zelle „Datum“ das heutige Datum ein, das sich **automatisch aktualisiert**:"
          },
          {
            "s": "Wort „Datum“ markieren und löschen"
          },
          {
            "s": "{{Einfügen > Datum und Uhrzeit}} (Gruppe „Text“, ganz rechts)"
          },
          {
            "s": "Format „30.10.26“ wählen und unten den Haken bei **„Automatisch aktualisieren“** setzen ➔ OK"
          },
          {
            "s": "Kopfzeile schließen: Doppelklick in den normalen Text"
          },
          {
            "b": "Aktiviere die Textbegrenzungen: {{Datei > Optionen > Erweitert}} ➔ nach unten scrollen bis „Dokumentinhalt anzeigen“ ➔ Haken bei **„Textbegrenzungen anzeigen“**"
          },
          {
            "b": "Blende die Formatierungszeichen ein: {{Start > Absatz > ¶}} (Symbol „Alle anzeigen“). Jetzt siehst du jede Absatzmarke ¶."
          },
          {
            "b": "Lösche alle **leeren Zeilen** zwischen den Absätzen (Cursor in die leere Zeile setzen ➔ Entf). Den Abstand zwischen den Absätzen stellst du später sauber über „Abstand nach“ ein."
          }
        ]
      },
      {
        "titel": "Seitenränder",
        "inhalt": [
          {
            "b": "Oben: 2,5 cm; unten: 2 cm; links: 2,5 cm; rechts: 2 cm"
          },
          {
            "s": "{{Layout > Seitenränder > Benutzerdefinierte Seitenränder…}} (ganz unten in der Liste)"
          },
          {
            "s": "Werte eintragen ➔ unten bei „Übernehmen für“ muss **„Ganzes Dokument“** stehen ➔ OK"
          }
        ]
      },
      {
        "titel": "Fließtext – gilt für **alle** Absätze",
        "inhalt": [
          {
            "tipp": "Mit **Strg + A** markierst du den gesamten Text. Titel und Überschriften werden später ohnehin noch einmal angepasst."
          },
          {
            "b": "Schriftart **Calibri**, Schriftgröße **11 pt**: {{Start > Schriftart}} (Auswahlfelder oben links)"
          },
          {
            "b": "**Blocksatz**: {{Start > Absatz > Blocksatz}} (Symbol mit vier gleich langen Linien) oder Tastenkombination **Strg + B**"
          },
          {
            "b": "**Automatische Silbentrennung**: {{Layout > Silbentrennung > Automatisch}}"
          },
          {
            "b": "Zeilenabstand **mehrfach 1,15** und Abstand **nach 6 pt**:"
          },
          {
            "s": "Öffne das Absatzmenü: {{Start > Absatz}} ➔ kleiner Pfeil unten rechts in der Gruppe „Absatz“"
          },
          {
            "s": "Abstand Vor: **0 pt**, Nach: **6 pt** – Zeilenabstand: **Mehrfach**, Maß: **1,15** ➔ OK"
          }
        ]
      },
      {
        "titel": "Titel („Rechte und Pflichten für Azubis“)",
        "inhalt": [
          {
            "b": "Klicke in die erste Zeile und weise die Formatvorlage **„Titel“** zu: {{Start > Formatvorlagen > Titel}}"
          },
          {
            "s": "Siehst du „Titel“ nicht? Klicke auf den kleinen Pfeil rechts neben den Formatvorlagen, um alle anzuzeigen."
          },
          {
            "b": "Titel **zentrieren**: {{Start > Absatz > Zentriert}} (Strg + E)"
          },
          {
            "b": "Schriftfarbe **Blau, Akzent 1, dunkler 25 %**: Titel markieren ➔ {{Start > Schriftfarbe}} (Pfeil neben dem „A“ mit rotem Balken) ➔ mit der Maus über die Farben fahren, bis der richtige Name erscheint"
          }
        ]
      },
      {
        "titel": "Zwischenüberschriften",
        "inhalt": [
          {
            "t": "Betrifft: „Der Ausbildungsvertrag“, „Die Probezeit“, „Deine Pflichten als Azubi“ und „Deine Rechte als Azubi“"
          },
          {
            "b": "Weise allen vier Überschriften die Formatvorlage **„Überschrift 1“** zu: {{Start > Formatvorlagen > Überschrift 1}}"
          },
          {
            "tipp": "Halte die **Strg-Taste** gedrückt, dann kannst du mehrere Überschriften gleichzeitig markieren."
          }
        ]
      },
      {
        "titel": "Erster Absatz – Initiale",
        "inhalt": [
          {
            "t": "Der erste Buchstabe des ersten Absatzes („M“ von „Mit dem Beginn …“) soll groß über drei Zeilen dargestellt werden – wie in einer Zeitschrift."
          },
          {
            "b": "Klicke irgendwo in den ersten Absatz"
          },
          {
            "b": "{{Einfügen > Initiale > Initialoptionen…}} (Gruppe „Text“, Symbol mit großem „A“)"
          },
          {
            "s": "Position: **Im Text**"
          },
          {
            "s": "Initialhöhe (Zeilen): **3** – Abstand vom Text: **0,2 cm** ➔ OK"
          }
        ]
      },
      {
        "titel": "Bild einfügen (Absatz „Die Probezeit“)",
        "inhalt": [
          {
            "b": "Klicke an den Anfang des Absatzes „Jede Ausbildung beginnt …“"
          },
          {
            "b": "{{Einfügen > Bilder > Dieses Gerät…}} ➔ Datei **bild_ausbildung.png** auswählen ➔ Einfügen"
          },
          {
            "b": "Breite **5 cm**: Bild anklicken ➔ {{Bildformat > Größe}} (ganz rechts) ➔ Breite: 5 cm eintragen. Die Höhe passt sich automatisch an, weil das Seitenverhältnis gesperrt ist."
          },
          {
            "b": "Textumbruch **Quadrat**: {{Bildformat > Textumbruch > Quadrat}}"
          },
          {
            "b": "Bild an den **rechten Rand** schieben: {{Bildformat > Ausrichten > Rechts ausrichten}}"
          }
        ]
      },
      {
        "titel": "Pflichten – Nummerierung",
        "inhalt": [
          {
            "b": "Markiere die sechs Pflichten (von „Sorgfaltspflicht“ bis „Ausbildungsnachweis“)"
          },
          {
            "b": "{{Start > Absatz > Nummerierung}} ➔ Pfeil neben dem Symbol ➔ Format **„1. 2. 3.“**"
          },
          {
            "b": "Einzug anpassen: Absatzmenü öffnen (wie bei Nr. 2) ➔ Einzug Links: **0 cm** ➔ Sondereinzug: **Hängend** um **0,75 cm** ➔ OK"
          },
          {
            "b": "Setze jeweils den Begriff vor dem Doppelpunkt **fett** (z. B. „Sorgfaltspflicht:“): markieren und **Strg + Umschalt + F**"
          }
        ]
      },
      {
        "titel": "Rechte – Aufzählung mit Häkchen",
        "inhalt": [
          {
            "b": "Markiere die fünf Rechte (von „Du erhältst …“ bis „… schriftliches Zeugnis.“)"
          },
          {
            "b": "{{Start > Absatz > Aufzählungszeichen}} ➔ Pfeil neben dem Symbol ➔ **Neues Aufzählungszeichen definieren…**"
          },
          {
            "s": "Schaltfläche **Symbol…** ➔ Schriftart: **Wingdings**"
          },
          {
            "s": "Unten bei „Zeichencode“ **252** eintippen ➔ das Häkchen ist ausgewählt ➔ OK ➔ OK"
          },
          {
            "b": "Einzug wie bei den Pflichten: Links **0 cm**, Hängend **0,75 cm**"
          }
        ]
      },
      {
        "titel": "Infokasten („Gut zu wissen: …“)",
        "inhalt": [
          {
            "b": "Markiere den letzten Absatz und setze die Wörter „Gut zu wissen:“ **fett**"
          },
          {
            "b": "{{Start > Absatz > Rahmenlinien}} ➔ Pfeil neben dem Rahmensymbol ➔ ganz unten **Rahmen und Schattierung…**"
          },
          {
            "s": "Register **Rahmen**: Einstellung **Kontur** – Farbe **Blau, Akzent 1** – Breite **1 ½ pt**"
          },
          {
            "s": "Register **Schattierung**: Füllung **Blau, Akzent 1, heller 80 %**"
          },
          {
            "s": "Unten rechts bei „Übernehmen für“: **Absatz** ➔ OK"
          }
        ]
      },
      {
        "titel": "Fußnote",
        "inhalt": [
          {
            "b": "Klicke im ersten Absatz direkt hinter das Wort „**Berufsbildungsgesetz**“ (vor den Punkt)"
          },
          {
            "b": "{{Referenzen > Fußnote einfügen}}"
          },
          {
            "b": "Word springt automatisch an das Seitenende. Schreibe dort: **kurz BBiG – regelt die Berufsausbildung in Deutschland**"
          }
        ]
      },
      {
        "titel": "Seitenzahl in der Fußzeile",
        "inhalt": [
          {
            "b": "{{Einfügen > Seitenzahl > Seitenende}} ➔ in der Liste nach unten scrollen bis „Seite X von Y“ ➔ **Fett formatierte Zahlen 2** (zentriert)"
          },
          {
            "b": "Fußzeile schließen: {{Kopf- und Fußzeile > Kopf- und Fußzeile schließen}}"
          }
        ]
      },
      {
        "titel": "Speichern",
        "inhalt": [
          {
            "b": "Speichere die Datei (Strg + S)."
          },
          {
            "b": "Speichere sie zusätzlich als PDF: {{Datei > Speichern unter > Durchsuchen}} ➔ Dateityp: **PDF (*.pdf)** ➔ Speichern"
          }
        ]
      }
    ]
  },
  {
    "slug": "schuelerfirma",
    "kurz": "Werbeflyer der Schülerfirma",
    "level": "Mittel",
    "teaser": "Querformat, drei Spalten, Tabstopps mit Füllzeichen, Formatvorlage ändern und Text in Tabelle umwandeln.",
    "material": [
      {
        "label": "Vorlage (.docx)",
        "datei": "vorlage.docx",
        "downloadName": "01 vorlage – Flyer Schülerfirma.docx"
      },
      {
        "label": "Bild",
        "datei": "bild_kiosk.png",
        "downloadName": "bild_kiosk.png"
      }
    ],
    "thema": "Schülerfirma",
    "titel": "Gestaltung eines Werbeflyers",
    "szenario": "Die Schülerfirma „Pausenglück“ Ihrer Schule betreibt einen Pausenkiosk. Zum neuen Schuljahr soll ein Flyer im Querformat erstellt werden, der gefaltet an alle Klassen verteilt wird. Der Text liegt bereits vor (01 vorlage.docx). Sie passen lediglich das Layout nach folgenden Angaben an:",
    "start": 0,
    "rows": [
      {
        "titel": "Vorbereitung",
        "inhalt": [
          {
            "b": "Öffne **01 vorlage.docx** und speichere sie unter deinem Nachnamen: {{Datei > Speichern unter}}"
          },
          {
            "b": "Kopfzeile: Name und Klasse eintragen, Datum **automatisch aktualisierend** einfügen ({{Einfügen > Datum und Uhrzeit}} ➔ Haken „Automatisch aktualisieren“)"
          },
          {
            "b": "Textbegrenzungen aktivieren ({{Datei > Optionen > Erweitert > Textbegrenzungen anzeigen}})"
          },
          {
            "b": "Formatierungszeichen einblenden: {{Start > Absatz > ¶}}"
          },
          {
            "s": "In der Preisliste und bei den Öffnungszeiten siehst du jetzt kleine Pfeile (→). Das sind **Tabstopps** – sie werden in Nr. 8 und Nr. 10 wichtig. **Nicht löschen!**"
          },
          {
            "b": "Lösche alle leeren Zeilen zwischen den Absätzen."
          }
        ]
      },
      {
        "titel": "Seite einrichten",
        "inhalt": [
          {
            "b": "Querformat: {{Layout > Ausrichtung > Querformat}}"
          },
          {
            "b": "Seitenränder „Schmal“ (1,27 cm): {{Layout > Seitenränder > Schmal}}"
          }
        ]
      },
      {
        "titel": "Fließtext – gilt für **alle** Absätze (Strg + A)",
        "inhalt": [
          {
            "b": "Schriftart **Verdana**, Schriftgröße **10 pt**"
          },
          {
            "b": "**Blocksatz** ({{Start > Absatz > Blocksatz}}) und **automatische Silbentrennung** ({{Layout > Silbentrennung > Automatisch}})"
          },
          {
            "b": "Zeilenabstand **Einfach**, Abstand vor **0 pt**, nach **6 pt**: {{Start > Absatz}} ➔ kleiner Pfeil unten rechts ➔ Werte eintragen ➔ OK"
          }
        ]
      },
      {
        "titel": "Drei Spalten (Flyer zum Falten)",
        "inhalt": [
          {
            "b": "Der gesamte Text ist noch markiert (sonst: Strg + A)"
          },
          {
            "b": "{{Layout > Spalten > Weitere Spalten…}} (ganz unten in der Liste)"
          },
          {
            "s": "Voreinstellungen: **Drei** anklicken"
          },
          {
            "s": "Haken bei **„Zwischenlinie“** setzen"
          },
          {
            "s": "Abstand: **1,5 cm** – Haken bei **„Gleiche Spaltenbreite“** muss gesetzt sein ➔ OK"
          }
        ]
      },
      {
        "titel": "Spaltenumbrüche",
        "inhalt": [
          {
            "t": "Jede Spalte soll ein eigenes Thema haben. Mit einem Spaltenumbruch zwingst du den Text in die nächste Spalte."
          },
          {
            "b": "Klicke direkt **vor** das Wort „Unser Angebot“ ➔ {{Layout > Umbrüche > Spalte}}"
          },
          {
            "b": "Klicke direkt **vor** „So findest du uns“ ➔ {{Layout > Umbrüche > Spalte}}"
          },
          {
            "tipp": "Bei eingeblendeten Formatierungszeichen siehst du jetzt die Markierung „Spaltenumbruch“. Falls etwas schiefgeht: Markierung anklicken und mit Entf löschen."
          }
        ]
      },
      {
        "titel": "Titel („Pausenglück“) und Untertitel",
        "inhalt": [
          {
            "b": "Titel: Schriftgröße **24 pt**, **fett**, **zentriert**"
          },
          {
            "b": "Schriftfarbe: **Grün, Akzent 6, dunkler 25 %** ({{Start > Schriftfarbe}} ➔ Pfeil neben dem „A“)"
          },
          {
            "b": "Zeichenabstand **erweitert um 2 pt** (die Buchstaben rücken auseinander):"
          },
          {
            "s": "Titel markieren ➔ {{Start > Schriftart}} ➔ kleiner Pfeil unten rechts in der Gruppe „Schriftart“"
          },
          {
            "s": "Register **Erweitert** ➔ Abstand: **Erweitert** ➔ Von: **2 pt** ➔ OK"
          },
          {
            "b": "Untertitel („Die Schülerfirma …“): **kursiv**, **11 pt**, **zentriert**"
          }
        ]
      },
      {
        "titel": "Überschriften mit Formatvorlage – einmal ändern, überall wirksam",
        "inhalt": [
          {
            "t": "Betrifft: „Wer wir sind“, „Unser Versprechen“, „Unser Angebot“, „So findest du uns“"
          },
          {
            "b": "Weise allen vier Überschriften die Formatvorlage **„Überschrift 2“** zu: {{Start > Formatvorlagen > Überschrift 2}}"
          },
          {
            "b": "Jetzt änderst du die Formatvorlage selbst:"
          },
          {
            "s": "**Rechtsklick** auf „Überschrift 2“ im Formatvorlagen-Katalog ➔ **Ändern…**"
          },
          {
            "s": "Schriftart **Verdana**, Größe **13**, **fett**, Farbe **Grün, Akzent 6, dunkler 25 %** ➔ OK"
          },
          {
            "tipp": "Alle vier Überschriften ändern sich gleichzeitig. Genau das ist der Vorteil von Formatvorlagen!"
          }
        ]
      },
      {
        "titel": "Bild einfügen (erste Spalte)",
        "inhalt": [
          {
            "b": "Klicke an das Ende des Absatzes „Wir setzen auf regionale …“ und drücke **Enter**"
          },
          {
            "b": "{{Einfügen > Bilder > Dieses Gerät…}} ➔ **bild_kiosk.png**"
          },
          {
            "b": "Breite **6 cm** ({{Bildformat > Größe}}) – Seitenverhältnis bleibt automatisch erhalten"
          },
          {
            "b": "Bild **zentrieren**: Bild anklicken ➔ {{Start > Absatz > Zentriert}}"
          }
        ]
      },
      {
        "titel": "Preisliste mit Tabstopp und Füllzeichen",
        "inhalt": [
          {
            "t": "Die Preise sollen rechtsbündig untereinander stehen und mit Pünktchen mit dem Produkt verbunden sein:"
          },
          {
            "beispiel": [
              "Laugenbreze",
              "0,90 €"
            ]
          },
          {
            "b": "Markiere die acht Zeilen der Preisliste (von „Laugenbreze“ bis „… Mehrwegglas 2,20 €“)"
          },
          {
            "b": "Absatzmenü öffnen ({{Start > Absatz}} ➔ kleiner Pfeil unten rechts) ➔ unten links Schaltfläche **Tabstopps…**"
          },
          {
            "s": "Tabstoppposition: **7,5 cm**"
          },
          {
            "s": "Ausrichtung: **Rechts**"
          },
          {
            "s": "Füllzeichen: **2 ……**"
          },
          {
            "s": "Erst **Festlegen** klicken, dann **OK**"
          },
          {
            "tipp": "Ein Tabstopp ist eine feste Position in der Zeile. Mit der Tab-Taste (links neben dem Q) springt der Cursor dorthin. Leerzeichen zum Ausrichten sind tabu!"
          }
        ]
      },
      {
        "titel": "Hervorhebungen in der Preisliste",
        "inhalt": [
          {
            "b": "„NEU:“ **fett** und mit der Texthervorhebungsfarbe **Gelb** markieren: {{Start > Schriftart > Texthervorhebungsfarbe}} (Textmarker-Symbol)"
          },
          {
            "b": "Den Satz „Alle Preise inklusive …“: **kursiv**, Schriftgröße **8 pt**"
          }
        ]
      },
      {
        "titel": "Öffnungszeiten: Text in Tabelle umwandeln",
        "inhalt": [
          {
            "t": "Die vier Zeilen ab „Wochentag“ sind durch Tabstopps getrennt. Word kann daraus automatisch eine Tabelle machen."
          },
          {
            "b": "Markiere die vier Zeilen (von „Wochentag“ bis „Pausenhof“)"
          },
          {
            "b": "{{Einfügen > Tabelle > Text in Tabelle umwandeln…}}"
          },
          {
            "s": "Spaltenanzahl: **3** – Text trennen bei: **Tabstopps** ➔ OK"
          },
          {
            "b": "Tabellenformatvorlage: in die Tabelle klicken ➔ {{Tabellenentwurf > Tabellenformatvorlagen}} ➔ **Gitternetztabelle 4 – Akzent 6** (grün)"
          },
          {
            "b": "Text in der Tabelle: Schriftgröße **8 pt**, **linksbündig**"
          }
        ]
      },
      {
        "titel": "Kontakt mit Symbolen",
        "inhalt": [
          {
            "b": "„Öffnungszeiten:“ und „Kontakt:“ **fett** formatieren"
          },
          {
            "b": "Klicke vor „Telefon:“ ➔ {{Einfügen > Symbol > Weitere Symbole…}}"
          },
          {
            "s": "Schriftart: **Wingdings** ➔ Zeichencode: **40** (Telefon) ➔ Einfügen ➔ Schließen ➔ ein Leerzeichen dahinter setzen"
          },
          {
            "b": "Genauso vor „E-Mail:“ den Briefumschlag einfügen: Wingdings, Zeichencode **42**"
          }
        ]
      },
      {
        "titel": "Schlusssatz („Wir freuen uns auf deinen Besuch!“)",
        "inhalt": [
          {
            "b": "**fett**, **12 pt**, **zentriert**, Farbe **Grün, Akzent 6, dunkler 25 %**, Abstand vor: **12 pt**"
          }
        ]
      },
      {
        "titel": "Kontrolle und Speichern",
        "inhalt": [
          {
            "b": "Der Flyer muss auf **eine Seite** passen. Kontrolliere mit {{Datei > Drucken}} (Vorschau rechts)."
          },
          {
            "b": "Speichern (Strg + S) und zusätzlich als **PDF** speichern: {{Datei > Speichern unter}} ➔ Dateityp PDF"
          }
        ]
      }
    ]
  },
  {
    "slug": "daemmung",
    "kurz": "Informationsflyer „Dämmung Haus“",
    "level": "Mittel",
    "teaser": "WordArt, Seitenrandeffekte, Spalten mit Umbruch, Tabellenformatierung und Fußnote mit Symbol.",
    "material": [
      {
        "label": "Vorlage (.docx)",
        "datei": "vorlage.docx",
        "downloadName": "01 vorlage – Dämmung Haus.docx"
      },
      {
        "label": "Bild 1",
        "datei": "bild1.jpg",
        "downloadName": "bild1.jpg"
      }
    ],
    "thema": "Dämmung Haus",
    "titel": "Erstellung eines Informationsflyers",
    "szenario": "Sie absolvieren ein Praktikum bei der Verbraucherzentrale im Bereich der Energieberatung. Sie sollen einen Informationsflyer zum Thema „Durch richtiges Dämmen Heizkosten sparen“ anpassen. Der Text wurde bereits zur Verfügung gestellt (01 vorlage.docx). Sie passen lediglich das Layout nach folgenden Angaben an:",
    "start": 0,
    "rows": [
      {
        "titel": "Vorbereitung",
        "inhalt": [
          {
            "b": "Nachname, Vorname und Klasse oben eintragen. Das Datum einfügen, es soll sich **automatisch** aktualisieren."
          },
          {
            "b": "Aktiviere die Textbegrenzungen ({{Datei > Optionen > Erweitert > Textbegrenzungen anzeigen}})"
          }
        ]
      },
      {
        "titel": "Seitenrand",
        "inhalt": [
          {
            "b": "Links und rechts 2 cm; oben 2,5 cm; unten 2 cm ({{Layout > Seitenränder > Benutzerdefinierte Seitenränder}})"
          },
          {
            "b": "Seitenrandeffekte: Muster „Häuser“; Rand nur unten; Breite 25 pt; Farbe: Gold, Akzent 4 ({{Entwurf > Seitenränder}} unter „Effekte“)"
          },
          {
            "img": "daem_seitenrand.png"
          }
        ]
      },
      {
        "titel": "Gilt für __alle__ Absätze mit Fließtext (nicht die Hauptüberschrift)",
        "inhalt": [
          {
            "tipp": "Drücke **Strg + A**, um den gesamten Text zu markieren!"
          },
          {
            "b": "Schriftart Arial Narrow und Schriftgröße 10 pt"
          },
          {
            "b": "Blocksatz"
          },
          {
            "b": "Automatische Silbentrennung"
          },
          {
            "b": "Zeilenabstand: 1,5 Zeilen"
          }
        ]
      },
      {
        "titel": "Titel („Durch richtiges Dämmen Heizkosten reduzieren“)",
        "inhalt": [
          {
            "b": "Als WordArt einfügen: ~~Dazu die Überschrift markieren~~ ➔ {{Einfügen > WordArt}} ➔ ~~Farbverlauf Gold, Akzentfarbe 4; Kontur Gold, Akzentfarbe 4~~"
          },
          {
            "b": "Schriftart Century Schoolbook und Schriftgröße 18,5 pt"
          }
        ]
      },
      {
        "titel": "Unterüberschriften („Der Wärmedurchgangskoeffizient“, „U-Werte für Außenbauteile“ sowie „Vergleich der Heizkosten … Sanierung“)",
        "inhalt": [
          {
            "b": "Schriftart Century Schoolbook und Schriftgröße 11 pt"
          },
          {
            "b": "Fett"
          },
          {
            "b": "Wellenförmig unterstreichen"
          },
          {
            "b": "Abstand nach: 6 pt"
          }
        ]
      },
      {
        "titel": "Erster Absatz („Ein schlecht gedämmtes Haus … Geld sparen.“)",
        "inhalt": [
          {
            "t": "Bild 1 einfügen:"
          },
          {
            "b": "Textumbruch: Quadrat (Doppelklick auf das Bild ➔ {{Textumbruch > Quadrat}})"
          },
          {
            "b": "Breite: 5 cm (Seitenverhältnis beibehalten)"
          },
          {
            "b": "rechtsbündig"
          },
          {
            "b": "der obere Bildrand liegt auf gleicher Höhe wie die erste Zeile des Absatzes"
          }
        ]
      },
      {
        "titel": "Zweiter Absatz („Der Wärmedurchgangskoeffizient … angegeben.“) ohne die Überschrift",
        "inhalt": [
          {
            "b": "Der zweite Absatz soll in zwei gleich breiten Spalten mit Zwischenlinie dargestellt werden. Markiere hierfür zunächst den zweiten Absatz ohne die Überschrift und gehe dann auf {{Layout > Spalten > Weitere Spalten}}. Hier kannst du alle Einstellungen vornehmen."
          },
          {
            "b": "Füge anschließend einen manuellen Spaltenumbruch vor „Die jeweilige Bauteildicke …“ ein: Klicke mit der Maus vor „Die jeweilige Bauteildicke …“, anschließend auf {{Layout > Umbrüche > Spalte}}"
          },
          {
            "img": "daem_spalten.png"
          }
        ]
      },
      {
        "titel": "Dritter Absatz: Aufzählung nach „So haben die … folgende Werte:“",
        "inhalt": [
          {
            "t": "Die angegebenen U-Werte der Außenbauteile sollen als Aufzählung (Aufzählungszeichen: ▪) mit Einzug links: 0 cm und Sondereinzug hängend: 0,75 cm formatiert werden."
          }
        ]
      },
      {
        "titel": "Vierter Absatz: Tabelle",
        "inhalt": [
          {
            "img": "daem_tabelle.png"
          },
          {
            "b": "Zeilenabstand: einfach"
          },
          {
            "b": "Spalte 2 bis 4, Zeile 3 und 5: horizontal und vertikal mittig ausrichten. Dafür die entsprechenden Zellen markieren, oben auf {{Tabellenlayout}} klicken und „Zentriert ausrichten“ wählen."
          },
          {
            "b": "Tabellenbreite an die exakte Breite des Textbereichs anpassen (die Tabelle muss also rechts vergrößert werden)"
          },
          {
            "b": "Text **in** der Tabelle: Arial Narrow, Größe 10 pt"
          },
          {
            "b": "Spalten 2 bis 4 gleichmäßig verteilen (Breite): {{Spalten 2 bis 4 markieren > Rechtsklick > Spalten gleichmäßig verteilen}}"
          },
          {
            "b": "Zellen von Zeile 2 verbinden und Zellen von Zeile 4 verbinden"
          },
          {
            "b": "„vor Sanierung“ und „nach Sanierung“ unterstreichen"
          },
          {
            "b": "Erste Zelle (oben links): Rahmen links und oben entfernen"
          },
          {
            "b": "Erste Zeile: Hintergrund „Weiß, Hintergrund 1, dunkler 25 %“"
          }
        ]
      },
      {
        "titel": "Fußnote",
        "inhalt": [
          {
            "b": "Hinter das Wort „**Wärmedurchgangskoeffizient**“ im zweiten Absatz soll eine Fußnote mit dem Symbol ① eingefügt werden."
          },
          {
            "s": "Hinter das Wort „Wärmedurchgangskoeffizient“ klicken ➔ {{Referenzen}} ➔ Fußnotenmenü öffnen (kleiner Pfeil)"
          },
          {
            "s": "Klicke auf „Symbol“ und wähle die Schriftart **Wingdings** aus – dort findest du das Symbol"
          },
          {
            "b": "In die Fußnote, die sich nun am Seitenende gebildet hat, schreibst du den Text **„wird häufig auch als U-Wert bezeichnet“** (Arial Narrow, Größe 8)."
          },
          {
            "img": "daem_fussnote.png"
          }
        ]
      },
      {
        "titel": "Speichern",
        "inhalt": [
          {
            "b": "Speichere den Flyer unter deinem Nachnamen (nachname.docx) sowie zusätzlich als PDF ab."
          }
        ]
      }
    ]
  },
  {
    "slug": "sparkasse",
    "kurz": "Werbeflyer „PrivatKonto Young“",
    "level": "Mittel",
    "teaser": "Designfarben und Schriftartset, Bild zuschneiden, WordArt, Aufzählung, Spalten mit Umbruch, Tabellenrahmen und Fußnote.",
    "material": [
      {
        "label": "Vorlage (.docx)",
        "datei": "vorlage.docx",
        "downloadName": "01 vorlage – Sparkasse.docx"
      },
      {
        "label": "Bild „banner.jpg“",
        "datei": "banner.jpg",
        "downloadName": "banner.jpg"
      }
    ],
    "thema": "Sparkasse",
    "titel": "Erstellung eines Werbeflyers",
    "szenario": "Sie erstellen für Ihren Arbeitgeber, die Sparkasse, einen Werbeflyer für das neue Konto YOUNG für junge Leute. Öffne die passende Vorlagendatei und nimm folgende Änderungen vor:",
    "start": 0,
    "rows": [
      {
        "titel": "Vorbereitung",
        "inhalt": [
          {
            "b": "Name, Klasse und Datum in der Fußzeile eintragen. Das Datum soll im Format **TT.MM.JJ** angezeigt werden und sich **automatisch aktualisieren**."
          }
        ]
      },
      {
        "titel": "Grundlegende Formatierung",
        "inhalt": [
          {
            "b": "Schriftartset: **Arial** ({{Entwurf > Schriftarten}})"
          },
          {
            "b": "Designfarben/Farbset: **Rotorange** ({{Entwurf > Farben}})"
          },
          {
            "b": "Seitenränder: alle Seiten **1 cm** ({{Layout > Seitenränder > Benutzerdefinierte Seitenränder}})"
          }
        ]
      },
      {
        "titel": "Alle Absätze mit Fließtext und Tabelle (außer den Überschriften)",
        "inhalt": [
          {
            "b": "Schriftart **Arial 11 pt**"
          },
          {
            "b": "**Automatische Silbentrennung** ({{Layout > Silbentrennung > Automatisch}})"
          }
        ]
      },
      {
        "titel": "Bild",
        "inhalt": [
          {
            "b": "Über der Überschrift „PrivatKonto Young“ das Bild **„banner.jpg“** einfügen"
          },
          {
            "b": "**Schneide** das Bild in der Höhe zu. Es soll zwischen **4,4 und 4,7 cm** hoch sein, die Breite bleibt gleich (Doppelklick auf das Bild ➔ {{Bildformat > Zuschneiden}})"
          }
        ]
      },
      {
        "titel": "Hauptüberschrift („PrivatKonto Young“)",
        "inhalt": [
          {
            "b": "Als WordArt einfügen: **„Rot, Akzent 1, Schatten“** (1. Zeile, 2. Füllung) (Überschrift markieren ➔ {{Einfügen > WordArt}})"
          },
          {
            "b": "Textumbruch: **Mit Text in Zeile**"
          },
          {
            "b": "Textkontur **Rot, Akzent 1, heller 80 %**"
          },
          {
            "b": "Schriftart **Arial Black**"
          },
          {
            "b": "Schriftgröße: **26 pt**"
          }
        ]
      },
      {
        "titel": "Alle Unterüberschriften („Ihre Vorteile …“, „Mobiles Bezahlen“, „Preisvergleich“)",
        "inhalt": [
          {
            "b": "Schriftart Arial, **fett**"
          },
          {
            "b": "Schriftgröße **12 pt**"
          }
        ]
      },
      {
        "titel": "Absatztext nach „Ihre Vorteile im Überblick“",
        "inhalt": [
          {
            "b": "Aufzählung mit **schwarzem gefülltem Kreis**"
          },
          {
            "b": "Einzug links bei **0 cm**"
          },
          {
            "b": "Sondereinzug **hängend** bei **0,75 cm**"
          }
        ]
      },
      {
        "titel": "Absatztext nach „Mobiles Bezahlen“",
        "inhalt": [
          {
            "b": "**Zwei Spalten** (kompletten Absatz ohne die Überschrift markieren ➔ {{Layout > Spalten > Weitere Spalten}})"
          },
          {
            "b": "**Zwischenlinie** einfügen"
          },
          {
            "b": "Abstand zwischen den Spalten auf **1 cm** einstellen"
          },
          {
            "b": "**Spaltenumbruch** vor „hinzu, …“ (vor das Wort „hinzu“ klicken ➔ {{Layout > Umbrüche > Spalte}})"
          }
        ]
      },
      {
        "titel": "Tabelle nach „Preisvergleich“",
        "inhalt": [
          {
            "img": "spk_tabelle.png"
          },
          {
            "b": "Die **Rahmenlinien** sollst du wie oben abgebildet formatieren"
          },
          {
            "b": "Die Euro-Beträge sollen die Hintergrundfarbe **Rot, Akzent 1, heller 80 %** erhalten"
          },
          {
            "b": "Textfarbe der Zeilen- und Spaltenüberschriften: **Dunkelrot, Akzent 6, heller 40 %**"
          },
          {
            "b": "Spaltenüberschriften **zentriert** ausrichten (markieren ➔ {{Tabellenlayout}})"
          },
          {
            "b": "**Fußnote** nach „0,00 EUR“ (Standardnummerierung) bei der Kontoführung des Premium-Kontos ({{Referenzen > Fußnote einfügen}})"
          },
          {
            "s": "Text der Fußnote: **mtl. Mindestgeldeingang 5.000 EUR, sonst 12,90 EUR**"
          }
        ]
      },
      {
        "titel": "Abschluss",
        "inhalt": [
          {
            "b": "Lösche überflüssige Leerzeilen am Ende des Dokuments. Die Datei sollte am Ende **nur eine A4-Seite** enthalten."
          },
          {
            "b": "Speichere den Werbeflyer unter deinem Nachnamen (nachname.docx) ab."
          }
        ]
      }
    ]
  },
  {
    "slug": "bericht",
    "kurz": "Bericht für die Schülerzeitung",
    "level": "Schwer",
    "teaser": "Nummerierte Überschriften, Fußzeile, verbundene Tabellenzellen, Beschriftung, Zitat, Abschnitte und Hyperlink.",
    "material": [
      {
        "label": "Vorlage (.docx)",
        "datei": "vorlage.docx",
        "downloadName": "01 vorlage – Bericht Schülerzeitung.docx"
      },
      {
        "label": "Bild",
        "datei": "bild_smartphone.png",
        "downloadName": "bild_smartphone.png"
      }
    ],
    "thema": "Bericht",
    "titel": "Gestaltung eines Berichts",
    "szenario": "Für die Schülerzeitung hat die Klasse 10b eine Umfrage zur Smartphone-Nutzung durchgeführt. Die Ergebnisse sollen als einseitiger Bericht mit nummerierten Überschriften, Tabelle und Bild erscheinen. Der Text liegt bereits vor (01 vorlage.docx). Sie passen lediglich das Layout nach folgenden Angaben an:",
    "start": 0,
    "rows": [
      {
        "titel": "Vorbereitung",
        "inhalt": [
          {
            "b": "Öffne **01 vorlage.docx** und speichere sie unter deinem Nachnamen ({{Datei > Speichern unter}})"
          },
          {
            "b": "Kopfzeile: Name, Klasse und **automatisch aktualisierendes** Datum ({{Einfügen > Datum und Uhrzeit}})"
          },
          {
            "b": "Textbegrenzungen und Formatierungszeichen ¶ einblenden; alle leeren Zeilen löschen"
          }
        ]
      },
      {
        "titel": "Seitenränder",
        "inhalt": [
          {
            "b": "Oben **2 cm**, unten **1,5 cm**, links und rechts **2,5 cm**: {{Layout > Seitenränder > Benutzerdefinierte Seitenränder…}}"
          }
        ]
      },
      {
        "titel": "Fließtext – gilt für **alle** Absätze (Strg + A)",
        "inhalt": [
          {
            "b": "Calibri, 11 pt, **Blocksatz**, **automatische Silbentrennung**"
          },
          {
            "b": "Zeilenabstand **mehrfach 1,15**, Abstand vor **0 pt**, nach **6 pt** ({{Start > Absatz}} ➔ kleiner Pfeil unten rechts)"
          }
        ]
      },
      {
        "titel": "Titel und Untertitel",
        "inhalt": [
          {
            "b": "„Immer online?“ ➔ Formatvorlage **„Titel“**; „Ergebnisse der Smartphone-Umfrage …“ ➔ Formatvorlage **„Untertitel“** ({{Start > Formatvorlagen}})"
          }
        ]
      },
      {
        "titel": "Überschriften mit Formatvorlagen",
        "inhalt": [
          {
            "b": "Formatvorlage **„Überschrift 1“** für: „Einleitung“, „Ergebnisse der Umfrage“, „Fazit und Tipps“"
          },
          {
            "b": "Formatvorlage **„Überschrift 2“** für: „Nutzungsdauer“, „Beliebteste Apps“, „Datenschutz“"
          },
          {
            "b": "Kontrolle: {{Ansicht > Navigationsbereich}} – links müssen jetzt alle sechs Überschriften in der richtigen Gliederung erscheinen."
          }
        ]
      },
      {
        "titel": "Überschriften automatisch nummerieren",
        "inhalt": [
          {
            "t": "Die Überschriften sollen so nummeriert werden: 1 – 2 – 2.1 – 2.2 – 2.3 – 3"
          },
          {
            "b": "Klicke in die Überschrift „Einleitung“"
          },
          {
            "b": "{{Start > Absatz > Liste mit mehreren Ebenen}} (drittes Listensymbol oben in der Gruppe „Absatz“)"
          },
          {
            "s": "Wähle in der **Listenbibliothek** die Variante, in der „**1 Überschrift 1**“ und „**1.1 Überschrift 2**“ steht."
          },
          {
            "b": "Kontrolliere: Alle sechs Überschriften sind jetzt automatisch durchnummeriert."
          }
        ]
      },
      {
        "titel": "Fußzeile mit Seitenzahl",
        "inhalt": [
          {
            "b": "Doppelklick in den unteren Seitenrand – die Fußzeile öffnet sich"
          },
          {
            "b": "Schreibe links: **Schülerzeitung – Ausgabe Herbst 2026**"
          },
          {
            "b": "Drücke **zweimal die Tab-Taste** – der Cursor springt an den rechten Rand"
          },
          {
            "b": "{{Kopf- und Fußzeile > Seitenzahl > Aktuelle Position > Einfache Zahl}}"
          },
          {
            "b": "Schließen: {{Kopf- und Fußzeile > Kopf- und Fußzeile schließen}}"
          }
        ]
      },
      {
        "titel": "Fußnote (Einleitung)",
        "inhalt": [
          {
            "b": "Klicke hinter das Wort „**befragt**“ (letzter Satz der Einleitung, vor den Punkt) ➔ {{Referenzen > Fußnote einfügen}}"
          },
          {
            "b": "Text der Fußnote: **Befragungszeitraum: 5. bis 16. Oktober 2026; 120 vollständig ausgefüllte Fragebögen.**"
          }
        ]
      },
      {
        "titel": "Tabelle „Nutzungsdauer“ gestalten",
        "inhalt": [
          {
            "t": "So soll die Tabelle am Ende aussehen (die Beschriftung folgt in Nr. 9):"
          },
          {
            "img": "ziel_tabelle.png"
          },
          {
            "b": "**Zellen verbinden:** Markiere „Nutzungsdauer pro Tag …“ und die leere Zelle rechts daneben ➔ {{Tabellenlayout > Zellen verbinden}}"
          },
          {
            "s": "Genauso: „Jahrgangsstufe“ und die leere Zelle darunter verbinden"
          },
          {
            "b": "**Spaltenbreite:** in Spalte 1 klicken ➔ {{Tabellenlayout > Zellengröße > Breite}}: **4 cm**; Spalten 2 und 3: je **3,5 cm**"
          },
          {
            "b": "**Kopfbereich** (die beiden oberen Zeilen) markieren:"
          },
          {
            "s": "{{Tabellenentwurf > Schattierung}} ➔ **Blau, Akzent 1** – Schrift **weiß** und **fett**"
          },
          {
            "b": "**Ausrichtung:** ganze Tabelle markieren ➔ {{Tabellenlayout > Ausrichtung}} ➔ **Zentriert** (Symbol in der Mitte des 3×3-Feldes)"
          },
          {
            "s": "Danach nur die Zellen „7“ bis „Gesamt“ (Spalte 1) markieren ➔ **Zentriert links** (Symbol links in der Mitte)"
          },
          {
            "b": "**Zeile „Gesamt“**: fett; oben eine **doppelte Linie**:"
          },
          {
            "s": "Zeile markieren ➔ {{Tabellenentwurf > Rahmen > Linienart}}: doppelte Linie wählen"
          },
          {
            "s": "{{Tabellenentwurf > Rahmenlinien}} (Pfeil) ➔ **Rahmenlinie oben**"
          },
          {
            "b": "**Tabelle auf der Seite zentrieren:** auf das Kreuz-Symbol ⊕ links oben an der Tabelle klicken ➔ {{Start > Absatz > Zentriert}}"
          }
        ]
      },
      {
        "titel": "Tabelle beschriften",
        "inhalt": [
          {
            "b": "Tabelle markieren (Kreuz-Symbol) ➔ **Rechtsklick** ➔ **Beschriftung einfügen…**"
          },
          {
            "s": "Bezeichnung: **Tabelle** (fehlt sie: „Neue Bezeichnung…“ ➔ Tabelle)"
          },
          {
            "s": "Position: **Über dem ausgewählten Element**"
          },
          {
            "s": "Ergänze im Feld „Beschriftung“ hinter „Tabelle 1“: **: Durchschnittliche Nutzungsdauer pro Tag in Stunden** ➔ OK"
          }
        ]
      },
      {
        "titel": "Bild einfügen („Beliebteste Apps“)",
        "inhalt": [
          {
            "b": "Klicke an den Anfang des Absatzes „Bei den meistgenutzten Apps …“ ➔ {{Einfügen > Bilder > Dieses Gerät…}} ➔ **bild_smartphone.png**"
          },
          {
            "b": "Breite **4 cm** ({{Bildformat > Größe}}) – Seitenverhältnis bleibt erhalten"
          },
          {
            "b": "Textumbruch **Quadrat** ({{Bildformat > Textumbruch > Quadrat}}) und an den rechten Rand: {{Bildformat > Ausrichten > Rechts ausrichten}}"
          },
          {
            "b": "Die Tabellenbeschriftung aus Nr. 9 **zentrieren**"
          }
        ]
      },
      {
        "titel": "Zitat hervorheben („Datenschutz“)",
        "inhalt": [
          {
            "b": "Klicke in das Zitat „Ich lese die Datenschutzhinweise nie …“ und setze es **kursiv**"
          },
          {
            "b": "Absatzmenü ➔ Einzug **Links: 1 cm** und **Rechts: 1 cm**"
          },
          {
            "b": "Linke Linie: {{Start > Rahmenlinien}} (Pfeil) ➔ **Rahmen und Schattierung…**"
          },
          {
            "s": "Farbe **Blau, Akzent 1**, Breite **3 pt** ➔ im Vorschaubild rechts **nur auf die linke Linie** klicken ➔ Übernehmen für: **Absatz** ➔ OK"
          }
        ]
      },
      {
        "titel": "Tipps zweispaltig als Aufzählung („Fazit und Tipps“)",
        "inhalt": [
          {
            "b": "Markiere die vier Tipps (von „Bildschirmzeit-Funktion …“ bis „… weglegen“)"
          },
          {
            "b": "Aufzählungszeichen • setzen: {{Start > Absatz > Aufzählungszeichen}}"
          },
          {
            "b": "Die Tipps bleiben markiert ➔ {{Layout > Spalten > Zwei}}"
          },
          {
            "tipp": "Word fügt dabei automatisch **Abschnittsumbrüche** ein (bei eingeblendetem ¶ sichtbar). Nur dieser Abschnitt ist zweispaltig – der Rest bleibt einspaltig."
          }
        ]
      },
      {
        "titel": "Hyperlink",
        "inhalt": [
          {
            "b": "Markiere unter „Fazit und Tipps“ das Wort „klicksafe“ ➔ {{Einfügen > Link}}"
          },
          {
            "s": "Adresse: **https://www.klicksafe.de** ➔ OK. Test: Strg gedrückt halten und auf den Link klicken."
          }
        ]
      },
      {
        "titel": "Abschluss",
        "inhalt": [
          {
            "b": "Kontrolle: Der Bericht muss auf **genau eine Seite** passen ({{Datei > Drucken}} ➔ Vorschau)."
          },
          {
            "b": "Speichern (Strg + S) und zusätzlich als **PDF** speichern"
          }
        ]
      }
    ]
  }
];

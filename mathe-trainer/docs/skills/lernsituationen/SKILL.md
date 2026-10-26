---
name: "lernsituationen"
description: "Entwickelt forschungsbasierte, abwechslungsreiche Einstiegs-Lernsituationen für neue Themen im Mathe-Trainer (Wirtschaftsschule, 15–18 J.) mit Alltagsbezug und hoher Schüleraktivität."
---

# Lernsituationen für den Mathe-Trainer

Dieser Skill entwickelt **Einstiegs-Lernsituationen** für neue Mathe-Themen und setzt sie als Seite im Mathe-Trainer (https://ws-mathe-trainer.vercel.app/) um.

- **Zielgruppe:** Schülerinnen und Schüler (SuS) der Wirtschaftsschule in Bayern, 15 bis 18 Jahre.
- **Nur für den Themeneinstieg.** Vertiefende Übungsseiten laufen über den Skill `mathe-aufgaben`. Eine Lernsituation führt ein Thema ein und sichert die Kernidee, sie übt nicht ausführlich.
- **Kein Lehrkraft-Material** auf der Seite. Alles richtet sich direkt an die SuS.
- **Endgerät:** Tablet im **Querformat**. Jede Seite ist trotzdem **einspaltig** (siehe "Ruhiges Grunddesign"). Nach unten scrollen ist erlaubt, zur Seite nie.
- **Neueste Umsetzung mit allen aktuellen Regeln** (5 Warm-up-Aufgaben, Kriterium Begriffe und Abkürzungen, Bonus-Spiel, Punkte und Bilanz): `mathe-trainer/src/pages/finanzmathe/rentenrechnung_einstieg/VereinsbusEinstieg.tsx` (Der Vereinsbus) mit `BusRallye.tsx`. Vorlage für **Punkte nach Aufwand** (Balancing): `mathe-trainer/src/pages/lineare_funktionen/schnittpunkt_einstieg/LaserEinstieg.tsx` (Die Lasershow) mit dem Spiel `KugelTreffer.tsx`.
- **Referenz-Umsetzung:** `mathe-trainer/src/pages/finanzmathe/zinsrechnung_einstieg/AutogeldEinstieg.tsx` (Lenas Autogeld): eine Seite pro Phase und Phase 4 mit vier Übungsaufgaben. Achtung: Ihr "Problem lösen" hat noch den alten Aufbau mit `WegWahl`; maßgeblich für "Problem lösen" ist der Vereinsbus. Für Ausprobieren mit Live-Rückmeldung und Titelbilder zusätzlich `lineare_funktionen/nullstellen_einstieg/StromspeicherEinstieg.tsx` (nach neuer Fassung überarbeitet) und `quadratische_funktionen/funktionsgleichung_einstieg/TorbogenEinstieg.tsx` (noch ältere Aufteilung mit einer Aufgabe pro Seite) ansehen. Vor dem Bauen ansehen.
- **Diese Datei ist die maßgebliche Fassung des Skills.** Der Skill „lernsituationen“ im claude.ai-Konto der Lehrkraft verweist nur hierher. Neue oder geänderte Regeln werden **nur hier** eingetragen (und bei Bedarf kurz in `mathe-trainer/CLAUDE.md`), dann wie üblich in `main` gemergt. Die Lehrkraft muss danach nichts neu hochladen.

## Grundidee: fester Kern, variable Bausteine

Lernsituationen dürfen **nicht nach Schema F** ablaufen. Gleichförmigkeit langweilt und demotiviert.

- **Fest** sind die vier Phasen mit **genau einer Seite pro Phase**, der Aufbau von "Problem lösen" (Problem → Beispielrechnung mit Lernvideo zum Aufklappen → Ergebnisse abgleichen mit Fehlersuche → Handlungsprodukt), die Seitenansicht, das **ruhige Grunddesign**, die didaktischen Leitlinien, die Pflichtfunktionen und die Schreib- und Rechenkonventionen.
- **Variabel** sind Kontext, Dramaturgie (Format), Handlungsprodukt, Sozialformen, die Methoden innerhalb der Phasen und die **Identität** der Lernsituation.
- **Ruhig, aber unverwechselbar:** Alle Lernsituationen haben dasselbe ruhige Gerüst, aber jede hat ein eigenes Gesicht (Abschnitt "Identität jeder Lernsituation"). Die SuS sollen auf jeder Seite sofort erkennen, in welcher Lernsituation sie sind.
- **Abwechslung wird geprüft**, nicht dem Zufall überlassen (Abschnitt "Abwechslung absichern").

## Ablauf

### 1. Log lesen
Lies vor allem anderen `lernsituationen-log.md` im Repo (Abschnitt "Abwechslung absichern"). Notiere, welche Formate, Handlungsprodukte, Themenfarben und Kontextbereiche in den letzten drei Lernsituationen vorkamen. Existiert die Datei noch nicht, lege sie an und trage vorhandene Lernsituationen-Seiten aus dem Repo nachträglich ein.

### 2. Kurz nachfragen
Stelle der Lehrkraft höchstens 4 Fragen, falls nicht schon beantwortet:
- Thema und Jahrgangsstufe (Lehrplanbezug LehrplanPLUS Wirtschaftsschule)
- Vorwissen der Klasse: Was können die SuS schon, was ist neu? (Neue Verfahren, die vorher gebraucht werden, z. B. das Additionsverfahren, gehören dann in die Lernsituation.)
- Geplante Dauer: kurz (15–25 min), 45 min oder 90 min
- Besonderheiten: Geräte pro Person oder pro Gruppe, Gruppenarbeit möglich, Distanzlernen

### 3. Kombinationen vorschlagen
Schlage 2 bis 3 **komplette Kombinationen** vor. Jede besteht aus:
- **Kontext** in einem Satz und **Leitfrage** an die SuS
- **Format** (aus dem Formatkatalog)
- **Problem erkennen:** Woran merken die SuS, dass sie mit Raten oder Vorwissen nicht sicher weiterkommen?
- **Handlungsprodukt** (aus dem Abschnitt "Handlungsprodukte", überwiegend analog)
- **Identität:** Themenfarbe, Symbol, Titelbild und Leitobjekt (Abschnitt "Identität jeder Lernsituation")
- einem Satz, warum die Kombination zum Inhalt passt und kognitiv aktiviert

Die Kombinationen unterscheiden sich untereinander deutlich und halten die Abwechslungsregel ein. Die Lehrkraft wählt eine aus oder kombiniert. Will die Lehrkraft ausdrücklich, dass direkt gebaut wird, entscheide selbst nach der Abwechslungsregel und nenne die Wahl am Ende.

### 4. Didaktisches Konzept zur Abstimmung
Lege ein kompaktes Konzept vor:
- Lernziel in einem Satz
- Plan der vier Phasen-Seiten: je Phase die Aufgaben, die Pflichtaufgaben für "Weiter" und die ungefähre Zeit
- Das Problem in einem Satz (gegeben, gesucht), das passende Rechenbeispiel mit anderen Zahlen, die Ergebnisfelder und die Zwischenergebnisse für die Fehlersuche
- Handlungsprodukt mit 2 bis 4 Kriterien, dazu immer das Kriterium „Begriffe und Abkürzungen“
- Passendes Lernvideo für das Rechenbeispiel (aus den Übungsaufgaben des Themas), falls vorhanden
- Hilfen (drei gestufte Hilfen beim Ergebnis-Abgleich) und Niveaustufen
- Der Aha- oder Widerspruchsmoment
- 3 bis 4 Übungsaufgaben für Phase 4 und die typischen Fehlvorstellungen, auf die sie zielen

Baue die Seite erst nach Freigabe (außer die Lehrkraft will ausdrücklich direkt gebaut haben).

### 5. Design vorbereiten
Lade **vor dem ersten Code** den Skill `frontend-design` mit dem Skill-Tool. Wende ihn innerhalb der Vorgaben aus "Ruhiges Grunddesign" und "Identität jeder Lernsituation" an: Diese Vorgaben haben Vorrang, `frontend-design` hilft bei Typografie, Abständen, Hierarchie, Fokus und beim Titelbild.

### 6. Seite bauen und Auswahlseite umbauen
Siehe Abschnitte "Die vier Phasen", "Seitenansicht", "Ruhiges Grunddesign", "Identität jeder Lernsituation" und "Digitale Umsetzung". **Immer dazu:** die Startseite des Themas so umbauen, dass die SuS zwischen der Lernsituation und den bereits vorhandenen Übungsaufgaben wählen (Abschnitt "Auswahlseite des Themas").

### 7. Design prüfen
Lade nach dem Bauen den Skill `design:design-critique` mit dem Skill-Tool. Erstelle mit Playwright Screenshots **jeder Seite** und der Startbox bei 1180 × 820 (Tablet quer) und bei 1920 × 1080 (breiter Monitor, muss ebenfalls einspaltig bleiben), bei Bedarf als ganze Seite (`full_page`), sieh sie dir an und prüfe sie mit der Design-Kritik, besonders:
- Ist auf jeder Seite sofort klar, was das Wichtigste ist (Problem bzw. Auftrag)?
- Erkennt man auf jeder Seite, in welcher Lernsituation man ist?
- Gibt es überflüssige Rahmen, Kästen, Farbstreifen, Banner oder Farben?
- Haben "Problem erkennen" und "Problem lösen" ein passendes Bild, oder ist dort nur Text?
- Sind Skizzen und Graphen groß genug und ihre Beschriftungen gut lesbar?
- Ist alles einspaltig, ruhig und auf dem Tablet gut bedienbar (Phasennamen nicht abgeschnitten, kein seitliches Scrollen)?

Behebe die gefundenen Punkte, bevor du die Seite übergibst.

### 8. Log aktualisieren und Selbstcheck
Trage die neue Lernsituation ins Log ein. Prüfe die Seite mit der Checkliste am Ende, führe den Test aus dem Abschnitt "Seitenansicht" aus und nenne der Lehrkraft offene Punkte.

### 9. Veröffentlichen
Wie in `CLAUDE.md` des Repos: direkt committen, pushen und mit eigenem Merge-Commit (`git merge --no-ff`) in `main` mergen, `main` zuerst pushen. Keinen Pull Request anlegen, nicht nachfragen.

## Die vier Phasen (fest)

Jede Lernsituation hat **genau diese vier Phasen in dieser Reihenfolge**. Namen und Reihenfolge stehen im Code nur in `lineare_funktionen/lernsituation_kit/phasen.tsx` (`PHASEN`, `art`: `start`, `problem`, `loesen`, `sichern`).

| Phase | Inhalt (alles auf **einer** Seite) |
| --- | --- |
| **1 Warm-up** | Vorwissen abrufen, das gleich gebraucht wird (Retrieval Practice): **mindestens 5** kurze Aufgaben untereinander (alle Pflicht), z. B. Wert ablesen, einfache Gleichung lösen, Klammer ausmultiplizieren. Jede Aufgabe ist **sichtbar nummeriert** (siehe unten). |
| **2 Problem erkennen** | Kontext, Leitfrage und Festlegung bzw. Ausprobieren. Die SuS merken selbst, dass sie das Problem mit ihrem bisherigen Wissen nicht sicher lösen können. |
| **3 Problem lösen** | Problem oben, Beispielrechnung mit Lernvideo zum Aufklappen (breiter Knopf), Ergebnisse aus dem Heft abgleichen mit automatischer Fehlersuche, ggf. Entscheidung, Handlungsprodukt mit Kriterien, danach "Das hältst du fest" (Rückbezug und Merke). |
| **4 Wissen prüfen und vertiefen** | Mindestens 3, besser 4 passende Übungsaufgaben mit steigendem Niveau (Basis, Standard, Erweiterung), mit typischen Fehlern als Antwortoptionen; darunter das **Bonus-Spiel** (frei, sobald alle Pflichtaufgaben gelöst sind) und die Abschluss-Buttons. |

Namen und Reihenfolge stehen im Code nur in `PHASEN` (`phasen.tsx`). Die Phasenleiste zeigt die vier Phasen; einen Seitenzähler gibt es nicht mehr, weil jede Phase genau eine Seite ist.

**Logik der Reihenfolge:** Nie etwas prüfen oder abfragen, das die SuS noch nicht lernen konnten. Erst entdecken bzw. erarbeiten, dann sichern, dann prüfen. Auch Fehlerbeispiele ("Wer hat recht?") gehören erst in Phase 4 "Wissen prüfen und vertiefen".

**Keine Austausch-Phase:** Es gibt keinen Stopp-Kasten "Besprecht eure Ergebnisse mit der Klasse", kein "Vergleicht eure Wege" und keine aufklappbaren Lösungswege anderer ("Du arbeitest allein? So haben andere gedacht …"). Partner- oder Gruppenarbeit innerhalb einer Phase ist erlaubt und wird markiert.

### Phase 1: Nummerierung im Warm-up

Jede Aufgabe im Warm-up bekommt eine sichtbare Nummer, damit die SuS im Heft und im Gespräch sagen können, welche Aufgabe gemeint ist („Bei b) komme ich nicht weiter“). Dafür bekommt jede Karte (`CheckCard`, `McCard`) einen `title` aus Buchstabe und kurzem Namen in der Reihenfolge der Seite: „a) x einsetzen“, „b) Gleichung lösen“, „c) …“. In der Seitenansicht sind Kartentitel sonst ausgeblendet; auf der Warm-up-Seite zeigt `seiten.css` sie automatisch in der Themenfarbe über der Aufgabe an (`.sl-seite.et-start .lp-ex-title`). Die Buchstaben laufen über die ganze Warm-up-Seite durch, auch wenn Aufgaben mit `Abschnitt` gegliedert sind. In "Wissen prüfen und vertiefen" heißen die Aufgaben weiter „Übung 1“, „Übung 2“ … (Zwischenüberschriften mit `Abschnitt`).

### Phase 2: Aufbau der Seite "Problem erkennen"

Von oben nach unten, einspaltig, ohne verschachtelte Kästen:
1. **Seitentitel** (z. B. "Der Torbogen für die Hofeinfahrt"). Die Phase steht bereits in der Phasenleiste.
2. **Situation** als kurzer Fließtext (2–3 Sätze), z. B. "Du bist Azubi im Metallbau. …"
3. **Problem** als Fließtext: was gegeben und was gesucht ist, z. B. "Du kennst den Scheitelpunkt S(2 | 3) und einen weiteren Punkt P(0 | 2) des Bogens. Gesucht ist die Funktionsgleichung in allgemeiner Form y = ax² + bx + c." Keine getrennten Kacheln "Gegeben"/"Gesucht".
4. **Auftrag:** das einzige hervorgehobene Element der Seite. Ein klarer Satz, was jetzt zu tun ist.
5. **Bild der Situation** (Abschnitt "Bilder in Problem erkennen und Problem lösen"), z. B. ein Sachbild der Angebote, eine Pinnwand oder ein Funktionsgraph.
6. **Skizze und Interaktion** darunter (Skizze in gut lesbarer Größe, Eingaben, Button, Rückmeldung). Die SuS dürfen dafür nach unten scrollen.

Hinweise wie "Probiere mindestens drei Gleichungen aus, dann geht es weiter" stehen als `bedingung` im Seitenkopf bzw. bei der Interaktion, nicht als zusätzliches farbiges Banner.

### Phase 2: Problem erkennen durch Ausprobieren (bevorzugte Methode)

Wo es inhaltlich passt, probieren die SuS selbst Lösungen aus und bekommen sofort sichtbare Rückmeldung. Sie merken dabei, dass Raten nicht zuverlässig zum Ziel führt. Beispiel Torbogen: Die SuS tippen Werte für a, b und c direkt in `y = [a]x² + [b]x + [c]` ein, klicken "An die Maschine senden", der Graph wird **sofort in die Skizze gezeichnet** und die Maschine meldet, welche Bedingungen passen und welche nicht.

- Der Auftrag sagt ausdrücklich, dass es ums **Ausprobieren** geht ("Probier es aus, ohne zu rechnen").
- Auftrag, Skizze, Eingabe und Rückmeldung stehen **auf derselben Seite**, nicht auf zwei Seiten verteilt.
- Freischaltung nach einer Mindestzahl an Versuchen (z. B. 3) oder einem Treffer. Danach eine kurze Erkenntnis ("Raten bringt dich kaum ans Ziel. Gleich lernst du, wie …").
- Andere Wege bleiben möglich, wenn Ausprobieren nicht passt: Widerspruch, Entscheidungsfrage, Schätzung mit Auflösung.

### Phase 3: Problem lösen

Alles auf einer Seite, **immer in dieser Reihenfolge** von oben nach unten:

1. **Das Problem noch einmal oben** als einziger Fokus (`sl-fokus`): konkreter Arbeitsauftrag in eigenen Worten, was gegeben und was gesucht ist und in welcher Form das Ergebnis stehen soll. Darunter ein Bild zum Problem (Leitobjekt, Skizze oder Graph mit nur den gegebenen Größen, bei Umstellaufgaben die Formel mit markierter gesuchter Größe).
2. **Beispielrechnung mit Lernvideo** (`BeispielMitVideo` aus `lernsituation_kit/seiten.tsx`): **ein** Knopf „Beispielrechnung mit Lernvideo ansehen“ (ohne Video: „Beispielrechnung ansehen“), **so breit wie die übrigen Elemente der Seite**. Aufgeklappt steht oben das eingebettete Lernvideo (`video="…"`, lädt erst nach Antippen), darunter das ausgearbeitete Beispiel mit **anderen Zahlen**, Schritt für Schritt (`<Beispiel offen …/>`). Die SuS entscheiden selbst, ob sie Video, Beispiel oder beides nutzen; beides ist kostenlos. Die Lernvideos sind meist schon bei den Übungsaufgaben des Themas verlinkt (z. B. `VideoButton url=…` oder eine `VIDEO`-Liste in der Übungsseite): Von dort übernehmen. Gibt es keines, der Lehrkraft am Ende als offenen Punkt nennen. Ein Rechenbeispiel vor der Problemdarstellung ist nicht erlaubt, auch nicht im Warm-up oder in Phase 2.
3. **„Vergleiche deine Ergebnisse“** (`Abschnitt` mit einer `CheckCard`): Die SuS rechnen im Heft und tippen nur ihre **Endergebnisse** in die Felder („Trage die Ergebnisse aus deinem Heft ein. Jedes Feld zeigt dir sofort, ob es stimmt.“). Die Felder sind als Fragen formuliert (z. B. „Wie viel Geld ist am Ende des 6. Jahres auf dem Konto, wenn …?“), keine Vorstrukturierung des Rechenwegs. Dazu drei gestufte `Hilfen`, `loesungNachFehler` und `onFehler={() => setFehler(true)}`. Es gibt **keine** Wahl „Selbst rechnen / Mit Lösungsschema“ mehr (`WegWahl` nicht mehr verwenden).
4. **Fehlersuche** (`Fehlersuche` aus `seiten.tsx`) direkt darunter: breiter Knopf „Ein Ergebnis ist rot? Fehler suchen“, der **sich automatisch öffnet**, sobald ein Ergebnisfeld rot wurde (`fehler={fehler}`). Darin eine `CheckCard` mit `ohnePunkte`, `rechnen={false}` und `fieldsRow` für die wichtigen **Zwischenergebnisse** (z. B. `q`, `q^6`, Bruch), mit dem Satz „Prüfe deine Zwischenergebnisse. Das erste rote Feld zeigt dir, in welchem Schritt du nachrechnen musst.“ Die Fehlersuche ist freiwillig, keine Pflichtaufgabe und kostet keine Punkte.
5. **Entscheidung** (wenn die Situation eine verlangt), z. B. per Auswahl "Welches Angebot empfiehlst du?".
6. **Handlungsprodukt** (`Handlungsprodukt`): Auftrag, das Handlungsprodukt im Heft zu gestalten (Abschnitt "Handlungsprodukte"), mit kleinem Bild (Brief, Karteikarte, Plakat) und aufklappbaren Satzanfängen. Darunter die **Kriterien zum Abhaken** ("Ist deine Antwort vollständig?"). Ein Kriterium ist **immer**: unbekannte Begriffe und die Bedeutung aller Abkürzungen der Formel aufschreiben, konkret für das Thema benannt (z. B. „Was bedeuten K_n, r, q und n? r ist die Rate (Rente) …, außerdem: vorschüssig, nachschüssig“).
7. **"Das hältst du fest"**, sobald die Rechnung gelöst ist: Rückbezug auf die Festlegung bzw. die Versuche aus Phase 2 und der Merkkasten.

Vorlage: `finanzmathe/rentenrechnung_einstieg/VereinsbusEinstieg.tsx` (Seite „Der Kontostand für den Vereinsbus“).

Sind mehrere Teilprobleme nötig (z. B. erst K, dann p, dann t), folgen sie auf derselben Seite nacheinander, jedes mit Problem, Beispielrechnung mit Lernvideo, Ergebnis-Abgleich und Fehlersuche. Zwischenüberschriften mit `Abschnitt`.

## Seitenansicht (Pflicht)

Jede Lernsituation läuft in der Seitenansicht `SeitenLernsituation` aus `lineare_funktionen/lernsituation_kit/seiten.tsx` mit **`ruhig`** (ruhiges Grunddesign) und **`thema`** (Identität), eingebettet in `TaskShell` mit `kompakt`. Für Situation, Problem und Auftrag gibt es die Klassen `sl-text`, `sl-fokus` (mit `sl-fokus-titel`) und `sl-hinweis`. Lange Scrollseiten mit allen Phasen untereinander, Kachel-Übersichten und eigene Stepper werden nicht mehr gebaut.

- **Startbox:** Titelbild, Name der Lernsituation, Lernziel. Vor der ersten Seite bestätigen die SuS per Haken "Ich dokumentiere bei jeder Aufgabe alle Rechenschritte schriftlich in meinem Heft." Erst dann geht es los.
- **Genau eine Seite pro Phase.** Die Lernsituation hat vier Seiten (`art`: `start`, `problem`, `loesen`, `sichern`), jede mit kurzem Titel. Mehrere Aufgaben einer Phase stehen untereinander auf dieser Seite, gegliedert mit `Abschnitt`.
- **"Weiter" erst, wenn alles gelöst ist:** Die Seite nennt ihre Pflichtaufgaben in `pflicht: ['a', 'b', …]`, jede Aufgabe meldet sich mit `onSolved={fertig.teil('a')}` (bzw. `onFest`, `onAlle`). Erst wenn alle gemeldet sind, wird "Weiter" frei; im Seitenkopf steht automatisch "(2 von 3 Aufgaben gelöst)". Freiwillige Profi-Aufgaben stehen nicht in `pflicht`. Eine Seite mit nur einer Pflichtaufgabe kann weiter `fertig()` nutzen. Die Phasenleiste mit "Weiter" bleibt beim Scrollen oben stehen. Sobald alle Pflichtaufgaben einer Seite gelöst sind, erscheint **zusätzlich am Seitenende** ein breiter Knopf „Weiter zu <nächste Phase>“ (automatisch durch `SeitenLernsituation`, nicht auf der letzten Seite), damit die SuS nicht nach oben scrollen müssen.
- **Nach unten scrollen ist erlaubt, zur Seite nie:** Eine Seite darf länger als der Bildschirm sein; die SuS scrollen dann nach unten weiter. **Lesbarkeit geht vor Passform:** Skizzen und Graphen werden **nicht** gestaucht, damit alles auf einen Bildschirm passt. Richtwert auf dem Tablet: Skizzen und Graphen etwa 260–320 px hoch, Beschriftungen mindestens 14 px und höchstens etwa 20 px auf dem Bildschirm. Wünschenswert ist, dass Titel, Auftrag und der Anfang der Interaktion im ersten Bildschirm sichtbar sind. **Horizontales Scrollen ist verboten**, auf jeder Bildschirmbreite (Tablet, Monitor, Smartphone). Eine Phase wird nie auf mehrere Seiten verteilt; lange Phasen-Seiten sind in Ordnung. **Keine Zweispalter** (`ZweiSpalten` nicht mehr verwenden): Einspaltigkeit hat Vorrang.
- **Test:** Mit Playwright (`vite build` + `vite preview`) alle vier Seiten bei 1180×820, 1920×1080 und 390×844 (Smartphone) durchklicken (Cookie-Hinweis vorher schließen), jeweils vor und nach dem Lösen `document.documentElement.scrollWidth - innerWidth` messen (muss 0 sein, kein seitliches Scrollen) und auf `.katex-error` prüfen. In "Problem lösen" das aufgeklappte Rechenbeispiel (Knopf so breit wie der Fokus-Kasten), einen Fehlversuch (die Fehlersuche öffnet sich) und das richtige Ergebnis testen und prüfen, dass "Weiter" erst nach allen Pflichtaufgaben frei wird. Die Höhe darf überstehen; prüfe auf den Screenshots, dass Skizzen groß genug und Beschriftungen lesbar sind.
- Am Ende der Seite "Wissen prüfen und vertiefen" steht das Bonus-Spiel (Abschnitt "Bonus-Spiel zum Abschluss"), darunter die Buttons zurück zur Auswahl, zu den Übungsaufgaben und ggf. zur nächsten Lernsituation (keine eigene Abschlussseite).

## Auswahlseite des Themas (Pflicht)

Jede Lernsituation gehört zu einem Thema, für das es meist schon Übungsaufgaben gibt. Die **Startseite des Themas** (die Adresse, unter der das Thema in der Themenübersicht verlinkt ist) wird immer so umgebaut, dass die SuS dort wählen: **"Lernsituation"** oder **"Übungsaufgaben"**. Bestehende Übungsaufgaben bleiben vollständig erhalten und erreichbar; nichts wird entfernt.

Wähle das Muster, das zum Thema passt:

- **Variante A: eine Übungsseite mit Schwierigkeitsgraden** (z. B. `lineare_funktionen/Nullstellen.tsx`, `PunktGerade.tsx`, `Schnittpunkt.tsx`, `quadratische_funktionen/Scheitelpunkt.tsx`). Die Lernsituation wird ein eigener Modus der bestehenden Seite (`const [lernsituation, setLernsituation] = useState(false)`). In der Startansicht (noch kein Schwierigkeitsgrad gewählt) stehen nebeneinander zwei Felder: links **"Lernsituation"** mit der Karte, rechts **"Übungsaufgaben"** mit den vorhandenen Schwierigkeitsgraden. Die Lernsituation bekommt `erklaerung` (der Erklärteil der Seite, z. B. `<Intro />`), `onBack` (zurück zur Auswahl) und `onPractice` (direkt in den leichtesten Schwierigkeitsgrad).
- **Variante B: mehrere Lernsituationen oder mehrere Übungsseiten** (z. B. `quadratische_funktionen/FunktionsgleichungMenu.tsx`, `finanzmathe/ZinsrechnungMenu.tsx`). Unter der bisherigen Adresse entsteht eine eigene Auswahlseite `<Thema>Menu.tsx`: oben das Feld **"Lernsituation"** mit einer Karte pro Lernsituation, darunter das Feld **"Übungsaufgaben"** als Liste (`bk-topics`). Die bisherige Übungsseite zieht nach `<Adresse>/ueben`, die Lernsituationen bekommen eigene Adressen `<Adresse>/lernsituation-1`, `-2`, … Routen in `App.tsx` eintragen und alle Links prüfen, die direkt auf die alte Übungsseite zeigen (Suche, Themenübersicht, "Weiter üben"-Buttons), und bei Bedarf auf `/ueben` umstellen.
- Kommt zu einem Thema mit Variante A eine zweite Lernsituation dazu, wird auf Variante B umgestellt.

Für beide Varianten gilt:
- **Karte:** immer `LernsituationKarte` aus `lernsituation_kit/seiten.tsx` mit der Identität der Lernsituation (`thema={{ name, farbe, icon }}`, bei mehreren Lernsituationen `teil="Lernsituation 1 · …"`) und einer Beschreibung in ein bis zwei Sätzen, die die Situation und das Lernziel nennt. Die Karte hat so dieselbe Themenfarbe, dasselbe Symbol und denselben Namen wie die Lernsituation selbst.
- Die Überschriften heißen genau **"Lernsituation"** und **"Übungsaufgaben"** (nicht "Wähle deinen Schwierigkeitsgrad").
- Die Abschluss-Buttons der Lernsituation führen mit "Weiter üben" zu den Übungsaufgaben dieses Themas.
- Die Auswahlseite wird mitgetestet: kein seitliches Scrollen bei 1180 × 820 und 390 × 844, Karte öffnet die Lernsituation, "Übungsaufgaben" öffnen die bisherigen Aufgaben.

## Gamification: Punkte, Serien und Abzeichen (Pflicht)

Jede Lernsituation belohnt richtige Lösungen mit Punkten. Die Elemente sollen motivieren, aber nicht vom Lernen ablenken: Sie sind klein, stehen am Rand (Punkte in der Phasenleiste) und belohnen selbstständiges, sorgfältiges Arbeiten.

- **Einschalten:** `SeitenLernsituation` mit `punkte`. Alles Weitere erledigen die Bausteine selbst (`lernsituation_kit/punkte.tsx`): `CheckCard`, `McCard`, `Hilfen`, `SchrittHilfen`, `Vermutung` und `Kriterien` melden sich automatisch. Eigene Aufgaben-Bausteine nutzen `usePunkteAufgabe()` (`geloest`, `fehler`, `hilfe`, `loesung`).
- **Punkte nach Aufwand (Balancing, Pflicht):** Jede Aufgabe bekommt mit `punkte={…}` (an `CheckCard`, `McCard`, `TrackedCheck`, `TrackedMc`) einen Wert, der zu ihrem Aufwand passt. Eine kurze Abrufaufgabe darf nie so viel bringen wie die Kernaufgabe der Lernsituation. Richtwerte:

  | Aufgabe | Punkte |
  | --- | --- |
  | Abruf mit einem Schritt (einsetzen, ablesen, zusammenfassen, einfache Auswahl) | 2 |
  | kurze Aufgabe mit zwei Schritten (einfache Gleichung lösen, Zinsen für ein Jahr) | 3 |
  | Aufgabe mit drei oder mehr Schritten im Warm-up (Gerade aus zwei Punkten, Zinstage) | 4 |
  | Festlegung bzw. Ausprobieren in „Problem erkennen“ (`PUNKTE.festlegung`) | 3 |
  | Kernaufgabe in „Problem lösen“ (Ergebnis-Abgleich), je Teilproblem | 10 bis 15 |
  | Entscheidung in „Problem lösen“ (Auswahl nach der Rechnung) | 3 bis 4 |
  | alle Kriterien des Handlungsprodukts abgehakt (`PUNKTE.kriterien`) | 5 |
  | Übung Basis (Auswahl mit Fehloptionen) | 3 bis 4 |
  | Übung Standard („Wer hat recht?“, Rechenaufgabe) | 5 bis 6 |
  | Übung Erweiterung (umgekehrte oder offene Aufgabe) | 7 bis 8 |
  | Profi-Aufgabe (`profi`, zählt nicht zu den Sternen) | 8 bis 10 |

  Leitplanken für die ganze Lernsituation: "Problem lösen" bringt etwa 40 % der Punkte der Pflichtaufgaben, das Warm-up höchstens 20 %, "Wissen prüfen und vertiefen" etwa ein Drittel. Insgesamt kommen meist 60 bis 100 Punkte zusammen. Die Verteilung steht als Kommentar oben in der Datei und wird im Test nachgerechnet.
- **Punkteregeln** (Werte und Formeln in `PUNKTE`, `hilfeKosten`, `mindestPunkte`, `loesungKosten`):
  - richtig gelöste Aufgabe: ihre Punkte; jede angezeigte Hilfe und jeder Fehlversuch (höchstens 3 zählen) kostet **ein Fünftel** der Aufgabenpunkte, mindestens 1 (bei 12 Punkten −2, bei 3 Punkten −1). Eine selbst gelöste Aufgabe bringt **nie weniger als mit Lösungsweg**, also mindestens ein Drittel ihrer Punkte, mindestens 1 (`mindestPunkte`). Der Lösungsweg vor dem Lösen bleibt damit immer die teuerste Wahl.
  - **Was als Fehlversuch zählt:** Ein Feld wird nach der Tipp-Pause zwar rot, das allein ist aber noch kein Fehlversuch (wer kurz überlegt oder die Komma-Taste sucht, tippt weiter, z. B. „0“ → „0,5“). Gezählt wird erst, wenn ein falscher Wert beim Verlassen des Feldes stehen bleibt, ein rot markierter Wert ersetzt oder gelöscht wird, in einer Auswahlliste falsch gewählt oder bei einer Auswahlaufgabe falsch geprüft wird; jeder falsche Wert zählt nur einmal. `useLiveCheck` meldet das über `onFehlversuch`, `CheckCard` gibt es an `onFehler` weiter (Fehlersuche öffnen, „Lösungsweg zeigen“ freischalten).
  - Lösungsweg **vor** dem Lösen angesehen: Abzug von **zwei Dritteln** der Punkte, die diese Aufgabe höchstens bringt (gerundet, `PUNKTE.loesungAnteil`, `loesungKosten`): bei 12 Punkten −8, die Aufgabe bringt also noch 4 Punkte. Hilfen und Fehlversuche werden dann nicht zusätzlich abgezogen. Nach dem Lösen ist das Ansehen kostenlos.
  - Die Fehlersuche (`ohnePunkte`) bringt und kostet nichts
  - Festlegung (`Vermutung`, eigenes Ausprobieren mit `usePunkteAufgabe({ wert: PUNKTE.festlegung, serie: false })`): 3 Punkte; abgehakte Kriterien des Handlungsprodukts: 5 Punkte
  - Rechenbeispiel und Lernvideo sind kostenlos, sie gehören zum Lernen
  - Die Kosten stehen sichtbar an den Knöpfen („Hilfe 1 anzeigen (−2 Punkte)“, „Lösungsweg zeigen (−8 Punkte)“), automatisch aus den Aufgabenpunkten berechnet, damit die SuS bewusst entscheiden. Hilfe bleibt immer erreichbar.
- **Weitere Elemente:**
  - **Punktestand** in der Phasenleiste mit kurzen Meldungen (+10, Abzug), die nach gut 2 Sekunden verschwinden
  - **Serien-Bonus:** 3 Aufgaben am Stück ohne Hilfe und ohne Fehler bringen +3
  - **Spielregeln in der Startbox** (`PunkteRegeln`, automatisch)
  - **Bilanz** am Ende der letzten Seite (`<Bilanz />` unter dem Bonus-Spiel, über den Abschluss-Buttons): Punkte, 0 bis 3 Sterne mit Rang (Einsteiger, Bronze, Silber, Gold; nur aus den Aufgabenpunkten der Pflichtaufgaben), persönlicher Rekord (localStorage, mit try/catch) und vier Abzeichen: „Ganz allein“ (alle Pflichtaufgaben ohne Hilfe und Lösungsweg), „Serienstar“ (5 am Stück), „Profi“ (Profi-Aufgabe gelöst), „Spielchampion“ (im Bonus-Spiel fast alle Münzen)
  - **Bonus-Spiel:** Münzen bringen je 2 Punkte, nur das beste Ergebnis zählt (`useSpielPunkte`); das Spiel ist ein Bonus und bringt höchstens so viel wie die beste Übungsaufgabe (Rundenzahl entsprechend wählen, z. B. 4 Runden à 2 = 8 Punkte)
- **Profi-Aufgaben** bekommen `profi` (zählen nicht zum Maximum der Sterne, aber zum Abzeichen „Profi“).
- **Keine Ablenkung:** keine Ranglisten mit Namen, kein Vergleich mit Mitschülern, keine Zeitwertung, keine Animationen außer den kurzen Meldungen; bei `prefers-reduced-motion` ohne Animation. Punkte verschwinden nie wegen langsamen Arbeitens.

## Bonus-Spiel zum Abschluss (Pflicht)

Ganz am Ende jeder Lernsituation wird ein kleines **mathematisches Spiel** freigeschaltet, das zum Thema passt. Es soll motivieren und Spaß machen und dabei das gerade Gelernte noch einmal kurz prüfen. Welches Spiel es wird, entscheidest du frei; es muss zum Inhalt passen und mit vertretbarem Aufwand einzubauen sein.

- **Ort und Freischaltung:** auf der Seite "Wissen prüfen und vertiefen" unter den Übungsaufgaben, über den Abschluss-Buttons, mit `BonusSpiel` aus `lernsituation_kit/seiten.tsx` (`frei`, `titel`). Gesperrt steht dort nur ein kurzer Hinweis; frei wird es, sobald alle Pflicht-Übungen gelöst sind (freiwillige Profi-Aufgaben zählen nicht). Dafür die `onSolved`-Meldungen der Übungen zusätzlich im Seitenzustand mitzählen. Im Einleitungssatz der Seite steht, dass ein Spiel wartet.
- **Mathematik trägt das Spiel:** Jede Spielaktion ist eine kurze Aufgabe zum Thema (rechnen, ablesen, einsetzen, schätzen). Falsche Ziele bzw. Antworten bilden typische Fehler ab und bekommen nach der Runde eine kurze Erklärung. Kein reines Geschicklichkeitsspiel.
- **Umfang:** 3 bis 5 Runden mit neuen Zufallszahlen (ca. 3 bis 5 Minuten), Punkte oder Münzen sichtbar, am Ende Ergebnis mit Lob und "Nochmal spielen". Keine Zeitnot: Tempo so langsam, dass mit Taschenrechner gerechnet werden kann, dazu ein Knopf zum Beschleunigen.
- **Bedienung:** Tablet zuerst: Tippen auf Ziele bzw. Knöpfe mit mindestens 44 px, zusätzlich Pfeiltasten; kein seitliches Scrollen. Die Spielfläche ist ein Inline-SVG (oder Canvas) mit `role="img"`/`aria-label`, Animation mit `requestAnimationFrame`. Keine externen Bibliotheken, keine echten Markenfiguren oder Logos (Spielidee ja, Original-Grafiken nein).
- **Gestaltung:** Spielfläche in Themenfarbe (`--primary`, `--primary-soft`), Münzen in `--highlight`, richtig/falsch mit `--correct`/`--wrong`. Das Leitobjekt der Lernsituation darf die Spielfigur sein (z. B. der Vereinsbus). Das Spiel darf etwas verspielter sein als der Rest der Seite, bleibt aber in einer Spalte.
- **Bestehende Spiele:** `quadratische_funktionen/MarioSpiel.tsx` (Funktionsgleichung eingeben, die Figur springt den Bogen entlang und sammelt Münzen), `finanzmathe/rentenrechnung_einstieg/BusRallye.tsx` (Vereinsbus auf die Spur mit dem richtigen Endwert lenken).
- **Ideen nach Thema** (frei wählbar, abwechseln):
  - Funktionen: Sprung- oder Flugbahn durch Münzen bzw. Ringe (Gleichung eingeben), Kanone zielt auf ein Ziel (Parameter einstellen), Punkte auf der Geraden einsammeln, Snake auf dem Koordinatengitter (nur Felder auf der Geraden fressen)
  - Gleichungen und Terme: Pac-Man-Labyrinth (in den Gang mit der richtigen Lösung abbiegen), Ballons platzen lassen (richtige Lösung treffen), Tetris-artiges Zuordnen von Term und Ergebnis
  - Finanzmathematik und Prozente: Spur-Rallye (auf das Schild mit dem richtigen Betrag fahren), Münzregen (richtige Beträge im Korb fangen), Börsen- oder Sparschwein-Rennen, Preisschild-Schätzduell
  - Daten und Zufall: Glücksrad oder Würfelduell mit Wahrscheinlichkeiten, Balken ins richtige Fach sortieren
  - Geometrie und Trigonometrie: Laser oder Billard über Winkel ins Ziel lenken, Leiter- oder Rampenbau mit der richtigen Länge
- In der Phasenleiste zählt das Spiel nicht als Pflicht; die Lernsituation ist auch ohne Spielen abgeschlossen.

## Schreib- und Rechenkonventionen (Pflicht)

- **KaTeX für alles Mathematische**, auch im Fließtext, in Titeln, Hilfen und Rückmeldungen: Punkte `S(2 \mid 3)`, Variablen `a`, Gleichungen, Zahlen mit Rechenzeichen. Keine Formeln als Klartext ("x²", "(2|3)", "x_S"). Dezimalkomma als `0{,}25`, echtes Minus.
- **Funktionsschreibweise:** Funktionsgleichungen immer mit `y = …`, nicht `f(x) = …`. Bei mehreren Funktionen steht der Name im Text davor ("Gerade 1: y = …", "Sprungbahn: y = …"). Funktionswerte als "x einsetzen": "x = 4: y = −0,25 · 4² + 4 + 2 = 2" statt f(4). In Feldern "y =", in Tabellenköpfen "y". Gleichsetzen heißt "die Terme gleichsetzen".
- **Scheitelform** als `y = a(x − x_S)² + y_S` (nicht mit d und e).
- **Rechnen im Heft:** Alles, was gerechnet wird, rechnen die SuS von Hand im Heft, das Tablet dient zur Kontrolle. Das bestätigen sie **einmal** in der Startbox. Deshalb steht an den einzelnen Aufgaben **kein** Heft-Hinweis ("Im Heft: Rechenweg und Ergebnis aufschreiben …"): `SeitenLernsituation` blendet ihn über `HeftBestaetigtCtx` automatisch aus. Schreibe auch keine eigenen Sätze wie "Halte deinen Rechenweg schriftlich fest" oder "Rechne im Heft" in die Aufgaben.
- **Lücken direkt in der Gleichung:** Werte, die die SuS in eine Gleichung einsetzen oder ergänzen, tragen sie im Kästchen **in der Gleichung** ein, nicht in einem Feld daneben oder darunter (kein `\square` mit Feld daneben). Dafür `CheckCard` mit `rechnung`: Zeilen `{ l: [...], r: [...], u?: '\\mid -3' }` aus TeX-Stücken und Lücken `{ luecke: 'feldKey' }`.
- **Eine Zeile pro Zwischenergebnis:** Bei mehrschrittigen Rechnungen bekommt jedes wichtige Zwischenergebnis eine eigene Zeile, damit die SuS die Struktur sehen. Beispiel: Vor der Scheitelform steht `a = [ ]` ("Formfaktor a"), damit klar ist, dass zuerst a berechnet wird. Die Zeilen sind am rechten Rand kurz benannt (① S einsetzen, ② P einsetzen, Formfaktor a, ③ Scheitelform, ④ allg. Form), Umformungen als `| −3  | :4`.
- **Automatische Prüfung ohne Prüfen-Button:** Eingabefelder prüfen sich selbst. Ein richtiges Ergebnis wird sofort grün, ein falsches nach einer kurzen Tipp-Pause (ca. 1,2 s) oder beim Verlassen des Feldes rot. Es gibt keinen Button "Prüfen". `CheckCard` macht das automatisch; eigene Eingabe-Bausteine (z. B. Tabellen) nutzen dafür `useLiveCheck` aus `lernsituation_kit/kit.tsx`. Sobald alle Felder grün sind, kommen Lob und `onSolved`. Nur Auswahlaufgaben (`McCard`) behalten den Prüfen-Button, weil dort nichts ausgefüllt wird.
- **Gleiche Darstellung wie in den Übungsaufgaben:** Werden Ergebnisse geprüft, die in den Übungsaufgaben des Themas eine feste Form haben, sehen die Felder genauso aus, z. B. der Tilgungsplan als Tabelle (Jahr, Schuld am Jahresanfang, Tilgung, Zinsen, Annuität, Summenzeile) statt einer Liste einzelner Felder.
- **Live-Rückmeldung bei Graphen:** Geben SuS eine Gleichung oder einen Wert ein, wird das Ergebnis beim Absenden sofort in die Skizze gezeichnet (frühere Versuche blass, aktueller kräftig in Themenfarbe, Treffer grün). Das gilt auch für den Ergebnis-Abgleich in "Problem lösen": Tippen die SuS dort eine Funktionsgleichung ein, wird ihre Gerade bzw. Parabel schon beim Tippen in die Skizze über der Aufgabe gezeichnet (`CheckCard` mit `onEingabe`, Vorlage `lineare_funktionen/funktionsgleichung_einstieg/ScooterEinstieg.tsx`).

## Didaktische Leitlinien

Jede Lernsituation folgt diesen Prinzipien aus der Unterrichtsforschung. Sie gelten unabhängig vom Format.

1. **Kognitive Aktivierung** (Klieme, Kunter; COACTIV): Eine offene Leitfrage, ein Rätsel, ein Widerspruch oder eine Entscheidung steht am Anfang. Sie lässt sich ohne die neue Mathematik nicht sicher beantworten.
2. **Problem vor Beispiel** (Productive Failure, Kapur; Renkl): Die SuS erleben in "Problem erkennen" selbst, dass ihr Vorwissen nicht reicht. In "Problem lösen" wird das Problem zuerst konkret dargestellt, danach folgt ein passendes ausgearbeitetes Lösungsbeispiel, dann rechnen sie selbst. Diese Reihenfolge gilt immer; ein Beispiel vor dem Problem ist nicht erlaubt.
3. **Festlegung vor dem Rechnen:** Die SuS legen sich auf eine Vermutung fest oder probieren aus. Das wird am Ende von "Problem lösen" wieder aufgegriffen ("Du hattest probiert: …").
4. **Vorwissen aktivieren** (Retrieval Practice): im Warm-up, gezielt auf die Schritte, die in "Problem lösen" gebraucht werden.
5. **Darstellungswechsel** (Duval, vom Hofe): Mindestens zwei, besser drei Darstellungen werden verknüpft, z. B. Situation, Tabelle, Graph, Term.
6. **Kognitive Belastung steuern** (Sweller): kurze Texte, einfache Sprache, kleine Schritte, Unterstützung zum Aufklappen statt immer sichtbar, kein "Klimbim" vor dem eigentlichen Problem. Wiederkehrende Bedienelemente sehen immer gleich aus.
7. **Kognitiver Konflikt:** Jede Lernsituation enthält genau einen Aha- oder Widerspruchsmoment, z. B. ein Ergebnis, das der Intuition widerspricht, oder das Scheitern beim Raten.
8. **Generatives Lernen** (Fiorella & Mayer): Die SuS erzeugen selbst etwas, das Handlungsprodukt: einen strukturierten Rechenweg, einen Brief, eine Skizze, einen Spickzettel.
9. **Formative Diagnose** (Black & Wiliam): Eine Übungsaufgabe in Phase 4 nutzt Antwortoptionen, die typische Fehlvorstellungen sichtbar machen.
10. **Klare Sicherung:** Die Kernerkenntnis wird ausdrücklich festgehalten.

## Pflichtfunktionen

Jede Lernsituation erfüllt diese Funktionen innerhalb der vier Phasen. **Methode und Gestaltung sind frei.**

| Funktion | Phase | Beispiele für Methoden (abwechseln!) |
| --- | --- | --- |
| Vorwissen abrufen | Warm-up | mindestens 5 kurze Abrufaufgaben, Ablesen, einfache Umformung |
| Einstieg mit Spannung | Problem erkennen | Kundenauftrag, Entscheidungsfrage, Rätsel, Widerspruch, Schätzfrage, Chatnachricht |
| Festlegung / Ausprobieren | Problem erkennen | interaktives Ausprobieren mit Rückmeldung (bevorzugt), Auswahl, Schieberegler, Schätzduell, Rangfolge |
| Eigene Denkarbeit | Problem lösen | im Heft rechnen und Ergebnisse abgleichen (Beispielrechnung und Lernvideo zum Aufklappen, Fehlersuche), Experiment mit Schieberegler, Fallvergleich, Code knacken |
| Handlungsprodukt | Problem lösen | strukturierter Rechenweg im Heft, Kundenbrief, Skizze, Spickzettel (überwiegend analog) |
| Sicherung | Problem lösen | Rückbezug zur Festlegung, Merke ("Das hältst du fest") |
| Üben und Prüfen | Wissen prüfen und vertiefen | 3 bis 4 Übungsaufgaben: Auswahl mit Fehloptionen, "Wer hat recht?", Rechenaufgabe, umgekehrte oder offene Aufgabe |

Richtwerte für die Dauer:
- **Kurz (15–25 min):** mindestens 5 kurze Warm-up-Aufgaben, Problem erkennen, Problem lösen mit knapper Sicherung, drei kurze Übungsaufgaben.
- **45 min:** alle Funktionen, Problem lösen etwa 15–20 min, drei bis vier Übungsaufgaben.
- **90 min:** alle Funktionen, ggf. ein vorab neu zu lernendes Verfahren als eigener Abschnitt in "Problem lösen", aufwendigeres Handlungsprodukt, vier Übungsaufgaben.

## Formatkatalog (Dramaturgien)

Das Format bestimmt die Geschichte innerhalb der vier Phasen. Wähle nach Inhalt und Abwechslung. Kombinationen sind erlaubt.

| Format | Ablauf in Kürze | Passt besonders zu |
| --- | --- | --- |
| **Entscheidungsfall** | Optionen vergleichen, mit Mathematik entscheiden, Entscheidung begründen | Funktionen, Schnittpunkte, Kostenvergleiche, Prozente |
| **Kundenauftrag / Maschine** | Ein Gerät oder Kunde braucht ein exaktes Ergebnis; Ausprobieren scheitert, Rechnen klappt | Funktionsgleichungen, Kalkulation, Verfahren |
| **Rätsel / Escape-Room** | Teilerkenntnisse liefern Codes, die nächste Seiten freischalten; Story-Rahmen | Verfahren mit mehreren Schritten, Gleichungen, Terme |
| **Kontrastierende Fälle** (Schwartz & Bransford) | 2–3 fast gleiche Situationen vergleichen: Was macht den Unterschied? Danach Begriff klären | Begriffsbildung, z. B. proportional vs. linear, Zins vs. Zinseszins |
| **Fehlerdetektiv / Wer hat recht?** | Zwei fiktive Mitschüler lösen unterschiedlich; Fehler finden, begründen, korrigieren (in den Übungsaufgaben, nach dem Erarbeiten) | Verfahren mit typischen Fehlern |
| **Experimentierlabor** | Hypothese aufstellen, mit Schieberegler oder Simulation testen, Regel formulieren | Parameter in Funktionen, Wachstum, Wahrscheinlichkeit, Nullstellen |
| **Schätzen & Fermi** | grob schätzen, Annahmen offenlegen, mit neuem Werkzeug präzisieren | Größen, Prozente, Potenzen, Statistik |
| **Rollenspiel / Beratungsauftrag** | SuS sind Azubis, Berater o. Ä. und erstellen für eine Person ein Angebot oder eine Empfehlung | kaufmännisches Rechnen, Kalkulation, Finanzmathematik |
| **Gruppenpuzzle** (Aronson) | Expertengruppen erarbeiten je einen Aspekt, Stammgruppe setzt zusammen | 90 min, Themen mit mehreren Teilaspekten |

## Handlungsprodukte

Das Handlungsprodukt entsteht in **"Problem lösen"**: Direkt nach dem Problem und dem Rechenbeispiel werden die SuS **immer** aufgefordert, es zu erstellen. Es ist **überwiegend analog** (im Heft oder auf Papier).

- **Oft genügt der strukturierte Rechenweg:** sauber gegliedert im Heft, z. B. mit Überschrift, gegeben/gesucht, Rechnung, Antwortsatz.
- **Wo sich etwas Besseres anbietet, nimm es,** damit es nicht langweilig wird. Das Produkt muss zum Inhalt passen:
  - **Entscheidung oder Beratung** → Kundenbrief, Entscheidungsempfehlung mit Rechnung (Beispiel: Antwort an Lena)
  - **Verfahren** → Spickzettel (eine Karteikarte), Schritt-für-Schritt-Anleitung mit eigenem Beispiel
  - **Begriff oder Zusammenhang** → Concept Map, Skizze mit Beschriftung
  - **Mehrere Darstellungen** → Hefteintrag mit Situation, Tabelle, Graph und Term
  - **Geschichte** → Comic-Strip in drei Bildern, Plakat
- **Digital nur ausnahmsweise,** wenn es deutlich besser passt (z. B. eine eigene Aufgabe mit Prüffunktion erstellen und tauschen).
- Jedes Handlungsprodukt hat einen klaren Auftrag und **2 bis 4 Kriterien**, die die SuS auf derselben Seite abhaken (`Kriterien`, Pflichtaufgabe). Satzanfänge oder ein Gerüst gibt es zum Aufklappen.
- **Begriffe und Abkürzungen (Pflicht-Kriterium):** Zusätzlich zu den inhaltlichen Kriterien steht in jeder Kriterienliste ein Punkt, der die SuS auffordert, unbekannte Begriffe zu erklären und aufzuschreiben, wofür jede Abkürzung der Formel steht. Die Abkürzungen und Begriffe werden im Kriterium ausdrücklich genannt (z. B. Rentenrechnung: „Unter deinem Aushang steht, was K_n, r, q und n bedeuten (r ist die Rate, auch Rente genannt) und was vorschüssig und nachschüssig heißt“).
- Über mehrere Lernsituationen hinweg wechselt die **Art** des Produkts (Rechenweg, Brief, Spickzettel, Concept Map, Skizze …).

## Ruhiges Grunddesign

Alle Lernsituationen nutzen **dasselbe ruhige Gerüst**. Es gibt keine kontextabhängigen Looks mehr, die das Layout umbauen (kein Messenger-, Kassenbon-, Dashboard-, Werkstatt- oder Zeitungs-Look). Unterscheidbar werden die Lernsituationen über ihre **Identität** (nächster Abschnitt), nicht über Rahmen, Kästen oder Zusatzfarben.

**Layout**
- **Immer einspaltig**, auch auf breiten Monitoren: Inhalt mittig mit `max-width` von etwa 760 px; Skizzen und Graphen dürfen etwas breiter sein (bis etwa 900 px).
- Optimiert für **Tablet im Querformat**. Skizzen stehen **unter** dem zugehörigen Text, nie daneben, und sind groß genug, dass man alles gut lesen kann (siehe "Seitenansicht"). Nach unten scrollen ist in Ordnung.
- **Kein horizontales Scrollen**, auf keiner Bildschirmbreite. Breite Inhalte (Rechnungen, Tabellen, Skizzen) passen sich an oder brechen um.

**Fokus und Hierarchie**
- Pro Seite gibt es **genau einen Fokus**: das Problem bzw. den Auftrag. Nur dieses Element wird hervorgehoben (dezente Hintergrundfläche **oder** ein einzelner Rahmen).
- Hierarchie entsteht über **Typografie und Weißraum**, nicht über Rahmen und Farben.
- **Keine verschachtelten Kästen** (Kasten im Kasten). Höchstens eine gerahmte Fläche pro Seite, dazu die Skizze.
- **Keine dekorativen Farbstreifen** am Rand, keine farbigen Banner, keine Icons ohne Funktion.

**Farben**
- Neutraler Grundton plus **eine Akzentfarbe**: die **Themenfarbe** der Lernsituation, für Buttons, Phasenleiste, Kennung und den Fokus-Bereich.
- Grün und Rot nur für Feedback richtig/falsch (Tokens `--correct`, `--wrong`).
- Keine unterschiedlichen Farben pro Phase innerhalb der Seite.

**Fester Kern (immer gleich):** Seitenansicht mit Phasenleiste und "Weiter", Aufklapp-Knöpfe (Beispielrechnung mit Lernvideo und Fehlersuche in voller Breite), Eingabefelder, Feedbackfarben grün/rot, Hilfen, Niveaustufen-Kennzeichnung, Sozialform-Markierung. Sozialform und Zeit sind unauffällige Textlabels, keine bunten Badges.

**Touch-Bedienung:** Buttons und Eingabefelder mindestens 44 × 44 px, ausreichender Abstand zwischen Tippzielen, Fließtext mindestens 17 px.

Keine Animationen oder Effekte ohne Funktion.

## Identität jeder Lernsituation (Pflicht)

Jede Lernsituation bekommt ein eigenes Gesicht, damit sie sich von den anderen unterscheidet und die SuS jederzeit wissen, wo sie sind. Die Identität entsteht aus vier Merkmalen, die alle aus dem Kontext abgeleitet werden. Umsetzung: Prop `thema` an `SeitenLernsituation` (`{ name, farbe, icon, bild }`, Typ `Thema` aus `seiten.tsx`).

1. **Themenfarbe** aus der Palette `THEMEN` in `seiten.tsx`: blau, petrol, violett, beere, ocker, schiefer, indigo, kupfer. Alle sind mit weißer Schrift kontraststark; Grün und Rot gibt es bewusst nicht, weil sie für richtig/falsch reserviert sind. Die Farbe passt zum Kontext (z. B. Kupfer für Metallbau, Indigo für Nacht und Energie, Petrol für Wasser oder Umwelt, Beere für Freizeit) und ersetzt innerhalb der Lernsituation die Standardfarbe Blau. Keine neuen Farben ohne Kontrastprüfung (weiße Schrift mindestens 4,5 : 1).
2. **Kennung:** ein passendes Font-Awesome-Symbol (`icon`, z. B. `fa-archway`, `fa-battery-half`, `fa-helicopter`, `fa-piggy-bank`) und ein kurzer Name (2–3 Wörter, z. B. "Der Torbogen"). Beides steht als Kennung links in der Phasenleiste auf **jeder** Seite (auf schmaleren Bildschirmen nur das Symbol), als Überschrift der Startbox und auf der Karte der Auswahlseite.
3. **Titelbild:** ein eigenes, flaches SVG-Sachbild der Situation (`bild`) oben in der Startbox, etwa 720 × 250. Es zeigt die Szene mit den wichtigsten Größen (z. B. Hofeinfahrt mit Torbogen und den Maßen 2 m, 3 m, 4 m). Flächen in Themenfarbe und Themenfarbe-hell, Linien in `--ink`, keine Fotos, keine Verläufe, keine Figuren mit Gesichtern.
4. **Leitobjekt:** ein Gegenstand, eine Person oder ein Gerät aus der Situation, das durch alle Phasen trägt und benannt wird (z. B. die Biegemaschine: in Phase 2 wird ausprobiert, in Phase 3 "die Gleichung für die Biegemaschine", in Phase 4 der Rückbezug). Es taucht in Seitentiteln, Rückmeldungen und im Rückbezug auf.

Die Identität bleibt im ruhigen Rahmen: keine zusätzlichen Kästen, Banner oder Farbstreifen, keine zweite Akzentfarbe, keine Animationen. Die Skizzen in den Aufgaben verwenden für das Wichtigste (Bogen, Graph, aktueller Versuch) die Themenfarbe.

## Bilder in Problem erkennen und Problem lösen (Pflicht)

Die Seiten "Problem erkennen" und "Problem lösen" bestehen nie nur aus Text. Jede der beiden Seiten hat **mindestens ein Bild**, das die Situation anschaulich macht und die Seite optisch aufwertet. Es zeigt etwas Inhaltliches, nicht bloß Dekoration.

- **Funktionen (lineare, quadratische):** Funktionsgraph oder Skizze der Situation mit den gegebenen Größen (z. B. Torbogen, Ladestand des Stromspeichers), bei Ausprobieren mit Live-Rückmeldung.
- **Finanzmathematik, Prozente, kaufmännisches Rechnen:** ein hübsches Sachbild, z. B. die Angebote als Sparschwein und Tresor, eine Zeitleiste der Zinstage, eine Pinnwand mit den Fragen ("K = ?", "p = ?", "t = ?"), ein Zielbalken, zwei Sparkonten, die Formel mit farbig markierter gesuchter Größe.
- **Beim Handlungsprodukt** ein kleines Bild, das zeigt, was entstehen soll (Brief mit Umschlag, Karteikarte, Plakat, Concept Map).
- **Gestaltung:** flache Inline-SVGs im Stil des Titelbilds: Flächen in Themenfarbe und Themenfarbe-hell (`var(--primary)`, `var(--primary-soft)`), Linien in `var(--ink)`, Münzen und Akzente in `var(--highlight)`, keine Fotos, keine Verläufe, keine Figuren mit Gesichtern. Einbinden in der Klasse `zk-bild` (Rahmen, 300 px hoch) bzw. `zk-bild-klein` (bis 190 px) oder `bk-graph` bei Graphen. Beschriftungen im SVG mindestens 15 px, damit sie auf dem Tablet lesbar bleiben. Immer mit `role="img"` und einer `aria-label`, die den Inhalt beschreibt.
- **Nicht zu viel verraten:** Das Bild zeigt nur das Gegebene. Es nimmt die Lösung nicht vorweg (keine Zinsen, keine Nullstelle, kein Ergebnis im Bild, bevor die SuS gerechnet haben).
- Auch Warm-up und "Wissen prüfen und vertiefen" dürfen Bilder haben, wo sie helfen. Pflicht sind sie dort nicht.
- Beispiele: `AngeboteBild` und `BriefBild` in `finanzmathe/zinsrechnung_einstieg/AutogeldEinstieg.tsx`, `PinnwandBild` und `FormelBild` in `KasseEinstieg.tsx`, `ZweiKonten` und `WachstumGraph` in `finanzmathe/zinseszins_lernsituation/`.

## Auswahlaufgaben (Multiple Choice)

- **Antwortmöglichkeit A ist nie richtig.** Die richtige Antwort ist immer B, C oder D (bei weniger Optionen eine der hinteren). `McCard` warnt in der Entwicklung, wenn die erste Option richtig ist.
- Verteile die richtige Antwort über die Aufgaben einer Lernsituation auf B, C und D, damit kein Muster entsteht.
- Werden Optionen gemischt, bleibt die erste Option immer eine Fehloption.
- Gilt für alle Auswahlen: `McCard`, Auswahllisten, "Wer hat recht?", Festlegungen mit einer richtigen Antwort. Ausnahme: Auswahllisten mit natürlicher Reihenfolge (z. B. "Schritt 1, 2, 3") bleiben in dieser Reihenfolge.
- Die Fehloptionen bilden typische Fehlvorstellungen ab.

## Abwechslung absichern

- Im Repo liegt `lernsituationen-log.md` mit einer Tabelle: Datum, Thema, Seite, Format, Lernprodukt (Handlungsprodukt), Optik/Layout, Kontextbereich, Sozialformen. In der Spalte Optik/Layout steht seit dem ruhigen Grunddesign die **Identität**: Themenfarbe, Symbol, Leitobjekt (z. B. "Kupfer, fa-archway, Biegemaschine").
- **Regel:** Gegenüber den letzten drei Lernsituationen unterscheidet sich eine neue Lernsituation **mindestens in Format, Art des Handlungsprodukts und Themenfarbe**, möglichst auch im Kontextbereich. Symbol, Titelbild und Leitobjekt sind immer neu. Die vier Phasen-Seiten, die Seitenansicht und das ruhige Gerüst sind immer gleich und zählen nicht als Wiederholung.
- Handlungsprodukte sind **überwiegend analog**; ihre Art wechselt.
- Wünscht die Lehrkraft ausdrücklich eine Wiederholung, ist das erlaubt. Weise dann kurz auf die Wiederholung hin.

## Alltagskontexte

Die Kontexte sind bunt gemischt aus drei Bereichen:
- **Privatleben Jugendlicher:** Handy, Führerschein, Nebenjob, Freizeit, Streaming, Reisen
- **Ausbildung und Betrieb:** Kalkulation, Einkauf, Lager, Ausbildungsvergütung, Kundenangebote, Handwerk
- **Gesellschaft und Umwelt:** Energie, Mobilität, Konsum, Klima

Anforderungen an einen guten Kontext:
- **Echte Entscheidung oder echtes Problem**, keine eingekleidete Rechenaufgabe. Schlecht: "Bauer Max hat 3 Kühe …". Gut: "Welche Fahrschule lohnt sich für dich?"
- **Die Mathematik trägt die Antwort.** Ohne das neue Werkzeug bleibt die Leitfrage offen oder unsicher.
- **Realistische, aktuelle Zahlen.** Preise und Werte nach Möglichkeit per Websuche prüfen und runden, damit die Rechnung handhabbar bleibt.
- **Keine echten Markennamen** und keine Inhalte, die einzelne SuS bloßstellen könnten, z. B. persönliche Schulden oder Familieneinkommen.
- **Abwechslung:** Nicht zweimal hintereinander derselbe Bereich (siehe Log).

## Schüleraktivität

- Die SuS handeln, entscheiden, probieren aus und rechnen. Lesen und Zuhören sind nie die Haupttätigkeit.
- **Digitale Eingaben mit Feedback** auf jeder Aufgabenseite; sie schalten die nächste Seite frei.
- **Sozialformen** (Einzelarbeit, Partnerarbeit, Gruppenarbeit) sind sichtbar markiert. Die Seite funktioniert vollständig selbstständig, ohne Lehrkraft-Stopps.

## Differenzierung

- **Unterstützung nach Bedarf in "Problem lösen"**: Beispielrechnung mit Lernvideo, gestufte Hilfen, die Fehlersuche mit Zwischenergebnissen und die Satzanfänge sind aufklappbar. Alle rechnen selbst im Heft; wer Hilfe braucht, holt sie sich gezielt.
- **Hilfen je nach Weg:**
  - **Lückenrechnungen** (z. B. in Übungsaufgaben mit mehreren Zeilen): `SchrittHilfen` aus `lernsituation_kit/kit.tsx`. Bei der Rechnung steht "Hilfe zu: ① ② ③ …". Die SuS wählen den Schritt, bei dem sie hängen; es ist immer nur eine Hilfe offen. Jede Hilfe ist eine **konkrete Anleitung** für genau diesen Schritt, kein allgemeiner Denkanstoß. Die Kurzbezeichnungen entsprechen den Zeilennamen der Rechnung.
  - **Ergebnis-Abgleich in "Problem lösen" und andere Denkaufgaben** (Auswählen, Begründen, Erkunden): drei gestufte Hilfen mit `Hilfen` (1 Denkanstoß, 2 Strategie, 3 erster Schritt bzw. Teillösung).
- **Lösungsweg erst nach einem Fehlversuch:** In "Problem lösen" bekommen die `CheckCard`s `loesungNachFehler`. Der Knopf "Lösungsweg zeigen" erscheint erst nach einem Fehlversuch (falscher Wert beim Verlassen des Feldes oder ersetzt, siehe "Gamification").
- **Niveaustufen** Basis, Standard und Erweiterung bei den Übungsaufgaben in Phase 4, sichtbar gekennzeichnet. Die Erweiterung enthält eine offene oder umgekehrte Aufgabe oder eine Begründung.

## Digitale Umsetzung

- **Konventionen von `mathe-aufgaben` gelten:** KaTeX, Merkhilfe der Wirtschaftsschule Bayern für Formeln und Abkürzungen, nachvollziehbare Rechenwege, Eingabefelder mit grün/rot und Lob. In Lernsituationen prüft sich jedes Feld selbst (richtig sofort grün, falsch nach kurzer Pause rot), ohne Button "Prüfen".
- **Bausteine aus `mathe-trainer/src/pages/lineare_funktionen/lernsituation_kit/`:**
  - `seiten.tsx`: `SeitenLernsituation` (Startbox, Seiten, Phasenleiste, "Weiter", Optionen `ruhig` und `thema`), Typ `Seite = { art, titel, frei?, bedingung?, pflicht?, inhalt: (fertig) => … }` mit `fertig()` bzw. `fertig.teil('schluessel')`, `Abschnitt` (Zwischenüberschrift), `Aufklappbar` (Satzanfänge; `breit` für volle Breite), `BeispielMitVideo` (Beispielrechnung mit Lernvideo), `Fehlersuche` (öffnet sich nach einem Fehler), `Handlungsprodukt` (Auftrag), `BonusSpiel`; `WegWahl` nur noch in älteren Lernsituationen, `LernsituationKarte` (Karte für die Auswahlseite), `THEMEN`, Typ `Thema`
  - `kit.tsx`: `CheckCard` (mit `rechnung`, `fields`, `solution`, `help`, `onSolved`, `loesungNachFehler`, `onFehler`, `onEingabe`, `ohnePunkte`, `profi`, `punkte`), `McCard` (`onSolved`), `TrackedCheck`/`TrackedMc` (für Bereiche mit Nachverfolgung), `SchrittHilfen`, `Hilfen` (`HeftHinweis` wird in der Seitenansicht nicht angezeigt)
  - `phasen.tsx`: `PHASEN` (Namen und Reihenfolge der vier Phasen)
  - `Beispiel` aus `daten_und_zufall/lernpfad/kit.tsx` für Rechenbeispiele (`offen` zeigt alle Schritte, `ab` setzt die Schrittnummerierung fort)
  - `TaskShell` mit `kompakt`
- **Am bestehenden Code orientieren:** Sieh dir vor dem Bauen die Referenz-Umsetzungen an und übernimm Navigation, Grundstyles, Identität (`Titelbild`, `THEMA`) und Komponenten für den festen Kern. Bestehende Styles, die dem ruhigen Grunddesign widersprechen (Farbstreifen, verschachtelte Rahmen, Banner, `ZweiSpalten`, eigene Look-CSS wie `teamchat.css`), werden **nicht** übernommen. Führe keine neuen Frameworks oder Bibliotheken ein, ohne zu fragen.
- **Festlegung merken:** Vermutungen und Versuche bleiben im Seitenzustand und werden am Ende von "Problem lösen" ("Das hältst du fest") wieder angezeigt. Kein Login. Wenn `localStorage` genutzt wird, immer mit try/catch.
- **Interaktive Elemente** einsetzen, wo sie das Denken unterstützen: Ausprobieren mit Live-Graph, Schieberegler, auszufüllende Tabellen, Code-Schlösser, Drag-and-drop. Nicht als Dekoration.
- **Tablet zuerst, einspaltig, Smartphone bedienbar:** Primär Tablet im Querformat, einspaltig; nach unten scrollen ist überall erlaubt, seitlich nie.
- **Navigation:** Lernsituationen werden über die Auswahlseite des Themas erreicht (Abschnitt "Auswahlseite des Themas"). Neue Seiten in Routen, Navigation und Themenübersicht eintragen.

## Checkliste vor der Abgabe

- [ ] Das Log wurde gelesen, die neue Situation unterscheidet sich von den letzten drei mindestens in Format, Art des Handlungsprodukts und Themenfarbe, und sie ist eingetragen.
- [ ] Genau vier Phasen in fester Reihenfolge, **jede auf genau einer Seite**: Warm-up, Problem erkennen, Problem lösen, Wissen prüfen und vertiefen.
- [ ] Das Warm-up hat mindestens 5 Aufgaben, alle in `pflicht`, jede sichtbar nummeriert mit „a) Kurzname“, „b) …“ (`title` der Karte).
- [ ] Das Lernvideo des Themas (aus den Übungsaufgaben) ist in `BeispielMitVideo` eingebettet; gibt es keines, ist es als offener Punkt genannt.
- [ ] Nichts wird geprüft, bevor es erarbeitet wurde.
- [ ] Keine Austausch-Phase, keine Stopp-Kästen, kein "Vergleicht eure Wege", kein "So haben andere gedacht".
- [ ] Seitenansicht mit Startbox (Titelbild, Name, Heft-Bestätigung); "Weiter" erst, wenn alle Pflichtaufgaben der Phase gelöst sind (`pflicht`, `fertig.teil`); danach steht "Weiter zu …" auch am Seitenende (im Test geprüft).
- [ ] Kein seitliches Scrollen bei 1180 × 820, 1920 × 1080 und 390 × 844 (per Playwright getestet); bei 1920 × 1080 bleibt jede Seite einspaltig. Nach unten scrollen ist erlaubt; Skizzen und Graphen sind nicht gestaucht, Beschriftungen gut lesbar.
- [ ] In "Problem erkennen" ist klar, dass es ums Ausprobieren geht; Auftrag und Ausprobieren stehen auf einer Seite; die SuS merken, dass ihr Vorwissen nicht sicher reicht.
- [ ] "Problem erkennen" zeigt Situation, Problem (gegeben/gesucht als Fließtext) und den Auftrag als einzigen Fokus.
- [ ] "Problem lösen": Problem oben als Fokus, darunter `BeispielMitVideo` (breiter Knopf, Video oben, Beispiel mit anderen Zahlen darunter), "Vergleiche deine Ergebnisse" mit den Endergebnissen als Fragen, gestuften Hilfen und Lösungsweg erst nach einem Fehlversuch, darunter die `Fehlersuche` mit Zwischenergebnissen (öffnet sich automatisch), dann ggf. Entscheidung, Handlungsprodukt mit Kriterien, am Ende Rückbezug und Merke. Kein Beispiel vor dem Problem, keine `WegWahl`.
- [ ] Kein Heft-Hinweis und kein "Schreibe … ins Heft" an den Aufgaben (die Bestätigung in der Startbox genügt).
- [ ] Eingabefelder prüfen sich selbst (richtig sofort grün, falsch nach kurzer Pause rot), kein Prüfen-Button außer bei Auswahlaufgaben.
- [ ] Alles Mathematische ist mit KaTeX gesetzt, auch im Fließtext; keine `.katex-error`.
- [ ] Funktionsgleichungen mit `y = …`, Funktionswerte als "x einsetzen", Scheitelform `y = a(x − x_S)² + y_S`.
- [ ] Wo es Lückenrechnungen gibt (z. B. in Übungsaufgaben), stehen die Lücken direkt in der Gleichung; jedes Zwischenergebnis hat eine eigene Zeile (z. B. `a = [ ]`).
- [ ] Ergebnis-Abgleich und andere Denkaufgaben mit drei gestuften Hilfen, Lückenrechnungen mit Schritt-Hilfen (konkrete Anleitungen); Niveaustufen sind gekennzeichnet.
- [ ] Es gibt genau einen klaren Aha- oder Widerspruchsmoment.
- [ ] Der Kontext passt zur Lebenswelt von 15- bis 18-Jährigen, die Zahlen sind realistisch.
- [ ] Festlegung bzw. Versuche werden am Ende von "Problem lösen" wieder aufgegriffen.
- [ ] Mindestens zwei Darstellungen werden verknüpft.
- [ ] "Problem erkennen" und "Problem lösen" haben je mindestens ein inhaltliches Bild (Graph, Skizze oder Sachbild im Stil des Titelbilds), das nichts von der Lösung verrät; beim Handlungsprodukt zeigt ein kleines Bild, was entstehen soll.
- [ ] Das Handlungsprodukt wird in "Problem lösen" eingefordert, ist überwiegend analog, passt zum Inhalt und hat 2 bis 4 Kriterien zum Abhaken, dazu das Kriterium „unbekannte Begriffe und Bedeutung der Abkürzungen der Formel aufschreiben“ mit den konkreten Abkürzungen.
- [ ] "Wissen prüfen und vertiefen" hat mindestens 3, besser 4 passende Übungsaufgaben (Basis bis Erweiterung) und darunter die Abschluss-Buttons.
- [ ] Gamification an: `SeitenLernsituation` mit `punkte`, Fehlersuche mit `ohnePunkte`, Profi-Aufgabe mit `profi`, `<Bilanz />` am Ende der letzten Seite; die Punkte wurden im Test nachgerechnet.
- [ ] Punkte nach Aufwand: jede Aufgabe hat `punkte={…}` nach der Richtwert-Tabelle (Abruf 2, Kernaufgabe 10 bis 15 …), "Problem lösen" bringt etwa 40 % der Pflichtpunkte, das Warm-up höchstens 20 %; das Bonus-Spiel bringt höchstens so viel wie die beste Übung; die Verteilung steht als Kommentar in der Datei.
- [ ] Im Test geprüft: Eine Tipp-Pause mitten in einer richtigen Eingabe (z. B. „0“, Pause, „,5“) kostet keine Punkte.
- [ ] Nach allen Pflicht-Übungen wird ein thematisch passendes Bonus-Spiel freigeschaltet (`BonusSpiel`), das das Wissen spielerisch prüft, auf dem Tablet bedienbar ist und "Nochmal spielen" anbietet.
- [ ] Ruhiges Grunddesign: einspaltig (auch bei 1920 × 1080), ein Fokus pro Seite, keine verschachtelten Kästen, keine Farbstreifen oder Banner, eine Akzentfarbe, Touch-Ziele mindestens 44 px.
- [ ] Identität vollständig: Themenfarbe (anders als in den letzten drei Lernsituationen), Symbol und Name als Kennung in der Leiste, eigenes Titelbild in der Startbox, Leitobjekt durch alle Phasen.
- [ ] `frontend-design` vor dem Bauen geladen, `design:design-critique` mit Screenshots danach angewendet und die Punkte behoben.
- [ ] Bei keiner Auswahlaufgabe ist Antwort A richtig.
- [ ] Die Übungsaufgaben enthalten mindestens eine diagnostische Aufgabe mit typischen Fehlern als Antwortoptionen.
- [ ] Die Lernsituation führt ein und sichert; die Übungsaufgaben in Phase 4 vertiefen nur kurz, sie ersetzen nicht die Übungsseiten.
- [ ] Startseite des Themas umgebaut: Wahl zwischen "Lernsituation" (Karte `LernsituationKarte` in Themenfarbe) und "Übungsaufgaben" (alle bisherigen Aufgaben erreichbar); alte Links geprüft; "Weiter üben" führt zu den Übungsaufgaben.
- [ ] Committet und mit `--no-ff` in `main` gemergt.

## Beispiele in verschiedenen Formaten

Die Beispiele zeigen die Bandbreite. Sie sind keine Vorlagen zum Kopieren. Alle nutzen das ruhige Grunddesign mit eigener Identität. Beispiel R ist die Referenz für den Aufbau mit einer Seite pro Phase; A bis E beschreiben Format und Inhalt und werden beim Bauen genauso auf vier Seiten verteilt.

### R. Rollenspiel / Beratungsauftrag: Tageszinsen (umgesetzt: Lenas Autogeld, Referenz)
- **Rechenbeispiel:** nur zwei Schritte (Zinstage nach der Bankregel zählen, alles in die Zinsformel einsetzen), keine Zwischenschritte über Jahres- und Tageszinsen.
- **Kontext:** Azubi in der Bank. Lena legt 4.800 € vom 16.05. bis zum 14.10. an: Tagesgeld 2,4 % p.a. oder Festgeld 3 % p.a. für 90 Tage.
- **Identität:** Petrol, `fa-car-side`, Titelbild Auto mit Kalenderblatt, Leitobjekt die Zinstage-Leiste (A 148 Tage, B 90 Tage).
- **Seite 1 Warm-up:** drei kurze Aufgaben untereinander (Jahreszinsen, Jahr → Tag, Zinstage nach der Bankregel).
- **Seite 2 Problem erkennen:** Lenas Anfrage ("3 % von 4.800 € sind 144 €, oder?"), Sachbild der beiden Angebote (Sparschwein für das Tagesgeld, Tresor mit Schloss für das Festgeld), Zinstage-Leiste, Auftrag "Lege dich fest", Auswahl plus Schätzregler.
- **Seite 3 Problem lösen:** Problem oben, "Rechenbeispiel ansehen" (Jonas, 2.700 €, 139 Tage, mit Video), Handlungsprodukt "Antwort an Lena" mit Brief-Bild (Umschlag, angefangener Brief, Stift) und Satzanfängen zum Aufklappen, Wahl "Selbst rechnen" (Zinstage, Zinsen A, Zinsen B) oder "Mit Lösungsschema" (drei Zeilen: Zinstage, Zinsformel für A, Zinsformel für B, mit Schritt-Hilfen), Empfehlung per Auswahl, Kriterien des Briefs abhaken, danach Rückbezug und Merke.
- **Seite 4 Wissen prüfen und vertiefen:** vier Übungsaufgaben (Zinsen auswählen, "Wer hat recht?" zu Zinstagen, Zinstage und Zinsen selbst berechnen, Profi-Aufgabe Festgeld plus Tagesgeld), darunter die Abschluss-Buttons.

### A. Kundenauftrag / Maschine: Funktionsgleichung aus Scheitelpunkt und einem Punkt (umgesetzt: Torbogen)
- **Kontext:** Azubi im Metallbau, ein Torbogen über einer 4 m breiten Hofeinfahrt.
- **Identität:** Themenfarbe Kupfer, Symbol `fa-archway`, Name "Der Torbogen", Titelbild Hofeinfahrt zwischen zwei Häusern mit Maßen, Leitobjekt Biegemaschine.
- **Auswahlseite:** Variante B (`FunktionsgleichungMenu.tsx`, zusammen mit Lernsituation 2 „Das Gleichungs-Labor“ (Additions- und Subtraktionsverfahren, ohne Sachkontext) und Lernsituation 3 „Der Korbwurf“ (Fall 2, graphisch gedeutet)).
- **Warm-up:** Scheitelpunkt ablesen, Gleichung nach a lösen, Klammer ausmultiplizieren.
- **Problem erkennen:** Situation, Problem und Auftrag untereinander, darunter Skizze und `y = [a]x² + [b]x + [c]`. Jede gesendete Gleichung wird live in die Skizze gezeichnet, die Biegemaschine meldet, welche Pfosten und welche Höhe passen. Nach drei Versuchen: "Raten bringt dich kaum ans Ziel."
- **Problem lösen:** klarer Auftrag mit S(2 | 3) und P(0 | 2), Skizze nur mit S und P, Rechenbeispiel zum Aufklappen, Handlungsprodukt Spickzettel (analog), dann selbst rechnen oder Lösungsschema ① S einsetzen, ② P einsetzen, `a = [ ]`, ③ Scheitelform, ④ allgemeine Form, mit Schritt-Hilfen; danach Rückbezug auf die Versuche und Merke.
- **Wissen prüfen und vertiefen:** Übungsaufgaben (Fehler im Azubi-Plan finden, neue Gleichung aufstellen, Sonderwunsch).

### B. Experimentierlabor: Nullstellen linearer Funktionen (umgesetzt: Stromspeicher)
- **Kontext:** Der Stromspeicher einer Solaranlage hat um 20 Uhr noch 2,5 kWh, das Haus verbraucht nachts 0,4 kWh pro Stunde: y = −0,4x + 2,5.
- **Identität:** Themenfarbe Indigo, Symbol `fa-battery-half`, Name "Der Stromspeicher", Titelbild Haus mit Solaranlage bei Nacht, Leitobjekt Stromspeicher.
- **Auswahlseite:** Variante A (Modus in `Nullstellen.tsx`, daneben die Schwierigkeitsgrade Einfach und Fortgeschritten).
- **Problem erkennen:** Die SuS fragen den Speicher zu selbst gewählten Zeiten ab; jeder Versuch erscheint als Punkt im Graphen. Den genauen Zeitpunkt (x = 6,25, also 2:15 Uhr) treffen sie kaum.
- **Problem lösen:** Problem mit Graph (Nullstelle als „?“), Beispielrechnung E-Bike-Akku mit Lernvideo, Ergebnisse abgleichen (x_N, Uhrzeit) mit Fehlersuche (rechte Seite, x_N, Minuten).
- **Handlungsprodukt (analog):** Nachricht an Familie Demir mit Rechnung, Skizze und Uhrzeit.
- **Übungsaufgaben:** Bedeutung von N(5 | 0), Nullstelle berechnen (A: x = −4 Vorzeichenfehler, B: x = 12 t verwechselt, C: N(0 | 4) vertauscht, D: N(4 | 0) richtig), Wer hat recht? (Minus beim Abziehen vergessen), umgekehrt: Startwert für "reicht bis 6 Uhr", Profi: y = 3 hat keine Nullstelle. Bonus-Spiel „Akku-Countdown“.

### C. Entscheidungsfall: Schnittpunkte linearer Funktionen
- **Kontext:** Eine Freundin schreibt: "Welche Fahrschule soll ich nehmen?"
- **Identität:** z. B. Themenfarbe Beere, Symbol `fa-car`, Titelbild zwei Fahrschulschilder an einer Straße, Leitobjekt das Fahrschul-Angebot.
- **Situation:** Fahrschule A: 400 € Grundbetrag und 55 € pro Fahrstunde. Fahrschule B: 250 € und 65 € pro Fahrstunde.
- **Problem erkennen:** Die SuS probieren verschiedene Stundenzahlen aus und sehen die Kosten beider Schulen; die Antwort kippt irgendwo, aber wo genau?
- **Problem lösen:** Kosten A: y = 55x + 400, Kosten B: y = 65x + 250, die Terme gleichsetzen, Lückenrechnung.
- **Aha:** Bei 15 Fahrstunden kippt die Antwort.
- **Handlungsprodukt (analog):** Antwort an die Freundin im Heft, mit Skizze der beiden Kostengeraden und Begründung.
- **Übungsaufgaben:** Gerade 1: y = 2x + 1, Gerade 2: y = −x + 7. A: x = 2 (nur x-Wert), B: S(5 | 2) (vertauscht), C: S(2 | 5) (richtig), D: S(6 | 13) (Vorzeichenfehler).

### D. Kontrastierende Fälle: Zinseszins
- **Situation:** Zwei Sparpläne über 10 Jahre mit gleichem Zinssatz. Bei einem werden die Zinsen ausgezahlt, beim anderen mitverzinst.
- **Problem erkennen:** Schieberegler "Wie groß ist der Unterschied nach 10 Jahren?", dann Auflösung.
- **Problem lösen:** Tabelle Jahr für Jahr ausfüllen, Unterschied beschreiben, dann Faktorschreibweise entdecken.
- **Aha:** Der Unterschied wächst nicht gleichmäßig, sondern immer schneller.
- **Handlungsprodukt (analog):** Concept Map "einfacher Zins vs. Zinseszins" mit Tabelle, Graph und Formel.
- **Übungsaufgaben:** Auswahl der richtigen Formel. A: K·(1 + p·n), B: K·p^n, C: K·(1 + p)^n (richtig).

### E. Fehlerdetektiv / Rätsel: Prozentrechnung (Rabatt auf Rabatt)
- **Ablauf:** Code-Schloss schaltet die nächste Seite frei.
- **Situation:** Im Sale gibt es 20 % und an der Kasse nochmal 30 %. Mia sagt: "Das sind 50 %!" Leon sagt: "Nein, weniger."
- **Problem erkennen:** Wer hat recht? Festlegung, dann mit einem Beispielpreis ausprobieren.
- **Problem lösen:** Rechenbeispiel mit Faktoren, eigene Lückenrechnung; die richtige Endsumme ist der Code.
- **Aha:** 20 % und 30 % ergeben zusammen nur 44 % Rabatt.
- **Handlungsprodukt (analog):** Spickzettel "Mehrere Prozentänderungen" mit Faktor-Regel und einem eigenen Beispiel.
- **Übungsaufgaben:** Eigene Aufgabe erfinden, bei der die naive Addition falsch wäre; dazu eine Auswahlaufgabe, bei der A die Fehloption "Prozente addieren" ist.

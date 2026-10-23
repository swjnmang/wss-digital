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
- **Referenz-Umsetzungen:** `mathe-trainer/src/pages/quadratische_funktionen/funktionsgleichung_einstieg/TorbogenEinstieg.tsx` und `mathe-trainer/src/pages/lineare_funktionen/nullstellen_einstieg/StromspeicherEinstieg.tsx` (Seitenansicht, vier Phasen, Identität, Ausprobieren mit Live-Rückmeldung, Lückenrechnung mit Schritt-Hilfen). Vor dem Bauen ansehen.
- **Aktuelle Fassung dieses Skills** liegt im Repo unter `mathe-trainer/docs/skills/lernsituationen/SKILL.md`. Weicht sie ab, gilt die Repo-Fassung.

## Grundidee: fester Kern, variable Bausteine

Lernsituationen dürfen **nicht nach Schema F** ablaufen. Gleichförmigkeit langweilt und demotiviert.

- **Fest** sind die vier Phasen, die Abfolge **Problem → Beispiel → eigene Lösung**, die Seitenansicht, das **ruhige Grunddesign**, die didaktischen Leitlinien, die Pflichtfunktionen und die Schreib- und Rechenkonventionen.
- **Variabel** sind Kontext, Dramaturgie (Format), Lernprodukt, Sozialformen, die Methoden innerhalb der Phasen und die **Identität** der Lernsituation.
- **Ruhig, aber unverwechselbar:** Alle Lernsituationen haben dasselbe ruhige Gerüst, aber jede hat ein eigenes Gesicht (Abschnitt "Identität jeder Lernsituation"). Die SuS sollen auf jeder Seite sofort erkennen, in welcher Lernsituation sie sind.
- **Abwechslung wird geprüft**, nicht dem Zufall überlassen (Abschnitt "Abwechslung absichern").

## Ablauf

### 1. Log lesen
Lies vor allem anderen `lernsituationen-log.md` im Repo (Abschnitt "Abwechslung absichern"). Notiere, welche Formate, Produkte, Themenfarben und Kontextbereiche in den letzten drei Lernsituationen vorkamen. Existiert die Datei noch nicht, lege sie an und trage vorhandene Lernsituationen-Seiten aus dem Repo nachträglich ein.

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
- **Lernprodukt** (aus dem Produktkatalog)
- **Identität:** Themenfarbe, Symbol, Titelbild und Leitobjekt (Abschnitt "Identität jeder Lernsituation")
- einem Satz, warum die Kombination zum Inhalt passt und kognitiv aktiviert

Die Kombinationen unterscheiden sich untereinander deutlich und halten die Abwechslungsregel ein. Die Lehrkraft wählt eine aus oder kombiniert. Will die Lehrkraft ausdrücklich, dass direkt gebaut wird, entscheide selbst nach der Abwechslungsregel und nenne die Wahl am Ende.

### 4. Didaktisches Konzept zur Abstimmung
Lege ein kompaktes Konzept vor:
- Lernziel in einem Satz
- Seitenplan: jede Seite mit Phase, Aufgabe, Freischaltbedingung und ungefährer Zeit
- Das Problem in einem Satz (gegeben, gesucht) und das passende Rechenbeispiel dazu
- Lernprodukt mit 2 bis 4 Kriterien
- Hilfen (Schritt-Hilfen oder gestufte Hilfen) und Niveaustufen
- Der Aha- oder Widerspruchsmoment
- Typische Fehlvorstellungen, auf die der Check zielt

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
- Sind Skizzen und Graphen groß genug und ihre Beschriftungen gut lesbar?
- Ist alles einspaltig, ruhig und auf dem Tablet gut bedienbar (Phasennamen nicht abgeschnitten, kein seitliches Scrollen)?

Behebe die gefundenen Punkte, bevor du die Seite übergibst.

### 8. Log aktualisieren und Selbstcheck
Trage die neue Lernsituation ins Log ein. Prüfe die Seite mit der Checkliste am Ende, führe den Test aus dem Abschnitt "Seitenansicht" aus und nenne der Lehrkraft offene Punkte.

### 9. Veröffentlichen
Wie in `CLAUDE.md` des Repos: direkt committen, pushen und mit eigenem Merge-Commit (`git merge --no-ff`) in `main` mergen, `main` zuerst pushen. Keinen Pull Request anlegen, nicht nachfragen.

## Die vier Phasen (fest)

Jede Lernsituation hat **genau diese vier Phasen in dieser Reihenfolge**. Namen und Reihenfolge stehen im Code nur in `lineare_funktionen/lernsituation_kit/phasen.tsx` (`PHASEN`, `art`: `start`, `problem`, `loesen`, `sichern`).

| Phase | Inhalt | Typische Seiten |
| --- | --- | --- |
| **1 Warm-up** | Vorwissen abrufen, das gleich gebraucht wird (Retrieval Practice). 2 bis 3 kurze Aufgaben, je eine pro Seite. | Wert ablesen, einfache Gleichung lösen, Klammer ausmultiplizieren |
| **2 Problem erkennen** | Kontext, Leitfrage und Festlegung. Die SuS merken selbst, dass sie das Problem mit ihrem bisherigen Wissen nicht sicher lösen können. | Auftrag mit Skizze und interaktivem Ausprobieren auf **einer** Seite |
| **3 Problem lösen** | Das eigentliche Problem steht im Mittelpunkt, ohne vorgeschaltete Nebenaufgaben. **Immer in dieser Reihenfolge:** konkreter Arbeitsauftrag zum Problem, dann ein passendes ausgearbeitetes Rechenbeispiel, dann die eigene Rechnung. | "Deine Aufgabe", Rechenbeispiel, "Jetzt du" |
| **4 Festhalten und Prüfen** | Rückbezug zur Festlegung, Merke, Lernprodukt, kurze Checks mit typischen Fehlern. | "Das hältst du fest", Lernprodukt, Check 1 bis 3, Abschluss |

**Logik der Reihenfolge:** Nie etwas prüfen oder abfragen, das die SuS noch nicht lernen konnten. Erst entdecken bzw. erarbeiten, dann sichern, dann prüfen. Auch Fehlerbeispiele ("Wer hat recht?") gehören erst in Phase 4.

**Keine Austausch-Phase:** Es gibt keinen Stopp-Kasten "Besprecht eure Ergebnisse mit der Klasse", kein "Vergleicht eure Wege" und keine aufklappbaren Lösungswege anderer ("Du arbeitest allein? So haben andere gedacht …"). Partner- oder Gruppenarbeit innerhalb einer Phase ist erlaubt und wird markiert.

### Phase 2: Aufbau der Seite "Problem erkennen"

Von oben nach unten, einspaltig, ohne verschachtelte Kästen:
1. **Seitentitel** (z. B. "Der Torbogen für die Hofeinfahrt"). Die Phase steht bereits in der Phasenleiste.
2. **Situation** als kurzer Fließtext (2–3 Sätze), z. B. "Du bist Azubi im Metallbau. …"
3. **Problem** als Fließtext: was gegeben und was gesucht ist, z. B. "Du kennst den Scheitelpunkt S(2 | 3) und einen weiteren Punkt P(0 | 2) des Bogens. Gesucht ist die Funktionsgleichung in allgemeiner Form y = ax² + bx + c." Keine getrennten Kacheln "Gegeben"/"Gesucht".
4. **Auftrag:** das einzige hervorgehobene Element der Seite. Ein klarer Satz, was jetzt zu tun ist.
5. **Skizze und Interaktion** darunter (Skizze in gut lesbarer Größe, Eingaben, Button, Rückmeldung). Die SuS dürfen dafür nach unten scrollen.

Hinweise wie "Probiere mindestens drei Gleichungen aus, dann geht es weiter" stehen als `bedingung` im Seitenkopf bzw. bei der Interaktion, nicht als zusätzliches farbiges Banner.

### Phase 2: Problem erkennen durch Ausprobieren (bevorzugte Methode)

Wo es inhaltlich passt, probieren die SuS selbst Lösungen aus und bekommen sofort sichtbare Rückmeldung. Sie merken dabei, dass Raten nicht zuverlässig zum Ziel führt. Beispiel Torbogen: Die SuS tippen Werte für a, b und c direkt in `y = [a]x² + [b]x + [c]` ein, klicken "An die Maschine senden", der Graph wird **sofort in die Skizze gezeichnet** und die Maschine meldet, welche Bedingungen passen und welche nicht.

- Der Auftrag sagt ausdrücklich, dass es ums **Ausprobieren** geht ("Probier es aus, ohne zu rechnen").
- Auftrag, Skizze, Eingabe und Rückmeldung stehen **auf derselben Seite**, nicht auf zwei Seiten verteilt.
- Freischaltung nach einer Mindestzahl an Versuchen (z. B. 3) oder einem Treffer. Danach eine kurze Erkenntnis ("Raten bringt dich kaum ans Ziel. Gleich lernst du, wie …").
- Andere Wege bleiben möglich, wenn Ausprobieren nicht passt: Widerspruch, Entscheidungsfrage, Schätzung mit Auflösung.

### Phase 3: Problem lösen

**Feste Reihenfolge, ohne Ausnahme:** (1) "Deine Aufgabe" stellt das Problem konkret dar, (2) das passende Rechenbeispiel, (3) "Jetzt du" mit der eigenen Rechnung. **Ein Rechenbeispiel vor der Problemdarstellung ist nicht erlaubt**, auch nicht im Warm-up oder in Phase 2.

- **Klarer Arbeitsauftrag** in eigenen Worten: was gegeben ist, was gesucht ist und in welcher Form das Ergebnis stehen soll. Beispiel: "Stelle die Funktionsgleichung auf. Gegeben sind der Scheitelpunkt S(2 | 3) und der Pfosten P(0 | 2). Stelle sie zunächst in Scheitelform und anschließend in allgemeiner Form auf. Wie das geht, siehst du im folgenden Rechenbeispiel. Danach rechnest du selbst."
- Die Skizze zeigt nur die gegebenen Größen, keine Informationen, die nicht gebraucht werden.
- **Ausgearbeitetes Rechenbeispiel** mit anderen Zahlen, Schritt für Schritt (bei vielen Schritten über zwei Seiten verteilt), dann die **eigene Rechnung** als Lückenrechnung.

## Seitenansicht (Pflicht)

Jede Lernsituation läuft in der Seitenansicht `SeitenLernsituation` aus `lineare_funktionen/lernsituation_kit/seiten.tsx` mit **`ruhig`** (ruhiges Grunddesign) und **`thema`** (Identität), eingebettet in `TaskShell` mit `kompakt`. Für Situation, Problem und Auftrag gibt es die Klassen `sl-text`, `sl-fokus` (mit `sl-fokus-titel`) und `sl-hinweis`. Lange Scrollseiten mit allen Phasen untereinander, Kachel-Übersichten und eigene Stepper werden nicht mehr gebaut.

- **Startbox:** Titelbild, Name der Lernsituation, Lernziel. Vor der ersten Seite bestätigen die SuS per Haken "Ich dokumentiere bei jeder Aufgabe alle Rechenschritte schriftlich in meinem Heft." Erst dann geht es los.
- **Eine Aufgabe pro Seite.** Jede Seite gehört zu genau einer Phase (`art`) und hat einen kurzen Titel.
- **"Weiter" erst, wenn die Seite erledigt ist:** Aufgabe richtig gelöst (`onSolved` an `CheckCard`/`McCard` ruft `fertig()`), Mindestzahl an Versuchen erreicht, alle Kriterien des Lernprodukts abgehakt o. Ä. Reine Info-Seiten (Rechenbeispiel, Merke) sind `frei`. Ist die Bedingung nicht offensichtlich, steht sie als `bedingung` im Seitenkopf. Die Phasenleiste mit "Weiter" bleibt beim Scrollen oben stehen.
- **Nach unten scrollen ist erlaubt, zur Seite nie:** Eine Seite darf länger als der Bildschirm sein; die SuS scrollen dann nach unten weiter. **Lesbarkeit geht vor Passform:** Skizzen und Graphen werden **nicht** gestaucht, damit alles auf einen Bildschirm passt. Richtwert auf dem Tablet: Skizzen und Graphen etwa 260–320 px hoch, Beschriftungen mindestens 14 px und höchstens etwa 20 px auf dem Bildschirm. Wünschenswert ist, dass Titel, Auftrag und der Anfang der Interaktion im ersten Bildschirm sichtbar sind. **Horizontales Scrollen ist verboten**, auf jeder Bildschirmbreite (Tablet, Monitor, Smartphone). Eine Seite wird nur geteilt, wenn sie sonst unübersichtlich lang wird; nie werden zwei Aufgaben auf eine Seite gelegt. **Keine Zweispalter** (`ZweiSpalten` nicht mehr verwenden): Einspaltigkeit hat Vorrang.
- **Test:** Mit Playwright (`vite build` + `vite preview`) alle Seiten bei 1180×820, 1920×1080 und 390×844 (Smartphone) durchklicken (Cookie-Hinweis vorher schließen), jeweils vor und nach dem Lösen `document.documentElement.scrollWidth - innerWidth` messen (muss 0 sein, kein seitliches Scrollen) und auf `.katex-error` prüfen. Die Höhe darf überstehen; prüfe auf den Screenshots, dass Skizzen groß genug und Beschriftungen lesbar sind.
- Am Ende eine Abschlussseite mit Buttons zurück zur Auswahl, zu den Übungsaufgaben und ggf. zur nächsten Lernsituation.

## Auswahlseite des Themas (Pflicht)

Jede Lernsituation gehört zu einem Thema, für das es meist schon Übungsaufgaben gibt. Die **Startseite des Themas** (die Adresse, unter der das Thema in der Themenübersicht verlinkt ist) wird immer so umgebaut, dass die SuS dort wählen: **"Lernsituation"** oder **"Übungsaufgaben"**. Bestehende Übungsaufgaben bleiben vollständig erhalten und erreichbar; nichts wird entfernt.

Wähle das Muster, das zum Thema passt:

- **Variante A: eine Übungsseite mit Schwierigkeitsgraden** (z. B. `lineare_funktionen/Nullstellen.tsx`, `PunktGerade.tsx`, `Schnittpunkt.tsx`, `quadratische_funktionen/Scheitelpunkt.tsx`). Die Lernsituation wird ein eigener Modus der bestehenden Seite (`const [lernsituation, setLernsituation] = useState(false)`). In der Startansicht (noch kein Schwierigkeitsgrad gewählt) stehen nebeneinander zwei Felder: links **"Lernsituation"** mit der Karte, rechts **"Übungsaufgaben"** mit den vorhandenen Schwierigkeitsgraden. Die Lernsituation bekommt `erklaerung` (der Erklärteil der Seite, z. B. `<Intro />`), `onBack` (zurück zur Auswahl) und `onPractice` (direkt in den leichtesten Schwierigkeitsgrad).
- **Variante B: mehrere Lernsituationen oder mehrere Übungsseiten** (z. B. `quadratische_funktionen/FunktionsgleichungMenu.tsx`, `finanzmathe/ZinsrechnungMenu.tsx`). Unter der bisherigen Adresse entsteht eine eigene Auswahlseite `<Thema>Menu.tsx`: oben das Feld **"Lernsituation"** mit einer Karte pro Lernsituation, darunter das Feld **"Übungsaufgaben"** als Liste (`bk-topics`). Die bisherige Übungsseite zieht nach `<Adresse>/ueben`, die Lernsituationen bekommen eigene Adressen `<Adresse>/lernsituation-1`, `-2`, … Routen in `App.tsx` eintragen und alle Links prüfen, die direkt auf die alte Übungsseite zeigen (Suche, Themenübersicht, "Weiter üben"-Buttons), und bei Bedarf auf `/ueben` umstellen.
- Kommt zu einem Thema mit Variante A eine zweite Lernsituation dazu, wird auf Variante B umgestellt.

Für beide Varianten gilt:
- **Karte:** immer `LernsituationKarte` aus `lernsituation_kit/seiten.tsx` mit der Identität der Lernsituation (`thema={{ name, farbe, icon }}`, bei mehreren Lernsituationen `teil="Lernsituation 1 · …"`) und einer Beschreibung in ein bis zwei Sätzen, die die Situation und das Lernziel nennt. Die Karte hat so dieselbe Themenfarbe, dasselbe Symbol und denselben Namen wie die Lernsituation selbst.
- Die Überschriften heißen genau **"Lernsituation"** und **"Übungsaufgaben"** (nicht "Wähle deinen Schwierigkeitsgrad").
- Die Abschlussseite der Lernsituation führt mit "Weiter üben" zu den Übungsaufgaben dieses Themas.
- Die Auswahlseite wird mitgetestet: kein seitliches Scrollen bei 1180 × 820 und 390 × 844, Karte öffnet die Lernsituation, "Übungsaufgaben" öffnen die bisherigen Aufgaben.

## Schreib- und Rechenkonventionen (Pflicht)

- **KaTeX für alles Mathematische**, auch im Fließtext, in Titeln, Hilfen und Rückmeldungen: Punkte `S(2 \mid 3)`, Variablen `a`, Gleichungen, Zahlen mit Rechenzeichen. Keine Formeln als Klartext ("x²", "(2|3)", "x_S"). Dezimalkomma als `0{,}25`, echtes Minus.
- **Funktionsschreibweise:** Funktionsgleichungen immer mit `y = …`, nicht `f(x) = …`. Bei mehreren Funktionen steht der Name im Text davor ("Gerade 1: y = …", "Sprungbahn: y = …"). Funktionswerte als "x einsetzen": "x = 4: y = −0,25 · 4² + 4 + 2 = 2" statt f(4). In Feldern "y =", in Tabellenköpfen "y". Gleichsetzen heißt "die Terme gleichsetzen".
- **Scheitelform** als `y = a(x − x_S)² + y_S` (nicht mit d und e).
- **Rechnen im Heft:** Alles, was gerechnet wird, rechnen die SuS von Hand im Heft, das Tablet dient zur Kontrolle. Das bestätigen sie **einmal** in der Startbox. Deshalb steht an den einzelnen Aufgaben **kein** Heft-Hinweis ("Im Heft: Rechenweg und Ergebnis aufschreiben …"): `SeitenLernsituation` blendet ihn über `HeftBestaetigtCtx` automatisch aus. Schreibe auch keine eigenen Sätze wie "Halte deinen Rechenweg schriftlich fest" oder "Rechne im Heft" in die Aufgaben.
- **Lücken direkt in der Gleichung:** Werte, die die SuS in eine Gleichung einsetzen oder ergänzen, tragen sie im Kästchen **in der Gleichung** ein, nicht in einem Feld daneben oder darunter (kein `\square` mit Feld daneben). Dafür `CheckCard` mit `rechnung`: Zeilen `{ l: [...], r: [...], u?: '\\mid -3' }` aus TeX-Stücken und Lücken `{ luecke: 'feldKey' }`.
- **Eine Zeile pro Zwischenergebnis:** Bei mehrschrittigen Rechnungen bekommt jedes wichtige Zwischenergebnis eine eigene Zeile, damit die SuS die Struktur sehen. Beispiel: Vor der Scheitelform steht `a = [ ]` ("Formfaktor a"), damit klar ist, dass zuerst a berechnet wird. Die Zeilen sind am rechten Rand kurz benannt (① S einsetzen, ② P einsetzen, Formfaktor a, ③ Scheitelform, ④ allg. Form), Umformungen als `| −3  | :4`.
- **Live-Rückmeldung bei Graphen:** Geben SuS eine Gleichung oder einen Wert ein, wird das Ergebnis beim Absenden sofort in die Skizze gezeichnet (frühere Versuche blass, aktueller kräftig in Themenfarbe, Treffer grün).

## Didaktische Leitlinien

Jede Lernsituation folgt diesen Prinzipien aus der Unterrichtsforschung. Sie gelten unabhängig vom Format.

1. **Kognitive Aktivierung** (Klieme, Kunter; COACTIV): Eine offene Leitfrage, ein Rätsel, ein Widerspruch oder eine Entscheidung steht am Anfang. Sie lässt sich ohne die neue Mathematik nicht sicher beantworten.
2. **Problem vor Beispiel** (Productive Failure, Kapur; Renkl): Die SuS erleben in "Problem erkennen" selbst, dass ihr Vorwissen nicht reicht. In "Problem lösen" wird das Problem zuerst konkret dargestellt, danach folgt ein passendes ausgearbeitetes Lösungsbeispiel, dann rechnen sie selbst. Diese Reihenfolge gilt immer; ein Beispiel vor dem Problem ist nicht erlaubt.
3. **Festlegung vor dem Rechnen:** Die SuS legen sich auf eine Vermutung fest oder probieren aus. Das wird in Phase 4 wieder aufgegriffen ("Du hattest probiert: …").
4. **Vorwissen aktivieren** (Retrieval Practice): im Warm-up, gezielt auf die Schritte, die in "Problem lösen" gebraucht werden.
5. **Darstellungswechsel** (Duval, vom Hofe): Mindestens zwei, besser drei Darstellungen werden verknüpft, z. B. Situation, Tabelle, Graph, Term.
6. **Kognitive Belastung steuern** (Sweller): kurze Texte, einfache Sprache, kleine Schritte, eine Aufgabe pro Seite, kein "Klimbim" vor dem eigentlichen Problem. Wiederkehrende Bedienelemente sehen immer gleich aus.
7. **Kognitiver Konflikt:** Jede Lernsituation enthält genau einen Aha- oder Widerspruchsmoment, z. B. ein Ergebnis, das der Intuition widerspricht, oder das Scheitern beim Raten.
8. **Generatives Lernen** (Fiorella & Mayer): Die SuS erzeugen selbst etwas: erklären, zusammenfassen, visualisieren, eine Aufgabe erfinden.
9. **Formative Diagnose** (Black & Wiliam): Ein Check nutzt Antwortoptionen, die typische Fehlvorstellungen sichtbar machen.
10. **Klare Sicherung:** Die Kernerkenntnis wird ausdrücklich festgehalten.

## Pflichtfunktionen

Jede Lernsituation erfüllt diese Funktionen innerhalb der vier Phasen. **Methode und Gestaltung sind frei.**

| Funktion | Phase | Beispiele für Methoden (abwechseln!) |
| --- | --- | --- |
| Vorwissen abrufen | Warm-up | 2–3 kurze Abrufaufgaben, Ablesen, einfache Umformung |
| Einstieg mit Spannung | Problem erkennen | Kundenauftrag, Entscheidungsfrage, Rätsel, Widerspruch, Schätzfrage, Chatnachricht |
| Festlegung / Ausprobieren | Problem erkennen | interaktives Ausprobieren mit Rückmeldung (bevorzugt), Auswahl, Schieberegler, Schätzduell, Rangfolge |
| Eigene Denkarbeit | Problem lösen | Rechenbeispiel + eigene Lückenrechnung, Experiment mit Schieberegler, Fallvergleich, Code knacken |
| Sicherung | Festhalten und Prüfen | Rückbezug zur Festlegung, Merke, Lernprodukt |
| Check | Festhalten und Prüfen | Auswahlaufgabe mit Fehloptionen, "Wer hat recht?", Exit-Ticket, eigene Aufgabe erfinden |

Richtwerte für die Dauer:
- **Kurz (15–25 min):** 1–2 Warm-up-Seiten, Problem erkennen, Problem lösen, knappe Sicherung, ein bis zwei Checks.
- **45 min:** alle Funktionen, Problem lösen etwa 15 min, Checks kurz halten.
- **90 min:** alle Funktionen, ggf. ein vorab neu zu lernendes Verfahren als eigener Block in "Problem lösen", aufwendigeres Lernprodukt.

## Formatkatalog (Dramaturgien)

Das Format bestimmt die Geschichte innerhalb der vier Phasen. Wähle nach Inhalt und Abwechslung. Kombinationen sind erlaubt.

| Format | Ablauf in Kürze | Passt besonders zu |
| --- | --- | --- |
| **Entscheidungsfall** | Optionen vergleichen, mit Mathematik entscheiden, Entscheidung begründen | Funktionen, Schnittpunkte, Kostenvergleiche, Prozente |
| **Kundenauftrag / Maschine** | Ein Gerät oder Kunde braucht ein exaktes Ergebnis; Ausprobieren scheitert, Rechnen klappt | Funktionsgleichungen, Kalkulation, Verfahren |
| **Rätsel / Escape-Room** | Teilerkenntnisse liefern Codes, die nächste Seiten freischalten; Story-Rahmen | Verfahren mit mehreren Schritten, Gleichungen, Terme |
| **Kontrastierende Fälle** (Schwartz & Bransford) | 2–3 fast gleiche Situationen vergleichen: Was macht den Unterschied? Danach Begriff klären | Begriffsbildung, z. B. proportional vs. linear, Zins vs. Zinseszins |
| **Fehlerdetektiv / Wer hat recht?** | Zwei fiktive Mitschüler lösen unterschiedlich; Fehler finden, begründen, korrigieren (im Check, nach dem Erarbeiten) | Verfahren mit typischen Fehlern |
| **Experimentierlabor** | Hypothese aufstellen, mit Schieberegler oder Simulation testen, Regel formulieren | Parameter in Funktionen, Wachstum, Wahrscheinlichkeit, Nullstellen |
| **Schätzen & Fermi** | grob schätzen, Annahmen offenlegen, mit neuem Werkzeug präzisieren | Größen, Prozente, Potenzen, Statistik |
| **Rollenspiel / Beratungsauftrag** | SuS sind Azubis, Berater o. Ä. und erstellen für eine Person ein Angebot oder eine Empfehlung | kaufmännisches Rechnen, Kalkulation, Finanzmathematik |
| **Gruppenpuzzle** (Aronson) | Expertengruppen erarbeiten je einen Aspekt, Stammgruppe setzt zusammen | 90 min, Themen mit mehreren Teilaspekten |

## Produktkatalog (Lernprodukte)

Das Lernprodukt muss **zum Inhalt passen**:
- **Verfahren** → Schritt-für-Schritt-Anleitung, Erklärvideo, Spickzettel
- **Begriff oder Zusammenhang** → Concept Map, Infografik, Plakat
- **Entscheidung oder Anwendung** → Kundenbrief, Entscheidungsempfehlung, Kurzpräsentation
- **Mehrere Darstellungen** → Hefteintrag mit Situation, Tabelle, Graph und Term

| Analog | Digital |
| --- | --- |
| Hefteintrag (frei oder mit Gerüst) | Erklärvideo oder Screencast (60–90 s) |
| Plakat | Digitale Merkkarte, auf der Seite selbst zusammengebaut |
| Concept Map | Sprachnachricht "Erkläre es einem Freund" |
| Spickzettel (eine Karteikarte) | Eigene Aufgabe erstellen, die andere lösen |
| Kundenbrief / Entscheidungsempfehlung | Interaktive Folie oder Kurzpräsentation |
| Skizze / Comic-Strip | Infografik |

Jedes Lernprodukt hat einen klaren Auftrag und 2 bis 4 Kriterien. Auf der Seite haken die SuS die Kriterien ab, erst dann wird "Weiter" frei. Analoge und digitale Produkte wechseln sich über mehrere Lernsituationen hinweg ab.

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

**Fester Kern (immer gleich):** Seitenansicht mit Phasenleiste und "Weiter", Eingabefelder, Feedbackfarben grün/rot, Hilfen, Niveaustufen-Kennzeichnung, Sozialform-Markierung, Heft-Hinweis. Sozialform und Zeit sind unauffällige Textlabels, keine bunten Badges.

**Touch-Bedienung:** Buttons und Eingabefelder mindestens 44 × 44 px, ausreichender Abstand zwischen Tippzielen, Fließtext mindestens 17 px.

Keine Animationen oder Effekte ohne Funktion.

## Identität jeder Lernsituation (Pflicht)

Jede Lernsituation bekommt ein eigenes Gesicht, damit sie sich von den anderen unterscheidet und die SuS jederzeit wissen, wo sie sind. Die Identität entsteht aus vier Merkmalen, die alle aus dem Kontext abgeleitet werden. Umsetzung: Prop `thema` an `SeitenLernsituation` (`{ name, farbe, icon, bild }`, Typ `Thema` aus `seiten.tsx`).

1. **Themenfarbe** aus der Palette `THEMEN` in `seiten.tsx`: blau, petrol, violett, beere, ocker, schiefer, indigo, kupfer. Alle sind mit weißer Schrift kontraststark; Grün und Rot gibt es bewusst nicht, weil sie für richtig/falsch reserviert sind. Die Farbe passt zum Kontext (z. B. Kupfer für Metallbau, Indigo für Nacht und Energie, Petrol für Wasser oder Umwelt, Beere für Freizeit) und ersetzt innerhalb der Lernsituation die Standardfarbe Blau. Keine neuen Farben ohne Kontrastprüfung (weiße Schrift mindestens 4,5 : 1).
2. **Kennung:** ein passendes Font-Awesome-Symbol (`icon`, z. B. `fa-archway`, `fa-battery-half`, `fa-helicopter`, `fa-piggy-bank`) und ein kurzer Name (2–3 Wörter, z. B. "Der Torbogen"). Beides steht als Kennung links in der Phasenleiste auf **jeder** Seite (auf schmaleren Bildschirmen nur das Symbol), als Überschrift der Startbox und auf der Karte der Auswahlseite.
3. **Titelbild:** ein eigenes, flaches SVG-Sachbild der Situation (`bild`) oben in der Startbox, etwa 720 × 250. Es zeigt die Szene mit den wichtigsten Größen (z. B. Hofeinfahrt mit Torbogen und den Maßen 2 m, 3 m, 4 m). Flächen in Themenfarbe und Themenfarbe-hell, Linien in `--ink`, keine Fotos, keine Verläufe, keine Figuren mit Gesichtern.
4. **Leitobjekt:** ein Gegenstand, eine Person oder ein Gerät aus der Situation, das durch alle Phasen trägt und benannt wird (z. B. die Biegemaschine: in Phase 2 wird ausprobiert, in Phase 3 "die Gleichung für die Biegemaschine", in Phase 4 der Rückbezug). Es taucht in Seitentiteln, Rückmeldungen und im Rückbezug auf.

Die Identität bleibt im ruhigen Rahmen: keine zusätzlichen Kästen, Banner oder Farbstreifen, keine zweite Akzentfarbe, keine Animationen. Die Skizzen in den Aufgaben verwenden für das Wichtigste (Bogen, Graph, aktueller Versuch) die Themenfarbe.

## Auswahlaufgaben (Multiple Choice)

- **Antwortmöglichkeit A ist nie richtig.** Die richtige Antwort ist immer B, C oder D (bei weniger Optionen eine der hinteren). `McCard` warnt in der Entwicklung, wenn die erste Option richtig ist.
- Verteile die richtige Antwort über die Aufgaben einer Lernsituation auf B, C und D, damit kein Muster entsteht.
- Werden Optionen gemischt, bleibt die erste Option immer eine Fehloption.
- Gilt für alle Auswahlen: `McCard`, Auswahllisten, "Wer hat recht?", Festlegungen mit einer richtigen Antwort. Ausnahme: Auswahllisten mit natürlicher Reihenfolge (z. B. "Schritt 1, 2, 3") bleiben in dieser Reihenfolge.
- Die Fehloptionen bilden typische Fehlvorstellungen ab.

## Abwechslung absichern

- Im Repo liegt `lernsituationen-log.md` mit einer Tabelle: Datum, Thema, Seite, Format, Lernprodukt, Optik/Layout, Kontextbereich, Sozialformen. In der Spalte Optik/Layout steht seit dem ruhigen Grunddesign die **Identität**: Themenfarbe, Symbol, Leitobjekt (z. B. "Kupfer, fa-archway, Biegemaschine").
- **Regel:** Gegenüber den letzten drei Lernsituationen unterscheidet sich eine neue Lernsituation **mindestens in Format, Lernprodukt und Themenfarbe**, möglichst auch im Kontextbereich. Symbol, Titelbild und Leitobjekt sind immer neu. Die vier Phasen, die Seitenansicht und das ruhige Gerüst sind immer gleich und zählen nicht als Wiederholung.
- **Analog und digital** beim Lernprodukt wechseln sich ab.
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

- **Hilfen je nach Aufgabe:**
  - **Mehrschrittige Rechnungen** (Lückenrechnung mit mehreren Zeilen): `SchrittHilfen` aus `lernsituation_kit/kit.tsx`. Bei der Rechnung steht "Hilfe zu: ① ② a ③ ④". Die SuS wählen den Schritt, bei dem sie hängen; es ist immer nur eine Hilfe offen. Jede Hilfe ist eine **konkrete Anleitung** für genau diesen Schritt (was wohin eingesetzt wird, welche Umformung, eine Kontrollmöglichkeit), kein allgemeiner Denkanstoß. Die Kurzbezeichnungen der Hilfen entsprechen den Zeilennamen der Rechnung.
  - **Andere Denkaufgaben** (Auswählen, Begründen, Erkunden): drei gestufte Hilfen mit `Hilfen` (1 Denkanstoß, 2 Strategie, 3 erster Schritt bzw. Teillösung).
- **Niveaustufen** Basis, Standard und Erweiterung bei Denkarbeit und Check, sichtbar gekennzeichnet. Die Erweiterung enthält eine offene oder umgekehrte Aufgabe oder eine Begründung.

## Digitale Umsetzung

- **Konventionen von `mathe-aufgaben` gelten:** KaTeX, Merkhilfe der Wirtschaftsschule Bayern für Formeln und Abkürzungen, nachvollziehbare Rechenwege, Eingabefelder mit grün/rot und Lob, automatische Prüfung (Button "Prüfen").
- **Bausteine aus `mathe-trainer/src/pages/lineare_funktionen/lernsituation_kit/`:**
  - `seiten.tsx`: `SeitenLernsituation` (Startbox, Seiten, Phasenleiste, "Weiter", Optionen `ruhig` und `thema`), `LernsituationKarte` (Karte für die Auswahlseite), `THEMEN`, Typ `Thema`, Typ `Seite = { art, titel, frei?, bedingung?, inhalt: (fertig) => … }`
  - `kit.tsx`: `CheckCard` (mit `rechnung`, `fields`, `solution`, `help`, `onSolved`), `McCard` (`onSolved`), `TrackedCheck`/`TrackedMc` (für Bereiche mit Nachverfolgung), `SchrittHilfen`, `Hilfen` (`HeftHinweis` wird in der Seitenansicht nicht angezeigt)
  - `phasen.tsx`: `PHASEN` (Namen und Reihenfolge der vier Phasen)
  - `Beispiel` aus `daten_und_zufall/lernpfad/kit.tsx` für Rechenbeispiele (`offen` zeigt alle Schritte, `ab` setzt die Schrittnummerierung fort)
  - `TaskShell` mit `kompakt`
- **Am bestehenden Code orientieren:** Sieh dir vor dem Bauen die Referenz-Umsetzungen an und übernimm Navigation, Grundstyles, Identität (`Titelbild`, `THEMA`) und Komponenten für den festen Kern. Bestehende Styles, die dem ruhigen Grunddesign widersprechen (Farbstreifen, verschachtelte Rahmen, Banner, `ZweiSpalten`, eigene Look-CSS wie `teamchat.css`), werden **nicht** übernommen. Führe keine neuen Frameworks oder Bibliotheken ein, ohne zu fragen.
- **Festlegung merken:** Vermutungen und Versuche bleiben im Seitenzustand und werden in Phase 4 wieder angezeigt. Kein Login. Wenn `localStorage` genutzt wird, immer mit try/catch.
- **Interaktive Elemente** einsetzen, wo sie das Denken unterstützen: Ausprobieren mit Live-Graph, Schieberegler, auszufüllende Tabellen, Code-Schlösser, Drag-and-drop. Nicht als Dekoration.
- **Tablet zuerst, einspaltig, Smartphone bedienbar:** Primär Tablet im Querformat, einspaltig; nach unten scrollen ist überall erlaubt, seitlich nie.
- **Navigation:** Lernsituationen werden über die Auswahlseite des Themas erreicht (Abschnitt "Auswahlseite des Themas"). Neue Seiten in Routen, Navigation und Themenübersicht eintragen.

## Checkliste vor der Abgabe

- [ ] Das Log wurde gelesen, die neue Situation unterscheidet sich von den letzten drei mindestens in Format, Lernprodukt und Themenfarbe, und sie ist eingetragen.
- [ ] Genau vier Phasen in fester Reihenfolge: Warm-up, Problem erkennen, Problem lösen, Festhalten und Prüfen.
- [ ] Nichts wird geprüft, bevor es erarbeitet wurde.
- [ ] Keine Austausch-Phase, keine Stopp-Kästen, kein "Vergleicht eure Wege", kein "So haben andere gedacht".
- [ ] Seitenansicht mit Startbox (Titelbild, Name, Heft-Bestätigung), eine Aufgabe pro Seite, "Weiter" erst nach dem Erledigen.
- [ ] Kein seitliches Scrollen bei 1180 × 820, 1920 × 1080 und 390 × 844 (per Playwright getestet); bei 1920 × 1080 bleibt jede Seite einspaltig. Nach unten scrollen ist erlaubt; Skizzen und Graphen sind nicht gestaucht, Beschriftungen gut lesbar.
- [ ] In "Problem erkennen" ist klar, dass es ums Ausprobieren geht; Auftrag und Ausprobieren stehen auf einer Seite; die SuS merken, dass ihr Vorwissen nicht sicher reicht.
- [ ] "Problem erkennen" zeigt Situation, Problem (gegeben/gesucht als Fließtext) und den Auftrag als einzigen Fokus.
- [ ] "Problem lösen" beginnt mit einem klaren Arbeitsauftrag (gegeben, gesucht, Form des Ergebnisses), ohne Nebenaufgaben davor; erst danach kommt das Rechenbeispiel. Kein Beispiel vor dem Problem.
- [ ] Kein Heft-Hinweis und kein "Schreibe … ins Heft" an den Aufgaben (die Bestätigung in der Startbox genügt).
- [ ] Alles Mathematische ist mit KaTeX gesetzt, auch im Fließtext; keine `.katex-error`.
- [ ] Funktionsgleichungen mit `y = …`, Funktionswerte als "x einsetzen", Scheitelform `y = a(x − x_S)² + y_S`.
- [ ] Lücken stehen direkt in der Gleichung; jedes Zwischenergebnis hat eine eigene Zeile (z. B. `a = [ ]`).
- [ ] Mehrschrittige Rechnungen haben Schritt-Hilfen mit konkreten Anleitungen; andere Denkaufgaben drei gestufte Hilfen; Niveaustufen sind gekennzeichnet.
- [ ] Es gibt genau einen klaren Aha- oder Widerspruchsmoment.
- [ ] Der Kontext passt zur Lebenswelt von 15- bis 18-Jährigen, die Zahlen sind realistisch.
- [ ] Festlegung bzw. Versuche werden in Phase 4 wieder aufgegriffen.
- [ ] Mindestens zwei Darstellungen werden verknüpft.
- [ ] Das Lernprodukt passt zum Inhalt und hat 2 bis 4 Kriterien.
- [ ] Ruhiges Grunddesign: einspaltig (auch bei 1920 × 1080), ein Fokus pro Seite, keine verschachtelten Kästen, keine Farbstreifen oder Banner, eine Akzentfarbe, Touch-Ziele mindestens 44 px.
- [ ] Identität vollständig: Themenfarbe (anders als in den letzten drei Lernsituationen), Symbol und Name als Kennung in der Leiste, eigenes Titelbild in der Startbox, Leitobjekt durch alle Phasen.
- [ ] `frontend-design` vor dem Bauen geladen, `design:design-critique` mit Screenshots danach angewendet und die Punkte behoben.
- [ ] Bei keiner Auswahlaufgabe ist Antwort A richtig.
- [ ] Der Check enthält mindestens eine diagnostische Aufgabe mit typischen Fehlern als Antwortoptionen.
- [ ] Die Seite führt ein und sichert, sie wird nicht zur Übungsseite.
- [ ] Startseite des Themas umgebaut: Wahl zwischen "Lernsituation" (Karte `LernsituationKarte` in Themenfarbe) und "Übungsaufgaben" (alle bisherigen Aufgaben erreichbar); alte Links geprüft; "Weiter üben" führt zu den Übungsaufgaben.
- [ ] Committet und mit `--no-ff` in `main` gemergt.

## Beispiele in verschiedenen Formaten

Die Beispiele zeigen die Bandbreite. Sie sind keine Vorlagen zum Kopieren. Alle nutzen das ruhige Grunddesign mit eigener Identität.

### A. Kundenauftrag / Maschine: Funktionsgleichung aus Scheitelpunkt und einem Punkt (umgesetzt: Torbogen)
- **Kontext:** Azubi im Metallbau, ein Torbogen über einer 4 m breiten Hofeinfahrt.
- **Identität:** Themenfarbe Kupfer, Symbol `fa-archway`, Name "Der Torbogen", Titelbild Hofeinfahrt zwischen zwei Häusern mit Maßen, Leitobjekt Biegemaschine.
- **Auswahlseite:** Variante B (`FunktionsgleichungMenu.tsx`, zusammen mit Lernsituation 2).
- **Warm-up:** Scheitelpunkt ablesen, Gleichung nach a lösen, Klammer ausmultiplizieren.
- **Problem erkennen:** Situation, Problem und Auftrag untereinander, darunter Skizze und `y = [a]x² + [b]x + [c]`. Jede gesendete Gleichung wird live in die Skizze gezeichnet, die Biegemaschine meldet, welche Pfosten und welche Höhe passen. Nach drei Versuchen: "Raten bringt dich kaum ans Ziel."
- **Problem lösen:** klarer Auftrag mit S(2 | 3) und P(0 | 2), Skizze nur mit S und P, Rechenbeispiel über zwei Seiten, dann Lückenrechnung ① S einsetzen, ② P einsetzen, `a = [ ]`, ③ Scheitelform, ④ allgemeine Form, mit Schritt-Hilfen.
- **Festhalten und Prüfen:** Rückbezug auf die Versuche, Merke, Spickzettel (analog) mit Kriterien zum Abhaken, Checks (Fehler im Azubi-Plan finden, neue Gleichung aufstellen, Sonderwunsch).

### B. Experimentierlabor: Nullstellen linearer Funktionen (umgesetzt: Stromspeicher)
- **Kontext:** Der Stromspeicher einer Solaranlage hat um 20 Uhr noch 2,5 kWh, das Haus verbraucht nachts 0,4 kWh pro Stunde: y = −0,4x + 2,5.
- **Identität:** Themenfarbe Indigo, Symbol `fa-battery-half`, Name "Der Stromspeicher", Titelbild Haus mit Solaranlage bei Nacht, Leitobjekt Stromspeicher.
- **Auswahlseite:** Variante A (Modus in `Nullstellen.tsx`, daneben die Schwierigkeitsgrade Einfach und Fortgeschritten).
- **Problem erkennen:** Die SuS fragen den Speicher zu selbst gewählten Zeiten ab; jeder Versuch erscheint als Punkt im Graphen. Den genauen Zeitpunkt (x = 6,25, also 2:15 Uhr) treffen sie kaum.
- **Problem lösen:** Aufgabe, Rechenbeispiel E-Bike-Akku, Lückenrechnung bis zur Uhrzeit mit Schritt-Hilfen.
- **Lernprodukt (digital):** eigene Speicher-Aufgabe erstellen, prüfen lassen und mit Partner tauschen.
- **Check:** Bedeutung von N(5 | 0), Nullstelle berechnen (A: x = −4 Vorzeichenfehler, B: x = 12 t verwechselt, C: N(0 | 4) vertauscht, D: N(4 | 0) richtig), umgekehrt: Startwert für "reicht bis 6 Uhr".

### C. Entscheidungsfall: Schnittpunkte linearer Funktionen
- **Kontext:** Eine Freundin schreibt: "Welche Fahrschule soll ich nehmen?"
- **Identität:** z. B. Themenfarbe Beere, Symbol `fa-car`, Titelbild zwei Fahrschulschilder an einer Straße, Leitobjekt das Fahrschul-Angebot.
- **Situation:** Fahrschule A: 400 € Grundbetrag und 55 € pro Fahrstunde. Fahrschule B: 250 € und 65 € pro Fahrstunde.
- **Problem erkennen:** Die SuS probieren verschiedene Stundenzahlen aus und sehen die Kosten beider Schulen; die Antwort kippt irgendwo, aber wo genau?
- **Problem lösen:** Kosten A: y = 55x + 400, Kosten B: y = 65x + 250, die Terme gleichsetzen, Lückenrechnung.
- **Aha:** Bei 15 Fahrstunden kippt die Antwort.
- **Lernprodukt (digital):** Antwortnachricht an die Freundin, mit Graph und Begründung.
- **Check:** Gerade 1: y = 2x + 1, Gerade 2: y = −x + 7. A: x = 2 (nur x-Wert), B: S(5 | 2) (vertauscht), C: S(2 | 5) (richtig), D: S(6 | 13) (Vorzeichenfehler).

### D. Kontrastierende Fälle: Zinseszins
- **Situation:** Zwei Sparpläne über 10 Jahre mit gleichem Zinssatz. Bei einem werden die Zinsen ausgezahlt, beim anderen mitverzinst.
- **Problem erkennen:** Schieberegler "Wie groß ist der Unterschied nach 10 Jahren?", dann Auflösung.
- **Problem lösen:** Tabelle Jahr für Jahr ausfüllen, Unterschied beschreiben, dann Faktorschreibweise entdecken.
- **Aha:** Der Unterschied wächst nicht gleichmäßig, sondern immer schneller.
- **Lernprodukt (analog):** Concept Map "einfacher Zins vs. Zinseszins" mit Tabelle, Graph und Formel.
- **Check:** Auswahl der richtigen Formel. A: K·(1 + p·n), B: K·p^n, C: K·(1 + p)^n (richtig).

### E. Fehlerdetektiv / Rätsel: Prozentrechnung (Rabatt auf Rabatt)
- **Ablauf:** Code-Schloss schaltet die nächste Seite frei.
- **Situation:** Im Sale gibt es 20 % und an der Kasse nochmal 30 %. Mia sagt: "Das sind 50 %!" Leon sagt: "Nein, weniger."
- **Problem erkennen:** Wer hat recht? Festlegung, dann mit einem Beispielpreis ausprobieren.
- **Problem lösen:** Rechenbeispiel mit Faktoren, eigene Lückenrechnung; die richtige Endsumme ist der Code.
- **Aha:** 20 % und 30 % ergeben zusammen nur 44 % Rabatt.
- **Lernprodukt (analog):** Spickzettel "Mehrere Prozentänderungen" mit Faktor-Regel und einem eigenen Beispiel.
- **Check:** Eigene Aufgabe erfinden, bei der die naive Addition falsch wäre; dazu eine Auswahlaufgabe, bei der A die Fehloption "Prozente addieren" ist.

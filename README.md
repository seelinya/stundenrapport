# LAEMU Stundenrapport

Ein Stundenrapport-Erfassungstool im Branding von LAEMU, das die Einträge direkt in das
Google Sheet
[«Stundenrapport»](https://docs.google.com/spreadsheets/d/10PoAB8SqxYJWnmy9jdVE1kav7ygcKsLwatucQoH6jbE/edit)
schreibt – ein Tabellenblatt pro Mitarbeiter:in plus eine automatische Monatsübersicht.

Technisch ist es eine **Google-Apps-Script-Web-App**: kein Server, kein Hosting, keine
Zugangsdaten. Das Skript liegt im Google Sheet selbst und hat dadurch automatisch Zugriff
darauf.

---

## Vorschau ohne Google-Konto

```bash
npm run preview      # erzeugt preview/index.html
```

`preview/index.html` im Browser öffnen: identische Oberfläche und identische Rechenlogik,
die Eingaben landen aber nur im Browser-Speicher statt im Google Sheet.

---

## Einrichtung (einmalig, ca. 5 Minuten)

1. Das [Google Sheet](https://docs.google.com/spreadsheets/d/10PoAB8SqxYJWnmy9jdVE1kav7ygcKsLwatucQoH6jbE/edit)
   öffnen → **Erweiterungen › Apps Script**.
2. Im Apps-Script-Editor die Dateien aus dem Ordner `apps-script/` anlegen und den Inhalt
   1:1 einfügen:

   | Datei im Editor | Typ | Quelle |
   | --- | --- | --- |
   | `Code.gs` | Skript | `apps-script/Code.gs` |
   | `Config.gs` | Skript | `apps-script/Config.gs` |
   | `Calc.gs` | Skript | `apps-script/Calc.gs` |
   | `Sheets.gs` | Skript | `apps-script/Sheets.gs` |
   | `Quotes.gs` | Skript | `apps-script/Quotes.gs` |
   | `Reminders.gs` | Skript | `apps-script/Reminders.gs` |
   | `Index.html` | HTML | `apps-script/Index.html` |
   | `Stylesheet.html` | HTML | `apps-script/Stylesheet.html` |
   | `JavaScript.html` | HTML | `apps-script/JavaScript.html` |

   Unter **Projekteinstellungen** die Option «`appsscript.json`-Manifestdatei im Editor
   anzeigen» aktivieren und den Inhalt von `apps-script/appsscript.json` übernehmen.

   Die Sheet-ID ist in `Config.gs` bereits eingetragen – es ist nichts zu verknüpfen.
3. **Bereitstellen › Neue Bereitstellung › Web-App**
   * Ausführen als: **Ich**
   * Zugriff: **Alle Personen mit Google-Konto**

   Die entstehende URL ist das Tool – am besten als Lesezeichen oder auf dem Handy-Startbildschirm
   speichern.
4. Sheet neu laden → neues Menü **LAEMU Stundenrapport** → **Tabelle einrichten**.
   Damit entstehen die Blätter «Einstellungen», je ein Blatt pro Mitarbeiter:in und
   «Monatsübersicht».
5. Im Blatt **Einstellungen** die E-Mail-Adressen eintragen, danach im Menü
   **Erinnerungs-Trigger installieren** wählen. Ab dann kommt am 1. jedes Monats
   automatisch die Monatsübersicht per Mail.

## Vercel oder eigene Domain

Auf Vercel liegen nur statische Dateien – der Teil, der ins Google Sheet schreibt, läuft
zwingend in Apps Script. Eine Vercel-Domain kann aber als kurze Merk-URL davorgeschaltet
werden:

1. Web-App wie oben bereitstellen und die URL kopieren (endet auf `/exec`).
2. In `index.html` im Wurzelverzeichnis ganz oben `var TOOL_URL = ''` mit dieser URL füllen.
3. Committen – Vercel veröffentlicht automatisch neu, die Domain leitet direkt aufs Tool weiter.

Solange keine URL eingetragen ist, zeigt die Domain eine Startseite mit genau diesen Schritten.
`/preview/index.html` bleibt als Demo erreichbar (rechnet identisch, speichert aber nur im
Browser). Mit `#info` am Ende der Adresse lässt sich die Startseite auch bei gesetzter
Weiterleitung öffnen.

### Alternativ mit clasp

```bash
npm install -g @google/clasp
clasp login
cp .clasp.json.example .clasp.json     # scriptId eintragen
clasp push
```

---

## Aufbau des Tools

| # | Element | Verhalten |
| --- | --- | --- |
| 1 | LAEMU-Logo | Original-Vektor aus den Brand Guidelines (`brand/laemu-logo.svg`) |
| 2 | Lebensspruch | wechselt täglich, innerhalb eines Zyklus wiederholt sich keiner |
| 3 | Mitarbeiter:in | Lian Müller, Niklaus Hess, Selina Strickler – Auswahl wird pro Browser als Standard gespeichert |
| 4 | Datum | frei wählbar inkl. Samstag und Sonntag, Schnellwahl «Heute / Gestern / Vorgestern» |
| 5 | Projekt | Tags Musikschule, Marketing, Shop, Weiteres; darunter Arbeitsbeginn und -ende, Stunden werden dezimal berechnet; beliebig viele Projekte pro Tag |
| 6 | «Weiteres» | Link unter den Projekten: Ferien, Feiertag, Krank, Unfall, Weiteres. Die Stundeneingabe samt Quick Action «Ganzer Tag» erscheint erst, wenn ein Tag gesetzt ist |
| 7 | Pausenzeit | in Minuten, mit Schnellwahl 15/30/45/60 |
| 8 | Total | Arbeitszeit, Abwesenheiten und Feiertagsgutschrift werden laufend zusammengerechnet |
| 9 | Kennzahlen | Überstunden total und – nur bei Lian – die bis zum 31.12. verbleibenden Ferientage |
| 10 | Einreichen | speichert den Tag im Google Sheet |
| 11 | Google Sheet | ein Blatt pro Person, jede Eingabe als eigene Zeile, Monatstotale separat, monatliche Erinnerung |
| 12 | Erfolgsmeldung | «Danke {Vorname}!» mit Tagesrückblick und Hinweis auf fehlende Tage |

---

## So wird gerechnet

* **Sollzeit**: 42 Stunden pro Woche ÷ 5 Arbeitstage = **8.4 Stunden** pro Tag, Montag bis Freitag.
* **Wochenende**: Samstag und Sonntag haben kein Soll. Wer arbeitet, erhält die Stunden
  vollumfänglich als Überstunden gutgeschrieben.
* **Feiertage Kanton Schwyz** (Quelle: [Datensatz des Kantons Schwyz](https://data.sz.ch/explore/dataset/feiertage-kanton-schwyz)):
  Neujahr, Berchtoldstag, Heilige Drei Könige, Josefstag, Karfreitag, Ostermontag, Auffahrt,
  Pfingstmontag, Fronleichnam, Bundesfeier, Mariä Himmelfahrt, Allerheiligen, Mariä Empfängnis,
  Weihnachten, Stephanstag. Beweglichen Feiertage werden pro Jahr aus dem Osterdatum berechnet,
  das Tool ist also nicht an ein bestimmtes Jahr gebunden.
  Fällt ein Feiertag auf Montag bis Freitag, werden 8.4 Stunden gutgeschrieben – auch ohne
  Eintrag. Wer an einem Feiertag arbeitet, erhält die geleisteten Stunden zusätzlich.
* **Überstunden**: Ist minus Soll über den Zeitraum vom **ersten erfassten Tag** (frühestens ab
  Anstellungsbeginn) bis zum zuletzt erfassten Tag, höchstens bis heute. Wer erst später mit dem
  Erfassen beginnt, startet dadurch nicht mit einem Minus. Nicht erfasste Arbeitstage *innerhalb*
  dieses Zeitraums schlagen negativ durch – genau diese Tage listet die Erinnerung auf.
  Bereits bestehende Überstunden lassen sich im Blatt «Einstellungen» als **Startsaldo**
  hinterlegen; sie werden zum Saldo addiert.
* **Ferien**: 25 Arbeitstage pro Kalenderjahr, ein Ferientag entspricht 8.4 Stunden.
  Bei unterjährigem Eintritt anteilig pro Monat: Lian startet am 1. September, hat also
  4 von 12 Monaten × 25 Tage = **8.5 Tage** bis Ende Dezember (auf halbe Tage gerundet).
  Niklaus und Selina sind Inhaber:innen – bei ihnen wird keine Ferienanzeige eingeblendet.

---

## Aufbau der Tabelle

**Blatt pro Mitarbeiter:in** – eine Zeile pro erfasster Information:

`Datum · Wochentag · Art · Projekt/Kategorie · Beginn · Ende · Stunden · Pause (Min) ·
Arbeitszeit Tag · Abwesenheit Tag · Feiertagsgutschrift · Total Tag · Soll Tag · Saldo Tag ·
Ferien (Tage) · Bemerkung · Erfasst am`

Die Tagesspalten stehen jeweils in der ersten Zeile eines Tages. Wird ein Tag erneut
eingereicht, ersetzen die neuen Zeilen die alten – die Tabelle bleibt nach Datum sortiert.

**Blatt «Monatsübersicht»** – pro Person und Monat: Arbeitszeit, Abwesenheiten, Feiertage,
Total Ist, Soll, Saldo Monat, Saldo kumuliert, bezogene Ferientage, erfasste Tage und
fehlende Arbeitstage. Es wird bei jedem Einreichen neu berechnet.

**Blatt «Einstellungen»** – Mitarbeitende, Rolle, Anstellungsbeginn, Pensum, Ferienanspruch,
Ferienanzeige, Startsaldo und E-Mail. Änderungen hier wirken sofort, ohne Code-Anpassung. Neue
Mitarbeitende einfach als Zeile ergänzen und danach im Menü «Tabelle einrichten» ausführen.

---

## Anpassen

| Was | Wo |
| --- | --- |
| Projekt-Tags, Abwesenheits-Tags, Wochenstunden, Ferienanspruch | `apps-script/Config.gs` |
| Mitarbeitende, Pensum, Startsaldo, E-Mail, Anstellungsbeginn | Blatt «Einstellungen» im Google Sheet |
| Lebenssprüche | `apps-script/Quotes.gs` |
| Gestaltung | `apps-script/Stylesheet.html` |
| Text der Monatserinnerung | `apps-script/Reminders.gs` |

### Schriften

Die Markenschrift **Radona Norm** ist nicht frei lizenziert und daher nicht eingebettet.
Die Oberfläche verwendet sie, falls auf dem Gerät installiert, und fällt sonst auf *Figtree*
zurück (nächstliegende freie Geometrische). Für die Dekoschrift steht *Golden Hopes* laut
Brand Guidelines noch aus; bis dahin wird *Caveat* verwendet. Sobald die Lizenzen vorliegen,
genügt ein `@font-face`-Block in `Stylesheet.html`.

---

## Entwicklung

```bash
npm test             # 18 Tests: Feiertage, Soll/Ist, Ferien, Validierung, Tagesspruch
npm run preview      # Vorschau neu bauen
```

Die Rechenlogik in `apps-script/Calc.gs` ist bewusst frei von Google-APIs, damit sie sowohl
in Apps Script als auch in den Tests und in der Vorschau läuft.

```
index.html       Startseite/Weiterleitung für Vercel oder eine eigene Domain
apps-script/     Web-App (Backend .gs + Oberfläche .html)
brand/           Logo und Favicon als Vektor, direkt aus den Brand Guidelines extrahiert
preview/         generierte Vorschau (nicht von Hand bearbeiten)
test/            Tests der Rechenlogik
tools/           Build-Skript der Vorschau
```

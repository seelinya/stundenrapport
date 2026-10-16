# marc-lustenberger – neue Website

Statische One-Page-Website (HTML/CSS/JS, keine Abhängigkeiten, kein Build).
`index.html` im Browser öffnen oder den Ordner auf ein beliebiges Hosting kopieren.

## Aufbau

Mehrere Seiten mit gemeinsamem Header und Footer. Alle Texte sind aus Marcs Sicht (Ich-Form) und per du geschrieben.

Gestaltung: hell mit klaren Linien, Schwarz-Weiss-Fotos und Blau (Logo-Blau `--blue`) als einzige Farbe –
für Buttons, Bildrahmen und CTA-Bänder. Schriften: Lato für Text und Titel (Titel fett, kursiv, Grossbuchstaben),
Roustel nur ganz gezielt (Kinderzitat `x-scribble`, Unterschrift `x-sign`). Die Schriftdateien liegen in `assets/fonts/`, die
Markenregeln in `brand.css` (wird zuletzt geladen). Auf Tablet und Handy blendet sich der Header beim Runterscrollen
aus und erscheint beim Hochscrollen wieder.

Bewegung (`motion.js`): Elemente mit `data-anim` blenden beim Scrollen ein, `data-count` zählt hoch,
`data-words` lässt ein Statement Wort für Wort aufleuchten. Wer im Gerät «Bewegung reduzieren» eingestellt
hat, sieht alles sofort und ohne Animation.

Fotos: Die Bilder in `assets/img/` liegen in Originalgrösse und werden nie grösser angezeigt, damit sie
scharf bleiben. Für grössere Darstellungen braucht es die Originalfotos in höherer Auflösung.

| Seite | Inhalt |
|---|---|
| `index.html` | Startseite: Titelbild, Facts, «Hoi, ich bin Marc» (mit Kinderfoto), Erfolge & Saison (Kommendes oben, Vergangenes ausgeblasst), Sponsoren mit Aufruf, Fanshop |
| `ueber-marc.html` (Über mich) | Wer Marc ist, drei Gründe zum Mitfiebern, wie ihn sein bester Freund beschreibt, Steckbrief, Motto |
| `mein-weg.html` | Alle Stationen von der Kindheit bis heute, jede mit Bild, dazu «Der Plan» bis 2031 |
| `erfolge.html` | Nächste Schwingfeste, Resultate, News und Medienberichte (Daten aus `saison.js`) |
| `sponsoren.html` | Was Sponsoren davon haben, Leistungsausweis, Ablauf, Pakete, aktuelle Sponsoren |
| `fanartikel.html` | Fanartikel; «Bestellen» öffnet `kontakt.html#artikel-<id>` mit vorausgefülltem Warenkorb |
| `kontakt.html` | Kontakt- und Bestellformular, Instagram |

Auf jeder Seite steht über dem Footer das Sponsorenband mit Haupt- und Co-Sponsoren.

### Wöchentlich aktualisieren

Termine, Resultate, News und Medienberichte stehen oben in `saison.js` als einfache Listen. Neue Einträge
oben einfügen – Startseite und Erfolge-Seite zeigen sie automatisch an.

Skripte: `main.js` (Inhalte, Menü, Sponsoren, Fanartikel), `site.js` (Hero-Video, «Mein Weg», Galerie,
Anfrage-Links), `form.js` (Formular), `game.js` (Mini-Spiel). Styles: `styles.css` und `site.css`.

### Platzhalter, Instagram und Video

- «Foto folgt» in «Mein Weg» (Kindheit, Jungschwinger) und in der Galerie (Training, Ernährungsberatung,
  Kraftraum, Körperanalyse, Ferien). Galerie-Kachel ersetzen durch
  `<figure class="gi" data-cat="training"><img src="assets/img/…" alt="…"><figcaption>…</figcaption></figure>`.
- Instagram: Die Kacheln verlinken auf das Profil und zeigen Fotos der Website. Für echte, aktuelle Beiträge
  beim Hosting ein Instagram-Feed-Widget einbinden (Platz ist im Code markiert).
- Hintergrundvideo im Hero: Datei z. B. als `assets/video/hero.mp4` ablegen und im `data-src` des
  `<video id="hero-video">` eintragen.

## Inhalte pflegen

Alles Wiederkehrende steht oben in `main.js`:

- `CONTACT_EMAIL` – Kontaktadresse
- `SPONSORS` – Sponsoren nach Kategorie (Logos in `assets/partner/`, optional mit `url`)
- `PRODUCTS` – Fanartikel mit Preis (`chf`), Grössen und Versandhinweis (Bilder in `assets/img/`)

Das Kontakt- und Bestellformular steckt in `form.js`: Felder je Anliegen, Warenkorb mit
Mengen und T-Shirt-Grössen, Lieferung (Post oder Abholung), Zahlung (TWINT oder Rechnung).
Versandkosten: Abholung gratis, genau 1 T-Shirt CHF 5, sonst CHF 12 (Funktion `shipping`).
Die Website hat kein Backend: Beim Absenden öffnet sich das E-Mail-Programm mit der fertigen
Nachricht an `CONTACT_EMAIL`. Für echten Versand ohne E-Mail-Programm braucht es später einen
Formulardienst beim Hosting.

## Bilder

Die Fotos und Logos in `assets/` sind aus Screenshots von marc-lustenberger.ch
ausgeschnitten und deshalb eher niedrig aufgelöst. Vor dem Livegang durch die
Originaldateien ersetzen (gleiche Dateinamen), vor allem `hero-action.jpg`,
`action-2.jpg`, `action-3.jpg`, die Fanartikel-Bilder und die Sponsorenlogos.

## Quellen der Fakten

marc-lustenberger.ch (Portrait, Sponsoren, Fanartikel, Kontakt), ESV-Schwingerportrait,
schlussgang.ch, SRF Sport, Luzerner Zeitung und Entlebucher Schwingerverband.

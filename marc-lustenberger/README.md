# marc-lustenberger – neue Website

Statische One-Page-Website (HTML/CSS/JS, keine Abhängigkeiten, kein Build).
`index.html` im Browser öffnen oder den Ordner auf ein beliebiges Hosting kopieren.

## Aufbau

Zwei Seiten:

- `index.html` – Startseite: Hero mit bewegtem Hintergrund (Fotos blenden ineinander, Sägemehl
  fliegt), Steckbrief, «Über Marc», der Werdegang in zehn Stationen
  vom Schnuppertraining bis zum Ziel ESAF 2028, Motto, Kranz-Bilanz, Mini-Spiel, News,
  Partner-Teaser, Fanartikel und Kontakt.
- `partner.html` – für Sponsoren: Warum Marc, die drei Pakete aus dem Sponsoringdossier, aktuelle
  Partner und Anfrage. Die Anfrage-Buttons öffnen das Formular auf der Startseite bereits ausgefüllt
  (z. B. `index.html#anfrage-hauptsponsor`).

Skripte: `main.js` (Inhalte, Menü, Sponsoren, Fanartikel), `journey.js` (Hero, Kapitel, Kranz-Bilanz),
`form.js` (Formular), `game.js` (Mini-Spiel). Styles: `styles.css` und `journey.css`.

### Platzhalter und Video

- «Foto folgt»-Platzhalter im Werdegang (Kindheit, Jungschwinger) und in der Galerie (Training,
  Ernährungsberatung, Routine, Körperanalyse, Ferien). In der Galerie eine Kachel ersetzen durch
  `<figure class="gi" data-cat="training"><img src="assets/img/…" alt="…"><figcaption>…</figcaption></figure>`.
- Hintergrundvideo im Hero: Datei z. B. als `assets/video/hero.mp4` ablegen und den Pfad im
  `data-src` des `<video id="hero-video">` eintragen. Ohne Video blenden die Fotos ineinander.

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

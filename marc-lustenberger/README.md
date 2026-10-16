# marc-lustenberger – neue Website

Statische One-Page-Website (HTML/CSS/JS, keine Abhängigkeiten, kein Build).
`index.html` im Browser öffnen oder den Ordner auf ein beliebiges Hosting kopieren.

## Aufbau

Mehrere Seiten mit gemeinsamem Header und Footer:

| Seite | Inhalt |
|---|---|
| `index.html` | Startseite: Hero, Steckbrief, «Warum man Marc die Daumen drückt», Erfolge, «Mein Weg» (Auszug, blätterbar), «Was es braucht» (Einblicke-Auszug), Mini-Spiel, Partner, News, Instagram |
| `ueber-marc.html` | Wer Marc ist, drei Gründe zum Mitfiebern, wie ihn sein bester Freund beschreibt, Steckbrief, Motto |
| `mein-weg.html` | Alle Stationen von der Kindheit bis heute, jede mit Bild |
| `einblicke.html` | Galerie mit Filter (Wettkampf, Training, Alltag) und Grossansicht |
| `partner.html` | Was Partner davon haben, Leistungsausweis, Ablauf, Pakete, aktuelle Partner |
| `fanartikel.html` | Fanartikel; «Bestellen» öffnet `kontakt.html#artikel-<id>` mit vorausgefülltem Warenkorb |
| `kontakt.html` | Kontakt- und Bestellformular, Instagram |

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

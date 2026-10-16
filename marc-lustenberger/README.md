# marc-lustenberger – neue Website

Statische One-Page-Website (HTML/CSS/JS, keine Abhängigkeiten, kein Build).
`index.html` im Browser öffnen oder den Ordner auf ein beliebiges Hosting kopieren.

## Aufbau

Hero · Steckbrief · Über mich · Statement · Mini-Spiel «Schwing gegen Marc» · Erfolge · Kraft/Technik/Kopf · News · Sponsoren · Fanartikel · Kontakt

Das Mini-Spiel steckt in `game.js` (Canvas, keine Abhängigkeiten). Schwierigkeit und Dauer
stehen oben in der Datei (`LEVELS`, `DURATION`, `TAP`).

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

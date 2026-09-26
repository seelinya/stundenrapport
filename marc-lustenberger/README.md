# marc-lustenberger – neue Website

Statische One-Page-Website (HTML/CSS/JS, keine Abhängigkeiten, kein Build).
`index.html` direkt im Browser öffnen oder den Ordner auf ein beliebiges Hosting kopieren.

## Aufbau

Die Seite ist wie ein Schwingfest gegliedert – die Gang-Anzeige unten links zeigt, wo man steht:

| Abschnitt            | Inhalt                                                  |
|----------------------|---------------------------------------------------------|
| Anschwingen          | Hero, «Zwei Seiten. Ein Marc.» (im Ring / nach dem Gang) |
| 1. Gang · Herkunft   | Hasle, Entlebuch, Weg zum Eidgenossen                   |
| 2. Gang · Erfolge    | Kennzahlen und Meilensteine 2025/2026                   |
| 3. Gang · Saison     | News mit Links zu den Quellen                           |
| 4. Gang · Mindset    | Kraft, Technik, Kopf + Schwinger-ABC                    |
| 5. Gang · Partner    | Partner und Kooperationsformate                         |
| Schlussgang · Kontakt| Formular (öffnet das E-Mail-Programm) und Adresse       |

## Vor dem Livegang

1. **Bilder** nach `assets/img/` legen – Dateinamen und Motive siehe `assets/img/README.md`.
   Die Fotos werden per CSS in Schwarz-Weiss mit Körnung umgesetzt.
2. **Partner** in `main.js` im Array `PARTNERS` eintragen, Logos nach `assets/partner/`.
3. **Kontaktadresse** in `main.js` (`CONTACT_EMAIL`) prüfen.
4. **Zahlen** prüfen: «31 Kränze total» stammt aus dem ESV-Portrait (Stand 2026).

## Quellen der Fakten

ESV-Schwingerportrait, schlussgang.ch, SRF Sport, Luzerner Zeitung und Entlebucher
Schwingerverband (erster Kranzfestsieg Sachseln 01.06.2025, eidg. Kranz ESAF 2025 Mollis,
8 Kränze 2025, Festsieg ISAF Arth 05.07.2026).

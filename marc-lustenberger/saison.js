/* Saison: Termine, Resultate, News und Medienberichte
   ----------------------------------------------------------------------------
   Diese Datei während der Saison wöchentlich pflegen. Neue Einträge einfach
   oben in die jeweilige Liste einfügen. Daten im Format JJJJ-MM-TT.
   ---------------------------------------------------------------------------- */
(function () {
  "use strict";

  // Kommende Schwingfeste. Beispiel:
  // { date: "2027-05-09", name: "Luzerner Kantonales Schwingfest", place: "Ort LU", note: "Kranzfest" },
  var TERMINE = [];

  // Resultate (neueste zuerst)
  var RESULTATE = [
    { date: "2026-07-05", name: "Innerschweizer Schwing- und Älplerfest", place: "Arth", rank: "1a", note: "Festsieg – Schlussgang gegen Samuel Schwyzer gestellt" },
    { date: "2025-08-31", name: "Eidgenössisches Schwing- und Älplerfest", place: "Mollis", rank: "Kranz", note: "Eidgenössischer Kranz – Neueidgenosse" },
    { date: "2025-06-01", name: "Ob- und Nidwaldner Kantonales", place: "Sachseln", rank: "1.", note: "Erster Kranzfestsieg – sechs Gänge, sechs Siege" },
    { date: "2023", name: "Unspunnen-Schwinget", place: "Interlaken", rank: "7.", note: "Vier Siege, ein Gestellter, eine Niederlage" }
  ];

  // News (neueste zuerst)
  var NEWS = [
    { date: "2026-07", tag: "Festsieg", title: "Doppelsieg am Innerschweizer in Arth", text: "Marc und Samuel Schwyzer teilen sich nach gestelltem Schlussgang den Festsieg.", url: "https://www.srf.ch/sport/mehr-sport/schwingen/innerschweizer-schwingfest-lustenberger-und-schwyzer-teilen-festsieg-in-arth", src: "SRF Sport" },
    { date: "2026", tag: "Heimat", title: "Empfang im Entlebuch", text: "Der Entlebucher Schwingerverband lädt zum Empfang für Marc.", url: "https://entlebucher-schwingerverband.ch/2026/empfang-marc-lustenberger/", src: "Entlebucher SV" },
    { date: "2025-09", tag: "Neueidgenosse", title: "Einzug nach dem Eidgenössischen", text: "Die Heimat empfängt Marc mit dem Eichenlaub aus Mollis.", url: "https://entlebucher-schwingerverband.ch/2025/einzug-fuer-marc-lustenberger/", src: "Entlebucher SV" },
    { date: "2025-06", tag: "Interview", title: "Schwinger der Woche", text: "Nach dem ersten Kranzfestsieg: Marc über Sachseln und den Schlussgang gegen einen Jugendfreund.", url: "https://www.schlussgang.ch/aktuell/im-interview-marc-lustenberger-zum-ersten-kranzfestsieg", src: "Schlussgang" }
  ];

  // Medienberichte
  var MEDIEN = [
    { src: "SRF Sport", title: "Lustenberger und Schwyzer teilen Festsieg in Arth", date: "Juli 2026", url: "https://www.srf.ch/sport/mehr-sport/schwingen/innerschweizer-schwingfest-lustenberger-und-schwyzer-teilen-festsieg-in-arth" },
    { src: "Luzerner Zeitung", title: "Marc Lustenberger und Samuel Schwyzer gewinnen das Innerschweizer in Arth", date: "Juli 2026", url: "https://www.luzernerzeitung.ch/sport/zentralschweiz/isaf-2026-arth-marc-lustenberger-und-samuel-schwyzer-gewinnen-fest-ld.4197055" },
    { src: "Tele1", title: "Zwei Sieger am ISAF in Arth", date: "Juli 2026", url: "https://www.tele1.ch/nachrichten/zwei-sieger-am-isaf-in-arth-lustenberger-und-schwyzer-stellen-im-schlussgang-164726543" },
    { src: "Tele1", title: "So feiert Marc Lustenberger seinen ersten Kranzfestsieg", date: "Juni 2025", url: "https://www.tele1.ch/nachrichten/so-feiert-marc-lustenberger-seinen-ersten-kranzfestsieg-160862589" },
    { src: "Schlussgang", title: "Im Interview: Marc Lustenberger zum ersten Kranzfestsieg", date: "Juni 2025", url: "https://www.schlussgang.ch/aktuell/im-interview-marc-lustenberger-zum-ersten-kranzfestsieg" }
  ];

  /* ------------------------------------------------------------------------ */

  var MONTHS = ["Jan.", "Feb.", "März", "April", "Mai", "Juni", "Juli", "Aug.", "Sept.", "Okt.", "Nov.", "Dez."];
  function fmt(d) {
    var p = d.split("-");
    if (p.length === 3) return parseInt(p[2], 10) + ". " + MONTHS[parseInt(p[1], 10) - 1] + " " + p[0];
    if (p.length === 2) return MONTHS[parseInt(p[1], 10) - 1] + " " + p[0];
    return p[0];
  }
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function link(url, text, cls) {
    var a = el("a", cls, text); a.href = url; a.target = "_blank"; a.rel = "noopener"; return a;
  }

  function renderTermine(box, max) {
    if (!box) return;
    var today = new Date().toISOString().slice(0, 10);
    var list = TERMINE.filter(function (t) { return t.date >= today; }).sort(function (a, b) { return a.date < b.date ? -1 : 1; });
    if (max) list = list.slice(0, max);
    if (!list.length) {
      var e = el("div", "cal__empty");
      e.appendChild(el("strong", null, "Saisonkalender 2027"));
      e.appendChild(el("span", null, "Die Schwingfeste der neuen Saison erscheinen hier, sobald die Einteilungen feststehen."));
      box.appendChild(e);
      return;
    }
    var ul = el("ul", "cal__list");
    list.forEach(function (t) {
      var li = el("li", "cal__item");
      var d = new Date(t.date + "T12:00:00");
      var date = el("span", "cal__date");
      date.appendChild(el("b", null, String(d.getDate())));
      date.appendChild(el("span", null, MONTHS[d.getMonth()]));
      li.appendChild(date);
      var info = el("span", "cal__info");
      info.appendChild(el("strong", null, t.name));
      info.appendChild(el("span", null, [t.place, t.note].filter(Boolean).join(" · ")));
      li.appendChild(info);
      ul.appendChild(li);
    });
    box.appendChild(ul);
  }

  function renderResultate(box, max) {
    if (!box) return;
    var ul = el("ul", "res__list");
    (max ? RESULTATE.slice(0, max) : RESULTATE).forEach(function (r) {
      var li = el("li", "res__item");
      li.appendChild(el("span", "res__rank", r.rank));
      var info = el("span", "res__info");
      info.appendChild(el("strong", null, r.name));
      info.appendChild(el("span", null, fmt(r.date) + " · " + r.place));
      if (r.note) info.appendChild(el("em", null, r.note));
      li.appendChild(info);
      ul.appendChild(li);
    });
    box.appendChild(ul);
  }

  function renderNews(box, max) {
    if (!box) return;
    (max ? NEWS.slice(0, max) : NEWS).forEach(function (n) {
      var a = el("article", "card");
      a.appendChild(el("p", "card__meta", fmt(n.date) + " · " + n.tag));
      a.appendChild(el("h3", null, n.title));
      a.appendChild(el("p", null, n.text));
      if (n.url) a.appendChild(link(n.url, n.src || "Mehr", "card__link"));
      box.appendChild(a);
    });
  }

  function renderMedien(box) {
    if (!box) return;
    var ul = el("ul", "media__list");
    MEDIEN.forEach(function (m) {
      var li = el("li");
      var a = link(m.url, null, "media__item");
      a.appendChild(el("span", "media__src", m.src));
      a.appendChild(el("strong", null, m.title));
      a.appendChild(el("span", "media__date", m.date));
      li.appendChild(a);
      ul.appendChild(li);
    });
    box.appendChild(ul);
  }

  function max(id) { var n = document.getElementById(id); return n ? +n.getAttribute("data-max") || 0 : 0; }
  renderTermine(document.getElementById("termine"), max("termine"));
  renderResultate(document.getElementById("resultate"), max("resultate"));
  renderNews(document.getElementById("news-list"), max("news-list"));
  renderMedien(document.getElementById("medien"));
})();

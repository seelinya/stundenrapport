/* Marc Lustenberger – Seitenlogik */
(function () {
  "use strict";

  /* ------------------------------------------------------------------
     INHALTE ZUM PFLEGEN
     ------------------------------------------------------------------ */

  var CONTACT_EMAIL = "kontakt@marc-lustenberger.ch";

  // Sponsoren nach Kategorie, wie auf marc-lustenberger.ch.
  // url ist optional – ist sie gesetzt, wird das Logo verlinkt.
  var SPONSORS = [
    { tier: "Hauptsponsoren", main: true, items: [
      { name: "Convicta Treuhand AG", logo: "convicta.png" },
      { name: "Lehner Versand", logo: "lehner.png" }
    ]},
    { tier: "Co-Sponsoren", items: [
      { name: "Bucher Hasle", logo: "bucher.png" },
      { name: "Kia Bucher Hasle", logo: "kia-bucher.png" },
      { name: "Lehn Brennholz Service Entlebuch", logo: "lehn-holz.png" },
      { name: "Kunz Sportshop Willisau", logo: "kunz.png" },
      { name: "Bacher", logo: "bacher.png" },
      { name: "Transport AG Entlebuch", logo: "transport-entlebuch.png" }
    ]},
    { tier: "Ausrüster", items: [
      { name: "Syform Advanced Nutrition", logo: "syform.png" },
      { name: "Kunz Sportshop Willisau", logo: "kunz.png" },
      { name: "Alltex – bestickt.ch, bedruckt.ch", logo: "alltex.png" }
    ]},
    { tier: "Partner", items: [
      { name: "MedX Athletics", logo: "medx.png" },
      { name: "die Mobiliar, Generalagentur Willisau-Entlebuch", logo: "mobiliar.png" }
    ]},
    { tier: "Begleiter", items: [
      { name: "Kanton Luzern", logo: "kanton-luzern.png" },
      { name: "Spitzensport Schweizer Armee", logo: "spitzensport-armee.png" },
      { name: "In & Out Cross Athletics", logo: "cross-athletics.png" }
    ]},
    { tier: "Verbände", items: [
      { name: "Innerschweizer Schwingerverband", logo: "isv.png" },
      { name: "Entlebucher Schwingerverband", logo: "entlebucher-sv.png" },
      { name: "Luzerner Kantonaler Schwingerverband", logo: "lksv.png" }
    ]}
  ];

  // Fanartikel, wie auf marc-lustenberger.ch.
  // chf = Preis pro Stück; sizes = wählbare Grössen (leer = Einheitsgrösse).
  var PRODUCTS = [
    { id: "shirt", name: "T-Shirt", img: "fan-shirt.jpg", text: "Hochwertiges T-Shirt aus 100 % Baumwolle.", chf: 45, sizes: ["S", "M", "L", "XL", "XXL"], ship: "Versand CHF 5.00 bei 1 Shirt, ab 2 Shirts CHF 12.00" },
    { id: "cap-team", name: "Cap Team Lustenberger", img: "fan-cap-team.jpg", text: "Sehr hochwertiges Cap mit braunem Stick. Einheitsgrösse.", chf: 30, ship: "Versand CHF 12.00" },
    { id: "cap", name: "Cap", img: "fan-cap.jpg", text: "Sehr hochwertiges Cap mit beigem Stick. Einheitsgrösse.", chf: 30, ship: "Versand CHF 12.00" },
    { id: "kalender", name: "Jahreskalender 2026", img: "fan-kalender.jpg", text: "12 Bilder der Saison 2025, Frontseite handsigniert. A3.", chf: 25, ship: "Versand CHF 12.00" },
    { id: "autogramm", name: "Autogrammkarte", img: "fan-autogramm.jpg", text: "Frankiertes, adressiertes C5-Kuvert senden an: Marc Lustenberger, Buechmatt 2, 6166 Hasle.", chf: 0, ship: "gegen frankiertes Rückkuvert", noOrder: true }
  ];

  // Kalender: kommende Schwingfeste. Während der Saison wöchentlich pflegen (Datum JJJJ-MM-TT).
  // Beispiel: { date: "2027-05-09", name: "Luzerner Kantonales", place: "Ort LU" },
  var TERMINE = [];

  // Letzte Resultate (neueste zuerst) – erscheinen im Kalender unter den Terminen
  var RESULTATE = [
    { date: "2026-07-05", name: "Innerschweizer Schwingfest", place: "Arth", rank: "1a", note: "Festsieg" },
    { date: "2025-08-31", name: "Eidgenössisches", place: "Mollis", rank: "Kranz", note: "Eidgenosse" },
    { date: "2025-06-01", name: "Ob- und Nidwaldner Kantonales", place: "Sachseln", rank: "1.", note: "Erster Festsieg" }
  ];

  // News (neueste zuerst)
  var NEWS = [
    { date: "2026-07", tag: "Festsieg", title: "Doppelsieg am Innerschweizer in Arth", text: "Gestellter Schlussgang gegen Samuel Schwyzer – zwei Festsieger.", url: "https://www.srf.ch/sport/mehr-sport/schwingen/innerschweizer-schwingfest-lustenberger-und-schwyzer-teilen-festsieg-in-arth", src: "SRF Sport" },
    { date: "2026", tag: "Heimat", title: "Empfang im Entlebuch", text: "Der Entlebucher Schwingerverband lädt zum Empfang.", url: "https://entlebucher-schwingerverband.ch/2026/empfang-marc-lustenberger/", src: "Entlebucher SV" },
    { date: "2025-06", tag: "Interview", title: "Schwinger der Woche", text: "Nach dem ersten Kranzfestsieg in Sachseln.", url: "https://www.schlussgang.ch/aktuell/im-interview-marc-lustenberger-zum-ersten-kranzfestsieg", src: "Schlussgang" }
  ];

  // Für das Bestellformular (form.js)
  window.MARC = { CONTACT_EMAIL: CONTACT_EMAIL, PRODUCTS: PRODUCTS };

  /* ------------------------------------------------------------------ */

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text) n.textContent = text;
    return n;
  }

  // --- Header & Menü ----------------------------------------------------
  var head = document.getElementById("head");
  var burger = document.getElementById("burger");
  var menu = document.getElementById("menu");

  function setMenu(open) {
    burger.setAttribute("aria-expanded", String(open));
    menu.classList.toggle("is-open", open);
    document.body.style.overflow = open ? "hidden" : "";
  }
  burger.addEventListener("click", function () { setMenu(burger.getAttribute("aria-expanded") !== "true"); });
  menu.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });

  var links = Array.prototype.slice.call(menu.querySelectorAll("a[href^='#']"));
  var targets = links.map(function (a) { return document.querySelector(a.getAttribute("href")); });
  var ticking = false, lastY = 0;
  function onScroll() {
    ticking = false;
    var y = window.scrollY || window.pageYOffset;
    head.classList.toggle("is-solid", y > 60);
    // Tablet & Handy: beim Runterscrollen ausblenden, beim Hochscrollen wieder zeigen
    var compact = window.matchMedia("(max-width: 1140px)").matches;
    var menuOpen = burger.getAttribute("aria-expanded") === "true";
    if (compact && !menuOpen && y > 120 && y > lastY + 4) head.classList.add("is-hidden");
    else if (!compact || menuOpen || y < lastY - 4 || y <= 120) head.classList.remove("is-hidden");
    lastY = y;
    var active = -1;
    targets.forEach(function (t, i) { if (t && t.getBoundingClientRect().top < window.innerHeight * .4) active = i; });
    links.forEach(function (a, i) { a.classList.toggle("is-active", i === active); });
  }
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  // --- Sponsoren --------------------------------------------------------
  var tiers = document.getElementById("tiers");
  SPONSORS.forEach(function (group) {
    var tier = el("div", "tier" + (group.main ? " tier--main" : ""));
    tier.appendChild(el("h3", "tier__name", group.tier));
    var ul = el("ul", "tier__logos");
    group.items.forEach(function (s) {
      var li = el("li");
      var tile = el(s.url ? "a" : "div", "logo-tile");
      if (s.url) { tile.href = s.url; tile.target = "_blank"; tile.rel = "noopener"; }
      var img = el("img");
      img.src = "assets/logos/" + s.logo; img.alt = s.name; img.loading = "lazy";
      tile.title = s.name;
      tile.appendChild(img);
      li.appendChild(tile);
      ul.appendChild(li);
    });
    tier.appendChild(ul);
    tiers.appendChild(tier);
  });

  // --- Kalender & News ------------------------------------------------
  var MONTHS = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];
  var MONTHS_LONG = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
  var cal = document.getElementById("kalender");
  if (cal) {
    var today = new Date().toISOString().slice(0, 10);
    var next = TERMINE.filter(function (t) { return t.date >= today; }).sort(function (a, b) { return a.date < b.date ? -1 : 1; });
    var calItem = function (date, title, sub, badge, cls) {
      var li = el("li", "m-cal__item " + cls);
      var d = el("span", "m-cal__date");
      var p = date.split("-");
      d.appendChild(el("b", null, p[2] ? String(parseInt(p[2], 10)) : "–"));
      d.appendChild(el("span", null, (p[1] ? MONTHS[parseInt(p[1], 10) - 1] + " " : "") + p[0]));
      li.appendChild(d);
      var info = el("span", "m-cal__info");
      info.appendChild(el("strong", null, title));
      info.appendChild(el("span", null, sub));
      li.appendChild(info);
      if (badge) li.appendChild(el("span", "m-cal__badge", badge));
      cal.appendChild(li);
    };
    if (!next.length) {
      var li0 = el("li", "m-cal__item m-cal__item--next");
      var d0 = el("span", "m-cal__date"); d0.appendChild(el("b", null, "27")); d0.appendChild(el("span", null, "Saison"));
      li0.appendChild(d0);
      var i0 = el("span", "m-cal__info");
      i0.appendChild(el("strong", null, "Saison 2027"));
      i0.appendChild(el("span", null, "Meine Schwingfeste folgen, sobald die Einteilungen feststehen."));
      li0.appendChild(i0);
      li0.appendChild(el("span", "m-cal__badge", "Demnächst"));
      cal.appendChild(li0);
    }
    next.slice(0, 4).forEach(function (t, i) { calItem(t.date, t.name, t.place, i === 0 ? "Nächstes Fest" : "", "m-cal__item--next"); });
    RESULTATE.slice(0, 3).forEach(function (r) { calItem(r.date, r.name, r.place + " · " + r.note, r.rank, "m-cal__item--past"); });
  }
  var newsList = document.getElementById("news-list");
  if (newsList) NEWS.slice(0, 3).forEach(function (n) {
    var a = el("a", "m-newsitem");
    a.href = n.url; a.target = "_blank"; a.rel = "noopener";
    var p = n.date.split("-");
    a.appendChild(el("span", "m-newsitem__meta", (p[1] ? MONTHS_LONG[parseInt(p[1], 10) - 1] + " " : "") + p[0] + " · " + n.tag));
    a.appendChild(el("strong", null, n.title));
    a.appendChild(el("span", "m-newsitem__text", n.text));
    a.appendChild(el("span", "m-newsitem__src", n.src));
    newsList.appendChild(a);
  });

  // --- Fanartikel -------------------------------------------------------
  var products = document.getElementById("products");
  if (products) PRODUCTS.forEach(function (p) {
    var li = el("li", "product");
    var img = el("img");
    img.src = "assets/img/" + p.img; img.alt = p.name; img.loading = "lazy";
    li.appendChild(img);
    var body = el("div", "product__body");
    body.appendChild(el("h3", null, p.name));
    body.appendChild(el("p", null, p.text));
    var price = el("p", "product__price", p.chf ? "CHF " + p.chf.toFixed(2) : "Gratis");
    price.appendChild(el("small", null, p.ship));
    body.appendChild(price);
    if (!p.noOrder) {
      var a = el("a", "product__order", "Bestellen");
      a.href = "#kontakt";
      a.setAttribute("data-product", p.id);
      body.appendChild(a);
    } else {
      body.appendChild(el("span"));
    }
    li.appendChild(body);
    products.appendChild(li);
  });

  // --- Kontakt ----------------------------------------------------------
  var mail = document.getElementById("mail");
  if (mail) mail.textContent = CONTACT_EMAIL;
  if (mail && document.getElementById("copy")) document.getElementById("copy").addEventListener("click", function (e) {
    var btn = e.currentTarget;
    var fallback = function () {
      var r = document.createRange(); r.selectNodeContents(mail);
      var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
      btn.textContent = "Markiert";
    };
    try {
      navigator.clipboard.writeText(CONTACT_EMAIL).then(function () {
        btn.textContent = "Kopiert";
        setTimeout(function () { btn.textContent = "Kopieren"; }, 1800);
      }, fallback);
    } catch (err) { fallback(); }
  });


  // --- Eye-Catcher -----------------------------------------------------
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Laufbänder nahtlos machen: Inhalt verdoppeln
  var ticker = document.querySelector(".ticker__track");
  if (ticker) ticker.innerHTML += ticker.innerHTML;

  var marquee = document.getElementById("marquee");
  if (marquee) {
    var seen = {};
    SPONSORS.forEach(function (g) { g.items.forEach(function (s) {
      if (seen[s.logo]) return; seen[s.logo] = true;
      var img = el("img"); img.src = "assets/logos/" + s.logo; img.alt = ""; marquee.appendChild(img);
    }); });
    marquee.innerHTML += marquee.innerHTML;
  }

  // Zahlen hochzählen
  function countUp(node) {
    var target = parseInt(node.getAttribute("data-count"), 10);
    if (reduce || !target) return;
    var start = null, dur = 1400;
    function step(t) {
      if (start === null) start = t;
      var k = Math.min(1, (t - start) / dur);
      node.textContent = String(Math.round(target * (1 - Math.pow(1 - k, 3))));
      if (k < 1) requestAnimationFrame(step);
    }
    node.textContent = "0";
    requestAnimationFrame(step);
  }

  // Reveals: nur Elemente, die beim Laden noch unterhalb des Bildschirms liegen
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var t = en.target;
        t.classList.add("is-in");
        t.classList.remove("is-armed");
        if (t.classList.contains("numbers")) {
          t.querySelectorAll("[data-count]").forEach(countUp);
          t.querySelectorAll(".num").forEach(function (n) { n.classList.add("is-in"); });
        }
        io.unobserve(t);
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });

    document.querySelectorAll(".rv, .rv-group, .band").forEach(function (n) {
      if (n.getBoundingClientRect().top > window.innerHeight && !reduce) n.classList.add("is-armed");
      io.observe(n);
    });
  } else {
    document.querySelectorAll(".rv, .rv-group, .band, .num").forEach(function (n) { n.classList.add("is-in"); });
  }

  // Parallax & Scroll-Fortschritt
  var bandImg = document.querySelector(".band__img");
  var band = document.querySelector(".band");
  var aboutImg = document.querySelector(".about__photo img");
  var heroImg = document.querySelector(".hero__img");
  var raf = false;
  function parallax() {
    raf = false;
    var vh = window.innerHeight;
    var y = window.scrollY || 0;
    var max = document.documentElement.scrollHeight - vh;
    head.style.setProperty("--progress", (max > 0 ? (y / max) * 100 : 0) + "%");
    if (reduce) return;
    if (heroImg && y < vh * 1.2) heroImg.style.transform = "translateY(" + (y * 0.25) + "px) scale(1.05)";
    if (band && bandImg) {
      var r = band.getBoundingClientRect();
      if (r.bottom > 0 && r.top < vh) bandImg.style.transform = "translateY(" + ((r.top + r.height / 2 - vh / 2) * -0.12) + "px)";
    }
    if (aboutImg) {
      var a = aboutImg.getBoundingClientRect();
      if (a.bottom > 0 && a.top < vh) aboutImg.style.transform = "translateY(" + ((a.top + a.height / 2 - vh / 2) * -0.06) + "px)";
    }
  }
  window.addEventListener("scroll", function () { if (!raf) { raf = true; requestAnimationFrame(parallax); } }, { passive: true });
  parallax();


  // Statement: Wörter werden beim Scrollen nacheinander weiss
  var statement = document.getElementById("statement");
  if (statement && !reduce) {
    statement.innerHTML = statement.textContent.split(" ").map(function (w) {
      return '<span class="w">' + w + '</span>';
    }).join(" ");
    var words = statement.querySelectorAll(".w");
    statement.classList.add("is-live");
    var paintWords = function () {
      var r = statement.getBoundingClientRect(), vh = window.innerHeight;
      var k = Math.max(0, Math.min(1, (vh * .9 - r.top) / (r.height * .75)));
      var n = Math.round(k * words.length);
      for (var i = 0; i < words.length; i++) words[i].classList.toggle("on", i < n);
    };
    window.addEventListener("scroll", paintWords, { passive: true });
    paintWords();
  }

  // Paket-Buttons: Kontaktformular mit dem gewählten Paket vorbereiten
  document.querySelectorAll("[data-pack]").forEach(function (a) {
    a.addEventListener("click", function () {
      var topic = document.getElementById("t-spons");
      if (topic && !topic.checked) { topic.checked = true; topic.dispatchEvent(new Event("change", { bubbles: true })); }
      var spons = document.getElementById("i-spons");
      if (spons && !spons.checked) { spons.checked = true; spons.dispatchEvent(new Event("change", { bubbles: true })); }
      var msg = document.getElementById("f-msg");
      if (msg && !msg.value.trim()) msg.value = "Hoi Marc, mich interessiert das Paket «" + a.getAttribute("data-pack") + "». Lass uns gerne bei einem Kafi darüber reden.";
    });
  });

  // Slider Erfolge & Ziele: Pfeile scrollen um eine Karte
  var slider = document.querySelector("[data-slider]");
  if (slider) {
    var stepS = function () { var c = slider.querySelector(".m-card"); return c ? c.getBoundingClientRect().width + 16 : 320; };
    var navBtns = document.querySelectorAll(".m-slider__btn");
    var updS = function () {
      var max = slider.scrollWidth - slider.clientWidth - 2;
      navBtns.forEach(function (b) { b.disabled = b.getAttribute("data-dir") === "-1" ? slider.scrollLeft <= 2 : slider.scrollLeft >= max; });
    };
    navBtns.forEach(function (b) {
      b.addEventListener("click", function () { slider.scrollBy({ left: stepS() * parseInt(b.getAttribute("data-dir"), 10), behavior: reduce ? "auto" : "smooth" }); });
    });
    slider.addEventListener("scroll", function () { requestAnimationFrame(updS); }, { passive: true });
    window.addEventListener("resize", updS);
    updS();
  }

  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
})();

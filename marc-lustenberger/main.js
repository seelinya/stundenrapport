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
  var PRODUCTS = [
    { name: "T-Shirt", img: "fan-shirt.jpg", text: "Hochwertiges T-Shirt aus 100 % Baumwolle.", price: "CHF 45.00", ship: "Versand CHF 5.00 bei 1 Shirt, ab 2 Shirts CHF 12.00" },
    { name: "Cap Team Lustenberger", img: "fan-cap-team.jpg", text: "Sehr hochwertiges Cap mit braunem Stick. Einheitsgrösse.", price: "CHF 30.00", ship: "Versand CHF 12.00" },
    { name: "Cap", img: "fan-cap.jpg", text: "Sehr hochwertiges Cap mit beigem Stick. Einheitsgrösse.", price: "CHF 30.00", ship: "Versand CHF 12.00" },
    { name: "Jahreskalender 2026", img: "fan-kalender.jpg", text: "12 Bilder der Saison 2025, Frontseite handsigniert. A3.", price: "CHF 25.00", ship: "Versand CHF 12.00" },
    { name: "Autogrammkarte", img: "fan-autogramm.jpg", text: "Frankiertes, adressiertes C5-Kuvert senden an: Marc Lustenberger, Buechmatt 2, 6166 Hasle.", price: "Gratis", ship: "gegen frankiertes Rückkuvert", noOrder: true }
  ];

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
  var ticking = false;
  function onScroll() {
    ticking = false;
    var y = window.scrollY || window.pageYOffset;
    head.classList.toggle("is-solid", y > 60);
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
      img.src = "assets/partner/" + s.logo; img.alt = s.name; img.loading = "lazy";
      tile.title = s.name;
      tile.appendChild(img);
      li.appendChild(tile);
      ul.appendChild(li);
    });
    tier.appendChild(ul);
    tiers.appendChild(tier);
  });

  // --- Fanartikel -------------------------------------------------------
  var products = document.getElementById("products");
  PRODUCTS.forEach(function (p) {
    var li = el("li", "product");
    var img = el("img");
    img.src = "assets/img/" + p.img; img.alt = p.name; img.loading = "lazy";
    li.appendChild(img);
    var body = el("div", "product__body");
    body.appendChild(el("h3", null, p.name));
    body.appendChild(el("p", null, p.text));
    var price = el("p", "product__price", p.price);
    price.appendChild(el("small", null, p.ship));
    body.appendChild(price);
    if (!p.noOrder) {
      var a = el("a", "product__order", "Bestellen");
      a.href = "#kontakt";
      a.setAttribute("data-topic", "Fanartikel");
      a.setAttribute("data-message", "Ich möchte bestellen: 1× " + p.name + "\nLieferung oder Abholung: \nZahlung (TWINT, bar, Einzahlungsschein): \nAdresse: ");
      body.appendChild(a);
    } else {
      body.appendChild(el("span"));
    }
    li.appendChild(body);
    products.appendChild(li);
  });

  // --- Kontakt ----------------------------------------------------------
  var mail = document.getElementById("mail");
  mail.textContent = CONTACT_EMAIL;
  var msgField = document.getElementById("f-msg");

  document.addEventListener("click", function (e) {
    var a = e.target.closest("[data-topic]");
    if (!a) return;
    var radio = document.querySelector(".form__topics input[value='" + a.getAttribute("data-topic") + "']");
    if (radio) radio.checked = true;
    var m = a.getAttribute("data-message");
    if (m && !msgField.value.trim()) msgField.value = m;
  });

  document.getElementById("copy").addEventListener("click", function (e) {
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

  var form = document.getElementById("form");
  var status = document.getElementById("status");
  var emailOk = function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); };

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var d = new FormData(form);
    var name = String(d.get("name") || "").trim();
    var from = String(d.get("mail") || "").trim();
    var msg = String(d.get("msg") || "").trim();
    var topic = String(d.get("topic") || "Anfrage");

    if (!name || !emailOk(from) || !msg) {
      status.textContent = "Bitte Name, eine gültige E-Mail-Adresse und eine Nachricht angeben.";
      document.getElementById(!name ? "f-name" : !emailOk(from) ? "f-mail" : "f-msg").focus();
      return;
    }

    var href = "mailto:" + CONTACT_EMAIL +
      "?subject=" + encodeURIComponent(topic + " – " + name) +
      "&body=" + encodeURIComponent(msg + "\n\n" + name + "\n" + from);

    status.textContent = "Dein E-Mail-Programm öffnet sich mit der fertigen Nachricht. Falls nicht, schreib direkt an ";
    var a = el("a", null, CONTACT_EMAIL);
    a.href = href;
    status.append(a, ".");
    window.location.href = href;
  });

  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
})();

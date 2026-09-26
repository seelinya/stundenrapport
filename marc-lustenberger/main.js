/* Marc Lustenberger – Seitenlogik */
(function () {
  "use strict";

  /* ------------------------------------------------------------------
     INHALTE ZUM PFLEGEN
     ------------------------------------------------------------------ */

  // Kontaktadresse – vor dem Livegang mit der Adresse von marc-lustenberger.ch abgleichen.
  var CONTACT_EMAIL = "info@marc-lustenberger.ch";

  // Partner & Sponsoren – aus der bestehenden Website übernehmen.
  // tier: z. B. "Hauptpartner", "Co-Partner", "Ausrüster", "Gönner"
  // logo: Pfad zu einer Logodatei in assets/partner/ (SVG oder PNG, idealerweise einfarbig)
  // note: ein Satz, was die Partnerschaft ausmacht (optional)
  var PARTNERS = [
    // { name: "Firmenname", tier: "Hauptpartner", logo: "assets/partner/firma.svg", url: "https://…", note: "…" },
  ];

  /* ------------------------------------------------------------------ */

  var root = document.documentElement;
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // --- Generierte Texturen: Sägemehl und Filmkörnung --------------------
  function makeCanvas(w, h) {
    var c = document.createElement("canvas");
    c.width = w; c.height = h;
    return c;
  }

  function sawdustTexture() {
    var size = 420, c = makeCanvas(size, size), g = c.getContext("2d");
    if (!g) return null;
    var tones = ["#f3e6c2", "#e2cc93", "#c9a868", "#b08a4c", "#fff4d8", "#9c7a44"];
    for (var i = 0; i < 2600; i++) {
      var x = Math.random() * size, y = Math.random() * size;
      var len = 1 + Math.random() * Math.random() * 9;
      var wid = .6 + Math.random() * 1.8;
      g.save();
      g.translate(x, y);
      g.rotate(Math.random() * Math.PI);
      g.globalAlpha = .25 + Math.random() * .6;
      g.fillStyle = tones[(Math.random() * tones.length) | 0];
      g.beginPath();
      g.ellipse(0, 0, len, wid, 0, 0, Math.PI * 2);
      g.fill();
      g.restore();
    }
    return c.toDataURL("image/png");
  }

  function grainTexture() {
    var size = 180, c = makeCanvas(size, size), g = c.getContext("2d");
    if (!g) return null;
    var img = g.createImageData(size, size), d = img.data;
    for (var i = 0; i < d.length; i += 4) {
      var v = (Math.random() * 255) | 0;
      d[i] = d[i + 1] = d[i + 2] = v;
      d[i + 3] = 255;
    }
    g.putImageData(img, 0, 0);
    return c.toDataURL("image/png");
  }

  try {
    var saw = sawdustTexture(), grain = grainTexture();
    if (saw) root.style.setProperty("--saw-tex", "url(" + saw + ")");
    if (grain) root.style.setProperty("--grain", "url(" + grain + ")");
  } catch (e) { /* Texturen sind Dekoration */ }

  // --- Bilder: fehlt eine Datei, bleibt der Sägemehl-Rahmen sichtbar ----
  document.querySelectorAll(".shot").forEach(function (fig) {
    var img = fig.querySelector("img");
    if (!img) return;
    var fail = function () { fig.classList.add("is-empty"); };
    if (img.complete && img.naturalWidth === 0) fail();
    img.addEventListener("error", fail);
  });

  // --- Navigation ------------------------------------------------------
  var nav = document.getElementById("nav");
  var toggle = document.getElementById("navtoggle");
  var links = document.getElementById("navlinks");

  function setMenu(open) {
    toggle.setAttribute("aria-expanded", String(open));
    links.classList.toggle("is-open", open);
    document.body.style.overflow = open ? "hidden" : "";
  }
  toggle.addEventListener("click", function () {
    setMenu(toggle.getAttribute("aria-expanded") !== "true");
  });
  links.addEventListener("click", function (e) {
    if (e.target.closest("a")) setMenu(false);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") setMenu(false);
  });

  // --- Gang-Anzeige & Scroll-Zustand -----------------------------------
  var gang = document.getElementById("gang");
  var gangNo = document.getElementById("gangno");
  var gangBar = document.getElementById("gangbar");
  var sections = Array.prototype.slice.call(document.querySelectorAll("[data-gang]"));
  var navAnchors = Array.prototype.slice.call(links.querySelectorAll("a[href^='#']"));
  var ticking = false;

  function onScroll() {
    ticking = false;
    var y = window.scrollY || window.pageYOffset;
    var vh = window.innerHeight;
    nav.classList.toggle("is-solid", y > 40);
    gang.classList.toggle("is-visible", y > vh * .6);

    var current = sections[0];
    for (var i = 0; i < sections.length; i++) {
      if (sections[i].getBoundingClientRect().top <= vh * .45) current = sections[i];
    }
    var label = current.getAttribute("data-gang");
    if (gangNo.textContent !== label) gangNo.textContent = label;

    var max = document.documentElement.scrollHeight - vh;
    gangBar.style.width = (max > 0 ? Math.min(100, (y / max) * 100) : 0) + "%";

    var id = current.id || (current.previousElementSibling && current.previousElementSibling.id);
    navAnchors.forEach(function (a) {
      a.classList.toggle("is-active", a.getAttribute("href") === "#" + id);
    });
  }
  window.addEventListener("scroll", function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  // --- Leichter Parallax auf dem Hero-Bild -----------------------------
  var heroImg = document.querySelector(".shot--hero img");
  if (heroImg && !reduceMotion) {
    window.addEventListener("scroll", function () {
      var y = window.scrollY || 0;
      if (y < window.innerHeight * 1.2) heroImg.style.transform = "translateY(" + (y * 0.08) + "px) scale(1.04)";
    }, { passive: true });
  }

  // --- Partner ----------------------------------------------------------
  var list = document.getElementById("partners");
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text) n.textContent = text;
    return n;
  }
  PARTNERS.forEach(function (p) {
    var li = el("li");
    var card = el(p.url ? "a" : "div", "partner-card");
    if (p.url) { card.href = p.url; card.target = "_blank"; card.rel = "noopener"; }
    card.appendChild(el("span", "partner-card__tier", p.tier || "Partner"));
    var logo = el("span", "partner-card__logo");
    if (p.logo) {
      var img = el("img");
      img.src = p.logo; img.alt = p.name; img.loading = "lazy";
      logo.appendChild(img);
    } else {
      logo.appendChild(el("span", "partner-card__name", p.name));
    }
    card.appendChild(logo);
    card.appendChild(el("span", "partner-card__note", p.note || (p.logo ? p.name : "")));
    li.appendChild(card);
    list.appendChild(li);
  });
  // Immer am Schluss: der offene Platz
  (function () {
    var li = el("li");
    var card = el("a", "partner-card partner-card--open");
    card.href = "#kontakt";
    card.setAttribute("data-topic", "Partnerschaft");
    card.appendChild(el("span", "partner-card__tier", "Platz im Team"));
    var logo = el("span", "partner-card__logo");
    logo.appendChild(el("span", "partner-card__name", PARTNERS.length ? "Ihr Betrieb?" : "Partner werden"));
    card.appendChild(logo);
    card.appendChild(el("span", "partner-card__note", "Für die Saison 2027 und darüber hinaus."));
    li.appendChild(card);
    list.appendChild(li);
  })();

  // --- Kontakt ----------------------------------------------------------
  var mail = document.getElementById("mail");
  mail.textContent = CONTACT_EMAIL;

  document.getElementById("copy").addEventListener("click", function (e) {
    var btn = e.currentTarget;
    var done = function () { btn.textContent = "Kopiert"; setTimeout(function () { btn.textContent = "Kopieren"; }, 1800); };
    var fallback = function () {
      var r = document.createRange(); r.selectNodeContents(mail);
      var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
      btn.textContent = "Markiert";
    };
    try {
      navigator.clipboard.writeText(CONTACT_EMAIL).then(done, fallback);
    } catch (err) { fallback(); }
  });

  // Links mit data-topic wählen im Formular gleich das passende Anliegen
  document.addEventListener("click", function (e) {
    var a = e.target.closest("[data-topic]");
    if (!a) return;
    var topic = a.getAttribute("data-topic");
    var radio = document.querySelector(".form__topics input[value='" + topic + "']");
    if (radio) radio.checked = true;
  });

  var form = document.getElementById("form");
  var status = document.getElementById("status");
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var data = new FormData(form);
    var name = String(data.get("name") || "").trim();
    var from = String(data.get("mail") || "").trim();
    var msg = String(data.get("msg") || "").trim();
    var org = String(data.get("org") || "").trim();
    var topic = String(data.get("topic") || "Anfrage");

    if (!name || !msg || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(from)) {
      status.textContent = "Bitte Name, eine gültige E-Mail-Adresse und eine Nachricht angeben.";
      var first = !name ? "f-name" : (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(from) ? "f-mail" : "f-msg");
      document.getElementById(first).focus();
      return;
    }

    var subject = topic + " – " + name + (org ? " (" + org + ")" : "");
    var body = msg + "\n\n" + name + (org ? "\n" + org : "") + "\n" + from;
    var href = "mailto:" + CONTACT_EMAIL + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);

    status.textContent = "";
    status.append("Dein E-Mail-Programm öffnet sich mit der fertigen Nachricht. Falls nicht, sende sie direkt an ");
    var a = el("a", null, CONTACT_EMAIL);
    a.href = href;
    status.append(a, ".");
    window.location.href = href;
  });

  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
})();

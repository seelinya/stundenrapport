/* Startseite: Hero-Hintergrund, Werdegang-Navigation, Anfrage-Links */
(function () {
  "use strict";

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (id) { return document.getElementById(id); };

  // --- Hero: Fotos blenden ineinander (wie ein ruhiges Video) ------------------
  var slides = $("slides");
  if (slides && !reduce) {
    var imgs = slides.querySelectorAll("img"), cur = 0;
    setInterval(function () {
      if (document.hidden) return;
      imgs[cur].classList.remove("is-on");
      cur = (cur + 1) % imgs.length;
      // Animation neu starten
      void imgs[cur].offsetWidth;
      imgs[cur].classList.add("is-on");
    }, 7000);
  }

  // Optionales Hintergrundvideo: nur zeigen, wenn die Datei existiert und abspielt
  var video = $("hero-video");
  if (video) {
    var vsrc = video.getAttribute("data-src");
    if (reduce || !vsrc) { video.remove(); }
    else {
      var drop = function () { if (video.parentNode) video.remove(); };
      video.addEventListener("error", drop);
      video.src = vsrc;
      video.addEventListener("playing", function () { video.classList.add("is-playing"); });
      video.preload = "auto";
      try { video.load(); var pr = video.play(); if (pr && pr.catch) pr.catch(drop); } catch (e) { drop(); }
    }
  }

  // Sägemehl, das langsam durchs Bild fliegt
  var dust = $("dust");
  if (dust && dust.getContext && !reduce) {
    var dctx = dust.getContext("2d"), parts = [], dw = 0, dh = 0, dpr = 1, heroVisible = true;
    var resize = function () {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      dw = dust.clientWidth; dh = dust.clientHeight;
      dust.width = dw * dpr; dust.height = dh * dpr;
      var n = Math.round(Math.min(140, dw * dh / 9000));
      parts = [];
      for (var i = 0; i < n; i++) parts.push(newPart(true));
    };
    var newPart = function (anywhere) {
      return {
        x: Math.random() * dw, y: anywhere ? Math.random() * dh : dh + 10,
        vx: (Math.random() - 0.3) * 14, vy: -(8 + Math.random() * 26),
        l: 1.5 + Math.random() * 4.5, a: Math.random() * Math.PI, va: (Math.random() - 0.5) * 1.6,
        o: 0.25 + Math.random() * 0.5, c: Math.random() < 0.5 ? "232,214,170" : "205,180,131"
      };
    };
    var lastT = 0;
    var tick = function (t) {
      var dt = Math.min(0.05, (t - (lastT || t)) / 1000); lastT = t;
      if (heroVisible && !document.hidden) {
        dctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        dctx.clearRect(0, 0, dw, dh);
        for (var i = 0; i < parts.length; i++) {
          var p = parts[i];
          p.x += p.vx * dt; p.y += p.vy * dt; p.a += p.va * dt;
          if (p.y < -10 || p.x < -10 || p.x > dw + 10) parts[i] = p = newPart(false);
          dctx.save(); dctx.translate(p.x, p.y); dctx.rotate(p.a);
          dctx.fillStyle = "rgba(" + p.c + "," + p.o + ")";
          dctx.fillRect(-p.l / 2, -1, p.l, 2);
          dctx.restore();
        }
      }
      requestAnimationFrame(tick);
    };
    resize();
    window.addEventListener("resize", resize);
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (en) { heroVisible = en[0].isIntersecting; }).observe(dust);
    }
    requestAnimationFrame(tick);
  }

  // --- Eigenschaften: Wörter leuchten nacheinander auf -------------------------
  var values = $("values");
  if (values && !reduce) {
    var items = values.querySelectorAll("li"), hot = [];
    setInterval(function () {
      if (document.hidden) return;
      if (hot.length >= 3) hot.shift().classList.remove("is-hot");
      var next;
      do { next = items[Math.floor(Math.random() * items.length)]; } while (hot.indexOf(next) >= 0);
      next.classList.add("is-hot"); hot.push(next);
    }, 1100);
  }

  // --- Werdegang: aktive Station und Fortschritt --------------------------------
  var chapters = $("chapters"), jbar = $("jbar"), jnav = $("jnav");
  if (chapters && jnav) {
    var links = Array.prototype.slice.call(jnav.querySelectorAll("a"));
    var chaps = links.map(function (a) { return document.querySelector(a.getAttribute("href")); });
    var onJ = function () {
      var r = chapters.getBoundingClientRect(), vh = window.innerHeight;
      var k = Math.max(0, Math.min(1, (vh * 0.5 - r.top) / r.height));
      if (jbar) jbar.style.height = (k * 100) + "%";
      var active = 0;
      chaps.forEach(function (c, i) { if (c && c.getBoundingClientRect().top < vh * 0.5) active = i; });
      links.forEach(function (a, i) { a.classList.toggle("is-active", i === active); });
    };
    window.addEventListener("scroll", function () { requestAnimationFrame(onJ); }, { passive: true });
    onJ();
  }

  // --- Kranz-Bilanz: 28 Kränze nach Art ----------------------------------------
  var grid = $("kranz-grid");
  if (grid) {
    var KRAENZE = [["eidg", 1], ["tv", 6], ["berg", 5], ["kant", 16]];
    var i = 0;
    KRAENZE.forEach(function (k) {
      for (var n = 0; n < k[1]; n++) {
        var s = document.createElement("span");
        s.className = "kz kz--" + k[0];
        s.style.setProperty("--i", i++);
        s.innerHTML = '<svg viewBox="0 0 40 40"><use href="#kranz"/></svg>';
        grid.appendChild(s);
      }
    });
    if ("IntersectionObserver" in window && !reduce && grid.getBoundingClientRect().top > window.innerHeight) {
      grid.classList.add("is-armed");
      var io = new IntersectionObserver(function (en) {
        if (!en[0].isIntersecting) return;
        grid.classList.remove("is-armed"); grid.classList.add("is-in"); io.disconnect();
      }, { threshold: 0.3 });
      io.observe(grid);
    }
    var legend = $("kranz-legend");
    if (legend) {
      legend.querySelectorAll("li").forEach(function (li) {
        li.tabIndex = 0;
        li.setAttribute("role", "button");
        var on = function () { grid.setAttribute("data-focus", li.getAttribute("data-type")); legend.querySelectorAll("li").forEach(function (x) { x.classList.toggle("is-on", x === li); }); };
        var off = function () { grid.removeAttribute("data-focus"); li.classList.remove("is-on"); };
        li.addEventListener("mouseenter", on); li.addEventListener("mouseleave", off);
        li.addEventListener("focus", on); li.addEventListener("blur", off);
        li.addEventListener("click", function () { if (li.classList.contains("is-on")) off(); else on(); });
      });
    }
  }

  // Zahlen der Kranz-Bilanz hochzählen
  var facts = document.querySelector(".kranz__facts");
  if (facts && "IntersectionObserver" in window && !reduce) {
    var nums = facts.querySelectorAll("[data-count]");
    var io2 = new IntersectionObserver(function (en) {
      if (!en[0].isIntersecting) return;
      io2.disconnect();
      nums.forEach(function (n) {
        var target = parseInt(n.getAttribute("data-count"), 10), start = null;
        var step = function (t) {
          if (start === null) start = t;
          var k = Math.min(1, (t - start) / 1200);
          n.textContent = String(Math.round(target * (1 - Math.pow(1 - k, 3))));
          if (k < 1) requestAnimationFrame(step);
        };
        n.textContent = "0"; requestAnimationFrame(step);
      });
    }, { threshold: 0.4 });
    if (facts.getBoundingClientRect().top > window.innerHeight) io2.observe(facts);
  }


  // --- Werdegang: Pfeile zum Blättern -------------------------------------------
  var track = $("path-track"), prev = $("path-prev"), next = $("path-next");
  if (track && prev && next) {
    var stepW = function () { var f = track.querySelector(".step"); return f ? f.getBoundingClientRect().width + 24 : 300; };
    var upd = function () {
      prev.disabled = track.scrollLeft < 8;
      next.disabled = track.scrollLeft + track.clientWidth > track.scrollWidth - 8;
    };
    prev.addEventListener("click", function () { track.scrollBy({ left: -stepW(), behavior: reduce ? "auto" : "smooth" }); });
    next.addEventListener("click", function () { track.scrollBy({ left: stepW(), behavior: reduce ? "auto" : "smooth" }); });
    track.addEventListener("scroll", function () { requestAnimationFrame(upd); }, { passive: true });
    window.addEventListener("resize", upd);
    upd();
  }

  // --- Galerie: Filter und Lightbox -------------------------------------------------
  var gal = $("gal"), filter = $("gal-filter");
  if (gal && filter) {
    filter.addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return;
      var f = b.getAttribute("data-f");
      filter.querySelectorAll("button").forEach(function (x) { x.classList.toggle("is-on", x === b); x.setAttribute("aria-pressed", String(x === b)); });
      gal.querySelectorAll(".gi").forEach(function (g) { g.hidden = f !== "alle" && g.getAttribute("data-cat") !== f; });
    });
    var lb = $("lb"), lbImg = $("lb-img"), lbCap = $("lb-cap"), lastFocus = null;
    var close = function () { lb.hidden = true; document.body.style.overflow = ""; if (lastFocus) lastFocus.focus(); };
    gal.querySelectorAll(".gi img").forEach(function (img) {
      img.tabIndex = 0;
      var open = function () {
        lastFocus = img;
        lbImg.src = img.currentSrc || img.src; lbImg.alt = img.alt;
        var cap = img.parentNode.querySelector("figcaption"); lbCap.textContent = cap ? cap.textContent : "";
        lb.hidden = false; document.body.style.overflow = "hidden"; $("lb-close").focus();
      };
      img.addEventListener("click", open);
      img.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } });
    });
    $("lb-close").addEventListener("click", close);
    lb.addEventListener("click", function (e) { if (e.target === lb) close(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !lb.hidden) close(); });
  }

  // --- Direktlinks von der Partner-Seite: Formular vorausfüllen -----------------
  // z. B. index.html#anfrage-hauptsponsor
  var PACKS = { "anfrage-hauptsponsor": "Hauptsponsor", "anfrage-cosponsor": "Co-Sponsor", "anfrage-partner": "Partner", "anfrage-sponsoring": "" };
  function prefill() {
    var key = (location.hash || "").slice(1);
    if (!(key in PACKS)) return;
    var radio = document.querySelector("input[name='topic'][value='Sponsoring']");
    if (!radio) return;
    radio.checked = true;
    radio.dispatchEvent(new Event("change", { bubbles: true }));
    var spons = document.getElementById("i-spons");
    if (spons) spons.checked = true;
    var msg = document.getElementById("f-msg");
    if (msg && PACKS[key] && !msg.value.trim()) msg.value = "Ich interessiere mich für das Paket «" + PACKS[key] + "».\n\n";
    var k = document.getElementById("kontakt");
    if (k) setTimeout(function () { k.scrollIntoView({ behavior: reduce ? "auto" : "smooth" }); }, 60);
  }
  window.addEventListener("load", prefill);
  window.addEventListener("hashchange", prefill);
})();

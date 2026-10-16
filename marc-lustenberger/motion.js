/* Marc Lustenberger – Bewegung
   Einblenden beim Scrollen, Zähler, Wort-für-Wort-Statement, leichte Parallaxe.
   Bei «Bewegung reduzieren» ist alles sofort sichtbar und still. */
(function () {
  "use strict";
  var root = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var saveData = navigator.connection && navigator.connection.saveData;

  // Hintergrundvideo (YouTube, stumm, Schlaufe, schwarz-weiss per CSS).
  // Ohne Bewegung oder im Datensparmodus bleibt das Standbild.
  var yt = document.querySelector("[data-yt]");
  if (yt && !reduce && !saveData) {
    var id = yt.getAttribute("data-yt");
    var f = document.createElement("iframe");
    f.src = "https://www.youtube-nocookie.com/embed/" + id + "?autoplay=1&mute=1&loop=1&playlist=" + id +
      "&controls=0&disablekb=1&modestbranding=1&playsinline=1&rel=0&iv_load_policy=3&fs=0";
    f.title = "Hintergrundvideo";
    f.allow = "autoplay; encrypted-media; picture-in-picture";
    f.setAttribute("tabindex", "-1");
    f.setAttribute("aria-hidden", "true");
    f.addEventListener("load", function () { setTimeout(function () { yt.classList.add("is-on"); }, 1400); });
    yt.appendChild(f);
  }

  if (reduce || !("IntersectionObserver" in window)) { root.classList.add("no-motion"); return; }
  root.classList.add("motion");

  // Einblenden beim Scrollen
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add("is-in");
      io.unobserve(e.target);
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
  document.querySelectorAll("[data-anim]").forEach(function (n) { io.observe(n); });

  // Zähler
  var cio = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      cio.unobserve(e.target);
      var n = e.target, end = parseInt(n.getAttribute("data-count"), 10), t0 = null, dur = 1300;
      var step = function (t) {
        if (!t0) t0 = t;
        var p = Math.min(1, (t - t0) / dur), eased = 1 - Math.pow(1 - p, 3);
        n.textContent = String(Math.round(end * eased));
        if (p < 1) requestAnimationFrame(step);
      };
      n.textContent = "0";
      requestAnimationFrame(step);
    });
  }, { threshold: 0.6 });
  document.querySelectorAll("[data-count]").forEach(function (n) { cio.observe(n); });

  // Statement: Wörter leuchten beim Scrollen nacheinander auf
  var statements = [];
  document.querySelectorAll("[data-words]").forEach(function (p) {
    var words = p.textContent.trim().split(/\s+/);
    p.setAttribute("aria-label", p.textContent.trim());
    p.textContent = "";
    var spans = words.map(function (w, i) {
      var s = document.createElement("span");
      s.textContent = w;
      s.setAttribute("aria-hidden", "true");
      p.appendChild(s);
      if (i < words.length - 1) p.appendChild(document.createTextNode(" "));
      return s;
    });
    statements.push({ el: p, spans: spans });
  });

  // Parallaxe für Titelbilder
  var px = Array.prototype.slice.call(document.querySelectorAll(".x-hero__photo img, .x-phead__photo img"));

  var ticking = false;
  function frame() {
    ticking = false;
    var vh = window.innerHeight;
    statements.forEach(function (s) {
      var r = s.el.getBoundingClientRect();
      var p = (vh * 0.85 - r.top) / (r.height + vh * 0.35);
      var lit = Math.round(Math.max(0, Math.min(1, p)) * s.spans.length);
      s.spans.forEach(function (w, i) { w.classList.toggle("on", i < lit); });
    });
    if (window.innerWidth > 760) px.forEach(function (img) {
      var r = img.parentNode.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      img.style.transform = "translateY(" + (r.top * -0.06).toFixed(1) + "px) scale(1.06)";
    });
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  frame();
})();

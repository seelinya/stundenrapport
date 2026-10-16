/* Landing Page «Tauch ein ins Sägemehl»
   Sägemehlstaub im Licht, Spotlight folgt der Maus, der Ring wächst beim Scrollen,
   Kapitel blenden ein und werden farbig. Bei «Bewegung reduzieren» bleibt alles ruhig. */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var root = document.documentElement;

  // --- Sägemehlstaub --------------------------------------------------------
  var canvas = document.getElementById("dust");
  var ctx = canvas && canvas.getContext ? canvas.getContext("2d") : null;
  var dots = [], W = 0, H = 0, dpr = 1, mx = 0, my = 0;
  function size() {
    if (!ctx) return;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var n = Math.round(Math.min(140, W * H / 11000));
    dots = [];
    for (var i = 0; i < n; i++) dots.push({
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 1.8 + .4, z: Math.random() * .8 + .2,
      vx: (Math.random() - .5) * .15, vy: -(Math.random() * .25 + .05),
      a: Math.random() * .5 + .2, warm: Math.random() < .7
    });
  }
  function draw() {
    if (!ctx) return;
    ctx.clearRect(0, 0, W, H);
    for (var i = 0; i < dots.length; i++) {
      var d = dots[i];
      if (!reduce) {
        d.x += d.vx * d.z; d.y += d.vy * d.z;
        if (d.y < -10) { d.y = H + 10; d.x = Math.random() * W; }
        if (d.x < -10) d.x = W + 10; else if (d.x > W + 10) d.x = -10;
      }
      var px = d.x + (mx - W / 2) * .02 * d.z, py = d.y + (my - H / 2) * .02 * d.z;
      ctx.beginPath();
      ctx.fillStyle = d.warm ? "rgba(238,226,200," + d.a + ")" : "rgba(167,185,198," + d.a + ")";
      ctx.arc(px, py, d.r * d.z + .3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  var running = true;
  function loop() { if (!running) return; draw(); requestAnimationFrame(loop); }
  size();
  if (reduce) draw(); else requestAnimationFrame(loop);
  window.addEventListener("resize", function () { size(); if (reduce) draw(); });
  document.addEventListener("visibilitychange", function () {
    if (reduce) return;
    running = !document.hidden;
    if (running) requestAnimationFrame(loop);
  });

  // --- Spotlight folgt der Maus ---------------------------------------------
  window.addEventListener("pointermove", function (e) {
    mx = e.clientX; my = e.clientY;
    root.style.setProperty("--mx", e.clientX + "px");
    root.style.setProperty("--my", e.clientY + "px");
  }, { passive: true });

  // --- Ring wächst, Worte erscheinen -----------------------------------------
  var zoom = document.querySelector(".sw-zoom");
  var circle = document.querySelector(".sw-zoom__circle");
  var words = document.querySelectorAll(".sw-zoom__text span");
  function onScroll() {
    if (!zoom || reduce) return;
    var r = zoom.getBoundingClientRect();
    var total = r.height - window.innerHeight;
    var p = Math.max(0, Math.min(1, -r.top / (total || 1)));
    circle.style.setProperty("--p", p.toFixed(3));
    for (var i = 0; i < words.length; i++) words[i].classList.toggle("on", p > .12 + i * .22);
  }
  window.addEventListener("scroll", function () { requestAnimationFrame(onScroll); }, { passive: true });
  onScroll();

  // --- Kapitel: einblenden, dann farbig ---------------------------------------
  var chaps = document.querySelectorAll("[data-chap]");
  if (reduce || !("IntersectionObserver" in window)) {
    chaps.forEach(function (c) { c.classList.add("in", "lit"); });
  } else {
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (e) {
        e.target.classList.toggle("lit", e.intersectionRatio > .55);
        if (e.isIntersecting) e.target.classList.add("in");
      });
    }, { threshold: [0, .2, .55, .8] });
    chaps.forEach(function (c) { io.observe(c); });
  }
})();

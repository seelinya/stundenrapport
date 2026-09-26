/* Mini-Spiel «Schwing gegen Marc»
   Klicken, tippen oder Leertaste gibt Marc Kraft. Erreicht die Kraftanzeige das Ende,
   legt Marc den Gegner mit dem Wyberhaken ins Sägemehl. Läuft die Zeit ab: gestellt. */
(function () {
  "use strict";

  var canvas = document.getElementById("ring");
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext("2d");
  var W = canvas.width, H = canvas.height, GROUND = 618, CX = W / 2, S = 1.45;

  var arena = document.getElementById("arena");
  var overlay = document.getElementById("overlay");
  var ovTitle = document.getElementById("ov-title");
  var ovText = document.getElementById("ov-text");
  var startBtn = document.getElementById("start");
  var timerEl = document.getElementById("timer");
  var foeName = document.getElementById("foe-name");
  var tapHint = document.getElementById("tap-hint");
  var bestEl = document.getElementById("best");
  var statusEl = document.getElementById("game-status");
  var fab = document.getElementById("fab");

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var LEVELS = [
    { name: "Jungschwinger",  push: 0.10, surge: 0.10 },
    { name: "Kranzschwinger", push: 0.17, surge: 0.17 },
    { name: "Eidgenosse",     push: 0.23, surge: 0.24 }
  ];
  var DURATION = 12, TAP = 0.055;

  var C = {
    blue: "#5A7A92", blueDark: "#3F5B70", ink: "#151A1F",
    foe: "#D3DAE0", trouser: "#2A2F35", zwilch: "#DCC69C", zwilchDark: "#B89C6A",
    skin: "#EBC6A2", skin2: "#E3BA94", hairMarc: "#C9A66E", hairFoe: "#4A3527",
    saw: "#E6D3A8", sawDark: "#CDB483"
  };

  // --- Zustand ---------------------------------------------------------
  var state = "idle";      // idle | play | win | draw
  var level = 0, pos = 0, shown = 0, timeLeft = DURATION, t = 0, endT = 0, jolt = 0;
  var particles = [];
  var landed = false;

  // Zuschauer und Sägemehl-Körner einmalig erzeugen
  var crowd = [], dust = [];
  (function () {
    var rows = 5;
    for (var r = 0; r < rows; r++) {
      for (var x = 30 + (r % 2) * 22; x < W; x += 44) {
        crowd.push({ x: x + Math.random() * 10, y: 150 + r * 46, r: 13 + Math.random() * 3, s: Math.random() * 6, c: 0.72 + Math.random() * 0.18 });
      }
    }
    for (var i = 0; i < 420; i++) {
      var a = Math.random() * Math.PI * 2, d = Math.sqrt(Math.random());
      dust.push({ x: CX + Math.cos(a) * d * 600, y: 640 + Math.sin(a) * d * 72, l: 2 + Math.random() * 5, a: Math.random() * Math.PI, c: Math.random() < 0.5 ? C.sawDark : "#F3E6C6" });
    }
  })();

  function best(lv) {
    try { var v = localStorage.getItem("ml-best-" + lv); return v ? parseFloat(v) : null; } catch (e) { return null; }
  }
  function saveBest(lv, v) {
    try { localStorage.setItem("ml-best-" + lv, String(v)); } catch (e) { /* kein Speicher */ }
  }
  function showBest() {
    var b = best(level);
    bestEl.innerHTML = "";
    bestEl.append("Deine Bestzeit gegen den " + LEVELS[level].name + ": ");
    var s = document.createElement("strong");
    s.textContent = b ? b.toFixed(1) + " s" : "–";
    bestEl.appendChild(s);
  }

  // --- Zeichnen -------------------------------------------------------------
  function line(x1, y1, x2, y2, w, col) {
    ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  }
  function circle(x, y, r, col) { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); }
  function rrect(x, y, w, h, r, col) {
    ctx.fillStyle = col; ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x, y, w, h, r); else ctx.rect(x, y, w, h);
    ctx.fill();
  }

  function drawBackground(cheer) {
    var g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "#F4F7F9"); g.addColorStop(0.55, "#E9EFF3"); g.addColorStop(1, "#DCE5EC");
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

    // Tribüne
    rrect(0, 125, W, 260, 0, "#DCE4EA");
    crowd.forEach(function (p) {
      var jump = cheer ? Math.abs(Math.sin(t * 9 + p.s)) * 12 : Math.sin(t * 1.5 + p.s) * 1.2;
      var shade = Math.round(150 + p.c * 60);
      ctx.fillStyle = "rgb(" + (shade - 25) + "," + (shade - 8) + "," + shade + ")";
      ctx.beginPath(); ctx.arc(p.x, p.y - jump, p.r, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(p.x, p.y + p.r + 12 - jump, p.r * 1.35, p.r, 0, Math.PI, 0); ctx.fill();
    });
    rrect(0, 380, W, 8, 0, "#C7D3DC");

    // Sägemehlring
    ctx.fillStyle = "#CDB483";
    ctx.beginPath(); ctx.ellipse(CX, 646, 624, 88, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = C.saw;
    ctx.beginPath(); ctx.ellipse(CX, 640, 610, 80, 0, 0, Math.PI * 2); ctx.fill();
    dust.forEach(function (d) {
      ctx.save(); ctx.translate(d.x, d.y); ctx.rotate(d.a);
      ctx.fillStyle = d.c; ctx.fillRect(-d.l / 2, -1, d.l, 2); ctx.restore();
    });
  }

  // Schwinger in lokalen Koordinaten (Füsse bei 0/0, Blick nach rechts)
  function drawWrestler(o) {
    ctx.save();
    ctx.translate(o.x, GROUND - (o.lift || 0));
    ctx.rotate(o.rot || 0);
    ctx.scale(o.facing * S, S);

    var lean = o.lean;
    var hx = -12, hy = -120;
    var sx = hx + Math.sin(lean) * 118, sy = hy - Math.cos(lean) * 118;
    var kx = sx + Math.sin(lean) * 44, ky = sy - Math.cos(lean) * 44;

    // Schatten
    if (!o.rot) { ctx.fillStyle = "rgba(90,70,40,.18)"; ctx.beginPath(); ctx.ellipse(-8, 4, 70, 12, 0, 0, Math.PI * 2); ctx.fill(); }

    // Beine & Schuhe
    line(hx, hy, -46, -4, 30, C.trouser);
    line(hx, hy, 30, -4, 30, C.trouser);
    rrect(-66, -14, 38, 16, 7, "#F2F2F2");
    rrect(18, -14, 38, 16, 7, "#F2F2F2");

    // hinterer Arm
    if (o.arms === "grip") line(sx - 8, sy + 6, 58, -108, 20, shade(o.shirt));

    // Oberkörper
    line(hx, hy, sx, sy, 64, o.shirt);

    // Zwilchhose mit Gurt
    rrect(hx - 48, hy - 28, 96, 58, 14, C.zwilch);
    rrect(hx - 48, hy - 16, 96, 8, 3, C.zwilchDark);
    rrect(hx - 44, hy + 18, 40, 10, 4, C.zwilchDark);
    rrect(hx + 4, hy + 18, 40, 10, 4, C.zwilchDark);

    // Kopf
    circle(kx, ky, 29, o.skin);
    ctx.fillStyle = o.hair;
    ctx.beginPath(); ctx.arc(kx, ky, 30, Math.PI * 1.02 + lean * 0.4, Math.PI * 1.98 + lean * 0.4); ctx.fill();
    circle(kx + 13, ky - 2, 3.2, C.ink); // Auge

    // vorderer Arm
    if (o.arms === "grip") {
      line(sx, sy, 74, -118, 22, o.shirt);
      circle(74, -118, 12, o.skin);
    } else if (o.arms === "up") {
      line(sx, sy, sx - 34, sy - 108, 22, o.shirt); circle(sx - 34, sy - 112, 13, o.skin);
      line(sx, sy, sx + 30, sy - 112, 22, o.shirt); circle(sx + 30, sy - 116, 13, o.skin);
    } else {
      line(sx, sy, sx + 34, sy + 60, 22, o.shirt); circle(sx + 34, sy + 64, 12, o.skin);
    }
    ctx.restore();
  }
  function shade(hex) { return hex === C.blue ? C.blueDark : "#B7C1C9"; }

  function drawBar() {
    var bw = 560, bx = CX - bw / 2, by = 686;
    rrect(bx, by, bw, 16, 8, "rgba(255,255,255,.85)");
    var f = (shown + 1) / 2;
    rrect(bx, by, Math.max(16, bw * f), 16, 8, C.blue);
    rrect(CX - 2, by - 5, 4, 26, 2, C.ink);
  }

  function spawn(x, y, n, power) {
    for (var i = 0; i < n; i++) {
      particles.push({
        x: x + (Math.random() - 0.5) * 60, y: y,
        vx: (Math.random() - 0.5) * 380 * power, vy: -(120 + Math.random() * 420) * power,
        l: 2 + Math.random() * 6, a: Math.random() * Math.PI, va: (Math.random() - 0.5) * 12,
        life: 1, c: Math.random() < 0.5 ? C.sawDark : "#F1E2BD"
      });
    }
  }
  function drawParticles(dt) {
    for (var i = particles.length - 1; i >= 0; i--) {
      var p = particles[i];
      p.vy += 900 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.a += p.va * dt; p.life -= dt * 0.8;
      if (p.y > GROUND + 50 || p.life <= 0) { particles.splice(i, 1); continue; }
      ctx.save(); ctx.globalAlpha = Math.max(0, p.life); ctx.translate(p.x, p.y); ctx.rotate(p.a);
      ctx.fillStyle = p.c; ctx.fillRect(-p.l / 2, -1.5, p.l, 3); ctx.restore();
    }
  }

  function ease(u) { return u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2; }

  function render(dt) {
    var sway = reduce ? 0 : Math.sin(t * 3.1) * 0.035;
    var push = shown * 120;
    var marc = { x: CX - 150 + push, facing: 1, lean: 0.8 + sway + jolt * 0.08, shirt: C.blue, skin: C.skin, hair: C.hairMarc, arms: "grip" };
    var foe  = { x: CX + 150 + push, facing: -1, lean: 1.0 - sway, shirt: C.foe, skin: C.skin2, hair: C.hairFoe, arms: "grip" };

    if (state === "win") {
      var u = Math.min(1, (t - endT) / 1.3);
      var e = ease(u);
      foe.lift = Math.sin(Math.min(1, u * 1.4) * Math.PI) * 130;
      foe.rot = e * (Math.PI / 2 + 0.06);
      foe.lean = 1.0 * (1 - e);
      foe.x += (CX + 20 - foe.x) * e;
      foe.arms = u > 0.3 ? "none" : "grip";
      if (u >= 1) { foe.lift = -46; }
      marc.lean = 0.8 - e * 0.75;
      marc.x += e * 40;
      marc.arms = u > 0.75 ? "up" : (u > 0.3 ? "none" : "grip");
      if (u > 0.82 && !landed) { landed = true; spawn(foe.x + 220, GROUND - 10, 110, 1.3); }
    } else if (state === "draw") {
      var d = Math.min(1, (t - endT) / 0.8);
      marc.lean = 0.8 - d * 0.5; foe.lean = 1.0 - d * 0.7;
      marc.x -= d * 50; foe.x += d * 50;
      marc.arms = foe.arms = d > 0.5 ? "none" : "grip";
    }

    drawBackground(state === "win" && t - endT > 0.9);
    drawWrestler(foe);
    drawWrestler(marc);
    drawParticles(dt);
    if (state === "play" || state === "idle") drawBar();
  }

  // --- Spielablauf ---------------------------------------------------------
  var last = 0, running = false, visible = true;
  function frame(now) {
    var dt = Math.min(0.05, (now - (last || now)) / 1000);
    last = now;
    t += dt;
    jolt *= Math.pow(0.001, dt);

    if (state === "play") {
      var lv = LEVELS[level];
      var force = lv.push + lv.surge * Math.pow(Math.max(0, Math.sin(t * 1.7)), 2);
      pos = Math.max(-1, pos - force * dt);
      timeLeft = Math.max(0, timeLeft - dt);
      timerEl.textContent = timeLeft.toFixed(1) + " s";
      if (pos >= 1) finish(true);
      else if (timeLeft <= 0) finish(false);
    }
    shown += (pos - shown) * Math.min(1, dt * 10);
    render(dt);

    if (visible || state === "play" || particles.length) requestAnimationFrame(frame);
    else running = false;
  }
  function loop() { if (!running) { running = true; last = 0; requestAnimationFrame(frame); } }

  function start() {
    level = parseInt((document.querySelector("input[name='level']:checked") || {}).value || "0", 10);
    foeName.textContent = LEVELS[level].name;
    state = "play"; pos = 0; shown = 0; timeLeft = DURATION; landed = false; particles = [];
    overlay.hidden = true;
    overlay.classList.remove("is-result");
    tapHint.hidden = false;
    setTimeout(function () { tapHint.hidden = true; }, 1800);
    statusEl.textContent = "Gang läuft. Klicke so schnell du kannst.";
    arena.focus({ preventScroll: true });
    loop();
  }

  function finish(won) {
    endT = t;
    tapHint.hidden = true;
    var used = DURATION - timeLeft;
    if (won) {
      state = "win"; pos = 1;
      var prev = best(level), record = !prev || used < prev;
      if (record) saveBest(level, used);
      overlay.classList.add("is-result");
      ovTitle.textContent = "Plattwurf! Marc gewinnt.";
      ovText.textContent = "Mit dem Wyberhaken nach " + used.toFixed(1) + " Sekunden" + (record ? " – neue Bestzeit!" : ".") + " Danach wischt er dem Gegner das Sägemehl vom Rücken.";
      startBtn.textContent = "Nochmals schwingen";
    } else {
      state = "draw";
      overlay.classList.add("is-result");
      ovTitle.textContent = "Gestellt!";
      ovText.textContent = "Kein Sieger nach " + DURATION + " Sekunden – wie im Schlussgang von Arth 2026. Klick schneller!";
      startBtn.textContent = "Nächster Gang";
    }
    statusEl.textContent = ovTitle.textContent + " " + ovText.textContent;
    showBest();
    setTimeout(function () { overlay.hidden = false; }, won ? 1500 : 900);
  }

  function tap() {
    if (state !== "play") return;
    pos = Math.min(1, pos + TAP);
    jolt = 1;
    spawn(CX + shown * 120 + (Math.random() - 0.5) * 220, GROUND, 3, 0.5);
    if (pos >= 1) finish(true);
  }

  arena.addEventListener("pointerdown", function (e) {
    if (e.target.closest("button")) return;
    if (state === "play") { e.preventDefault(); tap(); }
  });
  arena.addEventListener("keydown", function (e) {
    if (e.key === " " || e.key === "Enter") {
      if (e.target.closest("button")) return;
      e.preventDefault();
      if (state === "play") tap(); else if (!overlay.hidden) start();
    }
  });
  startBtn.addEventListener("click", start);
  document.querySelectorAll("input[name='level']").forEach(function (r) {
    r.addEventListener("change", function () {
      level = parseInt(r.value, 10);
      if (state !== "play") foeName.textContent = LEVELS[level].name;
      showBest();
    });
  });

  // Nur animieren, wenn die Arena sichtbar ist; Spiel-Button ein-/ausblenden
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (en) {
      visible = en[0].isIntersecting;
      if (fab) fab.classList.toggle("is-near", visible);
      if (visible) loop();
    }, { threshold: 0.05 }).observe(arena);
  }
  if (fab) {
    var onScroll = function () {
      var y = window.scrollY || 0;
      fab.classList.toggle("is-visible", y > window.innerHeight * 0.8 && !fab.classList.contains("is-near"));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  showBest();
  render(0);
  loop();
})();

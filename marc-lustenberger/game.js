/* Mini-Spiel «Schwing gegen Marc»
   Klicken, tippen oder Leertaste gibt Marc Kraft. Erreicht die Kraftanzeige das Ende,
   legt Marc den Gegner mit dem Wyberhaken ins Sägemehl. Läuft die Zeit ab: gestellt. */
(function () {
  "use strict";

  var canvas = document.getElementById("ring");
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext("2d");
  var W = canvas.width, H = canvas.height, GROUND = 618, CX = W / 2, S = 1.52;
  var WIDE = 1280, NARROW = 960;

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
    foe: "#EEF0F1", foeShirt: "#C9D1D8", trouser: "#2A2F35", zwilch: "#E3CFA6", zwilchDark: "#CDB488", zwilchFoe: "#6E4A2C", zwilchFoeDark: "#4F331D",
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
  function buildScene() {
    crowd = []; dust = [];
    var rows = 5;
    for (var r = 0; r < rows; r++) {
      for (var x = 30 + (r % 2) * 22; x < W; x += 44) {
        crowd.push({ x: x + Math.random() * 10, y: 150 + r * 46, r: 13 + Math.random() * 3, s: Math.random() * 6, c: 0.72 + Math.random() * 0.18 });
      }
    }
    for (var i = 0; i < 420; i++) {
      var a = Math.random() * Math.PI * 2, d = Math.sqrt(Math.random());
      dust.push({ x: CX + Math.cos(a) * d * W * 0.47, y: 640 + Math.sin(a) * d * 72, l: 2 + Math.random() * 5, a: Math.random() * Math.PI, c: Math.random() < 0.5 ? C.sawDark : "#F3E6C6" });
    }
  }
  buildScene();

  // Auf schmalen Bildschirmen ein höheres Spielfeld (4:3 statt 16:9)
  function fit() {
    var target = arena.clientWidth < 620 ? NARROW : WIDE;
    if (canvas.width === target) return;
    canvas.width = target; W = target; CX = W / 2;
    buildScene();
    render(0);
  }

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
    ctx.beginPath(); ctx.ellipse(CX, 646, W * 0.488, 88, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = C.saw;
    ctx.beginPath(); ctx.ellipse(CX, 640, W * 0.477, 80, 0, 0, Math.PI * 2); ctx.fill();
    dust.forEach(function (d) {
      ctx.save(); ctx.translate(d.x, d.y); ctx.rotate(d.a);
      ctx.fillStyle = d.c; ctx.fillRect(-d.l / 2, -1, d.l, 2); ctx.restore();
    });
  }

  // --- Schwinger-Figur ----------------------------------------------------
  // Lokale Koordinaten: Füsse auf y = 0, Blick nach rechts (+x), oben = -y.
  // Arme und Beine werden über zwei Gelenke (Knie/Ellbogen) gelöst.

  function mix(hex, amt) { // amt > 0 heller, < 0 dunkler
    var n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    var k = amt < 0 ? 0 : 255, f = Math.abs(amt);
    r = Math.round(r + (k - r) * f); g = Math.round(g + (k - g) * f); b = Math.round(b + (k - b) * f);
    return "rgb(" + r + "," + g + "," + b + ")";
  }
  function P(x, y) { return { x: x, y: y }; }
  function along(p, dir, d) { return P(p.x + dir.x * d, p.y + dir.y * d); }
  function lerpP(a, b, k) { return P(a.x + (b.x - a.x) * k, a.y + (b.y - a.y) * k); }

  // Zwei-Gelenk-Lösung: Gelenkpunkt zwischen a und Ziel b, Biegerichtung über sign
  function joint(a, b, l1, l2, sign) {
    var dx = b.x - a.x, dy = b.y - a.y, d = Math.sqrt(dx * dx + dy * dy);
    d = Math.max(Math.abs(l1 - l2) + 0.01, Math.min(l1 + l2 - 0.01, d));
    var base = Math.atan2(dy, dx);
    var ang = Math.acos((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d));
    var j = P(a.x + Math.cos(base + sign * ang) * l1, a.y + Math.sin(base + sign * ang) * l1);
    var end = P(a.x + Math.cos(base) * d, a.y + Math.sin(base) * d);
    return { j: j, end: end };
  }

  // Verjüngtes Körperteil mit runden Enden
  function limb(p, q, w1, w2, col) {
    var dx = q.x - p.x, dy = q.y - p.y, l = Math.sqrt(dx * dx + dy * dy) || 1;
    var nx = -dy / l, ny = dx / l;
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.moveTo(p.x + nx * w1 / 2, p.y + ny * w1 / 2);
    ctx.lineTo(q.x + nx * w2 / 2, q.y + ny * w2 / 2);
    ctx.lineTo(q.x - nx * w2 / 2, q.y - ny * w2 / 2);
    ctx.lineTo(p.x - nx * w1 / 2, p.y - ny * w1 / 2);
    ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.arc(p.x, p.y, w1 / 2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(q.x, q.y, w2 / 2, 0, Math.PI * 2); ctx.fill();
  }

  // Gelenk mit bevorzugter Richtung: "down" = Gelenk unten, "out" = vom Körper weg
  function bend(a, b, l1, l2, prefer, awayX) {
    var j1 = joint(a, b, l1, l2, 1), j2 = joint(a, b, l1, l2, -1);
    if (prefer === "down") return j1.j.y > j2.j.y ? j1 : j2;
    if (prefer === "fwd") return j1.j.x > j2.j.x ? j1 : j2;
    return Math.abs(j1.j.x - awayX) > Math.abs(j2.j.x - awayX) ? j1 : j2;
  }

  // --- Piktogramm-Schwinger ------------------------------------------------
  // Einfarbige Körper mit runden Gliedern und hellen Trennfugen (wie Sportpiktogramme).
  function seg(p, q, w, col) {
    ctx.lineCap = "round";
    ctx.strokeStyle = col; ctx.lineWidth = w;
    ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
  }
  function seg2(a, j, b, w1, w2, col) { seg(a, j, w1, col); seg(j, b, w2, col); ctx.fillStyle = col; ctx.beginPath(); ctx.arc(j.x, j.y, Math.min(w1, w2) / 2, 0, Math.PI * 2); ctx.fill(); }
  // Kopf mit Gesicht (Blick nach +x, entlang der Rumpfachse geneigt)
  function drawHead(p, dir, o) {
    var tilt = Math.atan2(dir.y, dir.x) + Math.PI / 2;
    ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(tilt * 0.55);
    ctx.fillStyle = o.skin;
    ctx.beginPath(); ctx.ellipse(0, 0, 18, 20, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(7, 11, 11, 8, 0.3, 0, Math.PI * 2); ctx.fill();           // Kinn
    ctx.beginPath(); ctx.moveTo(15, -5); ctx.quadraticCurveTo(24, 2, 15, 6); ctx.fill();   // Nase
    ctx.fillStyle = mix(o.skin, -0.14);
    ctx.beginPath(); ctx.ellipse(-4, 2, 4.5, 6.5, 0, 0, Math.PI * 2); ctx.fill();         // Ohr
    ctx.fillStyle = o.hair;                                                               // Haare
    ctx.beginPath(); ctx.ellipse(-3, -6, 19.5, 15.5, -0.15, Math.PI * 0.9, Math.PI * 2.08); ctx.fill();
    ctx.beginPath(); ctx.ellipse(-12, 0, 8, 12, 0, 0, Math.PI * 2); ctx.fill();            // Hinterkopf
    ctx.fillStyle = mix(o.skin, -0.14);
    ctx.beginPath(); ctx.ellipse(-4, 2, 4.5, 6.5, 0, 0, Math.PI * 2); ctx.fill();         // Ohr über den Haaren
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(10, -2, 2.3, 0, Math.PI * 2); ctx.fill(); // Auge
    ctx.strokeStyle = mix(o.hair, -0.1); ctx.lineWidth = 2.4; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(7, -8); ctx.lineTo(15, -7); ctx.stroke();                 // Braue
    ctx.strokeStyle = mix(o.skin, -0.3); ctx.lineWidth = 1.8;
    ctx.beginPath(); ctx.moveTo(11, 9); ctx.lineTo(16, 8); ctx.stroke();                  // Mund
    ctx.restore();
  }
  function hand(p, o, back) {
    ctx.fillStyle = back ? mix(o.skin, -0.14) : o.skin;
    ctx.beginPath(); ctx.arc(p.x, p.y, 10.5, 0, Math.PI * 2); ctx.fill();
  }

  function drawWrestler(o) {
    ctx.save();
    ctx.translate(o.x, GROUND - (o.lift || 0));
    ctx.rotate(o.rot || 0);
    ctx.scale(o.facing * S, S);

    var col = o.body, dark = mix(o.body, -0.2);
    var pants = o.pants || col, pantsBack = mix(pants, -0.22);
    var lean = o.lean, crouch = o.crouch == null ? 1 : o.crouch;
    var hipY = -92 - (1 - crouch) * 16;
    var H = P(-4, hipY);
    var F1 = P(-78 + (1 - crouch) * 50, -9), F2 = P(24 - (1 - crouch) * 8, -9);
    var dir = P(Math.sin(lean), -Math.cos(lean));
    var N = along(H, dir, 82);
    var Sh = along(N, dir, -6);
    var head = along(N, dir, 32);
    var reach = o.reach || 150;
    if (o.headOnly) { drawHead(head, dir, o); ctx.restore(); return; }

    var tf, tb, prefer = "down";
    if (o.arms === "grip") {
      tf = P(reach + 6, hipY - 26);    // über den Rücken an den Gurt
      tb = P(reach - 26, hipY + 26);   // umgeschlagenes Hosenbein
    } else if (o.arms === "up") {
      tf = P(Sh.x + 30, Sh.y - 80); tb = P(Sh.x - 30, Sh.y - 78); prefer = "out";
    } else {
      tf = P(Sh.x + 12, Sh.y + 76); tb = P(Sh.x - 8, Sh.y + 76);
    }

    if (!o.rot) { ctx.fillStyle = "rgba(90,70,40,.2)"; ctx.beginPath(); ctx.ellipse(-24, 0, 90, 10, 0, 0, Math.PI * 2); ctx.fill(); }

    // hinterer Arm
    var ab = bend(Sh, tb, 46, 44, prefer, Sh.x);
    seg2(Sh, ab.j, ab.end, 19, 17, dark);
    hand(ab.end, o, true);
    // Beine: hinteres lang gestreckt, vorderes gebeugt
    var kb = bend(H, F1, 56, 54, "down");
    seg2(H, kb.j, kb.end, 26, 21, pantsBack);
    seg(P(kb.end.x - 4, -6), P(kb.end.x + 14, -6), 12, "#D5DBE0");
    var kf = bend(H, F2, 56, 54, "fwd");
    seg2(H, kf.j, kf.end, 26, 21, pants);
    seg(P(kf.end.x - 2, -6), P(kf.end.x + 16, -6), 12, "#F2F4F6");
    // Zwilchhose über den Oberschenkeln (Farbe je Schwinger)
    var z = o.zwilch || C.zwilch, zd = o.zwilchDark || C.zwilchDark;
    var zb = lerpP(H, kb.j, 0.5), zf = lerpP(H, kf.j, 0.5);
    seg(H, zb, 32, mix(z, -0.04));
    seg(H, zf, 32, z);
    [[kb.j, zb], [kf.j, zf]].forEach(function (pair) {             // umgeschlagener Saum
      var K = pair[0], c = pair[1], dx = K.x - H.x, dy = K.y - H.y, l = Math.sqrt(dx * dx + dy * dy) || 1;
      ctx.strokeStyle = zd; ctx.lineWidth = 7; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(c.x - dy / l * 15, c.y + dx / l * 15); ctx.lineTo(c.x + dy / l * 15, c.y - dx / l * 15); ctx.stroke();
    });
    // Rumpf
    seg(along(H, dir, 4), N, 46, col);
    // Gurt der Zwilchhose
    ctx.fillStyle = z; ctx.beginPath(); ctx.arc(H.x, H.y, 21, 0, Math.PI * 2); ctx.fill();
    var g1 = along(H, dir, 10), gp = P(-dir.y, dir.x);
    ctx.strokeStyle = zd; ctx.lineWidth = 8; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(g1.x + gp.x * 21, g1.y + gp.y * 21); ctx.lineTo(g1.x - gp.x * 21, g1.y - gp.y * 21); ctx.stroke();
    if (o.dusty) {
      for (var i = 0; i < 24; i++) {
        var q = along(H, dir, 20 + (i * 31) % 60);
        ctx.fillStyle = i % 2 ? C.sawDark : "#F1E2BD"; ctx.fillRect(q.x - 16 + (i * 7) % 30, q.y - 22, 3, 2);
      }
    }
    // Kopf (freistehend)
    drawHead(head, dir, o);
    // vorderer Arm
    var af = bend(Sh, tf, 46, 44, prefer, Sh.x);
    seg2(Sh, af.j, af.end, 20, 18, col);
    hand(af.end, o, false);
    ctx.restore();
  }

  function drawBar() {
    var bw = Math.min(560, W * 0.6), bx = CX - bw / 2, by = 686;
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
    var sway = reduce ? 0 : Math.sin(t * 3.1) * 0.03;
    var push = shown * 120;
    var gap = 122;
    var reach = (gap * 2) / S;
    var marc = { x: CX - gap + push, facing: 1, lean: 0.98 + sway + jolt * 0.06, crouch: 1, body: C.blue, pants: C.blueDark, skin: C.skin, hair: C.hairMarc, arms: "grip", reach: reach };
    var foe  = { x: CX + gap + push, facing: -1, lean: 1.12 - sway, crouch: 1, body: C.foeShirt, pants: C.trouser, zwilch: C.zwilchFoe, zwilchDark: C.zwilchFoeDark, skin: C.skin2, hair: C.hairFoe, arms: "grip", reach: reach };

    if (state === "win") {
      var u = Math.min(1, (t - endT) / 1.3);
      var e = ease(u);
      foe.lift = Math.sin(Math.min(1, u * 1.4) * Math.PI) * 130;
      foe.rot = e * (Math.PI / 2 + 0.04);
      foe.lean = 1.1 * (1 - e);
      foe.crouch = 1 - e;
      foe.x += (CX - 20 - (WIDE - W) * 0.22 - foe.x) * e;
      foe.arms = u > 0.25 ? "none" : "grip";
      if (u >= 1) { foe.lift = -44; foe.dusty = true; }
      marc.lean = 0.95 - e * 0.9;
      marc.crouch = 1 - e * 0.8;
      marc.x += e * 20;
      marc.arms = u > 0.75 ? "up" : (u > 0.25 ? "none" : "grip");
      if (u > 0.82 && !landed) { landed = true; spawn(foe.x + 200, GROUND - 10, 110, 1.3); }
    } else if (state === "draw") {
      var d = Math.min(1, (t - endT) / 0.8);
      marc.lean = 0.95 - d * 0.65; foe.lean = 1.1 - d * 0.8;
      marc.crouch = foe.crouch = 1 - d * 0.7;
      marc.x -= d * 80; foe.x += d * 80;
      marc.arms = foe.arms = d > 0.4 ? "none" : "grip";
    }

    drawBackground(state === "win" && t - endT > 0.9);
    drawWrestler(foe);
    drawWrestler(marc);
    if (foe.arms === "grip" && !foe.rot) { foe.headOnly = true; drawWrestler(foe); }
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
    overlay.classList.remove("is-result");
    overlay.classList.add("is-play");
    ovTitle.textContent = "Klick! Klick! Klick!";
    ovText.textContent = "So schnell du kannst – jeder Klick gibt Marc Kraft.";
    startBtn.hidden = true;
    statusEl.textContent = "Gang läuft. Klicke so schnell du kannst.";
    arena.focus({ preventScroll: true });
    loop();
  }

  function buzz(ms) { try { if (navigator.vibrate) navigator.vibrate(ms); } catch (e) { /* nicht unterstützt */ } }

  function finish(won) {
    endT = t;
    buzz(won ? [40, 60, 90] : 30);
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
    overlay.classList.remove("is-play");
    startBtn.hidden = false;
  }

  function tap() {
    if (state !== "play") return;
    pos = Math.min(1, pos + TAP);
    jolt = 1;
    buzz(8);
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
      if (state === "play") tap(); else start();
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
    var contact = document.getElementById("kontakt");
    var onScroll = function () {
      var y = window.scrollY || 0;
      var inContact = contact && contact.getBoundingClientRect().top < window.innerHeight * 0.9;
      fab.classList.toggle("is-visible", y > window.innerHeight * 0.8 && !fab.classList.contains("is-near"));
      fab.classList.toggle("is-hidden-zone", !!inContact);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  fit();
  window.addEventListener("resize", fit);
  showBest();
  render(0);
  loop();
})();

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
    foe: "#EEF0F1", trouser: "#2A2F35", zwilch: "#D8C197", zwilchDark: "#B3965F",
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

  function drawLeg(H, F, pal, back) {
    var k = joint(H, F, 62, 60, -1);
    var trouser = back ? mix(C.trouser, -0.25) : C.trouser;
    limb(H, k.j, 34, 27, trouser);                 // Oberschenkel
    limb(k.j, k.end, 25, 19, trouser);             // Unterschenkel
    // Schuh
    ctx.fillStyle = back ? "#DADFE3" : "#F4F6F7";
    ctx.beginPath(); ctx.ellipse(k.end.x + 9, -6, 17, 7.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#9AA5AE"; ctx.fillRect(k.end.x - 6, -2.5, 32, 2.5);
    // Zwilchhose: kurzes Bein mit umgeschlagenem Saum
    var mid = lerpP(H, k.j, 0.58);
    var z = back ? mix(C.zwilch, -0.12) : C.zwilch;
    limb(H, mid, 40, 36, z);
    var cuffA = lerpP(H, k.j, 0.5), cuffB = lerpP(H, k.j, 0.66);
    limb(cuffA, cuffB, 39, 37, back ? mix(C.zwilchDark, -0.1) : C.zwilchDark);
    return k;
  }

  function drawArm(Sh, target, shirt, skin, back, up) {
    var k = joint(Sh, target, 58, 56, up ? -1 : 1);
    var sl = back ? mix(shirt, -0.18) : shirt;
    var sk = back ? mix(skin, -0.12) : skin;
    var elbowSleeve = lerpP(Sh, k.j, 0.78);
    limb(Sh, k.j, 25, 21, sk);          // Oberarm (Haut)
    limb(Sh, elbowSleeve, 29, 26, sl);  // halblanger Ärmel
    limb(k.j, k.end, 20, 16, sk);       // Unterarm
    ctx.fillStyle = sk;
    ctx.beginPath(); ctx.ellipse(k.end.x, k.end.y, 11, 9.5, Math.atan2(k.end.y - k.j.y, k.end.x - k.j.x), 0, Math.PI * 2); ctx.fill();
  }

  function drawWrestler(o) {
    ctx.save();
    ctx.translate(o.x, GROUND - (o.lift || 0));
    ctx.rotate(o.rot || 0);
    ctx.scale(o.facing * S, S);

    var lean = o.lean, crouch = o.crouch == null ? 1 : o.crouch;
    var hipY = -96 - (1 - crouch) * 20;
    var H = P(-8, hipY);
    var F1 = P(-54 + (1 - crouch) * 26, 0), F2 = P(34 - (1 - crouch) * 12, 0);
    var dir = P(Math.sin(lean), -Math.cos(lean));   // Rumpfachse
    var back = P(-dir.y, dir.x);                    // Rückenseite (oben)
    back = P(-back.x, -back.y);
    var N = along(H, dir, 106);                      // Nacken
    var Sf = along(along(N, dir, -12), back, -4);    // vordere Schulter
    var Sb = along(along(N, dir, -8), back, 6);      // hintere Schulter
    var reach = o.reach || 160;

    // Ziele der Hände
    var tf, tb, up = false;
    if (o.arms === "grip") {
      tf = P(reach - 4, hipY - 16);    // Gurt des Gegners
      tb = P(reach - 42, hipY + 26);   // umgeschlagenes Hosenbein des Gegners
    } else if (o.arms === "up") {
      up = true;
      tf = P(Sf.x + 30, Sf.y - 92); tb = P(Sb.x - 26, Sb.y - 96);
    } else {
      tf = P(Sf.x + 16, Sf.y + 88); tb = P(Sb.x - 6, Sb.y + 90);
    }

    // Schatten
    if (!o.rot) { ctx.fillStyle = "rgba(90,70,40,.2)"; ctx.beginPath(); ctx.ellipse(-8, 3, 82, 11, 0, 0, Math.PI * 2); ctx.fill(); }

    drawArm(Sb, tb, o.shirt, o.skin, true, up);   // hinterer Arm
    drawLeg(H, F1, o, true);                        // hinteres Bein
    drawLeg(H, F2, o, false);                       // vorderes Bein

    // Becken der Zwilchhose
    ctx.save(); ctx.translate(H.x, H.y); ctx.rotate(lean * 0.35);
    rrect(-27, -20, 54, 40, 12, C.zwilch);
    rrect(-27, -21, 54, 10, 4, C.zwilchDark);       // Gurt
    ctx.restore();

    // Rumpf mit Licht von oben
    var chest = along(H, dir, 66);
    var g = ctx.createLinearGradient(chest.x + back.x * 36, chest.y + back.y * 36, chest.x - back.x * 36, chest.y - back.y * 36);
    g.addColorStop(0, mix(o.shirt, 0.18)); g.addColorStop(0.55, o.shirt); g.addColorStop(1, mix(o.shirt, -0.22));
    limb(along(H, dir, 10), N, 50, 62, g);
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.ellipse(chest.x, chest.y, 40, 33, Math.atan2(dir.y, dir.x), 0, Math.PI * 2); ctx.fill();
    // Knopfleiste / Falte
    ctx.strokeStyle = mix(o.shirt, -0.15); ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(along(H, dir, 28).x - back.x * 20, along(H, dir, 28).y - back.y * 20);
    ctx.lineTo(N.x - back.x * 24, N.y - back.y * 24); ctx.stroke();
    // Sägemehl auf dem Rücken nach dem Wurf
    if (o.dusty) {
      for (var i = 0; i < 26; i++) {
        var q = along(along(H, dir, 20 + (i * 37) % 80), back, 12 + (i * 13) % 14);
        ctx.fillStyle = i % 2 ? C.sawDark : "#F1E2BD"; ctx.fillRect(q.x, q.y, 3, 2);
      }
    }

    // Hals & Kopf
    var neckTop = along(N, dir, 12);
    limb(N, neckTop, 24, 22, mix(o.skin, -0.05));
    var head = along(neckTop, dir, 18);
    var tilt = Math.atan2(dir.y, dir.x) + Math.PI / 2;
    ctx.save(); ctx.translate(head.x, head.y); ctx.rotate(tilt * 0.55);
    ctx.fillStyle = o.skin; ctx.beginPath(); ctx.ellipse(0, 0, 19, 22, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.moveTo(15, -4); ctx.lineTo(24, 4); ctx.lineTo(15, 8); ctx.fill();          // Nase
    ctx.fillStyle = mix(o.skin, -0.12); ctx.beginPath(); ctx.ellipse(-4, 2, 5, 7, 0, 0, Math.PI * 2); ctx.fill(); // Ohr
    ctx.fillStyle = o.hair;
    ctx.beginPath(); ctx.ellipse(-3, -8, 20, 16, -0.25, Math.PI * 0.95, Math.PI * 2.08); ctx.fill();   // Haare
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(11, -2, 2.4, 0, Math.PI * 2); ctx.fill();          // Auge
    ctx.strokeStyle = mix(o.skin, -0.3); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(9, -8); ctx.lineTo(16, -7); ctx.stroke(); // Braue
    ctx.restore();

    drawArm(Sf, tf, o.shirt, o.skin, false, up);  // vorderer Arm
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
    var gap = 146;
    var reach = (gap * 2) / S;
    var marc = { x: CX - gap + push, facing: 1, lean: 1.0 + sway + jolt * 0.06, crouch: 1, shirt: C.blue, skin: C.skin, hair: C.hairMarc, arms: "grip", reach: reach };
    var foe  = { x: CX + gap + push, facing: -1, lean: 1.04 - sway, crouch: 1, shirt: C.foe, skin: C.skin2, hair: C.hairFoe, arms: "grip", reach: reach };

    if (state === "win") {
      var u = Math.min(1, (t - endT) / 1.3);
      var e = ease(u);
      foe.lift = Math.sin(Math.min(1, u * 1.4) * Math.PI) * 130;
      foe.rot = e * (Math.PI / 2 + 0.04);
      foe.lean = 1.04 * (1 - e);
      foe.crouch = 1 - e;
      foe.x += (CX - 20 - (WIDE - W) * 0.22 - foe.x) * e;
      foe.arms = u > 0.25 ? "none" : "grip";
      if (u >= 1) { foe.lift = -44; foe.dusty = true; }
      marc.lean = 1.0 - e * 0.95;
      marc.crouch = 1 - e * 0.8;
      marc.x += e * 20;
      marc.arms = u > 0.75 ? "up" : (u > 0.25 ? "none" : "grip");
      if (u > 0.82 && !landed) { landed = true; spawn(foe.x + 200, GROUND - 10, 110, 1.3); }
    } else if (state === "draw") {
      var d = Math.min(1, (t - endT) / 0.8);
      marc.lean = 1.0 - d * 0.7; foe.lean = 1.04 - d * 0.75;
      marc.crouch = foe.crouch = 1 - d * 0.7;
      marc.x -= d * 60; foe.x += d * 60;
      marc.arms = foe.arms = d > 0.4 ? "none" : "grip";
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

  fit();
  window.addEventListener("resize", fit);
  showBest();
  render(0);
  loop();
})();

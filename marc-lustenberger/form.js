/* Kontakt- und Bestellformular
   Je nach Anliegen erscheinen passende Felder. Bei «Fanartikel bestellen» gibt es einen
   Warenkorb mit Mengen, T-Shirt-Grössen, Lieferart, Zahlung (TWINT oder Rechnung) und
   einer laufenden Zusammenfassung. Abgeschickt wird per E-Mail-Programm (mailto). */
(function () {
  "use strict";

  var M = window.MARC;
  var form = document.getElementById("form");
  if (!form || !M) return;

  var EMAIL = M.CONTACT_EMAIL;
  var ITEMS = M.PRODUCTS.filter(function (p) { return !p.noOrder; });
  var byId = {};
  ITEMS.forEach(function (p) { byId[p.id] = p; });

  // Versand: Abholung gratis; nur 1 T-Shirt CHF 5; sonst CHF 12 (gemäss Angaben der Fanartikel)
  function shipping(lines, pickup) {
    var count = 0, shirts = 0;
    lines.forEach(function (l) { count += l.qty; if (l.pid === "shirt") shirts += l.qty; });
    if (pickup || count === 0) return 0;
    return count === 1 && shirts === 1 ? 5 : 12;
  }

  var $ = function (id) { return document.getElementById(id); };
  var chf = function (n) { return "CHF " + n.toFixed(2); };

  // Warenkorb-Zeilen: pro Artikel eine Zeile, T-Shirt kann mehrere Zeilen (Grössen) haben
  var lines = ITEMS.map(function (p) { return { pid: p.id, size: "", qty: 0 }; });

  function topic() { return (form.querySelector("input[name='topic']:checked") || {}).value || "Anderes"; }
  function payment() { return (form.querySelector("input[name='payment']:checked") || {}).value; }
  function pickup() { return (form.querySelector("input[name='delivery']:checked") || {}).value === "Abholung in Hasle"; }
  function isOrder() { return topic() === "Fanartikel"; }

  // --- Warenkorb darstellen ------------------------------------------------
  var list = $("order-list");

  function renderOrder() {
    list.innerHTML = "";
    lines.forEach(function (l, i) {
      var p = byId[l.pid];
      var li = document.createElement("li");
      li.className = "order__item" + (l.qty > 0 ? " is-active" : "");

      var img = document.createElement("img");
      img.src = "assets/img/" + p.img; img.alt = ""; img.loading = "lazy";
      li.appendChild(img);

      var info = document.createElement("div");
      info.className = "order__info";
      var name = document.createElement("span"); name.className = "order__name"; name.textContent = p.name;
      var price = document.createElement("span"); price.className = "order__price"; price.textContent = chf(p.chf);
      info.appendChild(name); info.appendChild(price);
      li.appendChild(info);

      var ctrl = document.createElement("div");
      ctrl.className = "order__ctrl";
      if (p.sizes) {
        var sel = document.createElement("select");
        sel.id = "size-" + i;
        sel.setAttribute("aria-label", "Grösse " + p.name);
        var o0 = document.createElement("option"); o0.value = ""; o0.textContent = "Grösse";
        sel.appendChild(o0);
        p.sizes.forEach(function (s) {
          var o = document.createElement("option"); o.value = s; o.textContent = s;
          if (s === l.size) o.selected = true;
          sel.appendChild(o);
        });
        sel.addEventListener("change", function () { l.size = sel.value; clearErr("order"); update(); });
        ctrl.appendChild(sel);
      }
      var step = document.createElement("div");
      step.className = "stepper";
      var minus = document.createElement("button");
      minus.type = "button"; minus.textContent = "−"; minus.setAttribute("aria-label", p.name + " eins weniger");
      var out = document.createElement("output");
      out.textContent = String(l.qty); out.setAttribute("aria-live", "polite");
      var plus = document.createElement("button");
      plus.type = "button"; plus.textContent = "+"; plus.setAttribute("aria-label", p.name + " eins mehr");
      minus.disabled = l.qty === 0;
      minus.addEventListener("click", function () { l.qty = Math.max(0, l.qty - 1); renderOrder(); update(); });
      plus.addEventListener("click", function () { l.qty = Math.min(20, l.qty + 1); clearErr("order"); renderOrder(); update(); });
      step.appendChild(minus); step.appendChild(out); step.appendChild(plus);
      ctrl.appendChild(step);

      // zusätzliche T-Shirt-Zeilen können entfernt werden
      var firstOfKind = lines.findIndex(function (x) { return x.pid === l.pid; }) === i;
      if (!firstOfKind) {
        var rm = document.createElement("button");
        rm.type = "button"; rm.className = "order__rm"; rm.textContent = "×";
        rm.setAttribute("aria-label", "Zeile entfernen");
        rm.addEventListener("click", function () { lines.splice(i, 1); renderOrder(); update(); });
        ctrl.appendChild(rm);
      }
      li.appendChild(ctrl);
      list.appendChild(li);
    });
  }

  $("add-shirt").addEventListener("click", function () {
    var lastShirt = -1;
    lines.forEach(function (l, i) { if (l.pid === "shirt") lastShirt = i; });
    lines.splice(lastShirt + 1, 0, { pid: "shirt", size: "", qty: 1 });
    renderOrder(); update();
  });

  function orderLines() { return lines.filter(function (l) { return l.qty > 0; }); }

  function renderSummary() {
    var box = $("summary");
    var ls = orderLines();
    box.innerHTML = "";
    var h = document.createElement("p"); h.className = "summary__title"; h.textContent = "Deine Bestellung";
    box.appendChild(h);
    if (!ls.length) {
      var e = document.createElement("p"); e.className = "summary__empty"; e.textContent = "Noch keine Artikel gewählt.";
      box.appendChild(e);
      return 0;
    }
    var sub = 0;
    var dl = document.createElement("dl");
    function row(k, v, cls) {
      var d = document.createElement("div"); if (cls) d.className = cls;
      var dt = document.createElement("dt"); dt.textContent = k;
      var dd = document.createElement("dd"); dd.textContent = v;
      d.appendChild(dt); d.appendChild(dd); dl.appendChild(d);
    }
    ls.forEach(function (l) {
      var p = byId[l.pid], sum = p.chf * l.qty;
      sub += sum;
      row(l.qty + " × " + p.name + (l.size ? " (" + l.size + ")" : ""), chf(sum));
    });
    var ship = shipping(ls, pickup());
    row(pickup() ? "Abholung in Hasle" : "Versand", ship ? chf(ship) : "gratis", "summary__ship");
    row("Total", chf(sub + ship), "summary__total");
    box.appendChild(dl);
    return sub + ship;
  }

  // --- Anliegen wechseln -----------------------------------------------------
  function update() {
    var t = topic(), order = t === "Fanartikel";
    form.querySelectorAll(".form__part").forEach(function (part) {
      part.hidden = part.getAttribute("data-for") !== t;
    });
    $("address").hidden = !order || pickup();
    var twint = order && payment() === "TWINT";
    $("phone-req").hidden = !twint;
    $("phone-opt").hidden = twint;
    $("msg-label").textContent = order ? "Bemerkungen (optional)" : "Deine Nachricht *";
    $("f-msg").placeholder = order ? "z. B. Abholtermin oder Wunsch zur Lieferung" : "";
    var total = order ? renderSummary() : 0;
    $("submit").textContent = order ? (total ? "Bestellung senden · " + chf(total) : "Bestellung senden") : "Anfrage senden";
  }

  form.addEventListener("change", function (e) {
    if (e.target.name === "topic" || e.target.name === "delivery" || e.target.name === "payment") {
      form.querySelectorAll(".form__err").forEach(function (n) { n.textContent = ""; });
      form.querySelectorAll("[aria-invalid]").forEach(function (n) { n.removeAttribute("aria-invalid"); });
      update();
    }
  });

  // Links auf der Seite: Anliegen vorwählen bzw. Artikel in den Warenkorb legen
  function selectTopic(v) {
    var r = form.querySelector("input[name='topic'][value='" + v + "']");
    if (r) { r.checked = true; update(); }
  }
  document.addEventListener("click", function (e) {
    var prod = e.target.closest("[data-product]");
    if (prod) {
      selectTopic("Fanartikel");
      var l = lines.find(function (x) { return x.pid === prod.getAttribute("data-product"); });
      if (l && l.qty === 0) l.qty = 1;
      renderOrder(); update();
      return;
    }
    var t = e.target.closest("[data-topic]");
    if (t) selectTopic(t.getAttribute("data-topic"));
  });

  // --- Prüfen --------------------------------------------------------------
  function setErr(key, msg) {
    var p = form.querySelector("[data-err='" + key + "']");
    if (p) p.textContent = msg;
    var f = $(key);
    if (f) f.setAttribute("aria-invalid", "true");
  }
  function clearErr(key) {
    var p = form.querySelector("[data-err='" + key + "']");
    if (p) p.textContent = "";
    var f = $(key);
    if (f) f.removeAttribute("aria-invalid");
  }
  form.addEventListener("input", function (e) { if (e.target.id) clearErr(e.target.id); });
  $("f-consent").addEventListener("change", function () { clearErr("f-consent"); });

  var val = function (id) { return ($(id).value || "").trim(); };

  function validate() {
    var errs = [];
    function need(id, msg, ok) {
      var good = ok === undefined ? !!val(id) : ok;
      if (!good) { setErr(id, msg); errs.push(id); }
    }
    var t = topic();
    form.querySelectorAll("[data-req]").forEach(function (f) {
      if (f.getAttribute("data-req") === t && !val(f.id)) { setErr(f.id, "Bitte ausfüllen."); errs.push(f.id); }
    });
    if (t === "Fanartikel") {
      var ls = orderLines();
      if (!ls.length) { setErr("order", "Bitte mindestens einen Artikel wählen."); errs.push("order-list"); }
      else if (ls.some(function (l) { return byId[l.pid].sizes && !l.size; })) { setErr("order", "Bitte für jedes T-Shirt eine Grösse wählen."); errs.push("order-list"); }
      if (!pickup()) {
        need("f-street", "Bitte Strasse und Hausnummer angeben.");
        need("f-zip", "Bitte eine gültige PLZ angeben (4 Ziffern).", /^\d{4}$/.test(val("f-zip")));
        need("f-city", "Bitte Ort angeben.");
      }
    }
    need("f-first", "Bitte Vornamen angeben.");
    need("f-last", "Bitte Nachnamen angeben.");
    need("f-mail", "Bitte eine gültige E-Mail-Adresse angeben.", /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val("f-mail")));
    var digits = val("f-phone").replace(/\D/g, "");
    if (t === "Fanartikel" && payment() === "TWINT") need("f-phone", "Für TWINT brauchen wir deine Handynummer.", digits.length >= 9);
    else if (val("f-phone") && digits.length < 9) need("f-phone", "Diese Nummer scheint unvollständig.", false);
    if (t !== "Fanartikel") need("f-msg", "Bitte schreib uns kurz, worum es geht.");
    need("f-consent", "Bitte bestätigen.", $("f-consent").checked);
    return errs;
  }

  // --- Nachricht zusammenstellen -------------------------------------------
  function compose() {
    var t = topic(), name = val("f-first") + " " + val("f-last");
    var L = [], subject;
    if (t === "Fanartikel") {
      subject = "Bestellung Fanartikel – " + name;
      L.push("Bestellung Fanartikel", "");
      var sub = 0, ls = orderLines();
      ls.forEach(function (l) {
        var p = byId[l.pid]; sub += p.chf * l.qty;
        L.push("- " + l.qty + " × " + p.name + (l.size ? " (Grösse " + l.size + ")" : "") + "  " + chf(p.chf * l.qty));
      });
      var ship = shipping(ls, pickup());
      L.push("", (pickup() ? "Abholung in Hasle" : "Versand") + ": " + (ship ? chf(ship) : "gratis"));
      L.push("Total: " + chf(sub + ship), "");
      L.push("Zahlung: " + payment());
      L.push("Lieferung: " + (pickup() ? "Abholung in Hasle" : "Versand per Post"));
      if (!pickup()) L.push("", "Lieferadresse:", name, val("f-street"), val("f-zip") + " " + val("f-city"));
    } else if (t === "Sponsoring") {
      subject = "Sponsoring-Anfrage – " + val("f-company");
      var ints = [].slice.call(form.querySelectorAll("input[name='interest']:checked")).map(function (c) { return c.value; });
      L.push("Sponsoring-Anfrage", "", "Firma / Organisation: " + val("f-company"));
      if (ints.length) L.push("Interesse an: " + ints.join(", "));
    } else if (t === "Autogrammstunde / Event") {
      subject = "Anfrage Autogrammstunde / Event – " + val("f-occasion");
      L.push("Anfrage Autogrammstunde / Event", "", "Anlass: " + val("f-occasion"), "Ort: " + val("f-place"));
      if (val("f-date")) L.push("Datum: " + val("f-date").split("-").reverse().join("."));
    } else {
      subject = "Anfrage – " + name;
    }
    if (val("f-msg")) L.push("", (t === "Fanartikel" ? "Bemerkungen: " : "") + val("f-msg"));
    L.push("", "—", name, val("f-mail"));
    if (val("f-phone")) L.push(val("f-phone"));
    return { subject: subject, body: L.join("\n") };
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var errs = validate();
    if (errs.length) {
      var first = $(errs[0]);
      if (first) { first.scrollIntoView({ block: "center", behavior: "smooth" }); if (first.focus) first.focus({ preventScroll: true }); }
      return;
    }
    var msg = compose();
    var href = "mailto:" + EMAIL + "?subject=" + encodeURIComponent(msg.subject) + "&body=" + encodeURIComponent(msg.body);
    $("done-title").textContent = isOrder() ? "Bestellung bereit" : "Anfrage bereit";
    $("done-mail").textContent = EMAIL;
    $("done-text").textContent = "An: " + EMAIL + "\nBetreff: " + msg.subject + "\n\n" + msg.body;
    $("done-link").href = href;
    $("done").hidden = false;
    $("done").focus({ preventScroll: true });
    $("done").scrollIntoView({ block: "nearest", behavior: "smooth" });
    window.location.href = href;
  });

  $("done-copy").addEventListener("click", function (e) {
    var btn = e.currentTarget, text = $("done-text").textContent;
    var fallback = function () {
      var r = document.createRange(); r.selectNodeContents($("done-text"));
      var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
      btn.textContent = "Text markiert";
    };
    try {
      navigator.clipboard.writeText(text).then(function () {
        btn.textContent = "Kopiert";
        setTimeout(function () { btn.textContent = "Nachricht kopieren"; }, 1800);
      }, fallback);
    } catch (err) { fallback(); }
  });

  renderOrder();
  update();
})();

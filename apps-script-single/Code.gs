/**
 * LAEMU Stundenrapport – vollständiges Projekt in einer Datei.
 *
 * Erzeugt aus Config.gs, Calc.gs, Quotes.gs, Sheets.gs, Reminders.gs, Code.gs
 * sowie Index.html, Stylesheet.html und JavaScript.html mit
 * "node tools/build-appsscript-bundle.js". Änderungen bitte in
 * apps-script/ vornehmen, nicht hier.
 */

// ======================================================================
// Oberfläche (aus Index.html, Stylesheet.html und JavaScript.html)
// ======================================================================

var LAEMU_INDEX_HTML = [
  "<!DOCTYPE html>",
  "<html lang=\"de\">",
  "<head>",
  "  <base target=\"_top\">",
  "  <meta charset=\"utf-8\">",
  "  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">",
  "  <title>LAEMU Stundenrapport</title>",
  "  <link rel=\"icon\" href=\"data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20306.24%20200.18%22%20fill%3D%22%2523BC8C33%22%3E%3Cg%20transform%3D%22translate(-1073.084%2C578.345)%20scale(1%2C-1)%22%3E%3Cpath%20d%3D%22M1073.921%20430.496%20C1073.084%20421.815%201081.048%20414.777%201089.520%20416.848%20C1095.433%20418.291%201101.077%20420.641%201105.776%20424.214%20C1113.680%20430.217%201120.529%20439.635%201125.218%20448.345%20C1129.907%20457.055%201137.771%20480.619%201144.470%20480.559%20C1150.692%20480.499%201156.297%20467.598%201167.377%20447.897%20C1206.619%20378.163%201241.630%20450.007%201251.425%20475.114%20C1256.035%20486.910%201260.753%20497.950%201265.681%20509.727%20C1269.792%20519.572%201272.440%20526.540%201278.702%20526.640%20C1287.233%20526.779%201295.466%20494.854%201298.711%20481.126%20C1301.946%20467.399%201306.973%20453.541%201306.973%20453.541%20C1322.184%20410.407%201363.368%20398.173%201373.143%20405.061%20C1379.325%20409.412%201354.349%20412.279%201342.950%20458.340%20C1339.864%20470.803%201334.309%20490.812%201331.194%20506.730%20C1325.639%20535.101%201312.847%20563.164%201287.830%20569.237%20C1250.310%20578.345%201233.377%20531.448%201221.093%20502.460%20L1207.355%20469.360%20C1205.295%20464.094%201200.646%20457.822%201193.419%20469.648%20C1185.624%20482.410%201176.864%20495.969%201176.864%20495.969%20C1167.914%20509.727%201154.674%20517.213%201138.368%20514.256%20C1115.084%20510.035%201109.758%20472.914%201096.199%20453.273%20C1092.735%20448.255%201087.867%20443.457%201082.034%20441.158%20C1077.544%20439.386%201074.378%20435.314%201073.911%20430.506%20L1073.921%20430.496%20Z%22%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E\">",
  "  <style>",
  "/* LAEMU Stundenrapport – Gestaltung nach den Brand Guidelines",
  "   Klangschwarz #000000 · Bühnenweiss #FFFFFF · Silbergrau #EFEFEF",
  "   Klanggold #BC8C33 · Steingrau #505050",
  "   Schrift: Radona Norm (Markenschrift, falls installiert), sonst Figtree.",
  "",
  "   Aufbau: Grundgestaltung für kleine Geräte, darüber fluide Werte mit clamp()",
  "   und nur wenige Umbruchpunkte (380 / 480 / 720 / 900 px). */",
  "@import url('https://fonts.googleapis.com/css2?family=Figtree:ital,wght@0,300..900;1,300..900&family=Caveat:wght@400..700&display=swap');",
  "",
  ":root {",
  "  --black: #000000;",
  "  --white: #FFFFFF;",
  "  --silver: #EFEFEF;",
  "  --gold: #BC8C33;",
  "  --stone: #505050;",
  "  --line: #E3E3E3;",
  "  --line-strong: #C9C9C9;",
  "  --radius: 8px;",
  "  --radius-lg: 14px;",
  "  --shadow: 0 1px 2px rgba(0, 0, 0, .04), 0 12px 32px rgba(0, 0, 0, .06);",
  "  --font: 'Radona Norm', 'Figtree', 'Helvetica Neue', Helvetica, Arial, sans-serif;",
  "  --font-deco: 'Golden Hopes', 'Caveat', 'Segoe Script', cursive;",
  "",
  "  /* Fluide Masse */",
  "  --gap: clamp(8px, 2.2vw, 12px);",
  "  --card-pad: clamp(16px, 4.6vw, 28px);",
  "  --block-pad: clamp(18px, 4vw, 24px);",
  "  --tap: 44px;              /* Mindestgrösse für Touch-Bedienung */",
  "}",
  "",
  "* { box-sizing: border-box; }",
  "",
  "html {",
  "  -webkit-text-size-adjust: 100%;",
  "  text-size-adjust: 100%;",
  "}",
  "",
  "body {",
  "  margin: 0;",
  "  padding: 0;",
  "  background: var(--silver);",
  "  color: var(--black);",
  "  font-family: var(--font);",
  "  font-size: 16px;",
  "  line-height: 1.5;",
  "  overflow-x: hidden;",
  "  -webkit-font-smoothing: antialiased;",
  "  -webkit-tap-highlight-color: rgba(188, 140, 51, .18);",
  "}",
  "",
  "button, input { font-family: inherit; }",
  "button { touch-action: manipulation; }",
  "",
  ".page {",
  "  width: 100%;",
  "  max-width: 720px;",
  "  margin: 0 auto;",
  "  padding:",
  "    clamp(24px, 6vw, 44px)",
  "    max(clamp(14px, 4vw, 20px), env(safe-area-inset-right))",
  "    calc(clamp(40px, 9vw, 64px) + env(safe-area-inset-bottom))",
  "    max(clamp(14px, 4vw, 20px), env(safe-area-inset-left));",
  "}",
  "",
  "/* ---------- Kopf ---------- */",
  ".brand { text-align: center; margin-bottom: clamp(20px, 5vw, 28px); }",
  ".brand svg { width: clamp(140px, 42vw, 190px); height: auto; color: var(--black); display: inline-block; }",
  ".brand .claim {",
  "  font-style: italic;",
  "  color: var(--stone);",
  "  font-size: clamp(13px, 3.4vw, 14px);",
  "  margin-top: 10px;",
  "}",
  "",
  "/* ---------- Tagesspruch ---------- */",
  ".quote {",
  "  text-align: center;",
  "  margin: 0 auto clamp(20px, 4.5vw, 26px);",
  "  max-width: 30rem;",
  "}",
  ".quote .mark {",
  "  display: block;",
  "  width: clamp(17px, 4.2vw, 20px);",
  "  height: auto;",
  "  margin: 0 auto 8px;",
  "  color: var(--gold);",
  "  opacity: .8;",
  "}",
  ".quote p {",
  "  font-family: var(--font-deco);",
  "  font-size: clamp(16px, 3.9vw, 19px);",
  "  line-height: 1.35;",
  "  color: var(--gold);",
  "  margin: 0 0 6px;",
  "  text-wrap: balance;",
  "}",
  ".quote .author {",
  "  font-size: clamp(10px, 2.6vw, 11px);",
  "  letter-spacing: .12em;",
  "  text-transform: uppercase;",
  "  color: var(--stone);",
  "  opacity: .85;",
  "}",
  "",
  "/* ---------- Karte ---------- */",
  ".card {",
  "  background: var(--white);",
  "  border-radius: var(--radius-lg);",
  "  box-shadow: var(--shadow);",
  "  padding: 0 var(--card-pad) var(--card-pad);",
  "}",
  "",
  ".block { padding: var(--block-pad) 0; border-bottom: 1px solid var(--line); }",
  ".block:last-of-type { border-bottom: 0; }",
  ".block-head { display: flex; align-items: baseline; gap: 10px; margin-bottom: 14px; }",
  ".step {",
  "  font-size: 11px;",
  "  font-weight: 800;",
  "  letter-spacing: .1em;",
  "  color: var(--gold);",
  "  flex: 0 0 auto;",
  "}",
  ".block h2 { font-size: clamp(16px, 4.2vw, 17px); font-weight: 800; margin: 0; letter-spacing: -.01em; text-wrap: balance; }",
  ".block .hint { font-size: 13px; color: var(--stone); margin: -6px 0 14px; }",
  "",
  "label, .label {",
  "  display: block;",
  "  font-size: 11px;",
  "  font-weight: 700;",
  "  letter-spacing: .12em;",
  "  text-transform: uppercase;",
  "  color: var(--stone);",
  "  margin-bottom: 6px;",
  "}",
  "",
  "input[type=\"date\"], input[type=\"time\"], input[type=\"number\"], input[type=\"text\"] {",
  "  width: 100%;",
  "  min-width: 0;",
  "  min-height: var(--tap);",
  "  font-size: 16px;            /* verhindert das Hineinzoomen auf iOS */",
  "  color: var(--black);",
  "  background: var(--white);",
  "  border: 1px solid var(--line-strong);",
  "  border-radius: var(--radius);",
  "  padding: 11px 12px;",
  "  transition: border-color .15s ease, box-shadow .15s ease;",
  "}",
  "input:focus-visible {",
  "  outline: none;",
  "  border-color: var(--black);",
  "  box-shadow: 0 0 0 3px rgba(188, 140, 51, .22);",
  "}",
  "input[readonly] { background: var(--silver); color: var(--stone); }",
  ".field { min-width: 0; }",
  "",
  "/* ---------- Auswahl-Pillen ---------- */",
  ".pills { display: flex; flex-wrap: wrap; gap: var(--gap); }",
  ".pill {",
  "  font-size: 14px;",
  "  font-weight: 600;",
  "  color: var(--black);",
  "  background: var(--white);",
  "  border: 1px solid var(--line-strong);",
  "  border-radius: 999px;",
  "  padding: 10px 18px;",
  "  min-height: var(--tap);",
  "  cursor: pointer;",
  "  transition: background .15s ease, border-color .15s ease, color .15s ease;",
  "}",
  ".pill:hover { border-color: var(--black); }",
  ".pill[aria-pressed=\"true\"] {",
  "  background: var(--black);",
  "  border-color: var(--black);",
  "  color: var(--white);",
  "}",
  ".pill.gold[aria-pressed=\"true\"] { background: var(--gold); border-color: var(--gold); }",
  ".pill.small { font-size: 13.5px; padding: 8px 14px; font-weight: 500; }",
  ".pill:focus-visible { outline: 3px solid rgba(188, 140, 51, .5); outline-offset: 2px; }",
  "",
  ".default-note { font-size: 12.5px; color: var(--stone); margin: 12px 0 0; }",
  ".default-note strong { color: var(--black); }",
  "",
  "/* ---------- Datum ---------- */",
  ".date-row { display: flex; flex-wrap: wrap; gap: var(--gap); align-items: flex-end; }",
  ".date-row .field { flex: 1 1 100%; }",
  ".date-row .pills { flex: 1 1 100%; }",
  ".date-meta { margin-top: 12px; font-size: 13px; color: var(--stone); }",
  ".date-meta .tagday {",
  "  display: inline-block;",
  "  background: var(--silver);",
  "  border-radius: 999px;",
  "  padding: 3px 12px;",
  "  margin: 0 6px 4px 0;",
  "  font-weight: 600;",
  "  color: var(--black);",
  "}",
  ".date-meta .tagday.gold { background: rgba(188, 140, 51, .16); color: #7d5c18; }",
  "",
  "/* ---------- Projekt- und Abwesenheitsblöcke ---------- */",
  ".entry {",
  "  border: 1px solid var(--line);",
  "  border-radius: var(--radius);",
  "  padding: clamp(12px, 3.4vw, 16px);",
  "  margin-bottom: 12px;",
  "  background: var(--white);",
  "}",
  ".entry.absence { background: #FBF8F2; border-color: #EADFC8; }",
  ".entry-head {",
  "  display: flex;",
  "  justify-content: space-between;",
  "  align-items: center;",
  "  gap: 10px;",
  "  margin-bottom: 12px;",
  "}",
  ".entry-title { font-size: 12px; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; color: var(--stone); }",
  "",
  ".times {",
  "  display: grid;",
  "  grid-template-columns: 1fr 1fr;",
  "  gap: var(--gap);",
  "  align-items: end;",
  "  margin-top: 14px;",
  "}",
  ".times .result {",
  "  grid-column: 1 / -1;",
  "  display: flex;",
  "  align-items: baseline;",
  "  justify-content: flex-end;",
  "  gap: 6px;",
  "  border-top: 1px solid var(--line);",
  "  padding-top: 10px;",
  "}",
  ".times .result .value { font-size: clamp(20px, 5.4vw, 22px); font-weight: 800; letter-spacing: -.02em; }",
  ".times .result .unit { font-size: 12px; color: var(--stone); }",
  "",
  ".note-field { margin-top: 12px; }",
  "",
  ".icon-btn {",
  "  border: 0;",
  "  background: transparent;",
  "  color: var(--stone);",
  "  font-size: 13px;",
  "  font-weight: 600;",
  "  cursor: pointer;",
  "  padding: 8px 10px;",
  "  margin: -8px -10px -8px 0;",
  "  min-height: var(--tap);",
  "  border-radius: 6px;",
  "  white-space: nowrap;",
  "}",
  ".icon-btn:hover { color: var(--black); background: var(--silver); }",
  "",
  ".linkish {",
  "  border: 0;",
  "  background: transparent;",
  "  color: var(--black);",
  "  font-size: 14px;",
  "  font-weight: 700;",
  "  cursor: pointer;",
  "  padding: 12px 0;",
  "  min-height: var(--tap);",
  "  border-radius: 0;",
  "  text-align: left;",
  "  text-decoration: underline;",
  "  text-decoration-color: var(--gold);",
  "  text-decoration-thickness: 2px;",
  "  text-underline-offset: 5px;",
  "}",
  ".linkish:hover { color: var(--gold); }",
  ".linkish.subtle {",
  "  font-weight: 600;",
  "  font-size: 13.5px;",
  "  color: var(--stone);",
  "  text-decoration-color: var(--line-strong);",
  "}",
  ".linkish.subtle:hover { color: var(--black); text-decoration-color: var(--gold); }",
  ".linkish:focus-visible, .icon-btn:focus-visible, .submit:focus-visible {",
  "  outline: 3px solid rgba(188, 140, 51, .5);",
  "  outline-offset: 2px;",
  "}",
  "",
  ".actions-row {",
  "  display: flex;",
  "  flex-direction: column;",
  "  align-items: flex-start;",
  "  gap: 4px;",
  "  margin-top: 4px;",
  "}",
  "",
  "/* ---------- Pause ---------- */",
  ".pause-row { display: flex; flex-wrap: wrap; gap: var(--gap); align-items: flex-end; }",
  ".pause-row .field { flex: 1 1 100%; }",
  ".pause-row .pills { flex: 1 1 100%; }",
  "",
  "/* ---------- Zusammenfassung ---------- */",
  ".summary {",
  "  background: var(--black);",
  "  color: var(--white);",
  "  border-radius: var(--radius-lg);",
  "  padding: clamp(18px, 4.6vw, 24px);",
  "  margin-top: 8px;",
  "}",
  ".summary h3 {",
  "  margin: 0 0 14px;",
  "  font-size: 11.5px;",
  "  letter-spacing: .14em;",
  "  text-transform: uppercase;",
  "  color: rgba(255, 255, 255, .6);",
  "  font-weight: 700;",
  "}",
  ".summary-line {",
  "  display: flex;",
  "  justify-content: space-between;",
  "  gap: 12px;",
  "  padding: 7px 0;",
  "  font-size: clamp(13.5px, 3.6vw, 14px);",
  "  color: rgba(255, 255, 255, .78);",
  "}",
  ".summary-line span:last-child {",
  "  font-variant-numeric: tabular-nums;",
  "  color: var(--white);",
  "  font-weight: 600;",
  "  white-space: nowrap;",
  "}",
  ".summary-total {",
  "  display: flex;",
  "  justify-content: space-between;",
  "  align-items: baseline;",
  "  gap: 12px;",
  "  border-top: 1px solid rgba(255, 255, 255, .18);",
  "  margin-top: 12px;",
  "  padding-top: 16px;",
  "}",
  ".summary-total .lbl {",
  "  font-size: clamp(12px, 3.2vw, 13px);",
  "  letter-spacing: .08em;",
  "  text-transform: uppercase;",
  "  color: rgba(255, 255, 255, .7);",
  "}",
  ".summary-total .val {",
  "  font-size: clamp(28px, 8vw, 34px);",
  "  font-weight: 800;",
  "  letter-spacing: -.03em;",
  "  color: var(--gold);",
  "  font-variant-numeric: tabular-nums;",
  "  white-space: nowrap;",
  "}",
  ".summary-total .val small { font-size: .45em; font-weight: 600; margin-left: 4px; color: rgba(255, 255, 255, .6); }",
  "",
  "/* ---------- Submit ---------- */",
  ".submit {",
  "  width: 100%;",
  "  margin-top: 20px;",
  "  background: var(--black);",
  "  color: var(--white);",
  "  font-size: 16px;",
  "  font-weight: 700;",
  "  border: 0;",
  "  border-radius: var(--radius);",
  "  padding: 17px 20px;",
  "  min-height: 52px;",
  "  cursor: pointer;",
  "  transition: background .15s ease, transform .1s ease;",
  "}",
  ".submit:hover { background: #1c1c1c; }",
  ".submit:active { transform: translateY(1px); }",
  ".submit[disabled] { background: var(--line-strong); cursor: not-allowed; }",
  "",
  ".errors {",
  "  margin-top: 16px;",
  "  border-left: 3px solid var(--gold);",
  "  background: #FBF6EC;",
  "  padding: 14px 16px;",
  "  border-radius: 0 var(--radius) var(--radius) 0;",
  "  font-size: 14px;",
  "}",
  ".errors ul { margin: 6px 0 0; padding-left: 18px; }",
  ".errors li { margin: 3px 0; }",
  "",
  "/* ---------- Kennzahlen ---------- */",
  ".stats {",
  "  margin-top: clamp(18px, 4.5vw, 26px);",
  "  display: grid;",
  "  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));",
  "  gap: var(--gap);",
  "}",
  ".stat {",
  "  background: var(--white);",
  "  border-radius: var(--radius-lg);",
  "  padding: clamp(16px, 4.4vw, 22px);",
  "  box-shadow: var(--shadow);",
  "}",
  ".stat .k { font-size: 11px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: var(--stone); }",
  ".stat .v {",
  "  font-size: clamp(26px, 7.4vw, 32px);",
  "  font-weight: 800;",
  "  letter-spacing: -.03em;",
  "  margin-top: 8px;",
  "  font-variant-numeric: tabular-nums;",
  "  line-height: 1.1;",
  "}",
  ".stat .v small { font-size: .48em; font-weight: 600; }",
  ".stat .v.gold { color: var(--gold); }",
  ".stat .s { font-size: 12.5px; color: var(--stone); margin-top: 6px; }",
  ".stat.wide { grid-column: 1 / -1; }",
  "",
  ".reminder {",
  "  margin-top: var(--gap);",
  "  background: var(--white);",
  "  border-left: 3px solid var(--gold);",
  "  border-radius: 0 var(--radius) var(--radius) 0;",
  "  padding: 14px 16px;",
  "  font-size: 13.5px;",
  "  color: var(--stone);",
  "  box-shadow: var(--shadow);",
  "}",
  ".reminder strong { color: var(--black); }",
  "",
  ".foot { text-align: center; margin-top: clamp(24px, 6vw, 34px); font-size: 12.5px; color: var(--stone); }",
  "",
  "/* ---------- Erfolgsmeldung ---------- */",
  ".overlay {",
  "  position: fixed;",
  "  inset: 0;",
  "  background: rgba(239, 239, 239, .96);",
  "  display: flex;",
  "  align-items: center;",
  "  justify-content: center;",
  "  padding: clamp(12px, 4vw, 24px);",
  "  padding-bottom: calc(clamp(12px, 4vw, 24px) + env(safe-area-inset-bottom));",
  "  z-index: 50;",
  "  overflow-y: auto;",
  "  overscroll-behavior: contain;",
  "  opacity: 0;",
  "  pointer-events: none;",
  "  transition: opacity .25s ease;",
  "}",
  ".overlay.show { opacity: 1; pointer-events: auto; }",
  ".overlay-inner {",
  "  background: var(--white);",
  "  border-radius: var(--radius-lg);",
  "  box-shadow: var(--shadow);",
  "  padding: clamp(28px, 7vw, 44px) clamp(20px, 5.5vw, 34px) clamp(22px, 5vw, 34px);",
  "  max-width: 460px;",
  "  width: 100%;",
  "  margin: auto;",
  "  text-align: center;",
  "  transform: translateY(10px);",
  "  transition: transform .25s ease;",
  "}",
  ".overlay.show .overlay-inner { transform: translateY(0); }",
  ".overlay-inner .wave { width: clamp(58px, 16vw, 74px); color: var(--gold); margin: 0 auto 16px; }",
  ".overlay-inner .wave svg { width: 100%; height: auto; display: block; }",
  ".overlay-inner h2 { font-size: clamp(24px, 7vw, 30px); font-weight: 800; margin: 0 0 8px; letter-spacing: -.02em; text-wrap: balance; }",
  ".overlay-inner p { color: var(--stone); margin: 0 0 6px; font-size: clamp(14px, 3.8vw, 15px); }",
  ".overlay-inner .recap {",
  "  margin: 20px 0 6px;",
  "  border-top: 1px solid var(--line);",
  "  border-bottom: 1px solid var(--line);",
  "  padding: 14px 0;",
  "  text-align: left;",
  "}",
  ".overlay-inner .recap div { display: flex; justify-content: space-between; gap: 12px; font-size: 14px; padding: 5px 0; }",
  ".overlay-inner .recap span:last-child { font-weight: 700; font-variant-numeric: tabular-nums; white-space: nowrap; }",
  ".overlay-inner .again { margin-top: 20px; }",
  "",
  ".busy { opacity: .55; pointer-events: none; }",
  ".visually-hidden { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }",
  "",
  "/* ---------- Umbruchpunkte ---------- */",
  "",
  "/* Ab 380 px passen Stunden neben die Zeitfelder nicht, aber Zahl und Einheit",
  "   dürfen mehr Raum bekommen. */",
  "@media (min-width: 380px) {",
  "  .entry-title { font-size: 12.5px; letter-spacing: .12em; }",
  "}",
  "",
  "/* Ab 480 px: Datum, Pause und Schnellwahl nebeneinander, Stunden in derselben",
  "   Zeile wie die Zeitfelder. */",
  "@media (min-width: 480px) {",
  "  .date-row .field { flex: 1 1 220px; }",
  "  .date-row .pills { flex: 0 1 auto; padding-bottom: 2px; }",
  "  .pause-row .field { flex: 0 0 132px; }",
  "  .pause-row .pills { flex: 1 1 auto; padding-bottom: 2px; }",
  "",
  "  .times { grid-template-columns: 1fr 1fr auto; }",
  "  .times .result {",
  "    grid-column: auto;",
  "    border-top: 0;",
  "    padding-top: 0;",
  "    padding-bottom: 11px;",
  "    min-width: 92px;",
  "    flex-direction: column;",
  "    align-items: flex-end;",
  "    gap: 0;",
  "  }",
  "",
  "  .actions-row {",
  "    flex-direction: row;",
  "    align-items: center;",
  "    justify-content: space-between;",
  "    gap: 10px 20px;",
  "    flex-wrap: wrap;",
  "  }",
  "  .block .hint { margin-left: 28px; }",
  "}",
  "",
  "/* Ab 720 px steht genügend Platz für den vollen Innenabstand zur Verfügung. */",
  "@media (min-width: 720px) {",
  "  .stats { grid-template-columns: 1fr 1fr; }",
  "}",
  "",
  "/* Grosse Bildschirme: die Karte bleibt lesbar schmal, bekommt aber Luft. */",
  "@media (min-width: 900px) {",
  "  .page { max-width: 760px; }",
  "}",
  "",
  "/* Touch-Bedienung: keine Hover-Effekte, die hängen bleiben. */",
  "@media (hover: none) {",
  "  .pill:hover { border-color: var(--line-strong); }",
  "  .submit:hover { background: var(--black); }",
  "}",
  "",
  "/* Niedrige Fenster (Querformat am Telefon): Erfolgsmeldung darf scrollen. */",
  "@media (max-height: 560px) {",
  "  .overlay { align-items: flex-start; }",
  "  .overlay-inner { padding-top: 24px; padding-bottom: 20px; }",
  "  .overlay-inner .wave { width: 48px; margin-bottom: 10px; }",
  "}",
  "",
  "@media (prefers-reduced-motion: reduce) {",
  "  * { animation-duration: .001ms !important; transition-duration: .001ms !important; }",
  "}",
  "</style>",
  "</head>",
  "<body>",
  "<div class=\"page\">",
  "",
  "  <!-- 1. LAEMU-Logo -->",
  "  <header class=\"brand\">",
  "    <svg role=\"img\" aria-label=\"LAEMU\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 679.57 168.55\" fill=\"currentColor\"><g transform=\"translate(-884.201,599.433) scale(1,-1)\" fill-rule=\"nonzero\"><path d=\"M1436.668 498.385 C1434.070 508.879 1429.395 525.728 1426.772 539.131 C1422.096 563.020 1411.328 586.650 1390.270 591.763 C1358.687 599.433 1344.433 559.944 1334.093 535.535 L1322.529 507.664 C1320.794 503.230 1316.881 497.949 1310.797 507.907 C1304.236 518.653 1296.862 530.070 1296.862 530.070 C1289.329 541.654 1278.184 547.957 1264.458 545.468 C1244.858 541.914 1240.375 510.656 1228.962 494.118 C1224.914 488.242 1218.588 482.743 1210.945 482.718 L1210.945 482.643 L1149.321 482.643 L1149.321 515.837 L1207.166 515.837 L1207.166 536.700 L1149.321 536.700 L1149.321 568.443 L1219.132 568.443 L1219.132 589.307 L1124.660 589.307 L1124.660 461.788 L1208.943 461.788 C1218.454 461.763 1229.272 463.783 1237.014 469.659 C1243.668 474.713 1249.433 482.643 1253.380 489.977 C1257.335 497.320 1263.947 517.153 1269.586 517.102 C1274.823 517.052 1279.541 506.189 1288.868 489.600 C1321.900 430.883 1351.372 491.377 1359.617 512.517 C1363.497 522.450 1367.469 531.746 1371.617 541.662 C1375.078 549.952 1377.307 555.820 1382.577 555.904 C1389.759 556.021 1396.689 529.139 1399.421 517.580 C1402.144 506.021 1406.376 494.353 1406.376 494.353 C1419.180 458.033 1453.846 447.731 1462.075 453.531 C1467.279 457.195 1446.254 459.609 1436.660 498.393 L1436.668 498.385 Z\"/><path d=\"M908.686 589.307 L884.201 589.307 L884.201 461.788 L968.316 461.788 L976.453 482.643 L908.686 482.643 L908.686 589.307 Z\"/><path d=\"M1037.432 589.307 L987.204 461.788 L1011.321 461.788 L1021.477 488.812 L1075.149 488.812 L1085.481 461.788 L1111.776 461.788 L1061.004 589.307 L1037.432 589.307 Z M1029.446 509.676 L1048.308 559.374 L1067.171 509.676 L1029.454 509.676 L1029.446 509.676 Z\"/><path d=\"M1539.295 589.306 L1539.295 514.210 C1539.295 493.715 1528.418 482.106 1509.371 482.106 C1489.243 482.106 1479.271 492.810 1479.271 514.210 L1479.271 589.306 L1454.610 589.306 L1454.610 510.220 C1454.610 479.382 1475.467 459.977 1509.371 459.977 C1543.275 459.977 1563.772 479.566 1563.772 510.220 L1563.772 589.306 L1539.295 589.306 Z\"/></g></svg>",
  "    <div class=\"claim\">Am Puls der Ländlermusik.</div>",
  "  </header>",
  "",
  "  <!-- 2. Spruch des Tages -->",
  "  <section class=\"quote\" aria-label=\"Spruch des Tages\">",
  "    <svg class=\"mark\" aria-hidden=\"true\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 306.24 200.18\" fill=\"currentColor\"><g transform=\"translate(-1073.084,578.345) scale(1,-1)\"><path d=\"M1073.921 430.496 C1073.084 421.815 1081.048 414.777 1089.520 416.848 C1095.433 418.291 1101.077 420.641 1105.776 424.214 C1113.680 430.217 1120.529 439.635 1125.218 448.345 C1129.907 457.055 1137.771 480.619 1144.470 480.559 C1150.692 480.499 1156.297 467.598 1167.377 447.897 C1206.619 378.163 1241.630 450.007 1251.425 475.114 C1256.035 486.910 1260.753 497.950 1265.681 509.727 C1269.792 519.572 1272.440 526.540 1278.702 526.640 C1287.233 526.779 1295.466 494.854 1298.711 481.126 C1301.946 467.399 1306.973 453.541 1306.973 453.541 C1322.184 410.407 1363.368 398.173 1373.143 405.061 C1379.325 409.412 1354.349 412.279 1342.950 458.340 C1339.864 470.803 1334.309 490.812 1331.194 506.730 C1325.639 535.101 1312.847 563.164 1287.830 569.237 C1250.310 578.345 1233.377 531.448 1221.093 502.460 L1207.355 469.360 C1205.295 464.094 1200.646 457.822 1193.419 469.648 C1185.624 482.410 1176.864 495.969 1176.864 495.969 C1167.914 509.727 1154.674 517.213 1138.368 514.256 C1115.084 510.035 1109.758 472.914 1096.199 453.273 C1092.735 448.255 1087.867 443.457 1082.034 441.158 C1077.544 439.386 1074.378 435.314 1073.911 430.506 L1073.921 430.496 Z\"/></g></svg>",
  "    <p id=\"quoteText\">&nbsp;</p>",
  "    <div class=\"author\" id=\"quoteAuthor\"></div>",
  "  </section>",
  "",
  "  <main class=\"card\">",
  "",
  "    <!-- 3. Mitarbeiter -->",
  "    <section class=\"block\">",
  "      <div class=\"block-head\"><span class=\"step\">01</span><h2>Wer erfasst?</h2></div>",
  "      <div class=\"pills\" id=\"employeePills\"></div>",
  "      <p class=\"default-note\" id=\"employeeNote\"></p>",
  "    </section>",
  "",
  "    <!-- 4. Datum -->",
  "    <section class=\"block\">",
  "      <div class=\"block-head\"><span class=\"step\">02</span><h2>Für welchen Tag?</h2></div>",
  "      <div class=\"date-row\">",
  "        <div class=\"field\">",
  "          <label for=\"dateInput\">Datum</label>",
  "          <input type=\"date\" id=\"dateInput\">",
  "        </div>",
  "        <div class=\"pills\">",
  "          <button type=\"button\" class=\"pill small\" data-shift=\"0\">Heute</button>",
  "          <button type=\"button\" class=\"pill small\" data-shift=\"-1\">Gestern</button>",
  "          <button type=\"button\" class=\"pill small\" data-shift=\"-2\">Vorgestern</button>",
  "        </div>",
  "      </div>",
  "      <div class=\"date-meta\" id=\"dateMeta\"></div>",
  "    </section>",
  "",
  "    <!-- 5. Projekte -->",
  "    <section class=\"block\">",
  "      <div class=\"block-head\"><span class=\"step\">03</span><h2>Woran hast du gearbeitet?</h2></div>",
  "      <p class=\"hint\">Projekt wählen, Arbeitsbeginn und Arbeitsende erfassen – die Stunden werden automatisch in Dezimalstellen berechnet.</p>",
  "      <div id=\"projectList\"></div>",
  "      <div class=\"actions-row\">",
  "        <button type=\"button\" class=\"linkish\" id=\"addProject\">+ Weiteres Projekt erfassen</button>",
  "        <!-- 6. Link «Weiteres» -->",
  "        <button type=\"button\" class=\"linkish subtle\" id=\"addAbsence\">+ Weiteres (Ferien, Feiertag, Krank …)</button>",
  "      </div>",
  "      <div id=\"absenceList\" style=\"margin-top:16px\"></div>",
  "    </section>",
  "",
  "    <!-- 7. Pause -->",
  "    <section class=\"block\">",
  "      <div class=\"block-head\"><span class=\"step\">04</span><h2>Pausenzeit</h2></div>",
  "      <div class=\"pause-row\">",
  "        <div class=\"field\">",
  "          <label for=\"pauseInput\">Minuten</label>",
  "          <input type=\"number\" id=\"pauseInput\" min=\"0\" max=\"720\" step=\"5\" value=\"0\" inputmode=\"numeric\">",
  "        </div>",
  "        <div class=\"pills\">",
  "          <button type=\"button\" class=\"pill small\" data-pause=\"0\">Keine</button>",
  "          <button type=\"button\" class=\"pill small\" data-pause=\"15\">15 Min</button>",
  "          <button type=\"button\" class=\"pill small\" data-pause=\"30\">30 Min</button>",
  "          <button type=\"button\" class=\"pill small\" data-pause=\"45\">45 Min</button>",
  "          <button type=\"button\" class=\"pill small\" data-pause=\"60\">60 Min</button>",
  "        </div>",
  "      </div>",
  "    </section>",
  "",
  "    <!-- 8. Total -->",
  "    <section class=\"block\">",
  "      <div class=\"block-head\"><span class=\"step\">05</span><h2>Total</h2></div>",
  "      <div class=\"summary\">",
  "        <h3>Zusammenzug des Tages</h3>",
  "        <div id=\"summaryLines\"></div>",
  "        <div class=\"summary-total\">",
  "          <span class=\"lbl\">Total Tag</span>",
  "          <span class=\"val\" id=\"dayTotal\">0.00<small>h</small></span>",
  "        </div>",
  "      </div>",
  "",
  "      <!-- 10. Einreichen -->",
  "      <button type=\"button\" class=\"submit\" id=\"submitBtn\">Einreichen →</button>",
  "      <div id=\"formErrors\"></div>",
  "    </section>",
  "  </main>",
  "",
  "  <!-- 9. Überstunden und Ferien -->",
  "  <section class=\"stats\" id=\"stats\" aria-live=\"polite\"></section>",
  "  <div id=\"reminderBox\"></div>",
  "",
  "  <p class=\"foot\">",
  "    Wöchentliche Arbeitszeit <strong id=\"footWeekly\">42</strong> Stunden ·",
  "    Feiertage Kanton Schwyz werden gutgeschrieben, wenn sie auf Montag bis Freitag fallen.",
  "  </p>",
  "</div>",
  "",
  "<!-- 12. Erfolgsnachricht -->",
  "<div class=\"overlay\" id=\"successOverlay\" role=\"dialog\" aria-modal=\"true\">",
  "  <div class=\"overlay-inner\">",
  "    <div class=\"wave\"><svg aria-hidden=\"true\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 306.24 200.18\" fill=\"currentColor\"><g transform=\"translate(-1073.084,578.345) scale(1,-1)\"><path d=\"M1073.921 430.496 C1073.084 421.815 1081.048 414.777 1089.520 416.848 C1095.433 418.291 1101.077 420.641 1105.776 424.214 C1113.680 430.217 1120.529 439.635 1125.218 448.345 C1129.907 457.055 1137.771 480.619 1144.470 480.559 C1150.692 480.499 1156.297 467.598 1167.377 447.897 C1206.619 378.163 1241.630 450.007 1251.425 475.114 C1256.035 486.910 1260.753 497.950 1265.681 509.727 C1269.792 519.572 1272.440 526.540 1278.702 526.640 C1287.233 526.779 1295.466 494.854 1298.711 481.126 C1301.946 467.399 1306.973 453.541 1306.973 453.541 C1322.184 410.407 1363.368 398.173 1373.143 405.061 C1379.325 409.412 1354.349 412.279 1342.950 458.340 C1339.864 470.803 1334.309 490.812 1331.194 506.730 C1325.639 535.101 1312.847 563.164 1287.830 569.237 C1250.310 578.345 1233.377 531.448 1221.093 502.460 L1207.355 469.360 C1205.295 464.094 1200.646 457.822 1193.419 469.648 C1185.624 482.410 1176.864 495.969 1176.864 495.969 C1167.914 509.727 1154.674 517.213 1138.368 514.256 C1115.084 510.035 1109.758 472.914 1096.199 453.273 C1092.735 448.255 1087.867 443.457 1082.034 441.158 C1077.544 439.386 1074.378 435.314 1073.911 430.506 L1073.921 430.496 Z\"/></g></svg></div>",
  "    <h2 id=\"successTitle\">Danke!</h2>",
  "    <p id=\"successSub\"></p>",
  "    <div class=\"recap\" id=\"successRecap\"></div>",
  "    <p id=\"successReminder\" style=\"margin-top:14px\"></p>",
  "    <button type=\"button\" class=\"submit again\" id=\"againBtn\">Weiteren Tag erfassen</button>",
  "  </div>",
  "</div>",
  "",
  "<script>",
  "  var LAEMU_BOOTSTRAP = <?!= bootstrap ?>;",
  "</script>",
  "<script>",
  "/* LAEMU Stundenrapport – Bedienlogik",
  "   Die Berechnung im Browser dient der sofortigen Anzeige; verbindlich ist",
  "   immer die Berechnung im Backend (Calc.gs), die beim Einreichen läuft. */",
  "(function () {",
  "  'use strict';",
  "",
  "  var B = window.LAEMU_BOOTSTRAP || {};",
  "  var STORAGE_KEY = 'laemu.stundenrapport.mitarbeiter';",
  "",
  "  var state = {",
  "    employee: null,",
  "    date: B.today,",
  "    projects: [],",
  "    absences: [],",
  "    pause: 0,",
  "    dayState: null,",
  "    stats: null,",
  "    dailyTarget: B.dailyTarget || 8.4,",
  "    loading: false",
  "  };",
  "",
  "  var el = {",
  "    quoteText: document.getElementById('quoteText'),",
  "    quoteAuthor: document.getElementById('quoteAuthor'),",
  "    employeePills: document.getElementById('employeePills'),",
  "    employeeNote: document.getElementById('employeeNote'),",
  "    dateInput: document.getElementById('dateInput'),",
  "    dateMeta: document.getElementById('dateMeta'),",
  "    projectList: document.getElementById('projectList'),",
  "    absenceList: document.getElementById('absenceList'),",
  "    addProject: document.getElementById('addProject'),",
  "    addAbsence: document.getElementById('addAbsence'),",
  "    pauseInput: document.getElementById('pauseInput'),",
  "    summaryLines: document.getElementById('summaryLines'),",
  "    dayTotal: document.getElementById('dayTotal'),",
  "    submitBtn: document.getElementById('submitBtn'),",
  "    formErrors: document.getElementById('formErrors'),",
  "    stats: document.getElementById('stats'),",
  "    reminderBox: document.getElementById('reminderBox'),",
  "    footWeekly: document.getElementById('footWeekly'),",
  "    overlay: document.getElementById('successOverlay'),",
  "    successTitle: document.getElementById('successTitle'),",
  "    successSub: document.getElementById('successSub'),",
  "    successRecap: document.getElementById('successRecap'),",
  "    successReminder: document.getElementById('successReminder'),",
  "    againBtn: document.getElementById('againBtn')",
  "  };",
  "",
  "  /* ---------- Hilfsfunktionen ---------- */",
  "",
  "  function round2(v) { return Math.round((Number(v) + Number.EPSILON) * 100) / 100; }",
  "  function fmt(v) { return round2(v).toFixed(2); }",
  "  function signed(v) { return (Number(v) > 0 ? '+' : '') + fmt(v); }",
  "",
  "  function escapeHtml(text) {",
  "    return String(text == null ? '' : text).replace(/[&<>\"']/g, function (c) {",
  "      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '\"': '&quot;', \"'\": '&#39;' }[c];",
  "    });",
  "  }",
  "",
  "  function minutesOfDay(value) {",
  "    var m = /^(\\d{1,2}):(\\d{2})$/.exec(String(value || ''));",
  "    if (!m) return null;",
  "    return Number(m[1]) * 60 + Number(m[2]);",
  "  }",
  "",
  "  function hoursBetween(from, to) {",
  "    var f = minutesOfDay(from), t = minutesOfDay(to);",
  "    if (f === null || t === null || t <= f) return 0;",
  "    return round2((t - f) / 60);",
  "  }",
  "",
  "  function addDays(iso, days) {",
  "    var p = iso.split('-');",
  "    var d = new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]), 12, 0, 0);",
  "    d.setDate(d.getDate() + days);",
  "    var m = d.getMonth() + 1, dd = d.getDate();",
  "    return d.getFullYear() + '-' + (m < 10 ? '0' + m : m) + '-' + (dd < 10 ? '0' + dd : dd);",
  "  }",
  "",
  "  function formatDate(iso) {",
  "    var p = String(iso).split('-');",
  "    return p[2] + '.' + p[1] + '.' + p[0];",
  "  }",
  "",
  "  function currentEmployee() {",
  "    for (var i = 0; i < B.employees.length; i++) {",
  "      if (B.employees[i].name === state.employee) return B.employees[i];",
  "    }",
  "    return null;",
  "  }",
  "",
  "  function server(method, args, onOk, onErr) {",
  "    var runner = window.google && google.script && google.script.run;",
  "    if (!runner) {",
  "      if (onErr) onErr(new Error('Keine Verbindung zum Server.'));",
  "      return;",
  "    }",
  "    google.script.run",
  "      .withSuccessHandler(onOk)",
  "      .withFailureHandler(onErr || function (e) { showErrors([String(e && e.message || e)]); })[method]",
  "      .apply(null, args);",
  "  }",
  "",
  "  /* ---------- Tagesspruch ---------- */",
  "",
  "  function renderQuote() {",
  "    if (!B.quote) return;",
  "    el.quoteText.textContent = '«' + B.quote.text + '»';",
  "    el.quoteAuthor.textContent = B.quote.author + ' · ' + (B.todayLabel || '');",
  "  }",
  "",
  "  /* ---------- Mitarbeitende ---------- */",
  "",
  "  function renderEmployees() {",
  "    el.employeePills.innerHTML = '';",
  "    B.employees.forEach(function (emp) {",
  "      var b = document.createElement('button');",
  "      b.type = 'button';",
  "      b.className = 'pill';",
  "      b.textContent = emp.name;",
  "      b.setAttribute('aria-pressed', String(emp.name === state.employee));",
  "      b.addEventListener('click', function () { selectEmployee(emp.name, true); });",
  "      el.employeePills.appendChild(b);",
  "    });",
  "    var emp = currentEmployee();",
  "    el.employeeNote.innerHTML = emp",
  "      ? 'Auf diesem Gerät als Standard gespeichert: <strong>' + escapeHtml(emp.name) + '</strong>.'",
  "      : 'Bitte wählen – die Auswahl wird auf diesem Gerät als Standard gespeichert.';",
  "  }",
  "",
  "  function selectEmployee(name, persist) {",
  "    state.employee = name;",
  "    if (persist) {",
  "      try { window.localStorage.setItem(STORAGE_KEY, name); } catch (e) { /* Privatmodus */ }",
  "    }",
  "    var emp = currentEmployee();",
  "    if (emp) state.dailyTarget = emp.dailyTarget || state.dailyTarget;",
  "    renderEmployees();",
  "    loadDay();",
  "  }",
  "",
  "  /* ---------- Datum ---------- */",
  "",
  "  var WEEKDAYS = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];",
  "",
  "  function localWeekday(iso) {",
  "    var p = iso.split('-');",
  "    var d = new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]), 12, 0, 0);",
  "    return WEEKDAYS[(d.getDay() + 6) % 7];",
  "  }",
  "",
  "  function renderDateMeta() {",
  "    var d = state.dayState && state.dayState.date === state.date ? state.dayState : null;",
  "    var parts = [];",
  "    var weekday = d ? d.weekday : localWeekday(state.date);",
  "    if (weekday) parts.push('<span class=\"tagday\">' + escapeHtml(weekday) + '</span>');",
  "    if (d && d.holiday) {",
  "      parts.push('<span class=\"tagday gold\">' + escapeHtml(d.holiday) + '</span>');",
  "      parts.push(d.isWeekend",
  "        ? 'Feiertag am Wochenende – keine Gutschrift.'",
  "        : 'Feiertag: ' + fmt(state.dailyTarget) + ' h werden automatisch gutgeschrieben.');",
  "    } else if (d && d.isWeekend) {",
  "      parts.push('Wochenende – kein Soll, erfasste Arbeit zählt vollumfänglich.');",
  "    }",
  "    if (d && d.beforeStart) {",
  "      parts.push('<br>Hinweis: Dieses Datum liegt vor dem Anstellungsbeginn (' + formatDate(d.startDate) + ').');",
  "    }",
  "    if (d && d.existing) {",
  "      parts.push('<br><strong>Für diesen Tag sind bereits Einträge erfasst.</strong> Sie sind unten geladen und werden beim Einreichen ersetzt.');",
  "    }",
  "    el.dateMeta.innerHTML = parts.join(' ');",
  "  }",
  "",
  "  /* ---------- Projekte ---------- */",
  "",
  "  function emptyProject() { return { tag: '', from: '', to: '', note: '' }; }",
  "",
  "  function renderProjects() {",
  "    el.projectList.innerHTML = '';",
  "    state.projects.forEach(function (project, index) {",
  "      el.projectList.appendChild(projectNode(project, index));",
  "    });",
  "  }",
  "",
  "  function projectNode(project, index) {",
  "    var wrap = document.createElement('div');",
  "    wrap.className = 'entry';",
  "",
  "    var head = document.createElement('div');",
  "    head.className = 'entry-head';",
  "    var title = document.createElement('span');",
  "    title.className = 'entry-title';",
  "    title.textContent = 'Projekt ' + (index + 1);",
  "    head.appendChild(title);",
  "    if (state.projects.length > 1) {",
  "      var del = document.createElement('button');",
  "      del.type = 'button';",
  "      del.className = 'icon-btn';",
  "      del.textContent = '✕ Entfernen';",
  "      del.addEventListener('click', function () {",
  "        state.projects.splice(index, 1);",
  "        renderProjects();",
  "        recalc();",
  "      });",
  "      head.appendChild(del);",
  "    }",
  "    wrap.appendChild(head);",
  "",
  "    var pills = document.createElement('div');",
  "    pills.className = 'pills';",
  "    (B.projectTags || []).forEach(function (tag) {",
  "      var b = document.createElement('button');",
  "      b.type = 'button';",
  "      b.className = 'pill';",
  "      b.textContent = tag;",
  "      b.setAttribute('aria-pressed', String(project.tag === tag));",
  "      b.addEventListener('click', function () {",
  "        project.tag = project.tag === tag ? '' : tag;",
  "        Array.prototype.forEach.call(pills.children, function (child) {",
  "          child.setAttribute('aria-pressed', String(child.textContent === project.tag));",
  "        });",
  "        noteField.style.display = project.tag === 'Weiteres' ? '' : 'none';",
  "        if (project.tag !== 'Weiteres') { project.note = ''; noteInput.value = ''; }",
  "      });",
  "      pills.appendChild(b);",
  "    });",
  "    wrap.appendChild(pills);",
  "",
  "    var times = document.createElement('div');",
  "    times.className = 'times';",
  "    var hoursValue = document.createElement('span');",
  "",
  "    function timeField(labelText, key) {",
  "      var field = document.createElement('div');",
  "      field.className = 'field';",
  "      var id = 'p' + index + key;",
  "      field.innerHTML = '<label for=\"' + id + '\">' + labelText + '</label>';",
  "      var input = document.createElement('input');",
  "      input.type = 'time';",
  "      input.id = id;",
  "      input.step = '300';",
  "      input.value = project[key] || '';",
  "      input.addEventListener('input', function () {",
  "        project[key] = input.value;",
  "        hoursValue.textContent = fmt(hoursBetween(project.from, project.to));",
  "        recalc();",
  "      });",
  "      field.appendChild(input);",
  "      return field;",
  "    }",
  "",
  "    times.appendChild(timeField('Arbeitsbeginn', 'from'));",
  "    times.appendChild(timeField('Arbeitsende', 'to'));",
  "",
  "    var result = document.createElement('div');",
  "    result.className = 'result';",
  "    hoursValue.className = 'value';",
  "    hoursValue.textContent = fmt(hoursBetween(project.from, project.to));",
  "    result.appendChild(hoursValue);",
  "    var unit = document.createElement('div');",
  "    unit.className = 'unit';",
  "    unit.textContent = 'Stunden';",
  "    result.appendChild(unit);",
  "    times.appendChild(result);",
  "    wrap.appendChild(times);",
  "",
  "    var noteField = document.createElement('div');",
  "    noteField.className = 'note-field';",
  "    noteField.style.display = project.tag === 'Weiteres' ? '' : 'none';",
  "    noteField.innerHTML = '<label for=\"pn' + index + '\">Kurz beschreiben</label>';",
  "    var noteInput = document.createElement('input');",
  "    noteInput.type = 'text';",
  "    noteInput.id = 'pn' + index;",
  "    noteInput.placeholder = 'z. B. Auftritt Muotathal';",
  "    noteInput.value = project.note || '';",
  "    noteInput.addEventListener('input', function () { project.note = noteInput.value; });",
  "    noteField.appendChild(noteInput);",
  "    wrap.appendChild(noteField);",
  "",
  "    return wrap;",
  "  }",
  "",
  "  /* ---------- Weiteres (Abwesenheiten) ---------- */",
  "",
  "  function renderAbsences() {",
  "    el.absenceList.innerHTML = '';",
  "    state.absences.forEach(function (absence, index) {",
  "      el.absenceList.appendChild(absenceNode(absence, index));",
  "    });",
  "  }",
  "",
  "  function absenceNode(absence, index) {",
  "    var wrap = document.createElement('div');",
  "    wrap.className = 'entry absence';",
  "",
  "    var head = document.createElement('div');",
  "    head.className = 'entry-head';",
  "    var title = document.createElement('span');",
  "    title.className = 'entry-title';",
  "    title.textContent = 'Weiteres';",
  "    head.appendChild(title);",
  "    var del = document.createElement('button');",
  "    del.type = 'button';",
  "    del.className = 'icon-btn';",
  "    del.textContent = '✕ Entfernen';",
  "    del.addEventListener('click', function () {",
  "      state.absences.splice(index, 1);",
  "      renderAbsences();",
  "      recalc();",
  "    });",
  "    head.appendChild(del);",
  "    wrap.appendChild(head);",
  "",
  "    var pills = document.createElement('div');",
  "    pills.className = 'pills';",
  "    (B.absenceTags || []).forEach(function (tag) {",
  "      var b = document.createElement('button');",
  "      b.type = 'button';",
  "      b.className = 'pill gold';",
  "      b.textContent = tag;",
  "      b.setAttribute('aria-pressed', String(absence.tag === tag));",
  "      b.addEventListener('click', function () {",
  "        absence.tag = absence.tag === tag ? '' : tag;",
  "        Array.prototype.forEach.call(pills.children, function (child) {",
  "          child.setAttribute('aria-pressed', String(child.textContent === absence.tag));",
  "        });",
  "        // Die Stundeneingabe erscheint erst, wenn ein Tag gesetzt ist.",
  "        details.style.display = absence.tag ? '' : 'none';",
  "        noteField.style.display = absence.tag === 'Weiteres' ? '' : 'none';",
  "        recalc();",
  "      });",
  "      pills.appendChild(b);",
  "    });",
  "    wrap.appendChild(pills);",
  "",
  "    var details = document.createElement('div');",
  "    details.className = 'times';",
  "    details.style.display = absence.tag ? '' : 'none';",
  "",
  "    var field = document.createElement('div');",
  "    field.className = 'field';",
  "    field.innerHTML = '<label for=\"a' + index + 'h\">Anzahl Stunden</label>';",
  "    var hoursInput = document.createElement('input');",
  "    hoursInput.type = 'number';",
  "    hoursInput.id = 'a' + index + 'h';",
  "    hoursInput.min = '0';",
  "    hoursInput.max = '24';",
  "    hoursInput.step = '0.25';",
  "    hoursInput.inputMode = 'decimal';",
  "    hoursInput.value = absence.hours ? String(absence.hours) : '';",
  "    hoursInput.addEventListener('input', function () {",
  "      absence.hours = Number(hoursInput.value || 0);",
  "      recalc();",
  "    });",
  "    field.appendChild(hoursInput);",
  "    details.appendChild(field);",
  "",
  "    var quick = document.createElement('div');",
  "    quick.className = 'field';",
  "    quick.innerHTML = '<label>Quick Action</label>';",
  "    var full = document.createElement('button');",
  "    full.type = 'button';",
  "    full.className = 'pill';",
  "    full.textContent = 'Ganzer Tag (' + fmt(state.dailyTarget) + ' h)';",
  "    full.addEventListener('click', function () {",
  "      absence.hours = round2(state.dailyTarget);",
  "      hoursInput.value = String(absence.hours);",
  "      recalc();",
  "    });",
  "    quick.appendChild(full);",
  "    details.appendChild(quick);",
  "    wrap.appendChild(details);",
  "",
  "    var noteField = document.createElement('div');",
  "    noteField.className = 'note-field';",
  "    noteField.style.display = absence.tag === 'Weiteres' ? '' : 'none';",
  "    noteField.innerHTML = '<label for=\"an' + index + '\">Kurz beschreiben</label>';",
  "    var noteInput = document.createElement('input');",
  "    noteInput.type = 'text';",
  "    noteInput.id = 'an' + index;",
  "    noteInput.placeholder = 'z. B. Militärdienst';",
  "    noteInput.value = absence.note || '';",
  "    noteInput.addEventListener('input', function () { absence.note = noteInput.value; });",
  "    noteField.appendChild(noteInput);",
  "    wrap.appendChild(noteField);",
  "",
  "    return wrap;",
  "  }",
  "",
  "  /* ---------- Berechnung der Tagesanzeige ---------- */",
  "",
  "  function computeDay() {",
  "    var gross = 0;",
  "    state.projects.forEach(function (p) { gross += hoursBetween(p.from, p.to); });",
  "    gross = round2(gross);",
  "",
  "    var pause = round2(Number(state.pause || 0) / 60);",
  "    var work = round2(Math.max(0, gross - pause));",
  "",
  "    var absence = 0, bookedHoliday = 0, vacation = 0;",
  "    state.absences.forEach(function (a) {",
  "      var h = Number(a.hours || 0);",
  "      if (!a.tag || !(h > 0)) return;",
  "      absence += h;",
  "      if (a.tag === 'Feiertag') bookedHoliday += h;",
  "      if (a.tag === 'Ferien') vacation += h;",
  "    });",
  "    absence = round2(absence);",
  "",
  "    var d = state.dayState || {};",
  "    var target = d.isWeekend ? 0 : round2(state.dailyTarget);",
  "    var credit = (d.holiday && !d.isWeekend) ? round2(Math.max(0, state.dailyTarget - bookedHoliday)) : 0;",
  "    var total = round2(work + absence + credit);",
  "",
  "    return {",
  "      gross: gross, pause: pause, work: work, absence: absence,",
  "      credit: credit, total: total, target: target,",
  "      balance: round2(total - target),",
  "      vacationDays: round2(vacation / state.dailyTarget)",
  "    };",
  "  }",
  "",
  "  function recalc() {",
  "    var c = computeDay();",
  "    var lines = [];",
  "    function line(label, value) {",
  "      lines.push('<div class=\"summary-line\"><span>' + label + '</span><span>' + value + '</span></div>');",
  "    }",
  "    line('Projektzeit', fmt(c.gross) + ' h');",
  "    if (state.pause > 0) line('Pause', '− ' + fmt(c.pause) + ' h');",
  "    line('Gearbeitet', fmt(c.work) + ' h');",
  "    if (c.absence > 0) line('Weiteres (Ferien, Krank, …)', fmt(c.absence) + ' h');",
  "    if (c.credit > 0) line('Feiertagsgutschrift', fmt(c.credit) + ' h');",
  "    line('Sollzeit ' + (c.target === 0 ? '(Wochenende)' : ''), fmt(c.target) + ' h');",
  "    line('Saldo Tag', signed(c.balance) + ' h');",
  "    el.summaryLines.innerHTML = lines.join('');",
  "    el.dayTotal.innerHTML = fmt(c.total) + '<small>h</small>';",
  "  }",
  "",
  "  /* ---------- Kennzahlen ---------- */",
  "",
  "  function renderStats() {",
  "    var s = state.stats;",
  "    if (!s) {",
  "      el.stats.innerHTML = '<div class=\"stat wide\"><div class=\"k\">Überstunden</div><div class=\"v\">–</div>' +",
  "        '<div class=\"s\">Bitte Mitarbeiter:in wählen.</div></div>';",
  "      el.reminderBox.innerHTML = '';",
  "      return;",
  "    }",
  "    var tiles = [];",
  "    tiles.push('<div class=\"stat\"><div class=\"k\">Überstunden total</div>' +",
  "      '<div class=\"v gold\">' + signed(s.overtime) + '<small style=\"font-size:15px\"> h</small></div>' +",
  "      '<div class=\"s\">Stand ' + (s.periodEnd ? formatDate(s.periodEnd) : '–') +",
  "      (s.periodStart ? ' · seit ' + formatDate(s.periodStart) : '') + '</div></div>');",
  "",
  "    if (s.showVacation) {",
  "      tiles.push('<div class=\"stat\"><div class=\"k\">Ferien bis 31.12.' + s.year + '</div>' +",
  "        '<div class=\"v\">' + fmt(s.vacationRemaining) + '<small style=\"font-size:15px\"> Tage</small></div>' +",
  "        '<div class=\"s\">' + fmt(s.vacationEntitlement) + ' Tage Anspruch ' + s.year +",
  "        ' · ' + fmt(s.vacationUsed) + ' bezogen</div></div>');",
  "    } else {",
  "      tiles.push('<div class=\"stat\"><div class=\"k\">Saldo ' + escapeHtml(s.monthLabel) + '</div>' +",
  "        '<div class=\"v\">' + signed(s.monthBalance) + '<small style=\"font-size:15px\"> h</small></div>' +",
  "        '<div class=\"s\">' + fmt(s.monthTotal) + ' h von ' + fmt(s.monthTarget) + ' h Soll</div></div>');",
  "    }",
  "",
  "    tiles.push('<div class=\"stat wide\"><div class=\"k\">' + escapeHtml(s.monthLabel) + '</div>' +",
  "      '<div class=\"v\">' + fmt(s.monthTotal) + '<small style=\"font-size:15px\"> h erfasst</small></div>' +",
  "      '<div class=\"s\">Soll ' + fmt(s.monthTarget) + ' h' +",
  "      (s.showVacation ? ' · Saldo ' + signed(s.monthBalance) + ' h' : '') +",
  "      ' · ' + s.recordedDays + ' Tage insgesamt erfasst</div></div>');",
  "",
  "    el.stats.innerHTML = tiles.join('');",
  "",
  "    if (s.missingDaysCount > 0) {",
  "      el.reminderBox.innerHTML = '<div class=\"reminder\"><strong>Erinnerung:</strong> Im ' +",
  "        escapeHtml(s.monthLabel) + ' fehlen noch ' + s.missingDaysCount +",
  "        (s.missingDaysCount === 1 ? ' Arbeitstag' : ' Arbeitstage') + ' – ' +",
  "        escapeHtml(s.missingDays.slice(0, 8).join(', ')) +",
  "        (s.missingDaysCount > 8 ? ' …' : '') + '.</div>';",
  "    } else {",
  "      el.reminderBox.innerHTML = '<div class=\"reminder\">Im ' + escapeHtml(s.monthLabel) +",
  "        ' ist bisher jeder Arbeitstag erfasst. Danke!</div>';",
  "    }",
  "  }",
  "",
  "  /* ---------- Laden ---------- */",
  "",
  "  function loadDay() {",
  "    if (!state.employee || !state.date) return;",
  "    state.loading = true;",
  "    el.stats.classList.add('busy');",
  "    server('laemuGetDayState', [state.employee, state.date], function (result) {",
  "      state.loading = false;",
  "      el.stats.classList.remove('busy');",
  "      state.dayState = result;",
  "      state.stats = result.stats;",
  "      state.dailyTarget = result.dailyTarget || state.dailyTarget;",
  "      if (result.existing) {",
  "        state.projects = (result.existing.projects || []).map(function (p) {",
  "          return { tag: p.tag, from: p.from, to: p.to, note: p.note || '' };",
  "        });",
  "        state.absences = (result.existing.absences || []).map(function (a) {",
  "          return { tag: a.tag, hours: a.hours, note: a.note || '' };",
  "        });",
  "        state.pause = result.existing.pauseMinutes || 0;",
  "      } else {",
  "        state.projects = [emptyProject()];",
  "        state.absences = [];",
  "        state.pause = 0;",
  "      }",
  "      if (!state.projects.length) state.projects = [emptyProject()];",
  "      el.pauseInput.value = String(state.pause);",
  "      markPausePills();",
  "      renderProjects();",
  "      renderAbsences();",
  "      renderDateMeta();",
  "      renderStats();",
  "      recalc();",
  "    }, function (error) {",
  "      state.loading = false;",
  "      el.stats.classList.remove('busy');",
  "      showErrors(['Die Daten konnten nicht geladen werden: ' + (error && error.message ? error.message : error)]);",
  "    });",
  "  }",
  "",
  "  /* ---------- Einreichen ---------- */",
  "",
  "  function showErrors(messages) {",
  "    if (!messages || !messages.length) {",
  "      el.formErrors.innerHTML = '';",
  "      return;",
  "    }",
  "    el.formErrors.innerHTML = '<div class=\"errors\"><strong>Bitte noch kurz prüfen:</strong><ul>' +",
  "      messages.map(function (m) { return '<li>' + escapeHtml(m) + '</li>'; }).join('') + '</ul></div>';",
  "    el.formErrors.scrollIntoView({ behavior: 'smooth', block: 'center' });",
  "  }",
  "",
  "  function submit() {",
  "    if (!state.employee) { showErrors(['Bitte zuerst wählen, wer erfasst.']); return; }",
  "    showErrors([]);",
  "    el.submitBtn.disabled = true;",
  "    el.submitBtn.textContent = 'Wird gespeichert …';",
  "",
  "    var payload = {",
  "      employee: state.employee,",
  "      date: state.date,",
  "      pauseMinutes: Number(state.pause || 0),",
  "      projects: state.projects.filter(function (p) { return p.tag || p.from || p.to; }),",
  "      absences: state.absences.filter(function (a) { return a.tag || a.hours; })",
  "    };",
  "",
  "    server('laemuSubmitDay', [payload], function (result) {",
  "      el.submitBtn.disabled = false;",
  "      el.submitBtn.textContent = 'Einreichen →';",
  "      if (!result || !result.ok) {",
  "        showErrors((result && result.errors) || ['Unbekannter Fehler.']);",
  "        return;",
  "      }",
  "      state.stats = result.stats;",
  "      renderStats();",
  "      showSuccess(result);",
  "    }, function (error) {",
  "      el.submitBtn.disabled = false;",
  "      el.submitBtn.textContent = 'Einreichen →';",
  "      showErrors(['Speichern fehlgeschlagen: ' + (error && error.message ? error.message : error)]);",
  "    });",
  "  }",
  "",
  "  function showSuccess(result) {",
  "    var day = result.day || {};",
  "    var stats = result.stats || {};",
  "    el.successTitle.textContent = result.message;",
  "    el.successSub.textContent = 'Der Rapport vom ' + formatDate(day.date || state.date) +",
  "      ' ist im Google Sheet gespeichert.';",
  "    var rows = [];",
  "    rows.push('<div><span>Total Tag</span><span>' + fmt(day.totalHours || 0) + ' h</span></div>');",
  "    rows.push('<div><span>Saldo Tag</span><span>' + signed(day.balance || 0) + ' h</span></div>');",
  "    rows.push('<div><span>Überstunden total</span><span>' + signed(stats.overtime || 0) + ' h</span></div>');",
  "    if (stats.showVacation) {",
  "      rows.push('<div><span>Ferien bis 31.12.' + stats.year + '</span><span>' +",
  "        fmt(stats.vacationRemaining) + ' Tage</span></div>');",
  "    }",
  "    el.successRecap.innerHTML = rows.join('');",
  "    el.successReminder.textContent = result.reminder || '';",
  "    el.overlay.classList.add('show');",
  "  }",
  "",
  "  /* ---------- Pause ---------- */",
  "",
  "  function markPausePills() {",
  "    var pills = document.querySelectorAll('[data-pause]');",
  "    Array.prototype.forEach.call(pills, function (pill) {",
  "      pill.setAttribute('aria-pressed', String(Number(pill.getAttribute('data-pause')) === Number(state.pause)));",
  "    });",
  "  }",
  "",
  "  /* ---------- Start ---------- */",
  "",
  "  function init() {",
  "    el.footWeekly.textContent = B.weeklyHours;",
  "    renderQuote();",
  "",
  "    var stored = null;",
  "    try { stored = window.localStorage.getItem(STORAGE_KEY); } catch (e) { stored = null; }",
  "    var names = B.employees.map(function (e) { return e.name; });",
  "    var initial = B.matchedEmployee || (stored && names.indexOf(stored) >= 0 ? stored : null);",
  "",
  "    state.date = B.today;",
  "    el.dateInput.value = state.date;",
  "    el.dateInput.addEventListener('change', function () {",
  "      if (!el.dateInput.value) return;",
  "      state.date = el.dateInput.value;",
  "      markShiftPills();",
  "      renderDateMeta();",
  "      loadDay();",
  "    });",
  "",
  "    Array.prototype.forEach.call(document.querySelectorAll('[data-shift]'), function (btn) {",
  "      btn.addEventListener('click', function () {",
  "        state.date = addDays(B.today, Number(btn.getAttribute('data-shift')));",
  "        el.dateInput.value = state.date;",
  "        markShiftPills();",
  "        renderDateMeta();",
  "        loadDay();",
  "      });",
  "    });",
  "",
  "    Array.prototype.forEach.call(document.querySelectorAll('[data-pause]'), function (btn) {",
  "      btn.addEventListener('click', function () {",
  "        state.pause = Number(btn.getAttribute('data-pause'));",
  "        el.pauseInput.value = String(state.pause);",
  "        markPausePills();",
  "        recalc();",
  "      });",
  "    });",
  "",
  "    el.pauseInput.addEventListener('input', function () {",
  "      state.pause = Number(el.pauseInput.value || 0);",
  "      markPausePills();",
  "      recalc();",
  "    });",
  "",
  "    el.addProject.addEventListener('click', function () {",
  "      state.projects.push(emptyProject());",
  "      renderProjects();",
  "      recalc();",
  "    });",
  "",
  "    el.addAbsence.addEventListener('click', function () {",
  "      state.absences.push({ tag: '', hours: 0, note: '' });",
  "      renderAbsences();",
  "      recalc();",
  "      el.absenceList.lastChild.scrollIntoView({ behavior: 'smooth', block: 'center' });",
  "    });",
  "",
  "    el.submitBtn.addEventListener('click', submit);",
  "    el.againBtn.addEventListener('click', function () {",
  "      el.overlay.classList.remove('show');",
  "      loadDay();",
  "    });",
  "",
  "    renderEmployees();",
  "    renderDateMeta();",
  "    markShiftPills();",
  "    markPausePills();",
  "    state.projects = [emptyProject()];",
  "    renderProjects();",
  "    recalc();",
  "    renderStats();",
  "",
  "    if (initial) selectEmployee(initial, false);",
  "  }",
  "",
  "  function markShiftPills() {",
  "    Array.prototype.forEach.call(document.querySelectorAll('[data-shift]'), function (btn) {",
  "      var iso = addDays(B.today, Number(btn.getAttribute('data-shift')));",
  "      btn.setAttribute('aria-pressed', String(iso === state.date));",
  "    });",
  "  }",
  "",
  "  if (document.readyState === 'loading') {",
  "    document.addEventListener('DOMContentLoaded', init);",
  "  } else {",
  "    init();",
  "  }",
  "})();",
  "</script>",
  "</body>",
  "</html>",
  ""
].join('\n');

// ======================================================================
// Config.gs
// ======================================================================

/**
 * LAEMU Stundenrapport – Konfiguration
 *
 * Alle Werte, die sich ändern können, stehen hier oder im Tabellenblatt
 * «Einstellungen». Werte aus dem Tabellenblatt haben immer Vorrang, damit
 * Anpassungen ohne Code-Änderung möglich sind.
 */

/** ID des Google Sheets, in dem die Rapporte gespeichert werden. */
var SPREADSHEET_ID = '10PoAB8SqxYJWnmy9jdVE1kav7ygcKsLwatucQoH6jbE';

/** Wöchentliche Sollarbeitszeit in Stunden (Mo–Fr). */
var WEEKLY_HOURS = 42;

/** Anzahl Arbeitstage pro Woche – daraus ergibt sich das Tagessoll. */
var WORK_DAYS_PER_WEEK = 5;

/** Ferienanspruch in Arbeitstagen pro Kalenderjahr (100 %-Pensum). */
var VACATION_DAYS_PER_YEAR = 25;

/** Zeitzone für Datums- und Zahlformate. */
var TIMEZONE = 'Europe/Zurich';

/** Projekt-Tags (Punkt 5 im Rapport). */
var PROJECT_TAGS = ['Musikschule', 'Marketing', 'Shop', 'Weiteres'];

/** Abwesenheits-Tags hinter dem Link «Weiteres» (Punkt 6 im Rapport). */
var ABSENCE_TAGS = ['Ferien', 'Feiertag', 'Krank', 'Unfall', 'Weiteres'];

/**
 * Mitarbeitende – Standardwerte.
 * E-Mail-Adressen bewusst leer: bitte im Tabellenblatt «Einstellungen»
 * eintragen (dort landen sie nicht im Code-Repository).
 *
 *  name          Anzeigename und Name des Tabellenblatts
 *  role          «Inhaber/in» oder «Mitarbeiter/in» – rein informativ
 *  startDate     Beginn Anstellung (ISO). Ab hier wird Soll/Ist gerechnet.
 *  vacationDays  Ferienanspruch pro Kalenderjahr in Arbeitstagen
 *  showVacation  Ferienanzeige im Tool (Inhaber:innen brauchen sie nicht)
 *  workload      Beschäftigungsgrad (1 = 100 %)
 *  openingBalance Bereits bestehende Überstunden in Stunden beim Start
 */
var EMPLOYEES = [
  {
    name: 'Lian Müller',
    role: 'Mitarbeiter',
    startDate: '2026-09-01',
    vacationDays: 25,
    showVacation: true,
    workload: 1,
    openingBalance: 0,
    email: ''
  },
  {
    name: 'Niklaus Hess',
    role: 'Inhaber',
    startDate: '2026-01-01',
    vacationDays: 0,
    showVacation: false,
    workload: 1,
    openingBalance: 0,
    email: ''
  },
  {
    name: 'Selina Strickler',
    role: 'Inhaberin',
    startDate: '2026-01-01',
    vacationDays: 0,
    showVacation: false,
    workload: 1,
    openingBalance: 0,
    email: ''
  }
];

/** Namen der Hilfsblätter. */
var SETTINGS_SHEET = 'Einstellungen';
var MONTHLY_SHEET = 'Monatsübersicht';

/** Spalten der Mitarbeiter-Tabellenblätter. */
var ENTRY_HEADERS = [
  'Datum',
  'Wochentag',
  'Art',
  'Projekt / Kategorie',
  'Beginn',
  'Ende',
  'Stunden',
  'Pause (Min)',
  'Arbeitszeit Tag (h)',
  'Abwesenheit Tag (h)',
  'Feiertagsgutschrift (h)',
  'Total Tag (h)',
  'Soll Tag (h)',
  'Saldo Tag (h)',
  'Ferien (Tage)',
  'Bemerkung',
  'Erfasst am'
];

var MONTHLY_HEADERS = [
  'Mitarbeiter',
  'Monat',
  'Bezeichnung',
  'Arbeitszeit (h)',
  'Abwesenheiten (h)',
  'Feiertage (h)',
  'Total Ist (h)',
  'Soll (h)',
  'Saldo Monat (h)',
  'Saldo kumuliert (h)',
  'Ferien bezogen (Tage)',
  'Erfasste Tage',
  'Fehlende Arbeitstage'
];

// ======================================================================
// Calc.gs
// ======================================================================

/**
 * LAEMU Stundenrapport – Berechnungen
 *
 * Reines JavaScript ohne Google-APIs, damit die Logik auch ausserhalb von
 * Apps Script (siehe test/calc.test.js und tools/build-preview.js) läuft.
 *
 * Grundsätze:
 *  - Tagessoll = 42 h / 5 Arbeitstage = 8.4 h, Montag bis Freitag.
 *  - Samstag und Sonntag haben kein Soll, geleistete Arbeit zählt aber
 *    ganz normal zum Ist (und damit vollumfänglich als Überstunden).
 *  - Feiertage des Kantons Schwyz werden gutgeschrieben, wenn sie auf
 *    Montag bis Freitag fallen.
 *  - Ferien werden in Stunden erfasst; 8.4 h entsprechen einem Ferientag.
 */

/** Tagessoll in Stunden. */
function laemuDailyTarget(workload) {
  var w = (workload === undefined || workload === null) ? 1 : Number(workload);
  return (WEEKLY_HOURS / WORK_DAYS_PER_WEEK) * w;
}

/** Auf zwei Nachkommastellen runden (Dezimalstunden). */
function laemuRound2(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

/** Auf halbe Tage runden (Ferien). */
function laemuRoundHalf(value) {
  return Math.round(Number(value) * 2) / 2;
}

/** 'YYYY-MM-DD' -> Date (12:00 Uhr lokal, damit Zeitzonen nie kippen). */
function laemuParseIso(iso) {
  var p = String(iso).split('-');
  return new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]), 12, 0, 0, 0);
}

/** Date -> 'YYYY-MM-DD'. */
function laemuToIso(date) {
  var m = date.getMonth() + 1;
  var d = date.getDate();
  return date.getFullYear() + '-' + (m < 10 ? '0' + m : m) + '-' + (d < 10 ? '0' + d : d);
}

/** Tage zu einem ISO-Datum addieren. */
function laemuAddDays(iso, days) {
  var d = laemuParseIso(iso);
  d.setDate(d.getDate() + days);
  return laemuToIso(d);
}

/** 0 = Montag … 6 = Sonntag. */
function laemuWeekdayIndex(iso) {
  return (laemuParseIso(iso).getDay() + 6) % 7;
}

var LAEMU_WEEKDAYS = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];
var LAEMU_WEEKDAYS_SHORT = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
var LAEMU_MONTHS = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];

function laemuWeekdayName(iso) {
  return LAEMU_WEEKDAYS[laemuWeekdayIndex(iso)];
}

function laemuWeekdayShort(iso) {
  return LAEMU_WEEKDAYS_SHORT[laemuWeekdayIndex(iso)];
}

function laemuIsWeekend(iso) {
  return laemuWeekdayIndex(iso) >= 5;
}

/** 'YYYY-MM-DD' -> '27.08.2026' */
function laemuFormatDate(iso) {
  var p = String(iso).split('-');
  return p[2] + '.' + p[1] + '.' + p[0];
}

/** '2026-08' -> 'August 2026' */
function laemuMonthLabel(monthKey) {
  var p = String(monthKey).split('-');
  return LAEMU_MONTHS[Number(p[1]) - 1] + ' ' + p[0];
}

/** Ostersonntag (anonyme gregorianische Osterformel). */
function laemuEasterSunday(year) {
  var a = year % 19;
  var b = Math.floor(year / 100);
  var c = year % 100;
  var d = Math.floor(b / 4);
  var e = b % 4;
  var f = Math.floor((b + 8) / 25);
  var g = Math.floor((b - f + 1) / 3);
  var h = (19 * a + b - d - g + 15) % 30;
  var i = Math.floor(c / 4);
  var k = c % 4;
  var l = (32 + 2 * e + 2 * i - h - k) % 7;
  var m = Math.floor((a + 11 * h + 22 * l) / 451);
  var month = Math.floor((h + l - 7 * m + 114) / 31);
  var day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

/**
 * Gesetzliche Feiertage im Kanton Schwyz.
 * Quelle: Kanton Schwyz, Datensatz «Feiertage Kanton Schwyz»
 * (https://data.sz.ch/explore/dataset/feiertage-kanton-schwyz).
 * Rückgabe: { 'YYYY-MM-DD': 'Name des Feiertags' }
 */
function laemuHolidays(year) {
  var fixed = [
    [1, 1, 'Neujahr'],
    [1, 2, 'Berchtoldstag'],
    [1, 6, 'Heilige Drei Könige'],
    [3, 19, 'Josefstag'],
    [8, 1, 'Bundesfeier'],
    [8, 15, 'Mariä Himmelfahrt'],
    [11, 1, 'Allerheiligen'],
    [12, 8, 'Mariä Empfängnis'],
    [12, 25, 'Weihnachten'],
    [12, 26, 'Stephanstag']
  ];
  var movable = [
    [-2, 'Karfreitag'],
    [0, 'Ostersonntag'],
    [1, 'Ostermontag'],
    [39, 'Auffahrt'],
    [49, 'Pfingstsonntag'],
    [50, 'Pfingstmontag'],
    [60, 'Fronleichnam']
  ];
  var out = {};
  for (var i = 0; i < fixed.length; i++) {
    var d = new Date(year, fixed[i][0] - 1, fixed[i][1], 12, 0, 0, 0);
    out[laemuToIso(d)] = fixed[i][2];
  }
  var easter = laemuEasterSunday(year);
  for (var j = 0; j < movable.length; j++) {
    var m = new Date(easter.getTime());
    m.setDate(m.getDate() + movable[j][0]);
    out[laemuToIso(m)] = movable[j][1];
  }
  return out;
}

var LAEMU_HOLIDAY_CACHE = {};

/** Name des Feiertags oder null. */
function laemuHolidayName(iso) {
  var year = Number(String(iso).slice(0, 4));
  if (!LAEMU_HOLIDAY_CACHE[year]) {
    LAEMU_HOLIDAY_CACHE[year] = laemuHolidays(year);
  }
  return LAEMU_HOLIDAY_CACHE[year][iso] || null;
}

/** Stunden zwischen 'HH:MM' und 'HH:MM' als Dezimalzahl. */
function laemuHoursBetween(from, to) {
  var f = laemuMinutesOfDay(from);
  var t = laemuMinutesOfDay(to);
  if (f === null || t === null) return 0;
  var diff = t - f;
  if (diff <= 0) return 0;
  return laemuRound2(diff / 60);
}

function laemuMinutesOfDay(value) {
  if (!value) return null;
  var m = String(value).match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  var h = Number(m[1]);
  var min = Number(m[2]);
  if (h > 24 || min > 59) return null;
  return h * 60 + min;
}

/**
 * Berechnet einen einzelnen Tag.
 *
 * day = {
 *   date: 'YYYY-MM-DD',
 *   projects: [{ tag, from, to, note }],
 *   absences: [{ tag, hours, note }],
 *   pauseMinutes: Number
 * }
 */
function laemuComputeDay(day, workload) {
  var target = laemuDailyTarget(workload);
  var iso = day.date;
  var projects = day.projects || [];
  var absences = day.absences || [];
  var pause = Number(day.pauseMinutes || 0) / 60;

  var grossHours = 0;
  var projectRows = [];
  for (var i = 0; i < projects.length; i++) {
    var p = projects[i];
    var h = laemuHoursBetween(p.from, p.to);
    grossHours += h;
    projectRows.push({ tag: p.tag, from: p.from, to: p.to, hours: laemuRound2(h), note: p.note || '' });
  }
  grossHours = laemuRound2(grossHours);

  var workHours = laemuRound2(Math.max(0, grossHours - pause));

  var absenceHours = 0;
  var vacationHours = 0;
  var bookedHolidayHours = 0;
  var absenceRows = [];
  for (var j = 0; j < absences.length; j++) {
    var a = absences[j];
    var ah = laemuRound2(Math.max(0, Number(a.hours || 0)));
    absenceHours += ah;
    if (a.tag === 'Ferien') vacationHours += ah;
    if (a.tag === 'Feiertag') bookedHolidayHours += ah;
    absenceRows.push({ tag: a.tag, hours: ah, note: a.note || '' });
  }
  absenceHours = laemuRound2(absenceHours);

  var weekend = laemuIsWeekend(iso);
  var holidayName = laemuHolidayName(iso);
  // Feiertage werden nur gutgeschrieben, wenn sie auf Mo–Fr fallen. Bereits
  // manuell als «Feiertag» erfasste Stunden werden nicht doppelt gezählt.
  var holidayCredit = 0;
  if (holidayName && !weekend) {
    holidayCredit = laemuRound2(Math.max(0, target - bookedHolidayHours));
  }

  var totalHours = laemuRound2(workHours + absenceHours + holidayCredit);
  var targetHours = weekend ? 0 : laemuRound2(target);
  var balance = laemuRound2(totalHours - targetHours);

  return {
    date: iso,
    weekday: laemuWeekdayName(iso),
    weekdayShort: laemuWeekdayShort(iso),
    isWeekend: weekend,
    holiday: holidayName,
    projects: projectRows,
    absences: absenceRows,
    pauseMinutes: Number(day.pauseMinutes || 0),
    grossHours: grossHours,
    workHours: workHours,
    absenceHours: absenceHours,
    holidayCredit: holidayCredit,
    totalHours: totalHours,
    targetHours: targetHours,
    balance: balance,
    vacationDays: laemuRound2(vacationHours / target)
  };
}

/** Prüft eine Tageserfassung. Rückgabe: Array mit Fehlermeldungen. */
function laemuValidateDay(day) {
  var errors = [];
  if (!day || !day.date || !/^\d{4}-\d{2}-\d{2}$/.test(day.date)) {
    errors.push('Bitte ein gültiges Datum wählen.');
    return errors;
  }
  var projects = day.projects || [];
  var absences = day.absences || [];
  if (!projects.length && !absences.length) {
    errors.push('Bitte mindestens ein Projekt oder eine Abwesenheit erfassen.');
  }
  for (var i = 0; i < projects.length; i++) {
    var p = projects[i];
    var nr = i + 1;
    if (!p.tag) errors.push('Projekt ' + nr + ': Bitte ein Projekt wählen.');
    if (laemuMinutesOfDay(p.from) === null) errors.push('Projekt ' + nr + ': Arbeitsbeginn fehlt.');
    if (laemuMinutesOfDay(p.to) === null) errors.push('Projekt ' + nr + ': Arbeitsende fehlt.');
    if (laemuMinutesOfDay(p.from) !== null && laemuMinutesOfDay(p.to) !== null &&
        laemuMinutesOfDay(p.to) <= laemuMinutesOfDay(p.from)) {
      errors.push('Projekt ' + nr + ': Das Arbeitsende muss nach dem Arbeitsbeginn liegen.');
    }
  }
  for (var j = 0; j < absences.length; j++) {
    var a = absences[j];
    if (!a.tag) errors.push('Weiteres ' + (j + 1) + ': Bitte einen Tag (Ferien, Feiertag, …) wählen.');
    if (!(Number(a.hours) > 0)) errors.push('Weiteres ' + (j + 1) + ': Bitte die Anzahl Stunden erfassen.');
    if (Number(a.hours) > 24) errors.push('Weiteres ' + (j + 1) + ': Mehr als 24 Stunden sind nicht möglich.');
  }
  var pause = Number(day.pauseMinutes || 0);
  if (pause < 0 || pause > 12 * 60) errors.push('Die Pausenzeit ist ungültig.');

  var computed = laemuComputeDay(day, 1);
  if (computed.grossHours > 0 && computed.pauseMinutes / 60 > computed.grossHours) {
    errors.push('Die Pause ist länger als die erfasste Arbeitszeit.');
  }
  if (computed.workHours + computed.absenceHours > 24) {
    errors.push('Total mehr als 24 Stunden an einem Tag – bitte die Eingaben prüfen.');
  }
  return errors;
}

/**
 * Ferienanspruch pro Kalenderjahr, anteilig ab Anstellungsbeginn
 * (pro rata temporis nach angefangenen Monaten).
 */
function laemuVacationEntitlement(year, startIso, vacationDaysPerYear, workload) {
  var full = Number(vacationDaysPerYear || 0) * (workload === undefined ? 1 : Number(workload));
  if (!full) return 0;
  var startYear = Number(String(startIso).slice(0, 4));
  if (startYear > year) return 0;
  if (startYear < year) return laemuRoundHalf(full);
  var startMonth = Number(String(startIso).slice(5, 7));
  var months = 12 - startMonth + 1;
  return laemuRoundHalf(full * months / 12);
}

/**
 * Gesamtauswertung über alle erfassten Tage.
 *
 * daysByDate  { 'YYYY-MM-DD': <Ergebnis von laemuComputeDay> }
 * employee    { startDate, vacationDays, workload, showVacation, openingBalance }
 * todayIso    Stichtag (in der Regel «heute»)
 *
 * Gerechnet wird ab dem ersten erfassten Tag (frühestens ab Anstellungsbeginn)
 * bis zum zuletzt erfassten Tag, höchstens aber bis heute. Wer erst später mit
 * dem Erfassen beginnt, startet dadurch nicht mit einem Minus – ein bereits
 * bestehendes Guthaben lässt sich im Blatt «Einstellungen» als Startsaldo
 * hinterlegen.
 */
function laemuComputeSummary(daysByDate, employee, todayIso) {
  var target = laemuDailyTarget(employee.workload);
  var dates = Object.keys(daysByDate).sort();
  var opening = laemuRound2(Number(employee.openingBalance || 0));
  var firstIso = dates.length ? dates[0] : null;
  var startIso = (firstIso && firstIso > employee.startDate) ? firstIso : employee.startDate;
  var lastIso = dates.length ? dates[dates.length - 1] : null;
  // Bis zum zuletzt erfassten Tag rechnen, höchstens aber bis heute.
  var endIso = lastIso && lastIso < todayIso ? lastIso : todayIso;
  if (!lastIso) endIso = null;

  var totals = {
    openingBalance: opening,
    workHours: 0,
    absenceHours: 0,
    holidayCredit: 0,
    totalHours: 0,
    targetHours: 0,
    balance: 0,
    vacationDaysUsed: 0,
    recordedDays: dates.length,
    firstDate: dates.length ? dates[0] : null,
    lastDate: lastIso,
    periodEnd: endIso,
    missingDays: [],
    months: {}
  };

  if (!endIso) {
    totals.balance = opening;
    totals.periodStart = null;
    totals.vacationEntitlement = laemuVacationEntitlement(
      Number(todayIso.slice(0, 4)), employee.startDate, employee.vacationDays, employee.workload);
    totals.vacationUsed = 0;
    totals.vacationRemaining = totals.vacationEntitlement;
    totals.monthList = [];
    return totals;
  }
  totals.periodStart = startIso;

  var cursor = startIso > endIso ? endIso : startIso;
  var guard = 0;
  while (cursor <= endIso && guard < 20000) {
    guard++;
    var day = daysByDate[cursor];
    var monthKey = cursor.slice(0, 7);
    if (!totals.months[monthKey]) {
      totals.months[monthKey] = {
        month: monthKey,
        label: laemuMonthLabel(monthKey),
        workHours: 0,
        absenceHours: 0,
        holidayCredit: 0,
        totalHours: 0,
        targetHours: 0,
        balance: 0,
        vacationDaysUsed: 0,
        recordedDays: 0,
        missingDays: []
      };
    }
    var m = totals.months[monthKey];
    var weekend = laemuIsWeekend(cursor);
    var holiday = laemuHolidayName(cursor);

    if (day) {
      m.workHours += day.workHours;
      m.absenceHours += day.absenceHours;
      m.holidayCredit += day.holidayCredit;
      m.totalHours += day.totalHours;
      m.targetHours += day.targetHours;
      m.vacationDaysUsed += day.vacationDays;
      m.recordedDays++;
    } else if (!weekend) {
      // Nicht erfasster Werktag: Feiertage sind trotzdem gutgeschrieben,
      // alle anderen Tage fehlen und schlagen im Saldo durch.
      m.targetHours += target;
      if (holiday) {
        m.holidayCredit += target;
        m.totalHours += target;
      } else if (cursor >= startIso) {
        m.missingDays.push(cursor);
        totals.missingDays.push(cursor);
      }
    }
    cursor = laemuAddDays(cursor, 1);
  }

  var keys = Object.keys(totals.months).sort();
  var cumulative = opening;
  for (var i = 0; i < keys.length; i++) {
    var mm = totals.months[keys[i]];
    mm.workHours = laemuRound2(mm.workHours);
    mm.absenceHours = laemuRound2(mm.absenceHours);
    mm.holidayCredit = laemuRound2(mm.holidayCredit);
    mm.totalHours = laemuRound2(mm.totalHours);
    mm.targetHours = laemuRound2(mm.targetHours);
    mm.balance = laemuRound2(mm.totalHours - mm.targetHours);
    mm.vacationDaysUsed = laemuRound2(mm.vacationDaysUsed);
    cumulative = laemuRound2(cumulative + mm.balance);
    mm.cumulativeBalance = cumulative;

    totals.workHours += mm.workHours;
    totals.absenceHours += mm.absenceHours;
    totals.holidayCredit += mm.holidayCredit;
    totals.totalHours += mm.totalHours;
    totals.targetHours += mm.targetHours;
    totals.vacationDaysUsed += mm.vacationDaysUsed;
  }
  totals.workHours = laemuRound2(totals.workHours);
  totals.absenceHours = laemuRound2(totals.absenceHours);
  totals.holidayCredit = laemuRound2(totals.holidayCredit);
  totals.totalHours = laemuRound2(totals.totalHours);
  totals.targetHours = laemuRound2(totals.targetHours);
  totals.balance = laemuRound2(opening + totals.totalHours - totals.targetHours);
  totals.monthList = keys.map(function (k) { return totals.months[k]; });

  // Ferien im laufenden Kalenderjahr
  var year = Number(todayIso.slice(0, 4));
  var usedThisYear = 0;
  for (var d = 0; d < dates.length; d++) {
    if (dates[d].slice(0, 4) === String(year)) {
      usedThisYear += daysByDate[dates[d]].vacationDays;
    }
  }
  totals.vacationEntitlement = laemuVacationEntitlement(
    year, employee.startDate, employee.vacationDays, employee.workload);
  totals.vacationUsed = laemuRound2(usedThisYear);
  totals.vacationRemaining = laemuRound2(totals.vacationEntitlement - usedThisYear);
  return totals;
}

/**
 * Prüft, ob eine Zeile aus dem Blatt «Einstellungen» eine Mitarbeiterzeile ist.
 * Hinweistexte und Notizen stehen ebenfalls in der ersten Spalte, sind aber
 * keine Mitarbeitenden: Ein echter Eintrag hat einen kurzen Namen und
 * mindestens eine weitere ausgefüllte Spalte.
 */
function laemuIsEmployeeRow(row) {
  if (!row) return false;
  var name = String(row[0] === undefined || row[0] === null ? '' : row[0]).trim();
  if (!name) return false;
  if (name.length > 60) return false;
  if (/^hinweis\b/i.test(name)) return false;
  for (var c = 1; c <= 7; c++) {
    var cell = row[c];
    if (cell !== undefined && cell !== null && String(cell).trim() !== '') return true;
  }
  return false;
}

/** Fehlende Arbeitstage im angegebenen Monat ('YYYY-MM'). */
function laemuMissingDaysInMonth(summary, monthKey) {
  var m = summary.months && summary.months[monthKey];
  return m ? m.missingDays : [];
}

// ======================================================================
// Quotes.gs
// ======================================================================

/**
 * LAEMU Stundenrapport – Tagesspruch
 *
 * Jeder Tag zeigt einen anderen Spruch. Die Auswahl ist deterministisch:
 * Innerhalb eines Zyklus (Anzahl Sprüche) erscheint jeder Spruch genau
 * einmal, die Reihenfolge wird pro Zyklus neu gemischt.
 */

var LAEMU_QUOTES = [
  { text: 'Es ist nicht wenig Zeit, die wir haben, sondern es ist viel Zeit, die wir nicht nutzen.', author: 'Seneca' },
  { text: 'Der Weg entsteht, indem man ihn geht.', author: 'Franz Kafka' },
  { text: 'Wer ein Warum zum Leben hat, erträgt fast jedes Wie.', author: 'Friedrich Nietzsche' },
  { text: 'Musik ist die Sprache der Leidenschaft.', author: 'Richard Wagner' },
  { text: 'Freude ist in allen Dingen, man muss sie nur herausfinden.', author: 'Christian Morgenstern' },
  { text: 'Wo Worte aufhören, fängt die Musik an.', author: 'E. T. A. Hoffmann' },
  { text: 'Die Zukunft gehört denen, die an die Schönheit ihrer Träume glauben.', author: 'Eleanor Roosevelt' },
  { text: 'Man sieht nur mit dem Herzen gut. Das Wesentliche ist für die Augen unsichtbar.', author: 'Antoine de Saint-Exupéry' },
  { text: 'Fange nie an aufzuhören, höre nie auf anzufangen.', author: 'Cicero' },
  { text: 'Ein Tag ohne Lächeln ist ein verlorener Tag.', author: 'Charlie Chaplin' },
  { text: 'Auch aus Steinen, die einem in den Weg gelegt werden, kann man Schönes bauen.', author: 'Johann Wolfgang von Goethe' },
  { text: 'Das Geheimnis des Könnens liegt im Wollen.', author: 'Giuseppe Mazzini' },
  { text: 'Wer immer tut, was er schon kann, bleibt immer das, was er schon ist.', author: 'Henry Ford' },
  { text: 'Nicht weil es schwer ist, wagen wir es nicht, sondern weil wir es nicht wagen, ist es schwer.', author: 'Seneca' },
  { text: 'Der beste Weg, die Zukunft vorauszusagen, ist, sie zu gestalten.', author: 'Peter Drucker' },
  { text: 'Glück ist das Einzige, was sich verdoppelt, wenn man es teilt.', author: 'Albert Schweitzer' },
  { text: 'Tradition ist die Weitergabe des Feuers und nicht die Anbetung der Asche.', author: 'Gustav Mahler' },
  { text: 'Wer singt, betet zweimal.', author: 'Augustinus' },
  { text: 'Alles, was von Herzen kommt, geht auch zu Herzen.', author: 'Ludwig van Beethoven' },
  { text: 'Erfolg ist die Summe kleiner Anstrengungen, die sich Tag für Tag wiederholen.', author: 'Robert Collier' },
  { text: 'Sei du selbst die Veränderung, die du dir wünschst für diese Welt.', author: 'Mahatma Gandhi' },
  { text: 'Die Kunst besteht darin, einmal mehr aufzustehen, als man umgeworfen wird.', author: 'Winston Churchill' },
  { text: 'Ich kann freilich nicht sagen, ob es besser wird, wenn es anders wird; aber so viel kann ich sagen: es muss anders werden, wenn es gut werden soll.', author: 'Georg Christoph Lichtenberg' },
  { text: 'Es gibt Menschen, die Zeit haben, und Menschen, die sich Zeit nehmen.', author: 'Ernst Ferstl' },
  { text: 'Die schönsten Melodien entstehen dort, wo Menschen einander zuhören.', author: 'Unbekannt' },
  { text: 'Freude an der Arbeit lässt das Werk trefflich geraten.', author: 'Aristoteles' },
  { text: 'Man muss das Unmögliche versuchen, um das Mögliche zu erreichen.', author: 'Hermann Hesse' },
  { text: 'Jeder Anfang hat einen Zauber inne, der uns beschützt und der uns hilft zu leben.', author: 'Hermann Hesse' },
  { text: 'Nicht die Glücklichen sind dankbar. Es sind die Dankbaren, die glücklich sind.', author: 'Francis Bacon' },
  { text: 'Ein Ziel ohne Plan ist nur ein Wunsch.', author: 'Antoine de Saint-Exupéry' },
  { text: 'Wer nach allen Seiten offen ist, kann nicht ganz dicht sein – aber er hört mehr Musik.', author: 'Unbekannt' },
  { text: 'Das Leben ist wie ein Fahrrad. Man muss sich vorwärtsbewegen, um das Gleichgewicht zu halten.', author: 'Albert Einstein' },
  { text: 'Der Berg ruft – und wer zuhört, findet den Weg.', author: 'Unbekannt' },
  { text: 'Zwischen den Noten liegt die Musik.', author: 'Claude Debussy' },
  { text: 'Was du heute pflanzt, spielt dir morgen ein Lied.', author: 'Unbekannt' },
  { text: 'Es kommt nicht darauf an, dem Leben mehr Jahre zu geben, sondern den Jahren mehr Leben.', author: 'Alexis Carrel' },
  { text: 'Kleine Schritte sind besser als grosse Worte.', author: 'Unbekannt' },
  { text: 'Talent ist billig, Hingabe ist teuer.', author: 'Irving Stone' },
  { text: 'Nichts ist so beständig wie der Wandel.', author: 'Heraklit' },
  { text: 'Das Beste an der Musik: Sie kennt keine Grenzen.', author: 'Unbekannt' },
  { text: 'Wer arbeitet, macht Fehler. Wer nicht arbeitet, macht den grössten.', author: 'Unbekannt' },
  { text: 'Zufriedenheit ist der Stein der Weisen, der alles, was er berührt, in Gold verwandelt.', author: 'Benjamin Franklin' },
  { text: 'Die Heimat ist kein Ort. Sie ist ein Gefühl.', author: 'Unbekannt' },
  { text: 'Nur wer sein Ziel kennt, findet den Weg.', author: 'Laozi' },
  { text: 'Eine Reise von tausend Meilen beginnt mit einem einzigen Schritt.', author: 'Laozi' },
  { text: 'Enthusiasmus ist die Mutter aller Anstrengung.', author: 'Ralph Waldo Emerson' },
  { text: 'Wir können den Wind nicht ändern, aber die Segel anders setzen.', author: 'Aristoteles' },
  { text: 'Der Rhythmus ist das Herz, die Melodie die Seele.', author: 'Unbekannt' },
  { text: 'Was man mit Freude tut, wird nie zur Last.', author: 'Unbekannt' },
  { text: 'Achte auf den Augenblick, denn in ihm liegt das ganze Leben.', author: 'Marc Aurel' },
  { text: 'Mut steht am Anfang des Handelns, Glück am Ende.', author: 'Demokrit' },
  { text: 'Die grössten Werke entstehen aus Geduld und Beharrlichkeit.', author: 'Unbekannt' },
  { text: 'Wer viel gibt, verliert nichts – ausser Schwere.', author: 'Unbekannt' },
  { text: 'Das Herz hat seine Gründe, die der Verstand nicht kennt.', author: 'Blaise Pascal' },
  { text: 'Wer nicht wagt, verliert das Lied, das nur er singen kann.', author: 'Unbekannt' },
  { text: 'Ordnung ist die Freude der Vernunft, Unordnung das Vergnügen der Fantasie.', author: 'Paul Claudel' },
  { text: 'Am Ende zählt nicht, wie viel du getan hast, sondern wie viel Liebe darin lag.', author: 'Mutter Teresa' },
  { text: 'Vollkommenheit entsteht nicht dann, wenn man nichts mehr hinzufügen, sondern wenn man nichts mehr weglassen kann.', author: 'Antoine de Saint-Exupéry' },
  { text: 'Wer aufhört, besser zu werden, hat aufgehört, gut zu sein.', author: 'Philip Rosenthal' },
  { text: 'Ein guter Tag beginnt mit einem klaren Gedanken.', author: 'Unbekannt' },
  { text: 'Gemeinschaft ist der Klang, den niemand allein erzeugen kann.', author: 'Unbekannt' },
  { text: 'Die Zeit, die man sich nimmt, ist Zeit, die einem etwas gibt.', author: 'Ernst Ferstl' },
  { text: 'Freundlichkeit ist eine Sprache, die Taube hören und Blinde sehen können.', author: 'Mark Twain' },
  { text: 'Wer die Berge liebt, lernt Geduld.', author: 'Unbekannt' },
  { text: 'Erst der Klang macht aus Tönen Musik – und aus Menschen eine Gemeinschaft.', author: 'Unbekannt' },
  { text: 'Wer Neues schaffen will, muss Altes lieben.', author: 'Unbekannt' },
  { text: 'Nicht die Stunden zählen, sondern was in ihnen geschieht.', author: 'Unbekannt' },
  { text: 'Heute ist der Tag, den du dir gestern gewünscht hast.', author: 'Unbekannt' }
];

/** Tage seit 1970-01-01, zeitzonenunabhängig. */
function laemuDayNumber(iso) {
  var p = String(iso).split('-');
  return Math.floor(Date.UTC(Number(p[0]), Number(p[1]) - 1, Number(p[2])) / 86400000);
}

/** Kleiner deterministischer Zufallsgenerator (mulberry32). */
function laemuRandom(seed) {
  var t = seed >>> 0;
  return function () {
    t = (t + 0x6D2B79F5) >>> 0;
    var x = t;
    x = Math.imul(x ^ (x >>> 15), 1 | x);
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

/** Gemischte Reihenfolge der Sprüche für einen Zyklus. */
function laemuCycleOrder(cycle, n) {
  var order = [];
  for (var i = 0; i < n; i++) order.push(i);
  var rnd = laemuRandom(cycle * 2654435761);
  for (var j = n - 1; j > 0; j--) {
    var k = Math.floor(rnd() * (j + 1));
    var tmp = order[j];
    order[j] = order[k];
    order[k] = tmp;
  }
  return order;
}

/** Spruch des Tages – innerhalb eines Zyklus wiederholt sich keiner. */
function laemuQuoteOfDay(iso) {
  var n = LAEMU_QUOTES.length;
  var dayNumber = laemuDayNumber(iso);
  var cycle = Math.floor(dayNumber / n);
  var position = ((dayNumber % n) + n) % n;

  var order = laemuCycleOrder(cycle, n);
  // Am Zyklusübergang verhindern, dass zwei Tage hintereinander denselben
  // Spruch zeigen.
  if (position === 0 && n > 1) {
    var previous = laemuCycleOrder(cycle - 1, n);
    if (previous[n - 1] === order[0]) {
      var swap = order[0];
      order[0] = order[1];
      order[1] = swap;
    }
  }
  var quote = LAEMU_QUOTES[order[position]];
  return { text: quote.text, author: quote.author };
}

// ======================================================================
// Sheets.gs
// ======================================================================

/**
 * LAEMU Stundenrapport – Google-Sheets-Anbindung
 *
 * Struktur der Tabelle:
 *   «Einstellungen»    Mitarbeitende, Pensum, Ferienanspruch, E-Mail
 *   «<Mitarbeitername>» ein Blatt pro Person, eine Zeile pro Eintrag
 *   «Monatsübersicht»  automatisch berechnete Monatstotale
 */

function laemuSpreadsheet_() {
  if (SPREADSHEET_ID) {
    return SpreadsheetApp.openById(SPREADSHEET_ID);
  }
  return SpreadsheetApp.getActiveSpreadsheet();
}

var LAEMU_BLACK = '#000000';
var LAEMU_WHITE = '#FFFFFF';
var LAEMU_SILVER = '#EFEFEF';
var LAEMU_GOLD = '#BC8C33';
var LAEMU_STONE = '#505050';

/** Datum aus einer Zelle als 'YYYY-MM-DD'. */
function laemuCellToIso_(value) {
  if (!value && value !== 0) return null;
  if (Object.prototype.toString.call(value) === '[object Date]') {
    return Utilities.formatDate(value, TIMEZONE, 'yyyy-MM-dd');
  }
  var s = String(value).trim();
  var iso = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return iso[0];
  var ch = s.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (ch) {
    return ch[3] + '-' + ('0' + ch[2]).slice(-2) + '-' + ('0' + ch[1]).slice(-2);
  }
  return null;
}

/** Zeitwert aus einer Zelle als 'HH:MM'. */
function laemuCellToTime_(value) {
  if (value === '' || value === null || value === undefined) return '';
  if (Object.prototype.toString.call(value) === '[object Date]') {
    return Utilities.formatDate(value, TIMEZONE, 'HH:mm');
  }
  var m = String(value).trim().match(/^(\d{1,2}):(\d{2})/);
  return m ? ('0' + m[1]).slice(-2) + ':' + m[2] : '';
}

/** Legt fehlende Blätter an und formatiert sie. Idempotent. */
function laemuEnsureSetup() {
  var ss = laemuSpreadsheet_();
  laemuEnsureSettingsSheet_(ss);
  var employees = laemuGetEmployees();
  for (var i = 0; i < employees.length; i++) {
    laemuEnsureEntrySheet_(ss, employees[i].name);
  }
  laemuEnsureMonthlySheet_(ss);
  laemuRebuildMonthly();
  return 'Tabelle ist eingerichtet.';
}

function laemuEnsureSettingsSheet_(ss) {
  var sheet = ss.getSheetByName(SETTINGS_SHEET);
  if (sheet) return sheet;
  sheet = ss.insertSheet(SETTINGS_SHEET, 0);
  var headers = ['Mitarbeiter', 'Rolle', 'Start Anstellung', 'Pensum (1 = 100 %)',
    'Ferien pro Jahr (Tage)', 'Ferienanzeige', 'Startsaldo (h)', 'E-Mail'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  var rows = EMPLOYEES.map(function (e) {
    return [e.name, e.role, e.startDate, e.workload, e.vacationDays,
      e.showVacation ? 'ja' : 'nein', e.openingBalance || 0, e.email || ''];
  });
  sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
  sheet.getRange(2, 3, rows.length, 1).setNumberFormat('@');
  laemuStyleHeader_(sheet, headers.length);
  sheet.setColumnWidth(1, 180);
  sheet.setColumnWidth(3, 140);
  sheet.setColumnWidth(4, 150);
  sheet.setColumnWidth(5, 170);
  sheet.setColumnWidth(7, 130);
  sheet.setColumnWidth(8, 240);
  sheet.getRange(rows.length + 3, 2).setValue(
    'Hinweis: E-Mail eintragen, damit die monatliche Erinnerung verschickt wird. ' +
    'Startsaldo = bereits bestehende Überstunden beim Beginn der Erfassung. ' +
    'Wöchentliche Sollzeit: ' + WEEKLY_HOURS + ' h (' + laemuDailyTarget(1) + ' h pro Arbeitstag).')
    .setFontColor(LAEMU_STONE).setFontStyle('italic');
  return sheet;
}

function laemuStyleHeader_(sheet, columns) {
  var header = sheet.getRange(1, 1, 1, columns);
  header.setBackground(LAEMU_BLACK)
    .setFontColor(LAEMU_WHITE)
    .setFontWeight('bold')
    .setVerticalAlignment('middle');
  sheet.setFrozenRows(1);
  sheet.setRowHeight(1, 34);
}

function laemuEnsureEntrySheet_(ss, name) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.getRange(1, 1, 1, ENTRY_HEADERS.length).setValues([ENTRY_HEADERS]);
    laemuStyleHeader_(sheet, ENTRY_HEADERS.length);
    sheet.setColumnWidth(1, 100);   // Datum
    sheet.setColumnWidth(2, 90);    // Wochentag
    sheet.setColumnWidth(3, 100);   // Art
    sheet.setColumnWidth(4, 150);   // Kategorie
    sheet.setColumnWidth(16, 220);  // Bemerkung
    sheet.setColumnWidth(17, 150);  // Erfasst am
    for (var c = 5; c <= 15; c++) sheet.setColumnWidth(c, 110);
    sheet.getRange(2, 1, sheet.getMaxRows() - 1, 1).setNumberFormat('dd.MM.yyyy');
    sheet.getRange(2, 5, sheet.getMaxRows() - 1, 2).setNumberFormat('@');
    sheet.getRange(2, 7, sheet.getMaxRows() - 1, 1).setNumberFormat('0.00');
    sheet.getRange(2, 9, sheet.getMaxRows() - 1, 7).setNumberFormat('0.00');
    sheet.getRange(2, 17, sheet.getMaxRows() - 1, 1).setNumberFormat('dd.MM.yyyy HH:mm');
  }
  return sheet;
}

function laemuEnsureMonthlySheet_(ss) {
  var sheet = ss.getSheetByName(MONTHLY_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(MONTHLY_SHEET);
    sheet.getRange(1, 1, 1, MONTHLY_HEADERS.length).setValues([MONTHLY_HEADERS]);
    laemuStyleHeader_(sheet, MONTHLY_HEADERS.length);
    sheet.setColumnWidth(1, 160);
    sheet.setColumnWidth(2, 90);
    sheet.setColumnWidth(3, 140);
    for (var c = 4; c <= MONTHLY_HEADERS.length; c++) sheet.setColumnWidth(c, 130);
  }
  return sheet;
}

/** Stellt sicher, dass das Blatt genügend Zeilen für n Datenzeilen hat. */
function laemuEnsureRows_(sheet, dataRows) {
  var needed = dataRows + 1;
  var available = sheet.getMaxRows();
  if (available < needed) {
    sheet.insertRowsAfter(available, needed - available);
  }
}

/** Mitarbeitende aus dem Blatt «Einstellungen», sonst aus Config.gs. */
function laemuGetEmployees() {
  var ss = laemuSpreadsheet_();
  var sheet = ss.getSheetByName(SETTINGS_SHEET);
  if (!sheet) sheet = laemuEnsureSettingsSheet_(ss);
  var values = sheet.getDataRange().getValues();
  var out = [];
  for (var i = 1; i < values.length; i++) {
    var row = values[i];
    if (!laemuIsEmployeeRow(row)) continue;
    var name = String(row[0]).trim();
    var startIso = laemuCellToIso_(row[2]);
    out.push({
      name: name,
      firstName: name.split(' ')[0],
      role: String(row[1] || '').trim(),
      startDate: startIso || '2026-01-01',
      workload: Number(row[3]) > 0 ? Number(row[3]) : 1,
      vacationDays: Number(row[4]) || 0,
      showVacation: String(row[5] || '').trim().toLowerCase().indexOf('ja') === 0,
      openingBalance: Number(row[6]) || 0,
      email: String(row[7] || '').trim()
    });
  }
  if (!out.length) {
    out = EMPLOYEES.map(function (e) {
      var copy = {};
      for (var k in e) copy[k] = e[k];
      copy.firstName = e.name.split(' ')[0];
      return copy;
    });
  }
  return out;
}

function laemuFindEmployee(name) {
  var list = laemuGetEmployees();
  for (var i = 0; i < list.length; i++) {
    if (list[i].name === name) return list[i];
  }
  return null;
}

/** Alle Einträge einer Person, gruppiert und neu berechnet. */
function laemuReadDays_(employee) {
  var ss = laemuSpreadsheet_();
  var sheet = laemuEnsureEntrySheet_(ss, employee.name);
  var lastRow = sheet.getLastRow();
  var byDate = {};
  if (lastRow < 2) return byDate;
  var values = sheet.getRange(2, 1, lastRow - 1, ENTRY_HEADERS.length).getValues();
  var raw = {};
  for (var i = 0; i < values.length; i++) {
    var row = values[i];
    var iso = laemuCellToIso_(row[0]);
    if (!iso) continue;
    if (!raw[iso]) raw[iso] = { date: iso, projects: [], absences: [], pauseMinutes: 0, submittedAt: null };
    var kind = String(row[2] || '').trim();
    var note = String(row[15] || '').trim();
    if (kind === 'Abwesenheit') {
      raw[iso].absences.push({ tag: String(row[3] || '').trim(), hours: Number(row[6]) || 0, note: note });
    } else if (String(row[3] || '').trim()) {
      raw[iso].projects.push({
        tag: String(row[3]).trim(),
        from: laemuCellToTime_(row[4]),
        to: laemuCellToTime_(row[5]),
        note: note
      });
    }
    var pause = Number(row[7]);
    if (pause > raw[iso].pauseMinutes) raw[iso].pauseMinutes = pause;
    if (row[16]) raw[iso].submittedAt = row[16];
  }
  var keys = Object.keys(raw);
  for (var k = 0; k < keys.length; k++) {
    var day = laemuComputeDay(raw[keys[k]], employee.workload);
    day.submittedAt = raw[keys[k]].submittedAt;
    byDate[keys[k]] = day;
  }
  return byDate;
}

/** Zeilen für einen berechneten Tag. */
function laemuDayToRows_(day, submittedAt) {
  var rows = [];
  var dateValue = laemuParseIso(day.date);
  var summaryWritten = false;
  function summaryCells(pauseMinutes) {
    if (summaryWritten) return ['', '', '', '', '', '', '', ''];
    summaryWritten = true;
    return [pauseMinutes, day.workHours, day.absenceHours, day.holidayCredit,
      day.totalHours, day.targetHours, day.balance, day.vacationDays];
  }
  var i;
  for (i = 0; i < day.projects.length; i++) {
    var p = day.projects[i];
    rows.push([dateValue, day.weekday, 'Projekt', p.tag, p.from, p.to, p.hours]
      .concat(summaryCells(day.pauseMinutes))
      .concat([p.note || '', submittedAt]));
  }
  for (i = 0; i < day.absences.length; i++) {
    var a = day.absences[i];
    rows.push([dateValue, day.weekday, 'Abwesenheit', a.tag, '', '', a.hours]
      .concat(summaryCells(day.pauseMinutes))
      .concat([a.note || '', submittedAt]));
  }
  if (!rows.length) {
    rows.push([dateValue, day.weekday, 'Abwesenheit', '', '', '', 0]
      .concat(summaryCells(day.pauseMinutes))
      .concat(['', submittedAt]));
  }
  return rows;
}

/**
 * Schreibt einen Tag ins Blatt der Person. Bestehende Zeilen desselben
 * Datums werden ersetzt, die Tabelle bleibt nach Datum sortiert.
 */
function laemuSaveDay_(employee, day) {
  var ss = laemuSpreadsheet_();
  var sheet = laemuEnsureEntrySheet_(ss, employee.name);
  var lastRow = sheet.getLastRow();
  var existing = lastRow >= 2
    ? sheet.getRange(2, 1, lastRow - 1, ENTRY_HEADERS.length).getValues()
    : [];

  var kept = [];
  for (var i = 0; i < existing.length; i++) {
    var iso = laemuCellToIso_(existing[i][0]);
    if (!iso || iso === day.date) continue;
    existing[i][0] = laemuParseIso(iso);
    existing[i][4] = laemuCellToTime_(existing[i][4]);
    existing[i][5] = laemuCellToTime_(existing[i][5]);
    kept.push({ iso: iso, row: existing[i] });
  }

  var submittedAt = new Date();
  var newRows = laemuDayToRows_(day, submittedAt);
  for (var j = 0; j < newRows.length; j++) {
    kept.push({ iso: day.date, row: newRows[j] });
  }
  kept.sort(function (a, b) { return a.iso < b.iso ? -1 : (a.iso > b.iso ? 1 : 0); });

  if (lastRow >= 2) {
    sheet.getRange(2, 1, lastRow - 1, ENTRY_HEADERS.length).clearContent();
  }
  if (kept.length) {
    var out = kept.map(function (x) { return x.row; });
    laemuEnsureRows_(sheet, out.length);
    sheet.getRange(2, 1, out.length, ENTRY_HEADERS.length).setValues(out);
  }
  return sheet;
}

/** Baut das Blatt «Monatsübersicht» für alle Mitarbeitenden neu auf. */
function laemuRebuildMonthly() {
  var ss = laemuSpreadsheet_();
  var sheet = laemuEnsureMonthlySheet_(ss);
  var employees = laemuGetEmployees();
  var todayIso = laemuTodayIso();
  var rows = [];
  for (var i = 0; i < employees.length; i++) {
    var employee = employees[i];
    var days = laemuReadDays_(employee);
    var summary = laemuComputeSummary(days, employee, todayIso);
    var months = summary.monthList || [];
    for (var m = 0; m < months.length; m++) {
      var mm = months[m];
      rows.push([
        employee.name,
        mm.month,
        mm.label,
        mm.workHours,
        mm.absenceHours,
        mm.holidayCredit,
        mm.totalHours,
        mm.targetHours,
        mm.balance,
        mm.cumulativeBalance,
        mm.vacationDaysUsed,
        mm.recordedDays,
        mm.missingDays.length
      ]);
    }
  }
  var lastRow = sheet.getLastRow();
  if (lastRow >= 2) {
    sheet.getRange(2, 1, lastRow - 1, MONTHLY_HEADERS.length).clearContent();
  }
  if (rows.length) {
    laemuEnsureRows_(sheet, rows.length);
    sheet.getRange(2, 1, rows.length, MONTHLY_HEADERS.length).setValues(rows);
    sheet.getRange(2, 4, rows.length, 8).setNumberFormat('0.00');
  }
  return rows.length;
}

/** Heutiges Datum in der Zeitzone der Firma. */
function laemuTodayIso() {
  return Utilities.formatDate(new Date(), TIMEZONE, 'yyyy-MM-dd');
}

// ======================================================================
// Reminders.gs
// ======================================================================

/**
 * LAEMU Stundenrapport – Monatliche Erinnerung
 *
 * Verschickt am 1. jedes Monats eine Zusammenfassung des Vormonats an alle
 * Mitarbeitenden, bei denen im Blatt «Einstellungen» eine E-Mail hinterlegt
 * ist – inklusive Hinweis auf fehlende Arbeitstage.
 */

/** Trigger einrichten (einmalig ausführen, Menü «LAEMU Stundenrapport»). */
function laemuInstallTriggers() {
  var existing = ScriptApp.getProjectTriggers();
  for (var i = 0; i < existing.length; i++) {
    if (existing[i].getHandlerFunction() === 'laemuSendMonthlyReminders') {
      ScriptApp.deleteTrigger(existing[i]);
    }
  }
  ScriptApp.newTrigger('laemuSendMonthlyReminders')
    .timeBased()
    .onMonthDay(1)
    .atHour(8)
    .inTimezone(TIMEZONE)
    .create();
  return 'Erinnerung ist für den 1. jedes Monats um 08:00 Uhr eingerichtet.';
}

/** Erinnerung für den letzten abgeschlossenen Monat verschicken. */
function laemuSendMonthlyReminders() {
  var todayIso = laemuTodayIso();
  var previous = laemuPreviousMonthKey_(todayIso);
  var employees = laemuGetEmployees();
  var sent = 0;

  for (var i = 0; i < employees.length; i++) {
    var employee = employees[i];
    if (!employee.email) continue;

    var days = laemuReadDays_(employee);
    var summary = laemuComputeSummary(days, employee, todayIso);
    var month = summary.months && summary.months[previous];
    var subject = 'LAEMU Stundenrapport – ' + laemuMonthLabel(previous);
    var html = laemuReminderHtml_(employee, summary, month, previous);
    MailApp.sendEmail({
      to: employee.email,
      subject: subject,
      htmlBody: html,
      body: laemuReminderPlain_(employee, summary, month, previous),
      name: 'LAEMU Stundenrapport'
    });
    sent++;
  }
  return sent + ' Erinnerung(en) verschickt.';
}

function laemuPreviousMonthKey_(todayIso) {
  var year = Number(todayIso.slice(0, 4));
  var month = Number(todayIso.slice(5, 7)) - 1;
  if (month === 0) {
    month = 12;
    year -= 1;
  }
  return year + '-' + ('0' + month).slice(-2);
}

function laemuWebAppUrl_() {
  try {
    return ScriptApp.getService().getUrl() || '';
  } catch (err) {
    return '';
  }
}

function laemuReminderPlain_(employee, summary, month, monthKey) {
  var lines = [];
  lines.push('Hallo ' + employee.firstName);
  lines.push('');
  if (month) {
    lines.push(laemuMonthLabel(monthKey) + ': ' + month.totalHours + ' h erfasst (Soll ' +
      month.targetHours + ' h, Saldo ' + laemuSigned_(month.balance) + ' h).');
    if (month.missingDays.length) {
      lines.push('Es fehlen noch ' + month.missingDays.length + ' Arbeitstage: ' +
        month.missingDays.map(laemuFormatDate).join(', '));
    } else {
      lines.push('Alle Arbeitstage sind erfasst – danke!');
    }
  } else {
    lines.push('Für ' + laemuMonthLabel(monthKey) + ' sind noch keine Stunden erfasst.');
  }
  lines.push('Überstunden total: ' + laemuSigned_(summary.balance) + ' h');
  if (employee.showVacation) {
    lines.push('Ferien ' + new Date().getFullYear() + ': noch ' +
      summary.vacationRemaining + ' von ' + summary.vacationEntitlement + ' Tagen offen.');
  }
  var url = laemuWebAppUrl_();
  if (url) {
    lines.push('');
    lines.push('Stundenrapport erfassen: ' + url);
  }
  return lines.join('\n');
}

function laemuReminderHtml_(employee, summary, month, monthKey) {
  var url = laemuWebAppUrl_();
  var rows = '';
  function row(label, value) {
    return '<tr><td style="padding:8px 0;color:#505050;">' + label +
      '</td><td style="padding:8px 0;text-align:right;font-weight:700;">' + value + '</td></tr>';
  }
  if (month) {
    rows += row('Erfasste Stunden', month.totalHours + ' h');
    rows += row('Sollstunden', month.targetHours + ' h');
    rows += row('Saldo ' + laemuMonthLabel(monthKey), laemuSigned_(month.balance) + ' h');
    rows += row('Erfasste Tage', month.recordedDays);
  } else {
    rows += row('Erfasste Stunden', '0 h');
  }
  rows += row('Überstunden total', laemuSigned_(summary.balance) + ' h');
  if (employee.showVacation) {
    rows += row('Ferien noch offen', summary.vacationRemaining + ' Tage');
  }

  var missing = '';
  if (month && month.missingDays.length) {
    missing = '<p style="margin:24px 0 0;padding:16px;background:#EFEFEF;border-left:3px solid #BC8C33;">' +
      '<strong>Es fehlen noch ' + month.missingDays.length + ' Arbeitstage:</strong><br>' +
      month.missingDays.map(laemuFormatDate).join(' · ') + '</p>';
  } else if (month) {
    missing = '<p style="margin:24px 0 0;padding:16px;background:#EFEFEF;border-left:3px solid #BC8C33;">' +
      'Alle Arbeitstage im ' + laemuMonthLabel(monthKey) + ' sind erfasst. Danke ' + employee.firstName + '!</p>';
  }

  var button = url
    ? '<p style="margin:32px 0 0;"><a href="' + url + '" style="background:#000000;color:#FFFFFF;' +
      'text-decoration:none;padding:14px 28px;display:inline-block;font-weight:700;">Stunden erfassen →</a></p>'
    : '';

  return '<div style="font-family:Helvetica,Arial,sans-serif;color:#000;max-width:520px;margin:0 auto;padding:32px;">' +
    '<div style="font-size:26px;font-weight:800;letter-spacing:0.14em;">LAEMU</div>' +
    '<div style="color:#505050;font-style:italic;margin-bottom:28px;">Am Puls der Ländlermusik.</div>' +
    '<h2 style="font-size:20px;margin:0 0 4px;">Hallo ' + employee.firstName + '</h2>' +
    '<p style="color:#505050;margin:0 0 20px;">Hier ist deine Übersicht für ' + laemuMonthLabel(monthKey) + '.</p>' +
    '<table style="width:100%;border-collapse:collapse;font-size:15px;">' + rows + '</table>' +
    missing + button +
    '<p style="margin-top:36px;color:#505050;font-size:12px;">Diese Erinnerung kommt automatisch am 1. jedes Monats.</p>' +
    '</div>';
}

function laemuSigned_(value) {
  var n = Number(value);
  return (n > 0 ? '+' : '') + laemuRound2(n);
}

// ======================================================================
// Code.gs
// ======================================================================

/**
 * LAEMU Stundenrapport – Web-App
 *
 * Deployment: Bereitstellen → Neue Bereitstellung → Web-App
 *   «Ausführen als»  Ich (Besitzer:in der Tabelle)
 *   «Zugriff»        Alle Personen mit Google-Konto
 */

function doGet(e) {
  var template = HtmlService.createTemplate(LAEMU_INDEX_HTML);
  template.bootstrap = JSON.stringify(laemuBootstrap());
  return template.evaluate()
    .setTitle('LAEMU Stundenrapport')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/** Teil-HTML einbinden (Stylesheet / JavaScript). */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/** Menü in der Tabelle. */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('LAEMU Stundenrapport')
    .addItem('Tabelle einrichten', 'laemuEnsureSetup')
    .addItem('Monatsübersicht neu berechnen', 'laemuRebuildMonthly')
    .addSeparator()
    .addItem('Monatliche Erinnerung jetzt senden', 'laemuSendMonthlyReminders')
    .addItem('Erinnerungs-Trigger installieren', 'laemuInstallTriggers')
    .addToUi();
}

/** Startdaten für das Frontend. */
function laemuBootstrap() {
  var employees = laemuGetEmployees();
  var todayIso = laemuTodayIso();
  var activeEmail = '';
  try {
    activeEmail = (Session.getActiveUser().getEmail() || '').toLowerCase();
  } catch (err) {
    activeEmail = '';
  }
  var matched = '';
  for (var i = 0; i < employees.length; i++) {
    if (employees[i].email && employees[i].email.toLowerCase() === activeEmail) {
      matched = employees[i].name;
    }
  }
  return {
    employees: employees.map(function (e) {
      return {
        name: e.name,
        firstName: e.firstName,
        role: e.role,
        showVacation: e.showVacation,
        startDate: e.startDate,
        dailyTarget: laemuRound2(laemuDailyTarget(e.workload))
      };
    }),
    projectTags: PROJECT_TAGS,
    absenceTags: ABSENCE_TAGS,
    quote: laemuQuoteOfDay(todayIso),
    today: todayIso,
    todayLabel: laemuWeekdayName(todayIso) + ', ' + laemuFormatDate(todayIso),
    weeklyHours: WEEKLY_HOURS,
    dailyTarget: laemuRound2(laemuDailyTarget(1)),
    vacationDaysPerYear: VACATION_DAYS_PER_YEAR,
    matchedEmployee: matched,
    holidayName: laemuHolidayName(todayIso)
  };
}

/** Zustand für Person und Datum: bestehende Einträge, Feiertag, Totale. */
function laemuGetDayState(employeeName, iso) {
  var employee = laemuFindEmployee(employeeName);
  if (!employee) throw new Error('Unbekannte Mitarbeiterin oder unbekannter Mitarbeiter.');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(iso))) throw new Error('Ungültiges Datum.');

  var days = laemuReadDays_(employee);
  var todayIso = laemuTodayIso();
  var summary = laemuComputeSummary(days, employee, todayIso);
  var existing = days[iso] || null;

  return {
    employee: employeeName,
    date: iso,
    weekday: laemuWeekdayName(iso),
    isWeekend: laemuIsWeekend(iso),
    holiday: laemuHolidayName(iso),
    beforeStart: iso < employee.startDate,
    startDate: employee.startDate,
    dailyTarget: laemuRound2(laemuDailyTarget(employee.workload)),
    existing: existing ? {
      projects: existing.projects,
      absences: existing.absences,
      pauseMinutes: existing.pauseMinutes
    } : null,
    stats: laemuStats_(employee, summary, todayIso)
  };
}

/** Kennzahlen für die Fusszeile des Tools. */
function laemuStats_(employee, summary, todayIso) {
  var monthKey = todayIso.slice(0, 7);
  var month = summary.months && summary.months[monthKey];
  var missingThisMonth = month ? month.missingDays : [];
  return {
    overtime: summary.balance,
    totalHours: summary.totalHours,
    targetHours: summary.targetHours,
    recordedDays: summary.recordedDays,
    periodStart: summary.periodStart || employee.startDate,
    openingBalance: summary.openingBalance || 0,
    periodEnd: summary.periodEnd,
    showVacation: employee.showVacation,
    vacationEntitlement: summary.vacationEntitlement,
    vacationUsed: summary.vacationUsed || 0,
    vacationRemaining: summary.vacationRemaining,
    year: Number(todayIso.slice(0, 4)),
    month: monthKey,
    monthLabel: laemuMonthLabel(monthKey),
    monthTotal: month ? month.totalHours : 0,
    monthTarget: month ? month.targetHours : 0,
    monthBalance: month ? month.balance : 0,
    missingDays: missingThisMonth.map(function (d) { return laemuFormatDate(d); }),
    missingDaysCount: missingThisMonth.length
  };
}

/**
 * Rapport speichern.
 * payload = { employee, date, projects, absences, pauseMinutes }
 */
function laemuSubmitDay(payload) {
  var employee = laemuFindEmployee(payload && payload.employee);
  if (!employee) throw new Error('Bitte zuerst eine Mitarbeiterin oder einen Mitarbeiter wählen.');

  var day = {
    date: String(payload.date || ''),
    projects: (payload.projects || []).map(function (p) {
      return { tag: String(p.tag || ''), from: String(p.from || ''), to: String(p.to || ''), note: String(p.note || '') };
    }),
    absences: (payload.absences || []).map(function (a) {
      return { tag: String(a.tag || ''), hours: Number(a.hours || 0), note: String(a.note || '') };
    }),
    pauseMinutes: Number(payload.pauseMinutes || 0)
  };

  var errors = laemuValidateDay(day);
  if (errors.length) {
    return { ok: false, errors: errors };
  }

  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    var computed = laemuComputeDay(day, employee.workload);
    laemuSaveDay_(employee, computed);
    laemuRebuildMonthly();

    var days = laemuReadDays_(employee);
    var todayIso = laemuTodayIso();
    var summary = laemuComputeSummary(days, employee, todayIso);
    var stats = laemuStats_(employee, summary, todayIso);
    return {
      ok: true,
      message: 'Danke ' + employee.firstName + '!',
      day: computed,
      stats: stats,
      reminder: laemuReminderText_(employee, stats)
    };
  } finally {
    lock.releaseLock();
  }
}

/** Kurze Erinnerung, die nach dem Einreichen angezeigt wird. */
function laemuReminderText_(employee, stats) {
  if (stats.missingDaysCount > 0) {
    var list = stats.missingDays.slice(0, 5).join(', ');
    var more = stats.missingDaysCount > 5 ? ' und weitere' : '';
    return 'Im ' + stats.monthLabel + ' fehlen noch ' + stats.missingDaysCount +
      (stats.missingDaysCount === 1 ? ' Arbeitstag' : ' Arbeitstage') + ': ' + list + more + '.';
  }
  return 'Im ' + stats.monthLabel + ' ist bisher jeder Arbeitstag erfasst. Weiter so!';
}

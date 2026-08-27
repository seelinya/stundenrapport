#!/usr/bin/env node
/**
 * Fasst das gesamte Projekt zu einer einzigen Apps-Script-Datei zusammen.
 *
 *   node tools/build-appsscript-bundle.js
 *     -> apps-script-single/Code.gs
 *
 * Enthält Backend und Oberfläche. Die Oberfläche liegt als Zeichenkette im
 * Skript, damit keine separate HTML-Datei nötig ist – im Apps-Script-Editor
 * muss also nichts benannt oder zusätzlich angelegt werden.
 *
 * Die Dateien in apps-script/ bleiben die Quelle; apps-script-single/ wird
 * erzeugt und nicht von Hand bearbeitet.
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const srcDir = path.join(root, 'apps-script');
const outDir = path.join(root, 'apps-script-single');
const read = (f) => fs.readFileSync(path.join(srcDir, f), 'utf8');

// Reihenfolge wie im Editor: Konfiguration zuerst, Einstiegspunkte zuletzt.
const scripts = ['Config.gs', 'Calc.gs', 'Quotes.gs', 'Sheets.gs', 'Reminders.gs', 'Code.gs'];

const header = `/**
 * LAEMU Stundenrapport – vollständiges Projekt in einer Datei.
 *
 * Erzeugt aus ${scripts.join(', ')}
 * sowie Index.html, Stylesheet.html und JavaScript.html mit
 * "node tools/build-appsscript-bundle.js". Änderungen bitte in
 * apps-script/ vornehmen, nicht hier.
 */

`;

// Oberfläche: Stylesheet und JavaScript direkt einsetzen. <?!= bootstrap ?>
// bleibt erhalten und wird von HtmlService.createTemplate ausgewertet.
const index = read('Index.html')
  .replace(/<\?!=\s*include\('Stylesheet'\);\s*\?>/, () => read('Stylesheet.html').trim())
  .replace(/<\?!=\s*include\('JavaScript'\);\s*\?>/, () => read('JavaScript.html').trim());

// Die Oberfläche als Zeichenkette ablegen – Zeile für Zeile, damit die Datei
// im Editor lesbar bleibt und jedes Sonderzeichen korrekt maskiert ist.
const htmlConstant = '// ' + '='.repeat(70) + '\n' +
  '// Oberfläche (aus Index.html, Stylesheet.html und JavaScript.html)\n' +
  '// ' + '='.repeat(70) + '\n\n' +
  'var LAEMU_INDEX_HTML = [\n' +
  index.split('\n').map((line) => '  ' + JSON.stringify(line)).join(',\n') +
  '\n].join(\'\\n\');\n';

const code = scripts.map((f) => {
  const bar = '// ' + '='.repeat(70);
  let content = read(f).trim();
  if (f === 'Code.gs') {
    // Ohne separate HTML-Datei wird die Vorlage aus der Zeichenkette gebaut.
    const before = "HtmlService.createTemplateFromFile('Index')";
    if (content.indexOf(before) === -1) {
      throw new Error('doGet in Code.gs sieht anders aus als erwartet.');
    }
    content = content.replace(before, 'HtmlService.createTemplate(LAEMU_INDEX_HTML)');
  }
  return `${bar}\n// ${f}\n${bar}\n\n${content}\n`;
}).join('\n');

fs.mkdirSync(outDir, { recursive: true });
fs.rmSync(path.join(outDir, 'Index.html'), { force: true });
fs.writeFileSync(path.join(outDir, 'Code.gs'), header + htmlConstant + '\n' + code);
console.log('apps-script-single/Code.gs erzeugt (Backend und Oberfläche in einer Datei).');

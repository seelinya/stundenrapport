#!/usr/bin/env node
/**
 * Fasst die Apps-Script-Dateien zu zwei Dateien zusammen, damit das Einrichten
 * von Hand nur zwei Mal Kopieren statt neun Mal bedeutet.
 *
 *   node tools/build-appsscript-bundle.js
 *     -> apps-script-single/Code.gs     (alle .gs-Dateien hintereinander)
 *     -> apps-script-single/Index.html  (Oberfläche mit eingebettetem CSS und JS)
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
 * LAEMU Stundenrapport – vollständiges Backend in einer Datei.
 *
 * Erzeugt aus ${scripts.join(', ')}
 * mit "node tools/build-appsscript-bundle.js". Änderungen bitte in
 * apps-script/ vornehmen, nicht hier.
 */

`;

const bundle = header + scripts.map((f) => {
  const bar = '// ' + '='.repeat(70);
  return `${bar}\n// ${f}\n${bar}\n\n${read(f).trim()}\n`;
}).join('\n');

// Oberfläche: Stylesheet und JavaScript direkt einsetzen, damit nur eine
// HTML-Datei nötig ist. <?!= bootstrap ?> bleibt erhalten.
const index = read('Index.html')
  .replace(/<\?!=\s*include\('Stylesheet'\);\s*\?>/, () => read('Stylesheet.html').trim())
  .replace(/<\?!=\s*include\('JavaScript'\);\s*\?>/, () => read('JavaScript.html').trim());

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'Code.gs'), bundle);
fs.writeFileSync(path.join(outDir, 'Index.html'), index);
console.log('apps-script-single/Code.gs und apps-script-single/Index.html erzeugt.');

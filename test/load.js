/** Lädt die Apps-Script-Dateien (reines JavaScript) in einen Testkontext. */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const dir = path.join(__dirname, '..', 'apps-script');
const source = ['Config.gs', 'Calc.gs', 'Quotes.gs']
  .map((f) => fs.readFileSync(path.join(dir, f), 'utf8'))
  .join('\n\n');

const context = vm.createContext({ console });
vm.runInContext(source, context, { filename: 'laemu-bundle.js' });

module.exports = context;

/**
 * LAEMU Stundenrapport – Google-Sheets-Anbindung
 *
 * Struktur der Tabelle:
 *   «Einstellungen»    Mitarbeitende, Pensum, Ferienanspruch, E-Mail, Anstellung
 *   «<Mitarbeitername>» ein Blatt pro Person, eine Zeile pro Eintrag
 *                      (bei Stundenbasis zusätzlich eine Totalzeile pro Monat)
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

var SETTINGS_HEADERS = ['Mitarbeiter', 'Rolle', 'Start Anstellung', 'Pensum (1 = 100 %)',
  'Ferien pro Jahr (Tage)', 'Ferienanzeige', 'Startsaldo (h)', 'E-Mail', 'Anstellung'];

/** Stand des Blatts «Einstellungen»; höher = neuere Spalten und Personen. */
var SETTINGS_VERSION = '2';
var SETTINGS_VERSION_KEY = 'LAEMU_SETTINGS_VERSION';

function laemuSettingsRow_(e) {
  return [e.name, e.role, e.startDate, e.workload, e.vacationDays,
    e.showVacation ? 'ja' : 'nein', e.openingBalance || 0, e.email || '',
    e.hourly ? EMPLOYMENT_HOURLY : EMPLOYMENT_FIXED];
}

function laemuEnsureSettingsSheet_(ss) {
  var sheet = ss.getSheetByName(SETTINGS_SHEET);
  if (sheet) {
    laemuUpgradeSettingsSheet_(ss, sheet);
    return sheet;
  }
  sheet = ss.insertSheet(SETTINGS_SHEET, 0);
  var headers = SETTINGS_HEADERS;
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  var rows = EMPLOYEES.map(laemuSettingsRow_);
  sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
  sheet.getRange(2, 3, rows.length, 1).setNumberFormat('@');
  laemuStyleHeader_(sheet, headers.length);
  sheet.setColumnWidth(1, 180);
  sheet.setColumnWidth(3, 140);
  sheet.setColumnWidth(4, 150);
  sheet.setColumnWidth(5, 170);
  sheet.setColumnWidth(7, 130);
  sheet.setColumnWidth(8, 240);
  sheet.setColumnWidth(9, 130);
  sheet.getRange(rows.length + 3, 2).setValue(
    'Hinweis: E-Mail eintragen, damit die monatliche Erinnerung verschickt wird. ' +
    'Startsaldo = bereits bestehende Überstunden beim Beginn der Erfassung. ' +
    'Anstellung «' + EMPLOYMENT_HOURLY + '» = ohne feste Anstellung: kein Soll, keine Überstunden, ' +
    'die Stunden werden pro Monat zusammengezählt. ' +
    'Wöchentliche Sollzeit: ' + WEEKLY_HOURS + ' h (' + laemuDailyTarget(1) + ' h pro Arbeitstag).')
    .setFontColor(LAEMU_STONE).setFontStyle('italic');
  PropertiesService.getScriptProperties().setProperty(SETTINGS_VERSION_KEY, SETTINGS_VERSION);
  return sheet;
}

/**
 * Bringt ein bestehendes Blatt «Einstellungen» auf den aktuellen Stand:
 * ergänzt die Spalte «Anstellung» und fügt Personen aus Config.gs hinzu, die
 * noch fehlen. Läuft pro Stand nur einmal – wer danach eine Person aus dem
 * Blatt löscht, bekommt sie nicht wieder zurück.
 */
function laemuUpgradeSettingsSheet_(ss, sheet) {
  var props = PropertiesService.getScriptProperties();
  if (props.getProperty(SETTINGS_VERSION_KEY) === SETTINGS_VERSION) return;

  var lock = LockService.getScriptLock();
  var ownLock = !lock.hasLock();
  if (ownLock) lock.waitLock(30000);
  try {
    if (props.getProperty(SETTINGS_VERSION_KEY) === SETTINGS_VERSION) return;

    var cols = SETTINGS_HEADERS.length;
    if (sheet.getMaxColumns() < cols) {
      sheet.insertColumnsAfter(sheet.getMaxColumns(), cols - sheet.getMaxColumns());
    }
    var values = sheet.getRange(1, 1, Math.max(sheet.getLastRow(), 1), cols).getValues();
    if (!String(values[0][cols - 1] || '').trim()) {
      sheet.getRange(1, cols).setValue(SETTINGS_HEADERS[cols - 1]);
      laemuStyleHeader_(sheet, cols);
      sheet.setColumnWidth(cols, 130);
    }

    var names = {};
    var lastEmployeeRow = 1;
    for (var i = 1; i < values.length; i++) {
      if (!laemuIsEmployeeRow(values[i])) continue;
      names[String(values[i][0]).trim()] = true;
      lastEmployeeRow = i + 1;
      // Bisherige Personen ohne Angabe gelten als fest angestellt.
      if (!String(values[i][cols - 1] || '').trim()) {
        sheet.getRange(i + 1, cols).setValue(EMPLOYMENT_FIXED);
      }
    }

    var missing = EMPLOYEES.filter(function (e) { return !names[e.name]; });
    if (missing.length) {
      sheet.insertRowsAfter(lastEmployeeRow, missing.length);
      var range = sheet.getRange(lastEmployeeRow + 1, 1, missing.length, cols);
      range.setFontWeight('normal').setFontStyle('normal').setFontColor(LAEMU_BLACK).setBackground(null);
      sheet.getRange(lastEmployeeRow + 1, 3, missing.length, 1).setNumberFormat('@');
      range.setValues(missing.map(laemuSettingsRow_));
      for (var m = 0; m < missing.length; m++) {
        laemuEnsureEntrySheet_(ss, missing[m].name);
      }
    }
    props.setProperty(SETTINGS_VERSION_KEY, SETTINGS_VERSION);
  } finally {
    if (ownLock) lock.releaseLock();
  }
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
  var sheet = laemuEnsureSettingsSheet_(ss);
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
      email: String(row[7] || '').trim(),
      hourly: laemuIsHourlyEmployment(row[8])
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
    var day = laemuComputeDay(raw[keys[k]], employee.workload, employee.hourly);
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
    if (day.hourly) {
      // Stundenbasis: kein Soll, kein Saldo, keine Ferien.
      return [pauseMinutes, day.workHours, day.absenceHours, '', day.totalHours, '', '', ''];
    }
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

  var out = kept.map(function (x) { return x.row; });
  var totalRows = [];
  if (employee.hourly) {
    var withTotals = laemuWithMonthTotals_(kept);
    out = withTotals.rows;
    totalRows = withTotals.totalRows;
  }

  if (lastRow >= 2) {
    sheet.getRange(2, 1, lastRow - 1, ENTRY_HEADERS.length).clearContent();
  }
  if (out.length) {
    laemuEnsureRows_(sheet, out.length);
    sheet.getRange(2, 1, out.length, ENTRY_HEADERS.length).setValues(out);
  }
  if (employee.hourly) {
    // Hervorhebung neu setzen, weil sich die Totalzeilen verschieben.
    var span = Math.max(out.length, lastRow - 1);
    if (span > 0) {
      sheet.getRange(2, 1, span, ENTRY_HEADERS.length).setFontWeight('normal').setBackground(null);
    }
    for (var t = 0; t < totalRows.length; t++) {
      sheet.getRange(totalRows[t] + 2, 1, 1, ENTRY_HEADERS.length)
        .setFontWeight('bold').setBackground(LAEMU_SILVER);
    }
  }
  return sheet;
}

/**
 * Fügt nach jedem Monat eine Totalzeile ein (nur Stundenbasis). Die Zeile hat
 * kein Datum und wird deshalb beim Einlesen übersprungen und beim nächsten
 * Speichern neu berechnet.
 * Rückgabe: { rows, totalRows } – totalRows = Indizes der Totalzeilen in rows.
 */
function laemuWithMonthTotals_(kept) {
  var rows = [];
  var totalRows = [];
  var sum = 0;
  for (var i = 0; i < kept.length; i++) {
    rows.push(kept[i].row);
    sum += Number(kept[i].row[11]) || 0;   // Total Tag (h), nur in der ersten Zeile eines Tages
    var monthKey = kept[i].iso.slice(0, 7);
    var next = kept[i + 1];
    if (!next || next.iso.slice(0, 7) !== monthKey) {
      var total = ['', '', 'Total Monat', laemuMonthLabel(monthKey), '', '', '', '', '', '', '',
        laemuRound2(sum), '', '', '', '', ''];
      totalRows.push(rows.length);
      rows.push(total);
      sum = 0;
    }
  }
  return { rows: rows, totalRows: totalRows };
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
      if (employee.hourly) {
        // Stundenbasis: nur die Stunden pro Monat, kein Soll und kein Saldo.
        rows.push([employee.name, mm.month, mm.label, mm.workHours, mm.absenceHours, '',
          mm.totalHours, '', '', '', '', mm.recordedDays, '']);
        continue;
      }
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

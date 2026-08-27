/**
 * LAEMU Stundenrapport – vollständiges Backend in einer Datei.
 *
 * Erzeugt aus Config.gs, Calc.gs, Quotes.gs, Sheets.gs, Reminders.gs, Code.gs
 * mit "node tools/build-appsscript-bundle.js". Änderungen bitte in
 * apps-script/ vornehmen, nicht hier.
 */

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
  sheet.getRange(rows.length + 3, 1).setValue(
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

/** Mitarbeitende aus dem Blatt «Einstellungen», sonst aus Config.gs. */
function laemuGetEmployees() {
  var ss = laemuSpreadsheet_();
  var sheet = ss.getSheetByName(SETTINGS_SHEET);
  if (!sheet) sheet = laemuEnsureSettingsSheet_(ss);
  var values = sheet.getDataRange().getValues();
  var out = [];
  for (var i = 1; i < values.length; i++) {
    var row = values[i];
    var name = String(row[0] || '').trim();
    if (!name) continue;
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
  var template = HtmlService.createTemplateFromFile('Index');
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

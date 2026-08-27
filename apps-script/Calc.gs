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

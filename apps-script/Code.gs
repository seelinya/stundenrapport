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

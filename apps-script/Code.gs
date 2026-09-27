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
        hourly: e.hourly,
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
    hourly: employee.hourly,
    startDate: employee.startDate,
    dailyTarget: laemuRound2(laemuDailyTarget(employee.workload)),
    existing: existing ? {
      projects: existing.projects,
      absences: existing.absences,
      pauseMinutes: existing.pauseMinutes
    } : null,
    stats: laemuBuildStats(employee, summary, todayIso)
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
    var computed = laemuComputeDay(day, employee.workload, employee.hourly);
    laemuSaveDay_(employee, computed);
    laemuRebuildMonthly();

    var days = laemuReadDays_(employee);
    var todayIso = laemuTodayIso();
    var summary = laemuComputeSummary(days, employee, todayIso);
    var stats = laemuBuildStats(employee, summary, todayIso);
    return {
      ok: true,
      message: 'Danke ' + employee.firstName + '!',
      day: computed,
      stats: stats,
      reminder: laemuBuildReminderText(employee, stats)
    };
  } finally {
    lock.releaseLock();
  }
}

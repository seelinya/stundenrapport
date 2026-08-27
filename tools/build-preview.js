#!/usr/bin/env node
/**
 * Baut aus den Apps-Script-Dateien eine eigenständige HTML-Vorschau.
 *
 * Die Vorschau nutzt exakt dieselbe Oberfläche und dieselbe Rechenlogik
 * (Calc.gs, Quotes.gs), ersetzt aber Google Sheets durch einen Speicher im
 * Browser. So lässt sich das Tool ohne Google-Konto anschauen und testen.
 *
 *   node tools/build-preview.js
 *     -> preview/index.html            (im Browser öffnen)
 *     -> preview/artifact.html         (Body-Fragment zum Veröffentlichen)
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const src = (f) => fs.readFileSync(path.join(root, 'apps-script', f), 'utf8');

const stripScriptTags = (s) => s.replace(/^\s*<script>/, '').replace(/<\/script>\s*$/, '');
const stripStyleWrapper = (s) => s.trim();

const index = src('Index.html');
const styles = stripStyleWrapper(src('Stylesheet.html'));
const appJs = stripScriptTags(src('JavaScript.html').trim());

const shared = ['Config.gs', 'Calc.gs', 'Quotes.gs'].map(src).join('\n\n');

const mock = `
/* ---- Vorschau-Backend: ersetzt Google Sheets durch den Browser-Speicher ---- */
${shared}

var LAEMU_PREVIEW = (function () {
  var STORE_KEY = 'laemu.preview.days';
  var employees = EMPLOYEES.map(function (e) {
    var copy = {};
    for (var k in e) copy[k] = e[k];
    copy.firstName = e.name.split(' ')[0];
    return copy;
  });

  function today() {
    var d = new Date();
    var m = d.getMonth() + 1, dd = d.getDate();
    return d.getFullYear() + '-' + (m < 10 ? '0' + m : m) + '-' + (dd < 10 ? '0' + dd : dd);
  }

  function load() {
    try { return JSON.parse(window.localStorage.getItem(STORE_KEY) || '{}'); }
    catch (e) { return {}; }
  }
  function save(store) {
    try { window.localStorage.setItem(STORE_KEY, JSON.stringify(store)); } catch (e) {}
  }

  function seed() {
    var store = load();
    if (store.__seeded) return store;
    store = { __seeded: true };
    // Ein paar Beispieltage der laufenden Woche, damit die Kennzahlen leben.
    var iso = today();
    var demo = [
      { tag: 'Musikschule', from: '08:00', to: '12:00' },
      { tag: 'Marketing', from: '13:00', to: '17:30' }
    ];
    var cursor = iso.slice(0, 8) + '01';
    var skipped = 0;
    while (cursor < iso) {
      if (!laemuIsWeekend(cursor) && !laemuHolidayName(cursor)) {
        // Zwei Tage bewusst auslassen, damit die Erinnerung sichtbar wird.
        if (skipped === 3 || skipped === 7) {
          skipped++;
        } else {
          skipped++;
          employees.forEach(function (emp) {
            if (cursor < emp.startDate) return;
            store[emp.name + '|' + cursor] = {
              date: cursor,
              projects: demo.map(function (d) { return { tag: d.tag, from: d.from, to: d.to, note: '' }; }),
              absences: [],
              pauseMinutes: 30
            };
          });
        }
      }
      cursor = laemuAddDays(cursor, 1);
    }
    save(store);
    return store;
  }

  function daysFor(name, workload) {
    var store = seed();
    var out = {};
    Object.keys(store).forEach(function (key) {
      if (key === '__seeded') return;
      var parts = key.split('|');
      if (parts[0] !== name) return;
      out[parts[1]] = laemuComputeDay(store[key], workload);
    });
    return out;
  }

  function employee(name) {
    for (var i = 0; i < employees.length; i++) if (employees[i].name === name) return employees[i];
    return null;
  }

  function stats(emp, summary, todayIso) {
    var monthKey = todayIso.slice(0, 7);
    var month = summary.months && summary.months[monthKey];
    return {
      overtime: summary.balance,
      recordedDays: summary.recordedDays,
      periodEnd: summary.periodEnd,
      periodStart: summary.periodStart,
      showVacation: emp.showVacation,
      vacationEntitlement: summary.vacationEntitlement,
      vacationUsed: summary.vacationUsed || 0,
      vacationRemaining: summary.vacationRemaining,
      year: Number(todayIso.slice(0, 4)),
      month: monthKey,
      monthLabel: laemuMonthLabel(monthKey),
      monthTotal: month ? month.totalHours : 0,
      monthTarget: month ? month.targetHours : 0,
      monthBalance: month ? month.balance : 0,
      missingDays: (month ? month.missingDays : []).map(laemuFormatDate),
      missingDaysCount: month ? month.missingDays.length : 0
    };
  }

  return {
    bootstrap: function () {
      var iso = today();
      return {
        employees: employees.map(function (e) {
          return {
            name: e.name, firstName: e.firstName, role: e.role,
            showVacation: e.showVacation, startDate: e.startDate,
            dailyTarget: laemuRound2(laemuDailyTarget(e.workload))
          };
        }),
        projectTags: PROJECT_TAGS,
        absenceTags: ABSENCE_TAGS,
        quote: laemuQuoteOfDay(iso),
        today: iso,
        todayLabel: laemuWeekdayName(iso) + ', ' + laemuFormatDate(iso),
        weeklyHours: WEEKLY_HOURS,
        dailyTarget: laemuRound2(laemuDailyTarget(1)),
        matchedEmployee: '',
        holidayName: laemuHolidayName(iso)
      };
    },
    laemuGetDayState: function (name, iso) {
      var emp = employee(name);
      var days = daysFor(name, emp.workload);
      var todayIso = today();
      var summary = laemuComputeSummary(days, emp, todayIso);
      var existing = days[iso] || null;
      return {
        employee: name, date: iso,
        weekday: laemuWeekdayName(iso),
        isWeekend: laemuIsWeekend(iso),
        holiday: laemuHolidayName(iso),
        beforeStart: iso < emp.startDate,
        startDate: emp.startDate,
        dailyTarget: laemuRound2(laemuDailyTarget(emp.workload)),
        existing: existing ? {
          projects: existing.projects, absences: existing.absences,
          pauseMinutes: existing.pauseMinutes
        } : null,
        stats: stats(emp, summary, todayIso)
      };
    },
    laemuSubmitDay: function (payload) {
      var emp = employee(payload.employee);
      var day = {
        date: payload.date,
        projects: payload.projects || [],
        absences: payload.absences || [],
        pauseMinutes: Number(payload.pauseMinutes || 0)
      };
      var errors = laemuValidateDay(day);
      if (errors.length) return { ok: false, errors: errors };
      var store = seed();
      store[emp.name + '|' + day.date] = day;
      save(store);
      var computed = laemuComputeDay(day, emp.workload);
      var todayIso = today();
      var summary = laemuComputeSummary(daysFor(emp.name, emp.workload), emp, todayIso);
      var s = stats(emp, summary, todayIso);
      return {
        ok: true,
        message: 'Danke ' + emp.firstName + '!',
        day: computed,
        stats: s,
        reminder: s.missingDaysCount
          ? 'Im ' + s.monthLabel + ' fehlen noch ' + s.missingDaysCount + ' Arbeitstage: ' +
            s.missingDays.slice(0, 5).join(', ') + '.'
          : 'Im ' + s.monthLabel + ' ist bisher jeder Arbeitstag erfasst. Weiter so!'
      };
    }
  };
})();

/* google.script.run nachbilden, damit die Oberfläche unverändert läuft. */
window.google = {
  script: {
    run: (function () {
      function makeRunner(onOk, onErr) {
        var api = {
          withSuccessHandler: function (fn) { return makeRunner(fn, onErr); },
          withFailureHandler: function (fn) { return makeRunner(onOk, fn); }
        };
        ['laemuGetDayState', 'laemuSubmitDay'].forEach(function (name) {
          api[name] = function () {
            var args = Array.prototype.slice.call(arguments);
            var self = this;
            setTimeout(function () {
              try {
                var result = LAEMU_PREVIEW[name].apply(self, args);
                if (onOk) onOk(result);
              } catch (err) {
                if (onErr) onErr(err);
              }
            }, 140);
          };
        });
        return api;
      }
      return makeRunner(null, null);
    })()
  }
};
window.LAEMU_BOOTSTRAP = LAEMU_PREVIEW.bootstrap();
`;

// Körper der Seite aus Index.html herausschneiden
const body = index
  .split('<body>')[1]
  .split('</body>')[0]
  .replace(/<script>\s*var LAEMU_BOOTSTRAP[\s\S]*?<\/script>/, '')
  .replace(/<\?!=\s*include\('JavaScript'\);\s*\?>/, '')
  .trim();

const banner = `
<div style="max-width:720px;margin:0 auto;padding:18px 20px 0;font-family:'Figtree',Helvetica,Arial,sans-serif;
            font-size:12.5px;color:#505050;text-align:center;letter-spacing:.02em;">
  Vorschau · Eingaben werden nur im Browser gespeichert, nicht ins Google Sheet.
</div>`;

const parts = [banner, body, '<script>\n' + mock + '\n</script>', '<script>\n' + appJs + '\n</script>'];

const standalone = `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>LAEMU Stundenrapport – Vorschau</title>
${styles}
</head>
<body>
${parts.join('\n')}
</body>
</html>
`;

const artifact = `<title>LAEMU Stundenrapport</title>
${styles}
${parts.join('\n')}
`;

fs.mkdirSync(path.join(root, 'preview'), { recursive: true });
fs.writeFileSync(path.join(root, 'preview', 'index.html'), standalone);
fs.writeFileSync(path.join(root, 'preview', 'artifact.html'), artifact);
console.log('preview/index.html und preview/artifact.html erzeugt.');

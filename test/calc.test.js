const test = require('node:test');
const assert = require('node:assert/strict');
const L = require('./load');

const LIAN = { name: 'Lian Müller', startDate: '2026-09-01', vacationDays: 25, workload: 1, showVacation: true };
const OWNER = { name: 'Selina Strickler', startDate: '2026-01-01', vacationDays: 0, workload: 1, showVacation: false };

test('Tagessoll ergibt sich aus 42 Stunden pro Woche', () => {
  assert.equal(L.laemuDailyTarget(1), 8.4);
  assert.equal(L.laemuDailyTarget(0.5), 4.2);
});

test('Stunden werden in Dezimalstellen gerechnet', () => {
  assert.equal(L.laemuHoursBetween('08:00', '12:15'), 4.25);
  assert.equal(L.laemuHoursBetween('13:00', '17:50'), 4.83);
  assert.equal(L.laemuHoursBetween('17:00', '09:00'), 0);
  assert.equal(L.laemuHoursBetween('', '12:00'), 0);
});

test('Feiertage Kanton Schwyz 2026 stimmen mit der amtlichen Liste überein', () => {
  const h = L.laemuHolidays(2026);
  const expected = {
    '2026-01-01': 'Neujahr',
    '2026-01-02': 'Berchtoldstag',
    '2026-01-06': 'Heilige Drei Könige',
    '2026-03-19': 'Josefstag',
    '2026-04-03': 'Karfreitag',
    '2026-04-06': 'Ostermontag',
    '2026-05-14': 'Auffahrt',
    '2026-05-25': 'Pfingstmontag',
    '2026-06-04': 'Fronleichnam',
    '2026-08-01': 'Bundesfeier',
    '2026-08-15': 'Mariä Himmelfahrt',
    '2026-11-01': 'Allerheiligen',
    '2026-12-08': 'Mariä Empfängnis',
    '2026-12-25': 'Weihnachten',
    '2026-12-26': 'Stephanstag'
  };
  for (const iso of Object.keys(expected)) assert.equal(h[iso], expected[iso], iso);
  assert.equal(L.laemuToIso(L.laemuEasterSunday(2026)), '2026-04-05');
  assert.equal(L.laemuToIso(L.laemuEasterSunday(2027)), '2027-03-28');
});

test('Arbeitstag mit zwei Projekten und Pause', () => {
  const day = L.laemuComputeDay({
    date: '2026-09-02', // Mittwoch
    projects: [
      { tag: 'Musikschule', from: '08:00', to: '12:00' },
      { tag: 'Marketing', from: '13:00', to: '17:45' }
    ],
    absences: [],
    pauseMinutes: 30
  }, 1);
  assert.equal(day.grossHours, 8.75);
  assert.equal(day.workHours, 8.25);
  assert.equal(day.targetHours, 8.4);
  assert.equal(day.balance, -0.15);
  assert.equal(day.totalHours, 8.25);
});

test('Samstagsarbeit zählt voll, weil kein Soll besteht', () => {
  const day = L.laemuComputeDay({
    date: '2026-09-05', // Samstag
    projects: [{ tag: 'Shop', from: '09:00', to: '14:00' }],
    absences: [],
    pauseMinutes: 0
  }, 1);
  assert.equal(day.isWeekend, true);
  assert.equal(day.targetHours, 0);
  assert.equal(day.balance, 5);
});

test('Feiertag Mo–Fr wird gutgeschrieben, am Wochenende nicht', () => {
  const werktag = L.laemuComputeDay({ date: '2026-12-25', projects: [], absences: [], pauseMinutes: 0 }, 1);
  assert.equal(werktag.holiday, 'Weihnachten');
  assert.equal(werktag.holidayCredit, 8.4);
  assert.equal(werktag.balance, 0);

  const samstag = L.laemuComputeDay({ date: '2026-12-26', projects: [], absences: [], pauseMinutes: 0 }, 1);
  assert.equal(samstag.holiday, 'Stephanstag');
  assert.equal(samstag.holidayCredit, 0);
  assert.equal(samstag.balance, 0);
});

test('Manuell erfasste Feiertagsstunden werden nicht doppelt gezählt', () => {
  const day = L.laemuComputeDay({
    date: '2026-12-25',
    projects: [],
    absences: [{ tag: 'Feiertag', hours: 4 }],
    pauseMinutes: 0
  }, 1);
  assert.equal(day.holidayCredit, 4.4);
  assert.equal(day.totalHours, 8.4);
  assert.equal(day.balance, 0);
});

test('Arbeit am Feiertag ergibt Überstunden', () => {
  const day = L.laemuComputeDay({
    date: '2026-12-25',
    projects: [{ tag: 'Shop', from: '09:00', to: '13:00' }],
    absences: [],
    pauseMinutes: 0
  }, 1);
  assert.equal(day.totalHours, 12.4);
  assert.equal(day.balance, 4);
});

test('Ferien werden in Tagen umgerechnet', () => {
  const day = L.laemuComputeDay({
    date: '2026-09-03',
    projects: [],
    absences: [{ tag: 'Ferien', hours: 8.4 }],
    pauseMinutes: 0
  }, 1);
  assert.equal(day.vacationDays, 1);
  assert.equal(day.balance, 0);
});

test('Ferienanspruch wird ab Anstellungsbeginn anteilig gerechnet', () => {
  assert.equal(L.laemuVacationEntitlement(2026, '2026-09-01', 25, 1), 8.5); // 4 von 12 Monaten
  assert.equal(L.laemuVacationEntitlement(2027, '2026-09-01', 25, 1), 25);
  assert.equal(L.laemuVacationEntitlement(2025, '2026-09-01', 25, 1), 0);
  assert.equal(L.laemuVacationEntitlement(2026, '2026-01-01', 0, 1), 0); // Inhaber:innen
  assert.equal(L.laemuVacationEntitlement(2026, '2026-07-01', 25, 0.5), 6.5); // 12.5 * 6/12, auf halbe Tage
});

test('Gesamtauswertung: Saldo, fehlende Tage und Ferien', () => {
  const days = {};
  function add(date, from, to, pause, absences) {
    days[date] = L.laemuComputeDay({
      date: date,
      projects: from ? [{ tag: 'Musikschule', from: from, to: to }] : [],
      absences: absences || [],
      pauseMinutes: pause || 0
    }, 1);
  }
  // Woche vom 7. bis 11. September 2026 (Mo–Fr), danach eine Lücke am 14.9.
  add('2026-09-07', '08:00', '17:00', 30);   // 8.5
  add('2026-09-08', '08:00', '17:00', 30);   // 8.5
  add('2026-09-09', '08:00', '17:00', 30);   // 8.5
  add('2026-09-10', null, null, 0, [{ tag: 'Ferien', hours: 8.4 }]);
  add('2026-09-11', '08:00', '12:00', 0);    // 4.0
  add('2026-09-15', '08:00', '16:24', 0);    // 8.4
  const summary = L.laemuComputeSummary(days, LIAN, '2026-09-30');
  assert.equal(summary.periodStart, '2026-09-07');
  assert.equal(summary.totalHours, L.laemuRound2(8.5 * 3 + 8.4 + 4 + 8.4));
  assert.equal(summary.targetHours, L.laemuRound2(8.4 * 7)); // 7.–15.9. sind sieben Arbeitstage
  assert.equal(summary.balance, L.laemuRound2(8.5 * 3 + 8.4 + 4 + 8.4 - 8.4 * 7));
  assert.equal(summary.vacationUsed, 1);
  assert.equal(summary.vacationEntitlement, 8.5);
  assert.equal(summary.vacationRemaining, 7.5);
  // Nur der 14.9. liegt innerhalb des Zeitraums und ist nicht erfasst.
  assert.deepEqual(Array.from(summary.missingDays), ['2026-09-14']);
  assert.equal(summary.monthList.length, 1);
  assert.equal(summary.monthList[0].month, '2026-09');
});

test('Wer später mit dem Erfassen beginnt, startet nicht im Minus', () => {
  const days = {};
  days['2026-06-15'] = L.laemuComputeDay({
    date: '2026-06-15', projects: [{ tag: 'Shop', from: '08:00', to: '16:24' }], absences: [], pauseMinutes: 0
  }, 1);
  const summary = L.laemuComputeSummary(days, OWNER, '2026-06-15');
  assert.equal(summary.periodStart, '2026-06-15');  // nicht der 1.1.
  assert.equal(summary.targetHours, 8.4);
  assert.equal(summary.balance, 0);
});

test('Ein Startsaldo wird übernommen', () => {
  const employee = Object.assign({}, OWNER, { openingBalance: 12.5 });
  const days = {};
  days['2026-06-15'] = L.laemuComputeDay({
    date: '2026-06-15', projects: [{ tag: 'Shop', from: '08:00', to: '18:24' }], absences: [], pauseMinutes: 0
  }, 1);
  const summary = L.laemuComputeSummary(days, employee, '2026-06-15');
  assert.equal(summary.balance, 14.5);                         // 12.5 + 2 Überstunden
  assert.equal(summary.monthList[0].cumulativeBalance, 14.5);
  assert.equal(L.laemuComputeSummary({}, employee, '2026-06-15').balance, 12.5);
});

test('Nicht erfasste Feiertage gelten als gutgeschrieben und fehlen nicht', () => {
  const employee = { startDate: '2026-12-21', vacationDays: 0, workload: 1, showVacation: false };
  const days = {};
  // 21.–24.12. und 28.12. je 8.4 Stunden; der 25.12. (Freitag) ist Feiertag.
  ['2026-12-21', '2026-12-22', '2026-12-23', '2026-12-24', '2026-12-28'].forEach((date) => {
    days[date] = L.laemuComputeDay({
      date: date, projects: [{ tag: 'Shop', from: '08:00', to: '16:24' }], absences: [], pauseMinutes: 0
    }, 1);
  });
  const summary = L.laemuComputeSummary(days, employee, '2026-12-31');
  assert.equal(summary.holidayCredit, 8.4);            // Weihnachten
  assert.deepEqual(Array.from(summary.missingDays), []); // Feiertag zählt nicht als fehlend
  assert.equal(summary.targetHours, L.laemuRound2(8.4 * 6));
  assert.equal(summary.balance, 0);
});

test('Ohne Einträge bleibt der Saldo bei null', () => {
  const summary = L.laemuComputeSummary({}, LIAN, '2026-09-15');
  assert.equal(summary.balance, 0);
  assert.equal(summary.recordedDays, 0);
  assert.equal(summary.vacationEntitlement, 8.5);
  assert.equal(summary.vacationRemaining, 8.5);
});

test('Validierung erkennt fehlerhafte Eingaben', () => {
  assert.deepEqual(
    Array.from(L.laemuValidateDay({ date: '2026-09-02', projects: [], absences: [], pauseMinutes: 0 })),
    ['Bitte mindestens ein Projekt oder eine Abwesenheit erfassen.']);

  const wrongOrder = L.laemuValidateDay({
    date: '2026-09-02',
    projects: [{ tag: 'Shop', from: '17:00', to: '09:00' }],
    absences: [], pauseMinutes: 0
  });
  assert.ok(wrongOrder.some((e) => e.indexOf('Arbeitsende muss nach') >= 0));

  const noTag = L.laemuValidateDay({
    date: '2026-09-02', projects: [], absences: [{ tag: '', hours: 4 }], pauseMinutes: 0
  });
  assert.ok(noTag.some((e) => e.indexOf('Bitte einen Tag') >= 0));

  const longPause = L.laemuValidateDay({
    date: '2026-09-02',
    projects: [{ tag: 'Shop', from: '09:00', to: '10:00' }],
    absences: [], pauseMinutes: 120
  });
  assert.ok(longPause.some((e) => e.indexOf('Pause ist länger') >= 0));

  assert.deepEqual(Array.from(L.laemuValidateDay({
    date: '2026-09-02',
    projects: [{ tag: 'Shop', from: '09:00', to: '12:00' }],
    absences: [], pauseMinutes: 15
  })), []);
});

test('Der Spruch des Tages wechselt täglich und wiederholt sich im Zyklus nicht', () => {
  const n = L.LAEMU_QUOTES.length;
  let iso = '2026-01-01';
  while (L.laemuDayNumber(iso) % n !== 0) iso = L.laemuAddDays(iso, 1);
  const seen = new Set();
  let previous = null;
  for (let i = 0; i < n * 3; i++) {
    const quote = L.laemuQuoteOfDay(iso);
    if (i < n) seen.add(quote.text);
    assert.notEqual(quote.text, previous, 'zwei gleiche Sprüche hintereinander am ' + iso);
    previous = quote.text;
    iso = L.laemuAddDays(iso, 1);
  }
  assert.equal(seen.size, n);
  // Gleicher Tag, gleicher Spruch
  assert.equal(L.laemuQuoteOfDay('2026-08-27').text, L.laemuQuoteOfDay('2026-08-27').text);
});

test('Datumshilfen rechnen über Monats- und Jahresgrenzen', () => {
  assert.equal(L.laemuAddDays('2026-12-31', 1), '2027-01-01');
  assert.equal(L.laemuAddDays('2026-03-01', -1), '2026-02-28');
  assert.equal(L.laemuWeekdayName('2026-08-27'), 'Donnerstag');
  assert.equal(L.laemuFormatDate('2026-08-27'), '27.08.2026');
  assert.equal(L.laemuMonthLabel('2026-08'), 'August 2026');
  assert.equal(L.laemuIsWeekend('2026-08-29'), true);
});

test('Hinweiszeilen im Blatt «Einstellungen» gelten nicht als Mitarbeitende', () => {
  // Echte Zeilen
  assert.equal(L.laemuIsEmployeeRow(
    ['Lian Müller', 'Mitarbeiter', '2026-09-01', 1, 25, 'ja', 0, 'lian@example.ch']), true);
  assert.equal(L.laemuIsEmployeeRow(
    ['Niklaus Hess', 'Inhaber', '2026-01-01', 1, 0, 'nein', 0, '']), true);
  // Der Hinweistext, der beim Einrichten ins Blatt geschrieben wird
  assert.equal(L.laemuIsEmployeeRow([
    'Hinweis: E-Mail eintragen, damit die monatliche Erinnerung verschickt wird. ' +
    'Startsaldo = bereits bestehende Überstunden beim Beginn der Erfassung. ' +
    'Wöchentliche Sollzeit: 42 h (8.4 h pro Arbeitstag).', '', '', '', '', '', '', '']), false);
  // Leere und unvollständige Zeilen
  assert.equal(L.laemuIsEmployeeRow(['', '', '', '', '', '', '', '']), false);
  assert.equal(L.laemuIsEmployeeRow(['Nur ein Name ohne Angaben', '', '', '', '', '', '', '']), false);
  assert.equal(L.laemuIsEmployeeRow(null), false);
  // Ein Name allein genügt, sobald eine weitere Spalte gefüllt ist
  assert.equal(L.laemuIsEmployeeRow(['Neue Person', '', '', 1, '', '', '', '']), true);
});

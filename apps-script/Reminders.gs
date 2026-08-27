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

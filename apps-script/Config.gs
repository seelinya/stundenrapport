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
var PROJECT_TAGS = ['Musikschule', 'Marketing', 'Shop', 'Buchhaltung', 'Admin', 'Media', 'Weiteres'];

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
 *  hourly        true = ohne feste Anstellung (Stundenbasis): kein Soll,
 *                keine Überstunden, keine Ferien – die Stunden werden nur
 *                pro Monat zusammengezählt
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
    hourly: false,
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
    hourly: false,
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
    hourly: false,
    email: ''
  },
  {
    name: 'Vreni Strickler',
    role: 'Mitarbeiterin',
    startDate: '2026-01-01',
    vacationDays: 0,
    showVacation: false,
    workload: 1,
    openingBalance: 0,
    hourly: true,
    email: ''
  },
  {
    name: 'Marlies Hess',
    role: 'Mitarbeiterin',
    startDate: '2026-01-01',
    vacationDays: 0,
    showVacation: false,
    workload: 1,
    openingBalance: 0,
    hourly: true,
    email: ''
  },
  {
    name: 'Emilia Hess',
    role: 'Mitarbeiterin',
    startDate: '2026-01-01',
    vacationDays: 0,
    showVacation: false,
    workload: 1,
    openingBalance: 0,
    hourly: true,
    email: ''
  }
];

/** Werte der Spalte «Anstellung» im Blatt «Einstellungen». */
var EMPLOYMENT_FIXED = 'fest';
var EMPLOYMENT_HOURLY = 'Stundenbasis';

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

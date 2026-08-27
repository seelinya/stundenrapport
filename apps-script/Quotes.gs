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

// app.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import ReactDOM from "react-dom/client";
import { Zap, Calendar, Users, Trophy, Flame, Target, Brain, Wind, Plus, Check, X, ChevronRight, Shield, Play, Pause, RotateCcw, Timer, Move, Footprints, Activity, Waves, Eye, ArrowUpDown, Video, HelpCircle, Lock, Unlock } from "lucide-react";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, get, set, remove } from "firebase/database";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
var ROLES = [
  { id: "spieler", label: "Spieler" },
  { id: "eltern", label: "Eltern" },
  { id: "trainer", label: "Trainer" }
];
var CATEGORIES = {
  sport: { label: "Sport", color: "#4F8EFF", icon: Zap },
  mental: { label: "Mental", color: "#B99BFF", icon: Brain }
};
var XP_PER_TASK = 20;
var XP_PER_EXERCISE = 15;
var SPORT_GROUPS = {
  speed: { label: "Speed", color: "#4F8EFF", icon: Zap, sub: "Technik, Sprungkraft & echtes Maximaltempo" },
  dehnen: { label: "Dehnen", color: "#5CC8FF", icon: Move, sub: "Beweglichkeit & Regeneration" },
  athletik: { label: "Athletik", color: "#FFB84D", icon: Footprints, sub: "Stabilit\xE4t & K\xF6rperkontrolle" }
};
var MENTAL_GROUPS = {
  fokus: { label: "Fokus", color: "#7CD4FF", icon: Target, sub: "Konzentration & Ablenkung ausblenden" },
  ruhe: { label: "Ruhe", color: "#B99BFF", icon: Wind, sub: "Atmung & Nervosit\xE4t regulieren" },
  vertrauen: { label: "Vertrauen", color: "#FFD166", icon: Flame, sub: "An dich glauben & R\xFCckschl\xE4ge wegstecken" },
  routine: { label: "Routine", color: "#FF9B7A", icon: Calendar, sub: "Ziele, Visualisierung & Spieltag" }
};
var ALL_GROUPS = { ...SPORT_GROUPS, ...MENTAL_GROUPS };
var EXERCISE_LIBRARY = [
  // SPEED — nach dem Prinzip von Speedcoach Raphael Schuler (KEYtoSPEED):
  // Aktivierung → Technikdrills → Sprungkraft → echtes Maximaltempo, statt nur "viele Sprints".
  {
    id: "sp1",
    group: "speed",
    name: "Speed Prep \u2013 Aktivierung",
    desc: "3 Teile nacheinander: H\xFCftkreisen, Ausfallschritte, leichtes H\xFCpfen \u2013 bringt Nervensystem und Muskulatur in Sprintbereitschaft",
    type: "steps",
    steps: [
      { label: "H\xFCftkreisen", seconds: 30 },
      { label: "Ausfallschritte", seconds: 30 },
      { label: "Leichtes H\xFCpfen", seconds: 30 }
    ],
    icon: Activity,
    questions: [
      { q: "Warum reicht normales Dehnen vor dem Sprinten nicht aus?", options: ["Weil Nervensystem und Muskulatur zus\xE4tzlich aktiv auf Tempo gebracht werden m\xFCssen", "Weil Dehnen generell schlecht ist", "Spielt keine Rolle, direkt sprinten reicht"], correct: 0, explanation: "Sprints brauchen ein aktiviertes Nervensystem \u2013 reines Dehnen bereitet dich darauf nicht ausreichend vor." },
      { q: "Was ist das Ziel der Aktivierungsphase?", options: ["Ersch\xF6pfung erzeugen", "K\xF6rper und Nervensystem auf explosive Bewegungen vorbereiten", "Ausdauer trainieren"], correct: 1, explanation: "Ziel ist Bereitschaft, nicht Erm\xFCdung \u2013 danach folgt erst das eigentliche Speedtraining." },
      { q: "Wo steht die Aktivierung sinnvollerweise im Trainingsablauf?", options: ["Ganz am Anfang, vor Technikdrills und Sprints", "Erst nach dem Sprinttraining", "Braucht keinen festen Platz"], correct: 0, explanation: "Eine sinnvolle Reihenfolge bereitet K\xF6rper und Nervensystem stufenweise auf die h\xF6chste Belastung vor." }
    ]
  },
  {
    id: "sp2",
    group: "speed",
    name: "A-Skip (Sprint-Technik)",
    desc: "Kniehub-Lauf: Knie explosiv hoch, Fu\xDF aktiv von oben nach unten in den Boden setzen",
    type: "reps",
    reps: "3 x 15m",
    icon: Footprints,
    questions: [
      { q: "Was ist beim A-Skip wichtiger als m\xF6glichst hohe Knie?", options: ["Ein aktiver, schneller Bodenkontakt", "M\xF6glichst laute Schritte", "Langsames, kontrolliertes Tempo"], correct: 0, explanation: "Der aktive Bodenkontakt trainiert genau das Timing, das du beim echten Sprinten brauchst \u2013 hohe Knie allein bringen wenig." },
      { q: "Wof\xFCr ist ein Technikdrill wie der A-Skip gut?", options: ["Er verbessert gezielt Koordination und Sprinttechnik", "Er ersetzt komplett das Sprinttraining", "Er trainiert nur die Ausdauer"], correct: 0, explanation: "Technikdrills verbessern die Bewegungsqualit\xE4t, die du dann im echten Sprint abrufst." },
      { q: "Wie sollte der Fu\xDF beim Bodenkontakt aufkommen?", options: ["Flach und passiv aufkommen lassen", "Aktiv von oben nach unten in den Boden 'greifen'", "Auf der Ferse abrollen"], correct: 1, explanation: "Ein aktives Greifen des Bodens erzeugt mehr Kraft und k\xFCrzere Bodenkontaktzeiten \u2013 genau das macht dich schneller." }
    ]
  },
  {
    id: "sp3",
    group: "speed",
    name: "Wandsprint (Wall Drill)",
    desc: "H\xE4nde an einer Wand oder einem Zaun abst\xFCtzen, K\xF6rper leicht schr\xE4g, Beine im Wechsel explosiv hochziehen",
    type: "time",
    seconds: 20,
    icon: Move,
    questions: [
      { q: "Was trainierst du beim Wandsprint haupts\xE4chlich?", options: ["Die Antrittsposition und Beinfrequenz, ohne wirklich zu laufen", "Deine Armkraft", "Deine Ausdauer"], correct: 0, explanation: "Der Wandsprint isoliert die Beinbewegung des Antritts \u2013 perfekt zum Techniklernen ohne Lauf-Ablenkung." },
      { q: "In welcher K\xF6rperposition machst du den Wandsprint?", options: ["Leicht schr\xE4g nach vorne geneigt", "Komplett gerade wie im Stehen", "Weit nach hinten gelehnt"], correct: 0, explanation: "Die leichte Vorlage simuliert die K\xF6rperposition beim echten Antritt." },
      { q: "Warum eignet sich dieser Drill gut zum Techniklernen?", options: ["Weil du dich voll auf die Beinbewegung konzentrieren kannst, ohne vorw\xE4rts zu laufen", "Weil er die Ausdauer maximal fordert", "Weil er besonders lange dauert"], correct: 0, explanation: "Ohne Vorw\xE4rtsbewegung kannst du dich voll auf sauberes Kniehub-Timing konzentrieren." }
    ]
  },
  {
    id: "sp4",
    group: "speed",
    name: "Pogo-Spr\xFCnge",
    desc: "Enge, schnelle Spr\xFCnge auf der Stelle mit kaum gebeugten Knien \u2013 kurzer, harter Bodenkontakt",
    type: "time",
    seconds: 20,
    icon: ArrowUpDown,
    questions: [
      { q: "Was trainieren Pogo-Spr\xFCnge vor allem?", options: ["Reaktive Sprungkraft und kurze, schnelle Bodenkontakte", "Maximalkraft", "Beweglichkeit"], correct: 0, explanation: "Pogo-Spr\xFCnge trainieren, wie schnell dein K\xF6rper Kraft in den Boden abgeben und zur\xFCckbekommen kann \u2013 wichtig f\xFCr Explosivit\xE4t." },
      { q: "Wie tief gehst du bei Pogo-Spr\xFCngen in die Knie?", options: ["Sehr tief wie beim Kniebeugen", "Kaum, die Knie bleiben fast gestreckt", "Beliebig tief"], correct: 1, explanation: "Kaum gebeugte Knie sorgen f\xFCr kurze, steife Bodenkontakte \u2013 genau das ist der Trainingsreiz." },
      { q: "Warum reichen einfache Bodenspr\xFCnge oft, statt gleich mit H\xFCrden zu arbeiten?", options: ["Weil saubere Grund\xFCbungen oft genauso wirksam und sicherer sind", "Weil H\xFCrden verboten sind", "Weil sie zu teuer sind"], correct: 0, explanation: "Viele Speedcoaches setzen zuerst auf saubere Boden\xFCbungen, bevor komplexere Varianten sinnvoll werden." }
    ]
  },
  {
    id: "sp5",
    group: "speed",
    name: "Fliegender Sprint (Fly Sprint)",
    desc: "Ca. 10m locker anlaufen, dann 15\u201320m im echten Maximaltempo sprinten \u2013 danach vollst\xE4ndig erholen",
    type: "reps",
    reps: "3 x 15m fliegend",
    icon: Zap,
    questions: [
      { q: "Was unterscheidet einen fliegenden Sprint von einem Start aus dem Stand?", options: ["Du erreichst durch den Anlauf wirklich deine H\xF6chstgeschwindigkeit, statt nur den Antritt zu trainieren", "Er ist einfach nur k\xFCrzer", "Er braucht keine Erholung"], correct: 0, explanation: "Ohne Anlauf trainierst du haupts\xE4chlich die erste Beschleunigung \u2013 der fliegende Sprint fordert deine echte H\xF6chstgeschwindigkeit." },
      { q: "Warum ist es wichtig, \xFCberhaupt mal echtes Maximaltempo zu trainieren?", options: ["Weil im normalen Training selten wirklich volles Tempo erreicht wird, im Spiel aber schon", "Weil es keinen Unterschied macht", "Weil es allein die Ausdauer verbessert"], correct: 0, explanation: "Im normalen Training und in Spielformen wird selten wirklich maximal gesprintet \u2013 ohne gezieltes Training bist du darauf nicht vorbereitet." },
      { q: "Wie wichtig ist volle Erholung zwischen den fliegenden Sprints?", options: ["Sehr wichtig, sonst sinkt die Qualit\xE4t deutlich", "Unwichtig, Pause ist Zeitverschwendung", "Nur bei Erwachsenen wichtig"], correct: 0, explanation: "Nur mit voller Erholung kannst du beim n\xE4chsten Sprint wieder dein echtes Maximaltempo erreichen." }
    ]
  },
  {
    id: "sp6",
    group: "speed",
    name: "Reaktionsstarts",
    desc: "Aus verschiedenen Positionen (sitzend, liegend) auf Kommando lossprinten, 5m",
    type: "reps",
    reps: "8 Starts",
    icon: Timer,
    questions: [
      { q: "Wie startest du am schnellsten?", options: ["Schon vor dem Kommando leicht loslaufen", "Erst beim Kommando explosiv reagieren", "Erst hochschauen, dann starten"], correct: 1, explanation: "Echte Reaktionsschnelligkeit trainierst du nur, wenn du wirklich auf das Signal wartest." },
      { q: "Warum trainierst du Starts aus verschiedenen Positionen?", options: ["Sieht cool aus", "Weil du im Tor oft aus ungewohnten Positionen reagieren musst", "Macht keinen Unterschied"], correct: 1, explanation: "Im Spiel bist du selten startbereit wie beim 100m-Lauf \u2013 das Training simuliert echte Situationen." },
      { q: "Wie viele Meter sprintest du nach dem Start?", options: ["Ca. 5 Meter, dann abbremsen", "Mindestens 50 Meter", "Nur 1 Meter"], correct: 0, explanation: "Kurze, knackige Sprints trainieren die erste explosive Phase, die im Tor entscheidend ist." }
    ]
  },
  {
    id: "sp7",
    group: "speed",
    name: "B-Skip (Sprint-Technik Fortgeschritten)",
    desc: "Wie A-Skip, aber das Knie wird oben kurz nach vorne gestreckt, bevor der Fu\xDF aktiv zur\xFCck in den Boden greift",
    type: "reps",
    reps: "3 x 15m",
    icon: Footprints,
    questions: [
      { q: "Was kommt beim B-Skip zus\xE4tzlich zum A-Skip dazu?", options: ["Eine kurze Streckung des Unterschenkels nach vorne oben", "Ein Sprung in die H\xF6he", "Ein Armkreisen"], correct: 0, explanation: "Die zus\xE4tzliche Streckung simuliert die Beinbewegung kurz vor dem Bodenkontakt im echten Sprint." },
      { q: "Warum ist der B-Skip anspruchsvoller als der A-Skip?", options: ["Weil er mehr Koordination zwischen H\xFCfte, Knie und Fu\xDF braucht", "Weil er langsamer ist", "Weil er keine Beine braucht"], correct: 0, explanation: "Die zus\xE4tzliche Bewegungskomponente erfordert mehr koordinative Kontrolle." },
      { q: "Wann macht der B-Skip im Training Sinn?", options: ["Nach dem A-Skip, wenn die Grundtechnik sitzt", "Ganz am Anfang vor jeder Aktivierung", "Nur bei Verletzung"], correct: 0, explanation: "Er baut auf der Grundtechnik des A-Skip auf und kommt daher meist danach." }
    ]
  },
  {
    id: "sp8",
    group: "speed",
    name: "Bounding (Sprunglauf)",
    desc: "Gro\xDFe, kraftvolle Laufschritte mit viel Luftzeit, wie \xFCbertriebenes Laufen mit Spr\xFCngen",
    type: "reps",
    reps: "3 x 20m",
    icon: ArrowUpDown,
    questions: [
      { q: "Was trainiert Bounding vor allem?", options: ["Horizontale Schrittkraft und Power", "Nur die Ausdauer", "Die Beweglichkeit"], correct: 0, explanation: "Die gro\xDFen, kraftvollen Schritte trainieren gezielt die Power, die du f\xFCr lange, schnelle Schritte brauchst." },
      { q: "Worauf achtest du bei der Landung?", options: ["Aktiv und kontrolliert, nicht auf durchgestreckten Beinen", "Komplett steif landen", "Auf den Zehenspitzen t\xE4nzeln"], correct: 0, explanation: "Eine aktive, kontrollierte Landung sch\xFCtzt die Gelenke und erm\xF6glicht den n\xE4chsten kraftvollen Schritt." },
      { q: "Was unterscheidet Bounding von einem normalen Sprint?", options: ["Mehr Luftzeit und Betonung auf Kraft pro Schritt statt auf Frequenz", "Es ist komplett identisch", "Es gibt keine Beinbewegung"], correct: 0, explanation: "Bounding betont die Kraft pro Schritt, w\xE4hrend ein Sprint auf hohe Frequenz UND Kraft setzt." }
    ]
  },
  {
    id: "sp9",
    group: "speed",
    name: "Fallstart (Falling Start)",
    desc: "Aufrecht stehen, nach vorne 'fallen' lassen bis kurz vor dem Kipppunkt, dann explosiv in den Sprint abfangen",
    type: "reps",
    reps: "5 Starts",
    icon: Zap,
    questions: [
      { q: "Was simuliert der Fallstart?", options: ["Die nat\xFCrliche Vorlage beim Sprintstart", "Einen Sturz", "Eine Dehn\xFCbung"], correct: 0, explanation: "Der Fallstart nutzt die Schwerkraft, um das Gef\xFChl f\xFCr die richtige K\xF6rpervorlage beim Antritt zu entwickeln." },
      { q: "Was passiert, wenn du zu sp\xE4t abf\xE4ngst?", options: ["Du verlierst die Kontrolle und stolperst", "Nichts, das ist gewollt", "Du wirst automatisch schneller"], correct: 0, explanation: "Der Trick ist das Timing \u2013 rechtzeitig in den Sprint 'kippen', bevor die Kontrolle verloren geht." },
      { q: "Wof\xFCr ist diese \xDCbung besonders gut?", options: ["Um das Gef\xFChl f\xFCr die richtige Vorlage beim Antritt zu entwickeln", "F\xFCr die Ausdauer", "F\xFCr die Beweglichkeit der Schulter"], correct: 0, explanation: "Sie schult das K\xF6rpergef\xFChl f\xFCr die optimale K\xF6rperposition beim Start." }
    ]
  },
  {
    id: "sp10",
    group: "speed",
    name: "Partner-Widerstandsstart",
    desc: "Ein Partner h\xE4lt mit einem Handtuch/Gurt leichten Widerstand an der H\xFCfte, w\xE4hrend du 5m antrittst",
    type: "reps",
    reps: "5 pro Person",
    icon: Timer,
    questions: [
      { q: "Warum trainiert man Sprints mit leichtem Widerstand?", options: ["Um die Antrittskraft gezielt zu erh\xF6hen", "Um langsamer zu werden", "Um die Beweglichkeit zu verbessern"], correct: 0, explanation: "Leichter Widerstand zwingt dich, mehr Kraft in jeden Schritt zu bringen." },
      { q: "Wie stark sollte der Widerstand sein?", options: ["Leicht, sodass die Technik nicht leidet", "So stark wie m\xF6glich", "Gar kein Widerstand n\xF6tig"], correct: 0, explanation: "Zu viel Widerstand verschlechtert die Technik \u2013 leichter Widerstand reicht f\xFCr den Trainingsreiz." },
      { q: "Was ist wichtig f\xFCr den Partner, der den Widerstand h\xE4lt?", options: ["Gleichm\xE4\xDFig und kontrolliert mitgehen", "So fest wie m\xF6glich festhalten", "Pl\xF6tzlich loslassen"], correct: 0, explanation: "Ein gleichm\xE4\xDFiger, kontrollierter Widerstand sorgt f\xFCr einen sauberen Trainingsreiz ohne Sturzgefahr." }
    ]
  },
  {
    id: "sp11",
    group: "speed",
    name: "Anfersen (Butt Kicks)",
    desc: "Lockeres Laufen auf der Stelle oder vorw\xE4rts, dabei die Fersen schnell zum Ges\xE4\xDF f\xFChren",
    type: "time",
    seconds: 20,
    icon: Footprints,
    questions: [
      { q: "Was trainiert Anfersen haupts\xE4chlich?", options: ["Die Geschwindigkeit der Beinr\xFCckf\xFChrung nach dem Bodenkontakt", "Die Sprungkraft", "Die Beweglichkeit der Schulter"], correct: 0, explanation: "Eine schnelle Beinr\xFCckf\xFChrung ist ein wichtiger Teil einer effizienten Sprinttechnik." },
      { q: "Wie hoch sollten die Fersen kommen?", options: ["Locker Richtung Ges\xE4\xDF, ohne zu verkrampfen", "Nur minimal, kaum sichtbar", "So hoch wie physisch m\xF6glich mit maximaler Anstrengung"], correct: 0, explanation: "Locker und schnell ist wichtiger als maximale H\xF6he um jeden Preis." },
      { q: "Wof\xFCr wird Anfersen oft im Warm-up genutzt?", options: ["Zur Aktivierung der hinteren Oberschenkelmuskulatur", "Zur Dehnung des Nackens", "Zum Abk\xFChlen nach dem Training"], correct: 0, explanation: "Die Bewegung aktiviert die Hamstrings gezielt f\xFCr die kommende Belastung." }
    ]
  },
  {
    id: "sp12",
    group: "speed",
    name: "Kniehebelauf schnell (High Knees)",
    desc: "Schneller Lauf auf der Stelle oder vorw\xE4rts mit hohem, schnellem Knieheben \u2013 durchgehender Rhythmus statt einzelner Wiederholungen",
    type: "time",
    seconds: 20,
    icon: Footprints,
    questions: [
      { q: "Was ist der Unterschied zwischen High Knees und dem A-Skip?", options: ["High Knees ist ein durchgehender, schneller Rhythmus ohne isolierte Wiederholungen", "Es gibt keinen Unterschied", "High Knees wird nur im Liegen gemacht"], correct: 0, explanation: "Beim A-Skip wird jede Wiederholung isoliert und bewusst ausgef\xFChrt, High Knees ist ein durchgehender schneller Rhythmus." },
      { q: "Was trainierst du haupts\xE4chlich mit High Knees?", options: ["Schrittfrequenz und Rhythmus", "Maximalkraft", "Beweglichkeit der Schulter"], correct: 0, explanation: "Der schnelle, durchgehende Rhythmus trainiert vor allem die Schrittfrequenz." },
      { q: "Wie sollten die Arme dabei mitarbeiten?", options: ["Aktiv im Rhythmus der Beine mitschwingen", "Komplett ruhig bleiben", "\xDCber dem Kopf bleiben"], correct: 0, explanation: "Aktiver Armeinsatz unterst\xFCtzt Rhythmus und Frequenz der Beine." }
    ]
  },
  {
    id: "sp13",
    group: "speed",
    name: "5-10-5 Shuttle",
    desc: "5m in eine Richtung sprinten, abstoppen, 10m zur\xFCck in die Gegenrichtung, abstoppen, 5m zur\xFCck zum Start",
    type: "reps",
    reps: "3 Durchg\xE4nge",
    icon: ArrowUpDown,
    questions: [
      { q: "Was wird beim 5-10-5 Shuttle besonders trainiert?", options: ["Schnelle Richtungswechsel und Abbremsf\xE4higkeit", "Nur die Ausdauer", "Die Wurfkraft"], correct: 0, explanation: "Das st\xE4ndige Abbremsen und Neustarten in verschiedene Richtungen ist der Kern dieser \xDCbung." },
      { q: "Warum ist Abbremsen genauso wichtig wie Beschleunigen?", options: ["Weil du erst gut abbremsen musst, um schnell die Richtung wechseln zu k\xF6nnen", "Abbremsen ist unwichtig", "Nur Profis m\xFCssen abbremsen k\xF6nnen"], correct: 0, explanation: "Ohne kontrolliertes Abbremsen kannst du nicht explosiv die Richtung wechseln." },
      { q: "Wof\xFCr ist diese \xDCbung f\xFCr einen Torwart besonders relevant?", options: ["F\xFCr schnelle Richtungswechsel bei Doppelchancen", "Nur f\xFCr Feldspieler relevant", "F\xFCr das Passspiel"], correct: 0, explanation: "Torh\xFCter m\xFCssen oft blitzschnell die Richtung wechseln, etwa bei Abstauber-Situationen." }
    ]
  },
  {
    id: "sp14",
    group: "speed",
    name: "Bremsen & Beschleunigen",
    desc: "Kurz antraben, abrupt und kontrolliert abstoppen, dann sofort wieder explosiv beschleunigen",
    type: "reps",
    reps: "6 Wiederholungen",
    icon: Zap,
    questions: [
      { q: "Warum wird das Abbremsen im Training oft vernachl\xE4ssigt?", options: ["Weil der Fokus meist nur auf Beschleunigung liegt", "Weil Abbremsen unwichtig ist", "Weil es zu einfach ist"], correct: 0, explanation: "Viele Trainingsprogramme fokussieren nur aufs Schnellerwerden und vergessen das kontrollierte Abbremsen." },
      { q: "Was passiert bei schlechter Bremstechnik?", options: ["Erh\xF6htes Verletzungsrisiko f\xFCr Knie und Sprunggelenk", "Man wird automatisch schneller", "Nichts Besonderes"], correct: 0, explanation: "Unkontrolliertes Abbremsen belastet Knie und Sprunggelenk stark." },
      { q: "Wie landest du beim Abbremsen am besten?", options: ["Mit leicht gebeugten Knien, Gewicht \xFCber dem Fu\xDF", "Mit durchgestreckten Beinen", "Auf den Zehenspitzen mit steifen Knien"], correct: 0, explanation: "Gebeugte Knie und ein zentrierter K\xF6rperschwerpunkt erm\xF6glichen ein sicheres, kontrolliertes Abbremsen." }
    ]
  },
  {
    id: "sp15",
    group: "speed",
    name: "Seitliche Sprints (Lateral Shuffle)",
    desc: "In tiefer Grundstellung seitlich schnelle, kleine Schritte machen, dann in einen kurzen Sprint \xFCbergehen",
    type: "reps",
    reps: "6 x 10m",
    icon: ArrowUpDown,
    questions: [
      { q: "In welcher Grundposition machst du den Lateral Shuffle?", options: ["Tief, mit gebeugten Knien und tiefem Schwerpunkt", "Aufrecht mit gestreckten Beinen", "Auf einem Bein"], correct: 0, explanation: "Eine tiefe Position erm\xF6glicht schnelle, kontrollierte seitliche Schritte." },
      { q: "Warum ist diese \xDCbung f\xFCr einen Torwart wichtig?", options: ["F\xFCr schnelle seitliche Bewegung entlang der Torlinie", "Nur f\xFCr Au\xDFenverteidiger relevant", "Spielt keine Rolle im Tor"], correct: 0, explanation: "Seitliche Schnelligkeit ist f\xFCr Torh\xFCter bei Flanken und Distanzsch\xFCssen entscheidend." },
      { q: "Was passiert bei der \xDCbergabe von Shuffle zu Sprint?", options: ["Der K\xF6rper dreht sich in Laufrichtung und beschleunigt", "Man bleibt seitlich stehen", "Man stoppt komplett ab"], correct: 0, explanation: "Die \xDCbergabe simuliert die reale Spielsituation, in der seitliche Bewegung in einen Sprint \xFCbergeht." }
    ]
  },
  {
    id: "sp16",
    group: "speed",
    name: "R\xFCckw\xE4rts-Sprint zu Vorw\xE4rts",
    desc: "R\xFCckw\xE4rts laufen, auf Kommando drehen und explosiv vorw\xE4rts sprinten",
    type: "reps",
    reps: "6 Wiederholungen",
    icon: RotateCcw,
    questions: [
      { q: "Wann braucht ein Torwart diese F\xE4higkeit im Spiel?", options: ["Beim Zur\xFCcklaufen bei hohen B\xE4llen und schnellem Umschalten", "Nie im echten Spiel", "Nur beim Aufw\xE4rmen"], correct: 0, explanation: "Torh\xFCter m\xFCssen oft r\xFCckw\xE4rts positionieren und dann blitzschnell vorw\xE4rts reagieren." },
      { q: "Was ist die gr\xF6\xDFte Herausforderung bei dieser \xDCbung?", options: ["Die schnelle und saubere Drehung ohne Zeitverlust", "Das R\xFCckw\xE4rtslaufen selbst", "Das Stehenbleiben"], correct: 0, explanation: "Die Drehung ist der kritische Moment, in dem am meisten Zeit verloren werden kann." },
      { q: "Wie sollte die Drehung ausgef\xFChrt werden?", options: ["Kompakt und schnell \xFCber die H\xFCfte", "Langsam und bedacht", "Mit einem Sprung"], correct: 0, explanation: "Eine kompakte, h\xFCftgef\xFChrte Drehung minimiert den Zeitverlust beim Richtungswechsel." }
    ]
  },
  {
    id: "sp17",
    group: "speed",
    name: "Sprint mit 45\xB0-Cut",
    desc: "Kurzer Sprint geradeaus, dann im 45-Grad-Winkel scharf abbiegen und weitersprinten",
    type: "reps",
    reps: "6 pro Seite",
    icon: ArrowUpDown,
    questions: [
      { q: "Was ist beim 45\xB0-Cut technisch entscheidend?", options: ["Der K\xF6rperschwerpunkt senkt sich kurz vor der Richtungs\xE4nderung", "Der Oberk\xF6rper bleibt komplett aufrecht", "Man springt bei der Wende hoch"], correct: 0, explanation: "Ein abgesenkter Schwerpunkt erm\xF6glicht eine stabile, schnelle Richtungs\xE4nderung." },
      { q: "Warum ist der 45\xB0-Winkel realistischer als 90\xB0?", options: ["Weil im Spiel viele Richtungswechsel nicht exakt rechtwinklig sind", "Weil er einfacher ist", "Er ist nicht realistischer"], correct: 0, explanation: "Spielsituationen erfordern oft variable Winkel \u2013 45\xB0 trainiert diese Vielseitigkeit." },
      { q: "Was passiert mit dem \xE4u\xDFeren Fu\xDF bei der Richtungs\xE4nderung?", options: ["Er dr\xFCckt sich aktiv vom Boden ab, um die neue Richtung einzuleiten", "Er bleibt passiv am Boden", "Er wird angehoben und bleibt in der Luft"], correct: 0, explanation: "Der aktive Abdruck des \xE4u\xDFeren Fu\xDFes erzeugt die Kraft f\xFCr die Richtungs\xE4nderung." }
    ]
  },
  {
    id: "sp18",
    group: "speed",
    name: "Sprint-Ausklang",
    desc: "Nach einem Sprint bewusst \xFCber 3-4 Schritte kontrolliert abbremsen statt abrupt zu stoppen",
    type: "reps",
    reps: "5 Wiederholungen",
    icon: Footprints,
    questions: [
      { q: "Warum ist ein kontrollierter Sprint-Ausklang wichtig?", options: ["Er reduziert die Belastung auf Gelenke und Muskulatur", "Er macht keinen Unterschied", "Er verlangsamt das n\xE4chste Training"], correct: 0, explanation: "Ein abruptes Abstoppen belastet Gelenke und Muskeln st\xE4rker als ein kontrolliertes Ausrollen." },
      { q: "\xDCber wie viele Schritte sollte die Verz\xF6gerung erfolgen?", options: ["Ca. 3\u20134 Schritte", "Sofort in einem Schritt", "\xDCber 20 Schritte"], correct: 0, explanation: "3\u20134 Schritte reichen, um die Geschwindigkeit sicher und kontrolliert zu reduzieren." },
      { q: "Was passiert bei wiederholtem abruptem Abstoppen ohne Ausklang?", options: ["Erh\xF6htes Verletzungsrisiko \xFCber die Zeit", "Man wird davon schneller", "Kein Unterschied zu kontrolliertem Abbremsen"], correct: 0, explanation: "Wiederholte harte Stopps summieren sich zu unn\xF6tiger Belastung auf Gelenke und Sehnen." }
    ]
  },
  {
    id: "sp19",
    group: "speed",
    name: "Rollender Start (Rolling Start)",
    desc: "Aus lockerem Gehen oder Traben heraus in einen Sprint beschleunigen, statt aus dem kompletten Stillstand",
    type: "reps",
    reps: "4 x 20m",
    icon: Zap,
    questions: [
      { q: "Was unterscheidet den rollenden Start vom Start aus dem Stand?", options: ["Der K\xF6rper ist bereits in Bewegung, was die Beschleunigung erleichtert", "Es gibt keinen Unterschied", "Der rollende Start ist immer langsamer"], correct: 0, explanation: "Ein K\xF6rper, der sich bereits bewegt, kann leichter weiter beschleunigen als einer im Stillstand." },
      { q: "Wof\xFCr ist der rollende Start im Spiel realistischer?", options: ["Weil Spieler im Spiel selten komplett still stehen, bevor sie sprinten", "Weil er einfacher zu \xFCben ist", "Er ist nicht realistischer"], correct: 0, explanation: "Im echten Spiel bist du fast immer schon in leichter Bewegung, bevor ein Sprint n\xF6tig wird." },
      { q: "Wie sollte das Antraben vor dem Sprint sein?", options: ["Locker und entspannt, nicht schon anstrengend", "So schnell wie m\xF6glich", "R\xFCckw\xE4rts"], correct: 0, explanation: "Ein lockeres Antraben bereitet vor, ohne schon Kraft f\xFCr den eigentlichen Sprint zu verbrauchen." }
    ]
  },
  {
    id: "sp20",
    group: "speed",
    name: "Tempo-Gef\xFChl (Effort-Kontrolle)",
    desc: "Sprints bei bewusst unterschiedlichem Tempo laufen (z.B. 70%, 85%, 100%) und das Gef\xFChl daf\xFCr einsch\xE4tzen lernen",
    type: "reps",
    reps: "3 Sprints je Tempo",
    icon: Timer,
    questions: [
      { q: "Warum ist es wertvoll, verschiedene Tempos bewusst zu sp\xFCren?", options: ["Weil du im Spiel dein Tempo situativ dosieren musst, nicht immer 100% gibst", "Weil langsameres Laufen wichtiger ist als schnelles", "Es hat keinen praktischen Nutzen"], correct: 0, explanation: "Im Spiel brauchst du nicht immer 100% \u2013 das Gef\xFChl f\xFCr dein Tempo hilft, Energie klug einzusetzen." },
      { q: "Was f\xE4llt vielen jungen Sportlern beim Tempo-Gef\xFChl schwer?", options: ["Den Unterschied zwischen 85% und 100% Anstrengung genau einzusch\xE4tzen", "\xDCberhaupt zu laufen", "Stillzustehen"], correct: 0, explanation: "Das feine Gef\xFChl f\xFCr Anstrengungsgrade muss trainiert werden wie jede andere F\xE4higkeit." },
      { q: "Wie hilft dieses Training langfristig?", options: ["Es verbessert die Selbsteinsch\xE4tzung und Energieeinteilung im Spiel", "Es macht dich automatisch zum schnellsten Spieler", "Es hat keinen Bezug zum echten Spiel"], correct: 0, explanation: "Ein gutes Tempogef\xFChl hilft, die Kr\xE4fte \xFCber ein ganzes Spiel klug einzuteilen." }
    ]
  },
  // DEHNEN
  {
    id: "de1",
    group: "dehnen",
    name: "H\xFCft\xF6ffner",
    desc: "Dynamische Beinschw\xFCnge vor/zur\xFCck und seitlich",
    type: "reps",
    reps: "12 pro Bein",
    icon: Waves,
    questions: [
      { q: "Wie f\xFChrst du dynamische Beinschw\xFCnge richtig aus?", options: ["Ruckartig mit maximalem Schwung", "Kontrolliert im vollen, schmerzfreien Bewegungsradius", "Nur minimal bewegen"], correct: 1, explanation: "Kontrolle statt Schwung \u2013 so bereitest du die H\xFCfte sicher vor." },
      { q: "Wann macht man diese \xDCbung am besten?", options: ["Als Aufw\xE4rmen vor dem Training", "Nur nach dem Training", "Direkt vor dem Schlafengehen"], correct: 0, explanation: "Dynamisches Dehnen eignet sich super zum Aufw\xE4rmen." },
      { q: "Was, wenn du dabei kurz die Balance verlierst?", options: ["Kein Problem, kurz abst\xFCtzen und weitermachen", "\xDCbung komplett falsch", "Sofort aufh\xF6ren"], correct: 0, explanation: "Kurzes Abst\xFCtzen ist okay \u2013 mit der Zeit wird die Balance automatisch besser." },
      { q: "Was verbessert regelm\xE4\xDFige H\xFCftmobilisation?", options: ["Beweglichkeit und Verletzungsvorbeugung", "Nur die Optik", "Die Reaktionszeit"], correct: 0, explanation: "Eine bewegliche H\xFCfte sch\xFCtzt vor Zerrungen und verbessert die Schrittl\xE4nge." },
      { q: "Wie viele Wiederholungen sind sinnvoll?", options: ["1\u20132", "Ca. 12 pro Bein", "100"], correct: 1, explanation: "12 kontrollierte Wiederholungen pro Bein reichen zur Mobilisation." }
    ]
  },
  {
    id: "de2",
    group: "dehnen",
    name: "Wadendehnung",
    desc: "Im Ausfallschritt Ferse am Boden, 30 Sek. halten",
    type: "time",
    seconds: 30,
    icon: Move,
    questions: [
      { q: "Worauf achtest du bei der Wadendehnung?", options: ["Ferse bleibt am Boden, Bein bleibt gestreckt", "Auf Zehenspitzen wippen", "Knie einknicken lassen"], correct: 0, explanation: "Nur mit Ferse am Boden und gestrecktem Bein wird die Wade wirklich gedehnt." },
      { q: "Wie lange h\xE4ltst du die Dehnung?", options: ["5 Sekunden", "Ca. 30 Sekunden, ruhig atmend", "5 Minuten"], correct: 1, explanation: "30 Sekunden reichen, um die Muskulatur sp\xFCrbar zu entspannen." },
      { q: "Was ist der Sinn dieser \xDCbung nach dem Training?", options: ["Regeneration und Vorbeugung von Verk\xFCrzungen", "Krafttraining", "Schnelligkeit trainieren"], correct: 0, explanation: "Nach der Belastung hilft Dehnen der Regeneration." },
      { q: "Warum ist die Wade f\xFCr einen Torwart wichtig?", options: ["F\xFCr Absprungkraft und Landung", "F\xFCr den Torwurf", "Spielt keine Rolle"], correct: 0, explanation: "Eine bewegliche, gesunde Wade ist wichtig f\xFCr Spr\xFCnge und weiche Landungen." },
      { q: "Was solltest du beim Dehnen vermeiden?", options: ["Ruhig atmen", "Wippen und ruckartige Bewegungen", "Langsam reingehen"], correct: 1, explanation: "Wippen erh\xF6ht das Verletzungsrisiko \u2013 lieber sanft und kontrolliert dehnen." }
    ]
  },
  {
    id: "de3",
    group: "dehnen",
    name: "Oberschenkel-Dehnung",
    desc: "Im Stand Fu\xDF zum Po ziehen, Knie eng halten",
    type: "time",
    seconds: 30,
    icon: Eye,
    questions: [
      { q: "Wie h\xE4ltst du die Balance dabei am besten?", options: ["Blick nach unten", "Fester Blickpunkt nach vorne, Knie eng zusammen", "Beide Augen schlie\xDFen"], correct: 1, explanation: "Ein fixer Punkt nach vorne stabilisiert automatisch deine Balance." },
      { q: "Welcher Bereich wird hier gedehnt?", options: ["Wadenmuskel", "Oberschenkelvorderseite", "Bizeps"], correct: 1, explanation: "Die Vorderseite des Oberschenkels (Quadrizeps) wird hier gedehnt." },
      { q: "Was tust du, wenn du dabei Schmerzen sp\xFCrst?", options: ["Weiter durchziehen", "Dehnung sofort etwas lockern", "Ignorieren"], correct: 1, explanation: "Dehnen soll ziehen, aber nie wehtun \u2013 lieber etwas lockerer halten." },
      { q: "Was passiert bei einer verk\xFCrzten Oberschenkelmuskulatur?", options: ["Nichts Besonderes", "Erh\xF6htes Verletzungsrisiko und eingeschr\xE4nkte Beweglichkeit", "Man wird automatisch schneller"], correct: 1, explanation: "Verk\xFCrzte Muskeln erh\xF6hen das Risiko f\xFCr Zerrungen." },
      { q: "Wie oft pro Woche solltest du dehnen?", options: ["Nie", "Regelm\xE4\xDFig, am besten nach dem Training", "Nur vor Wettk\xE4mpfen"], correct: 1, explanation: "Regelm\xE4\xDFiges Dehnen nach dem Training unterst\xFCtzt die Regeneration am besten." }
    ]
  },
  {
    id: "de4",
    group: "dehnen",
    name: "Katze-Kuh Mobilisation",
    desc: "Vierf\xFC\xDFlerstand, R\xFCcken abwechselnd rund & hohl machen",
    type: "reps",
    reps: "10 Wiederholungen",
    icon: Activity,
    questions: [
      { q: "Was passiert bei dieser \xDCbung?", options: ["Nur der Kopf bewegt sich", "Die Wirbels\xE4ule bewegt sich Wirbel f\xFCr Wirbel", "Nur die Arme arbeiten"], correct: 1, explanation: "Die Bewegung kommt aus der ganzen Wirbels\xE4ule." },
      { q: "Wof\xFCr ist diese \xDCbung gut?", options: ["Mobilisation des R\xFCckens", "Maximalkraft im R\xFCcken", "Sprintschnelligkeit"], correct: 0, explanation: "Sie lockert und mobilisiert die Wirbels\xE4ule \u2013 gut vor und nach dem Training." },
      { q: "In welcher Ausgangsposition machst du die \xDCbung?", options: ["Im Stehen", "Im Vierf\xFC\xDFlerstand (H\xE4nde und Knie am Boden)", "Im Liegen auf dem R\xFCcken"], correct: 1, explanation: "Der Vierf\xFC\xDFlerstand erm\xF6glicht die volle Bewegung der Wirbels\xE4ule." },
      { q: "Was ist der Vorteil eines beweglichen R\xFCckens f\xFCr einen Torwart?", options: ["Bessere Reichweite bei Paraden", "Spielt keine Rolle", "Nur f\xFCr die Haltung"], correct: 0, explanation: "Ein beweglicher R\xFCcken hilft bei weiten Streckungen nach B\xE4llen." },
      { q: "Wie schnell f\xFChrst du die Bewegung aus?", options: ["Ruckartig und schnell", "Langsam und kontrolliert", "Egal, Hauptsache oft"], correct: 1, explanation: "Langsame, kontrollierte Bewegung mobilisiert die Wirbels\xE4ule am effektivsten." }
    ]
  },
  {
    id: "de5",
    group: "dehnen",
    name: "Adduktoren-Dehnung (Leiste)",
    desc: "Breiter Stand, Gewicht seitlich auf ein gebeugtes Bein verlagern, anderes Bein bleibt gestreckt \u2013 dehnt die Beininnenseite",
    type: "time",
    seconds: 30,
    icon: Move,
    questions: [
      { q: "Welcher Muskelbereich wird hier gedehnt?", options: ["Die Innenseite des Oberschenkels (Adduktoren)", "Der Bizeps", "Die Wade"], correct: 0, explanation: "Die Adduktoren an der Beininnenseite werden bei dieser seitlichen Dehnung beansprucht." },
      { q: "Warum sind bewegliche Adduktoren f\xFCr einen Torwart wichtig?", options: ["F\xFCr weite seitliche Spr\xFCnge und Gr\xE4tschen", "Spielt keine Rolle", "Nur f\xFCr L\xE4ufer wichtig"], correct: 0, explanation: "Verk\xFCrzte Adduktoren schr\xE4nken die seitliche Beweglichkeit ein \u2013 genau die brauchst du f\xFCr Paraden zur Seite." },
      { q: "Wie h\xE4ltst du die Dehnung am besten?", options: ["Ruhig und kontrolliert, ohne Wippen", "Mit kr\xE4ftigem Wippen", "So schnell wie m\xF6glich"], correct: 0, explanation: "Ruhiges, kontrolliertes Dehnen ohne Wippen ist sicherer und effektiver." }
    ]
  },
  {
    id: "de6",
    group: "dehnen",
    name: "Ausfallschritt mit Rotation",
    desc: "Tiefer Ausfallschritt nach vorne, dann Oberk\xF6rper zur Seite des vorderen Beins rotieren \u2013 kombiniert H\xFCft- und Rumpfmobilisation",
    type: "reps",
    reps: "8 pro Seite",
    icon: RotateCcw,
    questions: [
      { q: "Was wird bei dieser \xDCbung zus\xE4tzlich zur H\xFCfte mobilisiert?", options: ["Der Rumpf/die Wirbels\xE4ule durch die Rotation", "Nur die Arme", "Der Nacken"], correct: 0, explanation: "Die Rotation des Oberk\xF6rpers mobilisiert zus\xE4tzlich die Brustwirbels\xE4ule." },
      { q: "Worauf achtest du beim vorderen Knie?", options: ["Es darf nicht \xFCber die Fu\xDFspitze hinausragen", "Es soll weit nach innen fallen", "Spielt keine Rolle"], correct: 0, explanation: "Ein Knie, das \xFCber die Fu\xDFspitze hinausragt, belastet das Gelenk unn\xF6tig." },
      { q: "Wann im Training macht diese dynamische \xDCbung am meisten Sinn?", options: ["Im Warm-up vor der Belastung", "Erst am Abend vorm Schlafen", "Nur nach Verletzungen"], correct: 0, explanation: "Dynamische Mobilisation geh\xF6rt ins Warm-up, um H\xFCfte und Rumpf auf die Belastung vorzubereiten." }
    ]
  },
  {
    id: "de7",
    group: "dehnen",
    name: "Beinpendel seitlich",
    desc: "Im Stand ein Bein locker seitlich vor dem K\xF6rper hin und her schwingen lassen \u2013 mobilisiert H\xFCfte und Adduktoren dynamisch",
    type: "reps",
    reps: "12 pro Bein",
    icon: ArrowUpDown,
    questions: [
      { q: "Was unterscheidet das seitliche Beinpendel vom Beinschwung nach vorne/hinten?", options: ["Es mobilisiert die H\xFCfte in der seitlichen statt der vorderen Ebene", "Es ist komplett identisch", "Es trainiert nur die Wade"], correct: 0, explanation: "Seitliche Bewegungen brauchen seitliche H\xFCftbeweglichkeit \u2013 genau die trainiert dieses Pendel." },
      { q: "Wie hoch sollte das Bein beim Pendeln kommen?", options: ["So hoch wie kontrolliert m\xF6glich, ohne den R\xFCcken zu w\xF6lben", "Immer bis \xFCber den Kopf", "Gar nicht anheben"], correct: 0, explanation: "Kontrolle geht vor H\xF6he \u2013 eine saubere Bewegung bringt mehr als ein erzwungen hohes Bein." },
      { q: "Warum ist diese \xDCbung f\xFCr schnelle Richtungswechsel im Tor wichtig?", options: ["Weil eine bewegliche H\xFCfte seitliche Bewegungen erleichtert", "Spielt f\xFCr Richtungswechsel keine Rolle", "Nur f\xFCr Langstreckenl\xE4ufer wichtig"], correct: 0, explanation: "Eine bewegliche H\xFCfte in der Seitw\xE4rts-Ebene hilft dir bei schnellen seitlichen Paraden." }
    ]
  },
  {
    id: "de8",
    group: "dehnen",
    name: "Schulter- & Brustdehnung",
    desc: "Einen Arm quer vor die Brust ziehen und mit dem anderen Arm sanft heranziehen \u2013 dehnt Schulter und oberen R\xFCcken",
    type: "time",
    seconds: 30,
    icon: Move,
    questions: [
      { q: "Warum sind Schulterdehnungen f\xFCr einen Torwart besonders wichtig?", options: ["Wegen des vielen Werfens und Abst\xFCtzens bei Paraden", "Spielt f\xFCr Torh\xFCter keine Rolle", "Nur f\xFCr Handballer wichtig"], correct: 0, explanation: "W\xFCrfe, Abst\xFCtzen und Fallen belasten die Schulter stark \u2013 Beweglichkeit hier beugt Verletzungen vor." },
      { q: "Welchen Bereich dehnt diese \xDCbung zus\xE4tzlich zur Schulter?", options: ["Den oberen R\xFCcken", "Die Wade", "Den Oberschenkel"], correct: 0, explanation: "Die Bewegung dehnt auch die Muskulatur zwischen den Schulterbl\xE4ttern." },
      { q: "Wie stark solltest du ziehen?", options: ["Sanft, bis ein leichtes Ziehen sp\xFCrbar ist", "So fest wie m\xF6glich", "Gar nicht ziehen"], correct: 0, explanation: "Sanftes Ziehen reicht \u2013 bei Schmerzen sofort lockern." }
    ]
  },
  {
    id: "de9",
    group: "dehnen",
    name: "Sprunggelenks-Mobilisation",
    desc: "Im Stand oder Sitzen den Fu\xDF in gro\xDFen, langsamen Kreisen bewegen \u2013 beide Richtungen",
    type: "reps",
    reps: "10 pro Richtung/Fu\xDF",
    icon: RotateCcw,
    questions: [
      { q: "Warum ist ein bewegliches Sprunggelenk f\xFCr einen Torwart wichtig?", options: ["F\xFCr stabile Landungen und schnelle Richtungswechsel", "Spielt keine Rolle", "Nur f\xFCr L\xE4ufer wichtig"], correct: 0, explanation: "Ein bewegliches Sprunggelenk hilft, Landungen und pl\xF6tzliche Richtungswechsel sicher abzufangen." },
      { q: "In welche Richtungen kreist du den Fu\xDF?", options: ["Nur im Uhrzeigersinn", "In beide Richtungen", "Nur nach innen"], correct: 1, explanation: "Beide Richtungen sorgen f\xFCr eine gleichm\xE4\xDFige Mobilisation des gesamten Gelenks." },
      { q: "Was kann ein steifes Sprunggelenk beg\xFCnstigen?", options: ["Ein h\xF6heres Verletzungsrisiko beim Umknicken", "Bessere Sprintzeiten", "Nichts Besonderes"], correct: 0, explanation: "Ein steifes Sprunggelenk kann das Risiko f\xFCr Umknicken bei schnellen Bewegungen erh\xF6hen." }
    ]
  },
  {
    id: "de10",
    group: "dehnen",
    name: "R\xFCckenlage Rumpfrotation",
    desc: "Auf dem R\xFCcken liegend Knie gebeugt zur Seite ablegen, Arme liegen in T-Position \u2013 Schultern bleiben am Boden",
    type: "time",
    seconds: 30,
    icon: Waves,
    questions: [
      { q: "Was bleibt bei dieser \xDCbung m\xF6glichst am Boden?", options: ["Die Schultern", "Die Knie", "Die F\xFC\xDFe"], correct: 0, explanation: "Die Schultern am Boden zu lassen sorgt f\xFCr die richtige Rotation in der Wirbels\xE4ule statt im Schultergelenk." },
      { q: "Wann eignet sich diese \xDCbung besonders gut?", options: ["Als Cool-down nach dem Training", "Direkt vor dem Sprint", "Nur morgens"], correct: 0, explanation: "Als ruhige, statische Dehnung passt sie super zum Abschluss einer Einheit." },
      { q: "Was wird bei dieser \xDCbung haupts\xE4chlich gedehnt?", options: ["Die seitliche Rumpfmuskulatur und der untere R\xFCcken", "Die Wade", "Der Bizeps"], correct: 0, explanation: "Die Rotation dehnt seitliche Rumpfmuskulatur und entspannt den unteren R\xFCcken." }
    ]
  },
  {
    id: "de11",
    group: "dehnen",
    name: "Hamstring-Dehnung (Sitz)",
    desc: "Im Sitzen ein Bein gestreckt ausstrecken, mit geradem R\xFCcken langsam nach vorne zum Fu\xDF beugen",
    type: "time",
    seconds: 30,
    icon: Move,
    questions: [
      { q: "Welcher Muskel wird bei dieser \xDCbung gedehnt?", options: ["Die R\xFCckseite des Oberschenkels (Hamstrings)", "Die Bauchmuskeln", "Der Trizeps"], correct: 0, explanation: "Die Hamstrings an der Oberschenkelr\xFCckseite werden hier gedehnt." },
      { q: "Wie sollte dein R\xFCcken dabei bleiben?", options: ["M\xF6glichst gerade, aus der H\xFCfte beugen", "Stark rund gekr\xFCmmt", "Komplett steif und starr"], correct: 0, explanation: "Ein gerader R\xFCcken sch\xFCtzt die Wirbels\xE4ule \u2013 die Bewegung kommt aus der H\xFCfte." },
      { q: "Warum sind bewegliche Hamstrings f\xFCr Sprints wichtig?", options: ["Verk\xFCrzte Hamstrings erh\xF6hen das Zerrungsrisiko bei Sprints", "Spielt keine Rolle", "Nur f\xFCr Langstreckenl\xE4ufer wichtig"], correct: 0, explanation: "Die Hamstrings sind bei Sprints stark gefordert \u2013 Beweglichkeit senkt das Verletzungsrisiko." }
    ]
  },
  {
    id: "de12",
    group: "dehnen",
    name: "Ges\xE4\xDF-Dehnung (Figure-4)",
    desc: "Im Sitzen oder Liegen einen Kn\xF6chel auf das andere Knie legen und das untere Bein zur Brust ziehen",
    type: "time",
    seconds: 30,
    icon: Waves,
    questions: [
      { q: "Welcher Bereich wird beim Figure-4-Stretch gedehnt?", options: ["Das Ges\xE4\xDF und die \xE4u\xDFere H\xFCfte", "Der Bizeps", "Die Wade"], correct: 0, explanation: "Diese Position dehnt gezielt die Ges\xE4\xDFmuskulatur und die \xE4u\xDFere H\xFCfte." },
      { q: "Warum ist eine bewegliche H\xFCfte f\xFCr einen Torwart wichtig?", options: ["F\xFCr eine gr\xF6\xDFere Reichweite bei Spr\xFCngen zur Seite", "Spielt keine Rolle", "Nur f\xFCr Sprinter wichtig"], correct: 0, explanation: "Eine bewegliche H\xFCfte erlaubt weitere und schnellere Bewegungen zur Seite." },
      { q: "Wie f\xFChlt sich die Dehnung normalerweise an?", options: ["Ein Ziehen im Ges\xE4\xDF/der \xE4u\xDFeren H\xFCfte", "Schmerzen im Knie", "Gar nichts"], correct: 0, explanation: "Ein sp\xFCrbares, aber schmerzfreies Ziehen im Ges\xE4\xDFbereich zeigt, dass die \xDCbung richtig wirkt." }
    ]
  },
  {
    id: "de13",
    group: "dehnen",
    name: "Nackendehnung seitlich",
    desc: "Kopf sanft zur einen Schulter neigen, mit der Hand leicht nachhelfen, Schulter bleibt unten",
    type: "time",
    seconds: 20,
    icon: Move,
    questions: [
      { q: "Warum ist Nackenbeweglichkeit f\xFCr einen Torwart hilfreich?", options: ["F\xFCr besseren Rundumblick und weniger Verspannung", "Spielt keine Rolle", "Nur f\xFCr Schwimmer wichtig"], correct: 0, explanation: "Ein beweglicher Nacken hilft beim schnellen Blickwechsel und beugt Verspannungen vor." },
      { q: "Wie stark solltest du beim Nacken nachhelfen?", options: ["Nur sehr sanft mit der Hand", "Mit viel Kraft ziehen", "Gar nicht ber\xFChren"], correct: 0, explanation: "Der Nacken ist empfindlich \u2013 immer nur sanft und ohne Ruck dehnen." },
      { q: "Was bleibt bei der Nackendehnung unten?", options: ["Die Schulter auf der gedehnten Seite", "Der Kopf", "Die H\xFCfte"], correct: 0, explanation: "Die Schulter unten zu lassen sorgt daf\xFCr, dass wirklich der Nacken gedehnt wird." }
    ]
  },
  {
    id: "de14",
    group: "dehnen",
    name: "Handgelenk-Dehnung",
    desc: "Einen Arm nach vorne strecken, Handfl\xE4che nach oben, mit der anderen Hand die Finger sanft nach unten ziehen",
    type: "time",
    seconds: 20,
    icon: Move,
    questions: [
      { q: "Warum ist Handgelenksbeweglichkeit f\xFCr einen Torwart wichtig?", options: ["Wegen des h\xE4ufigen Fangens und Abst\xFCtzens", "Spielt keine Rolle", "Nur f\xFCr Tennisspieler wichtig"], correct: 0, explanation: "Fangen, Abst\xFCtzen und Fallen belasten die Handgelenke stark." },
      { q: "Wie ziehst du die Finger bei dieser Dehnung?", options: ["Sanft nach unten/hinten mit der anderen Hand", "Mit voller Kraft nach hinten rei\xDFen", "Gar nicht bewegen"], correct: 0, explanation: "Sanftes, kontrolliertes Ziehen reicht v\xF6llig aus." },
      { q: "Was kannst du zus\xE4tzlich variieren?", options: ["Die Handfl\xE4che auch nach unten drehen f\xFCr die Gegenseite", "Immer nur eine Richtung dehnen", "Die \xDCbung braucht keine Variation"], correct: 0, explanation: "Handfl\xE4che nach oben und unten dehnt unterschiedliche Muskeln im Unterarm." }
    ]
  },
  {
    id: "de15",
    group: "dehnen",
    name: "Trizeps-Dehnung",
    desc: "Einen Arm gebeugt hinter den Kopf f\xFChren, mit der anderen Hand am Ellbogen sanft nach unten ziehen",
    type: "time",
    seconds: 20,
    icon: Move,
    questions: [
      { q: "Welcher Muskel wird hier gedehnt?", options: ["Der Trizeps an der Oberarmr\xFCckseite", "Der Quadrizeps", "Die Wade"], correct: 0, explanation: "Der Trizeps an der R\xFCckseite des Oberarms wird bei dieser \xDCbung gedehnt." },
      { q: "Warum ist das f\xFCr einen Torwart n\xFCtzlich?", options: ["F\xFCr bewegliche Arme beim Werfen und Abst\xFCtzen", "Spielt keine Rolle", "Nur f\xFCr Kraftsportler wichtig"], correct: 0, explanation: "Bewegliche Arme helfen beim weiten Werfen und sicheren Abst\xFCtzen." },
      { q: "Wie ziehst du am Ellbogen?", options: ["Sanft nach unten, bis ein leichtes Ziehen sp\xFCrbar ist", "So fest wie m\xF6glich", "Gar nicht anfassen"], correct: 0, explanation: "Sanftes Ziehen reicht \u2013 der Trizeps ist ein empfindlicher Muskel." }
    ]
  },
  {
    id: "de16",
    group: "dehnen",
    name: "Brustkorb-\xD6ffner",
    desc: "Beide Arme seitlich auf Schulterh\xF6he nach hinten \xF6ffnen, Brust rausstrecken, Schulterbl\xE4tter zusammenziehen",
    type: "time",
    seconds: 20,
    icon: Waves,
    questions: [
      { q: "Was passiert mit den Schulterbl\xE4ttern bei dieser \xDCbung?", options: ["Sie werden zusammengezogen", "Sie werden auseinandergezogen", "Sie bleiben unbeteiligt"], correct: 0, explanation: "Das Zusammenziehen der Schulterbl\xE4tter \xF6ffnet Brust und vordere Schulter." },
      { q: "Wof\xFCr ist diese \xDCbung besonders gut, wenn man viel sitzt?", options: ["Gegen die typische Rundr\xFCcken-Haltung", "F\xFCr mehr Beinkraft", "F\xFCr schnellere Sprints"], correct: 0, explanation: "Viel Sitzen f\xFChrt oft zu einer nach vorne gebeugten Haltung \u2013 diese \xDCbung wirkt dem entgegen." },
      { q: "Wie tief atmest du dabei am besten?", options: ["Tief und bewusst in den Brustkorb", "Luft anhalten", "Ganz flach atmen"], correct: 0, explanation: "Tiefes Atmen unterst\xFCtzt die \xD6ffnung des Brustkorbs zus\xE4tzlich." }
    ]
  },
  {
    id: "de17",
    group: "dehnen",
    name: "Seitliche Rumpfdehnung",
    desc: "Im Stand einen Arm \xFCber den Kopf strecken und den Oberk\xF6rper zur Gegenseite neigen",
    type: "time",
    seconds: 20,
    icon: Move,
    questions: [
      { q: "Welcher Bereich wird bei der seitlichen Rumpfdehnung gedehnt?", options: ["Die seitliche Rumpfmuskulatur (schr\xE4ge Bauchmuskeln)", "Der Bizeps", "Die Wade"], correct: 0, explanation: "Die seitliche Neigung dehnt die schr\xE4gen Bauchmuskeln und die seitliche R\xFCckenmuskulatur." },
      { q: "Wie sollte sich die Bewegung anf\xFChlen?", options: ["Ein sanftes Ziehen an der gedehnten Seite", "Schmerzhaft", "Gar nichts sp\xFCren"], correct: 0, explanation: "Ein sanftes Ziehen zeigt die richtige Intensit\xE4t \u2013 Schmerz ist ein Warnsignal." },
      { q: "Warum ist ein beweglicher seitlicher Rumpf f\xFCr einen Torwart wichtig?", options: ["F\xFCr weite seitliche Reichweite bei Paraden", "Spielt keine Rolle", "Nur f\xFCr Kraftsportler"], correct: 0, explanation: "Ein beweglicher Rumpf verl\xE4ngert deine Reichweite bei Spr\xFCngen zur Seite." }
    ]
  },
  {
    id: "de18",
    group: "dehnen",
    name: "Beinschwung vor/zur\xFCck",
    desc: "Im Stand ein Bein locker nach vorne und hinten schwingen lassen, Oberk\xF6rper bleibt stabil",
    type: "reps",
    reps: "12 pro Bein",
    icon: ArrowUpDown,
    questions: [
      { q: "Was trainiert diese \xDCbung im Unterschied zum seitlichen Beinpendel?", options: ["Die Beweglichkeit in der vorderen/hinteren Bewegungsrichtung", "Nichts anderes", "Nur die Wade"], correct: 0, explanation: "Vor-/Zur\xFCck-Schw\xFCnge trainieren eine andere Bewegungsebene der H\xFCfte als seitliche Schw\xFCnge." },
      { q: "Wie bleibt der Oberk\xF6rper dabei?", options: ["Stabil und aufrecht", "Wild mitschwingend", "Nach vorne gebeugt"], correct: 0, explanation: "Ein stabiler Oberk\xF6rper sorgt daf\xFCr, dass die Bewegung wirklich aus der H\xFCfte kommt." },
      { q: "Wann im Training passt diese dynamische \xDCbung am besten?", options: ["Ins Warm-up vor der Belastung", "Nur als Cool-down", "Gar nicht ins Training"], correct: 0, explanation: "Dynamische Beinschw\xFCnge geh\xF6ren klassischerweise ins Warm-up." }
    ]
  },
  {
    id: "de19",
    group: "dehnen",
    name: "Tiefer Ausfallschritt mit Armen hoch",
    desc: "Tiefer Ausfallschritt nach vorne, beide Arme dabei \xFCber den Kopf strecken \u2013 dehnt H\xFCftbeuger und seitlichen Rumpf gleichzeitig",
    type: "reps",
    reps: "6 pro Seite",
    icon: Zap,
    questions: [
      { q: "Welche zwei Bereiche werden hier gleichzeitig gedehnt?", options: ["H\xFCftbeuger und seitlicher Rumpf", "Nur die Wade", "Nur der Nacken"], correct: 0, explanation: "Der tiefe Ausfallschritt dehnt den H\xFCftbeuger, die gestreckten Arme zus\xE4tzlich den seitlichen Rumpf." },
      { q: "Warum ist ein beweglicher H\xFCftbeuger wichtig?", options: ["F\xFCr eine gr\xF6\xDFere Schrittl\xE4nge und weniger R\xFCckenprobleme", "Spielt keine Rolle", "Nur f\xFCr Schwimmer wichtig"], correct: 0, explanation: "Ein verk\xFCrzter H\xFCftbeuger schr\xE4nkt die Schrittl\xE4nge ein und kann den unteren R\xFCcken belasten." },
      { q: "Was ist bei dieser \xDCbung besonders?", options: ["Sie kombiniert Bein- und Oberk\xF6rperdehnung in einer Bewegung", "Sie dehnt nur die Arme", "Sie ist rein statisch"], correct: 0, explanation: "Diese kombinierte \xDCbung spart Zeit, weil sie mehrere Bereiche gleichzeitig anspricht." }
    ]
  },
  {
    id: "de20",
    group: "dehnen",
    name: "Inchworm",
    desc: "Im Stand mit den H\xE4nden zum Boden gehen, dann die H\xE4nde nach vorne 'laufen' bis zur Liegest\xFCtz-Position, danach zur\xFCck",
    type: "reps",
    reps: "5 Wiederholungen",
    icon: Activity,
    questions: [
      { q: "Welche Muskelkette wird beim Inchworm haupts\xE4chlich gedehnt?", options: ["Die gesamte R\xFCckseite des K\xF6rpers (Hamstrings, R\xFCcken, Waden)", "Nur der Bizeps", "Nur der Nacken"], correct: 0, explanation: "Das 'Weglaufen' der H\xE4nde dehnt die komplette hintere Muskelkette, w\xE4hrend der Rumpf aktiv arbeitet." },
      { q: "Was passiert am Ende der Bewegung?", options: ["Du erreichst eine Liegest\xFCtz-/Plank-Position", "Du machst einen Kopfstand", "Du springst hoch"], correct: 0, explanation: "Am Ende der 'Wanderung' bist du in einer stabilen Plank-Position." },
      { q: "Warum wird der Inchworm oft im Warm-up eingesetzt?", options: ["Er kombiniert Dehnung mit Aktivierung von Rumpf und Schultern", "Er ist reine Entspannung", "Er ersetzt das Sprinttraining"], correct: 0, explanation: "Die Bewegung dehnt und aktiviert gleichzeitig \u2013 ideal f\xFCrs Warm-up." }
    ]
  },
  {
    id: "de21",
    group: "dehnen",
    name: "World's Greatest Stretch",
    desc: "Tiefer Ausfallschritt, eine Hand am Boden, die andere Hand zur Decke drehen \u2013 kombiniert H\xFCfte, Rumpf und Schulter in einer Bewegung",
    type: "reps",
    reps: "5 pro Seite",
    icon: RotateCcw,
    questions: [
      { q: "Warum hei\xDFt diese \xDCbung oft 'die beste Dehn\xFCbung der Welt'?", options: ["Weil sie mehrere Bereiche (H\xFCfte, Rumpf, Schulter) in einer Bewegung kombiniert", "Weil sie am l\xE4ngsten dauert", "Weil sie am einfachsten ist"], correct: 0, explanation: "Die Kombination aus Ausfallschritt und Rotation spricht viele Bereiche gleichzeitig an \u2013 daher der Name." },
      { q: "Wohin dreht sich die obere Hand?", options: ["Zur Decke, w\xE4hrend der Blick ihr folgt", "Zum Boden", "Hinter den R\xFCcken"], correct: 0, explanation: "Die Rotation zur Decke mobilisiert zus\xE4tzlich die Brustwirbels\xE4ule." },
      { q: "F\xFCr wen ist diese \xDCbung besonders effizient?", options: ["F\xFCr alle, die wenig Zeit haben und mehrere Bereiche auf einmal mobilisieren wollen", "Nur f\xFCr Anf\xE4nger", "Nur f\xFCr sehr flexible Menschen"], correct: 0, explanation: "Weil sie mehrere Gelenke gleichzeitig mobilisiert, spart sie Zeit im Warm-up." }
    ]
  },
  {
    id: "de22",
    group: "dehnen",
    name: "Frosch-Dehnung",
    desc: "Im Vierf\xFC\xDFlerstand die Knie weit auseinander nehmen, Becken langsam nach hinten schieben \u2013 dehnt die Leiste tief",
    type: "time",
    seconds: 30,
    icon: Waves,
    questions: [
      { q: "Was wird bei der Frosch-Dehnung besonders tief gedehnt?", options: ["Die Leiste/Adduktoren", "Der Nacken", "Der Trizeps"], correct: 0, explanation: "Die weite Kniestellung dehnt die Adduktoren intensiver als die meisten anderen \xDCbungen." },
      { q: "Wie bewegst du dich in die Dehnung hinein?", options: ["Langsam das Becken nach hinten schieben", "Ruckartig nach unten fallen lassen", "Gar nicht bewegen"], correct: 0, explanation: "Ein langsames Hineingleiten ist bei dieser intensiven Dehnung besonders wichtig." },
      { q: "Warum ist diese \xDCbung intensiver als die einfache Adduktoren-Dehnung im Stand?", options: ["Weil beide Beine gleichzeitig und tiefer gedehnt werden", "Sie ist eigentlich weniger intensiv", "Es gibt keinen Unterschied"], correct: 0, explanation: "Die Frosch-Position dehnt beide Seiten gleichzeitig und tiefer." }
    ]
  },
  {
    id: "de23",
    group: "dehnen",
    name: "Knie-zur-Brust",
    desc: "Auf dem R\xFCcken liegend ein Knie mit beiden H\xE4nden zur Brust ziehen, unteres Bein bleibt entspannt",
    type: "time",
    seconds: 25,
    icon: Move,
    questions: [
      { q: "Was wird bei dieser \xDCbung entspannt?", options: ["Der untere R\xFCcken und das Ges\xE4\xDF", "Der Nacken", "Der Bizeps"], correct: 0, explanation: "Das Heranziehen des Knies entlastet und dehnt den unteren R\xFCcken." },
      { q: "Was macht das andere Bein w\xE4hrenddessen?", options: ["Es bleibt entspannt am Boden liegen oder leicht aufgestellt", "Es wird auch hochgezogen", "Es wird gestreckt in die Luft gehoben"], correct: 0, explanation: "Das andere Bein bleibt locker \u2013 nur ein Bein wird gezielt gedehnt." },
      { q: "Wann eignet sich diese \xDCbung besonders gut?", options: ["Als ruhiger Ausklang nach dem Training", "Direkt vor dem Sprint", "Nur im Stehen"], correct: 0, explanation: "Als entspannende \xDCbung passt sie perfekt ans Ende einer Einheit." }
    ]
  },
  {
    id: "de24",
    group: "dehnen",
    name: "Achillessehnen-Dehnung",
    desc: "Wie die Wadendehnung, aber das hintere Knie ist leicht gebeugt \u2013 dehnt die tiefere Wadenmuskulatur/Achillessehne",
    type: "time",
    seconds: 25,
    icon: Move,
    questions: [
      { q: "Was ist der Unterschied zur normalen Wadendehnung?", options: ["Das hintere Knie ist leicht gebeugt statt gestreckt", "Es gibt keinen Unterschied", "Das vordere Bein ist gestreckt"], correct: 0, explanation: "Das gebeugte Knie verlagert die Dehnung von der oberen Wade zur tieferen Wadenmuskulatur/Achillessehne." },
      { q: "Warum ist eine bewegliche Achillessehne f\xFCr einen Torwart wichtig?", options: ["F\xFCr Absprungkraft und weiche Landungen", "Spielt keine Rolle", "Nur f\xFCr L\xE4ufer wichtig"], correct: 0, explanation: "Die Achillessehne ist bei jedem Sprung und jeder Landung stark beansprucht." },
      { q: "Wie lange h\xE4ltst du diese Dehnung?", options: ["Ca. 25\u201330 Sekunden", "Nur 2 Sekunden", "10 Minuten"], correct: 0, explanation: "Wie bei den meisten statischen Dehnungen reichen ca. 25\u201330 Sekunden." }
    ]
  },
  {
    id: "de25",
    group: "dehnen",
    name: "Gro\xDFe Armkreisen",
    desc: "Beide Arme gro\xDF und kontrolliert kreisen lassen, erst vorw\xE4rts, dann r\xFCckw\xE4rts",
    type: "reps",
    reps: "10 pro Richtung",
    icon: RotateCcw,
    questions: [
      { q: "Was trainiert diese dynamische \xDCbung vor allem?", options: ["Die allgemeine Beweglichkeit der Schultern", "Die Beinkraft", "Die Ausdauer"], correct: 0, explanation: "Gro\xDFe Armkreisen mobilisieren das Schultergelenk in seinem vollen Bewegungsradius." },
      { q: "In welche Richtungen kreist du?", options: ["Vorw\xE4rts und r\xFCckw\xE4rts", "Nur vorw\xE4rts", "Nur seitw\xE4rts"], correct: 0, explanation: "Beide Richtungen sorgen f\xFCr eine gleichm\xE4\xDFige Mobilisation der Schulter." },
      { q: "Wie gro\xDF sollten die Kreise sein?", options: ["So gro\xDF wie kontrolliert m\xF6glich", "Ganz klein und schnell", "Beliebig, Hauptsache schnell"], correct: 0, explanation: "Gro\xDFe, kontrollierte Kreise nutzen den vollen Bewegungsradius der Schulter am besten." }
    ]
  },
  // ATHLETIK (bewusst nicht als "Fußballübung" betitelt)
  {
    id: "at1",
    group: "athletik",
    name: "Einbein-Balance",
    desc: "Auf einem Bein stehen, Auge zu, dann Ball hin- und herwerfen lassen",
    type: "time",
    seconds: 30,
    icon: Eye,
    questions: [
      { q: "Was trainiert diese \xDCbung wirklich?", options: ["Nur die Beinmuskulatur", "Gleichgewicht und kleine Stabilisationsmuskeln im Fu\xDFgelenk", "Ausdauer"], correct: 1, explanation: "Kleine, oft unsichtbare Muskeln sch\xFCtzen dich vor Umknicken." },
      { q: "Warum ist Balance f\xFCr einen Torwart wichtig?", options: ["F\xFCr stabile Landungen nach Spr\xFCngen", "Nur f\xFCrs Passspiel", "Spielt keine Rolle"], correct: 0, explanation: "Gute Balance verhindert Verletzungen bei Landungen und schnellen Bewegungen." },
      { q: "Wie machst du die \xDCbung schwerer?", options: ["Augen schlie\xDFen oder nebenbei einen Ball fangen", "Beide Beine benutzen", "Schneller werden"], correct: 0, explanation: "Augen zu oder eine Zusatzaufgabe erh\xF6ht die Anforderung an dein Gleichgewicht." },
      { q: "Was passiert im Gehirn, wenn du dein Gleichgewicht trainierst?", options: ["Nichts", "Nervenbahnen zwischen Fu\xDF, Gleichgewichtssinn und Gehirn werden trainiert", "Nur die Muskeln wachsen"], correct: 1, explanation: "Balance-Training ist auch Nerventraining \u2013 dein Gehirn lernt, schneller zu reagieren." },
      { q: "Wann ist Balance-Training besonders sinnvoll?", options: ["Nach einer Verletzung zur Reha", "Nur f\xFCr Profis", "Nie n\xF6tig"], correct: 0, explanation: "Balance-Training ist ein wichtiger Baustein in der Reha nach Verletzungen wie Umknicken." }
    ]
  },
  {
    id: "at2",
    group: "athletik",
    name: "Plank-Halten",
    desc: "Unterarmst\xFCtz, K\xF6rper gerade halten, ruhig atmen",
    type: "time",
    seconds: 40,
    icon: Shield,
    questions: [
      { q: "Wie sieht eine korrekte Plank-Position aus?", options: ["Po hoch in die Luft", "K\xF6rper bildet eine gerade Linie von Kopf bis Ferse", "R\xFCcken durchh\xE4ngen lassen"], correct: 1, explanation: "Nur eine gerade Linie sch\xFCtzt den R\xFCcken und aktiviert wirklich den Rumpf." },
      { q: "Wie atmest du w\xE4hrend der Plank?", options: ["Luft anhalten", "Ruhig weiteratmen", "Ganz schnell hecheln"], correct: 1, explanation: "Ruhiges Weiteratmen hilft dir, die Spannung l\xE4nger zu halten." },
      { q: "Was trainiert die Plank haupts\xE4chlich?", options: ["Rumpfstabilit\xE4t", "Sprungkraft", "Schnelligkeit"], correct: 0, explanation: "Ein stabiler Rumpf ist die Basis f\xFCr fast jede Bewegung im Tor." },
      { q: "Was solltest du beim Nacken beachten?", options: ["Kopf in neutraler Verl\xE4ngerung der Wirbels\xE4ule halten", "Kopf weit nach hinten strecken", "Kinn auf die Brust dr\xFCcken"], correct: 0, explanation: "Ein neutraler Nacken sch\xFCtzt die Halswirbels\xE4ule." },
      { q: "Wie oft pro Woche solltest du Plank trainieren?", options: ["Nie", "2\u20133x pro Woche reicht f\xFCr sp\xFCrbare Fortschritte", "Jede Stunde"], correct: 1, explanation: "2\u20133x pro Woche mit sauberer Technik reicht v\xF6llig aus." }
    ]
  },
  {
    id: "at3",
    group: "athletik",
    name: "Seitst\xFCtz",
    desc: "Seitliche K\xF6rperspannung, H\xFCfte nicht absacken lassen",
    type: "time",
    seconds: 25,
    icon: Shield,
    questions: [
      { q: "Was ist das Ziel beim Seitst\xFCtz?", options: ["H\xFCfte hochdr\xFCcken und K\xF6rperlinie halten", "H\xFCfte zum Boden absacken lassen", "M\xF6glichst schnell wackeln"], correct: 0, explanation: "Die H\xFCfte oben zu halten trainiert die seitliche Rumpfstabilit\xE4t." },
      { q: "Wof\xFCr brauchst du seitliche Rumpfstabilit\xE4t im Tor?", options: ["F\xFCr Spr\xFCnge zur Seite bei Paraden", "Nur f\xFCrs Laufen", "Gar nicht"], correct: 0, explanation: "Seitliche Stabilit\xE4t hilft bei jedem Hechtsprung zur Ecke." },
      { q: "Wie lange h\xE4ltst du die Position?", options: ["5 Sekunden", "Ca. 20\u201325 Sekunden pro Seite", "2 Minuten"], correct: 1, explanation: "20\u201325 Sekunden mit sauberer Haltung sind effektiver als lange, wackelige Zeit." },
      { q: "Was zeigt dir, dass die \xDCbung richtig sitzt?", options: ["Ziehen in der seitlichen Bauchmuskulatur", "Schmerzen im unteren R\xFCcken", "Gar kein Gef\xFChl"], correct: 0, explanation: "Ein Ziehen in der seitlichen Bauchmuskulatur zeigt, dass die richtigen Muskeln arbeiten." },
      { q: "Was tust du bei Schmerzen im unteren R\xFCcken?", options: ["Weitermachen", "\xDCbung abbrechen und Haltung korrigieren", "Ignorieren"], correct: 1, explanation: "R\xFCckenschmerzen sind ein Zeichen f\xFCr falsche Ausf\xFChrung \u2013 lieber kurz korrigieren." }
    ]
  },
  {
    id: "at4",
    group: "athletik",
    name: "Weiche Landung",
    desc: "Von einer kleinen Erh\xF6hung springen, weich und leise landen, Knie leicht gebeugt",
    type: "reps",
    reps: "10 Spr\xFCnge",
    icon: Footprints,
    questions: [
      { q: "Wie landest du nach einem Sprung richtig?", options: ["Mit durchgestreckten Beinen", "Mit leicht gebeugten Knien, weich und leise", "Auf den Fersen hart aufkommen"], correct: 1, explanation: "Leicht gebeugte Knie federn den Aufprall ab und sch\xFCtzen die Gelenke." },
      { q: "Warum ist eine leise Landung ein gutes Zeichen?", options: ["Sie zeigt, dass der Aufprall gut abgefedert wird", "Sie ist einfach netter f\xFCr die Nachbarn", "Hat keine Bedeutung"], correct: 0, explanation: "Ein lautes Aufkommen zeigt oft, dass zu wenig abgefedert wird." },
      { q: "Was passiert, wenn du mit durchgestreckten Knien landest?", options: ["H\xF6heres Verletzungsrisiko f\xFCr Knie und Gelenke", "Gar nichts", "Du wirst schneller"], correct: 0, explanation: "Ohne D\xE4mpfung durch die Knie geht die Wucht direkt in die Gelenke." },
      { q: "Warum trainierst du weiche Landungen extra?", options: ["Um Knie- und Sprunggelenksverletzungen vorzubeugen", "Nur f\xFCr die Optik", "Spielt keine Rolle"], correct: 0, explanation: "Saubere Landetechnik ist eine der wichtigsten Verletzungspr\xE4vention-\xDCbungen \xFCberhaupt." },
      { q: "Was machen die Arme bei der Landung am besten?", options: ["F\xFCr Balance leicht mitbewegen", "Fest am K\xF6rper anlegen", "Hinter den R\xFCcken"], correct: 0, explanation: "Die Arme helfen dir, die Balance beim Landen zu halten." }
    ]
  },
  {
    id: "at5",
    group: "athletik",
    name: "Abrollen seitlich",
    desc: "Kontrolliertes seitliches Abrollen \xFCber die Schulter, wie eine Rolle",
    type: "reps",
    reps: "6 pro Seite",
    icon: RotateCcw,
    questions: [
      { q: "Worauf achtest du beim seitlichen Abrollen?", options: ["\xDCber die Schulter abrollen, Kinn zur Brust", "Direkt auf den Ellbogen fallen", "Kopf nach hinten strecken"], correct: 0, explanation: "\xDCber die Schulter abzurollen verteilt den Aufprall und sch\xFCtzt Kopf und Gelenke." },
      { q: "Wof\xFCr ist diese \xDCbung eine gute Vorbereitung?", options: ["F\xFCr kontrolliertes Fallen bei St\xFCrzen", "F\xFCr das Kopfballspiel", "F\xFCr Elfmeterschie\xDFen"], correct: 0, explanation: "Eine gute Fallschule sch\xFCtzt dich, wenn du im Spiel unkontrolliert zu Boden gehst." },
      { q: "Was ist der gr\xF6\xDFte Fehler beim Abrollen?", options: ["Zu langsam sein", "Direkt mit Kopf oder Ellbogen aufschlagen", "Zu leise sein"], correct: 1, explanation: "Kopf und Ellbogen sind empfindlich \u2013 die Rolle \xFCber die Schulter vermeidet das." },
      { q: "Was trainiert die Fallschule zus\xE4tzlich zur Sicherheit?", options: ["K\xF6rperwahrnehmung und Mut, sich fallen zu lassen", "Nur die Kraft", "Nichts"], correct: 0, explanation: "Wer wei\xDF, wie man sicher f\xE4llt, geht auch mutiger in Zweik\xE4mpfe und Hechtspr\xFCnge." },
      { q: "Auf welcher Unterlage \xFCbst du das am besten zuerst?", options: ["Auf hartem Beton", "Auf einer weichen Matte oder Rasen", "Auf Kies"], correct: 1, explanation: "Eine weiche Unterlage macht das \xDCben der Technik am Anfang sicherer." }
    ]
  },
  {
    id: "at6",
    group: "athletik",
    name: "Superman Hold (R\xFCckenstrecker)",
    desc: "Bauchlage, Arme und Beine gleichzeitig leicht vom Boden abheben und halten \u2013 kr\xE4ftigt die R\xFCckenstrecker",
    type: "time",
    seconds: 25,
    icon: Waves,
    questions: [
      { q: "Welcher Bereich wird beim Superman Hold gekr\xE4ftigt?", options: ["Die R\xFCckenstrecker entlang der Wirbels\xE4ule", "Der Bizeps", "Die Wade"], correct: 0, explanation: "Die R\xFCckenstrecker halten die Wirbels\xE4ule stabil \u2013 wichtig als Gegenspieler zur Bauchmuskulatur." },
      { q: "Warum ist ein starker R\xFCcken wichtig f\xFCr einen Torwart?", options: ["F\xFCr Stabilit\xE4t bei Spr\xFCngen und Streckungen nach dem Ball", "Spielt keine Rolle", "Nur f\xFCr Gewichtheber wichtig"], correct: 0, explanation: "Ein starker R\xFCcken stabilisiert den ganzen K\xF6rper bei explosiven Bewegungen." },
      { q: "Wie hoch sollten Arme und Beine angehoben werden?", options: ["Nur leicht, kontrolliert \u2013 keine \xDCberstreckung", "So hoch wie physisch m\xF6glich", "Gar nicht anheben"], correct: 0, explanation: "Eine leichte, kontrollierte Anhebung reicht \u2013 \xDCberstreckung kann den unteren R\xFCcken belasten." }
    ]
  },
  {
    id: "at7",
    group: "athletik",
    name: "Bird-Dog (Kreuzkoordination)",
    desc: "Vierf\xFC\xDFlerstand, gegen\xFCberliegenden Arm und Bein gleichzeitig strecken und halten, dann Seite wechseln",
    type: "reps",
    reps: "8 pro Seite",
    icon: Activity,
    questions: [
      { q: "Was trainiert Bird-Dog vor allem?", options: ["Rumpfstabilit\xE4t und Koordination zwischen Arm und Bein", "Nur die Armkraft", "Die Sprintgeschwindigkeit"], correct: 0, explanation: "Die \xDCbung fordert Rumpfstabilit\xE4t, w\xE4hrend sich diagonale Gliedma\xDFen bewegen \u2013 echte Koordinationsarbeit." },
      { q: "Was passiert mit der H\xFCfte w\xE4hrend der \xDCbung?", options: ["Sie bleibt m\xF6glichst ruhig und gerade, ohne zu kippen", "Sie kippt bewusst zur Seite", "Sie hebt sich stark an"], correct: 0, explanation: "Eine ruhige, stabile H\xFCfte zeigt, dass der Rumpf die Bewegung richtig kontrolliert." },
      { q: "Warum hei\xDFt die \xDCbung 'Bird-Dog'?", options: ["Weil die Haltung an einen Jagdhund erinnert, der auf ein Ziel zeigt", "Weil man dabei bellen muss", "Ohne besonderen Grund"], correct: 0, explanation: "Die gestreckte Arm-Bein-Linie erinnert an die Zeigehaltung eines Jagdhundes." }
    ]
  },
  {
    id: "at8",
    group: "athletik",
    name: "Glute Bridge (H\xFCftheben)",
    desc: "R\xFCckenlage, F\xFC\xDFe aufgestellt, H\xFCfte nach oben dr\xFCcken bis Schultern-H\xFCfte-Knie eine Linie bilden",
    type: "reps",
    reps: "12 Wiederholungen",
    icon: Waves,
    questions: [
      { q: "Welcher Muskel wird beim Glute Bridge haupts\xE4chlich aktiviert?", options: ["Die Ges\xE4\xDFmuskulatur", "Der Bizeps", "Die Wade"], correct: 0, explanation: "Das H\xFCftheben aktiviert gezielt die Ges\xE4\xDFmuskulatur." },
      { q: "Warum ist eine starke Ges\xE4\xDFmuskulatur f\xFCr einen Torwart wichtig?", options: ["F\xFCr Absprungkraft und Stabilit\xE4t bei Spr\xFCngen", "Spielt keine Rolle", "Nur f\xFCr Sprinter relevant"], correct: 0, explanation: "Die Ges\xE4\xDFmuskulatur liefert einen gro\xDFen Teil der Kraft bei Spr\xFCngen und schnellen Bewegungen." },
      { q: "Was solltest du am oberen Punkt der Bewegung vermeiden?", options: ["Ein starkes Hohlkreuz durch \xDCberstreckung", "Die H\xFCfte anheben", "Die F\xFC\xDFe aufstellen"], correct: 0, explanation: "Zu starkes \xDCberstrecken belastet den unteren R\xFCcken statt das Ges\xE4\xDF zu trainieren." }
    ]
  },
  {
    id: "at9",
    group: "athletik",
    name: "Einbeinige H\xFCftbr\xFCcke",
    desc: "Wie Glute Bridge, aber ein Bein gestreckt in der Luft \u2013 deutlich intensiver f\xFCr Ges\xE4\xDF und Rumpf",
    type: "reps",
    reps: "8 pro Bein",
    icon: Waves,
    questions: [
      { q: "Warum ist die einbeinige Variante intensiver?", options: ["Weil das gesamte K\xF6rpergewicht \xFCber ein Bein gehoben wird", "Sie ist nicht intensiver", "Weil man dabei springt"], correct: 0, explanation: "Ohne die Unterst\xFCtzung des zweiten Beins muss ein Bein die komplette Arbeit leisten." },
      { q: "Was passiert mit der H\xFCfte, wenn die Stabilit\xE4t fehlt?", options: ["Sie kippt zur Seite ab", "Sie bleibt automatisch gerade", "Nichts Besonderes"], correct: 0, explanation: "Eine abkippende H\xFCfte zeigt, dass die Rumpf- und H\xFCftstabilit\xE4t noch trainiert werden muss." },
      { q: "Wof\xFCr ist diese einseitige Kr\xE4ftigung besonders wertvoll?", options: ["Um muskul\xE4re Unterschiede zwischen linkem und rechtem Bein auszugleichen", "Sie hat keinen besonderen Nutzen", "Nur f\xFCr Zweikampfsport wichtig"], correct: 0, explanation: "Einseitiges Training deckt und behebt oft ungleiche Kraftverteilung zwischen den Beinen." }
    ]
  },
  {
    id: "at10",
    group: "athletik",
    name: "Wandsitz (Wall Sit)",
    desc: "R\xFCcken an die Wand, in eine 90-Grad-Kniebeuge-Position gehen und halten, als w\xFCrde man auf einem unsichtbaren Stuhl sitzen",
    type: "time",
    seconds: 30,
    icon: Shield,
    questions: [
      { q: "Was trainiert der Wandsitz haupts\xE4chlich?", options: ["Die Kraftausdauer der Oberschenkelmuskulatur", "Die Schnelligkeit", "Die Schulterbeweglichkeit"], correct: 0, explanation: "Das lange Halten der Position fordert vor allem die Ausdauer der Oberschenkelmuskulatur." },
      { q: "In welchem Winkel sollten die Knie idealerweise stehen?", options: ["Ca. 90 Grad", "Komplett durchgestreckt", "Fast am Boden"], correct: 0, explanation: "90 Grad ist die klassische, effektivste Position f\xFCr diese \xDCbung." },
      { q: "Warum ist Kraftausdauer in den Beinen f\xFCr einen Torwart wichtig?", options: ["Um \xFCber ein ganzes Spiel explosionsf\xE4hig zu bleiben", "Spielt keine Rolle", "Nur f\xFCr Marathonl\xE4ufer wichtig"], correct: 0, explanation: "Erm\xFCdete Beinmuskulatur reagiert langsamer \u2013 Kraftausdauer hilft, auch sp\xE4t im Spiel explosiv zu bleiben." }
    ]
  },
  {
    id: "at11",
    group: "athletik",
    name: "R\xFCckw\xE4rts-Ausfallschritt",
    desc: "Ein Bein weit nach hinten setzen, beide Knie beugen, dann kraftvoll zur\xFCck in den Stand dr\xFCcken",
    type: "reps",
    reps: "8 pro Seite",
    icon: Move,
    questions: [
      { q: "Warum gilt der R\xFCckw\xE4rts-Ausfallschritt als gelenkschonender als der Vorw\xE4rts-Ausfallschritt?", options: ["Weil weniger Druck auf das vordere Knie beim Abbremsen entsteht", "Es gibt keinen Unterschied", "Er ist nicht gelenkschonender"], correct: 0, explanation: "Beim Zur\xFCcksetzen des Beins entsteht weniger abbremsende Belastung auf das vordere Knie." },
      { q: "Welche Muskeln arbeiten hier besonders?", options: ["Oberschenkel und Ges\xE4\xDF", "Nur die Arme", "Nur der Nacken"], correct: 0, explanation: "Oberschenkel- und Ges\xE4\xDFmuskulatur tragen die Hauptlast dieser \xDCbung." },
      { q: "Was passiert mit dem vorderen Knie?", options: ["Es bleibt \xFCber dem Fu\xDF, ragt nicht weit dar\xFCber hinaus", "Es f\xE4llt nach innen", "Es wird komplett durchgestreckt"], correct: 0, explanation: "Ein stabiles vorderes Knie \xFCber dem Fu\xDF sch\xFCtzt das Gelenk." }
    ]
  },
  {
    id: "at12",
    group: "athletik",
    name: "Seitlicher Ausfallschritt",
    desc: "Gro\xDFer Schritt zur Seite, das Bein auf dieser Seite beugen, das andere bleibt gestreckt, dann zur\xFCck in den Stand",
    type: "reps",
    reps: "8 pro Seite",
    icon: ArrowUpDown,
    questions: [
      { q: "In welcher Bewegungsebene trainiert der seitliche Ausfallschritt?", options: ["In der seitlichen Ebene, anders als die meisten Kniebeugen-Varianten", "Genau wie eine normale Kniebeuge", "Nur nach vorne"], correct: 0, explanation: "Die meisten \xDCbungen trainieren vor/zur\xFCck \u2013 diese \xDCbung deckt gezielt die seitliche Ebene ab." },
      { q: "Warum ist seitliche Beinkraft f\xFCr einen Torwart besonders wichtig?", options: ["F\xFCr kraftvolle Abst\xF6\xDFe zur Seite bei Paraden", "Spielt keine Rolle", "Nur f\xFCr Skifahrer wichtig"], correct: 0, explanation: "Seitliche Paraden brauchen genau diese Art von seitlicher Beinkraft." },
      { q: "Was macht der Fu\xDF des gestreckten Beins?", options: ["Er bleibt flach am Boden", "Er hebt komplett ab", "Er zeigt nach hinten"], correct: 0, explanation: "Ein flacher Fu\xDF am Boden sorgt f\xFCr Stabilit\xE4t w\xE4hrend der Bewegung." }
    ]
  },
  {
    id: "at13",
    group: "athletik",
    name: "Kniebeuge mit Pause",
    desc: "Normale Kniebeuge, aber am tiefsten Punkt 2-3 Sekunden halten, bevor man wieder hochkommt",
    type: "reps",
    reps: "10 Wiederholungen",
    icon: Shield,
    questions: [
      { q: "Warum wird bei dieser Variante am tiefsten Punkt pausiert?", options: ["Um Schwung zu eliminieren und wirklich die Muskelkraft zu fordern", "Um sich auszuruhen", "Aus Versehen"], correct: 0, explanation: "Die Pause verhindert, dass du dich aus dem Schwung nach oben dr\xFCckst \u2013 reine Muskelarbeit." },
      { q: "Was passiert mit den Knien w\xE4hrend der Kniebeuge?", options: ["Sie bleiben in einer Linie mit den F\xFC\xDFen, fallen nicht nach innen", "Sie fallen bewusst nach innen", "Sie werden komplett durchgestreckt gehalten"], correct: 0, explanation: "Knie in Linie mit den F\xFC\xDFen sch\xFCtzen die Gelenke vor unn\xF6tiger Belastung." },
      { q: "Wie tief sollte die Kniebeuge idealerweise sein?", options: ["So tief wie kontrollierbar, mit geradem R\xFCcken", "Nur ein kleines bisschen", "Bis der R\xFCcken sich rundet"], correct: 0, explanation: "Die Tiefe sollte so weit gehen, wie die Kontrolle und ein gerader R\xFCcken es erlauben." }
    ]
  },
  {
    id: "at14",
    group: "athletik",
    name: "Einbeinige Kniebeuge (unterst\xFCtzt)",
    desc: "Auf einem Bein, mit leichter Ber\xFChrung einer Wand/Stuhl zur Balance, langsam in die Hocke gehen und wieder hoch",
    type: "reps",
    reps: "6 pro Bein",
    icon: Shield,
    questions: [
      { q: "Warum ist die einbeinige Kniebeuge deutlich schwerer als die beidbeinige?", options: ["Das gesamte Gewicht liegt auf einem Bein, plus Balanceanforderung", "Sie ist eigentlich leichter", "Es gibt keinen Unterschied"], correct: 0, explanation: "Ein Bein muss sowohl das Gewicht tragen als auch die Balance halten \u2013 deutlich anspruchsvoller." },
      { q: "Warum die leichte Unterst\xFCtzung durch Wand oder Stuhl?", options: ["Um die \xDCbung sicher zu erlernen, bevor man sie frei macht", "Weil sie sonst unm\xF6glich ist", "Aus keinem besonderen Grund"], correct: 0, explanation: "Die leichte Unterst\xFCtzung hilft, die Technik sicher aufzubauen, bevor man sie ganz frei ausf\xFChrt." },
      { q: "Was trainiert diese \xDCbung zus\xE4tzlich zur Beinkraft?", options: ["Gleichgewicht und einseitige Stabilit\xE4t", "Nur die Armkraft", "Die Schnelligkeit"], correct: 0, explanation: "Die einbeinige Ausf\xFChrung kombiniert Kraft- mit Balancetraining." }
    ]
  },
  {
    id: "at15",
    group: "athletik",
    name: "Storchengang (Standwaage)",
    desc: "Auf einem Bein stehen, Oberk\xF6rper nach vorne neigen, das freie Bein nach hinten strecken \u2013 K\xF6rper bildet eine waagerechte Linie",
    type: "time",
    seconds: 25,
    icon: Eye,
    questions: [
      { q: "Was wird bei der Standwaage besonders gefordert?", options: ["Balance und die hintere Oberschenkel-/Ges\xE4\xDFmuskulatur", "Nur die Armkraft", "Die Schnelligkeit"], correct: 0, explanation: "Die Standwaage kombiniert Balance mit Kr\xE4ftigung der hinteren Beinmuskulatur." },
      { q: "Wie sollte der R\xFCcken w\xE4hrend der \xDCbung sein?", options: ["Gerade, eine Linie mit dem gestreckten Bein", "Stark gerundet", "Extrem durchgedr\xFCckt"], correct: 0, explanation: "Ein gerader R\xFCcken in Linie mit dem Bein sch\xFCtzt die Wirbels\xE4ule und macht die \xDCbung effektiver." },
      { q: "Wof\xFCr ist diese \xDCbung eine gute Vorbereitung?", options: ["F\xFCr stabile einbeinige Landungen und Richtungswechsel", "F\xFCr lange Sprints", "F\xFCr das Passspiel"], correct: 0, explanation: "Die Kombination aus Balance und Kraft bereitet gut auf einbeinige Belastungssituationen vor." }
    ]
  },
  {
    id: "at16",
    group: "athletik",
    name: "Seitliche Linien-Spr\xFCnge",
    desc: "\xDCber eine gedachte Linie seitlich hin und her springen, so schnell und kontrolliert wie m\xF6glich",
    type: "time",
    seconds: 20,
    icon: ArrowUpDown,
    questions: [
      { q: "Was trainieren seitliche Linien-Spr\xFCnge vor allem?", options: ["Reaktive seitliche Sprungkraft und Sprunggelenksstabilit\xE4t", "Nur die Ausdauer", "Die Armkraft"], correct: 0, explanation: "Die schnellen seitlichen Spr\xFCnge fordern reaktive Kraft und ein stabiles Sprunggelenk." },
      { q: "Wie sollten die Landungen sein?", options: ["Leise und kontrolliert mit leicht gebeugten Knien", "Laut und mit durchgestreckten Beinen", "Beliebig"], correct: 0, explanation: "Leise, kontrollierte Landungen zeigen eine gute Kraftabsorption." },
      { q: "Warum ist diese \xDCbung besonders relevant f\xFCr Torh\xFCter?", options: ["Sie trainiert genau die Sprungmuster f\xFCr seitliche Paraden", "Sie hat keinen Bezug zum Torwartspiel", "Nur f\xFCr Weitspringer relevant"], correct: 0, explanation: "Seitliche, reaktive Spr\xFCnge sind eine direkte Vorbereitung auf Paraden zur Seite." }
    ]
  },
  {
    id: "at17",
    group: "athletik",
    name: "Schlittschuh-Spr\xFCnge (Skater Jumps)",
    desc: "Seitlich von einem Bein aufs andere springen, wie beim Schlittschuhlaufen, mit kontrollierter Landung und kurzer Pause",
    type: "reps",
    reps: "8 pro Seite",
    icon: ArrowUpDown,
    questions: [
      { q: "Was unterscheidet Skater Jumps von den Linien-Spr\xFCngen?", options: ["Skater Jumps fordern zus\xE4tzlich einbeinige Landekontrolle", "Es gibt keinen Unterschied", "Skater Jumps sind komplett beidbeinig"], correct: 0, explanation: "Bei Skater Jumps landest du auf nur einem Bein \u2013 das fordert zus\xE4tzliche Stabilit\xE4t." },
      { q: "Wie lange h\xE4ltst du die Landeposition idealerweise?", options: ["Kurz, um die Stabilit\xE4t zu zeigen, bevor der n\xE4chste Sprung folgt", "Gar nicht, sofort weiterspringen", "5 Minuten"], correct: 0, explanation: "Eine kurze Stabilisierungspause zeigt echte Kontrolle \xFCber die Landung." },
      { q: "Welche Muskelgruppen arbeiten hier besonders?", options: ["Au\xDFenh\xFCfte, Oberschenkel und Sprunggelenk", "Nur der Bizeps", "Nur der Nacken"], correct: 0, explanation: "Diese Muskelgruppen stabilisieren die seitliche, einbeinige Landung." }
    ]
  },
  {
    id: "at18",
    group: "athletik",
    name: "Kontrollierte Streckspr\xFCnge",
    desc: "Klassische Hampelm\xE4nner, aber bewusst langsamer und kontrollierter statt so schnell wie m\xF6glich",
    type: "time",
    seconds: 30,
    icon: ArrowUpDown,
    questions: [
      { q: "Warum werden diese Streckspr\xFCnge bewusst langsam ausgef\xFChrt?", options: ["Um Koordination und Kontrolle statt reiner Geschwindigkeit zu trainieren", "Weil schnelle Spr\xFCnge verboten sind", "Ohne besonderen Grund"], correct: 0, explanation: "Langsamere Ausf\xFChrung zwingt zu bewusster Koordination von Armen und Beinen." },
      { q: "Was passiert bei der Landung?", options: ["Weich und kontrolliert mit leicht gebeugten Knien", "Hart mit durchgestreckten Beinen", "Auf einem Bein"], correct: 0, explanation: "Eine weiche Landung ist auch bei dieser einfachen \xDCbung wichtig f\xFCr die Gelenke." },
      { q: "Wof\xFCr eignet sich diese \xDCbung gut?", options: ["Als Ganzk\xF6rper-Koordinations\xFCbung im Warm-up", "Nur als reines Krafttraining", "Nur f\xFCr Anf\xE4nger ohne Nutzen f\xFCr Fortgeschrittene"], correct: 0, explanation: "Die Koordination von Armen und Beinen macht sie zu einer guten Warm-up-\xDCbung f\xFCr alle Level." }
    ]
  },
  {
    id: "at19",
    group: "athletik",
    name: "Rumpfrotation mit Widerstand",
    desc: "Im Stand mit leichtem Widerstand (z.B. Handtuch straff halten) den Oberk\xF6rper kontrolliert von einer Seite zur anderen drehen",
    type: "reps",
    reps: "10 pro Seite",
    icon: RotateCcw,
    questions: [
      { q: "Was trainiert diese \xDCbung vor allem?", options: ["Rotationskraft des Rumpfes", "Nur die Armkraft", "Die Beinschnelligkeit"], correct: 0, explanation: "Die kontrollierte Drehung gegen Widerstand kr\xE4ftigt gezielt die Rotationsmuskulatur des Rumpfes." },
      { q: "Warum ist Rotationskraft f\xFCr einen Torwart n\xFCtzlich?", options: ["F\xFCr kraftvolle W\xFCrfe und schnelle K\xF6rperdrehungen", "Spielt keine Rolle", "Nur f\xFCr Speerwerfer wichtig"], correct: 0, explanation: "W\xFCrfe und schnelle Drehbewegungen brauchen genau diese Art von Rumpfkraft." },
      { q: "Wie bewegen sich die H\xFCften bei der Rotation?", options: ["Sie bleiben stabiler als der Oberk\xF6rper", "Sie drehen sich genauso stark mit", "Sie bewegen sich gar nicht"], correct: 0, explanation: "Eine stabilere H\xFCfte im Vergleich zum Oberk\xF6rper erzeugt die Rotationsspannung, die die \xDCbung wirksam macht." }
    ]
  },
  {
    id: "at20",
    group: "athletik",
    name: "Tiefenmuskel-Aktivierung",
    desc: "Im Stand oder Liegen den Bauchnabel sanft Richtung Wirbels\xE4ule einziehen und die Spannung halten, normal weiteratmen",
    type: "time",
    seconds: 20,
    icon: Shield,
    questions: [
      { q: "Welche Muskeln werden beim Draw-In gezielt aktiviert?", options: ["Die tiefen Bauchmuskeln (Transversus)", "Der Bizeps", "Die Wade"], correct: 0, explanation: "Der Transversus abdominis ist ein tiefer Muskel, der wie ein nat\xFCrlicher G\xFCrtel wirkt." },
      { q: "Warum ist diese tiefe Muskulatur wichtig?", options: ["Sie stabilisiert die Wirbels\xE4ule bei jeder Bewegung", "Sie hat keine besondere Funktion", "Nur f\xFCr die Optik wichtig"], correct: 0, explanation: "Diese Tiefenmuskulatur sch\xFCtzt und stabilisiert die Wirbels\xE4ule bei Belastung." },
      { q: "Wie atmest du w\xE4hrend der \xDCbung?", options: ["Normal weiter, ohne die Luft anzuhalten", "Luft komplett anhalten", "Ganz schnell hecheln"], correct: 0, explanation: "Normales Weiteratmen zeigt, dass die Aktivierung kontrolliert und nicht verkrampft ist." }
    ]
  },
  {
    id: "at21",
    group: "athletik",
    name: "Toter K\xE4fer (Dead Bug)",
    desc: "R\xFCckenlage, Arme und Beine angewinkelt in die Luft, dann gegen\xFCberliegenden Arm und Bein langsam ausstrecken, ohne dass der R\xFCcken sich vom Boden l\xF6st",
    type: "reps",
    reps: "8 pro Seite",
    icon: Activity,
    questions: [
      { q: "Was sollte w\xE4hrend der ganzen \xDCbung am Boden bleiben?", options: ["Der untere R\xFCcken", "Die F\xFC\xDFe", "Die Arme"], correct: 0, explanation: "Ein R\xFCcken, der flach am Boden bleibt, zeigt echte Rumpfkontrolle statt Ausweichbewegung." },
      { q: "Was passiert, wenn sich der R\xFCcken vom Boden hebt?", options: ["Die \xDCbung wird zu schwer ausgef\xFChrt und weniger effektiv", "Das ist erw\xFCnscht", "Es macht keinen Unterschied"], correct: 0, explanation: "Wenn der R\xFCcken sich hebt, kompensiert die Rumpfmuskulatur nicht mehr richtig \u2013 dann lieber langsamer/kleiner bewegen." },
      { q: "Wof\xFCr ist Dead Bug eine gute \xDCbung?", options: ["F\xFCr Rumpfstabilit\xE4t ohne Belastung der Wirbels\xE4ule", "F\xFCr maximale Sprungkraft", "F\xFCr die Schnelligkeit"], correct: 0, explanation: "Sie trainiert Rumpfstabilit\xE4t sehr gelenkschonend, da der R\xFCcken am Boden bleibt." }
    ]
  },
  {
    id: "at22",
    group: "athletik",
    name: "Schulterblatt-Stabilisation (Y-T-W)",
    desc: "Bauchlage, Arme formen nacheinander ein Y, T und W w\xE4hrend sie leicht vom Boden gehoben werden \u2013 st\xE4rkt die Schulterblatt-Muskulatur",
    type: "reps",
    reps: "6 pro Buchstabe",
    icon: Waves,
    questions: [
      { q: "Was wird bei der Y-T-W-\xDCbung gezielt gest\xE4rkt?", options: ["Die Muskulatur rund um die Schulterbl\xE4tter", "Nur der Bizeps", "Die Wade"], correct: 0, explanation: "Die verschiedenen Armpositionen aktivieren unterschiedliche Bereiche der Schulterblatt-Muskulatur." },
      { q: "Warum ist eine starke Schulterblatt-Muskulatur f\xFCr einen Torwart wichtig?", options: ["F\xFCr Stabilit\xE4t bei W\xFCrfen und beim Abst\xFCtzen nach St\xFCrzen", "Spielt keine Rolle", "Nur f\xFCr Schwimmer wichtig"], correct: 0, explanation: "Diese Muskulatur sch\xFCtzt die Schulter bei den vielen Wurf- und St\xFCtzbewegungen eines Torwarts." },
      { q: "Wie hoch sollten die Arme angehoben werden?", options: ["Nur leicht, kontrolliert vom Boden", "So hoch wie m\xF6glich mit Schwung", "Gar nicht anheben"], correct: 0, explanation: "Eine leichte, kontrollierte Anhebung reicht, um die richtige Muskulatur zu aktivieren." }
    ]
  },
  {
    id: "at23",
    group: "athletik",
    name: "Liegest\xFCtz-Kontrolle (Exzentrisch)",
    desc: "Liegest\xFCtz-Startposition, dann extra langsam (4-5 Sekunden) nach unten absenken, kurz halten, wieder hoch",
    type: "reps",
    reps: "6 Wiederholungen",
    icon: Shield,
    questions: [
      { q: "Was bedeutet 'exzentrisch' bei dieser \xDCbung?", options: ["Die langsame, kontrollierte Abw\xE4rtsbewegung", "Nur die schnelle Aufw\xE4rtsbewegung", "Das Stillstehen"], correct: 0, explanation: "Exzentrisch bezeichnet die verl\xE4ngernde, bremsende Phase der Muskelarbeit \u2013 hier das langsame Absenken." },
      { q: "Warum ist die langsame Variante wertvoll?", options: ["Sie baut Kraft und Kontrolle auf, auch wenn ein ganzer Liegest\xFCtz noch schwerf\xE4llt", "Sie ist bedeutungslos", "Sie ist nur f\xFCr Fortgeschrittene gedacht"], correct: 0, explanation: "Die langsame Kontrolle baut Kraft auf einem Niveau auf, das auch bei schw\xE4cherer Ausgangskraft funktioniert." },
      { q: "Wof\xFCr ist Armstabilit\xE4t f\xFCr einen Torwart wichtig?", options: ["F\xFCr sicheres Abst\xFCtzen und Abfedern bei St\xFCrzen", "Spielt keine Rolle", "Nur f\xFCr Kraftsportler"], correct: 0, explanation: "Stabile Arme helfen, St\xFCrze sicher abzufangen und sich schnell wieder aufzurichten." }
    ]
  },
  {
    id: "at24",
    group: "athletik",
    name: "Abrollen vorw\xE4rts (Diving Roll Prep)",
    desc: "Aus der Hocke kontrolliert vorw\xE4rts \xFCber die Schulter abrollen und wieder auf die F\xFC\xDFe kommen",
    type: "reps",
    reps: "5 Wiederholungen",
    icon: RotateCcw,
    questions: [
      { q: "Worauf achtest du beim Abrollen vorw\xE4rts besonders?", options: ["\xDCber die Schulter abrollen, Kinn zur Brust, nicht auf den Kopf", "Direkt auf den Kopf rollen", "Mit gestrecktem R\xFCcken abrollen"], correct: 0, explanation: "Das Abrollen \xFCber die Schulter mit angezogenem Kinn sch\xFCtzt Kopf und Nacken." },
      { q: "Wof\xFCr ist diese \xDCbung eine gute Vorbereitung?", options: ["F\xFCr kontrollierte Hechtparaden mit anschlie\xDFendem Abrollen", "F\xFCr das Passspiel", "F\xFCr lange Sprints"], correct: 0, explanation: "Die F\xE4higkeit, sicher abzurollen, ist Teil einer guten Falltechnik bei Hechtparaden." },
      { q: "Wie kommst du am Ende der Rolle wieder hoch?", options: ["Kontrolliert wieder auf die F\xFC\xDFe", "Man bleibt liegen", "Mit einem Sprung r\xFCckw\xE4rts"], correct: 0, explanation: "Das Ziel ist, kontrolliert wieder spielbereit auf den F\xFC\xDFen zu stehen." }
    ]
  },
  {
    id: "at25",
    group: "athletik",
    name: "Hock-Streck-Sprung (Squat Jump)",
    desc: "Aus der Hocke explosiv nach oben springen, weich landen, direkt wieder in die n\xE4chste Hocke gehen",
    type: "reps",
    reps: "8 Wiederholungen",
    icon: Zap,
    questions: [
      { q: "Was trainiert der Hock-Streck-Sprung vor allem?", options: ["Explosive vertikale Sprungkraft", "Nur die Ausdauer", "Die Beweglichkeit der Schulter"], correct: 0, explanation: "Die explosive Streckung aus der Hocke ist der Kern des vertikalen Sprungtrainings." },
      { q: "Wie wichtig ist die Landung bei dieser \xDCbung?", options: ["Sehr wichtig \u2013 weich und kontrolliert", "Unwichtig, Hauptsache hoch springen", "Man muss nicht landen k\xF6nnen"], correct: 0, explanation: "Eine weiche, kontrollierte Landung sch\xFCtzt die Gelenke bei jedem einzelnen Sprung." },
      { q: "Warum ist explosive Sprungkraft f\xFCr einen Torwart entscheidend?", options: ["F\xFCr hohe Faustst\xF6\xDFe und Flugparaden", "Spielt keine Rolle", "Nur f\xFCr Basketballspieler wichtig"], correct: 0, explanation: "Viele der wichtigsten Torwart-Aktionen brauchen maximale, explosive Sprungkraft." }
    ]
  },
  {
    id: "at26",
    group: "athletik",
    name: "Einbeiniger Weitsprung (kontrolliert)",
    desc: "Von einem Bein so weit wie m\xF6glich nach vorne springen und auf demselben Bein kontrolliert landen",
    type: "reps",
    reps: "5 pro Bein",
    icon: ArrowUpDown,
    questions: [
      { q: "Was macht diese \xDCbung besonders anspruchsvoll?", options: ["Absprung UND Landung erfolgen auf nur einem Bein", "Sie ist eigentlich sehr einfach", "Man braucht daf\xFCr beide Beine gleichzeitig"], correct: 0, explanation: "Ein Bein muss die gesamte Absprung- und Landearbeit leisten \u2013 das ist deutlich anspruchsvoller als beidbeinig." },
      { q: "Worauf achtest du bei der Landung am meisten?", options: ["Stabilit\xE4t, ohne dass das Knie nach innen kippt", "Auf m\xF6glichst lautes Aufkommen", "Auf durchgestreckte Beine"], correct: 0, explanation: "Ein nach innen kippendes Knie ist ein h\xE4ufiges Verletzungsrisiko bei einbeinigen Landungen." },
      { q: "Wof\xFCr ist diese \xDCbung eine gute Vorbereitung im Tor?", options: ["F\xFCr einbeinige Abspr\xFCnge bei Paraden zur Seite", "F\xFCr das Passspiel", "F\xFCr lange Ausdauerl\xE4ufe"], correct: 0, explanation: "Viele Paraden erfolgen einbeinig \u2013 diese \xDCbung bereitet genau darauf vor." }
    ]
  },
  {
    id: "at27",
    group: "athletik",
    name: "Reaktive Richtungsspr\xFCnge",
    desc: "Auf Zuruf (z.B. 'links', 'rechts', 'vor') sofort in die genannte Richtung springen und stabil landen",
    type: "time",
    seconds: 30,
    icon: ArrowUpDown,
    questions: [
      { q: "Was macht diese \xDCbung zu einer 'reaktiven' \xDCbung?", options: ["Die Richtung wird erst im Moment des Sprungs vorgegeben", "Man springt immer in dieselbe Richtung", "Es gibt keine Vorgabe"], correct: 0, explanation: "Reaktives Training bedeutet, dass der K\xF6rper spontan auf einen Reiz reagieren muss \u2013 wie im echten Spiel." },
      { q: "Warum ist reaktives Training realistischer als vorgeplante Spr\xFCnge?", options: ["Weil im Spiel niemand vorher wei\xDF, wohin der Ball kommt", "Es ist nicht realistischer", "Weil es einfacher ist"], correct: 0, explanation: "Im echten Spiel musst du blitzschnell auf unvorhersehbare Situationen reagieren." },
      { q: "Was ist nach dem Sprung wichtig?", options: ["Eine stabile, sofort wieder spielbereite Landung", "Direkt liegen bleiben", "M\xF6glichst lange in der Luft bleiben"], correct: 0, explanation: "Eine stabile Landung, aus der du sofort weiterreagieren kannst, ist das eigentliche Ziel." }
    ]
  },
  {
    id: "at28",
    group: "athletik",
    name: "Hand-Auge-Koordination auf instabilem Untergrund",
    desc: "Auf einem Bein oder instabiler Unterlage stehen, dabei einen Ball an die Wand werfen und wieder fangen",
    type: "time",
    seconds: 30,
    icon: Eye,
    questions: [
      { q: "Welche zwei F\xE4higkeiten kombiniert diese \xDCbung?", options: ["Balance und Hand-Auge-Koordination gleichzeitig", "Nur reine Kraft", "Nur Schnelligkeit"], correct: 0, explanation: "Die Kombination aus instabilem Stand und Fangen fordert K\xF6rper und Kopf gleichzeitig." },
      { q: "Warum ist diese Kombination f\xFCr einen Torwart besonders wertvoll?", options: ["Weil er oft unter Balance-Stress noch pr\xE4zise fangen muss", "Weil Torh\xFCter nie balancieren m\xFCssen", "Sie hat keinen praktischen Nutzen"], correct: 0, explanation: "Im Spiel muss ein Torwart oft mitten in der Bewegung noch exakt reagieren und fangen." },
      { q: "Was passiert, wenn die Balance-Aufgabe zu leicht wird?", options: ["Man kann die Herausforderung erh\xF6hen, z.B. Augen kurz schlie\xDFen", "Man sollte sofort aufh\xF6ren", "Es gibt keine M\xF6glichkeit zur Steigerung"], correct: 0, explanation: "Die \xDCbung l\xE4sst sich durch zus\xE4tzliche Herausforderungen wie geschlossene Augen steigern." }
    ]
  },
  {
    id: "at29",
    group: "athletik",
    name: "Seitliche Plank mit Beinheben",
    desc: "Seitst\xFCtz-Position halten und dabei das obere Bein zus\xE4tzlich langsam anheben und senken",
    type: "reps",
    reps: "8 pro Seite",
    icon: Shield,
    questions: [
      { q: "Was kommt bei dieser Variante zum normalen Seitst\xFCtz dazu?", options: ["Eine zus\xE4tzliche Bewegung des oberen Beins", "Ein Sprung", "Nichts, sie ist identisch"], correct: 0, explanation: "Das zus\xE4tzliche Beinheben macht die \xDCbung anspruchsvoller f\xFCr Rumpf und \xE4u\xDFere H\xFCfte." },
      { q: "Welche Muskeln werden zus\xE4tzlich zum Rumpf beansprucht?", options: ["Die \xE4u\xDFere H\xFCftmuskulatur (Abduktoren)", "Der Bizeps", "Die Wade"], correct: 0, explanation: "Das Anheben des Beins aktiviert zus\xE4tzlich die \xE4u\xDFeren H\xFCftmuskeln." },
      { q: "Was passiert, wenn die H\xFCfte w\xE4hrend der \xDCbung absackt?", options: ["Die \xDCbung verliert an Effektivit\xE4t \u2013 H\xFCfte sollte oben bleiben", "Das ist erw\xFCnscht", "Es macht keinen Unterschied"], correct: 0, explanation: "Eine stabile, hohe H\xFCfte zeigt, dass wirklich die Zielmuskulatur arbeitet." }
    ]
  },
  {
    id: "at30",
    group: "athletik",
    name: "Reaktive Einbein-Landung",
    desc: "Von einer kleinen Erh\xF6hung springen und auf nur einem Bein stabil und kontrolliert landen",
    type: "reps",
    reps: "6 pro Bein",
    icon: Footprints,
    questions: [
      { q: "Was ist der Unterschied zur normalen 'Weichen Landung'-\xDCbung?", options: ["Die Landung erfolgt auf nur einem statt zwei Beinen", "Es gibt keinen Unterschied", "Man landet auf den H\xE4nden"], correct: 0, explanation: "Die einbeinige Landung ist deutlich anspruchsvoller f\xFCr Balance und Gelenkstabilit\xE4t." },
      { q: "Warum ist diese \xDCbung besonders wichtig f\xFCr die Verletzungspr\xE4vention?", options: ["Weil viele Sportverletzungen bei einbeinigen Landungen passieren", "Sie hat keinen Bezug zu Verletzungen", "Nur zweibeinige Landungen sind riskant"], correct: 0, explanation: "Viele Knieverletzungen im Sport entstehen genau bei instabilen einbeinigen Landungen." },
      { q: "Worauf achtest du beim Landeknie?", options: ["Es bleibt stabil in Linie mit dem Fu\xDF, kippt nicht nach innen", "Es darf beliebig wackeln", "Es sollte komplett durchgestreckt bleiben"], correct: 0, explanation: "Ein stabiles Knie in Linie mit dem Fu\xDF ist der wichtigste Schutz vor Verletzungen bei dieser \xDCbung." }
    ]
  },
  // ATHLETIK – gezielt für maximale Sprungkraft
  {
    id: "at31",
    group: "athletik",
    name: "Kastensprung (Box Jump)",
    desc: "Auf eine stabile, niedrige Erh\xF6hung explosiv hochspringen, oben kurz stehen bleiben, dann kontrolliert wieder runtersteigen (nicht runterspringen)",
    type: "reps",
    reps: "8 Wiederholungen",
    icon: Zap,
    questions: [
      { q: "Warum steigst du nach dem Kastensprung wieder runter, statt runterzuspringen?", options: ["Runtersteigen schont die Gelenke, das Springen passiert nur nach oben", "Runterspringen trainiert zus\xE4tzlich", "Es spielt keine Rolle"], correct: 0, explanation: "Der Trainingsreiz liegt im explosiven Absprung nach oben \u2013 das Runterspringen w\xFCrde nur unn\xF6tig die Gelenke belasten." },
      { q: "Wie sollte die H\xF6he der Erh\xF6hung gew\xE4hlt werden?", options: ["Herausfordernd, aber sicher zu erreichen mit sauberer Technik", "So hoch wie irgendwie m\xF6glich", "Immer sehr niedrig, das reicht v\xF6llig"], correct: 0, explanation: "Eine H\xF6he, die du sauber und kontrolliert schaffst, bringt mehr als eine zu hohe mit schlechter Landung." },
      { q: "Was trainiert der Kastensprung vor allem?", options: ["Maximale, explosive Absprungkraft nach oben", "Ausdauer", "Beweglichkeit der Schulter"], correct: 0, explanation: "Der Kastensprung ist eine der direktesten \xDCbungen f\xFCr explosive vertikale Sprungkraft." }
    ]
  },
  {
    id: "at32",
    group: "athletik",
    name: "Pause-Kniebeuge-Sprung",
    desc: "In der Hocke 2 Sekunden bewusst pausieren (kein Schwung nutzen), dann explosiv so hoch wie m\xF6glich springen",
    type: "reps",
    reps: "6 Wiederholungen",
    icon: Zap,
    questions: [
      { q: "Warum wird bei dieser Variante in der Hocke pausiert?", options: ["Damit kein Schwung genutzt wird und nur die reine Explosivkraft z\xE4hlt", "Um sich auszuruhen", "Aus Versehen"], correct: 0, explanation: "Ohne Schwung aus der Abw\xE4rtsbewegung muss die Sprungkraft komplett aus der Muskulatur kommen \u2013 ein ehrlicherer Krafttest." },
      { q: "Was ist der Unterschied zum normalen Hock-Streck-Sprung?", options: ["Hier fehlt der Dehnungsreflex aus der schnellen Abw\xE4rtsbewegung", "Es gibt keinen Unterschied", "Diese Variante ist immer leichter"], correct: 0, explanation: "Der normale Sprung nutzt einen kurzen Dehnungsreflex \u2013 die Pause-Variante trainiert die reine Maximalkraft ohne diesen Trick." },
      { q: "Wof\xFCr ist diese ehrliche Kraftmessung n\xFCtzlich?", options: ["Um echte Fortschritte in der Explosivkraft zu erkennen", "Sie ist nutzlos", "Nur f\xFCr die Ausdauer"], correct: 0, explanation: "Da kein Schwung hilft, zeigt diese \xDCbung sehr genau, wie sich deine reine Sprungkraft entwickelt." }
    ]
  },
  {
    id: "at33",
    group: "athletik",
    name: "Tiefsprung \u2013 Einstieg (Depth Jump)",
    desc: "Von einer kleinen, niedrigen Erh\xF6hung (ca. 15\u201320cm) abspringen, bei der Landung sofort explosiv wieder hochspringen \u2013 so kurz wie m\xF6glich am Boden bleiben",
    type: "reps",
    reps: "5 Wiederholungen",
    icon: Zap,
    questions: [
      { q: "Was ist das Ziel beim Tiefsprung?", options: ["So kurz wie m\xF6glich am Boden bleiben und sofort explosiv wieder abspringen", "So lange wie m\xF6glich in der Hocke bleiben", "M\xF6glichst weit nach vorne springen"], correct: 0, explanation: "Je k\xFCrzer die Bodenkontaktzeit, desto besser nutzt du die reaktive Kraft deiner Muskeln und Sehnen." },
      { q: "Warum startet man mit einer niedrigen Erh\xF6hung statt gleich hoch?", options: ["Die Technik muss zuerst sauber sitzen, bevor mehr H\xF6he sinnvoll ist", "Niedrig ist immer besser", "Die H\xF6he spielt \xFCberhaupt keine Rolle"], correct: 0, explanation: "Eine zu gro\xDFe H\xF6he von Anfang an erh\xF6ht das Verletzungsrisiko, bevor die Technik stimmt \u2013 erst sauber lernen, dann steigern." },
      { q: "Was trainiert der Tiefsprung im Vergleich zum normalen Squat Jump zus\xE4tzlich?", options: ["Die reaktive Kraft (wie schnell Muskeln nach dem Aufprall wieder Kraft entwickeln)", "Nur die Ausdauer", "Gar nichts Zus\xE4tzliches"], correct: 0, explanation: "Der Tiefsprung trainiert gezielt, wie schnell dein K\xF6rper nach einem Aufprall wieder maximale Kraft aufbringen kann \u2013 genau das, was du bei Spr\xFCngen im Tor brauchst." }
    ]
  },
  {
    id: "at34",
    group: "athletik",
    name: "Armschwung-Technik f\xFCr mehr Sprungh\xF6he",
    desc: "\xDCbe den kraftvollen Armschwung nach oben beim Absprung \u2013 richtig eingesetzt bringt er sp\xFCrbar mehr H\xF6he",
    type: "reps",
    reps: "8 Spr\xFCnge",
    icon: ArrowUpDown,
    questions: [
      { q: "Wie viel zus\xE4tzliche Sprungh\xF6he kann ein guter Armschwung bringen?", options: ["Einen sp\xFCrbaren Unterschied \u2013 oft mehrere Zentimeter", "Gar keinen Unterschied", "Armschwung macht den Sprung nur langsamer"], correct: 0, explanation: "Ein kraftvoller, gut getimter Armschwung kann die Sprungh\xF6he deutlich erh\xF6hen." },
      { q: "Wie sollten die Arme kurz vor dem Absprung stehen?", options: ["Nach hinten gef\xFChrt, bereit f\xFCr einen kraftvollen Schwung nach oben", "Komplett ruhig am K\xF6rper", "\xDCber dem Kopf verschr\xE4nkt"], correct: 0, explanation: "Die Arme nach hinten zu f\xFChren erm\xF6glicht einen weiten, kraftvollen Schwung nach oben beim Absprung." },
      { q: "Worauf kommt es beim Timing des Armschwungs an?", options: ["Arme und Beine arbeiten gleichzeitig zusammen, nicht nacheinander", "Erst die Arme, dann die Beine", "Timing spielt keine Rolle"], correct: 0, explanation: "Nur wenn Arm- und Beinstreckung gleichzeitig passieren, addiert sich die Kraft wirklich zu mehr H\xF6he." }
    ]
  },
  {
    id: "at35",
    group: "athletik",
    name: "Sprungkraft-Ausdauer (Continuous Jumps)",
    desc: "Serie von kurzen, maximalen Spr\xFCngen ohne gro\xDFe Pause dazwischen \u2013 trainiert, die Sprungkraft auch sp\xE4t im Spiel noch abrufen zu k\xF6nnen",
    type: "time",
    seconds: 20,
    icon: Zap,
    questions: [
      { q: "Warum ist Sprungkraft-Ausdauer f\xFCr einen Torwart wichtig?", options: ["Damit die Sprungkraft auch in der 89. Minute noch da ist, nicht nur am Anfang", "Spielt keine Rolle im Spielverlauf", "Nur die Maximalkraft z\xE4hlt"], correct: 0, explanation: "Ein Spiel dauert lange \u2013 deine explosive Sprungkraft muss auch sp\xE4t im Spiel noch abrufbar sein." },
      { q: "Was passiert bei den letzten Spr\xFCngen einer solchen Serie oft?", options: ["Sie werden anstrengender, aber genau das ist der Trainingsreiz", "Sie werden automatisch leichter", "Man sollte vorher abbrechen"], correct: 0, explanation: "Die Erm\xFCdung gegen Ende ist gewollt \u2013 genau sie trainiert die F\xE4higkeit, auch m\xFCde noch explosiv zu sein." },
      { q: "Wie unterscheidet sich diese \xDCbung vom einzelnen Squat Jump?", options: ["Hier z\xE4hlt die wiederholte Sprungkraft unter Erm\xFCdung, nicht nur ein Maximalversuch", "Es gibt keinen Unterschied", "Diese \xDCbung ist rein statisch"], correct: 0, explanation: "Einzelspr\xFCnge zeigen deine Maximalkraft, diese Serie zeigt, wie gut du sie \xFCber Zeit halten kannst." }
    ]
  }
];
var EXERCISE_BY_ID = Object.fromEntries(EXERCISE_LIBRARY.map((e) => [e.id, e]));
var MENTAL_LIBRARY = [
  // FOKUS
  {
    id: "f1",
    group: "fokus",
    name: "4-4-4 Atmung f\xFCr den Fokus",
    desc: "Box-Atmung: 4 Sek. einatmen, 4 halten, 4 ausatmen, 4 halten \u2013 beruhigt das Nervensystem und sch\xE4rft den Fokus",
    type: "steps",
    icon: Wind,
    steps: [
      { label: "Einatmen", seconds: 4 },
      { label: "Halten", seconds: 4 },
      { label: "Ausatmen", seconds: 4 },
      { label: "Halten", seconds: 4 },
      { label: "Einatmen", seconds: 4 },
      { label: "Halten", seconds: 4 },
      { label: "Ausatmen", seconds: 4 },
      { label: "Halten", seconds: 4 },
      { label: "Einatmen", seconds: 4 },
      { label: "Halten", seconds: 4 },
      { label: "Ausatmen", seconds: 4 },
      { label: "Halten", seconds: 4 }
    ],
    questions: [
      { q: "Warum hilft die 4-4-4-Atmung vor einer wichtigen Aktion?", options: ["Sie beruhigt das Nervensystem und sch\xE4rft den Fokus", "Sie macht m\xFCde", "Sie hat keinen Effekt"], correct: 0, explanation: "Langsames, kontrolliertes Atmen aktiviert den beruhigenden Teil deines Nervensystems." },
      { q: "Wann kannst du diese Atmung im Spiel einsetzen?", options: ["Kurz vor einem Elfmeter oder einer wichtigen Aktion", "Nur zu Hause auf dem Sofa", "W\xE4hrend du rennst"], correct: 0, explanation: "Kurze Atem\xFCbungen lassen sich auch mitten im Spiel in wenigen Sekunden einsetzen." },
      { q: "Was passiert in der Halten-Phase?", options: ["Der K\xF6rper kommt kurz zur Ruhe, bevor die n\xE4chste Phase beginnt", "Nichts Besonderes", "Man wird davon schwindelig"], correct: 0, explanation: "Die kurze Pause zwischen Ein- und Ausatmen verst\xE4rkt den beruhigenden Effekt." }
    ]
  },
  {
    id: "f2",
    group: "fokus",
    name: "Fokus-Anker setzen",
    desc: "Einen festen Punkt (z.B. die Torpfosten) fixieren, um den Kopf von Ablenkung freizumachen",
    type: "time",
    seconds: 20,
    icon: Eye,
    questions: [
      { q: "Warum hilft ein fester Blickpunkt vor einem Elfmeter?", options: ["Er lenkt die Aufmerksamkeit weg von st\xF6renden Gedanken", "Er macht den Ball gr\xF6\xDFer", "Er hat keinen Nutzen"], correct: 0, explanation: "Ein fester Fokuspunkt b\xFCndelt die Aufmerksamkeit und blendet Ablenkungen aus." },
      { q: "Was ist ein guter Fokus-Anker im Tor?", options: ["Ein fester Punkt wie der Ball oder die eigene Hand", "Die Zuschauer auf der Trib\xFCne", "Der Himmel"], correct: 0, explanation: "Ein neutraler, unver\xE4nderlicher Punkt eignet sich am besten als Anker." },
      { q: "Wie lange \xFCbst du das Fixieren am Anfang?", options: ["Ein paar Sekunden reichen zum Einstieg", "Mindestens eine Stunde", "Nur im Schlaf"], correct: 0, explanation: "Schon kurze, regelm\xE4\xDFige \xDCbung reicht, um den Fokus-Anker zu trainieren." }
    ]
  },
  {
    id: "f3",
    group: "fokus",
    name: "5-4-3-2-1 Sinnes\xFCbung",
    desc: "Nenne (laut oder in Gedanken) Dinge, die du gerade wahrnimmst \u2013 holt dich aus dem Kopf zur\xFCck in den Moment",
    type: "steps",
    icon: Eye,
    noQuiz: true,
    steps: [
      { label: "5 Dinge, die du siehst", seconds: 15 },
      { label: "4 Dinge, die du h\xF6rst", seconds: 12 },
      { label: "3 Dinge, die du sp\xFCrst", seconds: 12 },
      { label: "2 Dinge, die du riechst", seconds: 10 },
      { label: "Einmal tief durchatmen \u2013 du bist gerade hier, das reicht", seconds: 10 }
    ]
  },
  {
    id: "f4",
    group: "fokus",
    name: "Konzentrations-Reset nach einem Fehler",
    desc: "Kurzes Ritual nach einem Gegentor oder Fehler: einmal tief durchatmen, Handschuhe kurz abklatschen, Blick nach vorne",
    type: "time",
    seconds: 15,
    icon: RotateCcw,
    questions: [
      { q: "Warum brauchst du ein festes Ritual nach einem Fehler?", options: ["Es hilft, schnell wieder in den Fokus zur\xFCckzufinden statt im Kopf h\xE4ngenzubleiben", "Rituale sind unn\xF6tig", "Es macht den Fehler ungeschehen"], correct: 0, explanation: "Ein festes Ritual gibt deinem Gehirn ein klares Signal: 'Der Moment ist vorbei, weiter geht's.'" },
      { q: "Was ist der gr\xF6\xDFte Fehler nach einem Gegentor?", options: ["Sich lange mit dem Fehler besch\xE4ftigen, statt sich auf die n\xE4chste Aktion zu konzentrieren", "Kurz durchatmen", "Weiterspielen"], correct: 0, explanation: "Wer gedanklich beim letzten Fehler bleibt, ist beim n\xE4chsten Ball nicht bereit." },
      { q: "Wie lange sollte so ein Reset-Ritual dauern?", options: ["Nur ein paar Sekunden", "Mehrere Minuten", "Bis zum Spielende"], correct: 0, explanation: "Ein gutes Ritual ist kurz und schnell einsetzbar, damit du sofort wieder bereit bist." }
    ]
  },
  // RUHE
  {
    id: "r1",
    group: "ruhe",
    name: "Bauchatmung",
    desc: "Ruhige Bauchatmung statt flacher Brustatmung \u2013 aktiviert die Entspannung",
    type: "steps",
    icon: Wind,
    noQuiz: true,
    steps: [
      { label: "Hand auf den Bauch, einatmen durch die Nase", seconds: 20 },
      { label: "Sp\xFCren, wie der Bauch sich hebt", seconds: 15 },
      { label: "Langsam durch den Mund ausatmen", seconds: 20 }
    ]
  },
  {
    id: "r2",
    group: "ruhe",
    name: "Progressive Muskelentspannung (Kurzform)",
    desc: "Muskeln bewusst anspannen und wieder loslassen \u2013 macht k\xF6rperliche Entspannung sp\xFCrbar",
    type: "steps",
    icon: Activity,
    steps: [
      { label: "H\xE4nde zur Faust ballen, halten, loslassen", seconds: 10 },
      { label: "Schultern hochziehen, halten, loslassen", seconds: 10 },
      { label: "Gesicht zusammenkneifen, halten, loslassen", seconds: 10 },
      { label: "Beine anspannen, halten, loslassen", seconds: 10 }
    ],
    questions: [
      { q: "Wie funktioniert progressive Muskelentspannung?", options: ["Muskeln bewusst anspannen, dann loslassen, um Entspannung zu sp\xFCren", "Nur stillsitzen", "Muskeln die ganze Zeit anspannen"], correct: 0, explanation: "Der Kontrast zwischen Anspannung und Loslassen macht die Entspannung deutlich sp\xFCrbar." },
      { q: "Wann ist diese \xDCbung besonders hilfreich?", options: ["Bei Nervosit\xE4t vor einem Spiel", "Nur beim Krafttraining", "W\xE4hrend des Sprints"], correct: 0, explanation: "Sie hilft, k\xF6rperliche Anspannung durch Nervosit\xE4t gezielt zu l\xF6sen." },
      { q: "Was passiert, wenn du die Muskeln losl\xE4sst?", options: ["Ein sp\xFCrbares Gef\xFChl von Entspannung und Schwere", "Nichts Besonderes", "Die Muskeln werden h\xE4rter"], correct: 0, explanation: "Der Unterschied zwischen An- und Entspannung wird bewusst wahrnehmbar." }
    ]
  },
  {
    id: "r3",
    group: "ruhe",
    name: "Warum Nervosit\xE4t normal ist",
    desc: "Kurzer Moment, um zu erkennen: Nervosit\xE4t ist ein Zeichen, dass dir das Spiel wichtig ist \u2013 kein Fehler",
    type: "time",
    seconds: 15,
    icon: Brain,
    questions: [
      { q: "Was bedeutet Nervosit\xE4t vor einem Spiel eigentlich?", options: ["Dass dir das Spiel wichtig ist und dein K\xF6rper sich bereit macht", "Dass du schlecht bist", "Dass du nicht spielen solltest"], correct: 0, explanation: "Nervosit\xE4t ist die nat\xFCrliche Reaktion des K\xF6rpers auf eine wichtige Situation \u2013 auch Profis kennen das." },
      { q: "Was unterscheidet Profis von anderen im Umgang mit Nervosit\xE4t?", options: ["Sie haben gelernt, mit dem Gef\xFChl umzugehen, nicht dass sie es nicht mehr sp\xFCren", "Sie sind nie nerv\xF6s", "Sie ignorieren es komplett"], correct: 0, explanation: "Auch die besten Sportler der Welt sind nerv\xF6s \u2013 der Unterschied ist der Umgang damit." },
      { q: "Was hilft, wenn die Nervosit\xE4t zu gro\xDF wird?", options: ["Bewusstes, langsames Atmen", "Die Nervosit\xE4t wegdr\xFCcken und ignorieren", "Sich noch mehr Sorgen machen"], correct: 0, explanation: "Bewusstes Atmen hilft, die k\xF6rperliche Anspannung zu regulieren." }
    ]
  },
  {
    id: "r4",
    group: "ruhe",
    name: "Ruhe-Anker-Wort",
    desc: "Ein pers\xF6nliches Wort oder einen kurzen Satz w\xE4hlen (z.B. 'ruhig' oder 'ich bin bereit'), das du dir in stressigen Momenten sagst",
    type: "time",
    seconds: 20,
    icon: Wind,
    questions: [
      { q: "Wof\xFCr ist ein Ruhe-Anker-Wort gut?", options: ["Es ist ein kurzer, einfacher Weg, sich in stressigen Momenten selbst zu beruhigen", "Es hat keinen echten Nutzen", "Es ersetzt das Training"], correct: 0, explanation: "Ein kurzes, vertrautes Wort l\xE4sst sich blitzschnell abrufen \u2013 genau dann, wenn du es brauchst." },
      { q: "Wie oft solltest du das Wort \xFCben, damit es im Ernstfall wirkt?", options: ["Regelm\xE4\xDFig auch au\xDFerhalb stressiger Momente", "Nur einmal reicht", "Gar nicht \xFCben, nur im Notfall nutzen"], correct: 0, explanation: "Wie jede mentale Technik wird sie durch Wiederholung wirksamer und automatischer." },
      { q: "Was macht ein gutes Anker-Wort aus?", options: ["Kurz, pers\xF6nlich und positiv formuliert", "M\xF6glichst lang und kompliziert", "Negativ formuliert"], correct: 0, explanation: "Kurze, positive Worte sind leichter abrufbar unter Druck." }
    ]
  },
  // VERTRAUEN
  {
    id: "s1",
    group: "vertrauen",
    name: "Erfolgstagebuch",
    desc: "Schreib 3 Dinge auf, die heute gut liefen \u2013 auch kleine Sachen z\xE4hlen",
    type: "reps",
    reps: "Journal",
    icon: Trophy,
    kind: "journal",
    noQuiz: true,
    prompts: ["Was lief heute gut?", "Was noch?", "Worauf bist du stolz?"]
  },
  {
    id: "s2",
    group: "vertrauen",
    name: "Warum Selbstgespr\xE4ch wichtig ist",
    desc: "Kurz bewusst machen: Wie redest du in Gedanken mit dir selbst nach einem Fehler?",
    type: "time",
    seconds: 15,
    icon: Brain,
    questions: [
      { q: "Was ist der Unterschied zwischen hilfreichem und sch\xE4dlichem Selbstgespr\xE4ch?", options: ["Hilfreiches Selbstgespr\xE4ch ist konstruktiv, sch\xE4dliches macht nur runter", "Es gibt keinen Unterschied", "Selbstgespr\xE4ch spielt keine Rolle"], correct: 0, explanation: "Wie du mit dir selbst sprichst, beeinflusst direkt deine n\xE4chste Leistung." },
      { q: "Was ist ein Beispiel f\xFCr hilfreiches Selbstgespr\xE4ch nach einem Fehler?", options: ["'Okay, n\xE4chste Aktion, ich bin bereit'", "'Ich bin einfach schlecht'", "Gar nichts denken"], correct: 0, explanation: "Konstruktive, nach vorne gerichtete S\xE4tze helfen dir, weiterzumachen." },
      { q: "Warum ist das bei jungen Sportlern besonders wichtig zu lernen?", options: ["Weil sich dieses Denkmuster mit der Zeit festigt, positiv wie negativ", "Es ist nur f\xFCr Erwachsene relevant", "Es hat keinen langfristigen Effekt"], correct: 0, explanation: "Je fr\xFCher man konstruktives Selbstgespr\xE4ch \xFCbt, desto nat\xFCrlicher wird es sp\xE4ter." }
    ]
  },
  {
    id: "s3",
    group: "vertrauen",
    name: "Meine St\xE4rken-Liste",
    desc: "Schreib 3 Dinge auf, die du als Torwart richtig gut kannst",
    type: "reps",
    reps: "Journal",
    icon: Flame,
    kind: "journal",
    noQuiz: true,
    prompts: ["Was kannst du richtig gut?", "Was noch?", "Was sagen andere \xFCber deine St\xE4rken?"]
  },
  {
    id: "s4",
    group: "vertrauen",
    name: "R\xFCckschl\xE4ge neu bewerten",
    desc: "Einen R\xFCckschlag der letzten Zeit kurz durchdenken: Was konntest du daraus lernen?",
    type: "time",
    seconds: 15,
    icon: RotateCcw,
    questions: [
      { q: "Was unterscheidet ein 'Growth Mindset' (die Haltung 'ich kann dazulernen') von einer festen Denkweise ('ich bin halt so')?", options: ["R\xFCckschl\xE4ge werden als Lernchance statt als Beweis f\xFCr fehlendes Talent gesehen", "Es gibt keinen Unterschied", "Growth Mindset bedeutet, nie Fehler zu machen"], correct: 0, explanation: "Ein Growth Mindset sieht F\xE4higkeiten als trainierbar \u2013 R\xFCckschl\xE4ge geh\xF6ren zum Lernprozess dazu." },
      { q: "Warum ist es hilfreich, nach einem R\xFCckschlag zu fragen 'Was kann ich lernen?'", options: ["Es lenkt den Fokus auf Verbesserung statt auf Selbstkritik", "Es macht den R\xFCckschlag ungeschehen", "Es ist reine Zeitverschwendung"], correct: 0, explanation: "Die Frage nach dem Lerneffekt macht aus einem R\xFCckschlag echten Fortschritt." },
      { q: "Wie gehen die besten Sportler oft mit Fehlern um?", options: ["Sie analysieren kurz, lernen daraus und lassen los", "Sie machen nie Fehler", "Sie gr\xFCbeln endlos dar\xFCber nach"], correct: 0, explanation: "Kurze, konstruktive Analyse gefolgt von Loslassen ist der Schl\xFCssel." }
    ]
  },
  // ROUTINE
  {
    id: "ro1",
    group: "routine",
    name: "SMART-Ziel setzen",
    desc: "Setz dir ein konkretes, erreichbares Ziel f\xFCr die n\xE4chsten Wochen",
    type: "reps",
    reps: "Ziel setzen",
    icon: Target,
    kind: "goal",
    noQuiz: true,
    fields: ["Mein Ziel", "Warum ist es mir wichtig?", "Bis wann will ich es schaffen?"]
  },
  {
    id: "ro2",
    group: "routine",
    name: "Visualisierung: Der perfekte Save",
    desc: "Stell dir in Gedanken lebhaft vor, wie du einen schwierigen Ball h\xE4ltst \u2013 von der Bewegung bis zum Jubel",
    type: "steps",
    icon: Eye,
    steps: [
      { label: "Augen schlie\xDFen, ruhig werden", seconds: 10 },
      { label: "Du siehst den Schuss kommen", seconds: 15 },
      { label: "Du bewegst dich explosiv zum Ball", seconds: 15 },
      { label: "Du h\xE4ltst den Ball sicher fest", seconds: 15 },
      { label: "Du sp\xFCrst den Erfolg", seconds: 10 }
    ],
    questions: [
      { q: "Warum hilft mentale Visualisierung wirklich?", options: ["Das Gehirn aktiviert \xE4hnliche Bereiche wie bei echter Bewegung", "Sie hat keinen messbaren Effekt", "Nur Profis k\xF6nnen das nutzen"], correct: 0, explanation: "Studien zeigen, dass sich Visualisierung positiv auf die tats\xE4chliche Bewegungsausf\xFChrung auswirken kann." },
      { q: "Wie detailliert sollte eine gute Visualisierung sein?", options: ["So lebendig wie m\xF6glich, mit Bewegung und Gef\xFChl", "Nur ein vages Bild reicht", "Details spielen keine Rolle"], correct: 0, explanation: "Je lebendiger die Vorstellung, desto st\xE4rker der Effekt." },
      { q: "Wann eignet sich diese \xDCbung besonders gut?", options: ["Am Abend vor dem Spiel oder kurz vorher", "Nur direkt nach dem Aufstehen", "Nie sinnvoll im Sport"], correct: 0, explanation: "Kurz vor dem Spiel oder am Vorabend hilft Visualisierung, sich bereit zu f\xFChlen." }
    ]
  },
  {
    id: "ro3",
    group: "routine",
    name: "Spieltags-Routine bauen",
    desc: "Leg fest, was du vor jedem Spiel in fester Reihenfolge machst \u2013 das gibt Sicherheit",
    type: "reps",
    reps: "Journal",
    icon: Calendar,
    kind: "journal",
    noQuiz: true,
    prompts: ["2 Stunden vorher:", "1 Stunde vorher:", "10 Minuten vorher:"]
  },
  {
    id: "ro4",
    group: "routine",
    name: "Warum Routinen im Sport helfen",
    desc: "Kurz nachdenken: Welche feste Reihenfolge hilft dir schon jetzt vor einem Spiel?",
    type: "time",
    seconds: 15,
    icon: Calendar,
    questions: [
      { q: "Warum helfen feste Routinen vor dem Spiel?", options: ["Sie geben Sicherheit und reduzieren Nervosit\xE4t durch Vorhersehbarkeit", "Sie sind reiner Aberglaube ohne echten Nutzen", "Sie machen das Spiel langsamer"], correct: 0, explanation: "Eine bekannte Abfolge gibt dem Kopf Sicherheit, gerade in aufregenden Momenten." },
      { q: "Was ist der Unterschied zwischen Routine und Aberglaube?", options: ["Eine Routine hat einen echten psychologischen Nutzen (Fokus, Ruhe)", "Es gibt keinen Unterschied", "Aberglaube ist wissenschaftlich besser belegt"], correct: 0, explanation: "Routinen wirken \xFCber echte psychologische Mechanismen wie Vorbereitung und Fokus." },
      { q: "Was passiert, wenn die Routine mal gest\xF6rt wird?", options: ["Am besten flexibel bleiben und sich nicht verunsichern lassen", "Das Spiel automatisch verlieren", "Panisch werden"], correct: 0, explanation: "Eine gute Routine gibt Halt, sollte aber nicht zur Abh\xE4ngigkeit werden \u2013 Flexibilit\xE4t bleibt wichtig." }
    ]
  },
  // FOKUS – weitere Übungen
  {
    id: "f5",
    group: "fokus",
    name: "Die Geschichte vom Bambus",
    desc: "Ein Bauer pflanzt einen chinesischen Bambus. Vier Jahre lang gie\xDFt er ihn \u2013 nichts passiert. Im f\xFCnften Jahr w\xE4chst die Pflanze in sechs Wochen \xFCber 20 Meter. Die ganze Zeit hatte sie unter der Erde ein riesiges Wurzelsystem aufgebaut.",
    type: "time",
    seconds: 15,
    icon: Brain,
    story: true,
    questions: [
      { q: "Was zeigt die Geschichte vom Bambus?", options: ["Manchmal passiert Fortschritt unsichtbar, bevor er sichtbar wird", "Bambus w\xE4chst immer sofort sichtbar", "Geduld bringt nichts"], correct: 0, explanation: "Wie die Wurzeln des Bambus ist auch dein Training oft unsichtbar \u2013 bis der Durchbruch kommt." },
      { q: "Wie f\xFChlt es sich manchmal an, wenn man hart trainiert, aber keinen Fortschritt sieht?", options: ["Frustrierend, aber das hei\xDFt nicht, dass nichts passiert", "Ein Zeichen zum Aufgeben", "Ein Beweis, dass man kein Talent hat"], correct: 0, explanation: "Fortschritt ist oft unsichtbar, bis er pl\xF6tzlich sichtbar wird \u2013 wie beim Bambus." },
      { q: "Was ist die wichtigste Botschaft f\xFCr dein Training?", options: ["Dranbleiben, auch wenn der Fortschritt noch nicht sichtbar ist", "Sofort aufgeben, wenn nichts passiert", "Nur an Tagen trainieren, an denen man Lust hat"], correct: 0, explanation: "Best\xE4ndigkeit zahlt sich aus, auch wenn du es noch nicht siehst." }
    ]
  },
  {
    id: "f6",
    group: "fokus",
    name: "Ablenkungen sortieren",
    desc: "Was lenkt dich im Spiel am meisten ab \u2013 und was davon kannst du \xFCberhaupt beeinflussen?",
    type: "reps",
    reps: "Journal",
    icon: Eye,
    kind: "journal",
    noQuiz: true,
    prompts: ["Was lenkt dich im Spiel am meisten ab?", "Kannst du das beeinflussen? Warum oder warum nicht?", "Worauf willst du dich stattdessen konzentrieren?"]
  },
  {
    id: "f7",
    group: "fokus",
    name: "Ein Ding auf einmal",
    desc: "\xDCbe, dich bewusst nur auf eine Sache zu konzentrieren \u2013 z.B. 30 Sekunden nur auf deinen Atem, ohne dass die Gedanken abschweifen",
    type: "time",
    seconds: 30,
    icon: Wind,
    questions: [
      { q: "Warum ist es so schwer, sich nur auf eine Sache zu konzentrieren?", options: ["Unser Gehirn ist es gewohnt, st\xE4ndig zwischen Gedanken zu springen", "Es ist eigentlich ganz leicht", "Konzentration ist nicht trainierbar"], correct: 0, explanation: "Fokus ist wie ein Muskel \u2013 er f\xFChlt sich am Anfang anstrengend an, wird aber mit \xDCbung st\xE4rker." },
      { q: "Was tust du, wenn deine Gedanken w\xE4hrend der \xDCbung abschweifen?", options: ["Sanft und ohne \xC4rger zur\xFCck zum Atem kommen", "Sich selbst daf\xFCr kritisieren", "Die \xDCbung sofort abbrechen"], correct: 0, explanation: "Abschweifende Gedanken sind normal \u2013 sanft zur\xFCckzukommen ist der eigentliche Trainingseffekt." },
      { q: "Wof\xFCr trainiert dich diese einfache \xDCbung?", options: ["F\xFCr die F\xE4higkeit, dich schnell wieder zu fokussieren", "F\xFCr mehr Kraft", "F\xFCr schnellere Sprints"], correct: 0, explanation: "Die F\xE4higkeit, den Fokus zur\xFCckzuholen, ist genau das, was du im Tor st\xE4ndig brauchst." }
    ]
  },
  {
    id: "f8",
    group: "fokus",
    name: "Gedanken-Check: 'Alles h\xE4ngt von diesem Ball ab'",
    desc: "Den Druck-Gedanken aufl\xF6sen, der vor wichtigen Momenten oft hochkommt",
    type: "reps",
    reps: "Journal",
    icon: Brain,
    kind: "belief",
    noQuiz: true,
    prompts: ["Welcher Gedanke kommt dir vor einem wichtigen Ball manchmal in den Kopf?", "Stimmt das wirklich zu 100%? Was spricht dagegen?", "Was w\xE4re ein faireres, hilfreicheres Gedanke stattdessen?"]
  },
  // RUHE – weitere Übungen
  {
    id: "r5",
    group: "ruhe",
    name: "Die Wellen kommen und gehen",
    desc: "Deine Gef\xFChle sind wie Wellen am Meer. Manche sind klein und ruhig, manche gro\xDF und wild. Aber jede Welle \u2013 egal wie stark \u2013 kommt irgendwann wieder runter. Du musst sie nicht bek\xE4mpfen, nur reiten, bis sie vorbeizieht.",
    type: "time",
    seconds: 20,
    icon: Wind,
    story: true,
    questions: [
      { q: "Was bedeutet das Bild von den Wellen f\xFCr starke Gef\xFChle wie Nervosit\xE4t oder Wut?", options: ["Auch starke Gef\xFChle gehen von allein wieder vorbei", "Gef\xFChle bleiben f\xFCr immer gleich stark", "Man muss Gef\xFChle sofort bek\xE4mpfen"], correct: 0, explanation: "Wie eine Welle steigt ein Gef\xFChl an und ebbt dann von allein wieder ab, wenn man es zul\xE4sst." },
      { q: "Was bedeutet 'die Welle reiten' statt sie zu bek\xE4mpfen?", options: ["Das Gef\xFChl anerkennen und durchatmen, statt dagegen anzuk\xE4mpfen", "Das Gef\xFChl komplett ignorieren", "Sofort weglaufen"], correct: 0, explanation: "K\xE4mpfen gegen ein Gef\xFChl macht es oft st\xE4rker \u2013 anerkennen und durchatmen hilft mehr." },
      { q: "Wie lange dauert eine intensive emotionale 'Welle' meistens?", options: ["Meist nur wenige Minuten, wenn man sie durchatmen l\xE4sst", "F\xFCr immer", "Mehrere Tage am St\xFCck"], correct: 0, explanation: "Die meisten intensiven Gef\xFChlswellen klingen innerhalb weniger Minuten sp\xFCrbar ab." }
    ]
  },
  {
    id: "r6",
    group: "ruhe",
    name: "Schulter-Nacken-Lockerung",
    desc: "Kurze Lockerung f\xFCr Nacken und Schultern, wo sich Anspannung oft zuerst zeigt",
    type: "steps",
    icon: Activity,
    noQuiz: true,
    steps: [
      { label: "Schultern 5x nach vorne kreisen", seconds: 15 },
      { label: "Schultern 5x nach hinten kreisen", seconds: 15 },
      { label: "Kopf sanft von Seite zu Seite rollen", seconds: 15 }
    ]
  },
  {
    id: "r7",
    group: "ruhe",
    name: "4-7-8 Schlaf-Atmung",
    desc: "4 Sek. einatmen, 7 Sek. halten, 8 Sek. ausatmen \u2013 hilft beim Runterkommen vor dem Schlafen, z.B. vor einem wichtigen Spieltag",
    type: "steps",
    icon: Wind,
    steps: [
      { label: "Einatmen", seconds: 4 },
      { label: "Halten", seconds: 7 },
      { label: "Ausatmen", seconds: 8 },
      { label: "Einatmen", seconds: 4 },
      { label: "Halten", seconds: 7 },
      { label: "Ausatmen", seconds: 8 }
    ],
    questions: [
      { q: "Wof\xFCr eignet sich die 4-7-8-Atmung besonders gut?", options: ["Zum Runterkommen vor dem Schlafen", "F\xFCr maximale Sprintleistung", "F\xFCr schnelle Reaktionen im Spiel"], correct: 0, explanation: "Die l\xE4ngere Ausatmung aktiviert den Entspannungsmodus des K\xF6rpers \u2013 ideal vorm Einschlafen." },
      { q: "Warum ist gute Schlafqualit\xE4t vor einem Spieltag wichtig?", options: ["Erholung beeinflusst Konzentration und Reaktionszeit direkt", "Schlaf hat keinen Einfluss auf sportliche Leistung", "Nur die Ern\xE4hrung z\xE4hlt"], correct: 0, explanation: "Schlafmangel wirkt sich messbar auf Reaktionszeit und Entscheidungsf\xE4higkeit aus." },
      { q: "Was macht die l\xE4ngere Ausatem-Phase mit dem K\xF6rper?", options: ["Sie aktiviert den beruhigenden Teil des Nervensystems besonders stark", "Sie macht wach", "Sie hat keinen besonderen Effekt"], correct: 0, explanation: "Eine verl\xE4ngerte Ausatmung ist einer der effektivsten Wege, den K\xF6rper schnell zu beruhigen." }
    ]
  },
  // VERTRAUEN – weitere Übungen
  {
    id: "s5",
    group: "vertrauen",
    name: "Der gefesselte Elefant",
    desc: "Ein kleiner Elefant wird mit einem d\xFCnnen Seil an einen Pflock gebunden. Er zieht und zieht, ist aber zu schwach, um sich zu befreien. Irgendwann h\xF6rt er auf, es zu versuchen. Jahre sp\xE4ter ist er riesig und stark genug, den Pflock m\xFChelos herauszurei\xDFen \u2013 aber er versucht es nicht mehr. Er glaubt immer noch, dass er es nicht kann.",
    type: "time",
    seconds: 20,
    icon: Brain,
    story: true,
    questions: [
      { q: "Was h\xE4lt den erwachsenen Elefanten wirklich noch fest?", options: ["Nicht das Seil, sondern sein eigener Glaube, es nicht zu schaffen", "Das Seil ist tats\xE4chlich unzerrei\xDFbar", "Der Elefant will absichtlich dort bleiben"], correct: 0, explanation: "Der Elefant ist l\xE4ngst stark genug \u2013 was ihn festh\xE4lt, ist nur noch die alte \xDCberzeugung in seinem Kopf." },
      { q: "Was ist die Botschaft dieser Geschichte f\xFCr dich als Sportler?", options: ["Alte Selbstzweifel stimmen vielleicht heute nicht mehr \u2013 du bist gewachsen", "Man sollte immer bei seinen alten Grenzen bleiben", "Elefanten sind schlauer als Menschen"], correct: 0, explanation: "Was du dir fr\xFCher vielleicht nicht zugetraut hast, kannst du heute vielleicht l\xE4ngst \u2013 probier es nochmal." },
      { q: "Wie nennt man es, wenn jemand sich durch alte, \xFCberholte Gedanken selbst begrenzt?", options: ["Einen limitierenden Glaubenssatz", "Realismus", "Bescheidenheit"], correct: 0, explanation: "Ein limitierender Glaubenssatz ist eine alte \xDCberzeugung, die l\xE4ngst nicht mehr stimmt, aber trotzdem bremst." }
    ]
  },
  {
    id: "s6",
    group: "vertrauen",
    name: "Vergleich mit dir selbst von gestern",
    desc: "Statt dich mit anderen zu vergleichen: Was kannst du heute, das du vor 6 Monaten noch nicht konntest?",
    type: "reps",
    reps: "Journal",
    icon: Trophy,
    kind: "journal",
    noQuiz: true,
    prompts: ["Was kannst du heute besser als vor 6 Monaten?", "Worauf bist du stolz, wenn du zur\xFCckblickst?"]
  },
  {
    id: "s7",
    group: "vertrauen",
    name: "Glaubenssatz aufl\xF6sen: 'Ich bin nicht gut genug'",
    desc: "Ein h\xE4ufiger, oft unfairer Gedanke \u2013 Schritt f\xFCr Schritt neu bewerten",
    type: "reps",
    reps: "Journal",
    icon: Brain,
    kind: "belief",
    noQuiz: true,
    prompts: ["Wann taucht der Gedanke 'Ich bin nicht gut genug' bei dir auf?", "Was spricht dagegen? (Dinge, die du schon gut kannst)", "Wie k\xF6nntest du den Gedanken realistischer und fairer formulieren?"]
  },
  {
    id: "s8",
    group: "vertrauen",
    name: "Meine Prozess-Affirmation",
    desc: "W\xE4hl einen Satz, der sich f\xFCr dich wirklich stimmig anf\xFChlt \u2013 oder schreib deinen eigenen. Wichtig: kein \xFCbertriebener Satz, sondern einer, den du auch wirklich glauben kannst.",
    type: "reps",
    reps: "Affirmation",
    icon: Flame,
    kind: "affirmation",
    noQuiz: true,
    affirmations: [
      "Ich werde besser, wenn ich dranbleibe.",
      "Ich darf Fehler machen und trotzdem stolz auf mich sein.",
      "Ich lerne aus jedem Spiel etwas dazu.",
      "Ich muss nicht perfekt sein, um gut zu sein.",
      "Ich vertraue meiner Vorbereitung."
    ]
  },
  // ROUTINE – weitere Übungen
  {
    id: "ro5",
    group: "routine",
    name: "Die Geschichte vom Holzf\xE4ller",
    desc: "Zwei Holzf\xE4ller wetteifern, wer mehr B\xE4ume f\xE4llt. Der eine arbeitet ohne Pause durch. Der andere legt st\xFCndlich eine kurze Pause ein. Am Abend hat der zweite deutlich mehr geschafft. Sein Geheimnis: 'In meinen Pausen habe ich meine Axt gesch\xE4rft.'",
    type: "time",
    seconds: 15,
    icon: Calendar,
    story: true,
    questions: [
      { q: "Was bedeutet es, 'die Axt zu sch\xE4rfen'?", options: ["Sich bewusst vorzubereiten und zu erholen, statt nur durchzuarbeiten", "St\xE4ndig ohne Pause zu arbeiten", "Ein neues Werkzeug zu kaufen"], correct: 0, explanation: "Vorbereitung und Erholung machen die eigentliche Arbeit danach effektiver." },
      { q: "Was ist deine 'Axt', die du regelm\xE4\xDFig sch\xE4rfen solltest?", options: ["Deine Technik, dein K\xF6rper und dein Kopf durch Training und Erholung", "Nur dein Fu\xDFball", "Nichts, st\xE4ndiges Training reicht"], correct: 0, explanation: "Regelm\xE4\xDFige, bewusste Vorbereitung in allen Bereichen macht dich langfristig st\xE4rker." },
      { q: "Warum hatte der zweite Holzf\xE4ller trotz Pausen mehr geschafft?", options: ["Seine Axt blieb scharf, w\xE4hrend die des anderen stumpf wurde", "Er war einfach st\xE4rker", "Er hatte Gl\xFCck"], correct: 0, explanation: "Kurze, bewusste Pausen zur Vorbereitung erh\xF6hen die Effizienz der eigentlichen Arbeit." }
    ]
  },
  {
    id: "ro6",
    group: "routine",
    name: "Wochenr\xFCckblick",
    desc: "Kurzer R\xFCckblick: Was hat diese Woche im Training/Spiel gut geklappt, was nimmst du dir f\xFCr n\xE4chste Woche vor?",
    type: "reps",
    reps: "Journal",
    icon: Calendar,
    kind: "journal",
    noQuiz: true,
    prompts: ["Was lief diese Woche gut?", "Was willst du n\xE4chste Woche anders/besser machen?"]
  },
  {
    id: "ro7",
    group: "routine",
    name: "Warum kleine Ziele gro\xDFe Ziele m\xF6glich machen",
    desc: "Welches gro\xDFe Ziel hast du \u2013 und was w\xE4re der allererste kleine Schritt dahin?",
    type: "time",
    seconds: 15,
    icon: Target,
    questions: [
      { q: "Warum sind kleine Zwischenziele oft wirksamer als nur ein gro\xDFes Fernziel?", options: ["Sie geben regelm\xE4\xDFig ein Erfolgserlebnis und halten motiviert", "Gro\xDFe Ziele sind unwichtig", "Kleine Ziele bremsen nur"], correct: 0, explanation: "Kleine, erreichbare Schritte sorgen f\xFCr regelm\xE4\xDFige Erfolgserlebnisse auf dem Weg zum gro\xDFen Ziel." },
      { q: "Was passiert oft, wenn man nur ein gro\xDFes, fernes Ziel vor Augen hat?", options: ["Es kann \xFCberw\xE4ltigend wirken und die Motivation sinken lassen", "Man erreicht es automatisch schneller", "Es gibt keine Nachteile"], correct: 0, explanation: "Ein zu gro\xDFes, fernes Ziel ohne Zwischenschritte kann entmutigend wirken." },
      { q: "Was ist ein guter erster Schritt zu einem gro\xDFen Ziel?", options: ["Etwas Kleines, das du diese Woche schon umsetzen kannst", "Sofort das komplette Ziel erreichen wollen", "Warten, bis der perfekte Moment kommt"], correct: 0, explanation: "Ein konkreter, kleiner erster Schritt macht den Anfang leichter und greifbarer." }
    ]
  },
  // FOKUS – Alltagstransfer
  {
    id: "f9",
    group: "fokus",
    name: "Fokus-Trick f\xFCr die Schule",
    desc: "Die gleiche Technik, die dir im Tor hilft, funktioniert auch bei Hausaufgaben oder einer Klassenarbeit: ein fester Startpunkt und eine Sache nach der anderen",
    type: "time",
    seconds: 15,
    icon: Target,
    questions: [
      { q: "Warum funktioniert die gleiche Fokus-Technik im Tor und bei den Hausaufgaben?", options: ["Weil Fokus eine allgemeine F\xE4higkeit ist, die \xFCberall gleich funktioniert", "Weil beides identisch ist", "Fokus-Techniken funktionieren nur im Sport"], correct: 0, explanation: "Konzentration ist eine \xFCbertragbare F\xE4higkeit \u2013 was im Tor hilft, hilft auch am Schreibtisch." },
      { q: "Was ist ein guter fester Startpunkt beim Lernen?", options: ["Handy weglegen, einen Timer stellen, mit der ersten Aufgabe beginnen", "Erstmal 20 Minuten Social Media checken", "Ohne Plan einfach irgendwo anfangen"], correct: 0, explanation: "Ein klarer Startpunkt reduziert die H\xFCrde, \xFCberhaupt loszulegen." },
      { q: "Was hilft, wenn eine Aufgabe \xFCberw\xE4ltigend wirkt?", options: ["Sie in kleinere Teilschritte aufteilen", "Alles auf einmal versuchen", "Aufgeben"], correct: 0, explanation: "Kleine Teilschritte machen gro\xDFe Aufgaben handhabbar \u2013 im Sport wie in der Schule." }
    ]
  },
  {
    id: "f10",
    group: "fokus",
    name: "Ablenkung durchs Handy erkennen",
    desc: "Kurz ehrlich reflektieren: Wann lenkt dich dein Handy am meisten ab \u2013 beim Lernen, vorm Spiel, beim Einschlafen?",
    type: "reps",
    reps: "Journal",
    icon: Eye,
    kind: "journal",
    noQuiz: true,
    prompts: ["Wann lenkt dich dein Handy am meisten ab?", "Was k\xF6nntest du in diesem Moment stattdessen tun?"]
  },
  // RUHE – Alltagstransfer
  {
    id: "r8",
    group: "ruhe",
    name: "Ruhig bleiben bei Streit mit Freunden",
    desc: "Die gleiche Atemtechnik, die vor einem Elfmeter hilft, hilft auch, wenn ein Streit mit einem Freund gerade hochkocht",
    type: "time",
    seconds: 15,
    icon: Wind,
    questions: [
      { q: "Warum hilft eine Atemtechnik nicht nur im Sport, sondern auch bei Streit?", options: ["Weil der K\xF6rper bei Stress immer \xE4hnlich reagiert, egal in welcher Situation", "Weil Streit nichts mit dem K\xF6rper zu tun hat", "Atemtechniken wirken nur beim Sport"], correct: 0, explanation: "Egal ob Elfmeter oder Streit \u2013 der K\xF6rper reagiert mit \xE4hnlicher Anspannung, und ruhiges Atmen wirkt in beiden F\xE4llen." },
      { q: "Was passiert, wenn man in einem Streit sofort impulsiv reagiert?", options: ["Man sagt oft Dinge, die man sp\xE4ter bereut", "Man l\xF6st den Streit garantiert schneller", "Es passiert nichts Besonderes"], correct: 0, explanation: "Ein kurzer Atemzug vor der Reaktion gibt dir die Chance, besonnener zu antworten." },
      { q: "Was ist ein guter erster Schritt, wenn du merkst, dass du w\xFCtend wirst?", options: ["Kurz innehalten und einmal bewusst durchatmen", "Sofort laut werden", "Das Gef\xFChl komplett unterdr\xFCcken"], correct: 0, explanation: "Ein kurzer bewusster Atemzug schafft einen Moment Abstand zwischen Gef\xFChl und Reaktion." }
    ]
  },
  {
    id: "r9",
    group: "ruhe",
    name: "Kurze Pause bei Pr\xFCfungsstress",
    desc: "Ein kurzer Reset, wenn dir vor einer Klassenarbeit der Kopf explodiert",
    type: "steps",
    icon: Brain,
    noQuiz: true,
    steps: [
      { label: "Stift hinlegen, Augen kurz schlie\xDFen", seconds: 10 },
      { label: "3x tief ein- und ausatmen", seconds: 15 },
      { label: "Schultern lockern, dann weitermachen", seconds: 10 }
    ]
  },
  // VERTRAUEN – Spiegel-Übung & Alltagstransfer
  {
    id: "s9",
    group: "vertrauen",
    name: "Spiegel-Moment",
    desc: "Stell dich vor einen Spiegel, schau dir in die Augen und sag dir einen Satz, den du auch einem guten Freund sagen w\xFCrdest. Kein Wettkampf-Gebr\xFCll, sondern ehrliche Freundlichkeit dir selbst gegen\xFCber.",
    type: "reps",
    reps: "Affirmation",
    icon: Flame,
    kind: "affirmation",
    affirmations: [
      "Ich mag dich, auch an einem schlechten Tag.",
      "Du gibst dir M\xFChe, und das z\xE4hlt.",
      "Es ist okay, nicht perfekt zu sein.",
      "Ich bin stolz, wie du dranbleibst."
    ],
    questions: [
      { q: "Warum wirkt es st\xE4rker, sich selbst im Spiegel etwas Freundliches zu sagen, statt es nur zu denken?", options: ["Der Blickkontakt mit sich selbst verst\xE4rkt das Gef\xFChl echter Zuwendung", "Es hat keinen zus\xE4tzlichen Effekt", "Spiegel sind dabei unwichtig"], correct: 0, explanation: "Studien zeigen: Blickkontakt im Spiegel verst\xE4rkt die beruhigende Wirkung freundlicher Selbstgespr\xE4che." },
      { q: "Warum sind S\xE4tze wie 'Ich mag dich, auch an einem schlechten Tag' wirksamer als 'Ich bin der Beste'?", options: ["Sie sind glaubw\xFCrdiger und l\xF6sen keinen inneren Widerspruch aus", "Sie sind einfach k\xFCrzer", "Es gibt keinen Unterschied"], correct: 0, explanation: "Ein Satz, den du wirklich glauben kannst, wirkt \u2013 ein \xFCbertriebener Satz l\xF6st oft nur inneren Widerspruch aus." },
      { q: "Wie oft macht diese \xDCbung am meisten Sinn?", options: ["Regelm\xE4\xDFig, nicht nur an schlechten Tagen", "Nur einmal im Jahr", "Nur wenn andere zuschauen"], correct: 0, explanation: "Wie jede mentale Technik wirkt sie durch Wiederholung \u2013 regelm\xE4\xDFig, nicht nur in der Krise." }
    ]
  },
  {
    id: "s10",
    group: "vertrauen",
    name: "Was andere an dir sch\xE4tzen \u2013 nicht nur im Sport",
    desc: "Denk an Familie, Freunde oder Mitsch\xFCler: Was sch\xE4tzen sie an dir, das nichts mit Fu\xDFball zu tun hat?",
    type: "reps",
    reps: "Journal",
    icon: Trophy,
    kind: "journal",
    noQuiz: true,
    prompts: ["Was sch\xE4tzen Freunde oder Familie an dir?", "Was davon hat gar nichts mit Sport zu tun?"]
  },
  // ROUTINE – konkrete Vor-Training/Vor-Spiel-Rituale
  {
    id: "ro8",
    group: "routine",
    name: "Vor-Training-Check",
    desc: "Eine kurze, feste Abfolge direkt vor dem Training \u2013 gibt Struktur, auch an Tagen ohne viel Motivation",
    type: "steps",
    icon: Calendar,
    noQuiz: true,
    steps: [
      { label: "Ausr\xFCstung bereitlegen (Schuhe, Handschuhe, Trikot)", seconds: 15 },
      { label: "Kurz ankommen: 3x tief durchatmen", seconds: 12 },
      { label: "Ein kleines Ziel f\xFCrs heutige Training setzen", seconds: 15 }
    ]
  },
  {
    id: "ro9",
    group: "routine",
    name: "Vor-Spiel-Ritual in 3 Schritten",
    desc: "Eine kompakte Routine f\xFCr die letzten Minuten vor dem Anpfiff \u2013 K\xF6rper, dann Kopf, dann bereit",
    type: "steps",
    icon: Calendar,
    steps: [
      { label: "K\xF6rper aktivieren: kurz bewegen und dehnen", seconds: 20 },
      { label: "Kopf fokussieren: Atmung oder Fokus-Anker", seconds: 20 },
      { label: "Ein Wort oder einen Satz f\xFCrs Spiel w\xE4hlen", seconds: 15 }
    ],
    questions: [
      { q: "Warum kommt bei diesem Ritual erst der K\xF6rper, dann der Kopf?", options: ["K\xF6rperliche Aktivierung bereitet auch den Kopf auf Bereitschaft vor", "Die Reihenfolge spielt keine Rolle", "Der Kopf sollte immer zuerst kommen"], correct: 0, explanation: "Ein aktivierter K\xF6rper unterst\xFCtzt einen fokussierten, bereiten Kopf." },
      { q: "Warum ein festes Ritual statt jedes Mal spontan etwas anderes zu machen?", options: ["Ein bekannter Ablauf gibt Sicherheit, besonders unter Druck", "Spontanit\xE4t ist immer besser", "Rituale sind nur Aberglaube"], correct: 0, explanation: "Ein vertrauter Ablauf reduziert Nervosit\xE4t, weil der Kopf wei\xDF, was als N\xE4chstes kommt." },
      { q: "Was, wenn vor dem Spiel keine Zeit f\xFCr das volle Ritual ist?", options: ["Auch eine verk\xFCrzte Version ist besser als gar keine", "Dann lieber ganz weglassen", "Ohne Ritual ist man automatisch schlechter"], correct: 0, explanation: "Selbst eine kurze Version des Rituals gibt dir einen Anker \u2013 Flexibilit\xE4t ist wichtiger als Perfektion." }
    ]
  }
];
var MENTAL_BY_ID = Object.fromEntries(MENTAL_LIBRARY.map((e) => [e.id, e]));
var SPEED_PHASE = {
  sp1: "aktivierung",
  sp2: "technik",
  sp3: "technik",
  sp7: "technik",
  sp11: "technik",
  sp12: "technik",
  sp4: "sprungkraft",
  sp8: "sprungkraft",
  sp5: "topspeed",
  sp9: "topspeed",
  sp10: "topspeed",
  sp19: "topspeed",
  sp20: "topspeed",
  sp6: "richtungswechsel",
  sp13: "richtungswechsel",
  sp14: "richtungswechsel",
  sp15: "richtungswechsel",
  sp16: "richtungswechsel",
  sp17: "richtungswechsel",
  sp18: "richtungswechsel"
};
var SPEED_PHASE_ORDER = ["aktivierung", "technik", "sprungkraft", "topspeed", "richtungswechsel"];
var SPEED_PHASE_LABEL = { aktivierung: "Aktivierung", technik: "Technik", sprungkraft: "Sprungkraft", topspeed: "Tempo", richtungswechsel: "Richtungswechsel" };
var ATHLETIK_TYPE = {
  at1: "balance",
  at15: "balance",
  at28: "balance",
  at2: "rumpf",
  at3: "rumpf",
  at6: "rumpf",
  at7: "rumpf",
  at19: "rumpf",
  at20: "rumpf",
  at21: "rumpf",
  at29: "rumpf",
  at8: "kraft",
  at9: "kraft",
  at10: "kraft",
  at11: "kraft",
  at12: "kraft",
  at13: "kraft",
  at14: "kraft",
  at22: "kraft",
  at23: "kraft",
  at16: "sprungkraft",
  at17: "sprungkraft",
  at18: "sprungkraft",
  at25: "sprungkraft",
  at26: "sprungkraft",
  at27: "sprungkraft",
  at31: "sprungkraft",
  at32: "sprungkraft",
  at33: "sprungkraft",
  at34: "sprungkraft",
  at35: "sprungkraft",
  at4: "landung",
  at30: "landung",
  at5: "fallschule",
  at24: "fallschule"
};
var ATHLETIK_TYPE_ORDER = ["balance", "rumpf", "kraft", "sprungkraft", "landung", "fallschule"];
var ATHLETIK_TYPE_LABEL = { balance: "Balance", rumpf: "Rumpf", kraft: "Kraft", sprungkraft: "Sprungkraft", landung: "Landung", fallschule: "Fallschule" };
var DEHNEN_META = {
  de1: { dyn: true, region: "h\xFCfte" },
  de2: { dyn: false, region: "wade" },
  de3: { dyn: false, region: "oberschenkel" },
  de4: { dyn: true, region: "rumpf" },
  de5: { dyn: false, region: "leiste" },
  de6: { dyn: true, region: "h\xFCfte" },
  de7: { dyn: true, region: "h\xFCfte" },
  de8: { dyn: false, region: "schulter" },
  de9: { dyn: true, region: "sprunggelenk" },
  de10: { dyn: false, region: "rumpf" },
  de11: { dyn: false, region: "oberschenkel" },
  de12: { dyn: false, region: "ges\xE4\xDF" },
  de13: { dyn: false, region: "nacken" },
  de14: { dyn: false, region: "handgelenk" },
  de15: { dyn: false, region: "arm" },
  de16: { dyn: false, region: "brust" },
  de17: { dyn: false, region: "rumpf" },
  de18: { dyn: true, region: "h\xFCfte" },
  de19: { dyn: true, region: "h\xFCfte" },
  de20: { dyn: true, region: "ganzk\xF6rper" },
  de21: { dyn: true, region: "ganzk\xF6rper" },
  de22: { dyn: false, region: "leiste" },
  de23: { dyn: false, region: "r\xFCcken" },
  de24: { dyn: false, region: "wade" },
  de25: { dyn: true, region: "schulter" }
};
var SESSION_LENGTHS = {
  kurz: {
    label: "Kurz",
    sub: "~5 Min",
    speed: { aktivierung: 1, technik: 1, sprungkraft: 0, topspeed: 1, richtungswechsel: 0 },
    athletik: { balance: 1, rumpf: 1, kraft: 1, sprungkraft: 0, landung: 0, fallschule: 0 },
    dehnenCount: 3
  },
  standard: {
    label: "Standard",
    sub: "~10 Min",
    speed: { aktivierung: 1, technik: 2, sprungkraft: 1, topspeed: 1, richtungswechsel: 0 },
    athletik: { balance: 1, rumpf: 2, kraft: 1, sprungkraft: 1, landung: 0, fallschule: 0 },
    dehnenCount: 5
  },
  lang: {
    label: "Lang",
    sub: "~15 Min",
    speed: { aktivierung: 1, technik: 2, sprungkraft: 1, topspeed: 1, richtungswechsel: 1 },
    athletik: { balance: 1, rumpf: 2, kraft: 2, sprungkraft: 1, landung: 1, fallschule: 0 },
    dehnenCount: 6
  }
};
function generatePhaseSession(phaseMap, order, lengthCfg) {
  const result = [];
  order.forEach((phase) => {
    const count = lengthCfg[phase] || 0;
    if (count > 0) {
      const idsInPhase = Object.entries(phaseMap).filter(([, p]) => p === phase).map(([id]) => id);
      shuffleArray(idsInPhase).slice(0, count).forEach((id) => result.push(EXERCISE_BY_ID[id]));
    }
  });
  return result;
}
function generateSpeedSession(lengthKey) {
  return generatePhaseSession(SPEED_PHASE, SPEED_PHASE_ORDER, SESSION_LENGTHS[lengthKey].speed);
}
function generateAthletikSession(lengthKey) {
  return generatePhaseSession(ATHLETIK_TYPE, ATHLETIK_TYPE_ORDER, SESSION_LENGTHS[lengthKey].athletik);
}
function generateDehnenSession(lengthKey, mode) {
  const count = SESSION_LENGTHS[lengthKey].dehnenCount;
  const wantDynamic = mode === "warmup";
  const pool = Object.entries(DEHNEN_META).filter(([, meta]) => meta.dyn === wantDynamic).map(([id]) => id);
  const byRegion = {};
  pool.forEach((id) => {
    const r = DEHNEN_META[id].region;
    byRegion[r] = byRegion[r] || [];
    byRegion[r].push(id);
  });
  const regions = shuffleArray(Object.keys(byRegion));
  let chosen = [];
  for (const r of regions) {
    if (chosen.length >= count) break;
    const options = byRegion[r];
    chosen.push(options[Math.floor(Math.random() * options.length)]);
  }
  if (chosen.length < count) {
    const remaining = shuffleArray(pool.filter((id) => !chosen.includes(id)));
    chosen = chosen.concat(remaining.slice(0, count - chosen.length));
  }
  return chosen.map((id) => EXERCISE_BY_ID[id]);
}
var SESSION_BONUS_XP = 30;
var MENTAL_SESSION_LENGTHS = {
  kurz: { label: "Kurz", sub: "2 \xDCbungen", count: 2 },
  standard: { label: "Standard", sub: "3 \xDCbungen", count: 3 },
  lang: { label: "Lang", sub: "4 \xDCbungen", count: 4 }
};
function generateMentalSession(lengthKey) {
  const count = MENTAL_SESSION_LENGTHS[lengthKey].count;
  const groups = shuffleArray(Object.keys(MENTAL_GROUPS));
  const chosen = [];
  let gi = 0;
  let safety = 0;
  while (chosen.length < count && safety < 30) {
    const group = groups[gi % groups.length];
    const candidates = MENTAL_LIBRARY.filter((e) => e.group === group && !chosen.includes(e));
    if (candidates.length > 0) {
      chosen.push(candidates[Math.floor(Math.random() * candidates.length)]);
    }
    gi++;
    safety++;
  }
  return chosen;
}
var GENERAL_QUESTIONS = {
  speed: [
    { q: "Was macht laut modernen Speedcoaches eher schnell im Duell: viel Grundlagenausdauer oder ein hoher Maximal-Speed?", options: ["Ein hoher Maximal-Speed, weil du dann weniger % deiner Kraft brauchst, um zu gewinnen", "Nur Grundlagenausdauer", "Beides spielt keine Rolle"], correct: 0, explanation: "Mit h\xF6herem Max Speed reicht dir ein geringerer Prozentsatz deiner Kraft, um im Duell zu gewinnen \u2013 das spart Energie f\xFCrs restliche Spiel." },
    { q: "Warum passieren viele Verletzungen beim maximalen Sprinten?", options: ["Weil Athleten selten auf echtes Maximaltempo vorbereitet werden", "Weil Sprinten grunds\xE4tzlich gef\xE4hrlich ist", "Weil man zu langsam l\xE4uft"], correct: 0, explanation: "Wenn du nie wirklich Vollgas trainierst, ist dein K\xF6rper darauf nicht vorbereitet \u2013 das erh\xF6ht das Verletzungsrisiko im Ernstfall." },
    { q: "Wodurch wird Schnelligkeit laut Sportwissenschaft eher begrenzt?", options: ["Mehr durch koordinative F\xE4higkeiten als durch reine Kondition", "Nur durch Muskelmasse", "Nur durch Ausdauer"], correct: 0, explanation: "Schnelligkeit ist vor allem eine koordinative F\xE4higkeit \u2013 ein sauberes Bewegungsmuster schl\xE4gt reine Kraft." },
    { q: "Wie coacht man Sprinttechnik bei jungen Sportlern am effektivsten?", options: ["Mit einfachen Bildern und Gef\xFChls-Hinweisen statt komplizierten Gelenkwinkeln", "Mit exakten Gradzahlen f\xFCr jeden Gelenkwinkel", "Gar nicht coachen, kommt von allein"], correct: 0, explanation: "Einfache Bilder wie 'den Boden aktiv greifen' funktionieren bei jungen Athleten oft besser als technische Detailanweisungen." },
    { q: "Warum reicht normales Training oft nicht, um echtes Maximaltempo zu erreichen?", options: ["Weil in Spielformen und \xDCbungen selten wirklich volles Tempo gefordert wird", "Weil Training immer zu intensiv ist", "Weil Pausen fehlen"], correct: 0, explanation: "Im normalen Training und in Spielformen wird selten wirklich maximal gesprintet \u2013 daf\xFCr braucht es gezielte Einheiten." },
    { q: "Wie sollte der Belastungsaufbau nach einer Verletzung beim Sprinttraining aussehen?", options: ["Schrittweise und strukturiert", "Sofort wieder Vollgas", "Sprinten danach ganz vermeiden"], correct: 0, explanation: "Ein strukturierter, schrittweiser Aufbau bereitet den K\xF6rper wieder sicher auf maximale Belastung vor." },
    { q: "Was geh\xF6rt zu einer sinnvollen Struktur eines Speedtrainings?", options: ["Aktivierung, Technikdrills, Sprungtraining, dann echte Sprints", "Nur so schnell wie m\xF6glich loslaufen", "Nur Dehnen"], correct: 0, explanation: "Eine sinnvolle Reihenfolge bereitet K\xF6rper und Nervensystem stufenweise auf die h\xF6chste Belastung vor." },
    { q: "Warum ist eine kurze, aktive Bodenkontaktzeit beim Sprinten wichtig?", options: ["Sie erzeugt mehr Geschwindigkeit als lange Bodenkontakte", "Lange Bodenkontakte machen schneller", "Spielt keine Rolle"], correct: 0, explanation: "Je k\xFCrzer und aktiver der Bodenkontakt, desto mehr Kraft kannst du effizient in Vorw\xE4rtsbewegung umsetzen." }
  ],
  dehnen: [
    { q: "Wann ist dynamisches Dehnen sinnvoller als statisches?", options: ["Vor dem Training zum Aufw\xE4rmen", "Nie sinnvoll", "Nur beim Schlafen"], correct: 0, explanation: "Dynamisches Dehnen aktiviert die Muskulatur \u2013 ideal vor dem Training." },
    { q: "Wann ist langes, statisches Dehnen sinnvoller?", options: ["Nach dem Training zur Entspannung", "Direkt vor dem Sprint", "Nie"], correct: 0, explanation: "Langes Halten entspannt die Muskulatur \u2013 passt gut nach dem Training." },
    { q: "Was passiert bei zu starkem Dehnen?", options: ["Man wird sofort viel flexibler", "Verletzungsrisiko durch \xDCberdehnung", "Gar nichts"], correct: 1, explanation: "Zu starkes Ziehen kann Muskelfasern reizen oder verletzen \u2013 sanft bleiben." },
    { q: "Wie f\xFChlt sich richtiges Dehnen an?", options: ["Leichtes Ziehen, kein Schmerz", "Starker, stechender Schmerz", "Gar nichts sp\xFCren"], correct: 0, explanation: "Ein leichtes Ziehen zeigt, dass die Dehnung wirkt \u2013 Schmerz ist ein Warnsignal." },
    { q: "Warum ist Beweglichkeit f\xFCr einen Torwart wichtig?", options: ["F\xFCr gr\xF6\xDFere Reichweite bei Paraden", "Spielt keine Rolle", "Nur f\xFCrs Aussehen"], correct: 0, explanation: "Bewegliche H\xFCften und Beine erm\xF6glichen weitere Spr\xFCnge und Streckungen." },
    { q: "Was verbessert regelm\xE4\xDFiges Dehnen langfristig?", options: ["Beweglichkeit und Verletzungsvorbeugung", "Maximalkraft", "Sprintgeschwindigkeit direkt"], correct: 0, explanation: "Der Hauptnutzen von Dehnen ist mehr Beweglichkeit und weniger Verletzungsrisiko." },
    { q: "Wie oft pro Woche sollte man mobilisieren oder dehnen?", options: ["Nie", "Regelm\xE4\xDFig, idealerweise nach jedem Training", "Nur einmal im Jahr"], correct: 1, explanation: "Regelm\xE4\xDFigkeit bringt hier den gr\xF6\xDFten Effekt." },
    { q: "Was ist Mobilisation im Unterschied zu Dehnen?", options: ["Bewegliches Bewegen der Gelenke durch den vollen Radius", "Nur langes stilles Halten", "Krafttraining"], correct: 0, explanation: "Mobilisation bewegt Gelenke aktiv durch ihren Bewegungsradius, Dehnen h\xE4lt eine Position." }
  ],
  athletik: [
    { q: "Was ist der Hauptzweck von Athletik-\xDCbungen f\xFCr einen Torwart?", options: ["Verletzungen vorbeugen und K\xF6rperkontrolle verbessern", "Nur Muskeln aufbauen", "Schneller im Sprint werden"], correct: 0, explanation: "Athletik-\xDCbungen sch\xFCtzen den K\xF6rper und verbessern die Kontrolle \xFCber eigene Bewegungen." },
    { q: "Warum trainiert man Rumpfstabilit\xE4t?", options: ["Als Basis f\xFCr fast jede sportliche Bewegung", "Nur f\xFCr den Waschbrettbauch", "Spielt keine Rolle im Fu\xDFball"], correct: 0, explanation: "Ein stabiler Rumpf ist die Basis, von der aus Arme und Beine kraftvoll arbeiten k\xF6nnen." },
    { q: "Was passiert bei schwacher Rumpfmuskulatur?", options: ["H\xF6heres Verletzungsrisiko im unteren R\xFCcken", "Nichts Besonderes", "Man wird automatisch schneller"], correct: 0, explanation: "Ein schwacher Rumpf \xFCberlastet oft den unteren R\xFCcken bei Belastung." },
    { q: "Warum ist Balance-Training wichtig f\xFCr Verletzungspr\xE4vention?", options: ["Es schult die Reaktion der Muskeln bei ungewohnten Bewegungen", "Spielt keine Rolle", "Nur f\xFCr \xE4ltere Sportler"], correct: 0, explanation: "Gut trainierte Balance hilft dem K\xF6rper, sich bei pl\xF6tzlichen Belastungen schnell zu stabilisieren." },
    { q: "Wie oft sollte man Athletik-\xDCbungen einbauen?", options: ["2\u20133x pro Woche als festen Bestandteil", "Nie n\xF6tig", "Nur bei Verletzung"], correct: 0, explanation: "Regelm\xE4\xDFige, kurze Einheiten bringen mehr als seltenes intensives Training." },
    { q: "Was unterscheidet Athletiktraining von reinem Krafttraining?", options: ["Fokus auf K\xF6rperkontrolle, Balance und funktionelle Bewegungen", "Es ist komplett identisch", "Es braucht immer Gewichte"], correct: 0, explanation: "Athletiktraining verbindet Kraft mit Kontrolle, Balance und Koordination." },
    { q: "Warum sind diese \xDCbungen oft ohne Ball?", options: ["Damit man sich auf K\xF6rperkontrolle statt Technik konzentriert", "Weil B\xE4lle zu teuer sind", "Ohne besonderen Grund"], correct: 0, explanation: "Ohne Ball kannst du dich voll auf saubere Bewegungsmuster und Stabilit\xE4t konzentrieren." },
    { q: "Was ist ein gutes Zeichen f\xFCr Fortschritt bei Athletik-\xDCbungen?", options: ["\xDCbungen f\xFChlen sich mit der Zeit kontrollierter und stabiler an", "Man wird sofort viel schwerer", "Nichts ver\xE4ndert sich je"], correct: 0, explanation: "Mehr Kontrolle und Stabilit\xE4t \xFCber Zeit zeigt echten Fortschritt." }
  ]
};
var POSE_MAP = {
  sp1: "legswing",
  sp2: "kneedrive",
  sp3: "walldrill",
  sp4: "pogo",
  sp5: "sprint",
  sp6: "readycrouch",
  sp7: "kneedrive",
  sp8: "bounding",
  sp9: "fallstart",
  sp10: "resistedstart",
  sp11: "buttkicks",
  sp12: "kneedrive",
  sp13: "shuttle",
  sp14: "decelaccel",
  sp15: "lateralshuffle",
  sp16: "backpedal",
  sp17: "cut45",
  sp18: "landing",
  sp19: "sprint",
  sp20: "readycrouch",
  de1: "legswing2",
  de2: "calfstretch",
  de3: "quadstretch",
  de4: "catcow",
  de5: "adductor",
  de6: "lungerotation",
  de7: "legpendulum",
  de8: "shoulder",
  de9: "anklemobil",
  de10: "trunktwist",
  de11: "hamstring",
  de12: "piriformis",
  de13: "necktilt",
  de14: "wriststretch",
  de15: "triceps",
  de16: "chestopen",
  de17: "sidebend",
  de18: "frontswing",
  de19: "deeplunge",
  de20: "inchworm",
  de21: "worldsgreatest",
  de22: "frog",
  de23: "kneetochest",
  de24: "achilles",
  de25: "armcircles",
  at1: "balance",
  at2: "plank",
  at3: "sideplank",
  at4: "landing",
  at5: "roll",
  at6: "backextension",
  at7: "birddog",
  at8: "bridge",
  at9: "bridge",
  at10: "wallsit",
  at11: "reverselunge",
  at12: "laterallunge",
  at13: "pausedsquat",
  at14: "pausedsquat",
  at15: "singlelegdeadlift",
  at16: "lateralhop",
  at17: "skaterjump",
  at18: "jumpingjack",
  at19: "rotationthrow",
  at20: "coredrawin",
  at21: "deadbug",
  at22: "ytw",
  at23: "pushupcontrol",
  at24: "forwardroll",
  at25: "squatjump",
  at26: "singlelegbroadjump",
  at27: "lateralhop",
  at28: "balance",
  at29: "sideplank",
  at30: "landing",
  at31: "squatjump",
  at32: "pausedsquat",
  at33: "landing",
  at34: "jumpingjack",
  at35: "pogo"
};
function StickFigure({ pose, color }) {
  const p = { fill: "none", stroke: color, strokeWidth: 5, strokeLinecap: "round", strokeLinejoin: "round" };
  const ground = /* @__PURE__ */ jsx("line", { x1: "12", y1: "94", x2: "88", y2: "94", stroke: color, strokeWidth: "2", strokeDasharray: "3 4", opacity: "0.35" });
  const head = (cx, cy) => /* @__PURE__ */ jsx("circle", { cx, cy, r: "7", fill: "none", stroke: color, strokeWidth: "4" });
  switch (pose) {
    case "legswing":
      return /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 100 100", width: "76", height: "76", children: [
        ground,
        head(46, 20),
        /* @__PURE__ */ jsx("line", { x1: "46", y1: "27", x2: "48", y2: "56", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "48", y1: "56", x2: "38", y2: "93", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "48", y1: "56", x2: "72", y2: "42", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "46", y1: "34", x2: "30", y2: "46", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "46", y1: "34", x2: "60", y2: "50", ...p })
      ] });
    case "kneedrive":
      return /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 100 100", width: "76", height: "76", children: [
        ground,
        head(48, 18),
        /* @__PURE__ */ jsx("line", { x1: "48", y1: "25", x2: "46", y2: "55", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "46", y1: "55", x2: "38", y2: "94", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "46", y1: "55", x2: "60", y2: "42", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "60", y1: "42", x2: "55", y2: "60", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "48", y1: "32", x2: "64", y2: "24", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "48", y1: "32", x2: "30", y2: "45", ...p })
      ] });
    case "walldrill":
      return /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 100 100", width: "76", height: "76", children: [
        ground,
        /* @__PURE__ */ jsx("line", { x1: "82", y1: "10", x2: "82", y2: "94", stroke: color, strokeWidth: "3", opacity: "0.4" }),
        head(38, 24),
        /* @__PURE__ */ jsx("line", { x1: "38", y1: "31", x2: "48", y2: "58", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "48", y1: "58", x2: "40", y2: "93", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "48", y1: "58", x2: "63", y2: "45", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "63", y1: "45", x2: "58", y2: "62", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "42", y1: "36", x2: "80", y2: "20", ...p })
      ] });
    case "pogo":
      return /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 100 100", width: "76", height: "76", children: [
        ground,
        head(50, 26),
        /* @__PURE__ */ jsx("line", { x1: "50", y1: "33", x2: "50", y2: "58", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "50", y1: "58", x2: "40", y2: "80", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "50", y1: "58", x2: "60", y2: "80", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "50", y1: "40", x2: "34", y2: "30", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "50", y1: "40", x2: "66", y2: "30", ...p }),
        /* @__PURE__ */ jsx("path", { d: "M 30 60 L 25 50 M 25 50 L 30 52 M 25 50 L 20 54", ...p, strokeWidth: "3" }),
        /* @__PURE__ */ jsx("path", { d: "M 70 60 L 75 50 M 75 50 L 70 52 M 75 50 L 80 54", ...p, strokeWidth: "3" })
      ] });
    case "sprint":
      return /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 100 100", width: "76", height: "76", children: [
        ground,
        head(34, 24),
        /* @__PURE__ */ jsx("line", { x1: "34", y1: "31", x2: "48", y2: "56", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "48", y1: "56", x2: "66", y2: "88", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "48", y1: "56", x2: "34", y2: "70", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "34", y1: "70", x2: "42", y2: "90", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "40", y1: "38", x2: "58", y2: "30", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "40", y1: "38", x2: "24", y2: "52", ...p })
      ] });
    case "readycrouch":
      return /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 100 100", width: "76", height: "76", children: [
        ground,
        head(44, 34),
        /* @__PURE__ */ jsx("line", { x1: "44", y1: "41", x2: "48", y2: "62", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "48", y1: "62", x2: "36", y2: "86", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "48", y1: "62", x2: "64", y2: "80", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "44", y1: "48", x2: "30", y2: "62", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "44", y1: "48", x2: "58", y2: "42", ...p })
      ] });
    case "legswing2":
      return /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 100 100", width: "76", height: "76", children: [
        ground,
        head(50, 18),
        /* @__PURE__ */ jsx("line", { x1: "50", y1: "25", x2: "50", y2: "55", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "50", y1: "55", x2: "42", y2: "93", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "50", y1: "55", x2: "66", y2: "70", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "50", y1: "32", x2: "36", y2: "42", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "50", y1: "32", x2: "64", y2: "42", ...p })
      ] });
    case "calfstretch":
      return /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 100 100", width: "76", height: "76", children: [
        ground,
        /* @__PURE__ */ jsx("line", { x1: "70", y1: "10", x2: "70", y2: "94", stroke: color, strokeWidth: "3", opacity: "0.3" }),
        head(30, 24),
        /* @__PURE__ */ jsx("line", { x1: "30", y1: "31", x2: "42", y2: "55", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "42", y1: "55", x2: "66", y2: "93", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "42", y1: "55", x2: "20", y2: "80", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "20", y1: "80", x2: "14", y2: "94", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "34", y1: "38", x2: "68", y2: "22", ...p })
      ] });
    case "quadstretch":
      return /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 100 100", width: "76", height: "76", children: [
        ground,
        head(48, 18),
        /* @__PURE__ */ jsx("line", { x1: "48", y1: "25", x2: "48", y2: "55", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "48", y1: "55", x2: "42", y2: "93", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "48", y1: "55", x2: "60", y2: "65", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "60", y1: "65", x2: "52", y2: "48", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "48", y1: "32", x2: "34", y2: "40", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "48", y1: "32", x2: "55", y2: "46", ...p })
      ] });
    case "catcow":
      return /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 100 100", width: "76", height: "76", children: [
        ground,
        head(78, 42),
        /* @__PURE__ */ jsx("path", { d: "M 71 46 Q 45 30 24 60", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "24", y1: "60", x2: "20", y2: "90", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "24", y1: "60", x2: "30", y2: "90", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "65", y1: "52", x2: "60", y2: "90", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "65", y1: "52", x2: "72", y2: "90", ...p })
      ] });
    case "adductor":
      return /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 100 100", width: "76", height: "76", children: [
        ground,
        head(38, 22),
        /* @__PURE__ */ jsx("line", { x1: "38", y1: "29", x2: "42", y2: "56", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "42", y1: "56", x2: "24", y2: "70", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "24", y1: "70", x2: "30", y2: "90", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "42", y1: "56", x2: "70", y2: "90", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "38", y1: "36", x2: "24", y2: "44", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "38", y1: "36", x2: "52", y2: "44", ...p })
      ] });
    case "lungerotation":
      return /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 100 100", width: "76", height: "76", children: [
        ground,
        head(46, 22),
        /* @__PURE__ */ jsx("line", { x1: "46", y1: "29", x2: "50", y2: "54", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "50", y1: "54", x2: "34", y2: "70", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "34", y1: "70", x2: "40", y2: "92", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "50", y1: "54", x2: "66", y2: "66", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "66", y1: "66", x2: "60", y2: "92", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "46", y1: "34", x2: "70", y2: "22", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "46", y1: "34", x2: "66", y2: "44", ...p })
      ] });
    case "legpendulum":
      return /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 100 100", width: "76", height: "76", children: [
        ground,
        head(40, 20),
        /* @__PURE__ */ jsx("line", { x1: "40", y1: "27", x2: "42", y2: "58", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "42", y1: "58", x2: "40", y2: "93", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "42", y1: "58", x2: "72", y2: "46", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "40", y1: "34", x2: "26", y2: "42", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "40", y1: "34", x2: "52", y2: "44", ...p }),
        /* @__PURE__ */ jsx("path", { d: "M 74 40 Q 80 46 74 52", fill: "none", stroke: color, strokeWidth: "2.5", opacity: "0.5" })
      ] });
    case "shoulder":
      return /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 100 100", width: "76", height: "76", children: [
        ground,
        head(50, 18),
        /* @__PURE__ */ jsx("line", { x1: "50", y1: "25", x2: "50", y2: "60", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "50", y1: "60", x2: "42", y2: "93", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "50", y1: "60", x2: "58", y2: "93", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "50", y1: "30", x2: "72", y2: "38", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "72", y1: "38", x2: "52", y2: "44", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "50", y1: "34", x2: "38", y2: "30", ...p })
      ] });
    case "anklemobil":
      return /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 100 100", width: "76", height: "76", children: [
        ground,
        head(48, 20),
        /* @__PURE__ */ jsx("line", { x1: "48", y1: "27", x2: "48", y2: "58", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "48", y1: "58", x2: "40", y2: "86", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "48", y1: "58", x2: "58", y2: "70", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "48", y1: "34", x2: "34", y2: "44", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "48", y1: "34", x2: "62", y2: "44", ...p }),
        /* @__PURE__ */ jsx("path", { d: "M 58 78 a 8 6 0 1 1 -0.1 0", fill: "none", stroke: color, strokeWidth: "3", strokeDasharray: "3 3" })
      ] });
    case "trunktwist":
      return /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 100 100", width: "76", height: "76", children: [
        ground,
        head(18, 50),
        /* @__PURE__ */ jsx("line", { x1: "25", y1: "50", x2: "60", y2: "50", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "45", y1: "50", x2: "45", y2: "30", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "45", y1: "50", x2: "45", y2: "70", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "60", y1: "50", x2: "78", y2: "66", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "60", y1: "50", x2: "80", y2: "38", ...p })
      ] });
    case "hamstring":
      return /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 100 100", width: "76", height: "76", children: [
        ground,
        head(30, 60),
        /* @__PURE__ */ jsx("line", { x1: "30", y1: "67", x2: "55", y2: "80", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "55", y1: "80", x2: "90", y2: "80", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "55", y1: "80", x2: "30", y2: "90", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "30", y1: "70", x2: "50", y2: "55", ...p })
      ] });
    case "piriformis":
      return /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 100 100", width: "76", height: "76", children: [
        ground,
        head(24, 46),
        /* @__PURE__ */ jsx("line", { x1: "28", y1: "48", x2: "55", y2: "55", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "55", y1: "55", x2: "80", y2: "45", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "55", y1: "55", x2: "70", y2: "72", ...p }),
        /* @__PURE__ */ jsx("path", { d: "M 55 55 L 82 62 L 68 78 Z", ...p, strokeWidth: "4" })
      ] });
    case "necktilt":
      return /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 100 100", width: "76", height: "76", children: [
        ground,
        head(56, 22),
        /* @__PURE__ */ jsx("line", { x1: "50", y1: "28", x2: "46", y2: "55", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "46", y1: "55", x2: "40", y2: "93", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "46", y1: "55", x2: "52", y2: "93", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "46", y1: "34", x2: "60", y2: "42", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "46", y1: "34", x2: "34", y2: "44", ...p })
      ] });
    case "wriststretch":
      return /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 100 100", width: "76", height: "76", children: [
        ground,
        head(30, 20),
        /* @__PURE__ */ jsx("line", { x1: "30", y1: "27", x2: "34", y2: "55", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "34", y1: "55", x2: "26", y2: "93", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "34", y1: "55", x2: "42", y2: "93", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "32", y1: "32", x2: "75", y2: "38", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "70", y1: "30", x2: "80", y2: "42", ...p, strokeWidth: "3" })
      ] });
    case "triceps":
      return /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 100 100", width: "76", height: "76", children: [
        ground,
        head(46, 18),
        /* @__PURE__ */ jsx("line", { x1: "46", y1: "25", x2: "46", y2: "58", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "46", y1: "58", x2: "38", y2: "93", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "46", y1: "58", x2: "54", y2: "93", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "48", y1: "24", x2: "62", y2: "10", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "62", y1: "10", x2: "58", y2: "28", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "46", y1: "32", x2: "34", y2: "38", ...p })
      ] });
    case "chestopen":
      return /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 100 100", width: "76", height: "76", children: [
        ground,
        head(50, 20),
        /* @__PURE__ */ jsx("line", { x1: "50", y1: "27", x2: "50", y2: "58", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "50", y1: "58", x2: "42", y2: "93", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "50", y1: "58", x2: "58", y2: "93", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "48", y1: "34", x2: "24", y2: "26", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "52", y1: "34", x2: "76", y2: "26", ...p })
      ] });
    case "sidebend":
      return /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 100 100", width: "76", height: "76", children: [
        ground,
        head(60, 20),
        /* @__PURE__ */ jsx("path", { d: "M 58 27 Q 45 55 48 60", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "48", y1: "60", x2: "40", y2: "93", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "48", y1: "60", x2: "58", y2: "93", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "58", y1: "24", x2: "82", y2: "12", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "48", y1: "40", x2: "32", y2: "50", ...p })
      ] });
    case "frontswing":
      return /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 100 100", width: "76", height: "76", children: [
        ground,
        head(44, 20),
        /* @__PURE__ */ jsx("line", { x1: "44", y1: "27", x2: "46", y2: "56", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "46", y1: "56", x2: "42", y2: "93", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "46", y1: "56", x2: "70", y2: "60", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "44", y1: "34", x2: "30", y2: "42", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "44", y1: "34", x2: "56", y2: "44", ...p })
      ] });
    case "deeplunge":
      return /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 100 100", width: "76", height: "76", children: [
        ground,
        head(46, 16),
        /* @__PURE__ */ jsx("line", { x1: "46", y1: "23", x2: "48", y2: "52", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "48", y1: "52", x2: "30", y2: "68", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "30", y1: "68", x2: "36", y2: "92", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "48", y1: "52", x2: "66", y2: "64", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "66", y1: "64", x2: "60", y2: "92", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "46", y1: "22", x2: "34", y2: "6", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "46", y1: "22", x2: "58", y2: "6", ...p })
      ] });
    case "inchworm":
      return /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 100 100", width: "76", height: "76", children: [
        ground,
        head(85, 60),
        /* @__PURE__ */ jsx("line", { x1: "78", y1: "62", x2: "20", y2: "70", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "20", y1: "70", x2: "16", y2: "90", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "55", y1: "66", x2: "52", y2: "90", ...p }),
        /* @__PURE__ */ jsx("path", { d: "M 30 74 L 24 84 M 40 76 L 34 86", ...p, strokeWidth: "3", opacity: "0.6" })
      ] });
    case "worldsgreatest":
      return /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 100 100", width: "76", height: "76", children: [
        ground,
        head(38, 24),
        /* @__PURE__ */ jsx("line", { x1: "38", y1: "31", x2: "44", y2: "54", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "44", y1: "54", x2: "30", y2: "68", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "30", y1: "68", x2: "34", y2: "92", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "44", y1: "54", x2: "60", y2: "62", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "60", y1: "62", x2: "56", y2: "92", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "40", y1: "36", x2: "28", y2: "52", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "40", y1: "36", x2: "66", y2: "16", ...p })
      ] });
    case "frog":
      return /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 100 100", width: "76", height: "76", children: [
        ground,
        head(50, 30),
        /* @__PURE__ */ jsx("line", { x1: "50", y1: "37", x2: "50", y2: "58", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "50", y1: "58", x2: "22", y2: "88", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "50", y1: "58", x2: "78", y2: "88", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "50", y1: "42", x2: "36", y2: "52", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "50", y1: "42", x2: "64", y2: "52", ...p })
      ] });
    case "kneetochest":
      return /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 100 100", width: "76", height: "76", children: [
        ground,
        head(16, 56),
        /* @__PURE__ */ jsx("line", { x1: "23", y1: "56", x2: "55", y2: "56", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "55", y1: "56", x2: "80", y2: "56", ...p }),
        /* @__PURE__ */ jsx("path", { d: "M 55 56 L 40 40 L 30 44", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "35", y1: "42", x2: "24", y2: "34", ...p, strokeWidth: "3" })
      ] });
    case "achilles":
      return /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 100 100", width: "76", height: "76", children: [
        ground,
        /* @__PURE__ */ jsx("line", { x1: "70", y1: "10", x2: "70", y2: "94", stroke: color, strokeWidth: "3", opacity: "0.3" }),
        head(30, 24),
        /* @__PURE__ */ jsx("line", { x1: "30", y1: "31", x2: "42", y2: "55", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "42", y1: "55", x2: "66", y2: "80", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "66", y1: "80", x2: "60", y2: "93", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "42", y1: "55", x2: "22", y2: "76", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "22", y1: "76", x2: "16", y2: "93", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "34", y1: "38", x2: "68", y2: "22", ...p })
      ] });
    case "armcircles":
      return /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 100 100", width: "76", height: "76", children: [
        ground,
        head(50, 22),
        /* @__PURE__ */ jsx("line", { x1: "50", y1: "29", x2: "50", y2: "60", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "50", y1: "60", x2: "42", y2: "93", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "50", y1: "60", x2: "58", y2: "93", ...p }),
        /* @__PURE__ */ jsx("path", { d: "M 50 34 a 16 16 0 1 1 -0.1 0", fill: "none", stroke: color, strokeWidth: "4", strokeLinecap: "round", strokeDasharray: "6 5" })
      ] });
    case "bounding":
      return /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 100 100", width: "76", height: "76", children: [
        ground,
        head(30, 20),
        /* @__PURE__ */ jsx("line", { x1: "30", y1: "27", x2: "42", y2: "48", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "42", y1: "48", x2: "70", y2: "30", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "42", y1: "48", x2: "30", y2: "80", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "30", y1: "80", x2: "42", y2: "93", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "36", y1: "34", x2: "20", y2: "44", ...p })
      ] });
    case "fallstart":
      return /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 100 100", width: "76", height: "76", children: [
        ground,
        head(30, 26),
        /* @__PURE__ */ jsx("line", { x1: "30", y1: "33", x2: "46", y2: "60", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "46", y1: "60", x2: "30", y2: "93", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "46", y1: "60", x2: "70", y2: "70", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "32", y1: "38", x2: "46", y2: "30", ...p })
      ] });
    case "resistedstart":
      return /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 100 100", width: "76", height: "76", children: [
        ground,
        head(28, 30),
        /* @__PURE__ */ jsx("line", { x1: "28", y1: "37", x2: "42", y2: "58", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "42", y1: "58", x2: "30", y2: "90", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "42", y1: "58", x2: "58", y2: "76", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "32", y1: "42", x2: "55", y2: "46", ...p, strokeWidth: "3", opacity: "0.7" }),
        /* @__PURE__ */ jsx("line", { x1: "55", y1: "46", x2: "80", y2: "42", ...p, strokeDasharray: "4 4", opacity: "0.5" })
      ] });
    case "buttkicks":
      return /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 100 100", width: "76", height: "76", children: [
        ground,
        head(46, 18),
        /* @__PURE__ */ jsx("line", { x1: "46", y1: "25", x2: "46", y2: "55", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "46", y1: "55", x2: "38", y2: "80", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "38", y1: "80", x2: "46", y2: "60", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "46", y1: "55", x2: "58", y2: "90", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "46", y1: "32", x2: "34", y2: "42", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "46", y1: "32", x2: "58", y2: "40", ...p })
      ] });
    case "shuttle":
      return /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 100 100", width: "76", height: "76", children: [
        ground,
        head(50, 26),
        /* @__PURE__ */ jsx("line", { x1: "50", y1: "33", x2: "50", y2: "58", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "50", y1: "58", x2: "38", y2: "90", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "50", y1: "58", x2: "62", y2: "90", ...p }),
        /* @__PURE__ */ jsx("path", { d: "M 20 26 L 30 26 M 24 22 L 30 26 L 24 30", ...p, strokeWidth: "3" }),
        /* @__PURE__ */ jsx("path", { d: "M 80 26 L 70 26 M 76 22 L 70 26 L 76 30", ...p, strokeWidth: "3" })
      ] });
    case "decelaccel":
      return /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 100 100", width: "76", height: "76", children: [
        ground,
        head(44, 30),
        /* @__PURE__ */ jsx("line", { x1: "44", y1: "37", x2: "48", y2: "58", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "48", y1: "58", x2: "30", y2: "76", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "48", y1: "58", x2: "60", y2: "80", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "44", y1: "42", x2: "60", y2: "34", ...p }),
        /* @__PURE__ */ jsx("path", { d: "M 68 30 L 78 24 M 78 24 L 76 30 M 78 24 L 72 22", ...p, strokeWidth: "3" })
      ] });
    case "lateralshuffle":
      return /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 100 100", width: "76", height: "76", children: [
        ground,
        head(44, 30),
        /* @__PURE__ */ jsx("line", { x1: "44", y1: "37", x2: "46", y2: "58", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "46", y1: "58", x2: "34", y2: "90", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "46", y1: "58", x2: "60", y2: "88", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "44", y1: "42", x2: "30", y2: "46", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "44", y1: "42", x2: "56", y2: "36", ...p }),
        /* @__PURE__ */ jsx("path", { d: "M 66 40 L 76 40 M 72 36 L 76 40 L 72 44", ...p, strokeWidth: "3" })
      ] });
    case "backpedal":
      return /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 100 100", width: "76", height: "76", children: [
        ground,
        head(50, 26),
        /* @__PURE__ */ jsx("line", { x1: "50", y1: "33", x2: "50", y2: "58", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "50", y1: "58", x2: "38", y2: "86", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "50", y1: "58", x2: "60", y2: "88", ...p }),
        /* @__PURE__ */ jsx("path", { d: "M 24 26 a 14 14 0 1 0 14 -14", fill: "none", stroke: color, strokeWidth: "3", strokeDasharray: "4 3" }),
        /* @__PURE__ */ jsx("path", { d: "M 38 12 L 38 18 L 32 16", ...p, strokeWidth: "3" })
      ] });
    case "cut45":
      return /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 100 100", width: "76", height: "76", children: [
        ground,
        head(30, 26),
        /* @__PURE__ */ jsx("line", { x1: "30", y1: "33", x2: "44", y2: "56", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "44", y1: "56", x2: "30", y2: "76", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "44", y1: "56", x2: "72", y2: "84", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "34", y1: "38", x2: "50", y2: "30", ...p }),
        /* @__PURE__ */ jsx("path", { d: "M 60 70 L 74 80 M 70 78 L 74 80 L 70 84", ...p, strokeWidth: "3" })
      ] });
    case "backextension":
      return /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 100 100", width: "76", height: "76", children: [
        ground,
        head(18, 68),
        /* @__PURE__ */ jsx("path", { d: "M 24 66 Q 50 50 76 40", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "24", y1: "66", x2: "10", y2: "78", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "70", y1: "42", x2: "88", y2: "30", ...p })
      ] });
    case "birddog":
      return /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 100 100", width: "76", height: "76", children: [
        ground,
        head(78, 44),
        /* @__PURE__ */ jsx("path", { d: "M 71 48 Q 45 32 30 55", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "30", y1: "55", x2: "10", y2: "48", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "30", y1: "55", x2: "26", y2: "90", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "62", y1: "52", x2: "58", y2: "90", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "65", y1: "50", x2: "86", y2: "66", ...p })
      ] });
    case "bridge":
      return /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 100 100", width: "76", height: "76", children: [
        ground,
        head(15, 78),
        /* @__PURE__ */ jsx("line", { x1: "22", y1: "78", x2: "55", y2: "60", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "55", y1: "60", x2: "80", y2: "78", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "55", y1: "60", x2: "52", y2: "88", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "80", y1: "78", x2: "80", y2: "90", ...p })
      ] });
    case "wallsit":
      return /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 100 100", width: "76", height: "76", children: [
        ground,
        /* @__PURE__ */ jsx("line", { x1: "82", y1: "10", x2: "82", y2: "94", stroke: color, strokeWidth: "3", opacity: "0.4" }),
        head(58, 28),
        /* @__PURE__ */ jsx("line", { x1: "58", y1: "35", x2: "58", y2: "58", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "58", y1: "58", x2: "34", y2: "58", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "34", y1: "58", x2: "34", y2: "90", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "58", y1: "35", x2: "78", y2: "30", ...p })
      ] });
    case "reverselunge":
      return /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 100 100", width: "76", height: "76", children: [
        ground,
        head(46, 18),
        /* @__PURE__ */ jsx("line", { x1: "46", y1: "25", x2: "48", y2: "54", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "48", y1: "54", x2: "42", y2: "90", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "48", y1: "54", x2: "70", y2: "66", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "70", y1: "66", x2: "76", y2: "90", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "46", y1: "32", x2: "34", y2: "40", ...p })
      ] });
    case "laterallunge":
      return /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 100 100", width: "76", height: "76", children: [
        ground,
        head(58, 20),
        /* @__PURE__ */ jsx("line", { x1: "58", y1: "27", x2: "52", y2: "52", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "52", y1: "52", x2: "30", y2: "70", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "30", y1: "70", x2: "24", y2: "90", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "52", y1: "52", x2: "78", y2: "90", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "56", y1: "30", x2: "42", y2: "36", ...p })
      ] });
    case "pausedsquat":
      return /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 100 100", width: "76", height: "76", children: [
        ground,
        head(50, 34),
        /* @__PURE__ */ jsx("line", { x1: "50", y1: "41", x2: "50", y2: "60", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "50", y1: "60", x2: "34", y2: "66", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "34", y1: "66", x2: "36", y2: "90", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "50", y1: "60", x2: "66", y2: "66", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "66", y1: "66", x2: "64", y2: "90", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "50", y1: "46", x2: "36", y2: "52", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "50", y1: "46", x2: "64", y2: "52", ...p })
      ] });
    case "singlelegdeadlift":
      return /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 100 100", width: "76", height: "76", children: [
        ground,
        head(20, 52),
        /* @__PURE__ */ jsx("line", { x1: "26", y1: "52", x2: "60", y2: "52", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "60", y1: "52", x2: "88", y2: "42", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "42", y1: "52", x2: "38", y2: "88", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "30", y1: "46", x2: "20", y2: "34", ...p })
      ] });
    case "lateralhop":
      return /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 100 100", width: "76", height: "76", children: [
        ground,
        head(50, 26),
        /* @__PURE__ */ jsx("line", { x1: "50", y1: "33", x2: "50", y2: "58", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "50", y1: "58", x2: "38", y2: "80", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "50", y1: "58", x2: "62", y2: "80", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "20", y1: "94", x2: "20", y2: "76", stroke: color, strokeWidth: "2", strokeDasharray: "3 3", opacity: "0.5" }),
        /* @__PURE__ */ jsx("path", { d: "M 34 44 L 26 44 M 30 40 L 26 44 L 30 48", ...p, strokeWidth: "3" })
      ] });
    case "skaterjump":
      return /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 100 100", width: "76", height: "76", children: [
        ground,
        head(60, 24),
        /* @__PURE__ */ jsx("line", { x1: "58", y1: "31", x2: "50", y2: "56", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "50", y1: "56", x2: "40", y2: "90", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "50", y1: "56", x2: "26", y2: "66", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "56", y1: "36", x2: "72", y2: "30", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "56", y1: "36", x2: "42", y2: "26", ...p })
      ] });
    case "jumpingjack":
      return /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 100 100", width: "76", height: "76", children: [
        ground,
        head(50, 20),
        /* @__PURE__ */ jsx("line", { x1: "50", y1: "27", x2: "50", y2: "58", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "50", y1: "58", x2: "30", y2: "90", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "50", y1: "58", x2: "70", y2: "90", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "50", y1: "32", x2: "24", y2: "14", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "50", y1: "32", x2: "76", y2: "14", ...p })
      ] });
    case "rotationthrow":
      return /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 100 100", width: "76", height: "76", children: [
        ground,
        head(50, 20),
        /* @__PURE__ */ jsx("line", { x1: "50", y1: "27", x2: "50", y2: "58", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "50", y1: "58", x2: "42", y2: "93", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "50", y1: "58", x2: "58", y2: "93", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "50", y1: "34", x2: "76", y2: "44", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "50", y1: "34", x2: "66", y2: "18", ...p })
      ] });
    case "coredrawin":
      return /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 100 100", width: "76", height: "76", children: [
        ground,
        head(50, 18),
        /* @__PURE__ */ jsx("line", { x1: "50", y1: "25", x2: "50", y2: "58", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "50", y1: "58", x2: "42", y2: "93", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "50", y1: "58", x2: "58", y2: "93", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "50", y1: "32", x2: "38", y2: "40", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "50", y1: "32", x2: "62", y2: "40", ...p }),
        /* @__PURE__ */ jsx("circle", { cx: "50", cy: "46", r: "5", fill: "none", stroke: color, strokeWidth: "2.5", strokeDasharray: "2 2" })
      ] });
    case "deadbug":
      return /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 100 100", width: "76", height: "76", children: [
        ground,
        head(18, 60),
        /* @__PURE__ */ jsx("line", { x1: "25", y1: "60", x2: "60", y2: "60", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "40", y1: "60", x2: "34", y2: "38", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "34", y1: "38", x2: "42", y2: "26", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "52", y1: "60", x2: "70", y2: "76", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "70", y1: "76", x2: "82", y2: "82", ...p })
      ] });
    case "ytw":
      return /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 100 100", width: "76", height: "76", children: [
        ground,
        head(80, 42),
        /* @__PURE__ */ jsx("line", { x1: "73", y1: "46", x2: "20", y2: "56", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "20", y1: "56", x2: "14", y2: "90", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "55", y1: "52", x2: "52", y2: "90", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "65", y1: "48", x2: "86", y2: "20", ...p })
      ] });
    case "pushupcontrol":
      return /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 100 100", width: "76", height: "76", children: [
        ground,
        head(85, 68),
        /* @__PURE__ */ jsx("line", { x1: "78", y1: "70", x2: "20", y2: "76", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "20", y1: "76", x2: "16", y2: "90", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "58", y1: "72", x2: "55", y2: "90", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "45", y1: "74", x2: "45", y2: "58", ...p, strokeWidth: "3", opacity: "0.5" })
      ] });
    case "forwardroll":
      return /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 100 100", width: "76", height: "76", children: [
        ground,
        /* @__PURE__ */ jsx(
          "path",
          {
            d: "M 50 30 a 22 22 0 1 1 -0.1 0",
            fill: "none",
            stroke: color,
            strokeWidth: "5",
            strokeLinecap: "round",
            strokeDasharray: "8 7"
          }
        ),
        /* @__PURE__ */ jsx("path", { d: "M 60 12 L 68 8 M 68 8 L 66 14 M 68 8 L 62 6", ...p, strokeWidth: "3" })
      ] });
    case "squatjump":
      return /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 100 100", width: "76", height: "76", children: [
        ground,
        head(50, 20),
        /* @__PURE__ */ jsx("line", { x1: "50", y1: "27", x2: "50", y2: "55", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "50", y1: "55", x2: "38", y2: "78", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "50", y1: "55", x2: "62", y2: "78", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "50", y1: "32", x2: "34", y2: "22", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "50", y1: "32", x2: "66", y2: "22", ...p }),
        /* @__PURE__ */ jsx("path", { d: "M 26 60 L 22 50 M 74 60 L 78 50", ...p, strokeWidth: "3", opacity: "0.6" })
      ] });
    case "singlelegbroadjump":
      return /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 100 100", width: "76", height: "76", children: [
        ground,
        head(24, 30),
        /* @__PURE__ */ jsx("line", { x1: "24", y1: "37", x2: "40", y2: "56", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "40", y1: "56", x2: "70", y2: "70", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "40", y1: "56", x2: "30", y2: "72", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "26", y1: "40", x2: "42", y2: "34", ...p }),
        /* @__PURE__ */ jsx("path", { d: "M 46 82 L 78 82", stroke: color, strokeWidth: "2", strokeDasharray: "3 3", opacity: "0.4" })
      ] });
    case "balance":
      return /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 100 100", width: "76", height: "76", children: [
        ground,
        head(50, 18),
        /* @__PURE__ */ jsx("line", { x1: "50", y1: "25", x2: "50", y2: "58", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "50", y1: "58", x2: "46", y2: "93", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "50", y1: "58", x2: "62", y2: "66", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "62", y1: "66", x2: "58", y2: "52", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "50", y1: "34", x2: "32", y2: "26", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "50", y1: "34", x2: "68", y2: "26", ...p })
      ] });
    case "plank":
      return /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 100 100", width: "76", height: "76", children: [
        ground,
        head(85, 62),
        /* @__PURE__ */ jsx("line", { x1: "78", y1: "64", x2: "20", y2: "72", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "20", y1: "72", x2: "14", y2: "90", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "60", y1: "68", x2: "55", y2: "90", ...p })
      ] });
    case "sideplank":
      return /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 100 100", width: "76", height: "76", children: [
        ground,
        head(82, 40),
        /* @__PURE__ */ jsx("line", { x1: "76", y1: "44", x2: "24", y2: "70", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "24", y1: "70", x2: "18", y2: "90", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "55", y1: "58", x2: "50", y2: "90", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "60", y1: "52", x2: "60", y2: "30", ...p })
      ] });
    case "landing":
      return /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 100 100", width: "76", height: "76", children: [
        ground,
        head(50, 34),
        /* @__PURE__ */ jsx("line", { x1: "50", y1: "41", x2: "50", y2: "62", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "50", y1: "62", x2: "38", y2: "88", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "50", y1: "62", x2: "62", y2: "88", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "50", y1: "46", x2: "36", y2: "56", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "50", y1: "46", x2: "64", y2: "56", ...p }),
        /* @__PURE__ */ jsx("path", { d: "M 30 30 L 22 20 M 70 30 L 78 20", ...p, strokeWidth: "3", opacity: "0.6" })
      ] });
    case "roll":
      return /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 100 100", width: "76", height: "76", children: [
        ground,
        /* @__PURE__ */ jsx(
          "path",
          {
            d: "M 50 30 a 22 22 0 1 1 -0.1 0",
            fill: "none",
            stroke: color,
            strokeWidth: "5",
            strokeLinecap: "round",
            strokeDasharray: "8 7"
          }
        ),
        /* @__PURE__ */ jsx("path", { d: "M 68 22 L 75 18 M 75 18 L 74 24 M 75 18 L 69 17", ...p, strokeWidth: "3" })
      ] });
    default:
      return /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 100 100", width: "76", height: "76", children: [
        ground,
        head(50, 22),
        /* @__PURE__ */ jsx("line", { x1: "50", y1: "29", x2: "50", y2: "60", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "50", y1: "60", x2: "40", y2: "93", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "50", y1: "60", x2: "60", y2: "93", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "50", y1: "36", x2: "35", y2: "48", ...p }),
        /* @__PURE__ */ jsx("line", { x1: "50", y1: "36", x2: "65", y2: "48", ...p })
      ] });
  }
}
function shuffleOptions(options, correctIndex) {
  const arr = options.map((text, i) => ({ text, correct: i === correctIndex }));
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
function shuffleArray(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
var questionQueues = {};
function pickNextQuestion(exercise) {
  if (!questionQueues[exercise.id] || questionQueues[exercise.id].length === 0) {
    const pool = [...exercise.questions, ...GENERAL_QUESTIONS[exercise.group] || []];
    questionQueues[exercise.id] = shuffleArray(pool);
  }
  const q = questionQueues[exercise.id].pop();
  return { q: q.q, explanation: q.explanation, options: shuffleOptions(q.options, q.correct) };
}
function levelFromXp(xp) {
  return Math.floor(xp / 120) + 1;
}
function xpIntoLevel(xp) {
  return xp % 120;
}
function uid() {
  return Math.random().toString(36).slice(2, 10);
}
function todayStr() {
  const d = /* @__PURE__ */ new Date();
  return d.toISOString().slice(0, 10);
}
var firebaseConfig = {
  apiKey: "AIzaSyCVQrTvnUmkIkkP-nqJ7s6pjRak8uERFvk",
  authDomain: "trainiq-f4310.firebaseapp.com",
  databaseURL: "https://trainiq-f4310-default-rtdb.firebaseio.com",
  projectId: "trainiq-f4310",
  storageBucket: "trainiq-f4310.firebasestorage.app",
  messagingSenderId: "109392055406",
  appId: "1:109392055406:web:c913da287e88b3dd712a7f"
};
var fbApp = initializeApp(firebaseConfig);
var db = getDatabase(fbApp);
async function storageGet(key, shared) {
  try {
    const snap = await get(ref(db, `matchform/${key}`));
    return snap.exists() ? snap.val() : null;
  } catch (e) {
    return null;
  }
}
async function storageSet(key, value, shared) {
  try {
    await set(ref(db, `matchform/${key}`), value);
  } catch (e) {
    console.error("storage set failed", e);
  }
}
async function storageDelete(key, shared) {
  try {
    await remove(ref(db, `matchform/${key}`));
  } catch (e) {
  }
}
var DEFAULT_PROFILES = {
  elio: { id: "elio", name: "Elio", role: "spieler", xp: 0, streak: 0, lastDone: null, badges: [] }
};
function App() {
  const [profiles, setProfiles] = useState(DEFAULT_PROFILES);
  const [entries, setEntries] = useState([]);
  const [videoLinks, setVideoLinks] = useState({});
  const [reflectionData, setReflectionData] = useState({});
  const [activeProfileId, setActiveProfileId] = useState(null);
  const [tab, setTab] = useState("start");
  const [loading, setLoading] = useState(true);
  const [showAddPerson, setShowAddPerson] = useState(false);
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [activeExercise, setActiveExercise] = useState(null);
  const [sessionQueue, setSessionQueue] = useState(null);
  const [sessionIndex, setSessionIndex] = useState(0);
  const [sessionSummary, setSessionSummary] = useState(null);
  const [unlockedProfiles, setUnlockedProfiles] = useState({});
  const loadAll = useCallback(async () => {
    setLoading(true);
    const p = await storageGet("profiles", true);
    const e = await storageGet("entries", true);
    const v = await storageGet("videoLinks", true);
    const r = await storageGet("reflectionData", true);
    if (p) setProfiles(p);
    else await storageSet("profiles", DEFAULT_PROFILES, true);
    if (e) setEntries(e);
    if (v) setVideoLinks(v);
    if (r) setReflectionData(r);
    setLoading(false);
  }, []);
  useEffect(() => {
    loadAll();
  }, [loadAll]);
  const saveVideoLink = async (exerciseId, url) => {
    const next = { ...videoLinks, [exerciseId]: url };
    setVideoLinks(next);
    await storageSet("videoLinks", next, true);
  };
  const saveReflection = async (profileId, exerciseId, date, data) => {
    const key = `${profileId}__${exerciseId}__${date}`;
    const next = { ...reflectionData, [key]: data };
    setReflectionData(next);
    await storageSet("reflectionData", next, true);
  };
  const saveProfilePin = async (profileId, pin) => {
    const next = { ...profiles, [profileId]: { ...profiles[profileId], pin: pin || null } };
    await saveProfiles(next);
    setUnlockedProfiles((prev) => ({ ...prev, [profileId]: true }));
  };
  const resetProfileProgress = async (profileId) => {
    const p = profiles[profileId];
    if (!p) return;
    const next = {
      ...profiles,
      [profileId]: { ...p, xp: 0, streak: 0, lastDone: null, badges: [], exercisesDone: {} }
    };
    await saveProfiles(next);
  };
  const resetEntireApp = async () => {
    try {
      await storageDelete("profiles", true);
    } catch (e) {
    }
    try {
      await storageDelete("entries", true);
    } catch (e) {
    }
    try {
      await storageDelete("videoLinks", true);
    } catch (e) {
    }
    try {
      await storageDelete("reflectionData", true);
    } catch (e) {
    }
    await storageSet("profiles", {}, true);
    setProfiles({});
    setEntries([]);
    setVideoLinks({});
    setReflectionData({});
    setUnlockedProfiles({});
    setSessionQueue(null);
    setSessionIndex(0);
    setSessionSummary(null);
    setActiveExercise(null);
    setActiveProfileId(null);
  };
  const saveProfiles = async (next) => {
    setProfiles(next);
    await storageSet("profiles", next, true);
  };
  const saveEntries = async (next) => {
    setEntries(next);
    await storageSet("entries", next, true);
  };
  const activeProfile = activeProfileId ? profiles[activeProfileId] : null;
  const addProfile = async (name, role, pin) => {
    const id = uid();
    const next = { ...profiles, [id]: { id, name, role, pin: pin || null, xp: 0, streak: 0, lastDone: null, badges: [] } };
    await saveProfiles(next);
    setActiveProfileId(id);
    setShowAddPerson(false);
  };
  const addEntry = async (title, category, date, assignedTo) => {
    const next = [...entries, { id: uid(), title, category, date, assignedTo, done: false }];
    await saveEntries(next);
    setShowAddEntry(false);
  };
  const toggleEntry = async (entryId) => {
    const entry = entries.find((e) => e.id === entryId);
    if (!entry) return;
    const wasDone = entry.done;
    const nextEntries = entries.map((e) => e.id === entryId ? { ...e, done: !e.done } : e);
    await saveEntries(nextEntries);
    if (!wasDone && entry.assignedTo && profiles[entry.assignedTo]) {
      const prof = profiles[entry.assignedTo];
      const today = todayStr();
      const yesterday = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
      let streak = prof.streak || 0;
      if (prof.lastDone === yesterday) streak += 1;
      else if (prof.lastDone !== today) streak = 1;
      const newXp = (prof.xp || 0) + XP_PER_TASK;
      const badges = [...prof.badges || []];
      if (streak === 3 && !badges.includes("3-tage")) badges.push("3-tage");
      if (streak === 7 && !badges.includes("7-tage")) badges.push("7-tage");
      if (levelFromXp(newXp) > levelFromXp(prof.xp || 0) && !badges.includes(`level-${levelFromXp(newXp)}`)) {
        badges.push(`level-${levelFromXp(newXp)}`);
      }
      const nextProfiles = {
        ...profiles,
        [entry.assignedTo]: { ...prof, xp: newXp, streak, lastDone: today, badges }
      };
      await saveProfiles(nextProfiles);
    }
  };
  const startSession = (queue) => {
    if (!queue || queue.length === 0) return;
    setSessionQueue(queue);
    setSessionIndex(0);
    setActiveExercise(queue[0]);
  };
  const cancelSession = () => {
    setSessionQueue(null);
    setSessionIndex(0);
    setActiveExercise(null);
  };
  const advanceOrEndSession = (earnedXp) => {
    const nextIndex = sessionIndex + 1;
    if (sessionQueue && nextIndex < sessionQueue.length) {
      setSessionIndex(nextIndex);
      setActiveExercise(sessionQueue[nextIndex]);
    } else if (sessionQueue) {
      setSessionSummary({ count: sessionQueue.length, xp: earnedXp });
      setSessionQueue(null);
      setSessionIndex(0);
      setActiveExercise(null);
    } else {
      setActiveExercise(null);
    }
  };
  const completeExercise = async (exerciseId) => {
    if (!activeProfileId || !profiles[activeProfileId]) return;
    const prof = profiles[activeProfileId];
    const today = todayStr();
    const doneMap = prof.exercisesDone || {};
    const doneToday = doneMap[today] || [];
    if (doneToday.includes(exerciseId)) {
      advanceOrEndSession(0);
      return;
    }
    const yesterday = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
    let streak = prof.streak || 0;
    if (prof.lastDone === yesterday) streak += 1;
    else if (prof.lastDone !== today) streak = 1;
    const newXp = (prof.xp || 0) + XP_PER_EXERCISE;
    const badges = [...prof.badges || []];
    if (streak === 3 && !badges.includes("3-tage")) badges.push("3-tage");
    if (streak === 7 && !badges.includes("7-tage")) badges.push("7-tage");
    if (levelFromXp(newXp) > levelFromXp(prof.xp || 0) && !badges.includes(`level-${levelFromXp(newXp)}`)) {
      badges.push(`level-${levelFromXp(newXp)}`);
    }
    const nextProfiles = {
      ...profiles,
      [activeProfileId]: {
        ...prof,
        xp: newXp,
        streak,
        lastDone: today,
        badges,
        exercisesDone: { ...doneMap, [today]: [...doneToday, exerciseId] }
      }
    };
    await saveProfiles(nextProfiles);
    if (sessionQueue && sessionIndex + 1 >= sessionQueue.length) {
      const bonusXp = XP_PER_EXERCISE + SESSION_BONUS_XP;
      const bonusProfiles = {
        ...nextProfiles,
        [activeProfileId]: { ...nextProfiles[activeProfileId], xp: newXp + SESSION_BONUS_XP }
      };
      await saveProfiles(bonusProfiles);
      advanceOrEndSession(sessionQueue.length * XP_PER_EXERCISE + SESSION_BONUS_XP);
    } else {
      advanceOrEndSession(XP_PER_EXERCISE);
    }
  };
  if (loading) {
    return /* @__PURE__ */ jsx("div", { style: styles.loadingScreen, children: /* @__PURE__ */ jsx("div", { style: styles.loadingRing }) });
  }
  if (!activeProfileId) {
    return /* @__PURE__ */ jsx(
      ProfilePicker,
      {
        profiles,
        onPick: setActiveProfileId,
        onAdd: () => setShowAddPerson(true),
        showAddPerson,
        onCloseAdd: () => setShowAddPerson(false),
        onSubmitAdd: addProfile
      }
    );
  }
  const todayEntries = entries.filter((e) => e.date === todayStr());
  const myTodayEntries = todayEntries.filter((e) => e.assignedTo === activeProfileId);
  return /* @__PURE__ */ jsxs("div", { style: styles.app, children: [
    /* @__PURE__ */ jsx(
      TopBar,
      {
        profile: activeProfile,
        onSwitch: () => {
          setUnlockedProfiles({});
          setActiveProfileId(null);
        },
        onSetPin: (pin) => saveProfilePin(activeProfileId, pin),
        isUnlocked: !!unlockedProfiles[activeProfileId]
      }
    ),
    /* @__PURE__ */ jsxs("div", { style: styles.content, children: [
      tab === "start" && /* @__PURE__ */ jsx(
        StartTab,
        {
          profile: activeProfile,
          myTodayEntries,
          onToggle: toggleEntry,
          onGoCalendar: () => setTab("kalender")
        }
      ),
      tab === "kalender" && /* @__PURE__ */ jsx(
        KalenderTab,
        {
          entries,
          profiles,
          activeProfileId,
          onToggle: toggleEntry,
          onAddClick: () => setShowAddEntry(true)
        }
      ),
      tab === "sport" && /* @__PURE__ */ jsx(
        SportTab,
        {
          profile: activeProfile,
          onStartExercise: setActiveExercise,
          onStartSession: startSession
        }
      ),
      tab === "mental" && /* @__PURE__ */ jsx(MentalTab, { profile: activeProfile, onStartExercise: setActiveExercise, onStartSession: startSession }),
      tab === "team" && /* @__PURE__ */ jsx(TeamTab, { profiles, onReset: resetProfileProgress, onResetAll: resetEntireApp })
    ] }),
    activeExercise && /* @__PURE__ */ jsx(
      ExerciseQuiz,
      {
        exercise: activeExercise,
        videoUrl: videoLinks[activeExercise.id] || "",
        canEditVideo: activeProfile.role !== "spieler",
        onSaveVideo: (url) => saveVideoLink(activeExercise.id, url),
        onClose: sessionQueue ? cancelSession : () => setActiveExercise(null),
        onComplete: () => completeExercise(activeExercise.id),
        sessionProgress: sessionQueue ? { current: sessionIndex + 1, total: sessionQueue.length } : null,
        reflectionValue: reflectionData[`${activeProfileId}__${activeExercise.id}__${todayStr()}`] || null,
        onSaveReflection: (data) => saveReflection(activeProfileId, activeExercise.id, todayStr(), data),
        profilePin: activeProfile.pin || null,
        isUnlocked: !!unlockedProfiles[activeProfileId],
        onUnlock: () => setUnlockedProfiles((prev) => ({ ...prev, [activeProfileId]: true }))
      },
      activeExercise.id + (sessionQueue ? `-${sessionIndex}` : "")
    ),
    sessionSummary && /* @__PURE__ */ jsx(SessionSummaryOverlay, { summary: sessionSummary, onClose: () => setSessionSummary(null) }),
    showAddEntry && /* @__PURE__ */ jsx(
      AddEntryModal,
      {
        profiles,
        defaultAssignee: activeProfileId,
        onClose: () => setShowAddEntry(false),
        onSubmit: addEntry
      }
    ),
    /* @__PURE__ */ jsx(BottomNav, { tab, setTab })
  ] });
}
function ProfilePicker({ profiles, onPick, onAdd, showAddPerson, onCloseAdd, onSubmitAdd }) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("spieler");
  const [pin, setPin] = useState("");
  return /* @__PURE__ */ jsxs("div", { style: styles.pickerScreen, children: [
    /* @__PURE__ */ jsxs("div", { style: styles.pickerHeader, children: [
      /* @__PURE__ */ jsx(Shield, { size: 28, color: "#4F8EFF", strokeWidth: 2.5 }),
      /* @__PURE__ */ jsx("div", { style: styles.pickerTitle, children: "BLAZD" }),
      /* @__PURE__ */ jsx("div", { style: styles.pickerSub, children: "Wer bist du gerade?" })
    ] }),
    /* @__PURE__ */ jsxs("div", { style: styles.pickerList, children: [
      Object.values(profiles).map((p) => /* @__PURE__ */ jsxs("button", { style: styles.pickerCard, onClick: () => onPick(p.id), children: [
        /* @__PURE__ */ jsx("div", { style: styles.pickerAvatar, children: p.name.charAt(0).toUpperCase() }),
        /* @__PURE__ */ jsxs("div", { style: { flex: 1, textAlign: "left" }, children: [
          /* @__PURE__ */ jsx("div", { style: styles.pickerName, children: p.name }),
          /* @__PURE__ */ jsx("div", { style: styles.pickerRole, children: ROLES.find((r) => r.id === p.role)?.label })
        ] }),
        /* @__PURE__ */ jsx(ChevronRight, { size: 20, color: "#666" })
      ] }, p.id)),
      /* @__PURE__ */ jsxs("button", { style: styles.pickerAddCard, onClick: onAdd, children: [
        /* @__PURE__ */ jsx(Plus, { size: 18, color: "#4F8EFF" }),
        /* @__PURE__ */ jsx("span", { children: "Person hinzuf\xFCgen" })
      ] })
    ] }),
    showAddPerson && /* @__PURE__ */ jsx("div", { style: styles.modalOverlay, children: /* @__PURE__ */ jsxs("div", { style: styles.modal, children: [
      /* @__PURE__ */ jsxs("div", { style: styles.modalHeader, children: [
        /* @__PURE__ */ jsx("span", { children: "Neue Person" }),
        /* @__PURE__ */ jsx(X, { size: 20, color: "#888", onClick: onCloseAdd, style: { cursor: "pointer" } })
      ] }),
      /* @__PURE__ */ jsx(
        "input",
        {
          style: styles.input,
          placeholder: "Name",
          value: name,
          onChange: (e) => setName(e.target.value)
        }
      ),
      /* @__PURE__ */ jsx("div", { style: styles.roleRow, children: ROLES.map((r) => /* @__PURE__ */ jsx(
        "button",
        {
          style: { ...styles.roleChip, ...role === r.id ? styles.roleChipActive : {} },
          onClick: () => setRole(r.id),
          children: r.label
        },
        r.id
      )) }),
      /* @__PURE__ */ jsx(
        "input",
        {
          style: styles.input,
          type: "password",
          inputMode: "numeric",
          maxLength: 4,
          placeholder: "Journal-PIN, optional (4 Ziffern)",
          value: pin,
          onChange: (e) => setPin(e.target.value.replace(/\D/g, ""))
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          style: styles.primaryBtn,
          onClick: () => name.trim() && onSubmitAdd(name.trim(), role, pin.length === 4 ? pin : null),
          children: "Anlegen"
        }
      )
    ] }) })
  ] });
}
function TopBar({ profile, onSwitch, onSetPin, isUnlocked }) {
  const [showPinModal, setShowPinModal] = useState(false);
  return /* @__PURE__ */ jsxs("div", { style: styles.topBar, children: [
    /* @__PURE__ */ jsxs("div", { style: styles.topBarLeft, children: [
      /* @__PURE__ */ jsx("div", { style: styles.topAvatar, children: profile.name.charAt(0).toUpperCase() }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("div", { style: styles.topName, children: profile.name }),
        /* @__PURE__ */ jsx("div", { style: styles.topRole, children: ROLES.find((r) => r.id === profile.role)?.label })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 8, alignItems: "center" }, children: [
      /* @__PURE__ */ jsx("button", { style: styles.lockIconBtn, onClick: () => setShowPinModal(true), title: "Journal-PIN verwalten", children: profile.pin ? /* @__PURE__ */ jsx(Lock, { size: 15, color: "#FFD166" }) : /* @__PURE__ */ jsx(Unlock, { size: 15, color: "#666" }) }),
      /* @__PURE__ */ jsx("button", { style: styles.switchBtn, onClick: onSwitch, children: "Wechseln" })
    ] }),
    showPinModal && /* @__PURE__ */ jsx(
      PinManageModal,
      {
        profile,
        onClose: () => setShowPinModal(false),
        onSave: (pin) => {
          onSetPin(pin);
          setShowPinModal(false);
        }
      }
    )
  ] });
}
function PinManageModal({ profile, onClose, onSave }) {
  const [step, setStep] = useState(profile.pin ? "verify" : "set");
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [newPin2, setNewPin2] = useState("");
  const [error, setError] = useState("");
  const handleVerify = () => {
    if (currentPin === profile.pin) {
      setStep("set");
      setError("");
    } else {
      setError("PIN stimmt nicht.");
    }
  };
  const handleSave = () => {
    if (newPin && newPin.length !== 4) {
      setError("PIN muss 4 Ziffern haben.");
      return;
    }
    if (newPin !== newPin2) {
      setError("PINs stimmen nicht \xFCberein.");
      return;
    }
    onSave(newPin || null);
  };
  return /* @__PURE__ */ jsx("div", { style: styles.modalOverlay, children: /* @__PURE__ */ jsxs("div", { style: styles.modal, children: [
    /* @__PURE__ */ jsxs("div", { style: styles.modalHeader, children: [
      /* @__PURE__ */ jsxs("span", { children: [
        "Journal-PIN f\xFCr ",
        profile.name
      ] }),
      /* @__PURE__ */ jsx(X, { size: 20, color: "#888", onClick: onClose, style: { cursor: "pointer" } })
    ] }),
    step === "verify" ? /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("div", { style: styles.journalLabel, children: "Aktuelle PIN eingeben, um sie zu \xE4ndern oder zu entfernen" }),
      /* @__PURE__ */ jsx(
        "input",
        {
          style: styles.input,
          type: "password",
          inputMode: "numeric",
          maxLength: 4,
          placeholder: "\u2022\u2022\u2022\u2022",
          value: currentPin,
          onChange: (e) => setCurrentPin(e.target.value.replace(/\D/g, ""))
        }
      ),
      error && /* @__PURE__ */ jsx("div", { style: styles.pinError, children: error }),
      /* @__PURE__ */ jsx("button", { style: styles.primaryBtn, onClick: handleVerify, children: "Weiter" })
    ] }) : /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("div", { style: styles.journalLabel, children: profile.pin ? "Neue PIN (leer lassen zum Entfernen)" : "4-stellige PIN vergeben (optional)" }),
      /* @__PURE__ */ jsx(
        "input",
        {
          style: { ...styles.input, marginBottom: 10 },
          type: "password",
          inputMode: "numeric",
          maxLength: 4,
          placeholder: "Neue PIN",
          value: newPin,
          onChange: (e) => setNewPin(e.target.value.replace(/\D/g, ""))
        }
      ),
      /* @__PURE__ */ jsx(
        "input",
        {
          style: styles.input,
          type: "password",
          inputMode: "numeric",
          maxLength: 4,
          placeholder: "PIN wiederholen",
          value: newPin2,
          onChange: (e) => setNewPin2(e.target.value.replace(/\D/g, ""))
        }
      ),
      error && /* @__PURE__ */ jsx("div", { style: styles.pinError, children: error }),
      /* @__PURE__ */ jsx("div", { style: styles.pinHint, children: "Mit PIN sind Journal-, Glaubenssatz-, Ziel- und Affirmations-\xDCbungen gesch\xFCtzt. Andere sehen nur, dass sie erledigt sind \u2013 nicht den Inhalt." }),
      /* @__PURE__ */ jsx("button", { style: styles.primaryBtn, onClick: handleSave, children: "Speichern" })
    ] })
  ] }) });
}
function XpRing({ xp }) {
  const level = levelFromXp(xp);
  const into = xpIntoLevel(xp);
  const pct = into / 120;
  const r = 54;
  const c = 2 * Math.PI * r;
  return /* @__PURE__ */ jsxs("div", { style: { position: "relative", width: 128, height: 128 }, children: [
    /* @__PURE__ */ jsxs("svg", { width: "128", height: "128", viewBox: "0 0 128 128", children: [
      /* @__PURE__ */ jsx("circle", { cx: "64", cy: "64", r, fill: "none", stroke: "#20242d", strokeWidth: "10" }),
      /* @__PURE__ */ jsx(
        "circle",
        {
          cx: "64",
          cy: "64",
          r,
          fill: "none",
          stroke: "#4F8EFF",
          strokeWidth: "10",
          strokeDasharray: c,
          strokeDashoffset: c - pct * c,
          strokeLinecap: "round",
          transform: "rotate(-90 64 64)"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { style: styles.ringCenter, children: [
      /* @__PURE__ */ jsxs("div", { style: styles.ringLevel, children: [
        "LV ",
        level
      ] }),
      /* @__PURE__ */ jsxs("div", { style: styles.ringXp, children: [
        into,
        "/120"
      ] })
    ] })
  ] });
}
function StartTab({ profile, myTodayEntries, onToggle, onGoCalendar }) {
  const doneCount = myTodayEntries.filter((e) => e.done).length;
  return /* @__PURE__ */ jsxs("div", { style: styles.tabPad, children: [
    /* @__PURE__ */ jsxs("div", { style: styles.heroRow, children: [
      /* @__PURE__ */ jsx(XpRing, { xp: profile.xp || 0 }),
      /* @__PURE__ */ jsxs("div", { style: styles.heroStats, children: [
        /* @__PURE__ */ jsxs("div", { style: styles.statLine, children: [
          /* @__PURE__ */ jsx(Flame, { size: 18, color: "#FF7A5C" }),
          /* @__PURE__ */ jsx("span", { style: styles.statValue, children: profile.streak || 0 }),
          /* @__PURE__ */ jsx("span", { style: styles.statLabel, children: "Tage Streak" })
        ] }),
        /* @__PURE__ */ jsxs("div", { style: styles.statLine, children: [
          /* @__PURE__ */ jsx(Trophy, { size: 18, color: "#FFD166" }),
          /* @__PURE__ */ jsx("span", { style: styles.statValue, children: (profile.badges || []).length }),
          /* @__PURE__ */ jsx("span", { style: styles.statLabel, children: "Abzeichen" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { style: styles.sectionHead, children: [
      /* @__PURE__ */ jsx("span", { children: "Heute f\xFCr dich" }),
      /* @__PURE__ */ jsxs("span", { style: styles.sectionCount, children: [
        doneCount,
        "/",
        myTodayEntries.length
      ] })
    ] }),
    myTodayEntries.length === 0 && /* @__PURE__ */ jsxs("div", { style: styles.emptyBox, children: [
      "Noch nichts f\xFCr heute geplant.",
      " ",
      /* @__PURE__ */ jsx("span", { style: styles.emptyLink, onClick: onGoCalendar, children: "Aufgabe hinzuf\xFCgen" })
    ] }),
    myTodayEntries.map((e) => /* @__PURE__ */ jsx(EntryRow, { entry: e, onToggle }, e.id))
  ] });
}
function EntryRow({ entry, onToggle }) {
  const cat = CATEGORIES[entry.category] || CATEGORIES.sport;
  const Icon = cat.icon;
  return /* @__PURE__ */ jsxs("button", { style: styles.entryRow, onClick: () => onToggle(entry.id), children: [
    /* @__PURE__ */ jsx("div", { style: { ...styles.entryCheck, ...entry.done ? styles.entryCheckDone : {} }, children: entry.done && /* @__PURE__ */ jsx(Check, { size: 14, color: "#0c0e12", strokeWidth: 3 }) }),
    /* @__PURE__ */ jsx("div", { style: { ...styles.entryIconWrap, background: cat.color + "22" }, children: /* @__PURE__ */ jsx(Icon, { size: 16, color: cat.color }) }),
    /* @__PURE__ */ jsxs("div", { style: { flex: 1, textAlign: "left" }, children: [
      /* @__PURE__ */ jsx("div", { style: { ...styles.entryTitle, ...entry.done ? styles.entryTitleDone : {} }, children: entry.title }),
      /* @__PURE__ */ jsx("div", { style: styles.entryCat, children: cat.label })
    ] })
  ] });
}
function KalenderTab({ entries, profiles, activeProfileId, onToggle, onAddClick }) {
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  const grouped = {};
  sorted.forEach((e) => {
    grouped[e.date] = grouped[e.date] || [];
    grouped[e.date].push(e);
  });
  return /* @__PURE__ */ jsxs("div", { style: styles.tabPad, children: [
    /* @__PURE__ */ jsxs("div", { style: styles.sectionHead, children: [
      /* @__PURE__ */ jsx("span", { children: "Kalender & Routinen" }),
      /* @__PURE__ */ jsx("button", { style: styles.addIconBtn, onClick: onAddClick, children: /* @__PURE__ */ jsx(Plus, { size: 16, color: "#0c0e12", strokeWidth: 3 }) })
    ] }),
    Object.keys(grouped).length === 0 && /* @__PURE__ */ jsx("div", { style: styles.emptyBox, children: "Noch keine Eintr\xE4ge. Leg direkt los." }),
    Object.entries(grouped).map(([date, list]) => /* @__PURE__ */ jsxs("div", { style: { marginBottom: 18 }, children: [
      /* @__PURE__ */ jsx("div", { style: styles.dateLabel, children: date === todayStr() ? "Heute" : new Date(date).toLocaleDateString("de-DE", { weekday: "short", day: "2-digit", month: "2-digit" }) }),
      list.map((e) => /* @__PURE__ */ jsxs("div", { style: styles.calRow, children: [
        /* @__PURE__ */ jsx(EntryRow, { entry: e, onToggle }),
        /* @__PURE__ */ jsx("div", { style: styles.calAssignee, children: profiles[e.assignedTo]?.name || "?" })
      ] }, e.id))
    ] }, date))
  ] });
}
function AddEntryModal({ profiles, defaultAssignee, onClose, onSubmit }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("sport");
  const [date, setDate] = useState(todayStr());
  const [assignedTo, setAssignedTo] = useState(defaultAssignee);
  return /* @__PURE__ */ jsx("div", { style: styles.modalOverlay, children: /* @__PURE__ */ jsxs("div", { style: styles.modal, children: [
    /* @__PURE__ */ jsxs("div", { style: styles.modalHeader, children: [
      /* @__PURE__ */ jsx("span", { children: "Neue Aufgabe" }),
      /* @__PURE__ */ jsx(X, { size: 20, color: "#888", onClick: onClose, style: { cursor: "pointer" } })
    ] }),
    /* @__PURE__ */ jsx(
      "input",
      {
        style: styles.input,
        placeholder: "z.B. Sprints 5x20m",
        value: title,
        onChange: (e) => setTitle(e.target.value)
      }
    ),
    /* @__PURE__ */ jsx("div", { style: styles.roleRow, children: Object.entries(CATEGORIES).map(([key, c]) => /* @__PURE__ */ jsx(
      "button",
      {
        style: {
          ...styles.roleChip,
          ...category === key ? { ...styles.roleChipActive, borderColor: c.color, color: c.color } : {}
        },
        onClick: () => setCategory(key),
        children: c.label
      },
      key
    )) }),
    /* @__PURE__ */ jsx(
      "input",
      {
        style: styles.input,
        type: "date",
        value: date,
        onChange: (e) => setDate(e.target.value)
      }
    ),
    /* @__PURE__ */ jsx("div", { style: styles.roleRow, children: Object.values(profiles).map((p) => /* @__PURE__ */ jsx(
      "button",
      {
        style: { ...styles.roleChip, ...assignedTo === p.id ? styles.roleChipActive : {} },
        onClick: () => setAssignedTo(p.id),
        children: p.name
      },
      p.id
    )) }),
    /* @__PURE__ */ jsx(
      "button",
      {
        style: styles.primaryBtn,
        onClick: () => title.trim() && onSubmit(title.trim(), category, date, assignedTo),
        children: "Hinzuf\xFCgen"
      }
    )
  ] }) });
}
function SportTab({ profile, onStartExercise, onStartSession }) {
  const [viewMode, setViewMode] = useState("single");
  const [group, setGroup] = useState("speed");
  const today = todayStr();
  const doneToday = profile.exercisesDone && profile.exercisesDone[today] || [];
  const groupExercises = EXERCISE_LIBRARY.filter((e) => e.group === group);
  const g = SPORT_GROUPS[group];
  return /* @__PURE__ */ jsxs("div", { style: styles.tabPad, children: [
    /* @__PURE__ */ jsxs("div", { style: styles.viewModeTabs, children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          style: { ...styles.viewModeTab, ...viewMode === "single" ? styles.viewModeTabActive : {} },
          onClick: () => setViewMode("single"),
          children: "Einzel\xFCbungen"
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          style: { ...styles.viewModeTab, ...viewMode === "session" ? styles.viewModeTabActive : {} },
          onClick: () => setViewMode("session"),
          children: "Session"
        }
      )
    ] }),
    viewMode === "session" ? /* @__PURE__ */ jsx(SessionBuilder, { onStartSession }) : /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("div", { style: styles.groupTabs, children: Object.entries(SPORT_GROUPS).map(([key, cfg]) => {
        const Icon = cfg.icon;
        const active = group === key;
        return /* @__PURE__ */ jsxs(
          "button",
          {
            style: {
              ...styles.groupTab,
              ...active ? { borderColor: cfg.color, color: cfg.color, background: cfg.color + "14" } : {}
            },
            onClick: () => setGroup(key),
            children: [
              /* @__PURE__ */ jsx(Icon, { size: 16 }),
              /* @__PURE__ */ jsx("span", { children: cfg.label })
            ]
          },
          key
        );
      }) }),
      /* @__PURE__ */ jsx("div", { style: styles.groupSub, children: g.sub }),
      groupExercises.map((ex) => /* @__PURE__ */ jsx(
        ExerciseCard,
        {
          exercise: ex,
          color: g.color,
          done: doneToday.includes(ex.id),
          onStart: () => onStartExercise(ex)
        },
        ex.id
      ))
    ] })
  ] });
}
function SessionBuilder({ onStartSession }) {
  const [category, setCategory] = useState("speed");
  const [dehnenMode, setDehnenMode] = useState("warmup");
  const [length, setLength] = useState("standard");
  const [preview, setPreview] = useState(null);
  const categories = [
    { id: "speed", label: "Speed", color: SPORT_GROUPS.speed.color, icon: Zap },
    { id: "athletik", label: "Athletik", color: "#FFB84D", icon: Footprints },
    { id: "dehnen", label: "Dehnen", color: SPORT_GROUPS.dehnen.color, icon: Move }
  ];
  const generate = () => {
    let queue = [];
    if (category === "speed") queue = generateSpeedSession(length);
    else if (category === "athletik") queue = generateAthletikSession(length);
    else queue = generateDehnenSession(length, dehnenMode);
    setPreview(queue);
  };
  const catColor = categories.find((c) => c.id === category).color;
  if (preview) {
    return /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsxs("div", { style: styles.sectionHead, children: [
        /* @__PURE__ */ jsx("span", { children: "Deine Session" }),
        /* @__PURE__ */ jsxs("span", { style: { color: catColor }, children: [
          preview.length,
          " \xDCbungen"
        ] })
      ] }),
      preview.map((ex, i) => {
        const stepGroupLabel = category === "speed" ? SPEED_PHASE_LABEL[SPEED_PHASE[ex.id]] : category === "athletik" ? ATHLETIK_TYPE_LABEL[ATHLETIK_TYPE[ex.id]] : DEHNEN_META[ex.id].dyn ? "Dynamisch" : "Statisch";
        return /* @__PURE__ */ jsxs("div", { style: styles.previewRow, children: [
          /* @__PURE__ */ jsx("div", { style: { ...styles.previewNum, borderColor: catColor, color: catColor }, children: i + 1 }),
          /* @__PURE__ */ jsxs("div", { style: { flex: 1 }, children: [
            /* @__PURE__ */ jsx("div", { style: styles.previewName, children: ex.name }),
            /* @__PURE__ */ jsx("div", { style: styles.previewPhase, children: stepGroupLabel })
          ] })
        ] }, ex.id + i);
      }),
      /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 8, marginTop: 14 }, children: [
        /* @__PURE__ */ jsx("button", { style: styles.secondaryBtn, onClick: generate, children: "Neu mischen" }),
        /* @__PURE__ */ jsx("button", { style: { ...styles.primaryBtn, flex: 1, marginTop: 0 }, onClick: () => onStartSession(preview), children: "Los geht's" })
      ] }),
      /* @__PURE__ */ jsx("div", { style: styles.previewBack, onClick: () => setPreview(null), children: "\u2190 Einstellungen \xE4ndern" })
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("div", { style: styles.sectionHead, children: /* @__PURE__ */ jsx("span", { children: "Kategorie" }) }),
    /* @__PURE__ */ jsx("div", { style: styles.roleRow, children: categories.map((c) => {
      const Icon = c.icon;
      const active = category === c.id;
      return /* @__PURE__ */ jsxs(
        "button",
        {
          style: {
            ...styles.roleChip,
            ...active ? { borderColor: c.color, color: c.color } : {},
            display: "flex",
            alignItems: "center",
            gap: 6
          },
          onClick: () => setCategory(c.id),
          children: [
            /* @__PURE__ */ jsx(Icon, { size: 14 }),
            c.label
          ]
        },
        c.id
      );
    }) }),
    category === "dehnen" && /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("div", { style: { ...styles.sectionHead, marginTop: 18 }, children: /* @__PURE__ */ jsx("span", { children: "Wann?" }) }),
      /* @__PURE__ */ jsxs("div", { style: styles.roleRow, children: [
        /* @__PURE__ */ jsx(
          "button",
          {
            style: { ...styles.roleChip, ...dehnenMode === "warmup" ? styles.roleChipActive : {} },
            onClick: () => setDehnenMode("warmup"),
            children: "Vor dem Training (dynamisch)"
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            style: { ...styles.roleChip, ...dehnenMode === "cooldown" ? styles.roleChipActive : {} },
            onClick: () => setDehnenMode("cooldown"),
            children: "Nach dem Training (statisch)"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { style: { ...styles.sectionHead, marginTop: 18 }, children: /* @__PURE__ */ jsx("span", { children: "L\xE4nge" }) }),
    /* @__PURE__ */ jsx("div", { style: styles.roleRow, children: Object.entries(SESSION_LENGTHS).map(([key, cfg]) => /* @__PURE__ */ jsxs(
      "button",
      {
        style: { ...styles.roleChip, ...length === key ? styles.roleChipActive : {} },
        onClick: () => setLength(key),
        children: [
          cfg.label,
          " ",
          /* @__PURE__ */ jsxs("span", { style: { opacity: 0.6 }, children: [
            "(",
            cfg.sub,
            ")"
          ] })
        ]
      },
      key
    )) }),
    /* @__PURE__ */ jsx("button", { style: styles.primaryBtn, onClick: generate, children: "Session erstellen" })
  ] });
}
function MentalTab({ profile, onStartExercise, onStartSession }) {
  const [viewMode, setViewMode] = useState("single");
  const [group, setGroup] = useState("fokus");
  const today = todayStr();
  const doneToday = profile.exercisesDone && profile.exercisesDone[today] || [];
  const groupExercises = MENTAL_LIBRARY.filter((e) => e.group === group);
  const g = MENTAL_GROUPS[group];
  return /* @__PURE__ */ jsxs("div", { style: styles.tabPad, children: [
    /* @__PURE__ */ jsxs("div", { style: styles.viewModeTabs, children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          style: { ...styles.viewModeTab, ...viewMode === "single" ? styles.viewModeTabActive : {} },
          onClick: () => setViewMode("single"),
          children: "Einzel\xFCbungen"
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          style: { ...styles.viewModeTab, ...viewMode === "session" ? styles.viewModeTabActive : {} },
          onClick: () => setViewMode("session"),
          children: "Session"
        }
      )
    ] }),
    viewMode === "session" ? /* @__PURE__ */ jsx(MentalSessionBuilder, { onStartSession }) : /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("div", { style: styles.groupTabs, children: Object.entries(MENTAL_GROUPS).map(([key, cfg]) => {
        const Icon = cfg.icon;
        const active = group === key;
        return /* @__PURE__ */ jsxs(
          "button",
          {
            style: {
              ...styles.groupTab,
              ...active ? { borderColor: cfg.color, color: cfg.color, background: cfg.color + "14" } : {}
            },
            onClick: () => setGroup(key),
            children: [
              /* @__PURE__ */ jsx(Icon, { size: 16 }),
              /* @__PURE__ */ jsx("span", { children: cfg.label })
            ]
          },
          key
        );
      }) }),
      /* @__PURE__ */ jsx("div", { style: styles.groupSub, children: g.sub }),
      groupExercises.map((ex) => /* @__PURE__ */ jsx(
        ExerciseCard,
        {
          exercise: ex,
          color: g.color,
          done: doneToday.includes(ex.id),
          onStart: () => onStartExercise(ex)
        },
        ex.id
      ))
    ] })
  ] });
}
function MentalSessionBuilder({ onStartSession }) {
  const [length, setLength] = useState("standard");
  const [preview, setPreview] = useState(null);
  const generate = () => setPreview(generateMentalSession(length));
  if (preview) {
    return /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsxs("div", { style: styles.sectionHead, children: [
        /* @__PURE__ */ jsx("span", { children: "Deine Session" }),
        /* @__PURE__ */ jsxs("span", { style: { color: "#B99BFF" }, children: [
          preview.length,
          " \xDCbungen"
        ] })
      ] }),
      preview.map((ex, i) => {
        const g = MENTAL_GROUPS[ex.group];
        return /* @__PURE__ */ jsxs("div", { style: styles.previewRow, children: [
          /* @__PURE__ */ jsx("div", { style: { ...styles.previewNum, borderColor: g.color, color: g.color }, children: i + 1 }),
          /* @__PURE__ */ jsxs("div", { style: { flex: 1 }, children: [
            /* @__PURE__ */ jsx("div", { style: styles.previewName, children: ex.name }),
            /* @__PURE__ */ jsx("div", { style: styles.previewPhase, children: g.label })
          ] })
        ] }, ex.id + i);
      }),
      /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 8, marginTop: 14 }, children: [
        /* @__PURE__ */ jsx("button", { style: styles.secondaryBtn, onClick: generate, children: "Neu mischen" }),
        /* @__PURE__ */ jsx("button", { style: { ...styles.primaryBtn, flex: 1, marginTop: 0 }, onClick: () => onStartSession(preview), children: "Los geht's" })
      ] }),
      /* @__PURE__ */ jsx("div", { style: styles.previewBack, onClick: () => setPreview(null), children: "\u2190 Einstellungen \xE4ndern" })
    ] });
  }
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("div", { style: styles.sectionHead, children: /* @__PURE__ */ jsx("span", { children: "L\xE4nge" }) }),
    /* @__PURE__ */ jsx("div", { style: styles.roleRow, children: Object.entries(MENTAL_SESSION_LENGTHS).map(([key, cfg]) => /* @__PURE__ */ jsxs(
      "button",
      {
        style: { ...styles.roleChip, ...length === key ? styles.roleChipActive : {} },
        onClick: () => setLength(key),
        children: [
          cfg.label,
          " ",
          /* @__PURE__ */ jsxs("span", { style: { opacity: 0.6 }, children: [
            "(",
            cfg.sub,
            ")"
          ] })
        ]
      },
      key
    )) }),
    /* @__PURE__ */ jsx("div", { style: { ...styles.groupSub, marginTop: 6 }, children: "Die Session mischt automatisch \xFCber Fokus, Ruhe, Vertrauen und Routine." }),
    /* @__PURE__ */ jsx("button", { style: styles.primaryBtn, onClick: generate, children: "Session erstellen" })
  ] });
}
function ExerciseCard({ exercise, color, done, onStart }) {
  return /* @__PURE__ */ jsxs("button", { style: styles.exCard, onClick: onStart, children: [
    /* @__PURE__ */ jsx("div", { style: { ...styles.exCheck, ...done ? { background: color, borderColor: color } : {} }, children: done && /* @__PURE__ */ jsx(Check, { size: 13, color: "#0c0e12", strokeWidth: 3 }) }),
    /* @__PURE__ */ jsxs("div", { style: { flex: 1, textAlign: "left" }, children: [
      /* @__PURE__ */ jsx("div", { style: styles.exName, children: exercise.name }),
      /* @__PURE__ */ jsx("div", { style: styles.exDesc, children: exercise.desc })
    ] }),
    /* @__PURE__ */ jsx("div", { style: { ...styles.exMeta, color }, children: exercise.type === "time" ? `${exercise.seconds}s` : exercise.type === "steps" ? `${exercise.steps.reduce((sum, s) => sum + s.seconds, 0)}s \xB7 ${exercise.steps.length} Teile` : exercise.reps })
  ] });
}
var PRIVATE_KINDS = ["journal", "belief", "goal", "affirmation"];
function ExerciseQuiz({ exercise, videoUrl, canEditVideo, onSaveVideo, onClose, onComplete, sessionProgress, reflectionValue, onSaveReflection, profilePin, isUnlocked, onUnlock }) {
  const initialPhase = exercise.story ? "story" : exercise.noQuiz ? "do" : "question";
  const [phase, setPhase] = useState(initialPhase);
  const [question] = useState(() => exercise.noQuiz ? null : pickNextQuestion(exercise));
  const [selected, setSelected] = useState(null);
  const [editingVideo, setEditingVideo] = useState(false);
  const [videoInput, setVideoInput] = useState(videoUrl);
  const Icon = exercise.icon || Target;
  const groupColor = ALL_GROUPS[exercise.group].color;
  const needsPinGate = PRIVATE_KINDS.includes(exercise.kind) && profilePin && !isUnlocked;
  const handleSelect = (idx) => {
    if (selected !== null) return;
    setSelected(idx);
    setTimeout(() => setPhase("result"), 550);
  };
  return /* @__PURE__ */ jsx("div", { style: styles.modalOverlay, children: /* @__PURE__ */ jsxs("div", { style: styles.modal, children: [
    /* @__PURE__ */ jsxs("div", { style: styles.modalHeader, children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("div", { children: exercise.name }),
        sessionProgress && /* @__PURE__ */ jsxs("div", { style: styles.sessionProgressLabel, children: [
          "\xDCbung ",
          sessionProgress.current,
          "/",
          sessionProgress.total
        ] })
      ] }),
      /* @__PURE__ */ jsx(X, { size: 20, color: "#888", onClick: onClose, style: { cursor: "pointer" } })
    ] }),
    phase === "story" && /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsxs("div", { style: styles.quizBadge, children: [
        /* @__PURE__ */ jsx(Brain, { size: 13, color: groupColor }),
        /* @__PURE__ */ jsx("span", { children: "Eine kleine Geschichte" })
      ] }),
      /* @__PURE__ */ jsx("div", { style: styles.storyText, children: exercise.desc }),
      /* @__PURE__ */ jsx("button", { style: styles.primaryBtn, onClick: () => setPhase(exercise.noQuiz ? "do" : "question"), children: "Weiter" })
    ] }),
    phase === "question" && /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsxs("div", { style: styles.quizBadge, children: [
        /* @__PURE__ */ jsx(HelpCircle, { size: 13, color: groupColor }),
        /* @__PURE__ */ jsx("span", { children: "Erst die Technik-Frage" })
      ] }),
      /* @__PURE__ */ jsx("div", { style: styles.quizQuestion, children: question.q }),
      /* @__PURE__ */ jsx("div", { style: { display: "flex", flexDirection: "column", gap: 8, marginTop: 14 }, children: question.options.map((opt, idx) => {
        let optStyle = { ...styles.quizOption };
        if (selected !== null) {
          if (opt.correct) optStyle = { ...optStyle, ...styles.quizOptionCorrect };
          else if (idx === selected) optStyle = { ...optStyle, ...styles.quizOptionWrong };
          else optStyle = { ...optStyle, opacity: 0.4 };
        }
        return /* @__PURE__ */ jsx("button", { style: optStyle, onClick: () => handleSelect(idx), children: opt.text }, idx);
      }) })
    ] }),
    phase === "result" && /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("div", { style: { ...styles.quizFeedback, color: question.options[selected]?.correct ? "#4F8EFF" : "#FF7A5C" }, children: question.options[selected]?.correct ? "Richtig! \u2713" : "Nicht ganz." }),
      /* @__PURE__ */ jsxs("div", { style: styles.illustrationWrap, children: [
        /* @__PURE__ */ jsx("div", { style: { ...styles.illustrationCircle, borderColor: groupColor }, children: POSE_MAP[exercise.id] ? /* @__PURE__ */ jsx(StickFigure, { pose: POSE_MAP[exercise.id], color: groupColor }) : /* @__PURE__ */ jsx(Icon, { size: 36, color: groupColor }) }),
        /* @__PURE__ */ jsx("div", { style: styles.illustrationCaption, children: POSE_MAP[exercise.id] ? "Technik-Schema" : "Wissen" })
      ] }),
      /* @__PURE__ */ jsx("div", { style: styles.quizExplanation, children: question.explanation }),
      /* @__PURE__ */ jsx("div", { style: styles.videoBox, children: videoUrl && !editingVideo ? /* @__PURE__ */ jsxs("a", { href: videoUrl, target: "_blank", rel: "noreferrer", style: styles.videoLink, children: [
        /* @__PURE__ */ jsx(Video, { size: 15 }),
        " Video ansehen"
      ] }) : editingVideo ? /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 6 }, children: [
        /* @__PURE__ */ jsx(
          "input",
          {
            style: { ...styles.input, flex: 1, padding: "8px 10px" },
            placeholder: "YouTube-Link einf\xFCgen",
            value: videoInput,
            onChange: (e) => setVideoInput(e.target.value)
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            style: styles.videoSaveBtn,
            onClick: () => {
              onSaveVideo(videoInput.trim());
              setEditingVideo(false);
            },
            children: "OK"
          }
        )
      ] }) : canEditVideo ? /* @__PURE__ */ jsxs("button", { style: styles.videoAddBtn, onClick: () => setEditingVideo(true), children: [
        /* @__PURE__ */ jsx(Video, { size: 14 }),
        " Video-Link hinzuf\xFCgen"
      ] }) : /* @__PURE__ */ jsx("div", { style: styles.videoNone, children: "Noch kein Video hinterlegt" }) }),
      /* @__PURE__ */ jsx("button", { style: styles.primaryBtn, onClick: () => setPhase("do"), children: "Weiter zur \xDCbung" })
    ] }),
    phase === "do" && needsPinGate && /* @__PURE__ */ jsx(PinGateScreen, { onUnlock, correctPin: profilePin }),
    phase === "do" && !needsPinGate && /* @__PURE__ */ jsx(
      ExerciseDoPhase,
      {
        exercise,
        onComplete,
        reflectionValue,
        onSaveReflection
      }
    )
  ] }) });
}
function JournalDoPhase({ exercise, onComplete, reflectionValue, onSaveReflection }) {
  const prompts = exercise.prompts || ["Was lief heute gut?"];
  const [values, setValues] = useState(reflectionValue?.values || prompts.map(() => ""));
  const handleFinish = () => {
    if (onSaveReflection) onSaveReflection({ values });
    onComplete();
  };
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("div", { style: styles.runnerDesc, children: exercise.desc }),
    prompts.map((p, i) => /* @__PURE__ */ jsxs("div", { style: { marginBottom: 10 }, children: [
      /* @__PURE__ */ jsx("div", { style: styles.journalLabel, children: p }),
      /* @__PURE__ */ jsx(
        "textarea",
        {
          style: styles.journalInput,
          rows: 2,
          value: values[i],
          onChange: (e) => {
            const next = [...values];
            next[i] = e.target.value;
            setValues(next);
          }
        }
      )
    ] }, i)),
    /* @__PURE__ */ jsxs("button", { style: styles.primaryBtn, onClick: handleFinish, children: [
      "Fertig \xB7 +",
      XP_PER_EXERCISE,
      " XP"
    ] })
  ] });
}
function GoalDoPhase({ exercise, onComplete, reflectionValue, onSaveReflection }) {
  const fields = exercise.fields || ["Mein Ziel"];
  const [values, setValues] = useState(reflectionValue?.values || fields.map(() => ""));
  const handleFinish = () => {
    if (onSaveReflection) onSaveReflection({ values });
    onComplete();
  };
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("div", { style: styles.runnerDesc, children: exercise.desc }),
    fields.map((f, i) => /* @__PURE__ */ jsxs("div", { style: { marginBottom: 10 }, children: [
      /* @__PURE__ */ jsx("div", { style: styles.journalLabel, children: f }),
      /* @__PURE__ */ jsx(
        "input",
        {
          style: styles.input,
          value: values[i],
          onChange: (e) => {
            const next = [...values];
            next[i] = e.target.value;
            setValues(next);
          }
        }
      )
    ] }, i)),
    /* @__PURE__ */ jsxs("button", { style: styles.primaryBtn, onClick: handleFinish, children: [
      "Fertig \xB7 +",
      XP_PER_EXERCISE,
      " XP"
    ] })
  ] });
}
function AffirmationDoPhase({ exercise, onComplete, reflectionValue, onSaveReflection }) {
  const options = exercise.affirmations || [];
  const [selected, setSelected] = useState(reflectionValue?.selected ?? null);
  const [custom, setCustom] = useState(reflectionValue?.custom || "");
  const handleFinish = () => {
    if (onSaveReflection) onSaveReflection({ selected, custom });
    onComplete();
  };
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("div", { style: styles.runnerDesc, children: exercise.desc }),
    /* @__PURE__ */ jsx("div", { style: styles.affirmationHint, children: "Wichtig: W\xE4hl einen Satz, der sich f\xFCr dich stimmig anf\xFChlt \u2013 nicht einen, der \xFCbertrieben klingt." }),
    /* @__PURE__ */ jsx("div", { style: { display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }, children: options.map((text, i) => /* @__PURE__ */ jsx(
      "button",
      {
        style: { ...styles.affirmationOption, ...selected === i ? styles.affirmationOptionActive : {} },
        onClick: () => {
          setSelected(i);
          setCustom("");
        },
        children: text
      },
      i
    )) }),
    /* @__PURE__ */ jsx("div", { style: styles.journalLabel, children: "Oder schreib deinen eigenen Satz:" }),
    /* @__PURE__ */ jsx(
      "input",
      {
        style: styles.input,
        placeholder: "Mein eigener Satz...",
        value: custom,
        onChange: (e) => {
          setCustom(e.target.value);
          setSelected(null);
        }
      }
    ),
    /* @__PURE__ */ jsxs("button", { style: styles.primaryBtn, onClick: handleFinish, children: [
      "Fertig \xB7 +",
      XP_PER_EXERCISE,
      " XP"
    ] })
  ] });
}
function PinGateScreen({ onUnlock, correctPin }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const handleCheck = (value) => {
    setPin(value);
    setError(false);
    if (value.length === 4) {
      if (value === correctPin) {
        onUnlock();
      } else {
        setError(true);
      }
    }
  };
  return /* @__PURE__ */ jsxs("div", { style: { textAlign: "center", padding: "10px 0" }, children: [
    /* @__PURE__ */ jsx(Lock, { size: 28, color: "#FFD166", style: { marginBottom: 10 } }),
    /* @__PURE__ */ jsx("div", { style: styles.storyText, children: "Diese \xDCbung ist gesch\xFCtzt. PIN eingeben, um sie zu \xF6ffnen." }),
    /* @__PURE__ */ jsx(
      "input",
      {
        style: { ...styles.input, textAlign: "center", letterSpacing: 6, fontSize: 20 },
        type: "password",
        inputMode: "numeric",
        maxLength: 4,
        placeholder: "\u2022\u2022\u2022\u2022",
        value: pin,
        onChange: (e) => handleCheck(e.target.value.replace(/\D/g, ""))
      }
    ),
    error && /* @__PURE__ */ jsx("div", { style: styles.pinError, children: "Falsche PIN." })
  ] });
}
function ExerciseDoPhase({ exercise, onComplete, reflectionValue, onSaveReflection }) {
  if (exercise.kind === "journal" || exercise.kind === "belief") {
    return /* @__PURE__ */ jsx(
      JournalDoPhase,
      {
        exercise,
        onComplete,
        reflectionValue,
        onSaveReflection
      }
    );
  }
  if (exercise.kind === "goal") {
    return /* @__PURE__ */ jsx(
      GoalDoPhase,
      {
        exercise,
        onComplete,
        reflectionValue,
        onSaveReflection
      }
    );
  }
  if (exercise.kind === "affirmation") {
    return /* @__PURE__ */ jsx(
      AffirmationDoPhase,
      {
        exercise,
        onComplete,
        reflectionValue,
        onSaveReflection
      }
    );
  }
  if (exercise.type === "steps") {
    return /* @__PURE__ */ jsx(StepDoPhase, { exercise, onComplete });
  }
  const isTime = exercise.type === "time";
  const [secondsLeft, setSecondsLeft] = useState(isTime ? exercise.seconds : 0);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef(null);
  useEffect(() => {
    if (running && isTime) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((s) => {
          if (s <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            return 0;
          }
          return s - 1;
        });
      }, 1e3);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, isTime]);
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("div", { style: styles.runnerDesc, children: exercise.desc }),
    isTime ? /* @__PURE__ */ jsxs("div", { style: styles.runnerTimerWrap, children: [
      /* @__PURE__ */ jsxs("div", { style: styles.runnerTimer, children: [
        secondsLeft,
        "s"
      ] }),
      /* @__PURE__ */ jsxs("div", { style: styles.runnerBtnRow, children: [
        /* @__PURE__ */ jsx("button", { style: styles.roundBtn, onClick: () => setRunning((r) => !r), children: running ? /* @__PURE__ */ jsx(Pause, { size: 20 }) : /* @__PURE__ */ jsx(Play, { size: 20 }) }),
        /* @__PURE__ */ jsx(
          "button",
          {
            style: styles.roundBtn,
            onClick: () => {
              setRunning(false);
              setSecondsLeft(exercise.seconds);
            },
            children: /* @__PURE__ */ jsx(RotateCcw, { size: 18 })
          }
        )
      ] })
    ] }) : /* @__PURE__ */ jsxs("div", { style: styles.runnerRepsWrap, children: [
      /* @__PURE__ */ jsx(Timer, { size: 28, color: "#666" }),
      /* @__PURE__ */ jsx("div", { style: styles.runnerReps, children: exercise.reps })
    ] }),
    /* @__PURE__ */ jsxs("button", { style: styles.primaryBtn, onClick: onComplete, children: [
      "Fertig \xB7 +",
      XP_PER_EXERCISE,
      " XP"
    ] })
  ] });
}
function StepDoPhase({ exercise, onComplete }) {
  const { steps } = exercise;
  const [stepIndex, setStepIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(steps[0].seconds);
  const [running, setRunning] = useState(false);
  useEffect(() => {
    if (!running) return;
    if (secondsLeft <= 0) {
      if (stepIndex < steps.length - 1) {
        setStepIndex((i) => i + 1);
        setSecondsLeft(steps[stepIndex + 1].seconds);
      } else {
        setRunning(false);
      }
      return;
    }
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1e3);
    return () => clearTimeout(t);
  }, [running, secondsLeft, stepIndex, steps]);
  const step = steps[stepIndex];
  const isLastStep = stepIndex === steps.length - 1;
  const allDone = isLastStep && secondsLeft === 0;
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("div", { style: styles.runnerDesc, children: exercise.desc }),
    /* @__PURE__ */ jsx("div", { style: styles.stepDots, children: steps.map((s, i) => /* @__PURE__ */ jsx(
      "div",
      {
        style: {
          ...styles.stepDot,
          ...i === stepIndex ? styles.stepDotActive : {},
          ...i < stepIndex || i === stepIndex && allDone ? styles.stepDotDone : {}
        }
      },
      i
    )) }),
    /* @__PURE__ */ jsxs("div", { style: styles.stepLabel, children: [
      "Teil ",
      stepIndex + 1,
      "/",
      steps.length,
      " \xB7 ",
      step.label
    ] }),
    /* @__PURE__ */ jsxs("div", { style: styles.runnerTimerWrap, children: [
      /* @__PURE__ */ jsx("div", { style: styles.runnerTimer, children: allDone ? "\u2713" : `${secondsLeft}s` }),
      /* @__PURE__ */ jsxs("div", { style: styles.runnerBtnRow, children: [
        /* @__PURE__ */ jsx("button", { style: styles.roundBtn, onClick: () => setRunning((r) => !r), disabled: allDone, children: running ? /* @__PURE__ */ jsx(Pause, { size: 20 }) : /* @__PURE__ */ jsx(Play, { size: 20 }) }),
        /* @__PURE__ */ jsx(
          "button",
          {
            style: styles.roundBtn,
            onClick: () => {
              setRunning(false);
              setStepIndex(0);
              setSecondsLeft(steps[0].seconds);
            },
            children: /* @__PURE__ */ jsx(RotateCcw, { size: 18 })
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("button", { style: styles.primaryBtn, onClick: onComplete, children: [
      "Fertig \xB7 +",
      XP_PER_EXERCISE,
      " XP"
    ] })
  ] });
}
function TeamTab({ profiles, onReset, onResetAll }) {
  const list = Object.values(profiles).sort((a, b) => (b.xp || 0) - (a.xp || 0));
  const [confirmId, setConfirmId] = useState(null);
  const [confirmAll, setConfirmAll] = useState(false);
  return /* @__PURE__ */ jsxs("div", { style: styles.tabPad, children: [
    /* @__PURE__ */ jsx("div", { style: styles.sectionHead, children: /* @__PURE__ */ jsx("span", { children: "Team-Fortschritt" }) }),
    list.map((p, i) => /* @__PURE__ */ jsxs("div", { style: styles.teamRow, children: [
      /* @__PURE__ */ jsx("div", { style: styles.teamRank, children: i + 1 }),
      /* @__PURE__ */ jsx("div", { style: styles.pickerAvatar, children: p.name.charAt(0).toUpperCase() }),
      /* @__PURE__ */ jsxs("div", { style: { flex: 1 }, children: [
        /* @__PURE__ */ jsx("div", { style: styles.pickerName, children: p.name }),
        /* @__PURE__ */ jsxs("div", { style: styles.pickerRole, children: [
          "LV ",
          levelFromXp(p.xp || 0),
          " \xB7 ",
          p.streak || 0,
          " Tage Streak"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { style: styles.teamXp, children: [
        p.xp || 0,
        " XP"
      ] }),
      /* @__PURE__ */ jsx("button", { style: styles.resetIconBtn, onClick: () => setConfirmId(p.id), title: "Fortschritt zur\xFCcksetzen", children: /* @__PURE__ */ jsx(RotateCcw, { size: 14, color: "#666" }) })
    ] }, p.id)),
    /* @__PURE__ */ jsxs("div", { style: styles.dangerZone, children: [
      /* @__PURE__ */ jsx("div", { style: styles.dangerTitle, children: "App komplett zur\xFCcksetzen" }),
      /* @__PURE__ */ jsx("div", { style: styles.dangerText, children: "L\xF6scht wirklich alles: alle Profile, Kalendereintr\xE4ge, Video-Links und Journal-Texte. F\xFCr den Start nach dem Testen." }),
      /* @__PURE__ */ jsx("button", { style: styles.dangerBtn, onClick: () => setConfirmAll(true), children: "Alles zur\xFCcksetzen" })
    ] }),
    confirmId && /* @__PURE__ */ jsx("div", { style: styles.modalOverlay, children: /* @__PURE__ */ jsxs("div", { style: { ...styles.modal, alignItems: "center", textAlign: "center" }, children: [
      /* @__PURE__ */ jsx(RotateCcw, { size: 30, color: "#FF7A5C" }),
      /* @__PURE__ */ jsx("div", { style: styles.summaryTitle, children: "Fortschritt zur\xFCcksetzen?" }),
      /* @__PURE__ */ jsxs("div", { style: styles.summarySub, children: [
        "XP, Level, Streak und Abzeichen von ",
        profiles[confirmId]?.name,
        " werden auf 0 gesetzt. Das kann nicht r\xFCckg\xE4ngig gemacht werden."
      ] }),
      /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 8, marginTop: 18, width: "100%" }, children: [
        /* @__PURE__ */ jsx("button", { style: { ...styles.secondaryBtn, flex: 1 }, onClick: () => setConfirmId(null), children: "Abbrechen" }),
        /* @__PURE__ */ jsx(
          "button",
          {
            style: { ...styles.primaryBtn, flex: 1, marginTop: 0, background: "#FF7A5C" },
            onClick: () => {
              onReset(confirmId);
              setConfirmId(null);
            },
            children: "Zur\xFCcksetzen"
          }
        )
      ] })
    ] }) }),
    confirmAll && /* @__PURE__ */ jsx("div", { style: styles.modalOverlay, children: /* @__PURE__ */ jsxs("div", { style: { ...styles.modal, alignItems: "center", textAlign: "center" }, children: [
      /* @__PURE__ */ jsx(X, { size: 30, color: "#FF7A5C" }),
      /* @__PURE__ */ jsx("div", { style: styles.summaryTitle, children: "Wirklich alles l\xF6schen?" }),
      /* @__PURE__ */ jsx("div", { style: styles.summarySub, children: "Alle Profile, Kalendereintr\xE4ge, Video-Links und Journal-Texte werden unwiderruflich gel\xF6scht. Danach startet die App komplett leer, ganz ohne Profile \u2013 du legst neue selbst an." }),
      /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 8, marginTop: 18, width: "100%" }, children: [
        /* @__PURE__ */ jsx("button", { style: { ...styles.secondaryBtn, flex: 1 }, onClick: () => setConfirmAll(false), children: "Abbrechen" }),
        /* @__PURE__ */ jsx(
          "button",
          {
            style: { ...styles.primaryBtn, flex: 1, marginTop: 0, background: "#FF7A5C" },
            onClick: () => {
              onResetAll();
              setConfirmAll(false);
            },
            children: "Ja, alles l\xF6schen"
          }
        )
      ] })
    ] }) })
  ] });
}
function SessionSummaryOverlay({ summary, onClose }) {
  return /* @__PURE__ */ jsx("div", { style: styles.modalOverlay, children: /* @__PURE__ */ jsxs("div", { style: { ...styles.modal, alignItems: "center", textAlign: "center" }, children: [
    /* @__PURE__ */ jsx(Trophy, { size: 40, color: "#FFD166" }),
    /* @__PURE__ */ jsx("div", { style: styles.summaryTitle, children: "Session geschafft!" }),
    /* @__PURE__ */ jsxs("div", { style: styles.summarySub, children: [
      summary.count,
      " \xDCbungen abgeschlossen"
    ] }),
    /* @__PURE__ */ jsxs("div", { style: styles.summaryXp, children: [
      "+",
      summary.xp,
      " XP"
    ] }),
    /* @__PURE__ */ jsx("button", { style: styles.primaryBtn, onClick: onClose, children: "Weiter" })
  ] }) });
}
function BottomNav({ tab, setTab }) {
  const items = [
    { id: "start", label: "Start", icon: Target },
    { id: "sport", label: "Sport", icon: Zap },
    { id: "mental", label: "Mental", icon: Brain },
    { id: "kalender", label: "Kalender", icon: Calendar },
    { id: "team", label: "Team", icon: Users }
  ];
  return /* @__PURE__ */ jsx("div", { style: styles.bottomNav, children: items.map((it) => {
    const Icon = it.icon;
    const active = tab === it.id;
    return /* @__PURE__ */ jsxs(
      "button",
      {
        style: { ...styles.navBtn, color: active ? "#4F8EFF" : "#666" },
        onClick: () => setTab(it.id),
        children: [
          /* @__PURE__ */ jsx(Icon, { size: 20, strokeWidth: active ? 2.5 : 2 }),
          /* @__PURE__ */ jsx("span", { style: styles.navLabel, children: it.label })
        ]
      },
      it.id
    );
  }) });
}
var styles = {
  app: {
    fontFamily: "'Inter', -apple-system, sans-serif",
    background: "linear-gradient(rgba(12,14,18,0.90), rgba(12,14,18,0.94)), url('background.jpg') center/cover no-repeat fixed, #0c0e12",
    minHeight: "100vh",
    color: "#eef0f3",
    display: "flex",
    flexDirection: "column",
    maxWidth: 480,
    margin: "0 auto",
    position: "relative"
  },
  loadingScreen: {
    background: "#0c0e12",
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  loadingRing: {
    width: 36,
    height: 36,
    border: "3px solid #20242d",
    borderTopColor: "#4F8EFF",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite"
  },
  pickerScreen: {
    fontFamily: "'Inter', -apple-system, sans-serif",
    background: "linear-gradient(rgba(12,14,18,0.90), rgba(12,14,18,0.94)), url('background.jpg') center/cover no-repeat fixed, #0c0e12",
    minHeight: "100vh",
    color: "#eef0f3",
    maxWidth: 480,
    margin: "0 auto",
    padding: "48px 20px"
  },
  pickerHeader: { display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 40 },
  pickerTitle: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 26,
    fontWeight: 700,
    letterSpacing: 2,
    marginTop: 10
  },
  pickerSub: { color: "#888", fontSize: 14, marginTop: 6 },
  pickerList: { display: "flex", flexDirection: "column", gap: 10 },
  pickerCard: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    background: "#161a21",
    border: "1px solid #20242d",
    borderRadius: 16,
    padding: "14px 16px",
    cursor: "pointer",
    color: "inherit"
  },
  pickerAddCard: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    justifyContent: "center",
    background: "transparent",
    border: "1px dashed #333844",
    borderRadius: 16,
    padding: "14px 16px",
    color: "#4F8EFF",
    cursor: "pointer",
    fontSize: 14
  },
  pickerAvatar: {
    width: 42,
    height: 42,
    borderRadius: 12,
    background: "#20242d",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: 16,
    color: "#4F8EFF",
    flexShrink: 0
  },
  pickerName: { fontWeight: 600, fontSize: 15 },
  pickerRole: { color: "#888", fontSize: 12, marginTop: 2 },
  topBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 20px",
    borderBottom: "1px solid #181c24"
  },
  topBarLeft: { display: "flex", alignItems: "center", gap: 10 },
  topAvatar: {
    width: 36,
    height: 36,
    borderRadius: 10,
    background: "#20242d",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    color: "#4F8EFF"
  },
  topName: { fontWeight: 600, fontSize: 14 },
  topRole: { color: "#888", fontSize: 11 },
  lockIconBtn: {
    width: 30,
    height: 30,
    borderRadius: "50%",
    background: "#161a21",
    border: "1px solid #2a2f3a",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer"
  },
  pinError: { color: "#FF7A5C", fontSize: 12, marginTop: 8 },
  pinHint: { fontSize: 11, color: "#777", lineHeight: 1.5, margin: "10px 0" },
  switchBtn: {
    background: "transparent",
    border: "1px solid #2a2f3a",
    color: "#aaa",
    fontSize: 12,
    padding: "6px 12px",
    borderRadius: 20,
    cursor: "pointer"
  },
  content: { flex: 1, overflowY: "auto", paddingBottom: 90 },
  tabPad: { padding: "24px 20px" },
  heroRow: { display: "flex", alignItems: "center", gap: 24, marginBottom: 32 },
  heroStats: { display: "flex", flexDirection: "column", gap: 14 },
  statLine: { display: "flex", alignItems: "center", gap: 8 },
  statValue: { fontSize: 20, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif" },
  statLabel: { color: "#888", fontSize: 12 },
  ringCenter: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center"
  },
  ringLevel: { fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 18 },
  ringXp: { color: "#888", fontSize: 10, marginTop: 2 },
  sectionHead: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    fontSize: 13,
    fontWeight: 600,
    color: "#aaa",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 14
  },
  sectionCount: { color: "#4F8EFF" },
  emptyBox: {
    background: "#161a21",
    border: "1px dashed #2a2f3a",
    borderRadius: 14,
    padding: 18,
    color: "#888",
    fontSize: 13,
    lineHeight: 1.5
  },
  emptyLink: { color: "#4F8EFF", cursor: "pointer", textDecoration: "underline" },
  entryRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    width: "100%",
    background: "#161a21",
    border: "1px solid #1f232c",
    borderRadius: 14,
    padding: "12px 14px",
    marginBottom: 8,
    cursor: "pointer",
    color: "inherit"
  },
  entryCheck: {
    width: 22,
    height: 22,
    borderRadius: "50%",
    border: "2px solid #333844",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  entryCheckDone: { background: "#4F8EFF", borderColor: "#4F8EFF" },
  entryIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0
  },
  entryTitle: { fontSize: 14, fontWeight: 500 },
  entryTitleDone: { color: "#666", textDecoration: "line-through" },
  entryCat: { fontSize: 11, color: "#777", marginTop: 1 },
  addIconBtn: {
    width: 26,
    height: 26,
    borderRadius: "50%",
    background: "#4F8EFF",
    border: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer"
  },
  dateLabel: { fontSize: 12, color: "#4F8EFF", fontWeight: 600, marginBottom: 8, textTransform: "uppercase" },
  calRow: { position: "relative" },
  calAssignee: { position: "absolute", right: 14, top: 14, fontSize: 10, color: "#666" },
  teamRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    background: "#161a21",
    border: "1px solid #1f232c",
    borderRadius: 14,
    padding: "12px 14px",
    marginBottom: 8
  },
  teamRank: { width: 20, textAlign: "center", color: "#888", fontSize: 13, fontWeight: 700 },
  teamXp: { fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, color: "#4F8EFF", fontSize: 14 },
  resetIconBtn: {
    width: 26,
    height: 26,
    borderRadius: "50%",
    background: "transparent",
    border: "1px solid #262b35",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    marginLeft: 8,
    flexShrink: 0
  },
  dangerZone: {
    marginTop: 24,
    padding: 16,
    borderRadius: 14,
    border: "1px dashed #4a2a28",
    background: "#1f1516"
  },
  dangerTitle: { color: "#FF7A5C", fontWeight: 700, fontSize: 13, marginBottom: 6 },
  dangerText: { color: "#a08782", fontSize: 12, lineHeight: 1.5, marginBottom: 12 },
  dangerBtn: {
    width: "100%",
    background: "transparent",
    border: "1px solid #FF7A5C",
    color: "#FF7A5C",
    borderRadius: 10,
    padding: "10px 0",
    fontWeight: 700,
    fontSize: 13,
    cursor: "pointer"
  },
  bottomNav: {
    position: "fixed",
    bottom: 0,
    left: "50%",
    transform: "translateX(-50%)",
    width: "100%",
    maxWidth: 480,
    display: "flex",
    background: "#0f1116",
    borderTop: "1px solid #181c24",
    padding: "10px 0 18px"
  },
  navBtn: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
    background: "none",
    border: "none",
    cursor: "pointer"
  },
  navLabel: { fontSize: 10, fontWeight: 600 },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "center",
    zIndex: 50
  },
  modal: {
    background: "#141820",
    width: "100%",
    maxWidth: 480,
    borderRadius: "20px 20px 0 0",
    padding: 22,
    display: "flex",
    flexDirection: "column",
    gap: 12
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontWeight: 700,
    fontSize: 15,
    marginBottom: 4
  },
  input: {
    background: "#0c0e12",
    border: "1px solid #262b35",
    borderRadius: 10,
    padding: "12px 14px",
    color: "#eef0f3",
    fontSize: 14,
    outline: "none",
    width: "100%",
    boxSizing: "border-box"
  },
  roleRow: { display: "flex", gap: 8, flexWrap: "wrap" },
  roleChip: {
    background: "#0c0e12",
    border: "1px solid #262b35",
    borderRadius: 20,
    padding: "8px 14px",
    fontSize: 12,
    color: "#aaa",
    cursor: "pointer"
  },
  roleChipActive: { borderColor: "#4F8EFF", color: "#4F8EFF" },
  quizBadge: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 11,
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 10
  },
  quizQuestion: { fontSize: 16, fontWeight: 600, lineHeight: 1.4 },
  quizOption: {
    background: "#0c0e12",
    border: "1px solid #262b35",
    borderRadius: 12,
    padding: "13px 14px",
    fontSize: 13,
    color: "#eef0f3",
    textAlign: "left",
    cursor: "pointer"
  },
  quizOptionCorrect: { borderColor: "#4F8EFF", background: "#4F8EFF14", color: "#4F8EFF" },
  quizOptionWrong: { borderColor: "#FF7A5C", background: "#FF7A5C14", color: "#FF7A5C" },
  quizFeedback: { fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 700, marginBottom: 14 },
  illustrationWrap: { display: "flex", flexDirection: "column", alignItems: "center", gap: 6, marginBottom: 14 },
  illustrationCircle: {
    width: 92,
    height: 92,
    borderRadius: "50%",
    border: "2px solid",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#0c0e12"
  },
  illustrationCaption: { fontSize: 10, color: "#666", textTransform: "uppercase", letterSpacing: 0.5 },
  quizExplanation: { fontSize: 13, color: "#ccc", lineHeight: 1.6, background: "#161a21", borderRadius: 12, padding: 14, marginBottom: 14 },
  videoBox: { marginBottom: 6 },
  videoLink: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    justifyContent: "center",
    color: "#5CC8FF",
    fontSize: 13,
    fontWeight: 600,
    textDecoration: "none",
    padding: "10px 0"
  },
  videoAddBtn: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    justifyContent: "center",
    width: "100%",
    background: "transparent",
    border: "1px dashed #333844",
    borderRadius: 10,
    padding: "10px 0",
    color: "#888",
    fontSize: 12,
    cursor: "pointer"
  },
  videoSaveBtn: {
    background: "#4F8EFF",
    border: "none",
    borderRadius: 8,
    padding: "0 14px",
    color: "#0c0e12",
    fontWeight: 700,
    fontSize: 12,
    cursor: "pointer"
  },
  videoNone: { textAlign: "center", color: "#555", fontSize: 12, padding: "8px 0" },
  viewModeTabs: { display: "flex", gap: 8, marginBottom: 18, background: "#161a21", borderRadius: 12, padding: 4 },
  viewModeTab: {
    flex: 1,
    background: "none",
    border: "none",
    borderRadius: 9,
    padding: "9px 0",
    fontSize: 13,
    fontWeight: 600,
    color: "#888",
    cursor: "pointer"
  },
  viewModeTabActive: { background: "#20242d", color: "#eef0f3" },
  secondaryBtn: {
    background: "transparent",
    border: "1px solid #2a2f3a",
    borderRadius: 12,
    padding: "0 16px",
    color: "#aaa",
    fontWeight: 600,
    fontSize: 13,
    cursor: "pointer"
  },
  previewRow: { display: "flex", alignItems: "center", gap: 12, marginBottom: 8 },
  previewNum: {
    width: 26,
    height: 26,
    borderRadius: "50%",
    border: "1.5px solid",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
    fontWeight: 700,
    flexShrink: 0
  },
  previewName: { fontSize: 14, fontWeight: 600 },
  previewPhase: { fontSize: 11, color: "#777", marginTop: 1 },
  previewBack: { textAlign: "center", color: "#666", fontSize: 12, marginTop: 14, cursor: "pointer" },
  sessionProgressLabel: { fontSize: 11, color: "#4F8EFF", fontWeight: 600, marginTop: 2 },
  summaryTitle: { fontFamily: "'Space Grotesk', sans-serif", fontSize: 20, fontWeight: 700, marginTop: 14 },
  summarySub: { color: "#aaa", fontSize: 13, marginTop: 6 },
  summaryXp: { fontFamily: "'Space Grotesk', sans-serif", fontSize: 28, fontWeight: 700, color: "#4F8EFF", margin: "14px 0" },
  groupTabs: { display: "flex", gap: 8, marginBottom: 6 },
  groupTab: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
    background: "#161a21",
    border: "1px solid #20242d",
    borderRadius: 12,
    padding: "10px 6px",
    fontSize: 11,
    fontWeight: 600,
    color: "#888",
    cursor: "pointer"
  },
  groupSub: { color: "#666", fontSize: 12, margin: "12px 0 16px" },
  exCard: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    width: "100%",
    background: "#161a21",
    border: "1px solid #1f232c",
    borderRadius: 14,
    padding: "12px 14px",
    marginBottom: 8,
    cursor: "pointer",
    color: "inherit"
  },
  exCheck: {
    width: 22,
    height: 22,
    borderRadius: "50%",
    border: "2px solid #333844",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  exName: { fontSize: 14, fontWeight: 600 },
  exDesc: { fontSize: 11, color: "#888", marginTop: 3, lineHeight: 1.4 },
  exMeta: { fontSize: 11, fontWeight: 700, whiteSpace: "nowrap", marginLeft: 8 },
  runnerDesc: { color: "#aaa", fontSize: 13, lineHeight: 1.5, marginBottom: 8 },
  runnerTimerWrap: { display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "12px 0" },
  runnerTimer: { fontFamily: "'Space Grotesk', sans-serif", fontSize: 48, fontWeight: 700 },
  runnerBtnRow: { display: "flex", gap: 14 },
  roundBtn: {
    width: 48,
    height: 48,
    borderRadius: "50%",
    background: "#20242d",
    border: "none",
    color: "#eef0f3",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer"
  },
  runnerRepsWrap: { display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "16px 0" },
  runnerReps: { fontFamily: "'Space Grotesk', sans-serif", fontSize: 24, fontWeight: 700 },
  journalLabel: { fontSize: 12, color: "#aaa", marginBottom: 6, fontWeight: 600 },
  storyText: { fontSize: 14, color: "#ddd", lineHeight: 1.7, marginBottom: 18 },
  affirmationHint: { fontSize: 12, color: "#888", lineHeight: 1.5, marginBottom: 14 },
  affirmationOption: {
    background: "#0c0e12",
    border: "1px solid #262b35",
    borderRadius: 12,
    padding: "12px 14px",
    fontSize: 13,
    color: "#eef0f3",
    textAlign: "left",
    cursor: "pointer"
  },
  affirmationOptionActive: { borderColor: "#FFD166", background: "#FFD16614", color: "#FFD166" },
  journalInput: {
    width: "100%",
    background: "#0c0e12",
    border: "1px solid #262b35",
    borderRadius: 10,
    padding: "10px 12px",
    color: "#eef0f3",
    fontSize: 13,
    fontFamily: "inherit",
    resize: "none",
    outline: "none",
    boxSizing: "border-box"
  },
  stepDots: { display: "flex", justifyContent: "center", gap: 6, marginTop: 6 },
  stepDot: { width: 8, height: 8, borderRadius: "50%", background: "#262b35" },
  stepDotActive: { background: "#4F8EFF", transform: "scale(1.3)" },
  stepDotDone: { background: "#3A5F99" },
  stepLabel: { textAlign: "center", fontSize: 13, fontWeight: 600, color: "#aaa", marginTop: 10 },
  primaryBtn: {
    background: "#4F8EFF",
    border: "none",
    borderRadius: 12,
    padding: "14px",
    fontWeight: 700,
    fontSize: 14,
    color: "#0c0e12",
    cursor: "pointer",
    marginTop: 6
  }
};
var rootEl = document.getElementById("root");
ReactDOM.createRoot(rootEl).render(/* @__PURE__ */ jsx(App, {}));
export {
  App as default
};

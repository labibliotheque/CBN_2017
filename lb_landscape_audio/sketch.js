/*

Ajouter un petit son au début de chaque jour
Ajouter un lfo dont la fréquence dépend de l'activité générale ?

*/

var mois = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
var jours = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
/* Lieux*/
var lieux = [
 "Bourg", "Haute Chaussée", "Charles-Gautier-Hermeland", "Bellevue", "Ludothèque Municipale", "Gao Xingjian - Sillon"
];
/* Emplacements */
var emplacements = [
    "albums", "arts", "graphisme", "bd adultes", "bd jeunesse", "cinema adultes", "cinema jeunesse", "cinema", "danse", "geographie", "histoire", "informatique", "jeux d'assemblage", "jeux d'exercices", "livres sur les jeux", "jeux a regles", "jeux symboliques", "jeux video", "langues", "litterature", "loisirs creatifs", "musique adultes", "musique jeunesse", "philosophie", "presse", "fonds pro", "psychologie", "romans adultes", "romans jeunesse", "religions", "sciences", "societe", "sports et loisirs", "vie pratique", "theatre"
]
var db
var index = 1;
var stopIndex = 31;
var loop = true;
var play = true;
var playbackS = 5;
var interSpeed = 0.85;
var fontBold
var fontRegular
var buffer;
var imgBuffer, img;
var settings

function preload() {
    db = loadJSON("../data/db_06122017.json");
    fontBold = loadFont("../assets/RenneBolArcTyp.otf")
    fontRegular = loadFont("../assets/RenneArcTyp.otf")
    ctx = getAudioContext();
    bufferSize = 1024
    node = ctx.createBufferSource();
    buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    data = buffer.getChannelData(0);
    for (var i = 0; i < bufferSize; i++) {
        data[i] = 0;
    }
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    background(0);
    colorMode(HSB, 360, 100, 100);
    //frameRate(1)
    textAlign(LEFT, TOP);
    textFont(fontBold);
    textSize(25);
    //
    node.buffer = buffer;
    node.loop = true;
    node.connect(p5.soundOut);
    node.start(0);
    //
    img = createGraphics(windowWidth, windowHeight);
    imgBuffer = createGraphics(windowWidth, windowHeight);
    imgBuffer.background(0);
    img.background(0);
    imgBuffer.colorMode(HSB, 360, 100, 100);
    title = new Title();
    settings = QuickSettings.create(windowWidth - 450, 0, "Informations et parmètres");
    settings.setWidth(450);
    settings.addHTML("Informations", "<p>Cette page web permet de sonifier les données issues des statistiques de prêts. Les données sont interprétés comme des signaux audio (valeurs entre -1 et 1) et sont directement injectées dans la carte son de l'ordinateur. Chaque jour dispose alors d'un son qui lui est propre généré directement à partir des statistiques d'emprunts des usagers.");
    settings.addHTML("Sélectionner les lieux à traiter", "");
    settings.addBoolean("Bourg", false, callbackLieu);
    settings.addBoolean("Haute Chaussée", false, callbackLieu);
    settings.addBoolean("Charles-Gautier-Hermeland", true, callbackLieu);
    settings.addBoolean("Bellevue", false, callbackLieu);
    settings.addBoolean("Ludothèque Municipale", false, callbackLieu);
    settings.addBoolean("Gao Xingjian - Sillon", false, callbackLieu);
    settings.addHTML("Sélectionner les dates concernées", "");
    settings.addDate("Date de début", "2017-01-01", selectDateB);
    settings.addDate("Date de fin", "2017-01-31", selectDateE);
    settings.addBoolean("Boucler", true, loopCallback);
    settings.addHTML("Paramètres de Défilement", "");
    settings.addBoolean("Jouer", true, playBack);
    settings.addRange("Vitesse", 5, 90, 55, -1, playbackSpeed);
    settings.addRange("Vitesse d'interpolation", 0.05, 0.9, 0.80, 0.05, interpolationSpeed);

}

function draw() {
    //background(0);
    noStroke()
    image(img, 0, 0, windowWidth, windowHeight);

    if (index > stopIndex) {
        if (loop) {
            index = 1;
        }
        else {
            play = false;
            index = 1;
        }
    }
    // se déplacer d'un jour dans la base de données
    if ((frameCount % playbackS) == 0 && play) {
        index += 1;
       // imgBuffer.push();
        imgBuffer.stroke(255);
        imgBuffer.fill(0,0.05);
        imgBuffer.rect(0,windowHeight/2,imgBuffer.width*2/3,windowHeight/2 -160);
       // imgBuffer.pop()
    }

    if (play) update();
    for (var i = 0; i < emplacements.length; i++) {
        push();
        textSize(18);
        var xpos = map(i, 0, emplacements.length, 0, windowWidth * 2 / 3);
        translate(xpos, windowHeight);
        rotate(-PI / 2);
        fill(map(i, 0, emplacements.length, 0, 320), 100, 100)
        text(emplacements[i], 0, 0);
        pop();
    }
    push()
    textAlign(LEFT, BOTTOM);
    fill(255);
    stroke(255);
    var d = db[index].date.split("/")
    var date = new Date(d[2], d[0] - 1, d[1])
    textSize(24)
    var content = jours[date.getDay()] + " " + date.getDate() + " " + mois[date.getMonth()] + " " + date.getFullYear() + " - " + db[index].Tous.total + " prêts";
    text(content, 25, 125);
    pop();
    title.update();
    title.draw();
}

function playBack(data) {
    play = data;
}

function playbackSpeed(data) {
    playbackS = data;
}

function interpolationSpeed(data) {
    interSpeed = data;
}

function callbackLieu() {
    //the data is used directly in the updateBuffer function ... yuck
}

function loopCallback(data) {
    loop = data;
}

function selectDateB() {
    var selectedStartDate = settings.getValuesAsJSON(false)["Date de début"].split("-")
    var date = new Date(int(selectedStartDate[0]), int(selectedStartDate[1] - 1), int(selectedStartDate[2]));
    date = date.toLocaleDateString();
    for (var i = 1; i < Object.keys(db).length - 1; i++) {
        if (db[i]["date"] == date) {
            index = i
            break
        }
    }
}

function selectDateE() {
    var selectedStopDate = settings.getValuesAsJSON(false)["Date de fin"].split("-")
    var date = new Date(int(selectedStopDate[0]), int(selectedStopDate[1] - 1), int(selectedStopDate[2]));
    date = date.toLocaleDateString();
    for (var i = 1; i < Object.keys(db).length - 1; i++) {
        if (db[i]["date"] == date) {
            stropIndex = i
            break
        }
    }
}

function update() {
    var yoffset = -1.5
    var xoffset = 4
        // on dessine notre image en fond de notre buffer (c'est le premier dessin qu'on effectue les suivants seront donc par dessus)
    imgBuffer.noStroke()
    imgBuffer.image(img, xoffset, yoffset, img.width, img.height);
    //buffer.filter(BLUR,0.48); // le blur est un peu gourmand à haute résolution
    // on le remplace par le "blur du pauvre" : un rectangle noir très transparent
    imgBuffer.fill(0, 0.0021);
    imgBuffer.rect(0, 0, img.width, img.height)
    updateAudioBuffer()
    img = imgBuffer;
}

function updateAudioBuffer() {
    data = node.buffer.getChannelData(0)
    var indexLieu
    var indexEmplacement
    imgBuffer.strokeWeight(0.5)
        /*
        for (var i = 0; i < bufferSize / 100; i++) {
            imgBuffer.stroke(255,0.5)
            imgBuffer.strokeWeight(0.15)
            var y = map(abs(data[i]), 1, 0, imgBuffer.height, windowHeight - 125);
            imgBuffer.line(-imgBuffer.width*2, y + random(-100, 100), imgBuffer.width *2, y + random(-100, 100));
        }*/
    for (var i = 0; i < bufferSize; i++) {
        indexLieu = int(i / 5) % lieux.length
        indexEmplacement = int(int(i / 5) / lieux.length)
        if (indexLieu < lieux.length && indexEmplacement < emplacements.length - 1) {
            var t = float(map(db[index][lieux[indexLieu]][emplacements[indexEmplacement]], 0, int(db[0]["Max_Tous"]), 0, 1))
            if (lieux[indexLieu] == "Bourg" && settings.getValuesAsJSON(false)["Bourg"] == true) {
                data[i] += (t - data[i]) * interSpeed
            }
            else if (lieux[indexLieu] == "Haute Chaussée" && settings.getValuesAsJSON(false)["Haute Chaussée"] == true) {
                data[i] += (t - data[i]) * interSpeed
            }
            else if (lieux[indexLieu] == "Charles-Gautier-Hermeland" && settings.getValuesAsJSON(false)["Charles-Gautier-Hermeland"] == true) {
                data[i] += (t - data[i]) * interSpeed
            }
            else if (lieux[indexLieu] == "Bellevue" && settings.getValuesAsJSON(false)["Bellevue"] == true) {
                data[i] += (t - data[i]) * interSpeed
            }
            else if (lieux[indexLieu] == "Ludothèque Municipale" && settings.getValuesAsJSON(false)["Ludothèque Municipale"] == true) {
                data[i] += (t - data[i]) * interSpeed
            }
            else if (lieux[indexLieu] == "Gao Xingjian - Sillon" && settings.getValuesAsJSON(false)["Gao Xingjian - Sillon"] == true) {
                data[i] += (t - data[i]) * interSpeed
            }
            else {
                data[i] = 0
            }
        }
        else {
            data[i] = 0
        }
        var xpos = map(i, 0, bufferSize, 5, windowWidth * 2 / 3)
        var hei = map(data[i], 0, 1, 1, windowHeight / 2)
            //imgBuffer.stroke(255,5);
        imgBuffer.noStroke();
        imgBuffer.fill(map(indexEmplacement, 0, emplacements.length, 0, 320), 100, 100);
        imgBuffer.rect(xpos, windowHeight - 160, windowWidth / bufferSize, -hei);
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    img = createGraphics(windowWidth, windowHeight);
    imgBuffer = createGraphics(windowWidth, windowHeight);
    imgBuffer.background(0);
    imgBuffer.colorMode(HSB, 360, 100, 100);
    img.background(0);
    settings.setPosition(windowWidth - 450, 0);
    settings.setWidth(450);
}

function Title() {
    this.newL = 0;
    this.l = 0;
    // calculate some font metrics
    this.name = "BIBLIOTHEQUE"
    this.nameWidth = textWidth(name);
    this.character = "A"
    this.cWidth = textWidth("A")
    this.spacing = 3
    this.padding = this.cWidth + this.spacing;
    this.update = function () {
        var total = 0
        for (var i = 0; i < lieux.length; i++) {
            total += int(db[index][lieux[i]].total)
        }
        this.newL = map(total, 0, db[0]["Max_Total"], 25, 500)
    }
    this.draw = function () {
        push()
        rectMode(CORNER);
        translate(25, 25);
        stroke(255)
        strokeWeight(1)
        fill(255)
        textFont(fontRegular)
        textSize(48)
        this.l += (this.newL - this.l) * 0.075
            // draw L with variable length
        rect(0, 36, this.l, -3)
        rect(0, 0, -3, 36)
            // draw A
        textAlign(LEFT, TOP);
        text(this.character, this.l + this.spacing, 0)
        text(this.name + " : Sonification ", this.l + this.padding + this.spacing + this.cWidth * 2 + this.spacing + 10, 0)
        pop();
    }
}

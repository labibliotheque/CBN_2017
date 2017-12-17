
var mois = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
var jours = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
/* Lieux*/
var lieux = [
 "Bourg", "Haute Chaussée", "Charles-Gautier-Hermeland", "Bellevue", "Ludothèque Municipale", "Gao Xingjian - Sillon"
];
/* Emplacements */
var emplacements = [
    "arts", "cinema adultes", "cinema jeunesse", "graphisme", "danse", "musique adultes", "musique jeunesse", "theatre", "albums", "bd adultes", "bd jeunesse", "litterature", "romans adultes", "romans jeunesse", "geographie"
 	, "histoire"
 	, "informatique"
 	, "langues"
 	, "loisirs creatifs"
 	, "philosophie"
 	, "psychologie"
 	, "sciences"
	, "fonds pro"
    , "presse"
 	, "societe"
 	, "sports et loisirs"
 	, "vie pratique"
    , "livres sur les jeux"
    , "jeux d'assemblage"
 	, "jeux d'exercices"
 	, "jeux a regles"
 	, "jeux symboliques"
	, "jeux video"
, ]
var db
    //
var fontBold
var fontRegular
    // buffers
var buffer; // audio
var imgBuffer, img; // graphic
var yoffset = -1.55
    //gui
var settings
    // sequencing
var click
var myPart // un metronome
var index = 1 // la position du sequenceur
var beat = 0;
var playbackS = 90 // la vitesse de défilement
var startIndex =1;
var stopIndex = 31;
var loop = true;
var play = true;
var interSpeed = 0.35;
var totPlay = true;

function preload() {
    db = loadJSON("../data/db.json");
    fontBold = loadFont("../assets/RenneBolArcTyp.otf")
    fontRegular = loadFont("../assets/RenneArcTyp.otf")
    ctx = getAudioContext();
    // buffer de 256 car il y a 33 emplacement fois 6 lieux = 198 on va donc padder la fin du buffer avec des zeros
    // qu'on ne represente pas
    bufferSize = 256
    node = ctx.createBufferSource();
    buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    data = buffer.getChannelData(0);
    for (var i = 0; i < bufferSize; i++) {
        data[i] = 0;
    }
    click = loadSound("../assets/134062__allibrante__allibrante-impulse-waveform-1.wav");
    console.log(emplacements.length, lieux.length, emplacements.length * lieux.length)
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    pixelDensity(1)

    colorMode(HSB, 360, 100, 100);
     background(200,100,60);
    //frameRate(1)
    textAlign(LEFT, TOP);
    textFont(fontBold);
    textSize(25);
    // audio buffer to fill with data
    node.buffer = buffer;
    node.loop = true;
    node.connect(p5.soundOut);
    node.start(0);
    // synth
    osc = new p5.SinOsc();
    osc.amp(0);
    osc.start();
    amplitude = new p5.Amplitude();
    // sequencer
    myPart = new p5.Part();
    var pulse = new p5.Phrase('pulse', step, [1, 1, 1, 1, 1]);
    myPart.addPhrase(pulse); // on ajoute notre phrase à l'objet part
    myPart.setBPM(playbackS);
    myPart.start();
    myPart.loop();
    // graphical buffers
    img = createGraphics(windowWidth, windowHeight);
    imgBuffer = createGraphics(windowWidth, windowHeight);
    //imgBuffer.background(0);
    img.colorMode(HSB, 360, 100, 100);
    img.background(0);
    imgBuffer.colorMode(HSB, 360, 100, 100);
    imgBuffer.background(200,100,20);
    //img.background(200,100,20);
    // moving title
    title = new Title();
     button = createSpan('<i class="fa fa-inverse fa-pause fa-2x" aria-hidden="true" ></i>');
    button.mousePressed(playBack);
    button.position(20, 80);
    // gui window
    settings = QuickSettings.create(windowWidth - 475, 25, "v  Informations et paramètres");

    settings.collapse();
    settings.setWidth(450);
    settings.addHTML("Informations", "<p>Cette page web permet de sonifier les données issues des statistiques de prêts. Les données sont interprétés comme des signaux audio (valeurs entre -1 et 1) et sont directement joués par la carte son de l'ordinateur.</p><p> Chaque jour dispose alors d'un son qui lui est propre généré directement à partir des statistiques d'emprunts des usagers.</p><p>Les jours sont marqués par un léger click et matérialisés par une barre blanche verticale, ils représentent des mesures musicales </p><p>Finalement, entre chaque 'pulsation' journalière, sont donnés à entendre les statistiques de totaux d'emprunt de chaque lieux pour la journée : plus le son est grave moins il y a eu d'emprunts.");
    settings.addHTML("Sélectionner les lieux à traiter", "");
    settings.addBoolean("Bourg", true, callbackLieu);
    settings.addBoolean("Haute Chaussée", true, callbackLieu);
    settings.addBoolean("Charles-Gautier-Hermeland", true, callbackLieu);
    settings.addBoolean("Bellevue", true, callbackLieu);
    settings.addBoolean("Ludothèque", true, callbackLieu);
    settings.addBoolean("Gao Xingjian", true, callbackLieu);
    settings.addBoolean("Totaux d'emprunts quotidien", true, callbackTotal);
    settings.addHTML("Sélectionner les dates concernées", "");
    settings.addDate("Date de début", "2017-01-01", selectDateB);
    settings.addDate("Date de fin", "2017-01-31", selectDateE);
    settings.addBoolean("Boucler", true, loopCallback);
    settings.addHTML("Paramètres de Défilement", "");
    settings.addRange("Vitesse", 60, 160, 90, 1, playbackSpeed);
    settings.addRange("Vitesse d'interpolation", 0.01, 1.0, 0.351, 0.025, interpolationSpeed);
    settings.addRange("Perspective", -10, -0.25, -1.55, 0.05, callbackPerspective);
}


function draw() {
    //background(0);
    noStroke()
    image(img, 0, 0, windowWidth, windowHeight);
    if (index > stopIndex) {
        if (loop) {
            index = startIndex;
        }
        else {
            play = false;
            index = startIndex  ;
        }
    }
    if (play) update();
    for (var i = 0; i < emplacements.length; i++) {
        push();
        textSize(18);
        textAlign(RIGHT, TOP);
        var xpos = map(i, 0, emplacements.length, 0, windowWidth * 2 / 3);
        translate(xpos, windowHeight - 155);
        rotate(-PI / 2);
        fill(map(i, 0, emplacements.length, 0, 320), 60, 100)
        text(emplacements[i], 0, 0);
        pop();
    }
    if (totPlay) {
        push();
        noStroke();
        textAlign(CENTER);
        imgBuffer.push()
        imgBuffer.translate(75 + beat * (windowWidth * 2 / 3) / lieux.length, height / 2);
        var value = int(db[index][lieux[beat]].total);
        var a = map(value, 0, int(db[0]["Max_Tous"]), 0.25, 1)
        var s = map(value, 0, int(db[0]["Max_Tous"]), 0, 50)
        imgBuffer.strokeWeight(1);
        imgBuffer.stroke(255, a);
        imgBuffer.noFill();
        var lvl = amplitude.getLevel()
        imgBuffer.ellipse(0, 0, s*(lvl+0.1), s*(lvl+0.1));
        imgBuffer.pop();
        pop();
        for (var i = 0; i < lieux.length; i++) {
            push()
            textAlign(CENTER, CENTER);
            translate(75 + i * (windowWidth * 2 / 3) / lieux.length, height / 2);
            fill(150);
            textSize(14);
            var lieu = lieux[i]
            if(lieu == lieux[4]){
                lieu = "Ludothèque"
            }
            else if(lieu == lieux[5]){
                lieu = "Gao-Xingjian"
            }
            text(lieu, 0, 0);
            pop();
        }
    }
    push()
    textAlign(LEFT, TOP);
    fill(255);
    stroke(255);
    var d = db[index].date.split("/")
    var date = new Date(d[2], d[0] - 1, d[1])
    textSize(24)
    var content = jours[date.getDay()] + " " + date.getDate() + " " + mois[date.getMonth()] + " " + date.getFullYear() + " - " + db[index].Tous.total + " prêts";
    text(content, 60, 85);
    pop();
    title.update();
    title.draw();
}

function step() {
    if (play) {
        beat += 1;
        beat = beat % lieux.length
        var value = int(db[index][lieux[beat]].total);
        if (value != 0) {
            if (totPlay) {
                var midi = (map(value, 0, int(db[0]["Max_Tous"]), 36, 48))
                var g = constrain(map(value, 0, int(db[0]["Max_Tous"]), 1, 0.21), 0.25, 1)
                osc.freq(midiToFreq(midi));
                osc.amp(g, 0.5);
                osc.pan(map(beat, 0, lieux.length, -1.0, 1.0), 0.5);
            }
        }
        if (beat % lieux.length == 0) {
            click.pan(0);
            click.play(0, 15, 1.0);
            index += 1;
            //imgBuffer.stroke(255);
            imgBuffer.noStroke();
            imgBuffer.fill(200,100,20, 0.015);
            imgBuffer.rect(0, 0, imgBuffer.width * 2 / 3, windowHeight - 160);
            imgBuffer.stroke(255, 0.5);
            //imgBuffer.line(0, windowHeight / 2, 0, windowHeight - 160);
            imgBuffer.strokeWeight(5);
            imgBuffer.line(imgBuffer.width * 2 / 3, windowHeight / 2, imgBuffer.width * 2 / 3, windowHeight - 160);
        }
    }
}

function callbackPerspective(data) {
    yoffset = data;
}

function callbackTotal(data) {
    totPlay = data;
}

function playBack(data) {
   play = !play
    if (!play) {
        button.elt.innerHTML = '<i class="fa fa-inverse fa-play fa-2x" aria-hidden="true"></i>';
         myPart.stop();
        masterVolume(0,1,0)
    }
    else {
        button.elt.innerHTML = '<i class="fa fa-inverse fa-pause fa-2x" aria-hidden="true"></i>';
        myPart.start();
        masterVolume(1,1,0)
    }

}

function playbackSpeed(data) {
    playbackS = data;
    myPart.setBPM(playbackS);
}

function interpolationSpeed(data) {
    interSpeed = data;
}

function callbackLieu() {
    //the data is used directly in the updateBuffer function ...
}

function loopCallback(data) {
    loop = data;
}

function selectDateB() {
    var selectedStartDate = settings.getValuesAsJSON(false)["Date de début"].split("-")
    var date = new Date(int(selectedStartDate[0]), int(selectedStartDate[1] - 1), int(selectedStartDate[2]));
    date = date.toLocaleDateString();
    for (var i = 1; i < Object.keys(db).length - 1; i++) {
        var dbDate = db[i]["date"].split("/")
        var dbDateObj = new Date(int(dbDate[2]), int(dbDate[0]-1), int(dbDate[1]))
        dbDateObj = dbDateObj.toLocaleDateString()
        if (dbDateObj == date) {
            startIndex = i
            console.log("found")
            break
        }
    }
    index = startIndex
}

function selectDateE() {
    var selectedStopDate = settings.getValuesAsJSON(false)["Date de fin"].split("-")
    var date = new Date(int(selectedStopDate[0]), int(selectedStopDate[1] - 1), int(selectedStopDate[2]));
    date = date.toLocaleDateString();
    for (var i = 1; i < Object.keys(db).length - 1; i++) {
        var dbDate = db[i]["date"].split("/")
        var dbDateObj = new Date(int(dbDate[2]), int(dbDate[0]-1), int(dbDate[1]))
        dbDateObj = dbDateObj.toLocaleDateString()
        if (dbDateObj== date) {
            stopIndex = i
            break
        }
    }
}

function update() {
    var xoffset = 4
        // on dessine notre image en fond de notre buffer (c'est le premier dessin qu'on effectue les suivants seront donc par dessus)
    imgBuffer.noStroke()
    imgBuffer.image(img, xoffset, yoffset, img.width, img.height);
    //buffer.filter(BLUR,0.48); // le blur est un peu gourmand à haute résolution
    // on le remplace par le "blur du pauvre" : un rectangle noir très transparent
    imgBuffer.fill(200,100,20, 0.0095);
    //imgBuffer.rect(0, 0, img.width, img.height)
    updateAudioBuffer()
    img = imgBuffer;
}
// audio and image
function updateAudioBuffer() {
    data = node.buffer.getChannelData(0)
    var indexLieu
    var indexEmplacement

    imgBuffer.strokeWeight(0.5)

    randomSeed(index)// random seed for each day
    for (var i = 0; i < bufferSize; i++) {
        indexLieu = int(i / 1) % lieux.length
        indexEmplacement = int(int(i / 1) / lieux.length)
        if (indexLieu < lieux.length && indexEmplacement < emplacements.length - 1) {
            // we need values beetween -1 and 1, but according to the mean of values we have this will give most values on a negative side
            // considering this mapping about the quantity of exchange the sign can be randomized check the randomSeed above
            var t = constrain(float(map(db[index][lieux[indexLieu]][emplacements[indexEmplacement]], 0, int(db[0]["Max_Tous"]), 0, 0.9)), 0, 0.9)
            if (random(0, 100) < 50) {
                t = t * (-1)
            }
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
            else if (lieux[indexLieu] == "Ludothèque Municipale" && settings.getValuesAsJSON(false)["Ludothèque"] == true) {
                data[i] += (t - data[i]) * interSpeed
            }
            else if (lieux[indexLieu] == "Gao Xingjian - Sillon" && settings.getValuesAsJSON(false)["Gao Xingjian"] == true) {
                data[i] += (t - data[i]) * interSpeed
            }
            else {
                data[i] = 0
            }
        }
        else {
            data[i] = 0
        }
        var xpos = map(i, 0, lieux.length * emplacements.length, 5, windowWidth * 2 / 3) // ie 198 on 256 bins the rest being zeroes
        xpos = constrain(xpos, 0, windowWidth * 2 / 3)
        var hei = abs(map((data[i]), -1, 1, -300, 300))
        imgBuffer.strokeWeight(1);
        //imgBuffer.stroke(255);
        //imgBuffer.noStroke();
        var h = map(indexEmplacement, 0, emplacements.length, 0, 320)
        imgBuffer.noFill()
        imgBuffer.stroke(h, 60, 100, 1);
        imgBuffer.push()
        imgBuffer.translate(xpos,windowHeight-160);
        imgBuffer.rectMode(CENTER)
        imgBuffer.rotate(PI/4)
        imgBuffer.rect(0, 0, hei, hei);
        imgBuffer.pop();
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    img = createGraphics(windowWidth, windowHeight);
    imgBuffer = createGraphics(windowWidth, windowHeight);
    imgBuffer.colorMode(HSB, 360, 100, 100);
    imgBuffer.background(200,100,20);

    img.background(0);
    settings.setPosition(windowWidth - 475, 25   );
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
        this.newL = map(total, 0, db[0]["Max_Total"], 10, windowWidth/4)
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
        text(this.name , this.l + this.padding + this.spacing + this.cWidth * 2 + this.spacing + 10, 0)
        pop();
    }
}

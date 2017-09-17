// faire de l'"action painting via des agents en dessinant leur chemin dans un buffer offscreen

var mois = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
var jours = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
var lieux = [
"Bourg", "Haute Chaussée", "Charles-Gautier-Hermeland", "Bellevue", "Ludothèque Municipale", "Gao Xingjian - Sillon"
];
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
var index = 1;
var play = true
var fontBold
var fontRegular
var img = new Image;
var pg;
var coordinates = {
    "Bourg": [0.247, 0.671]
    , "Haute Chaussée": [0.136, 0.758]
    , "Charles-Gautier-Hermeland": [0.493, 0.328]
    , "Bellevue": [0.530, 0.746]
    , "Ludothèque Municipale": [0.486, 0.929]
    , "Gao Xingjian - Sillon": [0.602, 0.147]
}
var nodes = []
    //gui
var settings
    // sequencing
var myPart // un metronome
var index = 1 // la position du sequenceur
var beat = 0;
var playbackS = 20 // la vitesse de défilement
var stopIndex = 31;
var loop = true;
var play = true;
var drawPg = true;
var drawNodes = true;
var drawBack = true;
var drawLegend = true;
var drawNames = true;

function preload() {
    db = loadJSON("../data/db_06122017.json");
    fontBold = loadFont("../assets/RenneBolArcTyp.otf")
    fontRegular = loadFont("../assets/RenneArcTyp.otf")
    img.src = "../assets/fond_carte_no_text.svg";
    // png = loadImage('../assets/fond_de_carte_no_text.png')
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    pg = createGraphics(windowWidth, windowHeight);
    pg.colorMode(HSB, 360, 100, 100, 100)
    colorMode(HSB, 360, 100, 100, 100)
    textAlign(CENTER, CENTER);
    textFont(fontBold);
    textSize(25)
        //
    myPart = new p5.Part();
    var pulse = new p5.Phrase('pulse', step, [1, 1, 1, 1, 1]);
    myPart.addPhrase(pulse); // on ajoute notre phrase à l'objet part
    myPart.setBPM(playbackS);
    myPart.start();
    myPart.loop();
    settings = QuickSettings.create(windowWidth - 475, 25, "Informations et parmètres");
    settings.setWidth(450);
    settings.addHTML("Informations", "<p>Cette visualisation représente la diffusion des ouvrages dans son environnement. Chaque jour un lieu produit un ensemble de points colorés, correspondant au nombre de prêts pour chaque catégorie documentaire. Ces points se disséminent dans l'espace en laissant une trace sur un fond de carte représentant les différents lieux du réseau.</p>");
    settings.addHTML("Sélectionner les dates concernées", "");
    settings.addDate("Date de début", "2017-01-01", selectDateB);
    settings.addDate("Date de fin", "2017-01-31", selectDateE);
    settings.addBoolean("Boucler", true, loopCallback);
    settings.addHTML("Paramètres de Défilement", "");
    settings.addBoolean("Jouer", true, playBack);
    settings.addRange("Vitesse", 15, 40, 25, 1, playbackSpeed);
    settings.addHTML("Paramètres de Calques", "");
    settings.addBoolean("Afficher la légende", true, legendCallback);
    settings.addBoolean("Afficher le nom des lieux", true, namesCallback);
    settings.addBoolean("Afficher le fond de carte", true, drawBackCallback);
    settings.addBoolean("Afficher les agents", true, drawNodesCallback);
    settings.addBoolean("Afficher l'image générée", true, drawPgCallback);
    settings.addButton("Effacer l'image générée", resetPgCallback);

    imageMode(CENTER);

    drawingContext.shadowOffsetX = 2;
    drawingContext.shadowOffsetY = 2;
    drawingContext.shadowColor = "white ";
    drawingContext.shadowBlur = 5;

    title = new Title();
}

function draw() {
    background(0);

     drawingContext.shadowOffsetX = 2;
    drawingContext.shadowOffsetY = 2;
    drawingContext.shadowColor = "white ";
    drawingContext.shadowBlur = 5;

    if (index > stopIndex) {
        if (loop) {
            index = 1;
        }
        else {
            play = false;
            index = 1;
        }
    }

    //if (frameCount % 100 == 0) console.log(frameRate())

    if (drawPg) image(pg, windowWidth / 2, windowHeight / 2, windowWidth, windowHeight);
    /* update and display the data*/
    for (var i = 0; i < nodes.length; i++) {
        /* update life*/
        nodes[i].life -= 0.10;
        nodes[i].diameter -= 0.113;
        if (nodes[i].life < 5) nodes.splice(i, 1)
        nodes[i].update();
        if (nodes[i].location.x < 0 || nodes[i].location.y > windowWidth) {
            nodes.splice(i, 1)
        }
        else if (nodes[i].location.y < 0 || nodes[i].location.y > windowHeight) {
            nodes.splice(i, 1)
        }
        if (drawNodes) nodes[i].display();
        nodes[i].displayOffscreen(pg, nodes);
        for (var j = 0; j < nodes.length; j++) {
            if (i != j) {
                nodes[i].attract(nodes[j])
            }
        }
        nodes[i].over(mouseX, mouseY)
    }
    /* draw background image*/

    if (drawBack) {

        drawingContext.drawImage(img, windowWidth / 4, windowHeight / 4, windowWidth / 2, windowHeight / 2);


    }

    if (drawNames){
        /* draw names*/
        push();
        textAlign(CENTER, CENTER);
        textFont(fontBold)
        textSize(20)
        fill(0)
        for (var i = 0; i < lieux.length; i++) {
            text(lieux[i], coordinates[lieux[i]][0] * windowWidth / 2 + windowWidth / 4, coordinates[lieux[i]][1] * windowHeight / 2 + windowHeight / 4)
        }
        pop()
    }

    if (drawLegend){
    /* draw color legend*/
    push()
    for (var i = 0; i < emplacements.length; i++) {
        var h = map(i, 0, emplacements.length, 0, 320)
        textAlign(LEFT, CENTER)
        noStroke();
        fill(h, 100, 100)
        ellipse(25, windowHeight - 50 - i * 20, 15, 15)
        fill(180)
        textFont(fontRegular)
        textSize(15)
        text(emplacements[i], 40, windowHeight - 50 - i * 20)
    }
    pop()
    }

     drawingContext.shadowOffsetX = 0;
    drawingContext.shadowOffsetY = 0;

    drawingContext.shadowBlur = 0;

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

function drawNodesCallback(data) {
    drawNodes = data;
}

function drawPgCallback(data) {
    drawPg = data;
}

function drawBackCallback(data) {
    drawBack = data;
}


function legendCallback(data) {
    drawLegend = data;
}
function namesCallback(data) {
    drawNames = data;
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}


function resetPgCallback(){
    pg.background(0);
}



function step() {
    beat += 1;
    beat = beat % lieux.length
        //console.log(beat, lieux[beat]);
    if (play) {
        if (beat == 0) index += 1;
        for (var j = 0; j < emplacements.length; j++) {
            var xpos = coordinates[lieux[beat]][0] * windowWidth / 2 + windowWidth / 4
            var ypos = coordinates[lieux[beat]][1] * windowHeight / 2 + windowHeight / 4
            var h = map(j, 0, emplacements.length, 0, 320)
            var s = map(db[index][lieux[beat]][emplacements[j]], 0, int(db[0]["Max_Tous"]), 24, 175)
            var d = db[index].date
            var l = lieux[beat]
            var e = emplacements[j]
            var v = db[index][lieux[beat]][emplacements[j]]
            var data = {
                date: d
                , lieu: l
                , emplacement: e
                , valeur: v
            }
            if (int(v) != 0) {
                var n = new Node(xpos + random(-15, 15), ypos + random(-15, 15), h, s, data)
                var time = j * 0.01
                nodes.push(n)
            }
        }
    }
}

function playBack(data) {
    play = data;
    myPart.stop();
}

function playbackSpeed(data) {
    playbackS = data;
    myPart.setBPM(playbackS);
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
            stopIndex = i
            break
        }
    }
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
        text(this.name + " : Semis ", this.l + this.padding + this.spacing + this.cWidth * 2 + this.spacing + 10, 0)
        pop();
    }
}

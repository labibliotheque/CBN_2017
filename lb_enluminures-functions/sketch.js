
var mois = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
var jours = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
var colorNames = ["bleu", "orange", "rouge", "vert", "jaune", "violet", "blanc"];
/* Lieux*/
var lieux = [
"Bourg", "Haute Chaussée", "Charles-Gautier-Hermeland", "Bellevue", "Ludothèque Municipale", "Gao Xingjian - Sillon"
];
/* Emplacements */
var emplacements = [
    "albums", "arts", "graphisme", "bd adultes", "bd jeunesse", "cinema adultes", "cinema jeunesse", "cinema", "danse", "geographie", "histoire", "informatique", "jeux d'assemblage", "jeux d'exercices", "livres sur les jeux", "jeux a regles", "jeux symboliques", "jeux video", "langues", "litterature", "loisirs creatifs", "musique adultes", "musique jeunesse", "philosophie", "presse", "fonds pro", "psychologie", "romans adultes", "romans jeunesse", "religions", "sciences", "societe", "sports et loisirs", "vie pratique", "theatre"
];
var arts = ["arts"
            , "cinema adultes"
            , "cinema jeunesse"
            , "graphisme"
            , "danse"
            , "musique adultes"
            , "musique jeunesse"
            , "theatre"
            , "albums"
            , "bd adultes"
            , "bd jeunesse"
            , "littérature"
            , "romans adultes"
            , "romans jeunesse"];
var savoirs = [
    "geographie"
 	, "histoire"
 	, "informatique"
 	, "langues"
 	, "livres sur les jeux"
 	, "loisirs creatifs"
 	, "philosophie"
 	, "psychologie"
 	, "sciences"
	, "fonds pro"];
var loisirs = [
    "presse"
 	, "societe"
 	, "sports et loisirs"
 	, "vie pratique"
 	, "Jeux"
 	, "jeux d'assemblage"
 	, "jeux d'exercices"
 	, "jeux a regles"
 	, "jeux symboliques"
	, "jeux video"];
var xsize = 300
var ysize = 40
var scribble = new Scribble();
var db
var pindex = 1 // previous index
var index = 1
var fontBold
var fontRegular
var play = true
var logos = [];
var incr = 0;

function preload() {
    db = loadJSON("../data/db.json");
    fontBold = loadFont("../assets/RenneBolArcTyp.otf")
    fontRegular = loadFont("../assets/RenneArcTyp.otf")
    imageLegend = loadImage("../assets/legende_enluminures.png")
}

function setup() {
    createCanvas(windowWidth, windowHeight)
    background(255, 0, 0, 1)
    randomSeed(3141);
    for (var i = 0; i < lieux.length; i++) {
        logos.push(new Logo(lieux[i], 0.5))
        logos[i].setType(4)
    }
    title = new Title();
    // calculate some font metrics
    name = "BIBLIOTHEQUE"
    nameWidth = textWidth(name);
    character = "A"
    cWidth = textWidth("A")
    spacing = 3
    padding = cWidth + spacing;
    // gui
    button = createSpan('<i class="fa fa-pause fa-2x" aria-hidden="true" ></i>');
    button.mousePressed(makeplay);
    button.position(windowWidth-53 , 75);
   // button.size(500, 500);

    nDays = Object.keys(db).length - 1;
    slider = createSlider(1, nDays, 1, 1);
    slider.position(windowWidth / 4, windowHeight - 75);
    slider.size(windowWidth / 2, 50);
    legend = new Legend();
}

function draw() {
    background(255)
    incr+=0.5

    pindex = index;
    index = int(slider.value());

    // update new data from database if index has changed
    if (index != pindex) updateLogos();

    // auto play
    if (incr % 90 == 0 && play) {
        slider.elt.valueAsNumber += 1;
    }
    // do a small animation when in play mode
    if (play) {
        var val = abs(pow(sin(map(incr % 90, 0, 90, PI / 2, PI)), 6)) * 10;
        scribble.bowing = val / 5;
        scribble.roughness = val;
    }
    else {
        scribble.bowing = 1;
        scribble.roughness = 1;
    }

    // draw every logo for each place (a logo is a set of form and a responsive name)
    for (var i = 0; i < logos.length; i++) {
        var x = (i % 3) * windowWidth / 3 + windowWidth / 6
        var y = int(i / 3) * windowHeight / 3 + windowHeight / 3
        push()
        translate(x, y)
        logos[i].display()
        pop()
    }

    // the legend needs to hide  most graphic elements - except title and date
    legend.draw();
    legend.isOver(mouseX, mouseY);

    // draw the title which reacts to the data
    title.update();
    title.draw();

    // display the date
    push();
    textAlign(CENTER, BOTTOM)
    fill(0);
    stroke(0);
    var d = db[index].date.split("/")
    var date = new Date(d[2], d[0] - 1, d[1])
    var content = jours[date.getDay()] + " " + date.getDate() + " " + mois[date.getMonth()] + " " + date.getFullYear();
    var xoffset = map(slider.value(), 1, nDays, windowWidth / 4, windowWidth * 3 / 4);
    textFont(fontRegular)
    textSize(16)
    text(content, windowWidth/2, windowHeight-75);
    pop();
}

// play & pause button
function makeplay() {
    play = !play
    if (!play) {
        button.elt.innerHTML = '<i class="fa fa-play fa-2x" aria-hidden="true"></i>';
    }
    else {
        button.elt.innerHTML = '<i class="fa fa-pause fa-2x" aria-hidden="true"></i>';
    }
    console.log(play)
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight)
    slider.size(windowWidth / 2, 50);
    slider.position(windowWidth / 4, windowHeight - 75);

    button.position(windowWidth-60 , 75);
}

function updateLogos() {
    for (var i = 0; i < lieux.length; i++) {
        var total = int(db[index][lieux[i]].total)
        var type = (db[index][lieux[i]]["top-emplacement"])
        var l = map(total, 0, db[0]["Max_Total"], 25, 500)
        var t = 4
        if (type == "") {
            t = 4
        }
        else if (savoirs.indexOf(type) != -1) {
            t = int(random(2)) + 5
                //console.log("savoirs")
        }
        else if (arts.indexOf(type) != -1) {
            t = int(random(2)) + 2
                //console.log("arts")
        }
        else if (loisirs.indexOf(type) != -1) {
            t = int(random(2))
                //console.log("loisirs")
        }
        //console.log(lieux[i], type)
        logos[i].setType(t)
        logos[i].setLength(l)
    }
}

function Title() {
    this.newL = 0;
    this.l = 0;
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
        stroke(0)
        strokeWeight(1)
        fill(0)
        textFont(fontRegular)
        textSize(48)
        this.l += (this.newL - this.l) * 0.075
            // draw L with variable length
        rect(0, 36, this.l, -3)
        rect(0, 0, -3, 36)
            // draw A
        textAlign(LEFT, TOP);
        text(character, this.l - padding / 2 + spacing, 0)
            //rect(this.l / 2 + padding + spacing + cWidth * 2 + spacing, -36, 10, -3)
            // textAlign(CENTER, CENTER);
        text(name + " : Identités ", this.l + padding + spacing + cWidth * 2 + spacing + 10, 0)
        pop();
    }
}

function Logo(lieu, sc) {
    this.lieu = lieu
    this.scale = sc
    this.l = 25
    this.newL = 25
    this.form = new Form()
    this.type = 0
    this.display = function () {
        push()
        scale(this.scale)
        stroke(0)
        strokeWeight(1)
        fill(0)
        textFont(fontRegular)
        textSize(48)
        this.l += (this.newL - this.l) * 0.075
        rect(-this.l / 2 - padding, -36, this.l, -3)
        rect(-this.l / 2 - padding, -72, -3, 36)
        textAlign(LEFT, CENTER);
        text(character, this.l / 2 - padding / 2 + spacing, -52)
        rect(this.l / 2 + padding + spacing + cWidth * 2 + spacing, -36, 10, -3)
        textAlign(CENTER, CENTER);
        text(name, 0, 0)
        textSize(36)
        text(this.lieu, 0, 52)
        push()
        rotate(PI / 4)
        translate(0, height / 4)
        this.form.update(this.type, xsize, ysize)
        pop()
        push()
        rotate(3 * PI / 4)
        translate(0, height / 4)
        this.form.update(this.type, xsize, ysize)
        pop()
        push()
        rotate(5 * PI / 4)
        translate(0, height / 4)
        this.form.update(this.type, xsize, ysize)
        pop()
        push()
        rotate(7 * PI / 4)
        translate(0, height / 4)
        this.form.update(this.type, xsize, ysize)
        pop()
        pop()
    }
    this.setLength = function (val) {
        this.newL = val
    }
    this.setType = function (val) {
        this.type = val
    }
}

function Form() {
    this.update = function (t, scaleX, scaleY) {
        if (t == 0) this.drawHash(scaleX, scaleY)
        else if (t == 1) this.drawStraight(scaleX, scaleY)
        else if (t == 2) this.drawSinus(scaleX, scaleY)
        else if (t == 3) this.drawCroisillon(scaleX, scaleY)
        else if (t == 4) this.drawLine(scaleX, scaleY)
        else if (t == 5) this.drawDoubleLine(scaleX, scaleY)
        else if (t == 6) this.drawTrippleLine(scaleX, scaleY)
    }
    this.drawHash = function (scaleX, scaleY) {
        var unit = scaleX / 25
        for (var i = -scaleX / 2; i < scaleX / 2; i += unit) {
            if (i + 2 * unit > scaleX / 2) break
            scribble.scribbleLine(i, -scaleY / 2, i + 2 * unit, scaleY / 2)
        }
    }
    this.drawStraight = function (scaleX, scaleY) {
        var unit = scaleX / 25
        for (var i = -scaleX / 2; i <= scaleX / 2; i += unit) {
            scribble.scribbleLine(i, -scaleY / 2, i, scaleY / 2)
        }
    }
    this.drawSinus = function (scaleX, scaleY) {
        strokeJoin(ROUND)
        var prevX = -scaleX / 2
        var prevY = 0
        var newX = 0
        var newY = 0
        for (var i = -scaleX / 2; i < scaleX / 2; i += 7) {
            var angle = map(i, -scaleX / 2, scaleX / 2, 0, TWO_PI * 5)
            newX = i
            newY = sin(angle) * scaleY / 2
            scribble.scribbleLine(prevX, prevY, newX, newY)
            prevX = newX
            prevY = newY
        }
    }
    this.drawCroisillon = function (scaleX, scaleY) {
        var unit = scaleX / 15
        for (var i = -scaleX / 2; i < scaleX / 2; i += unit) {
            scribble.scribbleLine(i, 0, i + unit / 2, scaleY / 2)
            scribble.scribbleLine(i, 0, i + unit / 2, -scaleY / 2)
            scribble.scribbleLine(i + unit / 2, scaleY / 2, i + unit, 0)
            scribble.scribbleLine(i + unit / 2, -scaleY / 2, i + unit, 0)
        }
    }
    this.drawLine = function (scaleX, scaleY) {
        strokeWeight(3)
        scribble.scribbleLine(-scaleX / 2, 0, +scaleX / 2, 0)
    }
    this.drawDoubleLine = function (scaleX, scaleY) {
        strokeWeight(2)
        scribble.scribbleLine(-scaleX / 2, -scaleY / 4, +scaleX / 2, -scaleY / 4)
        scribble.scribbleLine(-scaleX / 2, +scaleY / 4, +scaleX / 2, +scaleY / 4)
    }
    this.drawTrippleLine = function (scaleX, scaleY) {
        strokeWeight(4)
        scribble.scribbleLine(-scaleX / 2, 0, +scaleX / 2, 0)
        strokeWeight(1)
        scribble.scribbleLine(-scaleX / 2, -scaleY / 2, +scaleX / 2, -scaleY / 2)
        scribble.scribbleLine(-scaleX / 2, +scaleY / 2, +scaleX / 2, +scaleY / 2)
    }
}

function Legend() {
    this.over = false;
    this.forms = [];
    for (var i = 0; i < 7; i++) {
        this.forms.push(new Form())
    }
    this.draw = function () {
        if (this.over) {
            noStroke()
            fill(255,230)
            rect(0, 0, windowWidth, windowHeight)
            textSize(16);
            fill(0)
            textAlign(LEFT, TOP)
            text("La taille de la barre des 'L' dépend de la quantité de documents sortis pour la journée sélectionnée", 38, 106)
            drawArrow(40, 100, -HALF_PI, 20)
            textAlign(LEFT, BOTTOM)

            var xoffset = map(slider.value(), 1, nDays, windowWidth / 4, windowWidth * 3 / 4);
            text("Déplacez ce curseur pour changer la date manuellement", xoffset, windowHeight - 120)
            drawArrow(xoffset + 4, windowHeight - 116, HALF_PI, 36), textAlign(CENTER, CENTER)
            textSize(18)
            text("Pour chaque logo, le type d'encadrement donne une indication sur le type d'ouvrage le plus emprunté :", width / 2, height / 3)
            imageMode(CENTER, TOP)
            image(imageLegend, width / 2, height / 2)
        }
        push()
        translate(windowWidth - 40, 40);
        fill(180)
        noStroke()
        ellipse(0, 0, 40, 40)
        textAlign(CENTER, CENTER);
        fill(0)
        textSize(28)
        text("?", 0, 0)
        pop()
    }
    this.isOver = function (xpos, ypos) {
        if (dist(xpos, ypos, windowWidth - 40, 40) < 40) this.over = true;
        else this.over = false;
    }
}

function drawArrow(xpos, ypos, rot, s) {
    push()
    strokeWeight(3);
    fill(50, 220, 255)
    stroke(50, 220, 255)
    translate(xpos, ypos)
    rotate(rot)
    line(0, 0, s, 0)
    strokeWeight(1);
    triangle(s, s / 5, s + s / 4, 0, s, -s / 5)
    pop()
}


var mois = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
var jours = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
var colorNames = ["bleu", "orange", "rouge", "vert", "jaune", "violet", "blanc"];
/* Lieux*/
var lieux = [
"Tous", "Bourg", "Haute Chaussée", "Charles-Gautier-Hermeland", "Bellevue", "Ludothèque Municipale", "Gao Xingjian - Sillon"
];
/* Emplacements */
var emplacements = [
    "albums", "arts", "graphisme", "bd adultes", "bd jeunesse", "cinema adultes", "cinema jeunesse", "cinema", "danse", "geographie", "histoire", "informatique", "jeux d'assemblage", "jeux d'exercices", "livres sur les jeux", "jeux a regles", "jeux symboliques", "jeux video", "langues", "litterature", "loisirs creatifs", "musique adultes", "musique jeunesse", "philosophie", "presse", "fonds pro", "psychologie", "romans adultes", "romans jeunesse", "religions", "sciences", "societe", "sports et loisirs", "vie pratique", "theatre"
]
var db
var index = 1;
var pindex = 1;
var play = true
var colors
var fontBold
var fontRegular
var stars = [];
var rotation;

function preload() {
    db = loadJSON("../data/db.json");
    fontBold = loadFont("../assets/RenneBolArcTyp.otf")
    fontRegular = loadFont("../assets/RenneArcTyp.otf")
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    pixelDensity(1)
    background(0);
    //frameRate(1)
    textAlign(CENTER, CENTER);
    textFont(fontBold);
    textSize(25)
    colors = {
        bleu: color(0, 165, 255, 255)
        , orange: color(255, 120, 0, 255)
        , rouge: color(255, 0, 0, 255)
        , vert: color(0, 255, 150, 255)
        , jaune: color(255, 255, 85, 255)
        , violet: color(142, 75, 167, 255)
        , blanc: color(255, 255, 255, 255)
    }
    for (var i = 1; i < lieux.length; i++) {
        stars.push(new Star(width / 8, width / 2, colors[colorNames[i - 1]]))
    }
    stars.forEach(s => {
        s.initArrays()
    })
    pg = createGraphics(windowWidth, windowHeight);
    // gui
     button = createSpan('<i class="fa fa-inverse fa-pause fa-2x" aria-hidden="true" ></i>');
    button.mousePressed(makeplay);
    button.position(23, 75);
    //button.size(75, 50);
    nDays = Object.keys(db).length - 1;
    slider = createSlider(1, nDays, 1, 1);
    slider.position(windowWidth / 4, windowHeight - 75);
    slider.size(windowWidth / 2, 50);
    title = new Title();
    legend = new Legend();
}

function draw() {
    background(0);
    image(pg, 0, 0)
    pg.background(0, 10)
        // superposition d'étoiles
    push()
    translate(width / 4, height / 2)

    for (var i = 0; i < stars.length; i++) {
        noFill();
        stroke(colors[colorNames[i]])
        stars[i].updatePoints();
        stars[i].drawOffscreen(colors[colorNames[i]]);
        stars[i].drawLabel();
        stars[i].isOver(mouseX - width / 4, mouseY - height / 2, colors[colorNames[i]])
    }
    pop();
    // étoiles individuelles
    push();
    translate(width * 19 / 20, 0)
    for (var i = 0; i < stars.length; i++) {
        push()
        translate(0, (i + 2) * height / (stars.length + 3))
        var c = colors[colorNames[i]]
        if (db[index][lieux[i + 1]].total != 0) {
            push()
            scale(0.15)
            stroke(c);
            fill(c);
            stars[i].draw();
            pop()
        }
        stroke(c);
        fill(c);
        stars[i].drawInfo(db[index][lieux[i + 1]], lieux[i + 1])
        pop()
    }
    pop();
    pindex = index;
    index = int(slider.value());
    if (pindex != index) {
        for (var i = 0; i < stars.length; i++) {
            stars[i].updateTargets(db[index][lieux[i + 1]], lieux[i + 1])
        }
    }
    // se déplacer d'un jour dans la base de données
    if (frameCount % 90 == 0 && play) {
        slider.elt.valueAsNumber += 1;
    }
    // display the date
    push();
    textAlign(CENTER, BOTTOM)
    fill(255);
    stroke(255);
    var d = db[index].date.split("/")
    var date = new Date(d[2], d[0] - 1, d[1])
    var content = jours[date.getDay()] + " " + date.getDate() + " " + mois[date.getMonth()] + " " + date.getFullYear() + " : " + db[index].Tous.total + " prêts";
    var xoffset = map(slider.value(), 1, nDays, windowWidth / 4, windowWidth * 3 / 4);
    textFont(fontRegular)
    textSize(16)
    text(content, windowWidth / 2, windowHeight - 75);
    pop()
        // draw the title which reacts to the data
    title.update();
    title.draw();
    // draw explanations
    textFont(fontBold)
    legend.isOver(mouseX,mouseY);
    legend.draw();
}
// play & pause button
function makeplay() {
    play = !play
    if (!play) {
        button.elt.innerHTML = '<i class="fa fa-inverse fa-play fa-2x" aria-hidden="true"></i>';
    }
    else {
        button.elt.innerHTML = '<i class="fa fa-inverse fa-pause fa-2x" aria-hidden="true"></i>';
    }
}

function mouseDragged() {
    rotation = map(mouseX, 0, windowWidth, 0, TWO_PI)
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight)
    slider.size(windowWidth / 2, 50);
    slider.position(windowWidth / 4, windowHeight - 75);
    button.position(23, 75);
    pg = createGraphics(width, height);
}

function Star(innerR, outterR) {
    this.innerRadius = innerR;
    this.maxRadius = outterR;
    this.limit = emplacements.length;
    this.anglePortion = TWO_PI / this.limit;
    this.positions = []
    this.targets = []
    this.data = []
    this.initArrays = function () {
        this.positions = []
        this.targets = []
        for (var i = 0; i < this.limit; i++) {
            var xpos2 = this.innerRadius * cos(map(i, 0, this.limit, this.anglePortion / 2, TWO_PI));
            var ypos2 = this.innerRadius * sin(map(i, 0, this.limit, this.anglePortion / 2, TWO_PI));
            var v3 = createVector(xpos2, ypos2);
            var v4 = createVector(xpos2, ypos2);
            this.positions.push(v3);
            this.targets.push(v4);
            this.data.push(0);
        }
    }
    this.updateTargets = function (data, lieu) {
        for (var i = 0; i < this.targets.length; i += 1) {
            var xpos = (map((int(data[emplacements[i]])), 0, int(db[0]["Max_Tous"]), this.innerRadius, this.innerRadius + this.maxRadius)) * cos(map(i, 0, this.limit, this.anglePortion / 2, TWO_PI));
            var ypos = (map((int(data[emplacements[i]])), 0, int(db[0]["Max_Tous"]), this.innerRadius, this.innerRadius + this.maxRadius)) * sin(map(i, 0, this.limit, this.anglePortion / 2, TWO_PI));
            this.targets[i].set(createVector(xpos, ypos));
            this.data[i] = (int(data[emplacements[i]]));
        }
    }
    this.updatePoints = function () {
        for (var i = 0; i < this.targets.length; i++) {
            var dy = (this.targets[i].y - this.positions[i].y) * 0.05
            var dx = (this.targets[i].x - this.positions[i].x) * 0.05
            this.positions[i].x = this.positions[i].x + dx
            this.positions[i].y = this.positions[i].y + dy
        }
    }
    this.draw = function () {
        push()
        beginShape();
        vertex(this.innerRadius, 0)
        strokeWeight(2)
        strokeCap(ROUND)
        this.positions.forEach((p) => {
            vertex(p.x, p.y);
        });
        endShape(CLOSE);
        pop()
    }
    this.drawOffscreen = function (c) {
        pg.push()
        pg.translate(width / 4, height / 2)
        pg.beginShape();
        pg.vertex(this.innerRadius, 0)
        pg.strokeWeight(3)
        pg.noFill();
        pg.stroke(c)
            // pg.strokeCap(ROUND)
        this.positions.forEach((p) => {
            vertex(p.x, p.y);
        });
        pg.endShape(CLOSE);
        pg.pop()
    }
    this.isOver = function (xpos, ypos, c) {
        push()
        textSize(18)
        for (var i = 0; i < this.positions.length; i++) {
            if (dist(xpos, ypos, this.positions[i].x, this.positions[i].y) < 7) {
                fill(c)
                var offsetX
                var offsetY
                if (this.positions[i].x < 0) offsetX = -pow(map(this.positions[i].x, 0, -width / 4, 2000, 500), 1 / 2)
                else offsetX = pow(map(this.positions[i].x, 0, width / 4, 2000, 500), 1 / 2)
                if (this.positions[i].y < 0) offsetY = -pow(map(this.positions[i].y, 0, -height / 2, 2000, 500), 1 / 2)
                else offsetY = pow(map(this.positions[i].y, 0, height / 2, 2000, 500), 1 / 2)
                ellipse(this.positions[i].x, this.positions[i].y, 10, 10)
                text(emplacements[i] + " : " + int(this.data[i]) + " prêts", this.positions[i].x + offsetX, this.positions[i].y + offsetY);
            }
        }
        pop()
    }
    this.drawInfo = function (data, lieu) {
        translate(-width / 3, 0)
        textAlign(LEFT, BOTTOM);
        textSize(24);
        if(lieu == lieux[5]){
            lieu = "Ludothèque"
        }
        else if(lieu == lieux[6]){
            lieu = "Gao-Xingjian"
        }
        text(lieu, 0, -12);
        textSize(18)
        if (data["top-emplacement"] !== "" && data["top-emplacement"] !== undefined) {
            textFont(fontRegular)
            text("dont " + data[data["top-emplacement"]] + " " + data["top-emplacement"], 0, 32);
            text(data["total"] + " prêts au total", 0, 14);
        }
    }
    this.drawLabel = function () {
        for (var i = 0; i < this.limit; i++) {
            var angle = map(i, 0, this.limit, this.anglePortion / 2, TWO_PI)
            var xpos = (this.innerRadius - 10) * cos(angle);
            var ypos = (this.innerRadius - 10) * sin(angle);
            push()
            fill(255)
            noStroke()
            textFont(fontRegular);
            textSize(16)
            textAlign(RIGHT, CENTER);
            translate(xpos, ypos)
            rotate(angle)
            text(emplacements[i], 0, 0)
            pop();
            //line(this.innerRadius*cos(angle),this.innerRadius*sin(angle),this.maxRadius*cos(angle), this.maxRadius*sin(angle))
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

function Legend() {
    this.over = false;

    this.draw = function () {
        if (this.over) {
            noStroke()
            fill(0,180)
            rect(0, 0, windowWidth, windowHeight)
            textSize(16);
            fill(255)
            textAlign(LEFT, TOP)
            text("La taille de la barre des 'L' dépend de la quantité de documents sortis pour la journée sélectionnée", 68, 166)
            drawArrow(70, 150, -HALF_PI, 60)

            var xoffset = map(slider.value(), 1, nDays, windowWidth / 4, windowWidth * 3 / 4);
            text("Déplacez ce curseur pour changer la date manuellement", xoffset, windowHeight - 135)
            drawArrow(xoffset + 4, windowHeight - 116, HALF_PI, 36), textAlign(CENTER, CENTER)
            textSize(18)
            text("Passer vôtre souris au dessus des arrêtes de l'étoile pour obtenir des données par type d'ouvrage", width / 2, height / 4)

        }
        push()
        translate(windowWidth - 40, 40)
        fill(255)
        noStroke()
        ellipse(0, 0, 40, 40)
        textAlign(CENTER, CENTER);
        fill(0)
        textSize(26)
        textFont(fontRegular)
        text("?", 0, 0)
        pop()
    }
    this.isOver = function (xpos, ypos) {
        if (dist(xpos, ypos, windowWidth - 25, 25) < 25) this.over = true;
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

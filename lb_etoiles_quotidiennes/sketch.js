
// on peut optimiser en rendant la légende dans une texture et l'afficher, il faut recalculer l'image au resize par contre.
// ajouter un over sur la souris pour entourer un vertex et afficher sa valeur => stocker les data temporairement dans chaque objet pour accéder plus facilement au valeurs
// ajouter gui date de départ, date de fin, play / pause / stop , filtrage par lieux , par catégories documentaire ? vitesse de défilement des dates, durée d'interpolation vis et audio
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
var play = true
var colors
var fontBold
var fontRegular
var stars = [];

function preload() {
    db = loadJSON("../data/db_06122017.json");
    fontBold = loadFont("../assets/RenneBolArcTyp.otf")
    fontRegular = loadFont("../assets/RenneArcTyp.otf")

}

function setup() {
    createCanvas(windowWidth, windowHeight);
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
        stars.push(new Star(width / 6, width / 3, colors[colorNames[i - 1]]))
    }
    stars.forEach(s => {
        s.initArrays()
    })
}


function draw() {
    background(0);
    // superposition d'étoiles
    push()
    translate(width / 4, height / 2)
    for (var i = 0; i < stars.length; i++) {
        noFill();
        stroke(colors[colorNames[i]])
        stars[i].updatePoints();
        stars[i].draw();
        stars[i].drawLabel();
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
    // se déplacer d'un jour dans la base de données
    if (frameCount % 60 == 0 && play) {
        index += 1;
        for (var i = 0; i < stars.length; i++) {
            stars[i].updateTargets(db[index][lieux[i + 1]], lieux[i + 1])
        }
    }

        // afficher la date
    fill(255);
    stroke(255);
    var d = db[index].date.split("/")
    var date = new Date(d[2], d[0] - 1, d[1])
    textSize(36)
    text(jours[date.getDay()] + " " + date.getDate() + " " + mois[date.getMonth()] + " " + date.getFullYear(), width / 2, 20);
    textSize(24)
    text(db[index].Tous.total + " prêts", width / 2, 60);
}

function mousePressed() {
    play = !play
}

function Star(innerR, outterR) {
    this.innerRadius = innerR;
    this.maxRadius = outterR;
    console.log(this.innerRadius, this.maxRadius);
    this.limit = emplacements.length;
    this.anglePortion = TWO_PI / this.limit;
    this.positions = []
    this.targets = []
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
        }
    }
    this.updateTargets = function (data, lieu) {
        for (var i = 0; i < this.targets.length; i += 1) {
            var xpos = (map((int(data[emplacements[i]])), 0, int(db[0]["Max_Tous"]), this.innerRadius, this.innerRadius + this.maxRadius)) * cos(map(i, 0, this.limit, this.anglePortion / 2, TWO_PI));
            var ypos = (map((int(data[emplacements[i]])), 0, int(db[0]["Max_Tous"]), this.innerRadius, this.innerRadius + this.maxRadius)) * sin(map(i, 0, this.limit, this.anglePortion / 2, TWO_PI));
            this.targets[i].set(createVector(xpos, ypos));
        }
    }
    this.updatePoints = function () {
        for (var i = 0; i < this.targets.length; i++) {
            var dx = (this.targets[i].x - this.positions[i].x) * 0.5
            var dy = (this.targets[i].y - this.positions[i].y) * 0.5
            this.positions[i].x = this.positions[i].x + dx
            this.positions[i].y = this.positions[i].y + dy
        }
    }
    this.draw = function () {
        push()
        beginShape();
        vertex(this.innerRadius, 0)
        this.positions.forEach((p) => {
            vertex(p.x, p.y);
            //ellipse(p.x,p.y,10,10)
        });
        endShape(CLOSE);
        pop()
    }
    this.drawInfo = function (data, lieu) {
        translate(-width / 3, 0)
        textAlign(LEFT, BOTTOM);
        textSize(24);
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
            textSize(18)
            textAlign(RIGHT, CENTER);
            translate(xpos, ypos)
            rotate(angle)
            text(emplacements[i], 0, 0)
            pop();
            //line(this.innerRadius*cos(angle),this.innerRadius*sin(angle),this.maxRadius*cos(angle), this.maxRadius*sin(angle))
        }
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

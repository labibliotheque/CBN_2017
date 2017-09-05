
// Le L__A est un peu décentré sur la droite.
// ramener les étoiles de prêt dans ce programme et afficher des légendes en overs sur toutes les piques ?
// Les seuls contôles sont les overs, un slider pour se déplacer et un play pause
// donner moins d'importance à la date graphiquement.


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
]

var arts = ["arts"
            ,"cinema adultes"
            ,"cinema jeunesse"
            ,"graphisme"
            ,"danse"
            ,"musique adultes"
            ,"musique jeunesse"
            ,"theatre"
            ,"albums"
            ,"bd adultes"
            ,"bd jeunesse"
            ,"littérature"
            ,"romans adultes"
            ,"romans jeunesse"]

var savoirs = [
    "geographie"
 	,"histoire"
 	,"informatique"
 	,"langues"
 	,"livres sur les jeux"
 	,"loisirs creatifs"
 	,"philosophie"
 	,"psychologie"
 	,"sciences"
	,"fonds pro"]

var loisirs = [
    "presse"
 	,"societe"
 	,"sports et loisirs"
 	,"vie pratique"
 	,"Jeux"
 	,"jeux d'assemblage"
 	,"jeux d'exercices"
 	,"jeux a regles"
 	,"jeux symboliques"
	,"jeux video"]

var xsize = 300
var ysize = 40
var scribble = new Scribble();


var db
var index = 1
var fontBold
var fontRegular
var play = true

var logos = [];

function preload() {
    db = loadJSON("../data/db_06122017.json");
    fontBold = loadFont("../assets/RenneBolArcTyp.otf")
    fontRegular = loadFont("../assets/RenneArcTyp.otf")
}

function setup() {
    createCanvas(windowWidth, windowHeight)
    background(255,0,0,1)
    randomSeed(3141);

    for (var i = 0 ; i < lieux.length; i++){
        logos.push(new Logo(lieux[i],0.5))
        logos[i].setType(4)
    }

    // calculate some font metrics
    name = "BIBLIOTHEQUE"
    nameWidth = textWidth(name);
    character = "A"
    cWidth = textWidth("A")
    spacing = 3
    padding = cWidth + spacing


}



function draw() {
   background(255,50)



       // afficher la date
    push()
    textAlign(CENTER,CENTER)
    fill(0);
    stroke(0);
    var d = db[index].date.split("/")
    var date = new Date(d[2], d[0] - 1, d[1])
    textSize(36)
    text(jours[date.getDay()] + " " + date.getDate() + " " + mois[date.getMonth()] + " " + date.getFullYear(), width / 2, 20);
    textSize(24)
    //text(db[index].Tous.total + " prêts", width / 2, 60);
    pop()

    if (frameCount % 120 == 0 && play) {

        index += 1;
        for (var i = 0 ; i < lieux.length; i ++){
            var total = int(db[index][lieux[i]].total)
            var type = (db[index][lieux[i]]["top-emplacement"])

            var l = map(total,0,db[0]["Max_Total"],25,500)
            var t =4

            if (type == ""){
                t = 4
            }
            else if(savoirs.indexOf(type) !=-1) {
               t = int(random(2)) + 5
                console.log("savoirs")
            }
            else if (arts.indexOf(type) != -1){
                t = int(random(2)) + 2
                console.log("arts")
            }
            else if (loisirs.indexOf(type) != -1){
                t = int(random(2))
                console.log("loisirs")
            }
             console.log(lieux[i],type)

            logos[i].setType(t)
            logos[i].setLength(l)
        }


    }

    var val = abs(pow(sin(map(frameCount%120,0,120,PI/2,PI)),6))*10;

   scribble.bowing = val/5;          // changes the bowing of lines
    scribble.roughness = val;       // changes the roughness of lines
    //scribble.maxOffset = yourValue;       // coordinates will get an offset, here you define the max offset
    //scribble.numEllipseSteps = yourValue; // defines how much curves will be used to draw an ellipse

    for (var i = 0 ; i < logos.length; i++){
        var x = (i % 3) * windowWidth/3 + windowWidth/6
        var y = int(i/3)*windowHeight/3 + windowHeight/3
        push()
        translate(x,y)
        logos[i].display()
        pop()
    }



}

function mousePressed() {
    play = !play
    /*
    for (var i = 0 ; i < logos.length; i++){
        logos[i].setType(int(random(7)))
        logos[i].setLength(random(25, 250))

    }*/
}

function windowResized(){
    resizeCanvas(windowWidth,windowHeight)

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
        //removeShadows()
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
        text(character, this.l / 2 - padding / 2 + spacing, -48)
        rect(this.l / 2 + padding + spacing + cWidth * 2 + spacing, -36, 10, -3)
        textAlign(CENTER, CENTER);
        text(name, 0, 0)
        textSize(36)
        text(this.lieu, 0, 52)
       // setShadows()
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


var back = 180
function setShadows(){
    back = -pow(map(frameCount%120,0,120,-1.1,1.1),25) + 255
    drawingContext.shadowOffsetX = map(frameCount%240,0,239,-25,25);
    drawingContext.shadowOffsetY =  pow(map(frameCount%240,0,239,-4,4),2) + 7;
    drawingContext.shadowBlur = 2;
    drawingContext.shadowColor = "black";
}

function removeShadows(){

    drawingContext.shadowOffsetX = 0;
    drawingContext.shadowOffsetY = 0;
    drawingContext.shadowBlur = 0;
    drawingContext.shadowColor = "black";
}
